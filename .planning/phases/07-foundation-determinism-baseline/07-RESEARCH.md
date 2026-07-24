# Phase 7: Foundation & Determinism Baseline - Research

**Researched:** 2026-07-24
**Domain:** Zero-build ES module loading contract (browser + Node parity) and deterministic regression-oracle tooling for a vanilla-JS monolith
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Golden-fixture corpus shape**
- D-01: The oracle captures the full per-seed event log, not aggregate statistics.
- D-02: Capture both a full event stream per seed and a SHA-256 digest per seed in a manifest.
- D-03: 30 seeds, `12345`–`12374`, reusing `SEED_BASE = 12345`; bot strategies rotate across the 5 personalities per `BOT_STRATS[(i + s) % 5]`.
- D-04: The capture tool asserts mechanic coverage and fails if the corpus does not exercise every event type (`battle`, `trade`, `dock`, `fish`, storm/wind, run-aground, endgame).
- D-05: Final game state (positions, ingredients, coins, winner) is captured alongside the event stream per seed.

**Fixture storage & check tool**
- D-06: Fixtures live in `scripts/fixtures/determinism/` — no new root-level directory.
- D-07: Format is `seed-<N>.jsonl` (one event per line) plus a single `manifest.json` (seed list, config used, per-seed SHA-256, coverage summary, engine-source hash).
- D-08: Fixtures are committed to git.
- D-09: One tool — `scripts/determinism_baseline.js` with `--capture` and `--verify` (default `--verify`). Exits 0/1.
- D-10: On mismatch, print the first divergent seed and event index with a compact before/after of that event.
- D-11: The manifest records a hash of the engine source region, so "fixtures are stale" is distinguishable from "engine behavior changed."
- D-12 (structural, load-bearing for Phase 8): All engine loading goes through one indirection — `scripts/lib/load_engine.js`. In Phase 7 it performs today's vm/string-slice extraction; in Phase 8 its body becomes a native import. `determinism_baseline.js`, `real_game_test.js`, and `dlog_replay_test.js` all route through it.

**Module entry & Firebase order**
- D-13: New modules live under `src/`. Phases 8–11 inherit this: `src/engine/`, `src/ui/`, `src/net/`, `src/main.js`.
- D-14: Phase 7 ships a deliberately minimal proof-of-contract: `src/main.js` importing one trivial leaf module. Does not pre-empt `SPLIT-02`'s shared-constants module.
- D-15: The module entry sets a marker (`window.__pp_module_ok = true`) so the browser-side contract is machine-checkable from a Chrome MCP session.
- D-16: Load order in `index.html`: Firebase compat classic tags (`:25-26`, unmoved) → existing inline classic `<script>` (`:859`, untouched) → new `<script type="module">` appended last.
- D-17: `src/main.js` asserts `typeof firebase !== "undefined"` and logs an explicit error if not.
- D-18: `boot()` and all existing initialization timing are unchanged this phase.

**Dev server & proof of parity**
- D-19: Canonical local server is `python3 -m http.server 8000`. An `npm start` alias is added for discoverability.
- D-20: `package.json` is `"private": true` with `"type": "module"` and scripts `start`, `test`, `test:determinism`.
- D-21: Criterion 5 is proven in two parts: (a) capture the corpus on a clean tree *before* the `index.html` edit, then re-verify green after; (b) load the page over HTTP and play a solo game via Chrome MCP, confirming a clean console and `window.__pp_module_ok === true`.
- D-22: The contract doc lives at `docs/MODULES.md` with a short pointer from `README.md`.

### Claude's Discretion
- Exact `src/` leaf-module filename and the marker constant's shape.
- Whether `scripts/lib/load_engine.js` exposes one function or a small object, and its error-message wording on extraction drift (must still throw loudly per the existing harness convention).
- Precise JSON field ordering inside `manifest.json` and the event-line serialization details, provided they are stable and deterministic across runs.
- Whether `.gitignore` gains a defensive `node_modules/` entry (no dependencies exist yet).

### Deferred Ideas (OUT OF SCOPE)
- Moving test machinery to a `tests/` directory — deliberately not done (D-06). Revisit only if `scripts/` becomes unwieldy after the milestone.
- Trimming the corpus if it outgrows ~1 MB — 30 seeds is the chosen balance (D-03). If Phase 8 finds the corpus slow or bulky, reducing seed count is safe; changing the format is not.
- Extracting a pure replay-runner function — tracked as `DX-02` in REQUIREMENTS.md v2, pursue only if the replay seam surfaces bugs during extraction.
- JSDoc typedefs for event objects — tracked as `DX-01` in v2. Out of scope for a structural pass.

