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

### 3.2 — Rule 11 quietly killed trading  ⚠️ SUPERSEDED — see §9

**0.12 completed trades per game.** Rule 4 made trade free and available every single turn, and it
still essentially never happens.

The cause is not rule 4, it is **rule 11**. "You always buy" means captains only ever buy crates they
need — so nobody ever holds a crate they don't want. Under the shipped rules, a heads at the dock
hands you a crate *whether it is on your recipe or not*, and that surplus cargo was the entire trade
economy. Take away the accidental crate and free trading has nothing to trade.

This is structural, not an artefact of my bot: with rule 11 as written, surplus cargo can only enter
the game as battle spoils.

> **This section was based on a misreading.** Wyatt intended rule 11 to allow buying **any** crate
> all along — to hoard, to monopolise, to bluff. Modelled correctly it does the opposite of what is
> written below: trade goes from 0.12 to **2.56** deals a game. §9 has the corrected numbers. The
> analysis of *why* trade needs surplus cargo still holds; only the conclusion about rule 11 was wrong.

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

**Rule 13 (boat powers) is now modelled too — see §8.**

---

---

## 8. Rule 13 — the eight boat powers

Modelled per your four answers: **unique draft, no duplicates**; **racer/hedger raise the budget**
(racer moves 5 whenever no step is upwind, hedger's upwind-capped move becomes 3); **lockbox applies
to any loss, attacking or defending**; balanced against **your rules exactly as written**.

Method: each game draws **4 distinct powers from the 8 at random and seats them at random**, so seat
advantage washes out and what is left is the power itself. 4,000 games. **A power with no effect
sits at 25.0%.**

### As written

```
  shooter     43.2%   +18.2   ████████████████████████████████████
  lockbox     29.0%   + 4.0   ████████
  hedger      25.3%   + 0.3   █
  racer       24.6%   - 0.4   █
  trawler     19.7%   - 5.3   ███████████
  sturdybow   19.5%   - 5.5   ███████████
  gambler     18.5%   - 6.5   █████████████
  trader      17.6%   - 7.4   ███████████████
```

**A 25.6-point spread.** Shooter is not a power, it is a win button.

Read these relatively: four seats must sum to 100%, so shooter winning 43% mathematically drags
everyone else below 25 whether or not they deserve it. Here is the same field with shooter removed,
which is the honest read on the other seven:

```
  lockbox     33.7%   + 8.7        trawler     21.6%   - 3.4
  hedger      29.5%   + 4.5        sturdybow   20.8%   - 4.2
  racer       27.0%   + 2.0        gambler     20.6%   - 4.4
                                   trader      20.0%   - 5.0
```

Still a 13.7-point spread, and the ordering barely moves.

### The one-line diagnosis

**A power is worth exactly what its currency is worth, and your three weakest powers all pay in
coins.**

| Pays in | Powers | Result |
|---|---|---|
| **Battle outcomes** (the scarcest thing) | shooter, lockbox | the two strongest |
| **Position / tempo** | hedger, racer, sturdybow | roughly neutral |
| **Coins** (the most abundant thing) | trawler, gambler, trader | the three weakest |

§3.1 measured a game that ends with **33.3 unspent coins**. Against that:

- **trawler** is worth about **+8.8 coins a game** (~8.8 of your own fishing turns, +1 each).
- **gambler** is worth about **+2.4 coins a game** (you spectate ~4.4 battles, call right ~55%).
- **trader** is worth **+0.24 coins a game.** Trade fires 0.12 times per game (§3.2), so this power
  is a rounding error. It is not undertuned — it has nothing to attach to.

You cannot fix trawler, gambler or trader by raising their numbers. They are denominated in the one
resource the game has a surplus of.

### The draft compounds the first-player advantage badly

You chose first-come-first-served. Modelled that way, with seat 1 taking shooter:

```
  seat 1 = 43.6%    seat 2 = 22.4%    seat 3 = 16.1%    seat 4 = 17.4%
```

The existing 7.4-point seat advantage (§4) becomes a **27.5-point** one. Picking first from an
unbalanced set is a second first-player advantage stacked on the first.

**Recommendation, and it kills two birds: draft the powers in REVERSE seat order.** The captain who
sails last picks their ship first. That is the standard fix, it is thematically fine (last to the
tavern gets first pick of the fleet), and it is a *better* compensation for going first than the
staggered starting coins — which rule 2 already weakened, since coins matter less when sailing
is free. You could then flatten starting coins to a single number for everyone and delete a setup
step.

### Two couplings worth knowing

**Fixing the economy fixes shooter for free.** Re-run with the wider battle bids I recommended in
§3.1:

```
  as written (bids 0-3):   shooter +18.2, total spread 25.6 points
  wider bids (0-8):        shooter + 8.9, total spread 13.7 points
```

Shooter's +1 is a third of a 0–3 range and a twelfth of a 0–8 one. **Adopting whole-purse bidding
halves shooter and halves the entire power spread**, without touching rule 13 at all. Lockbox
self-corrects too, from +4.0 to −0.4, because more battles resolve on coins and fewer end in a crate
being taken.

**Storm frequency is a referendum on sturdy bow.** At your 1-in-8 it is worth ~0.4 turns a game.
Doubling storms to 1-in-4 only moves it from −5.5 to −2.7 — better, still weak. Sturdy bow needs
re-specifying, not a dial.

### Per-power verdict

| Power | Verdict | What I'd do |
|---|---|---|
| **shooter** | Broken as written (+18.2) | Adopt whole-purse bids and it lands at +8.9 on its own. If you keep 0–3 bids, make it *"+1 when attacking only"* or *"you win ties"* instead |
| **lockbox** | Strong (+8.7 clean), and it fires 0.9–1.8 times a game | Fine at any-loss **if** the economy is fixed. Under your rules as written, narrow it to defender-only |
| **hedger** | Healthy (+4.5) | Keep. Interesting that it beats racer — **relaxing your worst case is worth more than extending your best case**, which is a good general rule for this whole set |
| **racer** | Mild (+2.0) | Keep, or make it +2 squares if you want it felt |
| **sturdybow** | Weak (−4.2), worth ~0.4 turns/game | Re-spec to pay in tempo, not distance: *"a storm never costs you your turn"* — it deletes rule 8's penalty for you, which is the part that actually hurts |
| **trawler** | Weak (−3.4); +8.8 coins in a game with 33 spare | Re-spec to tempo: *"you may fish **and** take another action"* |
| **gambler** | Weak (−4.4); +2.4 coins a game | Re-spec to information: *"a correct call lets you see one combatant's committed coins in the next battle"* |
| **trader** | Dead (−5.0); +0.24 coins a game | **Cannot be fixed in isolation.** Fix rule 11 first (let captains buy crates they don't need) so trading exists, then re-measure |

### If you want one sentence

The powers are currently a **25.6-point** spread that a first-come draft turns into a **27.5-point**
seat spread. Adopting the §3.1 economy fix and reversing the draft order cuts both roughly in half
before you retune a single power.

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

node scripts/wyatt_ruleset_sim.mjs 4000 --powers                     # rule 13, random distinct draw
node scripts/wyatt_ruleset_sim.mjs 4000 --powers --exclude=shooter   # clean read on the other seven
node scripts/wyatt_ruleset_sim.mjs 4000 --powers --bidmax=8          # powers under a fixed economy
node scripts/wyatt_ruleset_sim.mjs 3000 --draft=shooter,lockbox,hedger,racer   # seat-order draft
```

Every run ends with a wind probe using the same metric as the shipped-rules measurement, so the two
stay directly comparable.


---

## 9. The economy, fixed — and rule 11 corrected

Wyatt, on reading §3.2: *"I intended for docked captains to be able to buy any crate. They can
pretend they need it, they can hoard and monopolize others resources opportunistically."* Plus:
*"Feel free to lower the coin earning amount in the game; I was worried that there would be too few
coins to buy ingredients."*

**So §3.2 had it backwards.** Rule 11 as intended is not what killed trading — it is what creates it.

### Getting the model honest took two fixes to the bots, not the rules

Modelling "buy any crate" naively did almost nothing (0.20 hoard-buys a game), because my captains
only ever *sailed to* islands they needed, so they were never standing at a berth they didn't want.
Giving them the motive a human has — a rich captain will detour to buy out an island a rival is
short on — changed everything, and immediately broke the game:

```
with a denial motive, no recovery path:   62.7 rounds mean (median 19)   21.3% of games NEVER FINISHED
```

Four captains all denying each other, everyone locked out, nobody able to finish. That is not a
property of your rules — it was my bots having no way to *recover*. The rules say scarcity forces a
scramble; my captains had no way to scramble. Adding the three routes the rules already imply — hunt
down whoever holds what you can no longer buy, attack them on sight, and pay whatever it takes in a
trade — collapsed the stall to **0.6%**.

**Worth keeping as a design warning even so:** hoarding is only healthy while money is scarce enough
that hoarding costs you the race. With unlimited coins, a table of four determined monopolists can
genuinely deadlock this game. The economy fix below is what keeps that from happening.

### What hoarding is worth

| | Hoarding off | Hoarding on |
|---|---|---|
| Trades per game | 0.31 | **2.27** |
| Crates bought that the buyer didn't need | 0 | **4.4** |
| Rounds | 15.3 | 21.2 |
| Captains locked out | 92% | **98%** |

**Rule 11 as you intended it is what makes the trade layer exist.** Seven times the deals. Keep it.

### The coin sweep

You offered to lower earnings. The measurement says **don't touch fishing** — the problem was never
the faucet size, it was that the only sinks were bounded. Two changes fix it:

| Config | rounds | stall | end coins | can't afford | hoard | trades |
|---|---|---|---|---|---|---|
| As written | 20.4 | 0.6% | 22.1 | 6.8% | 6.2 | 1.90 |
| fisher 1 (halve the catch) | 19.4 | 0.1% | 14.5 | 14.5% | 4.6 | 1.76 |
| prices 4/6/8 | 19.6 | 0.4% | 13.2 | 32.5% | 2.9 | 1.34 |
| no treasure at all | 26.2 | 3.1% | 11.4 | 66.3% | 3.8 | 2.28 |
| **treasure 4→2 + whole-purse bids** | **21.2** | **0.4%** | **12.0** | **22.7%** | **4.4** | **2.56** |

### Recommended: change exactly two numbers

> **Rule 10 — treasure pays 2, not 4.**
> **Rule 9 — the secret commitment is any part of your purse, not 0–3.**

Leave rule 3 alone. Leave the crate ladder at 3/4/5. Leave the off-turn +1 exactly as it is.

```
                         as written      with the two changes
mean coins at game end        33.6   ->        12.0
coins minted / burned    224 / 108   ->   268 / 238
trades per game               0.12   ->        2.56
battles needing no flip      67.7%   ->       85.6%
attacker win rate            66.9%   ->       58.3%
seat spread (best-worst)   9.2 pts   ->     5.4 pts
```

Every one of those moves the right way, and two of them fix problems I had listed as separate work:
**the attacker advantage self-corrects** (66.9% → 58.3%, because a defender can now match a bid
instead of being capped at 3), and **the first-player advantage nearly vanishes** — seat 1 goes from
best to 21.6%, because going first now means being the first target with the smallest purse. You can
probably delete the staggered starting coins entirely and give everyone the same number.

Your worry about too few coins to buy ingredients: the model says the reverse, but the fix does put
real pressure back on. **22.7% of docks are ones you can't afford** under the recommendation — about
one in five, which is tension rather than frustration. Below ~10% money doesn't matter; above ~40%
(the no-treasure runs) the game starts stalling.

---

## 10. The Cast — replacing fishing with something worth doing

Your picks: **push-your-luck**, **everyone plays at once**, **still mostly coins**, and the
**off-turn +1 stays unconditional**.

### The engineering problem, and why your two picks solve it together

Push-your-luck costs flips, and flips are exactly what we spent rule 9 removing. Solved for optimal
play:

| Variant | mean take | flips per cast |
|---|---|---|
| One coin: heads +1, tails busts to 1 | 1.25 | 1.50 |
| Two coins: 2H +2, 1H +1, 2T busts | 2.39 | 5.37 |
| One coin: heads +2, tails busts to 1, capped | 1.75 | 1.50 |
| *rule 3 as written* | *2.00* | *0* |

Five flips a cast, forty casts a game, is a disaster. **But that dissolves the moment the whole
table casts at once** — because then the cost is the number of *press-rounds*, not the number of
flips. Four captains flipping together is one beat. Your two picks are not two features; they are
the feature and the thing that makes it affordable.

### The proposal

> ### 🎣 The Cast
> When a captain casts, **every captain casts.**
>
> 1. **All captains flip together.** **Heads** — take 1 coin into your haul, and you may press
>    again. **Tails** — your cast is over; you take 1 coin and nothing more.
> 2. **Stop whenever you like** and bank your haul. Everyone decides for themselves, out loud or
>    not, before each flip.
> 3. **The captain whose turn it is** casts from the best water: **+1** on their final haul.
>
> Everybody is doing something, on every transit turn, for about two beats.

The break-even is at a haul of 1, so pressing twice and banking is right — which means the interesting
decision is whether to go for a third, and it comes up constantly. That is the Ra shape: everybody
watching everybody else decide whether to be greedy.

### Modelled, dropped into the recommended economy

```
mean coins at game end     11.8       (target ~12 — it lands where flat fishing did)
trades per game             2.39
docks you can't afford     20.7%
casts per game             39.1
press-rounds per cast       1.93      <- this, not the flip count, is the table time
```

**It is economically a drop-in replacement.** Same money supply, same tension, same game length —
it just replaces a payout with a decision.

### The honest cost

39 casts × 1.93 press-rounds is about **75 simultaneous beats a game**, on top of ~27 battle flips.
The shipped game is ~75 *serial* flips. So this is not free: it is roughly the same amount of ritual,
redistributed from a place where nobody was deciding anything into a place where everybody is
deciding at once. I think that is a good trade, but it is a trade, and you should see it as one.

**If it feels like too much at the table, here is the one-beat version:** everyone secretly picks a
net, then one simultaneous flip each. **Shallow** — a sure 1. **Deep** — heads 3, tails nothing.
Same simultaneity, same greed decision, half the table time. It modelled at 17.7 end coins (a little
loose — drop the deep payout to 2 to match), 2.27 trades, 21.0 rounds.

### One deviation to flag

You asked to keep the off-turn bonus at exactly +1 each. Under the Cast, a spectator **averages
~1.25 and it varies** — sometimes 1, sometimes 3. That variance is unavoidable if everyone is
playing, and it is what makes it a mini-game rather than a payout. If the flat, dependable +1 matters
more to you than the simultaneity, say so and the Cast becomes caster-only with the spectators paid
as they are now — it just gets less interesting on the ~50% of turns that are somebody else's.


---

## 11. Trade as the main mode — and a correction

Wyatt: *"In a normal game currently there are many more deals than that, I think — but I could be
wrong."*

**You were right, and the number I gave was measuring the wrong thing.**

2.5 trades a game was my *bots' willingness to trade*, not the ruleset's capacity for it. Both my
model and the shipped engine's own `tradeCandidate()` only strike a deal under a narrow condition —
an exact swap of surpluses. A human table negotiates constantly; a bot that can only recognise one
shape of deal will report that trading barely happens no matter how good the rules are. Every trade
figure in §3.2 and §9 should be read as a floor set by the AI, not a ceiling set by the rules.

So I rebuilt the trade layer as an actual market, with valuations on both sides:

- **What a crate is worth to a buyer** = what getting it another way would cost — the island's ladder
  price plus the sailing it saves, or a lot more if it is off the board entirely and only trade or
  plunder can reach it.
- **What a seller gives up** = the crate, plus its denial value (how many rivals need it, and whether
  it is the last one).
- A deal exists whenever the buyer's value clears the seller's reservation; they settle in the middle.

```
                        narrow bot     real market
trades per game               2.5   ->      39.3
   of which swaps               —          21.6
             coin buys          —          10.7
             coin sales         —           7.0
mean price per sale             —      6.1 coins
```

**Trade is now the single most common interaction in the game**, at roughly one deal every other
turn. That is the game you described.

### Battles as the failure of negotiation

You wanted *"battles would only come when players were being stingy and unwilling to trade."* I
modelled that literally: a captain only reaches for the guns against someone who has actually
**refused** a deal for the crate they need.

```
battles as a share of actions:   26.6%  ->  13.6%
```

Halved, and every remaining one is now the consequence of somebody being stingy. This is a **bot
policy**, not a rule — but for the app it is the important design note: *the AI must try to buy
before it tries to plunder*, or the game will feel like a brawl no matter what the rules say.

### Flat fishing, and the decision you asked for

*"Fishing can simply get everyone 1, not the fisher 2. Either way, the decision becomes 'should I do
something that helps my opponents' or not — make sure your bot is tactically deciding this."*

Done. Under flat fishing the payout is identical for everyone, so it changes **nobody's relative
position** — it just costs you an action and hands three rivals a coin each. The bot now casts only
when it is genuinely short of what it is about to buy, and refuses when the coin would arm a rival
who is one crate and one coin from finishing.

```
casting as a share of actions:   45.6%  ->  20.1%
turns spent trading and sailing without acting:      35.6%
```

**That 35.6% is not dead air** — those turns still trade and still sail four squares. It reads as a
delivery run. And it is what turns fishing from a default into a decision, which is exactly what you
asked for. Your call, recorded: keep it.

### The merchant line loses, and that is fine

I built the strategy you described — sail to the nearest island, buy out its stock, sell it on — and
raced it against a plain racer:

```
merchant 20.9%   vs   racer 29.1%     (n=1800 each)
```

It loses **structurally**, not through bad tuning. A merchant converts tempo into coins; coins only
convert back into crates at 3–5 each; and the racer was already spending that same tempo buying
crates directly. The margin (6.1 a sale against a 3–5 cost) does not cover the detour.

Your call, recorded: **accept it as a support line rather than a win condition.** I think that is
right, and the numbers support it — with 21.6 swaps a game, *everybody* is already part merchant.
Commerce serves the race; it is not an alternative to it. Worth knowing where the lever is if you
ever change your mind: the only change that makes hoard-and-sell a genuine win condition is making
leftover resources score at the end, which would mean giving up "first home wins outright."

### Recommended configuration, all findings applied

| # | Change | From | To |
|---|---|---|---|
| 1 | Rule 10 — treasure | 4 | **2** |
| 2 | Rule 9 — the secret commitment | 0–3 | **any part of your purse** |
| 3 | Rule 3 — fishing | fisher 2 / others 1 | **everyone 1** (your revision) |
| 4 | Starting coins | staggered 3/4/5/6 | **5 each** |
| 5 | Trade bonus | — | **none** (your call) |
| 6 | *AI behaviour* | attack on sight | **try to buy before you plunder** |
| 7 | *AI behaviour* | fish as a fallback | **cast only when actually short** |

```
                              as written      recommended
rounds per game                     20.4  ->         18.3
games that never finish             0.6%  ->         0.4%
trades per game                     0.12  ->         39.3
battles as a share of actions      26.6%  ->        13.6%
battles needing no coin flip       67.7%  ->        83.9%
mean coins at game end              33.6  ->          5.3
seat spread (best minus worst)   9.2 pts  ->      3.4 pts
captains locked out                98.0%  ->        94.9%
```

**Item 4 is worth calling out.** The staggered starting coins exist to offset going first, and rule 2
(free sailing) weakened them — so much that in the tuned economy they *overcorrected* and going last
became best (seat 1 19.5%, seat 3 27.5%). Flattening to 5 each closes it to 23.4–26.8%, which is as
balanced as this game has ever measured. **Delete the stagger and delete a setup step.**

### What is a rule and what is an AI note

Worth separating, because two of the biggest improvements in that table are not rules at all:

- **Rules:** treasure 2, whole-purse bids, flat fishing, flat starting coins, no trade bonus.
- **AI behaviour:** value crates properly and try to buy before plundering; cast only when short.

The second list is what took trade from 2.5 deals a game to 39, and battles from 27% to 14%. A
tabletop group does that instinctively. **The app has to be taught it** — and if it isn't, the online
game will feel like a completely different, much more violent game than the one played at a table
with the same rulebook.


---

## 12. The Shared Cast — Wyatt's fishing mechanic, and it is the best one

> *"Fishing is something that may be called once per round whenever one player decides to fish — and
> everyone decides whether they want to get 1 coin, or flip to get 2, then 4, etc, and keep flipping
> until everyone backs out or tails hits, in which case players lose all of what they would have
> gained."* — Wyatt, 2026-08-03

This is better than both of my proposals, and it has a mathematical property worth naming.

### The doubling ladder is EV-neutral at every rung

At a pot of `2^n`, bailing takes `2^n`. Riding is worth `0.5 × 2^(n+1) + 0.5 × 0` = **exactly `2^n`.**

```
  at  1:  ride is worth  1.00   exactly even
  at  2:  ride is worth  2.00   exactly even
  at  4:  ride is worth  4.00   exactly even
  at  8:  ride is worth  8.00   exactly even
  at 16:  ride is worth 16.00   exactly even
```

**The arithmetic never tells you what to do. Only your position does.** A captain who needs 4 coins
to buy the crate they are docked beside rides to 4 and bails. A captain who needs 1 takes 1 and
walks. A captain three coins short of the last vanilla on the board rides past sense. There is no
solved line, no optimal-play table, and no way for the maths-inclined player at the table to be
"correct" at anyone else's expense.

Compare the alternatives — a gentler ladder (1,2,3,4,5) makes bailing correct from the second rung
on, and a triangular one (1,2,4,7,11) from the third. **Doubling is the only shape that keeps the
decision alive all the way up.** It is worth protecting.

### It is also the cheapest thing at the table

One shared coin, and the coin itself ends the sequence:

```
THE SHARED CAST: called 13.7 times a game, 1.52 shared flips each
```

That is about **21 flips for the entire fishing subsystem, per game** — against 75 for my
per-captain version and roughly 40 for flat fishing across a game's turns. Because it is called at
most once a round and everyone rides the same coin, the cost does not scale with player count at
all. **A six-player game costs exactly the same table time as a three-player one.**

**You do not need a cap.** I modelled one at 8; it changed nothing whatsoever — identical numbers to
four significant figures — because reaching a pot of 8 happens 6.2% of the time and reaching 16
happens 3.1%. The coin caps it for you.

### The drama it produces

```
hauls of 8 or more:                  0.65 per game
captains wiped out by a tails:      20.55 per game  (~1.5 per call)
```

So about two games in three contain one genuinely memorable score, and every single call takes
somebody down. That is the right ratio — the big haul stays special, and the wipeout is common
enough to be feared.

### The volunteer's dilemma you built in without saying so

"Once per round, whenever one player decides to fish" means the caller **spends their action** and
everyone else rides **for free**, for the same expected 1 coin. Calling is strictly worse than being
called for. So the real question at the table is *"who is going to break first and call it?"* — and
the answer is whoever is most desperate, which is public information the moment they do it.

That is a genuine second decision layered on the first, and it costs zero rules text. Modelled, it
gets called in about three rounds out of four.

### Measured, in the tuned economy

| | as written | with the Shared Cast |
|---|---|---|
| Rounds per game | 20.4 | **18.3** |
| Games that never finish | 0.6% | **0.4%** |
| Trades per game | 0.12 | **39.5** |
| Battles, share of actions | 26.6% | **7.8%** |
| Battles needing no coin flip | 67.7% | **~90%** |
| Mean coins at game end | 33.6 | **4.5** |
| Docks you can't afford | 6.8% | **27.7%** |
| Seat spread, best minus worst | 9.2 pts | **1.8 pts** |

**That seat spread is the flattest this game has ever measured** — 25.9 / 24.1 / 24.3 / 25.2 across
1,500 games. Turn order has effectively stopped mattering.

### One knock-on: treasure has to come back up

The Shared Cast is a **much smaller faucet** than per-turn fishing — it fires once a round instead of
on half of all turns, and only when somebody is genuinely short. At treasure 2 the economy tips
deflationary (89.9 minted against 94.7 burned, and 38% of docks unaffordable). Sweep:

| treasure | end coins | can't afford | seat spread |
|---|---|---|---|
| 2 | 3.9 | 38.1% | 2.9 pts |
| **3** | **4.5** | **27.7%** | **1.8 pts** |
| 4 | 5.1 | 20.8% | 6.3 pts |

**Treasure pays 3.** This supersedes §9's recommendation of 2, which was tuned against per-turn
fishing.

---

## The recommended ruleset, complete

Everything measured across §9–§12, as changes to your 14:

| Rule | Change |
|---|---|
| 3 | **Replaced by the Shared Cast** — called once per round, one shared coin, pot 1/2/4/8/16, bail or ride, tails wipes everyone still in |
| 9 | The secret commitment is **any part of your purse**, not 0–3 |
| 10 | Treasure pays **3**, not 4 |
| 11 | **Unchanged — buy any crate**, exactly as you intended it |
| 13 | Shooter needs no fix once rule 9 changes; re-spec sturdy bow, trawler, gambler to pay in tempo or information rather than coins; draft in **reverse** seat order |
| setup | Starting coins **flat 5 each** — delete the stagger, it overcorrects once sailing is free |
| — | **No trade bonus** |
| 1, 2, 4, 5, 6, 7, 8, 12, 14 | Unchanged. They do what you wanted. |

And two things that are **not rules but must be built into the app**, because they are worth more
than most of the rules above:

1. **The AI must value crates properly and try to buy before it plunders.** This alone took trade
   from 2.5 deals a game to 39, and battles from 27% of actions to 8%.
2. **The AI must only cast when it is genuinely short**, and never when the coin would arm a rival
   one crate from finishing.

A table of humans does both instinctively. If the app doesn't, the online game will feel like a far
more violent game than the same rulebook plays at a table.
