---
phase: 18
slug: prompts-polish
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-08-01
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `18-RESEARCH.md` § Validation Architecture and the seven `18-0*-PLAN.md` files.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | **None.** Custom `check(name, actual, expected)` / `checkTrue(name, actual)` harness, no assertion library, `process.exit(failures?1:0)`. Pattern is identical across every `scripts/*_test.js` / `*_check.js`. |
| **Config file** | none — `package.json`'s `"test"` script chains 19 scripts with `&&` |
| **Quick run command** | `node scripts/narration_test.js` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | quick ~<1s (DOM-free); full suite seconds, dominated by `determinism_baseline.js --verify` |

**Critical:** `npm test` includes `determinism_baseline.js --verify`, which re-hashes the 31-seed
fixture corpus. It MUST stay green for the whole phase — milestone constraint 1 forbids any change to
`src/engine/index.js` or what it emits. A red determinism check is a phase-stopping event, not a
flake.

**No browser/DOM test runner exists.** Confirmed: no `node_modules`, and no
`jsdom`/`playwright`/`puppeteer` in `package.json`. Anything touching real layout, CSS, or in-browser
timing cannot be asserted by the harness — it needs a driven browser session per
`docs/DRIVING-THE-GAME.md`, or a human's eyes. That split is honoured in the map below rather than
papered over.

---

## Sampling Rate

- **After every task commit:** run that task's automated command from the map below
- **After every plan wave:** `npm test`
- **Before `/gsd-verify-work`:** full suite green, and `determinism_baseline.js --verify` green
- **Max feedback latency:** ~1s for the per-task command; seconds for the full suite

No 3 consecutive tasks lack an automated command — the only gaps are the two deliberate checkpoints
(`18-02-02`, `18-07-02`), and each is immediately followed by an automated task.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Type | Automated Command | Status |
|---------|------|------|-------------|------|-------------------|--------|
| 18-01-01 | 01 | 1 | FIX-03 | tracer | `node scripts/no_undef_check.js && node scripts/module_graph_check.js && node scripts/ui_contract_check.js` | ⬜ pending |
| 18-01-02 | 01 | 1 | FIX-16 | auto | `node scripts/no_undef_check.js && node scripts/ui_contract_check.js && node scripts/narration_flow_test.js` | ⬜ pending |
| 18-01-03 | 01 | 1 | FIX-10 | auto | `node scripts/no_undef_check.js && node scripts/module_graph_check.js && node scripts/state_contract_check.js` | ⬜ pending |
| 18-02-01 | 02 | 1 | FIX-08 | auto | `node scripts/narration_test.js && node scripts/no_undef_check.js && node scripts/module_graph_check.js` | ⬜ pending |
| 18-02-02 | 02 | 1 | FIX-08 | **checkpoint:decision** | — (cross-workstream coordination on `src/ui/board.js`) | ⬜ pending |
| 18-02-03 | 02 | 1 | FIX-08 | auto | `node scripts/no_undef_check.js && node scripts/module_graph_check.js && node scripts/ui_contract_check.js` | ⬜ pending |
| 18-03-01 | 03 | 2 | FIX-04 | auto | `node scripts/narration_test.js && node scripts/bot_storm_narration_test.js && node scripts/extract_narration_lines.js` | ⬜ pending |
| 18-03-02 | 03 | 2 | FIX-21 | auto | `node scripts/narration_test.js && node scripts/narration_flow_test.js && node scripts/narration_audit_check.js` | ⬜ pending |
| 18-03-03 | 03 | 2 | FIX-21 | auto | `node scripts/ui_contract_check.js && npm test` | ⬜ pending |
| 18-04-01 | 04 | 3 | FIX-07 | auto | `node scripts/narration_test.js && node scripts/dlog_replay_test.js && node scripts/engine_contract_check.js && node scripts/determinism_baseline.js --verify` | ⬜ pending |
| 18-04-02 | 04 | 3 | FIX-07 | auto | `node scripts/narration_test.js && npm test` | ⬜ pending |
| 18-05-01 | 05 | 4 | FIX-03 (D-02) | auto | `node scripts/no_undef_check.js && node scripts/state_contract_check.js && node scripts/module_graph_check.js` | ⬜ pending |
| 18-05-02 | 05 | 4 | FIX-03 (D-02) | auto | `node scripts/ui_contract_check.js && node scripts/host_guest_parity_check.js && node scripts/narration_audit_check.js` | ⬜ pending |
| 18-06-01 | 06 | 5 | FIX-06 | auto | `node scripts/ui_contract_check.js && node scripts/narration_audit_check.js && npm test` | ⬜ pending |
| 18-06-02 | 06 | 5 | FIX-17 | auto | `node scripts/no_undef_check.js && node scripts/ui_contract_check.js && node scripts/module_graph_check.js` | ⬜ pending |
| 18-06-03 | 06 | 5 | FIX-09 | auto | `node scripts/ui_contract_check.js && npm test` | ⬜ pending |
| 18-07-01 | 07 | 6 | all (ledger) | auto | `node scripts/extract_narration_lines.js && node scripts/narration_audit_check.js && npm test` | ⬜ pending |
| 18-07-02 | 07 | 6 | all | **checkpoint:human-verify** | `npm test` (green is a precondition, not the proof) | ⬜ pending |
| 18-07-03 | 07 | 6 | FIX-09 | auto | `npm test` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

