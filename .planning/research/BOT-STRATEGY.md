# Bot strategy — the specification

**2026-08-03.** How a Pastry Pirates captain should think. Written to direct the **real** bots in the
game, not just the simulator. `scripts/wyatt_ruleset_sim.mjs` is the reference implementation and
every number below came out of it, but the strategy is the deliverable — the sim is just where it
was measured.

**Why this document exists.** Two of the largest quality improvements measured across the whole v2
design pass were not rule changes at all. They were changes to *how the bot thinks*: valuing crates
properly and trying to buy before plundering took trade from 2.5 deals a game to 38, and battles
from 27% of actions down to 8%. A human table does both instinctively. **If the app's bots don't,
the online game plays as a far more violent, far less social game than the same rulebook produces in
person.** That gap is invisible in the rules and only shows up in play.

---

## 0. The governing principle: logic, not gates

> **"Don't give bots gates to follow, give them logic-based rules that a human player would also be
> using."** — Wyatt, 2026-08-04

This is the standing rule for this file, and everything below is subordinate to it.

**A gate is a condition that forbids an action.** *Only attack after they refuse a deal. Only call
the cast if you are short. Only buy a crate you need.* Gates read as sensible in a specification and
behave terribly in play, for a reason that is easy to miss: **a gate cannot be seen failing.** It
produces no error and no odd number — the action simply never happens, and the game looks like it
was designed that way.

Three of them shipped in the first build, and each cost a playtest to find:

| Gate | What it did | Found by |
|---|---|---|
| Attack only after a public refusal | A laden rival was adjacent on **46.5%** of turns; the bot fought on **1.4%** | Playing it |
| Trade evaluated before battle, returning immediately | Made the fight branch unreachable whenever any deal existed | Instrumenting the above |
| Offer at the top of every turn, no cost | Bots asked every rival every round — "it feels like advertising" | Playing it |

**A human plays by valuation, not by permission.** They ask what each option is worth and take the
best one. So the bot prices every legal action in coins and picks the maximum:

```
bake     winning
dock     PROGRESS − price + expected treasure
trade    PROGRESS − the least anyone will take
battle   P(win) × PROGRESS − my stake
cast     what the coin unlocks − what it hands my rivals
hold     ~0
```

Three properties fall out, and they are why this is the rule rather than a preference:

1. **Nothing is ever unreachable.** An option that never wins is *losing on value*, which shows up
   as a number you can inspect — not as silence.
2. **New actions need no ordering.** They slot in by being priced. Nobody has to decide which rung
   they belong on, and nobody can put them on the wrong one.
3. **The behaviour reads as intent.** A captain who fights when the prize is worth it and deals when
   it is not looks like they are thinking, because they are — the same arithmetic a person does.

**A refusal is the model case.** It used to be a gate: *never ask them again.* Now it raises what you
believe they will charge, so the ask simply loses on value — and becomes worth making again when
your need grows or their price falls. That is what "they said no last time" actually means to a
person, and it is a rule rather than a wall.

**When you catch yourself writing `if (...) return X`, that is a gate.** Write `worth(X)` instead.

---

## 1. Measure in TURNS, never in squares

This is the single most important line in the document.

**A berth three squares upwind is two turns away. A berth six squares downwind is one turn away.**
Square distance says the first is closer. It is not. Every valuation a captain makes — which island
to sail for, what a crate is worth in a trade, whether a denial detour is affordable, whether to
fight now or later — is denominated in **turns**, so it must be measured in turns.

Getting this wrong is not a rounding error. When the simulator used square distance it consistently
picked the wrong island, and the game ran 16.6 rounds once it was fixed against 18.3 before.

### How to compute it

The board is static, so precompute once per wind direction and cache:

1. **The one-turn move graph.** For every water cell, the set of cells a ship can *end* on in one
   move under that wind — the reachable set from §2, with rim-current sweeps resolved to the arc
   head. 177 cells × 4 winds, computed once at game start.
2. **Turn distance** is then a plain breadth-first search over that graph.

```
turnsFrom(cell, wind)  -> turns to reach everywhere      (forward graph)
turnsTo(target, wind)  -> turns to reach target          (REVERSED graph)
```

