# Board rendering — layers, coordinates, and the camera

**Canonical.** How the board is actually drawn: the layer stack, the two coordinate systems, how
the camera reaches each layer, and the traps that have cost time. Written 2026-08-14 after a
session that added an overlay, forgot to give it the camera, and then wrote **two wrong
verifications** of the fix before writing a right one.

Sibling to `docs/HARD-WON-LESSONS.md` (what to distrust), `docs/DRIVING-THE-GAME.md` (driving it
under automation) and `docs/TRADE-SYSTEM.md`.

> **Read this before adding anything that draws on the board, or before believing a measurement of
> where something is on it.** Every trap below is invisible from the code you would be editing.

---

## 1. THE LAYER STACK

All five live inside `#boardwrap`, which is `position: relative` and `container-type: inline-size`.

| z | Element | Kind | Holds |
|---|---|---|---|
| — | `#board` | **SVG** | ocean art, islands, docks, grid, emoji pops |
| 1 | `#rimHost` | HTML | the trade-wind current (drifting arrows, turning whirlpools) |
| 2 | `#sailHost` | HTML | the legal-move squares |
| 3 | `#rippleHost` | HTML | the active-turn sonar ring |
| 4 | `#boardShips` | **SVG** | the boats — above the rings, which is the point of the split |

The order is deliberate and each boundary was a bug once. Scenery must never cover a choice
(`#rimHost` below `#sailHost`); a choice must never cover a ship.

## 2. TWO COORDINATE SYSTEMS

- **Board units** — the SVG viewBox is `0 0 640 640`. One grid cell is `640 / cfg.grid` (15 → 42.67).
- **Screen** — HTML overlays position in `cqw` against `#boardwrap`, so **640 board units == 100cqw**
  and a board coordinate maps 1:1 with no scale factor to keep in sync on resize.

```js
const CQ = v => (v / 640 * 100) + "cqw";
```

> **Known drift hazard:** that helper is currently written out **three times** — `board.js:127`
> (unitless), `board.js:174` and `flow.js:470`. They agree today. If you change the mapping, change
> all three.

**Carry the cell, never re-derive it.** Elements that belong to a grid square write `data-gx` /
`data-gy` (`sailHighlightRect`, `buildRimFlow`). Two readers once recovered coordinates by
inverting the positioning arithmetic by hand, which is a second copy of it to keep in step.

## 3. THE CAMERA

The director zooms and pans by rewriting the **viewBox**:

```js
svg.setAttribute("viewBox", `${c.x} ${vy} ${c.w} ${h}`);
```

That moves the two SVG layers for free. **An HTML overlay has no viewBox**, so the camera must be
composed into it as a transform — `rendered = scale(640/w) then translate(-v * W/640)`, with
`transform-origin: 0 0`.

```js
const CAM_HTML_LAYERS = ["rippleHost", "sailHost", "rimHost"];   // stage.js
```

> **A LIST, NOT A SET OF NAMED CONSTS — this is the trap.** It was two hand-written consts, beside
> a comment saying a layer without the camera *"would drift off its own square the moment the
> director glided"*. `#rimHost` was added as a third layer, not added there, and did exactly that:
> the current stayed parked on the full-board layout while the water zoomed away beneath it
> (Wyatt: *"the wind arrows are not attached to the board!"*). **Adding a board-mapped overlay
> means adding its id to that array.**

## 4. `preserveAspectRatio` IS `xMidYMin meet`, AND THE BOX IS NOT SQUARE

Set at runtime in `stage.js` (~line 783), **not** in the markup — so it is invisible where you would
look for it:

```js
svg.setAttribute("preserveAspectRatio", "xMidYMin meet");   // full-board hugs the ribbon
```

In stage mode `#board` is `width:100%; height:100%`, so on a 430px phone the element is about
**430 × 637** while the viewBox is square. `meet` therefore **letterboxes**: the 640×640 content
renders 430×430, scaled to fit the WIDTH and anchored to the TOP.

**Consequence, and it is the one that produced a 200px phantom bug:** you cannot map a board
coordinate to the screen with `rect.width / viewBox.width` and `rect.height / viewBox.height`. That
assumes the content stretches. It does not.

## 5. PERFORMANCE — WHY HALF THE BOARD IS HTML

**Chrome does not composite SVG transform animations at all, and `will-change` cannot promote an
SVG child to its own layer.** Measured on this project, twice:

