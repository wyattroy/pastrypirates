---
phase: 08-engine-extraction-node-harness-migration
plan: 02
subsystem: infra
tags: [esm, module-split, rng, determinism, order-load-bearing, bridge]

# Dependency graph
requires:
  - phase: 08-engine-extraction-node-harness-migration
    provides: "Plan 01 — window.PP bridge + inversion of control proven in Chrome; two-file barrel structure (src/shared/index.js, src/engine/index.js) established"
provides:
  - "src/shared/index.js — the complete Phase 8 shared leaf tier: ING_ALL, all *_IMG image maps, EMOJI_IMG/EMOJIFY_RE/emojify, BOAT_IMG, ISLAND_SHAPE_IMG, TET, the ING_NAME/ING_PLAIN/DOCK_PLACE/DOCK_FLAVOR tables and label helpers, DIRS/DIRNAME/PERP/STORM_DIAG/OPPOSITE, SAIL_BUDGET(_LEEWARD)/windStepCost, NAMES/DEFAULT_NAMES/unusedDefaultName, COLORS/HEXCOL, man — 120 named exports total, importable by plain Node with zero DOM"
  - "index.html: applyEngineBootstrapEffects() — the 3 relocated D-06 impurities (two documentElement.style.setProperty calls + the document.body.innerHTML emoji sweep), declared just above function boot(){"
  - "index.html: attachPastryArt() — wraps the RECIPE_BOOK.forEach(...ASSET_BASE...) top-level parse-time hazard so it runs safely after the bridge is populated"
  - "window.__pp_boot_count — new standing tripwire proving src/main.js drives startup exactly once despite the body-innerHTML rewrite now running at module time instead of mid-parse"
  - "Six ORDER IS LOAD-BEARING annotations (DIRS, DIRNAME, PERP, STORM_DIAG, OPPOSITE, TET) documenting the RNG/render order-dependencies RESEARCH.md's inventory identified"
