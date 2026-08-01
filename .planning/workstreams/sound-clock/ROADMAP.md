# Roadmap — v1.3 workstream `sound-clock`

**Milestone:** v1.3 The Game Comes Alive (Sound & the Clock Toggle)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [ ] **Phase 21: Sound & the Clock Toggle** — Luis's sound effects on by default, a mute button, his credit — plus the timer on/off toggle finally working in solo and pass-and-play (AUDIO-01/02/03, FIX-02/N-03)

  **Goal:** Luis's six sound effects play at the right game moments, on by default, with a mute
  button beside the turn clock and Luis credited for them in the Credits modal — plus the turn-timer
  on/off toggle finally working in solo and pass-and-play via one local, non-Firebase code path.

  **Plans:** 5 plans (waves 1-5, sequential — every plan touches `src/orchestrator.js` or
  `src/ui/panel.js`, so no two can run in the same wave)

  Plans:

  - [x] 21-01-PLAN.md — Tracer: one flip sound end-to-end through the new `src/shared/audio.js`, plus the Wave 0 DOM-free harness [AUDIO-01]
  - [x] 21-02-PLAN.md — The 25-key event→sound mapping, storm fires-once + fade, both placeholder sounds, host/guest/win-screen wiring [AUDIO-01]
  - [x] 21-03-PLAN.md — The timer toggle: `applyTimerOff()` extraction, the local non-Firebase path, per-browser seed in every mode, visible everywhere [FIX-02/N-03]
  - [x] 21-04-PLAN.md — The mute button beside the clock, Luis's sound credit, and the copy-inventory entry [AUDIO-02, AUDIO-03]
  - [~] 21-05-PLAN.md — The real speaker icon, and the phase verification matrix in Chrome and Safari [all four] *(Task 2 complete — 11-row matrix produced, all machine fences green; Task 1 halted cleanly on its own precondition — the art runbook needs Wyatt's live session and did not run overnight. See 21-05-SUMMARY.md.)*

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
