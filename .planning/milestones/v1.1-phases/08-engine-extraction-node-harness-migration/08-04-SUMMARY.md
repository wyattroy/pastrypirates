---
phase: 08-engine-extraction-node-harness-migration
plan: 04
subsystem: infra
tags: [contract-check, purity-gate, dag-direction, pure-motion-audit, docs]

# Dependency graph
requires:
  - phase: 08-engine-extraction-node-harness-migration
    provides: "Plan 03 — the complete src/engine/index.js engine tier (8 exports) and src/shared/index.js leaf tier (120 exports); the native-import load_engine.js seam; phase total of 7 ORDER IS LOAD-BEARING annotations"
provides:
  - "scripts/engine_contract_check.js — zero-dependency, npm-test-wired gate: engine purity (comment-stripped grep), ORDER IS LOAD-BEARING annotation coverage (count + per-construct), shared->engine DAG direction, and moved-symbol export completeness (128 hardcoded names, both barrels checked, index.html re-declaration checked)"
  - "package.json test script extended: determinism oracle -> contract check -> replay test, zero dependency keys added"
  - "docs/MODULES.md: the src/shared + src/engine two-tier layout, the window.PP bridge (name, globalThis publishing, PP-BRIDGE token, Phase 11 removal), the 4-step startup order and why it's load-bearing, both standing tripwires, the retired <script>/escHtml slice boundaries, and a pointer to the contract check — plus a pre-existing src/ui and src/net phase-number swap corrected against ROADMAP.md"
  - "Mechanical proof that the ~950 moved lines in src/shared/index.js and src/engine/index.js are byte-identical to the pre-phase index.html: 949 lines checked, 0 failures"
affects: [08-05-source-hash-rebase]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Contract-check-as-gate: a one-time manual grep proven in a SUMMARY protects nothing past the plan that ran it — turning ENGINE-01/ENGINE-04 into a committed script wired into npm test makes the same protection standing for every later phase in the milestone."
    - "Self-scope exclusion for pattern-matching gates: a purity checker whose own source contains the forbidden patterns as regex literals must never scan its own directory (scripts/) — doing so makes the gate permanently red or forces the patterns to be weakened until they catch nothing real (T-08-15)."
    - "Hardcoded assertion inputs over self-referential derivation: MOVED_SYMBOLS is a literal array sourced from prior SUMMARYs, not read dynamically from the barrels' own export lists — deriving it from the barrels would make the completeness assertion tautological (a silently-dropped export would just as silently drop out of the list checking for it)."
    - "Red-proof-before-trust: every assertion in a new gate is deliberately broken, confirmed to fail with a named reason, and restored before the gate is trusted to protect anything — continuing the convention Phase 7 set for --verify's failure path."

key-files:
  created:
    - scripts/engine_contract_check.js
  modified:
    - package.json
    - docs/MODULES.md

key-decisions:
  - "Annotation-block check walks upward through the contiguous // comment block above each anchor rather than checking only the single line directly above it. The plan's acceptance criteria describe 'the line directly above' for all seven constructs, but the engine tier's [3,2,1] annotation (08-03) is a 3-line comment with the ORDER IS LOAD-BEARING token on its first line, not on the line immediately touching the anchor. A literal single-line check produced a false FAIL on real, correctly-annotated source during initial testing — fixed by scanning the whole contiguous comment block for the token, verified to still catch a real deleted annotation (red-proof drill 3)."
  - "checkMovedSymbolCompleteness() wraps its dynamic imports in try/catch. The purity red-proof drill (appending a top-level document.body reference) throws on import in this DOM-free Node context before the assertion can run its per-name loop — an uncaught exception would abort the whole script before the other three PASS/FAIL lines print. Caught and reported as a named EXPORTS failure instead, so one run always reports all four assertions' status even when one assertion's own probe throws."
  - "The pure-motion audit's throwaway script excludes an annotation's full contiguous comment block (not just the line containing the token) from the 'must appear verbatim in pre-phase index.html' check. The engine tier's [3,2,1] annotation is 3 lines of entirely new prose; excluding only the token-bearing line produced 2 false failures on the two continuation lines during initial testing, corrected by consuming the whole contiguous comment run once the token is found."
  - "Corrected a pre-existing docs/MODULES.md inaccuracy while editing the section this plan already touches: the doc listed 'src/ui/ (Phase 9)' and 'src/net/ (Phase 11)', but ROADMAP.md assigns Phase 9 to networking and Phase 11 to UI extraction — the phase numbers were swapped. Fixed under deviation Rule 1 (auto-fix bugs) since leaving stale phase numbers in a doc Phases 9-11 are told to read as canonical would mislead exactly the audience this doc exists for."

