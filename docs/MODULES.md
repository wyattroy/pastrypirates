# Module-Loading & Local-Dev Contract

Pastry Pirates loads native ES modules with **no build step and no bundler**. This
document is the contract: what's required to run the game locally, how module
scripts are ordered relative to Firebase, and the `src/` layout Phases 8–11 will
fill in. Read this before touching `index.html`'s `<script>` tags or adding a new
file under `src/`.

## An HTTP server is required

Module scripts (`<script type="module">`) only load over an HTTP(S) origin. The
canonical local dev server is:

```
python3 -m http.server 8000
```

Chosen because it ships with macOS and needs no install — this is the
no-dependency path and works even for a reader without npm. A convenience alias
is also available:

```
npm start
```

Both start the same static file server rooted at the repo root. Visit
`http://localhost:8000/index.html` (or `http://localhost:8000/`) after starting
either one.

## `file://` is unsupported, and why

Opening `index.html` directly from the filesystem (`file:///path/to/index.html`)
does **not** work for the module entry. Module scripts require a real HTTP
origin; loading from `file://` gives the page an opaque origin, and the browser
refuses to fetch the module graph from it. This is a **deliberate exclusion**,
recorded in `REQUIREMENTS.md`'s Out of Scope table — it is not a bug and not an
unimplemented feature, so please don't file it as either. Always use the HTTP
server above for local testing.

## `.js` MIME type expectations

Two environments serve this project's `.js` files today, and both are already
correct with no configuration needed:

