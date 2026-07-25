---
phase: 11-ui-extraction-orchestration-bridge-removal
plan: 05
subsystem: ui
tags: [strangler-fig, es-modules, code-motion, handler-injection, directional-boundary, determinism]

# Dependency graph
requires:
  - phase: 11-ui-extraction-orchestration-bridge-removal
    provides: "11-01/02/03/04's proven move-verbatim/import-rewire/bridge-grows/gates-green pattern; src/ui/panel.js's liveRender/flash/panel/setNeedsAction/narrateLastEvent, board.js's boardCell()/setFlipActive/el, util.js's ask/setActor/pn/armClock/decisionIsLocal/withShotClock/stepDelay/botBeat/seatStrat/saveSoloState/replayShortfall, lobby.js's passGate/requireName, handlers.js's setNetHandlers/netHandlers seam stood up in 11-04"
provides:
  - "src/ui/flow.js — the turn-flow, interaction, battle-UI, side-bet, intro, game-start, and recovery/replay clusters (31 functions), the deepest layer of src/ui/"
  - "All 5 of the milestone's UI->orchestration seam edges (RESEARCH.md Q1b) resolved through src/ui/handlers.js's injected-handler seam: flash->onBroadcast, liveRender->onEvents (11-04) plus remotePickHighlights->onRespond, endReplay->onRecovery, wireRestoreFail->onRecovery+onLeave (this plan)"
  - "index.html classic region shrunk from 80 to 49 top-level functions (31 moved this wave) — now holds only the 44 orchestration net-callers (incl. battleAsk/renderBattle/watchBattle/asyncBattle) plus top-level wiring/constants"
