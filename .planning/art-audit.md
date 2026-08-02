# Pastry Pirates — Art Asset Audit & Generation Runbook (Gemini + Chrome)

> **Moved 2026-08-02 from `notes/` to `.planning/`.** `notes/` is gitignored, so this file was
> invisible to everyone but Wyatt's own machine — while **ten-plus tracked planning documents
> linked to it**, including `.planning/codebase/STRUCTURE.md` and five Phase 21 files. Every one
> of those pointers led somewhere unreadable. Wyatt, 2026-08-02: *"move the art-audit note into
> .planning/ so it's shared."* Its sibling `art-generation-process.md` moved with it — they
> cross-reference each other and splitting them would have re-created the same problem.

A runbook for generating the game art that's still missing, using the Chrome browser to drive
Gemini image generation directly — no manual copy-pasting required. This doc is meant to be
executed end-to-end by the assistant on request ("execute the art audit"), producing a review
gallery for the user to give feedback on before anything is cropped or wired into the game.

---

## 0. Already exists — do not regenerate

Confirmed on disk in `assets/` and actively wired into `index.html` (via the `ASSET_BASE` /
`ING_IMG` / `BOARD_IMG` / etc. block, and the welcome-modal logo reference). None of the following
should ever be sent to Gemini again:

- **Ingredient crate tokens + holes** — `assets/ingredients/{wheat,dairy,sugar,eggs,cocoa,spice,vanilla}.png`
  and `assets/ingredients/holes/{same 7}.png` (14 files total). `salt`/`honey` have no art and stay
  that way — they're unused in the standard 7-island game.
- **Board** — `assets/board.png`
- **Islands** — `assets/islands/1.png` … `7.png`
- **Home dock** — `assets/dock.png`
- **Boats** — `assets/boats/1.png` … `4.png`
- **Wind arrows** — `assets/wind-arrow.png`
- **Trade-wind swirl** — `assets/trade-swirl.png`
- **Logo** — `assets/logo.jpg`
- **Sound / mute icons** — `assets/icons/sound-on.png`, `assets/icons/sound-off.png` (see §5.7)

If any of these ever need a refresh, that's a separate, explicit request — not part of this
runbook.

---

## 1. Execution workflow

When told to execute this doc, the assistant runs the following with no user input mid-batch:

1. **Drive Chrome to Gemini.** Use the Chrome browser tools to open `gemini.google.com/app`
   (assume the user's browser is already signed in). For each prompt below, submit it, wait for
   the image to render, then click Gemini's own in-page download button to save the **raw,
   unedited, uncropped** full-resolution image. (A browser screenshot cannot substitute for this —
   there's no way to get a screenshot's pixels onto disk in this setup — and a page-JS-triggered
   download is silently blocked by Chrome's automation protections. The in-page button is the only
   capture method that actually works.) This needs two one-time Chrome settings, not per-image:
   Settings → Downloads → "Ask where to save each file" **off**, and Settings → Downloads →
   **Location** set directly to the batch's staging folder inside the repo (e.g.
   `art-review/<batch>`). Gemini's in-page download button **honors** Chrome's configured Location
   (it does *not* force-save to `~/Downloads`), so once Location points at a repo folder, files land
   there directly and Bash reads them with no directory-access grant needed. This setting persists
   in the Chrome profile across sessions, so it's often already pointed at a *previous* batch's
   folder (e.g. `art-review/pastries`) — either update it to the current batch's folder, or just
   read downloads from wherever it currently points and move them. Note: `chrome://settings` is not
   reachable through the browser-automation tab (the navigate tool force-prefixes `https://` and
   breaks `chrome://` URLs), so changing Location is a manual step for the user, not something the
   assistant can drive — if the persisted Location is fine to read from, prefer that over asking the
   user to change it.
2. **Rename off the download.** Gemini names each download unpredictably (`Gemini_Generated_Image_<random>.png`).
   After each click, find the newest `Gemini_Generated_Image_*` file in Chrome's configured download
   folder (wherever Location currently points — inside the repo) and move+rename it into the batch's
   staging folder — don't rely on guessing the filename ahead of time.
3. **Stage, don't integrate.** The renamed file lands in `art-review/<batch>/<name>.png` at
   the repo root (e.g. `art-review/pastries/molten-chocolate-lava-cake.png`). Never write directly
   into `assets/` — nothing gets cropped, resized, background-removed, or wired into the game
   during generation. `art-review/` is disposable working output, not a committed asset — add it
   to `.gitignore` the first time it's created.
