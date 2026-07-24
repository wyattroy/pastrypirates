---
phase: 10-app-state-de-globalization
plan: 02
subsystem: infra
tags: [de-globalization, determinism, replay, code-migration]

# Dependency graph
requires:
  - phase: 10-app-state-de-globalization (10-01)
    provides: "scripts/lib/js_region_tokenizer.js, scripts/migrate_app_state.js, src/state/index.js (appState), the appState naming decision"
provides:
  - "index.html: replaying, dlog, dlogIdx, dlogN, evIdx, resumeEvLen, resumeReadFailed fully migrated to appState.NAME"
  - "A second, distinct scope-collision precedent (local function parameter shadowing an app-state name) — the fix pattern (rename the local shadow, not the bridge) for 10-03..10-06 to watch for"
affects: [10-03, 10-04, 10-05, 10-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "When the mechanical migration tool rewrites a local function *parameter* that happens to share a name with an app-state name, it produces invalid JS (`function f(appState.name){}`). The migration tool has no scope analysis by design (10-01's rationale for choosing `appState` over `state` applies identically here) — so every migration wave must line-review its diff for exactly this shape, not just trust `--check-names`/`--extract-strings` green."

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "replayShortfall()'s local parameter, originally named `resumeEvLen` (deliberately matching the module-level name for readability, and shadowing it inside the function body), was renamed to `priorEvLen` rather than special-casing the migration tool. This mirrors the 10-01 `state`->`appState` precedent: fix the local collision, don't touch the tool's scope-blind design or the global name. The rename is function-local only (2 read sites) and does not affect the caller (`replayShortfall(game.events.length, appState.resumeEvLen, appState.resumeReadFailed)`, already correctly migrated) or scripts/dlog_replay_test.js (calls positionally, never by parameter name)."

patterns-established:
  - "Pattern: after any `--migrate` run, `node --check` the extracted classic-script region (not just run the corpus/replay tests) — a parameter-name collision produces a SyntaxError that a determinism check alone wouldn't explain as clearly."

requirements-completed: []  # GLOBAL-01 partially addressed (7 of 46 names migrated); not marked complete until 10-06 finishes the bulk migration.

coverage:
  - id: D1
    description: "The 7 replay/resume control-flow names (replaying, dlog, dlogIdx, dlogN, evIdx, resumeEvLen, resumeReadFailed) migrated to appState.NAME at every read/write site, with read/write ordering and postfix-++ timing provably unchanged"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "node scripts/migrate_app_state.js --check-names replaying,dlog,dlogIdx,dlogN,evIdx,resumeEvLen,resumeReadFailed"
        status: pass
      - kind: unit
        ref: "diff <(node scripts/migrate_app_state.js --extract-strings HEAD:index.html) <(node scripts/migrate_app_state.js --extract-strings index.html) — empty"
        status: pass
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (30/30 seeds)"
        status: pass
      - kind: integration
        ref: "node scripts/dlog_replay_test.js"
        status: pass
      - kind: other
        ref: "npm test (full suite: determinism, engine_contract_check, dlog_replay_test, net_registry_test, net_contract_check)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Corpus stays frozen at 1 commit deep — no --capture was ever run"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l  ->  1"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-24
status: complete
---

# Phase 10 Plan 02: Replay/Resume Control-Flow Migration Summary

**Migrated the 7 determinism-load-bearing replay/resume control-flow names (`replaying, dlog, dlogIdx, dlogN, evIdx, resumeEvLen, resumeReadFailed`) to `appState.NAME` via the tokenizer-based tool, fixing a scope-collision SyntaxError the mechanical rewrite introduced along the way.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-24T22:10Z (approx, following 10-01 completion)
- **Completed:** 2026-07-24T22:14Z
- **Tasks:** 1 (automated)
- **Files modified:** 1

## Accomplishments

- Ran `node scripts/migrate_app_state.js --migrate replaying,dlog,dlogIdx,dlogN,evIdx,resumeEvLen,resumeReadFailed` — rewrote every identifier-position read/write site in `index.html`'s classic-script region to `appState.NAME`, including all 5 postfix-`++` sites (`appState.dlogIdx++`, `appState.dlogN++`) verbatim in-place, with no reordering.
- Found and fixed a genuine bug the mechanical migration introduced: `replayShortfall()`'s own local parameter (named `resumeEvLen`, deliberately shadowing the module-level name) was blindly rewritten to `appState.resumeEvLen` — an invalid JS parameter name, hard SyntaxError. Renamed the local parameter to `priorEvLen` (function-scoped, 2 sites) rather than altering the migration tool or the app-state name.
- Verified byte-safety (`--extract-strings` diff empty), zero remaining bare occurrences (`--check-names` clean), determinism corpus 30/30, `dlog_replay_test.js` passing, and the full `npm test` suite green.
- Confirmed via `state_contract_check.js` that none of these 7 names appear in its (currently expected-red, by 10-01's design) failure list for the remaining 39 un-migrated names.

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate the replay/resume control-flow names** - `bdb8960` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `index.html` - `replaying, dlog, dlogIdx, dlogN, evIdx, resumeEvLen, resumeReadFailed` migrated to `appState.NAME` at every read/write site; `replayShortfall()`'s colliding local parameter renamed `resumeEvLen` -> `priorEvLen`.

## Decisions Made

- **Renamed the colliding local parameter, not the bridge or the tool.** `replayShortfall(rebuiltEvLen, resumeEvLen, readFailed)` had a local parameter matching one of the 7 migrated names, causing the migration tool (which has no scope analysis, by 10-01's explicit design) to rewrite the parameter declaration itself into invalid JS. Fixed by renaming the local parameter to `priorEvLen` — the same class of fix as 10-01's `state`->`appState` collision, but applied to a local shadow instead of the global name. The function's two internal reads of the parameter were updated to match; its caller (already `appState.resumeEvLen`-qualified) and `scripts/dlog_replay_test.js` (calls positionally) needed no changes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Migration tool rewrote a local function parameter into invalid JS**
- **Found during:** Task 1, reviewing the diff line-by-line per the plan's explicit instruction to check the fast-forward decision resolvers
- **Issue:** `function replayShortfall(rebuiltEvLen, resumeEvLen, readFailed){...}` (index.html:4003) declares a local parameter `resumeEvLen` that intentionally shadows the module-level `resumeEvLen` inside the function body (the caller passes the app-state value in explicitly as an argument). `scripts/migrate_app_state.js` has no scope analysis — this is the identical limitation 10-01's SUMMARY documented for the `state`/`appState` naming collision, but manifesting here as a parameter *declaration* rather than a variable reference. The `--migrate` run rewrote the parameter declaration itself to `appState.resumeEvLen`, which is not a legal JS parameter name — `node --check` on the extracted region threw `SyntaxError: Unexpected token '.'` immediately.
- **Fix:** Renamed the local parameter from `resumeEvLen` to `priorEvLen` at its declaration and its 1 internal read site (`Math.max(0, priorEvLen - rebuiltEvLen)`), leaving the already-correctly-migrated call site (`replayShortfall(game.events.length, appState.resumeEvLen, appState.resumeReadFailed)`) untouched. Confirmed no other of the 7 migrated names has a colliding local parameter or arrow-function parameter anywhere in the pre-migration file (`git show HEAD:index.html | grep -nE 'function\s+\w*\s*\([^)]*\b(replaying|dlog|dlogIdx|dlogN|evIdx|resumeEvLen|resumeReadFailed)\b[^)]*\)'` and an arrow-parameter grep both returned only this one hit) and confirmed `scripts/dlog_replay_test.js` calls `replayShortfall` positionally (never by parameter name), so the rename is fully internal and safe.
- **Files modified:** `index.html`
- **Verification:** `node --check` on the extracted classic-script region passes post-fix (failed pre-fix); `--check-names` for all 7 names exits 0 (the renamed parameter no longer triggers a false-positive "bare occurrence" of `resumeEvLen` either); `--extract-strings` byte-safety diff stayed empty throughout (the rename touches only code, not strings/comments); `determinism_baseline.js --verify` 30/30; `dlog_replay_test.js` passes, including its `replayShortfall(...)` positional-argument test cases; full `npm test` suite green.
- **Committed in:** `bdb8960` (Task 1 commit) — fix developed and verified together with the migration before committing; no broken intermediate state was ever committed.

---

**Total deviations:** 1 auto-fixed (Rule 1 — broken behavior, not architectural)
**Impact on plan:** Essential for correctness — the migration as generated by the tool alone would not have parsed. No scope creep: only the 7 assigned names were touched, plus the one function-local parameter their migration forced a fix onto. De-risks 10-03 through 10-06, which should watch for the same local-parameter-shadowing shape when migrating the remaining 39 names.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 7 of 46 app-state names now migrated (`room` from 10-01, plus these 7); 39 remain for 10-03 through 10-06.
- `scripts/state_contract_check.js` remains expected-red on the 39 un-migrated names' declaration/bare-usage assertions — confirmed none of this plan's 7 names appear in its failure output.
- **New pattern to carry forward:** future migration waves (10-03..10-06) must line-review their diffs for local function/arrow parameters that shadow an app-state name — the migration tool will rewrite a shadowing parameter declaration into invalid JS exactly as it did here, and `--check-names`/`--extract-strings` alone would not have caught it before a `node --check` or a full test run.
- No blockers.

---
*Phase: 10-app-state-de-globalization*
*Completed: 2026-07-24*

## Self-Check: PASSED
