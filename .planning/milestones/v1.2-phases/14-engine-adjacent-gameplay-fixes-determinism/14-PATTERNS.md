# Phase 14: Engine-Adjacent Gameplay Fixes & Determinism - Pattern Map

**Mapped:** 2026-07-26
**Files analyzed:** 5 (2 modified engine/UI files, 1 modified test tooling file, 2+ new scripts)
**Analogs found:** 5 / 5 (all in-repo; no framework/library patterns needed)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/engine/index.js` (`leeward`, `moored`/`windPush`, `play`/`takeTurn`) | service (deterministic sim core) | event-driven / transform | itself — `windPush`/`takeTurn` (existing sibling methods in same file) | exact |
| `src/ui/flow.js` (`windLeg` → new `botWindLeg`) | controller (turn-flow orchestrator) | event-driven | `windLeg` (`src/ui/flow.js:206-263`) | exact |
| `src/ui/flow.js` (`botTurn` storm block + hail block) | controller | event-driven | `botTurn` itself (existing, to be restructured) + `humanTrade`'s bot-valuation branch (`:366-386`) for scoring | exact / role-match |
| `src/ui/util.js` (`EVENT_NARRATION.moored` split, new refused-hail line, `msgHoldMs`/bot pacing) | utility (narration table + pacing) | transform | `EVENT_NARRATION` itself (existing table, add entries) | exact |
| `scripts/determinism_diff.js` (NEW) | utility / test tooling | batch / transform | `scripts/determinism_baseline.js` `verify()`/`serializeSeed()` (`scripts/determinism_baseline.js:150-241`, `88-92`) | exact |
| `scripts/hail_ranking_test.js`, `scripts/storm_moored_reason_test.js`, `scripts/bot_storm_narration_test.js` (NEW, per 14-VALIDATION Wave 0) | test | batch | `scripts/dlog_replay_test.js` / `scripts/real_game_test.js` shape (hand-rolled, `loadEngine()`-based) — use `scripts/lib/load_engine.js` | exact |

## Pattern Assignments

### `src/engine/index.js` — `leeward()`, `moored()`/`windPush()`, `play()`/`takeTurn()` (D-15/D-18/D-19/D-21)

**Analog:** itself — these are edits to existing methods, not new files. Copy the surrounding idiom exactly (compact one-line conditionals, inline comments explaining *why*).

**Imports pattern** (`src/engine/index.js:8`):
```js
import { mulberry32, ING_ALL, TET, DIRS, OPPOSITE, SAIL_BUDGET, SAIL_BUDGET_LEEWARD, windStepCost, man, ilabelImg } from "../shared/index.js";
```
D-15 requires adding `PERP` to this same import list (it is already exported and `ORDER IS LOAD-BEARING`-annotated at its declaration site in `src/shared/index.js:147` — do NOT add a new annotation at the import site; the count-of-7 gate in `engine_contract_check.js:121` only counts declaration-site annotations).

**`leeward()` today** (`src/engine/index.js:255-257`) — D-18 fix is a one-line change to also treat home as land:
```js
leeward(p){ // an island upwind of you blocks the wind — cuts your sail budget (see #7c)
  const d=DIRS[OPPOSITE[this.windNow]];
  return this.isIsland([p.pos[0]+d[0],p.pos[1]+d[1]]);
}
```
Blocking-movement parity already ORs `isIsland(o)||isHome(o)` elsewhere (`stepToward`'s `pass()`, `:295`) — mirror that exact `||isHome(...)` idiom here.

**`moored()` today** (`src/engine/index.js:252-254`) — D-19 says KEEP this clause as-is; D-21 requires tagging *which* branch fired with a `reason`, not changing the boolean logic:
```js
moored(p){ // ships that DOCKED last turn (or sit at a berth / Isle of Tortuga) can't be wind-forced into land
  return p.justDocked||(this.cfg.singleDock&&this.adjPort(p)!==null)||man(p.pos,this.home)<=1;
}
```
Per D-21, the two `moored` event call sites in `windPush` need a `reason` field:
```js
// src/engine/index.js:265, :267 — current
if(this.isHome(nx)){this.ev({t:"moored",p:p.idx});return;} // safe harbor
...
if(this.isIsland(nx)){
  if(this.moored(p)){this.ev({t:"moored",p:p.idx});return;}
```
Per D-19's "fold the isHome special case into normal handling rather than kept as a separate rule" — the `isHome(nx)` branch at `:265` is now redundant with `moored()`'s own `man(pos,home)<=1` clause once Tortuga becomes real land (D-18); it should collapse into the same `moored(p)` check inside the `isIsland(nx)` branch rather than staying a separate early-return. Mirror the identical structure/edit in the UI copy of this loop, `windLeg` (`src/ui/flow.js:210-219`) — the two must stay in lockstep (see the module's own comment convention: *"mirrors ... keep the two in step or bots and humans diverge"*, `src/ui/flow.js:279`).

**`play()`/`takeTurn()` — D-15 gust alignment** (exact target shape, already spelled out in RESEARCH.md and verified against the file this session):
```js
// src/engine/index.js:744-750 (play()) — add windNow2 roll right after rollStorm
const storm=rollStorm(this); // #1a
this.windNow2=storm?PERP[wind][Math.floor(this.r()*2)]:null;
this.windNow=wind;this.stormNow=storm;
```
```js
// src/engine/index.js:697-704 (takeTurn()) — current single-gust form, to become two-gust
// mirroring src/ui/flow.js:556-567 exactly (dodgedOnce shared across both windPush calls)
if(storm){
  const before=[...p.pos];
  const wasDocked=this.adjPort(p)!==null;
  const dodgedOnce={v:false};
  this.windPush(p,DIRS[windDir],2,dodgedOnce);
  this.windPush(p,DIRS[this.windNow2],2,dodgedOnce);
  p.justDocked=false;
  if(p.pos[0]!==before[0]||p.pos[1]!==before[1])this.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});
  if(p.shipwrecked){p.shipwrecked=false;return;}
}
```
The bot-live path (`src/ui/flow.js:555-567`) is the exact structural analog already in the codebase — copy its shape verbatim into the engine method, substituting `this.` for `g.`.

**Error handling pattern:** none — this codebase uses early `return`/guard-clause style throughout the engine (`if(...)return;`), no try/catch. Follow that convention; do not introduce exception handling here.

---

### `src/ui/flow.js` — new bot storm-leg function (D-09/D-10/D-11)

**Analog:** `windLeg` (`src/ui/flow.js:206-263`) — read in full above.

**Core per-square loop pattern to copy** (`src/ui/flow.js:209-262`):
```js
for(let s=0;s<dist;s++){
  const nx=[p.pos[0]+d[0],p.pos[1]+d[1]];
  if(appState.game.blocked(nx))return;
  if(appState.game.isHome(nx)){appState.game.ev({t:"moored",p:p.idx});await narrateLastEvent();liveRender();return;}
  const blocker=appState.game.players.find(q=>q!==p&&!q.done&&q.pos[0]===nx[0]&&q.pos[1]===nx[1]);
  if(blocker){appState.game.ev({t:"blocked",p:p.idx,other:blocker.idx});await narrateLastEvent();liveRender();return;}
  if(appState.game.islands[nx]!==undefined){
    if(appState.game.moored(p)){appState.game.ev({t:"moored",p:p.idx});await narrateLastEvent();liveRender();return;}
    if(dodgedOnce.v){appState.game.ev({t:"anchorHold",p:p.idx});liveRender();return;}
    // ... interactive ask()/humanFlip() island-outcome branch — REPLACE for bots per D-11 ...
  }
  p.pos=nx;
  if(appState.game.onRim(nx)){ /* tradewind sweep */ return; }
}
appState.game.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});liveRender();
```
**Event-then-narrate-then-render ordering is load-bearing** — every outcome branch does `ev()` → `await narrateLastEvent()` → `liveRender()` → `return`, in that exact order, per square. Copy this ordering precisely for the new bot function; D-22's root-cause finding is that this exact ordering (event fires *before* the redraw) is correct-but-visually-confusing, and per-square granularity (not reordering) is the fix.

**What to swap out for the bot version (per D-11):** the interactive `ask()` prompt (`:220-234`) and the flip animation inside `humanFlip()` — replace with the engine's own already-existing auto-decision logic, which lives in `windPush` (`src/engine/index.js:271-281`, verbatim: pay-if-`coins>=3`, else `flip(p)` directly with no animation, else lose-half/lose-a-crate/shipwreck) — bots already get these identical decisions today via `windPush`, so the new bot-leg function should call `g.flip(p)` directly (no `humanFlip`) and narrate only the `anchor`/`aground`/`shipwrecked` result event that `windPush`'s own logic already produces. Concretely: the new function should NOT reimplement the island-outcome decision — it should delegate to `windPush` for a *single square's* worth of movement+decision, then narrate+render, rather than re-deriving the branches inline. (This is a shape decision for planning/implementation; both `windPush`-delegation and an inlined copy satisfy the requirement — `windPush` delegation avoids logic duplication and is the safer copy pattern.)

**Signature to mirror:** `windLeg(p,dirKey,dist,dodgedOnce,wasDocked)` (`:206`) — the new function should take the same parameters minus anything animation/prompt-specific, e.g. `botWindLeg(p,dirKey,dist,dodgedOnce,wasDocked)`.

**Call-site replacement** (`src/ui/flow.js:559-560`, inside `botTurn`):
```js
// current — no intermediate render between the two gusts
g.windPush(p,DIRS[g.windNow],2,dodgedOnce);
g.windPush(p,DIRS[g.windNow2],2,dodgedOnce);
```
Replace both calls with `await botWindLeg(p,g.windNow,2,dodgedOnce,wasDocked)` / `await botWindLeg(p,g.windNow2,2,dodgedOnce,wasDocked)`, mirroring exactly how `humanWind` (`src/ui/flow.js:265-274`) calls `windLeg` twice with an inline `flash()` announcing the second leg's direction between them.

**Pacing (D-10):** `botBeat()` (`src/ui/util.js:548`: `netHandlers().onLiveRender();await narrateCurrent();`) is the existing bot-pacing primitive already used elsewhere in `botTurn` (`:552,566,580,608,616,618,619`+). `msgHoldMs()` (`src/ui/util.js:462-469`, formula `Math.round(Math.min(Math.max(1000+len*50+pauses*300,1200),7000)*0.8)`) is the human hold-time formula reused by `flash()`/`narrateLastEvent()`. Per RESEARCH.md's explicit recommendation, introduce a **shorter, bot-specific hold formula** (lower multiplier or lower cap than 7000ms) rather than reusing the human one verbatim — this is the "snappier" lever D-10 asks for. Follow `msgHoldMs`'s exact signature/placement (same file, near it) so it's discoverable alongside the human formula.

---

### `src/ui/flow.js` — `botTurn`'s hail block (D-02–D-08, D-24, D-25)

**Analog:** the block itself (existing, to restructure) — current full text at `src/ui/flow.js:584-612`, quoted in full in RESEARCH.md's "Hail block structure" section. Key fix: the `chooseAction()` call at `:613` must not run when a hail attempt (per D-24: "attempt", not just "accepted") happened this turn. Track a local flag and `return` before line 613 rather than only `break`-ing the inner `for` loop.

**Ranked-targeting analog** — `humanTrade`'s bot-valuation branch (`src/ui/flow.js:365-392`), extract the `essential`/`trulyEssential`/`scarcityBonus` scoring idiom:
```js
const essential=q.recipe.includes(want)&&appState.game.cnt(q.ing,want)<=1;
const nearResupply=essential&&appState.game.tokens[want]>0&&man(q.pos,appState.game.islandOf[want])<=3;
const trulyEssential=essential&&!nearResupply;
const scarcityBonus=appState.game.tokens[want]<=1?2:(appState.game.tokens[want]<=2?1:0);
let cost=trulyEssential?7:(3+scarcityBonus);
```
D-06's ranking (prefer 2+-holders → least-hurt single-holder → proximity tiebreaker only) and D-07's combined-scaling offer should be built as a small pure function (per 14-VALIDATION Wave 0: "extract as `rankHailTargets`/`priceHailOffer`, DOM/Firebase-free, unit-testable") using this same `g.cnt(...)`/`g.needs(...)`/`man(...)` idiom already established in `humanTrade`. Replace the current single-match lookup:
```js
// current (src/ui/flow.js:588) — first match only
const human=g.players.find(q=>q.strategy==="human"&&!q.done&&q.ing.includes(ing));
```
with a filter+sort using the same helper calls (`g.cnt`, `g.needs`, `man`) already imported/available in this file.

**D-25 — hail must stay UI-tier, never fold into `chooseAction`:** `chooseAction` (`src/engine/index.js:663-692`) is shared with the deterministic simulator's `takeTurn` (`:725`). Do not add a hail branch there. Keep the hail exactly where it lives in `botTurn`, gated to `return`/skip the `chooseAction()` call.

---

### `src/ui/util.js` — `EVENT_NARRATION` additions (D-13/D-14/D-21/D-24/D-27)

**Analog:** the table itself (`src/ui/util.js:225-323`) — entry shape is a plain function `(e, at, cellPx) => ({txt, caps, pops, cls})`. Existing `moored` entry to split three ways (D-21):
```js
moored:(e,at)=>({txt:`The dock steadies ${pn(e.p)} from running aground ⚓`,pops:[[at(e.p),"⚓"]]}),
```
Branch on `e.reason` (`"justDocked"|"dock"|"home"` per RESEARCH.md's proposed tag), each returning the same `{txt, pops}` shape, e.g.:
```js
moored:(e,at)=>{
  const txt = e.reason==="home" ? "<Tortuga-berth line>"
    : e.reason==="justDocked" ? "<docked-last-turn line>"
    : "<storm-blew-you-onto-the-dock line>";
  return {txt,pops:[[at(e.p),"⚓"]]};
},
```
Copy-line drafting is Wyatt-approval-gated per D-14/D-27 — present the 9 existing reused lines (table in RESEARCH.md, `## D-9/D-10/D-11`) plus the 3 new `moored` variants and the refused-hail turn-end line (D-24) for his edit before the phase closes. Add the refused-hail line as a new small addition near the existing `parley` entry (`:257`), which already handles the "declined" case generically — check whether `parley`'s existing `${e.ok?"deal struck!":"<b>refused</b>"}` phrasing already satisfies D-24's "visibly paying the action cost" requirement, or needs a distinct trailing line.

