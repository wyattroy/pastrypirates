---
phase: quick-20260730-bot-intelligence
plan: 01
type: execute
wave: 1
depends_on: []
autonomous: false
requirements: [BOT-01, BOT-02, BOT-03, BOT-04, BOT-05, BOT-06, BOT-07, BOT-08]
files_modified:
  - scripts/bot_bench.js
  - docs/BOT-BENCH.md
  - docs/DETERMINISM-RERECORD-NEXT.md
  - cocoa_pirates_sim.py
  - package.json
  - .planning/STATE.md
  - .planning/todos/pending/bot-rim-escape-live-parity.md

must_haves:
  truths:
    - "A bot's intelligence can be measured before it is changed — a repeatable command produces per-personality win rate, game length, stalemate tail, and battle health from the REAL engine, not a model of it (BOT-01)."
    - "The measuring instrument proves itself: with no improvement applied, the treated seat's win rate lands on the 25% null within noise, or the harness fails loudly (BOT-02)."
    - "Two DIFFERENT acceptance bars are written down before any improvement is measured — A is judged on whether it wins more games, B is judged on whether it teaches (BOT-03)."
    - "Improvement A (water-route target selection) ships only if it measurably helps; a null result is reported as a null result (BOT-04)."
    - "Improvement B (bots ride the trade winds) ships if it is demonstrable, not harmful, and legible to a watching player — it does not have to win more games (BOT-05)."
    - "A watching player actually SEES a bot ride the trade winds — the rim sweep produces a narration line that reaches the screen, not a silent teleport (BOT-05)."
    - "A null on A and a ship on B is a coherent outcome, and the artifact says so rather than reconciling them (BOT-06)."
    - "src/engine/index.js is byte-identical to HEAD at every commit in this plan; the 31-seed determinism corpus is never re-recorded here (BOT-07)."
    - "cocoa_pirates_sim.py is KEPT as a record of the game's history, and marked so unmistakably that nobody can mistake it for a current source of truth (BOT-08)."
  artifacts:
    - "scripts/bot_bench.js"
    - "docs/BOT-BENCH.md"
    - ".planning/todos/pending/bot-rim-escape-live-parity.md"
  key_links:
    - "scripts/lib/load_engine.js loadEngine() -> Game.prototype.chooseTarget / Game.prototype.stepToward monkey-patch -> scripts/bot_bench.js variant registry (the ONLY seam; no engine file is edited)"
    - "src/engine/index.js chooseTarget + stepToward -> src/ui/flow.js:935,945 botTurn -> both live and headless bots inherit any future change for free (why the improvements must live in these two methods and nowhere else)"
    - "Game.tradewind() ev({t:'tradewind'}) -> src/ui/util.js:424 EVENT_NARRATION.tradewind -> narrateCurrent()'s single appState.evIdx pointer (src/ui/util.js:1048) -> whether a player ever SEES it (B's legibility bar)"
    - "docs/BOT-BENCH.md verdict -> docs/DETERMINISM-RERECORD-NEXT.md queued batch -> one gated --capture, not two"
---

<objective>
Make the bot captains genuinely smarter, **measured before committed** — and make them visibly use
the game's least discoverable mechanic. Two candidate improvements were found by reading the engine.
This plan builds an instrument that can tell whether each one earns its way in, judges each against
its OWN bar, records the numbers, and returns a go/no-go recommendation. It does not change the
engine.

Purpose: this is the first work in the project aimed at making the game BETTER rather than CORRECT,
so the bar is evidence, not plausibility. Wyatt: *"yes, scope that — run the simulator first before
we re-record."*

Output: one new standalone measurement script, one results artifact with a plain-language verdict at
the top, a historical marking on the retired Python simulator, one flagged pre-existing parity bug,
and a decision checkpoint. Seven atomic commits, each green on `npm test`, each leaving
`src/engine/index.js` byte-identical.
</objective>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@docs/DETERMINISM-RERECORD-NEXT.md

@src/engine/index.js
@scripts/real_game_test.js
@scripts/lib/load_engine.js
@scripts/determinism_baseline.js
</context>

<the_two_candidates>

## A — `chooseTarget()` measures through solid land

`src/engine/index.js:584-603`. Target selection is straight-line only:

- `:602` — `cands.sort((x,y)=>man(p.pos,x)-man(p.pos,y)); return cands[0];`
- `:593-594` — the merchant detour filter, `man(p.pos,c)+3<=best`
- `:599` — the holders fallback, `holders.sort((x,y)=>man(p.pos,x.pos)-man(p.pos,y.pos))`

Meanwhile `stepToward()` (`:306-346`) is a full wind-weighted Dijkstra that "routes cleanly around
concave islands" by its own comment. So a bot navigates optimally toward a destination it chose by
measuring **through** the islands it will then have to sail around. The pathfinding machinery
already exists; target selection simply does not use it.

**A is pure optimisation.** It is invisible to a watching player — nobody can see that a bot picked
a better island. It has no teaching value. So it is judged purely on whether it wins more games.

## B — bots never use the trade winds

`src/engine/index.js:311` — `if(this.onRim(o))return false; // bots stay out of the trade-wind channel`,
and the comment at `:348` confirms the rim "counts as 'not an ordinary move' because stepToward
refuses it". The rim is free board-crossing travel: sail onto any cell of an arc and `tradewind()`
(`:244-251`) sweeps you to that arc's clockwise head (`this.rimHead`). A human who has noticed this
has a permanent structural advantage over every bot.

The one existing exception is `rimEscape()` (`:361-372`), used only when `boxedIn()` — its own
comment calls it "the one time a bot deliberately uses the trade winds the way a human can."

**B is pedagogy first, optimisation second.** Wyatt: *"i would like to see the bots use the trade
winds, even if it doesn't help them, to demonstrate to new players how to leverage them properly!"*
The rim is the game's least discoverable mechanic — free board-crossing travel a new player has no
way to learn except by stumbling into it. Bots visibly using it teaches by demonstration. So B is
judged on whether it is demonstrable, harmless and legible — **not** on win rate.

</the_two_candidates>

<why_not_the_python_simulator>

**`cocoa_pirates_sim.py` cannot be the measuring instrument. It is kept as history and marked as
such (Task 6) — it is not updated, not trusted, and not deleted.**

Verified before scoping:

1. **It does not model the rim at all.** `grep -ci "rim\|tradewind\|trade_wind" cocoa_pirates_sim.py`
   returns `0`. It structurally cannot measure improvement B.
2. **It models a different board.** `Rules.grid: int = 11`; the shipped game is `grid:15` with
   `roundBoard:true` (`src/engine/index.js:819-822`).
