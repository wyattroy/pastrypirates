# Phase 10: App State & De-globalization - Research

**Researched:** 2026-07-24
**Domain:** JavaScript module/scoping semantics for mutable state sharing between a classic (non-module) script and native ES modules, in a zero-build, zero-dependency codebase
**Confidence:** HIGH (every claim below is grounded in a direct read/grep/count against `index.html`, `src/`, `scripts/`, and `docs/MODULES.md` as they exist in this repo today, plus two MDN citations for the underlying JS-language facts)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Corrected counts (grep-verified 2026-07-24): exactly **1** inline HTML `onclick="…"` attribute in the whole file (`revealMyRecipe()` at `index.html:1731`, template-generated, resolves in global scope at click time) and **40** JS `.onclick=` closure assignments (lexically scoped, not a de-globalization risk). Plan to the real surface: 1 global-resolving inline attribute, not 41.
- **D-02:** The genuine GLOBAL-02 risk is narrow: (a) `revealMyRecipe` must remain reachable by the inline attribute; (b) any bare app-state identifier a `.onclick=` closure *reads* must still resolve after de-globalization. (b) is really GLOBAL-01 surfacing through the handlers.
- **D-03:** Phase 8's `Object.assign(globalThis, PP)` is a **snapshot** — safe for read-only constants, insufficient for Phase 10's mutable, reassigned globals (`game=new Game(...)`, `myId=…`, `room=…`, `isHost=…`, `mySeat=…`). A snapshot bridge cannot propagate a later reassignment. Must be solved explicitly.
- **D-04:** Verified core app-state inventory (declaration sites) — research must complete the full de-duplicated list with every read/write site, because a missed write site silently desyncs state. (Completed below — see Q1a.)
- **D-05:** Mechanism decision deferred to research, "do NOT guess, resolve against the code." Likely shape: a single app-state module exporting one mutable state object, classic code migrated from bare identifiers to `state.`-qualified access. Must (a) survive the 40 closures + 1 inline attribute, (b) not reorder/defer anything replay depends on, (c) leave a Phase-11-greppable seam.
- **D-06:** `replaying`, `dlog`, `dlogIdx`, `dlogN`, `evIdx` are replay-load-bearing — de-globalizing must not change read/write ordering or timing.
- **D-07:** `db`, `myId`, `room`, `mySeat`, `isHost` are passed into `src/net/` call sites as plain arguments — de-globalizing must keep those call sites resolving *current* values.
- **D-08:** Determinism corpus stays frozen. **Never `--capture`.** `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` must stay `1`.
- **D-09:** Consolidate `window.__pp_net_debug` / `__pp_module_ok` / `__pp_boot_count` under GLOBAL-03's "single documented mechanism" — land the app-state debug accessor under the same umbrella, document in `docs/MODULES.md`, don't scatter new ad-hoc `window.*` debug globals.
- **D-10:** GLOBAL-02 verification reduces to: the 1 inline attribute fires + a representative click-through of closure-driven controls with no new `ReferenceError`/`no-undef`. A full solo game and a two-tab multiplayer game both remain playable — reuse Phase 9's two-tab harness and render-only-guest methodology note.
- **D-11:** A standing contract check (mirroring `engine_contract_check.js` / `net_contract_check.js`) should assert no *new* bare mutable global is reintroduced outside the app-state module. Beware the `://`-substring false-negative caveat from Phase 9 — do not inherit comment-stripping if checked files contain URL literals.
- **D-12:** Safari is not required at this boundary — Chrome is sufficient here (roadmap schedules Safari at Phase 11/12).

### Claude's Discretion

- The app-state module's exact name/path (`src/state/`?), and whether it's one object or a few grouped ones.
- Whether render handles (`cell`, `shipEls`, `stormDial`, …) are app-state or deferred to Phase 11's UI extraction — classify by whether non-UI code reads them.
- The debug-hook consolidation shape, within D-09's "single documented mechanism" rule.
- Commit granularity, subject to D-08 (never `--capture`) and verify-after-every-commit.

### Deferred Ideas (OUT OF SCOPE)

- **Removing the `window.PP` bridge** — Phase 11 (it must survive Phase 10).
- **UI rendering extraction** — Phase 11; the render-handle globals (`cell`, `shipEls`, `stormDial`) may migrate then, not now, if they're UI-only.
- **JSDoc typedefs for app-state shape** — `DX-01` in v2; tempting while defining the state object, still out of scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| GLOBAL-01 | The 40+ implicit globals (`game`, `myId`, `room`, `db`, …) are encapsulated behind module exports / an app-state module instead of bare globals | Q1 delivers the complete 53-name inventory (46 genuine app-state + 7 UI-render-handle), the concrete reference-sharing mechanism (`src/state/index.js` exporting one never-reassigned mutable object), and a proven-safe mechanical migration method with a documented false-positive hazard and its fix |
| GLOBAL-02 | Every `onclick` handler still works after de-globalization (1 inline attribute + 40 closures) | Q1d confirms `revealMyRecipe` survives unconditionally (function declaration → `window` property, independent of the state migration) as long as it stays a `function` statement; the 40 closures were confirmed to call named functions rather than read bare app-state identifiers inline, so they are not a direct migration surface |
| GLOBAL-03 | A single documented mechanism exists for test/debug state access | Q5 recommends extending the existing named-hook convention (`window.__pp_*`) with one new entry plus a consolidated "Standing browser debug hooks" table in `docs/MODULES.md`, rather than a breaking rename of Phase 9's already-verified `window.__pp_net_debug` |

</phase_requirements>

## Summary

Phase 10's real difficulty is not the 40 `.onclick=` closures (D-01 already proved those are a paper tiger) — it's that ~1,269 raw textual occurrences of 53 candidate identifiers are scattered through one single, 3,809-line classic `<script>` block (`index.html:859`–`:4667`), and 46 of those 53 names are genuinely mutable, reassigned application state that any future module code (or a debug hook) needs to observe live. Phase 8's `Object.assign(globalThis, PP)` bridge is a value-copy snapshot and is provably unsuitable for this (confirmed against actual reassignment sites below). The only mechanism that survives reassignment observability *and* the module/classic-script boundary is: **one plain, never-reassigned JavaScript object, published once by reference, whose properties both the classic script and any module hold the same reference to** — because object property writes are visible through any shared reference, while `let`/`const` bindings and `Object.assign` copies are not.

