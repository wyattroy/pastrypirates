# Pastry Pirates — ruleset design review

**2026-08-03.** Commissioned brief: make the game engaging when it is not your turn, stop battles
dragging, make the wind a felt feature, make seafaring and exploration fun, make the pastry world
deeply felt — while **cutting** rules, and keeping everything executable at a physical table.

Four scoping answers from Wyatt shape this document:

1. **Two tiers, clearly separated** — a v1.4 tier you could ship next milestone, and a v2.0 tier that
   names the structural moves.
2. **The shipped engine is canon.** `RULES.md` and `Rules_boardgame.md` have drifted; that is logged
   in §2 as a finding, not treated as the design.
3. **Pastry should become mechanical**, not just copy and art.
4. **Battles fail two ways: too many flips for the stakes, and no decisions inside them.**

---

## 1. How this was measured

Nothing below is an impression. Three instruments:

| Instrument | What it ran | Sample |
|---|---|---|
| `scripts/real_game_test.js` | the real `Game` class, real bots, full games | 1,500 games, seed base 12345 |
| A fresh action-mix harness over `src/engine/index.js` | same engine, event-stream tally | 1,200 games, seeds 900000+ |
| Playwright against a live `index.html` on a clean port | solo 4-captain game, driven turn by turn | 6 rounds, wall-clock stamped |

Every browser probe and HTTP server started for this was killed in the same session.

### The five numbers that matter

| Measurement | Value |
|---|---|
| Mean game length | **19.6 rounds**, ~79.8 player-turns |
| Mean round, wall clock (solo, 4 captains) | **57.7s** (range 46–80s) |
| Your own turn, wall clock | **16.9s** (range 13.2–25.6s) |
| **Share of the game you are a spectator** | **~77%** |
| Mean battle | **3.79 flip-rounds / 7.58 coin flips** |

A solo game is therefore about **19 minutes, of which you act for roughly four.**

### The single most important number in this document

The action mix, across 95,763 real player-turns:

```
Fish     57.0%   ← flip a coin, add 1 or 2 to your purse. No position, no target, no information.
Dock     32.1%
Battle    7.6%   (6.5% fought + 1.1% fled)
Trade     3.3%
```

**The most common thing anybody does in Pastry Pirates is the only action with no decision in it.**
Everything in §3 follows from that line.

> *Caveat, stated plainly:* this is bot behaviour, and `fish` is the fallback branch in
> `chooseAction()` — so 57% partly means "the bot found nothing better to do." That is not a
> weakness of the finding, it is the finding: for 57% of turns the engine's own evaluation of the
> board came up empty. And in solo play — the mode most people will meet — this *is* the experience,
> because those bots are three quarters of the table.

---

## 2. First, a correctness finding: the rulebooks describe a game that no longer exists

You asked me to treat the engine as canon. Doing that surfaced ten divergences, and they are not
cosmetic — **the battle chapter of both rulebooks is wrong end to end.**

| | `RULES.md` / `Rules_boardgame.md` say | `src/engine/index.js` does |
|---|---|---|
| Battle target | First to **3** points | First to **2** (`need=2`, line 523) |
| Attacker's broadside | Pay 1 to reflip a tails, once per battle | **Removed** (BATL-01) |
| Both heads | "Both heads cancel" | **The downwind fighter scores.** Crosswind cancels |
| After the battle | "the two ships **swap places**" | **Nobody moves** (BATL-03) |
| Post-battle free dock | Yes, if the swap lands you in a fresh berth | Gone with the swap |
| Defender flee | *Not mentioned anywhere* | Pay 1 on a double-tails while behind, and run |
| The Lookout's Call | *Not mentioned anywhere* | Mandatory free call + optional coin backing, every spectator, every battle |
| Spoils | "the **loser chooses**" coins or crate | Winner takes a crate they need; the loser never chooses |
| Home port | **Barbados** | **Isle of Tortuga** |
| Storm chance | "roughly 3 in 20" (15%) | `storm: 0.125` — 1 in 8, capped at 2 consecutive |

The both-heads rule is the serious one. It is not a footnote — it is **the wind's single largest
mechanical effect in the entire game**, and it appears in neither rulebook:

```
Attacker downwind    attacker wins 71.5%
Crosswind            attacker wins 44.7%
Defender downwind    attacker wins 23.9%
```

A tabletop group playing from `Rules_boardgame.md` is playing a materially different, and much
flatter, game. **Fix this before any design work lands**, or every recommendation below gets written
into a document that already disagrees with the code. It is also worth noticing *why* it drifted:
the rules live in three places (`RULES.md`, `Rules_boardgame.md`, the in-app How-to-play modal) and
the engine is a fourth. That is four copies of one truth — the exact pattern the project's own
"point, don't restate" convention exists to prevent.

