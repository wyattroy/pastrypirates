# Pastry Pirates


## Current State (updated 2026-08-18)

**Live: v1.2 + v1.3 partial** — playpastrypirates.com serves the repo root. **In development: the
`4/` redesign**, served at playpastrypirates.com/4, which v2.0 promotes to become the game.

**The two-week gap in this record is real and deliberate.** Between 2026-08-05 and 2026-08-15 the
project moved to a ground-up redesign built outside GSD by Wyatt's explicit instruction
(`4/RULES-V2.md:14`). The root game has had **no code commit since 2026-08-02**. `.planning/` was
untouched throughout, so every file in it described v1.3 until this milestone opened. It was not
neglect — it was a sanctioned prototype, and CLAUDE.md's "HOW WYATT PLAYS WHAT YOU BUILT" documents
the `/4`-ships-on-`main` loop that made it possible.

**The lineage, each build a verbatim copy plus one axis of change:**

| Build | Date | What it added |
|---|---|---|
| `v2/` | 2026-08-05 | the new ruleset — 62 clarifying questions answered by Wyatt |
| `v2bakeoff/` | ~2026-08-08 | the bake-off minigame |
| `3/` | ~2026-08-10 | the race-planner bot brain (MLE-fitted on 27,867 outcomes, +10.2 ladder) |
| `4/` | 2026-08-11 | the whole visual redesign — 65 commits, 23 numbered playtest rounds in 5 days |

