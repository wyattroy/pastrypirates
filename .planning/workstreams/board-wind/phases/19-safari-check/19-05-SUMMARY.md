---
phase: 19-safari-check
plan: 05
subsystem: ui
tags: [safari-perf, wind-dots, rAF, frame-timing, board-js, calibration]

# Dependency graph
requires:
  - phase: 19-04
    provides: "The complete D-02 motion (fade + wobble), the exact/finger-friendly 0-100 dial, the reduced-motion branch, and the will-change toggle in src/ui/board.js's wind-dot region — everything 19-05's calibrated meter needed to sit on top of."
provides:
  - "windMeterSample — the calibrated per-frame classifier: discards deltas above WIND_METER_OUTLIER_MS as backgrounding (not stutter), buckets accepted deltas into a preallocated Int32Array histogram, establishes a ONE-TIME baseline from the first WIND_METER_BASELINE_SAMPLES accepted deltas (the histogram's true median, never a hardcoded 60fps assumption), counts dips above baseline*WIND_METER_DIP_FACTOR, and tracks the worst accepted delta plus when it happened"
  - "windHistMedian — the histogram's true median (smallest bucket whose cumulative count reaches ceil(n/2), ties resolving low), shared by baseline-establishment and the live typical figure"
  - "windMeterReset wired to visibilitychange — a phone auto-lock or tab-hide interval is discarded as a pause, never sampled as a catastrophic worst moment"
  - "windMeterSummary — a plain object (baselineMs, typicalMs/Fps, worstMs/Fps/AtMs, samples, dips, discarded, lowPowerSuspected) with every fps figure computed as Math.round(1000/ms)"
  - "renderWindSummary — a plain-English #windSummary block appended once to #statsPanel inside showStats(), no-op unless the prototype is enabled"
  - "windDotLoop's live readout now shows a baseline-relative smooth/rough/warming-up word alongside the fps number, instead of the tracer's raw last-frame-delta text"
