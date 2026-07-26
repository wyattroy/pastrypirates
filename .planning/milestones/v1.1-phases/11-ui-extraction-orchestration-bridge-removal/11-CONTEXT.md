# Phase 11: UI Extraction, Orchestration & Bridge Removal - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Autonomous (smart discuss — user delegated all design decisions for this milestone)

<domain>
## Phase Boundary

Complete the split: extract UI rendering into its own module(s), add a `main` composition root that orchestrates engine + UI + net, reduce `index.html` to markup + one module entry, prove the dependency graph acyclic, and **delete the `window.PP`/`globalThis` bridge** that Phases 8–10 relied on (SPLIT-03, SPLIT-05, SPLIT-06).

This is the finale of the refactor and the single largest, highest-risk phase. It also brings back Safari re-verification (criterion 5).

Out of scope: any engine/net/state behavior change (done 8–10), the modular Firebase SDK (v2), new features.

</domain>

<decisions>
## Implementation Decisions

### The scale, quantified (grep-verified 2026-07-24)

- **D-01:** The classic `<script>` region is `index.html:859`–`:4668` (~3,809 lines) and holds **183 top-level `function` declarations** — the entire UI rendering + orchestration + boot/lobby layer. Everything else (engine, shared, net, state) is already in `src/`. This phase moves those 183 functions into modules. That is a larger code-motion surface than any prior phase in this milestone.
- **D-02:** Major entry points confirmed at: `el` (`:1261`), `drawBoard` (`:1343`), `render` (`:1692`), `setClockUI` (`:2292`), `panel` (`:2393`), `showNarration` (`:2516`), `flash` (`:2742`), `renderBattle` (`:3029`), `showRoom` (`:4296`), `boot` (`:4622`). Research must produce the full dependency-clustered inventory.

### The bridge-removal coupling (the crux — resolve in research)

- **D-03:** The bridge (`src/main.js:62` — `const PP = { ...shared, ...engine, ...net, appState: stateNs.appState }` then `Object.assign(globalThis, PP)` at `:64`) exists for ONE reason: so the 183 classic functions can read engine/shared/net/state symbols as bare identifiers. **The bridge cannot be deleted until the last classic-script consumer is inside a module that `import`s those symbols directly.** Therefore bridge removal (criterion 3) is coupled to UI extraction (criterion 1) — they finish together, not independently.
- **D-04:** Criterion 3 demands "a grep confirming no leftover bare-global reads remain." After extraction, `Object.assign(globalThis, PP)` is deleted and a contract check asserts zero classic-script bare reads of the former bridge symbols. This must be mechanical, not eyeballed.
- **D-05 (the retained globals that must NOT break):**
  - `window.boot()` — inverted-startup entry point (`src/main.js:114`). After extraction, `main` calls the UI module's boot directly rather than via `window.boot`; confirm nothing else calls `window.boot`.
  - `revealMyRecipe` — the one inline `onclick="revealMyRecipe()"` (`index.html:1731`) resolves globally. When its definition moves into a module, EITHER expose it as one explicit, documented `window.revealMyRecipe = …` (a deliberate single retained global), OR convert the inline attribute to `addEventListener`. GLOBAL-02/03 established the "single documented mechanism" principle — honor it.
  - The 4 debug hooks (`__pp_module_ok`, `__pp_boot_count`, `__pp_net_debug`, `__pp_app_state_debug`) are intentional and survive; they are not part of the PP bridge being deleted.

### Module boundary and directional imports

- **D-06:** UI lives under `src/ui/`. The `main` composition root is `src/main.js` (expanded from its current bridge-population role into a real orchestrator).
- **D-07 (directional — criterion 1):** the UI module(s) read game state and **never import the networking layer** (`src/net/`). `main` imports engine + UI + net and wires them. The existing net→UI seam from Phase 9 is handler-injection (net publishes, UI/classic code subscribes) — preserve that direction. A UI module that imports `src/net/` fails criterion 1. Enforce with the contract-check pattern.
- **D-08:** `index.html` ends as markup + one `<script type="module" src="src/main.js">` (criterion 2). The inline classic `<script>` at `:859` is emptied/removed. This is the line count's big drop.

### Acyclic graph (SPLIT-06 / criterion 4)

- **D-09:** The dependency graph must be proven acyclic by a cycle-detection scan. ROADMAP says "madge or equivalent". Given the milestone's zero-dependency stance (no bundler, no npm deps — every prior phase kept `package.json` dependency-free), prefer a **custom equivalent** — a small `scripts/module_graph_check.js` that parses `import` statements across `src/**/*.js` and detects cycles, wired into `npm test` — over adding `madge` as a devDependency. Confirm the choice in research; if madge is genuinely simpler and a dev-only dep is acceptable, that's a legitimate alternative, but the zero-dep default holds unless research shows otherwise.

### Determinism, verification, and Safari

