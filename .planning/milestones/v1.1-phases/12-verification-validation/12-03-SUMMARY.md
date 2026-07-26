---
phase: 12-verification-validation
plan: 03
subsystem: testing
tags: [chrome-mcp, verification-checklist, multiplayer, determinism, recovery, shot-clock]

# Dependency graph
requires:
  - phase: 12-verification-validation
    provides: "12-02's committed docs/VERIFICATION-CHECKLIST.md with Criterion-3 left empty for this plan"
provides:
  - "docs/VERIFICATION-CHECKLIST.md Criterion-3 (VERIFY-03) fully recorded: two-tab host+guest deterministic sync PASS, plus the full D-02 pause/refresh recovery matrix (pause holds state, guest refresh restores, host refresh restores + stays in lockstep) PASS"
  - "VERIFY-03 marked satisfied in REQUIREMENTS.md (checkbox + traceability table)"
affects: [12-04-safari-signoff-and-validation-closeout]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Test-artifact disclosure: when a same-machine/same-Chrome-profile two-tab test session produces an environment-only glitch (here, a transient pp_id collision on host reload via shared localStorage), record it explicitly as a test-environment artifact distinct from the game's actual restore behavior, with the root cause and the fact that real separate-device players cannot hit it."

key-files:
  created: []
  modified: [docs/VERIFICATION-CHECKLIST.md]

key-decisions:
  - "VERIFY-03 satisfied via direct Chrome-MCP two-tab drive: all sync sub-steps (host+guest join, seat/status propagation, >=3 synced turns with byte-identical turnOrder across tabs, narration broadcast, populated watcher registry) PASS with zero game console errors, AND all three D-02 recovery sub-steps (shot-clock pause holds state, guest-tab refresh restores the voyage, host-tab refresh restores and lockstep survives) PASS."
  - "Recorded a transient first-host-reload pp_id collision as a test-environment artifact, not a defect: both Chrome tabs shared one localStorage in this same-machine same-profile session, so the host's reload briefly picked up the guest's more-recently-written pp_id value. Re-setting the host's own pp_id and reloading again produced the correct host-identity restore (recorded as the D-02(c) PASS). Real host+guest players are on separate devices/profiles with isolated localStorage and cannot hit this."
  - "The only console errors observed all session were from Wyatt's Zotero Chrome extension (chrome-extension://.../zotero.js, 'Could not establish connection') -- unrelated to the game/refactor, noted explicitly and excluded from the zero-game-console-errors claim."

patterns-established:
  - "docs/VERIFICATION-CHECKLIST.md's Criterion-3 now documents the full 11-step two-tab scenario plus the shared-localStorage pp_id gotcha as it applies specifically to a mid-game RELOAD (not just initial tab setup) -- useful for anyone re-running this checklist and hitting the same collision."

requirements-completed: [VERIFY-03]

