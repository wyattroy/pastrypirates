---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Playtest Fixes & Polish
current_phase: 14
current_phase_name: engine-adjacent-gameplay-fixes-determinism
status: executing
stopped_at: Completed 14-01-PLAN.md
last_updated: "2026-07-26T20:40:30.317Z"
last_activity: 2026-07-26
last_activity_desc: Phase 14 execution started
progress:
  total_phases: 11
  completed_phases: 1
  total_plans: 9
  completed_plans: 4
  percent: 9
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-26)

**Core value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.
**Current focus:** Phase 14 — engine-adjacent-gameplay-fixes-determinism

## Current Position

Phase: 14 (engine-adjacent-gameplay-fixes-determinism) — EXECUTING
Plan: 2 of 6
Status: Ready to execute
Last activity: 2026-07-26 — Phase 14 execution started

Progress: [████░░░░░░] 44% (v1.2)

## Performance Metrics

**Velocity (v1.2):**

- Total plans completed: 3
- Average duration: — min
- Total execution time: 0 hours

*(Prior milestones: v1.0 shipped 2026-07-24; v1.1 shipped 2026-07-25 — 32 plans across Phases 7–12. Per-plan history retained in git and prior SUMMARY files.)*

**By Phase (v1.2):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 13. Multiplayer Turn Clock | TBD | — | — |
| 14. Storm Movement & Determinism | TBD | — | — |
| 15. Narration Audit & Fixes | TBD | — | — |
| 16. UI/UX Polish, Social Preview & Support | TBD | — | — |
| 17. Final Multiplayer Verification | TBD | — | — |
| 13 | 3 | - | - |

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 14 P01 | 30min | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table. Recent decisions affecting v1.2 work:

- v1.2 splits the second punch list — fixes/polish now (CLOCK, STORM, NARR, UI, META, KOFI); the tutorial, sound effects, and island redesign are deferred (island redesign touches deterministic board generation).
- CLOCK-01 (multiplayer clock stall) is the critical headline fix and is front-loaded as Phase 13 so multiplayer is playable as early as possible.
- STORM-01 is the one engine-adjacent change; it is grouped with VERIFY-02 in Phase 14 so determinism re-verification (30/30) is deliberate, not incidental.
- NARR-01 is an approval-gate deliverable — the narration audit goes to Wyatt for review before the NARR-02…06 pruning/fixes are applied.
- Ko-Fi "Buy me a cookie" button (KOFI-01) approved for v1.2 despite the third-party ko-fi.com script embed.
- [Phase ?]: D-18: leeward() now tests the upwind square against isHome() as well as isIsland() — Tortuga casts a wind shadow like every other island (fixture-perturbing, deliberate)
- [Phase ?]: Determinism gate is deliberately RED (19/30 seeds diverge) after D-18 — re-record deferred to 14-04 per D-16; docs/DETERMINISM-RERECORD.md seeded with real per-seed measurements

### Pending Todos

None yet.

### Blockers/Concerns

- **Determinism risk (Phase 14) — UPDATED 2026-07-26 by 14-CONTEXT.md D-15/D-16:** STORM-01 changes movement, which is engine-adjacent. RNG/iteration-order desync remains the top risk. **The golden baseline is now scheduled for a deliberate, one-time re-record** — Phase 14 aligns the all-bot simulator to the real game's full 4-square storm (the sim currently applies only the first gust), so all 30 fingerprints change on purpose. This supersedes the earlier "byte-for-byte against the golden baseline is non-negotiable" framing. Guardrails: re-record only after confirming the diffs are storm-related *only* (D-16), and resolve the open research question D-17 (does the sim already charge bot trades an action?) first, so the corpus is re-recorded **once**, not twice. VERIFY-02 must be green (30/30) against the *new* baseline before Phase 14 closes.
- **Safari re-verification:** Storm rendering has a prior Safari-specific crash precedent; storm-movement work (Phase 14) and the final playtest (Phase 17) must both re-verify in Safari, not Chrome alone.
- **MP test-harness gotcha:** Same-machine two-tab multiplayer shares localStorage `pp_id`, causing a transient host-reload collision during Phase 12 tests — re-set the host's own `pp_id` before reloading. Use synthetic-prompt injection for deterministic remote-render checks (see MEMORY.md).
- **Backlog UAT findings (from v1.1 Phase 12 Safari playthrough, pre-existing, not regressions):** EOV narration box not cleared; bot hail + action on the same turn. The EOV narration item may intersect Phase 15 narration work.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Features | Interactive tutorial (TUT-01…03) | Deferred to a later milestone | v1.2 requirements |
| Features | Sound effects (AUDIO-01…03) | Deferred to a later milestone | v1.2 requirements |
| Features | Island redesign (ISLAND-01…04) — touches deterministic board gen | Deferred to a later milestone | v1.2 requirements |
| Networking | NETMOD-01 — modular Firebase v9+ SDK migration | Deferred to v2 | v1.1 requirements |
| DX | DX-01 — JSDoc typedefs for event objects | Deferred to v2 | v1.1 requirements |
| DX | DX-02 — isolated pure replay-runner extraction | Deferred to v2 (only if seam surfaces bugs) | v1.1 requirements |

## Session Continuity

Last session: 2026-07-26T20:40:30.305Z
Stopped at: Completed 14-01-PLAN.md
Resume file: None

## Operator Next Steps

- Phase 13 complete (CLOCK-01/02/03 human-verified). Phase 14 context gathered — plan it with `/gsd-plan-phase 14`
