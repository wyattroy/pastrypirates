# Requirements: Pastry Pirates — v1.1 Monolith Refactor

**Defined:** 2026-07-24
**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state. This refactor must preserve that value: gameplay and deterministic multiplayer stay intact while the monolith becomes modular.

## v1 Requirements

Requirements for the v1.1 milestone. Each maps to a roadmap phase. Behavior may change **only** via the three approved cleanups (Firebase `.off()`, de-globalization, engine/replay hardening); all other gameplay stays identical.

### Foundation & Zero-Build (FOUND)

- [x] **FOUND-01**: Repo has a root `package.json` with `"type": "module"` so engine modules import identically in the browser and in Node
- [x] **FOUND-02**: The game loads and plays from a static HTTP server via `<script type="module">` with no bundler/build step
- [x] **FOUND-03**: Firebase compat SDK v12.15.0 stays as classic (non-module) script tags loaded before the module entry point (no init race)
- [x] **FOUND-04**: A golden-fixture determinism baseline (seeded replay corpus) is captured from the pre-refactor monolith to serve as the regression oracle
- [x] **FOUND-05**: The module-loading + local-dev contract is documented (HTTP server required, `file://` unsupported, `.js` MIME expectations for production)

### Module Split (SPLIT)

- [x] **SPLIT-01**: The deterministic engine (Game class, roundCfg, bot strategies, RNG, replay) lives in its own DOM-free, Firebase-free ES module(s)
- [x] **SPLIT-02**: Shared constants and pure helpers (ING_ALL, DIRS, `man`, `shuffle`, `mulberry32`, image maps) live in leaf modules importable by engine, UI, net, and Node harnesses
- [x] **SPLIT-03**: UI rendering (render/board/DOM/modals/narration) lives in its own module(s) that read game state and never import the networking layer
- [x] **SPLIT-04**: Firebase multiplayer sync lives in its own networking module(s) that never import the UI layer
- [x] **SPLIT-05**: A `main` entry module orchestrates engine + UI + networking; `index.html` is reduced to markup + a single module entry point
- [x] **SPLIT-06**: The module dependency graph is acyclic, verified by a cycle-detection scan (`madge` or equivalent)

### Engine & Replay Hardening (ENGINE)

- [x] **ENGINE-01**: The engine module is pure — no DOM, `window`, Firebase, or wall-clock/unseeded-random access; the 3 asset/DOM bootstrapping touches currently inside the engine region are relocated out
- [x] **ENGINE-02**: Node test harnesses import the engine module natively (retiring the current `vm`/string-slice extraction of `index.html`), landing in the same commit as engine extraction
- [x] **ENGINE-03**: Seeded gameplay + replay output is byte-for-byte identical to the pre-refactor baseline across the regression corpus
- [x] **ENGINE-04**: Order-load-bearing constants (DIRS/PERP/OPPOSITE and any object literal feeding `this.r()`) are preserved and annotated so iteration order cannot silently change

### Networking Cleanup (NET)

