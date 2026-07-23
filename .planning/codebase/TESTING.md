# Testing Patterns

**Analysis Date:** 2026-07-22

## Test Framework

**Status:** No formal test framework configured (no Jest, Vitest, Mocha, or similar)

**Testing Approach:**
- Manual headless simulation via Node.js scripts
- Game logic extracted and tested in VM context
- Statistics gathered from multiple game runs for validation
- No assertion library — results compared by inspection and console output

## Test File Organization

**Location:**
- Test files in `scripts/` directory (sibling to main `index.html`)
- `scripts/battle_sim.js` — isolated battle mechanic simulator
- `scripts/real_game_test.js` — full game simulator using real Game class

**Naming:**
- Not following standard `.test.js` or `.spec.js` convention
- Named descriptively by functionality: `battle_sim.js`, `real_game_test.js`

**Structure:**
```
scripts/
├── battle_sim.js         # Headless battle mechanics validator
├── battle_sim.html       # HTML harness (unused in CI)
└── real_game_test.js     # Real Game class validator
```

## Test Structure

**Battle Simulator (battle_sim.js):**
```javascript
// Configuration knobs at top
const COIN_POOL = 3;
const P_ATTACKER_DOWNWIND = 0.25;
const MECHANIC_VERSION = "proposed"; // "proposed" | "live"
const WIND_POLICY = "avoidUpwind";   // "naive" | "avoidUpwind" | "preferDownwind"
const N_BATTLES = process.argv[2] ? parseInt(process.argv[2], 10) : 20000;

// Simulation function
function simBattle(rng, cfg) { ... }

// Statistics aggregation
function run(n, seed, cfg) {
  for (let i = 0; i < n; i++) {
    const r = simBattle(rng, cfg);
    // collect stats into a results object
  }
  return stats;
}

// Console output of results
console.log(`Battle simulation — ${N_BATTLES} battles ...`);
```

**Real Game Tester (real_game_test.js):**
```javascript
// Extract Game class from index.html via string parsing
const html = fs.readFileSync("index.html", "utf8");
const scriptStart = html.indexOf("<script>") + "<script>".length;
const scriptEnd = html.indexOf("function escHtml"); // UI marker
const engineSrc = html.slice(scriptStart, scriptEnd) + "\nthis.Game=Game;this.roundCfg=roundCfg;\n";

// Create VM sandbox with minimal globals
const sandbox = {
  document: { documentElement: { style: { setProperty() {} } } },
  console, Math, Array, Object, Set, Map, JSON, Date, String, Number, Boolean,
};

// Run extracted engine in isolated context
vm.createContext(sandbox);
vm.runInContext(engineSrc, sandbox, { filename: "index.html (engine region)" });

// Run N games and collect statistics
for (let i = 0; i < N_GAMES; i++) {
  const strategies = [0, 1, 2, 3].map(s => BOT_STRATS[(i + s) % BOT_STRATS.length]);
  const cfg = roundCfg(strategies);
  const g = new Game(cfg, SEED_BASE + i, true);
  g.play();
  // aggregate stats
}
```

## Patterns

**Setup:**
- No test setup utilities or beforeEach hooks
- Configuration provided via command-line arguments: `node battle_sim.js 10000`
- Random seed provided at start for reproducibility: `SEED_BASE + i`

**Teardown:**
- No cleanup needed — each run is stateless
- Event logging via `Game.record=true` to enable `Game.ev()` collection

**Assertion Pattern:**
- Manual visual inspection: console output printed to stdout
- Success criteria checked via properties returned from stats object:
  - Battle win rate percentages: `pct(stats.overall.aWins, stats.overall.decided)`
  - Average rounds/flips: `(stats.totalFlips / stats.total).toFixed(2)`
  - Fleet status: `stats.fled`, `stats.over10Flips`
  - By-condition breakdown: `stats.byDownwind[key]`

**Execution Example:**
```bash
node scripts/battle_sim.js 20000
node scripts/real_game_test.js 2000
```

## Mocking

**Framework:** None

**Patterns:**
- Math.random() replaced with seedable `mulberry32(seed)` in Game class
- RNG is captured as `this.rng` in Game and passed through game logic
- DOM is mocked minimally in VM context: `document.documentElement.style.setProperty()` → no-op
- Firebase, network operations, and external APIs are not tested (not used in core game logic)

**What to Mock:**
- Game configuration via `cfg` object (switch rules/variants on/off)
- Player strategies via `BOT_STRATS` array and `PERSONALITY` weights
- Starting seed for deterministic replay

**What NOT to Mock:**
- The Game class itself — tests run the real unmodified code from index.html
- Battle mechanic internals — simulated exactly as written in `Game.battle()`
- RNG sequence — intentionally deterministic via seed

