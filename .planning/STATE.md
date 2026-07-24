---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Monolith Refactor
current_phase: 10
current_phase_name: App State & De-globalization
status: executing
stopped_at: Completed 10-06-PLAN.md
last_updated: "2026-07-24T22:48:07.121Z"
last_activity: 2026-07-24
last_activity_desc: Phase 10 execution started
progress:
  total_phases: 6
  completed_phases: 3
  total_plans: 20
  completed_plans: 19
  percent: 50
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-24)

**Core value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.
**Current focus:** Phase 10 — App State & De-globalization

## Current Position

Phase: 10 (App State & De-globalization) — EXECUTING
Plan: 6 of 7
Status: Ready to execute
Last activity: 2026-07-24 — Phase 10 execution started

Progress: [██████████] 95%

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: — min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 07 P01 | 15 | 2 tasks | 36 files |
| Phase 07 P02 | 15 | 3 tasks | 5 files |
| Phase 08 P01 | 25 | 2 tasks | 5 files |
| Phase 08 P02 | 20 | 2 tasks | 4 files |
| Phase 08 P03 | 35min | 2 tasks | 5 files |
| Phase 08 P04 | ~40min | 2 tasks | 3 files |
| Phase 08 P05 | 45min | 2 tasks | 3 files |
| Phase 09 P01 | ~70min | 2 tasks | 7 files |
| Phase 09 P02 | ~20min | 2 tasks | 3 files |
| Phase 09 P03 | 90min | 3 tasks | 6 files |
| Phase 09 P04 | 35min | 2 tasks | 3 files |
| Phase 09 P05 | ~25min | 2 tasks | 4 files |
| Phase 10 P01 | ~35min | 3 tasks | 6 files |
| Phase 10 P02 | ~15min | 1 tasks | 1 files |
| Phase 10 P03 | 10min | 1 tasks | 1 files |
| Phase 10 P04 | ~15min | 2 tasks | 1 files |
| Phase 10 P05 | 15min | 1 tasks | 1 files |
| Phase 10 P06 | 20min | 2 tasks | 4 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Strangler-fig extraction order — game stays runnable + determinism-verifiable at every phase boundary; a temporary window bridge is acceptable mid-refactor and removed in Phase 11.
- Roadmap: Engine extraction (SPLIT-01/ENGINE-01) and Node-harness native import (ENGINE-02) land in the same phase (Phase 8) — the harnesses string-slice `index.html` today and break the instant engine code moves.
- Roadmap: Byte-for-byte replay parity (ENGINE-03) is gated against a golden baseline captured FIRST in Phase 7 (FOUND-04).
- Roadmap: No bundler/framework/TypeScript — native ES modules preserve the zero-build principle (explicit anti-features).
- [Phase ?]: Determinism oracle --verify always runs both stored-hash and fresh-replay comparisons (rather than short-circuiting) so the D-10 divergence report locates and names a seed even when only the manifest's recorded hash is stale, not the fixture content.
- [Phase ?]: engineSourceHash baseline recorded: 15ad68996befca5130ba11b0cf79d59b0d871956cc11ab961fe32add384d874a — Phase 8 should expect SOURCE classification 'moved, behavior identical' post-extraction, not 'unchanged'.
- [Phase ?]: Phase 7 Plan 2: no deviations — module-loading contract landed exactly as CONTEXT.md's D-13..D-22 specified; all six critical invariants (attribute-less script count, Firebase ordering, engine-region hash, MIME serving, doc content) held on first pass.
- [Phase ?]: Phase 8 Plan 1: Assumption A1 (Object.assign(globalThis, PP) bare-identifier resolution) confirmed by execution in Chrome — mulberry32 and rollStorm moved verbatim through the window.PP bridge, both an early call site (Game constructor) and a corpus-blind one (live turn loop's rollStorm/PERP second-gust mechanic) resolve correctly with a clean console. Plans 08-02 through 08-05 may proceed on the bridge mechanism.
- [Phase ?]: Phase 8 Plan 2: mechanical (Node-script) extraction over manual retyping for the ~950-line Unicode-dense shared tier, byte-verified via diff before writing to disk
- [Phase ?]: Phase 8 Plan 2: six ORDER IS LOAD-BEARING annotations added (DIRS, DIRNAME, PERP, STORM_DIAG, OPPOSITE, TET) with construct-specific mechanism reasons, not a repeated generic sentence
- [Phase ?]: Engine tier's shared-import list (mulberry32, ING_ALL, TET, DIRS, OPPOSITE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD, windStepCost, man, ilabelImg) derived mechanically from the moved source, not from RESEARCH.md's illustrative guess — NAMES/dockPlace/iname/ilabel are classic-UI-only dependencies, not Game-class dependencies
- [Phase ?]: scripts/lib/load_engine.js header comment scrubbed of the literal string 'index.html' entirely (not just node:vm), per acceptance criterion 14's whole-file grep and invariant #7
- [Phase ?]: engine_contract_check.js's annotation check walks the whole contiguous comment block above each anchor (not just the immediately-preceding line) — the engine tier's 3-line [3,2,1] annotation put the token 2 lines above the single-line-lookup a literal reading of the plan's acceptance criteria would produce.
- [Phase ?]: MOVED_SYMBOLS (128 names) is hardcoded from prior SUMMARYs' export-list records, not derived from the barrels' own export statements at check time — deriving it from the barrels would make the completeness assertion tautological.
- [Phase ?]: 08-05: engineSourceHash re-based via a dedicated gated tool (scripts/rebase_source_hash.js), never --capture; landed as its own commit per D-02
- [Phase ?]: 08-05: minimally factored determinism_baseline.js's comparison-2 helpers (export, no logic change) so the re-base tool reuses the oracle's own comparison rather than reimplementing it; disclosed as a separate refactor commit
- [Phase ?]: 08-05: Chrome-verified the classic live turn loop's corpus-blind storm/second-gust path (game.r(), rollStorm, PERP, DIRS) still works with the engine outside index.html, closing the coverage gap 08-03 recorded
- [Phase ?]: 09-01: added a registry-routed cross-instance test (isolated-backing fake) beyond the plan's literal case list, because the original shared-backing-fake case cannot be made to fail by any registry.js change and AC 8 requires it to be
- [Phase ?]: 09-01: deliberately did not mark SPLIT-04/NET-01/NET-02/NET-03 complete in REQUIREMENTS.md — only 3 of 18 watchers migrated and NET-03's live-browser proof (Task 3) is unperformed
- [Phase ?]: 09-01: Task 3's live-browser NET-03 probe was performed by the coordinator (this executor has no browser tool) against a real Firebase connection — same-tab, no-reload attach/detach/re-attach verified: session watchers (2) survived detachRoom(), the torn-down handler went silent on a real write, re-attach returned to the pre-teardown count. Transcript recorded verbatim in 09-01-SUMMARY.md, attributed to the coordinator, not this execution session.
- [Phase ?]: watchers.js switched to import * as registry from './registry.js' / registry.attach() namespaced call style (applied to all 16 wrappers) so the plan's literal registry.attach grep ledger is true
- [Phase ?]: src/net/index.js re-exports the 13 new watcher names (not in plan's files_modified list) so they reach the window.PP/globalThis bridge and don't ReferenceError at runtime
- [Phase ?]: 09-03: extracted all remaining Firebase writes/reads into src/net/writers.js and readers.js; all 18 watchers now registry-mediated; SPLIT-04/NET-01/NET-02 left Pending pending 09-04's mechanical contract check and 09-05's behavioral proof
- [Phase ?]: Built scripts/net_contract_check.js with five mechanically-enforced assertions (sole listener site, no UI dependency, no app-state dependency, directional imports, eighteen-watcher inventory) and zero comment stripping — the deliberate deviation from the Phase 8 precedent, needed because src/net/index.js carries the Firebase databaseURL, empirically confirmed by simulating the Phase-8 stripper against the same fault line
- [Phase ?]: Marked SPLIT-04 and NET-02 Complete in REQUIREMENTS.md; left NET-01/NET-03 Pending for 09-05's behavioral reconnect/leave-rejoin proof
- [Phase ?]: 09-05: NET-01/NET-03 marked Complete only after independently re-confirming all 18 watchers route through the registry (grep + net_contract_check + npm test), not on the coordinator's live transcripts alone
- [Phase 9]: ROADMAP criterion 4 (two-tab multiplayer sync) CLOSED 2026-07-24 — clean in-game re-run in Chrome proved live host↔guest turn propagation through src/net/ (same-moment captain-state match); WINDOWS.md item 2 fixed, 09-VERIFICATION.md now 4/4 passed
- [Phase ?]: 10-01: Bridge identifier is appState, not state -- state already collides with local variable/parameter names in the classic script (broadcastFlip(state), setRecoveryState(state), a local const in setClockUI()); appState confirmed zero prior occurrences. All subsequent 10-xx plans migrate to appState.NAME, not state.NAME.
- [Phase ?]: 10-01: js_region_tokenizer.js gained a regex-literal lexer mode mid-task -- escHtml's /[&<>"]/g regex (a literal quote inside a character class) corrupted downstream string/comment classification until regex literals were recognized as their own token kind. Fixed and verified before committing.
- [Phase ?]: 10-02: replayShortfall()'s local parameter resumeEvLen shadowed the app-state global; migration tool blindly rewrote the parameter declaration into invalid JS. Renamed the local param to priorEvLen (same fix class as 10-01's state->appState collision, applied to a local shadow instead).
- [Phase ?]: 10-03: migrated the 9 net-consumed identity/session names (db, myId, mySeat, isHost, roster, turnOrder, numSeats, passAndPlay, soloMeta) to appState.NAME; all ~27 src/net/ call sites now resolve live state at call time (D-07)
- [Phase ?]: [Phase 10] 10-04: migrated the 26-name shot-clock/timer-control + live/prompt/turn bookkeeping cluster to appState.NAME; setActor(s){curSeat=s} and revealMyRecipe both confirmed to migrate cleanly with no local-parameter collisions; the shotClockTimer setInterval handle proven correct at all 3 clear + 3 arm sites; 43 of 46 app-state names now migrated, only game/timer/logLines remain.
- [Phase ?]: Migrated game (418 sites), timer, and logLines to appState.NAME — all 46 app-state names now migrated; manually blanked a fully-emptied declaration line the migration tool corrupted into a silent comma-expression bug.
- [Phase ?]: GLOBAL-03 debug hook window.__pp_app_state_debug is a callable helper returning {...appState} (never the live object), and the state-contract-check debug-hook allowlist now fails on a missing hook, not just an extra one
- [Phase ?]: scripts/state_contract_check.js wired into npm test after net_contract_check.js — GLOBAL-01/GLOBAL-03 standing gate is now enforced on every test run, red-proof drilled for all 5 assertions

### Pending Todos

None yet.

### Blockers/Concerns

- RNG/iteration-order desync is the top risk: object-key reordering during code motion silently changes the RNG sequence. Byte-for-byte regression testing against the Phase 7 golden baseline is non-negotiable; mark order-load-bearing constants `// ORDER IS LOAD-BEARING`.
- `<script type="module">` is always deferred — Firebase compat CDN tags must stay classic scripts loaded before the module entry (Phase 7, FOUND-03) to avoid an init race.
- De-globalization (Phase 10) can silently break the 41 inline `onclick` handlers — needs an upfront handler audit and a click-through checklist.
- Safari has stricter module behavior and a prior storm-crash precedent — explicit Safari re-verification at the UI boundary (Phase 11) and in final validation (Phase 12).
- 09-03 Task 3 browser tripwire (window.__pp_module_ok/__pp_boot_count) unverified this session — no browser-automation tool available; recorded in WINDOWS.md, needs a Chrome session before phase gate

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Networking | NETMOD-01 — modular Firebase v9+ SDK migration | Deferred to v2 | v1.1 requirements |
| DX | DX-01 — JSDoc typedefs for event objects | Deferred to v2 | v1.1 requirements |
| DX | DX-02 — isolated pure replay-runner extraction | Deferred to v2 (pursue only if seam surfaces bugs) | v1.1 requirements |

## Session Continuity

Last session: 2026-07-24T22:48:07.109Z
Stopped at: Completed 10-06-PLAN.md
Resume file: None

## Operator Next Steps

- Review the v1.1 roadmap, then plan the first phase with `/gsd-plan-phase 7`

</content>
