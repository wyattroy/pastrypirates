# Roadmap — v1.3 workstream `board-wind`

**Milestone:** v1.3 The Game Comes Alive (The Board Comes Alive)
**Overview of the whole milestone:** [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md)

## Phases in this workstream

- [x] **Phase 19: Safari Check** — **GATE.** Prove an always-on wind layer is safe in real Safari, and learn the dot-count budget, before Phase 20 invests. Builds a throwaway-able prototype; ships nothing final (WIND-00) (completed 2026-08-01)

  **Plans:** 6 plans in 5 waves

  - [x] 19-01-PLAN.md — Write the run protocol, then one stop for Wyatt: the phone check and the determinism go-ahead, answered together (wave 1)
  - [x] 19-02-PLAN.md — The Wave 0 mechanical guard: `scripts/wind_dot_contract_check.js`, wired into `npm test` (wave 1)
  - [x] 19-03-PLAN.md — Tracer: one dot drifts on the live wind, with an on-screen switch, dial and readout, off by default (wave 2, gated on 19-01's recorded go-ahead)
  - [x] 19-04-PLAN.md — Wyatt's full motion spec, the correct 0–100 dial, reduced motion, and the `will-change` toggle (wave 3)
  - [x] 19-05-PLAN.md — The calibrated smoothness meter and the plain end-of-voyage summary (wave 4)
  - [x] 19-06-PLAN.md — Chrome pre-flight, Wyatt's two Safari runs on both devices, and the verdict (wave 5)

- [ ] **Phase 20: The Board Comes Alive** — Drifting wind dots, arrows flowing into a rotating whirlpool, a signal before a ship is swept into the trade winds, and a pastry scent on every wind direction change (WIND-01…05). **Depends on Phase 19 passing**

  **Plans:** 7 plans in 5 waves

  - [ ] 20-01-PLAN.md — Tracer: the dots ship always-on and a wind direction change fades them out, re-aims unseen, and fades back in as the round line lands; the measuring rig deleted and the off-by-default assertion retired (wave 1)
  - [ ] 20-02-PLAN.md — WIND-04: the 35-line pastry scent, derived from the round number with no RNG draw and no remembered state (wave 1)
  - [ ] 20-03-PLAN.md — WIND-05: rim squares in the move highlights read as a warning, and a ghost of the player's own boat marks where the sweep ends (wave 1)
  - [ ] 20-04-PLAN.md — WIND-01's look: a per-dot sway rhythm, per-dot sizes with a soft edge, and the compositor guard narrowed in the same commit (wave 2)
  - [ ] 20-05-PLAN.md — WIND-03: four whirlpools turning clockwise at seeded speeds, in a new HTML rim-flow layer, with the doubled static copy removed (wave 3)
  - [ ] 20-06-PLAN.md — WIND-02: specks ride each rim arc through the stationary arrows and are swallowed at the whirlpool (wave 4)
  - [ ] 20-07-PLAN.md — The D-07/D-29 tuning gate: one page, three slider groups, Wyatt's numbers become the shipped defaults (wave 5, **blocking human gate**)

## Boundaries

**This workstream owns:** `src/ui/board.js` and new sprite assets

**Runs concurrently with:** the other v1.3 workstreams — `prompts-polish`, `board-wind`,
`sound-clock`, `front-door` — except where noted below.

**⚠ Incoming touch from `prompts-polish` — one line of `src/ui/board.js`.** Phase 18's FIX-08 (the
win banner must only print "a" in front of a recipe name that takes one) needs the victory line at
**`src/ui/board.js:772`** — `` `${pn(w)} baked a ${winRecipeSpan(w)} …` ``. It is a **single line**
and the only reach `prompts-polish` has into this file; the rest of FIX-08 is in `src/ui/recipe.js`.
Coordinate before either session edits `board.js`: either `board-wind` takes this one line as a
favour, or the two sessions sequence their `board.js` edits. Raised 2026-07-31 while scoping Phase 18.

**Internal ordering — sequential, not parallel.** Phase 20 gates on **Phase 19's verdict**, not
merely its completion. Whether Safari survives an always-on wind layer, and how many dots it can
carry, is what Phase 20 gets designed around. **Do not plan Phase 20 before Phase 19 answers.**

**Phase 19's Safari verdict is Wyatt's to run** — it needs real Safari on his machine.

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