- **D-10:** The Phase 7 corpus stays frozen. **Never `--capture`.** `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` must stay `1`. This phase should not touch engine behavior — `--verify` green necessary, not sufficient (corpus is UI-blind).
- **D-11:** After extraction: `npm test` green (determinism + all contract checks + the new module-graph check), a full solo game and a two-tab multiplayer game playable in Chrome with clean console, and the `window.PP` bridge provably gone.
- **D-12 (Safari — criterion 5, the one genuine human step):** storm rendering must re-verify cleanly on Safari after UI extraction. This is where the v1.0 Safari storm-crash risk (BUG-01) could resurface, since UI rendering structure changes here. **This is Wyatt's step — no automation can drive Safari.** Use the forced-storm procedure from `07-03-SUMMARY.md` (`appState.game.cfg.storm = 1; rollStorm = …`, note the render-only-guest caveat). This is distinct from Phase 12's final Safari pass (VERIFY-04) but shares the method.
- **D-13:** Fold in the filed cleanup if convenient: `watchRoom()` is invoked more than once per lifecycle, so the Phase 9 registry guard logs ERROR-level "duplicate attach refused" on a normal guest join (task_d0eb2bd6). Making `watchRoom()` idempotent fits naturally when its call sites move into the orchestrator. Optional, not required by any criterion.

### Claude's Discretion

- The `src/ui/` internal file split (one module vs several — render/board/modals/narration/lobby).
- The cycle-detection tool's exact shape (custom vs madge), within D-09's zero-dep preference.
- The extraction ordering/clustering of the 183 functions (research produces the dependency clusters).
- Whether `revealMyRecipe` becomes a retained global or an `addEventListener` migration (D-05).
- Commit granularity, subject to D-10 (never `--capture`) and verify-after-every-commit.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` §Phase 11 — 5 criteria (UI hint: yes)
- `.planning/REQUIREMENTS.md` — SPLIT-03/05/06, Out of Scope
- `.planning/phases/10-app-state-de-globalization/10-VERIFICATION.md` — the `appState` mechanism, the 4 debug hooks, render-only-guest note
- `.planning/phases/07-foundation-determinism-baseline/07-03-SUMMARY.md` — the forced-storm Safari procedure
- `docs/MODULES.md` — bridge, startup order, PP-BRIDGE conventions (this phase deletes the bridge and must update the doc)
- `scripts/engine_contract_check.js`, `scripts/net_contract_check.js`, `scripts/state_contract_check.js` — the standing-gate pattern; the `://` false-negative caveat
- `src/main.js` — the bridge population + inverted `boot()` to be transformed into a real orchestrator
- MEMORY `project_mp_test_harness` — two-tab setup, `pp_id` gotcha, stale-server port trap

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The contract-check pattern (4 checks exist) — a `module_graph_check.js` + a bridge-removal assertion mirror it.
- The Phase 9 two-tab harness + Phase 10's browser-verification approach (drive real handler elements via `dispatchEvent(new MouseEvent(...))`, read the rendered panel on guests).
- `window.__pp_app_state_debug` / `__pp_net_debug` — survive; the debug surface for verification.

### Established Patterns
- Host authority; `replaying` guard; guests render-only (local `game` stale — read rendered panel).
- Deterministic RNG + replay; plain property access on `appState`.
- Directional net→UI handler injection (net publishes, UI subscribes) — preserve for criterion 1.
- Zero dependencies; native ESM; no build step.

### Integration Points
- All 183 classic functions read engine/shared/net/state via the bridge today. Extraction replaces bare reads with `import`s as functions move — the same "move + rewire references" shape as Phase 8's engine extraction, but far larger and DOM-coupled.
- `boot()` is the startup seam; `main` becomes the orchestrator that wires engine + UI + net and starts the app.
- The one inline `onclick` (`revealMyRecipe`) and `window.boot` are the only bare-global reachability the bridge deletion must consciously preserve.

</code_context>

<specifics>
## Specific Ideas

- Bridge deletion is the highest-risk single operation in the milestone: a missed bare-global read fails silently (a `ReferenceError` only when that code path runs, which the corpus never exercises). The mechanical bridge-removal grep + a full solo AND two-tab Chrome click-through are the real gates — not `--verify` alone.
- The corpus is UI-blind; it proves the engine still computes identically, nothing about whether the page renders. Every prior UI-touching boundary (Phases 7, 8-browser, 10-browser) needed a live browser check. This one most of all.
- This phase is genuinely large (183 functions, ~3,800 lines, plus bridge deletion). It likely wants several sequential waves clustered by dependency, each gated. Plan for depth.
- Wyatt delegated design decisions for this milestone; the one genuine human step is Safari (D-12 here, and VERIFY-04 in Phase 12).

</specifics>

<deferred>
## Deferred Ideas

- **Final full Safari + Chrome playtest across the whole game** — Phase 12 VERIFY-04 (this phase's D-12 is scoped to storm rendering at the UI-extraction boundary).
- **Modular Firebase SDK** — v2 (NETMOD-01).
- **JSDoc typedefs / further UI decomposition** — v2 polish, out of scope for the structural pass.

</deferred>

---

*Phase: 11-UI Extraction, Orchestration & Bridge Removal*
*Context gathered: 2026-07-24*
