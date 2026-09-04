# Prediction — t206-privacy-line

**His ruling (Glass, 2026-09-04T00:35:50.066Z):** "move all of it off of the main screen into a
privacy policy that is in its own html, simple to read, and in plain english (not pirate) with
small links to Privacy Policy and About at the bottom of the index.html screen (not inside of the
popup modal box"

**Solution-first: implementing exactly his words, before any further investigation.**

## What I already measured, before writing this

- `index.html:2767` — the privacy line lives INSIDE `#lobby` (`class="modalOverlay"`), inside
  `#stepChoose` — i.e. inside the popup modal box. Doubly wrong by his own words: it's on the
  main screen's first-run modal AND inside the modal box he explicitly excludes.
- No `privacy.html` exists (`Glob` for `privacy*.html` returned nothing).
- `about.html:240` already carries a full plain-English `#privacy` card (added by commit
  `09f8658c`), in Wyatt's own voice, not pirate-speak — reusable content for the new page.
- `#footerRow` (index.html:3106, has the existing About link) is NOT visible on the landing
  screen — it lives inside `#game`, which is `display:none` until actual gameplay starts
  (`#game { display:none }`, and `.pp4Stage` further hides it once the stage UI takes over). So
  today there is no persistent footer at all on the welcome screen.

## What I expect to build

1. `privacy.html` — new standalone page, D-07 style (own stylesheet, no shared imports), reusing
   the `about.html#privacy` card's content, plain English.
2. `index.html`: remove the modal privacy line; add a new small fixed-position footer
   (`#legalFooter`), a body-level sibling of `#lobby` (not nested in any modal), always visible,
   with "Privacy Policy" -> `privacy.html` and "About" -> `about.html`.
3. Leave `about.html` untouched (its own card is not "the main screen" his ruling names) unless
   measurement shows real drift risk.

## What would prove me wrong

- If `#footerRow` turns out to already be visible on the landing screen (i.e. my read of
  `display:none` on `#game` is wrong, or some other CSS overrides it before gameplay starts), the
  simplest fix is adding the Privacy link there instead of building a new fixed footer — I should
  check this in the browser, not just in the CSS text, before concluding a new element is needed.
- If `gear.mjs` calls this GEAR: FULL (content/DOM change to the welcome screen, which a player
  sees, so plausible) rather than a lighter gear, the sea trial cost is real and should be stated
  to whoever reviews this, not quietly downgraded.
- If placing `#legalFooter` at `z-index` above the modal (1000) visually collides with the modal
  card on a phone viewport, that's a layout bug I should catch with a screenshot before calling
  this done, not something to assume away.

I want this to close cleanly in one item, which is a bias worth naming: if it turns out the modal
needs a genuine close/X affordance for `#legalFooter` to be reachable before a player picks a mode,
that's a bigger question than "add two links" and should be flagged rather than papered over.
