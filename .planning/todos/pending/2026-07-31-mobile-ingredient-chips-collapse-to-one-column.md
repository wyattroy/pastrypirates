---
created: 2026-07-31T17:00:00.000Z
title: On narrow mobile the ingredient chips collapse into a single vertical column
area: ui
severity: minor
files:
  - index.html:165-174 (.prowTop grid + the max-width 480px override)
  - index.html:191 (.chips flex container)
  - index.html:192 (.chip — fixed 34x34)
  - src/ui/board.js:525 (prow recipe label render)
---

## Problem

Wyatt, from the v1.2 Phase 17 playtest (2026-07-31), with a screenshot: **on mobile (very narrow) the
player's ingredients are bunched into one vertical column.** Each captain's row becomes five chip
heights tall, so the Captains box grows enormously and a player cannot take in their hold at a
glance — the thing that box exists to do.

## Where it comes from

`.prowTop` is a fixed-column grid (`index.html:166`):

```css
.prowTop { display: grid; grid-template-columns: 14px 106px 40px 1fr; gap: 6px 6px;
  grid-template-areas: ".   .    .     recipe" "dot name coins chips"; align-items: center; }
```

and the chips are a wrapping flex row of **fixed 34×34 chips** (`index.html:191-192`):

```css
.chips { display: flex; flex-wrap: wrap; gap: 3px; align-items: center; }
.chip { width: 34px; height: 34px; … }
```

Five chips need `5×34 + 4×3 = 182px`. The first three columns plus gaps consume `14+106+40+18 =
178px` before the chips column gets anything, so once the panel is narrower than roughly **360px of
usable width**, the `1fr` chips column drops under 182px and the flex row wraps — and as it keeps
narrowing it degrades all the way to one chip per line.

There is already a `@media (max-width: 480px)` rule for this row (`index.html:167-174`), but it only
moves the **recipe** onto its own line. It does nothing about the chips, which are what actually
overflow.

**Reproduce before fixing — do not assume the arithmetic above is the whole story.** Open the
Captains box at the exact width from Wyatt's screenshot and confirm the chips column's computed
width. Two other candidates could be contributing and would change the fix:

1. The `106px` name column and `40px` coins column are **fixed**, so they never yield. On a 320–390px
   phone they are a large fraction of the row.
2. In the 480px override the recipe spans `".  recipe recipe recipe"` — a long unbreakable title
   ("Molten Chocolate Lava Cake") contributes min-content width to the columns it spans, which can
   push the chips column below its share.

## Solution — TBD, needs a design call

The goal Wyatt stated: **the player can see their ingredients without them bunching into one
column.** Options, in rough order of how much they disturb the existing layout:

1. **Shrink the chips on narrow screens.** A `@media (max-width: 480px)` rule taking `.chip` down to
   ~26px makes five chips fit in ~145px. Smallest change; watch tap-target size — the existing
   480px block deliberately *enlarges* the flippenator and clock because they "read as too small to
   tap accurately", so shrinking here runs against that judgement. The chips may not be tap targets
   at all — **check before assuming** they can shrink freely.
2. **Give the chips their own full-width row on narrow screens**, the same move the recipe already
   makes. `grid-template-areas: "dot name coins" ".  recipe recipe" "chips chips chips"` gives them
   the full panel width — comfortably enough for five at 34px. Costs one row of height per captain.
3. **Let the fixed columns flex** — `minmax(0, 106px)` for the name (it already marquee-scrolls when
   it overflows, so it can afford to give ground) and let the chips column claim the slack.

Option 2 is the most likely answer and matches a decision the file has already made for the recipe,
but this is a visual call — get Wyatt's eye on it rather than picking one.

## Constraints

- **The fixed-column grid is load-bearing and documented** (`index.html:160-164`): the fixed
  dot/name/coins columns *"keep money and hold aligned across all captains regardless of name length
  or how many ingredients they're holding."* Any fix must preserve that cross-captain alignment —
  ragged columns between captains would be a worse bug than the one being fixed.
- The comment at `:170-173` warns that **row order in `grid-template-areas` matters** — recipe must
  come second so it renders below the dot/name/coins/chips row. Adding a chips row must not disturb
  that.
- Verify in **Safari** as well as Chrome, and at the real narrow widths (320 / 375 / 390), not just
  by dragging a desktop window narrow.

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest (screenshot).
