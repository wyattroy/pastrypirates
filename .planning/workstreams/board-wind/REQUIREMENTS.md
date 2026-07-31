# Requirements — v1.3 workstream `board-wind`

**Milestone:** v1.3 The Game Comes Alive · **Owns:** Phase 19 and Phase 20
**Files this workstream owns:** `src/ui/board.js` and new sprite assets

> **This is a slice of v1.3, not the whole milestone.** The single readable overview of all of
> v1.3 and v1.4 lives at [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md) and does **not**
> move between workstreams — read that for the shape, this for your scope.
> Per-item detail, code references and traps: `../../todos/pending/2026-07-31-*.md` and `2026-08-01-*.md`.

### Safari Gate — Phase 19

- [ ] **WIND-00**: A full game plays smoothly in real Safari with an always-on wind layer running, **and the safe dot-count budget is known** — the prototype ships a dial so the outcome is a number, not just pass/fail. Nothing final ships in this phase; if it passes, the prototype becomes Phase 20's starting point. **Wyatt runs the Safari verdict on his own machine.**

### The Board Comes Alive — Phase 20

- [ ] **WIND-01**: On every non-storm turn the board carries small dots fluttering across it, with none of the storm's darkening.
- [ ] **WIND-02**: The trade-wind arrows flow along the rim channel into the whirlpool rather than sitting still.
- [ ] **WIND-03**: Each whirlpool rotates, making it visually clear that it is what stops the wind.
- [ ] **WIND-04**: On every wind **direction change** the round line carries a pastry scent from Wyatt's 35-line library; when the wind repeats a direction the existing "still blows / gusting" line runs unchanged.
- [ ] **WIND-05** *(was V13-49/50)*: A ship approaching the rim gets a visual signal it is about to be swept into the trade winds, and once swept, roughly where the ride ends.

> **WIND-04's line must be DERIVED from data the `newround` event already records** (`dir`, `round`, `windStreak`) — **never `this.r()`**. One new RNG draw shifts every subsequent draw and invalidates all 31 determinism fixtures. Derived, it is fixture-safe and keeps every client in sync with no broadcast.

## Milestone-wide Constraints

1. **NOTHING in v1.3 may touch `src/engine/index.js` or change what it emits.** This is what keeps the phases parallel and keeps v1.3 clear of the determinism re-record — `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 is explicit that the 31-seed corpus is re-recorded **exactly once**, and that happens in v1.4. **If a phase finds it needs an engine change, STOP and re-scope.**
2. **WIND-01 is the largest Safari risk this project has taken.** BUG-01 was a Safari near-crash caused by storm-overlay compositing; this runs a comparable layer on **every ordinary turn**. Phase 19's gate is mandatory.
3. **Copy changes are inventory changes** — record them against `.planning/todos/pending/copy-shipped-vs-approved-gate.md`. Silent divergence between shipped source and Wyatt's approved dispositions is the failure this project has already had.
4. **Standing design invariant** (`.planning/PROJECT.md`): bots have exactly the same rules and affordances as humans. Never raise "should bots be allowed to…" as an open question; parity may be restored by levelling the **human up**, not only the bot down.