4. **Build the review gallery.** After each batch, generate/update `art-review/gallery.html`: a
   single static page listing every generated image so far, full-size, each with its label, the
   exact prompt used, and a `<textarea>` underneath for the user to type feedback while reviewing
   in-browser. Group by batch with a heading per section, in the priority order from §6.
5. **Stop for review.** After a batch is generated and the gallery is updated, stop and tell the
   user it's ready to review — don't proceed to crop/integrate/regenerate anything until they've
   given feedback per image (redo, tweak, or approve).
6. **On approval**, the follow-up work (cropping to the game's expected dimensions, chroma-keying
   out the flat near-black background per §2, dropping into `assets/`, wiring into `index.html`) is a
   separate step done after explicit per-image sign-off — not automatic. Crop and resize for real —
   these render at emoji scale in-game (often well under 100px), not at the 2048px generation size,
   so ship a tight crop at an actual efficient target resolution, not the raw file. See
   art-generation-process.md §7 for the technique (and the specific failure mode — a stray
   watermark/noise pixel throwing off a naive bounding box and baking in dead-space padding — that
   made this necessary) and its verify-before-showing requirement.

---

## 2. How to write each Gemini prompt (best practices)

- **Each prompt below is self-contained** — subject, art style, composition, palette, lighting,
  and background are all stated.
- **One shared style, one family.** Paste the **House Style** block (below) at the top of every
  prompt so the whole batch reads as one set. When Gemini supports it, generate a batch in one
  request ("a sheet of N icons in the same style…"); otherwise generate one, then say "same style
  as the previous image" for the rest of the batch.
- **Flat chroma-key framing, not transparency.** Gemini does not reliably output true alpha
  transparency — its in-app preview shows a checkerboard, but the actual generated image has a
  real (non-transparent) background. A bright chroma-key green is precise but unreviewable — it's
  too glaring to judge the actual art against, and clashes with everything. Ask instead for a
  **solid, flat near-black background, hex #000001, no gradient, no shadow, no vignette** — visually
  reads as plain black for review purposes (fine to judge art against), while being one hex digit
  off from true black so it's still uniquely identifiable for a later keying pass (key out
  near-black, threshold a few values wide to catch AI rendering noise, rather than an exact match).
- **Square by default (1:1)** unless a prompt says otherwise.
- **No text in the image.** Never ask Gemini to render words, numbers, or labels.
- **Match the existing hand-illustrated assets** (§0) — warm, storybook, hand-painted with soft
  outlines. New art must sit next to them without clashing — see House Style.

### House Style (prepend to every prompt)