---

## 3. Which mechanics are exciting, and which are not

Ranked by how much decision-per-rule each one delivers.

### The good bones — protect these

**🌀 The trade winds (the rim current).** The best mechanic in the game and it is not close. Four
clockwise arcs; enter any cell of one and you are swept, free, to its far end. It is spatial, it is
readable, it rewards planning two moves ahead, it produces genuine "did you see that" moments, and
it costs about two sentences of rules. It is also the only thing on the board that makes the *shape*
of the sea matter.

Its problem is not design, it is **visibility** — the project's own agent playbook records missing it
for an entire game and calling it "the thing I missed, and it is big." If a dedicated player misses
your best mechanic, that is a presentation bug, not a player error.

**🗺️ Secret recipe, public cargo.** Exactly right, and the cleanest idea in the box. Hidden goals
plus open holdings is the classic information structure — you can *infer* rivals' recipes from what
they hoard, and they can bluff by hoarding decoys. This is the one place the game already has the
"vast strategic decision space" you are after. It is under-exploited: nothing currently rewards a
good read, and nothing punishes a bad one.

**📦 Scarcity: crates = players − 1.** **95.9% of games end with at least one captain locked out of
an ingredient they still need**, with only 4.7 of 21 crates left on the board. That is not a
balance problem, that is the engine working perfectly. It guarantees a late game where somebody
*must* deal or plunder.

The disappointment is what happens next: **99.7% of games contain a battle, but trade is only 3.3%
of all actions.** The scarcity you built to force negotiation is being resolved by violence, because
trading costs you your whole action and violence at least also moves the board. See §4.4.

**🔭 The Lookout's Call.** Genuinely good design, and the fact that it is already shipped is the best
news in this review. Mandatory, free, +1 for a correct call, with an optional coin-backed
double-or-nothing on top. That is a textbook off-turn engagement device — it converts a spectator
into a forecaster, and the free tier means nobody is punished for being poor.

It has exactly one thing wrong with it: **it only fires during battles, so it fires about 0.3 times
per round.** For roughly seven of every eight opponent turns you watch, you have nothing to do. §4.4
is mostly "run this mechanic everywhere."

### The ones earning their rules

**Wind as a price on movement.** The *idea* is excellent and thematically perfect. The
*implementation* has quietly neutralised it — §4.2.

**Docking as the crate faucet.** 46.7% heads→crate, 28.8% tails→coins, 17.2% bought on tails, 7.3%
island empty. It works. But it is a slot machine (§4.3), and "one flip per visit, leave and return
to flip again" is bookkeeping that exists only to service the slot machine.

### The ones not paying for themselves

**🎣 Fishing — 57% of all actions and 0% of the decisions.** Covered in §4.1. This is the headline.

**⚔️ Battles — 7.6% of actions, and negative expected value for the attacker.** You pay 2 coins of
powder to enter a fight you win **42.5%** of the time (defender 43.0%, flee 14.5%) for a payout of
one crate or 5 coins. Then it takes 7.58 coin flips and ~25–30 seconds of animation to find out. The
theme's headline verb is a rounding error in the action mix, and the reason is arithmetic, not
squeamishness. Covered in §4.3.

**⛈️ Storms.** A second, entirely separate wind system — force-push 2 squares, re-spin, push 2 more,
plus a moored-safety condition, plus a three-way aground penalty ladder, plus a "never onto an
occupied berth" exception, plus a "only charges you once per turn" exception. That is a lot of
rulebook for something that fires in 12.5% of rounds and whose main output is losing half your
coins. It is also the source of the Safari performance bug. See the cut list, §6.

**👑 The bakeoff.** An entire extra subsystem — sequential challenge matches, first to 5, a reigning
champion — to resolve a tie that happens rarely. It is the single best rules-per-play ratio to cut.

---

## 4. The six problems, and what to do about them

Each problem gets **Tier 1** (v1.4-shippable, small, low-risk) and **Tier 2** (v2.0, structural).

---

### 4.1 — Half the game is spent buying permission to play the game

**The finding.** Sailing costs 1 coin. Fishing yields 1.5 coins on average (heads 2, tails 1). You
cannot sail at zero coins. Therefore over any two turns you can afford roughly one sail and must
spend the other fishing. **The engine's own numbers confirm it exactly: fish 57.0%.**

You have built a movement tax, and then built a job to pay the tax, and the job is now the game's
most common activity. Players spend more turns funding motion than moving.

