---
phase: 19-safari-check
plan: 04
subsystem: ui
tags: [safari-perf, wind-dots, rAF, board-js, prefers-reduced-motion, will-change, touch-controls]

# Dependency graph
requires:
  - phase: 19-03
    provides: "A working, off-by-default wind-dot tracer in src/ui/board.js — seeded specs, pure per-dot motion math (windDotFrame's two named fill-in points), a DOM dot layer, a shared rAF loop, and a touch HUD (switch/dial/readout) — proven end-to-end in driven Chrome"
provides:
  - "windDotFrame's complete D-02 motion: a sin-eased fade envelope (appear/disappear mid-board) and a lateral wobble term seeded per-dot, both proven pure and headless via node -e and the guard's assertion 6"
  - "A hardened, finger-friendly 0-100 dial: #windDialMinus/#windDialPlus (step 5) and #windDial10 (jump to WIND_DOT_DEFAULT), each >=44px, routed through the existing windSetDotCount clamp"
  - "A JS matchMedia prefers-reduced-motion branch (D-13) that freezes windDotLoop's transform-writing branch while the loop itself keeps running for the readout"
  - "#windWillChange — a defaults-OFF toggle applying/clearing style.willChange=\"transform\" across every live .wdot, so the headroom run can isolate that variable per 19-RESEARCH.md's Anti-Patterns / Open Question 1"
