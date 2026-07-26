# Phase 8: Engine Extraction & Node Harness Migration - Research

**Researched:** 2026-07-24
**Domain:** Vanilla-JS ES-module extraction from a monolith, with a script-ordering bridge problem and an RNG-determinism regression gate
**Confidence:** HIGH — every claim below was verified against the actual `index.html` source (line numbers cited), not assumed. Grep commands are reproducible.

## Summary

This phase's two hard problems (Q1 bridge/ordering, Q2 order-load-bearing RNG state) both have **concrete, verified answers**, not just strategies. The classic script at `index.html:859` genuinely does more than reference engine constants — it also **directly calls `game.r()`** (the seeded RNG accessor) from a completely separate, hand-duplicated live/multiplayer turn loop (`runLiveNet`/`botTurn`/`windLeg`) that reimplements `Game.play()`'s round logic with async animation beats. This means the bridge's job is not "expose a few constants" — it is "make an entire live `Game` instance and its whole public method surface addressable by bare identifier from code that already assumes it always was." The good news: because JS classes/functions carry their own methods, the bridge surface is small (the `Game` class + `roundCfg` + ~15 free functions/constants), not "every method individually."

The RNG-desync risk (STATE.md's top-recorded concern) has one genuinely load-bearing chain that would silently break **every seed simultaneously, from the constructor onward**: `index.html:1199`'s `Object.values(DIRS)` iteration order determines the exact element order of a candidate-cell array that `index.html:1210` then picks from via `pool[Math.floor(this.r()*pool.length)]`. Reorder `DIRS`'s keys during the move and every dock position — hence every downstream decision in every seed — changes for an identical RNG draw. `TET` (line 968) and the `[3,2,1]` spacing literal (line 1142) are the same class of hazard. Several other `DIRS`-consuming sites (player spawn assignment, Dijkstra tie-breaks, `rimEscape`'s direction choice) are order-load-bearing for **byte-for-byte state parity** even though they don't touch `this.r()` directly — they still break the corpus hash if reordered.

A third finding, not anticipated in CONTEXT.md: exactly **one** statement in the classic UI region executes at true module-body top level (not inside any function) and references a symbol that's moving — `index.html:2095`'s `RECIPE_BOOK.forEach((r,i)=>r.img=\`${ASSET_BASE}pastries/...\`)`. Because module scripts are *always* deferred past every classic script's full synchronous execution, no bridge-population trick can make this line safe by timing alone — it must be wrapped in a function and its invocation deferred until after the bridge is populated. This is the "hard case a bridge alone cannot fix" that D-14 anticipated, now located precisely.

