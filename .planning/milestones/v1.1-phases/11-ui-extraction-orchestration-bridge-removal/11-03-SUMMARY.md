---
phase: 11-ui-extraction-orchestration-bridge-removal
plan: 03
subsystem: ui
tags: [strangler-fig, es-modules, code-motion, safari-storm-fix, board-render]

# Dependency graph
requires:
  - phase: 11-ui-extraction-orchestration-bridge-removal
    provides: "11-02's proven move-verbatim/import-rewire/bridge-grows/gates-green pattern, src/ui/util.js's shipXY/islandXY/boatXY/spawnPops cellPx-parameter-threading precedent, src/ui/recipe.js's `$` duplication precedent"
provides:
  - "src/ui/board.js — the board + storm rendering cluster (el, iconAt, drawBoard, buildStormLayers, render, renderLog, popEmoji, celebrateHomeDocks, victoryConfetti, showStats, setFlipCoin, setFlipActive, renderDecorativeBoard, syncBoardSizing), 14 functions moved byte-identical out of the classic <script> region — carries the v1.0 BUG-01 storm-crash fix (pre-baked PNG rain tile, snap-not-animate) untouched"
  - "index.html classic region shrunk from 116 to 102 top-level functions (14 moved this wave)"
  - "boardCell()/boardShipEls()/resetBoardLog() — three narrow exported accessors bridging the classic script's remaining reads of cell/shipEls/logRenderedTo (now module-private state owned by drawBoard/render/renderLog), used at 6 still-classic call sites until those callers move in a later wave"
