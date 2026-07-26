---
phase: 08-engine-extraction-node-harness-migration
verified: 2026-07-24T16:18:51Z
status: passed
score: 5/5 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 8: Engine Extraction & Node Harness Migration Verification Report

**Phase Goal:** Extract the deterministic engine into pure, DOM-free/Firebase-free ES modules that the Node harnesses import natively, producing byte-for-byte identical seeded output against the baseline.
**Verified:** 2026-07-24T16:18:51Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth (ROADMAP §Phase 8 success criteria) | Status | Evidence |
|---|---|---|---|
| 1 | Shared constants and pure helpers live in leaf modules importable by engine/UI/net/harnesses | ✓ VERIFIED | `src/shared/index.js` (182 lines, 120 named exports incl. `ING_ALL`, `DIRS`, `man`, `shuffle` (via `Game.shuffle`, `mulberry32`, image maps). Imported natively by `src/engine/index.js` and by `scripts/lib/load_engine.js`. |
| 2 | Game class/`roundCfg`/bot strategies/RNG/replay live in own ES module(s) with zero DOM/window/Firebase/wall-clock/unseeded-random access; the 3 asset/DOM bootstrap touches relocated out | ✓ VERIFIED | `src/engine/index.js` read in full — zero `document.`/`window.`/`firebase`/`localStorage`/`Date.now`/`Math.random` matches, confirmed independently by direct `grep` (exit 1 = no match) as well as `node scripts/engine_contract_check.js` (PASS). The 3 D-06 impurities (`document.documentElement.style.setProperty` ×2, `document.body.innerHTML = emojify(...)`) now live in `applyEngineBootstrapEffects()` at `index.html:4632`; the `$` DOM helper and `let game=null,...` (`index.html:863-864`) correctly did **not** move (D-07/A-01 honored). |
| 3 | Node harnesses (`real_game_test.js`, `dlog_replay_test.js`) import the engine natively; `vm`/string-slice extraction retired; lands in the same commit as extraction | ✓ VERIFIED | `git show --stat 11d922b` shows `src/engine/index.js` (+785), `index.html` (-777), and `scripts/lib/load_engine.js` (+90/-64 — the `vm`/`crypto` string-slice body replaced by `import * as engine from "../../src/engine/index.js"`) landing in **one commit**. `real_game_test.js` and `load_engine.js` contain zero `vm` references. `dlog_replay_test.js` retains one `vm.createContext`/`runInContext` pair — read in full and confirmed this is a *separate*, explicitly out-of-scope extraction of the `replayShortfall` sentinel (UI/networking region, not the engine), while it obtains `Game`/`roundCfg` via the same native `loadEngine()` import as `real_game_test.js`. |
| 4 | Seeded gameplay + replay output byte-for-byte identical to the Phase 7 golden baseline across the full regression corpus | ✓ VERIFIED (behavioral) | Independently re-ran `npm test`: `node scripts/determinism_baseline.js --verify` → 30/30 seeds PASS, `SOURCE: unchanged — hashes match and engine source hash matches.`; `engine_contract_check.js` → 4/4 PASS; `dlog_replay_test.js` → all cases pass. `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl'` = 1 commit; `manifest.json` = 2 commits (Phase 7 capture + Phase 8 `engineSourceHash` re-base, isolated to its own commit `23092a5` containing exactly a 1-line manifest diff + the new gated tool). |
| 5 | Order-load-bearing constants (`DIRS`/`PERP`/`OPPOSITE` + any `this.r()`-feeding literal) preserved and annotated | ✓ VERIFIED | Exactly 7 `ORDER IS LOAD-BEARING` annotations exist (mechanically counted by `engine_contract_check.js`, independently confirmed): 6 in `src/shared/index.js` (`DIRS`, `DIRNAME`, `PERP`, `STORM_DIAG`, `OPPOSITE`, `TET`) + 1 in `src/engine/index.js` (the `[3,2,1]` island-spacing literal). `diff` against the pre-phase `index.html` (base commit `e9cf0ce`) confirms every annotated construct's key/element order is byte-identical to the original — no reordering. |

**Score:** 5/5 truths verified (0 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `src/shared/index.js` | Leaf tier — pure constants/helpers | ✓ VERIFIED | 182 lines, 120 exports, zero DOM/window/Firebase access, DAG-checked to never import `src/engine/`. |
| `src/engine/index.js` | Engine tier — `Game`/`roundCfg`/bot AI/RNG | ✓ VERIFIED | 800 lines, 8 exports (`rollStorm, PERSONALITY, AW, TW, DW, FISH_BASE, Game, roundCfg`), zero impurity, imports only from `src/shared/`. |
| `src/main.js` | Bridge population + inversion of control | ✓ VERIFIED | Populates `window.PP` (128 keys) and `Object.assign(globalThis, PP)`, both `PP-BRIDGE`-tagged; calls `window.boot()` once. `index.html` no longer self-invokes `boot()` — confirmed only one `boot()` call site exists in the whole file (inside `src/main.js`'s bridge). |
| `scripts/lib/load_engine.js` | Native-import seam (D-11/D-12/D-13) | ✓ VERIFIED | `vm`/`crypto`-string-slice body fully replaced; `loadEngine()` returns `{ Game, roundCfg, sourceHash }` unchanged signature; `sourceHash` now derived from sorted, path-prefixed `src/engine/**/*.js` + `src/shared/**/*.js` content. |
| `scripts/engine_contract_check.js` | Standing ENGINE-01/04 + DAG + export-completeness gate | ✓ VERIFIED | 290 lines, 4 assertions, wired into `npm test`, independently re-run: 4/4 PASS. Comment-stripping purity narrowing spot-checked (see Anti-Patterns section) — currently sound, no `://` string in either module today. |
| `scripts/rebase_source_hash.js` | Gated, single-field `engineSourceHash` re-base tool | ✓ VERIFIED | Read in full; gate (replay all 30 seeds, compare to frozen `perSeed[].sha256`, abort on any divergence) genuinely runs before the single-field write; reuses `determinism_baseline.js`'s own `playSeed`/`serializeSeed`/`hashBytes` (no parallel reimplementation). |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `scripts/lib/load_engine.js` | `src/engine/index.js` | native `import` | ✓ WIRED | Confirmed by source read and by `npm test`/`node scripts/engine_contract_check.js` running clean. |
| `src/engine/index.js` | `src/shared/index.js` | named `import` (10 symbols) | ✓ WIRED, one-directional | `checkDagDirection()` independently confirms `src/shared/` never imports from `src/engine/`. |
| `src/main.js` | `globalThis`/`window.PP` | `Object.assign` / bridge object | ✓ WIRED | 128 keys, exactly the union of `src/shared/` (120) + `src/engine/` (8) exports — no Phase 10 globals (`game`/`myId`/`room`/`db`) present, confirmed by direct enumeration. |
| `index.html` classic `runLiveNet`/`windLeg`/etc. | `rollStorm`, `PERP`, `DIRS`, `windStepCost` | bare identifier via bridge | ✓ WIRED (behavioral) | Confirmed by the already-established Chrome transcript (08-05): forced storm reached round 3 with correct `windNow2`/second-gust narration — the corpus-blind path this bridge exists to serve. |
| commit `11d922b` | engine extraction + harness migration | single commit | ✓ WIRED | `git show --stat 11d922b` — both changes land together, per D-12/ENGINE-02. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Determinism oracle green after relocation | `npm test` (re-run independently) | 30/30 seeds PASS, `SOURCE: unchanged`; contract check 4/4 PASS; replay test all cases pass | ✓ PASS |
| Purity check catches a real violation (not a comment-stripping blind spot) | direct `grep -n -E "document\.\|window\.\|..." src/engine/index.js src/shared/index.js` (bypasses the checker's own comment-stripping) | 0 matches (grep exit 1) | ✓ PASS — confirms purity independently of the tool's own logic |
| `window.PP`/`globalThis` bridge surface matches exactly the moved symbols | `node -e "..."` importing both barrels, diffing key set against `['game','myId','room','db']` | 128 keys, 0 overlap with Phase 10 globals | ✓ PASS |
| Verbatim motion spot-check (3 non-trivial functions + 1 large constructor region + 1 large constant table) | `diff` of pre-phase `index.html` line ranges against `src/engine/index.js`/`src/shared/index.js` (base commit `e9cf0ce`) | `battle()`, `stepToward()`, `chooseAction()`, `EMOJI_IMG` table: exact `diff` match (exit 0). Constructor island-placement region: matches once the one added 3-line `ORDER IS LOAD-BEARING` comment is accounted for (no code change). | ✓ PASS |
| `git status` clean, corpus fixtures untouched | `git status --porcelain`; `git log --oneline -- '*.jsonl'`; `git log --oneline -- manifest.json` | clean; 1 commit; 2 commits | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| SPLIT-01 | 08-03, 08-04 | Engine lives in own DOM-free/Firebase-free ES module(s) | ✓ SATISFIED | `src/engine/index.js`, purity-checked. |
| SPLIT-02 | 08-02, 08-04 | Shared constants/helpers live in leaf modules | ✓ SATISFIED | `src/shared/index.js`. |
| ENGINE-01 | 08-02, 08-03, 08-04, 08-05 | Engine module is pure; 3 impurities relocated | ✓ SATISFIED | Purity confirmed directly + via gate; impurities relocated to `applyEngineBootstrapEffects()`. |
| ENGINE-02 | 08-01, 08-03 | Harnesses import natively; retiring `vm`/string-slice; same commit as extraction | ✓ SATISFIED | Commit `11d922b` atomicity confirmed; `dlog_replay_test.js`'s remaining `vm` use is a distinct, out-of-scope UI-region sentinel. |
| ENGINE-03 | 08-01…08-05 | Byte-for-byte identical output across regression corpus | ✓ SATISFIED | `npm test` independently re-run green; corpus fixtures untouched. |
| ENGINE-04 | 08-02, 08-03, 08-04 | Order-load-bearing constants preserved and annotated | ✓ SATISFIED | 7/7 annotations present and mechanically gated; verbatim key order confirmed by diff. |

No orphaned requirements found — REQUIREMENTS.md's SPLIT-01/02, ENGINE-01…04 all appear in at least one plan's `requirements:` frontmatter field.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `scripts/engine_contract_check.js` | 61-64 (`stripLineComment`) | Line-comment stripping (`indexOf("//")`) has a documented, currently-inert false-negative risk: a `://` substring inside a string literal *before* a real violation on the same physical line would cause the real violation to be silently stripped along with the "comment." | ℹ️ INFO | Not a blocker — independently confirmed via direct `grep` (bypassing the checker entirely) that zero `document.`/`window.`/etc. references exist in either module today, and zero `://` substrings exist in either file (`grep -c "://"` = 0 in both). The script's own header comment already flags this exact caveat and asks a future editor to "reconfirm that if a URL-bearing string is ever added here" — the risk is self-documented, not hidden. No fix required for this phase's goal; worth a note for whoever next edits `src/shared/index.js` or `src/engine/index.js` to add a URL-bearing string constant. |

No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers or stub/empty-implementation patterns found in any file touched by this phase (`src/engine/index.js`, `src/shared/index.js`, `src/main.js`, `scripts/lib/load_engine.js`, `scripts/engine_contract_check.js`, `scripts/rebase_source_hash.js`).

### Human Verification Required

None. The browser-dependent truths (bridge resolution, `__pp_boot_count===1`, forced-storm second-gust path, console-clean) were already established with an explicit, itemized Chrome transcript recorded in `08-05-SUMMARY.md` and confirmed by the orchestrator prior to this verification pass — not merely asserted. No further human action needed to close Phase 8.

### Gaps Summary

None. All 5 ROADMAP success criteria and all 6 traced requirements (SPLIT-01, SPLIT-02, ENGINE-01…04) are independently verified against actual code and independently re-run tooling, not just SUMMARY claims. The one INFO-level anti-pattern noted above (purity-checker's comment-stripping false-negative surface) is real but currently inert and does not affect the phase's actual purity guarantee, which was independently confirmed via a direct grep bypassing the checker's own logic.

---

*Verified: 2026-07-24T16:18:51Z*
*Verifier: Claude (gsd-verifier)*
