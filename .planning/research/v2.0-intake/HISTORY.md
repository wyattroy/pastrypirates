# RESEARCH 1 — The development history of `/4`

Reconstructed entirely from git history (65 commits touching `4/`, plus 47 in `v2/`, 27 in
`v2bakeoff/`, 9 in `3/`), from `4/RULES-V2.md`, and from the root `RULES.md` /
`Rules_boardgame.md`. No repo file was modified.

Repo state at time of writing: `main == origin/main`, both directions zero. HEAD is
`a191366` (2026-08-15), which is itself a `/4` commit.

---

## 0. One correction to the framing, up front

`/4` is **not** a two-week prototype. It is **five days** — first commit
`511c427` on **2026-08-11**, last commit `a191366` on **2026-08-15**. The whole
`v2 → v2bakeoff → 3 → 4` lineage is **eleven days**, 2026-08-05 to 2026-08-15.

The other thing worth knowing before anything else: **the root v1 game has had no code
commit since 2026-08-02** (the last touch of `index.html`/`src/` was the shared usage-ping
work on 2026-08-10, `dc56e2c`, which landed in every build at once). Every line of
development for the last two weeks of the project's life went into the prototypes. `/4`
is not a side experiment that grew — by the end it *was* the project.

---

## 1. Lineage timeline

| Build | Alive | Commits | What it was | Why superseded |
|---|---|---|---|---|
| **`v2/`** | 2026-08-05 → 08-10 | 47 | The **new ruleset**, as a standalone solo build | Forked, not abandoned: the bake-off work was moved out to keep `v2/` a clean control arm |
| **`v2bakeoff/`** | 2026-08-08 → 08-10 | 27 | `v2` **+ the bake-off minigame** + the bot-principles work | Superseded by `/3`, which copied it verbatim |
| **`3/`** | 2026-08-09 → 08-10 | 9 | `v2bakeoff` verbatim + the **v3 "race planner" bot brain** | Superseded by `/4`, which copied it verbatim |
| **`4/`** | 2026-08-11 → 08-15 | 65 | `/3` verbatim + **the entire visual/interaction redesign ("the stage")** | Current. HEAD. |

Each generation is a **verbatim copy of its predecessor plus one axis of change**, and every
commit message says so explicitly. That is a deliberate method, not an accident.

### v2 — the ruleset (2026-08-05, `02cb5e7`)

> "A full copy of the game under v2/, implementing the 13-rule v2.1 ruleset. v1 at the repo
> root is untouched — v2 shares ../assets and ../sfx rather than duplicating 19MB, and
> deliberately carries no CNAME/robots.txt/sitemap.xml."
> — `02cb5e79b4eb4feeaeac0b9829c06a944125e0c0`

Specified "across **62 questions**" to Wyatt (`4/RULES-V2.md` line 4: *"Every line below is
Wyatt's answer to a clarifying question, 2026-08-04"*). Firebase stripped, `src/net/` left
on disk unused "so multiplayer can be revived by restoring them". Built **outside GSD by
explicit instruction** — `RULES-V2.md` line 14: *"Built outside GSD by explicit instruction;
notes live here, `.planning/` untouched."*

The bulk of v2's 47 commits is **weather UI** (the storm-forecast chip went through four
rejected designs on 2026-08-05 alone), **the 50 hand-written sea creatures** (`fd00b87`,
`a09dd88` — Wyatt wrote all fifty himself on 2026-08-06), and **storm simplification**
(`fe4f62f`).

### v2bakeoff — the minigame (2026-08-08, `18d24e7`)

Split out at Wyatt's request:

> Wyatt: *"Can you make the branch a new part of main at /v2bakeoff (leaving v2 intact?) and
> allowing me to play it?"* … "`git diff origin/main -- v2/` is empty, so merging this can
> only ADD a directory."
> — `18d24e7f6e6524b45ac0f6a44fdd1747618c7ebe`

The bake-off itself is a **memory/sequence minigame**: 21 real five-step recipe orders
(`d0692de`, `shared/recipe-steps.js`), bowls shuffled on a bench, you tap them back in
recipe order. Bot fallibility is modelled per-bowl (`t = 0.28`, tuned on a 40k-trial sweep)
specifically so bots produce *near misses* — "four of five, so close" — rather than clean
wins or noise.

v2bakeoff is also where the **bot design principles** were written down
(`227c8cc`, `36ca75a`, `1db7274` → `docs/BOT-DESIGN-PRINCIPLES.md`) and where
`docs/WINNING-STRATEGY.md` came from (`39d00f7`).

