# Architecture Research

**Domain:** Zero-build native-ES-module refactor of a monolithic browser game with a deterministic multiplayer engine
**Researched:** 2026-07-24
**Confidence:** HIGH (grounded directly in the current `index.html` — line numbers, existing globals, existing watcher/test-harness code cited below; MEDIUM only on the two external-currency claims, both verified against current Firebase/Node docs and flagged accordingly)

## Grounding: what the current code actually does

This isn't greenfield architecture — it's a target shape for a real 5,639-line file. Findings that shape every recommendation below:

- The "pure engine" region is real and already isolated by convention, but the existing `/* ================= UI ================= */` comment at line 1811 is **not** the true boundary — `roundCfg()` (line 1816) and the rest of the pure region actually end at `function escHtml` (line 1827), *after* the UI marker. `scripts/real_game_test.js` and `scripts/dlog_replay_test.js` already know this and slice past the marker. Any extraction must follow the real dependency boundary, not the comment.
- Three DOM touches sit *inside* what should be pure engine territory: `document.documentElement.style.setProperty(...)` (lines 920, 922) and `document.body.innerHTML = emojify(...)` (line 1002). Today's Node test harness papers over this with a fake `document` stub in the `vm` sandbox. These three lines are asset/UI bootstrapping, not engine, and must move out during extraction — they are the actual reason the engine "needs a DOM shim" today.
- The pure engine region (constants at 862, `class Game{` at 1078, `PERSONALITY` at 1051, `roundCfg` at 1816, ending at 1827) has **zero** `Math.random()` or `Date.now()`/`performance.now()` calls — verified by direct grep. Determinism is already sound in that region; the job is to preserve it, not fix it.
- 40+ top-level globals exist today: `game`, `evIdx`, `timer`, `db`, `myId`, `room`, `mySeat`, `isHost`, `roster`, `curSeat`, `dlog`, `dlogIdx`, `dlogN`, `resumeEvLen`, `shotClockSeat`, `soloMeta`, etc. (`index.html:1813, 2974-3010, 4872-4953, 5571`).
- 14 Firebase `.on("value", ...)` watcher registrations exist; only one path (`rr.on/rr.off` for a one-shot prompt-response listener, lines 5071-5095) ever calls `.off()`. The other 13 leak for the life of the page — this is the memory-leak debt item named in `PROJECT.md`.
- No `package.json` exists anywhere in the repo (confirmed). `scripts/*.js` are CommonJS (`require("fs")`, `require("vm")`) with no `"type"` field to conflict with — a clean slate for adopting `"type": "module"` at the repo root.
- Firebase is loaded via two **classic** (non-module) CDN `<script>` tags (`index.html:25-26`, `firebase-app-compat.js` + `firebase-database-compat.js`, v12.15.0), which set `window.firebase`. The main game script currently starts as a third classic `<script>` at line 859.
- Today the two Node harnesses don't `import` the engine at all — they read `index.html` as text and slice out a substring by locating `<script>` and `function escHtml`, then `vm.runInContext` it (`scripts/real_game_test.js:16-49`, `scripts/dlog_replay_test.js:26-64`). This string-slicing is exactly the fragility the milestone's "harden the deterministic engine/replay module seams" goal targets.

## Target Module Dependency Graph

```
                    ┌─────────────────────┐
                    │   js/engine/*.js     │   PURE — no DOM, no window,
                    │  (Game, bots, RNG,   │   no firebase, no fetch.
                    │   constants, replay) │   Importable identically by
                    └─────────┬────────────┘   browser <script type=module>
                              │                 and Node `import`.
              ┌───────────────┼────────────────┐
              │ import                          │ import
              ▼                                  ▼
┌─────────────────────────┐        (net does NOT import ui;
│  js/state/app-state.js   │         ui does NOT import net —
│  (encapsulates game,     │◄────┐   this is the acyclic guarantee)
│  myId, room, mySeat,     │     │
│  db handle, dlog, curSeat,│     │
│  subscribe/notify)       │     │
└──────────┬───────────────┘     │
           │ import               │ import
           ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│   js/ui/*.js          │  │   js/net/*.js         │
│ render, board, assets,│  │ firebase-client,      │
│ modals, narration     │  │ room, sync (replay)   │
│ (reads state, never   │  │ (reads/writes state,  │
│  imports net)          │  │  never imports ui)    │
└──────────┬───────────┘  └──────────┬───────────┘
           │                          │
           └───────────┬──────────────┘
                        │ import (only file that imports all four groups)
                        ▼
                ┌───────────────┐
                │   js/main.js   │  entry point, DOM event wiring, boot()
                └───────────────┘
```

