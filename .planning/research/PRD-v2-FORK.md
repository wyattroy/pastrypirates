# PRD — Pastry Pirates v2 (fork)

**2026-08-03.** A clean build of Pastry Pirates on the v2 ruleset
(`.planning/research/RULESET-v2-PROPOSED.md`), reusing what is good in the current codebase and
rebuilding what has been patched past the point of being worth keeping.

Bot behaviour is specified separately in `.planning/research/BOT-STRATEGY.md` — it is a hard
requirement of this build, not a nice-to-have.

---

## 1. Why fork rather than patch

The v2 ruleset changes things the current architecture assumes are fixed:

- **Trade is an open outcry, not a private ask** — one call to the whole table, one round of answers,
  one pick. The current architecture has no shape for "everyone answers at once and the caller
  chooses", and the naive alternative (asking each rival in turn) is a dozen prompts a turn.
- **Storms move every ship at once, before anybody's turn.** Today the storm is a per-turn push
  resolved inside `takeTurn`, square by square, with its own animation loop. It is also the source
  of the Safari performance bug.
- **The Shared Cast is a table-wide simultaneous beat.** Nothing in the current engine has a shape
  for "every captain decides at once, then one shared coin resolves for all of them." The narration
  layer in particular assumes one actor per line.
- **Trade is a first-class action** — ~17 deals a game, up from ~2.5, and it is what a captain does
  while crossing open water. It cannot stay an occasional action with a bespoke prompt.
- **Battles resolve in one reveal instead of a flip race**, so `asyncBattle`'s entire round loop,
  its scoreboard states and its per-flip pacing constants go away.

Roughly a third of `src/orchestrator.js` and `src/ui/flow.js` exists to serve mechanics v2 deletes.
Patching would leave that code in place, guarded by flags, in a file that already carries comment
archaeology from four milestones.

**What is genuinely worth carrying over is substantial** (§6) — the board generation, the asset
pipeline, the determinism harness, the narration copy corpus and the whole test suite. This is a
fork, not a rewrite from zero.

---

## 2. Non-negotiables

These come from the project's own history and are not up for rediscovery.

| # | Requirement | Why |
|---|---|---|
| **N1** | **Hosts and guests receive the same game and the same narration.** One render path, one narration source, byte-identical output for the same seat. | A guest once drew its own class-less highlight rect and `.sailCell` matched nothing; three turns were silently lost to it. `host_guest_parity_check.js` exists because this recurred. |
| **N2** | **Bots and humans play the same game by the same rules.** There must be exactly one rules implementation. | Today `Game.battle()` and `asyncBattle()` are two implementations of one mechanic, kept in step by hand and by comment. They have drifted before. |
| **N3** | **Determinism and replay stay intact.** Seeded RNG, no wall-clock or `Math.random` in the engine, every game replayable from its seed and decision log. | The entire test suite depends on it. |
| **N4** | **The narration box reveals top to bottom** — back button, then message, then buttons, then helper text — in that order, and anything added later follows its visual position. | Standing design rule, Wyatt 2026-08-01. Two separate playtest findings traced to violating it. |
| **N5** | **A storm must not crash the game, and pausing the timer must never destroy state.** | The stated core value of the current milestone. |
| **N6** | **The voice boundary holds.** In-world text is pirate voice; credits and About are Wyatt's own plain first person. | Lost once already and had to be re-recorded. A `ye`/`you` difference between them is correct, not drift. |
| **N7** | **Safari is a first-class target**, tested at 331px and up. | The storm perf bug was Safari-specific; the narrow-width clipping bugs were all found there. |
| **N8** | **`CNAME`, `robots.txt` and `sitemap.xml` never leave this repo.** The fork gets its own, or none. | Two sessions came within one command of taking the live game down. |
| **N9** | **Timer-driven animation, never `requestAnimationFrame`,** for anything the game loop awaits. | rAF is fully suspended in a hidden tab; an awaited rAF loop freezes the game the moment a player switches tabs. Reproduced live. |

