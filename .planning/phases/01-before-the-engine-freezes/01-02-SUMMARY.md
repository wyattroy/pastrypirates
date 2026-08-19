---
phase: 01-before-the-engine-freezes
plan: 02
subsystem: storage
tags: [localstorage, namespacing, migration, gates, multi-app-origin, fix-01]

# Dependency graph
requires:
  - "01-01 — `4/src/ui/stage.js` importable under Node. This plan's gate imports `cleanupLegacyTimerKey` from it; before 01-01 that import threw at module-evaluation time and the behaviour half of the gate could not have been written."
provides:
  - "`pp4_timerOff` — the new game's own turn-clock preference key, at all five `4/`-side sites"
  - "`cleanupLegacyTimerKey(store)` — exported from `4/src/ui/stage.js`; the one-time, marker-guarded removal of the shared legacy key"
  - "`pp4_timerOffCleaned` — the one-time cleanup marker"
  - "`4/scripts/pp4_timeroff_check.js` — 32 assertions gating both the source shape and the cleanup's runtime behaviour"
  - "D-04 applied in practice: the first per-game/shared split under 'share who you are, split how you play'"
affects: [06-cutover, 02-multiplayer-revival]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Injectable storage: a storage-touching function takes `store` as a parameter rather than closing over `localStorage`, so its behaviour is drivable against a fake store under Node for one argument's cost"
    - "Marker-guarded one-time cleanup: read a marker with `!= null`, act, set the marker — the legacy VALUE is never read, so no falsy-but-present value can be skipped"
    - "Quoted-is-code, bare-is-prose: a raw-substring gate counts quoted key literals, so key names in comments are written unquoted and the code says why"

key-files:
  created:
    - 4/scripts/pp4_timeroff_check.js
  modified:
    - 4/src/ui/stage.js
    - 4/src/orchestrator.js
    - 4/src/ui/util.js

key-decisions:
  - "The legacy value is never read at all — `removeItem()` is unconditional and only the MARKER is tested, with `!= null`. This is what makes 'ran and found nothing' distinguishable from 'never ran', and what stops an empty-string or \"0\" legacy key being skipped as falsy."
  - "`cleanupLegacyTimerKey` takes `store` as a parameter. Passing storage in is the entire reason the D-02 guarantee is provable in Node against a fake store rather than asserted by reading the code."
  - "Key names in prose comments are written UNQUOTED, and the function header says so explicitly. Three comment lines broke the plan's own acceptance counts on the first run — the HARD-WON-LESSONS §1b trap, where a gate that cannot tell prose from code makes writing the explanation an offence."
  - "The stale `4/src/ui/util.js:1893` session-schema comment was corrected rather than worked around. It read as though the clock key were structurally exempt from all cleanup; its actual scope is the resumable-blob auto-clear only."
  - "The gate is not wired into `npm test`. That suite is the root gates and no `4/` gate is in it yet; wiring one in is a separate decision, not this plan's."

patterns-established:
  - "A storage migration proves its guard by test, not by reading: the D-02 second-load case is driven against a fake store that records removal attempts, so 'did not delete' cannot be confused with 'deleted then restored'."
  - "A brace-matching source scanner ships with controls whose values are already known, so a broken scanner fails loudly instead of letting the assertion it feeds go vacuous."

requirements-completed: [FIX-01]