**Both directions are needed, and they are different numbers.** The wind makes going somewhere
cheaper than coming back, so the graph is not symmetric. "Which island shall I sail for" uses the
forward graph from my position. "Which of the squares I can reach this turn is closest to my target"
uses the **reversed** graph from the target. Using the forward graph for the second question is a
silent bug — it will look plausible and route wrongly.

### The plateau trap — read this before implementing

Turn distance is a small integer, so **most candidate squares tie**. Ranking on turns alone leaves
the bot on a plateau with nothing strictly better than standing still, and it never moves. When this
was first implemented the bots stopped sailing: docking fell to 4.5% of actions, 78% of turns became
passes, and **half of all games never finished.**

Rank lexicographically — **turns first, then squares as the tiebreak**:

```
rank(cell) = turnsTo(target)[cell] * 1000 + squareDistance(target)[cell]
```

Turns decide; squares break ties and make progress within a turn.

---

## 2. Movement

Under v2 a move is **4 squares if no step is directly upwind, 2 squares if any step is.** Crosswind
is unpenalised. Compute the reachable set as the union of two walks:

- up to 4 steps using only downwind and crosswind directions
- up to 2 steps using any direction

Entering a rim-current cell **ends the move** and sweeps the ship to that arc's clockwise head. A
ship may pass through an occupied square but not end on one.

---

## 3. What things are worth

Everything the bot decides comes from these three functions. Get them right and the behaviour falls
out; hard-code priorities instead and it will always feel wrong somewhere.

### A crate's value to a captain who needs it

```
value(captain, ingredient):
    if the captain does not need it            ->  0
    if the island's stock is gone              ->  14      // only trade or plunder can reach it now
    otherwise  ->  islandPrice + 2 * turnsFrom(captain, thatBerth)
```

**"What would it cost me to get this another way?"** The island's ladder price plus the tempo of
sailing there. The `14` for an exhausted island is what makes the late game work — once the last
crate of an ingredient is off the board, whoever holds it is sitting on something enormously
valuable, and the bot must know that or it will refuse deals it should be desperate for.

### A crate's reservation price to whoever holds it

```
reservation(holder, ingredient):
    if the holder still needs it               ->  never for sale
    otherwise  ->  2  +  (number of rivals who need it)  +  (3 if the island is exhausted)
```

Holding a crate a rival needs has **denial value** even when it is useless to you. That term is what
makes hoarding a real strategy rather than a mistake.

### Whether a deal exists

A deal exists whenever **value ≥ reservation**. Settle in the middle:

```
price = ceil((value + reservation) / 2)
```

Straight swaps — each captain holds what the other needs — are always the best deal available and
should be offered first. They cost no coins and save both sides a voyage.

---

## 4. The decision procedure

In order, every turn.

### Phase 1 — Trade: call ONE offer to the whole table

Not a private ask to each rival in turn — that is a dozen prompts a turn and it is miserable to play
and to watch. **One call, both sides named, to everybody at once.**

1. **What to call for.** The crate you need whose `value()` is highest — that is, the one that would
   cost you most to fetch yourself. That is where a deal beats sailing.
2. **What to offer.** A surplus crate the seller needs, if you have one (it costs you nothing).
   Otherwise coins, opening at roughly 60% of your `value()` for it.
3. **If nobody holds anything you need** and you are short of coin for your next crate, call a
   **sale** instead: name a surplus crate and let rivals bid for it.
4. **Answering someone else's call:** if you hold what they want, answer with your `reservation()`
   for it. Two holders will undercut each other automatically, because each is answering with the
   least they will take.
5. **The offerer then picks** the best answer — a swap first (it costs no coins), else the cheapest
   ask — or walks.

**Record refusals.** A holder who will not deal at any price you would pay has refused **in public,
in front of the whole table**. That record is what licenses the guns later (§5) — and it is the
difference between a pirate game and a brawl.

**Reservation must scale with threat.** A captain does not sell the winning ingredient to the rival
who is one crate from home. Add a large premium (+12) against a buyer with one need left, a smaller
one (+5) at two. Without it the market clears everything, nobody is ever stingy, and **battles fall
to 0.5% of actions** — the whole reason to fight disappears.

### Phase 2 — Sail (free)

Pick a target, then sail to the reachable square that ranks best toward it.

**Target priority:**

