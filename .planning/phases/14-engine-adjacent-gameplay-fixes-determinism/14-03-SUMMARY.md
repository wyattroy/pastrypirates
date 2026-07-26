---
phase: 14-engine-adjacent-gameplay-fixes-determinism
plan: 03
subsystem: engine
tags: [determinism, engine, storm, moored, rng, jsonl]

requires:
  - phase: 14-engine-adjacent-gameplay-fixes-determinism
    provides: "14-01's scripts/determinism_diff.js (used here to attribute this plan's two changes) and D-18's leeward() Tortuga wind-shadow fix (untouched by this plan)"
provides:
  - "D-15: the all-bot simulator applies both storm gusts (up to 4 squares) sharing one dodgedOnce, mirroring the live bot turn; play() rolls windNow2 from PERP at the orchestrator-matching RNG draw point"
  - "D-19/D-21: Game.mooredReason(p) — the FIRST matching cause (justDocked/dock/home), null when none match; moored(p) is now mooredReason(p)!==null; every windPush moored event carries a reason"
  - "scripts/storm_moored_reason_test.js — DOM-free coverage for the three moored causes, the unchanged moored() boolean, and the D-19 berth-protection regression guard"
  - "docs/DETERMINISM-RERECORD.md updated with the combined D-15+D-18+D-21 divergence attribution (30/30 seeds now diverge, up from 19/30 after D-18 alone)"
affects: [14-04, 14-05, 14-06]

tech-stack:
  added: []
  patterns:
    - "Seed-search-for-geometric-precondition test construction: rather than hardcoding board coordinates against one frozen seed, scan a small range of seeds for one whose generated board satisfies every shape a test battery needs (a real dock adjacent to its own island, an island-adjacent water cell, a Tortuga berth with an island one further step outward)"

key-files:
  created:
    - scripts/storm_moored_reason_test.js
  modified:
    - src/engine/index.js
    - docs/DETERMINISM-RERECORD.md

key-decisions:
  - "windNow2 is rolled immediately after rollStorm in play(), consuming exactly one extra RNG draw per round at the same point src/orchestrator.js:681-683 draws it — verified by a structural probe asserting no this.r() call sits between the two anchor lines"
  - "takeTurn's storm block copies src/ui/flow.js:556-567's shape verbatim (this. substituted for g.) rather than inventing a variant — same shared dodgedOnce across both windPush calls"
  - "windPush's separate isHome(nx) early return folds into the ordinary isIsland(nx)||isHome(nx) land branch rather than staying a parallel rule, per D-19's geometric proof that a berth always satisfies mooredReason's home cause — the aground/shipwrecked ladder was already unreachable for the home square"
  - "moored(p) is redefined as mooredReason(p)!==null rather than duplicating the precedence chain — same boolean for every input, new accessor only"

patterns-established:
  - "mooredReason(p)'s precedence-chain shape (first-match, null-if-none) as the pattern for any future multi-cause event tagging in this engine"

requirements-completed: [STORM-01, VERIFY-02]

coverage:
  - id: D1
    description: "The all-bot simulator's takeTurn applies both storm gusts (4 squares) sharing one dodgedOnce, and play() rolls windNow2 from PERP at the exact orchestrator-matching RNG draw point"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "node -e structural probes (two windPush calls, shared dodgedOnce, windNow2 draw position/order) — plan Task 1 <verify>"
        status: pass
      - kind: integration
        ref: "node scripts/engine_contract_check.js && node scripts/module_graph_check.js && node scripts/ui_contract_check.js && node scripts/no_undef_check.js && node scripts/dlog_replay_test.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "Game.mooredReason(p) tags every moored event with its actual cause (justDocked/dock/home); moored(p) stays behaviorally identical; the D-19 berth clause and berth-protection guarantee are proven by test"
    requirement: "STORM-01"
    verification:
      - kind: unit
        ref: "scripts/storm_moored_reason_test.js (27/27 checks: all three causes, null-for-none, no-bare-event invariant, D-19 regression guard, blocked/zero-distance edge cases)"
        status: pass
      - kind: unit
        ref: "node -e structural probe (mooredReason defined, moored() delegates to it, berth clause intact, windPush emits moored from exactly one folded site) — plan Task 2 <verify>"
        status: pass
    human_judgment: false
  - id: D3
    description: "Both fixture-perturbing changes (windNow2's additive wind2 field, moored's new reason field) are attributed in the divergence report, not mistaken for unrelated regressions"
    requirement: "VERIFY-02"
    verification:
      - kind: unit
        ref: "node scripts/determinism_diff.js --ignore-keys=wind2 --json (wind2: 7816 lines, additive — same divergent-seed count with/without the ignore flag) and node scripts/determinism_diff.js --json (reason: 157 lines, byEventType.moored: 159 — bounded to moored events only)"
        status: pass
    human_judgment: false
  - id: D4
    description: "The determinism gate stays deliberately RED (30/30 seeds now diverge, up from 19/30) and no --capture was run; the other eight npm test gates plus both new test scripts (hail_ranking_test.js, storm_moored_reason_test.js) pass"
    requirement: "VERIFY-02"
    verification:
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (exit 1, expected) + the other 8 npm test gates + scripts/hail_ranking_test.js + scripts/storm_moored_reason_test.js (all exit 0)"
        status: pass
    human_judgment: false

