# Balance delta — what the pass dubloon did

**The *after* half of D-07's gate.** The same 400 games, the same seeds, the same four captains, run
once before passing paid a coin and once after. This file records what moved.

**It contains no verdict, no threshold and no recommendation, and that is deliberate.** Whether the
movement below is big enough to act on is Wyatt's call, made against these numbers — not a result any
number in this file produces (D-07, CLAUDE.md §2). Nothing here predicts what he will decide, because
a prediction written into a record nobody edits later just turns into a lie (CLAUDE.md §5).

---

## The short version, in plain words

Bots now **pass a little more often** — about 55.6 passes in every 100 turns, where before it was
55.0. All four captains pass more than they used to.

Voyages did **not** drag. They got **shorter** — 14.84 rounds instead of 15.16, roughly a third of a
round quicker.

The **trader captain won noticeably less**: 86 games out of 400, where before it won 101.

Every game still finished, in both runs.

---

## Provenance

| | Before | After |
|---|---|---|
| **Command** | `node scripts/bot_ladder4.js 400 7919` and `node scripts/bot_ladder4.js 400 7919 --json` | **the same two commands, character for character** |
| **Run from** | `/Users/wyattroy/Documents/Projects/pastrypirates` | same |
| **Git SHA** | `a019253375a90bdc2baf1ef4548f170a45004ba5` | `07a77315209c85fffae758656c59f019b03ebda6` |
| **Working tree** | clean | clean |
| **Node** | v25.9.0 | v25.9.0 |
| **Date** | 2026-08-19 (UTC) | 2026-08-19 (UTC) |
| **Wall clock** | 143s table, 144s `--json` | 81.8s table, 81.0s `--json` |
| **Seed family** | ×7919, the dev family. 400 games. | same |
| **Ruleset** | bake-off | bake-off |
| **Brain** | one — every seat plans the same way | same |

**The wall clock is not a game measurement and nothing should be read into it.** It is the machine's
mood on the night, which is exactly why the ladder keeps it off the record and prints it separately.
The run played 2% fewer rounds, not 43% fewer.

The two runs are the same experiment, checked field by field rather than assumed:

| field | before | after | identical |
|---|---|---|---|
| `command` | `node scripts/bot_ladder4.js 400 7919 --json` | `node scripts/bot_ladder4.js 400 7919 --json` | **TRUE** |
| `games` | 400 | 400 | **TRUE** |
| `seedMult` | 7919 | 7919 | **TRUE** |
| `ruleset` | bakeoff | bakeoff | **TRUE** |
| `brain` | one brain — `planTurn()` dispatches unconditionally | one brain — `planTurn()` dispatches unconditionally | **TRUE** |
| strategies | pirate/trader/balanced/rusher | pirate/trader/balanced/rusher | **TRUE** |

**No figure anywhere in this file was typed by hand where it could be computed** (CLAUDE.md §5). The
before numbers were lifted out of `01-BALANCE-BASELINE.md`'s own fenced JSON block by a script that
parses it, never re-keyed; the after numbers come straight from the run's output; every pair and every
movement below was computed from those two records.

### The after-run measured the right tree

The three checks the plan requires, run at `07a7731` immediately before the run:

```
$ grep -c 'doPass' 4/src/engine/index.js
3
$ grep -c 'doPass' 4/src/ui/flow.js
2
$ grep -c 'planTurnClassic' 4/src/engine/index.js
0
```

Required: at least 2, exactly 2, and 0. All three hold. The pass dubloon is live and the dead planner
is gone.

---

## THE TWO GUARDED QUANTITIES, first and on their own

D-07 named the two numbers that count before any measuring was done: **pass rate** and **voyage
length**. They go first, in their own rows, whichever way they moved (`docs/HARD-WON-LESSONS.md` §2).

| quantity | before | after | movement |
|---|---|---|---|
| **overall pass rate** | 54.99% | 55.62% | **+0.62 points** |
| **mean rounds per voyage** | 15.1575 | 14.8425 | **−0.3150 rounds** (−2.08%) |
| unfinished voyages | 0 | 0 | +0 |

**Pass rate went up. Voyage length went down.** The two guarded numbers moved in opposite directions
— one away from what D-07 was watching for, one toward it. Neither cancels the other and this file
does not net them off against each other.

### A trap this report is deliberately not falling into

The **raw count of passes fell**: 12,929 → 12,780, which is 149 fewer passes.

That number is not evidence that bots pass less, and it is not offered as any comfort. Total turns
fell further — 23,511 → 22,979, which is 532 fewer turns — because voyages are shorter, so there were
simply fewer turns available to pass on. **The recorded metric is the rate, the rate is what the
instrument reports, and the rate rose on every single seat.** Reaching for the raw count instead
would be swapping the measured number for a friendlier one, which is the specific mistake
`docs/HARD-WON-LESSONS.md` §2 exists to prevent.

---

## Per seat — passing