- [x] **NET-01**: Every Firebase `.on()` watcher has a matching `.off()` teardown — no leaked or stale listeners across the game/room lifecycle (all 18 watchers now route through the single registry in `src/net/`; verified 2026-07-24 by `scripts/net_contract_check.js`'s watcher-inventory-completeness assertion and independent grep confirmation, plus 09-05's behavioral NET-03 probe)
- [x] **NET-02**: Watchers are registered and torn down through a single registry so cleanup is consistent and callback references match exactly
- [x] **NET-03**: A guest reconnect / leave-and-rejoin cycle leaves zero dangling listeners, verified behaviorally (reconnect-and-count), not just by code review (09-05's full 18-watcher same-tab attach/detach/re-attach probe against live Firebase — see `09-05-SUMMARY.md` Transcript A)

### De-globalization (GLOBAL)

- [x] **GLOBAL-01**: The 40+ implicit globals (`game`, `myId`, `room`, `db`, …) are encapsulated behind module exports / an app-state module instead of `window` globals (10-05: all 46 of 46 names now migrated — `state_contract_check.js` 5/5 PASS; 10-06 remains to wire the contract check into `npm test`'s chain, D-11)
- [x] **GLOBAL-02**: Every `onclick` handler continues to work after de-globalization (verified count 2026-07-24: **1** inline HTML `onclick="…"` attribute — `revealMyRecipe()` at `index.html:1731`, template-generated, resolves globally — and **40** JS `.onclick=` closure assignments that capture scope and are inherently safe. The "41 inline" figure was a conflation. The real GLOBAL-02 risk is the 1 global-resolving inline attribute plus any bare app-state identifiers the closures read. 10-04 confirmed `revealMyRecipe` stays a reachable `function` declaration with a byte-identical inline attribute — the inline-handler risk is closed; not marked complete until the remaining 3 app-state names are migrated so no closure can read a stale bare identifier.)
- [x] **GLOBAL-03**: A single documented mechanism exists for test/debug state access — if any `window` bridge is retained (e.g. `window.__pp_debug` for the Chrome MCP harness), it is intentional and named

### Verification (VERIFY)

- [x] **VERIFY-01**: The headless replay/determinism harness is expanded to cover the regression corpus and runs green post-refactor
- [x] **VERIFY-02**: Claude-driven Chrome MCP end-to-end tests exercise the full solo gameplay loop (sail, dock, trade, battle, fish, storm, end-of-voyage)
- [ ] **VERIFY-03**: Claude-driven Chrome MCP end-to-end tests exercise a full multiplayer game across two browser tabs (host + guest) with deterministic sync intact
- [ ] **VERIFY-04**: Manual Safari + Chrome playtests confirm no perf/compat regressions — including storm rendering and multiplayer pause/refresh state

## v2 Requirements

Deferred to a future milestone. Tracked but not in this roadmap.

### Networking Modernization

- **NETMOD-01**: Migrate from Firebase compat SDK to the modular v9+ SDK (cleaner `.off()`/unsubscribe story via `onValue()`)

### Developer Ergonomics

- **DX-01**: JSDoc typedefs for event objects (`{t, a, d, …}`) to reduce loosely-typed event bugs
- **DX-02**: Isolated pure replay-runner function extracted proactively (pursue only if the replay seam surfaces bugs during extraction)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Bundler / minifier toolchain (Vite/esbuild/rollup) | Native ES modules preserve the "no build step" principle; a bundler is a separate, revisitable decision |
| TypeScript migration | Out of scope for a structural pass; would multiply blast radius |
| New game modes, mechanics, or content | Still expansion, not this refactor milestone |
| Renaming / style normalization during code motion | Riding cleanups on the move obscures byte-for-byte diffs and risks determinism regressions |
| `file://` local-play support | Dropped intentionally — module scripts require an HTTP origin; local dev uses the test server |
| Modular Firebase SDK migration | Deferred to v2 (NETMOD-01) — full networking rewrite, incompatible with byte-for-byte determinism gate this milestone |

## Traceability

Which phases cover which requirements. Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 7 | Complete |
| FOUND-02 | Phase 7 | Complete |
| FOUND-03 | Phase 7 | Complete |
| FOUND-04 | Phase 7 | Complete |
| FOUND-05 | Phase 7 | Complete |
| SPLIT-01 | Phase 8 | Complete |
| SPLIT-02 | Phase 8 | Complete |
| SPLIT-03 | Phase 11 | Complete |
| SPLIT-04 | Phase 9 | Complete |
| SPLIT-05 | Phase 11 | Complete |
| SPLIT-06 | Phase 11 | Complete |
| ENGINE-01 | Phase 8 | Complete |
| ENGINE-02 | Phase 8 | Complete |
| ENGINE-03 | Phase 8 | Complete |
| ENGINE-04 | Phase 8 | Complete |
| NET-01 | Phase 9 | Complete |
| NET-02 | Phase 9 | Complete |
| NET-03 | Phase 9 | Complete |
| GLOBAL-01 | Phase 10 | Complete |
| GLOBAL-02 | Phase 10 | Complete |
| GLOBAL-03 | Phase 10 | Complete |
| VERIFY-01 | Phase 12 | Complete |
| VERIFY-02 | Phase 12 | Complete |
| VERIFY-03 | Phase 12 | Pending |
| VERIFY-04 | Phase 12 | Pending |

**Coverage:**

- v1 requirements: 25 total
- Mapped to phases: 25 ✓
- Unmapped: 0

**Per-phase counts:** Phase 7 (5) · Phase 8 (6) · Phase 9 (4) · Phase 10 (3) · Phase 11 (3) · Phase 12 (4) = 25

---
*Requirements defined: 2026-07-24*
*Last updated: 2026-07-24 — traceability populated during v1.1 roadmap creation*
</content>
