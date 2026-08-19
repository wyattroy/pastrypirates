---
phase: 01-before-the-engine-freezes
plan: 05
subsystem: bots
tags: [engine, bot-planner, dead-code, determinism, gate, fix-06]

# Dependency graph
requires:
  - phase: 01-before-the-engine-freezes/01-03
    provides: "The ladder rewritten to name no planner method, plus the 400-game balance baseline. That rewrite is what made this deletion safe — it removed the only external caller."
  - phase: 01-before-the-engine-freezes/01-04
    provides: "Game.prototype.doPass(p) and the pass narration. Untouched here; the ladder record proves this deletion did not disturb it."
provides:
  - "4/src/engine/index.js ships exactly ONE whole-turn planner; planTurn dispatches to the race planner unconditionally and there is nothing else left to dispatch to."
  - "The four helpers only the deleted planner called are gone: the leg-cost helper, the turns-to-win helper, its conditional variant, and the denial-value helper."
  - "FIX-06's divergent float tie-break tolerance is resolved BY REMOVAL — the looser value lived only inside the deleted planner."
  - "4/scripts/planner_singleton_check.js — a 41-assertion gate holding the invariant in both directions, demonstrated failing both ways."
  - "A measured proof that the deletion was behaviour-neutral, so plan 06 can attribute its before/after movement to the pass dubloon alone."
affects: [01-06 balance delta, 03 determinism corpus, 06 cutover, 09 written record]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Asserted line-range surgery for deletions whose targets differ from live code by one character — every range asserts its first and last line verbatim before a byte is spliced, and post-conditions check absence AND presence."
    - "Behaviour-neutrality proved by a byte-identical before/after harness record, itself red-proofed by perturbing a live constant."

key-files:
  created:
    - 4/scripts/planner_singleton_check.js
  modified:
    - 4/src/engine/index.js

key-decisions:
  - "Deleted PLAN.planCells alongside the five named symbols — after the shortlisting planner went, nothing read it, which is exactly the tuning knob that measures nothing this plan exists to remove."
  - "Repaired five inline comments on LIVE code that used a now-deleted helper as their reference point, rather than leaving dangling names."
  - "Moved the `explain` hook's documentation onto the surviving planner instead of deleting it with the incumbent — the hook is live and that note was the only place it was written down."
  - "docs/BOT-V3-RACE-PLANNER.md and docs/FABLE-BOT-BRIEF.md deliberately NOT edited. Their numbers become unreproducible today and stay true as the record of why the race planner was chosen; annotating them is Phase 9's work."

patterns-established:
  - "Pattern: pair every absence assertion with a presence assertion. An absence-only gate passes against an emptied file."
  - "Pattern: match a deleted method by DECLARATION SHAPE (line start, indent, name, open paren), never by bare word, when a live symbol shares its prefix."
  - "Pattern: when identity between two runs is the EXPECTED result, red-proof the comparison by perturbing a live constant and watching it move."

requirements-completed: [FIX-06]

coverage:
  - id: D1
    description: "The engine ships exactly one bot planner — the classic whole-turn planner and its four dead helpers are gone from 4/src/engine/index.js."
    requirement: FIX-06
    verification:
      - kind: unit
        ref: "node 4/scripts/planner_singleton_check.js"
        status: pass
      - kind: unit
        ref: "node --check 4/src/engine/index.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "The v3-suffixed helpers survive, each present on Game.prototype, callable, and declared in source."
    requirement: FIX-06
    verification:
      - kind: unit
        ref: "node 4/scripts/planner_singleton_check.js — the LIVE v3 helper assertions, demonstrated failing by renaming tour3"
        status: pass
      - kind: integration
        ref: "node scripts/bot_ladder4.js 5 7919 --json"
        status: pass
    human_judgment: false
  - id: D3
    description: "FIX-06's precision edge resolved: one tie-break tolerance in the file, not two."
    requirement: FIX-06
    verification:
      - kind: unit
        ref: "node 4/scripts/planner_singleton_check.js — looser tolerance 0 lines, tighter tolerance 3 lines"
        status: pass
    human_judgment: false
  - id: D4
    description: "The deletion is behaviour-neutral, so plan 06's before/after attribution is not confounded."
    requirement: FIX-06
    verification:
      - kind: integration
        ref: "node scripts/bot_ladder4.js 20 7919 --json — byte-identical either side of the deletion, sha256 a2224555; red-proofed by RACE_BIAS 2.75 -> 0.5"
        status: pass
    human_judgment: false
  - id: D5
    description: "The engine remains determinism-clean: zero wall-clock and zero random sources under 4/src/engine/."
    requirement: FIX-06
    verification:
      - kind: unit
        ref: "node 4/scripts/planner_singleton_check.js and node 4/scripts/pass_coin_test.js"
        status: pass
    human_judgment: false

