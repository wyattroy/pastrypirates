---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: The New Game
current_phase: 02.1
current_phase_name: one-game-every-captain-one-render-path-for-host-and-guest
status: executing
stopped_at: Completed 02.1-04-PLAN.md
last_updated: "2026-08-19T23:06:52.721Z"
last_activity: 2026-08-19
last_activity_desc: "02.1-04: the real-Safari gate ran and found 2 turn-blocking defects — Wyatt ruled close 02.1, open 02.2"
progress:
  total_phases: 10
  completed_phases: 2
  total_plans: 17
  completed_plans: 16
  percent: 20
---

<!-- ============================================================================
     READ THIS BEFORE REPORTING PROJECT STATUS — 2026-08-02

     GIT WORKTREES ARE RETIRED. All work happens in the main checkout:
         /Users/wyattroy/Documents/Projects/pastrypirates

     WHY THIS WARNING EXISTS. On 2026-08-02 a /gsd-progress run inside the worktree
     .claude/worktrees/gsd-skill-persistence-3252ba reported v1.3 as "0 of 5 phases,
     nothing started." The truth on main was four phases shipped and live. Nothing was
     broken — .planning/ is a TRACKED directory, so a worktree on a stale branch shows
     that branch's frozen snapshot of this file. Wyatt believed he was in the main
     checkout and was handed a confidently wrong report.

     THE TELL: a workstream STATE.md reading "Not started" for work you know shipped.

     IF YOU ARE NOT IN THE PATH ABOVE, STOP and cd there before reading any .planning/
     file or answering "where are we". Ten stale worktrees were removed on 2026-08-02.
     ============================================================================ -->

# Project State

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-08-18)

**Core value:** The game must stay playable and fair end-to-end in both Safari and multiplayer — a
storm must not crash the game, and pausing the multiplayer timer must never destroy game state.

**Current focus:** Phase 02.1 — one-game-every-captain-one-render-path-for-host-and-guest
62 questions, a bake-off minigame, a race-planner bot brain fitted on 27,867 simulated outcomes,
and a complete visual redesign — is being promoted to become the official Pastry Pirates. This is
a **one-way cutover, not a merge**: `4/` forked 2026-08-11 and the repo root has had no code commit
since 2026-08-02.

**Where the two games live right now:** `playpastrypirates.com` serves the repo root (v1, live, real
players). `playpastrypirates.com/4` serves `4/` (the game being promoted). Both are `main` with no
build step — nothing here is ever a cache.

## Current Position

Phase: 02.1 (one-game-every-captain-one-render-path-for-host-and-guest) — all 4 plans complete
Plan: 4 of 4 done. **Phase verification has not been run — that is the orchestrator's, not a plan's.**
Next: open **Phase 02.2** for the two turn-blocking defects the gate found (Wyatt's own ruling).
Last activity: 2026-08-19 — the phase gate ran in real Safari for the first time and returned a
negative result.

**The build:** `PP4_STAMP` is **`2026-08-19c`** (commit `4db2c00`), confirmed serving live from
`playpastrypirates.com/4`. One drop carrying all three code plans, per Wyatt's one-drop-one-test
convention. Bumped exactly once this phase.

**What the gate found.** Wyatt hosted room BVUR in his own Safari — the first time any of `4/` has
ever run in real Safari — and Claude joined as a driven headless-Chrome guest. Holding up: the state
layer (guest boat positions identical to `events[last].state` for every seat), the day counter
advancing without a reload, the radial bloom on a guest's trade prompt, and the CAPTAINS panel
(which Wyatt confirmed is behaving as designed). **Not holding up:**

1. **A guest draws no wind pill, no clock pill and no chat bubble.** The guest *has* the wind data
   (`windNow` `"S"`, `windNext` `"W"`) and still does not paint the bar. **Plan 01's state fix was
   necessary but not sufficient** — this is the single most important finding of the phase, and
   **PAR-02 is reopened** because of it.
2. **Defect A, mechanism pinned:** a guest never sees a prompt that was already outstanding when it
   loaded. `watchPrompt()` bails on `p.seat !== appState.mySeat`, and on a fresh load that callback
   fires **before `mySeat` is assigned**. Firebase only re-fires on change, so the prompt is never
   offered again and the table deadlocks with the clock off. Proven by re-calling `watchPrompt()`
   once `mySeat` was set — the queued turn played immediately.
3. **Defect B, mechanism NOT established:** the host does not see an incoming trade offer until it
   refreshes. Hidden-tab throttling is ruled out on Wyatt's own testimony (game visible, still
   running). `flow.js:186`'s promise chaining is a candidate only.

