# MAP — Pastry Pirates game architecture, as it actually is (2026-08-30)

Read from the working tree at build `2026.08.30.1` (branch `claude/cloud-handoff-planning-a9ay1u`).
Every file under `src/` was read for this map; line counts are `wc -l` of the same day. Roughly
half the source-line count is deliberate WHY-commentary (house style, load-bearing — do not strip).

---

## 1. Module map and data flow

### The tree (23,357 lines of JS under `src/`, plus `index.html` at 3,053)

| Module | Lines | Owns |
|---|---|---|
| `index.html` | 3,053 | ~2,630 lines of CSS + ~370 of markup. Firebase compat SDK 12.15.0 `<script>` tags, one `<script type=module src=src/main.js>`. **No build step — this file IS the deployment.** |
| `src/main.js` | 251 | Composition root. Wires the injected-handler seam (`ui.setNetHandlers({...})` — ~30 keys mapping UI-side names to orchestrator functions), installs `unhandledrejection`/`error` → `voyageAground`, resize/orientation listeners, the 500ms `setClockUI` interval, then `boot()` and `initStage()`. One retained global: `window.revealMyRecipe`. |
| `src/state/index.js` | 143 | The single mutable `appState` object. Exported once, **never reassigned** — every consumer mutates properties. Plain data, no accessors (a getter could perturb determinism timing). Holds room/seat/host flags, event frontiers (`evIdx`, `evPushed`, `evConsumed`, `evSeen`), replay state (`dlog`, `replaying`), ff, narration bookkeeping. |
| `src/shared/index.js` | 740 | Pure leaf: `mulberry32`, ingredient/art tables (`ING_*`, `EMOJI_IMG`, ~80 asset paths), `emojify()` (the emoji→art chokepoint, tag-aware), `subjectOf()` (the one who-is-this-line-about rule, shared by both seats), direction tables (**key order load-bearing** — RNG-indexed), `buildRoster`, `rulesFacts`. |
| `src/shared/recipe-steps.js` | 103 | The authored 5-step bake order per recipe. Shared tier because the engine builds the bench from it. |
| `src/engine/index.js` | 3,207 | `class Game` — the entire ruleset, pure and seeded. Board generation, sailing BFS (`sailSearch`/`sailStates`/`sailPath`), storms, docks/black market, the whole trade system, battles, the v3 race planner (bots), the bake-off day loop, `resolveEnd`. `ev()` records every event with a **full state snapshot** and a presentation-only `draw` lane (`bakeDraw`). Zero references to host/guest/mode/DOM/network — verified by the one-director plan. |
| `src/engine/bakeoff.js` | 222 | Pure bake-off core: `newBake`/`scrambleBench`/`shuffleSlots`/`scoreAttempt`/`applyResult`/`botGuess`. RNG always passed in. |
| `src/net/registry.js` | 102 | **The only file allowed to call `ref.on()`/`ref.off()`.** Scoped attach registry (session vs room), duplicate-attach refusal, exact-reference detach. |
| `src/net/watchers.js` | 167 | One thin wrapper per Firebase listener path (16 of them). Handlers pass through untouched. |
| `src/net/writers.js` | 306 | One function per write (~30). Unconditional — every guard stays at the call site. |
| `src/net/readers.js` | 46 | One-shot reads (`meta`, `room`, `dlog`, `ev`) + the seat-claim transaction. Returns raw promises. |
| `src/net/index.js` | 143 | Barrel + the Firebase config + `netInit()` (returns null gracefully when SDK absent). |
| `src/orchestrator.js` | 2,781 | The "main tier": room lifecycle (create/join/watch/start/abandon/resume), the **host game loop** (`runLiveNet` → day loops → `liveResolveEndNet`), the **guest's nine listeners**, `consumeEvent` (the ONE event consumer), the battle driver (`asyncBattle`/`battleAsk`/`battlePublish`), the bake bench pub/sub, host-gone recovery, `boot()`. |
| `src/ui/flow.js` | 3,192 | The turn flow: `humanTurn`/`humanAct`/`humanDock`/`humanTrade`/`botTurn`, `pickCell`/`bakeoffPrompt`, the converged renderers `renderAskPrompt`/`renderPickPrompt`, the coin slider/counter-offer step machines, `draftDispatch`, the sail-route and rim-sweep animators, ff recap, game start (`startSinglePlayer`/`startPassAndPlay`), replay end (`endReplay`). |
| `src/ui/stage.js` | 3,726 | The "/4 stage": camera director (`camTo`/`camFitCells`/`camFrame`), ship-attached narration bubbles (`stageFlash` + weighted obstacle placement), the radial prompt fan (`promptTick`, ~1,000 lines), flip ceremony veil, wind pill, ribbon, centre stage, chat sheet, gestures, the `window.__pp4` bridge, the 2-gear tick loop + watchdog. |
| `src/ui/board.js` | 2,312 | `drawBoard`/`render` (the frame renderer, reads `events[evIdx].state`), ship painters (`paintShipAt(Point)`, `snapShipTo`, `setShipGlideMs`), ripple ring (`ringTo`), storm rain layers, wind-dot prototype (~700 lines), flip coin state + `FLIP_SPIN_MS=795`/`FLIP_LAND_HOLD_MS=800`, `showStats` (End of Voyage), `syncBoardSizing`, `seedIdleGameState`. |
| `src/ui/util.js` | 2,092 | `EVENT_NARRATION` (the one event→text/pops/caption table), `describeFor`/`narrationVariants`/`pickNarrVariant`, **`ask()`** (the decision router), `optionButtonsHTML`/slider builders (the one markup source), pacing constants (glides, holds, `narrationHoldMs`), `sleepMs` (timer + sweeper belt), `voyageAground`, awards, session/solo persistence + replay tolerance. |
| `src/ui/panel.js` | 1,295 | `panel()` (the one prompt sink; ghost crossfade + 4-phase height machine), `typewriterReveal`, `flash()` (the one narration entry), `liveRender()` (**the local event drain + host publish trigger**), `narrateLastEvent`, chat lines/bubbles, `fadeOutPanel`. |
| `src/ui/bakeoff.js` | 893 | `playBakeoffLive` — the bench choreography (cover/swap/reveal), identical for baker and watcher; decides nothing. |
| `src/ui/lobby.js` | 484 | Welcome/room/pass-gate screens, `renderSeatList`, name modal, `passGate`. |
| `src/ui/recipe.js` | 458 | The 21-recipe book, recipe cards/modal, `escHtml`. |
| `src/ui/audio.js` | 372 | One AudioContext/master gain, event→sound map, storm bus. **Three live defects — see `docs/AUDIO.md` §1** (duplicate `anchorHold` key kills `fishing` and blasts 8s of storm; stems unlevelled). |
| `src/ui/handlers.js` | 65 | The injected-handler seam: `setNetHandlers`/`netHandlers`. How ui-tier calls up into the orchestrator without importing it. |
| `src/ui/pulsebeacon.js` / `usage.js` / `index.js` / `module-contract.js` | 151/71/22/13 | Debug beacon (`?debug=pulse`), anonymous usage pings (REST, no SDK), the UI barrel, the module-load tripwire. |

