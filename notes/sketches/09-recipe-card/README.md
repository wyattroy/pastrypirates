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

Open any file directly in a browser — no server needed, no imports, nothing else on the page.
