---
quick_id: 260828-vhv
description: "W4-4 — the captains box is narrower than the board"
status: complete
date: 2026-08-28
gates: "scripts/qa/w44_captains_width_check.mjs (chain 37 -> 38)"
---

# W4-4 — done

## What Wyatt gets

The captains box now runs edge-to-edge with the board instead of sitting inside it, and the captain
rows fill the box instead of stopping short of its right edge. Both at every screen size.

## Two faults, not one — and fixing only the first made the second worse

| | before | after |
|---|---|---|
| box vs board, tablet + desktop | inset **14px each side** (28px total) | **flush, 0px** |
| box vs board, phone | already flush | unchanged |
| empty panel to the right of a row, tablet | 84px → **111px once the box was widened** | **13px** |
| …desktop | 84px → 111px | **13px** |
| …phone | 17px | **13px** |

The 13px that remains is the row's own padding, and it is now **the same at all three sizes**, which
it was not before.

## The causes, both of the same shape

1. **`--pp4CapGap` was one variable doing two jobs.** It is declared as *"the gap between board and
   captains column"* — a separation, for the side-by-side layout, and `computeStageGeometry()` reads
   it as that. The stacked rule at ≥601px reused the same number as a left/right **inset**. The
   panel's containing block IS the board's box, so any inset there is the panel disagreeing with the
   board about how wide the stage is.
2. **The classic layout's `--boardW` still capped a panel that had moved.** `#captainsPanel` is
   re-parented into `#pp4Cap` when the stage comes up, but kept wearing
   `max-width: var(--boardW)` — 632px, the OLD board's width — while its box was at the new board's
   754px.

Measured, not inferred: `--boardW` 632 · `#pp4Cap` 754 · `#captainsPanel` 632 (max-width 632px) ·
`.player-row` 606, at 768×954.

## What was NOT fixed, deliberately

- **The sea trial's "rows filling only the left ~15%" is not a layout fault.** The row pills are 83%
  of the panel; what fills 15% is the *content* — `W44 🪙 –` on day 1, when nobody has collected
  anything. Same false-positive family as the judge's "empty speech bubble".
- **The recipe card is capped by the same `--boardW`.** Widening it is a taste decision Wyatt has not
  made, so the fix is scoped to the captains box and the question is parked.
- **W4-7** (possible overflow past a 390px right edge) stays its own item. Still unmeasured.

## Process notes, for the next session

- **Three assertions written in this session passed against the tree they were written to condemn** —
  one matched `:not(.pp4Side)` as if it were the side layout, one matched the side layout's own box
  instead of the panel inside the stacked one, and one (in the W4-3 gate) mis-tracked media context.
  Every one was caught by running RED first and *reading which lines passed*. Running red is not
  enough on its own; the pass lines have to be read too.
- The plan for this task said to write the prediction before measuring. The first measurement was
  taken without one. The second (the fix) did have one, and it was right on both counts.