### 3 — the bot brain (2026-08-09, `1e03949`)

> "playpastrypirates.com/3 is where the v3 bot brain will live so it can be played side by
> side against /v2bakeoff. This commit is the untouched copy — every /3-specific change lands
> separately so its diff stays readable."
> — `1e039497a1811cae052e0a52c12927c255992ff7`

The change is one commit, `8eb1a95` — the **race planner**. It replaces "minimise MY expected
turns on a frozen board" with `P(win) = ∏ σ((ETA_rival − myFinish + BIAS) / SPREAD)`. Curve
constants **fitted by MLE on 27,867 observed outcomes**, not tuned. Verdict on a 400-games-
per-row ladder: **+10.2** on the dev seed family, **+6.8** held out.

Only three more `/3` commits followed, all animation legibility (`8b614a2` the followable
shuffle, `1e1779f` doubled wind dots, `8b668d8` arcing crates) plus one real bot fix
(`0445368`, "never anchor").

### 4 — the redesign (2026-08-11, `511c427`)

> "A verbatim copy of /3 wearing the new shell, solo only … Render-side only: engine, RNG and
> dlog untouched."
> — `511c4270391cc84df190f94531a41c966cd11978`

It began as a *pure presentation layer* over `/3`'s engine, and then — over 65 commits — grew
real rules of its own (the black market, crate counter-offers, the trade-wind current, the
routed sail animation, the whole Pass & Play ceremony). By the end it is not a skin.

**Authorship note:** the first 25 `/4` commits are attributed to *Claude Fable 5*
(2026-08-11 → 08-13), the last 40 to *Claude Opus 5* (2026-08-13 → 08-15). The handover is
visible in the commit-message style: earlier ones are terse punch-lists, later ones are long
measured essays.

---

## 2. What `/4` actually is — the game, in plain language

`/4` is the same board, ships, islands and recipes, but **six rules changed and one whole
screen was thrown away.**

### The rules that changed (v1 → v2.1 ruleset, all now in `/4`)

Source: `4/RULES-V2.md` vs root `RULES.md` and `Rules_boardgame.md`.

| | **Live v1 game (root)** | **`/4`** |
|---|---|---|
| **Sailing cost** | Costs **1 coin** every time. No coins, no sailing. A 9-point budget: 2 pts downwind, 3 across, 4 upwind. An island upwind cuts you to 7. | **Free, always.** Move **4 squares**; the moment any single square of the route goes upwind the *whole* move drops to **2**. Crosswind is not upwind. **The "lee" rule is deleted** — an island upwind does nothing. |
| **Fishing** | An action: flip for 2 coins or a candycrab. | **Removed entirely.** Replaced by **Pass**, which can never be greyed out — a turn must always be endable. Passing narrates one of **fifty hand-written sea creatures**, in a fixed order Wyatt set, and **the lineup persists on your device across games** so you work through all fifty over many voyages. |
| **Docking** | Heads = a free crate. Tails = 3 coins, or pay 3 to buy the crate. | **No free crate ever.** Heads = **6 coins** (treasure), tails = **2** (dockhand work). Then you may buy, same turn, with the coins you just earned. |
| **Crate price** | Flat 3 coins. | **6 − (crates left on that island)** — so 3 left costs 3, 1 left costs 5. Prices rise as an island empties. |
| **Battles** | First to **3 points**, multiple rounds, "fire the broadside" re-flip. Loser gives a crate **or 5 coins, loser's choice**. Then the two ships **swap places**. | **One round.** Heads beats tails. **Both heads → the downwind ship wins.** Both heads crosswind, or both tails, → the attacker may pay **2 coins to re-fire**, repeatable; declining makes the battle **null** (nobody gains). Prize is **one crate, winner's choice — no coin alternative, no place swap**. You cannot attack an empty hold. |
| **Storms** | ~15% of rounds, 2 squares + spin + 2 more. Moored ships safe. Smashed into an island → pay 1 coin to dodge, or flip: tails costs half your coins / a crate / your turn. | **20% of rounds.** One direction, **3 squares, everyone at once, before anyone acts**, resolved downwind-first. The whole land rule collapses to one sentence: **"Land and other ships stop ye short."** Nobody ever loses a turn to weather; docks need no special rule. |
| **Trade** | Hail any one captain and deal. Both sides get a **+1 harbor-tax bonus coin**. | **Table-wide.** You announce *what you want* and *what you offer* to everyone. Every holder answers **accept / deny / counter-offer**; you see all answers together and pick one or walk. **One round only. No bonus coin.** |
| **Battle calls** | (not a v1 rule) | Any non-combatant anywhere may **call the winner, free**. Correct = **+2 from the bank**. Bots call too. A null battle pays nobody. |
| **Raiding** | Tortuga/Barbados berths were effectively safe. | **Every dock is raidable, including a captain who has already finished** — and **stealing a recipe crate un-bakes them**: they re-enter the rotation and must go replace it. |
| **Winning** | First home fires the ovens; if several make it, a **BAKEOFF** (flip to 5). | Per `RULES-V2.md` §12: *no bakeoff*; Best Baker on crates, then coins, then who got home first. **⚠️ This is stale — see §5.** In shipped `/4` there **is** a bake-off, and it is a memory minigame, not a coin flip. |
| **Wind forecast** | (not a v1 rule) | The compass shows this round's wind **and** next round's forecast. When a storm is coming it says *that* but **never which way it will blow** — the direction slot becomes an arrow that never settles. |