coverage:
  - id: D1
    description: "Two-tab host+guest deterministic sync: unique pp_id per tab (set-then-reload), host+join, >=3 synced turns with matching captain-state (turnOrder identical across tabs), narration broadcast, watcher registry populated"
    requirement: "VERIFY-03"
    verification:
      - kind: manual_procedural
        ref: "orchestrator browser-MCP session against http://127.0.0.1:8021/ (this worktree), two Chrome tabs: host-ngw62w hosted room WRMV, guest-lt47xs joined; seat/status propagated both ways (netWatchSeats); game start propagated (netWatchStatus); sailing-order draw resolved to turnOrder [2,1,0,3] identically on both tabs; narration broadcast confirmed; window.__pp_net_debug.size() > 0 (16 watchers guest / 6 host, role-dependent) -- all PASS, 0 game console errors"
        status: pass
    human_judgment: true
    rationale: "Performed by the orchestrator's live browser-MCP session, not a repeatable automated script this executor can independently re-invoke -- recorded here as executed evidence per the same provenance pattern as 12-01/12-02's live-session findings."
  - id: D2
    description: "D-02(a) pause the shot-clock -- game state stays intact, no reset (the v1.0 core guarantee)"
    requirement: "VERIFY-03"
    verification:
      - kind: manual_procedural
        ref: "orchestrator browser-MCP session: shot-clock auto-paused whenever a tab was backgrounded; room, turnOrder, positions, and recipe state stayed fully intact across every pause observed -- no reset"
        status: pass
    human_judgment: true
    rationale: "Same live-session provenance as D1."
  - id: D3
    description: "D-02(b) refresh the GUEST tab mid-game -- the voyage restores to the same turn/board"
    requirement: "VERIFY-03"
    verification:
      - kind: manual_procedural
        ref: "orchestrator browser-MCP session: guest tab reloaded mid-game restored cleanly -- back in-game (not lobby), room WRMV, identity guest-lt47xs preserved, turnOrder [2,1,0,3] preserved, 16 watchers re-attached, sailing-order narration restored, 0 game console errors"
        status: pass
    human_judgment: true
    rationale: "Same live-session provenance as D1."
  - id: D4
    description: "D-02(c) refresh the HOST tab mid-game -- restores AND deterministic lockstep/sync survives the cycle"
    requirement: "VERIFY-03"
    verification:
      - kind: manual_procedural
        ref: "orchestrator browser-MCP session: host tab reloaded mid-game restored -- back in-game, room WRMV, correct host identity host-ngw62w (after a re-set following a test-artifact pp_id collision -- see note below), turnOrder [2,1,0,3] preserved (matching the guest's state), watchers re-attached, game advanced coherently to recipe-choice, 0 game console errors"
        status: pass
    human_judgment: true
    rationale: "Same live-session provenance as D1; the transient pp_id collision on the first reload attempt is disclosed as a test-environment artifact (shared localStorage across same-profile Chrome tabs), not a defect in the game's recovery logic -- resolved by re-setting the host's own pp_id and reloading again, after which the restore was correct."
  - id: D5
    description: "Automated regression baseline stays green throughout: npm test (full 9-script chain) exit 0"
    requirement: "VERIFY-03"
    verification:
      - kind: integration
        ref: "npm test (exit 0), re-run after both the scaffold edit and the results-recording edit to docs/VERIFICATION-CHECKLIST.md; no source files touched this plan"
        status: pass
    human_judgment: false

duration: ~25min
completed: 2026-07-25
status: complete
---

# Phase 12 Plan 03: Two-Tab Multiplayer + Pause/Refresh Recovery Matrix (Criterion 3 / VERIFY-03) Summary

**Chrome-driven proof that two-tab host+guest multiplayer syncs deterministically (identical turnOrder across tabs) AND the full D-02 pause/refresh recovery matrix holds -- pausing the shot-clock never destroys state, and both guest-tab and host-tab mid-game refreshes restore the voyage with lockstep intact.**

## Performance

