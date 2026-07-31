---
created: 2026-07-31T16:45:00.000Z
title: The win banner's hardcoded "a" is wrong for plural recipe names
area: copy
severity: minor
files:
  - src/orchestrator.js:887 (the win banner — the hardcoded "a")
  - src/ui/recipe.js:52-260 (RECIPE_BOOK — 21 titles, 8 of them plural)
  - src/ui/recipe.js:298-304 (recipeTitle + its fallback)
---

## Problem

Wyatt, from the v1.2 Phase 17 playtest (2026-07-31), with a screenshot of the end-of-voyage banner:

> **Davy Scones baked a 📜 Mexican Chocolate Pots and won Best Baker in the Caribbean!**

"baked **a** Mexican Chocolate Pots" is ungrammatical. The banner hardcodes the article
(`src/orchestrator.js:887`):

```js
`${pn(appState.game.winner)} baked a ${winRecipeSpan(appState.game.winner)} and won <b>Best Baker in the Caribbean!</b>`
```

Eight of the twenty-one recipes are plural and hit this.

## The fix — RULED by Wyatt, 2026-07-31

**Fix the article, not the names.** *"A simpler fix may simply be to change the wording at the end of
the game to only add in the word 'a' in front of the recipe"* when the name takes one.

**No recipe is renamed.** All 21 titles stay exactly as they are. The banner reads:

- `baked a Molten Chocolate Lava Cake` (singular — article kept)
- `baked Mexican Chocolate Pots` (plural — **no article**)

This was chosen over renaming the eight plurals. It is one flag per recipe instead of eight renames,
it leaves names alone that read better plural ("Cinnamon Snaps", "Snickerdoodle Bites" — the real
dessert is a plate of them), and it touches no other surface where the titles appear.

## How to carry the flag

Add a per-recipe field on `RECIPE_BOOK` (`src/ui/recipe.js`) — e.g. `article:"a"` / `article:""` —
and have the banner emit `${article}${article?" ":""}${recipe}`.

**Use an explicit per-recipe field, not a computed rule.** Two reasons, and the second is the real
one:

1. Pluralisation cannot be detected reliably from a string. "Pots de Crème" is plural; "Genoise" is
   not; an `/s$/` test gets both wrong in opposite directions.
2. **It also retires the latent a/an bug in the same edit.** No current title starts with a vowel
   sound, so the hardcoded "a" happens to be correct today — but the day someone adds "Espresso
   Torte" or "Almond Tart" the banner reads "baked a Espresso Torte". A vowel-letter test would not
   save you either (compare "an hour", "a unicorn"). For a curated list of 21, an explicit field is
   both simpler and strictly more correct than any heuristic. Setting it to `"an"` where needed makes
   the whole class of bug impossible rather than merely absent.

**Also cover the fallback.** `recipeTitle()` has a fallback for non-standard ingredient sets
(`src/ui/recipe.js:301-303`) returning `Captain's {X} & {Y} Bake` — that has no `RECIPE_BOOK` entry
and therefore no article field. It is singular, so it wants `"a"`; make sure the code path does not
render `undefined` or drop the article for it.

## Scope note

This changes **only the win banner**. The titles themselves are untouched, so the other places they
render — the captains-box prow label (`src/ui/board.js:525`), the recipe modal
(`src/ui/recipe.js:318`), the share subject (`:374`) — need no change and should not be touched.

## Gates

- The banner sentence is player-facing copy and falls inside the inventory tracked by
  `.planning/todos/pending/copy-shipped-vs-approved-gate.md`. One sentence changes shape; record it.
- **Do not reorder `RECIPE_BOOK` while adding the field.** Pastry art is index-matched via
  `PASTRY_FILES` / `attachPastryArt()` (`src/ui/recipe.js:290`), so a reorder would silently detach
  every image from its recipe.

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest; approach ruled by him the same day.