### The redesign — what `/4` looks like

- **Full-bleed board with a camera / "director".** The board fills the screen. The camera glides
  to whoever is speaking, frames your whole legal-move window when it's your turn, pulls out wide
  for a storm, and holds on both combatants during a fight. Pinch/pan overrides it until the next
  turn.
- **The narration box is gone.** Lines appear as **speech bubbles tailed to the ship that is
  speaking**, or floating over open water for table-wide news. They type themselves in.
- **The yellow action box is gone.** Choices **bloom as circular buttons around your own ship**,
  in a straight staggered fan on whichever side has the most clear water, with the question on a
  compact pill above. Big things (recipe compare, bake-off, ceremonies) take **centre stage** —
  the sea dims and one card sits dead centre.
- **Ceremonies.** Coin flips, the turn-order draw, the hand-off between players in Pass & Play,
  and the first time an island's shelves go bare all play as dimmed centre-stage beats.
- **Hold the sea to peek** — press and hold anywhere on the water and every floating box fades to
  13% so you can see the board underneath.
- **Ships sail their actual legal route** around islands, not a straight line through them.
- **The trade winds visibly flow** — 36 arrows drift clockwise around the rim, 4 whirlpools spin.
- **⏩ Fast-forward** through bot turns (solo only), with a one-line recap of what you missed.

### New rules `/4` added on top of the v2.1 spec

- **The black market** (`348ccf4`, `6c1117d`, `8229385`) — a sold-out island always has one more
  crate, for a flat **10 coins** *or* **any 2 crates from your hold** (duplicates allowed; the two
  crates leave the game permanently).
- **Counter-offer with a crate** (`c8e2937`) — you can answer "keep yer coin, I want yer milk"
  instead of only "+k coins". Bots got the same move.
- **Pass & Play restaged** (`6a34d879`) — recipes stay strict-secret between turns, hand-off is a
  centre-stage ceremony, "play again" is a rematch with the same crew.

---

## 3. Decision ledger — design decisions that live ONLY in commit messages

**These are the at-risk items.** `4/RULES-V2.md` has not been touched since 2026-08-07 (§5), and
`.planning/` contains **nothing at all** about `v2`/`3`/`4` — the prototypes were built outside
GSD by instruction. Everything below exists in exactly one place: a git commit body.

### 3a. Rulings by Wyatt, recorded nowhere else