coverage:
  - id: D1
    description: "All five 4/-side turn-clock sites read and write the per-game key; the legacy literal survives exactly once, inside the cleanup (D-01)"
    requirement: FIX-01
    verification:
      - kind: integration
        ref: "node 4/scripts/pp4_timeroff_check.js — D-01 assertions (exactly one legacy literal, at 4/src/ui/stage.js:1522; >=2 per-game lines in stage.js, >=3 in orchestrator.js)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The cleanup runs at most once per browser — a re-planted legacy key survives the next load untouched (D-02)"
    requirement: FIX-01
    verification:
      - kind: integration
        ref: "node 4/scripts/pp4_timeroff_check.js — case 4, three assertions incl. 'no removal was even attempted'"
        status: pass
      - kind: other
        ref: "negative control — marker guard replaced with `if (false) return false;`, 4 assertions failed by name, exit 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "FIX-01 empty edge — absent, empty-string and \"1\" legacy keys all reach the same terminal state (key gone, marker set); the marker is what is read, never the legacy value"
    requirement: FIX-01
    verification:
      - kind: integration
        ref: "node 4/scripts/pp4_timeroff_check.js — cases 1, 2, 3, plus case 2's second call returning false"
        status: pass
    human_judgment: false
  - id: D4
    description: "FIX-01 empty edge, storage failure — a store whose every method throws returns false, throws nothing, logs nothing"
    requirement: FIX-01
    verification:
      - kind: integration
        ref: "node 4/scripts/pp4_timeroff_check.js — case 5"
        status: pass
    human_judgment: false
  - id: D5
    description: "The turn-clock default is unchanged and still OFF in 4/ (D-03), and the three shared identity keys are still un-prefixed (D-04)"
    verification:
      - kind: integration
        ref: "node 4/scripts/pp4_timeroff_check.js — D-03 seed assertions and three D-04 presence assertions"
        status: pass
    human_judgment: false
  - id: D6
    description: "The live game's own files under root src/ are not modified — the leak is fixed from the 4/ side only"
    verification:
      - kind: integration
        ref: "git diff --name-only fbf1088~1..HEAD | grep -v '^4/' — empty"
        status: pass
    human_judgment: false
  - id: D7
    description: "Runtime behaviour in a browser that already has the legacy key planted"
    requirement: FIX-01
    verification:
      - kind: manual
        ref: "deferred to plan 06 by this plan's own output note — the structural gate proves the source no longer writes the shared key; it cannot prove what a browser carrying the old key does"
        status: pending
    human_judgment: true

# Metrics
duration: 8min
completed: 2026-08-19
status: complete
---

# Phase 01 Plan 02: Before the Engine Freezes Summary

**The new game stops writing the live game's turn-clock key — five sites moved to `pp4_timerOff`, the shared key deleted exactly once per browser behind a marker guard, and a 32-assertion gate that has been watched failing on the assertion that matters.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-08-19T00:58:49Z
- **Completed:** 2026-08-19T01:06:10Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- **The only defect in this phase that reaches real players today is closed.** `playpastrypirates.com` and `playpastrypirates.com/4` are two games on one origin, so they share one localStorage namespace. The new game wrote the un-namespaced turn-clock key; the live game reads it at `src/orchestrator.js:1399` and **pushes it to the whole room** at `:1404`. Opening `/4` switched the clock off in the game real players play, and a host who had visited `/4` handed that setting to everyone at their table. Site 5 in the sweep — `4/src/orchestrator.js:1579` — is the one that reached other people, and it is the reason this could not wait for any promotion decision.
- **The deletion is guarded, and the guard is the whole design.** An unguarded cleanup would have re-committed the identical defect from the opposite direction: every time a live-game session set the shared key, the next `/4` load would wipe it again, permanently. D-02 exists to stop that, and it is now the assertion this plan's gate is built around.
- **The gate was watched failing, and its failure output is the bug in miniature.** With the marker guard bypassed, `case 4 (D-02): the re-planted legacy key SURVIVES untouched` reported `got=null want="1"` — the live game's preference, deleted by the new game, rendered as a test result.
- **The implementation never reads the legacy value.** `removeItem()` is unconditional and only the marker is tested, with `!= null`. `""` and `"0"` are both legitimate stored values and both falsy; a truth-test would have skipped an empty-string legacy key as though there were nothing to remove, and treated a browser storing `"0"` as never cleaned. That is HARD-WON-LESSONS §3's falsy zero, and the plan named it as the edge to get right.

## Task Commits

1. **Task 1: the five sites plus the one-time, marker-guarded cleanup** — `fbf1088` (fix)
2. **Task 2: the FIX-01 gate — source shape and real behaviour** — `219ded9` (test)

**Plan metadata:** see the `docs(01-02)` commit following this summary.

## Files Created/Modified

