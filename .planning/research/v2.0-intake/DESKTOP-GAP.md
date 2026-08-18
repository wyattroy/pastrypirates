# RESEARCH 5 — What stands between `/4` and a good desktop/widescreen experience

Read-only investigation. No repo files were modified.
Branch `main`, clean, at `a191366`. All measurements are computed from the code as written
(arithmetic shown), not from a live browser session.

---

## 1. The short version, in plain language

`/4` is not a page with a layout. It is a **camera pointed at a square board**, and the shape of
that camera is taken directly from the shape of the phone it is running on.

On a phone held upright, the window is tall and narrow, so the camera is tall and narrow, and the
whole 15×15 board fits inside it with room to spare. Everything else in the game — the day ribbon
across the top, the wind pill under it, the captains box glued to the bottom, the ring of action
circles that blooms around your boat — floats on top of that board, pinned to the four edges of the
screen.

On a desktop, the window is **wide and short**. The camera copies that shape. So instead of a square
board you get a **letterbox slot**, and the board is bigger than the slot. The top four rows and the
bottom four rows of the board are simply not on screen, and there is no way to get them there except
by dragging the board around with the mouse. **Double-clicking to "fit the whole board" cannot fit
the whole board — the code that does it is mathematically unable to succeed on a landscape window.**

That is the headline. Everything else — circles too small, the captains bar stretched two thousand
pixels wide, no hover feedback, soft artwork — is real but secondary. The board itself does not fit.

### Why it happens, in one sentence

`4/src/ui/stage.js:227-229` sets the camera's *height* by multiplying its *width* by the window's
aspect ratio, and the only line that ever rescues the full board (`if (h > 640) h = 640`) can only
fire when the board strip is **taller than the window is wide** — true on every phone, false on
every desktop.

---

## 2. `/4`'s current layout strategy, described plainly

There are effectively **two layout systems in the file**, and only one of them runs.

### 2a. The inherited v1 system (present, intact, unused on the stage)

`/4` was forked from the live v1 game and still carries all of v1's desktop machinery:

- `4/src/ui/board.js:2031` `syncBoardSizing()` — identical to v1's. Measures the window, makes the
  board a **square** as tall as the viewport minus chrome (floor 600px), then asks whether the
  leftover width can hold a 380px sidebar. If yes it adds `layoutWide` to `#game`.
- `4/index.html:135-141` — `layoutWide` turns `#layout` into a **two-column grid**: board on the
  left, and a stacked sidebar on the right holding captains, controls, narration, chat and stats.
- `4/src/ui/board.js:1981` — `MIN_SIDEBAR_W=380, MAX_SIDEBAR_W=560`.

This is a working desktop layout. It still runs on every resize (`4/src/main.js:180-188`). It is
then **completely overridden** the moment the stage starts, because `4/index.html:1423` pins
`#boardwrap` to `position:fixed; inset:0` and `4/index.html:1410` collapses `#layout` to
`display:block`. So the desktop layout is paid for and switched off.

### 2b. The `/4` stage system (the one that actually runs)

Turned on by `document.body.classList.add("pp4Stage")` at `4/src/ui/stage.js:863`.

- The board SVG is **full-bleed and fixed** — `position:fixed; inset:0; width:100vw; height:100vh`
  (`4/index.html:1423-1425`), then trimmed each frame by JS to a horizontal band (`stage.js:223-226`).
- Everything else is a **floating overlay pinned to the viewport edges**, not a grid cell:
  ribbon top, wind pill under it, captains box bottom, prompts free-floating at the boat.
- Board geometry is **JS-measured every animation frame** by `camFrame()` (`stage.js:191-272`),
  which writes the SVG `viewBox` and a matching CSS transform onto three HTML overlay layers.
- Sizes of the furniture are **hardcoded pixels** chosen for a thumb: 66px action circles, 70px
  bloom radius, 290px narration bubbles, 250px captains band, 13px pill text.
- Board-relative things (islands, sail squares, currents) size in `cqw` against `#boardwrap`, so
  they scale with the board correctly at any width. That part is sound.

### 2c. Media queries — the complete list

Searched `4/index.html` and all of `4/src/`. **There are only two width-based media queries in the
entire build, and both are mobile-down:**

