# Architecture audit — every game fact decided in more than one place

**Wy-Blade, 2026-09-16 · branch `sep16-architecture-cleanup` · audited at `c7833097` (= dev = staging 2026.09.16.4) · read and measure only: no code changed.**
**STATUS: DRAFT BEFORE CEO REVIEW.** The CEO's verdict and the corrections it asks for are recorded at the end of this file once it has run.

## His ask, verbatim
> "get the Wy:Blade to run a full audit of all architectural inconsistencies to create an itemized, CEO-verified list of how to clean them up. then verify it, and have it do this work in a separate branch off yours. end with a sea trial to make sure it did not break anything, and report to me your findings."

**His clarification, verbatim:** "By architectural inconsistencies, I mean exactly the work that we just did in this session about where functions are used only once, but in multiple different places."

**The test applied to every candidate:** *if I changed this in one of the places, would the other place(s) silently keep the old behaviour?* If yes, it is an item. In scope: a rule, a number, a calculation, a piece of state, a look (colour, size, timing). Not in scope on its own: code smells, style, dead code, long functions, or a "who is playing" conditional that is the only place deciding its fact.

**His definition of the work, per item (DECISIONS.md:3390-3398):** a. name the fact in the game's words · b. count every place that decides it, file:line · c. make that count ONE — every path goes through it, copies deleted, never a special case beside them · d. a gate that fails if a second copy ever appears, red-proofed · e. report the fact, the count before and after, the gate's name.

## How this was measured
- Six independent read-only auditors, one per area: **the fight** · **the 42 "who is playing" forks** · **reactions outside the one event door** · **bots and humans, one set of rules** · **facts, numbers, words and looks the screen re-derives** · **host and guest agreement**. Each read every cited line; a grep alone was not accepted as a count.
- **"Measured"** below means a node run or a sea-trial screenshot; **"read"** means established by reading the code at every cited line; **"inferred"** means the player-visible symptom follows from the code but was not watched in a browser. Nothing in this list was watched in a browser for this audit.
- Four numbers were re-run on Wy-Blade and reproduced exactly: the crosswind re-fire in the engine, the flee-square split (483 of 1842 fights), the plunder split (46 of 3166 pairings), and the starting purses ([3,3,3,3] in the engine on seeds 7919, 104729, 12345). The purses were also verified independently on the Mac, and the Mac confirmed by reading that the real fight has no crosswind test.
- Where two auditors reached the same item from different sides, the item says so ("found by"). Independent agreement is evidence; it is not a measurement.

---

## The summary, in plain words

**42 items** — a fact written in two to eight places, in every part of the game.

| Tier | What a player would notice | Items |
|---|---|---|
| **1** | Something on screen is wrong or different today, or one of his rulings never reached the game players play | 1–13 |
| **2** | Bots are tuned and measured on a different game from the one people play | 14–16 |
| **3** | A player would notice rarely, or only on one kind of screen | 17–25 |
| **4** | Nothing today — copies that agree now and will drift the next time one is changed | 26–42 |

Items 1 and 2 are ranked first at Mac: Dev's request: both decide whether any bot result means anything.

**The three biggest findings:**
1. **The fight is written twice, and the copy players play never received his crosswind ruling** (item 1). Real games never run the engine's fight; it only runs in bot ladders. The two copies have drifted four times already, and bots are tuned on the one nobody plays (items 1, 14, 15, 16).
2. **A voyage starts differently in the game and in the bot ladder** (item 2): the game staggers starting purses 3/4/5/6, the ladder gives everyone 3, and the rules page tells players "3 gold coins". Crow's-nest calls exist only in the game.
3. **Crew guests get a different game on screen in several places** (items 3, 4, 5, 6, 8): the top bar marks a different captain, the camera stops following captains after the first fight, the End of Voyage arrives early without confetti, a flip's spin sound starts twice, and some fight lines appear on no screen at all.

**What this list leaves undone:** it proposes no bot-strategy changes (a separate session owns smarter bots); it does not delete dead code except where an item's copy is dead; and it does not converge the fight's *step order*. After items 1, 14, 15 and 16 every rule of a fight and a turn is one, but the sequence of steps is still written in both runners (headless and animated). A generator both drive would make it one; that has never been tried.

**Calls only he can make** (the cleanup can proceed around them, but these items cannot close without his answer):
- Item 2: keep the staggered purses (and the rules page says so), or drop the stagger.
- Item 3: what the top bar marks during the recipe draft, when no captain has a turn yet.
- Item 13: may a captain who is baking still make crow's-nest calls?
- Item 14: after a hail that strikes no deal, does the turn end for everyone, or may everyone still dock or muse?
- Item 35: in pass-and-play, during a bot's turn, does the bot's row float to the top of the plaque (today) or does the device-holder stay on top?

**Gates that already exist but do not hold what their names promise** (fix alongside the named item):
- `whose_turn_one_fact_check.mjs` anchors on the second copy (`'ribbonTick prefers S.activeSeat'`), so converging the top bar makes it exit 2 — rewrite with item 3.
- `one_event_consumer_check.mjs` §5 *requires* the End of Voyage twins ("the way applyEndMeta (the guest twin) always has") — rewrite with item 5.
- `rules_claims_match_engine_check.mjs` proves the fight's rules on the engine's `awardSpoil`/`downwindSide`, which real games do not run — repoint with item 1.
- `ask_render_convergence_check.mjs` §3 still allows two button emitters for a draft fork that converged on 2026-09-09 — tighten when touched.
- `one_display_door_check.mjs` checks only `flow.js` for dock coins, only `pickCell` for camera calls, and nothing for `__pp4.battle`, `stormCam`, `playBattleEngage`, `playWinScreen`, `forgetCourse`, `flashCaptainsBox`, `victoryConfetti` — extend with items 4, 5, 12, 24.

---

# TIER 1 — a player sees it today, or a ruling never reached the game

### 1. THE FIGHT IS WRITTEN TWICE — and the copy players play never received his crosswind ruling
*Found by: fight, rules, facts, host/guest auditors · the re-fire, flee and plunder numbers measured and reproduced on Wy-Blade · the real fight's missing crosswind test confirmed by reading on Wy-Blade and, independently, on the Mac.*
- **Which fight runs where:** solo, pass-and-play and crew host run `src/orchestrator.js:605 asyncBattleRun` (from `flow.js:2890` when a human attacks, `:3247` when a bot attacks); a crew guest computes nothing and watches it. `src/engine/index.js:1928 battle()` runs only in headless voyages (`Game.takeTurn:3013-3014`) — every bot ladder and matrix. The copies have drifted four times: the live `battle` event dropped `downwind` (`orchestrator.js:857-861`); the route fix reached the sail but not the flee (`w9_rim_sweep_flee_check.mjs:13`); the flee `needs()` bug had to be fixed in both (`611d0908`); the crosswind ruling `5e2654de` changed only the engine.
- **a. FACTS — one fight, one item** (Mac: Dev: "one fight, not three patches"):
  1. **May the attacker pay to fire again, and when** — his ruling (DECISIONS.md:3296): *"in crosswinds, there should be no reflip option… if both get heads, there's simply no winner"* — and the re-fire's price leaving the purse.
  2. **Where a fleeing ship may go, whether a bot flees, and how the flee is recorded.**
  3. **Which crate the winner takes.**
  4. **Who wins a round of shots, and why** (heads beats tails; two heads to the downwind ship; otherwise collide or miss), and whether a shot landed.
  5. **The fight's bookkeeping and ending event** (battle count, attacker wins, the skirmish remembered, `battle`/`battlenull`/`battleflee` and their fields).
- **b. PLACES:**
  1. Re-fire offer — count 2, one missing the rule: `engine:1975-1980` (`crossTie … nulled=true`, then `!refire||att.coins<refire`) vs `orchestrator.js:781-797` (`while(!winner)` … `if(refire&&att.coins>=refire){ … ask("battle.refireAsk") / wantsRefire`, no crosswind test, affordability again at `:797`). Payment — count 2: `engine:1981-1982` and `orchestrator.js:798-799` (`att.coins-=refire; ev({t:"refire"})`, the powder shape; CEO-REVIEWS.md:58). The comment at `orchestrator.js:578-580` still describes the old rule; `rules.html:122` reads as still allowing it.
  2. Flee — count 2 each: squares `engine:1956` `reachableFrom(def)` (no rim, `:706`) vs `orchestrator.js:734, 746` `reachable(def)` (rim allowed, `flow.js:361`); the bot's decision `engine:1954-1955` vs `orchestrator.js:744`; the record `engine:1958-1962` (`tradewind` before a `battleflee` with no `p`/`route`) vs `orchestrator.js:762-766` (the event with `p`+`route` first).
  3. Plunder — count 3: `engine:1856-1872` `awardSpoil` (needed → wanted by another captain → first; un-finishes a raided baker); `engine:2828-2830` (the bot planner mirroring it); `orchestrator.js:847` `pick=w2[0]||lose.ing[0]` (no "wanted by another" step) with its own crate move `:849-854` (no un-finish; unreachable today, since `done` is set only by a winning bake that ends the voyage).
  4. Round result — count 3: `engine:1939-1945` (+`:1984`); `orchestrator.js:691-709` (+`:803-805`; says `battle.downwindHits` at `:692-697`); `util.js:620-625` re-derives "won on the wind" (`wonOnWind`) and says `battle.downwind`. `shotLands` is emitted only at `orchestrator.js:727, :805`.
  5. Bookkeeping — count 2: `engine:1932, 1961-1962, 1992-1993, 1997, 2002-2003` vs `orchestrator.js:622, 765-766, 830-831, 838, 856, 862`; the fields already differ (engine `flips`, live `spoilChosen:false`; nothing in `src` reads either).
