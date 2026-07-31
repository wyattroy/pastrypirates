# Phase 8: Engine Extraction & Node Harness Migration - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Autonomous (smart discuss — user delegated all design decisions for this milestone; recorded explicitly rather than left to discretion)

<domain>
## Phase Boundary

Move the deterministic engine out of the `index.html` monolith into real ES modules, and retire the `vm`/string-slice extraction the Node harnesses use today — with seeded output byte-for-byte identical to the Phase 7 golden corpus.

This is the critical path of the milestone. Everything before it was scaffolding; everything after depends on the engine being a clean, importable, DOM-free module.

In scope: shared constants and pure helpers into leaf modules (SPLIT-02), the Game class / `roundCfg` / bot strategies / RNG / replay into engine module(s) (SPLIT-01), the 3 asset/DOM bootstrapping touches relocated out (ENGINE-01), harness migration onto native imports (ENGINE-02), byte-for-byte proof (ENGINE-03), order-load-bearing constants annotated (ENGINE-04).

Out of scope, deliberately: UI rendering extraction (Phase 11), Firebase/networking extraction (Phase 9), de-globalization of the 40+ globals (Phase 10), removal of any temporary bridge (Phase 11).

</domain>

<decisions>
## Implementation Decisions

### The one rule that outranks everything else

- **D-01 (absolute):** **Never run `scripts/determinism_baseline.js --capture` during this phase.** Not once, not "to refresh", not to fix a mismatch. The corpus captured in Phase 7 is the oracle; re-capturing silently redefines the oracle as "whatever the moved code now does" and makes ENGINE-03 vacuously true. If `--verify` goes red, the code is wrong — not the fixture. This is the single failure mode that would quietly void the entire milestone's safety net. — **Reversibility:** one-way — a re-captured corpus cannot be distinguished from a correct one after the fact.
- **D-02:** The per-seed `sha256` values in `manifest.json` are **frozen**. The only manifest field this phase may legitimately change is `engineSourceHash`, because the engine source genuinely relocates out of `index.html`. That re-base must be an explicit, separately-committed, clearly-messaged step — never folded into a code-motion commit where it would look like noise.

### Module layout

- **D-03:** Engine modules live under `src/engine/`. Leaf modules with no engine dependency live under `src/shared/`. This continues the `src/` convention Phase 7 established (D-13 there) and gives Phases 9–11 obvious homes (`src/net/`, `src/ui/`).
- **D-04:** Split along dependency depth, not file size — leaves first: RNG, pure math/array helpers, constants, then the Game class on top. Concretely: `mulberry32` (`index.html:862`), `man`/`shuffle`/`flip`, the ingredient and direction constant tables, then `Game`/`roundCfg`/bot strategies. Exact file boundaries are the planner's call within this shape.
- **D-05:** Image-path maps (`ING_IMG` `:872`, `EMOJI_IMG` `:928`, `BOAT_IMG` `:961`, and siblings) are **pure string data** and belong in a shared leaf module, per ROADMAP criterion 1 which names "image maps" explicitly. They are safe for the engine to import because they contain no DOM access. What is *not* safe is *applying* them to the DOM — see D-06.

### Engine purity (ENGINE-01)

- **D-06:** Exactly three impurities sit inside the engine region and must move out to a UI bootstrap. Verified line numbers on the current tree:
  - `index.html:920` — `document.documentElement.style.setProperty("--clock-img", …)`
  - `index.html:922` — `document.documentElement.style.setProperty("--flip-socket-img", …)`
  - `index.html:1002` — `document.body.innerHTML = emojify(document.body.innerHTML)`
- **D-07:** `const $=id=>document.getElementById(id)` at `index.html:1812` is **not** one of the three. It sits at the tail of the extraction region purely because the region boundary is the `escHtml` marker at `:1827`. It is a UI helper and stays with the UI. Do not drag it into the engine module.
- **D-08:** After extraction the engine module must contain zero `document`, `window`, `firebase`, `localStorage`, `Date.now`, or `Math.random` references. This is mechanically checkable with a grep and must be an acceptance criterion, not an aspiration. `Math.random` in particular: all randomness routes through `this.r()` (seeded mulberry32) — a stray `Math.random` would be a determinism bug that the corpus might not catch on 30 seeds.

