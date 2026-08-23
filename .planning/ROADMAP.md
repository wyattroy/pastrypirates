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

- [x] **Phase 1: Before the Engine Freezes** - The clock preference stops leaking between the two games, the biggest new module becomes testable, and the one new rule lands — so nothing after this forces the determinism corpus to be recorded twice
- [ ] **Phase 2: Multiplayer Revival** - The Firebase tags come back and a host and guest play a full networked voyage with the bake-off switched off — which measures what is really broken before the large work is planned
- [ ] **Phase 02.15: One Log, One Display Path** *(inserted)* - The game is displayed from one place according to one set of rules, on every screen — the host draws from the event log like a guest and the scrubber already do, and Firebase becomes a copier rather than a second way of finding out what happened
- [ ] **Phase 3: The Safety Net** - A determinism corpus for the v2 engine, the contract gates pointed at the tree being promoted, and host/guest parity gated rather than remembered
- [x] **Phase 4: The Networked Bake-off** - The finish line of the game works over the wire, and every other captain watches the bake live on the same face-down bench instead of reading "waiting…"
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

**Plans**: 6/6 plans executed

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

- [x] 01-06-PLAN.md — D-07's balance gate: measure after, report the delta, ask Wyatt, ship the stamp (RULE-01, FIX-06)

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
  5. A guest who closes their tab mid-voyage and reopens the page rejoins the same game, in their seat, without retyping the room code. *(Added by CONTEXT.md D-10 — this closes the open item Phase 1 deferred here.)*

**Plans**: 4/7 plans executed

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — the lights come back on: Firebase tags, four welcome cards, and one host-and-guest handshake (tracer)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — FIX-03's two crash sites: the sparse recipe draft and the vanished room
- [x] 02-03-PLAN.md — the two gates that must hold: no ⏩ in a crew game, and one hidden tab pauses nobody

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-04-PLAN.md — FIX-03's third site: whether host-supplied text really reaches a guest's panel as markup
- [ ] 02-05-PLAN.md — chat gets a home: a 💬 ribbon chip, a slide-up sheet, and a flash that obeys hold-the-sea

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 02-06-PLAN.md — the headless shakeout: a full voyage, a host reload, and a guest reconnect

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 02-07-PLAN.md — the finding, the one drop, and Wyatt's real voyage

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

### Phase 02.1: One Game, Every Captain — one render path for host and guest (INSERTED)

**Goal**: One render path for every captain. A guest sees the same game, drawn the same way, as the
player who opened the room — with host and guest differing only in who computes the voyage and who
creates the room.

**Why this exists — Wyatt, 2026-08-19**, reading the Phase 2 gate fixes: *"I don't understand why
your architecture is treating the host and the guest differently across the board. There should be
one architecture that displays things for every player regardless of whether there's a host or a
guest... the only thing that needs to be distinct is something quite invisible on the back end and
just the starting flow where someone makes a game."*

**The cause, confirmed in code, not inferred.** Every renderer reads `appState.game` directly. On
the host that is live truth. **On a guest it is a stale render shell** — a guest does not simulate
the voyage, it renders the state snapshot carried on each broadcast event
(`docs/DRIVING-THE-GAME.md` §5c, re-verified 2026-08-19). So `ribbonTick()` reading `g.round` is
why a guest's day counter sticks on DAY 1, and the director reading `game.players[mySeat].pos` is
why it cannot centre a guest's own boat and strands the radial buttons at the bottom of the screen.
**Every renderer is silently wrong for a guest**, which is why the symptom is "so many bugs in guest
mode" rather than a list of unrelated ones.

**The second copy, which the code already admits.** `4/src/orchestrator.js:1263` describes the
guest's button renderer as "a genuine second copy (host and guest render prompts from different
sources), so a change to one that skips the other reintroduces the bug on whichever side was
forgotten." Every field on that wire — `disabled`, `why`, `back`, `flipIdx`, and in Phase 2 `stage`
and `shorts` — was added only after someone noticed the guest was missing one. **Phase 2 added the
sixth and seventh. That is the pattern, not the cure.**