0. **Plan a chain, not a next stop.** Cost the whole pickup route — me → each needed berth in some
   order → home — in turns, and take the cheapest order. Brute-force it at five stops or fewer (120
   orderings); nearest-neighbour beyond. **Re-plan only when your need-set or the wind changes**, and
   drop stops as you collect them. A route recomputed every turn is not a plan, it is a wander.
1. If your recipe is complete → **home**.
2. If an ingredient you need is **gone from the board** → the position of whoever **holds** it. You
   cannot buy it; you must deal or take it.
3. Otherwise → the nearest berth (in turns) holding something you need.
4. **Denial detour:** if you are rich, an ingredient is down to its last 2 crates, a rival needs it
   and you do not, and that berth is **no more than one turn further** than your own best target —
   go and buy it out. Never make it a voyage; only a detour.

### Phase 3 — Act, in this order

1. **Fire the ovens** if home with a full recipe.
2. **Dock** if berthed and the island has something you want. Always buy if you can afford it,
   including crates you do not need when a rival needs them and you can spare the coin.
3. **Battle** — *only* against a captain who has **refused a deal** for something you need, or who
   is visibly hoarding. See §5.
4. **Call the cast** — only if genuinely short. See §6.
5. **Pass.** A pass is not a wasted turn: you still traded and still sailed four squares.

---

## 5. Battle: a strategy, weighed against trade — not a last resort

**SUPERSEDES the earlier "try to buy before you plunder" rule.** Wyatt, 2026-08-04: *"This is a
pirate game; battles should not be a last resort, they should be a viable strategy, period. If a bot
is close enough to someone who has a resource that they need, and they have enough money, then they
should do what they would reasonably do, which is try to attack them."*

He is right, and the economics agree: committing ~4 coins for a ~60–88% shot at a crate worth 8–14
is clearly positive. The old rule was not caution, it was an ordering accident — trade was evaluated
first and returned immediately, so a fight was only ever reached when no deal existed.

**Measured, and it was not squeamishness — it was the ordering.** A laden rival is orthogonally
adjacent on **46.5% of all turns**, and under the old rule the bot fought on **1.4%**.

### The evaluation

```
prize   = the most valuable crate aboard them that I need   (crateValue)
stake   = enough to beat what they will likely show, capped at 70% of the prize
theirs  = about 55% of their purse, +1 if they are downwind
P(win)  = 0.88 if my stake beats theirs · 0.12 if it does not
          0.50 if level, ±0.12 for the lighter-hold tiebreak
gain    = P(win) x prize  −  stake
```

**Then weigh it against the deal**, and take whichever is worth more. That single change — comparing
the two rather than ordering them — took battles from **0.81 a game to 7.33**, more than the shipped
v1 game, while trade held at 17.7.

A refusal is no longer a *licence* to fight. It stays in the model as what it always was: evidence
about a rival's recipe, which raises what you think they will charge.

**Commitment size.** Both captains secretly commit any part of their purse; both lose it either way.
Commit in proportion to what is at stake — the full purse when the target holds the last crate of
something you need, a token when you are fishing for coins. Remember the defender adds **+1 if
downwind**, so a downwind defender needs beating by 2.

**Never attack a captain you have not tried to deal with first.**

---

## 6. Calling the cast: "does this help my opponents more than me?"

The Shared Cast pays **every** captain, so calling it is a public good funded by your action. Wyatt's
framing: *"the decision becomes 'should I do something that helps my opponents' or not — make sure
your bot is tactically deciding this."*

**Call it only when both are true:**

- You **cannot afford** the crate you are sailing for, and
- it would **not** hand a rival the last coin they need. Concretely: no opponent is one crate from
  finishing and exactly one coin short of affording it.

**Riding it is purely positional, and that is the point.** The pot doubles 1 → 2 → 4 → 8, so taking
it is worth exactly what riding it is worth at *every* rung. The arithmetic never says what to do.
So the rule is simply:

```
ride while  pot < (what I am short by),  take it the moment the pot covers the gap
```

A captain needing 4 rides to 4 and takes it. A captain needing 1 takes 1 and walks. A captain three
short of the last vanilla on the board rides past sense — and should.

---

## 6b. Choosing your recipe

Dealt two, keep one. **Cost the full route for each** — every ingredient still in stock, in the
cheapest order, ending at home — and keep the cheaper one. This is the same `bestRoute` used for
targeting, run once at setup. It is the first decision of the game and the only one made with
complete information about the board.

