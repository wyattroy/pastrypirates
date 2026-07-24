---
phase: 9
slug: networking-layer-watcher-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-24
---

# Phase 9 — Validation Strategy

> Seeded from `09-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — plain Node scripts with `PASS`/`FAIL` output and `process.exit(0/1)`, wired through `npm test`. Same convention as Phases 7–8. |
| **Config file** | none — `package.json`'s `test` script is the config |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` (this phase adds two scripts to the chain) |
| **Estimated runtime** | <15s headless; the NET-03 browser probe is separate |

---

## Sampling Rate

- **After every task commit:** `npm test`
- **After every wave:** `npm test` + a Chrome MCP pass reading `window.__pp_net_debug` counts
- **Phase gate:** `npm test` green, contract check green, **and** a documented Chrome MCP transcript of the same-tab attach→detach→re-attach cycle — mirroring the 08-05 precedent where an itemized browser transcript stands in for what cannot be scripted headlessly
- **Max feedback latency:** 30s

---

## Per-Requirement Verification Map

| Req ID | Behavior | Test Type | Command | Infra Exists |
|--------|----------|-----------|---------|--------------|
| NET-01 | Every `.on()` has a matching, registry-mediated `.off()` | unit (fake `Reference`) | `node scripts/net_registry_test.js` | ❌ W0 |
| NET-02 | Single registry, exact callback-reference matching, no bypass | static/contract | `node scripts/net_contract_check.js` | ❌ W0 |
| NET-03 | Zero dangling listeners across attach/detach/re-attach | **behavioural, browser** | Chrome MCP against `window.__pp_net_debug` | ❌ W0 |
| SPLIT-04 | `src/net/` never imports the UI layer | static/contract | `node scripts/net_contract_check.js` | ❌ W0 |
| — | Engine untouched | integration | `node scripts/determinism_baseline.js --verify` → 30/30 | ✅ Phase 7 |
| — | Two-tab multiplayer still syncs | **behavioural, browser** | Chrome MCP, two tabs, host + guest | ❌ W0 |

---

## Wave 0 Requirements

- [ ] `scripts/net_registry_test.js` — Node unit test for the registry against a small in-memory fake `Reference` (`.on()`/`.off()`/`.toString()` only, no network). Must cover: attach/detach round-trip, duplicate-attach refusal, `detachRoom()` leaving session-scoped entries intact, `detachAll()` clearing everything, and the cross-instance-ref detach case.
- [ ] `scripts/net_contract_check.js` — mirrors `engine_contract_check.js`'s multi-assertion structure. **Must NOT inherit its comment-stripping.** `src/net/` will contain the Firebase `databaseURL` (an `https://` string), which turns that script's documented `://` false-negative from theoretical into live. Use literal-substring matching with no stripping.
- [ ] `window.__pp_net_debug` — a named, intentional debug hook exposing registry size/listing for Chrome MCP evaluation. Name it deliberately now: it is the natural seed for `GLOBAL-03`'s "single documented debug mechanism" in Phase 10, so Phase 10 should not have to rename it.
- [ ] Framework install: **none**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Instructions |
|----------|-------------|------------|--------------|
| Zero dangling listeners across a lifecycle | NET-03 | ROADMAP criterion 3 **explicitly rejects code review** — it demands a reconnect-and-count check. Node cannot host a real Firebase connection plus the page's lifecycle. | **Critical methodology note:** `location.reload()` is the only current "leave" path (`leaveGame()`), so a leave-and-rejoin test proves nothing — reload zeroes the JS heap whether or not the registry works. Use a **same-tab, no-reload** attach→detach→re-attach probe against `window.__pp_net_debug`, asserting the count returns to its pre-attach value. |
| Two-tab multiplayer sync after extraction | ROADMAP criterion 4 | Needs two real browser tabs and a live Firebase room | Per MEMORY `project_mp_test_harness`: all tabs in one Chrome profile share `localStorage`, and `myId` is read once from `localStorage['pp_id']` — without intervention the guest rejoins **as the host**. Before each tab loads: `localStorage.clear(); localStorage.setItem('pp_id','<unique>')` then reload, **sequentially**. Expect slowness/flakiness with several heavy tabs on one CPU — an environment artifact, not necessarily a bug. |

**Safari is not required at this phase boundary.** ROADMAP schedules it at Phase 11 (UI extraction) and Phase 12 (`VERIFY-04`). Phase 9 does not touch rendering.

---

## Known Leak Vectors (what the tests must actually catch)

Research found the real exposure is narrower and different from the roadmap's framing:

1. The two self-cancelling one-shot listeners (`index.html:4112`/`:4134`) leak if the room dies mid-decision before a reply arrives — this is D-02's genuine gap.
2. An unguarded double-invocation of `joinRoom()`/`createRoom()` double-attaches every room watcher.
3. `.info/connected` and `presence` are **not** room-scoped and must survive a room leave — tearing them down with room watchers would be a regression, not a fix.

---

## Validation Sign-Off

- [ ] All tasks have an automated verify or a Wave 0 dependency
- [ ] `npm test` green including both new scripts
- [ ] Contract check proven able to fail (red-proof drill, per the 08-04 precedent that caught two real checker bugs)
- [ ] NET-03 browser transcript recorded verbatim in the plan SUMMARY
- [ ] Two-tab multiplayer transcript recorded
- [ ] Determinism corpus still 30/30 and still 1 commit deep
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
