# Modelling Wyatt's ruleset — findings

**2026-08-03.** Wyatt's 14-rule revision, modelled against the real board.
Simulator: `scripts/wyatt_ruleset_sim.mjs` (dev-only, not in `npm test`, does not touch the engine).

It builds a normal `Game` from `src/engine/index.js` — so island placement, the single-berth dock
positions, the circular valid-cell set and the four clockwise rim arcs are the *real* generated map —
then runs its own turn loop with the new rules on top. 1,500 games, 4 captains, seeds 700000+.

**Verdict up front: this is a better ruleset than what ships today.** It cuts coin flips per game by
69%, shortens the game by 20%, makes the wind bite 25% harder while deleting the largest block of
rules text in the box, and roughly doubles the number of battles. Three things break, and one of them
breaks badly. All three are fixable without giving up anything you wrote.

---

## Scoping answers applied

Per your calls: crate prices are **per island** (3/4/5 for its 1st/2nd/3rd buyer — the ladder fits
exactly, since an island holds `players − 1` = 3 crates), the **rim current survives untouched**,
**boat powers are not modelled** (baseline run), and **first captain home still wins outright** with
"most resources" only breaking a same-final-round tie.

## Assumptions I had to make — correct me on any of these

1. **"Upwind" means the single direction directly opposite the wind.** Crosswind is unpenalised, so a
   4-square move can mix downwind and crosswind freely; one step directly upwind caps the whole move
   at 2.
2. **A storm blows in that round's announced wind direction.**
3. **"Docks can save you" = sitting in a berth makes you immune to the push.** I also modelled the
   other reading (you get dropped into an empty berth on the way) — see §5, it barely matters.
4. **Trade is one completed deal per turn, initiated by the active captain, with no bonus coin.**
5. **Battle ties:** one flip each, heads scores; if still level, fewer ingredients wins; if that is
   also level, the defender holds.
6. **You buy only crates you need.** This one turns out to matter enormously — §3.2.

---

## 1. The headline numbers

| | Shipped rules | Your rules | |
|---|---|---|---|
| Coin flips per game | ~75 | **23.5** | −69% |
| Rounds per game | 19.6 | **15.6** | −20% |
| Battles per game | 6.0 | **8.8** | +47% |
| Battles resolved with **no flip at all** | 0% | **67.7%** | — |
| Wind: best-wind vs worst-wind spread | 1.398 sq | **1.741 sq** | +25% |
| Captains locked out of a needed crate | 95.9% | 91.3% | held |
| Crates left on the board | 4.7 / 21 | 4.7 / 21 | identical |
| Mean coins at game end | 7.6 | **33.3** | ⚠️ +338% |
| Trades per game | ~2.6 | **0.12** | ⚠️ −95% |
| Fishing share of actions | 57.0% | **56.5%** | unchanged |

---

## 2. What the ruleset fixes, and it fixes a lot

**Rule 9 is the star.** The secret committed-coin battle resolves **67.7% of the time on the
committed coins alone** — no flip, no race, one reveal. Total coin flips across an entire game fall
from ~75 to 23.5. Against my earlier measurement of ~4.2 seconds of forced animation per battle
*round*, at 3.79 rounds a battle, this should take a battle from ~25–30 seconds to under ten. It also
does what you asked for on the second count: there is now a genuine decision inside a fight, made
simultaneously, under uncertainty, with a real cost either way.

**Rule 1 is the best rules-per-effect trade in the whole set.** It deletes the 9-point budget, the
2/3/4 step costs and the leeward rule — the largest block of rules text in the game and the only part
that requires arithmetic at a table — and the wind ends up mattering *more*, not less. The upwind cap
actually costs you distance toward your target on **27.2% of turns**. One rule, three deleted, and a
stronger effect.

**Rules 5 + 9 together roughly double battle frequency** (6.0 → 8.8 per game), and since every battle
triggers a Lookout call from every spectator, off-turn engagement roughly doubles with it. That is
the mechanism my review recommended extending, getting more use because the thing it hangs off got
cheaper.

**Scarcity survives intact.** 91.3% of games still end with a captain locked out, and exactly the
same 4.7 of 21 crates are left on the board. The engine that forces a scramble is untouched.

**Rule 3 removes a flip and adds a social hook** — everyone gains on someone else's fishing turn,
which is a real reason to care about a turn that is not yours.

