# Requirements: Pastry Pirates — v2.0 The New Game

**Defined:** 2026-08-18
**Core Value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a
storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

> **Read before planning any phase:** `.planning/research/v2.0-intake/` — five reports, 1,803 lines,
> reconstructing the `4/` development period, which produced no GSD artifacts. Every requirement
> below traces to a measured finding in one of them.

> **The milestone order is a constraint, not a preference.** Multiplayer → cutover → desktop. The
> live game must never lose multiplayer, so `4/` stays at `/4` until it can host a networked game.

---

## v2.0 Requirements

### Multiplayer (MP)

The Firebase tags were deliberately removed at `4/index.html:28` with a comment saying how to restore
them. `4/src/net/` is **byte-identical** to the live net layer in `readers`/`registry`/`watchers`/
`writers`; `index.js` differs by 6 lines. This is a revival, not a rebuild — except for the bake-off.

**The bake-off spectator channel already exists and is deliberately muted.** `rooms/<C>/battle` is
host-written (`4/src/orchestrator.js:378`), watched by every guest (`:381`) and rendered by
`renderBattleFromSnap` — a live-updating stage, not a one-shot. `battleSnapshot` already carries a
`title` for a bake-off snapshot, and `asyncBakeoff` is its only producer in the repo. The bake-off is
silenced by one guard at `:396`, whose comment reads: *"un-silencing the bakeoff is a design call
belonging to Wyatt, not a side effect of this timing fix."* **Wyatt made that call on 2026-08-18:
un-silence it.** The remaining work is replacing `battleSnapshot`'s 15 battle-shaped keys with
bake-shaped ones and writing a bench renderer beside `renderBattleFromSnap`.

- [ ] **MP-01**: A player can host a networked game from the promoted build and share a room code
- [ ] **MP-02**: A second player can join by room code, claim a seat, and be named without collision
- [ ] **MP-03**: A guest sees the host's board, ships, narration and prompts in sync for a full voyage
- [ ] **MP-04**: A player can take a bake-off turn in a networked game
- [ ] **MP-05**: A player who is not baking **watches the bake-off live** — the shuffle, each pick landing, locks earned, wrong guesses reshuffling — seeing the same **face-down** bench the baker sees, not the answer. Replaces today's `⏳ Waiting for {name}…` note (`battleFooter`, `4/src/ui/flow.js:2270`)
- [ ] **MP-06**: A player can spend coins mid-bake-off (the pay-to-rewatch button) in a networked game
- [ ] **MP-13**: The bake-off runs with **no shot clock**, and a captain who disconnects or closes their tab mid-bake does not stall the table — the engine's fallback guess fires on presence loss instead of on a timer
- [ ] **MP-07**: A player can make and receive trade counter-offers in a networked game
- [ ] **MP-08**: A player can use the coin slider in a networked trade (local-path only today — flagged in `c8e2937` as *"must be closed if /4 ever ships online multiplayer"*)
- [ ] **MP-09**: A multi-captain trade completes inside one turn without stalling the table (~5 sequential round trips today)
- [ ] **MP-10**: Hiding or backgrounding a tab does not pause or resume the shared clock for everyone (`4/src/main.js:148` writes the shared `paused` node; currently safe only because it sits behind `soloBotGame()`)
- [ ] **MP-11**: Fast-forward cannot let one player skip narration other players are still watching (`4/src/state/index.js:99`)
- [ ] **MP-12**: A host who reloads mid-voyage resumes from the decision log with the game intact

### One Game, Every Captain (PAR)

**Inserted 2026-08-19, Phase 02.1 — not part of the original 51 v2.0 requirements below**, and not
counted in the "51 total" coverage figure at the bottom of this file. Every renderer in `4/` reads
`appState.game` directly, which is live truth on the host and a stale render shell on a guest (a guest
never simulates the voyage — it only renders the state snapshot carried on each broadcast event).
Minted from ROADMAP's Phase 02.1 section (no numbered Success Criteria list existed there, since the
phase was inserted after REQUIREMENTS.md was written) and from `02.1-RESEARCH.md`'s complete
divergence inventory.

