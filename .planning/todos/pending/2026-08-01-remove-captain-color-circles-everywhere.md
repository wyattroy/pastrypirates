---
created: 2026-08-01T00:05:00.000Z
title: Remove the coloured circles next to captain names — everywhere they appear
area: ui
severity: minor
files:
  - src/ui/util.js:96 (the .dot span inside buildPlayerRows)
  - index.html:149-168 (.player-row / .prowTop grid — "dot" is a named grid area)
  - index.html:576 (.seat .dot — the LOBBY seat list)
---

## Problem

Wyatt, 2026-08-01: **"Remove the coloured circles next to the captain names in the Captains box and
shift everything left. Those coloured circles can be removed everywhere that they appear."**

## This widens an already-tracked item — read the note before starting

**V13-17** (`.planning/research/v1.3-intake/`) already covers the Captains-box circle, and the
feasibility pass confirmed it safe: a single decorative `<span class="dot">` at `src/ui/util.js:96`,
styled by two rules scoped to `.player-row`/`.prowTop`, **no ID, no click handler, no other reader
anywhere in the codebase.**

**But V13-17 explicitly said NOT to touch the lobby's dot:**

> *"a separate, differently-scoped `.seat .dot` (`index.html:576`) exists in the **lobby** seat list —
> that one is not vestigial and V13-17 (which names 'the Captains box') should not touch it."*

**Wyatt's 2026-08-01 instruction — "everywhere that they appear" — overrides that.** Record it as a
deliberate widening, not an oversight, so nobody re-reads the old note and puts the lobby dot back.

**One thing to check first, and to raise with him if it bites:** the lobby dot was called
*"not vestigial"* because in the lobby the colour may be the **only** thing identifying which seat is
which, before names are locked in. If removing it leaves seats visually indistinguishable, that is
worth one question rather than silently shipping a worse lobby. Everywhere the name is already
coloured, the circle is pure redundancy and removing it is clean.

## Solution

1. Remove the `<span class="dot">` from `buildPlayerRows()` (`src/ui/util.js:96`).
2. **Update the grid to match and shift everything left.** `.prowTop` declares `grid-template-columns:
   14px 106px 40px 1fr` and names a `dot` area in **both** its layouts, including the
   `max-width:480px` override (`index.html:166`, `:173`). Drop the column *and* the area name in both,
   or the row keeps a 14px hole where the circle was — which would miss the "shift everything left"
   half of the ask entirely.
3. Remove the now-dead `.player-row .dot` rule.
4. Remove `.seat .dot` from the lobby (`index.html:576`) and its markup, subject to the check above.

**Pairs naturally with FIX-09** (ingredient chips collapsing to one column on a phone) — that item is
about `.prowTop`'s columns being too tight on narrow screens, and this one **frees 14px plus a gap**
from the same grid. Doing them together means editing that grid once.

**Source:** Wyatt, 2026-08-01. Widens V13-17.
