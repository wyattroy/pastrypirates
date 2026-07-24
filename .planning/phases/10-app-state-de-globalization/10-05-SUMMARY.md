---
phase: 10-app-state-de-globalization
plan: 05
subsystem: infra
tags: [de-globalization, code-migration, tooling-bug]

# Dependency graph
requires:
  - phase: 10-app-state-de-globalization (10-01)
    provides: "scripts/lib/js_region_tokenizer.js, scripts/migrate_app_state.js, src/state/index.js (appState), the appState naming decision"
  - phase: 10-app-state-de-globalization (10-02)
    provides: "the local-parameter-shadowing failure mode + the fix pattern (rename the local, not the bridge)"
  - phase: 10-app-state-de-globalization (10-04)
    provides: "43 of 46 names migrated (room + 7 + 9 + 26); confirmed `game`/`timer`/`logLines` as the only remainder"
provides:
  - "index.html: game (418 identifier-position sites), timer, and logLines fully migrated to appState.NAME at every read/write site"
  - "All 46 app-state names now `appState.`-qualified — scripts/state_contract_check.js's all 5 assertions PASS (assertions 1/2 were expected-red through 10-01..10-04, now green)"
  - "A third scope-collision precedent: the migration tool's full-statement declaration-removal logic can mangle a multi-declarator statement when ALL its remaining declarators are migrated in one pass, producing syntactically-valid-but-semantically-wrong code (`lettimer=null,...` — a comma-expression assigning to an undeclared global, not a SyntaxError) instead of blanking the line as it correctly did for db/myId/mySeat/isHost/roster in 10-03"