- **Duration:** ~25 min (including the orchestrator's live two-tab Chrome-MCP drive)
- **Completed:** 2026-07-25
- **Tasks:** 2 (both required a browser tool this executor doesn't have; scaffolded, checkpointed, then completed after the orchestrator relayed results)
- **Files modified:** 1 (`docs/VERIFICATION-CHECKLIST.md`)

## Accomplishments
- Scaffolded an 11-step Criterion-3 scenario into `docs/VERIFICATION-CHECKLIST.md`: the shared-localStorage `pp_id` sequential set-then-reload gotcha, host+join, >=3 synced turns with a captain-state comparison, narration broadcast, watcher-registry check, then the three D-02 recovery sub-steps.
- Recorded the orchestrator's live Chrome-MCP two-tab session results: host (`host-ngw62w`, room `WRMV`) + guest (`guest-lt47xs`) joined with seat/status propagating both ways; the sailing-order draw resolved to an **identical `turnOrder [2,1,0,3]`** on both tabs, direct proof of deterministic lockstep; narration broadcast confirmed; watcher registry populated (16 watchers on the guest, 6 on the host -- role/phase-dependent, not a discrepancy).
- Recorded all three D-02 recovery sub-steps PASS: (a) pausing the shot-clock (auto-pause on tab-backgrounding) left room/turnOrder/positions/recipe fully intact -- the v1.0 "pausing the timer must never destroy game state" guarantee holding for real two-tab multiplayer; (b) reloading the guest tab mid-game restored the same turn/board cleanly; (c) reloading the host tab mid-game restored AND the post-restore `turnOrder` still matched the guest's -- lockstep survived the refresh cycle.
- Transparently recorded a test-artifact finding: the first host-tab reload transiently picked up the guest's `pp_id` from the shared Chrome-profile `localStorage` (a same-machine test-session artifact, since real host and guest players are on separate devices/profiles with isolated storage) -- re-setting the host's own `pp_id` and reloading again produced the correct restore, which is what's recorded as the D-02(c) PASS.
- Noted the only console errors seen all session were unrelated Zotero browser-extension noise (`chrome-extension://.../zotero.js`), not game/refactor errors -- explicitly excluded from the zero-game-console-errors claim.
- Re-ran `npm test` after both edits: full 9-script chain green (exit 0); no source files touched this plan.
- Marked VERIFY-03 satisfied in the checklist and in `REQUIREMENTS.md` (checkbox + traceability table).

## Task Commits

Each task was committed atomically:

1. **Task 1 & 2 (prep): Criterion-3 scenario scaffold** - `f426a47` (docs) -- the non-browser scaffolding work (11-step scenario + unchecked results skeleton), committed before the checkpoint pause
2. **Task 1 & 2 (results): Chrome-driven results recording** - `f1fd1b5` (feat) -- recorded after the orchestrator's Chrome-MCP session results were relayed

**Plan metadata:** (this commit) - docs: complete plan

_Note: this plan is `autonomous: false` with a Chrome-driven core, so it followed the browser-checkpoint handoff pattern established in 12-02: scaffold everything non-browser, commit, checkpoint, then complete once the orchestrator's session results arrived._

## Files Created/Modified
- `docs/VERIFICATION-CHECKLIST.md` - Criterion-3 (VERIFY-03) section: 11-step scenario scaffold, Part A (sync) and Part B (D-02 recovery matrix) results, the test-artifact disclosure note, and the VERIFY-03-satisfied line

## Decisions Made
- VERIFY-03 satisfied directly (not via a coverage split like 12-02) -- the orchestrator's single Chrome-MCP session was able to drive both the two-tab sync scenario and the full D-02 recovery matrix in one continuous pass, since neither MP sync nor pause/refresh recovery hits the solo shot-clock's background-tab pause blocker the way 12-02's continuous solo drive did (pausing/refreshing IS the scenario here, not an obstacle to it).
- The transient first-host-reload `pp_id` collision was recorded as a disclosed test-environment artifact rather than silently corrected out of the record -- consistent with the project's standard of transparent coverage/artifact disclosure (12-02 precedent) and directly relevant to anyone re-running this same-machine, same-profile two-tab procedure later.

## Deviations from Plan

None (Rules 1-4) -- the plan anticipated exactly this shape of outcome (browser-checkpoint handoff pattern, explicit scenario steps for both sync and the D-02 matrix) and the orchestrator's session completed all of it in one pass with no blockers requiring a Rule 1-4 fix.

## Issues Encountered

The first host-tab reload during the D-02(c) recovery step transiently restored under the guest's identity (`guest-lt47xs`) instead of the host's own (`host-ngw62w`), because both Chrome tabs in this same-machine same-profile test session share one `localStorage`, and the guest's more-recently-set `pp_id` value was still present at the shared key when the host reloaded. This is the documented shared-localStorage `pp_id` gotcha (12-CONTEXT.md), here triggered by a mid-game reload rather than initial tab setup. It is a **test-environment artifact**, not a game/refactor defect -- a real host and a real guest are on separate devices/browser profiles with genuinely isolated `localStorage` and cannot hit this collision. Resolved by re-setting the host's own `pp_id` and reloading again, after which the host restored correctly with `turnOrder` matching the guest -- recorded as the D-02(c) PASS.

## User Setup Required

None -- no external service configuration required. This plan's Chrome-MCP two-tab drive was performed entirely by the orchestrator.

## Next Phase Readiness

- `docs/VERIFICATION-CHECKLIST.md` Criterion-3 is fully recorded; VERIFY-03 marked satisfied in `REQUIREMENTS.md`.
- 12-04 (Safari sign-off + validation closeout, Criterion 4) can proceed -- it should confirm Wyatt's VERIFY-04 desktop-Safari playthrough lands, and can then close out the Requirements -> Test Map for all of VERIFY-01..04, mirroring the Phase 11 pattern.
- No blockers. Automated regression baseline (`npm test`) remains green; no source files were touched this plan (verification-only, per D-01).

---
*Phase: 12-verification-validation*
*Completed: 2026-07-25*

## Self-Check: PASSED

- FOUND: `docs/VERIFICATION-CHECKLIST.md`
- FOUND: `.planning/phases/12-verification-validation/12-03-SUMMARY.md`
- FOUND commit: `f426a47` (Criterion-3 scenario scaffold)
- FOUND commit: `f1fd1b5` (Chrome-driven results recording)