| Line | Query | What it does |
|---|---|---|
| `4/index.html:1157` | `@media (max-width: 600px)` | modal cards top-align instead of centring |
| `4/index.html:1163` | `@media (max-width: 480px)` | bumps flippenator/clock/mute ~1.5× so they stay tappable |

Everything else matching `@media` is `prefers-reduced-motion` (19 of them) or `@media print` (2).

**Confirmed absent from `/4` entirely:**
- `@media (min-width: …)` — **zero**. Nothing in the build gets *more* layout as the screen grows.
- `(orientation: …)` — **zero**.
- `(hover: hover)` / `(pointer: fine)` / `(pointer: coarse)` — **zero**. Nothing distinguishes a
  mouse from a finger.
- `(aspect-ratio: …)` — **zero** as a query (the one hit at `4/index.html:1225` is the
  `aspect-ratio: 1` *property* on a bake-off bowl).

There is one **container query**, and it is the good pattern the project already knows about:
`@container captains (max-width: 460px)` at `4/index.html:269`, with a written note (lines 254-268)
explaining that the captains box must respond to *its own* width, not the viewport's. That reasoning
is exactly what a desktop pass needs applied more broadly.

---

## 3. Every layout-deciding code site

### The camera (the ones that matter most)

| Site | What it decides | Mobile assumption baked in |
|---|---|---|
| `4/src/ui/stage.js:221` | `CAP_BASE = min(250, 30% of height)` — the band reserved for the captains box | A phone-sized bottom sheet. On a 1440px-tall screen it is still 250px, and it spans the **full window width** |
| `4/src/ui/stage.js:222` | `availH` — the vertical strip the board gets | Assumes the leftover strip is *taller than the window is wide* |
| **`4/src/ui/stage.js:227`** | **`aspect = availH / vwPx()`** — the camera's shape | **This IS the portrait assumption.** On desktop this is ~0.4, so the camera is a letterbox |
| **`4/src/ui/stage.js:228-229`** | **`h = c.w * aspect; if (h > 640) h = 640`** — the only line that can ever show the whole board | **Can only fire when `availH ≥ vwPx()`. Never true on a desktop window** |
| `4/src/ui/stage.js:230-233` | `vy` — vertically centres the letterbox slot on the camera's centre | Silently discards the rest of the board |
| `4/src/ui/stage.js:55-63` | `camTo()` — the camera is a **square** described by one number `w` | Height is a by-product of the window shape, never chosen |
| `4/src/ui/stage.js:80-91` | `camFitCells()` — frames a set of cells by fitting a **square** around them | Vertical fit is never checked; see §4b |
| `4/src/ui/stage.js:88` | `side = max(side, 640/maxZoom)` — the 2.2× zoom cap | Caps width only |
| `4/src/ui/stage.js:94-107` | `camFitSail()` — "a legal move is never off screen" (its own comment) | **This promise is broken on landscape** |
| `4/src/ui/stage.js:237-239` | Captains box top follows the rendered board bottom | Correct, and stays correct |
| `4/src/ui/stage.js:937-939` | `preserveAspectRatio = "xMidYMin meet"` — top-aligned | Written so the full board "hugs the ribbon" on a phone |
| `4/src/ui/stage.js:190` | `resize` → invalidate ribbon-height + viewBox caches | The camera's **only** response to a resize; it never re-frames |

### The floating furniture

