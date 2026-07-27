---
phase: 14-engine-adjacent-gameplay-fixes-determinism
verified: 2026-07-27T01:10:20Z
status: human_needed
score: 9/10 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Confirm with Wyatt whether the multiplayer-GUEST storm-push visibility gap is an acceptable, permanent scope limit for STORM-01, or whether it needs a follow-up phase/backlog item."
    expected: "An explicit yes/no from Wyatt, recorded somewhere durable (CONTEXT.md addendum, REQUIREMENTS.md footnote, or a new backlog todo) — not just an executor's own 'accepted by design' note."
    why_human: "This is a scope/product decision, not a code-correctness question. The mechanism (guests render only from the broadcast event stream, and the intermediate storm squares emit no event by design, per the determinism corpus's frozen event shape) is real and unavoidable without reopening the event-stream contract — but no one asked Wyatt to accept it FOR THIS SPECIFIC CASE. He signed off on the Safari/Chrome host-side playtest (VALIDATION.md, four checks) and on the storm/hail copy (D-14/D-27), but the guest-render gap surfaced only inside the debug session (storm-push-not-rendered.md) and was self-declared 'accepted by design' by the executor, not put to him as a question. ROADMAP.md's Success Criterion 1 ('the boat visibly moves one square at a time') and REQUIREMENTS.md's STORM-01 line carry no host/guest qualifier, so as literally worded this criterion is not fully met for every player role."
  - test: "Decide whether ROADMAP.md's Phase 14 success-criterion-4 wording ('(30/30)') should be updated to match REQUIREMENTS.md's already-updated '(31/31)' wording."
    expected: "A one-line ROADMAP.md edit, or an explicit decision that the drift is acceptable since REQUIREMENTS.md (the authoritative traceability doc) already reflects the correct number and DETERMINISM-RERECORD.md documents the add-a-seed decision in full."
    why_human: "Cosmetic documentation drift only — the underlying determinism gate is genuinely green at 31/31 (independently re-run and confirmed by this verification, not merely trusted from SUMMARY.md). Flagged for completeness, not because it affects behavior."
---

# Phase 14: Engine-Adjacent Gameplay Fixes & Determinism Verification Report

**Phase Goal:** Storm pushes move the boat correctly one square at a time (with docking/aground checks at the right square), and the bot "hail humans" turn follows a decided rule — both without breaking deterministic multiplayer replay.
**Verified:** 2026-07-27T01:10:20Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