# Metrics
duration: 42min
completed: 2026-08-18
status: complete
---

# Phase 1 Plan 05: One Brain in the Engine Summary

**The dead classic whole-turn planner and the four helpers only it called are deleted from `4/src/engine/index.js` — 317 lines gone, the divergent float tolerance resolved by removal, and a 41-assertion gate that has been watched failing in both directions.**

## Performance

- **Duration:** 42 min
- **Started:** 2026-08-18T21:52:00Z
- **Completed:** 2026-08-18T22:34:00Z
- **Tasks:** 2
- **Files modified:** 2 (1 modified, 1 created)

## Accomplishments

- `4/src/engine/index.js` now holds exactly one whole-turn planner. `planTurn(p)` dispatches to the race planner unconditionally and there is nothing else in the file to dispatch to. No future tuning pass can aim at code that never runs.
- The four helpers only the deleted planner called are gone with it. The **v3-suffixed versions survive intact** — that one-character distinction was the whole risk of this plan and it is now held by a gate.
- **FIX-06's precision edge is resolved by removal, not reconciliation.** The looser tie-break tolerance the intake audit flagged existed only inside the deleted planner; the tighter one used at three sites in the race planner is now the file's only tolerance.
- The deletion is **measured behaviour-neutral**, so plan 06 can attribute its before/after movement to the pass dubloon rather than to a confounded tree.
- `4/scripts/planner_singleton_check.js` gates the invariant in **both** directions, in 0.1 seconds.

## Task Commits

1. **Task 1: Remove the dead planner subtree and the comments that described it** — `1c110d3` (refactor)
2. **Task 2: Gate the singleton, then sweep every `4/` gate and prove the diff scope** — `5af7e20` (test)

## Files Created/Modified

- `4/src/engine/index.js` — 32 insertions, 317 deletions. The classic whole-turn planner and its four exclusive helpers removed; the comment blocks describing them removed or rewritten; a new `ONE BRAIN` block at the `planTurn` dispatch stating what is now true.
- `4/scripts/planner_singleton_check.js` — new, 151 lines. Half runtime (`Game.prototype`), half source text.

## The pre-deletion re-verification, recorded

Every one of the five names was grepped **with word boundaries** (`grep -rnE '\bNAME\b'`) across six locations: `4/src/`, `4/scripts/`, root `scripts/`, root `src/`, `docs/`, and `package.json`. Word boundaries matter here — a bare `legTurns` search also matches `legTurns3`, which is live.

| Symbol | Total hits | Inside the deleted subtree | Comment/prose only | **Live caller outside the subtree** |
|---|---|---|---|---|
| the classic planner | 10 | 1 (its own declaration) | 9 | **0 in `4/`** |
| the leg-cost helper | 17 | 4 | 13 (all in `docs/`) | **0** |
| the turns-to-win helper | 48 | 6 | 42 | **0** |
| its conditional variant | 14 | 9 | 5 | **0** |
| the denial-value helper | 5 | 4 | 1 | **0** |

**The hits outside `4/` that name these symbols in CODE all belong to other trees, and every one was checked by reading its import line:**

