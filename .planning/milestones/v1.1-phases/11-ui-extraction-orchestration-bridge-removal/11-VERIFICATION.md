---
phase: 11-ui-extraction-orchestration-bridge-removal
verified: 2026-07-25T17:36:53Z
status: passed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 11: UI Extraction, Orchestration & Bridge Removal Verification Report

**Phase Goal:** Complete the split — UI rendering becomes its own module, a `main` entry orchestrates all layers, `index.html` is reduced to markup, the dependency graph is proven acyclic, and the temporary strangler-fig bridges are removed.
**Verified:** 2026-07-25T17:36:53Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

(Roadmap Success Criteria 1–5, cross-referenced against 8 PLAN/SUMMARY pairs' must_haves)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | UI rendering (render/board/DOM/modals/narration) lives in its own module(s) that read game state and never import the networking layer | ✓ VERIFIED | `src/ui/{recipe,util,board,panel,lobby,handlers,flow}.js` exist and contain the full moved cluster (recipeModalHTML/openRecipeModal, drawBoard/render/buildStormLayers, panel/lobby views, turn-flow). `node scripts/module_graph_check.js` → `PASS ui does NOT import net (D-07)`. `node scripts/ui_contract_check.js` → `PASS no src/ui/**/*.js import resolves into src/net/`. Only textual hit for `../net` under `src/ui/` is a comment in `handlers.js:11` explaining the injected-handler seam, not an import. Spot-checked `src/ui/recipe.js` against the pre-move `index.html` (commit before `41f308f`) — function bodies are byte-identical except the added `export` keyword. |
| 2 | A `main` entry module orchestrates engine + UI + networking, and `index.html` is reduced to markup plus a single module entry point | ✓ VERIFIED | `src/main.js` imports `net`, `state`, `ui`, `orchestrator`, wires `ui.setNetHandlers({...})` to real `orchestrator.*` functions (24 keys), and calls `boot()` directly (`window.boot` indirection: 0 hits). `grep -n "<script"` in `index.html` shows exactly 4 script tags: 1 JSON-LD, 2 Firebase-compat classic scripts, 1 `<script type="module" src="src/main.js">`. `grep -c '^<script>$' index.html` → 0 (the old bare classic-script open tag is gone). `node scripts/ui_contract_check.js` assertion 3 (classic-region-empty) → PASS. |
| 3 | The temporary window bridge introduced in earlier phases is deleted, with a grep confirming no leftover bare-global reads remain | ✓ VERIFIED | `grep -rc 'PP-BRIDGE' src/` → 0. `grep -rn 'Object.assign(globalThis' src/` → 0 hits. `grep -rn 'window\.\w*\s*=' src/` → only `window.revealMyRecipe`, `window.__pp_net_debug`, `window.__pp_app_state_debug`, `window.__pp_boot_count`, `window[MODULE_OK_FLAG]` (the 4 allowed debug hooks + the 1 deliberate retained global + the module-ok marker). `node scripts/no_undef_check.js` (a new standing gate added specifically to close this exact "bare global read" risk after a live Chrome pass caught 2 the mechanical checks initially missed) → `PASS no-undef ... 0 findings across 19 files`. `node scripts/ui_contract_check.js` all 4 assertions PASS, including the retained-globals allowlist. |
| 4 | The module dependency graph is acyclic, verified by a cycle-detection scan | ✓ VERIFIED | `node scripts/module_graph_check.js` → 7/7 PASS: no cycle detected, `shared` is a leaf, `engine`/`net`/`ui` each only import `shared` (+`state` for ui), `ui` does not import `net`, `main` is the unrestricted composition root. Both this and `ui_contract_check.js` are wired into `npm test`'s chain (confirmed in `package.json`), and both scripts were red-proof drilled (`node scripts/ui_contract_check.js --drill` → all 4 synthetic-violation drills correctly FAIL as expected before passing against the real tree). |
| 5 | Storm rendering re-verifies cleanly on Safari after UI extraction (no perf/compat regression) | ✓ VERIFIED | Per explicit task instruction, this human-only Safari check was already performed during execution and does not require re-running. `11-08-SUMMARY.md` records Wyatt's direct confirmation in real Safari against the fully-extracted, bridge-deleted build ("storm renders GREAT — no freeze, no crash, no beachball, rain graphic correct, board/panels normal"). The executing agent independently corroborated the storm-forcing-and-revert side effect before accepting the report: `git status --short` clean, `git diff HEAD -- src/engine/index.js` empty, and a fresh `determinism_baseline.js --verify` (re-run again below) confirms `SOURCE: unchanged`. Spot-checked `buildStormLayers()` in `src/ui/board.js` directly — the pre-baked PNG tile / snap-not-animate mechanism (v1.0 BUG-01 fix) is present verbatim. |

**Score:** 5/5 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/ui/recipe.js` | recipe/pastry cluster module | ✓ VERIFIED | Exists, exports `recipeModalHTML`/`openRecipeModal`/`wireRecipeModal`/etc., byte-identical to pre-move source |
| `src/ui/util.js` | pure leaf helpers | ✓ VERIFIED | Exists (52KB), no `../net` import |
| `src/ui/board.js` | board + storm render cluster | ✓ VERIFIED | Exists (37KB), `buildStormLayers`/`drawBoard`/`render` present, imports only `../shared`, `../engine`, `../state`, `./util.js` |
| `src/ui/panel.js` | panel/clock/narration/chat/modal cluster | ✓ VERIFIED | Exists (21KB) |
| `src/ui/lobby.js` | lobby/room view cluster | ✓ VERIFIED | Exists (7.3KB) |
| `src/ui/handlers.js` | injected-handler seam (`setNetHandlers`/`netHandlers`) | ✓ VERIFIED | Exists, exports both functions, documented dual purpose (ui→orchestrator + ui→ui-sibling-cycle avoidance) |
| `src/ui/flow.js` | turn-flow + battle-UI + recovery cluster | ✓ VERIFIED | Exists (54KB) |
| `src/orchestrator.js` | 44 orchestration/net-caller functions | ✓ VERIFIED | Exists, imports `appState`, `Game`/`roundCfg`/`rollStorm` from engine, and the full net primitive set; `battleAsk` and `watchRoom` (with D-13 idempotency guard `_watchRoomAttachedFor`) both present |
| `src/main.js` | composition root | ✓ VERIFIED | Imports all 4 tiers (net/state/ui/orchestrator), wires the seam, calls `boot()` directly, hosts the 1 retained global + 4 debug hooks |
| `scripts/module_graph_check.js` | cycle detection + acyclic-shape assertions | ✓ VERIFIED | Exists, runs, 7/7 PASS, wired into `npm test` |
| `scripts/ui_contract_check.js` | 4 bridge-removal assertions | ✓ VERIFIED | Exists, runs, 4/4 PASS, red-proof drilled (`--drill`), wired into `npm test` |
| `scripts/no_undef_check.js` | module-internal no-undef gate (added post-Chrome-gate) | ✓ VERIFIED | Exists, runs, 0 findings across 19 files, wired into `npm test` |
| `docs/MODULES.md` (bridge section rewritten, revealMyRecipe documented) | updated docs | ✓ VERIFIED | Bridge section present as historical record; `window.revealMyRecipe` documented as the one retained non-debug global (D-05) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `src/ui/board.js` | `src/ui/util.js` | direct import (geometry/format helpers) | ✓ WIRED | `module_graph_check.js` confirms acyclic ui-internal edge |
| `src/ui/*.js` | `src/net/*` | **must NOT exist** | ✓ CONFIRMED ABSENT | 0 real imports; only a comment mentions `../net` (handlers.js:11, explaining why the seam exists) |
| `src/main.js` | `src/orchestrator.js` → `{net, ui, engine, state}` | composition-root imports | ✓ WIRED | `main.js` imports orchestrator and calls `boot()`; orchestrator imports net/engine/state; `module_graph_check.js` confirms no cycle |
| `src/ui/handlers.js` | `src/main.js` (`setNetHandlers`) | injected-handler seam, formalized with real functions | ✓ WIRED | `main.js:` `ui.setNetHandlers({ onBroadcast: orchestrator.netNarrate, onEvents: orchestrator.pushEvents, ... })` — 24 keys, all bound to real `orchestrator.*` exports, no bridge/globalThis indirection |
| `scripts/ui_contract_check.js` | `package.json` `test` script | wired after `module_graph_check.js` | ✓ WIRED | Confirmed in `package.json`'s `test` chain |

### Anti-Patterns Found

Scanned all phase-touched files (`src/ui/*.js`, `src/orchestrator.js`, `src/main.js`, `index.html`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/"not yet implemented"/"coming soon": **zero matches.** No blockers, no warnings.

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|----------------|--------------|--------|----------|
| SPLIT-03 | 11-01 through 11-05 | UI rendering lives in its own module(s), never imports net | ✓ SATISFIED | `module_graph_check.js` + `ui_contract_check.js` both PASS the ui↛net directional assertion; `src/ui/handlers.js`'s injected-handler seam resolves all cross-tier calls without an import edge |
| SPLIT-05 | 11-06, 11-07 | `main` orchestrates engine+UI+networking; `index.html` reduced to markup + one module entry | ✓ SATISFIED | `src/main.js` is the real composition root; `index.html` has exactly 1 module `<script>` entry + 2 Firebase-compat classics + 1 JSON-LD; the classic `<script></script>` region (183 functions) is fully deleted |
| SPLIT-06 | 11-01, 11-07, 11-08 | Module dependency graph acyclic, verified by cycle-detection scan | ✓ SATISFIED | `scripts/module_graph_check.js` 7/7 PASS, wired into `npm test`, red-proof provable (structural DFS-based cycle check) |

No orphaned requirements — `REQUIREMENTS.md`'s traceability table maps only SPLIT-03/05/06 to Phase 11, and all three appear in at least one plan's `requirements:` frontmatter field.

### Mechanical Gate Summary (run live during this verification)

| Check | Command | Result |
|-------|---------|--------|
| Module graph | `node scripts/module_graph_check.js` | 7/7 PASS, exit 0 |
| UI contract | `node scripts/ui_contract_check.js` | 4/4 PASS, exit 0 |
| UI contract red-proof drill | `node scripts/ui_contract_check.js --drill` | all 4 synthetic-violation drills correctly FAIL as designed, exit 0 |
| No-undef | `node scripts/no_undef_check.js` | 0 findings / 19 files, exit 0 |
| Full suite | `npm test` | exit 0 (determinism 30/30 + engine/net/state/ui contract checks + module-graph + no-undef, all PASS) |
| Determinism | `node scripts/determinism_baseline.js --verify` | 30/30 PASS, `SOURCE: unchanged` |
| Fixture-corpus commit count | `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' \| wc -l` | 1 (D-10 intact, never re-captured) |
| Bridge tag | `grep -rc 'PP-BRIDGE' src/` | 0 |
| Bridge spread | `grep -rc 'Object.assign(globalThis' src/` | 0 |
| Classic script tag | `grep -c '^<script>$' index.html` | 0 |
| Module entry count | `grep -c 'type="module" src="src/main.js"' index.html` | 1 |

### Human Verification Required

None. The two human-only checks the plans identified (Chrome full-game click-through in 11-07, Safari storm re-verification in 11-08) were performed and PASSED during execution per explicit orchestrator instruction for this verification pass, with documented evidence in `11-07-SUMMARY.md` and `11-08-SUMMARY.md`, and the executing agent's own independent corroboration (clean git status, unchanged determinism hash) of the one side-effecting adaptation (temporary `cfg.storm` override, fully reverted) made during the Safari session.

### Gaps Summary

None. All 5 roadmap success criteria hold, all 3 requirement IDs (SPLIT-03, SPLIT-05, SPLIT-06) are genuinely satisfied by mechanically-verified code (not just marked complete), the strangler-fig bridge is fully deleted with a standing regression gate (`ui_contract_check.js` + the newly-added `no_undef_check.js`) preventing recurrence, and the determinism/replay invariant is intact (30/30, frozen corpus untouched).

---

_Verified: 2026-07-25T17:36:53Z_
_Verifier: Claude (gsd-verifier)_
