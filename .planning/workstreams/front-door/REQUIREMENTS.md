# Requirements — v1.3 workstream `front-door`

**Milestone:** v1.3 The Game Comes Alive · **Owns:** Phase 22
**Files this workstream owns:** markup in `index.html`, `src/ui/lobby.js`, and a new About page

> **This is a slice of v1.3, not the whole milestone.** The single readable overview of all of
> v1.3 and v1.4 lives at [`../../V1.3-V1.4-PLAN.md`](../../V1.3-V1.4-PLAN.md) and does **not**
> move between workstreams — read that for the shape, this for your scope.
> Per-item detail, code references and traps: `../../todos/pending/2026-07-31-*.md` and `2026-08-01-*.md`.

### The Front Door — Phase 22

- [x] **FIX-01**: Players choose their name in a new modal that appears **after** they pick a play mode.
- [x] **ABOUT-01**: A beautiful About page exists containing the rules, a screenshot of the game in action, the credits, and the Ko-Fi button.
- [x] **ABOUT-02**: The About page is reachable by its own link from the homepage.
- [x] **META-01**: A Google search result for the site shows a large preview image (robots meta + JSON-LD `image`).

> **The About page must not become a third divergent copy of the rules** — they already exist in the How-To-Play modal and `RULES.md`. Share one source or duplicate deliberately and say so.
> **META-03** (Google Search Console verification) is **Wyatt's own action, not code** — crawl latency is days to weeks, so it should start now. Not scheduled as build work.

## Milestone-wide Constraints

1. **NOTHING in v1.3 may touch `src/engine/index.js` or change what it emits.** This is what keeps the phases parallel and keeps v1.3 clear of the determinism re-record — `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 is explicit that the 31-seed corpus is re-recorded **exactly once**, and that happens in v1.4. **If a phase finds it needs an engine change, STOP and re-scope.**
2. **WIND-01 is the largest Safari risk this project has taken.** BUG-01 was a Safari near-crash caused by storm-overlay compositing; this runs a comparable layer on **every ordinary turn**. Phase 19's gate is mandatory.
3. **Copy changes are inventory changes** — record them against `.planning/todos/pending/copy-shipped-vs-approved-gate.md`. Silent divergence between shipped source and Wyatt's approved dispositions is the failure this project has already had.
4. **Standing design invariant** (`.planning/PROJECT.md`): bots have exactly the same rules and affordances as humans. Never raise "should bots be allowed to…" as an open question; parity may be restored by levelling the **human up**, not only the bot down.
