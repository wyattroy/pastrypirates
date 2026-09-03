# Wyatt's standing decisions

## CRATE LANGUAGE — HIS 31 RULINGS AND THE FLAVOUR WORDS, 2026-09-03

Rulings page (db-backed, tap to rule): https://claude.ai/code/artifact/15a5f335-6746-4fda-a80f-63fee9511fb0
Read them back with the Artifact tool: `action:"read_db"`, `db_op:"list"`, `collection:"decisions"`.

**ALL 31 RULED, 19:39–19:43 on 2026-09-03: r01–r18 CHANGE, r19–r29 KEEP, r30 and r31 CHANGE.**
That is: every player-facing "crate" becomes "ingredient" EXCEPT the bake-off (his cup-and-ball
reason), "each island holds only a few crates" (a unit of supply), the artwork alt text and the
asset filename.

### ⚠ r30 IS SUPERSEDED BY HIS OWN LATER IDEA — and the later one is better

r30 said the container words survive only in the dock's arrival line. **He then reversed it:** keep
them everywhere AND reshape them so they teach the crate early — *"they should ALSO introduce the
idea that you buy a crate of an ingredient, so that this doesn't come completely out of the blue at
the end of the game during the bakeoff."*

**Why the reversal is right, and it is a fact rather than a preference:** `dockFlavor` is used in
exactly THREE places — the dock narration (`src/ui/util.js:458`), the **buy prompt**
(`src/ui/flow.js:1721`), and the black-market prompts (`src/ui/flow.js:1601-1602`). Restricting it to
the arrival line would have removed it from the buy prompt, which is the one moment a player actually
acquires a crate. **The teaching moment was the thing r30 would have deleted.**

### HIS WORDING (supersedes my longer draft)

```
a crate of Crystal Sugar        a crate of Milk Jugs         a crate of Cinnamon Sticks
a crate of Wheat Sheaves        a crate of Cacao Pods        a crate of Sand-Speckled Eggs
a crate of Vanilla Beans
```

Measured: **24.0 chars average**, against 25.9 today and 30.3 for my draft — his "shorter, easier to
read" is correct and his is the shortest of the three. Structure is unchanged: `DOCK_FLAVOR` stays
`{prefix, name}` because the ingredient icon is inserted BETWEEN them (F5, 2026-07-29), so "a crate
of" is simply the prefix for all seven — which also removes the `eggs` asymmetry (its old prefix "a
dozen" carried no "of").

**IT FIXES TWO EXISTING MISMATCHES:** `cocoa` was "Luscious Cacao **Beans**" while `ING_NAME` says
"Cacao Pods" and the art draws a pod; `vanilla` was "Velvety Vanilla Beans" against a card reading
"Vanilla Beans". Both now match exactly. **It breaks two** by dropping an adjective the card keeps
(Fresh Milk → Milk Jugs, Toasty Wheat → Wheat Sheaves) — net 3/7 exact before and after, but trading
*wrong noun* mismatches for *dropped adjective* ones, which a player reconciles instantly.

**EGGS SETTLED 2026-09-03: `a crate of Speckled Eggs`** — he dropped "Sand-". 24 chars instead of
29, consistent with the other six, and a fourth exact match with the recipe card. Final set:

```
a crate of Milk Jugs      a crate of Cinnamon Sticks    a crate of Wheat Sheaves
a crate of Cacao Pods     a crate of Speckled Eggs      a crate of Vanilla Beans     [sugar OPEN]
```

**SUGAR SETTLED 2026-09-03: `a crate of Sugar Cane`.** Art studies:
https://claude.ai/code/artifact/375cc93e-d955-483f-9af5-2107123340c0

**THE FULL SET IS CLOSED:**

```
a crate of Sugar Cane     a crate of Milk Jugs       a crate of Cinnamon Sticks
a crate of Wheat Sheaves  a crate of Cacao Pods      a crate of Speckled Eggs
a crate of Vanilla Beans
```

### HOW HE GOT THERE — the reasoning outlives the answer, and it is a STRUCTURAL find

Five rounds went into hunting a prettier word — cubes, loaves, lumps, bricks, gems, pearls — and every
one felt slightly wrong. **He found the actual cause himself:**

> *"we already are going off the raw ingredients for milk (which turns into butter) and cacao pods
> (which turns into chocolate) and wheat (which turns into flour) -- what if we did sugar cane too?"*

**Verified against the data: six of the seven ingredients name the RAW thing the baker transforms.
Sugar was the only one naming the FINISHED product.**

| game name | becomes | |
|---|---|---|
| Toasty Wheat | flour | raw — the baker mills it |
| Fresh Milk | butter & milk | raw — the baker churns it |
| Cacao Pods | chocolate | raw — the baker makes chocolate from it |
| Vanilla Beans | vanilla | raw — off the vine |
| Hot Cinnamon | cinnamon | raw — bark, dried |
| Speckled Eggs | eggs | already the ingredient |
| **Crystal Sugar** | sugar | **REFINED — the odd one out** |

`Cacao Pods → chocolate` asks a player to imagine a transformation. `Crystal Sugar → sugar` asks
nothing, because it has already arrived. **"Crystal Sugar" was a lovely name for the wrong thing.**
Cane also earns the setting — the Sugar Seas are the Caribbean and cane is what grew there — and it
sidesteps the delicious-vs-accessible tension entirely: nobody needs to find *cane* delicious, any
more than *cacao pods*. `ING_NAME.sugar` moves to "Sugar Cane" so the card and the dock agree, and the
gloss reads cane → sugar like pods → chocolate.

**GRAVEYARD — five words he rejected and exactly why, so nobody re-proposes them:**
*Sugar Cubes* — **"no one would ever bake with sugar cubes"** · *Sugar Loaves* — **"sounds like a
finished bakery product... poorly designed for this game's user"** (loaf primes BREAD, in a baking
game — the historically perfect answer was the worst-designed one) · *Sugar Lumps* — not delicious ·
*Sugar Casks* — hard to picture · *Sugar Jars* — weird · *Sugar Bricks* — closest of that batch, but
"brick isn't delicious" · *Sugar Gems* — he approved it, then withdrew it the same minute:
**"as a human, it just doesn't quite make intuitive sense"** (gems read coloured; sugar is white).

**MY OWN WRONG CONSTRAINT, recorded because it cost rounds:** I insisted every crate hold *countable
plural things*, which is why I kept pushing Cubes/Lumps/Pearls. It was tidiness, not a rule, and the
answer he chose is a mass noun. **Do not let that pattern outvote his ear again.**

### THE ART IS OPEN — ten studies published, none chosen