**His ruling, asked and answered:** *"Close 02.1, open 02.2 for these."* And on the voyage:
*"Stop — I've seen enough."*

**Say plainly what that ruling is: a scoping decision, not a pass.** Plan 04's must-have *"Wyatt has
played a stretch of the voyage himself and said it holds together"* is **NOT met** — he played and
it did not hold together. The phase closes on his ruling. Do not let a later reading turn "closed"
into "the voyage held."

**Still carried, unproven for a second phase running:** the battle and storm cameras. 02.1-01 called
them correct by the same mechanism but never photographed them; no battle occurred in this voyage
either. Name them in 02.2's scope.

**Phase 2 is complete, 7 of 7.** It delivered what it was scoped to: Firebase restored, Host a Crew
and Join a Crew back on the welcome screen, three never-run crashes closed, the skip gate held in a
crew game, chat given a home in the new stage, and the crew-game narration timing fixed. Wyatt
played the gate and found seven faults; three were real defects and were fixed and re-dropped the
same day. Full account: `phases/02-multiplayer-revival/02-07-SUMMARY.md`.

**Why Phase 02.1 exists, and it is Wyatt's finding, not a session's.** Reading those fixes he said:
*"There should be one architecture that displays things for every player regardless of whether
there's a host or a guest... the only thing that needs to be distinct is something quite invisible
on the back end and just the starting flow where someone makes a game."*

The cause is confirmed in code: **every renderer reads `appState.game` directly.** On the host that
is live truth; on a guest it is a stale render shell, because a guest does not simulate the game —
it renders the state snapshot carried on each broadcast event. So `ribbonTick()` reading `g.round`
is why a guest's day counter sticks on DAY 1, and the director reading `game.players[mySeat].pos`
is why it cannot centre a guest's own boat. **Every renderer is silently wrong for a guest**, which
is why the symptom is "so many bugs in guest mode" rather than a list of unrelated ones.

His sequencing ruling: **fix the state layer first**, so the game state tells the truth on both
sides, and then delete the 43 host/guest branches across 7 files and the duplicate prompt renderer —
rather than unifying one subsystem at a time. Scope is **everything a player sees**: prompts, the
ribbon and day counter, the director/camera, narration. Host vs guest survives only as who computes
the game and who creates the room. Also in scope by his pick: the flat-card bug where a greyed
button's `why` sentence containing a coin breaks its own label past the radial cutoff, and
establishing a way to verify in **Safari**, which is what he actually plays and which nothing has
ever been tested against. **The doubled flip sound is deliberately NOT in this phase** — his call.

**Phase 1's last open question is answered.** D-07 could not be closed by any measurement, only by
Wyatt: shown what the pass dubloon did to the bots across 400 identical games, he said **"ship it"**
(2026-08-19). The payout stays at one dubloon. **Nothing in this phase forces the v2 determinism
corpus to be recorded twice**, which was the phase's whole purpose.

The Phase 1 build is **`2026-08-18e`** at `playpastrypirates.com/4` — it carries the window guard, the
namespaced turn-clock key, the pass dubloon, the narration tag and the Pass button that says what it
pays. Plan 06 deliberately did not bump past it: it changed no game code, and a new stamp with no new
gameplay behind it is the one thing the stamp exists not to do.

