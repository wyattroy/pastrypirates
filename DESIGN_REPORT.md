# Cocoa Pirates — Simulation Findings & Redesign

I built a full simulator of your rules (4 players, 4-of-5 ingredient recipes, 11×11 sea, wind/storm, sail, dock, battle, fish, run-aground, bakeoff endgame) and ran ~40,000 games across strategy matchups and rule variants. All battle probabilities were verified against exact analytic math.

## Part 1: What wins under the current rules

Four bot strategies played each other: **Rusher** (beeline to ports, never fights), **Pirate** (attacks anyone carrying a needed ingredient or fat coin purse), **Trader** (trades when possible, fights only for needed ingredients), **Balanced** (fights only for needed ingredients).

| Strategy | Win rate (current rules) |
|---|---|
| Pirate | **28.5%** |
| Trader | 26.6% |
| Balanced | 26.0% |
| Rusher | **18.9%** |

**The best strategy is to be aggressive.** This surprised me at first — battles are a pure 50/50 coin race with zero attacker edge — but the *stakes* favor the attacker: when you steal an ingredient you need, you gain one AND they lose one (a two-ingredient swing), while your downside is usually just 5 coins. Pacifist port-rushing is the worst strategy at every starting-coin level and grid size tested.

### Diagnoses

1. **Battles are pure luck.** Attacker wins exactly 50.0% (verified analytically). Once two aggressive players meet, the outcome is a coin-flipping contest with no decisions. In 55% of games, the winner was also the table's luckiest flipper.
2. **Attacking is free, so it's spammed.** With no cost to engage, sims averaged **12–27 battles per game**. At the table this means constant re-flipping and a "bash the leader" slog.
3. **Trade essentially never happens** (~0.25 trades/game, even among dedicated trader bots). This is structural, not behavioral: players only ever collect ingredients they need, so *nobody ever holds anything anyone else can buy*. There is no surplus, therefore no market. No trade incentive tweak fixes this without changing what players can carry.
4. **A rules hole can make games unwinnable.** If "the first time you dock" means you only ever get one flip per port, a tails means you can never get that ingredient except by plunder — and if everyone tails the same port, nobody can finish. (The sim assumes you may leave and re-dock for a new flip.)
5. **Turn-order effects are real.** In peaceful games the first player wins ~30% (vs 25% fair); in fighty games the *last* seat is favored — they get to act right after opponents dock, robbing fresh cargo.

## Part 2: The coin-flip stacking toolbox

You asked specifically how stacking tosses changes the math. Exact probabilities for a first-to-3 battle, all verified:

| Stacking rule | Attacker wins | Verdict |
|---|---|---|
| Current (H-H cancels, T-T nothing) | 50.0% | Pure luck, no attacker edge |
| Both-heads round scores for **attacker** | 79.0% | Way too strong — pirate bots hit 44% table win rate; rushing collapses to 11% |
| Attacker starts up 1–0 | 68.8% | Still too strong |
| Attacker needs 3, defender needs 4 | 65.6% | Too strong |
| **Attacker may reflip ONE tails per battle** | **58.8%** | The sweet spot — attacking favored but never safe |
| Attacker flips best-of-2 every round | 89.7% | Degenerate |
| Either side may pay 1 coin to reflip (once/round) | ~46% for attacker | Interesting twist: favors the *richer* ship; equalized all strategies to 24–26% but slows battles |

The one-free-reflip rule is my top pick: it's a single dramatic moment ("the Broadside"), it needs no components, and 59% is right in the zone where attacking is a good bet but a lost raid still stings.

## Part 3: Recommended ruleset — "Cocoa Pirates, Second Edition"

Simulated as a package (2,000 games): strategy win rates compress to **21–30% with all four styles viable**, battles drop from 12 to **6 per game** (each one mattering more), attacker wins 59%, trade roughly doubles, and no game stalls out.

