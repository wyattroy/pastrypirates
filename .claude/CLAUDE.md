## CONSISTENCY IS A CORE VALUE — same gesture, same behaviour, everywhere

**Standing design rule — Wyatt, 2026-08-12:** *"Add consistency as a core value... so it is
flagged whenever it is broken, and only broken intentionally."*

An interaction that behaves differently in two places is a bug unless Wyatt chose the exception.
The instance that created the rule: hold-the-sea faded some prompt styles and not others, and the
day/wind narration bubbles ignored the gesture entirely — three behaviours for one gesture.

When adding or changing ANY interactive behaviour (a gesture, a fade, a prompt style, an
animation, a pacing constant, a copy register), sweep every OTHER surface that behaviour touches
and make them match — then say in the reply which surfaces were checked. An intentional exception
must be named to Wyatt when introduced and recorded here.

Sanctioned exceptions (each one his explicit pick):
- Hold-the-sea fades every floating box (prompts of all styles, narration bubbles, the stay-put
  confirm) but NOT the centre-stage intros or the flip-ceremony veil (2026-08-12).
- The credits/About pages are not in pirate speak — see "The voice boundary" below.

## NOTHING IS A CONSTANT — the game is always shifting

**Standing design rule — Wyatt, 2026-08-14:** *"We also dont want constants to drive the
[behaviour], because the game is always shifting!! The bot should calculate an offer that it would
accept, and offer something close to that."*

A hardcoded price, margin, threshold or cap is **a price list standing in for a quantity that moves
by an order of magnitude across a voyage**. A bot's first crate and its last crate are not the same
trade; a captain with 2 coins and one with 20 are not playing the same game. A constant cannot be
right for both, and it fails silently — it just plays slightly wrong, forever, in a way no gate can
see.

**Derive it instead, from something the game already computes.** The elegant version almost always
*deletes* code: when a bot was asked to price a trade properly, the answer turned out to be
`acquireTurns()` — what fetching the crate itself would cost, which it was already calculating to
plan its route — and the whole hail test collapsed to one comparison with no threshold in it. Two
earlier attempts, both of which added a constant, were longer AND worse.

The same rule caught in the other direction: **replacing a constant with a calculation breaks every
test that reads it.** Not merely "makes them wrong" — it can make them *vacuous*, unable to fail,
which still reads as protection. `docs/BOT-DESIGN-PRINCIPLES.md` records a −21.2 ladder regression
from exactly this, and a repeat of it on 2026-08-14. **List what reads a quantity, gates included,
before you change how it is produced.**

Canonical detail: principle 10 in `docs/BOT-DESIGN-PRINCIPLES.md`.

## READ THE GRAVEYARD — what this project already tried and rejected lives in the GIT LOG

**Standing process — Wyatt, 2026-08-14:** *"we already tried many failed attempts at decreasing
trade spam; have you read all those logs?"*

I had not, and the answer to that question is nearly always no unless it is asked deliberately.

**A design document says how a subsystem WORKS. It does not say what was already tried and thrown
away, which numbers are deliberately held, or which ruling was earned by a previous failure.**
Those live in commit messages — and this repo's are unusually long *precisely so they can be read
this way*. Reading `BOT-DESIGN-PRINCIPLES.md` and `HARD-WON-LESSONS.md` end to end is NOT a
substitute, proven on 2026-08-14 when both were read that morning and a hard-won result was
reversed anyway.

Before changing any subsystem that has a history — bots, narration, the storm, the clock, trades:

```bash
git log --all --oneline --grep="<subsystem>" -i          # the arguments already had
git log --all --format="%H %s" -S "<the number or fn>"   # where a quantity was last defended
```

**The tell that you are about to re-run a settled argument:** you catch yourself reasoning that
some number going *up* is acceptable because a different number stayed flat. If a quantity is worth
defending like that, somebody has already defended it. Go and read what it cost them.

