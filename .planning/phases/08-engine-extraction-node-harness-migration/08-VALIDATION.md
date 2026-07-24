---
phase: 8
slug: engine-extraction-node-harness-migration
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-24
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `08-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — hand-rolled Node scripts with `process.exit(0/1)`, per project convention. Phase 7 built the tooling this phase leans on. |
| **Config file** | none — `package.json` scripts (`test`, `test:determinism`) are the entry points |
| **Quick run command** | `node scripts/determinism_baseline.js --verify` |
| **Full suite command** | `npm test` (runs `determinism_baseline.js --verify` **and** `dlog_replay_test.js`) |
| **Estimated runtime** | ~30–60 seconds |

---

## Sampling Rate

- **After every task commit:** `node scripts/determinism_baseline.js --verify`. Non-negotiable in this phase — CONTEXT.md says use it aggressively, and a red verify naming seed X + event N is a 10-minute fix where the same break found three commits later is a bisect.
- **After every wave:** `npm test` (adds `dlog_replay_test.js`).
- **Phase gate:** full suite green **and** the purity grep **and** the D-17 browser check, before `/gsd-verify-work`.
- **Max feedback latency:** 60 seconds.

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | Infra Exists |
|--------|----------|-----------|-------------------|--------------|
| ENGINE-01 | Engine modules have zero DOM / `window` / Firebase / wall-clock / unseeded-random access | unit (grep) | `grep -noE 'document\.[A-Za-z]+|window\.[A-Za-z]+|\bfirebase\b|localStorage|Date\.now|Math\.random|\bglobalThis\b|new Function' src/engine/*.js src/shared/*.js` → zero real hits | ❌ W0 (new check) |
| ENGINE-02 | Node harnesses import natively; same commit as extraction | integration | `node scripts/real_game_test.js 25 && node scripts/dlog_replay_test.js` | ✅ Phase 7 |
| ENGINE-03 | Byte-for-byte identical to the Phase 7 baseline | integration | `node scripts/determinism_baseline.js --verify` → exit 0, `All seeds passed.` | ✅ Phase 7 |
| ENGINE-04 | Order-load-bearing constants annotated | unit (grep) | `grep -c 'ORDER IS LOAD-BEARING'` across `src/shared` and `src/engine` → 6 + 1 = 7 total | ❌ W0 (new convention) |
| SPLIT-01 / SPLIT-02 | Module boundaries correct, no upward deps from leaves | unit (grep) | `grep -rn 'from "\.\./' src/shared/` → zero hits referencing `src/engine/` | ❌ W0 (new check) |
| D-01 / D-02 | The oracle was not neutralized | integrity (git) | `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' \| wc -l` → `1`; `manifest.json` history → exactly 2 commits | ❌ W0 (new tripwire) |
| D-17 | Browser still boots and plays after the classic script shrinks | manual / Chrome MCP | load page, `window.__pp_module_ok === true`, console clean, play several turns | ❌ W0 |
| — | Multiplayer turn loop still works (corpus-blind) | manual / Chrome MCP | forced-storm playthrough exercising `runLiveNet`/`botTurn`/`windLeg` | ❌ W0 |

*`08-04` consolidates the grep-based checks into a committed `engine_contract_check.js` standing gate, so they become repeatable rather than one-shot.*

---

## Wave 0 Requirements

- [ ] **Tracer proving the bridge mechanism** — `Object.assign(globalThis, …)` from a module readable by bare identifier in a classic-script function, in this exact page. This is the phase's central architectural bet and RESEARCH.md rates it MEDIUM-HIGH, not HIGH; it was reasoned from spec plus this project's own `firebase`-global precedent, never executed in a browser. `08-01` closes this before any extraction is built on top of it.
- [ ] `scripts/engine_contract_check.js` — purity, annotation count, module-DAG, and export-completeness as one standing gate (`08-04`)
- [ ] The targeted `engineSourceHash` re-base tool — `--capture` is the only current write path to `manifest.json` and it rewrites the frozen per-seed hashes, so it cannot be used (`08-05`)
- [ ] Framework install: **none required**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Page loads and plays after the classic script shrinks | D-17 | Headless Node cannot exercise page load; the corpus would pass green even if the page were completely broken — the same blind spot D-21 named in Phase 7 | Serve over HTTP, load in Chrome, confirm `window.__pp_module_ok === true`, console clean, play several turns. Automatable via Chrome MCP. |
| **Multiplayer turn loop** | ENGINE-03 (coverage gap) | **The corpus structurally cannot cover this.** `runLiveNet`/`botTurn`/`windLeg` (`index.html:4746`+) hand-reimplements `Game.play()` and calls `game.r()`, `rollStorm(game)` and `PERP[…]` from *outside* the class, including a second-gust storm mechanic headless `Game.play()` never sets. A green corpus proves nothing about this path. | `08-05` Task 1: forced-storm playthrough. Force via `game.cfg.storm = 1; rollStorm = function (g) { g.r(); g.stormStreak = 1; return true; };` — note bare `game`, not `window.game`, and the `g.r()` call is mandatory or replay desyncs (see `07-03-SUMMARY.md`). |

**Safari is deliberately NOT required at this phase boundary** (D-18). ROADMAP schedules Safari re-verification at Phase 11 (UI extraction, where storm rendering could regress) and Phase 12 (final). Phase 8 does not touch rendering.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] `--verify` green is an acceptance criterion on every code-motion task
- [ ] **No acceptance criterion anywhere invokes `--capture`**
- [ ] The anti-capture git tripwire is present and would actually fail on a capture run
- [ ] Wave 0 covers all MISSING references
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