| Decision | Commit | Quote |
|---|---|---|
| **Hail volume is the spam metric, not hit rate** | `56bbce1` | Wyatt: *"We dont want the table continuously spammed with shitty trade requests, it's exhausting for players to swat them away."* Working figure settled at **~2–3 hails a game**. |
| **No constants may drive bot behaviour** | `56bbce1` | Wyatt: *"We also dont want constants to drive the hail behavior, because the game is always shifting!! The bot should calculate an offer that it would accept, and offer something close to that."* |
| **The arc is for actions only** | `c8e2937` | Wyatt: *"Keep the arc logic consistent by having all the buttons that are in the ark actions. Move the plus minus coins out of the arc instead and style those differently, potentially with a slider."* This is a **general layout law**, stated once, applied everywhere. |
| **Consistency is a core value** | `46df917` | *"any behaviour changed in one place must be swept across every surface it touches, with intentional exceptions named and recorded."* Added to `.claude/CLAUDE.md` — but the **list of the two sanctioned exceptions** (centre-stage intros and the flip ceremony stay solid under hold-to-peek) lives only here. |
| **Rather than remove a bot's ability, add it to the human's** | `c8e2937` | Wyatt's rule for closing bot/human capability gaps. Ran in both directions here. |
| **Trade-wind arrow opacity floor = .35** | `1cffd51` | His pick, offered against `.6` ("solid ring, subtle shimmer") and against a full fade. The ±42% slide is also his pick — *"it is what makes the ring read as carrying ships clockwise rather than a row of blinking signs."* |
| **A named exception to that floor: a 3% blink at each end of the cycle** | `65a368107` | *"Do not widen the 3% to smooth it further — that number is what keeps this a blink rather than the gap he rejected."* |
| **Whirlpool size 1.35× and spin 6s are SETTLED, not defaults** | `69e5be52` / `aa1ddd6` | *"A number nobody has recorded as chosen reads as a number nobody has thought about, which is how it gets quietly re-tuned."* |
| **"Bake this!" pill colour = `#f5a623`** | `2e84477` | Wyatt named it by pointing: *"the orange color that the circles around the docks that show when you select a recipe."* Ink `#3a2600`, border `#c9821a` — white fails contrast at ~2.2:1. |
| **Boats sail at half speed** | `7203f1b` | `SHIP_GLIDE_MS` 350 → 700, Wyatt's call, with every derived beat rescaled. |
| **Narration holds run 50% longer** | `62b9f32` | Wyatt: *"rush mode, can't read."* |
| **A routed sail takes the same total time as a straight one** | `4ea98c6` | Wyatt's pick — turn pacing must not change with route shape. |
| **Sail highlights sit BELOW the ships** | `c6db476` | Wyatt, 2026-08-02: *"i like the fact that the sail highlights and emoji pops are below the ships"* — carried forward into the `/4` z-order (`#sailHost` z2, ripples z3, ships z4). |
| **The sail-highlight bounce is approved and must be kept** | `6528299` → `c6db476` | *"juicy, bouncing, clearly clickable."* This is why the 60-layouts/sec fix moved the element type rather than dropping the animation. |
| **No ⏩ at a Pass & Play table** | `6a34d879` | His ruling: the skip is solo-only. |
| **The harbormaster 2-for-1 was specced and then CUT** | `348ccf4` | *"the black market serves the same purpose without deleting geography."* The black market exists **because** this was cut. |
| **Rim-square confirmation is a deliberate exception to one-tap sailing** | `ee1da10` | *"the confirmation is bought only where the square does something unseeable."* |
| **Battle result copy, verbatim approved** | `b07a7d2` | *"Both cannons land — but X fires downwind, and the wind carries the shot home. X takes yer cocoa."* |
| **Empty-hold battle-loss copy, verbatim approved** | `ee1da10` | *"Wyargh wins — but ye've nothing in the hold to plunder."* Deliberately drops the score. |
| **Wind hint pill wording, verbatim approved** | `a191366` | `⬇ CRUSTBEARD FIRES DOWNWIND — WINS TIES` |
| **Storm summary is one line for the whole table** | `b8e9eea` | Wyatt: *"Replace all post-storm narrations with one summary narration (reading the same message 4 times about different players is tedious)."* His example became the shape of the implementation. |
| **13 strings were explicitly approved on 2026-08-14** | `69e5be5` + `503fdc0` | Two batches: the four he was shown (*"Whirlpools look good, draft copy is fine, storm summary is good"*), then the nine he hadn't been — **approve all nine as written**. Both commits list the exact `@copy` ids. |

### 3b. Engineering decisions with reasoning that would be lost

