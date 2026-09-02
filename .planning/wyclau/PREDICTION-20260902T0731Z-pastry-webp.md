# PREDICTION — written before the measurement, watch 2026-09-02T07:31Z, item `T-004`

*Rule 6's working form: what I expect, why, and what would prove me wrong — on disk before any
number exists, so it cannot be retrofitted.*

## What I am about to do

Convert the 21 recipe illustrations in `assets/pastries/` from PNG to WebP q0.92 at 896px
(`scripts/qa/pastry_reexport.mjs`, which already exists and has already been run in `--dry`), then
point both games at the new files: `src/ui/recipe.js:317` and `classic/src/ui/recipe.js:317`, one
line each. **His ruling is CONVERT, NOT RESIZE** — the pixels do not move.

## What happened immediately BEFORE this, because that is where the trap is

The preload change of 2026-09-01 (`src/ui/util.js`, `...RECIPE_BOOK.map(r=>r.img)`) made all 21 of
these files part of the **boot** payload rather than something fetched when the recipe modal opens.
So this family's weight stopped being a mid-voyage cost and became a first-paint cost — which is
what makes 0.53 MB worth taking off it, and it is also why a broken path here would now fail at
boot on every voyage instead of only in the modal.

## Predictions

1. **The conversion writes 21 `.webp` files and the family drops from ~1.71 MB to ~1.18 MB.**
   Why: `--dry` already measured exactly that, and CEO 83 re-derived it. If the written bytes differ
   from the dry run by more than a rounding error, the script is not deterministic and I should not
   trust either number.
2. **The moment the files are converted and before the source is edited, the game is BROKEN** —
   21 recipe illustrations 404 in both trees. That is the RED state, and it is a real break, not an
   injected one.
3. **Nothing in `npm test` catches that break today.** I expect the whole suite to stay green over
   a build whose recipe art does not exist. If some existing gate goes red on its own, my premise
   for writing a new one is wrong and I should say so and use that gate instead.
4. **The fix is exactly two lines** — the extension in each tree's `recipe.js`. The preload list is
   derived from `RECIPE_BOOK.map(r=>r.img)`, so it follows for free; if I find myself editing a
   third place to make preload work, the derivation is not what the comment claims.
5. **`asset_weight_check.mjs` stays green throughout**, because its ceiling is a maximum and the
   total is going down. It therefore proves nothing about this change on its own, and I will lower
   `assets.ceilingBytes` to the new total so the saving ratchets rather than drifting back.
6. **The picture is unchanged to the eye at the size the game draws it.** The posed pair from the
   earlier watch (`.planning/posed/pastry-{png,webp}-phone.png`) says so; I will photograph the
   SHIPPED result myself rather than inherit that claim.

## What would prove me wrong

- The re-export refuses files, or falls back to the `art-review/` masters and the alpha guard lets
  an opaque-cornered master through — a solid block behind the art, numbers right and picture
  wrong. **Watch for `master` in the script's own per-file `why` column.**
- A pastry path is built anywhere other than `recipe.js:317`. `grep` says no, but grep cannot see a
  path assembled at runtime from parts.
- Safari refuses WebP. It should not — WebP has shipped in Safari since 14 (2020) — but this
  project's core value names Safari explicitly, and "should not" is not a measurement.
- `/classic` breaks. It is the frozen v1 real players are in the middle of, and his ruling
  deliberately includes it. If its recipe art does not resolve after the edit, this change is not
  finished, however good the new game looks.