**`describe()`/consumption pattern** (`src/ui/util.js:325-334`):
```js
export function describe(e){
  if(!e)return null;
  const fn=EVENT_NARRATION[e.t];if(!fn)return null;
  const r=fn(e,NO_AT);
  ...
```
No changes needed here — adding a `reason`-branched function body inside the existing `moored` entry is fully compatible with this wrapper.

---

### `scripts/determinism_diff.js` (NEW, D-26 Wave 0 gap)

**Analog:** `scripts/determinism_baseline.js`'s `verify()` (`:150-241`) and its exported `playSeed`/`serializeSeed`/`hashBytes`/`MANIFEST_PATH` (`:61-96`, already exported specifically so sibling tools can reuse them — see the file's own header comment: *"Exported (08-05) — scripts/rebase_source_hash.js imports MANIFEST_PATH, playSeed, serializeSeed and hashBytes below to reuse verify()'s exact comparison-2 logic ... rather than reimplementing a second, subtly-different copy of it."* — the new diff script should do the same: `import` these from `determinism_baseline.js`, don't reimplement).

**House style for a companion script** (`scripts/rebase_source_hash.js` is the existing precedent for "a second small tool built on top of `determinism_baseline.js`'s exports" — read it for the exact import/reuse shape before writing the diff tool):
```js
import { MANIFEST_PATH, playSeed, serializeSeed, hashBytes } from "./determinism_baseline.js";
```
**What the new script must do differently from `verify()`:** `verify()` stops recording detail after the *first* divergent seed (comment at `:191-193`: *"print the first divergent seed/event index only"*). The new `--diff` capability must walk **every** seed and **every** divergent line within each (not stop at the first), tagging each divergence by the JSON event's `.t` field, per D-26's replacement criterion — reuse `verify()`'s exact line-splitting/comparison idiom (`storedBytes.split("\n").filter(l=>l.length>0)` vs. `freshBytes` from a fresh `playSeed()` call, `:196-209`) but loop over ALL divergences instead of `break`-ing after the first, and also assert "no seed diverges before its first storm round" (scan each seed's fresh event stream for the first `t:"newround"` event with `storm:true`, then confirm no divergence index precedes it).