**What other designers would say.** This is the clearest Knizia note in the document. His whole
practice is finding the general principle that lets a rule be deleted — and a rule whose only
purpose is to fund another rule is the definition of a part the machine does not need. Rosenberg's
worker-placement games never charge you for permission to act: the *action itself* is the scarce
thing, which is why an Agricola turn is always interesting. Here, scarcity has been put in the wrong
place — on movement, which every player needs every turn, rather than on choices, where scarcity
creates tension.

**Tier 1 — make sailing free.**

Delete the 1-coin sail cost. Coins stop being fuel and become purely a *choice* currency: buying
crates, powder, storm dodges, side-bet backing. Fishing survives as a real option — "I am out of
position and building a war chest" — rather than an obligation.

- Predicted effect: fishing collapses from ~57% toward 15–20%; docking roughly doubles; the game
  gets denser and shorter without a single round being cut.
- The risk, stated: coins become plentiful, so buy-on-tails becomes automatic and the dock flip
  stops mattering. **Counter it in the same change:** raise the crate purchase to 4 coins, and let
  fishing and dock-tails be the *only* income. Verify with the existing
  `scripts/economy_guard_test.js` before and after.

**Tier 2 — replace fishing with a decision.**

"Fish" becomes **Cast the nets**: draw 2 from a small Sea deck, keep 1, discard the other face-up.
Card types: a coin cache · a barrel of a named ingredient · a rumour (peek at one rival's recipe
line, or one island's face-down stock) · a favour (your next trade needs no action) · a squall (bad,
and it hits *you*).

This is one component and one sentence, and it fixes four things at once: the most common action
gains a choice; the discard is public information for everyone at the table; the ingredient barrels
feed §4.6; and the rumours feed §4.5. Nothing else in this document buys as much per rule added.

---

### 4.2 — The wind is arithmetic, not weather

**The finding.** I measured what the wind actually does to where you can go, by running
`reachableFrom()` from 140 real board positions under all four winds:

```
Mean overlap (Jaccard) between the reachable sets under two different winds:   62.2%
Mean number of reachable cells:   N=11.6   S=11.7   E=12.0   W=11.3
```

Read that second line again. **The wind never changes how much you can do — only which 38% of your
options exist.** Every direction gives you about twelve squares. A player experiences "some yellow
squares appeared" and takes the cheapest route to the island they were already going to. The wind
prices your journey; it never changes your destination. A mechanic that cannot change your
destination is not a mechanic, it is a tax rate.

Meanwhile the wind's one genuinely decisive effect — the both-heads battle tiebreak, worth a swing
from **23.9% to 71.5%** attacker win rate — lives inside the action players take 7.6% of the time,
and is documented nowhere.

**So the wind's strongest effect is in the rarest action, and its weakest effect is in the one you
take every single turn.** That is the whole diagnosis.

There is a second cost: `SAIL_BUDGET=9`, `windStepCost` of 2/3/4, and the `SAIL_BUDGET_LEEWARD=7`
island-shadow rule together are the most rules-text in the game and are pure arithmetic homework at
a physical table. Nobody wants to do a knapsack problem to move a boat.

**Tier 1 — widen the spread until the wind picks your destination, and delete the budget.**

Replace the 9-point budget, the 2/3/4 costs and the leeward rule with three numbers:

> **Downwind 4 squares. Across 2. Upwind 1.**

- Zero arithmetic. One glance at the wheel tells you how far you can go each way.
- The ratio goes from 2:1 to **4:1**, which is enough that the wind genuinely decides *which island
  you visit this round*. The reachable-set overlap between two winds should fall well below 62%
  (worth re-measuring with the harness in this repo before shipping).
- It deletes the single largest block of rules text in the game.
- It is what Merchants & Marauders does, and it is why players there talk about the wind.

Then **make it visible.** The wind is currently a compass dial in the corner. Put it on the water:
arrows or streaks on every ocean square, or tint the whole sea. It should be impossible to plan a
move without seeing it.

**Tier 2 — the wind becomes a clock instead of a die.**

Stop re-rolling the direction each round. **Turn the wheel one step (45° or 90°) every round**, in a
fixed rotation, publicly.

This is the highest-value structural idea in this document after §4.6, and it costs *negative* rules
— you delete a random roll:

- The wind becomes **predictable one round ahead**, so you can plan two turns out. That is real
  strategy where there was none: racing to be in position *before* the wind swings to favour you.
- It gives everyone something to watch while it is not their turn — the wheel visibly creeping
  toward your island is a story, and it is happening during other people's turns.
- It converts output randomness into a public, readable schedule. In the input/output framing
  popularised by Richard Garfield, randomness that arrives *before* your decision makes you feel
  clever; randomness that arrives *after* it makes you feel cheated. Right now the wind is rolled
  before your turn (good) but re-rolled every round (so it cannot be planned against). A rotating
  wheel keeps the good half and deletes the bad half.
