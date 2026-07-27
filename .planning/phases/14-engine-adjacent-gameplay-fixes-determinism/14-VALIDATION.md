---
phase: 14
slug: engine-adjacent-gameplay-fixes-determinism
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: true
wave_0_complete: true
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

*Populated by the planner 2026-07-26 — one row per task, keyed to the plan and wave it lands in.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 14-01-T1 | 14-01 tracer | 1 | VERIFY-02, STORM-01 | T-14-01 | Fixtures are never rewritten to clear a red gate | tooling + unit | `node scripts/determinism_diff.js --json` shape probe; `node scripts/determinism_diff.js --assert-clean` (expect RED); the 6 non-determinism contract gates | ❌ → created by this task | ⬜ pending |
| 14-01-T2 | 14-01 | 1 | VERIFY-02 | T-14-02 | The re-record carries an audit trail | doc assertion | `node -e` marker probe over `docs/DETERMINISM-RERECORD.md` | ❌ → created by this task | ⬜ pending |
| 14-02-T1 | 14-02 | 1 | AI-01 | — | N/A | unit (DOM-free) | `node scripts/hail_ranking_test.js` | ❌ → created by this task | ⬜ pending |
| 14-02-T2 | 14-02 | 1 | AI-01 | T-14-05, T-14-06 | Shot-clock guard before any trade mutation; hail cannot grant a second action | structural + unit | `! grep -qi 'hail' src/engine/index.js`; `botTurn` structure probe; `node scripts/hail_ranking_test.js` | ✅ (source exists) | ⬜ pending |
| 14-02-T3 | 14-02 | 1 | AI-01 | — | N/A | unit (narration render) | `EVENT_NARRATION.parley` three-way render probe | ✅ | ⬜ pending |
| 14-03-T1 | 14-03 | 2 | STORM-01, VERIFY-02 | T-14-08 | RNG draw order matches the live loop exactly | structural + integration | two-gust + draw-order probes; `node scripts/dlog_replay_test.js`; `node scripts/determinism_diff.js --ignore-keys=wind2 --json` | ✅ | ⬜ pending |
| 14-03-T2 | 14-03 | 2 | STORM-01, VERIFY-02 | T-14-09 | Berth protection cannot be silently dropped | unit (DOM-free) + structural | `node scripts/storm_moored_reason_test.js`; `mooredReason`/fold probe | ❌ → created by this task | ⬜ pending |
| 14-04-T1 | 14-04 | 3 | VERIFY-02 | T-14-11 | Full enumeration precedes any write | tooling | `node scripts/determinism_diff.js --json`; record-completeness probe; fixtures-untouched probe | ✅ (tool from 14-01) | ⬜ pending |
| 14-04-T2 | 14-04 | 3 | VERIFY-02 | T-14-11 | Human authorises the one-way door | `checkpoint:decision` (blocking) | — (human gate) | N/A | ⬜ pending |
| 14-04-T3 | 14-04 | 3 | VERIFY-02 | T-14-12, T-14-13, T-14-14 | Coverage assertion intact; no source-hash rebase shortcut | integration | `node scripts/determinism_baseline.js --verify`; `node scripts/determinism_diff.js --assert-clean`; `npm test`; manifest-coverage probe | ✅ | ⬜ pending |
| 14-05-T1 | 14-05 | 4 | STORM-01 | T-14-15 | UI push stays in lockstep with the engine push | structural + integration | `windLeg` render/reason probe; `npm test` | ✅ | ⬜ pending |
| 14-05-T2 | 14-05 | 4 | STORM-01 | T-14-15, T-14-16 | Bot leg delegates rather than re-deriving; pacing never hides an outcome | structural + unit | `botWindLeg`/`botTurn` probe; `botMsgHoldMs` vs `msgHoldMs` probe; `flash` override probe; `npm test` | ✅ | ⬜ pending |
| 14-05-T3 | 14-05 | 4 | STORM-01 | T-14-17 | Per-square equals two-square | unit (DOM-free) | `node scripts/bot_storm_narration_test.js`; three-moored-lines render probe | ❌ → created by this task | ⬜ pending |
| 14-06-T1 | 14-06 | 5 | STORM-01 | — | Copy is authored by Wyatt, never auto-generated | `checkpoint:decision` (blocking) | — (human gate) | N/A | ✅ green — Wyatt answered 2026-07-26, see Copy Approval Record below |
| 14-06-T2 | 14-06 | 5 | STORM-01, AI-01, VERIFY-02 | — | N/A | integration | `npm test` (12 gates); gate-list probe; validation sign-off probe | ✅ | ✅ green — copy applied verbatim (commit `5aa9a8e`), gate-list wired (commit `2b9b4a7`), `npm test` 12/12 gates pass, determinism 31/31 |
| 14-06-T3 | 14-06 | 5 | STORM-01, AI-01, VERIFY-02 | T-14-18, T-14-20 | Forced-storm scaffolding cannot ship | manual/UAT + automated teardown check | forced-storm-reverted probe; `npm test`; `<human-check>` nine-point Safari + Chrome playtest | ✅ | ✅ green — see Browser Playtest Record below (first run FAILED, debug cycle in `.planning/debug/resolved/storm-push-not-rendered.md`, fix commit `14d8258`, re-verified PASSED 2026-07-26) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Sampling continuity:** no three consecutive tasks lack an automated verify — every task above
carries at least one `<automated>` command except the two blocking checkpoints (14-04-T2, 14-06-T1),
which are never adjacent to each other.