Full account: `docs/HARD-WON-LESSONS.md` §0 ("the git history is the other half") and §2 ("do not
swap the recorded metric for a more sympathetic one").

## Narration box: content appears TOP TO BOTTOM, in that order

**Standing design rule — Wyatt, 2026-08-01:** *"Everything in the narration box should appear from
top to bottom, in that order. Remember this intent."*

Whatever sits highest in the box is revealed first, then the next thing down. Concretely:

> **back button → message text → action buttons → italic helper text**

That is the DOM order `localAsk()` builds in `src/ui/flow.js` — `.apBack`, `.apMsg`, `.apBtns`,
`.apSub` — and the reveal must follow it.

This is not a per-bug preference. It governs anything added to `#actionPanel` in future — a new
element's reveal order follows its visual position, and does not need re-deciding each time. Two
separate playtest findings on 2026-08-01 traced back to violating it: the italic helper text painted
instantly, ahead of the message it explains, and the back button appeared after the message instead
of before it.

## Git: always fetch before you read git state

**`git fetch` FIRST — before reading, comparing, or concluding anything about a branch.** Not once
per task; once per time you are about to trust what git tells you.

Both `main` and `origin/main` are **local caches**. `origin/main` is not the remote — it is this
machine's last-downloaded snapshot of it, and it is stale until you fetch. Reading either one without
fetching can be arbitrarily wrong.

```bash
git fetch origin
```

**This has cost real time on this project, twice.** On 2026-08-01 the local `main` ref was parked at
a v1.0 snapshot — 457 commits behind, no `src/` directory at all — because nobody had pulled after
merging on GitHub. Reading it produced a confident and completely wrong conclusion ("main is a dead
v1.0 snapshot; ignore it"), which was then handed to four parallel sessions as instructions. GitHub
was healthy the entire time. Only the local copy was frozen.

**Tells that you are reading a stale ref — stop and fetch before concluding:**

- A diff against the base is absurdly large (hundreds of commits).
- `src/` appears as *newly added* — it has existed since the v1.1 refactor.
- A milestone you know shipped looks unfinished or absent.
- A branch appears wildly behind for no reason anyone can explain.

**After merging a pull request on GitHub, pull locally.** The merge happens on GitHub's servers; this
machine does not know until told. Missing this step is what caused the above, across two milestones.

```bash
git pull
```

**Never report git state from memory or from earlier in the session.** Re-run the command. Refs move —
including because of something you did yourself.

## HOW WYATT PLAYS WHAT YOU BUILT — the milestone directory ships on `main`

**Standing process — Wyatt, 2026-08-14:** *"The design we have been using is that
playpastrypirates.com continues serving its normal version; but playpastrypirates.com/4 is serving
the version that we are working on."*

He asked for this to be written down so he never has to explain it to a new session again.

**The shape of it.** `playpastrypirates.com` is GitHub Pages serving **`main`, from the repo root,
with no build step and no deploy workflow.** What is on `main` *is* what is live — there is nothing
in between.

| URL | Served from | What it is |
|---|---|---|
| `playpastrypirates.com` | repo root (`index.html`) | the finished game real players play |
| `playpastrypirates.com/4` | `4/` | **the milestone under development** — this is what Wyatt playtests |

**So pushing the work-in-progress build to `main` is the normal thing to do, not a release.** It is
how he gets to play it at all: he is on a phone, and `/4` on the live domain is his only way in.
Merging does NOT touch the root game, because the root game is different files. Do not treat a
merge to `main` as a scary outward-facing act requiring a ceremony — treat the *diff* as the thing
to check.

**The loop, every time:**

1. Develop and commit on the session's designated branch (never straight onto `main`).
2. **Bump the build stamp** — `PP4_STAMP` in `4/src/ui/stage.js`, shown in the hamburger menu as
   `v4 · build 2026-08-13g`. It is how he tells at a glance whether he is looking at your work.
3. **Prove the merge touches only the milestone.** Run this and read it — empty output is the
   licence to push:
   ```bash
   git diff --name-only origin/main..HEAD -- ':(exclude)4/' ':(exclude)scripts/' ':(exclude)docs/' ':(exclude).claude/'
   ```
   Anything printed there changes the live game real players are in the middle of. Stop and ask.
   `CNAME`, `robots.txt` and `sitemap.xml` must never appear — see the CNAME section below for why
   that one is not a style preference.
4. Fast-forward and push, then pull, then verify both directions are zero (the sync rule above):
   ```bash
   git checkout main && git merge --ff-only <branch> && git push origin main && git pull origin main
   git rev-list --count origin/main..main   # 0
   git rev-list --count main..origin/main   # 0
   ```
5. Go back to the working branch. Tell him the build stamp to look for, and that Pages takes a
   minute or two.

**The tell that a session skipped this: he reports an old build stamp.** On 2026-08-14 he sent a
screenshot of `build 2026-08-13a` and said he could not see `13g` even in an incognito window — and
he was completely right. Fourteen commits of playtest fixes were sitting on a branch nobody had
merged, so `/4` was still serving a build from before the session started. He had spent the
morning testing work that was never deployed. It was not a cache; **nothing is ever a cache here,
because there is no build step.** If he cannot see it, it is not on `main`.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**Pastry Pirates**

Pastry Pirates is a browser-based, pirate-themed pastry board game playable solo (against AI captains) or in real-time multiplayer via Firebase sync. Players sail a grid of islands gathering ingredients, trading, battling, fishing, and racing to bake a winning recipe. This milestone is a focused edit pass — a 15-item punch list from live playtesting covering two urgent bugs plus battle, AI, narration, UI/UX, bot, and end-of-voyage improvements.

**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

### Constraints

- **Tech stack**: Vanilla HTML/CSS/JS in `index.html`, Firebase Realtime DB for multiplayer — edits happen in place, no framework introduction
- **Compatibility**: Must run correctly in Safari (the storm perf bug is Safari-specific) and Chrome
- **Determinism**: The multiplayer deterministic engine + replay must remain intact — timer/pause fixes must not break lockstep state
- **Approval gates**: End-of-voyage badge redesign and storm-text rewrite require Wyatt's explicit sign-off before/within implementation

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- JavaScript (ES6+) - Game engine, UI rendering, real-time sync
- HTML5 - Page markup and structure
- CSS3 - Styling, animations, responsive design
- Python 3 - Simulation engine for game balance research and strategy analysis

## Runtime

- Browser (Chrome, Safari, Firefox, Edge)
- Python 3 (for offline simulation)
- None (browser build uses CDN and inline scripts)
- Python standard library only (no external dependencies)

## Frameworks

- Firebase SDK v12.15.0 (compat) - Realtime database for multiplayer sync
- No framework - vanilla HTML/CSS/JavaScript with inline styles and scripts
- `cocoa_pirates_sim.py` - Python-based game simulator (no external frameworks)

## Key Dependencies

- Firebase Realtime Database v12.15.0 - Multiplayer game state synchronization

## Configuration

- Firebase config embedded in `index.html` (lines 4542-4551)
- Contains public API key and database URL (intended public exposure per docs)
- No environment variables required
- Single HTML file served directly (no build step)
- All JavaScript inline in `<script>` tags
- CSS embedded in `<style>` tags
- Assets served from `/assets/` directory

## Platform Requirements

- Text editor for HTML/CSS/JS editing
- Python 3.x for running `cocoa_pirates_sim.py`
- Git for version control
- Static hosting (GitHub Pages, Netlify, or any HTTP server)
- Firebase Realtime Database project (free Spark tier sufficient)
- HTTPS recommended for production (Firebase config references public domain)

## Asset Pipeline

- PNG format for custom ingredient icons (`/assets/ingredients/*.png`)
- PNG format for UI icons (`/assets/icons/*.png`)
- PNG format for board elements (`/assets/board.png`, `/assets/dock.png`, etc.)
- PNG format for animated elements (compass dial, wind arrow, etc.)
- Fallback emoji rendering if image assets fail to load (`iconAt()` function in index.html line ~807)
- Static files served from repo root and `/assets/` subdirectories
- No image optimization or build step

## Compatibility Notes

- Modern browsers (ES6 support required)
- CSS Grid and Flexbox required
- Service Worker optional (not used)
- LocalStorage required for host-game recovery feature
- API key restricted to `wyattroy.github.io/*`, `localhost/*`, and `playpastrypirates.com/*` domains
- File protocol (`file://`) works for game but may show warnings on Firebase Auth calls

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- HTML/CSS/JS combined in single file: `index.html`
- Utility scripts use descriptive names: `scripts/battle_sim.js`, `scripts/real_game_test.js`
- Asset subdirectories organize by type: `assets/ingredients/`, `assets/icons/`, `assets/boats/`, `assets/islands/`, `assets/compass/`, `assets/clock/`
- camelCase consistently used for all function and method names
- Action-verb prefix pattern: `doDock()`, `tryTrade()`, `tradeCandidate()`, `adjPort()`, `windPush()`, `stepToward()`
- State-checking suffix pattern: `moored()`, `leeward()`, `blocked()`, `isHome()`, `isIsland()`, `onRim()`
- Short predicate functions: `flip()`, `shuffle()`, `r()` (RNG call)
- Descriptive utility methods: `sailBudget()`, `reachableFrom()`, `dockOccupiedBy()`, `tradeOpp()`
- Single-letter player identifiers: `p` (player), `q` (query/other player), `d` (direction), `c` (coordinates), `s` (shape), `o` (offset/other)
- Single-letter direction keys: `dk` (direction key — "N", "S", "E", "W")
- Array/collection iteration: `i`, `idx`, `k` (key)
- Boolean flags: `found`, `fled`, `done`, `moored`, `occupied`
- Coordinate pairs: always `[x, y]` — Manhattan distance via `man(a, b)`
- Ingredient identifiers: lowercase strings matching `ING_ALL` array
- Numeric accumulators: `round`, `flips`, `score`, `cost`, `budget`
- Config/strategy objects use full camelCase: `windPolicy`, `mechanic`, `personalty`
- UPPERCASE_SNAKE_CASE for constants: `ING_ALL`, `DIRS`, `SAIL_BUDGET`, `COIN_POOL`, `PERSONALITY`, `AW` (attack weights), `TW` (trade weights), `DW` (dock weights)
- Enum-like objects as UPPERCASE: `DIRS`, `DIRNAME`, `OPPOSITE`, `PERP`, `STORM_DIAG`
- Object constants grouped by function: `ING_NAME`, `ING_PLAIN`, `DOCK_PLACE`, `DOCK_FLAVOR`, `EMOJI_IMG`, `BOAT_IMG`, `ISLAND_SHAPE_IMG`
- Image paths consistently suffixed: `*_IMG` (e.g., `COIN_IMG`, `FLIP_HEADS_IMG`, `CROWN_IMG`)

## Code Style

- No formal linting or Prettier configuration
- Semicolons mandatory
- Strict mode enabled: `"use strict"` at script start
- Curly brace style: opening brace on same line (JavaScript convention)
- Compact spacing — conditions and control flow often condensed: `if(c){...}else{...}`
- Short variable names favor tight code density over long descriptive names
- No `.eslintrc`, `.prettierrc`, or `eslint.config.*` present
- Manual code review and consistency enforcement
- Vanilla JavaScript without TypeScript or build-time linting

## Import Organization

- Relative asset paths: `assets/ingredients/`, `assets/icons/`, `assets/clock/`, `assets/compass/`
- No module bundler or path alias configuration — direct relative imports only

## Error Handling

- Validation via early return: `if(this.blocked(nx))return;`
- Defensive null checks: `if(!c)return false;` followed by optional operations
- Fallback values in lookups: `ING_NAME[x]||x`, `dockPlace(x)||"the island"`
- Error thrown for broken invariants in test harness (real_game_test.js): `throw new Error("...");`
- Silent failure preferred for optional operations (e.g., image load failures in `iconAt()`)

## Logging

- Console.log for test output statistics and simulation results (battle_sim.js, real_game_test.js)
- Formatted output with padding/alignment: `String.padEnd()` for columnar output
- Percent formatting: `pct(n, d)` helper for consistent "XX.X%" output
- Gameplay events logged via `this.ev({...})` object structure rather than console calls

## Comments

- Section headers with === delimiters: `/* ================= Section Name ================= */`
- Non-obvious algorithm explanations (e.g., Dijkstra pathfinding in `stepToward()`)
- Design decisions with PDF/notes cross-references: `// notes/edits #5 ...` or `// PDF item 3c ...`
- Complex rules explanations with ruleset variants (e.g., battle mechanics choice in battle_sim.js)
- Warning comments for gotchas: `// NOTE: ...`, `// WARNING: ...`
- Inline disable comments for CSS animations in reduced-motion mode: `@media (prefers-reduced-motion: reduce)`
- Not used — this is vanilla JavaScript without TypeScript
- Complex functions use inline comments instead of doc blocks

## Function Design

- Small, focused utility functions typical: `cnt(arr, x)`, `pct(n, d)`, `man(a, b)` — 1–3 lines
- Medium business logic: 20–40 lines (e.g., `doDock()`, `tryTrade()`)
- Large methods handle complex state: 50+ lines (e.g., `windPush()`, `stepToward()`, `constructor`)
- No strict size limit — size is secondary to clarity and algorithmic necessity
- Functions favor small parameter counts (2–4 typical)
- Complex state passed via object: `cfg = { grid, storm, roundBoard, ... }`
- Callback/closure pattern for stateful operations: `frontier`, `best`, `dist` dicts in pathfinding
- Optional parameters via object properties or default values
- Boolean for checks: `moored()`, `blocked()`, `flip()`
- null for optional lookups: `adjPort()`, `dockOccupiedBy()`, `tradeCandidate()`
- Object for complex results: `{ downwind, a, d, round, flips, ... }` from `simBattle()`
- Undefined for mutations that don't return (many game methods)
- Empty object `{}` for event records passed to `ev()`

## Module Design

- Single class per file: `class Game { ... }`
- Constants defined at module scope before class
- Helper functions at module scope: `mulberry32()`, `unusedDefaultName()`, `emojify()`
- No explicit `export` statements — browser global or Node `vm` context
- Not used — monolithic index.html contains all game logic
- Utility scripts are standalone: battle_sim.js and real_game_test.js don't share imports
- HTML structure (1–800 lines): static markup + inline CSS
- Main script block (807–end): engine constants, Game class, UI event handlers, initialization
- CSS variables for theming: `--teal`, `--mint`, `--orange`, etc.
- Asset image mappings: organized by category (boats, islands, ingredients, icons)

## Coding Patterns

- Always `[x, y]` arrays
- String keys for dicts: `"x,y"` (e.g., `this.valid.has("5,3")`)
- Manhattan distance: `man(a, b)` — `Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1])`
- Seedable RNG: `mulberry32(seed)` returns function `() => [0, 1)`
- Always called: `this.r()` not `Math.random()`
- Deterministic replay via seed capture
- Centralized event buffer: `this.ev({t: eventType, ...fields})`
- Battle events include: `{t: "battle", a, d, downwind, flips, rounds, winner}`
- Trade events include: `{t: "trade", a, b, gave, got, kind: "swap"|"buy"}`
- Dock events include: `{t: "dock", p, ing, heads, got: "ing"|"coins"|"bought"|"empty"}`

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Game class** | Core game state machine: board layout, player positions, ingredient tracking, battle resolution, wind/storm effects, recipe tracking, victory conditions | `index.html:1017–1684` |
| **UI Rendering** | DOM updates, SVG board drawing, animation, modal dialogs, player panels, chat/narration display | `index.html:2170–3400` |
| **Event Handling** | User input (coin flips, movement, trades, battles), async decision flows for human players | `index.html:3447–4262` |
| **Bot AI** | 5 personality strategies (pirate, trader, balanced, rusher, monopolist) driving CPU player decisions | `index.html:999–1016`, `cocoa_pirates_sim.py` |
| **Battle System** | Coin flip mechanics, wind advantage scoring, defender flee logic, battle outcome resolution | `index.html:1405–1635`, `scripts/battle_sim.js` |
| **Multiplayer Sync** | Firebase RTDB watchers/writers for game state, chat, narration, coin flip coordination, shot clock | `index.html:4542–4740` |
| **Asset Preloading** | Image loading, caching, boot-time progress tracking via `preloadAssets()` | `index.html:5166–5180` |
| **Room Management** | Lobby creation/joining, turn order establishment, seat assignment, host/guest coordination | `index.html:4913–5006` |

## Pattern Overview

- Single monolithic HTML file (328 KB) containing all game logic and UI code mixed together
- Game state lives in a `Game` instance, updated via `Game.play()` main loop or human decisions
- Rendering is imperative: `render()` function reads game state and updates DOM/canvas
- Networking is event-driven: Firebase watchers trigger async callbacks that update state and re-render
- No component framework (React, Vue, etc.); vanilla DOM manipulation with CSS Grid for layout
- Async/await used for turn flows, animations, and network I/O coordination

## Layers

- Purpose: Maintain complete game state and simulation logic
- Location: `index.html` (lines 807–1684, between `<script>` tag start and UI marker)
- Contains: `Game` class, bot strategy logic, rule constants, helper math functions
- Depends on: Random number generator (`mulberry32`), helper functions (`man`, `shuffle`, etc.)
- Used by: UI rendering, event handlers, Firebase watchers
- Purpose: Display game state visually and collect player input
- Location: `index.html` (lines 2170–3400+)
- Contains: `render()`, `drawBoard()`, SVG DOM manipulation, modal dialogs, animation
- Depends on: Game instance state, asset images, CSS variables
- Used by: Event listeners, Firebase watchers (narration, battle updates), turn flow
- Purpose: Synchronize multiplayer state across browsers via Firebase
- Location: `index.html` (lines 4542–4740, `fbInit()`, `watchPresence()`, `watchRoom()`, etc.)
- Contains: Firebase initialization, data write/read operations, real-time watchers
- Depends on: Firebase client library (loaded from CDN), room ID, seat assignment
- Used by: Host browser (drives game, writes state), guest browsers (watch and render)
- Purpose: Persist session state and enable offline play
- Location: Browser `localStorage` API + Firebase RTDB
- Contains: Session tokens (`pp_sess`), solo game state (`pp_solo`), game logs, player presence
- Used by: Boot sequence (`boot()`), resume flows, post-game logging

## Data Flow

### Primary Request Path: Single-Player Game

### Multiplayer Flow: Real-Time Synchronization

- Authoritative state lives in the host browser's `Game` instance
- Guests have a read-only view (render-only, no state mutations)
- Pass-and-play (solo multi-player) uses local state only, no Firebase

### Event Narration Flow

### Battle Mechanics (Detailed)

## Key Abstractions

- Purpose: Encapsulate all mutable game information
- Examples: `game.players`, `game.home`, `game.islands`, `game.events`
- Pattern: Direct property access on Game instance; mutations trigger `render()` calls
- Purpose: Represent a discrete game occurrence (move, battle, trade, dock)
- Examples: `{ t: 'battle', a: 0, d: 1, winner: 0, flips: 8 }` (battle event)
- Pattern: Added to `game.events`, converted to narration via `EVENT_NARRATION` lookup table
- Purpose: Track what each player needs to collect and what they have
- Examples: `game.players[i].recipe`, `game.players[i].ingredients`
- Pattern: Arrays of ingredient strings; lookup tables map to emoji, images, names
- Purpose: Model island placement and ship movement
- Examples: `game.islands` (cell → ingredient), `game.players[i].pos` (x, y tuple)
- Pattern: Grid coordinates, Manhattan distance for adjacency checks, flood-fill for reachability
- Purpose: Encapsulate decision-making logic for CPU players
- Examples: `personality.pirate`, `personality.trader`, etc.
- Pattern: Functions receive game state and return an action; called during `Game.play()` main loop

## Entry Points

- Location: `index.html:5181`
- Triggers: Browser loads the HTML page
- Responsibilities: 
- Location: `index.html:1684–1693` (roundCfg), `1017–1178` (Game constructor)
- Triggers: User clicks "Start Game" or "Resume Game"
- Responsibilities:
- Location: `index.html:1636–1684`
- Triggers: After setup complete, awaited by `runLiveNet()` or `resumeSoloGame()`
- Responsibilities:
- Location: `index.html:4206–4262`
- Triggers: Game loop reaches a human player's turn
- Responsibilities:
- Location: `index.html:4263–4339`
- Triggers: Game loop reaches a bot player's turn
- Responsibilities:

## Architectural Constraints

- **Threading:** Single-threaded JavaScript event loop in browser. No Web Workers or background threads. Guest browsers are I/O-blocked waiting for Firebase updates.
- **Global state:** Game instance is a global variable `game`; player ID is global `myId`; room code is global `room`. Firebase connection is global `db`. No module/class isolation of these globals.
- **Circular imports:** Not applicable (no module system). All code is in a single script block evaluated sequentially.
- **Monolithic file:** 328 KB single HTML file makes code organization challenging. Game logic, UI rendering, and networking are interleaved with no clear separation.
- **Synchronous UI:** Rendering is synchronous; large renders (e.g., `drawBoard()`) can cause jank if board is complex.
- **Network dependency:** Multiplayer games require Firebase connectivity. No offline fallback for multiplayer (solo play works fully offline).
- **Host authority:** Host browser is single point of authority for game state. If host crashes mid-game, guests see a frozen game until host reconnects.

## Anti-Patterns

### Anti-Pattern 1: Mixed Concerns in Single File

- Difficult to test individual systems in isolation
- Hard to reason about data dependencies
- Refactoring one layer breaks others
- No clear API boundaries
- `game-engine.js` - Core Game class and logic only
- `ui-renderer.js` - Rendering functions that consume game state
- `networking.js` - Firebase watchers/writers
- `main.js` - Orchestrate the layers

### Anti-Pattern 2: Event Objects Are Loosely Typed

- No type hints; easy to access undefined fields
- `describe()` function has hard-to-maintain switch cases on `e.t`
- Typos in field names go undetected
- Event schema is implicit in test scripts only
- Define event shape interfaces/types (even in JSDoc)
- Create factory functions to construct events safely
- Export event schema so test scripts inherit validation

### Anti-Pattern 3: Render is Imperative and Scattered

- Easy to forget to call render() after a state update
- Out-of-order renders if async code branches
- Difficult to trace why UI is stale
- Hard to add logging/debugging for render calls
- Make all state mutations go through a dispatcher function
- Dispatcher calls render() once after each mutation batch
- Consider a minimal reactive system (even hand-rolled)

### Anti-Pattern 4: Firebase Watchers Are Scattered

- Boilerplate repeated for each watcher
- Easy to forget to `.off()` and leak listeners
- Error handling is inconsistent
- Hard to implement a global "network is down" state
- Create a watcher registry/manager
- Implement consistent lifecycle (setup, teardown, error handling)
- Make it easy to toggle all watchers on/off (for offline mode, testing)

## Error Handling

- Firebase writes are wrapped in `.catch(netFail(label))` which logs to console and displays a "sync trouble" banner
- Network reads that fail during game setup show an error dialog and clear session
- Human input validation happens in turn flow functions (e.g., `humanWind()` checks reachable tiles)
- Bot decisions are trusted (no validation); if a bot returns an illegal move, game state becomes corrupt
- No graceful degradation if assets fail to load (game shows blank board but continues)

## Cross-Cutting Concerns

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

## ASK WITH THE QUESTION UI. ALWAYS. NOT PROSE.

**Every question to Wyatt goes through the `AskUserQuestion` tool — never as a numbered list in a
chat message.** This is not a preference about formatting; it is the difference between a question
he can answer and a wall of text he has to retype answers to.

Wyatt, 2026-08-09: *"Ask me these questions using claude's question ui — and ALWAYS DO THIS.
Remember it. Write it where youll remember it. I tell you every day."*

**He has had to say this every day.** That is the whole reason it is at the top of this section
instead of buried in it. A session that writes "1. … 2. … 3. …" into a reply has already failed,
however good the questions are — **he is on a phone**, and answering fourteen prose questions by
thumb is work he should never have been handed.

Mechanics that matter, because they are why prose feels easier and must be resisted:

- The tool takes **up to 4 questions per call**, 2–4 options each. More than four questions means
  **more than one call, in sequence** — that is fine and expected. Do not collapse a dozen real
  questions into four vague ones to fit; ask them in rounds.
- **Put the measurement in the option text**, same rule as below. He answers far better against a
  real number than an abstraction.
- **Mark the recommendation** — first option, "(Recommended)" in the label.
- "Other" is added automatically; he uses it constantly, and his write-in is usually a better third
  answer than anything offered. Leave room for it, and read it as the most valuable reply in the set.

## ASK 2–5 CLARIFYING QUESTIONS BEFORE BUILDING ANYTHING NON-TRIVIAL

Wyatt, 2026-08-02, after three failed attempts at one small layout fix: *"it was really really
helpful for you to ask me those questions before building it this time. please do that always — ask
me 2-5 questions that help you clarify my intent. this feels like a good process."*

**This is a standing instruction, not a suggestion.** What he is expert at is *describing intent* —
his words. What he needs back is accurate execution of it. A session that skips the asking
substitutes its own guess for his intent, builds on the guess, and makes him catch it on screen. On
the mute button that cost **three rounds**: a wrong condition, then a stranded fallback, then a
guessed threshold that contradicted what he could plainly see on his own display. One round of
questions ended it.

How to ask well:

- **Before writing code**, not after a review round. Questions are cheapest when nothing is built.
- **2–5 of them**, each one where a different answer changes what gets built.
- **Never ask what the codebase or a measurement can answer.** Go and read it, or measure it, first —
  then ask only what is genuinely his call. Arriving with the homework done is the point.
- **Put the measurement in the question.** He answers far better against real numbers ("at 360px it
  fits beside the clock by 2px — does that count as room?") than against abstractions.
- Give concrete options with the trade-off stated, and mark a recommendation. He often replies with a
  better third answer, or a question back — that reply is the most valuable part, so leave room for it.
- **Taste, placement, wording and "how much is enough" are his. Mechanism is yours.**

## RESTATE EVERY MID-FLIGHT INSTRUCTION BEFORE CARRYING ON

**When Wyatt interrupts mid-task, name each instruction back to him in the very next message, before
continuing.** Not in a commit message, not folded silently into the work — in the reply he reads.

Wyatt, 2026-08-06: *"sometimes I need to interrupt you before you continue doing things, but I'm not
sure how... You didn't see them or acknowledge them."*

He had sent two corrections mid-build — put the flamingo in the sky, call the water turquoise. Both
arrived, both were implemented, both shipped. But nothing in the reply said so, so from where he sat
they had vanished, and he spent a whole round asking whether they had been read. **Acting on an
instruction is not the same as showing that you heard it.** A silent fix is indistinguishable from
being ignored, and he is on a phone with no way to check the diff.

One line is enough: *"got both — flamingo to the sky, water to turquoise."* Then keep working.

**Do not go hunting when he refers back to something he told you.** Asked to "read my two latest
notes", a session searched the working tree, every git ref, GitHub issues and Google Drive — and
never scrolled up. The notes were his own two messages. **Scroll up first; the conversation is the
most likely place anything he "wrote" lives.** Search the disk only after that comes up empty.

For his side of it, so it can be repeated: **Esc then type** interrupts immediately; **typing while
work is in progress** queues the message and delivers it at the next gap between actions. Both
reach the session intact. The queue is why a correction can feel ignored for a minute — a headless
browser probe can hold the turn open that long — which is one more reason to bound every probe
(see `docs/DRIVING-THE-GAME.md`), and to acknowledge the moment the message lands.

## Driving the game in a browser

`docs/DRIVING-THE-GAME.md` is required reading before any browser or playtest automation. Two traps waste the most sessions: the flippenator coin `#flipCoinWrap` **is** the flip button (it is not an `.apBtn` — this stalled three separate attempts), and a window narrower than about a second cannot be hand-driven at all, so use the armed watcher in §5d.

**Measuring COST is not measuring layout — see §8a's "two traps that both report ZERO".** The §8a
launch line carries `--disable-gpu`, which is right for sequencing/layout work and **wrong for cost**;
and an idle headless page stops producing frames, so animations measure as free. The same page, same
5s window, measured **0.2% CPU / 0 layouts per second** without a rAF loop and **11.1% / 60** with
one. Neither trap errors — both hand you a plausible wrong number. Drive frames, quote the fps beside
every cost figure, and attribute by ablation rather than by reading the code.

**Kill every headless Chrome and local server you start, in the same session you start them.** They do
not exit on their own. Wyatt found two abandoned probes burning **21% CPU each** — still running a
live game with an autoplay driver — alongside 17 stale `http.server` processes accumulated across
sessions, on a machine he was reporting as overheating. He was debugging a performance problem while
the tooling sent to investigate it was the thing heating his laptop.
`pkill -f remote-debugging-port` and `pkill -f http.server` before you finish.

**"At the end of the session" is too late, and it already failed once after being written down.**
Hours after the rule above was added, the same session left **53% CPU across 13 Chrome processes** on
Wyatt's machine and he had to ask a second time. The gap was *backgrounded* work: a probe launched
with `run_in_background` outlives the tool call that started it, so nothing forces a reckoning. So:

- **Bound every long probe.** A driver loop needs a deadline (`for (let i=0;i<N;i++)`), never
  `while (true)`. A full solo voyage takes minutes — see §5e and inject the state instead of playing
  to it.
- **Kill the probe the moment you have the answer**, not when the task ends. If a run is still going
  and you already know what it will tell you, that is a reason to kill it, not to let it finish.
- **Never leave a probe running across a reply.** If you are writing a message to Wyatt, either the
  probe is done or you kill it first — he is at the keyboard, on the machine it is heating.

## Keep local main and origin/main in sync — ALWAYS, not just after merges

Wyatt, 2026-08-02: *"we are going to pull origin main back down into local main after every merge so
that we can keep our local main synced."* Restated 2026-08-02 as a standing rule: **always keep main
in sync with origin/main.**

**Three moments, not one.** The original rule said "after every merge"; that was too narrow once
worktrees were retired and commits began landing directly on `main`. Sync:

1. **At the start of any session that will read or write `main`** — `git fetch origin` before you
   trust any ref, then pull if behind. Reading a stale ref is how this project lost a whole session.
2. **Immediately after anything that changes `main`** — a merge, a direct commit, a push. Not "at
   the end."
3. **Before reporting project status.** `.planning/` lives in the repo, so an out-of-date checkout
   reports an out-of-date project.

The work is not finished when the push succeeds. Finish it:

```bash
git push origin main && git pull origin main
```

Then confirm both directions are zero before saying it is done:

```bash
git rev-list --count origin/main..main   # 0
git rev-list --count main..origin/main   # 0
```

This is the same wound that already cost a whole session. Local `main` once sat **457 commits
behind** — a v1.0 snapshot with no `src/` at all — because nobody pulled after merging on GitHub,
and reading it produced a confident, entirely wrong conclusion that was then handed to four parallel
sessions as instructions. A merge landed through the GitHub UI, or pushed from another worktree,
does not update this clone. Pulling immediately means the stale ref never exists in the first place,
rather than being something you have to remember to distrust later.

Applies to any merge that reaches `main`, including one you did locally: push, pull, verify zero.

## Run the health check before reporting status or closing a phase

**GSD already has a checker, and the reason it has never helped is that nobody runs it.** On
2026-08-02 it was sitting on 43 unread warnings across four workstreams — including the stale
worktree that had just caused a completely wrong status report, and two workstreams whose STATE.md
said "blocked"/"outstanding" in the body while their own frontmatter said `complete`.

**So run it, and read it, at these two moments:**

```bash
node ~/.claude/gsd-core/bin/gsd-tools.cjs validate health --ws <workstream>
```

1. **Before answering "where are we"** or any status question.
2. **Before closing a phase**, alongside `npm test`.

Surface what it finds in your reply. A warning you read and dismissed is fine; a warning nobody
looked at is how this project loses days.

### Known noise — do NOT "fix" these

**W019 "Unrecognized .planning/ file"** fires on eight files Wyatt keeps deliberately:
`COPY-AND-TASTE-REVIEW.md`, `HANDOFF.md`, `PLAYTEST-*.md`, `REPO-STRUCTURE-AUDIT.md`, `WINDOWS.md`,
`art-audit.md`, `art-generation-process.md`, `how-to-play-pastry-pirates.md`. They are intentional,
they are not GSD artifacts, and **they must not be moved or deleted to silence the checker.** That is
32 of the 43 warnings — pure noise, and the reason the status reads a permanent "degraded".

**W002 fires on any phase number appearing in prose.** It greps document text for "Phase N" and warns
if N is not declared in that workstream. Writing an explanatory note that mentions another phase
*adds warnings* — this was demonstrated accidentally on 2026-08-02, when four correction notes pushed
the count from 43 to 47. Not a real finding; do not contort your writing to avoid it, but do not
chase it either.

**W011 is not a contradiction detector, despite appearances.** It fires whenever STATE's current
phase is marked `[x]` in ROADMAP — *even when STATE also says complete and the two perfectly agree*.
Verified 2026-08-02: `sound-clock` says complete, the roadmap says complete, and it still warns. It
is useful only because it **quotes STATE's status line in the message**, so a stale line becomes
visible while you are reading it. Read the quoted text; ignore the verdict.

**W011 also false-positives on a phase number in a neighbouring line.** It matched "Phase 20" inside
*Phase 19's* description (`"before Phase 20 invests"`), saw that line's `- [x]`, and reported Phase 20
complete when it had not been started. **Confirm against the actual checkbox before believing it.**

### Honest summary of what this checker is worth here

Of 43 warnings: **32 are W019 noise** on files kept deliberately, **~7 are W002/W011 artefacts** of
prose-grepping, and the genuinely valuable one was **W017, the stale worktree**. So run it and *read
the quoted text*, but treat the pass/fail verdict as close to meaningless — the value is in what it
incidentally shows you, not in whether it goes green. It will likely never go green.

### What it does NOT check — where the real damage has come from

Every GSD check reads **frontmatter and file structure**. None reads the prose inside a document. All
four of 2026-08-02's record failures lived in that gap, so the checker is a floor, not a ceiling:

| Failure | Why no structural check can see it |
|---|---|
| A checklist row contradicting its own phase's VERIFICATION.md | Nothing compares sibling documents |
| Frontmatter `passed` while the body says `human_needed` | The body is never read |
| A ledger predicting the future (*"18-07 deletes the loser"*) — true when written, false 20 minutes later | Semantic, not structural |
| A hand-typed progress figure (20% when it was 80%) | It checks *which* phase, never recomputes the number |

**Three conventions close that gap, and they cost nothing:**

1. **Point, don't restate.** A checklist row must link to the verification report, never repeat its
   verdict. A pointer cannot go stale; a copy always can.
2. **Never hand-type a number that can be counted.** Progress is derivable from what is on disk.
   Any percentage typed into a document is wrong the moment work continues.
3. **No future tense in an append-only record.** "Will be deleted", "pending", "to be decided" belong
   in the roadmap where decisions live. A ledger records what happened. A prediction in a log rots
   into a lie with nobody editing it.

## The voice boundary — the credits and About page are NOT in pirate speak

**Player-facing text has two registers, and the divide is diegetic — whether the words come from
inside the game world or from outside it.**

| Register | Voice | Where |
|---|---|---|
| **Inside the game world** | Pirate speak — `ye`, `yer`, `blowin'`, captain-address | Narration, battle/trade/dock lines, prompts, buttons, the board, the lobby, End of Voyage |
| **Outside the game world** | Wyatt's own plain first-person voice | Credits, the About page, and anywhere he speaks as himself to a real person |

Wyatt, 2026-08-02: *"the design intent is that the credits page is not 'in the game world' so it
isn't written in pirate speak."*

The credits thank real people — Luis Zanforlin, Nick Lesko, Xavaar, his parents, his partner Juju —
in his own voice ("a designer and overly enthusiastic noodle", "my sweet partner Juju"). Pirate
speak there would put a costume on a genuine thank-you.

**So a `ye`/`you` difference between the credits-and-About copy and the rest of the game is correct
and expected. Never "fix" it.** In 2026-08-02 a retroactive copy audit flagged the credits line
`"every sound effect you hear"` as drift, because the copy inventory had recorded it in a `ye` form
it should never have had. The shipped text was right; the record was wrong.

**He had already told an earlier session this rule and it was lost** — which is the whole reason it
is written here. Full detail in `.planning/todos/pending/copy-shipped-vs-approved-gate.md` under
"THE VOICE BOUNDARY".

## Work in the main checkout — git worktrees are retired

**The only working directory is `/Users/wyattroy/Documents/Projects/pastrypirates`.** Wyatt retired
worktrees on 2026-08-02; ten stale ones were removed that day. Do not create new ones, and do not
assume the directory you woke up in is the main checkout.

**`.planning/` is a tracked directory, so it is branch-scoped.** A worktree sitting on a stale branch
shows that branch's frozen snapshot of `STATE.md`, `ROADMAP.md` and every workstream file — with no
error and no warning. It simply reports an older project.

This is not hypothetical. On 2026-08-02 a `/gsd-progress` run inside
`.claude/worktrees/gsd-skill-persistence-3252ba` reported v1.3 as **"0 of 5 phases, nothing
started."** The truth on `main` was **four of five phases shipped and live**, with only Phase 20
left. Wyatt believed he was in the main checkout, and was handed a confident, entirely wrong status
report — the same failure mode as the stale-`main` incident above, one level further out.

**Before reading any `.planning/` file or answering "where are we":**

```bash
cd /Users/wyattroy/Documents/Projects/pastrypirates && git rev-parse --show-toplevel
```

If that is not where you are, `cd` there first. **The tell that you got this wrong:** a workstream
`STATE.md` reading "Not started" for work you know shipped.

## NEVER copy CNAME into another repo — it can take the live game down

**Deploy to the preview site with `scripts/deploy-preview.sh` only. Do not hand-roll the sync.**

`CNAME` in this repo contains `playpastrypirates.com`. GitHub Pages reads that file as a *claim* on
the domain, so a second repo containing it does not fail safe — GitHub unsets the domain on one of
them and **the live game goes down for real players**, with DNS and certificate re-issue standing
between you and recovery.

**Two separate Claude sessions have now come within one command of doing this.** Both were writing
their own `rsync`/`cp` to publish a preview build. That is the pattern to distrust: the preview repo
*is* a copy of this one, so "copy everything across" feels obviously correct, and `CNAME` is a
21-byte file nobody notices in a 130-file diff.

`scripts/deploy-preview.sh` excludes it and then re-checks the checkout before pushing, because the
part that failed twice is the judgement of whoever ran the command — so the protection cannot live
in judgement.

The same care applies to any repo, gist, artifact, bucket or deploy target that is not this one:
**`CNAME` never leaves.** If you are ever copying this repo wholesale anywhere, stop and either use
the script or write down explicitly why the destination cannot contest the domain.

**`CNAME` is not the only one.** `robots.txt` and `sitemap.xml` are the same hazard in different
clothes — every one of them asserts *"this deployment is playpastrypirates.com"*, which is false
anywhere else and harmful. The very first run of the deploy script proved the point: it republished
this repo's live `robots.txt` (`Allow: /`) over the preview's `Disallow: /` and added a sitemap of
live URLs, which would have invited Google to index the preview as duplicate content against the
real game. Caught only by reading the deploy diff. All three are excluded now — **when you add a
file that identifies the live site, add it to `EXCLUDES` in the same commit.**

## Hard-won lessons — READ `docs/HARD-WON-LESSONS.md`

Everything that has gone wrong, nearly gone wrong, or cost real time on this project lives in one
document: **`docs/HARD-WON-LESSONS.md`**. It is the sibling of `docs/DRIVING-THE-GAME.md` — that one
is *how* to drive the game, this one is *what to distrust*.

**READ IT AT THE START OF EVERY SESSION, ALL OF IT, BEFORE THE FIRST TOOL CALL.** Not the first two
sections — the whole document. This instruction is stronger than it was because the weaker version
failed: on 2026-08-08 a session hit **three lessons already written in that file** and paid for each
again — `http.server` inheriting the cwd, `no_undef_check` seeing only call-position identifiers, and
shipping a check that could not fail. All three were on the page, in those words, unread. Reading it
costs a minute; not reading it has now cost parts of three sessions.

Wyatt, 2026-08-08: *"Write down all of your recent learnings to your document where you record
these — and then tell me what it is called, and make yourself read it before starting new sessions."*

**§0 is the newest and the most expensive: READ THE SUBSYSTEM'S OWN DESIGN DOCUMENT BEFORE YOU
WRITE A LINE.** On 2026-08-13 a day went into building wind-aware route costing for the bots that
`docs/BOT-V3-RACE-PLANNER.md` §4 says, in one sentence, already shipped — `windReach3()`, in the
same file being edited. grep had been run over that file repeatedly and cannot surface a capability
that exists under a different name. Ask what exists by BEHAVIOUR ("does anything here already price
a route under the wind?"), ask it of the doc, and ask before writing code. The same section carries
the other half: **re-read a lesson at its TRIGGER, not once at session start** — that day's session
had read the whole lessons file that morning and still committed the exact rescaling failure it
describes.

The two sections that have bitten most often, if you read nothing else:

1. **Absolute paths, always.** The Bash tool's cwd resets and announces it at the bottom of unrelated
   output. `v2/` mirrors the repo's layout, so `src/ui/util.js` resolves in BOTH trees — a mis-rooted
   path opens a real file, applies cleanly, passes `node --check`, and modifies the wrong copy. Every
   safety signal reports success. Run the constraint as a command after each batch of edits:
   ```bash
   git diff --name-only | grep -v '^v2/'   # must print NOTHING
   ```
2. **Do not trust your own reasoning over a measurement.** Inferring from a screenshot and presenting
   it as proof was wrong twice in one session. Verify against an independent path, never against the
   suspect itself — and check that a check can FAIL before believing it passing.

The rest covers tooling that lies to you (`no_undef_check` only sees call-position identifiers; Chrome
caches ES modules per URL), probe hygiene, and the design lessons — including that a rule the bots
ignore reads as an unfair rule, and that deleting a punishment can delete a whole family of edge cases.

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