- **Local dev** (`python3 -m http.server`) returns `text/javascript`.
- **Production** (this project's live host) returns `application/javascript; charset=utf-8`.

Both are valid JavaScript MIME types accepted by `<script type="module">` in
every evergreen browser. Do not change server configuration to "fix" the MIME
type — neither host needs it.

**The failure mode to know about:** if a host ever serves `.js` files as
`text/plain`, `application/octet-stream`, or any other non-JavaScript type, the
browser will refuse to execute the module. Safari does this more silently than
Chromium — often with no visible console error at all, just a page that never
finishes initializing. This is exactly why the load-order tripwires below exist:
they give you a page-load-time signal instead of a silent failure discovered
mid-game.

## The classic-before-module load-order rule

Module scripts (`<script type="module">`) are **always deferred** — they execute
only after the HTML parser finishes, and only after every non-deferred classic
script that precedes them has already run. Non-deferred classic scripts execute
synchronously, in document order, as the parser reaches them.

This project relies on that ordering directly: the Firebase compat script tags
at `index.html:25-26` (`firebase-app-compat.js`, `firebase-database-compat.js`)
are classic scripts, and they stay classic and stay ahead of the module entry
tag. That guarantees `firebase` is a defined global before any module code runs
— no init race, no timing dependency to get wrong.

**Standing tripwires catch a regression at page load, not mid-game:**

- `src/main.js` checks `typeof firebase === "undefined"` and logs a
  `console.error` naming itself if the Firebase global is missing when the
  module runs — a load-order violation reports itself immediately instead of
  surfacing as a broken multiplayer lobby.
- `src/main.js` sets `window.__pp_module_ok = true` (guarded by
  `typeof window !== "undefined"` so the same file also imports cleanly under
  plain Node with no DOM present). This is the machine-checkable marker that
  confirms the module entry actually executed — check it from a Chrome MCP
  session or the browser console.

## The extraction hazard — script tags must carry attributes

Any new `<script>` tag added to `index.html` **must carry attributes**
(`type="module"`, `src="..."`, etc.). The Node test harnesses
(`scripts/lib/load_engine.js` and everything that calls it) locate the engine
region by searching for a bare, attribute-less `<script>` open tag, which today
matches **exactly once** in the whole file (the inline engine block opening at
`index.html:859`). Writing a second attribute-less `<script>` anywhere in the
file does not throw an error — it silently becomes the *first* match and every
harness starts extracting the wrong region. This is a standing rule for Phases
8–11, since that is when new script tags are most likely to appear as the
monolith splits.

## The `src/` layout

Phase 7 shipped only `src/main.js` (the module entry) and
`src/module-contract.js` (a trivial proof-of-contract leaf import). Phase 8
filled in the first two tiers of this shape:

- `src/main.js` — the module entry point (exists since Phase 7; Phase 8 extends
  it to populate the bridge and drive startup — see below)
- `src/shared/index.js` — the **leaf tier** (Phase 8): pure constants and pure
  helpers with no engine dependency — `ING_ALL`, every `*_IMG` image-path map,
  `EMOJI_IMG`/`emojify`, the `DIRS` family, `TET`, ingredient-label helpers,
  `man`, and friends. 120 named exports.
- `src/engine/index.js` — the **engine tier** (Phase 8): `rollStorm`,
  `PERSONALITY`/`AW`/`TW`/`DW`/`FISH_BASE`, `class Game`, `roundCfg`. 8 named
  exports. Imports from `src/shared/index.js`; **never** the reverse — shared
  is a leaf by construction, and `scripts/engine_contract_check.js` (see
  below) fails the build if that direction is ever violated.
- `src/ui/` — extracted rendering/UI code, plus the bridge's removal (Phase 11)
- `src/net/` — extracted Firebase networking code (Phase 9). Five files:
  - `src/net/registry.js` — the `WatcherRegistry`. **The only file in the
    whole repository permitted to call `ref.on()` or `ref.off()`.** This is
    mechanically enforced, not conventional — see "The net contract check"
    below. No import of UI code, the engine tier, or any state belonging to
    a caller.
  - `src/net/watchers.js` — the eighteen `netWatch*` transport wrappers. Each
    builds the Firebase `Reference`, chooses a scope and a label, and hands
    the caller's own handler straight to `registry.attach()` as the callback
    itself. Contains no `.on()`/`.off()` call of its own.
  - `src/net/writers.js` — one function per Firebase write: a `set`, `push`,
    `update`, or `remove` on a path built the same way the pre-extraction
    call site built it, plus an optional caller-supplied error reporter.
  - `src/net/readers.js` — one-shot reads (`.get()`/`.transaction()`)
    returning the raw promise, so every caller's own `.val()` extraction,
    existence check, and error handling stays exactly where it was.
  - `src/net/index.js` — barrel plus Firebase app construction: the
    `firebaseConfig` object (copied byte for byte from the pre-extraction
    declaration), `cfgReady()`, `netInit()`, `netLeaveRoom()`, and re-exports
    of every watcher/writer/reader/registry-surface name, all `net`-prefixed.

**Import specifiers must carry an explicit `.js` extension** — browser ESM
performs no extension resolution, unlike Node's CommonJS `require()`. An
extensionless specifier resolves under Node but 404s in the browser, which is
exactly the kind of silent-skip failure this contract exists to prevent.

## The networking handler-injection seam

This is the design decision a future reader is most likely to undo by
accident, so it is stated here as a rule with a reason.

`src/net/` owns transport only: building `Reference`s, attaching and
detaching listeners, reading, and writing. Every watcher callback's *body* —
every UI call (`setFlipCoin`, `showNarration`, `renderBattleFromSnap`, and
friends), every read of `game`/`mySeat`/`isHost`/`replaying` — stays exactly
where it was, in the classic script, and is handed into `src/net/`'s
`netWatchX(db, room, handler)` functions as a plain function argument.
`src/net/` therefore executes UI and app-state logic indirectly, once
removed, through a caller-supplied function — never through an import.

**The direction is explicit and one-way: the UI may import `src/net/`;
`src/net/` may never import the UI.** `scripts/net_contract_check.js` (below)
makes that direction a standing build failure, not a review comment.

**Dispatch is synchronous, and that is load-bearing, not incidental.** The
wrapped callback calls the caller's `handler` directly, in the same tick as
the raw Firebase callback fires — no emitter, no `Promise`, no microtask
between them anywhere in `src/net/`. This matters because a guard flag
(`replaying`, for instance) checked inside a handler could otherwise change
value between the Firebase callback firing and the handler actually running,
which would corrupt a replay rebuild with no visible symptom at the moment
it happens. An event emitter was considered and rejected for the same
reason `src/net/` avoids one everywhere else: it would be technically
synchronous too, but it adds an indirection layer with no benefit here,
since every watcher has exactly one consumer, and it makes an accidental
deferral easy to introduce later without anyone noticing at the call site.

## The two listener scopes

Exactly two scopes exist, and the distinction is the single most likely
well-intentioned mistake a later phase could make here.

- **`"room"`** — every watcher tied to a specific room's lifetime. Torn down
  together, all at once, when a room is left (`netLeaveRoom()` /
  `registry.detachRoom()`).
- **`"session"`** — the connection and presence watchers
  (`netWatchConnected`, `netWatchPresence`). Attached once per page life and
  **must survive a room leave**, because they track the browser's connection
  to Firebase itself, not any particular room. Tearing them down alongside
  room-scoped listeners would be a regression dressed as a fix —
  `registry.detachRoom()` only ever touches `"room"`-scoped entries by
  construction, precisely to prevent that.

## The eighteen-watcher count, and why it isn't fourteen

`src/net/watchers.js` exports eighteen `netWatch*` transport wrappers,
attaching through the registry with exactly eighteen `registry.attach()`
calls. This figure was corrected from a stale "fourteen watchers, one torn
down" in the roadmap and requirements docs after a direct grep of
`index.html` on 2026-07-24 turned up eighteen live `.on()` call sites and two
`.off()` call sites. Both planning documents were corrected at that time.
`scripts/net_contract_check.js` now pins the figure mechanically: if a
document elsewhere in this repository is ever found to still say fourteen,
this section — and the check's own hardcoded inventory list, sourced from
the corrected count — is the current number.

## `window.__pp_net_debug`

A third standing browser tripwire, alongside `window.__pp_module_ok` and
`window.__pp_boot_count` (see "Standing browser tripwires" below). Set in
`src/main.js` inside the same `typeof window` guard as the other two. Shape:

```
{ size(scope) -> number, list() -> array, detachRoom() -> number, detachAll() -> number }
```

It exposes the registry's own bookkeeping directly. Because the registry is
mechanically the only file permitted to attach or detach a Firebase
listener (enforced by `scripts/net_contract_check.js`'s sole-listener-site
assertion), that bookkeeping *is* the listener ground truth — there is no
other source of truth for "how many listeners are actually live right now"
to disagree with it.

**It carries no `PP-BRIDGE` token, deliberately.** Phase 11 removes the
temporary bridge by grepping for that token on every line that carries it;
this hook is meant to outlive that removal. It is the named, documented seed
for GLOBAL-03's "single documented debug mechanism" requirement in Phase 10,
so that phase does not need to invent or rename one.

## The net contract check

`scripts/net_contract_check.js` is the standing, `npm test`-wired gate for
SPLIT-04, NET-01, and NET-02 — mirroring `scripts/engine_contract_check.js`'s
structure (multiple named assertions, one run reports every failure, fixed
scope excluding `scripts/` itself) with one deliberate difference from that
predecessor: **it performs no comment stripping, anywhere.**
`engine_contract_check.js` strips from the first `//` to end of line before
matching, and its own header asks for that assumption to be reconfirmed if a
URL-bearing string is ever added to the files it scans. `src/net/index.js`
now contains the Firebase `databaseURL`, which makes that exact false
negative live rather than theoretical — a real violation appearing after a
`://`-bearing literal on the same physical line would be silently truncated
away by that stripping approach before the match pattern ever reached it.
`scripts/net_contract_check.js` matches raw, unstripped lines instead and
accepts the occasional false positive inside a comment on purpose.

Five assertions, all run before the script exits so one run reports every
problem: the registry is the sole file in the repository permitted to touch
the Firebase listener API; `src/net/` references no UI name; `src/net/`
references no app-state global; `src/net/` imports neither `src/ui/` nor
`src/engine/`; and `src/net/watchers.js` exports all eighteen watchers with
exactly eighteen `registry.attach()` calls.

**The consequence for contributors:** a comment inside `src/net/` that
happens to name a UI function or an app-state global will fail the build.
The fix is to reword the comment — describe the boundary in terms of roles
("the caller's handler", "the classic script's own state") rather than by
naming the identifiers on the check's denylists — not to weaken the check.

## What deliberately did not move into `src/net/`

- **The error-surfacing helper that drives the visible "sync trouble"
  banner.** It toggles a DOM element, which makes it UI. It stays in
  `index.html` and is passed into every `src/net/writers.js` function that
  needs it as a plain function argument, exactly as it was passed to
  `.catch(...)` before the extraction.
- **The database handle itself.** `let db=null, ...` remains a classic-script
  global in `index.html`. De-globalizing it is Phase 10's job under
  GLOBAL-01 — doing it here would blur this phase's boundary. Every
  `src/net/` function receives `db` as a plain argument at every call site
  and never reads a module-level or window-level handle.
- **Room and lobby orchestration.** `createRoom()`, `joinRoom()`,
  `watchRoom()`, `startGame()`, and `resumeHostGame()` keep their
  orchestration logic in `index.html`; only their Firebase transport calls
  route through `src/net/`.

A reader finding any of these three still in `index.html` should read this
list as confirmation, not as an oversight.

## The `window.PP` bridge (temporary — removed in Phase 11)

Module scripts are always deferred (see "classic-before-module" above), but
the classic UI/networking code still in `index.html` references `Game`,
`roundCfg`, `DIRS`, and ~150 other bare identifiers that, before Phase 8,
were declared directly in that same classic script. Once the engine and
shared tiers moved into real modules, those bare identifiers would otherwise
be undefined by the time the classic script runs.

`src/main.js` bridges the gap by publishing every `src/shared/` and
`src/engine/` export onto **two** places:

- `window.PP` — a single namespaced object (`{ ...shared, ...engine }`), the
  documented, intentional surface for any code that wants to reference the
  bridge explicitly.
- `globalThis` (via `Object.assign(globalThis, PP)`) — so the ~150+
  pre-existing bare-identifier call sites in the classic script (`Game`,
  `DIRS`, `man`, …) keep resolving with zero edits to that code.

Both mechanisms exist because the classic script was never rewritten to
reference `window.PP.Game` etc. — that rewrite is explicitly out of scope for
Phase 8 (D-15: introduce the minimum bridge surface needed to keep the game
running, don't pre-emptively migrate call sites) and is Phase 10's
de-globalization job instead.

**This bridge is temporary and named for exactly that reason.** Every line
that populates it carries the literal token `PP-BRIDGE` in a trailing
comment, so Phase 11's removal is a grep, not an archaeology project:

```js
window.PP = PP; // PP-BRIDGE
Object.assign(globalThis, PP); // PP-BRIDGE
```

## Startup order (why it's load-bearing)

`src/main.js` drives the following sequence, in this order, every page load:

1. Populate the bridge (`window.PP` + `globalThis`, both `PP-BRIDGE`-tagged).
2. Call `window.applyEngineBootstrapEffects()` — the three relocated D-06
   impurities (the two `--clock-img`/`--flip-socket-img` CSS custom-property
   writes and the `document.body.innerHTML = emojify(...)` rewrite).
3. Call `window.attachPastryArt()` — the `RECIPE_BOOK` art-attachment
   parse-time hazard, deferred to run after the bridge exists.
4. Call `window.boot()` — inversion of control (D-14): the classic script no
   longer self-invokes `boot()`; the module triggers it once the bridge is
   ready.

The order matters because step 2's `document.body.innerHTML` rewrite must run
**before** `boot()`'s element-lookup and event-wiring (`wireWelcome`,
`wireLobby`, `wireRecipeModal`, …) — rewriting `body.innerHTML` after those
listeners are attached would silently detach them, since the HTML parser
treats an `innerHTML` assignment as a fresh subtree with no memory of
listeners bound to the nodes it replaces.

## Standing browser tripwires

Two markers confirm the module entry ran correctly, checkable from a Chrome
MCP session or the browser console:

- **`window.__pp_module_ok`** — set `true` as soon as `src/main.js` runs (see
  "classic-before-module load-order rule" above). Catches a load-order
  regression: if this is ever `undefined` on a loaded page, the module never
  executed at all.
- **`window.__pp_boot_count`** — incremented once per `src/main.js` execution.
  Introduced in Phase 8 because `applyEngineBootstrapEffects()`'s
  `document.body.innerHTML` rewrite now runs at *module time* instead of
  mid-parse, re-serializing and re-parsing the whole `<body>` — which could,
  in principle, cause `src/main.js` to be re-entered. This counter proves the
  module still runs exactly once (`=== 1` on a normal page load) rather than
  assuming it from the absence of a visible symptom.

## The retired `<script>`/`escHtml` slice boundaries

Before Phase 8, `scripts/lib/load_engine.js` obtained the engine by slicing
`index.html` text between the inline `<script>` tag (`:859`) and the
`function escHtml` marker (`:1827`), then evaluating that slice in a `node:vm`
sandbox. Phase 8 replaced that with a plain native
`import * as engine from "../../src/engine/index.js"` — `load_engine.js` no
longer reads `index.html` at all, so those two markers are retired as slice
boundaries.

**This is a separate concern from the bare-`<script>`-tag count rule above,
which still applies.** That rule exists independently of how `load_engine.js`
obtains the engine — it protects against a *second* attribute-less `<script>`
tag ever being added to `index.html`, which would be confusing regardless of
whether anything still parses for it today.

## The engine contract check

`scripts/engine_contract_check.js` is the standing, `npm test`-wired gate for
two of this doc's own invariants: engine purity (zero `document`/`window`/
`firebase`/`localStorage`/`Date.now`/`Math.random`/`globalThis`/`new Function`
references in `src/engine/*.js` and `src/shared/*.js`) and the
`ORDER IS LOAD-BEARING` annotation coverage on every order-reaching construct.
It also asserts the `src/shared/` → `src/engine/` import direction never
reverses, and that every symbol moved out of `index.html` during Phase 8 is
exported by exactly one of the two barrels with no leftover top-level
declaration shadowing it in `index.html`. A one-time grep pasted into a plan
summary proves nothing about Phase 9 onward; this script is what makes that
protection standing rather than aspirational.

## Minimum Node version

The Node-based test harnesses (`scripts/determinism_baseline.js`,
`scripts/real_game_test.js`, `scripts/dlog_replay_test.js`) use top-level
`await` and `node:`-prefixed core module imports. These require **Node 18 or
newer**. Development and research for this phase were exercised against Node
v25.9.0; Node 18+ is the documented floor.

## Quick reference

| Question | Answer |
|---|---|
| How do I run the game locally? | `python3 -m http.server 8000` (or `npm start`), then open `http://localhost:8000/` |
| Can I just open `index.html` from disk? | No — module scripts require an HTTP origin. See "`file://` is unsupported" above. |
| Does the server need special config for `.js` files? | No — both the local dev server and production already serve valid JS MIME types. |
| Why does Firebase load before the module entry? | Classic scripts execute synchronously in document order; module scripts always defer. See "classic-before-module" above. |
| How do I know the module entry actually ran? | `window.__pp_module_ok === true` in the browser console. |
| Can I add a bare `<script>` tag? | No — see "The extraction hazard" above. Always add attributes. |