| Decision | Commit | Why it matters |
|---|---|---|
| **The trade winds are HTML, not SVG** | `0283b5e` | An animated transform on an SVG child forced **~62 layouts/second — 97% of all layout work with the game idle**. Chrome never composites SVG transform animations and `will-change` cannot promote an SVG child. Measured by ablation with a layout-thrasher control at 59.7 layouts/s to prove the harness could see layout at all. Result: **0.0 layouts/sec, +4.2% CPU at a real 60fps.** |
| **Rotation and motion must be on DIFFERENT elements** | `0283b5e`, `aa1ddd6` | A keyframe transform silently overwrites a wrapper's rotation. Same class of bug as *"the compass chip whose CSS animation erased its SVG transform attribute."* |
| **Routes are straight segments, never a spline** | `4ea98c6` | A spline through cell centres **bulges outside a right-angled corner — and the corner it bulges into is the island the ship is sailing around**, re-introducing the bug it exists to fix. |
| **One search, not two** | `4ea98c6` | The drawn route and the legality rule are the same walk of the board (`sailStates` records parents; `sailPath` walks them back), so they cannot drift. Proved byte-identical over 1,920 computations. |
| **rAF raced against setTimeout, never replacing it** | `73120d7` | `docs/BOARD-RENDERING.md` §6 previously said flatly *"rAF is the wrong tool here"* — correct, because rAF is suspended in a hidden tab and an awaited rAF loop hangs the game. The fix **races both clocks**: whichever is alive wins. The doc was updated rather than contradicted. |
| **`CAM_HTML_LAYERS` is a list, not three consts** | `aa1ddd6` | *"Fixed as a LIST rather than by adding a third const, because that is the shape that failed."* |
| **`aria-disabled`, not `disabled`** | `c5e8790` | A real `<button disabled>` fires no click event, so a greyed circle could never be tapped to ask why. Creates a trap: `b.disabled` is now false on every prompt button, so `isDisabledBtn()` exists as the single shared test. |
| **`counterTerms()` is the ONE place a counter becomes a deal** | `c8e2937`, `69b9f23` | Three call sites read it; one was missed and silently executed the *original* trade after a player countered. `docs/TRADE-SYSTEM.md` §8 now tables all three. |
| **A layout read (`void el.getBoundingClientRect()`) that looks like dead code** | `6fb2629` | Style writes are batched; without the forced commit the "snap" animates. *"Deleting it as a useless read restores the bug in silence."* |
| **`voyageAground()` uses RAW DOM, no imports** | `65a3681` | *"The thing that failed may BE the render path; a surface that needs the broken machine is not a surface."* Also: **no retry, no resume** — a half-happened turn cannot be continued. |
| **Preload what a TIMED ceremony needs, not every icon** | `fcdcf34` | *"~90 images at boot would trade this bug for a slower start."* |
| **The bot may never read a rival's recipe** | `542c3cd` | `estimateCrateCost()` exists precisely so a bot prices from public evidence and **can be wrong** — *"Being wrong is what the counter-offer is for."* |
| **A hail reaches the WHOLE TABLE** | `56bbce1` | *"one hail is not one captain being asked, it is every captain being interrupted."* |

### 3c. Measurements that justify current numbers

Losing these means the numbers become unexplained magic.

- **Trade tuning, 150 seeded voyages** (`542c3cd`, `c8e2937`, `73fdbbc`):
  hails/game 3.25 → 0.75 → 0.78 → **2.63**; trades struck 28 → 26 → 50 → **179**;
  offer→trade rate 5.7% → 23.0% → 42.7% → **45.3%**; mean voyage 15.4 → **15.0**.
- **Mean opening bid FELL 7.64 → 4.48** in the last step (`73fdbbc`) — stated plainly as the one
  number that moved the wrong way, then explained as composition (56% of offers now come from
  captains holding ≤5 coins) rather than stinginess.
- **Straight-line sail animation crossed land in 16.3% of moves** — measured over 13,982 legal
  moves across 40 boards and four winds, worst case three land squares at a time (`4ea98c6`).
- **Storms**: a storm still moves each ship 3.05 squares on average and flings one into the rim
  ~0.85 times per storm; removing the lost-turn penalty changed median game length by **zero
  rounds** (`RULES-V2.md` §8).
- **Land as a storm backstop**: 34.8% of your reachable squares are storm-proof, you're already
  on one 32.7% of the time, and only 0.7% of the time is none reachable. The shove helps 25% of
  the time and hurts 36%, netting −0.33 squares — *"a read rather than a routine."*
- **Idle CPU on a phone**: 51% of a core → **25%** (`62b9f32`), then sail highlights 60
  layouts/sec → **0** (`c6db476`).
- **Ship glide bridge = 2 ticks** (`43e4cde`): at 1 tick, 48% of the fast core is frozen with
  20.0px peak jumps; at 2 ticks, 0% frozen, 10.6px, and only 4.5px (0.11 of a cell) off-route.
- **Bake-off bot attention `t = 0.28`** (`d0692de`): 40k-trial sweep → mean 2.52 attempts, 14%
  first try, 42% second, 27% third.
