---
status: resolved
slug: mp-pause-clock-desync
phase: 13-multiplayer-turn-clock
trigger: "Phase 13 UAT test 3 — in a 2-window multiplayer game, pausing/resuming desyncs the shot-clock countdown between host and guest. Paused windows show different frozen remaining times (host 13s vs guest 20s); after resume the guest clock races to 0 / 'lose your turn' (red) while the host continues from the correct remaining time. Plus an approved UX tweak: the your-own-turn paused number resumes on click but does not look tappable."
created: 2026-07-26T17:41:49Z
updated: 2026-07-26T18:45:00Z
resolved: 2026-07-26T18:45:00Z
commit: 8a8da0a
---

# Debug Session: mp-pause-clock-desync

## Symptoms

- **Expected:** On resume the current player's countdown continues from the remaining time it had when paused (D-07), identically on host and every guest. While paused, all windows show the same frozen remaining time and stay frozen.
- **Actual:** While paused, host and guest show different frozen remaining seconds (repro: host 13s vs guest 20s). After resume, the guest countdown jumps to ~0 ("lose your turn", red) while the host continues from the correct remaining time.
- **Errors:** None (silent state desync).
- **Timeline:** New in Phase 13 CLOCK-02 (the pause feature itself is new this phase). The 2-window clock start (CLOCK-01, test 2) works; only pause/resume sync (test 3) fails. Tests 1, 2, 4, 5 pass.
- **Reproduction:** 2 browser windows (regular Chrome host + Incognito guest) at http://localhost:8013, join a room, start the game. Host clicks the ⏸ corner pause; observe both windows freeze at DIFFERENT numbers. Guest clicks ▶ to resume; guest clock races to 0 while host shows ~5s.

## Current Focus

hypothesis: |
  applyPauseState() (src/ui/util.js ~616) recomputes the host-local
  appState.shotClockDeadline on pause (stashes shotClockPauseElapsed) and on resume
  (Date.now()+30000-shotClockPauseElapsed), but the pause/resume path never
  re-broadcasts the new deadline. Guests receive the deadline only via
  watchClock() -> netWatchClock -> appState.clockState, written solely by
  broadcastClock()/netSetClock (src/orchestrator.js ~142). Since togglePause()/
  watchPause() (~160/170) never call broadcastClock(), guests keep rendering against
  the STALE pre-pause deadline, so their countdown is off by the pause duration.
  Additionally the guest's shotClockTick is not gated on shotClockPaused (host clears
  its interval in applyPauseState; guest's watchPause only sets shotClockPaused=v),
  so a guest can keep ticking against the stale deadline while paused.
test: |
  Confirm by inspection that (a) no broadcastClock()/netSetClock call exists on the
  pause or resume path, and (b) the guest render/tick path reads appState.clockState
  (broadcast deadline) rather than a paused-aware frozen value. Then implement and
  re-verify in the 2-window setup.
expecting: |
  With the host re-broadcasting the deadline after applyPauseState() on both pause and
  resume, and the guest honoring the paused flag, both windows show identical frozen
  remaining time while paused and identical continued countdown after resume.
next_action: "RESOLVED — fix implemented (commit 8a8da0a), all gates green, and CONFIRMED by human UAT (test 3 9/9, tests 4 & 5 pass). Session archived to .planning/debug/resolved/; knowledge-base entry appended; both UAT gaps marked resolved."

