---
phase: 07-foundation-determinism-baseline
verified: 2026-07-24T00:00:00Z
status: passed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 7: Foundation & Determinism Baseline Verification Report

**Phase Goal:** Establish the zero-build module-loading contract and capture the determinism regression oracle before any code moves — with the game still fully playable and behaviorally unchanged.
**Verified:** 2026-07-24
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Root `package.json` declares `"type": "module"` so the same engine `.js` file imports identically in Node and the browser | ✓ VERIFIED | `package.json` has `"type": "module"`, `"private": true`, no `dependencies`/`devDependencies` keys. `node --input-type=module -e "import('./src/main.js')"` exits 0, prints `Node import OK`, empty stderr. |
| 2 | The game loads and plays from a static HTTP server via `<script type="module">`, with Firebase compat v12.15.0 as classic scripts before it, no init race | ✓ VERIFIED | `index.html:25-26` Firebase compat tags unmoved and still classic (no `type=` attr). `index.html:5638` `<script type="module" src="src/main.js"></script>` is the last script tag in the document, after the inline classic script closes at `:5637`. Browser verification (Chrome MCP + Wyatt in Safari, already established) confirms `window.__pp_module_ok === true`, `typeof firebase === "object"`, clean console, playable solo game. |
| 3 | A seeded golden-fixture replay corpus is captured from the pre-refactor monolith and stored as the byte-for-byte regression oracle | ✓ VERIFIED | `scripts/fixtures/determinism/` holds 30 `seed-*.jsonl` files + `manifest.json`, committed to git. `node scripts/determinism_baseline.js --verify` (re-run live during this verification) exits 0, 30/30 PASS, `SOURCE: unchanged — hashes match and engine source hash matches.` Corpus was captured before the `index.html` module-tag edit (commit order: `79b8e8b`/`fc7e7b7` capture commits precede `dcc286b` which edits `index.html`). |
| 4 | The module-loading + local-dev contract is documented (HTTP server required, `file://` unsupported, `.js` MIME expectations) | ✓ VERIFIED | `docs/MODULES.md` (132 lines) covers all required subjects substantively: HTTP server requirement + rationale, `file://` exclusion + why, measured MIME types for both local dev and production with explicit "no config needed," classic-before-module ordering rule with both tripwires explained, `src/` layout for Phases 8–11, extraction-hazard rule (bare `<script>` tag count), Node 18+ floor, and a quick-reference table. `README.md:16` carries an additive pointer. Not a stub. |
| 5 | A solo game played after the foundation changes is behaviorally identical to `main` (no gameplay change) | ✓ VERIFIED | Two-part proof per D-21: (a) corpus captured pre-edit, re-verified green post-edit with `SOURCE: unchanged`; (b) Chrome MCP + Safari browser playthroughs (already established) confirm clean console and normal gameplay, including smooth Safari storm frame rates. `git diff --stat` across the whole phase shows `index.html` changed by exactly +1/-0 lines (`dcc286b`), confirmed directly: `diff --git a/index.html b/index.html ... +<script type="module" src="src/main.js"></script>`. |

**Score:** 5/5 truths verified

### Focus-Area Deep Checks

**1. Is `scripts/lib/load_engine.js` genuinely the single engine-loading indirection (D-12)?**

VERIFIED. `scripts/lib/load_engine.js` exports one async `loadEngine()` that performs the `vm` + string-slice extraction of the `Game`/`roundCfg` region and returns `{ Game, roundCfg, sourceHash }`. Both `scripts/real_game_test.js` (`import { loadEngine } from "./lib/load_engine.js"`) and `scripts/dlog_replay_test.js` (`import { loadEngine } from "./lib/load_engine.js"`) call it for the engine region — neither contains its own inline `vm.createContext`/string-slice logic for `Game`/`roundCfg` anymore. `dlog_replay_test.js` does retain a second, separate `vm` extraction for the unrelated `replayShortfall` sentinel region (a different code region entirely — multiplayer replay-recovery logic, not the engine) — this is explicitly scoped out of D-12 (which only covers "engine loading," i.e. `Game`/`roundCfg`) and is accurately disclosed in the file's own header comment and in 07-01-SUMMARY.md ("its own separate region) is untouched"). Phase 8 inherits exactly one call site (`load_engine.js`'s body) to flip from extraction to native import, as D-12 requires.

**2. Does the corpus actually cover the mechanics it claims?**

