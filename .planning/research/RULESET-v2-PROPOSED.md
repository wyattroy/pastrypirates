# Pastry Pirates — proposed ruleset v2

**2026-08-03.** The ruleset as decided, with the evidence for each rule. Written as a spec, not as
shipped copy — the player-facing version would be in the pirate voice.

Every number here was measured against the real generated board with
`scripts/wyatt_ruleset_sim.mjs`, 1,500 games per configuration. The full working — the variants
tried, the dead ends, the two findings that had to be corrected — is in the git history of this
branch and does not need re-reading.

---

## 1. Setup

- The **Sugar Seas**: a circular sea on a 15×15 grid. **Tortuga** sits at the centre. Seven
  ingredient islands are scattered around it, each with **one berth** — a single water square where
  a ship may tie up, one ship at a time.
- Around the rim runs the **trade-wind current**, in four clockwise arcs.
- **Stock each island with (players − 1) crates.** Four captains → 3 crates an island, 21 in play.
- Deal each captain a **secret recipe** of 5 of the 7 ingredients.
- **Every captain takes 5 coins.** The same number for everyone.
- Each captain takes a **boat power** (§6), drafted one each, no duplicates.
- Set the wind wheel. Turn order is fixed for the game.

## 2. The round

1. **Spin the wind.** The wheel gives this round's direction — and it also shows **next** round's
   direction, and whether next round will storm. You always know one round ahead.
2. **Storm, if this round is stormy.** Every ship is pushed **3 squares** in the wind's direction,
   **all at once, before anybody takes a turn.** A ship driven into land loses its turn this round.
   **A ship sitting in a berth is safe** and is not pushed.
3. **Each captain takes a turn**, in order.

## 3. A turn: Trade → Sail → Act

### Trade — free, every turn

Deal with **any captain, anywhere on the sea**. Crates, coins, promises, alliances. Adjacency is not
required and trading does not cost your action. No bonus is paid; the deal is its own reward.

### Sail — free, every turn

**4 squares. But if any step of your move is directly upwind, your whole move is 2 squares.**

Crosswind is unpenalised — a 4-square move may mix downwind and crosswind freely. You may sail past
other ships but not end on one, and you may not sail through an island or Tortuga.

**Sail into the rim current and it sweeps you to that arc's clockwise end**, and your movement ends
there.

### Act — choose one

**⚓ Dock** — only from a berth. Flip once for treasure: **heads takes 3 coins, tails nothing.** Then
**buy any crate the island still has**, at that island's price: **3 for its first crate sold, 4 for
its second, 5 for its third.** You may buy crates you do not need — to trade, to deny a rival, or to
bluff about your recipe.

**⚔️ Battle** — an adjacent ship, including at Tortuga. Both captains **secretly commit any part of
their purse**, then reveal. **Both lose what they committed**, win or lose.

- The **downwind** captain adds **+1**.
- Higher total wins.
- **Tied** — one flip each; heads scores. **Still tied** — the captain with **fewer ingredients**
  wins.
- The loser gives up **5 coins or a crate, winner's choice**.

**🎣 Call the cast** — see §4. Only once per round, by whoever spends their action on it.

**🧁 Fire the ovens** — at Tortuga with your full recipe. You win (§5).

**Pass** — always available.

## 4. The Shared Cast

> Any captain may spend their action to **call the cast** — but **only once per round**, so whoever
> calls it pays for everybody.
>
> **Every captain plays, the caller included.** The pot starts at **1**.
>
> Each captain secretly decides: **take the pot as it stands, or stay in.**
> Everyone still in then rides **one shared flip**.
>
> - **Heads** — the pot **doubles**: 1 → 2 → 4 → 8 → 16 → … Decide again.
> - **Tails** — **every captain still in gets nothing.**
>
> It ends when everyone has taken the pot or a tails ends it.

## 5. Winning

The first captain to reach Tortuga with a complete recipe fires the ovens. **Every other captain gets
one last turn** to get home. If more than one makes it, they open the bakery together and the captain
with the **most resources** takes the crown.

## 6. Boat powers

One each, drafted at setup, no duplicates. Four of the eight sit out each game.

| | Power |
|---|---|
| **Racer** | Sail **5** whenever no step of your move is upwind |
| **Hedger** | Your upwind-capped move is **3**, not 2 |
| **Shooter** | **+1** in every battle |
| **Lockbox** | **You** choose which crate leaves your hold when you lose a battle — attacking or defending |
| **Trawler** | *(re-spec pending — see §9)* |
| **Trader** | *(re-spec pending — see §9)* |
| **Sturdy bow** | A storm moves you only **1** square |
| **Gambler** | A correct battle call pays **3**, not 2 |

