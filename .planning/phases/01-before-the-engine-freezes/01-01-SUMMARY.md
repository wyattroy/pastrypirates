---
phase: 01-before-the-engine-freezes
plan: 01
subsystem: testing
tags: [node, esm, static-analysis, gates, headless, regex]

# Dependency graph
requires: []
provides:
  - "`4/scripts/stage_import_check.js` — the first gate in this repository that loads the `4/` tree at all"
  - "`4/src/ui/stage.js` importable under Node (the 1,545-line stage layer, previously unimportable)"
  - "The `4/scripts/` gate shape, proven end to end: a `4/scripts/*.js` script importing a `4/src/**` module and returning a real exit code"
  - "`precededByAccessorKeyword()` — a narrow accessor exclusion in both byte-identical copies of `no_undef_check.js`"
  - "`node 4/scripts/no_undef_check.js` exits 0 for the first time"
affects: [01-02, 01-03, 01-04, 01-05, 01-06, 03-determinism-corpus]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Gate-imports-module: a `4/scripts/` script dynamic-imports a `4/src/` module and forces `process.exit` on both branches"
    - "Exit-on-resolve: a module-scope timer holds Node's event loop open after a SUCCESSFUL import, so the explicit exit is correctness, not tidiness"

key-files:
  created:
    - 4/scripts/stage_import_check.js
  modified:
    - 4/src/ui/stage.js
    - 4/scripts/no_undef_check.js
    - scripts/no_undef_check.js

key-decisions:
  - "The stage.js watchdog `setInterval` is left exactly as it is — the gate exits instead. Guarding a deliberate browser behaviour to make a test script terminate would change shipped behaviour to suit the harness."
  - "The accessor exclusion is a named helper (`precededByAccessorKeyword`), not an inlined condition, so it is greppable and provably identical in both copies of the checker."
  - "`CALL_RE` was deliberately NOT loosened. The narrow fix keeps the checker over-permissive rather than under-permissive, which is what its own header says it is for."

patterns-established:
  - "A 4/ gate proves it can fail before its green is believed — Task 1 by reverting the fix, Task 2 by a planted scratch fixture."
  - "Paired checkers stay byte-identical: fix both copies in one commit, and assert emptiness of `diff` as an acceptance criterion."

requirements-completed: [TEST-01, TEST-02]

coverage:
  - id: D1
    description: "4/src/ui/stage.js imports under Node without throwing, proven by a committed gate that terminates"
    requirement: TEST-01
    verification:
      - kind: integration
        ref: "node 4/scripts/stage_import_check.js"
        status: pass
      - kind: other
        ref: "negative control — guard reverted, gate exited 1 with ReferenceError"
        status: pass
    human_judgment: false
  - id: D2
    description: "4/scripts/no_undef_check.js exits 0 — real bug fixed, false positives removed by a narrow named heuristic"
    requirement: TEST-02
    verification:
      - kind: integration
        ref: "node 4/scripts/no_undef_check.js"
        status: pass
      - kind: other
        ref: "negative control — planted 4/src/zz_scratch_fixture.js, exited 1 naming :3 and :11"
        status: pass
    human_judgment: false
  - id: D3
    description: "Both copies of no_undef_check.js remain byte-identical and the 21 root gates still pass"
    verification:
      - kind: integration
        ref: "diff scripts/no_undef_check.js 4/scripts/no_undef_check.js (empty)"
        status: pass
      - kind: integration
        ref: "npm test (21 gates)"
        status: pass
    human_judgment: false

# Metrics
duration: 21min
completed: 2026-08-19
status: complete
---

# Phase 01 Plan 01: Before the Engine Freezes Summary

**The first gate in this repository that loads `4/` — a Node import check over the 1,545-line stage layer, plus a narrow accessor exclusion that takes both copies of `no_undef_check.js` to green without loosening what they catch.**

## Performance