affects: [10-06, 10-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "When migrating ALL remaining declarators of a `let`/`const` statement in one --migrate call, always diff/read the declaration line itself, not just --check-names/--extract-strings/node --check — a comma-expression fallback can be syntactically valid (passes node --check) while being semantically broken (assigns to an implicit undeclared global under \"use strict\", a runtime ReferenceError, not a parse-time SyntaxError)."

key-files:
  created: []
  modified:
    - index.html

key-decisions:
  - "Manually blanked index.html:864 (the fully-emptied `let game=null,timer=null,logLines=[];` declaration) to match the established precedent from 10-03's db/myId/mySeat/isHost/roster full-removal — an empty line where the statement was, not a deleted line, preserving downstream line numbers — rather than special-casing the migration tool for this one occurrence."

patterns-established:
  - "Pattern: after any --migrate run that empties a multi-declarator statement entirely, always Read the declaration line directly (not just run --check-names) — the tool's declaration-removal path has a known blind spot when the LAST declarator(s) are removed in the same pass that empties the statement."

requirements-completed: [GLOBAL-01]  # Migration surface complete (all 46 names); GLOBAL-01's remaining sub-requirement (wiring state_contract_check.js into npm test, D-11) finishes in 10-06.

coverage:
  - id: D1
    description: "game (418 sites), timer (declaration-only, confirmed dead state), and logLines migrated to appState.NAME at every read/write site in index.html:859-4667, including the new-Game construction/reset paths (appState.game=new Game(...)) and the multi-declarator declaration line"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "node scripts/migrate_app_state.js --check-names game,timer,logLines — PASS all three, zero bare occurrences"
        status: pass
      - kind: unit
        ref: "node scripts/state_contract_check.js — 5/5 assertions PASS (all 46 names)"
        status: pass
      - kind: other
        ref: "node --check on the extracted classic-script region (index.html:860-4666) — clean"
        status: pass
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (30/30 seeds)"
        status: pass
      - kind: other
        ref: "npm test — exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Byte-safety: the six $(\"game\") DOM-id string lookups and the badge-byline UI copy (\"Pirated for the love of the game.\") remain byte-identical after migrating the identifier `game` — the confirmed string-literal collision, the phase's top hazard"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "grep -c '\\$(\"game\")' index.html — 6 (unchanged)"
        status: pass
      - kind: unit
        ref: "grep -c 'love of the game' index.html — 1 (unchanged)"
        status: pass
      - kind: unit
        ref: "diff <(node scripts/migrate_app_state.js --extract-strings HEAD:index.html) <(node scripts/migrate_app_state.js --extract-strings index.html) — empty"
        status: pass
    human_judgment: false
  - id: D3
    description: "Determinism corpus stays frozen at 1 commit deep — no --capture was ever run"
    requirement: "GLOBAL-01"
    verification:
      - kind: unit
        ref: "git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l -> 1"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-07-24
status: complete
---

# Phase 10 Plan 05: game/timer/logLines Migration Summary

**Migrated the phase's heaviest and highest-collision name (`game`, 418 sites) plus `timer` and `logLines` to `appState.NAME`, proved the confirmed `$("game")` DOM-id string-literal collision stayed byte-identical, and fixed a genuine migration-tool bug where the fully-emptied declaration statement collapsed into a syntactically-valid-but-wrong comma expression instead of a blank line — all 46 app-state names are now migrated.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-24T22:19Z (approx, following 10-04 completion)
- **Completed:** 2026-07-24T22:34Z
- **Tasks:** 1 (automated)
- **Files modified:** 1

## Accomplishments

- Confirmed the pre-migration baseline: `$("game")` count 6, `love of the game` count 1, `timer` confirmed NOT an active interval handle (declaration-only, per 10-01's `TIMER_IS_ACTIVE_INTERVAL_HANDLE = false` classification), no local function/arrow parameter or `let`/`const` shadowing collisions for any of the three names.
- Ran `node scripts/migrate_app_state.js --migrate game,timer,logLines` — rewrote all 418 identifier-position occurrences of `game` plus every `timer`/`logLines` site to `appState.NAME`, including the `appState.game=new Game(...)` reassignment sites (both the fresh-game and resume-reset construction paths) and every property-access chain (`game.round`, `game.cfg.tradeBonus`, `game.players[i]`, etc.).
- **Found and fixed a genuine migration-tool bug**: the declaration line `let game=null,timer=null,logLines=[];` — all three of whose declarators were being migrated in this single pass — collapsed into `lettimer=null,appState.logLines=[];` instead of the expected blank line. This is NOT a `SyntaxError` (so `node --check` alone would not have caught it): `lettimer` tokenizes as one new identifier, and the whole line parses as a valid comma-expression statement that silently assigns `null` to an implicit undeclared global `lettimer` under `"use strict"` (a runtime `ReferenceError` on write, not a parse failure) — a much harder-to-detect failure mode than a hard syntax error. Confirmed via direct comparison against 10-03's precedent (the `db, myId, mySeat, isHost, roster` full-removal at index.html:3896, which correctly left an empty line) that the tool CAN handle full-statement removal correctly elsewhere; this was a bug specific to this statement's shape, not a fundamental tool limitation. Manually blanked the line to match that precedent.
- Verified the confirmed string-literal collision survived: all six `$("game")` DOM-id lookups and the badge-byline (`"Pirated for the love of the game."`) are byte-identical (counts unchanged: 6 and 1), and the `--extract-strings` byte-safety diff (HEAD vs working tree) is empty — proving no string/comment content anywhere in the file was touched.
- Grepped the full post-migration file for any remaining bare `game=`, `timer`, or `logLines` outside `appState.`-qualification: all remaining hits are comments/UI-copy strings (as the 10-01 `timer` classification predicted — 21 of 22 raw "timer" occurrences are prose), zero are code.
- Ran the full 46-name `--check-names` sweep: all 46 names PASS with zero bare occurrences — the phase's entire migration surface is now complete.
- Ran `scripts/state_contract_check.js`: all 5 assertions now PASS, including assertions 1 (no leftover top-level declaration) and 2 (no leftover bare usage), which were expected-red through 10-01 through 10-04 by design and are now green.
- `node --check` on the extracted classic-script region (index.html:860-4666) passes cleanly post-fix.
- `node scripts/determinism_baseline.js --verify`: 30/30 seeds pass, source hash unchanged.
- `npm test`: full suite (determinism, engine_contract_check, dlog_replay_test, net_registry_test, net_contract_check) exits 0.
- Corpus tripwire confirmed unchanged: `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` returns 1.

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate game, timer, logLines - with the DOM-id string collision proven safe** - `30ea2a0` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `index.html` - `game` (418 sites), `timer`, and `logLines` migrated to `appState.NAME` at every read/write site; the fully-emptied declaration statement at line 864 manually blanked (matching the 10-03 precedent) after the migration tool mangled it into a comma-expression bug.

## Decisions Made

- **Manually fixed the declaration-line bug rather than special-casing the migration tool.** The tool's full-statement-removal path worked correctly in 10-03 (db/myId/mySeat/isHost/roster, all 5 declarators removed in one pass, line correctly blanked) but failed here (game/timer/logLines, all 3 declarators removed in one pass, line corrupted into a comma-expression). Since 10-06/10-07 are the last two plans and touch no further declaration statements with this shape, and the bug's fix (blank the line, matching the already-proven-correct precedent) is a one-line, fully-verified change, fixing it inline was lower-risk than debugging and patching the tokenizer's declarator-removal logic for a code path that will not run again in this phase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Migration tool corrupted the fully-emptied `let game=null,timer=null,logLines=[];` declaration into a silently-wrong comma expression**
- **Found during:** Task 1, reviewing the declaration line directly per the plan's `<read_first>` instruction to record exact byte spans before and after
- **Issue:** All three declarators (`game`, `timer`, `logLines`) in the statement at `index.html:864` were being migrated in this single `--migrate` call — the same shape as 10-03's fully-correct removal of `db, myId, mySeat, isHost, roster`. Here, however, the tool produced `lettimer=null,appState.logLines=[];` instead of a blank line. This is not a hard parse failure: `lettimer` lexes as a single new identifier (no whitespace between `let` and `timer` survived the rewrite), so the whole statement re-parses as a legal comma-expression `lettimer=null, appState.logLines=[];` — an implicit-global assignment that throws only at runtime under `"use strict"`, never at `node --check` time. `--check-names game,timer,logLines` also reported PASS (misleadingly) because `timer` here is technically bound to a new bare identifier `lettimer`, not literally the token `timer` the checker searches for as a standalone word... actually the checker's own word-boundary regex did not flag it either way — the point is this class of bug slips past both the syntax checker and the name checker, and only a direct read of the line (or a runtime execution) surfaces it.
- **Fix:** Manually blanked line 864 (removed the corrupted statement entirely, leaving an empty line), matching the established blank-line precedent from 10-03's `db, myId, mySeat, isHost, roster` full-removal at `index.html:3896`. `appState.game`, `appState.timer`, and `appState.logLines` are already seeded with their defaults in `src/state/index.js` (from 10-01), so no re-declaration is needed.
- **Files modified:** `index.html`
- **Verification:** `node --check` on the extracted classic-script region passes post-fix; `--check-names game,timer,logLines` PASS (zero bare occurrences, verified directly); full 46-name `--check-names` sweep PASS; `state_contract_check.js` 5/5 PASS; `--extract-strings` byte-safety diff stayed empty throughout (the fix touches only code, not strings/comments); `determinism_baseline.js --verify` 30/30; full `npm test` suite green.
- **Committed in:** `30ea2a0` (Task 1 commit) — fix developed and verified together with the migration before committing; no broken intermediate state was ever committed.

---

**Total deviations:** 1 auto-fixed (Rule 1 — broken behavior, not architectural)
**Impact on plan:** Essential for correctness — the migration as generated by the tool alone would have shipped a silent runtime bug (an implicit-global write under strict mode) that neither the syntax checker nor the automated `--check-names` gate would have caught, and that would only have surfaced as a `ReferenceError` the first time the game actually ran in a browser. No scope creep: only the three assigned names were touched, plus the one declaration-line fix their migration forced.

## Issues Encountered

None beyond the deviation documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 46 of 46 app-state names are now migrated (`room` from 10-01, 7 replay/resume names from 10-02, 9 net-consumed identity/session names from 10-03, 26 shot-clock/live/prompt names from 10-04, plus `game`/`timer`/`logLines` from this plan). The migration surface of GLOBAL-01 is complete.
- `scripts/state_contract_check.js` now passes all 5 assertions (previously expected-red on assertions 1/2) — confirmed clean, ready for 10-06 to wire it into `npm test`'s chain.
- The confirmed top hazard of the entire phase (the `game` identifier vs. the `$("game")` DOM-id string and the badge-byline prose) is proven safe: byte-identical, verified by both explicit grep counts and the tokenizer's own byte-safety diff.
- A third scope-collision failure mode is documented for any future de-globalization work reusing this tokenizer: a fully-emptied multi-declarator statement can silently corrupt into a comma-expression rather than a hard syntax error — always read the declaration line directly, not just trust `--check-names`/`node --check`.
- 10-06 remains: wire `window.__pp_app_state_debug`, finalize `state_contract_check.js` into `npm test`, and document `src/state/` + all four debug hooks in `docs/MODULES.md`. 10-07 remains: the live-browser verification checkpoint (GLOBAL-02's click-through, two-tab multiplayer, Chrome-only per D-12).
- No blockers.

---
*Phase: 10-app-state-de-globalization*
*Completed: 2026-07-24*

## Self-Check: PASSED
