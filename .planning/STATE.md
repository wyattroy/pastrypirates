---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Playtest Fixes & Polish
current_phase: 15
current_phase_name: narration-audit-fixes
status: executing
stopped_at: Completed 15-04-PLAN.md
last_updated: "2026-07-28T02:09:36.393Z"
last_activity: 2026-07-27
last_activity_desc: Phase 15 execution started
progress:
  total_phases: 11
  completed_phases: 2
  total_plans: 15
  completed_plans: 13
  percent: 18
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-26)

**Core value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.
**Current focus:** Phase 15 — narration-audit-fixes

## Current Position

Phase: 15 (narration-audit-fixes) — EXECUTING
Plan: 5 of 6
Status: Ready to execute
Last activity: 2026-07-27 — Phase 15 execution started

Progress: [█████████░] 87% (v1.2)

## Performance Metrics

**Velocity (v1.2):**

- Total plans completed: 9
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
| 14 | 6 | - | - |

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 14 P01 | 30min | 2 tasks | 3 files |
| Phase 14 P02 | 25min | 3 tasks | 3 files |
| Phase 14 P03 | 30min | 2 tasks | 3 files |
| Phase 14 P04 | 25min | 3 tasks | 34 files |
| Phase 14 P05 | 45min | 3 tasks | 4 files |
| Phase 14 P06 | 119min | 3 tasks | 7 files |
| Phase 15 P01 | 12min | 2 tasks | 5 files |
| Phase 15 P02 | 8min | 2 tasks | 3 files |
| Phase 15 P03 | 25min | 3 tasks | 3 files |
| Phase 15 P04 | 15min | 3 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table. Recent decisions affecting v1.2 work:

- v1.2 splits the second punch list — fixes/polish now (CLOCK, STORM, NARR, UI, META, KOFI); the tutorial, sound effects, and island redesign are deferred (island redesign touches deterministic board generation).
- CLOCK-01 (multiplayer clock stall) is the critical headline fix and is front-loaded as Phase 13 so multiplayer is playable as early as possible.
- STORM-01 is the one engine-adjacent change; it is grouped with VERIFY-02 in Phase 14 so determinism re-verification is deliberate, not incidental. **Settled at Phase 14 close: the corpus is now 31 seeds, not 30** (a 31st was added to preserve `shipwrecked` coverage), and the gate is 31/31 green.
- NARR-01 is an approval-gate deliverable — the narration audit goes to Wyatt for review before the NARR-02…06 pruning/fixes are applied.
- Ko-Fi "Buy me a cookie" button (KOFI-01) approved for v1.2 despite the third-party ko-fi.com script embed.
- [Phase ?]: D-18: leeward() now tests the upwind square against isHome() as well as isIsland() — Tortuga casts a wind shadow like every other island (fixture-perturbing, deliberate)
- [Phase ?]: Determinism gate is deliberately RED (19/30 seeds diverge) after D-18 — re-record deferred to 14-04 per D-16; docs/DETERMINISM-RERECORD.md seeded with real per-seed measurements
- [Phase ?]: D-06 rule 2's 'hurts least' proxy uses humanTrade's essential idiom (recipe.includes+cnt<=1), not RESEARCH's broken needs(q) proxy, per <planner_corrections>
- [Phase ?]: Hail action-cost commits (p.lastOffer + hailed flag) the instant an offer reaches the table, before the await, so a shot-clock expiry mid-hail still counts as a spent action with no partial trade
- [Phase ?]: D-15: the all-bot simulator's takeTurn now applies both storm gusts (up to 4 squares) sharing one dodgedOnce, matching the live game; play() rolls windNow2 from PERP at the exact orchestrator RNG draw point
- [Phase ?]: D-19/D-21: Game.mooredReason(p) tags every moored event with its actual cause (justDocked/dock/home); moored(p) is unchanged behaviorally; the D-19 berth-protection invariant is now proven by scripts/storm_moored_reason_test.js, not assumed
- [Phase ?]: All three fixture-perturbing decisions for Phase 14 (D-15, D-18, D-21) are now landed; determinism gate deliberately RED (30/30 seeds diverge) until 14-04's single, gated --capture re-record
- [Phase ?]: Wyatt: capture-now for the 14-04 determinism re-record, explicitly confirming D-26's pre-storm assertion is superseded by per-key attribution evidence (Tortuga wind-shadow is wind-driven, not storm-gated)
- [Phase ?]: Wyatt: add-a-seed to resolve the shipwrecked coverage gap that --capture surfaced — corpus grows from 30 to 31 seeds (seed 12379 appended, first-match), REQUIRED_EVENT_TYPES left unweakened
- [Phase ?]: STORM-01: windLeg/botWindLeg both render every ordinary-water square before the next outcome narrates (D-22 fix); botWindLeg delegates per-square to windPush rather than re-deriving the ladder, narrating every event a square records (D-11); EVENT_NARRATION.moored now branches on reason into three DRAFT lines (D-21) pending 14-06 approval alongside the pacing constants and 14-02's refused-hail clause
- [Phase ?]: D-14/D-27: Wyatt authored/approved final storm+hail copy (rewrote moored/justDocked and the refused-hail parley clause, approved moored/dock as drafted, collapsed moored/home onto justDocked at the narration layer only)
- [Phase ?]: The three new Phase 14 test scripts (hail_ranking_test.js, storm_moored_reason_test.js, bot_storm_narration_test.js) are now permanent npm test gates, 9 -> 12
- [Phase ?]: First live Safari playtest of 14-05's per-square storm rendering FAILED (board painted from a stale event snapshot, not live positions); root-caused and fixed same-day at the UI tier only (commit 14d8258), re-confirmed by Wyatt; multiplayer guests keep the non-animated behavior by design since the determinism corpus forbids adding events
- [Phase ?]: 15-01: NEUTRAL_VIEWER is a numeric sentinel (-1), not a Symbol, so it stays type-number per the plan's export-type check and can never collide with a real 0-3 seat index.
- [Phase ?]: 15-01: dodge's addressed second-person copy is DRAFT pending Wyatt's D-04 review, same convention as Phase 14's moored/D-21 draft lines.
- [Phase ?]: 15-02: CHAT_BUBBLE_HOLD_MULTIPLIER set to 0.8 (msgHoldMs's pre-Phase-15 value, not 1.0) per plan's planner_correction, so bubbles reproduce exactly today's timing rather than holding 25% longer
- [Phase ?]: 15-02: MSG_HOLD_MULTIPLIER 0.8->0.72 and BOT_MSG_HOLD_MULTIPLIER 0.5->0.45 — identical 0.9 ratio on both curves so human and bot narration stay in proportion
- [Phase ?]: 15-03: The plan's own listed awk verify commands for humanTurn/botTurn ranges are self-defeating (start pattern also matches the generic end pattern on the same line) — narration_flow_test.js uses string-index slicing instead, which is immune to the trap
- [Phase ?]: 15-03: humanWind's second-leg flash always renders "you" unconditionally with no viewer selection (doesn't call pn()/poss(), so it's outside this plan's literal scope) — left as a discovered gap for a future narration pass
- [Phase ?]: 15-04: bribe/cleaned-out battle spoil boundary is spoilN>=5 exactly (both real spoil paths clamp coin take to 5); cleaned-out wording is the real-prose form of the simulator-only '(all they had)' parenthetical, never a literal carried suffix
- [Phase ?]: 15-04: moored's addressed branch is a full sibling object (LA) beside the untouched L object, not an isLocalTo() conditional threaded into L's own values — keeps byte-identical third-person text a structural guarantee
- [Phase ?]: 15-04: bakeoff's loser gets its own commiseration line rather than reusing the neutral text verbatim, since narrationVariants() filters out any addressed rendering equal to the neutral one — a byte-identical loser line would have silently produced zero variant entries for that seat

