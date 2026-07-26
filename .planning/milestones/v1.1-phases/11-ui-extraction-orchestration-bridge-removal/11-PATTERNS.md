# Phase 11: UI Extraction, Orchestration & Bridge Removal - Pattern Map

**Mapped:** 2026-07-24
**Files analyzed:** 8 (new/modified) + 1 large source region being emptied
**Analogs found:** 8 / 8

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/ui/*.js` (render/board/modals/narration/lobby split, TBD granularity) | component/view | event-driven (DOM render) | `src/engine/index.js` (Phase 8 code-motion precedent) + `src/net/index.js` (barrel/export shape) | role-match |
| `src/main.js` (expanded orchestrator, bridge deleted) | orchestrator/provider | event-driven (wires engine+ui+net, calls boot) | `src/main.js` (itself, current version — transform in place) | exact (self) |
| `scripts/module_graph_check.js` | utility / test (contract check) | batch (static analysis, exit 0/1) | `scripts/net_contract_check.js` (closest: directional-import assertion #4 is nearly identical to this script's whole job) | role-match |
| `scripts/ui_contract_check.js` | utility / test (contract check) | batch (static analysis, exit 0/1) | `scripts/net_contract_check.js` (structure, header conventions, comment-stripping caveat) | exact |
| `scripts/<analyzer>.mjs` → committed under `scripts/` (currently phase-scratchpad `11-analysis-tool.mjs`) | utility (static analyzer) | batch (reads `index.html`, emits inventory/JSON) | `scripts/lib/js_region_tokenizer.js` (already-committed tokenizer this analyzer is built on) | exact (dependency, not sibling) |
| `index.html` classic `<script>` region (`:859`–`:4668`) | (deleted, not created) | — | — | source being emptied |
| `docs/MODULES.md` (updated) | config/docs | — | itself (existing bridge/startup-order doc) | exact (self) |

## Pattern Assignments

### `src/ui/*.js` (UI render + game-flow-helper modules)

**Primary analog: `src/engine/index.js`** (Phase 8 extraction — the "move functions verbatim + rewire bare reads into imports" precedent this phase repeats at much larger scale)

**Header/provenance-comment pattern** (lines 1-6):
```javascript
// src/engine/index.js
//
// Phase 8 engine tier (D-03/D-04). Holds no DOM, `window`, Firebase,
// wall-clock, or unseeded-random access — pure simulation logic only.
// Imports from `../shared/index.js`; must never be imported BY
// `src/shared/` (shared is a leaf, engine depends on it, never the reverse).
```
Mirror this shape for each new `src/ui/*.js` file: state the phase, the directional constraint (never imports `src/net/` — this phase's criterion 1), and what "purity" means for that file.

**Import pattern** (line 8):
```javascript
import { mulberry32, ING_ALL, TET, DIRS, OPPOSITE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD, windStepCost, man, ilabelImg } from "../shared/index.js";
```
UI modules import from `../shared/`, `../engine/` (UI reads game types per Q3's expected acyclic shape `engine ← ui`), and `../state/index.js` for `appState`. **Never** `from "../net/..."` — that is the criterion-1 boundary this phase enforces mechanically.

**Verbatim function motion:** functions like `drawBoard`, `render`, `panel`, `flash`, `humanTrade`, `botTurn` move byte-identical from the classic `<script>` region into the new module — no reformatting, no logic change (see RESEARCH.md Q1c: "not the Phase-10 identifier-qualification transform, it is code motion + import rewiring"). The former bare-identifier reads of engine/shared/net/state symbols become explicit `import {...}` lines.

**Handler-injection seam (the 6-edge boundary)** — mirror the net→UI pattern already established in `src/net/index.js`/`watchers.js` (net publishes, UI subscribes via injected callbacks). Apply this pattern to the 6 UI functions that currently call orchestration functions directly (`liveRender`→`pushEvents`, `flash`→`netNarrate`, `remotePickHighlights`→`sendResponse`, `endReplay`→`setRecoveryState`, `wireRestoreFail`→`setRecoveryState`/`leaveGame`): these UI functions should receive the net-adjacent operation as an injected callback parameter from `main`, not call the net-layer symbol directly. `battleAsk` is orchestration-flavored (calls 4 net-adjacent fns) — home it in `main`/flow, not `src/ui/`.

---

### `src/main.js` (orchestrator, bridge deleted)

**Analog: itself** — the current file is the starting point to transform, not a separate analog. Excerpt the exact lines that change:

**The bridge to delete** (lines 62-64, tagged `// PP-BRIDGE`):
```javascript
const PP = { ...shared, ...engine, ...net, appState: stateNs.appState }; // PP-BRIDGE
window.PP = PP; // PP-BRIDGE
Object.assign(globalThis, PP); // PP-BRIDGE
```
All three `// PP-BRIDGE`-tagged lines and the `boot()` inversion below them are removed in the final wave (per RESEARCH.md Q1d — bridge deletion is a single, final, mechanically-gated commit, never interleaved with code motion).

**The debug hooks that survive untouched** (lines 71-92) — `window.__pp_net_debug` and `window.__pp_app_state_debug`: keep these exactly as-is; they are explicitly NOT part of the `PP` object being deleted.

**The boot seam to invert** (lines 110-114):
```javascript
// Inversion of control (D-14): the classic script no longer self-invokes
// `boot()` — it is a classic-script `function` declaration, so it is
// already an own property of `window` with no bridge entry needed. The
// module drives startup only after the bridge above is populated.
window.boot();
```
After extraction: `main` imports the UI module's `boot` export directly and calls it (`import { boot } from "./ui/index.js"; boot();`) instead of `window.boot()`. Confirm no other reader of `window.boot` per D-05/Q2a (only 2 references existed: the definition and this call site).

**New retained-global pattern for `revealMyRecipe`** (per D-05/Q2b — one deliberate, documented retained global): follow the same explicit-assignment style as the debug hooks in this file — `window.revealMyRecipe = revealMyRecipe;` placed in `src/ui/` (or here in `main`), documented in `docs/MODULES.md` alongside `__pp_net_debug`/`__pp_app_state_debug`.

---

### `scripts/module_graph_check.js`

**Analog: `scripts/net_contract_check.js`** (structure + shebang + PASS/FAIL convention) **and its assertion 4 specifically** (directional-import check, already anticipates `src/ui/`):

**Shebang + header pattern** (lines 1-16 of net_contract_check.js):
```javascript
#!/usr/bin/env node
// scripts/net_contract_check.js
//
// The standing SPLIT-04/NET-01/NET-02/D-04 gate (Phase 9 Plan 4). ...
```
Mirror this: `#!/usr/bin/env node`, header naming the requirement IDs gated (SPLIT-06), explaining why a one-off grep isn't sufficient and this must be a standing `npm test` gate.

**Directional-import assertion this script anticipates and module_graph_check.js extends** (from net_contract_check.js's own comment, assertion 4):
> "Directional imports (SPLIT-04, D-06) — no .js under src/net/ has an import specifier that resolves into src/ui/ or src/engine/. src/ui/ does not exist yet, which makes this trivially true today — that is exactly why it is committed now rather than after Phase 11 creates that directory."

`module_graph_check.js` is the general-purpose sibling: parse every `import ... from "./..."` specifier across `src/**/*.js`, build a directed graph, DFS with a recursion stack, report cycles with the path, assert the expected acyclic shape (`shared ← engine`, `shared ← ui`, `shared ← net`, `engine ← ui`, `{engine, ui, net} ← main`, and specifically **`ui` must NOT → `net`**).

**Exit-code / PASS-per-assertion pattern** (net_contract_check.js lines ~305-328):
```javascript
console.log(`${soleListenerOk ? "PASS" : "FAIL"} sole listener site (NET-02, D-04) — ...`);
...
if (failures.length) {
  console.error("\nFAILURES:");
  process.exit(1);
}
process.exit(0);
```
Reuse this exact skeleton: one `PASS`/`FAIL` line per assertion, printed before any exit, `process.exit(1)` only after every assertion has run (never short-circuit on first failure) so a single run reports every problem — same convention `engine_contract_check.js`/`state_contract_check.js` follow.

---

### `scripts/ui_contract_check.js`

**Analog: `scripts/net_contract_check.js`** (near-total structural mirror — same four assertions this phase needs, applied to `src/ui/` instead of `src/net/`)

**The `://` false-negative caveat to inherit** (net_contract_check.js lines 17-33):
```
// engine_contract_check.js strips every line from the first `//` to end of
// line before matching, and its own header explicitly says that is safe only
// because src/engine/ and src/shared/ contain no URL literals...
// This is that reconfirmation moment, and the answer is: do not comment-strip
// at all, anywhere in this file. Match raw, unstripped lines...
```
RESEARCH.md Q4 explicitly says `ui_contract_check.js` should NOT inherit the `://`-comment-stripping shortcut — match raw import lines only, same reasoning net_contract_check.js already documents.