- `scripts/bot_ladder3.js:31` holds the classic planner in a live `const` — it imports `../3/src/engine/index.js`. Different tree. Phase 6 deletes `3/`.
- `scripts/measure_race_spread.mjs:27` reassigns `planTurn` to it — also imports `../3/src/engine/index.js`.
- `scripts/bot_matrix.js:45` calls the turns-to-win helper — imports `../v2bakeoff/src/engine/index.js`.
- `scripts/bakeoff_baseline.js` names it in prose only — imports `../v2bakeoff/`.
- `scripts/bot_ladder4.js` is the **only** script in the repository that imports `../4/src/engine/index.js`, and after plan 01-03's rewrite it names **no** planner method at all. Confirmed by grep: zero hits for any of the five.

**Two adjacent symbols were checked and survive, each with a verified reachable caller after the deletion:**

- `destField` — the deleted leg-cost helper was one caller; `planTurnV3` is the other (`const aimField=this.destField(aimCell);`). Live.
- `threatTurns` — the deleted denial-value helper was one caller; `threatUrgency` and `interceptOf` are the others. Live.

One symbol did NOT survive the check: **`PLAN.planCells`**. After the shortlisting planner went, nothing read it. See Deviations.

## The graveyard, read before deleting

Per CLAUDE.md §2, run as commands rather than assumed:

```
git log --all --oneline --grep="planTurnClassic" -i   -> exactly ONE hit
git log --all --format="%H %s" -S "planTurnClassic"   -> the same commit, plus Phase 1's own docs
```

The single hit is `8eb1a95` *"3: the race planner — a new bot brain, proved on the ladder"* — the commit that **introduced** it as the control arm. No later commit discusses removing, restoring or reconsidering it. So the "zero callers" claim in the record was never re-checked; it is not a removal previously attempted and reverted. **This is not a settled argument being re-run.**

## Behaviour-neutrality, measured (not in the plan text — required by the executor brief)

Plan 06 diffs an after-run against `01-BALANCE-BASELINE.md` and attributes the movement to the pass dubloon. If this deletion changed engine behaviour at all, that attribution would be confounded (HARD-WON-LESSONS §2, *"beware confounded metrics"*).

```
BEFORE:  node scripts/bot_ladder4.js 20 7919 --json
AFTER:   node scripts/bot_ladder4.js 20 7919 --json     (identical command)

sha256   a2224555a51f455dcac2883de28e72051e31aa301d51f3a415ceb5f07e7b9cc1   before.json
sha256   a2224555a51f455dcac2883de28e72051e31aa301d51f3a415ceb5f07e7b9cc1   after.json
diff     (no output) — BYTE-IDENTICAL
```

Re-run a third time after the orphaned-constant removal: **still byte-identical.**

**Identical numbers across genuinely different treatments are normally an alarm** (HARD-WON-LESSONS §0), so the comparison was red-proofed rather than believed. Perturbing a live planner constant — `RACE_BIAS` 2.75 → 0.5 — moved wins, turns and pass rate on every seat (seat 0: 8 wins/264 turns/126 passes → 7/278/133; seat 1: 1/277/151 → 2/291/155). The tree was then restored and re-measured identical. **The check can fail. It simply does not, because the deleted subtree had no reachable caller — and here a DIFFERENCE would have been the alarm.**

## The two failure demonstrations

A check nobody has seen fail is not yet a check (CLAUDE.md §4). Both directions matter here because a one-character name difference separates live code from dead code.

**Demonstration 1 — reintroduce the deleted planner.** A one-line stub method with the deleted planner's name was added to the class. It parsed (`node --check` clean), so nothing else would have noticed.

```
exit code 1, 3 named failures:
  FAIL  the classic planner is undefined on Game.prototype                    got="function" want="undefined"
  FAIL  the classic planner is absent from the prototype's own property names  got=true      want=false
  FAIL  the classic planner's name appears nowhere, code or comment            got=1         want=0
```
Restored → **exit 0**.

**Demonstration 2 — delete a LIVE helper by mistake.** The tour helper's declaration was renamed (`tour3` → `tour3RENAMED`). It also parsed clean.