### Tier rules (mechanically gated by `scripts/module_graph_check.js`)

`shared` ← `engine`/`state`/`net`/`ui` ← `orchestrator`/`main`. **`src/ui/` may never import
`src/net/` or the orchestrator** — everything upward goes through `handlers.js` (30 keys wired in
`src/main.js:74-117`). `net/registry.js` is the only `ref.on()` site. `state` is pure data.

### Data flow — one game, three transports

```
seeded Game (engine)                              appState.game, mulberry32(seed)
  │ Game.ev(o) → event {t, p, round, wind, storm, state[] snapshot, draw?, tokens}
  ▼
appState.game.events[]  (append-only; the authority's copy)
  │
  ├─ LOCAL DRAIN (every mode): liveRender() [panel.js:133] walks evConsumed→length,
  │    hands each event to consumeEvent() [orchestrator.js:1586] via the onConsumeEvent seam.
  │    consumeEvent: applyActiveSeat → syncLogLines → stormCam → rim ride → sail ride →
  │    render() → spawnPops → playForEvent → applyEndMeta. ANIMATE BEFORE render() is gated.
  │
  └─ WIRE (host only): pushEvents() [orchestrator.js:1455] — host-guarded, deep-copies each
       event, stamps serial `n` ON THE COPY (never the engine's object), pushes to
       rooms/<code>/ev.  publishNow() [flow.js:1090] = the publish half alone, so a host
       animation never holds the table (W9).

GUEST: watchEvents [orchestrator.js:1614] → fixEv → push onto ITS OWN events[] → advance
  evConsumed/evSeen → the SAME consumeEvent. Guest branch inside consumeEvent mirrors the
  snapshot onto its render-shell players (sanctioned "who computes" fork).

DECISIONS: ask() [util.js:1562] → decisionIsLocal(seat)?
  local  → renderAskPrompt (flow.js:201) → promise resolves
  remote → remotePrompt (orchestrator.js:1482) → rooms/<code>/prompt → guest watchPrompt
           [orchestrator.js:1641] → the SAME renderAskPrompt/renderPickPrompt/playBakeoffLive
           → sendResponse → rooms/<code>/response → host resolves.
  Every resolved decision → logDecision → dlog (Firebase in crew, localStorage in solo).

NARRATION: flash() [panel.js:1215] → stageFlash bubble locally + netBroadcast/netNarrate →
  rooms/<code>/narr {html, variants, wait, subj, evN} → guest watchNarr [orchestrator.js:1832]
  → the SAME flash(). Subject resolved by shared subjectOf() over the event both hold; a
  bounded 450ms grace (NARR_EVENT_GRACE_MS) keeps a line from outrunning its event.

REPLAY: host reload / solo resume rebuilds Game(cfg,seed) and replays dlog with
  appState.replaying=true (all rendering suppressed); endReplay [flow.js:3137] validates the
  rebuild via replayShortfall before going live.
```

