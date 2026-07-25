---
phase: 07-foundation-determinism-baseline
plan: 02
subsystem: module-loading
tags: [esm, index.html, browser-node-parity, firebase-order, docs]

# Dependency graph
requires:
  - "07-01: committed 30-seed golden corpus + scripts/lib/load_engine.js + determinism_baseline.js --verify"
provides:
  - "src/module-contract.js — pure leaf export (MODULE_OK_FLAG, MODULE_CONTRACT_VERSION), no imports, no side effects"
  - "src/main.js — module entry that imports identically under plain Node and the browser, sets window.__pp_module_ok guarded, D-17 firebase tripwire"
  - "index.html gains exactly one line: <script type=\"module\" src=\"src/main.js\"></script> appended after the inline classic script closes"
  - "docs/MODULES.md — the module-loading and local-dev contract"
  - "README.md pointer to docs/MODULES.md"
affects: [08-engine-extraction, 09-ui-module-split, 10-globals-deglobalization, 11-networking-module-split, 12-final-validation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "typeof window / typeof firebase guards scoped to a single browser-only branch in src/main.js — proves Node-side import cleanliness (Criterion 1) without weakening the D-17 tripwire's browser-side coverage"
    - "Marker property set by indexing window with the imported MODULE_OK_FLAG constant (not a literal), making the leaf import load-bearing rather than decorative"

key-files:
  created:
    - src/module-contract.js
    - src/main.js
    - docs/MODULES.md
  modified:
    - index.html (one line added, zero deleted)
    - README.md (one line added, zero deleted)

key-decisions:
  - "No deviations from the plan — all six critical invariants held on first pass: attribute-less <script> count stayed at 1, Firebase compat tags untouched at :25-26, engine region hash matched Wave 1's manifest, dev-server MIME checks passed with no config, docs/MODULES.md content-greps all passed."

requirements-completed: [FOUND-01, FOUND-02, FOUND-03, FOUND-05]

coverage:
  - id: D1
    description: "src/main.js imports cleanly under plain Node (no DOM, no firebase) with exit 0 and empty stderr"
    requirement: "FOUND-01"
    verification:
      - kind: unit
        ref: "node --input-type=module -e \"import('./src/main.js').then(()=>console.log('Node import OK'))\" 2>/tmp/pp-stderr.txt — prints 'Node import OK', /tmp/pp-stderr.txt is 0 bytes"
        status: pass
    human_judgment: false
  - id: D2
    description: "index.html gains exactly one added line, zero deleted, and the attribute-less <script> count stays exactly 1"
    requirement: "FOUND-02, FOUND-03"
    verification:
      - kind: unit
        ref: "git diff --numstat -- index.html => 1 0; grep -c '<script>' index.html => 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "Firebase compat classic tags stay classic and stay ahead of the module entry; module tag is the last script tag in the document"
    requirement: "FOUND-03"
    verification:
      - kind: unit
        ref: "grep -n firebase-app-compat.js/firebase-database-compat.js still lines 25/26; awk locates type=\"module\" at line 5638 > 5637 (inline script close)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Engine source region byte-identical after the index.html edit — proven against Wave 1's committed manifest, not merely assumed"
    requirement: "FOUND-04 (preserved)"
    verification:
      - kind: integration
        ref: "loadEngine().sourceHash === manifest.engineSourceHash ('engine region unchanged'); node scripts/determinism_baseline.js --verify: 30/30 PASS, SOURCE: unchanged"
        status: pass
    human_judgment: false
  - id: D5
    description: "Both existing harnesses still pass after the edit; corpus fixtures were never re-captured"
    requirement: "FOUND-04 (preserved)"
    verification:
      - kind: integration
        ref: "npm test exit 0 (determinism --verify + dlog_replay_test.js 'All cases passed.'); node scripts/real_game_test.js 25 exit 0; git status --porcelain scripts/fixtures/determinism/ empty"
        status: pass
    human_judgment: false
  - id: D6
    description: "Module files are reachable over HTTP with a valid JavaScript MIME type, no server config needed"
    requirement: "FOUND-02"
    verification:
      - kind: integration
        ref: "python3 -m http.server 8931; curl src/main.js => 200, Content-type: text/javascript; curl src/module-contract.js => 200"
        status: pass
    human_judgment: false
  - id: D7
    description: "docs/MODULES.md documents all six required subjects; README carries an additive pointer"
    requirement: "FOUND-05"
    verification:
      - kind: unit
        ref: "grep content checks: python3 -m http.server(3), file://(4), text/javascript(1), application/javascript(1), defer(4, case-insensitive), __pp_module_ok(2), src/engine(1), src/net(1), Node 18(2); README grep docs/MODULES.md(1), README diff 0 deletions"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-24
status: complete
---

# Phase 7 Plan 2: Module-Loading Contract & Firebase Ordering Summary

**One attributed `<script type="module" src="src/main.js">` tag appended to the end of `index.html`'s body — the only production-file edit in the entire phase — proven not to touch the engine region, proven servable, and documented.**

## Performance

- **Duration:** ~15 min active execution
- **Started:** 2026-07-24T02:50Z (approx, first task commit)
- **Completed:** 2026-07-24T02:52Z (approx, last task commit)
- **Tasks:** 3
- **Files modified:** 5 (2 created under `src/`, 1 created `docs/MODULES.md`, `index.html` +1/-0, `README.md` +1/-0)

## Accomplishments

- `src/module-contract.js` — a pure leaf module (no imports, no side effects) exporting `MODULE_OK_FLAG = "__pp_module_ok"` and `MODULE_CONTRACT_VERSION = 1` (D-14)
- `src/main.js` — the module entry point. Imports the leaf via a real import edge (marker property name flows through the import, not a literal), sets `window[MODULE_OK_FLAG] = true` guarded by `typeof window !== "undefined"` (D-15 as amended), and carries the D-17 `typeof firebase === "undefined"` tripwire scoped to the same browser-only branch. Adds nothing to the boot path (D-18)
- `index.html` gains **exactly one line**: `<script type="module" src="src/main.js"></script>`, appended after the inline classic script closes (`:5637`) and before `</body>` (new line 5638). Zero other lines changed
- `docs/MODULES.md` — the module-loading and local-dev contract, covering the HTTP server requirement, the `file://` exclusion and why, both measured `.js` MIME values with an explicit "no config needed" statement, the classic-before-module ordering rule with both tripwires, the attribute-carrying script-tag rule, the `src/` layout Phases 8–11 inherit, and a Node 18+ minimum version
- `README.md` gains one additive pointer to `docs/MODULES.md`

## Task Commits

Each task was committed atomically:

1. **Task 1: Create the src/ module entry that imports identically under Node and the browser** - `aefa5e6` (feat)
2. **Task 2: Add the module script tag to index.html and prove the engine region is untouched** - `dcc286b` (feat)
3. **Task 3: Document the module-loading and local-dev contract** - `65ddfe0` (docs)

## Files Created/Modified

- `src/module-contract.js` - pure leaf, `MODULE_OK_FLAG`/`MODULE_CONTRACT_VERSION`, touches no browser/Node global
- `src/main.js` - module entry; `typeof window`/`typeof firebase` guards; sets the browser marker; nothing else
- `index.html` - one line added at (new) line 5638: `<script type="module" src="src/main.js"></script>`
- `docs/MODULES.md` - the module-loading and local-dev contract (new file)
- `README.md` - one additive line pointing to `docs/MODULES.md`

## Decisions Made

None beyond what CONTEXT.md's D-01…D-22 and the plan's own assumptions block already resolved. No architectural deviations, no Rule 4 escalations.

## Deviations from Plan

None — plan executed exactly as written. All acceptance criteria across all three tasks passed on first execution, including the highest-risk gate (`grep -c '<script>' index.html` staying at exactly `1` after the edit).

## Verified Facts (per plan's `<output>` instruction)

- **Exact inserted line and line number:** `<script type="module" src="src/main.js"></script>` at line 5638 (immediately after the inline classic script's closing `</script>` at line 5637, immediately before `</body>` at the new line 5639).
- **Attribute-less `<script>` tag count:** 1 before the edit, 1 after the edit (unchanged — confirmed via `grep -c '<script>' index.html`).
- **`engineSourceHash` comparison result:** match. Freshly computed `sourceHash` via `loadEngine()` equals the Wave 1 manifest's `engineSourceHash` (`15ad68996befca5130ba11b0cf79d59b0d871956cc11ab961fe32add384d874a`) — printed `engine region unchanged`; `determinism_baseline.js --verify`'s SOURCE line independently reports `unchanged — hashes match and engine source hash matches.`
- **Measured `content-type` for `src/main.js` under the local dev server:** `text/javascript` (via `python3 -m http.server 8931` + `curl -sI`), matching RESEARCH.md's prior measurement exactly. `src/module-contract.js` returned HTTP 200 as well.

## Issues Encountered

None. All acceptance criteria and the plan-level `<verification>` block passed on the first attempt with no auto-fixes required.

## User Setup Required

None — no external service configuration, no package-manager installs (zero dependency keys added or touched).

## Next Phase Readiness

- Phase 8 (engine extraction) can proceed: `index.html`'s production surface now carries the module entry point, the engine region is proven byte-identical to the Wave 1 baseline, and both Node harnesses + the determinism corpus remain green through the edit.
- The browser-side half of Criterion 5 (D-21b — loading the page over HTTP via Chrome MCP and confirming `window.__pp_module_ok === true` with a clean console) is explicitly out of scope for this plan and belongs to Plan 07-03, per the plan's own `<hard_sequencing_constraint>`.
- No blockers.

## Self-Check: PASSED

All created files verified present on disk (`src/module-contract.js`, `src/main.js`, `docs/MODULES.md`, this SUMMARY.md). `index.html` and `README.md` modifications verified via `git diff --numstat` (1 added / 0 deleted each). All claimed commits verified present in `git log --oneline` (`aefa5e6`, `dcc286b`, `65ddfe0`).

---
*Phase: 07-foundation-determinism-baseline*
*Completed: 2026-07-24*
