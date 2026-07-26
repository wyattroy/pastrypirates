---
phase: 08-engine-extraction-node-harness-migration
plan: 03
subsystem: infra
tags: [esm, module-split, rng, determinism, order-load-bearing, harness-migration]

# Dependency graph
requires:
  - phase: 08-engine-extraction-node-harness-migration
    provides: "Plan 02 — the complete src/shared/index.js leaf tier (120 exports, six ORDER IS LOAD-BEARING annotations); the window.PP bridge and inverted startup already proven in Chrome"
provides:
  - "src/engine/index.js — the complete Phase 8 engine tier: rollStorm (08-01), PERSONALITY/AW/TW/DW/FISH_BASE, class Game (the full ~730-line class, verbatim), roundCfg — importing mulberry32, ING_ALL, TET, DIRS, OPPOSITE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD, windStepCost, man, ilabelImg from src/shared/index.js"
  - "scripts/lib/load_engine.js rewritten: native `import * as engine from \"../../src/engine/index.js\"` replaces the vm/string-slice hybrid; sourceHash now computed from the sorted, path-prefixed concatenation of src/engine/**/*.js + src/shared/**/*.js"
  - "scripts/real_game_test.js and scripts/dlog_replay_test.js header prose corrected to describe the native-import mechanism instead of the retired vm/string-slice extraction"
  - "The engine tier's one ORDER IS LOAD-BEARING annotation (the [3,2,1] island-spacing literal), bringing the phase total to 7 across the two module files (6 shared + 1 engine)"