**Also out of scope per REQUIREMENTS.md's Out of Scope table:** bundler/minifier toolchain, TypeScript migration, new game modes/mechanics/content, renaming/style normalization during code motion, `file://` local-play support, modular Firebase SDK migration.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| FOUND-01 | Root `package.json` with `"type": "module"` so engine modules import identically in browser and Node | Verified empirically: adding root `"type":"module"` breaks the two existing CJS harnesses (reproduced exact error); ESM-conversion fix verified end-to-end (top-level await, `import.meta.url`, `node:vm` all confirmed working together). `window.__pp_module_ok` guard requirement (Pitfall 2) is the concrete blocker for the "imports identically in Node" half of this requirement — verified and documented with a fix. |
| FOUND-02 | Game loads and plays from a static HTTP server via `<script type="module">`, no bundler | MIME-type serving verified directly against `python3 -m http.server` (this machine) — sends `text/javascript` for `.js`, no config needed. `[VERIFIED: direct tool execution]` |
| FOUND-03 | Firebase compat classic tags load before module entry, no init race | MDN-cited execution-order semantics confirm classic (non-deferred) scripts execute synchronously in document order before any deferred/module script runs — D-16's tag ordering is correct by this rule. `[CITED: developer.mozilla.org]` |
| FOUND-04 | Golden-fixture determinism baseline captured from pre-refactor monolith | `load_engine.js` design (Pattern 1) reuses the exact, verified-working extraction logic from `real_game_test.js`; capture-before-edit sequencing pitfall (Pitfall 4) documents how to avoid invalidating the oracle; manifest-vs-per-seed-hash comparison design (Pitfall 3) documents how `--verify` should actually compare. |
| FOUND-05 | Module-loading + local-dev contract documented (HTTP server required, `file://` unsupported, `.js` MIME expectations) | MIME-type findings for both `python3 -m http.server` and live GitHub Pages production are verified and ready to drop into `docs/MODULES.md` directly (see Code Examples). |
</phase_requirements>

## Summary

This phase has two independent deliverables — a module-loading contract and a determinism oracle — and the research confirms both are safe to build exactly as CONTEXT.md's locked decisions (D-01…D-22) specify. Nothing here overturns a locked decision; the value of this research is resolving the *mechanics* of implementing them correctly, especially the one genuine landmine: **adding a root `package.json` with `"type": "module"` changes how Node interprets every `.js` file in the repo by nearest-parent lookup, and two existing files (`scripts/real_game_test.js`, `scripts/dlog_replay_test.js`) use `require()`/`module.exports` and will hard-crash the instant that file exists — verified empirically in this session.**

The two viable fixes are (a) rename the CJS files to `.cjs`, or (b) convert them to native ESM. This research recommends **(b), full ESM conversion**, verified working end-to-end in this exact repo's Node runtime (top-level `await`, `import.meta.url` for `__dirname`, `node:vm`, dynamic `import()` from a would-be-CJS caller — all tested directly, see Code Examples). ESM conversion is recommended over `.cjs` renaming because Phase 8 explicitly needs these harnesses to `import` a real ES module natively (per the phase's own research brief) — converting now means Phase 8 changes *what* is imported, not *how* the files are structured, avoiding a second file-type churn one phase later. `scripts/battle_sim.js` was checked and needs **no changes at all** — it contains no `require()`/`module.exports`/`__dirname` and will run unmodified as ESM.

On the module-loading side, MDN's script-execution semantics (module scripts always defer; deferred/module scripts execute in document order after parsing) confirm D-16's ordering is correct: Firebase compat classic tags execute synchronously as the parser reaches them, the giant inline classic `<script>` at `index.html:859` executes synchronously right after (also non-deferred), and the new `<script type="module">` appended last is guaranteed to run only after both of those have already executed — this is the correct, citable basis for FOUND-03's "no init race" requirement. MIME-type risk, the other classic module-loading failure mode, was tested directly against this project's own infrastructure: **`python3 -m http.server` on this machine already sends `Content-type: text/javascript` for `.js` files, and the project's live GitHub Pages deployment already sends `content-type: application/javascript; charset=utf-8` for an existing `.js` asset (`scripts/battle_sim.js`) — both are valid JavaScript MIME types and neither needs any server configuration.** This resolves FOUND-02/FOUND-05's MIME-type documentation requirement with verified, not assumed, data.

One additional concrete pitfall surfaced during research and is not yet reflected in CONTEXT.md's decisions: **`window.__pp_module_ok = true` (D-15) will throw `ReferenceError: window is not defined` if `src/main.js` is imported under plain Node** — verified directly. Since Success Criterion 1 requires the same file to import "identically in Node and the browser," this line needs a `typeof window !== "undefined"` guard (the `typeof firebase !== "undefined"` assertion in D-17 is already safe as written, since `typeof` never throws on an undeclared global).