Every claim below was checked directly against the current codebase and by independently re-running
the test suite and the determinism harness in this session — not by trusting SUMMARY.md prose. Two
things the orchestrator specifically flagged as prior premature-completion risk (STORM-01, VERIFY-02,
both reverted once by commit `f034699`) were re-checked from first principles rather than assumed
fixed because a SUMMARY said so.

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | During a storm the boat visibly steps one square at a time across the full dir1+dir2 push, for **host and solo play** (STORM-01, D-09/D-22) | ✓ VERIFIED | `renderLiveShips()` (`src/ui/board.js:318`) paints ship transforms from live `p.pos`, called from both `windLeg` (`src/ui/flow.js:270`) and `botWindLeg` (`:305`, `:317`) on every square. Root cause and fix are fully documented and evidence-backed in `.planning/debug/resolved/storm-push-not-rendered.md` (headless probes, mutation testing, and a live Chrome DevTools Protocol session that measured 24/24 sampled paint states matching live engine position, plus a revert-proof reproducing the original bug). Wyatt re-ran the Safari playtest against the fixed build and confirmed both his own and a bot's storm push step square by square (VALIDATION.md "Browser Playtest Record", second run PASSED). |
| 1b | The same square-by-square visibility for **multiplayer GUESTS** | ⚠ SCOPE GAP — see Human Verification #1 | Guests render purely from the broadcast event feed; an ordinary storm square emits no event, so guests do not get the per-square animation host/solo now have. This is a real, load-bearing architectural constraint (the determinism corpus forbids adding an event for this), documented honestly in `storm-push-not-rendered.md`'s `not_fixed_by_design` field and in 14-06-SUMMARY.md/VALIDATION.md — but it was never put to Wyatt as an explicit question, and ROADMAP/REQUIREMENTS wording for STORM-01 carries no host/guest qualifier. |
| 2 | Docking/aground checks evaluate at the correct square — the false "the dock held fast" message no longer fires while the boat is still a square away (STORM-01, D-12/D-21/D-22) | ✓ VERIFIED | `Game.mooredReason(p)` (`src/engine/index.js:254-258`) returns the precise cause (`justDocked`/`dock`/`home`); `movedSinceTurnStart()` (`src/ui/util.js`) makes the "gust shoves you" wording conditional on real movement since the turn started, fixing BUG-2 from the debug session. `scripts/bot_storm_narration_test.js` (run this session, part of `npm test`) exercises four concrete scenarios (shoved-onto-dock, parked-on-dock, intervening leg-end event, wrong-seat anchor) plus 3 planted-and-killed mutants — all pass. Wyatt live-confirmed check 3 of the Safari playtest ("an already-parked ship reads 'is still docked…' rather than claiming a shove"). |
| 3 | A bot that puts a hail offer on the table takes no other action that turn — the hail costs the ACTION, not the whole turn, and never double-fires its own narration (AI-01, D-02/D-03/D-04/D-24, CR-01) | ✓ VERIFIED | `botTurn()`'s hail block (`src/ui/flow.js:679-724`) stamps `p.lastOffer` and sets `hailed=true` the moment the offer reaches the table (before the `await ask(...)`), and `if(hailed)return;` (`:724`) unconditionally ends the turn before `chooseAction()` is reached, whether sold, countered, or refused. The code-review Critical finding (CR-01: a duplicate `botBeat()` double-narrating/double-rendering every resolved hail) was independently re-confirmed present in `git log` history and its fix (commit `5f89b39`) independently re-read in the current tree — the redundant inner `botBeat()` call is gone, only the loop's `break;` remains, with an explanatory comment at the fix site. `node scripts/hail_ranking_test.js` (re-run this session) passes 18/18 checks, including purity/idempotency of the pure ranking/pricing helpers. |
| 4 | Hail targeting prefers spare-holders, then whoever it hurts least, with proximity only as a tiebreaker; offers scale on desperation + seller cost, never exceeding purse minus reserve (AI-01, D-06/D-07) | ✓ VERIFIED | `rankHailTargets`/`priceHailOffer` (`src/ui/flow.js:623-644`) implement exactly this precedence; `scripts/hail_ranking_test.js` asserts rule-1 (2-holder before 1-holder), rule-2 (essential-vs-spare ordering), rule-3 (proximity tiebreak only), full-tie seat-index fallback, and the purse-minus-reserve cap — all pass (re-run this session). |
| 5 | The hail stays UI-tier only — the deterministic engine gains no hail concept, and `chooseAction`/`takeTurn` are unaffected (AI-01, D-08/D-25) | ✓ VERIFIED | `grep -qi 'hail' src/engine/index.js` returns no matches. `takeTurn()` (`src/engine/index.js:708-735`) has no hail branch; `chooseAction` is unchanged by this phase's hail work. |
| 6 | The determinism regression harness stays green after all engine-adjacent changes — re-recorded exactly once, behind a full attributed divergence report and a blocking human decision (VERIFY-02, D-15/D-16/D-18/D-21/D-26) | ✓ VERIFIED | Independently re-ran (not trusted from SUMMARY): `node scripts/determinism_baseline.js --verify` → **31/31 PASS**, "SOURCE: unchanged — hashes match and engine source hash matches." `npm test` → all 12 gates, exit 0. `scripts/fixtures/determinism/manifest.json` cross-checked directly: `seedCount:30`, `extraSeeds:[12379]`, `perSeed.length:31`, `coverage.shipwrecked:1`, `capturedAt`/`engineSourceHash` match `docs/DETERMINISM-RERECORD.md`'s claims exactly. `git diff src/engine/index.js` against HEAD is empty (no lingering forced-storm hook). `docs/DETERMINISM-RERECORD.md` §5-6 documents the full three-cause attribution (D-15/D-18/D-21), the "unattributed divergences: none" finding, Wyatt's capture-now decision, the coverage-assertion block on `shipwrecked`, and Wyatt's add-a-seed resolution (seed 12379) — a fully honest, non-softened record including the FAILED first `--capture` attempt. |
| 7 | Storm/hail copy ships only after passing through Wyatt's explicit approval — never auto-generated (STORM-01/AI-01, D-14/D-27) | ✓ VERIFIED | `src/ui/util.js`'s `EVENT_NARRATION.moored`/`.parley` text matches the "Copy Approval Record" in VALIDATION.md verbatim (`"is still docked, so the storm can't run them aground."`, `"they refused."` with the action-cost clause deliberately dropped per Wyatt's direction). No new narration string exists in the codebase that isn't traceable to that record. |
| 8 | The forced-storm test scaffolding (`cfg.storm=1`) does not ship (D-06 Task 3 prohibition) | ✓ VERIFIED | `git status` is clean; `git diff src/engine/index.js` is empty. No `storm=1`/`storm:1` override found in the committed source (`roundCfg` still uses the normal probability). |
| 9 | The three new test scripts are wired into `npm test` as permanent gates, not scripts that rot (14-06) | ✓ VERIFIED | `package.json`'s `"test"` script chains `hail_ranking_test.js`, `storm_moored_reason_test.js`, and `bot_storm_narration_test.js` after the original 9 gates. Re-ran `npm test` this session: exit 0, all gates including these three pass. |
| 10 | The engine change edge cases (off-grid push, zero-distance push) are silent no-ops, not silent bugs (14-01/14-05 backstop truths) | ✓ VERIFIED | `scripts/storm_moored_reason_test.js`/`bot_storm_narration_test.js` (re-run this session) include explicit assertions: "windPush off-grid: no event emitted"/"position unchanged", "windPush(p,d,0): no event emitted"/"position unchanged" — both PASS. |

**Score:** 9/10 truths verified (1 flagged as an unresolved scope question — see Human Verification).

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `scripts/determinism_diff.js` | Full per-seed divergence enumeration + key attribution + pre-storm assertion | ✓ VERIFIED | Exists, exports `diffAllSeeds`, imports from `determinism_baseline.js` rather than reimplementing. Used live to produce the attribution in `DETERMINISM-RERECORD.md` §5. |
| `docs/DETERMINISM-RERECORD.md` | D-16's "document what changed and why" record | ✓ VERIFIED | 436 lines; contains the full causal chain, both capture attempts (failed then succeeded), and the recovery path if the re-record needs undoing. |
| `src/ui/flow.js` (`rankHailTargets`, `priceHailOffer`, `hailWorthIt`, `botWindLeg`) | Pure hail helpers + per-square bot storm leg | ✓ VERIFIED | All four present, exported, wired into `botTurn`. |
| `scripts/hail_ranking_test.js` | DOM-free unit coverage for hail ranking/pricing/eligibility | ✓ VERIFIED | 233 lines, 18 assertions, all pass. |
| `src/engine/index.js` (`mooredReason`, two-gust `takeTurn`, `windNow2`) | Cause-tagged moored events, aligned simulator storm | ✓ VERIFIED | Confirmed by direct read (lines 254-305, 708-735, 775) — matches every must-have in 14-01/14-03's frontmatter exactly. |
| `scripts/storm_moored_reason_test.js` | Coverage for the three moored causes + berth-protection regression guard | ✓ VERIFIED | 276 lines, all pass (re-run this session). |
| `scripts/fixtures/determinism/manifest.json` | The re-recorded 31-seed baseline | ✓ VERIFIED | Cross-checked field-by-field against DETERMINISM-RERECORD.md's claims — all match. |
| `src/ui/board.js` (`renderLiveShips`) | Live-position ship painter | ✓ VERIFIED | Present, called from both storm push paths; `render()`'s original snapshot-based body is untouched (byte-identical, per the file's own header comment, preserving the v1.0 Safari-crash fix). |
| `src/ui/util.js` (`STORM_STEP_MS`, `BOT_STORM_STEP_MS`, `SHIP_GLIDE_MS`, `botMsgHoldMs`) | Storm pacing constants, tuned above the CSS glide | ✓ VERIFIED | `SHIP_GLIDE_MS=350`, `STORM_STEP_MS=420`, `BOT_STORM_STEP_MS=380` — both above the glide, as the debug session's pacing-measurement evidence required. |
| `scripts/bot_storm_narration_test.js` | Per-square/two-square equivalence + BUG-2 regression guard | ✓ VERIFIED | 404 lines; re-run this session, all pass including the 4-scenario BUG-2 guard. |
| `package.json` | New test scripts wired into the gate chain | ✓ VERIFIED | Confirmed by direct read of the `"test"` script string. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `botTurn` hail block | `rankHailTargets`/`priceHailOffer`/`hailWorthIt` | direct calls | ✓ WIRED | Confirmed at `src/ui/flow.js:690-694`. |
| `botTurn` hail block | `chooseAction` (shared engine method) | `if(hailed)return;` gate before reaching it | ✓ WIRED | Confirmed at `:724-725` — the return happens strictly before `g.chooseAction(p)` is called. |
| `windLeg`/`botWindLeg` | `renderLiveShips` | per-square call replacing `liveRender()` | ✓ WIRED | Confirmed at `src/ui/flow.js:270, 305, 317`. |
| `EVENT_NARRATION.moored` | `movedSinceTurnStart` | conditional wording selection | ✓ WIRED | Confirmed at `src/ui/util.js:292-`. |
| `play()`/`takeTurn()` | `windPush` (both gusts) | two calls sharing one `dodgedOnce` | ✓ WIRED | Confirmed at `src/engine/index.js:719-720`. |
| `docs/DETERMINISM-RERECORD.md` | `scripts/fixtures/determinism/manifest.json` | named `capturedAt`/`engineSourceHash` | ✓ WIRED | Field values match exactly (re-verified this session, not just quoted from the doc). |
| `package.json` test script | the three new test scripts | appended to the `&&` chain | ✓ WIRED | Confirmed by direct read; all three execute and pass on `npm test`. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| `render()` (`src/ui/board.js`) | ship position | `appState.game.events[evIdx].state` (snapshot) | Correct for event-bearing frames; stale for event-less storm squares (the original bug) | ⚠ Known limitation, superseded by `renderLiveShips()` for the storm-push path |
| `renderLiveShips()` (`src/ui/board.js:318`) | ship position | `appState.game.players[i].pos` (live) | Yes — traced and confirmed via a live Chrome DevTools session (24/24 sampled paint states matched live engine position) | ✓ FLOWING |
| `EVENT_NARRATION.moored` | `reason` field | `Game.mooredReason(p)` at the moment the `moored` event fires | Yes — three real causes, verified via `storm_moored_reason_test.js` | ✓ FLOWING |
| guest board render | ship position | broadcast event stream only, no live-position channel | No — guests never receive the intermediate-square data at all (see Truth #1b) | ✗ DISCONNECTED (by design, unconfirmed with Wyatt) |

### Behavioral Spot-Checks (run once this session, not per-truth)

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full 12-gate suite passes on the current tree | `npm test` | exit 0, 197 `PASS` lines, 0 `FAIL` | ✓ PASS |
| Determinism harness is green against the re-recorded corpus | `node scripts/determinism_baseline.js --verify` | 31/31 `PASS`, "SOURCE: unchanged" | ✓ PASS |
| Manifest fields match the documented re-record claims | `node -e` read of `manifest.json` | `seedCount:30, extraSeeds:[12379], perSeed.length:31, coverage.shipwrecked:1` — all match `DETERMINISM-RERECORD.md` | ✓ PASS |
| No forced-storm scaffolding shipped | `git status`, `git diff src/engine/index.js` | clean tree, empty diff | ✓ PASS |
| CR-01 fix is actually in the tree, not just claimed by SUMMARY | direct read of `src/ui/flow.js:719-724` + `git log`/`git show 5f89b39` | redundant `botBeat()` removed, fix commit present with matching diff | ✓ PASS |

### Probe Execution

Not applicable — this project has no `scripts/*/tests/probe-*.sh` convention; its gate scripts (run above) serve the equivalent role and were exercised directly.

### Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|--------------|-------------|-------------|--------|----------|
| STORM-01 | 14-01, 14-03, 14-05, 14-06 | Storm push moves one square at a time, correct-square docking checks | ✓ SATISFIED (host/solo) — see Human Verification #1 for the guest-scope caveat | Truths #1, #1b, #2 above |
| AI-01 | 14-02, 14-06 | Bot hail/action turn follows a decided, visible rule | ✓ SATISFIED | Truths #3, #4, #5 above |
| VERIFY-02 | 14-01, 14-03, 14-04, 14-06 | Determinism harness stays green after engine-adjacent changes | ✓ SATISFIED | Truth #6 above |

No orphaned requirements — REQUIREMENTS.md lines 20, 24, and 57 map exactly to the three requirement IDs declared across all six plans' frontmatter (`grep` cross-check performed); all three are marked "Complete" in REQUIREMENTS.md's phase-status table (lines 116-135), consistent with the evidence above modulo the guest-scope caveat.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found in any phase-14-modified file | — | Clean |
| `src/engine/index.js:777` vs `src/orchestrator.js:684/707` | — | `Game.play()`'s own `newround` event omits `dir2`/`streak` that `EVENT_NARRATION.newround` reads unconditionally (14-REVIEW.md WR-01) | WARNING | Currently dormant — independently confirmed that neither `determinism_baseline.js` nor `dlog_replay_test.js` ever narrates events (`play()` is called for hashing/replay only); live play always uses the orchestrator's own fully-populated `ev()` call. Real drift, no current user-facing symptom. |
| `scripts/determinism_diff.js:62-139` | — | Diffs by raw line index, which stops being like-for-like once event counts diverge across the two sides (14-REVIEW.md WR-02) | WARNING | Did not affect any decision actually made in this phase (capture-now/add-a-seed relied on `--ignore-keys` and the coverage assertion, not the raw histograms) — flagged by the code reviewer as a risk for a FUTURE re-record, not this one. |
| `src/ui/util.js:534-541` vs `569-577` | — | `botMsgHoldMs()` duplicates `msgHoldMs()`'s formula body verbatim (14-REVIEW.md WR-03) | WARNING | Code-quality only; no functional impact observed. |
| `src/ui/flow.js:719-724` | — | CR-01 (duplicate `botBeat()` double-narrating every resolved hail) | Was CRITICAL, now FIXED | Independently re-verified fixed in the current tree (commit `5f89b39`); not a live gap. |

### Human Verification Required

1. **Multiplayer-guest storm-push visibility scope decision** — see frontmatter `human_verification` entry #1. Present Wyatt the honest tradeoff (host/solo get the full per-square animation; guests do not, and cannot without reopening the frozen event-stream contract the determinism corpus depends on) and get an explicit answer on whether that is acceptable as shipped, or needs a backlog item.
2. **ROADMAP.md wording drift (30/30 vs 31/31)** — see frontmatter `human_verification` entry #2. Low-stakes cosmetic fix or explicit "leave it" decision.

### Gaps Summary

No must-have is missing, stubbed, unwired, or functionally broken. Every claim in the six plans'
`must_haves` blocks that could be checked against the codebase and test suite directly was checked
directly in this session (not inferred from SUMMARY.md prose), including re-running the full 12-gate
`npm test`, the 31-seed determinism harness, and the specific new test scripts this phase added. The
previously-reverted premature-completion risks (STORM-01, VERIFY-02) both now check out on
independent re-verification, and the code-review Critical finding (CR-01) is confirmed fixed in the
current tree, not merely claimed.

The phase is **not blocked** by any of the above — it is held at `human_needed` for a single reason:
the multiplayer-guest storm-visibility limitation is a real, working-as-designed architectural
boundary that was never explicitly put to Wyatt as a scope question, even though ROADMAP.md and
REQUIREMENTS.md's STORM-01 wording carries no host/guest qualifier. This is the kind of gap this
verification role exists to surface rather than silently wave through or silently fail — the
underlying engineering is sound and honestly documented; only the sign-off is missing.

---

_Verified: 2026-07-27T01:10:20Z_
_Verifier: Claude (gsd-verifier)_