affects: [11-04-ui-extraction, 11-05-ui-extraction, 11-06-ui-extraction, 11-07-bridge-removal, 11-08-safari-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "boardCell()/boardShipEls()/resetBoardLog() accessor functions: when the MOVING function is the OWNER/mutator of a classic-script render-only `let` (not just a reader, the reverse of 11-02's cellPx-parameter case), and other still-classic functions read/reset that same `let`, a plain module-scope `let` plus narrow exported accessor functions is used instead of a parameter — because the classic reader has no value of its own to pass in (there's nothing to thread; the state now lives only inside the module). Same root cause as 11-02's cellPx finding (a classic script's `let` is invisible to an ES module, and the PP bridge's one-time snapshot can't observe a later reassignment), opposite direction (owner moved, not just a reader)."
    - "Object-valued classic-script state (chatBubbles) moves as an EXPORTED object with zero accessor needed, unlike primitive/reassigned-array state (cell/shipEls/logRenderedTo) — because Object.assign(globalThis, PP)'s one-time snapshot copies the reference for objects, and in-place mutation (chatBubbles[i]=b, delete chatBubbles[i], never chatBubbles={}) keeps that reference live for every consumer, exactly like appState. This is the same distinction 11-02's EVENT_NARRATION finding established, applied to a second object."
    - "A transitional shim (boardCell()) can move house between the two tasks of a single plan: task 1 added it to still-classic celebrateHomeDocks/victoryConfetti (needed only because task 1 moved `cell`'s declaration out from under them); task 2 removed it again once those two functions themselves moved into the same module as `cell` — the net result across both commits is byte-identical to the pristine pre-Phase-11 source, confirmed by diffing against git history two commits back, not just one."

key-files:
  created:
    - src/ui/board.js
  modified:
    - src/ui/index.js
    - index.html

key-decisions:
  - "cell/shipEls/activeRing/spinNeedle/stormText/stormDial/windLabels/logRenderedTo (the 7 UI-render-handle names src/state/index.js's own header already flagged as deliberately excluded from Phase 10's appState migration and left for Phase 11) moved into src/ui/board.js as ordinary module-scope let/const, since drawBoard()/render()/renderLog() — all moving this wave — are their sole mutators."
  - "Of those 8 names, 3 (cell, shipEls, logRenderedTo) have still-classic external readers/writers not moving this wave (localPickCell, remotePickHighlights, showChatBubble, liveRender, watchEvents, beginGame) — exported boardCell()/boardShipEls()/resetBoardLog() accessor functions for exactly those 6 call sites rather than leaving them as unresolvable bare reads. The other 5 (activeRing/spinNeedle/stormText/stormDial/windLabels) have zero external readers (grep-confirmed) and stayed module-private with no accessor."
  - "chatBubbles (a classic-script const object, not itself a function so invisible to analyze_classic.mjs's function-only inventory — same class of gap as 11-01's RECIPE_BOOK and 11-02's EVENT_NARRATION) moved alongside render() as an EXPORTED object with zero code changes needed at its 4 still-classic consumer sites (positionChatBubble/showChatBubble/removeChatBubble/clearChatBubbles) — it survives the PP bridge's snapshot because it's mutated in place, never reassigned wholesale."
  - "celebrateHomeDocks/victoryConfetti (task 1, still classic) temporarily read `cell` via the new boardCell() accessor rather than a bare identifier, since task 1 moved cell's declaration out from under them one task early; task 2 moved both functions themselves into src/ui/board.js and reverted that temporary read back to a plain `cell` — confirmed byte-identical to the pristine pre-Phase-11 index.html by diffing two commits back."
  - "$ (the classic-script-local DOM-lookup helper) duplicated verbatim as a private module-local const in src/ui/board.js, mirroring 11-01's recipe.js precedent — it's used ~120+ times across the still-classic region far beyond this cluster's own consumers, so it cannot be 'moved' without breaking every other classic call site."
  - "Deliberately left SPLIT-03/05/06 Pending in REQUIREMENTS.md — 3 of 8 phase plans done, 14 more functions extracted (81 of ~183 total across 11-01/02/03), PP bridge still present by design (strangler-fig mechanism remaining waves rely on), matching 11-01/11-02's precedent of not marking multi-plan requirements complete early."

requirements-completed: []  # SPLIT-03/05/06 deliberately NOT marked complete — 3 of 8 phase plans done, bridge still present by design

# Metrics
duration: ~40min
completed: 2026-07-25
status: complete
---

# Phase 11 Plan 3: Board + Storm Rendering Cluster Summary

**Moved the board/storm/celebration DOM cluster (drawBoard, render, buildStormLayers, renderLog, popEmoji, celebrateHomeDocks, victoryConfetti, showStats, setFlipCoin, setFlipActive, renderDecorativeBoard, syncBoardSizing, el, iconAt — 14 functions) byte-identical into `src/ui/board.js`, carrying the v1.0 BUG-01 Safari storm-crash fix untouched, with three narrow accessor functions bridging the classic script's remaining reads of the cluster's render-only state.**

## Performance

- **Duration:** ~40 min
- **Tasks:** 2 (both `type="auto"`)
- **Files modified:** 3 (`src/ui/board.js` created, `src/ui/index.js`, `index.html`)

## Accomplishments
- Task 1: moved el, iconAt, drawBoard, buildStormLayers, render, renderLog, popEmoji, renderDecorativeBoard, syncBoardSizing — the storm-critical render path — byte-identical into `src/ui/board.js`, extending `src/ui/index.js`'s barrel
- Task 2: moved the remaining board-adjacent DOM/celebration helpers (setFlipCoin, setFlipActive, celebrateHomeDocks, victoryConfetti, showStats) into the same file
- Byte-diffed every one of the 14 moved function bodies against the pristine pre-Phase-11 `index.html` (via `git show`, not just eyeballing) — all 14 are character-for-character identical to the original source
- Introduced `boardCell()`/`boardShipEls()`/`resetBoardLog()` — three narrow exported accessors — so the 6 still-classic call sites that read this cluster's render-only state (which drawBoard/render/renderLog now own as module-private `let`s) keep resolving correctly until those callers move in a later wave
- `index.html`'s classic-script function count dropped from 116 (post-11-02) to 102; determinism 30/30, module graph 7/7 PASS, full `npm test` green after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract drawBoard/render/storm layers into src/ui/board.js** - `5173a05` (feat)
2. **Task 2: Extract the remaining board-adjacent DOM helpers into src/ui/board.js** - `db74f3f` (feat)

**Plan metadata:** _pending — this commit_ (docs: complete plan)

## Files Created/Modified
- `src/ui/board.js` - New file: 14 exported functions (el, iconAt, drawBoard, buildStormLayers, render, renderLog, popEmoji, celebrateHomeDocks, victoryConfetti, showStats, setFlipCoin, setFlipActive, renderDecorativeBoard, syncBoardSizing) plus `boardCell()`/`boardShipEls()`/`resetBoardLog()` accessors and the exported `chatBubbles` object; imports `appState` from `../state/index.js`, `Game`/`roundCfg` from `../engine/index.js`, 25 image/constant names + `iconImg`/`iname`/`ingImg` from `../shared/index.js`, `dockOrient`/`tracePolygonLoops`/`roundedPathFromLoop`/`islandArtPlacement`/`shipXY`/`pulseEl`/`describe`/`assignBadges`/`pname`/`pn` from `./util.js`, and `recipeTitle` from `./recipe.js`; duplicates the classic-local `$` DOM helper verbatim (11-01 precedent)
- `src/ui/index.js` - Barrel extended with `export * from "./board.js"`
- `index.html` - Classic `<script>` region shrunk by 14 functions (~430 net lines); 6 call sites (`liveRender`, `watchEvents`, `localPickCell`, `remotePickHighlights`, `showChatBubble`, `beginGame`) updated to call the new `boardCell()`/`boardShipEls()`/`resetBoardLog()` accessors instead of reading `cell`/`shipEls`/`logRenderedTo` as bare identifiers; the classic `const chatBubbles={}` declaration removed (its 4 remaining classic consumers — `positionChatBubble`/`showChatBubble`/`removeChatBubble`/`clearChatBubbles` — now resolve it as a bare global via the PP bridge with zero code changes, since it's an object mutated in place)

## Decisions Made
- `cell`/`shipEls`/`activeRing`/`spinNeedle`/`stormText`/`stormDial`/`windLabels`/`logRenderedTo` (the 7 render-handle names src/state/index.js's header already flagged as deliberately excluded from Phase 10 and left for Phase 11) moved into `src/ui/board.js` as ordinary module-scope `let`s, since `drawBoard()`/`render()`/`renderLog()` — all moved this wave — are their sole mutators
- Of those, `cell`/`shipEls`/`logRenderedTo` also have still-classic external readers/writers not moving this wave — exported `boardCell()`/`boardShipEls()`/`resetBoardLog()` accessor functions for exactly those 6 call sites, rather than leaving them as unresolvable bare reads (a classic script can't `import` a module-local `let`, and the PP bridge's one-time snapshot can't observe a later reassignment — same root cause as 11-02's cellPx finding, opposite direction: here the OWNER moved, not just a reader)
- `activeRing`/`spinNeedle`/`stormText`/`stormDial`/`windLabels` have zero readers outside this cluster (grep-confirmed against the whole file) and stayed module-private with no accessor needed
- `chatBubbles` (a classic-script `const` object, invisible to `analyze_classic.mjs`'s function-only inventory — same class of gap as 11-01's RECIPE_BOOK and 11-02's EVENT_NARRATION) moved alongside `render()` as an EXPORTED object with zero code changes at its 4 still-classic consumer sites, since it's mutated in place (never reassigned wholesale) and so survives the PP bridge's snapshot exactly like `appState` does
- Task 1 temporarily patched `celebrateHomeDocks`/`victoryConfetti` (still classic at that point) to read `cell` via the new `boardCell()` accessor, since task 1's move of `drawBoard`/`render` pulled `cell`'s declaration out from under those two not-yet-moved functions one task early; task 2 moved both functions into `src/ui/board.js` and reverted that temporary read back to a plain `cell` — confirmed byte-identical to the pristine pre-Phase-11 source (not just to the task-1 intermediate state) by diffing two commits back in git history
- `$` duplicated verbatim as a private module-local const in `src/ui/board.js`, mirroring 11-01's `recipe.js` precedent, rather than moved (it's used ~120+ times elsewhere in the still-classic region)
- Deliberately did not mark SPLIT-03/SPLIT-05/SPLIT-06 complete in REQUIREMENTS.md — 3 of 8 phase plans done, 81 of ~183 functions now extracted (67 from 11-01/11-02 + 14 here), PP bridge still present by design, matching 11-01/11-02's precedent

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `boardCell()`/`boardShipEls()`/`resetBoardLog()` accessors were not named in the plan's task list but were required for the move to work at all**
- **Found during:** Task 1 (dependency read of drawBoard/render/renderLog before moving them)
- **Issue:** The plan's task 1 action says to move drawBoard/render/renderLog/etc. "verbatim" and rewire their bare reads into imports, but doesn't account for the reverse direction: these functions are the sole OWNERS/mutators of the classic-script `let`s `cell`/`shipEls`/`logRenderedTo`, and 6 still-classic call sites elsewhere in the file (`liveRender`, `watchEvents`, `localPickCell`, `remotePickHighlights`, `showChatBubble`, `beginGame`) read or reset those same variables as bare identifiers. Once the declarations moved into the module, those 6 sites would `ReferenceError` — a classic script cannot `import` a module-local `let`, and the PP bridge's one-time `Object.assign(globalThis, PP)` snapshot cannot observe a later reassignment (same root cause as 11-02's cellPx/shipEls finding, opposite direction: here the mutator moved, not just a reader).
- **Fix:** Exported three narrow accessor functions (`boardCell()`, `boardShipEls()`, `resetBoardLog(v)`) from `src/ui/board.js` and updated the 6 external call sites to use them instead of bare identifiers.
- **Files modified:** `src/ui/board.js`, `index.html`
- **Verification:** `node scripts/determinism_baseline.js --verify` (30/30); `node scripts/module_graph_check.js` (7/7 PASS); `npm test` exit 0; manual grep confirming zero remaining bare `cell`/`shipEls`/`logRenderedTo` reads outside `src/ui/board.js`
- **Committed in:** `5173a05` (Task 1 commit)

**2. [Rule 3 - Blocking] `chatBubbles` — a classic-script `const` object, not named in the plan's read_first list — had to move alongside `render()`**
- **Found during:** Task 1 (reading `render()`'s full body before moving it)
- **Issue:** `render()` reads `chatBubbles[i]` (declared elsewhere in the classic script, alongside the chat-bubble UI functions, ~600 lines away from the render cluster) to decide whether to reposition an active bubble. A classic script's top-level `const` never becomes a `window` property the way a `function` declaration does (the same class of gap 11-01 hit with `RECIPE_BOOK` and 11-02 hit with `EVENT_NARRATION`), so `render()` could not read it as a bare global once moved into a module unless `chatBubbles` moved too.
- **Fix:** Moved `const chatBubbles={}` into `src/ui/board.js` as an EXPORTED object (not module-private), since it's mutated in place (`chatBubbles[i]=b`, `delete chatBubbles[i]`, never reassigned wholesale) — the same class of object that survives the PP bridge's one-time snapshot, exactly like `appState`. Its 4 still-classic consumers (`positionChatBubble`/`showChatBubble`/`removeChatBubble`/`clearChatBubbles`) needed zero code changes, since they already read/write it as a bare identifier and the bridge now supplies the same live object reference.
- **Files modified:** `src/ui/board.js`, `index.html`
- **Verification:** `node scripts/determinism_baseline.js --verify` (30/30); `npm test` exit 0
- **Committed in:** `5173a05` (Task 1 commit)

**3. [Rule 3 - Blocking] `celebrateHomeDocks`/`victoryConfetti` needed a temporary fix in Task 1, reverted in Task 2**
- **Found during:** Task 1, after moving `cell`'s declaration into `src/ui/board.js`
- **Issue:** `celebrateHomeDocks`/`victoryConfetti` (task 2's functions, still classic at task-1 time) read bare `cell` directly. Since task 1 moved `cell`'s declaration into `src/ui/board.js` one task early (it's owned by `drawBoard`, task 1's function), leaving these two functions untouched would have broken them the moment task 1's commit landed — a self-inflicted correctness regression scoped entirely to this plan's own commits, not a pre-existing issue.
- **Fix:** Task 1 patched both functions to read `cell` via the new `boardCell()` accessor (documented deviation #1 above). Task 2 then moved both functions into `src/ui/board.js` itself and reverted the accessor call back to a plain `cell` read, since they now live in the same module scope as the declaration — confirmed byte-identical to the pristine pre-Phase-11 source (verified against git history two commits prior, not just the task-1 intermediate state).
- **Files modified:** `index.html` (task 1), `src/ui/board.js` (task 2)
- **Verification:** byte-diff of both functions against the original `index.html` (pre-11-03) showed zero difference after task 2; `npm test` exit 0 after both tasks
- **Committed in:** `5173a05` (Task 1 patch), `db74f3f` (Task 2 move + revert)

**4. [Deliberate scope decision — mirrors 11-01/11-02's precedent] Did NOT mark SPLIT-03/SPLIT-05/SPLIT-06 complete in REQUIREMENTS.md**
- **Rationale:** This plan is 3 of 8 in Phase 11. 81 of ~183 classic functions are now extracted (67 from 11-01/11-02 + 14 here), but the `PP` bridge still exists by design (the strangler-fig mechanism the remaining waves rely on), and most of the panel/lobby/flow orchestration functions are still classic. Marking phase-level requirements complete now would misrepresent phase state, matching 11-01's and 11-02's precedent.
- **Files modified:** none (deliberately did not run `requirements mark-complete`)

---

**Total deviations:** 4 (3 blocking code-motion dependency fixes required for the move to work at all, 1 deliberate non-completion of phase-level requirements)
**Impact on plan:** All three blocking fixes are mechanical plumbing necessitated by the move itself — none change algorithmic behavior. Every one of the 14 moved function bodies is byte-identical to the pristine pre-Phase-11 source (independently verified via `git show` diffing, not just visual inspection), so the v1.0 BUG-01 storm-crash fix carries through untouched. No unplanned new functionality was added.

## Issues Encountered
None beyond the deviations documented above — all determinism/module-graph/npm-test gates stayed green throughout both tasks with no unresolved failures.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `src/ui/board.js` now holds the full board/storm/celebration rendering cluster (14 functions); the storm render path (drawBoard/buildStormLayers/render) is byte-identical to the classic source, preserving the v1.0 BUG-01 fix for 11-08's Safari re-verification
- `boardCell()`/`boardShipEls()`/`resetBoardLog()` are a documented, temporary bridging mechanism — the next waves that move `localPickCell`/`remotePickHighlights`/`showChatBubble`/`liveRender`/`watchEvents`/`beginGame` into `src/ui/` should fold their `cell`/`shipEls`/`logRenderedTo` reads back into ordinary same-module references and can then remove these three accessors, per 11-02's own "Next Phase Readiness" note anticipating exactly this outcome
- The `PP` bridge (`src/main.js`) is unchanged and still growing correctly via `...ui` — `window.PP`/`Object.assign(globalThis, PP)` continue to republish everything `src/ui/index.js` exports, including the newly-moved 14 functions, `chatBubbles`, and the 3 accessors
- Blocker/concern carried forward from 11-01/11-02: D-12's Safari storm re-verification is still owed to a real human, deferred to 11-08 per CONTEXT.md — this wave's byte-identical move is exactly what that re-verification will confirm held

---
*Phase: 11-ui-extraction-orchestration-bridge-removal*
*Completed: 2026-07-25*

## Self-Check: PASSED

All claimed files found on disk (`src/ui/board.js`, this SUMMARY); both task commits (`5173a05`, `db74f3f`) found in git log.
