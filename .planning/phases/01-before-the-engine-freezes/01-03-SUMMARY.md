---
phase: 01-before-the-engine-freezes
plan: 03
subsystem: bot-tuning
tags: [FIX-06, D-05, D-07, balance, measurement, harness]
status: complete
requires:
  - "4/src/engine/index.js — Game, roundCfg, and the {t:\"turn\"}/{t:\"pass\"} event entries (unchanged)"
provides:
  - "scripts/bot_ladder4.js — one-brain, time-axis balance measurement with a --json run record"
  - ".planning/phases/01-before-the-engine-freezes/01-BALANCE-BASELINE.md — the before half of D-07's gate"
affects:
  - "plan 05 (deleting the classic planner) — the ladder no longer names it, so the deletion cannot break it"
  - "plan 06 (the after-run and D-07's checkpoint) — diffs against the committed baseline record"
tech-stack:
  added: []
  patterns:
    - "Harness self-controls with known-in-advance values, red-proofed by deliberate sabotage"
    - "Wall clock to stderr so stdout stays byte-identical for exact before/after diffs"
key-files:
  created:
    - .planning/phases/01-before-the-engine-freezes/01-BALANCE-BASELINE.md
  modified:
    - scripts/bot_ladder4.js
decisions:
  - "The ladder's comparison axis is time, not seat — there is only one brain, so a seat-axis control no longer exists"
  - "The wall clock is excluded from the JSON record and written to stderr, so two runs of the same command are byte-identical on stdout"
  - "Dev seed family x7919 only; the held-out family x104729 is named as available and deliberately not run"
metrics:
  duration: 24m
  completed: 2026-08-19
---

# Phase 1 Plan 03: One Brain, One Measurement Summary

The only script in the repo that loads `4/` now runs the brain the game actually plays, and the
balance baseline is captured as a provenanced fact on a tree where passing does not yet pay.

## What shipped

**`scripts/bot_ladder4.js` rewritten (commit `a019253`).** The seat-splitting arrangement is gone
entirely: the two captured planner references, the `Game.prototype.planTurn` monkey-patch and its
restore line, the `seatsUsingNew` parameter, the control run, the `share`/`ladder` helpers, the four
ladder rows, and the mean-edge verdict block. `planTurn()` already dispatched unconditionally, so the
control seats had been running a planner the game does not play — measuring a game nobody plays.

The comparison axis is now **time**: run the identical command either side of the change and diff the
records. A new `--json` flag emits the whole run as one parseable object so the two sides are diffed
exactly rather than read off two consoles. Positional arguments (`[games] [seedMult]`, defaulting to
400 and 7919) are unchanged, and flags are filtered out of positional parsing so both work together.

Pass rate and voyage length are derived from the `{t:"turn"}` and `{t:"pass"}` entries the engine
**already** records, each tagged with its seat. No engine field was added and nothing about what the
engine emits changed — that would have cost a determinism re-record.

**`01-BALANCE-BASELINE.md` committed (commit `9d5d566`).** 400 games, dev family ×7919, bake-off
ruleset, at SHA `a019253` on node v25.9.0, 287s for both runs.

| seat | strategy | wins | turns | passes | pass rate |
|---|---|---|---|---|---|
| 0 | pirate | 103 | 5856 | 3088 | 52.73% |
| 1 | trader | 101 | 5869 | 3285 | 55.97% |
| 2 | balanced | 105 | 5872 | 3225 | 54.92% |
| 3 | rusher | 91 | 5914 | 3331 | 56.32% |
| — | all seats | 400 | 23511 | 12929 | **54.99%** |

Mean voyage **15.1575 rounds**, unfinished **0**, in-run pass-rate spread across seats **3.59 points**.

## The read-enumeration, as required before changing what a script prints

CLAUDE.md §2's trap in the other direction: replacing a produced quantity with a derived one breaks
whatever read it, and can make a check *vacuous* while it still reads as protection. The −21.2 ladder
regression recorded in `3b14080` came from exactly this — `threatUrgency` was calibrated against a
range that a more truthful `threatTurns` silently moved, and denial raids switched off without a line
of that code changing.

**Searched, and what was found:**

