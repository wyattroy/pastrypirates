# Phase 7: Foundation & Determinism Baseline - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Autonomous (smart discuss — user delegated all design decisions; recorded here explicitly rather than left to discretion)

<domain>
## Phase Boundary

Establish two things before any game code moves:

1. **The contract** — a zero-build ES module loading setup that works identically in the browser and in Node: root `package.json` with `"type": "module"`, a `<script type="module">` entry point in `index.html`, Firebase compat v12.15.0 left as classic scripts ahead of it, and the whole arrangement documented.
2. **The oracle** — a seeded golden-fixture corpus captured from the *pre-refactor* monolith, which every later phase diffs against to prove it changed no behavior.

`index.html` ends this phase still a ~5,639-line monolith. The giant inline `<script>` at `index.html:859` is not touched beyond the file gaining one new `<script type="module">` tag. No gameplay changes. No code motion — that starts in Phase 8.

</domain>

<decisions>
## Implementation Decisions

### Golden-fixture corpus shape

- **D-01:** The oracle captures **the full per-seed event log**, not aggregate statistics. Today's `scripts/real_game_test.js` reports converged averages (win rates, avg flips) — those are stable across a determinism break and would hide exactly the regression this corpus exists to catch. — **Reversibility:** one-way in practice — later phases diff against this format, so changing it mid-milestone invalidates the baseline.
- **D-02:** Capture **both** a full event stream per seed **and** a SHA-256 digest per seed in a manifest. The digest gives fast unambiguous pass/fail; the full stream gives diagnosability. A hash alone tells you "Phase 9 broke determinism" and nothing about where — and RNG/iteration-order desync is the top recorded risk in STATE.md, so knowing *which event* first diverged is the difference between a 10-minute fix and a day of bisecting.
- **D-03:** **30 seeds**, `12345`–`12374`, reusing the existing `SEED_BASE = 12345` convention from `real_game_test.js`. Bot strategies rotate across the 5 personalities per the established `BOT_STRATS[(i + s) % 5]` pattern so seeds cover varied 4-player compositions. 30 games reach every mechanic many times over while keeping the committed corpus under ~1 MB.
- **D-04:** The capture tool **asserts mechanic coverage** and fails if the corpus does not exercise every event type (`battle`, `trade`, `dock`, `fish`, storm/wind, run-aground, endgame). A corpus that silently under-covers is worse than no corpus — it produces green runs that prove nothing.
- **D-05:** Final game state (positions, ingredients, coins, winner) is captured alongside the event stream per seed. Events prove the path; final state proves the destination.

### Fixture storage & check tool

- **D-06:** Fixtures live in **`scripts/fixtures/determinism/`** — no new root-level directory. `scripts/` is already the established home for test machinery per `.planning/codebase/TESTING.md`; keeping the surface small beats taxonomy purity.
- **D-07:** Format is **`seed-<N>.jsonl`** — one event per line — plus a single **`manifest.json`** (seed list, config used, per-seed SHA-256, coverage summary, engine-source hash). JSON Lines because a git diff then points at the exact divergent event; pretty-printed JSON is larger and diffs worse.
- **D-08:** Fixtures are **committed to git**. An oracle that gets regenerated is not an oracle. Immutable and reviewable in diffs is the entire value.
- **D-09:** One tool — **`scripts/determinism_baseline.js`** with `--capture` and `--verify` (default `--verify`). A single file keeps the game-running logic shared, so the capture path and the check path cannot drift apart. **Exits 0/1** so it is CI-able, matching the exit-code convention `dlog_replay_test.js` already set.
- **D-10:** On mismatch, print the **first divergent seed and event index** with a compact before/after of that event. Fail loud and specific, in the spirit of v1.0's D-07 ("never silently hand back a board that looks reset").
- **D-11:** The manifest records a **hash of the engine source region**, so "fixtures are stale" is distinguishable from "engine behavior changed."
- **D-12 (structural, load-bearing for Phase 8):** All engine loading goes through **one indirection — `scripts/lib/load_engine.js`**. In Phase 7 that helper performs today's `vm` + string-slice extraction of `index.html`; in Phase 8 its body becomes a native `import` and *nothing else changes*. `determinism_baseline.js`, `real_game_test.js`, and `dlog_replay_test.js` all route through it. This turns ENGINE-02 from a three-file edit into a one-file edit. — **Reversibility:** reversible — it is an internal test helper with no production surface.