```
exit code 1, 3 named failures:
  FAIL  the LIVE v3 helper tour3 is present on Game.prototype   got=false      want=true
  FAIL  the LIVE v3 helper tour3 is callable                    got="undefined" want="function"
  FAIL  the LIVE v3 helper tour3 IS declared as a method        got=false      want=true
```
Restored → **exit 0**.

## The gate sweep

There is still no combined runner for the `4/` gates — wiring them into root `npm test` is Phase 3's TEST-04/05 and explicitly out of scope — so each was run by name.

| Gate | Exit |
|---|---|
| `node 4/scripts/stage_import_check.js` | 0 |
| `node 4/scripts/no_undef_check.js` | 0 |
| `node 4/scripts/pp4_timeroff_check.js` | 0 |
| `node 4/scripts/pass_coin_test.js` | 0 |
| `node 4/scripts/pass_narration_test.js` | 0 |
| `node 4/scripts/planner_singleton_check.js` | 0 (0.10s, 41 assertions) |
| `npm test` (root, **21 gates**) | 0 — `PASSED — 0 failing check(s)` |
| `node scripts/bot_ladder4.js 5 7919 --json` | 0 |

The last row is the check that would have caught the original "zero callers" mistake: the ladder runs against the reduced engine.

## Tree scope proved (CLAUDE.md §3)

```
git diff --name-only ee14ae8..HEAD
  4/scripts/planner_singleton_check.js
  4/src/engine/index.js
```

**Four trees named and proved untouched:** `v2/`, `v2bakeoff/`, `3/`, and root `src/`. Also absent: `docs/` (both bot documents deliberately left alone), `CNAME`, `robots.txt`, `sitemap.xml`. `PP4_STAMP` is still `2026-08-18c` — the orchestrator owns that line. `scripts/bot_ladder4.js` and `01-BALANCE-BASELINE.md` are byte-unchanged, which is the basis of plan 06's comparison.

No headless Chrome and no local server were started; `pgrep` for both returned nothing before this reply.

## Decisions Made

- **Deleted `PLAN.planCells` too.** It was the shortlisting planner's tuning knob and nothing read it after the deletion. Leaving a config constant nothing reads is precisely the "dead code that looks like a tuning target" this plan exists to remove.
- **Moved the `explain` hook's documentation rather than deleting it.** That note lived only on the deleted planner and the hook is live on the surviving one (`planTurnV3` opens with `const log=this.explain;`). Deleting the comment would have silently un-documented a live capability — the exact grep-cannot-find-it failure of HARD-WON-LESSONS §0.
- **Left the design docs alone.** `docs/BOT-V3-RACE-PLANNER.md` (`:9`, `:179`) and `docs/FABLE-BOT-BRIEF.md` still cite the deleted planner as the control arm of every published bot number. Those numbers are now unreproducible against this tree, which Wyatt accepted (D-05). They stay true as the record of *why* the race planner was chosen. Annotating them is Phase 9's work: a ledger is amended, not rewritten mid-flight.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Five inline comments on LIVE code were left naming deleted helpers**

- **Found during:** Task 1, in the post-deletion word-boundary sweep
- **Issue:** After the deletion, five comments attached to live functions still used a now-vanished symbol as their reference point — the `bakeTurns` config note, the `cratePrice` black-market note, `sailTurns`'s fractional-vs-ceiled account, and the mutate-and-restore contract notes on `rivalEta3If` and `turnsToWin3If`. The executor brief's rule 7 is explicit: *a comment describing a function that no longer exists is a lie the next reader has to disprove.* A reader greps the name, finds nothing, and has to reconstruct the argument.
- **Fix:** Minimal one-phrase repairs that keep each comment true — the dead name replaced by its live successor (`turnsToWin3`, `turnsToWin3If`, `rivalEta3If`) or by the thing it actually meant ("the objective"). No behaviour, no code.
- **Files modified:** `4/src/engine/index.js`
- **Verification:** `grep -nE '\b(legTurns|turnsToWin|turnsToWinIf|denialValue|planTurnClassic)\b' 4/src/engine/index.js` returns nothing; ladder record still byte-identical.
- **Committed in:** `1c110d3`

