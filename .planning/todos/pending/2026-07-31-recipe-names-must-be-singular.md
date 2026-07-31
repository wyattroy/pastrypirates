---
created: 2026-07-31T16:45:00.000Z
title: All recipe names must be singular — plurals read wrong in the win banner
area: copy
severity: minor
files:
  - src/ui/recipe.js:52-260 (RECIPE_BOOK — 21 titles, 8 of them plural)
  - src/orchestrator.js:887 (the win banner — "baked a {recipe}")
  - src/ui/board.js:525 (captains-box prow label)
---

## Problem

Wyatt, from the v1.2 Phase 17 playtest (2026-07-31), with a screenshot of the end-of-voyage banner:

> **Davy Scones baked a 📜 Mexican Chocolate Pots and won Best Baker in the Caribbean!**

*"All recipe names must be singular — Mexican Chocolate Pots is plural and reads wrong at the end
sequence."*

The win banner at `src/orchestrator.js:887` hardcodes the article **"a"**:

```js
`${pn(appState.game.winner)} baked a ${winRecipeSpan(appState.game.winner)} and won <b>Best Baker in the Caribbean!</b>`
```

"baked a Mexican Chocolate Pots" is ungrammatical. Eight of the twenty-one recipes hit this.

## The eight plural titles

All live in `RECIPE_BOOK`, `src/ui/recipe.js`:

| # | Current | Singular |
|---|---|---|
| 4 | Cinnamon-Sugar Churros | Cinnamon-Sugar Churro |
| 6 | Spiced Fudge Brownies | Spiced Fudge Brownie |
| 8 | Cinnamon Snaps | Cinnamon Snap |
| 9 | Snickerdoodle Bites | Snickerdoodle Bite |
| 11 | Crispy Cocoa Snaps | Crispy Cocoa Snap |
| 12 | Dark Chocolate Cream Puffs | Dark Chocolate Cream Puff |
| 14 | French Pots de Crème | French Pot de Crème |
| 17 | Mexican Chocolate Pots | Mexican Chocolate Pot |

The other thirteen are already singular and need no change.

**These are suggestions, not a ruling — the wording is Wyatt's call.** Some singularize cleanly
("Mexican Chocolate Pot", "Dark Chocolate Cream Puff", "French Pot de Crème"). Others read thinner as
a single unit ("Cinnamon Snap", "Snickerdoodle Bite") because the real-world dessert is a plate of
them. If any of those read badly to him, the alternative is a name that is singular by construction —
a batch noun like "Snickerdoodle Batch" or "Plate of Cinnamon Snaps" — rather than forcing an awkward
singular. Get his approval on the final eight before shipping.

## Also check — the article

`recipeTitle()` also has a **fallback** path for non-standard ingredient sets
(`src/ui/recipe.js:301-303`): `Captain's {X} & {Y} Bake`. That is already singular, so it is fine.

None of the current 21 titles begin with a vowel sound, so the hardcoded **"a"** is correct today and
stays correct after singularizing. **It is still a latent trap:** a future recipe starting with a
vowel ("Espresso…", "Almond…", "Orange…") would render "baked a Espresso…". Worth fixing the article
properly at the same time, since the banner is already being touched — but note the honest edge case,
that a/an cannot be decided by first letter alone ("an hour", "a unicorn"), so a simple vowel test is
a heuristic, not a rule. For a fixed list of 21 curated names, an explicit per-recipe article field is
more reliable than any heuristic.

## Where else titles appear

Singularizing is a data change in one array, but the titles render in several places — check each
still reads correctly, especially anywhere an article or count precedes them:

- Win banner (`src/orchestrator.js:887`) — the reported failure
- Captains-box prow label (`src/ui/board.js:525`)
- The recipe modal (`recipeCardHTML`, `src/ui/recipe.js:318`)
- The share/email subject (`src/ui/recipe.js:374`)

## Gates

- Recipe titles are player-facing copy and fall inside the inventory tracked by
  `.planning/todos/pending/copy-shipped-vs-approved-gate.md`. Eight renames are eight inventory
  changes — record them.
- **Check whether any recipe title is keyed on elsewhere.** `RECIPE_LOOKUP` keys on the sorted
  ingredient list, not the title (`src/ui/recipe.js:295`), so renaming looks safe — but confirm no
  test, fixture, or saved game stores a title string before renaming.
- Pastry art is index-matched (`PASTRY_FILES`, `attachPastryArt()` at `src/ui/recipe.js:290`), so
  **do not reorder `RECIPE_BOOK` while editing it** — the art would silently detach from the names.

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest.
