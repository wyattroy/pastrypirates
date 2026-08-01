---
phase: 18-prompts-polish
plan: 06
subsystem: ui
tags: [css, visual, mobile, buttons, grid]

# Dependency graph
requires:
  - phase: 18-prompts-polish (18-01, 18-03, 18-05)
    provides: the panel/button-reveal group (FIX-03/10/16), FIX-04/FIX-21 nobrk sweep, and D-02's
      reveal-gated shot clock — none of which this plan's CSS-only edits touch
provides:
  - "FIX-06: every button.primary site (static + dynamic) restyled from a solid orange fill to the
    footerKofi outline + faded-fill recipe, with a red destructive recipe on #btnConfirmLeave"
  - "FIX-17: the captain colour swatch removed from both the in-game player rows and the lobby seat
    list; .prowTop's grid dropped to three columns with the gap closed"
  - "FIX-09: both D-03 candidate narrow-screen chip treatments (shrink vs. own row) implemented as
    live, toggleable CSS (body.chipsOwnRow) — neither chosen, both statically verified"
affects: [18-07]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS specificity bump (button.footerLeave, 0,1,1) used to let a button keep two classes
      (primary + footerLeave) without changing an enumerated class=\"primary\" count, resolved by
      source order at equal specificity rather than by removing a class"
    - "D-03 candidate CSS toggled by a body-level class (body.chipsOwnRow) so two live, mutually
      exclusive treatments can coexist without dead code until a human picks one"

key-files:
  created: []
  modified:
    - index.html (CSS: button.primary, button.primary:hover, .apBtn.primary:hover, button.footerLeave,
      #btnConfirmLeave markup, .prowTop grid + areas (base + narrow), .player-row .dot / .seat .dot
      deleted, FIX-09 treatment A/B rules)
    - src/ui/util.js (buildPlayerRows(): swatch span removed)
    - src/ui/lobby.js (renderSeatList(): swatch span removed)
    - .planning/todos/pending/copy-shipped-vs-approved-gate.md (3 ledger rows: FIX-06/17/09, all
      visual-only, no text changed)
    - .planning/WINDOWS.md (entry 9: the six blocked D-03 renders)

key-decisions:
  - "Real button count is 9 static + 1 dynamic = 10, not the ROADMAP's stated 12 — recorded per
    hard_constraint 1 rather than silently absorbed"
  - "#btnConfirmLeave keeps its primary class and gains footerLeave as a SECOND class, resolved via
    a button.footerLeave specificity-matched override rather than swapping classes, so the
    class=\"primary\" count stays pinned at 9"
  - "FIX-09 Treatment A's chip size (26px) is a reasoned estimate (RESEARCH.md's own candidate value,
    above the 20px legibility floor) — NOT browser-confirmed to keep a full realistic hold on one
    line at 320px; this uncertainty is the load-bearing reason both treatments ship live rather than
    one being picked now"

requirements-completed: [FIX-06, FIX-09, FIX-17]

coverage:
  - id: D1
    description: "FIX-06 — every button.primary site (9 static + 1 dynamic) restyled to the outline
      + faded-fill recipe, with no solid-orange hover; #btnConfirmLeave uses the red destructive
      recipe"
    requirement: FIX-06
    verification:
      - kind: unit
        ref: "grep -n 'button.primary' index.html | grep -c 'var(--accent)' == 0"
        status: pass
      - kind: unit
        ref: "grep -c 'class=\"[^\"]*primary' index.html == 9 (unchanged)"
        status: pass
      - kind: unit
        ref: "grep -c 'footerLeave' index.html == 4 (was 3, +1)"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: true
    rationale: "Whether the restyled buttons and the .ahoyGlow ring against the new pale fill look
      right by eye is inherently Wyatt's call (plan's own acceptance criteria mark this a backstop
      resolved in 18-07); browser screenshots could not be captured this session (see Known Gaps)."
  - id: D2
    description: "FIX-17 — the captain colour swatch is gone from player rows and the lobby seat
      list, with the grid gap closed and the recipe still tucked under the name"
    requirement: FIX-17
    verification:
      - kind: unit
        ref: "grep -n 'class=\"dot\"' src/ui/util.js src/ui/lobby.js (empty)"
        status: pass
      - kind: unit
        ref: "grep -cE '^\\s*\\.(prowTop|player-row|seat)\\s+\\.dot' index.html == 0"
        status: pass
      - kind: unit
        ref: "grid-template-columns has exactly 3 values; both grid-template-areas have 3 tokens/row"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: true
    rationale: "The pixel-level recipe/pname alignment check and the dot-lessness live in a driven
      Chrome session, which was unavailable this session (see Known Gaps); the CSS-level guarantee
      (recipe now literally starts at the name column, since the swatch column no longer exists) is
      verified statically, not rendered."
  - id: D3
    description: "FIX-09 — both narrow-screen chip treatments exist as live, toggleable CSS
      (body.chipsOwnRow), authored against the post-FIX-17 three-column grid, per D-03"
    requirement: FIX-09
    verification:
      - kind: unit
        ref: "grep -c 'chipsOwnRow' index.html >= 1 (3) and grep -c 'D-03' index.html >= 1 (1)"
        status: pass
      - kind: unit
        ref: "npm test"
        status: pass
    human_judgment: true
    rationale: "The plan's own D-03 ruling requires the CHOICE between treatments to be made by
      Wyatt from six 320/375/390 renders. Those renders are BLOCKED this session — no browser
      automation tool available (docs/DRIVING-THE-GAME.md §8b) — and are explicitly NOT produced
      here rather than faked. This deliverable cannot be closed by any automated check; it routes
      to 18-07's checkpoint."