affects: [08-04-contract-check, 08-05-source-hash-rebase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Verbatim code motion continued from 08-01/08-02: moved lines close with a trailing `export { ... }` statement listing every symbol, never `export ` prefixes, keeping every moved line byte-identical to its index.html source (mechanically diff-verified during this plan)."
    - "Mechanical extraction via a small Node script operating on exact line ranges, with the annotation insertion applied as a scripted string replace at a matched line rather than manual editing — then diff-verified byte-identical against the original source slice (minus the inserted annotation) before being written to disk, continuing 08-02's precedent for RNG-sensitive tables."
    - "The load_engine.js seam Phase 7 built (D-11) held exactly as designed: the whole D-12 migration (extraction + harness flip) stayed contained to src/engine/index.js and scripts/lib/load_engine.js's body — the two harnesses that call loadEngine() (real_game_test.js, dlog_replay_test.js) needed only header-prose corrections, zero logic changes."

key-files:
  created: []
  modified:
    - index.html
    - src/engine/index.js
    - scripts/lib/load_engine.js
    - scripts/real_game_test.js
    - scripts/dlog_replay_test.js

key-decisions:
  - "Import list for src/engine/index.js was derived mechanically, not from RESEARCH.md's expected list. RESEARCH.md's Q1a guess included NAMES, dockPlace, iname, and ilabel as likely engine dependencies (because the classic live turn loop uses them) — a word-boundary regex scan of the actually-moved class Game/roundCfg/weights source found only 10 real references: mulberry32, ING_ALL, TET, DIRS, OPPOSITE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD, windStepCost, man, ilabelImg. NAMES/dockPlace/iname/ilabel are used by the classic UI/live-loop code (already bridged via window.PP from 08-02), not by the Game class itself. Importing unused names would have been exactly the 'guess broadly' anti-pattern the plan's own action text (§B) warned against — the actual list is smaller and precise."
  - "scripts/lib/load_engine.js's rewritten header comment does not use the literal string 'index.html' anywhere, including inside prose that explains why the old mechanism required it — because acceptance criterion 14 greps the whole file (not just the body) for that literal string. An earlier draft's header read '...not from index.html text...' while explaining the new sourceHash computation; caught by re-running the criterion 14 grep before committing and reworded to describe the same fact without naming the retired file."
  - "Retained the vm-based replayShortfall extraction in scripts/dlog_replay_test.js exactly as-is (D-12's scope is engine loading only) but corrected its header's 'two separate extractions' framing to 'two separate sources' and updated the description of extraction 1, since it is no longer an extraction (slice + vm) at all — it is a native import via the same load_engine.js seam real_game_test.js uses. Left extraction 2 (the replayShortfall sentinel) with its original description, which is still accurate: it is still a vm-based slice keyed off sentinel comments in index.html."
  - "Corrected an inline comment in dlog_replay_test.js ('extraction 1: the Game engine region (same boundaries as real_game_test.js)') that would have gone stale the moment load_engine.js stopped having 'boundaries' at all — following 08-01/08-02's established precedent of not leaving comments that describe a mechanism that no longer exists, even when not directly covered by an acceptance-criterion grep."

requirements-completed: [SPLIT-01, ENGINE-01, ENGINE-02, ENGINE-03, ENGINE-04]

coverage:
  - id: D1
    description: "class Game, roundCfg, and the bot-weight tables (PERSONALITY/AW/TW/DW/FISH_BASE) moved verbatim out of index.html into src/engine/index.js, importing from src/shared/index.js"
    requirement: "SPLIT-01"
    verification:
      - kind: unit
        ref: "grep -q '^class Game{' index.html (exit 1); grep -q '^function roundCfg' index.html (exit 1); grep -q '^const PERSONALITY=' index.html (exit 1); [ \"$(grep -c '^class Game{' src/engine/index.js)\" -eq 1 ] (exit 0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Engine module purity: zero document/window/firebase/localStorage/Date.now/Math.random/globalThis/new Function references across src/engine/index.js and src/shared/index.js after comment-stripping"
    requirement: "ENGINE-01"
    verification:
      - kind: unit
        ref: "sed 's://.*::' src/engine/index.js src/shared/index.js | grep -nE 'document\\.[A-Za-z]+|window\\.[A-Za-z]+|\\bfirebase\\b|localStorage|Date\\.now|Math\\.random|\\bglobalThis\\b|new Function' (exit 1, no matches)"
        status: pass
    human_judgment: false
  - id: D3
    description: "scripts/lib/load_engine.js obtains {Game, roundCfg, sourceHash} via a native import of src/engine/index.js — no node:vm, no reference to index.html anywhere in the file (including header prose); loadEngine()'s async signature and return shape unchanged"
    requirement: "ENGINE-02"
    verification:
      - kind: unit
        ref: "grep -q 'node:vm' scripts/lib/load_engine.js (exit 1); grep -q 'index.html' scripts/lib/load_engine.js (exit 1); [ \"$(grep -c 'from \\\"../../src/engine/index.js\\\"' scripts/lib/load_engine.js)\" -eq 1 ] (exit 0)"
        status: pass
      - kind: integration
        ref: "node --input-type=module -e \"import('./scripts/lib/load_engine.js').then(async m=>{const r=await m.loadEngine();...})\" (exit 0, sourceHash is 64 hex chars)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Byte-for-byte parity with the Phase 7 golden corpus preserved through the extraction and the harness flip: all 30 seeds verify green both before and after the commit, npm test and real_game_test.js 25 and dlog_replay_test.js all exit 0, fixture files untouched"
    requirement: "ENGINE-03"
    verification:
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (exit 0, 30/30 PASS, SOURCE: moved, behavior identical); npm test (exit 0); node scripts/real_game_test.js 25 (exit 0); node scripts/dlog_replay_test.js (exit 0); git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l (=1); git log --oneline -- scripts/fixtures/determinism/manifest.json | wc -l (=1); git status --porcelain scripts/fixtures/determinism/ (empty)"
        status: pass
    human_judgment: false
  - id: D5
    description: "The engine tier's one order-load-bearing construct (the [3,2,1] island-spacing literal) annotated ORDER IS LOAD-BEARING, byte-order-preserved; combined with 08-02's six shared-tier annotations, the phase total is 7 across the two module files"
    requirement: "ENGINE-04"
    verification:
      - kind: unit
        ref: "[ \"$(grep -c 'ORDER IS LOAD-BEARING' src/engine/index.js)\" -eq 1 ] (exit 0); [ \"$(cat src/shared/index.js src/engine/index.js | grep -c 'ORDER IS LOAD-BEARING')\" -eq 7 ] (exit 0); grep -q 'for(const spacing of \\[3,2,1\\]){' src/engine/index.js (exit 0)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Extraction and harness migration landed in one commit (D-12); the DAG direction holds (src/shared/ imports nothing from src/engine/); no duplicate top-level declaration shadows the bridge between the shrunk classic script and either module (Task 2 audit)"
    requirement: null
    verification:
      - kind: unit
        ref: "git log --oneline -1 --name-only | grep -q 'src/engine/index.js' (exit 0) && same commit lists scripts/lib/load_engine.js (exit 0); grep -rn 'from \\\".*engine' src/shared/ (exit 1); zero overlap between the 128 combined shared+engine export names and index.html's remaining top-level const/let/var/function/class declarations"
        status: pass
    human_judgment: false

# Metrics
duration: ~35min
completed: 2026-07-24
status: complete
---

# Phase 8 Plan 3: Engine Extraction & Native-Import Harness Migration Summary

**`class Game`, `roundCfg`, and the bot-weight tables moved verbatim out of `index.html` into `src/engine/index.js` (importing 10 real dependencies from `src/shared/index.js`), and in the same commit `scripts/lib/load_engine.js`'s body flipped from the Phase 7 `vm`/string-slice hybrid to a plain native `import` — 30/30 corpus seeds green throughout, `index.html` down to 4,692 lines.**

## Performance

- **Duration:** ~35 min active execution (mechanical extraction, native-import rewrite, full acceptance-criteria sweep, Task 2 audit)
- **Started:** 2026-07-24T15:10:00Z (approx.)
- **Completed:** 2026-07-24T15:45:00Z
- **Tasks:** 2 (Task 1 extraction + harness migration, Task 2 post-shrink audit — both complete)
- **Files modified:** 5 (`index.html`, `src/engine/index.js`, `scripts/lib/load_engine.js`, `scripts/real_game_test.js`, `scripts/dlog_replay_test.js`)

## Accomplishments

- The entire remaining engine tier — the `// Bot decision weights` comment block, `PERSONALITY`/`AW`/`TW`/`DW`/`FISH_BASE`, the full ~730-line `class Game`, and the `roundCfg` comment+function — moved byte-identical out of `index.html` into `src/engine/index.js`, verified via a mechanical diff against the original source slice (minus the one intentionally-inserted annotation) before anything touched disk, the same precedent 08-02 set for the shared tier.
- `src/engine/index.js` now imports exactly the shared symbols the moved code actually references — `mulberry32, ING_ALL, TET, DIRS, OPPOSITE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD, windStepCost, man, ilabelImg` — derived by a word-boundary regex scan of the moved source, not guessed from RESEARCH.md's illustrative list (which named some symbols, like `NAMES`/`dockPlace`/`iname`, that the classic UI/live-loop code needs but `class Game` itself does not).
- `scripts/lib/load_engine.js`'s body is now a plain native `import * as engine from "../../src/engine/index.js"` — the `node:vm` import, the `index.html` file read, the `<script>`/`escHtml` boundary search, and the `document` sandbox stub are all gone. `sourceHash` is recomputed from the sorted, path-prefixed concatenation of every `.js` file under `src/engine/` and `src/shared/`. `loadEngine()`'s async signature and `{ Game, roundCfg, sourceHash }` return shape are unchanged (D-13) — confirmed unchanged by directly invoking it and checking the return shape and hash format.
- The header comment was rewritten, not just the body — an early draft still said "not from index.html text" while explaining the new hash mechanism; re-running acceptance criterion 14's grep before committing caught it, and it was reworded to describe the same fact without naming the retired file, per invariant #7.
- The island-spacing `[3,2,1]` literal is annotated `// ORDER IS LOAD-BEARING`, explaining that each loop iteration calls `shapeFor()` (2–4 `this.r()` calls) — the engine tier's one and only annotation, bringing the combined phase total (with 08-02's six shared-tier annotations) to exactly 7.
- `scripts/real_game_test.js` and `scripts/dlog_replay_test.js`'s header prose corrected to describe the native-import mechanism; `dlog_replay_test.js`'s accurate description of its second, still-`vm`-based `replayShortfall` sentinel extraction was preserved and only its "extraction 1" language (now factually a native import, not an extraction) was updated.
- Task 2's post-shrink audit confirmed clean: the three "stays behind" items (`$`, `let game=...`, `"use strict";`) each present exactly once and absent from both modules; zero overlap between the 128 combined shared+engine export names and any remaining top-level declaration in the classic script; the retired `escHtml`/`<script>`-indexOf slice markers confirmed orphaned (no file in `scripts/` searches for either); exactly one bare `<script>` tag.
- `index.html` shrank from 5,469 lines (end of 08-02) to 4,692 lines — a 777-line reduction this plan, and 948 lines below the pre-Phase-8 baseline of 5,640, comfortably past the ≥900-line floor Task 2's acceptance criteria set.
- All 30 corpus seeds verify green, both before and after the single commit; `npm test`, `real_game_test.js 25`, and `dlog_replay_test.js` all exit 0.

