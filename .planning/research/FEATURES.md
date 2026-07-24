# Feature Research

**Domain:** Zero-build native-ES-module refactor of a vanilla-JS browser game (Pastry Pirates monolith split)
**Researched:** 2026-07-24
**Confidence:** MEDIUM (codebase grounding is HIGH — direct reads of `index.html`, test scripts, and prior `/gsd-map-codebase` output; general ES-module/game-architecture pattern claims are web-sourced and LOW/uncross-checked individually, but align with long-standing, widely-repeated software-engineering consensus)

> Note on "features" here: this is a refactor milestone, not new gameplay. "Feature" in this document means a **decomposition work item / structural capability** the split must deliver — a module boundary, a cleanup, or a verification capability — not a player-facing feature.

## Feature Landscape

### Table Stakes (Users Expect These)

For a refactor, "users" = the codebase's future maintainers (Wyatt, Claude Code sessions) and the players who must see zero behavior change. Missing these = the split isn't actually done, or it broke something.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| `constants.js` + `utils.js` (leaf module) | Every other module needs `ING_ALL`, `DIRS`, `DIRNAME`, `OPPOSITE`, `PERP`, `STORM_DIAG`, asset-path constants, `EMOJI_IMG`/`BOAT_IMG`/`ISLAND_SHAPE_IMG`, and pure helpers `man()`, `shuffle()`, `mulberry32()`, `cnt()`, `pct()`. Also the thing a Node test harness needs importable without touching the DOM. | LOW | Zero-risk extraction — pure data and pure functions, no state, no side effects. Do this first. |
| `engine.js` (pure Game/rules module) | Core value: "the deterministic engine + replay must remain intact." Everything else (UI, bots, tests) depends on `Game` and `roundCfg()` existing as an importable, DOM-free unit. | HIGH | Biggest single extraction, most risk to determinism. Must contain `Game` class, `roundCfg()`, the 5 bot personality strategies, battle resolution, `ev()` event buffer — and nothing that touches `window`/`document`/Firebase. |
| `ui-renderer.js` (rendering module) | `render()`, `drawBoard()`, modal dialogs, narration (`EVENT_NARRATION`, `describe()`) must move together — they're the most DOM-entangled code and the highest-surface-area extraction. | HIGH | Consumes `Game` instance/events; must not mutate game state, only read it and touch the DOM. |
| `networking.js` (Firebase sync module) | Multiplayer sync (watchers/writers, presence, shot clock, room/lobby, host-refresh replay) has to live somewhere that isn't `index.html`'s script soup, and this milestone explicitly requires `.off()` teardown to be added here. | HIGH | Highest-risk seam alongside `engine.js` — `resumeHostGame`/dlog replay literally re-runs engine decisions, so this module's correctness depends on `engine.js`'s public surface being stable first. |
| `main.js` (thin orchestrator) | Something has to `boot()`, wire event handlers, drive `humanTurn()`/`botTurn()`, and glue engine+UI+networking together. `index.html` should end up as markup + `<script type="module" src="js/main.js">`. | MEDIUM | This is the module that depends on every other module existing — extract it last. |
| Firebase `.off()` watcher teardown | Explicit milestone requirement (fixes real memory leaks / stale-handler bugs documented in `.planning/codebase/CONCERNS.md`). | LOW–MEDIUM | Naturally belongs inside the `networking.js` extraction — pulling every watcher into one module is exactly what makes consistent teardown tractable. |
| De-globalized app state | Explicit milestone requirement: tame the 40+ globals (`game`, `myId`, `room`, `db`, `mySeat`, etc.) behind module exports or an explicit state object instead of implicit `window`/script-scope globals. | MEDIUM | Can be done incrementally per-module (each extraction takes state as params/imports instead of reaching for a global) rather than as one big-bang pass — but `main.js` can't be finished until this is resolved everywhere. |
| Regression test harness updated to import real modules | This *is* the milestone's "harden the deterministic engine/replay module seams + add regression tests" requirement, and it's the direct payoff of extracting `engine.js`. | LOW–MEDIUM | Today's `scripts/real_game_test.js` and `scripts/dlog_replay_test.js` do fragile string-slicing (`html.indexOf("<script>")` … `html.indexOf("function escHtml")`) plus `vm.runInContext()` to fake-extract `Game`/`roundCfg` from `index.html`. Once `engine.js` is a real module, this collapses to `import { Game, roundCfg } from '../js/engine.js'` — strictly *simpler* than today, not harder. |

