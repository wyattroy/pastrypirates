# PREDICTION — T-256, `#legalFooter` painting over `#pp4Cap` on phone width

Written before measuring anything beyond what the 2026-09-04T0744Z sea trial and CEO 210 already
confirmed by eye (`solo-phone-011-settled.png`, `crew-phone-host-018-settled.png`).

## What I expect, and why

`#legalFooter` (`index.html:1241`, `position:fixed; bottom:0; z-index:1002`) and `#pp4Cap`
(`index.html:1763`, `position:fixed; bottom:0; z-index:22`) are both bottom-anchored fixed bars
on non-`.pp4Side` (phone-width) viewports once `body.pp4Stage` is active. The footer's higher
z-index wins the paint order, so I expect a headless measurement at 390×844, in a real solo
voyage staged with a populated captains panel, to show `#legalFooter`'s rect vertically
overlapping `#pp4Cap`'s rect by a nonzero number of pixels — and specifically overlapping the
LAST `.player-row` inside `#pp4Cap` (since the footer sits at the very bottom edge and the panel
is only as tall as its rows).

**My planned fix:** give `#pp4Cap` extra bottom padding, scoped to `body.pp4Stage:not(.pp4Side)`,
sized to clear `#legalFooter`'s own rendered height (measured, not guessed) plus a small margin.
This keeps `#legalFooter` exactly as reachable as his `T-206` ruling requires — nothing about the
footer changes — and simply stops the captains panel's own last row from painting underneath it,
the same shape as the existing `env(safe-area-inset-bottom)` clearance already in that rule.

## What would prove me wrong

- If `#legalFooter`'s rendered height turns out to be 0 or the two rects do not actually overlap
  on a real staged phone screen (i.e., the trial's screenshots were of an unusual state), my
  mechanism is wrong and I should not ship a padding fix blind.
- If adding bottom padding to `#pp4Cap` pushes its content so tall that scrolling/overflow behaves
  differently, or the panel's own rows become unreachable, the fix is worse than the bug.
- If the SAME overlap also occurs on tablet/desktop (`.pp4Side` layout), my "phone-width only"
  scoping is wrong and the fix needs to be unscoped.

## How I will falsify/confirm

`scripts/qa/t256_footer_clear_of_captains_check.mjs` — reaches a real staged solo voyage at
390×844 (reusing the ADVANCE pattern from `t142_captains_under_modal_check.mjs`), then measures
`#legalFooter`'s and `#pp4Cap`'s rects and every visible `.player-row`'s rect, reporting overlap
in pixels. RED before the fix, GREEN after, plus a tablet/desktop control seat to catch
over-scoping.