### Firebase room schema (all under `rooms/<CODE>/`)

`seats` (claim transactions), `status` (lobby|playing|hostgone|ended), `cfg`+`seed`, `ev` (the
event feed), `prompt`/`response` (singular ask channel), `draftPrompts`/`draftResponses`
(per-seat, concurrent recipe draft + intro barriers), `narr`, `flip`, `battle` (also carries the
bake bench under `.bake`), `dlog`, `turnOrder`, `recipes`, `meta`, `chat`, `recovery`. Durable:
`gamelogs/<ts>` (full transcripts), `presence`, `feedback`, usage `visits/starts/fins`.

---

## 2. The host/guest story — what is converged, what still forks

**The rule (CLAUDE.md rule 23):** host/guest decides who *computes* and who *creates the room*,
never what is *drawn*. The design-time question is "what makes these two agree?" — the only
durable answer being "there is one of them."

### Converged (each has a named gate in `npm test`)

| Channel | The one path | Where |
|---|---|---|
| **Events** | `consumeEvent()` — host drain and guest wire feed the same consumer; one `evConsumed` frontier (A-13) | `orchestrator.js:1586`, drain `panel.js:154`; gate `one_event_consumer_check.mjs` |
| **Ask prompts** (fork 2) | `renderAskPrompt()` — guest rebuilds the same opts shape from the wire and names the renderer directly | `flow.js:201`; guest `orchestrator.js:1686-1697` |
| **Sail picks** | `renderPickPrompt()` + one spec built once in `pickCell` (incl. `pos` for the stay square — T-02's "missing field") | `flow.js:566`; guest `orchestrator.js:1725` |
| **Bake** | `playBakeoffLive` named directly by both tiers; bench moments published by whoever bakes (`benchPublish`→`applyBenchSnap`), verdict by the host | `orchestrator.js:364-441,1726-1802`; `flow.js:723` |
| **Narration** | guest's `watchNarr` calls the same `flash()` the host's loop calls; subject via shared `subjectOf` | `orchestrator.js:1832-1892`, `panel.js:1203` |
| **Recipe draft / intro barriers** (forks 4+5) | `draftDispatch` — public/private is an input, pass-and-play serial vs networked concurrent | `flow.js:2800`; gate `draft_dispatch_convergence_check.mjs` |
| **Sail/rim animation** | event-carried route (`draw.route` baked by the engine) + idempotent WeakSet walkers, run from `consumeEvent` on every tier | `flow.js:1277,1095`; `engine/index.js:333-353` |
| **Battle publish** | `battlePublish` = local render always, then the host-guarded write (fork 3 step A) | `orchestrator.js:270-275`; gate `battle_publish_seam_check.mjs` |
| Button row / slider / sail squares / purse | one builder each: `optionButtonsHTML`, `sliderWrapHTML+wireSlider`, `sailHighlightRect`, `showSeatCoins` | `util.js:1450,1493`; `flow.js:515`; `board.js:1621` |

### Still forked or half-done — the live gaps

1. **Fork 3 step B, the battle scoreboard's consumption side.** The host draws its own scoreboard
   from the game loop and must never read itself back; the guest draws from `watchBattle`. The
   code itself declares it: *"battleAsk is prompt fork 3 in DISPLAY-RULES §4 and is still
   unconverged; converging it is that fork's own piece of work"* — `orchestrator.js:490-497`.
   `watchPrompt`'s `p.battle` branch (`orchestrator.js:1654-1668`) is separate wiring from
   `battleAsk`'s local branch (`orchestrator.js:553-566`): same scoreboard renderer, two
   orchestrations around it — exactly the shape that produced T-04 (the 13.4s dead battle card).

2. **Two answers to "whose turn is it".** `appState.curSeat` (written by `setActor`, i.e. only on
   the client running the turn loop) vs the event-walk in `render()`/`activeTurnSeat()`. The
   camera and ribbon read `curSeat`-adjacent state; the ring and captains box read the walk. They
   disagree for the whole length of a bake. Named in the code as *"one fact, derived twice, kept
   in step by nothing"* and deliberately left for a supervised change — `board.js:1711-1737`. The
   one-director plan makes this migration step 3.

3. **The guest's state mirror** inside `consumeEvent` (`orchestrator.js:1588-1600`) is a
   *sanctioned* "who computes" fork — the guest's `appState.game` is a render shell fed from
   event snapshots. It works, but it means ~264 `appState.game` reads across `src/` are reading
   two different kinds of object depending on tier (authoritative simulation vs mirrored shell),
   and only comments say which reads are safe on a guest.

4. **Timing seams papered over with bounded waits.** Narration vs event arrival is reconciled by
   a 450ms grace poll (`orchestrator.js:1831,1883-1891`); prompt-vs-wait-line races by a 60ms
   deferred panel clear (`panel.js:264`) and dedup predicates (`waitLineIsSelfAddressed`). Each
   is measured and bounded, but they are symptoms of two independent listeners delivering one
   moment — the thing the one-director plan's storyboard model removes.

5. **Late-join / reconnection** — named by the plan itself as *"the largest omission"*; a guest's
   director recovers only after a refresh. `watchRecoveryState` + the resume escape hatch
   (`orchestrator.js:2590`) are the prior art, not the answer.

### The one-director plan (`.planning/architecture-one-director.html`, 2026-08-30)

Thesis: *the turn loop should produce a script; the client should perform it.* Four layers —
L1 rules (already pure), L2 authority (one instance, produces the event stream), **L3 presentation
(NEW: pure `present(event, engineSnapshot) → storyboard`, may not import `src/state/` or
`src/ui/`)**, L4 performer (the only DOM-toucher, identical on every client). Mode differences live
in exactly three homes: the **Decider** (how an answer is obtained — pass-and-play's hand-over gate),
**performer capabilities** (rate never content — solo's fast-forward), and the **shell**. The
mechanical fork test: *does the mode-specific thing emit an event?* Migration is six strangler-fig
steps (storyboard for `sail` first → route on the event → one whose-turn fact → storyboard-parity
golden-file gate → Decider interface → delete old paths). Its own measured table: `isHost` appears
28× in orchestrator.js, 4× flow.js, 2× panel.js, 2× util.js (verified against the tree today; 0 in
stage/board). **Status: nothing in the plan has been built** (its own footer says so). What already
existed before it: `consumeEvent` + six source-text parity gates. Determinism corpus note: `npm run
test:determinism` is marked BROKEN BY THE CUTOVER, which the plan argues makes the
canonical/presentation event split *cheaper now*.

---

## 3. Constraints that shape every change

1. **Determinism / replay.** The engine is seeded (`mulberry32`); solo resume and host reload both
   rebuild by replaying `dlog` against `Game(cfg,seed)`. Consequences: RNG **call order is
   load-bearing** everywhere (`engine/index.js:184-186` and the "ORDER IS LOAD-BEARING" table
   annotations in `shared/index.js:253-281`, pinned by `engine_contract_check`); every human
   decision must be logged (the coin slider desync — `flow.js:1788-1815` — is the cautionary
   tale); changing what `Game.ev` emits invalidates the corpus and needs a gated re-record —
   which is why the wire serial `n` is stamped on the *copy* (`orchestrator.js:1467-1477`) and
   why `draw` is a lane rules may never read (`engine/index.js:321-333`). Schema stamps
   (`SESSION_SCHEMA_V=1`, `SOLO_SCHEMA_V=3`) refuse old saves rather than desync. *Caveat:* the
   corpus gate itself is currently broken (see §4.5).

2. **No build step, and `main` is production.** `index.html` + `src/` are served as-is from the
   repo root; ES modules native; a push to `main` reaches real players immediately. Staging is a
   permanent address published from any branch; promotion is a merge. `CNAME`/`robots.txt`/
   `sitemap.xml` claim the live domain and must never be copied anywhere.

3. **Safari is a first-class hazard.** The BUG-01 storm-crash contract (pre-baked PNG rain tile,
   animate only `background-position`, snap — never animate — the narration height per typewriter
   tick) is preserved byte-identically in `board.js` (header, lines 9-30). The welcome-screen
   blur made a 500ms clock tick cost 137% CPU (`panel.js:67-90`) — hence `setIf`/write-only-on-
   change discipline. ARIA must be written as attributes (reflection landed only in Safari 16.4).
   Safari caches ES modules across reloads (test on a fresh port). `innerWidth` is the *visual*
   viewport — every layout read goes through `vwPx()/vhPx()` (`util.js:1188-1203`).

4. **The five board layers, and `CAM_HTML_LAYERS`.** `#boardwrap` stacks `#board` (SVG scenery) →
   `#rimHost` → `#sailHost` → `#rippleHost` (HTML) → `#boardShips` (SVG). The camera rewrites the
   SVG viewBox; **every HTML overlay mapped to board coordinates must be listed in
   `CAM_HTML_LAYERS` (`stage.js:396`) or it detaches the moment the director zooms** — it is a
   list precisely because two named consts already caused the rim arrows to float free
   (`docs/BOARD-RENDERING.md` §3). 640 board units == 100cqw (the `CQ` helper exists in **three
   copies**: `board.js:128`, `board.js:186`, `flow.js:529` — a named drift hazard). The SVG
   letterboxes (`xMidYMin meet`), so never compute screen positions from viewBox ratios — compare
   against what the renderer drew (§7 of that doc; it produced a 200px phantom bug once).

5. **SVG vs HTML animation.** Chrome does not composite SVG transform animations at all and
   `will-change` cannot promote an SVG child: the same animation measured ~62 layouts/sec as SVG
   and **0** as HTML. Anything animating continuously lives in HTML and animates only
   `transform`/`opacity`; static transform on a wrapper, animation on the child (a CSS animation
   overwrites the element's whole transform — the compass-chip failure).

6. **Browsers drop timers; the game is a chain of awaits.** Measured: two armed `setTimeout`s
   never delivered while a `setInterval` ticked through (`util.js:1663-1688`). Hence `sleepMs`'s
   sweeper belt, `stageFlash`'s deadline-not-timer bubbles, `tick()`'s setInterval watchdog
   (`stage.js:3550-3565`), and `routeTick` racing rAF against a timer (rAF fully suspends in
   hidden tabs). Any new awaited beat must use these, or a backgrounded phone hangs the voyage.

7. **Structural invariants.** `appState.game` always exists (`seedIdleGameState`, because 264
   reads are mostly unguarded — `board.js:2051-2080`); the `appState` *binding* is never
   reassigned; `MAX_NAME_LEN=18` mirrors the live RTDB validation rule (`util.js:1972-1987`);
   bots and humans share every rule path (one engine method per action — `doDock`, `doPass`,
   `settleTrade`, `canAttack` — so the two cannot diverge); the narration box reveals top-to-
   bottom in DOM order; the credits/About stay out of pirate voice. Before reporting any
   host/guest "divergence", read `docs/INTENDED-BEHAVIOUR.md` — recipe secrecy, viewer-first
   captain ordering, and guest lag are all by design.

---

## 4. Tech-debt hot spots, ranked

**#1 — "Whose turn is it" is two facts, and the camera sits on the wrong one.**
`appState.curSeat` (written only where the turn loop runs — `setActor`, `util.js:1822`) vs the
event-walk (`board.js:1738-1743`, duplicated in `activeTurnSeat()` `board.js:1494` and
`currentTurnSeat()` `util.js:1878` — the code itself warns "do not read curSeat here as well —
that makes three"). During a bake they disagree for minutes (`board.js:1711-1737`, T-09, measured
still-wrong by its own probe). Every fix in this area risks the replay scrubber (the walk is what
keeps scrubbing honest) — which is why patching one symptom keeps breaking the other. This is the
one-director plan's step 3 and the highest-leverage single convergence left.

**#2 — The battle display path (fork 3) is the last big two-orchestration surface.**
The publish side converged (`battlePublish`), but consumption still forks: host draws inline from
`asyncBattle`'s awaited choreography (`orchestrator.js:610-847` — a 240-line async function that
interleaves rule mutations, purse debits, event emission, camera cues and Firebase writes), guest
draws from `watchBattle` (`orchestrator.js:482-523`, `isHost` early-return at `:497` marked "a
declared gap, not an oversight") and from `watchPrompt`'s separate battle branch
(`:1654-1668`). Fixing a battle-card bug on one tier has repeatedly regressed the other (T-04;
the flee/W9 publish-order fixes each needed three synchronized edits across
orchestrator/flow/engine). `battleAsk` (`:527-576`) is the fork's hinge.

**#3 — `stage.js`'s placement engine is a 1,000-line function tuned by incident.**
`promptTick` spans `stage.js:2494-3517`; around it orbit `camFitSail`, the bubble obstacle search
(`stageFlash:1494-1594`), `clampAskToScreen`, `liftAskClearOfFan`, `placeBackButton`,
`peekHintTick` — each a measured patch over the last one's failure (18 of 40 phone findings on one
gate traced to a single stale-width memo, `stage.js:571-581`). Two placement changes were shipped
on run-to-run probe noise and reverted the same night; Wyatt froze the area: *"don't touch bubble
placement again without a posed comparison — two screenshots"* (`stage.js:203-215, 1552-1558`).
The measured-but-unexplained `no-cover-ask` case (`stage.js:599-620` — host-016 had headroom and
still overlapped) is the signature of a system whose interacting passes nobody can predict. Any
future prompt style pays this tax.

**#4 — `orchestrator.js` is three modules wearing one file, held together by a 30-key seam.**
Room lifecycle, the host game loop, and the guest's nine listeners share 2,781 lines and 28
`isHost` reads. The `handlers.js` seam keeps the import graph clean but is functionally a typed
global bridge: `src/main.js:74-117` wires ~30 `on*` keys, several of which exist only to dodge
ui-tier import cycles ("(b)-case" edges: `onLiveRender`, `onFlash`, `onDryCeremony`,
`onPopEmoji`, `onRender` — sibling calls routed through the composition root). `liveRender()` has
~84 call sites and does two unrelated jobs (drain + publish), which is exactly what W9 had to
split with `publishNow()`. The one-director refactor lands here; until then every new networked
feature adds a listener, a writer, a seam key, and a guard.

**#5 — A class of reassuring-but-broken instruments.**
The tree is annotated with its own audit stamps: `[UNGATED-IN-4: …reads the root tree, not this
one]` appears on `ui_contract_check.js`, `narration_test.js`, `bakeoff_test.js`,
`bakeoff_parity_test.js`, `dlog_replay_test.js`, `rim_sweep_trace_test.js`, and more — gates that
are green while reading the *pre-cutover* root copy of files, not this game. `npm run
test:determinism` is marked BROKEN BY THE CUTOVER (`package.json`, per the plan §08), so the
corpus that justifies "prefer UI-tier fixes" is not currently enforcing anything. The bot bake
`attention` constant is gated by nothing (`engine/bakeoff.js:189-199` — the named "sweep" script
never existed). The 4/ copy of `no_undef_check` is not in `npm test` (`main.js:61-63`). This is
CLAUDE.md's "a gate aimed at the wrong tree is not silent, it is reassuring" — repointing these is
cheap and closes an entire failure class.

**#6 — The engine's event contract carries rendered text, blocked behind the re-record.**
`e.spoil` is HTML (`ilabelImg` output) emitted by the engine (`util.js:539-563`, G3 — Wyatt:
"that seems badly designed"), forcing `EVENT_NARRATION.battle` into a ~175-line builder
(`util.js:528-704`) that parses its own event's display string, with three coin-spoil heuristics
(`isBribe`/`isEmptyHoldFive`/`tookNothing`) guarding rulesets that no longer exist. The fix is
specified (`docs/DETERMINISM-RERECORD-NEXT.md`) and queued behind the same broken corpus as #5 —
so it compounds: the longer the re-record waits, the more display code grows around the leak.

**#7 — Cross-file constant coupling that only comments police.**
`GHOST_FADE_MS=800` must equal `.apMsg.fadeOut`'s `.8s` in `index.html` (`panel.js:229-232`);
`RESIZE_MS=180` must equal `#apGrid`'s `transition` (`panel.js:216-221`); the ripple's `-0.9s`
delays must be a third of `rippleOut`'s 2.7s (`board.js:497`); the `CQ` helper exists thrice
(§3.4). One CR-01 incident already shipped from exactly this (a hardcoded 250ms belt beating an
800ms animation, emptying the box for 550ms per line). `index.html`'s 2,630-line stylesheet is the
other half of the UI and has no gate at all.

**#8 — Removed-feature residue: the shot clock and pause.**
`appState.turnExpired` is permanently false with ~20 dead abort-guards left across
`humanTurn`/`humanAct`/`humanTrade`/`humanDock`/`counterOffer` (`state/index.js:116-119` says so
explicitly). `currentTurnSeat` is uncalled; `resolveOpt` fallbacks, `keepPanel` conventions and
several comment blocks still speak clock-ese. Harmless today, but every one is a trap for the
clock's planned return "against the converged dispatch" — the re-add will be built on guards that
have been dead code for weeks.

**#9 — The comment corpus is the documentation, and it rots measurably.**
Roughly half the 23K lines is prose, and it is genuinely load-bearing (the graveyard, rule 10) —
but the repo's own history shows comments asserting runtime behaviour that were false when read
(`renderPickPrompt`'s "absent only across a version skew" while `pos` was absent in every game,
`orchestrator.js:1708-1724`; the iconAt fallback promise, `shared/index.js:22-28`). Corrective
stamps (`ROOT-TREE-CITATION`, `UNGATED-IN-4`) are now injected into files by tooling. The cost is
concrete: files exceed read-window sizes, `stage.js`/`flow.js`/`orchestrator.js` average well
under one statement per line, and the signal-to-noise of any grep is low. This is a maintenance
tax on every session, not a correctness bug — but it is why "small" files here are 2-3× their
functional size.

**#10 — The guest's render-shell `Game`.** 264 `appState.game` reads; on a guest most fields
(planner state, `tokens` beyond snapshots, `dlog`) are stale or meaningless, and only convention
(`orchestrator.js:1634-1637` "MUTATED IN PLACE, never reassigned") prevents corruption. The
`seedIdleGameState` welcome-screen stand-in (`board.js:2073-2080`) exists solely because those
reads are unguarded. Both dissolve under the plan's L3-purity rule; until then they are the
quiet reason "works solo, breaks in crew" bugs keep appearing.

---

## 5. How a turn actually happens (plain English)

*A crew game: one browser is the host (it runs the whole game), the others watch a feed and are
asked questions. Solo and pass-and-play are the same machine with the network parts asleep.*

1. **The day opens on the host.** `runLiveNet` bumps the round, advances the wind to what the
   compass promised last round, and writes a `newround` event. Every event carries a photograph
   of the whole table — every ship's position, purse, hold. If a storm was forecast it blows
   *now*, before anyone acts: the camera pulls out, every ship slides three squares, ships swept
   into the trade winds ride the current, and one summary line reads the whole storm afterwards.

2. **Each captain's turn, in the drawn order.** The host walks the seats. A bot decides its whole
   turn in the engine (route, dock, fight or trade, priced in turns-to-victory) and this screen
   merely animates it. For a human, the host asks — and *where* the question appears depends on
   whose seat it is. If it is this browser's seat, the prompt renders here. If it is a guest's,
   the host writes the question to the room's `prompt` box in Firebase, and the guest's browser —
   which runs the *same* renderer on the *same* payload — draws it there. Everyone else sees a
   "…is deciding…" line that stays up until the answer lands.

3. **First the sail.** The legal squares light up (computed by the same engine search that will
   validate the move — the board can never disagree with the rules). The captain taps a square;
   the answer is logged to the decision log, a `sail` event is emitted carrying the actual route
   through the water, the event is *published first*, and then the boat walks the route square by
   square — on the host and, from the same event, on every guest. Landing in the trade winds
   sweeps the boat along the current to the arc's end.

4. **Then the action.** The radial fan blooms around the boat: Dock (if beside an island's
   berth), Attack (if someone with cargo is adjacent and there's powder money), Trade (a hail to
   the whole table), or Muse (watch the sea, collect a coin). Docking is a treasure hunt — the
   flippenator takes the screen, heads pays more than tails, and either way the captain may then
   buy the island's crate at a price that climbs as shelves empty (a bare shelf flies the black-
   market flag: pay a flat premium, or barter any two crates). A trade collects an answer from
   every holder — bots reason in the engine, humans get the accept/counter/deny prompt — and the
   asker picks one deal or walks away. A battle is one broadside each, the wind breaking a
   two-heads tie for whoever fires downwind; the winner takes one crate, and spectators call the
   winner from the crow's nest for a free bounty.

5. **Everything the table sees flows from the events.** Each emitted event is consumed exactly
   once per screen: it updates the captain's log, animates the move, redraws the board from the
   event's own snapshot, pops the little icons, and plays its sound. Narration lines travel
   separately, but each carries the serial of the event it belongs to, so a guest never reads
   "ye trade milk" before the milk has visibly moved.

6. **The finish is a bake, not an arrival.** A captain reaching Tortuga with a full recipe lights
   the ovens and leaves the board (their ship fades — no storm, raid or trade can touch them). At
   the end of that day they play the bake-off: five bowls shuffle on a bench and must be named
   back in the recipe's own order; solved bowls lock, the rest reshuffle next day, and a coin
   buys a re-watch of the shuffle. The whole table watches the same bench, live, because the
   baker publishes each moment and everyone (host included) renders it. First perfect bake wins.
   Ties on the same day rank by crates, then coins, then arrival. Drumroll, one last clear look
   at the board, then the gold End of Voyage banner, awards and stats.

7. **If anything reloads,** the game replays itself: the seed rebuilds the identical board, the
   decision log replays every choice silently at full speed, and play resumes exactly where it
   stopped — with an escape hatch if the rebuild comes up short, and a 30-second grace before a
   crew is ever told their host has truly gone.
