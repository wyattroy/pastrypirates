---
phase: 10-app-state-de-globalization
plan: 04
subsystem: infra
tags: [de-globalization, shot-clock, multiplayer, code-migration]

# Dependency graph
requires:
  - phase: 10-app-state-de-globalization (10-01)
    provides: "scripts/lib/js_region_tokenizer.js, scripts/migrate_app_state.js, src/state/index.js (appState), the appState naming decision"
  - phase: 10-app-state-de-globalization (10-02)
    provides: "the local-parameter-shadowing failure mode + the fix pattern (rename the local, not the bridge)"
  - phase: 10-app-state-de-globalization (10-03)
    provides: "9 net-consumed identity/session names migrated (db, myId, mySeat, isHost, roster, turnOrder, numSeats, passAndPlay, soloMeta)"
provides:
  - "index.html: 26 shot-clock/timer-control and live/prompt/turn bookkeeping names fully migrated to appState.NAME at every read/write site"
  - "revealMyRecipe confirmed to remain a reachable top-level function declaration; its one body write (recipeRevealed) migrated to appState.recipeRevealed — the inline onclick=\"revealMyRecipe()\" attribute (index.html:1731) still resolves it in global scope (GLOBAL-02)"
  - "The shotClockTimer setInterval handle proven correct end-to-end: every clearInterval/setInterval site now reads/writes appState.shotClockTimer, no stale bare-handle interval remains"
