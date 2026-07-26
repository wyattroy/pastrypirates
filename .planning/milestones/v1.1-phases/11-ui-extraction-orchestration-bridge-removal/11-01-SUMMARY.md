---
phase: 11-ui-extraction-orchestration-bridge-removal
plan: 01
subsystem: ui
tags: [static-analysis, module-graph, cycle-detection, contract-check, strangler-fig, tracer, es-modules]

# Dependency graph
requires:
  - phase: 10-app-state-de-globalization
    provides: appState.NAME migration (46 names), 4 debug hooks, state_contract_check.js
  - phase: 09-networking-extraction
    provides: src/net/ barrel + registry-mediated watchers, net_contract_check.js precedent
  - phase: 08-engine-extraction
    provides: src/engine/ + src/shared/ leaf tiers, PP bridge mechanism, mechanical-extraction-via-Node-script precedent
provides:
  - scripts/analyze_classic.mjs (committed static analyzer, path-clean, reproduces 183-fn/44-net-caller inventory)
  - scripts/module_graph_check.js (cycle detection + tier-shape assertions, wired into npm test)
  - scripts/ui_contract_check.js (4 bridge-removal assertions, red-proof drilled, staged for 11-07)
  - src/ui/recipe.js + src/ui/index.js (first UI cluster extracted; the proven pattern for 11-02..11-06)
  - PP bridge grown with `...ui` in src/main.js
