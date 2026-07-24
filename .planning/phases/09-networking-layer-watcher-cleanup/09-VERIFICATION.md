---
phase: 09-networking-layer-watcher-cleanup
verified: 2026-07-24T18:59:09Z
status: passed
score: 4/4 must-haves verified
behavior_unverified: 0
overrides_applied: 0
resolved: 2026-07-24T20:29Z
resolution: "The single human_needed item — ROADMAP Phase 9 criterion 4's clean two-tab in-game turn-propagation leg — was re-run cleanly in Chrome and closed (WINDOWS.md item 2, status fixed). Same-moment authoritative-state match host vs guest (HostCap 1/1, Dough Hook 7/7, Flaky Jack 13/13, GuestMate 0/0) through the extracted src/net/ module; chat/narr/prompt/response/ev/seats/status watchers all observed propagating live; watcher counts scaled 4->8->16. Full transcript appended to 09-05-SUMMARY.md. Score moves 3/4 -> 4/4."
---

# Phase 9: Networking Layer & Watcher Cleanup Verification Report

**Phase Goal:** Move Firebase multiplayer sync into its own networking module and fix the `.off()` leak class through a single watcher registry, leaving zero dangling listeners across the room lifecycle.
**Verified:** 2026-07-24T18:59:09Z
**Status:** passed (4/4 — criterion-4 in-game leg closed by clean re-run 2026-07-24T20:29Z; see 09-05-SUMMARY.md addendum)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP §Phase 9 success criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Firebase multiplayer sync lives in its own networking module(s) that never import the UI layer | ✓ VERIFIED | `src/net/registry.js`, `watchers.js`, `writers.js`, `readers.js`, `index.js` read directly — zero UI imports/references. `scripts/net_contract_check.js` assertion 2 ("no UI dependency") and assertion 4 ("directional imports") both PASS on independent re-run (`node scripts/net_contract_check.js` → exit 0, 5/5 PASS, reproduced in this session). `index.html` has zero `db.ref(`/`firebase.` occurrences (independently grepped, zero hits) — the whole Firebase surface is relocated. |
| 2 | Every Firebase `.on()` watcher (all 18) has a matching `.off()` teardown, registered/removed through a single registry with exact callback-reference matching | ✓ VERIFIED | `src/net/registry.js` is the only file that calls `ref.on()`/`ref.off()` in the whole repo — confirmed by reading the file (attach() performs the one `.on()` call; detach() always uses the two-arg `ref.off(event, callback)` form, never the destructive one-arg form) and by `net_contract_check.js` assertion 1 ("sole listener site"), independently re-run: PASS, plus a direct grep of `index.html` for `.on("value"`/`.on('value'`/`.on("child_added"`/`.on('child_added'`/`.off(` → zero hits. All 18 watchers from `09-CONTEXT.md` D-01's table are present in `src/net/watchers.js` and route through `registry.attach()` — cross-checked name-by-name (flip, timerOff, clock, chat, battle, recovery, draftPrompt, events/ev, prompt, narr, seats, status, turnOrder, recipes, connected, presence, response, draftResponse = 18/18, none dropped). `net_contract_check.js` assertion 5 (hardcoded, non-derived 18-name inventory + exact 18 `registry.attach()` calls) PASSES independently. Critically, `net_contract_check.js` does **not** inherit `engine_contract_check.js`'s comment-stripping — confirmed by reading its header and body (`checkSoleListenerSite()` matches raw, unstripped lines); this matters because `src/net/index.js` contains the Firebase `databaseURL` (an `https://` literal) that would silently defeat a stripper-based check, and 09-04's red-proof drill 4 empirically demonstrated the stripped version hides a real violation while the unstripped check catches it. |
| 3 | A guest reconnect / leave-and-rejoin cycle leaves zero dangling listeners, verified behaviorally (reconnect-and-count), not by code review alone | ✓ VERIFIED | Behavioral proof exists at two levels. (a) Unit level: `scripts/net_registry_test.js`, independently re-run (`node scripts/net_registry_test.js` → 32/32 PASS, exit 0), covers detach-then-emit-does-not-fire, `detachRoom()` sparing session scope (leak vector c), re-attach returning to pre-teardown count not doubling, a refused duplicate attach (leak vector b), and — the case matching the "abandoned one-shot" gap named in D-02 — case 10 proves a still-pending self-cancelling response listener (leak vector a) is removed by `detachRoom()` even though it never received a matching reply, with a vacuity guard proving it was genuinely live before teardown. (b) Live-Firebase level: `09-05-SUMMARY.md` Transcript A (coordinator, live Chrome + real hosted Firebase room, no reload) shows a vacuity-guarded room-scope teardown (room 2→0), session-scope survival at exactly 2 (`connected`, `presence`) with liveness independently confirmed, a refused double-attach with an unchanged count, and a re-attach returning to precisely the pre-teardown value. `09-01-SUMMARY.md`'s prior tracer probe additionally proved a *true* detach (not just a decremented count): a real Firebase write issued after `detachRoom()` fired the torn-down handler zero additional times. Design note: the literal "reload the page and rejoin" scenario was explicitly rejected as a test (per `09-VALIDATION.md`'s Manual-Only Verifications and D-10) because `location.reload()` zeroes the JS heap regardless of whether the registry works — a same-tab, no-reload attach→detach→re-attach cycle against `window.__pp_net_debug`'s live registry bookkeeping is the methodologically sound substitute, and it is the one actually run. This satisfies the substance of ROADMAP criterion 3. |
| 4 | A multiplayer game across two browser tabs still syncs deterministically after the extraction (host + guest smoke test passes) | ✓ VERIFIED (closed 2026-07-24T20:29Z by clean re-run) | Originally ⚠️ PARTIAL (test-driving misclick). Re-run cleanly by the coordinator in Chrome (server :8777, two tabs with distinct `pp_id` set sequentially per D-11's shared-`localStorage` trap; driven via `dispatchEvent(new MouseEvent(...))` on real handler elements to avoid the pixel-misclick). Room `JETJ` create/join round-trip (seats watcher), bidirectional lobby sync, game-start broadcast + board render on guest (status/turnOrder), sailing-order narration broadcast (narr), chat host→guest with unique marker `PROP2-1784924290878` (chat child_added), acknowledgement + recipe prompt/response gating synced both ways, full turn loop cycling host→bots→guest with the guest `ev` stream climbing 16→29, guest move → host turn advanced (response→host), and host sail `[7,6]→[8,6]` → guest CAPTAINS panel synced. **Same-moment authoritative-state match** host vs guest: HostCap 1/1, Dough Hook 7/7, Flaky Jack 13/13, GuestMate 0/0. Watcher counts scaled 4 (lobby) → 8 (host in-game) → 16 (guest in-game) via `window.__pp_net_debug`. Full transcript in the 09-05-SUMMARY.md addendum; WINDOWS.md item 2 → fixed. Methodology note: `game.players[].pos` on the GUEST is the wrong probe — guests are render-only under host authority, so their local `game` object is intentionally stale; the rendered CAPTAINS panel is the sync source of truth. |

**Score:** 4/4 truths verified (truth 4 closed 2026-07-24T20:29Z by a clean two-tab re-run; originally recorded 3/4 with truth 4 routed to human verification).

### Honesty check on completion recording (verifier focus item 6)

Confirmed, not merely asserted: `.planning/WINDOWS.md` contains a live, open entry (id 2, filed 2026-07-24T18:55:19.013Z) recording exactly this gap — "ROADMAP Phase 9 criterion 4 ... only partially demonstrated ... Needs a clean re-run before criterion 4 is fully satisfied — closed by Phase 12 VERIFY-03." `.planning/REQUIREMENTS.md` marks `NET-01`/`NET-02`/`NET-03`/`SPLIT-04` all Complete, but `NET-03`'s completion basis (per `09-05-SUMMARY.md`'s own `key-decisions`) is the registry/teardown proof (Transcript A + unit tests), independently re-confirmed in this session — not the unfinished two-tab in-game leg. This is a defensible distinction: NET-03's actual wording is about a "guest reconnect / leave-and-rejoin cycle leav[ing] zero dangling listeners," which is a transport/leak concern fully proven; ROADMAP criterion 4 is a separate, broader "does multiplayer still work at all after the extraction" smoke test that remains partially open. No requirement was marked Complete on the strength of the incomplete leg. This is judged legitimate, not a rubber-stamp — the record correctly distinguishes what was proven from what wasn't, in the same document that claims completion.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/net/registry.js` | Sole `.on()`/`.off()` call site, exact-reference teardown | ✓ VERIFIED | Exists, substantive (103 lines, real logic), wired (imported by `watchers.js` and `index.js`), confirmed as sole listener site by contract check + independent grep. |
| `src/net/watchers.js` | All 18 watcher transport wrappers | ✓ VERIFIED | 18 exported `netWatch*` functions, each calling `registry.attach()` exactly once; verified by direct read and by `net_contract_check.js` assertion 5. |
| `src/net/writers.js` | Firebase write functions, no UI/app-state coupling | ✓ VERIFIED | 21 write functions, each a single `set`/`push`/`update`/`remove`/`transaction`-adjacent call; no UI names, no app-state reads (contract check assertions 2/3 PASS). |
| `src/net/readers.js` | One-shot Firebase reads | ✓ VERIFIED | 5 read functions, each returns the raw promise untransformed; no UI/app-state coupling. |
| `src/net/index.js` | Barrel + Firebase app construction + room-scoped teardown entry points | ✓ VERIFIED | Re-exports all watcher/writer/reader names, `netInit()`, `netLeaveRoom()`, `netDetach()`, debug-surface exports; `firebase` referenced only inside `netInit()`'s body (not top-level), preserving Node-importability. |
| `scripts/net_contract_check.js` | Standing 5-assertion gate, wired into `npm test` | ✓ VERIFIED | Exists, all 5 assertions independently re-run and PASS; wired into `package.json`'s `test` script (confirmed by `npm test` running it as part of the full chain). |
| `scripts/net_registry_test.js` | Unit tests for the registry against a fake Reference | ✓ VERIFIED | 32 named cases, all independently re-run and PASS, including the leak-vector-(a)/(b)/(c) cases. |
| `window.__pp_net_debug` | Named, documented registry-bookkeeping debug hook | ✓ VERIFIED | Present in `src/main.js`, deliberately not tagged `PP-BRIDGE` (survives Phase 11's bridge removal), exposes `size`/`list`/`detachRoom`/`detachAll` sourced directly from the registry — this is the observation point the live NET-03 transcript used. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `index.html` watcher call sites (18) | `src/net/watchers.js` | direct function call, handler passed unmodified | ✓ WIRED | Confirmed by reading `index.html:3928`, `3934`, `4094`, `4116`, and the remaining watcher call sites — each passes the original inline callback straight into a `netWatch*` function. |
| `src/net/watchers.js` | `src/net/registry.js` `attach()` | import + call | ✓ WIRED | Every `netWatch*` function calls `registry.attach({...})`; this is the only path to `ref.on()` in the repo. |
| `index.html` `leaveGame()` | `src/net/index.js` `netLeaveRoom()` → `registry.detachRoom()` | direct call | ✓ WIRED | `index.html:4479` — `function leaveGame(){netLeaveRoom();clearSession();clearSoloState();location.reload();}`, and the leave-confirm/play-again handlers route through it. |
| `index.html` `remotePrompt()`/`remoteDraftPrompt()` one-shots | `netDetach(wid)` on matching reply | direct call inside the callback | ✓ WIRED | `index.html:4092` and `4114` — self-cancel preserved (`netDetach(wid)` called only when `v.id===id`), and the same room-scoped watcher is also removed wholesale by `detachRoom()` if the room dies before a reply (D-02's actual gap). |
| `src/net/` dispatch path | synchronous, same-tick handler invocation | code inspection | ✓ WIRED | No `setTimeout`, `requestAnimationFrame`, `queueMicrotask`, `Promise.resolve().then()`, or emitter pattern anywhere under `src/net/` (independently grepped, zero hits); `registry.attach()` calls `ref.on(event, callback)` directly and the handler is passed through unwrapped in `watchers.js`. Required for replay ordering (D-08/D-09) to remain intact. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Contract check enforces the registry-only invariant | `node scripts/net_contract_check.js` | 5/5 PASS, exit 0 | ✓ PASS |
| Registry unit behavior (attach/detach/scoping/leak vectors a/b/c) | `node scripts/net_registry_test.js` | 32/32 PASS, exit 0 | ✓ PASS |
| Full regression chain including net checks | `npm test` | exit 0 (determinism 30/30, engine_contract_check 4/4, dlog_replay_test, net_registry_test 32/32, net_contract_check 5/5) | ✓ PASS |
| No raw Firebase listener calls outside the registry | `grep` for `.on("value"`/`'value'`/`"child_added"`/`'child_added'`/`.off(` in `index.html` | 0 hits | ✓ PASS |
| No Firebase surface remaining in `index.html` | `grep` for `db.ref(`/`firebase.` in `index.html` | 0 hits | ✓ PASS |
| Determinism corpus untouched | `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' \| wc -l` | 1 | ✓ PASS |
| Working tree clean at verification time | `git status --porcelain` | empty | ✓ PASS |

Full two-tab live-browser multiplayer smoke test was not re-run by this verifier (no browser-automation tool in this session); the prior coordinator transcript (09-05) is treated as partial evidence per the Observable Truths table above, not as a substitute for a clean re-run.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| SPLIT-04 | 09-01…09-04 | Networking module never imports UI | ✓ SATISFIED | Directional-import + no-UI-dependency contract check assertions PASS; code read confirms. |
| NET-01 | 09-01…09-05 | Every `.on()` has a matching, registry-mediated `.off()` | ✓ SATISFIED | All 18 watchers registry-mediated; sole-listener-site + inventory-completeness assertions PASS; independent grep confirms zero raw calls. |
| NET-02 | 09-01, 09-04 | Single registry, exact callback-reference matching, no bypass | ✓ SATISFIED | `registry.js` stores and reuses the original callback + Reference; contract check's sole-listener-site assertion is the standing enforcement. |
| NET-03 | 09-01, 09-03, 09-05 | Reconnect/rejoin leaves zero dangling listeners, verified behaviorally | ✓ SATISFIED | Live-Firebase Transcript A + unit test suite (leak vectors a/b/c) — behavioral, not code-review-only, per ROADMAP's explicit demand. |

No orphaned requirements — `REQUIREMENTS.md`'s Phase 9 row set (SPLIT-04, NET-01, NET-02, NET-03) matches exactly what the five plans' frontmatter `requirements` fields declare collectively.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/"not yet implemented" found in any `src/net/*.js`, `scripts/net_contract_check.js`, or `scripts/net_registry_test.js` | — | None found |
| `.planning/phases/09-networking-layer-watcher-cleanup/09-VALIDATION.md` | frontmatter | `status: draft`, `nyquist_compliant: false`, `wave_0_complete: false`, and every item in its own "Validation Sign-Off" checklist left unchecked, `Approval: pending` — despite the phase being fully executed, the validation criteria it lists (unit test, contract check, red-proof drill, NET-03 transcript, two-tab transcript, determinism corpus, sign-off) having actually been met or explicitly flagged partial in the SUMMARY/WINDOWS.md chain instead | ℹ️ Info | Documentation drift only — the actual validation work happened and is independently confirmed elsewhere (SUMMARY.md coverage blocks, REQUIREMENTS.md, WINDOWS.md), but this specific file was never updated to reflect that, which could mislead a future reader who trusts only this file. Not a code or behavior gap. |

### Human Verification Required

### 1. Clean two-tab in-game multiplayer smoke test (ROADMAP Phase 9 criterion 4)

**Test:** Open two Chrome tabs against a live Firebase room with distinct `pp_id` identities (per the D-11 shared-`localStorage` procedure already proven correct in 09-05 Transcript B). Host creates the room, guest joins, host starts the voyage, host plays at least one full turn including a move that triggers narration and/or a battle/trade. Confirm the guest tab observes it live.
**Expected:** Guest tab's UI updates in real time from the host's actions via the `narr`/`ev`/`prompt`/`flip`/`battle` watchers (all routed through `src/net/`), with no console errors and host authority intact (guest never runs the engine).
**Why human:** Requires two real browser tabs and a live Firebase connection; cannot be scripted headlessly. This is the same test Phase 12's VERIFY-03 will eventually run at a broader scope, but ROADMAP Phase 9's own criterion 4 is the more immediate, narrower claim ("still syncs deterministically after the extraction") and it remains only partially demonstrated — bidirectional lobby/seat sync proven, in-game turn propagation not cleanly observed due to a documented test-driving misclick, not a code defect. Already tracked in `WINDOWS.md` (item 2, open) — this verification does not create a new gap, it confirms the existing one is real and correctly flagged rather than silently absorbed into a "passed" phase.

### Gaps Summary

No code-level gaps were found. The networking module boundary (SPLIT-04), the single-registry teardown mechanism with exact callback-reference matching (NET-02), the complete 18-watcher inventory (NET-01), and behavioral proof of a leak-free reconnect/rejoin cycle (NET-03) are all independently confirmed against the actual codebase — not taken on SUMMARY.md's word. The one open item is ROADMAP Phase 9's own criterion 4 (full two-tab in-game sync), which the phase's own artifacts (09-05-SUMMARY.md, WINDOWS.md) already and correctly record as partially demonstrated rather than complete, due to a live-browser test-driving misclick rather than a regression. This routes to human verification rather than a blocking gap because: (a) the underlying transport mechanism for the exact watchers this test exercises (`narr`/`ev`/`prompt`/`flip`/`battle`) is proven at the registry level via the same Transcript A that satisfied NET-03, (b) bidirectional lobby sync across two real tabs is proven, and (c) the honest record-keeping (WINDOWS.md + REQUIREMENTS.md's careful scoping of NET-03 vs. criterion 4) shows no attempt to paper over the gap. It should not, however, be silently treated as closed — a clean re-run is warranted before the milestone leans further on this networking layer.

---

_Verified: 2026-07-24T18:59:09Z_
_Verifier: Claude (gsd-verifier)_