3. **It is stale by three phases.** Last touched at `06005ae` (2026-07-18, *"Playtest round:
   turn-order rework, layout/mobile fixes, and UX polish"*) — before Phase 13, 14 and 15, so it
   predates the AI-02 wind-advantage battle rule, the AI-06 rematch-escalation grudge tuning, and
   the whole Phase 14 storm rework.

It is a second implementation of the game that had to be hand-kept in step with the engine and was
not. Measuring a proposed engine change against it would be measuring a change to one program using
a different program.

**Measure against the REAL engine instead.** `src/engine/index.js` is already proven headless at
scale: `scripts/determinism_baseline.js` plays 31 full games with no DOM on every `npm test`, and
`scripts/real_game_test.js` plays 2000 in 34 seconds via `scripts/lib/load_engine.js`, whose header
states the principle exactly — *"exercising the exact same source the browser runs — not a port, not
a rewrite."* No fidelity gap, and improvements are measured on the code that actually ships.

**Path note:** the file lives at the **repo root** (`cocoa_pirates_sim.py`), not in `scripts/`.
Verified: `ls scripts/cocoa_pirates_sim.py` does not exist. Verified there is no archive convention
for source files in this repo — `.planning/milestones/` archives planning documents only, and there
is no `archive/` directory. So it stays exactly where it is and is marked in place.

</why_not_the_python_simulator>

<experimental_design>

Read this before writing Task 1. Getting the design wrong makes every later number meaningless.

## The attribution problem, and the two-mode answer

If every bot gets the improvement, every bot's win rate stays ~25% and there is no signal at all.
So each variant runs in **two modes**, because they answer two different questions:

| Mode | Configuration | Answers |
|------|---------------|---------|
| `contest` | exactly **one** treated seat, three baseline seats | *Does the improvement win more games?* |
| `all` | **all four** seats treated | *Is the game still healthy — and is the behaviour visible — when everyone has it?* |

Shipping means all bots get the change, so game-health and demonstrability metrics must come from
`all`. The win-rate signal can only come from `contest`.

## Seat and personality balance

Reuse `real_game_test.js`'s rotation exactly: for game `i`, seat `s` gets
`BOT_STRATS[(i + s) % 5]`. Treated seat for game `i` is `i % 4`.

The two periods (4 and 5) are coprime, so over any block of 20 games each seat is treated exactly
5 times, once with each of the five personalities — a fully balanced design with no seat bias and
no personality bias. **The harness must assert `games % 20 === 0` and refuse to run otherwise.**

Under this design the null hypothesis for the treated seat's win rate (over *decided* games) is
exactly **25%**.

## Sample size, justified

Standard error of a win rate at p=0.25 is `sqrt(0.25 * 0.75 / n)`:

| n | SE | effect clearing 4 SE |
|---|-----|----------------------|
| 1000 | 1.37 pp | 5.5 pp |
| 2000 | 0.97 pp | 3.9 pp |
| **4000** | **0.68 pp** | **2.7 pp** |
| 8000 | 0.48 pp | 1.9 pp |

A win-rate improvement worth spending a determinism re-record on is at least +3 pp absolute
(25% → 28%, a 12% relative lift). **n = 4000 is the recorded headline** because it puts +3 pp at
4.4 SE — comfortably outside noise — while costing about 70 seconds per run at the measured
~17 ms/game. Default for iteration is 2000; final recorded runs use 4000.

The harness prints the SE alongside every win rate so the numbers interpret themselves.

## The primary low-variance metric

Win rate is A's ship criterion but it is noisy, because winning also depends on battle coin flips
and the end-of-game bakeoff (`resolveEnd`, `:796-809`). **Rounds until the treated bot completes its
recipe** (`needs(p).length === 0`) isolates targeting quality from battle luck and has far lower
variance. Report it as the primary diagnostic; keep win rate as the ship gate.

## PRE-REGISTERED ACCEPTANCE — TWO DIFFERENT BARS

**A and B are judged against different bars. Do not apply one bar to both.** Both are written down
in Task 2, committed before Task 3 runs.

### Bar A — optimisation (applies to variant A only)

A is recommended **only if all three hold**:

1. `contest` at n=4000: treated win rate **≥ 28.0%** (≥ 4 SE above the 25% null).
2. `all` at n=4000: no game-health regression — the 150-round cap rate and the no-winner rate each
   rise by no more than **+1.0 pp** versus baseline, and median rounds-to-finish does not increase.
3. `all` at n=4000: battles per game and flee rate stay within **±15% relative** of baseline (the
   AI-06 grudge tuning is load-bearing and must not be silently undone).

A treated win rate inside **25% ± 2 SE** (23.6%–26.4% at n=4000) is a **NULL RESULT**. It is recorded
as such and A is **not** recommended. Nobody is obliged to produce an improvement.

### Bar B — pedagogy (applies to variant B only)

B's purpose is to teach the rim by demonstration, so **win rate is not its bar**. B is recommended
only if all three hold:

1. **Demonstrable.** In `all` mode at n=4000, a bot deliberately takes a rim route in **≥ 50% of
   games** and **≥ 1.0 times per game on average**. Rationale: the teaching only works if a player
   sees it happen in the game they are actually playing, so the floor is "at least once in a typical
   game," not "detectable in aggregate." Also report the median and maximum hops saved when taken —
   a route that saves one hop is not a compelling demonstration; one that saves six is.
2. **Not harmful.** `contest` at n=4000: treated win rate **≥ 22.3%** (not more than 4 SE *below*
   the 25% null) — hard fail below that. Between 23.6% and 25% is a **FLAG, not a fail**: report
   plainly that bots got somewhat weaker and let Wyatt weigh teaching against strength. And no
   game-health regression: cap rate and no-winner rate each rise by no more than **+1.0 pp**.
3. **Legible.** A rim sweep must produce a narration line that actually reaches the screen. A bot
   using the rim silently teaches nobody, which would defeat the entire purpose. See
   `<legibility_risk>` — this is a real, documented failure mode in this codebase, not a formality.

**A null on A and a ship on B is a coherent outcome**, not a contradiction. The artifact must state
it that way.

## Why the improvements must live in `chooseTarget` and `stepToward` — and nowhere else

There are **two** bot turn implementations, deliberately parallel:

- headless: `src/engine/index.js:708` `takeTurn()` — what the determinism corpus records
- live: `src/ui/flow.js:912` `botTurn()` — what a real player actually plays against

`flow.js:935` calls `g.chooseTarget(p)` and `flow.js:945` calls `g.stepToward(...)`. So **any change
confined to those two methods reaches live play and headless replay for free, with no parallel edit
and no chance of the two drifting apart.** Anything placed in `takeTurn` would require a matching
hand edit in `botTurn` — which is exactly how the two paths already diverged (see the flagged bug in
Task 7). This is a hard design constraint on both variants, not a preference.

</experimental_design>

<legibility_risk>

**B's legibility bar is at real risk, and the codebase has already been bitten by this exact bug.**

The pieces:

- `Game.tradewind()` (`src/engine/index.js:248`) records `this.ev({t:"tradewind",p:p.idx})` — the
  event exists.
- `src/ui/util.js:424` has `EVENT_NARRATION.tradewind` — *"🌀 {name} is blown into the trade winds
  and swept around the rim!"* — the line exists.
- Every EXISTING rim sweep in live play is narrated by an explicit call:
  `flow.js:375`, `:774`, `:866` all read `if(appState.game.tradewind(p)){liveRender();await narrateLastEvent();}`.
  Those are the storm and flee paths. **They narrate because someone wrote the call by hand.**
- A bot's ordinary move (`flow.js:944-946`) has no such call. It emits `{t:"sail"}` and calls
  `botBeat()`. `botBeat()` (`src/ui/util.js:1045`) calls `narrateCurrent()`, which
  (`src/ui/util.js:1048-1049`) narrates **`appState.game.events[appState.evIdx]` — one single
  pointer**, not every event the move produced.

This is precisely the D-11 bug, already found and fixed once for storms. The fix's own comment says
it outright (`flow.js:386-388`): *"Narrates EVERY event the square records, not just the last — the
fix for D-11: botBeat()'s own narrateCurrent() only ever narrates the single appState.evIdx pointer,
which is exactly why bot storm outcomes have been vanishing."*

So a rim sweep emitted from inside `stepToward` during a live bot turn may well be swallowed —
the bot would teleport across the board with either no line or the generic *"pays 1🌕 and sails"*
line (`util.js:329`). **Task 5 must determine which, and treat the answer as part of B's result.**

If the line is swallowed, that is not a reason to drop B. It is a companion change — a UI-tier fix
in `botTurn`, which is **not** in the determinism corpus and therefore costs **no re-record at all**.
That makes it a cheap and important finding, and it belongs in B's ship spec as its second half.

</legibility_risk>

<tasks>

<task type="tracer">
  <name>Task 1: bot_bench.js — one measurement path, end to end, on the real engine</name>
  <files>scripts/bot_bench.js, package.json</files>
  <read_first>scripts/real_game_test.js (the harness shape to follow — N headless games, seeded, stats out), scripts/lib/load_engine.js (the ONLY sanctioned way to obtain Game/roundCfg), scripts/determinism_baseline.js:81-91 (strategiesFor / playSeed conventions to match)</read_first>
  <action>
Create `scripts/bot_bench.js` as a standalone Node tool — the thinnest complete path from
`loadEngine()` through N real games to a printed metrics table, with only the `base` (no-op) variant
registered. This is the tracer: it must produce a real, trustworthy number before any improvement
exists to measure.

Obtain the engine through `loadEngine()` from `scripts/lib/load_engine.js`. Never re-implement,
never file-slice, never copy engine logic into this file.

CLI: `--variant=<name>` (default `base`), `--mode=contest|all` (default `contest`),
`--games=<n>` (default 2000), `--json`, `--selfcheck`, `--seed-base=<n>` (default 12345).
Assert `games % 20 === 0` and exit non-zero with a plain explanation otherwise — the balanced design
in `<experimental_design>` depends on it.

Game construction mirrors `real_game_test.js:42-45` exactly: `strategies` from the
`BOT_STRATS[(i + s) % 5]` rotation, `roundCfg(strategies)`, `new Game(cfg, SEED_BASE + i, true)`
(record=true — `Game.ev()` is a no-op otherwise, and the event stream is where most metrics come
from), then `g.play()`.

Variant registry: an object keyed by variant name, each entry `{describe, apply(GameClass)}` where
`apply` installs prototype overrides and returns an `undo()`. `base.apply` installs nothing. In
`contest` mode the treated seat is `i % 4` and only that player's decisions are affected — so the
overrides must branch on a per-player marker set before `play()` (tag the treated player object,
have the override consult the tag, and fall through to the original method otherwise). In `all` mode
every player is tagged.

DRIFT PIN (this repo's loud-failure-on-drift convention, see `load_engine.js` header): pin the
SHA-256 of `Game.prototype.chooseTarget.toString()` and `Game.prototype.stepToward.toString()` as
constants. On startup, compare; on mismatch abort with a message naming which method changed and
telling the reader that the recorded numbers in `docs/BOT-BENCH.md` no longer describe this engine
and the pin must be re-taken deliberately. A harness that silently measures a different engine than
the one it documents is worse than no harness.

Metrics, collected per run. From the returned `Game` object and its `g.events` stream (each event
carries `o.state` with every player's position, coins, crates and done flag — `:233-235`):

`contest` mode: treated-seat win rate over DECIDED games (exclude `g.winner === null`) with its
standard error; the same split by personality; rounds until the treated bot first has
`needs(p).length === 0` (mean, median, and % that never complete); crates held at game end.

`all` mode: % of games hitting the 150-round cap (`g.round === 150`); % ending with no winner;
rounds-to-end mean / median / p90 / max; battles per game; flee rate (`battleflee` over
`battle`+`battleflee`); `tradewind` events per game; % of GAMES containing at least one `tradewind`
event (the demonstrability floor in Bar B is a per-game rate, so it must be counted per game, not
pooled); % of `turn` events where the acting player stands on a rim cell (test with
`g.rim.has(x+","+y)`); % of events whose `state` snapshot has two or more not-done players sharing
one square.

Both modes: every variant fallback counter (Tasks 3 and 4 add these), and wall-clock seconds.

`--selfcheck` runs `base` in `contest` mode and exits non-zero unless the treated-seat win rate sits
within 3 SE of 25%. This is the instrument calibrating itself — if it cannot reproduce the null it
cannot be trusted to detect a departure from it.

Output determinism: identical arguments must produce byte-identical output. No wall-clock, no
`Math.random`, no unordered iteration in the report. The timing line goes to stderr, not stdout, so
stdout stays diffable. Progress to stderr every 500 games so a long run does not look hung.

Add a `bench:bots` entry to `package.json` scripts pointing at this file. Do NOT add it to `test` —
`npm test` must stay fast and the `test` script string must be byte-identical to HEAD.

Comment density and style follow the codebase: `// ===` section headers, section comments explaining
WHY (especially the two-mode design and the 20-game balance period), semicolons, no build step, Node
built-ins only.
  </action>
  <verify>
    <automated>node scripts/bot_bench.js --selfcheck --games=2000; test $? -eq 0</automated>
    <automated>node scripts/bot_bench.js --variant=base --mode=all --games=200 --json > /tmp/pb_a.json &amp;&amp; node scripts/bot_bench.js --variant=base --mode=all --games=200 --json > /tmp/pb_b.json &amp;&amp; diff -q /tmp/pb_a.json /tmp/pb_b.json</automated>
    <automated>node scripts/bot_bench.js --games=1999 > /dev/null 2>&amp;1; test $? -ne 0</automated>
    <automated>npm test</automated>
    <automated>git diff --quiet HEAD -- src/engine/index.js</automated>
    <automated>git diff HEAD -- package.json | grep -c '"test":' | grep -qx 0</automated>
  </verify>
  <done>`--selfcheck` passes (base treated-seat win rate within 3 SE of 25%, proving the instrument reproduces the null). Repeat runs are byte-identical. A non-multiple-of-20 `--games` is refused with a non-zero exit. `npm test` exits 0, `src/engine/index.js` is byte-identical to HEAD, and the `test` script in package.json is unchanged.</done>
</task>

<task type="auto">
  <name>Task 2: record the baseline and pre-register BOTH acceptance bars</name>
  <files>docs/BOT-BENCH.md</files>
  <read_first>docs/DETERMINISM-RERECORD.md sections 1 and 7 (how this project writes an evidence artifact with attribution), .planning/quick/20260730-playtest-notes-fixes/SUMMARY.md (house style for a findings document)</read_first>
  <action>
Run the baseline at the recorded headline size and write `docs/BOT-BENCH.md`.

Runs: `--variant=base --mode=contest --games=4000` and `--variant=base --mode=all --games=4000`.
Paste the real output. Do not round away the standard errors.

Structure the file so the top is readable by a non-coder and the evidence is below it:

1. **Verdict** — left as `PENDING — no improvement measured yet` at this commit. Task 7 fills it.
2. **What this measures, in plain language** — one short paragraph: we play four robot captains
   against each other several thousand times with no screen, count who wins, and only then decide
   whether a change to how they think is worth making.
3. **Two different bars, and why** — state up front that improvement A and improvement B are NOT
   judged the same way. A is about winning; B is about teaching. Quote Wyatt on B: *"i would like to
   see the bots use the trade winds, even if it doesn't help them, to demonstrate to new players how
   to leverage them properly!"* Explain in one or two plain sentences that the rim is the game's
   least discoverable mechanic and a bot using it visibly is a tutorial nobody has to write.
4. **Why not the Python simulator** — reproduce `<why_not_the_python_simulator>` with its three
   verified facts and the `grep -ci` result, and record the settled ruling: **it is kept as a record
   of the game's history and marked historical in place** (Wyatt: *"i like having a record of
   everything that went into this game"*). Not deleted, not updated, not moved.
5. **Method** — the two-mode design, the 20-game balance period, the n=4000 justification with the
   SE table from `<experimental_design>`, and the drift pin.
6. **PRE-REGISTERED ACCEPTANCE** — Bar A (three numbered conditions plus the null-result definition)
   and Bar B (demonstrable / not harmful / legible, with the flag-versus-fail distinction spelled
   out), verbatim from `<experimental_design>`. State explicitly that they are written down at this
   commit, BEFORE any improvement was measured, that this file's git history proves it, and that a
   null on A alongside a ship on B is a coherent outcome.
7. **Baseline numbers** — both tables, with the run commands above them so anyone can reproduce.
8. **Results** — an empty table with one row per variant (`base`, `A`, `B`, `AB`), filled by Tasks
   3-5.

The pre-registration is the honesty device of this whole plan. Commit this file BEFORE Task 3 runs,
as its own commit, so neither bar can be quietly moved to fit a result.
  </action>
  <verify>
    <automated>grep -q "PRE-REGISTERED" docs/BOT-BENCH.md &amp;&amp; grep -q "28.0" docs/BOT-BENCH.md &amp;&amp; grep -q "22.3" docs/BOT-BENCH.md</automated>
    <automated>grep -qi "bar a" docs/BOT-BENCH.md &amp;&amp; grep -qi "bar b" docs/BOT-BENCH.md &amp;&amp; grep -qi "legible" docs/BOT-BENCH.md</automated>
    <automated>grep -q "4000" docs/BOT-BENCH.md &amp;&amp; grep -q "0.68" docs/BOT-BENCH.md</automated>
    <automated>git diff --quiet HEAD -- src/engine/index.js</automated>
  </verify>
  <done>`docs/BOT-BENCH.md` exists with a plain-language opening, an explicit statement that A and B are judged by different bars and why, the three verified reasons the Python simulator is unusable plus the settled keep-and-mark ruling, the n=4000 justification, and BOTH acceptance bars in full — all committed before any improvement has been measured. Baseline contest and all-mode tables carry real numbers from n=4000 runs.</done>
</task>

<task type="auto">
  <name>Task 3: variant A — target selection by true sailing distance, judged on Bar A</name>
  <files>scripts/bot_bench.js, docs/BOT-BENCH.md</files>
  <read_first>src/engine/index.js:584-603 (chooseTarget in full), src/engine/index.js:306-346 (stepToward's pass() rules, which A's distance metric must match), src/engine/index.js:708-743 (takeTurn's use of the returned target)</read_first>
  <action>
Register variant `A` in the harness. It replaces `Game.prototype.chooseTarget` for tagged players
only, and changes exactly one thing: **the distance metric**. Every other rule in `chooseTarget`
— the recipe-done shortcut to home, the monopolist corner branch, the merchant detour slack of 3,
the holders fallback, the ordering semantics — is preserved identically. Only `man(p.pos, X)`
becomes true sailing distance.

True sailing distance is an unweighted hop-count breadth-first search from `p.pos` over the same
graph `stepToward`'s `pass()` walks: not `blocked`, not an island, not home, not on the rim.
Deliberately EXCLUDE the transient occupancy rule from `pass()` (`:312`) — the question is "how far
away is that place", and `stepToward` already handles sailing past ships without stopping on them
(`:340-345`).

Use HOPS, not `windStepCost` weighting, and say why in the code comment: the target is a multi-turn
destination while the wind re-rolls every round (`:769`), so weighting a multi-turn choice by this
round's wind is both wrong and unstable — it would make bots thrash between two islands as the wind
swings. One BFS per bot turn over ~180 cells is negligible.

The override must consume ZERO `this.r()` calls, exactly like the real `chooseTarget`. Any RNG draw
would shift the seeded stream for every other player and contaminate the comparison.

Unreachable candidate handling: never drop a candidate. If BFS cannot reach it, fall back to
`man()` for that candidate and increment a counter reported in the output. If that counter is
large, that is itself a finding worth stating.

Do NOT touch the pirate prey override at `takeTurn:728-731` / `botTurn` `flow.js:936-939`. It is a
second, smaller instance of the same straight-line bug, but folding it in would blur attribution
and would force an edit outside the two methods `<experimental_design>` constrains us to. Note it in
`docs/BOT-BENCH.md` as a separate follow-on candidate. (Both sides of that comparison are Manhattan
today and remain so, so A introduces no unit mismatch.)

Then run `--variant=A --mode=contest --games=4000` and `--variant=A --mode=all --games=4000`, fill
the A row of the results table, and write a short honest reading of it **against Bar A only** —
including "does not meet Bar A condition 1, this is a null result, A is not recommended" if that is
what the number says. Do not borrow Bar B's teaching argument to rescue A: A is invisible to a
watching player and has no teaching value.

If and only if A lands inside 25% ± 2 SE (a null), additionally register and measure `Aw`, the
wind-weighted variant of the same metric, to establish whether the null is a property of the idea or
of the hop-count choice. If A passes outright, skip `Aw` and record that it was skipped and why.
  </action>
  <verify>
    <automated>node scripts/bot_bench.js --variant=A --mode=contest --games=200 --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);if(j.variant!=='A'||typeof j.treatedWinRate!=='number')process.exit(1)})"</automated>
    <automated>node scripts/bot_bench.js --variant=A --mode=contest --games=200 --json > /tmp/pb_a1.json &amp;&amp; node scripts/bot_bench.js --variant=A --mode=contest --games=200 --json > /tmp/pb_a2.json &amp;&amp; diff -q /tmp/pb_a1.json /tmp/pb_a2.json</automated>
    <automated>node scripts/bot_bench.js --selfcheck --games=2000; test $? -eq 0</automated>
    <automated>npm test</automated>
    <automated>git diff --quiet HEAD -- src/engine/index.js</automated>
  </verify>
  <done>Variant A is registered, RNG-free, and reproducible run to run. The `base` self-check still passes (A did not perturb the control). The A row of the results table carries real n=4000 contest and all-mode numbers with their standard errors, and an honest reading against Bar A — stated as a null result if that is what it is. `src/engine/index.js` byte-identical to HEAD.</done>
</task>

<task type="auto">
  <name>Task 4: variant B — bots ride the trade winds</name>
  <files>scripts/bot_bench.js, docs/BOT-BENCH.md</files>
  <read_first>src/engine/index.js:56-93 (rim construction, arcs, rimHead), :243-251 (onRim / tradewind), :306-346 (stepToward), :361-372 (rimEscape — the existing precedent for a bot entering the rim), :494-521 and :551-556 (reachableFrom + the flee path, which already treats a rim cell as a legal end square and calls tradewind after)</read_first>
  <action>
Register variant `B`. It WRAPS `Game.prototype.stepToward` rather than replacing it — call the
original first, observe where it landed, then decide whether a trade-wind entry beats that landing.
Wrapping keeps the existing pathfinding untouched and makes attribution exact: B can only ever be a
strict addition on top of today's move.

Per tagged bot turn:

1. Call the original `stepToward`. Record the landing square `L`.
2. Compute `H`, an unweighted hop-count BFS from the TARGET outward over water excluding the rim,
   giving the remaining distance to target from any square.
3. Enumerate the rim cells reachable from the pre-move position within the same `budget`, using the
   real wind-weighted `windStepCost` flood — a rim cell is a legal END square but is never expanded
   through, exactly as `reachableFrom` already does at `:507`. Skip rim cells occupied by another
   not-done player, matching the same rule `rimEscape` applies at `:365`.
4. For each such rim entry `R`, its arc head is `this.rimHead[key(R)]`. The value of taking it is
   `H[head]`.
5. Take the best rim entry ONLY if `H[head] < H[L]` strictly — a genuine improvement in remaining
   distance to target, never a lateral move. This keeps the behaviour honest: bots ride the rim when
   the rim is genuinely the shorter path, which is exactly the lesson a watching player should draw.
   On taking it, set `p.pos` to `R` and then call `this.tradewind(p)`, which performs the sweep and
   records its own `tradewind` event exactly as the storm and flee paths already do (`:303`, `:555`).
6. Otherwise leave the original result untouched.

Zero `this.r()` calls. Cache the BFS and the budget flood per turn.

Count and report, since Bar B condition 1 is measured from these: rim options considered; rim
options taken; **% of games containing at least one taken rim route**; taken routes per game; and
the distribution of hops saved when taken (median and maximum).

**The predicted failure mode is bots getting stuck on the rim, and B's real job is to find out
whether that happens.** After a sweep the bot ENDS its turn on a rim cell (the arc head). Next turn
it can sail off normally, but its neighbours are largely rim, so `boxedIn()` (`:350-356`) may read
true and `rimEscape()` may fire and sweep it again. The rim-occupancy and 150-round-cap metrics from
Task 1 exist for exactly this. If the all-mode cap rate or no-winner rate rises past +1.0 pp, Bar B
condition 2 fails — say so.

Quantify the strength guardrail explicitly against Bar B condition 2: report the treated win rate
with its SE and state which band it falls in — pass (≥ 25%), FLAG (23.6%–25%, bots somewhat weaker,
Wyatt weighs teaching against strength), or FAIL (below 22.3%).

**Flag, do not fix:** `tradewind()` (`:244-251`) sets `p.pos` to the arc head with no occupancy
check, so two ships can be swept onto one square. `rimEscape` checks the cell it steps onto but not
the head. This is pre-existing (the storm path at `:303` and the flee path at `:555` have the same
property), but B increases rim traffic and would make it more common. The ships-stacked metric from
Task 1 quantifies it. Record it in `docs/BOT-BENCH.md` as an open question for Wyatt.

Then run `--variant=B --mode=contest --games=4000` and `--variant=B --mode=all --games=4000`, fill
the B row, and read it against **Bar B** conditions 1 and 2. Condition 3 (legibility) is Task 5.
  </action>
  <verify>
    <automated>node scripts/bot_bench.js --variant=B --mode=all --games=200 --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);if(!(j.rimRoutesTaken>0)||typeof j.gamesWithRimRoutePct!=='number'||typeof j.rimHopsSavedMedian!=='number')process.exit(1)})"</automated>
    <automated>node scripts/bot_bench.js --variant=base --mode=all --games=200 --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);if(j.rimRoutesTaken!==0)process.exit(1)})"</automated>
    <automated>node scripts/bot_bench.js --variant=B --mode=contest --games=200 --json > /tmp/pb_b1.json &amp;&amp; node scripts/bot_bench.js --variant=B --mode=contest --games=200 --json > /tmp/pb_b2.json &amp;&amp; diff -q /tmp/pb_b1.json /tmp/pb_b2.json</automated>
    <automated>node scripts/bot_bench.js --selfcheck --games=2000; test $? -eq 0</automated>
    <automated>npm test</automated>
    <automated>git diff --quiet HEAD -- src/engine/index.js</automated>
  </verify>
  <done>Variant B is registered and demonstrably fires (rim routes taken &gt; 0 in all-mode) while the base variant takes zero, proving the counter measures B and not ambient behavior. The B row carries real n=4000 numbers including the per-GAME demonstrability rate, routes per game, median and maximum hops saved, treated win rate with its pass/FLAG/FAIL band named, cap rate, no-winner rate and ships-stacked. Bar B conditions 1 and 2 are each answered explicitly. `src/engine/index.js` byte-identical to HEAD.</done>
