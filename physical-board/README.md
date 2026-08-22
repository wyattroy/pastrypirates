# Pastry Pirates — the laser-cut set

A physical Pastry Pirates as vector files ready for Rhino (SVG and DXF), black and white, two
layers: **CUT** (red hairline) and **RASTER** (black fill, engrave). Styled after the game's own art
— Wyatt, 2026-08-22: *"It should be piratey and match the online game as closely as you can."*

**This folder lives on branch `physical-board` and never on `main`** (players of the digital game
should not see this work). On `main` the folder is git-ignored.

**Start here:** open [`index.html`](index.html) in a browser. The assembled board, mockups of the
assembled ship, chest, spinner, crate and the board on the table, the cutting sheets, and every
group of pieces; tick "approved" per group, leave notes, copy the lot as text.

## What is borrowed from the screen, and how

| On the screen | On the wood |
|---|---|
| The ingredient drawings (`assets/ingredients/*.png`) | **The tokens ARE the drawings**, cut along their own outline, the ink engraved — traced by [`art/trace.py`](art/trace.py). Outlines only on the cocoa, for painting. One sits on each island square, as in the game. The recipe cards use the same ink inside the app's rounded-square chip. |
| Georgia (recipe titles, flavour) and Avenir Next (labels) | Every word on the wood, as outlines extracted by [`fonts/extract.py`](fonts/extract.py): recipe names and *Tortuga* in Georgia Bold, "Recipe No. 7" in Georgia Italic, compass letters and the rules card in Avenir Next. |
| The 21 named recipes (`4/src/ui/recipe.js`) | The 21 recipe cards, by name, with each ingredient's silhouette in the app's rounded-square chip. |
| Islands (per Wyatt's drawing, `notes/docknotch.jpeg`) | A gently wavy rounded coast is the cut; a thin sand line runs 4 mm inside it; grass tufts, a palm and a rock engraved; a plain 9 × 2.5 mm notch mid-edge on every outside square, between the cut and the line. |
| The pier (`assets/dock.png`): upright planks, corner posts | The dock tile's engraving; the planks run onto the tab that nests into the island. |
| The wind chevron (`assets/wind-arrow.png`) | One per ring square, rotated to the ring's clockwise tangent as `buildRimFlow()` does. |
| The whirlpool (`assets/trade-swirl.png`) | Traced and engraved on the four whirlpool tiles. |
| The board's water: short brushy wave strokes in concentric passes | About 170 tapered strokes, 9 mm between passes, from outside the berths to the rim. |
| The compass: scrolled ring, N/E/S/W medallions, fleur-de-lis needle | The spinner's dial and needle. |
| The pirate ship (`assets/icons/sailboat.png`): square sail with the skull and bones | Three-piece ships: a 6 mm hull seen from above with two slots across the beam, two 3 mm square sails that drop in, the game's skull (`assets/icons/skull.png`) over crossed bones on each, the captain's mark along the foot. |
| The 🌩️ emoji (rendered by Chrome on black into `art/storm-emoji.png`) and the coin (`assets/icons/`) | Traced: the emoji's cloud-and-bolt silhouette is knocked out of each storm wedge and is the storm token (bolt engraved); the coin stands in for every coin amount on the rules card. |

## The pieces — V3 · The Round Table, 25 mm squares

**Board, 6 mm, Ø 409 mm, in four pieces, plus Tortuga on top.** Four jigsaw quadrants (three knobs
per seam; seams follow the grid lines that frame Tortuga's square, so every square is whole on one
piece; the north-west quadrant carries the centre square). **Tortuga is a +-shaped 6 mm piece** —
anchor and name in the middle, a berth on each arm — that sits on the board like the islands do,
over a dotted outline that shows where it goes. Scrabble-sized (Scrabble is 381 mm; Monopoly 508).

**On the board, 6 mm:** 9 islands — every tetromino orientation: the app's seven footprints plus the
mirror images of the L and the S (a flipped piece would show its blank back); seven go out each
voyage. A plain 9 × 2.5 mm notch in the middle of every outside edge — shallower than the engraved
line, so no cut meets engraving. 7 docks, each a pier whose 9 mm deck becomes the tab, planks running
to the tab's end, bollards touching the deck; 0.15 mm of play. 28 ingredient tokens
(four per ingredient: three to stock an island, one black-market spare; three padding options A/B/C are on the
page — the sheets carry B until Wyatt picks). 4 ship hulls (24 × 12 mm,
plan view, deck planks, two slots).

**On the board, 3 mm:** 4 whirlpool tiles; 8 sails — a mainsail and a jib per ship, each with a tab
that drops through a hull slot and sits flush underneath; the ship stands about 30 mm tall.

**Thin parts, 3 mm:**
- **Wind spinner, nested.** A 96 mm backing disc; the game's compass as a 70 mm dial glued onto it,
  with a storm wedge in the last fifth of each quadrant (the app's 20%); a ring that turns around the
  dial — *this round's wind* — carrying a slot for the **WIND NOW vane**: a pennant on a 30 mm mast
  that drops into the slot and stands on the backing, streaming toward the letter the ring is set to
  (put the pennant on the inside). The *forecast* is the flat needle on the centre pivot — a
  fleur-de-lis head one way and the same outline the other, on a 9 mm hub, so it balances on the
  axle and the hole leaves 2.85 mm of wood all round. Stack: backing → dial and ring (same level) → needle →
  washer; one M3 × 16 bolt and nyloc nut. Two layers of wood, one pivot, one flag.
- **Cargo crates, 4.** Slatted crates like the classic wooden one, 44 × 30 × 18 mm: three slats a
  side with real gaps cut between them, solid corner posts, box joints, the captain's mark on the
  front. Tokens stand on edge in them, icons showing — cargo is public in the game.
- **Treasure chests, 4.** 80 × 54 × 30 mm: a box-jointed body (20 mm) and lid (10 mm) hinged on a
  3 mm dowel (a bamboo skewer) through five knuckles. The lid is a shallow box: your recipe card lies
  inside it against the top, held by two rails glued to the lid's end walls along the engraved line,
  so only you read it when you open the chest. Straps, rivets, lock plate, the captain's mark (no
  names — players choose their own). Assembly labels face the inside: corners 1–4 clockwise from
  front-left (L1, L2 on the lid), a wall's bottom names the plate edge it meets (B·F = base front,
  T·K = lid top back), H = the hinge. The lid's back is a hinge strip under the top plate (2.4 mm
  body, fingers into the plate) whose tongues hang between the chest's.
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

**Ships.** Drop the mainsail into the aft slot and the jib into the forward one; no glue needed.

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
