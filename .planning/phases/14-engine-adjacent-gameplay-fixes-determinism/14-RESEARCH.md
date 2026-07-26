# Phase 14: Engine-Adjacent Gameplay Fixes & Determinism - Research

**Researched:** 2026-07-26
**Domain:** Deterministic game-engine/UI split (vanilla ES modules), storm-movement rendering, bot AI turn structure
**Confidence:** HIGH (every claim below is grounded in a direct file:line read or a live repro script run against the actual engine this session — see `## Sources`)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Bots follow the same rules as humans, visibly. A bot's turn structure must mirror the human's: one move + one action, no exceptions. The player must be able to see bots subject to the same consequences.
- **D-02:** A hail costs the bot its action. A bot that hails the human does NOT also fish/dock/attack that turn.
- **D-03:** The hailing bot still moves. Per D-01, a bot's turn mirrors the human's: sail (pay 1🌕, move) → then the hail *is* its action.
- **D-04:** Bots hail more selectively. Now that a hail costs a full action, the bot should only spend it when genuinely worth it.
- **D-05:** Keep the hail trigger as last-resort only (crate supply exhausted). NOT opened up to fire opportunistically.
- **D-06:** Hail targeting becomes deliberate and human-like: (1) prefer sellers holding 2+ of the ingredient, (2) single-holders are the fallback (whoever it hurts least), (3) "can restock easily" is a tiebreaker only — never assume restocking is available (crate pool is empty when a hail fires).
- **D-07:** The offer is sweetened, scaling on BOTH factors combined: bot's desperation AND seller's cost-to-give-up. Tuning caution: bots must not bankrupt themselves.
- **D-08:** No bot-vs-bot hail. Hailing is bot→human only and does not exist in the deterministic engine's `takeTurn`; do NOT add it.
- **D-09:** Bot storm pushes step one square at a time, visibly — same as the human push.
- **D-10:** Snappier than the human push, but speed must never cost legibility.
- **D-11:** Every storm outcome must be surfaced for bots (aground, dodge, coin-flip result, moored, anchor-hold, blocked). Bot coin flips do NOT show the flip animation — state the result only. Human keeps the interactive flip.
- **D-12:** The false "the dock held fast" message must fire at the correct square — currently appears while the boat is still a square away from the dock.
- **D-13:** New storm lines get real pirate flavor — "fun to read".
- **D-14:** Claude drafts the pirate-flavored storm lines; Wyatt approves before the phase closes (in-phase approval gate, precedent: NARR-06).
- **D-15:** Align the all-bot simulator to the real game's storm, and re-record the 30 fingerprints. **Reversibility: one-way.**
- **D-16:** Re-record deliberately, never reflexively: make the storm change → run the 30 seeds → confirm the differences are only storm-related → then re-record.
- **D-17 (research question, answered below):** Does the all-bot simulator already charge a bot trade an action?

### Claude's Discretion

- Exact snappier pacing for bot storm steps (D-10) — specific per-square timing left to planning/implementation, subject to staying legible.
- How D-04's "more selectively" and D-07's combined offer scaling are computed — research/planning decide the heuristic.
- Whether the hail becomes a formal option inside `chooseAction` versus another structure — implementation's call, as long as one-move-one-action holds. **Resolved by this research below: it must NOT go inside `chooseAction`, because that method is shared with the deterministic engine's `takeTurn` (D-08 would be silently violated). See "D-17 and the chooseAction/hail boundary" below.**

### Deferred Ideas (OUT OF SCOPE)

