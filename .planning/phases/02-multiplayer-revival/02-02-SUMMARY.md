---
phase: 02-multiplayer-revival
plan: 02
subsystem: multiplayer
tags: [firebase, realtime-database, headless-chrome, cdp, orchestrator]

# Dependency graph
requires:
  - phase: 02-multiplayer-revival (plan 01)
    provides: "The two-process CDP rig (rig.mjs) and the host-create/guest-join driving pattern, extended here through startGame() into a genuinely started voyage"
provides:
  - "4/src/orchestrator.js watchRecipes() tolerates both the sparse-object and dense-array shapes Firebase actually returns for rooms/<C>/recipes"
  - "4/src/orchestrator.js startGame() takes watchRoom's existing 'that game no longer exists' path (shared GAME_GONE_MSG constant) instead of throwing a null-dereference"
  - "A measured, non-obvious fact about the live database: Firebase's JS SDK pads a numeric-keyed write with null and returns a dense array whenever picked-count/(maxIndex+1) >= ~0.5; only a genuinely low-density write (e.g. a lone pick at seat index >= 2 of 4) reads back as a plain object"
  - "CDP Runtime.exceptionThrown, not window.onerror, is the channel that carries the real exception text for a cross-origin (no-CORS-header dev server) module script — window.onerror is masked to a generic 'Script error.'"
affects: [02-03, 02-04, 02-05, 02-06, 02-07, 02-FINDINGS.md]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "voyage-setup.mjs (scratchpad) — the shared 'get host+guest into a started voyage' helper every later 02-multiplayer-revival probe should extend, built on top of 02-01's rig.mjs"
    - "Four-channel error capture for a throw with no await chain of its own (window.onerror + unhandledrejection + console.error patch + CDP Runtime.exceptionThrown), because window.onerror alone is masked to 'Script error.' by the browser's cross-origin script policy on this repo's plain dev server (no CORS headers)"
    - "Deterministic race-avoidance for 'the room vanished mid-flight': delete-then-read-back-null-then-invoke, rather than firing a real network race, so a probe's RED/GREEN result is reproducible rather than flaky"

key-files:
  created:
    - "<scratchpad>/voyage-setup.mjs — createAndJoin/startVoyage/setupStartedVoyage/installErrorCapture, shared by both of this plan's probes"
    - "<scratchpad>/probe-fix03-draft.mjs — Task 1's automated verify (red-proofed, then green-proofed)"
    - "<scratchpad>/probe-fix03-room.mjs — Task 2's automated verify (red-proofed, then green-proofed)"
    - "<scratchpad>/probe-shape-diag.mjs — throwaway diagnostic that measured the array/object threshold directly against the live database before Task 1's probe payload was chosen"
  modified:
    - "<scratchpad>/rig.mjs — connectCDP extended to also collect CDP Runtime.exceptionThrown EVENTS (not just command responses) into a page's `.exceptions` array, needed because window-level error capture alone was insufficient for this plan's faults"
    - "4/src/orchestrator.js — watchRecipes() (Task 1), startGame() + new GAME_GONE_MSG constant (Task 2)"

key-decisions:
  - "The plan's own example sparse shape ('seat 0 and seat 2 have picked, seat 1 has not') does NOT reproduce the object bug — measured directly: Firebase pads that specific gap with null and returns a dense array. The genuinely reproducing shape (measured, used in the probe) is a lone pick at a seat index >= 2 of 4, e.g. {3:1} alone, which reads back as {\"3\":1}. The fix does not depend on this narrative detail — it makes watchRecipes correct for BOTH shapes regardless of which one production naturally reaches — but the plan's stated example was itself unverified and is corrected here for whoever reads it next."
  - "Task 2's probe deletes the room and confirms it gone (read-back null) BEFORE invoking startGame(), rather than racing the delete against startGame()'s own read over real network latency. This makes the RED/GREEN result deterministic instead of flaky, while still exercising the exact precondition and exact code path the fix addresses."
  - "The shared 'no longer exists' copy is a module constant (GAME_GONE_MSG) referenced by TWO distinct @copy ids (misc.mperror.gamegone / misc.mperror.startgamegone), not one id duplicated at two sites — matching this same file's own established NO_CONNECTION_MSG/createnoconnection/joinnoconnection precedent, and avoiding a 'duplicate @copy id' violation the moment scripts/extract_narration_lines.js is ever pointed at 4/ (currently it only scans the root src/orchestrator.js, so this is preventive, not fixing a live gate today)."
  - "Task 1's fix also closes a quieter, previously-undiscussed second fault in the same function: the OLD array-only code, on the padded-array shape, would have driven recipeChoices[null] (=== undefined) onto a still-drafting seat's .recipe. The new pk==null guard fixes this too, as the same shape of fix, not new scope (Rule 1)."