- **Duration:** 21 min
- **Started:** 2026-08-19T00:50:00Z
- **Completed:** 2026-08-19T01:11:00Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- **`4/` is now reachable from a headless gate.** Root `npm test` runs 21 gates and not one of them opened the `4/` tree — `docs/HARD-WON-LESSONS.md` §3's "a gate's ROOT is wherever the gate's FILE lives," in its most expensive form: every green suite this project has ever run said nothing whatever about the new game. `4/scripts/stage_import_check.js` is the first that reads `4/` by importing it.
- **It caught its own reason for existing on the first run.** `4/src/ui/stage.js:190` armed `addEventListener("resize", …)` at module scope, bare. A browser resolves that off the global object and it has always worked; Node throws `ReferenceError` at module-evaluation time, before a single export exists — so the largest module in the new game could not be imported by any headless test, which is why none had ever been written.
- **The checker's three hits resolved into two different problems, and only one was a code bug.** The other two were the same source line reported twice (the getter and the setter of the bridge accessor pair at `4/src/ui/stage.js:1483`). That is a checker bug, so the checker changed and the working code did not.
- **Both failure demonstrations were performed rather than assumed** (see below). This is the acceptance criterion that distinguishes a gate from a decoration, and both gates in this plan have now been watched failing.

## Task Commits

1. **Task 1 (tracer): a `4/` gate imports `4/src/ui/stage.js` and exits 0** — `81c344b` (test)
2. **Task 2: the accessor heuristic, both checkers, still byte-identical** — `9cfe417` (fix)

**Plan metadata:** see the `docs(01-01)` commit following this summary.

## Files Created/Modified

- `4/scripts/stage_import_check.js` (created) — dynamic-imports `../src/ui/stage.js`, prints one PASS/FAIL line, forces `process.exit` on both branches.
- `4/src/ui/stage.js` — the module-scope resize registration wrapped in `if (typeof window !== "undefined")` and prefixed `window.`, matching the block-guard shape shipped at `4/src/main.js:32`. One hunk, at line 190. Nothing else in the file changed.
- `4/scripts/no_undef_check.js` — added `precededByAccessorKeyword(masked, idx)` and its single call site in `checkFile`, immediately after the existing property-call exclusion.
- `scripts/no_undef_check.js` — the identical change, in the same commit.

## Decisions Made

- **The explicit `process.exit` is load-bearing, not tidiness.** `stage.js:1449` arms a module-scope `setInterval` — playtest 22's watchdog, deliberately hung off an independent hook from the tick loop it rescues. That interval holds Node's event loop open forever *after a perfectly successful import*, so a script that awaits the promise and falls off the end hangs rather than passing. A gate that hangs CI is worse than no gate. `scripts/module_graph_check.js` set the precedent.
- **The watchdog itself is untouched.** Guarding it away to make the script terminate would have been scope creep dressed as a fix — changing deliberate shipped browser behaviour to suit the harness. The gate exits; the game does not change. Proven by the diff: `4/src/ui/stage.js` has exactly one hunk, at line 190.
- **The accessor exclusion is narrow on purpose, and that narrowness was measured, not argued.** `CALL_RE` is unchanged. The exclusion fires only when the nearest preceding *maximal* identifier run is exactly `get` or `set`. The file's own header is explicit that it is over-permissive rather than under-permissive by design; loosening `CALL_RE`, or skipping any line mentioning `get`/`set`, would have quietly retired the failure class the gate exists for.
- **Both copies changed in one commit.** The root copy exits 0 only because root `src/` happens to contain no accessor in this shape. Fixing one and not the other would have manufactured exactly the drift the intake report flagged, in the two files least likely to be read.

## Failure Demonstrations (CLAUDE.md §4 — a check nobody has seen fail is not yet a check)

**Task 1 — guard temporarily reverted:**

```
FAIL TEST-01 — 4/src/ui/stage.js threw on import:
ReferenceError: addEventListener is not defined
    at file:///Users/wyattroy/Documents/Projects/pastrypirates/4/src/ui/stage.js:194:1
```
**Exit code 1.** Fix restored; exits 0 in 0.09 s.

