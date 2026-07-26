---
phase: 14
slug: engine-adjacent-gameplay-fixes-determinism
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-26
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no Jest/Vitest/Mocha) — custom Node ES-module scripts under `scripts/`, sequenced by `npm test` |
| **Config file** | none — the gate list lives in `package.json`'s `"test"` script string |
| **Quick run command** | `node scripts/determinism_baseline.js --verify` (alias `npm run test:determinism`) |
| **Full suite command** | `npm test` (9 gates: determinism, engine contract, dlog replay, net registry, net contract, state contract, module graph, ui contract, no-undef) |
| **Estimated runtime** | ~seconds for the quick run; full suite well under a minute |

> **Sequencing warning for executors.** Once the D-18 leeward change or the D-21 `moored`-reason field lands, `npm test`'s **first** gate (`determinism_baseline.js --verify`) will FAIL until the fixtures are re-recorded. That failure is *expected and correct*. Do **not** "fix" it by reverting the engine change. Re-recording is gated behind the D-26 diff-confirmation task.

---

## Sampling Rate

- **After every task commit:** `node scripts/determinism_baseline.js --verify` (plus any new targeted script for the task just completed). Once the fixture-perturbing engine work has begun, substitute the D-26 diff tool for the raw pass/fail until re-record lands.
- **After every plan wave:** `npm test` (all 9 gates).
- **Before `/gsd-verify-work`:** Full suite green against the **newly re-recorded** fixtures, plus manual Safari + Chrome UAT.
- **Max feedback latency:** ~60 seconds.

---

## Per-Task Verification Map

*Populated by the planner — one row per task, keyed to the plan and wave it lands in.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| *TBD by planner* | | | | — | N/A | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] **Full per-seed determinism diff** — `scripts/determinism_baseline.js --diff` or a new `scripts/determinism_diff.js`. The existing `verify()` (`scripts/determinism_baseline.js:150-241`) reports only the **first** divergent seed and the first divergent event within it. That cannot satisfy D-26's replacement criterion. Must enumerate **every** divergent event across all 30 seeds, tagged by event type. **Highest priority — blocks safely re-recording the corpus.**
- [ ] **First-storm-round assertion** — a check that no seed diverges *before* its first storm round, which is the D-26 "explainable, not narrow" evidence that replaces D-16's now-unachievable "storm-only differences" criterion.
- [ ] **Pure, DOM/Firebase-free hail logic** — extract hail targeting and pricing (e.g. `rankHailTargets` / `priceHailOffer`) so D-06/D-07 are unit-testable without mocking `ask()`, DOM, or `netHandlers()`.
- [ ] **`moored` reason assertion** — confirm the three `moored` causes (D-21) tag distinct `reason` values and render three distinct narration strings.
- [ ] No test-runner install needed — `node` (v25.9.0 confirmed present) is the only runtime dependency; `npm test` has no missing tool dependencies.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Boat visibly steps square-by-square through a bot's storm push | STORM-01 | DOM/CSS animation timing is not scriptable from the test harness | Force a storm via a temporary `cfg.storm=1` (**revert after**); watch a bot's push in Safari and Chrome. Use a fresh server port, not a `?cb=` query — Safari caches ES modules. |
| Every storm outcome is narrated during a bot's push, not just the last one | STORM-01 / D-11 | Narration pacing and log ordering are visual | Watch the narration log through a forced multi-leg bot push; confirm each outcome (dodge, anchor, aground, moored, blocked, anchorHold) produces its own line |
| Storm pacing is snappy but still legible | D-10 | Subjective feel — the explicit trade-off Wyatt named | 4-player game with a storm round; confirm bot pushes don't drag. Tuning knob is a single constant. |
| A bot that hails takes no other action that turn | AI-01 / D-24 | Requires a live human seat to receive the hail | Pass-and-play or multiplayer; decline a bot's hail and confirm the log shows the bot's turn ending, with the new refused-hail closing line — no fish/dock/attack follows |
| Hail targeting prefers spare-holders and the offer scales sensibly | D-06 / D-07 | Judgment on game feel; bots must not bankrupt themselves | Multi-human game; observe which seat gets hailed and at what price. Cross-check bot solvency over a full voyage. |
| Tortuga casts a wind shadow | D-18 | Visible only as a changed sail budget in play | Position a ship downwind of Tortuga; confirm the sail budget drops as it does downwind of any other island |
| Storm copy approval | D-14 / D-27 | Wyatt authors and approves storm copy by project precedent | Present the existing reused lines **plus** the genuinely new ones (three `moored` variants, refused-hail turn-end) for edit before the phase closes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] Determinism re-record is gated behind the D-26 diff confirmation, and what changed is documented alongside the new fixtures (D-16's surviving requirement)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