**Sequencing (Wyatt's ruling, 2026-08-19): fix the state layer FIRST**, so the game state tells the
truth on both sides, and let the render bugs fall out — rather than unifying one subsystem at a
time. Then delete the 43 host/guest branches across 7 files and the duplicate prompt renderer.

**Scope: everything a player sees** — the prompt panel, the ribbon and day counter, the
director/camera, narration. Also in scope by his pick: the flat-card bug where a greyed button's
`why` sentence containing a coin breaks its own label past the 16-character radial cutoff (hits host
and guest alike, reproduced deterministically), and **establishing a way to verify in Safari**,
which is what he actually plays and which nothing in this milestone has ever been tested against.
**Explicitly NOT in scope, his call:** the doubled flip sound, which never reproduced.

**The determinism ruling — Wyatt, 2026-08-19, and it overrides a standing default.** CLAUDE.md says
changing what the engine emits into the event stream invalidates the determinism corpus and forces a
gated re-record, and therefore to **prefer UI-tier fixes**. Asked directly whether that constraint
should shape this phase, he chose: **change the stream if that is the right design, and accept the
re-record as part of this phase's cost.** So the planner must design for correctness first rather
than contorting to protect the corpus — but the re-record is then in scope and must be planned,
sequenced and gated, not discovered late. If the existing snapshots turn out to carry everything
needed (they already carry positions and ingredients), taking the cheaper route is still fine — his
ruling removes the constraint, it does not mandate the expensive path.

**Requirements**: PAR-01, PAR-02, PAR-03, PAR-04, PAR-05, PAR-06, PAR-07
**Depends on:** Phase 2
**Blocks:** Phase 6 (The Cutover) — guest mode should be right before `4/` becomes the game real
players land on.
**Plans:** 3/4 plans executed

Plans:
**Wave 1**

- [x] 02.1-01-PLAN.md — the state layer: watchEvents() applies each event's own snapshot onto appState.game — the day counter, wind pill, and camera fall out with zero changes to any renderer (tracer, red/green proved) (PAR-01, PAR-02, PAR-03, PAR-04)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02.1-02-PLAN.md — the flat-card bug: emojify() stops corrupting attributes it runs across (PAR-06)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02.1-03-PLAN.md — one shared prompt renderer: the seat field crosses the wire, a red-proofed parity gate exists for the first time (PAR-05)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 02.1-04-PLAN.md — the one drop: `PP4_STAMP` `2026-08-19c` live at `/4`, and the first real-Safari
  check `4/` has ever had — Wyatt hosted room BVUR in Safari, Claude joined as a driven headless guest
  (PAR-07). **The gate returned a negative result and that is the point of it:** the state layer, day
  counter and radial bloom held live, and Wyatt hit turn-blocking trouble on both sides of the table.
  His ruling: close 02.1 on its own scope, open **Phase 02.2**. See `02.1-04-SUMMARY.md`.

  > **CORRECTION, same night, before anyone acted on it.** This row first read *"a guest draws no wind
  > pill, no clock pill and no chat bubble"*, and PAR-02 was reopened on that basis. **That claim was
  > asserted from a screenshot read during the opening ceremony, before it had been measured, and it
  > does not hold.** Re-measured twice against a local server with two real Chromes: host and guest
  > paint the ribbon, the clock chip and the chat bubble at the **same millisecond** (505ms), and the
  > wind pill at the same millisecond as each other (3018ms — the instant the first event carries wind
  > to show, correct on both tiers). Zero gap on every control. No width rule is involved either; the
  > only breakpoints in `4/index.html` are 600px and 480px and the window was 1100px.
  >
  > The first probe that "confirmed" it was itself broken: it tested visibility with
  > `offsetParent !== null`, which is **always null for a `position:fixed` element**, and `#pp4Pill`
  > is fixed — so that check reported the pill hidden on *both* tiers and could never have passed for
  > anyone. Fixed to measure the painted rectangle plus the computed styles that actually remove a
  > thing from view, and red-proofed against a control known-hidden by design (the ⏩ skip chip, D-04)
  > and one known-shown (☰).
  >
  > **PAR-02 therefore stands as delivered by 02.1-01** and is re-checked, not reopened. Evidence:
  > `02.2-FINDINGS.md`. Recorded here rather than silently edited, because a requirement marked
  > failed on a bad measurement rots exactly like one marked complete on a bad one.

**Wave order.** Strictly sequential, 1 -> 2 -> 3 -> 4. Plan 01 is the state-layer fix every later plan's
own verification assumes is already true (Wyatt's own sequencing ruling). Plans 01 and 03 both touch
`4/src/orchestrator.js`, which alone would force the later wave; the remaining plans stay linear rather
than parallel because every plan in this phase drives two-browser CDP sessions against local ports, and
running two of those concurrently risks the exact port/process collision CLAUDE.md's safety rules warn
about.

**A known scoping question this phase does NOT answer, by design.** `02.1-RESEARCH.md` Open Question 1
flags that a guest who reloads mid-voyage today rebuilds nothing locally until the next broadcast event
arrives. It is adjacent to this phase's fix but was never named by ROADMAP's own scope list (prompt
panel, ribbon, camera, narration, the flat-card bug, Safari verification) — raised here rather than
silently folded in or silently dropped, per the research's own recommendation.

### Phase 02.15: One Log, One Display Path (INSERTED 2026-08-20)

**Goal**: The game is displayed from **one place, according to one set of rules**, on every screen —
solo, host, or guest. Host and guest stop being two ways of drawing the same voyage.

**Depends on**: Phase 02.1
**Requirements**: PAR-14, PAR-15, PAR-16 *(minted in `REQUIREMENTS.md` 2026-08-20)*

> **This is Wyatt's architecture, in his words, and the numbering is deliberate.** `02.15` sorts
> between `02.1` and `02.2` — it lands **before** the rest of his twenty-two, which is his ruling:
> *"its own phase, and do it before the rest of 02.2."* He was told plainly that this delays every
> visible fix, including the one-line sound and narration wins, and chose it anyway.

**What he asked for**, 2026-08-20: *"the Gameboard should just be displayed according to a set of
rules… We make changes once, and they get propagated to both players. Regardless of whether they're
host or guests."* And on the architecture itself: *"the captain shouldn't be doing semaphore then —
he should be writing to a log. Then, if the game is multiplayer, that log is semaphored out to
Firebase; if playing solo/pass-and-play, the log is simply used to display the game."*

---

#### The shape

**The log already exists.** `Game.ev()` (`4/src/engine/index.js:316`) writes every event stamped with
round, wind and storm, and bakes in **a full snapshot of every captain** — position, coins,
ingredients, `done`, `baking`. A guest already draws from it. **The scrubber already draws from it.**

**And the principle is already in the code, applied to exactly one field.** The comment on that line:
*"`baking` rides in the snapshot so the board can render a captain's out-of-play state **from the
EVENT rather than from live state** — which is what keeps the scrubber honest when you drag it back
to before the ovens were lit."* Somebody hit this, solved it for the one field that was biting them,
wrote down exactly why it was right, and **it was never generalised.**

**So this phase is not "invent a log."** It is: **stop the host drawing from live state, and have it
draw from the log — as the guest and the scrubber already do.** Firebase stops being how a guest
learns things and becomes purely a copier that carries the log to other ships.

| Mode | Path |
|---|---|
| Solo / pass-and-play | log → display rules → screen. **No copier.** |
| Host in a crew game | log → display rules → screen. **And a copy goes out.** |
| Guest | copy arrives → same log → **same display rules** → screen. |

**The trap that makes the naive version wrong, and it must not be forgotten.** `runLiveNet()` drives
**solo and pass-and-play too** — the fork at `4/src/orchestrator.js:1654` is `if(appState.isHost)`,
and that is **true in solo, where there is no room at all**. `netSetPrompt` dereferences `db` with no
null guard (`4/src/net/writers.js:71`). **A host that reads its own screen back through Firebase
would take the single-player game down.** `watchChat()` escapes this only because chat is switched
off entirely in solo; the game display cannot be. **So the one director is a LOCAL dispatch both
tiers draw from — Firebase is transport for remote clients only.** A two-tab session cannot see this
failure by construction: **every stage must also be played solo.**

**How far `watchChat()` is a model, and where it stops.** Chat is fire-and-forget — nothing waits.
**A prompt blocks the host's loop on an answer** (`ask()` → `remotePrompt` → promise →
`sendResponse`). **That split is why most of this is cheap and one part is expensive**: the things
the game *tells* you convert easily; the thing that *asks* you and waits does not.

---

#### The seven divergences this phase closes

Read off Wyatt's own side-by-side screenshots (`notes/edits for pastry pirates 8-20.pdf`). **This
phase is done when a two-tab crew game — and a solo game — reproduces none of them.**

| His shot | Host shows | Guest shows |
|---|---|---|
| 17a — Ahoy | the message once, in the centre card | **the same message twice** — a dark top strip *and* the centre card |
| 17b — the wait | "⚓ Waiting for yer mateys…" | "⚓ Everyone's choosing their recipe…" |
| 17c — drawing lots | the text once | **the text twice** — a bubble behind, plus the card |
| 19 — waiting | **no narration at all**, board reads as dead | prompt still up |
| 20 — the director | camera parked elsewhere | camera centred on the active boat |
| 20 — sail window | **no sail squares** | sail squares highlighted |
| 21 — top-bar boats | updating with the turn | not updating |

> **An eighth row was removed from this table, and the REASON matters more than the removal.** The
> CAPTAINS panel showing a different order on each screen is **one rule, not two**.
>
> **The rule: whoever is looking sees their own captain on top** — so their recipe and their own
> progress are there without scrolling. Wyatt, 2026-08-09: *"resort the captains box with the
> currently active player at the top… currently they have to scroll down too far."* Wyatt again,
> 2026-08-20, correcting a session that had written this up as a sanctioned divergence: *"hosts and
> guests should NOT differ — the active player, whether host or guest, should always see their
> captain's name on top."*
>
> **That rule is IDENTICAL on every screen.** `seatOrderFrom(head)` (`4/src/ui/util.js:81`) rotates
> the sailing order so `head` sits first; `seatDisplayOrder()` (`:76`) passes `appState.mySeat`. One
> function, one rule, every client. **The output differs only because "me" is a different captain on
> each screen — and a rule that takes the viewer as an input is not two rules.**
>
> **So do not "fix" the ordering. And do not record it as an allowed host/guest exception either** —
> that framing is what this note exists to kill. Under this phase's architecture, *"host and guest
> differ"* is never an acceptable sentence; *"one rule, applied to whoever is looking"* is.
>
> **One real risk here, CANDIDATE and not measured.** `seatOrderFrom` falls back to raw seat index
> when `appState.turnOrder` is not yet known — and **turn order is computed only by the host's
> `runLiveNet()`; a guest receives it through `watchTurnOrder()`**, one of the nine listeners
> (`4/src/orchestrator.js:1655`, and see the comment at `:1691`). So a guest whose turn order has not
> landed yet would briefly show the raw seat order instead of itself on top. **That is the same
> two-directors fault feeding the same panel** — and it is fixed by this phase rather than separately.
> **Verify it in the two-tab session; do not pre-write a fix for it** (rule 6).

**Two of these are not rendering bugs at all — they are jobs only one side does.** `setActor` (which
marks whose turn it is) is called **six times in the host's game code and zero times in any of the
nine guest listeners**; every `__pp4` camera call is likewise host-only. **The guest has no director,
only a colour sniffed out of narration HTML.** That is items 21 and 20, exactly.

---

#### Write the rules down as you convert — Wyatt's pick, 2026-08-20

*"Yes — write them down as we convert."* As each thing moves onto the log, its display rule is
recorded in **one** document: **what the log entry is, what gets drawn, and how long it stays.**
Not written up front and not left to the end — **written in the same commit as the conversion**, so
it can never describe something that is not true.

This becomes the readable answer to *"how does this game display itself"*, and the thing Phases 4
and 5 conform to instead of imitating whatever the code happens to do.

---

**Success Criteria** (what must be TRUE):

- **There is ONE place that decides what is drawn, and every mode reads from it.** Not two paths kept
  in agreement — one path. **The audit question: what would have to be true for the host and a guest
  to disagree? The answer must be "nothing".**

- **A two-tab crew game reproduces none of the seven divergences above**, screenshotted on both
  sides — and **a solo game and a pass-and-play game still play start to finish.**

- **The parity gate runs against `4/` and would FAIL if the paths re-forked** — proven by having
  been seen red against today's tree first, not merely green after.

- **The display rules exist as a document**, written as each piece converted.
- **Nothing new is broken in the single-player game** — the mode with no room at all, and the one a
  two-tab test cannot see.

**Explicitly NOT in scope:**

- **A guest taking their own bake-off turn.** `bakeoffPrompt` (`4/src/ui/flow.js:565`,`:591`) has no
  remote path at all — left from when `/4` had no multiplayer, so today the guest's bench opens on
  the **host's** screen and the host bakes for them. **That is Phase 4's first success criterion
  already**, and this phase's rewrite will *not* sweep it up. Recorded here so it is not mistaken
  for a regression, and flagged to Phase 4 so it is not mistaken for new.

- Everything else on Wyatt's twenty-two — that is Phase 02.2, which follows this.

**Plans**: 2/2 executed. Verification verdict: **partial — gaps named under D-04** (`02.15-VERIFICATION.md`).

- [x] `02.15-01-PLAN.md` — one narration path, one active seat, the parity gate re-aimed at `4/`.
      Seven tasks. **Live as `PP4_STAMP` `2026-08-20b`.** Six of seven divergences closed.

- [x] `02.15-02-PLAN.md` — **THE PROMPT SEAM (the wide half)** — EXECUTED overnight 2026-08-21, live as `PP4_STAMP` `2026-08-20m`. Pick/sail channel converged (tracer); ask() parked at the flipMsg seam; battle not reached — both named, per D-04. Three whole voyages QA'd (crew/solo/pass-and-play). Was: converge the prompt ORCHESTRATION so
      the host draws its own prompt from the same "current prompt" a guest draws from, with only the
      response mechanism differing. Seven tasks, one whole fork per task, tracer-first on `pickCell()`.

> **The plan-02 work is NOT called "Stage 4".** Commit `b76983d` and a live code comment already use
> that label, truthfully, for the sail-window NARROW half. Two commits claiming the same stage is the
> exact ambiguity this phase exists to remove — `02.15-02` names its tasks by FORK instead.

**Stages 1, 2 and 3 landed. Stage 4 was deliberately not attempted** — D-04's safe stop, taken at
**six of the seven** divergences. Stage 4 is the prompt channel: it is the one that is not
chat-shaped, because a prompt **blocks the host's loop waiting for an answer**, and its failure mode
is a captain who cannot take their turn. It buys one divergence — the sail window — at the price of
the path every player uses on every turn. **Nothing was rolled back.**

| Divergence | Verdict |
|---|---|
| 17a Ahoy | **closed** — one card, no duplicate top strip |
| 17b the wait | **closed** — both screens read the same sentence at the same beat |
| 17c drawing lots | **closed by the same deleted line as 17a** — but the both-sides pair was never captured. Stated, not rounded up. |
| 19 waiting | **closed** — the wait line is *replaced* by the event that ends it, never faded on a timer |
| 20 director | **closed** — identical framing, camera on the active captain on both |
| 20 sail window | **NOT REACHED** — Stage 4 |
| 21 top-bar boats | **closed** — the active seat agreed 14/14 where it had disagreed 14/14 |

**The single-player game still plays**, verified independently after the fact — `room: null` with
`isHost: true`, which is precisely the case that would have crashed had the host been routed through
Firebase. Pass-and-play still gates the device. **Neither is visible to a two-tab check.**

**The parity gate** was seen **RED** before Stage 1 touched a line, naming `flash`, `setActor` and
`localAsk` at zero listeners. It ends **green against a declaration that still visibly names
`localAsk`** — the predicted safe-stop report, and the declaration was **not** widened to fake a full
green. **It still cannot see content parity:** whether two sentences *read* the same has no automated
check anywhere, and that is what the two-tab screenshots are for.

**Carried forward, none of it invented at the end:**

- **Stage 4 / item 20's sail window** — the remaining divergence.
- **Two unverified observations from a single solo screenshot** (CLAUDE.md rule 6 — one observation
  is not a reproduction): the "holds are empty" explanation appearing in *two* boxes at once, and a
  narration bubble reading *"Wyargh is choosing a recipe…"* shown to Wyargh himself in a solo game.
  **Neither reproduced** — a driver stalls on the two-tap recipe card, which is also where the
  executor's probe stalled. **Look for both during the next two-tab session; do not pre-write a fix.**

- `4/scripts/audio_map_check.js` **does not exist** — Group Q never built it, and this plan's Task 7
  referenced it. Still Group Q's job, still red-first.

- Task 3's verify asserted a `2550/8775` narration clamp. **Group Q's item 10 has not shipped**, the
  tree still reads `6750`, and it was correctly left alone rather than quietly changed to make a
  check pass.

### Phase 02.2: One Game, Every Captain — Wyatt's Twenty-Two (INSERTED, REWRITTEN 2026-08-20)

**Goal**: The game a player sees is the same game on both sides of the table, and the first screen is
free of faults visible at a glance.

> **This phase was rewritten on 2026-08-20, and the rewrite is the finding.** Its previous scope was
> ONE defect — a battle prompt that does not draw after a browser is killed mid-turn — which is still
> **one observation, never reproduced**, after three phases in which no probe has reached a battle.
> Meanwhile Wyatt played the game on his phone and wrote down **twenty-two** things he saw. The open
> phase was scoped to the least-confirmed item on the table while he held a list of things he had
> watched happen. His ruling, 2026-08-20: **his list becomes this phase**, and the battle-prompt
> defect becomes one line item inside it.
>
> **Source of record: `notes/edits for pastry pirates 8-20.pdf`** (13 pages, screenshots included).
> Read it before planning. Item numbers below are his numbers and must not be renumbered.

**The single most important thing in this phase — item 18, which is Wyatt asking a question.** *"You
were going to redesign the architecture of multiplayer so that guests and hosts are all shown with
parity, but not from two parallel code paths… Do you remember this work? Did this get done?"*

**The honest answer is HALF — but not the half this file first named.** Phase 02.1 unified the
**state layer** and that holds: a guest's boat positions match `events[last].state` for every seat.

> **CORRECTED 2026-08-20, at planning, before any plan was written.** This paragraph previously read
> *"it did not finish deleting the render branches — ~43 `isHost`/`isGuest`/`amHost` hits across 7
> files, 21 in `orchestrator.js` alone… that unfinished half is the direct cause of five of his
> twenty-two."* **All 45 hits were then read, one at a time, and that claim does not hold.** The
> count was real; the interpretation was not. Classified:
>
> | Where | Hits | What they actually decide |
> |---|---|---|
> | `orchestrator.js` | 21 | who writes to Firebase (`isHost&&db&&room`, 7×), who creates/joins/leaves the room and restores the session (10×), who runs the live sim, who applies end-meta, one comment |
> | `ui/util.js` | 13 | the **shot clock** — start/stop/pause/expiry, host-owned by design (D-05/D-06) |
> | `ui/panel.js` | 3 | one genuine render read (`:135`, whose clock state to draw), one host-broadcast seam, one comment |
> | `ui/flow.js` | 2 | solo and pass-and-play setup |
> | `state/index.js` | 2 | the field declaration and a comment |
> | `ui/lobby.js`, `main.js` | 2 | room creation; the tab-hide clock pause |
>
> **That is `CLAUDE.md`'s own sanctioned residue — "who computes the game and who creates the room" —
> plus the shot clock.** There is no seam of render branches to delete. A plan written to "delete the
> 43 branches" would find almost nothing to delete, or would delete host authority and take
> multiplayer down.
>
> **Wyatt's diagnosis in item 18 is nonetheless correct, and the measurement was pointed at the wrong
> noun.** The parallel code paths he names are real, and they are **narration call sites**, not
> `isHost` conditionals: the host renders "⚓ Waiting for yer mateys…" from `4/src/ui/flow.js:2211`
> while the guest is told "⚓ Everyone's choosing their recipe…" from `4/src/orchestrator.js:805`.
> One moment, two code paths, two different sentences — **which is exactly his screenshot 17b.**
> `netNarrate()` (`orchestrator.js:304`) likewise shows locally *and* broadcasts, which is where
> duplication (item 17) has to be looked for.
>
> **So the five items have five causes, and two are already traced to one line each** (see Group Q).
> They are not five patches over one hole; they are five separate faults that a wrong headline
> merged. Recorded here rather than silently edited: a requirement scoped from a bad measurement
> rots exactly like one marked complete on a bad one — the same lesson this phase already learned
> once, on 02.1's Wave 4 row above.

**Requirements**: PAR-08, PAR-09, PAR-10, PAR-11, PAR-12, PAR-13 *(added to `REQUIREMENTS.md`
2026-08-20 at planning — one per drop group, each phrased as a condition Wyatt could check by
playing)*

**Depends on**: **Phase 02.15** (One Log, One Display Path) — which absorbed this phase's
Group A and runs BEFORE it, on Wyatt's ruling.

**Plans:** 6/7 plans executed
already gone stale at 4/5 with six plans on the list; the checkboxes are the record).

