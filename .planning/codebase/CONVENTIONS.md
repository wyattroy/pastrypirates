# Coding Conventions

**Analysis Date:** 2026-07-22

## Naming Patterns

**Files:**
- HTML/CSS/JS combined in single file: `index.html`
- Utility scripts use descriptive names: `scripts/battle_sim.js`, `scripts/real_game_test.js`
- Asset subdirectories organize by type: `assets/ingredients/`, `assets/icons/`, `assets/boats/`, `assets/islands/`, `assets/compass/`, `assets/clock/`

**Functions:**
- camelCase consistently used for all function and method names
- Action-verb prefix pattern: `doDock()`, `tryTrade()`, `tradeCandidate()`, `adjPort()`, `windPush()`, `stepToward()`
- State-checking suffix pattern: `moored()`, `leeward()`, `blocked()`, `isHome()`, `isIsland()`, `onRim()`
- Short predicate functions: `flip()`, `shuffle()`, `r()` (RNG call)
- Descriptive utility methods: `sailBudget()`, `reachableFrom()`, `dockOccupiedBy()`, `tradeOpp()`

**Variables:**
- Single-letter player identifiers: `p` (player), `q` (query/other player), `d` (direction), `c` (coordinates), `s` (shape), `o` (offset/other)
- Single-letter direction keys: `dk` (direction key — "N", "S", "E", "W")
- Array/collection iteration: `i`, `idx`, `k` (key)
- Boolean flags: `found`, `fled`, `done`, `moored`, `occupied`
- Coordinate pairs: always `[x, y]` — Manhattan distance via `man(a, b)`
- Ingredient identifiers: lowercase strings matching `ING_ALL` array
- Numeric accumulators: `round`, `flips`, `score`, `cost`, `budget`
- Config/strategy objects use full camelCase: `windPolicy`, `mechanic`, `personalty`

**Types & Constants:**
- UPPERCASE_SNAKE_CASE for constants: `ING_ALL`, `DIRS`, `SAIL_BUDGET`, `COIN_POOL`, `PERSONALITY`, `AW` (attack weights), `TW` (trade weights), `DW` (dock weights)
- Enum-like objects as UPPERCASE: `DIRS`, `DIRNAME`, `OPPOSITE`, `PERP`, `STORM_DIAG`
- Object constants grouped by function: `ING_NAME`, `ING_PLAIN`, `DOCK_PLACE`, `DOCK_FLAVOR`, `EMOJI_IMG`, `BOAT_IMG`, `ISLAND_SHAPE_IMG`
- Image paths consistently suffixed: `*_IMG` (e.g., `COIN_IMG`, `FLIP_HEADS_IMG`, `CROWN_IMG`)

## Code Style

**Formatting:**
- No formal linting or Prettier configuration
- Semicolons mandatory
- Strict mode enabled: `"use strict"` at script start
- Curly brace style: opening brace on same line (JavaScript convention)
- Compact spacing — conditions and control flow often condensed: `if(c){...}else{...}`
- Short variable names favor tight code density over long descriptive names

**Linting:**
- No `.eslintrc`, `.prettierrc`, or `eslint.config.*` present
- Manual code review and consistency enforcement
- Vanilla JavaScript without TypeScript or build-time linting

## Import Organization

**Pattern:**
1. RNG utilities (mulberry32)
2. Engine constants and helpers
3. UI HTML elements and styling
4. Game class definition
5. Game instance initialization and event handlers

**Path Aliases:**
- Relative asset paths: `assets/ingredients/`, `assets/icons/`, `assets/clock/`, `assets/compass/`
- No module bundler or path alias configuration — direct relative imports only

## Error Handling

**Patterns:**
- Validation via early return: `if(this.blocked(nx))return;`
- Defensive null checks: `if(!c)return false;` followed by optional operations
- Fallback values in lookups: `ING_NAME[x]||x`, `dockPlace(x)||"the island"`
- Error thrown for broken invariants in test harness (real_game_test.js): `throw new Error("...");`
- Silent failure preferred for optional operations (e.g., image load failures in `iconAt()`)

## Logging

**Framework:** console (no dedicated logging library)

**Patterns:**
- Console.log for test output statistics and simulation results (battle_sim.js, real_game_test.js)
- Formatted output with padding/alignment: `String.padEnd()` for columnar output
- Percent formatting: `pct(n, d)` helper for consistent "XX.X%" output
- Gameplay events logged via `this.ev({...})` object structure rather than console calls

