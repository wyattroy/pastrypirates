---
phase: 14-engine-adjacent-gameplay-fixes-determinism
plan: 05
subsystem: ui
tags: [storm, narration, bot-ai, pacing, ui]

requires:
  - phase: 14-engine-adjacent-gameplay-fixes-determinism
    provides: "14-03's Game.mooredReason(p) and every windPush moored event's reason field; 14-02's bot hail restructure which shares src/ui/flow.js with this plan"
provides:
  - "windLeg (human storm push) renders every ordinary-water square before the next square's outcome can narrate (STORM_STEP_MS), and folds the standalone isHome(nx) early return into mooredReason(p) — fixing the D-22 'false dock held fast' render-ordering symptom"
  - "botWindLeg(p,dirKey,dist,dodgedOnce,wasDocked) — a new src/ui/flow.js export delegating each square to windPush(p,d,1,dodgedOnce), narrating EVERY event a square records (not just the last), with no flip animation, at a separate bot-only pace"
  - "botTurn's storm block runs two narrating botWindLeg legs (mirroring humanWind's two-leg shape) instead of two silent direct engine pushes with no intermediate render"
  - "src/ui/util.js: STORM_STEP_MS=320, BOT_STORM_STEP_MS=170, BOT_MSG_HOLD_MULTIPLIER=0.5, botMsgHoldMs(text) — a separate, shorter narration-hold curve for bots (900-2600ms pre-multiplier) than the human msgHoldMs (1200-7000ms)"
  - "src/ui/panel.js flash(msg,ms,holdMs) — additive third parameter; a numeric holdMs overrides the default msgHoldMs(text) hold, used by botWindLeg for bot-paced narration"
  - "EVENT_NARRATION.moored branches on e.reason (justDocked/dock/home) into three distinct DRAFT lines, same {txt,pops} shape, same ⚓ pop, sane fallback for a reasonless (pre-change replay) event"
  - "scripts/bot_storm_narration_test.js — DOM-free proof that windPush(p,d,2,once) and two successive windPush(p,d,1,once) calls sharing one `once` object are indistinguishable (identical final position, identical event stream) across a scripted battery, plus moored-reason and EVENT_NARRATION coverage"
affects: [14-06]

tech-stack:
  added: []
  patterns:
    - "Per-square engine delegation with an external stopping predicate (event added -> stop; moved-but-onRim -> stop; neither -> blocked, stop silently; else continue) as the DOM-free proxy for a UI-tier per-square 'leg' function — proven equivalent to a single multi-square engine call by scripts/bot_storm_narration_test.js's twoStepPush() harness"
    - "A separate, shorter bot-only narration-hold formula (same shape, lower floor/ceiling, smaller multiplier) rather than a scaled copy of the human one, plus an additive third parameter on flash() so one implementation serves both paces"

key-files:
  created:
    - scripts/bot_storm_narration_test.js
  modified:
    - src/ui/flow.js
    - src/ui/util.js
    - src/ui/panel.js

key-decisions:
  - "Front-loaded all four pacing constants' util.js placement across Task 1 (STORM_STEP_MS only, since windLeg needed it immediately) and Task 2 (the remaining three), per the plan's own explicit allowance that Task 2's constant additions are independent and may land earlier — not a deviation from the plan's intent, just a different task-boundary split of the same additions"
  - "botWindLeg narrates every event from evBefore to g.events.length-1 via describe()+flash(txt,null,botMsgHoldMs(txt)) rather than reusing narrateCurrent()'s single-event appState.evIdx pointer — that pointer is exactly the mechanism D-11 was filed against (it silently narrates only the LAST event of a multi-event bot turn)"
  - "botTurn's mid-storm 'now it turns X' announcement is bot-paced (botMsgHoldMs via flash's new holdMs override) rather than reusing humanWind's plain flash(...,900) call, keeping the same asymmetry D-10 asks for everywhere in the bot's storm turn, not just at the per-square events"
  - "The three moored lines and the refused-hail line (14-02) are explicitly DRAFT copy per D-14/D-27 — flagged below for 14-06's approval checkpoint, not treated as final"

patterns-established:
  - "botWindLeg's per-square delegation-with-external-stop shape as the template for any future UI-tier function that needs to visibly narrate an engine loop the engine itself only exposes as a single multi-step call"

requirements-completed: [STORM-01]

