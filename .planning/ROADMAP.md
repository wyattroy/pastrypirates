# Roadmap: Pastry Pirates

> **⚠️ PHASE NUMBERING RESTARTS AT 1 FOR v2.0**
>
> **Wyatt's explicit choice, 2026-08-18.** v2.0 promotes a different game with a different engine,
> and there were 0 phase directories on disk when this roadmap was written, so the restart is free.
> It also avoids colliding with the sketched Phase 26 of a v1.4 that will not now happen.
>
> **Consequence: "Phase 1" in this file is v2.0's Phase 1, not v1.0's.** Every archived milestone
> below is a pointer only — no phase checklist from v1.x survives in this file, deliberately, so
> nothing can match the wrong phase. v1.x phase detail lives in `milestones/`.

> **Read before planning any phase:** `.planning/research/v2.0-intake/` — five reports, 1,803 lines,
> reconstructing the `4/` development period, which produced no GSD artifacts. Every requirement in
> this roadmap traces to a measured finding in one of them.

## Milestones

- ✅ **v1.0 Edit Pass** — shipped 2026-07-24 — [`milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md) · [`MILESTONES.md`](MILESTONES.md)
- ✅ **v1.1 Monolith Refactor** — shipped 2026-07-25 — `index.html` split into native ES modules under `src/`
- ✅ **v1.2 Playtest Fixes & Polish** — shipped 2026-07-31 — [`milestones/v1.2-ROADMAP.md`](milestones/v1.2-ROADMAP.md)
- ⬛ **v1.3 The Game Comes Alive** — **CLOSED AS SUPERSEDED 2026-08-18.** Four of five phases shipped and are live. The fifth ("The Board Comes Alive") is **retired unbuilt** — `4/` built drifting wind and whirlpools independently, and v1 is being retired to `/classic`. Archive: [`milestones/v1.3-ROADMAP.md`](milestones/v1.3-ROADMAP.md)
- 🚧 **v2.0 The New Game** — Phases 1–9 (in progress)

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): planned milestone work
- Decimal phases (2.1, 2.2): urgent insertions, executed between their surrounding integers

### 🚧 v2.0 The New Game (In Progress)

**Milestone Goal:** Make the `4/` redesign the official Pastry Pirates — with multiplayer restored,
a real desktop layout, and the safety net and written record the prototype skipped. It is a **one-way
cutover, not a merge**: `4/` forked 2026-08-11 and the repo root has had no code commit since
2026-08-02.

- [ ] **Phase 1: Before the Engine Freezes** - The clock preference stops leaking between the two games, the biggest new module becomes testable, and the one new rule lands — so nothing after this forces the determinism corpus to be recorded twice
- [ ] **Phase 2: Multiplayer Revival** - The Firebase tags come back and a host and guest play a full networked voyage with the bake-off switched off — which measures what is really broken before the large work is planned
- [ ] **Phase 3: The Safety Net** - A determinism corpus for the v2 engine, the contract gates pointed at the tree being promoted, and host/guest parity gated rather than remembered
- [ ] **Phase 4: The Networked Bake-off** - The finish line of the game works over the wire, and every other captain watches the bake live on the same face-down bench instead of reading "waiting…"
- [ ] **Phase 5: Trade Over the Wire** - A multi-captain trade completes inside one turn, counter-offers cross the wire, and a guest gets the same controls as the host
- [ ] **Phase 6: The Cutover** - `playpastrypirates.com` serves the new game, today's game keeps playing at `/classic`, and nothing that identifies the live site exists in more than one tree
- [ ] **Phase 7: The Board Fits** - The whole board is visible on a laptop and the director stops cropping the choices it is asking the player to make
- [ ] **Phase 8: A Desktop Worth the Width** - Captains in a right-hand column, controls sized for a mouse, hover and focus alive, art that holds up at a big size
- [ ] **Phase 9: The Written Record** - The rules of the official game rewritten from the code, and ~40 rulings, 13 approved copy strings and the rejection graveyard lifted out of commit bodies

## Phase Details

### Phase 1: Before the Engine Freezes

**Goal**: The development build stops harming the live game, the largest new module becomes testable, and the last gameplay rule lands — so that nothing after this point forces the v2 determinism corpus to be recorded twice.
**Depends on**: Nothing (first phase)
**Requirements**: FIX-01, TEST-01, TEST-02, RULE-01, RULE-02, FIX-06
**Success Criteria** (what must be TRUE):

  1. The new game still defaults its turn clock OFF — that is intentional — but it stores that preference under its **own** key, so a player who opens it no longer has the clock switched off in the **other** game, and a host who visited it no longer pushes that setting to everyone in their room.
  2. `4/src/ui/stage.js` imports under Node without throwing, and `4/scripts/no_undef_check.js` exits 0 — so the 1,545-line stage layer can be tested headlessly at all.
  3. A captain who passes receives one dubloon, at every one of the three `{t:"pass"}` emission sites — human menu, flow, and the bot fallback. Bots pass, so bots are paid.
  4. The pass narration tells the captain they were paid, in **both** the addressed and third-person renderings, across all 50 sea-creature entries.
  5. The engine ships exactly one bot planner — the unreachable `planTurnClassic` subtree is gone, so no future tuning pass can aim at code that never runs.

**Plans**: 5/6 plans executed

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — TRACER: the first gate in this repo that loads `4/` runs green (TEST-01, TEST-02)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — The clock preference stops leaking into the live game (FIX-01)
- [x] 01-03-PLAN.md — One-brain ladder rewrite, and the balance baseline captured before the dubloon (FIX-06)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — Passing pays a dubloon, and the narration says so (RULE-01, RULE-02)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — The dead bot planner is deleted; the engine ships one brain (FIX-06)

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 01-06-PLAN.md — D-07's balance gate: measure after, report the delta, ask Wyatt, ship the stamp (RULE-01, FIX-06)

**Wave order.** 1: 01-01 · 2: 01-02, 01-03 (parallel) · 3: 01-04 · 4: 01-05 · 5: 01-06.
The ordering is forced by D-07: the balance baseline must be measured on a tree where passing does
not yet pay, so the ladder rewrite (01-03) lands **before** RULE-01 (01-04), not after.

**Why these are one phase.** FIX-01 affects real players today and is independent of every
promotion decision — it does not wait for anything. TEST-01/02 unblock nearly all other TEST
work. RULE-01/02 and FIX-06 are the last changes to the engine before its behaviour is frozen by a
corpus. All five share one property: **everything here must land before Phase 3 records the
corpus.**

**Evidence.** `4/src/ui/stage.js:1478` writes the shared, un-namespaced `pp_timerOff`, read back by
the other game at `src/orchestrator.js:1399` and pushed to the room at `:1404-1405`. **Namespace the
key; do not touch the default** — defaulting the clock OFF in the new game is Wyatt's intent
(2026-08-18), and `4/` already namespaces `pp4_sess`/`pp4_solo`, so this key was simply missed. The bare
`addEventListener` at `4/src/ui/stage.js:190` throws `ReferenceError` at module-evaluation time.
Pass sites: `4/src/ui/flow.js:1861`, `4/src/ui/flow.js:2140`, `4/src/engine/index.js:2993`. The coin
treatment to reuse is `(+1🌕)` inside a `nobrk` span (G27/P7, `4/src/ui/flow.js:2231`). Dead planner:
`4/src/engine/index.js:2739-2875` plus `2085-2157`, `2048-2059`; `planTurn:2197` dispatches to v3
unconditionally.

**Balance note, flagged not blocking.** Paying for the always-available turn-ender creates a reason
to pass rather than act. It is measurable rather than arguable — re-run the race-planner ladder that
fitted on 27,867 outcomes and see whether pass-farming beats playing. Worth doing in this phase; not
worth debating first.

### Phase 2: Multiplayer Revival

**Goal**: `4/` can host a real networked voyage again — and playing one measures what is actually broken, rather than what the research predicted, before the large multiplayer work is planned.
**Depends on**: Phase 1
**Requirements**: MP-01, MP-02, MP-03, MP-10, MP-11, MP-12, FIX-03
**Success Criteria** (what must be TRUE):

  1. A player can host a game from the promoted build and share a room code; a second player can join by that code, claim a seat, and be named without collision.
  2. A host and a guest play a full voyage with `?bakeoff=0` and the guest's board, ships, narration and prompts stay in sync throughout — including the recipe draft, which crashes every guest today.
  3. Hiding or backgrounding a tab does not pause or resume the shared clock for everyone else, and fast-forward cannot skip narration another player is still watching.
  4. A host who reloads mid-voyage comes back to the same game, resumed from the decision log — not a board reset to turn 1.

**Plans**: TBD

**This is a revival, not a rebuild.** `4/src/net/{readers,registry,watchers,writers}.js` are
**byte-identical** to the live net layer; `index.js` differs by 5 lines (a `typeof firebase` guard).
All ~45 networking functions survive in `4/src/orchestrator.js` and several were *upgraded* while
the tags were off. What was removed is two `<script>` tags (`4/index.html:28-30` says so and says
how to restore them) and the two welcome cards `#choiceHost` / `#choiceJoin`; the wiring is guarded,
not deleted (`4/src/ui/flow.js:2367-2370`).

**FIX-03 is not optional here.** `4/src/orchestrator.js:1591` calls `.forEach` on a Firebase node
that is normally an object, not an array — the sparse mid-draft shape is the *expected* one, so
every guest crashes during the recipe draft. Criterion 2 cannot pass without it. Same phase:
the unguarded `.val()` at `:1501` (the correct guard exists 15 lines above at `:1486-1488`) and the
unescaped host HTML at `:1239-1245` (`esc()` already exists at `4/src/ui/util.js:1612`).

**Keep the tab-hide gate exactly where it is.** `4/src/main.js:148` writes the *shared* `paused`
node and is safe today only because it sits behind `ui.soloBotGame()`. Loosening that gate is how
one player backgrounding a tab pauses the whole table.

**This phase produces a finding, not just a feature.** Write down what actually broke — guest-side
rendering of the new stage (`4/src/ui/stage.js`, never executed on the guest tier), the rim sweep on
the guest (`4/src/orchestrator.js:1210`), the greyed-button reasons (`:1262-1273`). Phases 4 and 5
are scoped from that list.

### Phase 3: The Safety Net

**Goal**: The game being promoted gets the mechanical guarantees v1 had — before the largest piece of work in the milestone is built on top of it.
**Depends on**: Phase 2
**Requirements**: TEST-03, TEST-04, TEST-05, TEST-06, TEST-07
**Success Criteria** (what must be TRUE):

  1. `npm test` covers the game being promoted and states its gate count in `package.json` — a green run finally says something about `4/`.
  2. A determinism corpus exists for the v2 engine and verifies green, captured **once**, after the pass dubloon landed.
  3. The engine, module-graph, net, state and UI contract gates all run against the promoted tree, so its currently-clean layering is guarded by a gate rather than by discipline.
  4. Host/guest parity fails the build when it breaks, instead of being noticed in a playtest.
  5. No comment in the tree claims a check gates it when that check does not exist.

**Plans**: TBD

**Why the safety net comes before the bake-off, not after.** Root `npm test` runs 21 gates and
**not one of them loads `4/`** — the exact "gate scanning the wrong tree is not silent, it is
reassuring" trap in `docs/HARD-WON-LESSONS.md` §3. The gates this phase ports —
`net_contract_check`, `net_registry_test`, `dlog_replay_test`, `host_guest_parity_check`,
`determinism_baseline` — are precisely the ones that guard the work in Phases 4 and 5. Building them
afterwards means the biggest work in the milestone was done unguarded.

**HARD CONSTRAINT — the corpus is a one-way door.** `docs/DETERMINISM-RERECORD.md`: capture exactly
once; never weaken `REQUIRED_EVENT_TYPES`. Once criterion 2 lands, **Phases 4 and 5 must not change
what `4/src/engine/index.js` emits into the event stream — including adding a field to an existing
event.** The research says they should not need to (the bake-off's engine half is already
replay-safe and logs the guess plus coins spent as *one* decision, `4/src/ui/flow.js:601-609`; the
trade-pacing options are explicitly constrained to preserve decision-log order). If either phase
finds it needs an engine change, **stop and re-scope** — do not spend the one-way door.

**Decide before capturing:** `docs/DETERMINISM-RERECORD-NEXT.md` queues three engine/UI purity fixes
(`spoil` carrying rendered text, `gave` carrying `price+" coins"`, `ilabelImg` imported into the
engine tier) that `4/`'s descendant engine likely inherits. In v1 they were queued because a
re-record was expensive. **With no fixtures yet, that reason disappears** — landing them before
capture is free, and capture freezes whatever is there.

**Also in scope:** `4/scripts/lib/` is a byte-identical duplicate of `scripts/lib/` and will drift
the moment either is fixed. TEST-07's two dangling citations are `4/src/orchestrator.js:880` and
`4/src/ui/util.js:1484`, both naming checks that do not exist in `4/`.

### Phase 4: The Networked Bake-off

**Goal**: The finish line of the game works over the wire — a player bakes on their own screen, and everyone else watches it happen instead of reading "waiting…".
**Depends on**: Phase 3
**Requirements**: MP-04, MP-05, MP-06, MP-13
**Success Criteria** (what must be TRUE):

  1. A player takes their own bake-off turn on their own screen in a networked game — the host no longer plays it for them, and no captain's bake is silently handed to the bot.
  2. Every other captain **watches the bake live** — the shuffle, each pick landing, locks earned, wrong guesses reshuffling — on the same **face-down** bench the baker sees. Nobody sees `⏳ Waiting for {name}…` at the finish line any more.
  3. A player can pay to re-watch the shuffle mid-bake-off and see their purse drop, without the prompt closing.
  4. A host who reloads during the bake-off replays the voyage to the same finish — the bake still logs as one decision per captain.
  5. The bake-off runs with no shot clock, and a captain who drops mid-bake does not stall the table.

**Plans**: TBD
**UI hint**: yes

**This is the single largest piece of work in the milestone, and the blocker is concrete.** Today's
`prompt` node carries **only labels and flags** — `{kind:"ask", msg, labels, colors, classes,
disabled, why, sub, flip, flipIdx, back, battle}` — and the bake-off is a bench of five bowls that
shuffle with animated arcs, are tapped to name, and reveal one at a time (`4/src/ui/bakeoff.js`,
527 lines, `playBakeoffLive` at `:197`). `4/src/ui/flow.js:584-588` documents the deliberate absence
of a remote branch: *"NO decisionIsLocal BRANCH, deliberately… A remote branch here would be a path
no test can reach and no player can trigger, whose only behaviour is to hand somebody's bake to the
bot without saying so."*

**Criterion 2 got EASIER on 2026-08-18, and this note replaces the opposite instruction.** The
original MP-05 required hiding bowl contents, which meant inventing a private per-seat channel — the
single hardest thing in the milestone. Wyatt reversed it: *"how hard would it be to let other players
watch the bakeoff, instead of just see a standard 'waiting for {Player} to decide' note? that seems
like a better design."*

**The spectator channel already exists, and the bake-off already writes into it.** `rooms/<C>/battle`
is host-written (`4/src/orchestrator.js:378`), watched by every guest (`watchBattle`, `:381`), and
rendered by `renderBattleFromSnap` — it updates many times per fight, so it is a live stage, not a
one-shot. `battleSnapshot` already carries a `title` for a bake-off snapshot and `asyncBakeoff` is
its only producer anywhere in the repo. The bake-off is **muted by one guard** at `:396`, whose
comment says: *"un-silencing the bakeoff is a design call belonging to Wyatt, not a side effect of
this timing fix — the bakeoff stays exactly as silent as it is today."* A previous session hit this
question, declined to decide it, and left it for him. This phase is that decision landing.

**The work, concretely:** `battleSnapshot` (`4/src/ui/flow.js:2252`) whitelists 15 battle-shaped keys
(`round, a, d, atState, dfState…`); a watchable bench needs bake-shaped ones instead — bowls, which
are locked, which bowl is being touched, attempt count, rewatches — plus a bench renderer beside
`renderBattleFromSnap`. Since MP-04 already puts the baker's picks in motion between host and guest,
the state to broadcast is already travelling.

**There is no competitive leak to protect.** Each captain bakes their own recipe on their own
shuffled bench (`newBake(order)`, `4/src/engine/bakeoff.js:39`), so seeing a rival's bowls teaches
nothing about your own. The earlier "hidden information" framing was structural, not competitive.
**Face-down, not face-up** — the watcher sees the same puzzle the baker does and can be wrong too;
face-up costs the same and removes all tension. Both are recorded in REQUIREMENTS.md Out of Scope.

**Criterion 3's cheap answer is already in the tree.** The response channel is one reply per prompt,
so a guest cannot say "I bought a look" and keep the prompt open. Folding the re-watch count into
the single reply and settling at the end matches what replay already does at
`4/src/orchestrator.js:908-912` — and keeps criterion 4 true for free.

**The bake-off gets NO shot clock (Wyatt, 2026-08-18) — and that is why criterion 5 exists.** Today
`bakeoffPrompt` wraps the bake in `withShotClock` (`4/src/ui/flow.js:604`) and an expiry forfeits to
the engine's own fallback guess. **Removing the clock removes that safety net**, so a captain who
closes their tab mid-bake would hang the table forever with no timer to rescue it. The fallback must
therefore fire on **presence loss** instead — the room already tracks presence (`watchPresence`), so
the trigger changes, not the mechanism.

**Whatever fires the fallback must still write one decision to the log.** Expiry currently writes a
default into the decision log (`4/src/orchestrator.js:1104-1110`), and that is the only reason a
wall-clock event does not destroy determinism. A disconnect-driven fallback must keep that property:
one entry, both facts (guess and coins spent), exactly as `4/src/ui/flow.js:601-609` does today.
**Note this is a UI/orchestration-tier change** — Phase 3's corpus is already captured by this point,
so it must not alter what the engine emits.

### Phase 5: Trade Over the Wire

**Goal**: A multi-captain trade works, paces, and gives a guest the same controls as the host.
**Depends on**: Phase 4
**Requirements**: MP-07, MP-08, MP-09
**Success Criteria** (what must be TRUE):

  1. A player can make and receive counter-offers in a networked game, including a counter that replaces the give side with a crate ("keep yer coin, I want yer milk").
  2. A guest gets the same coin control as the host — or the stepper fallback is a decision Wyatt made and recorded, not an open hole flagged in the code.
  3. A trade that reaches three other captains resolves inside one turn, without the rest of the table watching a "…is deciding" line for over two minutes.
  4. The decision log records the same entries in the same order however a trade was routed, so a host reload still replays.

**Plans**: TBD

**Better news than expected on MP-07.** The whole counter-offer loop already goes through `ask()`
(`4/src/ui/flow.js:1591`), so it routes remote correctly with no changes — this criterion is mostly
verification, and it is the cheapest thing in the phase.

**MP-08 is a decision before it is work.** `4/src/ui/util.js:1437-1442` flags it in the code:
*"threading a live control through that contract is a large change for a mode /4 does not ship …
and this must be closed if /4 ever ships online multiplayer."* The stepper fallback at `:1451`
already works and already logs identically (`logQuantity`, `4/src/ui/flow.js:1441`), so **accepting
it is a legitimate answer** — it just means a guest gets a visibly worse control than the host.
Wyatt's call, and it should be asked with a measurement attached.

**MP-09 is the real work, and it has a wall.** One player's trade currently asks up to three other
seats *in sequence*, each on its own 30-second shot clock, then asks the original player again —
roughly five sequential round trips inside one turn. The right fix is per-seat parallel prompts, for
which `draftPrompts/<seat>` is the working precedent — **but it must collect in fixed seat order so
the decision log stays stable.** A log whose length or order depends on routing only replays under
the same routing (`4/src/ui/flow.js:1432-1436`).

**Read `docs/TRADE-SYSTEM.md` before touching anything that trades.** It is self-declared canonical,
it is `4/`-native, and the "NOTHING IS A CONSTANT" rule was earned twice in one day in this
subsystem.

### Phase 6: The Cutover

**Goal**: `playpastrypirates.com` serves the new game, every bookmark still works, and exactly one deployment claims to be the live site.
**Depends on**: Phase 5
**Requirements**: CUT-01, CUT-02, CUT-03, CUT-04, CUT-05, CUT-06, CUT-07, CUT-08, FIX-02, FIX-04, FIX-05
**Success Criteria** (what must be TRUE):

  1. Visiting `playpastrypirates.com` plays the new game — every image resolves, the About page opens, the page title is the game's name, and search engines are allowed in.
  2. A bookmark to today's game still works at `/classic`, and a returning player's saved voyage and preferences survive the move.
  3. `CNAME`, `robots.txt` and `sitemap.xml` describe exactly one live deployment and exist in exactly one tree; `v2/`, `v2bakeoff/` and `3/` are gone from the working tree.
  4. No URL a player can type skips the voyage or opens a developer tuning panel.
  5. A storm has been measured on a real Safari device on the promoted build, and the wind-dot loop ships at a default someone chose.

**Plans**: TBD

**HARD CONSTRAINT — this is one-way.** `4/` forked 2026-08-11; the root has had no code commit since
2026-08-02. There is nothing to merge and no fix is stranded — but it also means **every fix made
after this phase has to be made in the new tree.**

**Promotion mechanics are load-bearing, not cosmetic.** `4/index.html:10` carries
`noindex, nofollow` (correct at `/4`, **de-indexes the live game at root**); `:11` still reads
`Pastry Pirates — v3 bot test`; `ASSET_BASE="../assets/"` (`4/src/shared/index.js:24`) resolves art
one directory *above* the app, and there are 16 more `../assets/…` literals in `4/index.html`;
`about.html` links at `:1829` and `:2163` already 404 at `/4`; `robots.txt` carries
`Disallow: /4/`. Each of these is trivial and each will break something visible if missed.

**`CNAME` never leaves.** Two separate sessions have come within one command of taking the live game
down by copying it. `robots.txt` and `sitemap.xml` are the same hazard in different clothes. See
CLAUDE.md — this is not a style preference.

**Criterion 5 is a gate, not a courtesy.** The BUG-01 Safari storm fix is verifiably intact and
byte-identical in `4/src/ui/board.js:488-564` — but the headroom it bought has been spent: the rain
overlay is now full-viewport rather than a boxed board (~5× the paint area, `4/index.html:1423`), a
60fps camera tween runs *during* storms (`4/src/ui/stage.js:1515`), and narration types at
`msPerChar=9` against live's 20. **Nothing in `4/` has ever been measured on Safari.** FIX-05 is the
adjacent decision: `4/src/ui/board.js:570` ships the wind-dot prototype `true` at 20 dots where live
deliberately ships `false` at 10, on a permanent 60Hz rAF loop that reads layout every frame.

**FIX-02's flags are player-reachable.** `?ovens=1` (`4/src/shared/index.js:415`) fills human
captains' holds and skips the entire 16-day voyage; `?windhud=1` (`4/src/ui/board.js:594`) opens a
tuning panel. Decide separately whether `?bakeoff=0` stays reachable — its own comment calls it
*"A ROLLBACK SWITCH, NOT A TUNING KNOB"*.

**The gates move with the tree.** Phase 3's gates are pointed at `4/`; this phase re-points them at
the repo root. A green `npm test` against the game at the root is this phase's own precondition for
declaring the cutover done.

### Phase 7: The Board Fits

**Goal**: The whole board is visible and playable on a laptop, and the director stops cropping the choices it is asking the player to make.
**Depends on**: Phase 6
**Requirements**: DESK-01, DESK-02, DESK-08
**Success Criteria** (what must be TRUE):

  1. On a 1440×900 laptop the whole 15×15 board is on screen without dragging — 5.9 of 15 rows are visible today, and 6.5 of 15 at 2560×1440.
  2. Every highlighted sail square, and both captains in a battle, are on screen when the game asks about them — on any wide display.
  3. The phone layout is visually unchanged: the camera change costs the phone nothing.

**Plans**: TBD
**UI hint**: yes

**Why this is separable, and why it is first.** `/4` is not a page with a layout — it is a camera
pointed at a square board, and it takes its shape from the window's.
`4/src/ui/stage.js:227-229` sets the camera's height by multiplying its width by the window's aspect
ratio, and the only line that ever rescues the full board (`if (h > 640) h = 640`) can fire only
when the board strip is taller than the window is wide. The condition is roughly *window height ≥
window width + 333px*. **No desktop window on earth satisfies it**, so double-click-to-fit
(`stage.js:319-323`) is mathematically unable to succeed. Every other desktop path needs this fixed
first; on its own it turns "broken" into "playable".

**Criterion 2 is a functional break, not a cosmetic one.** `camFitSail()` (`stage.js:94-107`)
carries the promise *"a legal move is never off screen"* and fits a **square** around the
highlighted cells (`camFitCells`, `:80-91`) with no vertical check. On landscape that square renders
at ~40% of its height, so it hides choices the player is being asked to make. `camFitSeats()`
(`:109`) has the same fault for battle framing.

**Criterion 3 is the gate on this phase.** The camera is shared code — it *is* the phone layout —
so this is where a phone regression is most likely, and 23 numbered playtest rounds of mobile tuning
are what is at risk. `preserveAspectRatio="xMidYMin meet"` is already set at `stage.js:937`.

### Phase 8: A Desktop Worth the Width

**Goal**: On a wide screen the game reads as designed for one, rather than as phone chrome dropped onto a big canvas.
**Depends on**: Phase 7
**Requirements**: DESK-03, DESK-04, DESK-05, DESK-06, DESK-07
**Success Criteria** (what must be TRUE):

  1. On a wide screen the captains occupy a right-hand column instead of a 2560px band, and no piece of furniture stretches the full width of the window.
  2. Controls are sized and placed for a mouse rather than a thumb — and moving the mouse over a prompt button visibly responds.
  3. The board can be panned and zoomed with a mouse and trackpad, the cursor says the board is draggable, and a keyboard user can see what is focused.
  4. Board and boat art is crisp on a high-resolution display at the sizes the desktop layout actually draws them.

**Plans**: TBD
**UI hint**: yes

**Wyatt's decided answer is true widescreen, not a centred phone column.** "A centred phone column on
desktop" is recorded in REQUIREMENTS.md **Out of Scope** so the letterbox option is not revived as a
schedule saver.

**Two things are already paid for.** v1's two-column `layoutWide` grid survives intact at
`4/index.html:135-141`, and `syncBoardSizing()` (`4/src/ui/board.js:2031`) still runs on every
resize — the house has solved board-plus-sidebar once. And `boardBand()`
(`4/src/ui/stage.js:466-472`) is the *single* definition of "where the board is visible", with three
consumers, added deliberately as a rule rather than a patch: teaching it a horizontal variant is one
function, not thirty.

**The piece that decides whether this looks designed or stretched is a scale unit.** There are ~60
hardcoded furniture pixels — 66px action circles and 70px bloom radius (`stage.js:1157`), 290px
narration bubbles (`:576`), a 250px captains band (`:221`), 12.5px wind-pill text
(`index.html:1518`) — and none of them scale. The build has **zero** `min-width`, orientation,
`(hover: hover)` and `(pointer: fine)` queries; the one container query at `index.html:269` is the
correct pattern, used once.

**Criterion 2's hover bug is a specificity bug, not a missing feature.** `#pp4Prompt.radial .apBtn`
(1-1-1, `index.html:1484`) beats `.apBtn:hover` (0-2-0, `index.html:453`), so hover is dead on every
prompt button. Same for `#pp4Prompt.pp4Center .apBtn` and `.apBack`.

**Criterion 4 is a re-export job, and one number needs deciding.** Boats are 136×221 sources drawn
at up to 3.4× — the worst ratio in the set, and they are on screen at all times. `board.png` is
2132×2132 and **already 4.5 MB**; re-exporting at 4096² is roughly 16 MB on a game with no build
step and no image pipeline. Put the measurement in the question.

### Phase 9: The Written Record

**Goal**: The rules of the official game describe the game the code actually plays, and the reasoning that only exists in commit bodies survives a directory rename.
**Depends on**: Phase 6 (may run in parallel with Phases 7–8)
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05, DOC-06, DOC-07
**Success Criteria** (what must be TRUE):

  1. A reader can learn the actual rules of the shipped game from one document — including the bake-off, the black market and its 2-crate barter price, and dock heads at 5 not 6.
  2. The ~40 design rulings, the 13 copy strings approved on 2026-08-14, and the rejection graveyard are readable in `docs/` without git archaeology.
  3. Every doc that addresses `v2/`, `v2bakeoff/` or `3/` points at the promoted tree instead — including `docs/DRIVING-THE-GAME.md`'s import paths, so a playtest probe cannot inject state into the wrong copy.
  4. `README.md` describes the promoted game and the `/classic` URL.

**Plans**: TBD

**This is the milestone's insurance against the next session re-running a settled argument.** It runs
late; it must not be dropped. `READ THE GRAVEYARD` is a standing CLAUDE.md rule precisely because
re-proposing a rejected design costs a cycle — and the graveyard (rim routing, wind-aware routing,
three hail-reach shapes, two forecast-on-dial designs, the harbormaster 2-for-1) currently exists
only in `git log -- 4/`, which **a directory rename or a squashed merge would sever.**

**`4/RULES-V2.md` must not ship as the rules of the official game.** It is byte-identical across
`v2/`, `v2bakeoff/`, `3/` and `4/`, was copied in on 2026-08-11 and never edited, and its own header
still says *"Lives in `v2/`"*. Three of ten spot-checked rules disagree with the code, and they are
not typos: a changed economy constant (`dockHeads:5`), an entire undocumented mechanic (the black
market at `blackMarket:10` plus `barterCrate`), and §12 titled **"No bakeoff"** while the bake-off
is the shipped default.

**Write it from the code, not from the old doc.** The healthy `4/`-native specifications already
exist and should be pointed at rather than restated: `docs/TRADE-SYSTEM.md`,
`docs/BOARD-RENDERING.md`, `docs/BOT-V3-RACE-PLANNER.md`, `docs/BOT-DESIGN-PRINCIPLES.md`. Point,
don't restate — a pointer cannot go stale; a copy always can.

---

## Hard Constraints (gates, not preferences)

1. **Multiplayer → cutover → desktop.** The live game must never lose multiplayer, so `4/` stays
   served at `/4` until it can host a networked game. Desktop work happens **after** the cutover, on
   the promoted game.

2. **RULE-01 lands before TEST-03 records the corpus.** Paying a dubloon changes what the engine
   writes into the event stream, invalidating any corpus recorded before it. Recording first means
   recording twice — the same one-way cost that shaped v1.2's Phase 14
   (`docs/DETERMINISM-RERECORD.md`).

3. **Once the corpus exists, nothing may change what `4/src/engine/index.js` emits** — including
   adding a field to an existing event. If a later phase finds it needs an engine change, **stop and
   re-scope.**

4. **Exactly one new gameplay rule this milestone.** Passing pays a dubloon (RULE-01/02), granted by
   Wyatt 2026-08-18. A second exception costs a re-record and a re-write of the spec being derived
   from the code — raise it as a v2.1 candidate, not as scope creep here.

5. **`CNAME`, `robots.txt` and `sitemap.xml` never leave this tree.** Copying any of them to another
   repo or deploy target can take the live game down for real players.

6. **Bot/human parity is a standing design invariant.** Bots play by exactly the same rules and have
   exactly the same affordances as humans; they differ only in *how they choose*. Any "should bots
   be allowed to…?" is already answered — and when the two sides differ, levelling the human *up* is
   frequently the right answer.

7. **Safari is a supported platform and has never been measured on `4/`.** Criterion 5 of the
   cutover phase is a gate on promotion.

## Execution Order

Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8, with **the written-record phase free
to run in parallel with the two desktop phases** once the cutover has landed.

The first phase is independent of every promotion decision and can start immediately.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Before the Engine Freezes | 5/6 | In Progress|  |
| 2. Multiplayer Revival | 0/TBD | Not started | - |
| 3. The Safety Net | 0/TBD | Not started | - |
| 4. The Networked Bake-off | 0/TBD | Not started | - |
| 5. Trade Over the Wire | 0/TBD | Not started | - |
| 6. The Cutover | 0/TBD | Not started | - |
| 7. The Board Fits | 0/TBD | Not started | - |
| 8. A Desktop Worth the Width | 0/TBD | Not started | - |
| 9. The Written Record | 0/TBD | Not started | - |

## Requirement Coverage

**51 of 51 v2.0 requirements mapped to exactly one phase. No orphans, no duplicates.**

| Phase | Requirements | Count |
|-------|--------------|-------|
| 1. Before the Engine Freezes | FIX-01, TEST-01, TEST-02, RULE-01, RULE-02, FIX-06 | 6 |
| 2. Multiplayer Revival | MP-01, MP-02, MP-03, MP-10, MP-11, MP-12, FIX-03 | 7 |
| 3. The Safety Net | TEST-03, TEST-04, TEST-05, TEST-06, TEST-07 | 5 |
| 4. The Networked Bake-off | MP-04, MP-05, MP-06 | 3 |
| 5. Trade Over the Wire | MP-07, MP-08, MP-09 | 3 |
| 6. The Cutover | CUT-01…CUT-08, FIX-02, FIX-04, FIX-05 | 11 |
| 7. The Board Fits | DESK-01, DESK-02, DESK-08 | 3 |
| 8. A Desktop Worth the Width | DESK-03, DESK-04, DESK-05, DESK-06, DESK-07 | 5 |
| 9. The Written Record | DOC-01…DOC-07 | 7 |
| **Total** | | **50** |

By category: MP 12/12 · CUT 8/8 · DESK 8/8 · DOC 7/7 · TEST 7/7 · FIX 6/6 · RULE 2/2.

Per-requirement mapping: [`REQUIREMENTS.md` § Traceability](REQUIREMENTS.md).

## Backlog

Carried forward from v1.x. Not v2.0 scope; not dropped either.

### Phase 999.1: Resume restores exact narration step on reload (BACKLOG)

**Goal:** [Captured for future planning] On page reload mid-game, resume rebuilds state by replaying the recorded decision log with narration suppressed (`appState.replaying`), landing the player back at their own next turn with all already-decided bot turns silently re-applied — no narration shown for them. The player expects to return exactly where they left off, so it feels confusing. Ideal: resume restores the exact narration/animation step that was on screen at reload time. Not a regression and not a fairness exploit (replay only re-runs already-made decisions); it would require persisting the transient narration cursor in the save blob, which the decision-log model deliberately does not capture. Surfaced during v1.2 Phase 13 CLOCK-01 UAT.
**Requirements:** TBD
**RE-ASSESS AGAINST THE v2 ENGINE BEFORE PLANNING.** The captured implementation notes name v1 paths (`src/orchestrator.js` `resumeSoloGame`/`resumeHostGame`). `4/` has its own resume path and already improves on live at `4/src/orchestrator.js:1697-1703` — a three-way outcome that distinguishes "read threw" from "no saved game" instead of silently resetting a voyage to turn 1. The problem may be smaller than captured, or differently shaped.
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with `/gsd-review-backlog` when ready)

**Also retired, recorded so it is not re-proposed as new:** the v1.4 sketch "Phase 26 — Narration
Pacing" (NARR-07: the game loop must not wait on narration, 27 awaited `flash()` call sites). v1.4
will not now happen, and `4/` restructured narration into speech bubbles with its own scheduler. If
the underlying complaint recurs, it is a fresh v2.x candidate against the new tree, not a resumable
plan. Original text: [`milestones/v1.3-ROADMAP.md`](milestones/v1.3-ROADMAP.md) § Backlog.

---
*Roadmap created 2026-08-18 for v2.0 "The New Game". Phase numbering restarts at 1 per Wyatt's
decision; v1.x phase detail is archived in `milestones/`.*