| | measured |
|---|---|
| sail highlights animating `transform: scale` **as SVG** | ~62 layouts/sec — 97% of all layout work with the game idle |
| the identical animation **as HTML** | **0 layouts/sec** |
| the trade-wind current (36 arrows + 4 whirlpools, HTML) | **0 layouts/sec, +4.2% CPU at a real 60fps** |

So: **anything that animates continuously on the board lives in HTML and animates only `transform`
and `opacity`.** Nothing in an overlay may animate `width`/`height`/`top`/`left` — that hands the
board back the layout cost these moves bought.

**Compose a static transform and an animated one on DIFFERENT elements.** A wrapper holds the
static part (a tangent rotation, a scale), the child animates. Written on one element, the keyframe
overwrites the static transform every frame — the same failure as the compass chip whose CSS
animation silently erased its SVG `transform` attribute.

## 6. MOVING A SHIP

| | |
|---|---|
| `SHIP_GLIDE_MS` | 700 — the CSS transition each ship carries |
| `paintShipAt(seat, cell)` | whole-cell paint; moves the active ring with it |
| `paintShipAtPoint(seat, x, y)` | sub-cell paint, for driven motion |
| `setShipGlideMs(seat, ms, ease)` | retune ONE ship's glide; `null` restores |

Two animations drive motion themselves rather than letting CSS do it — the rim sweep
(`animateRimSweepRun`) and the routed sail (`animateSailRoute`). Both follow the same shape, and
each part of it was earned:

1. **Set a one-tick LINEAR glide** while driving. The default 700ms eased glide re-aimed many times
   a second makes the ship a damped follower that takes the **chord, not the arc**.
2. **Paint the start synchronously**, before the first `await`. A browser paints once per task, so
   this overwrites the destination aim `liveRender()` just set and there is no backwards jump.
3. **Derive progress from ELAPSED TIME**, never a tick count — a throttled tab then finishes
   instead of crawling.
4. **Restore in a `finally`**, before the corrective paint, or an interruption strands the ship on
   a short glide and every ordinary move it makes for the rest of the voyage snaps.

**rAF is the wrong tool here** and `panel.js` records why: rAF callbacks are *fully suspended* in a
hidden tab, so an awaited rAF loop never resolves and freezes the whole game loop.

## 7. HOW TO VERIFY WHERE SOMETHING IS — AND THREE WAYS I GOT IT WRONG

2026-08-14. One overlay fix, three verifications, two of them confidently wrong:

1. **Compared the arrow's screen movement against the board's top-left corner.** Under a zoom,
   points at *different* board positions move by *different* amounts. The comparison is meaningless
   and it **failed a correct fix**.
2. **Computed the expected position from the viewBox assuming the SVG stretches.** It letterboxes
   (§4). Reported a confident **200px drift that did not exist**.
3. **Compared each element with the grid rect the SVG ITSELF DREW for that same cell.** No formula
   of mine anywhere in it. Worst drift 1.0px at rest, 2.8px zoomed 2.2×, across all 40 elements.

Only the third is evidence. The first two were verifying against my own re-derivation of the thing
under test, which `HARD-WON-LESSONS` §2 names exactly — and both were committed by someone who had
just finished quoting that rule in another document.

> **The rule for board geometry: compare against something the RENDERER produced, never against
> arithmetic you wrote.** The SVG's own rects, `getBoundingClientRect` on the real element,
> `getComputedStyle().transform` for the live animated value. If your check needs a formula, the
> formula is the thing most likely to be wrong.

**And a size ratio is not a size.** `getBoundingClientRect` on a *rotated* square returns its
axis-aligned bounding box — √2 ≈ 1.41× the side. That looked like oversized arrows and was not.

## 8. ADDING A NEW BOARD OVERLAY — the checklist

1. **HTML or SVG?** Animates continuously → HTML, `transform`/`opacity` only (§5).
2. **Put it in the stack** at the right z, with `position:absolute; inset:0; pointer-events:none`.
3. **Add its id to `CAM_HTML_LAYERS`** if it is mapped to board coordinates (§3). This is the step
   that gets forgotten.
4. **Position in `cqw` via `CQ()`**, and write `data-gx`/`data-gy` on anything that owns a cell.
5. **Static transform on the wrapper, animation on the child** (§5).
6. **Rebuild it from `drawBoard()`**, clearing your own host — `drawBoard` empties the SVGs, not you.
7. **Honour `prefers-reduced-motion`.**
8. **Verify against what the renderer drew**, not against your own maths (§7). Then measure the cost
   with frames actually driven, and quote fps beside the figure (`DRIVING-THE-GAME` §8a).