---

## 3. The central architectural idea: one engine, one decision seam

Everything else in this document follows from this.

**The engine never asks a UI anything. It advances until it needs a decision, emits a request, and
waits for a response.** Who supplies that response — a human clicking, a bot strategy, a replay log,
a network message from the host — is not the engine's concern.

```
                    ┌──────────────────────────────┐
                    │           ENGINE             │
                    │  pure, seeded, DOM-free      │
                    │  the only rules in the game  │
                    └──────┬────────────▲──────────┘
                  emits    │            │  receives
            DecisionRequest│            │DecisionResponse
                           ▼            │
        ┌──────────────────────────────────────────────┐
        │                  RESOLVERS                   │
        │  human (UI)  ·  bot (strategy)               │
        │  replay (log) ·  guest (network)             │
        └──────────────────────────────────────────────┘
```

A `DecisionRequest` is data: `{ id, seat, kind, options, deadline }`. A `DecisionResponse` is data:
`{ id, choice }`. Both are serialisable, which is what makes the rest work.

**What this one seam buys:**

- **N2 for free.** A bot is a resolver. A human is a resolver. There is no `botTurn` / `humanTurn`
  fork in the rules, because there is no rules code outside the engine.
- **N3 for free.** The decision log plus the seed *is* the replay. No separate recording path.
- **N1 nearly for free.** A guest resolves nothing and renders the same event stream the host does.
- **The headless simulator is a resolver too**, so balance work runs the shipped rules, not a port.
  `scripts/wyatt_ruleset_sim.mjs` becomes unnecessary the day this lands — which is the point.

**Simultaneous decisions are first class.** The engine may emit several requests at once and wait for
all of them. The Shared Cast, the storm and the trade outcry all need this; the current architecture
cannot express any of them.

### The three shapes every v2 decision fits into

| Shape | Used by | Emits |
|---|---|---|
| **One captain chooses** | sail, act, dock, recipe draft | one request, one seat |
| **Everyone chooses at once** | the Shared Cast, battle commitment, the Lookout | N requests, all seats, resolved together |
| **One calls, the rest answer, the caller picks** | the trade outcry, **taken as an action** | one request → N requests → one request |

The third is new and it is the one to design for deliberately. It resolves in exactly **three engine
steps** and no more, which is what lets a shot clock always finish it:

```
1. OFFER     the active captain names both sides      "I want cocoa, I'll give 6"
2. ANSWER    every other captain, simultaneously      no / yes / a counter that undercuts
3. PICK      the offerer chooses one answer, or walks
```

**Bound it at one round of answers.** Open-ended haggling has no natural end, cannot be resolved
against a clock, and — modelled — does not add anything: 52% of offers already draw more than one
answer, so the undercutting happens *inside* step 2. A captain who is silent at step 2 has refused
in public, which is what licenses a battle later (`BOT-STRATEGY.md` §5).

### Module map

```
src/
  engine/        rules, board, resolution. Pure. No DOM, no clock, no Math.random.
  strategy/      bot resolvers. Implements BOT-STRATEGY.md. Pure.
  narrate/       events -> lines. Pure, data-driven, addressed variants.
  ui/
    render/      state -> DOM. One direction. No rules.
    input/       DOM -> DecisionResponse.
    reveal/      the narration box: timing, ordering, measurement.
  net/           transport + a watcher registry. No rules, no rendering.
  app/           wiring only.
```

**Test the boundary, don't trust it.** Keep `module_graph_check.js` and extend it: `engine/` may not
import from anything else; `strategy/` may import `engine/` only; `narrate/` may not import `ui/`.

---

## 4. Events: one registry, or it will happen again

Today an event is an untyped object literal and `describe()` is a switch over `e.t`. Typos are
invisible, the schema exists only in test scripts, and adding a field means editing several files
that do not know about each other.

