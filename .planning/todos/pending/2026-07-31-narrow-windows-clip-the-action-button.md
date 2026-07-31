---
created: 2026-07-31T17:20:00.000Z
title: Narrow windows clip the action button — the narration box is pinned too short
area: ui
severity: major
files:
  - src/ui/panel.js:308-318 (resizePanel — measures once, pins a px height)
  - index.html:275-276 (#apGrid grid-template-rows + #apGridInner overflow:hidden)
  - src/main.js:161-168 (the resize listener — calls syncBoardSizing only)
---

## Problem

Wyatt, v1.2 Phase 17 playtest (2026-07-31), with a screenshot: **on a narrow window the action
button is cut off / the narration box is too short.** The prompt *"Wyatttt: click any yellow square
to sail there (−1🪙)"* wraps to two lines and the **"Stay put"** button beneath it is sliced in half
by the bottom edge of the yellow panel.

This is worse than cosmetic: **the button is the only way to take that action.** A player on a narrow
window can be left unable to reach a legal move.

## Root cause — confirmed

`resizePanel()` (`src/ui/panel.js:308-318`) measures the message's natural height **once** and then
pins the box to that exact pixel value:

```js
grid.style.gridTemplateRows="max-content";
const h=inner.offsetHeight;      // measured ONCE, at this instant, at this width
grid.style.gridTemplateRows=from;
void grid.offsetHeight;
grid.style.gridTemplateRows=h+"px";   // pinned in px
```

and `#apGridInner` is `overflow: hidden` (`index.html:276`). **So anything that makes the content
taller than the measured value after the measurement is silently clipped** — no scrollbar, no
overflow, it just disappears.

**The window resize path is confirmed broken.** `src/main.js:161-168` listens for `resize` and
`orientationchange`, but only calls `ui.syncBoardSizing()` — **`resizePanel()` is never re-run.**
Narrow the window (or rotate a phone) after a prompt has rendered and the text re-wraps taller while
the box stays pinned at the old height. The button goes under the fold.

That measure-once design is deliberate and load-bearing — it is BUG-01's Safari fix. The comment at
`src/ui/panel.js:305-307` is explicit: measuring once means *"the height animates a single time per
message instead of on every character."* **So the fix is not to remeasure continuously.** It is to
remeasure at the few moments the content's height can actually change.

## Likely second path — verify it

Wyatt's screenshot may be a window that was **narrow from the start**, not resized. If so, the
measurement is running before layout has settled. Prime suspect: the prompt contains an inline coin
image (`iconImg`), and **an image with no intrinsic size contributes 0 height until it loads** — so a
measurement taken before the icon decodes comes out one line short, then the icon pops in and pushes
the button past the pinned height. Web fonts have the same shape of problem.

**Reproduce both paths before fixing** — they need different remedies:

1. Render a prompt, then narrow the window → confirms the missing resize re-measure.
2. Load at a narrow width with a cold image cache and a two-line prompt → confirms the
   measure-before-images-load path.

## Solution — TBD

Whatever is chosen must keep the once-per-message guarantee that BUG-01's fix depends on. Candidates:

- **Re-run `resizePanel()` from the existing resize/orientationchange listener**, rAF-debounced the
  same way `syncBoardSizing` already is. Directly fixes path 1. Cheap and well-precedented — the
  listener and the debounce already exist at `src/main.js:161`.
- **A `ResizeObserver` on `#apGridInner`** that re-pins the height when the content's natural height
  changes. Covers both paths including late-loading images, and is the more complete answer — but
  guard it against feedback loops (it observes the element whose height it sets) and make sure it
  cannot fire per-character during the typewriter reveal, which is exactly the Safari hitch BUG-01
  removed.
- **A safety net regardless of which is chosen:** the current failure mode is silent and total. Even
  after a fix, `overflow:hidden` on a container holding the only interactive control is a sharp edge.
  Consider `min-height` on the pinned row, or letting the panel grow past the pinned height rather
  than clip, so a future mis-measure degrades into a slightly-too-tall box instead of an unreachable
  button.

## Plan this together with FIX-03 — same function, same measurement

**FIX-03** (action buttons wait for the typewriter) touches this exact code and already carries the
constraint *"must not change the measured panel height."* The two are the same seam viewed from two
sides, and FIX-03's hide-then-show of the buttons is precisely the kind of late height change that
this bug is about. **Doing them in either order without the other in view will produce a fix that the
other one breaks.** Same lane (C) — plan them as one piece of work.

## Constraints

- **Do not remove the measure-once design.** It is BUG-01's Safari fix (`src/ui/panel.js:305-307`,
  `index.html:299`). Re-measuring per reveal tick is the original near-crash.
- Verify in **Safari** as well as Chrome, at real narrow widths (320 / 375 / 390) and across an
  orientation change — not only by dragging a desktop window.
- Check the reduced-motion path too: `@media (prefers-reduced-motion: reduce) { #apGrid {
  transition: none; } }` (`index.html:277`) changes how the height is applied.

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest (screenshot).
