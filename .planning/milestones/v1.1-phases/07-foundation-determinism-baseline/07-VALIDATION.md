---
phase: 7
slug: foundation-determinism-baseline
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-24
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `07-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Node scripts with manual assertions and `process.exit` codes, per existing project convention (`.planning/codebase/TESTING.md`). No framework is installed; this phase's own deliverable *is* the test tool. |
| **Config file** | none — see Wave 0 |
| **Quick run command** | `node scripts/determinism_baseline.js --verify` |
| **Full suite command** | `node scripts/determinism_baseline.js --verify && node scripts/dlog_replay_test.js && node scripts/real_game_test.js` |
| **Estimated runtime** | ~30–60 seconds (30-seed corpus verify + 2 existing harnesses) |

---

## Sampling Rate

- **After every task commit:** `node scripts/determinism_baseline.js --verify` — or, for commits landing before that tool exists, `node scripts/dlog_replay_test.js` (the pre-existing harness with an exit code)
- **After every plan wave:** full suite command above, plus one Chrome MCP page-load check
- **Before `/gsd-verify-work`:** full suite green **and** a Chrome MCP solo-game playthrough over HTTP (D-21b)
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

*Populated after planning. Task IDs are assigned by `gsd-planner`; the requirement→behavior→command rows below are fixed and each task must map onto one.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | FOUND-01 | — | N/A | smoke | `node --input-type=module -e "import('./src/main.js')"` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FOUND-02 | — | N/A | smoke | `curl -sI http://localhost:8000/src/main.js` + Chrome MCP page load | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FOUND-03 | — | N/A | smoke (browser) | Chrome MCP: `window.__pp_module_ok === true`, console clean | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FOUND-04 | — | N/A | integration | `node scripts/determinism_baseline.js --capture` then `--verify`, exit 0 | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | FOUND-05 | — | N/A | manual (doc review) | presence/content check of `docs/MODULES.md` + README pointer | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

This phase inherits **no** pre-existing test infrastructure for its own deliverables — the things it builds are the things that verify it. Every item below must exist before the corresponding verification can run:

- [ ] `scripts/lib/load_engine.js` — the shared engine-extraction seam (D-12); nothing exists at this path today
- [ ] `scripts/determinism_baseline.js` — the capture/verify tool itself (D-09)
- [ ] `scripts/fixtures/determinism/` — created by the first `--capture` run (D-06)
- [ ] `src/main.js` + its trivial leaf module (D-14)
- [ ] `docs/MODULES.md` (D-22)
- [ ] Framework install: **none required**

**Ordering constraint (load-bearing):** the corpus must be captured from the tree *before* `index.html` is edited (D-21a). A baseline captured after the edit encodes the change it exists to detect. Wave assignment must enforce this.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Game loads and plays over HTTP with the module entry present | FOUND-02 | Requires a real browser with a live DOM, Firebase CDN, and asset loading — headless Node cannot exercise page load | Start `python3 -m http.server 8000`, open `http://localhost:8000`, play a solo game start to finish. Console must be clean; `window.__pp_module_ok === true`. Automatable via Chrome MCP. |
| Firebase classic-before-module ordering holds with no init race | FOUND-03 | Ordering is a browser script-execution property; not observable from Node | In the same session, confirm no `firebase is not defined` error and that the D-17 assertion did not fire. |
| Contract doc is accurate and complete | FOUND-05 | Prose accuracy is a judgment call | Review `docs/MODULES.md` covers: HTTP required, `file://` unsupported + why, `.js` MIME expectations, classic-before-module rule, `src/` layout. |
| **Safari** page load and solo game | FOUND-02 (and milestone `VERIFY-04`) | **No automation can drive Safari** — requires a human at a Safari window | Open `http://localhost:8000` in Safari, play a solo game, watch for console errors and storm-render perf. **This is Wyatt's step and cannot be delegated.** |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] Baseline captured before `index.html` is modified — verified by commit order
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