- **Race-planner ladder** (`8eb1a95`): +10.2 dev family, +6.8 held out, over 400 games/row.
- **Rim edge in the planner** (`8229385`): dev family +9.8 → **+12.4**, held-out +8.8 → **+11.3**.

### 3d. Things that were tried and REJECTED (the graveyard)

Not written down anywhere but here. Re-proposing any of these costs a cycle.

- **Bots routing through the rim, as a strength play** — `0070c59`: built, measured over 60 seeded
  games, **does not pay** (median identical, mean drifted *up* a round). *"The current always dumps
  you at its ARC HEAD, a fixed point that is rarely near where you were going."* Kept as a
  correctness fix only. Later earned its place a different way, in the planner, `8229385`.
- **Wind-aware routing shipped OFF behind `cfg.windRoute`/`cfg.rimRoute`** — `c430edd`, then
  **reverted entirely** in `9807bf2`: *"I had redone an existing feature, worse."* The wind-aware
  cost field had existed all along, one function away.
- **Three cruder "reach" shapes for the hail test**, all measured and all wrong (`73fdbbc`):
  flat leverage value → 6.03 hails/game; × demandFor → 7.33 (worse); spares only → 0.78.
- **A `hailEdge` constant margin** — `56bbce1`, rejected by Wyatt on principle.
- **An endgame-intercept layer for the race planner** — `8eb1a95`: *"built twice and cut twice
  (+8.8, +9.9, both below +10.2) — the ladder decides, not the theory."*
- **Two forecast-on-the-dial designs** (a ghost needle, a red chevron) — `RULES-V2.md` §6:
  *"anything drawn over the needle competes with it."*
- **A bare `??` and a whirlpool glyph for the hidden storm direction** — rejected because 🌀
  already means the trade-wind current, *"and a glyph should not mean two things."*
- **The harbormaster 2-for-1** — specced then cut (`348ccf4`).
- **Arc rows for the action fan** — `8aa7ba4`: at R=70 a four-button arc row wrapped ~200° around
  the boat. Replaced with straight staggered rows.
- **A template-matching sail tracker for the video diagnosis** — `73120d7`: thrown away when its
  correlation fell to 0.28; replaced with colour tracking, which is scale-invariant.

---

## 4. Playtest cycles

`/4` had **at least 23 numbered playtest rounds in five days**, all conducted by Wyatt on his own
phone, all reported conversationally and answered in a commit. Numbers referenced in `4/` commit
bodies: **1, 2, 3, 4, 5, 6, 6b, 7, 8, 10, 11, 12, 13, 15, 16, 17, 19, 20, 21, 22, 23.**
(9, 14, 18 are not referenced — either folded into neighbours or unnumbered.)

**There is no playtest document anywhere.** `.planning/` has playtest artifacts for v1 only
(`PLAYTEST-2026-08-01-PHASE-18-21-22.md`, three `quick/2026072*-playtest-*` dirs,
`15-PLAYTEST-NOTES.md`). Nothing for `v2`, `3` or `4`. The 23 rounds exist **only** as quoted
complaints inside commit bodies.

### The arc of what was found

| Rounds | Commits | Theme |
|---|---|---|
| **1–8** (08-11) | `c9b98a3` … `bfdf38c` | The new shell's first contact with a real phone: dead space, boats not riding the camera, prompts covering the squares they ask about, the flip ceremony trapped under its own veil, radial buttons stacking at board edges. Ends with the yellow action box retired. |
| **10–13** (08-11→12) | `9625ef8`, `62b9f32`, `9639154`, `d63d14f` | Punch lists of 9–10 items each. The **hot phone** (idle CPU halved), the ribbon clock, one-line captain rows, the coin stepper replacing the last yellow boxes, End of Voyage getting an exit. |
| **15–17** (08-12→13) | `46df917`, `d9e2b2a`, `77219a3` | Placement gets ONE rule. The bake-off moves to centre stage. "No narration/action messaging should overlap" restored. |
| **19–20** (08-13) | `4d1bc6c`, `6e573fe`, `b07a7d2`, `ee1da10` | **Mando's game** — the first playtest by someone other than Wyatt. Found: the both-heads-downwind tie rule *appeared nowhere on screen* (≈1 fight in 4 was decided by an invisible rule); "name your price" silently registered as a denial; the trade-wind rim looked identical to an ordinary square, costing Mando three turns. |
| **21** (08-14) | 9 items, `2e84477` → `61dd40a` | The big substantive round: bot trade offers "far too low to be enticing", jerky ships (diagnosed off a 60fps video), the storm narrating four times, counter-offering with a crate, trade winds not animating at all. |
| **22** (08-14→15) | `43e4cde`, `8882766`, `fcdcf34`, `ba2e173`, `c73cc02` | **Two hard stalls.** Counter-offer killed the voyage on the tap (`8882766`); a lost `setTimeout` ended a voyage with no error (`43e4cde`); a refresh appeared to restart the game (it was re-narrating the replay in real time). Plus 13 layout/placement items. |
| **23** (08-15) | `a191366` | Three items — battle card text, narration boxes too wide, a "her" pronoun on a captain the game never gendered. **Item 1 was withdrawn by Wyatt after measuring together.** |

