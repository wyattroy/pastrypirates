# Roadmap: Pastry Pirates

## Milestones

- ✅ **v1.0 Edit Pass** — Phases 1–6 (shipped 2026-07-24)
- ✅ **v1.1 Monolith Refactor** — Phases 7–12 (shipped 2026-07-25)
- 🚧 **v1.2 Playtest Fixes & Polish** — Phases 13–17 (in progress)

## Phases

<details>
<summary>✅ v1.0 Edit Pass (Phases 1–6) — SHIPPED 2026-07-24</summary>

Full detail archived in [`milestones/v1.0-ROADMAP.md`](milestones/v1.0-ROADMAP.md).

- [x] Phase 1: Critical Bug Fixes — Safari storm no longer near-crashes; MP timer pause/refresh no longer destroys game state (BUG-01…04)
- [x] Phase 2: Battle & AI Overhaul — reflip-free, swap-free battles; smarter, fairer bots (BATL-01…03, AI-01…06)
- [x] Phase 3: Narration System — accuracy, pacing, sustained-wind + empty-island lines; storm-text audit & rewrite (NARR-01…07)
- [x] Phase 4: UI/UX Polish — clock, boats, fish, compass, squares, modals, parley, Flippenator, copy (UI-01…10)
- [x] Phase 5: Bot Personalities — hardcoded per captain, lobby picker removed (BOT-01/02)
- [x] Phase 6: End of Voyage Celebration — win box, Unluckiest-pirate badge, redesigned badges, confetti (EOV-01…05)

</details>

<details>
<summary>✅ v1.1 Monolith Refactor (Phases 7–12) — SHIPPED 2026-07-25</summary>

**Milestone Goal:** Split the ~5,200-line `index.html` monolith into native ES modules with no build step, preserving gameplay, Safari support, and deterministic multiplayer — while folding in the three approved debt cleanups (Firebase `.off()` teardown, de-globalization, engine/replay hardening). A strangler-fig sequence kept the game runnable and determinism-verifiable at every phase boundary. Full phase detail retained below under **Phase Details**.

- [x] **Phase 7: Foundation & Determinism Baseline** — Zero-build module-loading contract + golden-fixture regression oracle, game unchanged
- [x] **Phase 8: Engine Extraction & Node Harness Migration** — Pure DOM-free engine module Node imports natively, byte-for-byte identical (critical path)
- [x] **Phase 9: Networking Layer & Watcher Cleanup** — Firebase sync in its own module with a registry and `.off()` teardown, zero leaked listeners
- [x] **Phase 10: App State & De-globalization** — 40+ globals encapsulated behind an app-state module, all inline handlers still work
- [x] **Phase 11: UI Extraction, Orchestration & Bridge Removal** — UI module + `main` composition root, `index.html` reduced to markup, acyclic graph, bridge gone
- [x] **Phase 12: Verification & Validation** — Expanded harness green + Chrome-MCP solo/MP E2E + manual Safari/Chrome playtests

</details>

### 🚧 v1.2 Playtest Fixes & Polish (In Progress)

**Milestone Goal:** Clear a second live-playtest punch list without regressing the core value (playable and fair in Safari and multiplayer). Front-load the critical multiplayer turn-clock stall so a multiplayer game is playable immediately, correct storm movement behind the determinism harness, complete a narration audit + fixes gated on Wyatt's review, and land low-risk UI/UX polish plus social-preview metadata and a Ko-Fi support button — closed out by a manual Safari + Chrome two-window playtest. The tutorial, sound effects, and island redesign from the same punch list are deferred to a later milestone.

- [x] **Phase 13: Multiplayer Turn Clock** — Critical: the MP clock no longer stalls the game before it starts; play/pause is available; the PAUSED image is a clickable resume button (CLOCK-01…03) (completed 2026-07-26)
- [x] **Phase 14: Engine-Adjacent Gameplay Fixes & Determinism** — The boat moves one square at a time across the full storm push with docking checks at the correct square; the bot hail/action turn follows a decided rule; the determinism harness stays green (STORM-01, AI-01, VERIFY-02) (completed 2026-07-26)
- [x] **Phase 15: Narration Audit & Fixes** — Narration audit delivered to Wyatt, then pruning + fixes: restored "broke" line, storm intro, context-smart bribe, 2nd-person "you", timing (NARR-01…06) (completed 2026-07-30, merged as PR #8)
- [x] **Phase 16: UI/UX Polish, Social Preview & Support** — Consistent padding, moveable-square sizing/hover, boat opacity, welcome-flow shortcut, name-doubling fix, empty EOV box hidden, Open Graph preview + favicon, Ko-Fi button (UI-01…07, META-01/02, KOFI-01) (completed 2026-07-31)
- [ ] **Phase 17: Final Multiplayer Verification** — Manual Safari + Chrome two-window playtest confirms the clock stall is fixed and a game plays through end-to-end (VERIFY-01) — **automated + Chrome coverage done 2026-07-31; the Safari two-window playtest is Wyatt's and is the only thing outstanding (17-VERIFICATION.md)**
- [ ] **Phase 18: Narration Pacing — commentary, not a gate** — Narration stops blocking the game loop; lines stay in sync across players, replace cleanly, and never make the game drag (NARR-07)

## Phase Details

### Phase 7: Foundation & Determinism Baseline

**Goal**: Establish the zero-build module-loading contract and capture the determinism regression oracle before any code moves — with the game still fully playable and behaviorally unchanged.
**Depends on**: Nothing (first phase of v1.1)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):

  1. A root `package.json` declares `"type": "module"`, so the same engine `.js` file imports identically in Node and the browser (proven by a trivial import in both).
  2. The game loads and plays from a static HTTP server via a `<script type="module">` entry point, with the Firebase compat SDK v12.15.0 loaded as classic (non-module) scripts before it and no init race.
  3. A seeded golden-fixture replay corpus is captured from the pre-refactor monolith and stored as the byte-for-byte regression oracle for all later phases.
  4. The module-loading + local-dev contract is documented (HTTP server required, `file://` unsupported, `.js` MIME expectations for production).
  5. A solo game played after the foundation changes is behaviorally identical to `main` (no gameplay change — code has not moved yet).