coverage:
  - id: D1
    description: "windLeg (human storm push) renders every ordinary-water square (liveRender + STORM_STEP_MS sleep) before the next square's outcome can narrate, and folds the standalone isHome(nx) early return into mooredReason(p) so the narrated cause matches windPush's own precedence chain"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "node -e structural probe (no standalone isHome early-return, mooredReason( call present, no bare moored event, p.pos=nx;liveRender();await sleep(STORM_STEP_MS); sequence present) — plan Task 1 <verify>"
        status: pass
      - kind: integration
        ref: "node scripts/module_graph_check.js && node scripts/ui_contract_check.js && node scripts/no_undef_check.js && npm test"
        status: pass
    human_judgment: false
  - id: D2
    description: "botWindLeg delegates each square to windPush(p,DIRS[dirKey],1,dodgedOnce), narrates EVERY event a square records (not just the last), shows no flip animation, and stops on an event, a blocked no-move square, or the rim; botTurn runs exactly two narrating legs with no direct engine push remaining"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "node -e structural probe (windPush(p,DIRS[dirKey],1,dodgedOnce) delegation, for(let k=evBefore... narration loop, botMsgHoldMs( usage, no humanFlip reference, onRim( stop, botTurn has zero g.windPush( calls and exactly two botWindLeg( calls) — plan Task 2 <verify>"
        status: pass
      - kind: unit
        ref: "node -e pacing probe (botMsgHoldMs measurably smaller than msgHoldMs for the same text, still >=400ms) and flash hold-override probe (flash(msg,ms,holdMs) signature, typeof holdMs===\"number\" branch) — plan Task 2 <verify>"
        status: pass
      - kind: integration
        ref: "node scripts/module_graph_check.js && node scripts/ui_contract_check.js && node scripts/no_undef_check.js && npm test"
        status: pass
    human_judgment: false
  - id: D3
    description: "EVENT_NARRATION.moored renders three distinct lines keyed on e.reason (justDocked/dock/home), same {txt,pops} shape and ⚓ pop, sane fallback for a reasonless event; scripts/bot_storm_narration_test.js proves windPush(p,d,2,once) and two successive windPush(p,d,1,once) calls sharing one `once` object are indistinguishable across a scripted battery (open water, island ahead, another ship ahead, home ahead, an off-grid edge, a second leg sharing dodgedOnce after a first-leg dodge)"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "node scripts/bot_storm_narration_test.js (31/31 checks: equivalence across all six scenarios, exactly-one-event-per-square, moored-reason validity, three distinct moored lines + fallback)"
        status: pass
      - kind: unit
        ref: "node -e probe (three moored reasons render three distinct txt values; a reasonless event renders a real, non-undefined line) — plan Task 3 <verify>"
        status: pass
      - kind: integration
        ref: "node scripts/module_graph_check.js && node scripts/ui_contract_check.js && node scripts/no_undef_check.js && npm test"
        status: pass
    human_judgment: false
  - id: D4
    description: "The three new moored lines are DRAFT copy pending Wyatt's 14-06 approval (D-14/D-27) — reads correctly to Claude but has not been read/approved by the game's author"
    verification: []
    human_judgment: true
    rationale: "Storm/narration copy is authored/approved by Wyatt per established project precedent (PROJECT.md: 'Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated'); this is a subjective creative-approval gate, not something a passing test can certify."

duration: 45min
completed: 2026-07-26
status: complete
---

# Phase 14 Plan 5: Storm Movement Reads Correctly — Per-Square Render, Bot Narration, Honest Moored Lines Summary

**Both storm paths now step one square at a time with the board caught up before the next outcome narrates; bots narrate every storm event (not just the last) at their own snappier pace with no flip animation; and the "dock held fast" line finally names which of three different things actually happened.**

## Performance