| seat | captain | passes before | passes after | turns before | turns after | pass rate before | pass rate after | movement |
|---|---|---|---|---|---|---|---|---|
| 0 | pirate | 3088 | 3071 | 5856 | 5741 | 52.73% | 53.49% | +0.76 points |
| 1 | trader | 3285 | 3298 | 5869 | 5753 | 55.97% | 57.33% | +1.35 points |
| 2 | balanced | 3225 | 3172 | 5872 | 5747 | 54.92% | 55.19% | +0.27 points |
| 3 | rusher | 3331 | 3239 | 5914 | 5738 | 56.32% | 56.45% | +0.12 points |
| — | **all seats** | 12929 | 12780 | 23511 | 22979 | **54.99%** | **55.62%** | **+0.62 points** |

**Every captain's pass rate rose, and every captain's turn count fell.** Both statements were checked
across all four seats rather than eyeballed off the table.

The movement is very unevenly spread: the trader moved **eleven times further** than the rusher
(+1.35 points against +0.12).

## Per seat — winning

| seat | captain | wins before | wins after | movement |
|---|---|---|---|---|
| 0 | pirate | 103 | 108 | +5 |
| 1 | trader | 101 | 86 | **−15** |
| 2 | balanced | 105 | 108 | +3 |
| 3 | rusher | 91 | 98 | +7 |
| — | **gap between the best and worst captain** | 14 games | 22 games | +8 |
| — | every game accounted for | 400 | 400 | +0 |

---

## The game's own yardstick for ordinary variation

This is **context for a judgement, not a threshold.** Nothing in this file compares the movement
against it automatically, and no verdict is derived from it (CLAUDE.md §2,
`docs/BOT-DESIGN-PRINCIPLES.md` principle 10).

| | before | after |
|---|---|---|
| **how far apart the four captains' pass rates sit, within a single run** | 3.59 points | 3.83 points |
| for comparison: how far the overall pass rate moved between the two runs | — | 0.62 points |

In words: on any given run, the four captains already sit about **3.6 to 3.8 points** apart from each
other on passing. The change moved the whole table by **0.62 points**. That spread is measured on the
very same games, and it moves as the game moves, so it is a live yardstick rather than a number
somebody once picked.

There is no equivalent built-in yardstick for the win counts, so the win movements above are reported
as plain before/after pairs with nothing to read them against.

---

## Is this movement really the dubloon? — measured, not assumed

The baseline was taken 18 commits ago, so the range between the two runs contains more than the
dubloon: it also contains plan 01-05's deletion of the dead planner and the quick task that moved the
payout into the round config.

Both were argued to be behaviour-neutral, and both recorded evidence. But this report's central claim
rests on it, so it was **measured directly on an independent path** rather than carried on a chain of
citations (`docs/HARD-WON-LESSONS.md` §2 — verify against an independent path, never against the
suspect itself).

**The test:** take the after-tree exactly as it stands, force the payout field to zero, and run the
identical 400-game command. If the dubloon is the only thing that changed, this must land back on the
baseline exactly.

| quantity | baseline, on the pre-dubloon tree | after-tree with the payout forced to 0 | identical |
|---|---|---|---|
| all-seat turns / passes / pass rate | 23511 / 12929 / 54.9913% | 23511 / 12929 / 54.9913% | **YES** |
| mean rounds per voyage | 15.1575 | 15.1575 | **YES** |
| unfinished | 0 | 0 | **YES** |
| wins by seat | 103 / 101 / 105 / 91 | 103 / 101 / 105 / 91 | **YES** |
| in-run seat spread | 0.035918 | 0.035918 | **YES** |
| all four seat records, field by field | — | — | **YES** |
| **the entire record, every field** | — | — | **IDENTICAL** |

**Every field matches. Nothing in the range moved these numbers except the pass dubloon.**

Identical output is normally an alarm rather than a result (`docs/HARD-WON-LESSONS.md` §0), so the
obvious question is whether this comparison could ever have shown a difference. It demonstrably can:
the same script, on the same tree and the same seeds, with the payout at **one** instead of zero,
produces every difference reported in this file. The comparison distinguishes; it just found nothing
to report in this direction.

The temporary edit was reverted with a targeted `git checkout -- 4/src/engine/index.js`, the payout
line confirmed back at `passCoin:1`, and the working tree confirmed clean. Nothing from this test was
committed.

---

## Why these numbers are believable

**All four harness controls hold in both runs**, and they were red-proofed when the baseline was
taken:

| control | before | after |
|---|---|---|
| every game accounted for | holds (expected 400, actual 400) | holds (expected 400, actual 400) |
| the event stream was recorded | holds (expected > 0, actual 23511) | holds (expected > 0, actual 22979) |
| no seat took more turns than the voyage had rounds | holds (expected ≤ 1, actual 1) | holds (expected ≤ 1, actual 1) |
| no seat passed more often than it took a turn | holds (expected ≤ 1 per seat, actual 0.56324) | holds (expected ≤ 1 per seat, actual 0.573266) |

