# Roadmap: Pastry Pirates

## Milestones

- ✅ **v1.0 Edit Pass** — Phases 1–6 (shipped 2026-07-24)
- 🚧 **v1.1 Monolith Refactor** — Phases 7–12 (in progress)

## Phases

<details>
<summary>✅ v1.0 Edit Pass (Phases 1–6) — SHIPPED 2026-07-24</summary>

Full detail archived in [`milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md).

- [x] Phase 1: Critical Bug Fixes — Safari storm no longer near-crashes; MP timer pause/refresh no longer destroys game state (BUG-01…04)
- [x] Phase 2: Battle & AI Overhaul — reflip-free, swap-free battles; smarter, fairer bots (BATL-01…03, AI-01…06)
- [x] Phase 3: Narration System — accuracy, pacing, sustained-wind + empty-island lines; storm-text audit & rewrite (NARR-01…07)
- [x] Phase 4: UI/UX Polish — clock, boats, fish, compass, squares, modals, parley, Flippenator, copy (UI-01…10)
- [x] Phase 5: Bot Personalities — hardcoded per captain, lobby picker removed (BOT-01/02)
- [x] Phase 6: End of Voyage Celebration — win box, Unluckiest-pirate badge, redesigned badges, confetti (EOV-01…05)

</details>

### 🚧 v1.1 Monolith Refactor (In Progress)

**Milestone Goal:** Split the ~5,200-line `index.html` monolith into native ES modules with no build step, preserving gameplay, Safari support, and deterministic multiplayer — while folding in the three approved debt cleanups (Firebase `.off()` teardown, de-globalization, engine/replay hardening). A strangler-fig sequence keeps the game runnable and determinism-verifiable at every phase boundary.

- [ ] **Phase 7: Foundation & Determinism Baseline** - Zero-build module-loading contract + golden-fixture regression oracle, game unchanged
- [ ] **Phase 8: Engine Extraction & Node Harness Migration** - Pure DOM-free engine module Node imports natively, byte-for-byte identical (critical path)
- [ ] **Phase 9: Networking Layer & Watcher Cleanup** - Firebase sync in its own module with a registry and `.off()` teardown, zero leaked listeners
- [ ] **Phase 10: App State & De-globalization** - 40+ globals encapsulated behind an app-state module, all inline handlers still work
- [ ] **Phase 11: UI Extraction, Orchestration & Bridge Removal** - UI module + `main` composition root, `index.html` reduced to markup, acyclic graph, bridge gone
- [ ] **Phase 12: Verification & Validation** - Expanded harness green + Chrome-MCP solo/MP E2E + manual Safari/Chrome playtests

## Phase Details

### Phase 7: Foundation & Determinism Baseline

**Goal**: Establish the zero-build module-loading contract and capture the determinism regression oracle before any code moves — with the game still fully playable and behaviorally unchanged.
**Depends on**: Nothing (first phase of v1.1)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):

  1. A root `package.json` declares `"type": "module"`, so the same engine `.js` file imports identically in Node and the browser (proven by a trivial import in both).
  2. The game loads and plays from a static HTTP server via a `<script type="module">` entry point, with the Firebase compat SDK v12.15.0 loaded as classic (non-module) scripts before it and no init race.
  3. A seeded golden-fixture replay corpus is captured from the pre-refactor monolith and stored as the byte-for-byte regression oracle for all later phases.
  4. The module-loading + local-dev contract is documented (HTTP server required, `file://` unsupported, `.js` MIME expectations for production).
  5. A solo game played after the foundation changes is behaviorally identical to `main` (no gameplay change — code has not moved yet).

**Plans**: 3 plans

Plans:
**Wave 1**

- [ ] 07-01-PLAN.md — Determinism oracle: `package.json` + ESM harness conversion + `load_engine.js` seam + committed 30-seed golden corpus (wave 1, `index.html` untouched)

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 07-02-PLAN.md — Module-loading contract: `src/main.js` entry, one module script tag in `index.html`, `docs/MODULES.md` (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 07-03-PLAN.md — Browser verification: Chrome + Safari page load, module marker, solo playthrough (wave 3, blocking checkpoint)

### Phase 8: Engine Extraction & Node Harness Migration

**Goal**: Extract the deterministic engine into pure, DOM-free/Firebase-free ES modules that the Node harnesses import natively, producing byte-for-byte identical seeded output against the baseline. This is the critical path.
**Depends on**: Phase 7
**Requirements**: SPLIT-01, SPLIT-02, ENGINE-01, ENGINE-02, ENGINE-03, ENGINE-04
**Success Criteria** (what must be TRUE):

  1. Shared constants and pure helpers (`ING_ALL`, `DIRS`, `man`, `shuffle`, `mulberry32`, image maps) live in leaf modules importable by engine, UI, net, and the Node harnesses.
  2. The Game class, `roundCfg`, bot strategies, RNG, and replay live in their own ES module(s) with zero DOM, `window`, Firebase, or wall-clock/unseeded-random access — the 3 asset/DOM bootstrapping touches are relocated out.
  3. The Node test harnesses (`real_game_test.js`, `dlog_replay_test.js`) import the engine module natively — the `vm`/string-slice extraction of `index.html` is retired — landing in the same commit as engine extraction.
  4. Seeded gameplay + replay output is byte-for-byte identical to the Phase 7 golden baseline across the full regression corpus.
  5. Order-load-bearing constants (`DIRS`/`PERP`/`OPPOSITE` and any object literal feeding `this.r()`) are preserved and annotated so iteration order cannot silently change.

**Plans**: TBD

### Phase 9: Networking Layer & Watcher Cleanup

**Goal**: Move Firebase multiplayer sync into its own networking module and fix the `.off()` leak class through a single watcher registry, leaving zero dangling listeners across the room lifecycle.
**Depends on**: Phase 8
**Requirements**: SPLIT-04, NET-01, NET-02, NET-03
**Success Criteria** (what must be TRUE):

  1. Firebase multiplayer sync lives in its own networking module(s) that never import the UI layer.
  2. Every Firebase `.on()` watcher (all 14, up from 1 torn down today) has a matching `.off()` teardown registered and removed through a single watcher registry with exact callback-reference matching.
  3. A guest reconnect / leave-and-rejoin cycle leaves zero dangling listeners, verified behaviorally by a reconnect-and-count check — not code review alone.
  4. A multiplayer game across two browser tabs still syncs deterministically after the extraction (host + guest smoke test passes).

**Plans**: TBD

### Phase 10: App State & De-globalization

**Goal**: Encapsulate the 40+ implicit globals behind an app-state module while keeping every inline handler working through a single documented mechanism.
**Depends on**: Phase 9
**Requirements**: GLOBAL-01, GLOBAL-02, GLOBAL-03
**Success Criteria** (what must be TRUE):

  1. The 40+ implicit globals (`game`, `myId`, `room`, `db`, …) are encapsulated behind module exports / an app-state module instead of bare `window` globals.
  2. All 41 inline `onclick` handlers still work after de-globalization (migrated to `addEventListener` or an explicit, documented `window.PP` bridge), verified by a click-through of every handler.
  3. Any retained `window` bridge for test/debug state access (e.g. `window.__pp_debug` for the Chrome-MCP harness) is intentional, single, and named/documented.
  4. A full solo game and a multiplayer game both remain playable with no new console `no-undef`/`ReferenceError` regressions.

**Plans**: TBD

### Phase 11: UI Extraction, Orchestration & Bridge Removal

**Goal**: Complete the split — UI rendering becomes its own module, a `main` entry orchestrates all layers, `index.html` is reduced to markup, the dependency graph is proven acyclic, and the temporary strangler-fig bridges are removed.
**Depends on**: Phase 10
**Requirements**: SPLIT-03, SPLIT-05, SPLIT-06
**Success Criteria** (what must be TRUE):

  1. UI rendering (render/board/DOM/modals/narration) lives in its own module(s) that read game state and never import the networking layer.
  2. A `main` entry module orchestrates engine + UI + networking, and `index.html` is reduced to markup plus a single module entry point.
  3. The temporary window bridge introduced in earlier phases is deleted, with a grep confirming no leftover bare-global reads remain.
  4. The module dependency graph is acyclic, verified by a cycle-detection scan (`madge` or equivalent).
  5. Storm rendering re-verifies cleanly on Safari after UI extraction (no perf/compat regression at this phase boundary).

**Plans**: TBD
**UI hint**: yes

### Phase 12: Verification & Validation

**Goal**: Prove the refactor correct end-to-end — determinism harness green, automated solo + multiplayer E2E passing, and manual Safari/Chrome playtests confirming no perf or compat regressions.
**Depends on**: Phase 11
**Requirements**: VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04
**Success Criteria** (what must be TRUE):

  1. The headless replay/determinism harness, expanded to cover the full regression corpus, runs green post-refactor.
  2. Claude-driven Chrome-MCP E2E tests exercise the full solo gameplay loop (sail, dock, trade, battle, fish, storm, end-of-voyage) and pass.
  3. Claude-driven Chrome-MCP E2E tests exercise a full multiplayer game across two browser tabs (host + guest) with deterministic sync intact.
  4. Manual Safari + Chrome playtests confirm no perf/compat regressions — including storm rendering and multiplayer pause/refresh state.

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 7 → 8 → 9 → 10 → 11 → 12

| Phase | Milestone | Plans Complete | Status | Completed |
| ----- | --------- | -------------- | ------ | --------- |
| 1. Critical Bug Fixes | v1.0 | — | Complete | 2026-07-24 |
| 2. Battle & AI Overhaul | v1.0 | — | Complete | 2026-07-24 |
| 3. Narration System | v1.0 | — | Complete | 2026-07-24 |
| 4. UI/UX Polish | v1.0 | — | Complete | 2026-07-24 |
| 5. Bot Personalities | v1.0 | — | Complete | 2026-07-24 |
| 6. End of Voyage Celebration | v1.0 | — | Complete | 2026-07-24 |
| 7. Foundation & Determinism Baseline | v1.1 | 0/3 | Not started | - |
| 8. Engine Extraction & Node Harness Migration | v1.1 | 0/TBD | Not started | - |
| 9. Networking Layer & Watcher Cleanup | v1.1 | 0/TBD | Not started | - |
| 10. App State & De-globalization | v1.1 | 0/TBD | Not started | - |
| 11. UI Extraction, Orchestration & Bridge Removal | v1.1 | 0/TBD | Not started | - |
| 12. Verification & Validation | v1.1 | 0/TBD | Not started | - |
</content>
</invoke>