**Existing infrastructure covers every automatable phase requirement.** No Wave 0 needed — the
19-script harness already exercises the narration text logic, the module graph, the UI contract, the
host/guest parity surface and the determinism corpus. Two plans add *new permanent gates* rather than
new infrastructure:

- `18-03-03` — an anchored gate so a seventh unwrapped `.nobrk` site cannot land unnoticed. Anchored
  to specific narration literals; refuses rather than skips, following `checkStormRainSeeded`.
- `18-04-02` — splits the existing assertion in `scripts/narration_test.js` that currently *encodes
  the bug* (it asserts today's wrong bribe framing).

---

## Manual-Only Verifications

These cannot be closed by an agent. They are the honest residue of a project with no browser test
runner, and they are what `18-07-02` exists to collect.

| Behaviour | Requirement | Why manual | Test instructions |
|-----------|-------------|-----------|-------------------|
| Action button never clipped at 320/375/390 **and across an orientation change**, in **real Safari** | FIX-10 (criterion 1) | Safari-only rendering path; `docs/DRIVING-THE-GAME.md` is Chrome/automation-oriented and explicitly does not cover Safari. This is the exact v1.2 Phase 17 precedent. | Wyatt, on his own Safari: open a prompt that wraps to two lines, then narrow the window and rotate. The button must stay fully reachable at every width. |
| Narration fades **exactly where it sat** — no sideways jump | FIX-16 (criterion 2) | Sub-second visual transition; no DOM runner to assert computed position mid-animation | Watch a line being replaced. Compare against a pre-change recording — the fading line must not shift left as the fade starts. |
| Box only shrinks **after** the fade completes, never slicing still-fading lines | FIX-16 (criterion 2) | Same — animation-time layout | Trigger a multi-line message followed by a short one. No line may be clipped mid-fade. |
| Buttons appear only after the final character; immediately under `prefers-reduced-motion` | FIX-03 (criterion 3) | Timing-visual | Watch a long prompt. Then enable Reduce Motion in macOS and confirm buttons appear at once. |
| The restyled primary buttons read correctly against the existing footer-button pattern | FIX-06 (criterion 8) | Aesthetic judgement | Compare a restyled `.primary` against the footer buttons at `index.html:135-151`. |
| Captain rows look right with the colour swatch gone and the row closed up | FIX-17 (criterion 10) | Aesthetic judgement | Check both the in-game player rows and the lobby seat list. |
| **FIX-09 — which narrow-screen chip treatment to keep** | FIX-09 (criterion 7), **D-03** | Deliberately deferred to Wyatt's eye rather than decided blind | `18-06-03` produces 6 renders (2 treatments × 320/375/390). Wyatt picks; `18-07-03` applies the winner and deletes the loser. |

---

## Validation Sign-Off

- [x] All tasks have an automated verify, or are one of the two deliberate blocking checkpoints
- [x] Sampling continuity: no 3 consecutive tasks without an automated verify
- [x] Wave 0 covers all MISSING references (none — existing harness suffices)
- [x] No watch-mode flags
- [x] Feedback latency < 5s for per-task commands
- [ ] `nyquist_compliant: true` — set by `/gsd-validate-phase` after execution, not here

**Approval:** pending