## Task Commits

Both tasks share a single commit, per D-12's explicit requirement that extraction and harness migration land together:

1. **Task 1 + Task 2 (extraction, harness flip, and audit — no findings to amend)** — `11d922b` (feat)

Task 2 is a read-only audit; its acceptance criteria (duplicate-declaration scan, orphaned-marker check, line-count measurement) were run against the working tree before the commit above and found zero issues to amend, so no separate commit was needed.

**Plan metadata:** committed alongside this summary (see final commit below).

## Files Created/Modified

- `src/engine/index.js` — extended from 08-01's `rollStorm`-only barrel to the complete engine tier: `PERSONALITY`, `AW`, `TW`, `DW`, `FISH_BASE`, the full `class Game`, `roundCfg` — one new `import { mulberry32, ING_ALL, TET, DIRS, OPPOSITE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD, windStepCost, man, ilabelImg } from "../shared/index.js";` line, one `ORDER IS LOAD-BEARING` annotation, trailing `export { rollStorm, PERSONALITY, AW, TW, DW, FISH_BASE, Game, roundCfg };`
- `index.html` — the weights-through-`class Game` block (index.html:862–1626) and the `roundCfg` comment+function (index.html:1631–1642) deleted with no tombstone; `/* ================= UI ================= */`, `const $=...`, `let game=null,...`, and `function escHtml` all confirmed untouched and in their original relative position; single `<script>` tag count unchanged
- `scripts/lib/load_engine.js` — body rewritten: `node:vm`, the `fs.readFileSync(...index.html...)` call, the `<script>`/`escHtml` slice-boundary search, and the `document` sandbox stub all removed; replaced with a plain `import * as engine from "../../src/engine/index.js"` and a `computeSourceHash()` helper that enumerates and sorts `src/engine/**/*.js` + `src/shared/**/*.js`; header comment rewritten to describe the new mechanism without naming `node:vm` or `index.html` anywhere in the file
- `scripts/real_game_test.js` — header prose corrected: no longer describes extracting a region "verbatim and run in a Node `vm` context" or references the `================= UI =================` marker; now describes the engine as a DOM-free ES module obtained via `loadEngine()`'s native import. No logic changed.
- `scripts/dlog_replay_test.js` — header prose corrected: "two separate extractions" reworded to "two separate sources" since source 1 (the `Game`/`roundCfg` engine) is no longer an extraction at all; source 2's accurate description of the still-`vm`-based `replayShortfall` sentinel extraction preserved verbatim. An inline comment ("same boundaries as real_game_test.js") also corrected to avoid describing a mechanism (slice boundaries) that no longer exists. No logic changed.