duration: ~15min
completed: 2026-08-01
status: complete
---

# Phase 18 Plan 06: Button Restyle, Captain Circles Removed, Both FIX-09 Chip Treatments Summary

**FIX-06/FIX-17/FIX-09: primary buttons restyled to outline+faded-fill (real count 9 static + 1
dynamic, not 12), captain colour swatch removed everywhere, both FIX-09 narrow-screen chip
treatments implemented as live toggleable CSS pending Wyatt's D-03 choice.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-08-01T09:29:40Z
- **Tasks:** 3 of 3
- **Files modified:** 5 (index.html, src/ui/util.js, src/ui/lobby.js, plus two ledger docs)

## Accomplishments

- **FIX-06:** `button.primary`, `button.primary:hover`, and `.apBtn.primary:hover` restyled from a
  solid `var(--accent)` fill to the `.footerKofi` outline + pale-fill recipe, verbatim (border
  `#e89827`, background `#fdf3e3`, text `#8a5a12`; hover background `#fae7cb`). No solid-orange
  hover remains anywhere. `#btnConfirmLeave` now renders with the `.footerLeave` red destructive
  recipe instead, per the UI-10 design-intent comment already in the codebase.
- **The real button count is 9 static `class="primary"` sites in `index.html` plus the one dynamic
  site in `src/ui/flow.js` (`cls:"primary ahoyGlow"`) — 10 total, not the ROADMAP's stated 12.**
  Recorded here per hard_constraint 1 rather than silently asserting the ROADMAP's number.
- **FIX-17:** the `<span class="dot">` colour swatch is deleted from `buildPlayerRows()`
  (`src/ui/util.js`) and `renderSeatList()` (`src/ui/lobby.js`) — the only two emitting sites.
  `.prowTop`'s grid drops from 4 columns (`14px 106px 40px 1fr`) to 3 (`106px 40px 1fr`) in both the
  base rule and the `@media (max-width: 480px)` override; `.player-row .dot` and `.seat .dot` sizing
  rules are deleted as dead CSS. Every other `HEXCOL[i]` consumer (row background tint, `--rowcol`
  border, `.pname` colour) is untouched — one `HEXCOL` reference removed per file, confirmed by
  count (util.js 7→6, lobby.js 4→3).
- **FIX-09:** both D-03 candidate treatments are implemented inside the existing
  `@media (max-width: 480px)` block, authored against the post-FIX-17 three-column grid (per Task
  3's precondition). Treatment A (live default) shrinks `.chip` to 26px. Treatment B (toggle via
  `document.body.classList.toggle('chipsOwnRow')`) gives chips their own full-width third grid row,
  matching the recipe row's own narrow-screen precedent, and leaves `.chip` at full (34px) size.
  Neither is chosen; a comment naming D-03 records that exactly one survives 18-07 and the other is
  deleted then.

## Task Commits

Each task was committed atomically:

1. **Task 1: Restyle the primary buttons** — `4964496` (feat)
2. **Task 2: Remove the captain colour swatch everywhere** — `a026d2c` (feat)
3. **Task 3: Build BOTH narrow-screen chip treatments** — `8de1ac2` (feat)

**Plan metadata:** (this commit, `docs(18-06): complete button restyle, captain circles removed,
both FIX-09 chip treatments plan`)

## Files Created/Modified

- `index.html` — CSS restyle of `button.primary`/`.apBtn.primary:hover`/new `button.footerLeave`
  override; `#btnConfirmLeave` markup gains a second class; `.prowTop` grid narrowed to 3 columns in
  both layouts; `.player-row .dot`/`.seat .dot` deleted; FIX-09 treatment A/B CSS added
- `src/ui/util.js` — `buildPlayerRows()`'s swatch span deleted
- `src/ui/lobby.js` — `renderSeatList()`'s swatch span deleted
- `art-review/narration-inventory.json` — regenerated by `npm test` after the util.js line-count
  shift (line numbers only, no content change)
- `.planning/todos/pending/copy-shipped-vs-approved-gate.md` — 3 rows logged (FIX-06/17/09, all
  visual-only per hard_constraint 8)
- `.planning/WINDOWS.md` — entry 9 (the six blocked D-03 renders)