> Hand-illustrated storybook game art, warm and playful pirate-nautical theme. Soft rounded shapes,
> gentle dark-teal outlines, hand-painted texture, cheerful saturated palette (sea teal #1d96a6,
> warm parchment #fff6c0, gold #f5a623, coral pink #f2679e, mint #27c78d, deep ink #1f4249).
> Friendly, kid-appropriate, slightly chunky proportions like a mobile board game. Even soft
> lighting from top-left, subtle painterly shading, no harsh photorealism. Centered subject, on a
> solid flat chroma-key near-black background (hex #000001, no gradient, no shadow, no vignette), no
> text or lettering anywhere in the image.

---

## 3. Recipe pastries (21 drawings) — batch: `pastries`

The heart of the game: each captain draws a recipe map and bakes a specific pastry. No art exists
for these yet at all. Draw the **finished pastry**, appetizing, on a small plate or bare (no
background scene), 1:1, on the flat chroma-key near-black background — these appear on recipe cards and
in the victory message. Keep them in the same warm storybook style as the ingredient crates (NOT
photoreal food). Each is listed with its 5 ingredients and flavor description to guide the drawing.

For each, the Gemini prompt is: **[House Style] A single finished [pastry], [key visual details
from description], appetizing storybook illustration, on a simple plate, 1:1 square, centered, on
a solid flat chroma-key near-black (#000001) background, no text.**

1. **Spiced Cocoa Shortbread** — [dairy, wheat, cocoa, sugar, spice] — buttery melt-in-mouth
   shortbread biscuits, warm cinnamon + rich cocoa; draw a stack of round cocoa-brown shortbread
   rounds with a cinnamon dusting.
2. **Molten Chocolate Lava Cake** — [dairy, wheat, cocoa, sugar, eggs] — small dark cake, cut open
   with oozing liquid fudge center, dusted with powdered sugar.
3. **Mayan Cocoa Soufflé** — [dairy, wheat, cocoa, spice, eggs] — tall dramatic dark-chocolate
   soufflé risen over a ramekin, cinnamon accent.
4. **Cinnamon-Sugar Churros** — [dairy, wheat, sugar, spice, eggs] — golden ridged churro sticks
   tossed in cinnamon-sugar, crossed on a plate.
5. **Mexican Chocolate Torte** — [dairy, cocoa, sugar, spice, eggs] — dense fudgy round chocolate
   cake slice, glossy, cinnamon dust.
6. **Spiced Fudge Brownies** — [wheat, cocoa, sugar, spice, eggs] — dark brownies with a shiny
   crackly crust, stacked squares.
7. **Caramel Slice** — [dairy, vanilla, wheat, cocoa, sugar] — three-layer bar: coconut shortbread
   base, chewy caramel middle, chocolate top; one square, side visible.
8. **Cinnamon Snaps** — [dairy, vanilla, wheat, cocoa, spice] — crisp rustic round butter biscuits,
   cinnamon-vanilla, a few stacked.
9. **Snickerdoodle Bites** — [dairy, vanilla, wheat, sugar, spice] — pillowy soft cookies rolled in
   cinnamon-sugar, crackled tops.
10. **Cinnamon-Chocolate Fudge** — [dairy, vanilla, cocoa, sugar, spice] — glossy chocolate fudge
    squares with a marbled cinnamon-vanilla swirl.
11. **Crispy Cocoa Snaps** — [vanilla, wheat, cocoa, sugar, spice] — thin dark snappy cookies,
    a couple leaning in a stack.
12. **Dark Chocolate Cream Puffs** — [dairy, vanilla, wheat, cocoa, eggs] — golden choux puffs
    filled with dark cream, dusted, a small pile.
13. **Pound Cake** — [dairy, vanilla, wheat, sugar, eggs] — dense golden loaf slice with a fine
    crumb and a thin vanilla-milk glaze drip.
14. **French Pots de Crème** — [dairy, vanilla, cocoa, sugar, eggs] — small ramekin of spoonable
    dark chocolate custard, a dollop of cream.
15. **Chocolate Genoise Sponge Cake** — [vanilla, wheat, cocoa, sugar, eggs] — light airy round
    chocolate sponge slice, delicate.
16. **Cinnamon Dutch Baby** — [dairy, vanilla, wheat, spice, eggs] — puffed skillet pancake with
    dramatic risen edges, custardy center, cinnamon dust.
17. **Mexican Chocolate Pots** — [dairy, vanilla, cocoa, spice, eggs] — silky chocolate custard cup,
    vanilla-cinnamon, cream swirl.
18. **Cocoa Cloud Soufflé** — [vanilla, wheat, cocoa, spice, eggs] — airy whipped dark-chocolate
    soufflé, light and risen.
19. **Vanilla Bean Crème Brûlée** — [dairy, vanilla, sugar, spice, eggs] — ramekin of custard with a
    glassy blowtorched caramelized sugar top, vanilla-bean flecks.
20. **Cinnamon Sponge Cake** — [vanilla, wheat, sugar, spice, eggs] — fluffy golden cake slice with
    a crisp cinnamon-sugar crust.
21. **Chocolate Fudge Torte** — [vanilla, cocoa, sugar, spice, eggs] — premium dense velvety
    chocolate cake slice, glossy ganache sheen.

---

## 4. Procedural graphics still missing

The board, islands, boats, docks, wind arrows, and trade-swirl are all done (§0). The remaining
procedural elements are still CSS/text placeholders with no art:

| # | element | where | current | batch | Gemini prompt |
|---|---------|-------|---------|-------|---------------|
| 4.1 | **Flippenator coin** | the shared coin/button; every flip lands here (`#flipCoinWrap`) | CSS circle, text "HEADS"/"TAILS"/"?"/"FLIP" | `coin` | [House Style] A large round pirate doubloon, top-down, gold, with a simple embossed pastry emblem (a cupcake) on one face and a skull-and-crossed-rolling-pins on the other; two versions (heads=cupcake, tails=skull). 1:1, solid flat chroma-key near-black (#000001) background, **no lettering**. |
| 4.2 | **Turn clock** | `#shotClockPanel` countdown | CSS panel + number | `clock` | [House Style] A small brass nautical stopwatch / ship's chronometer, front-on, empty face (game overlays the number). 1:1, solid flat chroma-key near-black (#000001) background, no text. |
| 4.3 | **Compass rose dial** | top-right of board | CSS panel, no art | `compass` | [House Style] An ornate round nautical compass rose dial, top-down, warm gold + teal. Give the four cardinal points (N/E/S/W) full elaborate compass-rose complications — long decorative flared points with fleur-de-lis/starburst filigree — clearly bigger and more ornamented than the shorter intermediate (NE/SE/SW/NW) points, so the four cardinals read as distinct at a glance. No letters or lettering anywhere. 1:1, solid flat chroma-key near-black (#000001) background. |
| 4.4 | **Compass needle** | rotates over the compass dial to show current wind direction (distinct from the existing `assets/wind-arrow.png`, which is the per-cell board wind chevron, not this) | no art yet | `compass` | [House Style] A single ornate compass needle for a nautical instrument, elongated diamond shape, one end painted gold/warm and pointed, the other end painted teal/dark and pointed, a small round jeweled pivot at the center, fancy engraved detailing along the length. Top-down, vertical orientation, solid flat chroma-key near-black (#000001) background, no text. |

---

## 5. Every emoji used in the game (required, batch: `icons`)

Every single emoji actually appearing in `index.html`/`lab.html` gets its own custom, emoji-sized
sticker icon in the House Style — this is a full inventory, not a curated sample. It was built by
extracting every emoji character from both files and counting occurrences, so it's exhaustive and
sorted by how often each one is actually seen in play (highest-traffic first within each
sub-batch, to prioritize the icons players see most). 82 unique emoji, six sub-batches below.

**Gemini prompt (per icon, e.g. the coin):**
> [House Style] A single game icon of a gold pirate doubloon coin, front-on, glossy, simple, bold
> and readable at small size like a mobile-game sticker. 1:1 square, centered, solid flat
> chroma-key near-black (#000001) background, no text.

Generate each sub-batch in one style pass (a sheet of N icons in one request, or one-by-one with
"same style as the previous image").

### 5.1 Economy / flips — batch `icons-economy` (5)
| emoji | uses | draw |
|---|---|---|
| 🌕 | 130 | the currency icon itself — a gold pirate doubloon coin (appears inline everywhere, e.g. "Pay 1🌕") |
| ⚫ | 22 | a coin flip landing tails — dark/obverse face |
| ⚪ | 18 | a coin flip landing heads — light/obverse face |
| 🔥 | 12 | a small flame — broadside/win-streak indicator |
| 🪙 | 3 | a coin mid-spin/flip |

### 5.2 Actions & outcomes — batch `icons-actions` (25)
| emoji | uses | draw |
|---|---|---|
| ⚓ | 34 | an anchor — docking action |
| ⚔ | 24 | crossed cutlasses — battle action |
| ⛵ | 15 | a small sailboat silhouette — sailing action |
| 🎣 | 17 | a fishing rod with line — fishing action |
| 🌀 | 16 | a small trade-wind current swirl icon (distinct pocket-size icon, not the big board swirl asset) |
| 🤝 | 15 | two hands shaking — parley/trade |
| 👑 | 12 | a small crown — round winner |
| 💰 | 12 | a coin pouch/sack — spoils |
| ⛈ | 9 | a small storm cloud with lightning |
| 🔭 | 8 | a spyglass — lookout's call |
| 🏁 | 6 | a pirate-flag-style checkered finish flag |
| 🧭 | 5 | a small pocket compass icon (distinct from the big board compass rose in §4) — turn indicator |
| 🏃 | 4 | a fleeing figure / running boot — flee action |
| 🌬 | 3 | a gust-of-wind icon |
| 💨 | 3 | a dodge/swoosh icon |
| 💥 | 3 | an impact burst — running aground |
| 💸 | 3 | coins flying away — a loss |
| 🦀 | 3 | a small candy-shell crab — a fishing catch |
| 🏝 | 2 | a tiny island silhouette — becalmed/leeward |
| 📦 | 2 | a crate tumbling overboard |
| 🛠 | 2 | crossed tools — shipwreck repair |
| 🎯 | 2 | a target/bullseye — most-attacked award |
| 🐠 | 1 | a tropical sugarfish catch |
| 🐟 | 1 | a plain fish catch |
| 🚫 | 1 | a small "no" slash — blocked action |

### 5.3 Timer — batch `icons-timer` (4)
| emoji | uses | draw |
|---|---|---|
| ⏳ | 8 | an hourglass — round cap / time's up |
| ⏰ | 7 | an alarm clock — shot-clock warning |
| ⏱ | 6 | a stopwatch — timer toggle button |
| ⏸ | 3 | a pause symbol |

_Dropped: ⏭ "skip-forward" was listed here but doesn't appear anywhere in `index.html` —
no matching UI control exists (confirmed during the icons-ui wiring pass). Likely a leftover
from `lab.html` rather than a real gap; not part of this batch._

### 5.4 Awards & flavor (end screen) — batch `icons-awards` (10)
| emoji | uses | draw |
|---|---|---|
| 🧁 | 17 | a cupcake — bakery/victory icon |
| 🗡 | 1 | a single dagger — longest-battle award |
| 💀 | 1 | a skull — defeated/loser award |
| 🐌 | 1 | a snail — slowest-sailor award |
| 🫡 | 1 | a saluting captain — respect award |
| 🛡 | 1 | a shield — best-defender award |
| 🌊 | 1 | a cresting wave — ocean-flavor accent |
| 🥐 | 1 | a croissant — pastry-flavor accent |
| 🍰 | 1 | a cake slice — pastry-flavor accent |
| 🍩 | 1 | a donut — pastry-flavor accent |

### 5.5 UI chrome / menu — batch `icons-ui` (29)
| emoji | uses | draw |
|---|---|---|
| 📜 | 9 | a rolled parchment scroll — recipe/log |
| 🚪 | 3 | a ship's hatch/door — leave game |
| 🤖 | 3 | a toy pirate-robot — bot player |
| ⚠ | 3 | a warning triangle |
| 📖 | 2 | an open storybook — how-to-play |
| 🎗 | 2 | a small ribbon — credits |
| 💬 | 2 | a speech bubble — feedback |
| 🔑 | 2 | a brass key — join game |
| 🗺 | 2 | a treasure map — host game |
| 🪑 | 2 | a small stool — pass-and-play |
| 📱 | 2 | a hand holding a device — pass device |
| 🦜 | 2 | a parrot — mascot/companion |
| 🔍 | 2 | a magnifying glass — search |
| ✕ | 2 | a bold X — close button |
| ✅ | 2 | a checkmark — confirm/yes |
| ❌ | 2 | an X mark — cancel/no |
| 📯 | 2 | a herald's horn — announcement |
| 🙅 | 2 | a crossed-arms figure — refused |
| 🎲 | 2 | a die — randomizer |
| 👀 | 1 | a pair of eyes — watch/spectate |
| ⚙ | 1 | a gear/cog — settings |
| 🔁 | 1 | a circular arrow — replay |
| 🖨 | 1 | a small printer — print |
| ✉ | 1 | an envelope — invite/mail |
| ➤ | 1 | a small play/nav arrow |
| ✨ | 1 | sparkles — highlight/new |
| 🌍 | 1 | a small globe — region/world |
| 🧑‍🍳 | 1 | a pirate-chef captain — baking flavor |
| 🏴‍☠ | 1 | a pirate flag icon (distinct small version of the crossbones motif) |

### 5.6 Ingredient inline glyphs — batch `icons-ingredients` (9)
Small icon versions for use in running text/narration, distinct from the board-token crate art in
§0 (same subject, different context — these are tiny inline glyphs, not board tokens).
| emoji | uses | draw |
|---|---|---|
| 🌾 | 2 | a wheat sheaf |
| 🥚 | 2 | a speckled egg |
| 🍬 | 2 | a sugar crystal/candy |
| 🍫 | 2 | a chocolate chunk |
| 🥛 | 2 | a milk bottle |
| 🌼 | 2 | a vanilla flower |
| 🌶 | 2 | a cinnamon stick |
| 🍯 | 2 | a honey dipper *(unused ingredient — only if that content ships)* |
| 🧂 | 2 | a salt shaker *(unused ingredient — only if that content ships)* |

### 5.7 Sound / mute — batch `icons-sound` (2) — **done, shipped**
Added 2026-08-01 on request, **not** from the emoji inventory sweep: neither 🔊 nor 🔇 appears
anywhere in `index.html` or `lab.html`, and the game has no sound, mute, or volume control. These
were generated ahead of that feature, so §5's "every emoji in the game" claim still holds — this
sub-batch is an addition to it, not a correction of it.

| emoji | uses | draw | file |
|---|---|---|---|
| 🔊 | 0 (no call site yet) | a brass megaphone / loudhailer with three curved teal sound waves | `assets/icons/sound-on.png` |
| 🔇 | 0 (no call site yet) | the same brass megaphone with a bold coral X in place of the waves | `assets/icons/sound-off.png` |

Both shipped at 128×99 RGBA. Notes for whoever picks this up:

- **Brass, on Wyatt's call.** The first pass came back in the standard teal/parchment/coral House
  Style palette; he asked for brass to match the flippenator coin (`assets/icons/flip-heads.png`).
  The teal originals are kept at `art-review/icons-sound/v1-teal/` for comparison.
- **The mute version is an in-thread Gemini edit of the sound-on image**, not a fresh prompt — that
  is what keeps the megaphone pixel-identical between the two states. Regenerating either one from
  scratch will break the pair; edit from the existing image instead.
- **They are cropped to a shared union box**, so the horn sits at the same offset in both files and
  does not twitch when the icon toggles. Any recrop must keep that — cropping each to its own tight
  bbox produced a 3px vertical mismatch.
- **The horn is a modern bullhorn silhouette** (with a pistol grip), not a period ship's speaking
  trumpet, despite the prompt asking for one. Known and accepted; revisit only if it reads wrong
  next to the rope-and-timber flippenator.

**REVISED 2026-08-02 — `sound-off.png` was rebuilt, and NOT in Gemini.** When the mute button shrank
by half (MUTE-02), the small coral X sitting *beside* the megaphone became about 6px on screen —
Wyatt: *"the x is hard to see."* His fix, and it is the reason this stayed on-style: **reuse the
existing X, just move it and make it bigger.** So the current file is a programmatic composite of
this project's OWN artwork, assembled with PIL:

1. The coral X was isolated from the old `sound-off.png` by colour — it is the only element where
   green ≈ blue, whereas the brass horn has green ≫ blue — then its mask was dilated 5px to pick up
   the cream outline, and the result cut free of the megaphone.
2. That X was erased from the original, leaving the horn alone (no waves — the old mute file had
   already dropped them).
3. The horn was desaturated (~30% colour retained, ×0.90 brightness) so the muted state reads even
   before the X resolves.
4. The X was scaled to 95% of the horn's width and composited **centred on the CANVAS, not on the
   horn** — Wyatt: *"the muted icon won't LOOK centered inside the button any more... move the X so
   that the X is centered, while the horn stays in the same place."* The horn therefore sits left of
   centre with the X over it, which is what makes the icon look centred inside the button.

**The invariants above still hold and were re-checked, not assumed:** output canvas is exactly
167×128, byte-for-byte the same box as `sound-on.png`, and the button measures the same width in both
states — so the horn still does not twitch on toggle.

**If this is ever regenerated in Gemini instead, the in-thread-edit rule above still applies.** The
script that built the current file is not kept — it was a one-off — but everything it did is
described here, and its inputs (the two shipped PNGs) are in the repo, so it is reproducible.

**Sizes in the table above are stale.** Both files are 167×128 as shipped, not 128×99.
- Waves stay teal and the mute X stays coral deliberately — an all-brass version of either loses
  the silhouette at 24px.

Gallery: `art-review/gallery-sound.html`.

---

## 6. Priority order for production

1. **Recipe pastries** (§3) — 21, the core reveal/victory art, nothing exists yet.
2. **Flippenator coin faces** (4.1) and **economy/flip icons** (5.1) — every single turn.
3. **Turn clock** (4.2), **compass rose dial** (4.3), **compass needle** (4.4), and **timer icons** (5.3).
4. **Action/outcome icons** (5.2) — the next-highest-traffic group after economy.
5. **Awards & flavor icons** (5.4) — end-screen only, seen once per game.
6. **UI-chrome icons** (5.5) and **ingredient inline glyphs** (5.6) — lowest traffic, do last.

All six emoji sub-batches (§5) are in scope and required — every emoji in the game gets replaced,
not a curated subset. The grouping above is purely about generation order, not about skipping any
of them.

_Note: `salt` and `honey` ingredients and the "Bakeoff" title exist in code but aren't part of the
standard 7-island game; only generate them if that content ships._
