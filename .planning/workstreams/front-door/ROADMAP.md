# Roadmap — v1.3 workstream `front-door`

**Milestone:** v1.3 The Game Comes Alive (The Front Door)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [ ] **Phase 22: The Front Door** — You name yourself after choosing how to play, a real About page, and a Google preview image (FIX-01, ABOUT-01/02, META-01)

## Boundaries

**This workstream owns:** markup in `index.html`, `src/ui/lobby.js`, and a new About page

**Runs concurrently with:** the other v1.3 workstreams — `prompts-polish`, `board-wind`,
`sound-clock`, `front-door` — except where noted below.

**⚠ Shared-file risk:** this workstream edits **the markup** of `index.html` while `prompts-polish`
edits **the CSS block** of the same file. Different regions, same file — expect merge friction and
sequence the `index.html` touches deliberately rather than assuming they are independent.

## Staying current — this project's demonstrated failure mode

**Staleness, not conflicts, is what has actually cost this project time.** A branch drifted 34
commits behind `main` and made a shipped milestone look unfinished; the repo already carries several
stale worktrees. So:

1. **Branch from current `main`** when you start.
2. **Merge back promptly** when a phase completes — do not let a workstream sit.
3. **Pull `main` in before planning a new phase**, so you are planning against what actually shipped.
