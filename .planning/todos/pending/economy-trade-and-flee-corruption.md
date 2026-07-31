---
title: Two economy-corruption bugs — a trade can mint a crate, a flee can mint coins
found: 2026-07-30 (code review of the Phase 15 diff, 15-REVIEW.md CR-02/CR-03)
severity: high — silent state corruption, no error, no narration
origin: PRE-EXISTING since Phase 11 (1dc9374 / c8147a3), NOT introduced by Phase 15
resolves_phase: next
wyatt_ruling: "ship it and fix those next" (2026-07-30)
---

Both confirmed in source. Both predate Phase 15, which is why they did not block that merge.

## CR-02 — a trade can delete the wrong crate and mint one that never existed

`src/ui/flow.js:886`:

```js
q.ing.splice(q.ing.indexOf(want),1);  // want absent -> indexOf -1 -> splice(-1,1) removes the LAST crate
p.ing.push(want);                     // ...and mints a crate that is not in play
```

Same shape on the giving side of the counter branch (`:848`).

**Reachable because `humanTrade` has no `turnExpired` guard** — the bot-hail path checks it, this one
does not. `ask()` forces default index 0, which on the accept prompt is **Accept**; `expireShotClock`
(`src/orchestrator.js:238`, `:246`) resolves the pending promise BEFORE confiscating a random crate. So
a partner who times out auto-accepts a trade for a crate the clock has just taken from them.

**Fix shape:** guard `humanTrade` on `turnExpired` like the hail path, and never `splice` on an
unchecked `indexOf` — a `-1` must abort the trade, not silently retarget the last element.

## CR-03 — fleeing a battle mints coins

`src/orchestrator.js:576`:

```js
for(const bet of bets)appState.game.players[bet.idx].coins+=bet.amt; // "refund" side bets
```

But the stake is **never debited at collection** — `collectSideBets` records the bet; the cost is only
taken inside `settleSideBets`'s `delta`, and the flee path returns before settlement ever runs. So the
"refund" is a pure credit: an all-in 5-coin bettor gains 5 coins from nothing, with no event and no
narration line.

**Fix shape:** either debit the stake at collection (making the refund real), or drop the refund on the
flee path. The first is truer to the rules as written in the how-to-play modal.

## Do these together with the coin-audit residue

Same family as F12 and the eight paths in
`.planning/quick/20260729-playtest-bug-fixes/COIN-AUDIT.md`: affordability or ownership is checked at one
moment, the mutation happens at another, and the 20-second shot-clock penalty can fire in between. G6
added re-validation for COINS; CR-02 shows CRATES were never given the same treatment.

Wyatt has already approved the shared-helper approach for the coin sites; extending it to crates and to
the flee refund is the natural next piece of work.
