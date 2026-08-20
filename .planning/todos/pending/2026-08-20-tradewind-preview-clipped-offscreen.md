---
created: 2026-08-20T18:10:00.000Z
title: Trade-wind preview breaks when its destination is off the visible board
area: ui
severity: minor
tree: "4/ (v2.0 — the game being promoted). NOT the root game."
reported_by: Wyatt, mid-playtest of build 2026-08-20c
status: recorded for a future session — HIS EXPLICIT INSTRUCTION, do not fix in the reporting session
files:
  - 4/src/ui/stage.js (the trade-wind preview — "camFitSail and the trade-wind preview, both in src/ui/stage.js", per the note at 4/src/ui/flow.js:487)
  - 4/src/ui/flow.js:487 (names the preview as one of the two consumers of the shared sail maths)
  - 4/src/ui/board.js (sailHighlightRect writes data-gx/gy; the tan legal-move squares, which render CORRECTLY)
---

## Problem

Wyatt, 2026-08-20: *"the trade winds preview doesn't display correctly when the square you're going
to is offscreen."*

**Recorded from one screenshot, read pixel by pixel. NOT reproduced, NOT traced to a line** — the
mechanism below is inference from the picture and must be measured before anything is changed
(CLAUDE.md rule 6).

### What is actually visible in his screenshot

A pass-and-play crew game, DAY 1, wind S↓ both now and forecast:

1. A **dashed cyan line** runs diagonally from near the ringed (active) boat down and to the left
   across roughly five squares.
2. **That line passes straight through the sugar-cube island** rather than around it.
3. **Four dashed light-blue outlined squares**: one isolated at mid-lower-left, then three in a row
   along the **very bottom edge of the board** — the lowest row visibly cut by the board boundary.
4. **The dashed line does not connect to those squares.** It stops short of them, so the preview
   reads as two unrelated fragments rather than one path to one destination.
5. **The tan sail-window squares render correctly** in the same frame, on the right and bottom-right.
   So this is specific to the trade-wind preview, not to board highlighting generally.

### The likely shape, marked as INFERENCE

The preview appears to be drawn in board coordinates that extend past the currently framed viewport,
and what falls outside is clipped rather than handled — leaving a line with no destination and
destination markers with no line. `#boardwrap` clips (see the note in `4/index.html` that this
started clipping deliberately, which is what made an off-board prompt worth fixing in the first
place — the same class of fault that produced the "boat being asked is always on the water" camera
rule at `4/src/ui/stage.js`).

**Three things to establish before writing any fix:**
- Is the destination genuinely off-viewport, or off-BOARD (a push that would carry the ship past the
  edge)? Those are different bugs with different right answers.
- Does the line through the island mean the preview ignores land, or is it drawing a wind vector
  rather than a sail path? If wind, it may be correct and only the clipping is wrong.
- `docs/BOARD-RENDERING.md` first — the board is drawn in five layers, and anything mapped to board
  coordinates must be in `CAM_HTML_LAYERS` or it detaches when the director zooms. A preview that
  detaches under zoom would look exactly like this.

### Seen in the same frame, and NOT part of this bug

The prompt label reads **"guest: tap to sail"** while the CAPTAINS panel gives the active outline to
**Flaky Jack**, and the ringed boat is orange (Flaky Jack's colour), not teal (guest's). Recorded
here only because it is in the same picture and would otherwise be lost. **It may be nothing** — a
pass-and-play device handover mid-frame would explain it. Do not treat it as a defect without
measuring; but do look, because a name/seat mismatch is the same family as the two-directors work in
Phase 02.15.

## Why it is not being fixed now

**Wyatt's explicit instruction:** *"i think you should record it for a future session… record this
bug for the backlog."* He was mid-playtest with three other reports open and chose to park this one.
