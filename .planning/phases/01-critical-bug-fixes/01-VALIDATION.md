---
phase: 1
slug: critical-bug-fixes
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-22
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no `package.json`, no Jest/Mocha). An informal Node `vm`-based harness (`scripts/real_game_test.js`) extracts the `Game` class + `roundCfg` verbatim out of `index.html` and runs real bot-vs-bot games in Node with no DOM. |
| **Config file** | none — see Wave 0 |
| **Quick run command** | `node scripts/real_game_test.js 50` |
| **Full suite command** | `node scripts/real_game_test.js 2000` |
| **Estimated runtime** | ~2s quick / ~60s full (verify empirically on first run) |
| **Browser/manual** | `python3 -m http.server` + two Chrome tabs for multiplayer; Safari for BUG-01 perf |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/real_game_test.js 50` — fast sanity that the pure `Game` engine wasn't broken by the edit
- **After every plan wave:** Run `node scripts/real_game_test.js 2000` + the relevant manual reproduction
- **Before `/gsd-verify-work`:** Full suite green AND all four canonical reproductions pass
- **Max feedback latency:** ~60 seconds (full engine regression)

---

## Per-Task Verification Map

Task IDs are assigned by the planner; this table is seeded at the requirement level and refined during execution.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 0 | BUG-03, BUG-04 | — | N/A | unit | `node scripts/dlog_replay_test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1+ | BUG-01 | — | N/A | manual | N/A — Safari + FPS overlay (D-09) | N/A | ⬜ pending |
| TBD | TBD | 1+ | BUG-02 | — | N/A | manual | N/A — two-tab harness (D-10) | ❌ W0 | ⬜ pending |
| TBD | TBD | 1+ | BUG-03 | — | N/A | unit + manual | `node scripts/dlog_replay_test.js` + manual refresh | ❌ W0 | ⬜ pending |
| TBD | TBD | 1+ | BUG-04 | — | N/A | unit | `node scripts/real_game_test.js 2000` + dlog harness | ✅ (partial) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/dlog_replay_test.js` — extends the `vm`-extraction pattern from `scripts/real_game_test.js`: build a `Game`, play N turns, artificially truncate/empty the resulting `dlog`, assert the new incomplete-replay detection fires for a short log and does **not** fire for a healthy one. Covers BUG-03/BUG-04's engine-level claim without a browser or live Firebase.
- [ ] No test-framework install needed — the existing Node `vm` harness pattern is sufficient.

*Note: there is currently **zero** automated coverage of the shot-clock state machine (`shotClockFired`, `shotClockForce`, `shotClockSeat`). BUG-02 relies on manual reproduction. Extracting the pure state-transition logic into testable functions is a nice-to-have, not a blocker for this phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Storm runs at acceptable frame rate in Safari | BUG-01 | Safari-specific rendering perf; the Node harness is engine-only with no DOM | Serve locally, open in Safari, enable the D-09 FPS overlay, force a storm, confirm no hitch. Cross-check with Safari Web Inspector Timelines. Control: confirm frame rate is equally smooth with no storm active. |
| Timer off→on re-arms with a fresh 30s and no duplicate 20s penalty | BUG-02 | Depends on real Firebase round-trip timing between two clients | Two Chrome tabs (mind the shared-`localStorage` `pp_id` gotcha), 2 human seats. Let the clock run into the urgent window, host toggles ⏱ off then on. Confirm: guest can still act, clock re-arms at 30s, and the already-applied 1🌕 penalty is **not** refunded and **not** applied twice. |
| Refresh mid-game restores the in-progress voyage | BUG-03 | Requires a live Firebase room with a real dlog | Mid-game, host refreshes. Confirm the board restores rather than resetting. Then force the failure path (truncate the dlog) and confirm the loud "couldn't fully restore" state with Resume-anyway / Restart appears, and that guests see a coherent state too (D-08). |
| Host and guest stay in lockstep after pause/unpause/refresh | BUG-04 | Cross-client desync is only observable with two live clients | Run the full canonical repro (Wyatt's WyaARRGH/WyHat sequence), then compare host and guest board state, positions, ingredients, and coin counts. |

---

## Canonical Reproduction Script

The phase gate requires this exact sequence to pass (from `01-CONTEXT.md`):

1. Two human players in a multiplayer room
2. It is the non-host player's turn
3. Timer counts down 20 → 0, then enters the 10-second range
4. Host toggles the timer off ("pauses") for the friend
5. Host toggles the timer back on
6. **Expected:** the guest can still interact; the clock re-arms at a fresh 30s
7. Host refreshes the page
8. **Expected:** the in-progress voyage restores — ingredients, positions, coins all intact — or fails loudly with explicit choices. Never a silent reset.
9. **Expected:** host and guest remain deterministic and in sync afterward

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] D-09 instrumentation removed before phase close
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
