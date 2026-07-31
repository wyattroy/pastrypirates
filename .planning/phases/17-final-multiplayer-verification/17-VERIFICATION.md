---
phase: 17-final-multiplayer-verification
verified: 2026-07-31
status: human_needed
score: automated coverage complete; the phase's own success criteria are human-only
requirements: [VERIFY-01]
---

# Phase 17 — Final Multiplayer Verification

**Status is `human_needed`, and that is not a shortfall — it is what this phase is.** All three of
its success criteria name Safari, two windows, and a human watching. None of them can be closed by a
machine, and I have not marked any of them closed.

What follows separates what I *did* verify overnight from what is still yours, so you are not asked
to re-check things that are already settled.

## Closed — automated

| Check | Result |
|---|---|
| Full gate suite (`npm test`) | **exit 0**, 18 gate scripts, 23/23 assertion groups |
| Determinism corpus | **31/31 seeds** |
| `src/engine/index.js` vs `9ddd214` | **empty diff** — still byte-identical, no re-record needed |
| Host/guest parity gate | 3/3 — one sail-highlight builder, one rim stepper, 7/7 class vocabulary |

## Closed — Chrome, verified in a live browser by me

These were done against a fresh, never-loaded port (8370) so no stale ES module could produce a
false result — the trap that manufactured two phantom bugs during Phase 15.

| # | What | Evidence |
|---|---|---|
| 1 | Page boots, solo game starts and plays | drove a real game through recipe draft, sailing, docking, fishing, side bets |
| 2 | **UI-05 host flow** | one click on Host a Crew → room `BWUE` created in real Firebase, `isHost:true`, seat 0, lobby rendered, `#stepHost` never shown, zero alerts. Test room deleted afterwards. |
| 3 | **UI-06 name doubling** | seat list read `ClaudeHost — you`, then three named bots. No `X — X`. |
| 4 | **UI-01 spacing** | computed: grid gap 14px, layout padding 14px, `#actionPanel` margin `0px auto`, footer padding `0px 14px 18px` |
| 5 | **UI-02 icon hold** | `popfloat` keyframes measured live: opacity 1 from 18% to 58% of 2.5s = arrival + exactly 1000ms |
| 6 | **UI-03 highlight size** | measured: cell 42.67px, old side 38.67px, new side **34.8px** — exactly 0.9× |
| 7 | **UI-04 hover** | screenshotted; white outline + two-stage glow clearly distinguishes the hovered square |
| 8 | **KOFI-01** | footer button right of Feedback with the correct URL; Credits widget mounts (2638 chars, correct link) **and the page survives** — the specific thing `draw()` would have destroyed |
| 9 | **META-01/02** | live: `og-image.jpg` 200 and 1200×663 matching its declared meta; `favicon.png`/`.ico` both 200 |

## NOT closed — yours, and none of it can be delegated

### 1. Safari, two windows, no clock-stall workaround *(criterion 1)*
I have no Safari automation here. This is the milestone's headline fix and its confirmation is the
whole reason this phase exists.

### 2. A full two-window game, start to end-of-voyage, across Safari and Chrome *(criterion 2)*
I hosted a real room and rendered its lobby, but never played a second seat through to the end.

### 3. Storm movement and pause/resume observed live *(criterion 3)*
Not observed in a networked game. The engine is unchanged and the gates are green, which is evidence
about the code, not about what a storm looks like on two screens at once.

### 4. UI-07 was gated, not watched
The end-of-voyage panel collapse is pinned by `ui_contract_check` assertion 9, red-proofed against
the real pre-change file. **I never saw it on screen.** Two autoplay attempts failed to reach an
end-of-voyage — random play reached 1 of 5 ingredients in 256 moves — and the attempt that shortcut
the route wedged the turn loop, which was my own doing, not a product fault. Worth one look when you
next finish a game, since it is also the change that touches your F6 rule.

### 5. The two D-41 greyed states, still never eyeballed
Carried from Phase 15. `— coins only —` and the hail Counter-offer remain unseen.

## Found while verifying — recorded, not fixed

`.planning/todos/pending/host-enabled-without-firebase-after-solo-resume.md`

`boot()` resumes an in-progress solo game and returns **before** `fbInit()`, so `appState.db` is null
while Host and Join stay enabled and `#fbnote` never appears. Clicking Host then fires the capacity
alert — *"the server's got too many pirates baking right now"* — which is untrue and is the same
sentence a genuine capacity failure uses, making the two indistinguishable. **Pre-existing**; UI-05
shortens the path to it from two clicks to one. Left for you because the honest fix has a copy half.

This is also why it first looked like a frozen tab: a native `alert()` blocks the renderer.

## How to pick this up

```bash
python3 -m http.server 8371
```

Use a **fresh, never-loaded port** — 8370 and everything below it have served this worktree tonight
and Chrome caches ES modules per URL. Two windows share `localStorage`, so the guest seat needs a
separate profile or an incognito window, or both tabs collide on one `pp_id`.