requirements-completed: [SPLIT-01, SPLIT-02, ENGINE-01, ENGINE-04]

coverage:
  - id: D1
    description: "A committed, zero-dependency check asserts engine purity, ORDER IS LOAD-BEARING annotation coverage, shared-to-engine DAG direction, and moved-symbol export completeness, exiting non-zero on any failure"
    requirement: "ENGINE-01, ENGINE-04, SPLIT-01, SPLIT-02"
    verification:
      - kind: unit
        ref: "node scripts/engine_contract_check.js; echo exit=$? (exit=0, four PASS lines printed)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The check is wired into npm test, so ENGINE-01/ENGINE-04 have a standing automated gate"
    requirement: "ENGINE-01, ENGINE-04"
    verification:
      - kind: unit
        ref: "grep -q 'engine_contract_check' package.json (exit 0); npm test (exit 0, contract check output present between determinism and replay output)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The purity scan strips // comments before matching, so a DOM-API mention inside prose cannot make the gate lie in either direction"
    requirement: "ENGINE-01"
    verification:
      - kind: unit
        ref: "red-proof drill 2 below: same violation text as a // comment still exits 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "Every line in src/shared/index.js and src/engine/index.js exists byte-identically in the pre-phase index.html"
    requirement: null
    verification:
      - kind: unit
        ref: "throwaway audit script against pre-phase index.html (base commit e9cf0ceaad62f44a9af256c55dd1fc8b727de1d4): 949 lines checked, 0 failures"
        status: pass
    human_judgment: false
  - id: D5
    description: "docs/MODULES.md records the actual src/shared + src/engine layout, the PP-BRIDGE name and surface, and its Phase 11 removal"
    requirement: null
    verification:
      - kind: unit
        ref: "grep -q 'PP-BRIDGE' docs/MODULES.md (exit 0); grep -q 'src/engine' (exit 0); grep -q 'src/shared' (exit 0); grep -q '__pp_boot_count' (exit 0); grep -q 'engine_contract_check' (exit 0); grep -qiE 'TBD|FIXME|XXX|TODO|placeholder|coming soon' (exit 1, none found)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Zero dependencies introduced; determinism corpus untouched throughout"
    requirement: null
    verification:
      - kind: unit
        ref: "node -e \"const p=require('./package.json'); if(p.dependencies||p.devDependencies) process.exit(1)\" (exit 0); git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l (=1); git log --oneline -- scripts/fixtures/determinism/manifest.json | wc -l (=1); git status --porcelain scripts/fixtures/determinism/ (empty)"
        status: pass
    human_judgment: false

# Metrics
duration: ~40min
completed: 2026-07-24
status: complete
---

# Phase 8 Plan 4: Engine Contract Check & Module Contract Documentation Summary

**Turned three one-shot manual greps (purity, annotation count, DAG direction) plus a fourth new assertion (moved-symbol export completeness) into `scripts/engine_contract_check.js` — a zero-dependency, `npm test`-wired gate — and mechanically proved the ~950 moved lines arrived byte-identical, then documented the actual Phase 8 module layout in `docs/MODULES.md`.**

## Performance

- **Duration:** ~40 min active execution (checker script + red-proof drills, pure-motion audit, docs update, full verification sweep)
- **Tasks:** 2 (Task 1 contract check + wiring, Task 2 pure-motion audit + docs — both complete)
- **Files modified:** 3 (`scripts/engine_contract_check.js` created, `package.json`, `docs/MODULES.md`)