Plans:

- [x] 02.2-08-PLAN.md

- [x] 02.2-01-PLAN.md — Group Q: the one-line wins (items 13, 10, 1, 14, 7), the 20/15 reproduction, and the sketches for 8 and 9
- [ ] 02.2-02-PLAN.md — Group A: one narration path and one director rule (items 17, 18, 19, 21, and 20/15 if Q could not reproduce them)
- [x] 02.2-03-PLAN.md — Group B: the faults visible on the first screen (items 2, 3, 5, 11, 22)
- [x] 02.2-04-PLAN.md — Group C: the bot that passes AND bakes (item 4) — **the one engine change in the phase**
- [x] 02.2-05-PLAN.md — Group C′: the economy, measured and reported (item 12) — **no game code changes, no stamp bump**
- [ ] 02.2-06-PLAN.md — Group D: design and copy (items 6, 16, and 8/9 if he has picked)
- [x] 02.2-07-PLAN.md — Group E: Wyatt's afternoon solo list on build `t` — all nine items (the
  wait-line race behind his 2 and 8, the storm summary, the black market, reading-speed narration,
  the petal pulse, the Dock label, the wind pill, the crate cue). **A new list, not his twenty-two**
  — item numbers here are his afternoon numbering, recorded in
  `.planning/HANDOFF-2026-08-21-afternoon.md`, and do not renumber his original twenty-two.
  **Also carries the recipe card — item 9 of his TWENTY-TWO (D-35, option C with his two changes)**,
  which moved here because he ruled on it after 02.2-06 was written. PAR-13 stays with 02.2-06.
  **Sequenced after D-31: starts only once `u` is live on `origin/main` and `4/` is clean.**