VERIFIED. `manifest.json` has both a `requiredEventTypes` array (12 types: `battle`, `battleflee`, `trade`, `dock`, `fish`, `windmove`, `tradewind`, `shipwrecked`, `aground`, `end`, `bakeoff`, `finish`) and a `coverage` map with actual non-zero counts for every one of them (battle=131, trade=75, dock=766, fish=1288, windmove=145, tradewind=43, shipwrecked=1, aground=3, end=30, bakeoff=4, finish=34, battleflee=23). Critically, `determinism_baseline.js`'s `capture()` function *asserts* this at capture time — `missing = REQUIRED_EVENT_TYPES.filter(t => !(coverage[t] > 0)); if (missing.length) { ...process.exit(1) }` — so an under-covering corpus cannot be committed as green, it is not merely recorded after the fact.

**3. Are the `typeof` guards real?**

VERIFIED. `src/main.js` wraps both the `window.__pp_module_ok` marker assignment and the `firebase` tripwire inside a single `if (typeof window !== "undefined") { ... }` block — both checks are genuinely inside the guard, not merely mentioned in a comment. `grep -c 'typeof window' src/main.js` = 2, `grep -c 'typeof firebase' src/main.js` = 1. Live-tested: `node --input-type=module -e "import('./src/main.js')"` exits 0 with no `ReferenceError` (proving the Node-side guard holds); the already-established Chrome/Safari browser results confirm the marker and firebase check both fire correctly under a real DOM.

**4. Is `docs/MODULES.md` substantive?**

VERIFIED. 132 lines covering exactly the required scope: HTTP server requirement (with the `python3 -m http.server 8000` / `npm start` commands), `file://` unsupported + the origin-based reason why, `.js` MIME expectations for both local dev (`text/javascript`) and production (`application/javascript; charset=utf-8`) with an explicit "no config needed" statement, classic-before-module ordering rule tied to the actual Firebase tag line numbers, the `src/` layout Phases 8–11 will fill in, plus two additional substantive sections (the bare-`<script>`-tag extraction hazard, and the Node 18+ floor) beyond the minimum ask. Not a stub — no placeholder language found via grep.

**5. Zero dependencies.**

VERIFIED. `node -e "const p=require('./package.json'); console.log(p.dependencies, p.devDependencies)"` → both `undefined`. `Object.keys(package.json)` = `['name', 'private', 'type', 'scripts']` only.

**6. Drift between SUMMARY.md claims and code — 07-01 comparison restructure, 07-02 firebase tripwire scoping.**

Both accurately described, no drift found:
- **07-01's `--verify` comparison restructure:** SUMMARY documents that comparison-1 (stored-file hash) and comparison-2 (fresh-replay hash) both always run, rather than short-circuiting, so a manifest-only-corruption case still produces a located divergence report (index `-1`) instead of a bare hash-mismatch. Read directly in `determinism_baseline.js`'s `verify()` function — the code matches this description exactly (both comparisons computed unconditionally per seed at lines 162–177, divergence walk fires on either failure at line 182).
- **07-02's firebase tripwire scoped to browser:** SUMMARY frames this as "no deviations" and CONTEXT/PLAN show it was a documented, planned refinement (07-02-PLAN.md's `<assumptions>` block explicitly discusses scoping D-17's tripwire inside the same `typeof window` branch as D-15's guard, to avoid the tripwire firing under Node where there's no load order to regress) — not an undocumented execution-time deviation. The code (`src/main.js`) matches this plan exactly.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `package.json` | root config, `type:module`, zero deps | ✓ VERIFIED | Present, exact fields confirmed |
| `scripts/lib/load_engine.js` | single engine-extraction seam | ✓ VERIFIED | Present, both harnesses route through it |
| `scripts/determinism_baseline.js` | `--capture`/`--verify` oracle tool | ✓ VERIFIED | Present, re-run live: 30/30 PASS, exit 0 |
| `scripts/fixtures/determinism/manifest.json` + 30 seed files | committed golden corpus | ✓ VERIFIED | Present, committed, coverage-asserted |
| `src/module-contract.js` | pure leaf, no imports/side effects | ✓ VERIFIED | Present, 14 lines, exports two constants, zero DOM/window touches |
| `src/main.js` | module entry, guarded markers | ✓ VERIFIED | Present, 34 lines, both guards real and correctly scoped |
| `docs/MODULES.md` | module-loading contract doc | ✓ VERIFIED | Present, 132 lines, substantive |
| `index.html` (modified) | exactly +1/-0 lines | ✓ VERIFIED | Confirmed via `git show dcc286b -- index.html`: single `<script type="module" src="src/main.js"></script>` line added |
| `README.md` (modified) | pointer to docs/MODULES.md | ✓ VERIFIED | Line 16 present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `scripts/real_game_test.js` | `scripts/lib/load_engine.js` | `import { loadEngine }` | ✓ WIRED | Confirmed by reading the file |
| `scripts/dlog_replay_test.js` | `scripts/lib/load_engine.js` | `import { loadEngine }` | ✓ WIRED | Confirmed by reading the file; separate `replayShortfall` extraction is a distinct, disclosed region |
| `scripts/determinism_baseline.js` | `scripts/lib/load_engine.js` | `import { loadEngine }` | ✓ WIRED | Confirmed by reading the file |
| `index.html:5638` module script | `src/main.js` | `src="src/main.js"` | ✓ WIRED | Live-verified in Chrome + Safari (already established) — `window.__pp_module_ok === true` |
| `src/main.js` | `src/module-contract.js` | `import { MODULE_OK_FLAG }` | ✓ WIRED | Marker set via the imported constant, not a literal — a real, load-bearing import edge |
| Firebase compat classic tags (`:25-26`) | `src/main.js`'s firebase tripwire | script execution order | ✓ WIRED | Module scripts always defer; tags unmoved; live-verified silent (no tripwire error) in both browsers |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| FOUND-01 | 07-01, 07-02 | Root `package.json` with `type:module` | ✓ SATISFIED | `package.json` present with exact fields; Node import proof passes |
| FOUND-02 | 07-02, 07-03 | Game loads/plays via `<script type="module">` from static HTTP server | ✓ SATISFIED | Module tag present; browser verification complete (Chrome + Safari) |
| FOUND-03 | 07-02, 07-03 | Firebase compat stays classic, loaded before module entry | ✓ SATISFIED | Tags unmoved at `:25-26`; module tag is the last tag; live-verified no init race |
| FOUND-04 | 07-01, 07-02 | Golden-fixture determinism baseline captured pre-refactor | ✓ SATISFIED | 30-seed corpus committed, coverage-asserted, `--verify` green |
| FOUND-05 | 07-02 | Module-loading + local-dev contract documented | ✓ SATISFIED | `docs/MODULES.md` substantive, all required subjects covered |