## Accomplishments

- `scripts/engine_contract_check.js` runs all four assertions on every invocation and reports every problem in one run, not just the first: purity (comment-stripped grep for `document.`/`window.`/`firebase`/`localStorage`/`Date.now`/`Math.random`/`globalThis`/`new Function`, scoped to `src/engine/*.js` + `src/shared/*.js` only — never `scripts/`, since its own source necessarily contains those patterns as regex literals), annotation coverage (exact count of 7 plus a per-construct block-walk locating each of the seven `ORDER IS LOAD-BEARING` annotations by declaration anchor), DAG direction (no `src/shared/` file imports anything resolving into `src/engine/`), and moved-symbol export completeness (128 hardcoded names — 120 from `src/shared/index.js`, 8 from `src/engine/index.js` — checked against both barrels' actual exports and against `index.html`'s remaining top-level declarations).
- `package.json`'s `test` script now runs `determinism_baseline.js --verify && engine_contract_check.js && dlog_replay_test.js` in sequence; `test:determinism` unchanged; no `dependencies`/`devDependencies` key added.
- **All seven failure modes demonstrated red and restored** (transcript below) before the check was trusted — the same convention Phase 7 used for `--verify`'s failure path (07-01-SUMMARY.md).
- Two real bugs surfaced and fixed by the red-proof drills themselves, not found later: (1) the annotation check's initial "line directly above" logic false-FAILed on the engine tier's genuinely-correct 3-line `[3,2,1]` annotation — fixed by walking the whole contiguous comment block instead of just the immediately-preceding line; (2) the purity red-proof drill's top-level `document.body` reference threw on dynamic import before the export-completeness assertion could run, risking an uncaught crash that would have hidden the other three assertions' results — fixed by wrapping the barrel imports in try/catch and reporting the throw as a named `EXPORTS` failure.
- The pure-motion audit (throwaway script, scratch directory, not committed) mechanically confirmed every non-header/non-import/non-export/non-annotation line in both module files exists verbatim in the pre-phase `index.html` (base commit `e9cf0ceaad62f44a9af256c55dd1fc8b727de1d4`, parent of 08-01's tracer commit): **949 lines checked, 0 failures.** The same 3-line-comment nuance applied here too — the audit's first pass produced 2 false failures on the [3,2,1] annotation's continuation lines before the exclusion logic was widened to consume the whole contiguous comment block once the token line is found.
- `docs/MODULES.md` now documents the actual Phase 8 output: the `src/shared`/`src/engine` two-tier layout with the one-directional import rule, the `window.PP` bridge (its name, that it also publishes onto `globalThis` for the ~150+ pre-existing bare-identifier call sites, why both mechanisms exist, its `PP-BRIDGE`-tagged temporariness, and the Phase 11 removal target), the four-step startup order `src/main.js` drives and why the ordering is load-bearing, both standing tripwires (`__pp_module_ok`, `__pp_boot_count`) and what each catches, the retirement of the `<script>`/`escHtml` slice boundaries now that `load_engine.js` uses a native import (while confirming the separate bare-`<script>`-tag count rule still applies), and a pointer to `scripts/engine_contract_check.js`. While editing this section a pre-existing inaccuracy was also corrected: the doc had `src/ui/` and `src/net/` labeled with swapped phase numbers relative to `ROADMAP.md`'s actual Phase 9 (networking) / Phase 11 (UI) assignments.

## Red-Proof Transcript (all seven failure modes, demonstrated and restored)

**1. Purity — real violation.** Appended `const __redProofPurity = document.body;` to `src/shared/index.js`:
```
FAIL purity (ENGINE-01) — ...
FAILURES:
  - PURITY: src/shared/index.js:183 matched "document.<prop>" (found "document.body")
  - EXPORTS: importing src/shared/index.js or src/engine/index.js threw — document is not defined
exit=1
```
Restored via `git checkout -- src/shared/index.js`; re-ran, exit=0.

**2. Purity — comment false positive.** Appended the same text as `// red-proof comment: const __redProofPurity = document.body;`:
```
PASS purity (ENGINE-01) — ...
exit=0
```
Confirms comment-stripping does not produce a false positive. Restored; re-ran, exit=0.

**3. Annotation deletion.** Deleted the `DIRNAME` annotation line:
```
FAIL annotations (ENGINE-04) — ...
FAILURES:
  - ANNOTATIONS: expected exactly 7 occurrences of "ORDER IS LOAD-BEARING" across src/engine + src/shared, found 6
  - ANNOTATIONS: DIRNAME (src/shared/index.js:144) has no "ORDER IS LOAD-BEARING" annotation in the comment block directly above it
exit=1
```
Restored via `git checkout -- src/shared/index.js`; re-ran, exit=0.

**4. DAG direction.** Added `import { rollStorm } from "../engine/index.js";` to `src/shared/index.js`:
```
FAIL DAG direction (SPLIT-01/02) — ...
FAILURES:
  - DAG: src/shared/index.js imports "../engine/index.js", which resolves into src/engine/ — shared must never import engine
exit=1
```
Restored; re-ran, exit=0.

**5. Export removal (module-graph-breaking case).** Removed `ING_ALL` from `src/shared/index.js`'s export list (also imported by `src/engine/index.js`, so the whole graph fails to resolve):
```
FAIL moved-symbol completeness — ...
FAILURES:
  - EXPORTS: importing src/shared/index.js or src/engine/index.js threw — The requested module '../shared/index.js' does not provide an export named 'ING_ALL'
exit=1
```
Names the missing symbol (`ING_ALL`) inside the thrown message. Restored; re-ran, exit=0.

**5b. Export removal (clean per-name case).** Removed `COLORS` (not imported by the engine tier) instead, to confirm the per-name path rather than the import-crash path:
```
FAIL moved-symbol completeness — ...
FAILURES:
  - EXPORTS: "COLORS" is not exported by src/shared/index.js or src/engine/index.js
exit=1
```
Restored; re-ran, exit=0.

**6. Duplicate top-level declaration.** Inserted `const COLORS = ["duplicate"];` at the top of the classic script in `index.html`:
```
FAIL moved-symbol completeness — ...
FAILURES:
  - EXPORTS: "COLORS" still has a top-level declaration in index.html:862 — shadows the bridge
exit=1
```
Restored via `git checkout -- index.html`; re-ran, exit=0.

**Post-drill cleanliness:** `git status --porcelain` empty after every restore; `git status --porcelain src/ index.html` empty at the end of the sweep.

## Pure-Motion Audit Numbers

- **Total lines checked:** 949 (166 in `src/shared/index.js`, 783 in `src/engine/index.js`)
- **Failures:** 0
- **Excluded lines, by category:** header comment block = 12, import lines = 1, trailing `export { ... }` block = 2, `ORDER IS LOAD-BEARING` annotation lines (including multi-line continuations) = 9, blank lines = 11 (includes 2 trailing-newline split artifacts, one per file)
- **Pre-phase base:** `index.html` at commit `e9cf0ceaad62f44a9af256c55dd1fc8b727de1d4` (parent of 08-01's tracer commit `be1e7a1`), 5,640 lines

## Final MOVED_SYMBOLS Count

**128 names** — 120 from `src/shared/index.js`, 8 from `src/engine/index.js` (`rollStorm`, `PERSONALITY`, `AW`, `TW`, `DW`, `FISH_BASE`, `Game`, `roundCfg`). Sourced verbatim from 08-02-SUMMARY.md and 08-03-SUMMARY.md's export-list records, hardcoded into the checker rather than derived from the barrels themselves (see Decisions Made).

## Task Commits

Each task was committed atomically:

1. **Task 1: Build and wire the engine contract check** — `1d45b19` (feat)
2. **Task 2: Pure-motion audit and module contract documentation** — `51ffd39` (docs)

**Plan metadata:** committed alongside this summary (see final commit below).

## Files Created/Modified

- `scripts/engine_contract_check.js` — new, 290 lines. Four assertions (purity, annotations, DAG direction, moved-symbol completeness), scoped to `src/engine/*.js` + `src/shared/*.js` only, `process.exit(0)`/`process.exit(1)`, named per-failure messages.
- `package.json` — `test` script extended: `node scripts/determinism_baseline.js --verify && node scripts/engine_contract_check.js && node scripts/dlog_replay_test.js`. No dependency keys added.
- `docs/MODULES.md` — 242 lines (was 132): two-tier layout detail, `window.PP` bridge section, startup-order section, standing-tripwires section, retired-slice-boundaries section, engine-contract-check pointer, plus the `src/ui`/`src/net` phase-number correction.

## Decisions Made

See `key-decisions` in frontmatter for the four load-bearing decisions from this plan: the annotation-block walk (fixing a false FAIL the red-proof drills themselves surfaced), the try/catch around the barrel imports in the export-completeness assertion (preventing an uncaught crash from hiding the other three assertions' results), the matching fix in the throwaway pure-motion audit script, and the `src/ui`/`src/net` phase-number correction in `docs/MODULES.md`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Annotation check's initial single-line lookup false-FAILed on correct source**
- **Found during:** Task 1, first run of `checkAnnotations()` against the real (unmodified) source
- **Issue:** The plan's acceptance criteria describe "the line directly above" the anchor as where the annotation lives, for all seven constructs. Six of the seven annotations in `src/shared/index.js` are genuinely single-line. The seventh — the engine tier's `[3,2,1]` island-spacing literal, annotated in 08-03 — is a 3-line comment, with the `ORDER IS LOAD-BEARING` token on the first line and two lines of continuation prose before the anchor. A literal "check line idx-1 only" implementation reported a false FAIL on this real, correctly-annotated construct.
- **Fix:** Walk upward from the anchor through the contiguous run of `//`-comment lines (stopping at the first non-comment line) and check whether the token appears anywhere in that block, not just on the immediately-preceding line.
- **Files modified:** `scripts/engine_contract_check.js`
- **Verified:** Re-ran the check against the unmodified source (PASS), then re-ran red-proof drill 3 (deleting the `DIRNAME` annotation) to confirm the widened block-walk still correctly detects a genuinely missing annotation (FAIL, named `DIRNAME`).
- **Commit:** `1d45b19` (folded into Task 1's single commit — caught during the same drill session, before the commit landed)

**2. [Rule 1 - Bug] Uncaught import exception could hide the other three assertions' results**
- **Found during:** Task 1, red-proof drill 1 (purity violation)
- **Issue:** Appending a top-level `document.body` reference to `src/shared/index.js` causes that module to throw on `import()` in this DOM-free Node context (`document is not defined`). The export-completeness assertion's dynamic imports were unguarded, so this threw an uncaught exception that aborted the whole script mid-run — the purity/annotations/DAG PASS-or-FAIL lines for that run printed, but the process crashed with a Node stack trace instead of a clean `EXPORTS: ...` failure line and an orderly `process.exit(1)`.
- **Fix:** Wrapped the two dynamic `import()` calls in `checkMovedSymbolCompleteness()` in try/catch; a thrown import is reported as a named `EXPORTS: importing ... threw — <message>` failure, and the function returns `false` cleanly instead of propagating the exception.
- **Files modified:** `scripts/engine_contract_check.js`
- **Verified:** Re-ran red-proof drill 1 after the fix — all four PASS/FAIL lines print, the failure is named, `process.exit(1)` returns cleanly with no stack trace.
- **Commit:** `1d45b19` (folded into Task 1's single commit — caught during the same drill session, before the commit landed)

**3. [Rule 1 - Bug] Throwaway pure-motion audit script had the same multi-line-annotation blind spot**
- **Found during:** Task 2, first run of the audit script against the real source
- **Issue:** The audit's exclusion logic only stripped the single line containing the `ORDER IS LOAD-BEARING` token as "annotation" category. Applied to the engine tier's 3-line annotation, this left the two continuation lines in the "must match pre-phase index.html verbatim" pool — and since those two lines are entirely new prose (the pre-phase source had no annotation there at all), they correctly failed the verbatim check, but for the wrong reason: not because anything was reformatted in transit, but because the audit's own exclusion categories were too narrow.
- **Fix:** When a line containing the token is found, also consume and exclude every immediately-following contiguous `//`-comment line as part of the same annotation block.
- **Files modified:** none in the repository — the audit script itself lives in the scratch directory and is not committed, per the plan's explicit instruction not to commit it.
- **Verified:** Re-ran the audit — 0 failures, 949 lines checked, with the annotation-exclusion count correctly reflecting all 9 annotation-block lines (6 single-line shared-tier annotations + 3-line engine-tier annotation) across both files.

### Rule 4 items

None — no architectural changes were needed. All discoveries were bugs in this plan's own new tooling (the checker script and its throwaway audit counterpart), found and fixed via the plan's own mandated red-proof process, not architectural gaps in the Phase 8 code the checker verifies.

### Out-of-plan fix

**[Rule 1 - Bug] `docs/MODULES.md`'s `src/ui`/`src/net` phase-number swap corrected.** The pre-existing "The `src/` layout" section (written in Phase 7, anticipating Phases 8–11) labeled `src/ui/` as "Phase 9" and `src/net/` as "Phase 11". `ROADMAP.md` assigns Phase 9 to "Networking Layer & Watcher Cleanup" and Phase 11 to "UI Extraction, Orchestration & Bridge Removal" — the reverse. This plan's own action item required editing this exact section to fill in the Phase 8 layout, so the stale, incorrect phase numbers sitting directly above the new content were corrected in the same edit rather than left to mislead whichever agent plans Phase 9 or Phase 11 next.

## Known Stubs

None. This plan produces tooling (a contract-check script and a throwaway audit script) and documentation only — no new UI surface, no hardcoded empty values, no placeholder text.

## Issues Encountered

None beyond the three bugs caught and fixed by this plan's own red-proof/audit process (see Deviations above) — all found and fixed before any commit landed, not discovered after the fact.

## User Setup Required

None — no external service configuration required. Zero dependencies added; `package.json` still declares neither a `dependencies` nor a `devDependencies` key.

## Next Phase Readiness

- `scripts/engine_contract_check.js` is committed, wired into `npm test`, and has had all seven of its failure modes demonstrated red and restored — Phases 9 through 12 inherit a standing ENGINE-01/ENGINE-04 gate rather than a one-time manual grep.
- `docs/MODULES.md` now accurately documents the module contract Phase 9 (networking extraction) and Phase 11 (UI extraction + bridge removal) will both need to read and respect, including the exact `PP-BRIDGE` token Phase 11's removal grep depends on.
- The pure-motion audit closes out this plan's own verification scope; 08-05 (source-hash rebase) is the phase's remaining plan.
- The corpus fixtures remain untouched (one commit deep each for the `.jsonl` files and `manifest.json`) — the D-01/D-02 tripwires held before, during, and after this plan.
- No blockers.

## Self-Check: PASSED

- `scripts/engine_contract_check.js` — FOUND, confirmed via `node scripts/engine_contract_check.js` (exit 0, four PASS lines) and `git log --oneline --all | grep 1d45b19` (found)
- `package.json` test script wiring — FOUND, confirmed via `grep -q 'engine_contract_check' package.json` (exit 0) and `npm test` (exit 0)
- `docs/MODULES.md` — FOUND, confirmed via Read and all six acceptance-criteria greps (PP-BRIDGE, src/engine, src/shared, __pp_boot_count, engine_contract_check all exit 0; placeholder-language scan exits 1 as required)
- Commit `1d45b19` — FOUND in `git log --oneline --all`
- Commit `51ffd39` — FOUND in `git log --oneline --all`
- Determinism corpus untouched — confirmed via `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` (=1) and `git status --porcelain scripts/fixtures/determinism/` (empty)

---
*Phase: 08-engine-extraction-node-harness-migration*
*Completed: 2026-07-24*