patterns-established:
  - "Red-proofing a fix that touches an orchestration-tier Firebase listener: capture FOUR channels, not one — window.onerror is masked to 'Script error.' for a cross-origin module script on this repo's CORS-header-less dev server, so CDP's own Runtime.exceptionThrown is what actually carries the exception text and stack."
  - "When a probe's red-state depends on a specific network-observable data shape (array vs. object), measure the boundary directly against the live database before writing the probe's assertion — do not assume the shape from reading the write-side code alone."

requirements-completed: []  # FIX-03 and MP-03 stay Pending — see "Requirements Status" below (this plan closes 2 of FIX-03's 3 named sites, and D-09 reserves the human phone pass as the actual close).

coverage:
  - id: D1
    description: "watchRecipes() no longer crashes a guest on a sparse mid-draft rooms/<C>/recipes node; it applies whichever picks are present and leaves the rest untouched"
    requirement: "FIX-03"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-fix03-draft.mjs (headless CDP, two-process rig, PROBE_MODE=pre-fix then post-fix against the live database)"
        status: pass
    human_judgment: true
    rationale: "D-09 (02-CONTEXT.md): headless evidence is real and passing, but this phase's own ruling reserves the actual close for Wyatt's phone pass (expected around plan 02-07). FIX-03 is only 2 of its 3 named sites here; the third (unescaped host HTML) is a different plan."
  - id: D2
    description: "startGame() takes watchRoom's existing 'that game no longer exists' path (alert, clearSession, showHome) instead of throwing a null-dereference when the room has vanished before the read resolves"
    requirement: "FIX-03"
    verification:
      - kind: e2e
        ref: "<scratchpad>/probe-fix03-room.mjs (headless CDP, two-process rig, PROBE_MODE=pre-fix then post-fix against the live database)"
        status: pass
    human_judgment: true
    rationale: "Same D-09 rationale as D1."

duration: ~65min
completed: 2026-08-19
status: complete
---

# Phase 2 Plan 2: The recipe draft and a vanished room stop killing the guest Summary

**Two of FIX-03's three named crash sites in `4/src/orchestrator.js` closed — `watchRecipes()` now tolerates whichever shape Firebase actually hands back for the recipe draft, and `startGame()` now takes the exact "room is gone" recovery path `watchRoom()` already had — each proven by a probe that was first shown, against the live production database, to reproduce the fault it fixes.**

## Performance

- **Duration:** ~65 min
- **Completed:** 2026-08-19
- **Tasks:** 2 (both `type="auto"`)
- **Files modified:** 1 (`4/src/orchestrator.js`)

## Accomplishments

- **A guest now survives the recipe draft.** `watchRecipes()`'s `picks.forEach(...)` assumed Firebase always hands back a dense array; measured directly against the live database, it does not — a low-enough-density write reads back as a plain object, and the old code threw `TypeError: picks.forEach is not a function` the instant that happened, killing every guest silently (zero page errors, per `docs/HARD-WON-LESSONS.md` §1b's exact shape). `Object.entries()` now walks either shape.
- **A captain whose room disappeared mid-start is told so and sent home**, instead of hitting an uncaught `TypeError: Cannot read properties of null (reading 'numSeats')` that produced the WRONG alert ("couldn't reach the multiplayer service — try again"), left a stale session pointing at a dead room, and stranded them on the room screen.
- **Both probes were red before they were green**, against the real, live production Firebase database — not simulated. The exact pre-fix error text for both is captured below, for `02-FINDINGS.md`.
- **A measurement correction to the plan's own premise**, caught before it could mislead anyone downstream: the plan's stated example sparse shape ("seat 0 and seat 2 have picked, seat 1 has not") does NOT reproduce the crash — Firebase pads that specific gap with `null` and hands back a dense array. The genuinely reproducing shape (a lone pick at seat index ≥ 2 of 4) was found by direct measurement and is what the probe actually uses. The fix itself is correct for both shapes regardless of this detail.

## Task Commits

1. **Task 1: The recipe draft stops killing every guest** — `a8c388a` (fix)
2. **Task 2: Starting a game whose room has gone takes the path that already exists** — `c9ea27a` (fix)