affects: [11-02-ui-extraction, 11-03-ui-extraction, 11-04-ui-extraction, 11-05-ui-extraction, 11-06-ui-extraction, 11-07-bridge-removal, 11-08-safari-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tier-shape module graph check (custom DFS cycle detection + hardcoded allowed-tier-edges table) instead of madge — zero-dep milestone stance (D-09)"
    - "Contract-check red-proof drill via disposable os.tmpdir() fixtures + a --drill flag, exercising the same check functions the real run uses, instead of hand-editing the real tree to prove a check can fail"
    - "Mechanical Node-script extraction (read exact line range, byte-diff before/after, prepend `export ` only) for large Unicode-dense verbatim code motion — Phase 8's precedent, reused here for the recipe cluster's ~950-line RECIPE_BOOK data literal"
    - "Cluster-internal support data (RECIPE_BOOK/PASTRY_FILES/RECIPE_LOOKUP/recipeModalCurrent) travels WITH the functions that exclusively use it, staying un-exported/module-private — not everything that moves needs to be a barrel export"

key-files:
  created:
    - scripts/analyze_classic.mjs
    - scripts/module_graph_check.js
    - scripts/ui_contract_check.js
    - src/ui/recipe.js
    - src/ui/index.js
  modified:
    - src/main.js
    - index.html
    - package.json

key-decisions:
  - "NET_FNS in analyze_classic.mjs is derived at runtime from src/net/index.js's own export surface (dynamic import + Object.keys), not read from a scratchpad netfns.txt — the plan's own instruction, chosen so the inventory can never drift stale relative to what src/net/ actually publishes"
  - "module_graph_check.js infers tier from a file's top-level directory under src/ (shared/engine/net/state/ui), with files directly in src/ (main.js, module-contract.js) treated as the 'main' composition-root tier — this made the D-07 'ui does NOT import net' assertion a dedicated, separately-labeled PASS/FAIL line rather than folded into a general shape check, matching the acceptance criterion's literal wording"
  - "RECIPE_BOOK, PASTRY_FILES, RECIPE_LOOKUP (construction), and recipeModalCurrent moved into src/ui/recipe.js alongside the 9 named functions, even though the plan's action text only names the 9 functions — grep-confirmed these classic-script `const`/`let` bindings are used EXCLUSIVELY by this cluster and nowhere else in the classic script, so they would otherwise ReferenceError the instant the functions moved to an ES module (a classic script's `const`/`let` never becomes a `window` property, unlike `function` declarations) — see Deviations"
  - "The classic-script-local `$` helper (`id=>document.getElementById(id)`, index.html:863, used ~129 times elsewhere) is duplicated (not moved) as a private const inside src/ui/recipe.js — it cannot be relocated without breaking ~127 other still-classic call sites, and hoisting it to shared/ is an architectural change out of scope for a single-cluster tracer — see Deviations"
  - "Chrome mechanism gate (Task 3) was verified by the orchestrator via browser automation against this executor's own worktree server, not by a human directly — recorded here as an explicit deviation from the plan's literal wording ('Wyatt loads index.html in Chrome'); the genuine human-only step this phase still owes is D-12's Safari storm re-verification, deferred to 11-08"

patterns-established:
  - "Contract-check red-proof drilling: build a --drill mode into the check script itself that manufactures synthetic violations under a disposable temp directory and asserts each check function reports FAIL — proves the check CAN catch what it claims to catch, without touching the real tree or requiring a second throwaway script"

requirements-completed: []  # SPLIT-03/05/06 deliberately NOT marked complete — see Deviations; only 1 of 8 phase plans done, 9 of 183 functions extracted, bridge still present

coverage:
  - id: D1
    description: "Static analyzer (scripts/analyze_classic.mjs) committed, path-clean, reproduces the 183-function/44-net-caller inventory"
    verification:
      - kind: other
        ref: "node scripts/analyze_classic.mjs (exit 0, FUNCTIONS: 183, net-callers: 44); grep -c '/private/tmp|new-session-d6e9d7/scripts' scripts/analyze_classic.mjs returns 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "scripts/module_graph_check.js: cycle detection + tier-shape assertions (including dedicated 'ui does NOT import net' line), wired into npm test"
    verification:
      - kind: other
        ref: "node scripts/module_graph_check.js (7/7 PASS); npm test (exit 0, includes module_graph_check.js in the chain)"
        status: pass
    human_judgment: false
  - id: D3
    description: "scripts/ui_contract_check.js: 4 bridge-removal assertions, red-proof drilled against synthetic fixtures, NOT yet wired into npm test"
    verification:
      - kind: other
        ref: "node scripts/ui_contract_check.js --drill (4/4 drills PASS — each assertion correctly reports FAIL against its own synthetic violation)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Recipe/pastry cluster (9 functions) extracted verbatim into src/ui/recipe.js, re-exported via src/ui/index.js, PP bridge grown with ...ui, index.html classic region no longer defines them"
    verification:
      - kind: other
        ref: "node scripts/determinism_baseline.js --verify (30/30); node scripts/module_graph_check.js (7/7 PASS); grep -c 'function recipeModalHTML' index.html returns 0; grep '...ui' src/main.js"
        status: pass
    human_judgment: false
  - id: D5
    description: "Chrome mechanism gate: tracer build loads with clean console, module/boot debug hooks correct, recipe modal renders through the grown bridge, one full turn renders"
    verification:
      - kind: automated_ui
        ref: "orchestrator browser automation against http://localhost:8010/ — window.__pp_module_ok===true, window.__pp_boot_count===1, zero console errors, recipeCardHTML-rendered draft cards observed in DOM, deterministic sailing-order/recipe draw observed"
        status: pass
    human_judgment: true
    rationale: "Verified by the orchestrator's browser automation rather than Wyatt directly, per the plan's literal checkpoint wording ('Wyatt loads index.html in Chrome') — flagged for awareness even though the evidence is complete and passing, since the plan named a human as the verifier"

# Metrics
duration: ~35min
completed: 2026-07-25
status: complete
---

# Phase 11 Plan 1: Wave-0 Safety Net + UI-Extraction Tracer Summary

**Committed the module-graph/UI-contract-check safety net and proved the whole UI-extraction pattern end-to-end on one cluster: the recipe/pastry functions now live in `src/ui/recipe.js`, resolving through a `PP` bridge grown with `...ui`.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-07-25
- **Tasks:** 3 (2 auto/tracer + 1 checkpoint)
- **Files modified:** 8 (`scripts/analyze_classic.mjs`, `scripts/module_graph_check.js`, `scripts/ui_contract_check.js`, `package.json`, `src/ui/recipe.js`, `src/ui/index.js`, `src/main.js`, `index.html`)

## Accomplishments
- Committed `scripts/analyze_classic.mjs` (path-scrubbed static analyzer), reproducing the 183-function / 44-net-caller / 54-DOM / 95-pure-helper inventory used throughout Phase 11's planning artifacts
- Built `scripts/module_graph_check.js`: file-level cycle detection (DFS, white/gray/black) plus tier-shape assertions (shared leaf; engine/net → shared only; ui → shared/engine/state; ui does NOT import net (D-07); main → everything) — wired into `npm test` immediately
- Built `scripts/ui_contract_check.js` with the 4 SPLIT-03/05/06 bridge-removal assertions, red-proof drilled via a `--drill` mode against disposable synthetic fixtures (all 4 demonstrably FAIL on their own violation) — deliberately NOT wired into `npm test` yet (assertions 2/3 are false-by-construction until 11-07 deletes the bridge)
- Extracted the recipe/pastry cluster (9 functions + their exclusively-used support data) verbatim into `src/ui/recipe.js`; created the `src/ui/index.js` barrel; grew the `PP` bridge in `src/main.js` with `...ui`
- Proved the pattern end-to-end: determinism 30/30, module graph green, `npm test` green, and a live Chrome load with clean console, correct debug hooks, a rendering recipe modal, and a full playable turn

## Task Commits

Each task was committed atomically:

1. **Task 1: Commit the static analyzer + build the two contract scripts** - `2014826` (feat)
2. **Task 2: Tracer — extract the recipe/pastry leaf cluster into src/ui/** - `41f308f` (feat)

**Plan metadata:** _pending — this commit_ (docs: complete plan)

Task 3 (checkpoint:human-verify) produced no code commit — it is a verification gate only.

## Files Created/Modified
- `scripts/analyze_classic.mjs` - Committed static analyzer; net-function set derived at runtime from `src/net/index.js`'s exports, JSON report written under the phase dir
- `scripts/module_graph_check.js` - Cycle detection + tier-shape gate, wired into `npm test`
- `scripts/ui_contract_check.js` - The 4 future bridge-removal assertions + `--drill` self-test mode; not yet gating
- `package.json` - `test` script chain extended with `module_graph_check.js`
- `src/ui/recipe.js` - The 9 extracted recipe/pastry functions + their private support data (`RECIPE_BOOK`, `PASTRY_FILES`, `RECIPE_LOOKUP`, `recipeModalCurrent`) + a locally-duplicated `$` helper
- `src/ui/index.js` - UI barrel, `export * from "./recipe.js"`
- `src/main.js` - Imports `./ui/index.js`; `PP` bridge grown with `...ui`
- `index.html` - Classic `<script>` region shrunk by 355 lines (the moved cluster removed)

## Decisions Made
- Net-function surface for the analyzer derived at runtime from `src/net/index.js`'s exports, not a frozen scratchpad list (can't drift stale)
- `module_graph_check.js`'s "ui does NOT import net" gets its own dedicated PASS/FAIL line, not folded into a general shape assertion, matching the acceptance criterion's literal wording and making a future violation unmistakable in test output
- Contract-check red-proof drilling done via disposable `os.tmpdir()` fixtures + a `--drill` flag exercising the real check functions, rather than temporarily corrupting the real tree
- See Deviations for the RECIPE_BOOK/PASTRY_FILES/RECIPE_LOOKUP/recipeModalCurrent and `$`-duplication decisions, and the Chrome-gate-verified-by-orchestrator note

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1/3 - Bug/Blocking] Moved RECIPE_BOOK/PASTRY_FILES/RECIPE_LOOKUP/recipeModalCurrent alongside the 9 named functions**
- **Found during:** Task 2 (tracer extraction)
- **Issue:** The plan's action text names only the 9 functions to move. But `recipeInfo` reads `RECIPE_LOOKUP` (built from `RECIPE_BOOK`), and `attachPastryArt` reads `RECIPE_BOOK`/`PASTRY_FILES` — all three are classic-script `const` declarations. Unlike `function` declarations (which become `window` properties automatically in a classic, non-module script), a bare `const`/`let` at classic-script top level does NOT become a `window` property — it is only visible via that script's own lexical scope. Moving `recipeInfo`/`attachPastryArt` into an ES module without also moving these would have produced an immediate `ReferenceError` the instant either function ran (a failure `analyze_classic.mjs`'s own regex-based call-graph could not see, since it only tracks calls to `function`-declared names, not `const` reads). Same issue for `recipeModalCurrent` (a `let`), read/written by `openRecipeModal`/`wireRecipeModal`.
- **Fix:** Grep-confirmed all four are used EXCLUSIVELY within this 866-1220 line block and nowhere else in the classic script (`grep -n "RECIPE_BOOK\|PASTRY_FILES\|RECIPE_LOOKUP\|recipeModalCurrent" index.html` — zero hits outside the moved range). Moved them into `src/ui/recipe.js` as module-private (un-exported) declarations, part of the same mechanical byte-diffed extraction as the 9 functions.
- **Files modified:** `src/ui/recipe.js`, `index.html`
- **Verification:** `node scripts/determinism_baseline.js --verify` 30/30; Chrome checkpoint confirmed the recipe modal and draft-choice cards render correctly (live proof that `recipeInfo`/`attachPastryArt` resolve their data correctly post-move)
- **Committed in:** `41f308f` (Task 2 commit)

**2. [Rule 1/3 - Bug/Blocking] Duplicated the classic-script-local `$` helper inside src/ui/recipe.js**
- **Found during:** Task 2 (tracer extraction)
- **Issue:** `openRecipeModal` and `wireRecipeModal` call `$("recipeModalBody")`, `$("players")`, etc. — `$` is `const $=id=>document.getElementById(id)` (index.html:863), used ~129 times across the still-classic region, i.e. far beyond this cluster. Same invisibility problem as Deviation 1 (classic `const`, not a `window` property), but `$` cannot be "moved" — 127 other classic call sites still need their own copy.
- **Fix:** Added a private one-line `const $=id=>document.getElementById(id);` inside `src/ui/recipe.js`, documented with a header comment explaining why it's a duplicate, not a move. The classic script's own `$` declaration is untouched.
- **Files modified:** `src/ui/recipe.js`
- **Verification:** Chrome checkpoint confirmed `openRecipeModal`/`wireRecipeModal` correctly manipulate `#recipeModalBody`, `#recipeModal`, `#players`, `#btnRecipePdf`, `#btnRecipeEmail` post-move
- **Committed in:** `41f308f` (Task 2 commit)

**3. [Deliberate scope decision — Rule 4-adjacent, but not architectural] Did NOT mark SPLIT-03/SPLIT-05/SPLIT-06 complete in REQUIREMENTS.md**
- **Rationale:** This plan is 1 of 8 in Phase 11. Only 9 of 183 classic functions are extracted, the `main` orchestrator does not yet drive boot directly (still inverted via `window.boot()`), and the `PP` bridge still exists (by design — it's the strangler-fig mechanism the remaining waves rely on). Marking any of these phase-level requirements complete now would misrepresent phase state, mirroring the 09-01 precedent ("deliberately did not mark SPLIT-04/NET-01/NET-02/NET-03 complete... only 3 of 18 watchers migrated"). `requirements-completed: []` in this SUMMARY's frontmatter reflects that; REQUIREMENTS.md's SPLIT-03/05/06 rows remain Pending.
- **Files modified:** none (deliberately did not run `requirements mark-complete`)

**4. [Process note, not a code deviation] Chrome mechanism gate (Task 3) verified by the orchestrator's browser automation, not directly by Wyatt**
- **Found during:** Task 3 (checkpoint)
- **Issue:** The plan's `<how-to-verify>` text says "Serve the repo... Load index.html in Chrome" — written assuming a human performs the load. The orchestrator instead drove the verification itself via browser automation against this executor's worktree server (`http://localhost:8010/`), reporting: `window.__pp_module_ok===true`, `window.__pp_boot_count===1`, zero console errors across page load → Play Solo → sailing-order draw → recipe-choice screen, all 9 extracted functions resolving as `function` through the bridge (including `window.revealMyRecipe`), the board/panel/narration rendering normally, and 10 `recipeCardHTML`-rendered draft cards present in the DOM with correct titles/images/ingredients.
- **Resolution:** Accepted as satisfying the checkpoint's intent (a real, working, live-rendered proof of the mechanism) — recorded here rather than silently treated as equivalent to a direct human check. The one step this phase still owes a real human is D-12's Safari storm re-verification, explicitly deferred to `11-08-PLAN.md` per CONTEXT.md.
- **Files modified:** none

---

**Total deviations:** 4 (2 auto-fixed blocking issues, 1 deliberate non-completion of phase-level requirements, 1 process note on the checkpoint verifier)
**Impact on plan:** The two auto-fixes were necessary for the extraction to work at all — without them the tracer would ReferenceError on first use. No scope creep: the additional moved constants and duplicated helper are both strictly internal to this one cluster's correctness, not new functionality. The requirements/checkpoint notes are bookkeeping, not code changes.

## Issues Encountered
- A pre-existing local HTTP server on port 8000 was found serving a *different* worktree (`gsd-new-project-skill-40272a`) — the known "stale-server port trap" from MEMORY `project_mp_test_harness`. A fresh server for this worktree was started on port 8010 instead; port 8000 was left untouched.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The extraction pattern (move verbatim + import rewiring + bridge grows with `...ui` + gates green) is now proven end-to-end in a live browser, including the trap case (cluster-private support data invisible to modules) that the remaining ~174 functions across 11-02 through 11-06 are very likely to hit again — future plans should grep for `const`/`let` dependencies exclusive to a moving cluster before assuming "move the named functions" is dependency-complete.
- `scripts/module_graph_check.js` is green and standing in `npm test`; every subsequent extraction wave gets this gate for free.
- `scripts/ui_contract_check.js` exists and is red-proof drilled, ready to be wired into `npm test` the moment 11-07 deletes the bridge.
- Blocker/concern carried forward: D-12's Safari storm re-verification is still owed to a real human, deferred to 11-08 per CONTEXT.md — not resolved by this plan's Chrome-only, orchestrator-automated checkpoint.

---
*Phase: 11-ui-extraction-orchestration-bridge-removal*
*Completed: 2026-07-25*

## Self-Check: PASSED

All claimed files found on disk (`scripts/analyze_classic.mjs`, `scripts/module_graph_check.js`, `scripts/ui_contract_check.js`, `src/ui/recipe.js`, `src/ui/index.js`); both task commits (`2014826`, `41f308f`) found in git log.
