---
phase: 13-multiplayer-turn-clock
plan: 03
subsystem: ui
tags: [dom, event-handler, shot-clock, multiplayer, seam]

requires:
  - phase: 13-multiplayer-turn-clock (plan 01)
    provides: togglePause() + the netHandlers().onTogglePause seam registered in src/main.js's setNetHandlers, and the de-gated ▶/⏸ #scPause corner button
provides:
  - "#shotClockNum click-to-resume affordance in both paused render branches of setClockUI()"
  - "Per-tick defensive onclick/cursor reset guaranteeing no stale handler survives into a non-paused render"
affects: [ui, multiplayer-turn-clock]

tech-stack:
  added: []
  patterns:
    - "DOM handler hygiene: reset onclick+cursor unconditionally near the top of a function that re-runs on an interval, then re-arm only in the branches that should be interactive that tick — prevents stale handlers from surviving into a later render (RESEARCH Anti-Pattern 4)."

key-files:
  created: []
  modified:
    - src/ui/panel.js

key-decisions:
  - "Both paused-render branches (the state-less 'paused' branch showing PAUSE_SYMBOL_IMG, and the state-present 'paused' branch showing a countdown number) get the same click-to-resume wiring — #shotClockNum is the click target in either paused rendering, not just the literal image render (per plan's read_first / must_haves)."
  - "Routed through netHandlers().onTogglePause() rather than importing togglePause from src/orchestrator.js directly — panel.js is ui-tier and the module-graph check forbids ui -> main imports."

requirements-completed: [CLOCK-03]

coverage:
  - id: D1
    description: "Clicking the large paused symbol (#shotClockNum) resumes the shot clock in both solo and multiplayer, via the same togglePause seam the corner #scPause button uses."
    requirement: CLOCK-03
    verification:
      - kind: unit
        ref: "npm test — module-graph gate confirms no ui->orchestrator import; determinism_baseline.js --verify 30/30 confirms no engine-adjacent regression"
        status: pass
    human_judgment: true
    rationale: "The actual resume-on-click behavior (and the non-paused inertness / no-stale-handler regression check) is a DOM/UI interaction only a manual or MCP browser check can confirm end-to-end in solo and 2-tab multiplayer; automated tests here only prove the module-graph and determinism invariants stay intact, not the click behavior itself."

duration: 12min
completed: 2026-07-26
status: complete
---

# Phase 13 Plan 03: Clickable Paused Symbol Summary

**#shotClockNum becomes a second click-to-resume target while paused, wired through the existing togglePause seam, with a per-tick defensive reset so no stale click handler survives into a non-paused render.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-26T03:13:00Z (approx.)
- **Completed:** 2026-07-26T03:25:13Z
- **Tasks:** 1 completed
- **Files modified:** 1

## Accomplishments
- The large paused symbol/countdown rendered in `#shotClockNum` is now clickable and resumes the game, in addition to the existing small `#scPause` corner button.
- Added a single defensive `numEl.onclick=null; numEl.style.cursor=''` reset right after `numEl` is resolved, executed on every `setClockUI()` tick before any branch runs — this guarantees the 500ms re-render interval can never leave a stale click-to-resume handler live once the clock leaves the paused state.
- Both paused-render branches (the state-less branch showing `PAUSE_SYMBOL_IMG`, and the state-present branch showing a paused countdown number) re-arm the pointer cursor + `onclick` handler identically.
- The click handler calls `netHandlers().onTogglePause()` — the exact seam entry 13-01 registered in `src/main.js`'s `setNetHandlers()` — so it resolves to local `toggleShotClockPause` in solo and to the networked `netSetPaused` path in multiplayer, with no new ui->orchestrator import.

## Task Commits

Each task was committed atomically:

1. **Task 1: Make the large paused symbol (#shotClockNum) clickable-to-resume, solo and multiplayer** - `e095b2b` (feat)

**Plan metadata:** (this SUMMARY.md commit)

## Files Created/Modified
- `src/ui/panel.js` - `setClockUI()`: added a per-tick defensive `onclick`/cursor reset on `numEl` before the branch logic, and wired both paused-render branches to set a pointer cursor and an `onclick` calling `netHandlers().onTogglePause()`.

## Decisions Made
- Treated `#shotClockNum` as the click target across BOTH of its paused-render forms (image and countdown number), not just the literal `PAUSE_SYMBOL_IMG` render — matches the plan's explicit read_first/must_haves guidance that both paused branches after 13-01 are gated on `appState.shotClockPaused` alone.
- Kept the reset as a single top-of-function statement rather than repeating a clear-onclick line in each non-paused branch individually — one line covers all four non-paused branches (timer-off, waiting/turn-clock, active countdown, waiting countdown) at once and is less likely to be missed if a future branch is added.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

CLOCK-03 is complete. This was the last plan in Phase 13 (Multiplayer Turn Clock), waves 1 (13-01, 13-02) and 2 (13-03) are both done. Phase 13's remaining verification is the manual/MCP human-check specified in this plan's `<verify>` block (solo + 2-tab multiplayer click-to-resume, and the not-paused inertness regression check) — automated `npm test` and `determinism_baseline.js --verify` (30/30) both stay green. No blockers for Phase 14 (Storm Movement & Determinism).

---
*Phase: 13-multiplayer-turn-clock*
*Completed: 2026-07-26*
