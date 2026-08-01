---
workstream: front-door
created: 2026-07-31
---

# Project State

## Current Position

**Status:** Not started — owns Phase 22 of v1.3. Planning attempted 2026-07-31, stopped at two gates.
**Current Phase:** 22 (The Front Door) — pre-planning
**Last Activity:** 2026-07-31
**Last Activity Description:** `/gsd-plan-phase 22 --ws front-door` run. Three things happened. (1) **Roadmap repaired** — this file's ROADMAP.md listed Phase 22 in its summary but had no `### Phase 22:` detail section, so `roadmap.get-phase` returned `malformed_roadmap` and the phase read as not found. Detail section written from REQUIREMENTS.md + the todo notes + `V1.3-V1.4-PLAN.md` (commit `a8e7c53`). **The other three v1.3 workstream roadmaps have the same gap and will block identically.** (2) **Gated on missing CONTEXT.md** — two open decisions are Wyatt's: whether the welcome-screen name field is removed once the modal exists, and whether the About page shares the rules with the How-To-Play modal or copies them deliberately. (3) **Gated on missing UI-SPEC** — `ui-plan-gate` returned `frontend: true, hasUiSpec: false, block: true`; `workflow.ui_safety_gate` is on. Wyatt chose to settle decisions and design before planning.

## Progress

**Phases Complete:** 0
**Current Plan:** N/A — planning blocked pending CONTEXT.md and UI-SPEC.md

## Session Continuity

**Stopped At:** Phase 22 pre-planning. Next, in order:
1. `/gsd-discuss-phase 22 --ws front-door` — settle the name-field and rules-source calls
2. `/gsd-ui-phase 22 --ws front-door` — design contract for the About page and the name modal
3. `/gsd-plan-phase 22 --ws front-door` — plan

**Resume File:** None

## Notes carried into planning

- **META-01 is already half-shipped.** Quick task `20260731-google-preview-logo` added both levers the requirement names — the `robots` meta with `max-image-preview:large` (`index.html:15`) and the JSON-LD `image` field (`index.html:28`). They permit a large Google preview but do not supply one; the remaining half is the About-page screenshot from ABOUT-01. Displaying it needs a Google re-crawl (days to weeks), which is META-03 — Wyatt's Search Console action, not build work.
- **The codebase map is stale.** `verify codebase-drift` reports 31 structural elements since the last mapping, including `src/engine/`, `src/net/`, `src/main.js` — it predates the v1.1 module split. Non-blocking, but `/gsd-map-codebase` before planning would sharpen it.
- **`main` is trunk and is healthy** — it carries the full `src/` tree and serves the live site. **Compare against `origin/main`, never a bare local `main` ref**: on 2026-07-31 the local ref was parked at `2ddbf97`, a v1.0 snapshot with no `src/`, and reading it produced a confident, entirely wrong "main is dead" conclusion that cost most of a session. Tell: a diff that looks absurdly large, or shows `src/` as newly added, means a stale ref. The v1.3 planning is **not on `origin/main` yet** — `.planning/workstreams/` and phases 18–22 sit 32 commits ahead on `claude/backlog-milestone-planning-93eb10`, which this worktree was fast-forwarded to. Being ahead of `main` is the normal state for v1.3 work; do not "fix" it. Pass `--ws front-door` explicitly on every GSD command.
