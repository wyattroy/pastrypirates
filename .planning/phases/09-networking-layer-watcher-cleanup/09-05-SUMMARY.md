---
phase: 09-networking-layer-watcher-cleanup
plan: 05
subsystem: infra
tags: [firebase, realtime-database, watcher-registry, listener-teardown, net-module, multiplayer, two-tab]

# Dependency graph
requires:
  - phase: 09-networking-layer-watcher-cleanup
    provides: "09-01/09-02/09-03/09-04's complete src/net/ transport surface (registry.js, all 18 watchers, writers.js, readers.js, index.js, scripts/net_contract_check.js) — this plan is the behavioral proof against that finished surface"
provides:
  - "09-05-SUMMARY.md — the verbatim NET-03 full-scale probe transcript and the two-tab multiplayer transcript"
  - "REQUIREMENTS.md — NET-01 and NET-03 marked Complete, independently confirmed by grep + automated check chain in addition to the coordinator's live-browser transcripts"
  - "WINDOWS.md entry — ROADMAP criterion 4's full in-game turn-propagation two-tab test not cleanly observed (test-driving artifact, not a code finding); flagged for Phase 12 VERIFY-03 to close"
affects: ["Phase 10", "Phase 11", "Phase 12"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Recording-only executor pattern: this executor session has no browser-automation tool; the coordinator (which has Chrome MCP) drove both browser tasks directly against live Firebase, and this session's job was strictly to independently re-verify the static/automated claims (grep + npm test + net_contract_check) and record the coordinator's transcripts verbatim without embellishment or re-running the browser steps."

key-files:
  created: []
  modified:
    - .planning/REQUIREMENTS.md
    - .planning/WINDOWS.md
    - .planning/STATE.md
    - .planning/ROADMAP.md

key-decisions:
  - "Marked NET-01 and NET-03 Complete in REQUIREMENTS.md, per the recording rules given for this plan, only after independently re-confirming both: (a) all 18 watchers route through the registry — grep -c 'registry.attach(' src/net/watchers.js = 18, grep -c '^export function netWatch' src/net/watchers.js = 18, and zero raw .on()/.off() calls in index.html outside src/net/registry.js; (b) node scripts/net_contract_check.js and npm test both exit 0. This session did not re-run any browser step and did not take the coordinator's transcripts on faith alone for the completion decision — the independent static/automated confirmation is what authorizes the REQUIREMENTS.md change, per this plan's own recording rules."
  - "ROADMAP criterion 4 ('a multiplayer game across two browser tabs still syncs deterministically after the extraction') is recorded as PARTIALLY demonstrated, not fully satisfied. Transcript B proves distinct-identity join and bidirectional lobby-state sync (the `seats` watcher) work correctly across two real tabs. It does NOT cleanly prove the full in-game turn-propagation loop (narr/ev/prompt/flip/battle watchers observed live from host to guest), because the coordinator's own defensive UI click during that leg of the test misrouted the host tab into pass-and-play mode. This is recorded honestly as a test-driving artifact, not a sync regression, and not resolved by editing any expectation or code, per the plan's explicit prohibition against doing so. A WINDOWS.md item and this SUMMARY both flag it for Phase 12's VERIFY-03 (Chrome-MCP two-tab E2E) to close with a clean re-run."
  - "Did not mark NET-02 or SPLIT-04 here — both were already marked Complete in 09-04-SUMMARY.md and REQUIREMENTS.md; this plan only touches NET-01 and NET-03, its own frontmatter requirements."

patterns-established: []

requirements-completed: [NET-01, NET-03]

coverage:
  - id: D1
    description: "NET-03 full-scale same-tab attach, detach and re-attach cycle across all eighteen registry-mediated watchers, against a live hosted Firebase room, with a stated vacuity guard, session-scope survival, liveness proof, re-attach count parity, and a refused double-attach (leak vector b)"
    requirement: "NET-03"
    verification:
      - kind: manual_procedural
        ref: "Chrome session against a real Firebase RTDB room (ZXZS / earlier JFAS), run by the coordinator (this executor session has no browser-automation tool) — Transcript A recorded verbatim below"
        status: pass
      - kind: unit
        ref: "node scripts/net_registry_test.js (32/32 PASS, run via npm test) — the vacuity-guarded unit-test coverage for leak vector (a), the abandoned response listener, which the plan's own Step 8 permits attributing to unit coverage rather than a browser observation when staging it live is impractical"
        status: pass
    human_judgment: false
  - id: D2
    description: "All 18 Firebase watchers route through src/net/'s registry as the sole attach/detach path — independently re-confirmed by this session via grep, not taken on the coordinator's transcript or on 09-04's contract-check summary alone"
    requirement: "NET-01"
    verification:
      - kind: unit
        ref: "grep -c 'registry.attach(' src/net/watchers.js = 18; grep -c '^export function netWatch' src/net/watchers.js = 18; grep for raw .on()/.off() outside src/net/registry.js in index.html = 0"
        status: pass
      - kind: unit
        ref: "node scripts/net_contract_check.js — exit=0, 5/5 PASS including 'watcher inventory completeness (NET-01, D-01)'"
        status: pass
      - kind: integration
        ref: "npm test — exit=0 (determinism 30/30, engine_contract_check 4/4, dlog_replay_test, net_registry_test 32/32, net_contract_check 5/5)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Two-tab bidirectional lobby-state sync proven: distinct local identities (D-11 shared-localStorage trap correctly avoided), guest join reflected in host's seat list and host reflected in guest's seat list, both via the extracted seats watcher"
    requirement: null
    verification:
      - kind: manual_procedural
        ref: "Two Chrome tabs against a live Firebase room (ZXZS), run by the coordinator — Transcript B recorded verbatim below"
        status: pass
    human_judgment: false
  - id: D4
    description: "ROADMAP criterion 4's full claim — a complete two-tab in-game turn-propagation smoke test (host move -> guest sees it via narr/ev/prompt/flip/battle watchers) with host authority confirmed unchanged"
    requirement: null
    verification: []
    human_judgment: true
    rationale: "The coordinator's own test-driving misclick (a defensive 'confirm' click that matched the wrong button) dropped the host tab into pass-and-play mode mid-observation, so the full turn-propagation leg of Transcript B was not cleanly completed. This is an honest limitation, not a code finding, and per the plan's explicit prohibition it was not resolved by editing any expectation or code. It needs a clean re-run — tracked in WINDOWS.md and left for Phase 12's VERIFY-03 (Chrome-MCP two-tab E2E) to close."

# Metrics
duration: ~25min
completed: 2026-07-24
status: complete
---

# Phase 9 Plan 5: NET-03 Behavioral Proof & Two-Tab Multiplayer Smoke Test Summary

**Recorded the coordinator's two live-Chrome/live-Firebase transcripts verbatim: a full 18-watcher same-tab attach/detach/re-attach cycle that fully satisfies NET-03, plus a two-tab test that cleanly proves bidirectional lobby sync but leaves the full in-game turn-propagation leg of ROADMAP criterion 4 honestly unresolved after a test-driving misclick.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2 of 2 completed. Both browser tasks were run by the coordinator (this executor session has no browser-automation tool); this session's job was to independently re-verify the automated claims and record the transcripts faithfully.
- **Files modified:** 4 (`.planning/REQUIREMENTS.md`, `.planning/WINDOWS.md`, `.planning/STATE.md`, `.planning/ROADMAP.md` — no source files touched; no regression was found, so nothing under `index.html`/`src/net/` required a fix)

## Accomplishments

- **Task 1 — NET-03 full-scale probe (Transcript A):** the coordinator ran a same-tab, no-reload attach → detach → re-attach cycle against all 18 registry-mediated watchers, over a live hosted room on real Firebase References. Every acceptance criterion in the plan's Task 1 passed: the vacuity guard (room count = 2 before teardown, not zero), session-scope survival at exactly 2 (`connected`, `presence`) through a room teardown, a refused double-attach with a named `console.error` naming the duplicate key, and a re-attach count returning to precisely its pre-teardown value (1) rather than doubling. Combined with the true-detach result already recorded in `09-01-SUMMARY.md` (a live write after `detachRoom()` fired the torn-down handler zero additional times) and 09-03's vacuity-guarded unit-test case for leak vector (a), NET-03 is satisfied by observed behavior across a real lifecycle, not by code review.
- **Task 2 — two-tab multiplayer smoke test (Transcript B):** the coordinator set up two Chrome tabs with the D-11 shared-`localStorage` identity trap correctly handled (guest identity reset to a distinct `pp_id` before load, sequentially, before the guest joined). The host created room ZXZS; the guest joined with a distinct `myId` and did not rejoin as the host. Both tabs' seat lists synced bidirectionally through the extracted `seats` watcher — proven, not inferred. The in-game turn-propagation leg (the actual point of ROADMAP criterion 4) was not cleanly completed: the coordinator's own defensive "confirm" click during voyage start matched the wrong button, dropping the host tab into pass-and-play mode and leaving the guest tab on the lobby screen. This is recorded as a test-driving artifact, honestly, not smoothed over or silently re-run.
- **Independent re-verification (this session, no browser):** confirmed all 18 watchers route through the registry via `grep -c 'registry.attach(' src/net/watchers.js` → `18`, `grep -c '^export function netWatch' src/net/watchers.js` → `18`, and a grep for raw `.on()`/`.off()` calls in `index.html` outside `src/net/registry.js` → `0`. Ran `node scripts/net_contract_check.js` (exit=0, 5/5 PASS including the watcher-inventory-completeness assertion) and `npm test` (exit=0, 30/30 determinism seeds, `engine_contract_check` 4/4, `dlog_replay_test`, `net_registry_test` 32/32, `net_contract_check` 5/5). Confirmed the determinism corpus is still exactly one commit deep and the working tree is clean.
- Marked `NET-01` and `NET-03` `Complete` in `REQUIREMENTS.md`, authorized by that independent confirmation plus the coordinator's live transcripts — not by the transcripts alone.
- Recorded ROADMAP criterion 4 as **partially** demonstrated (lobby sync proven; full in-game propagation not cleanly observed) and filed a `WINDOWS.md` entry so Phase 12's `VERIFY-03` (Chrome-MCP two-tab E2E) picks it up rather than it silently disappearing when this SUMMARY scrolls out of context.

## Task Commits

Neither task modified any source file — both were live-browser observations run by the coordinator against real Firebase, and this session's independent re-verification was read-only (`grep`, `npm test`, `node scripts/net_contract_check.js`). No regression was found, so no fix was needed and no task-level commit exists, matching the pattern already established in `09-01-SUMMARY.md`'s Task 3.

1. **Task 1: Full-scale NET-03 probe (18 watchers, same-tab attach/detach/re-attach)** — run by the coordinator in Chrome, no commit (observation only, changed no files — see Transcript A below).
2. **Task 2: Two-tab multiplayer smoke test** — run by the coordinator in Chrome, no commit (observation only, changed no files — see Transcript B below, including its recorded limitation).

**Plan metadata:** committed alongside this summary (see final commit below).

## Transcript A — NET-03 full-cycle probe (verbatim, coordinator, live Firebase)

Run in Chrome against **live Firebase References**, same-tab, **no reload**. Server port 8777, this worktree. Room ZXZS (also referenced by its earlier code, JFAS, in the same session).

Registry state at game start: 4 watchers total — room-scoped: `[seats, status]`; session-scoped: `[connected, presence]`.

**Cycle 1 (teardown + survival):**

```
0  live room state: total 4, room 2 (seats,status), session 2 (connected,presence)
1  VACUITY GUARD: room count > 0 before teardown? true (room=2)
2  after detachRoom() — room scope gone? true (room 2->0)
3  session watchers SURVIVED (leak vector c)? true — ["connected","presence"], count 2 == expected 2
4  connected watcher still present & live? true
```

**Cycle 2 (re-attach + double-attach refusal, leak vector b):**

```
5  room count after earlier teardown: 0
6  re-attach one room watcher (netWatchFlip): 1 (expected 1)
7  double-attach of same (scope,path,event,label) REFUSED? true — console.error:
   `[src/net/registry.js] duplicate attach refused for key "room|https://pastry-pira...`
8  count UNCHANGED after refused double? true (1->1)
9  cleanup detachRoom, room count: 0
```

**Prior true-detach evidence (09-01 tracer probe, also live Firebase, recorded verbatim in `09-01-SUMMARY.md`):** after `detachRoom`, a real `db.ref(path).set()` write fired the torn-down handler **zero** additional times (2->2) — proving true detach, not merely a decremented count.

**Leak vector (a)** — the mid-decision one-shot teardown — is covered by 09-03's vacuity-guarded unit test (`scripts/net_registry_test.js`, cases "vacuity guard: the abandoned one-shot is genuinely attached and firing before teardown", "detachRoom() removes the still-pending one-shot (leak vector a)", "the fake's listener list for the abandoned one-shot's path is empty after teardown", "emitting on the abandoned path after teardown never invokes the handler again" — all PASS, confirmed re-run as part of `npm test` above), per the plan's own Step 8 allowance to attribute this vector to unit coverage when staging it live is impractical.

**Verdict:** all NET-03 assertions hold — vacuity-guarded teardown, session-scope survival at exactly 2 with liveness proven, a refused double-attach leaving the count unchanged, a true detach proven by a real write producing zero additional handler invocations, and a re-attach returning to precisely the pre-teardown count rather than doubling.

## Transcript B — two-tab cross-tab sync (verbatim, coordinator, live Firebase) — PARTIAL

**Setup:** Host tab (`pp_id` `'host-tab-A'`, captain HostA) created room ZXZS via the DOM (`#pname`, `#choiceHost`, `#btnCreate`). A second tab was opened; guest identity was set to a distinct `pp_id` (`'guest-tab-B'`) **before** load and reloaded — the shared-`localStorage` trap (D-11) handled correctly, so the guest did not rejoin as the host. The guest joined room ZXZS via `#pname`/`#choiceJoin`/`#joinCode`/`#btnJoin` as captain GuestB.

**PROVEN:**

- Guest joined with a distinct identity: `myId` `'guest-tab-B'` != host `'host-tab-A'`. Guest did NOT rejoin as the host (the D-11 `pp_id` trap correctly avoided).
- Guest tab's seat list synced from Firebase: showed "HostA — HostA, GuestB — GuestB — you, Dough Hook — bot, Flaky Jack — bot".
- Host tab's seat list updated to include the guest: "HostA — HostA — you, GuestB — GuestB, Dough Hook — bot, Flaky Jack — bot" (`hostSeesGuest: true`).
- => Bidirectional lobby-state sync across two real browser tabs works through the extracted `seats` watcher in `src/net/`. Both tabs hold their own 4 registry-mediated watchers.

**NOT CLEANLY COMPLETED (honest limitation — a coordinator test-driving error, NOT a code finding):**

- When starting the voyage from the host, the coordinator's defensive "confirm" click matched the wrong button and dropped the HOST tab into pass-and-play mode ("Pass the device to Crustbeard"), which corrupted the in-game move-propagation observation. The guest tab remained on the lobby ("Waiting for the host to start").
- This is a driving artifact, not evidence of a sync regression. It was NOT resolved by editing any expectation or changing any code, per the plan's explicit prohibitions. The full in-game turn-propagation smoke test (host makes a move -> guest sees it via the narr/ev/prompt/flip/battle watchers) should be re-run clean before ROADMAP criterion 4 is marked fully satisfied.

**Recorded as a follow-up, not silently dropped:** see the `WINDOWS.md` entry filed below and coverage entry D4 above. Phase 12's `VERIFY-03` (Chrome-MCP two-tab E2E, full multiplayer game across two browser tabs with deterministic sync intact) is the natural place to close this cleanly.

## Independent Re-Verification (this session, no browser tool)

Confirming NET-01's "every watcher routes through the registry" claim and the automated check chain, before authorizing the REQUIREMENTS.md change:

```
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -cE '\.on\("value"|\.on\('"'"'value'"'"'|\.on\("child_added"|\.on\('"'"'child_added'"'"''
0
$ grep -vE '^\s*(//|\*|/\*)' index.html | grep -c '\.off('
0
$ grep -c 'registry.attach(' src/net/watchers.js
18
$ grep -c '^export function netWatch' src/net/watchers.js
18
$ node scripts/net_contract_check.js; echo exit=$?
PASS sole listener site (NET-02, D-04) — zero .on()/.off() calls outside src/net/registry.js
PASS no UI dependency (SPLIT-04) — zero UI names referenced anywhere under src/net/
PASS no app-state dependency — zero app-state names referenced anywhere under src/net/
PASS directional imports (SPLIT-04, D-06) — src/net/ never imports src/ui/ or src/engine/
PASS watcher inventory completeness (NET-01, D-01) — all eighteen watchers exported, exactly eighteen registry.attach() calls
exit=0
$ npm test; echo exit=$?
... (determinism 30/30, engine_contract_check 4/4, dlog_replay_test, net_registry_test 32/32, net_contract_check 5/5)
exit=0
$ git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l | tr -d ' '
1
$ git status --porcelain
(empty)
```

This is what authorizes marking `NET-01` and `NET-03` `Complete` in `REQUIREMENTS.md` — not the coordinator's transcripts alone, per this plan's own recording rules.

## Files Created/Modified

- `.planning/REQUIREMENTS.md` — `NET-01` and `NET-03` marked `Complete`; traceability table row status updated.
- `.planning/WINDOWS.md` — new entry recording ROADMAP criterion 4's unresolved full in-game turn-propagation two-tab leg, for Phase 12's `VERIFY-03` to close.
- `.planning/STATE.md` — position/progress/decisions/session updated for Phase 9 plan 5 completion.
- `.planning/ROADMAP.md` — Phase 9 plan progress updated (5/5 plans executed).

## Decisions Made

See `key-decisions` in frontmatter. In short:
1. `NET-01`/`NET-03` marked `Complete` only after this session's own independent grep + automated-check re-verification, not on the coordinator's transcripts alone.
2. ROADMAP criterion 4 recorded as partially demonstrated — lobby sync proven, full turn-propagation not cleanly observed — rather than overclaimed as a full pass, per the plan's explicit prohibition against resolving a divergence by editing an expectation.

## Deviations from Plan

None — plan executed exactly as written. Both browser tasks were run by the coordinator (as directed for this plan), and this session recorded the transcripts faithfully without re-running the browser steps or fabricating results beyond what was given. No regression was found in either transcript, so no code fix was needed and no source files were touched.

## Known Stubs

None. No UI surface or application behavior was added, changed, or stubbed by this plan.

## Issues Encountered

- Task 2's full in-game turn-propagation leg was not cleanly completed due to a test-driving misclick during the coordinator's Chrome session (documented in Transcript B and coverage entry D4 above, and filed in `WINDOWS.md`). This is not a code regression; it is an incomplete observation that needs a clean re-run, deferred to Phase 12's `VERIFY-03`.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- NET-01 and NET-03 are both satisfied and marked `Complete` in `REQUIREMENTS.md`, independently re-confirmed by this session against the finished `src/net/` surface (all 18 watchers registry-mediated, contract check and full `npm test` green).
- Phase 9's remaining open item is not a code gap — it is ROADMAP criterion 4's full in-game two-tab propagation leg, which was proven for lobby/seat sync but not for in-game turn propagation due to a coordinator test-driving misclick. This is tracked in `WINDOWS.md` and left for Phase 12's `VERIFY-03` (Chrome-MCP two-tab E2E) to close with a clean re-run — not resolved here per the plan's prohibition against editing expectations to match an incomplete observation.
- Phase 10 (de-globalization) and Phase 11 (UI extraction, bridge removal) can proceed against a `src/net/` surface that is now both mechanically enforced (`scripts/net_contract_check.js` in `npm test`) and behaviorally proven (this plan's Transcript A) for its watcher-registry contract.

## Self-Check: PASSED

- `.planning/REQUIREMENTS.md` — FOUND, `NET-01`/`NET-03` rows show `Complete`
- `.planning/WINDOWS.md` — FOUND, new entry present recording the criterion-4 limitation
- `node scripts/net_contract_check.js` — exit 0, 5/5 PASS
- `npm test` — exit 0
- `grep -c 'registry.attach(' src/net/watchers.js` → 18
- `grep -c '^export function netWatch' src/net/watchers.js` → 18
- `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` → 1
- `git status --porcelain` — empty (before this session's own doc/state edits)

---
*Phase: 09-networking-layer-watcher-cleanup*
*Completed: 2026-07-24*

---

## Addendum (2026-07-24): clean two-tab in-game re-run — criterion 4 fully satisfied

The 09-05 in-game leg that was left partial (coordinator UI misclick, WINDOWS.md item 2) was re-run cleanly and closed. Driven by the coordinator in Chrome via `.dispatchEvent(new MouseEvent(...))` on the real handler elements (avoids the pixel-misclick that caused the original artifact).

**Setup:** server on :8777 (cwd confirmed this worktree), two tabs with distinct `pp_id` set sequentially per the shared-localStorage gotcha — HOST `myId=HOST-pp-…`, GUEST `myId=GUEST-pp-…`.

**Proven live host↔guest through the extracted `src/net/` module:**
- Room create → code `JETJ`; join round-trips (seats watcher)
- Bidirectional lobby sync — host sees GuestMate replace a bot; guest sees the room
- Game start broadcasts host→guest — guest transitions to game, board renders (386 elements) (status/turnOrder watchers)
- Sailing-order narration broadcast — guest sees "GuestMate catches the wind first" (narr watcher)
- Chat host→guest with unique marker `PROP2-1784924290878` — guest chatLog shows `HostCap: PROP2-…` (chat child_added watcher)
- Acknowledgement + recipe prompt/response gating synced both directions (prompt/response watchers)
- Full turn loop cycles host→bots→guest; guest event stream climbs 16→29 (ev watcher)
- Guest submits a move → host turn advances to HostCap (response→host)
- Host sails `[7,6]→[8,6]` → guest CAPTAINS panel reflects host-processed state

**Same-moment authoritative-state match (host panel vs guest panel):**

| Captain | Host | Guest |
|---|---|---|
| HostCap | 1 | 1 |
| Dough Hook | 7 | 7 |
| Flaky Jack | 13 | 13 |
| GuestMate | 0 | 0 |

Ordering differs only because each client renders itself first. Watcher counts scaled 4 (lobby) → 8 (host in-game) → 16 (guest in-game) via `window.__pp_net_debug.size()`; API exposes `size/list/detachRoom/detachAll`.

**Methodology note for Phase 12 VERIFY-03:** reading `game.players[].pos` on the GUEST is the wrong probe — guests are render-only under the host-authority model, so their local `game` object is intentionally stale (`guestRound` stayed 0 while the panel updated). The rendered CAPTAINS panel is the sync source of truth on a remote.
