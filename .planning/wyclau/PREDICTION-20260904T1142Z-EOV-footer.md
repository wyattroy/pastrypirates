# PREDICTION — 20260904T1142Z — End of Voyage panel clips `#legalFooter` on desktop

**Trigger.** The fresh FULL trial `2026-09-04T1013Z-Wy-Blade` (build `2026.09.04.2`, the first trial
to sail after `T-256` fixed the phone-width `#legalFooter`/`#pp4Cap` overlap) found a NEW finding on
`passplay-desktop-041-settled.png`: *"'Privacy Policy · About' footer text at bottom of the End of
Voyage panel is clipped by the panel's bottom edge."* Verified by eye (rule 22): both the settled and
unsettled screenshots show a faint, partial sliver of text right at the very bottom edge of the
image, below the "Play again!" button. Not previously a known Chart row (grepped `CHART.md` for
"footer", "clipped by", "End of Voyage panel" — no match before this).

## What happened immediately before (rule: widen the time horizon)

`T-256` (closed 2026-09-04T0958Z, commit `fe87894a`) taught `camFrame()` to reserve `#legalFooter`'s
own height inside `#pp4Cap`'s budget — **scoped to true phone width only** (its own commit message
says so). The End of Voyage panel (`#statsWrap`) is a completely different element with its own
CSS (`index.html:2450`, `position:fixed; bottom:0`) and was never touched by that fix. So if
`#statsWrap`'s content reaches the same true viewport bottom `#legalFooter` also pins to, the same
CLASS of bug (a fixed-bottom panel with nothing reserving room for the footer) would reproduce here,
independently, on desktop rather than phone.

## What I expect, and why

Reading `index.html:2450-2470` (`#statsWrap`) and `:2501` (`#statsWrap .pp4Again`, the "Play again!"
button, `padding:16px`, last flex child) against `:1241` (`#legalFooter`, `position:fixed; bottom:0;
z-index:1002`, ~20-25px tall with its 5px padding + 11px/1.4 line-height text):

**I expect `#legalFooter`'s rect to overlap the bottom few pixels of `#statsWrap`'s own last visible
content (the "Play again!" button or its padding), because nothing in `#statsWrap`'s CSS reserves
space for the footer's height** — `#statsWrap` has a flat `padding:14px` on all sides, not a
`padding-bottom` sized to the footer, so its content runs to within 14px of the true viewport
bottom, and `#legalFooter` (taller than 14px) needs more room than that.

## Falsifier

If the measured overlap between `#legalFooter`'s rect and `#statsWrap`'s (or its button's) rect is
**0px** at the desktop seat, my reasoning is wrong and the screenshot's faint sliver is something
else — most likely the footer rendering at its documented `.55` opacity against a light background,
legible but easy to misread as "cut off" in a compressed screenshot, not a geometric clip at all.

## What would prove this a REAL problem worth fixing (not just an instrument artifact)

The footer's own two links (`Privacy Policy`, `About`) must still be legible and tappable — `#legalFooter a` keeps `pointer-events:auto` regardless of overlap, so even if it paints over the button, both stay clickable (z-index 1002 wins). So the actual player-facing harm, if any, is COSMETIC (visually crowded/overlapping text) not a broken control — unlike `T-256`'s phone case, where the footer covered game DATA. I will report the overlap number honestly either way and size the fix to what's actually broken, not to what the row's headline claims.

## RESULT — MEASURED 2026-09-04T1150Z, `scripts/qa/t241_eov_footer_pose.mjs`

**MY MAIN HYPOTHESIS WAS WRONG. THE FALSIFIER FIRED.**

| seat | `#legalFooter` rect | `.pp4Again` button rect | overlap w/ button | gap below button |
|---|---|---|---|---|
| desktop-1280x900 | 14..872 × 875..900 | 811..873 | **0px** | 2px |
| phone-390x844 | 0..390 × 819..844 | 755..817 | **0px** | 2px |

`#legalFooter` does **not** overlap the "Play again!" button on either seat — a clean 2px gap, both
before any code change. `#statsWrap`'s own outer box (padding included) does overlap the footer's
band by 13px, but that's background padding, not content — nothing is drawn there.

**Opening both posed screenshots (rule 22) shows why the judge misread it**: `getComputedStyle(footer).opacity`
is `1`, but `#legalFooter a` (the CSS rule at `index.html:1244`) sets each individual link to
`opacity:.55`, in an 11px font, sitting flush against the true viewport bottom edge (`bottom:0`,
footer bottom == viewport height exactly). The text **"Privacy Policy · About" is fully rendered,
fully within the viewport, and not clipped by anything** — it is just small, low-contrast, and right
at the edge, which reads as "cut off" in a compressed trial screenshot and to a vision judge glancing
at it, exactly as `T-019`'s standing caveat warns ("the judge's words are its guess at why, and it is
wrong often enough that they are not quotable").

**This matches the falsifier I wrote before measuring**, almost exactly. Verdict: **not a defect.**
The footer is small **by design** — his own ruling on `T-206` asked for *"small links... at the
bottom"* — and it is neither clipped nor covering anything. No game-code fix is warranted.