### Differentiators (Competitive Advantage)

Valuable structural improvements that ride along with the split but aren't strictly required for it to "work." Should be attempted where cheap, but not at the cost of scope discipline.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Firebase watcher registry/manager (single `teardown()` at defined lifecycle points) | Prevents the whole *class* of leak bug from recurring as new watchers get added later, vs. scattered manual `.off()` calls that can be forgotten again. Matches `CONCERNS.md`'s own fix-approach: "track all active watchers in a data structure and call `.off()` when: game ends / player disconnects / reload to new room." | LOW–MEDIUM | Do this if the `networking.js` extraction naturally surfaces a clean spot for it; don't force it if scattered inline `.off()` calls suffice for this milestone. |
| Isolated "pure replay runner" | Turns today's 27-scattered-`if(replaying)return`-guards pattern (`CONCERNS.md` "Replay Mechanism Complexity") into an explicit function: load decision log → run engine headlessly → hand off to live rendering. De-risks the most fragile area in the codebase. | MEDIUM | Directly serves the "harden deterministic engine/replay seams" requirement. Attempt if the `networking.js`/`engine.js` seam work surfaces the opportunity; don't treat as separately mandatory if it balloons scope. |
| Headless-runnable `engine.js` as a real test-infrastructure capability | Once `engine.js` has zero DOM/Firebase deps, both browser `<script type="module">` and Node (`node --input-type=module` or `.mjs`/`"type":"module"`) can `import` the identical file — no bundler, no `vm` hacks, no string-slicing index.html. This is a genuine, durable testability upgrade, not just tidiness. | LOW (once engine.js exists) | This is the single biggest ROI item in the whole milestone — it turns a fragile, brittle test harness into a standard one. |
| Event schema hardening (JSDoc typedefs / factory functions for `ev()`) | Addresses `CONCERNS.md` Anti-Pattern 2 (loosely-typed event objects, `EVENT_NARRATION` silently breaking on typos). | LOW | Nice-to-have; only worth doing if the `ui-renderer.js`/`engine.js` seam work exposes it as cheap. Explicitly not required by PROJECT.md scope. |
| Minimal callback-based render trigger (hand-rolled, not a framework) | Reduces "forgot to call `render()` after a state mutation" bugs (`ARCHITECTURE.md` Anti-Pattern 3) without adopting a reactive framework. | LOW | Keep this genuinely minimal — a short list of callbacks the state-mutation call sites invoke, not a pub/sub library. |

