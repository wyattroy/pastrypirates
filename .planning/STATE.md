---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Monolith Refactor
current_phase: 8
current_phase_name: Engine Extraction & Node Harness Migration
status: executing
stopped_at: Completed 08-04-PLAN.md
last_updated: "2026-07-24T16:00:18.469Z"
last_activity: 2026-07-24
last_activity_desc: Phase 8 execution started
progress:
  total_phases: 6
  completed_phases: 1
  total_plans: 8
  completed_plans: 7
  percent: 17
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-24)

**Core value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.
**Current focus:** Phase 8 — Engine Extraction & Node Harness Migration

## Current Position

Phase: 8 (Engine Extraction & Node Harness Migration) — EXECUTING
Plan: 5 of 5
Status: Ready to execute
Last activity: 2026-07-24 — Phase 8 execution started

Progress: [█████████░] 88%

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

### Pending Todos

None yet.

### Blockers/Concerns

- RNG/iteration-order desync is the top risk: object-key reordering during code motion silently changes the RNG sequence. Byte-for-byte regression testing against the Phase 7 golden baseline is non-negotiable; mark order-load-bearing constants `// ORDER IS LOAD-BEARING`.
- `<script type="module">` is always deferred — Firebase compat CDN tags must stay classic scripts loaded before the module entry (Phase 7, FOUND-03) to avoid an init race.
- De-globalization (Phase 10) can silently break the 41 inline `onclick` handlers — needs an upfront handler audit and a click-through checklist.
- Safari has stricter module behavior and a prior storm-crash precedent — explicit Safari re-verification at the UI boundary (Phase 11) and in final validation (Phase 12).

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Networking | NETMOD-01 — modular Firebase v9+ SDK migration | Deferred to v2 | v1.1 requirements |
| DX | DX-01 — JSDoc typedefs for event objects | Deferred to v2 | v1.1 requirements |
| DX | DX-02 — isolated pure replay-runner extraction | Deferred to v2 (pursue only if seam surfaces bugs) | v1.1 requirements |

## Session Continuity

Last session: 2026-07-24T16:00:18.451Z
Stopped at: Completed 08-04-PLAN.md
Resume file: None

## Operator Next Steps

- Review the v1.1 roadmap, then plan the first phase with `/gsd-plan-phase 7`

</content>