**Error handling / exit-code convention** (from `determinism_baseline.js:239-240` and `capture()`'s `:113-115,128-131`): `console.error(...)` + `process.exit(1)` on any failure condition; `process.exit(0)` on full success. No try/catch — the codebase's flat guard-clause style extends to `scripts/` tooling too.

**CLI entry-point guard convention** (`determinism_baseline.js:248-254`):
```js
if (import.meta.url === `file://${process.argv[1]}`) {
  if (mode === "capture") { await capture(); } else { await verify(); }
}
```
Copy this guard if the diff logic is added as a new mode inside `determinism_baseline.js` itself (`--diff` flag) rather than a wholly separate file — RESEARCH.md leaves either shape open ("`--diff` flag on `determinism_baseline.js` or a new `scripts/determinism_diff.js`"). Either is acceptable; if a separate file, it MUST reuse (import) rather than duplicate `playSeed`/`serializeSeed`/`hashBytes`.

---

### NEW small test scripts (`scripts/hail_ranking_test.js`, `scripts/storm_moored_reason_test.js`, `scripts/bot_storm_narration_test.js` — per 14-VALIDATION.md Wave 0)

**Analog:** `scripts/lib/load_engine.js`'s `loadEngine()` — the single shared seam every hand-rolled test script in this repo uses to get a real `Game`/`roundCfg` without DOM/sandbox tricks:
```js
import { loadEngine } from "./lib/load_engine.js";
const { Game, roundCfg, sourceHash } = await loadEngine();
```
Use this exact import + call in every new test script — do not hand-roll a separate engine-loading path (the module's own header comment explicitly frames this as the intentional single indirection seam: *"a future change to how the engine is obtained stays contained to this one file"*).

**Assertion/exit-code convention** — no formal assertion library exists anywhere in `scripts/`. Follow `determinism_baseline.js`'s convention: plain `if(...)` checks, `console.error`/`console.log` for diagnostics, `process.exit(1)` on any failed check, `process.exit(0)` (or falling off the end) on success. For a `storm_moored_reason_test.js`, construct a `Game` via `loadEngine()` + `roundCfg(...)`, force a scripted scenario (a player positioned to trigger each of the 3 `moored` reasons), call the relevant engine method directly (`g.moored(p)`, `g.windPush(...)`), and assert the `reason` field / narration output differs across the 3 cases — mirroring the "live repro" style already demonstrated in RESEARCH.md's own D-12 root-cause section (direct field pokes on a constructed `Game` instance, no UI/DOM involved).

**Naming convention to follow:** `<subject>_test.js` or `<subject>_check.js` (existing: `engine_contract_check.js`, `dlog_replay_test.js`, `net_registry_test.js`, `real_game_test.js`) — the new files' proposed names in 14-VALIDATION.md already match this convention exactly.

## Shared Patterns

### Event-then-narrate-then-render ordering
**Source:** `windLeg` (`src/ui/flow.js:206-263`), `botTurn` (`src/ui/flow.js:549-620`)
**Apply to:** the new `botWindLeg` function and any restructured hail block — always `g.ev({t:...})` first, then narrate (`narrateLastEvent()` for human-interactive paths, `botBeat()`/`narrateCurrent()` for bot paths), then `liveRender()`, in that fixed order. Never render before the event is recorded (D-22 confirms this ordering is intentional/correct, not the bug).

### Engine purity / layer boundaries
**Source:** `src/engine/index.js:1-6` header comment; `scripts/engine_contract_check.js`, `scripts/module_graph_check.js`
**Apply to:** all engine-tier edits — zero `document.`/`window.`/`firebase`/`localStorage`/`Date.now`/`Math.random`/`globalThis` references; `ui` may read engine state directly but must never import `src/net/`; hail logic must stay in `src/ui/flow.js`, never migrate into `src/engine/index.js`'s `chooseAction`.

### Deterministic RNG discipline
**Source:** `rollStorm()` (`src/engine/index.js:12-17`), comment: *"Always consumes exactly one g.r() so the seeded RNG sequence stays identical live vs. host-refresh replay."*
**Apply to:** the new `this.windNow2=...Math.floor(this.r()*2)` roll in `play()` (D-15) — must consume exactly one `this.r()` call, at a fixed point in the per-round sequence, matching the orchestrator's existing draw shape (`src/orchestrator.js:683`) so live play and the simulator consume RNG identically from that point forward.

### Compact vanilla-JS density and comment idiom
**Source:** entire codebase (per CLAUDE.md conventions, confirmed throughout all files read this session)
**Apply to:** every new/modified line — no linter, `"use strict"` already declared once at script top (not per-file, since this is not a module-per-file structure historically, but the ES-module split under `src/` uses standard `export`/`import` without per-file `"use strict"` — confirm against the actual file headers, all begin directly with a comment block then `import`). Match existing density: `if(c){...}else{...}` single-line where the surrounding code already does this; explanatory comments precede non-obvious branches (`// notes/edits ...`, `// D-xx ...`) rather than JSDoc blocks.

## No Analog Found

None — every file in this phase's scope has a direct, in-repo analog (the codebase's existing storm/hail/narration/determinism code is itself the pattern source; no external-library or cross-project pattern was needed).

## Metadata

**Analog search scope:** `src/engine/index.js`, `src/ui/flow.js`, `src/ui/util.js`, `scripts/determinism_baseline.js`, `scripts/rebase_source_hash.js`, `scripts/lib/load_engine.js`
**Files scanned:** 6 read in full or targeted ranges; `scripts/` directory listing scanned for naming-convention precedent
**Pattern extraction date:** 2026-07-26
