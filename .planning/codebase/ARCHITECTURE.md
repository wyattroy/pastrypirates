<!-- refreshed: 2026-07-22 -->
# Architecture

**Analysis Date:** 2026-07-22

## System Overview

Pastry Pirates is a single-page web application (SPA) browser-based pirate board game with optional multiplayer support. The entire application is centered around a monolithic game engine embedded in `index.html`, with real-time multiplayer synchronization via Firebase Realtime Database (RTDB).

```text
┌─────────────────────────────────────────────────────────────┐
│                      Browser UI Layer                        │
│  DOM/Canvas Rendering, Event Listeners, Input Handling      │
│  `index.html` (UI section — after "================= UI")   │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              Game Engine (State Machine)                     │
│          `Game` class + supporting logic                     │
│  `index.html` (script block, lines 807–1964)                │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│         Networking & Synchronization                        │
│   Firebase Realtime Database, presence tracking             │
│   `index.html` (networking functions, fbInit, watchers)    │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│  External Services & Storage                                │
│  Firebase (auth-free, real-time DB, game logging)           │
│  localStorage (session state, solo game resume)             │
│  Assets CDN (images, icons, pastry art)                    │
└─────────────────────────────────────────────────────────────┘
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

**Overall:** State machine + event-driven rendering

**Key Characteristics:**
- Single monolithic HTML file (328 KB) containing all game logic and UI code mixed together
- Game state lives in a `Game` instance, updated via `Game.play()` main loop or human decisions
- Rendering is imperative: `render()` function reads game state and updates DOM/canvas
- Networking is event-driven: Firebase watchers trigger async callbacks that update state and re-render
- No component framework (React, Vue, etc.); vanilla DOM manipulation with CSS Grid for layout
- Async/await used for turn flows, animations, and network I/O coordination

## Layers

**Game Engine Layer:**
- Purpose: Maintain complete game state and simulation logic
- Location: `index.html` (lines 807–1684, between `<script>` tag start and UI marker)
- Contains: `Game` class, bot strategy logic, rule constants, helper math functions
- Depends on: Random number generator (`mulberry32`), helper functions (`man`, `shuffle`, etc.)
- Used by: UI rendering, event handlers, Firebase watchers

**UI Rendering Layer:**
- Purpose: Display game state visually and collect player input
- Location: `index.html` (lines 2170–3400+)
- Contains: `render()`, `drawBoard()`, SVG DOM manipulation, modal dialogs, animation
- Depends on: Game instance state, asset images, CSS variables
- Used by: Event listeners, Firebase watchers (narration, battle updates), turn flow

**Networking Layer:**
- Purpose: Synchronize multiplayer state across browsers via Firebase
- Location: `index.html` (lines 4542–4740, `fbInit()`, `watchPresence()`, `watchRoom()`, etc.)
- Contains: Firebase initialization, data write/read operations, real-time watchers
- Depends on: Firebase client library (loaded from CDN), room ID, seat assignment
- Used by: Host browser (drives game, writes state), guest browsers (watch and render)

**Storage Layer:**
- Purpose: Persist session state and enable offline play
- Location: Browser `localStorage` API + Firebase RTDB
- Contains: Session tokens (`pp_sess`), solo game state (`pp_solo`), game logs, player presence
- Used by: Boot sequence (`boot()`), resume flows, post-game logging

## Data Flow

### Primary Request Path: Single-Player Game

1. **Boot** (`boot()` at line 5224)
   - Initialize player ID, check localStorage for resume state
   - Preload assets, hide boot loader once ready
   - Wire event handlers for lobby UI
   - If solo game state exists in localStorage, resume it

2. **Game Setup** (`roundCfg()`, new `Game()`)
   - Generate board config (grid size, island placement, ingredient layout)
   - Create Game instance with seed for determinism
   - Seed bots if no multiplayer room

3. **Game Loop** (`Game.play()` at line 1636)
   - Repeat for each player's turn:
     - Roll wind direction, move player, resolve special events
     - Resolve docking/island interactions, ingredient flips
     - If human: wait for user input via event listeners
     - If bot: call strategy function to decide action
     - Render board and update UI
   - Resolve battles when ships collide
   - Check victory conditions (first to finish recipe and dock home)
   - Show final stats/bake-off results

4. **Rendering** (`render()` at line 2470)
   - Read current game state (positions, ingredients, coins)
   - Update board SVG (ship positions, storm overlay)
   - Update captain panels (coins, held ingredients, recipe progress)
   - Update action panel and narration with event text
   - Trigger animations (pop-ups, transitions)

### Multiplayer Flow: Real-Time Synchronization

1. **Room Creation** (`createRoom()` at line 4913)
   - Host creates room code, writes room object to Firebase `/rooms/{code}`
   - Sets initial config, seat list, host ID
   - Players poll presence channel to see available games

2. **Join & Sync** (`joinRoom()`, `watchRoom()` at lines 4934–4998)
   - Guest reads room object, claims a seat (transactional update)
   - Joins presence channel to signal "player online"
   - Watches `/rooms/{code}/status` for host signal to start
   - Watches `/rooms/{code}/narration` for game event messages
   - Watches `/rooms/{code}/flip` and `/rooms/{code}/battle` for real-time actions

3. **Game Running** (`runLiveNet()` at line 4435)
   - Host executes Game.play() loop but doesn't update DOM directly
   - Host writes game snapshots and events to Firebase at key moments:
     - Coin flip state → `/rooms/{code}/flip`
     - Battle outcomes → `/rooms/{code}/battle`
     - Narration/events → `/rooms/{code}/narr`
     - Chat messages → `/rooms/{code}/chat`
   - Guest browsers watch these paths and call `render()` when data arrives
   - Human players are prompted locally; host waits for decision via `/rooms/{code}/response`

4. **Host Resume** (`resumeHostGame()` at line 5108)
   - On page reload, host checks if room exists and is mid-game
   - Extracts decision log from Firebase (`/rooms/{code}/dlog`)
   - Replays all past decisions through Game instance to rebuild exact state
   - Resumes from where it left off (host has authoritative state)

**State Management:**
- Authoritative state lives in the host browser's `Game` instance
- Guests have a read-only view (render-only, no state mutations)
- Pass-and-play (solo multi-player) uses local state only, no Firebase

### Event Narration Flow

When significant game events occur, they are captured and broadcast:

1. Event happens → Added to `game.events` array
2. Event is converted to HTML via `describe(event)` and `EVENT_NARRATION`
3. Narration HTML is displayed locally to all players
4. If multiplayer: host writes to `/rooms/{code}/narr`, guests receive via watcher
5. If solo/offline: rendered directly to DOM

### Battle Mechanics (Detailed)

The battle system operates via an async loop inside `asyncBattle()` at line 3834:

1. Attacker and defender are adjacent on the board
2. Wind direction is rolled (25% attacker downwind, 25% defender downwind, 50% crosswind)
3. For each battle round:
   - Both players flip a coin (async coin flip UI or instant for bots)
   - Score is determined: heads=1 point, tails=0, with wind bonus if applicable
   - First to 2 points wins; defender can pay to flee
4. Winner takes spoils (loser pays coins and/or ingredient)
5. Ships are repositioned based on battle outcome

## Key Abstractions

**Game State**
- Purpose: Encapsulate all mutable game information
- Examples: `game.players`, `game.home`, `game.islands`, `game.events`
- Pattern: Direct property access on Game instance; mutations trigger `render()` calls

**Event Object**
- Purpose: Represent a discrete game occurrence (move, battle, trade, dock)
- Examples: `{ t: 'battle', a: 0, d: 1, winner: 0, flips: 8 }` (battle event)
- Pattern: Added to `game.events`, converted to narration via `EVENT_NARRATION` lookup table

**Recipe & Ingredients**
- Purpose: Track what each player needs to collect and what they have
- Examples: `game.players[i].recipe`, `game.players[i].ingredients`
- Pattern: Arrays of ingredient strings; lookup tables map to emoji, images, names

**Board & Position**
- Purpose: Model island placement and ship movement
- Examples: `game.islands` (cell → ingredient), `game.players[i].pos` (x, y tuple)
- Pattern: Grid coordinates, Manhattan distance for adjacency checks, flood-fill for reachability

**Bot Strategy**
- Purpose: Encapsulate decision-making logic for CPU players
- Examples: `personality.pirate`, `personality.trader`, etc.
- Pattern: Functions receive game state and return an action; called during `Game.play()` main loop

## Entry Points

**Page Load (`boot()` at line 5181):**
- Location: `index.html:5181`
- Triggers: Browser loads the HTML page
- Responsibilities: 
  - Initialize player ID from localStorage or generate new
  - Preload assets with timeout fallback
  - Check for resume state (solo or multiplayer)
  - Wire event handlers for UI buttons
  - Initialize Firebase if configured
  - Show welcome screen or resume game

**Game Initialization (`roundCfg()` / `new Game()`):**
- Location: `index.html:1684–1693` (roundCfg), `1017–1178` (Game constructor)
- Triggers: User clicks "Start Game" or "Resume Game"
- Responsibilities:
  - Generate game config from player strategies
  - Place islands and docks randomly (seeded)
  - Initialize player positions at home dock
  - Assign ingredients to islands
  - Set up recipe cards for all players

**Game Loop (`Game.play()` at line 1636):**
- Location: `index.html:1636–1684`
- Triggers: After setup complete, awaited by `runLiveNet()` or `resumeSoloGame()`
- Responsibilities:
  - Iterate through rounds (each player gets a turn)
  - Roll wind, apply effects, trigger moves
  - Prompt human players for decisions via event listeners
  - Call bot strategies for CPU players
  - Resolve battles when ships collide
  - Update narration and render board after each action
  - Check victory conditions and end game

**Turn Flow (Human) (`humanTurn()` at line 4206):**
- Location: `index.html:4206–4262`
- Triggers: Game loop reaches a human player's turn
- Responsibilities:
  - Wind is auto-rolled and applied (or human chooses dodge once)
  - If docked, offer flip-coin or dock-again option
  - If in water, move or battle options appear
  - Wait for player input (event listener callback)
  - Validate choice against game rules
  - Execute chosen action, return to game loop

**Turn Flow (Bot) (`botTurn()` at line 4263):**
- Location: `index.html:4263–4339`
- Triggers: Game loop reaches a bot player's turn
- Responsibilities:
  - Instant decision making (no UI delay)
  - Call strategy function with game state snapshot
  - Execute action returned by strategy
  - Immediately return to game loop

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

**What happens:** Game logic, UI rendering, networking, and asset loading are all in one 328 KB HTML file with interleaved code.

**Why it's wrong:** 
- Difficult to test individual systems in isolation
- Hard to reason about data dependencies
- Refactoring one layer breaks others
- No clear API boundaries

**Do this instead:** Split into separate modules:
- `game-engine.js` - Core Game class and logic only
- `ui-renderer.js` - Rendering functions that consume game state
- `networking.js` - Firebase watchers/writers
- `main.js` - Orchestrate the layers

### Anti-Pattern 2: Event Objects Are Loosely Typed

**What happens:** Battle events, move events, dock events are all plain objects with inconsistent field naming (`e.t`, `e.a`, `e.d`, sometimes `e.downwind` or `e.winner`).

**Why it's wrong:**
- No type hints; easy to access undefined fields
- `describe()` function has hard-to-maintain switch cases on `e.t`
- Typos in field names go undetected
- Event schema is implicit in test scripts only

**Do this instead:** 
- Define event shape interfaces/types (even in JSDoc)
- Create factory functions to construct events safely
- Export event schema so test scripts inherit validation

### Anti-Pattern 3: Render is Imperative and Scattered

**What happens:** Many async functions call `render()` directly after state changes. No clear "render after every state mutation" pipeline.

**Why it's wrong:**
- Easy to forget to call render() after a state update
- Out-of-order renders if async code branches
- Difficult to trace why UI is stale
- Hard to add logging/debugging for render calls

**Do this instead:**
- Make all state mutations go through a dispatcher function
- Dispatcher calls render() once after each mutation batch
- Consider a minimal reactive system (even hand-rolled)

### Anti-Pattern 4: Firebase Watchers Are Scattered

**What happens:** `watchFlip()`, `watchBattle()`, `watchChat()`, `watchTimer()` are defined all over the file. Each one manually handles Firebase `.on("value", ...)` and error cases.

**Why it's wrong:**
- Boilerplate repeated for each watcher
- Easy to forget to `.off()` and leak listeners
- Error handling is inconsistent
- Hard to implement a global "network is down" state

**Do this instead:**
- Create a watcher registry/manager
- Implement consistent lifecycle (setup, teardown, error handling)
- Make it easy to toggle all watchers on/off (for offline mode, testing)

## Error Handling

**Strategy:** Mostly silent failures with visual feedback where possible.

**Patterns:**
- Firebase writes are wrapped in `.catch(netFail(label))` which logs to console and displays a "sync trouble" banner
- Network reads that fail during game setup show an error dialog and clear session
- Human input validation happens in turn flow functions (e.g., `humanWind()` checks reachable tiles)
- Bot decisions are trusted (no validation); if a bot returns an illegal move, game state becomes corrupt
- No graceful degradation if assets fail to load (game shows blank board but continues)

## Cross-Cutting Concerns

**Logging:** Event-driven via `game.events` array. Each event is manually added as game actions occur. Events are converted to human-readable narration via `EVENT_NARRATION` table and displayed in the narration panel. Post-game, events are serialized and written to Firebase game logs.

**Validation:** Minimal. Turn flow functions check that moves are reachable (flood-fill from current position). Coin flip inputs are accepted from UI without double-checking legality (trust the UI). Bot strategies are not validated.

**Authentication:** None. Game is free-to-play, anyone can join any room code. Presence is tracked via player ID (generated from random UUID, not authenticated), but there's no user login or permission system.

---

*Architecture analysis: 2026-07-22*
