# Pastry Pirates

## What This Is

Pastry Pirates is a browser-based, pirate-themed pastry board game playable solo (against AI captains) or in real-time multiplayer via Firebase sync. Players sail a grid of islands gathering ingredients, trading, battling, fishing, and racing to bake a winning recipe. The v1.0 edit-pass milestone (shipped 2026-07-24) cleared a 15-item playtesting punch list. The v1.1 milestone (complete) split the ~5,200-line `index.html` monolith into native ES modules with no build step, folding in the deferred debt cleanups. The v1.2 milestone (in progress) is a second playtesting punch list — a critical multiplayer clock bug plus narration, turn-clock, and UI/UX polish, plus a Ko-Fi support button.

## Current Milestone: v1.2 Playtest Fixes & Polish

**Goal:** Clear a second live-playtest punch list — fix the critical multiplayer turn-clock stall, complete a narration audit + fixes, correct storm movement, and polish the turn clock and UI/UX — plus add a Ko-Fi support button. Larger new features (tutorial, sound effects, island redesign) are deferred to a later milestone.

**Target features:**
- Critical fix: multiplayer turn clock no longer starts paused / stalls the game before it begins; play/pause stays available in multiplayer
- Storm movement fix: the boat moves one square at a time across the full dir1+dir2 push (no more "dock held fast" while still a square away)
- Narration audit + fixes: prune repetitions, restore the missing "broke" line, rewrite the storm intro, make bribe and "anchored safely" lines context-smart, tighten on-screen timing
- Turn clock: the large PAUSED image becomes a clickable resume button
- UI/UX polish: consistent element padding, moveable-square sizing + hover, welcome-flow shortcut, lobby name-doubling fix, boat-image opacity, Google/social preview image + favicon
- Ko-Fi "Buy me a cookie" support button in the footer and credits modal

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

**v1.1 Monolith Refactor — complete (Phases 7–12, all verified)**

- ✓ `index.html` split into native ES modules (zero build step): UI in `src/ui/*`, orchestration in `src/orchestrator.js`, `src/main.js` composition root; `index.html` reduced to markup + one module entry; strangler-fig bridge removed; dependency graph acyclic (SPLIT-03/05/06) — Phase 11
- ✓ Firebase `.off()` watcher teardown — all 18 watchers registry-mediated with clean attach/detach (NET-01/02/03, SPLIT-04) — Phase 9
- ✓ Tamed 40+ globals behind a single `appState` object + module exports (GLOBAL-01/03) — Phase 10
- ✓ Hardened deterministic engine/replay module seams + regression harness; determinism 30/30 preserved (ENGINE-01/02/03, FOUND-04) — Phases 7–8
- ✓ Verification: expanded headless harness + Chrome MCP solo & multiplayer end-to-end + Safari storm re-verified (VERIFY-01…04) — Phase 12

### Active

<!-- v1.2 Playtest Fixes & Polish scope. Requirements defined in .planning/REQUIREMENTS.md. -->

- Critical: multiplayer turn-clock stall / starts-paused bug + play/pause available in MP — v1.2
- Storm one-square-at-a-time movement across the full dir1+dir2 push — v1.2
- Narration audit + fixes (prune repetition, restore missing line, storm intro, bribe/anchored context, timing) — v1.2
- Turn clock: clickable PAUSED resume button — v1.2
- UI/UX polish (padding, moveable squares, welcome flow, name-doubling, boat-image opacity, Google preview + favicon) — v1.2
- Ko-Fi support button (footer + credits) — v1.2

### Deferred to a later milestone (captured as Future in REQUIREMENTS.md)

- Interactive tutorial (30–60s guided walkthrough → auto-start solo game) + "How To Play" button — deferred from v1.2 as a large feature
- Sound effects (Luis's SFX) with default-on playback + mute button — deferred from v1.2 as a large feature
- Island redesign (all islands 4 squares, unique shapes, adjacent ingredients, art on empty square) — deferred; touches the deterministic board generation and warrants its own careful pass

### Out of Scope

- A bundler/minifier toolchain (Vite/esbuild) — native ES modules preserve the "no build step" principle; a bundler is a separate decision
- TypeScript migration — out of scope for this structural pass

## Context

- **Current state**: v1.0 edit pass shipped 2026-07-24. v1.1 monolith refactor complete (Phases 7–12) — `index.html` split into native ES modules under `src/`, globals tamed behind `appState`, Firebase watchers registry-mediated, determinism 30/30 and Safari storm re-verified. v1.2 is a second live-playtest punch list (see `notes/edits for pastry pirates-2.pdf`).
- **Codebase**: mapped in `.planning/codebase/`. As of v1.1, game logic/UI/networking are split into native ES modules under `src/` (engine, ui, net, orchestrator, main), loaded from a slim `index.html` via one `<script type="module">`. `lab.html` is a secondary/experimental page. `cocoa_pirates_sim.py` is a Python simulator. Assets and art in `assets/` and `art-review/`; sound effects staged in `sfx/` (for the deferred audio feature).
- **v1.2 playtesting source**: a second punch list from live Safari multiplayer testing, documented in `notes/edits for pastry pirates-2.pdf`. The critical item is a multiplayer turn-clock stall that blocks the game from starting.
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
| v1.2 splits the second punch list: fixes/polish now, big features later | Tutorial, sound effects, and island redesign are large enough (and the island redesign touches deterministic board generation) to warrant their own milestone; keeps v1.2 a fast polish pass | Pending — v1.2 |
| Ko-Fi button included in v1.2 despite a third-party ko-fi.com script embed | Small, self-contained monetization add Wyatt wants live now; approved with awareness of the external script | Pending — v1.2 |

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
*Last updated: 2026-07-25 — v1.2 Playtest Fixes & Polish milestone started (second punch list; tutorial/sound/island-redesign deferred)*
