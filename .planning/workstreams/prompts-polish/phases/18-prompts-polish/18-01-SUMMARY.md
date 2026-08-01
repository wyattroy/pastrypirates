---
phase: 18-prompts-polish
plan: 01
subsystem: ui
tags: [narration-panel, layout-measurement, safari, css, vanilla-js]

# Dependency graph
requires: []
provides:
  - "#actionPanel.pendingReveal CSS rule + panel()-driven gate/unhide logic (FIX-03/D-01)"
  - "panelRevealDone() export — the seam 18-05 chains armClock onto"
  - "activeGhostFloor module state + pinned ghost top/left/width (FIX-16)"
  - "resizePanel(hasContent, minHeight = activeGhostFloor) — shared height floor"
  - "src/main.js resize/orientationchange listeners now call ui.resizePanel() (FIX-10)"
affects: [18-05, 18-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reveal-gate: a CSS class toggled from inside the single render chokepoint (panel()), off the existing _revealDone promise, guarded by a monotonic seq stamp against stale-promise races"
    - "Shared height floor via a default-parameter (minHeight = activeGhostFloor) so 3 call sites (swap, ghost drop, resize/orientationchange) agree on one value with zero call-site changes"

key-files:
  created: []
  modified:
    - index.html (CSS: .pendingReveal rule; .apMsg.fadeOut loses its inset:0 shorthand)
    - src/ui/panel.js (panelSeq, gate/unhide in panel(), panelRevealDone(), ghostRect capture + pinned position/width, activeGhostFloor, resizePanel(hasContent, minHeight))
    - src/main.js (resize rAF callback + orientationchange handler both call ui.resizePanel())

key-decisions:
  - "D-01 honored: buttons wait for the typewriter; reduced-motion shows them immediately. Not re-coupled."
  - "Ghost position/width snapshot taken BEFORE inner.innerHTML wipes the outgoing element, from offsetTop/offsetLeft/offsetWidth/offsetHeight relative to the already-position:relative #apGridInner."
  - "activeGhostFloor cleared as the FIRST statement inside drop(), before node removal, per plan; a dropped-guard added so drop()'s two possible triggers (animationend + the derived setTimeout belt) can never run a second reflow-probe."
  - "orientationchange deliberately NOT routed through the resize rAF flag — it fires once, not in a burst, and sharing the flag would let a coincident resize swallow it."

patterns-established:
  - "Shared floor via default parameter: resizePanel(hasContent, minHeight = activeGhostFloor) lets 3 independent call sites (message swap, ghost drop, resize/orientationchange) all respect one live value with no call-site plumbing."

requirements-completed: [FIX-03, FIX-10, FIX-16]

coverage:
  - id: D1
    description: "Action-prompt buttons stay invisible (visibility:hidden, still occupying layout) until that prompt's typewriter reveal resolves; visible immediately under prefers-reduced-motion; battle prompts (.btlBtn) untouched."
    requirement: "FIX-03"
    verification:
      - kind: automated_ui
        ref: "coordinator-driven Chrome session (MutationObserver on #actionPanel, both normal and prefers-reduced-motion-patched paths) — see Deviations section for the full trace"
        status: pass
      - kind: other
        ref: "grep -c 'pendingReveal' index.html == 1 (visibility:hidden verbatim); grep -c 'panelRevealDone' src/ui/panel.js >= 1; grep -c 'export async function panel' src/ui/panel.js == 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "A fading narration line renders at the position/width it occupied while live (no jump-left), and the panel row never shrinks below the outgoing ghost's height while that ghost is still on screen."
    requirement: "FIX-16"
    verification:
      - kind: other
        ref: "grep -c 'activeGhostFloor' src/ui/panel.js >= 3 (5 found); grep -n 'export function resizePanel' contains minHeight=activeGhostFloor; grep -c 'ghostRect' >= 5 (5 found); grep -c 'max-content' src/ui/panel.js == 1 (measure-once intact)"
        status: pass
    human_judgment: true
    rationale: "The plan's own acceptance criteria for this deliverable require a driven-Chrome first-frame getBoundingClientRect() comparison and a gridTemplateRows floor sample sweep — neither was performed this session (no browser-automation tool available to this executor; the coordinator's driven check this session covered Task 1/FIX-03 only). Static/structural evidence (grep counts, code read) supports the implementation but the visual/positional claim itself is unverified by a human or a driven session."
  - id: D3
    description: "A window resize or orientation change with a prompt on screen re-derives the panel row height from current content; the action button is never clipped at 320/375/390 and stays uncapped across a rotation round-trip."
    requirement: "FIX-10"
    verification:
      - kind: other
        ref: "grep -c 'resizePanel' src/main.js == 2; grep -c 'ResizeObserver\\|MutationObserver' src/main.js src/ui/panel.js == 0; grep -c 'syncBoardRAF' src/main.js == 3 (byte-identical to pre-task); npm test's first 21 gates pass including determinism_baseline.js --verify"
        status: pass
    human_judgment: true
    rationale: "The plan's acceptance criteria require driven-Chrome measurements of .apBtn's getBoundingClientRect() against #apGridInner at 320x568/375x667/390x844 plus a rotation round-trip. No browser-automation tool was available to this executor this session; this is a genuine open verification gap, not a pass being downgraded out of caution."

# Metrics
duration: ~30min (active coding ~10min across 3 task commits, plus a tracer-gate pause awaiting coordinator verification)
completed: 2026-08-01
status: complete
---

# Phase 18 Plan 01: The Interlocking Panel Group Summary

**Buttons now wait for the typewriter (FIX-03/D-01), a replaced narration line fades exactly where it sat instead of jumping left and losing its wrap width (FIX-16), and a resize or rotation re-measures the panel instead of leaving it pinned at a stale height (FIX-10) — all three landed together in `panel()`/`resizePanel()` with the Safari measure-once fix (BUG-01) provably intact (`grep -c 'max-content' src/ui/panel.js` == 1).**

## Performance

- **Duration:** ~30 min (3 task commits over ~10 min of active editing; a pause between Task 1 and Task 2 while the coordinator drove the tracer-gate Chrome check)
- **Tasks:** 3 of 3
- **Files modified:** 3 (`index.html`, `src/ui/panel.js`, `src/main.js`)

## Accomplishments

- **FIX-03:** `#actionPanel.pendingReveal` hides `.apBtns`/`.apBack` via `visibility:hidden` (never `display:none`, so `resizePanel()`'s measurement is unaffected either way). `panel()` toggles it off a `.then()` on the same `_revealDone` promise `flash()` already awaits, guarded by a `panelSeq`/`dataset.revealSeq` stamp so a late-resolving interrupted earlier reveal can never unhide a newer prompt's still-hidden buttons. Under `prefers-reduced-motion` the class is never applied. Battle prompts are untouched (their HTML has no `.apMsg`). `panelRevealDone()` is exported for 18-05.
- **FIX-16:** the outgoing ghost's `top`/`left`/`width` are captured from `offsetTop`/`offsetLeft`/`offsetWidth`/`offsetHeight` while it is still live in flow, then applied per-instance once it goes `position:absolute` — the CSS `inset: 0` shorthand that caused the jump-left and the wrap-width instability is gone. `resizePanel()` gains an optional `minHeight` parameter defaulting to a new module-scoped `activeGhostFloor`, set to the ghost's own height when created and cleared as the first statement inside `drop()` before the node is removed — so the panel row is held at the taller of the ghost/incoming heights for as long as the ghost is on screen.
- **FIX-10:** `src/main.js`'s resize (rAF-debounced) and orientationchange listeners both now also call `ui.resizePanel(!!inner.innerHTML)` after `ui.syncBoardSizing()`. Neither passes `minHeight` explicitly, so both inherit `activeGhostFloor` — a rotation landing mid-fade can't re-clip a still-fading ghost through this second door.
- The single `max-content` reflow-probe site in `src/ui/panel.js` is unchanged in count (exactly 1) across all three tasks — BUG-01's measure-once Safari fix survives.

## Task Commits

1. **Task 1: End-to-end reveal gate** - `ecd549f` (feat) — this was a `type="tracer"` task; per the executor's tracer-feedback-gate rule (this session running with `workflow.auto_advance=false`), execution paused here and returned a checkpoint. The coordinator drove the Chrome verification personally (evidence below) and authorized continuing.
2. **Task 2: Ghost fades where it sat, height floor** - `738d6b0` (feat)
3. **Task 3: Re-measure on resize/orientationchange** - `3553701` (feat)
4. **Fix: keep `syncBoardRAF` grep count byte-identical** - `f5fe1d8` (fix) — a comment added in Task 3's commit incidentally added a 4th grep hit for `syncBoardRAF`, breaking that task's own acceptance criterion (count must match the pre-task baseline of 3, proving the debounce flag is reused not duplicated). Reworded the comment; count restored to 3.

**Plan metadata:** (this commit)

## Files Created/Modified

- `index.html` — new `#actionPanel.pendingReveal` CSS rule; `.apMsg.fadeOut` loses its `inset: 0` shorthand (the two changes together are FIX-03's gate and FIX-16's positioning fix)
- `src/ui/panel.js` — `panelSeq`, `panel()`'s gate/unhide logic, `panelRevealDone()` export, `ghostRect` snapshot + pinned `top`/`left`/`width`, `activeGhostFloor` module state, `resizePanel(hasContent, minHeight = activeGhostFloor)`
- `src/main.js` — resize rAF callback and orientationchange handler both now call `ui.resizePanel(!!inner.innerHTML)`

## Decisions Made

- Kept the existing `resizePanel(!!html)` call site inside `panel()` untouched — it now picks up `activeGhostFloor` from the default parameter, no call-site edit needed.
- `drop()` gained a `dropped` boolean guard (not explicitly spelled out as a variable name in the plan, but required by its "add a boolean guard" instruction) so its two triggers (`animationend` and the derived `setTimeout` belt) can fire in either order without ever running a second `resizePanel()` probe.
- None of these decisions required deviating from the plan's binding constraints (D-01, measure-once, no engine touch, no `board.js` touch).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug, self-caught] `syncBoardRAF` grep-count acceptance criterion broken by my own comment**
- **Found during:** Task 3 (immediately after committing, while running the acceptance-criteria greps)
- **Issue:** A comment I added referenced `` `syncBoardRAF` `` by name in backticks, which added a 4th match for the literal string — but the task's own acceptance criterion requires the count to stay at the pre-task baseline of 3 (proving the debounce flag is reused, not duplicated).
- **Fix:** Reworded the comment to describe the mechanism ("the rAF debounce flag above") without repeating the identifier.
- **Files modified:** `src/main.js`
- **Verification:** `grep -c 'syncBoardRAF' src/main.js` → `3` (matches pre-task baseline)
- **Committed in:** `f5fe1d8`

**2. [Rule 1 - Bug, self-caught] My own explanatory comments broke Task 2's `max-content`==1 and Task 3's `resizePanel`==2 acceptance criteria**
- **Found during:** Task 2 and Task 3, immediately after each commit-adjacent grep check
- **Issue:** Comments explaining the reflow-probe mechanism and the resize-listener change literally repeated the strings `max-content` and `resizePanel`, pushing those grep counts to 3 and 4 respectively where the plan requires exactly 1 and 2 (proving there is only one probe site / one call site each, per the measure-once contract).
- **Fix:** Reworded the comments to describe the same ideas ("reflow-probe", "the panel-height helper") without repeating the literal identifiers, before committing.
- **Files modified:** `src/ui/panel.js`, `src/main.js`
- **Verification:** `grep -c 'max-content' src/ui/panel.js` → `1`; `grep -c 'resizePanel' src/main.js` → `2` — both confirmed before the commits landed, so no follow-up fix commit was needed for these two (unlike the `syncBoardRAF` one, which was caught after committing).

---

**Total deviations:** 1 auto-fixed after-the-fact (Rule 1, self-caught grep-count regression), plus 2 caught and corrected before committing (not separately logged as deviations since no bad commit ever landed).
**Impact on plan:** All three are executor self-corrections to keep the plan's own literal acceptance criteria true. No scope creep, no behavior change beyond what the plan specified.

## Issues Encountered

**Worktree directory was deleted out from under this session mid-execution, by a process outside this agent's control.** Between the SUMMARY.md self-check append and the subsequent STATE.md edit, the entire worktree directory (`.claude/worktrees/claude-rc-44dff6`) disappeared — `git worktree list` no longer showed it. The 4 task commits survived (they live in the shared `.git` object store on branch `claude/gsd-plan-phase-18-bfdc7b`), but every uncommitted change — this SUMMARY.md's first draft, 3 `.planning/WINDOWS.md` ledger entries, and the not-yet-attempted workstream `STATE.md` edit — was lost with the directory. Recovered by running `git worktree add` for the same branch and redoing the lost work (this SUMMARY.md, the WINDOWS.md entries, and the STATE.md update), committing immediately after each write this time rather than batching several edits before committing.

**Pre-existing, out-of-scope `npm test` failure — found by this plan, fixed by the coordinator outside it.** The full `npm test` chain's final gate, `scripts/narration_audit_check.js` (assertion 10, "live render"), was failing with `ENOENT: .planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json`. Confirmed unrelated to this plan by reproducing the identical failure with all of this plan's changes stashed, and again at the pre-Phase-18 commit `34f0cb7`. Root cause: `art-review/narration-audit.html` and `scripts/narration_audit_check.js` hardcoded a path to `15-DISPOSITIONS-FINAL.json`'s pre-archive location; the file moved to `.planning/milestones/v1.2-phases/15-narration-audit-fixes/` when v1.2 was archived (commit `a63e194`). Per the scope boundary rule this was left unfixed by this plan (not in `files_modified`, unrelated to panel/resize work) and logged to `.planning/WINDOWS.md`. The coordinator then fixed it directly, outside this plan, in commit `a637266` — both the page and the checker now try the live phase path first and fall back to the v1.2 archive path, so they survive this archive and the next one. **`npm test` is now 23/23 assertion groups passing, exit 0** (was 21/22 + 1 failure when this plan's own tasks completed) — including `determinism_baseline.js --verify` (31/31 seeds, the hard constraint this plan actually cares about), `no_undef_check.js`, `module_graph_check.js`, `ui_contract_check.js`, `state_contract_check.js`, and `narration_flow_test.js`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `panelRevealDone()` is exported and ready for 18-05 to chain `armClock` onto (per D-02).
- `activeGhostFloor`'s default-parameter pattern on `resizePanel()` is available for any future caller that needs to respect the ghost floor without new plumbing.
- **Not yet verified by a human or driven browser session this plan:**
  - FIX-16's own acceptance criteria (ghost first-frame `getBoundingClientRect()` within 1px of the pre-swap live element's rect; no `gridTemplateRows` sample smaller than the ghost's `offsetHeight` while it's on screen).
  - FIX-10's own acceptance criteria (`.apBtn` containment inside `#apGridInner` at 320x568/375x667/390x844, and after a rotation round-trip).
  - Reason: this executor has no browser-automation tool available in its toolset this session. The coordinator drove Chrome personally for Task 1/FIX-03 (evidence recorded above and in Task 1's commit context) but that check did not cover Tasks 2 or 3's driven-browser criteria.
  - A local dev server was running on **port 8477** (started by the coordinator, per their instruction to leave it running for later plans); confirm it's still up before relying on it — this session's worktree loss (see Issues Encountered) may or may not have affected it, since the server process is independent of the worktree filesystem.
- **The narrow-window Safari criterion (ROADMAP success criterion 1) remains entirely untouched** and is explicitly gated to plan 18-07, per this plan's own `<local_server_note>` and `<verification>` sections. Not claimed here.
- **Pre-existing `npm test` gap is now closed** (see Issues Encountered) — fixed by the coordinator in `a637266`, outside this plan's scope. `npm test` is 23/23, exit 0, as of this SUMMARY.

## Self-Check: PASSED

- FOUND: `.planning/workstreams/prompts-polish/phases/18-prompts-polish/18-01-SUMMARY.md`
- FOUND: `ecd549f` (Task 1)
- FOUND: `738d6b0` (Task 2)
- FOUND: `3553701` (Task 3)
- FOUND: `f5fe1d8` (grep-count fix, part of Task 3's work)

---
*Phase: 18-prompts-polish*
*Completed: 2026-08-01*
