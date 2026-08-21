---
created: 2026-08-21T05:30:00.000Z
title: Two parity assertions no longer describe the code they watch (SAILRECT, SWEEPARRIVE)
area: testing
severity: minor
tree: "4/ + scripts/ (the strict gate)"
status: pending
source: measured during 02.15-02 phase gates, 2026-08-21 — pre-existing, NOT introduced by the prompt-seam work
---

## Problem

`node scripts/host_guest_parity_check.js --tree=4 --strict` fails three assertions. One
(PARITY-ORCH / localAsk) is the honestly-declared parked gap and SHOULD be red until the ask
channel converges. The other two are stale instruments, red against healthy code:

- **PARITY-SAILRECT** expects exactly 1 rect builder in `4/src/ui/flow.js` matching `class:"sailCell"`;
  the builder now sets `d.className="sailCell"` imperatively (flow.js:497) so the pattern finds 0.
  The one-builder property it protects is real and currently true — the grep just can't see it.
- **PARITY-SWEEPARRIVE**'s own message says it: "animateRimSweepIfAny no longer builds a
  rimSweepCurve — this assertion no longer describes the code and must be rewritten, not deleted."

## Measured

Identical three failures at `e58fda4` (before 02.15-02) and at HEAD — the drift happened during the
2026-08-20 evening session's sail/sweep changes, before the prompt-seam plan ran.

## Fix shape

Rewrite both assertions against the code as it now is (SAILRECT: match the className form or count
callers of the one builder; SWEEPARRIVE: assert whatever the sweep path now guarantees), and drill
each RED with a synthetic violation before trusting the green. Do NOT delete either — both protect
real one-builder properties.

## Why it matters

A gate carrying known-stale reds teaches sessions to ignore its reds — which is how a real red gets
ignored. Strict mode is unusable as a go/no-go signal until only honest reds remain.