**Task 2 — scratch fixture planted at `4/src/zz_scratch_fixture.js`,** carrying all three cases on purpose:

```
Scanned 26 file(s) under src/**/*.js
FAIL no-undef (module-internal D-04) — 2 undeclared call-position identifier(s)
  - src/zz_scratch_fixture.js:3: "addEventListener(" — addEventListener("resize", () => {});
  - src/zz_scratch_fixture.js:11: "addEventListener(" — addEventListener("scroll", () => {});
```
**Exit code 1.** Case A (a bare browser-global call) reported. Case B (`get subject(){…}, set subject(v){…}` on the line between them) correctly silent. **Case C is the TEST-02 adjacency edge the plan named**: the second `addEventListener` sits immediately after `let budget` — a longer word *ending in* "get" — and was still reported, proving the heuristic skips only on the exact keyword and does not over-skip. Fixture deleted; scan back to 25 files, exit 0.

## Surfaces Checked (CLAUDE.md §2 — consistency)

| Surface | Verdict |
|---|---|
| `4/src/ui/stage.js:190` resize registration | Fixed — guarded and `window.`-prefixed |
| `4/src/ui/stage.js:1449` watchdog `setInterval` | **Deliberately left alone** — the gate exits instead |
| `4/src/ui/stage.js:1463` `visibilitychange` listener | Already `typeof document`-guarded; untouched |
| `4/scripts/no_undef_check.js` | Heuristic applied |
| `scripts/no_undef_check.js` | Same heuristic, same commit |
| `diff` of the two checkers | Empty — still byte-identical |
| `CALL_RE` definition line | Unchanged (0 added/removed lines in the diff) |
| 21 root `npm test` gates | All pass, the root checker among them |

## Deviations from Plan

None — plan executed exactly as written. No deviation rule was invoked; no auto-fix was needed beyond the two the plan specified.

One procedural note, recorded because it was a judgment call and not a silent one: this plan's Task 1 is `type="tracer"`, which normally halts for a human verification checkpoint before expansion when auto-advance is off. It was not halted. The tracer's `<verify>` is `<automated>`-only, the plan declares `autonomous: true` and contains no checkpoint task, and the checkpoint protocol is explicit that users are never handed CLI commands to run — Wyatt is on a phone and cannot run `node`. The substance of the tracer gate (do not pour layers onto a broken foundation) was served instead by re-running the tracer's verify end to end and by the negative control above, both before Task 2 began.

## Issues Encountered

None. Both problems were diagnosed exactly as the plan predicted, including the three-hits/two-problems split.

## User Setup Required

None — no external service configuration, and no packages installed. `package.json` declares no dependencies and this project has no build step.

## Next Phase Readiness

- **The `4/scripts/` gate path is proven and available to every remaining plan in this phase.** Plans 02, 04 and 05 each verify through a new `4/scripts/*.js` gate importing a module under `4/src/`; that shape did not work before this commit and now does.
- **Plan 02's one-time-cleanup behaviour becomes unit-testable in Node** specifically because `4/src/ui/stage.js` now imports — `cleanupLegacyTimerKey()` will live in this file.
- **Plans 02 and 04 can now edit `4/src/**` under a checker that actually reports.** Before this plan, `4/scripts/no_undef_check.js` exited 1 unconditionally, so any new violation it found would have been invisible in a sea of pre-existing noise.
- No blockers. No stubs. No deferred items.

## Self-Check: PASSED

All four claimed files exist on disk; both claimed commits (`81c344b`, `9cfe417`) exist in the log. The scratch fixture was removed — `4/src/zz_scratch_fixture.js` does not exist and the checker scans 25 files, its pre-plan count. `git diff --name-only a23af98..HEAD` lists exactly the plan's four `files_modified` and nothing under `v2/`, `v2bakeoff/`, `3/`, root `src/`, or any site-identity file. No headless Chrome or local server was started by this plan; `pgrep` for both returns nothing.

---
*Phase: 01-before-the-engine-freezes*
*Completed: 2026-08-19*