`assets/ingredients/sugar.png` must be redrawn: he volunteered it (*"the art is a sugar cube because
i couldn't think of anything else"*). **The one real risk is that cane and wheat are the two closest
silhouettes in the set** — both bundled plant stalks at 26px. Ten vector studies are published at the
link above, each shown at 26px, 44px and beside the real wheat icon, spanning standing sheaf (the risk
drawn on purpose), stacked billets, single diagonal, crossed pair, tied bundle, leaf spray, fanned
billets, cane-with-a-spill, end-on stub and purple-node pair.

**They are VECTOR studies, not finished art** — this session cannot paint raster icons. They settle
silhouette, composition and colour; the winner still needs painting. Palette sampled from the shipped
assets; **green chosen because no ingredient in the game owns green**, the strongest lever for
separating cane from gold wheat.

**HIS PROCESS NOTE:** *"we have an entire art-audit process for this. use that process."* That is
`art-review/` — candidate PNGs per folder plus a dark gallery (`.card-img{background:#000}`) he
reviews. **`notes/art-generation-process.md` DOES NOT EXIST** — an earlier memory claimed it did.
Ten options with their implied art are live on the rulings page under "Sugar — pick one"; his choice
saves to `decisions/sugarWord`. **Four criteria a sugar icon must meet**, derived while drafting
them: legible at 26px, a silhouette unlike the other six, reads as sugar, and is bakeable — the cube
passes three and fails the fourth. My pick is **Sugar Loaves** (a white cone banded with blue paper:
the real pirate-era form, a silhouette nothing else on the board owns, and historically the blue
wrapper gives sugar a colour no other ingredient has). **He dismissed the question rather than
answering it, so nothing is decided and nothing should be built until he returns to it.**

**BUILD NOTE:** all seven strings are pinned as literals in `scripts/narration_test.js:820-826`, but
that script sits in the `test:v1` chain which is **parked by the cutover**, so changing them turns
nothing red today. **Corrected from my first assumption that it was a live gate.**

## THE COURSE — FINAL, 2026-09-03. His X asset and his final numbers.

Tuner: https://claude.ai/code/artifact/4e122a8a-3329-4ef6-b389-b69d12ca2637
Crate rulings (tap to rule, db-backed): https://claude.ai/code/artifact/15a5f335-6746-4fda-a80f-63fee9511fb0

**THE X IS HIS OWN DRAWING**, supplied as `notes/x.png` (265×284, alpha) — cream fill, brown outline,
flared arms with concave sides. It replaces every SVG approximation of it. **`notes/` is GITIGNORED,
so the file is not in the repo**: shipping this means moving it to `assets/icons/` first, and that is
a real step, not a detail.

> **The tuner embeds a 149×160 DOWNSCALE of it, not the original** — resampled only to keep the page
> small, and invisible at marker size. **When it ships, copy `notes/x.png` itself, never the tuner's
> copy.** (Caught by CEO Review 81; the record had cited the source dimensions beside a page carrying
> the smaller file, which was an omission rather than a wrong claim.)

**FINAL SETTINGS — this is the spec for the dotted course:**

```json
{"len":8,"gap":7,"thk":2.6,"ang":7,"a1":0.13,"f1":0.3,"a2":0.05,"f2":0.85,"jit":0.02,
 "rnd":14,"o0":0.98,"o1":0.42,"sep":0.85,"clp":0.34,"mk":0.5,"pd":0.15,"ps":1.2,"mark":"x"}
```

Marker size is **0.5** — given separately, after the rest. Note this is NOT the set he called
"ideal" the day before (that one had len 6.5 / gap 10.5 / sep 0.38 / no jitter); **he came back to
tighter dashes with a little jitter and a far higher minimum separation (0.85), which is the setting
that guarantees no two dashes touch where the route folds back.** If a future session finds a
conflict between the two, THIS one is later and wins.

**A SMALL BUG WORTH REMEMBERING:** his copied settings arrived carrying `"rip":0.42` — a key for the
ripple ring that had been deleted a version earlier. Cause: the tuner's `load()` did
`Object.assign({}, DEF, stored)`, so a retired key in localStorage outlived the control that owned
it and rode back out through Copy settings. **Fixed by only accepting keys present in DEF.** The
general shape: *stored preferences outlive the UI that wrote them, and merge back in as ghosts.*

## THE TUTORIAL — HIS SETTLED COURSE SETTINGS + THE TORTUGA BUG, 2026-09-02

**HIS CHOSEN LOOK, dialled himself in the tuner and to be treated as the spec** (rulings 26-28 below
are the changes that produced it). Tuner: https://claude.ai/code/artifact/4e122a8a-3329-4ef6-b389-b69d12ca2637

```json
{"len":6.5,"gap":10.5,"thk":3.9,"ang":0,"a1":0.11,"f1":0.16,"a2":0.17,"f2":0.36,
 "jit":0,"rnd":23,"o0":1,"o1":0.42,"sep":0.38,"clp":0.47,"mk":0.56,"pd":0.15,"ps":1.2,"mark":"x"}
```

Read it as: **short dashes with big gaps** (6.5 on, 10.5 off), **thick** (3.9), **no angle jitter and
no random jitter at all** — the wander is entirely the two waves, a shallow slow one (0.11 @ 0.16
cycles/square) under a *deeper and slightly faster second* one (0.17 @ 0.36) — f is cycles per
square, so the larger number is the quicker wave. Heavy corner rounding (23). Full
opacity at the boat fading to 0.42. Loose separation (0.38) and a wide clamp (0.47, nearly the edge
of the square). Small markers (0.56) pulsing 0.15 deep every 1.2s.
**The lesson in those numbers: he removed every source of randomness and got the hand-drawn look
from LAYERED SLOW WAVES instead.** My instinct — jitter to look hand-made — was exactly backwards.

| # | ruling |
|---|---|
| 26 | **Dashes, not dots. Constant size; only opacity travels with distance.** *"don't modify their scale over distance, just their opacity."* |
| 27 | **Each dash CURVES along the invisible line it traces.** Built by slicing the wavy source line by arc length, never by stamping straight segments on it. |
| 28 | **The marker PULSES and the ripple ring is deleted.** *"I want the x to pulse, remove the ring."* The swell is the pulse. |
| 29 | **One continuous tour confirmed** over separate lines to each dock — *"Your reinterpretation was correct."* |

### 🐞 TORTUGA IS LAND — and how the bug got in

Wyatt, 2026-09-02: *"it looks like your algorithm for computing path is treating tortuga like
sailable ocean; it is not. It is land."* Correct. **The game's own predicate is
`!blocked && !isIsland && !isHome` (`src/ui/flow.js:338`, and the engine refuses it again at
`src/engine/index.js:600`). I hand-rolled my own and dropped the `!isHome` clause**, on the reasoning
that sailing *through* home seemed harmless.

**The reusable lesson, which is rule 9's and rule 23's together: I re-derived a rule the game already
owned, and my copy was wrong.** A route finder that answers a question the engine already answers
should CALL the engine, not reimplement it. Proved with a posed pair on ONE board — the old path ran
`…[6,7],[7,7],[8,7]…` straight over Tortuga, the corrected one arcs around the north; both 28
squares, so the bug cost nothing in length and was invisible from the numbers alone.

## THE TUTORIAL — THIRD PASS, 2026-09-02 (rulings 19-25)

Mocks: https://claude.ai/code/artifact/3f6fbed6-66aa-4f8a-91c2-c6cc626fa803

| # | ruling | his words |
|---|---|---|
| 19 | **The parrot + `?` button is APPROVED** and the parrot **stays on the Start button** | *"I love the parrot with the question mark as the button. That's wonderful."* Confirms ruling 9. |
| 20 | **The dotted course must read as a PIRATE MAP, not a transit map** | *"It's currently giving 'tech game' more than 'pirate map'... maybe it could be a little wavy or the dots could be a little more scattered/jittery."* Requirements: wavy with rounded corners · **fewer** dots · **no two dots ever overlap**, including where a route doubles back (*"it kind of ends up looking like a train map instead of a linear journey"*) · opacity/size **fading with distance from the boat** · and every dot **still inside the square it crosses**. **The fade-beyond-this-turn idea is DEAD** (ruling 10) — this fade is by distance travelled, a different thing. |
| 21 | **The X is his own flared design** — thick arms, concave sides, flared rounded tips, WHITE (he generated a sheet and picked the top-left). **The anchor is a live alternative** (bottom-left of his second sheet). Keep the slow white ripple. | *"ignore the fact that many are red, the one we use will be white"*; *"I also like the idea of the anchor instead of an x"*. **Open: X or anchor — or both, X for a needed dock and the anchor for Tortuga** (my proposal, unruled). |
| 22 | **The recipe cards move UP** — anchored to the top of the captains box, i.e. just below the drawn board | *"they are too low down the screen. I want them to be higher up on the screen, so that they're kind of just below the bottom of the board."* **Trap for the builder: `#boardwrap` is TALLER than the drawn board** — anchoring to its bottom puts the card *below* the captains box. Anchor to `#pp4Cap`'s top. |
| 23 | **"{player}, choose yer recipe" moves into the NARRATION BUBBLE, anchored to the boat** like every other narration | *"maybe it should come from the standard narration box as everything else comes from. Like, it should be attached to the boat, as the normal narrations are."* **Consequence: the picker must stop being a centre-stage card**, because the narration channel refuses to draw a bubble while one is up. |
| 24 | **The cards must SWIPE as well as take the arrows** | *"a lot of users are probably going to wanna swipe between them."* |
| 25 | **The bake-off KEEPS "crates" — and his reason is better than the rename argument** | *"I actually love that the ingredients are in crates, because it references the ball and cup game, and it explains kind of storyline thematically why the crates are all jumbled up."* This also resolves the one sentence I said needed rewriting: *"Opening the crates…"* is correct as it stands. |

**THE CRATE RULE, in his words:** *"My intention is not that we remove crates entirely. It's that we
most frequently refer to ingredients as ingredients unless we are referring to them as a unit of
ingredients."* Plus: *"each island holds only a few crates — the word is doing real work as a unit of
supply"* (agreed), and **leave the code identifiers alone** (agreed).

**WHAT THE AUDIT FOUND THAT HE HAD NOT SEEN: there are FIVE names for one object**, not two —
`ingredient` (the goal) · `crate` (the unit) · `Crystal Sugar` (`ING_NAME`) · `a jar of`
(`DOCK_FLAVOR`: a jar of / a sack of / a bundle of / sprigs of / some jugs of / a dozen / a pod of) ·
`sugar` (`ING_PLAIN`, the gloss on the recipe card). **Proposed rule, awaiting his ruling:** the
ingredient is the noun; a container word appears only where the container does a job — **stock on an
island** (a count, which drives the price), **the bake-off bench** (his cup-and-ball reason), and
**the dock's arrival line** (worldbuilding, said once). Everywhere else it is just the ingredient —
which is why *"a crate of milk"* never has to be said at all. `ING_PLAIN` is proposed for retirement
because the redesigned card shows pictures, not names, so the gloss has nobody left to serve.

**HIS DECISIONS ON EACH LINE ARE BEING COLLECTED IN THE ARTIFACT ITSELF** — 31 rows with Keep/Change,
stored in that artifact's `db` under `decisions/<row id>`. Read them with the Artifact tool
(`action:"read_db"`, `db_op:"list"`, `collection:"decisions"`) rather than asking him again.

## THE TUTORIAL — TEN MORE RULINGS, 2026-09-02 (second pass)

Mocks, drawn inside a live voyage: https://claude.ai/code/artifact/3aec2f18-4f35-459e-8aaa-367a550eb805

| # | ruling | his words / the reason |
|---|---|---|
| 9 | **The parrot KEEPS the Start button** — it is not a collision, it is one voice in two places | *"keep the parrot on the start button -- it makes it seem like the parrot is the one talking to you, which is perfect and feels consistent with parrot being your helper!"* **This closes ruling 5's open question by inverting it:** the tutorial's voice is a character, not a system. |
| 10 | **No fade beyond this turn's reach on the dotted course** | *"the yellow sail squares show where you can get to this turn. So we don't need another mechanic showing that. In fact, it'll kind of just be strange."* A second mechanic for a solved problem is noise. |
| 11 | **Many dots per square, not one** | *"I want the dots to be not just one dot per square. That sounds weird. That won't read as a dotted line."* Shipped mock: 6.5px spacing, ~5–6 dots per cell at sail-prompt zoom. |
| 12 | **The course is ORTHOGONAL — never diagonal** | *"in your mock up, the dots are going diagonally, which is not possible in the game."* Mocks must be drawn on a real board for exactly this reason. |
| 13 | **A piratey X ASSET is to be made; keep the slow white ripple** | *"I think we need to create an... a piratey x asset to use for the end, and I like that it has the the slow white ripple keep that."* Design settled in the mock: two bowed tapered strokes with overshoot, tilted 8°, warm cream over a soft dark pool, ONE loose ripple — three tight rings read as a crosshair, i.e. "avoid this". |
| 14 | **CRATE → INGREDIENT, globally, but audited not find-and-replaced** | *"Players don't think of the ingredients as being in crates... it's really confusing when we introduce them to two new concepts simultaneously... there may actually still be some legitimate uses for it, like a crate of sugar should not be an ingredient of sugar."* 474 occurrences; **38 player-facing**; 19 rename, 2 keep (the artwork and its alt text), the rest are code and stay. |
| 15 | **The pulsing X REPLACES the thin orange dock ring, globally, at every rung** | *"I think what looks better is the pulsing x. That way, the players will already have seeing the X marks the spot when they start sailing, and it'll kind of be a learning moment before they even start."* |
| 16 | **Dotted courses appear during RECIPE CHOICE, from the boat to each dock the recipe needs** | *"that Dotted course should appear during the recipe choice phase to help them make a decision."* |
| 17 | **And charted as ONE tour** — position → nearest dock → … → last dock | *"it would be awesome if the dotted course charted from their position now to kind of through to the first closest dock through the last dock to show them the shortest possible path right now through the game."* **His own caveat, recorded because it prevents a false claim later:** *"during the actual game, that shortest path might not end up being the path that they wanna take because the wind can change their strategy... But it's okay because this starter path is just trying to help the player visualize where the recipe would take them."* It is a picture of the voyage, never advice about sailing it. |
| 18 | **The recipe card: picture, name, ingredient icons. Nothing else.** Off the board, over the captains box; a VISIBLE stack of two (occluded card behind, arrows to flip); **no "1 of 2" in numbers**; flipping re-draws the dotted course | *"Your recipe cards look terrible. I'm sorry."* — of the three-way merge he had picked. The card must show *"visually that it is a stack of two, which didn't say one of two in numbers."* |

**WHAT THE MOCKS PROVED, that had only been asserted before:** with today's picker, **two of the five
dock X's are hidden behind the recipe card**, with the dotted course visibly running underneath it.
That is the "the picker covers the lower 45% of the board" defect, demonstrated rather than argued.

**AND A LESSON ABOUT MOCKS, paid for twice in two days:** a mock drawn by hand invented an illegal
diagonal move, and a screenshot cropped with `sips --cropOffset` silently centre-cropped to open sea
and was published as "the ribbon". **Draw mocks inside the running game, and open the output, not the
input.** Both errors were of the same shape as the DAY 12 fault CEO Review 76 caught.

## THE TUTORIAL — EIGHT RULINGS, 2026-09-02

The design is *The Pilot*: https://claude.ai/code/artifact/c649f0df-b3d6-4837-8f08-b6c44a8aef18
The visual options he chose from: https://claude.ai/code/artifact/365d5a1e-3e9d-4daf-b1a4-41cfebba3077

**THE MECHANISM IS HIS, AND IT IS THE SPINE.** Wyatt, 2026-09-02: *"the tutorial being just extra
narration lines -- they give most context/explanation the first time (eg: first time: 'Tap any
yellow square to sail towards a dock. Sailing against the wind is harder.' 2nd time: 'Tap any yellow
square to sail'. 3rd turn: 'Tap to sail')"*. Every teachable moment holds a short array of phrasings,
longest first, indexed by how many times that moment has been seen. **The bottom rung of every array
is the copy that ships today** — so a veteran's game is byte-identical and the tutorial is not a mode
anyone leaves. Not a beat that fires once; a verbosity that runs out.

| # | ruling | his words / the reason |
|---|---|---|
| 1 | **The 2026-08-25 wind deletion is SET ASIDE** — rung 0 keeps its wind clause | *"ignore my previous ruling, it was about a different matter and we are solving it with our rung system"*. The old ruling (c19d9f19: *"Remove the sail prompt saying wind blows east entirely because the game calculates this for you"*) still governs PERMANENT wind text; it does not govern a decaying rung. |
| 2 | **Decay is baked in**, by time away, evaluated only between voyages | Under 7 days nothing · 7–30 back one rung · 30–90 back two · over 90 back to rung 0. He asked for best practice; **there is no canonical standard** — this is built from the forgetting curve (expanding intervals) plus the games convention of refresher-not-tutorial for returners. Words never grow back mid-game, which is what makes it predictable. |
| 3 | **Storm and crate price are IN** as ladders | *"IN."* Both are rules rather than strategy, which is the line he drew in core value 3. |
| 4 | **The bake-off is left as-is** | Its own full-screen prompt is assumed sufficient. **Untested** — nobody has watched a first-timer reach it. |
| 5 | **The help button is a PARROT + `?`** | *"Parrot + ? so that it hints at what it does. could that work?"* — measured yes and free: the ribbon overflows 320px by **exactly 21px with every variant**, because flex-shrink absorbs the extra width and the four captain circles (111px, unshrinkable) are what actually binds. Side-by-side beats a corner badge: a badge borrows the chat unread-dot language and would read as a permanent notification. **Consequence he must still rule on: 🦜 currently labels the turn-order Start button.** |
| 6 | **Tapping it is a TWO-STATE TOGGLE** | On (and every count back to rung 0) / off, with a line each way. Chosen over a three-step, because an unlabelled three-state control gets pressed at random. |
| 7 | **The way to a dock is a DOTTED COURSE over the real travellable path, ending in a pulsing treasure X** | He killed the bearing-pointer himself: *"it may point to a dock that cannot be reached by moving in the direction it's pointing."* Constraints he set: **not gold** (gold means *tap me*), **not the trade-winds line** (those are chevrons and swirls, so the course is round dots), and the X must read as **treasure, not "avoid this"** — the game already owns `cancel-x`, `close-x` and `blocked-slash`, so a fifth X must be a different species: never red, dashed not solid, tilted off 45°, with the crate floating above it, breathing outward. |
| 8 | **The recipe step takes ALL THREE redesigns** | One card at a time · icons instead of the ten ingredient names · a small chart of the recipe's five docks. He rejected adding text: *"The recipe choice moment has a lot of text in it already, and it's pretty overwhelming -- even as is. Adding more text is not the solution to this."* |

**TWO STANDING CONSTRAINTS THAT CAME OUT OF THIS AND OUTLIVE IT:**

1. **The guide points at the NEAREST dock holding something you need, never the BEST one.** Nearest
   is a fact; best depends on price, rivals and wind. That is the line between teaching a dynamic and
   teaching strategy, which his core value 3 forbids.
2. **The dock-preview circles on the recipe picker need a global redesign, at every rung, for
   everybody.** Wyatt: *"those dock circles should look substantially different -- they need a UI
   redesign"* — today they are thin, static, orange (the game's *act now* colour, already spent on
   gold squares and confirm pills). They must move, stop being orange, use the ONE expanding ring the
   codebase already consolidated from three copies, and carry the crate so they say *what* is there.

**HE DID NOT RULE ON**, and it is still open: the two defects found in the picker screenshot — the
*"Bake this!"* pill covering the recipe's own artwork, and the picker card hiding the lower 45% of
the board so highlighted docks can be invisible. Offered, left unticked, deliberately not folded in.

## THE KEEP-WORKING HOOK FIRES ONLY IN THE BOSUN — 2026-08-31, RESTATED 2026-09-01 BECAUSE IT WAS LOST

> **SUPERSESSION PENDING (2026-09-01, the relay redesign, ruling 5):** when the relay lands, the
> keep-working hook is deleted entirely and this ruling becomes moot — no hook, no scope. Until
> that lands, this ruling stands exactly as written.

Wyatt, 2026-08-31: *"I want ONLY the bosun session to have this hook -- is that possible? all other
sessions are normal."* And again 2026-09-01, having found it undone: *"yesterday i told both you and
bosun that the keep working hook should ONLY apply to the bosun. why did this decision get
overwritten/lost?"*

**The ruling: the never-stop loop belongs to the watchdog-started engine and nowhere else.** Wyatt's
own terminal, a cloud session, and any other session are ordinary sessions that may end a turn
whenever they are done. The mechanism is the environment stamp — `watchdog.ps1` sets
`PP_BOSUN=1` before launching, and the hook exits on its first line without it.

### HOW IT WAS LOST, WRITTEN DOWN BECAUSE THE MECHANISM MATTERS MORE THAN THE INSTANCE

**It was never recorded here.** It lived in one session's context and in a comment inside the hook.
On 2026-09-01 that session wrote a chain audit recommending the gate move from *who launched this*
to *is this session working* — reasoning from his symptom report (*"when I intervene with bosun, it
stops him from being in a loop"*) without checking it against a ruling nobody had filed. He approved
five fixes as a batch; fix 2 was the repeal, and nothing in the record flagged the contradiction.

**CLAUDE.md §5 already names this exact failure:** *"A ruling he made that nobody harvested is the
failure this system exists to stop."* The rule existed. The harvest did not happen.

**AND THE SYMPTOM WAS MISREAD, WHICH IS THE OTHER HALF.** *"When I intervene with bosun, it stops him
from being in a loop"* means **the Bosun's loop breaks when Wyatt interrupts it** — so the fix belongs
on the resume path (the watchdog, or the Bosun picking the Chart back up after answering him), NOT on
the hook's scope. Putting the loop into every session solved a problem he did not report, and took
away the ability of any session to end a conversation.

**Standing consequence:** a change that narrows or widens which sessions the loop governs is a change
to this ruling and needs Wyatt, not an audit recommendation. Any session proposing one must cite this
entry first.

**What he has chosen, why, and when — so nobody asks him twice.** Newest at the top.

This is not the rulebook (`.claude/CLAUDE.md` — how to work with him) and not the work record
(`.planning/CTO-LEDGER.md` — what happened). **This is the list of things he decided**, and the
reason each one was decided that way. A decision nobody wrote down is a decision he has to make
again.

**Append here the moment he rules on something.** Date it, quote him where you can, and say what
the alternative was — the alternative is what makes it a decision rather than an instruction.

---

## 2026-09-01 — THE RELAY REDESIGN: sixteen answers in one sitting

**Context.** After the Bosun/Quartermaster/Watchdog degradation — his words: *"all three of those
have bugs and seem to be breaking"* — Wyatt asked for 10–20 questions and then a redesign. All
sixteen answers came through the question UI on 2026-09-01, informed by the two post-mortems
(`.planning/HANDOFF-2026-09-01-WYCLAU-DEBUG.md`, `.planning/wyclau/REDESIGN-BRIEF.md`). Each ruling
below names the alternative he did NOT pick, because the alternative is what makes it a decision.

1. **First priority: autonomy that SHIPS FIXES.** Unattended hours must turn into shipped game
   improvements, not instruments. *(Over: instructions-first, Glass trust, phantom sessions — all
   still get fixed, but this is the one the design optimizes for.)*
2. **What "degraded" meant, verbatim:** *"The system we designed, where everything is shown to a
   CEO, and every turn from the quartermaster ends with it teaching me something, was lost. the
   quartermaster sometimes forgot my instructions; the bosun repeated the same mistakes."* The
   CEO-per-item and daily-teaching guarantees are the things he misses, not optional extras.
3. **Radically simplify.** *(Over: repair the three-role design in place, or pause autonomy.)*
4. **The 24/7 engine stands, as chartered.** *(Over: autonomous-only-when-away, or none.)*
5. **The engine is a RELAY OF FRESH RUNS** — one item per run through the full loop (fix → measure
   → CEO → record → Glass), then the run ENDS; the scheduler starts the next minutes later,
   forever. *(Over: a better-guarded long-lived session, or a hybrid.)* **Consequence he accepted:
   ~2 minutes of re-orientation per run. Consequence for the record: the keep-working Stop hook is
   DELETED when the relay lands** — the hook-scope ruling at the top of this file becomes moot at
   that moment (no hook, no scope); until the relay lands it stands unchanged.
6. **Instructions go to ONE TRACKED INBOX.** His words land verbatim in a queue file; the next
   engine run must read it FIRST and work his items before anything else. *(Over: talking to the
   engine session directly — the arrangement that just failed.)*
7. **THE TEETH** (multi-pick, one his own write-in):
   - **His stated solution is tried FIRST**, implemented and measured before any investigation or
     tooling; disagreement is allowed only after showing him the result of his version.
   - **Every run ends in a game-code diff or a one-line reason** led at the top of its report, and
     the reason is CEO-reviewed like work — "built a tool" stops counting as a day's work.
   - **His write-in, verbatim:** *"If a tool doesn't work, the next strategy must be to take a
     screenshot/verify the way I would — by looking at and measuring the actual game."* Never a
     second tool after a failed tool.
   - *(Offered and NOT chosen: a hard one-instrument-per-bug cap — he replaced it with the
     look-like-I-would rule.)*
8. **The Quartermaster is DISSOLVED: his window IS the advisor.** Whatever session he opens is a
   fresh advisor — reads the record, answers strategy, teaches as it goes, writes his instructions
   to the inbox in the same turn. Auditing belongs to fresh-context CEO agents per item. *(Over: a
   standing QM restarted daily, or folding advice into reports.)*
9. **What broke Glass trust: STALE, BROKEN, and WRONG.** He did NOT pick "my writes went nowhere"
   — harvest lag was not his complaint.
10. **The Glass: REBUILD THE FULL INTERACTIVE VISION.** *(Over the recommended boring status
    board.)* **Decisions happen ON THE GLASS, tap to rule** *(over batched question-UI rounds)*,
    and **the daily lesson lands ON THE GLASS** *(over the daily report)*. The Glass is confirmed
    as THE interface; its reliability is the redesign's hardest engineering, treated as such.
11. **The sail square is fixed NOW, in parallel** with the redesign — a separate session implements
    his stated camera-zoom solution with a posed before/after pair. *(Over: redesign first, or
    square first.)*
12. **The release push is the new engine's FIRST JOB** — the 539-commit branch through a trial that
    survives session death → staging → his play → merge, as the shakedown cargo. *(Over: babysit a
    trial by hand today, or wait until the system settles.)*
13. **Redesign timebox: TWO DAYS, HARD FENCE.** Day 1 the relay + inbox + truthful minimal Glass;
    day 2 the interactive Glass rebuild. Anything unfinished is cut to ordinary Chart items.
    *(Over: one day, or as-long-as-it-takes.)*
14. **Trust bar: a MEASURED 48-HOUR SHAKEDOWN** — zero phantom sessions, zero eaten conversations,
    Glass never older than one run and never wrong on spot-check, every closed item carrying a CEO
    verdict — numbers reported honestly, then HE judges. **This supersedes the 24-hour exit test as
    the rulebook-cutover gate** — the question named that consequence explicitly and he picked it.
    *(Over: a week of normal use, or "it ships the release" as the sole proof.)*

### Addendum, same day — the four rulings that started the build

1. **Day 1 is green-lit as designed** — the published design (artifact `8c855d0c`) is the plan of
   record, with CEO Review 65's two faults carried in as day-1 requirements (a close-out script
   enforces the CEO gate; the same script checks a run's first diff against his stated solution).
2. **He disables the old watchdog himself, now** — Task Scheduler on the Blade. *(Over: leaving it
   running through the rebuild.)*
3. **The Blade hour is TODAY** — the Bell install and the O2 publish test close day 1 on the Blade
   itself. *(Over: tomorrow, or at shakedown start.)*
4. **THE NAMES ARE HIS PICKS: the WATCH (the engine — a relay of fresh runs) and the BELL (the
   scheduler that rings a new watch when none is on deck).** "Bosun" retires with the role.
5. **THE TRADE FAN STAYS.** Ruled ON THE GLASS (tap-to-rule's first real use), 2026-09-01
   14:16:56Z, his note verbatim: *"Don't touch the trade fan, it's fine."* The trade-response
   menu keeps fanning around the chooser; the anchored-on-named-boats rule governs the battle
   call and the attack menu, and the difference is HIS chosen exception (rule 8's sanctioned-
   exception form). Do not re-open as a consistency patch. *(The alternative — anchoring trade
   answers on responders' boats — was recommended against and he agreed.)*
6. **HE IS "THE CAPTAIN", NEVER "CHAIRMAN".** His words, 2026-09-01: *"I feel weird when you call
   me Chairman, it reminds me of Chairman Mao. Can you call me Captain instead, without that
   getting confusing with our game terminology?"* The disambiguation that keeps it clean: inside
   the game world, lowercase "captains" are the players (game copy untouched); on system surfaces
   outside the game world — the Glass, reports, docs, the same boundary as the credits rule —
   capital-C **the Captain** is Wyatt. "The chairman's log" (charter term, 2026-08-30 org era) is
   renamed **the Captain's log** everywhere it appears. *(The alternative — keeping "chairman of
   the board" from the org design — is struck at his ask.)*
7. **The wider sail-prompt framing is APPROVED as-is** — staging checklist 2026-09-01, item 5
   ("YER CALL, not a defect: judge the wider camera itself") marked PASSED with items 1–4. The
   taste question the fix raised is settled; do not re-open it as a patch. Any future tune is a
   one-place change to the containment pass's derived margins, on his ask only.

---

## 2026-08-31 — THE THREE DOORS, and the two names that make them sayable

**Wyatt asked, verbatim:** *"i only ever will write to you, not to Blade Pirates ('Bosun') -- is
that right?"* **The answer is NO, and the reason is the decision.**

**Two names first, both his calls this evening:**

- **THE BOSUN** — the Claude worker on the Razer that the watchdog rouses and that works the
  Chart. *"The engine"* now means `src/engine/`, the game's seeded simulation, and nothing else.
  He weighed **the Deck** — a good instinct, since the Glass, the Chart, the Helm and the Door are
  all objects and Deck belongs to that set — and chose the person-noun because those four are
  surfaces HE acts on, while the worker is the system's only ACTOR, and every sentence the ledger
  needs is a verb of agency: stalled, was revived, claimed item 3. A deck does none of them.
- **THE QUARTERMASTER** — the advisory session (cloud): measures, reports position, asks him the
  decisions, keeps the log, relays. On a pirate ship the quartermaster is elected by the crew,
  keeps the record, and is the standing check on the captain — which is this project's CEO-and-
  ledger culture in one word. He weighed **Mentor** (his own first idea) and set it aside because
  a live `mentor` skill already coaches his framing, so "the Mentor" would have been ambiguous
  with a Mentor note; **Navigator** and **Pilot** were the other two offered.

**THE THREE DOORS — one place the work is RECORDED, not one place he types:**

| When he wants to… | He writes to | Why that one |
|---|---|---|
| **Rule on a question, or drop an idea** | **the Glass** | The durable channel. Rulings and ideas are both harvested to the Chart, and a hook blocks a session from republishing until it harvests — because he once ruled there and nobody picked it up for an hour. Survives every session dying. |
| **Redirect the work, now** | **the Bosun** | It is the worker, on the machine that can see the game. Shortest path from his intent to a change in what is built. |
| **Think something through, audit, ask "what is this?"** | **the Quartermaster** | Questions, second opinions, measurements against the record — the work that is not a Chart item. |

**THE RULE UNDER ALL THREE:** *anything that matters lands in the repo — the Glass, the Chart, the
ledger — never in a chat window.* Whichever door he uses, the ruling is written down or it did not
happen.

**AND THE ONE ARRANGEMENT TO AVOID, which is what he was proposing:** the Quartermaster must never
be the ONLY path to the Bosun. It runs in a cloud container; everything it holds that is not
committed dies when that container is reclaimed — which is exactly how Cloud: Edits lost its
first-person account earlier the same day. A relay also adds a translation step, and on 2026-08-31
that step handed him **two stale premises** (a PR that had already landed, an audio defect already
fixed at the cutover). His terminal window is the fallback that cannot be taken from him.

*The alternative — funnel everything through one advisory session — is tidier to think about and
strictly more fragile: one container reclaim and he is locked out of his own engine.*

---

## 2026-08-31 — ONE PLACE TO SEE AND DECIDE EVERYTHING (the Helm is retired)

**Wyatt, 2026-08-31, verbatim:** *"finish the Helm fold-in — the decision cards live inside Glass
v2, not linked beside it. My words: one place to go to see and decide everything."*

**Done.** The Glass (https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2) now
carries the decision cards itself — **derived from `.planning/CHART.md`'s BLOCKED ON WYATT table,
never hand-typed** — plus a "Your rulings, in hand" section derived from the Chart's RULED table.
The Helm URL now serves a retirement notice pointing at the Glass, with his five rulings
preserved on it. *The alternative — linking the two pages — is what we had, and it lost his
answers for an hour.*

**THE MECHANICAL RULE THAT COMES WITH IT, and it is his:** a self-publishing page must select its
own assets **by id, never by tag or position** — the artifact host injects its own reset
stylesheet first, and the Helm once rebuilt itself around that reset and lost its entire
stylesheet on the first tap. Full story: `docs/HARD-WON-LESSONS.md` §12k.

## 2026-08-31 — FIVE RULINGS HE MADE ON THE HELM AT 17:02–17:10Z, HARVESTED LATE

**He answered all of these on the page, and no session read them for over an hour.** Wyatt,
2026-08-31: *"i answered all of those questions already, multiple times, on the other version of
the helm."* The answers are his, recorded verbatim from the Helm's own state block:

| item | HIS RULING | when |
|---|---|---|
| **audio-defect** — the 8s full-volume storm per ship | **"Yes — delete the line"** | 17:02Z |
| **pass-and-play hand-over** — move it ahead of the turn? | **"Just move it"** — NOT "build both behind a switch"; he does not want the A/B, he wants the change | 17:08Z |
| **decider-scope** (one-director step 5) | **"Narrow half"** — the three drawing branches behind the Decider; leave the two questions as two | 17:09Z |
| **plan-doc** | **"Yes — make the measured table the plan of record"** — the tree wins over the document | 17:10Z |
| **cutover-moment** (the rulebook/memory/pruning swap) | **"After the exit test verdict"** — the 24-hour no-silent-stall test finishes first | 17:10Z |

**THE FAILURE THIS RECORDS IS OURS, AND IT IS THE ONE THE RECORD KEEPS NAMING: a question
answered somewhere nobody harvests is a question still open.** The Helm saved his taps
correctly; the Glass went on printing "Blocked on Wyatt (6)" while five of the six were ruled.
*The fix he asked for in the same breath: fold the Helm's clicking-and-commenting INTO the
Glass — one page, and the harvest hook already guards it.*

## 2026-08-31 — THE GLASS IS THE INTERFACE, SERVED AS AN ARTIFACT, HOMED IN CLAUDE-KIT

**Wyatt's vision, his words:** *"it becomes our interface. I can write ideas and feedback to you
directly there, i can see charts and reports about your progress, all in one graphical tool."*
His platform pick (recommended option, 2026-08-31): **the interface stays a private Claude
Artifact** — using the page's ability to save new versions of itself so his writes wake sessions —
**and all wyclau source code homes in the claude-kit repo now** as the kit's first module.
*Alternative rejected for the private interface: GitHub Pages from claude-kit — public by nature
and no write path without Issues/Firebase glue. Reconsider Pages at launch, as the game's PUBLIC
player-facing status page.* Glass v2 (the ideas/feedback box) is scheduled for after the Razer
hour, same day.

## 2026-08-31 — THE WYCLAU CHARTER IS IN FORCE

**Wyatt approved the charter verbatim:** *"Charter is approved with only one correction: I learn
fast, so I want learnings or lessons every day, not once per week."*

**Say "the charter" and any session must resolve it to
[`.planning/wyclau/CHARTER.md`](../../.planning/wyclau/CHARTER.md)** (canonical; the published copy
is https://claude.ai/code/artifact/5e6f19bf-654b-4d27-9563-597ef8f55d7b). Its seven principles and
seven parts govern how work runs; its interview rulings
([`.planning/wyclau/INTERVIEW-2026-08-30.md`](../../.planning/wyclau/INTERVIEW-2026-08-30.md))
answer questions before they are re-asked. **The amendment: one short lesson per DAY, tied to the
live work** — the alternative was weekly, and he struck it because he learns fast.

*The alternative to the charter was continuing the accreted process it replaces; his founding note
(`.planning/wyclau/WYATTS-NOTE-2026-08-30.md`) records why that was rejected.*

## 2026-08-30 — the organisation

**THE ONE-DIRECTOR PLAN — the handle for the engine rebuild.** Wyatt, 2026-08-31: *"where is that
plan saved, and how can i reference it again in a way that you'll know what i'm talking about?"*

**Say "the one-director plan" and any session must resolve it to:**
[`.planning/architecture-one-director.html`](../../.planning/architecture-one-director.html) —
published, tappable, at **https://claude.ai/code/artifact/715b29fe-fe33-4038-9e61-a20ef6676570**
(same URL on every republish; it is titled *"One engine, one director"*).

**It has ten sections (00-09) and its migration is SIX STEPS, in section 07.** Progress is measured
against those six and nothing else, so "how close are we" always has a denominator.

**ONE SHORT REPORT AT THE END OF A RUN — NOT A WALL PER STEP.** Wyatt, 2026-08-31: *"don't bog me
down with all of your wall of text. I don't want to read it. I want to read one short report at the
end of a long run of work that shows what worked, what you learned (and wrote somewhere durable),
and what you are now working on next."*

**Three parts, in that order: WHAT WORKED · WHAT I LEARNED, and where it is written down · WHAT IS
NEXT.** Corrections belong inside "what I learned", not as the headline and not as a running
commentary — he had just told me the running-correction stream made him lose faith while the branch
was in fact shipping.

**This tightens rule 3 rather than replacing it.** Plain English and the SIZE still stand; what
changes is CADENCE and SHAPE. Work quietly through a long run, surface only genuine questions and
real-time blockers as they arise, and report once at the end.

**NEW INFORMATION ONLY. A SECOND RECAP IS MUCH SHORTER THAN THE FIRST.** Wyatt, 2026-08-30, after
reading back through a run: *"you tend to verbosely repeat yourself multiple times when reporting
back to me. This isn't necessary. Please only state new information to me. And if you need to recap
something, recap it much shorter the second time."*

**This does not loosen rule 3 — it sharpens it.** Plain English with the size stated is still the
bar; saying the same thing three ways is not thoroughness, it is a reply he has to search for the
new part of. **The one thing worth repeating is a correction of something already reported wrong.**

**A TURN MAY NOT END ON AN OFFER.** Wyatt, 2026-08-30, after catching a stalled run himself:
*"don't end on offers -- keep going."* The session had closed with *"Starting the checker now unless
you want the tester first"*, spawned nothing, and sat idle until the container was reclaimed.

**He asked for it structurally, not as a rule** — *"change the /team code structurally to ensure
this does not happen again"* — so it is a Stop hook (`.claude/org/hooks/no-idle-offer.cjs`) that
blocks a turn whose closing sentences offer to do work, plus a `/team` change that moves the
sequence off the bridge and onto the leads. *The alternative, which is what this project has done
every previous time, was another paragraph in a file. Its record is poor: every rule in CLAUDE.md
is there because a written rule was not enough on its own.*

**The line that lets the rule be absolute:** a genuine question goes through the question UI, which
does not stop the run. So an offer written as prose at the end of a turn is the wrong shape whether
or not work was outstanding — and the hook does not have to guess which.

**Not added as a 28th CLAUDE.md rule, and that is a judgement worth overruling if he disagrees.**
CLAUDE.md says in its own words that a list which reads longer than it is dilutes every line in it,
and the hook fires on every turn in every session rather than only inside a `/team` run — so the
coverage is already complete without a new row.

**The org is CEO, CTO, EA, and a crew.** He is the **chairman of the board** *(title struck 2026-09-01 — he is the CAPTAIN now; see the relay redesign addendum ruling 5)*. The **CEO** manages
long-running work and holds the CTO accountable — judging whether something got built is one part of
that, not the whole job. The **CTO** is the marathon worker that runs development. The **EA**
(*executive assistant*, renamed from "shift worker" on this date) keeps the long-running worker
honest. The **crew** does the engineering.

**The CTO delegates; it does not do the engineering itself.** *"Just like a CTO doesn't do the
engineering work themselves in the real world."* Six narrow role cards, and every task runs
**measure → build → check → see → sweep**.

**Durable memory, disposable instance.** He asked for a long-running CEO that accumulates memory;
the counter-proposal was that memory lives in files and each instance is fresh, because an agent
that inherits the CTO's reasoning inherits its blind spot. **He took the counter-proposal.**

**One plugin, not two.** Officers and crew merge — the split was historical, not designed, and it
was why he had to ask what the difference was.

**Vendor everywhere, gated in `npm test`.** The alternative — plugin on the laptop, copy in the
cloud — is two copies kept in step by hand, the exact fault removed from the game engine the same
day. One copy per repo, and the build fails if someone edits it.

**This repo keeps its own production fence**; the portable one is not shipped here. Declared with a
`fence:` key in `OFFICERS.md` so it is a mechanism rather than a memory.

**A question NEVER blocks a run.** *"whenever it has a question for me or a problem for me... it
should ask me or flag that for me in real time, but then it should continue with its work with any
other work that it can while it's waiting."* This replaced both options offered — stop after three
failures, or park silently. **His reasoning killed the objection outright: "I would be sleeping, so
this seems like a moot point."**

**The CEO may re-order and de-scope, never add** — **but bugs it notices go on a list he approves in
the morning.** His own improvement on a binary that was put to him badly: discovery gets captured
without silently becoming work he did not ask for.

**Never stop overnight — park the bad item and move on**, over the recommended three-strikes halt.
The risk he accepted: a run can spend the night on the easy half of a list. The mitigation that fits
inside the ruling: **a parked item leads the morning report, ahead of what was finished.**

**Memory scope: shared lenses, per-project memory, one thin cross-project file** carrying only how
he likes to work.

**A daily brief at 8am**, pushed to him rather than waiting to be asked.

**Cost is not a constraint.** He has Claude Max and is not near his usage. **The reason to run fewer
builders is file collision, which is a different argument and still holds.**

## 2026-08-30 — the game

**Solo and pass-and-play are IN SCOPE for the one-engine work.** He struck a fence that had put them
outside it: *"otherwise everything starts to fork and fall out of sync again."*

**Mode differences are legitimate in exactly three places** — how an answer is obtained (the
Decider), how the script is played (rate, never content), and the shell around the stage. Everything
else that differs by mode is a fork.

**End the voyage early when nobody else can finish** — the engine asks each day who could still
reach Tortuga with a full hold, and captains grey out as they fall out of the running. Chosen over
ending silently and over capping the tail. *Reason: it turns dead time into a scoreboard.*

**End of Voyage: freeze the card, scroll only the award list inside it, and add a button at the top
that shrinks the whole card so the board is visible.** The current version fails because two things
move at once.

**Multiple bakers: honour every captain who baked**, name their recipes, and say why the winner won.
His wording, to be used as written.

**Never touch bubble placement without a posed comparison** — same seeded prompt, before and after,
two screenshots. *Cost of learning it: a whole night, three probe runs and three 85-minute trials
that settled nothing.* Now rule 26.

**Any HTML handed to him is a published, tappable link — never a repo path.** Now rule 27.

---

## Older rulings not yet migrated here

**They exist and they are binding.** They live in `.planning/CTO-QUESTIONS.md` (answered questions,
including a block he answered from his phone on 2026-08-29) and in `.planning/BACKLOG.md`'s rows.
**Migrate a ruling into this file the next time you touch the item it governs** — a big-bang
migration would be a day of copying with nothing verified, and copies made in bulk are the ones that
turn out wrong.
## NO RIPPLE RING IN THE OVENS — Wyatt, 2026-08-31

**His words: "no ripple ring in the ovens."**

The active-turn ripple must NOT move to the captain who has stepped up to bake. It stays with
whoever last took the wheel — i.e. the walk that drives it counts only `turn` events
(`TURN_ONLY` in `src/shared/storyboard.js`), never `ovens` or `bake`.

This closes the open design call recorded at `src/shared/storyboard.js:39` and
`src/ui/board.js:1768`. **It is not a patch to guess at again** — any future "should the ring
follow X?" for the bake is already answered.

**CONSEQUENCE, found while recording this:** the ring is drawn from TWO places that currently
disagree. `board.js:1532` (`activeTurnSeat`, used by the live-ships path) passes `TURN_ONLY` and
already obeys the ruling. `board.js:1776` (render's own) passes the DEFAULT, which includes
`ovens` and `bake`, so on that path the ring does follow the captain to the ovens. Read from the
code, not yet measured on screen. Under this ruling the second one is wrong and must pass
`TURN_ONLY` too — and under rule 23 the deeper fault is that one visual had two answers at all.

## ONE ANSWER TO "WHOSE TURN IS IT" — Wyatt, 2026-08-31 (SUPERSEDES the ruling above)

**His words: "rings follow active player the whole game with no exception including during bakeoff.
Consistency is a design value."**

**This replaces "no ripple ring in the ovens", made earlier the same day.** He reversed it after
being shown that his two rulings had split three surfaces — the ripple ring, the captains-box
highlight and the pass-and-play row order — between two different answers.

**What it settles, permanently:** there is ONE rule for whose turn it is, `TURN_ESTABLISHING`
(`turn`, `ovens`, `bake`), and every surface reads it. During a bake the captain at the ovens is
the active player, so the ring is on their boat, the box lights their row, and the row order floats
them to the top. It also settles T-09 (2026-08-26) in the same breath.

**And the vocabulary for the divergence is DELETED, not deprecated.** `TURN_ONLY` is gone and so is
the `establishing` option — with one rule there is nothing to pass, so no future caller can express
the split. That is the strongest form of rule 23 available: not two things kept in step, one thing.

**Do not reopen this as a patch.** Any future "should X follow the baker?" is already answered: yes,
like everything else.

## MERGE 465 COMMITS TO MAIN, VIA THE NORMAL RELEASE LOOP — Wyatt, 2026-08-31 23:39:57Z

**Ruled on the Glass, "Do it".** In response to the discovery that `claude/cloud-handoff-planning-
a9ay1u` sat 465 commits ahead of `main` with nothing merged since 2026-08-26 — five days of real
work, including the entire Bosun/Glass/Stop-hook system, never reaching real players.

**What this authorizes, exactly as recommended:** sea-trial the branch at FULL gear (confirmed by
`gear.mjs` — real engine/UI files diverged, not just docs), deploy the result to staging for him to
play, then merge to `main` on his say-so once he has played it. **Not a blanket pre-approval to
merge without his final look** — the ruling is on the PROCESS ("do it" = run the normal release
loop), his approval of the actual merge still comes after he plays staging, per CLAUDE.md §6's
standing release process.

**Do not re-ask whether the branch should be trialed and staged — that part is settled.**