- [x] **PAR-01**: A guest's ribbon day counter advances round to round exactly as the host's does, with no reload (`ribbonTick()`, `4/src/ui/stage.js:401`)
- [ ] **PAR-02**: A guest's wind pill shows a wind-now and forecast that match the host's, from the first event of the voyage onward (`pillHTML()`, `4/src/ui/stage.js:380`) — **REOPENED at the 02.1 gate.** The guest holds the right data (`windNow` "S", `windNext` "W") and **does not draw the pill at all**; the clock pill and chat bubble are missing from a guest's top bar too. Plan 01's state fix was necessary but not sufficient. Carried to Phase 02.2.
- [x] **PAR-03**: The camera centres a guest's own boat on a sail prompt, and frames battle/storm using each captain's true current position, on both host and guest (`camToSeat`/`camFitSail`/`camFitSeats`, `4/src/ui/stage.js:70-112`, and the `window.__pp4.battle`/`stormCam` hooks at `:1626-1660`)
- [x] **PAR-04**: A guest's narration matches the host's exactly — confirmed already correct by research, reconfirmed rather than rebuilt
- [x] **PAR-05**: Host and guest render every prompt from one shared button-building function, not two hand-mirrored copies, including the previously-unwired `seat` field that anchors a radial option over the boat it names
- [x] **PAR-06**: A greyed button whose reason text contains an icon-mapped emoji (a coin, most commonly) still renders as a correct radial-or-flat prompt, not a corrupted one, on both host and guest (`emojify()`, `4/src/shared/index.js:113`)
- [x] **PAR-07**: There is a proven, repeatable way to verify `4/` in real Safari, and this phase's changes have been verified that way — the first time anything in `4/` has been checked against real Safari

**PAR-08 … PAR-13 minted 2026-08-20 at Phase 02.2 planning**, one per drop group, from Wyatt's own
22-item playtest list (`notes/edits for pastry pirates 8-20.pdf` — **his numbering is authoritative
and must never be renumbered**). Like PAR-01…07 these sit outside the "51 total" count fixed at
roadmap creation. Each is written as a condition **he could check by playing**, because the phase
gate is his eyes and not a probe. The item numbers in brackets are his.

- [ ] **PAR-08**: *(Group Q)* Anchoring a ship plays the fishing sound instead of eight seconds of storm, the six sounds sit at sensible levels against each other, a long narration line holds long enough to read, the Attack and Pass buttons show their coin amount without brackets round it on every screen that draws them, and the end-of-voyage stat is labelled **Bakeries** and counts the captains who actually got home *(items 13, 10, 1, 14, 7)*
- [ ] **PAR-09**: *(Group A)* A moment in a networked game produces exactly one sentence, from one place, read the same way by the host and by every guest — no Ahoy line arriving twice on a guest, no waiting-for-yer-mateys box that vanishes before the wait is over, and a guest's top ribbon showing whose turn it actually is *(items 17, 18, 19, 21, and 20/15 if Group Q could not reproduce them)*
- [ ] **PAR-10**: *(Group B)* The first screen is free of faults visible at a glance — the greyed Attack prompt draws as the same radial fan as every other action, a battle frames the two boats fighting rather than a bystander's, the ovens-be-roarin' block is centred both ways, no popup appears until the camera and the ships have stopped moving, and a laptop shows the phone's picture so Wyatt and the session debug the same screen *(items 2, 3, 5, 11, 22 — 22 is a stopgap; the desktop redesign stays in Phase 8)*
- [ ] **PAR-11**: *(Group C)* A bot that reaches Tortuga with a full recipe fires the ovens and forfeits the pass dubloon, exactly as a human in that position must — in the browser game and in the headless simulator alike, and proven from the event stream rather than asserted *(item 4)*
- [ ] **PAR-12**: *(Group C′)* Wyatt has read a table of purses over time, battle counts and voyage length across today's economy and each of the settings he named, from a few hundred games each — **and no economy number in the shipping game has changed, because he asked for the numbers, not for the change** *(item 12)*
- [ ] **PAR-13**: *(Group D)* The Bake-Off card leaves once a captain has attempted their bake and does not come back; a joining captain keeps the name they typed unless another human already holds it, in which case they are told so under the box they typed it in, and a name a bot holds is given up to them; and Wyatt has picked from sketches for the end-of-voyage card and the recipe card **before** either was built *(items 6, 16, 8, 9)*

