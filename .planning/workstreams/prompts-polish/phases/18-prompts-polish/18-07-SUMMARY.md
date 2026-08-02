---
phase: 18-prompts-polish
workstream: prompts-polish
plan: 07
type: execute
status: complete-retroactive
executed: 2026-08-02
requirements: [FIX-03, FIX-04, FIX-06, FIX-07, FIX-08, FIX-09, FIX-10, FIX-16, FIX-17, FIX-21]
tags: [phase-gate, copy-inventory, safari, visual-review, retroactive]
---

# Phase 18 Plan 07: Close The Phase — Summary

**Written retroactively on 2026-08-02, after Phase 18 had already merged and shipped.** This plan was
never executed at the time; the phase closed on Wyatt's live Safari playtest instead. This summary
records what had in fact already been satisfied by other means, what had not, and what was done on
2026-08-02 to finish it.

## Status at a glance

| 18-07 must-have | State | How |
|---|---|---|
| Every copy change recorded against the copy gate, matched by label and literal text | ✅ **now complete** | Six of seven plans logged their own row into the gate todo as they went. Two defects found and fixed 2026-08-02: one **unlogged text change** and one **stale row**. See below. |
| Exactly one FIX-09 treatment survives; no unreachable CSS ships | ✅ already done | Commit `2438aa3` — Wyatt chose Treatment B 2026-08-01 (*"I LOVE true"*), Treatment A deleted. Verified 2026-08-02: one treatment in `index.html:242`, decision recorded in the CSS comment. |
| `npm test` green including `determinism_baseline.js --verify` | ✅ verified 2026-08-02 | All 21 scripts pass, 0 failing checks. Determinism contract (D-12) passes. |
| No file in the phase diff touches `src/engine/index.js` | ✅ verified 2026-08-02 | That file's most recent commit is `17ee908` (Phase 14). Phase 18 never touched it. Milestone constraint 1 held. |
| Narrow-window action button never clipped (Wyatt, real Safari) | ✅ satisfied by other means | Playtest items P1–P12, 2026-08-02, all passing. |
| Narration fades in place, box does not slice a fading line (by eye) | ✅ satisfied by other means | Same playtest, plus the narration-box rebuild measured with the headless harness — swaps that actually fade 1-of-9 → 10-of-11; fades where the box moved 4-of-4 → 0-of-8; reflowed messages "every multi-line one" → 0-of-10; overflow frames 0-of-1476. |
| Restyled primary buttons read correctly incl. `.ahoyGlow` | ✅ satisfied by other means | Same playtest. |
| Lobby seat list readable with the colour circle gone | ✅ satisfied by other means | Same playtest. |

## What was actually done on 2026-08-02

1. **Wrote `18-COPY-CHANGES.md`** — the phase's consolidated copy ledger, 8 rows, the artifact this
   plan was created to produce.
2. **Found and logged an unrecorded copy change.** The credits clause shipped as
   `"every sound effect **you** hear"` while the gate recorded `"ye hear"` — a one-word change made
   in playtest commit `10b3bbc` and never logged. Flagged for Wyatt's confirmation; no code changed.
3. **Corrected a stale gate row.** The FIX-09 row still described both chip treatments as live and
   undecided, six commits after the decision landed and the loser was deleted.
4. **Ran the full verification** recorded in the table above.

## The honest reading

The distributed per-plan logging worked — it captured six plans' worth of changes in real time
without this plan running at all. What it could not do is catch a copy change made **after** the
plans finished, during the playtest batch, when no executor was watching the gate. That is the one
thing a phase-closing pass is uniquely for, and skipping it cost exactly one unlogged string.

Small in itself. But this gate exists because four approved rewrites once shipped missing and were
only found by hand, and this one was also found by hand. The mechanism whose absence caused the
original loss is still absent.

## Files created/modified

- `18-COPY-CHANGES.md` — created
- `18-VERIFICATION.md` — created
- `.planning/todos/pending/copy-shipped-vs-approved-gate.md` — one row corrected, one row added, one Phase 21 entry annotated
- `18-07-SUMMARY.md` — this file

No source files were modified by this plan.