</task>

<task type="auto">
  <name>Task 5: Bar B condition 3 — does a watching player actually SEE it?</name>
  <files>scripts/bot_bench.js, docs/BOT-BENCH.md</files>
  <read_first>src/ui/util.js:1044-1060 (botBeat / narrateCurrent and its single appState.evIdx pointer), src/ui/util.js:424 (EVENT_NARRATION.tradewind) and :329 (the generic sail line that would replace it), src/ui/flow.js:373-377, :770-776, :862-868 (the three existing hand-written tradewind narration calls), src/ui/flow.js:380-392 (the D-11 comment naming this exact failure mode), src/ui/flow.js:934-949 (botTurn's move block, which has no such call), scripts/narration_audit_check.js and scripts/narration_test.js (the existing browser-free narration paths — reuse one, do not invent a new one)</read_first>
  <action>
Determine whether B's rim sweep produces a narration line a player actually sees. This is Bar B
condition 3, and per `<legibility_risk>` it is at genuine risk — a bot using the rim silently would
teach nobody and defeat B's entire purpose.

Two halves, both answered with evidence:

**Half 1 — does a line exist for the event? (browser-free, automatable.)** Confirm that the
`tradewind` event B emits is exactly the shape `EVENT_NARRATION.tradewind` (`src/ui/util.js:424`)
consumes, and that it renders to real text. Do this through whichever browser-free narration path
the repo already has — `scripts/narration_audit_check.js` / `art-review/narration-core.js` (run by
`npm run audit:check`) or `scripts/narration_test.js`. Reuse it; do not build a second narration
harness. Add the check to `scripts/bot_bench.js` behind a `--legibility` flag so it is reproducible,
and have it fail non-zero if the event does not render to a non-empty line.

**Half 2 — does that line reach the screen during a live bot turn? (analysis, stated with cites.)**
Trace `botTurn`'s move block: `flow.js:945` calls `g.stepToward(...)`; with B installed that call
would emit `{t:"tradewind"}` from inside; `flow.js:946` then emits `{t:"sail"}` and calls
`botBeat()`; `botBeat()` (`util.js:1045`) calls `narrateCurrent()`, which narrates
`events[appState.evIdx]` — one pointer (`util.js:1048-1049`). Compare against the three existing
sweep sites (`flow.js:375`, `:774`, `:866`), which each narrate by an explicit hand-written
`narrateLastEvent()` call, and against the D-11 comment at `flow.js:386-388` that names this exact
class of bug: *"botBeat()'s own narrateCurrent() only ever narrates the single appState.evIdx
pointer, which is exactly why bot storm outcomes have been vanishing."*

State the conclusion plainly in `docs/BOT-BENCH.md`: either the line surfaces, or it is swallowed and
the player sees the generic *"pays 1🌕 and sails"* line (`util.js:329`) or nothing at all.

**If it is swallowed, that is NOT a reason to drop B.** It is B's second half: a UI-tier fix in
`botTurn` mirroring the pattern already used at `flow.js:375` / `:774` / `:866`. Record in
`docs/BOT-BENCH.md` that this half touches `src/ui/flow.js` only, is **not** in the determinism
corpus, and therefore costs **no re-record at all** — so B's total cost is one engine method riding
the queued batch plus one free UI line. Write it as a specific, located change (which file, which
line, which existing call to mirror), not a vague note. Do not implement it here — this plan commits
no engine change and no flow.js change.

Then register and measure variant `AB` as the composition of A's and B's prototype installers,
applied together, with no new logic of its own. Composition order must be explicit and commented: A
patches `chooseTarget`, B wraps `stepToward`, so they touch different methods and do not interact
directly — but B's BFS is computed from whatever target A selected, so AB is not simply additive and
must be measured, not inferred. Run `--variant=AB --mode=contest --games=4000` and
`--variant=AB --mode=all --games=4000`, fill the AB row, and state whether AB's effect is larger
than, equal to, or smaller than the sum of A's and B's individual effects. A combined result that is
worse than either part alone is a real and important finding — record it plainly rather than
reaching for the best of the three. Judge AB's targeting half against Bar A and its rim half against
Bar B, exactly as the parts were judged.
  </action>
  <verify>
    <automated>node scripts/bot_bench.js --legibility; test $? -eq 0</automated>
    <automated>node scripts/bot_bench.js --variant=AB --mode=contest --games=200 --json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);if(j.variant!=='AB'||typeof j.treatedWinRate!=='number')process.exit(1)})"</automated>
    <automated>grep -q "narrateCurrent" docs/BOT-BENCH.md &amp;&amp; grep -q "evIdx" docs/BOT-BENCH.md</automated>
    <automated>node scripts/bot_bench.js --selfcheck --games=2000; test $? -eq 0</automated>
    <automated>npm test</automated>
    <automated>git diff --quiet HEAD -- src/engine/index.js</automated>
    <automated>git diff --quiet HEAD -- src/ui/flow.js</automated>
  </verify>
  <done>`--legibility` passes, proving the `tradewind` event renders to a real non-empty narration line browser-free. `docs/BOT-BENCH.md` states plainly whether that line reaches the screen during a live bot turn, with line cites and the D-11 precedent — and if not, specifies the located UI-tier companion fix and states that it costs no re-record. The AB row carries real n=4000 numbers, judged against Bar A and Bar B respectively, with the interaction stated. `src/engine/index.js` and `src/ui/flow.js` both byte-identical to HEAD.</done>