### Anti-Features (Commonly Tempting, Explicitly Wrong For This Milestone)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| Reactive framework (React/Vue/Svelte/Signals) | `CONCERNS.md` itself floats this as a fix-approach for global-state sprawl; feels like the "modern" fix. | PROJECT.md explicitly forbids framework introduction; this milestone's whole premise is a zero-build vanilla split. | Plain app-state object/module + explicit `render()` calls after state mutation — still a real improvement over today, no framework tax. |
| Bundler/build toolchain (Vite, esbuild, webpack, Rollup) | Makes aggressive micro-splitting and tree-shaking easy; "everyone" bundles modern JS. | Explicitly out of scope — PROJECT.md states "no build step" as a core principle for this refactor. | Native ES modules loaded via `<script type="module">`; browser resolves imports directly, no build artifact. |
| TypeScript migration | Would fix the loosely-typed event-object problem structurally. | Explicitly out of scope per PROJECT.md ("no build step" implies no compiler either). | JSDoc type annotations on event shapes if typing is wanted — zero-build, optional, low-cost. |
| Over-splitting into dozens of micro-modules (per-method files, per-panel render files, per-watcher files) | Feels like "more modular = better"; web research shows no measurable perf hit below ~100 modules, which can be misread as "so split freely." | For a ~5,600-line codebase, dozens of micro-modules fragments the file count far past the actual seams in the code and creates a maintenance burden disproportionate to any benefit; the real coupling in this game is 4–6 layers deep (constants/utils, engine, UI, networking, app-state, main), not dozens. | 4–6 modules matching the real architectural seams already documented in `.planning/codebase/ARCHITECTURE.md`'s own fix-approach (`game-engine.js`, `ui-renderer.js`, `networking.js`, `main.js`, plus a constants/utils leaf and an app-state module). |
| Renaming/"cleaning up" internals during the split | Tempting to fix short cryptic names (`p`, `q`, `d`) or inconsistent patterns while code is already being moved. | Scope creep — multiplies the diff size and the risk of introducing a behavior change in a milestone whose core value is "don't break determinism." CLAUDE.md's documented naming conventions are intentional style, not debt. | Treat the split as a structural cut/paste + export/import move only. Naming/style cleanup is a separate, later decision. |
| Host-election / multi-host failover for multiplayer | `CONCERNS.md` flags single-host-as-single-point-of-failure as a real scaling limit; tempting to "fix while we're touching networking.js." | Unrelated feature work, not a structural extraction; adds real design and testing surface to a milestone that's supposed to preserve today's behavior exactly. | Defer to a future milestone; `networking.js` extraction should preserve today's host-authoritative model byte-for-byte. |
| Firebase RTDB → Firestore migration | `CONCERNS.md` flags RTDB as a dependency risk; tempting to bundle since `networking.js` is already being touched. | An unrelated infrastructure migration bundled into a refactor whose core value is "don't break multiplayer" multiplies risk for no in-milestone payoff. | Track separately; out of scope here. |
| Rewriting battle mechanics or bot AI "while we're in there" | Code is already being read closely during extraction; tempting to also fix small imbalances noticed along the way. | Explicitly forbidden — PROJECT.md requires "no change to the algorithm" for the deterministic engine. Any behavior change invalidates the replay-parity verification this milestone depends on. | Pure move only, verified byte-for-byte equivalent via the regression/replay test harness. |
| General-purpose event-bus / pub-sub abstraction | Feels like the "proper" decoupling pattern for engine→UI communication. | Over-engineered for a single-host-authoritative game with essentially one render() consumer of engine events; a full pub-sub layer adds indirection with no consumer that needs it. | A plain function call or a short callback list is sufficient — matches `ARCHITECTURE.md`'s own fix-approach framing ("consider a minimal reactive system, even hand-rolled"). |
| ECS (Entity-Component-System) rewrite | Common pattern in "real" game-engine literature for scaling to many entity types. | This is a 2–4 player board game with a handful of entity types (players, islands, ships) — ECS solves a scaling problem this game doesn't have. | Keep the existing `Game`-class-as-state-machine model; just move it into its own module. |

## Feature Dependencies

```
[constants.js + utils.js]  (leaf: no deps)
    └──required-by──> [engine.js]  (Game class, roundCfg, bot strategies)
                          ├──required-by──> [ui-renderer.js]  (reads Game instance/events; EVENT_NARRATION
                          │                                     depends on stable event shapes from engine.js)
                          ├──required-by──> [networking.js]  (dlog replay re-runs engine decisions)
                          └──required-by──> [regression test harness update]  (imports engine.js natively,
                                              retiring the vm/string-slice extraction hack)

[app-state module]  (de-globalization — can proceed incrementally, per-module)
    ├──enhances──> [engine.js]/[ui-renderer.js]/[networking.js]  (each takes state via params/imports
    │                instead of reaching for window globals, as it's extracted)
    └──required-by──> [main.js]  (orchestration can't finish wiring until globals are resolved)

[Firebase watcher registry/teardown]
    └──lives-inside──> [networking.js]  (can't exist before networking.js is a module boundary)

[replay/determinism seam hardening]
    ├──depends-on──> [engine.js]  (needs Game/roundCfg as a stable importable unit)
    └──depends-on──> [networking.js]  (dlog replay currently lives in the multiplayer/Firebase section)

[ui-renderer.js] + [networking.js] + [app-state module]
    └──required-by──> [main.js]  (orchestrator needs all consumer-side modules before it can wire boot()/
                                    turn-flow/event-handling)

[main.js]  (index.html reduced to markup + <script type="module" src="js/main.js">)
    └──depends-on──> ALL of the above
```

### Dependency Notes

