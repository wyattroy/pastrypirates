# Pastry Pirates

## What This Is

Pastry Pirates is a browser-based, pirate-themed pastry board game playable solo (against AI captains) or in real-time multiplayer via Firebase sync. Players sail a grid of islands gathering ingredients, trading, battling, fishing, and racing to bake a winning recipe. The v1.0 edit-pass milestone (shipped 2026-07-24) cleared a 15-item playtesting punch list — two urgent playability bugs plus battle, AI, narration, UI/UX, bot, and end-of-voyage improvements. The v1.1 milestone (in progress) tackles the long-deferred monolith refactor: splitting the ~5,200-line `index.html` into native ES modules with no build step, while folding in the debt cleanups that ride along with the split.

## Current Milestone: v1.1 Monolith Refactor

**Goal:** Split the ~5,200-line `index.html` monolith into native ES modules with no build step, preserving gameplay, Safari support, and deterministic multiplayer — while folding in the debt cleanups that ride along with the split.

**Target features:**
- Structural split — extract engine, UI rendering, and Firebase networking into separate `.js` modules loaded via `<script type="module">`; boundaries locked during planning after mapping real coupling
- Cleanup: Firebase `.off()` teardown for `.on()` watchers (fix memory leaks / stale handlers)
- Cleanup: tame the 40+ globals behind module exports / an app-state object instead of `window` globals
- Cleanup: harden the deterministic engine/replay seams with clean module boundaries + regression tests (no change to the algorithm)
- Verification: expanded headless replay/test harness, Claude-driven Chrome MCP end-to-end gameplay testing (solo + multiplayer), and manual Safari/multiplayer playtests

## Core Value

The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

## Requirements

### Validated

<!-- Inferred from existing shipped code (see .planning/codebase/). -->

- ✓ Browser-based pastry pirate board game (grid of islands, ingredient gathering, recipe baking) — existing
- ✓ Solo play against AI captains — existing
- ✓ Real-time multiplayer via Firebase with deterministic engine + replay — existing
- ✓ Battle system with broadside/wind mechanics — existing
- ✓ Trading, fishing, and storm/wind systems — existing
- ✓ Narration system for game events — existing
- ✓ End-of-voyage summary with stats and badges — existing
- ✓ Bot personality selection in multiplayer lobby — existing (removed in v1.0 — now hardcoded per captain)

**v1.0 Edit Pass — shipped 2026-07-24** (all 15 punch-list items, git-verified on `main`)

- ✓ Safari storm no longer near-crashes — storm rain renders from a pre-baked PNG tile; narration box height snaps instead of animating (BUG-01) — v1.0
- ✓ Multiplayer timer pause/unpause stays interactive; refresh restores the in-progress voyage instead of resetting; deterministic engine survives the cycle (BUG-02/03/04) — v1.0
- ✓ Battle reflips removed (attacker + wind advantage); no post-battle position swap (BATL-01/02/03) — v1.0
- ✓ Bots play the new no-reflip mechanics, weigh wind, trade with whoever holds more of the resource, escape when boxed in, and no longer lose every game (AI-01…06) — v1.0
- ✓ Narration pass — icon-before-name docking, trade cooperation line, "it's still" vs "now", sustained-wind gusts, 20% faster pacing, empty-island grab-3 (NARR-01…05, 07) — v1.0
- ✓ Storm-text audit delivered to Wyatt and his rewrite applied (NARR-06) — v1.0
- ✓ UI/UX polish — clock cropping + orange countdown, longer boat/fish animations, compass STORM label removed, juicier movable squares, leave-game modal, parley Back, Flippenator, feedback copy (UI-01…10) — v1.0
- ✓ Bot personalities hardcoded per captain; lobby picker removed (BOT-01/02) — v1.0
- ✓ End of voyage — win no longer announced in the blue box, gets its own recipe-image box, Unluckiest-pirate badge, redesigned 5-badge set (approved), confetti celebration (EOV-01…05) — v1.0