| Site | What it decides | Mobile assumption baked in |
|---|---|---|
| `4/src/ui/stage.js:466-472` | **`boardBand()`** — the single definition of "where the board is visible": top = under the ribbon, bottom = top of captains box, left/right = 8px to `vw-8` | Full-bleed horizontally. This is the **best hook for a desktop pass** — it already has three consumers (clip host, bubble placer, ask pill), so changing it changes all three at once |
| `4/src/ui/stage.js:576` | Narration bubble width cap `min(290, vw-24)` — the "stop guessing their width" fix | 290px absolute. Correct on a phone, a postage stamp on a 27" screen |
| `4/src/ui/stage.js:577-578` | `width: max-content` + that cap — bubbles are as wide as their words | Genuinely good; scales fine |
| `4/src/ui/stage.js:592-607` | Bubble placement + tail, clamped inside the band | Follows the boat; works at any size |
| `4/src/ui/stage.js:990-994` | Centre-stage vertical lift, computed from the captains box height | Measured, not guessed; survives desktop |
| `4/src/ui/stage.js:1046-1048` | Recipe chooser = bottom sheet at **45% of viewport height, full viewport width** | A phone bottom-sheet idiom |
| `4/src/ui/stage.js:1082` | Sheet max height = `vh − panelTop − 8` | Fine |
| `4/src/ui/stage.js:1092` | Radial layer `width: 100vw` | Inert layer; harmless |
| `4/src/ui/stage.js:1149` | `inBand()` — "is my boat visible?" test that triggers a camera move | Uses `vwPx()` for left/right; on desktop a boat is nearly always "in band" horizontally and cropped vertically |
| **`4/src/ui/stage.js:1157`** | **`R = 70, D = 66`** — the action-circle bloom radius and diameter, absolute px | Thumb-sized. Never scales |
| `4/src/ui/stage.js:1191, 1226` | Ask-pill width and left, clamped to `vw − 20` | |
| `4/src/ui/stage.js:1242-1252` | Slider bar and helper text clamped to `vw − 20` | |
| `4/src/ui/stage.js:1362` | "Is this card big?" test = `offsetHeight > 42% of viewport height` | Ratio-based; survives |
| `4/src/ui/util.js:1236-1237` | **`vwPx()` / `vhPx()`** — the layout viewport. Every box on the stage is laid out from these two functions | **The single chokepoint.** Written to dodge a Safari pinch-zoom bug; that same chokepoint is what would make a letterboxed desktop frame cheap |
| `4/src/main.js:180-188` | `resize` → `syncBoardSizing()` + `resizePanel()` | Re-runs the *v1* sizing, which the stage overrides. Never touches the camera |
| `4/src/main.js:192-196` | `orientationchange` → same | Phone-rotation event; fires on no desktop |
| `4/src/ui/board.js:2031-2064` | `syncBoardSizing()` — v1's desktop two-column decision | Still live, overridden by the stage |
| `4/src/ui/board.js:1981` | `MIN_SIDEBAR_W=380 / MAX_SIDEBAR_W=560` | v1 desktop constants, currently unused |
| `4/src/ui/board.js:2000-2016` | `placeMuteButton()` — measured "does the mute button fit beside the clock" | Both homes are hidden on the stage |
| `4/src/ui/flow.js:159-168` | `.apWhy` tooltip clamped to `window.innerWidth − 8` | Also the only place `/4` still uses `innerWidth` instead of `vwPx()` — a small inconsistency, not a desktop blocker |

### The CSS that pins things to screen edges

| Site | What it decides | Mobile assumption |
|---|---|---|
| `4/index.html:1423-1425` | Board `position:fixed; inset:0; 100vw × 100vh` | Full-bleed |
| `4/index.html:1426-1428` | `#pp4Cap` captains box: fixed, `left:0; right:0; bottom:0`, `env(safe-area-inset-bottom)` | Full-width bottom bar, iPhone notch padding |
| `4/index.html:1506-1510` | `#pp4Ribbon`: fixed, `left:0; right:0; top:0`, `env(safe-area-inset-top)` | Full-width top bar |
| `4/index.html:1518` | `#pp4Pill` wind readout: fixed, `top: 52px`, centred, 12.5px text | Fixed px offset under a phone status bar |
| `4/index.html:1484-1491` | Radial `.apBtn`: **66×66px circles, 9.5px text, 17px icons** | Thumb targets |
| `4/index.html:1497-1499` | ☰ menu overlay: fixed, `left:12px; right:12px; top:64px` | Full-width drawer |
| `4/index.html:1538` | `#pp4Fx` clip host, `left:0; right:0` | Full-width |
| `4/index.html:1543-1544` | Ambient bubble `max-width: min(320px, 86vw)` | |
| `4/index.html:1609-1610` | Centre stage overlay `100vw × 100vh` | |
| `4/index.html:1622-1624` | Centre-stage card `width: min(420px, 94vw); max-width: 420px` | **The only surface in `/4` with a real desktop-safe cap** |
| `4/index.html:1657` | Centre-stage `.apBtn`: 110×110px circles | |
| `4/index.html:1754-1756` | End of Voyage `#statsWrap`: fixed full-bleed, 14px padding | A 2560px-wide column of text |
| `4/index.html:1802-1806` | Stage captain rows: name `max-width:36%`, chips `justify-content:flex-end` | Name hard left, chips hard right |
| `4/index.html:339` | `#boardwrap max-width: var(--boardW, min(820px, 100vh − 210px))` | v1 classic layout; overridden on the stage |
| `4/index.html:269` | `@container captains (max-width: 460px)` | The correct pattern, used once |