**Edges, explicitly (no cycles possible by construction):**

| From | Imports | Never imports |
|------|---------|----------------|
| `engine/*` | other `engine/*` files only | `state/*`, `ui/*`, `net/*` — nothing outside engine |
| `state/app-state.js` | `engine/*` (types/constants, to construct `Game`) | `ui/*`, `net/*` |
| `ui/*` | `state/app-state.js`, `engine/constants.js` (labels/lookups) | `net/*` |
| `net/*` | `state/app-state.js`, `engine/engine.js`, `engine/replay.js` | `ui/*` |
| `main.js` | `engine/*`, `state/*`, `ui/*`, `net/*` | (this is the composition root — fan-in only) |

This is the same shape the milestone context specifies (`engine ← state ← ui`, `engine ← state ← net`, `main` orchestrates), made concrete against the real file. The rule that keeps it acyclic under change pressure: **`ui/*` and `net/*` never import each other directly.** When UI needs to react to a network event (e.g., a battle update arriving from Firebase), `net/sync.js` writes into `state/app-state.js` and calls `notify()`; `ui/render.js` is subscribed to `state` and re-renders. Today's code has UI functions and network watcher callbacks calling each other's functions directly and reaching into shared globals — that direct cross-wiring is the thing to eliminate, not preserve.

## Recommended Project Structure

```
index.html                      # markup + <style> only; two classic firebase-compat
                                 # <script> tags; one <script type="module" src="js/main.js">
js/
├── engine/
│   ├── constants.js             # DIRS, ING_ALL, PERSONALITY-shape, board/storm constants
│   ├── rng.js                   # mulberry32() — the ONLY entropy source engine code may use
│   ├── bots.js                  # 5 personality strategy functions (pirate/trader/balanced/
│   │                             # rusher/monopolist) — pure functions over Game state
│   ├── engine.js                # class Game{...}, roundCfg() — imports rng.js, constants.js,
│   │                             # bots.js. Zero document/window/firebase references.
│   └── replay.js                # replayShortfall(), REPLAY_SHORTFALL_TOLERANCE — already a
│                                 # natural standalone unit (see dlog_replay_test.js sentinel
│                                 # region); used by net/sync.js on host resume
├── state/
│   └── app-state.js             # module-scoped closure replacing the 40+ globals: game,
│                                 # myId, room, mySeat, db, isHost, dlog*, curSeat, shotClock*,
│                                 # etc. Exposes get*/set* + subscribe(fn)/notify(). No framework.
├── ui/
│   ├── assets.js                # ASSET_BASE, image maps, preloadAssets(), iconAt(), the
│   │                             # emojify()/body-innerHTML rewrite and the two
│   │                             # documentElement.style.setProperty calls MOVE HERE (they were
│   │                             # never engine code — they're asset bootstrapping)
│   ├── render.js                 # render(), narration/log rendering, panel updates
│   ├── board.js                  # drawBoard(), SVG ship/wind/storm drawing, animations
│   └── modals.js                 # recipe modal, leave-game modal, end-of-voyage badges
├── net/
│   ├── firebase-client.js        # fbInit(), a thin facade over window.firebase/db, PLUS a
│   │                             # watcher registry: watch(path, cb) returns an unwatch()
│   │                             # closure that calls ref.off(); tracks all live refs so
│   │                             # "leave game" / teardown can unwatchAll() in one call
│   ├── room.js                   # createRoom, joinRoom, seat assignment, presence
│   └── sync.js                   # runLiveNet(), watchFlip/watchBattle/watchNarr/watchChat/
│                                 # watchClock, resumeHostGame() (imports engine.js + replay.js
│                                 # to rebuild state from the dlog — same Game class, not a copy)
└── main.js                       # imports engine+state+ui+net; wires DOM event listeners;
                                 # calls boot(); the only module that "knows everything"
```

### Structure Rationale