**Primary recommendation:** Extract `src/engine/` (Game class, `roundCfg`) and `src/shared/` (DIRS-family, image maps, RNG, `man`, `TET`, bot-weight tables, narration helpers) per D-03/D-04's dependency-depth ordering — which, conveniently, is **already the monolith's own top-to-bottom source order**, so no reordering is needed to avoid TDZ/circular-import hazards. Bridge via `window.PP = {...}` (satisfies D-14's "named" requirement and Phase 11's removal-grep) **plus** `Object.assign(globalThis, PP)` so the ~150+ pre-existing bare-identifier call sites in classic UI code need zero edits (satisfies D-15's minimal-blast-radius mandate). Invert control: delete the classic script's trailing `boot();` call (function declarations are still `window` properties automatically — no bridge needed for `boot` itself) and have `src/main.js` call `window.boot()` after populating the bridge and running two small newly-introduced wrapper functions that defer the D-06 impurities and the `RECIPE_BOOK.forEach` hazard.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Deterministic game simulation (Game class, bot AI, battle math, RNG) | Engine module (`src/engine/`) | — | Pure logic, no DOM/network; must be importable identically in Node and browser |
| Shared constants/pure helpers (DIRS family, image-path maps, `man`, `mulberry32`, `TET`, narration helpers) | Shared leaf module (`src/shared/`) | Engine, Browser/Client | Consumed by both the engine and the not-yet-extracted UI/live-loop code; zero dependency on Game itself |
| Live/async turn orchestration (`runLiveNet`, `botTurn`, `humanTurn`, `windLeg`) | Browser/Client (classic script, unmoved) | Engine (via bridge) | Duplicates `Game.play()`'s round logic with animation beats; calls `game.r()` and Game instance methods directly — stays classic-region this phase (UI extraction is Phase 11) |
| Script-ordering bridge (`window.PP`, `Object.assign(globalThis,...)`) | Browser/Client (module entry, `src/main.js`) | — | Temporary strangler-fig seam; Phase 10/11 formally migrate consumers off it and delete it |
| Node determinism harness (`scripts/determinism_baseline.js`, `real_game_test.js`, `dlog_replay_test.js`) | Node / Test tier | Engine module | Imports the engine natively via `load_engine.js`; never touches DOM |
| `engineSourceHash` computation | Node / Test tier | — | Must re-derive from the relocated `src/engine/` + `src/shared/` source files, not `index.html` text |

## Package Legitimacy Audit

**Not applicable this phase.** Zero external packages are introduced — `package.json` has no `dependencies`/`devDependencies` keys today (confirmed: Phase 7 shipped it with none, and this phase adds no new tooling beyond native ESM). No `npm install`, no registry lookups needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SPLIT-01 | Deterministic engine (Game, roundCfg, bot strategies, RNG, replay) in its own DOM-free, Firebase-free ES module(s) | Q4 confirms the monolith's existing top-to-bottom source order already matches D-04's leaves-first dependency depth — no reordering needed; module boundaries and file list given below |
| SPLIT-02 | Shared constants/pure helpers in leaf modules importable by engine, UI, net, and Node harnesses | Full symbol inventory below (Q1a), cross-checked against actual classic-region usage via grep — nothing estimated |
| ENGINE-01 | Engine module pure — no DOM/window/Firebase/wall-clock/unseeded-random; 3 asset/DOM touches relocated | Confirmed via exhaustive grep: exactly the 3 known impurities (`:920`,`:922`,`:1002`) plus `$` (`:1812`, already correctly excluded by D-07); zero `firebase`/`localStorage`/`Date.now`/`Math.random`/`globalThis`/`new Function` anywhere in the region |
| ENGINE-02 | Node harnesses import natively, retiring `vm`/string-slice extraction, same commit as extraction | `load_engine.js`'s body-only change confirmed sufficient; `dlog_replay_test.js`'s **separate** `replayShortfall` sentinel extraction is explicitly out of scope (Q4/scope note below) |
| ENGINE-03 | Seeded gameplay + replay byte-for-byte identical to Phase 7 baseline | `--verify`'s SOURCE classification already tolerates a moved-but-identical engine (diagnostic only, never gates exit code) — confirmed in `determinism_baseline.js:219-232` |
| ENGINE-04 | Order-load-bearing constants preserved and annotated | Full Tier-1/Tier-2 list with line numbers in Q2 answer below — the research task D-10 asked for |

</phase_requirements>

## Standard Stack

No new libraries. This phase is a pure code-motion + native-ESM-adoption exercise within the existing zero-dependency, zero-build constraint (CLAUDE.md: vanilla JS, no framework, no bundler).

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|---------------|
| Native ES modules (`<script type="module">`, `import`/`export`) | ECMAScript 2015+ / Node 18+ | Module system for the split | Already the project's chosen mechanism (Phase 7 D-13/D-19); no bundler exists to introduce |
| Node.js `node:crypto` | Node 18+ built-in | `engineSourceHash` recomputation | Already used by `load_engine.js`/`determinism_baseline.js`; no new dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `window.PP` + `Object.assign(globalThis, PP)` bridge | Rewrite every classic call site to `PP.X` | Cleaner long-term, but ~150+ mechanical edits across the classic region this phase, inflating blast radius against D-15's explicit caution. Rewriting is Phase 10/11's job when de-globalization happens anyway. |
| `Object.assign(globalThis, PP)` for the bridge | Classic-script `let X;` pre-declarations written by the module | Both are spec-legal (classic-script top-level `let` and module top-level code share the same Realm's global environment). `Object.assign(globalThis,...)` was chosen because it requires **zero** new declarations in the shrunk classic script and mirrors this project's own existing pattern (`firebase` global from the classic compat SDK tags) — lower risk of a typo'd/missing pre-declaration. |

**Installation:** None — no new packages.

## Architecture Patterns

### System Architecture Diagram

```
   index.html parse (synchronous, top-to-bottom)
   ────────────────────────────────────────────────────────────────
   [classic <script> block, index.html:859]
     │
     ├─ (ENGINE REGION REMOVED — was :859-:1827, now lives in src/)
     │
     ├─ UI declarations (RECIPE_BOOK, drawBoard, render, EVENT_NARRATION, ...)
     │     └─ index.html:2095  RECIPE_BOOK.forEach(...ASSET_BASE...)  ◄─ TOP-LEVEL HAZARD
     │        (wrapped in attachPastryArt(), NOT called yet)
     │
     ├─ live/async turn loop (runLiveNet, botTurn, humanTurn, windLeg, reachable)
     │     — duplicates Game.play()'s round logic; calls game.r() and Game
     │       instance methods directly, all inside function bodies (deferred)
     │
     └─ function boot(){...}  ◄─ DECLARED, no longer self-invoked
   ────────────────────────────────────────────────────────────────
   classic script finishes executing (parser continues past </script>)
   ────────────────────────────────────────────────────────────────
   [<script type="module" src="src/main.js">, deferred — runs AFTER
    every classic script above has fully finished]
     │
     ├─ import * as shared from "./shared/index.js"   (DIRS family, image
     │     maps, man, mulberry32, TET, HEXCOL, narration helpers, ...)
     ├─ import * as engine from "./engine/index.js"    (Game, roundCfg)
     ├─ const PP = {...shared, ...engine}
     ├─ window.PP = PP                     ◄─ named, documented, greppable
     ├─ Object.assign(globalThis, PP)      ◄─ makes bare classic-region
     │                                        identifiers resolve correctly,
     │                                        with ZERO classic-code edits
     ├─ applyEngineBootstrapEffects()      ◄─ the 3 D-06 impurities, now
     │                                        UI-side, run once here
     ├─ attachPastryArt()                  ◄─ the ASSET_BASE hazard, now safe
     └─ window.boot()                      ◄─ inversion of control (D-14)
   ────────────────────────────────────────────────────────────────

   [Node test harnesses — scripts/lib/load_engine.js]
     loadEngine() ── native `import("../../src/engine/index.js")` ──►
       { Game, roundCfg, sourceHash }
     (sourceHash now = sha256 over src/engine/**.js + src/shared/**.js
      source text, path-prefixed, sorted — see Q3 answer)
```

### Recommended Project Structure
```
src/
├── main.js              # module entry — now ALSO the bridge populator + boot() trigger
├── module-contract.js    # unchanged (Phase 7 leaf, still proves the loading contract)
├── shared/
│   ├── rng.js            # mulberry32
│   ├── directions.js     # DIRS, DIRNAME, PERP, STORM_DIAG, OPPOSITE, windStepCost — ORDER-LOAD-BEARING, see below
│   ├── geometry.js        # man, TET  — ORDER-LOAD-BEARING (TET)
│   ├── ingredients.js     # ING_ALL, ING_EMOJI, ING_NAME, ING_PLAIN, DOCK_PLACE, DOCK_FLAVOR, dockPlace, dockFlavor, iname, ilabel
│   ├── assets.js          # ASSET_BASE + every *_IMG constant, BOAT_IMG, ISLAND_SHAPE_IMG, EMOJI_IMG, EMOJIFY_RE, emojify, ingImg, ilabelImg, iconImg
│   ├── names.js           # NAMES, DEFAULT_NAMES, unusedDefaultName, COLORS, HEXCOL
│   └── index.js           # barrel re-export (Claude's discretion per CONTEXT.md)
├── engine/
│   ├── weights.js         # PERSONALITY, AW, TW, DW, FISH_BASE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD
│   ├── rollStorm.js       # rollStorm(g)
│   ├── game.js            # class Game (the ~730-line class body, verbatim)
│   ├── roundCfg.js        # roundCfg(strategies)
│   └── index.js           # barrel re-export: { Game, roundCfg }
└── (ui/, net/ — Phases 9/11, not this phase)
```
File boundaries above are illustrative (Claude's Discretion per CONTEXT.md) — the load-bearing constraint is dependency depth (D-04), which the monolith's own source order already satisfies (see Q4 below). A single `src/shared/index.js` + `src/engine/index.js` two-file split is equally valid if the planner prefers fewer files; either way `scripts/lib/load_engine.js` only imports the two barrel files.

### Pattern 1: Inversion of control at the classic/module boundary (Q1 answer)

**What:** The classic `<script>` no longer self-starts by calling `boot()` at its own top level. Instead, `src/main.js` — which necessarily runs *after* the classic script finishes (module scripts are always deferred, HTML spec) — populates the bridge and then explicitly triggers `window.boot()`.

**When to use:** Any time a classic script needs a value that only exists after a module has run. This is the ROADMAP-sanctioned mechanism (`window.PP`, removed Phase 11).

**Why `Object.assign(globalThis, PP)` in addition to `window.PP`:** Confirmed via exhaustive grep that classic UI code references these symbols as **bare identifiers** in ~150+ call sites (`DIRS`×13, `HEXCOL`×21, `iconImg`×27, `ilabelImg`×20, `man`×9, `ING_EMOJI`×8, `iname`×7, `DIRNAME`×6, `Game`×6, `roundCfg`×5, `NAMES`×5, `ISLAND_SHAPE_IMG`×4, `ingImg`×4, `ASSET_BASE`×3, `TET`×3, `emojify`×3, `BOARD_IMG`×2, `DOCK_IMG`×3, `TRADE_SWIRL_IMG`×3, `WIND_ARROW_IMG`×2, `rollStorm`×2, `windStepCost`×2, `EMOJI_IMG`×2, `BOAT_IMG`×2, `PERP`×2, `DEFAULT_NAMES`×2, plus single references to `ING_ALL`, `STORM_DIAG`, `unusedDefaultName`, `dockPlace`, `dockFlavor`, `ING_HOLE_IMG`, `COMPASS_NEEDLE_IMG`). Rewriting all of these to `PP.X` this phase would be a large mechanical edit outside D-15's "minimum surface" mandate. `Object.assign(globalThis, PP)` makes every one of these resolve correctly with **zero edits to the classic region's existing call sites**, because none of these names are locally declared anywhere else in the classic script (verified — see verification command below) — after extraction there is no competing lexical binding, so bare-identifier lookup falls through to the global object, exactly the same mechanism this project already relies on for the Firebase `firebase` global from the classic compat SDK `<script>` tags.

**Confidence:** HIGH for the underlying JS semantics (classic-script-declared `let`/`const` populate the shared Realm global lexical environment; module top-level code shares that same Realm and can read/write global-object properties same as any script) — this is standard, spec-defined behavior, not implementation-specific. Because this is the single most load-bearing architectural bet in the phase, **recommend a Wave 0 tracer task** that proves it empirically in this exact page (declare a value only in the module, assign it to `globalThis`, and confirm a classic-script function that runs afterward reads it correctly) before building the full extraction on top of it — cheap, and removes all doubt before the expensive part of the phase.

**Verification that no name collisions exist** (must be re-run against the *full* symbol list before implementation, not just the sample below):
```bash
for name in DIRS man HEXCOL Game roundCfg ASSET_BASE; do
  grep -n "^\(const\|let\|class\|function\) $name\b" index.html
done
# Each name should appear exactly once, inside the extraction region.
```

### Pattern 2: The two top-level hazards that a bridge alone cannot fix (Q1c answer)

**What goes wrong:** Module scripts execute strictly after *every* classic script's synchronous body has finished — not after the classic script "gets to" the module tag, but after the *entire document* has been parsed and every non-deferred classic script anywhere in it has run. Therefore any classic-region statement that executes immediately (module-body top level, not inside a function later called) and references a symbol that moved to `src/` **cannot** be fixed by any bridge-population trick, no matter where the bridge code runs, because the hazard statement has already thrown before the bridge could possibly exist.

**Confirmed exhaustive list of these hazards** (found by extracting every top-level statement in the classic region — `index.html:1828`–`5636` — that is not a `const`/`let`/`function`/`class` declaration, then checking each for a reference to a moving symbol):

1. **`index.html:2095`** — `RECIPE_BOOK.forEach((r,i)=>r.img=\`${ASSET_BASE}pastries/${PASTRY_FILES[i]}.png\`);` — references `ASSET_BASE` (moving to `src/shared/`) at true top level. **Fix:** wrap in a function (e.g. `function attachPastryArt(){RECIPE_BOOK.forEach(...)}`) and call it from `src/main.js` after the bridge is populated. `RECIPE_BOOK.img` is only ever read later inside rendering functions (`recipeCardHTML`, `recipeModalHTML`), so deferring the assignment by a few dozen milliseconds has no observable effect.
2. **`index.html:5636`** — `boot();` — the classic script's own self-invocation. **Fix:** delete this line; `src/main.js` calls `window.boot()` instead (see Pattern 1). Note `boot` needs **no bridge entry of its own** — it is a classic-script `function` declaration, which (unlike `let`/`const`/`class`) automatically becomes an own, enumerable property of `window`, so `window.boot()` and `window.boot === boot` are already true today, with no code change needed for that part.

**No other hazards were found.** Every other top-level statement in the classic region (`RECIPE_BOOK`/`PASTRY_FILES` array literals, `RECIPE_LOOKUP` construction, `EVENT_NARRATION`'s object literal of arrow functions, `setInterval(setClockUI,500)`, the two `window.addEventListener(...)` registrations, all `let`/`const` state declarations) either contains no reference to a moving symbol, or wraps its reference inside a function body / arrow function that is only *called* later (after `boot()` — and hence after the bridge — has run). `EVENT_NARRATION.newround`'s body reading `DIRNAME[e.dir]` looked suspicious at first glance but is inside an arrow function value, not evaluated until the narration engine calls it.

**Verification command used** (reproducible):
```bash
awk 'NR>=1828 && NR<=5636' index.html > /tmp/ui_region.txt
grep -nE '^[A-Za-z_$]' /tmp/ui_region.txt | grep -vE '^(const|let|var|function|class|async function)\b'
# then inspect each hit for a reference to a moving symbol
```

### Pattern 3: The classic region duplicates engine logic and calls `game.r()` directly

**What:** The live/multiplayer turn loop (`runLiveNet` at `index.html:4746`+, `botTurn` at `:4746`, `windLeg`, `reachable`) is **not** a thin wrapper around `Game.play()`/`Game.takeTurn()` — it is a separate, hand-written async reimplementation with its own animation beats. Concretely:
- `index.html:4761-4763` and `:4784-4786` roll the round's wind **directly**: `game.windNow="NSEW"[Math.floor(game.r()*4)]; game.stormNow=rollStorm(game); game.windNow2=game.stormNow?PERP[game.windNow][Math.floor(game.r()*2)]:null;` — this calls the seeded RNG (`game.r()`) from *outside* the Game class, twice per round (three times on a final-round re-spin).
- `index.html:4582-4583` calls `g.windPush(p,DIRS[g.windNow],2,dodgedOnce); g.windPush(p,DIRS[g.windNow2],2,dodgedOnce);` — **two** legs, using the second-gust `windNow2`/`PERP` mechanic that `Game.play()`'s own headless `takeTurn()` (`index.html:1717-1727`) does **not** implement (it calls `windPush` only once, with `dist=2`, no second leg).
- `index.html:3798-3825`'s `reachable(p)` duplicates `Game.reachableFrom(p)` (`index.html:1503-1530`) almost line-for-line, reading `game.sailBudget`, `game.onRim`, `game.blocked`, `game.islands`, `game.isHome`, `game.windNow`, and `DIRS`/`windStepCost` directly.

**Implication for the bridge:** this is *why* the bridge must expose the whole `Game` class (so `new Game(...)` instances carry every method automatically) rather than a curated subset of methods — the classic region already assumes unrestricted access to a live instance's full public surface, and that assumption predates this phase. **This duplication and the `windNow2`/PERP live-only storm mechanic are pre-existing behavior, out of Phase 8's scope to fix** (UI/live-loop consolidation is Phase 9/11's territory) — flagging it here only because it changes what "the classic region references" means for the bridge design, and because it explains why the Phase 7 headless corpus (`Game.play()`) legitimately does not exercise the second-gust `windNow2` mechanic at all — that is correct, not a corpus gap; `determinism_baseline.js` calls `g.play()`, which never sets `windNow2`.

### Anti-Patterns to Avoid
- **Rewriting all classic bare-identifier call sites to `PP.X` this phase:** inflates blast radius, duplicates Phase 10/11's job, and is unnecessary — `Object.assign(globalThis, PP)` gets the same correctness with zero classic-code edits.
- **Assuming the bridge only needs to expose `Game`/`roundCfg`/`DIRS`:** Pattern 3 above shows the classic region also needs `PERP`, `rollStorm`, `windStepCost`, and every image/narration helper. Grep, don't guess (Q1a).
- **Trusting that `--verify`'s SOURCE line gates correctness:** it is diagnostic-only by design (`determinism_baseline.js:219-232`, D-11) — the actual gate is the per-seed hash comparison (`failures===0`), which already tolerates `engineSourceHash` staying stale through the extraction commit.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting whether the engine module leaked an impurity | A bespoke AST parser | Line-scoped grep with a manual comment/string false-positive check (Q5) | Zero-dependency project; a full parser is overkill for ~1000 lines split across a handful of files, and the false-positive rate is low and enumerable (see Q5 below) |
| Verifying no circular imports crept into `src/engine/`↔`src/shared/` | Hand-tracing import graphs | `node --check` per file (syntax only) plus a simple depth-first import walk in a throwaway script, OR defer to `madge` when SPLIT-06 formally requires it in Phase 11 | Phase 8's split is a two-level DAG (`shared` has zero engine dependency by construction) — a full cycle-detection tool is Phase 11's job (SPLIT-06 names `madge` explicitly); Phase 8 only needs to confirm the DAG property holds, which a manual grep for `from ".*engine` inside `src/shared/**` (expect zero hits) already proves |

**Key insight:** This phase's tooling needs are already fully met by Node's built-in `node:fs`/`node:crypto`/`node:vm`(retiring)/ESM — no new dependency earns its complexity budget here.

## Order-Load-Bearing Constants — Full Inventory (ENGINE-04 / Q2 answer)

D-09 already names `DIRS`, `DIRNAME`, `PERP`, `STORM_DIAG`, `OPPOSITE`. This is the exhaustive research task D-10 asked for: every remaining object literal/array in the engine region whose order can reach `this.r()` or otherwise silently changes recorded game state.

### Tier 1 — directly gates an `this.r()`-indexed pick (reordering desyncs the RNG *stream itself*, cascading into every subsequent draw for that seed)

| Construct | Line(s) | Mechanism |
|-----------|---------|-----------|
| `DIRS` | `:1003` (declaration); consumed at `:1199` | `for(const d of Object.values(DIRS))` at `:1199` pushes candidate dock cells into `waters` in DIRS-iteration order; `:1210`'s `pool[Math.floor(this.r()*pool.length)]` then indexes into that array. **Reordering `DIRS`'s keys changes which cell the same RNG draw selects — for every ingredient's dock, in the constructor, before any gameplay begins.** This is the single highest-impact site in the file: it fires early enough (constructor) that a reorder would desync every one of the 30 corpus seeds simultaneously, exactly matching STATE.md's "top recorded risk" description. |
| `TET` | `:968` | `Math.floor(this.r()*TET.length)` at `:1130` picks a tetromino shape by index. `TET` is a literal array (not an object), so its element *order* — not key names — is what must stay verbatim. Also consumed by `islandArtPlacement()` in the UI region (`:2244`, via `TET[shapeIdx]`) to map art back onto the placed shape — reordering `TET` breaks rendering too, not just RNG. |
| `[3,2,1]` (spacing literal) | `:1142`, `for(const spacing of [3,2,1])` | Governs the order islands attempt placement at decreasing minimum spacing. Each attempt inside this loop calls `shapeFor()`, which itself consumes 2-4 `this.r()` calls. Reordering this literal changes exactly how many `this.r()` calls are consumed, in what sequence, before an island's position is finalized. |

### Tier 2 — deterministic order-dependency that still breaks byte-for-byte corpus parity (does not touch `this.r()` directly, but changes recorded `state`/positions for an identical seed)

| Construct | Line(s) | Mechanism |
|-----------|---------|-----------|
| `DIRS` (again) | `:1231`, `dirsArr=Object.values(DIRS)` | `p.pos=[this.home[0]+d[0],...]` with `d=dirsArr[i%4]` assigns each player's starting berth by seat index. Reordering `DIRS` swaps which compass corner each seat spawns at — changes the very first recorded event's `state` for every seed. |
| `DIRS` | `:1336` (`stepToward`, Dijkstra), `:1517` (`reachableFrom`, Dijkstra) | `for(const dk of Object.keys(DIRS))` builds the frontier in DIRS order; the "find cheapest in frontier" scan (`:1330`, `:1508`) uses strict `<`, so same-cost ties resolve to whichever neighbor was inserted **first** — i.e. whichever direction DIRS lists first. Reordering DIRS changes tie-broken pathing on `sail` events (1,634 of them in the Phase 7 corpus — this fires constantly, not just at game start). |
| `DIRS` | `:1372`, `rimEscape` | `for(const d of Object.values(DIRS))` with an early `return true` on first valid escape cell — order determines *which* direction a boxed-in bot picks when more than one rim-adjacent escape exists. |
| `DIRS` | `:1388`, `adjPort` (non-`singleDock` branch) | Currently dead code — `roundCfg()` (`:1822`) always sets `singleDock:true`, so this branch never executes against the shipped config. Still needs verbatim preservation/annotation since it's part of the class's general-purpose logic and a future config change could re-activate it. |

### Confirmed NOT a risk (checked, not assumed — D-10 asked for the research, and a clean negative result is itself useful)

| Construct | Why it's safe |
|-----------|----------------|
| `PERSONALITY`, `AW`, `TW`, `DW` | Always accessed by direct property name (`PERSONALITY[p.strategy]`, `AW.steal`, etc.) — never iterated anywhere in the engine. |
| `EMOJI_IMG` | `Object.keys(EMOJI_IMG).sort((a,b)=>b.length-a.length)` at `:950` builds `EMOJIFY_RE` — explicitly, deterministically sorted by length, and this consumes zero `this.r()` calls. Also, `emojify()`/`EMOJI_IMG` narration text is not captured in the corpus's event objects at all (`Game.ev()` records `state`/`tokens` only, not narration strings) — irrelevant to ENGINE-03 either way. |
| `battle()`'s `dirAtoD`/`dirDtoA` (`:1543-1544`) and `scoreAttack()`'s `dirPtoQ` (`:1642`) | `Object.keys(DIRS).find(k=>DIRS[k][0]===dx&&DIRS[k][1]===dy)` — DIRS' four direction vectors are pairwise distinct, so at most one key ever matches a given `(dx,dy)`. `.find()`'s result is identical regardless of scan order. |
| `boxedIn()` (`:1360`) | `Object.values(DIRS).every(...)` — a boolean-AND reduction; the truth value is order-independent even though `.every()` short-circuits. |
| `this.rim` Set / `sorted`/`ring` arrays in round-board construction (`:1086`-`:1119`) | `[...this.rim]` is explicitly `.sort((a,b)=>a.deg-b.deg)`ed before any `this.r()`-derived slicing — insertion order into `this.rim` only matters for **tied** `deg` values (Array.prototype.sort is stable in Node/V8), a narrow geometric edge case driven by the constructor's plain nested `for(x)for(y)` loop, not by any object-literal key order. Flagged for awareness, not annotation — the loop nesting is imperative code, not a literal whose keys are subject to well-meaning reordering during a split. |

### Outside the engine region entirely, but order-load-bearing for the *live* game's RNG stream

`PERP` and `STORM_DIAG` (declared `:1006`/`:1008`, inside the moving region) are **never consumed by the `Game` class itself** — grep confirms their only consumers are classic/live-loop code (`index.html:2733`, `:4763`, `:4786`), where `PERP[game.windNow][Math.floor(game.r()*2)]` directly indexes by RNG draw. This doesn't change where they live (D-09 already places them under order-load-bearing annotation, and D-05's "pure string/geometric data, safe to import" reasoning still applies) — it changes *why*: the live game's second-gust RNG draw depends on `PERP`'s key order exactly the same way the headless corpus depends on `DIRS`'s, just from outside the class boundary. Annotate identically.

## Common Pitfalls

### Pitfall 1: Believing the bridge only needs read-only constants
**What goes wrong:** A bridge design that exposes `Game`/`roundCfg`/`DIRS` as frozen, read-only references looks sufficient from CONTEXT.md alone, but Pattern 3 above shows the classic region calls `game.r()`, `rollStorm(game)`, and a dozen `Game` instance methods directly from outside the class.
**Why it happens:** CONTEXT.md's phrasing ("classic UI/networking code that references `Game`, `roundCfg`, `DIRS`, …") reads like a small, closed set.
**How to avoid:** Grep before designing the bridge shape (Q1a's methodology above), not after.
**Warning signs:** A `ReferenceError: rollStorm is not defined` or `PERP is not defined` surfacing only during a *live* game (never in the headless corpus, since `Game.play()` doesn't touch either symbol) — exactly the kind of gap that 30 seeds of headless replay cannot catch, per the phase's own D-17 rationale.

### Pitfall 2: Assuming "wrap boot() in the module" fixes every ordering hazard
**What goes wrong:** Inverting control on `boot()` alone leaves `index.html:2095`'s `RECIPE_BOOK.forEach` throwing at parse time, before `boot()` is ever reached — this would break page load entirely (not just the decorative board), and it happens **earlier in the file** than `boot()`'s old call site, so a naive "the fix is inversion of control" plan misses it.
**Why it happens:** The classic region is 3,800+ lines; a single genuinely-top-level hazard is easy to miss without an exhaustive statement-by-statement scan.
**How to avoid:** Use the exact grep in Pattern 2 above (statement-level scan of every non-declaration top-level line) as an acceptance check, not a one-time manual read.
**Warning signs:** Console shows a `ReferenceError` naming a moved symbol *before* `window.__pp_module_ok` would even have a chance to be checked — i.e., the page never gets far enough to boot at all. D-17's browser check (page loads, console clean, `__pp_module_ok===true`) is the correct catch-all for this pitfall class, but only if actually run against a real browser load, not assumed from code review.

### Pitfall 3: Treating `--capture` as the only way to update `manifest.json`
**What goes wrong:** D-02 requires only `engineSourceHash` to change, with per-seed hashes frozen — but `determinism_baseline.js`'s only existing write path (`capture()`) rewrites the *entire* manifest, including `perSeed[].sha256`, by replaying every seed fresh. Running `--capture` "just to fix the source hash" silently redefines the oracle (exactly D-01's forbidden failure mode).
**Why it happens:** No other write path exists in the current tool.
**How to avoid:** Add a small, separate, explicitly-scoped procedure (see Q3 below) that only ever touches the `engineSourceHash` field, gated on `--verify` already passing green.
**Warning signs:** A `git diff` on `manifest.json` after a "just the hash" fix that shows *any* line inside `perSeed[]` changing — that's a sign `--capture` ran, not the targeted rebase.

## Code Examples

### The bridge population + inversion of control (`src/main.js`, extends Phase 7's existing file)
```javascript
// Source: derived from this phase's own design (no external doc — see Q1 above for reasoning)
import * as shared from "./shared/index.js";
import * as engine from "./engine/index.js";

// existing Phase 7 module-contract marker logic stays as-is, guarded by `typeof window`

if (typeof window !== "undefined") {
  const PP = { ...shared, ...engine };
  window.PP = PP;                    // named, documented (D-14), Phase 11's removal-grep target
  Object.assign(globalThis, PP);     // zero-edit compatibility for existing bare-identifier call sites
  window.applyEngineBootstrapEffects();  // the 3 relocated D-06 impurities
  window.attachPastryArt();              // the ASSET_BASE top-level hazard, now deferred safely
  window.boot();                         // inversion of control — module drives startup, not the classic script
}
```

### The 3 D-06 impurities, relocated to a UI bootstrap function (classic script, stays as a `function` declaration so `window.applyEngineBootstrapEffects` works automatically)
```javascript
// Source: index.html:920, :922, :1002 (moved verbatim, wrapped)
function applyEngineBootstrapEffects(){
  document.documentElement.style.setProperty("--clock-img",`url(${CLOCK_IMG})`);
  document.documentElement.style.setProperty("--flip-socket-img",`url(${FLIP_SOCKET_IMG})`);
  document.body.innerHTML = emojify(document.body.innerHTML);
}
```

### `engineSourceHash` rebase without `--capture` (Q3 — new small tool/flag)
```javascript
// Illustrative shape for a new `scripts/rebase_source_hash.js` (or a `--rebase-source-hash`
// flag added to determinism_baseline.js) — NOT a full implementation, a design sketch.
import { loadEngine } from "./lib/load_engine.js";
import fs from "node:fs";
const MANIFEST_PATH = "scripts/fixtures/determinism/manifest.json";

// Gate: refuse to touch anything unless --verify's behavior comparison already passes.
// (Re-run the same per-seed fresh-replay comparison verify() does — comparison 2 only —
// and abort non-zero if any seed's fresh hash doesn't match its frozen perSeed[].sha256.)
// ... behaviorOk check omitted for brevity, must reuse verify()'s comparison-2 logic exactly ...

const { sourceHash } = await loadEngine(); // new sourceHash, computed from src/engine + src/shared
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
manifest.engineSourceHash = sourceHash;    // the ONLY field this script may touch
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
// `git diff manifest.json` after this must show exactly one changed line.
```

## Q3 — `engineSourceHash` re-base (full answer)

**What's hashed today:** `load_engine.js:31-34` hashes the *raw extracted HTML text* of the engine region (from just past `<script>` to just before `function escHtml`), **before** the `this.Game=Game;this.roundCfg=roundCfg;` export suffix is appended. This describes `index.html`'s own content, nothing else.

**What should be hashed after extraction:** the concatenated source text of every file the engine actually depends on — i.e. `src/engine/**/*.js` **and** `src/shared/**/*.js` (not just `src/engine/`, because D-09/D-10's order-load-bearing constants live in `src/shared/` and a reordering there is exactly the kind of "source changed" event this hash exists to flag). Recommended construction:
1. Enumerate the files under `src/engine/` and `src/shared/` (sorted lexicographically by relative path — deterministic across OS/filesystem ordering, unlike `fs.readdir`'s unspecified order on some platforms).
2. For each file, feed `relative/path.js\n` + the file's raw UTF-8 content + `\n` into the hash — the path prefix prevents a false-negative where two different file-boundary splits happen to concatenate to the same overall byte stream (e.g. file A ending mid-line + file B starting where A left off, versus a single merged file).
3. `sha256` over the whole concatenation, hex-encoded — same digest scheme already in use.

**Confirming this doesn't require `--capture`:** `determinism_baseline.js`'s `capture()` (lines 98-143) is the *only* function that writes `manifest.json` today, and it unconditionally replays and re-hashes all 30 seeds as part of writing anything — running it to "just" fix `engineSourceHash` would silently rewrite `perSeed[]` too, which is exactly D-01's forbidden failure mode. **This is confirmed to be a real gap, not a false alarm** — there is currently no code path that writes only `engineSourceHash`. The fix is a small, new, separate tool (or an additive flag) that:
- Refuses to run unless `--verify`'s comparison-2 (fresh-replay-vs-frozen-hash) already passes for all 30 seeds (proving behavior truly hasn't changed) — reuse `verify()`'s existing per-seed fresh-replay logic rather than reimplementing it.
- Writes **only** the `engineSourceHash` field back to `manifest.json`, leaving `perSeed`, `capturedAt`, `coverage`, etc. byte-identical.
- Is its **own commit**, separate from the extraction+harness-migration commit (D-12) and clearly messaged (D-02) — `git diff manifest.json` on that commit should show exactly one changed line.

**Sequencing:** because `--verify`'s SOURCE classification is diagnostic-only and never gates exit code (`determinism_baseline.js:219-232`, confirmed by direct read), the extraction + harness-migration commit can be verified green (`--verify` exits 0) **before** the source-hash rebase happens — the rebase is a follow-up commit, not a blocking prerequisite for the first commit's own gate.

## Q4 — Module split mechanics for a verbatim move (full answer)

**The good news, verified by reading the actual source top-to-bottom:** the monolith's own declaration order is *already* a valid dependency-depth ordering. Every constant/helper `class Game` (`:1078`) references — `mulberry32` (`:862`), the `ING_*`/image-map families (`:866`-`:1013`), `DIRS`/`DIRNAME`/`PERP`/`STORM_DIAG`/`OPPOSITE`/`SAIL_BUDGET`/`windStepCost` (`:1003`-`:1015`), `rollStorm` (`:1018`), `NAMES`/`DEFAULT_NAMES`/`unusedDefaultName` (`:1024`-`:1041`), `COLORS`/`HEXCOL`/`man` (`:1042`-`:1044`), `PERSONALITY`/`AW`/`TW`/`DW`/`FISH_BASE` (`:1051`-`:1076`) — is declared **before** `class Game{` at `:1078`. `roundCfg` (`:1816`) comes after. There are **zero forward-references** from leaf constants into the Game class anywhere in the region. This means:
- Splitting "leaves first, then Game" (D-04) requires **no reordering of any statement**, only *grouping* into files along the existing boundaries — the lowest-risk possible mechanical operation.
- No TDZ hazard: as long as each new file's *internal* order matches the original relative order, and `src/engine/game.js` imports from `src/shared/*` (never the reverse), the module graph is a clean two-level DAG with no cycles to worry about (SPLIT-06's cycle-detection concern is Phase 11's problem, once UI/net modules join the graph).
- `rollStorm(g)` is a `function` declaration referenced only *inside* `Game.play()`'s method body (`:1774`), not at any module's top level — so it's safe regardless of which file it lands in relative to `game.js`, as long as it's imported (available) before any gameplay method actually runs, which module evaluation order already guarantees.
- `EMOJIFY_RE` (`:949-951`) executes `Object.keys(EMOJI_IMG).sort(...)` at true module-top-level — this requires `EMOJI_IMG` to be fully constructed first. Since both are proposed for the same file (`src/shared/assets.js`) in original relative order, this is safe by construction; if a planner splits them into separate files, `EMOJIFY_RE`'s file must import `EMOJI_IMG` and this becomes an ordinary (non-circular) import dependency, still safe.

**Genuine circular-import risk:** none identified for this phase's scope. `src/shared/*` has zero dependency on `src/engine/*` (confirmed — no leaf constant or helper references `Game`, `roundCfg`, or anything Game-internal). The one thing to actively avoid: don't let `src/engine/weights.js` (PERSONALITY/AW/TW/DW) end up importing anything from a hypothetical future `src/ui/` — it doesn't today, and nothing in this phase should introduce that.

**Verification step for the plan:** after the split, `grep -rn 'from "\.\./' src/shared/` should return **zero** hits referencing `src/engine/` (proves the DAG direction), and `node --check src/engine/*.js src/shared/*.js` (or simply running `scripts/determinism_baseline.js --verify`, which will throw a real `SyntaxError`/`ReferenceError` on any ordering mistake) is sufficient given the project's zero-dependency, no-linter posture.

## Q5 — Verifying engine purity mechanically (full answer)

**The grep, with a demonstrated, real false positive to guard against:**
```bash
grep -noE "document\.[A-Za-z]+|window\.[A-Za-z]+|\bfirebase\b|localStorage|Date\.now|Math\.random|\bglobalThis\b|new Function" src/engine/*.js src/shared/*.js
```

**Confirmed false positive (not hypothetical — found in the current source):** `index.html:999`'s comment — `// Rewriting document.body here, before any element-lookup/event-wiring below runs, catches every` — contains the literal text `document.body` inside a `//` line comment, immediately above the real impurity at `:1002`. A naive raw grep over the pre-extraction region reports **two** hits for `document.body` on adjacent lines (comment + real code) where only one is a genuine violation. After extraction, this exact comment (if it travels with the code being relocated to a UI bootstrap function, which D-06 already mandates) will no longer be *in* `src/engine/`/`src/shared/` at all — but the pattern (prose mentioning `window.`/`document.` near code that discusses relocating it) is exactly the class of false positive to watch for on every future purity check, not just this one instance.

**Recommended two-pass check:**
1. **Coarse pass** (the grep above) over `src/engine/*.js` + `src/shared/*.js` — fast, catches everything, including comments.
2. **Confirm each hit is real code, not prose:** this codebase's comment style is exclusively `//` line comments and single-line `/* ... */` banners (confirmed — no multi-line block comments exist in the engine region, verified via `grep -n '/\*' ` showing only same-line-closed banners) — so a hit is safe to auto-classify as "genuine" if the matched text is **not** preceded on its line by `//` (accounting for the match not being inside a string literal either — spot-check any remaining hits by eye, there will be very few after extraction since the purity gate should be zero-hit in steady state).

**False negatives to also check for** (the ones D-08 explicitly worries about, beyond the literal grep):
- `globalThis.document`/`globalThis.window` — covered by the `\bglobalThis\b` pattern already, but worth a second explicit pass since indirect access via `globalThis[...]` bracket notation with a computed string wouldn't match a literal-property regex at all. Given the current source has zero `globalThis` usage anywhere in the engine region (confirmed), this is a "stays zero" gate, not a "clean up existing" gate.
- `new Function(...)` — zero occurrences confirmed; included in the grep pattern for completeness/regression-proofing, not because one exists today.
- Indirect `Math.random` via a renamed reference (e.g. `const rand = Math.random; rand()`) — not present today (confirmed: the engine's only randomness source is `this.rng` from `mulberry32(seed)`), but a grep alone can't catch a *future* indirection like this; the corpus's fresh-replay comparison (`--verify`) is the actual backstop for this class of regression, not the purity grep.

**Acceptance criterion for the plan:** the coarse-pass grep against `src/engine/*.js` + `src/shared/*.js` returns **zero** hits after extraction, except the three lines intentionally relocated to the UI bootstrap function (`applyEngineBootstrapEffects`, which is *not* in `src/engine/`/`src/shared/`, so it's naturally excluded from this grep's scope once moved) and the `$` DOM helper (D-07, also staying in the classic script, also naturally excluded).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Module top-level code can read/write a value set via `Object.assign(globalThis, ...)` and have it resolve correctly for bare identifiers in a *previously-executed* classic script with no competing local declaration | Pattern 1 (Q1 answer) | HIGH impact if wrong — the entire bridge design rests on this. Confidence is HIGH based on ECMAScript spec (shared Realm global environment) and this project's own existing precedent (the `firebase` global), but it is flagged `[ASSUMED]` rather than `[VERIFIED]` because it was not executed in a real browser during this research session. **Mitigation already built into the recommendation: a Wave 0 tracer task should prove this empirically before the full extraction is built on top of it.** |
| A2 | `RECIPE_BOOK.forEach`'s deferred execution (moved into `attachPastryArt()`, called after `boot()`'s dependencies are ready) has no observable timing effect on recipe-card rendering | Pattern 2 (Q1 answer) | LOW — `RECIPE_BOOK.img` is read only inside on-demand rendering functions (`recipeCardHTML`, `recipeModalHTML`), never at parse time elsewhere; verified by grep that no other top-level statement reads `RECIPE_BOOK[i].img`. |

## Open Questions

1. **Exact file boundaries within `src/engine/` and `src/shared/`**
   - What we know: dependency depth requires shared-before-engine, and the monolith's source order already satisfies this with zero reordering needed.
   - What's unclear: how many files (D-04/CONTEXT.md leaves this to Claude's Discretion) — the Recommended Project Structure above is one reasonable split; a flatter 2-file split (`src/shared/index.js`, `src/engine/index.js`) is equally valid and lower-effort.
   - Recommendation: default to the flatter split unless the planner has a specific reason to want finer-grained files; either way, `scripts/lib/load_engine.js` only needs to import the barrel/index file(s).

2. **Whether `Object.assign(globalThis, PP)` needs a matching cleanup mechanism this phase or can wait for Phase 10/11**
   - What we know: D-15 explicitly scopes de-globalization to Phase 10, and Phase 11 removes the bridge.
   - What's unclear: whether the plan should add a code comment / lint-style marker at the `Object.assign` call site itself (beyond the bridge object's own doc comment) so Phase 11's "grep confirming no leftover bare-global reads remain" (ROADMAP Phase 11 criterion 3) has something to find beyond `window.PP` references.
   - Recommendation: the `Object.assign(globalThis, PP)` line itself, if commented per Pattern 1's example above, is already greppable (`grep -n "Object.assign(globalThis" src/main.js`) — no additional marker needed.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 18+ | Test harnesses, `scripts/lib/load_engine.js` | Yes | v25.9.0 confirmed on this machine | — |
| Native ES module support (browser) | `src/main.js`, engine/shared modules | Yes | Evergreen Chrome/Safari (project's stated compatibility target) | — |
| `python3 -m http.server` | Local dev serving (module scripts require HTTP origin) | Not directly probed this session, but confirmed present per Phase 7's own successful use | — | `npm start` alias (same underlying server) |

No missing dependencies. This phase introduces no new external tooling.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (hand-rolled Node scripts with `process.exit(0/1)` conventions) |
| Config file | none — `package.json` scripts (`test`, `test:determinism`) are the entry points |
| Quick run command | `node scripts/determinism_baseline.js --verify` (~seconds, replays 30 seeds headlessly) |
| Full suite command | `npm test` (runs `determinism_baseline.js --verify` **and** `dlog_replay_test.js`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ENGINE-01 | Engine module has zero DOM/window/Firebase/wall-clock/unseeded-random access | unit (grep-based) | `grep -noE "document\.[A-Za-z]+\|window\.[A-Za-z]+\|\bfirebase\b\|localStorage\|Date\.now\|Math\.random\|\bglobalThis\b\|new Function" src/engine/*.js src/shared/*.js` (expect zero real hits, per Q5) | ❌ Wave 0 — no existing script runs this; add as a plan verification step, doesn't need a new committed test file |
| ENGINE-02 | Node harnesses import natively, same commit as extraction | integration | `node scripts/real_game_test.js 25 && node scripts/dlog_replay_test.js` (exit 0 both) | ✅ exists (Phase 7) |
| ENGINE-03 | Byte-for-byte identical to Phase 7 baseline | integration | `node scripts/determinism_baseline.js --verify` (exit 0, "All seeds passed.") | ✅ exists (Phase 7) |
| ENGINE-04 | Order-load-bearing constants annotated | unit (manual/grep) | `grep -c "ORDER IS LOAD-BEARING" src/shared/*.js` — expect a count matching the Tier-1+Tier-2 inventory above (DIRS, TET, the `[3,2,1]` spacing literal, PERP, STORM_DIAG, OPPOSITE, DIRNAME) | ❌ Wave 0 — new annotation convention, no existing check |
| SPLIT-01/SPLIT-02 | Module boundaries correct, no circular deps | unit | `grep -rn 'from "\.\./' src/shared/` (expect zero hits referencing `src/engine/`) | ❌ Wave 0 — new check |
| — | Browser still boots (D-17) | manual/E2E | Chrome MCP: load page, confirm `window.__pp_module_ok===true`, console clean, play a few turns of a solo game | ❌ Wave 0 — this phase's D-17 requirement, not previously run against a shrunk classic script |

### Sampling Rate
- **Per task commit:** `node scripts/determinism_baseline.js --verify` — cheap (seconds), run after every commit within this phase per CONTEXT.md's own explicit guidance ("Use it aggressively: verify after every commit, not at the end").
- **Per wave merge:** `npm test` (full suite, includes `dlog_replay_test.js`).
- **Phase gate:** Full suite green **and** the browser check (D-17) **and** the purity grep (Q5) all pass before `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] A Wave 0 **tracer task** proving `Object.assign(globalThis, ...)` from a module is readable by bare identifier in a subsequently-defined classic-script function in this exact page — see Assumption A1. This is the cheapest possible de-risking step for the phase's central architectural bet and should run before the full extraction is built.
- [ ] The purity grep (Q5) as a repeatable check — not a committed test file necessarily, but should be run and its output pasted into the plan's verification evidence.
- [ ] `ORDER IS LOAD-BEARING` annotation count check (ENGINE-04) — new convention, no existing tooling.
- [ ] Browser load + solo-play smoke check (D-17) via Chrome MCP, after the shrunk `index.html` and populated bridge are in place.

## Security Domain

`security_enforcement` is enabled (ASVS Level 1, block on `high`) per `.planning/config.json`. This phase is a pure internal refactor — it moves code between files and changes how that code is wired together; it does not touch authentication, session handling, input validation of untrusted data, or cryptography, and it introduces no new network-facing surface (Firebase networking is explicitly out of scope — Phase 9).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Unchanged this phase — no auth code moves or is touched |
| V3 Session Management | No | Unchanged — `pp_sess`/`localStorage` session logic stays in the classic UI region, untouched |
| V4 Access Control | No | No access-control logic exists in this codebase (single-player/shared-room multiplayer with no privilege tiers) |
| V5 Input Validation | Marginal | The engine already validates nothing from untrusted network input directly (bot/RNG-driven state only) — this phase doesn't change that boundary. No new validation code is introduced. |
| V6 Cryptography | No | `node:crypto`'s `sha256` usage (for `engineSourceHash`) is a content-integrity/staleness check, not a security control — no secrets, no authentication tokens involved |

### Known Threat Patterns for this stack
No new threat surface is introduced by this phase. The one genuinely new mechanism — `window.PP` / `Object.assign(globalThis, PP)` — makes previously-private module-scoped values into global-object properties, which is a **code-organization** concern (already flagged for Phase 10/11 cleanup), not a security control bypass: none of the exposed values (`Game`, `DIRS`, image paths, RNG helpers) are secrets, and nothing about this bridge changes what an attacker with browser console access could already do (the entire game already ran as global-scope classic-script code before this phase; the bridge doesn't reduce or expand that trust boundary).

## Sources

### Primary (HIGH confidence — verified directly against the working tree this session)
- `index.html` (full read of lines 855-1075, 1275-1827, 1828-2260, 3790-3830, 4570-4800, 4959-4990, 5250-5270, 5570-5640) — every line-number citation above was confirmed via direct read or grep, not estimated
- `scripts/lib/load_engine.js`, `scripts/determinism_baseline.js`, `scripts/dlog_replay_test.js`, `scripts/real_game_test.js` (headers) — read in full
- `docs/MODULES.md` — read in full
- `.planning/phases/08-engine-extraction-node-harness-migration/08-CONTEXT.md`, `.planning/phases/07-foundation-determinism-baseline/07-CONTEXT.md`, `.planning/phases/07-foundation-determinism-baseline/07-01-SUMMARY.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/ROADMAP.md` (Phase 7-12 sections) — read in full
- `src/main.js`, `src/module-contract.js` — read in full
- `.planning/config.json` — read for `nyquist_validation`/`security_enforcement` flags
- Reproducible grep commands throughout this document — every table/claim tied to `this.r()`, `Object.keys`/`Object.values`, and top-level-statement classification was generated from live `grep`/`awk`/`node -e` commands against the actual repository, not from memory of similar codebases

### Secondary (MEDIUM confidence)
None used — this research relied entirely on direct source inspection rather than external documentation, since the domain (this specific 5,640-line monolith's internal structure) has no external reference source.

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Bridge/ordering design (Q1): HIGH for the discovered facts (symbol usage, top-level hazards — all grep-verified); MEDIUM-HIGH for the `Object.assign(globalThis,...)` mechanism itself pending the recommended Wave 0 tracer proof (flagged as Assumption A1)
- Order-load-bearing inventory (Q2): HIGH — every entry traced to specific line numbers and either confirmed as a real risk or confirmed clean via direct code reading, not pattern-matching
- `engineSourceHash` rebase (Q3): HIGH — confirmed the exact gap (no non-`--capture` write path exists today) directly from `determinism_baseline.js`'s source
- Module split mechanics (Q4): HIGH — confirmed zero forward-references in the actual source, not inferred from convention
- Purity verification (Q5): HIGH — grep commands run against the actual current source, with one real false positive demonstrated, not hypothesized

**Research date:** 2026-07-24
**Valid until:** Until `index.html`'s line numbers shift (i.e., until this phase's own extraction commit lands — this research describes the pre-extraction tree and should be treated as consumed once Phase 8 executes)
</content>
