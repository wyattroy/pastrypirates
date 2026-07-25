---
phase: 12
slug: verification-validation
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-25
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Closeout record mirroring `11-VALIDATION.md`'s Requirements → Test Map pattern.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Node scripts + `process.exit(0/1)`, wired through `npm test` (Phases 7–11 convention). No browser-test framework was introduced this phase (D-01). |
| **Config file** | none — zero-dependency, native ESM, no build step |
| **Quick run command** | `node scripts/module_graph_check.js && node scripts/ui_contract_check.js` |
| **Full suite command** | `npm test` (9-script chain: determinism baseline, engine/net/state/ui contract checks, module-graph check, dlog replay, net registry, no-undef) |
| **Browser verification command** | `docs/VERIFICATION-CHECKLIST.md` — a committed, re-runnable procedure (Chrome via browser-MCP for Criteria 1-3; manual desktop Safari for Criterion 4), per D-01 |
| **Estimated runtime** | `npm test`: a few seconds. Full checklist re-run (incl. browser passes): ~30-45 min human/orchestrator time. |

---

## Sampling Rate

- **After every task commit:** `npm test` re-run wherever a checklist edit occurred (no source files were touched this phase — verification-only, per D-01)
- **After every plan wave:** `npm test` full suite green, confirmed at 12-01 through 12-04
- **Before phase closeout:** Full `npm test` green + all four ROADMAP criteria (VERIFY-01..04) recorded satisfied in `docs/VERIFICATION-CHECKLIST.md`
- **Max feedback latency:** ~a few seconds (per-commit `npm test`)