## Decisions Made

- **Import list derived mechanically, not from RESEARCH.md's illustrative guess.** RESEARCH.md's action text (§B) explicitly warned against "guess[ing] broadly and import[ing] unused names" and instructed deriving the list "mechanically from the moved code rather than from memory." A word-boundary regex scan of the moved source (weights + `class Game` + `roundCfg`) against `src/shared/index.js`'s full 120-name export list found exactly 10 real references. RESEARCH.md's own Q1a list (which the plan quoted as an expectation) included `NAMES`, `dockPlace`, `iname`, and `ilabel` — those are genuinely referenced only by the classic UI/live-loop code (already bridged via `window.PP` since 08-02), not by `class Game`/`roundCfg` themselves. Importing them into `src/engine/index.js` unused would have been dead weight and a needless coupling.
- **Header comment scrubbed of the literal string `index.html`, not just `node:vm`.** Acceptance criterion 14 greps the entire file, including comments — an early draft's rewritten header explained the new `sourceHash` mechanism by contrast ("not from index.html text"), which would have failed that criterion. Reworded to state the same fact (`sourceHash` derives from module sources) without naming the retired file, per the plan's invariant #7 ("Header comments count").
- **`dlog_replay_test.js`'s second extraction left completely untouched in logic**, per the plan's explicit instruction (§F/§G) and D-12's scope boundary (engine loading only). Its header's framing was updated from "two separate extractions" to "two separate sources" since only one of the two is still an extraction (a `vm`-based slice); the other is now a plain import. This is prose accuracy, not a scope expansion — confirmed by re-running `node scripts/dlog_replay_test.js` unchanged (exit 0) both before and after the wording edit.
- **An inline comment not covered by any acceptance criterion was still corrected** ("extraction 1: the Game engine region (same boundaries as real_game_test.js)" → "source 1: the Game engine (same seam real_game_test.js uses)"), following 08-01/08-02's established precedent that a comment describing a mechanism that no longer exists is a documentation bug (Rule 1), not an out-of-scope embellishment, under this codebase's own "loud failure on drift" convention.

## Deviations from Plan

