# Phase 11 Research — UI Extraction, Orchestration & Bridge Removal

**Researched:** 2026-07-24
**Confidence:** HIGH (grounded in deterministic static analysis of the live `index.html`, not estimation)
**Method note:** The heavy analysis (183-function call graph, net-call sites, DOM coupling, tier split) was produced by a static analyzer built on the project's own `scripts/lib/js_region_tokenizer.js` (string/comment-masked, so no false positives from prose/URLs). The raw data lives in the phase scratchpad `analysis.json`. This replaces a first research attempt that stalled trying to do the same analysis in-context — the lesson carried into the Validation Architecture below is to make this a committed, re-runnable script.

## User Constraints (from CONTEXT.md)

Locked D-01…D-13. Not re-litigated. This document answers HOW, grounded in measured facts.

## Phase Requirements

SPLIT-03 (UI in its own module, never imports net), SPLIT-05 (`main` orchestrator + `index.html` reduced to markup + one module entry), SPLIT-06 (acyclic graph, cycle-detection scan).

---

## Summary — the measured shape of the phase

The classic `<script>` (`index.html:859`–`:4668`) holds exactly **183 top-level function declarations**. Static analysis splits them cleanly into three tiers:

| Tier | Count | LOC | Destination | Basis |
|------|-------|-----|-------------|-------|
| **Orchestration** — call `net*` directly | 44 | ~861 | `main` (or the injected seam) | these are the criterion-1 constraint: UI must NOT import net |
| **UI** — touch the DOM, net-free | 44 | ~968 | `src/ui/` | pure rendering |
| **Helper/logic** — net-free, DOM-free | 95 | ~1,152 | `src/ui/` (or `src/shared/` if truly pure) | game-flow + utility |

The coupling between tiers is small and well-defined: **only 6 UI(DOM) functions call an orchestration function**, and they are the entire criterion-1 seam (see Q1b). This is the single most important finding — the UI/net boundary is not a tangle; it is six named edges.

---

## Q1 — Bridge-removal coupling + extraction ordering (the crux)

### Q1a — Dependency-clustered inventory

The 44 **orchestration** functions (call `net*` directly) — these decide the phase and belong in `main`/the seam, NOT `src/ui/`:

`broadcastFlip, watchFlip, broadcastClock, toggleTimer, watchTimer, expireShotClock, watchClock, netNarrate, netBroadcast, sendChat, watchChat, renderBattle, watchBattle, asyncBattle, recipeDraftNet, runLiveNet, liveResolveEndNet, writeMeta, writeGameLog, watchPresence, fbInit, logDecision, setRecoveryState, watchRecoveryState, pushEvents, remotePrompt, sendResponse, remoteDraftPrompt, watchDraftPrompt, watchEvents, watchPrompt, watchNarr, applyEndMeta, createRoom, joinRoom, watchRoom, startGame, beginGame, watchTurnOrder, watchRecipes, leaveGame, wireLobby, resumeHostGame, boot`

These cluster into: **flip/clock/timer sync**, **battle sync**, **narration/chat broadcast**, **room lifecycle** (createRoom/joinRoom/watchRoom/startGame/beginGame/leaveGame), **prompt/response** (remotePrompt/sendResponse/remoteDraftPrompt/watch*), **recovery/replay** (setRecoveryState/resumeHostGame/logDecision/pushEvents), **turn-flow orchestration** (runLiveNet), and **boot**.

The **UI (DOM) render cluster** (net-free, → `src/ui/`): `drawBoard`(153L), `render`(113L), `buildStormLayers`, `renderLog`, `liveRender`, `panel`, `resizePanel`, `typewriterReveal`(43L), `flash`, `renderDecorativeBoard`, `renderSeatList`, `setClockUI`(86L), `el`, plus modals and board helpers.

The **game-flow helpers** (net-free, DOM-free, → `src/ui/` or a `src/flow/` sibling): `humanTrade`(127L), `botTurn`(75L), `humanAct`(60L), `windLeg`(58L), `humanTurn`(57L), plus the ~90 smaller pure helpers.

### Q1b — UI vs orchestration split (criterion 1)

Criterion 1: the UI module must **never import `src/net/`**. Measured: **only 6 UI(DOM) functions call an orchestration/net function** — the complete seam:

