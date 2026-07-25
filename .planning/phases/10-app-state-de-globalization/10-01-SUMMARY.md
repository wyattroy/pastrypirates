---
phase: 10-app-state-de-globalization
plan: 01
subsystem: infra
tags: [tokenizer, code-migration, module-bridge, firebase, multiplayer]

# Dependency graph
requires:
  - phase: 09-networking-layer-watcher-cleanup
    provides: window.PP bridge (window.PP/globalThis), window.__pp_net_debug, the PP-BRIDGE tagging convention
provides:
  - "scripts/lib/js_region_tokenizer.js — the shared string/comment/regex-aware tokenizer for the classic-script region"
  - "scripts/migrate_app_state.js — the --migrate/--extract-strings/--check-names tool, proven correct on room"
  - "src/state/index.js — one plain object exported as appState, seeded with all 46 app-state defaults"
  - "appState published by reference through the window.PP bridge (src/main.js)"
  - "scripts/state_contract_check.js — the 5-assertion standing gate (not yet wired into npm test)"
  - "index.html: room fully migrated to appState.room end-to-end, verified live in Chrome"
affects: [10-02, 10-03, 10-04, 10-05, 10-06, 10-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single shared mutable object published by reference through window.PP/globalThis (not a snapshot) — the only mechanism that survives the classic-script/ES-module boundary for reassigned state"
    - "Tokenizer-scoped, declarator-list-aware mechanical migration (never blind regex) for renaming bare identifiers to object-property references across a 3800-line classic script"

key-files:
  created:
    - scripts/lib/js_region_tokenizer.js
    - src/state/index.js
    - scripts/state_contract_check.js
  modified:
    - scripts/migrate_app_state.js
    - src/main.js
    - index.html

key-decisions:
  - "Exported/bridged app-state identifier is `appState`, not the RESEARCH/CONTEXT-illustrative `state` — `state` already exists as a local parameter/variable name in the classic script (broadcastFlip(state), setFlipCoin(state), coinHTML(state,...), setRecoveryState(state), a local const in setClockUI()); publishing the container as `state` would silently shadow it inside those functions and send wrong data to Firebase with no error. Grep-confirmed zero prior `appState` occurrences before choosing it. Within CONTEXT.md's delegated discretion over the module's exact name."
  - "Tokenizer treats template-literal interpolations (${...}) as CODE, not opaque string content, since real app-state reads occur inside interpolations in this file (e.g. game.round) — treating the whole template as a string would silently miss migration targets."
  - "Tokenizer includes a regex-literal mode with a regex-vs-division disambiguator, added mid-task after discovering `escHtml`'s `/[&<>\"]/g` (a literal `\"` inside a character class) corrupted downstream string/comment classification when regex literals weren't recognized as their own lexical category."
  - "Object-literal shorthand and property-key positions are structurally distinguished from bare-reference positions (via a lightweight bracket-context + object-vs-block heuristic) so `{room,mySeat,isHost}` correctly expands to `{room:appState.room,mySeat,isHost}` and `room:room||null` correctly becomes `room:appState.room||null` (key untouched, value migrated) rather than producing a SyntaxError or silently wrong Firebase field names."

patterns-established:
  - "Pattern: any future de-globalization migration in this codebase reuses scripts/lib/js_region_tokenizer.js rather than a fresh regex pass — it is the single point that understands strings/comments/regex/template-interpolation in the classic-script region."

requirements-completed: []  # GLOBAL-01/GLOBAL-03 partially addressed (tracer proves the mechanism on 1 of 46 names) — not marked complete until 10-06 finishes the bulk migration.

coverage:
  - id: D1
    description: "Tracer pipeline (tokenizer + migration tool + state module + bridge) proven end-to-end on `room`, verified live in two Chrome tabs with real Firebase room create/join"
    verification:
      - kind: automated_ui
        ref: "Chrome DevTools console session (coordinator, localhost:8777) — window.__pp_module_ok, window.PP.appState shape/reference-identity, appState.room reassignment tracking across two room-create runs, clean console"
        status: pass
      - kind: integration
        ref: "node scripts/determinism_baseline.js --verify (30/30 seeds)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Byte-safety: string-literal and comment content of index.html unchanged by the room migration"
    verification:
      - kind: unit
        ref: "diff <(node scripts/migrate_app_state.js --extract-strings HEAD:index.html) <(node scripts/migrate_app_state.js --extract-strings index.html) — empty"
        status: pass
    human_judgment: false

# Metrics
duration: ~35min
completed: 2026-07-24
status: complete
---

# Phase 10 Plan 01: Foundation + Tracer Summary

**Built the classic-script/ES-module de-globalization pipeline (string/comment/regex-aware tokenizer, migration tool, `appState` module, bridge wiring, standing contract check) and proved it end-to-end by migrating `room` — verified live in two Chrome tabs against real Firebase.**

## Performance

- **Duration:** ~35 min (781a856 → c13af69, plus coordinator's Chrome verification pass)
- **Started:** 2026-07-24T21:18:43Z
- **Completed:** 2026-07-24T21:45:17Z (code); browser gate approved by coordinator shortly after
- **Tasks:** 3 (2 automated, 1 checkpoint verified by coordinator)
- **Files modified:** 6 (3 created, 3 modified)

## Accomplishments

- Confirmed the authoritative 46-name app-state inventory as committed ground truth (`scripts/migrate_app_state.js`'s `APP_STATE_NAMES`/`CONFIRMED_WRITE_SITES`), re-grepping every write site for all 46 names (not just the ~20 RESEARCH flagged) and resolving Open Question 2 (`timer` is NOT an active interval handle — declaration-only, dead state)
- Built `scripts/lib/js_region_tokenizer.js`: a zero-dependency, character-by-character tokenizer for the classic-script region that correctly distinguishes code from strings, comments, AND regex literals, and treats template-literal interpolations (`${...}`) as code rather than opaque string content
- Built `scripts/migrate_app_state.js`'s `--migrate`/`--extract-strings`/`--check-names` modes on top of the tokenizer, with declarator-list-aware declaration removal, object-literal shorthand expansion, and property-key exclusion
- Created `src/state/index.js` — one plain object exported as `appState`, seeded with all 46 app-state defaults, never reassigned
- Wired `appState` into the existing `window.PP` bridge in `src/main.js`, published by reference (not copied)
- Built `scripts/state_contract_check.js` — the 5-assertion standing gate (deliberately not wired into `npm test` yet; assertions 1/2 are expected-red until 10-06)
- Migrated every `room` read/write site in `index.html` to `appState.room`, handling the declaration-list removal, one object-literal shorthand expansion, and two key:value split sites correctly
- Verified live in Chrome (two tabs, distinct `pp_id`): the bridge publishes `appState` by reference, a classic-script write (`appState.room = code`) is observable through `window.PP.appState.room`, room create/join works, console is clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Confirm the full 46-name read/write inventory** - `781a856` (feat)
2. **Task 2: Tracer — tokenizer + state module + bridge + migrate `room` + contract check** - `c13af69` (feat)
3. **Task 3: Browser mechanism gate** - checkpoint, verified live by the coordinator in Chrome (no code commit — verification-only task)

**Plan metadata:** (this commit)

## Files Created/Modified

- `scripts/lib/js_region_tokenizer.js` - the shared string/comment/regex-aware tokenizer for the classic-script region (`index.html:859`–`:4667`), including template-literal-interpolation-as-code handling and a regex-vs-division disambiguator
- `scripts/migrate_app_state.js` - the 46-name inventory (Task 1) plus the `--migrate`/`--extract-strings`/`--check-names` tool (Task 2), built on the tokenizer
- `src/state/index.js` - one plain object exported as `appState`, seeded with all 46 app-state defaults, never reassigned
- `src/main.js` - `appState` added as a third `PP-BRIDGE`-tagged key, published by reference through `window.PP`/`globalThis`
- `scripts/state_contract_check.js` - the 5-assertion standing gate (declaration/bare-usage/debug-hook-allowlist/purity/no-rebinding)
- `index.html` - every `room` read/write site migrated to `appState.room`

## Decisions Made

- **`appState`, not `state`** — see Deviations below; this is the load-bearing naming decision for the entire rest of the phase (10-02 through 10-07 all migrate names to `appState.NAME`, not `state.NAME`).
- Template-literal interpolations are treated as code by the tokenizer, not string content — necessary because real app-state reads (e.g. `game`) occur inside `${...}` in this file; a name-blind "treat template literals as opaque strings" approach would have silently missed those sites in later plans.
- The migration tool's declaration-removal logic is fully general (handles both "remove one declarator from a multi-declarator list" and "remove the whole statement if it was the only declarator"), even though `room`'s own declaration only exercised the multi-declarator path — this generality is required for the ~24 names in 10-02–10-05 that ARE single-declarator statements.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `state` naming collision with existing local variables/parameters**
- **Found during:** Task 2, while validating the migration tool's `--check-names room` output against the real file
- **Issue:** RESEARCH.md's Pattern 1 and CONTEXT.md's D-05 both illustrate the app-state container as `state`. The classic script already uses `state` as a local parameter/variable name in at least 5 places, unrelated to app state: `function broadcastFlip(state)` and `function setFlipCoin(state)` (the coin-flip outcome), `function coinHTML(state, ...)`, `function setRecoveryState(state)` (a recovery status string), and a local `const state=isHost?(...):clockState;` inside `setClockUI()`. The migration tool has no scope analysis, so publishing the bridge as `state` would have made every rewritten `state.room` inside e.g. `broadcastFlip()` silently read `.room` off the LOCAL flip-outcome parameter instead of the real app-state object — no syntax error, no thrown exception, just a wrong room code sent to `netSetFlip()` at runtime. This is exactly the class of bug GLOBAL-01 exists to prevent.
- **Fix:** Renamed the exported/bridged identifier to `appState` throughout `src/state/index.js`, `src/main.js`, `scripts/migrate_app_state.js`, and `scripts/state_contract_check.js`. Grep-confirmed `appState` has zero prior occurrences anywhere in `index.html` or `src/**/*.js` before adopting it. The file path (`src/state/index.js`), the contract-check name (`scripts/state_contract_check.js`), and every other design decision from RESEARCH/CONTEXT are unchanged — only the literal JS identifier published on the bridge differs from the plan's illustrative text. CONTEXT.md's "Claude's Discretion" section explicitly leaves "the app-state module's exact name" open, so this is within delegated authority, not an architectural change requiring a checkpoint.
- **Files modified:** `src/state/index.js`, `src/main.js`, `scripts/migrate_app_state.js`, `scripts/state_contract_check.js`, `index.html`
- **Verification:** Confirmed `broadcastFlip(state)` and `setRecoveryState(state)` now read `appState.room` correctly (not shadowed); live Chrome verification (coordinator) confirmed `window.PP.appState.room` tracks reassignment across two independent room-create runs with no `ReferenceError`.
- **Committed in:** `c13af69` (Task 2 commit)

**2. [Rule 1 - Bug] Tokenizer misclassified a regex literal's contents as a string, corrupting downstream classification**
- **Found during:** Task 2, first end-to-end `--migrate room` run — the declaration-list removal silently failed (`let db=null, myId=null, room=null, ...` became `let db=null, myId=null, state.room=null, ...`, a SyntaxError) instead of removing `room` from the list
- **Issue:** `escHtml` (`index.html:866`) contains the regex literal `/[&<>"]/g`, whose character class holds a literal `"`. The tokenizer's first version had no concept of regex literals — it saw `"` and started a fake double-quoted string that consumed everything up to the next unrelated `"` in the file, corrupting every string/comment/bracket-depth classification downstream of it. The declaration site at `index.html:3896` (far past this point) was consequently measured at the wrong bracket depth, so the declarator-removal logic never recognized it as a top-level declaration.
- **Fix:** Added a `regex` lexer mode to `scripts/lib/js_region_tokenizer.js` with a regex-vs-division disambiguator (looks at the last significant token before a bare `/` — `(`, `,`, `=`, `return`, etc. imply regex-start; an identifier/`)`/`]`/`}` implies division) and character-class-aware regex-body scanning (`[...]` content doesn't terminate the regex on an internal `/`). Regex literals are classified as `"string"` kind — opaque, never an identifier-substitution target, masked out of bracket-depth counting exactly like real strings/comments.
- **Files modified:** `scripts/lib/js_region_tokenizer.js`
- **Verification:** Re-ran the full `--migrate room` pipeline after the fix; declaration removal now works correctly (`let db=null, myId=null, mySeat=null, isHost=false, roster=null;`), bracket-depth ended balanced at 0 across the whole region, `node --check` on the extracted classic-script region passed, determinism corpus stayed 30/30, byte-safety diff stayed empty.
- **Committed in:** `c13af69` (Task 2 commit) — this fix and the migration were developed and verified together before committing; no broken intermediate state was ever committed.

---

**Total deviations:** 2 auto-fixed (both Rule 1 — broken behavior, not architectural changes)
**Impact on plan:** Both fixes are essential for correctness and directly de-risk the bulk 46-name migration in 10-02 through 10-05, which reuse the same tokenizer and the same `appState` naming. No scope creep — no other names were touched beyond `room`.

## Issues Encountered

- The coordinator's independent Chrome verification surfaced a non-blocking observation, recorded here verbatim per their request: a session-restore path appears to have re-invoked a watcher setup once in an earlier browser session (two stale `[src/net/registry.js] duplicate attach refused … rooms/JFAS/flip` console errors, timestamped 2:44:20 PM, for a room `JFAS` never created in the verification session itself). This is the Phase 9 registry guard correctly REFUSING a duplicate attach (preventing a listener leak), not a Phase 10 regression — it did not recur on either freshly-created room (`ZMWH`, `MNFA`) in the same verification pass. Worth a glance during Phase 12's end-to-end validation but not a blocker for this plan or this phase.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The pipeline is proven: `scripts/lib/js_region_tokenizer.js`, `scripts/migrate_app_state.js`, `src/state/index.js` (exporting `appState`), the `window.PP` bridge wiring, and `scripts/state_contract_check.js` are all in place and reusable as-is for 10-02 through 10-05's bulk migration of the remaining 45 names.
- **Naming correction propagates forward:** every subsequent plan (10-02–10-07) must migrate names to `appState.NAME`, not `state.NAME` — the plan documents (RESEARCH.md, CONTEXT.md) still say `state` illustratively; this SUMMARY and the code itself are the authoritative source for the `appState` naming going forward.
- `scripts/state_contract_check.js` currently reports FAIL on assertions 1 (leftover declarations) and 2 (leftover bare usage) for the 45 un-migrated names — this is expected and by design; do not "fix" this before 10-06.
- No blockers. The registry-guard observation above is worth a glance at Phase 12 but does not block 10-02.

---
*Phase: 10-app-state-de-globalization*
*Completed: 2026-07-24*

## Self-Check: PASSED
