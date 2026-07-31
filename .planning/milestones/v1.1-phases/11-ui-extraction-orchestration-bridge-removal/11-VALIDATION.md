---
phase: 11
slug: ui-extraction-orchestration-bridge-removal
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-24
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from RESEARCH.md § Validation Architecture (grounded in static analysis of the live `index.html`).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Node scripts + `process.exit(0/1)`, wired through `npm test` (Phases 7–10 convention) |
| **Config file** | none — zero-dependency, native ESM, no build step |
| **Quick run command** | `node scripts/module_graph_check.js && node scripts/ui_contract_check.js` |
| **Full suite command** | `npm test` (determinism + engine/net/state/ui contract checks + module-graph check) |
| **Estimated runtime** | ~a few seconds |

---

## Sampling Rate

- **After every task commit:** `node scripts/determinism_baseline.js --verify` + the two new checks (`module_graph_check.js`, `ui_contract_check.js`)
- **After every plan wave:** Run `npm test` + a Chrome load-and-play smoke check
- **Before `/gsd-verify-work`:** Full suite green + Chrome solo/two-tab click-through transcript
- **Max feedback latency:** ~a few seconds (per-commit checks)

**Never `--capture`** (D-10): the Phase 7 determinism corpus stays frozen. `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` must stay `1`. `--verify` green is necessary but NOT sufficient — the corpus is UI-blind.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| _(filled by plan-phase once plans exist; validate-phase §6 finalizes)_ | | | | | | | | | ⬜ pending |

---

## Requirements → Test Map (from RESEARCH.md)

| Req | Behavior | Type | Command | Infra |
|-----|----------|------|---------|-------|
| SPLIT-03 | `src/ui/` never imports `src/net/` | contract | `node scripts/ui_contract_check.js` | ❌ W0 |
| SPLIT-05 | `main` orchestrates; `index.html` = markup + one module entry; bridge deleted | contract + grep | `ui_contract_check.js` (bridge-gone assertion) + `grep -c '<script>' index.html` | ❌ W0 |
| SPLIT-06 | Dependency graph acyclic | contract | `node scripts/module_graph_check.js` | ❌ W0 |
| — | Engine behavior unchanged | integration | `determinism_baseline.js --verify` 30/30 | ✅ P7 |
| — | Solo + two-tab playable, clean console, bridge gone | **browser** | Chrome MCP click-through | ❌ W0 |
| — | Safari storm renders cleanly | **human/Safari** | forced-storm pass | ❌ W0 (Wyatt) |

---

## Wave 0 Requirements

- [ ] `scripts/module_graph_check.js` — import-graph cycle detection (DFS), asserts the expected acyclic shape (`shared ← engine`, `shared ← ui`, `shared ← net`, `engine ← ui`, `{engine, ui, net} ← main`; `ui` must NOT → `net`), wired into `npm test`.
- [ ] `scripts/ui_contract_check.js` — UI-never-imports-net, bridge-gone, no-leftover-bridge-reads, retained-globals-allowlist. Proven able to fail (red-proof drill).
- [ ] Commit the static analyzer (phase scratchpad `11-analysis-tool.mjs` → `scripts/`) so the 183-function inventory is re-runnable, not a one-off.
- [ ] Framework install: **none**.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Safari storm renders cleanly at the UI-extraction boundary | Criterion 5 / D-12 | No automation can drive Safari; the v1.0 BUG-01 storm near-crash risk lives here | Force a storm (`appState.game.cfg.storm=1; rollStorm = g=>{g.r();g.stormStreak=1;return true;}`), watch frame rate in Safari per `07-03-SUMMARY.md` (note render-only-guest caveat) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < a few seconds
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
