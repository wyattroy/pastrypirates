---
phase: 11-ui-extraction-orchestration-bridge-removal
plan: 06
subsystem: ui
tags: [strangler-fig, es-modules, code-motion, handler-injection, composition-root, determinism, idempotency]

# Dependency graph
requires:
  - phase: 11-ui-extraction-orchestration-bridge-removal
    provides: "11-01..11-05's proven move-verbatim/import-rewire/bridge-grows/gates-green pattern; src/ui/{recipe,util,board,panel,lobby,handlers,flow}.js (all re-exported via src/ui/index.js); the injected-handler seam (setNetHandlers/netHandlers) 11-04 stood up and 11-05 finished wiring for all 5 UI-side edges; the room-lifecycle and battle-orchestration functions 11-04/11-05 deliberately deferred to this wave"
provides:
  - "src/orchestrator.js — all 44 net-caller/orchestration functions (sync/broadcast/battle in task 1; room-lifecycle/prompt/recovery/turn-flow/boot in task 2) plus netFail, moved verbatim from the classic <script> region"
  - "src/main.js is now the real composition root: imports engine + ui + net + orchestrator, wires ui.setNetHandlers with real orchestrator function references (no globalThis indirection left in the seam), calls boot() directly (window.boot() indirection removed)"
  - "index.html's classic <script> region holds ZERO top-level function declarations (49 -> 25 -> 0 across this wave's two tasks) — only bridge-adjacent top-level statements (visibilitychange/resize/orientationchange listeners, setInterval, BOT_STRATS const) and markup remain, per this wave's goal state"
  - "watchRoom() is idempotent (D-13): a module-scope guard (_watchRoomAttachedFor) prevents a repeated call for the same room from re-attaching netWatchSeats/netWatchStatus and tripping the registry's 'duplicate attach refused' ERROR on a normal guest join"
