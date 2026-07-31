# Roadmap — v1.3 workstream `board-wind`

**Milestone:** v1.3 The Game Comes Alive (The Board Comes Alive)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [ ] **Phase 19: Safari Check** — **GATE.** Prove an always-on wind layer is safe in real Safari, and learn the dot-count budget, before Phase 20 invests. Builds a throwaway-able prototype; ships nothing final (WIND-00)
- [ ] **Phase 20: The Board Comes Alive** — Drifting wind dots, arrows flowing into a rotating whirlpool, a signal before a ship is swept into the trade winds, and a pastry scent on every wind direction change (WIND-01…05). **Depends on Phase 19 passing**

## Boundaries

**This workstream owns:** `src/ui/board.js` and new sprite assets

**Runs concurrently with:** the other v1.3 workstreams — `prompts-polish`, `board-wind`,
`sound-clock`, `front-door` — except where noted below.

**Internal ordering — sequential, not parallel.** Phase 20 gates on **Phase 19's verdict**, not
merely its completion. Whether Safari survives an always-on wind layer, and how many dots it can
carry, is what Phase 20 gets designed around. **Do not plan Phase 20 before Phase 19 answers.**

**Phase 19's Safari verdict is Wyatt's to run** — it needs real Safari on his machine.

## Staying current — this project's demonstrated failure mode

**Staleness, not conflicts, is what has actually cost this project time.** A branch drifted 34
commits behind `main` and made a shipped milestone look unfinished; the repo already carries several
stale worktrees. So:

1. **Branch from current `main`** when you start.
2. **Merge back promptly** when a phase completes — do not let a workstream sit.
3. **Pull `main` in before planning a new phase**, so you are planning against what actually shipped.
