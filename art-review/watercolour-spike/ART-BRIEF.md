# Board Restyle — Artist Brief

Handoff document for restyling the Pastry Pirates board scenery to match the watercolour
board (`board-watercolour.png` in this folder). Written from the live rendering code so an
artist can work without reading any of it.

**Status:** the AI pipeline was tried and abandoned. A human artist is producing the real
artwork. Everything below is the technical contract the art has to satisfy — it holds
regardless of who paints it or how.

---

## 1. What actually needs repainting

The board looks like it has a dozen islands, but the game only stores **seven** island
paintings — one per shape — and reuses them by rotating and mirroring. Same with docks:
one painting, reused for all eight.

| Asset | Files | Current location |
|---|---|---|
| Islands | 7 | `assets/islands/1.png` … `7.png` |
| Dock | 1 | `assets/dock.png` |
| Compass | 2 | `assets/compass/compass-dial.png`, `compass-needle.png` |

**Ten images total.** The board itself is already done.

Deliberately *not* on this list: ingredient crates and boats. See §5.

---

## 2. Island shapes and sizes

The board is a 15×15 grid. Each island is a fixed arrangement of grid squares. Paint each
shape to the **bounding box** of its arrangement — the game stretches the image to fit that
box exactly, so a wrong aspect ratio will visibly squash the art.

```
Shape 1 — 3×1            Shape 2 — 2×2            Shape 3 — 4×1
  ███                      ██                       ████
                           █

Shape 4 — 2×2            Shape 5 — 3×2            Shape 6 — 3×2
  ██                       ███                      ██·
  ██                       █··                      ·██

Shape 7 — 3×2
  ███
  ·█·
```

| Shape | Grid | Aspect | Suggested canvas | Current file |
|---|---|---|---|---|
| 1 | 3×1 | 3:1 | 1200 × 400 | 1093 × 394 |
| 2 | 2×2 | 1:1 | 800 × 800 | 307 × 297 |
| 3 | 4×1 | 4:1 | 1600 × 400 | 1463 × 399 |
| 4 | 2×2 | 1:1 | 800 × 800 | 297 × 286 |
| 5 | 3×2 | 3:2 | 1200 × 800 | 1054 × 534 |
| 6 | 3×2 | 3:2 | 1200 × 800 | 341 × 304 |
| 7 | 3×2 | 3:2 | 1200 × 800 | 340 × 291 |

The suggested canvases are a consistent 400px per grid square, which is roughly 4× the
on-screen size and gives retina headroom. The existing files are inconsistent (some as low
as 150px per square) and shapes 5–7 were painted at the wrong ratio and are being stretched
today — worth fixing in the new set.

---

## 3. Technical constraints

**Transparent PNG.** The area outside the island must be fully transparent — the ocean shows
through it.

**The game trims the art to the grid shape.** It builds a rounded outline of the island's
squares (corner radius ≈ 32% of one square) and clips the painting to it. Two consequences:

- Anything painted outside the shape is silently cut off. Don't rely on it.
- The art does *not* need a pixel-accurate silhouette. Paint the island filling its bounding
  box with soft organic edges and the clip handles the rest — that's the safety net, not the
  design. A painted edge that sits *inside* the clip is what you'll actually see, so the
  island's own outline is still the one that reads.

**Orientation-agnostic.** The game rotates each island in 90° steps and mirrors it
horizontally, independently per game. So:

- No text, no lettering, no signage.
- No lighting direction that only works one way up. Even, flat light.
- No "this is the top of the island" composition. It will be upside down half the time.

**Keep the middles calm.** An ingredient crate is drawn on top of every island square,
centred, at 80% of a square. Detailed painting under a crate is wasted and makes the crate
harder to read.

**Dock** is one image reused for all eight berths, rotated and mirrored to face its island,
and it stretches across the shared edge between the dock square and the island. It should
read correctly at any of the four rotations.

**Compass needle** spins around the exact geometric centre of its canvas. If the pivot/hub
isn't dead-centre in the image, the needle visibly wobbles instead of turning cleanly. This
has bitten a previous batch — measure it, don't eyeball it.

---

## 4. Style reference

The board (`board-watercolour.png`) is the anchor. Sampled palette from it:

| | Hex |
|---|---|
| Deep ocean (outer) | `#3a7499` |
| Mid ocean | `#5c96ab` |
| Pale lagoon | `#82c3c7` |
| Lagoon centre | `#89c5c4` |
| Island sand | `#e7c779` |
| Sun-baked sand | `#d09760` |

Soft translucent washes, visible cold-press paper grain, feathered edges. **No hard ink
outlines** — that single property is what made the old cartoon scenery clash with the new
board.

---

## 5. The style rule worth keeping

**Scenery is watercolour. Things that move or that you interact with stay bold.**

Islands, docks and the board are background — soft, low-contrast, painterly. Ingredient
crates and boats keep their hard outlines and saturated colour, so they pop off the
background and stay readable at a glance.

This was tested and it works. The clash people notice isn't cartoon-next-to-watercolour —
it's the *scenery* being split between two styles. Leaving the crates and boats alone is a
deliberate choice, not an unfinished job.

---

## 6. Critique of the AI attempt (what to avoid)

One island was generated and rendered in-game (`island-shape3-raw.png` /
`island-shape3-keyed.png`). The style matched the board well — the sand rim dissolved into
the sea and the seam disappeared. Two problems killed it:

1. **Too pale.** The green interior came out as a faint tint rather than actual grass. Next
   to the existing art the islands read as bare sandbars.
2. **Not enough contrast against the water.** At a glance the islands were hard to pick out —
   and worse near the pale lagoon at the centre of the board, where a light island on light
   water nearly disappears. That's a playability problem, not a taste one.

**So: soft edges, yes. Washed-out, no.** The islands still have to read as land instantly,
including against the palest part of the board. A stronger green interior and a deeper, warmer
sand rim are the fix.

---

## 7. Appendix — the prompt block used

Kept only as a record of what was tried. Not needed for a human artist.

> Loose hand-painted watercolour game art, warm and playful pirate-nautical theme. Soft
> translucent washes layered wet-on-wet, visible cold-press paper grain and pigment
> granulation, gently feathered edges that bleed into the paper — NO hard ink outlines, no
> black linework, no crisp vector edges. Muted coastal palette (deep sea blue #3a7499, mid
> ocean #5c96ab, pale lagoon #82c3c7, warm sand #e7c779, sun-baked sand #d09760, soft sage
> green, chalky cream). Colours gentle and slightly desaturated, like a children's
> picture-book map — never neon or glossy. Even soft light, minimal shading, no harsh
> shadows, no photorealism, no 3D rendering. Kid-appropriate and charming. Centered subject
> on a solid flat chroma-key near-black background (hex #000001, no gradient, no shadow, no
> vignette) — the paper texture belongs inside the painted subject only; the surrounding
> background must be flat near-black. No text or lettering anywhere in the image.

`key_island.py` in this folder converts a near-black-background generation into a
transparent, correctly-sized game asset:

```bash
python3 key_island.py <input.png> <output.png> <long-side-px>
```