- **c. ONE PLACE — the engine owns every rule of a fight as steps, and both fights call them** (the shape `payPowder` already has):
  - `Game.beginBattle(att,def)` — legality, `payPowder`, the battle count, the `engage` event (item 4).
  - `Game.resolveRound(att,def,ah,dh,downwind)` / `Game.resolveRefire(att,def,rh)` — return `{scorer, why:"hit"|"wind"|"collide"|"miss"}`, push the round, emit `shotLands`. The bubble and `util.js` read `why` (whether one explaining bubble or two stays is his taste).
  - `Game.refireOffered(att,def,downwind,rounds)` — **the one place the fact "may the attacker pay to fire again" is decided** (the crosswind rule and affordability); `Game.payRefire(att,def)`.
  - `Game.fleeSquares(def)` (rim allowed, as W9's ride animates), `Game.botWantsFlee(att,def,downwind)`, `Game.botFleeSquare(att,def,cells)`, `Game.flee(att,def,dest,rounds,downwind)` (move, record, event with `p`+`route`, then `tradewind`).
  - `Game.botSpoilPick(win,lose)` (pure) and `Game.takeSpoil(win,lose,pick)`; a human's choice goes to `takeSpoil`.
  - `Game.nullBattle(…)` and `Game.winBattle(win,lose,pick,…)`.
  - `battle()` becomes the headless driver (bot choosers); `asyncBattleRun` keeps only pacing, animation and asking. **No second crosswind check is added beside the orchestrator's loop.** Its resolution, re-fire gate and payment, flee formula, crate move, counters and ending events are deleted, along with `util.js:621-622` and `engine:2828-2830`. The comment at `orchestrator.js:578` is corrected to the current rule; `rules.html:122` follows the rule.
- **Before the fix (Mac: Dev's requirement):** pose it in a browser on Wy-Blade at 375×812 — the same seed, a crosswind fight, both coins forced to heads — and screenshot the "Fire again" prompt appearing. After the fix, the matching screenshot shows it gone. The before picture proves the bug on the played path; the after picture proves the check can see it.
- **d. GATE:** `scripts/qa/one_fight_rules_check.mjs` (comments stripped), each rule red-proofed:
  1. `refireOffered` holds the crosswind test and affordability; no `coins [<>]= refire` test and no two-heads-no-wind test exist outside it; `battle(` and `asyncBattleRun(` both call it; behavioural: a posed crosswind double-heads → false, a posed both-tails with a full purse → true. *Red:* the orchestrator's `refire&&att.coins>=refire` restored; the crosswind clause deleted from `refireOffered`.
  2. `.coins -= refire` and `t:"refire"` only in `payRefire`. *Red:* `att.coins-=refire` pasted back into the orchestrator.
  3. Neither fight names `reachable(`/`reachableFrom(` for a flee; `t:"battleflee"` only in `Game.flee`, before `tradewind(`; the recipe-crate flee test only in `botWantsFlee`. *Red:* `battle()` back on `reachableFrom(def)`; `orchestrator.js:744` inline again.
  4. A spoil's `ing.splice(` only in `takeSpoil`; the pick order only in `botSpoilPick`, called by the planner and both fights; behavioural: a posed loser holding a crate another captain wants → that crate. *Red:* `orchestrator.js:847` restored.
  5. The `ah&&dh`/`downwind==="a"` resolution and `rounds.push(` only in `resolveRound`/`resolveRefire`; `t:"shotLands"` only in the engine; no `wonOnWind` in `util.js`. *Red:* the orchestrator resolving `if(ah&&dh)` itself.
  6. `battles++`, `attWins++`, `recordSkirmish(` and `t:"battle"|"battlenull"` never in `orchestrator.js`. *Red:* the orchestrator emitting `battlenull` itself.
  - `rules_claims_match_engine_check.mjs` is repointed at the methods both fights now call.
- **e. COUNT BEFORE → AFTER:** re-fire offer 2 (one missing the rule) → 1 · re-fire payment 2 → 1 · flee squares 2 → 1 · flee decision 2 → 1 · flee record 2 → 1 · plunder pick 3 → 1 · round result 3 → 1 · bookkeeping 2 → 1.
- **PLAYER WOULD NOTICE:**
  - **His ruling is missing from every real game:** a human attacker in a crosswind double-heads is asked "Fire again −2🌕" though the fight's own line says the cannonballs collide. **Measured (reproduced on Wy-Blade):** the engine copy, with a bot forced to want a re-fire, emits `powder,battlenull` and no `refire`. **Read (Wy-Blade and the Mac):** the real fight's loop has no crosswind test. **Measured (simulator):** 61 crosswind ties in 400 voyages; the attacker could pay in 49, a bot would in 33. The browser screenshot is still to be taken (see "Before the fix").
  - **Bots are tuned on a fight nobody plays. Measured and reproduced:** in 400 bot-only voyages (1842 fights) the two copies pick a different flee square in 483 (26.2%), every one the real fight's square on the rim; the winner's crate differs in 46 of 3166 pairings (1.5%). `rules_claims_match_engine_check.mjs` proves the fight's rules on copies real games never run.
  - **Inferred:** two bubbles explain the same two-heads tie; headless voyages have no `shotLands`.
- **RISK** medium-high (the random-draw order moves; the live fight is choreographed and networked; the posed browser pictures and a two-window look are required) · **SIZE** L (engine ~+100/−60, orchestrator.js ~−120, util.js; one gate ~150 lines) · **CONFIDENCE** high (two full copies read line by line; four rules already differ; the ruling landed in one).

### 2. How a voyage starts and each day begins
*Found by: facts, rules auditors · measured on Wy-Blade and independently on the Mac.*
- **a. FACT:** each captain's starting dubloons; what happens at the start of each day (the wind, the day-start record, the storm, the day cap); how the winner is crowned.
- **b. PLACES:**
  - Starting purses — count 2: `src/orchestrator.js:1390-1395` shuffles the order then `coins=cfg.startCoins+pos` (staggered 3/4/5/6, "sim-tested… to flatten the first-mover advantage"); `src/engine/index.js:271` gives every captain `cfg.startCoins`, and `playBakeoff` (`:3231`) shuffles but never staggers.
  - Day-start record — count 2: `engine:3237` and `orchestrator.js:1442`; only the live one carries `streak` (read by `util.js:568`).
  - The 150-day cap — count 3: `engine:3234`, `engine:3263`, `orchestrator.js:1437`.
  - Crowning — count 2: `engine:3316-3326` (`resolveEnd`) and `orchestrator.js:1473-1490`.
  - Crow's-nest calls exist only in the live loop (`flow.js:3603-3655`).
  - `rules.html:113` tells players "3 gold coins".
- **c. ONE PLACE:** engine `Game.beginVoyage(order)` (shuffle + starting purses), `Game.beginDay()` (wind, `newround` with `streak`, storm flag, cap) and `resolveEnd()`; `play()` and `runLiveNet` both call them. **His call:** keep the stagger (and the rules page says so) or drop it.
- **d. GATE:** `scripts/qa/one_voyage_start_check.mjs` — (1) `startCoins` read in one engine method; (2) `t:"newround"` emitted once in `src/`; (3) no literal `150` day cap outside the engine constant; (4) behavioural: after `beginVoyage` purses follow the one rule, and an engine day-start carries `streak`. Red-proof: paste `order.forEach((i,pos)=>{…startCoins+pos})` back into the orchestrator (1); drop `streak` from `beginDay` (4).
- **e. COUNT BEFORE → AFTER:** starting purses 2 → 1 · day-start record 2 → 1 · day cap 3 → 1 · crowning 2 → 1.
- **PLAYER WOULD NOTICE:** **measured** — the engine's voyage starts at [3,3,3,3] at the first `newround` on seeds 7919, 104729, 12345 (Wy-Blade), and the Mac measured 0 crow's-nest calls in an engine voyage; the live game gives 3/4/5/6. The rules page contradicts the game. Every bot ladder (`bot_ladder*.js`, `bot_matrix*.js`, `ladder_dead_trade.mjs`, `ladder_spares.mjs`) measures equal purses and no calls; the Mac treats all ladder results as provisional until this is one.
- **RISK** medium-high (random-draw order and replay save version move; headless baselines change) · **SIZE** M (2 files, ~45 lines + gate) · **CONFIDENCE** high.

### 3. Whose turn the screen shows
*Found by: forks, door, facts, host/guest auditors — four independently.*
- **a. FACT:** which captain holds the turn, as the top bar, the captains-box ring and highlight, the plaque order, the bobbing boat and the "Check my recipe" button show it. His ruling (DECISIONS.md:3403, 2026-09-16): *"The top bar shows whose turn it is -- which is the active player who decided to attack. this does not need to change during a battle; it should not."*
- **b. PLACES — count 4 answers:**
  - `src/ui/stage.js:1571` — the top bar: `S.activeSeat ?? appState.curSeat`, both written only by `applyActiveSeat` (`util.js:2033-2043`), which 19 callers use for whoever is being *asked*: `orchestrator.js:1808` (every event's `e.p` — a defender's `coinflip`, each `sidebet`, `battleflee`), `:528` (defender's flip), `:738` (flee), `:787` (fire again), `:844` (plunder); `flow.js:299, 315, 835, 969, 1927, 2302, 2402, 2451, 2568, 2928, 3069, 3116, 3378, 3608`. `ask()` reads the same slot to route prompts (`util.js:1619`).
  - `src/ui/board.js:2558` (and `:1911`) — ring, highlight, row order: `deriveActiveSeat(events,evIdx)` from `turn`/`ovens`/`bake` events.
  - `src/orchestrator.js:1930` — the bobbing boat: `if(e.t==="turn"…)bobShip(e.p)`, turn only (stays on the previous captain through a bake).
  - `src/ui/flow.js:2984` (cleared `:2991, :3005, :3039, :3043`) — `appState.activeTurnSeat`, host human turn only, read by `board.js:2419` for Check my recipe.
- **c. ONE PLACE:** "whose turn" comes only from `deriveActiveSeat` (`src/shared/storyboard.js:85`) behind one helper; the top bar, ring, highlight, order, bob and Check my recipe read it; `appState.activeTurnSeat` is deleted. "Who is being asked" becomes its own named input: `ask(seat,…)` takes the seat (as `raiseLocalPrompt(seat,…)` already does), so no prompt site and no `consumeEvent` line writes the turn. A bake on a later day needs a turn-establishing event at the attempt's start (`board.js:2511-2515`). **His call:** what the top bar marks during the recipe draft. Graveyard: `storyboard.js:73-84` ("do not 'converge' it without measuring first") and `0efbb205` (ring, box, order converged; top bar left out); `board.js:2517` records "TWO independent answers".
- **d. GATE:** `scripts/qa/whose_turn_shown_once_check.mjs` — (1) the top bar's seat comes from the one helper, never `S.activeSeat`/`curSeat`; (2) box, ring, order, bob and Check my recipe read the same helper; (3) nothing writes `appState.activeTurnSeat`, and no prompt site or consumer line writes the turn; (4) behavioural: a posed fight stream (`turn p0 … coinflip p1 … sidebet p2 … sidebet p3`) gives the attacker at every step. Red-proof: restore `const act = (S.activeSeat != null) ? S.activeSeat : (appState.curSeat ?? -1);` (1); `applyActiveSeat(s.idx)` back in `collectSideBets` (3). Rewrite `whose_turn_one_fact_check.mjs`'s anchor in the same commit.
- **e. COUNT BEFORE → AFTER:** 4 answers → 1.
- **PLAYER WOULD NOTICE:** **measured** in Wy-Blade's sea trial of 2026.09.15.2 (`a296b4de`): on solo desktop battle-guess screens 013, 024, wk-022 the top bar marked the human guesser while the ring marked the attacker; on the crew guest (015) both marked the attacker. **Measured on the pure functions** with a posed fight: the ring stays on 0; the top bar's rule goes 0→1→2→3. **Inferred:** the defender's flip moves every screen's top bar to the defender, breaking his ruling; the top bar and the ring disagree through every bake; "Check my recipe" appears late in pass-and-play.
- **RISK** medium-high (`ask()` routing, the pass-and-play hand-over and prompt placement ride the same slot today) · **SIZE** M (4-5 files, ~25 call sites, ~60 lines + gate) · **CONFIDENCE** high.

### 4. A fight on screen: when the camera holds the two ships, when it lets go, and when the swords clash
*Found by: fight, door, facts, host/guest auditors.*
- **a. FACT:** a fight has begun (the clash sounds; the camera holds both ships) and a fight is over (the camera lets go).
- **b. PLACES — count 5:**
  - `src/orchestrator.js:613` host `window.__pp4.battle(att.idx,def.idx)` · `:614` host `playBattleEngage()`.
  - `src/orchestrator.js:472` guest `if(!appState.spectatingBattle&&!snap.title)playBattleEngage()` — fires on the first battle-node write, which comes after the opening line and every crow's-nest call (`:681`).
  - `src/ui/flow.js:3588` guest `window.__pp4.battle(snap.attIdx,snap.defIdx)` on every snapshot.
  - `src/orchestrator.js:603` host-only release `finally{ … __pp4.battleEnd(); }`. `battleEnd` (`stage.js:5955`) has no other caller; `applyBattleSnap(null)` (`:464-467`) never releases.
- **c. ONE PLACE:** the engine records a fight-start event (`engage {a,d,downwind}`) from item 1's `beginBattle`; `consumeEvent` holds the camera on `engage` and releases it on `battle`/`battlenull`/`battleflee` on every device; `EVENT_SOUND.engage` plays the clash through the one door, so it plays "when battles are first called" (his ruling, DECISIONS.md:426) on every screen. Delete `:603`'s release, `:613-614`, `:472`, and `flow.js:3588`'s camera call.
- **d. GATE:** `scripts/qa/fight_on_screen_one_door_check.mjs` — (1) `playBattleEngage(` called nowhere outside `audio.js`, and `EVENT_SOUND` maps `engage`; (2) `__pp4.battle(` and `__pp4.battleEnd(` only inside `consumeEvent`, both present; (3) both fights emit `engage` before their opening line. Red-proof: `window.__pp4.battle(snap.attIdx,snap.defIdx)` back in `renderBattleFromSnap` (2); `playBattleEngage();` back in `asyncBattleRun` (1).
- **e. COUNT BEFORE → AFTER:** 5 → 1 (the consumer).
- **PLAYER WOULD NOTICE (inferred, high confidence):** after the first fight a crew guest watches, the camera hold is never released, so `stage.js:1841` (`else if (S.battle) { hold }`) stops the guest's camera gliding to the captain each narration line is about, for the rest of the voyage. A guest's clash lands seconds late when a human is asked for a crow's-nest call (`orchestrator.js:508-511` admits it; that note was a session's, not his ruling). A two-tab check settles the first in minutes.
- **RISK** medium (the `engage` event must drain before the opening line) · **SIZE** S-M (engine 1 event, audio.js 1 map entry, orchestrator.js, flow.js; ~25 lines + gate) · **CONFIDENCE** high.

### 5. The end of the voyage: last look, fanfare, the card, the confetti — and the numbers it shows
*Found by: door, facts, host/guest, fight auditors.*
- **a. FACT:** the voyage is over — the board gets its last look, the win fanfare plays, the End of Voyage card appears with its numbers (days, battles, attacker wins, trades, each captain's HEADS), and confetti bursts.
- **b. PLACES — count 2 rituals + 2 routes for the numbers:**
  - Host `src/orchestrator.js:1518-1586` (`liveResolveEndNet`): `fadeOutPanel`, `__pp4.sweepCam()` (1519), `sleepMs(BOARD_LAST_LOOK_MS)` (1521, 2600 ms), `liveDone=true` (1561), `playWinScreen()` (1562), `render()` (1571), `victoryConfetti(winner)` (1585 — its only call site in `src/`).
  - Guest `src/orchestrator.js:948-971` (`applyEndMeta`, via `consumeEvent:1998`): `netReadMeta` → overwrites round/battles/trades/attWins/finishOrder/winner/flips/heads → `liveDone=true;playWinScreen();render();`. No last look, no wide shot, no confetti; `if(!m)return;` (`:952`) runs before `liveDone`.
  - The numbers travel twice: the `meta` node (`writeMeta :874-880`, called `:1491`; read `:953-955`) and the event stream (`end`, `collab`, every `coinflip`); they are also recounted from events in `util.js:911-958` (`computeAwards`). (The fight's `battles++`/`attWins++` copies are item 1.)
- **c. ONE PLACE:** `consumeEvent` on `end` awaits one `endOfVoyage(e)` (last look → fade → `liveDone` → fanfare → render → confetti or the "nobody finished" line) on every screen; `liveResolveEndNet` keeps only the engine work and awaits the drain; the stats come from one pure walk of the events beside `computeAwards`. Delete `applyEndMeta`, `writeMeta`, `netSetMeta`, `netReadMeta`, the `meta` node and its `startGame` slot, and the host's inline ritual. Graveyard: `orchestrator.js:956-969` (2026-09-06, the drumroll twin removed): *"ONE thing both clients run… The candidate is the `end` event… MEASURE FIRST."* — measure the drain timing before moving anything.
- **d. GATE:** `scripts/qa/end_of_voyage_one_place_check.mjs` — (1) exactly one `liveDone=true` in `src/`, inside `endOfVoyage`; (2) `playWinScreen(` and `victoryConfetti(` each called once, inside it; (3) `consumeEvent` calls it on `end`; (4) no `meta` writer/watcher/reader. Red-proof: paste `appState.liveDone=true;playWinScreen();render();` back into a guest-only function (1, 2). Rewrite `one_event_consumer_check.mjs` §5, which today requires the twins.
- **e. COUNT BEFORE → AFTER:** end rituals 2 → 1 · routes for the numbers 2 → 1.
- **PLAYER WOULD NOTICE (inferred from code order):** in every crew game a guest gets no confetti and no last look at the board (his playtest-22 item 12, quoted at `:1504`), and the guest's card arrives ~3.4 s before the host's (the host still waits 2600 ms plus an 800 ms fade after publishing `end`). A missing meta record would leave a guest with no End of Voyage at all.
- **RISK** medium-high (the end of every voyage; reload replay) · **SIZE** M (orchestrator.js, flow.js, net/*, board.js, one gate rewritten; ~80 lines removed, ~50 added) · **CONFIDENCE** high (the code calls them "twins", `:1568`).

### 6. A coin flip on a screen that did not flip it: the spin, the landing, the sound
*Found by: door, host/guest, fight auditors (the facts auditor rejected it; see "Resolved disagreements").*
- **a. FACT:** a flip spins, lands on a face, holds, and clears — and its spin sound plays once — on every screen that did not make the flip.
- **b. PLACES — count 2 wire routes, 3 host routines, 2 sound starters:**
  - Route A, the `flip` node: `orchestrator.js:165` `broadcastFlip` (11 call sites: `flow.js:330, 340, 347, 3257, 3271`; `orchestrator.js:651, 654, 661, 670, 673, 676`) and `:169-171` `watchFlip` (guests, attached `:2803`).
  - Route B, the `coinflip` event (`engine/index.js:322`) → `consumeEvent :1917-1921` → the small coin `flipDockCoin`.
  - Host routines, each spin → sleep → face → hold → clear: `flow.js:314-349` (`humanFlip`), `orchestrator.js:642-663` (`hFlip`), `:664-678` (`bFlip`) — two timing fixes (D-49, T-34; `:633-638, :658-660`) each had to be applied to every copy.
  - Sound: `board.js:3227` (`setFlipCoin("spin")` → `startFlipSpinSound()`) — that big coin is hidden on the stage (`index.html:2252`, `#controlsRow{display:none}`), so on a watcher its only effect is sound — and `dockcoin.js:129` (`flipDockCoin`). `startFlipSpinSound` (`audio.js:998`) stops the loop timer, not a sample already playing.
- **c. ONE PLACE:** `consumeEvent` on `coinflip` on every device: if `decisionIsLocal(e.p)` the stage's big coin lands on `e.heads` (the tap already painted the spin), otherwise the small coin. One `flipFor(player,why)` replaces the three routines, awaiting the drain instead of sleeping and broadcasting. Delete `broadcastFlip`, `watchFlip`, `netSetFlip`, `netWatchFlip`, the `flip` node and all 11 calls (BACKLOG.md:1136 names `watchFlip` as a channel to fold, under his 2026-09-09 "ONE pipe" ruling). Re-anchor `net_contract_check.js` and `host_guest_parity_check.js`.
- **d. GATE:** `scripts/qa/coin_flip_one_pipe_check.mjs` — (1) no `broadcastFlip`/`watchFlip`/`netSetFlip`/`onBroadcastFlip` in `src/`; (2) `sleep(flipSpinLeftMs())` and `sleep(FLIP_LAND_HOLD_MS)` only in `flipFor`; (3) `startFlipSpinSound(` started from exactly the two branches of the one `coinflip` handling. Red-proof: `broadcastFlip(h?"H":"T")` back in `bFlip` (1); a bot fight flip with its own hold (2); an unguarded `startFlipSpinSound()` back in `setFlipCoin` (3).
- **e. COUNT BEFORE → AFTER:** wire routes 2 → 1 · toss routines 3 → 1 · spin-sound starters for another screen's flip 2 → 1.
- **PLAYER WOULD NOTICE (inferred, not heard):** on a watching screen, two overlapping coin sounds a beat apart for a bot's fight flip (the solo host included) and, in crew, for a human's dock or fight flip — the "robotic" doubling of his 2026-08-20 note — or a spin cut short.
- **RISK** high (flip pacing, the flip-stage veil, the network contract count) · **SIZE** L (5-6 files, ~100 lines removed) · **CONFIDENCE** high on the two routes; medium on how audible it is.

### 7. The route a ship draws when it sails — bots and humans ask for it differently
*Found by: rules auditor.*
- **a. FACT:** which squares a ship crosses when it sails, and whether its landing square is legal.
- **b. PLACES — count 5 route requests, 2 legality paths:**
  - `src/engine/index.js:3005` simulator bot `sailPath(…{throughRim:false,from:before})`; `src/ui/flow.js:3207` live bot `{throughRim:false,from:b}`; `flow.js:3011` human sail `{throughRim:true}`; `flow.js:2826` human "move instead" `{throughRim:true}`; `orchestrator.js:762` flee `{throughRim:true}` (the engine's flee `:1958-1962` records no route — item 1).
  - Legality: a bot's square is checked through `sailPlan` (`engine:876, :885`); a human's is written straight in (`flow.js:3012, 2827`; `orchestrator.js:763`) and checked only on replay (`flow.js:827`).
- **c. ONE PLACE:** engine `Game.sailTo(p,dest,{from})` validates against `sailStates({throughRim:true})`, writes the position, emits `sail` with the route from that one search, then runs `tradewind`. All callers use it; delete their inline position writes, `ev({t:"sail"})` calls and `sailPath` calls. (`Game.flee`, item 1, moves through it.)
- **d. GATE:** `scripts/qa/one_sail_move_check.mjs` — (1) `t:"sail"` emitted only in `sailTo`; (2) `sailPath(` called only inside the engine; (3) no `pos=dest` in UI or orchestrator; (4) behavioural: every simulator `sail` of 3+ squares carries `draw.route`. Red-proof: `sailTo` on `throughRim:false` (4); the old humanTurn sail lines pasted back (1, 3).
- **e. COUNT BEFORE → AFTER:** route requests 5 → 1 · legality paths 2 → 1.
- **PLAYER WOULD NOTICE:** **measured** in 200 simulator voyages: 1024 of 11,543 bot moves (8.9%) enter the current, and all 1024 are recorded with no route; asked the human way, all 1024 get one. **Inferred:** `present()` (`shared/storyboard.js:162-163`) draws nothing for a route-less sail, so a bot riding into the trade winds jumps instead of sailing — the live bot path uses the same `throughRim:false`. The comment at `flow.js:574-577` ("bots skip the rim") stopped being true on 2026-08-13.
- **RISK** medium (sail animation; host/guest ordering) · **SIZE** M (3 files, ~40 lines + gate) · **CONFIDENCE** high.

### 8. What a crew guest's screen shows while a fight is on
*Found by: host/guest auditor; the fight auditor reached the same "shown on no screen" line from the other side.*
- **a. FACT:** whether a narration line or a fight's words are drawn while a fight is on.
- **b. PLACES — count 3:**
  - `src/orchestrator.js:2250` guest `watchNarr`: `if(v&&!appState.spectatingBattle&&!appState.inBattlePrompt)` — every narration line is dropped while a fight's snapshot is live.
  - `src/orchestrator.js:474` guest `applyBattleSnap`: `if(!appState.inBattlePrompt)renderBattleFromSnap(snap)`.
  - Host: `panel.js:1220` `flash` has no such filter, and `battlePublish` (`:281`) always renders. Both flags are written only in guest paths (`:466/473, :2062/2067/2079/2108/2146`).
- **c. ONE PLACE:** a line is drawn when it arrives, on every screen — delete both guest filters (their stated reason, `:2247-2249`, "made the battle box flicker away between flips (#9)", died with the battle box on 2026-09-14, `1c87b27a`). After item 4 lands both flags are dead and go too.
- **d. GATE:** `scripts/qa/fight_lines_not_filtered_check.mjs` — `watchNarr`'s draw condition and `applyBattleSnap` read no battle flag, and neither flag exists in `src/state`. Red-proof: `&&!appState.spectatingBattle` back at `:2250`.
- **e. COUNT BEFORE → AFTER:** 3 (two guest filters + the host's unfiltered path) → 1.
- **PLAYER WOULD NOTICE (inferred from write order):** "…is waiting to defend" / "…is deciding" (`battleAsk :549`) are broadcast after `battlePublish :681` has set the guest's flag, and the host does not draw that broadcast locally — so in a crew fight those lines appear on **no** screen. A guest also misses the "…is deciding" line for flee, fire-again and plunder that the host sees.
- **RISK** low-medium (guests will see as many bubbles in a fight as the host) · **SIZE** S (~10 lines + gate) · **CONFIDENCE** high.

### 9. The line that says how a fight ended
*Found by: fight auditor.*
- **a. FACT:** which line tells the table how a fight ended ("Crustbeard wins and takes…", "Davy Scones slips away!", a stand-off), and that it is said once.
- **b. PLACES — count 3, each narrating "whatever event is last":** `src/orchestrator.js:833` and `:866` (`narrateLastEvent()`; the flee exit `:827` says nothing); `src/ui/flow.js:2891` after a human attacks; `flow.js:3248` `botBeat()` → `util.js:1822` `narrateCurrent()` after a bot attacks. The one narrator (`util.js:1929`) skips `sidebet` and has no repeat guard.
- **c. ONE PLACE:** the fight narrates the ending event it just emitted, by reference (`narrateEvent(evEnd)`), on all three exits, before `settleSideBets`. Delete `flow.js:2891`; `botTurn`'s after-fight beat takes a no-narrate form.
- **d. GATE:** `scripts/qa/fight_ending_said_once_check.mjs` — (1) each of `asyncBattleRun`'s three exits narrates its own ending event; (2) no narrate/`botBeat` narration directly follows `onAsyncBattle(`. Red-proof: `narrateLastEvent()` back after `onAsyncBattle` (2); the flee exit with no narrate (1).
- **e. COUNT BEFORE → AFTER:** 3 → 1.
- **PLAYER WOULD NOTICE (inferred; needs a posed check):** two-captain games speak the win or stand-off line twice; in four-captain games bot callers always call (`flow.js:3625-3631`), the last event is a `sidebet`, and "Davy Scones slips away!" (his line, DECISIONS.md:3010) is never said.
- **RISK** low · **SIZE** S (3 files, ~10 lines) · **CONFIDENCE** medium (read, not run).

### 10. Which recipe each captain is baking — applied through two pipes
*Found by: host/guest auditor.*
- **a. FACT:** the pastry a captain chose.
- **b. PLACES — count 2 pipes (3 applications):** `src/orchestrator.js:1055` host draft `setRecipe(…)` → `recipeSet` event; `:1056` `netSetRecipes(…)` writes the same picks to the `recipes` node; `:2841-2853` `watchRecipes`, attached on **every** screen including the host (`:2796`), calls `setRecipe` again and refreshes the banner. `consumeEvent` reads `recipeSet` only for `recipePicked` and the stowed card (`:1847-1848`) and never gives a guest `player.recipe`; a guest learns its recipe only from the node. Banner refreshes: `:1057, :2795, :2851`.
- **c. ONE PLACE:** `consumeEvent`'s guest branch applies `e.recipe` on `recipeSet` and refreshes the banner there. Delete `watchRecipes`, `netWatchRecipes`, `netSetRecipes` and the `recipes:null` slot in `startGame`. Graveyard: the same fold `54ede43a` did for sailing order; the objection in `fbf0993e` ("the recovery path uses the same door") is met — a guest's feed replays past events on attach, and a host reload re-runs the draft from the decision log.
- **d. GATE:** `scripts/qa/recipe_one_pipe_check.mjs` — (1) `setRecipe(` has one caller outside the engine; (2) no `recipes` writer or watcher; (3) `consumeEvent` applies `e.recipe`; (4) `updateRecipeBanner(` only from the consumer. Red-proof: re-add the old `watchRecipes` body (1, 2).
- **e. COUNT BEFORE → AFTER:** 2 pipes → 1.
- **PLAYER WOULD NOTICE (inferred):** a Firebase write fires its own listener, so the host's pick is applied and published twice — every device may raise "yer recipe's stowed below" twice and spend two tutorial rungs on it; a guest's engine invents unnumbered `recipeSet` events (the same double-apply is why `_crew_turn_order_check` asserts "exactly one turnOrder event", `54ede43a`).
- **RISK** medium (host-reload replay event counts) · **SIZE** S-M (orchestrator.js, net/*, `net_contract_check` 15→14; ~35 lines removed) · **CONFIDENCE** high for the two pipes; medium-high for the doubled event.

### 11. When "yer recipe's stowed below" is shown
*Found by: door auditor. Adjacent to item 10 (which can double it on every device); this is a second, separate copy on the host and in solo.*
- **a. FACT:** when the recipe-stowed lesson card (and the captains-box blink) is shown.
- **b. PLACES — count 2:** `src/orchestrator.js:1848-1859` (`consumeEvent` on `recipeSet`: `pilotSpeaks("recipe.stowed")` → `flashCaptainsBox()` → `pilotGate(…)`) and `src/orchestrator.js:1067-1081` (`recipeDraftNet`, the host loop, after awaiting that same card at `:1059`). Commit `fbf0993e` (2026-09-09) said "It is one line, here, in the one event consumer" and deleted the guest's copy but left the host loop's.
- **c. ONE PLACE:** the consumer. Delete `orchestrator.js:1060-1081`.
- **d. GATE:** `scripts/qa/recipe_stowed_one_place_check.mjs` — `pilotGate("recipe.stowed"` and `flashCaptainsBox(` each appear exactly once, inside `consumeEvent`. Red-proof: today's tree fails it; plus a mutant re-adding the block.
- **e. COUNT BEFORE → AFTER:** 2 → 1.
- **PLAYER WOULD NOTICE (inferred):** `pilotGate` advances the lesson count (`pilot.js:157`) on a 3-line ladder (`words.js:614`), so a first-time solo or host captain gets the long card, taps Aye aye, then a second shorter card and a second blink — and the lesson runs out a voyage early. A guest gets one.
- **RISK** low · **SIZE** S (1 file, −20 lines) · **CONFIDENCE** high.

### 12. When the dotted course leaves the sea
*Found by: door auditor.*
- **a. FACT:** the dotted course is shown only on its captain's turn (his rulings 2026-09-10 and 2026-09-11: gone "the moment your boat starts animatedly sailing").
- **b. PLACES — count 2:** `src/ui/flow.js:2944` (`takeTurn`: `forgetCourse()`, the computing machine only, every turn start) and `src/orchestrator.js:1897-1898` (`consumeEvent`: `if(moves)forgetCourse()`, every device, only on events carrying a route). (`flow.js:703/796`, the parrot-off teardown, is a different rule.)
- **c. ONE PLACE:** `consumeEvent` forgets the course on `turn` as well as on moves. Delete `flow.js:2944`.
- **d. GATE:** `scripts/qa/course_down_one_place_check.mjs` — no `forgetCourse(` in `takeTurn`/`humanTurn`/`botTurn`, and `consumeEvent` calls it on `turn` and on moves. Red-proof: `forgetCourse();` back at the top of `takeTurn`.
- **e. COUNT BEFORE → AFTER:** 2 → 1.
- **PLAYER WOULD NOTICE (inferred):** a crew guest who ends a turn with Stay put (no sail event) keeps their dotted line on the sea through the next captain's turn until someone sails; the host's clears at once.
- **RISK** low · **SIZE** S (2 lines + gate) · **CONFIDENCE** high.

### 13. Whether ye may attack or trade, and the reason the button gives when ye may not
*Found by: facts, rules, fight auditors.*
- **a. FACT:** whether a captain may attack a ship (in range, the target not baking at Tortuga, powder money, a crate aboard) or open a trade (someone still on the board holds cargo), and why not.
- **b. PLACES:**
  - Attack — count 3 decisions of the reason, 6 range tests, 5 affordability tests: engine `canAttack :1897-1904` (baking target, powder, empty hold; no range test); `flow.js:2574` targets with no in-play filter; `flow.js:2575` and `:2875` re-test powder; `flow.js:2650-2651` picks the reason by elimination (powder, else `act.emptyHolds`). Range also at `flow.js:3246`, `engine:3013, :974, :1834, :1813-1815`; affordability also at `engine:1808, :2196`.
  - Trade — count 2-3: engine `holdersOf :1210-1212` (`inPlay`, excludes bakers); `flow.js:2600` `canTrade` checks `!q.done&&q.ing.length>0` (counts a baker's crates); "has something to offer" re-tested `flow.js:2599, :2311`.
  - In play: crow's-nest callers `flow.js:3605` use `!player.done`; engine `tradeOpp :975` is used only by the rules gate.
- **c. ONE PLACE:** engine `Game.attackTargets(p)` (range + `canAttack`) with `Game.whyNoAttack(att,def)`, and `Game.canOpenTrade(p)` with its reason; the menu greys the buttons and picks the words only from the returned reason (a new "sanctuary" line is his wording); crow's-nest callers filtered by `inPlay`. **His call:** may a captain who is baking still make crow's-nest calls?
- **d. GATE:** `scripts/qa/action_reasons_from_engine_check.mjs` — (1) `flow.js` has no powder comparison, no `.done`/`.ing.length` trade filter, and no `players.filter` for targets/traders/callers without `inPlay`; (2) behavioural: a captain beside a baker with a full hold gets "sanctuary"; a table whose only crates are aboard a baker gets "no cargo". Red-proof: restore `flow.js:2574`'s filter or `:2575`'s powder test (1); let `canTrade` count bakers (2).
- **e. COUNT BEFORE → AFTER:** attack reason 3 → 1 · range 6 → 1 · affordability 5 → 1 · trade eligibility 3 → 1.
- **PLAYER WOULD NOTICE (inferred):** beside a captain baking at Tortuga, Attack is greyed with "Their holds are empty — there's nothin' aboard worth takin'" to a captain holding five crates; when the only cargo on the water is aboard a baker, Trade is enabled and tapping it bounces with "No one has cargo to trade for." The comment at `flow.js:2571-2573` still says ovens don't protect.
- **RISK** low · **SIZE** S-M (2 files, ~30 lines + gate) · **CONFIDENCE** high.

# TIER 2 — bots are tuned and measured on a different game from the one people play

### 14. Whether a hail that strikes no deal ends the captain's turn
*Found by: rules auditor.*
- **a. FACT:** what a spoken hail costs the captain who made it ("A trade is one captain's turn ACTION", TRADE-SYSTEM.md:113).
- **b. PLACES — count 3, and they disagree:** engine `tryTrade :1691, :1735` returns false after hailing, and the simulator turn goes on to dock or muse (`:3015, :3024-3025, :3037-3038`); live bot `flow.js:3117` returns false (falls through to dock/muse) but `:3171` returns true (turn ends); human `flow.js:2455, 2518, 2531, 2544` all return true (turn ends). The comment at `:3017-3023` ("A human does the next best thing instead, so a bot does too") is false for hails.
- **c. ONE PLACE:** the hail returns `{spoken,struck}` and one rule in the turn executor decides what `spoken` costs, for all three. **His call:** "spoken ends the turn" everywhere, or everyone may still dock or muse after a refusal (levelling humans up).
- **d. GATE:** `scripts/qa/spoken_hail_one_rule_check.mjs` — (1) the simulator turn, `botTurn` and `humanAct` read the same flag; (2) behavioural: across 50 simulator voyages the one rule holds for every `openoffer`. Red-proof: restore `if(plan.type==="trade"&&this.tryTrade(p))return;`.
- **e. COUNT BEFORE → AFTER:** 3 → 1.
- **PLAYER WOULD NOTICE:** **measured** in 200 simulator voyages: 195 of 416 hails struck no deal, and every one of those bots then docked (32) or mused (163) in the same turn — in the live game both humans and bots end the turn. The ladder's economy and the guarded hails-per-game number are measured on the more generous rule; re-measure both after converging (TRADE-SYSTEM §9).
- **RISK** medium (bot economy) · **SIZE** S (2 files, ~15 lines) · **CONFIDENCE** high.

### 15. A bot's trade hail: who is asked, which answer it takes, what the answerer sees
*Found by: rules, facts, door auditors.*
- **a. FACT:** which captains a hailing bot puts its offer to, how their refusals are remembered, which yes or counter it takes (and at what price), the prompt the answering human sees, and the words the table hears when the hail falls through.
- **b. PLACES — count 2 per question:** engine `tryTrade :1681-1738` asks only `offer.audience` (`:1688-1690`), notes refusals inline (`:1696`), picks via `:1698-1731`; live `botOpenTradeLive flow.js:3057-3176` asks **every** holder (`:3067`), notes via `refusedFlagWanted` (`:3122`), prices counters with a typed `1.1` (`:3159`) where the engine reads `PLAN.leverageTurns` (`engine:88`, exported). The answering prompt is verbatim twice: `flow.js:2419-2446` (human hails) and `:3086-3113` (bot hails). Fall-through words: human hails say why (`flow.js:2454, 2514+2517, 2527+2530, 2543`); a bot's `parley` (`:3168`) has no narration entry, so it is silent. TRADE-SYSTEM.md:419-439 already names three copies of one decision "the real defect".
- **c. ONE PLACE:** engine `Game.resolveHail(p,offer,responses)` (audience, memory, choosing for a bot asker, settling, a `parley` event with its reason) called by both runners; one `humanAnswersHail(q,asker,offer)` in flow.js; the narration table words `parley` by reason for every captain. Delete `botOpenTradeLive`'s settle block, the second prompt copy, the typed `1.1` and the four `sayFlash("trade.…")` outcome calls.
- **d. GATE:** `scripts/qa/one_hail_check.mjs` — (1) `rememberRefusal(` only in `resolveHail`; (2) the counter-pricing loop exists once; (3) `say("trade.offered"` appears once; (4) no numeric literal in `src/ui` or `src/orchestrator.js` equals a `PLAN` value in a pricing expression; (5) no `sayFlash("trade.` outcome ids in flow.js, and the narration table has a `parley` entry reading its reason. Red-proof: `for(const q of g.holdersOf(offer.want,player))` pasted back (1); `1.1` back (4); `sayFlash("trade.walksAway")` back (5).
- **e. COUNT BEFORE → AFTER:** audience 2 → 1 · refusal memory 2 → 1 · answer choice and pricing 2 → 1 · answering prompt 2 → 1 · fall-through words 2 → 1.
- **PLAYER WOULD NOTICE:** **measured (simulator):** 3 of 416 bot hails would prompt a holder the bot had excluded (4 extra prompts) — rare, but the "swat it away" noise TRADE-SYSTEM invariant I1 guards. **Inferred:** a bot's failed hail ends in silence where a human's says why. The hail count is a guarded number (HARD-WON-LESSONS §5) — re-measure hails per game.
- **RISK** medium · **SIZE** M (engine +40, flow.js −80, util.js; gate) · **CONFIDENCE** high.

### 16. The bot brain's odds of winning, fleeing or losing a fight
*Found by: fight auditor. Belongs with the smarter-bots session's work; listed so it is not lost.*
- **a. FACT:** the chance a fight ends won, fled or lost, as the bot brain prices it.
- **b. PLACES — count 3:** `engine:2822` `const pWin=downwind?0.5:0.25,pFlee=downwind?0.25:0` (measured 2026-08-09, `8eb1a95d`, before the crosswind ruling); `engine:1812, :1815` (`strikeFrom`, `pWin:0.5/0.25`); and the real rules those numbers stand in for (the fight's steps, item 1).
- **c. ONE PLACE:** engine `Game.fightOdds(att,def,cell)` computed from item 1's fight steps (heads at 0.5, the extra-shot chain capped by `wantsRefire` and purse); the brain and `strikeFrom` read it; the typed constants are deleted.
- **d. GATE:** `scripts/qa/fight_odds_derived_check.mjs` — (1) no numeric-literal `pWin`/`pFlee` in the planner or `strikeFrom`; (2) on 4 posed fights `fightOdds` is within 1.5 points of 20,000 engine battles. Red-proof: the typed constant restored while the crosswind rule changes (2).
- **e. COUNT BEFORE → AFTER:** 3 → 1.
- **PLAYER WOULD NOTICE:** **measured (auditor):** all 226 crosswind fights and all 90 defender-downwind fights in 400 voyages had a defender holding a crate it cannot lose, so the flee rule flees on two tails in every one — the brain priced fleeing at 0 in all 316 of 1842 fights (17%). Bot strength changes; re-run the win-rate ladder after.
- **RISK** medium · **SIZE** M (engine ~40 lines) · **CONFIDENCE** high.

# TIER 3 — a player would notice rarely, or on one kind of screen

### 17. A bake-off re-watch: when its price leaves the baker's purse, on every screen
*Found by: forks, door, host/guest auditors (the rules auditor judged the guest copy an allowed display — see "Resolved disagreements").*
- **a. FACT:** whether a baker can afford another look at the shuffle, and when the purse visibly drops (and the coins fly) for it.
- **b. PLACES — count 3 affordability + 2 purse drops:** affordability `engine:3144` (`p.coins<cost`), `flow.js:1014` (`canAfford`), `orchestrator.js:2163-2171` (`cost=prompt.cost||1` plus its own `purse<want`); drop: a baker on the host's screen — engine debit per tap (`flow.js:1013`) → `rewatch` event → `consumeEvent :1972-1975` coins leave; a guest baker — `orchestrator.js:2168` `purse-=want;showSeatCoins(prompt.seat,purse)` at the tap with no coins, then the host charges the lot at the end (`:1160`) and that event tips the coins out again.
- **c. ONE PLACE:** the purse drops only from the engine's `rewatch` event: a remote tap reaches the host per purchase, so every baker's coins leave at the tap through the one door. Delete the guest's `spend` arithmetic, the `||1` and its direct `showSeatCoins`. Note: the code cites "D-56" for declining that round trip; D-56 is his 2026-08-23 rule that documents are his input for an unattended run (PROJECT.md:267) — there is no ruling on this.
- **d. GATE:** `scripts/qa/rewatch_one_purse_check.mjs` — (1) no `showSeatCoins(`/`purse-=` in `watchPrompt`; (2) the affordability test exists once, in the engine. Red-proof: re-add the `spend` closure.
- **e. COUNT BEFORE → AFTER:** affordability 3 → 1 · purse drop 2 → 1.
- **PLAYER WOULD NOTICE (inferred):** watchers see coins leave at each tap when the host bakes, but only at the end when a guest bakes; a guest baker sees the number fall silently, then coins leave again after the reveal.
- **RISK** medium (a round trip mid-bake) · **SIZE** M (~40 lines) · **CONFIDENCE** high.

### 18. Which squares a watching screen's camera frames for a captain's sail
*Found by: host/guest auditor.*
- **a. FACT:** where a captain may sail this turn, as the watching screens' camera frames it.
- **b. PLACES — count 2:** `src/ui/flow.js:355-362` `reachable()` → `sailStates(player,{throughRim:true})` (the chooser's gold squares); `src/ui/stage.js:283-285` `camFitSail`'s fallback on every screen not drawing squares → `g.reachableFrom(who)` = `sailStates(p)` without rim squares (`engine:1777`) — its comment claims "the two agree by construction".
- **c. ONE PLACE:** one engine `sailChoices(p)` that both call (the rim-allowed rule of item 7). Delete the `reachableFrom` use in `camFitSail`.
- **d. GATE:** `scripts/qa/sail_frame_same_squares_check.mjs` — `camFitSail` and `reachable` name the same engine function. Red-proof: swap `camFitSail` back to `reachableFrom`.
- **e. COUNT BEFORE → AFTER:** 2 → 1.
- **PLAYER WOULD NOTICE:** **measured (auditor, node, 40 seeded boards):** from 3,430 of 4,432 legal sea squares the chooser's gold squares include rim squares the watchers' frame leaves out (18,267 extra squares, all rim). A watcher's camera can crop the square a captain is about to choose.
- **RISK** low · **SIZE** S (2 files, ~4 lines) · **CONFIDENCE** high.

### 19. After a sail, the trade wind — and the "head of the current" line
*Found by: door auditor.*
- **a. FACT:** after a boat lands, the trade wind is applied, shown, and a zero-length ride at the head of the current is explained.
- **b. PLACES — count 4:** `flow.js:3032-3036` (humanTurn: `tradewind(player)` → publish → render → narrate, plus `else if(onRim) sayFlash("rim.head")`); `flow.js:2847-2848` (move instead: no rim.head); `flow.js:3229-3230` (botTurn: no rim.head); `orchestrator.js:766` (a flee: no rim.head).
- **c. ONE PLACE:** one `afterSail(player)` called by all four (with item 7's `sailTo` it becomes the engine's own `tradewind` step); the engine records the zero-length ride (`{t:"tradewind",p,ride:0}`) and the narration table words it, for bots and humans alike.
- **d. GATE:** `scripts/qa/after_sail_one_step_check.mjs` — (1) `tradewind(` has one caller in the display code; (2) `"rim.head"` is in no `sayFlash`. Red-proof: inline the wind block back into `botTurn` (1).
- **e. COUNT BEFORE → AFTER:** 4 → 1.
- **PLAYER WOULD NOTICE:** **measured by grep:** "rim.head" is said only at `flow.js:3036` — a human who picks Move instead, a bot, or a fleeing captain who lands at the head of the current gets no line.
- **RISK** low · **SIZE** S (~25 lines) · **CONFIDENCE** medium-high.

### 20. A counter-offer's ceiling: the most coin it may ask for
*Found by: rules auditor.*
- **a. FACT:** the most coin a counter-offer may ask the asker for.
- **b. PLACES — count 3, and they disagree:** `engine:1288` (a bot answering refuses above `asker.coins-(offer.giveCoins||0)` as "toodear"); `flow.js:2166, 2171, 2202` (`counterOffer`, a human answering: `room=Math.max(0,player.coins)` as the slider's max even for a coins-only counter, and `counterTerms` adds it on top of the offer); `flow.js:2419/2429` (copied `:3086/:3096`, the Counter button uses `coins-offer.giveCoins`).
- **c. ONE PLACE:** engine `Game.counterRoom(asker,offer,askIng)` (the full purse for a crate counter; purse minus offered coins for a coins-only counter); `respondToOffer`, the slider, the coins-only gate and the Counter button read it.
- **d. GATE:** `scripts/qa/counter_ceiling_one_place_check.mjs` — (1) `counterRoom` defined once; (2) no other `coins-offer.giveCoins` / `coins-(offer.giveCoins`; (3) behavioural: an asker with 5 coins offering 3 — the largest coins-only counter still settles. Red-proof: restore `maxC=Math.max(0,player.coins)`.
- **e. COUNT BEFORE → AFTER:** 3 → 1.
- **PLAYER WOULD NOTICE (inferred):** the asker offers 3 of 5 coins; the human answering drags to +5 (8 total) — a human asker sees a greyed "too dear", a bot asker silently counts it a refusal; on the same screen the hint says "no coin to sweeten" while the coins-only button is enabled.
- **RISK** low · **SIZE** S (2 files, ~15 lines) · **CONFIDENCE** high.

### 21. Pass-and-play: when a checked recipe hides again
*Found by: forks auditor.*
- **a. FACT:** the moment a captain's checked recipe leaves the shared screen, and the redraw that makes it true.
- **b. PLACES — count 4 clears + 3 redraws:** clears `flow.js:2984, :2991, :3042`, `lobby.js:380`; redraws `flow.js:3046` `if(appState.passAndPlay)liveRender();` (a no-op since W1, 2026-08-28, per `flow.js:3760-3766` — `liveRender` only drains *new* events), `lobby.js:388` `renderBoard()`, `flow.js:3767` `revealMyRecipe` `renderBoard()`.
- **c. ONE PLACE:** `lockRecipe(){appState.recipeRevealed=false;render();}` in board.js beside a relocated `revealMyRecipe`; called from `takeTurn` (turn start and a `finally` for turn end) and from `passGate`. Delete the other clears and the dead redraw.
- **d. GATE:** `scripts/qa/recipe_lock_one_place_check.mjs` — (1) `recipeRevealed=false` written only in `lockRecipe`; (2) it redraws with `render`, never `liveRender`; (3) called only from `takeTurn` and `passGate`; (4) no `passAndPlay`-gated redraw in flow.js. Red-proof: the clear + `if(appState.passAndPlay)liveRender();` restored at the end of humanTurn (1, 4).
- **e. COUNT BEFORE → AFTER:** clears 4 → 1 · redraws 3 → 1.
- **PLAYER WOULD NOTICE (inferred):** the outgoing captain's recipe can stay on the shared screen after their turn until the next event is drawn. Its siblings learned this lesson (measured 2026-09-10, `_pnp_band_handover.mjs`); this copy did not.
- **RISK** low-medium (pass-and-play privacy; re-run `_pnp_band_handover.mjs`) · **SIZE** S (3 files, ~20 lines) · **CONFIDENCE** high.

### 22. Which rules and seats a local voyage starts or resumes with
*Found by: forks auditor.*
- **a. FACT:** who is at this device (host, seat 0, pass-and-play or not) and which rule flags the save records.
- **b. PLACES — count 3, one already drifted:** `flow.js:3735-3743` (`startSinglePlayer`); `flow.js:3751-3755` (`startPassAndPlay`); `util.js:2305-2337` (`resumeSoloGame` — its save record `:2321-2327` copies only `bakeoff` and `ovens`; `bake2`/`endcard` go to cfg `:2336-2337` but not to the record).
- **c. ONE PLACE:** `beginLocalVoyage({names,strategies,seed,passAndPlay,saved})` in util.js, called by all three; one `LOCAL_RULE_FLAGS=["bakeoff","ovens","bake2","endcard"]` builds both the save record and the cfg (saved value wins).
- **d. GATE:** `scripts/qa/local_voyage_one_setup_check.mjs` — (1) `appState.isHost=true` and `appState.soloMeta=` in `src/ui` only inside `beginLocalVoyage`; (2) record and cfg built from the one list. Red-proof: resume's hand-built record without `bake2`.
- **e. COUNT BEFORE → AFTER:** 3 → 1.
- **PLAYER WOULD NOTICE (read):** after one resume, each decision's `saveSoloState` (`orchestrator.js:1608`) writes a save missing `bake2`/`endcard`; a second resume from a link without `?bake2=1` replays under a different ruleset (`testFlagOn`, `:1280`). These are dev-host flags and staging counts as a dev host (`src/shared/host.js:39`), so it hits his staging test links, not the live game.
- **RISK** low-medium (old saves must stay readable) · **SIZE** S-M (2 files, ~40 lines) · **CONFIDENCE** high.

### 23. The look of the trouble cards ("aground", "host left", "resume stuck")
*Found by: facts auditor.*
- **a. FACT:** the cream-and-teal card and its "Back to port" button.
- **b. PLACES — count 3, already different:** `util.js:1789-1791` (voyage aground), `orchestrator.js:2688-2695` (host left), `:3111-3117` (resume stuck) — corner radius 14 vs 16; button 16px / 11·26 vs 15px / 10·24.
- **c. ONE PLACE:** one `troubleCard({title,body,button})` builder.
- **d. GATE:** `scripts/qa/trouble_card_one_look_check.mjs` — `#fffdf2` with `#2aa9b8` appears only in that builder. Red-proof: an inline copy.
- **e. COUNT BEFORE → AFTER:** 3 → 1.
- **PLAYER WOULD NOTICE:** **read:** these rare screens already differ slightly from each other.
- **RISK** low · **SIZE** S (~30 lines) · **CONFIDENCE** high.

### 24. The storm: the wide shot, and the ships moving
*Found by: door, host/guest auditors.*
- **a. FACT:** the camera pulls out to frame every ship and its storm destination; each ship is shown moving.
- **b. PLACES — count 2 wide shots + 2 move paths:** wide shot `flow.js:1744` (`runStormLive`, host) and `orchestrator.js:1933` (`consumeEvent`, every device) — the host runs both; moves: `flow.js:1774-1846` host loop (`paintShipAt`, `renderLiveShips`, `sleep(STORM_STEP_MS)` per ship; `stormStep` emits no event for an ordinary push, `engine:564-587`) vs a guest, whose ships move only when the next positioned event reaches `consumeEvent`.
- **c. ONE PLACE:** the consumer frames the storm; the engine emits a per-ship storm move with a drawn route and `consumeEvent` walks it. Delete `flow.js:1744`, the wording at `flow.js:1262`, and the loop's paints and pauses. (`stage.js:1831`'s storm `camFull()` never fires — dead, delete with it.)
- **d. GATE:** `scripts/qa/storm_one_door_check.mjs` — `stormCamForEvent(` only in `consumeEvent`; `runStormLive` has no `renderLiveShips`/`paintShipAt`. Red-proof: re-add `flow.js:1744`.
- **e. COUNT BEFORE → AFTER:** wide shots 2 → 1 · move paths 2 → 1.
- **PLAYER WOULD NOTICE:** the host's camera move restarts toward the same frame (inferred); the ship moves agree today (BACKLOG.md:159 measured both screens gliding in one move on 2026-09-10) — drift risk.
- **RISK** medium (the move path) · **SIZE** S for the wide shot, M for the moves · **CONFIDENCE** high.

### 25. Who holds the wind in a fight, as each screen tells it
*Found by: host/guest auditor.*
- **a. FACT:** which ship is downwind, which settles a two-heads round, as the fight's first line and the flip stage say it.
- **b. PLACES — count 3:** `orchestrator.js:626` (the host decides the outcome from `downwindSide`); `orchestrator.js:311` (`renderBattle`, the fight's first line, every screen, recomputes from its own copy — `base()` at `:641` omits `dw` and `battleSnapshot`, `flow.js:3581`, doesn't copy it); `stage.js:2391` (the flip stage's wind stakes, every screen, recomputes again).
- **c. ONE PLACE:** the fight's `engage` event carries `downwind` (item 4); the first line and the flip stage read it. Delete both recomputations.
- **d. GATE:** `scripts/qa/fight_wind_decided_once_check.mjs` — `downwindSide(` only in the engine, the fight's start step, and the bot caller (`flow.js:3628`). Red-proof: restore `stage.js:2391`.
- **e. COUNT BEFORE → AFTER:** 3 → 1.
- **PLAYER WOULD NOTICE (inferred, rare):** a guest's ship positions can lag its event queue while the fight snapshot arrives on a separate listener, so the first line and the stakes could name the wrong ship.
- **RISK** low · **SIZE** S (3 files, ~6 lines) · **CONFIDENCE** high.

# TIER 4 — nothing today; copies that agree now and will drift

### 26. Each shot's words reach guests on a second wire
- **a.** what each screen shows and says about a shot's result during a fight. · **b.** 2 carriers: the battle snapshot (`battlePublish orchestrator.js:281-286` → `watchBattle :477-518` → `applyBattleSnap :464` → `renderBattleFromSnap flow.js:3586` → `renderBattle :303`, timed by the host's sleeps, not waiting for `eventDrawn`) and the events (`coinflip`, `shotLands`, the endings → `consumeEvent`); `:485-491` calls it "a declared gap… still unconverged". · **c.** a `round` event from item 1's `resolveRound`, narrated after `eventDrawn`; delete the battle branch of the snapshot wire (`battlePublish`, `battleSnapshot`, `renderBattleFromSnap`, `applyBattleSnap` non-null, the `battle:` field on prompts `:566, :2064-2068`, `battleLineSaid`); the bake bench keeps the node; rewrite `battle_publish_seam_check.mjs`. · **d.** `scripts/qa/fight_words_one_door_check.mjs` — `netSetBattle(` never carries a battle snapshot; the narrator describes `round`. Red-proof: `battlePublish` restored. · **e.** 2 carriers → 1. · **PLAYER:** inferred (precedent: T-04's dead card sat on a guest for 13.4 s, `:447-452`). · **RISK** high · **SIZE** L (4 files, ~150 lines deleted) · **CONFIDENCE** medium. *Found by: fight auditor.* Do last.

### 27. "Who is being asked" — the prompt sent to a remote seat is built twice
- **a.** the prompt payload and the waiting line other captains see. · **b.** count 2: `util.js:1619/1651/1656` (`ask`) and `orchestrator.js:522-566` (`battleAsk` — no `disabled`/`why`/`sub`); documented unconverged, `docs/DISPLAY-RULES.md:352` fork 3. · **c.** one `promptPayload(seat,…)` and one spectator-line builder; `battleAsk` becomes `ask` plus fight data. · **d.** `scripts/qa/one_prompt_payload_check.mjs` — exactly one call that sends a prompt to a remote seat builds the payload. Red-proof: a second `remotePrompt(askSeat,{kind:"ask"`. · **e.** 2 → 1. · **PLAYER:** nothing today. · **RISK** medium · **SIZE** M (~40) · **CONFIDENCE** high. *Found by: facts auditor.*

### 28. Numbers typed into the parrot's lessons
- **a.** what a Muse pays, how far a storm pushes, how many ingredients a recipe has, how many crates a barter takes — as the parrot teaches them. · **b.** count 2 each: `words.js:579-580` "a doubloon" (`cfg.passCoin`; `engine:3383` warns of copies), `:645` "three squares" (`STORM_PUSH`), `:603, :615-616` "five" (`cfg.recipeSize`), `:242, :244, :245` "2 ingredients" (engine typed 2 at `:1013, :1019, :1047`); the parrot has no number filler (`pilot.js:120-129`); `rulesFacts` (`shared/index.js:507`) already computes them. · **c.** `pilotLine` fills placeholders from `rulesFacts(cfg)`; the barter count becomes one named constant the engine and the words use. · **d.** extend `words_one_place_check.mjs` — no lesson or `WORDS` entry spells a number equal to a `rulesFacts` value. Red-proof: restore "pocket a doubloon". · **e.** each 2 → 1. · **PLAYER:** nothing today; the day `passCoin` is retuned, the parrot teaches the wrong payout. · **RISK** low · **SIZE** S · **CONFIDENCE** high. *Found by: facts auditor.*

### 29. What a crate costs, and what a dock turn pays — copied into the rules page and the bots' planners
- **a.** the crate price (base minus crates left; 10 when bare) and a dock turn's payout. · **b.** price count 4: `cratePrice engine:980-991`, `rulesFacts shared/index.js:520` (redoes the arithmetic), `rivalPlan3 engine:2538-2540`, `tour3 engine:2640, 2658` (comments `:986-987, :2535` say "change the two together"); payout count 3: `coinTurns :2070` falls back to 4, `rivalPlan3 :2526` and `tour3 :2601` fall back to 1. · **c.** pure `crateCost(cfg,left)` and `dockRate()` in one place, called by all. `PLAN.coinsPerDockTurn` stays separate (deliberate, `:2066-2068`, the bot session's). · **d.** `scripts/qa/crate_price_one_formula_check.mjs` — `crateBase` arithmetic and the `(dockHeads+dockTails)/2` payout each in one place; behavioural: planner leg prices equal `cratePrice`. Red-proof: restore `Math.max(1,base-stock[ing])`. · **e.** price 4 → 1 · payout 3 → 1. · **PLAYER:** **measured:** they agree today (4 players [3,4,5]; 2 players 5); bots would plan on stale prices after the next price change. · **RISK** low-medium · **SIZE** S · **CONFIDENCE** high. *Found by: facts, rules auditors.*

### 30. "Is this island's shelf bare?" — 8 spellings
- **a.** whether the black market is open at an island. · **b.** count 8: `engine:988, :1013, :1061, :2795, :2536/2539, :2619-2620`; `flow.js:1975` (the barter button); `board.js:2605` (the black-market flag). · **c.** pure `shelfBare(tokens,ing)` in the engine; the board calls it with the snapshot's tokens. · **d.** `scripts/qa/shelf_bare_one_place_check.mjs` — no `<=0`/`>0` test on tokens outside it. Red-proof: restore `board.js:2605`. · **e.** 8 → 1. · **PLAYER:** all 8 agree today (read). · **RISK** low · **SIZE** S · **CONFIDENCE** medium-high. *Found by: rules auditor.*

### 31. A dock's record
- **a.** what a dock records (the `dock` event, the berth flags). · **b.** count 2: `engine:1088, 1109-1112` (`doDock`) and `flow.js:2050-2053, 2072` (`humanDock`); the event lines are verbatim copies; the human copy never sets `justDocked`. · **c.** engine `Game.settleDock(p,ing,heads,choice)`. · **d.** `scripts/qa/one_dock_record_check.mjs` — `t:"dock"` and the `buyCrate`/`barterCrate` calls only in `settleDock`. Red-proof: the event pasted back into `humanDock`. · **e.** 2 → 1. · **PLAYER:** nothing today. · **RISK** low-medium · **SIZE** S (~30) · **CONFIDENCE** high. *Found by: rules auditor.*

### 32. "Ye can light the ovens, so no muse coin"
- **a.** a captain who can bake is not offered the muse coin. · **b.** count 3: `flow.js:2675, 2739`; `engine:3037`; `flow.js:3283`. · **c.** engine `canMuse(p)` and `restOrMuse(p)`. · **d.** `scripts/qa/ovens_not_muse_one_place_check.mjs` — `doPass(` only via `restOrMuse`. Red-proof: re-add the `canBake` return in `botTurn`. · **e.** 3 → 1. · **PLAYER:** nothing today. · **RISK** low · **SIZE** S · **CONFIDENCE** high. *Found by: rules auditor.*

### 33. Which berth a ship may work from a square
- **a.** the dock a ship at a square may use, and whether it is free. · **b.** count 6: `adjPort engine:959-968` and `portAt :1824-1833` (same body); occupancy re-checked at `canDock :2315`, `doDock :1087`, `planTurnV3 :2778`, `flow.js:2570`. · **c.** `adjPort(p)=portAt(p.pos)`; every caller uses `canDock`. · **d.** `scripts/qa/one_berth_rule_check.mjs`. Red-proof: restore `humanAct`'s inline check. · **e.** 6 → 1. · **PLAYER:** inert (two ships cannot share a square, `:709, :740`). · **RISK** low · **SIZE** S · **CONFIDENCE** high as a copy, low as a player issue. *Found by: rules auditor.*

### 34. The bake-off: which crate answers a step already solved
- **a.** the crate shown for a step the baker has already solved. · **b.** count 4: `engine/bakeoff.js:139-145` (`bowlForStep`/`lockedStep`); `ui/bakeoff.js:730-731, :183, :928`; `flow.js:1048`. · **c.** the UI calls the engine functions (allowed, `module_graph_check.js:214`), passing `{slots:before}` so the answer never reaches the client. · **d.** `scripts/qa/solved_step_one_place_check.mjs`. Red-proof: restore `shown.indexOf(bake.order[k])`. · **e.** 4 → 1. · **PLAYER:** nothing today. · **RISK** low · **SIZE** S · **CONFIDENCE** medium. *Found by: rules auditor.*

### 35. Which captain sits on top of the captains plaque
- **a.** the captains-box row order. · **b.** count 2: `util.js:85, :147` (`buildPlayerRows` builds rows in `seatOrderFrom(appState.mySeat)` order) and `util.js:128-134` (`applyCaptainOrder`, pass-and-play only, CSS `order` from the active captain, called `board.js:2575`). · **c.** one writer of row order, with the top captain decided in one function. **His call:** in pass-and-play during a bot's turn, does the bot float to the top (today) or does the captain holding the device stay there (the viewer rule, DISPLAY-RULES §2, no mode fork; `1b62704a` tested his ask with four humans only)? · **d.** `scripts/qa/plaque_order_one_place_check.mjs` — row `style.order` written in one function; `buildPlayerRows` doesn't choose DOM order. Red-proof: `buildPlayerRows` looping `seatOrderFrom(appState.mySeat)` again. · **e.** 2 → 1. · **PLAYER:** nothing today. · **RISK** low-medium (`_crew_turn_order_check.mjs` reads DOM order) · **SIZE** S · **CONFIDENCE** high. *Found by: forks auditor.*

### 36. Whether the table has a "you" (the recipe band's captain)
- **a.** is there a captain at this table who is this screen's own. · **b.** count 2: `util.js:146, 162-163, 184` (from roster ids) and `board.js:2370-2372, 2417, 2429` (from engine strategies). · **c.** one `viewerCaptainSeat()` from one record; delete `humanIdxs`/`spectator`/`youIdx`. · **d.** `scripts/qa/table_viewer_one_place_check.mjs`. Red-proof: restore `const spectator=humanIdxs.length===0;`. · **e.** 2 → 1. · **PLAYER:** nothing today (`orchestrator.js:2760` derives strategy from the roster id, so they agree by construction). · **RISK** low · **SIZE** S · **CONFIDENCE** medium. *Found by: forks auditor.*

### 37. Whether this table may skip ahead (⏩)
- **a.** whether the skip is offered. · **b.** count 2: `stage.js:1599-1605` (`showsThinkingIndicator`, shows the chip) and `stage.js:3272` (`if (appState.db && appState.room) return;`, refuses the tap — the half the tick used before `44dc853e`). The chat offer has the same shape (`orchestrator.js:2793`, `stage.js:1620`). · **c.** `skipOffered()` called by the chip's display and its click handler. · **d.** `scripts/qa/skip_offer_one_rule_check.mjs`. Red-proof: the handler's own networked guard restored. · **e.** 2 → 1. · **PLAYER:** nothing today. · **RISK** low · **SIZE** S · **CONFIDENCE** high. *Found by: forks auditor.*

### 38. Whether this screen publishes the event feed
- **a.** only the computing screen broadcasts events. · **b.** count 2: `panel.js:240` (`if(appState.isHost){ … onEvents() }`) and `orchestrator.js:1638-1639` (`pushEvents`' own guard, which calls the first "belt and braces"). · **c.** `pushEvents`; delete the panel.js guard (`mode_fork_check` baseline panel.js 3→2). · **d.** `scripts/qa/event_feed_one_guard_check.mjs`. Red-proof: wrap `onEvents` in `if(appState.isHost)` again. · **e.** 2 → 1. · **PLAYER:** nothing. · **RISK** low · **SIZE** S · **CONFIDENCE** high. *Found by: forks auditor.*

### 39. Which captain is "you" on this screen
- **a.** this screen's own seat, and what it falls back to when unset. · **b.** 21 reads, 2 behaviours: the helper `util.js:2044` (`seatLocal`); inline with no fallback `board.js:2417`, `util.js:85, 162`, `panel.js:1042, 1270`, `lobby.js:374`, `orchestrator.js:210, 2054, 2786`; inline with a private `?? 0` `flow.js:114, 123, 773`, `stage.js:267, 1194, 1205, 1602, 3192, 4682, 4796, 5663`. · **c.** `seatLocal(s)` plus `viewerSeat()` with the one fallback; delete every `mySeat ??`; teach `mode_fork_check`'s regex `viewerSeat` so the debt stays visible. · **d.** `scripts/qa/viewer_seat_one_place_check.mjs`. Red-proof: `boatUXY(appState.mySeat ?? 0)` back. · **e.** 21 inline reads → 1 helper. · **PLAYER:** nothing today (`mySeat` is null only at boot and when abandoning the lobby); it would bite a spectator mode. · **RISK** low · **SIZE** S-M (7 files, ~25 lines) · **CONFIDENCE** high as copies, low urgency. *Found by: forks auditor.*

### 40. A captain's colour
- **a.** each seat's colour. · **b.** count 3: `shared/index.js:770` `HEXCOL`; `index.html:48` `--p0..--p3` (read only via `COLORS`, `shared/index.js:769`, which no file reads — grep); `index.html:4069-4072` (the pass-and-play name dots). · **c.** `HEXCOL`; the CSS variables are written from it at boot; the dots use `var(--pN)`; delete `COLORS`. · **d.** `scripts/qa/captain_colour_one_place_check.mjs` — no `HEXCOL` value appears elsewhere. Red-proof: an inline `#f2679e`. · **e.** 3 → 1. · **PLAYER:** retune a colour and the pass-and-play dots keep the old one. · **RISK** low · **SIZE** S · **CONFIDENCE** high. *Found by: facts auditor.*

### 41. A recipe ingredient's tick, and a baking ship's fade
- **a.** a recipe ingredient is marked as held; a ship at the ovens is drawn half-transparent. · **b.** tick count 3: `board.js:2435` (band), `board.js:2449-2452` (a spectator's rows), engine `needs()` `:399`; fade count 2: `board.js:1842` (live `player.baking`) and `board.js:2400` (snapshot `st[i].baking`), both `0.42`. · **c.** pure `recipeTicks(recipe,hold)`; one `shipFade(baking)` read by both drawing paths. · **d.** `scripts/qa/recipe_tick_one_rule_check.mjs` (one `indexOf(ing)…splice` loop); extend `ripple_one_answer_check.mjs` (one `0.42` opacity expression). Red-proofs: the loop pasted back; a second opacity expression. · **e.** ticks 3 → 1 · fade 2 → 1. · **PLAYER:** **measured:** 21 recipes, 0 with a repeated ingredient, so the ticks agree today; while scrubbing, the two fade paths can disagree (inferred). · **RISK** low · **SIZE** S · **CONFIDENCE** high. *Found by: facts auditor.*

### 42. Small copies: an empty seat's temperament, the draft's waiting line, two sound slices, the wind primitives
- **An empty seat's temperament** — `orchestrator.js:2340` and `:2628` use `seatStrat(i)`, `:2760` uses `s.strat||"pirate"` (a different value); one place `seatStrat` (`util.js:2107`); gate `empty_seat_temperament_check.mjs`; 3 → 1; unreachable today. *(forks)*
- **"Waiting for the crew" after a draft card** — `flow.js:3387` and `orchestrator.js:1754` both `showNarration(waitMsg,{wait:true})`; one helper `draftDispatch` owns; gate `draft_wait_line_one_place_check.mjs`; 2 → 1; nothing today. *(host/guest)*
- **The cork pop slice** — `audio.js:422` and `:917` repeat the slice formula; one `popSlice(slot)`. **The card swish** — `stage.js:2756` and `:2827`, two paths of which one runs; `rcShow` swishes on every path. Gate: extend `ambience_one_seam_check.mjs`; each 2 → 1; nothing today. *(facts)*
- **Who holds the wind, three engine primitives** — `downwindSide :1845-1852`, `downwindFrom :1838-1842`, `windSquare :1798-1802`; `downwindFrom` becomes the primitive; gate `weather_gauge_one_place_check.mjs`; 3 → 1; agree today. *(fight)*
- Each: RISK low · SIZE S · CONFIDENCE high (the empty seat medium).

---

## Resolved disagreements between auditors
- **The coin flip's spin sound (item 6).** The facts auditor rejected it as "two drawings of one flip, never both on one screen". The fight auditor read further: the big coin that `watchFlip`/`broadcastFlip` drive is hidden on the stage (`index.html:2252`), but `setFlipCoin("spin")` still starts the sound, so a watching screen gets both starts. Kept; audibility is inferred.
- **A crow's-nest call's result, two wordings.** The facts auditor listed "🔭 Juju +2🌕 · Davy no bounty" (the bubble) vs "{Player} called it wrong." (the log) as one fact twice. **Not an item:** both are his own rewrites for two surfaces (DECISIONS.md:3009-3011: "{Player} called it wrong." and the settle line "Dough Hook +5 · Flaky Jack −2"), and the result itself is decided once (`flow.js:3643-3644`).
- **The re-watch purse (item 17).** The rules auditor judged the guest's purse arithmetic an allowed display for a screen without an engine; three auditors judged it a second copy that makes two screens show the same purchase differently. Kept, because the test ("change one place, would the other silently keep the old behaviour?") is met — the affordability and the drop are decided twice. The code's "D-56" citation is not a ruling on this (see item 17).
- **The fight: one item or several.** The auditors reported the re-fire, the flee, the plunder, the round result and the bookkeeping as separate items. Mac: Dev asked for one fight, not several patches; they are item 1's five facts, with one engine design and one gate.

## Not items — checked and set aside
- **Designed per docs/INTENDED-BEHAVIOUR.md:** the per-device tutorial, the your-turn bell heard by one player, each screen listing its own captain first, recipe secrecy by mode (one pure rule in `src/shared/visibility.js`).
- **One place, not two:** the "is this decision on this screen" inputs to the one door (`flow.js:898, 1021, 3363, 3385`; `util.js:859, 1655`; `lobby.js:374-375, 413, 474`) — a full "one Decider" refactor was considered and turned down on 2026-08-31 (HARD-WON-LESSONS §12i, `44dc853e`); consumer-only reactions (`payInto`, `coinsLeave`, crate flights, `sailSetsOff`, `sailArrives`, `rideStreaks`, `firstHomeConfetti`, `shotLands`, `loserKnocked`, `spawnPops`, `recipePicked`); the muse coin amount (`doPass`); powder (converged today); the buy price and payday; baking; the cannon; the randomness source (`Game.flip`); the crow's-nest call and bounty (one place, in display code — headless voyages never earn it, which item 2 carries); HEADS % on the End of Voyage (computed once); the wind pill and the day-start forecast (one source); the sail squares offered to a human (`reachable()` calls engine `sailStates`, as bots do).
- **Two different facts that look alike:** `sweepCam` for a rim ride vs the end-of-voyage look; `benchPublish` vs `benchReveal` (the opposite order is deliberate, `:1224-1227`); `status:"playing"` at start, reconnect and resume; recipe steps (`shared/recipe-steps.js`) vs the recipe book's method; the tick green `#27c78d` matching captain 3's colour.
- **His taste, approved separately:** the fight's opening wind tag and the flip stage's wind line (both call `downwindSide`; `ceremony.downwind` "APPROVED as written, 2026-08-14"); the abacus click at three different moments (his picks, AUDIO.md:371); "call.made" said only for a human's call (worth asking him, not counted).
- **Deliberate, and the bot session's:** trade pricing's `PLAN.coinsPerDockTurn` (4) vs `coinTurns` (2), pending the ladder (`:2066-2068`); how bots *choose* (never re-watch, recipe coin flip, no fight or trade with a full recipe, seller's remorse, leverage buys, the 72% crow's-nest favourite).
- **Already held by a gate:** a purse's number and its chink; powder; the flip stage's words; the plaque's recipe band; every word in `words.js`; the ambience seam; the bots' buy decision; prompt renderers, the draft dispatcher, secrecy rules and hand-over order; the guest's bake bench fields; narration subject and event number; sailing order.
- **Dead code noticed on the way (out of scope; not proposed):** the board's hidden compass and forecast arrows (`stage.js:32`, `board.js:2625, 2644`); `stage.js:1831` storm `camFull()` (deleted with item 24); `drumroll` still loaded but never played (`audio.js:35`); `lobby.js:421`; the battle box's leftover counters and `waiting` field; `appState.turnExpired`; `chooseAction`/`chooseTarget`/`huntTarget`/`strikeFrom`/`adjOpp` (called only by `scripts/bot_ladder.js` against `v2bakeoff`); `justDocked`/`dockedNow`/`firstFlip` never read by a live rule; `scripts/battle_sim.js` (an abandoned ruleset).

## Suggested order of work (sequencing is mine; the Mac chooses which items)
The two that decide whether bot results mean anything first — item 1 opening with its posed browser picture — then the small, clear, player-visible ones, then the wide ones:
1 → 2 → 11, 12, 8, 13, 20, 18, 19, 14 → 3 → 4, 9, 25 → 5 → 7 → 15 → 10 → 21, 22, 17 → 16 → 6 → 24 → 23 → tier 4 (27–42) → 26 last.
`npm test` exit 0 after every item; one commit per item with its a–e; `gates.total` bumped as gates land; the sea trial on the final tip.

---

## CEO verdict
*(recorded here after the review runs)*