- **Duration:** ~45 min
- **Completed:** 2026-07-26
- **Tasks:** 3/3
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- **Human path (D-19/D-21/D-22) fixed:** `windLeg`'s standalone `isHome(nx)` early return is folded into the ordinary land branch (`isIsland(nx)||isHome(nx)`), and the cause is now read from the engine's own `mooredReason(p)` accessor rather than a bare boolean — the narrated cause can never drift from `windPush`'s own precedence chain. Every ordinary open-water square now does `liveRender();await sleep(STORM_STEP_MS);` before the next square's outcome can narrate — this is the actual D-22 fix: the reported "false dock held fast" symptom was the board being a square behind when the message played, not a wrong message. The `anchorHold`/interactive `ask()`/`humanFlip`/aground-shipwreck branches and `humanWind` are byte-unchanged.
- **Bot path (D-09/D-10/D-11) built:** new export `botWindLeg(p,dirKey,dist,dodgedOnce,wasDocked)` delegates each square to `windPush(p,DIRS[dirKey],1,dodgedOnce)` — never re-deriving the island-outcome ladder, so bots and humans can never silently drift apart on the rule itself. It narrates **every** event a square records (looping `evBefore` to the end of `g.events`), which is the direct fix for D-11: `botBeat()`/`narrateCurrent()` only ever narrate the single `appState.evIdx` pointer, which is exactly why bot storm outcomes (paid anchor, coin-flip result, blocked, anchor-hold) had been disappearing behind the last event of a multi-event push. No flip animation is shown — `windPush` already calls `g.flip(p)` directly and records the result; narrating that event states the outcome. `botTurn`'s storm block now runs two narrating `botWindLeg` legs (mirroring `humanWind`'s own two-leg shape, with a bot-paced mid-storm direction announcement between them) instead of two silent direct engine pushes with no intermediate render, and no longer double-narrates its own summary since each leg emits its own.
- **Pacing surface (D-10):** `src/ui/util.js` gains four single named constants — `STORM_STEP_MS=320` (human per-square beat), `BOT_STORM_STEP_MS=170` (bot per-square beat), `BOT_MSG_HOLD_MULTIPLIER=0.5`, and `botMsgHoldMs(text)` (same base/per-char/pause shape as `msgHoldMs`, but clamped to a 900-2600ms floor/ceiling before the multiplier — a genuinely separate, shorter curve, not a scaled copy). `src/ui/panel.js`'s `flash(msg,ms,holdMs)` gained an additive third parameter: a numeric `holdMs` overrides the default `msgHoldMs(text)` hold, which is how `botWindLeg` gets its own pace without a second `flash()` implementation. Every existing two-argument `flash()` call site is unaffected.
- **Three honest moored lines (D-19/D-20/D-21):** `EVENT_NARRATION.moored` now branches on `e.reason` into three distinct lines (same `{txt,pops}` shape, same `⚓` pop, no new `EVENT_NARRATION` key), with a sane fallback for a reasonless (pre-change replay) event instead of rendering `undefined`. D-20's mechanics (a ship blown *onto* a dock is still sheltered by it on the next square of the same gust) are completely unchanged — this is wording only.
- **`scripts/bot_storm_narration_test.js` written (31/31 checks):** proves the load-bearing invariant `botWindLeg` depends on — that `windPush(p,d,2,once)` and two successive `windPush(p,d,1,once)` calls sharing one `once` object are indistinguishable (identical final position, identical event stream) — across a scripted battery: open water ahead, an island ahead (the pay/flip/aground decision ladder), another ship ahead (blocked), home ahead (an immediate berth-toward-Tortuga stop), an off-grid edge (the no-op stays a no-op), and a second leg sharing `dodgedOnce` after a first-leg dodge (the free-pass `anchorHold`, not a repeat flip). Also proves every `moored` event carries a valid `reason` and that `EVENT_NARRATION.moored` renders three distinct lines plus a working fallback. DOM-free by design — does not import `src/ui/flow.js` or reference `document`.
- Confirmed determinism stays untouched by this UI-tier-only plan: `npm test`'s determinism gate is **31/31 green** after every task (re-recorded by 14-04 before this plan started); no `src/engine/index.js` changes were made.

## Task Commits

Each task was committed atomically:

1. **Task 1: The human push shows the boat arrive before it says what happened (STORM-01 criterion 2, D-19, D-21, D-22)** - `bd2719e` (feat)
2. **Task 2: Bots ride the storm in the open, at a snappier beat (D-09, D-10, D-11)** - `a7c6233` (feat)
3. **Task 3: Three honest moored lines, and a test that per-square equals two-square (D-20, D-21, D-27)** - `de53c0b` (feat)

## Files Created/Modified

- `src/ui/flow.js` - `windLeg`: folds the standalone `isHome(nx)` early return into the land branch, calls `mooredReason(p)`, renders + sleeps `STORM_STEP_MS` on every ordinary water square. New export `botWindLeg(p,dirKey,dist,dodgedOnce,wasDocked)` delegating per-square to `windPush`, narrating every event, no flip animation. `botTurn`'s storm block replaced with two narrating `botWindLeg` legs plus a bot-paced mid-storm direction flash; drops its own duplicate summary emit/`botBeat()`.
- `src/ui/util.js` - Adds `STORM_STEP_MS`, `BOT_STORM_STEP_MS`, `BOT_MSG_HOLD_MULTIPLIER`, `botMsgHoldMs(text)` next to `msgHoldMs`. `EVENT_NARRATION.moored` branches on `e.reason` into three lines with a fallback.
- `src/ui/panel.js` - `flash(msg,ms,holdMs)` gains an additive third parameter honoring a numeric `holdMs` override.
- `scripts/bot_storm_narration_test.js` - New DOM-free test script (31 checks): the windPush(2)-vs-two-windPush(1) equivalence battery, moored-reason validity, and EVENT_NARRATION.moored coverage.

## Decisions Made