affects: [10-05, 10-06, 10-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "For interval/timeout-handle app-state names (shotClockTimer), verify correctness via a precise LHS-anchored grep (`[^.]NAME\\s*=`) rather than trusting a plan-authored acceptance-criteria regex whose second alternation may match an unrelated always-present call-site substring."

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "No local parameter/const collisions existed for any of the 26 names in this plan (unlike 10-02's resumeEvLen) — grepped for both function-parameter and arrow-parameter shapes, plus local let/const declarations, before migrating each cluster; each name has exactly one top-level declaration site (the shot-clock cluster's multi-declarator let statements at 2015-2041, and the live/prompt cluster's declarations at 2015-2018/3900/3903/2527/4590) and zero shadowing local bindings anywhere else in the file."
  - "setActor(s){curSeat=s;} correctly migrated to setActor(s){appState.curSeat=s;} — the tool distinguished the local parameter `s` from the app-state name `curSeat` with no special-casing needed, confirming 10-03's finding that the tokenizer's scope-blind design only fails when the LOCAL name is IDENTICAL to the app-state name (10-02's resumeEvLen collision), not merely nearby."

patterns-established: []

requirements-completed: []  # GLOBAL-01 partially addressed (43 of 46 names migrated: room + 7 + 9 + 26 across 10-01..10-04); GLOBAL-02 verified for the one inline handler. Not marked complete in REQUIREMENTS.md until 10-05/10-06 finish the remaining 3 names (game, timer, logLines).

coverage:
  - id: D1
    description: "The 13 shot-clock/timer-control names (shotClockSeat, shotClockDeadline, shotClockTimer, shotClockForce, shotClockStash, shotClockPaused, shotClockPauseElapsed, timerOff, shotClockFired, turnExpired, clockState, activePickCleanup, curSeat) migrated to appState.NAME at every read/write site, with the shotClockTimer setInterval/clearInterval handle correctness explicitly proven"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "node scripts/migrate_app_state.js --check-names shotClockSeat,shotClockDeadline,shotClockTimer,shotClockForce,shotClockStash,shotClockPaused,shotClockPauseElapsed,timerOff,shotClockFired,turnExpired,clockState,activePickCleanup,curSeat"
        status: pass
      - kind: unit
        ref: "diff <(node scripts/migrate_app_state.js --extract-strings HEAD:index.html) <(node scripts/migrate_app_state.js --extract-strings index.html) — empty"
        status: pass
      - kind: other
        ref: "node --check on the extracted classic-script region (syntax validation)"
        status: pass
      - kind: unit
        ref: "grep -cE \"clearInterval\\(shotClockTimer\\)\" index.html — 0 (precise LHS check; see Deviations for the plan's own imprecise acceptance grep)"
        status: pass
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (30/30 seeds)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The 13 live/prompt/turn bookkeeping names (live, liveDone, liveGen, inBattlePrompt, spectatingBattle, activeTurnSeat, recipeRevealed, gameStarted, evPushed, appliedMeta, promptCounter, syncBoardRAF, lastChatSendAt) migrated to appState.NAME at every read/write site"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "node scripts/migrate_app_state.js --check-names live,liveDone,liveGen,inBattlePrompt,spectatingBattle,activeTurnSeat,recipeRevealed,gameStarted,evPushed,appliedMeta,promptCounter,syncBoardRAF,lastChatSendAt"
        status: pass
      - kind: unit
        ref: "diff <(node scripts/migrate_app_state.js --extract-strings HEAD:index.html) <(node scripts/migrate_app_state.js --extract-strings index.html) — empty"
        status: pass
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (30/30 seeds)"
        status: pass
    human_judgment: false
  - id: D3
    description: "revealMyRecipe stays a top-level function declaration (not converted to a const arrow), remaining reachable by the inline onclick attribute; its body write migrated to appState.recipeRevealed"
    requirement: "GLOBAL-02"
    verification:
      - kind: unit
        ref: "grep -cE \"^\\s*function revealMyRecipe\\(\" index.html — 1"
        status: pass
      - kind: unit
        ref: "grep -c \"onclick=\\\"revealMyRecipe()\\\"\" index.html — 1 (byte-identical template string)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Full npm test suite (determinism, engine_contract_check, dlog_replay_test, net_registry_test, net_contract_check) stays green; corpus stays frozen at 1 commit deep"
    requirement: "GLOBAL-01"
    verification:
      - kind: other
        ref: "npm test — exit 0"
        status: pass
      - kind: unit
        ref: "git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l  ->  1"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-24
status: complete
---

# Phase 10 Plan 04: Shot-Clock/Timer-Control + Live/Prompt/Turn Bookkeeping Migration Summary

**Migrated the 26-name shot-clock/timer-control and live/prompt/turn bookkeeping clusters to `appState.NAME`, explicitly proving the `shotClockTimer` interval-handle teardown is correct and confirming `revealMyRecipe` remains a reachable top-level `function` declaration for GLOBAL-02.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-24T22:20Z (approx, following 10-03 completion)
- **Completed:** 2026-07-24T22:25Z
- **Tasks:** 2 (both automated)
- **Files modified:** 1

## Accomplishments

- Ran `node scripts/migrate_app_state.js --migrate` for the 13-name shot-clock/timer-control cluster (`shotClockSeat, shotClockDeadline, shotClockTimer, shotClockForce, shotClockStash, shotClockPaused, shotClockPauseElapsed, timerOff, shotClockFired, turnExpired, clockState, activePickCleanup, curSeat`) — rewrote every identifier-position read/write site to `appState.NAME`, including all 8 `shotClockTimer` sites (5 assignment, 3 `clearInterval` teardown) and `setActor(s){curSeat=s;}`'s assignment.
- Verified, by direct grep of every `clearInterval(appState.shotClockTimer)`/`appState.shotClockTimer=setInterval(...)` line, that the interval handle's teardown is correct at all 3 clear sites (`stopShotClock`, `toggleShotClockPause`'s pause branch, `expireShotClock`) and all 3 (re)arm sites (`startShotClock`, `rearmShotClock`, `toggleShotClockPause`'s resume branch) — no stale bare-handle interval remains.
- Ran `node scripts/migrate_app_state.js --migrate` for the 13-name live/prompt/turn bookkeeping cluster (`live, liveDone, liveGen, inBattlePrompt, spectatingBattle, activeTurnSeat, recipeRevealed, gameStarted, evPushed, appliedMeta, promptCounter, syncBoardRAF, lastChatSendAt`) — rewrote every identifier-position site, including the multiple `activeTurnSeat=null;recipeRevealed=false;` re-lock points scattered through `humanTurn()`.
- Confirmed `function revealMyRecipe(){appState.recipeRevealed=true;liveRender();}` (index.html:4309) is still a `function` declaration — its enclosing keyword form untouched, only its body's `recipeRevealed=true` write migrated — and the inline `onclick="revealMyRecipe()"` template string at index.html:1731 is byte-identical (confirmed via the tokenizer's `--extract-strings` byte-safety diff, which stayed empty across both tasks).
- Grepped both clusters for local function-parameter/arrow-parameter shadowing and local `let`/`const` collisions before migrating (per 10-02's precedent) — found zero for all 26 names; no rename-the-local fix was needed this wave.
- `node --check` on the extracted classic-script region passed cleanly after each task (no scope-collision SyntaxError).
- Verified byte-safety (`--extract-strings` diff empty after each task), zero remaining bare occurrences (`--check-names` clean for all 26), determinism corpus 30/30 after each task, and the full `npm test` suite green.
- Ran `scripts/state_contract_check.js` after both tasks: confirmed its remaining BARE-USAGE findings are exclusively `game`, `timer`, `logLines` (the 3 names deferred to a later plan) — none of this plan's 26 names appear in its failure output, and the finding count (43 of 46 names migrated: `room` + 7 + 9 + 26 across 10-01 through 10-04) matches the running tally exactly.

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate the shot-clock / timer-control cluster** - `f38c699` (feat)
2. **Task 2: Migrate the live / prompt / turn bookkeeping cluster + preserve revealMyRecipe reachability** - `d5568f5` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `index.html` - 26 names migrated to `appState.NAME` at every read/write site: the 13-name shot-clock/timer-control cluster (Task 1) and the 13-name live/prompt/turn bookkeeping cluster (Task 2, including `revealMyRecipe`'s one body reference).

## Decisions Made

- No local-parameter-shadowing collision existed for any of the 26 names in this wave (unlike 10-02's `resumeEvLen`) — confirmed by grep before migrating both clusters, not just discovered after a SyntaxError. `setActor(s){curSeat=s;}` in particular was checked explicitly (per the plan's read_first note) and migrated cleanly since its parameter `s` is a distinct identifier from `curSeat`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug, in the plan's verification text, not the code] Task 1's acceptance-criteria grep for the `shotClockTimer` handle is imprecise and does not actually gate on migration status**
- **Found during:** Task 1, running the plan's own automated `<verify>` command
- **Issue:** The plan's acceptance criterion `grep -cE "clearInterval\(shotClockTimer\)|setInterval\(shotClockTick" index.html` returns 0 (no bare shotClockTimer handle remains at a timer site)" is checked via a regex whose second alternation, `setInterval\(shotClockTick`, matches the literal substring `setInterval(shotClockTick` regardless of what precedes it on the assignment's left-hand side. Since `shotClockTick` is the callback *function name* (never migrated — it isn't one of the 46 app-state names) and appears verbatim in `appState.shotClockTimer=setInterval(shotClockTick,500)` exactly as it would in an unmigrated `shotClockTimer=setInterval(shotClockTick,500)`, this alternation matches 3 times unconditionally, both before and after correct migration. It cannot distinguish a correctly-migrated site from a bug.
- **Fix (verification only — no code change):** Ran a precise, LHS-anchored check instead: `grep -cE "clearInterval\(shotClockTimer\)"` (the criterion's *first* alternation, which correctly excludes `appState.`-qualified calls because of the literal `.` character between `appState` and `shotClockTimer`) returns 0, and a direct `grep -nE "shotClockTimer"` dump confirms all 8 occurrences in the file are `appState.shotClockTimer` with zero bare occurrences. `--check-names shotClockTimer` (the canonical, scope-aware check used throughout this phase) independently confirms zero bare identifier-position occurrences. Combined with the line-by-line diff review of all 3 clear sites and 3 arm sites documented in Accomplishments above, the interval-handle correctness this criterion exists to protect is fully verified — the criterion's own regex construction is just too loose to prove it unaided.
- **Files modified:** None (index.html's migration was already correct; only the verification method was adjusted).
- **Verification:** `--check-names shotClockTimer` PASS; `grep -cE "clearInterval\(shotClockTimer\)"` returns 0; manual line-by-line review of all 8 `shotClockTimer` occurrences confirms 100% `appState.`-qualified; determinism corpus 30/30; full `npm test` suite green.
- **Committed in:** `f38c699` (Task 1 commit) — no code fix was needed; this entry documents the verification-method substitution for the record.

---

**Total deviations:** 1 (Rule 1, verification-method substitution — the underlying migration was correct on the first pass; only the plan's own acceptance-criteria regex needed a more precise substitute to actually prove it).
**Impact on plan:** None on scope or correctness — both clusters migrated exactly as specified, no other names touched, no local renames needed this wave.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 43 of 46 app-state names now migrated (`room` from 10-01, 7 replay/resume names from 10-02, 9 net-consumed identity/session names from 10-03, plus these 26); 3 remain (`game`, `timer`, `logLines`) for 10-05/10-06.
- `scripts/state_contract_check.js` remains expected-red only on the 3 un-migrated names' declaration/bare-usage assertions — confirmed none of this plan's 26 names appear in its failure output.
- `revealMyRecipe` (GLOBAL-02's one genuine risk surface) is fully verified: still a `function` declaration, inline `onclick` attribute byte-identical, body write correctly `appState.`-qualified.
- No blockers.

---
*Phase: 10-app-state-de-globalization*
*Completed: 2026-07-24*

## Self-Check: PASSED