None — plan executed exactly as written. Task 1's code motion (§A–D), the import derivation (§B), the annotation (§C), the `load_engine.js` rewrite (§E), and the header-prose corrections (§F) all match the plan's `<action>` step-by-step. Task 2's audit found zero issues requiring an amendment to Task 1's commit — the single commit `11d922b` stands as both tasks' output.

## Known Stubs

None. No hardcoded empty values, placeholder text, or unwired data sources were introduced by this plan — this is a pure code-motion + harness-rewrite plan with zero new UI surface.

## Coverage Gap — stated, not papered over

Per critical invariant #8: the 30-seed corpus this plan verified against exercises `Game.play()`, which never sets `windNow2` and never calls `rollStorm` from outside the class. The classic live/multiplayer turn loop (`runLiveNet`/`botTurn`/`windLeg`, still in `index.html`'s classic script region below the shrunk engine boundary) hand-reimplements that loop and calls `game.r()` and engine methods directly from outside the class — including the second-gust `windNow2`/`PERP` mechanic the headless corpus structurally cannot exercise (confirmed in 08-01's Chrome transcript, where this exact path was forced and observed working through the bridge). A green `--verify` here proves the engine's headless-replay path is byte-identical; it does **not** by itself prove the classic live-loop path survived this extraction unchanged — that proof already exists from 08-01's and 08-02's Chrome verification passes (both ran after their own bridge/shared-tier changes and confirmed the live-loop mechanics), and 08-05 is scoped to close this gap behaviourally for the now-complete engine tier. No browser re-verification was run as part of *this* plan (08-03 has no browser-check task in its own task list — Task 2 is a read-only static audit, not a browser check), so this gap is stated here rather than silently assumed closed.

## Issues Encountered

None. All acceptance criteria (26 for Task 1, 12 for Task 2) were run and passed on the first attempt after the mechanical extraction script's output was diff-verified byte-identical against the original source. The one thing caught and fixed before committing was the stale `index.html` literal in `load_engine.js`'s draft header comment (see Decisions Made above) — caught by re-running criterion 14's exact grep during the verification sweep, not discovered after the fact.

## User Setup Required

None — no external service configuration required. Zero dependencies, zero package-manager installs (this phase introduces none).

## Next Phase Readiness

- `src/engine/index.js` is now the complete Phase 8 engine tier (8 exports: `rollStorm`, `PERSONALITY`, `AW`, `TW`, `DW`, `FISH_BASE`, `Game`, `roundCfg`), importing 10 real dependencies from `src/shared/index.js`. Together with 08-02's 120-export shared tier, the two-file barrel structure Phase 7/08-01 established is now fully populated.
- `scripts/lib/load_engine.js` is a plain, hybrid-free native-import seam — 08-04's contract check can now audit the final module boundary with no transitional scaffolding left to account for.
- `engineSourceHash` in `scripts/fixtures/determinism/manifest.json` is still stale (frozen at its Phase-7 value, per D-02) — the new value computed by `loadEngine()` this plan is `bdc641620a4d28261bdef57cde4ded24174864c1584c78f0eeb16e988508e42e`, ready for 08-05's dedicated, separately-committed rebase (D-01/D-02: never via `--capture`).
- The corpus fixtures remain untouched (one commit deep each for the `.jsonl` files and `manifest.json`) — the D-01/D-02 tripwires held before, during, and after this plan.
- No blockers. The coverage gap noted above is 08-05's explicit scope, not an unresolved defect in this plan's own deliverable.

## Self-Check: PASSED

- `src/engine/index.js` (8 exports, one `ORDER IS LOAD-BEARING` annotation, `class Game{` present exactly once) — FOUND, confirmed via grep and `node --input-type=module -e "import(...)"` (exit 0)
- `index.html` (weights/class Game/roundCfg absent, single `<script>` tag, three "stays behind" items intact, replayShortfall sentinel intact) — FOUND, confirmed via grep; line count 4,692
- `scripts/lib/load_engine.js` (native import, no `node:vm`, no `index.html` reference anywhere in the file) — FOUND, confirmed via grep and direct invocation (sourceHash 64 hex chars)
- `scripts/real_game_test.js` / `scripts/dlog_replay_test.js` (header prose corrected, logic unchanged) — FOUND, confirmed via Read and `node scripts/dlog_replay_test.js` (exit 0)
- Commit `11d922b` — FOUND in `git log --oneline --all`, contains both `src/engine/index.js` and `scripts/lib/load_engine.js` (D-12)

---
*Phase: 08-engine-extraction-node-harness-migration*
*Completed: 2026-07-24*