---

#### Execution order — Wyatt's pick, 2026-08-20: **Q → B → C → C′ → D**  *(Group A moved to Phase 02.15, which runs FIRST)*

> **Group Q was added at planning, 2026-08-20, on Wyatt's pick.** Shown the measured sizes — several
> of his items are one line each — he chose *"quick wins first, then your order."* **His A → B → C →
> C′ → D sequence is unchanged underneath it**; Q is a first small drop pulled from across the
> groups, not a resequencing of them. Items keep his numbers and are struck from their home group
> when Q lands them.

**Group Q — the one-line wins, shipped first.** Items **13, 10, 20, 15, 1, 14, 7**.
Each is small and each is noticed immediately. Two are confirmed by reading the code, one is a
strong candidate that must be reproduced first, and the rest are located but unsized:

- **13 (sound) — CONFIRMED, one deleted line.** `4/src/ui/audio.js` maps `anchorHold` twice inside
  the *same object literal* — `:94` `anchorHold:"fishing"` and `:118` `anchorHold:"storm"`. The
  second silently wins. Deleting `:118` restores `fishing.mp3` (downloaded every game, never played)
  **and** stops anchoring firing the 8-second storm bed once per anchoring ship. Then set the six
  volumes, all still the untouched default. **Read `docs/AUDIO.md` first.**

