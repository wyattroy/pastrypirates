---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: milestone
current_phase: 22
current_plan: 3
status: executing
stopped_at: Completed 22-02-PLAN.md
last_updated: "2026-08-01T05:15:00.000Z"
last_activity: 2026-08-01
last_activity_desc: "Plan 22-02 executed: about.html (ABOUT-01) — head block, own stylesheet, two-column hero, stranger-facing rules naming the Isle of Tortuga, credits, and a duplicated lazily-mounted Ko-Fi embed with byte-identical sandbox attribute, plus a sitemap.xml entry. Both tasks committed atomically. Two visual human-check items unrun (no browser-automation tool available) — logged to WINDOWS.md."
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 5
  completed_plans: 2
  percent: 40
workstream: front-door
created: 2026-07-31
---

# Project State

## Current Position

**Status:** Executing Phase 22
**Current Phase:** 22
**Last Activity:** 2026-08-01 — Plan 22-02 (About page, ABOUT-01) complete
**Last Activity Description:** Plan 22-02 executed: `about.html` built as a standalone page (own head block, own stylesheet, no shared JS) with a two-column hero, stranger-facing rules naming the Isle of Tortuga (D-08), a rewritten credits list, and a duplicated lazily-mounted Ko-Fi embed carrying the byte-identical `sandbox` attribute from `src/ui/lobby.js:74`. `sitemap.xml` gained a second `<url>` entry. Both tasks committed atomically; all static acceptance criteria pass. Two visual `<human-check>` items (hero-row layout, content-stacking/network-behavior) not run — no browser-automation tool available this session — logged to `.planning/WINDOWS.md` as unrun-verify.

## Progress

**Phases Complete:** 0
**Current Plan:** 3 of 5 (22-02 complete)

## Session Continuity

**Last session:** 2026-08-01T05:15:00.000Z

**Stopped At:** Completed 22-02-PLAN.md

1. ~~`/gsd-discuss-phase 22 --ws front-door`~~ — **done 2026-07-31**, 11 decisions captured
2. ~~`/gsd-ui-phase 22 --ws front-door`~~ — **done 2026-07-31**, UI-SPEC approved 6/6 dimensions
3. ~~`/gsd-plan-phase 22 --ws front-door`~~ — **done 2026-08-01**, 5 plans, checker passed
4. `/gsd-execute-phase 22 --ws front-door` — execute

**Resume File:** None

## Blocked on Wyatt

- **D-11 — pick the screenshot.** Plan 22-04 drives a real game, captures mid-game candidates, and stops at a `checkpoint:decision`. Nothing after it can proceed until a frame is chosen.
- **D-09 — sign off the About-page copy.** Plan 22-05 is the last wave; it swaps placeholder copy for approved copy and records it against `.planning/todos/pending/copy-shipped-vs-approved-gate.md`.

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

## Decisions

- [Phase 22]: Added durable pp_lastName localStorage key (never cleared by leaveGame) to deliver D-04's persistence intent, superseding CONTEXT.md's cited pp_sess/pp_solo source which does not survive that path.
- [Phase 22]: about.html (22-02) split across two commits despite writing one new file, so per-task atomicity held even for a brand-new file — Task 1 (head/stylesheet/hero) verified and committed before Task 2 (rules/credits/Ko-Fi/sitemap) was added.
- [Phase 22]: about.html's own stylesheet corrected two spacing values (6px, 11px) that mirrored index.html's non-4-multiple originals, to satisfy the plan's own multiple-of-4 acceptance gate for new About-page surface.

## Verification status (Phase 22 Plan 01) — CLOSED 2026-08-01

- **D-02 browser dismissal check: RUN AND PASSED.** The coordinator drove Chrome against a fresh server (`:8543` — a new port, because Chrome caches ES modules). All three dismissal paths **confirm and proceed** rather than cancel: Escape, backdrop click on `#nameModal`, and the `.modalX` button each closed the modal, saved `pp_lastName`, and landed on the picked mode's screen (solo game / `#stepPassPlay` / `#stepJoin`). Negative control passed: `#howToPlayModal` did **not** close on Escape, confirming the new handler is scoped to `#nameModal` and did not leak into the other six modals. Zero JS errors, zero unhandled rejections, zero `console.error`. `.planning/WINDOWS.md` entries #3 and #4 marked `fixed`.
- **Task 1 tracer also re-verified in the same pass:** modal fires on all four mode cards pre-filled; first-visit default is "Davy Scones"; `pp_lastName` persists across reload (validating D-04's corrected decision); `roster[0]` renders exactly once with four distinct captains — no name doubling.
- **One environmental limit, NOT a defect:** *Host a Crew* cannot be exercised end-to-end here — `appState.db` never initialises in this browsing context, so Firebase room creation never completes. This reproduces **identically on the pre-22-01 baseline** (commit `5cb50ba`, served separately and driven through the old `#pname` flow), so it is not a regression. The part 22-01 owns works for Host: modal opens, pre-fills, confirms, and `roster[0].name` is set. Host's multiplayer path still needs one real networked session to confirm.