reasoning_checkpoint:
  hypothesis: "The host recomputes shotClockDeadline (resume) / stashes shotClockPauseElapsed (pause) locally in applyPauseState() but NEVER re-broadcasts, so guests keep rendering the stale pre-pause deadline (via appState.clockState) and derive their frozen paused number from a host-only appState.shotClockPauseElapsed they never receive — causing the frozen-number mismatch and the post-resume race to 0."
  confirming_evidence:
    - "src/orchestrator.js watchPause() host branch calls applyPauseState(v) with NO broadcastClock()/netSetClock after it (verified lines 170-177). broadcastClock() (line 142) is the SOLE netSetClock writer."
    - "src/ui/util.js applyPauseState() (lines 616-630) is purely local: pause stashes shotClockPauseElapsed + clears host timer; resume recomputes shotClockDeadline=Date.now()+30000-shotClockPauseElapsed. No network write anywhere in it."
    - "src/ui/panel.js setClockUI() paused branch (line 111) reads appState.shotClockPauseElapsed — set ONLY on the host in applyPauseState; a guest's is 0 → guest shows 20s while host shows 13s. Guest running branch (line 122) reads state.deadline=clockState.deadline (stale) → after resume Date.now()>deadline → remain=0 → 'lose your turn' red."
    - "Every client re-renders via a global setInterval(ui.setClockUI,500) (src/main.js:158); guests have NO shotClockTimer — so the guest 'tick' is just setClockUI reading clockState.deadline. Nothing else to gate."
  falsification_test: "If, after the host re-broadcasts the recomputed deadline + pause state on both pause and resume, a guest STILL showed a different frozen number or raced to 0, the hypothesis (missing broadcast is the sole cause) would be wrong. Prediction: with the re-broadcast + guest reading state.pauseElapsed/state.deadline, both windows match while paused and continue identically on resume."
  fix_rationale: "Root cause is a missing host→guest propagation, not a math error (host math is correct; solo tests 4&5 pass). Fix: (a) watchPause() host branch calls broadcastClock() after applyPauseState() — the SAME single deadline-writer, preserving host authority; (b) broadcastClock() payload carries paused + pauseElapsed so guests render the frozen number from authoritative data, not a host-only local; (c) guest flips frozen↔running from the clock payload's own paused bit so the flag and deadline update atomically (kills the resume 'flash to 0' that a watchPause/watchClock ordering gap would otherwise leave). No new freeze mechanism, no guest mutation of deadline/pauseElapsed."
  blind_spots: "Not yet run in a live 2-window Safari+Chrome session (human UAT will). A sub-RTT transient could exist if a clock write is dropped, but self-corrects on the next 500ms render. Solo path (togglePause local fallback) must stay unchanged — verified it reads host state directly and tests 4&5 already pass."
  candidate_causes:
    - "code: host pause/resume path never re-broadcasts the recomputed deadline (missing netSetClock call) — CONFIRMED primary"
    - "code/data: guest derives the frozen paused number from a host-only appState field (shotClockPauseElapsed) that is never sent over the wire — CONFIRMED contributing"
    - "config/environment: ruled out — same behavior Chrome host vs Incognito guest, no env dependence; solo (no network) works, isolating the defect to the host→guest broadcast path"
  and_gate: "yes — the visible failure needs BOTH contributing conditions simultaneously: (1) the host never re-broadcasts AND (2) the guest paused-render depends on a value only the host holds. Fixing only (1) would still leave the guest's frozen number wrong (reads local shotClockPauseElapsed=0); fixing only (2) would still leave the guest counting against a stale deadline on resume. The fix addresses both: re-broadcast + carry pauseElapsed/paused in the payload and read them on the guest."

## Evidence

- timestamp: 2026-07-26T17:41:49Z
  finding: "src/orchestrator.js watchPause() host branch calls applyPauseState(v) only; no broadcastClock()/netSetClock after it. togglePause() writes only the paused flag via netSetPaused."
- timestamp: 2026-07-26T17:41:49Z
  finding: "src/orchestrator.js broadcastClock() (~142) is the sole writer of the synced deadline (netSetClock); guests read it via watchClock() -> appState.clockState (~238/239)."
- timestamp: 2026-07-26T17:41:49Z
  finding: "src/ui/util.js applyPauseState() recomputes shotClockDeadline locally on pause/resume and clears/restarts the HOST shotClockTimer, but does not broadcast. Guest watchPause() only sets shotClockPaused=v — never clears a guest-side interval."
- timestamp: 2026-07-26T17:41:49Z
  finding: "src/ui/panel.js setClockUI() has two paused-render branches; the state-present (your-own-turn) branch shows the frozen number and already sets numEl.onclick=onTogglePause + cursor:pointer (works on click) but the affordance is not obvious vs the big-symbol branch."
- timestamp: 2026-07-26T18:05:00Z
  checked: "Inspection CONFIRMED all three hypothesis predictions: (a) watchPause() host branch (src/orchestrator.js:170-177) had NO broadcastClock() after applyPauseState(v); broadcastClock() (line 142) is the sole netSetClock writer. (b) applyPauseState() (src/ui/util.js:616-630) is purely local. (c) setClockUI() guest paused-render read appState.shotClockPauseElapsed (host-only, guest=0). (d) Guest 'tick' is the global setInterval(setClockUI,500) in src/main.js:158 — guests have no shotClockTimer, so nothing else to gate; the freeze is already honored (guest enters the paused branch), only the NUMBER was wrong."
  found: "Hypothesis fully corroborated by code. Root cause = missing host→guest propagation (AND-gate: missing re-broadcast AND guest deriving frozen number from a host-only field)."
  implication: "Fix = re-broadcast on pause/resume + carry paused/pauseElapsed in the payload + guest reads them; additive, not a math change."
- timestamp: 2026-07-26T18:20:00Z
  checked: "Agent-authored logic reproduction (scratchpad/repro_pause_desync.js) modeling the exact applyPauseState()/setClockUI() math for host+guest, fix OFF vs ON."
  found: "FIX OFF reproduces the reported symptom precisely — paused: host=13s guest=20s (DESYNC); resume: host=23s guest=0s (DESYNC). FIX ON: paused 13s/13s MATCH; resume 23s/23s MATCH. Exit 0."
  implication: "Revert-and-reconfirm (signal 5) + target-greens (signal 1) satisfied at the logic level; full behavioral 2-window revert-and-reconfirm is the human UAT per finish_line."

## Constraints (HARD — from CLAUDE.md + phase must_haves)