| UI function | calls (orchestration) | resolution |
|-------------|----------------------|------------|
| `liveRender` | `pushEvents` | inject a `onEvents` handler |
| `flash` | `netNarrate` | inject a `broadcast` handler |
| `remotePickHighlights` | `sendResponse` | inject a `respond` handler |
| `battleAsk` | `netBroadcast`, `renderBattle`, `remotePrompt`, `logDecision` | orchestration-heavy — likely belongs in `main`/flow, not `src/ui/` |
| `endReplay` | `setRecoveryState` | inject a `recovery` handler |
| `wireRestoreFail` | `setRecoveryState`, `leaveGame` | inject handlers |

**Recommendation:** apply the same **handler-injection** pattern Phase 9 already established (net publishes, UI subscribes; the callback body stays in the classic/UI layer and is passed in). These 6 UI functions receive their net-adjacent operations as injected callbacks from `main`, so `src/ui/` imports nothing from `src/net/`. `battleAsk` is the one genuinely orchestration-flavored function — classify it as orchestration (main/flow), not pure UI.

### Q1c — Extraction mechanism (verbatim + import-rewiring)

This is **not** the Phase-10 identifier-qualification transform (`x`→`appState.x`). It is **code motion + import rewiring**: move a cluster of functions into a module file verbatim, then add `import { … } from "…"` for the engine/shared/state/net symbols and sibling functions they reference. The bare-identifier reads that the bridge currently satisfies become explicit imports.

- **Verbatim motion is provable the same way Phase 8 proved it:** a throwaway byte-diff of the moved function bodies (pre-move `index.html` slice vs post-move module content) confirms no reformatting. The Phase-8 pure-motion audit is the precedent.
- The tokenizer/`analysis.json` from this research is the map of which imports each cluster needs.

### Q1d — Strangler-fig sequence (game runnable at every commit)

**The bridge stays until the final wave.** Sequence:
1. Move UI/helper clusters into `src/ui/` **while the bridge still exists** — a moved module can `import` its dependencies AND the still-present `globalThis` bridge still satisfies any not-yet-moved classic reader. Game runs at every commit.
2. Move orchestration into `main`, wiring the injected handlers.
3. **Final wave only:** once the classic `<script>` body is empty (all 183 moved), delete `Object.assign(globalThis, PP)` and the `PP` assembly (`src/main.js:62/64`), reduce `index.html` to markup + the single `<script type="module" src="src/main.js">`, and assert zero `globalThis`-bridge reads remain.

This keeps `--verify` green and the page playable at each boundary. The bridge deletion is a single, final, mechanically-gated commit — never interleaved with code motion.

---

## Q2 — What must survive bridge deletion

### Q2a — `window.boot`
Exactly **2** references: the definition (`index.html:4309`-region `function boot()` at classic-line, abs ~`:3763`→file `:4622`) and the `window.boot()` call in `src/main.js:114`. After extraction, `main` imports the UI/boot entry and calls it directly; `window.boot` is removed. No other reader.

### Q2b — `revealMyRecipe`
Definition (`index.html:4309`): `function revealMyRecipe(){appState.recipeRevealed=true;liveRender();}` — a 1-liner that reads `appState` and calls `liveRender` (a UI function). The inline attribute (`index.html:1731`) is **generated inside a template string** (`onclick="revealMyRecipe()"`), so `addEventListener` is awkward (the button is injected via `innerHTML`). **Recommendation:** expose ONE explicit, documented retained global — `window.revealMyRecipe = revealMyRecipe` in `src/ui/` (or main) — the single deliberate retained global, documented in `docs/MODULES.md` alongside the debug hooks. This is cleaner than restructuring the template-string button generation and honors the GLOBAL-03 "single documented mechanism" principle.

### Q2c — The 4 debug hooks
`__pp_module_ok`, `__pp_boot_count`, `__pp_net_debug`, `__pp_app_state_debug` are set directly on `window` in `src/main.js` / `src/net/`, **NOT** part of the `PP` object that `Object.assign(globalThis, PP)` spreads. They survive the bridge deletion untouched. Confirmed by reading `src/main.js` — `PP = { ...shared, ...engine, ...net, appState }`; the hooks are separate `window.__pp_*` assignments.

