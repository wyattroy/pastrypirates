---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: milestone
current_phase: 18
current_plan: 7
status: complete
stopped_at: "Phase 18 COMPLETE AND CLOSED, NOTHING OPEN. Merged to main and live; all 12 Safari playtest items passed; 18-07 closed retroactively 2026-08-02 with the copy ledger, VERIFICATION.md and SUMMARY written. The credits ye/you question was resolved by Wyatt the same day — 'you' is deliberate because the credits page is not in the game world, so it is not written in pirate speak. That voice rule is now recorded in .claude/CLAUDE.md and the copy gate."
last_updated: "2026-08-02T00:00:00.000Z"
last_activity: 2026-08-02
last_activity_desc: "CLOSED. 18-07 (the phase-closing copy-ledger plan) never ran at ship time — the phase shipped on Wyatt's Safari playtest instead. Closed retroactively 2026-08-02: wrote 18-COPY-CHANGES.md (8 rows), 18-VERIFICATION.md (status passed) and 18-07-SUMMARY.md; re-ran the full verification (npm test 21/21 green incl. determinism --verify; src/engine/index.js untouched since Phase 14; exactly one FIX-09 chip treatment in the tree). The retroactive audit found two record-level defects, both now fixed: (1) an UNLOGGED copy change — the credits clause shipped 'you hear' while the gate recorded 'ye hear', changed in playtest commit 10b3bbc, now logged and flagged for Wyatt; (2) a STALE gate row — FIX-09 still claimed both chip treatments were live and undecided, six commits after Wyatt picked Treatment B and the loser was deleted in 2438aa3. Lesson worth carrying: per-plan copy logging caught six plans' changes in real time, but could not catch a change made AFTER the plans finished during the playtest batch — which is the one thing a phase-closing pass is uniquely for."
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 7
  completed_plans: 7
  percent: 100
workstream: prompts-polish
created: 2026-07-31
---

# Project State

## Current Position

**Status:** Complete — Phase 18 shipped, live, and formally closed 2026-08-02
**Current Phase:** 18 (done; this workstream owns no further phases in v1.3)
**Last Activity:** 2026-08-01 — 18-05 executed (FIX-03/D-02, the shot clock arms at button-reveal, not prompt-render)
**Last Activity Description:** 18-05 executed — `src/state/index.js` gained 4 new `appState` fields (`clockPendingSeat`/`clockPendingArm`/`clockPendingLocal`/`clockPendingText`); `ask()` (`src/ui/util.js`) now publishes a one-shot continuation instead of arming the shot clock directly, with a synchronous no-panel belt for prompts that never render (pure flip decisions) and `withShotClock()` chained onto the SAME continuation's promise so the 30s auto-skip resolver is provably installed only after the real arm; `panel()` (`src/ui/panel.js`) claims and fires that continuation from 18-01's existing reveal-completion gate for a local decision, and from a new `estimateRevealMs(actorPromptText)`-sized `setTimeout` for a remote one (erring long, never short); `setClockUI()` gained a frozen full-window (20s) pending display for the reveal window, host and guest alike, reusing existing copy verbatim. Hard constraint 1 (the `withShotClock` ordering trap) proven with a recorded negative experiment, not just asserted. `npm test` 23/23; no browser verification possible this session (documented, flagged for 18-07).

## Progress

**Phases Complete:** 1 of 1
**Plans Complete:** 7 of 7
**Current Plan:** none — 18-07 was the last, closed retroactively 2026-08-02

## Accumulated Context

### Decisions