### Order-load-bearing constants (ENGINE-04)

- **D-09:** `DIRS` (`:1003`), `DIRNAME` (`:1004`), `PERP` (`:1006`), `STORM_DIAG` (`:1008`), and `OPPOSITE` (`:1013`) move **verbatim**, with key order preserved exactly, each annotated `// ORDER IS LOAD-BEARING — iteration order feeds this.r(); reordering changes the RNG sequence`. STATE.md records object-key reordering during code motion as the top risk of this milestone.
- **D-10:** The same annotation applies to any other object literal whose iteration order reaches `this.r()`. Finding them all is a research task, not an assumption — the planner must be given a list, not a warning.

### Harness migration (ENGINE-02)

- **D-11:** `scripts/lib/load_engine.js` is the single seam Phase 7 built for exactly this moment (Phase 7 D-12). Its body flips from `vm`/string-slice extraction to a native `import`, and **nothing else about the harnesses changes**. If this turns into a three-file edit, Phase 7's seam failed and that is worth noticing out loud.
- **D-12:** The engine extraction and the harness migration land in **one commit**, per ROADMAP criterion 3. A commit where the engine has moved but the harnesses still string-slice `index.html` is a commit with a broken test suite.
- **D-13:** `loadEngine()` keeps its current signature and still returns `{ Game, roundCfg, sourceHash }`. Callers do not change. `sourceHash` now derives from the module sources rather than the HTML region — see D-02.

### The bridge and script-ordering problem

- **D-14 (the central design question — resolve in research, do not guess):** The inline script at `index.html:859` is a **classic** script; module scripts are always deferred. Once the engine lives in a module, the classic UI/networking code that references `Game`, `roundCfg`, `DIRS`, … executes *before* the module has run. Something must bridge that gap.

  The milestone already anticipates this: ROADMAP Phase 10 names an "explicit, documented `window.PP` bridge" and Phase 11 removes it. So a bridge is the sanctioned mechanism, not a hack. What is **not** yet decided is the initialization ordering — most likely candidate is inverting control so the module, after populating the bridge, triggers the existing `boot()` rather than the classic script self-starting. Research must confirm against the real `boot()` call site and the actual set of engine symbols the classic region references.

  Constraint on whatever is chosen: it must be **temporary and named**, so Phase 11's bridge-removal grep finds every last reference.
- **D-15:** The bridge is a Phase 8 necessity, not a Phase 10 land-grab. Introduce the minimum surface needed to keep the game running; do not pre-emptively migrate the other 40+ globals — that is Phase 10's scope and doing it here would blur a phase boundary and inflate this phase's blast radius.

### Verification

- **D-16:** `node scripts/determinism_baseline.js --verify` green across all 30 seeds is the phase's primary gate, and it must pass **without** re-capture (D-01).
- **D-17:** `window.__pp_module_ok` must still be `true` in a browser after this phase, and the game must still load and play. The corpus proves engine behavior; it cannot prove the page still boots — the same blind spot D-21 called out in Phase 7. A browser check is required at this phase boundary too.
- **D-18:** Safari re-verification is **not** required at this phase boundary. ROADMAP schedules it at Phase 11 (UI extraction, where storm rendering could regress) and Phase 12 (final). Phase 8 does not touch rendering. Chrome is sufficient here; do not burn Wyatt's attention on a Safari pass that the roadmap does not ask for.

### Claude's Discretion

- Exact file split within `src/engine/` and `src/shared/` — how many modules, and where the line between them falls.
- Export style (named vs default) and whether constants are re-exported through a barrel module.
- The bridge's exact name and shape, subject to D-14's "temporary and named" constraint.
- Commit granularity within the phase, subject to D-12 (extraction + harness migration together) and D-02 (source-hash re-base separate).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase scope
- `.planning/ROADMAP.md` §Phase 8 — goal and the 5 success criteria
- `.planning/REQUIREMENTS.md` — SPLIT-01, SPLIT-02, ENGINE-01…04, plus the **Out of Scope** table (notably: *no renaming or style normalization during code motion* — it obscures byte-for-byte diffs)
- `.planning/STATE.md` §Blockers/Concerns — RNG/iteration-order desync is recorded as the top milestone risk and it lands squarely in this phase