**This is not hypothetical — it is what the 2026-08-04 playtest hit.** The first v2 build emitted 21
event types and narrated 18. The three it missed included `turn`, so a player could not see whose
turn it was and the whole log read as an ownerless stream. A Trawler surviving a bust and a Gambler
taking a rung higher were invisible for the same reason: buried inside an event nobody had unpacked.
**Both are one bug — the event and its narration lived in different files, so one could exist
without the other and nothing complained.**

**v2 answer: `v2/events.js`.** One table. Every event type is declared exactly once with its fields,
its narration tier, and the line that describes it. `emit()` **throws** on an unregistered type, so
a new event cannot be added without its line. `checkRegistry()` asserts every entry has one, and the
self-test additionally narrates every event of every game and fails if any produces nothing.

```js
export const EVENTS = {
  turn: R(TIER.BEAT, ["p"], (e, c) => `⚓ ${c.name(e.p)} takes the wheel…`),
  ...
};
```

Events also carry a declared shape and a schema version.

```js
export const Events = {
  storm:     (dir, moves)          => ({ t:"storm", v:1, dir, moves }),   // moves: per-seat results
  cast:      (caller, rungs, take) => ({ t:"cast", v:1, caller, rungs, take }),
  trade:     (a, b, gave, got, px) => ({ t:"trade", v:1, a, b, gave, got, px }),
  battle:    (a, d, ca, cd, win)   => ({ t:"battle", v:1, a, d, ca, cd, win }),
  ...
};
```

Non-negotiable properties:

- **One event per game-visible thing that happened.** A storm is *one* event carrying every ship's
  result, not four. The cast is *one* event carrying the whole ladder and everybody's take. This is
  what lets the narration and the animation treat them as the single simultaneous beats they are.
- **Events are the only input to narration and to rendering.** If the UI needs something, it goes in
  the event.
- **A `v` on every event.** A replay recorded before a schema change must fail loudly, not silently
  render wrong.

---

## 5. The wind vane

The wind vane is now a **two-state instrument**, and the rules depend on players reading it
correctly. It gets its own section because getting this wrong makes the game unplayable.

> **The vane records the wind that is blowing NOW, and predicts the wind that will blow NEXT round.**

### At a physical table

The vane is **two stacked arrows on one spindle**:

- The **lower arrow is stiff** — friction-mounted, so it stays exactly where it is put. It shows the
  wind that is **blowing this round**.
- The **upper arrow spins freely.** It shows **next round's** wind.

**At the start of every round, in this order:**

1. **Move the lower (stiff) arrow to wherever the upper arrow is pointing.** Last round's prediction
   is now this round's wind.
2. **Spin the upper arrow.** Wherever it stops is next round's wind — and every captain can now plan
   two turns of sailing.

The two arrows must be **visually distinct at a glance and from across the table**: different length,
different colour, ideally different silhouette (a broad weathervane below, a slim needle above). A
player who confuses them plays the whole round upwind by mistake.

**Storms.** Whether next round is a gale is decided at the same moment as its direction, so the
upper arrow's face needs a storm marker — a sector of the dial, or a token dropped on the arrowhead.
It travels down with the arrow at step 1.

### In the app

The same instrument, animated:

- **The current wind is shown on the water, not only on the dial** — drifting dots or streaks across
  every ocean square, moving in the wind's direction. This is the primary readout. The measured
  problem with the shipped game is that the wind lives in a corner dial and players do not feel it;
  putting it on the sea is the fix.
- **The dial keeps both arrows**, mirroring the physical component exactly, so a player who learns
  one can play the other.
- **The round-start transition is a single animated beat:** the lower arrow swings to the upper
  arrow's heading, then the upper arrow spins and settles. One beat, ~1.2s, and it is the moment the
  table looks up.