## Fixtures and Factories

**Test Data:**
- No factory functions — configurations are hand-built objects
- Example configuration:
```javascript
const cfg = roundCfg(["pirate", "trader", "balanced", "rusher"]);
// Returns: { grid: 11, nIslands: 7, storm: 0.2, tradeBonus: true, ... }
```

**Personality Roster:**
```javascript
const BOT_STRATS = ["pirate", "trader", "balanced", "rusher", "monopolist"];
```

**Seed Management:**
- SEED_BASE = 12345 (chosen arbitrary offset)
- Per-game seed: `SEED_BASE + i` (ensures different seed per iteration while maintaining reproducibility)

**Location:**
- Test fixtures hardcoded in scripts (no separate fixture files)
- Configuration constants at top of each script

## Coverage

**Requirements:** None enforced

**Approach:** Statistics-based validation rather than line coverage metrics
- Simulation runs 2,000+ games to exercise all code paths
- Bot decision-making and RNG variance tested implicitly by running many iterations
- Edge cases triggered by configuration (single dock mode, storm rules, trade bonuses, etc.)

**Report Format:**
```
Real-game battle-mechanic test — 2000 full games, real bots, real Game.play()/Game.battle() (seed base 12345)

Battles per game: avg=5.80  min=1  max=14
Rounds (turns) per game: avg=19.4

Total battles across all games: 11562

Average flips per battle: 4.32
Average rounds per battle: 2.10

Win/loss/flee — attacker vs defender (overall):
  attacker wins=56.3%  defender wins=38.2%  flee=5.5%

Wind-direction effect (win rate by who's downwind, flee excluded from the win-rate split):
  Attacker downwind       battles=2893  attacker-wins=61.2%  defender-wins=38.8%  flee-rate=3.1%
  Defender downwind       battles=2947  attacker-wins=50.5%  defender-wins=49.5%  flee-rate=8.4%
  Crosswind (no advantage) battles=5722  attacker-wins=57.4%  defender-wins=42.6%  flee-rate=4.8%
```

## Test Types

**Unit Tests:**
- Not formally structured
- Isolated battle simulator (`battle_sim.js`) tests coin-flip mechanics only
- Mechanics tested include: wind effects, downwind bonus, flee logic, broadside reflip, powder costs
- Simplified model — no island placement, board geometry, or full economy

**Integration Tests:**
- Real Game class tests (`real_game_test.js`) exercise full game lifecycle
- Four players with different strategies playing complete games
- Validates interactions: sailing, docking, trading, battling, storms, run-aground, endgame
- Event log captured via `Game.events` array (when `record=true`)

**E2E Tests:**
- Not applicable — this is a browser game without Cypress/Playwright
- Manual playtesting by project owner (Wyatt) in browser
- Local test server used for multiplayer validation via Firebase

## Common Patterns

**Async Testing:**
- Not used — game is synchronous (no promises, callbacks, or async/await)
- All logic executed in a single `g.play()` call

**Error Testing:**
- No error conditions tested formally
- Extraction boundary check in real_game_test.js:
```javascript
if (typeof Game !== "function" || typeof roundCfg !== "function") {
  throw new Error("Game/roundCfg didn't come out of the extracted region…");
}
```

**Random/Flaky Test Handling:**
- All tests use fixed seed for reproducibility
- No flaky tests expected — seed = deterministic output
- Across multiple runs with different seeds, statistics should converge (tested by running N_GAMES = 2000+)

**Test Parameters:**
- Battle sim: `N_BATTLES` (default 20000)
- Real game test: `N_GAMES` (default 2000)
- Both accept first CLI argument: `node script.js <count>`

**Statistics Helpers:**
```javascript
function pct(n, d) { return d === 0 ? "n/a" : (100 * n / d).toFixed(1) + "%"; }
function avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; }
```

## Test Execution

**Run Commands:**
```bash
node scripts/battle_sim.js          # Run 20000 battle simulations (default)
node scripts/battle_sim.js 50000    # Run 50000 simulations (custom count)

node scripts/real_game_test.js      # Run 2000 full games (default)
node scripts/real_game_test.js 5000 # Run 5000 full games (custom count)
```

**CI/CD Integration:**
- No CI pipeline configured (no GitHub Actions, GitLab CI, etc.)
- Tests run manually by developer for design validation
- Simulation results printed to console (easy to inspect, no machine-readable format)

**Notes:**
- `scripts/battle_sim.html` exists but is not used in testing pipeline
- Real game test must run from project root (references `index.html` at relative path `../index.html`)
- No test timeout or resource limits enforced

---

*Testing analysis: 2026-07-22*