- 18-01: `resizePanel()` gained an optional `minHeight` parameter defaulting to a new module-scoped `activeGhostFloor` — the ghost's own measured height, shared by the swap path, the ghost's own `drop()`, and the resize/orientationchange listener with zero call-site changes at 2 of 3 sites.
- 18-01: `panelRevealDone()` is now exported from `src/ui/panel.js` — the seam 18-05 chains `armClock` onto.
- 18-01: the `#actionPanel.pendingReveal` gate is per-render, guarded by a monotonic `panelSeq`/`dataset.revealSeq` stamp against a late-resolving stale `typewriterReveal()` promise unhiding a newer prompt's buttons.
- 18-02: Task 2's `src/ui/board.js` coordination checkpoint was pre-resolved by the coordinator (option-a — this workstream applies the line itself) before execution started; not a stop-and-ask.
- 18-02: `RECIPE_BOOK` is now exported from `src/ui/recipe.js` (was module-private) — needed so the test harness and the narration audit tool can enumerate all 21 entries by title text, not by index.
- 18-02: `recipeArticle` had to be added to `art-review/narration-core.js`'s `CTX_BASE` eval scope — the audit tool live-evaluates each shipped copy site's raw source, and any new identifier a raw expression references must be registered there or the site's card fails to render (same failure class STATE.md's own `20260729-playtest-bug-fixes` entry documents).
- 18-03: `EVENT_NARRATION.windmove` is now caps-only (`{caps:[[e.p,"🌬️ drifts"]]}`, no `txt`) — `describeFor()` returns `null` for it on every viewer, exactly like `end`/`turn`. Confirmed (not assumed) every `appState.logLines` consumer already tolerates a `null` entry.
- 18-03: `art-review/narration-table-baseline.json`'s re-pin convention (a `_provenance` note per change, `table:<key>` cards updated via `narration-core.js`'s own `tableCards()` rather than hand-transcribed) is the pattern any future plan touching `EVENT_NARRATION` text or markup must follow, or `narration_audit_check.js` assertion 7 will fail.
- 18-03: a source reformat that changes a ternary's on-line shape can break `scripts/ui_contract_check.js`'s D-29 pirate-register identifier allowlist if the allowlist is anchored to the old shape (it is anchored on content, deliberately, so this "goes loud" by design) — any future reformat of `src/ui/util.js`'s `sidebet` builder must re-check `REGISTER_IDENT_FRAGMENTS`.
- 18-03: `checkCoinParentheticalNobrk` (new, `scripts/ui_contract_check.js`) is now a standing gate on every `npm test` run — a future narration site with an unwrapped trailing `(±N🌕)` will only be caught if it matches one of the gate's 10 anchors; a genuinely NEW site (an 11th) will not be caught automatically and should add its own anchor.
- 18-04: this plan deliberately DEVIATED from RESEARCH's `isBribe = spoilIng==null && spoilChosen===true` sketch — that formula flips EVERY field-less event to the give-up framing, which is a text change to already-shipped history. Used a three-state `hasChoice` fork instead: when the event carries no `spoilChosen` key at all (every engine/replay/simulator/fixture event), fall back to the pre-existing coin-count proxy byte-for-byte.
- 18-04: `isBribe`'s `hasChoice` fork needed the `spoilN>=5` amount gate even when `spoilChosen:true` is present — a fabricated sub-5 + `spoilChosen:true` event is not a shape the real game produces (canCoins&&hasIng only fires when `lose.coins>=5`), but the plan's own behavior spec required "a 2-coin spoil renders the all-they-have framing regardless of spoilChosen," so the amount gate stays load-bearing in both forks, not just the no-choice fallback.
- 18-04: `spoilChosen` is orchestrator-tier only (`src/orchestrator.js`) — deliberately never added to `src/engine/index.js`'s parallel simulator-only spoil branch (milestone constraint 1). That branch's same flaw is left for the gated determinism re-record batch (`docs/DETERMINISM-RERECORD-NEXT.md`) when the door is opened anyway.
- 18-05: deviated from the plan's own action-text description of the arm continuation — the plan says the closure should call `armClock(seat)` directly, but that would leave TWO mentions of that name in `src/ui/util.js`, contradicting this task's own `grep -c 'armClock' src/ui/util.js === 1` acceptance criterion. The closure instead only marks itself claimed and returns the real seat; `armClock(seat)` is called exclusively from `src/ui/panel.js` (which the plan already required to import it) on both the local and remote defer paths. Functionally identical outcome, documented in `18-05-SUMMARY.md`'s Deviations section.
- 18-05: `appState.clockPendingSeat` (the frozen-display trigger) is derived from `currentTurnSeat()`, a display-only approximation — the ACTUAL arm instead uses the real seat `ask()` captured by closure, since a battle sub-decision (side bet, defender flee) can ask a seat that isn't the current turn's owner. Using `currentTurnSeat()` for the real arm would have risked arming the wrong seat's clock.
- 18-05: known cosmetic gap carried to 18-07 — the HOST's own screen (and other spectators) does not show the new frozen display during a REMOTE seat's reveal window, because `clockPendingSeat` is only set on whichever browser renders the real button row (the deciding guest's own screen, for a remote decision). Never shortens anyone's actual 30s window; logged as `.planning/WINDOWS.md` entry 8.

### Open Items Carried Forward

- FIX-16 and FIX-10's driven-browser acceptance criteria (ghost first-frame rect / gridTemplateRows floor sweep; `.apBtn` containment at 320/375/390 + rotation round-trip) were NOT run this session — no browser-automation tool was available to the executor. Logged to `.planning/WINDOWS.md` (entries 3, 4; both `open`).
- The narrow-window Safari criterion (ROADMAP success criterion 1) remains untouched, as designed — gated to plan 18-07.
- `.planning/WINDOWS.md` entry 5 (a pre-existing, unrelated `npm test` failure this plan found — a stale path from the v1.2 archive) was fixed directly by the coordinator outside this plan's scope (commit `a637266`). `npm test` is 23/23, exit 0.
- FIX-08's plan-level `<human-check>` (driving a solo game to end of voyage and reading the rendered `.victoryText` for both a plural-title and a singular-title winner) was declared OPTIONAL for 18-02 by this session's explicit instructions and was not performed. See `18-02-SUMMARY.md` coverage D4 for what automated verification substituted for it.
- **Shared-worktree concurrency hazard (18-02):** this plan ran on the non-isolated main working tree (worktree-base-check reported `shouldDegrade: true`), and a concurrently-running coordinator session's own `git commit` swept this plan's already-staged Task 3 files (`src/ui/board.js`, `art-review/narration-core.js`, `art-review/narration-inventory.json`, the copy-shipped-vs-approved-gate.md ledger entry) into its own unrelated commit `ff27b12`. Content verified correct and complete at that commit; only the commit-message/authorship attribution is misleading. See `18-02-SUMMARY.md`'s "Issues Encountered" section for the full trace. This session (18-03) ran sequentially with no concurrent coordinator process and hit no equivalent hazard.
- **18-03's award-stat visual check was NOT run.** The plan's `<human-check>` (a driven 320px-wide Chrome session confirming no award card splits and no narration line orphans a parenthetical) and the `getClientRects().length === 1` acceptance criterion for `.awardStat b` could not be performed — this session's `<environment>` block explicitly stated the MCP browser tab was measured unusable (0 rAF frames in 3s, 10x-clamped timers, viewport pinned at 950px) and instructed against attempting it. The CSS fix (`white-space: nowrap` on `.awardStat b`) is correct by inspection. Carry this into 18-07's phase-gate checkpoint alongside 18-01's already-logged FIX-16/FIX-10 driven-browser gaps.
- **18-05's driven-browser checks were NOT run** — same environment restriction (browser verification explicitly disallowed this session, per `docs/DRIVING-THE-GAME.md` §8b). Both tasks' `<human-check>` items (sampling `shotClockSeat`/`shotClockForce` and `#shotClockNum`/`#scLabel` across the reveal window) are unverified by execution; substituted with a Node harness against the real, non-DOM `util.js` functions (proves the ordering mechanism, including a recorded negative experiment for the `withShotClock` trap) plus the full static/contract-check gate suite. Logged to `.planning/WINDOWS.md` entries 6-7 (unrun-verify) and 8 (the host/spectator display-gap deviation). All three carry into 18-07's checkpoint.

## Session Continuity

**Stopped At:** 18-05 complete (FIX-03/D-02 — shot clock arms at button-reveal, frozen display during the reveal). Next: 18-06, wave 5 (button restyle, captain circles removed, FIX-09 chip treatment).
**Resume File:** .planning/workstreams/prompts-polish/phases/18-prompts-polish/18-05-SUMMARY.md
