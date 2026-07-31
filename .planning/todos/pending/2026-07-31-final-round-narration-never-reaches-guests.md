---
created: 2026-07-31T17:40:00.000Z
title: The "fired up the ovens / one final turn each" narration only appears for the host
area: multiplayer
severity: major
files:
  - src/orchestrator.js:840 (netIntroBarrier — the final-round announcement)
  - src/ui/flow.js:1156 (flash — "Firing up the ovens on the Isle of Tortuga!")
  - src/orchestrator.js:286 (netNarrate) / :289 (netBroadcast)
  - src/ui/flow.js:1437-1458 (netIntroBarrier)
---

## Problem

Wyatt, v1.2 Phase 17 playtest (2026-07-31): **the "firing up the ovens of Tortuga — one more turn
each" narration only appears for hosts, not guests.**

Guests miss the single most important state change in the game: **that the final round has started
and they have exactly one turn left.** A guest plays their last turn without knowing it is their
last. That is a fairness problem, not just a missing line.

## Two candidate sources — Wyatt's phrasing spans both

His wording combines text from two different call sites, so **establish which one he saw before
fixing anything**:

1. **`src/orchestrator.js:840`** — the final-round barrier, and the better match for "one more turn
   each":
   ```js
   await netIntroBarrier(`🏁 ${pn(i)} returned to Tortuga and fired up the bakery! Every captain gets ONE final turn to race home! ⛵`,"🦜 Final round — set sail!");
   ```
2. **`src/ui/flow.js:1156`** — the bakery action, the better match for "firing up the ovens":
   ```js
   if(v==="bakery"){await flash("🧁 Firing up the ovens on the Isle of Tortuga!",1200);return;}
   ```

## The structural fact behind it — confirmed

**Every broadcast path is gated on being the host.** Both narration functions end the same way:

```js
// src/orchestrator.js:286
export function netNarrate(html,variants){ … showNarration(…); if(appState.isHost&&appState.db&&appState.room)netSetNarr(…); }
// src/orchestrator.js:289
export function netBroadcast(html,variants){ … if(appState.isHost&&appState.db&&appState.room)netSetNarr(…); }
```

The two differ in exactly one way, and it is the relevant way:

| | shows on the local screen | writes to Firebase |
|---|---|---|
| `netNarrate` (used by `flash`) | **yes, always** | only if host |
| `netBroadcast` (used by `netIntroBarrier`) | **no** | only if host |

So `netBroadcast` is **purely** a host-to-guests push — it deliberately does not touch the local
panel (its comment: *"broadcast narration to spectators WITHOUT touching this screen's panel"*).
`netIntroBarrier` then relies on the per-human prompt underneath it to put the message on screen:
`localAsk` for a local seat, `onRemoteDraftPrompt` for a remote one (`src/ui/flow.js:1455-1457`).

**That split is where to look.** The host's own seat gets the text from `localAsk`. A guest's copy has
to arrive through either the Firebase narration write or `onRemoteDraftPrompt` — and one of those two
is not landing. A plausible shape: the Firebase narration value is written and then immediately
overwritten by whatever the guest's client renders next, so the line is replaced before it can be
read.

**This is a hypothesis, not a diagnosis. Reproduce it first** — two windows, drive one ship home, and
watch what the guest's narration element actually receives (and when it changes). Do not fix from the
reading above alone.

## Check the same class of bug elsewhere while you are in here

The host-only gate is structural, so **any narration originating on a guest's client never reaches
anyone**. Once the mechanism is confirmed, sweep the other `flash()` / `netBroadcast` sites for the
same hole rather than fixing this one line — `src/ui/flow.js:243`, `src/ui/util.js:1142` and the
other `onBroadcast` callers are the same shape.

## Gates

- **`npm test` gate 17 is the host/guest parity check** — see whether it covers narration reaching
  guests at all. If it does not, this bug is exactly what it should have caught, and extending it is
  part of the fix.
- The final-round announcement is Wyatt-approved copy applied verbatim (NARR-01/D-25, `@copy
  misc.introbarrier.finalround`). **The wording is not at issue — do not touch it.** Only its
  delivery.
- `netIntroBarrier` self-skips during host-refresh replay (`if(appState.replaying)return;`) and the
  surrounding comment notes this is deliberate for determinism. Any fix must preserve that.

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest.