affects: [11-06-orchestration-extraction, 11-07-bridge-removal, 11-08-safari-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Handler-injection seam completion: the 3 remaining UI-side edges (remotePickHighlights, endReplay, wireRestoreFail) each replace a direct call to a still-classic net-adjacent function with a call through netHandlers().onX?.(...), mirroring 11-04's flash/liveRender precedent exactly. src/main.js's ui.setNetHandlers() call now wires all 5 targets (onBroadcast/onEvents/onRespond/onRecovery/onLeave) through the still-present PP bridge."
    - "Calls into still-classic orchestration that are NOT among the 6 identified seam edges (broadcastFlip, netNarrate, netBroadcast, remotePrompt, logDecision, asyncBattle, battleAsk, renderBattle) are left as bare identifiers inside the moved functions — they resolve via the PP bridge exactly like every other still-classic cross-reference this phase; only the specifically-identified edges get handler-injection treatment."
    - "$/sleep module-local duplicates (same class as 11-01/03/04's precedent): both classic-script-local consts, reproduced verbatim as private module-scope duplicates in flow.js since they're used by dozens of still-classic call sites beyond this cluster."

key-files:
  created:
    - src/ui/flow.js
  modified:
    - src/ui/index.js
    - src/ui/handlers.js
    - src/main.js
    - index.html

key-decisions:
  - "battleAsk/renderBattle/watchBattle/asyncBattle deliberately NOT moved — 11-analysis.json classifies all four as orchestration (each calls a net-adjacent function directly: netBroadcast/netSetBattle/netWatchBattle/netRemoveBattle); homed in 11-06 alongside the rest of the orchestration layer, per the plan's own flagged assumption. This file's functions (asyncBakeoff, humanAct, botTurn) call them as bare identifiers, resolved via the still-present PP bridge."
  - "revealMyRecipe stays a plain module export function this wave — its inline onclick=\"revealMyRecipe()\" (index.html) still resolves through the PP bridge; the explicit window.revealMyRecipe retained-global assignment is deferred to 11-07 per RESEARCH.md Q2b."
  - "Fixed two rounds of leftover orphaned doc-comments introduced by this plan's OWN task 1 deletion (windLeg/humanWind's header comments left stranded before remotePickHighlights/coinHTML after their function bodies moved) — caught before task 2's commit via a targeted region read, not deferred."
  - "A doc comment in flow.js's task-3 header contained the literal string `from \"../net\"` (inside backticks, describing what the module does NOT do), which tripped module_graph_check.js's content-regex import scanner as a false positive — reworded to avoid the string entirely (no code or behavior change) before task 3's commit."
  - "Extended src/main.js's existing ui.setNetHandlers() call (rather than a second call) with onRespond/onRecovery/onLeave, merging onto 11-04's onBroadcast/onEvents — matches handlers.js's own Object.assign-merge design (a later wave can always add more handlers without disturbing earlier ones)."

requirements-completed: []  # SPLIT-03/05/06 deliberately NOT marked complete -- 5 of 8 phase plans done, PP bridge still present by design (strangler-fig mechanism 11-06/11-07 rely on)

# Metrics
duration: ~50min
completed: 2026-07-25
status: complete
---

# Phase 11 Plan 5: Turn-Flow, Battle-UI, Recovery Seam Summary

**Extracted the deepest layer of src/ui/ — 31 functions across turn-flow/interaction, battle-UI/side-bets/intros/game-start, and recovery/replay clusters — into `src/ui/flow.js`, and resolved the final 3 of the milestone's 6 UI→orchestration seam edges through the injected-handler mechanism 11-04 stood up, leaving the classic `<script>` region holding only the 44 orchestration net-callers plus top-level wiring.**

## Performance

- **Duration:** ~50 min
- **Tasks:** 3 (all `type="auto"`)
- **Files modified:** 4 (`src/ui/flow.js` created; `src/ui/index.js`, `src/ui/handlers.js`, `src/main.js`, `index.html` modified)

## Accomplishments
- Task 1: moved `humanTurn`, `botTurn`, `humanAct`, `humanTrade`, `humanWind`, `humanDock`, `windLeg`, `fishCast`, `humanFlip`, `reachable`, `pickCell`, `localPickCell`, `localAsk` (13 functions) into `src/ui/flow.js`, byte-identical
- Task 2: moved `battleSnapshot`, `renderBattleFromSnap`, `battleFooter`, `coinHTML`, `pipsHTML`, `collectSideBets`, `settleSideBets`, `asyncBakeoff`, `netIntroBarrier`, `showAhoyIntro`, `showTurnOrderIntro`, `startSinglePlayer`, `startPassAndPlay`, `revealMyRecipe` (14 functions) into `src/ui/flow.js`; confirmed `battleAsk` correctly stays classic (orchestration, deferred to 11-06)
- Task 3: moved `endReplay`, `showRestoreFail`, `wireRestoreFail`, `remotePickHighlights` (4 functions) into `src/ui/flow.js`, rewiring their `sendResponse`/`setRecoveryState`/`leaveGame` calls through `netHandlers().onRespond`/`.onRecovery`/`.onLeave` — the final 3 of the milestone's 6 UI-side seam edges (RESEARCH.md Q1b); `src/main.js`'s composition root extended to wire all 5 handlers
- Byte-diffed all 31 moved function bodies against the pristine pre-11-05 `index.html` (via extracted-source comparison, not eyeballing) — every one is character-for-character identical except the 3 deliberate handler-injection substitutions in task 3
- `index.html`'s classic-script function count dropped from 80 (post-11-04) to 49; determinism 30/30, module graph 7/7 PASS (including "ui does NOT import net (D-07)"), full `npm test` green after every task

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract turn-flow + interaction cluster into src/ui/flow.js** - `1dc9374` (feat)
2. **Task 2: Extract battle-UI + side-bets + intro + game-start helpers (incl. revealMyRecipe)** - `6dbd87f` (feat)
3. **Task 3: Extract recovery/replay seam trio + remotePickHighlights via injected handlers** - `742b8dc` (feat)

**Plan metadata:** _pending — this commit_ (docs: complete plan)

## Files Created/Modified
- `src/ui/flow.js` - New file: 31 exported functions across turn-flow/interaction, battle-UI/side-bets/intro/game-start, and recovery/replay clusters; imports `appState` from `../state/index.js`, `roundCfg` from `../engine/index.js`, 15 shared constants/helpers from `../shared/index.js`, `el`/`boardCell`/`setFlipActive` from `./board.js`, `liveRender`/`panel`/`setNeedsAction`/`narrateLastEvent`/`flash`/`showNarration` from `./panel.js`, 15 helpers from `./util.js`, `passGate`/`requireName` from `./lobby.js`, and `netHandlers` from `./handlers.js`; carries private `$`/`sleep` module-local duplicates (same precedent as panel.js/board.js/lobby.js/recipe.js)
- `src/ui/index.js` - Barrel extended with `export * from "./flow.js"`
- `src/ui/handlers.js` - Header comment updated to document all 5 resolved UI-side seam edges (no code change — `setNetHandlers`/`netHandlers` already generically supported this via `Object.assign`-merge)
- `src/main.js` - `ui.setNetHandlers({...})` call extended with `onRespond`/`onRecovery`/`onLeave`, alongside 11-04's `onBroadcast`/`onEvents`, still wired to classic `sendResponse`/`setRecoveryState`/`leaveGame` globals via the PP bridge (formalized to real `src/net/` imports in 11-06)
- `index.html` - Classic `<script>` region shrunk by 31 functions (80 → 49); `battleAsk`/`renderBattle`/`watchBattle`/`asyncBattle` deliberately remain (orchestration, 11-06); "moved verbatim to src/ui/flow.js (11-05)" marker comments left at each removal site, matching the established convention from 11-03/11-04

## Decisions Made
- `battleAsk`/`renderBattle`/`watchBattle`/`asyncBattle` stay classic this wave — each calls a net-adjacent function directly (11-analysis.json tier "orchestration"), correctly excluded per the plan's own flagged assumption; homed in 11-06.
- `revealMyRecipe` is a plain `export function` — its inline `onclick` still resolves via the PP bridge; the explicit `window.revealMyRecipe` retained global lands in 11-07 (RESEARCH Q2b).
- All calls inside moved functions to still-classic net-adjacent globals that are NOT among the 6 identified seam edges (`broadcastFlip`, `netNarrate`, `netBroadcast`, `remotePrompt`, `logDecision`, `asyncBattle`, `battleAsk`, `renderBattle`) are left as bare identifiers, resolved through the bridge — only the specifically-identified edges get handler-injection treatment, matching 11-04's precedent exactly.
- Extended `src/main.js`'s existing `ui.setNetHandlers()` call (rather than adding a second call) with the 3 new handlers, consistent with `handlers.js`'s `Object.assign`-merge design.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed orphaned doc-comments left by this plan's own Task 1 deletions**
- **Found during:** Task 2 (while reading the region around `coinHTML`/`remotePickHighlights` before extracting further functions)
- **Issue:** Task 1's deletion of `fishCast`/`reachable`/`windLeg`/`humanWind` removed only the function bodies, not their header doc-comments, leaving 7 stranded comment lines describing those moved functions sitting incorrectly before `remotePickHighlights` and `coinHTML` in the classic region.
- **Fix:** Removed the 7 orphaned comment lines (2 locations) before proceeding with Task 2's own deletions; verified no other orphaned comments remained from Task 1 by inspecting every deletion boundary before cutting.
- **Files modified:** `index.html`
- **Verification:** `node scripts/determinism_baseline.js --verify` (30/30) and `node scripts/module_graph_check.js` (7/7 PASS) re-run clean after the fix; visual inspection of every remaining function boundary in the affected regions.
- **Committed in:** `6dbd87f` (Task 2 commit — documented there since caught during that task's own work)

**2. [Rule 1 - Bug] Reworded a doc comment that false-tripped module_graph_check.js**
- **Found during:** Task 3 (first `node scripts/module_graph_check.js` run after moving the recovery/replay trio)
- **Issue:** A doc comment in `src/ui/flow.js`'s new task-3 header explained the seam using the literal string `` `from "../net"` `` (in backticks, describing what the module deliberately does NOT import) — `module_graph_check.js`'s `IMPORT_RE` regex matches raw file content for `from "..."` patterns, not real `import` statements, so this literal string in a comment was indistinguishable from an actual import and triggered a false "ui -> shared/engine/state" SHAPE failure.
- **Fix:** Reworded the comment to say "an import of src/net/" instead of the quoted `from "..."` form — no code or behavior change, purely a comment edit to avoid the regex false-positive.
- **Files modified:** `src/ui/flow.js`
- **Verification:** `node scripts/module_graph_check.js` re-run clean (7/7 PASS, including the dedicated "ui does NOT import net (D-07)" line) after the reword.
- **Committed in:** `742b8dc` (Task 3 commit)

**Total deviations:** 2 auto-fixed (both Rule 1 — bugs introduced by this plan's own prior steps within the same session, caught and fixed before the affected task's commit).
**Impact on plan:** Both fixes were cleanup of this plan's own in-flight work (not pre-existing issues, not scope creep) — every one of the 31 moved function bodies remains byte-identical to the pristine pre-11-05 source, independently verified via extracted-source comparison.

## Issues Encountered
None beyond the two self-caught deviations above — all determinism/module-graph/npm-test gates stayed green after each task once those were fixed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 5 of the milestone's UI-side seam edges (RESEARCH.md Q1b) are now resolved through `src/ui/handlers.js`'s injected-handler mechanism — the 6th (`battleAsk`) is orchestration, not a UI-side edge, and is 11-06's to classify/move alongside the rest of the net-calling layer
- Classic `<script>` region now holds exactly the 44 orchestration net-callers (per 11-analysis.json's `netCallers_criterion1_risk` count) plus top-level wiring/constants (`boot`, `fbInit`, `wireLobby`, config objects, etc.) — 49 total top-level function declarations remain, matching expectations
- `src/main.js`'s `onBroadcast`/`onEvents`/`onRespond`/`onRecovery`/`onLeave` wiring still points at classic globals via the PP bridge — 11-06 should replace these `globalThis.X(...)` closures with real `src/net/` function references once those functions themselves modularize, per the plan's own flagged assumption
- `ui_contract_check.js` run bare still exits 1 by design (assertions 2-4 are forward-looking until 11-07 deletes the bridge) — assertion 1 (D-07, no `src/ui/` → `src/net/` import) passes cleanly, confirmed this wave
- Blocker/concern carried forward: D-12's Safari storm re-verification is still owed to a real human, deferred to 11-08 per CONTEXT.md
- Deferred, non-blocking: `.planning/phases/11-ui-extraction-orchestration-bridge-removal/11-analysis.json`'s stale drift (noted in 11-04) — working tree is clean this wave; the file was not touched or re-run

---
*Phase: 11-ui-extraction-orchestration-bridge-removal*
*Completed: 2026-07-25*

## Self-Check: PASSED

All claimed files found on disk (`src/ui/flow.js`, this SUMMARY); all 3 task commits (`1dc9374`, `6dbd87f`, `742b8dc`) found in git log.
