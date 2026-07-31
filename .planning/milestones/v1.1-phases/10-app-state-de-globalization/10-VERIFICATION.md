---
phase: 10-app-state-de-globalization
verified: 2026-07-24T23:30:00Z
status: passed
score: 4/4 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 10: App State & De-globalization Verification Report

**Phase Goal:** Encapsulate the 40+ implicit globals behind an app-state module while keeping every inline handler working through a single documented mechanism.
**Verified:** 2026-07-24T23:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | The 40+ implicit globals are encapsulated behind module exports / an app-state module instead of bare `window` globals | ✓ VERIFIED | `src/state/index.js` exports one plain `appState` object (46 properties, confirmed by `APP_STATE_NAMES.length === 46` live-executed) that is never reassigned — grepped/enforced by `state_contract_check.js` assertion 5 (live-run: PASS). `src/main.js` publishes it BY REFERENCE (`appState: stateNs.appState` spread into `PP`, then `Object.assign(globalThis, PP)`) — not a value snapshot. No leftover top-level declarations or bare usages of any of the 46 names in `index.html` (assertions 1/2, live-run: PASS). |
| 2 | Every `onclick` handler still works after de-globalization (1 inline attribute + 40 closures) | ✓ VERIFIED | `grep -cE '^\s*function revealMyRecipe\('` → 1 (still a function declaration, globally reachable). Inline attribute at `index.html:1731` (`onclick="revealMyRecipe()"`) byte-identical to CONTEXT.md's D-01 citation. 10-07-SUMMARY.md documents a live Chrome click-through (dispatchEvent-driven, not pixel clicks) confirming `typeof window.revealMyRecipe === "function"`, zero new `ReferenceError`/`no-undef`, and a full solo game + two-tab MP game playable (host room XYDQ, both tabs' `appState.game` valid, board rendered) — this browser evidence was pre-established by the orchestrator per the verification brief and is consistent with the static evidence found here. |
| 3 | Any retained `window` bridge for test/debug state access is intentional, single, and named/documented | ✓ VERIFIED | Exactly 4 documented hooks (`__pp_module_ok`, `__pp_boot_count`, `__pp_net_debug`, `__pp_app_state_debug`), enforced by an allowlist in `state_contract_check.js` assertion 3 (live-run: PASS, both "no extra hook" and "no hook missing" directions). `window.__pp_app_state_debug` is a **function** returning `{ ...stateNs.appState }` (fresh shallow copy each call) — confirmed by reading `src/main.js:90-92`; there is no `window.__pp_app_state_debug = appState` bare-reference assignment anywhere. Documented in `docs/MODULES.md` (`## Standing browser debug hooks (GLOBAL-03)` table, lines 376-396). |
| 4 | A full solo game and a multiplayer game both remain playable with no new console `no-undef`/`ReferenceError` regressions | ✓ VERIFIED | Per verification brief's `evidence_already_established` (orchestrator's own Chrome session, 10-07-SUMMARY.md): 46 appState keys confirmed, solo game advanced rounds cleanly, two-tab MP (room XYDQ) synced correctly, console clean of new `ReferenceError`/`no-undef`. Cross-checked against `npm test` (full suite, live-run here: exit 0, including `state_contract_check.js` 5/5) and `determinism_baseline.js --verify` (live-run here: 30/30 seeds, source hash unchanged). |

