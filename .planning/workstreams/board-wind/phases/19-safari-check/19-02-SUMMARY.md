---
phase: 19-safari-check
plan: 02
subsystem: testing
tags: [npm-test, contract-check, wind-dot, safari, determinism]

# Dependency graph
requires:
  - phase: 19-safari-check (plan 01)
    provides: branch served on port 8934, Safari run protocol
provides:
  - "scripts/wind_dot_contract_check.js — Wave 0 mechanical guard on the compositor-only contract (BUG-01), the determinism contract (D-12), workstream file ownership (D-14), and the pure-half math contract for the not-yet-built wind-dot prototype"
  - "The guard wired into npm test, immediately after ui_contract_check.js"
affects: [19-safari-check plan 03+, any future plan that adds the WIND DOT PROTOTYPE region to src/ui/board.js]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Absence-tolerant contract guard: a standing check written BEFORE the code it guards exists, PASSing with an explicit '(region not present yet)' note until the guarded symbols appear"
    - "Region extraction on raw text before comment-stripping, since the extraction markers are themselves block comments"

key-files:
  created: []
  modified:
    - package.json

key-decisions:
  - "Task 2's blocked precondition (npm test green) was resolved by the orchestrator outside this plan's file scope, not by any change this plan made — see Deviations"

patterns-established: []

requirements-completed: [WIND-00]

coverage:
  - id: D1
    description: "wind_dot_contract_check.js runs as part of npm test, positioned immediately after ui_contract_check.js and before no_undef_check.js"
    requirement: "WIND-00"
    verification:
      - kind: unit
        ref: "npm test (full chain, exit code)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The determinism fixture corpus (scripts/fixtures) is untouched by wiring the guard into npm test"
    requirement: "WIND-00"
    verification:
      - kind: unit
        ref: "git status --porcelain scripts/fixtures (empty output)"
        status: pass
    human_judgment: false

# Metrics
duration: 8min
completed: 2026-08-01
status: complete
---

# Phase 19 Plan 02: Wind-dot contract guard wired into npm test Summary

**Added `scripts/wind_dot_contract_check.js` (six absence-tolerant assertions + `--drill` red-proof mode) to the Wave 0 npm test chain, guarding the not-yet-built wind-dot prototype against BUG-01-class Safari regressions before any of its code exists.**

## Performance

- **Duration:** 8 min (this continuation session; Task 1 was executed and verified in a prior session)
- **Started:** 2026-08-01T03:58:00Z (resume point)
- **Completed:** 2026-08-01T04:06:17Z
- **Tasks:** 2 (Task 1 completed in a prior session, Task 2 completed in this session)
- **Files modified:** 1 (`package.json`) in this session; `scripts/wind_dot_contract_check.js` created in the prior session (commit `7b0502d`)

## Accomplishments
- `scripts/wind_dot_contract_check.js` exists with six PASS assertions (region integrity, compositor-only contract, determinism contract, workstream file ownership, off-by-default, pure-half math), all currently reporting `(region not present yet)` since the wind-dot prototype code does not exist yet
- `--drill` mode red-proofs every assertion against a synthetic violation plus a negative control
- The guard is wired into `npm test`, immediately after `node scripts/ui_contract_check.js` and before `node scripts/no_undef_check.js`
- `npm test` exits 0 with 23/23 assertion groups passing and zero changes to `scripts/fixtures` (the 31-seed determinism corpus)

## Task Commits

Each task was committed atomically:

1. **Task 1: Write scripts/wind_dot_contract_check.js with six assertions and a --drill mode** - `7b0502d` (feat) — completed in a prior session
2. **Task 2: Wire the guard into npm test** - `07ce920` (feat)

**Plan metadata:** (this commit) - `docs: complete plan`

## Files Created/Modified
- `scripts/wind_dot_contract_check.js` - Wave 0 mechanical guard (created in prior session, Task 1)
- `package.json` - inserted `node scripts/wind_dot_contract_check.js` into the `test` script chain, immediately after `ui_contract_check.js`

## Decisions Made
- None new in this session - followed the plan as written for Task 2

## Deviations from Plan

### Auto-fixed Issues

**1. [Precondition blocker, resolved outside this plan's scope] npm test was red for a pre-existing, unrelated reason**
- **Found during:** Task 2 (precondition check: "`npm test` is green on this branch before the new script is added")
- **Issue:** A prior executor found `npm test` red before starting Task 2 and correctly halted rather than treating the precondition as met. The break was pre-existing and unrelated to phase 19: `art-review/narration-audit.html:1156-1157` and `scripts/narration_audit_check.js:1214` both fetched phase 15's review JSON files from `.planning/phases/15-narration-audit-fixes/`, a path that commit `d5189c2` (the v1.2 milestone archive) relocated to `.planning/milestones/v1.2-phases/15-narration-audit-fixes/`. The hardcoded path was never updated after the archive, and `narration_audit_check.js`'s `readJson` swallowed the miss via its catch, silently skipping assertion 8 (the 209-disposition migration check) since the archive landed.
- **Fix:** The orchestrator fixed both call sites in commit `4546c82`, making them try the archived home first and the pre-archive home second, since branches in this repo sit on both sides of `d5189c2` and a single hardcoded path is only ever correct on one side. This fix is outside this plan's declared file scope (`scripts/wind_dot_contract_check.js`, `package.json`) and outside the board-wind workstream's D-14 file ownership — it touches `scripts/narration_audit_check.js`, owned by a different workstream. It was recorded in `.planning/WINDOWS.md` as deviation id 3, status `fixed`, with an explicit flag for Wyatt that another workstream's files were touched while he was asleep.
- **Files modified:** `art-review/narration-audit.html`, `scripts/narration_audit_check.js` (both by the orchestrator, not by this plan)
- **Verification:** `npm test` now exits 0 with 23/23 assertion groups passing (was 22/23 before the fix) and zero changes to `scripts/fixtures`; this was independently re-confirmed at the start of this session before Task 2 proceeded.
- **Committed in:** `4546c82` (orchestrator commit, prior to this session; not a task commit of this plan)

---

**Total deviations:** 1 (precondition blocker, resolved by the orchestrator outside this plan's scope)
**Impact on plan:** None on this plan's own deliverables — `scripts/wind_dot_contract_check.js` and `package.json` are exactly as specified. The only effect was a delay between Task 1 and Task 2 while the unrelated pre-existing break was fixed.

## Issues Encountered
None in this session — the precondition blocker documented above was resolved before this session started, and Task 2 executed cleanly against the confirmed green baseline.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The Wave 0 mechanical guard is live on every `npm test` run, ready to catch a BUG-01-class regression, an unseeded RNG source, a cross-workstream file collision, or an on-by-default prototype the moment the wind-dot code lands in a later plan.
- No blockers for subsequent plans in phase 19-safari-check.

---
*Phase: 19-safari-check*
*Completed: 2026-08-01*

## Self-Check: PASSED

- FOUND: scripts/wind_dot_contract_check.js
- FOUND: commit 7b0502d (Task 1)
- FOUND: commit 07ce920 (Task 2)
- FOUND: commit 4546c82 (orchestrator's precondition-unblocking fix)
- FOUND: .planning/workstreams/board-wind/phases/19-safari-check/19-02-SUMMARY.md