affects: [19-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "True histogram median (walk buckets accumulating counts, return the first index reaching ceil(n/2)) instead of a rolling/exponential average, so the 'typical' figure cannot be quietly dragged around by the very load it is measuring"
    - "A ONE-TIME baseline captured from the first N accepted samples and then frozen — classification is always relative to what THIS device measured at the start of THIS session, never a hardcoded frame-interval constant"
    - "Outlier discard BEFORE bucketing — a delta above a fixed ceiling never touches the histogram, the worst-moment slot, or the dip counter; it only increments a separate discarded-pause counter"
    - "visibilitychange as the second, independent discard path — different failure mode (page hidden vs. a single huge delta) than the outlier-ceiling path, both feeding the same discarded counter"
    - "A preallocated Int32Array histogram plus zero object/array allocation inside the per-frame sample function, so the instrument's own per-frame cost cannot become the stutter it is trying to detect"

key-files:
  created: []
  modified:
    - src/ui/board.js
    - scripts/no_undef_check.js
    - art-review/narration-inventory.json

key-decisions:
  - "windMeterSummary was implemented and committed under Task 1 rather than deferred to Task 2's <action> text, because Task 1's OWN acceptance criteria in 19-05-PLAN.md exercises windMeterSummary() directly (to prove the baseline/outlier/median behavior headlessly) before Task 2 exists. A task's acceptance criteria is the actual pass/fail gate; where the plan's prose narrative assigns a symbol's <action> text is secondary to that gate being satisfiable at commit time. Documented in-code at the function's definition so a future reader is not confused about which task 'owns' it."
  - "scripts/no_undef_check.js's GLOBAL_ALLOWLIST was extended with the full typed-array family (Int32Array and ten siblings). This was a genuine pre-existing gap in a project-wide mechanical guard, not a wind-dot-scoped change — the plan's mandated preallocated `new Int32Array(...)` histogram was the first call under src/ to ever need it, and npm test failed with a no-undef false positive without the fix. Applied as a Rule 3 (blocking-issue) auto-fix; scoped to the minimal correct addition (the whole binary-data global family, not just Int32Array) since an incomplete allowlist would just resurface on the next typed array anyone reaches for."
  - "windDiscarded increments on EVERY visibilitychange-to-visible transition (module-scope listener, registered unconditionally, mirroring the existing prefers-reduced-motion matchMedia listener's always-on pattern) rather than only while the prototype is actively sampling. Harmless when the prototype is off (nothing reads windDiscarded in that state) and keeps the reset/discard pairing atomic and impossible to accidentally skip."
  - "windFormatElapsed always renders BOTH a minutes and a seconds component (e.g. '0m 0s', not just '0s') rather than omitting minutes when zero, matching the plan's own worked example ('about 4m 12s in') literally and keeping the figure's shape independent of voyage length — verified live in driven Chrome as '0m 0s in'."
  - "The readout's rounding used Math.round(1000/deltaMs) exactly as specified (not Math.floor or a fixed-precision truncation), verified against the plan's own worked boundary case (16ms -> 63fps, not 62) headlessly before ever touching a browser."

requirements-completed: []  # WIND-00 stays open until 19-06 completes Wyatt's Safari runs, per the workstream note

coverage:
  - id: D1
    description: "windMeterSample classifies frames against a baseline MEASURED on this device this session (never a hardcoded 60fps assumption) — a synthetic 120-sample stream at 33ms establishes baselineMs=33 and flags lowPowerSuspected=true; a 200-sample stream at 16ms establishes baselineMs=16, typicalFps=63 (Math.round(1000/16)), and lowPowerSuspected=false"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "node -e headless stream test (120x33ms + one 200ms): baselineMs===33 && worstMs===200 && lowPowerSuspected===true"
        status: pass
      - kind: unit
        ref: "node -e headless stream test (200x16ms): typicalMs===16 && typicalFps===63 && lowPowerSuspected===false"
        status: pass
    human_judgment: false
  - id: D2
    description: "A delta above WIND_METER_OUTLIER_MS (500ms) is discarded as background time, never enshrined as the worst moment or bucketed into the histogram — a synthetic 900ms delta increments the discarded counter and leaves worstMs unchanged and below 900"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "node -e headless outlier test: discarded increments by exactly 1, worstMs stays < 900 after m.windMeterSample(900,1000)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Sampling allocates nothing per frame (a preallocated Int32Array histogram, no object/array created inside windMeterSample), and the meter's own compositor-only region contract still holds"
    requirement: WIND-00
    verification:
      - kind: unit
        ref: "grep -c 'new Int32Array' src/ui/board.js >= 1; grep -c 'WIND_METER_OUTLIER_MS' >= 2; grep -c 'visibilitychange' >= 1"
        status: pass
      - kind: unit
        ref: "node scripts/wind_dot_contract_check.js — all 6 assertions PASS (region integrity, compositor-only, determinism, file ownership, off-by-default, pure-math)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A tab becoming hidden then visible resets the frame reference (windMeterReset) without recording the hidden interval as a stutter — wired to visibilitychange, counted instead as a discarded pause"
    requirement: WIND-00
    verification:
      - kind: automated_ui
        ref: "driven Chrome, real ~2-minute solo-game autoplay run: discarded=1 after the run (a visibilitychange fired during CDP's multi-tab session), worstMs stayed at 33.4ms (a genuine dip, not a multi-second backgrounding artifact) — the observed shape matches the intended discard-not-swamp behavior"
        status: pass
    human_judgment: false
  - id: D5
    description: "npm test stays green with zero determinism fixture changes across both tasks"
    requirement: WIND-00
    verification:
      - kind: integration
        ref: "npm test — 23/23 assertion group(s) PASS, run after Task 1's commit and again after Task 2's commit; git status --porcelain scripts/fixtures empty both times"
        status: pass
    human_judgment: false
  - id: D6
    description: "showStats() prints a plain-English end-of-voyage summary (typical fps, worst moment with a floored-to-whole-seconds 'Xm Ys' elapsed figure, dip/discarded-pause counts, dial/will-change state, and a suspected-Low-Power-Mode sentence when warranted) — no-op unless the prototype is enabled, so a normal build's End of Voyage screen is byte-identical to before this plan"
    requirement: WIND-00
    verification:
      - kind: automated_ui
        ref: "driven Chrome (?wind=1), real solo game, ~2 minutes of autoplay accumulating 3076 samples, then showStats() called: #windSummary exists inside #statsPanel with the full expected text (quoted below in Deviations/Task 2 Observed Values)"
        status: pass
      - kind: automated_ui
        ref: "driven Chrome, SAME page with NO ?wind=1: showStats() leaves #windSummary null (document.getElementById('windSummary') === null)"
        status: pass
    human_judgment: true
    rationale: "The Wave 0 gap this whole phase exists to close (19-RESEARCH.md Validation Architecture) is human-judged by design — Wyatt reads this exact sentence text to decide whether Phase 20 goes ahead. The verify command proves the plumbing (element exists, contains the right figures); it cannot prove the wording reads as plain English to a non-coder. Task 2's <verify><human-check> explicitly asked for the rendered text to be quoted verbatim in this SUMMARY for that judgment — done below."

# Metrics
duration: ~20min (coding + headless verification); the driven-Chrome pass added ~2 additional real-time minutes of autoplay to accumulate a realistic sample count
completed: 2026-08-01
status: complete
---

# Phase 19 Plan 05: Calibrated Frame-Timing Meter + Plain End-of-Voyage Summary Summary

**The tracer's raw last-frame-delta readout is now a calibrated instrument — baseline measured on-device, outliers and hidden-tab gaps discarded rather than recorded as stutter, allocation-free per frame — and showStats() prints the plain-English verdict text Wyatt will read to judge Phase 20's go-ahead.**

## Performance

- **Duration:** ~20 min (coding + headless verification across both tasks)
- **Started:** 2026-08-01T09:00:00Z (approx., following 19-04's 08:54:53Z completion)
- **Completed:** 2026-08-01T09:19:36Z
- **Tasks:** 2 completed
- **Files modified:** 3 (`src/ui/board.js`, `scripts/no_undef_check.js`, `art-review/narration-inventory.json`)

## Accomplishments

- **Task 1 — the calibrated meter:** `windMeterSample` replaces the tracer's raw `Math.round(1000/delta)` text with real classification: a delta above `WIND_METER_OUTLIER_MS` (500ms) is a discarded pause, not a stutter (19-RESEARCH.md Pitfall 3); the first 120 accepted deltas establish a ONE-TIME baseline as the histogram's true median (never a hardcoded 60fps assumption, Pitfall 2); dips are counted relative to that baseline; the worst accepted delta and when it happened are tracked. `windMeterReset` is wired to `visibilitychange` so a phone auto-lock's hidden interval is discarded rather than sampled as a catastrophic worst moment. The histogram is a preallocated `Int32Array` and the sample function allocates nothing (Pitfall 4). `windMeterSummary` — nominally a Task 2 artifact per the plan's `<action>` prose — was implemented here instead, because Task 1's own acceptance criteria exercises it directly; see Decisions Made.
- **Task 2 — the plain-English summary:** `renderWindSummary` appends one `#windSummary` block to `#statsPanel` as the last statement of `showStats()`, writing sentences (not a metrics table): typical fps, the worst moment with a `windFormatElapsed` "Xm Ys" figure, dip/discarded-pause counts, the dial's ending state, and — when the baseline lands in the 30–40ms Low Power Mode band — an extra sentence telling Wyatt to read the numbers in that light. No-op unless the prototype is enabled, so a normal build's End of Voyage screen is unchanged.
- Both tasks verified twice: headlessly (synthetic `node -e` streams proving the baseline/outlier/median/rounding contracts exactly, plus `scripts/wind_dot_contract_check.js`) and in a real driven-Chrome solo game (hand-rolled CDP client, same technique 19-03/19-04 established since no MCP browser tool was available this session) — a ~2-minute autoplay run accumulated 3076 real frame samples and produced the actual end-of-voyage text quoted below.
- `npm test` stayed green (23/23) after both task commits, with zero `scripts/fixtures` changes throughout.
- Fixed a genuine pre-existing gap in `scripts/no_undef_check.js`'s global allowlist (the entire typed-array family was missing) — surfaced by, but not scoped to, the plan-mandated `Int32Array` histogram.

## Task Commits

1. **Task 1: Build the calibrated frame-timing meter** — `0c3de0a` (feat)
2. **Task 2: Print a plain end-of-voyage summary** — `a4be91d` (feat)
3. **Narration inventory regeneration (deviation, see below)** — `0635154` (docs)

**Plan metadata:** (this commit, following the SUMMARY)

## Files Created/Modified

- `src/ui/board.js` — the WIND DOT PROTOTYPE region only: `WIND_METER_*` constants, the `windHist`/`windSamples`/`windBaselineMs`/`windWorstMs`/`windWorstAtMs`/`windDips`/`windDiscarded`/`windMeterStartMs` state, `windHistMedian`/`windMeterSample`/`windMeterReset`/`windMeterSummary`/`windFormatElapsed`/`renderWindSummary`, the `visibilitychange` listener, `windDotLoop`'s rewired sampling + baseline-relative readout word, `showStats()`'s one appended `renderWindSummary();` call, and the file header's extended Phase 19 scoped-exception note
- `scripts/no_undef_check.js` — `GLOBAL_ALLOWLIST` extended with `ArrayBuffer`/`SharedArrayBuffer`/`DataView` and the eleven typed-array constructors (deviation, see below)
- `art-review/narration-inventory.json` — regenerated by `npm test`'s `extract_narration_lines.js` step (line-number-only diff, no wind-dot content), same deviation pattern as 19-03/19-04

## Decisions Made

- `windMeterSummary` implemented under Task 1 (not deferred to Task 2 as its `<action>` prose nominally assigns it), because Task 1's own acceptance criteria in `19-05-PLAN.md` calls `windMeterSummary()` directly to prove the baseline/outlier/median behavior headlessly, before Task 2 exists. A task's acceptance criteria is the actual pass/fail gate; committed as Task 1's artifact with an in-code comment explaining why, so a future reader is not confused about which task "owns" it. Task 2 then only adds `windFormatElapsed`/`renderWindSummary` (which format and display the already-working object) plus the `showStats()` call and header note.
- Extended `scripts/no_undef_check.js`'s `GLOBAL_ALLOWLIST` with the full typed-array family, not just `Int32Array` — an incomplete allowlist would just resurface as a false positive the next time anyone reaches for `Float64Array` or similar. This is a project-wide mechanical-guard fix (Rule 3, blocking-issue), not a wind-dot-scoped change, but was required for `npm test` to pass with the plan-mandated preallocated histogram.
- `windDiscarded` increments on every `visibilitychange`-to-visible transition via an unconditionally-registered module-scope listener (mirroring the existing `prefers-reduced-motion` `matchMedia` listener's always-on pattern), rather than gating registration on `windPrototypeEnabled()`. Harmless when the prototype is off (nothing reads `windDiscarded` in that state) and keeps the reset/discard pairing atomic.
- `windFormatElapsed` always renders both a minutes and a seconds component (`"0m 0s"`, not `"0s"`), matching the plan's own worked example (`"about 4m 12s in"`) literally — confirmed live in driven Chrome as `"0m 0s in"` for a dip that happened 116ms into the measured window.
- Reused 19-03/19-04's hand-rolled CDP verification technique (Node's built-in `fetch`/global `WebSocket`, a dedicated separately-profiled Chrome instance on `--remote-debugging-port=9225`) since no MCP browser-automation tool was available this session either. One operational finding worth recording for 19-06: a single long-lived CDP WebSocket connection appears to hang across a full-page `location.href` navigation (a stale execution context) even though a *fresh* connection to the same tab evaluates instantly — worked around by reconnecting after each navigation rather than reusing one socket across navigations.

## Task 2 — Observed Values (driven Chrome, real solo game, `?wind=1`)

| Assertion | Observed |
|---|---|
| `board.windMeterSummary`/`renderWindSummary` exist, prototype enabled after `?wind=1` | `true`/`true`/`true` |
| Samples accumulated over ~2 minutes of autoplay | `3076` |
| `windMeterSummary()` after the run | `{baselineMs:17, typicalMs:17, typicalFps:59, worstMs:33.4, worstFps:30, worstAtMs:116, samples:3076, dips:2, discarded:1, lowPowerSuspected:false}` |
| `#windSummary` exists inside `#statsPanel` after `showStats()` | `true` |
| **Rendered `#windSummary` text (verbatim, human-check per Task 2's `<verify>`)** | `"Wind-dot smoothness check (Phase 19 prototype)\nTypical: about 59 frames a second.\nWorst moment: about 30 frames a second, roughly 0m 0s in.\n2 rough moments noticed, out of 3076 frames measured.\nDial ended at 10 dots, with the will-change hint OFF.\n1 pause ignored — the screen was off or the tab was hidden, not a stutter."` |
| Same page, reloaded with NO `?wind=1`, `showStats()` called | `#windSummary` is `null`, `windPrototypeEnabled()` is `false` |

The `discarded:1` above came from a `visibilitychange` firing during the CDP multi-tab session (a benign artifact of automated multi-tab driving, not a real backgrounding event in the voyage) — exactly the discard path Task 1 built, exercised for real rather than only synthetically.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — blocking issue] `scripts/no_undef_check.js`'s `GLOBAL_ALLOWLIST` was missing the entire typed-array family**
- **Found during:** first `npm test` run after Task 1's `const windHist=new Int32Array(...)` landed
- **Issue:** the project-wide no-undef guard flagged `Int32Array(` as an undeclared call-position identifier — a pre-existing gap in the hardcoded global allowlist (it listed `Object`/`Array`/etc. but no typed arrays at all), not something wind-dot-specific.
- **Fix:** added `ArrayBuffer`, `SharedArrayBuffer`, `DataView`, and all eleven typed-array constructors to `GLOBAL_ALLOWLIST`.
- **Files modified:** `scripts/no_undef_check.js`
- **Verification:** `npm test`'s no-undef assertion passes; full 23/23 suite green afterward.
- **Committed in:** `0c3de0a`

**2. [Rule 3 — mechanical, expected] `art-review/narration-inventory.json` regenerated alongside `src/ui/board.js`**
- **Found during:** each `npm test` run after Task 1/Task 2's edits (both tasks added lines above existing narration-inventory-scanned code)
- **Issue:** `scripts/extract_narration_lines.js` (part of `npm test`) regenerates this committed inventory from live source on every run; every added line shifts downstream line numbers.
- **Fix:** ran `npm test` once at the end (after both task commits) and committed the final regenerated file as its own small `docs` commit, rather than folding a regenerating file into either task commit. Confirmed line-number-only diff by inspection.
- **Files modified:** `art-review/narration-inventory.json`
- **Verification:** `npm test` exits 0 with a clean `scripts/fixtures` diff before and after; `git diff` shows only `"line"` field changes.
- **Committed in:** `0635154`

---

**Total deviations:** 2 auto-fixed (1 genuine blocking-issue fix, 1 mechanical/expected)
**Impact on plan:** No scope creep. Neither deviation changed the meter's behavior, the summary's wording, or any D-05/D-09 contract.

## Issues Encountered

- The hand-rolled CDP client's single long-lived WebSocket connection hung indefinitely across a full-page `location.href` navigation partway through the verification run (the negative-control step). Diagnosed by opening a *second*, fresh CDP connection to the same live tab, which evaluated instantly — confirming the page itself was fine and the issue was stale execution-context state on the original socket. Worked around by reconnecting per navigation rather than reusing one socket. No game code was implicated; recorded here (and in Decisions Made) so 19-06 doesn't lose time rediscovering it.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `src/ui/board.js`'s wind-dot region now carries a fully calibrated smoothness instrument and a plain-English end-of-voyage summary — the last piece 19-06 needs before Wyatt's real Safari runs (desktop, then phone).
- `WIND-00` stays open per the workstream note — it closes only when 19-06 completes Wyatt's actual Safari verdict runs.
- The dev server on port 8934 (`http://192.168.1.3:8934/index.html?wind=1`) remains running, ready for 19-06.

---
*Phase: 19-safari-check*
*Completed: 2026-08-01*

## Self-Check: PASSED
- FOUND: src/ui/board.js
- FOUND: scripts/no_undef_check.js
- FOUND: art-review/narration-inventory.json
- FOUND: .planning/workstreams/board-wind/phases/19-safari-check/19-05-SUMMARY.md
- FOUND commit: 0c3de0a
- FOUND commit: a4be91d
- FOUND commit: 0635154
