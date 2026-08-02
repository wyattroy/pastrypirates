---
phase: 18-prompts-polish
workstream: prompts-polish
status: passed
verified: 2026-08-02
verified_by: retroactive audit + Wyatt's live Safari playtest 2026-08-02
next_action: none
---

# Phase 18 — Verification

**Verdict: PASSED.**

Written retroactively on 2026-08-02. Phase 18 merged and shipped without a verification report
because its closing plan (18-07) never ran; this report reconstructs the evidence and states plainly
where the evidence is a human judgement rather than a machine check.

## Goal, restated

> Buttons wait for the typewriter; a narrow window stops clipping the only button that takes the
> action; narration stops jumping sideways as it fades and the box stops shrinking under a
> still-fading line; orange buttons restyled; captain circles removed; no orphaned coins or brackets.

Requirements: FIX-03, FIX-04, FIX-06, FIX-07, FIX-08, FIX-09, FIX-10, FIX-16, FIX-17, FIX-21.

## Automated evidence (re-run 2026-08-02)

| Check | Result |
|---|---|
| `npm test` — all 21 scripts | **PASS**, 0 failing checks |
| `determinism_baseline.js --verify` | **PASS** — determinism contract D-12 holds |
| `src/engine/index.js` untouched by this phase (milestone constraint 1) | **PASS** — last touched by `17ee908`, Phase 14 |
| Exactly one FIX-09 chip treatment in the tree (no unreachable CSS) | **PASS** — one treatment, `index.html:242` |
| `narration_audit_check.js` | **PASS** |
| `ui_contract_check.js`, `host_guest_parity_check.js`, `module_graph_check.js` | **PASS** |

## Human evidence

Wyatt's live Safari playtest of the v1.3 integration branch produced 12 items (P1–P12), and all 12
were fixed and re-confirmed across commits `10b3bbc`, `8eff26a`, `e19b3fc`. This is the phase's
acceptance: the four must-haves 18-07 marked `verification: backstop` — narrow-window button
clipping, narration fading in place, the restyled buttons reading correctly, and the lobby seat list
without its colour circle — are judgements only he can make, and he made them.

The narration box was additionally rebuilt as a single owned phase machine after four failed patch
rounds, and measured with the headless harness rather than by eye:

| Measure | Before | After |
|---|---|---|
| Swaps that actually fade | 1 of 9 | 10 of 11 |
| Fades where the box moved | 4 of 4 | 0 of 8 |
| Messages whose text reflowed | "every multi-line one" | 0 of 10 |
| Frames where content overflowed | — | 0 of 1476 |

## Gaps found by this audit

Two, both in the record rather than in the shipped game, both fixed on 2026-08-02:

1. **An unlogged copy change — RESOLVED, and it was the record that was wrong, not the game.**
   `#creditsModal` ships `"every sound effect you hear"`; the copy gate recorded `"ye hear"`.
   Wyatt confirmed the same day that `you` is deliberate: *"the credits page is not 'in the game
   world' so it isn't written in pirate speak."* The shipped text was correct all along; the
   inventory should never have held a `ye` form. The underlying defect was that this voice rule was
   **unwritten** — he had told an earlier session and it was lost — so it is now recorded in
   `.claude/CLAUDE.md`, in the copy gate under "THE VOICE BOUNDARY", and in `18-COPY-CHANGES.md`.
2. **A stale gate row.** FIX-09's row still said both chip treatments were live and undecided, six
   commits after the decision. Corrected.

Neither changes the verdict, and **no items leave this phase open.** The shipped game does what the
phase promised, and the one string that looked like drift turned out to be correct.

## Not verified

The formal per-recipe read of the win banner (18-02's `<human-check>`: driving a solo game to end of
voyage and reading the rendered `.victoryText` for both a plural-title and a singular-title winner)
was declared optional at execution time and never performed in a browser. The logic was confirmed by
the automated chain plus a standalone Node simulation of the same template concatenation. **That is
not the same as reading the real DOM**, and it is recorded here rather than left silent. Risk is low
— the change is two lines behind an existing null-recipe guard — but it is untested in a browser.