duration: 30min
completed: 2026-07-26
status: complete
---

# Phase 14 Plan 3: Simulator Rides the Whole Storm + Moored Says Which Rule Fired Summary

**Landed the remaining two fixture-perturbing engine changes for Phase 14 — the all-bot simulator now applies both storm gusts (4 squares, matching the live game), and `moored` events carry a `reason` (`justDocked`/`dock`/`home`) instead of one generic boolean, with the D-19 berth-protection invariant proven by a new 27-check test script.**

## Performance

- **Duration:** ~30 min
- **Completed:** 2026-07-26
- **Tasks:** 2/2
- **Files modified:** 3 (1 created, 2 modified)

## Accomplishments

- **D-15 landed:** `play()` rolls `windNow2` from `PERP` immediately after `rollStorm`, consuming exactly one additional RNG draw per round at the same point `src/orchestrator.js:681-683` draws it — a structural probe confirms no extra `this.r()` call sits between the two. `takeTurn`'s storm block now applies both gusts (up to 4 squares) sharing one `dodgedOnce`, copying `src/ui/flow.js:556-567`'s shape verbatim. The headless simulator no longer under-models the storm the shipping game actually applies.
- **D-19/D-21 landed:** `Game.mooredReason(p)` returns the first matching cause (`justDocked`/`dock`/`home`, `null` if none) in the same precedence `moored()`'s old `||` chain already used. `moored(p)` is now `mooredReason(p)!==null` — same boolean for every input, new accessor. `windPush`'s separate `isHome(nx)` safe-harbor early return folded into the ordinary `isIsland(nx)||isHome(nx)` land branch (D-19's geometric proof: Tortuga's only approach cells are its four berths, and a berth always satisfies the `home` cause, so the old special case was redundant, not load-bearing). Every `moored` event now carries a `reason`; the `anchorHold`/`dodge`/`anchor`/`aground`/`shipwrecked` branches are byte-unchanged.
- **`scripts/storm_moored_reason_test.js` written test-first (TDD)**: proven RED against the pre-fix engine (`g.mooredReason is not a function`), then GREEN after implementation — 27/27 checks covering all three causes end-to-end through `windPush`, the D-19 berth-protection regression guard (a berth pushed toward home never runs aground or shipwrecks, even fully broke and holding nothing), `mooredReason(p)===null` for a player who is none of the three, the "no bare `moored` event" invariant across the whole battery, and the off-grid/zero-distance `windPush` edge cases. Uses a seed-search helper (scans a small range of seeds for one whose generated board satisfies every geometric precondition the battery needs) rather than hardcoding board coordinates against one frozen seed.
- **All three fixture-perturbing decisions for Phase 14 (D-15, D-18, D-21) are now in the tree, before 14-04's single `--capture`.** `docs/DETERMINISM-RERECORD.md` updated with the combined attribution: 30/30 seeds now diverge (up from 19/30 after D-18 alone); `wind2`'s additive nature is proven via `--ignore-keys=wind2` (same divergent-seed count with or without it); `reason`'s scope is bounded to `moored` events only (~157-159 lines vs. thousands of `state`/`tokens`/`wind` cascade deltas from the D-18 routing change).
- **The determinism gate is deliberately RED by design** — `node scripts/determinism_baseline.js --verify` exits 1 (all 30 seeds now diverge, expected and correct). The other eight `npm test` gates (`engine_contract_check.js`, `dlog_replay_test.js`, `net_registry_test.js`, `net_contract_check.js`, `state_contract_check.js`, `module_graph_check.js`, `ui_contract_check.js`, `no_undef_check.js`) all pass, plus both new test scripts from this phase (`hail_ranking_test.js` from 14-02, `storm_moored_reason_test.js` from this plan). No `--capture` was run.