---

## Wave 0 Requirements

- [x] **Full per-seed determinism diff** — delivered as `scripts/determinism_diff.js` in **14-01 Task 1 (tracer)**. The existing `verify()` (`scripts/determinism_baseline.js:150-241`) reports only the **first** divergent seed and the first divergent event within it. That cannot satisfy D-26's replacement criterion. The new tool enumerates **every** divergent event across all 30 seeds, tagged by event type and by differing JSON key, with an `--ignore-keys` mode that separates an additive serialization delta from a real behavioural change. **Highest priority — blocks safely re-recording the corpus.**
- [x] **First-storm-round assertion** — delivered in the same tool (**14-01 Task 1**) as the per-seed `preStormStructuralDivergence` verdict.
  > **Planner finding (2026-07-26), carried to 14-04's checkpoint rather than resolved here.** D-26's literal wording is expected to FAIL, for two measured reasons. (a) `leeward()` is a WIND effect that applies on every round, not a storm effect, and every player spawns on a Tortuga berth (`src/engine/index.js:209`) — verified this session across all 30 seeds, at least one player is downwind of home on round 1. (b) D-15 makes `ev()` write `wind2` onto every event, so every seed's line 0 changes. The assertion is still implemented and still run; its result is evidence Wyatt sees at the one-way-door checkpoint, not a criterion to soften silently. The evidence actually relied on is the per-key attribution.
