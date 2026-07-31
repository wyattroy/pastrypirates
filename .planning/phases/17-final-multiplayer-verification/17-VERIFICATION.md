---
phase: 17-final-multiplayer-verification
verified: 2026-07-31
status: passed
score: 3/3 success criteria closed — Safari+Chrome two-window game played to end of voyage 2026-07-31
requirements: [VERIFY-01]
---

# Phase 17 — Final Multiplayer Verification

**Status is `human_needed`, and that is not a shortfall — it is what this phase is.** All three of
its success criteria name Safari, two windows, and a human watching.

## CLOSED 2026-07-31 — all three criteria met

A two-window networked game was played end to end: **Wyatt hosting in Safari, Claude driving the
guest seat in Chrome**, same build on port 8430, room `KWPE`. Winner: Wyatttt with a Vanilla Bean
Crème Brûlée.

| Criterion | Result |
|---|---|
| 1. Safari, two windows, starts on its own with no clock-stall workaround | **PASS** — `gameStarted:true`, turn order `[3,0,1,2]` drawn and identical on both clients. CLOCK-01, the bug this milestone is named for, confirmed across two browsers |
| 2. Plays through from first turn to end of voyage across both windows | **PASS** — 171 events, finished on the host and rendered correctly on the guest |
| 3. Storm movement and pause/resume observed live | **PASS** — storm forced via `cfg.storm=1` on the host and confirmed consistent on both screens; pause, resume and timer-off all exercised, with `timerOff` propagating to the guest and `turnExpired` NOT stuck afterwards (BUG-02's exact failure mode) |

**Guest-side end of voyage, verified for the first time:** the End of Voyage panel rendered, the blue
narration box was hidden, the gold banner carried the win line, the recipe picture and the Best Baker
sentence, and all four award cards drew. UI-07 had only ever been checked on a host before this.

**One correction recorded rather than buried.** Lockstep was initially asserted by comparing
`game.players[].pos` across clients. That field is a render shell on a guest and goes stale — it read
`7,6 · 7,8 · 8,7 · 6,7` with 0 ingredients while the board actually rendered `4,10 · 11,5 · 5,11 ·
11,9` with 3,2,3,4. The results above rest on `turnOrder`, `timerOff`, `shotClockPaused`,
`turnExpired` and the event count, which ARE shared state on both sides. `docs/DRIVING-THE-GAME.md`
was corrected so nobody repeats the mistake.

---

**Safari pass: checks 1-5 of `17-SAFARI-CHECKLIST.md` all PASS.**
That retires every engine-divergence risk, including the two that mattered most: the pop animation
(a CSS variable inside an SVG transform, new risk I introduced that day) and the storm (BUG-01's
original Safari-only crash surface). Solo play, the storm, the Ko-Fi embed, the gold banner and the
full end-of-voyage sequence are all confirmed in WebKit.

**What remains is exactly one thing: the two-window networked game (check 6).** It is no longer a
rendering question — Safari renders this build correctly. It is whether two clients stay in step.

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
whole reason this phase exists. **Safari itself is now proven fine** (checks 1-5); what is unproven
is two clients in step.

### 2. A full two-window game, start to end-of-voyage, across Safari and Chrome *(criterion 2)*
I hosted a real room and rendered its lobby, but never played a second seat through to the end.

### 3. Storm movement and pause/resume observed live *(criterion 3)*
**Partially closed:** the storm was observed in Safari and behaved (checklist check 2) — so the
BUG-01 surface is clean. What is still unobserved is a storm and a pause/resume in a NETWORKED game,
on two screens at once.

### 4. UI-07 — CLOSED 2026-07-31, watched in a real finished game (Chrome)
A full solo game was driven to completion: **16 rounds, Dough Hook won with a Caramel Slice.** State
captured at the instant the summary appeared, not reconstructed afterwards:

| Checked | Result |
|---|---|
| Blue narration box | `display: none` — **hidden**, and its contents empty |
| Gold banner text | `Dough Hook wins!` + `Dough Hook baked a 📜 Caramel Slice and won Best Baker in the Caribbean!` |
| Recipe picture in the gold box | present |
| Best Baker sentence clipped? | no — measured against the banner's own bounds |

This is the item that mattered most, because the previous UI-07 implementation was **provably
inert**: `showStats()` hid the box and the very next `flash()` re-showed it, so assertion 9 passed
while the feature did nothing. It now genuinely holds in a real finish.

Earlier attempts failed for a reason now written down in `docs/DRIVING-THE-GAME.md`: the flippenator
coin `#flipCoinWrap` IS the flip button and is not an `.apBtn`, so every driver stalled waiting for a
coin toss nobody threw.

**Still not watched in Safari** — see `17-SAFARI-CHECKLIST.md` check 5.

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
