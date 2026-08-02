---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: milestone
current_phase: 22
current_plan: 5
status: shipped
stopped_at: "Phase 22 MERGED TO MAIN AND LIVE (2026-08-02), plus LOAD-03's front-door speed work. ONE ITEM STILL OPEN — see below."
last_updated: "2026-08-02T14:45:00.000Z"
last_activity: 2026-08-02
last_activity_desc: "SHIPPED. Phase 22 merged to main and live on playpastrypirates.com. On 2026-08-02 LOAD-03 was also built and shipped into this same screen: a static blurred backdrop (assets/welcome-backdrop.jpg, 512x512/71KB, captured from the real board) replaced a live game that was being built, laid out and composited only to be hidden behind the card; and boot() was restructured to decide the journey BEFORE painting. Measured as journeys, sampling every 60ms from navigation: a first-time visitor sees the home screen at ~170ms with the live game never rendered, and a mid-game refresh shows ZERO frames of the welcome screen with the board up at ~123ms under a loader reading 'Reconnecting to yer voyage…'. Two bugs were fixed on the way: the welcome screen had been running the End of Voyage celebration (60 layouts/sec from four leftover victory pastries), and showHome() ran unconditionally so a multiplayer refresh could fade the loader onto the WELCOME SCREEN before the player's voyage appeared. OPEN, scoped to this workstream: boot() still CONSTRUCTS a decorative game it never shows — .planning/todos/pending/2026-08-02-welcome-should-not-construct-a-game.md — blocked on unguarded appState.game reads in src/ui/panel.js. That is the last third of LOAD-03."

progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 5
  completed_plans: 5
  percent: 100
workstream: front-door
created: 2026-07-31
---

# Project State

## Current Position

