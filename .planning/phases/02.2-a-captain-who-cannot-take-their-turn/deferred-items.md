# Deferred items — out of scope for the plan that found them

Logged per CLAUDE.md's scope boundary: only auto-fix issues directly caused by the current task's
own changes; pre-existing issues found along the way get recorded here, not fixed inline.

## `4/scripts/mp_rig.mjs`'s `DRIVER_SRC.cellOf()` reads a stale SVG-rect shape

**Found during:** D-31 verification (2026-08-21), while building a two-tab crew-game screenshot
pair for the desktop layout gate.

**Issue:** `mp_rig.mjs`'s in-page autoplay driver (`DRIVER_SRC`, exported as `driver()`) computes
which sail square to click with:

```js
const cellOf=r=>{const s=parseFloat(r.getAttribute('width')),px=(s/0.9)+4,i=(px-s)/2;
  return [Math.round((parseFloat(r.getAttribute('x'))-i)/px),Math.round((parseFloat(r.getAttribute('y'))-i)/px)];};
```

This inverts `sailHighlightRect()`'s old SVG-`<rect>` geometry (`width`/`x`/`y` as SVG attributes).
`.sailCell` has been an HTML `<div>` — sized in `cqw`, carrying `data-gx`/`data-gy` directly — since
before this phase (see `docs/DRIVING-THE-GAME.md` §4c, now corrected). `r.getAttribute('width')` on
an HTML div returns `null` (width is a CSS property here, not an HTML attribute), so `cellOf()`
returns `[NaN, NaN]` for every sail square the driver sees. `4/scripts/mouse_qa.mjs`'s own
`cellOf()` already reads `data-gx`/`data-gy` correctly — the fix is to copy that.

**Impact:** the two-tab crew rig's autoplay driver cannot navigate toward a specific island; it
still clicks *a* sail cell (the DOM query itself works, only the coordinate math is broken), so a
driven crew game still progresses, just not with intent. Not a game bug — `mp_rig.mjs` is test
infrastructure, not shipped code.

**Fix (not applied — out of scope for D-31):** in `4/scripts/mp_rig.mjs`'s `DRIVER_SRC`, replace
`cellOf` with `cellOf=d=>[+d.dataset.gx,+d.dataset.gy]` and the `target()` distance loop that
consumes it needs no other change.

**Status:** open, unowned. Whoever next builds a crew-game probe that needs the driver to sail with
intent (rather than randomly) should pick this up first.