affects: [11-07-bridge-removal, 11-08-safari-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "orchestrator.js lives directly under src/ (not a subdirectory), so module_graph_check.js infers its tier as \"main\" — the same composition-root tier src/main.js occupies. That is what legitimately lets it import BOTH src/net/ (to drive sync) and src/ui/ (to render results) without tripping the ui->net direction rule (D-07), since src/ui/ itself can never import a \"main\"-tier file."
    - "positionChatBubble/removeChatBubble/clearChatBubbles (zero net calls) moved into src/ui/board.js instead of src/orchestrator.js — board.js's render() is already their same-module caller, and moving them to orchestrator.js would have forced src/ui/panel.js (which already imports render/boardCell/boardShipEls/chatBubbles FROM board.js) into a ui->main edge module_graph_check.js forbids."
    - "src/main.js publishes src/orchestrator.js's exports as globals through a SEPARATE `Object.assign(globalThis, orchestrator)` statement (tagged // PP-BRIDGE) rather than folding them into the existing `const PP = {...}` object literal — the plan's own task 3 instructed leaving that specific line \"exactly as-is\"; this is an additive sibling statement, not a modification to it. Needed so the dozens of already-moved src/ui/flow.js and src/ui/util.js bare-identifier calls into orchestration functions (broadcastFlip, netNarrate, renderBattle, battleAsk, asyncBattle, remotePrompt, logDecision, beginGame, etc.) keep resolving — those modules can never `import` src/orchestrator.js directly (same ui->main direction problem as above)."
    - "D-13 idempotency guard is a plain module-scope `let _watchRoomAttachedFor` tracking the last room the two room-scoped watchers were attached for — cheaper and narrower than teaching the registry itself about call-site re-entrancy, and scoped exactly to the one function the bug report named."

key-files:
  created:
    - src/orchestrator.js
  modified:
    - src/ui/board.js
    - src/ui/panel.js
    - src/main.js
    - index.html

key-decisions:
  - "positionChatBubble/removeChatBubble/clearChatBubbles moved to src/ui/board.js, not src/orchestrator.js, despite being adjacent to the chat-sync cluster in the classic script — they have zero net calls (11-analysis.json would tier them 'ui (DOM)') and board.js's render() is already their same-module caller. src/ui/panel.js's showChatBubble() now imports positionChatBubble/removeChatBubble from board.js instead of reading them as bare globals."
  - "src/main.js's PP object literal (`const PP = {...shared,...engine,...net,...ui,appState}`) is left byte-for-byte untouched per the plan's task 3 instruction. Orchestrator's exports are published as globals through an ADDITIONAL, separately-tagged `Object.assign(globalThis, orchestrator)` statement instead — a Rule 2 addition (auto-add missing critical functionality): without it, every already-moved src/ui/ bare call into an orchestration function would throw ReferenceError in a real browser the moment that code path ran, since src/main.js does not import src/orchestrator.js until this plan's task 3 and src/ui/ can never import it directly."
  - "D-13 watchRoom() idempotency: added a module-scope guard so a repeated call for the same room is a no-op past the read + lobby-view refresh (which still runs every time, harmless) — the two room-scoped watcher attaches (netWatchSeats/netWatchStatus) only happen once per room per page life."
  - "Verified with node scripts/analyze_classic.mjs --stdout (not the plan's literal bare invocation) to confirm functionCount: 0 without writing to the fixed 11-analysis.json baseline — the tool defaults to overwriting that file when run without --stdout, which CLAUDE.md/prior-wave guidance explicitly warns against."
  - "Deliberately left SPLIT-03/05/06 Pending in REQUIREMENTS.md despite this plan's own `requirements: [SPLIT-05]` frontmatter — SPLIT-05 also requires index.html be reduced to markup + a single module entry, which only completes once 11-07 deletes the classic <script> region/bridge entirely. Mirrors 11-01 through 11-05's identical precedent of not marking a multi-plan requirement complete early."

requirements-completed: []  # SPLIT-05 deliberately NOT marked complete -- main.js orchestrates engine+ui+net+orchestrator, but index.html is not yet reduced to markup + single module entry (bridge deletion is 11-07's job)

coverage:
  - id: D1
    description: "44 orchestration (net-caller) functions plus netFail moved verbatim into src/orchestrator.js across two tasks; classic <script> region drops from 49 to 25 to 0 top-level function declarations"
    verification:
      - kind: other
        ref: "node scripts/analyze_classic.mjs --stdout (functionCount: 0)"
        status: pass
      - kind: other
        ref: "node-based byte-diff of asyncBattle/battleAsk/boot bodies against pre-11-06 index.html (git show) — IDENTICAL"
        status: pass
    human_judgment: false
  - id: D2
    description: "src/main.js is the real composition root: imports src/orchestrator.js, wires ui.setNetHandlers with real orchestrator function references, calls boot() directly"
    verification:
      - kind: other
        ref: "grep -c 'window.boot()' src/main.js == 0; grep -c 'globalThis.netNarrate|globalThis.pushEvents|globalThis.sendResponse' src/main.js == 0"
        status: pass
      - kind: unit
        ref: "npm test (full suite, incl. module_graph_check.js, net_contract_check.js, state_contract_check.js)"
        status: pass
    human_judgment: false
  - id: D3
    description: "watchRoom() idempotency (D-13): a repeated call for the same room no longer trips the registry's 'duplicate attach refused' ERROR"
    verification:
      - kind: integration
        ref: "ad hoc Node harness (fake Firebase ref/db) calling orchestrator.watchRoom() twice for the same room, asserting no 'duplicate attach refused' console.error; control test confirmed the harness fires the error without the guard"
        status: pass
    human_judgment: false
  - id: D4
    description: "Determinism and module-graph invariants hold across all three tasks"
    verification:
      - kind: other
        ref: "node scripts/determinism_baseline.js --verify (30/30, after every task)"
        status: pass
      - kind: other
        ref: "node scripts/module_graph_check.js (7/7 PASS, after every task)"
        status: pass
    human_judgment: false

# Metrics
duration: ~30min
completed: 2026-07-25
status: complete
---

# Phase 11 Plan 6: Orchestration Extraction & Composition-Root Formalization Summary

**Moved all 44 remaining net-caller/orchestration functions out of the classic `<script>` region into a new `src/orchestrator.js`, turned `src/main.js` into the real engine+UI+net+orchestrator composition root with the 6-edge UI seam fully formalized (no bridge indirection left in the wiring), and made `watchRoom()` idempotent (D-13) — leaving the classic script with zero top-level function declarations, ready for 11-07's gated bridge deletion.**

## Performance

- **Duration:** ~30 min
- **Tasks:** 3 (all `type="auto"`)
- **Files modified:** 5 (`src/orchestrator.js` created; `src/ui/board.js`, `src/ui/panel.js`, `src/main.js`, `index.html` modified)

## Accomplishments
- Task 1: moved `netFail`, the flip/clock/timer sync cluster (`broadcastFlip`/`watchFlip`/`broadcastClock`/`toggleTimer`/`watchTimer`/`expireShotClock`/`watchClock`), narration/chat broadcast (`netNarrate`/`netBroadcast`/`sendChat`/`watchChat`), battle sync (`renderBattle`/`watchBattle`/`battleAsk`/`asyncBattle`), presence (`watchPresence`/`fbInit`), and meta/gamelog writers (`writeMeta`/`writeGameLog`/`applyEndMeta`) verbatim into `src/orchestrator.js`; moved `positionChatBubble`/`removeChatBubble`/`clearChatBubbles` into `src/ui/board.js` instead (zero net calls, same-module caller already there); classic function count 49 → 25
- Task 2: moved the remaining room-lifecycle (`createRoom`/`joinRoom`/`watchRoom`/`startGame`/`beginGame`/`watchTurnOrder`/`watchRecipes`/`leaveGame`/`wireLobby`/`resumeHostGame`), prompt/recovery/turn-flow (`recipeDraftNet`/`runLiveNet`/`liveResolveEndNet`/`logDecision`/`setRecoveryState`/`watchRecoveryState`/`pushEvents`/`remotePrompt`/`sendResponse`/`remoteDraftPrompt`/`watchDraftPrompt`/`watchEvents`/`watchPrompt`/`watchNarr`), and `boot` verbatim into `src/orchestrator.js`; applied D-13's idempotency guard to `watchRoom()`; classic function count 25 → 0
- Task 3: expanded `src/main.js` into the real composition root — imports `src/orchestrator.js`, publishes its exports as globals via a separate `Object.assign(globalThis, orchestrator)` statement, rewires `ui.setNetHandlers()` to real `orchestrator.*` function references (no `globalThis.X(...)` closures left), and calls `boot()` directly instead of `window.boot()`
- Byte-diffed `asyncBattle`, `battleAsk`, and `boot` against the pristine pre-11-06 `index.html` (via `git show` + brace-matched extraction, not eyeballing): identical. `watchRoom` differs only by the D-13 guard addition — confirmed with the same extraction method.
- `node scripts/analyze_classic.mjs --stdout` confirms `functionCount: 0` (used `--stdout` to avoid overwriting the fixed `11-analysis.json` baseline); `determinism_baseline.js --verify` 30/30 and `module_graph_check.js` 7/7 PASS after every task; full `npm test` green after task 3
- D-13 idempotency independently verified with an ad hoc Node harness: a fake Firebase-like `db` calling `orchestrator.watchRoom()` twice for the same room produces no `"duplicate attach refused"` console error, while a control test against `src/net/registry.js` directly confirms the same double-attach WOULD trip that error without the guard

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract sync/broadcast/battle orchestration into src/orchestrator.js** - `c8147a3` (feat)
2. **Task 2: Extract room-lifecycle + prompt/recovery/turn-flow orchestration; make watchRoom idempotent (D-13)** - `5997391` (feat)
3. **Task 3: Make src/main.js the real orchestrator and formalize the seam** - `a37e7e9` (feat)

**Plan metadata:** _pending — this commit_ (docs: complete plan)

## Files Created/Modified
- `src/orchestrator.js` - New file: 44 orchestration functions + `netFail`, private `$`/`sleep` duplicates, `MAX_CHAT_LEN`/`PRESENCE_WARN_THRESHOLD` consts; imports from `./state/index.js`, `./engine/index.js`, `./shared/index.js`, `./net/index.js`, `./ui/index.js`; module-scope `_watchRoomAttachedFor` guard (D-13)
- `src/ui/board.js` - Added `positionChatBubble`/`removeChatBubble`/`clearChatBubbles` (moved verbatim from the classic script, exported alongside the already-resident `chatBubbles`)
- `src/ui/panel.js` - `showChatBubble()`'s import list extended to pull `positionChatBubble`/`removeChatBubble` from `./board.js` instead of reading them bare
- `src/main.js` - Added `import * as orchestrator` + `import { boot }` from `./orchestrator.js`; added the separate `Object.assign(globalThis, orchestrator)` bridge-publish statement; `ui.setNetHandlers()` now binds real `orchestrator.*` references; `boot()` called directly
- `index.html` - Classic `<script>` region emptied of all top-level function declarations (49 → 0); "moved verbatim to src/orchestrator.js (11-06)" marker comments left at each removal site, matching the established convention

## Decisions Made
- `positionChatBubble`/`removeChatBubble`/`clearChatBubbles` homed in `src/ui/board.js`, not `src/orchestrator.js` — zero net calls, and moving them to orchestrator.js would have created a `ui -> main` import edge `module_graph_check.js` forbids (board.js's `render()`/panel.js's `showChatBubble()` are their only callers, both already in `ui/`).
- `src/main.js`'s PP object literal left untouched; orchestrator's exports published via an additional, separately-tagged `Object.assign(globalThis, orchestrator)` statement — necessary (Rule 2) so already-moved `src/ui/flow.js`/`src/ui/util.js` bare calls into orchestration functions keep resolving, since `src/ui/` can never import `src/orchestrator.js` directly.
- D-13: `watchRoom()` gained a module-scope idempotency guard rather than teaching the registry about call-site re-entrancy — narrower fix, scoped to the one function the filed bug named.
- Used `node scripts/analyze_classic.mjs --stdout` instead of the plan's literal bare invocation, to avoid overwriting the fixed `11-analysis.json` phase baseline (per CLAUDE.md/prior-wave guidance).
- Left SPLIT-03/05/06 Pending in REQUIREMENTS.md — SPLIT-05's "index.html reduced to markup + single module entry" half is 11-07's job (bridge/classic-script deletion), mirroring every prior wave's identical precedent.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical Functionality] Added `Object.assign(globalThis, orchestrator)` publish statement in src/main.js**
- **Found during:** Task 3 (while reasoning through the plan's instruction to leave the PP bridge "exactly as-is")
- **Issue:** The plan's task 3 only specifies importing `src/orchestrator.js` for the `setNetHandlers` wiring and the direct `boot()` call — it does not mention publishing orchestrator's exports as globals. But dozens of already-moved `src/ui/flow.js`/`src/ui/util.js` function bodies (11-04/11-05) call orchestration functions (`broadcastFlip`, `netNarrate`, `renderBattle`, `battleAsk`, `asyncBattle`, `remotePrompt`, `remoteDraftPrompt`, `logDecision`, `beginGame`, and more) as bare identifiers, and `src/ui/` can never `import` `src/orchestrator.js` directly (its tier is "main", not one of `ui`'s allowed targets). Without publishing these as globals, every one of those call sites would throw `ReferenceError` in a real browser the instant that code path ran.
- **Fix:** Added a separate, explicitly-commented `Object.assign(globalThis, orchestrator); // PP-BRIDGE (orchestrator, 11-06)` statement immediately after the existing (untouched) PP bridge lines.
- **Files modified:** `src/main.js`
- **Verification:** `npm test` green; `module_graph_check.js` 7/7 PASS; manual reasoning traced every bare orchestration-function call site in `src/ui/flow.js`/`src/ui/util.js` against the new global publish.
- **Committed in:** `a37e7e9` (Task 3 commit)

**2. [Rule 1 - Bug] Fixed a botched deletion that left an orphaned function body during Task 1's own in-flight edit**
- **Found during:** Task 1 (mid-edit, verifying the classic script's syntax after the first `renderBattle`/`watchBattle`/`battleAsk`/`asyncBattle` deletion attempt)
- **Issue:** An `Edit` `old_string` ended at the `renderBattle(o){` signature line rather than the whole function body, so the replacement left the four functions' actual bodies (renderBattle through asyncBattle, ~260 lines) orphaned in the file with no preceding function declaration — a syntax error.
- **Fix:** Re-read the affected region and deleted the full orphaned body in a follow-up edit before proceeding.
- **Files modified:** `index.html`
- **Verification:** `node -e 'new Function(...)'` syntax check on the extracted classic-script region passed clean afterward; caught and fixed before Task 1's commit.
- **Committed in:** `c8147a3` (Task 1 commit — caught and fixed before that commit, not a separate fix-up commit)

**Total deviations:** 2 (1 Rule 2 — necessary correctness addition; 1 Rule 1 — self-caught bug from this plan's own in-flight editing, fixed before the affected task's commit).
**Impact on plan:** Both are essential for correctness, not scope creep — the Rule 2 addition prevents a real browser regression the plan's literal task 3 text would otherwise have introduced; the Rule 1 fix corrected a mistake made and caught within the same task, before any commit.

## Issues Encountered
None beyond the two self-caught/self-fixed items above — determinism/module-graph/npm-test gates stayed green after each task once those were addressed.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Classic `<script>` region holds zero top-level function declarations — 11-07 can now delete the bridge as a single gated commit against an empty classic region, exactly as this wave's objective intended
- `src/main.js`'s `Object.assign(globalThis, orchestrator)` statement (tagged `// PP-BRIDGE`) is an additional line 11-07 must also remove alongside the three original PP-BRIDGE lines — flagged explicitly in this file's own comments for that wave to find
- `window.applyEngineBootstrapEffects()`/`window.attachPastryArt()` calls in `src/main.js` are still bridge-resolved (untouched this wave, per the plan's own instruction) — 11-07's rewire target
- D-13 (watchRoom idempotency) closed as a byproduct of this wave's room-lifecycle move, independently verified with a Node harness (not just reasoned about)
- Blocker/concern carried forward: D-12's Safari storm re-verification is still owed to a real human, deferred to 11-08 per CONTEXT.md
- SPLIT-03/05/06 deliberately left Pending in REQUIREMENTS.md — 6 of 8 phase plans done; PP bridge (now including the new orchestrator-publish line) still present by design until 11-07

---
*Phase: 11-ui-extraction-orchestration-bridge-removal*
*Completed: 2026-07-25*

## Self-Check: PASSED

All claimed files found on disk (`src/orchestrator.js`, `src/ui/board.js`, `src/ui/panel.js`, `src/main.js`, this SUMMARY); all 3 task commits (`c8147a3`, `5997391`, `a37e7e9`) found in git log.
