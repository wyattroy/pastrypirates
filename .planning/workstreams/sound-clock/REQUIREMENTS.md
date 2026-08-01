# Requirements — v1.3 workstream `sound-clock`

**Milestone:** v1.3 The Game Comes Alive · **Owns:** Phase 21
**Files this workstream owns:** a new audio module, and the clock control area of `src/ui/panel.js`

> **This is a slice of v1.3, not the whole milestone.** The single readable overview of all of
> v1.3 and v1.4 lives at [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md) and does **not**
> move between workstreams — read that for the shape, this for your scope.
> Per-item detail, code references and traps: `../../todos/pending/2026-07-31-*.md` and `2026-08-01-*.md`.

### Sound & the Clock Toggle — Phase 21

- [ ] **AUDIO-01**: Luis's sound effects play at appropriate game moments, on by default.
- [x] **AUDIO-02**: A mute button sits to the right of the turn clock.
- [x] **AUDIO-03**: Luis is credited for the sound effects in the Credits modal.
- [x] **FIX-02 / N-03**: Solo gets the timer on/off toggle **and it works**; the same toggle starts working in pass-and-play. One local, non-Firebase code path fixes both — `watchTimer()` drives it from a Firebase node neither mode has. *(21-03: code-level complete; D-18 full-turn both-ways manual check outstanding — see 21-03-SUMMARY.md.)*

> N-02's urgency animation and N-04's wider parity sweep stay in v1.4. The clock panel already renders in solo, so **AUDIO-02's anchor exists today** and is not blocked by the toggle work.

## Milestone-wide Constraints

1. **NOTHING in v1.3 may touch `src/engine/index.js` or change what it emits.** This is what keeps the phases parallel and keeps v1.3 clear of the determinism re-record — `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 is explicit that the 31-seed corpus is re-recorded **exactly once**, and that happens in v1.4. **If a phase finds it needs an engine change, STOP and re-scope.**
2. **WIND-01 is the largest Safari risk this project has taken.** BUG-01 was a Safari near-crash caused by storm-overlay compositing; this runs a comparable layer on **every ordinary turn**. Phase 19's gate is mandatory.
3. **Copy changes are inventory changes** — record them against `.planning/todos/pending/copy-shipped-vs-approved-gate.md`. Silent divergence between shipped source and Wyatt's approved dispositions is the failure this project has already had.
4. **Standing design invariant** (`.planning/PROJECT.md`): bots have exactly the same rules and affordances as humans. Never raise "should bots be allowed to…" as an open question; parity may be restored by levelling the **human up**, not only the bot down.
