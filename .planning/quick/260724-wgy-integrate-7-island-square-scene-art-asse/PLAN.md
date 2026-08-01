---
task: 260724-wgy-integrate-7-island-square-scene-art-asse
type: quick
created: 2026-07-24
autonomous: true
files_modified:
  - assets/islands/scenes/eggs.png
  - assets/islands/scenes/wheat.png
  - assets/islands/scenes/cocoa.png
  - assets/islands/scenes/sugar.png
  - assets/islands/scenes/dairy.png
  - assets/islands/scenes/vanilla.png
  - assets/islands/scenes/spice.png
  - scripts/process_island_scenes.py
  - index.html
commits: 3   # atomic: (1) processing script + generated assets, (2) index.html wiring, (3) verify-only (may be no-op)
---

<objective>
Integrate 7 approved island-square scene art assets (one per in-play ingredient island) into the
Pastry Pirates board render. Each scene is a small top-down-ish vignette that sits on one square of
its island, giving each island a hand-drawn identity beyond the crate token.

Purpose: Purely visual polish. This must NOT touch game logic, RNG, turn state, or multiplayer
lockstep — it only adds SVG `<image>` elements during render.

Output:
- 7 game-ready, transparent, cropped/resized PNGs under `assets/islands/scenes/`
- A reusable Python processing script under `scripts/`
- `index.html` wiring: an `ISLAND_SCENE_IMG` map, a scene draw in the island render loop, and the
  7 files added to the preload list.
</objective>

<constraints>
Bake these into every task — they are non-negotiable:

- **Safari-safe.** No new APIs; the render path already runs in Safari. Scenes are plain SVG
  `<image>` elements drawn via the existing `iconAt()` helper — nothing Safari-specific.
- **Deterministic / replay engine untouched.** Scene placement MUST be derived only from static
  island geometry (`game.islandRect[ing]` cells) using a FIXED index — never from `this.r()`, the
  seeded RNG, player positions, turn counters, or any mutable game state. The render code must not
  mutate any `game.*` state. This is a read-only visual overlay; it cannot affect lockstep.
- **In-place edits to the single `index.html` only.** No framework, no build step, no new module.
  Match the compact house code style (semicolons, tight spacing, camelCase, `*_IMG` suffix).
- **Main working tree.** The source images in `art-review/islands/` are staged/UNCOMMITTED, so
  execution runs on the main working tree at `/Users/wyattroy/Documents/Projects/pastrypirates`,
  NOT a `.claude/worktrees/…` worktree. Confirm `art-review/islands/*.png` are visible before
  starting Task 1.
- **Atomic commits.** Keep the generated-assets + script commit separate from the `index.html`
  wiring commit. See `commits` in frontmatter.
</constraints>

<context>
Read before executing:
- notes/art-generation-process.md — §7 "Cropping & resizing for integration" is the EXACT recipe
  for Task 1 (corner-sample bg, watermark exclusion zone, downsampled connected-component labeling,
  union-bbox crop, border-connected flood-fill keying, premultiply→Lanczos→un-premultiply). Also
  §3 (near-black `#000001` background) and §4.5 (preserve natural aspect ratio, no forced square).
- index.html ~lines 2361–2410 — island render loop (`for(const ing of game.ings)`), where the
  crate icons are drawn one-per-square at `cell*.8` via `iconAt(svg, (c[0]+.5)*cell, (c[1]+.5)*cell, cell*.8, ING_IMG[ing])`.
- index.html ~line 964 — `ISLAND_SHAPE_IMG` definition (place the new `ISLAND_SCENE_IMG` map next to it);
  ~line 871 `ASSET_BASE="assets/"`; ~line 872 `ING_IMG`.
- index.html ~lines 2220–2228 — `el(tag,attrs,parent)` and `iconAt(svg,cx,cy,size,href,rotateDeg,flip)` helpers.
- index.html ~lines 5577–5585 — `preloadAssets()` URL list.
</context>

<ingredient_mapping>
Trust THIS mapping, NOT the historical filename slugs. Source → output ingredient key:

| Source (art-review/islands/) | Ingredient | Output (assets/islands/scenes/) | Source background |
|------------------------------|------------|----------------------------------|-------------------|
| 1-egg-chicken-coop.png       | eggs       | eggs.png                         | near-black #000001 |
| 2-wheat-toaster-mill.png     | wheat      | wheat.png                        | near-black #000001 |
| 3-chocolate-whirlpool.png    | cocoa      | cocoa.png                        | WHITE              |
| 4-sugar-candyland.png        | sugar      | sugar.png                        | near-black #000001 |
| 5-milk-dairy-farm.png        | dairy      | dairy.png                        | WHITE              |
| 6-vanilla-custard-tub.png    | vanilla    | vanilla.png                      | near-black #000001 |
| 7-spice-market-stall.png     | spice      | spice.png                        | WHITE              |