### Module entry & Firebase order

- **D-13:** New modules live under **`src/`**. Phases 8–11 inherit this: `src/engine/`, `src/ui/`, `src/net/`, `src/main.js`.
- **D-14:** Phase 7 ships a deliberately **minimal proof-of-contract**: `src/main.js` (the module entry) importing one trivial leaf module. It does **not** pre-empt `SPLIT-02`'s shared-constants module — that is Phase 8's work and creating it here would blur the phase boundary.
- **D-15:** The module entry sets a marker (`window.__pp_module_ok = true`) so the browser-side contract is machine-checkable from a Chrome MCP session, not just eyeballed.
- **D-16:** Load order in `index.html` is: Firebase compat classic tags (`index.html:25-26`, unmoved) → the existing inline classic `<script>` (`index.html:859`, untouched) → the new `<script type="module">` appended last. Module scripts are always deferred, so the module executes after DOM parse and after both classic scripts — which is exactly what FOUND-03 requires and guarantees the `firebase` global exists before any module code could want it.
- **D-17:** `src/main.js` **asserts `typeof firebase !== "undefined"`** and logs an explicit error if not. A cheap standing tripwire that catches an ordering regression in Phases 8–11 at page load rather than in a multiplayer lobby.
- **D-18:** `boot()` and all existing initialization timing are **unchanged** this phase. The module adds nothing to the boot path.

### Dev server & proof of parity

- **D-19:** Canonical local server is **`python3 -m http.server 8000`** — already present on macOS, zero install, no npm dependency. An `npm start` alias is added for discoverability, but the documented no-dependency path is python3.
- **D-20:** `package.json` is **`"private": true`** with `"type": "module"` and scripts `start`, `test`, `test:determinism`. Private because this is never published to npm — it exists to declare module semantics and hold script aliases. Adding it does not affect GitHub Pages, which serves static files and ignores it.
- **D-21:** Criterion 5 ("solo game behaviorally identical to `main`") is proven in **two parts**, because the fixture corpus alone cannot prove it. The corpus runs headless in Node against an engine that has not moved — it would pass even if the `index.html` edit broke page load entirely. So: **(a)** capture the corpus on a clean tree *before* the `index.html` edit, then re-verify green after; **(b)** load the page over HTTP and play a solo game via Chrome MCP, confirming a clean console and `window.__pp_module_ok === true`. The real risk this phase carries is the HTML edit, and only (b) covers it.
- **D-22:** The contract doc lives at **`docs/MODULES.md`** with a short pointer from `README.md`. It states: HTTP server required, `file://` unsupported and why, `.js` MIME expectations for production hosts, the classic-before-module load order rule, and the `src/` layout Phases 8–11 will fill in.

### Claude's Discretion

- Exact `src/` leaf-module filename and the marker constant's shape.
- Whether `scripts/lib/load_engine.js` exposes one function or a small object, and its error-message wording on extraction drift (must still throw loudly per the existing harness convention).
- Precise JSON field ordering inside manifest.json and the event-line serialization details, provided they are stable and deterministic across runs.
- Whether `.gitignore` gains a defensive `node_modules/` entry (no dependencies exist yet).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope and requirements
- `.planning/ROADMAP.md` §Phase 7 — goal and the five success criteria
- `.planning/REQUIREMENTS.md` — FOUND-01 … FOUND-05, plus the **Out of Scope** table (no bundler, no TypeScript, no `file://` support, no modular Firebase SDK, no renaming during code motion)
- `.planning/PROJECT.md` — core value and the "determinism must stay intact" constraint
- `.planning/STATE.md` §Blockers/Concerns — the four recorded risks, two of which are this phase's direct responsibility (module-defer vs Firebase classic ordering; the golden baseline itself)

