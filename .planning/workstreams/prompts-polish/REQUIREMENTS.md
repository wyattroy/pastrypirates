# Requirements — v1.3 workstream `prompts-polish`

**Milestone:** v1.3 The Game Comes Alive · **Owns:** Phase 18
**Files this workstream owns:** `src/ui/panel.js`, the CSS block in `index.html`, `src/ui/util.js`, `src/ui/recipe.js`

> **This is a slice of v1.3, not the whole milestone.** The single readable overview of all of
> v1.3 and v1.4 lives at [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md) and does **not**
> move between workstreams — read that for the shape, this for your scope.
> Per-item detail, code references and traps: `../../todos/pending/2026-07-31-*.md` and `2026-08-01-*.md`.

### Prompts & Polish — Phase 18

- [x] **FIX-03**: In an action prompt the buttons appear only after the final character has been typewriter'd out.
- [x] **FIX-10**: A narrow window never clips the action button — the box never pins itself shorter than its content.
- [x] **FIX-16**: A fading narration line stays exactly where it was, and the box only shrinks once the fade completes.
- [ ] **FIX-06**: The 12 solid-orange `button.primary` buttons are restyled to the outline + faded-fill pattern.
- [x] **FIX-04**: The "{captain} is blown by the storm" line is removed, both viewer variants together.
- [x] **FIX-07**: A loser with an empty hold reads "they give up 5🌕", not the bribe framing; under 5 coins falls to the existing "all they have" line.
- [x] **FIX-08**: The win banner only prints "a" in front of a recipe name that takes one. No recipe is renamed.
- [ ] **FIX-09**: On narrow mobile the ingredient chips stay readable instead of collapsing into one vertical column.
- [ ] **FIX-17**: The coloured circle beside captain names is removed everywhere it appears, and the row shifts left.
- [x] **FIX-21**: Narration never orphans a trailing chunk — `(+1🌕)` wraps as one block; awards keep a quantity with its unit.

> **FIX-03 + FIX-10 + FIX-16 are ONE piece of work** — same function (`resizePanel`), same measurement, and each breaks the others if done alone. The measure-once design is BUG-01's Safari fix and must survive. Must respect `prefers-reduced-motion` and account for the shot clock running during the reveal.

## Milestone-wide Constraints

1. **NOTHING in v1.3 may touch `src/engine/index.js` or change what it emits.** This is what keeps the phases parallel and keeps v1.3 clear of the determinism re-record — `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 is explicit that the 31-seed corpus is re-recorded **exactly once**, and that happens in v1.4. **If a phase finds it needs an engine change, STOP and re-scope.**
2. **WIND-01 is the largest Safari risk this project has taken.** BUG-01 was a Safari near-crash caused by storm-overlay compositing; this runs a comparable layer on **every ordinary turn**. Phase 19's gate is mandatory.
3. **Copy changes are inventory changes** — record them against `.planning/todos/pending/copy-shipped-vs-approved-gate.md`. Silent divergence between shipped source and Wyatt's approved dispositions is the failure this project has already had.
4. **Standing design invariant** (`.planning/PROJECT.md`): bots have exactly the same rules and affordances as humans. Never raise "should bots be allowed to…" as an open question; parity may be restored by levelling the **human up**, not only the bot down.
