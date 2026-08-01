---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: milestone
current_phase: 18
current_plan: 4
status: executing
stopped_at: "18-03 complete (FIX-04/FIX-21 — storm-drift line removal, orphan-chunk wrapping, permanent anchored gate). Next: 18-04, wave 3 (FIX-07 — empty hold is not a bribe)."
last_updated: "2026-08-01T06:10:00.000Z"
last_activity: 2026-08-01
last_activity_desc: 18-03 executed — windmove reduced to caps-only (FIX-04), 7 signed-coin narration sites + award CSS nobrk-wrapped, checkCoinParentheticalNobrk permanent gate added (FIX-21)
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 7
  completed_plans: 3
  percent: 43
workstream: prompts-polish
created: 2026-07-31
---

# Project State

## Current Position

**Status:** Executing Phase 18
**Current Phase:** 18
**Last Activity:** 2026-08-01 — 18-03 executed (FIX-04/FIX-21, storm-drift removal + orphan-chunk wrapping)
**Last Activity Description:** 18-03 executed — `EVENT_NARRATION.windmove` reduced to its `caps`-only capsule form (FIX-04); 7 signed-coin narration sites plus `.awardStat b` CSS nowrap-wrapped, and a permanent anchored `checkCoinParentheticalNobrk` gate added to `ui_contract_check.js` (FIX-21)

## Progress

**Phases Complete:** 0
**Plans Complete:** 3 of 7
**Current Plan:** 4 (18-04, wave 3 — an empty hold is not a bribe, FIX-07) — blocked on wave 2 completion, which this plan closes out

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

### Open Items Carried Forward

- FIX-16 and FIX-10's driven-browser acceptance criteria (ghost first-frame rect / gridTemplateRows floor sweep; `.apBtn` containment at 320/375/390 + rotation round-trip) were NOT run this session — no browser-automation tool was available to the executor. Logged to `.planning/WINDOWS.md` (entries 3, 4; both `open`).
- The narrow-window Safari criterion (ROADMAP success criterion 1) remains untouched, as designed — gated to plan 18-07.
- `.planning/WINDOWS.md` entry 5 (a pre-existing, unrelated `npm test` failure this plan found — a stale path from the v1.2 archive) was fixed directly by the coordinator outside this plan's scope (commit `a637266`). `npm test` is 23/23, exit 0.
- FIX-08's plan-level `<human-check>` (driving a solo game to end of voyage and reading the rendered `.victoryText` for both a plural-title and a singular-title winner) was declared OPTIONAL for 18-02 by this session's explicit instructions and was not performed. See `18-02-SUMMARY.md` coverage D4 for what automated verification substituted for it.
- **Shared-worktree concurrency hazard (18-02):** this plan ran on the non-isolated main working tree (worktree-base-check reported `shouldDegrade: true`), and a concurrently-running coordinator session's own `git commit` swept this plan's already-staged Task 3 files (`src/ui/board.js`, `art-review/narration-core.js`, `art-review/narration-inventory.json`, the copy-shipped-vs-approved-gate.md ledger entry) into its own unrelated commit `ff27b12`. Content verified correct and complete at that commit; only the commit-message/authorship attribution is misleading. See `18-02-SUMMARY.md`'s "Issues Encountered" section for the full trace. This session (18-03) ran sequentially with no concurrent coordinator process and hit no equivalent hazard.
- **18-03's award-stat visual check was NOT run.** The plan's `<human-check>` (a driven 320px-wide Chrome session confirming no award card splits and no narration line orphans a parenthetical) and the `getClientRects().length === 1` acceptance criterion for `.awardStat b` could not be performed — this session's `<environment>` block explicitly stated the MCP browser tab was measured unusable (0 rAF frames in 3s, 10x-clamped timers, viewport pinned at 950px) and instructed against attempting it. The CSS fix (`white-space: nowrap` on `.awardStat b`) is correct by inspection. Carry this into 18-07's phase-gate checkpoint alongside 18-01's already-logged FIX-16/FIX-10 driven-browser gaps.

## Session Continuity

**Stopped At:** 18-03 complete (FIX-04/FIX-21). Next: 18-04, wave 3 (FIX-07 — empty hold is not a bribe).
**Resume File:** .planning/workstreams/prompts-polish/phases/18-prompts-polish/18-03-SUMMARY.md