- **A gale next round** tints the upper arrow and the dots pre-echo it.
- **Reduced motion:** dots become static directional marks; the arrows cut rather than sweep.

---

## 6. Narration — the biggest rewrite

### What is wrong today, measured

A round takes **57.7 seconds**, of which roughly **37 are narration**. Every line costs
`characters × 20ms` to reveal plus a hold of `clamp(800, 500 + 20/char + 300/pause, 2000)`. A typical
70-character line is **3.4 seconds**, and a bot turn produces three or four of them. The pacing model
predicts the measured round almost exactly. **The game is not slow; it is spending 37 seconds a round
telling you what just happened.**

v2 makes this worse before it makes it better: there are now ~38 trades a game to narrate, and two
genuinely simultaneous events that the current one-actor-per-line model cannot express at all.

### The redesign

**1. Narration is derived, never authored at the call site.** `narrate/` is a pure function from an
event to a line (plus addressed variants). No `flash("...")` calls scattered through the flow. This
is already half-true via the `@copy` tags and the audit corpus — finish it.

**2. Three tiers, with different budgets.**

| Tier | What | Budget |
|---|---|---|
| **Beat** | Something the table must watch: a storm, the cast, a battle resolving, someone finishing | full reveal + hold, ~1.5–2s |
| **Line** | A normal action: a dock, a trade, a sail | ~0.8s, no hold — the next line replaces it |
| **Ticker** | Routine flow: passes, sails with nothing else | no line at all; the board shows it |

The current game treats everything as a Beat. Most turns in v2 are a Line or a Ticker.

**3. Simultaneous events get simultaneous narration.** A storm is **one** line naming every ship's
outcome, delivered once, while all four boats animate together — not four sequential lines. The
Shared Cast is one running line whose pot updates in place as the ladder climbs, then one settlement
line. Serial narration of a simultaneous event is the specific thing to avoid.

**4. Cut the per-character budget.** Proposed starting point: `12ms/char` reveal and a `1200ms`
hold ceiling, taking a 70-character line from 3.4s to 2.0s. That is a taste call to be tuned on
screen, not a verdict — but the direction is not in doubt.

**5. N4 still governs.** Reveal order follows visual position, top to bottom, for anything in the
box, including anything added later.

**6. N1 applies to narration specifically.** The addressed-variant mechanism (each seat sees the
line written to them, everyone else sees third person) is good and stays. It must be produced by the
same pure function on host and guest.

### Keep the corpus

`scripts/extract_narration_lines.js` and `narration_audit_check.js` and the approved-copy records are
genuinely valuable and hard-won. **The copy survives the rewrite even though the delivery does not.**
Port the corpus, keep the audit gate, and keep the approved-vs-shipped discipline that caught the
credits-voice error.

---

## 7. What to carry over from the current codebase

Reuse verbatim or near-verbatim:

- **Board generation** — `Game`'s constructor: the circular valid-cell set, tetromino island shapes,
  single-berth dock placement, the four rim arcs and `rimHead`. It is good code and v2 does not
  change the board.
- **`mulberry32` and the seeded-RNG discipline.**
- **The whole asset pipeline** — `ING_IMG`, `EMOJI_IMG`, `emojify()`, the load-failure fallback to
  emoji, `preloadAssets()`. Unchanged.
- **The narration copy corpus and its audit tooling** (§6).
- **`sailHighlightRect()`** and the shared-render discipline it represents (N1).
- **The determinism harness** — `determinism_baseline.js`, `dlog_replay_test.js`. Adapt to the
  decision log; the concept is exactly right.
- **The contract checks** — `module_graph_check.js`, `no_undef_check.js`, `ui_contract_check.js`,
  `host_guest_parity_check.js`. Every one of them exists because something broke. Keep and extend.
- **The Lookout's Call** — mechanic and copy. It is the best off-turn device in the game.
- **Sound mapping** (`audio.js`) — the map survives; the trigger points move.

