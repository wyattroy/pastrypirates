---
phase: 19-safari-check
plan: 06
status: complete
completed: 2026-08-01
---

# 19-06 Summary — the Safari verdict

## What was built

The Chrome pre-flight checklist (Task 1) ran in full and is recorded in `19-SAFARI-RUN.md` §6, and
`19-VERDICT.md` carries the phase's answer.

## The verdict

**PASS.** Wyatt ran the build himself and reported it "completely smooth even with 100 dots" — at
`WIND_DOT_MAX`, the top of the dial, not the 10-dot default. Phase 20 inherits no dot-count ceiling.

## Deviation — the formal protocol was cut short, deliberately

Tasks 2 and 3 as planned called for D-06's two runs across D-09's two devices, then a verdict
assembled from calibrated meter readings. **Wyatt stopped that protocol as disproportionate** to the
question it answered, and gave the answer directly by looking at the running build.

His words: the phase was "absolutely ridiculous" in scale for decorative wind dots, it exhausted his
usage allowance, and the visible Chrome instances the pre-flight drove were disruptive because they
stole keyboard focus.

This is recorded as the user's decision, not an unmet requirement. His direct observation at maximum
dot count answers the gate more cheaply and just as conclusively as the meter would have. The
calibrated meter still ships and works; it simply was not needed to reach the verdict.

**Carried into future work** (saved to durable memory): match verification effort to what is
actually at stake, always drive browsers headless (`--headless=new`), and treat long autonomous
subagent fan-outs as expensive.

## Value the pre-flight did return

Two real bugs, both fixed in `src/ui/board.js` before any of this reached a player:

1. **Reduced-motion users saw no dots at all** — a new dot's first position was written only by the
   transform branch, which reduced-motion skips by design, leaving dots unset and clipped off-board.
   Silent and unlikely to be reported.
2. **The meter inflated its own worst-moment reading**, scoring a backgrounded/throttled tab as
   stutter.

## Verification

- `node scripts/wind_dot_contract_check.js` — exit 0
- `npm test` — exit 0, zero changes under `scripts/fixtures`
- Prototype remains off by default (`?wind=1` / `pp_wind_proto`)
- No engine edits; `src/engine/` byte-identical

## Self-Check: PASSED
