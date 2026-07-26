---
phase: 11-ui-extraction-orchestration-bridge-removal
plan: 02
subsystem: ui
tags: [strangler-fig, es-modules, code-motion, shot-clock, host-refresh-recovery, localStorage-bug-fix]

# Dependency graph
requires:
  - phase: 11-ui-extraction-orchestration-bridge-removal
    provides: "11-01's proven move-verbatim/import-rewire/bridge-grows/gates-green pattern, src/ui/recipe.js + src/ui/index.js barrel, module_graph_check.js, ui_contract_check.js"
provides:
  - "src/ui/util.js — 60 net-free/DOM-free helper/logic-tier functions (formatting, name, board geometry, awards/badges, narration-string, session persistence, solo-state, shot-clock control) moved verbatim out of the classic <script> region"
  - "index.html classic region shrunk from 183 to 116 top-level functions (67 moved across 11-01+11-02)"
  - "scripts/dlog_replay_test.js modernized to a native `import` of replayShortfall/REPLAY_SHORTFALL_TOLERANCE from src/ui/util.js, retiring its node:vm sentinel-comment slicing of index.html"
  - "Real bug fix: saveSoloState() now correctly reads appState.soloMeta (was reading a bare, undefined `soloMeta` — pp_solo localStorage was never actually being written)"
