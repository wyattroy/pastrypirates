---
phase: 21-sound-the-clock-toggle
plan: 03
subsystem: clock-toggle
tags: [firebase-parity, refactor, local-state-path, bug-fix, vanilla-js]

# Dependency graph
requires: ["21-02"]
provides:
  - "src/ui/util.js applyTimerOff(off) — the single state-mutation body (including the BUG-02 re-arm) shared by the networked and local timer-toggle paths"
  - "src/orchestrator.js toggleTimer() — works in every mode (db&&room writes Firebase, otherwise calls applyTimerOff() directly)"
  - "src/orchestrator.js watchTimer() — reduced to Firebase wiring, calls applyTimerOff()"
  - "src/orchestrator.js beginGame() — seeds appState.timerOff from pp_timerOff unconditionally, in every mode"
  - "src/ui/panel.js setClockUI() — #scTimerToggle visibility depends only on appState.liveDone, in every mode"
affects: [21-04, 21-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Extract-the-existing-body-verbatim, not re-derive: applyTimerOff() is watchTimer()'s prior callback body moved unchanged into src/ui/util.js, mirroring the CLOCK-02 applyPauseState()/togglePause()/watchPause() precedent exactly"
    - "db&&room / local-fallback branch shape, copied from togglePause(): toggleTimer() now has the identical if(db&&room){networked}else{local} structure"
    - "Local-mutation functions carry their own internal appState.isHost gates; the caller never re-gates — same no-gate-at-call-site discipline as applyPauseState()"

key-files:
  created: []
  modified:
    - src/ui/util.js
    - src/orchestrator.js
    - src/ui/panel.js
    - art-review/narration-inventory.json

key-decisions:
  - "applyTimerOff() placed directly beside applyPauseState() in src/ui/util.js (not beside rearmShotClock/stopShotClock/currentTurnSeat, which stayed where they were) — matches the plan's structural-analog instruction exactly"
  - "The pp_timerOff localStorage write in toggleTimer() now happens unconditionally, before either branch — previously it sat after an early return that made it unreachable in solo/pass-and-play entirely"
  - "beginGame()'s new unconditional pp_timerOff read is guarded only by !appState.replaying, not by mode — it runs for host, guest, solo and pass-and-play alike; the existing Firebase-seed branch directly below it is untouched and still only fires for the host in a real room"

requirements-completed: [FIX-02, N-03]

coverage:
  - id: D17
    description: "applyTimerOff(off) stops the countdown immediately when off===true, un-timing the current player — appState.isHost gate preserved from the original watchTimer() body"
    requirement: "FIX-02/N-03"
    verification:
      - kind: unit
        ref: "node -e one-liner confirming applyTimerOff is exported and its body contains rearmShotClock/the re-arm branch"
        status: pass
    human_judgment: false
  - id: D18
    description: "applyTimerOff(off) re-arms the current player's clock when switching back on mid-turn — the exact shotClockSeat==null / was&&!timerOff / !turnExpired guard from the BUG-02 fix, moved verbatim, not rewritten"
    requirement: "FIX-02/N-03"
    verification:
      - kind: unit
        ref: "code-level diff review: watchTimer()'s prior callback body is byte-for-byte present inside applyTimerOff(), confirmed via git diff against the pre-refactor commit"
        status: pass
      - kind: manual
        ref: "full-turn both-ways check (switch OFF mid-turn, switch back ON mid-turn, play the turn to completion) in solo, pass-and-play AND multiplayer"
        status: outstanding
    human_judgment: true
    rationale: "This plan's own acceptance criteria name this as the only check that catches a re-arm regression, and its execution context states explicitly that only a human, awake, driving a live game, can run it — not attempted tonight, not claimed as passing."
  - id: D19
    description: "toggleTimer() writes pp_timerOff on every toggle in every mode, and beginGame() seeds appState.timerOff from it unconditionally (guarded only by !appState.replaying)"
    requirement: "FIX-02/N-03"
    verification:
      - kind: unit
        ref: "node -e one-liner confirming toggleTimer()'s body contains the pp_timerOff write alongside both branches"
        status: pass
      - kind: manual
        ref: "switch the timer off, reload, start a fresh solo game, confirm it is still off"
        status: outstanding
    human_judgment: true
    rationale: "Requires a live browser reload cycle to observe localStorage persistence across a fresh page load."
  - id: D20
    description: "#scTimerToggle's display expression depends only on appState.liveDone — no soloBotGame()/mode gate anywhere on that line"
    requirement: "FIX-02/N-03"
    verification:
      - kind: unit
        ref: "node -e one-liner scanning the toggleEl.style.display assignment line specifically for liveDone present and soloBotGame absent"
        status: pass
    human_judgment: false
  - id: MULTIPLAYER-PARITY
    description: "Multiplayer's timer-toggle behaviour is bit-for-bit unchanged: same netSetTimerOff call, same watchTimer() Firebase wiring, same host-only guards, same shotClockSeat==null double-arm prevention"
    requirement: "hard constraint (not a numbered requirement)"
    verification:
      - kind: unit
        ref: "node scripts/host_guest_parity_check.js (part of npm test) — all 5 assertion groups pass; git diff against the pre-refactor commit shows the watchTimer() callback body relocated verbatim, no logic edits"
        status: pass
      - kind: manual
        ref: "two-window host + guest game: guest flips the timer off, host's countdown stops; guest flips it back on, host's current turn re-arms"
        status: outstanding
    human_judgment: true
    rationale: "host_guest_parity_check.js does not itself exercise the timer toggle (it covers prompt/sail-highlight/rim-sweep parity); the actual multiplayer timer behaviour needs two live browser windows to observe, per this plan's execution context."

# Metrics
duration: ~10min
completed: 2026-08-01
status: complete
---

# Phase 21 Plan 03: The Timer Toggle Actually Works Summary

**`toggleTimer()` no longer early-returns with no Firebase connection — solo and pass-and-play now switch the timer off/on through a local `applyTimerOff()` that shares the exact BUG-02 re-arm body multiplayer already proved (via `watchTimer()`), the preference is written and read back in every mode (not only when a host is in a real room), and `#scTimerToggle` is visible everywhere except end of voyage — no mode shows a greyed, dead control anymore.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-08-01 (overnight autonomous run)
- **Completed:** 2026-08-01
- **Tasks:** 3/3 completed
- **Files modified:** 4 (3 code files per plan scope + 1 generated artifact regenerated by the test suite)

## Accomplishments

- `applyTimerOff(off)` — new export in `src/ui/util.js`, placed directly beside `applyPauseState()`. Its body is `watchTimer()`'s prior Firebase-listener callback moved **verbatim**: the `was`/`appState.timerOff` assignment, the `appState.isHost&&appState.timerOff` stop branch, and the full BUG-02 re-arm branch (`was&&!appState.timerOff&&appState.shotClockSeat==null&&!appState.turnExpired` → `currentTurnSeat()` → `rearmShotClock(p)`) — every `appState.isHost` gate stayed exactly where it already lived inside the body, none added, none removed. The trailing render call switched from a direct `setClockUI()` (legal in `src/orchestrator.js`) to `netHandlers().onSetClockUI()` (the seam `toggleShotClockPause()` already uses one function below), since `src/ui/util.js` is imported by `src/ui/panel.js` and a direct import back would close a cycle `scripts/module_graph_check.js` forbids.
- `watchTimer()` in `src/orchestrator.js` reduced to one line of Firebase wiring: `netWatchTimerOff(appState.db,appState.room,s=>applyTimerOff(!!s.val()))`.
- `toggleTimer()` rewritten to the exact `if(db&&room){networked}else{local}` shape `togglePause()` already uses immediately below it: the `pp_timerOff` localStorage write moved to happen **first, unconditionally**, before either branch (it used to sit after the early-return, making it unreachable in solo/pass-and-play); the early-return guard itself — the actual FIX-02/N-03 bug — is gone; the local branch calls `applyTimerOff(next)` directly, no Firebase round trip.
- `beginGame()` now reads `pp_timerOff` into `appState.timerOff` **unconditionally**, guarded only by `!appState.replaying`, positioned before the existing `isHost&&db&&room&&!replaying` Firebase-seed branch (left untouched — it still needs to publish the host's preference to the room). Closes the D-19 gap: previously the only read of `pp_timerOff` lived inside that host-only branch, which never runs in solo or pass-and-play, so `appState.timerOff` silently kept its `false` default there every new game.
- `#scTimerToggle`'s visibility in `src/ui/panel.js` `setClockUI()` now depends only on `appState.liveDone` — the `soloBotGame()` mode gate that hid it in solo/pass-and-play is gone. `soloBotGame` dropped from `panel.js`'s import list (no remaining functional caller in that file; the function itself stays in `src/ui/util.js` — `src/main.js`'s auto-pause listener still calls it).
- Dropped `currentTurnSeat`/`rearmShotClock` from `src/orchestrator.js`'s import list (both moved into `applyTimerOff()`'s exclusive use, zero remaining call sites in that file); `stopShotClock` stayed (still used by `expireShotClock()`).

## Task Commits

Each task was committed atomically:

1. **Task 1: Extract `applyTimerOff()` beside `applyPauseState()`** - `d8c8c17` (refactor)
2. **Task 2: The local non-Firebase path, and the per-browser seed in every mode** - `7e0e966` (fix)
3. **Task 3: The toggle is visible in every mode (D-20)** - `ffb1fd6` (fix)

## How I Satisfied Myself Multiplayer Is Unchanged

This was the plan's own stated risk, so I treated it as the primary thing to prove rather than assume:

1. **`git diff` review of the extraction, line by line.** `watchTimer()`'s prior 19-line callback body — including the `shotClockSeat==null` double-arm guard's exact comment — is present inside `applyTimerOff()` with zero logic changes; the only textual difference is the render call switching from `setClockUI()` to `netHandlers().onSetClockUI()`, required by the tier-layering rule, not a behavioural change (both ultimately call the same function).
2. **`netSetTimerOff(appState.db,appState.room,next,netFail("timerOff"))` is byte-identical** in `toggleTimer()`'s networked branch to the pre-refactor line — same arguments, same call, same position relative to the localStorage write.
3. **`broadcastClock()`'s unrelated `if(!appState.db||!appState.room)return;` guard** (explicitly flagged in the plan as "correct and unrelated") was left completely untouched — confirmed by re-reading the function after every edit.
4. **`node scripts/host_guest_parity_check.js`** (part of `npm test`) passes all 5 assertion groups after every task commit — it does not itself exercise the timer toggle, but it is the project's existing host/guest divergence tripwire and stayed green throughout.
5. **What this does NOT prove:** an actual two-window host+guest session exercising the timer toggle specifically. That is recorded as outstanding below, per this plan's own execution context (only a human, awake, can run it).

## Files Created/Modified

- `src/ui/util.js` — `applyTimerOff(off)` added, placed directly beside `applyPauseState()`
- `src/orchestrator.js` — `toggleTimer()` rewritten with the db/room branch; `watchTimer()` reduced to Firebase wiring; `beginGame()` gains the unconditional `pp_timerOff` seed; import list updated (`applyTimerOff` added, `currentTurnSeat`/`rearmShotClock` dropped, `stopShotClock` kept)
- `src/ui/panel.js` — `#scTimerToggle` display expression changed to key only on `appState.liveDone`; `soloBotGame` dropped from the import list
- `art-review/narration-inventory.json` — regenerated by `scripts/extract_narration_lines.js` (part of `npm test`'s chain) after every task that shifted `src/orchestrator.js`'s line numbers; each diff is line-number shifts only, confirmed via `git diff ... | grep -v '"line":'` producing no content lines

## Decisions Made

- `applyTimerOff()` is positioned directly beside `applyPauseState()`, not beside the shot-clock primitives it calls (`stopShotClock`/`rearmShotClock`/`currentTurnSeat`, which stayed exactly where they already were) — matches the plan's structural-analog instruction, not a judgment call.
- The `pp_timerOff` write in `toggleTimer()` moved to unconditional-and-first, ahead of both branches — this is what makes the preference actually get written in solo/pass-and-play, which previously never reached that line at all because of the early return above it.
- `beginGame()`'s new seed read is unconditional across every mode (guarded only by `!appState.replaying`), not conditioned on `db&&room` — this was the explicit instruction in the plan's Task 2, and it is what closes D-19 for solo and pass-and-play specifically.

## Deviations from Plan

None — plan executed exactly as written. `applyTimerOff()`'s extraction, `toggleTimer()`'s db/room branch, `beginGame()`'s unconditional seed, and `#scTimerToggle`'s liveDone-only visibility all match the plan's `<action>` and `<acceptance_criteria>` verbatim.

## Verification Run

All automated verification from the plan's `<verify>` blocks was run and is green:

- `node scripts/module_graph_check.js` — all 7 layering assertions PASS (no ui→main edge introduced by the `applyTimerOff` extraction)
- `node scripts/no_undef_check.js` — PASS, run after every task
- `node scripts/ui_contract_check.js` — PASS, including the D-41 co-reachability check (this plan removes a mode gate, it does not add a greyed control)
- `node -e "..."` applyTimerOff-exported + re-arm-branch-present one-liner (Task 1) — PASS
- `grep -c 'applyTimerOff' src/orchestrator.js` → `3` (import + `watchTimer()` call + `toggleTimer()` call), at least the required 2
- `node -e "..."` toggleTimer-has-both-branches-and-the-local-write one-liner (Task 2) — PASS
- `node -e "..."` toggleEl-display-liveDone-only, no-soloBotGame one-liner (Task 3) — PASS
- `node scripts/host_guest_parity_check.js` — all 5 assertion groups PASS, run standalone after the full plan
- `npm test` (full 20-script suite, including `determinism_baseline.js --verify`) — exit 0, 0 failures, run after every task commit
- `git diff --stat -- src/engine/index.js` — empty at every checkpoint (working tree and against each prior commit) — the engine fence held throughout

## Issues Encountered

None. `npm test` was fully green at the start of this session and remained fully green after every task commit — no pre-existing red inherited, no red introduced.

## User Setup Required

None — no new dependency, no configuration, no external service.

## Outstanding — Requires a Human, Awake, Playing a Full Turn

This was an overnight autonomous run; Wyatt was asleep. Every machine-checkable acceptance criterion is green (see Coverage D17-D20 and MULTIPLAYER-PARITY above and the Verification Run section). The following are genuinely outstanding and are **NOT claimed as passing**, per this plan's execution context:

- **The D-18 full-turn both-ways check, in EACH of solo, pass-and-play and multiplayer:** during a single turn, switch the timer OFF (countdown stops immediately, current player un-timed) and then back ON (clock re-arms for that same in-progress turn), then play that turn through to completion. This is the plan's own acceptance criterion and the only check that would catch a re-arm regression — code-level review (the re-arm branch moved verbatim, confirmed by diff) is strong evidence but is explicitly not a substitute for this.
- **D-19 persistence across a reload:** switch the timer off, reload the page, start a fresh solo game, confirm it is still off.
- **Multiplayer parity, live:** in a two-window host + guest game, a guest flipping the timer off/on still works exactly as before — `host_guest_parity_check.js` doesn't exercise this specific control, so this needs actual eyes on two browser windows.
- **Narrow-viewport check (Task 3):** confirm `#scPause` and `#scTimerToggle` do not visually overlap in solo now that both render simultaneously for the first time (Pitfall 3 in `21-RESEARCH.md`).

Recommend Wyatt run this pass — the exact sequence in the plan's Task 2 `<human-check>` block — before treating FIX-02/N-03 as fully proven. The reversibility rating on D-18 in the plan (`costly` — a game-freezing regression, observable only by playing a full turn both ways) is why this is called out explicitly rather than folded into a general "looks done" claim.

## Next Phase Readiness

- `src/ui/util.js`'s `applyTimerOff` export is stable and available for any future clock-toggle work.
- `src/orchestrator.js`'s `toggleTimer()`/`watchTimer()`/`beginGame()` now have full parity across solo, pass-and-play and multiplayer for the timer-off preference — no further plumbing needed for FIX-02/N-03.
- `src/ui/panel.js`'s `#scTimerToggle` is now a sibling of the mute button work in 21-01/21-02 inside the same clock panel real estate — 21-04/21-05 (if they touch this panel further) should re-check Pitfall 3's narrow-viewport concern, now doubly relevant with the toggle visible in solo too.
- `src/engine/index.js` remains byte-identical — the v1.3 determinism fence held through this plan.

## Self-Check: PASSED

All modified files verified present on disk with the expected changes; all three task commits verified present in `git log`:
- `src/ui/util.js` — FOUND, `applyTimerOff` export and re-arm branch present
- `src/orchestrator.js` — FOUND, `toggleTimer()`/`watchTimer()`/`beginGame()` all updated as described
- `src/ui/panel.js` — FOUND, `toggleEl.style.display` line keys only on `liveDone`
- Commit `d8c8c17` (Task 1) — FOUND
- Commit `7e0e966` (Task 2) — FOUND
- Commit `ffb1fd6` (Task 3) — FOUND
- `src/engine/index.js` — byte-identical to `HEAD~3`, confirmed via `git diff --stat`

---
*Phase: 21-sound-the-clock-toggle*
*Completed: 2026-08-01*