</task>

<task type="auto">
  <name>Task 6: mark cocoa_pirates_sim.py as a historical artifact</name>
  <files>cocoa_pirates_sim.py</files>
  <read_first>cocoa_pirates_sim.py:1-30 (the existing module docstring this replaces), docs/DETERMINISM-RERECORD-NEXT.md:1-12 (house style for "this is a record, nothing here is current")</read_first>
  <precondition>`cocoa_pirates_sim.py` is at the repo ROOT, not in `scripts/` — verified, `scripts/cocoa_pirates_sim.py` does not exist. The repo has no archive convention for source files (no `archive/` directory; `.planning/milestones/` archives planning documents only), so the file stays exactly where it is.</precondition>
  <action>
Wyatt: *"You can mark the python simulator as historical — i like having a record of everything that
went into this game."* So it is kept. The job is to make it impossible for the next person to
mistake it for a current source of truth.

Replace the module docstring at `cocoa_pirates_sim.py:1-4` with a clearly-marked historical header.
It must state, in plain language:

- **What it was for** — the offline balance-and-strategy simulator used to tune the ruleset during
  the game's early design, and a record of the variant mechanics that were tried (the `Rules`
  toggles at `:14-30` are that record).
- **That it is HISTORICAL and models an earlier ruleset**, retained deliberately as part of the
  project's history, and that it is not maintained and must not be used to answer questions about
  how the game behaves today.
