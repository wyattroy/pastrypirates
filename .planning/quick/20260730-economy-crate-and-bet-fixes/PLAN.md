---
quick_id: 260730-tgu
slug: economy-crate-and-bet-fixes
date: 2026-07-30
description: Fix CR-02 (a trade can delete the wrong crate and mint one that never existed) and CR-03 (a battle flee mints coins)
source: .planning/todos/pending/economy-trade-and-flee-corruption.md — 15-REVIEW.md CR-02/CR-03
origin: PRE-EXISTING since Phase 11 (1dc9374 / c8147a3)
branch: july30-economy-crate-and-bet-fixes
---

# Two economy-corruption bugs

Both silent — no error, no narration, no event. Neither would ever surface in play, which is why
they survived since Phase 11 and were found by reading rather than playing (learning #5).

## CR-02 — a trade can delete the wrong crate and mint one that never existed

### The mechanism, traced end to end

`expireShotClock` (`src/orchestrator.js:233`) does these in this order:

1. `appState.turnExpired=true`
2. `appState.shotClockForce()` — **resolves the pending `ask()` promise**
3. splices a **random crate** out of the deciding seat's hold and returns it to `tokens[]`

`ask()` forces default index 0. On the accept prompt that is **Accept**. So a partner who times out
auto-accepts, and *then* loses a crate. If the crate the clock took is the one being traded:

```js
q.ing.splice(q.ing.indexOf(want),1);  // want absent -> -1 -> splice(-1,1) removes the LAST crate
p.ing.push(want);                     // ...and mints a crate that is ALSO back in tokens[]
```

Two separate corruptions from one timeout: `q` loses a crate they should have kept, and `want` now
exists twice — once in `p.ing`, once in the island supply.

`humanTrade` has **no `turnExpired` guard at all**. The bot-hail path has one
(`src/ui/flow.js:1199` — *"shot-clock expired mid-hail — no partial trade, ever"*). This is
learning #3 exactly: the correct guard exists in one path and was never carried to the other.

### Fix — two layers, because the two failures are different

**Layer 1: the reachable cause.** Guard `humanTrade` on `appState.turnExpired` after every `await
ask(...)` that precedes a mutation, matching the hail path's shape and its comment. Returns without
narrating — `expireShotClock` already narrates the skip through `EVENT_NARRATION.shotclockskip`, so
there is nothing to say and **no new copy is invented**.

**Layer 2: the invariant.** `splice(indexOf(x),1)` must become structurally impossible, not merely
guarded at the four current call sites. Add ONE shared helper — learning #3's preferred remedy (a)
*"one shared function both paths call"* — that puts the lookup and the mutation inside the same
function so they cannot drift apart:

```js
export function moveCrate(from,to,ing){ ... }   // false when `from` does not hold `ing`; no mutation
```

Both legs are validated **before either mutates**, so a trade is atomic — never half-completed with
crates moved and coins not, which is the failure mode G6 called out for coins.

A crate that has genuinely vanished routes into the **existing** decline path
(`@copy adhoc.trade.refusalhuman`), exactly as G6 routed a coin shortfall. No new string.

### Four call sites, all four via the helper

| Site | Line | Leg |
|---|---|---|
| counter branch | `:847` | q → p (the wanted crate) |
| counter branch | `:848` | p → q (the given crate) |
| settlement | `:886` | q → p (the wanted crate) |
| settlement | `:887` | p → q (the given crate) |

## CR-03 — fleeing a battle mints coins

### Where the todo's suggested fix is wrong

The todo proposes *"either debit the stake at collection (making the refund real), or drop the
refund"*, and calls the first *"truer to the rules."* **Checked, and it is not.** `settleSideBets`
computes:

```js
const delta = won ? 1+2*amt : -amt;
```

The losing branch **is** the stake being taken — at settlement, not at collection. The math is
already self-consistent with no debit at collection. Debiting at collection would require rewriting
the win/loss economics that have been through two recorded playtests, changing what players get.
That is a balance change, not a bug fix, and is not in scope.

### The actual bug, which is narrower

The flee path returns at `src/orchestrator.js:590` (`if(fled)return;`), **before** settlement at
`:627`. So on a flee: nothing was ever debited, and nothing ever will be. The line

```js
for(const bet of bets)appState.game.players[bet.idx].coins+=bet.amt; // "refund"
```

refunds something never taken — a pure credit, no event, no narration. An all-in 5-coin bettor gains
5 coins from nothing.

### Fix

**Delete the refund.** On a flee no coins should move at all, because none ever left. One line, with
a comment stating why a future reader must not "restore" it.

## Tasks

1. **Test first, proven RED** — `scripts/economy_guard_test.js`, DOM-free, modelled on
   `hail_ranking_test.js`. Covers `moveCrate` (absent crate → no mutation, present crate → exactly
   one moved, the −1 case that removed the last element) and asserts the flee path credits nothing.
2. **`moveCrate()`** in `src/ui/flow.js`, beside `coinShortfall`, with the reasoning in a comment.
3. **CR-02 layer 1** — `turnExpired` guards in `humanTrade`.
4. **CR-02 layer 2** — all four crate transfers through `moveCrate`; both legs validated before any
   mutation; a missing crate routes to the existing decline wording.
5. **CR-03** — delete the flee refund.
6. **Wire the test into `npm test`** (17 → 18 gates).

## Constraints carried from Phase 15

- **`src/engine/index.js` must stay byte-identical** — `git diff 9ddd214..HEAD -- src/engine/` empty.
  Nothing here goes near it; both bugs are UI-tier. The 31 determinism fixtures must stay green.
- **Never invent player-facing copy.** Both fixes route into existing approved strings or say nothing.
- **A gate must be watched to fail before it is trusted** (learning #2) — the new test is proven RED
  against the real pre-fix code before the fix lands, not against a synthetic fixture.
- **Assert presence before asserting absence** — the test must print its assertions at all.