- Opening the hail trigger up so bots hail opportunistically (while crates are still in the pool) — explicitly declined for this phase (D-05).
- Bots hailing other bots — would require adding a hail concept to the deterministic engine, changing fixtures again. Out of scope (D-08).
- `eov-narration-box-not-cleared` — belongs to Phase 16 (UI-07), not this phase.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| STORM-01 | Storm boat movement is one square at a time (up to 4), and docking/aground checks evaluate at the correct square | Root-caused and reproduced the exact "false moored" bug (see `## D-12 root cause`); mapped the exact per-square rendering gap for bots (`## D-9/D-10/D-11`) with file:line citations for both the human reference pattern (`windLeg`) and the bot code to replace (`botTurn`'s storm block) |
| AI-01 | Bot hail turn structure follows a decided rule; no more "two actions in one turn" | Traced the exact double-action bug (`## Hail block structure`), confirmed the fix boundary (hail must stay UI-tier, cannot fold into engine's shared `chooseAction`), and detailed D-06/D-07's targeting/pricing implementation surface |
| VERIFY-02 | Determinism harness stays green (30/30) after storm-movement and engine-adjacent changes | Answered D-17 definitively (`## D-17 answer`), confirmed exactly what changes and what does not perturb fixtures, and identified a real tooling gap blocking D-16's "confirm differences are storm-related only" (`## Determinism harness mechanics`) |

</phase_requirements>

## Summary

This phase touches a codebase that has already been fully split into ES-module tiers (`src/engine/`, `src/ui/`, `src/net/`, `src/state/`, `src/shared/`), gated by 9 standing `npm test` checks including a determinism oracle (30 seeds, SHA-256 per seed) and a module-graph/layer-purity scanner. All three requirements (STORM-01, AI-01, VERIFY-02) are satisfiable with **UI-tier-only + one narrow engine-tier** changes; none require new dependencies, new architecture, or loosening the engine's DOM/Firebase/`Math.random`-free purity contract.

The two most consequential findings, both confirmed by direct repro against the live engine this session:

1. **D-17 is answered NO — no alignment needed.** The simulator's `takeTurn` (`src/engine/index.js:663-735`) already funnels every bot turn through exactly one `chooseAction()` call that executes exactly one of attack/trade/dock/fish, with mutually-exclusive `return`s. A simulated bot cannot trade *and* separately act in the same `takeTurn` call today. Only D-15's storm-gust gap (2 squares vs. the live game's 4) needs fixing, so the corpus needs re-recording **once**, driven by that single change (plus, if adopted, the moored-narration-reason field below).
2. **D-12's "false dock held fast" bug is a narration-precision bug, not a movement-timing bug**, and it does NOT require any change to `windPush`'s movement/collision logic. `Game.moored(p)` (`src/engine/index.js:252-254`) ORs three unrelated safe-harbor conditions — "docked last turn", "currently standing on a dock cell", and **"within 1 square of home, regardless of which dock/island is being approached"** — into one boolean, and the narration table has exactly one line for all three ("The dock steadies {p} from running aground ⚓", `src/ui/util.js:253`). I reproduced this live: a ship parked one square from Tortuga, not standing on any dock, still reports "the dock steadies you" when the storm nudges it toward a completely unrelated island a full square away. The fix is a `reason` tag on the `moored` event plus a 3-way narration branch — small, but it DOES touch the event payload shape, so it perturbs the fixture hashes and should be folded into the same re-record pass as D-15.

**Primary recommendation:** Do the engine-tier work first and in one pass — (a) add the second gust to `takeTurn`+`play()` (D-15), and (b) if the moored-reason fix is adopted this phase, land it in the same commit — then run `node scripts/determinism_baseline.js --verify`, confirm every divergent line is genuinely storm/moored-related (a new diffing capability is needed for this — see below), and re-capture once. Do all UI-tier work (bot storm stepping, hail restructuring, new copy) independently; none of it touches the engine and none of it can perturb fixtures.

## Architectural Responsibility Map

This project has no browser/server/API/CDN split — it is a client-only game with an internal tier system enforced by `scripts/module_graph_check.js`. The generic web-tier table is replaced with the project's actual tiers.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Bot storm push — visible per-square stepping (D-09/D-10/D-11) | `src/ui/` (`flow.js`, new bot-equivalent of `windLeg`) | — | Purely presentation/pacing; reuses existing engine event types and existing `EVENT_NARRATION` copy |
| Storm-gust alignment — simulator applies both gusts (D-15) | `src/engine/` (`index.js`: `play()`, `takeTurn()`) | `src/shared/` (import `PERP`) | The only true engine-behavior change this phase; changes RNG consumption, so it is fixture-perturbing by design (D-15 accepted this) |
| Moored-message precision (D-12) | `src/engine/` (event payload: add `reason`) | `src/ui/` (`util.js` `EVENT_NARRATION.moored` branch) | Root cause lives in engine's `moored()`/`windPush()`; the fix is a data tag on the event plus a UI branch — split responsibility, but the payload change is engine-tier and fixture-perturbing |
| Hail eligibility, targeting, pricing (D-02–D-07) | `src/ui/` (`flow.js` `botTurn`'s hail block) | — | Must stay UI-tier only — see `## D-17 and the chooseAction/hail boundary` below for why it cannot move into engine's shared `chooseAction` |
| New storm narration copy (D-13/D-14) | `src/ui/` (`util.js` `EVENT_NARRATION`) | — | Copy-only; approval-gated by Wyatt per D-14 |
| Determinism verification / diffing (VERIFY-02, D-16) | `scripts/` (tooling tier, outside `src/`) | — | `scripts/determinism_baseline.js` is the oracle; a real per-seed-diff capability is currently missing (see below) — this is a tooling gap, not app code |

## Package Legitimacy Audit

**N/A — this phase introduces no new external packages.** All changes are to existing `src/engine/`, `src/ui/`, and `scripts/` files using only already-imported symbols (`PERP` needs a new import into `src/engine/index.js`, but it already exists in `src/shared/index.js` — no new dependency). `npm view`/`pip`/`cargo` checks are not applicable.

## D-17 answer (blocking research question — VERIFY-02 sequencing)

**Question:** Does the all-bot simulator's `takeTurn` already charge a simulated bot's trade an action, the way `humanAct` costs the human their one action?

**Answer: Yes, it already does — no alignment change is needed, and this does NOT perturb fixtures.**

Read `takeTurn` end-to-end (`src/engine/index.js:693-735`). Its exact structure, per call, per turn:

1. **Storm push** (only if `storm` is true) — currently a single `this.windPush(p,DIRS[windDir],2)` call, first gust only (line 700). This is the D-15 gap, unrelated to D-17.
2. **Movement** — `chooseTarget(p)` picks a destination, `stepToward(p,target,...)` moves toward it, costs 1 coin if it actually moved (lines 705-723). This is the "move" half of "one move + one action" and is unconditional.
3. **Exactly one action** — `const action=this.chooseAction(p);` (line 725) returns exactly one `{type, ...}` object (`"attack"|"trade"|"dock"|"fish"`, scored and picked in `chooseAction`, `src/engine/index.js:663-692`, itself only ever called this once per turn). The four branches that follow are structured with hard `return`s so **only one ever executes**:
   ```js
   // src/engine/index.js:725-734
   const action=this.chooseAction(p);
   if(action.type==="attack"){if(!this.tryTrade(p))this.battle(p,action.target);return;}
   if(action.type==="trade"){this.tryTrade(p);return;}
   if(action.type==="dock"){if(this.doDock(p,action.ing))return;}
   // fallback: fish regardless of purse size — otherwise a bot with nothing left to dock,
   // trade, or attack for ... just sits there forever
   {const h=this.flip(p); ... this.ev({t:"fish",...});}
   ```
   Note the one apparent wrinkle: when the chosen action is `"attack"`, the code first calls `tryTrade(p)` (an *opportunistic* trade-candidate check against whichever opponent is willing, not necessarily the attack target) and only battles if that trade attempt fails. This still executes **exactly one** economic action per turn (trade *substitutes for* the battle, it never *adds to* it) — it does not create a "trade + separate action" sequence. The only non-terminal branch is `dock` falling through to `fish` when `doDock` returns `false` (an *illegal* dock attempt, e.g. someone already occupies the single dock) — that is a fallback for a failed action, not a second action after a successful one.

**Verified live** (this session): `chooseAction` is called exactly once per `takeTurn` invocation; there is no code path in `src/engine/index.js` where a bot both trades and performs a second, independent action in the same turn. The engine simulator already obeys D-01/D-02's "one action" rule for trades — it simply has no hail concept at all (correctly, per D-08).

**(a) What `takeTurn` does today:** storm push (single gust, D-15's gap) → movement (1 coin, unconditional) → exactly one scored action (attack/trade/dock, with fish as an illegal-dock fallback).
**(b) Is an alignment change warranted?** No — the "trade as the one action" rule is already enforced.
**(c) Would it perturb fixtures?** Not applicable — no change is being made here.
**(d) Recommendation:** Do **not** add any "trade+action" fix to the re-record. The corpus's single re-record pass should be scoped to: (1) D-15's storm-gust alignment, and (2) the D-12 moored-reason field *if* the planner adopts it this phase. Nothing else in `takeTurn` needs re-recording.

## D-17 and the `chooseAction`/hail boundary

`chooseAction` (`src/engine/index.js:663-692`) is a **shared engine method** called from both `botTurn` (`src/ui/flow.js:613`, the live game) and `takeTurn` (`src/engine/index.js:725`, the deterministic all-bot simulator). It is the single scoring/selection function both paths use.

**This resolves the open "Claude's Discretion" question about where the hail should live.** Folding the hail into `chooseAction` as a formal option (the shape D-02/D-03 superficially suggest, mirroring how Parley is one of `humanAct`'s options) would inject hail logic into `takeTurn`'s simulator path too — directly violating D-08 ("Hailing... does not exist in the deterministic engine's `takeTurn`; do NOT add it") and perturbing all 30 fixtures a second time for a feature explicitly declared out of scope for the engine.

**Correct structure:** keep the hail as a UI-tier-only pre-check in `botTurn`, exactly where it lives today (`src/ui/flow.js:585-612`, before the `chooseAction` call at line 613) — but restructure so that **taking a hail skips the `chooseAction` call entirely for that turn** (implementing D-02's "hail costs the action"). Concretely: wrap the `chooseAction`+action-execution block (lines 613-622) so it only runs `if a hail did not happen this turn`, e.g. track a local `hailed` boolean set when `dealt` (or even when the hail was accepted-or-declined — see below) and `return` before reaching `chooseAction` if so.

**Open sub-question for the planner (D-02 exact wording):** "A bot that hails the human does NOT also fish/dock/attack that turn" — this reads as: attempting a hail (even if refused) consumes the action, matching how a human's Parley consumes the action whether or not the trade completes (`humanTrade` returning `false` only re-prompts the SAME action menu, it does not grant a second action once `trade` is chosen and completes/fails cleanly — see `src/ui/flow.js:485`). Recommend: consuming the action on **any actual hail attempt** (the `ask()` prompt was shown to the human), not only on `dealt===true`, to match a human's Parley precisely. This should go into the phase's plan as an explicit rule, not left ambiguous.

## D-12 root cause (STORM-01 criterion 2 — the false "dock held fast" message)

**This is a narration-precision bug, not a movement/off-by-one bug in `windPush`'s square-stepping.** Confirmed by a live repro against the actual engine this session (not simulated/assumed):

`Game.moored(p)` (`src/engine/index.js:252-254`):
```js
moored(p){ // ships that DOCKED last turn (or sit at a berth / Isle of Tortuga) can't be wind-forced into land
  return p.justDocked||(this.cfg.singleDock&&this.adjPort(p)!==null)||man(p.pos,this.home)<=1;
}
```
This ORs three semantically distinct conditions into one boolean:
1. `p.justDocked` — genuinely docked last turn.
2. `this.adjPort(p)!==null` — genuinely standing on a dock cell right now.
3. `man(p.pos,this.home)<=1` — **within 1 square of Tortuga, regardless of which island or dock the wind is pushing toward.**

`windPush` (`src/engine/index.js:266-267`) and its UI mirror `windLeg` (`src/ui/flow.js:215-216`) both fire the identical event on any of these three: `if(this.moored(p)){this.ev({t:"moored",p:p.idx});return;}`. `EVENT_NARRATION.moored` (`src/ui/util.js:253`) renders exactly one line for all three causes: `` `The dock steadies ${pn(p.idx)} from running aground ⚓` ``.

**Repro (run this session against `src/engine/index.js` via `roundCfg`, seed 12345):** islands are placed at least Manhattan-distance 2 from home (`src/engine/index.js:125`: `if(cellsR.some(c=>man(c,this.home)<2))continue;`), but this still leaves water cells that are simultaneously **distance 1 from home** and **immediately adjacent to an island** — confirmed present for the very first seeds checked (e.g., seed 12345 has a water cell at `(7,8)`, home at `(7,7)`, immediately adjacent to island cell `(7,9)`, and this water cell is not any ingredient's assigned dock). Placing a player at that cell and pushing them one step toward the island:
```
p.pos: [7,8]  man(p.pos,home): 1
adjPort(p): null   <- NOT standing on any dock
moored(p): true    <- fires purely off the home-proximity clause
EVENT FIRED: {"t":"moored","p":0}
```
The narration would read "The dock steadies {p} from running aground ⚓" — but the ship is not at a dock, has not docked recently, and the island being approached (and its actual dock) may still be a full square or more away. This is exactly the reported symptom: the message claims dock protection when the boat has not reached any dock.

**Distinguishing engine bug vs. UI-only bug (as the research brief required):** The underlying rule — "a ship within 1 square of home is safe from being blown onto adjacent land" — is very likely *intentional* existing behavior (a designed safe-harbor radius around Tortuga), not a broken off-by-one in the per-square loop. `nx` (the candidate next square) is correctly computed before the move commits in both `windPush` and `windLeg`; there is no reference-frame confusion in the movement math itself. **The bug is that one generic narration string is used for three different justifications**, and it happens to name "the dock" even when the actual reason is home-proximity or an unrelated dock. This is a copy-precision problem.

**Minimal correct fix:** tag the `moored` event with a `reason` field at each engine call site (`src/engine/index.js:265` home-arrival, `:267` island-with-moored(p)-true, and the UI mirror `src/ui/flow.js:212`, `:216`), e.g. `reason: "justDocked"|"dock"|"home"`, then branch `EVENT_NARRATION.moored` (`src/ui/util.js:253`) into three distinct lines. **This DOES change the serialized event shape** — `serializeSeed()` (`scripts/determinism_baseline.js:88-92`) does `JSON.stringify(e)` over the raw event object, so adding a field changes every seed's SHA-256 the moment a `moored` event fires in that seed's playthrough. **Recommendation: if this fix is adopted this phase, land it in the SAME commit/wave as D-15's storm-gust change, and re-record once, together** — exactly the sequencing D-16 is protecting against.

## D-9/D-10/D-11 — bot storm push rendering (the pattern to copy, and the exact gap)

**Human reference pattern — `windLeg`, `src/ui/flow.js:206-263`.** This is a per-square loop (`for(let s=0;s<dist;s++)`) that, on hitting something notable (home, blocker, island), calls `appState.game.ev({...})` then `await narrateLastEvent();liveRender();return;` before returning. For a plain uneventful square (open water, no island/blocker/rim), it does `p.pos=nx;` and continues the loop **without** an intermediate render — the visible movement for an ordinary square is only flushed once the whole leg (1-2 squares) finishes (`src/ui/flow.js:262`: `appState.game.ev({t:...windmove...});liveRender();`). So even for humans, "square at a time" really means "square-at-a-time only at the outcome squares (island/blocker/home)", with silent/batched movement through ordinary water. Match this exact behavior for bots — do not over-engineer per-square rendering on empty water tiles beyond what humans already get.

**Bot code today — `src/ui/flow.js:555-568` (`botTurn`'s storm block):**
```js
if(g.stormNow){
  const before=[...p.pos];
  const wasDocked=g.adjPort(p)!==null;
  const dodgedOnce={v:false};
  g.windPush(p,DIRS[g.windNow],2,dodgedOnce);
  g.windPush(p,DIRS[g.windNow2],2,dodgedOnce);
  p.justDocked=false;
  if(p.pos[0]!==before[0]||p.pos[1]!==before[1])g.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});
  await botBeat();
  if(p.shipwrecked){p.shipwrecked=false;return;}
}
```
Both `g.windPush(...)` calls (each up to 2 squares) execute back-to-back with **zero rendering or narration between them** — only a single `await botBeat()` (`src/ui/util.js:548`: `netHandlers().onLiveRender();await narrateCurrent();`) happens after BOTH gusts fully resolve. `narrateCurrent()` (`src/ui/util.js:551-558`) reads only `appState.game.events[appState.evIdx]` — **one single event pointer**, not "every event since the last check" — so if the two `windPush` calls produced 2+ events (e.g., a `dodge` on the first gust and a `windmove` summary on the second), only one of them is ever narrated. This is the literal "boat teleports 4 squares with no narration" bug D-09/D-11 describe.

**Existing narration copy already covers every listed storm event type — confirming/correcting D-13's premise.** `EVENT_NARRATION` (`src/ui/util.js:225-323`) already has entries for every event type in D-11's list:
| Event type | Existing narration | Location |
|---|---|---|
| `windmove` | `"${pn(e.p)} is carried by the storm"` | `util.js:248` |
| `blownOut` | `"⛵ A gale blows ${pn(e.p)} off the dock!"` | `util.js:249` |
| `dodge` | `"${pn(e.p)} pays 1🌕 to anchor safely"` | `util.js:251` |
| `anchor` | `"${pn(e.p)} flips ⚪HEADS — dodges the rocks!"` | `util.js:252` |
| `moored` | `"The dock steadies ${pn(e.p)} from running aground ⚓"` | `util.js:253` |
| `blocked` | `"Spotting ${pn(e.other)} dead ahead, ${pn(e.p)} strikes sail..."` | `util.js:254` |
| `anchorHold` | `"${pn(e.p)}'s anchor already down..."` | `util.js:255` |
| `aground` (with/without crate) | `"${pn(e.p)} flips ⚫TAILS — runs aground!..."` | `util.js:258` |
| `shipwrecked` | `"${pn(e.p)} is shipwrecked, and spends their turn making repairs."` | `util.js:261` |

**Every event D-11 lists already has a narration string**, and it is already generic third-person (`pn(e.p)` — works identically for a human OR bot subject), because `describe()`/`EVENT_NARRATION` is a single shared table consumed by both `narrateLastEvent()` (human path) and `narrateCurrent()`/`syncLogLines()` (bot/log path). **The actual gap is not "missing copy" — it is "not being surfaced per-square for bots" (the `botBeat()`-only-narrates-the-current-pointer bug above).** Reusing these existing lines verbatim would already satisfy D-11's literal requirement ("every storm outcome must be surfaced"). D-11's own example text — `"…flips: tails — runs aground!"` — is nearly identical to the existing `aground` line already in the table. **Recommend presenting this finding to Wyatt as part of the D-14 copy-approval gate**: the "genuinely new copy required" framing in D-13 may be narrower in practice than assumed — new copy may be desirable as a *flavor upgrade* (shorter/punchier for D-10's "snappier" pacing, or distinct from the more verbose human-interactive phrasing used inside `windLeg`'s prompts), but it is not filling a structural gap. Frame the Wyatt-facing deliverable as "here are the existing lines, reused as-is for these events — do you want them punched up, or are they fine?" rather than "write brand-new lines from scratch."

**Recommended implementation shape:** add a new UI-tier function (e.g. `botWindLeg(p,dirKey,dist,dodgedOnce,wasDocked)` in `src/ui/flow.js`, alongside `windLeg`) that mirrors `windLeg`'s per-square loop and its non-interactive island-outcome logic (mirrors `windPush`'s auto-decision: pay-if-`coins>=3`, else flip, else lose-half/lose-a-crate/shipwreck — this auto-decision logic already exists in engine's `windPush`, `src/engine/index.js:271-281`, so bots get IDENTICAL outcomes today; the only missing piece is per-square rendering, not the decision logic itself), but **skip** the interactive `ask()` prompt and **skip** the flip animation (`humanFlip`'s `netHandlers().onBroadcastFlip("spin")`/`sleep(340)` sequence) per D-11 — call `g.flip(p)` directly and narrate only the result. After each event, call `narrateLastEvent()` (or a bot-paced variant) + `liveRender()`, exactly like `windLeg` does at its outcome branches. Replace the two `g.windPush(...)` calls in `botTurn` (`src/ui/flow.js:559-560`) with two calls to this new function.

**D-10's "snappier" pacing — available levers, no number prescribed (Claude's Discretion, confirmed unresolved):** `narrateLastEvent()` paces via `flash(L.txt)` → `msgHoldMs(text)` (`src/ui/util.js:462-469`: `Math.round(Math.min(Math.max(1000+len*50+pauses*300,1200),7000)*0.8)`), the same formula used for human narration. For a typical ~50-character storm line with one clause, that is roughly 3.0s hold per square — up to 4 squares per bot, times up to 3 non-acting bots per storm round, is a real pacing risk (potentially 30-40s of storm narration per round in a 4-player game) that directly trades against legibility per D-10's own caution. Recommend the plan introduce either (a) a separate, shorter hold-time formula for bot storm narration specifically (e.g. a lower multiplier or a lower cap than the human 7000ms ceiling), or (b) collapsing same-leg outcomes (e.g., a `dodge`+final `windmove` in one leg) into a single combined narration line rather than two sequential `flash()` calls. This is an implementation decision to make during planning, not a research gap.

## Hail block structure (AI-01, D-02–D-08)

**Current structure — `src/ui/flow.js:584-612`, inside `botTurn`, called unconditionally BEFORE `chooseAction`:**
```js
// src/ui/flow.js:584-612
if(g.cfg.parley&&(appState.game.round-(p.lastOffer||-9))>=3){
  for(const ing of g.needs(p)){
    if(g.tokens[ing]>0)continue;                                    // :587 last-resort gate (D-05) — keep as-is
    const human=g.players.find(q=>q.strategy==="human"&&!q.done&&q.ing.includes(ing)); // :588 — FIRST match only, needs D-06 ranking
    if(human&&p.coins>=5){
      ...ask("...5🌕...")...                                         // flat 5, counters 6-10 (D-07 target)
      break;
    }
  }
}
const action=g.chooseAction(p);   // :613 — ALWAYS runs, even if the hail above just happened — THIS is the double-action bug
```
The `break` at line 609 only exits the `for(const ing of g.needs(p))` loop — it does NOT prevent line 613's `chooseAction()` call from running afterward. **This confirms the folded todo's exact bug**: a bot that hails still gets a full `chooseAction` (dock/attack/trade/fish) in the same turn.

**D-02/D-03 fix shape:** track whether a hail attempt happened this turn (recommend: any turn where the `ask()` hail prompt was actually shown to the human, matching D-02's exact wording — see the open sub-question above), and if so, `return` before reaching `chooseAction()` at line 613 (after the usual `await botBeat()` pacing beat).

**D-06 ranking — current code only finds the FIRST human holding the ingredient** (`g.players.find(...)`, line 588), not a ranked candidate list. In pass-and-play/multiplayer with 2+ human seats this is a real gap even before D-06's tie-break rules are applied. Rank via: `g.players.filter(q=>q.strategy==="human"&&!q.done&&q.ing.includes(ing))`, sort candidates by `g.cnt(q.ing,ing)` descending (spare-holders first per D-06 rule 1), then within a tier by "whoever it hurts least" (D-06 rule 2 — a reasonable proxy: prefer the holder whose `needs(q)` does NOT include `ing`, i.e. it's not on their own recipe), with proximity (`man(q.pos, g.islandOf[ing])`) strictly as the final tiebreaker (D-06 rule 3 — note the crate pool is guaranteed empty when a hail fires, per D-05's gate, so no target can actually restock; do not build logic that assumes otherwise).

**D-07 pricing — current code is flat:** `let price=5,dealt=choice==="sell";` with counter-offers `[6,7,8,9,10].filter(n=>n<=p.coins)` (lines 593-599). To combine "bot's desperation" and "seller's cost", a natural approach mirroring the existing bot-trade-valuation pattern already in `humanTrade`'s bot-side branch (`src/ui/flow.js:366-386`, which computes `essential`/`trulyEssential`/`scarcityBonus` from `needs(q)` and `cnt`) is to compute: `desperation` = 1 if `ing` is the bot's last remaining need (or a late-round threshold), else lower; `sellerCost` = lower if the seller holds 2+ spare (per D-06 ranking), higher if it's their only one and it's on their own recipe. Base offer + `desperation * sellerCost`-scaled bonus, capped by the bot's actual purse (`p.coins`) so a bot can never offer more than it has, and floored so it never bankrupts itself below a small reserve (existing pattern: bots already gate hailing on `p.coins>=5`, line 589 — keep a similar floor after paying). Bot economy for context: `startCoins:3` (`roundCfg`, `src/engine/index.js:794`), average dock nets ~3 coins, average fish nets ~1.4-2 coins — a bot's purse is a scarce resource, so combined scaling should be tuned conservatively (matches D-07's own caution).

## Determinism harness mechanics (VERIFY-02, D-15/D-16)

**How to run:**
- Verify (fast, no writes): `node scripts/determinism_baseline.js --verify` or `npm run test:determinism`. Confirmed green (30/30) as of this research session, current `main`.
- Full gate suite: `npm test` — runs 9 scripts in sequence: `determinism_baseline.js --verify`, `engine_contract_check.js`, `dlog_replay_test.js`, `net_registry_test.js`, `net_contract_check.js`, `state_contract_check.js`, `module_graph_check.js`, `ui_contract_check.js`, `no_undef_check.js` (`package.json`). All 9 currently pass.
- Re-record (after a deliberate, confirmed-intentional behavior change): `node scripts/determinism_baseline.js --capture`. This rewrites `scripts/fixtures/determinism/manifest.json` AND all 30 `seed-*.jsonl` files.
- **Do not** use `--capture` merely to fix a stale `engineSourceHash` after a pure code-move with no behavior change — use `scripts/rebase_source_hash.js` instead (it gates on every seed's fresh replay still matching its frozen hash, and touches only the `engineSourceHash` field). Not relevant to storm-behavior changes (which DO change behavior), but relevant if a later refactor-only pass touches `src/engine/`.

**What a fingerprint covers:** `serializeSeed(g)` (`scripts/determinism_baseline.js:88-92`) is `g.events.map(e=>JSON.stringify(e)).join("\n")` plus one final `__final__` state-snapshot line (`finalStateLine`, lines 70-83: winner, round, and every player's `pos`/`coins`/`ing`/`done`). Each event object (`Game.ev`, `src/engine/index.js:233-235`) carries `round`, `wind`, `storm`, `wind2` (currently always `undefined` in the simulator — see below), a full per-player `state` snapshot (`pos`/`coins`/`ing`/`done`), and `tokens`. **Any field added to any event — including a new `reason` tag on `moored` (D-12's proposed fix) — changes the JSON string and therefore the SHA-256**, exactly as flagged above.

**Seeds/personalities:** 30 seeds, `12345`-`12374` inclusive (`SEED_BASE=12345`, `SEED_COUNT=30`). 5 personalities (`pirate, trader, balanced, rusher, monopolist`) rotated across the 4 seats via `strategiesFor(i)` (`(i+s)%5` for seat `s`), so composition varies seed-to-seed.

**Confirmed: `windNow2` is genuinely never set by the engine's own `play()` loop.** `Game.ev()` reads `this.windNow2` (`src/engine/index.js:233`), but nothing in `src/engine/index.js` ever assigns `this.windNow2` — it is only ever assigned by the **orchestrator** (`src/orchestrator.js:683,706`: `appState.game.windNow2=appState.game.stormNow?PERP[appState.game.windNow][Math.floor(appState.game.r()*2)]:null;`), which the determinism harness's `playSeed()`/`g.play()` path never calls. This means every fixture's `wind2` field is currently `undefined` for every event in the 30-seed corpus, and `PERP` is annotated in `src/shared/index.js:147` explicitly as: *"consumed only by the classic live turn loop, where `PERP[windNow][Math.floor(game.r()*2)]` indexes directly by RNG draw. The headless corpus cannot catch a reorder here."* This is the authors' own advance warning that this exact code path (extending the headless engine to consume `PERP`) is new, uncovered territory — treat the RNG-draw ordering with the same care the annotation demands.

**Exact fix location for D-15:** `src/engine/index.js`'s `play()` (lines 744-770) needs to roll `windNow2` the same way the orchestrator does, immediately after the existing `storm=rollStorm(this)` roll (line 750), store it (e.g. `this.windNow2=storm?PERP[wind][Math.floor(this.r()*2)]:null;` — requires adding `PERP` to the existing `import {...} from "../shared/index.js"` at the top of the file, `src/engine/index.js:8`, which currently omits it), and `takeTurn` (lines 693-704) needs to apply BOTH gusts sharing one `dodgedOnce`, mirroring `botTurn`'s exact shape (`src/ui/flow.js:556-567`):
```js
// current (single gust, src/engine/index.js:697-704)
if(storm){
  const before=[...p.pos];
  const wasDocked=this.adjPort(p)!==null;
  this.windPush(p,DIRS[windDir],2);
  p.justDocked=false;
  if(p.pos[0]!==before[0]||p.pos[1]!==before[1])this.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});
  if(p.shipwrecked){p.shipwrecked=false;return;}
}
// target shape (two gusts, shared dodgedOnce — mirrors src/ui/flow.js:556-567)
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
This consumes one additional `this.r()` call per stormy round (the `windNow2` draw) that the corpus has never consumed before, so **every seed with at least one storm will produce a different RNG sequence from that round forward** — this is expected and matches D-15's accepted one-way reversibility, not a bug to chase.

**D-16 tooling gap — confirmed, real, and currently unaddressed.** `verify()` (`scripts/determinism_baseline.js:150-241`) reports **only the first divergent seed and the first divergent event index within it** (lines 194-220: `if (firstDivergenceSeed === null) { ... break-equivalent via the outer forEach continuing but no further detail logged ... }`). It does not enumerate every divergence across all 30 seeds, nor every divergent event within a single seed beyond the first. **This is insufficient to satisfy D-16's explicit requirement** ("confirm the differences are only storm-related" before re-recording) once a real behavior change is in flight, because after the FIRST divergence is found, nothing tells you whether the 2nd, 3rd, ... Nth divergent seed/event is ALSO purely storm-related, or whether a genuinely unrelated regression is hiding a few events later in the same seed or in a different seed entirely. **Recommend a plan task to add a diffing capability** — either a `--diff` flag on `determinism_baseline.js` or a new `scripts/determinism_diff.js` that, for every seed, walks the full old vs. new event arrays and prints EVERY divergent line (not just the first), tagged with the event `.t` type, so a human (or the plan's own verification step) can scan the full list and confirm every single divergence is `moored`/`windmove`/`dodge`/`anchor`/`aground`/`blocked`/`anchorHold`/`shipwrecked`/`windPush`-adjacent (i.e., storm-related) and nothing else changed (e.g., no unexpected divergence in `battle`, `trade`, `dock`, `fish` events, which would indicate an unrelated regression). This is a genuine Wave 0 gap, not covered by existing tooling.

`rebase_source_hash.js` (`scripts/rebase_source_hash.js`) is unrelated to this phase's re-record — it exists solely to update `engineSourceHash` after a pure code-relocation with zero behavior change (verified: it gates on every seed's fresh hash still matching the frozen one, and refuses to touch the manifest otherwise). Not the right tool for D-15's actual re-record — use `--capture` for that, after the diff-confirmation step above.

`npm test`'s 9 gates run `determinism_baseline.js --verify` first; if the storm/moored changes land before the fixtures are re-recorded, `npm test` will correctly fail at that gate until `--capture` is run — this is expected, not a regression, and should be called out explicitly in the plan's task sequencing so an executing agent doesn't "fix" the failing gate by reverting the engine change.

## Layer/purity constraints (confirmed via `npm test`, all 9 gates currently green)

- **`engine_contract_check.js`** (`scripts/engine_contract_check.js`) enforces, over `src/engine/*.js` + `src/shared/*.js` only: zero `document.`, `window.`, `firebase`, `localStorage`, `Date.now`, `Math.random`, `globalThis`, `new Function` references (purity gate); exactly 7 `"ORDER IS LOAD-BEARING"` annotations across those two directories (do not add or remove one without updating the hardcoded count at `scripts/engine_contract_check.js:121`); a `shared` → `engine` DAG-direction check (shared must never import engine); and moved-symbol export completeness. **`PERP` is already annotated `ORDER IS LOAD-BEARING`** (`src/shared/index.js:147`) — importing it into `src/engine/index.js` for D-15 does not require a NEW annotation (the annotation lives at PERP's declaration site in `shared/`, not at each import site), but the count-of-7 check means don't casually add a fresh "ORDER IS LOAD-BEARING" comment anywhere else in `engine/`+`shared/` without also updating that hardcoded `7`.
- **`module_graph_check.js`** (`scripts/module_graph_check.js`) enforces: no import cycles; `shared` imports nothing from `src/`; `engine` → `shared` only; `net` → `shared` only; **`ui` → `shared`/`engine`/`state` only, and `ui` must NEVER import `net`** (dedicated D-07 assertion). This is why the hail (a UI-tier feature) must read engine state directly (already does — `g.tokens`, `g.needs(p)`, `g.cnt(...)`, all already used this way in `flow.js`) rather than ever importing anything from `src/net/`.
- **Classification for this phase's changes:**
  - Bot storm-stepping (D-09/D-10/D-11): **UI-tier only** (`src/ui/flow.js`, `src/ui/util.js` for new/branched narration copy).
  - Hail restructuring (D-02–D-08): **UI-tier only** (`src/ui/flow.js`), reading engine data, never engine code changes.
  - Storm-gust alignment (D-15): **engine-tier** (`src/engine/index.js`: `play()`, `takeTurn()`), the one deliberate engine-behavior change this phase.
  - Moored-reason tag (D-12, if adopted): **split** — engine-tier event payload (`src/engine/index.js`) + UI-tier narration branch (`src/ui/util.js`).
  - New copy (D-13/D-14): **UI-tier only** (`src/ui/util.js`'s `EVENT_NARRATION` table), Wyatt-approval-gated.

## Existing narration/copy plumbing (for D-13's new lines)

Single source of truth: `EVENT_NARRATION` object literal, `src/ui/util.js:225-323`. Each key is an event's `.t` string; each value is a function `(e, at, cellPx) => ({txt, caps, pops, cls})`. Three thin wrapper functions all read this same table:
- `describe(e)` (`src/ui/util.js:325-334`) — used by `narrateLastEvent()` (`src/ui/panel.js:345-359`, human-path narration) and by `syncLogLines()` (`src/ui/util.js:342-344`, populates `appState.logLines` used by `narrateCurrent()`/bot-path narration).
- `captions(e)` (`src/ui/util.js:362-366`) — short per-ship board captions.
- `spawnPops(e, at, cellPx)` referenced in the header comment (board emoji pop animations) — not fully read this session but follows the same `EVENT_NARRATION[e.t](e, at, cellPx)` pattern per the module's own header note (`src/ui/util.js:212-217`).

**Any new/branched line for D-13 (or a `reason`-branched `moored` line for D-12) goes here, as a new or modified entry in this one object.** No parallel narration table exists anywhere else in `src/ui/`.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | No formal framework (no Jest/Vitest/Mocha) — custom Node ES-module scripts under `scripts/`, run via `node`, gated by `npm test` |
| Config file | none — gate list lives in `package.json`'s `"test"` script string |
| Quick run command | `node scripts/determinism_baseline.js --verify` (or `npm run test:determinism`) — seconds |
| Full suite command | `npm test` (9 gates: determinism, engine contract, dlog replay, net registry, net contract, state contract, module graph, ui contract, no-undef) |

Note: `.planning/codebase/TESTING.md` and `.planning/codebase/STRUCTURE.md` are stale (dated 2026-07-22) and describe the **pre-refactor monolithic `index.html`** with VM-extraction test harnesses. That architecture no longer exists — confirmed live this session (`npm test` reports "the classic `<script>` region in index.html is empty" and "the PP bridge is gone"). Treat this RESEARCH.md's direct-source citations as authoritative over those two stale docs for this phase; recommend a `gsd-docs-update`-style refresh of `.planning/codebase/` at some point outside this phase's scope.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| STORM-01 (visual stepping) | Boat visibly moves one square at a time through a storm push (up to 4 squares) | manual/UAT | Safari + Chrome playtest, force a storm via temp `cfg.storm=1` (see MEMORY.md's Safari-storm note — revert after) | ❌ — not automatable (DOM/CSS animation timing) |
| STORM-01 (correct-square moored) | No false "dock held fast" when not actually at a dock | unit (new) | `node scripts/storm_moored_reason_test.js` (proposed — assert `moored()`'s 3 causes tag distinct `reason` values, and that `EVENT_NARRATION.moored` renders 3 distinct strings) | ❌ Wave 0 |
| STORM-01 (bot per-square narration) | Every storm outcome event fires a narration during a bot's push, not just at the end | manual/UAT (narration log) + optional unit (assert event count matches narrated-line count for a forced multi-leg push) | manual: watch narration log during a forced-storm bot turn; automated: proposed `node scripts/bot_storm_narration_test.js` | ❌ Wave 0 (automated part) |
| AI-01 (hail costs the action) | A bot that hails does not also dock/attack/trade/fish that same turn | unit (new, pure-logic extraction recommended) + manual/UAT | proposed: extract hail-eligibility/targeting as a pure exported function testable without DOM/Firebase, e.g. `rankHailTargets(g,p,ing)`; manual: multi-human pass-and-play observing the narration log for "hails... AND fishes" | ❌ Wave 0 |
| AI-01 (D-06 ranking, D-07 pricing) | Hail prefers 2+-spare holders, then least-hurt single-holders, proximity as tiebreaker only; offer scales on both desperation and seller cost | unit (new, pure-logic) | proposed `node scripts/hail_ranking_test.js` feeding constructed `Game` player states | ❌ Wave 0 |
| VERIFY-02 (30/30 green) | Determinism harness green after storm-movement/engine changes | integration (existing) | `node scripts/determinism_baseline.js --verify` | ✅ exists |
| VERIFY-02 (D-16 "confirm storm-only diff") | Every fixture divergence is storm/moored-related, nothing else changed | tooling (new) | proposed `node scripts/determinism_baseline.js --diff` or `scripts/determinism_diff.js`, enumerating every divergent event across all 30 seeds, not just the first | ❌ Wave 0 — genuine gap, see `## Determinism harness mechanics` |

### Sampling Rate

- **Per task commit:** `node scripts/determinism_baseline.js --verify` (fast) + any new targeted unit script for the task just completed.
- **Per wave merge:** full `npm test` (9 gates).
- **Phase gate:** full `npm test` green against the NEWLY re-recorded fixtures (post `--capture`), plus manual Safari + Chrome UAT of the visible storm stepping and the hail flow (per project's core value: "must stay playable end-to-end in both Safari and multiplayer" — this phase's Safari re-verification carries the same precedent as the prior storm-perf crash, per `.planning/PROJECT.md`/STATE.md's "Safari re-verification" concern).

### Wave 0 Gaps

- [ ] `scripts/determinism_baseline.js --diff` (or a new `scripts/determinism_diff.js`) — enumerate every divergent event across all 30 seeds, not just the first, to satisfy D-16. **Highest-priority gap — blocks safely re-recording the corpus.**
- [ ] A pure, DOM/Firebase-free exported function for hail targeting/pricing (e.g. `rankHailTargets`/`priceHailOffer` in `src/ui/flow.js` or a small new module) so D-06/D-07's logic is unit-testable without mocking `ask()`/DOM/`netHandlers()`.
- [ ] (Optional, if D-12's moored-reason fix is adopted) a small assertion script confirming the 3 `moored` reasons map to 3 distinct narration strings.
- [ ] No dedicated test-runner install needed — `node` is already the only runtime dependency (`v25.9.0` confirmed present in this environment); `npm test` has no missing tool dependencies.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All `scripts/` gates, determinism harness | ✓ | v25.9.0 (confirmed this session) | — |
| npm | `npm test` script runner | ✓ (bundled with Node) | — | — |
| Safari | STORM-01/VERIFY-01-adjacent manual UAT (project's core-value browser) | Not verifiable from this environment (macOS Safari testing requires the actual browser, not scriptable here) | — | Manual UAT step in the plan, per project precedent (prior Safari storm-perf crash) |
| Firebase (multiplayer sync) | Not touched by this phase's engine/UI changes | N/A — this phase's changes are entirely local-simulation/rendering; no multiplayer-sync code is touched | — | — |

**Missing dependencies with no fallback:** none — this phase requires no new tools.
**Missing dependencies with fallback:** Safari manual verification cannot be automated in this research/planning environment; the plan must include an explicit manual UAT task for it (matching the project's existing precedent for storm-related Safari testing, per MEMORY.md's Safari + module-cache note).

## Security Domain

`security_enforcement` is enabled (`.planning/config.json`: `"security_enforcement": true`, `"security_asvs_level": 1`). This phase's scope (storm-movement rendering, bot AI turn structure, deterministic-simulator alignment) has essentially no attack surface — no new user input, no new network calls, no new persisted data, no auth/session/crypto involved.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Unchanged — this phase touches no auth code |
| V3 Session Management | No | Unchanged |
| V4 Access Control | No | Unchanged — single-player/local-simulation and existing multiplayer host-authority model untouched |
| V5 Input Validation | Marginally yes | The hail's new `ask()`-based prompts reuse the EXISTING `resolveOpt()` fallback pattern (`src/ui/util.js:497-501`), which already defensively handles a malformed/out-of-range choice index (falls back to a safe default rather than throwing). No new validation surface is introduced — just more calls into an already-hardened helper. |
| V6 Cryptography | No | Unchanged — no crypto touched (the determinism harness's SHA-256 use, `scripts/determinism_baseline.js:94-96`, is a test-tooling integrity check, not application cryptography) |

### Known Threat Patterns for this stack

None newly applicable this phase. The existing pattern already in place and unaffected: `resolveOpt()` (`src/ui/util.js:497-501`) defends against a corrupt/missing remote decision index (Firebase-relayed or replay-log-sourced) — this phase's new hail-ranking code will call the same `ask()`/`resolveOpt()` path and inherits that protection automatically; no new mitigation is required.

## Common Pitfalls

### Pitfall 1: Re-recording fixtures before confirming the diff is storm-only

**What goes wrong:** Running `--capture` immediately after the D-15 engine change (or the D-12 moored-reason change) silently bakes in ANY other divergence — including an accidental unrelated regression — as the new "correct" baseline, permanently.
**Why it happens:** `--capture` has no dry-run/diff mode; it always writes.
**How to avoid:** Build/use a diff capability (see Wave 0 gaps above) BEFORE running `--capture`, and manually confirm every divergent event across all 30 seeds is one of `moored`/`windmove`/`blownOut`/`dodge`/`anchor`/`anchorHold`/`aground`/`shipwrecked`/`blocked` (or the `moored` event's new `reason` field, if D-12 is adopted) and nothing else.
**Warning signs:** A divergence in `battle`, `trade`, `dock`, or `fish` events, or in the `__final__` state line for a NON-storm reason (e.g., a different `pos` that isn't explained by extra storm movement).

### Pitfall 2: Folding the hail into engine's `chooseAction`

**What goes wrong:** `chooseAction` is shared between the live game's `botTurn` and the simulator's `takeTurn`. Adding a hail option there injects a hail concept into the deterministic engine, directly violating D-08 and perturbing all 30 fixtures for an out-of-scope feature.
**Why it happens:** D-02/D-03's "the hail is the action, just like Parley is a `humanAct` option" framing superficially suggests folding it into the analogous bot function.
**How to avoid:** Keep the hail as a UI-tier pre-check in `botTurn` that, when taken, skips the `chooseAction` call for that turn — never touch `chooseAction` itself for this.
**Warning signs:** Any diff touching `src/engine/index.js`'s `chooseAction` for hail-related work.

### Pitfall 3: Narrating every ordinary storm square when humans don't get that either

**What goes wrong:** Over-implementing D-09 by rendering/narrating every single ordinary open-water square during a bot's storm push, when the human reference (`windLeg`) itself only renders/narrates at outcome squares (island/home/blocker) and batches ordinary movement.
**Why it happens:** A literal reading of "one square at a time, visibly" without checking what the human path actually does.
**How to avoid:** Match `windLeg`'s exact granularity — render/narrate at outcome events, let ordinary movement resolve within the existing per-leg render cadence.
**Warning signs:** A bot storm push feels noticeably slower or busier than the equivalent human push for the same seed/scenario.

### Pitfall 4: Treating D-13's "new copy required" as a hard gap when most lines already exist

**What goes wrong:** Spending the D-14 approval-gate cycle drafting entirely new lines for events that already have adequate narration in `EVENT_NARRATION`, when the real ask from Wyatt may just be "make these punchier/pirate-flavored," not "write these from scratch."
**Why it happens:** CONTEXT.md's D-11/D-13 framing ("never narrated before") describes the bot-narration GAP (not being shown), not a copy gap (the copy already exists and is generic/reusable).
**How to avoid:** Present the existing 9 lines (table above) to Wyatt as the starting point for the D-14 approval pass, explicitly asking whether each should be kept, tweaked, or rewritten — rather than presenting a blank slate.
**Warning signs:** Rewriting lines that already read correctly and generically (e.g., the existing `aground` line is nearly identical to D-11's own example phrasing).

## Code Examples

### Verified: `chooseAction`'s single-action-per-turn structure (D-17 evidence)
```js
// src/engine/index.js:725-734 — read this session, exact
const action=this.chooseAction(p);
if(action.type==="attack"){if(!this.tryTrade(p))this.battle(p,action.target);return;}
if(action.type==="trade"){this.tryTrade(p);return;}
if(action.type==="dock"){if(this.doDock(p,action.ing))return;}
{const h=this.flip(p);
  if(h)p.coins+=2;else if(this.cfg.sardine)p.coins+=1;
  this.ev({t:"fish",p:p.idx,heads:h?1:0});}
```

### Live repro: the false "dock held fast" (D-12 evidence, run this session against seed 12345)
```js
// Player parked 1 square from home, NOT on any dock cell
p.pos = [7,8];               // home = [7,7]; island cell [7,9] one step south
g.adjPort(p)      // -> null   (confirmed: not standing on any dock)
g.moored(p)       // -> true   (fires purely off man(pos,home)<=1 clause, src/engine/index.js:254)
g.windPush(p, [0,1], 1);   // push toward the island cell
// -> ev fired: {"t":"moored","p":0}
// -> narrated as: "The dock steadies {p} from running aground ⚓" (src/ui/util.js:253)
// -> but the ship was never at a dock, and the actual dock may be a full square further away
```

### Target shape for `takeTurn`'s storm block (D-15 fix, mirrors `src/ui/flow.js:556-567`)
```js
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
(Requires `this.windNow2` to be rolled in `play()` right after `rollStorm`, and `PERP` added to `src/engine/index.js:8`'s existing `import {...} from "../shared/index.js"` list.)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Monolithic `index.html` with VM-extraction test harnesses (`real_game_test.js`, described in stale `.planning/codebase/TESTING.md`) | Fully split ES-module tiers (`src/engine/`, `src/ui/`, `src/net/`, `src/state/`, `src/shared/`) with 9 standing `npm test` gates including a module-graph/layer-purity scanner | Phases 8-11 (per `src/**/*.js` header comments, e.g. `src/ui/flow.js:1-43`) | This phase's plan should cite `src/**` files directly, not `index.html` line numbers, and should NOT re-introduce cross-tier imports the gates would reject |

**Deprecated/outdated:** `.planning/codebase/TESTING.md` and `.planning/codebase/STRUCTURE.md` (both dated 2026-07-22) describe the pre-refactor architecture and should not be used as a citation source for this phase's plan — cite `src/**/*.js` directly instead, as this document does.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | D-02's "hail costs the action" should trigger on any hail ATTEMPT (prompt shown), not only on a completed deal (`dealt===true`) | Hail block structure | If Wyatt intends only a *successful* hail to cost the action, the implementation and its UAT criteria would need to change — flag this explicitly to Wyatt/the planner as a decision, not an assumption to build on silently |
| A2 | D-06's "whoever it hurts least" among single-holders should be proxied by "ingredient not on that player's own recipe" | Hail block structure | If Wyatt has a different notion of "hurts least" (e.g., purse size, distance from their own goal), the ranking heuristic would need adjustment — low risk, easily tunable post-hoc since it's pure UI-tier logic with no fixture impact |
| A3 | The home-proximity clause in `moored()` (`man(p.pos,home)<=1`) is intentional existing design (a safe-harbor radius around Tortuga), not itself a bug to remove | D-12 root cause | If Wyatt actually wants this rule removed entirely (not just the narration fixed), that is an ENGINE behavior change (would perturb fixtures) rather than the narration-only fix recommended here — worth confirming explicitly before implementation, since it changes the fix's fixture-impact classification |

**None of these are compliance/security/retention-policy items** — all are gameplay-design judgment calls that are cheap to revisit (UI-tier or narration-only, except A3 which the research explicitly flags as needing confirmation before implementation).

## Open Questions

1. **Does D-02's action-consumption trigger on hail attempt or hail success?**
   - What we know: A human's Parley consumes the action whether or not the trade completes.
   - What's unclear: CONTEXT.md's D-02 wording doesn't disambiguate for the bot's hail.
   - Recommendation: Default to "any attempt consumes the action" (matches the human precedent exactly) unless Wyatt says otherwise during planning/execution.

2. **Should the `moored()` home-proximity rule itself be narrowed (engine change) rather than just the narration (Assumption A3)?**
   - What we know: The rule as written protects ships within 1 square of home from ANY adjacent island, not just from the island whose dock they're actually near.
   - What's unclear: Whether this is desired game balance (a "safe harbor radius") or an unintended side effect nobody previously noticed because the narration masked it.
   - Recommendation: Present the live repro from this research to Wyatt explicitly during planning — if the rule itself is deemed wrong (not just its wording), that reclassifies this from a UI-tier/narration fix to an engine-tier, fixture-perturbing change that must be folded into the same D-15 re-record pass.

3. **Exact "snappier" bot-storm pacing numbers (D-10).**
   - What we know: Existing `msgHoldMs()` formula and `botBeat()`/`flash()` primitives; the pacing risk of up to 3 non-acting bots × 4 squares × ~3s holds per storm round.
   - What's unclear: The specific hold-time reduction or narration-collapsing strategy Wyatt will find "snappy enough" without losing legibility.
   - Recommendation: Implement with an easily-tunable single constant (e.g., a bot-specific multiplier distinct from `MSG_HOLD_MULTIPLIER`), and treat exact tuning as a manual-UAT-adjustable knob rather than a hardcoded one-shot guess.

## Sources

### Primary (HIGH confidence — direct file reads and live repro this session)
- `src/engine/index.js` (full file, 800 lines) — `Game` class, `moored()`, `windPush()`, `chooseAction()`, `takeTurn()`, `play()`, `roundCfg()`
- `src/ui/flow.js` (full file, 934 lines) — `windLeg`, `humanWind`, `humanAct`, `botTurn` (storm block + hail block + action dispatch)
- `src/ui/util.js` (lines 200-580) — `EVENT_NARRATION`, `describe()`, `syncLogLines()`, `botBeat()`, `narrateCurrent()`, `msgHoldMs()`, `ask()`, `resolveOpt()`
- `src/ui/panel.js` (lines 1-45, 330-360) — `narrateLastEvent()`
- `src/shared/index.js` (lines 143-182) — `DIRS`, `DIRNAME`, `PERP` (with its "ORDER IS LOAD-BEARING" annotation), `OPPOSITE`, `STORM_DIAG`
- `src/orchestrator.js` (grep + targeted reads) — `windNow2` roll (lines 683, 706), `botTurn`/`humanTurn` dispatch (lines 691, 714)
- `scripts/determinism_baseline.js` (full file) — `capture()`, `verify()`, `serializeSeed()`, `finalStateLine()`
- `scripts/rebase_source_hash.js` (full file)
- `scripts/module_graph_check.js` (full file) — tier-shape and cycle assertions
- `scripts/engine_contract_check.js` (full file) — purity, annotation-count, DAG-direction, export-completeness assertions
- `scripts/dlog_replay_test.js` (lines 1-40) — confirmed unrelated to this phase's scope
- `package.json` — the 9-gate `npm test` script string
- `.planning/config.json` — `nyquist_validation: true`, `security_enforcement: true`, `security_asvs_level: 1`
- Live command output this session: `node scripts/determinism_baseline.js --verify` (30/30 PASS, confirmed current baseline is green before any changes)
- Live command output this session: `npm test` (all 9 gates PASS, confirmed current state)
- Live repro script run this session (`scratchpad/probe_moored2.mjs`, deleted after use) — empirically confirmed the D-12 false-positive `moored()` scenario against `src/engine/index.js`'s actual `Game` class with `roundCfg`, seed 12345

### Secondary (MEDIUM confidence)
- `.planning/phases/14-engine-adjacent-gameplay-fixes-determinism/14-CONTEXT.md` — the 17-decision user context; treated as authoritative for DECISIONS, cross-checked against source for every file:line citation it made (a few line-number citations drifted by 1-3 lines from current source — corrected line numbers are used throughout this document)
- `.planning/REQUIREMENTS.md`, `.planning/STATE.md` — phase scope and traceability, consistent with CONTEXT.md

### Tertiary (LOW confidence / stale — flagged, not relied upon)
- `.planning/codebase/TESTING.md`, `.planning/codebase/STRUCTURE.md` — both dated 2026-07-22, describe the pre-refactor monolithic `index.html` architecture; explicitly superseded by direct-source citations in this document (see `## State of the Art`)

## Metadata

**Confidence breakdown:**
- Standard stack: N/A — no new packages/frameworks (vanilla ES modules unchanged)
- Architecture/tier boundaries: HIGH — confirmed by running `npm test`'s module-graph/engine-contract gates live, all passing
- D-17 answer: HIGH — read `takeTurn`/`chooseAction` end-to-end, confirmed single-action structure by direct code trace
- D-12 root cause: HIGH — confirmed by a live, reproducible repro script run against the actual engine this session, not just static reading
- D-9/D-10/D-11 gap and existing-copy finding: HIGH — confirmed by direct comparison of `windLeg` vs. `botTurn`'s storm block and the full `EVENT_NARRATION` table
- Hail restructuring (D-02-D-08): HIGH for the bug/boundary findings, MEDIUM for the exact D-06/D-07 heuristic recommendations (reasonable proxies, not specified by Wyatt — flagged in Assumptions Log)
- Determinism harness / D-16 tooling gap: HIGH — confirmed by reading `verify()`'s exact reporting logic; the gap is a plain absence of a feature, not an inference

**Research date:** 2026-07-26
**Valid until:** Should remain valid for the duration of Phase 14's execution (this is a point-in-time snapshot of a fast-moving in-progress codebase — re-verify file:line citations if execution stalls more than ~1-2 weeks past this research date, per the project's active refactor cadence)