**PAR-14 … PAR-16 minted 2026-08-20** for **Phase 02.15 (One Log, One Display Path)**, which absorbed
Phase 02.2's Group A on Wyatt's ruling. Phrased as conditions he could check by playing.

- [x] **PAR-14**: There is **one place** that decides what the game draws, and every mode reads from
  it — solo, pass-and-play, host and guest alike. **The test is not that the screens agree; it is
  that nothing could make them disagree.** Asked of any drawn thing, *"what would have to be true for
  the host and a guest to differ here?"*, the honest answer is *"nothing"* *(items 15, 17, 18, 19, 20, 21)*

- [x] **PAR-15**: A two-tab crew game shows none of the seven divergences in Wyatt's screenshots — no
  Ahoy arriving twice, one sentence for the wait, narration that outlasts the wait on both screens,
  one camera following the active captain, the same sail squares, and a top bar that updates for
  everyone — **and a solo game and a pass-and-play game still play start to finish.** The single-player
  game is the one a two-tab test cannot see, and the one the naive version of this change would break

- [x] **PAR-16**: The rules for how the game displays itself **exist as a document**, written as each
  piece was converted rather than before or after — what the log entry is, what gets drawn, and how
  long it stays. Wyatt: *"the Gameboard should just be displayed according to a set of rules."* And the
  parity gate runs against `4/` and **would fail if the paths re-forked** — proven by having been seen
  red against the two-directors tree first, not merely green afterwards

### The One New Rule (RULE)

**Wyatt, 2026-08-18:** *"There is just ONE new gameplay rule that i want added to this new build:
passing gives the player one Dubloon and we need to adjust their narration to account for that."*

Pass is the turn-ender that replaced fishing (`RULES-V2.md` §3) — always available, never disabled,
and it narrates one of 50 hand-written sea creatures stored in both persons.

- [x] **RULE-01**: A captain who passes receives 1 dubloon. All three `{t:"pass"}` emission sites pay it — the human menu (`4/src/ui/flow.js:1861`), `4/src/ui/flow.js:2140`, and the bot fallback (`4/src/engine/index.js:2993`). Per the standing bot/human parity invariant this is not an open question: bots pass, so bots are paid.
- [x] **RULE-02**: The pass narration tells the captain they were paid, in **both** the addressed and third-person renderings, across all 50 sea-creature entries. The established treatment for a coin gain already exists and should be reused rather than re-invented — `(+1🌕)` inside a `nobrk` span so the name and its amount never split across a line break (G27/P7, `4/src/ui/flow.js:2231`).

> **Sequencing constraint — this rule must land BEFORE TEST-03.** Paying a dubloon changes what the
> engine writes into the event stream, which invalidates any determinism corpus recorded before it.
> Recording the v2 corpus first would mean recording it twice. This is the same one-way re-record
> cost that shaped v1.2's Phase 14 — see `docs/DETERMINISM-RERECORD.md`.

> **Balance note, flagged not blocking.** Paying for the always-available turn-ender creates a
> reason to pass rather than act, which is a new incentive in the economy. It is measurable rather
> than arguable — the race-planner bot ladder that fitted on 27,867 outcomes can be re-run to see
> whether pass-farming beats playing. Worth doing during the phase; not worth debating first.

### Test Harness & Determinism (TEST)

Root `npm test` runs 21 gates and passes — **not one of them loads `4/`**. This is the exact "gate
scanning the wrong tree" trap in `docs/HARD-WON-LESSONS.md` §3.

- [x] **TEST-01**: `4/src/ui/stage.js` imports under Node without throwing (bare `addEventListener` at `:190` makes the largest new module — 1,545 lines — untestable headlessly today)
- [x] **TEST-02**: `4/scripts/no_undef_check.js` exits 0 (fails today, exit 1)
- [ ] **TEST-03**: A determinism corpus exists for the v2 engine and verifies green
- [ ] **TEST-04**: The contract gates — engine, module graph, net, state, UI — run against the promoted tree
- [ ] **TEST-05**: `npm test` covers the promoted game, and its gate count is stated in `package.json`
- [ ] **TEST-06**: Host/guest parity is mechanically gated, not maintained by discipline
- [ ] **TEST-07**: The two dangling citations are made true or removed — `4/src/orchestrator.js:880` and `4/src/ui/util.js:1484` each claim a check gates them; neither check exists

### Cutover (CUT)