### What Phase 7 built that this phase consumes
- `.planning/phases/07-foundation-determinism-baseline/07-CONTEXT.md` — D-12 (the `load_engine.js` seam, built for this moment), D-01/D-02 (corpus format)
- `.planning/phases/07-foundation-determinism-baseline/07-01-SUMMARY.md` — the oracle's shape, the `--verify` comparison logic, and the documented deviation to it
- `.planning/phases/07-foundation-determinism-baseline/07-03-SUMMARY.md` — the browser tripwire (`window.__pp_module_ok`) and how to force a storm
- `scripts/lib/load_engine.js` — the one file whose body flips
- `scripts/fixtures/determinism/manifest.json` — `engineSourceHash` is the only field this phase may change
- `docs/MODULES.md` — the module-loading contract this phase must not violate

### Source anchors on the current tree
- `index.html:859` — opening `<script>` of the inline classic block (the extraction start boundary all harnesses key off)
- `index.html:1827` — `function escHtml` (the extraction end boundary)
- `index.html:862` — `mulberry32`
- `index.html:866` — `ING_ALL`
- `index.html:920`, `:922`, `:1002` — the three impurities to relocate (D-06)
- `index.html:1003`, `:1004`, `:1006`, `:1008`, `:1013` — order-load-bearing constant tables (D-09)
- `index.html:1812` — the `$` DOM helper that must NOT move (D-07)
- `index.html:5638` — the module script tag Phase 7 added

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `scripts/lib/load_engine.js` — purpose-built in Phase 7 to be the single point of change here.
- `scripts/determinism_baseline.js --verify` — the regression gate; run it after every commit in this phase, not just at the end. It reports the first divergent seed and event index, so a mid-phase red localizes the break immediately instead of at phase end.
- `window.__pp_module_ok` — the browser-side tripwire from Phase 7; catches a load-order regression at page load.

### Established Patterns
- **Deterministic RNG:** every random draw goes through `this.r()` (seeded mulberry32). Never `Math.random()` in engine code.
- **Loud failure on drift:** both harnesses throw with specific messages if their boundaries stop matching. Preserve that spirit — a harness that silently passes because it is testing the wrong thing is worse than no harness.
- **Exit codes:** new/changed tooling exits non-zero on failure.
- **No build step:** native ESM only, no bundler, no transpile.

### Integration Points
- The classic inline script region and the new engine module must coexist for this phase and the next two — the bridge (D-14) is that seam, and it is temporary by design.
- `index.html` will shrink substantially for the first time in this milestone. The extraction boundary markers (`<script>` at `:859`, `escHtml` at `:1827`) that the old harnesses relied on become irrelevant once `load_engine.js` imports natively — but confirm nothing else greps for them before removing them.

</code_context>

<specifics>
## Specific Ideas

- The Phase 7 corpus exists precisely so this phase can be attempted safely. Use it aggressively: verify after every commit, not at the end. A red `--verify` naming seed X and event index N is a 10-minute fix; discovering the break three commits later is a bisect.
- Move code **verbatim**. Resist every temptation to tidy while moving — renaming, reformatting, "while I'm here" improvements all destroy the ability to read the diff as pure motion, and REQUIREMENTS.md lists that as explicitly out of scope.
- Wyatt has delegated all design decisions for this milestone and does not want to be asked. Decide and record. The one genuine exception remains `VERIFY-04` in Phase 12, which needs a human at a Safari window.

</specifics>

<deferred>
## Deferred Ideas

- **Removing the bridge** — Phase 11, explicitly (SPLIT-06 / ROADMAP Phase 11 criterion 3).
- **De-globalizing the 40+ globals** — Phase 10 (GLOBAL-01…03). Do not start here (D-15).
- **Firebase/networking extraction** — Phase 9 (SPLIT-04, NET-01…03).
- **JSDoc typedefs for event objects** — `DX-01` in REQUIREMENTS v2. Tempting while touching the event shapes; still out of scope.
- **Extracting a pure replay-runner function** — `DX-02` in v2, to be pursued only if the replay seam surfaces bugs during this extraction. If it does surface bugs, say so rather than working around them.

</deferred>

---

*Phase: 8-Engine Extraction & Node Harness Migration*
*Context gathered: 2026-07-24*
