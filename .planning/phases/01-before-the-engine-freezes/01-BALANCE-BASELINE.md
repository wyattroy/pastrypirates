# Balance baseline — before passing pays

**The *before* half of D-07's gate.** Plan 06 runs the identical command on a tree where the pass
dubloon exists and diffs the two records. This file records what was measured. It does not interpret
it, and it contains no expectation about the after run — a prediction in an append-only record rots
into a lie with nobody editing it (CLAUDE.md §5).

## Provenance

| | |
|---|---|
| **Command** | `node scripts/bot_ladder4.js 400 7919` (human table) and `node scripts/bot_ladder4.js 400 7919 --json` (record below) |
| **Run from** | `/Users/wyattroy/Documents/Projects/pastrypirates` |
| **Git SHA** | `a019253375a90bdc2baf1ef4548f170a45004ba5` |
| **Working tree** | clean at that SHA — the only change in it was the ladder rewrite committed as `a019253` |
| **Node** | v25.9.0 |
| **Date** | 2026-08-19 (UTC) |
| **Wall clock** | 143s for the human run, 144s for the `--json` run; 287s total |
| **Seed family** | ×7919, the dev family. 400 games. |
| **Ruleset** | bake-off (`roundCfg()` returns `bakeoff:true` headless, and the ladder passes it explicitly) |
| **Brain** | one — `planTurn()` dispatches unconditionally, so all four seats plan identically |

## The tree this was measured on had no pass dubloon

This is what makes the comparison a **time-axis before/after on identical seeds**, rather than a
seat-axis comparison — which no longer exists, because there is only one brain to seat.

Evidence, run immediately before the baseline at the SHA above:

```
$ grep -c 'doPass' 4/src/engine/index.js
0
$ grep -c 'doPass' 4/src/ui/flow.js
0
```

Both greps returned **0**. RULE-01 lands in plan 04, after this one. That ordering is the whole basis
of this plan.

## Seed family: dev only, held-out family in reserve

The dev family (×7919) was run. The **held-out family is seed multiplier ×104729**, a second ~7-minute
run per side. It was **deliberately not run now**, and is available for plan 06 to call for **if and
only if** the dev-family result reads as borderline.

The two-family convention in `docs/BOT-V3-RACE-PLANNER.md` exists to catch a *brain* fitted to the
seeds it was tuned on. RULE-01 is a rule change, not a brain change, so that particular overfitting
risk does not apply here.

## Human table, as printed

```
400 games, seed family ×7919, 4-seat table, bake-off ruleset — /4, one brain on every seat
Run the SAME command both sides of the change being measured; the axis is time, not seat.

  seat  strategy   wins   turns  passes  pass rate
     0  pirate     103    5856    3088   52.73%
     1  trader     101    5869    3285   55.97%
     2  balanced   105    5872    3225   54.92%
     3  rusher      91    5914    3331   56.32%

  all seats                  23511   12929   54.99%
  pass-rate spread across the four seats, within this run: 3.59 points
  mean rounds per voyage 15.1575   unfinished 0   wins 103/101/105/91

  harness controls (known before the run, checked against what it produced):
    holds  every game accounted for                             expected 400      actual 400
    holds  the event stream was recorded                        expected > 0      actual 23511
    holds  no seat took more turns than the voyage had rounds   expected <= 1     actual 1
    holds  no seat passed more often than it took a turn        expected <= 1 per seat actual 0.56324
```

## Machine-readable record

This is the artifact plan 06 diffs against. Two runs of the same command on the same tree produce
byte-identical stdout — the wall clock is on stderr precisely so that it does.