A one-way promotion. `4/` forked 2026-08-11; the root has had no code commit since 2026-08-02.

- [ ] **CUT-01**: `playpastrypirates.com` serves the promoted game
- [ ] **CUT-02**: Today's game stays playable at `/classic`, so no existing bookmark breaks
- [ ] **CUT-03**: `v2/`, `v2bakeoff/` and `3/` are removed from the working tree (~40k lines; preserved in git history)
- [ ] **CUT-04**: The promoted game is indexable — `noindex, nofollow` removed from `4/index.html:10`, `robots.txt` `Disallow: /4/` resolved, `sitemap.xml` correct, and the page title no longer reads `v3 bot test`
- [ ] **CUT-05**: Every image resolves from the root (`ASSET_BASE="../assets/"` at `4/src/shared/index.js:24` points one directory above the app)
- [ ] **CUT-06**: The About page is reachable from the promoted game (`about.html` links 404 at `/4` today)
- [ ] **CUT-07**: A returning player's saved voyage and preferences survive the cutover
- [ ] **CUT-08**: `CNAME`, `robots.txt` and `sitemap.xml` are correct for exactly one live deployment and appear in no other tree

### Desktop & Widescreen (DESK)

`4/` has **no desktop layout** — not broken, absent. Zero `min-width` media queries in the build.
The stage camera derives its height from window aspect ratio (`4/src/ui/stage.js:227`), so the clamp
that shows the whole board can only fire on a portrait phone.

- [ ] **DESK-01**: The whole board is visible on a laptop screen without dragging (5.9 of 15 rows at 1440×900 today; 6.5 of 15 at 2560×1440)
- [ ] **DESK-02**: A legal sail square and a battle opponent are never off-screen on a wide display (`camFitSail()` promises this and cannot deliver it in landscape)
- [ ] **DESK-03**: On a wide screen the captains occupy a right-hand column rather than a 2560px-wide band
- [ ] **DESK-04**: Controls are sized and placed for a mouse on desktop, not for a thumb (~60 hardcoded pixel values — 66px circles, 290px bubbles, 250px captains band)
- [ ] **DESK-05**: Hover states are visible on the primary controls (`#pp4Prompt.radial .apBtn` at specificity 1-1-1 beats `.apBtn:hover` at 0-2-0, so hover is dead on every prompt button)
- [ ] **DESK-06**: The game is playable with a mouse and keyboard — cursor affordance on the draggable board, wheel zoom, and a visible focus ring
- [ ] **DESK-07**: Board and boat art is crisp on a high-resolution display (boats are 136×221 sources shown at up to 3.4×)
- [ ] **DESK-08**: The phone layout is visually unchanged by the desktop work

### The Written Record (DOC)

`4/RULES-V2.md` was copied in on 2026-08-11 and never edited — byte-identical across `v2/`,
`v2bakeoff/`, `3/` and `4/`, header still reading "Lives in `v2/`". 3 of 10 spot-checked rules
disagree with the code.

- [ ] **DOC-01**: The ruleset document describes the game the code actually plays — including the bake-off (its §12 is currently titled "No bakeoff"), the black market (absent entirely), and dock heads at 5 not 6
- [ ] **DOC-02**: The ~40 design rulings that exist only in commit bodies are recorded in `docs/`
- [ ] **DOC-03**: The 13 copy strings approved on 2026-08-14 are recorded outside the git log
- [ ] **DOC-04**: The rejection graveyard — rim routing, wind-aware routing, three hail-reach shapes, two forecast-on-dial designs, the harbormaster 2-for-1 — is readable without git archaeology
- [ ] **DOC-05**: Docs addressed to `v2/`, `v2bakeoff/` or `3/` are re-pointed at the promoted tree
- [ ] **DOC-06**: `docs/DRIVING-THE-GAME.md` import paths target the promoted tree, so a playtest probe cannot inject state into the wrong copy
- [ ] **DOC-07**: `README.md` describes the promoted game and the `/classic` URL

### Standalone Fixes (FIX)