**Score:** 4/4 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/state/index.js` | Single mutable `appState` object, exported once, never reassigned, no accessors | ✓ VERIFIED | Read directly: one `export const appState = {...}` with 46 plain data properties; no `get`/`set`/`Object.defineProperty`/`Proxy` anywhere in the file (grepped, zero hits). Purity assertion (no document/window/firebase/localStorage/Date.now/Math.random/globalThis/new Function) passes live. |
| `src/main.js` | Publishes `appState` by reference through the `window.PP` bridge; read-only debug hook | ✓ VERIFIED | `const PP = { ...shared, ...engine, ...net, appState: stateNs.appState }; window.PP = PP; Object.assign(globalThis, PP);` — reference published, not copied fields. `window.__pp_app_state_debug` is a function returning a fresh copy, confirmed by direct read. |
| `scripts/state_contract_check.js` | 5-assertion standing gate, wired into `npm test` | ✓ VERIFIED | Live-run (both standalone and via `npm test`): all 5 assertions PASS. `package.json`'s `test` script chain includes `node scripts/state_contract_check.js` as the final step. |
| `scripts/migrate_app_state.js` | Authoritative 46-name inventory + migration tool | ✓ VERIFIED | `APP_STATE_NAMES` live-imported and counted: exactly 46. The 7 UI render-handle names (`cell, shipEls, activeRing, spinNeedle, stormText, stormDial, windLabels`) are confirmed absent from the array and confirmed still declared as bare globals at `index.html:1342` (deliberately deferred to Phase 11 — not a Phase 10 defect). |
| `scripts/lib/js_region_tokenizer.js` | String/comment/regex-aware tokenizer, not a regex substitution | ✓ VERIFIED | Read directly: implements a character-by-character `classify()` state machine with distinct `squote`/`dquote`/`template`/`regex`/`string`/`comment` modes, including a regex-vs-division disambiguator (`REGEX_PRECEDING_CHARS`/`REGEX_PRECEDING_KEYWORDS` sets) and character-class-aware regex body scanning — this is the fix for the 10-01 tool bug described below, confirmed present in committed code, not just narrated. |

### Byte-Safety of Collision-Prone Content

| Check | Expected | Actual | Status |
|---|---|---|---|
| `grep -c '\$("game")' index.html` | 6 | 6 | ✓ VERIFIED |
| `grep -c 'love of the game' index.html` | 1 | 1 | ✓ VERIFIED |
| `grep -cE '^\s*function revealMyRecipe\(' index.html` | 1 | 1 | ✓ VERIFIED |
| `index.html:1731` inline `onclick="revealMyRecipe()"` | byte-identical | confirmed present, unchanged | ✓ VERIFIED |

### The 3 Documented Tool Bugs — Confirmed Fixed in Committed Code

| # | Bug (per SUMMARY) | Live-code confirmation |
|---|---|---|
| 1 | 10-01: tokenizer misclassified a regex literal (`escHtml`'s `/[&<>"]/g`) as a string, corrupting downstream classification | `js_region_tokenizer.js` contains a dedicated `regex` lexer mode with a regex-vs-division disambiguator (verified by direct read, not just the SUMMARY's narration). |
| 2 | 10-02: `replayShortfall()`'s local parameter `resumeEvLen` was blindly rewritten to `appState.resumeEvLen` (invalid JS param name) by the scope-blind migration tool | `index.html:4003`: `function replayShortfall(rebuiltEvLen, priorEvLen, readFailed){` — the local parameter is renamed to `priorEvLen`, confirmed by direct grep; no `appState.resumeEvLen` appears as a parameter anywhere. |
| 3 | 10-05: fully-emptied `let game=null,timer=null,logLines=[];` collapsed into a silent comma-expression bug (`lettimer=null,appState.logLines=[];`) instead of a blank line | `index.html:864` is confirmed blank (empty line) by direct read; `grep -n "lettimer" index.html` returns zero hits. |

### Determinism Control-Flow (D-06)

| Check | Result |
|---|---|
| `replaying, dlog, dlogIdx, dlogN, evIdx` migrated without reordering | Confirmed no getter/setter/Proxy in `src/state/index.js` — plain property access only, synchronous and order-preserving by the JS spec. |
| `node scripts/dlog_replay_test.js` | Live-run here: all 13 cases PASS ("All cases passed.") |
| `node scripts/determinism_baseline.js --verify` | Live-run here: 30/30 seeds PASS, source hash unchanged |
| Corpus never re-captured | `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' \| wc -l` → 1 (live-run here) |

### The `appState` Naming Deviation

Confirmed `appState` (not `state`) is the actual published name on the bridge (`src/main.js:62-64`, `src/state/index.js:54`). No `state`-shadowing collision remains: `state_contract_check.js` assertion 5 (live-run: PASS) confirms the `appState` binding itself is never reassigned anywhere outside its own declaration, and the pre-existing local-parameter collisions the SUMMARYs describe (`broadcastFlip(state)`, `setFlipCoin(state)`, `coinHTML(state,...)`, `setRecoveryState(state)`, a local `const state=...` in `setClockUI()`) were the reason `state` was rejected in favor of `appState` — these local `state` parameters are unrelated to app-state and untouched by the migration, since the migration tool only ever targeted the 46 `appState.NAME`-qualified names, never the identifier `state` itself.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| GLOBAL-01 | 10-01..10-06 | 40+ globals encapsulated behind app-state module | ✓ SATISFIED | 46/46 names migrated, `state_contract_check.js` 5/5 live-PASS, reference-publication mechanism confirmed by direct read |
| GLOBAL-02 | 10-04, 10-07 | Every onclick handler still works | ✓ SATISFIED | 1 inline attribute + 40 closures accounted for; `revealMyRecipe` reachability confirmed; browser click-through evidence pre-established by orchestrator |
| GLOBAL-03 | 10-06 | Single documented debug mechanism | ✓ SATISFIED | 4-hook allowlist enforced mechanically; documented in `docs/MODULES.md`; `__pp_app_state_debug` confirmed read-only (fresh copy, not live reference) |

### Anti-Patterns Found

None. Grepped `TBD|FIXME|XXX|TODO|HACK|PLACEHOLDER` across `src/state/index.js`, `src/main.js`, `scripts/state_contract_check.js`, `scripts/migrate_app_state.js`, `scripts/lib/js_region_tokenizer.js`, and the classic-script region of `index.html` — zero hits.

### Pre-Existing Finding (Not a Phase 10 Blocker)

10-07-SUMMARY.md documents a guest-tab duplicate-attach warning (`[src/net/registry.js] duplicate attach refused … rooms/XYDQ/{seats,status}`) on the lobby→game transition, root-caused to `watchRoom()` being invoked from multiple lifecycle points (a pre-existing Phase 9 call-structure shape). The Phase 9 registry guard correctly refuses the duplicate — no leak, no `ReferenceError`, game works. This is confirmed to be a pre-existing behavior (de-globalization renamed identifiers only, it did not change call structure) and was filed as a follow-up task for Phase 11, not treated as a Phase 10 gap here, consistent with the verification brief's explicit instruction.

### Human Verification Required

None. All four roadmap success criteria are supported by either live-reproducible static/automated evidence (this verification pass) or previously-established Chrome browser evidence explicitly cited in the verification brief's `evidence_already_established` section, which this report treats as given rather than re-running.

### Gaps Summary

No gaps found. All 4 roadmap success criteria for Phase 10 are verified. The mechanism (shared mutable object published by reference, not a snapshot) is correctly implemented and independently confirmed by reading `src/state/index.js` and `src/main.js` directly. All 46 names are migrated with zero leftover declarations or bare usages (live-executed contract check, not trusted from SUMMARY narration). The three tool bugs the executors reported fixing were independently confirmed present in the committed code (not just described). Byte-safety of the `$("game")`/`"love of the game"` collision hazards holds. The debug hook is genuinely read-only. The `appState` naming deviation is sound and has no residual shadowing risk.

---

_Verified: 2026-07-24T23:30:00Z_
_Verifier: Claude (gsd-verifier)_