## Task Commits

Each task was committed atomically:

1. **Task 1: The simulator rides the whole storm — both gusts, four squares (D-15)** - `a098ff5` (feat)
2. **Task 2: `moored` says which rule fired, and Tortuga's berths stay safe (D-19, D-21)** - test-first, then implementation:
   - `681e99c` (test) — `scripts/storm_moored_reason_test.js` written and proven RED
   - `17ee908` (feat) — `mooredReason`/`moored`/`windPush` fold, proven GREEN (27/27)
   - `87ad415` (docs) — `docs/DETERMINISM-RERECORD.md` updated with the combined divergence attribution

## Files Created/Modified

- `src/engine/index.js` - Added `PERP` to the shared import; `play()` rolls `windNow2` right after `rollStorm`; `takeTurn`'s storm block applies both gusts sharing one `dodgedOnce`; added `Game.mooredReason(p)`; `moored(p)` redefined in terms of it; `windPush`'s land branch folded to `isIsland(nx)||isHome(nx)`, tagging every `moored` event with a `reason`.
- `scripts/storm_moored_reason_test.js` - New DOM-free test script (27 checks): all three `moored` causes end-to-end through `windPush`, the D-19 berth-protection regression guard, `mooredReason(p)===null` for the no-cause case, the no-bare-event invariant, and off-grid/zero-distance edge cases. Uses a seed-search helper for robust geometric-precondition construction.
- `docs/DETERMINISM-RERECORD.md` - Added Section 3b recording this plan's combined divergence findings (D-15+D-21 on top of D-18); updated Section 1's "Landed in a later plan" placeholders to "Landed in 14-03".

## Decisions Made

- Placed `windNow2`'s roll directly after `const storm=rollStorm(this);` with a comment describing the RNG-parity requirement — deliberately avoided the literal substring `this.r()` inside that comment (it would have false-tripped the plan's own verify probe that scans the gap between the two anchor lines for an extra RNG call), rewording to "one extra RNG draw" instead.
- For the D-19 regression guard in `storm_moored_reason_test.js`, set the test player to zero coins and zero ingredients (the worst case for the aground ladder — otherwise unreachable for the home square per D-19's proof) so the guard actually exercises the branch it claims to protect against, rather than passing vacuously.
- Committed Task 2 as three commits (test → feat → docs) rather than the more common two (test → feat) or one (feat), since the plan's `<output>` explicitly calls for `docs/DETERMINISM-RERECORD.md` to be updated with this plan's own findings before the phase's SUMMARY is written, matching 14-01's precedent of a separate `docs` commit for the re-record record.

## Deviations from Plan

None - plan executed exactly as written. Both tasks matched their `<action>`/`<verify>`/`<acceptance_criteria>` blocks precisely; no auto-fixes, no architectural questions, no scope changes.

## Issues Encountered

- An early attempt to pipe `determinism_diff.js --json` directly into an inline `node -e` verification script produced a confusing raw-JSON "error" from the Bash tool (likely a shell-quoting artifact with the large inline JS string, not a real script failure). Resolved by redirecting to a temp file and running the verification script against it via stdin redirection instead of a pipe — this is a tooling-invocation note, not an engine or test issue, and all verification commands ultimately ran and passed correctly.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three fixture-perturbing decisions for Phase 14 (D-15's storm-gust alignment, D-18's Tortuga wind-shadow fix from 14-01, D-21's moored-reason tagging) are now landed in the tree. `docs/DETERMINISM-RERECORD.md` has the combined, attributed divergence evidence 14-04 needs for its single `--capture` checkpoint.
- **`npm test`'s determinism gate stays RED by design (30/30 seeds now failing, up from 19/30) until 14-04's `--capture` re-records the corpus.** This is the expected, documented, and now-complete-for-this-phase state — do not "fix" it by reverting any engine change or by running `--capture` early. The other eight `npm test` gates, plus `hail_ranking_test.js` (14-02) and `storm_moored_reason_test.js` (this plan), all pass.
- No blockers for 14-04 (the re-record checkpoint) or 14-05 (mirroring `windLeg`/`botTurn` narration in `src/ui/flow.js` — 14-03 deliberately left `src/ui/flow.js` untouched, matching this plan's `files_modified` scope).

---
*Phase: 14-engine-adjacent-gameplay-fixes-determinism*
*Completed: 2026-07-26*