## Decisions Made

- **Button count discrepancy recorded, not absorbed.** A direct grep found 9 static
  `class="primary"` sites plus 1 dynamic site (10 total), against the ROADMAP's stated 12. The fix
  is the same single CSS rule regardless of the count, so this changes nothing about the
  implementation — only what gets reported.
- **`#btnConfirmLeave` keeps `class="primary"` and gains `footerLeave` as a second class**, rather
  than swapping `primary` for `footerLeave`. This was necessary to satisfy the plan's own acceptance
  criterion that the primary-button count stay unchanged (no primary button added or removed). The
  visual override is achieved by bumping `.footerLeave`'s selector to `button.footerLeave` (tying its
  specificity with `button.primary`) so it wins by source order (declared later) — a pattern already
  used in this codebase (`.apBtn.primary:hover`'s compound-class precedent).
- **Treatment A's 26px chip size is a reasoned estimate, not a measured one.** `.prowTop`'s chips
  column width ultimately depends on `--boardW`, a JS-computed value that cannot be resolved without
  a live render. 26px is drawn from `18-RESEARCH.md`'s own candidate value, chosen because it sits
  comfortably above the 20px legibility floor while shrinking meaningfully from the 34px default.
  Whether it actually keeps a full realistic hold (5 recipe chips + at least one extra) on one line
  at 320px is explicitly UNVERIFIED — this is exactly why both treatments ship live rather than
  Treatment A being picked blind.

## Deviations from Plan

None — plan executed exactly as written, with all hard constraints honoured (button count enumerated
honestly rather than asserted at 12; FIX-17 removed the dot everywhere with the grid gap closed;
`src/engine/index.js` and `src/ui/board.js` untouched; every edit located by selector/identifier text,
never by line number).

## Issues Encountered

None beyond the explicitly-scoped browser-verification gap (see Known Gaps below), which was
anticipated and pre-authorized by this plan's own `<scope_adjustment_read_carefully>` block.

## Known Gaps (explicit, not silently absorbed)

**The six FIX-09 renders (Treatment A/B × 320/375/390) were NOT produced this session.** Per this
plan's own scope adjustment, browser automation is unavailable: the MCP browser tab is hidden
(`document.hidden=true`), `requestAnimationFrame` delivers 0 frames in 3 seconds, timers are clamped
10×, and `window.innerWidth` is pinned at 950 so `matchMedia('(max-width: 480px)')` never matches —
so a 320/375/390 sweep is physically impossible from this session (confirmed empirically, all
workarounds exhausted, written up at `docs/DRIVING-THE-GAME.md` §8b). Recorded as
`.planning/WINDOWS.md` entry 9. **Neither treatment was picked** — that choice is explicitly Wyatt's,
per D-03, and folds into 18-07's checkpoint alongside the renders themselves.

Also unverified this session for the same reason (all four `<human-check>` items across the three
tasks require a driven Chrome session):
- FIX-06's four screenshot surfaces (front door, lobby, in-panel `.ahoyGlow` prompt, leave-game
  confirm dialog) — CSS-level correctness is verified (no `var(--accent)` remains, colours match
  `.footerKofi` character-for-character), but whether it *looks right*, including the `.ahoyGlow`
  ring against the new pale fill, is unverified.
- FIX-17's lobby/player-row screenshots at 390px and desktop, and the live
  `document.querySelector('.prowTop .pname').getBoundingClientRect().left` vs. `.prowRecipe` check —
  the grid-level guarantee (recipe area now starts at the first/name column since the swatch column
  no longer exists) is verified statically; the rendered pixel match is not.

These are all backstops the plan itself marks as resolved in 18-07, not gaps introduced by this
session — but they are listed here explicitly per the plan's instruction to be honest about what was
verified vs. what a human must still check.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- FIX-06 and FIX-17 are code-complete and pass every automated check (`npm test`, `ui_contract_check`,
  `narration_audit_check`, `no_undef_check`, `module_graph_check`); only the by-eye/visual sign-off
  remains, which 18-07 is designed to gather.
- FIX-09 is code-complete for BOTH candidates but the D-03 decision itself is unmade — 18-07 needs a
  human on a real browser (or a working browser-automation session) to produce the six renders, pick
  a treatment, and then delete the loser's CSS (hard_constraint 6: no dead CSS ships past that point).
- `npm test` is green (exit 0) after every task commit; `src/engine/index.js` and `src/ui/board.js`
  are untouched, confirmed by `git diff` showing no changes to either file across all three commits.

---
*Phase: 18-prompts-polish*
*Completed: 2026-08-01*

## Self-Check: PASSED

- FOUND: `.planning/workstreams/prompts-polish/phases/18-prompts-polish/18-06-SUMMARY.md`
- FOUND: `4964496` (Task 1 commit)
- FOUND: `a026d2c` (Task 2 commit)
- FOUND: `8de1ac2` (Task 3 commit)
