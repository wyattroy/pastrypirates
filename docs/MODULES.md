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

Phase 7 ships only `src/main.js` (the module entry) and `src/module-contract.js`
(a trivial proof-of-contract leaf import). Phases 8–11 will fill in the rest of
this shape:

- `src/main.js` — the module entry point (exists today)
- `src/engine/` — the extracted `Game`/`roundCfg` engine code (Phase 8)
- `src/ui/` — extracted rendering/UI code (Phase 9)
- `src/net/` — extracted Firebase networking code (Phase 11)

**Import specifiers must carry an explicit `.js` extension** — browser ESM
performs no extension resolution, unlike Node's CommonJS `require()`. An
extensionless specifier resolves under Node but 404s in the browser, which is
exactly the kind of silent-skip failure this contract exists to prevent.

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
