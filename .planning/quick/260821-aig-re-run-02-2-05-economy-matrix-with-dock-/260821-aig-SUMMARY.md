---
phase: quick
plan: 260821-aig
subsystem: economy-simulator
tags: [economy, dock-flip, locked-out-metric, simulation, correction]
dependency-graph:
  requires: [02.2-05]
  provides: [locked-out-captain-metric, dock-flip-corrected-matrix, three-alternative-levers]
  affects: [scripts/economy_table.js, 02.2-ECONOMY-TABLE.md]
tech-stack:
  added: []
  patterns: [cfg-override-simulation, per-game-aggregate-metric]
key-files:
  created: []
  modified:
    - scripts/economy_table.js
    - .planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-ECONOMY-TABLE.md
decisions:
  - "Wyatt's target metric is tallied PER GAME (share of games with >=1 locked-out captain, mean/game, 0..4 distribution), not per player-game — the first matrix's 'boxed out' rate is kept as a legacy field for exact backward comparison, not removed."
  - "Two readings of 'worth robbing' (any crate / recipe-need crate) reported separately since they can disagree — they never disagreed on direction in this matrix, only magnitude."
  - "passCoin and crateBase excluded from the 3 alternative levers: passCoin is settled by D-07 (09aac6e), crateBase is the exact lever the correction says was never the ask."
  - "Two of Wyatt's five candidate levers (pay battle cost with a crate; treasure-hunt affordance at 0 coins) require new engine mechanics and were not simulated, since 4/src must stay byte-identical for this measurement-only task."
metrics:
  duration: "~55 min"
  completed: 2026-08-21
status: complete
---

# Quick Task 260821-aig: Economy matrix re-run on the correct lever (dock flip) Summary

**One-liner:** Wyatt's proposed dock-flip payout cut (2/5→1/3) nearly doubles his own
"locked-out captain" rate even though it dramatically fixes the purse-ceiling problem; halving
battle cost instead cuts lockouts in half with no purse-ceiling cost.

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

**Recommendation: Lever A (halve battle cost) is the best-measured fix for Wyatt's own target
metric, with negligible cost to the purse ceiling. His requested dock-flip cut fixes the purse
ceiling best but nearly doubles lockouts — a real trade-off to hand him, not a straightforward
win.**

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as scoped. No game code was touched (`4/src` diff for this task's own
work is empty — confirmed via individually-staged commits that never included `4/index.html` or
`4/src/ui/stage.js`).

## Concurrent work note

While this task ran, another session/agent had uncommitted changes to `4/index.html` and
`4/src/ui/stage.js` in the working tree (107 lines in `stage.js`), plus untracked playtest
screenshots under `.planning/phases/02.2-.../shots/`. **None of this was touched, staged, or
committed by this task** — every commit here explicitly `git add`ed only the specific files this
task modified (`scripts/economy_table.js`, `02.2-ECONOMY-TABLE.md`, and this quick-task
directory). `git diff --stat -- 4/src` will NOT be empty at the repo level right now because of
that concurrent, unrelated work — it reflects work outside this task's scope, not a violation of
the "no game code changes" constraint this task itself was held to.

## Known Stubs

None.

## Threat Flags

None — measurement-only change to an offline Node script and a docs file; no new network surface,
auth path, or trust boundary.

## Self-Check: PASSED

- `scripts/economy_table.js` — FOUND, modified as described, extension verified additive via
  byte-for-byte baseline comparison before/after edit.
- `.planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-ECONOMY-TABLE.md` — FOUND, new
  dated section appended.
- Commit `e8929c7` (script) — FOUND in `git log`.
- Commit `c6b4688` (docs) — FOUND in `git log`.
- Root `npm test` — PASSED, 0 failing checks (verified before this task's own commits).
