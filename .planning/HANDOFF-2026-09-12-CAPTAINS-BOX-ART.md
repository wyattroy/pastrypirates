# HANDOFF — the captain's box background, three pictures, measured

**For a cleared session. You need nothing from the conversation that produced this file.**
Wyatt, 2026-09-12, looking at the fourth captain cut off the bottom of a mock-up:

> *"This process is not working. … look how messy your design is. you're missing a full row of the
> captain's box, your design wastes a gratuitous amount of space on the edges, and it doesn't make
> sense. write a handoff prompt to a cleared session that details what we need: a background for the
> new captain's box that incorporates a rope border with distressed wood background and looks
> consistent at three different screen size aspect ratios; then generate those three according to the
> actual aspect ratios required and show me in the captain's box tuner."*

---

## 1. What the picture is for

The **captain's box** is the panel at the bottom of the screen (or in a column beside the board on a
wide screen) that shows, for every voyage, **always four captains**: a recipe band across the top,
then four rows — name, coins, and that captain's hold of ingredient crates. It never shows two or
three captains; `appState.numSeats` is 4 and every start path fills the seats with bots.

The picture is the **background of that whole panel**: a distressed wooden board with a rope border
running around its outside edge. The rows are drawn on top of the wood, inside the rope.

**One picture per screen class, drawn once, scaled uniformly to the box's width.** No nine-slice, no
repeated edges, no separate wood tile, no corner pieces painted back on. That machinery was tried
three times and failed three times; Wyatt replaced it himself:

> *"would it not be more efficient to simply generate two differnt sizes of source asset, which work
> for the two sizzes of captians box in the different screen layouts"*

---

## 2. The measurements — these are read off the running game, not guessed

Measured 2026-09-12 by posing a real solo voyage (four captains) at five screen sizes and reading the
rendered box. Script: `scratchpad/_capbox_shape.mjs`.

| screen | box width | height the rows need | rows | what it is |
|---|---|---|---|---|
| phone 390×844 | **390** (full bleed) | **204px** | 4 × 32 | band 31+4, gaps 3, padding 12+20 |
| phone 390×664 | 390 | 204 | 4 × 32 | ⚠ box is clamped to 188 here — see §6 |
| laptop column 1280×800 | **482** | **255px** | 4 × 40 | band 37+6, gaps 4, padding 20+20 |
| wide desktop 1920×1080 | **540** | 255 | 4 × 40 | same column, wider |
| tablet 768×1024 | **749** (wall to wall) | **255px** | 4 × 40 | same rows as desktop |

**The rope adds to those heights.** The 24-screen-pixel rope below is **a choice, not a measurement** —
it is the one number in this table that was not read off anything. It is set the same in all three
pictures so the rope reads as the same rope on every device; round 4 came back thinner than that
(about 13px at a 390px box), which is why the tuner now also prints the tightest shape each box
could take at the rope it actually has. So:

| # | serves | box, on screen | **aspect to generate** | canvas | rope in the canvas | twists along the top |
|---|---|---|---|---|---|---|
| **A** | phones, 320–430 wide | 390 × 252 | **1.55 : 1** | **2048 × 1321** | **126 px** | ~16 |
| **B** | the laptop column, 482–540 wide | 511 × 303 | **1.69 : 1** | **2048 × 1212** | **96 px** | ~21 |
| **C** | tablet, wall to wall, ~700–780 | 749 × 303 | **2.47 : 1** | **2048 × 829** | **66 px** | ~31 |

**Be honest with him about this:** A and B are within 5% of the same shape. Three pictures is what he
asked for and the third costs one more generation, but if one of them reads better than the others,
two would genuinely cover the game.

---

## 3. The art direction

**Style:** the same world as the approved ingredient crate (`art-review/captains-box/crate-1.jpeg`) —
hand-painted, warm, storybook, no photographic realism, no vector flatness.

- **One solid wooden board.** Not a frame with a hole in it. Wyatt: *"we want the plaque to look like
  a full wooden board -- like the original shot clock had -- not some weird thing with a hollow
  centre."* Horizontal planks, visible seams, honey-brown (`#ba7a40` family).