- [x] **FIX-01**: The new game's turn-clock preference is stored under its **own** key, so its default does not reach into the other game. **The default being OFF is intentional (Wyatt, 2026-08-18) and must not be changed** — the defect is only that `4/src/ui/stage.js:1478` writes the shared, un-namespaced `pp_timerOff`, which v1 reads at `src/orchestrator.js:1399` and pushes to the whole room at `:1404`. `4/` already namespaces `pp4_sess` and `pp4_solo`; this key was missed. The fix survives the cutover, where the new game and `/classic` still share one origin and want opposite defaults.
- [ ] **FIX-02**: `?ovens=1` (skips the entire 16-day voyage) and `?windhud=1` are gated or removed before the game is public
- [ ] **FIX-03**: The sparse-draft crash at `4/src/orchestrator.js:1591` is fixed, along with the unguarded `.val()` at `:1501` and the unescaped host HTML at `:1239`
- [ ] **FIX-04**: Safari storm performance is re-measured on a real device — the BUG-01 fix is intact, but rain is now full-viewport (~5× paint area) and a 60fps camera tween runs during storms, and this has never been measured on Safari
- [ ] **FIX-05**: The wind-dot prototype's shipping default is a decision, not an accident (`4/src/ui/board.js:570` ships `true` at 20 dots; live deliberately keeps it `false` at 10)
- [x] **FIX-06**: The dead bot brain is resolved — `planTurnClassic` (`4/src/engine/index.js:2739`, ~210 lines) has zero callers and `planTurn:2197` dispatches to v3 unconditionally

---

## Future Requirements

Acknowledged, not in this milestone.

### Determinism hardening (DTRM)

Irrelevant under host authority; only bites if the design ever moves to true lockstep.

- **DTRM-01**: `Math.exp` at `4/src/engine/index.js:2537` compared against a `1e-12` epsilon
- **DTRM-02**: ~6 sorts without explicit tiebreaks, notably `stormOrder` at `:506` where ties are common

### Back-port to v1 (BACK)

- **BACK-01**: `4/src/main.js:211` and `4/src/orchestrator.js:1697` close real gaps the live game still has — **deferred, not dismissed**: v1 is being retired to `/classic` as a frozen archive, so the value of fixing it is small. Revisit only if `/classic` turns out to get real traffic.

### Carried from v1.3

- **STORM-02**: multiplayer guest storm-push parity — re-assess against the v2 engine; the v1 analysis (that it forces a determinism re-record) may no longer apply
- **META-03**: Google Search Console verification — Wyatt's own action, and now blocked behind CUT-04

---

## Out of Scope

| Feature | Reason |
|---|---|
| Any new gameplay rule **beyond RULE-01** | v2.0 promotes and hardens the game that exists. **One sanctioned exception**, granted by Wyatt on 2026-08-18: passing pays a dubloon (RULE-01/02). Every further rule change invalidates the determinism corpus being recorded and the spec being written from the code, so a second exception costs a re-record — raise it as a v2.1 candidate, not as scope creep here. |
| Merging v1 fixes into the new tree | One-way cutover. Root has had no code commit since 2026-08-02, so there is nothing to merge. |
| Phase 20 "The Board Comes Alive" (v1.3) | Retired unbuilt. `4/` built drifting wind and whirlpools independently, and v1 is being retired to `/classic`. |
| Keeping `v2/`, `v2bakeoff/`, `3/` on disk | Five copies make every "which file?" question ambiguous. All three are fully preserved in git history. |
| A bundler/minifier toolchain | The no-build-step principle survives the promotion — `4/` is already native ES modules. |
| TypeScript migration | Unchanged from v1: out of scope. |
| A private per-seat channel for the bake-off | **Reversed 2026-08-18.** The original MP-05 required hiding bowl contents from rivals, which meant inventing a private channel — the single hardest thing in the milestone. Wyatt chose watching instead, which is both the better design and the cheaper build, and there is no competitive leak to protect: each captain bakes their own recipe on their own shuffled bench, so seeing a rival's bowls teaches nothing about your own. **Do not re-introduce privacy here.** |
| Showing a watcher the answer (bowls face up) | Wyatt's call, 2026-08-18: a watcher sees the same face-down bench the baker sees, so they can play along and be wrong too. Face-up costs the same to build and removes all tension for the person watching. |
| A shot clock on the bake-off | Wyatt's call, 2026-08-18: the finish line gets as long as it needs. The stall risk is handled by MP-13 — the fallback fires on disconnect, not on a timer. |
| Changing the new game's turn clock to default ON | **Wyatt, 2026-08-18: the OFF default in `4/` is intentional.** FIX-01 namespaces the storage key so that default stops leaking into the other game; it does not touch the default itself. Recorded here because "the clock defaults off" reads like a bug to anyone who has only seen v1. |
| A centred phone column on desktop | Wyatt's call, 2026-08-18: true widescreen. Recorded so the letterbox option is not revived as a schedule saver. |

