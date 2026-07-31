---
created: 2026-07-31T15:47:23.950Z
title: Solo play should show a disabled turn-clock button for consistency
area: ui
severity: minor
files:
  - src/ui/panel.js (setClockUI)
  - src/ui/board.js (clock control render)
---

## Problem

**Correction, 2026-07-31: solo DOES have the clock.** An earlier version of this file claimed the
whole control was missing in solo. It is not. `#shotClockPanel` renders in every mode, and the
pause/resume button is explicitly shown in solo — `src/ui/panel.js` carries a comment recording that
it was deliberately un-gated from a host-only check so *"the ▶/⏸ pause is now shown to every player
in both solo and multiplayer."*

What solo is missing is **only the timer on/off toggle** (`#scTimerToggle`), hidden by:

```js
toggleEl.style.display=(!soloBotGame()&&!appState.liveDone)?"":"none";
```

That is exactly what Wyatt asked for — *"a **disabled turn clock button** in solo play mode as
well"* — the **button**, not the clock. The consistency gap is one control, not the whole panel.

## Superseded — read N-03/N-04 instead

**This requirement under-delivers Wyatt's own later decision.** On 2026-07-27 (D-01) he ruled that
**every mode must be able to actually turn the clock off**, not merely display an inert control:

> *"I do want to keep it on by default; we just need to make it really easy (and bug-free) to turn
> off."* — plus explicit full parity: pause/unpause **and** disable/re-enable across solo,
> pass-and-play and multiplayer.

`.planning/research/v1.3-intake/NEW-SCOPE.md` carries that as **N-03** (the disable actually works,
via a local non-Firebase path) and **N-04** (parity across all three modes). **Build those. Do not
build a greyed-out button that does nothing** — that is the opposite of what he asked for.

Related and confirmed: the existing toggle is **broken in pass-and-play**, not merely absent —
`watchTimer()` (`src/orchestrator.js:199-217`) drives it from a Firebase `timerOff` node, and
pass-and-play has no Firebase connection at all, so the control silently no-ops there.

## Solution

Show `#scTimerToggle` in solo and give it a working local code path — i.e. **N-03 + N-04**, not a
greyed placeholder.

Notes for planning:

- **AUDIO-02 is NOT blocked by this.** It places the mute button *"to the right of the turn clock"*,
  and the clock panel already renders in solo — so the anchor exists today and the sound work can
  proceed independently of this item. *(An earlier note here claimed the opposite; it was wrong.)*
- The toggle must not arm or write any shot-clock state it should not. Whatever local path replaces
  the Firebase-watching one has to leave solo's timing behaviour intact.
- If any state genuinely stays unavailable in a given mode, the **D-41 pattern** applies — a greyed
  control gets a short reason beneath it saying why, rather than silently doing nothing. That is a
  fallback for real dead-ends, not the plan for this item.

**Source:** Wyatt, 2026-07-31 punch list.