---

## 4. What actually breaks at widescreen

### 4a. The board does not fit — and cannot be made to fit

Working the arithmetic in `camFrame()` (`stage.js:207-241`) with the ribbon+pill measuring about
80px tall:

| Window | Captains band | Board strip `availH` | `aspect` | Board rows visible | Cell size on screen |
|---|---|---|---|---|---|
| iPhone **390×844** | 250px | 511px | 1.31 → clamped | **15 of 15** ✅ | 26px |
| Laptop **1440×900** | 250px | 567px | 0.394 | **5.9 of 15** ❌ | 96px |
| Monitor **2560×1440** | 250px | 1107px | 0.432 | **6.5 of 15** ❌ | 171px |

Visually: on a 1440×900 laptop the player sees a wide horizontal slice through the **middle of the
board** — roughly rows 5 to 11. The Isle of Tortuga home dock, the top row of islands, and the
bottom row of islands are all off screen. `body.pp4Stage { overflow:hidden }` means the page cannot
scroll, so the only way to reach them is to grab the sea and drag.

The condition for seeing the whole board is `availH ≥ vwPx()`, i.e. roughly **window height ≥ window
width + 333px**. At 1440 wide you would need a 1773px-tall window. **No desktop window on earth
satisfies this.** Double-click-to-fit (`stage.js:319-323`) calls `camFull()`, which sets the width to
640 and is then immediately re-cropped by line 228.

### 4b. The director crops legal moves

`camFitSail()` (`stage.js:94-107`) carries the promise "a legal move is never off screen." It works
by fitting a **square** around every highlighted sail square (`camFitCells`, line 80-91). On a
landscape window that square is then rendered at ~40% of its height, so **sail squares at the top
and bottom of your legal-move window get cropped off the screen** while the ring of action circles
blooms around a boat sitting in a slot that is too short for its own answer space.

The same applies to `camFitSeats()` (line 109) — the battle framing. Two captains stacked vertically
will not both fit. This is a *functional* break, not a cosmetic one: it hides choices the player is
being asked to make.

### 4c. Furniture that stretches to absurd widths

Every one of these is `position:fixed` against the viewport, so at 2560px:

- **Captains box** — a 2560×250px band. Each captain row puts the name hard-left and the ingredient
  chips hard-right (`index.html:1802-1805`), leaving ~2000px of empty cream between a name and its
  own crates.
- **Day ribbon** — 2560px wide, with "DAY 1", four 24px boat pips and the ☰ all bunched at the far
  left over an empty gradient.
- **Recipe chooser** — `stage.js:1046-1048` sets the sheet to `vw − 16`, i.e. **2544px wide**, at
  45% down the screen. `index.html:1707` lays the recipe cards out `1fr 1fr`, so it's two ~1270px
  parchment cards side by side.
- **☰ menu** — `index.html:1498` `left:12px; right:12px`, so the settings drawer is 2536px wide with
  a stack of full-width buttons.
- **End of Voyage** — `index.html:1754` full-bleed fixed; a single 2560px-wide column of stats text.

### 4d. Furniture that stays phone-sized and looks lost

- **Action circles** — 66px with 9.5px labels (`index.html:1484-1490`), floating in a 2560px field.
- **Narration bubbles** — capped at 290px (`stage.js:576`).
- **Wind pill** — 12.5px text pinned 52px from the top (`index.html:1518-1520`).
- **Stay-put confirm** — 60px circles (`index.html:1793`).
- Only the **centre stage** (`index.html:1622-1624`, capped at 420px and genuinely centred) reads
  correctly on a big screen. It is the proof that the treatment works when a cap exists.

### 4e. Thumb-reach placements that are simply wrong for a mouse

