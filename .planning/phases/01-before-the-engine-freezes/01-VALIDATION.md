---
phase: 1
slug: before-the-engine-freezes
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `01-RESEARCH.md` → `## Validation Architecture`. Task IDs are filled by
> `/gsd-validate-phase` once PLAN.md files exist.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (hand-rolled). Every gate in `scripts/` is a standalone `node scripts/X.js` using a local `check(name, actual, expected)` counter and `process.exit(failures?1:0)`. No `node:test`, Jest, or Mocha anywhere in the repo. |
| **Config file** | none — this phase adds NEW scripts following the existing convention (see Wave 0) |
| **Quick run command** | `node 4/scripts/no_undef_check.js` (~instant) |
| **Full suite command** | `npm test` (21 root gates) — **none of which currently load `4/`** |
| **Estimated runtime** | quick gates ~instant; the `bot_ladder4.js` balance run ~7 min (single dev seed family) |

> **The gap that matters:** root `npm test` being green says nothing about `4/`. Wiring `4/`'s gates
> into the root chain is Phase 3's TEST-04/05 job and is explicitly out of scope here. Until then,
> every `4/` gate in this phase must be run by name.

---

## Sampling Rate

- **After every task commit:** run the specific new/modified script for that task.
- **After every plan wave:** run all five checks together, plus `git diff --name-only` proving no
  file outside `4/` was touched except the two deliberate exceptions (`scripts/no_undef_check.js`,
  `scripts/bot_ladder4.js`).
- **Before `/gsd-verify-work`:** all five green, **and** both `node 4/scripts/no_undef_check.js` and
  `node scripts/no_undef_check.js` exit 0, **and** root `npm test` still passes (it does not cover
  `4/`, but it must not have been broken by the two out-of-`4/` edits).
- **Max feedback latency:** ~instant for the four structural/import gates; ~7 min for the balance gate.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| *TBD by planner* | — | — | FIX-01 | — | N/A | structural (grep) | new check: no `"pp_timerOff"` literal in `4/src/**/*.js` outside the one-time cleanup fn | ❌ W0 | ⬜ pending |
| *TBD by planner* | — | — | TEST-01 | — | N/A | import | `node 4/scripts/stage_import_check.js` (proposed name) | ❌ W0 | ⬜ pending |
| *TBD by planner* | — | — | TEST-02 | — | N/A | static analysis | `node 4/scripts/no_undef_check.js` | ✅ exists (exits 1 pre-fix) | ⬜ pending |
| *TBD by planner* | — | — | RULE-01 | — | N/A | unit (engine) + structural (UI) | new check: forced-pass `Game.takeTurn` raises `p.coins` by exactly 1; plus source assertion that both `flow.js` sites call the shared `doPass(` | ❌ W0 | ⬜ pending |
| *TBD by planner* | — | — | RULE-02 | — | N/A | unit (DOM-free) | new check: `EVENT_NARRATION.pass` over all 50 `SEA_CREATURES` × 2 viewer persons contains `"Recipe idea!"` and `"🌕"` in all 100 renderings | ❌ W0 | ⬜ pending |
| *TBD by planner* | — | — | FIX-06 | — | N/A | integration + balance | `node scripts/bot_ladder4.js` (rewritten) runs clean and prints a pass-rate / voyage-length delta; `Game.prototype.planTurnClassic` is `undefined` | ✅ exists, needs D-05 rewrite | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `4/scripts/stage_import_check.js` — TEST-01. Dynamic `import()`, `process.exit(0)` on resolve,
      non-zero on reject. **Must call `process.exit(0)`** — `4/src/ui/stage.js:1449` has an unguarded
      module-scope `setInterval`, so a bare `.then()` hangs forever even after the import succeeds.
      Precedent: `scripts/module_graph_check.js:208,211`.
- [ ] A FIX-01 structural check (grep-style, matching `ui_contract_check.js`'s convention)
- [ ] A RULE-01 engine-level test (direct `4/src/engine/index.js` import, forced-pass scenario)
      plus a structural check on the two `flow.js` sites
- [ ] A RULE-02 narration test (direct `4/src/ui/util.js` import, 50 creatures × 2 persons = 100 renderings)
- [ ] `scripts/bot_ladder4.js` rewrite — before/after mode, pass-rate and voyage-length derived from
      `g.events` (already populated; `record:true` is already passed, so **no new engine
      instrumentation is needed**)

*No framework install needed — every gap follows the hand-rolled `node scripts/X.js` convention
already used by 20+ scripts in this repo.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The rendered pass line reads well on a real screen, in both persons | RULE-02 | Copy and "how much is enough" are Wyatt's call (CLAUDE.md §1). The automated check proves the tag is *present* in all 100 renderings; it cannot prove it *reads* well. He reversed a wording choice twice after seeing real lines — show rendered copy, don't describe it. | Bump `PP4_STAMP`, push, and have him open `playpastrypirates.com/4`; pass a turn and read the line. |
| `pp_timerOff` no longer leaks between the two games | FIX-01 | The structural grep proves the source no longer writes the shared key; it cannot prove the runtime behavior of a browser that already has the old key planted. | Headless or manual: plant `pp_timerOff`, load `/4`, confirm the key is deleted once and `pp4_timerOff` is written; reload and confirm it is **not** deleted again (D-02's marker guard). |
| The balance gate's verdict | RULE-01 / D-07 | The ladder produces numbers; deciding whether the movement is material — and whether to lower the payout — is Wyatt's call, made against the real numbers, not a threshold picked in advance (CLAUDE.md §2: nothing is a constant). | Run the rewritten ladder before/after on fixed seeds, report exactly what moved and why, then ask. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s for all gates except the balance run
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