**2. [Rule 2 - Missing Critical] `PLAN.planCells` was orphaned by the deletion**

- **Found during:** Task 1, checking which config constants lost their last reader
- **Issue:** `planCells:6` was the deleted planner's candidate-shortlist size. After the deletion its only remaining occurrence was a prose mention in a comment. The plan's own objective is that "dead code that looks like a tuning target is worse than no code — a future tuning pass can aim at it and measure nothing." A live-looking tuning knob nothing reads is that failure in its purest form.
- **Fix:** Removed the constant and its four-line comment; rewrote the one prose reference in the race planner's block to describe the incumbent's shortlist without naming a constant that no longer exists.
- **Files modified:** `4/src/engine/index.js`
- **Verification:** `grep -c planCells` returns 0; `node --check` clean; ladder record re-run and **still byte-identical**, so the removal is behaviour-neutral like the rest.
- **Committed in:** `1c110d3`

**3. [Rule 2 - Missing Critical] Behaviour-neutrality was measured, which the plan text did not require**

- **Found during:** Task 1, before the deletion
- **Issue:** The plan verified syntax and gates but never proved the deletion did not move engine behaviour. Plan 06 attributes its before/after delta to the pass dubloon; a silently behaviour-changing deletion in between would confound that attribution and nothing downstream would catch it.
- **Fix:** Captured a 20-game `--json` ladder record before the deletion and an identical one after, diffed them, and red-proofed the comparison by perturbing a live constant.
- **Files modified:** none (measurement only)
- **Verification:** byte-identical, sha256 `a2224555`; red-proof moved every seat.
- **Committed in:** recorded here, not in code.

---

**Total deviations:** 3 auto-fixed (all Rule 2 — missing critical).
**Impact on plan:** No scope creep. Two are comment/constant hygiene the plan's own objective demands; the third is a measurement that protects the next plan's headline number. All three are behaviour-neutral and proved so by the same byte-identical ladder record.

## Issues Encountered

- **The deletion was not one contiguous range.** `destField` sits between the classic objective comment block and the leg-cost helper, and it is LIVE — `planTurnV3` calls it. A single-range deletion would have taken it out along with everything else. Handled by splitting the surgery into five asserted ranges and asserting `destField`'s declaration line verbatim as a survivor.
- **Regex deletion was ruled out deliberately.** HARD-WON-LESSONS §3 records that a brace matcher stops at the wrong brace, and §1 that a `replace()` matching nothing returns the input unchanged and reports success. The script asserts the first and last line of every range verbatim before splicing a byte, and its post-conditions check ten live names still present as well as the five dead ones absent. A drifted range aborts having written nothing.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **FIX-06 is satisfied in full, both halves.** The engine ships exactly one bot planner (this plan) and the only script in the repo that loads `4/` runs against it (plan 03).
- **Plan 06 is unblocked and its comparison is clean.** `scripts/bot_ladder4.js`, `01-BALANCE-BASELINE.md` and the seed family are byte-unchanged, and this deletion is proved not to have moved the numbers, so any delta plan 06 measures belongs to the pass dubloon.
- **This was the last structural change to the engine before Phase 3 freezes its behaviour.** `4/src/engine/` holds zero wall-clock and zero random sources, asserted by two independent gates.
- **Carried to Phase 9:** `docs/BOT-V3-RACE-PLANNER.md` (`:9`, `:179`) and `docs/FABLE-BOT-BRIEF.md` cite a planner that no longer exists in this tree. Their numbers need a note saying they became historical today — **not** a correction and **not** a deletion.
- **Carried to Phase 3:** the six `4/` gates still have no combined runner and must each be invoked by name. TEST-04/05 wires them into root `npm test`.

## Self-Check: PASSED

All claimed files exist on disk (`4/scripts/planner_singleton_check.js`, `4/src/engine/index.js`, this SUMMARY) and both claimed commits are reachable in `git log` (`1c110d3`, `5af7e20`).

---
*Phase: 01-before-the-engine-freezes*
*Completed: 2026-08-18*
