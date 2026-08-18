# Phase 1: Before the Engine Freezes - Pattern Map

**Mapped:** 2026-08-18
**Files analyzed:** 11 (5 new verification scripts + 6 modified files)
**Analogs found:** 11 / 11

All analog reads in this map are against the **working tree at `/Users/wyattroy/Documents/Projects/pastrypirates`** (not the root of the machine). Every path below is written in full so no tree gets confused with another (`4/`, `v2/`, `v2bakeoff/`, root `src/`/`scripts/` all coexist in this repo — see CLAUDE.md §3).

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `4/scripts/stage_import_check.js` (new, TEST-01) | test (structural/import) | request-response (import + exit) | `scripts/module_graph_check.js` | exact (house convention + exit-on-resolve precedent) |
| A new FIX-01 structural check, e.g. `4/scripts/pp4_timeroff_check.js` | test (structural/grep) | transform (source-text scan) | `scripts/ui_contract_check.js` | exact (source-text assertion convention) |
| A new RULE-01 engine test, e.g. `4/scripts/pass_coin_test.js` | test (engine/headless) | CRUD (state mutation via engine call) | `scripts/narration_flow_test.js` (engine-import half) + `scripts/bot_ladder4.js` (import style) | exact |
| A RULE-01 structural check (same file or a sibling, e.g. `4/scripts/pass_coin_test.js`'s second half) | test (structural/source-text) | transform | `scripts/narration_flow_test.js` | exact (this is the file's own documented convention for exactly this: proving `flow.js` invariants by reading source) |
| A new RULE-02 narration test, e.g. `4/scripts/pass_narration_test.js` | test (pure-function/DOM-free) | transform (100 renderings) | `scripts/narration_test.js` | exact (same import shape, same 50×2 fan-out idea) |
| `4/src/engine/index.js` — add `doPass(p)` | service/model (game engine method) | CRUD (mutate then record) | `4/src/engine/index.js` `doDock` (same file, same class) | exact — same file, same class, sibling method |
| `4/src/ui/stage.js:190` — bare `addEventListener` | component (UI bootstrap) | event-driven | `4/src/main.js:32-37` | exact (already the guarded pattern this fix must copy) |
| `4/src/ui/util.js:502-509` — `EVENT_NARRATION.pass` renderer | component (narration builder) | transform | `4/src/ui/flow.js:2231` (`nobrk` precedent) + `4/src/ui/util.js`'s own sibling `EVENT_NARRATION.*` builders that already use raw-🌕+`nobrk` | exact |
| `4/scripts/no_undef_check.js` + `scripts/no_undef_check.js` (byte-identical, TEST-02 heuristic fix) | utility (static-analysis script) | transform | each other — no external analog needed, the fix is self-referential (extend the file's own existing `.`-exclusion logic) | exact |
| `scripts/bot_ladder4.js` (rewrite, FIX-06/D-07) | utility (bot-tuning CLI) | batch | itself, pre-rewrite (82 lines, read in full — see excerpt below) | exact — rewrite in place, not a new-file pattern |
| `4/src/ui/stage.js` / `4/src/orchestrator.js` — 5 `pp_timerOff`→`pp4_timerOff` sites + one-time cleanup | component/service (localStorage access) | CRUD (read/write client pref) | `4/src/ui/util.js:1893-1898` (try/catch-swallow convention) + `4/src/ui/audio.js:177-183` (same convention, second instance) | exact |

## Pattern Assignments

### `4/scripts/stage_import_check.js` (new, test, TEST-01)

**Analog:** `scripts/module_graph_check.js` (root `scripts/`, not `4/scripts/`)

**House test-script shell** (every gate in this repo follows this shape — no assertion library, no `node:test`):
```js
#!/usr/bin/env node
// 4/scripts/stage_import_check.js
//
// TEST-01: 4/src/ui/stage.js must import under Node without throwing. Mirrors
// scripts/module_graph_check.js's shell (shebang, header naming what's gated, one PASS/FAIL
// line, process.exit(failures?1:0) at the end).
```

**The exit-on-resolve pattern that makes TEST-01 non-optional** (`4/src/ui/stage.js:1449` has an unguarded module-scope `setInterval`, so a bare `.then()` hangs forever after a *successful* import):
```js
// Source: scripts/module_graph_check.js:~200-211 convention, applied to a dynamic import
import("../4/src/ui/stage.js")
  .then(() => { console.log("PASS 4/src/ui/stage.js imported without throwing"); process.exit(0); })
  .catch((err) => { console.error("FAIL 4/src/ui/stage.js threw on import:\n", err); process.exit(1); });
```

**Failure format precedent** (`scripts/module_graph_check.js:195-211`, the tail of `main()`):
```js
if (failures.length) {
  console.error("\nFAILURES:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
process.exit(0);
```

**Do not** add a guard to `stage.js:1449`'s `setInterval` itself — that is a real, deliberate browser watchdog; TEST-01's job is only to make the *import* not throw and to make the *verification script* exit, per RESEARCH.md's explicit anti-pattern note.

---

### A new FIX-01 structural check (`4/scripts/pp4_timeroff_check.js` proposed)

**Analog:** `scripts/ui_contract_check.js` (root `scripts/`)

**Header convention to copy** (name what's gated, name the assertions, self-exclude `scripts/`):
```js
#!/usr/bin/env node
// 4/scripts/pp4_timeroff_check.js
//
// FIX-01 (D-01/D-02): asserts no "pp_timerOff" string literal remains anywhere under 4/src/**/*.js
// EXCEPT inside the one-time cleanup function itself. Mirrors scripts/ui_contract_check.js's
// structure: shebang, header, one PASS/FAIL line per assertion, named failures with file:line,
// every assertion runs before exit so one run reports every violation.
```

**Source-text scan shape** — `ui_contract_check.js` asserts "no line anywhere under `src/` carries the `PP-BRIDGE` tag" via raw substring match, no comment-stripping (see header comment at lines 1-27, "Deliberately NO comment stripping anywhere a raw substring/line match is used"). Copy this directly: walk every `.js` file under `4/src/`, split on `\n`, substring-match `"pp_timerOff"` per line, and fail on any hit whose containing function is not the one-time cleanup (identify by a marker comment or a fixed function name so the exclusion is source-verifiable, not line-number-brittle).

---

### A new RULE-01 test (`4/scripts/pass_coin_test.js` proposed)

**Analog (engine half):** `scripts/narration_flow_test.js` (imports `../src/engine/index.js` directly, DOM-free) and `scripts/bot_ladder4.js` (imports `4/src/engine/index.js` directly — the only script anywhere that loads `4/`)

**Import style to copy** (adjust the relative path since this new file lives in `4/scripts/`, one directory shallower than root `scripts/`):
```js
// Source: scripts/bot_ladder4.js:22 — the only existing precedent for importing 4/'s engine
import { Game, roundCfg } from "../4/src/engine/index.js";
// If this new file lives in 4/scripts/, the equivalent relative import is:
// import { Game, roundCfg } from "../src/engine/index.js";
```

**check(name, actual, expected) harness** (`scripts/narration_test.js:36-42`, copy verbatim):
```js
let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }
// ... at file end:
process.exit(failures ? 1 : 0);
```

**The assertion RULE-01 needs:** construct a `Game`, force a pass (drive `p.idx` through a forced-pass path or call `game.doPass(p)`/`takeTurn` with a scenario that resolves to a pass), assert `p.coins` increases by exactly 1. `Game.record` gating: RESEARCH.md's Open Question A1 flags that `new Game(cfg, seed, record)`'s third arg controls whether `ev()` no-ops — construct with `record:true` in the test (mirrors `scripts/bot_ladder4.js:29`'s `new Game({...}, s*SEEDMULT, true)`), and separately grep `new Game(` call sites in `4/src/orchestrator.js`/`4/src/main.js` to confirm ordinary play also uses `record:true` before treating the coin mutation as record-independent.

---

### RULE-01 structural check (same new file, second half)

**Analog:** `scripts/narration_flow_test.js` — this is the file's own documented convention for proving `flow.js` invariants that need the DOM: read the source as text, locate the function body, assert an ordering/call-site/absence.

**Source-text setup to copy** (`scripts/narration_flow_test.js:29-32`):
```js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, ".."); // adjust depth for 4/scripts/ vs scripts/
const FLOW_PATH = path.join(ROOT, "src", "ui", "flow.js"); // 4/src/ui/flow.js for this new file
const FLOW_SRC = fs.readFileSync(FLOW_PATH, "utf8");
```

**Assertion to write:** both `4/src/ui/flow.js` pass sites (`:1861` human menu, `:2140` bot fallback) call the same shared method — search `FLOW_SRC` for `doPass(` at both known line regions and assert it's present at each, exactly as `narration_flow_test.js` asserts an ordering/call-site inside `windLeg`'s body via string search on `FLOW_SRC`.

---

### A new RULE-02 narration test (`4/scripts/pass_narration_test.js` proposed)

**Analog:** `scripts/narration_test.js` — mirror its exact import style, substituting `4/src/ui/util.js` and `4/src/shared/index.js`.

**Import shape to copy** (`scripts/narration_test.js:16-25`, adjusted for `4/`):
```js
import { EVENT_NARRATION, seaLine, pn } from "../src/ui/util.js";   // "../src/..." if file lives in 4/scripts/
import { SEA_CREATURES } from "../src/shared/index.js";
```

**Fan-out shape:** loop all 50 `SEA_CREATURES` entries × 2 `viewerSeat` values (0 = addressed/local, 1 = third-person/not matching `e.p`), call `EVENT_NARRATION.pass({t:"pass",p:0,sea:SEA_CREATURES[i]}, at, cellPx, viewerSeat)`, assert `txt` contains `"Recipe idea!"` and `"🌕"` — 100 assertions total, same `check()` harness as above.

---

### `4/src/engine/index.js` — add `doPass(p)`

**Analog:** `doDock(p,port)`, same file, `4/src/engine/index.js:901-910` (confirmed identical to the root `src/engine/index.js` copy at the same line numbers, both files read).

**Mutate-then-record ordering to copy exactly:**
```js
// Source: 4/src/engine/index.js:901-910 (doDock, existing, unmodified)
doDock(p,port){
  const ing=port,k=port; // ports are identified by ingredient name
  if(this.cfg.singleDock&&this.dockOccupiedBy(ing,p))return false;
  p.firstFlip.add(k);p.dockedNow.add(k);p.justDocked=true;
  const h=this.flip(p);
  p.coins+=h?this.cfg.dockHeads:this.cfg.dockTails;   // <- mutate FIRST
  const price=this.cratePrice(ing);
  // ... this.ev({t:"dock",...}) is called later in this same method, AFTER the mutation above
```

**`Game.ev()` — why the ordering matters** (`4/src/engine/index.js:320-325`):
```js
ev(o){if(!this.record)return;o.round=this.round;o.wind=this.windNow;o.storm=this.stormNow;o.wind2=this.windNow2;
  // `baking` rides in the snapshot so the board can render a captain's out-of-play state from the
  // EVENT rather than from live state ...
  o.state=this.players.map(p=>({pos:[...p.pos],coins:p.coins,ing:[...p.ing],done:p.done,baking:!!p.baking}));
  o.tokens={...this.tokens};this.events.push(o);}
```
`o.state` snapshots `p.coins` at the moment `ev()` is *called* — so `doPass(p)` must set `p.coins+=1` before calling `this.ev({t:"pass",...})`, exactly like `doDock`.

**Recommended shape** (per RESEARCH.md's Architecture Patterns section, Claude's Discretion):
```js
doPass(p){
  p.coins+=1;
  this.ev({t:"pass",p:p.idx,sea:this.nextSeaCreature(p)});
}
```
Call sites become `this.doPass(p)` (`4/src/engine/index.js:2993`), `g.doPass(p)` (`4/src/ui/flow.js:2140`), `appState.game.doPass(p)` (`4/src/ui/flow.js:1861`). **The human-only seaSeat-cursor advance immediately after the `:1861` site must stay outside `doPass()`** — it is per-device bookkeeping, not shared behavior.

---

### `4/src/ui/stage.js:190` — bare `addEventListener` (TEST-01 fix)

**Analog:** `4/src/main.js:32-37` — the already-shipped `typeof window` guard.

```js
// Source: 4/src/main.js:32-37 (existing, unmodified)
if (typeof window !== "undefined") {
  window[MODULE_OK_FLAG] = true;
  // ...
```
Apply the identical shape at `4/src/ui/stage.js:190`: wrap the bare `addEventListener("resize", ...)` in `if (typeof window !== "undefined") { window.addEventListener("resize", ...); }` — prefix with `window.` inside the guard.

---

### `4/src/ui/util.js:502-509` — `EVENT_NARRATION.pass` renderer (RULE-02 fix)

**Analog:** the file's own sibling builders (raw-emoji + `nobrk` idiom) and `4/src/ui/flow.js:2231` (G27/P7 precedent).

**Current code, to extend** (`4/src/ui/util.js:502-509`):
```js
// Pass, given something to look at. Every captain who takes the turn off sees a different beast
// go by; see Game.nextSeaCreature. The BUTTON reads "🌊 Pass" (Wyatt, 2026-08-05 — it briefly
// read "Look into the ocean"; the label went back to Pass, the narration stayed).
pass:(e,at,cellPx,viewerSeat)=>({
  txt:`🌊 ${seaLine(e.sea,isLocalTo(e.p,viewerSeat),pn(e.p))}`,
  caps:[[e.p,"🌊 looks into the ocean"]],pops:[[at(e.p),"🌊",false,WAVE_IMG]]}),
```

**Change** — append the tag as a subjectless fragment inside `<span class="nobrk">`, raw `🌕` (not `iconImg()`), matching every other coin-amount narration line in this file:
```js
pass:(e,at,cellPx,viewerSeat)=>({
  txt:`🌊 ${seaLine(e.sea,isLocalTo(e.p,viewerSeat),pn(e.p))} <span class="nobrk">Recipe idea! (+1🌕)</span>`,
  caps:[[e.p,"🌊 looks into the ocean"]],pops:[[at(e.p),"🌊",false,WAVE_IMG]]}),
```
`emojify()` swaps the raw `🌕` for `COIN_IMG` later at `panel()`'s chokepoint (`4/src/ui/panel.js:434`) — never call `iconImg()` inside this builder body. Do not touch `4/src/shared/index.js:226`'s `SEA_CREATURES` data.

---

### `4/scripts/no_undef_check.js` + `scripts/no_undef_check.js` (TEST-02 heuristic fix)

**Analog:** the file's own existing `.`-property-call exclusion, same file, to be mirrored for `get`/`set`.

```js
// Source: 4/scripts/no_undef_check.js:409-412 (existing) — the shape to copy
let p = idx - 1;
while (p >= 0 && /\s/.test(masked[p])) p--;
if (p >= 0 && masked[p] === ".") continue;
// ADD, same shape: walk further back past the identifier at `p`, check whether it is the bare
// word "get" or "set" (word-boundary-checked); if so, continue (skip the match).
```

The two files are byte-identical today (`diff` confirms) — apply the fix to **both** `scripts/no_undef_check.js` and `4/scripts/no_undef_check.js` in the same commit. Do not broaden the exclusion beyond "immediately preceded by bare `get`/`set`" — the file's own header (lines 20-27) treats false positives as the worse failure but the tool is deliberately over- rather than under-permissive.

---

### `scripts/bot_ladder4.js` (FIX-06/D-07 rewrite)

**Analog:** itself, pre-rewrite — read in full (82 lines), reproduced here so the executor does not need to re-read it:

```js
// Source: scripts/bot_ladder4.js:22-46 (current shape, before D-05's rewrite)
import { Game, roundCfg } from "../4/src/engine/index.js";
const GAMES = +(process.argv[2] || 400);
const SEEDMULT = +(process.argv[3] || 7919);
const STRATS = ["pirate", "trader", "balanced", "rusher"];
const V3_PLAN = Game.prototype.planTurnV3;
const CLASSIC_PLAN = Game.prototype.planTurnClassic;      // <- breaks the moment D-05 deletes this

function run(seatsUsingNew) {
  Game.prototype.planTurn = function (p) {
    return seatsUsingNew.has(p.idx) ? V3_PLAN.call(this, p) : CLASSIC_PLAN.call(this, p);
  };
  const wins = STRATS.map(() => 0);
  let rounds = 0, unfinished = 0;
  for (let s = 1; s <= GAMES; s++) {
    const g = new Game({ ...roundCfg(STRATS), bakeoff: true }, s * SEEDMULT, true);  // record=true
    const w = g.play();
    rounds += g.round;
    if (w == null) { unfinished++; continue; }
    wins[w]++;
  }
  Game.prototype.planTurn = function (p) { return this.planTurnV3(p); };
  return { wins, rounds: rounds / GAMES, unfinished, played: wins.reduce((a, b) => a + b, 0) };
}
```

**Rewrite plan (mechanical, per RESEARCH.md):**
1. Delete the `seatsUsingNew`/`Game.prototype.planTurn=` monkey-patch entirely — every seat already runs `planTurnV3` unconditionally once `planTurnClassic` is gone, so there is no seat-axis left to compare within one run.
2. Keep the `run()` game-generation loop's exact shape (`new Game({...roundCfg(STRATS),bakeoff:true}, s*SEEDMULT, true)`) so seeds stay identical across a before/after invocation — the comparison axis becomes **time** (run before the FIX-06/RULE-01 commit, run again after, diff the two console outputs), not seat.
3. Add pass-rate/voyage-length reporting with **zero new engine instrumentation** — `record:true` is already passed, so `g.events` already carries every `{t:"pass",...}`/`{t:"turn",...}` entry:
```js
// Derived, no new engine field — reads what Game.ev() already records
const passes = g.events.filter(e => e.t === "pass" && e.p === seat).length;
const turns  = g.events.filter(e => e.t === "turn" && e.p === seat).length;
const passRate = passes / turns;
```
4. `scripts/bot_ladder3.js` (targets `3/`) is untouched — out of scope, Phase 6 deletes `3/`.

---

### `4/src/ui/stage.js` / `4/src/orchestrator.js` — `pp_timerOff` → `pp4_timerOff` + one-time cleanup

**Analog:** the repo's try/catch-swallow localStorage convention, two existing instances.

```js
// Source: 4/src/ui/util.js:1893-1898 (existing convention — read in full context before citing
// this as precedent for the cleanup: this comment is about the SESSION_SCHEMA_V/SOLO_SCHEMA_V
// resumable-session-blob auto-clear mechanism specifically, NOT a prohibition on a new, unrelated
// one-time cleanup. Do not misread it as blocking FIX-01.)
```
```js
// Source: 4/src/ui/audio.js:177-183 (existing convention, second instance) — try{...}catch(e){},
// no logging, the shape to copy for the one-time marker-guarded delete
```

**FIX-01 sites to rename** (all 5, re-verified in RESEARCH.md, cite line numbers when editing):
- `4/src/ui/stage.js:1478` — force-write (`initStage()`'s "off by default" seed)
- `4/src/ui/stage.js:909` — menu toggle
- `4/src/orchestrator.js:184` — sheet toggle
- `4/src/orchestrator.js:1570` — the read
- `4/src/orchestrator.js:1575-1576` — the read that pushes the value to the room via `netSetTimerOff`

**One-time cleanup shape (no direct precedent exists for a *runtime* migration marker — build fresh, following the try/catch-swallow shape above):**
```js
// New, one-time, on /4 boot only — follows the established try/catch-swallow convention
try {
  if (!localStorage.getItem("pp4_timerOffCleaned")) {
    localStorage.removeItem("pp_timerOff");
    localStorage.setItem("pp4_timerOffCleaned", "1");
  }
} catch (e) {}
```

## Shared Patterns

### The house test-script convention (applies to all 5 new scripts)
**Source:** `scripts/narration_test.js`, `scripts/narration_flow_test.js`, `scripts/ui_contract_check.js`, `scripts/module_graph_check.js`, `scripts/no_undef_check.js`, `scripts/hail_ranking_test.js` — 20+ scripts, all identical shape.
**Apply to:** every new file in this phase.
```js
#!/usr/bin/env node
// <path> — one-sentence header naming what this gates and why
let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
// ... assertions ...
process.exit(failures ? 1 : 0);
```
No `node:assert`, no `node --test`, no third-party test runner — RESEARCH.md's own "Alternatives Considered" table explicitly rejects introducing a second convention mid-milestone.

### Mutate-before-record (applies to `doPass`)
**Source:** `4/src/engine/index.js` `doDock` (901-910) + `Game.ev()` (320-325).
**Apply to:** `doPass(p)` and any future `do*`-prefixed Game method. State mutation happens before `this.ev(...)` is called, in the same method, because `ev()`'s own state snapshot is taken at call time.

### try/catch-swallow around every localStorage access
**Source:** `4/src/ui/util.js:1893-1898`, `4/src/ui/audio.js:177-183`.
**Apply to:** all `pp4_timerOff` reads/writes and the new one-time cleanup — no logging, silent swallow.

### `typeof window !== "undefined"` guard before any browser global
**Source:** `4/src/main.js:32-37`.
**Apply to:** `4/src/ui/stage.js:190`'s `addEventListener` fix (TEST-01).

### Raw emoji + `<span class="nobrk">`, resolved by `emojify()`'s chokepoint
**Source:** `4/src/ui/util.js`'s existing `EVENT_NARRATION.*` builders (multiple sites), `4/src/ui/flow.js:2231` (G27/P7).
**Apply to:** RULE-02's appended `(+1🌕)` tag. Never call `iconImg()`/hand-roll `<img>` markup inside an `EVENT_NARRATION` builder body — `panel()`'s `emojify(html)` call (`4/src/ui/panel.js:434`) is the single chokepoint (D-50) that swaps `🌕` for `COIN_IMG`.

### Source-text structural assertion (grep-as-test)
**Source:** `scripts/ui_contract_check.js`, `scripts/no_undef_check.js`, `scripts/narration_flow_test.js`.
**Apply to:** the FIX-01 structural check and the RULE-01 structural half — read the target file as raw text (`fs.readFileSync`), assert presence/absence of a literal or call-site by string/regex search, report `file:line` on failure by counting newlines before the match offset.

## No Analog Found

None — every file in this phase's scope has a same-repo, same-tree analog. This phase's RESEARCH.md already confirms zero external packages and zero new architectural surface.

## Metadata

**Analog search scope:** `scripts/` (root, 20+ hand-rolled test/check scripts), `4/scripts/`, `4/src/engine/index.js`, `4/src/ui/{stage,util,flow,main}.js`, `4/src/orchestrator.js` — all read directly, no Glob/Grep needed beyond what RESEARCH.md had already re-verified line-by-line on 2026-08-18.
**Files scanned:** 11 target files + 9 analog files read/excerpted (`scripts/module_graph_check.js`, `scripts/narration_test.js`, `scripts/narration_flow_test.js`, `scripts/ui_contract_check.js`, `scripts/hail_ranking_test.js`, `4/src/main.js`, `4/src/ui/util.js`, `4/src/engine/index.js`, `4/scripts/no_undef_check.js` via RESEARCH.md).
**Pattern extraction date:** 2026-08-18