## 6c. Chain-routing and trade-goods detours — specified, but NOT confirmed by the model

Wyatt plays by chaining: find islands you can hop dock-to-dock roughly one a turn and sail that
route, **even through crates you do not need, because those are trade goods**. It is specified above
because it is plainly right at a table. **It did not beat greedy nearest-need in simulation, and the
honest reading is that the model is the weak party, not the strategy:**

```
greedy nearest-need                     17.9 rounds   0.6% never finish
chain-order your own needs              18.5 rounds   0.8%
chain-order + trade-goods detours       25.0 rounds   2.6%
```

Three reasons to distrust that result before distrusting the strategy:

1. **The router ignores the wind forecast, and it is the obvious culprit.** Rule 6 tells every
   captain next round's wind. A human plans the chain around it. The implementation above plans
   under the *current* wind only and then re-plans when it changes — so it is repeatedly planning a
   route the weather then invalidates. **Fix this before concluding anything.** Cost the first leg
   under this round's wind and later legs under next round's.
2. **The detour only pays if the selling side is strong.** A bot that picks up trade goods it cannot
   monetise has simply spent turns. Human selling is far better than anything modelled here.
3. **A small board hides the effect.** At 4 squares a move on a 15×15 sea most islands are 2–3 turns
   apart whatever order you take them in, so there is less chain to find than at a table with a
   bigger relative map.

**Implement it, then measure it again with the forecast wired in.** If chaining still does not win,
that is a finding about this board size — not about the way Wyatt plays.

## 7. Tuning knobs, and what each one moves

| Knob | Default | Raising it |
|---|---|---|
| Denial detour tolerance | 1 turn | more hoarding, more lockouts, longer games |
| Hoard reserve (coins kept back before buying a crate you don't need) | 6 | less hoarding, less trade |
| Exhausted-island crate value | 14 | more desperate late-game deals and fights |
| Reservation denial term | +1 per rival needing it | higher prices, fewer deals |
| Battle commitment when the stake is a needed crate | full purse | shorter, more decisive fights |
| Threat premium on `reservation()` (1 need left / 2) | +12 / +5 | fewer deals with the leader, more battles |
| Trade-goods detour tolerance (turns per dock) | must not worsen | more trade goods, longer games |

---

## 8. Targets — what a healthy game looks like

Measure a bot change against these. They are the v2 recommended configuration, 2,000 games,
four captains:

```
rounds per game                17.7        games that never finish     0.4%
docking, share of actions      27.9%       trades per game             34.6
passing                        57.3%       coins minted / burned   75.4 / 74.7
the cast                       12.5%       coins at game end            5.2
battle                          2.3%       docks you can't afford      18.5%
offers per game                52.5        battles needing no flip     87.2%
  filled                       65.9%       seat spread            5.1 points
  drew competing answers       55.5%
```

**The two numbers to watch when tuning are trades per game and battles as a share of actions.** If
trade falls below ~20 a game the bot has stopped negotiating; if battles rise above ~15% it has
started raiding. Either way the game will feel wrong long before anything else shows it.

**And note where the aggression dial actually lives.** At the settings above battles are 1.6 a game
— arguably too peaceful for a pirate game. That number is set almost entirely by the **threat
premium** in `reservation()`, not by any rule: raise it and captains refuse more, refuse more and
the guns come out. The online game's whole temperament is therefore an AI setting. Decide it
deliberately.

---

## 9. Known limits of this specification

Stated so nobody mistakes a modelling gap for a design finding:

- **Deterrence is not modelled.** The bots do not decline a fight because a target looks dangerous.
  A power like "attackers must commit their whole purse" measured *negative* for exactly this
  reason — the bots attacked anyway and simply went all in. Any power that works by frightening
  people off will be undervalued until the bots reason about being attacked.
- **Information has no value to these bots.** Anything that pays in knowledge — seeing the wind two
  rounds out, hiding your cargo, peeking at an island's stock — measures as zero. That is a
  limitation, not a verdict.
- **Bluffing does not exist.** Secret commitment in battle is played as a valuation, never as a
  bluff. Human play will be more interesting and less predictable than any number here.
- **Ships are ignored in the turn graph.** They block *ending* on a cell but move constantly, so the
  cached graph omits them. It under-estimates by at most a turn.