**Primary recommendation:** Convert `real_game_test.js` and `dlog_replay_test.js` to native ESM (not `.cjs`) as part of the `scripts/lib/load_engine.js` migration; guard `window.__pp_module_ok` with a `typeof` check; verify MIME types via the two already-confirmed-good serving paths (`python3 -m http.server`, GitHub Pages) rather than assuming a config is needed.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| ES module loading/execution order contract | Browser / Client | CDN / Static | The ordering guarantee (classic-before-module) is enforced by the browser's HTML parser; the static host only has to serve correct bytes/MIME types for it to hold |
| Firebase compat classic-script load order | Browser / Client | — | Pure script-tag ordering in `index.html`; no server or build participation |
| `.js` MIME-type / static-serving contract | CDN / Static | Browser / Client | Owned by whatever serves the file (`python3 -m http.server` locally, GitHub Pages in production); the browser only enforces what it receives |
| Determinism regression oracle (capture/verify) | Dev Tooling (Node, off-tier) | — | Runs entirely in Node outside the deployed browser/CDN stack; not part of any live-application tier — it exists to protect the Engine tier's future extraction (Phase 8) |
| Golden-fixture corpus storage | Dev Tooling (Node, off-tier) / git | — | Committed artifacts consumed only by the Node test harnesses, never served to the browser |
| Module-loading + dev-server documentation | CDN / Static (describes it) | Browser / Client (describes it) | Documentation artifact, not runtime code — mapped to the tiers it describes |

## Package Legitimacy Audit