---

## 3. What breaks

### 3.1 — Runaway inflation, and it disables three of your own rules

This is the serious one.

```
coins minted per game    223.2
coins burned per game    108.0
net                      +115.1

mean coin pile by round:  r1=6  r4=9  r7=13  r10=19  r14=29
mean coins at game end:   33.3      (today: 7.6)
```

Fishing mints **5 coins per action** (2 to the fisher, 1 to each of three rivals) and is 56.5% of all
actions — about 175 coins a game from fishing alone. The only sinks are crates and battle stakes, and
**crates are bounded**: there are 21 on the board, so the crate sink cannot exceed ~84 coins no matter
what you charge.

I tested that directly:

| Variant | Mean coins at end | Docks you couldn't afford |
|---|---|---|
| As written (3/4/5) | 33.3 | 8.3% |
| Steeper ladder 5/7/9 | 28.1 | 27.3% |
| Ladder 5/7/9, bids up to 6 | 25.5 | 34.5% |
| No off-turn fish bonus | 13.7 | 24.9% |

**You cannot price-fix this.** Nearly doubling every crate price moves the end pile from 33 to 28,
because the number of purchases is capped by the number of crates, not by their cost.

Why it matters: **rules 9, 10 and 11 are all denominated in coins.** Once a captain is holding 20+,
the secret bid is always "3" (so rule 9 collapses back into a coin flip), the treasure flip is
noise, and the crate price is not a decision. By roughly round 8 of a 15-round game, three of your
fourteen rules have stopped being decisions.

**Three fixes, in the order I'd try them:**

1. **Let the bid be your whole purse, not 0–3.** The 5/7/9 + bid-to-6 run pushed battles resolved on
   the coins alone from 67.7% to **81.0%** — *fewer* flips, not more — and made the end pile fall.
   Wealth becomes frightening, poverty becomes a bluff, and the battle becomes the unbounded sink the
   economy is missing. This is one word of rules text and it is the change I would make first.
2. **Make coins count at the end.** You chose "first home wins outright," which leaves coins as pure
   fuel — and fuel you have 33 of is not a constraint. If leftover coins were the tiebreak (or a
   small score), inflation stops being a bug and becomes a second thing to race for.
3. **Make the off-turn +1 a non-coin.** A fish token, spendable only on a crate, or a peek at a
   rival's recipe. Keeps the generosity, mints no money. Don't just delete the bonus — it is the best
   off-turn hook in your list.

### 3.2 — Rule 11 quietly killed trading

**0.12 completed trades per game.** Rule 4 made trade free and available every single turn, and it
still essentially never happens.

The cause is not rule 4, it is **rule 11**. "You always buy" means captains only ever buy crates they
need — so nobody ever holds a crate they don't want. Under the shipped rules, a heads at the dock
hands you a crate *whether it is on your recipe or not*, and that surplus cargo was the entire trade
economy. Take away the accidental crate and free trading has nothing to trade.

This is structural, not an artefact of my bot: with rule 11 as written, surplus cargo can only enter
the game as battle spoils.

**Fix, cheapest first:** let a docked captain buy **any** crate at the ladder price, needed or not.
One clause, it restores trade bait, it gives rich captains something to do with the money from §3.1,
and it makes the crate ladder bite because rivals are now competing for stock you might block.

### 3.3 — Fishing is still 56.5% of all actions

The same number as today, but a different disease — and worth being precise about which.

Today you fish because you are **broke**: sailing costs a coin and fishing is how you afford it.
Under your rules you fish because you are **in transit**. There are three Acts, and two of them are
positional: docking needs a berth, fighting needs an adjacent ship. When you are in open water — most
turns — fishing is the *only legal action*.

It is genuinely better than it was: it costs no flip, and it pays the whole table, so it is at least
interesting to everyone. But the most common action in the game still contains no decision. If you
want that fixed, it needs a third non-positional Act, or fishing needs a choice inside it (my review's
"draw 2, keep 1" is one shape; there are others).

---

## 4. Two things worth watching

**Attacking is now strongly +EV.** Attacker win rate **66.9%**, up from 42.5% today, which is why
battles nearly doubled. That is mostly a feature — the theme's headline verb should not be a rounding
error — but combined with **rule 14** (no sanctuary at Tortuga) it points at a leader-bashing endgame:
a captain sitting on a full recipe at home is both the most valuable target and now a legal one. The
**fewer-ingredients tiebreak fires in 16.6% of battles**, which is a real catch-up force pulling the
same way. Worth a playtest specifically aimed at the last two rounds.