**Plan metadata:** committed in this same pass (see final commit below).

## Files Created/Modified

- `4/src/orchestrator.js` — `watchRecipes()` rewritten to iterate `Object.entries(picks)` instead of `picks.forEach`, skipping any not-yet-picked seat (absent key or `null`-padded); `startGame()` gained a `if(!r){...}` guard identical in shape to `watchRoom()`'s existing one; new module-level `GAME_GONE_MSG` constant shared by both, each keeping its own `@copy` id.
- `<scratchpad>/voyage-setup.mjs` *(not committed)* — `createAndJoin`, `startVoyage`, `setupStartedVoyage`, `installErrorCapture`. Every later probe in this phase that needs a genuinely started voyage should extend this rather than re-deriving it.
- `<scratchpad>/probe-fix03-draft.mjs` *(not committed)* — Task 1's automated verify, `PROBE_MODE=pre-fix|post-fix`.
- `<scratchpad>/probe-fix03-room.mjs` *(not committed)* — Task 2's automated verify, `PROBE_MODE=pre-fix|post-fix`.
- `<scratchpad>/probe-shape-diag.mjs` *(not committed)* — the diagnostic that measured the array/object threshold against the live database before Task 1's probe payload was chosen.
- `<scratchpad>/rig.mjs` *(not committed, from 02-01, extended here)* — `connectCDP` now also collects `Runtime.exceptionThrown` CDP events into a page's `.exceptions` array (`clearExceptions()` to reset), because `window.onerror` alone reported only a masked "Script error." for Task 1's fault.

## Red-State Evidence (for `02-FINDINGS.md`)

**Task 1 — pre-fix, against `{3:1}` written to `rooms/<CODE>/recipes`** (a genuinely sparse object read-back, `{"3":1}`, measured — see "Decisions Made"):
```
Uncaught TypeError: picks.forEach is not a function
  at Module.watchRecipes (http://localhost:.../4/src/orchestrator.js:1594)
  ... (Firebase firebase-database-compat.js internals: s → onValue → ... → set)
```
Captured via CDP `Runtime.exceptionThrown` (NOT `window.onerror`, which reported only the generic "Script error." — see Decisions). `console.error` also caught the app's own `voyageAground()` belt firing: `"VOYAGE AGROUND (uncaught error) Script error."`. Seat 3's `.recipe` never changed from its default (the crash pre-empted the assignment).

**Task 2 — pre-fix, with `rooms/<CODE>` deleted before `startGame()` ran:**
```
startGame failed TypeError: Cannot read properties of null (reading 'numSeats')
  at Module.startGame (http://localhost:.../4/src/orchestrator.js:1511)
```
Caught by `startGame()`'s own `catch`, which alerted the WRONG message: `"Couldn't reach the multiplayer service — it may be at capacity right now. Try again in a moment."` `localStorage.pp4_sess` stayed pointed at the dead room; the host stayed on the room screen.

## Decisions Made

- The plan's own stated sparse-shape example does not reproduce the crash; the correct trigger shape was found by direct measurement against the live database and is documented above and in the probe's own comments. See `coverage`/`key-decisions` in frontmatter for full detail.
- Task 2's probe deletes-then-confirms-then-invokes rather than racing a real network delete against `startGame()`'s own read, to make the RED/GREEN result deterministic rather than flaky.
- The shared "room is gone" copy is one constant (`GAME_GONE_MSG`) referenced by two distinct `@copy` ids, matching this file's own established `NO_CONNECTION_MSG` precedent — not one id duplicated at two sites (which would break `scripts/extract_narration_lines.js`'s "ids must be globally unique" rule the moment that gate is ever pointed at `4/`).
- Task 1's fix also closes a quieter second fault in the same function (the old array-only code would have driven `recipeChoices[null]` onto a still-drafting seat's `.recipe` on the padded-array shape) — treated as the same fix, not new scope, per Rule 1.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Task 1's `.forEach` fix also fixed a second, quieter bug in the same code**
- **Found during:** Task 1, while designing the tolerant iteration.
- **Issue:** The old array-only code, on a Firebase-padded array (a not-yet-picked seat represented as `null`), would have executed `appState.game.players[i].recipe = appState.game.players[i].recipeChoices[null]` — `=== undefined`, silently corrupting that seat's recipe rather than leaving it untouched.
- **Fix:** The new `Object.entries(picks).forEach(([key,pk])=>{ if(pk==null)return; ... })` guard skips both the absent-key (object) and `null`-padded (array) not-yet-picked cases identically.
- **Files modified:** `4/src/orchestrator.js` (same lines as the primary fix — no separate commit).
- **Verification:** Covered by the same probe's dense-array follow-up check (`probe-fix03-draft.mjs`, post-fix mode): a full `[0,1,0,1]` write applies correctly per-seat with zero exceptions.

