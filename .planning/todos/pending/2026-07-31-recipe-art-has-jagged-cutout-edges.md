---
created: 2026-07-31T17:45:00.000Z
title: All 21 recipe images have jagged cutout edges — the alpha mask is hard-edged
area: assets
severity: minor
files:
  - assets/pastries/01…21-*.png (all 21, 5.3 MB total, 512px wide sources)
  - src/ui/recipe.js:290 (attachPastryArt — index-matched to PASTRY_FILES)
  - index.html:208 (.recipeModalThumb — 220px tall, object-fit: contain)
---

## Problem

Wyatt, v1.2 Phase 17 playtest (2026-07-31), with a zoomed screenshot of the Vanilla Bean Crème
Brûlée card: **the recipe images all need to be remasked better because they have jaggies.**

The stair-stepping runs along the whole cutout silhouette — the plate rim, the ramekin, the leaves.

## Root cause

This is **hard-edged alpha**, not a scaling artifact. The distinction matters because it changes the
fix:

- A *resampling* artifact would look soft or blurry, and would change with display size.
- A *hard alpha edge* looks like pixel stairs at a consistent scale, exactly as in the screenshot.

The art was cut out of its background with a **threshold** rather than a matte, so each pixel ended
up fully opaque or fully transparent with no anti-aliased ramp between. There is no partial-alpha
border to blend the subject into whatever it sits on.

This is a known hazard of the project's own generation pipeline. Per the standing note on it, the
source images are generated on a **near-black background** — and a hard threshold against a dark
background produces both this stair-stepped edge and, often, a dark fringe on light subjects.

Sizing is **not** the cause and does not need changing: sources are 512px wide, the modal renders
them at `height:220px; object-fit:contain` (`index.html:208`), so they are downscaled even on a
retina display.

## Solution

Re-mask all 21 with a **soft (anti-aliased) alpha edge** — a proper matte with partial-alpha pixels
along the silhouette, and de-fringe against the dark original background so no dark halo survives on
the light-coloured subjects.

Re-export from the highest-resolution originals available if they still exist; re-masking the already
-thresholded 512px PNGs recovers less, because the information at the boundary is already gone. Check
`art-review/` and the art-generation notes for what sources are on hand before starting.

## Do this together with LOAD-04

**LOAD-04 is the asset-size pass** — shrink ~18 MB to 3–5 MB, and it names pastries (5.3 MB) as one
of the three biggest wins. This item re-exports all 21 pastry PNGs; LOAD-04 re-exports them again for
compression. **Doing them as two passes means processing the same 21 files twice and risks the second
pass undoing the first's edge quality** (aggressive quantisation is itself a way to destroy a soft
alpha ramp). One export pass that fixes the mask *and* hits the size target is strictly better.

LOAD-04 currently sits in the **Fast to Load** candidate milestone, not v1.3. Either pull LOAD-04
forward, or land the remask in v1.3 with an explicit note that LOAD-04 must preserve the new soft
alpha — **do not let a later compression pass silently re-introduce the jaggies.**

## Constraints

- **Do not rename or reorder the files.** `attachPastryArt()` (`src/ui/recipe.js:290`) maps
  `RECIPE_BOOK` to `PASTRY_FILES` **by index**, so a rename or reorder silently attaches the wrong
  picture to every recipe. Replace each file in place, same name.
- Check the art against **both** backgrounds it renders on: the tea-stained parchment of the recipe
  modal (`index.html:222-224`) and the end-of-voyage victory box. A fringe invisible on one can be
  obvious on the other.
- The emoji fallback path must stay intact (a standing constraint on all asset work).

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest (screenshot).