### Q2d — Other bare-global reachability
**Static HTML markup (`index.html:1`–`858`) has ZERO inline `on*` handler attributes** (grep-confirmed; the only `on*`-looking matches are `content="` meta tags). Every event handler in the app is JS-attached (`el.onclick=`, `addEventListener`). So the ONLY inline-attribute global reachability in the entire file is `revealMyRecipe` (Q2b). This dramatically de-risks bridge deletion — there is no hidden markup dependency on globals.

---

## Q3 — Acyclic graph verification (SPLIT-06 / criterion 4)

**Recommendation: a custom `scripts/module_graph_check.js`, NOT madge.** The milestone has added zero dependencies across four phases (a hard, repeatedly-honored constraint); adding `madge` (which pulls a large transitive tree) contradicts that for a check that is ~40 lines of DFS. The custom check:
1. Reads every `src/**/*.js`, extracts `import … from "./…"` specifiers (relative only).
2. Builds the directed graph, runs DFS with a recursion stack, reports any back-edge as a cycle with the path.
3. Exits non-zero on a cycle; wired into `npm test` after `state_contract_check.js`.

Expected acyclic shape (assert it, not just "no cycles"): `shared ← engine`, `shared ← ui`, `shared ← net`, `engine ← ui` (UI reads game types), `{engine, ui, net} ← main`. **`ui` must NOT → `net`** (criterion 1) — the graph check plus a directional contract assertion both enforce this. Note `madge --circular` is the ROADMAP's named tool; the custom equivalent satisfies "or equivalent" and is the zero-dep-consistent choice. If the planner prefers madge as a `devDependency` behind an `npx madge` invocation (no committed dep), that is a defensible alternative — but the custom script is the recommendation.

---

## Q4 — Criterion-1 directionality enforcement

Extend the contract-check pattern (4 checks exist). New `scripts/ui_contract_check.js` (or fold into the module-graph check) with assertions:
1. **UI never imports net:** no `src/ui/**/*.js` contains `from "…/net/…"` or `from "…/net"`. Literal-substring, **no comment-stripping** — though `src/ui/` is unlikely to contain a URL literal, do not inherit the `://` false-negative; match raw import lines only.
2. **Bridge is gone:** zero occurrences of `Object.assign(globalThis` anywhere in `src/`, and the `PP` bridge-assembly line is deleted.
3. **No leftover bridge-symbol bare reads:** the classic `<script>` region is empty (or reduced to nothing that reads former bridge symbols) — assert the region byte-length is near-zero, OR that it contains no bare reads of the ~200 former bridge symbols.
4. **Retained-globals allowlist:** the only `window.*` non-debug assignment introduced is `window.revealMyRecipe` (D-05); any other new `window.X =` fails.

All proven able to fail via a red-proof drill (the 08-04/09/10 precedent that caught real checker bugs each time).

---

## Q5 — Safari storm re-verification (criterion 5) + determinism

### Q5a — What could regress Safari storm rendering
The storm surface is entirely in the UI/DOM tier (net-free): **`drawBoard`(153L), `render`(113L), `buildStormLayers`(22L), `typewriterReveal`(43L), `flash`, `panel`, `renderDecorativeBoard`**. These move into `src/ui/`. The v1.0 BUG-01 near-crash was Safari CPU-compositing the storm rain overlay; the fix was a pre-baked PNG tile + snap (not animate) narration height. The risk in Phase 11 is **not** algorithmic (the code moves verbatim) but structural: if module load timing or the `render()` call cadence changes, or if `buildStormLayers`'s lazy DOM construction runs at a different point, Safari could re-exhibit jank. **Watch:** that `buildStormLayers` still builds lazily once, `render()` is called the same number of times, and the storm overlay CSS/PNG path resolves post-extraction. Force a storm (`appState.game.cfg.storm=1; rollStorm = g=>{g.r();g.stormStreak=1;return true;}` — bare `rollStorm` is now `appState`-adjacent; use the module-reachable form) and watch frame rate in Safari.