```json
{
  "script": "scripts/bot_ladder4.js",
  "command": "node scripts/bot_ladder4.js 400 7919 --json",
  "games": 400,
  "seedMult": 7919,
  "ruleset": "bakeoff",
  "brain": "one brain — planTurn() dispatches unconditionally; every seat plans the same way",
  "strategies": [
    "pirate",
    "trader",
    "balanced",
    "rusher"
  ],
  "seats": [
    {
      "seat": 0,
      "strategy": "pirate",
      "wins": 103,
      "turns": 5856,
      "passes": 3088,
      "passRate": 0.527322
    },
    {
      "seat": 1,
      "strategy": "trader",
      "wins": 101,
      "turns": 5869,
      "passes": 3285,
      "passRate": 0.559721
    },
    {
      "seat": 2,
      "strategy": "balanced",
      "wins": 105,
      "turns": 5872,
      "passes": 3225,
      "passRate": 0.549217
    },
    {
      "seat": 3,
      "strategy": "rusher",
      "wins": 91,
      "turns": 5914,
      "passes": 3331,
      "passRate": 0.56324
    }
  ],
  "totals": {
    "turns": 23511,
    "passes": 12929,
    "passRate": 0.549913
  },
  "passRateSpreadAcrossSeats": 0.035918,
  "meanRoundsPerVoyage": 15.1575,
  "unfinished": 0,
  "winsBySeat": [
    103,
    101,
    105,
    91
  ],
  "gamesWon": 400,
  "harnessControls": [
    {
      "name": "every game accounted for",
      "why": "play() returns a seat index or null; wins + unfinished must equal games. seat 0 is a real winner, so this is tested with == null, never !w",
      "expected": 400,
      "actual": 400,
      "holds": true
    },
    {
      "name": "the event stream was recorded",
      "why": "ev() opens with if(!this.record)return; — with the flag off every derived count is 0, which reads as a plausible finding instead of a broken harness",
      "expected": "> 0",
      "actual": 23511,
      "holds": true
    },
    {
      "name": "no seat took more turns than the voyage had rounds",
      "why": "each seat plays at most once per round, so the worst per-game ratio cannot exceed 1",
      "expected": "<= 1",
      "actual": 1,
      "holds": true
    },
    {
      "name": "no seat passed more often than it took a turn",
      "why": "a pass event ends a turn, so passes are a subset of turns for every seat",
      "expected": "<= 1 per seat",
      "actual": 0.56324,
      "holds": true
    }
  ]
}
```

## Why these numbers are believable

**All four harness controls hold**, and each one was red-proofed at the same SHA — deliberately
broken, to confirm it can report `BROKEN` rather than only ever having been seen to hold
(`docs/HARD-WON-LESSONS.md` §2, "a check you have only ever seen pass is indistinguishable from a
check that cannot fail"):

| Sabotage applied | What the control reported |
|---|---|
| `record` flag off | 0 turn events — "the event stream was recorded" flips to false |
| `if (!w)` instead of `w == null` | 2 of 5 seat-0 wins misread as unfinished; 7 games of 5 accounted for — flips to false |
| turn events counted twice | worst turns/rounds ratio 2.000 — flips to false |

**Independent cross-checks between figures in this same output** (`docs/HARD-WON-LESSONS.md` §3, rule
2 — two figures that cannot both be true mean the harness is wrong):

- Wins `103+101+105+91 = 400`, plus `0` unfinished, accounts for all 400 games.
- Mean rounds 15.1575 × 400 games = **6,063 rounds**; total turns **23,511**; so **3.878 turns per
  round** on a four-seat table. Under 4, and close to it — which is what a table looks like when
  captains drop out only at the very end, at the ovens.
- Mean turns per seat per voyage is **14.69** against a mean voyage of **15.16 rounds**. Below it, by
  the small margin a bake-off ruleset predicts. The two numbers agree.

## What this file deliberately does not say

No verdict, no threshold, no expectation. `scripts/bot_ladder4.js` carries no constant for what counts
as a material movement and prints no grade — per D-07 that judgement is Wyatt's, made against the real
numbers at plan 06's checkpoint (CLAUDE.md §2, `docs/BOT-DESIGN-PRINCIPLES.md` principle 10).

The `passRateSpreadAcrossSeats` figure (3.59 points here) is an **in-run yardstick, not a gate** — how
far apart the four strategy seats sit on these same games. It is there so a reader can see whether a
between-run movement is larger than the variation this game produces on its own.

## How plan 06 uses this

1. Land RULE-01 (plan 04) and the planner deletion (plan 05).
2. Run the identical command: `node scripts/bot_ladder4.js 400 7919 --json`.
3. Diff that record against the JSON block above.
4. Record the delta in `01-BALANCE-DELTA.md` and put the question to Wyatt.