Do **not** carry over: `asyncBattle` and its scoreboard states, the storm push loop, the fishing
flow, `Game.battle()` as a second implementation, or the `stepDelay()`-derived pacing constants.

---

## 8. Milestones

Each ends with a working, playable thing. No milestone is "refactor only".

| # | Deliverable | Done when |
|---|---|---|
| **M1** | **Engine + decision seam.** Board, movement, all v2 rules, `DecisionRequest`/`Response`, event factories. No UI. | The headless sim runs the shipped engine and reproduces the balance figures in the ruleset doc |
| **M2** | **Bot resolvers.** BOT-STRATEGY.md implemented against the engine. | Trades ≥20/game and battles ≤15% of actions on the shipped bots; turn-distance targeting verified |
| **M3** | **Render + input, solo play.** Board, ships, the wind vane with both arrows and the water dots, the three narration tiers, and the **three-step trade outcry** as a first-class UI flow. | A full solo voyage is playable in Chrome and Safari at 331px; an offer, four answers and a pick fit on a 331px screen without clipping |
| **M4** | **The two simultaneous beats.** Storm-moves-everyone and the Shared Cast, animation and narration. | Storm animates all four ships in one beat; the cast reads as one shared ladder; no Safari jank |
| **M5** | **Multiplayer.** Transport, watcher registry, guest rendering, the shot clock. | Host and guest produce byte-identical narration for the same seat; pausing the timer never mutates state |
| **M6** | **End of voyage, credits, About.** | Voice boundary verified: in-world pirate, credits plain first person |

---

## 9. Verification gates

Ported from the current suite, plus what v2 needs:

- **Determinism**: same seed + same decision log → identical event stream. Re-recorded per milestone.
- **Host/guest parity**: the same event stream rendered by both paths produces identical DOM for the
  same seat. Extended to narration strings, not just highlight rects.
- **One rules implementation**: a check that fails if any rules logic appears outside `engine/`.
- **Module graph**: import direction enforced (§3).
- **Narration audit**: every player-facing string traceable to approved copy; voice boundary
  asserted for credits and About.
- **Balance regression**: the headless sim runs the shipped engine on every CI run and fails if
  trades/game, battles-as-share-of-actions, coins-at-end or seat spread drift outside the bands in
  BOT-STRATEGY.md §8.
- **Safari at 331px**: the narrow-width and storm-performance cases, by hand, once per milestone.

**Also: reconcile the rulebooks.** `RULES.md` and `Rules_boardgame.md` currently describe a battle
system the engine stopped running some time ago, and call the home port Barbados where the game says
Isle of Tortuga. The fork's rulebook should be **generated from the same constants the engine reads**,
so there are two artefacts rather than four and one of them cannot drift.

---

## 10. Risks

| Risk | Mitigation |
|---|---|
| **The decision seam is over-engineered for a browser game.** | It is one request type and one response type, both plain data. If M1 cannot express the whole ruleset through it, stop and simplify rather than adding a second path. |
| **Simultaneous animation is where the Safari bug lives.** | M4 exists specifically to face it early, with the perf-measurement discipline in `docs/DRIVING-THE-GAME.md` §8a — drive frames, quote fps beside every cost figure, attribute by ablation. |
| **Narration budget cuts land as "it feels rushed".** | Ship the three tiers with the constants exposed and tune on screen with Wyatt. The tiering is the change; the numbers are a starting point. |
| **Bot strategy is the difference between two different games.** | It is a gated requirement (M2) with numeric bands, not a polish item. |
| **The fork diverges and both games need maintaining.** | Decide up front whether v1 keeps receiving fixes. Recommendation: freeze v1 at its current milestone once M3 is playable. |
| **Boat powers are unfinished.** | Eight are specified and measured to a 10.8-point spread; two of those are still ~5 points light. They are the most tunable thing in the game and should be playtested, not simulated further. |
