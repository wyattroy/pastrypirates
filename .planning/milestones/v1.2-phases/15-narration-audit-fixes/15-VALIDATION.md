---
phase: 15
slug: narration-audit-fixes
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-27
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `15-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None formal — hand-rolled `check(name, actual, expected)` harness per script, `process.exit(failures?1:0)` convention (confirmed against `scripts/bot_storm_narration_test.js`, `scripts/hail_ranking_test.js`) |
| **Config file** | none — `package.json`'s `"test"` script chains 12 gates |
| **Quick run command** | `node scripts/bot_storm_narration_test.js` (existing narration-table gate) |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30–60 seconds (dominated by `determinism_baseline.js --verify` at 31 seeds) |

**The 12 gates in `npm test`:** `determinism_baseline.js --verify` (31 seeds) · `engine_contract_check.js` · `dlog_replay_test.js` · `net_registry_test.js` · `net_contract_check.js` · `state_contract_check.js` · `module_graph_check.js` · `ui_contract_check.js` · `no_undef_check.js` · `hail_ranking_test.js` · `storm_moored_reason_test.js` · `bot_storm_narration_test.js`

---

## Sampling Rate

- **After every task commit:** Run `node scripts/bot_storm_narration_test.js` (plus any new/extended narration unit script added by this phase)
- **After every plan wave:** Run `npm test` (full 12-gate suite — the 31-seed determinism verify must stay green, since no task in this phase may touch `src/engine/index.js` or the event stream)
- **Before `/gsd-verify-work`:** Full suite green, PLUS the manual multiplayer session described under Manual-Only Verifications
- **Max feedback latency:** ~5 seconds for the quick gate; ~60 seconds for the full suite

---

## Per-Task Verification Map

*Seeded at plan time by requirement; task IDs are filled in once PLAN.md files exist.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | NARR-01 | — | N/A — review artifact, not shipped code | manual (approval gate) | Open `art-review/narration-audit.html` via `npm start` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NARR-02 | — | N/A | unit (DOM-free) | `node scripts/bot_storm_narration_test.js` (extended) or new `narr_gap_test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NARR-03 | — | N/A | unit (DOM-free, text match on the storm-intro literal) | new narration unit script | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NARR-04 | — | N/A | unit (DOM-free) | fabricated `{t:"battle",spoil:"5 coins"}` vs `{spoil:"2 coins"}` → assert differing wording | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NARR-05 | T-15-01 | Player names stay routed through `pn()`/`poss()` so `escHtml()` at `util.js:196-198` still applies; `variants` stays host-computed (guests never write `rooms/{code}/narr`) | unit (table/`describe()` half) + **manual** (broadcast half) | `node scripts/bot_storm_narration_test.js` (regression) + new unit assertions on the viewer-seat branch | Partial ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | NARR-06 | — | N/A | unit (pure function) | assert `msgHoldMs()`/`botMsgHoldMs()` shortened and the chat-bubble hold unchanged for a known text length | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **New/extended narration unit script** — today the ONLY automated assertion over narration text is `scripts/bot_storm_narration_test.js` against `EVENT_NARRATION.moored`. Every other table entry (`dock`, `battle`, `aground`, `shotclockskip`, …) and every ad-hoc `flow.js`/`orchestrator.js` line has zero coverage. NARR-02/03/04/05/06 all need assertions before their edits are verifiable without a full manual playtest. Follow the existing DOM-free, direct-`util.js`-import pattern.
- [ ] **Preserve the `moored` invariant** — `bot_storm_narration_test.js` asserts text equality/regex on `EVENT_NARRATION.moored` and never sets `appState.mySeat`. Any second-person addition must default to today's exact wording when no viewer seat is set, or this permanent gate goes red.
- [ ] **Framework install:** none needed — the `check()`/`process.exit()` convention requires no new tooling.

**Structural gap, deliberately NOT closed by this phase:** nothing exercises `netSetNarr`/`watchNarr` or any Firebase round-trip (zero references outside `src/net/writers.js` and `src/orchestrator.js`). There is no precedent for mocking Firebase in this repo. The `variants` broadcast is therefore verified by unit-testing its pure pieces plus a manual two-tab session — not by a new integration harness.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audit page renders every catalogued line as a player sees it (seat colors, emoji, ingredient art) and Wyatt signs off on the pruning + new wording | NARR-01, and the D-04 gate over NARR-02/03/04/05 copy | It is a human judgement call — the whole point of the deliverable | `npm start`, open `art-review/narration-audit.html` (must be served over http, not `file://`, because it imports ES modules) |
| Live message box shows "you" text on the acting seat's own screen while other seats read third person | NARR-05 | Requires two real browsers against a live Firebase room; no Firebase mock exists | Two-tab Chrome session per the MP test harness; exercise a storm, an anchor, a battle, and a bribe from a remote seat |
| Old-client fallback: a `narr` payload with no `variants` still renders today's text rather than a blank box | NARR-05 | Real version skew would need two commits running at once | Temporarily strip `variants` from a test payload and confirm the `html` field still renders |
| Narration hold feels ~10% shorter while chat bubbles feel unchanged | NARR-06 | Perceptual | Solo game; watch a few narration beats, then have a second seat send a chat message |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