affects: [11-03-ui-extraction, 11-04-ui-extraction, 11-05-ui-extraction, 11-06-ui-extraction, 11-07-bridge-removal, 11-08-safari-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "cellPx/shipEls explicit-parameter threading: when a moved function reads a classic-script-local mutable `let` (board render state like `cell`/`shipEls`, not part of Phase 10's appState migration, and not exclusive to the moving cluster so it can't just move too), give the function an explicit parameter and update its still-classic call sites to pass the value — instead of a globalThis workaround or blocking the move entirely"
    - "EVENT_NARRATION callback entries that need the same render-only state (battle/aground/shotclockskip, which read `cell` for pop-icon math) gained an optional third `cellPx=0` parameter; describe()/captions() (which never read `.pops`) call with the harmless 2-arg default, while the real pop-consumer (spawnPops) passes the live value"
    - "Retiring a node:vm sentinel-comment index.html-slicing test harness in favor of a native ES module import, once the sliced code has a permanent home — scripts/dlog_replay_test.js is the first instance of this pattern in Phase 11"

key-files:
  created: []
  modified:
    - src/ui/util.js
    - src/ui/index.js
    - src/main.js
    - index.html
    - scripts/dlog_replay_test.js

key-decisions:
  - "islandArtPlacement/shipXY/islandXY/spawnPops gained an explicit cellPx parameter, and boatXY gained a shipEls parameter, rather than leaving them reading the classic-script `cell`/`shipEls` `let`s as bare identifiers — those variables are Phase-10-unmigrated, DOM-render-only state, not exclusive to this cluster (dozens of still-classic call sites also read them), so unlike 11-01's RECIPE_BOOK precedent they cannot simply move into the module too"
  - "EVENT_NARRATION (a classic-script const, not a function — invisible to analyze_classic.mjs's function-only inventory, same class of gap 11-01 hit with RECIPE_BOOK) moved alongside describe()/captions()/spawnPops() as an EXPORTED (not module-private) symbol, since it stayed necessary as a bare-global read from other still-classic call sites during the interim between this task and whenever the remaining consumers move"
  - "scripts/dlog_replay_test.js's node:vm sentinel-comment slicing of index.html was retired in favor of a native `import { replayShortfall, REPLAY_SHORTFALL_TOLERANCE } from '../src/ui/util.js'` — the whole reason for the vm slicing hack (nothing could import a classic-script global) no longer applies once the function is a real ES module export"
  - "Fixed a real, live Rule-1 bug found while moving saveSoloState(): it read a bare `soloMeta` identifier (undefined) instead of `appState.soloMeta`, a leftover from the Phase 10 appState migration that its own tooling missed — the surrounding try/catch silently swallowed the ReferenceError every time, so pp_solo has never actually persisted to localStorage. Fixed while moving; verified determinism/module-graph stay green (this bug was in a caught/dead branch, not in an RNG-affecting path)"
  - "botBeat/narrateCurrent/applyShotClockPenalty/toggleShotClockPause/shotClockTick/spawnPops all call still-classic DOM functions (liveRender/flash/setClockUI/popEmoji) via bare identifier — same bridge-resolution mechanism already used by ask() (11-02's first commit) calling netNarrate/localAsk/remotePrompt; analyze_classic.mjs's dom:false classification checks only a function's OWN body for DOM-API literal patterns (document/window/$(/el(/innerHTML/appendChild/getElementById/querySelector/createElementNS), not its call graph, so this is not a misclassification — moving these functions as designed is correct, not an escape-clause case"

requirements-completed: []  # SPLIT-03/05/06 deliberately NOT marked complete — 2 of 8 phase plans done, 67 of 183 functions extracted, PP bridge still present by design (strangler-fig mechanism remaining waves rely on)

coverage:
  - id: D1
    description: "Pure formatting/name/geometry/awards/narration-string helper cluster (28 functions: seatDisplayOrder, dockOrient, islandArtPlacement, tracePolygonLoops, roundedPathFromLoop, shipXY, pname, rawName, pn, poss, fl, fmtItem, windHoldPhrase, EVENT_NARRATION, describe, syncLogLines, pulseEl, islandXY, captions, computeAwards, assignBadges, pastelize, apBtnStyle, resolveOpt, ask, armClock, msgHoldMs, boatXY) extracted verbatim into src/ui/util.js"
    verification:
      - kind: other
        ref: "node scripts/determinism_baseline.js --verify (30/30); node scripts/module_graph_check.js (7/7 PASS); grep -c 'function computeAwards\\|function describe\\|function assignBadges' index.html returns 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Session/solo-state/shot-clock helper cluster (32 functions/consts: getMyId, genCode, saveSession, clearSession, encodeDec, decodeDec, saveSoloState, clearSoloState, resumeSoloGame, replayShortfall/REPLAY_SHORTFALL_TOLERANCE, fixEv, startShotClock, stopShotClock, rearmShotClock, toggleShotClockPause, shotClockTick, applyShotClockPenalty, currentTurnSeat, soloBotGame, waitWhilePaused, stepDelay, botBeat, narrateCurrent, setActor, seatLocal, decisionIsLocal, seatStrat, spawnPops, updateRecipeBanner, preloadAssets, withShotClock) extracted verbatim into src/ui/util.js"
    verification:
      - kind: other
        ref: "node scripts/determinism_baseline.js --verify (30/30); node scripts/module_graph_check.js (7/7 PASS); grep -c 'function withShotClock\\|function resumeSoloGame\\|function startShotClock' index.html returns 0; npm test exit 0 (97 PASS lines, 0 real failures)"
        status: pass
    human_judgment: false
  - id: D3
    description: "scripts/dlog_replay_test.js modernized to native import of the moved replayShortfall/REPLAY_SHORTFALL_TOLERANCE, retiring the node:vm sentinel-comment slicing of index.html"
    verification:
      - kind: other
        ref: "node scripts/dlog_replay_test.js (13/13 cases PASS, incl. the real-game end-to-end case)"
        status: pass
    human_judgment: false

# Metrics
duration: ~45min
completed: 2026-07-25
status: complete
---

# Phase 11 Plan 2: Extract Pure Helper + Session/Shot-Clock Clusters Summary

**Moved 60 net-free/DOM-free helper functions (formatting, board geometry, awards, narration text, session persistence, shot-clock control) verbatim into `src/ui/util.js`, fixed a live localStorage bug found along the way, and retired a fragile `node:vm` test-harness hack now that the code it sliced out of `index.html` has a real module home.**

## Performance

- **Duration:** ~45 min
- **Tasks:** 2 (both `type="auto"`)
- **Files modified:** 5 (`src/ui/util.js`, `src/ui/index.js`, `src/main.js` — unmodified but re-verified, `index.html`, `scripts/dlog_replay_test.js`)

## Accomplishments
- Task 1: moved the pure formatting/name/geometry/awards/narration-string cluster (28 exports) into `src/ui/util.js`, extending `src/ui/index.js`'s barrel
- Task 2: moved the session-persistence/solo-state/shot-clock-control cluster (32 more exports, 60 total) into the same file
- Discovered and fixed the same class of "classic-script `let`/`const` invisible to an ES module" landmine 11-01 hit with `RECIPE_BOOK` — this time for `cell`/`shipEls` (board render state) and `EVENT_NARRATION` (a data table, not a function, so invisible to `analyze_classic.mjs`'s function-only inventory) — via explicit parameter-threading and export-not-private treatment, respectively
- Found and fixed a real, previously-invisible bug: `saveSoloState()` referenced a bare, undefined `soloMeta` instead of `appState.soloMeta`, silently swallowed by its own `try/catch` — `pp_solo` localStorage has never actually persisted since the Phase 10 appState migration
- Retired `scripts/dlog_replay_test.js`'s `node:vm` sentinel-comment slicing of `index.html`, replacing it with a native `import` of the now-real `replayShortfall`/`REPLAY_SHORTFALL_TOLERANCE` exports
- `index.html`'s classic-script function count dropped from 183 (pre-Phase-11) to 116; determinism 30/30, module graph 7/7 PASS, full `npm test` green throughout

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract the pure formatting/name/geometry/session helpers into src/ui/util.js** - `df80995` (feat)
2. **Task 2: Extract the session/solo-state/shot-clock helper functions into src/ui/util.js** - `23b527e` (feat)

**Plan metadata:** _pending — this commit_ (docs: complete plan)

## Files Created/Modified
- `src/ui/util.js` - New file (created in Task 1, extended in Task 2): 60 exported helper functions/consts, importing `appState` from `../state/index.js` and `NAMES, HEXCOL, DIRNAME, ING_EMOJI, iname, ilabelImg, dockPlace, dockFlavor, iconImg, ING_IMG, CUPCAKE_IMG, CROWN_IMG, TRADE_SWIRL_IMG, CRATE_OVERBOARD_IMG, TET, ISLAND_SHAPE_IMG, emojify, ASSET_BASE, BOARD_IMG, DOCK_IMG, WIND_ARROW_IMG, BOAT_IMG, ING_ALL` from `../shared/index.js`, plus `escHtml` from the sibling `./recipe.js`
- `src/ui/index.js` - Barrel extended with `export * from "./util.js"`
- `index.html` - Classic `<script>` region shrunk by ~655 lines total across both tasks; all moved functions' call sites updated to pass `cell`/`shipEls` explicitly where needed
- `scripts/dlog_replay_test.js` - Rewritten to `import` the moved `replayShortfall`/`REPLAY_SHORTFALL_TOLERANCE` natively instead of slicing `index.html` with `node:vm`

## Decisions Made
- `islandArtPlacement`/`shipXY`/`islandXY`/`spawnPops` gained an explicit `cellPx` parameter and `boatXY` gained a `shipEls` parameter, rather than reading those classic-script `let`s (owned by still-classic `drawBoard()`/`render()`, not part of Phase 10's appState migration, and shared with dozens of other still-classic call sites) as bare identifiers
- `EVENT_NARRATION`'s `battle`/`aground`/`shotclockskip` entries gained an optional third `cellPx=0` parameter for the same reason; `describe()`/`captions()` (never read `.pops`) call with 2 args and get the harmless default, while `spawnPops` (the real `.pops` consumer) passes the live value
- `EVENT_NARRATION` itself (a classic-script `const`, invisible to modules — same class of gap as 11-01's `RECIPE_BOOK`) moved as an **exported**, not module-private, symbol — unlike `RECIPE_BOOK`, it still has a still-classic bare-global reader (until later waves move that reader too)
- Fixed the `saveSoloState()` bare-`soloMeta` bug in place (Rule 1) rather than moving the bug verbatim — it's a genuine functional defect (broken solo-game persistence), not intentional behavior to preserve
- Retired `scripts/dlog_replay_test.js`'s `node:vm` sentinel-comment slicing of `index.html` in favor of a native `import`, since the code it sliced now has a permanent module home — the first instance of this "harness modernization" pattern in Phase 11
- Determined via direct code reading (not relying solely on `analyze_classic.mjs`'s regex-based `dom:false` classification) that `botBeat`/`narrateCurrent`/`applyShotClockPenalty`/`toggleShotClockPause`/`shotClockTick`/`spawnPops` calling still-classic DOM functions (`liveRender`/`flash`/`setClockUI`/`popEmoji`) via bare identifier is the same, already-proven bridge-resolution mechanism `ask()` uses for `netNarrate`/`localAsk`/`remotePrompt` — not a case for the plan's DOM-deferral escape clause, since the analyzer's `dom:false` only checks a function's own body, not its call graph

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `saveSoloState()` never actually persisted solo-game state to localStorage**
- **Found during:** Task 2
- **Issue:** `saveSoloState()` read a bare `soloMeta` identifier (`{...soloMeta,dlog:appState.dlog}`) instead of `appState.soloMeta`. `soloMeta` was never declared anywhere as a bare variable — this is a leftover from the Phase 10 appState migration that its own migration tooling missed. The surrounding `try{...}catch(e){}` silently swallowed the resulting `ReferenceError` on every call, so `localStorage.setItem("pp_solo", ...)` never actually ran.
- **Fix:** Changed the read to `appState.soloMeta` while moving the function verbatim into `src/ui/util.js`.
- **Files modified:** `src/ui/util.js`
- **Verification:** `node scripts/determinism_baseline.js --verify` (30/30 — unaffected, this path was dead/caught, not RNG-relevant); `npm test` exit 0
- **Committed in:** `23b527e` (Task 2 commit)

**2. [Rule 3 - Blocking] Moving `replayShortfall`/`REPLAY_SHORTFALL_TOLERANCE` required updating `scripts/dlog_replay_test.js`**
- **Found during:** Task 2
- **Issue:** `scripts/dlog_replay_test.js` (wired into `npm test`) sliced `replayShortfall`'s source out of `index.html` via matched sentinel comments (`/* ===== replayShortfall — extractable region ... ===== */` ... `/* ===== end replayShortfall ===== */`) and ran it in a bare `node:vm` sandbox, because nothing could `import` a classic-script global. Moving the function out of `index.html` (as the plan's own read_first line explicitly names it to do) would have made the sentinel-region lookup fail, throwing "Could not locate the replayShortfall sentinel region" and breaking `npm test`.
- **Fix:** Rewrote the test's extraction-2 section to do a native `import { replayShortfall, REPLAY_SHORTFALL_TOLERANCE } from "../src/ui/util.js"` instead of the `node:fs`/`node:vm` slice-and-sandbox dance. All 13 test cases (synthetic + the real-game end-to-end case) still pass unchanged.
- **Files modified:** `scripts/dlog_replay_test.js`, `src/ui/util.js` (exported `REPLAY_SHORTFALL_TOLERANCE`, not module-private)
- **Verification:** `node scripts/dlog_replay_test.js` (13/13 PASS); `npm test` exit 0
- **Committed in:** `23b527e` (Task 2 commit)

**3. [Rule 1/3 - Bug/Blocking, mirrors 11-01's RECIPE_BOOK finding] `cell`/`shipEls`/`EVENT_NARRATION` are classic-script state invisible to an ES module, and not exclusive to the moving cluster**
- **Found during:** Task 1 (initial dependency read of `islandArtPlacement`/`shipXY`/`islandXY`/`boatXY`), confirmed again in Task 2 (`spawnPops`)
- **Issue:** `cell` (current px-per-grid-cell) and `shipEls` (array of ship `<g>` elements) are classic-script top-level `let`s, mutated by still-classic `drawBoard()`/`render()`, not part of Phase 10's appState migration. Unlike 11-01's `RECIPE_BOOK` (exclusive to the moving cluster, so it could simply move too), these two variables are read by dozens of OTHER still-classic rendering call sites — moving them would break those sites, and leaving them as bare reads inside the newly-moved module functions would `ReferenceError` (same class of bug as 11-01's finding — a classic script's `let` never becomes a module-visible global). `EVENT_NARRATION` (a `const` object, not a `function` — invisible to `analyze_classic.mjs`'s function-only static inventory) has the identical problem for `describe()`/`captions()`/`spawnPops()`, plus one entry (`battle`) that directly reads `cell`.
- **Fix:** `islandArtPlacement`, `shipXY`, `islandXY`, `spawnPops` gained an explicit `cellPx` parameter; `boatXY` gained a `shipEls` parameter. Every still-classic call site (`drawBoard`, `render`, `victoryConfetti`, `showChatBubble`, and `spawnPops`'s own two call sites) was updated in `index.html` to pass the value explicitly. `EVENT_NARRATION`'s `battle`/`aground`/`shotclockskip` entries gained an optional third `cellPx=0` parameter (default-safe for `describe()`/`captions()`, which never read `.pops`); `islandXY`'s two internal call sites inside `EVENT_NARRATION` now pass `cellPx` through. `EVENT_NARRATION` itself moved as an exported (not private) symbol, matching the RECIPE_BOOK-adjacent precedent but with export status flipped since it still needs a bare-global read from a still-classic consumer.
- **Files modified:** `src/ui/util.js`, `index.html`
- **Verification:** `node scripts/determinism_baseline.js --verify` (30/30 both times); `node scripts/module_graph_check.js` (7/7 PASS both times); `npm test` exit 0
- **Committed in:** `df80995` (Task 1), `23b527e` (Task 2)

**4. [Deliberate scope decision — mirrors 11-01's precedent] Did NOT mark SPLIT-03/SPLIT-05/SPLIT-06 complete in REQUIREMENTS.md**
- **Rationale:** This plan is 2 of 8 in Phase 11. 67 of 183 classic functions are now extracted (9 from 11-01 + 58 here), but the `PP` bridge still exists by design (the strangler-fig mechanism the remaining waves rely on), and the vast majority of the board/panel/lobby/flow orchestration functions are still classic. Marking phase-level requirements complete now would misrepresent phase state, matching 11-01's and 09-01's precedent.
- **Files modified:** none (deliberately did not run `requirements mark-complete`)

---

**Total deviations:** 4 (1 auto-fixed real bug, 1 blocking test-harness update, 1 blocking/bug code-motion dependency fix spanning both tasks, 1 deliberate non-completion of phase-level requirements)
**Impact on plan:** The soloMeta fix corrects a real, previously-silent functional defect (solo-game persistence has never worked) — necessary for correctness, not scope creep. The dlog_replay_test.js modernization was required by the plan's own instruction to move replayShortfall; the alternative (not moving it) would have contradicted the plan's read_first list. The cellPx/shipEls/EVENT_NARRATION threading was necessary for the extraction to work at all, exactly mirroring 11-01's documented RECIPE_BOOK finding. No unplanned new functionality was added.

## Issues Encountered
None beyond the deviations documented above — all determinism/module-graph/npm-test gates stayed green throughout both tasks with no unresolved failures.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `src/ui/util.js` now holds 60 of the ~95 originally-identified net-free/DOM-free helper functions (28 from Task 1, 32 from Task 2); the remaining classic region (116 functions) is dominated by board/panel rendering, lobby/boot orchestration, and battle/trade flow — the subject of 11-03 through 11-06
- The `cellPx`/`shipEls` explicit-parameter-threading pattern (for classic-script mutable render state not covered by Phase 10's appState migration) is now proven and documented; the upcoming board/panel wave (which owns `drawBoard()`/`render()`, the actual mutators of `cell`/`shipEls`) is the natural place to fold these back into ordinary same-file references once those functions move too
- `scripts/dlog_replay_test.js`'s harness-modernization pattern (retire a `node:vm`/index.html-slicing hack once the sliced code has a real module home) is available as precedent if any other still-classic sentinel-region test harnesses are discovered in later waves
- The `PP` bridge (`src/main.js`) is unchanged and still growing correctly via `...ui` — `window.PP`/`Object.assign(globalThis, PP)` continue to republish everything `src/ui/index.js` exports, so all still-classic callers of the 60 newly-moved functions keep resolving them as bare globals
- Blocker/concern carried forward from 11-01: D-12's Safari storm re-verification is still owed to a real human, deferred to 11-08 per CONTEXT.md

---
*Phase: 11-ui-extraction-orchestration-bridge-removal*
*Completed: 2026-07-25*

## Self-Check: PASSED

All claimed files found on disk (`src/ui/util.js`, `scripts/dlog_replay_test.js`); both task commits (`df80995`, `23b527e`) found in git log.
