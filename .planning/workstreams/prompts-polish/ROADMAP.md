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

**Staleness, not conflicts, is what has actually cost this project time.** A branch drifted 34
commits behind `main` and made a shipped milestone look unfinished; the repo already carries several
stale worktrees. So:

1. **Branch from current `main`** when you start.
2. **Merge back promptly** when a phase completes — do not let a workstream sit.
3. **Pull `main` in before planning a new phase**, so you are planning against what actually shipped.