The whole layout is a **thumb-zone layout**: everything you touch is at the bottom or the middle.
Captains box bottom-anchored, recipe sheet bottom-anchored, ☰ drawer full-width. On a desktop the
eye goes to the centre and the mouse can reach anywhere, so bottom-anchoring buys nothing and costs
the board its vertical room. Note also that `env(safe-area-inset-*)` resolves to `0` on desktop —
harmless, but it means the ribbon/captains padding was tuned for a notch that isn't there.

The **radial action fan is the exception and the good news**: it blooms around your boat wherever
your boat is (`stage.js:1156-1258`), so it is already position-independent and survives any layout
change untouched. Same for the narration bubbles.

---

## 5. Input model — what's missing for mouse and keyboard

`/4` uses **pointer events** throughout (`stage.js:284, 294, 337`), so mouse input mostly works by
accident. What's missing:

| Gap | Evidence | Consequence on desktop |
|---|---|---|
| **No wheel / trackpad zoom** | No `wheel` listener anywhere in `4/src/` | Zoom is only reachable by double-click (fit ↔ 2.0×) — and "fit" is broken (§4a). Pinch needs two pointers, impossible with a mouse |
| **Two-finger scroll is blocked** | `stage.js:280-281` `touchAction:"none"` + `preventDefault` on `touchmove` | The natural trackpad pan gesture does nothing over the board |
| **No cursor affordance for panning** | No `cursor: grab` on `#boardwrap` or `#board`; the only `grab` cursors are on the quantity slider thumb (`index.html:446, 448`) | The board is draggable and doesn't look it — which matters more now, since dragging is the *only* way to see the cropped rows |
| **Hover is dead on the action circles** | `index.html:453` `.apBtn:hover{background:#eafbf4}` (specificity 0-2-0) is overridden by `index.html:1484` `#pp4Prompt.radial .apBtn{background:#fffdf2}` (1-1-1). Same for `#pp4Prompt.pp4Center .apBtn` (`index.html:1657`) and `.apBack` (`index.html:1459` vs `487`) | The primary controls give **no mouse-over feedback at all**. On touch that was invisible; on desktop it reads as broken |
| **No keyboard navigation** | The only `keydown` in the game is `Escape` on the name modal (`lobby.js:218`) and an audio-unlock listener (`orchestrator.js:1607-1611`) | Cannot tab to an action circle, cannot arrow-key a sail move, cannot Enter to confirm |
| **No focus styles** | Zero `:focus-visible` rules in `4/index.html` | Even if tabbing worked there'd be no focus ring |
| **No hover/pointer media queries** | Zero `(hover: hover)` / `(pointer: fine)` in the build | Nothing can currently be conditioned on "this is a mouse" |
| **Text selection disabled stage-wide** | `index.html:1769-1770` | Correct for touch; on desktop it also blocks copying a captain's name or a recipe line. Minor |

What *does* work with a mouse already: drag-to-pan, double-click-to-zoom, clicking action circles,
clicking sail squares (`.sailCell:hover` at `index.html:922` **does** apply — that one wasn't
overridden), tapping a captain row to expand, the ☰ menu, and hold-to-peek (mouse-down over the sea
fades the prompt — a nice accident that reads fine as click-and-hold).

---

## 6. Asset resolution findings

All art is raster PNG under `assets/`, referenced from `/4` via `ASSET_BASE = "../assets/"`
(`4/src/shared/index.js:24`) — i.e. **`/4` shares the live game's asset folder**. Nothing is SVG,
and there are no `@2x` variants or `srcset` anywhere.

Measured intrinsic sizes:

| Asset | Source pixels | Drawn at | Verdict on a big screen |
|---|---|---|---|
| `assets/board.png` | **2132 × 2132** (4.5 MB) | Full 640-unit board → renders at the full window width | **The main risk.** See table below |
| `assets/boats/1-4.png` | **136 × 221** each | One grid cell square (42.67 units) | **The worst ratio in the set** — the hero art with the smallest source |
| `assets/islands/1,3,5.png` | 1093×394, 1463×399, 1054×534 | Multi-cell shapes | Fine — big sources |
| `assets/islands/2,4,6,7.png` | ~300 × ~295 | Single-cell shapes | Borderline at 2× zoom on a retina 2560 |
| `assets/dock.png` | 363 × 287 | Per-cell | Same as small islands |
| `assets/wind-arrow.png`, `trade-swirl.png` | 362×287, 363×287 | Per-cell overlays | Borderline |
| `assets/rain-streaks.png` | 240 × 226 | Tiling storm texture | Tiles, so unaffected |
| `assets/ingredients/*.png` | 168–251 px | 34px chips / 22px list rows | Fine, big headroom |
| `assets/icons/*.png` | mostly 128 px (a few 320) | 17–22px | Fine |

