---
phase: 09-networking-layer-watcher-cleanup
plan: 03
subsystem: infra
tags: [firebase, realtime-database, watcher-registry, listener-teardown, net-module, writers, readers]

# Dependency graph
requires:
  - phase: 09-networking-layer-watcher-cleanup
    provides: "09-01/09-02's src/net/registry.js, the sixteen-of-eighteen migrated watchers, and the handler-injection wrapper shape this plan completes and extends into writers.js/readers.js"
provides:
  - "src/net/watchers.js — netWatchResponse/netWatchDraftResponse, completing all eighteen watchers from D-01's inventory"
  - "src/net/index.js — netDetach (single-entry detach, for the two self-cancelling one-shots) plus every writer/reader re-exported net-prefixed"
  - "src/net/writers.js — one function per Firebase write (24 exported functions covering all 29 write call sites), no UI, no guard, no app-state read"
  - "src/net/readers.js — one-shot reads returning raw promises (5 exported functions covering all 9 read call sites), including the seat-claim transaction with a caller-supplied updater"
  - "index.html — zero direct Firebase reference construction (db.ref() count: 0); every listener, write, and read now issued from src/net/"
  - "scripts/net_registry_test.js — leak-vector-(a) case: a room-scoped one-shot abandoned mid-decision is removed by detachRoom(), with a vacuity guard proving it was genuinely attached and firing first"