- **`engine.js` requires `constants.js`+`utils.js`:** `Game` class methods use `ING_ALL`, `DIRS`, `man()`, `mulberry32()`, `shuffle()` throughout — these must be import-ready before `Game` can be lifted out. Extract this pair first; it's also the lowest-risk step, good for validating the module-loading mechanics (`<script type="module">`, relative import paths, MIME/CORS-under-`file://` behavior) before touching anything stateful.
- **`ui-renderer.js` requires `engine.js`:** `render()`/`drawBoard()` read `Game` instance properties (`players`, `islands`, `events`) and `EVENT_NARRATION` depends on exact event shapes the engine produces. Extracting UI before the engine's public surface is stable risks having to re-touch UI code twice.
- **`networking.js` requires `engine.js`:** `resumeHostGame`/dlog replay literally re-runs the engine's decision log to rebuild state — this is the highest-risk seam (`CONCERNS.md` "Replay Mechanism Complexity") and should not be extracted until `engine.js`'s public surface (`Game`, `roundCfg`, and whatever decision-application entry point replay uses) is settled and passing regression tests.
- **App-state de-globalization enhances (does not block) engine/UI/networking extraction:** it can happen incrementally, module by module, rather than as one big-bang pass — but `main.js`, which wires everything together, cannot be finished until the globals are fully resolved, since it's the last consumer standing.
- **Regression test harness update requires `engine.js`:** today's harnesses fake-extract `Game`/`roundCfg` via string-slicing + `vm.runInContext`. This is a strict downstream consequence of the engine extraction — do it immediately after `engine.js` lands, both to validate the extraction and because it's dramatically cheaper once the module exists than as separate parallel work.
- **Firebase watcher teardown has no conflicts** but is naturally sequenced inside the `networking.js` extraction — pulling every watcher function into one module is exactly what makes consistent `.off()` coverage (and, as a differentiator, a registry) tractable.

## MVP Definition

### Launch With (v1.1 — must-have)

- [ ] `constants.js` + `utils.js` — pure leaf module; zero risk, unblocks everything else
- [ ] `engine.js` — `Game` class, `roundCfg`, bot strategies as a DOM-free ES module; highest-value, highest-risk extraction, and the one the "no algorithm change" constraint bears on most directly
- [ ] Updated `scripts/real_game_test.js` / `scripts/dlog_replay_test.js` importing `engine.js` natively (retiring the `vm`/string-slice extraction) — this *is* the milestone's explicit "harden the deterministic engine/replay module seams + add regression tests" deliverable, and it's cheap once `engine.js` exists
- [ ] `ui-renderer.js` — render/drawBoard/modals/narration as a module consuming `engine.js` exports
- [ ] `networking.js` — Firebase watchers/writers/replay, with `.off()` teardown added (folds in the explicit cleanup requirement)
- [ ] App-state de-globalization — collapse the 40+ globals behind module exports or a single state object
- [ ] `main.js` — thin orchestrator; `index.html` reduced to markup + one `<script type="module">` entry point
- [ ] Claude-driven Chrome-MCP end-to-end gameplay tests (solo + multiplayer) and manual Safari/multiplayer playtests confirming parity post-split — explicit milestone verification requirement, and the only way to validate the "core value" (storm doesn't crash Safari, pause doesn't destroy MP state) survived the split

### Add After Validation (only if time allows within v1.1)

