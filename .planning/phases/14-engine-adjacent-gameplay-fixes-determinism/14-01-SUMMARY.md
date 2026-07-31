---
phase: 14-engine-adjacent-gameplay-fixes-determinism
plan: 01
subsystem: testing
tags: [determinism, engine, tooling, node, jsonl]

requires: []
provides:
  - "scripts/determinism_diff.js — full per-seed determinism divergence tool (diffAllSeeds), proven fail-first"
  - "D-18 leeward() wind-shadow fix in src/engine/index.js"
  - "docs/DETERMINISM-RERECORD.md seeded with real per-seed divergence measurements"
affects: [14-02, 14-03, 14-04, 14-05, 14-06]

tech-stack:
  added: []
  patterns:
    - "Companion-tool-on-top-of-determinism_baseline.js pattern (import MANIFEST_PATH/playSeed/serializeSeed, never reimplement)"
    - "Fail-first tool proof: run the new tool against a known-clean corpus before trusting it against a dirty one"

key-files:
  created:
    - scripts/determinism_diff.js
    - docs/DETERMINISM-RERECORD.md
  modified:
    - src/engine/index.js

key-decisions:
  - "leeward() now tests the upwind square against isHome() as well as isIsland() (D-18) — Tortuga casts a wind shadow like every other island"
  - "Determinism gate is deliberately left RED (19/30 seeds diverge) — re-record deferred to 14-04 per D-16"
  - "D-26's literal pre-storm-divergence assertion is implemented honestly and reported as failing for 16/19 divergent seeds, with the measured mechanism documented rather than the assertion weakened"

patterns-established:
  - "scripts/determinism_diff.js's diffOneSeed()/diffAllSeeds() shape for any future full-corpus divergence tooling"

requirements-completed: [VERIFY-02, STORM-01]

coverage:
  - id: D1
    description: "scripts/determinism_diff.js enumerates every divergent event across all 30 seeds (never stops at the first), tagged by event type, round, storm flag, and differing JSON keys"
    requirement: "VERIFY-02"
    verification:
      - kind: unit
        ref: "node scripts/determinism_diff.js --json (shape/count assertion)"
        status: pass
      - kind: unit
        ref: "node scripts/determinism_diff.js --assert-clean (fail-first proof: exit 0 pre-D-18, exit 1 post-D-18)"
        status: pass
    human_judgment: false
  - id: D2
    description: "leeward() closes the D-18 Tortuga wind-shadow gap, tested against home as well as islands"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "grep + AST-shape check for isHome( inside leeward()"
        status: pass
    human_judgment: false
  - id: D3
    description: "docs/DETERMINISM-RERECORD.md records the tracer's real findings and leaves the verdict PENDING for 14-04"
    requirement: "VERIFY-02"
    verification:
      - kind: unit
        ref: "node -e marker-presence + line-count check on docs/DETERMINISM-RERECORD.md"
        status: pass
    human_judgment: false

duration: 30min
completed: 2026-07-26
status: complete
---

# Phase 14 Plan 1: Determinism Diff Tooling + Tortuga Wind Shadow Summary

**Built a full per-seed divergence tool proven fail-first, then landed D-18's Tortuga wind-shadow fix — 19/30 fixture seeds now deliberately diverge, with every divergence attributed by event type and JSON key.**

## Performance

