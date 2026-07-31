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

**Staleness, not conflicts, is what has actually cost this project time.** A branch drifted 34
commits behind `main` and made a shipped milestone look unfinished; the repo already carries several
stale worktrees. So:

1. **Branch from current `main`** when you start.
2. **Merge back promptly** when a phase completes — do not let a workstream sit.
3. **Pull `main` in before planning a new phase**, so you are planning against what actually shipped.
