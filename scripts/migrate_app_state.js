#!/usr/bin/env node
// scripts/migrate_app_state.js
//
// Phase 10 (App State & De-globalization), Plan 01, Task 1. This file starts as the committed
// ground truth for the migration: the authoritative 46-name app-state inventory plus the
// re-confirmed write-site line numbers for every name RESEARCH.md flagged "verify at migration
// time". Task 2 (the tracer) extends this same file with the actual `--migrate`/`--extract-strings`/
// `--check-names` tool logic, built on scripts/lib/js_region_tokenizer.js. This task deliberately
// stops short of that — RESEARCH's D-04/Pitfall-2 warning is that a missed write site silently
// desyncs state, so the ground truth has to be nailed down and committed BEFORE any rewrite tool
// is allowed to run against it, exactly the "hardcoded, not derived" precedent
// scripts/engine_contract_check.js and scripts/net_contract_check.js already established for their
// own completeness assertions (deriving a checklist from the code under test makes the checklist
// tautological — a name silently dropped from the source would also drop out of the list checked
// against it).
//
// ============================================================================
// The 46-name app-state inventory (GLOBAL-01, D-04)
// ============================================================================
// Exactly rows 1-46 of 10-RESEARCH.md's "complete de-duplicated app-state inventory (Q1a)" table.
// The 7 UI-render-handle names from that same table (cell, shipEls, activeRing, spinNeedle,
// stormText, stormDial, windLabels) are DELIBERATELY EXCLUDED — RESEARCH's Q4 classification found
// zero non-UI readers for any of them, so CONTEXT.md's discretion note defers them to Phase 11's
// UI extraction. They must never appear in this array.
const APP_STATE_NAMES = [
  "game", "evIdx", "timer", "logLines",
  "db", "myId", "room", "mySeat", "isHost", "roster",
  "turnOrder",
  "numSeats", "evPushed", "promptCounter", "gameStarted", "appliedMeta",
  "passAndPlay", "activeTurnSeat", "recipeRevealed",
  "live", "liveDone", "liveGen",
  "curSeat", "inBattlePrompt", "spectatingBattle",
  "shotClockSeat", "shotClockDeadline", "shotClockTimer", "shotClockForce",
  "shotClockStash", "shotClockPaused", "shotClockPauseElapsed",
  "timerOff", "shotClockFired", "turnExpired", "clockState",
  "activePickCleanup",
  "replaying", "dlog", "dlogIdx", "dlogN",
  "resumeEvLen", "resumeReadFailed",
  "soloMeta", "syncBoardRAF", "lastChatSendAt",
];

