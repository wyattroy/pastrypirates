# Project Research Summary

**Project:** Pastry Pirates v1.1 Monolith Refactor
**Domain:** Zero-build native-ES-module refactor of a vanilla HTML/CSS/JS browser game with deterministic multiplayer Firebase sync
**Researched:** 2026-07-24
**Confidence:** HIGH (grounded in direct codebase inspection + verified platform behavior)

## Executive Summary

Pastry Pirates v1.1 refactors the 5,639-line `index.html` monolith into ~6 native ES modules (engine, state, UI, networking, orchestration) without introducing a build step, bundler, or framework. The project preserves the existing vanilla-JS + Firebase-compat-SDK stack while eliminating 40+ implicit global variables, fixing a Firebase `.off()` memory-leak class, and—most critically—hardening the deterministic engine boundary so it becomes importable by Node test harnesses with zero DOM/Firebase dependencies.

The recommended approach is a strangler-fig extraction sequence: validate golden-fixture baseline regression tests, extract pure-engine modules first (constants, RNG, Game class, bot strategies), migrate Node test harnesses to native imports (not string-slicing), then progressively extract UI and networking layers against a mediator state module. This ordering ensures zero-downtime verification at every step, keeps determinism intact (the core value at risk), and avoids the highest-blast-radius pitfalls (RNG desync, circular imports, broken onclick handlers, module-loading timing races).

**Key risks:** (1) RNG call-sequence desync if object-key iteration order changes during code motion—byte-for-byte regression testing is non-negotiable; (2) Module defer timing race with Firebase CDN initialization—requires explicit synchronization contract before extracting; (3) Silent breakage of 41 inline `onclick` handlers if globals disappear without a bridge; (4) `file://` protocol stops working entirely (module CORS requirement)—local dev must move to HTTP server. All are preventable with the detailed mitigations documented in PITFALLS.md.

## Key Findings

### Recommended Stack
- **Native ES modules:** Browser built-in, zero bundler, direct browser import/export for file-scoped variables
- **Firebase compat v12.15.0:** Stays unchanged (modular v9+ swap is a full networking rewrite, out of scope)
- **Node >= 20:** Dev-only, for test harnesses + madge/eslint
- **`package.json` with `"type": "module"`:** Enables same `js/engine.js` file to be `<script type="module">` by browser AND `import`-ed by Node
- **Python3 `http.server`:** Local dev server (replaces `file://`)
- **Dev dependencies:** madge (circular detection), eslint (optional, for `no-undef`), node:test (optional)

**Confidence: HIGH** — verified against npm registry, Node.js official docs, Firebase upgrade docs, local environment checks.

### Expected Features
**Must have (v1.1 launch):**
- `constants.js` + `utils.js` leaf module (zero risk, unblocks everything)
- `engine.js` as pure, DOM-free Game class (highest-value, highest-risk extraction)
- Updated Node harnesses importing engine directly (retiring vm/string-slice extraction)
- `ui-renderer.js`, `networking.js` with `.off()` teardown (fixes real memory leaks)
- App-state de-globalization module
- `main.js` orchestrator; `index.html` reduced to markup + entry point
- Chrome-MCP e2e + manual Safari/multiplayer validation

**Should have (if time allows):**
- Firebase watcher registry abstraction
- Isolated pure replay-runner function
- JSDoc typedefs for event objects

**Anti-features (explicitly wrong):**
- Reactive frameworks, bundlers, TypeScript, dozens of micro-modules, internal renaming, new features

**Confidence: MEDIUM-HIGH** — codebase grounding is HIGH; general patterns are consensus-aligned.

### Architecture Approach
**Target structure:**
```
js/engine/      — constants.js, rng.js, bots.js, engine.js, replay.js (pure, zero I/O)
js/state/       — app-state.js (replaces 40+ globals, mediator pattern)
js/ui/          — render.js, assets.js, board.js, modals.js (reads state only)
js/net/         — firebase-client.js (watcher registry), room.js, sync.js (never imports ui)
main.js         — composition root
index.html      — markup + <script type="module" src="js/main.js">
```

