# Codebase Structure

**Analysis Date:** 2026-07-22

## Directory Layout

```
pastrypirates/
├── index.html              # Main game application (328 KB, single-page app)
├── lab.html                # Secondary game viewer/test page (121 KB)
├── cocoa_pirates_sim.py    # Python game simulator for ruleset testing
├── favicon.ico, favicon.png, og-image.jpg  # Branding assets
├── README.md, RULES.md, Rules_boardgame.md # Game documentation
│
├── .claude/                # Claude Code project config (not part of game)
│
├── .planning/              # GSD workflow directory
│   └── codebase/           # Architecture/structure documentation
│
├── assets/                 # Game image assets (organized by type)
│   ├── board.png           # Main game board SVG export
│   ├── dock.png, wind-arrow.png, trade-swirl.png
│   ├── logo.jpg            # Game logo
│   ├── boats/              # 4 player boat sprites
│   ├── clock/              # Shot clock display image
│   ├── compass/            # Wind/compass dial imagery
│   ├── icons/              # 78+ game action/status icons (PNG)
│   ├── ingredients/        # 7 ingredient images + hole variants
│   ├── islands/            # 7 island shape silhouettes
│   └── pastries/           # 21 pastry recipe images
│
├── art-review/             # Generator output directories for design review
│   ├── clock/, coin/, compass/    # Component iteration galleries
│   ├── flippenator/, icons-*, pastries/
│   ├── gallery*.html       # HTML viewers for generated assets
│
├── scripts/                # Dev-only testing/analysis tools (Node.js)
│   ├── battle_sim.js       # Headless battle-mechanic simulator (hand-written)
│   ├── battle_sim.html     # Viewer for battle_sim.js results
│   ├── real_game_test.js   # Runs real Game.play() via Node vm module
│
├── notes/                  # Design docs, art pipeline, game logs
│   ├── DESIGN_REPORT.md    # Design philosophy and decision log
│   ├── ONLINE_SETUP.md     # Firebase setup and multiplayer guide
│   ├── art-generation-process.md  # AI art generation workflow
│   ├── art-audit.md        # Art inventory and status
│   ├── pastry_pirates_recipes.md  # Recipe reference
│   ├── rain.html           # CSS rain effect sandbox/testing page
│   └── *.mov, *.pdf        # Bug reports, design assets, gameplay video
│
└── .git/                   # Git history (not part of game)
```

## Directory Purposes

**Root Level:**
- Purpose: Entry points and top-level documentation
- Contains: Main game file, secondary pages, rule references, branding
- Key files: `index.html` (main game), `cocoa_pirates_sim.py` (rule verification)

**`assets/`:**
- Purpose: All game imagery used in the browser app
- Contains: Board art, player boats, ingredient/island/pastry art, UI icons, compass/clock imagery
- Committed: Yes
- Key organization:
  - `board.png`, `dock.png` - Static map backgrounds (4.7 MB, 120 KB)
  - `boats/1-4.png` - Player ship sprites (one per color)
  - `ingredients/` - Crop icons for each ingredient type + hole variants
  - `islands/1-7.png` - Tetromino-style island shape silhouettes
  - `pastries/01-21.png` - High-res pastry product photos for recipe display
  - `icons/` - 78+ narrative/action icons (coin flip, battle, dock, anchor, etc.)

**`scripts/`:**
- Purpose: Development/analysis tools for game balance and verification
- Contains: Battle mechanics simulator, real game test harness
- Committed: Yes
- Not loaded by browser; run via `node` for offline testing
- Key files:
  - `battle_sim.js` - Hand-written battle mechanics model; tests coin flip variance and wind advantage
  - `real_game_test.js` - Extracts Game class from index.html, runs full games with bots via Node vm module

**`notes/`:**
- Purpose: Design documentation, art production logs, rule references
- Contains: Design decisions, multiplayer setup guide, art generation process, recipe reference
- Committed: Yes
- Key files:
  - `DESIGN_REPORT.md` - Why certain mechanics were chosen
  - `ONLINE_SETUP.md` - How to configure Firebase and deploy multiplayer
  - `art-generation-process.md` - Using Gemini API to generate pastry images
  - `pastry_pirates_recipes.md` - Recipe reference for testing

**`art-review/`:**
- Purpose: Staging area for generated/iterated asset galleries
- Contains: Subdirectories per component (clock, compass, pastries, icons)
- Committed: Yes (galleries and iteration versions)
- Key files:
  - `gallery.html`, `gallery-icons.html`, `gallery-batch2.html` - Viewers showing asset sets with localStorage-based filtering/export

**`.planning/codebase/`:**
- Purpose: Architecture and code map documentation (GSD workflow)
- Contains: ARCHITECTURE.md, STRUCTURE.md, (optionally CONVENTIONS.md, TESTING.md, etc.)
- Committed: Yes
- Referenced by: GSD planner/executor to understand codebase before implementing changes

## Key File Locations

**Entry Points:**
- `index.html:5181` - `boot()` function, called on page load
- `index.html:5224` - Actual call to `boot()` at end of script block
- `index.html:807` - Start of main `<script>` tag (game engine and UI code)

**Configuration:**
- `index.html:4542–4562` - Firebase config object (`firebaseConfig`)
- `index.html:815–876` - Asset URLs and image path constants (`ASSET_BASE`, `ING_IMG`, etc.)
- `index.html:951–962` - Board constants (directions, storms, personality types)
- `cocoa_pirates_sim.py:13–40` - Rule configuration class

**Core Logic:**
- `index.html:1017–1684` - `Game` class (full game state machine)
- `index.html:1405–1635` - `Game.battle()` method (battle resolution)
- `index.html:1636–1684` - `Game.play()` method (main game loop)
- `cocoa_pirates_sim.py:71–200` - Python `Game` class (parallel rule model for verification)