**Assertions to implement (mirrors net_contract_check.js's assertion list, renamed for this phase's 4 checks from RESEARCH.md Q4):**
1. UI never imports net — no `src/ui/**/*.js` contains `from ".../net/..."` or `from ".../net"` (raw substring match, mirrors net_contract_check assertion 4's directional-import style, applied in reverse direction).
2. Bridge is gone — zero occurrences of `Object.assign(globalThis` anywhere in `src/`, and the `PP` assembly line deleted.
3. No leftover bridge-symbol bare reads — classic `<script>` region is empty or contains no bare reads of the ~200 former bridge symbols.
4. Retained-globals allowlist — the only new `window.X =` assignment (besides the 4 existing debug hooks) is `window.revealMyRecipe`.

**Scope-exclusion pattern to copy** (net_contract_check.js lines 39-49): scans `index.html` and every `.js` under `src/`, but **never scans `scripts/`** (including itself) — same self-exemption rationale applies to `ui_contract_check.js`.

---

### `scripts/<analyzer>.mjs` (committed static analyzer, currently the phase scratchpad `11-analysis-tool.mjs`)

**Analog: `scripts/lib/js_region_tokenizer.js`** (already-committed dependency this analyzer is built on)

This is Wave 0 housekeeping per RESEARCH.md ("commit the static analyzer so the 183-function inventory is re-runnable, not a one-off — the lesson from the stalled first research attempt"). No new pattern to extract beyond: it lives under `scripts/`, is a plain Node script (no framework, matches every other `scripts/*.js` in this repo), imports `scripts/lib/js_region_tokenizer.js` for string/comment-masked parsing (avoids false positives from prose/URLs), and emits its inventory as JSON (`analysis.json`) rather than a report file.

---

## Shared Patterns

### Contract-check skeleton (applies to both new `scripts/*_check.js` files)
**Source:** `scripts/net_contract_check.js`, `scripts/engine_contract_check.js`, `scripts/state_contract_check.js`
**Apply to:** `scripts/module_graph_check.js`, `scripts/ui_contract_check.js`
- `#!/usr/bin/env node` shebang
- Header comment naming the requirement IDs (SPLIT-03/05/06) and explaining WHY a one-off grep is insufficient
- No comment-stripping if the scanned files could contain URL literals (explicit reconfirm-per-file convention)
- Self-exclusion: never scans `scripts/` itself
- One `console.log` PASS/FAIL line per assertion, ALL assertions run before any exit (no short-circuit)
- `process.exit(1)` on any failure, `process.exit(0)` on full pass
- Wired into `npm test` after the existing three contract checks

### Handler-injection (net publishes, UI/consumer subscribes)
**Source:** `src/net/index.js` (barrel exporting `netWatch*` functions) + `src/net/watchers.js`
**Apply to:** the 6-edge UI→orchestration seam (`liveRender`, `flash`, `remotePickHighlights`, `endReplay`, `wireRestoreFail`) — these UI functions take an injected callback instead of importing net directly, preserving the same publish/subscribe direction Phase 9 already established for net→classic-script.

### Bridge-population / PP-BRIDGE tagging convention
**Source:** `src/main.js` lines 36-64
**Apply to:** understanding exactly what to delete in the final wave — every line tagged `// PP-BRIDGE` is grep-target for both the removal itself and `ui_contract_check.js`'s "bridge is gone" assertion.

### Single documented retained global
**Source:** `src/main.js` lines 71-92 (`window.__pp_net_debug`, `window.__pp_app_state_debug`)
**Apply to:** `window.revealMyRecipe` — follow the identical explicit, commented, named `window.X = ...` assignment style; document in `docs/MODULES.md` alongside the existing hooks (per GLOBAL-03 "single documented mechanism" principle).

## No Analog Found

None — every new file in this phase has a strong existing analog (Phase 8/9/10's engine/net/state extraction is a direct structural precedent for Phase 11's UI extraction, and the 3 existing contract checks are a direct precedent for the 2 new ones).

## Metadata

**Analog search scope:** `src/engine/`, `src/net/`, `src/state/`, `src/main.js`, `scripts/*_contract_check.js`, `scripts/lib/js_region_tokenizer.js`
**Files scanned:** 8 (all read in full — all ≤ 800 lines, single-pass reads)
**Pattern extraction date:** 2026-07-24
</content>