**Key patterns:**
1. **Pure-core/impure-shell:** Engine has zero DOM/window/firebase/unseeded randomness
2. **State mediator:** Single module-scoped `subscribe()/notify()` without framework
3. **Firebase watcher registry:** `watch(id, path, cb)` + `unwatchAll()` fixes .off() leaks
4. **Node ESM harness:** Direct `import { Game } from 'js/engine.js'` (no string-slicing)

**Extraction order (9 steps, never broken):**
1. Golden-fixture baseline (oracle for all future steps)
2. Extract engine/* with temporary window bridge
3. Migrate Node harnesses immediately (same commit)
4. Extract net/* with watcher registry
5. Extract state/app-state.js
6. Extract ui/* (can be sub-phased)
7. Extract net/sync.js
8. Delete legacy window bridge
9. Full regression pass

**Confidence: HIGH** — grounded in direct line-by-line inspection of index.html + 2026-07-22 codebase audit.

### Critical Pitfalls (9 documented failure modes)

1. **RNG/iteration-order desync** — Object.keys() reordering silently changes RNG sequence → replays diverge. *Prevention:* Byte-for-byte regression testing + mark constants `// ORDER IS LOAD-BEARING`.

2. **Module defer timing race** — `<script type="module">` always deferred; Firebase could theoretically init after module code reads it. *Prevention:* Keep Firebase CDN tags as classic scripts; verify availability with `console.assert`.

3. **De-globalization breaks inline onclick** — 41 inline handlers resolve function names against `window`. *Prevention:* Grep all handlers; audit + migrate to `addEventListener` OR explicit `window.PP` bridge.

4. **File:// protocol stops working** — Module scripts require CORS; null-origin blocks module loads. *Prevention:* Require HTTP server for all dev; verify production MIME type.

5. **Firebase `.off()` mismatched callback reference** — Only detaches if callback is exact same reference as `.on()` call. *Prevention:* Registry pattern + named functions; verify by reconnect test.

6. **Node harnesses break on engine extraction** — String-slicing extraction markers vanish when engine moves. *Prevention:* Migrate harnesses to `import` in same commit as extraction.

7. **Circular imports produce TDZ ReferenceError** — Top-level cross-references can throw if one module reads uninitialized binding. *Prevention:* Map real coupling before splitting; enforce dependency direction; test isolation.

8. **Hoisting/TDZ from forward references** — Top-level constant derivation depends on import order. *Prevention:* Audit side effects; move nontrivial setup to explicit `init()`.

9. **Safari module-loading regressions** — Safari has historically stricter module behavior; prior storm-crash precedent is real. *Prevention:* Explicit Safari testing per phase (cold cache, private window); explicit storm re-verification.

**Confidence: HIGH** — all grounded in direct source inspection with line numbers or verified against MDN/Firebase docs.

## Implications for Roadmap

### Suggested Phase Structure (8 phases)

**Phase 1: Foundation & Verification Infrastructure**
- Capture golden-fixture baseline (2000+ seeded games pre-refactor)
- Create `package.json` with `"type": "module"`
- Verify production static host MIME type
- Document module-loading contract

**Phase 2: Engine Module Extraction & Node Harness Migration** *(critical path)*
- Extract `js/engine/*` (constants, rng, bots, engine, replay) with window bridge
- Migrate `scripts/real_game_test.js` + `dlog_replay_test.js` to native imports (same commit)
- Run golden-fixture regression (byte-for-byte match required)

**Phase 3: Firebase & Networking Layer**
- Extract `js/net/firebase-client.js` + room.js + sync.js
- Introduce watcher registry + `.off()` teardown
- Manual multiplayer smoke test + guest-reconnect verification

**Phase 4: App State & De-globalization**
- Extract `js/state/app-state.js` (replaces 40+ globals)
- Audit + test all 41 inline `onclick` handlers (explicit click-through checklist)

**Phase 5: UI Rendering Module**
- Extract `js/ui/*` (render, assets, board, modals) with `state.subscribe(render)`
- Can be sub-phased (render.js first, board.js/modals.js after)
- Explicit storm-rendering re-verification on Safari

**Phase 6: Main Orchestration & Bridge Removal**
- Extract `js/main.js` (composition root)
- Delete temporary window bridges
- Grep for any leftover bare-global reads

**Phase 7: Full Regression & Hardening**
- Golden-fixture regression (byte-for-byte across seeds 0–999)
- Circular-dependency scan (`madge`, optional ESLint)

**Phase 8: Verification & Validation (Chrome MCP + Manual)**
- Chrome MCP e2e tests (solo + multiplayer)
- Manual Safari + Chrome playtests on production domains
- Cold-cache module-fetch timing verification

### Phase Ordering Rationale
1. **Engine first:** Highest-value, highest-risk extraction; unblocks everything else; forms the regression oracle
2. **Harnesses immediately after:** Proves engine extraction didn't break behavior; provides continuous verification signal
3. **Networking before state:** Networking relies on engine imports; state can consume either
4. **State before UI:** State mediator removes UI/net circular dependency risk
5. **UI extraction:** Lowest risk once state exists; can be sub-phased
6. **Main orchestration last:** Depends on all pieces being real modules
7. **Regression + validation at end:** Gate on byte-for-byte parity + Safari verification

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Networking):** Firebase `.off()` verification test harness — clarify whether automated (Chrome MCP) or manual checklist
- **Phase 4 (De-globalization):** Inline `onclick` audit — characterize all 41 handlers upfront to scope work
- **Phase 8 (Verification):** Chrome MCP coverage scope — clarify solo/multiplayer/storm conditions and infrastructure

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Standard baseline capture + documentation
- **Phase 5–7:** Mechanical extraction following established dependency graph
- **Phase 8:** Standard e2e + manual testing (no novel patterns)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Verified against npm, Node.js docs, Firebase upgrade docs, local environment. Only MEDIUM on GitHub Pages MIME (assumed correct, not independently testable). |
| **Features** | HIGH | Codebase grounding is direct (index.html inspection). MVP structure matches existing ARCHITECTURE.md. General patterns are consensus-aligned. |
| **Architecture** | HIGH | Grounded in line-by-line inspection of monolith + 2026-07-22 codebase audit. Module graph and extraction order explicit and justified. Only MEDIUM on Safari edge cases (must be verified empirically per Pitfall 9). |
| **Pitfalls** | HIGH | All 9 grounded in direct source inspection or official platform docs. Recovery strategies documented. Each has explicit prevention checklist. |

**Overall: HIGH**

Low-confidence gaps (need validation during execution):
- Exact Safari module-loading behavior on production domains
- Production host MIME type for `.js` files
- Cold-cache module-fetch timing on throttled Safari networks

## Gaps to Address

1. **Chrome MCP test scope:** Clarify what the Chrome-MCP e2e tests should cover (solo only? multiplayer? storm conditions?). Is there existing infrastructure or does this require new test code?

2. **Safari .js MIME type verification:** Must verify `curl -I` against deployed `.js` files on production host *before* shipping (hard blocker if wrong).

3. **Inline `onclick` audit scope:** Audit all 41 handlers now, categorize by gameplay/admin/debug/deletable, to inform Phase 4 scope.

4. **Firebase `.off()` test harness:** Define how Phase 3's reconnect-and-count verification is automated (Chrome MCP driven? Manual? Instrumented callbacks?).

5. **Debug state access:** If Chrome MCP test harness needs to read `window.game` or other internal state, decide now: `export const state` (imported), or intentional `window.__pp_debug` bridge (testing-only). Affects Phase 4 + Phase 6 design.

6. **Battle simulator scope:** Confirm whether `scripts/battle_sim.js` (hand-written reimplementation, explicitly untrusted) stays independent or should be refactored to use imported engine. Currently documented as untrusted, so probably stays standalone.

## Sources

**Primary (HIGH confidence):**
- Direct inspection: `index.html` (5,639 lines with specific line numbers cited)
- Prior audit: `.planning/codebase/` docs (2026-07-22, `/gsd-map-codebase`)
- Official docs: Node.js ESM, npm registry, Firebase upgrade guides, Python mimetypes
- Local verification: Python 3.9.6 MIME mapping, Node v25.9.0

**Secondary (MEDIUM confidence):**
- Web standards: MDN on `<script type="module">`, module timing, CORS, file:// protocol
- Community consensus: Native-ESM patterns (Philip Walton, Jake Archibald, independent blogs)
- Firebase RTDB: Stack Overflow + GitHub issues on `.off()` reference-equality behavior

**Tertiary (LOW/consensus-aligned):**
- Safari edge cases: Apple Developer Forums, third-party compatibility reports (noted but not independently verified for this Safari version)