**Board art sharpness**, computed as source pixels vs. device pixels (assuming a 2× retina display):

| Situation | Board rendered width | Device pixels needed | vs. 2132 source |
|---|---|---|---|
| iPhone 390, whole board | 390 CSS px | 780 | 2.7× **downsampled** — crisp |
| Laptop 1440, board filling width | 1440 CSS px | 2880 | **1.35× upscaled** — slightly soft |
| Monitor 2560, board filling width | 2560 CSS px | 5120 | **2.4× upscaled** — visibly soft |
| Monitor 2560, zoomed 2.2× | 5632 CSS px effective | 11264 | **5.3× upscaled** — mushy |

**Boat art**, source 136×221, drawn one cell tall:

| Situation | Boat rendered height | Device pixels | vs. 221 source |
|---|---|---|---|
| iPhone 390 | 26 CSS px | 52 | crisp |
| Laptop 1440 | 96 CSS px | 192 | just about fine |
| Laptop 1440, zoomed 2.2× | 211 CSS px | 422 | **1.9× upscaled** — soft |
| Monitor 2560 | 171 CSS px | 342 | **1.5× upscaled** — soft |
| Monitor 2560, zoomed 2.2× | 376 CSS px | 752 | **3.4× upscaled** — clearly blurry |

**Honest read.** The board background is *acceptable* at 1440 and *soft* at 2560, and it only gets
bad when the director zooms in. The boats are the ones that will look wrong first — they are the
character of the game, they are on screen at all times, and their source files are the smallest in
the set at 136 px wide.

**Two things worth saying plainly:**
1. This is not a blocker for a desktop version. It's a re-export job on maybe six files (`board.png`
   at ~4096², the four boats at ~512 tall, the four single-cell islands). No code changes.
2. `board.png` is **4.5 MB already**. Doubling it to 4096² would be roughly 16 MB, on a game with
   no build step and no image pipeline. Worth deciding deliberately rather than by reflex — and
   worth asking whether the desktop board should even fill the window width, which brings us to the
   layout options.

---

## 7. Candidate approaches, with honest trade-offs

### Option A — "Fix the camera only" (the minimum honest fix)

Change `camFrame()` so a full-board shot stays **square** and letterboxes inside the wide strip,
letting `preserveAspectRatio="xMidYMin meet"` (already set, `stage.js:937`) do the fitting. Fix
`camFitCells()` to check vertical fit too.

- **Effort:** small. Two functions in one file. Maybe a day.
- **What you get:** the board fits, the director stops cropping legal moves. The game becomes
  *playable* on a laptop.
- **What you don't get:** on a 1440×900 window the board is a ~567px square with roughly 440px of
  empty background on each side, while a full-width captains bar and full-width ribbon still stretch
  behind it. It will read as an unfinished page rather than a designed one.
- **Verdict:** worth doing regardless, because every other option needs it too. But shipping only
  this would look like a bug, not a desktop version.

### Option B — "Scale up the phone frame" (letterbox the whole stage)

Wrap the entire stage in a phone-shaped column — say `max-width: 520px`, centred, with the sea or
framing art either side — and make everything position against **that box** instead of the viewport.

The enabling detail, and it's a genuinely lucky one: **almost every measurement in `/4` already
routes through two functions**, `vwPx()` and `vhPx()` at `4/src/ui/util.js:1236-1237`. They were
written to dodge a Safari pinch-zoom bug, and they are exactly the chokepoint you'd want here.
Point them at a stage rect instead of the window, wrap the `position:fixed` elements in a
containing block, and the great majority of the layout follows for free.

- **Effort:** moderate. One helper change, one wrapper element, then chasing the handful of places
  that use `100vw`/`vw` units in CSS directly rather than the helpers.
- **What you get:** every measured placement, every tuned pixel, every playtest finding from 23
  rounds of mobile work continues to be correct. **Near-zero risk of regression.** Ships fast.
