---
phase: 10-app-state-de-globalization
plan: 03
subsystem: infra
tags: [de-globalization, networking, firebase, multiplayer, code-migration]

# Dependency graph
requires:
  - phase: 10-app-state-de-globalization (10-01)
    provides: "scripts/lib/js_region_tokenizer.js, scripts/migrate_app_state.js, src/state/index.js (appState), the appState naming decision"
  - phase: 10-app-state-de-globalization (10-02)
    provides: "the local-parameter-shadowing failure mode + the fix pattern (rename the local, not the bridge)"
provides:
  - "index.html: db, myId, mySeat, isHost, roster, turnOrder, numSeats, passAndPlay, soloMeta fully migrated to appState.NAME at every read/write site"
  - "All ~27 src/net/ call sites proven to pass appState.db/appState.room/appState.mySeat/etc. as arguments, resolving current values at call time (D-07)"
  - "Confirmed the isHost (10 sites) and mySeat (10 sites) write clusters are fully appState.-qualified — no missed write silently desyncing host authority or seat identity"
affects: [10-04, 10-05, 10-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Net call-site freshness proven by construction: because the tokenizer-based migration rewrites identifier-position occurrences (including call arguments) uniformly, every netWatch*/netWrite*/netRead* invocation that used to read a bare db/myId/mySeat/isHost now reads appState.db/appState.myId/appState.mySeat/appState.isHost — the same property-access mechanism that made room's tracer migration (10-01) live-observable also makes these 9 names' call-site values live, with no special-casing needed."

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "No local parameter/const collisions found for any of the 9 names before migrating — grepped for both function-parameter and arrow-parameter shapes plus local let/const declarations; each of the 9 names has exactly one top-level declaration site (the shared `let db=null, myId=null, room=null, mySeat=null, isHost=false, roster=null;` / `let turnOrder=null;` / `let numSeats=4,...` / `let passAndPlay=false,...` / `let soloMeta=null;` cluster) and zero shadowing local bindings anywhere else in the file, so this plan needed none of 10-02's rename-the-local fix."

patterns-established: []

requirements-completed: []  # GLOBAL-01 partially addressed (17 of 46 names migrated: room + 7 from 10-02 + 9 here); not marked complete until 10-06 finishes the bulk migration.

coverage:
  - id: D1
    description: "The 9 net-consumed identity/session names (db, myId, mySeat, isHost, roster, turnOrder, numSeats, passAndPlay, soloMeta) migrated to appState.NAME at every read/write site in index.html"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "node scripts/migrate_app_state.js --check-names db,myId,mySeat,isHost,roster,turnOrder,numSeats,passAndPlay,soloMeta"
        status: pass
      - kind: unit
        ref: "diff <(node scripts/migrate_app_state.js --extract-strings HEAD:index.html) <(node scripts/migrate_app_state.js --extract-strings index.html) — empty"
        status: pass
      - kind: other
        ref: "node --check on the extracted classic-script region (syntax validation)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every src/net/ call site (~27 netWatch*/netWrite*/netRead* invocations) now passes the CURRENT appState.* value at call time — no stale bare db/myId/mySeat/isHost argument remains (D-07)"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "grep -cE \"netWatch[A-Za-z]+\\(db\\b|netWrite[A-Za-z]+\\(db\\b|netRead[A-Za-z]+\\(db\\b\" index.html — 0"
        status: pass
      - kind: unit
        ref: "manual diff review: 27 net call sites reading appState.db, isHost cluster (10 sites), mySeat cluster (10 sites), roster (7 sites), passAndPlay (2 sites), soloMeta (4 sites), turnOrder (3 sites), myId (1 site) all appState.-qualified"
        status: pass
    human_judgment: false
  - id: D3
    description: "src/net/*.js remains free of app-state references and the determinism corpus stays 30/30"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "node scripts/net_contract_check.js — 5/5 PASS"
        status: pass
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify — 30/30 seeds"
        status: pass
      - kind: other
        ref: "npm test (full suite) — exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "Corpus stays frozen at 1 commit deep — no --capture was ever run"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l  ->  1"
        status: pass
    human_judgment: false

# Metrics
duration: ~10min
completed: 2026-07-24
status: complete
---

# Phase 10 Plan 03: Net-Consumed Identity/Session Migration Summary

**Migrated the 9 identity/session names consumed by src/net/'s call sites (`db, myId, mySeat, isHost, roster, turnOrder, numSeats, passAndPlay, soloMeta`) to `appState.NAME`, proving all ~27 net transport call sites now resolve live state at call time rather than stale bare bindings.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-07-24T22:15Z (approx, following 10-02 completion)
- **Completed:** 2026-07-24T22:24Z
- **Tasks:** 1 (automated)
- **Files modified:** 1

## Accomplishments

- Grepped for local parameter/const collisions with all 9 names before migrating (per 10-02's precedent) — found zero; each name has exactly one top-level declaration site and no shadowing local binding anywhere in the file.
- Ran `node scripts/migrate_app_state.js --migrate db,myId,mySeat,isHost,roster,turnOrder,numSeats,passAndPlay,soloMeta` — rewrote every identifier-position read/write site to `appState.NAME`, including all net call-site arguments.
- `node --check` on the extracted classic-script region passed cleanly (no scope-collision SyntaxError this wave).
- Confirmed all ~27 `netWatch*/netWrite*/netRead*` call sites now pass `appState.db`, `appState.room`, `appState.mySeat`, `appState.myId` as live arguments — `grep -c` for any remaining bare-`db` net call argument returns 0.
- Diff-reviewed and confirmed the full write-site cluster counts match the plan's inventory exactly: `isHost` 10 sites, `mySeat` 10 sites, `roster` 7 sites, `passAndPlay` 2 sites, `soloMeta` 4 sites, `turnOrder` 3 sites, `myId` 1 site — all `appState.`-qualified.
- Verified byte-safety (`--extract-strings` diff empty), zero remaining bare occurrences (`--check-names` clean for all 9), `net_contract_check.js` 5/5 PASS (src/net/ still has zero app-state references, unchanged by this plan since only index.html call-site arguments were touched), determinism corpus 30/30, and the full `npm test` suite green.
- Confirmed via `state_contract_check.js` that none of these 9 names appear in its (currently expected-red, by 10-01's design) failure list for the remaining un-migrated names.

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate the net-consumed identity/session names and prove call-site freshness** - `cf23a32` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `index.html` - `db, myId, mySeat, isHost, roster, turnOrder, numSeats, passAndPlay, soloMeta` migrated to `appState.NAME` at every read/write site, including all ~27 `src/net/` call-site arguments.

## Decisions Made

- No local-parameter-shadowing collision existed for any of the 9 names in this wave (unlike 10-02's `resumeEvLen`), so no rename-the-local fix was needed. Confirmed by grep before migrating, not just discovered after a SyntaxError.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 17 of 46 app-state names now migrated (`room` from 10-01, 7 replay/resume names from 10-02, plus these 9); 29 remain for 10-04 through 10-06.
- `scripts/state_contract_check.js` remains expected-red on the 29 un-migrated names' declaration/bare-usage assertions — confirmed none of this plan's 9 names appear in its failure output.
- Net call-site freshness (D-07) is now proven for all 5 names D-07 specifically calls out (`db, myId, room, mySeat, isHost`) plus 4 more (`roster, turnOrder, numSeats, passAndPlay, soloMeta`) that ride along in the same net-consumed cluster.
- No blockers.

---
*Phase: 10-app-state-de-globalization*
*Completed: 2026-07-24*

## Self-Check: PASSED