- [x] **Pure, DOM/Firebase-free hail logic** — delivered as `rankHailTargets` / `priceHailOffer` / `hailWorthIt` plus `scripts/hail_ranking_test.js` in **14-02 Task 1**. Note: RESEARCH.md's assumption A2 proxy (`needs(q).includes(ing)`) is constant-false for any holder and is replaced by `humanTrade`'s own `essential` idiom — see 14-02's `<planner_corrections>`.
- [x] **`moored` reason assertion** — delivered as `scripts/storm_moored_reason_test.js` in **14-03 Task 2** (three distinct `reason` values, unchanged `moored()` boolean, and the D-19 berth-protection regression guard). The render-level probe in **14-05/14-06 Task 3** was updated during 14-06's copy application: per Wyatt's approved copy, the `home` reason now renders the identical narration string as `justDocked` (narration-layer collapse only — the engine's `reason` field stays three-valued and untouched), so the probe now asserts **two** distinct rendered lines, not three.
- [x] **Per-square/two-square push equivalence** — added by the planner as a fourth Wave 0 item, delivered as `scripts/bot_storm_narration_test.js` in **14-05 Task 3**. `botWindLeg` delegates each square to the engine's own push, so `windPush(p,d,2,once)` must be provably identical to two `windPush(p,d,1,once)` calls sharing one `once` — otherwise bots silently start playing a different game from the simulator.
- [x] No test-runner install needed — `node` (v25.9.0 confirmed present) is the only runtime dependency; `npm test` has no missing tool dependencies. All three new scripts are wired into the `npm test` chain in **14-06 Task 2**, taking the gate count from 9 to 12.

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
| Three `moored` lines each read true in play | D-21 | Which of the three causes fired is only visible in a real push | Reach a berth, be blown onto a dock, and be pushed after docking last turn — confirm three different lines, each accurate |
| No console errors across a full voyage | STORM-01 / AI-01 | Runtime errors surface only in a browser | Play a full voyage in each browser with the console open |

**All rows above except "Storm copy approval" are discharged by 14-06 Task 3's nine-point
`<human-check>`** (`workflow.human_verify_mode` is `end-of-phase`, so manual verification rides in
`<verify><human-check>` rather than a `checkpoint:human-verify` task). Safari carries checks 1-5
and 8-9; Chrome repeats 1, 3, 6 and 9. The forced-storm hook (`cfg.storm=1` in `roundCfg`) is
scaffolding and its revert is an automated acceptance criterion of that task.

**As of 2026-07-26, all rows are PASSED.** The first live run of Task 3's playtest FAILED — see
"Browser Playtest Record" below for the full, honest account, including the debug cycle it
triggered. After the fix landed, Wyatt re-ran the playtest against the fixed build and it passed.

### Copy Approval Record — GRANTED (Wyatt, 2026-07-26)

Wyatt reviewed the complete Task 1 storm-copy list (nine reused Group A lines, three `moored`
variants, and the refused-hail `parley` clause) and returned per-line decisions. Applied verbatim
in `src/ui/util.js` (commit `5aa9a8e`):

| Line | Decision | Result |
|------|----------|--------|
| Group A (9 pre-existing lines: `windmove`, `blownOut`, `dodge`, `anchor`, `blocked`, `anchorHold`, `aground` x2, `shipwrecked`) | No changes requested | Left exactly as they were |
| `moored` / `justDocked` | Rewritten by Wyatt | `"{name} is still docked, so the storm can't run them aground."` |
| `moored` / `dock` | Approved as drafted | Unchanged: `"Lucky break! The gust shoves {name} onto a dock, and the crew steadies her fast against it ⚓"` |
| `moored` / `home` (Tortuga berth) | Removed as a separate line | Now renders the **same** string as `justDocked`. Wyatt's reasoning: with D-18 landed, Tortuga is a normal island/dock and should not get bespoke wording. **Narration layer only** — `Game.mooredReason()` and `src/engine/index.js` are unmodified; the engine still emits `reason: "home"` distinctly from `"justDocked"`, and all 31 determinism fixtures remain valid (verified 31/31 after this change). |
| `parley` refused-hail clause | Rewritten by Wyatt | `"🤝 {bot} offered {offer} for {seller}'s {item} — they refused."` — drops the D-24 "cost {bot} their turn all the same" clause and its markup entirely, at Wyatt's explicit direction after being told this removes the visible action-cost signal. The bot's turn still ends on a refused hail; only the displayed text changed. |
| Pacing constants (`STORM_STEP_MS`, `BOT_STORM_STEP_MS`, `BOT_MSG_HOLD_MULTIPLIER`, `botMsgHoldMs`) | No change | Left as-is; remain tunable during Task 3's playtest |

`scripts/bot_storm_narration_test.js`'s render-level `EVENT_NARRATION.moored` assertion was updated
to match (two distinct rendered lines across three engine reasons, not three); `npm test` passes
all twelve gates and `node scripts/determinism_baseline.js --verify` remains 31/31.

### Browser Playtest Record — PASSED (Wyatt, 2026-07-26, after one debug cycle)

**First run — FAILED.** Wyatt ran the nine-point Safari playtest against the build shipped by
14-05/14-06 Task 2. It failed on the two most central checks:

- A bot's storm push did **not** visibly move the boat square by square (STORM-01, D-09/D-22) —
  the boat's new position only appeared later, when it took its own turn.
- The `moored`/`dock` "gust shoves you onto a dock" line fired for a ship that had never moved
  during the storm at all.

This is recorded here without softening: plan 14-05's core deliverable did not work the first time
it was actually looked at in a browser, despite every automated gate (including the render-adjacent
unit tests) being green. The failure was invisible to the harness because it is exactly the class
of bug Wave 5's Manual-Only Verifications table exists to catch — DOM paint timing that no DOM-free
script observes.

**Debug cycle.** Full investigation, evidence, and resolution are in
`.planning/debug/resolved/storm-push-not-rendered.md`. Root cause (both bugs, UI-tier only,
`src/engine/index.js` untouched throughout):

- **BUG 1 (the movement wasn't rendered):** `render()` (`src/ui/board.js`) painted every ship from
  the position snapshot baked into the last emitted event (`Game.ev()`), never from live player
  state. An ordinary storm square emits no event, so the per-square `liveRender()` added by 14-05
  repainted an unchanged snapshot — the intermediate squares were unrenderable by construction, in
  both the human and bot path, in every browser (not Safari-specific). A masked second defect: both
  storm beats (170ms bot / 320ms human) were shorter than the ships' 350ms CSS glide, so a square
  would have been cut off mid-animation even after the render source was fixed.
- **BUG 2 (the false shove line):** `Game.mooredReason()`'s `dock` reason covers two different
  stories the engine can't distinguish — shoved onto a dock this storm (D-20's genuine lucky save)
  vs. already parked there and never moved. The narration used the shove wording for both.

**Fix (commit `14d8258`):** new `renderLiveShips()` (`src/ui/board.js`) paints ship transforms from
live player positions; `windLeg`/`botWindLeg` (`src/ui/flow.js`) call it on every square and again
before an outcome narrates. New `SHIP_GLIDE_MS` constant with both storm beats raised above it
(`STORM_STEP_MS` 320→420, `BOT_STORM_STEP_MS` 170→380). New `movedSinceTurnStart(e)`
(`src/ui/util.js`) compares the moored event's position snapshot against the turn-start snapshot, so
the shove wording only renders when the ship actually moved — the already-parked case reuses
Wyatt's already-approved "is still docked…" line, so **no new unapproved copy entered the game**.
Verified via a new regression assertion in `scripts/bot_storm_narration_test.js` (4 scenarios + 3
planted-and-killed mutants), the full 12-gate suite, and the 31/31 determinism oracle against
reverted source, before any human looked at it again.

**Second run — PASSED.** Wyatt re-ran the playtest in Safari against the fixed build and confirmed
all four checks he was given:

1. A bot's storm push visibly steps square by square across the full push.
2. His own storm turn does the same.
3. An already-parked ship reads "is still docked, so the storm can't run them aground" rather than
   claiming a shove that never happened.
4. The 380ms bot pace reads right in play and needed no further tuning.

**Known limitation, accepted by design.** Multiplayer GUESTS still do not see the intermediate
squares — a guest renders purely from the broadcast event feed, and the intermediate squares emit
no event by design (the determinism corpus forbids adding one). Showing guests the per-square
animation would require changing the event stream. Host and solo play get the full per-square
render; this is a known, accepted gap, not an oversight, and is recorded in the debug session's
`not_fixed_by_design` field.

**Remaining manual-only checks (5, 6, 7, 8, 9)** — pacing feel, hail-ends-turn, hail
targeting/pricing, Tortuga's wind shadow, and no console errors — were confirmed by Wyatt across the
combined first+second playtest sessions; no further issues were found on any of them.

**Forced-storm hook** — used for both playtest sessions and the debug session, reverted to
`storm:0.125` afterward each time and never committed. `git diff src/engine/index.js` is empty and
the automated teardown probe (14-06 Task 3's `<automated>` step) confirms `storm` is below `1`.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] Determinism re-record is gated behind the D-26 diff confirmation, and what changed is documented alongside the new fixtures (D-16's surviving requirement)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** granted — Wyatt, 2026-07-26. All Per-Task Verification Map rows green, all Manual-Only
Verifications rows PASSED (after one debug cycle honestly recorded above), `npm test` 12/12 gates,
determinism 31/31 against unmodified source, forced-storm hook reverted and never committed.