- `4/scripts/pp4_timeroff_check.js` (created, 249 lines) — 32 assertions in two halves; runs in 0.12 s; explicit `process.exit`.
- `4/src/ui/stage.js` — the menu toggle and the `initStage()` seed moved to the per-game key; `cleanupLegacyTimerKey(store)` added immediately above `initStage()` and called as its first statement behind its own try/catch.
- `4/src/orchestrator.js` — the sheet toggle, the read, and the read that pushes to the room; plus the stale key name in the surrounding comment and a note recording what the key used to be and why.
- `4/src/ui/util.js` — one comment corrected (see Decisions).

## Surfaces Checked (CLAUDE.md §2 — consistency)

The five `4/`-side turn-clock sites, each named individually as the plan required:

| # | Site | What it is | Verdict |
|---|---|---|---|
| 1 | `4/src/ui/stage.js:915` | the ☰ menu toggle | moved to `pp4_timerOff` |
| 2 | `4/src/ui/stage.js:1537` | the force-write — `initStage()`'s off-by-default seed | moved; **default untouched** |
| 3 | `4/src/orchestrator.js:184` | the sheet toggle (`toggleTimer`) | moved to `pp4_timerOff` |
| 4 | `4/src/orchestrator.js:1574` | the read that sets `appState.timerOff` | moved to `pp4_timerOff` |
| 5 | `4/src/orchestrator.js:1579` | **the read that pushes to the room** via `netSetTimerOff` | moved — this is the site that reached other players |

The three shared identity keys, confirmed untouched and still un-prefixed (D-04, *share who you are, split how you play*):

| Key | Where | Verdict |
|---|---|---|
| `pp_id` | `4/src/ui/util.js:1904-1905` | **stays shared** — identity follows the player across both games |
| `pp_lastName` | `4/src/ui/util.js:1915,1918` | **stays shared** — display name, not behaviour |
| `pp_muted` | `4/src/ui/audio.js:49` | **stays shared** — about the player's surroundings, not the game |

Namespacing any of these would break the player's own name and id at the Phase 6 cutover, when the promoted game and `/classic` share one origin. All three are asserted as **present** by the gate, never as absence-of-a-prefixed-variant — an absence assertion is satisfied by an empty tree and would stay green if the keys were deleted outright.

The two `4/`-only keys, confirmed not to need changing:

| Key | Verdict |
|---|---|
| `pp_rematch` | **`4/`-only** — the live game does not read it. Nothing to split. |
| `pp_seaIdx` | **`4/`-only** — the live game has no `SEA_CREATURES` list at all. Nothing to split. |

Other surfaces swept:

| Surface | Verdict |
|---|---|
| Root `src/orchestrator.js:177,1399,1404` | **read only, never edited** — this is the live game's side of the leak. Confirming which key it reads is how the fix was aimed. |
| `4/src/ui/util.js:1893` session-schema comment | wording corrected — it read as a blanket exemption; its real scope is the resumable-blob auto-clear |
| `4/src/ui/audio.js:47,182` | left alone — both mention the key in prose as the try/catch-swallow precedent, which is still true and still the convention this cleanup copies |
| `PP4_STAMP` (`4/src/ui/stage.js:32`) | **untouched** — 0 diff lines. The orchestrator owns that line. |
| `CNAME` / `robots.txt` / `sitemap.xml` | untouched |

## Decisions Made