**Milestone shape (from `ROADMAP.md`):**

| # | Phase | Requirements |
|---|---|---|
| 1 | Before the Engine Freezes | 6 |
| 2 | Multiplayer Revival | 7 |
| 3 | The Safety Net | 5 |
| 4 | The Networked Bake-off | 3 |
| 5 | Trade Over the Wire | 3 |
| 6 | The Cutover | 11 |
| 7 | The Board Fits | 3 |
| 8 | A Desktop Worth the Width | 5 |
| 9 | The Written Record | 7 |

Phase numbering **restarts at 1** for v2.0 (Wyatt, 2026-08-18) — 0 phase directories were on disk,
so the restart was free. "Phase 1" in any v2.0 document is not v1.0's Phase 1.

## Performance Metrics

Phase 1 is the first v2.0 phase executed. Prior-milestone velocity is archived in
`milestones/v1.3-STATE.md` and in each milestone's own archive under `milestones/`.
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 21min | 2 tasks | 4 files |
| Phase 01 P02 | 8min | 2 tasks | 4 files |
| Phase 01 P03 | 24m | 2 tasks | 2 files |
| Phase 01 P04 | 1h | 2 tasks | 5 files |
| Phase 01 P05 | 42 | 2 tasks | 2 files |
| Phase 01 P06 | 1h40m | 3 tasks | 1 files |
| Phase 02 P01 | ~50min | 2 tasks | 1 files |
| Phase 02 P02 | ~65min | 2 tasks | 1 files |
| Phase 02 P03 | ~85min | 2 tasks | 1 files |
| Phase 02 P04 | ~110min | 2 tasks | 0 files |
| Phase 02.1 P01 | 45min | 3 tasks | 1 files |
| Phase 02.1 P02 | 20min | 2 tasks | 1 files |
| Phase 02.1 P03 | 30min | 3 tasks | 4 files |
| Phase 02.1 P04 | ~2h | 4 tasks | 1 files |

## Accumulated Context

### Decisions

Decisions are logged in `PROJECT.md` § Key Decisions. The ones that shape v2.0:

- **The `4/` redesign becomes the official game.** The prototype was sanctioned, not rogue — its
  engine is determinism-clean, correctly layered, with zero commented-out code in 18k lines and all
  five standing design rules verified honored.

- **v1 is retired to `/classic`, not deleted; `v2/`, `v2bakeoff/` and `3/` are deleted.** Nothing a
  player has bookmarked should break, but five copies make every "which file?" question ambiguous.
  The three intermediate builds are fully preserved in git history.

- **Multiplayer before cutover; desktop after.** Cutting over before `4/` can host a networked game
  would take multiplayer away from real players for the duration.