- On tabletop it is a physical dial you click one notch per round. Perfect.
- It also **absorbs storms entirely** — see the cut list.

Knizia's Ra is the reference: the tension comes from a *known* structure (the epoch will end, the
tiles will run out) and your decision about when to commit inside it. A wind that rotates on a
schedule is that same shape.

---

### 4.3 — Battles: too many flips, and nothing to decide

You identified both failures; the data agrees with both.

**Too many flips for the stakes.** 3.79 flip-rounds, 7.58 flips, ~4.2 seconds of forced animation
per round (spin 650ms + suspense 900ms + hand-off 540ms + hold ~1500ms, from `stepDelay()=3000`), on
top of an opening flash, a per-round result flash and a side-bet round for every spectator. Call it
**25–30 seconds** in solo — and more with four humans, since every spectator answers up to two
prompts. The payout: one crate, or 5 coins.

**No decisions inside it.** Once you have declared, there is nothing left to play. `asyncBattle` is
a loop of `FLIP!` buttons. The attacker's broadside reflip — the one in-battle decision — was
deleted by BATL-01. The only surviving choice belongs to the *defender*, is available only on a
double-tails while behind, and costs 1 coin to run away.

**And the economics are upside-down.** 2 coins of powder buys a fight you win 42.5% of the time.
That is why battles are 7.6% of the action mix in a game about pirates.

**What other designers would say.** Cole Wehrle's Root resolves a battle in one dice roll and about
three seconds; all the game is in *where and when you commit*, none of it in what happens after.
That is the same principle as Knizia's: if the resolution must be random, **put the decision before
the randomness and let the randomness resolve exactly once.** Seven and a half flips of pure output
randomness is the worst decisions-to-luck ratio available.

**Tier 1 — give the defender a real choice, and let a battle sometimes take zero seconds.**

Attacker declares. **Before any flip, the defender chooses:**