---

## Traceability

Mapped during roadmap creation, 2026-08-18. **Phase numbering restarts at 1 for v2.0** — the phases
below are v2.0 phases, not v1.x phases. Phase detail and success criteria: [`ROADMAP.md`](ROADMAP.md).

| Requirement | Phase | Status |
|-------------|-------|--------|
| FIX-01 | Phase 1 — Before the Engine Freezes | Complete |
| TEST-01 | Phase 1 — Before the Engine Freezes | Complete |
| TEST-02 | Phase 1 — Before the Engine Freezes | Complete |
| RULE-01 | Phase 1 — Before the Engine Freezes | Complete |
| RULE-02 | Phase 1 — Before the Engine Freezes | Complete |
| FIX-06 | Phase 1 — Before the Engine Freezes | Complete |
| MP-01 | Phase 2 — Multiplayer Revival | Pending |
| MP-02 | Phase 2 — Multiplayer Revival | Pending |
| MP-03 | Phase 2 — Multiplayer Revival | Pending |
| MP-10 | Phase 2 — Multiplayer Revival | Pending |
| MP-11 | Phase 2 — Multiplayer Revival | Pending |
| MP-12 | Phase 2 — Multiplayer Revival | Pending |
| FIX-03 | Phase 2 — Multiplayer Revival | Pending |
| PAR-01 | Phase 02.1 — One Game, Every Captain (inserted) | Complete |
| PAR-02 | Phase 02.1 — One Game, Every Captain (inserted) | **Reopened** — disproved at the 02.1 gate; carried to Phase 02.2 |
| PAR-03 | Phase 02.1 — One Game, Every Captain (inserted) | Complete |
| PAR-04 | Phase 02.1 — One Game, Every Captain (inserted) | Complete |
| PAR-05 | Phase 02.1 — One Game, Every Captain (inserted) | Complete |
| PAR-06 | Phase 02.1 — One Game, Every Captain (inserted) | Complete |
| PAR-07 | Phase 02.1 — One Game, Every Captain (inserted) | Complete |
| PAR-08 | Phase 02.2 — Wyatt's Twenty-Two (inserted) | Pending — Group Q, plan 02.2-01 |
| PAR-09 | Phase 02.2 — Wyatt's Twenty-Two (inserted) | Pending — Group A, plan 02.2-02 |
| PAR-10 | Phase 02.2 — Wyatt's Twenty-Two (inserted) | Pending — Group B, plan 02.2-03 |
| PAR-11 | Phase 02.2 — Wyatt's Twenty-Two (inserted) | Pending — Group C, plan 02.2-04 |
| PAR-12 | Phase 02.2 — Wyatt's Twenty-Two (inserted) | Pending — Group C′, plan 02.2-05 |
| PAR-14 | **Phase 02.15 — One Log, One Display Path (inserted)** | Partial — 02.15-01 (narration + active seat converged); prompt channel is 02.15-02 |
| PAR-15 | **Phase 02.15 — One Log, One Display Path (inserted)** | Partial — 6 of 7 divergences closed by 02.15-01; whole-game QA on three tiers is 02.15-02 |
| PAR-16 | **Phase 02.15 — One Log, One Display Path (inserted)** | Pending — `docs/DISPLAY-RULES.md` is written by 02.15-02 Task 2 |
| PAR-13 | Phase 02.2 — Wyatt's Twenty-Two (inserted) | Pending — Group D, plans 02.2-01 (sketches) and 02.2-06 |
| TEST-03 | Phase 3 — The Safety Net | Pending |
| TEST-04 | Phase 3 — The Safety Net | Pending |
| TEST-05 | Phase 3 — The Safety Net | Pending |
| TEST-06 | Phase 3 — The Safety Net | Pending |
| TEST-07 | Phase 3 — The Safety Net | Pending |
| MP-04 | Phase 4 — The Networked Bake-off | Pending |
| MP-05 | Phase 4 — The Networked Bake-off | Pending |
| MP-06 | Phase 4 — The Networked Bake-off | Pending |
| MP-13 | Phase 4 — The Networked Bake-off | Pending |
| MP-07 | Phase 5 — Trade Over the Wire | Pending |
| MP-08 | Phase 5 — Trade Over the Wire | Pending |
| MP-09 | Phase 5 — Trade Over the Wire | Pending |
| CUT-01 | Phase 6 — The Cutover | Pending |
| CUT-02 | Phase 6 — The Cutover | Pending |
| CUT-03 | Phase 6 — The Cutover | Pending |
| CUT-04 | Phase 6 — The Cutover | Pending |
| CUT-05 | Phase 6 — The Cutover | Pending |
| CUT-06 | Phase 6 — The Cutover | Pending |
| CUT-07 | Phase 6 — The Cutover | Pending |
| CUT-08 | Phase 6 — The Cutover | Pending |
| FIX-02 | Phase 6 — The Cutover | Pending |
| FIX-04 | Phase 6 — The Cutover | Pending |
| FIX-05 | Phase 6 — The Cutover | Pending |
| DESK-01 | Phase 7 — The Board Fits | Pending |
| DESK-02 | Phase 7 — The Board Fits | Pending |
| DESK-08 | Phase 7 — The Board Fits | Pending |
| DESK-03 | Phase 8 — A Desktop Worth the Width | Pending |
| DESK-04 | Phase 8 — A Desktop Worth the Width | Pending |
| DESK-05 | Phase 8 — A Desktop Worth the Width | Pending |
| DESK-06 | Phase 8 — A Desktop Worth the Width | Pending |
| DESK-07 | Phase 8 — A Desktop Worth the Width | Pending |
| DOC-01 | Phase 9 — The Written Record | Pending |
| DOC-02 | Phase 9 — The Written Record | Pending |
| DOC-03 | Phase 9 — The Written Record | Pending |
| DOC-04 | Phase 9 — The Written Record | Pending |
| DOC-05 | Phase 9 — The Written Record | Pending |
| DOC-06 | Phase 9 — The Written Record | Pending |
| DOC-07 | Phase 9 — The Written Record | Pending |