- MUST NOT touch src/engine/ or alter lockstep replay. `node scripts/determinism_baseline.js --verify` MUST stay 30/30.
- `npm test` MUST stay green, including scripts/net_contract_check.js watcher-inventory (currently 19 watchers / 19 registry.attach()). If a net watcher is added/removed, bump the inventory count in the SAME commit.
- Route ALL freezing through the single existing appState.shotClockPaused / waitWhilePaused() — no second parallel freeze mechanism.
- Guests MUST NOT mutate shotClockDeadline/shotClockPauseElapsed (host authority). Guests only mirror the flag / render the broadcast deadline.
- Must work in Safari and Chrome.
- A local server is already running on http://localhost:8013 serving THIS worktree — keep it running; do not stop it.
- After fix: user manually re-runs 2-window test 3 and re-confirms tests 4 & 5. Update .planning/phases/13-multiplayer-turn-clock/13-UAT.md gaps on resolution.

## Eliminated

(none yet)

## Resolution

root_cause: |
  A missing host→guest propagation on the pause/resume path, requiring TWO simultaneous
  contributing conditions (AND-gate):
  (1) src/orchestrator.js watchPause() host branch called applyPauseState(v) but never
      re-broadcast the recomputed deadline. applyPauseState() (src/ui/util.js) is purely local:
      pause stashes shotClockPauseElapsed + clears the host timer; resume recomputes
      shotClockDeadline=Date.now()+30000-shotClockPauseElapsed. broadcastClock()/netSetClock is
      the SOLE writer of the synced deadline, and it was never called on pause/resume — so guests
      (which read the deadline only via watchClock → appState.clockState) kept rendering the STALE
      pre-pause deadline, racing to 0 on resume.
  (2) The guest's paused-render derived its frozen number from appState.shotClockPauseElapsed —
      a value set ONLY on the host in applyPauseState. On a guest it is 0, so the guest froze at
      20s while the host showed 13s.
  Fixing only one leaves the other symptom; the fix addresses both.
fix: |
  1. src/orchestrator.js watchPause(): host branch now calls broadcastClock() immediately after
     applyPauseState(v), on BOTH pause and resume — the single host-authoritative deadline writer
     now fires on the pause/resume path (guests never mutate the deadline; host authority kept).
  2. src/orchestrator.js broadcastClock(): payload now carries paused:!!shotClockPaused on every
     write, and pauseElapsed (the host's frozen elapsed, D-07) only while paused — so guests
     render the frozen number from authoritative data instead of a host-only local.
  3. src/ui/panel.js setClockUI(): (a) the host's inline `state` carries paused+pauseElapsed;
     (b) a derived `paused` flag reads the clock broadcast's own paused bit (guest) / live flag
     (host) so the frozen↔running flip and the deadline update ATOMICALLY on guests — eliminating
     the resume flash-to-0 a watchPause/watchClock ordering gap could otherwise leave; (c) the
     paused branch reads state.pauseElapsed (fallback to the live deadline for the brief
     pre-broadcast window on a guest); (d) UX: the your-own-turn frozen number gets a .tappable
     class so it visibly reads as tap-to-resume (CLOCK-03 polish, folded in).
  4. index.html: #shotClockNum.tappable CSS (dotted underline + hover lift, reduced-motion aware).
  Freezing still routes solely through appState.shotClockPaused/waitWhilePaused(); no net watcher
  added or removed (inventory stays 19); src/engine/ untouched.
verification:
  target_test:        { result: pass }   # agent-authored logic repro: fix ON → paused MATCH + resume MATCH (scratchpad/repro_pause_desync.js, exit 0)
  mutation_check:     { result: skipped, reason_if_skipped: "no Stryker configured in this zero-dependency project", mutant_killed: null }
  no_op_deletion:     { result: pass, deletion_justified_by_rca: true }  # diff is +58/-12; every "deletion" is a line replaced in-place by a strictly more-capable version (added propagation + payload fields + authoritative guest read + tappable). RCA root cause is a MISSING propagation → fix ADDS propagation.
  adjacent_tests:     { result: pass, suites_run: ["npm test (determinism_baseline --verify, engine_contract_check, dlog_replay_test, net_registry_test, net_contract_check, state_contract_check, module_graph_check, ui_contract_check, no_undef_check)", "determinism_baseline --verify 30/30"] }
  revert_and_reconfirm: { result: pass, bug_returned_on_revert: true, fixed_on_reapply: true }  # logic-level: FIX OFF reproduces host=13/guest=20 paused + host=23/guest=0 resume; FIX ON both MATCH. Behavioral 2-window revert-and-reconfirm delegated to human UAT (finish_line).
  guardrail_verdict:  accepted
  full_behavioral_verification: "CONFIRMED by human UAT (Wyatt, 2026-07-26, commit 8a8da0a) — test 3 (2-window MP, Chrome host + Incognito guest): pause freezes BOTH windows at the SAME number 9/9 and resume continues together, guest no longer races to 0 (verified with screenshots); test 4 (solo pause/resume regression): pass; test 5 (CLOCK-03 clickable paused symbol + new tappable affordance): pass. npm test 9/9 (19-watcher inventory intact), determinism 30/30, zero src/engine/ changes."
files_changed: [index.html, src/orchestrator.js, src/ui/panel.js]
commit: 8a8da0a