**Where v1.3 landed.** Phases 18, 19, 21 and 22 shipped and are live. **Phase 20 ("The Board Comes
Alive") was never started and is now retired unbuilt** — `4/` built drifting wind and whirlpools
independently, and v1 is being retired to `/classic`, so polishing it would be wasted effort.
v1.3 closes as superseded by v2.0.

**Intake research for v2.0:** `.planning/research/v2.0-intake/` — five reports, 1,803 lines
(HISTORY, CODE-QUALITY, MULTIPLAYER-GAP, DOCS-AND-RULES, DESKTOP-GAP). Read these before planning
any v2.0 phase; they are the only synthesis of a development period that left no GSD artifacts.

## What This Is

Pastry Pirates is a browser-based, pirate-themed pastry board game playable solo (against AI captains) or in real-time multiplayer via Firebase sync. Players sail a grid of islands gathering ingredients, trading, battling, fishing, and racing to bake a winning recipe.

**v1.x (repo root, live)** cleared two playtesting punch lists (v1.0, v1.2), split the ~5,200-line `index.html` monolith into native ES modules with no build step (v1.1), and brought the board and the front door to life (v1.3, four of five phases).

**v2.0 is a different game, not a further polish pass.** The `4/` redesign — a new ruleset answered across 62 questions, a bake-off minigame, a race-planner bot brain fitted on 27,867 simulated outcomes, and a complete visual redesign — is being promoted to become the official game. It is a **one-way cutover, not a merge**: `4/` forked on 2026-08-11 and the root has not moved since 2026-08-02, so no fix is stranded on the wrong side.

## Current Milestone: v2.0 The New Game

**Goal:** Make the `4/` redesign the official Pastry Pirates — with multiplayer restored, a real
desktop layout, and the safety net and written record the prototype skipped.

**The order is a constraint, not a preference.** Multiplayer → cutover → desktop. The live game must
never lose multiplayer, which is why `4/` stays at `/4` until it can host a networked game.

**Target features:**
- **Multiplayer restored to `4/`** — the Firebase tags come back, and the bake-off gets the remote
  branch it was deliberately built without. A rival sees nothing until the reveal, which needs a
  private per-seat channel the current room-readable `prompt` node cannot provide.
- **The full test harness rebuilt against `4/`** — the 21 gates, a fresh determinism corpus for the
  new engine, and `4/src/ui/stage.js` made importable under Node so the largest new module can be
  tested at all.
- **Cutover** — `4/` becomes the repo root, today's game moves to `/classic` so no bookmark breaks,
  and `v2/`, `v2bakeoff/`, `3/` are deleted (~40k lines of near-duplicate JS, fully preserved in
  git history).
- **True widescreen desktop** — the board fills the screen height and the captains become a
  right-hand column. v1's two-column `layoutWide` grid is still present in `4/index.html:135` and
  working; it is simply overridden by the stage camera today.
- **The written record rebuilt** — `RULES-V2.md` rewritten from what the code actually does, and
  ~40 design rulings, 13 approved copy strings and the rejection graveyard lifted out of commit
  messages into `docs/`.
- **The `pp_timerOff` bleed fixed** — a live bug today, independent of every promotion decision.

**Explicitly NOT in this milestone:** any new gameplay rule. v2.0 promotes and hardens the game
that exists; it does not design a further one.

## Core Value

The game must stay playable and fair end-to-end in both Safari and multiplayer — a storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

## Requirements

### Validated

<!-- Inferred from existing shipped code (see .planning/codebase/). -->

- ✓ Browser-based pastry pirate board game (grid of islands, ingredient gathering, recipe baking) — existing
- ✓ Solo play against AI captains — existing
- ✓ Real-time multiplayer via Firebase with deterministic engine + replay — existing
- ✓ Battle system with broadside/wind mechanics — existing
- ✓ Trading, fishing, and storm/wind systems — existing
- ✓ Narration system for game events — existing
- ✓ End-of-voyage summary with stats and badges — existing
- ✓ Bot personality selection in multiplayer lobby — existing (removed in v1.0 — now hardcoded per captain)

**v1.0 Edit Pass — shipped 2026-07-24** (all 15 punch-list items, git-verified on `main`)

- ✓ Safari storm no longer near-crashes — storm rain renders from a pre-baked PNG tile; narration box height snaps instead of animating (BUG-01) — v1.0
- ✓ Multiplayer timer pause/unpause stays interactive; refresh restores the in-progress voyage instead of resetting; deterministic engine survives the cycle (BUG-02/03/04) — v1.0
- ✓ Battle reflips removed (attacker + wind advantage); no post-battle position swap (BATL-01/02/03) — v1.0
- ✓ Bots play the new no-reflip mechanics, weigh wind, trade with whoever holds more of the resource, escape when boxed in, and no longer lose every game (AI-01…06) — v1.0
- ✓ Narration pass — icon-before-name docking, trade cooperation line, "it's still" vs "now", sustained-wind gusts, 20% faster pacing, empty-island grab-3 (NARR-01…05, 07) — v1.0
- ✓ Storm-text audit delivered to Wyatt and his rewrite applied (NARR-06) — v1.0
- ✓ UI/UX polish — clock cropping + orange countdown, longer boat/fish animations, compass STORM label removed, juicier movable squares, leave-game modal, parley Back, Flippenator, feedback copy (UI-01…10) — v1.0
- ✓ Bot personalities hardcoded per captain; lobby picker removed (BOT-01/02) — v1.0
- ✓ End of voyage — win no longer announced in the blue box, gets its own recipe-image box, Unluckiest-pirate badge, redesigned 5-badge set (approved), confetti celebration (EOV-01…05) — v1.0

**v1.1 Monolith Refactor — complete (Phases 7–12, all verified)**

- ✓ `index.html` split into native ES modules (zero build step): UI in `src/ui/*`, orchestration in `src/orchestrator.js`, `src/main.js` composition root; `index.html` reduced to markup + one module entry; strangler-fig bridge removed; dependency graph acyclic (SPLIT-03/05/06) — Phase 11
- ✓ Firebase `.off()` watcher teardown — all 18 watchers registry-mediated with clean attach/detach (NET-01/02/03, SPLIT-04) — Phase 9
- ✓ Tamed 40+ globals behind a single `appState` object + module exports (GLOBAL-01/03) — Phase 10
- ✓ Hardened deterministic engine/replay module seams + regression harness; determinism 30/30 preserved (ENGINE-01/02/03, FOUND-04) — Phases 7–8
- ✓ Verification: expanded headless harness + Chrome MCP solo & multiplayer end-to-end + Safari storm re-verified (VERIFY-01…04) — Phase 12

**v1.2 Playtest Fixes & Polish — in progress (Phases 13–17)**

- ✓ Multiplayer turn clock: the MP clock no longer stalls "paused" before the game starts (stale pre-refactor local session state self-heals at boot via a per-blob schema-version stamp, without wiping a live game, device id, or timer preference); a host-authoritative play/pause any player can trigger freezes the whole table and resumes from the remaining time — kept in sync across windows by re-broadcasting the clock on pause/resume; the large "PAUSED" symbol is itself a clickable resume button (CLOCK-01/02/03) — Phase 13, human-verified

### Active

<!-- v2.0 The New Game scope. Requirements defined in .planning/REQUIREMENTS.md. -->

- Multiplayer restored to `4/`, including a networked bake-off with rival bowls private until reveal — v2.0
- Full test harness rebuilt against `4/` — 21 gates, fresh determinism corpus, `stage.js` importable — v2.0
- Cutover: `4/` to the repo root, v1 to `/classic`, `v2/`+`v2bakeoff/`+`3/` deleted — v2.0
- True widescreen desktop layout — board fills height, captains as a right-hand column — v2.0
- Written record rebuilt — `RULES-V2.md` from the code, rulings and copy approvals out of commit messages — v2.0
- `pp_timerOff` localStorage bleed fixed — v2.0

### Deferred to a later milestone (captured as Future in REQUIREMENTS.md)

- Interactive tutorial (30–60s guided walkthrough → auto-start solo game) + "How To Play" button — deferred from v1.2 as a large feature
- Sound effects (Luis's SFX) with default-on playback + mute button — deferred from v1.2 as a large feature
- Island redesign (all islands 4 squares, unique shapes, adjacent ingredients, art on empty square) — deferred; touches the deterministic board generation and warrants its own careful pass

### Out of Scope

- A bundler/minifier toolchain (Vite/esbuild) — native ES modules preserve the "no build step" principle; a bundler is a separate decision
- TypeScript migration — out of scope for this structural pass

## Context

- **v2.0 intake research**: `.planning/research/v2.0-intake/` — five reports, 1,803 lines, reconstructing a development period that produced no GSD artifacts. **Read the relevant one before planning any v2.0 phase.** `HISTORY.md` (lineage, ~40 rulings surviving only in commits, 23 playtest rounds, the rejection graveyard), `CODE-QUALITY.md` (59 findings: 5 critical, 14 high), `MULTIPLAYER-GAP.md` (the v1 wire contract, and what `4/` actually has), `DOCS-AND-RULES.md` (CLAUDE.md rule ledger, doc inventory, spec-vs-code spot checks), `DESKTOP-GAP.md` (every layout-deciding code site, measured).
- **`4/` deploys by existing on `main`**: `playpastrypirates.com` is GitHub Pages serving `main` from the repo root with no build step; `/4` is the `4/` directory on that same branch. Pushing work-in-progress to `main` is the normal thing to do and does not touch the root game — see CLAUDE.md "HOW WYATT PLAYS WHAT YOU BUILT" for the merge loop and the build-stamp discipline. **Nothing is ever a cache here, because there is no build step.**
- **What `4/` got right, and should not be "fixed"**: the engine is determinism-clean (zero `Math.random`, zero `Date.now` in `4/src/engine/` and `4/src/shared/`, one seeded `mulberry32`) and DOM-free; module layering holds with no circular imports; there is zero commented-out code in 18k lines; and all five standing design rules are verified honored, including the narration top-to-bottom order correctly extended to a newly added element at `4/src/ui/flow.js:230`.
- **Two `4/` improvements that live still lacks** — `4/src/main.js:211` and `4/src/orchestrator.js:1697` close real gaps in the root game. Back-port them regardless of promotion timing.
- **Current state**: v1.0 edit pass shipped 2026-07-24. v1.1 monolith refactor complete (Phases 7–12) — `index.html` split into native ES modules under `src/`, globals tamed behind `appState`, Firebase watchers registry-mediated, determinism 30/30 and Safari storm re-verified. v1.2 is a second live-playtest punch list (see `notes/edits for pastry pirates-2.pdf`).
- **Codebase**: mapped in `.planning/codebase/`. As of v1.1, game logic/UI/networking are split into native ES modules under `src/` (engine, ui, net, orchestrator, main), loaded from a slim `index.html` via one `<script type="module">`. `lab.html` is a secondary/experimental page. `cocoa_pirates_sim.py` is a Python simulator. Assets and art in `assets/` and `art-review/`; sound effects staged in `sfx/` (for the deferred audio feature).
- **v1.2 playtesting source**: a second punch list from live Safari multiplayer testing, documented in `notes/edits for pastry pirates-2.pdf`. The critical item is a multiplayer turn-clock stall that blocks the game from starting.
- **Known debt relevant to this work**: 40+ global variables, Firebase `.on()` watchers registered without `.off()` cleanup (memory leaks / stale handlers), a deterministic engine + replay system that is fragile — all three intersect the two urgent bugs.
- **Playtesting source**: the 15-item punch list came from a live multiplayer game (~7pm ET) plus Safari testing, documented in `notes/edits for pastry pirates.pdf`.
- **Multiplayer test harness**: Chrome tabs + Firebase; shared-localStorage `pp_id` gotcha; synthetic-prompt injection for deterministic remote-render checks (see MEMORY.md).

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS in `index.html`, Firebase Realtime DB for multiplayer — edits happen in place, no framework introduction
- **Compatibility**: Must run correctly in Safari (the storm perf bug is Safari-specific) and Chrome
- **Determinism**: The multiplayer deterministic engine + replay must remain intact — timer/pause fixes must not break lockstep state
- **Approval gates**: End-of-voyage badge redesign and storm-text rewrite require Wyatt's explicit sign-off before/within implementation
- **Milestone order (v2.0)**: multiplayer → cutover → desktop — **the live game must never lose multiplayer**, so `4/` stays at `/4` until it can host a networked game. Desktop work happens after the cutover, on the real game.
- **Cutover is one-way (v2.0)**: `4/` forked 2026-08-11; root has had no code commit since 2026-08-02. There is nothing to merge back, and no fix is stranded — but it also means **every v1 fix made after a cutover has to be made in the new tree**.
- **No new gameplay rules (v2.0)**: this milestone promotes and hardens the game that exists. A rule change mid-promotion invalidates the determinism corpus being recorded and the spec being written from the code.
- **The `4/` safety net does not exist yet**: root `npm test` runs 21 gates and passes, and **not one of them loads `4/`**. Until the harness is rebuilt, a green `npm test` says nothing about the game being promoted — the exact "gate scanning the wrong tree" trap in `docs/HARD-WON-LESSONS.md` §3.
- **Promotion mechanics are load-bearing, not cosmetic**: `4/index.html:10` carries `noindex, nofollow` (correct at `/4`, de-indexes the live game at root), the title still reads `v3 bot test`, `ASSET_BASE="../assets/"` (`4/src/shared/index.js:24`) resolves art one directory above the app, `about.html` links are already 404 at `/4`, and `robots.txt` carries `Disallow: /4/`.
- **Bot/human parity** *(standing design invariant — Wyatt, 2026-08-01, "and it has been from the
  beginning")*: **Bots play by exactly the same rules and have exactly the same affordances as human
  players.** If a human cannot do a thing, a bot must not be able to do it either — and the reverse.
  Bots differ only in *how they choose*, never in *what they may do*.

  **This is a rule, not a preference, and it answers a whole class of question in advance.** Any
  future "should bots be allowed to…?" is already answered: *exactly what a human can do.* **Do not
  raise it as an open design decision.**

  **But parity is a symmetry requirement, not a ceiling on bots** *(Wyatt, 2026-08-01)*. When the two
  sides differ, **which side moves is a separate design choice** — sometimes the bot loses an
  affordance, sometimes the human *gains* one. His own example: bots can counter-offer in a trade and
  humans cannot, and the fix there is to **give humans the counter-offer**, not to take it from bots.
  Ask "which version makes the better game?", not "what do humans have today?". **Levelling the human
  up is frequently the right answer** — an asymmetry running against the player is the worse kind. v1.2's AI-01 was framed as a question to be
  *"decided with Wyatt"* when this invariant had already settled it; FIX-18 (bots fishing *and*
  docking at Tortuga in one turn) repeated the mistake. Both should have been read straight off this
  rule.

  Practical consequence: the live bot path (`src/ui/flow.js`'s `botTurn`) and the headless engine
  (`src/engine/index.js`'s `takeTurn`) must both enforce whatever the human path enforces. Divergence
  between those three is where parity breaks silently.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Sequence critical bugs (Safari storm perf + MP timer pause) first as Phase 1 | They break core playability; everything else is polish on a working game | ✓ Good — shipped v1.0 |
| Fix in place rather than refactor the monolith | Edit pass scope; refactor is large and separately tracked as out of scope | ✓ Good — shipped v1.0 |
| Mockup-then-approve gate for end-of-voyage badges | Wyatt explicitly wants to approve badge presentation before build | ✓ Good — mockup approved, badges shipped v1.0 |
| Storm-text audit produces a list back to Wyatt for rewrite | Copy is authored by Wyatt, not auto-generated | ✓ Good — audit delivered, rewrite applied v1.0 |
| Hardcode bot personalities to captain identities | Removes lobby choice; personalities become part of each captain's character | ✓ Good — shipped v1.0 |
| Real Safari storm fix was pre-baked PNG rain, not the typewriter batch | First hypothesis (per-char DOM writes) helped but the compositing cost was the storm rain; PNG tile was the actual fix | ✓ Good — Safari-verified v1.0 |
| v1.2 splits the second punch list: fixes/polish now, big features later | Tutorial, sound effects, and island redesign are large enough (and the island redesign touches deterministic board generation) to warrant their own milestone; keeps v1.2 a fast polish pass | Pending — v1.2 |
| Ko-Fi button included in v1.2 despite a third-party ko-fi.com script embed | Small, self-contained monetization add Wyatt wants live now; approved with awareness of the external script | Pending — v1.2 |
| **Bots have identical rules and affordances to humans** — they differ only in how they choose, never in what they may do | Wyatt's design intent from the start, stated explicitly 2026-08-01. Settles every "should bots be allowed to…" question in advance; two items (AI-01, FIX-18) were wrongly framed as open decisions | ✓ Standing invariant — see Constraints |
| Multiplayer pause stays in sync by re-broadcasting the host-authoritative clock, not per-client math | Live UAT found guests desynced (froze at a different number, raced to 0 on resume) because the host recomputed the deadline locally but never re-broadcast it; guests must render frozen/running state from the broadcast payload, never host-only locals | ✓ Good — fixed + human-verified Phase 13 |
| **The `4/` redesign becomes the official game (v2.0)** | Wyatt, 2026-08-18: the design, rules and engine of `4/` are what he wants. The prototype was sanctioned, not rogue — and its engine is determinism-clean, correctly layered, with zero commented-out code in 18k lines and all five standing design rules verified honored | — Pending — v2.0 |
| **v1 is retired to `/classic`, not deleted; `v2/`, `v2bakeoff/`, `3/` are deleted** | Nothing a player has bookmarked should break, but five copies of the game make every "which file?" question ambiguous. The three intermediate builds are fully preserved in git history | — Pending — v2.0 |
| **Multiplayer before cutover; desktop after** | The core value is that the game stays playable in multiplayer. Cutting over before `4/` can host a networked game would take multiplayer away from real players for the duration | — Pending — v2.0 |
| **The networked bake-off keeps rival bowls private until the reveal** | Wyatt, 2026-08-18. It preserves how the scene feels solo. It is also the harder option: the shared `rooms/<C>/prompt` node is room-readable, so this requires a private per-seat channel that does not exist today — which is precisely why `4/src/ui/flow.js:584` was written with "NO decisionIsLocal BRANCH, deliberately" | — Pending — v2.0 |
| **Full test harness rebuilt against `4/` before cutover** | The 21 gates and the 31-seed determinism corpus are what made v1 trustworthy, and multiplayer lockstep is the thing they protect. `4/` has 4 scripts, one permanently red, and its largest module cannot be imported under Node | — Pending — v2.0 |
| **True widescreen, not a centred phone column** | Wyatt, 2026-08-18. At 1440×900 only 5.9 of the board's 15 rows are visible today because the stage camera derives its height from window aspect ratio. v1's two-column `layoutWide` grid survives intact in `4/`, so the two-column treatment has already been paid for once | — Pending — v2.0 |
| **`RULES-V2.md` is rewritten from the code, and the commit-message record is lifted into `docs/`** | The spec was copied in on 2026-08-11 and never edited — byte-identical across `v2/`, `v2bakeoff/`, `3/`, `4/`, header still says "Lives in `v2/`", and §12 is titled "No bakeoff" while the game ships one. 3 of 10 spot-checked rules disagree with the code | — Pending — v2.0 |
| **Phase numbering restarts at 1 for v2.0** | New game, new engine; 0 phase directories on disk, so the restart is free. Also avoids collision with the sketched Phase 26 of a v1.4 that will not now happen | — Pending — v2.0 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-18 — v2.0 "The New Game" opened. The `4/` redesign is promoted to become the
official game: multiplayer restored (including a networked bake-off with rival bowls private until
reveal), the full test harness rebuilt against `4/`, cutover with v1 retired to `/classic`, a true
widescreen desktop layout, and the written record rebuilt from the code and the commit log. v1.3
closes as superseded — Phase 20 retires unbuilt because `4/` did that work independently. Phase
numbering restarts at 1. Intake research: `.planning/research/v2.0-intake/`.*

<!-- Prior footer, retained for provenance: -->
*2026-07-26 — after Phase 14 (Engine-Adjacent Gameplay Fixes & Determinism) complete: STORM-01, AI-01, VERIFY-02 validated and human-verified. The determinism corpus was re-recorded once behind a blocking human decision and grew 30 → 31 seeds to preserve `shipwrecked` coverage; the gate is green at 31/31. STORM-01's scope was amended to solo/host — multiplayer guest storm animation is backlogged as STORM-02, because delivering it would require changing the engine event stream and forcing another corpus re-record.*