**Status:** Executing Phase 22 — all 5 plans executed, browser verification pass outstanding
**Current Phase:** 22
**Last Activity:** 2026-08-01 — Plans 22-04/22-05 (About-page screenshot install + Wyatt's full copy/feedback pass) complete
**Last Activity Description:** See `last_activity_desc` in frontmatter above for the full account. In short: both of Phase 22's human approval gates (D-11 screenshot pick, D-09 copy sign-off) are now resolved, and Wyatt's nine-item playtesting review of the About page has been implemented and committed across four atomic commits (`b2395ec`, `f7972ff`, `1b42931`, `882019b`). See `22-04-SUMMARY.md` and `22-05-SUMMARY.md` for full detail.

## Progress

**Phases Complete:** 0
**Current Plan:** 5 of 5 (all plans complete; phase-level browser verification still outstanding)

## Session Continuity

**Last session:** 2026-08-01T09:20:00.000Z

**Stopped At:** Completed 22-05-PLAN.md

1. ~~`/gsd-discuss-phase 22 --ws front-door`~~ — **done 2026-07-31**, 11 decisions captured
2. ~~`/gsd-ui-phase 22 --ws front-door`~~ — **done 2026-07-31**, UI-SPEC approved 6/6 dimensions
3. ~~`/gsd-plan-phase 22 --ws front-door`~~ — **done 2026-08-01**, 5 plans, checker passed
4. `/gsd-execute-phase 22 --ws front-door` — execute

**Resume File:** None

## Blocked on Wyatt

Both resolved 2026-08-01:

- **D-11 — pick the screenshot. RESOLVED.** Wyatt supplied `assets/about-screenshot.jpg` (1320x888) directly rather than choosing among the five candidates captured by the earlier session — see the deviation entry in `22-04-SUMMARY.md`.
- **D-09 — sign off the About-page copy. RESOLVED.** Wyatt gave nine items of inline playtesting feedback covering the whole About page; applied and recorded against `.planning/todos/pending/copy-shipped-vs-approved-gate.md` (Phase 22 approvals section, dated 2026-08-01).

**Still outstanding (not a Wyatt-blocker, a tooling gap):** the consolidated browser verification pass over the reworked About page and the final approved copy — no browser-automation tool was available in the 22-04/22-05 executor session. Logged to `.planning/WINDOWS.md` entry #8 for the coordinator to run.

## Known-red before this phase started (NOT caused by Phase 22)

- **`npm test` already exits 1 on this worktree.** `scripts/narration_audit_check.js` assertion 10 fails because `scripts/lib/audit_page_headless.mjs` reads `.planning/phases/15-narration-audit-fixes/15-DISPOSITIONS-FINAL.json`, which was archived to `.planning/milestones/v1.2-phases/`. 21 of 22 assertion groups pass. Every Phase 22 plan therefore gates on a named script subset (`no_undef_check`, `module_graph_check`, `ui_contract_check`, `state_contract_check`, `determinism_baseline --verify`), all confirmed exit-0 at plan time. Captured as a separate todo.

## Notes carried into planning

- **META-01 is already half-shipped.** Quick task `20260731-google-preview-logo` added both levers the requirement names — the `robots` meta with `max-image-preview:large` (`index.html:15`) and the JSON-LD `image` field (`index.html:28`). They permit a large Google preview but do not supply one; the remaining half is the About-page screenshot from ABOUT-01. Displaying it needs a Google re-crawl (days to weeks), which is META-03 — Wyatt's Search Console action, not build work.
- **The codebase map is stale.** `verify codebase-drift` reports 31 structural elements since the last mapping, including `src/engine/`, `src/net/`, `src/main.js` — it predates the v1.1 module split. Non-blocking, but `/gsd-map-codebase` before planning would sharpen it.
- **`main` is trunk and is healthy** — it carries the full `src/` tree and serves the live site. **Compare against `origin/main`, never a bare local `main` ref**: on 2026-07-31 the local ref was parked at `2ddbf97`, a v1.0 snapshot with no `src/`, and reading it produced a confident, entirely wrong "main is dead" conclusion that cost most of a session. Tell: a diff that looks absurdly large, or shows `src/` as newly added, means a stale ref. The v1.3 planning is **not on `origin/main` yet** — `.planning/workstreams/` and phases 18–22 sit 32 commits ahead on `claude/backlog-milestone-planning-93eb10`, which this worktree was fast-forwarded to. Being ahead of `main` is the normal state for v1.3 work; do not "fix" it. Pass `--ws front-door` explicitly on every GSD command.

## Performance Metrics

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 22 P01 | 35min | 2 tasks | 7 files |
| Phase 22 P02 | ~25min | 2 tasks | 2 files |
| Phase 22 P03 | 12min | 1 task | 1 file |
| Phase 22 P04 | ~20min | 1 task | 2 files (combined session, see P05) |
| Phase 22 P05 | ~90min | 1 task | 6 files |

## Decisions

- [Phase 22]: Added durable pp_lastName localStorage key (never cleared by leaveGame) to deliver D-04's persistence intent, superseding CONTEXT.md's cited pp_sess/pp_solo source which does not survive that path.
- [Phase 22]: about.html (22-02) split across two commits despite writing one new file, so per-task atomicity held even for a brand-new file — Task 1 (head/stylesheet/hero) verified and committed before Task 2 (rules/credits/Ko-Fi/sitemap) was added.
- [Phase 22]: about.html's own stylesheet corrected two spacing values (6px, 11px) that mirrored index.html's non-4-multiple originals, to satisfy the plan's own multiple-of-4 acceptance gate for new About-page surface.
- [Phase 22]: Both About links (22-03) added with zero new CSS — the `.footerAbout` modifier class exists in markup only, riding on the base `.footerBtn` rule, to respect Phase 18's concurrent ownership of the `<style>` block.
- [Phase 22]: Wyatt supplied the shipped hero screenshot (assets/about-screenshot.jpg, 1320x888) directly rather than picking among the five 1200x663 candidates from the earlier capture session — his choice supersedes the plan's 1.81:1 reference ratio; width-floor and attribute-accuracy must-haves still hold.
- [Phase 22]: UI-SPEC's accent-orange assignment (previously "the Ko-Fi button, if it's the page's one primary CTA") reassigned to a new top-of-page "Play Pastry Pirates" link per Wyatt's explicit instruction that it is now the page's primary action; Ko-Fi restyled as a teal-outline secondary CTA.
- [Phase 22]: "Parley" renamed to "Trade" across every player-visible rules surface (about.html, index.html's How-To-Play modal, RULES.md, Rules_boardgame.md, .planning/how-to-play-pastry-pirates.md prose) per Wyatt's direct instruction; engine cfg.parley config flag and the narration event-type key t:"parley" deliberately left untouched (renaming either breaks src/engine/index.js or the narration/replay contract).

## Verification status (Phase 22 Plan 01) — CLOSED 2026-08-01

- **D-02 browser dismissal check: RUN AND PASSED.** The coordinator drove Chrome against a fresh server (`:8543` — a new port, because Chrome caches ES modules). All three dismissal paths **confirm and proceed** rather than cancel: Escape, backdrop click on `#nameModal`, and the `.modalX` button each closed the modal, saved `pp_lastName`, and landed on the picked mode's screen (solo game / `#stepPassPlay` / `#stepJoin`). Negative control passed: `#howToPlayModal` did **not** close on Escape, confirming the new handler is scoped to `#nameModal` and did not leak into the other six modals. Zero JS errors, zero unhandled rejections, zero `console.error`. `.planning/WINDOWS.md` entries #3 and #4 marked `fixed`.
- **Task 1 tracer also re-verified in the same pass:** modal fires on all four mode cards pre-filled; first-visit default is "Davy Scones"; `pp_lastName` persists across reload (validating D-04's corrected decision); `roster[0]` renders exactly once with four distinct captains — no name doubling.
- **One environmental limit, NOT a defect:** *Host a Crew* cannot be exercised end-to-end here — `appState.db` never initialises in this browsing context, so Firebase room creation never completes. This reproduces **identically on the pre-22-01 baseline** (commit `5cb50ba`, served separately and driven through the old `#pname` flow), so it is not a regression. The part 22-01 owns works for Host: modal opens, pre-fills, confirms, and `roster[0].name` is set. Host's multiplayer path still needs one real networked session to confirm.