**Cross-checks between figures inside the same output** — two numbers that cannot both be true would
mean the harness is broken, not the game (`docs/HARD-WON-LESSONS.md` §3):

| cross-check | before | after |
|---|---|---|
| wins across seats + unfinished, must equal 400 | 400 | 400 |
| per-seat turns summed, must equal the reported total | 23511 = 23511 | 22979 = 22979 |
| per-seat passes summed, must equal the reported total | 12929 = 12929 | 12780 = 12780 |
| total rounds played (mean × 400) | 6063 | 5937 |
| turns per round at a four-seat table, must be under 4 | 3.8778 | 3.8705 |
| mean turns per captain per voyage, must sit under mean rounds | 14.6944 < 15.1575 | 14.3619 < 14.8425 |

**All agree, both runs.**

---

## What moved

**Bots pass slightly more often, and voyages run about a third of a round shorter.**

- **Passing rose on every seat, by 0.62 points overall** — 54.99% to 55.62%. Against the 3.6-to-3.8
  point gap the four captains already sit apart from each other within a single run.
- **The trader moved furthest by a wide margin: +1.35 points**, against the rusher's +0.12. The
  captains did not move together.
- **Voyages got shorter, not longer: 15.1575 rounds down to 14.8425.** D-07 was watching for voyages
  dragging. They went the other way.
- **The trader won 15 fewer games out of 400** — 101 down to 86 — while the other three captains each
  won a few more. The gap between the best and worst captain widened from 14 games to 22.
- **Nothing stalled.** Zero unfinished voyages before, zero after.

## Why it plausibly moved

This section traces each movement to a mechanism. It is reasoning about causes, not evidence, and it
is kept separate from the measurements above for that reason.

**Passing is the always-available turn-ender — the one move nobody can ever be denied — and it now
pays.** Any captain who reaches a turn with nothing worth doing is now rewarded for it rather than
getting nothing, so a turn that used to be a dead loss now has a small floor under it. That reaches
every seat, which fits every seat's pass rate rising.

**Why the seats moved by such different amounts** most plausibly comes down to how often each captain
finds itself at that kind of turn. The rusher barely moved (+0.12) — a captain built to drive
straight at winning rarely arrives at a turn with nothing worth doing, so a payout for idling has
little to attach to. The trader moved furthest (+1.35), and a captain that waits on prices and on
other ships has far more of those turns available to it.

**The shorter voyages say the coin is not only filling purses.** A dubloon is a real resource — it
buys ingredients — so a turn that used to produce nothing now produces a little buying power, and
buying power is what ends a voyage at the ovens. Voyage length and the win distribution both moved,
and **neither of those is a purse measurement**, which is what makes this a change in how the race
resolves rather than only in how rich everyone ends up.

**The trader's 15 lost wins are the movement with the least mechanism behind them.** It is the seat
that passes most, gained the most passing, and lost the most winning, and those three facts sit
together — but the ladder does not record *why* a game was lost, so nothing here establishes the
link. It is named because it is the largest single movement in the file, not because it is explained.

---

## What this file deliberately does not say

No verdict, no threshold, no recommendation about the payout, and no prediction about what happens
next. `scripts/bot_ladder4.js` carries no constant for what counts as a material movement and prints
no grade, and none was added here.

**Whether the movement above is material is Wyatt's call**, made against these numbers at plan 06's
decision checkpoint (D-07).

The **held-out seed family (×104729)** has *not* been run. It was offered as one more ~90-second run
per side if the dev-family result read as borderline — one of the options at the checkpoint, not a
step already taken. → What he chose is recorded below.

---

## The decision — recorded, not concluded

**This section is a record of what Wyatt decided and when. It is not a finding of this report.**
Nothing above it changed, and nothing above it was written to lead here. The measurements and the
decision are two separate things and are kept that way on purpose (D-07).

**2026-08-19 — Wyatt was shown the numbers above at plan 06's decision checkpoint and chose to ship
the pass dubloon at one coin.**

> **"ship it"** — Wyatt, 2026-08-19

Of the three options put to him — ship at one coin, lower the payout before the freeze, or spend
another run on the held-out seed family first — he took the first.

What follows from that, as fact:

| | |
|---|---|
| **The payout** | stays at **one dubloon**. `passCoin: 1` on the round config in `4/src/engine/index.js` is unchanged. |
| **The held-out seed family (×104729)** | **not run.** He did not ask for it, so the option closed with the decision. |
| **The 400-game ladder** | **not re-run.** Nothing about the game changed at this checkpoint, so there is nothing new to measure. |
| **D-07's gate** | **closed** — measured on identical seeds, reported with no threshold, decided by the person whose call it is. |

**The engine can now freeze on this rule.** Phase 3 records the determinism corpus against a payout
that has been measured and ruled on, which is the whole reason this gate sat in Phase 1 rather than
in a follow-up note.
