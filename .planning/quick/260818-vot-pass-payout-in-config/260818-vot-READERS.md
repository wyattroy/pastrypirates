# Every reader of the pass payout — enumerated as commands, before a production line moved

Quick task `260818-vot`, Task 1. This file exists because the **−21.2 ladder regression**
(`docs/HARD-WON-LESSONS.md` §0 checklist item 4) came from changing how a quantity is produced
without first listing what reads it — and because a gate re-pointed at a calculation goes
**VACUOUS** rather than wrong, which still prints PASS.

Run from `/Users/wyattroy/Documents/Projects/pastrypirates` on 2026-08-18, at
`282a70b` (`a23af98` confirmed an ancestor, so plan 01-04's `doPass` and plan 01-03's rewritten
`scripts/bot_ladder4.js` are both present).

**No production file was edited in the task that produced this file.**

---

## (a) The four enumerations, raw

### 1. `grep -rn "coins *+= *1\|coins++" 4/src/`

```
4/src/ui/util.js:1810:  p.coins-=take;others.forEach(q=>q.coins++);
4/src/engine/index.js:953:    p.coins+=1;
```

### 2. `grep -rn "Recipe idea" 4/ scripts/`

```
4/scripts/pass_narration_test.js:102:const TAG = "Recipe idea! (+1\u{1F315})";
4/scripts/pass_narration_test.js:124:  SEA_CREATURES.every((s) => !s.y.includes("Recipe idea") && !s.t.includes("Recipe idea")));
4/scripts/pass_narration_test.js:170:check("the tag is written in exactly one place in the narration table", countOf(UTIL_SRC, "Recipe idea!"), 1);
4/src/ui/util.js:521:    txt:`🌊 ${seaLine(e.sea,isLocalTo(e.p,viewerSeat),pn(e.p))} <span class="nobrk">Recipe idea! (+1🌕)</span>`,
```

### 3. `grep -rn "doPass" 4/`

```
4/scripts/pass_coin_test.js:15: *   RULE-01 payment     One shared Game.prototype.doPass(p) raises the acting captain's purse by
4/scripts/pass_coin_test.js:117:const HAS_DOPASS = typeof g.doPass === "function";
4/scripts/pass_coin_test.js:118:checkTrue("CONTROL: doPass exists on the Game prototype", HAS_DOPASS);
4/scripts/pass_coin_test.js:130:g.doPass(p);
4/scripts/pass_coin_test.js:133:check("doPass raises the acting captain's purse by exactly one dubloon", p.coins - coinsBefore[1], 1);
4/scripts/pass_coin_test.js:134:check("doPass appends exactly one entry to the event log", g.events.length - evBefore, 1);
4/scripts/pass_coin_test.js:212:checkTrue("the human menu calls the shared method", humanRegion.includes("doPass("));
4/scripts/pass_coin_test.js:213:checkTrue("the animated bot fallback calls the shared method", botRegion.includes("doPass("));
4/scripts/pass_coin_test.js:217:check("the UI tier calls the shared method at exactly the two sites it owns", countOf(FLOW_SRC, "doPass"), 2);
4/scripts/pass_coin_test.js:224:checkTrue("the engine defines and calls the shared method", countOf(ENGINE_SRC, "doPass") >= 2);
4/src/ui/flow.js:1863:    appState.game.doPass(p);
4/src/ui/flow.js:2144:  g.doPass(p);
4/src/ui/util.js:505:  // RULE-01/D-06: passing pays a dubloon (Game.doPass), and the line says so. Wyatt's wording, his
4/src/engine/index.js:952:  doPass(p){
4/src/engine/index.js:2735:    // is paid the same dubloon a human is paid for it (RULE-01, see doPass).
4/src/engine/index.js:2736:    this.doPass(p);
```

### 4. `grep -rn "new Game(" 4/ scripts/bot_ladder4.js`

```
4/scripts/trade_offer_measure.js:72:  const g = new Game(roundCfg(STRATS), SEED0 + i * 101, true);
4/scripts/pass_coin_test.js:108:function newGame(seed) { return new Game({ ...roundCfg(STRATS), bakeoff: true }, seed, true); }
4/src/orchestrator.js:1526:  appState.game=new Game(cfg,seed,true);
4/src/ui/board.js:1969:    appState.game=new Game(roundCfg(strategies),Math.floor(Math.random()*1e9),true);
4/src/state/index.js:7:// but insufficient for state that gets reassigned after init (`room=code`, `game=new Game(...)`,
4/scripts/bot_ladder4.js:78:    const g = new Game({ ...roundCfg(STRATS), bakeoff: true }, s * SEEDMULT, true);
```