affects: ["09-04", "09-05"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "One-shot label carries the decision's own unique id (\"response:\"+id, \"draftResponse:\"+id), not a static string — the registry's duplicate-attach key includes the label, so two sequential prompts against the same response path never collide once the first has detached."
    - "Ordering subtlety for self-cancelling one-shots: the callback is declared before the attach call and reads its own registry id from an enclosing `let wid` binding assigned after — the callback cannot fire before attach() returns, so this is safe without a temporal-dead-zone hazard."
    - "Writer/reader shape: one function per operation, parameters are (db, room/code, payload/updater, onError?). onError is applied via .catch() only when supplied — callers that already wrap a write in their own try/await (createRoom, startGame) pass no reporter, so a rejection propagates exactly as it did before the move."
    - "Two call sites (chat push, feedback write) preserve an inline console.error reporter instead of the shared netFail helper — not normalised, because normalising would add a visible sync-trouble banner to a failure that deliberately doesn't raise one today."
    - "netReadRoom(db, roomOrCode) is one function serving both the pre-join code-keyed read (joinRoom) and every post-join room-keyed read (watchRoom x2, startGame, boot) — same path shape, generic parameter name."

key-files:
  created:
    - src/net/writers.js
    - src/net/readers.js
  modified:
    - src/net/watchers.js
    - src/net/index.js
    - index.html
    - scripts/net_registry_test.js

key-decisions:
  - "Did NOT call requirements.mark-complete for SPLIT-04/NET-01/NET-02 despite them being listed in this plan's frontmatter requirements field, for the same reason 09-01/09-02 left them Pending: NET-02 explicitly requires the mechanical grep-based contract check (D-04), which is 09-04's deliverable, not this plan's — the greps run in this session are one-time, not a standing script wired into npm test. SPLIT-04 is now substantively true (all Firebase transport lives in src/net/, which imports no UI) but the directional-import guarantee isn't yet mechanically enforced either. Left REQUIREMENTS.md's checkboxes as Pending; 09-04 is positioned to close SPLIT-04 and NET-02 together once the contract check exists, and 09-05 closes NET-03."
  - "Task 3's browser tripwire human-check (window.__pp_module_ok / window.__pp_boot_count on a loaded page) could not be performed from this executor session — no browser-automation tool (chromium-cli, Playwright, Puppeteer, or an MCP browser tool) is present, and installing one would violate this plan's own threat-model constraint T-09-SC (zero packages introduced) and Rule 3's package-install exclusion. Confirmed the dev server itself serves index.html and src/main.js correctly (200, correct text/javascript MIME) via curl, then stopped the ephemeral probe instance. All Node-side automated checks for Task 3 (db.ref() count, script-tag counts, MIME-independent contract greps, npm test) passed; only the live-browser half of criterion 12 is unverified pending a follow-up Chrome session, matching 09-01's precedent for its own unautomatable Task 3."

patterns-established:
  - "src/net/writers.js and src/net/readers.js follow the same leaf-tier discipline as registry.js/watchers.js: no import of UI/engine/shared, no app-state read, every value received as a plain argument."

requirements-completed: []  # See key-decisions: NET-02's mechanical enforcement is 09-04's deliverable, NET-03's behavioral proof is 09-05's; SPLIT-04 is substantively done but not yet mechanically guaranteed. Left Pending.

coverage:
  - id: D1
    description: "The two self-cancelling one-shots (remotePrompt/remoteDraftPrompt) route through the registry via netWatchResponse/netWatchDraftResponse, preserving self-cancel-on-matching-reply exactly while closing the room-death leak (D-02)"
    requirement: "NET-01, NET-02"
    verification:
      - kind: unit
        ref: "scripts/net_registry_test.js's new leak-vector-(a) case (32/32 PASS), demonstrated red against a fault that skips one-shot-style labels in detachRoom(), restored clean"
        status: pass
      - kind: integration
        ref: "npm test (determinism 30/30, engine_contract_check 4/4, dlog_replay_test, net_registry_test 32/32) — exit=0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every Firebase write (29 call sites, 24 distinct writer functions) extracted into src/net/writers.js with guards/UI calls/payload construction left at the call site and decision-log/event-feed ordering unchanged"
    requirement: "SPLIT-04, NET-01"
    verification:
      - kind: unit
        ref: "Task 2's full acceptance-criteria sweep (exports check, UI/guard greps, batching grep, netFail-location check) — see 'Task 2 Acceptance Sweep' below"
        status: pass
      - kind: integration
        ref: "npm test, node scripts/dlog_replay_test.js — exit=0, run after the task"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every one-shot read (9 call sites, 5 reader functions) extracted into src/net/readers.js returning raw promises; index.html constructs zero Firebase references directly"
    requirement: "SPLIT-04"
    verification:
      - kind: unit
        ref: "grep -vE comment-stripped db\\.ref\\( count -> 0; script-tag/compat-script-count greps; npm test — see 'Task 3 Acceptance Sweep' below"
        status: pass
      - kind: manual_procedural
        ref: "Browser tripwire (window.__pp_module_ok/__pp_boot_count) not run this session — no browser-automation tool available; dev server itself confirmed serving correctly via curl. See key-decisions."
        status: unverified
    human_judgment: true
  - id: D4
    description: "All ~40 relocated path expressions confirmed character-for-character against the pre-task index.html via automated diff of extracted db.ref(...) expressions"
    requirement: "NET-01, T-09-09"
    verification:
      - kind: unit
        ref: "Path-fidelity audit below — 20 unique write paths, 6 unique read paths, 0 mismatches"
        status: pass
    human_judgment: false

# Metrics
duration: ~90min
completed: 2026-07-24
status: complete
---

# Phase 9 Plan 3: Complete the Watcher Registry and Transport Extraction Summary

**The last two self-cancelling one-shot watchers, every Firebase write (29 call sites → 24 writer functions), and every one-shot read (9 call sites → 5 reader functions) now route through src/net/ — index.html constructs zero Firebase references directly, and all eighteen watchers from D-01's inventory attach through the registry.**

## Performance

- **Duration:** ~90 min
- **Tasks:** 3 of 3 completed
- **Files modified:** 6 (`src/net/writers.js` and `src/net/readers.js` created; `src/net/watchers.js`, `src/net/index.js`, `index.html`, `scripts/net_registry_test.js` modified)

## Accomplishments

- Added `netWatchResponse`/`netWatchDraftResponse` to `src/net/watchers.js`, completing the eighteen-watcher inventory. Both accept a label carrying the prompt's own unique id, so sequential prompts on the same response path never collide with the registry's duplicate-attach refusal.
- Rewrote `remotePrompt()`/`remoteDraftPrompt()` in `index.html`: each callback keeps its exact body with the single required substitution (`rr.off("value",cb)` → `netDetach(wid)`) plus the writes those bodies contain (moved in Task 2). The self-cancel-on-matching-reply behavior is untouched; a room teardown now also removes a still-pending one, closing D-02's real gap.
- Added a leak-vector-(a) case to `scripts/net_registry_test.js` with a vacuity guard: the abandoned one-shot fires once (on a non-matching reply) before teardown is asserted, proving it was genuinely attached and live — not a case that passes trivially because nothing was really listening. Demonstrated red against a fault that specifically skips one-shot-style labels in `detachRoom()` (not the earlier, coarser "skip all room-scoped entries" fault from 09-01's drill 2), then restored via `git checkout -- src/net/registry.js`.
- Built `src/net/writers.js`: 24 exported functions covering all 29 write call sites in the pre-task file. Every guard (`isHost`, `replaying`, `db&&room`), every UI call, and every payload-construction expression stayed in `index.html`; each writer receives the finished payload and an optional error reporter. The chat push and feedback write preserve their inline `console.error` handlers rather than being normalised onto the shared `netFail` helper.
- Built `src/net/readers.js`: 5 exported functions covering all 9 one-shot read call sites, each returning the raw promise so the resume path's three distinguishable outcomes (thrown read, empty read, read with data) stay exactly as they were. The seat-claim transaction takes the caller's own updater function as an argument, keeping the name-typed/id-closure logic in `index.html`.
- Extended `src/net/index.js`'s barrel with `netDetach` (single-entry detach for the two one-shots) and every writer/reader name, all net-prefixed.
- Found and reworded five comment-only false positives across `src/net/writers.js` during self-verification (same class as 09-01's `PP-BRIDGE`/`queueMicrotask` and 09-02's `registry.attach()`/`async` false positives): prose using the literal identifiers `netFail`, `isHost`, `replaying`, `game`, and the substring `game` inside `end-of-game` all tripped their own acceptance-criteria greps. Reworded to convey the same meaning without the literal tokens; re-verified after each fix.
- Confirmed `index.html`'s `db.ref(` count reached exactly 0 after Task 3, with the reference-call-site ledger balancing at every stage: 40 (pre-Task-1) → 38 (post-Task-1, the two `rr=db.ref(...)` one-shot constructions removed) → 9 (post-Task-2, only the reads Task 3 owns) → 0 (post-Task-3).
- Confirmed `npm test`, `node scripts/net_registry_test.js`, `node scripts/dlog_replay_test.js`, and `node scripts/engine_contract_check.js` all green after every task; determinism corpus untouched throughout (`git log --oneline -- 'scripts/fixtures/determinism/*.jsonl'` → 1, `git status --porcelain scripts/fixtures/determinism/` empty).
- Attempted Task 3's live-browser tripwire check (no browser-automation tool available in this session — see Deviations); confirmed the dev server itself serves `index.html` and `src/main.js` correctly via `curl` (200, correct `text/javascript` MIME), then stopped the ephemeral probe.

## Task Commits

Each task committed atomically:

1. **Task 1: Route the two self-cancelling one-shots through the registry** — `8a7c195` (feat)
2. **Task 2: Extract every Firebase write into src/net/writers.js** — `115d082` (feat)
3. **Task 3: Extract the one-shot reads and prove index.html has no direct Firebase surface left** — `e77ff00` (feat)

**Plan metadata:** committed alongside this summary (see final commit below).

## Task 1 Acceptance Sweep

```
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -cE 'ref\([^)]*\)\.on\("'
0
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -cE '\.off\('
0
$ grep -c 'registry\.attach' src/net/watchers.js
18
$ grep -rn 'ref\.on(\|\.off(' src/net/watchers.js src/net/index.js | wc -l | tr -d ' '
0
$ node -e "import('./src/net/index.js').then(m=>{...need-list of netWatchResponse/netWatchDraftResponse...})"; echo exit=$?
exit=0
$ node scripts/net_registry_test.js; echo exit=$?
exit=0 (32/32 PASS, including the new leak-vector-(a) case)
$ npm test; echo exit=$?
exit=0
$ node scripts/engine_contract_check.js; echo exit=$?
exit=0 (4/4 PASS)
$ git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l | tr -d ' '
1
$ git status --porcelain scripts/fixtures/determinism/
(empty)
```

### One-shot callback diffs (criterion 8 — fidelity check)

```diff
@@ remotePrompt @@
   return new Promise(res=>{
-    const rr=db.ref("rooms/"+room+"/response");
+    let wid;
     const cb=snap=>{const v=snap.val();
-      if(v&&v.id===id){rr.off("value",cb);db.ref("rooms/"+room+"/prompt").remove().catch(netFail("prompt clear"));
+      if(v&&v.id===id){netDetach(wid);db.ref("rooms/"+room+"/prompt").remove().catch(netFail("prompt clear"));
         res(v.choice===undefined?null:v.choice);}};
-    rr.on("value",cb);
+    wid=netWatchResponse(db,room,cb,"response:"+id);
   });

@@ remoteDraftPrompt @@
   return new Promise(res=>{
-    const rr=db.ref("rooms/"+room+"/draftResponses/"+seat);
+    let wid;
     const cb=snap=>{const v=snap.val();
-      if(v&&v.id===id){rr.off("value",cb);db.ref("rooms/"+room+"/draftPrompts/"+seat).remove().catch(netFail("recipe prompt clear"));
+      if(v&&v.id===id){netDetach(wid);db.ref("rooms/"+room+"/draftPrompts/"+seat).remove().catch(netFail("recipe prompt clear"));
         res(v.choice);}};
-    rr.on("value",cb);
+    wid=netWatchDraftResponse(db,room,seat,cb,"draftResponse:"+id);
   });
```

Both diffs confirmed: the id comparison, node removal call, and promise resolution are byte-identical to their pre-task form; the only substitution is `rr.off("value",cb)` → `netDetach(wid)`, exactly as specified. (The `db.ref(...).remove()` calls inside these same callback bodies were further rewritten to `netRemovePrompt`/`netRemoveDraftPrompt` in Task 2, which owns write extraction — that is a separate, Task-2-scoped change, not part of Task 1's fidelity claim.)

### Red-proof transcript for the leak-vector-(a) case

Fault introduced: `detachRoom()` skips room-scoped entries whose label matches `/response/` (mimicking "skip entries carrying a one-shot-style label" — distinct from 09-01's coarser drill 2, which skipped *all* room-scoped entries):

```diff
 export function detachRoom() {
   let count = 0;
   for (const e of [...entries.values()]) {
-    if (e.scope === "room") {
+    if (e.scope === "room" && !/response/.test(e.label || "")) {
       detach(e.id);
       count++;
     }
   }
   return count;
 }
```

```
$ node scripts/net_registry_test.js; echo exit=$?
  ...
  PASS  detachRoom() removes the still-pending one-shot (leak vector a)
  FAIL  the fake's listener list for the abandoned one-shot's path is empty after teardown  (count=1)
  FAIL  emitting on the abandoned path after teardown never invokes the handler again  (firedBeforeTeardown=2)
2 case(s) FAILED.
exit=1
```

(The "detachRoom() removes the still-pending one-shot" line still reads PASS because other, non-response-labeled room-scoped entries from earlier cases are still removed — `removed > 0` stays true. The two assertions that specifically check the abandoned one-shot's own path go red, correctly naming the leak-vector-(a) case.)

Restored via `git checkout -- src/net/registry.js`; `node scripts/net_registry_test.js` → `exit=0` (32/32 PASS) confirmed again.

### The abandoned promise's fate

Recorded per the plan's explicit instruction: if `netDetachRoom()`/`netLeaveRoom()` runs while `remotePrompt()`'s or `remoteDraftPrompt()`'s promise is still pending, the registry entry is removed and the underlying Firebase listener detached — the promise itself is left unresolved. Nothing in the pre-existing code force-resolved an abandoned decision either, so this is not a behavior change smuggled in under the leak fix; the leak (the listener staying attached forever) is what's closed, not the promise's fate.

## Task 2 Acceptance Sweep

```
$ node -e "import('./src/net/index.js').then(m=>{const bad=Object.keys(m).filter(k=>!/^(net[A-Z]|cfgReady$)/.test(k));...})"; echo exit=$?
exit=0
$ grep -rncE 'setFlipCoin|setClockUI|showNarration|renderBattle|appendChatLine|renderSeatList|buildPlayerRows|showRoom|showHome|showGameView|drawBoard|panel\(|escHtml|emojify|alert\(' src/net/ | grep -v ':0$'
(empty)
$ grep -rncE '\breplaying\b|\bisHost\b|\bgame\b|\bmySeat\b|\bevIdx\b|\bevPushed\b' src/net/ | grep -v ':0$'
(empty — after rewording two comment-only false positives, see Deviations)
$ grep -rncE 'Promise\.all|await ' src/net/writers.js | grep -v ':0$'
(empty)
$ grep -c 'netFail' index.html
28
$ grep -rc 'netFail' src/net/ | grep -v ':0$'
(empty — after rewording two comment-only false positives, see Deviations)
$ npm test; echo exit=$?
exit=0
$ node scripts/net_registry_test.js; echo exit=$?
exit=0
$ node scripts/engine_contract_check.js; echo exit=$?
exit=0
$ node scripts/dlog_replay_test.js; echo exit=$?
exit=0
$ git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l | tr -d ' '
1
$ git status --porcelain scripts/fixtures/determinism/
(empty)
```

### Reference-call-site ledger

| Stage | `db.ref(` count in index.html |
|---|---|
| Pre-Task-1 (start of this plan) | 40 |
| Post-Task-1 | 38 (the two `rr=db.ref(...)` one-shot constructions removed; the writes still inside those callback bodies remained until Task 2) |
| Post-Task-2 | 9 (only the one-shot reads Task 3 owns) |
| Post-Task-3 | 0 |

Arithmetic check: 40 total = 29 writes (Task 2) + 2 one-shot listener constructions (Task 1, removed not moved to a writer/reader) + 9 reads (Task 3). 29 + 2 + 9 = 40. Balances.

### Decision-log fidelity (criterion 7)

```diff
 function logDecision(v){
   const n=dlogN++;
   if(!replaying){
     dlog.push(v);                  // kept locally too (harmless in multiplayer — resumeHostGame
                                     // overwrites it from Firebase — but it's the only copy solo has)
-    if(room)db.ref("rooms/"+room+"/dlog/"+n).set(encodeDec(v)).catch(netFail("decision log"));
+    if(room)netSetDlog(db,room,n,encodeDec(v),netFail("decision log"));
     else saveSoloState();
   }
 }
```

The counter increment (`n=dlogN++`), the local push (`dlog.push(v)`), and the single fire-and-forget write are still issued in exactly the same order, at exactly the same point (still ahead of the caller's own push to the broadcast event feed — `logDecision()` is always called before the events it produces are pushed via `pushEvents()`, and that call ordering is unchanged since neither function's caller was touched). Not batched, not awaited, not reordered.

### Event-feed fidelity (criterion 8)

```diff
 function pushEvents(){
   if(!db||!room)return;
-  const evr=db.ref("rooms/"+room+"/ev");
   while(evPushed<game.events.length){
-    evr.push(JSON.parse(JSON.stringify(game.events[evPushed]))).catch(netFail("event feed"));
+    netPushEvent(db,room,JSON.parse(JSON.stringify(game.events[evPushed])),netFail("event feed"));
     evPushed++;
   }
 }
```

Still one write per loop iteration, counter (`evPushed`) still advanced in the same place, in the same loop. The only change is the reused `evr` reference variable is gone — each call now constructs its own reference inside the writer, which is mechanically inert (same path, same underlying node) and does not change write count, order, or timing.

### Path fidelity (criterion 9)

Every path expression relocated into `src/net/writers.js` and `src/net/readers.js` was checked character-for-character against the pre-task `index.html` (`git show <pre-task-commit>:index.html`) by extracting every `db.ref(...)` expression from both and diffing the sets.

- **Writers:** 20 unique path expressions checked (some reused across multiple call sites, e.g. `"rooms/"+room+"/timerOff"` at both `toggleTimer()` and `beginGame()`; `"rooms/"+room+"/narr"` at both `netNarrate()` and `netBroadcast()`). 0 mismatches.
- **Readers:** 6 unique path expressions checked (`netReadRoom` covers both `"rooms/"+code` and `"rooms/"+room` — same shape, generic parameter). 0 mismatches.
- **Total:** 26 unique path expressions audited, 0 mismatches.

## Task 3 Acceptance Sweep

```
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -cE 'db\.ref\('
0
$ node -e "import('./src/net/index.js').then(m=>{...un-prefixed-export check...})"; echo exit=$?
exit=0
$ grep -rncE 'setFlipCoin|setClockUI|showNarration|renderBattle|appendChatLine|renderSeatList|buildPlayerRows|showRoom|showHome|showGameView|drawBoard|panel\(|escHtml|emojify|alert\(' src/net/ | grep -v ':0$'
(empty)
$ grep -rncE '\breplaying\b|\bisHost\b|\bgame\b|\bmySeat\b|\bevIdx\b|\bevPushed\b|\broster\b' src/net/ | grep -v ':0$'
(empty — after rewording one further comment-only false positive, see Deviations)
$ grep -c 'firebase-app-compat\|firebase-database-compat' index.html
2
$ grep -c 'type="module"' index.html
1
$ grep -c '<script>' index.html
1
$ grep -c 'resumeReadFailed' index.html
5
$ npm test; echo exit=$?
exit=0
$ node scripts/net_registry_test.js; echo exit=$?
exit=0
$ node scripts/dlog_replay_test.js; echo exit=$?
exit=0
$ node scripts/engine_contract_check.js; echo exit=$?
exit=0
$ git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l | tr -d ' '
1
$ git status --porcelain scripts/fixtures/determinism/
(empty)
```

### The two deliberate remaining Firebase touches

Both accounted for explicitly, per the plan's own instruction, rather than silently:

1. **The `db` global.** `let db=null, myId=null, room=null, ...` in `index.html` is still a classic-script global. De-globalizing it is Phase 10's job under GLOBAL-01 — deliberate, not an oversight. `src/net/` functions receive `db` as a plain argument at every call site; they never read a module-level or window-level `db`.
2. **The Firebase compat `<script>` tags.** `index.html:25-26` (`firebase-app-compat.js`, `firebase-database-compat.js`) stay classic script tags, ahead of the module entry (`grep -c 'type="module"' index.html` → 1, and the module tag is the last script in the document). `docs/MODULES.md` explains why: classic scripts run synchronously in document order; module scripts always defer. That ordering guarantees the `firebase` global exists before any module code runs — not converted, not touched.

### Browser tripwire (criterion 12 — unverified, see Deviations)

`window.__pp_module_ok === true` and `window.__pp_boot_count === 1` on a loaded page could not be checked this session — no browser-automation tool available. The dev server itself was confirmed to serve `index.html` (200) and `src/main.js` with the correct `text/javascript` MIME type via `curl`, then the ephemeral probe instance was stopped. This is the one criterion in this plan that remains open pending a follow-up Chrome session — see Deviations and Known Stubs below.

## Files Created/Modified

- `src/net/writers.js` — new. 24 exported functions: `netSetFlip`, `netSetClock`, `netSetTimerOff`, `netSetPrompt`, `netRemovePrompt`, `netSetResponse`, `netSetNarr`, `netPushChat`, `netSetBattle`, `netRemoveBattle`, `netSetRecipes`, `netSetDraftPrompt`, `netRemoveDraftPrompt`, `netSetDraftResponse`, `netSetTurnOrder`, `netUpdateRoom`, `netSetMeta`, `netWriteGameLog`, `netMarkPresence`, `netSetDlog`, `netPushEvent`, `netSetRecovery`, `netRemoveRecovery`, `netCreateRoom`, `netSetFeedback`.
- `src/net/readers.js` — new. 5 exported functions: `netReadMeta`, `netReadRoom`, `netReadDlog`, `netReadEv`, `netClaimSeat`.
- `src/net/watchers.js` — modified. Added `netWatchResponse`/`netWatchDraftResponse`, completing all 18 watchers.
- `src/net/index.js` — modified. Added `netDetach` (single-entry detach), re-exported all writer/reader/new-watcher names, all net-prefixed.
- `index.html` — modified across all three tasks. `remotePrompt()`/`remoteDraftPrompt()` route through the registry; every write call site now calls a `src/net/writers.js` function; every one-shot read call site now calls a `src/net/readers.js` function. `db.ref(` count: 0.
- `scripts/net_registry_test.js` — modified. Added the leak-vector-(a) case (case 10) with a vacuity guard.

## Decisions Made

See `key-decisions` in frontmatter. In short:
1. Left `SPLIT-04`/`NET-01`/`NET-02` `Pending` in `REQUIREMENTS.md` — NET-02's mechanical contract check is 09-04's deliverable, not a one-time grep run in this session; SPLIT-04 is substantively true but not yet mechanically guaranteed either.
2. Task 3's live-browser tripwire check could not run this session (no browser-automation tool, and installing one would violate this plan's own zero-packages threat-model constraint). Confirmed the dev server itself serves correctly via `curl`; the actual `window.__pp_module_ok`/`window.__pp_boot_count` assertion is deferred to a follow-up Chrome session.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Five comment-only false positives on `src/net/writers.js`'s own acceptance-criteria greps**
- **Found during:** Task 2's acceptance-criteria sweep (criteria 3 and 5) and Task 3's acceptance-criteria sweep (criterion 4)
- **Issue:** Header/section comments in `src/net/writers.js` used the literal identifiers `netFail`, `isHost`, `replaying`, `game`, and the substring `game` inside the section header `end-of-game meta / game log` — all in prose explaining why those things stay in `index.html` or don't apply here — which tripped their own naming greps.
- **Fix:** Reworded each to convey the same meaning without the literal token (e.g. "the error-surfacing helper that drives the visible 'sync trouble' banner" instead of naming `netFail`; "the host-authority and mid-replay-suppression checks" instead of `isHost`/`replaying`; "who's currently seated" instead of `game`/`roster`; "end-of-voyage meta / voyage transcript log" instead of "end-of-game...game log").
- **Files modified:** `src/net/writers.js`
- **Verification:** Re-ran each grep after each fix — all reached the expected empty/zero result.
- **Committed in:** `115d082` (Task 2's three) and `e77ff00` (Task 3's one — found during Task 3's sweep since it reused Task 2's criterion pattern with an added `\broster\b` term)

### Rule 4 items

None — no architectural changes were needed beyond the plan's own explicit design.

## Known Stubs

None — no UI surface was added; every deliverable is a transport module, a relocated call site, or a test case. The one open item (Task 3's browser tripwire, not run this session) is not a stub in the code — it is an unverified acceptance criterion, tracked below and in the broken-windows ledger.

## Issues Encountered

- No browser-automation tool (chromium-cli, Playwright, Puppeteer, or an MCP browser tool) was available in this executor session, so Task 3's `<human-check>` (`window.__pp_module_ok`/`window.__pp_boot_count` on a loaded page) could not be run directly. This mirrors 09-01's Task 3 finding exactly (that plan's live-browser NET-03 probe was likewise unrunnable from its own executor session and was performed separately). All Node-side automated checks passed; the dev server was confirmed to serve the page and the module entry correctly via `curl`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All eighteen watchers from D-01's inventory now attach through the registry; `src/net/writers.js` and `src/net/readers.js` hold every Firebase write and one-shot read in the codebase. `index.html`'s `db.ref(` count is 0.
- 09-04 (the mechanical contract check for NET-02, and the standing directional-import guarantee that closes SPLIT-04's letter, not just its substance) has everything it needs: `src/net/` is now the complete, sole transport surface, with no `.on()`/`.off()` call outside `registry.js` and zero UI/app-state references anywhere in `src/net/`.
- 09-05 (the behavioral reconnect/leave-rejoin proof for NET-03, and the two-tab multiplayer smoke test for ROADMAP criterion 4) can now exercise the full eighteen-watcher, full-transport-extracted surface rather than a partial slice.
- **One open item carried forward:** Task 3's live-browser tripwire check (`window.__pp_module_ok`/`window.__pp_boot_count`) needs a Chrome session to complete — recorded in the broken-windows ledger as an unrun `<verify>` step. This does not block 09-04/09-05, which have their own browser-verification requirements and can confirm both the tripwire and the newly-completed transport surface together.
- `REQUIREMENTS.md`'s `SPLIT-04`/`NET-01`/`NET-02` checkboxes remain `Pending` by design — see Decisions.

## Self-Check: PASSED

- `src/net/writers.js` — FOUND (`git show 115d082 --stat` includes it; `node --check src/net/writers.js` exit 0; `node -e "import('./src/net/writers.js')"` exit 0)
- `src/net/readers.js` — FOUND (`git show e77ff00 --stat` includes it; `node --check src/net/readers.js` exit 0)
- `src/net/watchers.js` — 18 wrappers confirmed (`grep -c 'registry\.attach' src/net/watchers.js` → 18)
- `src/net/index.js` — exports all writer/reader/watcher/registry names, `net`-prefixed only
- Commit `8a7c195` — FOUND in `git log --oneline`
- Commit `115d082` — FOUND in `git log --oneline`
- Commit `e77ff00` — FOUND in `git log --oneline`
- `npm test` — exit 0
- `node scripts/net_registry_test.js` — exit 0 (32/32 PASS)
- `node scripts/dlog_replay_test.js` — exit 0
- `node scripts/engine_contract_check.js` — exit 0
- `grep -c 'db\.ref(' index.html` → 0
- `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` → 1
- `git status --porcelain scripts/fixtures/determinism/` — empty

---
*Phase: 09-networking-layer-watcher-cleanup*
*Completed: 2026-07-24*
