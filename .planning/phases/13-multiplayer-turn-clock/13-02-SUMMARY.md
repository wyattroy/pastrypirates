---
phase: 13-multiplayer-turn-clock
plan: 02
subsystem: infra
tags: [localstorage, boot, session-persistence, schema-versioning, multiplayer]

# Dependency graph
requires:
  - phase: 13-multiplayer-turn-clock (plan 01)
    provides: host-authoritative pause sync (paused Firebase node, setClockUI wiring)
provides:
  - "SESSION_SCHEMA_V / SOLO_SCHEMA_V schema-version constants stamped onto pp_sess/pp_solo at write time"
  - "boot() version-guard that clears an unversioned/mismatched pp_sess or pp_solo before any resume is attempted"
affects: [13-multiplayer-turn-clock (plan 03), future localStorage-blob-shape changes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-blob schema-version stamp (v: field) checked at boot with a null-safe strict !== comparison, clearing only the specific blob that fails its own check via the existing clearSession()/clearSoloState() — never a blanket localStorage clear"

key-files:
  created: []
  modified:
    - src/ui/util.js
    - src/orchestrator.js

key-decisions:
  - "Two independent schema-version constants (SESSION_SCHEMA_V, SOLO_SCHEMA_V) rather than one shared build-version constant, so pp_sess and pp_solo can evolve on separate schedules without an unrelated deploy wiping both"
  - "pp_id and pp_timerOff are structurally excluded from the version-guard mechanism (D-03) — the guard never reads, versions, or clears them"

patterns-established:
  - "localStorage resumable-state blobs are versioned at the point of write (saveSession/saveSoloState) and validated at the point of read (boot()), immediately after JSON.parse and before any resume decision"

requirements-completed: [CLOCK-01]

coverage:
  - id: D1
    description: "pp_sess/pp_solo are stamped with a numeric schema-version field (v:) on every write, alongside all pre-existing fields"
    requirement: CLOCK-01
    verification:
      - kind: unit
        ref: "node scripts/determinism_baseline.js --verify (30/30 PASS after Task 1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "boot() clears an unversioned or mismatched pp_sess/pp_solo via the existing clearSession()/clearSoloState() before any resume attempt, while a current-version blob still resumes unchanged; pp_id/pp_timerOff are never touched by the guard"
    requirement: CLOCK-01
    verification:
      - kind: unit
        ref: "node scripts/determinism_baseline.js --verify (30/30 PASS after Task 2, SOURCE unchanged)"
        status: pass
      - kind: unit
        ref: "npm test (full suite: determinism, engine contract, dlog replay, net registry/contract, state contract, module graph, ui contract, no-undef) exit 0"
        status: pass
      - kind: other
        ref: "scratchpad/guard_check.mjs — isolated logic replay of the exact guard code against 7 cases (unversioned pp_sess/pp_solo cleared+not-resumed, versioned pp_sess/pp_solo resumed, idempotent re-run of a versioned blob, malformed non-object blob falls through without throwing, empty-object blob cleared)"
        status: pass
    human_judgment: true
    rationale: "The plan's <verify> specifies an MCP/manual browser check (setting localStorage keys directly and reloading the page) per 13-VALIDATION.md's Manual-Only table — no browser/MCP tool was available in this sequential-executor session. Isolated logic replay of the identical guard code confirms behavioral correctness against all 4 required scenarios (unversioned cleared, versioned resumes, pp_id/pp_timerOff untouched, idempotent), but an actual in-browser boot-sequence check is still recommended before this fix is considered fully closed out for the live game."

# Metrics
duration: ~15min
completed: 2026-07-26
status: complete
---

# Phase 13 Plan 02: Boot Hardening Against Stale Session State Summary

**pp_sess/pp_solo now carry a schema-version stamp (v:) checked at boot — a returning pre-refactor player's unversioned blob is cleared automatically before any resume is attempted, while a current-version in-progress game still resumes untouched.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-07-26T03:21:02Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` constants (both `1`) in `src/ui/util.js`; `saveSession()` and `saveSoloState()` now stamp their JSON payload with `v:` alongside all existing fields
- `boot()` in `src/orchestrator.js` now checks each blob's `v` immediately after its `JSON.parse`, before any existing resume-decision logic — a blob with no `v` (pre-refactor) or a mismatched `v` is cleared via the existing `clearSession()`/`clearSoloState()` and treated as absent
- Self-resolves the CLOCK-01 stall: a returning old-version player now boots clean (clock running, no timer off/on toggle workaround needed) instead of attempting an invalid resume against stale local state
- `pp_id` and `pp_timerOff` are never read, versioned, or cleared by the new guard (D-03) — device identity and remembered timer preference survive unchanged

## Task Commits

Each task was committed atomically:

1. **Task 1: Stamp pp_sess/pp_solo with a schema version on write** - `9a9fceb` (feat)
2. **Task 2: Guard boot() — clear a stale/mismatched pp_sess/pp_solo before any resume** - `95eab05` (feat)

_Note: no plan-metadata commit follows per this task's execution instructions — the orchestrator handles STATE.md/ROADMAP.md updates and the final metadata commit centrally._

## Files Created/Modified
- `src/ui/util.js` - Added `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` constants; `saveSession()`/`saveSoloState()` now write a `v:` field
- `src/orchestrator.js` - `boot()` gained two version-guard branches (pp_sess, pp_solo) placed before the existing resume checks; imports the two new constants from `./ui/index.js`

## Decisions Made
- Two independent schema-version constants rather than one shared "build version" — pp_sess and pp_solo evolve on separate schedules (multiplayer resume vs. solo resume are different code paths), matching RESEARCH.md Pattern 3's Alternatives Considered analysis
- Guard placement is immediately after each blob's own `JSON.parse`, before the pre-existing `!sess||!sess.room` / `solo.seed!=null` checks, so a failing blob is nulled before the existing downstream logic ever sees it — satisfies the plan's "synchronous, before resume, before Firebase init" backstop truth

## Deviations from Plan

None - plan executed exactly as written. Both tasks matched RESEARCH.md Pattern 3's "Recommended implementation" code verbatim (constant names, guard placement, null-safe `!==` comparison style).

## Issues Encountered

No browser/MCP tool was available in this sequential-executor session to run the plan's `<human-check>` MCP/manual boot-sequence verification (setting `pp_sess`/`pp_solo` in a real browser's `localStorage` and reloading). This was substituted with:
1. An isolated logic replay (`scratchpad/guard_check.mjs`, not committed — scratch-only) that runs the exact guard code added to `boot()` against 7 constructed cases: unversioned pp_sess (cleared, not resumed), versioned pp_sess with a room (resumed, not cleared), unversioned pp_solo (cleared, not resumed), versioned pp_solo (resumed), idempotent re-run of a versioned blob (same outcome, not re-cleared), a malformed non-object blob (falls through safely, no throw), and an empty-object blob (cleared). All 7 matched expected behavior.
2. Full automated suite: `node scripts/determinism_baseline.js --verify` (30/30 PASS, SOURCE unchanged, both before and after Task 2) and `npm test` (full suite — determinism, engine contract, dlog replay, net registry/contract, state contract, module graph, ui contract, no-undef — exit 0).

An actual in-browser verification (per 13-VALIDATION.md's Manual-Only table) is still recommended before considering this fix fully closed for the live game — flagged in the `coverage` block above (`D2`, `human_judgment: true`) so it surfaces in any downstream UAT/verify pass.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- CLOCK-01 is complete; `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` are available as the new-symbols artifact for 13-03 (clickable resume-button plan) if it needs to reference session state
- Determinism baseline (30/30) and full `npm test` suite are green; no engine-adjacent changes were made
- Recommend an in-browser/MCP boot-sequence spot-check (the plan's original `<human-check>`) at the next available opportunity, per the Issues Encountered note above

---
*Phase: 13-multiplayer-turn-clock*
*Completed: 2026-07-26*