### What remains open from playtesting

- **Playtest 22, item 5 — NOT REPRODUCED, NOT FIXED.** `ba2e173`: *"The dock+attack menu did not
  fall back to a card in anything I could stage… An audit of every action menu raised across a
  driven voyage found 2 radial and 0 card. Reported unreproduced rather than blind-fixed."*
- **Playtest 21 — the ~15s trade-wind arrow pop-in on Safari, NOT DIAGNOSED.** `1cffd51`: *"the
  ~15s pop-in does NOT reproduce off Safari and is not claimed as diagnosed."* The leading suspect
  (`will-change` promoting 40 permanent compositor layers) was removed because it was free to
  remove, but the cause is unproven.
- **Playtest 22, item 11 — bake-off card width, NOT REPRODUCED LOCALLY.** `ba2e173`: *"on a warm
  server the art is there before the first layout… This removes the dependency rather than the
  symptom — the only fix available without his network — so if it recurs, the cause is elsewhere
  and this note says so rather than claiming a win."* A follow-up (`c73cc02`) found and fixed a
  *different*, real cause in the same area.
- **`918781d` — a visual claim never verified on a real screen.** *"STILL TO VERIFY ON A REAL
  SCREEN: this is a timing/animation change… Batched into one browser pass with the other visual
  items rather than claimed here."* No later commit explicitly closes it.

---

## 5. ⚠️ The single biggest documentation risk

**`4/RULES-V2.md` is byte-identical to the version written for `v2/` on 2026-08-07.** Verified:
`git diff 1e039497:3/RULES-V2.md 4/RULES-V2.md` is empty, and `git log --follow` shows its last
content change was `7c510a2` (2026-08-07) — *four days before `/4` existed*.

Consequences:

1. **Its own header is wrong.** Line 8: *"Lives in `v2/` on branch
   `claude/pastry-pirates-v2-rules-33gp60`."*
2. **§12 says "No bakeoff."** `/4` ships a bake-off — `4/src/engine/bakeoff.js` (211 lines),
   `4/src/ui/bakeoff.js`, `4/src/shared/recipe-steps.js`, and a centre-stage presentation
   (`d9e2b2a`). The spec directly contradicts the shipped game on a **win condition**.
3. **The black market is absent entirely** — no mention of the 10-coin price or the 2-crate
   barter, both live rules that every bot planner prices against.
4. **Counter-offers are one word.** Line 65 says holders may "counter-offer"; it does not say a
   counter can *replace* the give side ("keep yer coin, I want yer milk"), which is the mechanic
   `c8e2937` built, `73fdbbc` retuned the whole trade economy around, and `a6b81cd` shipped a
   crate-stealing bug in.
5. **Nothing about the redesign.** No camera/director, no bubbles, no radial fan, no centre stage,
   no hold-to-peek, no routed sailing, no trade-wind current, no fast-forward — the entire visible
   game.
6. **Nothing in `.planning/`.** `STATE.md` still reads `milestone: v1.3 — The Game Comes Alive`,
   `last_activity: 2026-08-02`, "Phase 20 is the only phase left". By the project's own records,
   the last two weeks did not happen.

Where the real documentation *did* land: `docs/TRADE-SYSTEM.md`, `docs/BOT-DESIGN-PRINCIPLES.md`,
`docs/BOT-V3-RACE-PLANNER.md`, `docs/HARD-WON-LESSONS.md`, `docs/BOARD-RENDERING.md`,
`docs/DRIVING-THE-GAME.md`, `docs/FABLE-BOT-BRIEF.md` — all at the **repo root**, all updated
through 2026-08-15, and all cited by name in `/4` commits. These are healthy. The *rules* are not.

---

## 6. Open / unfinished threads

