---
status: testing
phase: 13-multiplayer-turn-clock
source: [13-VERIFICATION.md]
started: 2026-07-26T03:34:50Z
updated: 2026-07-26T03:34:50Z
---

## Current Test

number: 1
name: Boot version-guard clears stale save blobs but keeps identity & timer preference
expected: |
  Unversioned/mismatched pp_sess and pp_solo blobs are cleared and do NOT drive a
  resume (home screen shows); a current-version blob still resumes; pp_id and
  pp_timerOff survive all reloads untouched.
awaiting: user response

## Tests

### 1. Boot version-guard clears stale save blobs but keeps identity & timer preference
expected: Set localStorage pp_sess to a JSON blob with room/mySeat/isHost but NO `v` field, reload → home screen shows (no resume) and pp_sess is gone. Repeat with a `v === SESSION_SCHEMA_V` blob → resume IS attempted. Repeat both cases for pp_solo / SOLO_SCHEMA_V. Confirm pp_timerOff and pp_id survive all four reloads. *(CLOCK-01)*
result: [pending]

### 2. Fresh 2-window multiplayer game starts its clock on its own (critical stall fix)
expected: Host + join a fresh 2-window multiplayer game from a clean boot (no prior session). The shot clock starts running on its own and the first turn begins — no stall, no timer off/on toggle workaround needed. *(CLOCK-01, critical)*
result: [pending]

### 3. Guest-initiated pause freezes the whole table and resumes from remaining time
expected: In a 2-tab MP game (unique pp_id per tab), a GUEST clicks #scPause. Both ▶/⏸ and ⏱ controls are visible on both tabs; #shotClockPanel shows "paused" on BOTH tabs; a bot turn does not advance while paused; window.__pp_app_state_debug().shotClockPaused === true on both tabs. Click again (either tab) to resume — the countdown continues from the remaining time, not a fresh 30s. *(CLOCK-02)*
result: [pending]

### 4. Solo pause/resume still works (regression)
expected: Repeat the pause/resume check in a SOLO game — ▶/⏸ pauses and resumes without regression. *(CLOCK-02)*
result: [pending]

### 5. Large PAUSED symbol click resumes only while paused, inert otherwise
expected: While paused (solo and 2-tab MP), click #shotClockNum (the large paused symbol) → shotClockPaused flips to false (resumes). While NOT paused, click #shotClockNum → nothing happens (no accidental pause). *(CLOCK-03)*
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