- Split the plan's four pacing constants across Task 1 (`STORM_STEP_MS` only — the one `windLeg` needed immediately) and Task 2 (the remaining three) rather than adding all four in Task 1, matching the task boundaries as closely as the plan's own text allows ("do Task 2's constant additions first if you prefer, they are independent of everything else here") while keeping each commit's diff scoped to what its own task actually needed.
- `botWindLeg`'s per-square stopping predicate (event added → stop; moved-but-onRim → stop; neither → blocked, stop silently; else continue) is a manual, DOM-free re-implementation of exactly what `windPush`'s own internal `dist`-square loop does per iteration — this is precisely the equivalence `scripts/bot_storm_narration_test.js`'s `twoStepPush()` harness proves, and it is the same shape `botWindLeg`'s real DOM-facing code uses.
- Used "she"/"her" for the ship in the two new dock/home moored lines (nautical convention, "she's a fierce one" already appears for the storm itself in this file) — a stylistic choice for Wyatt to accept or change at 14-06, not a load-bearing decision.

## Deviations from Plan

None — plan executed exactly as written. All three tasks matched their `<action>`/`<verify>`/`<acceptance_criteria>` blocks; no auto-fixes, no architectural questions, no scope changes. The only adjustment was the pacing-constant task-split described above, which the plan's own text explicitly permits.

## Issues Encountered

- First attempt at Task 1's per-square render inserted an explanatory comment between `p.pos=nx;` and `liveRender();`, which broke the plan's own structural verify regex (it requires the three statements contiguous, ignoring only whitespace). Fixed by moving the comment above `p.pos=nx;` instead — no behavior change, purely a verify-probe accuracy fix (same class of authoring correction 14-02's SUMMARY documented for its own structural probe).

## User Setup Required

None - no external service configuration required.

## Draft Copy Pending 14-06 Approval (D-14/D-27)

Per project precedent, storm narration copy is authored/approved by Wyatt, not auto-generated. The following are **DRAFT** — written to read correctly and stay within the bot pacing constant, but not yet reviewed:

**The three new `moored` lines** (`src/ui/util.js` `EVENT_NARRATION.moored`):

| Reason | Draft line |
|---|---|
| `justDocked` | "{captain} is still tied up from docking last turn — the storm can't drag a moored ship anywhere ⚓" |
| `dock` | "Lucky break! The gust shoves {captain} onto a dock, and the crew steadies her fast against it ⚓" |
| `home` | "{captain} rides it out safe at the Isle of Tortuga — the harbour holds her fast ⚓" |

(Fallback for a reasonless/pre-change replay event, unchanged: "The dock steadies {captain} from running aground ⚓")

**The four pacing constants** (`src/ui/util.js`), also worth surfacing at 14-06 since Wyatt may want to tune feel during UAT rather than approve copy:

| Constant | Value | Purpose |
|---|---|---|
| `STORM_STEP_MS` | 320ms | Human per-square storm-push beat |
| `BOT_STORM_STEP_MS` | 170ms | Bot per-square storm-push beat |
| `BOT_MSG_HOLD_MULTIPLIER` | 0.5 | Bot narration-hold multiplier (human is 0.8) |
| `botMsgHoldMs` floor/ceiling | 900ms / 2600ms | Bot narration-hold clamp before the multiplier (human is 1200ms / 7000ms) |

14-02's refused-hail closing clause (`EVENT_NARRATION.parley`, `kind==="hail"&&!e.ok`) remains queued from that plan for the same 14-06 approval pass — not re-drafted here.

## Next Phase Readiness

- STORM-01's functional behavior is complete on both paths: the boat steps one square at a time across the full push for humans and bots alike, no outcome message plays while the board is still a square behind, every storm outcome is surfaced for bots with no flip animation, and the moored message names which of three rules actually fired.
- `npm test` stays green (all nine gates, determinism 31/31) — this plan is UI-tier only and touched no `src/engine/` file.
- 14-06 is the copy-approval gate: present the three moored lines above, the four pacing constants, and 14-02's queued refused-hail clause to Wyatt for keep/punch-up/rewrite before the phase closes. No blockers.

---
*Phase: 14-engine-adjacent-gameplay-fixes-determinism*
*Completed: 2026-07-26*

## Self-Check: PASSED

- FOUND: src/ui/flow.js
- FOUND: src/ui/util.js
- FOUND: src/ui/panel.js
- FOUND: scripts/bot_storm_narration_test.js
- FOUND: .planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-05-SUMMARY.md
- FOUND: commit bd2719e (Task 1)
- FOUND: commit a7c6233 (Task 2)
- FOUND: commit de53c0b (Task 3)
- FOUND: commit d3cdb51 (SUMMARY.md)