| Searched | Result |
|---|---|
| `package.json` — the 21-gate `test` chain and all 4 other scripts | **Absent.** Every entry is a `scripts/…` gate; `bot_ladder4.js` is not among them. |
| All of `scripts/` (41 files) | No reference. `bakeoff_baseline.js:59` mentions `bot_ladder.js` (the v1 instrument) in prose only. |
| All of `4/scripts/` (7 files) | No reference. |
| `docs/` | Three prose mentions, all historical record, none executing it: `BOT-V3-RACE-PLANNER.md:178` (the +9.8→+12.4 table), `BOT-DESIGN-PRINCIPLES.md:149` and `FABLE-BOT-BRIEF.md` (both cite `bot_ladder.js`, a different file). |
| CI config | **None exists** — no `.github/workflows/`, no Makefile. |
| Repo-wide `grep -rln "bot_ladder4"` outside `.git` | Only the script itself, three docs, and `.planning/` prose. |

**Confirmed: nothing reads this script's output.** No exit-code contract, no gate, no CI — it is a
manual tuning tool invoked by hand. So no check could be made vacuous by changing what it prints. The
expected answer, verified rather than assumed.

The one live consequence: `docs/BOT-V3-RACE-PLANNER.md:178` describes the control arm this rewrite
removed, so its numbers are now unreproducible. That is already known and deferred to Phase 9 by
D-05, which recorded that Wyatt was told and accepted it.

## The controls, and proof they can fail

A harness is unreviewed code and gets no more trust than the thing it measures. Four controls whose
values are known **before** the run are computed and printed every time. Each was then deliberately
broken at the same SHA, because a check only ever seen to pass is indistinguishable from one that
cannot fail (`HARD-WON-LESSONS.md` §2):

| Control | Sabotage applied | What it reported |
|---|---|---|
| the event stream was recorded | `record` flag off | 0 turn events → **flips false** |
| every game accounted for | `if (!w)` instead of `w == null` | 7 games of 5; 2 seat-0 wins misread as unfinished → **flips false** |
| no seat took more turns than rounds | turn events counted twice | worst ratio 2.000 → **flips false** |
| no seat passed more often than it turned | (holds by construction) | max seat rate 0.563 ≤ 1 |

The second sabotage reproduces, in miniature, the fabricated crisis `HARD-WON-LESSONS.md` §3 records —
"46 of 300 voyages never finish" and two rewrites aimed at a regression that did not exist. The script
uses `w == null`; the existing code got this right and it was not regressed.

**Cross-checks between figures in the same output**, because two figures that cannot both be true mean
the harness is wrong, not the game:
- Wins `103+101+105+91 = 400` plus 0 unfinished accounts for every game.
- 15.1575 mean rounds × 400 = 6,063 rounds against 23,511 turns = **3.878 turns per round** on a
  four-seat table. Under 4 and close to it — the shape of a table where captains only drop out at the
  ovens.
- Mean turns per seat per voyage 14.69 against a 15.16-round mean voyage. Below it by the small margin
  the bake-off ruleset predicts. The two agree.

## The ordering, verified rather than assumed

Run at SHA `a019253` immediately before the baseline:

```
$ grep -c 'doPass' 4/src/engine/index.js    ->  0
$ grep -c 'doPass' 4/src/ui/flow.js         ->  0
```

Both zero. Passing does not pay on the tree that was measured. RULE-01 lands in plan 04, after this —
which is what makes plan 06 a time-axis before/after on identical seeds, rather than a seat comparison
that no longer exists now one brain ships.

## No threshold, no constant, no verdict

The script carries no number for what counts as a material movement and prints no grade. The one
derived comparison it offers is `passRateSpreadAcrossSeats` — how far apart the four strategy seats sit
**within the same run**. It is computed from the same games, moves with the game, and exists so a reader
can judge whether a between-run movement exceeds the variation the game produces on its own. It is a
yardstick, not a gate. D-07 leaves the judgement with Wyatt, made against the real numbers at plan 06's
checkpoint (CLAUDE.md §2, `BOT-DESIGN-PRINCIPLES.md` principle 10).

The baseline artifact likewise records no interpretation and no expectation about the after run — a
prediction in an append-only record rots into a lie with nobody editing it (CLAUDE.md §5).