---

## (b) Classification — the deliverable

Four columns, per the plan. **"What it reads"** is the distinction that matters: a reader of the
QUANTITY must derive; a reader of the RENDERED STRING or the SOURCE TEXT is a gate and must keep
its hand-typed pin, or it stops being able to fail.

| Reader | What it reads | Treatment |
|---|---|---|
| `4/src/engine/index.js:953` — `p.coins+=1` inside `doPass` | the QUANTITY | **becomes derived** — reads the new config field off `this.cfg`. This is the site the task exists to de-hardcode. Statement ORDER is unchanged (payment before `this.ev`). |
| `4/src/ui/util.js:521` — the `pass:` narration builder's tag | the QUANTITY, embedded in a rendered string | **becomes derived** — amount read off `appState.game.cfg`, following the `dock:` builder at `:664` which already reads `dockHeads`/`dockTails` off the live game unguarded from inside this same table. Everything else about the line is untouched. |
| `4/src/ui/flow.js:1806` — the Pass option label | the QUANTITY (new reader, added by this task) | **becomes derived** — Attack-shaped parenthetical at `:1759`, amount off `appState.game.cfg`, present only when the payout is truthy. |
| `4/scripts/pass_coin_test.js:133` — `doPass raises … by exactly one dubloon`, expected `1` | the QUANTITY, hand-typed | **stays a pinned literal.** This pin is what catches the config default moving. Removing it in favour of `=== cfg.passCoin` is exactly the tautology this task must not build. |
| `4/scripts/pass_narration_test.js:102` — `TAG = "Recipe idea! (+1🌕)"` | the RENDERED STRING, hand-typed | **stays a pinned literal.** It is D-06's approved wording, and the 100 renderings compared against it are the evidence that the de-hardcoding is invisible at the shipped default. Editing it would destroy that evidence. |
| `4/scripts/pass_narration_test.js:170` — `countOf(UTIL_SRC, "Recipe idea!") === 1` | the SOURCE TEXT of `util.js` | **unchanged.** QUOTED-vs-BARE trap is live: a comment in `util.js` that quotes the tag takes this count to 2 and the gate goes red for the wrong reason. Write comments with the string bare. |
| `4/scripts/pass_coin_test.js:217` — `countOf(FLOW_SRC, "doPass") === 2` | the SOURCE TEXT of `flow.js` | **unchanged.** Same trap in the other file: a comment in `flow.js` naming the method inflates this to 3. |
| `4/scripts/pass_coin_test.js:224/225` — engine `doPass` ≥ 2, one `ev({t:"pass"` | the SOURCE TEXT of `engine/index.js` | **unchanged.** |
| `4/scripts/pass_coin_test.js:141/142/202` — the ORDERING assertions | the recorded event SNAPSHOT | **unchanged.** They read the purse out of the snapshot, not the source order, so they survive the derivation and must be re-proved against the derived code (sabotage 4). |
| `4/scripts/pass_coin_test.js:165` — the pass entry's key set | the recorded event SHAPE | **unchanged.** The amount must NOT ride on the event; Phase 3 freezes this stream. |
| `4/scripts/pass_coin_test.js:233-236` — determinism scan of `4/src/engine/` | the SOURCE TEXT of the engine directory | **unchanged.** Adding a config field must not introduce `Math.random` / `Date.now` / `performance.now`. |
| `scripts/bot_ladder4.js:78` | the QUANTITY, indirectly, through `roundCfg()` | **unchanged and untouched** — it is the neutrality instrument. Editing it would destroy the before/after comparison. |
| `4/scripts/trade_offer_measure.js:72` | constructs a Game from `roundCfg()`; does not read the payout | **unchanged.** Inherits the field automatically. |
| `4/src/ui/util.js:1810` — `q.coins++` | a DIFFERENT quantity (the shot-clock forfeit redistribution) | **unchanged.** Matched by grep 1 only because of the `coins++` alternation. Not the pass payout; do not touch it. |
| `.planning/phases/01-before-the-engine-freezes/01-CONTEXT.md:112` (D-06) | the RENDERED STRING, as an approved-copy record | **unchanged.** A record of what Wyatt approved; it is not a spec of where the number lives. |
| `.planning/phases/01-before-the-engine-freezes/01-06-PLAN.md` (~line 218) | the LOCATION of the payout, in prose | **unchanged — and this is the pointer that MOVES.** It tells wave 5 to change the amount "at its single source in `doPass`". After this task that single source is the `roundCfg()` field and `doPass` derives from it. Recorded in the SUMMARY rather than edited: another phase's approved plan is not this task's to rewrite. |
| `.planning/STATE.md` decision log, `01-04-SUMMARY.md` | the QUANTITY, as an append-only historical record | **unchanged.** No future tense in an append-only record; a ledger records what happened. |