- **Weathered and dark.** His round-3 note: *"make the whole thing look more weathered, and a little
  darker."* Grain, salt bleaching, scuffs, a few nail heads — but **the middle two thirds must stay
  quiet**, because four rows of names, coins and crates are drawn on top of it. Put the character at
  the edges and in the grain, never a knot or a bright highlight in the middle.
- **The rope IS the outer edge.** It touches all four edges of the picture. Nothing outside it — no
  teal, no navy, no outer frame line, no drop shadow, no margin. That painted outer band is most of
  the *"gratuitous amount of space on the edges"* he is complaining about.
- **No corner knots, no brass rings, no bosses.** The rope turns the corner as a plain rounded turn.
  The knots in the earlier rounds are what forced the border to be fat enough to hold them; they cost
  a quarter of the box's height.
- **Twist size is specified above and it matters.** Round 1 was rejected for exactly this: *"the rope
  is much too small and isn't legible -- it looks good at the scale of the source square, but when you
  scale it up to the size of the box we lose a lot of its nice detail."* One twist per rope-thickness.
- **Transparent or flat background outside the picture: none needed** — the picture is a rectangle,
  filled edge to edge.

**A prompt that carries all of it** (swap the three numbers per picture):

> A hand-painted storybook pirate plaque, seen straight on, filling the whole frame. A single solid
> board of weathered honey-brown timber in horizontal planks with visible seams, salt-bleached and
> darkened with age, grain and scuffs and a few old nail heads — the centre of the board calm and
> even, with no knots or bright highlights, because text will be placed over it. A thick twisted
> ship's rope runs around all four edges of the picture as a border, its outer edge flush with the
> edge of the frame; the rope is about 126 pixels thick on a 2048-pixel-wide image, with about 16
> full twists along the top edge, and it turns each corner as a simple rounded bend — no knots, no
> rings, no metal. Nothing outside the rope. Warm painted illustration, no photorealism.
> Aspect ratio 1.55:1.

---

## 4. How to judge it before showing him

**Art for a UI slot is judged at the slot's size.** Never show him the source square.

1. Drop the picture into the tuner at `scratchpad/capbox-tuner.html` (published as artifact
   `219b5862-3265-4432-b9a8-f28457ba7d48`). It draws the real box — real recipe band with the recipe
   card's stained-parchment gradient, four rows, captain colours, coins, and holds bunched by the real
   rule — over the picture at the real box widths.
2. The tuner's readout tells you whether the rows fit inside the board. **If it says SHORT, the
   picture is the wrong shape — do not show him.** Regenerate.
3. Check it at **390, 482, 540 and 749 px wide**, four captains every time.

---

## 5. His standing rulings that this work keeps breaking

- **Four rows, always.** A mock may only show a state the game can reach.
- **A preview must be the real game scenario**, at the real size, never the source square.
- **The crates in the preview run his rule**: 22/26px crates, 3px gap, squeeze evenly but never past
  35% overlap, then the line scrolls with a fade. When they overlap, **the crate further RIGHT sits on
  top** — the one earlier notes call "newest" is not newest at all: another captain's hold is sorted
  alphabetically (`src/ui/board.js:1798`) and your own runs in recipe order (`:1784`).
- **The "Bake this!" pill covering the recipe name is deliberate** — it is the confirmation button.
  Never file it as a fault.
- **The fill behind the captain rows is ~25% opaque** so the wood reads through.

Full record: `.claude/memory/DECISIONS.md`, 2026-09-10 through 2026-09-12.

---

## 6. One real bug found while measuring, unrelated to the art

At **390×664** (a small phone, or any short window) the captain's box is clamped to **188px** tall
while its contents need **197px** — so **the fourth captain is cut off in the real game**, not just in
the mock-up. The clamp is `cap.style.setProperty("max-height", …)` in `src/ui/stage.js:3159`, the
phone/tablet branch — *not* the `#pp4Col` rule at index.html:1765, which only applies on a wide
screen where `pp4Side` is set. Measured, not theorised. On the backlog as of 2026-09-12.

---

## 7. How the art is generated

Gemini, through Chrome, on Wyatt's **personal** Google account (wyatty@gmail.com). The work account
(wyatt@polycam.ai) renders pale and dusty and its downloads never land — a whole round was lost to
this. Runbook: `notes/art-generation-process.md`. Finished pictures are committed to
`art-review/captains-box/` because they cannot be remade.