## Comments

**When to Comment:**
- Section headers with === delimiters: `/* ================= Section Name ================= */`
- Non-obvious algorithm explanations (e.g., Dijkstra pathfinding in `stepToward()`)
- Design decisions with PDF/notes cross-references: `// notes/edits #5 ...` or `// PDF item 3c ...`
- Complex rules explanations with ruleset variants (e.g., battle mechanics choice in battle_sim.js)
- Warning comments for gotchas: `// NOTE: ...`, `// WARNING: ...`
- Inline disable comments for CSS animations in reduced-motion mode: `@media (prefers-reduced-motion: reduce)`

**JSDoc/TSDoc:**
- Not used — this is vanilla JavaScript without TypeScript
- Complex functions use inline comments instead of doc blocks

## Function Design

**Size:**
- Small, focused utility functions typical: `cnt(arr, x)`, `pct(n, d)`, `man(a, b)` — 1–3 lines
- Medium business logic: 20–40 lines (e.g., `doDock()`, `tryTrade()`)
- Large methods handle complex state: 50+ lines (e.g., `windPush()`, `stepToward()`, `constructor`)
- No strict size limit — size is secondary to clarity and algorithmic necessity

**Parameters:**
- Functions favor small parameter counts (2–4 typical)
- Complex state passed via object: `cfg = { grid, storm, roundBoard, ... }`
- Callback/closure pattern for stateful operations: `frontier`, `best`, `dist` dicts in pathfinding
- Optional parameters via object properties or default values

**Return Values:**
- Boolean for checks: `moored()`, `blocked()`, `flip()`
- null for optional lookups: `adjPort()`, `dockOccupiedBy()`, `tradeCandidate()`
- Object for complex results: `{ downwind, a, d, round, flips, ... }` from `simBattle()`
- Undefined for mutations that don't return (many game methods)
- Empty object `{}` for event records passed to `ev()`

## Module Design

**Exports:**
- Single class per file: `class Game { ... }`
- Constants defined at module scope before class
- Helper functions at module scope: `mulberry32()`, `unusedDefaultName()`, `emojify()`
- No explicit `export` statements — browser global or Node `vm` context

**Barrel Files:**
- Not used — monolithic index.html contains all game logic
- Utility scripts are standalone: battle_sim.js and real_game_test.js don't share imports

**Organization:**
- HTML structure (1–800 lines): static markup + inline CSS
- Main script block (807–end): engine constants, Game class, UI event handlers, initialization
- CSS variables for theming: `--teal`, `--mint`, `--orange`, etc.
- Asset image mappings: organized by category (boats, islands, ingredients, icons)

## Coding Patterns

**Initialization Pattern:**
```javascript
const cfg = { grid: 11, storm: 0.2, ... };
const g = new Game(cfg, seedValue, record=true);
g.play();
```

**Coordinate Representation:**
- Always `[x, y]` arrays
- String keys for dicts: `"x,y"` (e.g., `this.valid.has("5,3")`)
- Manhattan distance: `man(a, b)` — `Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1])`

**Random Number Pattern:**
- Seedable RNG: `mulberry32(seed)` returns function `() => [0, 1)`
- Always called: `this.r()` not `Math.random()`
- Deterministic replay via seed capture

**Event Logging Pattern:**
- Centralized event buffer: `this.ev({t: eventType, ...fields})`
- Battle events include: `{t: "battle", a, d, downwind, flips, rounds, winner}`
- Trade events include: `{t: "trade", a, b, gave, got, kind: "swap"|"buy"}`
- Dock events include: `{t: "dock", p, ing, heads, got: "ing"|"coins"|"bought"|"empty"}`

**Strategy/Personality Pattern:**
```javascript
PERSONALITY = {
  pirate:     { attackMult: 1.3, tradeMult: 0.6, ... },
  trader:     { attackMult: 0.5, tradeMult: 1.6, ... },
  // ... more strategies
}
```

**Lookup Table Pattern:**
```javascript
const ING_NAME = { wheat: "Toasty Wheat", dairy: "Fresh Milk", ... };
const helper = x => ING_NAME[x] || x;  // fallback to input
```

---

*Convention analysis: 2026-07-22*
