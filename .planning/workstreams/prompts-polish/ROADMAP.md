# Roadmap — v1.3 workstream `prompts-polish`

**Milestone:** v1.3 The Game Comes Alive (Prompts & Polish)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [ ] **Phase 18: Prompts & Polish** — Buttons wait for the typewriter; a narrow window stops clipping the only button that takes the action; narration stops jumping sideways as it fades and the box stops shrinking under a still-fading line; orange buttons restyled; captain circles removed; no orphaned coins or brackets (FIX-03, FIX-04, FIX-06, FIX-07, FIX-08, FIX-09, FIX-10, FIX-16, FIX-17, FIX-21)

## Boundaries

**This workstream owns:** `src/ui/panel.js`, the CSS block in `index.html`, `src/ui/util.js`, `src/ui/recipe.js`

**Runs concurrently with:** the other v1.3 workstreams — `prompts-polish`, `board-wind`,
`sound-clock`, `front-door` — except where noted below.

**⚠ Shared-file risk:** this workstream edits **the CSS block** of `index.html` while `front-door`
edits **the markup** of the same file. Different regions, same file — expect merge friction and
sequence the `index.html` touches deliberately rather than assuming they are independent.

## Staying current — this project's demonstrated failure mode

> **⚠ Compare against `origin/main`, not a bare local `main` ref.** `main` **is** this project's
> trunk and is healthy — it carries the full `src/` module tree and serves the live site at
> playpastrypirates.com. But on 2026-07-31 a local `main` ref was found parked at `2ddbf97`, a v1.0
> snapshot predating the v1.1 module refactor, with no `src/` at all. Reading it produced a
> confident and entirely wrong conclusion ("main is a dead v1.0 snapshot") that cost most of a
> session. **Tell:** if a diff against the base looks absurdly large, or shows `src/` as newly
> added, you are reading a stale ref — run `git rev-parse origin/main` before concluding anything.

> **Where the v1.3 planning lives.** `.planning/workstreams/` and phases 18–22 are **not on
> `origin/main` yet** — as of 2026-07-31 they sat 32 commits ahead, on
> `claude/backlog-milestone-planning-93eb10`. A worktree cut from `main` cannot see these phases,
> and `/gsd-plan-phase N --ws <name>` will report the phase as not found. Fast-forward such a
> worktree to that branch. Being *ahead* of `main` is the normal state for v1.3 work — do not
> "fix" it. And pass `--ws <name>` explicitly on every GSD command rather than relying on an
> active-workstream setting.

**Staleness, not conflicts, is what has actually cost this project time.** A branch drifted 34
commits behind and made a shipped milestone look unfinished; the repo already carries several
stale worktrees. So:

1. **Branch from the current v1.3 planning branch** when you start.
2. **Merge back promptly** when a phase completes — do not let a workstream sit.
3. **Pull in before planning a new phase**, so you are planning against what actually shipped.