- **The specific, named ways it has diverged**, so the claim is checkable rather than vague:
  it has no model of the trade-wind rim at all (the shipped game's round board sweeps ships around
  a rim channel; this file has no such concept); it models an 11-wide square grid where the shipped
  game is a 15-wide round board (`src/engine/index.js` `roundCfg`); and it predates the AI-02
  wind-advantage battle rule, the AI-06 rematch-escalation grudge tuning, and the Phase 14 storm
  rework. Last substantively touched at commit `06005ae`, 2026-07-18.
- **Where measurement happens now** — against the real shipped engine, headless, via
  `scripts/bot_bench.js`, with results in `docs/BOT-BENCH.md`; and the reason, that this file was a
  second implementation of the game that had to be hand-kept in step with the engine and was not.

Do NOT modify any logic, any constant, any default, or any function in the file. Do not "update" it
toward the current rules — that would re-enter exactly the trap this header exists to warn about.
Do not move the file. The diff must be the docstring and nothing else.

Keep it a Python module docstring so `python3 -c "import cocoa_pirates_sim"` still works and
`help()` surfaces the warning to anyone who opens it interactively.
  </action>
  <verify>
    <automated>python3 -c "import cocoa_pirates_sim as m; d=m.__doc__ or ''; assert 'HISTORICAL' in d.upper(), 'header missing'; assert 'bot_bench' in d, 'no pointer to current tool'; assert 'rim' in d.lower(), 'divergence not named'"</automated>
    <automated>git diff --numstat HEAD -- cocoa_pirates_sim.py | awk '{ if ($1 > 60 || $2 > 12) exit 1 }'</automated>
    <automated>python3 -m py_compile cocoa_pirates_sim.py</automated>
    <automated>npm test</automated>
    <automated>git diff --quiet HEAD -- src/engine/index.js</automated>
  </verify>
  <done>`cocoa_pirates_sim.py` still imports and compiles, its docstring marks it unmistakably as historical, names the three specific divergences (no rim, 11-wide grid, predates AI-02/AI-06/Phase 14), and points at `scripts/bot_bench.js` and `docs/BOT-BENCH.md` as where measurement happens now. The diff is confined to the docstring — no logic line changed, file not moved.</done>