### Explicitly deferred, with a named condition

| Thread | Commit | Note |
|---|---|---|
| **The coin slider never crosses the network** | `c8e2937` | *"NAMED EXCEPTION, not a silent one: the slider reaches the LOCAL prompt path only… **Must be closed if /4 ever ships online multiplayer.**"* A genuinely remote seat falls back to the old ±1 stepper. |
| **`/4` has no determinism corpus at all** | `542c3cd`, `b07a7d2` | *"/4's engine has no determinism corpus (the root gates load `../../src`, i.e. v1), so this change had no gate that could catch it."* `4/scripts/trade_offer_measure.js` was written to partly cover the gap. **This is the single largest technical gap for promotion** — v1's core value is "the deterministic engine + replay must remain intact", and `/4` inherits none of that protection. |
| **`4/scripts/no_undef_check.js` is permanently RED** | `2e84477`, and every later commit | 3 findings, byte-identical every run, both documented blind spots (a bare `window.addEventListener`, and a get/set accessor parsed as a call position). *"Not introduced here, and not silenced here either."* Every commit since re-states the count as a control. |
| **`/4` writes no named game logs** | `b07a7d2` | *"/4 ships without Firebase, so `writeGameLog()` early-returns and NO named game log exists for a /4 voyage — the only records are the anonymous usage pings."* So playtest sessions cannot be looked up after the fact. |
| **`SOLO_SCHEMA_V` bumped 1 → 2** | `69b9f23` | Saves written before 2026-08-14 are "no resume" rather than quietly wrong. Anyone mid-voyage on an older build loses it. |
| **`src/net/` is dead code kept deliberately** | `02cb5e7`, `RULES-V2.md` line 11 | *"src/net/ is left on disk unused so multiplayer can be revived by restoring them."* Present in `4/src/net/` (5 files). |

### Stopgaps and "for now"

- **`ba2e173`, item 11** — the bake-off card's definite width is explicitly *"the only fix
  available without his network"*, and the CSS itself carries a note saying so.
- **`1cffd51`, part 2** — removing `will-change` from the rim is described as *"the leading
  suspect, removed because it was free to remove"*, and the measurement that would confirm it
  could not be taken (headless presents no frames, so compositing cost measures as zero).
- **`c430edd`** — two whole features shipped behind `cfg.windRoute` / `cfg.rimRoute`, both OFF.
  Subsequently reverted in `9807bf2`, so **check whether the flags still exist**.
- **`43e4cde`** — closes with *"NOT CONFIRMED FIXED: the counter-offer stall itself."* It was
  fixed later, in `8882766`.
- **`918781d`** — one visual claim explicitly not verified (see §4).

### Things `/4` deliberately does NOT have

- **No Firebase, no online multiplayer.** Solo and Pass & Play only.
- **No `about.html`, no `lab.html`** (`RULES-V2.md` line 13).
- **`robots: Disallow /4/`, `noindex`** (`511c427`) — `/4` is deliberately unindexed. **This will
  need reversing on promotion**, and per `.claude/CLAUDE.md` `robots.txt`/`sitemap.xml`/`CNAME`
  are the three files that must never be copied carelessly between deployments.
- **`/4` is not covered by the root gates** — `scripts/module_graph_check.js` and
  `scripts/ui_contract_check.js` scan the v1 root only. This was already caught once as an
  overstatement of coverage (`18d24e7`: *"earlier 'all gates green' reports overstated their
  reach"*).

---

## 7. Method notes worth preserving

Three habits show up in almost every `/4` commit and explain why the history is worth this much:

1. **Every claim is measured, and the measurement is quoted with its instrument.** Not "it's
   smoother" but "writes median 16.7ms, frames median 16.7ms, worst write gap 28ms".
2. **Failed checks are recorded as loudly as passing ones.** `aa1ddd6` documents two wrong
   verification methods before the right one; `2e9e06b` records a first measurement that *"PROVED
   NOTHING, which is the part worth keeping"* because 6 is the one value where the fix and the bug
   agree; `c73cc02` records two wrong fixes on the way to the right one.
3. **Red-proofing.** A check is not trusted until it has been shown to fail: *"A check that cannot
   fail is not protection"* (`2e9e06b`); *"A check only ever seen passing is not evidence"*
   (`b8e9eea`).

If `/4` is promoted, this reasoning is the asset most at risk — it is currently reachable only by
`git log -- 4/`, and a directory rename or a squashed merge would sever it.