## 7. On another captain's turn

You are never idle:

- **Call their battles.** Free, and a correct call pays **+2** from the bank.
- **Trade with them.** Any captain, any distance, at the start of their turn.
- **Ride the cast** whenever anyone calls it.

---

# Why each rule is the way it is

## Sailing: 4 squares, 2 if you go upwind at all

Replaces a 9-point budget with 2/3/4 step costs and a leeward exception — the largest block of rules
text in the box, and the only part that needed arithmetic at a table.

**The wind ends up mattering more, not less.** Holding each ruleset's own generosity constant, the
gap between the best wind and the worst wind for the same journey:

```
9-point budget:   1.398 squares of progress
4 / 2 upwind:     1.741 squares          +25%
```

Three rules deleted, a stronger effect, and no maths.

## Sailing is free

The old 1-coin sail cost funded a tax with a chore: fishing was **57% of every action in the game**
purely because you had to pay to move. Deleting the cost deletes the treadmill.

## Battle: commit any part of your purse

The old fight was a race to 2 points at 2 flips a round — 7.58 coin flips and ~25–30 seconds for one
crate, with no decision anywhere inside it. This version is one simultaneous reveal.

```
battles resolved with no coin flip at all:      ~90%
total coin flips per game:            ~75  ->   ~27
battles as a share of actions:      26.6%  ->   7.8%
attacker win rate:                  66.9%  ->  58.3%
```

**"Any part of your purse" rather than 0–3 is doing a lot of quiet work.** A 0–3 range stops being a
decision the moment everyone is rich, and it also made the *Shooter* power worth +18 points of win
rate — a third of the whole bid range. Opening the range up fixes the battle, the economy and the
boat powers in one move: it is the only unbounded coin sink in the game, and it halves the spread
between the strongest and weakest power without touching them.

## Dock: treasure 3, then buy any crate at 3/4/5

**Buying crates you don't need is the whole trade economy.** With captains only ever buying what
they needed, nobody held anything worth trading and deals ran at 0.12 a game. Allowing the hoard:

```
trades per game:        0.12  ->  39.5
```

The per-island ladder is what makes a contested island a race: the third captain to that island pays
5 where the first paid 3.

**Treasure pays 3** because the Shared Cast is a far smaller faucet than per-turn fishing, so the
dock has to carry more of the economy. Swept:

| treasure | coins at game end | docks you can't afford | seat spread |
|---|---|---|---|
| 2 | 3.9 | 38.1% | 2.9 pts |
| **3** | **4.5** | **27.7%** | **1.8 pts** |
| 4 | 5.1 | 20.8% | 6.3 pts |

## The Shared Cast

**The doubling ladder is exactly fair at every rung.** At a pot of `2ⁿ`, taking it gets you `2ⁿ` and
riding is worth `0.5 × 2ⁿ⁺¹ + 0.5 × 0` — also `2ⁿ`.

```
at  1:  riding is worth  1.00   exactly even
at  2:  riding is worth  2.00   exactly even
at  4:  riding is worth  4.00   exactly even
at  8:  riding is worth  8.00   exactly even
```

**The arithmetic never tells you what to do. Only your position does.** A captain who needs 4 coins
for the crate beside them rides to 4 and takes it. A captain who needs 1 takes 1 and walks. A captain
three short of the last vanilla on the board rides past sense. Any gentler ladder breaks this —
1/2/3/4/5 makes taking the pot correct from the second rung, 1/2/4/7/11 from the third. **Doubling is
the only shape that keeps the decision alive all the way up.**

It is also the cheapest thing in the game to play:

```
13.7 calls a game, 1.52 shared flips each   =  ~21 flips for the entire subsystem
0.65 hauls of 8 or more per game
~1.5 captains wiped out per call
```

Because everyone rides one coin, **the cost does not scale with player count** — a six-player game
takes the same table time as a three-player one. **No cap is needed:** modelling one at 8 changed
nothing to four significant figures, because a pot of 8 is reached 6.2% of the time. The coin caps
it for you.

**Once per round is a second decision, for free.** The caller spends an action; everyone else rides
for the same expected 1 coin. Calling is strictly worse than being called for — so the question is
who breaks first, and the answer becomes public the moment they do it.

## Trade is free and every turn, with no bonus

At roughly **39 deals a game** — about one every other turn — trade is now the most common
interaction in the game. It does not need subsidising, and a bonus on that volume would be a large
new coin faucet in an economy that is deliberately tight.

## Flat starting coins

