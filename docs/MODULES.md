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
- `src/net/` — extracted Firebase networking code (Phase 9)

**Import specifiers must carry an explicit `.js` extension** — browser ESM
performs no extension resolution, unlike Node's CommonJS `require()`. An
extensionless specifier resolves under Node but 404s in the browser, which is
exactly the kind of silent-skip failure this contract exists to prevent.

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
