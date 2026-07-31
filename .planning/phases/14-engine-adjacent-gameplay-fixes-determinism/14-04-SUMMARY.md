---
phase: 14-engine-adjacent-gameplay-fixes-determinism
plan: 04
subsystem: testing
tags: [determinism, fixtures, corpus, node, engine]

# Dependency graph
requires:
  - phase: 14-01
    provides: "D-18 leeward() wind-shadow fix (Tortuga casts a wind shadow)"
  - phase: 14-03
    provides: "D-15 two-gust simulator alignment, D-21 moored() reason field"
provides:
  - "The re-recorded 31-seed determinism golden corpus (30 base seeds + 1 extra seed for shipwrecked coverage)"
  - "scripts/determinism_baseline.js extended to a base-range-plus-extras corpus model (EXTRA_SEEDS)"
  - "docs/DETERMINISM-RERECORD.md closed out with both human decisions (capture-now + add-a-seed) attributed and dated"
  - "VERIFY-02 satisfied at 31/31"
affects: [15-narration-audit-and-fixes, 16-ui-ux-polish, 17-final-multiplayer-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Corpus-as-base-range-plus-explicit-extras: a fixed contiguous seed range keeps its seedIndex/rotation stable across grows; new seeds are appended (never inserted) with a documented, reproducible first-match search."

key-files:
  created:
    - scripts/fixtures/determinism/seed-12379.jsonl
  modified:
    - scripts/determinism_baseline.js
    - scripts/fixtures/determinism/manifest.json
    - scripts/fixtures/determinism/seed-12345.jsonl through seed-12374.jsonl (all 30 base seeds re-captured)
    - docs/DETERMINISM-RERECORD.md
    - .planning/REQUIREMENTS.md

key-decisions:
  - "Wyatt: capture-now — re-record the 30-seed corpus now, explicitly confirming D-26's pre-storm assertion is superseded by per-key attribution evidence (Tortuga wind-shadow is wind-driven, not storm-gated, so the literal assertion was unachievable by construction)."
  - "Wyatt: add-a-seed — when --capture then blocked on lost `shipwrecked` coverage, extend the corpus to 31 seeds (base 30 unchanged + 1 explicit extra) rather than weaken REQUIRED_EVENT_TYPES, because the coverage guard is worth keeping."
  - "Extra seed 12379 chosen by first-match search over 5 candidates (12375-12379) evaluated at its actual seedIndex (30), not picked for any other property."

patterns-established:
  - "allSeedsWithIndex() helper in determinism_baseline.js: iterates base range then EXTRA_SEEDS in one fixed order, used identically by capture() and (implicitly, via manifest.perSeed order) verify()/determinism_diff.js."

requirements-completed: [VERIFY-02]

coverage:
  - id: D1
    description: "Determinism corpus re-recorded to 31 seeds (30 base + 1 extra), REQUIRED_EVENT_TYPES coverage restored including shipwrecked, without weakening the coverage guard"
    requirement: "VERIFY-02"
    verification:
      - kind: other
        ref: "node scripts/determinism_baseline.js --verify (31/31 PASS)"
        status: pass
      - kind: other
        ref: "node scripts/determinism_diff.js --assert-clean (exit 0)"
        status: pass
      - kind: other
        ref: "npm test (all nine gates green)"
        status: pass
      - kind: other
        ref: "node scripts/hail_ranking_test.js"
        status: pass
      - kind: other
        ref: "node scripts/storm_moored_reason_test.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "docs/DETERMINISM-RERECORD.md closed out with both of Wyatt's decisions (capture-now/D-26 substitution, add-a-seed resolution), attributed and dated, naming the new engineSourceHash"
    verification:
      - kind: other
        ref: "grep check: no AWAITING DECISION/PENDING marker; contains manifest.engineSourceHash verbatim"
        status: pass
    human_judgment: false

duration: 25min
completed: 2026-07-26
status: complete
---

# Phase 14 Plan 04: Determinism Fixture Re-Record Summary

**Re-recorded the 30-seed determinism golden corpus to 31 seeds (adding seed 12379) after `--capture` blocked on lost `shipwrecked` coverage under the D-15/D-18/D-21 engine changes — corpus now verifies 31/31, all nine `npm test` gates green.**

## Performance

- **Duration:** ~25 min (this continuation session; Tasks 1-2 completed in prior sessions)
- **Completed:** 2026-07-26T22:19:32Z
- **Tasks:** 3/3 complete
- **Files modified:** 34 in the Task 3 commit (32 fixture files + manifest.json + determinism_baseline.js + DETERMINISM-RERECORD.md), plus REQUIREMENTS.md in the final metadata commit

## Accomplishments

- Completed the attributed divergence report (Task 1, prior session) — every divergent event across 30/30 seeds traced to D-15, D-18, or D-21, with an explicit `unattributed divergences: none`.
- Wyatt authorised the single fixture re-record (Task 2, prior session): **capture-now**, explicitly confirming D-26's pre-storm assertion is superseded by the per-key attribution evidence.
- `--capture` was first attempted and blocked by its own coverage assertion: the post-14-03 engine's RNG-stream shift moved seed 12361 (the only seed that used to produce `shipwrecked`) off the rare compound branch that triggers it — a genuine, measured coverage gap, not weakened away.
- Wyatt resolved the gap with **add-a-seed**: extended `scripts/determinism_baseline.js`'s corpus model from a plain 30-seed loop to "base contiguous range (`SEED_BASE`/`SEED_COUNT`, unchanged) plus an explicit `EXTRA_SEEDS` list appended after it," via a new `allSeedsWithIndex()` helper that both `capture()` and (through `manifest.perSeed`'s order) `verify()`/`determinism_diff.js` consume identically.
- Found seed 12379 by first-match search: a throwaway script replayed candidates 12375-12379 against the current engine at seedIndex 30 (the seed's actual future index), and the first (5th candidate scanned) to produce a `shipwrecked` event was taken — non-arbitrary, reproducible.
- Ran `--capture` exactly once against the extended corpus: coverage assertion passed with `REQUIRED_EVENT_TYPES` unedited (`shipwrecked` still required, now covered by 1 event).
- Verified the door closed cleanly: `--verify` reports **31/31 PASS**, `determinism_diff.js --assert-clean` exits 0, `npm test` passes all nine gates, and both `hail_ranking_test.js` and `storm_moored_reason_test.js` pass.
- Closed out `docs/DETERMINISM-RERECORD.md`: Section 6b now records the add-a-seed resolution, the search log (5 candidates, seed 12379, first-match), and the new manifest identity (`capturedAt`, `engineSourceHash`, `seedCount`/`extraSeeds`/`perSeed.length`).
- Updated `.planning/REQUIREMENTS.md`: VERIFY-02 reworded from "(30/30)" to "(31/31)" and marked complete (checkbox + traceability table), reflecting the genuinely-green 31/31 result. STORM-01 left untouched per instruction (its per-square boat movement is 14-05's work).

## Task Commits

Tasks 1 and 2 were completed in prior sessions (see `<completed_tasks>` in the continuation prompt):

1. **Task 1: Enumerate and attribute every divergence (D-26)** - `7f605e1` (docs) — prior session
2. **Task 2: One-way door decision gate** - decision recorded in Section 6 of `docs/DETERMINISM-RERECORD.md`, folded into the Task 3 commit below (checkpoint:decision tasks produce no independent commit of their own)
3. **Task 3: Capture once, verify green, commit the record with the fixtures** - `cb12356` (feat) — this session: extended `determinism_baseline.js`'s corpus model, ran `--capture` once against 31 seeds, verified 31/31 + `--assert-clean` + full `npm test` + the two named test scripts, and closed out `docs/DETERMINISM-RERECORD.md` Section 6b

**Plan metadata:** committed separately (see `<final_commit>`), covering `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/ROADMAP.md`, and this SUMMARY.

_Note: `docs/DETERMINISM-RERECORD.md`'s Task 2 doc edits (Section 6 verdict) were present but uncommitted on disk at the start of this continuation session — they were included in the Task 3 commit (`cb12356`) alongside the fixtures, since that commit is exactly where D-16's "explanation travels with the fixtures" requirement is satisfied._

## Files Created/Modified

- `scripts/determinism_baseline.js` - extended the corpus model from a plain 30-seed loop to base-range + `EXTRA_SEEDS`, via `allSeedsWithIndex()`; updated header comment and manifest fields (`extraSeeds`, `seatRotation` description)
- `scripts/fixtures/determinism/manifest.json` - re-captured against the 31-seed corpus (new `capturedAt`, `engineSourceHash`, `perSeed` with 31 entries, `extraSeeds: [12379]`)
- `scripts/fixtures/determinism/seed-12345.jsonl` … `seed-12374.jsonl` - all 30 base seeds re-captured against the post-D-15/D-18/D-21 engine
- `scripts/fixtures/determinism/seed-12379.jsonl` - new fixture for the added seed
- `docs/DETERMINISM-RERECORD.md` - Section 6b added: add-a-seed resolution, search log, new manifest identity, recovery path
- `.planning/REQUIREMENTS.md` - VERIFY-02 reworded to "(31/31)" and marked complete in both the checkbox list and the traceability table

## Decisions Made

- **capture-now** (Wyatt, prior session): re-record the corpus now; the D-26 pre-storm assertion is explicitly superseded by per-key attribution evidence, on the grounds that Tortuga's wind shadow (D-18) is a wind effect that fires every round, not a storm-gated one, so the literal assertion was unachievable by construction rather than by defect.
- **add-a-seed** (Wyatt, this session): when the coverage gap surfaced, grow the corpus by one explicit seed rather than accept the gap or weaken `REQUIRED_EVENT_TYPES` — the coverage guard itself is worth keeping since a shipwreck is a real, reachable game outcome.
- Corpus shape: base range appended-with-extras rather than inserted, so the original 30 seeds' `seedIndex` and personality rotation never shift and stay directly comparable to every prior measurement in `DETERMINISM-RERECORD.md`.
- Seed selection: first-match over a bounded search (5 candidates), evaluated at the seed's real future `seedIndex` (30), for reproducibility.

## Deviations from Plan

### Auto-fixed / Directed Issues

**1. [Rule 4 pattern, resolved by explicit human decision, not auto-applied] Corpus extended from 30 to 31 seeds**
- **Found during:** Task 3, first `--capture` attempt
- **Issue:** `capture()`'s own coverage assertion (`scripts/determinism_baseline.js:127-131`, now shifted a few lines due to the `EXTRA_SEEDS` addition) failed: `FAIL capture: corpus does not cover required event type(s): shipwrecked`. This is an architectural change (growing the corpus, not a bug fix), so per Rule 4 it was not auto-applied — it was surfaced to Wyatt (in the prior session's checkpoint escalation) and resolved by his explicit **add-a-seed** answer, carried into this session via the orchestrator's resume instructions.
- **Fix:** Extended `scripts/determinism_baseline.js` with an `EXTRA_SEEDS` constant and `allSeedsWithIndex()` helper; found seed 12379 by bounded first-match search; re-ran `--capture` once against the 31-seed corpus.
- **Files modified:** `scripts/determinism_baseline.js`, `scripts/fixtures/determinism/manifest.json`, `scripts/fixtures/determinism/seed-12379.jsonl` (new), all 30 base seed files (re-captured)
- **Verification:** `--verify` 31/31 PASS, `--assert-clean` exit 0, `npm test` all nine gates green, both named test scripts pass
- **Committed in:** `cb12356`

**2. [Superseded plan artifact] Task 3's hardcoded `<verify>` check `m.perSeed.length!==30` no longer applies**
- **Found during:** Task 3
- **Issue:** The plan's own automated verification snippet for Task 3 checks `m.perSeed.length!==30` — written before Wyatt's add-a-seed decision existed. With the corpus now legitimately 31 seeds by explicit human decision, this literal check would fail, but its underlying intent (the manifest carries a complete, coverage-satisfying corpus) is met at 31.
- **Resolution:** Not "fixed" (the plan's `<verify>` block is historical text, not runtime code) — instead verified the check's *intent* manually: `m.perSeed.length === 31`, `m.requiredEventTypes.filter(t => !(m.coverage[t]>0))` is `[]`, and the doc contains no `AWAITING DECISION`/`PENDING` marker and does contain `m.engineSourceHash` verbatim. All pass. Documented here so a future reader of `14-04-PLAN.md`'s literal `<verify>` text isn't confused by the discrepancy.
- **Files modified:** none (verification-only)
- **Committed in:** n/a (documentation note only)

---

**Total deviations:** 2 (1 human-directed architectural change carried in via resume instructions, 1 documentation note about a superseded literal check)
**Impact on plan:** Both are exactly what the resume instructions anticipated and directed; no scope creep, no unauthorized architectural change — the corpus-size change was Wyatt's explicit call, not an auto-fix.

## Issues Encountered

- First `--capture` attempt (prior session) blocked as designed by the coverage assertion — this was the expected "second gate" the resume instructions anticipated, not a bug. Resolved by the add-a-seed extension above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The determinism gate (`npm run test:determinism` / `npm test`'s first gate) is green again and usable for the rest of the phase and milestone — 14-05 and 14-06 can rely on it to catch regressions.
- VERIFY-02 is complete. STORM-01 remains open, tracked for 14-05 (per-square boat movement during storm gusts) — deliberately untouched by this plan.
- `docs/DETERMINISM-RERECORD.md` is a complete, closed record: both human decisions (capture-now + D-26 substitution; add-a-seed) are attributed, dated 2026-07-26, and the new manifest identity is named, so a future re-record (if ever needed) has a clear precedent to follow and a clear recovery path to fall back on.

---
*Phase: 14-engine-adjacent-gameplay-fixes-determinism*
*Completed: 2026-07-26*

## Self-Check: PASSED

- FOUND: docs/DETERMINISM-RERECORD.md
- FOUND: scripts/fixtures/determinism/seed-12379.jsonl
- FOUND: scripts/fixtures/determinism/manifest.json
- FOUND: .planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-04-SUMMARY.md
- FOUND: commit cb12356 (Task 3)
- FOUND: commit 7f605e1 (Task 1)