**Testing:**
- `scripts/real_game_test.js` - Runs 2000 full games with bots (real Game class, Node VM)
- `scripts/battle_sim.js` - Isolated battle mechanic testing (hand-written)
- `scripts/battle_sim.html` - Viewer for battle simulation results

## Naming Conventions

**Files:**
- HTML pages (entry points): `index.html`, `lab.html`
- Dev tools (Node.js scripts): `battle_sim.js`, `real_game_test.js`, `cocoa_pirates_sim.py`
- Documentation: Markdown in `notes/`, CAPS.md convention (e.g., `DESIGN_REPORT.md`)
- Asset folders: lowercase plural (e.g., `boats/`, `islands/`, `ingredients/`)
- Asset files: numbered (e.g., `boats/1.png`, `islands/1.png`) or descriptive (e.g., `ingredients/wheat.png`)

**Directories:**
- Production code: root level (`index.html`)
- Assets by category: `assets/{type}/` (boats, icons, pastries, etc.)
- Dev tools: `scripts/`
- Documentation: `notes/`, `.planning/codebase/`
- Review staging: `art-review/{component}/`

**HTML/JS Naming (inside index.html):**
- Functions: camelCase (`boot()`, `render()`, `humanTurn()`, `watchFlip()`)
- Classes: PascalCase (`Game`, `PERSONALITY`, etc. — though most are constructor functions or object literals)
- Constants: UPPER_CASE (`ASSET_BASE`, `ING_ALL`, `DIRS`, `BOARD_IMG`, `ING_EMOJI`)
- Global variables: lowercase/camelCase (`game`, `myId`, `room`, `db`, `mySeat`)
- CSS custom properties (variables): kebab-case (`--teal`, --mint`, `--sideW`, `--boardW`)
- CSS classes: kebab-case (`.player-row`, `.chip.have`, `.btl-col`, `.flipBtn.active`)

**Asset Naming:**
- Ingredient images: `ingredients/{ingredient_name}.png` (wheat, eggs, sugar, cocoa, dairy, vanilla, spice)
- Pastries: `pastries/{number:02d}-{descriptive_name}.png` (01-spiced-cocoa-shortbread.png)
- Icons: `icons/{action_or_state}.png` (battle.png, anchor.png, flame.png, flip-heads.png)
- Islands: `islands/{shape_index}.png` (1–7, Tetris-like shapes)
- Boats: `boats/{player_number}.png` (1–4)

## Where to Add New Code

**New Feature (e.g., new mechanic or gameplay rule):**
- Primary code: `index.html` (extend `Game` class or add helper functions before the "UI" marker)
- Game logic: Add methods to `Game` class (`index.html:1017–1684`)
- Constants: Add to the `const` declarations section (`index.html:815–876`)
- Event narration: Add entry to `EVENT_NARRATION` object (`index.html:2356–2425`)
- UI for feature: Add rendering logic to `render()` or create dedicated render function (`index.html:2470–2580`)
- Tests: Add cases to `scripts/real_game_test.js` to verify mechanic works in full games

**New Component/Module (e.g., new UI panel):**
- Implementation: `index.html` (in UI section, after the "========= UI ==========" marker)
- HTML markup: Embed in the page (or create via `document.createElement` in JS)
- Styling: Add to `<style>` tag (`index.html:28–807`)
- Event wiring: Add setup function called from `boot()` (e.g., `wireRecipeModal()` at line 2023)
- Data binding: Read from `game` instance and update DOM manually (no framework)

**New Asset:**
- Images: Place in `assets/{type}/` folder (e.g., `assets/icons/new_icon.png`)
- Update `index.html`: Add image URL constant (e.g., `const NEW_IMG = "${ASSET_BASE}icons/new_icon.png"`)
- Update `preloadAssets()`: Add image to preload list to ensure it's cached before game starts
- Reference in code: Use the constant instead of hardcoding the path

**Multiplayer Networking (Firebase):**
- Data write: Call `db.ref("rooms/"+room+"/path").set(value).catch(netFail("label"))`
- Data read (one-time): Use `db.ref("rooms/"+room+"/path").get().then(snap => snap.val())`
- Real-time watch: Add function like `function watchNewPath() { db.ref("rooms/"+room+"/path").on("value", callback); }`
- Cleanup: Call `.off("value", callback)` or just let it auto-cleanup on disconnect

**Testing/Development:**
- Headless test: Modify `scripts/real_game_test.js` or add new test file
- Browser debug: Use `lab.html` (secondary view) for isolating issues
- Battle analysis: Modify `scripts/battle_sim.js` knobs and run via `node`
- Simulation: Use `cocoa_pirates_sim.py` to test rulesets without GUI

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD (Goal, Story, Direction) workflow documentation
- Generated: By `/gsd-map-codebase` skill
- Contains: ARCHITECTURE.md, STRUCTURE.md, (may include CONVENTIONS.md, TESTING.md, CONCERNS.md)
- Committed: Yes (tracked in git)
- Used by: `/gsd-plan-phase` and `/gsd-execute-phase` to understand code structure before implementing

**`art-review/`:**
- Purpose: Staging area for designer review and asset iteration
- Generated: By art generation pipeline (Gemini API → local images)
- Contains: Subdirectories per asset type (clock, compass, pastries, etc.) + gallery HTML viewers
- Committed: Yes
- Workflow: Designer exports variants, adds to gallery, Wyatt selects/approves

**`.claude/`:**
- Purpose: Project configuration for Claude Code harness
- Contains: Skills, worktrees, settings (user-specific, not game-specific)
- Committed: Yes
- Not part of game code

---

*Structure analysis: 2026-07-22*
