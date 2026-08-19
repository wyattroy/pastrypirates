---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: The New Game
current_phase: 01
current_phase_name: before-the-engine-freezes
status: executing
stopped_at: Completed 01-01-PLAN.md
last_updated: "2026-08-19T00:56:16.127Z"
last_activity: 2026-08-18
last_activity_desc: Phase 01 execution started
progress:
  total_phases: 9
  completed_phases: 0
  total_plans: 6
  completed_plans: 1
  percent: 0
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

**Current focus:** Phase 01 — before-the-engine-freezes
questions, a bake-off minigame, a race-planner bot brain fitted on 27,867 simulated outcomes, and a
complete visual redesign — is being promoted to become the official Pastry Pirates. This is a
**one-way cutover, not a merge**: `4/` forked 2026-08-11 and the repo root has had no code commit
since 2026-08-02.

**Where the two games live right now:** `playpastrypirates.com` serves the repo root (v1, live, real
players). `playpastrypirates.com/4` serves `4/` (the game being promoted). Both are `main` with no
build step — nothing here is ever a cache.

## Current Position

Phase: 01 (before-the-engine-freezes) — EXECUTING
Plan: 2 of 6
Status: Ready to execute
Last activity: 2026-08-18 — Phase 01 execution started

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

No v2.0 plans executed yet. Prior-milestone velocity and per-plan metrics are archived in
`milestones/v1.3-STATE.md` and in each milestone's own archive under `milestones/`.
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P01 | 21min | 2 tasks | 4 files |

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

- **`4/` has no safety net yet.** Root `npm test` runs 21 gates and passes, and **not one of them
  loads `4/`** — the "gate scanning the wrong tree" trap in `docs/HARD-WON-LESSONS.md` §3. Until
  Phase 3 lands, **a green `npm test` says nothing about the game being promoted.**

- **The v2 determinism corpus does not exist and its capture is one-way.** `docs/DETERMINISM-RERECORD.md`:
  capture exactly once, never weaken `REQUIRED_EVENT_TYPES`. RULE-01 must land first (Phase 1), and
  after capture nothing may change what `4/src/engine/index.js` emits. Also decide before capturing
  whether to land `docs/DETERMINISM-RERECORD-NEXT.md`'s three queued purity fixes — with no fixtures
  yet, the reason they were queued has disappeared.

- **Safari has never been measured on `4/`.** The BUG-01 storm fix is verifiably intact and
  byte-identical, but the headroom it bought has been spent: full-viewport rain (~5× the paint
  area), a 60fps camera tween during storms, and narration typing at `msPerChar=9` vs live's 20.
  This is a gate on promotion (Phase 6), not a courtesy.

- **`pp_timerOff` LEAKS between the two games — but the OFF default in `4/` is INTENTIONAL**
  (Wyatt, 2026-08-18). `4/src/ui/stage.js:1478` writes the shared, un-namespaced key, so any player
  who opens `/4` once also has the shot clock switched off in the **real** game, and if they host it
  is pushed to everyone in the room. **The fix is to namespace the key, NOT to change the default** —
  `4/` already namespaces `pp4_sess` and `pp4_solo` and simply missed this one. It stays relevant
  after the cutover, where the new game and `/classic` share one origin and want opposite defaults.
  Phase 1, independently of every promotion decision.

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

Last session: 2026-08-19T00:56:09.452Z
Stopped at: Completed 01-01-PLAN.md
Resume file: None

Earlier on 2026-08-18: Phase 1 context gathered, and this file re-based from v1.3 to v2.0.

**The v1.x record is not lost.** The full v1.2/v1.3-era ledger — 40+ decisions, per-plan metrics,
the quick-task log, and the v1 blockers list — is archived verbatim at
`milestones/v1.3-STATE.md`. Prior milestone roadmaps and requirements are in `milestones/`.

## Operator Next Steps

1. `/gsd-execute-phase 1` — the 6 plans are written, checked and committed. Wave 1 is the tracer
   (TEST-01/TEST-02): the first gate in this repo that loads `4/` and runs green. Nothing else in
   the phase can be verified headlessly until it does.

2. Wave 5 ends on a blocking decision checkpoint, not on a commit. D-07 makes the balance check a
   gate: the rewritten ladder reports what moved in pass rate and voyage length, and **Wyatt decides**
   whether it is material. The plan is forbidden from carrying a recommendation or a threshold.

3. Read the relevant `research/v2.0-intake/` report before planning any phase — it is the only
   synthesis of a development period that left no GSD artifacts.

*(Done: roadmap approved; `/gsd-plan-phase 1` run on 2026-08-18.)*