No orphaned requirements — REQUIREMENTS.md's Phase 7 traceability rows (FOUND-01…05) match exactly what the three plans claim.

### Anti-Patterns Found

None. Scanned all phase-created/modified files (`src/main.js`, `src/module-contract.js`, `scripts/lib/load_engine.js`, `scripts/determinism_baseline.js`, `docs/MODULES.md`, `package.json`, `scripts/real_game_test.js`, `scripts/dlog_replay_test.js`) for `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER`/placeholder-language/empty-implementation patterns. Zero matches.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Node import of module entry succeeds | `node --input-type=module -e "import('./src/main.js')"` | `Node import OK`, exit 0 | ✓ PASS |
| Determinism oracle verifies green | `node scripts/determinism_baseline.js --verify` | 30/30 PASS, `SOURCE: unchanged` | ✓ PASS |
| Full test suite passes | `npm test` | `dlog_replay_test.js`: `All cases passed.`, exit 0 | ✓ PASS |
| `index.html` script tag count stable | `grep -c '<script>' index.html` | `1` (attribute-less) | ✓ PASS |
| `index.html` phase-wide diff is +1/-0 | `git show dcc286b --stat -- index.html` | `1 file changed, 1 insertion(+)` | ✓ PASS |
| Acceptance-criteria greps (07-02 Task 1) | `grep -c 'typeof window'/'typeof firebase'/'boot('` on `src/main.js` | 2 / 1 / 0 | ✓ PASS |
| Zero dependencies | `node -e "require('./package.json').dependencies"` | `undefined` | ✓ PASS |

### Human Verification Required

None — all must-haves resolved to VERIFIED via direct codebase evidence. Browser verification (Chrome MCP + Safari, the one item requiring a human) was already completed and independently confirmed per the task's `<evidence_already_established>` block; this verifier did not need to re-request it.

### Gaps Summary

No gaps found. All five ROADMAP success criteria, all five FOUND requirements, and all six focus-area deep checks resolved to VERIFIED with direct evidence from the codebase (file reads, live command execution, git history inspection) — not from trusting SUMMARY.md claims alone. The one place a deviation existed (the `--verify` comparison restructure in 07-01) was read directly in the source and matches its SUMMARY description exactly. `index.html` remains a monolith with exactly one new line, as the phase goal requires — no gameplay code moved.

---

*Verified: 2026-07-24*
*Verifier: Claude (gsd-verifier)*