**Never `--capture`** (D-04, inherited from Phase 7/11's D-10): the Phase 7 determinism corpus stays frozen at 30 seeds. `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` confirmed `1` throughout Phase 12 (Criterion 1). Expanding the corpus with targeted storm/battle/recovery fixtures is deliberately deferred as optional future hardening (D-04; see 12-CONTEXT.md § Deferred), not a v1.1 blocker.

---

## Per-Task Verification Map

| Plan | Task(s) | Requirement | Test Type | Automated Command | Status |
|------|---------|-------------|-----------|--------------------|--------|
| 12-01 | Determinism/regression harness re-run + boot smoke | VERIFY-01 | integration + browser | `npm test`; Chrome-MCP boot smoke | ✅ pass |
| 12-02 | Solo gameplay-loop E2E (sail/dock/trade/battle/fish/storm/end-of-voyage) | VERIFY-02 | browser (Chrome-MCP) | Scenario steps, `docs/VERIFICATION-CHECKLIST.md` Criterion 2 | ✅ pass (6/7 Chrome-driven + cross-coverage for the remaining 3, closed by 12-04) |
| 12-03 | Two-tab MP sync + D-02 pause/refresh recovery matrix | VERIFY-03 | browser (Chrome-MCP, two tabs) | Scenario steps, `docs/VERIFICATION-CHECKLIST.md` Criterion 3 | ✅ pass |
| 12-04 | Desktop-Safari solo playthrough (manual sign-off) + phase closeout | VERIFY-04 | human/Safari | Scenario steps, `docs/VERIFICATION-CHECKLIST.md` Criterion 4 | ✅ pass |

---

## Requirements → Test Map

| Req | Behavior | Type | Evidence | Status |
|-----|----------|------|----------|--------|
| VERIFY-01 | Headless determinism/replay harness expanded to cover the regression corpus and runs green post-refactor | integration | `docs/VERIFICATION-CHECKLIST.md` Criterion 1 — `npm test` full 9-script chain, exit 0; 30/30 determinism seeds PASS with `SOURCE: unchanged`; frozen-corpus count = 1; zero dependencies/devDependencies (D-04) | ✅ **Satisfied** |
| VERIFY-02 | Claude-driven Chrome-MCP E2E tests exercise the full solo gameplay loop (sail, dock, trade, battle, fish, storm, end-of-voyage) | browser (Chrome-MCP) + cross-coverage | `docs/VERIFICATION-CHECKLIST.md` Criterion 2 — boot/start-solo/recipe/sail/dock+coin-flip/ingredient-award/battle/`pp_solo`-persistence/shot-clock-pause all Chrome-driven PASS (zero console errors); trade/parley, fish, and end-of-voyage cross-covered via Phase-11's byte-identical code move + confirmed exercised in Wyatt's VERIFY-04 desktop-Safari playthrough (2026-07-25); storm already verified live in Phase 11 | ✅ **Satisfied** |
| VERIFY-03 | Claude-driven Chrome-MCP E2E tests exercise a full multiplayer game across two browser tabs (host + guest) with deterministic sync intact | browser (Chrome-MCP, two tabs) | `docs/VERIFICATION-CHECKLIST.md` Criterion 3 — two-tab host+guest sync PASS (byte-identical `turnOrder [2,1,0,3]` on both tabs, narration broadcast, watcher registry populated), plus the full D-02 pause/refresh recovery matrix PASS: (a) shot-clock pause holds state intact, (b) guest-tab refresh restores the voyage, (c) host-tab refresh restores AND lockstep sync survives the cycle | ✅ **Satisfied** |
| VERIFY-04 | Manual Safari + Chrome playtests confirm no perf/compat regressions — including storm rendering and multiplayer pause/refresh state | human/Safari | `docs/VERIFICATION-CHECKLIST.md` Criterion 4 — Wyatt's full desktop-Safari solo playthrough (sail, dock, trade/parley, battle, fish, end-of-voyage) PASS, 2026-07-25, no perf/compat regression; storm rendering already re-verified by Wyatt in Phase 11 (D-12); multiplayer pause/refresh state covered by VERIFY-03's Chrome-driven D-02 matrix (D-03 scoped Wyatt's manual pass to desktop-Safari solo only, not Safari-MP) | ✅ **Satisfied** |

---

## Wave 0 Requirements

No Wave 0 test infrastructure was required this phase — Phase 12 is verification-only against the existing `npm test` chain (built in Phases 7–11) plus a new committed markdown checklist (`docs/VERIFICATION-CHECKLIST.md`, D-01). No new automated-check scripts, frameworks, or dependencies were introduced.

- [x] `npm test` chain (existing, from Phases 7–11) confirmed green post-refactor — no new script needed.
- [x] `docs/VERIFICATION-CHECKLIST.md` authored and committed as the re-runnable browser-verification procedure (D-01).
- [x] Framework install: **none** (D-01 — no Playwright/browser-test-framework dependency introduced).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Full desktop-Safari solo playthrough (sail, dock, trade, battle, fish, end-of-voyage) with no perf/compat regression | VERIFY-04 / D-03 | No automation can drive desktop Safari; Wyatt's personal sign-off is the accepted bar per D-03 | Serve this worktree locally on a fresh port (Safari caches ES modules by URL — a `?cb=` query does not bust them); open in desktop Safari; play one full solo game start-to-finish; watch for freeze/jank/visual breakage vs. pre-refactor. See `docs/VERIFICATION-CHECKLIST.md` Criterion 4 for the full scenario. |
| Desktop-Safari storm render (Criterion 5 / D-12, Phase 11) | VERIFY-04 (carried forward) | No automation can drive Safari; the v1.0 BUG-01 storm near-crash risk lives here | Already re-verified by Wyatt in Phase 11 (`11-VALIDATION.md`) — not required again this phase per D-03; noted here only for traceability. |

**Explicitly deferred out of v1.1 scope (D-03; see 12-CONTEXT.md § Deferred):**

- Mobile Safari (iPhone) and iPad playtests — the refactor branch is not deployed to a phone-reachable origin; the public `playpastrypirates.com` still serves v1.0.
- Safari multiplayer (two-device or two-tab) — two-tab MP recovery is proven in Chrome (VERIFY-03); a real two-device Safari session is optional future hardening.
- Real two-device multiplayer playtest (Wyatt + a friend, separate devices/networks) — two-tab-same-machine (Chrome) is the accepted v1.1 surface.
- Expanded determinism corpus targeting storms/battles/recovery specifically — the current 30-seed baseline (D-04) is accepted as sufficient; new targeted fixtures are optional future hardening.
- Committed auto-running Playwright E2E suite — deliberately deferred to keep v1.1 dependency-free (D-01); revisit as its own post-milestone effort.

---

## Known pre-existing issues (out of scope, logged — not v1.1 regressions)

Wyatt's VERIFY-04 desktop-Safari playthrough surfaced two findings. Both were traced to their exact source and diffed byte-for-byte against the shipped `main` branch (pre-refactor v1.0); both are confirmed **pre-existing** — the v1.1 refactor moved the affected code verbatim and introduced neither behavior. Logged as backlog todos, not phase blockers:

1. **End-of-voyage narration box stays visible-but-empty instead of collapsing** — `setClockUI`'s `liveDone` branch (`src/ui/panel.js:54-58`) never clears `#actionPanel`; byte-identical to `main:index.html:3254`. Backlog: `.planning/todos/pending/eov-narration-box-not-cleared.md`.
2. **A bot can "hail" (parley) the human and still take its normal action in the same turn** — the intentional "hail humans" mechanic (`src/ui/flow.js:584-612`) runs as a pre-action negotiation before `chooseAction`; byte-identical to `main:index.html:4607`; a design question, not a bug. Backlog: `.planning/todos/pending/bot-hail-plus-action-same-turn.md`.

Both were logged in commit `b14c3b0`. Because both are confirmed pre-existing, **Phase 12's core conclusion holds: the v1.1 monolith refactor introduced no perf/compat/behavior regressions.**

---

## Validation Sign-Off

- [x] All four ROADMAP success criteria (VERIFY-01..04) mapped to recorded evidence in `docs/VERIFICATION-CHECKLIST.md`
- [x] Sampling continuity: `npm test` re-run and confirmed green after every plan's checklist edits (12-01 through 12-04)
- [x] Wave 0 covers all required references — none beyond the existing `npm test` chain + the new checklist
- [x] No watch-mode flags
- [x] Feedback latency < a few seconds (`npm test`)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** satisfied — VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04 all recorded satisfied with evidence in `docs/VERIFICATION-CHECKLIST.md`. The v1.1 monolith refactor is proven correct end-to-end: automated determinism/regression baseline green, full Chrome-driven solo + two-tab multiplayer loops verified (including the D-02 pause/refresh recovery matrix), and Wyatt's desktop-Safari sign-off confirms no perf/compat regression on the one surface no tool can drive. Two pre-existing (non-regression) UI/design findings were surfaced and logged to the backlog, not blocking this sign-off.
