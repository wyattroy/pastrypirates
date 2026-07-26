---
status: testing
phase: 13-multiplayer-turn-clock
source: [13-VERIFICATION.md]
started: 2026-07-26T03:34:50Z
updated: 2026-07-26T17:24:10Z
---

## Current Test

number: —
name: All 5 tests run. 4 passed, 1 failed (test 3 CLOCK-02 pause desync). Awaiting fix before phase can complete.
awaiting: gap fix for test 3

## Tests

### 1. Boot version-guard clears stale save blobs but keeps identity & timer preference
expected: Set localStorage pp_sess to a JSON blob with room/mySeat/isHost but NO `v` field, reload → home screen shows (no resume) and pp_sess is gone. Repeat with a `v === SESSION_SCHEMA_V` blob → resume IS attempted. Repeat both cases for pp_solo / SOLO_SCHEMA_V. Confirm pp_timerOff and pp_id survive all four reloads. *(CLOCK-01)*
result: passed — current save resumes; unversioned pp_sess/pp_solo cleared to welcome screen; pp_id ("u3mctlw23") survived. (Side-observation about resume replaying silently to next turn logged as backlog 999.1 — not a phase-13 defect.)

### 2. Fresh 2-window multiplayer game starts its clock on its own (critical stall fix)
expected: Host + join a fresh 2-window multiplayer game from a clean boot (no prior session). The shot clock starts running on its own and the first turn begins — no stall, no timer off/on toggle workaround needed. *(CLOCK-01, critical)*
result: passed — 2-window game (regular Chrome host + Incognito guest) started cleanly; clock counted down in BOTH windows on its own, no PAUSED stall, no timer-toggle workaround. Critical CLOCK-01 fix confirmed.

### 3. Guest-initiated pause freezes the whole table and resumes from remaining time
expected: In a 2-tab MP game (unique pp_id per tab), a GUEST clicks #scPause. Both ▶/⏸ and ⏱ controls are visible on both tabs; #shotClockPanel shows "paused" on BOTH tabs; a bot turn does not advance while paused; window.__pp_app_state_debug().shotClockPaused === true on both tabs. Click again (either tab) to resume — the countdown continues from the remaining time, not a fresh 30s. *(CLOCK-02)*
result: FAILED (partial) — the pause FLAG syncs correctly (both windows show PAUSED, bots freeze), but the countdown DEADLINE does not sync across pause/resume. While paused the two windows showed different frozen remaining times (host 13s vs guest 20s); after resume the guest clock raced to 0 / "lose your turn" (red) while the host showed ~5s. See Gaps → CLOCK-02-pause-desync.

### 4. Solo pause/resume still works (regression)
expected: Repeat the pause/resume check in a SOLO game — ▶/⏸ pauses and resumes without regression. *(CLOCK-02)*
result: passed — solo ⏸ freezes the game (bots halt); ▶ resumes from the remaining time, not a fresh 30. No regression.

### 5. Large PAUSED symbol click resumes only while paused, inert otherwise
expected: While paused (solo and 2-tab MP), click #shotClockNum (the large paused symbol) → shotClockPaused flips to false (resumes). While NOT paused, click #shotClockNum → nothing happens (no accidental pause). *(CLOCK-03)*
result: passed — clicking #shotClockNum while running does nothing (5a); clicking it while paused resumes in BOTH paused-render branches — the big PAUSE_SYMBOL_IMG on bot/idle turns AND the frozen countdown number on your own turn (confirmed the number resumes on click). Minor UX-consistency note logged below (not a functional failure).

## Summary

total: 5
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

### CLOCK-02-pause-desync — pause/resume does not re-broadcast the shot-clock deadline to guests
- **Requirement:** CLOCK-02 (D-07: "on resume the current player's countdown continues from the remaining time it had when paused").
- **Symptom (2-window MP, host-initiated pause):** paused windows show mismatched frozen remaining time (host 13s / guest 20s); on resume the guest countdown jumps to ~0 ("lose your turn", red) while the host continues from the correct remaining time. Reproduced by Wyatt in a regular-Chrome host + Incognito guest game.
- **Works:** the shared paused flag DOES sync (both windows freeze; bots stop) — the freeze half of CLOCK-02 is correct.
- **Root cause:** `applyPauseState()` (src/ui/util.js) recomputes the host-local `appState.shotClockDeadline` on pause (stashes `shotClockPauseElapsed`) and on resume (`Date.now()+30000-shotClockPauseElapsed`), but neither `watchPause()`/`togglePause()` (src/orchestrator.js) nor `applyPauseState()` re-broadcasts the updated deadline. Guests only ever receive the deadline via `watchClock()` → `netWatchClock` → `appState.clockState`, which is written by `broadcastClock()`/`netSetClock`. Because pause/resume never calls `broadcastClock()`, the guest keeps rendering against the STALE pre-pause deadline, so its countdown is off by the pause duration (runs down to 0 on resume).
- **Likely fix direction:** have the host call `broadcastClock()` after `applyPauseState()` on both pause and resume (host branch of `watchPause()`), so the frozen/restored deadline propagates to guests; ensure the guest's tick honors `shotClockPaused` so it does not keep counting against a stale deadline while paused. Verify with the same 2-window setup; keep `npm test` (19-watcher inventory) and determinism 30/30 green.
- **Relevant code:** src/ui/util.js `applyPauseState` (~616), `shotClockTick` (~644); src/orchestrator.js `togglePause`/`watchPause` (~160/170), `broadcastClock` (~142), `watchClock` (~238).

### CLOCK-03-paused-affordance-inconsistency (minor UX polish — non-blocking)
- **Requirement:** CLOCK-03 — functionally PASSES (clicking the paused display resumes in both render branches, confirmed by Wyatt).
- **Observation:** the paused resume target looks different depending on whose turn it is. On a bot/idle turn the paused panel shows the large `PAUSE_SYMBOL_IMG` (obviously tappable). On the human's OWN turn it shows the frozen countdown number ("10 seconds / tap ▶ to resume") — that number IS click-to-resume (`numEl.onclick` set in the state-present paused branch of `setClockUI`, src/ui/panel.js), but it does not visually read as tappable, and the hint text points at the tiny corner ▶ instead. Users may not realize the big number resumes on their own turn.
- **Not a functional failure** — CLOCK-03's "clicking the large PAUSED image resumes" is met wherever the large image appears, and the number is a working bonus affordance. This is a discoverability/consistency polish item (candidate for Phase 16 UI/UX, or a small tweak folded into the CLOCK-02 fix since the same paused-render code is in scope).
- **Relevant code:** src/ui/panel.js `setClockUI` — state-present paused branch (frozen-number render + `numEl.onclick`).
