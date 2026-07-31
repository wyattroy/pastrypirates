---
phase: 14-engine-adjacent-gameplay-fixes-determinism
plan: 06
subsystem: testing
tags: [storm, narration, determinism, playtest, safari, ui-rendering]

# Dependency graph
requires:
  - phase: 14-05
    provides: per-square storm push rendering scaffold (windLeg/botWindLeg), three-way moored narration branch, botMsgHoldMs pacing
provides:
  - Wyatt's approved storm/hail copy applied verbatim in EVENT_NARRATION
  - Three new test scripts (hail_ranking_test.js, storm_moored_reason_test.js, bot_storm_narration_test.js) wired as permanent npm test gates (9 -> 12)
  - A live-position ship renderer (renderLiveShips) that makes the per-square storm push actually visible
  - A movement-aware moored/dock narration line (movedSinceTurnStart) that no longer claims a shove that didn't happen
  - Closed-out 14-VALIDATION.md with an honest record of a failed-then-fixed browser playtest
affects: [phase-15-narration-audit, phase-17-final-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Render from live state, not from the last emitted event's position snapshot, whenever a code path can legitimately mutate state without emitting an event"
    - "Derive narration wording from a comparison across two points in the existing event stream (turn-start snapshot vs. this event's snapshot) rather than adding new UI-only bookkeeping state, so host/guest/replay/log-scrubbing all agree"
    - "Tie an animation's step interval to its own CSS transition duration via a named constant (SHIP_GLIDE_MS) so the two cannot silently drift apart again"

key-files:
  created: []
  modified:
    - src/ui/util.js
    - package.json
    - .planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-VALIDATION.md
    - src/ui/board.js
    - src/ui/flow.js
    - scripts/bot_storm_narration_test.js
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Wyatt rewrote moored/justDocked himself (\"is still docked, so the storm can't run them aground.\")"
  - "Wyatt approved moored/dock as drafted, unchanged"
  - "Wyatt had the separate moored/home (Tortuga) line removed at the narration layer only — it now renders the identical justDocked string, since D-18 already treats Tortuga as a normal island/dock; the engine's three-valued reason field is untouched and all 31 determinism fixtures remain valid"
  - "Wyatt rewrote the refused-hail parley clause, deliberately dropping the D-24 action-cost-visible clause, reasoning that a human whose own trade offer is refused also just loses their action with no special line — so parity with humans didn't require calling it out for bots either"
  - "The first live Safari playtest of 14-05's core deliverable FAILED (storm push wasn't visibly rendered, and the moored/dock line falsely claimed a shove for an already-parked ship); root-caused and fixed as a UI-tier-only change (commit 14d8258), then re-verified and confirmed by Wyatt"
  - "Multiplayer guests keep today's behavior (no per-square animation) as an accepted, by-design limitation — showing it would require adding to the event stream, which the determinism corpus forbids"

patterns-established:
  - "A DOM-free test suite passing 12/12 does not by itself prove a rendering deliverable works — the Manual-Only Verifications table exists precisely to catch what happened here, and did"

requirements-completed: [STORM-01, AI-01, VERIFY-02]

coverage:
  - id: D1
    description: "Wyatt's approved storm/hail narration copy applied verbatim to EVENT_NARRATION (moored x3 variants collapsed to 2 rendered lines, parley refused-hail clause rewritten)"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "scripts/bot_storm_narration_test.js#EVENT_NARRATION.moored assertions"
        status: pass
    human_judgment: false
  - id: D2
    description: "Three new test scripts wired into npm test as permanent gates (9 -> 12), determinism oracle still first, test:determinism-diff convenience script added"
    requirement: "VERIFY-02"
    verification:
      - kind: integration
        ref: "npm test (12/12 gates, exit 0)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Storm push renders visibly one square at a time in Safari and Chrome (bots and humans), and a moored/dock line only claims a shove when the ship actually moved this storm"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "scripts/bot_storm_narration_test.js#BUG-2 scenarios (moved/not-moved/intervening-event/wrong-anchor)"
        status: pass
      - kind: manual_procedural
        ref: "14-VALIDATION.md #Browser Playtest Record — Wyatt, Safari, 2026-07-26 (second run, after debug cycle)"
        status: pass
    human_judgment: true
    rationale: "DOM/CSS animation timing is not observable from a Node-based test harness; the first live run of this exact deliverable failed despite all automated gates being green, which is why it requires a human confirmation and not just the unit test."
  - id: D4
    description: "14-VALIDATION.md closed out: Per-Task Verification Map complete, Manual-Only Verifications all PASSED (with an honest account of the first failed run and its debug cycle), Validation Sign-Off ticked, wave_0_complete/nyquist_compliant/status set"
    verification:
      - kind: other
        ref: "node -e validation-signoff probe (see plan 14-06 Task 2 verify block)"
        status: pass
    human_judgment: false

duration: 119min
completed: 2026-07-26
status: complete
---

# Phase 14 Plan 06: Storm-Copy Approval, Standing Test Gates & Browser Playtest Summary

**Wyatt's approved storm/hail copy shipped, three new tests became permanent `npm test` gates (9→12), and a live Safari playtest caught — and a same-day debug cycle fixed — a bug where 14-05's per-square storm rendering was invisible because the board painted from a stale event snapshot instead of live ship positions.**

## Performance

- **Duration:** ~119 min (18:45–20:44 local, across Tasks 1–3 and the triggered debug session)
- **Tasks:** 3 (checkpoint:decision, auto, auto) plus one unplanned debug cycle
- **Files modified:** 7 (`src/ui/util.js`, `package.json`, `src/ui/board.js`, `src/ui/flow.js`, `scripts/bot_storm_narration_test.js`, `.planning/phases/14-.../14-VALIDATION.md`, `.planning/REQUIREMENTS.md`)

## Accomplishments

- Wyatt's per-line storm/hail copy decisions applied verbatim to `EVENT_NARRATION` — nothing reworded beyond what he asked for.
- `hail_ranking_test.js`, `storm_moored_reason_test.js`, and `bot_storm_narration_test.js` are now permanent gates in `npm test` (9 → 12), with the determinism oracle still first and a new `test:determinism-diff` convenience script.
- 14-VALIDATION.md is fully signed off: Per-Task Verification Map complete, all nine Manual-Only Verifications rows PASSED, Validation Sign-Off ticked, `status: validated` / `nyquist_compliant: true` / `wave_0_complete: true`.
- The phase's headline storm-rendering deliverable (D-09/D-22, per-square visible movement) was found broken on the FIRST live playtest, root-caused same-day, fixed at the UI tier only, and re-confirmed by Wyatt in Safari — this is the most consequential outcome of this plan and is documented honestly rather than papered over.
- REQUIREMENTS.md traceability corrected: STORM-01, AI-01, VERIFY-02 all now read "Complete" (STORM-01's checkbox was already checked but its traceability row was stale at "In Progress").

## Task Commits

Each task was committed atomically:

1. **Task 2 (part 1): Wire the three new test scripts into npm test as standing gates** — `2b9b4a7` (feat)
2. **Task 2 (part 2): Apply Wyatt's approved storm/hail copy (D-14, D-27)** — `5aa9a8e` (feat)
3. **Task 2 (part 3): Record copy approval GRANTED, leave Task 3 rows pending** — `c6f299a` (docs)
4. **Unplanned debug cycle: Paint ships from live positions during a storm push (D-22)** — `14d8258` (fix)
5. **Unplanned debug cycle: Resolve storm-push-not-rendered debug session** — `3837d5e` (docs)

Task 1 (the storm-copy checkpoint) has no commit of its own — it was a `checkpoint:decision` answered directly by Wyatt; its answer is what commit `5aa9a8e` applies.

**Plan metadata:** this commit (docs: close out plan 14-06)

## Files Created/Modified

- `src/ui/util.js` — Applied Wyatt's approved copy to `EVENT_NARRATION`; added `movedSinceTurnStart()`; raised `STORM_STEP_MS` (320→420) and `BOT_STORM_STEP_MS` (170→380) above the new `SHIP_GLIDE_MS` constant.
- `package.json` — Appended the three new test scripts to the `test` chain (now 12 gates); added `test:determinism-diff` convenience script.
- `src/ui/board.js` — Added `renderLiveShips()`, a ship-position painter that reads live player state instead of the last event's snapshot; `render()` itself is untouched (it carries the v1.0 Safari storm-crash fix byte-identical).
- `src/ui/flow.js` — `windLeg` and `botWindLeg` call `renderLiveShips()` on every per-square storm beat and again immediately before an outcome narrates.
- `scripts/bot_storm_narration_test.js` — Updated the `moored` assertion for the two-rendered-lines contract (was three); added the BUG-2 regression suite (4 real-engine scenarios + 3 planted-and-killed mutants).
- `.planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-VALIDATION.md` — Per-Task Verification Map completed, Manual-Only Verifications flipped to PASSED with a full Browser Playtest Record, Validation Sign-Off ticked, frontmatter set to `status: validated` / `nyquist_compliant: true` / `wave_0_complete: true`.
- `.planning/REQUIREMENTS.md` — Traceability row for STORM-01 corrected from "In Progress" to "Complete" (checkbox was already `[x]`; only the table cell was stale).

## Decisions Made

**Wyatt's storm/hail copy decisions (Task 1, applied in commit `5aa9a8e`):**
- Nine pre-existing Group A storm lines (`windmove`, `blownOut`, `dodge`, `anchor`, `blocked`, `anchorHold`, `aground` x2, `shipwrecked`): no changes requested.
- `moored`/`justDocked`: rewritten by Wyatt to *"{name} is still docked, so the storm can't run them aground."*
- `moored`/`dock`: approved as drafted — *"Lucky break! The gust shoves {name} onto a dock, and the crew steadies her fast against it ⚓"*
- `moored`/`home` (Tortuga): the separate line was removed by Wyatt's request. His reasoning: with D-18 landed, Tortuga is treated as a normal island/dock, so it shouldn't get bespoke wording. It now renders the identical `justDocked` string — narration layer only; the engine still emits all three `reason` values distinctly, untouched, because they're serialized into the 31 determinism fixtures.
- `parley` refused-hail clause: rewritten by Wyatt to *"🤝 {bot} offered {offer} for {seller}'s {item} — they refused."*, deliberately dropping the D-24 "it cost {bot} their turn all the same" clause. He was told this removes the visible action-cost signal and chose it anyway: a human whose own trade offer is refused also just spends their action with no special callout, so parity with humans is retained without the extra clause. Recorded here as his stated rationale, not an unexplained override. The bot's turn still ends on a refused hail; only the displayed text changed.
- Pacing constants (`STORM_STEP_MS`, `BOT_STORM_STEP_MS`, `BOT_MSG_HOLD_MULTIPLIER`): no change requested at Task 1 time (later re-tuned during the debug cycle, see below — that re-tuning was a bug fix, not a fresh copy/pacing request).

**Debug-cycle decisions (unplanned, triggered by the failed first playtest):** see Issues Encountered below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Storm push was not visibly rendered; moored/dock falsely claimed a shove for a ship that never moved**
- **Found during:** Task 3 (Safari + Chrome playtest) — Wyatt's first live run of the nine-point check
- **Issue:** `render()` (`src/ui/board.js`) painted every ship from the position snapshot baked into the last emitted event, never from live player state. An ordinary storm square emits no event, so 14-05's per-square `liveRender()` repainted an unchanged snapshot — the intermediate squares were unrenderable by construction, in both the human and bot path, in every browser. Separately, `mooredReason()`'s `dock` reason covers two different situations (shoved onto a dock this storm, vs. already parked there) and the narration used the shove wording for both.
- **Fix:** New `renderLiveShips()` (`src/ui/board.js`) paints from live player positions; `windLeg`/`botWindLeg` call it per square and before an outcome narrates. New `SHIP_GLIDE_MS` constant with both storm beats raised above it (`STORM_STEP_MS` 320→420, `BOT_STORM_STEP_MS` 170→380 — the old values were shorter than the ships' 350ms CSS glide, so a square was cut off mid-animation even after the render source was fixed). New `movedSinceTurnStart()` (`src/ui/util.js`) makes the shove wording conditional on actual movement since turn start; the already-parked case reuses Wyatt's already-approved "still docked" line, so no new unapproved copy shipped.
- **Files modified:** `src/ui/board.js`, `src/ui/flow.js`, `src/ui/util.js`, `scripts/bot_storm_narration_test.js`
- **Verification:** New regression assertion (4 real-engine scenarios + 3 planted mutants, all killed) in `scripts/bot_storm_narration_test.js`; full 12-gate `npm test`; 31/31 determinism against reverted source; live Chrome DevTools Protocol probe sampling 24 painted states (0 stale) plus a deliberate revert-proof showing the symptom returns exactly when reverted; Wyatt's own second Safari playtest confirmed all four checks.
- **Committed in:** `14d8258` (fix), documented in `3837d5e` (docs, debug session archive)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug found via manual playtest, not automated verify)
**Impact on plan:** Essential — this was the phase's core rendering deliverable (D-09/D-22) failing on its first real look. No scope creep: the fix stayed UI-tier only, touched no engine code, and introduced no new player-facing copy beyond what Wyatt had already approved.

## Issues Encountered

The first live Safari playtest (Task 3) failed on two of the nine checks, triggering a full debug session (`.planning/debug/resolved/storm-push-not-rendered.md`). This is the most important thing this plan produced and is recorded here without softening:

- **Symptom:** During a storm, a bot's push did not visibly move the boat — its new position only appeared later, when it took its own sail action. Separately, the "gust shoves you onto a dock" line appeared for a ship that had never moved.
- **Root cause:** Two independent, each-sufficient bugs, both UI-tier: (1) the board's renderer read ship positions from the last emitted event's snapshot rather than live state, and an ordinary storm square emits no event, so the per-square repaint 14-05 added was a no-op for position; (2) the `moored`/`dock` narration reason is ambiguous between "shoved onto a dock this storm" and "already parked there," and the UI always chose the shove wording.
- **Resolution:** Both fixed at the UI tier only (`src/engine/index.js` never touched); verified by a new regression test suite, the full 12-gate `npm test`, the 31/31 determinism oracle, a live Chrome DevTools Protocol probe with a deliberate revert-proof, and finally Wyatt's own second playtest in Safari, which confirmed all four checks given to him.
- **Accepted limitation:** multiplayer guests still do not see the per-square animation (they render purely from the broadcast event stream, and adding intermediate events would violate the determinism corpus's frozen event shape). This is a known, accepted design constraint, not a defect — host and solo play get the full animation.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 14 (STORM-01, AI-01, VERIFY-02) is functionally and validation-wise complete: all three requirements read "Complete" in REQUIREMENTS.md, `npm test` is 12/12 green, determinism is 31/31 against unmodified source, and 14-VALIDATION.md carries `status: validated` / `nyquist_compliant: true` / `wave_0_complete: true`.
- Phase-level verification (marking the phase itself complete in ROADMAP.md, running any cross-plan checks) is intentionally NOT performed by this plan — that is the orchestrator's step, per this plan's explicit instructions.
- Phase 15 (Narration Audit & Fixes) can proceed independently; nothing in this plan blocks it. Note for that phase: the storm-copy sweep here was deliberately narrow (Group B new lines only, per D-27) — the broader narration audit (NARR-01) is still the right home for a full pass across the nine Group A lines now that they're seen far more often (once per bot outcome instead of once per push).
- The multiplayer-guest per-square-animation gap identified during this plan's debug cycle is a known, accepted limitation, not a new backlog item requiring action — recorded here for visibility only.

---
*Phase: 14-engine-adjacent-gameplay-fixes-determinism*
*Completed: 2026-07-26*

## Self-Check: PASSED

All referenced files exist (`src/ui/util.js`, `package.json`, `src/ui/board.js`, `src/ui/flow.js`,
`scripts/bot_storm_narration_test.js`, `14-VALIDATION.md`, `REQUIREMENTS.md`, this SUMMARY) and all
referenced commits (`2b9b4a7`, `5aa9a8e`, `c6f299a`, `14d8258`, `3837d5e`) are present in git log.
