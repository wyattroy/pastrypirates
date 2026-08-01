---
phase: 19-safari-check
status: passed
verified: 2026-08-01
method: lightweight-inline
---

# Phase 19 Verification — safari-check

**Method note, stated up front:** this is a lightweight verification performed inline by the
orchestrator from checks already run during execution — **not** a full `gsd-verifier` agent pass.
Wyatt cut the phase short as over-scoped and asked that no further effort be spent on it, so
spawning a verifier agent would have been the wrong call. Weight this report accordingly.

## Phase goal

Determine whether an always-running wind-dot animation can coexist with the board across a whole
voyage in Safari, and produce a number Phase 20 can design its budget against.

## Goal achieved: YES

Wyatt ran the prototype and reported it **"completely smooth even with 100 dots"** — at
`WIND_DOT_MAX`, the ceiling of the dial. The gate question is answered conclusively, and Phase 20
inherits no dot-count constraint. Recorded in `19-VERDICT.md`.

## Must-haves

| # | Must-have | Status | Evidence |
|---|---|---|---|
| 1 | Wind-dot prototype exists, off by default | ✓ | Region in `src/ui/board.js` between the `WIND DOT PROTOTYPE … BEGIN/END` markers; enabled only via `?wind=1` / `pp_wind_proto` |
| 2 | Multiplayer determinism intact (D-11/D-12) | ✓ | Private `mulberry32` stream salted from the game seed; guard asserts no `.r()` / `Math.random`; `npm test` green with zero `scripts/fixtures` changes |
| 3 | Compositor-only house rule held (BUG-01) | ✓ | `scripts/wind_dot_contract_check.js` exits 0, region-scoped over ~282 real lines |
| 4 | No engine edits | ✓ | `src/engine/` byte-identical across the phase |
| 5 | Safari verdict produced | ✓ | `19-VERDICT.md` — PASS, from Wyatt's own observation |
| 6 | D-02 motion, 0–100 dial, reduced-motion, will-change | ✓ | 19-04 summary; dial verified at both boundaries |
| 7 | Calibrated meter + plain-English summary | ✓ | 19-05 summary; live run produced a readable end-of-voyage report |

All 6 plans have committed SUMMARY files.

## Deviations from plan

- **The D-06 / D-09 two-run, two-device protocol was not executed.** Wyatt stopped it as
  disproportionate and answered the gate directly. Recorded as his decision in `19-VERDICT.md` and
  `19-06-SUMMARY.md`, not as an unmet requirement.
- **Two out-of-scope files were touched** beyond D-14's `src/ui/board.js` + sprite assets:
  `art-review/narration-audit.html` and `scripts/narration_audit_check.js` (commit `4546c82`,
  unblocking a pre-existing red `npm test`), and `scripts/no_undef_check.js` (a missing typed-array
  global). Both logged; both revertible independently.

## Bugs caught before shipping

1. Reduced-motion users saw **no dots at all** — first-frame position was written only by the
   transform branch that reduced-motion skips.
2. The frame meter scored a backgrounded/throttled tab as stutter, inflating its worst-moment figure.

## Outstanding

None blocking. `WIND-00` is satisfied by the PASS verdict.
