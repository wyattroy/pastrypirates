---
phase: 11-ui-extraction-orchestration-bridge-removal
plan: 04
subsystem: ui
tags: [strangler-fig, es-modules, code-motion, handler-injection, directional-boundary]

# Dependency graph
requires:
  - phase: 11-ui-extraction-orchestration-bridge-removal
    provides: "11-01/02/03's proven move-verbatim/import-rewire/bridge-grows/gates-green pattern, src/ui/board.js's boardCell()/boardShipEls()/chatBubbles exports, src/ui/util.js's soloBotGame/currentTurnSeat/syncLogLines/spawnPops/describe/pn/boatXY/msgHoldMs/waitWhilePaused, src/ui/recipe.js's escHtml/$ duplication precedent"
provides:
  - "src/ui/panel.js — the panel/clock/narration/chat/modal render cluster (setClockUI, panel, resizePanel, typewriterReveal, narrateLastEvent, appendChatLine, showChatBubble, showNarration, setNeedsAction, flash, liveRender), 11 functions moved byte-identical except the two seam edges"
  - "src/ui/lobby.js — the lobby/room/welcome view cluster (buildPlayerRows, showStep, requireName, wireWelcome, renderSeatList, showHome, showRoom, showGameView, passGate, hideBootLoader, applyEngineBootstrapEffects), 11 functions moved byte-identical"
  - "src/ui/handlers.js — the injected-handler seam (setNetHandlers/netHandlers), the reverse of Phase 9's net->UI handler injection: UI publishes, main.js's composition root injects the net-adjacent operations"
  - "2 of the 6 UI->orchestration edges (RESEARCH.md Q1b) resolved without ui importing net: flash()->onBroadcast (was netNarrate), liveRender()->onEvents (was pushEvents)"
  - "index.html classic region shrunk from 102 to 80 top-level functions (22 moved this wave)"