- **10 (narration time) — CONFIRMED, one number.** `4/src/ui/stage.js:578` clamps the hold to
  `Math.max(2550, Math.min(6750, …))`. +30% on the maximum is `6750 → 8775`.

- **20 + 15 (the director chasing your own boat) — CANDIDATE, NOT REPRODUCED.**
  `4/src/ui/stage.js:1220` re-aims with `camToSeat(appState.mySeat ?? 0)` — *my* ship — for every
  prompt that is not about boats. On a host during a guest's turn, "my ship" is the host's ship.
  The correct subject is already in scope: `4/src/ui/stage.js:574` does `camToSeat(subj)` on the
  narration path. **Reproduce in two tabs before changing it** (rule 6) — this block only runs when
  an action panel exists, and whether the host draws one during a guest's turn is unverified.

- **1, 14 (button labels and Pass at the bottom), 7 (the "Bakeries" wording)** — small, located,
  not yet sized. **7 may not be cosmetic:** `4/src/ui/board.js:1935` prints `"one baker home"`
  whenever `finishOrder.length` is 1, and his screenshot shows that line with three captains home.
  If the count is wrong, that is a scoring bug wearing a copy bug's clothes. **Measure before
  fixing.**

**Group A — MOVED OUT. It is now Phase 02.15: One Log, One Display Path.**