## The graveyard, read before writing

`git log --all --grep="ladder" -i`, `--grep="planner" -i`, and `-S "planTurnClassic"` were all run.
Two commits were read in full: `227c8cc` (the ladder's own yardstick was a bug first — it judged
against a flat 25% when the archetypes win 44/50/61/45 by seat, and reported "+2.5 BETTER" with
new === old) and `3b14080` (the −21.2 failure). **No prior attempt at a before/after pass-rate gate
exists** — this is new ground, not a settled argument being re-run. The tell to watch for, excusing one
number going up because another stayed flat, did not appear.

One lesson from `227c8cc` shaped this rewrite directly: that file's control existed because a flat
yardstick produced a false pass. The seat-axis control is now impossible, so its replacement is the
identical-seed before/after — and the harness controls above are what stop *this* instrument producing
its own false pass.

## Verification

| # | Check | Result |
|---|---|---|
| 1 | `bot_ladder4.js 5 7919 --json` exits 0, byte-identical across two runs | pass |
| 2 | `grep -c 'planTurnClassic'` | **0** |
| 3 | `grep -c 'planTurn *='` (monkey-patch gone) | **0** |
| 4 | `grep -c 'g.events'` | 2 |
| 5 | Seed family fixed: `s * SEEDMULT` in the construction line | present, line unchanged in shape |
| 6 | `npm test` — all 21 gates | pass (exit 0) |
| 7 | `4/scripts/no_undef_check.js`, `stage_import_check.js`, `pp4_timeroff_check.js` | all exit 0 |
| 8 | Diff scope: only `scripts/bot_ladder4.js` + the baseline artifact | confirmed; nothing under `4/`, `v2/`, `v2bakeoff/`, `3/`, `src/` |
| 9 | `scripts/bot_ladder3.js` untouched | confirmed |
| 10 | `PP4_STAMP` unchanged (`2026-08-18a`) | confirmed — `4/src/ui/stage.js` not in the diff |
| 11 | No headless Chrome, no local server started | none started; `pgrep` confirms none running |

## Deviations from Plan

**One auto-fix, in the record rather than the code.**

**[Rule 1 — Bug] FIX-06 was marked Complete in `REQUIREMENTS.md`, and reverted.**
- **Found during:** the state-update step, after both tasks were committed.
- **Issue:** this plan's frontmatter claims `requirements: [FIX-06]`, so the tooling checked FIX-06
  off and flipped its traceability row to Complete. But **FIX-06 is two pieces of work** (D-05), and
  plans 05 and 06 also claim it. `planTurnClassic` is still in `4/src/engine/index.js`. A checked box
  would have asserted the planner was gone while it was still there — the class of record failure no
  structural health check can see.
- **Fix:** reverted `REQUIREMENTS.md`. FIX-06 stays **Pending** until plan 05 lands the deletion.
- **Files modified:** none committed — the change was reverted before any commit.

Two things worth naming that the plan left to judgement:

1. **The wall clock moved to stderr.** The plan required both a machine-readable record *and*
   byte-identical stdout across two runs. Those conflict if the duration is inside the record, so the
   duration is written to stderr and the JSON carries a comment saying why. The baseline artifact
   records the duration from the shell instead. Not a deviation from any instruction — a resolution of
   two requirements that could not both be met the obvious way.
2. **`planTurnV3` is not named either.** The plan only required dropping the classic planner's name.
   Naming the v3 method was unnecessary once the monkey-patch was gone, so it went too — `grep -c
   'planTurnV3'` is 0. The script now names no planner method at all, which is strictly more robust to
   plan 05 and to whatever replaces the brain next.

## Notes for plan 06

Run `node scripts/bot_ladder4.js 400 7919 --json` after RULE-01 and the planner deletion have landed,
and diff it against the JSON block in `01-BALANCE-BASELINE.md`. The held-out family is **×104729** —
a second ~7-minute run per side, deliberately not spent yet, available if the dev-family result reads
close.

## Self-Check: PASSED

- `scripts/bot_ladder4.js` — FOUND
- `.planning/phases/01-before-the-engine-freezes/01-BALANCE-BASELINE.md` — FOUND
- commit `a019253` — FOUND
- commit `9d5d566` — FOUND