### Existing test machinery this phase extends
- `scripts/real_game_test.js` — the `vm` + string-slice extraction pattern (`:27`), sandbox shape, `SEED_BASE`/`BOT_STRATS` conventions
- `scripts/dlog_replay_test.js` — the sentinel-region extraction (`:46-47`), loud-failure-on-drift convention, and the `process.exit(failures === 0 ? 0 : 1)` contract
- `.planning/codebase/TESTING.md` — documents that today's harness output is aggregate statistics, which is precisely why D-01 exists

### Source anchors
- `index.html:25-26` — Firebase compat v12.15.0 classic script tags (must stay classic, must stay first)
- `index.html:859` — opening `<script>` of the monolithic inline block, runs to `:5637` (untouched this phase)
- `index.html:4859` — `firebaseConfig` object
- `index.html:4919` — `firebase.initializeApp()` call site

### Prior-milestone precedent
- `.planning/milestones/v1.0-phases/01-critical-bug-fixes/01-CONTEXT.md` — establishes the fail-loud-never-silent convention (D-07 there) that D-10 continues here

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SEED_BASE = 12345` and `BOT_STRATS = ["pirate","trader","balanced","rusher","monopolist"]` — existing seeding and rotation conventions in `real_game_test.js`, reused directly by D-03.
- `new Game(cfg, seed, record)` — the third argument enables `Game.ev()` accumulation into `game.events`. Without it the event array stays empty; `dlog_replay_test.js:103` documents this exact gotcha.
- `roundCfg(strategies)` — builds the game config object from a strategy list.
- The `vm.createContext` sandbox shape in both harnesses (minimal `document` stub with `documentElement.style.setProperty()` no-op) — the engine's 3 DOM/asset bootstrapping touches need it until Phase 8 relocates them.

### Established Patterns
- **Loud failure on extraction drift:** both harnesses throw with a specific message if their slice boundaries stop matching. A harness that silently passes because its boundaries moved is worse than no harness (`dlog_replay_test.js:17-18`).
- **Deterministic RNG:** all randomness routes through `this.r()` (mulberry32, seeded). Never `Math.random()`.
- **Exit codes:** `dlog_replay_test.js` exits non-zero on failure; `real_game_test.js` only prints. New tooling follows the former.
- **No build step:** everything is served as-is from the repo root; `assets/` paths are relative.

### Integration Points
- `index.html` gains exactly one new line (the module `<script>` tag) — the smallest possible production-surface change, and the only part of this phase that can break the live game.
- `scripts/lib/load_engine.js` (new, D-12) becomes the single seam that Phase 8 flips from string-extraction to native import; both existing harnesses migrate onto it in this phase so Phase 8 inherits one call site instead of three.
- `package.json` at repo root is new — verify it does not disturb GitHub Pages serving from the same root (it does not; Pages ignores it).

</code_context>

<specifics>
## Specific Ideas

- The single most consequential decision in this phase is D-01/D-02. Every later phase's "did we break it?" answer is only as good as this corpus. Under-building it here silently weakens Phases 8–12.
- Capture order matters and is easy to get wrong: the baseline must be captured from the tree **before** `index.html` is edited, otherwise the oracle encodes the change it is supposed to be validating against.
- Wyatt has delegated all design decisions for this milestone and does not want to be asked. Downstream agents should decide and record, not defer — the one genuine exception is `VERIFY-04` in Phase 12, which requires a human at a Safari window.

</specifics>

<deferred>
## Deferred Ideas

- **Moving test machinery to a `tests/` directory** — deliberately not done (D-06). Revisit only if `scripts/` becomes unwieldy after the milestone.
- **Trimming the corpus if it outgrows ~1 MB** — 30 seeds is the chosen balance (D-03). If Phase 8 finds the corpus slow or bulky, reducing seed count is safe; changing the *format* is not.
- **Extracting a pure replay-runner function** — already tracked as `DX-02` in REQUIREMENTS.md v2, to be pursued only if the replay seam surfaces bugs during extraction.
- **JSDoc typedefs for event objects** — tracked as `DX-01` in v2. Would make the event-log format self-documenting, but is out of scope for a structural pass.

</deferred>

---

*Phase: 7-Foundation & Determinism Baseline*
*Context gathered: 2026-07-24*