affects: [11-05-ui-extraction, 11-06-ui-extraction, 11-07-bridge-removal, 11-08-safari-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Injected-handler seam (src/ui/handlers.js): a module-private `let _h={}` plus `setNetHandlers(h){Object.assign(_h,h)}` (merge, never replace) and a `netHandlers()` read accessor (a function, not the object itself, so every caller sees the LIVE set, never a load-order-dependent snapshot). This is the mechanical device that keeps D-07 (ui must never import net) true for functions that DO need a net-adjacent side effect: instead of `import {netThing} from '../net'`, the function calls `netHandlers().onThing?.(...)`, and the composition root (src/main.js) is the only place that ever wires a real implementation in. Mirrors Phase 9's net->UI handler injection in the opposite direction."
    - "Both wired handlers this wave (onBroadcast/onEvents) point at still-classic globals (netNarrate/pushEvents) via `globalThis.X(...)`, not real src/net/ functions yet -- an intentional, explicitly-commented, composition-root-only bridge use, since those two functions aren't modularized until 11-06's orchestration wave. The seam itself (the D-07 boundary) is real and permanent; only the wiring target is temporary."
    - "sleep duplicate (new instance of the '$' duplication pattern, mirrors 11-01/11-03): a classic-script-local `const` used far beyond one cluster (humanFlip/fishCast/asyncBattle, none moving this wave) can't move with its one moving caller (flash) the way an exclusive-to-cluster const would (cf. RECIPE_BOOK/EVENT_NARRATION/chatBubbles) -- reproduced verbatim as a private module-local const instead, wired to the already-moved waitWhilePaused import."

key-files:
  created:
    - src/ui/panel.js
    - src/ui/lobby.js
    - src/ui/handlers.js
  modified:
    - src/ui/index.js
    - src/main.js
    - index.html

key-decisions:
  - "flash()'s direct netNarrate(msg) call and liveRender()'s direct pushEvents() call are the first 2 of RESEARCH.md's 6-edge UI->orchestration seam table -- both replaced with calls through netHandlers().onBroadcast/.onEvents, resolved by src/main.js's ui.setNetHandlers({onBroadcast, onEvents}) composition-root wiring. Neither src/ui/panel.js nor src/ui/handlers.js contains a `from \"../net\"` import; module_graph_check.js's dedicated 'ui does NOT import net (D-07)' assertion and ui_contract_check.js's assertion 1 both confirm this mechanically."
  - "netHandlers() is a function returning the live `_h` object, not the object exported directly -- so a caller inside panel.js always sees whatever setNetHandlers() most recently registered, regardless of module-evaluation order between src/ui/index.js's barrel and src/main.js's own wiring call."
  - "REVEAL_MS_PER_CHAR (a const, previously classic top-level) moved into src/ui/panel.js alongside its only two consumers (panel(), showChatBubble()) rather than staying classic -- both call sites moved this wave, so nothing classic reads it anymore."
  - "sleep (a classic-script const, not a function -- same class of gap as $ -- index.html:947) duplicated verbatim as a private module-local const in src/ui/panel.js, since it's used well beyond this cluster (humanFlip/fishCast/asyncBattle etc., none moving this wave) and so can't simply move with flash()."
  - "showChatBubble/appendChatLine import chatBubbles/boatXY/boardShipEls directly from sibling ui/ files (board.js, util.js) rather than leaving them as bare bridge reads -- per the established 'reuse already-moved helpers by importing them' precedent. removeChatBubble/positionChatBubble (still classic, deferred chat cluster) stay bare-global calls, resolved via the PP bridge, exactly like every other still-classic cross-reference."
  - "Task 2 deliberately did NOT move the room-lifecycle net-callers (createRoom/joinRoom/watchRoom/startGame/beginGame/wireLobby) -- per 11-analysis.json's tier classification these are orchestration (they call src/net/-backed functions directly), not pure views, and are homed in 11-06 alongside the rest of the net-adjacent orchestration layer. showGameView()'s call to syncBoardSizing() (already in src/ui/board.js since 11-03) was rewired to a direct import rather than a bare bridge read, same precedent."
  - "Deliberately left SPLIT-03/05/06 Pending in REQUIREMENTS.md -- 4 of 8 phase plans done, 103 of ~183 functions now extracted (81 from 11-01/02/03 + 22 here), PP bridge still present by design (strangler-fig mechanism remaining waves rely on), matching 11-01/02/03's precedent of not marking multi-plan requirements complete early."
  - "Left a pre-existing, unrelated uncommitted modification to 11-analysis.json (stale 102-function snapshot from some point during 11-03's own session) untouched -- out of scope per the executor's scope boundary; logged to deferred-items.md rather than fixed or committed."

requirements-completed: []  # SPLIT-03/05/06 deliberately NOT marked complete -- 4 of 8 phase plans done, bridge still present by design

# Metrics
duration: ~35min
completed: 2026-07-25
status: complete
---

# Phase 11 Plan 4: Panel/Chat Cluster + Lobby Cluster + Injected-Handler Seam Summary

**Moved the panel/clock/narration/chat DOM cluster and the lobby/room/welcome view cluster (22 functions total) byte-identical into `src/ui/panel.js` and `src/ui/lobby.js`, and stood up `src/ui/handlers.js` — the injected-handler seam that resolves the first 2 of the milestone's 6 UI→orchestration edges (`flash()`→`onBroadcast`, `liveRender()`→`onEvents`) without `src/ui/` ever importing `src/net/` (D-07).**

## Performance

- **Duration:** ~35 min
- **Tasks:** 2 (both `type="auto"`)
- **Files modified:** 6 (`src/ui/panel.js` created, `src/ui/lobby.js` created, `src/ui/handlers.js` created, `src/ui/index.js`, `src/main.js`, `index.html`)

## Accomplishments
- Task 1: moved `setClockUI`, `panel`, `resizePanel`, `typewriterReveal`, `narrateLastEvent`, `appendChatLine`, `showChatBubble`, `showNarration`, `setNeedsAction`, `flash`, `liveRender` (11 functions) into `src/ui/panel.js`; stood up `src/ui/handlers.js`'s `setNetHandlers`/`netHandlers` seam; rewired `flash()`'s `netNarrate(msg)` call and `liveRender()`'s `pushEvents()` call to go through `netHandlers().onBroadcast`/`.onEvents`; wired `src/main.js`'s composition root with `ui.setNetHandlers({onBroadcast, onEvents})`, pointing at the still-classic `netNarrate`/`pushEvents` globals via the still-present PP bridge (formalized to real `src/net/` imports in 11-06)
- Task 2: moved `buildPlayerRows`, `showStep`, `requireName`, `wireWelcome`, `renderSeatList`, `showHome`, `showRoom`, `showGameView`, `passGate`, `hideBootLoader`, `applyEngineBootstrapEffects` (11 functions) into `src/ui/lobby.js`; deliberately left the room-lifecycle net-callers (`createRoom`/`joinRoom`/`watchRoom`/`startGame`/`beginGame`/`wireLobby`) in the classic region for 11-06
- Byte-diffed all 22 moved function bodies against the pristine pre-11-04 `index.html` (via `git show`, not eyeballing) — every one is character-for-character identical to the original source, except the two deliberate seam edges (`flash`/`liveRender`)
- `index.html`'s classic-script function count dropped from 102 (post-11-03) to 80; determinism 30/30, module graph 7/7 PASS (including the dedicated "ui does NOT import net (D-07)" line), `ui_contract_check.js`'s assertion 1 (no ui→net import) green, full `npm test` green after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract panel/clock/narration/chat/modal cluster + stand up the handler-injection seam** - `5111ff7` (feat)
2. **Task 2: Extract the lobby/room/welcome view cluster into src/ui/lobby.js** - `00f3beb` (feat)

**Plan metadata:** _pending — this commit_ (docs: complete plan)

## Files Created/Modified
- `src/ui/panel.js` - New file: 11 exported functions (`setClockUI`, `liveRender`, `panel`, `resizePanel`, `typewriterReveal`, `setNeedsAction`, `showNarration`, `appendChatLine`, `showChatBubble`, `narrateLastEvent`, `flash`) plus the `REVEAL_MS_PER_CHAR` const and private `$`/`sleep` duplicates; imports `appState` from `../state/index.js`, 9 image/color constants + `iconImg`/`emojify` from `../shared/index.js`, `render`/`boardCell`/`boardShipEls`/`chatBubbles` from `./board.js`, `soloBotGame`/`currentTurnSeat`/`syncLogLines`/`spawnPops`/`describe`/`pn`/`boatXY`/`msgHoldMs`/`waitWhilePaused` from `./util.js`, `escHtml` from `./recipe.js`, and `netHandlers` from `./handlers.js`
- `src/ui/lobby.js` - New file: 11 exported functions (`buildPlayerRows`, `showStep`, `requireName`, `wireWelcome`, `showHome`, `showRoom`, `showGameView`, `passGate`, `renderSeatList`, `hideBootLoader`, `applyEngineBootstrapEffects`) plus a private `$` duplicate; imports `appState` from `../state/index.js`, 7 constants + `iconImg`/`emojify` from `../shared/index.js`, `seatDisplayOrder`/`pname`/`pn` from `./util.js`, `escHtml` from `./recipe.js`, and `syncBoardSizing` from `./board.js`
- `src/ui/handlers.js` - New file: `setNetHandlers(h)` (merges onto a module-private `_h`) and `netHandlers()` (returns the live `_h`) — the injected-handler seam
- `src/ui/index.js` - Barrel extended with `export * from "./panel.js"`, `export * from "./lobby.js"`, `export * from "./handlers.js"`
- `src/main.js` - Added the seam wiring: `ui.setNetHandlers({onBroadcast: (...a) => globalThis.netNarrate(...a), onEvents: (...a) => globalThis.pushEvents(...a)})`, placed right after the PP bridge's `Object.assign(globalThis, PP)` and explicitly commented as a temporary composition-root-only bridge use, formalized to real `src/net/` imports in 11-06
- `index.html` - Classic `<script>` region shrunk by 22 functions; `setInterval(setClockUI,500)` and `window.addEventListener("resize", ...)`-style side-effect statements kept in place (bare global calls, resolved via the PP bridge, mirroring 11-03's `syncBoardSizing` precedent); the room-lifecycle net-callers (`createRoom`/`joinRoom`/`watchRoom`/`startGame`/`beginGame`/`wireLobby`) remain untouched in the classic region

## Decisions Made
- The injected-handler seam (`src/ui/handlers.js`) is the mechanical device that resolves 2 of RESEARCH.md's 6 UI→orchestration edges without `src/ui/` importing `src/net/` — `flash()` calls `netHandlers().onBroadcast(msg)` instead of a bare `netNarrate(msg)`, `liveRender()` calls `netHandlers().onEvents()` instead of a bare `pushEvents()`. `netHandlers()` is a function (not the object exported directly) so callers always see the live handler set regardless of module-load order.
- Both handlers this wave point at still-classic globals (`netNarrate`/`pushEvents`) via `globalThis.X(...)` inside `src/main.js`'s composition root — an intentional, explicitly-commented, temporary bridge use, since those two functions aren't modularized into `src/net/` until 11-06's orchestration wave. The seam boundary itself is real and permanent from this commit forward; only the wiring TARGET is temporary.
- `REVEAL_MS_PER_CHAR` moved into `src/ui/panel.js` alongside its only two consumers (both moving this wave); `sleep` (a classic `const`, same class of gap as `$` — used well beyond this cluster) duplicated verbatim as a private module-local const, wired to the already-moved `waitWhilePaused` import, per 11-01/11-03's `$`-duplication precedent.
- `showChatBubble`/`appendChatLine` import `chatBubbles`/`boatXY`/`boardShipEls` directly from sibling `ui/` files rather than leaving them as bare bridge reads (reuse-already-moved-helpers precedent); `removeChatBubble`/`positionChatBubble` (still classic, deferred chat cluster) stay bare-global calls via the bridge.
- Task 2 deliberately did NOT move `createRoom`/`joinRoom`/`watchRoom`/`startGame`/`beginGame`/`wireLobby` — these are net-calling orchestration, not pure views, and belong to 11-06. `showGameView()`'s `syncBoardSizing()` call was rewired to a direct import from `./board.js` (already-moved sibling) rather than a bare bridge read.
- Deliberately did not mark SPLIT-03/SPLIT-05/SPLIT-06 complete in REQUIREMENTS.md — 4 of 8 phase plans done, 103 of ~183 functions now extracted, PP bridge still present by design, matching 11-01/02/03's precedent.

## Deviations from Plan

### Auto-fixed Issues

None — both tasks executed exactly as the plan's action/acceptance-criteria specified. The `sleep`/`REVEAL_MS_PER_CHAR`/`chatBubbles`-import mechanics documented above are code-motion dependency handling of the same class the plan's own read_first notes anticipated (mirroring 11-01/02/03's precedent), not corrections to a bug or gap — they were identified during the `<read_first>` dependency read before moving each function, not discovered as breakage afterward.

### Out-of-scope item noted, not fixed

**1. Pre-existing uncommitted drift in `11-analysis.json`**
- **Found during:** initial `git status` check before Task 1's own edits began
- **Issue:** `.planning/phases/11-ui-extraction-orchestration-bridge-removal/11-analysis.json` was already modified in the working tree (a stale 102-function snapshot, likely regenerated by `scripts/analyze_classic.mjs` at some point during 11-03's session but never committed) — unrelated to this plan's `files_modified` list.
- **Action:** Left untouched, not committed by 11-04 (scope boundary — only auto-fix issues directly caused by the current task's own changes). Logged to `.planning/phases/11-ui-extraction-orchestration-bridge-removal/deferred-items.md`.

**Total deviations:** 0 code deviations; 1 out-of-scope item logged and deferred (not fixed, not committed).
**Impact on plan:** None — every one of the 22 moved function bodies is byte-identical to the pristine pre-11-04 source (independently verified via `git show` diffing), except the two deliberate seam edges documented in the plan itself. No unplanned new functionality was added.

## Issues Encountered
None — all determinism/module-graph/ui-contract/npm-test gates stayed green throughout both tasks with no unresolved failures.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `src/ui/handlers.js`'s injected-handler seam is now a standing, reusable mechanism — 11-05/11-06 will register additional handlers (via the same `setNetHandlers()` merge) as the remaining 4 of 6 UI→orchestration edges resolve, without needing to touch `panel.js`'s or `lobby.js`'s existing calls
- `src/main.js`'s `onBroadcast`/`onEvents` wiring still points at classic globals (`netNarrate`/`pushEvents`) via the PP bridge — 11-06 should replace those two `globalThis.X(...)` closures with real `src/net/` function references once `netNarrate`/`pushEvents` themselves modularize, per the plan's own flagged assumption
- The room-lifecycle net-callers (`createRoom`/`joinRoom`/`watchRoom`/`startGame`/`beginGame`/`wireLobby`) remain classic, exactly as scoped — 11-06 is where they move and get their own injected-handler or direct-import treatment
- Blocker/concern carried forward from 11-01/02/03: D-12's Safari storm re-verification is still owed to a real human, deferred to 11-08 per CONTEXT.md
- Deferred, non-blocking: `.planning/phases/11-ui-extraction-orchestration-bridge-removal/11-analysis.json`'s stale uncommitted drift (see deferred-items.md) — will naturally resolve whenever a later wave re-runs `scripts/analyze_classic.mjs`

---
*Phase: 11-ui-extraction-orchestration-bridge-removal*
*Completed: 2026-07-25*

## Self-Check: PASSED

All claimed files found on disk (`src/ui/panel.js`, `src/ui/lobby.js`, `src/ui/handlers.js`, this SUMMARY, `deferred-items.md`); both task commits (`5111ff7`, `00f3beb`) found in git log.