- **Every other captain WATCHES the networked bake-off live, on a face-down bench** (Wyatt,
  2026-08-18 — reversed from "private until the reveal" the same day, after he asked *"how hard would
  it be to let other players watch the bakeoff… that seems like a better design"*). Better **and**
  cheaper: the spectator channel `rooms/<C>/battle` already exists, already carries a bake-off
  snapshot, and is muted by one guard at `4/src/orchestrator.js:396` that a previous session
  explicitly left as his call. No competitive leak — each captain bakes their own recipe on their own
  bench. **Do not re-introduce privacy here.**

- **No shot clock on the bake-off** (Wyatt, 2026-08-18). Consequence handled, not accepted: the
  engine's fallback guess must fire on presence loss instead of expiry, or a dropped captain hangs
  the table forever (MP-13).

- **Full test harness rebuilt against `4/` before the cutover**, and before the largest work is
  built on top of it.

- **True widescreen, not a centred phone column** (Wyatt, 2026-08-18).
- **`RULES-V2.md` is rewritten from the code**, and the commit-message record is lifted into `docs/`.
- **Exactly one new gameplay rule: passing pays a dubloon** (RULE-01/02, Wyatt 2026-08-18). A second
  exception costs a determinism re-record.

- **Phase numbering restarts at 1** for v2.0.
- [Phase ?]: The stage.js watchdog setInterval is left as-is — the gate exits instead of guarding away deliberate browser behaviour (01-01)
- [Phase ?]: The accessor exclusion in no_undef_check.js is a named helper, narrow to the exact get/set keyword; CALL_RE unchanged (01-01)
- [Phase ?]: FIX-01: the new game's turn-clock preference moves to the per-game key pp4_timerOff at all five 4/-side sites; the shared legacy key is deleted exactly once per browser behind the pp4_timerOffCleaned marker (D-01/D-02) (01-02)
- [Phase ?]: D-04 in practice — pp_id, pp_lastName and pp_muted stay un-prefixed and shared; only behaviour keys split. First worked example of "share who you are, split how you play", and the precedent the Phase 6 cutover copies (01-02)
- [Phase ?]: Plan 03: the ladder's comparison axis is time, not seat — one brain ships, so a seat-axis control no longer exists
- [Phase ?]: Plan 03: bot_ladder4.js wall clock goes to stderr, keeping stdout byte-identical for exact before/after diffs
- [Phase ?]: Plan 03: balance baseline uses dev seed family x7919 only; held-out x104729 reserved for plan 06 if the result reads close
- [Phase ?]: RULE-01: passing pays one dubloon through a single Game.doPass(p) called from all three emission sites; the purse is mutated BEFORE ev() records it, because ev() snapshots at call time (01-04)
- [Phase ?]: RULE-01: the human-only sea-cursor advance stays outside doPass — per-device narration bookkeeping owned by one seat, never handed to bots (01-04)
- [Phase ?]: RULE-02/D-06: the pass tag 'Recipe idea! (+1 coin)' is appended by the renderer in one place as a subjectless fragment; all 100 hand-written sea-creature strings untouched (01-04)
- [Phase ?]: FIX-06: the engine ships one bot planner. The classic whole-turn planner and its four exclusive helpers are deleted from 4/src/engine/index.js; the v3-suffixed helpers are live and gated. The divergent float tie-break tolerance is resolved by removal, not reconciliation. (01-05)
- [Phase ?]: The published bot numbers in docs/BOT-V3-RACE-PLANNER.md and docs/FABLE-BOT-BRIEF.md are deliberately NOT edited. They became unreproducible on 2026-08-18 and stay true as the record of why the race planner was chosen; annotating them is Phase 9's work. (01-05)
- [Phase ?]: Deletions whose targets share a prefix with live code are done as asserted line-range surgery, never regex over a name prefix, and are proved behaviour-neutral by a byte-identical before/after ladder record that is itself red-proofed. (01-05)
- [Phase ?]: D-07 CLOSED — Wyatt, 2026-08-19: 'ship it'. Shown the before/after ladder on identical seeds (pass rate 54.99% to 55.62%, voyages 15.16 to 14.84 rounds), he chose to ship the pass dubloon at one coin. Payout unchanged, held-out seed family not run, ladder not re-run. (01-06)
- [Phase ?]: Plan 06: the build stamp was deliberately NOT bumped — nothing under 4/ changed, and a stamp bump with no gameplay behind it is what the stamp exists not to do. 2026-08-18e IS the Phase 1 build. (01-06)
- [Phase ?]: gamelogs/<ts> is write-once by Firebase security rule for every client, including Wyatt's own browser — no probe in this phase may drive a voyage to completion (never call writeGameLog()); teardownRoom() now only handles rooms/<CODE> (01-01)
- [Phase ?]: Two independent headless Chrome processes, own --user-data-dir and --remote-debugging-port each, is the phase's shared multiplayer test rig (scratchpad rig.mjs) — proven against the live handshake, no shared pp_id workaround needed (01-01)
- [Phase ?]: FIX-03: watchRecipes() iterates Object.entries(picks) instead of picks.forEach, tolerating both the sparse-object and null-padded-array shapes Firebase actually returns for rooms/<C>/recipes (02-02)
- [Phase ?]: FIX-03: startGame() reuses watchRoom's existing 'that game no longer exists' guard (shared GAME_GONE_MSG constant, two distinct @copy ids) instead of throwing when the room vanishes mid-start (02-02)
- [Phase ?]: MP-11: the networked ⏩ term reuses appState.db && appState.room (the codebase's existing 'am I in a networked game' idiom, from the chat-panel gate) rather than appState.live, which turned out to be true in every mode (02-03)
- [Phase ?]: maybeBuildStage()'s stale !appState.room guard (a 2026-08-13 no-op predating multiplayer) was silently blocking the entire stage/ribbon from building in ANY networked game — found and fixed under Rule 3 because Task 1's own MP-11 acceptance criteria depended on it; flagged for 02-04 through 02-06 to re-verify against (02-03)
- [Phase ?]: MP-10's tab-hide gate measured (not read) to hold in both directions on a live two-browser networked voyage — rooms/<CODE>/paused never moved across guest/host hide+show, sensor red-proofed against a solo bot game where the same technique correctly flips local pause state; no production code touched (02-03)
- [Phase ?]: FIX-03's third site (watchPrompt's unescaped host HTML) does not reproduce — pname() already routes every typed name through escHtml before it reaches any prompt renderer; no code changed (02-04)
- [Phase ?]: Firebase's /seats/*/name security rule caps a captain name to 18 chars server-side, well under the 40-char client-side clamp — undocumented, found mid-probe when it silently froze a page via a blocking alert() (02-04)
- [Phase ?]: 02.1-01: fix the guest's state layer, not the six renderers that read it — watchEvents() applies each event's baked-in snapshot onto appState.game, so ribbonTick/pillHTML/camFitSail become correct with zero renderer changes and zero engine changes
- [Phase ?]: 02.1-01: a guest's appState.game is now TRUE, not a render shell — docs/DRIVING-THE-GAME.md §5c's 'never compare game.players across clients' rule is obsolete for 4/ and must not be followed (DOC-06 owns the doc)
- [Phase ?]: emojify() is tag-aware: substitution happens only outside HTML tags, so no attribute can be broken open by the coin <img>
- [Phase ?]: The literal-'>'-in-an-attribute limitation is named in a comment at the fix site rather than closed with an HTML tokenizer (threat T-02.1-04, accepted)
- [Phase ?]: One shared optionButtonsHTML() builds every prompt button row (host, guest, draft channel); res(i) and sendResponse(id,i) stay separate — share the builder, not the caller
- [Phase ?]: The seat field crosses the wire as seats[]; seat 0 is a real captain so both send and read test !=null, never truthiness
- [Phase ?]: 4/ gets its own parity gate — scripts/host_guest_parity_check.js reads the ROOT game's src/ and never looked at 4/

### Pending Todos

`.planning/todos/pending/` holds 39 files, all dated 2026-07-31 → 2026-08-10 — i.e. all predate
`4/`. Most are v1-only or moot (fishing was removed in `4/`; the human trade counter-offer shipped in
`4/`). **Seven are still actionable and need re-pointing at the promoted tree:**
`copy-shipped-vs-approved-gate.md`, `2026-08-10-usage-stats-firebase-followups.md`,
`2026-08-01-sound-effects-still-missing.md`, `2026-07-31-recipe-art-has-jagged-cutout-edges.md`,
`2026-08-01-wind-scent-descriptors.md`, `2026-08-01-bot-human-parity-audit.md`,
`narration-two-schedulers-unenforced.md`. Three carry `status: closed-*` frontmatter and are
misfiled in `pending/`. Triage them at the next opportunity — detail in
`research/v2.0-intake/DOCS-AND-RULES.md` §3.

### Blockers/Concerns

- **`4/` has a first safety net, but `npm test` still does not run it.** Phase 1 built six gates that
  load `4/` — `stage_import_check`, `no_undef_check`, `pp4_timeroff_check`, `pass_coin_test`,
  `pass_narration_test`, `planner_singleton_check` — and all six exit 0. **But they are not wired into
  root `npm test`**, whose 21 gates still scan only the live game. So the trap in
  `docs/HARD-WON-LESSONS.md` §3 is narrowed, not closed: **a green `npm test` still says nothing about
  the game being promoted**, and the six `4/` gates have to be run by name. Wiring them in, and
  covering the rest of `4/`, is Phase 3.

- **The v2 determinism corpus does not exist and its capture is one-way.** `docs/DETERMINISM-RERECORD.md`:
  capture exactly once, never weaken `REQUIRED_EVENT_TYPES`. RULE-01 must land first (Phase 1), and
  after capture nothing may change what `4/src/engine/index.js` emits. Also decide before capturing
  whether to land `docs/DETERMINISM-RERECORD-NEXT.md`'s three queued purity fixes — with no fixtures
  yet, the reason they were queued has disappeared.

- **Safari has never been measured on `4/`.** The BUG-01 storm fix is verifiably intact and
  byte-identical, but the headroom it bought has been spent: full-viewport rain (~5× the paint
  area), a 60fps camera tween during storms, and narration typing at `msPerChar=9` vs live's 20.
  This is a gate on promotion (Phase 6), not a courtesy.

- ~~**`pp_timerOff` LEAKS between the two games**~~ — **CLOSED in Phase 1 (FIX-01, plan 01-02,
  `fbf1088`).** All five `4/`-side sites now read and write the namespaced `pp4_timerOff`, and the old
  shared key is removed exactly once per browser behind the `pp4_timerOffCleaned` marker. The OFF
  default in `4/` was intentional and was **not** changed (Wyatt, 2026-08-18). Gated by
  `4/scripts/pp4_timeroff_check.js`, which checks the source shape *and* the cleanup's real behaviour.
  **Still open, and only a person can check it:** confirm on a real browser that setting the live
  game's clock, opening `/4`, and coming back leaves the live setting intact.

- **Two player-reachable dev flags ship in `4/`.** `?ovens=1` skips the entire 16-day voyage;
  `?windhud=1` opens a tuning panel. Harmless self-cheating solo; a genuine exploit the moment
  multiplayer is restored. Closed in Phase 6.

- **The `4/` net layer has never executed.** It is byte-identical to live for 4 of 5 files, but four
  latent faults sit on paths no one has run: the sparse-`picks` crash (`orchestrator.js:1591`),
  the unguarded null room (`:1501`), unescaped host HTML (`:1239-1245`), and `remotePrompt` with no
  timeout (`:1143-1152`). All must be closed before the first networked playtest (Phase 2).

- **MP test-harness gotchas (carried forward, still true):** same-machine two-tab multiplayer shares
  localStorage `pp_id` — re-set the host's own `pp_id` before reloading. Read
  `docs/DRIVING-THE-GAME.md` before any browser pass; §5d covers windows too narrow to hand-drive.
  **Its import paths are root-relative and will inject state into the wrong tree** until DOC-06 fixes
  them.

- **Kill every headless Chrome and local server in the same session you start them.** Two abandoned
  probes at 21% CPU each, and 53% CPU across 13 processes hours after the rule was written, both on
  a machine Wyatt was reporting as overheating.

- Four small throwaway entries (gamelogs/17871453713N, /17871454233N, /1787145352658, /1787145353126) landed in the live production gamelogs/ node during 02-01's self-test and cannot be removed by any client — Firebase's write-once rule denies delete/overwrite on that path for everyone, including Wyatt. Sub-1KB, clearly tagged test data; only Firebase console admin access can remove them. Full account: 02-01-SUMMARY.md 'Known Issue'.
- 02-03 found (and fixed) that 4/src/ui/stage.js's maybeBuildStage() silently prevented the entire stage/ribbon from building in ANY networked game until this plan's fix — a stale 2026-08-13 pre-multiplayer no-op turned real bug by 02-01. Any remaining phase-2 plan assuming the ribbon exists in networked mode (02-04's chat button, D-06/D-07) should re-verify against the fixed tree.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260818-vot | Pass payout in config, shown on the Pass button | 2026-08-18 | 831abd2 | [260818-vot-pass-payout-in-config](./quick/260818-vot-pass-payout-in-config/) |

### Roadmap Evolution

- Phase 02.1 inserted after Phase 2: One render path for host and guest: every renderer reads appState.game, which is live truth on the host and a stale render shell on a guest. Fix the state layer first, then delete the 43 host/guest branches and the duplicate prompt renderer. (URGENT)

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Determinism | DTRM-01/02 — `Math.exp` epsilon, ~6 sorts without tiebreaks | Future; irrelevant under host authority, only bites under true lockstep | v2.0 requirements |
| Back-port | BACK-01 — `4/src/main.js:211` and `4/src/orchestrator.js:1697` close real gaps live still has | Deferred, not dismissed — v1 becomes a frozen `/classic` archive, so the value is small | v2.0 requirements |
| Networking | STORM-02 — multiplayer guest storm-push parity | Carried from v1.3; re-assess against the v2 engine, the v1 re-record analysis may no longer apply | v1.3 |
| Meta | META-03 — Google Search Console verification | Wyatt's own action, now blocked behind CUT-04 | v1.2 |
| Features | Interactive tutorial; sound effects; island redesign | Deferred to a later milestone | v1.2 requirements |
| DX | NETMOD-01 (modular Firebase v9+), DX-01 (JSDoc typedefs), DX-02 (pure replay runner) | Deferred | v1.1 requirements |

## Session Continuity

Last session: 2026-08-19
Stopped at: Completed 02.1-04-PLAN.md — phase 02.1's four plans are done; phase verification not yet run
Resume file: None

Earlier on 2026-08-18: Phase 1 context gathered, and this file re-based from v1.3 to v2.0.

**The v1.x record is not lost.** The full v1.2/v1.3-era ledger — 40+ decisions, per-plan metrics,
the quick-task log, and the v1 blockers list — is archived verbatim at
`milestones/v1.3-STATE.md`. Prior milestone roadmaps and requirements are in `milestones/`.

## Operator Next Steps

1. **Verify Phase 1 on the phone.** Everything headless is green, but two checks only a person can
   make are still open, both from plan 06's plan file: open `playpastrypirates.com/4`, confirm the
   footer reads **`2026-08-18e`**, pass a turn and read the narration line in **both** persons (Wyatt
   reversed that wording twice against rendered lines); then confirm the clock preference no longer
   leaks — set the clock as you like it in the live game, open `/4`, come back, and check the live
   game's setting survived.

2. **Then `/gsd-plan-phase 2` — Multiplayer Revival.** Read
   `research/v2.0-intake/` first; it is the only synthesis of a development period that left no GSD
   artifacts. Note before planning: `docs/DRIVING-THE-GAME.md`'s import paths are root-relative and
   will inject state into the wrong tree until DOC-06 fixes them.

3. **Do not record the determinism corpus before Phase 3 decides on the queued purity fixes.**
   Capture happens exactly once. `docs/DETERMINISM-RERECORD-NEXT.md` holds three queued fixes whose
   original justification disappeared along with the old fixtures — that call is owed before capture,
   not after.

*(Done: roadmap approved; `/gsd-plan-phase 1` run 2026-08-18; all 6 plans of Phase 1 executed
2026-08-18/19; D-07 closed by Wyatt 2026-08-19.)*
