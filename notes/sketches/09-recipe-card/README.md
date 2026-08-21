# Item 9 — the recipe card, three different answers

His words: *"You may redesign the buttons, place them elsewhere, and lay out the recipe itself
differently if you want."* Two hard requirements he named: the gradient must **reach the box edges**
and **darken** (not lighten), and **Download PDF / Email must clearly sit above** the scrolling
recipe. All three options meet both requirements; they differ in the mechanism that keeps the
buttons visible while you scroll.

- **Option A — Fixed toolbar, structurally outside the scroll area.** `option-a-top-toolbar.html`
  The buttons live in their own row above `.body`; `.body` is the only thing that scrolls. Simplest
  to build and the safest bet — the buttons literally cannot scroll away because they're not inside
  the scrolling element. The card's own gradient runs corner to corner, dark chocolate top-left to
  near-black bottom-right.

- **Option B — A floating pill "shelf" overlapping the card's own top edge.** `option-b-floating-shelf.html`
  The button bar is a separate rounded element that overlaps the top of the card by design — it
  reads unmistakably as sitting *above* the recipe, not merely at the top of it. Costs one more
  visual layer (the shelf's own shadow) but makes "these buttons are not part of the scrolling
  content" the most obvious of the three at a glance. The card uses a dark radial vignette instead
  of a linear gradient — darkest at the edges, reaching every corner.

- **Option C — Icon-only buttons pinned into the title row, sticky while scrolling.** `option-c-sticky-icon-header.html`
  The buttons sit beside the recipe's own title, and that whole row is `position: sticky` inside the
  scroll area — it scrolls away at first with the title, then locks to the top the moment you scroll
  past it and stays there. Most compact (icon-only, no label text), and the only one of the three
  where the buttons and the title share one row instead of the buttons getting a row of their own.

**My recommendation:** Option A is the lowest-risk fix for what he flagged — it guarantees the
buttons are always visible with the least new mechanism. Option C is worth a look if screen space on
a phone is tight, since it doesn't spend a whole row on the buttons.

- **Option C, with the real recipe art.** `option-c-real-art.html`
  Wyatt picked C, then asked to see it with the actual game content before deciding further. Same
  sticky-icon-header mechanism, byte-for-byte — only the recipe below the title changed. It now shows
  two real entries straight from the live game's own recipe book (`4/src/ui/recipe.js` →
  `RECIPE_BOOK`): the real illustration (the same PNG the in-game recipe modal uses), the real name,
  description, yield, ingredients and steps — one short recipe and one with one of the longest titles
  in the book, so the sticky title row gets stress-tested next to the two icon buttons. A and B were
  **not** refreshed with real art: their button markup (a labeled toolbar row, a floating pill shelf)
  isn't a copy-paste of C's icon-only buttons, so swapping in real content there would be a second,
  separate build, not a free comparison — ask if that's wanted.
  **Not served over `file://`** like the other three: it references the live pastry art at
  `../../../assets/...`, a path that only resolves when served from the repo root (works locally over
  `http://` and at `playpastrypirates.com/notes/sketches/09-recipe-card/option-c-real-art.html`).

Open any of the first four files directly in a browser — no server needed, no imports, nothing else
on the page. `option-c-real-art.html` needs to be served from the repo root (or viewed live) so its
real-art image paths resolve.