- **Duration:** ~30 min
- **Completed:** 2026-07-26
- **Tasks:** 2/2
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments
- `scripts/determinism_diff.js` closes the real tooling gap D-26 identified: `verify()` only reports the first divergent seed/event, which cannot support a safe re-record decision once a real behavior change is in flight. The new tool walks all 30 seeds and every divergent line within each, tagged with event `t`, `round`, `storm`, and the exact set of differing JSON keys (truncated to 160 chars, mirroring `determinism_baseline.js`'s own display convention).
- Proved the tool fail-first per the plan's explicit requirement: `--assert-clean` exited 0 (zero divergent seeds) against the unchanged engine, then exited 1 (19 divergent seeds) immediately after the D-18 change — recorded in both this SUMMARY and `docs/DETERMINISM-RERECORD.md`.
- Landed D-18: `leeward()` in `src/engine/index.js` now tests the upwind square against `isHome()` as well as `isIsland()`, mirroring the existing `isIsland(o)||isHome(o)` parity already used by `stepToward`'s `pass()`. Tortuga now casts a wind shadow like every other island, closing a real fairness/consistency gap.
- Ran the real diff for real: 19/30 seeds diverge, 19/19 of those are structural (none are additive-only against `--ignore-keys=wind2`, since `wind2` doesn't move in this plan's scope). 16 of the 19 diverge before their first storm event — confirmed mechanism: every player spawns on a Tortuga berth, so `leeward()`'s wind-shadow effect (not storm-gated) changes bot routing from round 1 in many seeds.
- Seeded `docs/DETERMINISM-RERECORD.md` with the real measured numbers (divergent-seed count, per-event-type histogram, per-key histogram, per-seed `preStormStructuralDivergence` verdicts) so 14-04's re-record checkpoint has evidence, not assertions, to work from. Verdict left explicitly `PENDING`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Full per-seed divergence tooling, proved fail-first, then Tortuga's wind shadow (D-26 + D-18)** - `5b7b960` (feat)
2. **Task 2: Seed the re-record record with the tracer's real findings (D-16)** - `a1a7522` (docs)

_No TDD tasks in this plan — both are `type="tracer"`/`type="auto"`._

## Files Created/Modified
- `scripts/determinism_diff.js` - Full per-seed determinism divergence tool. Exports `diffAllSeeds(opts)`; CLI flags `--assert-clean`, `--ignore-keys=<csv>`, `--json`. Imports `MANIFEST_PATH`/`playSeed`/`serializeSeed` from `determinism_baseline.js` and `loadEngine` from `./lib/load_engine.js` — no reimplementation of the comparison oracle.
- `src/engine/index.js` - `leeward()` (D-18): the upwind square is now tested against `isHome()` in addition to `isIsland()`. No other engine logic touched (`moored()` byte-unchanged, confirmed by grep).
- `docs/DETERMINISM-RERECORD.md` - The D-16 re-record record: why the corpus is being re-recorded (D-15/D-18/D-21), what the old oracle proved and the recovery path, the tracer's real D-18-only findings, the honest D-26 verdict, and a `PENDING` overall verdict awaiting 14-04.

## Decisions Made
- Kept the leeward() fix to a single one-line-body change (comma-declared `d`/`up` locals), matching the file's existing compact idiom rather than expanding it into multiple statements.
- Added `structuralDivergentSeeds` and `preStormStructuralFailures` fields to the diff tool's summary object (beyond the plan's literal minimum schema) so the `--ignore-keys` comparison and the D-26 rollup could be verified programmatically without re-deriving them from the per-seed array each time. This is additive to the required schema, not a substitution for any required field.
- For "unparseable line" tool errors, followed the plan's "no try/catch" instruction literally: `JSON.parse` is called directly without a wrapping try/catch, so a genuinely corrupt line crashes the process with Node's default uncaught-exception handling (non-zero exit) rather than a caught, custom error message — consistent with the rest of the file's guard-clause-only style. Missing manifest/missing fixture ARE explicit guard-clause checks (`fs.existsSync` + `console.error` + `process.exit(1)`), since those are anticipated conditions this tool can name in advance.

## Deviations from Plan

None - plan executed exactly as written. The one interpretive judgment call (the "no try/catch" instruction applied literally to the unparseable-line case) is documented above under Decisions Made rather than as a deviation, since it does not change any file the plan named or any required behavior.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `scripts/determinism_diff.js` is committed and available for 14-02 through 14-06's determinism verification needs, and specifically for 14-04's re-record checkpoint.
- `docs/DETERMINISM-RERECORD.md` exists with D-18's real numbers already recorded; 14-02/14-03 (D-15's gust alignment, D-21's moored-reason tagging) should append their own findings to Section 3/4 before 14-04 runs `--capture`.
- **`npm test`'s determinism gate (`node scripts/determinism_baseline.js --verify`) is RED by design and will stay RED (19/30 seeds failing) until 14-04's `--capture` re-records the corpus.** This is the expected, documented state — do not "fix" it by reverting `leeward()` or by running `--capture` early. The other eight `npm test` gates (`engine_contract_check.js`, `dlog_replay_test.js`, `net_registry_test.js`, `net_contract_check.js`, `state_contract_check.js`, `module_graph_check.js`, `ui_contract_check.js`, `no_undef_check.js`) all pass.
- No blockers for 14-02/14-03 (UI-tier bot storm-stepping and hail restructuring do not depend on this plan's engine change).

---
*Phase: 14-engine-adjacent-gameplay-fixes-determinism*
*Completed: 2026-07-26*

## Self-Check: PASSED

- FOUND: scripts/determinism_diff.js
- FOUND: docs/DETERMINISM-RERECORD.md
- FOUND: .planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-01-SUMMARY.md
- FOUND: commit 5b7b960 (Task 1)
- FOUND: commit a1a7522 (Task 2)