**Not applicable — this phase introduces zero external package dependencies.** `package.json` is added with `"type": "module"`, `"private": true`, and script aliases only; no `dependencies`/`devDependencies` are declared (per D-20, and per the "no bundler/no new deps" constraint in REQUIREMENTS.md's Out of Scope table). `python3 -m http.server` is stdlib-only (no pip install). No `npm install` occurs in this phase's plan.

## Standard Stack

This phase adds no new libraries. The "stack" here is entirely Node/browser platform primitives plus the project's own existing tooling conventions.

### Core (platform primitives, no install required)
| Primitive | Version present in this env | Purpose | Why Standard |
|-----------|------|---------|--------------|
| Node.js native ESM | v25.9.0 in this dev environment `[VERIFIED: direct tool execution — node --version]` | Runs `src/*.js` and converted `scripts/*.js` harnesses identically to the browser's module system | Zero-build requirement rules out bundlers/transpilers; native ESM is the only zero-dependency way to satisfy FOUND-01 |
| `python3 -m http.server` | Python 3.9.6 in this dev environment `[VERIFIED: direct tool execution — python3 --version]` | Canonical local dev server (D-19) | Ships with macOS, zero install, correct MIME behavior confirmed (see Common Pitfalls) |
| `node:vm`, `node:fs`, `node:path`, `node:url`, `node:crypto` | Node core, no install | Engine extraction (`vm`), file I/O, and SHA-256 hashing for the fixture manifest | Node stdlib; matches "Python standard library only" / "no external dependencies" project-wide convention (CLAUDE.md) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Rename `real_game_test.js`/`dlog_replay_test.js` to `.js` (ESM) | Rename to `.cjs`, keep `require()` | `.cjs` is a smaller diff today but leaves the harnesses on CommonJS while Phase 8 needs them to natively `import` the real engine module — forces a second conversion one phase later. ESM conversion now is more work in Phase 7 but zero extra churn in Phase 8. **Recommended: ESM conversion.** |
| `crypto.createHash('sha256')` (Node core) for the manifest digest | A checksum npm package | Zero dependencies; Node's `crypto` module has shipped SHA-256 since Node 0.x — no reason to add a package for this |

**Installation:** none — no `npm install` step exists in this phase.

## Architecture Patterns

### System Architecture Diagram

```
Node test harnesses                          Browser (index.html)
────────────────────                          ─────────────────────
determinism_baseline.js  ─┐                    <script src=".../firebase-app-compat.js">    (classic, executes 1st)
real_game_test.js        ─┼──▶ scripts/lib/    <script src=".../firebase-database-compat.js"> (classic, executes 2nd)
dlog_replay_test.js      ─┘    load_engine.js  <script> ...5,637 lines of inline engine+UI...  (classic, executes 3rd,
                                    │                                                            synchronously, blocks
                                    │  (Phase 7: vm + string-slice                                parsing until done)
                                    │   extraction of index.html;                    ▼
                                    │   Phase 8: becomes a native          [HTML parsing finishes]
                                    │   `import` of src/engine/*)                    ▼
                                    ▼                                    <script type="module" src="src/main.js">
                          { Game, roundCfg, sourceHash }                  (always deferred — executes 4th,
                                    │                                      guaranteed after the above)
                                    ▼                                              │
                    scripts/fixtures/determinism/                                 ▼
                    ├── manifest.json (seeds, per-seed SHA-256,          import src/<leaf>.js (trivial)
                    │   coverage summary, engine-source hash)             if (typeof window !== "undefined")
                    └── seed-12345.jsonl … seed-12374.jsonl                 window.__pp_module_ok = true;
                        (one JSON event per line, +final-state line)      if (typeof firebase === "undefined")
                                                                              console.error(...);  // D-17
```

A reader tracing FOUND-04: a seed number flows into `load_engine.js` → a fresh `Game`/`roundCfg` pair → a played game → its `events` array → one JSONL file + one manifest entry. A reader tracing FOUND-02/03: the browser parses `index.html` top to bottom; the two Firebase `<script src>` tags and the giant inline `<script>` all execute synchronously and in order *before* the parser even reaches the module tag, because module scripts are unconditionally deferred — by the time `src/main.js` runs, `firebase` is guaranteed to already be a global.

### Recommended Project Structure
```
package.json                          # "type":"module", "private":true, scripts: start/test/test:determinism
docs/
└── MODULES.md                        # module-loading + dev-server contract (D-22)
src/
└── main.js                           # module entry; imports one trivial leaf, sets window.__pp_module_ok,
                                       # asserts typeof firebase !== "undefined" (non-throwing)
└── <leaf-module>.js                  # trivial pure leaf import target (naming: Claude's discretion, D-14)
scripts/
├── lib/
│   └── load_engine.js                # NEW — single engine-loading indirection (D-12), ESM, async
├── determinism_baseline.js           # NEW — --capture/--verify tool (D-09), ESM
├── real_game_test.js                 # CONVERTED to ESM, now calls load_engine.js
├── dlog_replay_test.js               # CONVERTED to ESM, now calls load_engine.js for the engine
│                                      # region only — its separate replayShortfall sentinel
│                                      # extraction is untouched, out of load_engine.js's scope
├── battle_sim.js                     # UNCHANGED — no require()/module.exports, runs fine under
│                                      # root "type":"module" as-is (verified, see Common Pitfalls)
└── fixtures/
    └── determinism/
        ├── manifest.json             # committed
        └── seed-12345.jsonl … seed-12374.jsonl   # committed, 30 files
```

### Pattern 1: `load_engine.js` as a single async indirection seam
**What:** One exported async function that performs today's vm/string-slice extraction and returns `{ Game, roundCfg, sourceHash }`. In Phase 8 its *body* changes to a native `import`, but every caller keeps calling it the same (already-async) way.
**When to use:** Any of the three consumers (`determinism_baseline.js`, `real_game_test.js`, `dlog_replay_test.js`'s engine-region need) that need `Game`/`roundCfg`.
**Why async now, even though vm-extraction is itself synchronous:** Phase 8's replacement body (`await import(...)`) is inherently async. Making the Phase 7 implementation already return a Promise means the Phase 8 diff is contained entirely inside `load_engine.js` — callers do not change. This is exactly what D-12 requires ("nothing else changes").
**Example (Phase 7 implementation, verified extraction technique via existing harnesses):**
```javascript
// scripts/lib/load_engine.js — Phase 7 body (Phase 8 replaces only what's inside this function)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadEngine() {
  const html = fs.readFileSync(path.join(__dirname, "..", "..", "index.html"), "utf8");
  const scriptStart = html.indexOf("<script>") + "<script>".length;
  const scriptEnd = html.indexOf("function escHtml");
  if (scriptStart < 8 || scriptEnd === -1) {
    throw new Error("Could not locate the Game-class/roundCfg region in index.html — has the file structure changed?");
  }
  const region = html.slice(scriptStart, scriptEnd);
  const sourceHash = crypto.createHash("sha256").update(region).digest("hex"); // D-11
  const engineSrc = region + "\nthis.Game=Game;this.roundCfg=roundCfg;\n";

  const sandbox = {
    document: { documentElement: { style: { setProperty() {} } }, body: { innerHTML: "" } },
    console, Math, Array, Object, Set, Map, JSON, Date, String, Number, Boolean,
  };
  vm.createContext(sandbox);
  vm.runInContext(engineSrc, sandbox, { filename: "index.html (engine region)" });

  const { Game, roundCfg } = sandbox;
  if (typeof Game !== "function" || typeof roundCfg !== "function") {
    throw new Error("Game/roundCfg didn't come out of the extracted region — extraction boundaries may be wrong.");
  }
  return { Game, roundCfg, sourceHash };
}
```
This is a direct, verified refactor of the existing `real_game_test.js` extraction — every line of the extraction logic itself is unchanged; only its packaging (module wrapper, `__dirname` replacement, hash computation) is new.

### Pattern 2: ESM harness conversion (`__dirname`, `require`, top-level execution)
**What:** The three replacements needed to move a CJS harness to ESM.
**When to use:** `real_game_test.js`, `dlog_replay_test.js`, and the new `determinism_baseline.js`.
**Example — all three verified directly in this session's Node v25.9.0:**
```javascript
// __dirname / __filename replacement
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// require(...) replacement for calling load_engine.js
import { loadEngine } from "./lib/load_engine.js";
const { Game, roundCfg, sourceHash } = await loadEngine();   // top-level await — stable in ESM

// node:vm still works identically inside ESM
import vm from "node:vm";
```
`process.argv`, `process.exit(code)`, and `console.log` are unchanged — no ESM-specific concerns there.

### Pattern 3: Non-throwing environment guards in `src/main.js` (proves Success Criterion 1)
**What:** `src/main.js` must be importable under plain Node with zero DOM/Firebase present, without throwing — this is literally what "imports identically in Node and the browser" (Criterion 1) means in practice.
**Verified directly (Node v25.9.0, both CJS-eval and ESM-eval):** `window.foo = true` throws `ReferenceError: window is not defined` when no `window` global exists — i.e. under Node, unless guarded.
**Example:**
```javascript
// src/main.js
import { /* trivial leaf export */ } from "./<leaf-module>.js";

if (typeof window !== "undefined") {
  window.__pp_module_ok = true;                 // D-15 — browser-only marker
}
if (typeof firebase === "undefined") {
  console.error("[main.js] firebase global not found — classic script load order may be broken."); // D-17
}
// NOTE: `typeof firebase !== "undefined"` never throws even when `firebase` is fully undeclared —
// `typeof` is the one operator that's safe on undeclared identifiers. Do NOT write
// `if (!firebase)` — that throws ReferenceError under Node exactly like bare `window` does.
```
A trivial Node-side proof for Criterion 1 becomes: `node --input-type=module -e "import('./src/main.js').then(()=>console.log('OK'))"` exits cleanly with no `window`/`firebase` defined.

### Anti-Patterns to Avoid
- **Diffing `manifest.json` byte-for-byte in `--verify`:** the manifest may legitimately contain a human-informational `capturedAt` timestamp; regenerating and diffing the *whole file* on every `--verify` run would fail on that field alone. Instead, `--verify` should recompute each seed's event log fresh, hash it, and compare that hash against the specific `perSeed[i].sha256` value stored in the committed `manifest.json` — the timestamp field is never part of the comparison.
- **Reusing the string `"<script>"` (bare, no attributes) for the new module tag search, or accidentally introducing a second bare `<script>` anywhere in the file:** `real_game_test.js`/`dlog_replay_test.js` locate the engine region via `html.indexOf("<script>")`, which today matches exactly once (`index.html:859`) `[VERIFIED: direct tool execution — grep -c "<script>" index.html === 1]`. The new module tag must be written as `<script type="module" ...>` (never a bare `<script>`) or it will silently become the *first* match and break every extraction-based harness, including `load_engine.js` itself, the moment it's added.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SHA-256 digest per seed (D-02) | A custom hash function | `node:crypto` `createHash("sha256")` | Zero-dependency, cryptographically standard, already available in every Node runtime this project targets |
| `__dirname` in ESM | A manual `process.cwd()`-relative path hack | `path.dirname(fileURLToPath(import.meta.url))` | The canonical, Node-docs-sanctioned replacement; verified working directly in this repo's runtime |
| CJS/ESM interop for the two existing harnesses | A bundler or transpile step "just for the scripts" | Rename decision (ESM conversion, this phase) — no bundler | REQUIREMENTS.md's Out of Scope table explicitly excludes bundlers; native ESM is sufficient and already verified to work end-to-end |

**Key insight:** every piece of tooling this phase needs (module resolution, hashing, deferred script execution) is already a Node/browser platform primitive. The only design work is sequencing and file-extension/module-type correctness — not picking a library.

## Common Pitfalls

### Pitfall 1: Root `package.json` with `"type":"module"` silently breaks the two existing CJS test harnesses
**What goes wrong:** `real_game_test.js` and `dlog_replay_test.js` both call `require("fs")`/`require("path")`/`require("vm")` at the top of the file. The instant a root `package.json` declares `"type":"module"`, Node's nearest-parent-`package.json` lookup reclassifies every `.js` file in the repo (that doesn't have its own closer `package.json` override) as an ES module — `require` is not defined in ES module scope.
**Why it happens:** Node's module-type resolution is folder-scoped by nearest parent `package.json`, not per-file opt-in (`[CITED: nodejs.org/api/packages.html]` — "The nearest parent package.json is defined as the first package.json found when searching in the current folder, that folder's parent, and so on...").
**How to avoid:** Convert both files to ESM in the same commit that adds `package.json` (recommended — see Pattern 2), or fall back to renaming them `.cjs` (`[CITED: nodejs.org/api/packages.html]` — "`.cjs` files are always treated as CommonJS regardless of the value of the `"type"` field"). **Do not add `package.json` and defer the harness fix to a later commit** — the harnesses will be broken (and `npm test`/CI-style invocations will fail) for however long that gap exists.
**Warning signs:** `ReferenceError: require is not defined in ES module scope, you can use import instead` — verified directly, exact error text: `[VERIFIED: direct tool execution — reproduced this exact error by adding {"type":"module"} to a scratch package.json next to a require()-using .js file]`.
**Also verified — `battle_sim.js` needs no change:** it contains no `require`/`module.exports`/`__dirname`/`__filename` (`[VERIFIED: direct tool execution — grep across all repo *.js files]`) and will run correctly as ESM without modification once the root `package.json` exists.

### Pitfall 2: `window.__pp_module_ok = true` throws under Node, contradicting Criterion 1
**What goes wrong:** D-15's marker line, if written unconditionally, throws `ReferenceError: window is not defined` the moment `src/main.js` is imported outside a browser (i.e., under Node) — verified directly this session in both CJS-eval and ESM-eval Node contexts.
**Why it happens:** `window` is a browser-global with no Node equivalent; unlike `typeof x`, a bare reference to an undeclared identifier always throws.
**How to avoid:** Guard with `if (typeof window !== "undefined")` before the assignment (see Pattern 3). The `typeof firebase !== "undefined"` check in D-17 is already written safely and needs no change.
**Warning signs:** Success Criterion 1's Node-side "trivial import" proof fails with a `ReferenceError` the first time it's attempted — this pitfall is specifically about *proving* Criterion 1, so it will be caught immediately if that proof step is actually executed as part of the plan's verification (make sure it is).

### Pitfall 3: `--verify` re-diffing the whole `manifest.json` file instead of per-seed hashes
**What goes wrong:** If `--verify` regenerates `manifest.json` from scratch and does a raw file diff against the committed one, any incidental non-deterministic field (a capture timestamp, a Node version string, an absolute file path) turns every `--verify` run red even when the actual game behavior is unchanged.
**Why it happens:** Conflating "the manifest is informational metadata" with "the manifest is the regression oracle." The oracle is the *per-seed SHA-256 of the event log*, not the manifest file's own bytes.
**How to avoid:** `--verify` should load the manifest as *reference data* (list of seeds, their expected hashes, the expected engine-source hash), replay each seed fresh, hash the fresh output, and compare hash-to-hash. Never diff `manifest.json` itself.
**Warning signs:** A `--verify` run fails on every single seed simultaneously right after a `--capture` with no code changes in between — a strong signal the comparison is including a non-deterministic manifest field rather than comparing per-seed content hashes.

### Pitfall 4: Extracting the "before" baseline after the `index.html` edit has already landed
**What goes wrong:** If the golden corpus (D-08, committed to git) is captured from a tree that already has the new `<script type="module">` tag or the `load_engine.js` refactor applied, the oracle can no longer prove "the game is behaviorally unchanged" for the one part of this phase that actually touches production code — it would encode the very change it exists to detect (explicitly called out in CONTEXT.md's `<specifics>` section).
**Why it happens:** Easy to lose track of commit ordering across a multi-file phase; `load_engine.js` itself is new infrastructure and "capture with the new tool" feels natural, but the tool's *existence* isn't the risk — the `index.html` edit is.
**How to avoid:** Sequence exactly as D-21 specifies: (a) capture on a clean tree *before* the `index.html` edit, commit the fixtures; (b) make the `index.html`/`package.json`/`src/` changes; (c) re-run `--verify` against the already-committed corpus to prove nothing changed; (d) separately, load the page over HTTP with Chrome MCP and confirm clean console + `window.__pp_module_ok === true` — because the corpus alone (headless, Node-only) cannot detect an `index.html` edit that broke page load.
**Warning signs:** A `--capture` and the `index.html` edit landing in the same commit, or `load_engine.js` being introduced with a **different** extraction result than the pre-existing harnesses (should be byte-identical, since it's the same slice logic, same source file).

## Code Examples

### Verifying `.js` MIME type on this project's actual dev + production servers
```bash
# Local dev server — verified on this machine
$ python3 -m http.server 8931 &
$ curl -sI http://127.0.0.1:8931/scripts/real_game_test.js | grep -i content-type
Content-type: text/javascript
# `[VERIFIED: direct tool execution]` — Python 3.9.6, macOS

# Production (this project's live GitHub Pages deployment)
$ curl -sI https://playpastrypirates.com/scripts/battle_sim.js | grep -i content-type
content-type: application/javascript; charset=utf-8
# `[VERIFIED: direct tool execution]` — actual production response, this project's own domain
```
Both `text/javascript` and `application/javascript` are valid JavaScript MIME types accepted by `<script type="module">` in all evergreen browsers, including Safari (`[CITED: web search summary — Safari rejects text/plain or application/octet-stream for modules, but accepts standard JS MIME types]`). No server configuration changes are needed for either environment — this resolves the "MIME type" half of FOUND-02/FOUND-05 with verified, not assumed, evidence.

### Node-side proof for Success Criterion 1 (once `src/main.js` has the `typeof window` guard)
```bash
node --input-type=module -e "import('./src/main.js').then(() => console.log('Node import OK'))"
```
This should exit 0 with no output beyond `Node import OK` — no DOM, no `firebase`, no crash. The browser-side proof is the Chrome MCP check for `window.__pp_module_ok === true` and a clean console (per D-21b).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `real_game_test.js`/`dlog_replay_test.js` doing their own independent `vm`+string-slice extraction of `index.html` | Both route through one shared `scripts/lib/load_engine.js` (D-12) | This phase | Phase 8's engine-extraction lands as a one-file diff (`load_engine.js`'s internals) instead of a three-file diff |
| Aggregate-statistics test output (win rates, avg flips) as the only regression signal | Full per-seed event-log + SHA-256 corpus (D-01/D-02) | This phase | Catches determinism regressions that aggregate stats would average away and hide |
| No `package.json` in the repo at all | Root `package.json` with `"type":"module"` | This phase | Every `.js` file in the repo is now ESM by nearest-parent lookup unless it opts out via `.cjs` — the CJS-breakage pitfall above is a direct consequence |

**Deprecated/outdated:** None — this phase adds new conventions on top of the existing zero-build approach; nothing existing is being deprecated except the *duplicated* extraction logic in the two harnesses (superseded by `load_engine.js`).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Safari's specific module-loading failure modes (silent skip on MIME/CORS mismatch, strict extension resolution, stricter-than-Chromium enforcement) — sourced from community blog posts/gists via WebSearch, not an official WebKit/Apple document | Code Examples, Summary | Low practical risk here since both this project's actual MIME responses (verified) are standard JS types Safari accepts; but if a future host serves a non-standard MIME type, Safari could fail silently where Chrome would not. Mitigated by the project's own planned VERIFY-04 manual Safari playtest (Phase 12) and the `window.__pp_module_ok`/`firebase` tripwires (D-15/D-17), which surface this class of failure immediately at page load rather than deep in gameplay. |
| A2 | A practical minimum supported Node version for the ESM-converted harnesses was not specified anywhere in the project. This research exercised Node v25.9.0 only (the dev machine's installed version). Top-level `await` and `node:` prefixed core-module imports are stable since roughly Node 14.8+/16, but that floor is asserted from training knowledge, not tested against an older Node binary in this session. | Standard Stack, Code Examples | Low — if the actual deployment/CI Node version is older than ~14.8, top-level `await` in the harnesses would need to move into an async IIFE instead. Recommend documenting a minimum Node version in `docs/MODULES.md` (e.g., "Node 18+") even though CONTEXT.md doesn't require an `engines` field. |

## Open Questions

1. **Exact `manifest.json` schema and field names**
   - What we know: it must contain, at minimum, the seed list, per-seed SHA-256, a coverage summary (D-04), and an engine-source hash (D-11); precise field naming/ordering is explicitly Claude's Discretion per CONTEXT.md.
   - What's unclear: whether per-seed final game state (D-05) belongs inside `manifest.json` or as the last line of each seed's `.jsonl` file.
   - Recommendation: put the final-state snapshot as the last JSONL line of each seed file (e.g., `{"t":"__final__", ...}`) so it participates in that seed's single SHA-256 automatically, rather than splitting the oracle across two files with two different comparison mechanisms. See Architecture Patterns anti-pattern note on manifest diffing.

2. **Exact naming of the trivial leaf module (D-14)**
   - What we know: it must be pure, trivial, and imported once by `src/main.js`.
   - What's unclear: filename/export shape — explicitly deferred to Claude's Discretion in CONTEXT.md.
   - Recommendation: something self-documenting about the *contract itself* rather than a placeholder name, e.g. `src/module-contract.js` exporting a single constant — keeps its purpose obvious to whoever reads it during Phase 8 without implying it's real game code.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | ESM harnesses, `load_engine.js`, `determinism_baseline.js` | ✓ `[VERIFIED: direct tool execution]` | v25.9.0 | — |
| npm | `npm start` alias (D-19/D-20) | ✓ `[VERIFIED: direct tool execution]` | 11.12.1 | — |
| python3 | Canonical dev server (D-19) | ✓ `[VERIFIED: direct tool execution]` | 3.9.6 | — |
| git | Committing fixtures (D-08) | assumed present (repo is a git checkout) | — | — |

**Missing dependencies with no fallback:** none.
**Missing dependencies with fallback:** none — every dependency this phase needs is already present in the dev environment.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (no Jest/Vitest/Mocha) — Node scripts with manual assertions and `process.exit` codes, per existing project convention (`.planning/codebase/TESTING.md`) |
| Config file | none — see Wave 0 |
| Quick run command | `node scripts/determinism_baseline.js --verify` |
| Full suite command | `node scripts/determinism_baseline.js --verify && node scripts/dlog_replay_test.js && node scripts/real_game_test.js` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | `src/main.js` imports identically under Node with no DOM/Firebase present | smoke | `node --input-type=module -e "import('./src/main.js')"` | ❌ Wave 0 (new file) |
| FOUND-02 | Game loads and plays from `python3 -m http.server` via module entry | manual + smoke | Chrome MCP page load + console check; `curl -sI http://localhost:8000/src/main.js` for MIME sanity | ❌ Wave 0 (no server-driven smoke test exists yet) |
| FOUND-03 | Firebase classic tags execute before the module entry, no init race | smoke (browser-only) | Chrome MCP: assert `window.__pp_module_ok === true` and no console errors | ❌ Wave 0 (marker doesn't exist yet) |
| FOUND-04 | Golden corpus captured, committed, verifiable | unit + integration | `node scripts/determinism_baseline.js --capture` then `--verify`, exit 0 | ❌ Wave 0 (tool doesn't exist yet) |
| FOUND-05 | Contract documented | manual (doc review) | n/a — presence/content check of `docs/MODULES.md` and README pointer | ❌ Wave 0 (doc doesn't exist yet) |

### Sampling Rate
- **Per task commit:** `node scripts/determinism_baseline.js --verify` (once it exists) or the equivalent pre-existing harness for any commit before it lands
- **Per wave merge:** full suite command above, plus one Chrome MCP page-load check
- **Phase gate:** full suite green + Chrome MCP solo-game playthrough (D-21b) before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `scripts/lib/load_engine.js` — the shared extraction seam; nothing currently exists at this path
- [ ] `scripts/determinism_baseline.js` — the capture/verify tool itself
- [ ] `scripts/fixtures/determinism/` — directory doesn't exist yet; first `--capture` run creates it
- [ ] `src/main.js` + trivial leaf module — do not exist yet
- [ ] `docs/MODULES.md` — does not exist yet
- [ ] Framework install: none — this phase's "framework" is the tool it builds; no external test framework to install

*(This phase's own deliverables ARE the Wave 0 gap-fillers — there is no pre-existing test infrastructure to inherit.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | Phase touches no auth surface |
| V3 Session Management | No | Phase touches no session/multiplayer state |
| V4 Access Control | No | No new access-controlled resource |
| V5 Input Validation | Marginal | `determinism_baseline.js --capture`/`--verify` CLI flag parsing — trust `process.argv`, no untrusted external input; low risk, standard `if (arg === "--capture")` style checks are sufficient, no parsing library needed |
| V6 Cryptography | Marginal | SHA-256 via `node:crypto` is used for fixture integrity, not for any security boundary (not a password hash, not a signature) — standard library use is appropriate and sufficient |

### Known Threat Patterns for this stack
No new attack surface is introduced by this phase: no new user input path, no new network endpoint, no new persisted user data. The one production-facing change (`index.html` gaining a `<script type="module">` tag) does not add any new trust boundary — it loads a same-origin, git-committed file, no different in risk profile than the existing inline `<script>` block.

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| N/A — no new trust boundary | — | — |

## Sources

### Primary (HIGH confidence — direct tool verification against this project's own environment/infrastructure)
- `node --version`, `npm --version`, `python3 --version` — dev environment versions confirmed
- `node scripts/*.js` reproduction of the `require()`-under-`"type":"module"` `ReferenceError`, and the `.cjs`-extension fix, in a scratch directory
- `node -e "await import(...)"` from a `.cjs` file — confirmed dynamic `import()` interop works
- `node --input-type=module -e` with `node:vm`, `import.meta.url`/`fileURLToPath`, top-level `await` — confirmed all work together
- `node -e "window.foo=true"` (both CJS and ESM eval) — confirmed `window` is undefined under Node
- `python3 -m http.server` + `curl -sI` against a real project file — confirmed `Content-type: text/javascript`
- `curl -sI https://playpastrypirates.com/scripts/battle_sim.js` — confirmed live production GitHub Pages MIME type `application/javascript; charset=utf-8`
- `grep -c "<script>" index.html` — confirmed exactly one bare `<script>` tag exists (the region the harnesses extract)
- `grep` across all repo `.js` files for `require(`/`module.exports` — confirmed only `real_game_test.js` and `dlog_replay_test.js` are CJS; `battle_sim.js` is clean

### Secondary (MEDIUM confidence — official documentation, fetched directly)
- [Node.js Modules: Packages docs](https://nodejs.org/api/packages.html) `[CITED]` — nearest-parent `package.json` resolution, `.cjs`/`.mjs` extension override behavior, per-directory `type` override
- [MDN `<script>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) `[CITED]` — module scripts defer by default, document-order execution guarantee for deferred/module scripts, classic non-deferred scripts execute immediately and block parsing

### Tertiary (LOW confidence — WebSearch summaries, not fetched from an official source; see Assumptions Log A1)
- WebSearch results on Safari-specific module-loading quirks (silent skip on MIME/CORS mismatch, strict extension resolution) — community blog posts and GitHub gists, no official WebKit/Apple citation obtained
- WebSearch results on JSON.stringify key-ordering guarantees — used only to confirm this project's event-object shape (string keys only, no integer-like keys, no floats) sidesteps the known ordering/precision footguns; verified against actual event-construction code in `index.html` (`this.ev({t:...})` call sites), not just the search summary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, all findings are platform-primitive behavior verified directly against this repo's own Node/Python/GitHub Pages infrastructure
- Architecture: HIGH — the module-loading order and the `load_engine.js` seam design are both grounded in either official docs (MDN, Node.js) or direct reproduction in this environment
- Pitfalls: HIGH for Pitfalls 1–2 (both reproduced directly with exact error text); MEDIUM for Pitfalls 3–4 (design reasoning grounded in CONTEXT.md's own stated risks, not independently reproduced since the tooling doesn't exist yet)

**Research date:** 2026-07-24
**Valid until:** Stable — this phase's findings are platform-primitive (Node ESM semantics, HTML script-execution order, this project's own server responses) rather than fast-moving library APIs; safe to treat as valid for the remainder of the v1.1 milestone (Phases 8–12) without re-verification, with the exception of A1 (Safari specifics), which is already covered by the milestone's planned Phase 12 manual Safari verification.
