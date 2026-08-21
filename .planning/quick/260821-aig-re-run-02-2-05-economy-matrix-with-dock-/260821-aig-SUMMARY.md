---
phase: quick
plan: 260821-aig
subsystem: economy-simulator
tags: [economy, dock-flip, locked-out-metric, band-metric, simulation, correction]
dependency-graph:
  requires: [02.2-05]
  provides: [locked-out-captain-metric, band-metric, dock-flip-corrected-matrix, three-alternative-levers, dock-flip-neighborhood]
  affects: [scripts/economy_table.js, 02.2-ECONOMY-TABLE.md]
tech-stack:
  added: []
  patterns: [cfg-override-simulation, per-game-aggregate-metric, per-player-game-count-metric]
key-files:
  created: []
  modified:
    - scripts/economy_table.js
    - .planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-ECONOMY-TABLE.md
decisions:
  - "Wyatt's FIRST target metric is tallied PER GAME (share of games with >=1 locked-out captain, mean/game, 0..4 distribution), not per player-game — kept as a legacy field, not removed, once superseded by the band metric."
  - "Wyatt's SECOND correction (same day): the real target is a BAND (1<=N<=3 unaffordable-desirable-action turns per captain per voyage), not a yes/no. N counts TURNS with a miss, not individual desires — a turn with both an unaffordable attack and an unaffordable dock buy counts once."
  - "Two readings of 'worth robbing' (any crate / recipe-need crate) reported separately for both metrics since they can disagree — they never disagreed on direction in this matrix, only magnitude."
  - "passCoin and crateBase excluded from the 3 alternative levers: passCoin is settled by D-07 (09aac6e), crateBase is the exact lever the correction says was never the ask."
  - "Two of Wyatt's five candidate levers (pay battle cost with a crate; treasure-hunt affordance at 0 coins) require new engine mechanics and were not simulated, since 4/src must stay byte-identical for this measurement-only task."
  - "On the corrected band metric, his 1/3 dock idea reverses from 'worse than baseline' (first metric) to 'best of everything measured' (second metric) — the two metrics answer genuinely different questions, and his restated definition is the band, not the boolean."
metrics:
  duration: "~2.5 hrs (two correction rounds)"
  completed: 2026-08-21
status: complete
---

# Quick Task 260821-aig: Economy matrix re-run on the correct lever (dock flip) Summary

**One-liner:** After a second correction from Wyatt (the target is a 1-3-miss BAND, not a yes/no
"never once"), his proposed dock-flip cut (2/5→1/3) turns out to be the best-performing setting of
everything measured — 41% of captains land in the healthy band vs. today's 25% — at the cost of a
new, real "money is stifling" tail (7.2% of captains, vs. ~0% today) that a softer 1/4 variant
avoids most of while keeping most of the benefit.

## What happened

The 02.2-05 economy matrix measured the wrong lever — `crateBase`/`powder` (crate cost) instead of
`dockTails`/`dockHeads` (the dock coin-flip payout Wyatt actually asked to change). This task:

1. Extended `scripts/economy_table.js` (same instrument, not rewritten) to compute Wyatt's exact
   target metric — per captain per game, "had a reason to act (adjacent rival worth robbing, or a
   dock selling a needed crate) and never once, the whole voyage, could afford it" — tallied per
   GAME (share of games with ≥1 locked-out captain, mean locked-out captains/game, 0..4
   distribution), with two readings of "worth robbing" (any crate / a crate the captain's own
   recipe needs).
2. Sanity-checked the extended script against its own pre-edit baseline (300 games, seed ×7919):
   every pre-existing field matched byte-for-byte before any new number was trusted.
