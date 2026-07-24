---
phase: 09-networking-layer-watcher-cleanup
plan: 01
subsystem: infra
tags: [firebase, realtime-database, watcher-registry, listener-teardown, net-module, tracer]

# Dependency graph
requires:
  - phase: 08-engine-extraction-node-harness-migration
    provides: "src/main.js's window.PP bridge (D-14/D-15) and the src/shared + src/engine module convention this plan extends into src/net/"
provides:
  - "src/net/registry.js — the sole file in the repo permitted to call ref.on()/ref.off(), with exact-reference duplicate refusal and room/session scoping"
  - "src/net/watchers.js — netWatchFlip/netWatchConnected/netWatchPresence, three of the eighteen watchers, proving the handler-injection seam across both scopes"
  - "src/net/index.js — firebaseConfig + cfgReady() relocated byte-for-byte, netInit()/netLeaveRoom()/netDetachRoom()/netDetachAll()/netRegistrySize()/netRegistryList()"
  - "window.__pp_net_debug — the NET-03 observation hook, seeded (undocumented-token) for GLOBAL-03's future debug mechanism"
  - "scripts/net_registry_test.js — a Node unit test against a fake Reference, with all five specified failure modes proven red and restored"
affects: ["09-02", "09-03", "09-04", "09-05"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Handler-injection watcher seam: src/net/watchers.js passes the caller's own callback straight to registry.attach() as the callback itself — unwrapped, unadapted — so the exact function object the registry stores is the exact one it later hands to off(), and the callback body moves into index.html as a plain argument with zero edits."
    - "Registry-owns-attach(): attach() itself performs the ref.on(...) call rather than the caller calling .on() and reporting it — makes 'no .on() call may bypass the registry' mechanically true from a single file, not a judgment call across call sites."
    - "Room vs. session scoping: exactly two scopes, detachRoom() only ever touches 'room', session survives by construction."
    - "Isolated-backing fake as a red-proof control: a second, non-shared-backing fake Reference implementation specifically for the cross-instance/Assumption-A1 test, because the shared-backing fake used elsewhere in the same test file would not visibly notice a 'rebuild reference from stored path' regression in detach()."

key-files:
  created:
    - src/net/registry.js
    - src/net/watchers.js
    - src/net/index.js
    - scripts/net_registry_test.js
  modified:
    - src/main.js
    - index.html
    - package.json

key-decisions:
  - "Added a registry-routed cross-instance test case (case7b, an isolated/non-shared-backing fake Reference) beyond the plan's literal case list, because the original bypass-the-registry cross-instance case (testing the shared-backing fake directly, per the plan's own <behavior> wording) cannot be made to fail by any change to src/net/registry.js's detach() — it never calls detach() at all. Acceptance criterion 8 requires red-proof drill 4 (rebuild-reference-from-path fault) to make 'the cross-instance case' fail; only a registry-routed case can satisfy that literally. Both cases are kept: the original documents the empirical Assumption A1 answer against the shared-backing fake: 09-RESEARCH.md's own recommended design; the new one is the regression guard against detach() ever stopping using the entry's own stored ref."
  - "Did NOT call requirements.mark-complete for SPLIT-04/NET-01/NET-02/NET-03 despite them being listed in this plan's frontmatter requirements field. Only 3 of 18 watchers moved (NET-01 requires all of them), the contract check (NET-02's mechanical enforcement) is introduced in 09-04 not here, and NET-03 explicitly requires behavioral proof via a live browser session — which this plan's Task 3 could not perform (see below). Marking these complete now would misrepresent phase state; REQUIREMENTS.md's checkboxes are left as Pending and will be closed by whichever later plan in this phase actually finishes each one."

patterns-established:
  - "src/net/ is a leaf-adjacent tier that imports nothing from UI/engine/shared and reads no app-state global — every net function receives db/room/handler as plain arguments from the still-classic script, exactly mirroring how src/engine/ never reached back into index.html in Phase 8."

requirements-completed: []  # see key-decisions — deliberately left open; NET-03 in particular is unproven pending Task 3

coverage:
  - id: D1
    description: "src/net/registry.js: WatcherRegistry with exact-reference attach/detach, loud duplicate refusal, room/session scoping, detachAll(), size()/list()"
    requirement: "NET-01, NET-02"
    verification:
      - kind: unit
        ref: "scripts/net_registry_test.js (28 PASS cases, run via `node scripts/net_registry_test.js` and as part of `npm test`)"
        status: pass
    human_judgment: false
  - id: D2
    description: "src/net/watchers.js + src/net/index.js: three of eighteen watchers (flip/room-scoped, connected+presence/session-scoped) migrated end-to-end, callback bodies unchanged in index.html; firebaseConfig/cfgReady relocated byte-for-byte; leaveGame() tears the room scope down before reload"
    requirement: "SPLIT-04, NET-01"
    verification:
      - kind: unit
        ref: "Task 1's 13 acceptance-criteria greps/node checks (all exit=0) — see 'Task 1 Acceptance Sweep' below"
        status: pass
      - kind: integration
        ref: "npm test (determinism 30/30, engine_contract_check 4/4, dlog_replay_test, net_registry_test) — exit=0"
        status: pass
    human_judgment: false
  - id: D3
    description: "Registry's five specified failure modes (single-arg off(), room-teardown-hits-session, missing duplicate refusal, rebuilt-reference-from-path, dropped cancel-callback) each demonstrated red with the correct case named, then restored clean"
    requirement: "NET-01, NET-02"
    verification:
      - kind: unit
        ref: "Red-proof transcript below — each drill produces exit=1 naming the expected case(s); git checkout -- src/net/registry.js restores; exit=0 confirmed after each"
        status: pass
    human_judgment: false
  - id: D4
    description: "A same-tab, no-reload attach -> detach -> re-attach cycle observed against a live Chrome session with a real Firebase connection (NET-03's behavioral proof for this plan's 3-watcher slice)"
    requirement: "NET-03"
    verification: []
    human_judgment: true
    rationale: "This execution environment has no browser-automation tool available (no chrome-devtools/Playwright/Puppeteer MCP tool, no chromium-cli, no playwright/puppeteer package installed — confirmed by direct search, see 'Task 3' below). A real Chrome session against a real Firebase connection is a hard requirement for this check (docs/MODULES.md, 09-RESEARCH.md Pitfall 2) — there is no headless/Node equivalent. Per this plan's own critical invariant #5, everything else was completed and this task is explicitly handed back rather than marked verified. A human or a browser-capable agent must perform Task 3's Steps 0-7 (reproduced verbatim below) against the already-running dev server at http://localhost:8777/ before NET-03 can be marked satisfied for this plan."

# Metrics
duration: ~70min
completed: 2026-07-24
status: complete
---

# Phase 9 Plan 1: Registry-Mediated Watcher Teardown Tracer Summary

**Three-watcher tracer slice (room-scoped flip + two session-scoped presence watchers) proves the registry/handler-injection seam end-to-end with a red-proof-tested unit test; the live-browser NET-03 behavioral probe (Task 3) could not be performed in this environment and is handed back.**

## Performance

- **Duration:** ~70 min
- **Tasks:** 2 of 3 completed (Task 1, Task 2); Task 3 (live browser probe) not performed — see below
- **Files modified:** 7 (3 created under `src/net/`, 1 test script created, `src/main.js`/`index.html`/`package.json` modified)

## Accomplishments

- Built `src/net/registry.js`: the only file in the repo permitted to call `ref.on()`/`ref.off()`. `attach()` itself performs the `.on()` call (a deliberate refinement over RESEARCH.md's sketch, so "no `.on()` bypasses the registry" is true from a single file rather than a judgment call). Stores the original `Reference` object, never a rebuilt path. Duplicate attach for an already-tracked `(scope, path, event, label)` key is refused with a named `console.error` and does not attach a second listener.
- Built `src/net/watchers.js`: `netWatchFlip`/`netWatchConnected`/`netWatchPresence` — three-line transport wrappers that hand the caller's own handler straight to `registry.attach()` as the callback itself, unwrapped.
- Built `src/net/index.js`: `firebaseConfig` and `cfgReady()` relocated byte-for-byte from `index.html`; `netInit()`, `netLeaveRoom()`, and the registry surface exposed under `netDetachRoom`/`netDetachAll`/`netRegistrySize`/`netRegistryList`. `firebase` is referenced only inside `netInit()`'s body — the whole barrel still imports cleanly under plain Node.
- Wired `src/main.js`: net's exports folded into the existing `window.PP`/`globalThis` bridge; `window.__pp_net_debug` added (deliberately without a bridge-removal tag — it is meant to outlive the bridge Phase 11 deletes).
- Rewrote `index.html`'s `watchFlip()`, `watchPresence()`, and `fbInit()` to route through the registry with every callback body unchanged; deleted the now-duplicate `firebaseConfig`/`cfgReady()`; extended `leaveGame()` to call `netLeaveRoom()` before the reload.
- Built `scripts/net_registry_test.js`: 28 PASS cases against an in-memory fake Reference, covering every item in the plan's `<behavior>` list plus a registry-routed cross-instance case added to make red-proof drill 4 literally satisfiable (see Decisions). Wired into `package.json`'s `test` script.
- Ran all five specified red-proof drills to completion — each produces `exit=1` naming the correct case, and the tree is confirmed clean (`git status --porcelain src/ index.html` empty) after every restore.
- Confirmed `npm test`, `node scripts/engine_contract_check.js`, and the determinism corpus (`git log --oneline -- 'scripts/fixtures/determinism/*.jsonl'` → 1) are all green/unchanged throughout.
- Attempted to locate a browser-driving tool for Task 3 (the `run` skill, a search for `chromium-cli`/Playwright/Puppeteer, an MCP tool scan) — none found in this environment. Task 3 is handed back per the plan's own critical invariant #5.

## Task Commits

Each task committed atomically:

1. **Task 1: End-to-end slice — registry, three watchers across both scopes, teardown, and the debug hook** — `51aad12` (feat)
2. **Task 2: Node unit test for the registry, with its red path demonstrated** — `86f5069` (test)
3. **Task 3: Same-tab, no-reload attach → detach → re-attach probe against a live Firebase connection** — NOT executed; no commit (no files were changed, since nothing was run)

**Plan metadata:** committed alongside this summary (see final commit below).

## Task 1 Acceptance Sweep

All 13 acceptance criteria run and confirmed passing (see the plan's own `<acceptance_criteria>` list for full wording):

```
$ node -e "import('./src/net/index.js').then(m=>{...need-list check...})"; echo exit=$?
exit=0
$ node -e "import('./src/net/index.js').then(m=>{...net-prefix check...})"; echo exit=$?
exit=0
$ grep -c 'ref\.on(' src/net/registry.js
4
$ grep -rn 'ref\.on(\|\.off(' src/net/watchers.js src/net/index.js | wc -l
0
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -cE 'ref\("\.info/connected"\)\.on'
0
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -cE 'ref\("presence"\)\.on'
0
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -cE '/flip"\)\.on'
0
$ grep -cE '^(const|let|var|function)\s+(firebaseConfig|cfgReady)\b' index.html
0
$ grep -c 'PP-BRIDGE' src/main.js
2
$ grep -c '__pp_net_debug' src/main.js
1
$ node scripts/engine_contract_check.js; echo exit=$?
exit=0 (4/4 PASS)
$ npm test; echo exit=$?
exit=0
$ git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l
1
$ git status --porcelain scripts/fixtures/determinism/
(empty)
$ grep -c '<script>' index.html
1
$ grep -rncE 'queueMicrotask|requestAnimationFrame|Promise\.resolve\(\)\.then|setTimeout' src/net/ | grep -v ':0$'
(empty)
```

Two false positives surfaced and were fixed by rewording (not by weakening a check): the first `src/main.js` header comment for the debug hook happened to contain the literal string `PP-BRIDGE` in prose ("not tagged PP-BRIDGE"), pushing the grep count to 3; reworded to describe the mechanism without the literal token. Similarly `src/net/watchers.js`'s own header comment used the literal strings `queueMicrotask`/`requestAnimationFrame` while explaining their absence, tripping the "dispatch is synchronous" check against its own prose; reworded to the same effect without the literal tokens.

## Full Red-Proof Transcript (Task 2)

Each drill: introduce the fault, run `node scripts/net_registry_test.js`, confirm `exit=1` naming the expected case(s), `git checkout -- src/net/registry.js`, confirm `exit=0` again.

### Drill 1 — single-argument `off(event)` instead of `off(event, callback)`

```diff
- e.ref.off(e.event, e.callback);
+ e.ref.off(e.event);
```

```
$ node scripts/net_registry_test.js; echo exit=$?
  FAIL  detach calls the fake's removal API with the identical function object  (condition false)
  FAIL  a subsequent emit on that path does not invoke the detached handler  (calledCount=1)
  FAIL  detach() uses the exact Reference instance stored at attach time, not one rebuilt/shared from another cross-instance entry at the same path  (calledA=1 calledB=1)
3 case(s) FAILED.
exit=1
```
Restored; `node scripts/net_registry_test.js` → `exit=0`.

### Drill 2 — room teardown also detaches session-scoped entries

```diff
 export function detachRoom() {
   let count = 0;
   for (const e of [...entries.values()]) {
-    if (e.scope === "room") {
-      detach(e.id);
-      count++;
-    }
+    detach(e.id);
+    count++;
   }
   return count;
 }
```

```
$ node scripts/net_registry_test.js; echo exit=$?
  FAIL  detachRoom() returns the count of entries it removed  (removedCount=6 want=4)
  FAIL  detachRoom() leaves the session scope's count untouched  (size(session)=0 want=2)
  FAIL  session-scoped listeners still fire after a room-scoped teardown  (a=0 b=0)
3 case(s) FAILED.
exit=1
```
Restored; `node scripts/net_registry_test.js` → `exit=0`.

### Drill 3 — duplicate-key refusal removed

```diff
 export function attach({ scope, ref, event, callback, cancelCallback, label }) {
   const key = keyFor(scope, ref, event, label);
-  for (const e of entries.values()) {
-    if (e.key === key) {
-      console.error(...);
-      return e.id;
-    }
-  }
   const id = nextId++;
```

```
$ node scripts/net_registry_test.js; echo exit=$?
  FAIL  duplicate attach leaves the total count unchanged  (size()=3 want=2)
  FAIL  duplicate attach returns the existing id, not a new one  (condition false)
  FAIL  the fake recorded only the first attachment  (onCalls=2)
  FAIL  a duplicate attach logs a named console.error  ([])
4 case(s) FAILED.
exit=1
```
Restored; `node scripts/net_registry_test.js` → `exit=0`.

### Drill 4 — rebuild a reference from a stored path at detach time

```diff
 export function detach(id) {
   const e = entries.get(id);
   if (!e) return false;
-  e.ref.off(e.event, e.callback);
+  let rebuilt = null;
+  for (const other of entries.values()) {
+    if (other.path === e.path) rebuilt = other.ref;
+  }
+  if (!rebuilt) rebuilt = e.ref;
+  rebuilt.off(e.event, e.callback);
   entries.delete(id);
   return true;
 }
```

```
$ node scripts/net_registry_test.js; echo exit=$?
  FAIL  detach() uses the exact Reference instance stored at attach time, not one rebuilt/shared from another cross-instance entry at the same path  (calledA=1 calledB=1)
1 case(s) FAILED.
exit=1
```
Restored; `node scripts/net_registry_test.js` → `exit=0`.

**Which way this resolves against each fake (the empirical half of Assumption A1), exactly as the plan asked to record:** against the **shared-backing** fake (`createFakeFirebase()`, used by case 7 and everywhere else in the test file), this exact fault is *invisible* — that fake's `off()` resolves purely by `(path, event, callback)`, so a "rebuilt" reference sharing the same path removes the correct listener regardless of which instance issued the call, and the original bypass-based cross-instance case (case 7) stays green under this fault. Only against the **isolated/non-shared-backing** fake (`createIsolatedFakeRef()`, case 7b, added this plan) does the fault surface, because there each instance's listeners are invisible to any other instance's `off()` call. This is exactly the ambiguity RESEARCH.md's Pitfall 1 describes: whether a rebuilt reference works depends on SDK internals this project doesn't control, so the registry's actual design (always store and reuse the original object) is what makes the answer not matter — but a future maintainer "simplifying" the registry back to a path-based design would silently pass code review against a shared-backing test double and only fail in a stricter one, which is exactly why case 7b exists as a permanent guard.

### Drill 5 — cancel-callback forwarding dropped

```diff
   const id = nextId++;
   const path = ref.toString();
-  if (cancelCallback) {
-    ref.on(event, callback, cancelCallback);
-  } else {
-    ref.on(event, callback);
-  }
+  ref.on(event, callback);
   entries.set(id, { id, key, scope, ref, event, callback, cancelCallback, label, path });
```

```
$ node scripts/net_registry_test.js; echo exit=$?
  FAIL  attach forwards the cancel callback to the fake as the third argument  (condition false)
1 case(s) FAILED.
exit=1
```
Restored; `node scripts/net_registry_test.js` → `exit=0`.

### Clean-tree confirmation after all five drills

```
$ git status --porcelain src/ index.html
(empty)
```

### Full passing transcript (baseline, before/after every drill)

```
net_registry_test — src/net/registry.js against a fake Reference

  PASS  attach calls the fake's listener API exactly once
  PASS  attach hands the fake the identical function object
  PASS  detach(id) returns true for a live entry
  PASS  detach calls the fake's removal API with the identical function object
  PASS  a subsequent emit on that path does not invoke the detached handler
  PASS  duplicate attach leaves the total count unchanged
  PASS  duplicate attach returns the existing id, not a new one
  PASS  the fake recorded only the first attachment
  PASS  a duplicate attach logs a named console.error
  PASS  vacuity guard: room-scoped count is greater than zero before teardown
  PASS  detachRoom() returns the count of entries it removed
  PASS  detachRoom() empties the room scope
  PASS  detachRoom() leaves the session scope's count untouched
  PASS  session-scoped listeners still fire after a room-scoped teardown
  PASS  precondition: room scope is empty before this case's own attach
  PASS  vacuity guard: pre-teardown room count is greater than zero
  PASS  room count reaches zero after teardown
  PASS  re-attaching the same set returns the room count to its pre-teardown value, not double it
  PASS  vacuity guard: total count is greater than zero before detachAll()
  PASS  detachAll() returns the count of entries it removed
  PASS  detachAll() brings the total to zero
  PASS  cross-instance setup: refA and refB are different object instances
  PASS  vacuity guard: the shared path has a listener before the cross-instance detach
  PASS  a cross-instance off() empties the shared path's listener list in the fake
  PASS  emitting after a cross-instance detach does not invoke the handler
  PASS  detach() uses the exact Reference instance stored at attach time, not one rebuilt/shared from another cross-instance entry at the same path
  PASS  attach forwards the cancel callback to the fake as the third argument
  PASS  list() survives JSON.stringify
  PASS  list() exposes no function or Reference values

All cases passed.
```

## Task 3: NOT Performed — Handed Back

**This plan's critical invariant #5 explicitly anticipates this outcome:** *"The browser probe is same-tab and no-reload... If you cannot drive a browser, complete everything else and hand the browser task back — do NOT mark it verified."*

This execution environment (a sequential GSD plan-executor agent with `Read`/`Write`/`Edit`/`Bash`/`Skill` tools only) has no browser-automation capability:

- No `chrome-devtools`/Playwright/Puppeteer MCP tool is registered.
- No `chromium-cli` on `PATH` (the `run` skill's own recommended fallback for browser-driven projects — confirmed absent by direct search, not assumed).
- No `playwright` or `puppeteer` npm package installed globally or in this project (and installing one now would both violate this plan's own threat-model constraint `T-09-SC` — "zero packages introduced" — and would be a Rule-3-excluded package install requiring separate human sign-off in any case).
- `Google Chrome.app` is present on the filesystem, but launching it and driving it via raw CDP over a Bash-spawned WebSocket connection is well outside what this plan's scope calls for improvising.

**What IS confirmed:** the dev server precondition is met — `curl -s -o /dev/null -w "%{http_code}" http://localhost:8777/index.html` returns `200`, and `lsof -i :8777` shows a live Python `http.server` process rooted at this worktree, matching the plan's stated precondition exactly.

**What a human or a browser-capable agent needs to do**, reproduced verbatim from the plan's Task 3 `<action>` (do not adjust the expectations to match an observed number if a step diverges — stop and report instead):

0. Open `http://localhost:8777/` in Chrome. Confirm `window.__pp_module_ok === true` and `window.__pp_boot_count === 1` before trusting anything below.
1. At the home screen, read `window.__pp_net_debug.size("session")` (expect `2`) and `window.__pp_net_debug.size("room")` (expect `0`). Record `list()` verbatim.
2. Create a room and start the game (`beginGame()` runs). Read the counts again: `size("session")` still `2`, `size("room")` now `1`. Record `list()`. Note explicitly that this count is greater than zero (vacuity guard).
3. From the console, call `window.__pp_net_debug.detachRoom()` — **no page reload**. Assert `size("room") === 0` and `size("session") === 2`.
4. With the room scope torn down, toggle the browser's network offline/online (or otherwise interrupt the connection) and confirm the sync notice reacts — proving the session listeners are still live, not merely counted.
5. Call the classic `watchFlip()` again from the console. Assert `size("room")` returns to `1` (not `2`).
6. Call `watchFlip()` a second time. Expect a named `console.error` from the registry and `size("room")` still `1`.
7. State explicitly that step 2's `size("room")` was greater than zero (vacuity guard), then record the full transcript — every expression, every returned value, any console output — into this file's own follow-up, or into a fresh `09-01-SUMMARY.md` addendum.

After that transcript is recorded, re-run `npm test` (must still be `exit=0`) and `git status --porcelain` (must still be empty — the probe changes no files) to close out the plan's `<verification>` section in full.

## Files Created/Modified

- `src/net/registry.js` — new. `WatcherRegistry`: `attach`/`detach`/`detachRoom`/`detachAll`/`size`/`list`. No imports.
- `src/net/watchers.js` — new. `netWatchFlip`/`netWatchConnected`/`netWatchPresence`. Imports only `./registry.js`.
- `src/net/index.js` — new. `firebaseConfig`/`cfgReady`/`netInit`/`netLeaveRoom`/`netDetachRoom`/`netDetachAll`/`netRegistrySize`/`netRegistryList`. Imports only `./registry.js` and `./watchers.js`.
- `scripts/net_registry_test.js` — new. 28-case Node unit test, zero dependencies.
- `src/main.js` — modified: `import * as net from "./net/index.js"`, folded into `PP`/bridge, `window.__pp_net_debug` added.
- `index.html` — modified: `watchFlip()`/`watchPresence()`/`fbInit()` rewritten to route through the registry with callback bodies unchanged; `firebaseConfig`/`cfgReady()` deleted (moved, not duplicated); `leaveGame()` now calls `netLeaveRoom()` before the reload.
- `package.json` — modified: `test` script now also runs `scripts/net_registry_test.js`.

## Decisions Made

See `key-decisions` in frontmatter. In short: added a registry-routed cross-instance test case beyond the plan's literal wording because the literal case (as specified) structurally cannot be affected by any change to `registry.js`, and the plan's own acceptance criterion 8 requires it to be; and deliberately did not mark `SPLIT-04`/`NET-01`/`NET-02`/`NET-03` complete in `REQUIREMENTS.md`, since this plan only migrates 3 of 18 watchers and NET-03's live-browser proof is the unfinished Task 3.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Two acceptance-criteria false positives from this plan's own explanatory comments**
- **Found during:** Task 1's acceptance-criteria sweep (criterion 6, `PP-BRIDGE` count) and Task 1's acceptance-criteria sweep (criterion 13, dispatch-synchrony grep)
- **Issue:** `src/main.js`'s debug-hook header comment used the literal string `PP-BRIDGE` in prose to explain why the hook does NOT carry that tag, pushing the count from 2 to 3. `src/net/watchers.js`'s header comment used the literal strings `queueMicrotask`/`requestAnimationFrame` to explain their absence, tripping the same-named check against its own prose.
- **Fix:** Reworded both comments to convey the same meaning without the literal substrings ("carries no bridge-removal tag" / "Nothing in this file defers that call to a later turn of the event loop").
- **Files modified:** `src/main.js`, `src/net/watchers.js`
- **Verification:** Re-ran both greps — `grep -c 'PP-BRIDGE' src/main.js` → `2`; `grep -rncE 'queueMicrotask|requestAnimationFrame|Promise\.resolve\(\)\.then|setTimeout' src/net/ | grep -v ':0$'` → empty.
- **Committed in:** `51aad12` (Task 1 commit — found and fixed before that commit landed)

### Rule 4 items

None — no architectural changes were needed beyond the plan's own explicit design (which already anticipated the registry-routed cross-instance addition as within Claude's Discretion per 09-CONTEXT.md's "registry's exact API shape").

## Known Stubs

None. No UI surface was added by this plan; every deliverable is either a working transport module or a test script.

## Issues Encountered

- No browser-automation tool is available in this execution environment for Task 3 — see the dedicated "Task 3: NOT Performed — Handed Back" section above for the full investigation and hand-back instructions.

## User Setup Required

None — no external service configuration required. `firebaseConfig`'s values were copied byte-for-byte from the existing `index.html` declaration (confirmed via diff against the original block before deletion — `apiKey`, `authDomain`, `databaseURL`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`, `measurementId` all identical), not retyped.

## Next Phase Readiness

- `src/net/registry.js`, `watchers.js`, and `index.js` exist and are proven by a red-proof-tested unit test — 09-02 and 09-03 can migrate the remaining fifteen watchers and the self-cancelling one-shots onto this same pattern with confidence the seam itself works.
- **Blocker:** Task 3's live-browser NET-03 probe has not been performed. A human or a browser-capable agent must complete it (Steps 0-7 above, against the already-running dev server on port 8777) before this plan's own `<verification>` section — and by extension `REQUIREMENTS.md`'s NET-03 checkbox — can be considered closed. This does not block 09-02/09-03 from starting, since they depend only on this plan's code artifacts, not its browser transcript.
- `REQUIREMENTS.md`'s `SPLIT-04`/`NET-01`/`NET-02`/`NET-03` checkboxes remain `Pending` — left open deliberately (see Decisions).

## Self-Check: PASSED

- `src/net/registry.js` — FOUND (`git show 51aad12 --stat` includes it; `node -e "import('./src/net/registry.js')"` exit 0)
- `src/net/watchers.js` — FOUND, same commit
- `src/net/index.js` — FOUND, same commit
- `scripts/net_registry_test.js` — FOUND (`git show 86f5069 --stat` includes it; `node scripts/net_registry_test.js` exit 0)
- Commit `51aad12` — FOUND in `git log --oneline`
- Commit `86f5069` — FOUND in `git log --oneline`
- `npm test` — exit 0
- `node scripts/engine_contract_check.js` — exit 0
- `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` → `1`
- `git status --porcelain scripts/fixtures/determinism/` — empty

---
*Phase: 09-networking-layer-watcher-cleanup*
*Completed: 2026-07-24*
