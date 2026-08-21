---
phase: quick
plan: 260821-aig
type: quick
autonomous: true
requirements: []
---

# Quick Task 260821-aig: Re-run the economy matrix on the correct lever (dock flip), plus 3 alternatives

## Objective

Wyatt corrected the 02.2-05 economy matrix: it swept `crateBase`/`powder` (crate cost) when he
meant the dock coin-flip payout (`dockTails`/`dockHeads`). Re-run the matrix on the corrected
lever (today's 2/5 vs his proposed 1/3), implement his exact target metric (per-captain-per-game
"locked-out" tally — a reason to act and never once could afford it, across the whole voyage), and
propose + measure 3 alternative levers derived from what the engine already computes. Measurement
only — no game code changes.

## Context

- `.planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-05-SUMMARY.md`
- `.planning/phases/02.2-a-captain-who-cannot-take-their-turn/02.2-ECONOMY-TABLE.md` (first matrix,
  wrong lever)
- `docs/TRADE-SYSTEM.md`
- `docs/BOT-DESIGN-PRINCIPLES.md` principle 10 ("nothing is a constant")
- `scripts/economy_table.js` (the instrument, D-17)
- `4/src/engine/index.js` `roundCfg()` — `dockTails:2, dockHeads:5, powder:2, startCoins:3,
  crateBase:6, blackMarket:10, passCoin:1` (read-only; not modified)
- Git graveyard: `git log --all --oneline -i --grep="econom\|coin\|purse\|passCoin"` — confirms
  `passCoin` is settled (D-07, 09aac6e) and off the table; `dockHeads`/`dockTails` have moved
  before (6→5→4→5) with no single settled ruling protecting today's 2/5.

## Tasks

### Task 1 — extend the instrument (auto)

Extend `scripts/economy_table.js` (never rewrite `roundCfg()`) to:
- Accept `--dockTails=N --dockHeads=N --startCoins=N --blackMarket=N` overrides alongside the
  existing `--crateBase`/`--powder`.
- Compute Wyatt's exact target metric per game (not per player-game): for each captain, "had a
  reason to act (adjacent rival worth robbing, or a dock selling a needed crate) and never once
  could afford it, the whole voyage" = locked-out. Report, per game: share of games with ≥1
  locked-out captain, mean locked-out captains/game, and the 0..4 distribution.
- Report two readings of "worth robbing": "any crate" (matches the first matrix's proxy) and
  "recipe-need crate" (stricter) — since they can disagree.
- Keep every existing field and harness control unchanged so the first matrix's baseline row is
  exactly reproducible.
- Add new harness controls: need-reading attack-reason counts never exceed any-reading counts;
  the locked-out-per-game distribution sums back to the game count.

**Verify:** re-run `node scripts/economy_table.js 300 7919 --json` (no overrides) and diff every
pre-existing field against a captured pre-edit run — must match byte-for-byte. All harness
controls (old and new) must hold.

**Done:** extension is additive; baseline numbers unchanged; new locked-out fields present and
their harness controls hold.

### Task 2 — run the matrix (auto)

Run, at 300 games each, dev seed family ×7919 (same construction as the first matrix):
1. Baseline (no overrides) — reproduces the first matrix's baseline row.
2. His requested change: `--dockTails=1 --dockHeads=3`.
3. Lever A: `--powder=1` (halve battle cost).
4. Lever B: `--blackMarket=5` (halve the dry-shelf floor price).
5. Lever C: `--startCoins=6` (double the starting purse).

**Verify:** every row's harness controls hold; `unfinishedVoyages` is 0 or explained.

**Done:** five `--json` records captured, all controls green.

### Task 3 — write up and commit (auto)

Append a new dated section to `02.2-ECONOMY-TABLE.md`: the correction stated plainly, the
dock-flip 2/5-vs-1/3 row on his metric (headline), the three alternative levers, one plain-English
recommendation per row, and each row's secondary purse-ceiling effect. Confirm `git diff --stat --
4/src` attributes nothing to this work (concurrent unrelated edits from another session may be
present — do not touch or commit them). Commit docs + scripts only.

**Verify:** `git diff --stat -- 4/src` shows nothing from this task's own changes; root `npm test`
stays green; push/pull `origin/main` both directions report 0.

**Done:** section appended, committed, pushed, pulled, verified.

## Success Criteria

- His exact target metric implemented and reported (share of games, mean/game, distribution).
- Dock-flip 2/5 vs 1/3 measured on that metric — headline finding stated plainly.
- Three alternative levers measured at the same sample size, one recommended with reasoning.
- `4/src` byte-identical (this task's own diff).
- Root `npm test` green. Pushed, pulled, verified zero both ways.