- **Stand and fight** — resolve as now.
- **Strike the colours** — hand over one crate (attacker's pick) immediately. No flips, no powder
  refund.

That is one sentence. It adds the first genuine in-battle decision; it makes a meaningful fraction of
battles resolve in **two seconds instead of thirty**; and — this is the part worth noticing — the
threat of attack becomes a *negotiating position*, which quietly feeds the starved trade layer in
§4.4. "Strike your colours or I take my chances" is a sentence players will say out loud.

Pair it with pacing: reduce `stepDelay()` and the per-round holds. The flip animation is charming
once and long by the fourth round.

**Tier 2 — one simultaneous committed reveal. No flip race at all.**

Both captains secretly close a fist around 0–3 coins. Reveal together.

- Higher total wins.
- **Ties go to the downwind captain** — which finally puts the wind's biggest effect somewhere
  players can see it.
- **Both sides lose what they committed**, win or lose.
- Winner takes one crate of their choice, or 3 coins if the loser has none.

This is Knizia's blind bid — Ra, Modern Art — pointed at combat. It is one action, total tension,
**zero coin flips**, resolves in five seconds, is trivially executable at a table, and it is a *read
on your opponent* rather than a coin toss. It also makes wealth matter, which is the game's other
badly under-used axis: a rich captain is genuinely frightening, and a poor one can still bluff.

It deletes: the 2-coin powder rule, the first-to-2 race, the both-heads tiebreak special case, the
double-tails flee window, and the five-branch spoils ladder in `battle()`. Five rules out, one in.

---

### 4.4 — 77% of the game is spent watching

**The finding.** 58.7 seconds between your turns; 16.9 seconds of your own. And the waiting is not
dead air by accident — it is *designed* air. Every narration line costs
`chars × 20ms` to reveal plus `clamp(800, 500 + 20/char + 300/pause, 2000)` to hold. A typical
70-character line is **3.4 seconds**. A bot turn produces three to four lines. Three bots per round:

```
3 bots × 3.5 lines × 3.2s  ≈  37s        of narration
+ your own turn            ≈  17s
                           ≈  54s        measured: 57.7s
```

The pacing model predicts the measured round almost exactly. **This is not a performance problem —
the game is spending 37 seconds per round telling you what just happened.**

**What other designers would say.** Bauza's 7 Wonders is the standard answer: simultaneity means the
game takes the same time with three players or seven. Rosenberg's Bohnanza is the subtler one — it
keeps you engaged not by making you *act* off-turn but by making you *want to talk*: the active
player must trade, so every turn is everyone's negotiation. Chvátil's answer is to give spectators a
prediction to make. **You already built Chvátil's answer.** It just does not run often enough.

**Tier 1 (a) — run the Lookout on every turn, not just battles.**

Before each captain acts, every other captain secretly calls what that captain will do:
**Dock · Sail on · Fish · Fight · Deal.** Correct call, +1 coin. Free, mandatory, two seconds.

This is the highest-leverage change in the document relative to its cost, because
`collectSideBets()` / `settleSideBets()` already exist and already handle the free tier, the
coin-backed tier, bots, the narration and the settlement. You are extending a shipped mechanic from
0.3 firings per round to **3 per round**.

What it actually buys: it forces you to *read the board on every opponent turn*. Where are their
ships, what do they hold, which islands are empty, what does the wind let them reach. That is the
exact cognitive work the game currently lets you skip — and it is the reason the trade winds get
missed. It also converts the biggest downside of a 4-player table (more waiting) into its biggest
upside (more calls to make).

Keep the coin-backing optional, and keep the free tier free. That structure is already right.

**Tier 1 (b) — cut the narration budget by a third.**

`REVEAL_MS_PER_CHAR` 20 → 12 and `HOLD_CEILING_MS` 2000 → 1200 takes a 70-character line from 3.4s
to **2.0s**. Across ~11 lines per round that is roughly **15 seconds off every round** — a game
around 26% shorter, with zero rules changed and nothing new to learn.

Two guardrails: this is a taste call and the numbers above are a starting proposal, not a verdict —
tune them on screen. And the standing top-to-bottom reveal rule
(back button → message → buttons → helper text) is untouched by this; only durations change.

**Tier 1 (c) — make proposing a trade free and off-turn.**

`tradeOpp()` already returns every captain regardless of distance (`cfg.parley` is hardcoded true) —
you can already deal with anyone, anywhere. But trade is **3.3% of actions**, because striking a
deal consumes your entire turn while the alternative moves your boat.

Split it: **proposing and negotiating is free and can happen at any time, by anyone.** Only the
*active* captain spends their action to close a deal. That is Bohnanza's exact structure, and it
turns 58 seconds of silence into 58 seconds of haggling. It also gives the 95.9% lockout rate the
release valve it was designed to have.

**Tier 2 — simultaneous sailing.**

All captains plot their move at once and reveal together; resolve in seat order, with the existing
"you may not end on an occupied square, so you stop short" rule handling collisions for free.

Round time collapses toward 20 seconds and **player count stops affecting game length** — which is
what makes a 5- or 6-player physical game viable. It is a real change to the deterministic engine
and the lockstep multiplayer path, so it belongs in v2.0 with proper determinism re-recording. But
it is the only complete fix, and everything in Tier 1 is a mitigation by comparison.

---

### 4.5 — There is no exploring in the exploration game

**The finding.** 177 playable cells. Eight points of interest — seven islands and home. The other
~169 cells are identical water with decorative waves. And **nothing on the board is hidden**: island
contents, positions and stock levels are all public from setup.

So "seafaring exploration" currently means running a shortest-path search across fully-known terrain.
That is navigation, not exploration. The design literature is blunt about the requirement: for
something to be explorable, there has to be something unknown — if you want exploration, you have to
hide things.

The one exception is the rim current, which *is* discovery-shaped — and which players reliably fail
to notice.

**Tier 1 (a) — turn the island stock face-down.**

Each island's crates start face-down. You learn what is actually there when someone docks.

Zero new rules — it is a component change — and it makes the entire board hold hidden information.
Sailing four squares to an island becomes a gamble instead of a lookup, and watching a rival dock
becomes *intelligence*. It also makes the secret-recipe layer bite: now you are reading rivals to
learn about the *board*, not just about them.

**Tier 1 (b) — flotsam.**

Scatter 6–8 face-down tokens in open water. Sail onto one and flip it: a coin cache · a barrel of an
ingredient · a rumour · a squall. They do not respawn.

This is the cheapest possible injection of adventure, it gives those 169 empty cells a reason to
exist, it creates a genuine "shall I detour?" decision every single turn, and — if the tokens are
pastry-flavoured (a floating crate of candied peel, a drowned pastry chef's notebook) — it does
§4.6's job at the same time.

**Tier 1 (c) — make the trade winds impossible to miss.**

Animate the current, mark the four arcs in four colours, and put a one-line "🌀 the current runs
this way" on the board itself. This is your best mechanic and it is currently a secret. That is the
cheapest win in the entire document.

**Tier 2 — landfall.**

A small deck of **Landfall cards**, one drawn the first time any captain docks at each island in a
game. One-time discoveries with a lasting effect: *the Vanilla Isle's monks owe you a favour — dock
here free forever* · *a hidden channel: this island now touches the rim* · *the cocoa harvest failed:
one crate less* · *a wrecked rival's cache: take 3 coins*.

Seven cards drawn per game, one per island, each rewriting a small piece of the map for everyone.
This is where adventure and world-building actually live, it is where I would spend the theme budget,
and it is engaging off-turn because *watching someone else make landfall changes your board too*.
Tobago is the model: discovery as shared, public, deducible information rather than a private reward.

---

### 4.6 — Pastry is a skin, and it does not have to be

**The finding.** `ING_ALL` is seven interchangeable strings. `needs(p)` is a set difference. Nothing
about cocoa plays differently from wheat — not its cost, not its scarcity, not its handling, not its
value. The pastry lives entirely in `ING_NAME`, `DOCK_PLACE`, `DOCK_FLAVOR` and the recipe-title
generator, and those are *excellent* — "Cocoa Cabana", "Chocolate Genoise Sponge Cake", "hauls
aboard a pod of Luscious Cacao Beans" — but they are a costume on a colour-matching game.

**What other designers would say.** Knizia's rule is theme follows mechanism — but that presumes the
mechanism has a *shape* the theme can occupy. A set-collection game where every element is
identical has no shape, so the theme can only sit on top of it. Century: Spice Road makes its spices
upgrade into each other, so the economy *is* the theme. Quacks of Quedlinburg gives every ingredient
a different behaviour in the bag, and that is the whole game. Neither adds much rules text; both feel
saturated in their subject.

**Tier 1 — one property per ingredient, printed on the crate.**

Seven one-line rules, on the components, no reference sheet:

| | Property |
|---|---|
| 🥛 **Dairy** | **Spoils.** Discard it if you still hold it at the end of your third round with it. |
| 🍫 **Cocoa** | **Heavy.** Carrying it, you sail one square less upwind. |
| 🌶️ **Spice** | **Precious.** Counts double as battle spoil and in trade. |
| 🌾 **Wheat** | **Common.** Every wheat island holds one extra crate. |
| 🥚 **Eggs** | **Fragile.** Run aground and you lose one. |
| 🍬 **Sugar** | **Currency.** Spend a sugar crate as 3 coins at any time. |
| 🌼 **Vanilla** | **Fragrant.** Rivals may look at one line of your recipe while you hold it. |

Suddenly the route you sail is *about pastry*. Dairy makes you hurry. Cocoa makes you respect the
wind — which reinforces §4.2 instead of competing with it. Sugar links the ingredient economy to the
coin economy. Vanilla puts a cost on greed and pays off the hidden-recipe layer. This is the
highest theme-per-rule change available anywhere in the game, and every line is executable at a
table because it is printed on the thing it governs.

**Tier 1 (b) — let captains choose part of their recipe.**

Deal **3** ingredients at setup, and let each captain **choose their final 2** at the halfway point
(or when they first return home).

One rule. It creates a real strategic pivot, it lets a locked-out captain adapt — remember **95.9% of
games lock somebody out** — and it makes your bake a decision that responds to what the sea gave you
rather than a hand you were dealt. It also deepens the bluffing layer: nobody, including you, knows
your full recipe early.

**Tier 2 — baking is an action, not a finish line. (My strongest recommendation.)**

Right now the bakery is a win condition you touch once. Make it the engine.

The recipe is built in **stages** — a dough, a filling, a glaze — each needing 1–2 ingredients. Dock
at the Isle of Tortuga to **bake a stage**, spending those crates. A baked stage is permanent and
**cannot be plundered**. Raw crates in your hold can. First captain to bake all three stages wins.

Look at everything that falls out of one change:

- **Home port gets a purpose** other than crossing a finish line, so the map has a real hub and the
  wind matters on the way back as well as the way out.
- **A genuine push-your-luck spine** — run home now and bank a stage, or push for one more crate and
  risk carrying it? That is the Ra decision, and it is the single best tension generator in
  Euro design.
- **Plunder becomes meaningful and fair.** You steal raw ingredients, never finished work. Losing a
  battle stings without erasing an hour.
- **The endgame stops being one long boring sail home.** Progress is visible and incremental
  instead of binary, so the table can see who is winning — which is itself off-turn engagement.
- **Pastry becomes the literal engine of the game.** You are not collecting five tokens; you are
  making dough, then filling, then glaze, and every one of those is a thing you *did*.

This is the change that answers "I want the world-building of pastry to be deeply felt." Everything
else in §4.6 is decoration next to it.

---

## 5. What each change is worth

Sorted by value per unit of rules added. Negative "rules cost" means the change *removes* text.

| # | Change | Tier | Rules cost | Fixes |
|---|---|---|---|---|
| 1 | Baking in stages at home | 2 | +2 lines | Pastry · endgame · plunder · push-your-luck |
| 2 | Lookout's Call on every turn | 1 | +1 line | **Off-turn engagement** (0.3 → 3 firings/round) |
| 3 | One property per ingredient | 1 | +7 short lines, on components | Pastry · wind · greed |
| 4 | Wind rotates on a schedule | 2 | **−1 rule** | Wind felt · planning · absorbs storms |
| 5 | Downwind 4 / across 2 / upwind 1 | 1 | **−1 large rule** | Wind felt · tabletop maths gone |
| 6 | Sailing is free | 1 | **−1 rule** | Kills the 57% fishing treadmill |
| 7 | Simultaneous committed-coin battle | 2 | **−5 rules, +1** | Battle length · battle decisions · wealth |
| 8 | Defender may strike the colours | 1 | +1 line | Battle decisions · feeds trading |
| 9 | Face-down island stock | 1 | 0 (component) | Exploration · rewards reading rivals |
| 10 | Free off-turn trade proposals | 1 | +1 line | Off-turn engagement · the 3.3% trade rate |
| 11 | Flotsam in open water | 1 | +1 line | Exploration · the 169 dead cells |
| 12 | Choose 2 of your 5 recipe slots | 1 | +1 line | Strategy · the 95.9% lockout |
| 13 | Narration: 12ms/char, 1200ms ceiling | 1 | 0 | ~26% shorter game |
| 14 | Landfall cards | 2 | +1 line, +1 deck | Exploration · adventure · world |
| 15 | Simultaneous sailing | 2 | ~0 | Round time · player-count scaling |
| 16 | Make the rim current visible | 1 | 0 (presentation) | Your best mechanic stops being a secret |

If you ship only three things, ship **#2, #5 and #6.** Those are one afternoon each, they need no new
components, and between them they hit off-turn engagement, the wind, and the fishing treadmill — the
three biggest measured problems.

---

## 6. The cut list

You asked for fewer rules. Here is what to delete and, honestly, what each cut costs.

| Cut | Why | What it costs |
|---|---|---|
| **The 9-point sail budget + 2/3/4 costs + the leeward rule** | The largest block of rules text in the game, and 62.2% of the time it makes no difference to where you can go | The fine-grained mixed-direction route. Replaced by 3 numbers (§4.2) |
| **The 1-coin sail cost** | Funds a tax with a chore; produces the 57% fishing rate | Coins get looser — offset by pricing crates at 4 |
| **Storms as a separate system** | ~12 rules (push 2, re-spin, push 2, moored, aground ladder, occupied-berth exception, once-per-turn exception) for 12.5% of rounds. Also the Safari perf bug | Fold in as *"a gale: same wind, double distance, and it moves you whether you like it or not."* One system, two intensities. The wind-rotation clock (§4.2 Tier 2) makes gales predictable, which is better drama than surprise |
| **The aground three-way ladder** | half coins → a crate → lose your turn | One outcome: lose one crate, or 2 coins if you have none |
| **The battle spoils ladder** | 5 branches in `battle()`, and it contradicts both rulebooks | One rule: winner takes one crate of their choice, or 3 coins if there is none |
| **The 2-coin powder cost** | Makes an already negative-EV action worse; 7.6% action share is the proof | Gone under §4.3 Tier 2, where the committed coins *are* the stake |
| **Buy-on-tails** | A sub-rule with three conditions (needed · in stock · 3+ coins) hanging off a coin flip | Goes with the dock flip, or survives as a flat "pay 4 for any crate you are docked at" |
| **"One flip per visit," leave-and-return** | Bookkeeping that exists only to rate-limit the slot machine | Nothing, once docking is deterministic |
| **The bakeoff** | A whole subsystem — sequential challenges, first to 5, reigning champion — for an edge case | Break ties by **fewest leftover crates** (rewards efficiency, needs no flips, and is thematically perfect: the tidiest kitchen wins) |
| **`SAIL_BUDGET_LEEWARD`** | An island-shadow special case on a budget that no longer exists | Nothing |

**Net: the tabletop rulebook goes from roughly 11 pages to roughly 3, and the game gets deeper.**
Every one of these cuts removes a rule that produces no decision.

---

## 7. What the tabletop rules look like afterwards

The whole game, Tier 1 changes applied, at a level a table can actually run:

> **Setup.** Islands out, crates face-down (players − 1 per island). Each captain: a ship at Tortuga,
> 5 coins, 3 recipe ingredients dealt secretly. Scatter the flotsam. Set the wind wheel.
>
> **Each round.** Turn the wind wheel one notch. Then, in seat order, each captain takes a turn.
>
> **Before a captain's turn,** every other captain secretly calls what they will do — *Dock, Sail on,
> Fish, Fight, Deal.* A correct call earns 1 coin.
>
> **A turn is: Sail, then Act.**
>
> **Sail** — free. **4 squares downwind, 2 across, 1 upwind.** Not through islands, not onto another
> ship. Enter the rim current and it sweeps you to the far end of that arc.
>
> **Act — one of:**
> - **Dock** — take a crate from the island you are berthed at.
> - **Fight** — an adjacent ship. They may strike their colours and hand you a crate, or stand: both
>   hide 0–3 coins in a fist and reveal. Higher total wins, ties to the downwind ship, both pay what
>   they showed. Winner takes a crate, or 3 coins.
> - **Deal** — close a trade. *(Anyone may propose one at any time, for free.)*
> - **Fish** — draw 2 from the Sea deck, keep 1.
> - **Bake** — at Tortuga, spend crates to bake one stage of your recipe. Baked stages cannot be
>   taken from you.
>
> **Halfway through**, choose your final 2 recipe ingredients.
>
> **Winning.** First captain to bake all three stages. Ties: fewest leftover crates.
>
> **Ingredients each do one thing** — printed on the crate.

That is a single page, and it contains more decisions than the current eleven.

---

## 8. Recommended sequencing

**Do first, before any design work:** reconcile §2. Four copies of the rules is the actual bug, and
every recommendation here lands badly on top of a rulebook that already disagrees with the code.
Consider making the in-app How-to-play modal generate from the same constants the engine reads, so
there are two artefacts instead of four and one of them cannot drift.

**v1.4 — one milestone, no new components except crate backs:**
Lookout on every turn (#2) · wind 4/2/1 (#5) · sailing free (#6) · strike the colours (#8) ·
face-down stock (#9) · free trade proposals (#10) · narration pacing (#13) · rim current made
visible (#16).

Re-run `real_game_test.js`, the action-mix harness and `economy_guard_test.js` after each. The
number to watch is the fishing share: if it does not fall well below 40%, the treadmill is still
there.

**v1.5 — components:** ingredient properties (#3) · flotsam (#11) · choose-your-recipe (#12).

**v2.0 — structural, with determinism re-recording:** baking in stages (#1) · the wind clock and
storms folded in (#4) · the committed-coin battle (#7) · landfall cards (#14) · simultaneous
sailing (#15).

---

## 9. Two things I would not change

**The pirate voice.** It is the best-executed thing in the project and it is correctly bounded —
in-world text is pirate, credits and About are Wyatt's own voice. Nothing here touches that
boundary.

**The secret-recipe / public-cargo information structure.** Several recommendations lean on it
harder; none replace it. It is the thing the rest of the design should be built around.

---

### Sources

Design references consulted while writing this:

- [Reiner Knizia — Systems for Publishing 700+ Games, Crafting Profound Gameplay from Simple Rules (Think Like A Game Designer #52)](https://justingarydesign.substack.com/p/reiner-knizia-systems-for-publishing)
- [Reiner Knizia: "Creation of a Successful Game" — Critical Hits](https://critical-hits.com/blog/2008/07/03/reiner-knizia-creation-of-a-successful-game/)
- [How to reduce downtime in your game — Board Game Design Course](https://boardgamedesigncourse.com/how-to-reduce-downtime-in-your-game/)
- [Simultaneous Action Selection — Paytheone](https://www.paytheone.com/mechanics/simultaneous-action-selection)
- [Boardgame Downtime — Board Game Designers Forum](https://www.bgdf.com/blog/boardgame-downtime)
- [Wind Direction as a Mechanic — Board Game Designers Forum](https://www.bgdf.com/forum/game-creation/mechanics/wind-direction-mechanic)
- [Merchants & Marauders review — Blood & Pigment](https://bloodandpigment.com/2025/12/18/merchants-marauders-pirate-board-game-review/)
- [How to create a sense of exploration in your board game — Bastiaan](https://medium.com/@BastiaanSquared/how-to-create-a-sense-of-exploration-in-your-board-game-e784395fbb22)
- [Mechanic to Show Strategic Exploration — Board Game Designers Forum](https://www.bgdf.com/forum/game-creation/design-theory/mechanic-show-strategic-exploration)
- [Top 10 Negotiation Board Games — Bitewing Games](https://bitewinggames.com/top-10-negotiation-board-games-a-bitewing-games-publication-reveal/)
- [Bohnanza review — Bumbling Through Dungeons](https://bumblingthroughdungeons.com/bohnanza-board-game-review/)
- [Getting Lucky: the role of randomness in games — BoardGameGeek](https://boardgamegeek.com/thread/141471/getting-lucky-role-randomness-games)
- [Effect of Input-output Randomness on Gameplay Satisfaction — arXiv](https://arxiv.org/pdf/2107.08437)
- [Cosmic Encounter — official rules](https://officialgamerules.org/game-rules/cosmic-encounter/)