### Q5b — Corpus is UI-blind
The 30-seed corpus proves the engine computes identically; it renders nothing. `--verify` green is **necessary but nowhere near sufficient** for a UI-extraction phase — it cannot see a broken render, a missed bridge symbol, or a Safari perf regression. The real gates are: the mechanical bridge-removal/graph/directional checks, a full solo AND two-tab Chrome click-through (clean console), and the human Safari storm pass. This is the phase where "green tests, broken page" is most possible — weight the browser gates accordingly.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — Node scripts + `process.exit(0/1)`, wired through `npm test` (Phases 7–10 convention) |
| Quick run | `node scripts/module_graph_check.js && node scripts/ui_contract_check.js` |
| Full suite | `npm test` (determinism + engine/net/state/ui contract checks + module-graph check) |

### Requirements → Test Map
| Req | Behavior | Type | Command | Infra |
|-----|----------|------|---------|-------|
| SPLIT-03 | `src/ui/` never imports `src/net/` | contract | `node scripts/ui_contract_check.js` | ❌ W0 |
| SPLIT-05 | `main` orchestrates; `index.html` = markup + one module entry; bridge deleted | contract + grep | `ui_contract_check.js` (bridge-gone assertion) + `grep -c '<script>' index.html` | ❌ W0 |
| SPLIT-06 | Dependency graph acyclic | contract | `node scripts/module_graph_check.js` | ❌ W0 |
| — | Engine unchanged | integration | `determinism_baseline.js --verify` 30/30 | ✅ P7 |
| — | Solo + two-tab playable, clean console, bridge gone | **browser** | Chrome MCP click-through | ❌ W0 |
| — | Safari storm renders cleanly | **human/Safari** | forced-storm pass | ❌ W0 (Wyatt) |

### Wave 0 Requirements
- [ ] `scripts/module_graph_check.js` — import-graph cycle detection (DFS), asserts the expected acyclic shape, wired into `npm test`.
- [ ] `scripts/ui_contract_check.js` — UI-never-imports-net, bridge-gone, no-leftover-bridge-reads, retained-globals-allowlist. Proven able to fail (red-proof drill).
- [ ] Commit the static analyzer (`analyze.mjs` → `scripts/`) so the 183-function inventory is re-runnable, not a one-off (the lesson from the stalled first research attempt).
- [ ] Framework install: **none**.

### Sampling Rate
- Per commit: `--verify` + the two new checks. Per wave: `npm test` + a Chrome load-and-play. Phase gate: full suite + Chrome solo/two-tab transcript + the human Safari storm pass.

## Security Domain

`security_enforcement` is on (ASVS L1, block on high). This phase moves UI code between files and deletes an internal global bridge; it introduces no new network surface, no auth/session/crypto change, no new untrusted-input boundary. The one relevant note: deleting `Object.assign(globalThis, PP)` *reduces* the global attack surface (engine/net internals are no longer reachable from the console via bare identifiers) — a mild security improvement, not a regression. The retained `window.revealMyRecipe` and the 4 read-only debug hooks expose no secrets (game state only; Firebase config is already public by design). No applicable ASVS category beyond the existing posture.

---

## Assumptions Log / Open Questions
1. `battleAsk` classified as orchestration (calls 4 net-adjacent fns) rather than pure UI — the planner should confirm its final home (main/flow vs an injected-handler UI function). Low risk either way.
2. Whether the 95 helpers split into `src/ui/` vs a `src/flow/` sibling (turn-flow: humanTurn/botTurn/humanAct/windLeg) vs `src/shared/` (truly pure utilities) — a decomposition choice for the planner; the analysis.json `calledBy` data supports either grouping.
3. The exact wave count — the tier sizes (44/44/95) and the clean 6-edge seam suggest ~4–6 sequential waves (UI-render, game-flow helpers, orchestration/main, bridge-deletion+graph-check, browser+Safari verify). The planner sets final granularity.

## Metadata
- Static analysis: `analysis.json` (183 functions, call graph, tiers) in the phase scratchpad; the analyzer should be committed to `scripts/` per Wave 0.
- Sources: direct static analysis of `index.html` classic region via `scripts/lib/js_region_tokenizer.js`; `src/main.js`, `src/net/index.js`, `src/{shared,engine}/index.js` export surfaces; ROADMAP/REQUIREMENTS/CONTEXT.