- **`engine/` is deliberately the smallest, most boring directory.** No framework, no DOM, no async I/O — just the state machine, RNG, and pure decision functions. That's what makes it importable unmodified by both the browser and Node.
- **`bots.js` is engine, not a separate "AI" layer.** Bot strategies are pure functions consuming `Game` state and returning an action — structurally identical to how a human decision gets fed back into `Game.play()`. Splitting them out of `engine.js` (rather than nesting them inside the class) keeps `engine.js` itself smaller and makes `PERSONALITY` roster changes a one-file diff.
- **`replay.js` is its own file, not folded into `engine.js`**, because it's consumed from `net/sync.js` (host-resume path) but must stay just as pure as the engine — it's Math-only logic over counts/booleans (see `dlog_replay_test.js`'s own sentinel-region comment explaining why it's written to be lifted out cleanly). Keeping it separate also means a change to `Game` internals can't accidentally couple to replay-shortfall math, and vice versa.
- **`state/app-state.js` is one file, not a directory**, because its whole job is to be the single seam where every "global" got funneled — splitting it defeats the purpose of taming the 40+ globals into one auditable place.
- **`ui/` is split by concern (assets/render/board/modals)** because `index.html`'s UI region (roughly lines 1811-4870 today) is already the largest, most tangled part of the file; a flat `ui/render.js` catch-all would just relocate the tangle instead of resolving it. This split is a recommendation, not a hard requirement — a roadmap phase could ship `ui/render.js` + `ui/assets.js` first and split `board.js`/`modals.js` out later without touching the dependency graph.
- **`net/` mirrors the three things the codebase docs already identify as distinct multiplayer concerns**: connecting (`firebase-client.js`), lobby/room lifecycle (`room.js`), and live game sync (`sync.js`). This also isolates the watcher-lifecycle fix to one directory.

## Architectural Patterns

### Pattern 1: Pure-core / impure-shell (Engine as the "functional core")

**What:** `js/engine/*` contains only deterministic, side-effect-free code: state transitions over plain data, a single seeded RNG, no I/O. Everything that touches the DOM, `window`, `localStorage`, `Firebase`, or wall-clock time lives outside it, in `ui/` or `net/`.
**When to use:** Any codebase where the same logic must run identically in two hosts (here: browser + Node) and where correctness depends on determinism (here: multiplayer lockstep + replay).
**Trade-offs:** Requires physically relocating the three DOM touches currently embedded in the "pure" region (asset CSS-var injection, emoji→img body rewrite) — a small, mechanical but *load-bearing* first step, not optional cleanup. Payoff: the Node test harness stops needing a `document` stub at all, and the "is this really engine code" question becomes a lint-able invariant (`grep -RL "document\.\|window\.\|firebase\." js/engine/` should return every file).

**Example:**
```javascript
// js/engine/engine.js — no imports beyond sibling engine files, no globals touched
import { mulberry32 } from './rng.js';
import { DIRS, ING_ALL } from './constants.js';
import { PERSONALITY } from './bots.js';

export class Game {
  constructor(cfg, seed, record) {
    this.r = mulberry32(seed);   // the ONLY entropy source
    this.record = record;
    this.events = [];
    // ...unchanged game-state setup...
  }
  ev(e) { if (this.record) this.events.push(e); }
  play() { /* unchanged */ }
}
export function roundCfg(strategies) { /* unchanged */ }
```

### Pattern 2: State module as mediator (no framework, module-scoped closure + pub/sub)

**What:** Replace bare top-level `let`/`const` globals with a single module exposing `get()`/`set()` accessors and a minimal `subscribe(fn)` / `notify()` pair. Anything that currently calls `render()` directly after mutating a global instead calls `state.set(...)`, which calls `notify()` once; `main.js` does `state.subscribe(render)` a single time at boot.
**When to use:** Exactly this situation — "tame 40+ globals... without a framework." This is the smallest possible reactive system: no virtual DOM, no dependency tracking, just an explicit publish step.
**Trade-offs:** Doesn't eliminate every scattered `render()` call in one shot (Anti-Pattern 3 in the existing codebase docs) — that's a deeper rewrite of every call site, explicitly out of scope for a structural-split milestone. What it *does* buy: a single place (`state/app-state.js`) where "what can mutate this" is enumerable, and a foundation later work can build on to reduce direct `render()` calls incrementally, module by module.

