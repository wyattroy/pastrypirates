# Pitfalls Research

**Domain:** Zero-build ES-module split of a monolithic browser game with a deterministic, seeded, replay-based multiplayer engine (Pastry Pirates `index.html`, ~5,227 lines, Firebase RTDB compat SDK)
**Researched:** 2026-07-24
**Confidence:** HIGH (grounded in direct inspection of this repo's source — line numbers cited throughout) with MEDIUM-confidence platform-behavior claims (ES module timing, CORS, Firebase `.off()`, circular-import TDZ) cross-checked against MDN and multiple independent web sources.

This file exists because this refactor has three ways to fail silently: break byte-for-byte determinism (replay/lockstep), break Firebase multiplayer, or regress Safari. All three are "looks fine in dev, breaks for one specific user/browser/session" failure modes — the worst kind to catch late. Every pitfall below is either observed directly in this codebase or is a well-documented platform behavior that intersects it.

## Critical Pitfalls

### Pitfall 1: Reordering `Object.keys()`/`Object.values()` iteration silently desyncs the RNG call sequence

**What goes wrong:**
The engine iterates `DIRS = {N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}` via `Object.keys(DIRS)` and `Object.values(DIRS)` in at least 10 places inside the deterministic engine (`index.html:1092,1154,1179,1191,1199,1231,1336,1360,1372,1388,1517,1543-1544,1642,4168-4169`), and some of those loops conditionally call `this.r()` (the seeded RNG) based on which direction is examined first. `DIRS`, `PERP`, `OPPOSITE`, `STORM_DIAG` are all object literals whose string-key insertion order (`N,S,E,W`) is guaranteed by the JS spec — but only as long as that literal is never reconstructed, spread into a new object, merged with `Object.assign`, or "tidied" into alphabetical order during the split. Moving these constants into a shared `constants.js` module is exactly the kind of low-risk-looking code motion where someone reformats the object and silently changes iteration order. If iteration order changes even in one direction-processing loop, every subsequent `this.r()` call in that turn consumes the RNG stream in a different sequence — the local player's screen and any remote/replay screen diverge from that point forward, with no error thrown.

**Why it happens:**
Object key order preservation is a subtle JS guarantee that most engineers don't think of as "load-bearing." During a mechanical split (copy constants into a new file, maybe alphabetize for readability, maybe run through a formatter/linter that reorders object properties), this order can change without anyone noticing — there's no lint rule or type system to catch it, and the game still "looks like it plays" because the desync only diverges downstream RNG draws, not gross logic.

**How to avoid:**
- Treat `DIRS`, `PERP`, `OPPOSITE`, `STORM_DIAG`, `ING_ALL`, and any other object/array whose iteration order feeds a loop that calls `this.r()` (directly or via a function that does) as **RNG-order-critical constants**. Move them verbatim, byte-for-byte, with an explicit code comment: `// ORDER IS LOAD-BEARING — iteration order feeds RNG call sequence, do not reformat`.
- Never run an auto-formatter/object-property-sorter over files containing these constants.
- After the engine module extraction, run the existing `real_game_test.js` (2000+ games) with a **fixed seed set** and diff `game.events` arrays (or a hash of `randCalls` count + final state) against a pre-refactor baseline captured from `main`. Byte-for-byte event log equality across N seeded games is the acceptance bar, not "the game seems to work."
- Grep for `Object.keys(`, `Object.values(`, `for(let`/`for (const` `... in ...`, `new Set(`, `new Map(` inside the engine region during the split and manually verify each one still iterates the same order after code motion (Sets/Maps preserve insertion order by spec too, but re-derivation from a differently-ordered source array changes it).

**Warning signs:**
- Any diff in `real_game_test.js` output between pre- and post-split runs at the same seed.
- `game.randCalls` counter (already exists at `index.html:1250`) differing between two runs of the identical seed/config before vs. after the split — this is a cheap, fast canary to add to the harness now, before the split even starts.
- Multiplayer replay (host refresh / dlog replay) landing in a different board/hand state than the pre-refresh live game.

**Phase to address:**
Engine-extraction phase (the phase that physically moves the `Game` class and its constants out of the inline script into a module). This should be gated on a byte-for-byte replay-equality regression test that runs *before* the split is considered done, not just "engine still compiles."

---

### Pitfall 2: `type="module"` scripts execute deferred — re-ordering initialization relative to the Firebase compat SDK and asset preload

**What goes wrong:**
Today, the whole engine/UI/networking script is one classic inline `<script>` block (`index.html:859` onward) that runs synchronously, in document order, immediately after the two Firebase compat `<script src>` tags (`index.html:25-26`) have already executed and installed the global `firebase` object. Everything — constant definitions, `preloadAssets()`, `boot()` — currently runs in a single deterministic pass with no scheduling gaps.

Native ES modules (`<script type="module">`) are **always deferred**, regardless of `async`/`defer` attributes: they download without blocking the parser and execute after the HTML has finished parsing, but they execute in the order the module graph resolves, not necessarily in document order relative to classic scripts, and definitely not synchronously "right after" whatever classic script precedes them. If the split introduces `<script type="module" src="app.js">` while leaving the two Firebase CDN `<script>` tags as classic scripts, the module code (which reads `firebase.initializeApp`, `firebase.database()` at `index.html:4919`) is not guaranteed to run in the same relative position as before — and any code that assumes synchronous, same-tick availability of `firebase` right after the classic tags will now race against module fetch/parse time. On a slow connection (or with an aggressive service worker / cache-busting setup later), the module could theoretically execute before the CDN scripts have installed `window.firebase`, throwing `firebase is not defined`. This is also true for `preloadAssets()` (`index.html:5166-5180`) and `boot()` (`index.html:5181`) — anything that used to run "at the bottom of the one big script, after everything above it" now runs after the module graph is fully fetched and evaluated top-to-bottom, which is a different scheduling regime, especially once the engine/UI/net code lives in 3+ separate module files with their own `import` graphs.

**Why it happens:**
"Just add `type="module"` and split the script tags" looks like a mechanical, behavior-preserving change. It is not — it changes the script's position in the browser's loading/execution pipeline from synchronous-parser-blocking to deferred-after-parse, and changes single-file top-to-bottom execution into module-graph-resolution-order execution.

**How to avoid:**
- Keep the two Firebase compat CDN `<script>` tags as plain classic scripts (they are, and should stay, non-module — Firebase compat SDK is not published as ESM and attaches to `window.firebase`). Do not convert them to modules.
- Because module scripts execute after full HTML parse (i.e., always after the classic Firebase tags, which appear earlier in `<head>`/before `<body>` content and execute immediately), the ordering is actually safe in this specific case *as long as* the Firebase `<script>` tags stay above the module entry point and stay classic/synchronous. Verify this explicitly rather than assuming it — add a `console.assert(typeof firebase !== 'undefined')` as the very first line of the module entry point during the transition, and check it fires without warning in both Chrome and Safari.
- Do not use inline module scripts with dynamic ordering tricks (multiple `<script type="module">` blocks relying on execution order between them for setup) — prefer one entry-point module that `import`s everything else, so module graph resolution order is explicit and controlled by `import` statements, not by tag position.
- If any code needs to run *before* the module graph starts (e.g., a synchronous polyfill check, or a "no ES modules support" fallback banner), it must be a **classic script placed before the module tag** — module execution timing cannot be used for that purpose.
- Re-verify `preloadAssets()`/`boot()` ordering explicitly: confirm boot() still runs only after preload completes (this was presumably an in-order call in the old script; if it becomes two separate module-level `await` chains, confirm the dependency is expressed via explicit `await` / promise chaining, not implicit script order).

**Warning signs:**
- Intermittent (not 100% reproducible) `firebase is not defined` or `Cannot read properties of undefined (reading 'initializeApp')` errors, especially on slow network throttling in DevTools.
- Board/UI flashing an unstyled or unpopulated state briefly before assets appear — a sign preload/boot ordering shifted.
- Works in Chrome (fast module fetch, warm cache) but intermittently fails in Safari on first load / cold cache (slower module fetch pipeline).

**Phase to address:**
The very first structural-split phase (before any code is moved), as part of establishing the module entry point and script tag layout. This needs a written contract ("Firebase CDN tags stay classic + first; app has exactly one `type=module` entry point; nothing depends on inline-script-position ordering") that later phases don't violate.

---

### Pitfall 3: De-globalization breaks inline HTML `onclick` handlers and any code that still expects `window.game`/`room`/`db`/`myId`

**What goes wrong:**
`index.html` has 41 inline `onclick="..."` attributes (confirmed via grep) plus global `let db=null, myId=null, room=null, mySeat=null, isHost=false, roster=null;` (`index.html:4872`) and `let game=null, evIdx=0, timer=null, logLines=[];` (`index.html:1813`). Inline `onclick="revealMyRecipe()"` (and 40 others) resolve their function names against the **global scope** (`window`) at click time — that's how inline event handler attributes have always worked. Top-level `function` declarations and `var`s in a classic script attach to `window`; top-level bindings inside an ES module do **not** — `const`/`let`/`function` declared in a module are module-scoped, not global, even though they look identical to the old code. The moment `revealMyRecipe`, `game`, `room`, `db`, `myId` etc. move into a module without an explicit `window.x = x` (or `window.fnName = fnName`) export, every inline `onclick` in the existing HTML markup breaks with `ReferenceError: revealMyRecipe is not defined`, and any leftover code (including debugging code, browser extensions, or the Chrome MCP test harness) that reads `window.game`/`window.room` to inspect state gets `undefined`.

This is the single highest-blast-radius mechanical hazard in the whole refactor, because it's invisible until click-time — nothing errors at load, only when a user clicks a button wired to a now-undefined global.

**Why it happens:**
"Tame the 40+ globals behind module exports" (an explicit v1.1 goal) is philosophically the right move, but the HTML markup wasn't written with modules in mind — it uses the oldest, simplest DOM API (inline `onclick=` attribes), which is fundamentally global-scope-coupled. De-globalizing the JS without also touching the HTML (or providing a compatibility shim) breaks the contract the markup depends on.

**How to avoid:**
- Before removing any global, `grep -o 'onclick="[^"]*"' index.html` (and same for `onchange=`, `oninput=`, any other inline handler attribute) to get the complete list of function names the markup calls directly. Treat this list as a required "public API surface" that must stay reachable from global scope, or must be migrated off inline handlers in the same phase.
- Prefer migrating inline `onclick=` to `addEventListener` calls wired up from the module (attach listeners in a DOM-ready function using `document.getElementById(...).addEventListener(...)`) — this is the clean, idiomatic fix and removes the global-scope dependency entirely, rather than working around it.
- If full `addEventListener` migration doesn't fit in this phase's scope, the acceptable interim shim is an explicit, narrow bridge object: `window.PP = { revealMyRecipe, ...other-41-handlers }` and rewrite `onclick="revealMyRecipe()"` → `onclick="PP.revealMyRecipe()"`. This keeps the global surface small and *auditable* (one object, one place) rather than 40+ ad-hoc `window.x=x` lines scattered through the module.
- For `game`/`room`/`db`/`myId`/`mySeat`/`isHost` specifically: since these are read from many places (event handlers, Firebase callbacks, render functions, and potentially the Chrome MCP test harness per the v1.1 verification plan), decide explicitly whether they live behind a single exported app-state object (`export const state = {...}`, imported wherever needed) or are intentionally still exposed on `window` for debugging/test-harness access (`window.__pp_debug = state` is a reasonable non-production-facing compromise). Do not leave this ambiguous — pick one pattern before the de-globalization phase starts, document it, and apply it uniformly.
- Firebase callbacks specifically (`.on('value', cb)`) close over whatever scope they're defined in — if they're defined inside a module and reference `game`/`room` via module-scoped imports, that's fine and preferable; the danger is only if some callbacks are migrated to modules while others (or inline HTML) still expect the old globals.

**Warning signs:**
- Any click that used to work silently doing nothing, with a console `ReferenceError` (only visible if DevTools is open — this can ship unnoticed in production since inline handler errors don't crash the page, they just no-op).
- The Chrome MCP end-to-end test harness (planned for v1.1 verification) failing to find/read `window.game` if that's how it currently inspects state.
- QA finding "buttons stopped working" only in manual click-through, not in the Node engine harness (since the Node harness never touches DOM/`onclick` at all — this class of bug is invisible to it).

**Phase to address:**
De-globalization phase. This phase's Definition-of-Done must explicitly include "every inline `onclick`/`onchange`/`oninput` handler in `index.html` was audited and still resolves" — not just "globals moved to state object." Recommend doing the `onclick=` grep as a checklist artifact for that phase's plan.

---

### Pitfall 4: Module scripts require `mode: "cors"` fetches — `file://` breaks entirely, and local dev needs a real HTTP server

**What goes wrong:**
Classic `<script src>` tags fetch same-origin/local files without a CORS check. `<script type="module">` and any `import`/`import()` inside it are fetched in **CORS mode by default** — even for files sitting right next to each other in the same folder. Opening `index.html` directly from disk (`file://...`) gives every file a **null origin**, and null-origin CORS requests are blocked by browsers' Same-Origin Policy for module fetches, even though the exact same files loaded fine as classic `<script src>` tags under `file://`. The project's own compatibility notes state `file://` "works for game but may show warnings on Firebase Auth calls" — that tolerance disappears once the engine/UI/net code becomes `import`ed modules: `file://` module loading will hard-fail with a CORS/blocked-fetch error in the console and a blank page, in every browser, not just Safari.

**Why it happens:**
Nobody expects a *local development convenience* (double-click `index.html`, or `open index.html`) to stop working because of a security policy that's normally associated with cross-domain API calls. The mental model "modules are just scripts with import/export" hides that the module loader's networking layer is fundamentally different from the classic script loader's.

**How to avoid:**
- Explicitly require a static HTTP server for all local development and testing going forward (e.g., `python3 -m http.server`, `npx serve`, or any equivalent zero-build static server — no bundler needed, just an HTTP server). Document this prominently (README/CLAUDE.md) as a hard requirement introduced by this refactor, since it's a workflow change for Wyatt and anyone else who currently might double-click the file.
- Verify GitHub Pages / Netlify / the production static host serves `.js` files with `Content-Type: text/javascript` or `application/javascript` (not `text/plain` or `application/octet-stream`) — module scripts are also rejected if the MIME type is wrong, independent of the CORS issue. Confirm this for the actual hosting target (`wyattroy.github.io`, `playpastrypirates.com`) before considering the split "shipped," since a misconfigured static host can silently 200-OK a `.js` file with the wrong `Content-Type` header and the browser will refuse to execute it as a module with a console error, not a network error.
- Add a fast local-smoke-test step to whatever verification checklist this milestone produces: "load the game via `http://localhost:PORT`, not `file://`" as an explicit, named precondition — this should be called out in the phase's verification section, not assumed.

**Warning signs:**
- Blank page + console error mentioning "CORS", "Cross-Origin Request Blocked", or "strict MIME type checking" the moment anyone opens `index.html` via `file://` after the split (this will happen immediately to the first person who tries the old double-click workflow).
- Works when served via `python -m http.server` locally but fails on the production static host — check `Content-Type` headers via `curl -I` against the deployed `.js` files.

**Phase to address:**
The very first structural-split phase (same one that establishes the module entry point) — this is a go/no-go precondition for the whole approach, not something to discover mid-refactor. Confirm the production static host's MIME behavior for `.js` *before* committing to the module-file layout.

---

### Pitfall 5: Firebase `.off()` cleanup removes zero listeners (or the wrong one) if the callback reference doesn't match what was passed to `.on()`

**What goes wrong:**
Firebase RTDB's `ref.off(eventType, callback)` only detaches a listener if `callback` is the **exact same function reference** that was originally passed to `.on()`. If `.on('value', data => { ... })` was registered with an inline arrow function (a very common and idiomatic pattern, and likely how several of the nine currently-uncleaned watchers in this codebase are written — `index.html:2855, 2919, 2979, 3203, 3711, 4580, 4586, 4960, 4965`), then calling `.off('value', someNewArrowFunction)` later — even one with byte-identical code — does **not** match and silently fails to detach anything. This is exactly the kind of mistake that's easy to introduce *while implementing the very cleanup this milestone wants* (Firebase `.off()` teardown is an explicit v1.1 goal): a developer sees `db.ref(x).on('value', cb)` and, when adding teardown, writes a fresh `db.ref(x).off('value', () => {...})` instead of capturing and reusing the original `cb` reference — appearing to fix the leak while actually leaving the old listener attached, with the added false confidence of "we called `.off()`, so it must be cleaned up."
Also relevant: calling `.on()` multiple times with the same callback (e.g., a guest reconnect re-running setup code without first tearing down) registers that callback multiple times, requiring `.off()` to be called an equal number of times to fully remove it — one `.off()` call after N `.on()` calls with the same callback leaves N-1 firings still active.

**Why it happens:**
Firebase's `.off()` API looks like a generic "stop listening to this path/event" call, but it's actually reference-equality-scoped per callback. This isn't obvious from the API shape, and it's the opposite of how, say, `removeEventListener` mistakes usually get caught (those tend to at least *look* wrong because you're clearly passing a different function).

**How to avoid:**
- Track every registered watcher as a `{ref, eventType, callback}` triple in a single registry (a `Map` or array) at registration time, and always `.off()` using the exact stored callback reference — never re-declare a fresh handler for teardown. This matches the fix approach already identified in `.planning/codebase/CONCERNS.md`: "Track all active watchers in a data structure and call `.off()` when: game ends / player disconnects / reload to new room."
- Prefer the no-callback form when the intent is "remove everything on this ref for this event type": `ref.off('value')` (omitting the callback) removes *all* callbacks for that event type on that ref — appropriate at hard teardown boundaries (leave game, room reset) where "detach everything on this path" is the actual intent, and safer than mismatched-reference partial cleanup.
- Write named, hoisted handler functions instead of inline arrow functions wherever a watcher will need teardown later (`function onRoomValue(snap){...}` then `ref.on('value', onRoomValue)` / `ref.off('value', onRoomValue)`) — this makes the reference-identity requirement visually obvious in the code and prevents the "looks cleaned up but isn't" mistake by construction.
- Since this refactor also moves watcher-registration code into networking module(s), centralize the registry inside that module and expose a single `teardownAllWatchers()` (or per-room `teardownRoom(roomId)`) function that the de-globalization / lifecycle phase calls at every exit point (`endGame`, disconnect, room switch) — do not scatter ad hoc `.off()` calls at each of the 9 call sites independently, since that's how partial/inconsistent cleanup happens.

**Warning signs:**
- Duplicate narration/chat/battle-update events firing after a guest reconnects (a symptom already flagged in `CONCERNS.md` as "Duplicate Watchers After Rejoin").
- Firebase read-quota usage not dropping after implementing `.off()` cleanup (a sign the listeners weren't actually detached).
- Console logging (temporarily add it) inside watcher callbacks firing after a `.off()` call was supposed to have silenced them.

**Phase to address:**
The Firebase `.off()` cleanup phase — but the *verification* for this phase must be behavioral (reconnect a guest N times and confirm event count doesn't multiply, or log `Object.keys(firebase.database().INTERNAL...)` / manually instrument callback fire-counts), not just "code review shows `.off()` calls exist." A code review alone cannot distinguish a correct teardown from a mismatched-reference no-op.

---

### Pitfall 6: The Node test harnesses (`real_game_test.js`, `dlog_replay_test.js`) extract engine code by string-searching the inline `<script>` block — they break completely, silently-if-unlucky, the moment engine code leaves `index.html`

**What goes wrong:**
Both existing headless test harnesses work by reading `index.html` as a string and slicing out the engine region between literal markers: `html.indexOf("<script>")` to `html.indexOf("function escHtml")` for `real_game_test.js` (and the same boundary plus a second sentinel-comment-delimited region for `replayShortfall` in `dlog_replay_test.js`), then running that slice in a Node `vm` context. This is explicitly documented in the file's own header comment as intentional — "runs the REAL `Game` class straight out of index.html, unmodified... not a port, not a rewrite" — specifically so the test exercises the exact browser source, not a hand-maintained copy. The moment the `Game` class (and `roundCfg`, and the `replayShortfall` sentinel function) move into external `.js` module files referenced via `<script type="module" src="...">`, **both markers vanish from `index.html`** — there is no more inline `<script>` block containing the engine, and no `function escHtml` text inside it either. `scriptStart`/`scriptEnd` will resolve to `-1` or nonsensical offsets, and the harness's own explicit guard (`if (scriptStart < 8 || scriptEnd === -1) throw new Error(...)`) is *designed* to catch this loudly — which is good — but that only helps if someone actually runs the harness during the split. If the split phase doesn't run these two scripts as part of its own verification, this breakage is discovered later, disconnected from the change that caused it, and in the interim the project has **zero automated coverage** of engine correctness or replay-shortfall detection — exactly the two things this refactor is riskiest for.

**Why it happens:**
The harnesses were deliberately built to avoid maintaining a parallel copy of the engine (a reasonable design under the old monolith) by parsing the real source out of the HTML file at test time. That design's implicit assumption — "the engine always lives inline inside one `<script>` tag in `index.html`" — is precisely the thing this milestone is removing.

**How to avoid:**
- Treat harness migration as a first-class deliverable of the engine-extraction phase, not an afterthought. Once the engine lives in its own module file(s) (e.g., `js/engine.js`), rewrite both harnesses to `import` (or `require`, since Node can `require`-load `.mjs`/use dynamic `import()`) the module directly instead of string-slicing HTML — this is strictly simpler and more robust than the current approach once modules exist, and removes the fragile sentinel-comment/marker-string coupling entirely.
- Node can run ES modules natively (`.mjs` extension, or `"type": "module"` in a `package.json`, or dynamic `import()` from CJS) — no bundler needed, consistent with the "no build step" constraint. If the engine module has any browser-only assumptions (DOM references, `document.body.innerHTML` writes referenced in the current stub setup, `window` reads), those need to be identified and either guarded (`typeof document !== 'undefined'`) or the DOM-touching boot code needs to be excluded from what the harness imports — mirroring what the current sandbox/stub setup already does with `document: { documentElement: {...}, body: {...} }`.
- Run both harnesses (with fixed seeds) *before and after* each incremental step of the engine extraction, not just once at the end — this converts them from a final gate into a continuous tripwire during the riskiest phase.
- Do not delete or silence the harnesses' extraction-boundary guard errors when they start firing during the split — that guard firing is the correct, intended signal that the split has begun; treat it as the trigger to migrate the harness's extraction mechanism, in the same commit/PR as the code move that triggered it, not as noise to suppress.

**Warning signs:**
- `real_game_test.js`/`dlog_replay_test.js` throwing `"Could not locate the Game-class/roundCfg region in index.html — has the file structure changed?"` — this is the harness working exactly as designed to catch this class of change; do not treat it as a nuisance to route around with a quick regex patch.
- A period where neither harness runs cleanly and nobody notices because CI isn't wired to run them (confirmed: "No CI pipeline configured" per `.planning/codebase/TESTING.md`) — this is a process risk as much as a technical one.

**Phase to address:**
Engine-extraction phase, as a required sub-task with its own explicit checkpoint ("both Node harnesses pass against the new module-based engine, at the same seeds, with matching output to the pre-split baseline"). This should block the phase from being marked done.

---

### Pitfall 7: Circular imports between engine/UI/networking modules produce `ReferenceError: Cannot access 'X' before initialization` — intermittently, only on specific code paths

**What goes wrong:**
ES module imports are **live bindings**, not copies, and modules in a circular dependency cycle are evaluated in post-order (dependencies before dependents) — but if module A imports something from module B, and B (directly or transitively) imports back from A, whichever module's top-level code runs first will have a binding to the other module's exports that is still in the **temporal dead zone** until that other module finishes initializing. Reading an uninitialized top-level `const`/`let`/`class` binding during the cycle throws `ReferenceError: Cannot access 'X' before initialization`. This game's natural module boundaries are prone to exactly this: the `Game` engine class needs to call into narration/event-description helpers (currently colocated as `EVENT_NARRATION` near the UI code, `index.html:2356`), UI rendering (`render()`, `index.html:2470`) needs the `Game` instance's shape and constants, and networking code needs to both read engine state (to broadcast) and mutate it (to apply remote events/replay) — a natural circular pull between "engine" and "networking" modules in particular, since networking both consumes engine output and drives engine input during replay (`replaying` flag referenced in 27 locations per `CONCERNS.md`).
Critically, **circular imports don't always error** — if the cross-reference is only used inside function/method bodies (resolved lazily when the function is *called*, not when the module is first evaluated), the cycle "works itself out" and never throws, because by the time any function actually runs, both modules have finished initializing. This means a circular import can pass initial smoke testing and only throw on a specific, less-common code path (e.g., only during host-refresh replay, which "has fewer users than normal play" per `CONCERNS.md`'s existing note on this exact system) — precisely the kind of edge case this refactor most needs to keep intact.

**Why it happens:**
The original monolith had no import boundaries at all — everything was hoisted/available in one script-global scope, so "the engine class references a UI helper" was never a structural concern, just an ordering-within-one-file concern (and `function` declarations hoist fully, `class`/`const` don't, but within one script all of it eventually became available before any of it ran, since function calls happen after full script evaluation via `boot()`). Splitting into modules turns implicit same-file ordering into explicit import-graph dependencies, and the natural first attempt at drawing module boundaries (engine / UI / networking as three files) is very likely to have a real circular need given the intersections named above (this is not a hypothetical — the `replaying` flag and event-broadcast/event-apply cycle is exactly this shape already).

**How to avoid:**
- Before writing any module boundary, map the *actual* dependency directions with the coupling analysis this milestone already calls for ("boundaries locked during planning after mapping real coupling," per `PROJECT.md`). Specifically look for: does `Game` need anything from the narration/UI layer at the top level (module-eval time), or only when a method is called? Does the networking layer need to call back into engine state-mutation methods that also need to notify the networking layer of new events?
- Prefer a strict dependency direction: **engine has zero imports from UI or networking** (pure, self-contained, importable by the Node test harness with no DOM/Firebase dependency at all — this is also the cleanest outcome for Pitfall 6's harness migration). UI and networking both import *from* the engine (types/constants/class), never the reverse. If networking needs to push events *into* the engine (replay) or the engine needs to notify networking of new events (broadcast), do this via **callback injection / dependency injection at construction time** (pass a `notify` function or event-emitter into the `Game` constructor / a dedicated coordinator module) rather than the engine module directly `import`ing the networking module. This is the standard fix pattern for this exact shape of cycle and keeps the engine trivially testable in isolation.
- If a genuine cycle can't be avoided, keep all cross-references inside function bodies (never at module top level / not used to initialize a top-level `const`), and add a comment noting *why* the cycle is safe (it's lazily resolved) — this makes the hazard visible to the next person touching either file instead of an invisible landmine.
- Test explicitly for this: import each module in isolation in a throwaway Node script early in the extraction phase and confirm no `ReferenceError` — do this before wiring the whole app back together, since isolated-module-import failures are much easier to diagnose than "the app breaks only during host-refresh replay."

**Warning signs:**
- `ReferenceError: Cannot access 'X' before initialization` in the console, especially one that only reproduces on refresh, replay, or a specific navigation order — not on first load.
- A module that works when loaded standalone/first but breaks depending on which other module happens to import it first (a classic circular-dependency tell).

**Phase to address:**
Module-boundary-mapping step at the start of the engine-extraction phase — this is a design decision (dependency direction), not a bug to fix after the fact. The "boundaries locked during planning after mapping real coupling" step already planned for this milestone is the right place; this pitfall should be an explicit design checklist item there (specifically: "does any boundary require engine→UI or engine→networking imports at module top level? If yes, redesign with dependency injection before writing code").

---

### Pitfall 8: Hoisting/TDZ differences between "one big script" and "many small modules" break code that relied on forward-references to `function`/`class`/`const` declared later in the file

**What goes wrong:**
Inside the current single script, `function` declarations are fully hoisted (usable before their textual definition, anywhere in the same scope), which is presumably relied on somewhere given the codebase convention of function declarations scattered throughout a 5,200-line file with no particular ordering discipline. `class` and `const`/`let` are hoisted to the top of their scope but left in the temporal dead zone until their declaration line executes — this was already true within the single script, so it's not new, but the risk is different once code is split: a forward reference that "happened to work" in the monolith because by the time any function actually *ran* (post-boot), every top-level declaration in the file had already been evaluated, may now fail if the module that defines the referenced value hasn't been evaluated yet at the point of use — particularly relevant for any *module top-level* (not function-body) code that references something from another module before that module's initialization has completed, which loops back into circular-import TDZ territory (Pitfall 7) but can also occur with straightforward one-directional imports if the importing module tries to use an imported `class`/`const` at its own top level in a way that assumes it's "just available," rather than inside a function called after boot.

**Why it happens:**
In a monolith, "is this defined yet" almost never matters in practice because nothing meaningfully executes until `boot()` runs at the very end, after every top-level declaration (functions, classes, consts) in the file has already been evaluated. Splitting into modules introduces real evaluation-order dependencies between files for the first time, and any code that does real work at module top level (not deferred into a function) is newly exposed to ordering.

**How to avoid:**
- Audit for module-top-level side effects during the split: anything that isn't a `function`/`class` declaration or a simple constant assignment (e.g., `ING_IMG={}`; `ING_ALL.forEach(i=>ING_IMG[i]=...)` at `index.html:872`, or `EMOJIFY_RE=new RegExp(...)` at `index.html:949`) executes *immediately* when its module is evaluated. If any such top-level computation depends on an imported value from another module, confirm that import isn't part of a cycle (Pitfall 7) and doesn't rely on execution order between sibling modules that both do top-level work.
- Prefer moving any nontrivial top-level computation into an explicit `init()`/`setup()` function called from the app's single entry point, in an intentional, documented order — rather than relying on module-graph evaluation order (which is deterministic but not obvious from reading any single file) to get the sequencing right implicitly. This is lower-risk and more debuggable than depending on import-graph-derived ordering.
- Do this audit specifically for the constant-derivation blocks already flagged above (`ING_IMG`, `ING_HOLE_IMG`, `EMOJIFY_RE`, `BOAT_IMG`, `ISLAND_SHAPE_IMG`, `RECIPE_LOOKUP` at `index.html:2096`) since these are exactly the "runs immediately, derives from another constant" pattern that's fine in one file and needs an explicit ordering contract across files.

**Warning signs:**
- `ReferenceError: Cannot access 'X' before initialization` or `undefined` values appearing in derived constants (e.g., an `ING_IMG` lookup returning `undefined` for a key that should exist) immediately at page load, not tied to any specific user action.
- Works after a page reload but not on first load (or vice versa) — a sign of a race in top-level module evaluation order rather than a pure logic bug.

**Phase to address:**
Same engine-extraction / module-boundary-mapping phase as Pitfall 7 — these two should be reviewed together since they're both about evaluation-order assumptions inherited from the monolith.

---

### Pitfall 9: Safari has historically had rougher module-script support than Chrome — module preload, caching, and CORS edge cases need explicit Safari verification, not just "works in Chrome so it's fine"

**What goes wrong:**
This project already has one hard-won lesson that Safari-specific behavior can diverge sharply from Chrome in ways that are invisible until tested directly on Safari (the storm-rendering near-crash bug that was Safari-specific and required a different root-cause fix — pre-baked PNG rain tile, not the first DOM-write hypothesis — than what Chrome testing alone would have surfaced). Module scripts are an area with a similar track record: Safari has had version-specific bugs and stricter/different behavior around cross-origin module fetches (confirmed via Apple's own developer forums showing CORS-related failures specific to Safari/iOS versions that didn't reproduce identically in Chrome on the same test), and Safari's caching/preloading behavior for `<script type="module">` and `<link rel="modulepreload">` has historically lagged or differed from Chromium's implementation in various versions. Given this project's constraint that Safari must work correctly (not just "mostly work"), and given the prior precedent of a Safari-only near-crash bug slipping through Chrome-only testing, there is real risk that a module-loading or module-caching quirk specific to some Safari version could cause a slow load, a failed load, or a stale-cache bug that never shows up in Chrome-only development.

**Why it happens:**
Development happens primarily in one browser (typically Chrome, given DevTools ergonomics), and cross-browser module-loading edge cases are easy to miss because they often only manifest under specific conditions (cold cache, specific Safari version, iOS vs. macOS Safari, throttled network) that aren't part of a normal dev loop.

**How to avoid:**
- Treat "load and fully play a solo game in Safari, from a cold cache (private window / cleared cache), on both the very first module-graph load and a reload" as an explicit, required manual test step for every phase that touches script loading/module structure — not deferred entirely to a final verification phase. This should happen incrementally as modules are introduced, not just once at the end.
- Specifically verify in Safari: (a) the module graph loads and executes correctly with a cold cache and on repeat visits (warm cache) — cache-related module bugs are the most Safari-version-specific class of issue; (b) no CORS-related console errors when the app is served from the actual target domains (`wyattroy.github.io`, `playpastrypirates.com`, `localhost`) matching the API-key domain restrictions already configured; (c) storm/rain rendering (the previously Safari-fragile code path) still renders correctly and performantly after whatever module it now lives in loads — this is the single most Safari-sensitive piece of UI in the app and deserves explicit re-verification after every phase that touches its module boundary, not just once.
- Do not rely solely on "if it works in Chrome, the module loading itself is browser-agnostic standard behavior so Safari will be fine" reasoning — that reasoning was already wrong once for this exact codebase (the storm bug). Budget explicit Safari manual testing time into each phase that changes script/module structure, matching the project's own stated verification plan ("manual Safari/multiplayer playtests").

**Warning signs:**
- Anything that only reproduces in Safari and not Chrome during dev — treat every such report as high-priority, don't dismiss as "probably a Safari quirk, low risk" given this project's history.
- Slow first-load specifically in Safari (module fetch waterfall behaving differently than Chrome's) — check the Network panel in Safari Web Inspector for the module fetch sequence.

**Phase to address:**
Every phase that changes script tag structure or module boundaries should include a Safari manual-test checkpoint, with the storm-rendering path specifically re-verified. The final verification phase (already planned: "manual Safari/multiplayer playtests") should not be the *first* time Safari is tested — that's too late to cheaply localize which change caused a regression.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Keep `game`/`room`/`db`/`myId` on `window` instead of a proper module-scoped app-state object, "just to unblock the split" | Faster to ship the module split without redesigning state ownership | Recreates the exact global-state-explosion problem this milestone exists to fix; inline `onclick` handlers stay permanently coupled to globals | Acceptable only as an explicitly-labeled, temporary `window.__pp_debug` bridge for test-harness/debugging access — never as the production state-access pattern |
| Split files along "what's easy to cut" (e.g., first 2000 lines) rather than along real coupling boundaries | Faster initial split, less analysis up front | Near-guaranteed circular imports (Pitfall 7) and re-shuffling churn once real coupling surfaces later | Never — the milestone's own plan correctly calls for mapping real coupling before locking boundaries; don't skip that step under time pressure |
| Leave the Node test harnesses broken ("we'll fix them after the split is done") | Split proceeds faster without adapting the harness in lockstep | Zero automated determinism/replay coverage during exactly the highest-risk phase of the project | Never — migrate the harness in the same phase/commit as the code move that breaks it (Pitfall 6) |
| Patch a `.off()` call in with a fresh inline arrow function instead of storing the original callback reference | Looks like the leak is fixed, passes a quick smoke test | Listener never actually detaches (Pitfall 5); leak persists invisibly, now with false confidence it was fixed | Never |
| Skip Safari testing on early module-boundary phases, do it only in a big verification pass at the end | Faster iteration during the risky mechanical-split work | A Safari-only module-loading regression becomes very expensive to bisect across many accumulated changes | Only for phases that provably don't touch script tags, load order, or the storm-rendering module |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Firebase compat SDK (v12.15.0, CDN `<script>`, not ESM) | Converting the Firebase CDN `<script>` tags to `type="module"` or trying to `import` from the compat SDK — it's not published as an ES module and attaches to `window.firebase` | Keep Firebase CDN tags as classic, synchronous `<script>` tags, positioned before the app's module entry point; app modules read `window.firebase` (or a thin wrapper module that reads it once and re-exports) |
| Firebase RTDB `.off()` | Passing a new/different callback reference to `.off()` than what was registered with `.on()`, silently failing to detach | Store `{ref, eventType, callback}` triples in a registry at registration time; always `.off()` with the stored reference, or use the no-callback form to remove all listeners for that ref/eventType at hard teardown boundaries |
| ES module script loading | Testing exclusively via `file://` (double-clicking `index.html`) after the split | Always serve via a local static HTTP server (`python3 -m http.server` or equivalent) for any testing once modules are introduced |
| Static hosting (GitHub Pages / Netlify / production domain) | Assuming any static host serves `.js` with a correct module-compatible `Content-Type` without checking | Verify via `curl -I` against the deployed `.js` files that `Content-Type` is `text/javascript` or `application/javascript`, on the actual production host, before considering the split shipped |
| Node test harnesses (`real_game_test.js`, `dlog_replay_test.js`) | Leaving them string-slicing `index.html` after engine code moves to external modules — they silently or loudly stop finding the engine region | Rewrite both harnesses to `import`/`require` the extracted engine module directly, in the same phase that performs the extraction |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Splitting into many small modules with a deep, chatty `import` graph | More round trips / parse overhead on module-graph resolution, most visible on Safari and slower connections | Keep the module count deliberately small (engine, UI, networking, constants — not one file per function); measure module-fetch waterfall in DevTools/Web Inspector after the split | Noticeable when module count grows past roughly a dozen files fetched serially on a cold cache, especially on mobile Safari over real (non-localhost) network conditions |
| Re-introducing the already-fixed O(n²) event-narration re-describe bug during module boundary changes to `render()`/`EVENT_NARRATION`/`syncLogLines()` | Sluggish narration log after long sessions (1500+ events), previously fixed in commit `7d4dfc9` | Keep `syncLogLines()`'s "only process new events" invariant intact and covered by a regression test (event count vs. render time) when this code moves modules | Any refactor of `render()`/`liveRender()`/`watchEvents()` that reintroduces "re-describe all history on each new event" |
| Chat bubble position parsing via regex on SVG transform strings, now potentially re-run more often if `render()`'s module boundary changes its call frequency | Jank on frequent re-renders | Don't let a module split incidentally change how often `render()`/`positionChatBubble()` runs; if consolidating render calls behind a dispatcher (a good idea generally) do it deliberately, not as a side effect of the split | Existing risk, not newly introduced by the split itself — but worth re-verifying since render call sites are being touched |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing the Firebase config object (already public/intended) via a module that also inadvertently exposes internal state manipulation helpers on `window` for debugging convenience | Slightly widens the surface for a malicious client script or browser extension to directly call state-mutating functions that were previously just accidentally-global, now deliberately-global | If a debug bridge (`window.__pp_debug`) is added for test-harness access, keep it read-only where possible, and don't attach functions that mutate authoritative host state without going through the normal event/broadcast path |
| Assuming module boundaries add any real security isolation between "trusted" engine code and "untrusted" input handling | ES modules provide code organization, not a security sandbox — malformed/adversarial Firebase payloads can still reach engine methods exactly as before | Treat this refactor as orthogonal to the input-validation gaps already flagged in `CONCERNS.md` (bot decisions trusted without validation, no server-side chat length enforcement) — don't let "we modularized the code" create false confidence that hardening happened too |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Shipping the module split with even a brief loading-order regression (Pitfall 2) that delays interactive-readiness | Players see a longer blank/unresponsive period before the board is playable, especially on first visit / slow connections | Explicitly time-to-interactive test before/after the split on a throttled connection profile, not just on a fast local network |
| A silently-broken inline `onclick` handler (Pitfall 3) that a player discovers mid-game (e.g., "Reveal My Recipe" does nothing) | Player thinks the game is frozen/buggy mid-session, potentially the middle of a multiplayer game they can't easily restart | Full manual click-through of every UI control (not just the primary game loop) as an explicit checklist item before considering the de-globalization phase done |
| A desynced replay (Pitfall 1) that silently gives one player a different board/hand than another, with no visible error | Players see genuinely different games without knowing it — likely reported as "the game is broken/unfair" with no clear repro, very expensive to debug after the fact from a bug report alone | Automated byte-for-byte replay-equality testing (Pitfall 1's prevention) must catch this before it ships, since it's nearly undiagnosable from a user report |

## "Looks Done But Isn't" Checklist

- [ ] **Module split "compiles and the board loads":** Often missing — a full seeded-replay-equality diff against the pre-refactor baseline (not just "the game visibly plays through once"). Verify: run `real_game_test.js` at N fixed seeds before and after, diff `game.events` / final state / `randCalls` count.
- [ ] **`.off()` calls added at all 9 known watcher sites:** Often missing — reference-matching verification (does the specific callback reference actually detach, confirmed by fire-count instrumentation), not just "an `.off()` line exists near each `.on()` line." Verify: reconnect a guest multiple times and confirm event/callback fire counts don't multiply.
- [ ] **Globals "moved to a state object":** Often missing — the audit of all 41 inline `onclick=` (and other inline event attribute) handlers in the HTML markup that still resolve function names against global scope. Verify: click through every UI control in the app with DevTools console open, watching for `ReferenceError`.
- [ ] **"Works in Chrome" module loading:** Often missing — cold-cache Safari verification, and verification against the actual production static host's `Content-Type` headers (not just localhost). Verify: private-window Safari load + `curl -I` against deployed `.js` files.
- [ ] **Node test harness "still runs":** Often missing — confirmation that it's importing the *real* extracted module (not a stale copy, not silently falling back to an empty/mocked engine). Verify: intentionally break something small in the extracted engine module and confirm the harness's output changes accordingly (a canary that the harness is actually exercising live code).
- [ ] **Circular-import-free module graph:** Often missing — explicit standalone-import testing of each module in isolation (Pitfall 7's prevention), not just "the whole app works when loaded together" (which can mask lazily-resolved cycles that only break on less-common code paths like host-refresh replay).

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|-----------------|
| Discovered RNG/iteration-order desync after some deployment | HIGH | Bisect via the seeded replay-equality harness against each incremental commit of the split to localize the exact code-motion diff that changed order; revert just that constant/loop to its original literal ordering; add the "ORDER IS LOAD-BEARING" comment retroactively and re-run the full seeded regression suite |
| Firebase `.off()` mismatched-reference leak shipped | MEDIUM | Introduce the watcher registry pattern retroactively (store `{ref,eventType,callback}` at every `.on()` call site going forward); for already-deployed sessions, the leak self-resolves on tab close/reload — no data-loss risk, just wasted reads until users refresh |
| Inline `onclick` handler broken post-de-globalization | LOW | Quick, isolated fix — grep for the specific broken handler name, add the missing `window.x=x` bridge line or migrate that one handler to `addEventListener`; low blast radius per-handler, but do the full audit (see checklist) to avoid finding these one at a time via bug reports |
| Node harness broken/unmigrated after engine extraction | LOW–MEDIUM | Rewrite the harness's extraction logic to `import`/`require` the module directly (removes the fragile string-slicing entirely going forward, a net improvement over the pre-refactor state) |
| Safari-specific module-loading regression shipped | MEDIUM–HIGH | Same class of investigation as the original storm bug — reproduce on the actual failing Safari version/OS combo (don't trust Chrome DevTools' Safari emulation), check Web Inspector's Network/Console panels for module-fetch-specific errors, and be prepared for the root cause to be non-obvious (as it was for the storm PNG fix) |
| Circular import causing intermittent `ReferenceError` on replay | MEDIUM | Identify the specific top-level cross-reference causing the TDZ read; refactor to dependency injection (pass the needed function/value into a constructor or setup call rather than importing it) at the two modules' boundary; add the standalone per-module import test to prevent recurrence |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| 1. RNG/iteration-order desync from code motion | Engine-extraction phase | Byte-for-byte `game.events`/`randCalls` diff across N fixed seeds, pre- vs. post-split, via `real_game_test.js` |
| 2. Module defer timing reorders init vs. Firebase/preload | First structural-split phase (entry point + script-tag layout) | `console.assert(typeof firebase !== 'undefined')` at module-entry top; manual load test on throttled network in both Chrome and Safari |
| 3. De-globalization breaks inline `onclick`/Firebase-callback global reads | De-globalization phase | Full manual click-through of all 41 inline handlers with DevTools console open; explicit checklist artifact from the `onclick=` grep |
| 4. `file://`/CORS/MIME breaks module loading | First structural-split phase | Cold-load via real local HTTP server (not `file://`); `curl -I` MIME check against production static host |
| 5. Firebase `.off()` mismatched-reference no-op | Firebase `.off()` cleanup phase | Reconnect-and-count test: guest reconnects N times, confirm event/callback fire counts don't multiply; watcher registry code review |
| 6. Node harnesses break on engine extraction | Engine-extraction phase (same phase, same commit) | Both harnesses pass, at matching seeds, with output equal to pre-split baseline; harness rewritten to `import`/`require` the module directly |
| 7. Circular imports / TDZ errors | Module-boundary-mapping step, start of engine-extraction phase | Standalone per-module import smoke test in Node; dependency-direction rule enforced (engine imports nothing from UI/networking) |
| 8. Hoisting/TDZ differences on forward references | Same module-boundary-mapping step as #7 | Audit of all module-top-level side-effecting code (constant-derivation blocks) for cross-module ordering dependencies |
| 9. Safari module-loading regressions | Every phase touching script/module structure; final verification phase | Cold-cache private-window Safari load test per phase, not deferred to the end; explicit storm-rendering re-verification |

## Sources

- Direct source inspection: `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/new-session-d6e9d7/index.html` (line-numbered grep evidence cited throughout — `DIRS`/`Object.keys`/`Object.values` usage, `mulberry32`/`this.r()` RNG calls, global declarations at lines 1813/4872, 41 inline `onclick=` handlers, Firebase watcher call sites)
- `.planning/codebase/CONCERNS.md` (2026-07-22 audit) — monolith/global-state/Firebase-watcher/replay-fragility findings, corroborating and extending several pitfalls above
- `.planning/codebase/TESTING.md` (2026-07-22 audit) — Node harness design and "no CI" finding
- `scripts/real_game_test.js`, `scripts/dlog_replay_test.js` — direct inspection of the string-slicing extraction mechanism and its own documented rationale/guard
- MDN, "`<script>` HTML element" — module script deferred-execution semantics — https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script
- MDN, "Document: DOMContentLoaded event" — defer/module timing relative to DOMContentLoaded — https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
- Community/technical write-ups on ES module CORS-mode fetches and `file://` null-origin blocking — https://www.xjavascript.com/blog/importing-script-with-type-module-from-local-folder-causes-a-cors-issue/ , https://jakearchibald.com/2017/es-modules-in-browsers/
- Apple Developer Forums — Safari-specific CORS/module-loading behavior reports — https://developer.apple.com/forums/thread/129963
- Circular ES-module dependency / live-binding / TDZ behavior write-ups — https://implera.ai/blog/how-to-fix-circular-dependencies-in-javascript , https://www.bryanbraun.com/2025/03/29/breaking-down-circular-dependencies-javascript/
- Firebase RTDB `off()` reference-equality behavior — https://www.tutorialspoint.com/firebase/firebase_detaching_callbacks.htm , https://github.com/invertase/react-native-firebase/issues/3812

---
*Pitfalls research for: zero-build ES-module refactor of a deterministic multiplayer browser game*
*Researched: 2026-07-24*