**v1.1 Monolith Refactor — in progress**

- ✓ `index.html` split into native ES modules (zero build step): UI in `src/ui/*`, orchestration in `src/orchestrator.js`, `src/main.js` composition root; `index.html` reduced to markup + one module entry; strangler-fig bridge removed; dependency graph acyclic; determinism 30/30 and Safari storm both re-verified (SPLIT-03/05/06) — Validated in Phase 11

### Active

<!-- v1.1 Monolith Refactor scope. Requirements defined in .planning/REQUIREMENTS.md. -->

- Firebase `.off()` watcher teardown cleanup — v1.1
- Tame 40+ globals behind module exports / app-state object — v1.1
- Harden deterministic engine/replay module seams + regression tests — v1.1
- Verification: expanded harness + Claude-driven Chrome MCP end-to-end tests + Safari/MP playtests — v1.1

### Out of Scope

- New game modes or mechanics — still expansion, not this refactor milestone
- A bundler/minifier toolchain (Vite/esbuild) — native ES modules preserve the "no build step" principle; a bundler is a separate decision
- TypeScript migration — out of scope for this structural pass

## Context

- **Current state**: v1.0 edit pass shipped 2026-07-24 — all 15 punch-list items merged to `main` (git range `f825ae2`…`d7d7a86`, 22 files, ~1,929 insertions / ~292 deletions). New headless test harness `scripts/dlog_replay_test.js` covers replay-shortfall detection.
- **Codebase**: mapped in `.planning/codebase/`. Game logic, UI, and multiplayer sync live in a single ~5,200-line `index.html`. `lab.html` is a secondary/experimental page. `cocoa_pirates_sim.py` is a Python simulator. Assets and art in `assets/` and `art-review/`.
- **Known debt relevant to this work**: 40+ global variables, Firebase `.on()` watchers registered without `.off()` cleanup (memory leaks / stale handlers), a deterministic engine + replay system that is fragile — all three intersect the two urgent bugs.
- **Playtesting source**: the 15-item punch list came from a live multiplayer game (~7pm ET) plus Safari testing, documented in `notes/edits for pastry pirates.pdf`.
- **Multiplayer test harness**: Chrome tabs + Firebase; shared-localStorage `pp_id` gotcha; synthetic-prompt injection for deterministic remote-render checks (see MEMORY.md).

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS in `index.html`, Firebase Realtime DB for multiplayer — edits happen in place, no framework introduction
- **Compatibility**: Must run correctly in Safari (the storm perf bug is Safari-specific) and Chrome
- **Determinism**: The multiplayer deterministic engine + replay must remain intact — timer/pause fixes must not break lockstep state
- **Approval gates**: End-of-voyage badge redesign and storm-text rewrite require Wyatt's explicit sign-off before/within implementation

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sequence critical bugs (Safari storm perf + MP timer pause) first as Phase 1 | They break core playability; everything else is polish on a working game | ✓ Good — shipped v1.0 |
| Fix in place rather than refactor the monolith | Edit pass scope; refactor is large and separately tracked as out of scope | ✓ Good — shipped v1.0 |
| Mockup-then-approve gate for end-of-voyage badges | Wyatt explicitly wants to approve badge presentation before build | ✓ Good — mockup approved, badges shipped v1.0 |
| Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated | ✓ Good — audit delivered, rewrite applied v1.0 |
| Hardcode bot personalities to captain identities | Removes lobby choice; personalities become part of each captain's character | ✓ Good — shipped v1.0 |
| Real Safari storm fix was pre-baked PNG rain, not the typewriter batch | First hypothesis (per-char DOM writes) helped but the compositing cost was the storm rain; PNG tile was the actual fix | ✓ Good — Safari-verified v1.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-25 — Phase 11 complete (index.html split into native ES modules; strangler-fig bridge removed; Chrome + Safari re-verified)*