- [ ] Firebase watcher registry abstraction (vs. inline `.off()` calls scattered through `networking.js`) — add if scattered manual calls prove error-prone or hard to keep consistent during implementation
- [ ] Isolated pure "replay runner" function (per `CONCERNS.md`'s own fix-approach) — pursue if the replay seam surfaces bugs during extraction; worth hardening properly rather than patching around it in place
- [ ] JSDoc typedefs for event objects — add if `EVENT_NARRATION` breakage during the split shows the loosely-typed event shape is actively causing bugs, not preemptively

### Future Consideration (explicitly deferred, not this milestone)

- [ ] Host-election / multi-host failover — separate multiplayer-robustness feature, not a structural extraction
- [ ] Firestore migration — separate infrastructure decision, unrelated to the module split
- [ ] Spectator mode, game-replay viewer, bot-difficulty tuning (all listed in `CONCERNS.md` "Missing Critical Features") — net-new gameplay features, explicitly out of scope per PROJECT.md
- [ ] Bundler/build step, TypeScript — deferred indefinitely per PROJECT.md's stated "no build step" / "no framework" constraints; would need an explicit constraint change to reconsider

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| `constants.js` + `utils.js` extraction | LOW (invisible to players) | LOW | P1 |
| `engine.js` extraction (pure, DOM-free) | HIGH (unblocks everything; enables real headless testing) | HIGH | P1 |
| Regression harness native-import update | HIGH (closes the "did the split actually preserve behavior" verification gap) | LOW (once engine.js exists) | P1 |
| `ui-renderer.js` extraction | MEDIUM (invisible if done right; regression risk if not) | HIGH | P1 |
| `networking.js` extraction + `.off()` teardown | HIGH (fixes real memory-leak/stale-handler bugs) | HIGH | P1 |
| App-state de-globalization | MEDIUM (invisible to players; high value to future maintainers) | MEDIUM | P1 |
| `main.js` orchestration + thin `index.html` | MEDIUM (closes out the split) | MEDIUM | P1 |
| Chrome-MCP E2E + Safari/MP manual playtests | HIGH (only real verification of the core value) | MEDIUM | P1 |
| Watcher registry abstraction | LOW (incremental robustness) | LOW–MEDIUM | P2 |
| Pure replay-runner isolation | MEDIUM (de-risks the most fragile area in the codebase) | MEDIUM | P2 |
| Event schema / JSDoc typing | LOW | LOW | P3 |
| Host-election, Firestore migration, new gameplay features | N/A (out of scope) | N/A | — |

## Competitor Feature Analysis

Not a market-facing feature set — this is an internal refactor. The relevant comparison is alternative decomposition strategies for the same monolith:

| Approach | How it splits the game | Our approach |
|---------|--------------|--------------|
| Comment-only "logical" split (keep everything in `index.html`, add `// ===` section markers) | Roughly today's state — sections exist but nothing is actually importable/testable independently | Rejected — doesn't fix testability, global leakage, or the `vm`-extraction hack in `real_game_test.js`; PROJECT.md explicitly calls for real module extraction |
| Bundler-based split (Vite/esbuild, many small files, tree-shaken bundle) | Common in modern JS games; a bundler absorbs the request-count cost of aggressive micro-splitting | Rejected — violates the explicit "no build step" constraint; 4–6 well-bounded native-ESM modules achieve the same maintainability win without the tooling |
| ECS (Entity-Component-System) rewrite | Common in game-engine literature for scaling to many entity types (found in web research: Chickensoft, GameDev.net) | Rejected — this is a 2–4 player board game with a handful of entity types; ECS solves a scaling problem this game doesn't have. Matches the "don't abstract prematurely" guidance |
| Pure-simulation-plus-swappable-renderer (industry pattern confirmed via web research) | Server/client-shareable simulation core, decoupled from rendering, enabling headless execution | **Adopted in spirit** — `engine.js` as a DOM-free pure module mirrors this pattern exactly, and it's what unlocks trivial Node-native testing (the biggest concrete win of this whole milestone) |

## Sources

- Direct codebase inspection (this session): `index.html` (5,639 lines), `scripts/real_game_test.js`, `scripts/dlog_replay_test.js`, `scripts/battle_sim.js` — HIGH confidence, first-party, read directly
- `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONCERNS.md`, `.planning/codebase/TESTING.md` (prior `/gsd-map-codebase` output, 2026-07-22) — HIGH confidence, curated first-party source; this document's decomposition recommendation matches and extends the split already proposed in `ARCHITECTURE.md`'s "Anti-Pattern 1" fix-approach
- `.planning/PROJECT.md` — HIGH confidence, first-party constraints/scope source
- Web search (LOW confidence per source-hierarchy classification, individually uncross-checked, but consistent with long-standing, widely-repeated software-engineering consensus): native-ES-modules-without-build-step patterns — [Back to the Future With ES Modules](https://betterprogramming.pub/back-to-the-future-with-es-modules-js-without-build-ee2c207a4439), [Using Native JavaScript Modules in Production Today](https://philipwalton.com/articles/using-native-javascript-modules-in-production-today/), [MDN: JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- Web search (LOW confidence): pure-simulation-vs-rendering separation pattern — [Web Browser + Game Engine](https://fynv.github.io/WebBrowserPlusGameEngine.html), [Enjoyable Game Architecture (Chickensoft)](https://chickensoft.games/blog/game-architecture), [Devlog #2: game engine architecture](https://domwillia.ms/devlog2/)

---
*Feature research for: zero-build native-ES-module refactor of the Pastry Pirates monolith*
*Researched: 2026-07-24*