**Coverage:**

- v2.0 requirements: 51 total (MP 13, CUT 8, DESK 8, DOC 7, TEST 7, FIX 6, RULE 2)
- Mapped to phases: **51** ✓ — every requirement maps to exactly one phase
- Unmapped: **0** — no orphans, no duplicates
- **Plus 7 PAR requirements** minted 2026-08-19 for the inserted Phase 02.1, all mapped to that phase —
  deliberately kept out of the 51-count above, since Phase 02.1 did not exist when that count was
  fixed at roadmap creation (2026-08-18). See the PAR section above for the full list.

- **Plus 6 more PAR requirements (PAR-08…PAR-13)** minted 2026-08-20 for the inserted Phase 02.2, one
  per drop group, all mapped to that phase and likewise outside the 51-count. They are minted from
  Wyatt's own 22-item playtest list rather than from the roadmap, so the mapping runs
  item → group → requirement → plan; his item numbers never change.

**Sequencing constraints honored by this mapping:**

- **FIX-01** — the clock preference leaking between the two games, affecting real players today and
  independent of every promotion decision — is in the earliest phase, not batched with the cutover.
  **It namespaces the key; the OFF default in the new game is intentional and stays.**

- **TEST-01** (`4/src/ui/stage.js` importable under Node) is in Phase 1, so it unblocks the rest of
  the TEST work rather than sitting behind it.

- **RULE-01 lands in Phase 1, before TEST-03 records the corpus in Phase 3** — recorded once, not
  twice.

- **The harness (Phase 3) is rebuilt before the cutover (Phase 6)** — and before the largest work in
  the milestone (Phases 4–5) is built on top of it, so the bake-off and trade work are guarded by
  `net_contract_check`, `dlog_replay_test` and `host_guest_parity_check` while they are written.

- **Multiplayer (Phases 2, 4, 5) → cutover (Phase 6) → desktop (Phases 7, 8).** The live game never
  loses multiplayer; `4/` stays at `/4` until it can host a networked game.

---
*Requirements defined: 2026-08-18*
*Last updated: 2026-08-18 — Traceability populated at roadmap creation; 51/51 mapped (MP-13 added when the bake-off spectator decision reversed).*
