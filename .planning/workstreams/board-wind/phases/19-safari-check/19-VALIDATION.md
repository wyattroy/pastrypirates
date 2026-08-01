---
phase: 19
slug: safari-check
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-31
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

**This phase is unusual: its deliverable *is* a validation instrument, not a feature validated by
one.** The Nyquist question is not "how do we test the wind dots" but "how do we prove the
*measurement itself* is trustworthy before a human bases the Phase 20 go/no-go and its dot budget on
what it reports." A miscalibrated smoothness readout is worse than no readout — it would let a real
stutter through as a pass, or falsely fail a build that was fine because of a backgrounded-tab
artifact or an unmeasured Low-Power-Mode baseline. (See `19-RESEARCH.md` §Validation Architecture and
Pitfalls 2–4.)

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None dedicated — this project has no browser-test framework. `npm test` covers the deterministic engine only (precedent: `12-VALIDATION.md`). This phase's gate is manual/human **by design** (D-09: Wyatt runs the Safari verdict himself). |
| **Config file** | none |
| **Quick run command** | `npm test` (31-seed determinism suite — must stay green, proves D-11/D-12 held) |
| **Full suite command** | Chrome pre-flight smoke pass, then Wyatt's own two-run Safari protocol (D-06) on desktop **and** phone |
| **Estimated runtime** | `npm test` ~seconds; Chrome smoke ~5 min; Wyatt's Safari protocol ≈ an afternoon |

---

## Sampling Rate

- **After every task commit:** Run `npm test` (determinism suite green) + load the branch in Chrome
  and visually confirm the switch / dial / readout still work.
- **After every plan wave:** Full Chrome smoke pass — dial to 0, to 10, to 100; toggle the switch off
  and confirm no visible residue; simulate `prefers-reduced-motion` via devtools.
- **Before handing the build to Wyatt for the Safari verdict:** the written pre-flight checklist below
  must be fully green in Chrome. Safari time is the scarce resource; a wiring bug must never be
  discovered on his afternoon.
- **Max feedback latency:** `npm test` under 60s; Chrome smoke under 5 min.

---

## Per-Task Verification Map

*Seeded at plan time — per-task rows are filled in by `/gsd-validate-phase` once PLAN.md tasks exist.
The requirement-level map below is the contract those task rows must satisfy.*

| Req ID | Behavior | Test Type | Automated Command | File Exists |
|--------|----------|-----------|-------------------|-------------|
| WIND-00 (determinism safety) | Wind-dot randomness never draws from `game.r()` — private `mulberry32` seeded *from* the game seed (D-12) | automated | `npm test` (31-seed determinism suite) — must stay green with **zero** fixture changes | ✅ exists |
| WIND-00 (BUG-01 contract) | New dot code animates compositor-only (`transform`/`opacity`); no masks, blur filters, or animated live gradients over the board | automated guard | Wave 0 self-check script (see below), mirroring the existing `module_graph_check.js` / `ui_contract_check.js` pattern | ❌ W0 |
| WIND-00 (measurement trustworthiness) | rAF-delta sampler uses a measured session baseline, discards/flags backgrounding artifacts, and is itself cheap enough not to perturb what it measures | manual, human-observed | none — the check is matching a physical action (lock the phone) to an on-screen consequence | ❌ W0 checklist |
| WIND-00 (self-serve, touch-only) | Switch, 0–100 dial, live readout and end-of-voyage summary are all operable by touch, mid-voyage, with **no console commands and nothing to memorise** | manual | none | ❌ W0 checklist |
| WIND-00 (the verdict itself) | A full voyage at 10 dots stays smooth in real desktop Safari **and** real phone Safari; the headroom run yields a number | manual — **this is the phase gate** | none, and none is possible: no automation drives Safari (`docs/DRIVING-THE-GAME.md`) | N/A — human gate |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **A cheap automated "no forbidden properties" self-check** for the new wind-dot code — flags
      `mask`, `blur(`, and `linear-gradient`/`radial-gradient` used in an *animated* context, so a
      future edit cannot silently reintroduce a BUG-01-class mistake. Follows the existing
      `scripts/module_graph_check.js` / `ui_contract_check.js` precedent.
- [ ] **A short written pre-flight checklist** for Chrome, run before Wyatt spends any Safari time:
      backgrounding test (tab-switch mid-run must not record a bogus worst dip), Low-Power-Mode
      baseline behaviour, dial reaches exactly 10 and exactly 100, switch-off leaves no visible
      residue, `prefers-reduced-motion` branch behaves.
- [ ] **No new automated test *files* beyond the above.** This phase's nature — a human-judged gate,
      explicitly not machine-gated — makes a from-scratch browser test suite the wrong tool. The
      existing `npm test` determinism suite is the correct and sufficient automated safety net for
      D-11/D-12.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| A full voyage stays smooth in real desktop Safari at 10 dots | WIND-00 | No automation can drive Safari (`docs/DRIVING-THE-GAME.md`); the whole phase exists because real Safari is the only honest witness | D-06 run 2: lock dial to 10, play a full voyage on the Mac, read the end-of-voyage summary |
| A full voyage stays smooth in real **phone** Safari at 10 dots | WIND-00 / D-09 | Same, plus the phone's ceiling — not the Mac's — becomes Phase 20's budget | Serve the branch on a fresh port reachable over wifi, open in Mobile Safari, repeat run 2 by touch only |
| The headroom number | WIND-00 / D-06 | The number *is* the deliverable | D-06 run 1: wind the dial up toward 100 and note where it starts to hurt, on both devices |
| The readout does not lie under backgrounding | WIND-00 | Requires physically locking the phone / switching tabs mid-run | Mid-run, lock the phone for ~10s, unlock, confirm no bogus "worst moment" was recorded |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers both MISSING references above
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s for `npm test`
- [ ] Pre-flight checklist green in Chrome **before** Wyatt is asked for Safari time
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