</task>

<task type="auto">
  <name>Task 7: the plain-language verdict, the re-record cross-reference, and the flagged parity bug</name>
  <files>docs/BOT-BENCH.md, docs/DETERMINISM-RERECORD-NEXT.md, .planning/todos/pending/bot-rim-escape-live-parity.md, .planning/STATE.md</files>
  <read_first>docs/DETERMINISM-RERECORD-NEXT.md sections 1 and 7 (the queued batch, and the cost stated plainly), .planning/STATE.md lines 140-151 (the standing determinism rule and the existing design-debt entry this parallels), src/engine/index.js:738-742 and src/ui/flow.js:944-948 (the parity gap)</read_first>
  <action>
Four outputs, one commit.

**1. Fill the Verdict at the top of `docs/BOT-BENCH.md`.** Short, plain, no jargon, no data dump —
Wyatt reads this and nothing below it. Report **A and B separately, each against its own bar**:

- For A: did the robot captains get measurably better at winning? Say it in everyday terms — "wins
  about X games in 100 instead of 25". If it is a null, say *"we measured it, it did not make them
  better, so we are not recommending it"* — a complete and successful outcome of this plan.
- For B: do the bots visibly use the trade winds, how often would a player actually see it (in
  games-out-of-100 terms), does a line appear on screen when they do, and did it make them any
  weaker. B's recommendation follows Bar B, not win rate.
