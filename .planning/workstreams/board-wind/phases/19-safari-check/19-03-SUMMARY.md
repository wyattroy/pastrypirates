---
phase: 19-safari-check
plan: 03
subsystem: ui
tags: [safari-perf, wind-dots, rAF, board-js, deterministic-rng, prototype]

# Dependency graph
requires:
  - phase: 19-01
    provides: "Wyatt's recorded go-ahead on the RNG-source door (D-11/D-12) and confirmed phone reachability of the branch build"
  - phase: 19-02
    provides: "scripts/wind_dot_contract_check.js, wired into npm test as the mechanical guard for this plan's region"
provides:
  - "A working, production-quality wind-dot tracer inside src/ui/board.js: seeded per-dot specs, pure per-dot motion math, a DOM dot layer, a single shared rAF loop, a touch HUD (switch/dial/readout), wired into render() via one appended call"
  - "Live browser proof (driven Chrome, real solo game, through an actual storm) that the enabled path shows moving dots, a live fps readout, and a wind-direction change that re-aims .wlayer without resetting dot positions"
  - "Live browser proof that a normal (?wind=1-free) build shows zero wind-dot DOM: no #windHud, no #windDots, no .wdot"
affects: [19-04, 19-05, 19-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "windDotSpecs/windDotFrame split into a pure seeded-spec half and a pure per-dot-math half, mirroring stormLayerSpecs()'s shape exactly"
    - "Direction lives OUTSIDE the animated portion: one live rotate() on .wlayer, dots move only in its local space — same as .rlayer, so a direction change never restarts per-dot motion"
    - "One shared requestAnimationFrame loop for all dots (never one per dot), throttled fps readout so measurement doesn't become part of what it measures"
    - "CDP (Chrome DevTools Protocol) driven via Node's built-in fetch + WebSocket, no new npm dependency, for full in-page browser verification when no MCP browser tool is available"

key-files:
  created: []
  modified:
    - src/ui/board.js
    - art-review/narration-inventory.json

key-decisions:
  - "Followed the plan's exact field order (startT, wobbleAmp, speed, lane) and salted seed (game seed XOR WIND_DOT_SEED_SALT) for windDotSpecs, matching stormLayerSpecs()'s precedent line-for-line"
  - "windDotCount/windDotsOn/windRafId etc. kept as module-scope `let`s per the plan's explicit state list, mirroring this file's existing render-owned-state convention"
  - "Verified Task 2 via a hand-written CDP driver (Node's built-in WebSocket + fetch talking to a dedicated, separately-profiled Chrome instance) rather than an MCP browser tool, since none was available in this execution session — see Deviations"

requirements-completed: []  # WIND-00 stays open until 19-06 completes Wyatt's Safari runs, per the workstream note

coverage:
  - id: D1
    description: "windDotSpecs/windDotFrame: pure, seeded, reproducible, seed-sensitive, count-clamped motion math"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "scripts/wind_dot_contract_check.js assertion 6 (pure-half math contract) — node scripts/wind_dot_contract_check.js"
        status: pass
      - kind: unit
        ref: "scripts/wind_dot_contract_check.js --drill (red-proof drill, all 6 assertions)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The whole region stays compositor-only (BUG-01), never draws from the game's own RNG stream (D-12), stays confined to src/ui/board.js (D-14), and ships off by default (D-08/D-10)"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "scripts/wind_dot_contract_check.js assertions 2/3/4/5"
        status: pass
      - kind: integration
        ref: "npm test (23/23 groups, includes determinism_baseline.js --verify and wind_dot_contract_check.js)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Enabled path (?wind=1): #windHud with all four controls, exactly 10 .wdot elements, dots visibly moving, live fps readout, a real mid-voyage wind-direction change re-aiming .wlayer's rotate() with no observed reset, switch toggling movement on/off"
    requirement: WIND-00
    verification:
      - kind: automated_ui
        ref: "CDP-driven Chrome, real solo game through round 5 (a live storm) — see .planning/workstreams/board-wind/phases/19-safari-check/19-03-wind-dots-enabled.png and the Task 2 section below for every observed value"
        status: pass
    human_judgment: false
  - id: D4
    description: "Normal build (no ?wind=1): zero wind-dot DOM — #windHud null, #windDots null, .wdot count 0"
    requirement: WIND-00
    verification:
      - kind: automated_ui
        ref: "CDP-driven Chrome, second port, no query string"
        status: pass
    human_judgment: false

# Metrics
duration: ~65min
completed: 2026-08-01
status: complete
---

# Phase 19 Plan 03: Wind-Dot Tracer Summary

**One dot path wired end-to-end in `src/ui/board.js` — seeded specs, a shared rAF loop, a touch HUD, and a live re-aim on wind-direction change — proven in a real driven-Chrome solo game (including through an actual storm) and proven absent from a normal build.**

## Performance

- **Duration:** ~65 min (includes ~5 minutes of real, driven gameplay to observe a genuine mid-voyage wind-direction change)
- **Completed:** 2026-08-01T05:11:00Z
- **Tasks:** 2 completed (Task 1: tracer implementation; Task 2: driven-Chrome verification)
- **Files modified:** 2 (`src/ui/board.js`, `art-review/narration-inventory.json`) + 1 screenshot added

## Accomplishments

- Implemented the full wind-dot tracer region in `src/ui/board.js`: `windDotSpecs`, `windDotFrame`, `buildWindDots`, `windEnsureLayer`, `windDotLoop`/`startWindDots`/`stopWindDots`, `buildWindHud`, `windSetDotCount`, `windDotsTick` — all between the byte-exact `WIND DOT PROTOTYPE (Phase 19 / WIND-00)` region markers, gated by `windPrototypeEnabled()` (`?wind=1` / `pp_wind_proto`), off by default.
- Wired the region into `render()` with exactly one appended statement (`windDotsTick(angle);`) inside the existing `if(spinNeedle&&e.wind)` block — nothing reordered, nothing removed.
- Extended the file header with a new Phase 19 / WIND-00 scoped-exception block, modeled line-for-line on the existing G19 block.
- `scripts/wind_dot_contract_check.js` (all 6 assertions) and its `--drill` red-proof mode both exit 0; `npm test` exits 0 (23/23 groups), zero `scripts/fixtures` changes, `src/engine/` byte-identical.
- Drove a real Chrome instance via a hand-rolled CDP client (Node's built-in `fetch`/`WebSocket`, no new dependency) through an actual solo game to round 5 (a live storm), observing every acceptance-criteria value directly rather than asserting from source.

## Task Commits

1. **Task 1: End-to-end "a dot drifts on the wind, and the page says how smooth it is"** — `0799a09` (feat)
2. **Task 2: Prove the slice end-to-end in driven Chrome** — no code commit (verification-only; the screenshot and this SUMMARY are captured in the plan-completion commit below, per the task's own `files_modified: none`)

**Plan metadata:** (this commit, following the SUMMARY)

## Files Created/Modified

- `src/ui/board.js` — the wind-dot prototype region (315 lines added) plus the one-line `render()` hook and the header's scoped-exception block
- `art-review/narration-inventory.json` — regenerated by `npm test`'s `extract_narration_lines.js` step; line-number-only diff (see Deviations)
- `.planning/workstreams/board-wind/phases/19-safari-check/19-03-wind-dots-enabled.png` — screenshot evidence for Task 2 (added, not modified)

## Decisions Made

- Field order and salting for `windDotSpecs` followed the plan's spec literally (`startT, wobbleAmp, speed, lane`; seed XOR `WIND_DOT_SEED_SALT`), matching `stormLayerSpecs()`'s established shape rather than inventing a new one.
- `WIND_PROTOTYPE_ENABLED_DEFAULT` was placed immediately before the `BEGIN` marker (outside the scanned region), matching `scripts/wind_dot_contract_check.js`'s own drill fixture convention — the guard's off-by-default assertion scans the whole file, not just the region, so this placement is a style choice for readability, not a requirement.
- Task 2's browser verification used a self-contained CDP (Chrome DevTools Protocol) driver written against Node's built-in `fetch` and `WebSocket` globals, talking to a dedicated, separately-profiled Chrome instance launched with `--remote-debugging-port`. No MCP browser-automation tool was available in this execution session, and no new npm dependency was installed (see Deviations for the full reasoning).

## Task 2 — Observed Values (driven Chrome, no "confirmed" claims)

All values below are the actual output of the CDP-driven runs, not restated from the plan.

### Enabled path (`?wind=1`, port 8935, fresh localStorage, real solo game)

| Assertion | Observed |
|---|---|
| `#windHud` exists, with `#windSwitch`/`#windDial`/`#windDialNum`/`#windReadout` all inside it | `true` |
| `#windDots .wlayer .wdot` count | `10` |
| Dot `transform` sampled twice ~320ms apart | `translate3d(407.582px, 261.562px, 0px)` → `translate3d(407.582px, 474.144px, 0px)` (changed) |
| `#windReadout` text, two samples ~620ms apart (this run) | `"60 fps"` → `"60 fps"` (unchanged this pair — see note) |
| `#windReadout` parses as a plausible whole-number fps | `true` (`60 fps`) |
| Wind direction before | `W` (`.wlayer` `rotate(450deg)`) |
| Wind direction after (5 real rounds later, into a live storm) | `N` (`.wlayer` `rotate(225deg)`) — `round: 5`, `waitedMsForWindChange: 280000` |
| `.wlayer` `rotate(...)` changed with the direction | `true` |
| Dots kept moving through the direction change (no reset) | `true` |
| `.wdot` count before vs. after the switch toggle | `10` → `10` (unchanged) |
| Transform frozen while `#windSwitch` is OFF (~320ms, two samples) | `true` |
| Transform resumed moving after toggling back ON | `true` |

**Note on the readout-changed sample:** this specific 620ms window happened to read `"60 fps"` both times (a stable frame rate, not a stutter). A separate 90-second run earlier in this session observed the readout genuinely changing (`"59 fps"` → `"60 fps"`), confirming the throttled update mechanism works — recorded here rather than silently re-running until a "nicer" sample appeared.

**Note on the wind-direction wait:** the live solo game happened to roll the SAME wind direction (`W`) for five consecutive rounds before rolling `N` at round 5 — a ~0.4% event for four independent 25%-each draws, confirmed as legitimate bad luck (not a determinism bug) by reading `noteWind()` in `src/engine/index.js`, which tracks streak length for narration only and does not influence the draw. `waitedMsForWindChange: 280000` (~4.7 real minutes) reflects this. Screenshot `19-03-wind-dots-enabled.png` was captured at this exact moment — Round 5, mid-storm, with the wind HUD and two visible fading dots on the board.

**Supplementary direct-invocation proof (same mechanism, isolated from game RNG timing):** to avoid the whole verification depending on a single, potentially-slow game roll, `windDotsTick(0)` then `windDotsTick(90)` were called directly via the page's live-imported `board.js` module (per `docs/DRIVING-THE-GAME.md` §6). `.wlayer` `rotate(...)` went `rotate(180deg)` → `rotate(270deg)` (changed), and dot transform samples ~350ms apart across the re-aim were `translate3d(420.453px, -13.1238px, 0px)` → `translate3d(420.453px, 175.026px, 0px)` (still moving, no reset). This isolates and confirms the exact mechanism the acceptance criterion is about, independent of how many real rounds the live game needs to roll a new direction.

### Normal-build path (no query string, port 8936, fresh localStorage, real solo game)

| Assertion | Observed |
|---|---|
| `document.getElementById("windHud")` | `null` |
| `document.getElementById("windDots")` | `null` |
| `document.querySelectorAll(".wdot").length` | `0` |

### Driven-tab labeling

The driven tab's `document.title` was set to `🤖 CLAUDE IS USING THIS` for the duration of each run and reset to `Pastry Pirates` afterward. This ran in a dedicated, separately-profiled Chrome instance (launched with `--remote-debugging-port`, its own `--user-data-dir`) rather than the user's own Chrome windows/tabs, so no tab in Wyatt's actual browser was ever touched.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — mechanical, expected] `art-review/narration-inventory.json` regenerated alongside `src/ui/board.js`**
- **Found during:** Task 1, first `npm test` run after committing the region
- **Issue:** `scripts/extract_narration_lines.js` (part of `npm test`) regenerates this committed inventory file from the live source on every run. Since Task 1 inserts ~330 lines above existing `board.js` code, every downstream narration-inventory entry's recorded `line` number shifted.
- **Fix:** Included the regenerated file in Task 1's commit rather than leaving it stale (which would have made the very next `npm test` run dirty the working tree again with the same diff). Diff is line-number-only — confirmed via `git diff art-review/narration-inventory.json | grep -i wind` returning nothing, i.e., no wind-dot content leaked into it.
- **Files modified:** `art-review/narration-inventory.json`
- **Verification:** `npm test` exits 0 with a clean `scripts/fixtures` diff both before and after
- **Committed in:** `0799a09` (Task 1 commit)

**2. [Rule 3 — blocking, tooling gap] No MCP browser-automation tool available for Task 2**
- **Found during:** Task 2, at the start of the driven-Chrome verification
- **Issue:** This execution session's tool list contained no MCP browser-control tool (no `mcp__playwright__*`, no computer-use tool) and no `puppeteer`/`playwright` package was installed in the project. `docs/DRIVING-THE-GAME.md`'s driving techniques assume some form of live browser control is already available.
- **Fix:** Wrote a minimal CDP (Chrome DevTools Protocol) client using only Node's built-in `fetch` and `WebSocket` globals (Node 25 ships a native `WebSocket` client) — no new npm dependency, so the package-install exclusion in the deviation rules never applied. Launched a dedicated, separately-profiled Chrome instance with `--remote-debugging-port` rather than touching the user's own Chrome windows, and used `Runtime.evaluate` to run the exact same in-page JS `docs/DRIVING-THE-GAME.md` documents (the §5b autoplay driver, the §6 live-module-import technique), so the verification technique itself matches the project's documented convention — only the transport (CDP over a hand-written WebSocket client instead of a computer-use tool) differs.
- **Also discovered and fixed in-flight:** a CDP-opened background tab is not the browser's foregrounded tab, which tripped this project's shot-clock's visibility-based auto-pause (`#scPause`) and stalled the very first attempt at round 1 for ~3 minutes. Fixed by calling `Page.bringToFront` immediately after opening the tab and periodically thereafter, un-pausing `#scPause` if the game had paused itself. This is a property of driving *any* browser tab that isn't foregrounded, not a bug in the wind-dot code.
- **Files modified:** none (test-harness-only; the driver scripts live in the scratchpad, not the repo)
- **Verification:** the driven run reached round 5 of a real solo game (including a live storm) and captured every value in the table above plus a screenshot
- **Committed in:** n/a (no repo file changed by this fix)

---

**Total deviations:** 2 auto-fixed (1 mechanical/expected, 1 blocking/tooling-gap)
**Impact on plan:** No scope creep. Both deviations were necessary to keep `npm test` clean and to actually perform the driven-Chrome verification the plan requires, rather than skipping it or asserting from source.

## Issues Encountered

- The live solo game rolled the same wind direction for 5 consecutive rounds before changing (see the wait-time note above) — not a bug, just an unlucky seed for this particular playthrough; resolved by patience plus a supplementary deterministic direct-invocation proof of the same mechanism.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The tracer is committed, inert by default, and proven end-to-end in both directions (enabled shows exactly what's expected; disabled shows nothing).
- 19-04 can build Wyatt's full motion spec (fade envelope, wobble term) directly onto `windDotFrame`'s existing return shape — no caller changes needed, per the plan's own note.
- The dev server on port 8934 (`http://192.168.1.3:8934/index.html?wind=1`) remains running, unmodified by this plan's verification work, for Wyatt's eventual Safari runs in 19-06.
- `WIND-00` stays open per the workstream note — it closes only when 19-06 completes Wyatt's actual Safari runs.

---
*Phase: 19-safari-check*
*Completed: 2026-08-01*

## Self-Check: PASSED
- FOUND: src/ui/board.js
- FOUND: .planning/workstreams/board-wind/phases/19-safari-check/19-03-SUMMARY.md
- FOUND: .planning/workstreams/board-wind/phases/19-safari-check/19-03-wind-dots-enabled.png
- FOUND commit: 0799a09
