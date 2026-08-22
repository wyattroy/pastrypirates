# Pastry Pirates — the laser-cut set

A physical Pastry Pirates as vector files ready for Rhino (SVG and DXF), black and white, two
layers: **CUT** (red hairline) and **RASTER** (black fill, engrave). Styled after the game's own art
— Wyatt, 2026-08-22: *"It should be piratey and match the online game as closely as you can."*

**This folder lives on branch `physical-board` and never on `main`** (players of the digital game
should not see this work). On `main` the folder is git-ignored.

**Start here:** open [`index.html`](index.html) in a browser. The assembled board, the cutting
sheets, and every group of pieces; tick "approved" per group, leave notes, copy the lot as text.

## What is borrowed from the screen, and how

| On the screen | On the wood |
|---|---|
| The ingredient drawings (`assets/ingredients/*.png`) | **The tokens ARE the drawings**, cut along their own outline, the ink engraved — traced by [`art/trace.py`](art/trace.py). One sits on each island square, as in the game. |
| Georgia (recipe titles, flavour) and Avenir Next (labels) | Every word on the wood, as outlines extracted by [`fonts/extract.py`](fonts/extract.py): recipe names and *Tortuga* in Georgia Bold, "Recipe No. 7" in Georgia Italic, compass letters and the rules card in Avenir Next. |
| The 21 named recipes (`4/src/ui/recipe.js`) | The 21 recipe cards, by name, with each ingredient's silhouette in the app's rounded-square chip. |
| Islands: wavy sand edge, grass, palms, rocks | Cut outline gently waved (straight where a dock moors), sand band, grass tufts, a palm, a rock. |
| The pier (`assets/dock.png`): upright planks, corner posts, an anchor | The dock tile's engraving. |
| The wind chevron (`assets/wind-arrow.png`) | One per ring square, rotated to the ring's clockwise tangent as `buildRimFlow()` does. |
| The whirlpool (`assets/trade-swirl.png`) | Two-armed swirl on the four whirlpool tiles. |
| The board's concentric ripples | Five fine wavy rings on open water between the berths and the rim. |
| The compass: scrolled ring, N/E/S/W medallions, fleur-de-lis needle | The spinner's dial and needle. |
| The boats: jib and mainsail, hull with portholes | The ship discs, told apart by the sail patterns. |

## The pieces — V3 · The Round Table, 25 mm squares

**Board, 6 mm, Ø 409 mm, in five pieces.** Four identical jigsaw quadrants (three knobs per seam;
seams follow the grid lines that frame Tortuga's square, so every square — berths and rim included —
is whole on one piece) and Tortuga as the fifth piece, a 24.9 mm plug that drops into the hole they
leave. Scrabble-sized (Scrabble is 381 mm; Monopoly 508).

**On the board, 6 mm:** 7 islands (the seven footprints, with a slot on every outside edge), 7 docks
+ 7 mooring posts (butt the dock to any island edge, drop the post through both slots), 28
ingredient tokens (four per ingredient: three to stock an island, one black-market spare), 4
whirlpool tiles, 4 ship discs.

**Thin parts, 3 mm:**
- **Wind spinner, nested.** A 96 mm backing disc; the game's compass as a 70 mm dial glued onto it,
  with a storm wedge in the last fifth of each quadrant (the app's 20%); a ring that turns around the
  dial with a fleur-de-lis pointer — *this round's wind*; a fleur-de-lis needle on the centre pivot —
  *the forecast*. Stack: backing → dial and ring (same level) → needle → washer; one M3 × 16 bolt
  and nyloc nut. Two layers of wood, one pivot.
- **Cargo crates, 4.** Open box-jointed crates, 44 × 30 × 18 mm, plank-engraved, the captain's mark
  on the front. Tokens stand on edge in them, five across, icons showing — cargo is public in the game.
- **Treasure chests, 4.** 80 × 54 × 30 mm: a box-jointed body (20 mm) and lid (10 mm) hinged on a
  3 mm dowel (a bamboo skewer) through five knuckles. The lid is a shallow box: your recipe card lies
  inside it against the top, held by two rails glued to the lid's end walls along the engraved line,
  so only you read it when you open the chest. Straps, rivets, lock plate, and the captain's name.
- 21 recipe cards (64 × 38), a rules card, a storm-cloud token, a first-player ship's wheel.

**Captains:** CRUMBLE plain, BISCOTTI striped, GINGERSNAP dotted, SHORTBREAD checked — the same four
marks on each captain's ship, crate and chest.

## Cutting

- **Kerf 0.18 mm**, compensated on the cutting sheets only: every cut line is pushed 0.09 mm away
  from the wood that stays (outward on outlines, inward on holes). Knob/socket play is 0.1 mm.
- **600 × 400 mm bed.** Sheets 1–2 are 6 mm, sheets 3–4 are 3 mm. Cut on the red line.
- Design views (`board-assembled`, `islands`, …) carry no kerf and say so in their `<desc>`.

```bash
node physical-board/generate.mjs                          # 25 mm, 6 mm / 3 mm, kerf 0.18, 600x400
node physical-board/generate.mjs --cell 30 --kerf 0.2 --bedw 900 --bedh 600
python3 physical-board/art/trace.py physical-board/art/ingredients.json   # re-trace the art
python3 physical-board/fonts/extract.py physical-board/fonts/glyphs.json  # re-extract the fonts
```

## Opening in Rhino

- **SVG**: `Import`; millimetres; `CUT` and `RASTER` are layer-named groups.
- **DXF**: R12, layers `CUT` (colour 1) and `RASTER` (colour 7), polylines. Set units to mm.
- Red hairline = cut. Black fill = engrave.

## Assembly

**Board.** Lock the four quadrants (any quadrant fits any position — match the engraving), then press
Tortuga into the centre hole last.

**Crates and chests.** Box joints; glue. Chest: glue the two card rails to the inside of the lid's
end walls with their top edge on the engraved line, slide the dowel through the five knuckles.

## How the physical rules differ from the app

- **Whirlpools.** The app splits the ring into four arcs of random length. On the table: put the
  four whirlpool tiles on any four ring squares; a ship that enters the ring is carried clockwise
  to the next whirlpool.
- **Wind and forecast.** At the start of a round, turn the ring's pointer to where the needle points,
  then spin the needle. If it lands in a storm wedge, put the storm cloud on the board and leave the
  needle; when that round begins, spin the ring itself — the storm blows that way, three squares,
  every ship (the app hides a coming storm's direction too).

## Not built, on purpose

The Gold Bullion flip coin and the gold coins (you have them), the 50 sea-creature cards for the
Pass action (a print job), a captain's screen (the chest lid does that job now).