- State explicitly if the answer is "A is a null and B ships anyway" — that is coherent, and the
  reader should not have to reconcile it themselves.
- Then: what it would cost to actually make the change, and a one-line recommendation.

**2. State the re-record cost plainly, and cross-reference the queued batch.** Any change to what
bots DO changes the event stream, which invalidates all 31 fixtures in
`scripts/fixtures/determinism/`. Per `docs/DETERMINISM-RERECORD-NEXT.md` section 7 that costs: a
full per-seed attributed divergence report (`node scripts/determinism_diff.js --json`) with every
divergence attributed to a named cause, a blocking human decision on that report, then a single
`--capture`. There is no cheap version. Note the one exception found in Task 5: B's narration half
is UI-tier and costs nothing.

A batch is already queued in `docs/DETERMINISM-RERECORD-NEXT.md` — the engine-purity spec written
2026-07-30 (`spoil` and `gave` becoming data, dropping the `ilabelImg` import, deleting the dead
raider branch). **Bot intelligence should ride the same gated pass rather than paying that cost
twice.** Add a section to that file recording this, following its existing shape (verified line
cites, "nothing here has been applied"):
  - for each variant that met its bar, a full spec item — which method changes, the constraint that
    it must live in `chooseTarget` / `stepToward` so `botTurn` inherits it for free, the UI-tier
    narration companion if Task 5 found one, and a pointer to `docs/BOT-BENCH.md` for the evidence;
  - for each variant that did not, a short pointer recording that it was measured, found not to earn
    its way in, and is deliberately NOT in the batch — so the next person does not re-litigate it
    from scratch.

**3. File the parity bug found in passing.** `takeTurn` at `:738-742` gives a boxed-in bot the
`boxedIn(p) && rimEscape(p)` fallback; `botTurn` at `flow.js:944-948` does not — it just refunds the
coin and the bot sits there. So a boxed-in bot escapes in the headless simulator and is stuck in the
game a player actually plays. Write `.planning/todos/pending/bot-rim-escape-live-parity.md` with the
two line cites, the observation that this is a UI-tier fix requiring no re-record (`botTurn` is not
in the determinism corpus), the note that it is closely related to B's narration half and the two
should probably be done together, and that it must be verified before acting on. Do not fix it here.

**4. Update `.planning/STATE.md`** with a quick-task row matching the existing table format, and add
the bot-intelligence measurement to the design-debt / decisions section alongside the existing
engine-purity entry, pointing at `docs/BOT-BENCH.md`. Record the settled ruling that
`cocoa_pirates_sim.py` is kept and marked historical.

Every number that reaches Wyatt is in plain language. Percentages get a "X in 100 games" gloss.
  </action>
  <verify>
    <automated>head -40 docs/BOT-BENCH.md | grep -qi "verdict"</automated>
    <automated>grep -q "BOT-BENCH" docs/DETERMINISM-RERECORD-NEXT.md</automated>
    <automated>test -f .planning/todos/pending/bot-rim-escape-live-parity.md &amp;&amp; grep -q "flow.js" .planning/todos/pending/bot-rim-escape-live-parity.md &amp;&amp; grep -q "rimEscape" .planning/todos/pending/bot-rim-escape-live-parity.md</automated>
    <automated>grep -q "bot-intelligence" .planning/STATE.md &amp;&amp; grep -q "cocoa_pirates_sim" .planning/STATE.md</automated>
    <automated>npm test</automated>
    <automated>git diff --quiet HEAD -- src/engine/index.js</automated>
    <automated>git diff --quiet HEAD -- src/ui/flow.js</automated>
  </verify>
  <done>`docs/BOT-BENCH.md` opens with a plain-language verdict a non-coder can act on, reporting A and B separately against their own bars and naming the "A null, B ships" case explicitly if that is the outcome. `docs/DETERMINISM-RERECORD-NEXT.md` carries a spec item or an explicit "measured, not recommended, do not re-litigate" pointer per variant. The parity bug is filed as a pending todo with line cites and is NOT fixed. STATE.md records the task and the settled simulator ruling. Engine and flow.js both byte-identical to HEAD.</done>
</task>

<task type="checkpoint:decision" gate="blocking-human">
  <name>Task 8: Wyatt's go/no-go and two open rulings</name>
  <reversibility rating="one-way">Approving an engine change commits the project to a second gated determinism re-record of all 31 fixtures — per docs/DETERMINISM-RERECORD-NEXT.md section 7 there is no cheap version, and the corpus is the multiplayer lockstep oracle.</reversibility>
  <decision>Which of A and B ship, and do they ride the already-queued determinism re-record batch?</decision>
  <context>
