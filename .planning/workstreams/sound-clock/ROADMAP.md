# Roadmap — v1.3 workstream `sound-clock`

**Milestone:** v1.3 The Game Comes Alive (Sound & the Clock Toggle)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [ ] **Phase 21: Sound & the Clock Toggle** — Luis's sound effects on by default, a mute button, his credit — plus the timer on/off toggle finally working in solo and pass-and-play (AUDIO-01/02/03, FIX-02/N-03)

## Boundaries

**This workstream owns:** a new audio module, and the clock control area of `src/ui/panel.js`

**Runs concurrently with:** the other v1.3 workstreams — `prompts-polish`, `board-wind`,
`sound-clock`, `front-door` — except where noted below.

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