**First-captain advantage persists: seat 1 wins 28.4%, seat 4 wins 21.0%** — a 7.4-point spread. The
staggered starting coins (3/4/5/6) exist to offset going first, and **rule 2 weakened them**: when
sailing is free, coins matter less, so the compensation is worth less. If you keep the ladder as
compensation it probably needs to be steeper, or the compensation should become something other than
coins.

---

## 5. Answers to two things you left open

**Rule 8, "docks can save you" — the two readings barely differ.** Berth-immunity gives 15.6 rounds
and 1.64 turns lost to storms; dropped-into-a-berth-on-the-way gives 16.2 rounds and 2.37 turns lost.
Pick whichever reads better at the table; it is a wording decision, not a balance one.

**Rule 7 storms are mild as specified.** At 1-in-8 they cost 1.64 turns per game across four captains
— most games barely notice them. I ran storms at every round as a ceiling: games stretch to 29.2
rounds and fishing rises to 68%, so that is far too much. If you want storms *felt*, the useful range
looks like 1-in-4 to 1-in-5.

**And one you didn't ask about: the rim got weaker.** Removing the current entirely makes games
*shorter* in the model (13.9 rounds vs 15.6), because a captain who enters an arc without planning it
gets flung to that arc's end — often away from where they were going. With sailing now free and 4
squares wide, the current's edge over ordinary movement has shrunk, so it has drifted from "daring
shortcut" toward "hazard you blunder into." It is still excellent for a player who *routes*
deliberately — but that is now a bigger skill gap, on a mechanic the project's own playbook records a
dedicated player missing for a whole game. If you keep it, make it loud.

---

## 6. A correction to my earlier review

My design review said the wind "never changes how much you can do, only which 38% of it." The
reachable-*cell-count* figure behind that (11.3–12.0 whichever way it blows) is correct, but it was
the wrong measure — cell count is direction-invariant by symmetry on an open board, so it could never
have shown a difference. Measured properly, as progress toward an actual target, the shipped wind is
worth **1.398 squares** between the best and worst direction, and it matters in 92.6% of positions.
So the shipped wind does more than I credited.

That does not change the recommendation — your rule 1 still improves it to 1.741 squares, a 25% gain,
while deleting three rules — but "the shipped wind does nothing" was too strong, and the comparison
above is the honest version.

---

## 7. What I'd change, and what I'd leave alone

**Leave alone:** rules 1, 2, 3, 5, 6, 7, 8, 12, 14. They do what you want.

**Three changes, in priority order:**

1. **Let the battle bid be your whole purse** rather than 0–3 (fixes §3.1: fewer flips, wealth
   matters, and it is the unbounded sink the economy needs).
2. **Let a docked captain buy any crate, not only ones they need** (fixes §3.2: restores the trade
   economy that rule 11 removed).
3. **Decide what coins are for at the end** — either they score, or the +1 off-turn fishing bonus
   becomes a non-coin token. Otherwise money stops mattering around round 8.

**Rule 13 (boat powers) should be designed against these numbers, not before them.** The pressure
points the model found — the mid-game money glut, the dead trade layer, fishing as the default
transit action, and the 7.4-point first-player edge — are exactly what asymmetric powers are good at
absorbing. Send me the powers, or say the word and I'll propose a set aimed at those four.

---

## Re-running this

```bash
node scripts/wyatt_ruleset_sim.mjs 1500                      # as written
node scripts/wyatt_ruleset_sim.mjs 800 --bidmax=6            # wider battle bids
node scripts/wyatt_ruleset_sim.mjs 800 --price=5,7,9         # steeper crate ladder
node scripts/wyatt_ruleset_sim.mjs 800 --fishothers=0        # no off-turn fishing bonus
node scripts/wyatt_ruleset_sim.mjs 800 --dockshelter=path    # the other reading of rule 8
node scripts/wyatt_ruleset_sim.mjs 800 --norim               # price the trade winds
node scripts/wyatt_ruleset_sim.mjs 800 --storm=0.25          # heavier weather
```

Every run ends with a wind probe using the same metric as the shipped-rules measurement, so the two
stay directly comparable.
