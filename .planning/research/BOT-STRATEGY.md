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

## 1. The one rule that governs everything: measure in TURNS, never in squares

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

### Phase 1 — Trade (free, costs no action)

1. Offer a **swap** to every captain holding something you need, where you hold something they need.
2. Otherwise **buy** what you need at the settled price, if you can afford it.
3. Otherwise **sell** surplus to whoever values it above your reservation.

**Record refusals.** If a captain would not deal for a crate you need, remember it. That record is
what makes the next phase behave like a pirate game instead of a brawl.

### Phase 2 — Sail (free)

Pick a target, then sail to the reachable square that ranks best toward it.

**Target priority:**

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

## 5. Battle: try to buy before you plunder

**This is a hard requirement, not a heuristic.** A bot that attacks whenever a target is adjacent
produces a completely different game from the one the rules describe:

```
attack on sight:            battles are 26.6% of all actions
attack only after refusal:  battles are  7.8% of all actions
```

Wyatt's design intent, verbatim: *"battles would only come when players were being stingy and
unwilling to trade."* The rules cannot enforce that. The bot has to.

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

## 7. Tuning knobs, and what each one moves

| Knob | Default | Raising it |
|---|---|---|
| Denial detour tolerance | 1 turn | more hoarding, more lockouts, longer games |
| Hoard reserve (coins kept back before buying a crate you don't need) | 6 | less hoarding, less trade |
| Exhausted-island crate value | 14 | more desperate late-game deals and fights |
| Reservation denial term | +1 per rival needing it | higher prices, fewer deals |
| Battle commitment when the stake is a needed crate | full purse | shorter, more decisive fights |

---

## 8. Targets — what a healthy game looks like

Measure a bot change against these. They are the v2 recommended configuration, 2,000 games,
four captains:

```
rounds per game                16.6        games that never finish     0.0%
docking, share of actions      32.7%       trades per game             37.6
passing                        39.9%       coins at game end            4.0
the cast                       19.0%       docks you can't afford      29.6%
battle                          8.4%       battles needing no flip     89.6%
                                           seat spread            2.7 points
```

**The two numbers to watch when tuning are trades per game and battles as a share of actions.** If
trade falls below ~20 a game or battles rise above ~15%, the bot has stopped negotiating and started
raiding, and the game will feel wrong long before anything else shows it.

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