Present the Verdict section of `docs/BOT-BENCH.md` and nothing below it. Report A against Bar A and
B against Bar B, separately, in plain language. State the re-record cost plainly and the
recommendation. If A is a null, present that as the finding and recommend not shipping it — do not
soften it, and do not let B's success carry it. If B met its teaching bar but made bots slightly
weaker, put that trade-off in front of Wyatt as a trade-off rather than resolving it silently.
  </context>
  <options>
    <option id="ship-with-batch">
      <name>Approve the recommended change(s); they ride the queued re-record batch</name>
      <pros>One gated `--capture`, not two. The engine-purity spec and the bot changes land together. Evidence-backed against pre-registered bars.</pros>
      <cons>Commits to the full divergence-report-plus-blocking-decision cost, and holds the improvement until the batch is ready to go.</cons>
    </option>
    <option id="ship-b-only">
      <name>Ship only the trade-wind change (B), for its teaching value</name>
      <pros>The likeliest outcome if A is a null: new players learn the rim by watching, and the game gets no measurable strength regression. Smallest possible engine diff.</pros>
      <cons>Still costs a re-record, so it should still ride the batch rather than go alone.</cons>
    </option>
    <option id="ship-alone">
      <name>Approve on its own timeline, ahead of the batch</name>
      <pros>Bots change sooner.</pros>
      <cons>Pays the re-record cost twice. Directly contrary to the batch-together rule already written into `docs/DETERMINISM-RERECORD-NEXT.md` section 7.</cons>
    </option>
    <option id="no-ship">
      <name>Do not ship — record the measurement and stop</name>
      <pros>Correct answer if both bars failed. The measurement still has lasting value: the harness stays, and the next person does not re-litigate it.</pros>
      <cons>Bots stay as they are and the rim stays undiscoverable.</cons>
    </option>
  </options>
  <also-needs-a-ruling>
    1. **Ships stacking on a rim square** — `tradewind()` sets position with no occupancy check, so
       two ships can end up on one square. Pre-existing, present on the storm and flee paths too, but
       B makes it more common. Worth a todo, or accepted as-is?
    2. **The live/headless bot parity gap** — a boxed-in bot escapes via the trade winds in the
       simulator but sits stuck in the real game. Filed as a pending todo in Task 7, closely related
       to B's UI-tier narration half. Fix next alongside it, or leave in the backlog?

    *(The Python simulator question is already settled — kept and marked historical, Task 6.)*
  </also-needs-a-ruling>
  <resume-signal>Select: ship-with-batch, ship-b-only, ship-alone, or no-ship — plus a ruling on each of the two questions above.</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| harness → engine | `scripts/bot_bench.js` monkey-patches `Game.prototype` at runtime. Nothing crosses back: the engine file is never written. |
| harness → documented numbers | `docs/BOT-BENCH.md` claims to describe a specific engine. If the engine moves, the claim silently becomes false. |
| retired sim → future reader | `cocoa_pirates_sim.py` is kept on disk and looks authoritative. A reader mistaking it for current truth is the risk the historical header exists to close. |
| (none) network / user input | The harness takes no network input, reads no untrusted data, and installs no packages. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-BOT-01 | Tampering | `bot_bench.js` prototype overrides leaking into `npm test` | high | mitigate | Harness is standalone and never added to the `test` script; Task 1 gates on the `test` string being byte-identical, and every task re-runs `npm test`. |
| T-BOT-02 | Tampering | `src/engine/index.js` accidentally edited while iterating | high | mitigate | `git diff --quiet HEAD -- src/engine/index.js` is a verify gate on every single task; `src/ui/flow.js` is gated the same way from Task 5 on. |
| T-BOT-03 | Repudiation | Acceptance bars moved after seeing results | high | mitigate | Both bars are committed in Task 2 as their own commit, before Task 3 runs; git history is the proof. |
| T-BOT-04 | Spoofing | Harness measures a different engine than the one its numbers document | medium | mitigate | SHA-256 drift pin on `chooseTarget.toString()` / `stepToward.toString()`, loud abort on mismatch (Task 1). |
| T-BOT-05 | Spoofing | Retired Python simulator mistaken for a current source of truth | medium | mitigate | Task 6's historical header names the specific divergences and points at the current tool; enforced by an import-time assertion in that task's verify. |
| T-BOT-06 | Tampering | Task 6 "improving" the retired sim while marking it | medium | mitigate | Diff size gate (`git diff --numstat`) confines the change to the docstring; no logic line may move. |
| T-BOT-07 | Information disclosure | — | low | accept | No secrets, no network, no user data; output is game statistics. |
| T-BOT-08 | Denial of service | 4000-game runs are slow enough to look hung | low | mitigate | Progress to stderr every 500 games; wall-clock reported; `npm test` untouched so CI cost is unchanged. |
| T-BOT-SC | Tampering | npm/pip/cargo installs | — | n/a | **No package installs in this plan.** Node built-ins and the Python standard library only, no new dependencies, no CDN. The package legitimacy gate does not apply; `package.json` gains only a `scripts` entry. |
</threat_model>

<verification>
Across the whole plan:

- `npm test` exits 0 at every commit (16 gates, 31/31 determinism seeds).
- `git diff --quiet HEAD -- src/engine/index.js` passes at every commit — **the engine diff stays
  empty for this entire plan**, and `src/ui/flow.js` is untouched too.
- `package.json`'s `test` script string is byte-identical to HEAD; only a `bench:bots` entry is added.
- No new dependencies: `scripts/bot_bench.js` imports only Node built-ins and
  `scripts/lib/load_engine.js`.
- `cocoa_pirates_sim.py` still imports and compiles, with no logic line changed.
- Every recorded number is reproducible from a command written next to it in `docs/BOT-BENCH.md`.
- `node scripts/bot_bench.js --selfcheck` passes after every variant is added — the control never
  moves.
</verification>

<success_criteria>
1. A single command measures bot strength on the real shipped engine, and proves itself by
   reproducing the 25% null before it is trusted to detect a departure from it.
2. Baseline numbers and BOTH acceptance bars are committed before any improvement is measured.
3. A, B and AB are each measured separately in both contest and all-treated modes at n=4000, with
   standard errors, and each result is attributable to its own change.
4. A is judged on whether it wins more games. B is judged on whether it is demonstrable, harmless
   and legible. Neither bar is applied to the other variant, and "A is a null, B ships" is stated as
   a coherent outcome if that is what the data says.
5. Bar B condition 3 is answered with evidence, not assumed: either the rim sweep's narration line
   reaches a watching player, or the located UI-tier fix that would make it so is specified.
6. `docs/BOT-BENCH.md` opens with a verdict a non-coder can act on, including an honest null result.
7. No engine change is committed. The re-record decision is Wyatt's, presented with its real cost
   and cross-referenced to the already-queued batch.
8. `cocoa_pirates_sim.py` is kept and marked unmistakably historical, with its logic untouched.
9. The two remaining side findings (the unguarded rim sweep, the live/headless parity gap) are
   surfaced as questions with evidence, not silently decided.
</success_criteria>

<output>
Create `.planning/quick/20260730-bot-intelligence/SUMMARY.md` when done.
</output>
</content>