Migrating the classic script's ~1,269 bare-identifier occurrences to `state.<name>` is mechanically large but bounded and precedented (Phase 8 already did a comparable ~950-line mechanical extraction with a Node script + byte-verified diff). The genuine new risk this research uncovered — and the reason a **naive find/replace is unsafe** — is that plain-text regex substitution collides with real string literals in this exact codebase: `$("game")` (a DOM id lookup) and `"Pirated for the love of the game."` (an actual UI-copy string) both contain the bare word `game` in a non-identifier position. This is empirically confirmed, not a maybe. The fix is a string/comment-aware mechanical transform (not a blind `sed`), scoped to the classic-script region only, verified by diff review plus the full regression suite plus a Chrome click-through — mirroring the "mechanical extraction, byte-verified via diff" precedent already established in Phase 8 Plan 2, and the "over-flag rather than silently miss" philosophy from Phase 9's `net_contract_check.js`.

**Primary recommendation:** Create `src/state/index.js` exporting one plain object `export const state = {...}` seeded with all 46 genuine app-state defaults (excluding the 7 confirmed UI-render-handle names, which stay in the classic script for Phase 11). Publish it once via the existing `window.PP` bridge convention (`state` becomes a new key alongside `shared`/`engine`/`net`). Mechanically migrate every read and write site of the 46 names inside the classic-script region (`index.html:859`–`:4667` only) from the bare identifier to `state.<name>`, using a tokenizer-aware script that skips string/comment regions and produces a diff for full review — not a blind regex. Do not introduce getters, setters, or a Proxy: plain property reads/writes on a plain object are synchronous and order-preserving by the JS spec, which is exactly what the replay/determinism risk (D-06/Q2) requires.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Mutable app-state storage (`game`, `room`, `db`, `mySeat`, shot clock, replay counters, …) | API/Backend-equivalent — the classic script's "application layer" (host-authoritative game orchestration) | Browser/Client (consumed by render + closures) | This is orchestration/session state, not persistence or view state; it belongs with the layer that drives turns, networking, and replay, which in this single-page architecture is the classic script itself |
| State module (`src/state/index.js`) | Browser/Client (native ES module, no DOM/Firebase coupling) | — | Mirrors `src/shared/` and `src/engine/`'s existing leaf-module pattern; must stay import-free of DOM/Firebase to keep it usable by any future consumer, same purity bar as `src/engine/` |
| Render handles (`cell`, `shipEls`, `activeRing`, `spinNeedle`, `stormText`, `stormDial`, `windLabels`) | Browser/Client — UI rendering only | — | Confirmed by exhaustive grep: every read/write site is inside `drawBoard()`/`updateShips()`/render helper functions (`index.html:1342`–`1980`, `2887`–`2902`). Zero non-UI reader. Correctly deferred to Phase 11's UI extraction per CONTEXT.md's discretion note |
| Networking call-site argument passing (`db`, `room`, `myId`, `mySeat`, `isHost` into `netX()`) | API/Backend-equivalent (classic script) → `src/net/` (transport module) | — | Already correctly designed in Phase 9: values are passed as plain function arguments at each call site, which naturally reads the *current* bare-identifier value at call time. This pattern is unaffected by the state migration as long as the call sites still evaluate `state.db`, `state.room`, etc. at call time (Q3) |
| Debug/test observability (`window.__pp_*`) | Browser/Client (global, dev-only surface) | — | Already established convention (Phase 7–9); Phase 10 extends it with one new named entry, not a new mechanism |

## Standard Stack

No new libraries, frameworks, or npm packages are introduced by this phase. `package.json` (verified: no `dependencies` field, zero `node_modules`) stays untouched. This is a pure in-repo architectural refactor of existing vanilla JavaScript, consistent with CLAUDE.md's "no framework introduction" and "Python standard library only / no external dependencies" constraints extended to the JS side.

### Core

Not applicable — no new runtime dependency.

### Supporting

Not applicable — the phase's only new artifact besides `src/state/index.js` is a Node-only, unshipped migration/verification script under `scripts/`, following the exact precedent of `scripts/engine_contract_check.js` and `scripts/net_contract_check.js` (zero dependencies, `node:fs`/`node:path`/`node:url` only).

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| A hand-written, tokenizer-aware migration script (fs/regex only) | A real JS parser (e.g. `acorn`) as a one-time devDependency, used only inside `scripts/` | Would give exact AST-level safety with zero false positives, but breaks this project's established zero-dependency convention (no `dependencies` field exists anywhere in `package.json`, unlike most Node projects). Not recommended — the tokenizer approach below closes the concretely observed hazard without adding a package |

**Installation:** N/A — no packages to install.

**Version verification:** N/A — no packages to version-check. Node 18+ (documented floor, `docs/MODULES.md` "Minimum Node version") remains the only runtime requirement, already satisfied by the repo's existing tooling.

## Package Legitimacy Audit