3. Ran the corrected dock-flip comparison (today's 2/5 vs his proposed 1/3) plus 3 alternative
   levers — halving battle cost (`powder`), halving the dry-shelf floor price (`blackMarket`), and
   doubling starting purse (`startCoins`) — each at 300 games, seed family ×7919.
4. Appended a dated section to `02.2-ECONOMY-TABLE.md` with the correction, the headline finding,
   the full lever table, plain-English recommendations, and caveats.

## Headline numbers

| Setting | Locked out (any-crate reading) | Locked out (recipe-need reading) | Purse ceiling (secondary) |
|---|---|---|---|
| Today (baseline, 2/5) | 8.0% of games | 12.0% of games | 52.3% |
| **His requested change (1/3)** | **14.3%** (nearly 2x) | **23.0%** (nearly 2x) | 15.3% (**best**) |
| Lever A — halve battle cost (`powder` 2→1) | **4.0%** (best) | **7.7%** (best) | 54.1% (flat) |
| Lever B — halve dry-shelf floor (`blackMarket` 10→5) | 9.3% (worse) | 15.3% (worse) | 50.5% (flat) |
| Lever C — double starting purse (`startCoins` 3→6) | 5.3% | 7.7% | 68.9% (worse) |

**Recommendation on the FIRST metric: Lever A (halve battle cost) is the best-measured fix, with
negligible cost to the purse ceiling.** This was superseded within the same session — see below.

## Second correction, same day: the metric is a BAND, not a yes/no

Wyatt, re-reading the above: *"i want players to be unable to afford a desirable action AT LEAST
ONCE but NOT MORE THAN 3 TIMES per game... my 1/3 dock change seems to do this but i can't tell
because your metrics are not what i intended."* The "locked out" metric above only asked whether a
captain was shut out for the WHOLE voyage — it cannot see the difference between priced out once
(healthy) and priced out nine times (a wall). The corrected metric: **N = count of a captain's own
turns per voyage with an unaffordable desirable action in reach. Balanced = 1≤N≤3.**

Re-extended `scripts/economy_table.js` a second time (sanity-checked byte-for-byte against every
existing field before trusting new numbers), then re-ran the SAME 5 settings plus 3 new ones for
the requested "neighborhood" around 1/3 — all 8 rows at 300 games, seed ×7919:

| Setting | In band (1≤N≤3), any-crate | Purse ceiling |
|---|---|---|
| Today (baseline, 2/5) | 24.6% | 52.3% |
| **His 1/3** | **41.1%** (best) | 15.3% (best) |
| Lever A alone (powder=1) | 18.7% | 54.1% |
| Lever B alone (blackMarket=5) | 21.8% | 50.5% |
| Lever C alone (startCoins=6) | 15.7% | 68.9% |
| A + his 1/3 combined | 33.0% | 18.3% |
| 1/4 (softer than 1/3) | 31.4% | 33.5% |
| 2/4 (softer still) | 25.8% | 30.1% |

**On this corrected metric, his 1/3 idea reverses from "worse than baseline" to "best of everything
measured."** The first metric and the second metric are genuinely different questions — "never once
affordable, the whole game" vs. "affordable at roughly the right rate" — and his restated wording
matches the second. The trade: money never bites for half as many captains under 1/3 (N=0 drops
75.3%→51.7%), but a real "money is stifling" tail appears for the first time (N≥4 rises 0.2%→7.2%).
1/4 gets about three-quarters of 1/3's benefit at about three-fifths of its stifling cost, if that
tail is too much.

**Updated recommendation: ship his 1/3 idea, or 1/4 if the 7.2%-stifled tail feels too aggressive.**
Full detail, distributions, and the neighborhood analysis: the second dated section in
`02.2-ECONOMY-TABLE.md`.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as scoped. No game code was touched (`4/src` diff for this task's own
work is empty — confirmed via individually-staged commits that never included `4/index.html` or
`4/src/ui/stage.js`).

## Concurrent work note

While this task ran (across both correction rounds), another session/agent had ongoing uncommitted
and then committed changes to `4/src/ui/*.js` and `4/index.html` in the shared main checkout —
including one full commit (`18d8df4`, "item 8 — the end-of-voyage card's A+C pull-to-park") that
landed on `main` locally, unpushed, in between this task's own commits. **None of this was touched,
staged, or committed by this task** — every commit here explicitly `git add`ed only the specific
files this task modified (`scripts/economy_table.js`, `02.2-ECONOMY-TABLE.md`, and this quick-task
directory), and every `git add`/`git commit` was preceded by a `.git/index.lock` check with a
2-second retry loop. `git diff --stat -- 4/src` will NOT be empty at the repo level right now
because of that concurrent, unrelated work — it reflects work outside this task's scope, not a
violation of the "no game code changes" constraint this task itself was held to. The final push
carries the other session's commit(s) along with this task's own, since they share one branch.

## Known Stubs

None.

## Threat Flags

None — measurement-only change to an offline Node script and a docs file; no new network surface,
auth path, or trust boundary.

## Self-Check: PASSED

- `scripts/economy_table.js` — FOUND, modified twice (locked-out metric, then band metric), each
  extension verified additive via byte-for-byte baseline comparison before/after edit.
- `.planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-ECONOMY-TABLE.md` — FOUND, two
  dated sections appended (first correction, second correction).
- Commit `e8929c7` (script, locked-out metric) — FOUND in `git log`.
- Commit `c6b4688` (docs, locked-out metric matrix) — FOUND in `git log`.
- Commit `00d8a6f` (script, band metric) — FOUND in `git log`.
- Commit `7d9d703` (docs, band metric matrix) — FOUND in `git log`.
- Root `npm test` — PASSED, 0 failing checks (verified before this task's own commits).