affects: [19-05, 19-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fade envelope shaped with Math.sin() quarter-cosine easing over a WIND_FADE_FRAC-sized rise/fall window around a shared cycle position `u`, rather than a linear ramp — read as a smooth breath, not a triangle wave"
    - "Wobble computed entirely in the dot's LOCAL x-axis (Math.sin(t/period*2pi+phase)*amp*max), letting the outer .wlayer rotate() turn it into cross-wind sway automatically with zero per-dot trigonometry"
    - "Stepper buttons (#windDialMinus/#windDialPlus/#windDial10) as real <button> elements routed through the SAME windSetDotCount clamp the range input uses, rather than duplicating clamp logic"
    - "JS matchMedia read once at module init (mirroring src/ui/panel.js:300), with a change listener, rather than a pure-CSS animation-play-state rule — because the dots' motion is JS-computed, not CSS-keyframed"
    - "A loop-level 'keep running, skip writing' gate (windDotCount===0 AND windReducedMotion) is preserved and extended, not replaced by cancelling the rAF loop — documented explicitly so a future edit doesn't undo the 19-05 off-state-baseline requirement"

key-files:
  created: []
  modified:
    - src/ui/board.js
    - art-review/narration-inventory.json

key-decisions:
  - "Fade envelope uses sin()-based quarter-cosine easing (Math.sin(u/frac * pi/2)) rather than a linear ramp for both rise and fall, since the plan called for a 'smooth' envelope and this codebase already favors eased curves for anything user-visible (e.g. the typewriter reveal)"
  - "WIND_FADE_FRAC=0.2 was added as a named constant alongside the plan's two mandated constants (WIND_WOBBLE_MAX_PX, WIND_WOBBLE_PERIOD_MS) rather than inlining the 'first/last fifth' literal, for the same self-documenting reason the region's other constants are named"
  - "Task 2 and Task 3's code changes were interleaved by hand (each committed separately, verified independently in driven Chrome both times) rather than committed as one combined diff, honoring the plan's per-task atomic-commit contract even though both tasks touch buildWindHud/buildWindDots in adjacent regions"
  - "Verification used the same hand-rolled CDP driver technique 19-03 established (Node's built-in fetch+WebSocket, a dedicated separately-profiled Chrome instance) since no MCP browser-automation tool was available this session either — consistent continuation of 19-03's documented deviation, not a new one"

requirements-completed: []  # WIND-00 stays open until 19-06 completes Wyatt's Safari runs, per the workstream note

coverage:
  - id: D1
    description: "windDotFrame's fade envelope: opacity rises from 0 to the 0.72 plateau across the first ~fifth of a cycle, holds, falls back to 0 across the last ~fifth — always within [0,1], appearing/disappearing mid-board"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "node -e sweep over windDotSpecs(7,1)[0] across 6000ms/25ms steps: lo<=0.01 && hi>=0.5 (observed lo=0.00522, hi=0.72)"
        status: pass
      - kind: unit
        ref: "scripts/wind_dot_contract_check.js assertion 6 (opacity within [0,1] and finite x/y across 200 samples)"
        status: pass
    human_judgment: false
  - id: D2
    description: "windDotFrame's wobble term: x oscillates around spec.lane*layerW, both above and below, capped at WIND_WOBBLE_MAX_PX (14px), seeded per-dot by spec.startT/spec.wobbleAmp; y and travel direction untouched; the frame function stays pure (two identical calls produce identical output)"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "node -e sweep over windDotSpecs(7,1)[0]: below=true, above=true, dev<=14.001 (observed dev=10.35)"
        status: pass
      - kind: unit
        ref: "node -e purity check: windDotFrame(spec,1234,600,600) called twice produces identical JSON"
        status: pass
    human_judgment: false
  - id: D3
    description: "The 0-100 dial's boundaries are exact — windDotSpecs(1,0)=0, windDotSpecs(1,-1)=0, windDotSpecs(1,1)=1, windDotSpecs(1,99)=99, windDotSpecs(1,100)=100, windDotSpecs(1,101)=100, non-finite input (NaN/Infinity) clamps to 0/100 rather than throwing or running away"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "node -e boundary sweep (all six values) — exit 0"
        status: pass
      - kind: unit
        ref: "node -e non-finite sweep (NaN->0, Infinity->100) — exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "In driven Chrome (real solo game, ?wind=1): dial to 0 leaves .wdot count at 0 with no residue after a further frame; dial to 100 leaves .wdot count at exactly 100; #windDialMinus/#windDialPlus/#windDial10 all exist and render at >=44 CSS px in both dimensions; tapping #windDial10 sets #windDialNum to \"10\"; appState.evIdx is unchanged across every dial operation (no reload)"
    requirement: WIND-00
    verification:
      - kind: automated_ui
        ref: "CDP-driven Chrome, real solo game — see Task 2/Task 3 Observed Values tables below"
        status: pass
    human_judgment: false
  - id: D5
    description: "Reduced motion (D-13): with prefers-reduced-motion emulated, a sampled .wdot transform is identical across two ~500ms-apart reads while the .wdot count and the #windReadout fps text both keep updating; un-emulating resumes motion"
    requirement: WIND-00
    verification:
      - kind: automated_ui
        ref: "CDP-driven Chrome via Emulation.setEmulatedMedia — see Task 3 Observed Values table below"
        status: pass
    human_judgment: false
  - id: D6
    description: "#windWillChange toggle: exists, renders >=44 CSS px tall, defaults to \"HINT: OFF\" with no .wdot carrying style.willChange=\"transform\"; tapping it ON sets willChange=\"transform\" on every live .wdot (checked at a dial of 100); tapping it OFF clears willChange from every .wdot; buildWindDots applies the current setting to dots created after a toggle"
    requirement: WIND-00
    verification:
      - kind: automated_ui
        ref: "CDP-driven Chrome, dial at 100 — see Task 3 Observed Values table below"
        status: pass
    human_judgment: false

# Metrics
duration: ~13min
completed: 2026-08-01
status: complete
---

# Phase 19 Plan 04: Wyatt's Motion Spec + the 0-100 Dial + Reduced Motion + will-change Toggle Summary

**windDotFrame now carries the complete D-02 motion (sin-eased fade envelope + lane-crossing wobble), the dial is exact at both boundaries with finger-friendly steppers, and the region has a live prefers-reduced-motion freeze plus an isolatable will-change toggle for the headroom run — all proven pure/headless AND in a real driven-Chrome solo game.**

## Performance

- **Duration:** ~13 min
- **Started:** 2026-08-01T08:41:44Z
- **Completed:** 2026-08-01T08:54:53Z
- **Tasks:** 3 completed
- **Files modified:** 2 (`src/ui/board.js`, `art-review/narration-inventory.json`)

## Accomplishments

- **Task 1 — D-02's full motion:** `windDotFrame` now shapes `opacity` as a sin-eased envelope (rise across the first `WIND_FADE_FRAC` of a cycle, hold at the tracer's `0.72` plateau, fall across the last `WIND_FADE_FRAC`) so dots appear and disappear mid-board rather than marching edge to edge, and adds a `WIND_WOBBLE_MAX_PX`/`WIND_WOBBLE_PERIOD_MS`-bounded lateral sway to `x` only, phase-seeded by `spec.startT` and scaled by `spec.wobbleAmp` — a local-space term that becomes cross-wind sway automatically once `.wlayer`'s outer `rotate()` is applied, with zero per-dot trigonometry.
- **Task 2 — the finger-friendly 0-100 dial:** `windSetDotCount`'s clamp and `buildWindDots`'s exact-construction pool were already correct from 19-03; this plan added the missing control layer — `#windDialMinus`/`#windDialPlus` (step 5) and `#windDial10` (jump to `WIND_DOT_DEFAULT`), each a real `>=44px` `button` routed through the same clamp, making D-06 run 2's "lock to exactly 10" one tap.
- **Task 3 — reduced motion + the will-change toggle:** a module-init `matchMedia("(prefers-reduced-motion: reduce)")` read (mirroring `src/ui/panel.js:300`'s guarded JS pattern, since the dots are JS-animated) with a live `change` listener freezes `windDotLoop`'s transform-writing branch while the readout keeps reporting; `#windWillChange` (defaults OFF) toggles `style.willChange="transform"` across every live `.wdot`, and `buildWindDots` applies the current setting to dots created after a toggle, so the headroom run can isolate that one contested variable (`19-RESEARCH.md` Anti-Patterns / Open Question 1) instead of guessing.
- All three tasks verified twice each: once headlessly (pure-math node invocations + `scripts/wind_dot_contract_check.js`, including `--drill`) and once in a real driven-Chrome solo game via a hand-rolled CDP client (continuing 19-03's documented technique, since no MCP browser tool was available this session either).
- `npm test` stayed green (23/23) at every checkpoint, with zero `scripts/fixtures` changes throughout.

## Task Commits

1. **Task 1: Complete Wyatt's motion spec — fade in and out, and a wobble across the path** — `ade0ff6` (feat)
2. **Task 2: Make the 0-100 dial correct at both ends and usable with a thumb** — `8d665c5` (feat)
3. **Task 3: Add the reduced-motion branch and the will-change toggle** — `e00d9db` (feat)
4. **Narration inventory regeneration (deviation, see below)** — `749b35e` (docs)

**Plan metadata:** (this commit, following the SUMMARY)

## Files Created/Modified

- `src/ui/board.js` — the WIND DOT PROTOTYPE region only: `windDotFrame`'s fade/wobble math, `WIND_WOBBLE_MAX_PX`/`WIND_WOBBLE_PERIOD_MS`/`WIND_FADE_FRAC` constants, the three stepper buttons in `buildWindHud`, `windReducedMotion`/`windWillChangeOn` module state, the `windDotLoop` reduced-motion gate, and the `#windWillChange` button
- `art-review/narration-inventory.json` — regenerated by `npm test`'s `extract_narration_lines.js` step (line-number-only diff, no wind-dot content), same deviation pattern as 19-03

## Decisions Made

- Fade envelope uses `Math.sin()` quarter-cosine easing for both rise and fall rather than a linear ramp — matches this codebase's existing preference for eased, not linear, user-visible motion, and satisfies the plan's explicit "shape opacity as a smooth envelope" language.
- Added `WIND_FADE_FRAC=0.2` as a named constant (the plan only mandated the two wobble constants by name) for the same self-documenting reason the region's other constants are named rather than inlined.
- Committed Task 2 and Task 3 as fully separate, independently-verified commits despite both touching adjacent code inside `buildWindHud`/`buildWindDots` — implemented both together during development, then split the diff by temporarily reverting Task 3's hunks, re-running the guard/`npm test`/a dedicated driven-Chrome pass on the Task-2-only state, committing, reapplying Task 3, and re-verifying again before its own commit. This keeps the per-task atomic-commit contract honest rather than "verified together, described separately."
- Reused 19-03's hand-rolled CDP verification technique unchanged (Node's built-in `fetch`/`WebSocket`, a dedicated separately-profiled Chrome instance on `--remote-debugging-port=9224`, `--user-data-dir` under this session's scratchpad) since no MCP browser-automation tool was available in this execution session either.

## Task 2 — Observed Values (driven Chrome, Task-2-only code, before Task 3 landed)

| Assertion | Observed |
|---|---|
| `#windHud` exists after starting a real solo game | `true` |
| `#windDialMinus`/`#windDialPlus`/`#windDial10` all exist | `true` |
| Rendered size of all three stepper buttons | `49.67 x 44` CSS px (height exactly 44, width comfortably over) |
| `#windDial` set to `0` via `input` event → `.wdot` count | `0`, and unchanged after one further `requestAnimationFrame` pair |
| `#windDial` set to `100` via `input` event → `.wdot` count | `100` (never 101) |
| Tapping `#windDial10` → `#windDialNum` | `"10"` |
| `appState.evIdx` before vs. after all dial operations | `0` → `0` (unchanged — no reload) |
| `#board` still present after all dial operations | `true` |

## Task 3 — Observed Values (driven Chrome, full Task 1+2+3 code)

| Assertion | Observed |
|---|---|
| Every stepper/dial/HUD control still present after Task 3 landed | `true` (re-confirmed: minus/plus/ten/dial/switch all `true`) |
| `.wdot` count at dial 0 (before and after one further frame) | `0`, `0` |
| `.wdot` count at dial 100 | `100` |
| Dial after tap-ten / three-taps-minus (10→5→0, clamped) / 25-taps-plus from 0 (clamped at 100) | `"10"` → `"0"` → `"100"`, with `.wdot` counts `10`/`0`/`100` matching at each step |
| `appState.evIdx` before vs. after the full Task 2+3 dial-operation sequence | `0` → `0` (unchanged) |
| Sampled `.wdot` transform, two reads ~500ms apart, reduced motion NOT emulated | differs (`true`) |
| `window.matchMedia("(prefers-reduced-motion: reduce)").matches` after `Emulation.setEmulatedMedia` | `true` |
| Sampled `.wdot` transform, two reads ~500ms apart, reduced motion emulated | identical (`true` — frozen) |
| `.wdot` count unchanged across the reduced-motion window | `true` |
| `#windReadout` fps text across the same window | `"60 fps"` → `"60 fps"` this run (a stable frame rate, not a stutter — the readout kept updating each throttled tick regardless, confirmed by the loop continuing to re-arm) |
| `matchMedia(...).matches` after resetting the emulation | `false` |
| `.wdot` transform resumes changing after resetting the emulation | `true` |
| `#windWillChange` exists, rendered height, default text | `true`, `44` CSS px, `"HINT: OFF"` |
| Every `.wdot` carries no `will-change` before any toggle (dial at 100) | `true` |
| Every `.wdot` carries `willChange="transform"` after tapping ON | `true` |
| Button text after ON / after tapping OFF again | `"HINT: ON"` / `"HINT: OFF"` |
| Every `.wdot` cleared of `will-change` after tapping OFF | `true` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — mechanical, expected] `art-review/narration-inventory.json` regenerated alongside `src/ui/board.js`**
- **Found during:** each `npm test` run after Task 1/Task 2/Task 3's edits (all three tasks added lines above existing narration-inventory-scanned code)
- **Issue:** `scripts/extract_narration_lines.js` (part of `npm test`) regenerates this committed inventory from live source on every run; every added line shifts downstream line numbers.
- **Fix:** Ran `npm test` once at the end (after all three task commits) and committed the final regenerated file as its own small `docs` commit, rather than folding a regenerating file into three separate task commits. Confirmed line-number-only diff (no wind-dot content leaked in) via manual inspection of the diff.
- **Files modified:** `art-review/narration-inventory.json`
- **Verification:** `npm test` exits 0 with a clean `scripts/fixtures` diff both before and after; `git diff` shows only `"line"` field changes
- **Committed in:** `749b35e`

---

**Total deviations:** 1 auto-fixed (mechanical/expected)
**Impact on plan:** No scope creep. The narration-inventory regeneration is a known, previously-documented side effect of adding lines to `board.js` (same pattern 19-03 hit).

## Issues Encountered

None beyond the deviation above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/ui/board.js`'s wind-dot region now carries the complete D-02 motion, an exact and finger-friendly 0-100 dial, the reduced-motion branch, and the will-change toggle — everything 19-05's calibrated smoothness meter needs to sit on top of.
- `#windSummary` and the meter functions are explicitly NOT part of this plan (per the plan's own "Artifacts this phase produces" note) and arrive in 19-05.
- The dev server on port 8934 (`http://192.168.1.3:8934/index.html?wind=1`) remains running, unmodified by this plan's own verification work (a separate, dedicated CDP-driven Chrome instance was used and has since been closed), ready for 19-05/19-06.
- `WIND-00` stays open per the workstream note — it closes only when 19-06 completes Wyatt's actual Safari runs.

---
*Phase: 19-safari-check*
*Completed: 2026-08-01*

## Self-Check: PASSED
- FOUND: src/ui/board.js
- FOUND: .planning/workstreams/board-wind/phases/19-safari-check/19-04-SUMMARY.md
- FOUND commit: ade0ff6
- FOUND commit: 8d665c5
- FOUND commit: e00d9db
- FOUND commit: 749b35e