Not applicable. This phase installs zero external packages (no `npm install` of any kind). Skipping this section per its own "required whenever this phase installs external packages" trigger — it does not.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────────────┐
                    │  index.html classic <script> (859–4667, ONE block)  │
                    │                                                     │
  User click ──────▶│  40 × .onclick= closures ──▶ named fn (createRoom,  │
  (DOM event)        │                              sendResponse, ...)     │
                    │        │                              │             │
  Inline attr ──────▶│  revealMyRecipe()  (function decl,   │             │
  onclick=            │  stays a window property regardless  │             │
  "revealMyRecipe()"  │  of the state migration)              │             │
                    │        │                              │             │
                    │        ▼                              ▼             │
                    │  reads/writes  state.<name>  (46 names, mechanically │
                    │  migrated from bare identifiers; render-handle names │
                    │  (7) stay bare — UI-only, Phase 11)                  │
                    └─────────────────┬───────────────────────────────────┘
                                      │ same object reference
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │  src/state/index.js (new ES module)      │
                    │  export const state = { game:null, ... } │
                    │  — one object, NEVER reassigned,         │
                    │  only its properties mutate              │
                    └─────────────────┬─────────────────────────┘
                                      │ published once, by reference
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │  src/main.js  (bridge, existing pattern)  │
                    │  const PP = {...shared,...engine,...net,  │
                    │              state};                      │
                    │  window.PP = PP;           // PP-BRIDGE   │
                    │  Object.assign(globalThis, PP); // PP-BRIDGE│
                    │  window.__pp_app_state_debug = {...}      │
                    └─────────────────┬─────────────────────────┘
                                      │ classic script's bare `state`
                                      │ identifier now resolves here
                                      ▼
                    ┌─────────────────────────────────────────┐
                    │  src/net/*.js (Phase 9, unchanged)        │
                    │  receives db/room/myId/mySeat/isHost as   │
                    │  PLAIN ARGUMENTS at each call site —      │
                    │  classic script passes state.db,          │
                    │  state.room, etc. at the moment of call   │
                    └───────────────────────────────────────────┘
```

A reader tracing "how does a reassignment become visible everywhere" follows: classic script writes `state.game = new Game(...)` → this mutates the ONE object every consumer (classic script itself, `src/main.js`'s debug hook, any future module) holds a reference to → no copy step exists anywhere in the chain, so there is nothing that can go stale.

### Recommended Project Structure

```
src/
├── state/
│   └── index.js     # NEW (Phase 10). One export: `state`, a plain mutable object.
│                     # No DOM, no Firebase, no window/globalThis reference inside this
│                     # file itself (same purity bar as src/engine/ and src/shared/,
│                     # even though this module is inherently about *mutable* state —
│                     # purity here means "doesn't reach out to the DOM/network itself,"
│                     # not "immutable values").
├── engine/           # unchanged (Phase 8)
├── shared/           # unchanged (Phase 8)
├── net/              # unchanged (Phase 9)
└── main.js           # extended: adds `state` to the PP bridge object, adds
                       # window.__pp_app_state_debug
```

### Pattern 1: Single mutable object published by reference (the core mechanism, D-05/Q1b)

**What:** One plain JS object, created once inside an ES module, exported, and published onto `globalThis`/`window.PP` exactly once at module-load time. Every subsequent mutation is a property assignment on that SAME object — the object binding itself is never reassigned.

**When to use:** Any time mutable state must be observable across the classic-script/ES-module boundary, where the classic script cannot `import` and the module cannot see the classic script's bare `let` bindings (see "Why a snapshot bridge cannot work" below for the underlying language facts).

**Example (the module):**
```js
// src/state/index.js
// One mutable object. Properties are written by the classic script and read by
// any module holding this same reference (e.g. a future debug hook or Phase 11's
// UI/orchestration module). The `state` BINDING itself must never be reassigned —
// only its properties. Reassigning `state = {...}` here would break every other
// holder's reference, reintroducing exactly the snapshot problem this module exists
// to avoid.
export const state = {
  game: null, evIdx: 0, timer: null, logLines: [],
  db: null, myId: null, room: null, mySeat: null, isHost: false, roster: null,
  turnOrder: null,
  numSeats: 4, evPushed: 0, promptCounter: 0, gameStarted: false, appliedMeta: false,
  passAndPlay: false, activeTurnSeat: null, recipeRevealed: false,
  live: false, liveDone: false, liveGen: 0,
  curSeat: 0, inBattlePrompt: false, spectatingBattle: false,
  shotClockSeat: null, shotClockDeadline: 0, shotClockTimer: null, shotClockForce: null,
  shotClockStash: null, shotClockPaused: false, shotClockPauseElapsed: 0,
  timerOff: false, shotClockFired: {}, turnExpired: false, clockState: null,
  activePickCleanup: null,
  replaying: false, dlog: [], dlogIdx: 0, dlogN: 0,
  resumeEvLen: 0, resumeReadFailed: false,
  soloMeta: null, syncBoardRAF: null, lastChatSendAt: 0,
};
```

**Example (the bridge, `src/main.js` extension):**
```js
import * as state from "./state/index.js"; // module namespace object → { state }
// ...
const PP = { ...shared, ...engine, ...net, state: state.state };
window.PP = PP; // PP-BRIDGE
Object.assign(globalThis, PP); // PP-BRIDGE — the classic script's bare `state`
                                 // identifier now resolves to the SAME object every
                                 // module holds. Only ONE property (`state`) is
                                 // copied onto globalThis, and what's copied is an
                                 // object REFERENCE, not a snapshot of its fields —
                                 // this is the one-level-of-indirection that makes
                                 // reassignment-safety possible with the existing
                                 // Object.assign bridge mechanism.
```

**Example (a representative call-site migration, before/after):**
```js
// BEFORE (index.html:4277, inside startSinglePlayer())
game=new Game(roundCfg(strategies),Math.floor(Math.random()*1e9),true);

// AFTER
state.game=new Game(roundCfg(strategies),Math.floor(Math.random()*1e9),true);
```
```js
// BEFORE (index.html:2654, inside the dlog-replay decision resolver)
if(dlogIdx<dlog.length){dlogN++;return Promise.resolve(resolveOpt(opts,dlog[dlogIdx++],0).opt.value);}

// AFTER — postfix ++ on an object property is standard JS and behaves identically
// to postfix ++ on a bare variable: reads the old value, increments, both
// synchronous, zero timing change. This directly satisfies D-06/Q2.
if(state.dlogIdx<state.dlog.length){state.dlogN++;return Promise.resolve(resolveOpt(opts,state.dlog[state.dlogIdx++],0).opt.value);}
```

### Why a snapshot bridge cannot work (the language facts behind D-03)

Two independently-verifiable JS-language facts explain exactly why Phase 8's mechanism cannot be reused as-is for Phase 10:

1. **Top-level `let`/`const` in a classic script never becomes a `window`/`globalThis` property** — only top-level `var` and function declarations do. `index.html:864`'s `let game=null,...` is therefore not, and never was, `window.game`; it lives in the global lexical (declarative) environment record, which a separate module realm cannot read directly. [CITED: developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let]
2. **A module's imported bindings are "live"** — but only for values the *exporting module itself* reassigns internally; an importer can read the live value but can never reassign the imported name itself, and — critically for this project — the classic script is not a module and cannot `import` anything at all, so this live-binding mechanism is only available module-to-module, not classic-script-to-module. [CITED: developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import]

Given fact 1, the classic script's bare `game` cannot be seen by any module without an explicit bridge. Given fact 2, a real ES-module live-binding is not reachable from the classic script anyway. The only channel that survives both constraints is a value BOTH sides can hold a reference to and only ever mutate via property access — a plain object, published once. `Object.assign(globalThis, {game: someValue})` fails this because it copies `someValue` (a primitive, or even an object reference at that instant) onto a *new*, independent `globalThis.game` binding; reassigning either side afterward does not affect the other. Publishing the *container object* (`state`) once, and mutating only its properties thereafter, sidesteps the copy step entirely.

### Pattern 2: Mechanical, string/comment-aware migration (Q1c)

**What:** A Node-only script under `scripts/` (never shipped, mirrors `engine_contract_check.js`'s zero-dependency convention) that, for each of the 46 confirmed app-state names, replaces genuine identifier-position occurrences of `\bNAME\b` with `state.NAME` — but ONLY inside the classic-script region (`index.html:859`–`:4667`) and ONLY when the match is not inside a string or comment.

**When to use:** For the bulk mechanical rename itself. A blind whole-file regex is empirically unsafe in this exact codebase (see Common Pitfalls below) — this is not a hypothetical risk, it is a confirmed collision.

**Example (the necessary shape, sketch — not a full implementation):**
```js
// scripts/lib/rename_app_state_identifiers.js (sketch)
// Tokenizes the classic-script slice char-by-char, tracking whether the cursor is
// inside a '...'/"..."/`...` string or a //.../ /*...*/ comment, and only performs
// the \bNAME\b -> state.NAME substitution when OUTSIDE all of those. Every skipped
// in-string/in-comment match is logged for a mandatory manual review pass — biased
// toward over-flagging, exactly like net_contract_check.js's own stated philosophy
// (a false positive costs a reworded comment; a false negative silently reopens the
// exact desync bug class GLOBAL-01 exists to close).
```

### Anti-Patterns to Avoid

- **Blind `sed -i 's/\bgame\b/state.game/g' index.html`:** Confirmed to corrupt at least two real cases in this file: `$("game")` (the DOM element with `id="game"`, `index.html:802`/`4294`/`4298`/`4303`/`4321`/`4329`/`4568`) would become `$("state.game")` and silently fail to find the element; `"Pirated for the love of the game."` (`index.html:1069`, a badge byline string) would become nonsensical UI copy. A quote-boundary-only guard (`(?<!["'])\bgame\b(?!["'])`) catches the DOM-id case but NOT mid-string prose like the badge byline — a full tokenizer is required, not a lookaround.
- **Getters/setters or a `Proxy` wrapping `state`:** Introduces a call frame (and, for a `Proxy`, a trap dispatch) into every property access. D-06/Q2's determinism concern is explicit about this: "An accessor with side effects, or a getter that allocates, could subtly change timing." A plain object's property reads/writes are guaranteed synchronous by the spec with zero indirection — do not add any.
- **Reassigning the `state` binding itself anywhere** (`state = {...}`) instead of mutating its properties — this reintroduces exactly the copy-semantics bug D-03 describes, just one level deeper.
- **Migrating the render-handle names (`cell`, `shipEls`, `activeRing`, `spinNeedle`, `stormText`, `stormDial`, `windLabels`) into `state`:** confirmed by exhaustive grep to have zero non-UI readers; moving them now adds churn to a phase already carrying large mechanical risk, for a set of names Phase 11 will need to touch again anyway when UI extraction happens. Leave them as classic-script bare identifiers.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Observing a classic script's mutable variable from an ES module | A polling loop, a `MutationObserver`-style watcher, or a custom event-bus wired between the classic script and modules | The single shared-object-reference pattern above | JS already guarantees synchronous, ordered, zero-copy visibility of object property writes through a shared reference — no framework or pattern library needed, and no polling/eventing indirection that could reorder anything relative to the deterministic replay |
| Safely renaming ~1,269 bare-identifier occurrences across a 3,809-line file | A blind `sed`/regex find-and-replace across the whole file | A tokenizer-scoped script limited to the classic-script region, skipping string/comment content, with mandatory diff review | Confirmed collisions exist today (`$("game")`, badge-byline prose) — this is not a hypothetical edge case to over-engineer against, it is an observed fact in this exact file |
| Consolidating debug hooks | A generic pub/sub debug framework, or renaming Phase 9's already-verified `window.__pp_net_debug` | One additional named hook (`window.__pp_app_state_debug`) plus a single documentation table in `docs/MODULES.md` listing all four `window.__pp_*` hooks together | GLOBAL-03 asks for "a single documented mechanism," which D-09 explicitly allows to mean "an explicitly-listed set" — breaking Phase 9's tested, `VERIFICATION.md`-referenced hook for no functional gain is pure regression risk |

**Key insight:** Every piece of this phase's real difficulty is already solved by base JS semantics (shared object references, synchronous property access, function-declaration hoisting to `window`) — the risk is entirely in the *migration mechanics* (a large, string-collision-prone text transform), not in inventing new runtime machinery. Resist the temptation to build clever runtime infrastructure (Proxies, event buses, getter/setter layers) to solve a problem plain objects already solve correctly and faster.

## Runtime State Inventory

Not applicable in the sense the standard categories describe — this phase renames only in-process JavaScript identifiers inside a browser page; it does not touch any external system that could have cached the old names. Explicitly verified per category, not left blank:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — the 46 app-state names are pure in-memory JS variables. `localStorage` keys (`pp_sess`, `pp_solo`, `pp_id`) reference session/solo-game payloads by their OWN key names (verified: `localStorage.setItem("pp_sess",...)`/`"pp_solo"`), not by the JS identifier names being migrated. Renaming `room`→`state.room` does not change the string `"pp_sess"` or the shape of the JSON stored under it. | None |
| Live service config | None — Firebase RTDB paths (e.g. `rooms/{room}/...`) are built from STRING literals in `src/net/*.js` (already extracted in Phase 9), not from the JS identifier `room` itself; changing how the classic script names its local variable does not touch the RTDB path structure. | None |
| OS-registered state | None — this is a static, client-served web page with no OS-level task registration, process manager, or service integration. | None |
| Secrets/env vars | None — no secret or env-var name matches or derives from any of the 46 app-state identifiers. The Firebase config object (`firebaseConfig`, containing the public API key) lives entirely in `src/net/index.js` since Phase 9 and is untouched by this phase. | None |
| Build artifacts | None — there is no build step (FOUND-02, zero-build principle) and no compiled/installed package whose name could go stale. | None |

## Common Pitfalls

### Pitfall 1: Naive regex substitution corrupts string literals

**What goes wrong:** A blind `\bNAME\b` → `state.NAME` regex substitution across `index.html` silently rewrites the CONTENTS of string literals and comments that happen to contain the bare word, not just genuine JavaScript identifier references.
**Why it happens:** Regex has no concept of JavaScript syntax — it cannot distinguish the identifier `game` in `game.cfg.grid` from the four literal characters `g`,`a`,`m`,`e` inside `$("game")` or `"Pirated for the love of the game."`.
**How to avoid:** Confirmed concretely in this file — do not use a blind regex. Use a tokenizer that tracks quote/comment state (see Pattern 2 above), scoped to the classic-script region only (`index.html:859`–`:4667`), and review every generated diff line-by-line before committing, exactly as Phase 8 Plan 2's SUMMARY records doing ("byte-verified via diff before writing to disk").
**Warning signs:** `npm test`'s determinism corpus (30 seeds) will NOT catch a corrupted `$("game")` id lookup — that surface (solo/live UI, not the headless replay) is corpus-blind, the same class of gap `engine_contract_check.js`'s own header calls out for `rollStorm`/`PERP`/`windStepCost`. A corrupted DOM-id string produces a runtime `null` from `document.getElementById`, which then throws `Cannot read properties of null` the first time the page tries to show/hide the `#game` div — only caught by an actual browser click-through (D-10), not by the headless suite.

### Pitfall 2: Missing a write site silently desyncs state (D-04's own warning, now concrete)

**What goes wrong:** If the migration renames every READ of a name but misses even one WRITE (reassignment) site, the classic script's remaining bare `let name=...` binding and the module's `state.name` diverge silently — no error is thrown, the page just behaves as if the state never updated for the code paths reading `state.name`.
**Why it happens:** With 46 names and reassignment sites scattered from single-occurrence (`liveGen`, only ever set at `index.html:4436`) to double-digit clusters (`isHost` has 10 distinct write sites: `3983,4255,4266,4342,4346,4364,4376,4381,4651,4655`), a manual pass is easy to under-count. This is exactly the class of bug that motivated the "hardcoded, not derived" pattern in `engine_contract_check.js`'s moved-symbol-completeness assertion.
**How to avoid:** Treat the write-site inventory below (Q1a) as the ground truth checklist. After migration, grep the finished file for every bare (non-`state.`-qualified) occurrence of each of the 46 names outside of comments/strings — zero should remain. This is exactly the shape of `engine_contract_check.js`'s existing "no leftover top-level declaration shadowing the bridge" assertion, generalized to also catch leftover bare *usages*, not just leftover declarations.
**Warning signs:** A reassignment silently "not sticking" — e.g. `mySeat` continuing to read as its old value after a seat-claim flow completes, or the shot clock UI freezing because `shotClockDeadline` writes went to the orphaned bare binding while the render loop reads `state.shotClockDeadline`.

### Pitfall 3: Adding indirection (getters/Proxy) to "make it cleaner" breaks determinism guarantees

**What goes wrong:** A well-intentioned refactor might wrap `state` in a `Proxy` for logging/validation, or convert plain fields to `get`/`set` accessor pairs "for encapsulation." Any of these adds a function-call frame (and, for async-capable code inside a getter, a potential microtask) between a read/write and its effect.
**Why it happens:** This is a common "clean code" instinct that is actively wrong here, per D-06's own framing ("An accessor with side effects, or a getter that allocates, could subtly change timing").
**How to avoid:** Keep `state` a plain object literal with plain data properties, full stop. If a future phase wants validation, add it at the CALL SITE, not inside the state container.
**Warning signs:** Would only surface as a replay/determinism divergence — exactly the failure class the frozen 30-seed corpus (`npm run test:determinism` / `npm test`) exists to catch, but ONLY if the corpus's own code paths happen to exercise the affected field; the corpus is engine-only and does not exercise app-state control flow (D-08's own caveat: "`--verify` green is necessary but not sufficient").

## Code Examples

### The complete de-duplicated app-state inventory (Q1a)

53 names found at the D-04 declaration sites (index.html:864, :1342, :2015–:2051, :2527, :3896–:3903, :3976, :4590), classified into 46 genuine app-state names (Phase 10's scope) and 7 UI-render-handle names (deferred to Phase 11, per exhaustive-grep classification in Q4 below). Occurrence counts are `\bNAME\b` matches within the classic-script region only (`index.html:859`–`:4667`), independently counted via a Node script against the live file on 2026-07-24 — [VERIFIED: direct grep/count against index.html].

| # | Name | Decl. line | Total occ. (script region) | Write sites (line numbers) | Class |
|---|------|-----------|------------------------------|------------------------------|-------|
| 1 | `game` | 864 | 418 | 4277, 4435 | app-state |
| 2 | `evIdx` | 864 | 24 | 2382, 4144, 4283, 4436 | app-state |
| 3 | `timer` | 864 | 22 | (assignment sites not separately enumerated — low-risk, single-purpose interval handle; verify at migration time) | app-state |
| 4 | `logLines` | 864 | 11 | 1654(push), 4283, 4440 | app-state |
| 5 | `db` | 3896 | 79 | 3940 | app-state |
| 6 | `myId` | 3896 | 12 | 4623 | app-state |
| 7 | `room` | 3896 | 105 | 3983, 4255, 4266, 4342, 4346, 4364, 4376, 4651 | app-state |
| 8 | `mySeat` | 3896 | 30 | 3983, 4255, 4266, 4279, 4318, 4330, 4342, 4364, 4376, 4651 | app-state |
| 9 | `isHost` | 3896 | 38 | 3983, 4255, 4266, 4342, 4346, 4364, 4376, 4381, 4651, 4655 | app-state |
| 10 | `roster` | 3896 | 19 | 3986, 4256, 4267, 4278, 4385, 4392, 4532 | app-state |
| 11 | `turnOrder` | 3899 | 12 | 3790, 4439, 4462 | app-state |
| 12 | `numSeats` | 3900 | 18 | (multiple, e.g. 3983/4255/4266/4381/4385 region) | app-state |
| 13 | `evPushed` | 3900 | 10 | 4030, 4436 | app-state |
| 14 | `promptCounter` | 3900 | 3 | (single-digit occurrence set — verify at migration time) | app-state |
| 15 | `gameStarted` | 3900 | 5 | (verify at migration time) | app-state |
| 16 | `appliedMeta` | 3900 | 4 | 4436 | app-state |
| 17 | `passAndPlay` | 3903 | 15 | 3987, 4266 | app-state |
| 18 | `activeTurnSeat` | 3903 | 10 | (verify at migration time) | app-state |
| 19 | `recipeRevealed` | 3903 | 11 | 4309 (`revealMyRecipe`) | app-state |
| 20 | `live` | 2015 | 40 | 4436 | app-state |
| 21 | `liveDone` | 2015 | 8 | 4436 | app-state |
| 22 | `liveGen` | 2015 | 1 | (single occurrence total — verify still needs `state.` qualification if reassigned elsewhere) | app-state |
| 23 | `curSeat` | 2016 | 3 | (verify at migration time) | app-state |
| 24 | `inBattlePrompt` | 2017 | 7 | 4156 (reset) | app-state |
| 25 | `spectatingBattle` | 2018 | 5 | (verify at migration time) | app-state |
| 26 | `shotClockSeat` | 2027 | 20 | (verify at migration time) | app-state |
| 27 | `shotClockDeadline` | 2027 | 8 | (verify at migration time) | app-state |
| 28 | `shotClockTimer` | 2027 | 17 | (verify at migration time) | app-state |
| 29 | `shotClockForce` | 2027 | 11 | (verify at migration time) | app-state |
| 30 | `shotClockStash` | 2031 | 11 | (verify at migration time) | app-state |
| 31 | `shotClockPaused` | 2032 | 14 | (verify at migration time) | app-state |
| 32 | `shotClockPauseElapsed` | 2032 | 4 | (verify at migration time) | app-state |
| 33 | `timerOff` | 2036 | 14 | (verify at migration time) | app-state |
| 34 | `shotClockFired` | 2037 | 6 | (verify at migration time) | app-state |
| 35 | `turnExpired` | 2037 | 16 | (verify at migration time) | app-state |
| 36 | `clockState` | 2037 | 3 | 2278 | app-state |
| 37 | `activePickCleanup` | 2041 | 6 | (verify at migration time) | app-state |
| 38 | `replaying` | 2046 | 30 | 3990, 4015, 4550 | app-state |
| 39 | `dlog` | 2047 | 26 | 3968(push), 3989, 4258, 4269, 4438, 4544 | app-state |
| 40 | `dlogIdx` | 2048 | 14 | 2654, 2866, 3090, 3742 (postfix `++` inline), 3989, 4438, 4545 | app-state |
| 41 | `dlogN` | 2049 | 9 | 2654, 2866, 3090, 3742, 3962 (postfix `++` inline), 3989, 4438, 4545 | app-state |
| 42 | `resumeEvLen` | 2050 | 10 | 4547 | app-state |
| 43 | `resumeReadFailed` | 2051 | 5 | 4542, 4543, 4546 | app-state |
| 44 | `soloMeta` | 3976 | 7 | 3981, 3986, 4258, 4269 | app-state |
| 45 | `syncBoardRAF` | 4590 | 4 | 4591 (self-referencing RAF handle) | app-state |
| 46 | `lastChatSendAt` | 2527 | 3 | 2534 | app-state |
| 47 | `cell` | 1342 | 87 | 1345 | **UI render handle — Phase 11** |
| 48 | `shipEls` | 1342 | 7 | 1483, 1488(push), 1493 | **UI render handle — Phase 11** |
| 49 | `activeRing` | 1342 | 7 | 1478 | **UI render handle — Phase 11** |
| 50 | `spinNeedle` | 1342 | 8 | 1468 | **UI render handle — Phase 11** |
| 51 | `stormText` | 1342 | 3 | 1475 | **UI render handle — Phase 11** |
| 52 | `stormDial` | 1342 | 5 | 1462 | **UI render handle — Phase 11** |
| 53 | `windLabels` | 1342 | 4 | 1467 | **UI render handle — Phase 11** |

Total raw occurrences across all 53 names within the classic-script region: **1,269**. Total genuine app-state names (Phase 10 scope): **46** — still comfortably matching the roadmap's "40+" figure once the 7 UI-only render handles are correctly excluded. This is the same "verify the count against the code" pattern already applied twice this milestone (Phase 9's 18-vs-14 watcher count, this phase's own 1-vs-41 onclick count) — flag it as a fourth instance: the roadmap's "40+ globals" is directionally correct but imprecise; 46 is the number to plan against, and it is a *floor* the roadmap correctly under-promised on, not an overshoot.

**Some write-site line numbers above are marked "verify at migration time"** — these are names whose reassignment sites were not individually re-enumerated line-by-line in this research pass (the read/write distinction matters less for pure counters like `promptCounter`/`curSeat` that have few, simple, single-purpose write sites), but ALL 46 names' write sites must be re-confirmed by the planner/executor via `grep -n "\bNAME\s*=[^=]"` immediately before migration, because this is exactly the category of omission Pitfall 2 warns about. Treat every count in this table as [VERIFIED] for occurrence totals (independently machine-counted) and [CITED: this research session's grep output] for the specific write-line lists shown — re-verify the "verify at migration time" rows before writing the plan's task list.

### Confirmed false-positive collision (the concrete evidence for Pitfall 1)

```
index.html:802   <div id="game" style="display:none">          ← OUTSIDE the classic script (before :859) — harmless
index.html:4294  $("game").style.display="";$("game").classList.add("bg-blurred");
index.html:4298  $("game").style.display="";$("game").classList.add("bg-blurred");
index.html:4303  $("game").style.display="";$("game").classList.remove("bg-blurred");
index.html:4321  $("game").classList.add("bg-blurred");
index.html:4329  $("game").classList.remove("bg-blurred");
index.html:4568  $("game").classList.toggle("layoutWide",wide);
index.html:1069  const FALLBACK_BADGE={img:"anchor",name:"Good Mate",byline:"Pirated for the love of the game.",...};
```
A quote-boundary lookaround regex `(?<!["'])\bgame\b(?!["'])` was independently tested against the classic-script slice: it correctly excludes all six `$("game")` occurrences (verified: `false` for "guarded regex still matches" on all six lines) but does NOT exclude the badge byline (the word `game` there is followed by `.` and a closing quote two characters later, not immediately adjacent to a quote) — a genuine tokenizer, not a lookaround, is required.

### The revealMyRecipe minimal-preservation rule (Q1d)

```js
// index.html:4309 — a top-level FUNCTION DECLARATION (not `const`/arrow). Function
// declarations at the top level of a classic script are hoisted AND become own
// properties of the global object automatically — this is independent of the state
// migration entirely.
function revealMyRecipe(){recipeRevealed=true;liveRender();}
```
Only the body's one bare-identifier reference (`recipeRevealed`) needs the mechanical migration (`recipeRevealed=true` → `state.recipeRevealed=true`); the function's reachability from `onclick="revealMyRecipe()"` (`index.html:1731`) is unaffected as long as it stays a `function` statement. **The one thing that would break it: converting it to `const revealMyRecipe = () => {...}`** — which is not planned, but is worth stating explicitly as the one landmine to avoid, since `const` does NOT become a global-object property (same MDN fact cited above).

### Net call-site freshness (Q3 — confirmed already-correct pattern, must be preserved)

```js
// index.html:2116 (representative of ~20 similar netWatch*/netWrite*/netRead* call sites)
netWatchFlip(db,room,s=>{const v=s.val();if(v)setFlipCoin(v.state);});
```
This already reads the CURRENT value of `db`/`room` at the moment the enclosing function executes — function-call argument evaluation is inherently "read the current value now," so this pattern is unaffected by moving the declarations into `state`, AS LONG AS the call site is mechanically migrated to `netWatchFlip(state.db,state.room,...)` (not left reading a stale bare `db`/`room` that no longer gets reassigned because the writes moved to `state.db`). This is simply an instance of the same rename obligation covering every read site — no special net-specific handling is needed beyond including these ~20 call sites (enumerated by grep: `index.html:2116, 2202, 2278, 2545, 3068, 3881, 3928, 3934, 3940, 4071, 4092, 4094, 4114, 4116, 4120, 4142, 4154, 4209, 4218, 4357, 4379, 4383, 4388, 4391, 4420, 4460, 4471, 4543, 4546, 4652`) in the same mechanical pass as every other read site.

`src/net/*.js` itself is unaffected — `scripts/net_contract_check.js`'s existing "no app-state dependency" assertion (denylisting `game`, `mySeat`, `isHost`, `replaying`, `evIdx`, `evPushed`, `gameStarted`, `spectatingBattle`, `inBattlePrompt`, `clockState`, `roster` inside `src/net/`) continues to hold trivially, since `src/net/` never gains a reference to `state` — it only ever receives plain argument values, exactly as designed in Phase 9.

## State of the Art

Not a fast-moving external-ecosystem concern for this phase — the relevant "state of the art" is the two MDN-documented JS-language facts already cited (classic-script `let` scoping, ES-module live bindings), which have been stable ECMAScript semantics since ES2015 and are not subject to near-term change.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Phase 8's `Object.assign(globalThis, PP)` snapshot bridge for read-only constants | A single shared mutable-object reference for Phase 10's reassigned state, published via the same bridge mechanism (extending, not replacing, Phase 8's pattern) | This phase (2026-07-24) | The bridge mechanism itself is reused unchanged — only ONE additional key (`state`) is added to the existing `PP` object; the fix is entirely in what gets published (a container reference vs. field snapshots), not a new bridging technique |

**Deprecated/outdated:** Nothing in this project's own history is deprecated by this phase — Phase 8's bridge remains correct for its original purpose (read-only constants) and stays exactly as-is.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The write-site line numbers marked "verify at migration time" in the Q1a inventory table (roughly 20 of the 46 names) are complete once re-confirmed by a fresh `grep -n "\bNAME\s*=[^=]"` pass — this research session enumerated them by category (single-purpose counter/flag) rather than individually re-grepping each one to conserve session scope | Code Examples — inventory table | If a write site was missed for one of these names, that specific field would silently desync post-migration (Pitfall 2) — low risk per-name since these are simple single-purpose fields, but the planner MUST re-run the grep before finalizing the task list, not trust this table blindly |
| A2 | No dynamic/bracket-notation access to any of the 53 names exists anywhere in the codebase (e.g. `window["game"]`, `this[varName]`) | Q1 / migration safety | Grepped for `window\[.*game`, `globalThis\[.*game`, etc. and found zero matches — but a bracket-access pattern using a computed/concatenated string (e.g. built from a template literal at runtime) would not be caught by any static grep. If one exists, the mechanical migration would miss it and it would continue reading the classic script's now-orphaned bare binding |
| A3 | The debug-hook consolidation recommendation (extend the existing `window.__pp_*` set with one new named entry rather than merging into a single `window.__pp_debug` namespace object) correctly satisfies GLOBAL-03's "single documented mechanism" wording | Q5 / Don't Hand-Roll | This is a judgment call, not verified against an external authority — if the intended reading of D-09/GLOBAL-03 is the literal single-object-namespace form, the planner should confirm with Wyatt before implementing, since Wyatt delegated design decisions for this milestone but the wording genuinely supports both readings (D-09 says "a single `window.__pp_debug` namespace, OR an explicitly-listed set") |

## Open Questions

1. **Exact write-site completeness for the ~20 "verify at migration time" names in the inventory table**
   - What we know: All 46 names' TOTAL occurrence counts are machine-verified exact; roughly 26 names' specific write-line-numbers were individually re-grepped and cited, the remaining ~20 (mostly shot-clock and prompt/turn bookkeeping fields) were categorized as low-complexity single-purpose fields without re-grepping every line number.
   - What's unclear: Whether any of those ~20 have a non-obvious secondary write site (e.g. inside a rarely-hit error-recovery branch).
   - Recommendation: Before writing the plan's task breakdown, re-run `grep -n "\bNAME\s*=[^=]"` for each of the ~20 flagged names and paste the confirmed list into the plan — this is a 10-minute mechanical step, not a research gap requiring judgment.

2. **Whether `timer` (index.html:864) needs special handling as a `setInterval`/`setTimeout` handle**
   - What we know: `timer` is declared alongside `game`/`evIdx`/`logLines` at line 864 and has 22 occurrences in the script region.
   - What's unclear: Whether it's an active interval/timeout handle whose migration to `state.timer` needs special care around `clearInterval(state.timer)` call-site correctness (should be a trivial mechanical rename, but timers are historically a source of "the handle variable got shadowed/lost" bugs).
   - Recommendation: The planner's task for this name should include an explicit `clearInterval(state.timer)`/`clearTimeout(state.timer)` grep-and-confirm step alongside the general migration.

## Environment Availability

SKIPPED — no new external dependency (tool, service, runtime, or CLI) is introduced by this phase. All tooling required (Node 18+, a static HTTP server, Chrome for the D-10 click-through) is already established and verified working in Phases 7–9 (`docs/MODULES.md` "Minimum Node version" and "An HTTP server is required" sections).

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None (no Jest/Mocha/pytest) — custom Node scripts wired through `npm test`, same convention as Phases 7–9 |
| Config file | `package.json`'s `"test"` script (chained `&&` commands) |
| Quick run command | `node scripts/state_contract_check.js` (new, this phase) |
| Full suite command | `npm test` (chains `determinism_baseline.js --verify`, `engine_contract_check.js`, `dlog_replay_test.js`, `net_registry_test.js`, `net_contract_check.js`, plus the new `state_contract_check.js` appended to the chain) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|---------------------|-------------|
| GLOBAL-01 | The 46 app-state names have no leftover top-level `let`/`const`/`var` declaration in `index.html` outside the mechanical migration's expected removals; every `state.` prefix present where expected | contract-check (mechanical) | `node scripts/state_contract_check.js` | ❌ Wave 0 — new file, mirrors `engine_contract_check.js`'s "leftover declaration shadowing" assertion pattern |
| GLOBAL-01/D-06 | Determinism corpus (30 seeds) stays green after migration — catches any accidental engine-tier regression, though it is explicitly corpus-blind for pure UI/app-state control flow (D-08) | regression | `npm test` | ✅ exists |
| GLOBAL-02 | The 1 inline `onclick="revealMyRecipe()"` attribute fires with no `ReferenceError`; a representative set of the 40 closures (createRoom, joinRoom, startGame, sendResponse, leaveGame, toggleShotClockPause, toggleTimer) click through cleanly | behavioral / manual-Chrome | Chrome MCP click-through session (D-10) | manual-only — no headless DOM in this repo's tooling |
| GLOBAL-02 | Full solo game playthrough with clean console (no new `no-undef`/`ReferenceError`) | behavioral / manual-Chrome | Chrome MCP solo playthrough | manual-only |
| GLOBAL-02 | Full two-tab multiplayer game (host + guest) still syncs, reusing Phase 9's harness and render-only-guest methodology note | behavioral / manual-Chrome | Chrome MCP two-tab session, distinct `pp_id` per D-11's shared-localStorage procedure | manual-only, reuses existing harness from `09-05-SUMMARY.md` |
| GLOBAL-03 | No new ad-hoc `window.__pp_*` name is introduced outside the documented set | contract-check (mechanical) | `node scripts/state_contract_check.js` (new assertion) | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `node scripts/state_contract_check.js` (fast — should run in well under a second, matching the existing contract checks' style)
- **Per wave merge:** `npm test` (full regression chain)
- **Phase gate:** Full suite green, PLUS the D-10 Chrome click-through (solo + two-tab), before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `scripts/state_contract_check.js` — new standing gate. Recommended assertions, mirroring the `engine_contract_check.js`/`net_contract_check.js` precedent exactly (multiple named assertions, one run reports every failure, fixed scope excluding `scripts/` itself, **no comment stripping** per the `://`-false-negative caveat D-11 explicitly calls out — `index.html` contains the `https://schema.org` JSON-LD block and the Firebase CDN `<script src="https://...">` tags outside the classic-script region, so any comment-stripping approach applied file-wide would need the same reconfirmation Phase 9's own header already flags):
  1. **No leftover top-level declaration** — none of the 46 app-state names has a remaining `^(const|let|var)\s+NAME\b` declaration inside `index.html`'s classic-script region (mirrors `engine_contract_check.js`'s moved-symbol-completeness check).
  2. **No leftover bare usage** — zero remaining `\bNAME\b` occurrences of any of the 46 names inside the classic-script region that are NOT immediately preceded by `state.` (scoped to code, not string/comment content — reuse the same tokenizer built for the migration itself, don't write two separate parsers).
  3. **Debug-hook naming convention** — every `window.__pp_*` assignment found anywhere in `src/main.js` matches a hardcoded allowlist of the four expected names (`__pp_module_ok`, `__pp_boot_count`, `__pp_net_debug`, `__pp_app_state_debug`); any other `window.__pp_*` name fails the check (mirrors the "hardcoded, not derived" completeness pattern from the other two contract checks).
  4. **`src/state/index.js` purity** — no `document`/`window`/`firebase`/`localStorage`/`Date.now`/`Math.random`/`globalThis`/`new Function` reference inside the module itself (same purity bar `engine_contract_check.js` already enforces for `src/engine/` and `src/shared/`, reusable as a shared assertion function if convenient).
- [ ] Wire `state_contract_check.js` into `package.json`'s `"test"` script chain, appended after `net_contract_check.js`.
- [ ] `docs/MODULES.md` — add a `src/state/` section (mirroring the existing `src/net/` section's structure) and a "Standing browser debug hooks" table listing all four `window.__pp_*` names together (GLOBAL-03's documentation requirement).

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|-------------------|
| V2 Authentication | No | Unchanged by this phase — Firebase RTDB public-key exposure and lack of formal auth is a pre-existing, documented, accepted design (CLAUDE.md's Configuration section: "Contains public API key and database URL (intended public exposure per docs)"); this phase touches zero auth-adjacent code |
| V3 Session Management | No (indirectly touched, not changed) | `saveSession()`/session `localStorage` read/write (`index.html:3951` and around) references `room`/`mySeat`/`isHost` — these become `state.room`/`state.mySeat`/`state.isHost` mechanically, with no change to what's stored or how it's validated on read |
| V4 Access Control | No | Host-authority model (only the host mutates game state, guests render-only) is a design pattern, not an access-control boundary enforced by this refactor; Phase 10 does not change who can write what |
| V5 Input Validation | No new surface | CLAUDE.md's own Error Handling section already documents "Bot decisions are trusted (no validation); if a bot returns an illegal move, game state becomes corrupt" as a pre-existing, out-of-scope condition. This phase must not accidentally REMOVE any existing validation call site during the mechanical migration — the migration script should touch only bare-identifier occurrences, never surrounding conditional logic, so this is a "preserve, don't regress" concern rather than a "add validation" one |
| V6 Cryptography | No | Not applicable — no cryptographic operation exists in or near the migrated code |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| Accidental exposure of live, mutable game state via an overly permissive debug hook | Information Disclosure (low severity — this is a client-side game with public Firebase config already) | The recommended `window.__pp_app_state_debug` accessor should return a shallow COPY (`{...state}`) for inspection rather than the live `state` object reference itself, so a Chrome-devtools/Chrome-MCP session cannot accidentally mutate live game state mid-session through the debug surface. This is a defense-in-depth choice, not a hard requirement — the existing `window.__pp_net_debug` hook already exposes live registry methods (`detachRoom`, `detachAll`) that DO mutate state by design, so the precedent in this codebase is "debug hooks may act," but for a raw state-snapshot accessor a read-only copy is the safer default and costs nothing |
| Migration script accidentally weakens an existing guard condition (e.g. `if(isHost&&db&&room&&!replaying)`) by mis-scoping a rename | Tampering (of game-state integrity, not a security boundary per se) | The tokenizer-based migration touches ONLY bare-identifier tokens, never operators/keywords/structure — a diff review pass (already recommended for correctness) doubles as this check; no separate security-specific tooling needed |

## Sources

### Primary (HIGH confidence)
- Direct reads of `.planning/phases/10-app-state-de-globalization/10-CONTEXT.md`, `.planning/ROADMAP.md` §Phase 10, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `.planning/phases/09-networking-layer-watcher-cleanup/09-VERIFICATION.md`, `docs/MODULES.md`, `src/main.js`, `scripts/engine_contract_check.js`, `scripts/net_contract_check.js`, `package.json` — all read in full this session
- Direct greps/counts against `index.html` (lines 1–4670) for every one of the 53 candidate app-state names, their declaration sites, write sites, and a machine-verified false-positive collision (`$("game")` vs. the `game` identifier) — this session, 2026-07-24

### Secondary (MEDIUM confidence)
- [let - JavaScript - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) — top-level `let`/`const` in a classic script does not become a `globalThis`/`window` property
- [import - JavaScript - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) — ES module imports are live bindings, reassignable only by the exporting module, and only reachable via `import`, which classic scripts cannot use

### Tertiary (LOW confidence)
- None used for factual claims in this document — all architectural recommendations are derived directly from the codebase evidence above, not from unverified web content.

## Metadata

**Confidence breakdown:**
- Standard stack: N/A (no new libraries) — HIGH confidence there is nothing to add, by direct inspection of `package.json`
- Architecture (the shared-object-reference mechanism): HIGH — grounded in two cited MDN language facts plus direct confirmation that the classic script is a single, unbroken `<script>` block (`index.html:859`–`:4667`) with no internal module boundary
- Pitfalls (the string-literal collision risk): HIGH — not inferred, empirically demonstrated against the live file with a working regex test showing both a caught case (`$("game")`) and a case a naive guard still misses (the badge byline string)
- Write-site completeness for ~20 lower-complexity names: MEDIUM — flagged explicitly in the Assumptions Log and Open Questions; requires a 10-minute re-grep before planning finalizes the task list

**Research date:** 2026-07-24
**Valid until:** No external dependency to go stale; this research is valid until `index.html`'s classic-script content changes again (i.e., effectively until Phase 10 itself executes and the line numbers/counts cited here become historical). Treat line numbers as accurate as of this commit only.