### Pending Todos

None yet.

### Blockers/Concerns

- ~~**Determinism risk (Phase 14)**~~ — **RESOLVED at Phase 14 close (2026-07-26).** The one-time re-record happened exactly once, behind a blocking human decision, after a full per-seed divergence report attributed every change. The corpus grew 30 → 31 seeds (a 31st was added when the coverage guard found no seed produced a `shipwrecked` event any more; `REQUIRED_EVENT_TYPES` was left unweakened). VERIFY-02 is green at **31/31** against the new baseline. Full record: `docs/DETERMINISM-RERECORD.md`.
- **Standing determinism rule (carried forward):** the 31-seed corpus is the multiplayer lockstep oracle and there is no cheap re-record. Any future change to what `src/engine/index.js` emits into the event stream — including adding a field to an existing event — invalidates all 31 fixtures and requires another gated re-record. Prefer UI-tier fixes. This is what forced STORM-02 (guest storm animation) to the backlog rather than into Phase 14.
- **Safari re-verification:** Storm rendering has a prior Safari-specific crash precedent; storm-movement work (Phase 14) and the final playtest (Phase 17) must both re-verify in Safari, not Chrome alone.
- **MP test-harness gotcha:** Same-machine two-tab multiplayer shares localStorage `pp_id`, causing a transient host-reload collision during Phase 12 tests — re-set the host's own `pp_id` before reloading. Use synthetic-prompt injection for deterministic remote-render checks (see MEMORY.md).
- **Backlog UAT findings (from v1.1 Phase 12 Safari playthrough, pre-existing, not regressions):** EOV narration box not cleared (still open, tagged `resolves_phase: 16`; may intersect Phase 15 narration work). ~~Bot hail + action on the same turn~~ — **closed by Phase 14 (AI-01/plan 14-02)**; the todo is filed under `.planning/todos/completed/`.

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
| Networking | **STORM-02 — multiplayer guest storm-push parity.** Guests see a storm-pushed boat jump to its final square; solo play and the host see it step square by square. A guest renders only from the broadcast event feed, and the intermediate squares emit no event by design. Delivering parity means adding to the event stream, which forces another full re-record of the determinism corpus — so it is deliberately not a Phase 14 gap. Narration is already correct for guests. | Backlog — accepted as-is at Phase 14 close by Wyatt | Phase 14 close (2026-07-26) |

## Session Continuity

Last session: 2026-07-28T02:09:36.385Z
Stopped at: Completed 15-04-PLAN.md
Resume file: None

## Operator Next Steps

- Phase 13 complete (CLOCK-01/02/03 human-verified). Phase 14 context gathered — plan it with `/gsd-plan-phase 14`