- **The legacy value is never read.** Only the marker is tested, and with `!= null`. This is what makes "ran and found nothing" distinguishable from "never ran" — the marker carries that, not the legacy key's presence — and it is why an empty-string legacy key is removed rather than skipped. Driven as three separate cases (absent / empty string / `"1"`), all reaching the same terminal state.
- **`store` is a parameter, not a closed-over `localStorage`.** One argument buys the entire D-02 guarantee as a *test* rather than as a claim about code somebody read. The plan was explicit that D-02 must be proven by test, and that is only possible because 01-01 made `stage.js` load under Node.
- **The cleanup is called behind its own try/catch inside `initStage()`**, on top of the try/catch inside the function. A browser can throw on merely touching `localStorage` (Safari private mode); a housekeeping call must not be able to take the boot path down.
- **Key names in prose are written unquoted, and the code says why.** The gate counts quoted literals, so a key name in a comment turns it red. That is HARD-WON-LESSONS §1b — *a check that cannot tell prose from code makes writing the explanation an offence* — and it fired here on the first acceptance run, on three comment lines. Rather than teach the gate to strip comments (which `ui_contract_check.js`'s own header deliberately refuses to do), the comments follow the convention the codebase already used: every pre-existing prose mention of these keys in this repo is bare, every code occurrence is quoted. A note in `cleanupLegacyTimerKey`'s header warns the next editor.
- **The stale comment was corrected, not routed around.** `4/src/ui/util.js:1893` said the clock key is *"structurally excluded from this mechanism (D-03) — never versioned/cleared"*, which reads like a prohibition on any cleanup at all. Its actual scope is the `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` resumable-blob auto-clear. Left as written it would have stopped a future reader from making exactly this fix. HARD-WON-LESSONS §5: *a justification rots independently of the behaviour it justifies.*
- **The gate is not wired into `npm test`.** That suite is the 21 root gates and no `4/` gate is in it yet — 01-01 did not wire `stage_import_check.js` in either. Wiring the `4/` gates into a suite is a real decision with its own blast radius and it is not this plan's.

## Failure Demonstration (CLAUDE.md §4 — a check nobody has seen fail is not yet a check)

The marker guard at `4/src/ui/stage.js:1521` was temporarily replaced with `if (false) return false;`, making the cleanup run on every call — the delete-on-every-load that D-02 forbids. Four assertions went red, by name:

```
  FAIL  case 2: a second call now returns false — ran-and-found-nothing is not never-ran  got=true  want=false
  FAIL  case 4 (D-02, second load, legacy re-planted): returns false                      got=true  want=false
  FAIL  case 4 (D-02): the re-planted legacy key SURVIVES untouched                       got=null  want="1"
  FAIL  case 4 (D-02): no removal was even attempted                                      got=1     want=0
```

**Observed exit code: 1.** (Green run: exit 0, 0.12 s, 32 passing.)

The third line is the entire bug rendered as a test result: `got=null` is the live game's preference, deleted by the new game. Guard restored via `git checkout -- 4/src/ui/stage.js`; the gate is green again and the neutered line is gone (`grep -c` returns 0).

**The RED came before the implementation too.** Task 1 is `tdd="true"`, and its `<behavior>` block was driven against the unmodified `stage.js` before a line was changed: `FAIL cleanupLegacyTimerKey is exported as a function — got="undefined"`, **exit code 1**. That driver lived in the scratch directory and was not committed — the committed expression of those same five cases is Task 2's gate, which is where the plan assigns them. Recorded here because "the test failed first" is a claim, and this is the evidence for it.

## Guards the gate carries against itself

The brace-matching scanner that locates `cleanupLegacyTimerKey`'s body is unreviewed code, and it is the one part that could quietly blank the thing it inspects — which would let the "the legacy literal sits inside the cleanup" assertion go **vacuous** rather than red. It ships with four controls whose values are already known: the body was extracted at all, is plausibly sized (50–2000 chars), contains `store.removeItem(`, and stops before `initStage`. The scanner also skips string and template literals and both comment forms, so a brace inside a quoted string cannot miscount.

The scan prints its file count (**25**) and asserts it is at least 20. A green run over an empty tree is a shape this project has shipped before (HARD-WON-LESSONS §3); a count is falsifiable where a bare "OK" is not.

The fake store **records the keys `removeItem` was called with**, because the D-02 case turns on *no removal was attempted* — which a store reporting only final contents cannot distinguish from *removed, then something put it back*.

## Verification

| # | Check | Result |
|---|---|---|
| 1 | `node 4/scripts/pp4_timeroff_check.js` | exit 0 — 32 assertions, 0.12 s |
| 2 | `node 4/scripts/stage_import_check.js` | exit 0 |
| 3 | `node 4/scripts/no_undef_check.js` | exit 0 — 25 files scanned |
| 4 | `npm test` (21 root gates) | exit 0 |
| 5 | Diff scope — `git diff --name-only fbf1088~1..HEAD` | exactly `4/scripts/pp4_timeroff_check.js`, `4/src/orchestrator.js`, `4/src/ui/stage.js`, `4/src/ui/util.js`. Filtering `grep -v '^4/'` prints **nothing** — no file under root `src/` appears. |
| 6 | Deletions in either commit | none |
| 7 | `PP4_STAMP` | 0 diff lines; still `"2026-08-18a"` |
| 8 | Site-identity files | `CNAME` / `robots.txt` / `sitemap.xml` untouched |
| 9 | Stray processes (CLAUDE.md §3) | no headless Chrome, no local server — none were started |

**Planning health check:** `degraded`, **0 errors**. Every warning is known noise per `docs/PLANNING-HEALTH.md` — eight `W019` unrecognised-file warnings on files Wyatt keeps deliberately, and `I001` on plans 03–06 having no SUMMARY, which is correct because they have not run yet. Nothing actionable surfaced.

## Deviations from Plan

**None from the plan's instructions.** All five sites, the cleanup shape, the marker semantics, the try/catch placement and the gate's two halves were built exactly as written.

One **authoring adjustment**, recorded because it changed committed text and was a judgment call rather than a mechanical step: the explanatory comments were first written with the key names in quotes, which broke two of the plan's own acceptance counts (`grep -c '"pp4_timerOff"' 4/src/ui/stage.js` returned 3 instead of 2; the legacy-literal sum returned 4 instead of 1). Three comment lines were the cause. Rewriting those mentions bare satisfies the criteria and matches the convention the codebase already followed. No deviation rule was invoked — this is the plan's own acceptance criteria being met, and the alternative (weakening the gate to strip comments) is the trap `ui_contract_check.js`'s header names outright.

## Issues Encountered

None beyond the comment-quoting adjustment above, which the acceptance criteria caught on the first run — which is what they are for.

## User Setup Required

None. No packages installed, no external service configuration, no build step. Nothing for Wyatt to run — the verification here is all headless.

## Next Phase Readiness

- **FIX-01 is closed at the source level and gated.** No `4/` code path can write the shared key without turning `4/scripts/pp4_timeroff_check.js` red.
- **One check is deliberately deferred, and it is named in the plan's own output note:** the structural gate proves the source no longer *writes* the shared key; it cannot prove the runtime behaviour of a browser that already has the old key planted. **Plan 06 carries that check** (`VALIDATION.md` Manual-Only). Recorded as coverage item D7, `status: pending`, `human_judgment: true` — it is the only outstanding item from this plan.
- **D-04 now has a worked example.** *Share who you are, split how you play* is no longer only a written rule — the split and the three deliberate non-splits are both in code and both asserted, so the Phase 6 cutover has a precedent to copy rather than a decision to re-take.
- **The one-way door is walked through.** Deleting a localStorage key cannot be undone on a device. Wyatt chose exactly this on 2026-08-18 (D-01, *"Not migrate, not leave"*), and both affected populations recover with one tap of the existing toggle.
- No blockers. No stubs. No deferred items beyond D7 above.

## Self-Check: PASSED

The created file exists on disk (`4/scripts/pp4_timeroff_check.js`) and all three modified files exist. Both claimed commits are in the log: `fbf1088` (fix) and `219ded9` (test). The claimed exit codes were all re-run after the failure demonstration was reverted, not quoted from memory. The neutered guard line is gone — `grep -c "TEMPORARILY NEUTERED" 4/src/ui/stage.js` returns 0 and the real guard is back at line 1521. `git diff --name-only fbf1088~1..HEAD | grep -v '^4/'` prints nothing, so root `src/` — the live game — is untouched, and no site-identity file appears in the diff. `PP4_STAMP` is unchanged at `"2026-08-18a"`. No headless Chrome and no local server were started by this plan; `pgrep` for both returns nothing.

---
*Phase: 01-before-the-engine-freezes*
*Completed: 2026-08-19*