| the rest of `.planning/` — the plan-to-plan "do not touch" reference blocks in `01-01`…`01-06-PLAN.md`, plus `01-RESEARCH.md`, `01-PATTERNS.md`, `01-DISCUSSION-LOG.md`, `01-VALIDATION.md` | the RENDERED STRING, as planning record | **unchanged.** They quote D-06's tag as a thing that exists, not as a location for the number. Point, don't restate — none of them is edited by this task. |

**Published docs carry no copy of the payout.** Widening enumeration 2 to
`grep -rn "Recipe idea" docs/ 4/RULES-V2.md .planning/` returns **zero hits under `docs/` and zero
in `4/RULES-V2.md`** — every hit outside `4/` is a `.planning/` record, listed above. So no
published number moves with this change and no documentation edit is owed.

---

## (c) The NaN question, answered as a command

`doPass` is about to read a config field. A Game constructed from a cfg lacking that field gives
every passing captain a **NaN purse** — which renders as a dash and gets reported as a UI bug three
days later. Every construction site must therefore route through `roundCfg()`.

Enumeration 4 finds **six** `new Game(` mentions; one (`4/src/state/index.js:7`) is prose in a
comment, leaving five real construction sites:

| Site | cfg comes from | Routes through `roundCfg()`? |
|---|---|---|
| `4/src/ui/board.js:1969` (`seedIdleGameState`) | `roundCfg(strategies)` inline | **YES**, directly |
| `4/src/orchestrator.js:1526` (`beginGame(cfg,seed)`) | its caller — see the two below | **YES**, via both callers |
| ↳ caller A: `4/src/orchestrator.js:1511` (`startGame`) → the room's `cfg` | `const cfg=roundCfg(strategies)` at `:1511`, written to the room at `:1515` | **YES** |
| ↳ caller B: `4/src/ui/util.js:2008` (solo/host resume) | `const cfg=roundCfg(saved.strategies)` | **YES** — the cfg is REBUILT from `roundCfg()` on resume, not read out of the save |
| `4/scripts/pass_coin_test.js:108` | `{...roundCfg(STRATS), bakeoff:true}` | **YES** |
| `4/scripts/trade_offer_measure.js:72` | `roundCfg(STRATS)` | **YES** |
| `scripts/bot_ladder4.js:78` | `{...roundCfg(STRATS), bakeoff:true}` | **YES** |

**VERDICT: every construction site routes through `roundCfg()`. No fallback default is needed, and
none will be added** — a fallback would re-introduce the hidden constant this task exists to remove,
in the one place nobody would ever grep for it.

Two notes, recorded as facts rather than as work:

- **The guest path inherits the field for free.** `4/src/orchestrator.js:1515` writes the WHOLE
  `cfg` object to the room, and a joining guest's `beginGame` is handed `r.cfg` read back out of it
  (`:1503`). So a new field on `roundCfg()` reaches guests automatically and correctly. `4/`
  multiplayer has never executed (Phase 2 opens it).
- **The solo save is safe by construction.** A save written before the field existed still produces
  a cfg carrying it, because the resume path rebuilds from `roundCfg()` and only overlays `bakeoff`
  and `ovens` from the save. No schema stamp bump is required.

---

## (d) The before-ladder, checked against a value known in advance

Captured to a scratch directory outside the working tree — these are measurements, not artifacts,
and 01-05 did not commit its own.

```
node /Users/wyattroy/Documents/Projects/pastrypirates/scripts/bot_ladder4.js 20 7919 --json > "$SCRATCH/before.json"
shasum -a 256 "$SCRATCH/before.json"
```

| | sha256 | verdict |
|---|---|---|
| **CONTROL** — recorded by plan 01-05 | `a2224555a51f455dcac2883de28e72051e31aa301d51f3a415ceb5f07e7b9cc1` | the anchor |
| **OBSERVED** — this run, 2026-08-18 | `a2224555a51f455dcac2883de28e72051e31aa301d51f3a415ceb5f07e7b9cc1` | **MATCH** |

The anchor holds. Nothing moved between plan 01-05 and this task, so a difference in the after-run
can only be attributed to this change. Wall clock 7.1s, exit 0, run in the foreground and bounded;
nothing left running.