The background column above is the EXPECTED value — the script must still detect per-file by
sampling the 4 corners and never hardcode/assume. The table is a cross-check, not a shortcut.
</ingredient_mapping>

<tasks>

<task type="auto">
  <name>Task 1: Process 7 PNGs into game-ready transparent scene assets</name>
  <files>scripts/process_island_scenes.py, assets/islands/scenes/{eggs,wheat,cocoa,sugar,dairy,vanilla,spice}.png</files>
  <action>
Write a reusable Python script `scripts/process_island_scenes.py` (PIL + numpy only — NO scipy;
use pure-Python BFS on the downsampled mask per the runbook's note) that processes each of the 7
sources in `art-review/islands/` into `assets/islands/scenes/<ing>.png`, mapping source→ingredient
per the ingredient_mapping table (do NOT trust filename slugs; drive the mapping from an explicit
list of (source_filename, ingredient_key) tuples in the script).

Follow notes/art-generation-process.md §7 EXACTLY, per file:
1. Detect background by sampling the 4 corners — backgrounds VARY across this batch (some white,
   some near-black #000001), so per-file detection is mandatory; never assume one bg for all 7.
2. Build a foreground mask via color distance from the detected bg.
3. Zero out the bottom-right ~15% watermark exclusion zone before anything else.
4. Connected-component label on a DOWNSAMPLED copy (~8x) of the mask; keep components ≥0.05% of
   total image area (drops AA noise, preserves real secondary elements); scale boxes back up.
5. Crop to the union bbox of kept components + ~1% pad.
6. Key to real alpha on the still-full-res crop: build a "could-be-background" candidate mask
   (color distance under threshold + a few-value feather), flood-fill INWARD from the crop's four
   edges (downsampled BFS, then upsample + dilate one block), and key ONLY border-connected
   background — never a same-colored patch enclosed by artwork (no interior holes).
7. Premultiply RGB by alpha → Lanczos resize → un-premultiply (key BEFORE resize, not after).
8. Preserve natural aspect ratio (bound the LONG side only — no forced square) to target ~320px
   long side (board-pop scale, ~90px max on screen).

Write outputs to assets/islands/scenes/ (create the dir). Make the script idempotent/rerunnable.
PIL (Pillow) + numpy are expected to already be present; if missing, install them (standard,
well-known packages) — do not add scipy.
  </action>
  <verify>
    <automated>python3 scripts/process_island_scenes.py && ls -1 assets/islands/scenes/{eggs,wheat,cocoa,sugar,dairy,vanilla,spice}.png</automated>
    <human-check>For each of the 7 outputs: composite against BOTH pure white AND near-black #000001 — confirm no interior holes (border-connected keying only) and the design fills the frame edge-to-edge with no residual padding or watermark fragment. Zoom the edges at 100% — confirm smooth antialiased curves with no staircasing and no dark/light fringing.</human-check>
  </verify>
  <done>
7 PNGs exist under assets/islands/scenes/ with correct ingredient names, real alpha transparency,
tight crops, preserved aspect ratios, ~320px long side, clean edges, and no interior holes on
either background. Processing script committed alongside them.
  </done>
</task>

<task type="auto">
  <name>Task 2: Wire scenes into the board render in index.html</name>
  <files>index.html</files>
  <action>
Three edits, in place, matching the compact house style:

1. Near `ISLAND_SHAPE_IMG` (~line 964), add an `ISLAND_SCENE_IMG` map keyed by ingredient →
   `${ASSET_BASE}islands/scenes/<ing>.png` for the 7 scene ingredients (eggs, wheat, cocoa, sugar,
   dairy, vanilla, spice). Use the same `*_IMG` naming convention. Add a short comment noting these
   are per-ingredient island scene vignettes.

2. In the island render loop (~lines 2361–2410, inside `for(const ing of game.ings)`), draw the
   scene on ONE deterministic square of the island. Pick a FIXED index into `game.islandRect[ing]`
   (the island's `cells` array) — e.g. `cells[cells.length-1]` — so placement is stable across
   replay and does not consult RNG or turn state. Draw via the existing `iconAt(svg, cx, cy, size, href)`
   helper (mostly top-down) at ~`cell*0.9`, using `ISLAND_SCENE_IMG[ing]`; guard with `if(ISLAND_SCENE_IMG[ing])`
   so only the 7 scene ingredients render one (salt/honey are not in play and have no scene).

   DECISION TO MAKE AND DOCUMENT in an inline comment: whether the scene shares a square with a
   crate token or sits on a crate-free square. Recommended default: draw the scene BEFORE the crate
   loop so, if the chosen cell also carries a crate, the crate token layers on top and stays
   readable; state the chosen relationship explicitly in the comment.

3. In `preloadAssets()` (~line 5578), add the 7 scene files to the URL list, e.g. spread
   `...Object.values(ISLAND_SCENE_IMG)` alongside `...ISLAND_SHAPE_IMG`.

Use `el()`/`iconAt()` and follow the existing iconAt image-load fallback behavior already used for
every other board icon — do not introduce a new loading path.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs'),s=fs.readFileSync('index.html','utf8');if(!/ISLAND_SCENE_IMG/.test(s))throw new Error('ISLAND_SCENE_IMG map missing');if((s.match(/ISLAND_SCENE_IMG/g)||[]).length<3)throw new Error('ISLAND_SCENE_IMG must appear in map def, render loop, and preload');if(/ISLAND_SCENE_IMG\[[^\]]*\][^;]*this\.r\(/.test(s))throw new Error('scene placement must not use RNG');console.log('ISLAND_SCENE_IMG refs:',(s.match(/ISLAND_SCENE_IMG/g)||[]).length)"</automated>
    <human-check>Open index.html in Safari AND Chrome, start a solo game, and confirm all 7 island scenes render (one per in-play island) without breaking board layout, and that crate tokens remain readable. Devtools console: zero JS errors during board render.</human-check>
  </verify>
  <done>
ISLAND_SCENE_IMG map defined next to ISLAND_SHAPE_IMG; the island render loop draws one scene per
in-play ingredient island on a FIXED (non-RNG) cell via iconAt at ~cell*0.9; the 7 scene files are
in the preload list; board renders in Safari and Chrome with no layout break and no JS errors.
  </done>
</task>

<task type="auto">
  <name>Task 3: Verify render + confirm deterministic engine untouched</name>
  <files>index.html (inspection only — no functional edits expected)</files>
  <action>
Confirm the integration is purely visual and regression-free. This task expects NO code changes; if
it surfaces a problem, fix it under Task 2's scope and re-run, then leave this as a verification-only
(possibly no-op) commit.

Checks:
1. Board draws all 7 scenes without breaking layout — scenes clip to their island squares and read
   well at board scale relative to the crate token on/near the same square.
2. No JS errors in the console on board render (solo game boot + a full render pass).
3. Deterministic / replay engine untouched: grep the new render code to confirm scene placement is
   derived from static island cells only — no `this.r()`, no RNG, no player/turn state feeding the
   chosen cell index; and the new code mutates no `game.*` state (read-only `<image>` draw). Because
   placement is a fixed index into `game.islandRect[ing]`, the same scene lands on the same square in
   host and guest renders and across replay, so multiplayer lockstep is unaffected.
  </action>
  <verify>
    <automated>node --check index.html 2>/dev/null || node -e "require('fs').readFileSync('index.html','utf8');console.log('index.html readable')"; grep -n "ISLAND_SCENE_IMG" index.html</automated>
    <human-check>Solo game in Safari + Chrome: all 7 island scenes visible, layout intact, no console errors. If multiplayer is exercised, host and guest show identical scene placement (deterministic).</human-check>
  </verify>
  <done>
All 7 scenes render correctly in Safari and Chrome, no layout regressions, no JS errors, and scene
placement is provably RNG-free and state-free (fixed cell index), leaving the deterministic/replay
engine and multiplayer lockstep intact.
  </done>
</task>

</tasks>

<success_criteria>
- 7 transparent, tightly-cropped, aspect-preserved scene PNGs (~320px long side) exist under
  assets/islands/scenes/ with correct ingredient names (eggs, wheat, cocoa, sugar, dairy, vanilla, spice).
- Reusable PIL+numpy (no scipy) processing script committed under scripts/.
- index.html: ISLAND_SCENE_IMG map added by ISLAND_SHAPE_IMG; one scene drawn per in-play island on
  a fixed non-RNG cell via iconAt at ~cell*0.9; 7 files added to preloadAssets.
- Board renders correctly in Safari and Chrome; no JS errors; no layout regressions.
- Deterministic engine + multiplayer lockstep untouched (placement from static cells, no RNG/state, no game.* mutation).
- Atomic commits: (1) script + generated assets, (2) index.html wiring, (3) verification (may be no-op).
</success_criteria>

<output>
Quick task — no SUMMARY required. Commit atomically per the `commits` field; the assets/script
commit stays separate from the index.html wiring commit.
</output>