> **Wyatt's ruling, 2026-08-20: *"its own phase, and do it before the rest of 02.2."*** Group A stopped
> being a group. Comparing his host/guest screenshots pixel by pixel showed **seven surfaces
> diverging**, caused by **two directors** (`4/src/orchestrator.js:1654`) — and the fix he described
> (*"the captain should be writing to a log… if multiplayer, that log is semaphored out"*) is the
> architecture the bake-off (Phase 4) and trade-over-the-wire (Phase 5) will be built on. **An
> architecture that governs the rest of the milestone should not be one group inside a bug-fix
> phase**, and it must land before the two phases that would otherwise each add another fork.
>
> **Items 15, 17, 18, 19, 20 and 21 move with it.** They are not fixed there one at a time — they
> fall out of having one display path. **Everything else on his twenty-two stays here.**

**Group B — the faults visible on the first screen.** Items **2, 3, 5, 11, 22**. *(1 and 14 moved to
Group Q; both are listed below so the intent survives if Q leaves either undone.)*
1 — drop the parentheses from action-prompt button labels. 2 — the one action prompt that renders as
a flat card ("a broadside, and yer purse won't stretch") uses the same radial fan as every other
action. 3 — the battle screen centres on the **board**, framing both combatant boats, not on an
offscreen boat. 5 — the "ovens be roarin'" block (box + Get bakin' + helper text) is centred both
ways. 11 — no popup appears until the director camera and the ships have stopped moving. 14 — Pass
is the **bottom** button, and loses its parentheses. 22 — **stopgap only**: desktop renders at the
phone's aspect ratio (narrow, centred, square board) so both of us debug the same picture. **The
desktop redesign stays in Phase 8 and is NOT in this phase.**

**Group C — rules and sound.** Item **4**. *(13 moved to Group Q — it is one deleted line. Its
volume-balancing half stays here if Q ships only the deletion; the text below is unchanged.)*
4 — a bot may not pass **and** fire the ovens in one turn; that breaks the standing bots-and-humans
parity invariant. **Wyatt's ruling: the bot BAKES** — a bot docking at Tortuga with a full recipe
fires the ovens and forfeits the pass dubloon, because that is what a human would obviously do.
13 — the sound file: `anchorHold` is listed twice and the second listing silently wins, which both
strands `fishing.mp3` (downloaded every game, never plays) and makes anchoring fire the 8-second
storm bed at ~3× intended volume once per anchoring ship. **One deleted line fixes both.** Then set
the six volumes, which are all still the untouched default — the loudest file is the out-of-time
sound and the quietest is the victory sound. Read `docs/AUDIO.md` first.

**Group C′ — the economy, measured before touched.** Item **12**.
Since Pass began paying +1 dubloon, purses have run away and money means nothing. Wyatt's target:
*every player feels able to do what they want at least once per game, and no player holds more than
about 10 coins.* His proposed levers: dock output **1–3** instead of 2–5, and/or battle cost **4**.
**Run the offline balance simulator across a few hundred games at each setting and bring him the
table — purses over time, battle counts, game length. Change no number until he picks.** He asked
for the numbers, not for the change.

**Group D — design and copy.** Items **6, 8, 9, 16**. *(7 and 10 moved to Group Q.)*
6 — the Bake-Off card leaves the screen once you have attempted your bake, so simultaneous bake-offs
are visible. **Wyatt's ruling: it does NOT come back** — the attempt is locked in and the card has
nothing left to offer.
8 and 9 — **sketch 2–3 throwaway HTML options each and let Wyatt choose before building**: the
end-of-voyage card must be collapsible (or hold-the-sea) so the final board can be seen, and the
recipe card needs a gradient that reaches the box edges and *darkens* rather than lightens, with the
Download PDF and Email buttons clearly above the scrolling recipe.
**The sketches ship EARLY — his pick, 2026-08-20: *"sketch early, build in Group D."*** They travel
with the Group Q drop so he can choose whenever he has a minute, and Group D is built against a
choice already made. **Nothing in the phase waits on him, and Group D never stalls at a checkpoint.**
16 — a joining captain keeps the name they typed: a name held by
another **human** is refused with a warning under the Yer Captain Name box on JOIN VOYAGE; a name
held by a **bot** is granted, and the bots swap names to accommodate.

**Group E — the one item carried over from the old scope.** A guest whose browser was **killed**
while holding the seat comes back to a battle prompt that draws nothing. It is ONE observation and
has resisted three reproduction attempts; a sail window and an action menu both came back correctly
after the same kill, so only the battle path (`renderBattleFromSnap()` + the armed coin) is
implicated. **Reproduce it before writing a fix**, and expect it to surface during the two-tab play
sessions Group A already requires rather than from a dedicated hunt.

---

**Success Criteria** (what must be TRUE):

- **Wyatt plays a crew game and does not see items 1, 2, 3, 5, 11, 14, 15, 17, 19, 20, 21 or 22.**
  That is the gate. It is his eyes, not a probe.

- **Host/guest parity is NOT this phase's criterion any more — it moved to Phase 02.15**, which
  runs first and which this phase depends on. Items 15, 17, 18, 19, 20 and 21 went with it. If a
  host/guest divergence is still visible when this phase runs, that is 02.15 not having landed,
  **not a new fault to patch here.**

- A bot never passes and bakes in the same turn, proven from an event stream.
- `fishing.mp3` plays at the moment it is wired to, and one anchoring ship produces one storm bed.
- Wyatt has seen the economy table and picked the settings **before** any economy number changed.
- Wyatt has picked from sketches for items 8 and 9 **before** either was built.

**How the work reaches him** *(his one-drop-one-test convention)*:
**One build drop per group — Q is the first drop**, each with a fresh `PP4_STAMP` in
`4/src/ui/stage.js`, and the stamp named in the message he reads. **Before any group is handed over, play a two-tab crew game — a real
host and a real guest — and screenshot BOTH sides.** Four of the seven faults he found at the 02.1
gate were host/guest divergences, which a single-browser probe cannot see by construction.

**If Group A balloons past what it looks like** *(Wyatt's ruling, 2026-08-20)*: **land what is safe,
write down exactly what is left, and move to Group B** — so he comes back to a visibly better game
either way. Do not stall on A, and do not drop a half-finished rewrite.

**Explicitly NOT in scope**: the desktop redesign (Phase 8 — item 22 gets the aspect-ratio stopgap
only); the wind pill, clock chip and chat bubble (measured twice, zero gap between host and guest —
see the correction on 02.1's Wave 4 row); the doubled flip sound (Wyatt's earlier call).

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

**Plans**: 1 of 1 planned so far EXECUTED — 03-01 landed four of the five requirements. Two
follow-ups are named below and not yet written: 03-02 (`ui_contract_check.js`) and 03-03 (TEST-03).

Plans:
**Wave 1**

- [x] 03-01-PLAN.md — the gates learn to read the game we are actually shipping: five contract gates
  and the parity gate re-aimed at `4/` and red-proofed BOTH ways, a falsifiable gate count in
  `package.json`, and the ~66 comment citations swept behind a gate (TEST-04, TEST-05, TEST-06,
  TEST-07). **No game code, no stamp bump, no corpus captured.**

**Named but not yet written** *(both deliberate, both with the measurement they start from recorded
in `03-01-PLAN.md`)*:

- `03-02-PLAN.md` — `ui_contract_check.js` blocking against `4/`. **Measured for real in 03-01:
  9 PASS, 4 FAIL groups, 68 findings** — 54 of them the D-29 copy-register rule `4/` never adopted,
  9 anchors that moved, 4 real greyed-control faults and 1 allowlist entry. Shaped by
  `03-UI-CONTRACT-TRIAGE.md`, which carries the bucket counts and a recommended two-half shape.

- `03-03-PLAN.md` — **TEST-03, the corpus.** The three inherited engine purity fixes and the capture
  as ONE pass, per `docs/DETERMINISM-RERECORD-NEXT.md` §7.

> **THE ONE-WAY DOOR WAS DELIBERATELY LEFT OPEN, 2026-08-23, and this is a judgement Wyatt can
> overrule.** ROADMAP's own text below says capture the corpus in this phase. `03-01-PLAN.md` §1
> argues for capturing it LAST instead: the corpus is an oracle against *unintended* engine drift,
> and Phases 4 and 5 are the two phases most likely to make an *intended* engine change — a gate that
> fires on changes you meant to make is `HARD-WON-LESSONS` §9. The claim that neither phase needs an
> engine change is an inference from 2026-08-18 intake research, not a measurement of today's tree
> (which 02.2-04 and 02.15 have both changed since). And the `gave` purity fix sits on the **trade**
> event, which is what Phase 5 exists to rework. **Confirmed in code, not assumed:** all three queued
> purity fixes are inherited by `4/src/engine/index.js` (`:8`, `:1140`/`:1166`, `:1793`/`:1797`), and
> `4/scripts/fixtures/` does not exist, so the door is still open. `docs/DETERMINISM-CAPTURE-4.md`
> (written by 03-01 Task 5) records the capture and re-record procedures so spending the door is a
> costed, reviewed act rather than a crisis.

> **TEST-07 is bigger than this file says.** ROADMAP names two dangling citations; **there are about
> 66**, counted 2026-08-23 across `4/src/**` and `4/index.html` — thirteen naming the UI contract
> gate, nine the module graph gate, four the parity gate, and a long tail. **The two line numbers
> below have both drifted since intake and now point at unrelated code — do not chase them.** 03-01
> Task 4 sweeps behind a gate instead, per D-37 (a universal rule, never per-bug assertions).

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

**Plans**: 1/1 plans executed

Plans:
**Wave 1**

- [x] 04-01-PLAN.md — The Networked Bake-off (MP-04, MP-05, MP-06, MP-13)

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

**THE SPECTATOR CHANNEL EXISTS. THE HALF THAT SAID THE BAKE-OFF ALREADY WROTE INTO IT WAS FALSE FOR
`4/`, AND IT IS CORRECTED HERE IN THE OPEN (rule 6, corrected 2026-08-23 while executing 04-01).**

True as written: `rooms/<C>/battle` is host-written (`4/src/orchestrator.js:389`), watched by every
guest (`watchBattle`), and rendered by `renderBattleFromSnap` — it updates many times per fight, so
it is a live stage, not a one-shot.

**False as written:** this paragraph said *"the bake-off already writes into it"* and *"the bake-off
is muted by one guard at `:396`"*, i.e. that un-silencing that guard would deliver criterion 2.
Measured by reading the tree: `asyncBakeoff()` — the only thing that ever produced a `title`
snapshot — **exists only in the ROOT tree** (`src/ui/flow.js:1639`), and it is v1's head-to-head
coin-flip ladder, a different mechanic from the crate-memory bake entirely. **v2 rule 12 deleted it
from `4/`.** So in `4/` nothing produced a bake snapshot at all, the guard had never once fired, and
flipping it would have delivered nothing. **Criterion 2 was not a guard flip; it was build a bench
publisher, build one bench renderer, and route the baker and every watcher through the same one.**

**What actually shipped (04-01 Task 3):** `playBakeoffLive` is fully data-driven, so a watcher is
handed the **same spec** and runs the **same choreography** from it — nothing is streamed frame by
frame. Only the DISCRETE MOMENTS cross the wire, and they are published by **whoever is baking**,
not by the host, because a guest baker is the only party who knows when Ready was pressed. The host
therefore had to start listening on that node too. **The guard was kept and now fires for the first
time**, because a bench snapshot carries a `title` — so the battle sting cannot sound over a bake.
Full account: `docs/DISPLAY-RULES.md` §2's bake-off row and §4's sixth fork.

**The work, concretely — and "a bench renderer BESIDE `renderBattleFromSnap`" is the one instruction
in this section that was wrong to follow.** A second renderer beside the first is the two-directors
shape rule 23 forbids. What shipped instead is one snapshot shape carried under a `bake` key on the
same node, discriminated before `renderBattleFromSnap` is ever reached, and rendered by the SAME
`playBakeoffLive` the baker is running.

**There is no competitive leak to protect.** Each captain bakes their own recipe on their own
shuffled bench (`newBake(order)`, `4/src/engine/bakeoff.js:39`), so seeing a rival's bowls teaches
nothing about your own. The earlier "hidden information" framing was structural, not competitive.
**Face-down, not face-up** — the watcher sees the same puzzle the baker does and can be wrong too;
face-up costs the same and removes all tension. Both are recorded in REQUIREMENTS.md Out of Scope.

**Criterion 3's cheap answer is already in the tree.** The response channel is one reply per prompt,
so a guest cannot say "I bought a look" and keep the prompt open. Folding the re-watch count into
the single reply and settling at the end matches what replay already does at
`4/src/orchestrator.js:908-912` — and keeps criterion 4 true for free.

**The bake-off gets NO shot clock (Wyatt, 2026-08-18) — and that is why criterion 5 exists.**
`bakeoffPrompt` wrapped the bake in `withShotClock` and an expiry forfeited to the engine's own
fallback guess. **Removing the clock removes that safety net**, so a captain who closes their tab
mid-bake would hang the table forever with no timer to rescue it. The fallback therefore fires on
**presence loss** instead.

**One correction to the mechanism named here (04-01 Task 4):** it does not go through
`watchPresence`, which is a site-wide busy counter and says nothing about a particular room. It uses
the same `onDisconnect` pattern `netMarkHostGoneOnDisconnect` already uses — armed by the baker on
`rooms/<C>/response`, the node the host is already holding an open promise on, so it needed no new
watcher and no new node.

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
| 1. Before the Engine Freezes | 6/6 | Complete | 2026-08-19 |
| 2. Multiplayer Revival | 7/7 | Complete | 2026-08-19 |
| 02.1 One Game, Every Captain (INSERTED) | 4/4 | Plans complete | Gate found 2 turn-blocking defects -> Phase 02.2; PAR-02 reopened |
| **02.15 One Log, One Display Path (INSERTED)** | 0/TBD | Planning | Wyatt's architecture — the host draws from the log like everyone else. Absorbed 02.2's Group A (items 15, 17, 18, 19, 20, 21) and runs BEFORE it |
| 02.2 One Game, Every Captain — Wyatt's Twenty-Two (INSERTED) | 6/7 | In Progress|  |
| 3. The Safety Net | 1/1 written, 1 executed | In Progress | 03-01 done: 30 gates, 8 reading 4/. 03-02 (ui contract) and 03-03 (TEST-03 corpus) still to write |
| 4. The Networked Bake-off | 1/1 | In Progress|  |
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
| 02.1. One Game, Every Captain *(inserted, not in the 50 above)* | PAR-01…PAR-07 | 7 |

By category: MP 12/12 · CUT 8/8 · DESK 8/8 · DOC 7/7 · TEST 7/7 · FIX 6/6 · RULE 2/2 · PAR 7/7 (inserted).

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