- **What you don't get:** a 27" monitor showing a phone. Whether that's charming (framed like a
  handheld object, an arcade cabinet, a game on a table) or embarrassing is entirely a taste call,
  and it's Wyatt's.
- **Verdict:** the pragmatic option, and a real design position if the framing art is good. Also
  makes the asset problem vanish — a 520px board is *never* upscaled.

### Option C — "True widescreen stage" (board left/centre, panels flanking)

Board becomes a square sized to the available **height** (the shape it wants to be). The captains
box moves from a bottom bar to a right-hand column. Ribbon/wind pill become a corner HUD. The
radial fan and narration bubbles need no change at all — they already follow the boat.

- **Effort:** large. It is a second layout mode with its own bugs, and every one of the ~35 measured
  placement sites in §3 needs re-checking at desktop sizes.
- **What helps a lot:** `boardBand()` (`stage.js:466-472`) is already the *single* definition of
  "where the board is visible," with three consumers, added deliberately as a rule rather than a
  patch. Teaching it a horizontal variant is one function, not thirty.
- **What also helps:** v1's `layoutWide` (`index.html:135-141`) and `syncBoardSizing()`
  (`board.js:2031`) are **already in the file and already work**. The house has solved
  board-plus-sidebar once and could reuse the shape.
- **What you get:** a genuine desktop game. Bigger board, everything readable, the width earns its
  keep.
- **What it costs beyond layout:** the furniture sizes are literal pixels in ~60 places (66px
  circles, 290px bubbles, 250px captains band, 13px pill). None of them scale. A desktop that
  simply *works* will still look like phone chrome dropped onto a big canvas unless those become a
  scalable unit.
- **Verdict:** the right answer if desktop is a first-class target rather than a courtesy.

### Option D — "Fluid, let it stretch"

This is what happens today. It crops the board. Not viable.

### Option E — Recommended shape: **A, then B or C, plus a scale unit**

1. **Fix the camera first (A).** It's required by every path, it's small, and it turns "broken" into
   "playable" on its own.
2. **Introduce one scale unit** — a `--u` custom property (or a root font-size) derived from the
   stage width — and convert the ~60 hardcoded furniture pixels to it. This is the piece that
   decides whether the desktop build looks *designed* or looks *stretched*, and it's independent of
   which layout you pick. It's also mechanical, reviewable work.
3. **Then pick B or C** — that is genuinely a design decision, not an engineering one.

Note that B and C are not mutually exclusive over time: B ships in days and is fully reversible; C
can replace it later without B having been wasted, because the `vwPx()/vhPx()` indirection B
introduces is also what C needs.

---

## 8. Questions worth putting to Wyatt before anything is built

Following the standing rule — these are the ones where a different answer changes what gets built,
and each carries its measurement:

1. **On a 1440×900 laptop the board strip is 567px tall and 1440px wide. A square board fills 567 of
   those 1440 px — 40% of the width, with 440px of empty sea on each side. Is that "the board in a
   sea", or is that "a phone stuck in the middle of my screen"?** (This is the B-vs-C fork.)
2. **The captains box is currently a bar glued to the bottom, 250px tall and as wide as the window.
   On desktop, does it stay a bar, or become a column down the right-hand side?** (This is the
   single biggest visual change in Option C.)
3. **The action circles are 66px with 9.5px labels — sized for a thumb. On a mouse-driven screen
   they could be smaller (a mouse is precise) or bigger (the screen is bigger). Which?**
4. **`board.png` is 2132×2132 and 4.5 MB, and starts looking soft above about 1500px on screen.
   Re-exporting at 4096² would put it near 16 MB on a game with no build step. Is a soft board at
   2560 acceptable, or is that worth the download?**
5. **Should desktop get anything mobile doesn't — scroll-wheel zoom, keyboard sailing, hover
   previews on islands — or is the goal strictly "the same game, correctly sized"?**

---

## 9. One-line summary of the finding

`/4` has no desktop layout at all — not a broken one, an absent one (zero `min-width` queries, zero
orientation queries, zero pointer/hover queries) — and its camera takes its shape directly from the
window's, so on any landscape screen the board is cropped to a horizontal slice that the "fit the
whole board" control is mathematically unable to undo.