**2. [Rule 1 - Bug] `rig.mjs`'s `connectCDP` did not surface uncaught-exception detail**
- **Found during:** Task 1's first pre-fix probe run — `window.onerror` reported only "Script error." with no stack, insufficient to satisfy the acceptance criterion that the rejection channel "holds a TypeError naming the missing array method."
- **Issue:** Cross-origin script error masking (the repo's plain `python3 -m http.server` sends no CORS headers) strips detail from `window.onerror`/`window.addEventListener('error', ...)` for module scripts.
- **Fix:** Extended `rig.mjs`'s `connectCDP` to also subscribe to and collect the CDP-level `Runtime.exceptionThrown` protocol event, which is instrumented beneath the browser's own same-origin masking and carries the full exception text/stack.
- **Files modified:** `<scratchpad>/rig.mjs` (not committed).
- **Verification:** Re-run captured the exact text `"Uncaught TypeError: picks.forEach is not a function"` with a full stack trace pointing at `orchestrator.js:1594`.

---

**Total deviations:** 2 auto-fixed (both Rule 1, both self-contained to the fix/probe design itself — no scope creep beyond what the plan already asked for).
**Impact on plan:** Neither changed what the plan required; both are the same shape of fix already in progress when found.

## Issues Encountered

See "Deviations from Plan" above — both were diagnosed and resolved within this plan. No open blockers.

## User Setup Required

None — no external service configuration required.

## Requirements Status

**FIX-03 and MP-03 stay `Pending` in `REQUIREMENTS.md`.** This plan closes 2 of FIX-03's 3 named sites (the sparse-draft crash and the unguarded room read); the third (`watchPrompt`'s unescaped host HTML) is a different plan's work, and D-09 (`02-CONTEXT.md`) reserves the actual requirement close for Wyatt's real-voyage phone pass regardless — the same reasoning `02-01-SUMMARY.md` applied to MP-01/MP-02. `coverage:` marks both deliverables `human_judgment: true` with that rationale rather than running `requirements mark-complete`.

## Next Phase Readiness

- **Ready:** a guest can now reach the far side of the recipe draft without crashing, and a captain whose room vanishes mid-start is told so cleanly — both of which ROADMAP criterion 2 needs before a full voyage can be attempted at all.
- **Standing constraint carried forward from 02-01, still honored:** no probe in this plan drove a voyage to completion (`writeGameLog()` was never reached) — every probe stopped at or shortly after the recipe-draft state, and every `rooms/<CODE>` this plan created was deleted and read back as part of the probe itself (no separate teardown step was needed; see each probe's own `finally` block).
- **`voyage-setup.mjs`** is now the shared "get to a started voyage" building block for 02-03 through 02-06's probes, extending 02-01's `rig.mjs`.
- **Raw material for `02-FINDINGS.md` (plan 07):** the corrected sparse-shape mechanics (Firebase's own array/object threshold), the CDP-vs-window.onerror error-capture finding, and both pieces of red-state evidence captured verbatim above.
- **The third FIX-03 site (unescaped host HTML in `watchPrompt`) and the `remotePrompt` no-timeout item (explicitly NOT this plan's, per Wyatt's 2026-08-19 ruling — "write it down, don't fix it") remain open** for whichever later plan in this phase owns them.
- **Ports used this plan** (avoid reusing without a fresh Chrome profile/port): servers `8501`, `8503`, `8504`, `8505`, `8507`, `8601`(diag); CDP debug ports `9511`–`9516`, `9521`–`9524`, `9611`/`9612`(diag).
- **Zero headless Chrome and zero local server processes were left running** at the end of this plan, confirmed by `ps` before returning.

## Self-Check: PASSED

- `4/src/orchestrator.js` — FOUND
- `.planning/phases/02-multiplayer-revival/02-02-SUMMARY.md` — FOUND
- Commit `a8c388a` — FOUND in `git log --oneline --all`
- Commit `c9ea27a` — FOUND in `git log --oneline --all`

---
*Phase: 02-multiplayer-revival*
*Completed: 2026-08-19*