**Plans**: 3/3 plans executed

Plans:
**Wave 1**

- [x] 07-01-PLAN.md — Determinism oracle: `package.json` + ESM harness conversion + `load_engine.js` seam + committed 30-seed golden corpus (wave 1, `index.html` untouched)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 07-02-PLAN.md — Module-loading contract: `src/main.js` entry, one module script tag in `index.html`, `docs/MODULES.md` (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 07-03-PLAN.md — Browser verification: Chrome + Safari page load, module marker, solo playthrough (wave 3, blocking checkpoint)

### Phase 8: Engine Extraction & Node Harness Migration

**Goal**: Extract the deterministic engine into pure, DOM-free/Firebase-free ES modules that the Node harnesses import natively, producing byte-for-byte identical seeded output against the baseline. This is the critical path.
**Depends on**: Phase 7
**Requirements**: SPLIT-01, SPLIT-02, ENGINE-01, ENGINE-02, ENGINE-03, ENGINE-04
**Success Criteria** (what must be TRUE):

  1. Shared constants and pure helpers (`ING_ALL`, `DIRS`, `man`, `shuffle`, `mulberry32`, image maps) live in leaf modules importable by engine, UI, net, and the Node harnesses.
  2. The Game class, `roundCfg`, bot strategies, RNG, and replay live in their own ES module(s) with zero DOM, `window`, Firebase, or wall-clock/unseeded-random access — the 3 asset/DOM bootstrapping touches are relocated out.
  3. The Node test harnesses (`real_game_test.js`, `dlog_replay_test.js`) import the engine module natively — the `vm`/string-slice extraction of `index.html` is retired — landing in the same commit as engine extraction.
  4. Seeded gameplay + replay output is byte-for-byte identical to the Phase 7 golden baseline across the full regression corpus.
  5. Order-load-bearing constants (`DIRS`/`PERP`/`OPPOSITE` and any object literal feeding `this.r()`) are preserved and annotated so iteration order cannot silently change.

**Plans**: 5/5 plans executed

Plans:
**Wave 1**

- [x] 08-01-PLAN.md — Tracer: prove the `Object.assign(globalThis, PP)` bridge in a real browser by moving two real symbols end-to-end, invert `boot()` startup (wave 1)

**Wave 2** *(blocked on Wave 1)*

- [x] 08-02-PLAN.md — Shared leaf tier out verbatim (SPLIT-02), three D-06 impurities relocated, `ASSET_BASE` parse hazard defused, 6 order-load-bearing annotations (wave 2)

**Wave 3** *(blocked on Wave 2)*

- [x] 08-03-PLAN.md — `class Game`/`roundCfg` extraction + `load_engine.js` native-import migration in ONE commit (SPLIT-01, ENGINE-02), 7th annotation (wave 3)

**Wave 4** *(blocked on Wave 3)*

- [x] 08-04-PLAN.md — `engine_contract_check.js` standing gate for purity + annotations + DAG + export completeness, pure-motion audit, `docs/MODULES.md` (wave 4)

**Wave 5** *(blocked on Wave 4)*

- [x] 08-05-PLAN.md — Chrome verification of the corpus-blind live turn loop (forced storm), then `engineSourceHash` re-base in its own commit without `--capture` (wave 5)

### Phase 9: Networking Layer & Watcher Cleanup

**Goal**: Move Firebase multiplayer sync into its own networking module and fix the `.off()` leak class through a single watcher registry, leaving zero dangling listeners across the room lifecycle.
**Depends on**: Phase 8
**Requirements**: SPLIT-04, NET-01, NET-02, NET-03
**Success Criteria** (what must be TRUE):

  1. Firebase multiplayer sync lives in its own networking module(s) that never import the UI layer.
  2. Every Firebase `.on()` watcher (all 18, up from 2 torn down today — count corrected 2026-07-24 from a stale "14 / 1" by direct grep of `index.html`) has a matching `.off()` teardown registered and removed through a single watcher registry with exact callback-reference matching.
  3. A guest reconnect / leave-and-rejoin cycle leaves zero dangling listeners, verified behaviorally by a reconnect-and-count check — not code review alone.
  4. A multiplayer game across two browser tabs still syncs deterministically after the extraction (host + guest smoke test passes).

**Plans**: 5/5 plans executed

- [x] 09-01-PLAN.md
- [x] 09-02-PLAN.md
- [x] 09-03-PLAN.md
- [x] 09-04-PLAN.md
- [x] 09-05-PLAN.md

### Phase 10: App State & De-globalization

**Goal**: Encapsulate the 40+ implicit globals behind an app-state module while keeping every inline handler working through a single documented mechanism.
**Depends on**: Phase 9
**Requirements**: GLOBAL-01, GLOBAL-02, GLOBAL-03
**Success Criteria** (what must be TRUE):

  1. The 40+ implicit globals (`game`, `myId`, `room`, `db`, …) are encapsulated behind module exports / an app-state module instead of bare `window` globals.
  2. Every `onclick` handler still works after de-globalization (count corrected 2026-07-24 by direct grep: **1** inline HTML `onclick="…"` attribute — the template-generated `revealMyRecipe()` at `index.html:1731` — plus **40** JS `.onclick=` closure assignments that already capture scope and are not threatened by de-globalization; the original "41 inline" figure conflated the two). Verified by a click-through of the real handler surface.
  3. Any retained `window` bridge for test/debug state access (e.g. `window.__pp_debug` for the Chrome-MCP harness) is intentional, single, and named/documented.
  4. A full solo game and a multiplayer game both remain playable with no new console `no-undef`/`ReferenceError` regressions.

**Plans**: 7/7 plans executed

Plans:
**Wave 1**

- [x] 10-01-PLAN.md — Foundation + tracer: confirm 46-name inventory, build the shared tokenizer + migration tool + `src/state/index.js` + `state_contract_check.js`, wire the `state` bridge, migrate `room` end-to-end, browser mechanism gate (wave 1, blocking checkpoint)

**Wave 2** *(blocked on Wave 1)*

- [x] 10-02-PLAN.md — Migrate replay/resume control-flow names (`replaying, dlog, dlogIdx, dlogN, evIdx, resumeEvLen, resumeReadFailed`); corpus + `dlog_replay_test` gate ordering (wave 2)

**Wave 3** *(blocked on Wave 2)*

- [x] 10-03-PLAN.md — Migrate net-consumed identity/session names (`db, myId, mySeat, isHost, roster, turnOrder, numSeats, passAndPlay, soloMeta`) + prove net call-site freshness (wave 3)

**Wave 4** *(blocked on Wave 3)*

- [x] 10-04-PLAN.md — Migrate shot-clock/timer-control + live/prompt/turn bookkeeping (26 names); preserve `revealMyRecipe` function-declaration reachability (wave 4)

**Wave 5** *(blocked on Wave 4)*

- [x] 10-05-PLAN.md — Migrate `game`/`timer`/`logLines` with the `$("game")` DOM-id string collision proven byte-safe; all 46 names now migrated (wave 5)

**Wave 6** *(blocked on Wave 5)*

- [x] 10-06-PLAN.md — GLOBAL-03: read-only `window.__pp_app_state_debug` hook, finalize + wire `state_contract_check.js` into `npm test`, document `src/state/` + the four debug hooks (wave 6)

**Wave 7** *(blocked on Wave 6)*

- [x] 10-07-PLAN.md — Chrome click-through: inline `revealMyRecipe` attr, closure surface, full solo game, two-tab multiplayer, host-refresh replay (wave 7, blocking checkpoint)

### Phase 11: UI Extraction, Orchestration & Bridge Removal

**Goal**: Complete the split — UI rendering becomes its own module, a `main` entry orchestrates all layers, `index.html` is reduced to markup, the dependency graph is proven acyclic, and the temporary strangler-fig bridges are removed.
**Depends on**: Phase 10
**Requirements**: SPLIT-03, SPLIT-05, SPLIT-06
**Success Criteria** (what must be TRUE):

  1. UI rendering (render/board/DOM/modals/narration) lives in its own module(s) that read game state and never import the networking layer.
  2. A `main` entry module orchestrates engine + UI + networking, and `index.html` is reduced to markup plus a single module entry point.
  3. The temporary window bridge introduced in earlier phases is deleted, with a grep confirming no leftover bare-global reads remain.
  4. The module dependency graph is acyclic, verified by a cycle-detection scan (`madge` or equivalent).
  5. Storm rendering re-verifies cleanly on Safari after UI extraction (no perf/compat regression at this phase boundary).

**Plans**: 8/8 plans executed

Plans:
**Wave 1**

- [x] 11-01-PLAN.md — Safety net (commit analyzer + `module_graph_check.js` + `ui_contract_check.js`, red-proof) + tracer: extract the recipe/pastry cluster into `src/ui/`; Chrome mechanism gate (wave 1, blocking checkpoint)

**Wave 2** *(blocked on Wave 1)*

- [x] 11-02-PLAN.md — Extract the pure leaf helpers (formatting/name/geometry/session/shot-clock) into `src/ui/util.js` (wave 2)

**Wave 3** *(blocked on Wave 2)*

- [x] 11-03-PLAN.md — Extract the board + storm render cluster (drawBoard/render/buildStormLayers) into `src/ui/board.js`, storm surface verbatim (wave 3)

**Wave 4** *(blocked on Wave 3)*

- [x] 11-04-PLAN.md — Extract panel/clock/narration/chat/modals + lobby views; stand up the handler-injection seam (`src/ui/panel.js`, `lobby.js`, `handlers.js`) (wave 4)

**Wave 5** *(blocked on Wave 4)*

- [x] 11-05-PLAN.md — Extract turn-flow + battle-UI + recovery into `src/ui/flow.js`; resolve all 5 UI-side criterion-1 seam edges (wave 5)

**Wave 6** *(blocked on Wave 5)*

- [x] 11-06-PLAN.md — Move the 44 orchestration net-callers into `src/orchestrator.js`; make `src/main.js` the real orchestrator; formalize the seam; watchRoom idempotent (D-13) (wave 6)

**Wave 7** *(blocked on Wave 6)*

- [x] 11-07-PLAN.md — Gated bridge deletion + `index.html`→markup + `window.revealMyRecipe` retained global + wire `ui_contract_check` into `npm test` + docs; decision gate + solo/two-tab Chrome click-through (wave 7, blocking checkpoints)

**Wave 8** *(blocked on Wave 7)*

- [x] 11-08-PLAN.md — Consolidated automated phase gate + human Safari storm re-verification (D-12, criterion 5) (wave 8, blocking checkpoint)

**UI hint**: yes

### Phase 12: Verification & Validation

**Goal**: Prove the refactor correct end-to-end — determinism harness green, automated solo + multiplayer E2E passing, and manual Safari/Chrome playtests confirming no perf or compat regressions.
**Depends on**: Phase 11
**Requirements**: VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04
**Success Criteria** (what must be TRUE):

  1. The headless replay/determinism harness, expanded to cover the full regression corpus, runs green post-refactor.
  2. Claude-driven Chrome-MCP E2E tests exercise the full solo gameplay loop (sail, dock, trade, battle, fish, storm, end-of-voyage) and pass.
  3. Claude-driven Chrome-MCP E2E tests exercise a full multiplayer game across two browser tabs (host + guest) with deterministic sync intact.
  4. Manual Safari + Chrome playtests confirm no perf/compat regressions — including storm rendering and multiplayer pause/refresh state.

**Plans**: 4/4 plans executed

Plans:
**Wave 1**

- [x] 12-01-PLAN.md — Verification apparatus tracer + Criterion-1 determinism/regression gate (VERIFY-01); creates the committed `docs/VERIFICATION-CHECKLIST.md`

**Wave 2** *(blocked on Wave 1)*

- [x] 12-02-PLAN.md — Full solo gameplay-loop E2E in Chrome — sail/dock/trade/fish/battle/storm/end-of-voyage (VERIFY-02)

**Wave 3** *(blocked on Wave 2)*

- [x] 12-03-PLAN.md — Two-tab multiplayer E2E + pause/refresh recovery matrix in Chrome (VERIFY-03, D-02)

**Wave 4** *(blocked on Wave 3)*

- [x] 12-04-PLAN.md — Wyatt's desktop-Safari solo playthrough (VERIFY-04, D-03) + `12-VALIDATION.md` closeout marking VERIFY-01..04 satisfied (blocking human checkpoint)

### Phase 13: Multiplayer Turn Clock

**Goal**: A multiplayer game starts cleanly on its own and the turn clock is fully controllable — closing the critical stall that blocks the game from beginning.
**Depends on**: Nothing (first phase of v1.2; the critical fix, front-loaded so multiplayer is playable as early as possible)
**Requirements**: CLOCK-01, CLOCK-02, CLOCK-03
**Success Criteria** (what must be TRUE):

  1. In a 2+ window multiplayer game, the turn clock starts running on its own and the first turn begins — the game no longer stalls "paused" before it starts and no timer off/on toggle workaround is needed. *(CLOCK-01, critical)*
  2. Any player can pause and then resume the clock during a multiplayer game without missing bot actions. *(CLOCK-02)*
  3. Clicking the large "PAUSED" image resumes the clock. *(CLOCK-03)*

**Plans**: 3/3 plans executed
**Wave 1**

- [x] 13-01-PLAN.md — CLOCK-02 multiplayer pause: tracer sync path (net→state→ui) + surface the ▶/⏸ control [Wave 1]

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 13-02-PLAN.md — CLOCK-01 boot hardening: localStorage schema-version guard for pp_sess/pp_solo [Wave 2]
- [x] 13-03-PLAN.md — CLOCK-03 clickable large PAUSED symbol resumes (solo + multiplayer) [Wave 2]

### Phase 14: Engine-Adjacent Gameplay Fixes & Determinism

**Goal**: Storm pushes move the boat correctly one square at a time (with docking/aground checks at the right square), and the bot "hail humans" turn follows a decided rule — both without breaking deterministic multiplayer replay.
**Depends on**: Nothing (independent of Phase 13 — these are the engine-adjacent gameplay changes; VERIFY-02's determinism harness gates them internally so the re-verification is deliberate)
**Requirements**: STORM-01, AI-01, VERIFY-02
**Success Criteria** (what must be TRUE):

  1. During a storm the boat visibly moves one square at a time across the full dir1+dir2 push (up to 4 squares). *(STORM-01)*
  2. Docking/aground checks evaluate at the correct square — the false "the dock held fast" message no longer appears when the boat is still a square away from the dock. *(STORM-01)*
  3. The bot hail/parley turn follows the rule Wyatt decides during this phase — a hailing bot no longer *appears* to take two actions in one turn unless that is the deliberately chosen behavior; if the rule applies to bot-vs-bot it is mirrored in the engine's `takeTurn`. *(AI-01)*
  4. The determinism regression harness stays green (31/31) after the storm-movement and bot-rule changes — lockstep replay is unaffected. *(VERIFY-02)*

> **Note on criterion 4 (recorded during planning, 2026-07-26):** per CONTEXT.md D-15/D-18/D-21 the 30
> golden fixtures are re-recorded exactly once during this phase, deliberately. "Green" means
> green against the **new** baseline, after a blocking human decision and a full, attributed
> divergence report. D-16's original "confirm the differences are storm-related only" test is replaced
> by D-26's explainability test.
>
> **Updated at execution (2026-07-26):** the corpus is **31** seeds, not 30. After the phase's three
> engine changes no seed produced a `shipwrecked` event any more, and the capture tool's coverage
> guard refused to write a corpus blind to a required mechanic. Wyatt chose to add a 31st seed
> (12379, first match over a bounded search) rather than accept the coverage gap, so the criterion
> is 31/31. The original 30 keep their seed indices and personality rotation and stay directly
> comparable.

**Plans**: 6/6 plans executed

Plans:
**Wave 1**

- [x] 14-01-PLAN.md — Tracer: full per-seed determinism diff tooling (D-26) + Tortuga's wind shadow (D-18), with the re-record record seeded [Wave 1]
- [x] 14-02-PLAN.md — AI-01: the bot hail becomes a real action — ranked targets, scaled offers, and a turn that ends (D-02…D-08, D-24, D-25) [Wave 1]

**Wave 2** *(blocked on Wave 1)*

- [x] 14-03-PLAN.md — Engine: both storm gusts in the simulator (D-15) + `moored` gains a cause and Tortuga's berths stay safe (D-19, D-21) [Wave 2]

**Wave 3** *(blocked on Wave 2)*

- [x] 14-04-PLAN.md — The one-way door: enumerate, attribute, decide, re-record once, document (VERIFY-02, D-16, D-26) [Wave 3, blocking decision checkpoint]

**Wave 4** *(blocked on Wave 3)*

- [x] 14-05-PLAN.md — STORM-01: per-square storm rendering for humans and bots, every outcome narrated, three honest moored lines (D-09…D-11, D-20, D-22) [Wave 4]

**Wave 5** *(blocked on Wave 4)*

- [x] 14-06-PLAN.md — Wyatt's storm-copy approval (D-14, D-27), three new standing gates, Safari + Chrome playtest [Wave 5, blocking decision checkpoint]

### Phase 15: Narration Audit & Fixes

**Goal**: Narration reads naturally and consistently — repetitions are pruned per Wyatt's review, the local player is addressed directly, and the specific broken/missing lines are corrected.
**Depends on**: Nothing (independent of Phases 13–14 — the NARR-01 audit is an approval-gate deliverable that lands first and gates the NARR-02…06 pruning/fixes)
**Requirements**: NARR-01, NARR-02, NARR-03, NARR-04, NARR-05, NARR-06
**Success Criteria** (what must be TRUE):

  1. A full narration-branch audit (storm, docking, battle, trade, bribe, etc.) cataloguing thematic repetitions/inconsistencies with a pruning recommendation is delivered to Wyatt, and pruning is applied only after he reviews it. *(NARR-01)*
  2. The missing "broke" line is restored, and the storm intro reads "First, the storm pushes you {dir1}" instead of the "pushes everyone 2 squares, then 2 more south" phrasing. *(NARR-02, NARR-03)*
  3. The bribe line is context-smart — "with 2 🪙" when a crate is given, and "paid 5 🪙" when the player has no crate to give. *(NARR-04)*
  4. Narration describing an action the local player took addresses them in 2nd person ("you") rather than 3rd person, including the "already anchored safely" line. *(NARR-05)*
  5. Narration text stays fully visible 10% less time before it begins fading. *(NARR-06)*

**Plans**: 6/6 plans executed

Plans:
**Wave 1**

- [x] 15-01-PLAN.md — TRACER: viewer-aware narration proven end-to-end on one line, plus the DOM-free narration harness (NARR-05, D-07/D-08/D-10)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 15-02-PLAN.md — NARR-06 timing: 10% hold cut on both curves, chat bubbles separated onto their own multiplier (D-14/D-15)
- [x] 15-03-PLAN.md — Turn-flow gaps in `src/ui/flow.js`: broke lines for both moments, storm intro, the missing anchor-hold narrate call, ad-hoc lines onto the variants form (NARR-02/03/05, D-11/D-13)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 15-04-PLAN.md — `EVENT_NARRATION` table: bribe-vs-cleaned-out split, second person across the table including two-party events, duplicate shot-clock line removed (NARR-01/04/05, D-12/D-12a)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 15-05-PLAN.md — The NARR-01 deliverable: line-inventory extraction script, the rendered audit page, and Wyatt's single review pass (blocking approval checkpoint, D-01…D-04/D-06)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 15-06-PLAN.md — Apply the approved pruning and final wording across both sources, then reconcile the shipped tree against the approved record (NARR-01…05)

### Phase 16: UI/UX Polish, Social Preview & Support

**Goal**: The interface feels consistent and polished, shared links preview well with a favicon, and players can support the game via Ko-Fi.
**Depends on**: Nothing (independent low-risk polish and additions; can proceed in parallel with Phases 13–15). Explicitly does NOT gate on Wyatt's narration feedback in Phase 15 — start this work concurrently.
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05, UI-06, UI-07, META-01, META-02, KOFI-01
**Success Criteria** (what must be TRUE):

  1. Padding between the flippenator row, gameboard, narrator, captains box, and footer is consistent. *(UI-01)*
  2. Icons rising out of boats stay fully opaque for 1 second before fading; the moveable-square orange highlight is 10% smaller and has a more distinct mouse-hover effect. *(UI-02, UI-03, UI-04)*
  3. Clicking "Host a Crew" goes straight to the lobby/seat screen (skipping the "Create the game" screen), and the lobby shows each name once — your seat reads "{name} – you" (or "{captain} – you"), with no "Crustbeard – Crustbeard" doubling. *(UI-05, UI-06)*
  4. At end-of-voyage the empty narration/action box is hidden/collapsed once the End-of-Voyage summary appears (no large empty box left on screen). *(UI-07)*
  5. Shared links and search results show a preview image (Open Graph / Twitter card), and the site serves a favicon. *(META-01, META-02)*
  6. A Ko-Fi "Buy me a cookie" button appears in the footer (right of Feedback, styled the same) and in the Credits modal (after the credits text). *(KOFI-01)*

**Plans**: TBD
**UI hint**: yes

**Added during Phase 15 (host/guest drift — see 15-CONTEXT D-55/D-56):**

  - Give guest sail-highlights `class:"sailCell"` and drop the inline fill/opacity so host and guest
    take the same CSS. Today the guest board has no pulse animation, no hover feedback, and a
    dimmer/different orange — the affordance that says "clickable" is missing for anyone who joined
    rather than hosted. One line in `remotePickHighlights()` (`src/ui/flow.js:1040`). Do it in the
    same sitting as 15-06's D-35 wording fix, which touches the same two functions.

  - **Host/guest render-parity test** (`scripts/`, wired into `npm test`): assert `localAsk` and
    `watchPrompt` emit the same CSS class set (`apBack`, `apMsg`, `apBtns`, `apBtn`, `apDisabled`,
    `apSub`, `recipes`), and that both sail-highlight paths agree on `sailCell`. Static source
    scanning is fine — matches the existing `scripts/*_check.js` gates. The two prompt renderers
    currently match by discipline, not structure; nothing would notice if they drifted.

### Phase 17: Final Multiplayer Verification

**Goal**: Confirm the milestone is playable end-to-end in the target browsers — the critical clock stall is fixed and a multiplayer game plays through from start to finish.
**Depends on**: Phases 13, 14, 15, 16 (final end-to-end gate over the full milestone)
**Requirements**: VERIFY-01
**Success Criteria** (what must be TRUE):

  1. In Safari, a two-window multiplayer game starts on its own with no clock-stall workaround. *(VERIFY-01)*
  2. The game plays through from the first turn to end-of-voyage across both Safari and Chrome windows. *(VERIFY-01)*
  3. Storm movement and pause/resume observed during the playtest behave as fixed — no lost game state and no false "dock held fast" message. *(VERIFY-01)*

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17. Within v1.2, Phases 13–16 are independent and may be planned/executed in parallel; Phase 17 gates on all four.

| Phase | Milestone | Plans Complete | Status | Completed |
| ----- | --------- | -------------- | ------ | --------- |
| 1. Critical Bug Fixes | v1.0 | — | Complete | 2026-07-24 |
| 2. Battle & AI Overhaul | v1.0 | — | Complete | 2026-07-24 |
| 3. Narration System | v1.0 | — | Complete | 2026-07-24 |
| 4. UI/UX Polish | v1.0 | — | Complete | 2026-07-24 |
| 5. Bot Personalities | v1.0 | — | Complete | 2026-07-24 |
| 6. End of Voyage Celebration | v1.0 | — | Complete | 2026-07-24 |
| 7. Foundation & Determinism Baseline | v1.1 | 3/3 | Complete | 2026-07-25 |
| 8. Engine Extraction & Node Harness Migration | v1.1 | 5/5 | Complete | 2026-07-25 |
| 9. Networking Layer & Watcher Cleanup | v1.1 | 5/5 | Complete | 2026-07-25 |
| 10. App State & De-globalization | v1.1 | 7/7 | Complete | 2026-07-25 |
| 11. UI Extraction, Orchestration & Bridge Removal | v1.1 | 8/8 | Complete | 2026-07-25 |
| 12. Verification & Validation | v1.1 | 4/4 | Complete | 2026-07-25 |
| 13. Multiplayer Turn Clock | v1.2 | 3/3 | Complete    | 2026-07-26 |
| 14. Engine-Adjacent Gameplay Fixes & Determinism | v1.2 | 6/6 | Complete    | 2026-07-26 |
| 15. Narration Audit & Fixes | v1.2 | 6/6 | In Progress|  |
| 16. UI/UX Polish, Social Preview & Support | v1.2 | 0/TBD | Not started | - |
| 17. Final Multiplayer Verification | v1.2 | 0/TBD | Not started | - |

## Next Milestone: v1.3 "Look, Feel & Front Door" — DRAFTED, NOT YET ACTIVE

Drafted 2026-07-31 from Wyatt's punch list (4 features + 6 bugs). **Not started.** He ruled the same
day that **v1.2 closes properly first** — Phase 17's manual Safari + Chrome two-window playtest runs
*before* this milestone is activated, so v1.2 is not archived with an open phase inside it.

**To activate once Phase 17 passes:** `/gsd-new-milestone v1.3 Look, Feel & Front Door`
(this section is the input — it is written to be handed straight to the roadmapper).

**Goal:** The game *looks* alive and the front door stops losing people — a living board, a real
About page, sound, and the five interface bugs that made playtesters hesitate.

### Scope

| In | Out |
|---|---|
| WIND-01/02/03, ABOUT-01/02, META-01, AUDIO-01/02/03, FIX-01, FIX-02, FIX-03, FIX-04, FIX-06, FIX-07, FIX-08, FIX-09 | **FIX-05** (paid anchor narrates "still docked") |

**Why FIX-05 is excluded — Wyatt's call, 2026-07-31.** Its root cause is unconfirmed. `windPush()`
returns on `mooredReason` *before* reaching the pay-to-anchor branch (`src/engine/index.js:280-287`),
so it may be an **economy bug** — a bot sheltering for free — wearing a copy bug's clothes. If the
fix lands in the engine it forces the determinism re-record, which would drag this whole milestone
through the one-way door. **Investigate it separately** (`/gsd-debug`); if it turns out to be wording
only, it drops into Lane C for free. If it is the engine, it joins **The Gated Re-Record** batch.

### The four lanes — built to run in parallel

The lanes are drawn along **file boundaries**, not by size. That is the whole point: they do not
collide, so they can be planned and executed concurrently.

| Lane | Requirements | Owns these files |
|---|---|---|
| **A — Board comes alive** | WIND-01, WIND-02, WIND-03 | `src/ui/board.js` + new sprite assets |
| **B — The front door** | FIX-01, ABOUT-01, ABOUT-02, META-01 | `index.html` (markup/head), `src/ui/lobby.js`, new About page |
| **C — Prompts & polish** | FIX-03, FIX-06, FIX-04, FIX-07, FIX-08, FIX-09 | `src/ui/panel.js`, `index.html` (CSS block), `src/ui/util.js`, `src/orchestrator.js` (FIX-07's battle event + FIX-08's win banner), `src/ui/recipe.js` (FIX-08) |
| **D — Sound** | FIX-02 **then** AUDIO-01, AUDIO-02, AUDIO-03 | new audio module, clock control |

**Two ordering constraints inside the lanes:**

- **Lane D is internally sequential.** FIX-02 must land **first**: AUDIO-02 places the mute button
  *"to the right of the turn clock"*, and solo mode has no turn clock today. Until FIX-02 renders the
  disabled clock, AUDIO-02's placement is undefined in solo.
- **Lane B: ABOUT-01 before META-01.** META-01 wants a large Google preview image; the About page's
  screenshot is the first in-page image the site has ever had for Google to promote. META-03 (Search
  Console verification) is **Wyatt's own action, not code**, and is the slowest-moving piece —
  crawl latency is days to weeks — so he should start it well before the code lands.

**Lane C's one shared-file risk:** FIX-06 edits the CSS block in `index.html` while Lane B edits
markup in the same file. Different regions, but the same file — if both lanes run at once, expect
merge friction and sequence the `index.html` touches deliberately.

### Hard constraints — these are gates, not preferences

1. **Nothing in this milestone may touch `src/engine/index.js` or change what it emits.** This is
   the property that keeps the lanes parallel and keeps the milestone clear of the determinism
   re-record. `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 is explicit: the 31-seed corpus is re-recorded
   **exactly once**, so anything that forces it must queue with the rest of that batch. If a lane
   finds itself needing an engine change, **stop and re-scope** — do not spend the one-way door.
   **FIX-07 is the one item that comes close and the rule is what keeps it in scope:** it needs a
   new field on the battle event, and `scripts/determinism_baseline.js` captures via `loadEngine()`
   — the **engine only**, never the async orchestrator. So the field goes in `src/orchestrator.js`
   and the engine's identical flaw is left for the re-record batch. Adding it to
   `src/engine/index.js` instead would change all 31 fixture hashes and drag the whole milestone
   through the door for one narration line.
2. **WIND-01 is the single largest Safari risk this project has taken.** BUG-01 was a Safari
   near-crash caused by storm-overlay compositing, and the real fix was a pre-baked PNG tile.
   WIND-01 puts a **permanently-running animated layer on every ordinary turn** — the same class of
   cost, on a far bigger surface than a storm that appears occasionally. **A Safari performance pass
   is a gate on this milestone, not a courtesy.** Reuse the pre-baked-tile approach
   (`stormLayerSpecs()` / `buildStormLayers()` / `.rlayer`, `src/ui/board.js:272-340`) rather than
   inventing a new animation path.
3. **FIX-03 must not change the measured panel height.** BUG-01's Safari fix measures the finished
   height exactly once per message so the box animates a single time instead of on every character.
   Hiding the buttons with `display:none` would re-measure and reintroduce that cost — use
   `visibility`/`opacity`. It must also respect `prefers-reduced-motion` (read in JS, per
   `src/ui/panel.js:299`) and account for **the shot clock running during the reveal** — delaying
   buttons shortens a player's window to act, which is a fairness cost on a long prompt.
4. **Copy changes are inventory changes.** FIX-04 and any other player-facing text edit fall inside
   the copy-integrity inventory tracked by `.planning/todos/pending/copy-shipped-vs-approved-gate.md`.
   Record them. The failure mode this project has already lived through is silent divergence between
   shipped source and Wyatt's approved dispositions.
5. **The About page must not become a third copy of the rules.** They already exist twice — the
   How-To-Play modal (`index.html` ~`:760`) and `RULES.md` / `Rules_boardgame.md`. Share one source
   or duplicate deliberately and say so; a third divergent copy is the failure mode.

### Sequencing

**v1.2's Phase 17 playtest runs first** (Wyatt, 2026-07-31). v1.3 then has its **own** Safari gate
per constraint 2, which re-covers the same ground against the finished, animated board — so the
milestone ends where it needs to regardless.

### Suggested phase shape for the roadmapper

Continue phase numbering from v1.2 (which ends at 17). Four buildable phases plus a gate:

| # | Phase | Requirements | Lane |
|---|---|---|---|
| 18 | Board comes alive | WIND-01/02/03 | A |
| 19 | The front door | FIX-01, ABOUT-01/02, META-01 | B |
| 20 | Prompts & polish | FIX-03, FIX-06, FIX-04, FIX-07, FIX-08, FIX-09 | C |
| 21 | Sound | FIX-02 → AUDIO-01/02/03 | D |
| 22 | Safari & cross-browser gate | (constraint 2) | — |

Phases 18–21 have **no dependency on each other** and are intended to be planned and executed
concurrently. Phase 22 gates all of them.

---

## Milestone Backlog

Drafted 2026-07-31. Every open backlog item has exactly one home below — nothing is unassigned.
Wyatt ruled on 2026-07-31 that **v1.2 finishes first** (Phases 16 and 17 stay in v1.2, with the two
economy-corruption bugs added ahead of them as a new phase). Milestone *ordering* after v1.2 is not
yet decided; the grouping is.

**v1.2 tail — finish before anything below**

| Phase | Content |
|---|---|
| **NEW: Economy Correctness** | CR-02 (a trade can delete the wrong crate and mint one that never existed), CR-03 (fleeing a battle mints coins), and extending G6's approved shared re-validation helper from coins to crates. Wyatt: *"ship it and fix those next."* Sequenced **ahead of** Phase 16 per his own note in STATE.md |
| **Phase 16** | UI/UX polish, social preview + favicon, Ko-Fi (UI-01…07, META-01/03, KOFI-01). Two of its add-on notes are **already done**: the guest sail-highlight fix landed as G25, and the host/guest parity gate exists as `npm test` gate 17 |
| **Phase 17** | Final Safari + Chrome two-window playtest (VERIFY-01) |

**Candidate milestones after v1.2** — grouped by what must ship together, not by size:

| Candidate | Contents | Why grouped this way |
|---|---|---|
| **Look & Feel** → **now v1.3, drafted above** *(HIGH — Wyatt, 2026-07-31)* | WIND-01/02/03, ABOUT-01/02, META-01 — **plus** AUDIO-01/02/03 and FIX-01/02/03/04/06, folded in the same day | All drawing-layer only, so **no determinism re-record** and the items can run in parallel. The About page's screenshot is what finally gives Google an in-page image to promote, so META-01 belongs with it. Superseded by the v1.3 draft — see that section, not this row |
| **Fast to Load** | LOAD-01…04 — welcome screen paints instantly, heavy art loads only on play, ~18 MB → 3–5 MB | The single biggest thing a first-time visitor feels; independent of everything else |
| **The Gated Re-Record** | Engine purity (`spoil`/`gave`/`ilabelImg`/the dead `asym` branch), STORM-02 guest storm animation, the bot-intelligence improvements, **and FIX-05 (paid anchor narrates "still docked") *if* its investigation finds the cause in `windPush`'s moored-first precedence** | **One-way door.** `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 is explicit: the 31-seed corpus is re-recorded exactly once, so every queued item must land before that single `--capture`. Landing any one alone spends the whole cost for a fraction of the benefit |
| **Narration Pacing & Copy Integrity** | NARR-07 (Phase 18 below), the shipped-vs-approved copy gate, the two-scheduler unification, the two never-eyeballed D-41 greyed states | All four are the narration system's remaining debt, and three of them touch the same timing code |
| **Fair Play Online** | Every-client-sees-every-recipe, human trade counter-offer | Both are about the negotiation being honest between players who cannot see each other |
| **Welcome Aboard** | TUT-01…03 tutorial, AUDIO-01…03 sound effects | Both are first-ten-minutes content rather than fixes |
| **Island Redesign** | ISLAND-01…04 | Needs its **own second re-record** — it cannot ride the batch above, so it stands alone |
| **Platform Debt** | NETMOD-01, DX-01, DX-02, Phase 999.1 resume-mid-narration | No player sees any of it; do it when it starts costing us |

**Carrying no work — protective rulings only.** `flee-not-offered-when-broke`,
`flip-outcomes-all-caps-in-play-only` and `ships-stack-after-rim-sweep` are closed decisions. Their
todo files exist specifically to stop a future sweep "fixing" them; read them before touching those
branches.

## Backlog

### Phase 18: Narration Pacing — commentary, not a gate

**Goal**: Narration reads as a running commentary that never gates play — in sync for every player, replaced cleanly by the next line, and never a reason the game feels slow.
**Depends on**: Phase 15 (narration copy + the guest hold/fade from D-57 must land first).
**Requirements**: NARR-07
**Success Criteria** (what must be TRUE):

  1. The game loop does not wait on narration. `flash()` is awaited at **27 call sites** today, each blocking for `typewriter reveal + msgHoldMs(text) + 500ms`; after this phase, narration timing is a display concern only. *(NARR-07)*
  2. A player who acts before a line has finished appearing does not stall anyone else; the next line replaces the current one for every player at once. *(NARR-07)*
  3. Nothing blurs past unread — removing the block must not make a busy round unreadable. Judged by a real two-player playtest, before and after, not by a unit test.
  4. Host and guest share one timing source (`msgHoldMs`), so a future change to the hold applies to both — the D-57 failure mode cannot recur.

**Origin**: Phase 15 playtest, 2026-07-29 (15-CONTEXT D-58). Wyatt: *"everyone's narration should stay in sync… what we *don't* want is for the game to drag."*
**Plans**: TBD

### Phase 999.1: Resume restores exact narration step on reload (BACKLOG)

**Goal:** [Captured for future planning] On page reload mid-game, resume rebuilds state by replaying the recorded decision log with narration suppressed (`appState.replaying`), landing the player back at their own next turn with all already-decided bot turns silently re-applied — no narration shown for them. The player expects to return exactly where they left off, so it feels confusing. Ideal: resume restores the exact narration/animation step that was on screen at reload time. NOT a Phase 13 regression (pre-existing v1.1 host-reload/solo-resume replay contract; 13-02 only added the schema-version guard in front of resume) and NOT a fairness exploit (replay only re-runs already-made decisions). Implementation note: would require persisting the transient narration cursor / current-turn display position in the save blob (`pp_solo`/`pp_sess`), which the decision-log model deliberately does not capture today. Relevant code: `src/orchestrator.js` `resumeSoloGame`/`resumeHostGame` + the `appState.replaying` suppression in `netNarrate`/`showNarration`/`sleep`. Surfaced during Phase 13 CLOCK-01 UAT (test 1, Part A).
**Requirements:** TBD
**Plans:** 0 plans

Plans:

- [ ] TBD (promote with /gsd-review-backlog when ready)