**Example:**
```javascript
// js/state/app-state.js
let game = null, myId = null, room = null, db = null, isHost = false;
const listeners = new Set();

export function getState() { return { game, myId, room, db, isHost }; }
export function setGame(g) { game = g; notify(); }
export function setSession({ id, roomCode, host }) {
  myId = id; room = roomCode; isHost = host; notify();
}
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function notify() { for (const fn of listeners) fn(getState()); }
```

### Pattern 3: Firebase watcher lifecycle registry (fixes the `.off()` leak while extracting)

**What:** A single `watch(path, event, cb)` helper in `net/firebase-client.js` that wraps `db.ref(path).on(event, cb)`, stores `{ref, event, cb}` in a `Map` keyed by a caller-supplied id, and returns an `unwatch()` closure. A companion `unwatchAll()` iterates the map calling `.off()` on every entry — wired to "leave game" / room-teardown flows.
**When to use:** Every one of the 14 existing `.on("value", ...)` call sites (`watchPresence`, `watchFlip`, `watchBattle`, `watchNarr`, `watchChat`, `watchClock`, `watchRoom`'s several sub-watchers, etc.) should be migrated through this single chokepoint during the `net/` extraction step — it's the natural place to fix the leak because every watcher is already being touched/moved anyway.
**Trade-offs:** This is a hand-rolled convenience layer, not the Firebase *modular* SDK's built-in unsubscribe-on-return pattern (see Gap below) — it's scoped to fit the compat SDK the project is staying on for this milestone.

**Example:**
```javascript
// js/net/firebase-client.js
const active = new Map();

export function watch(id, path, cb, errCb) {
  const ref = db.ref(path);
  ref.on('value', cb, errCb);
  active.set(id, { ref, cb });
  return () => unwatch(id);
}
export function unwatch(id) {
  const entry = active.get(id);
  if (!entry) return;
  entry.ref.off('value', entry.cb);
  active.delete(id);
}
export function unwatchAll() { for (const id of [...active.keys()]) unwatch(id); }
```

### Pattern 4: Node ESM harness imports the engine directly (retires `vm`/string-slicing)

**What:** Once `js/engine/engine.js` is a real ES module with `export class Game` / `export function roundCfg`, Node test harnesses `import { Game, roundCfg } from '../js/engine/engine.js'` — no `fs.readFileSync(html)`, no `html.indexOf("<script>")`, no `vm.createContext`.
**When to use:** Immediately once the engine extraction (Pattern 1) lands — this should be the very next step, not deferred, because it's the harness's chance to prove the extraction preserved behavior (see Extraction Order below).
**Trade-offs:** None functionally — this is strictly less fragile than today's approach. The only requirement is repo-level ESM support (see Node ESM Harness Requirements below).

**Example:**
```javascript
// scripts/real_game_test.js (post-refactor)
import { Game, roundCfg } from '../js/engine/engine.js';

const strategies = [0,1,2,3].map(s => BOT_STRATS[(i+s) % BOT_STRATS.length]);
const g = new Game(roundCfg(strategies), SEED_BASE + i, true);
g.play();
```

## Data Flow

### Solo game (unchanged shape, new module boundaries)

```
main.js: boot()
  → ui/assets.js: preloadAssets()
  → state/app-state.js: setGame(new Game(roundCfg(strategies), seed, true))   [engine.js]
  → engine.js: game.play()  — pure, synchronous where no human is waiting
      → on human decision point: awaits a Promise resolved by a ui/*.js DOM event
        listener, which calls state.set(...)/resolves the pending decision
      → on each event pushed via this.ev({...}): state.notify() fires
  → ui/render.js: subscribed to state, re-renders after every notify()
```

### Multiplayer game (host authoritative, guest render-only)

```
Host:
  net/sync.js: runLiveNet()
    → engine.js: game.play() drives the SAME Game instance as solo
    → on each decision/event: net/firebase-client.js writes to
      /rooms/{code}/flip | /battle | /narr | /chat  (via the watch() facade's
      underlying db.ref(...).set(...) — writes don't need the watcher registry,
      only reads/subscriptions do)
    → state/app-state.js updated locally too, so the host's own UI renders
      exactly like a guest's would

Guest:
  net/sync.js: watch(...) callbacks fire on Firebase updates
    → state/app-state.js: setters called with incoming data (never mutates
      engine.js's Game instance directly — guest has no authoritative Game)
    → ui/render.js: subscribed to state, re-renders

Host resume (post-refresh):
  net/sync.js: resumeHostGame()
    → engine/replay.js: replayShortfall(dlogLen, expectedLen, readFailed) — pure
      health check on the recovered decision log
    → engine.js: new Game(cfg, seed, true) + replay dlog entries through the
      SAME Game class the live game used (imported, not reimplemented)
    → state/app-state.js: setGame(rebuiltGame); notify()
```

**Key invariant carried over unchanged:** authoritative state lives only in the host's `engine.js` `Game` instance; guests never construct or mutate a `Game`. The module split doesn't change this — it just gives the invariant a home (`state/app-state.js` is the only place a `Game` instance is stored, and only `net/sync.js`'s host-path code is allowed to call `setGame()` with a freshly-constructed instance).

## Script Load Order & Firebase-Compat-Global Interaction

Firebase does **not** ship an ES-module build of the *compat* SDK — compat is deliberately global/namespace-based (`window.firebase`), and that's true for v12.15.0. Firebase's modular (v9+) SDK does support `import` from the CDN with `type="module"` (`import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js'`), but adopting it means rewriting every `db.ref(x).on(...)`/`.set(...)` call to the modular `ref()/onValue()/set()` free-function API — a full networking-layer rewrite, explicitly bigger than this milestone's scope. **Recommendation: keep the two compat `<script>` tags as classic (non-module) scripts, unchanged, and bridge from `net/firebase-client.js`.**

```html
<!-- index.html, order matters -->
<script src="https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js"></script>
<script type="module" src="js/main.js"></script>
```

Why this ordering is safe without any extra synchronization code: classic (non-`defer`, non-`async`) `<script>` tags execute synchronously the instant the parser reaches them. `<script type="module">` is **always deferred** — the spec guarantees module scripts execute only after the document has finished parsing, and in document order relative to other modules — which is strictly *after* the two classic scripts above it have already run and set `window.firebase`. No top-level `await`, no manual "wait for firebase" polling, no race condition. `net/firebase-client.js` simply reads `window.firebase` (or a project convention of aliasing it to a bare `firebase` reference) at call time inside `fbInit()`, exactly like the current code does at line 4919 — nothing about that call site needs to change, only its location.

**Where top-level `await` is *not* needed here:** the current `Promise.race([preloadAssets(), timeout]).then(hideBootLoader)` pattern (`index.html:5595`) should be kept as-is inside `main.js`'s `boot()` function, not converted to a top-level `await preloadAssets()` in the module body. Top-level await would stall the entire module graph's evaluation on asset loading, which nothing else needs to block on — keep it inside the async `boot()` call, invoked once at the bottom of `main.js`, same shape as today.

**Real regression risk to flag for the roadmap:** `<script type="module">` is blocked by CORS when a page is opened via `file://` in Chrome (classic scripts are not). CLAUDE.md's own "Compatibility Notes" states `file://` currently works for the game. After this refactor, **local development must go through a static file server** (`python3 -m http.server`, `npx serve`, etc.) — this is a workflow change to call out explicitly in the phase that ships the `type="module"` conversion, not an incidental detail.

## Node ESM Test Harness: Requirements

No `package.json` exists today, so there's no conflict to resolve — add one at repo root with `"type": "module"`. Since `scripts/*.js` currently use CommonJS `require()` for Node built-ins only (`fs`, `path`, `vm`), converting them to `import fs from 'node:fs'` / `import path from 'node:path'` is a mechanical one-line-per-import change, and once `engine.js` is a real module, `vm` disappears from these files entirely (Pattern 4 above).

```json
{ "name": "pastry-pirates", "type": "module", "private": true }
```

- Keep `.js` extensions everywhere (browser and Node both resolve `.js` as ESM once `type: module` is set / `<script type="module">` is used) — do **not** mix in `.mjs`; consistency between what the browser `import`s and what Node `import`s matters for this project's "same file, two hosts" guarantee.
- `dlog_replay_test.js`'s second extraction (the `replayShortfall` sentinel-comment region) goes away entirely once `engine/replay.js` is a real module — `import { replayShortfall, REPLAY_SHORTFALL_TOLERANCE } from '../js/engine/replay.js'` replaces the whole sentinel-comment-scanning block (lines 45-64 of that file today).
- `scripts/battle_sim.js` is explicitly a **hand-written reimplementation**, not an extraction — its own header comment says it isn't trusted for real mechanics verification. It's unaffected by the module split and should stay as a standalone sanity-check tool; don't fold it into `engine/` (it deliberately isn't the same code).

## Extraction Order (never leaves the game broken)

This is a strangler-fig sequence: convert the shell to modules first, then progressively shrink a temporary "legacy bridge" that re-exposes not-yet-extracted pieces as globals so still-inline code keeps working unmodified at every intermediate commit.

1. **Golden-fixture baseline (no code change).** Run today's `real_game_test.js`/`dlog_replay_test.js` (or a purpose-built script) across a fixed seed range (e.g., seeds 0-999), serialize each game's full `events` array + final `players` state to a fixture file. This is the regression oracle for every step below — every subsequent step re-runs it and diffs byte-for-byte.
2. **Extract `js/engine/*.js`.** Move constants, `mulberry32`, `PERSONALITY`/bot functions, `class Game`, `roundCfg` verbatim into the new files as real ES modules with `export`. Relocate the three DOM touches (lines 920, 922, 1002) out to `js/ui/assets.js` — they were never engine code. In `index.html`, change the main script tag to `<script type="module" src="js/main.js">`; `main.js` at this step imports `engine.js` and does a temporary `Object.assign(window, { Game, roundCfg, PERSONALITY, ... })` so all the still-inline (not yet extracted) UI/net code — which still references `Game`/`roundCfg` as bare globals — keeps working unchanged. Re-run the golden fixture against the new import path; must match exactly.
3. **Retire the Node harness's `vm`/string-slicing extraction.** Convert `scripts/real_game_test.js` and `scripts/dlog_replay_test.js` to `import` from `js/engine/engine.js` and `js/engine/replay.js` directly (Pattern 4). Add `package.json` with `"type": "module"`. Re-run the golden fixture through the new harness — this step is itself the strongest proof the extraction in step 2 was clean, since it's now impossible for the Node-tested code and the browser-run code to silently diverge (they're the same file).
4. **Extract `js/net/firebase-client.js` + `js/net/room.js`.** Move `fbInit`, `watchPresence`, room create/join/seat logic. Introduce the watcher registry (Pattern 3) as these call sites are touched — fold the `.off()` fix in here rather than as a separate pass, since every watcher is already being relocated. Bridge remaining not-yet-extracted pieces (`db`, `room`, etc.) back onto `window` temporarily, same technique as step 2. Manual multiplayer smoke test (per the project's existing Chrome-tabs/Firebase MP harness) after this step, since it's the first step touching live network code.
5. **Extract `js/state/app-state.js`.** Move the 40+ globals into the closure module with `subscribe`/`notify`. This step necessarily touches the most call sites (every place that read/wrote a global). Do it as its own isolated commit/phase specifically because of that blast radius — bridge `state` itself onto `window.state` temporarily if any inline code still needs bare-global-style access mid-migration.
6. **Extract `js/ui/*.js`** (`render.js`, `board.js`, `modals.js`), wiring `state.subscribe(render)` once in `main.js`. This is the largest remaining chunk of `index.html` and can itself be sub-phased (render.js + assets.js first, board.js/modals.js after) without changing the dependency graph — `ui/*` never depends on anything but `state`/`engine` regardless of how many files it's split into.
7. **Extract `js/net/sync.js`** (`runLiveNet`, the remaining `watchFlip`/`watchBattle`/`watchNarr`/`watchChat`/`watchClock`, `resumeHostGame`) — the last chunk, now importing `engine/replay.js` directly instead of any extraction hack.
8. **Delete the legacy `window` bridge entirely.** Grep `index.html`'s remaining inline `<script>` (should now be near-empty markup only) and `js/**` for any leftover bare-global reads; each one is a missed import. `main.js` becomes the sole `boot()` call site.
9. **Full regression pass.** Golden-fixture diff across the same seed range as step 1 (must still match byte-for-byte after the entire split), Claude-driven Chrome MCP e2e for solo + multiplayer, manual Safari + multiplayer playtest — matching the milestone's stated verification plan.

At every numbered step, `index.html` is loadable and playable in a browser, and the Node harness passes — that's the "never leaves the game broken" guarantee. The temporary `window` bridge in steps 2/4/5 is the mechanism that makes this possible without a big-bang rewrite: it lets already-extracted modules be real, imported, tested modules while not-yet-extracted inline code keeps working exactly as it does today.

## Determinism / Replay Protection Seams (explicit)

1. **Purity boundary is enforced by directory, not convention.** `js/engine/**` must never contain `document`, `window`, `firebase`, `fetch`, or unseeded `Math.random()`/`Date.now()`/`performance.now()`. Before each extraction-step commit, `grep -RnE "document\.|window\.|firebase\.|Math\.random\(|Date\.now\(|performance\.now\(" js/engine/` must return nothing. This is a manual gate (no build step exists to automate it as a lint rule without introducing tooling), but it's cheap and load-bearing — the existing code already passes it in the pure region (verified above), so the bar is "don't regress," not "achieve."
2. **Golden-fixture regression harness is the primary oracle**, not code review. Every extraction step (2, 3, 5, 7, 9 above) re-runs the same seed range through whatever the current entry point is and diffs the full `events` array + final `players` state against the step-1 baseline. A diff at any step means the extraction changed behavior, not just location — treat it as a blocking bug, not a refactor nuance.
3. **`Game.ev()`'s event-object shape is a wire contract, not an implementation detail.** It's consumed by three independent things that must all keep agreeing on field names (`t`, `a`, `d`, `winner`, `downwind`, `flips`, `rounds`, ...): the live Firebase narration/battle sync, the replay/resume path, and both Node test harnesses. During the split, treat any change to this shape as additive-only (new optional fields fine; renaming/removing existing fields requires updating all three consumers in the same commit, and re-baselining the golden fixture).
4. **One `Game` class, reachable from exactly one file.** Before the split there's a structural risk of *accidentally* forking the engine (e.g., a UI helper reimplementing a piece of battle logic inline for a preview). After the split, `engine/engine.js` is the only place `class Game` can be defined — `net/sync.js`'s `resumeHostGame()` importing and reusing it (rather than any parallel reconstruction) is what keeps live-play and replay-rebuild guaranteed identical. This is also why `scripts/battle_sim.js` (an intentional, distrusted reimplementation per its own comment) must stay clearly labeled as a sanity tool and never be mistaken for a second source of truth.
5. **Node/browser parity stops being "tested for" and becomes structural.** Today, Node-tested behavior (via `vm`-extracted source) and browser-run behavior *could* theoretically diverge if the extraction boundary comment (`function escHtml`) drifted without both harnesses being updated — the harnesses' own error-throwing guards exist precisely because that's happened before implicitly. Once both environments `import` the literal same `js/engine/engine.js` file, that divergence class is eliminated by construction, not just detected faster.

## Anti-Patterns to Avoid During Extraction

### Anti-Pattern 1: "Convenience" DOM/Firebase reach-ins from engine code

**What people do:** Leave "just one" `document.querySelector(...)` or `db.ref(...)` call inside `engine.js` because it's faster than plumbing a value through `state`, especially under deadline pressure mid-refactor.
**Why it's wrong:** It's exactly the debt this milestone exists to remove, and it silently breaks the Node-harness import path (Pattern 4) the moment it happens, since Node has no `document`/`firebase`.
**Instead:** If engine logic seems to need something from the DOM or network, that's a signal the value belongs in the function's parameters or the `Game` config object (`cfg`), not a global reach-in — exactly the pattern the codebase already uses for `cfg = { grid, storm, roundBoard, ... }`.

### Anti-Pattern 2: Splitting `state/app-state.js` before `ui/`/`net/` are ready to consume it

**What people do:** Extract the global-taming module first (it looks like the "cleanup" item), then leave inline UI/net code reading/writing `window.state.x` everywhere as a permanent pattern instead of a transitional bridge.
**Why it's wrong:** The whole point of `subscribe`/`notify` is that consumers are real ES-module imports reacting to explicit state changes — leaving direct property pokes at `window.state` around permanently just relocates the "who mutated this and when" problem one level deeper instead of resolving it, and blocks ever removing the bridge.
**Instead:** Treat the `window` bridge (used in extraction steps 2/4/5 above) as explicitly temporary per-step scaffolding, tracked and removed in step 8, not a permanent architecture feature.

### Anti-Pattern 3: Big-bang rewrite of the UI/net tangle

**What people do:** Try to split `ui/` and `net/` apart in one pass, because today's code has UI functions and Firebase watcher callbacks calling each other directly (e.g., a `watchBattle` callback calling a UI battle-scoreboard function, which itself pokes at `spectatingBattle`/`inBattlePrompt` globals) — this tangle resists a clean single-commit split.
**Why it's wrong:** A monolithic split PR is exactly the highest-risk, hardest-to-review, hardest-to-bisect-if-broken shape for a codebase whose core value promise is "must not crash," on a game with no automated UI test coverage.
**Instead:** Follow the numbered extraction order — `state/app-state.js` first establishes the mediator, then `ui/*` and `net/*` are extracted against that mediator rather than against each other, which is what breaks the direct-call tangle without requiring it to be resolved in one shot.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Firebase Realtime Database (compat SDK v12.15.0, CDN) | Two classic `<script>` tags before the `type="module"` entry point; `net/firebase-client.js` reads `window.firebase` at call time | Stay on compat for this milestone — modular SDK migration is a full networking rewrite (every `.on/.off/.set` call site), a natural but separate follow-up milestone, not this one |
| Static hosting (GitHub Pages / Netlify) | Serves `.js` with correct MIME by default | No code change needed; verify once post-refactor as a deploy smoke test |
| `localStorage` | Unaffected by the split — `ui/assets.js` or `state/app-state.js` (whichever owns `getMyId()`/session persistence) calls it the same way as today | Keep try/catch wrapping pattern already in use (`getMyId()`, `saveSession()`) |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `engine ↔ state` | `state` imports and constructs `Game`; `engine` never imports `state` | One-directional; engine has zero awareness it's being used by a stateful host |
| `state ↔ ui` | `ui` imports `state`, calls `subscribe(render)` once; never mutates `state`'s internals directly | Enforces the pub/sub discipline (Pattern 2) |
| `state ↔ net` | `net` imports `state`'s setters to record incoming Firebase data / outgoing writes | Host path additionally imports `engine`/`replay` directly for resume — not through `state` |
| `ui ↔ net` | **No direct import either direction** — always mediated through `state` | This is the edge that keeps the graph acyclic; a PR that adds a `ui/*` → `net/*` import (or vice versa) is a structural regression, not a style nit |

## Gap / Follow-Up Note (out of scope for this milestone, worth flagging to the roadmapper)

Firebase's **modular** (v9+, tree-shakeable) SDK's `onValue(ref, cb)` returns the unsubscribe function directly, which is arguably a cleaner long-term answer to the `.off()` leak than the hand-rolled watcher registry in Pattern 3 — but adopting it means rewriting every `db.ref(x).on(...)/.off(...)/.set(...)` call site to the modular free-function API (`ref()`, `onValue()`, `set()`, `push()`, `onDisconnect()` all change shape). That's a real, separate migration, not a drop-in swap alongside the module-split work — flagging it here so it doesn't get silently folded into this milestone's scope, and so a future milestone has a documented starting point.

## Sources

- Direct inspection of `index.html` (5,639 lines), `scripts/real_game_test.js`, `scripts/dlog_replay_test.js`, `scripts/battle_sim.js`, `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md` — HIGH confidence, primary source
- [Firebase JS SDK compat README](https://github.com/firebase/firebase-js-sdk/blob/main/packages/firebase/README.md) — compat package purpose and global-scope behavior — MEDIUM/HIGH confidence, official source
- [Firebase: alternative ways to add Firebase to your JS project](https://firebase.google.com/docs/web/alt-setup) — `type="module"` CDN import syntax for the *modular* SDK, confirms compat stays script-tag/global-based — MEDIUM/HIGH confidence, official docs
- [Firebase JS SDK release notes](https://firebase.google.com/support/release-notes/js) — version currency check — MEDIUM confidence
- MDN: `<script type="module">` defer-by-default execution ordering, and `file://` CORS restriction on module scripts — HIGH confidence, well-established web platform behavior, cross-checked against training knowledge (stable spec behavior, low risk of staleness)
- Node.js ESM: `"type": "module"` package.json field, `.js`/`.mjs` resolution rules — HIGH confidence, stable Node.js behavior confirmed against current Node docs search results

---
*Architecture research for: native-ES-module refactor of Pastry Pirates (deterministic browser game + Firebase multiplayer)*
*Researched: 2026-07-24*