The staggered 3/4/5/6 existed to offset going first. Free sailing weakened it so much that it
**overcorrected** — going last became best. Flat 5 each:

```
staggered:   19.5%  25.3%  27.5%  27.3%     8.0-point spread
flat five:   25.9%  24.1%  24.3%  25.2%     1.8-point spread
```

Turn order has effectively stopped mattering, and setup loses a step.

## Storms: 3 squares, everyone, at the start of the round

One system instead of two. Simultaneous resolution means the storm is a shared event the table
watches together rather than four separate interruptions. **Both readings of "docks can save you"
land within 0.7 rounds of each other**, so the wording is a taste call, not a balance one.

## Wind announces the next round

A rule that pays purely in information, so a simulation cannot price it — its whole value is at a
human table, letting captains plan two turns out instead of one. It costs nothing and deletes
nothing, so it stays on judgement rather than measurement.

## First home wins outright

I built the merchant line — sail to the nearest island, buy it out, sell it on — and raced it:

```
merchant 20.9%   vs   racer 29.1%
```

It loses structurally: a merchant converts tempo into coins, coins convert back into crates at 3–5,
and the racer spent that same tempo buying crates directly. **Decided: commerce is a support line,
not an alternative win condition.** With 21.6 swaps a game everybody is already part merchant. The
only change that would make hoard-and-sell a genuine way to win is scoring leftover resources, which
means giving up first-home-wins — not worth it.

---

# What this changes, measured

| | Shipped today | v2 |
|---|---|---|
| Rounds per game | 19.6 | **18.3** |
| Coin flips per game | ~75 | **~27 + ~21 shared** |
| Battles needing no flip | 0% | **~90%** |
| Battles as a share of actions | 7.6% | **7.8%** |
| Trades per game | ~2.6 | **39.5** |
| Wind, best vs worst direction | 1.398 sq | **1.741 sq** |
| Coins at game end | 7.6 | **4.5** |
| Docks you can't afford | — | **27.7%** |
| Captains locked out of a crate | 95.9% | **92.6%** |
| Seat spread, best minus worst | 9.2 pts | **1.8 pts** |
| Games that never finish | — | **0.4%** |

The shape of a turn, as a share of all actions: **dock 33%, pass 40%, cast 19%, battle 8%.**

A "pass" turn is not a wasted one — it still trades and still sails four squares. It reads as a
delivery run, and it is what makes calling the cast a decision instead of a default.

---

# Two things that are not rules, and matter as much as any of them

Both of the largest improvements above come from **how the AI plays**, not from the rulebook. A table
of humans does both instinctively. If the app does not, the online game will play as a far more
violent game than the same rules produce in person.

1. **Value crates properly, and try to buy before you plunder.** A crate is worth what getting it
   another way would cost — the island's price plus the sailing it saves, or far more if it is off
   the board and only trade or plunder can reach it. And a captain should only reach for the guns
   against someone who has actually *refused* a deal. This alone took trade from 2.5 deals a game to
   39, and battles from 27% of actions to 8%.

2. **Only call the cast when genuinely short** — and never when the coin would arm a rival who is one
   crate and one coin from finishing.

---

# Still open

- **Four boat powers need re-specifying.** Trawler, trader, gambler and sturdy bow all measured
  below baseline, and the reason is the same for all four: **they pay in coins, and coins are the
  most abundant thing in the game.** The two strong powers (shooter, lockbox) pay in battle outcomes,
  which are the scarcest. Trader is the extreme case — worth **0.24 coins a game**. Re-spec them to
  pay in tempo or information rather than money.
- **The draft order.** First-come-first-served was chosen, but with Shooter as written that gave
  seat 1 a **43.6%** win rate against seat 3's 16.1%. Opening the bid range halves Shooter's edge,
  and flat starting coins flattened the seats — but the two have not been measured together with
  powers on. If a spread reappears, drafting in **reverse** seat order fixes it and doubles as the
  compensation for going first.
- **Storm frequency.** At 1-in-8 storms cost 1.64 turns a game — most tables will barely notice
  them. 1-in-4 to 1-in-5 is the range where they are felt without stretching the game.
- **Reconcile the shipped rulebooks.** `RULES.md` and `Rules_boardgame.md` describe a battle system
  the engine stopped running some time ago, and call the home port Barbados where the game says Isle
  of Tortuga. That is independent of everything here and should be fixed before v2 is written down
  anywhere else.

---

*Re-run any figure here with `node scripts/wyatt_ruleset_sim.mjs 1500 --treasure=3 --bidmax=8
--tradefirst --flatcoins --shared`.*