affects: [08-03-engine-extraction, 08-04-contract-check, 08-05-source-hash-rebase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Order-load-bearing annotation convention: a comment line starting with the exact token `// ORDER IS LOAD-BEARING`, inserted immediately above the construct it documents (never reusing or moving the construct's own pre-existing prose comment), so a `grep -c` count and a `grep -B1` per-construct check both work as machine checks."
    - "Verbatim code motion continued from 08-01: moved lines close with a trailing `export { ... }` statement listing every symbol, never `export ` prefixes, keeping every moved line byte-identical to its index.html source (mechanically diff-verified during this plan, not just asserted)."
    - "Parse-time-hazard deferral: a top-level statement that references a moved symbol is wrapped in a same-named function (attachPastryArt, applyEngineBootstrapEffects) and invoked explicitly from src/main.js after the bridge is populated, rather than solved by bridge timing alone."

key-files:
  created: []
  modified:
    - index.html
    - src/shared/index.js
    - src/main.js
    - scripts/lib/load_engine.js

key-decisions:
  - "The moved block was extracted and reassembled via a small Node script operating on exact line ranges (not manual retyping), then verified byte-identical against the original index.html slice via `diff` before being written to disk — given ~950 lines of table declarations laced with multi-codepoint emoji and combining variation selectors, mechanical extraction was the only way to guarantee zero silent corruption of a single character, which for this file's RNG-sensitive tables would be indistinguishable from a real bug until a corpus seed failed."
  - "Deleted the blank line at the old shared-tier boundary (previously index.html:1035, between `const man=...` and the `// Bot decision weights` comment) along with the moved block, rather than leaving it behind — leaving it would have produced two consecutive blank lines (an artifact of the deletion, not existing file style) directly under the invariant against leaving any tombstone/placeholder residue at a deletion site."
  - "The `document` stub retained in scripts/lib/load_engine.js's vm sandbox (originally needed because `document.body.innerHTML=emojify(...)` ran inside the extracted Game/roundCfg region) is now unused by that region — the statement moved to `applyEngineBootstrapEffects()`, which sits past the `escHtml` slice boundary. Left the stub in place (harmless, zero-risk) but corrected its comment, which had gone stale and was actively misleading about what runs inside the current slice — this codebase's own 'loud failure on drift' convention (and the precedent 08-01 set correcting a stale header comment) argues against leaving a comment that describes behavior that no longer occurs there."
  - "Per-construct ORDER IS LOAD-BEARING reasons were written to match RESEARCH.md's own mechanism descriptions for each construct (DIRS: this.r()-indexed dock-cell pool; PERP/STORM_DIAG: live-loop-only, corpus-blind; TET: both RNG shape-index and art-placement index) rather than a single generic sentence repeated six times, so a future reader hitting one of these annotations learns the actual failure mode, not just that one exists."

requirements-completed: [SPLIT-02, ENGINE-01, ENGINE-03, ENGINE-04]

coverage:
  - id: D1
    description: "Complete shared leaf tier (ING_ALL, image maps, DIRS family, TET, names/colors, man, etc.) moved verbatim out of index.html into src/shared/index.js, importable by plain Node with zero DOM"
    requirement: "SPLIT-02"
    verification:
      - kind: unit
        ref: "node --input-type=module -e \"import('./src/shared/index.js').then(m=>{...need list of 29 symbols...})\" (exit 0); grep -q 'const ING_ALL=' index.html (exit 1); grep -q 'const DIRS=' index.html (exit 1); grep -q 'const ASSET_BASE=' index.html (exit 1)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Engine purity restored: the 3 D-06 impurities relocated into applyEngineBootstrapEffects(), the ASSET_BASE parse-time hazard deferred into attachPastryArt(); zero DOM/window/firebase/localStorage/Date.now/Math.random/globalThis/new Function references remain in src/shared/index.js after comment-stripping"
    requirement: "ENGINE-01"
    verification:
      - kind: unit
        ref: "sed 's://.*::' src/shared/index.js | grep -nE 'document\\.[A-Za-z]+|window\\.[A-Za-z]+|\\bfirebase\\b|localStorage|Date\\.now|Math\\.random|\\bglobalThis\\b|new Function' (exit 1 — no matches); grep -c 'function applyEngineBootstrapEffects' index.html (=1); grep -c 'function attachPastryArt' index.html (=1); grep -qE '^RECIPE_BOOK\\.forEach' index.html (exit 1)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Byte-for-byte determinism preserved through the move: all 30 corpus seeds verify green, both pre- and post-commit, with the fixture files untouched"
    requirement: "ENGINE-03"
    verification:
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (exit 0, 30/30 PASS, run twice — before and after the Task 1 commit); npm test (exit 0); node scripts/real_game_test.js 25 (exit 0); git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l (=1); git log --oneline -- scripts/fixtures/determinism/manifest.json | wc -l (=1); git status --porcelain scripts/fixtures/determinism/ (empty)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Six order-load-bearing constants (DIRS, DIRNAME, PERP, STORM_DIAG, OPPOSITE, TET) carry exactly one ORDER IS LOAD-BEARING annotation each, immediately above their declaration, with original key/element order byte-preserved"
    requirement: "ENGINE-04"
    verification:
      - kind: unit
        ref: "grep -c 'ORDER IS LOAD-BEARING' src/shared/index.js (=6); per-construct grep -B1 check for all six names (all found); literal byte-order greps for DIRS/DIRNAME/OPPOSITE key sequences (all exit 0)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The page still boots exactly once in a real browser after the document.body.innerHTML rewrite moved from parse time to module time — window.__pp_module_ok===true, window.__pp_boot_count===1, both CSS custom properties set, emoji art swapped in static markup, recipe modal art present, clean console"
    requirement: null
    verification: []
    human_judgment: true
    rationale: "Requires an actual Chrome session with browser-automation tooling (Chrome MCP / Playwright / Puppeteer) that this executor's toolset (Read/Write/Edit/Bash/Skill only, confirmed via `command -v chrome/chromium/google-chrome` and `npx playwright` — none present) does not provide, the same gap 08-01's Task 2 hit. The dev server on port 8777 was independently confirmed to be serving this exact worktree (`lsof` cwd match) and to be returning the just-committed src/main.js (`curl` diff match), so the environment is ready for whoever runs this check next — see 'Task 2: Outstanding' below."

# Metrics
duration: ~20min
completed: 2026-07-24
status: complete
---

# Phase 8 Plan 2: Shared Leaf Tier Extraction Summary

**Moved the entire ~950-line shared constants/helpers tier (ING_ALL, 88 image-path constants, EMOJI_IMG/emojify, DIRS-family, TET, names/colors, `man`) out of `index.html` verbatim into `src/shared/index.js` (120 named exports total), relocated the three D-06 impurities and the ASSET_BASE parse-time hazard into two new bootstrap functions, and annotated all six order-load-bearing constants — with 30/30 corpus seeds green throughout.**

## Performance

- **Duration:** ~20 min active execution (Task 1 code motion + full automated verification)
- **Started:** 2026-07-24T15:10:00Z (approx.)
- **Completed:** 2026-07-24T15:32:00Z (approx.)
- **Tasks:** 2 (Task 1 code motion, Task 2 browser smoke check)
- **Files modified:** 4 (`index.html`, `src/shared/index.js`, `src/main.js`, `scripts/lib/load_engine.js`)

## Accomplishments

- The full shared leaf tier — every symbol ROADMAP criterion 1 and the plan's artifact list name — moved byte-identical out of `index.html` into `src/shared/index.js`: mechanically verified via `diff` between the moved content (with annotations stripped) and the original source slice, not just asserted by eye. 120 named exports, confirmed importable by plain Node with zero DOM (`node --input-type=module -e "import(...)"` exit 0).
- The three D-06 impurities (`--clock-img`/`--flip-socket-img` `setProperty` calls, `document.body.innerHTML=emojify(...)`) relocated verbatim, together with the six-line comment that explains the third, into a new `applyEngineBootstrapEffects()` declared just above `function boot(){`.
- The one genuinely top-level ASSET_BASE parse-time hazard (`RECIPE_BOOK.forEach(...)`at the old `index.html:2085`) deferred into `attachPastryArt()`, called from `src/main.js` after the bridge is populated — `RECIPE_LOOKUP` construction directly below it stays at top level unchanged since it references no moving symbol.
- `src/main.js` now calls, in the documented order: `applyEngineBootstrapEffects()` → `attachPastryArt()` → increment `window.__pp_boot_count` → `window.boot()`, with a comment recording why the ordering matters (the relocated comment's own "before any element-lookup/event-wiring below runs" invariant, `boot()` being where that wiring happens).
- Six `// ORDER IS LOAD-BEARING` annotations added, one each on `DIRS`, `DIRNAME`, `PERP`, `STORM_DIAG`, `OPPOSITE`, `TET`, each with a construct-specific mechanism explanation (not a repeated generic sentence) — verified by exact-count grep (=6) and per-construct `grep -B1` (all six found immediately above their declaration).
- All 24 of Task 1's acceptance criteria pass, individually re-verified after writing this summary: determinism `--verify` (30/30, exit 0), `npm test` (exit 0), `real_game_test.js 25` (exit 0), the annotation-count and per-construct checks, three literal byte-order greps (DIRS/DIRNAME/OPPOSITE), the comment-stripped purity grep (zero hits), the four negative greps confirming `ING_ALL`/`DIRS`/`ASSET_BASE`/top-level `RECIPE_BOOK.forEach` no longer exist in `index.html`, the single-`<script>`-tag count, and the corpus-fixture untouched checks (one commit deep, clean working tree).
- `index.html` shrank from 5,629 to 5,469 lines (−160 net: −174 for the deleted shared tier, +14 for the two new bootstrap-function wrappers).

## Task Commits

Each task was committed atomically:

1. **Task 1: Move the shared leaf tier out verbatim, relocate the three impurities, defuse the ASSET_BASE parse hazard** - `240abf6` (feat)
2. **Task 2: Browser load smoke check** - no commit (verification-only task per its own `<files>` declaration; automated portion run and passing, browser portion outstanding — see below)

_Task 1 was verified with `node scripts/determinism_baseline.js --verify` both immediately before and immediately after its commit, per this plan's critical invariant #2._

**Plan metadata:** committed alongside this summary (see final commit below).

## Files Created/Modified

- `src/shared/index.js` - extended from 08-01's `mulberry32`-only barrel to the complete shared leaf tier: `ING_ALL`, `ING_EMOJI`, `ASSET_BASE`, all 88 `*_IMG` constants (including `CLOCK_IMG`, `FLIP_SOCKET_IMG`, `EMOJI_IMG`, `BOAT_IMG`, `ISLAND_SHAPE_IMG`), `EMOJIFY_RE`/`emojify`, `TET`, the `ING_NAME`/`ING_PLAIN`/`DOCK_PLACE`/`DOCK_FLAVOR` tables and their label helpers, `DIRS`/`DIRNAME`/`PERP`/`STORM_DIAG`/`OPPOSITE`/`SAIL_BUDGET(_LEEWARD)`/`windStepCost`, `NAMES`/`DEFAULT_NAMES`/`unusedDefaultName`, `COLORS`/`HEXCOL`, `man` — six `ORDER IS LOAD-BEARING` annotations added, trailing `export { ... }` block extended to 120 names
- `index.html` - the ~950-line shared tier deleted with no tombstone (including the boundary blank line, to avoid a double-blank artifact); `function applyEngineBootstrapEffects(){...}` added just above `function boot(){`, holding the three relocated D-06 impurities; `RECIPE_BOOK.forEach(...)` wrapped in a new `function attachPastryArt(){...}`; single `<script>` tag count, `const $=...`, and `let game=null,...` all confirmed untouched
- `src/main.js` - now calls `window.applyEngineBootstrapEffects()`, `window.attachPastryArt()`, increments `window.__pp_boot_count`, then `window.boot()`, with a comment documenting the ordering invariant
- `scripts/lib/load_engine.js` - comment corrected: the `document` stub in the `vm` sandbox is now unused by the extracted Game/roundCfg slice (the statement that needed it moved past the `escHtml` boundary), left in place defensively but no longer described as active

## Decisions Made

- **Mechanical extraction over manual retyping.** The moved block spans ~950 lines dense with multi-codepoint emoji and combining variation selectors (e.g. `spice:"🌶️"`, the ZWJ chef/flag emoji in `EMOJI_IMG`). A small Node script sliced exact line ranges from `index.html`, inserted the six annotation lines at precise positions, and wrote the result — then a `diff` between the reconstructed content (annotations stripped) and the original source slice confirmed byte-identical output before anything touched disk. Manual transcription of this volume of Unicode-heavy source risked exactly the kind of silent single-character corruption that, for an RNG-sensitive table, would surface as a corpus failure rather than a visible diff.
- **Deleted the boundary blank line along with the moved block.** Removing `index.html:862`-`1034` alone would have left two consecutive blank lines where the shared tier used to sit (the pre-existing separator blank line plus the one that used to precede `// Bot decision weights`). Extending the deletion to include that second blank line avoids a stray artifact at the deletion site without touching any surviving code — consistent with the "no tombstone" invariant's spirit even though it's whitespace, not a comment.
- **Corrected the now-stale `document` stub comment in `load_engine.js`** rather than leaving it describing behavior that no longer occurs in the extracted slice, following the precedent 08-01 set for the same file's header comment. The stub itself is unchanged (still harmless to keep).
- **Per-construct ORDER IS LOAD-BEARING reasons**, matching RESEARCH.md's own mechanism descriptions per construct rather than one repeated sentence, so each annotation is independently useful to a future reader.

## Deviations from Plan

None — plan executed exactly as written. Task 1's code motion, annotation placement, bootstrap-function extraction, and `src/main.js` wiring match the plan's `<action>` step-by-step. The `load_engine.js` comment correction and the boundary-blank-line deletion are both documentation/hygiene choices within the plan's own instructions (§G asked to "confirm... resolves"; the no-tombstone invariant covers the blank-line choice), not scope additions.

## Issues Encountered

- **This executor lacks browser-automation tooling**, the same gap 08-01's Task 2 hit: no Chrome MCP tools, and `command -v chrome/chromium/google-chrome` plus `npx playwright --version` all confirm nothing is available in this execution context. Task 1's automated verification (determinism, `npm test`, `real_game_test.js`, all 24 acceptance-criteria greps) required no browser and ran cleanly. Task 2's *automated* half — confirming the dev server's cwd matches this worktree and that `git status`/`determinism_baseline.js --verify` are clean — was completed and passes (server on port 8777, `lsof` cwd match, `curl` content match against the just-committed `src/main.js`). Task 2's *browser* half (loading the page, reading `window.__pp_boot_count`/`window.PP`, screenshotting the lobby, opening the recipe modal) could not be performed by this executor and is handed back — see below.

## Task 2: Outstanding

**Automated portion — done and passing:**
- Dev server confirmed serving this exact worktree: `lsof -p <pid> | grep cwd` → `/Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/new-session-d6e9d7`, port `8777`.
- `curl http://localhost:8777/src/main.js` byte-matches the just-committed file (`diff` clean) — the server is not a stale sibling-worktree instance.
- `git status --porcelain` — empty (Task 1 committed cleanly).
- `node scripts/determinism_baseline.js --verify` — 30/30 PASS, run again post-commit.

**Browser portion — NOT performed, requires Chrome MCP or equivalent tooling this executor does not have:**
- Load `http://localhost:8777/` in Chrome and confirm: `window.__pp_module_ok === true`, `typeof firebase === "object"`, `window.__pp_boot_count === 1` (not `2`, not `undefined`), `document.querySelectorAll('script[src="src/main.js"]').length === 1`, `typeof window.PP === "object"` with `Object.keys(window.PP).length >= 50`.
- Confirm `getComputedStyle(document.documentElement).getPropertyValue('--clock-img')` contains `clock.png` and `--flip-socket-img` contains `flip-socket.png`.
- Confirm the lobby renders with custom `<img>` art swapped in for static emoji (proving `applyEngineBootstrapEffects()` ran at its new module-time position).
- Open the recipe modal and confirm pastry artwork is present (proving `attachPastryArt()` ran).
- Confirm a single lobby-control click produces exactly one response (no double-wiring from a double boot).
- Confirm a clean console (zero `ReferenceError`/`is not defined`/`Failed to load module`) from page load through the recipe-modal check.

**Why this matters and can't be skipped:** Task 1's 30-seed corpus runs `Game.play()` headlessly in Node and would stay green even if the page never rendered a pixel — the corpus structurally cannot catch a page-load regression. The one behavior-adjacent change in this plan (the `document.body.innerHTML` rewrite moving from parse time to module time, meaning it now re-serialises and re-parses the whole body including the classic `<script>` elements, which the HTML parser marks non-executable on `innerHTML` insertion) is exactly the class of regression this browser check exists to catch, per D-17's own rationale. This executor completed everything within reach and is handing back only the piece that genuinely requires interactive browser tooling — the same pattern 08-01 established for its own Task 2.

**Next step:** run this check with Chrome MCP (or ask Wyatt to run it manually) before treating Phase 8's D-17 requirement as fully satisfied for this plan; record the transcript in this file or a follow-up note once done.

## User Setup Required

None - no external service configuration required. Zero dependencies, zero package-manager installs (this phase introduces none).

## Next Phase Readiness

- `src/shared/index.js` is now the complete Phase 8 shared leaf tier (120 exports) — 08-03 can proceed with the `class Game`/`roundCfg` extraction into `src/engine/index.js`, importing from this same barrel.
- `scripts/lib/load_engine.js`'s hybrid `vm` sandbox already spreads the full `...shared` namespace via its existing `import * as shared from "../../src/shared/index.js"` — no change was needed there for this plan's symbol additions to take effect; 08-03 replaces the whole function body with a native import once the engine region is fully evacuated.
- The corpus fixtures remain untouched (one commit deep each for the `.jsonl` files and `manifest.json`) — the D-01/D-02 tripwires held before, during, and after this plan.
- **Blocker for full sign-off (not for 08-03 proceeding):** Task 2's Chrome browser check is outstanding, as detailed above. 08-03 can start regardless (it depends on the shared tier existing, which it does, not on the browser check), but Phase 8's D-17 requirement is not yet fully satisfied until it runs.

## Self-Check: PASSED

- `src/shared/index.js` (120 exports, six annotations) — FOUND, confirmed via `node --input-type=module -e "import(...)"` and grep counts
- `index.html` (shared tier absent, both bootstrap functions present, single `<script>` tag) — FOUND, confirmed via grep
- `src/main.js` (bootstrap call order present) — FOUND, confirmed via grep
- `scripts/lib/load_engine.js` (comment corrected) — FOUND, confirmed via Read
- Commit `240abf6` — FOUND in `git log --oneline --all`

---
*Phase: 08-engine-extraction-node-harness-migration*
*Completed: 2026-07-24*
