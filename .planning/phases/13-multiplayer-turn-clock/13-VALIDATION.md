---
phase: 13
slug: multiplayer-turn-clock
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-25
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `13-RESEARCH.md` → `## Validation Architecture`. The Per-Task
> Verification Map is finalized once PLAN.md task IDs exist.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No unit-test framework (no Jest/Vitest/Mocha). A suite of standalone Node scripts under `scripts/`, run via plain `node`, chained in `package.json`'s `test` script. This is a deliberate project convention (CLAUDE.md: "no build step," vanilla stack) — **do not introduce a test framework for this phase.** |
| **Config file** | `package.json` `"scripts"` block (no separate config file) |
| **Quick run command** | `node scripts/determinism_baseline.js --verify` (isolates the determinism regression only, ~seconds) |
| **Full suite command** | `npm test` (9 gates: determinism + engine contract + replay + net registry + net contract + state contract + module graph + UI contract + no-undef) |
| **Estimated runtime** | Quick: ~seconds · Full suite: under a minute |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/determinism_baseline.js --verify` — this phase must never change engine behavior, so this stays trivially green throughout; a failure at ANY point mid-phase is a stop-the-line signal, not something to defer.
- **After every plan wave:** Run `npm test` (full 9-gate chain — includes the `net_contract_check.js` watcher-inventory count that this phase's change to `src/net/watchers.js` will affect; see Wave 0).
- **Before `/gsd-verify-work`:** Full `npm test` green, PLUS a live 2+ tab MCP (or manual) multiplayer session covering the CLOCK-01/02/03 manual checks below.
- **Max feedback latency:** ~seconds (quick determinism verify)

---

## Per-Task Verification Map

*Populated after planning (task IDs like `13-01-01` do not exist yet). Every automatable task's `<automated>` verify resolves to one of the two commands above; manual/MCP-shaped behaviors are listed under Manual-Only Verifications below.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-XX-XX | XX | X | CLOCK-0X | T-13-0X / — | see Security Domain in RESEARCH.md | regression / manual | `node scripts/determinism_baseline.js --verify` / `npm test` | ✅ (harness exists) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **Required edit (not a new fixture):** `scripts/net_contract_check.js` — add `"netWatchPaused"` to `WATCHER_INVENTORY` and bump the `attachCount !== 18` literal (and the `"eighteen"` log text) to `19`/`"nineteen"`, in the SAME commit that adds `netWatchPaused` to `src/net/watchers.js`. Without this, `npm test` fails `watcher inventory completeness`.

*No new automated test FILE is required.* Every new-behavior gap (localStorage schema-version guard for CLOCK-01; multiplayer pause/resume for CLOCK-02/03) is inherently a boot-sequence / UI / network-timing concern — not a fit for the deterministic-engine `scripts/` harness. Per project convention, cover these as the manual/MCP checklist items below rather than introducing a new test framework. Existing infrastructure (`npm test` 9-gate chain incl. determinism) covers all automatable phase requirements and the VERIFY-02 guardrail.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stale (pre-refactor, unversioned) `pp_sess`/`pp_solo` is detected and cleared; a legitimate current-version in-progress game still resumes | CLOCK-01 | Boot-sequence / `localStorage`-state behavior, outside the deterministic-engine harness's scope | MCP/manual: `localStorage.setItem('pp_sess', JSON.stringify({room:'X',mySeat:0,isHost:true}))` (NO `v` field) → reload → assert home screen, not a resume attempt. Then repeat with `{v:SESSION_SCHEMA_V,...}` → reload → assert resume IS attempted. Repeat the pair for `pp_solo`/`SOLO_SCHEMA_V`. |
| Clean 2+ window multiplayer game boots without a stall and the first turn begins | CLOCK-01 | Multiplayer boot timing across two browser contexts | Live 2-tab MCP boot with NO pre-existing stale `localStorage` (clear + set a unique `pp_id` per tab first — see gotcha below); assert the clock counts down and turn 1 starts with no timer-toggle workaround. |
| Any player (esp. a GUEST) can pause; freeze halts the countdown AND bot actions on ALL tabs | CLOCK-02 | UI + network-timing behavior; requires a real `.click()` (NOT `document.hidden` spoofing — that path is structurally unreachable in headless tabs) | MCP: real `.click()` on `#scPause` from a GUEST tab → assert `#shotClockPanel` shows "paused" on ALL tabs (`window.__pp_app_state_debug().shotClockPaused === true` on host AND guest), a bot's turn does not advance while paused (event count / board state unchanged), and resume continues. |
| Countdown resumes at the exact remaining time (does not reset to 30, does not drain while paused) | CLOCK-02 (D-07) | Wall-clock timing behavior | Pause with N seconds visibly remaining on `#shotClockNum`; wait; resume; assert the displayed countdown resumes at N. |
| Clicking the large paused symbol (`#shotClockNum`) resumes — in BOTH solo and multiplayer | CLOCK-03 | UI click behavior on the interval-rendered clock panel | MCP: while `#shotClockPanel`'s `wrap` has class `paused`, `document.getElementById('shotClockNum').click()` → assert `__pp_app_state_debug().shotClockPaused` flips to `false` (on all tabs in MP). Verify in a solo game and a multiplayer game. |

**MP test-harness gotcha (all multiplayer checks):** all tabs in one Chrome profile share `localStorage['pp_id']`, so a naively-opened second tab rejoins AS the host. Before each additional tab loads: `localStorage.clear(); localStorage.setItem('pp_id','<unique>')`, then reload — sequentially, not in parallel. (Playwright separate browser contexts avoid this entirely.)

**Automated guardrail (VERIFY-02):** `npm run test:determinism` (or `npm test`) must stay green 30/30 throughout — this is automated, not manual, and was confirmed green (30/30) at research time before the phase began.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies (or are listed under Manual-Only Verifications with instructions)
- [ ] Sampling continuity: determinism verify after every task commit; no 3 consecutive tasks without a verify
- [ ] Wave 0 covers the `net_contract_check.js` inventory edit
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (by validate-phase after execution)

**Approval:** pending