**1. Powder Kegs — attacking costs 2 coins.** Declare a raid by paying 2 coins to the bank (you're buying powder). *This was the single most important fix in every test.* Without it, pirate bots win 44% and pacifists 7.5%; with it, aggression is a real investment decision and battle spam disappears.

**2. The Broadside — attacker's edge.** Once per battle, the attacker may reflip one of their tails ("fire the broadside!"). Attacker now wins 58.8% of battles. Combined with powder cost: raiding is favored, but two lost raids in a row genuinely hurt.

**3. Ingredient Crates — scarcity.** Each island stocks only **3 crates** of its ingredient (for 4 players). Since ~3 players need each ingredient, someone will get locked out of a port they need — and must trade or plunder to finish. Scarcity is what finally gives trade and piracy a *reason to exist* late-game.

**4. The Ship's Hold — cargo you don't need.** A heads at any port gets you that island's crate **even if it's not on your recipe map**. Now players can carry surplus — and surplus is what makes a market. This is the structural fix for the no-trade problem.

**5. Parley — trade from anywhere.** On your turn you may hail any player and negotiate (ingredients, coins, promises — anything). Adjacency stays required for *battle*, not for talk. Face-to-face negotiation is the most fun mechanic you have; don't gate it behind rare board positions.

**6. Harbor Tax Refund — trade sweetener.** When any trade completes, *both* players take 1 coin from the bank. Small, but it means trading is never a zero-sum loss of tempo.

**7. Buy on Tails — no more stall-outs.** When you dock and flip tails, you may either take 3 coins (as now) **or pay 3 coins to buy the crate anyway**. Closes the unwinnable-game hole and makes coins matter at ports. (Keep re-docking legal: leave adjacency and return for a new flip.)

**8. Pass the Captain's Wheel.** First player rotates each round. Cheap fix for the measured turn-order bias.

### Optional "Raider" module (for groups who want more piracy)
If the attacker *loses* a battle, they pay only **2 coins** (their escape bribe) instead of the ingredient-or-5. This makes raiding clearly positive-expected-value even at 50/50 — pirates jump to 34% win rate. It answers your "attackers win more than defenders lose" idea exactly, but it does skew the meta toward aggression, so I'd make it a variant, not core.

### Why this hits your goals
- **Less luck:** fewer, costlier battles mean fewer raw flips deciding the game; winner-was-luckiest-flipper drops, and the reflip choice (which tails to reroll, whether to raid at all, whether to buy on tails) adds decisions around every flip without replacing your bullion.
- **More trade:** hold + scarcity + parley + refund attacks the root cause (no surplus) rather than the symptom. Bots doubled their trade rate; humans who actually haggle will do far better.
- **Attacker-favored but honest:** 59% with a 2-coin ante.
- **Replayability:** island placement already varies the map; scarcity makes *which ingredient runs out* different every game, and the optional Raider module gives a second meta.

### Suggested playtest order
Add rules 1+2 first (one session) — they're the core rebalance. Then add 3+4+5 together, since they only work as a set. 6–8 are polish. The sim script (`cocoa_pirates_sim.py`) has every rule as a toggle, so if you want different numbers tested — 3 players, 5 crates, 1-coin powder — any combination runs in seconds.

---

## Addendum: follow-up questions (round 2, ~15,000 more games)

### Paid broadside — 1 coin to reflip a tails, once per battle

Tested head-to-head against the free version (both on top of the 2-coin powder cost):

| | Free reflip | Paid reflip (1 coin) |
|---|---|---|
| Attacker battle win rate | 59.0% | 52.7% |
| Strategy win-rate spread | 20.7–30.8% | **23.4–26.8%** |

The paid version produced the **tightest strategy balance of anything tested in the whole project** — all four styles within ~3 points of each other. The cost is that the attacker's edge mostly evaporates (52.7%), because attackers have just spent 2 on powder and are often too broke to fire. So it's a dial: **free reflip if you want raiding clearly favored; paid reflip if you want maximum balance** and a nice "do I spend my last coin?" agony. A middle setting worth a playtest: powder costs 1, reflip costs 1 (total 2 to attack with full firepower).

### Insolvency — what if the loser can't pay?

This matters: in **~19–23% of battles** the loser has no ingredient and fewer than 5 coins. Recommended ruling:

- **You may always attack if you can pay the powder.** Don't gate attacking on ability to cover the losing fee — the powder is the attacker's stake, and it's always at risk.
- **Spoils, in order:** loser hands over one crate (they choose coins-or-crate; if crate, winner picks which). No crates → 5 coins. Fewer than 5 coins → *everything they have*, and that settles it (no debt).
- Ingredients as payment: yes — that's the base rule, and it's what makes plunder scary. I also tested a "coins-first" protection (loser may always pay 5 coins to protect crates if they have them): balance impact was negligible (pirate 26.1% → 25.3%), so choose by feel. I'd let the loser choose — deciding "my dairy or my savings?" is a fun/painful moment.
- The "nothing to lose" kamikaze attacker is handled automatically: they still forfeited 2 powder, and if they lose they hand over their last coins.

### Crate scarcity — players − 1 confirmed, all counts

| Setup | Battles/game | Games that stall | Notes |
|---|---|---|---|
| 2p, 1 crate (N−1) | 6.5 | ~0% | Forced-conflict duel; games run longer (27 rds) |
| 2p, 2 crates | 2.0 | ~0% | Nearly peaceful — borderline solitaire |
| 3p, 2 crates (N−1) | 6.0 | 0% | Works great |
| 4p, 3 crates (N−1) | 6.0 | 0% | Works great |
| 4p, 4 crates | 5.4 | 0% | Scarcity pressure fades |

**Players − 1 is the right formula at every count, including 2.** With 2 players the recipes overlap on at least 3 ingredients, so a single crate per island guarantees the duel you want — otherwise 2-player games are two people politely ignoring each other (battles drop to 2/game). Fair warning: 2-player is inherently the flippiest format (the winner was the luckier flipper in ~75–87% of 2p games vs ~55% at 4p) because there's no third party to punish the leader. If you want a gentler 2p intro mode, use 2 crates; for the real thing, 1.

One honest 2p caveat: trade nearly vanishes head-to-head (~0.06 trades/game) — with only one opponent, every trade helps your rival exactly as much as you. That's not fixable with incentives; it's zero-sum logic. 2p Cocoa Pirates is a fighting game, and that's fine.

---

## Addendum 2: board size, ingredient count, recipe size (~10,000 more games)

All runs use the recommended ruleset, 4 players.

### Board size is a pacing dial, nothing more

| Grid | Avg rounds | Battles | Trades | Luck metric |
|---|---|---|---|---|
| 9×9 | 16.4 | 5.7 | 0.46 | 55.2% |
| 11×11 (≈ your prototype) | 19.4 | 5.8 | 0.40 | 53.4% |
| 13×13 | 22.0 | 5.9 | 0.45 | 51.8% |
| 15×15 | 25.4 | 6.1 | 0.43 | 53.4% |

Balance, battle rate, and trade rate barely move — each +2 to the grid just adds ~3 rounds. Bigger boards dilute flip luck slightly (more sailing decisions per flip). **Verdict: your current size is right for a ~20-round family game. Don't go past 13×13; 15×15 is the same game, slower.**

### More ingredients: yes, as a variant — it's the anti-luck lever

With recipe size held at 4:

| Islands | Battles | Trades | Luck metric |
|---|---|---|---|
| 5 | 5.8 | 0.40 | 53.4% |
| 6 | 4.9 | 0.45 | **49.7%** |
| 7 | 4.3 | 0.53 | 51.3% |

More islands → recipes overlap less → fewer forced collisions, more trades, more varied routes game-to-game, less luck. It also softens scarcity (16 recipe slots spread over more islands), so the game gets *gentler* overall. Great for replayability; slightly fewer fireworks.

### Recipe size: 4 is right for the core game

| Recipe | Avg rounds | Battles | Notes |
|---|---|---|---|
| 3 of 5 | 14.4 | 3.5 | Too short; flippiest endgame (bakeoff rate doubles), most bankrupt battles |
| 4 of 5 | 19.4 | 5.8 | The balanced middle |
| 5 of 5 | 24.2 | 9.3 | Everyone's list is identical → constant war, no route variety |

Recipe 3 makes ingredients too easy to complete before interaction develops; recipe 5-of-5 removes what makes recipe maps interesting (asymmetric needs) and doubles battle count.

### The "Epic Voyage" combo worth printing

**13×13 board, 7 islands, 5-of-7 recipes** hit the best numbers of the entire project: highest trade rate (0.68/game), lowest luck metric (49.4% — winner was NOT the luckiest flipper more often than they were), solid balance (21–29%), ~27 rounds. Two extra islands (vanilla? cinnamon?) and bigger recipe maps would make a terrific big-game variant while the 5-island 11×11 game stays the intro version — and that's replayability by itself.

---

## Addendum 3: island geometry, docks, and the coin economy (~6,000 more games)

### Big islands (2×3) on a 15×15 board: yes, it works

Mechanics are unchanged — islands just become impassable rectangles. Balance is essentially identical to the standard game. Two knock-on effects: the game lengthens to ~28 rounds (that's mostly the bigger board — more water to cross — not the islands), and wind-vs-island drama rises ~40% (bigger targets to get blown into: ~13 events/game vs ~9.5). If you want the big-island look but the original ~20-round pacing, 13×13 with 2×2 islands keeps nearly the same open-water ratio as 11×11 with 1×1. Verdict: purely an aesthetics/pacing choice — go for it.

### Single dock per island: the most skill-forward variant tested

Modeled as: one berth cell per island; only the ship in the berth may dock; you take an occupied berth by winning a battle (your position-swap rule IS the boarding action — the winner ends up in the berth). Results on 11×11: game length +75% (19.7 → 34.6 rounds), battles +25% (berth fights), trades up, and the luck metric drops to **40–46% — the lowest of the entire project**. Positioning, timing, and blockading dominate coin flips. Costs: pacifist strategies suffer (rushers can't fight for a berth and wait in line), and combining single docks with the 15×15 big-island board stalls 8% of games past 150 rounds — don't stack all three; if you want single docks on a big board, shorten recipes to 3. Verdict: excellent "advanced rules" module on the standard board.

### The run-aground rule: yes, it's in — and it's well designed

The wind/storm-into-island rule (pay 1 coin to dodge, or flip: heads = drop anchor, tails = lose half your coins) has been in every simulation from the start, and it fires more than you might expect: **~9.5 events per 4-player game** (~3.8 pay-dodges, ~2.8 anchors, ~2.9 groundings) — roughly 2–3 moments per player per game. It also self-balances beautifully: bots with 3+ coins always pay to dodge (expected flip loss exceeds 1 coin when you're rich), while broke captains gamble. Rich captains buy safety, poor captains pray — that's good pirate fiction. With 2×3 islands it fires ~13×/game; with single docks ~26×/game (part of why that variant drags).

### The coin economy is tight — fishing is nearly half of all turns

Burn rate: 1 coin/turn to sail, 2 for powder, 3 for buy-on-tails. Income: 3-coin tails-docks, 50/50 fishing, spoils. Result: bots fish ~10 times per player per game — about half of all turns end with a cast — and **players start 22% of turns flat broke** (can't sail; drift with the wind). Some squeeze is good tension, but a fifth of turns without agency is a lot for kids.

Best fix found — the **Sardine rule**: tails on a fishing flip pays 1 coin instead of nothing ("just a sardine"). Broke-turns drop from 22% → 15%, games run ~1 round faster, and every balance number stays put. It also means a fishing flip always *does something*, which feels better at the table. (Also tested: starting with 5 coins — helps trades a bit but broke-rate returns to ~22% because it's structural, not a starting-cash problem.)

All four of these are now toggles in the Lab GUI: island size (1×1 / 2×2 / 2×3), single dock, and sardines, alongside everything else.

---

## Addendum 4: is cornering the market overpowered? (~5,000 games)

Prompted by a playtest observation: a human could buy out a scarce island's crates and extort the players who need them. We added a **monopolist** bot that picks the ingredient most demanded by opponents (preferring one on its own recipe), hoards every crate including duplicates, and sells at a gouged price (5🌕 vs the standard 4).

| Matchup | Monopolist win rate | Trades/game |
|---|---|---|
| Standard, vs pirate/trader/balanced | 21.2% | **0.70** (vs ~0.50 without) |
| Standard, vs rusher/pirate/balanced | 17.9% | 0.50 |
| Wyatt Mode (13×13, 7 isl, recipe 5, single docks) | 22.8% | **0.91** — highest recorded |

**Verdict: viable, not dominant — and great for the game.** Cornering costs real tempo (extra docking trips for crates you don't need) and paints a target on your hull: every hoarded crate is one battle away from being plundered, so piracy acts as the antitrust mechanism. Meanwhile the monopolist's presence raises everyone's trade rate ~40% because they create the market. No rules change needed; the incentives already balance it. If human players ever prove better at it than the bot (likely), the first lever to pull is powder cost — cheaper attacks tax hoards harder.

---
*Method note: bots are simple heuristic players, so treat exact percentages as directional; the battle probabilities in Part 2, however, are mathematically exact. Trade rates are conservative — rigid bots negotiate worse than humans.*
