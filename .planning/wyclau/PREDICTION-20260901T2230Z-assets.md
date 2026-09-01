# Prediction, written BEFORE the measurement — INBOX-20260901T1335Z, the compression half

*Watch 2026-09-01T22:10Z, Wy-Blade. Rule 6's working form: write down what you expect and why, name
what would prove you wrong, THEN measure, then say plainly which parts were wrong.*

## What is already known, measured, not assumed

- `assets/` is **17.79 MB across 149 images** (`scripts/qa/asset_weight_report.mjs`). His "about
  18mb from memory" was right.
- The **preload half of this item already shipped** — `efa1f2f5`, the previous watch, added the 21
  recipe illustrations and the award emblems to `preloadAssets()`. **This watch owns the
  compression half only**, which that watch declared blocked for want of an image tool. It is not
  blocked: **ffmpeg is on this machine** (`/c/Users/wyatt/AppData/Local/Microsoft/WinGet/Links/ffmpeg`).
- `scripts/qa/asset_alpha_probe.mjs` (new, decodes IDAT with node's own zlib — no dependency):
  **`assets/board.png` is 2132×2132 RGBA and 0.0% of its pixels are anything but fully opaque.**
  It carries an alpha channel it never uses. Every other family measured has real cut-out
  transparency (pastries 29.5%, boats 50.3%, wind-arrow 93.6%, badges 98.0%).

## The predictions

1. **Dropping board.png's unused alpha will save LITTLE — under 10%.** The alpha plane is a
   constant 255 across 4.5M pixels, and a constant plane is exactly what DEFLATE annihilates; it
   is probably already costing only a few KB. The real lever on this file will be the encoder
   (filter choice / compression effort), not the channel count.
   **What proves me wrong:** board.png falling below ~3.5 MB on alpha removal alone.

2. **Every other family genuinely needs alpha, so none of them can become a JPEG.** The honest
   lever there is a lossy *alpha-capable* format (WebP) or palette quantization.

3. **Palette quantization (256 colours) will be VISIBLE on the pastry art** — they are soft-shaded
   painted illustrations, which is the worst case for banding, and they are drawn as large as
   220 CSS px tall in the recipe modal.
   **What proves me wrong:** a quantized pastry that is indistinguishable from the original in a
   posed screenshot at its real drawn size.

4. **Most files are NOT meaningfully oversized, and the "resize everything" reading of his
   instruction would make the game look worse.** Read from the CSS, with line citations:
   - `.narrIcon` is `18×18` (`index.html:307`) and `.ccIcon img` `29×29` (`:1436`) — the 128px
     icons ARE oversized for these, at ~4× a 3×-DPR budget.
   - but the flip coin reaches `clamp(54px,19.5cqw,96px)` × `--pp4CerZoom: 2.2` = **211 CSS px**
     (`index.html:713,1260,715,2127`), so `coin-spin.png` at 384 is *under* a 3× budget already.
   - `.recipeModalThumb` is `height:220px` (`index.html:344`), so the 512px pastry art is likewise
     already under a 3× budget.
   - board-layer art (board, islands, dock, boats, wind-arrow, trade-swirl, compass) is drawn
     inside the zooming SVG board, so its on-screen size is not a fixed CSS box at all.
   **Prediction: the only family that is safely and provably resizable is `assets/icons/`, and
   only the sub-set drawn exclusively in small fixed CSS boxes.**
   **What proves me wrong:** finding a fixed CSS box that pins any other family well below its
   intrinsic size.

## What happened immediately before (rule: widen the horizon)

Nothing intermittent here — this is a static file question, not a race. The preceding event that
matters is the previous watch's tooling check concluding "no image tool", which is what left this
half open; the thing that changed is not the game but what is installed on this machine.