// ============================================================================
// Confirmed write-site ground truth (re-grepped 2026-07-24 against the live index.html,
// `grep -nE "\bNAME\s*=[^=]" index.html` excluding `==`, restricted to the classic-script region
// index.html:859-4667). RESEARCH.md's own Assumptions Log (A1) explicitly required this
// re-confirmation before the plan's task list could be finalized against it — line numbers drift,
// per its own caveat, so this is a fresh grep pass, not a copy of the research table.
//
// Every one of the 46 names below, not just the ~20 RESEARCH flagged "verify at migration time" —
// re-confirming all 46 closes D-04's "every read AND write site... before migration" mandate
// completely rather than partially. The declaration line itself is included in a name's list where
// the declaration's own initializer happens to match the `NAME=value` write pattern (e.g.
// `let game=null,` matches `\bgame\s*=` at its own declaration) — harmless, and expected: the
// declaration site is also where `state.NAME`'s default must be seeded from.
// ============================================================================
const CONFIRMED_WRITE_SITES = {
  game: [864, 4277, 4435],
  evIdx: [864, 2382, 4144, 4283, 4436],
  timer: [864], // see "timer classification" below — declaration only, no other write site exists
  logLines: [864, 1651, 4283, 4440],
  db: [3896, 3940],
  myId: [3896, 4623],
  room: [3896, 3983, 4255, 4266, 4342, 4346, 4651],
  mySeat: [3896, 3983, 4255, 4266, 4279, 4318, 4330, 4342, 4651],
  isHost: [3896, 3983, 4255, 4266, 4342, 4346, 4651],
  roster: [3896, 3986, 4267, 4278, 4385, 4392, 4532],
  turnOrder: [3790, 3899, 4439, 4462],
  numSeats: [3900, 3983, 4255, 4266, 4338, 4531],
  evPushed: [3900, 4016, 4030, 4050, 4436],
  promptCounter: [3900, 4087, 4108], // postfix `promptCounter++` at 4087/4108 — grep pattern below
  gameStarted: [3900, 4433],
  appliedMeta: [3900, 4217, 4436],
  passAndPlay: [3903, 3984, 4266],
  activeTurnSeat: [3561, 3568, 3574, 3581, 3594, 3598, 3603, 3903],
  recipeRevealed: [3561, 3568, 3573, 3593, 3601, 3903, 4309],
  live: [2015, 4436],
  liveDone: [2015, 3849, 4223, 4436],
  liveGen: [2015], // single occurrence total (RESEARCH-confirmed) — declaration only, never reassigned
  curSeat: [2016, 2081],
  inBattlePrompt: [2017, 4161, 4174, 4202],
  spectatingBattle: [2018, 3070, 3071],
  shotClockSeat: [2027, 2122, 2137, 2149, 2249],
  shotClockDeadline: [2027, 2123, 2150, 2170],
  shotClockTimer: [2027, 2129, 2138, 2158, 2171, 2177, 2247],
  shotClockForce: [2027, 2137, 2255, 2689, 2692],
  shotClockStash: [2031, 2136],
  shotClockPaused: [2032, 2126, 2137, 2151, 2168, 2174],
  shotClockPauseElapsed: [2032, 2176],
  timerOff: [2036, 2208],
  shotClockFired: [2037, 2124],
  turnExpired: [2037, 2125, 2250, 3558],
  clockState: [2037, 2278],
  activePickCleanup: [2041, 2257, 2880, 2881],
  replaying: [2046, 3990, 4015, 4524, 4550],
  dlog: [2047, 3989, 4258, 4269, 4438, 4544],
  dlogIdx: [2048, 3989, 4438, 4545], // plus postfix `dlogIdx++` inline reads at 2654/2866/3090/3742-equivalent sites (RESEARCH) — these are reassignments too; caught by --check-names, not itemized here since postfix `++` is not `NAME=` textually
  dlogN: [2049, 3989, 4438, 4545],
  resumeEvLen: [2050, 4547],
  resumeReadFailed: [2051, 4542, 4543, 4546],
  soloMeta: [3976, 3981, 3987, 4258, 4269],
  syncBoardRAF: [4590, 4591],
  lastChatSendAt: [2527, 2534],
};

// ============================================================================
// `timer` classification (Open Question 2)
// ============================================================================
// Resolved by grep: `grep -nE "timer\s*=\s*setInterval|timer\s*=\s*setTimeout|clearInterval\(timer\)|clearTimeout\(timer\)" index.html`
// returns ZERO matches for the bare `timer` binding anywhere in the file. The only interval/timeout
// handles that exist in this codebase are `shotClockTimer` (a distinct, separately-declared name,
// already its own row in this inventory) and a per-chat-bubble `b._timer` object property (not the
// bare identifier `timer` at all — it belongs to a locally-scoped bubble object, never touches the
// module-level binding).
//
// A full-file scan for the bare word `timer` (case-sensitive, word-bounded) inside the classic
// script region turns up 22 occurrences total, matching RESEARCH's count exactly — but 21 of the
// 22 are prose inside `//` comments ("the timer off/on toggle...", "timer switched off...") or UI
// copy inside string literals (`labelEl.textContent="timer off"`). Only ONE is a genuine code
// occurrence: the declaration itself at line 864 (`let game=null,evIdx=0,timer=null,logLines=[];`).
//
// CLASSIFICATION: `timer` is NOT an active setInterval/setTimeout handle. It is declared and never
// read or reassigned anywhere else in the current codebase — effectively dead state carried over
// from an earlier design. Its migration to `state.timer` is a pure, risk-free rename (one
// declaration site, seeded `null`, no clearInterval/clearTimeout correctness concern applies to it
// at all — that concern belongs entirely to `shotClockTimer`, whose 7 write sites above already
// include its own `clearInterval(shotClockTimer)` call sites at 2138/2177/2247).
const TIMER_IS_ACTIVE_INTERVAL_HANDLE = false;

export { APP_STATE_NAMES, CONFIRMED_WRITE_SITES, TIMER_IS_ACTIVE_INTERVAL_HANDLE };
