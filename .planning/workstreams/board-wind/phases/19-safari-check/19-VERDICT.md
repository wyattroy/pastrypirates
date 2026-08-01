# 19-VERDICT.md — the number Phase 19 exists to produce

**Verdict: PASS.**

## The measurement

Wyatt ran the build himself and reported:

> "it looks completely smooth even with 100 dots"

That is the phase gate, answered. `WIND_DOT_MAX` is 100 — the dial's ceiling — so the prototype was
smooth at the **top of its range**, not merely at the 10-dot default.

## What Phase 20 inherits

**No dot budget is required.** The headroom question this phase was created to answer ("how many
dots before it hurts?") has no meaningful answer, because it did not hurt anywhere in the dial's
0–100 range. Phase 20 can design for the D-02 target density of 5–10 dots with the whole range in
reserve.

The formal D-06 two-run / D-09 two-device protocol was **deliberately not executed.** Wyatt stopped
it as disproportionate to the question, and his direct observation supersedes it. That decision is
his and is recorded here rather than left as an open gap.

## Scope honesty

- Measured by eye, not by the calibrated meter. Good enough: the question was "does this stutter",
  and the answer at maximum load was an unambiguous no.
- Per D-03 the gate covered **dots only**. Rim arrows and whirlpool rotation were excluded, not run,
  and are not reported on.

## What the phase shipped

An off-by-default wind-dot prototype in `src/ui/board.js` (enabled by `?wind=1` or the
`pp_wind_proto` localStorage key), containing:

- seeded per-dot specs drawn from a **private** `mulberry32` stream salted away from the shared game
  RNG — multiplayer determinism intact, all 31 fixtures unchanged
- the full D-02 fade-and-wobble motion
- a 0–100 dial, correct at both boundaries
- a `prefers-reduced-motion` branch and a defaults-OFF `will-change` toggle
- a calibrated frame meter and a plain-English end-of-voyage summary

## Two real bugs caught before shipping

1. **Reduced-motion users saw no dots at all.** Not "dots holding still" — nothing. A new dot's
   first position was only ever written by the transform branch, which reduced-motion skips by
   design, so dots sat unset and clipped outside the board. Silent, and unlikely to be reported.
2. **The meter inflated its own worst-moment figure**, counting a backgrounded/throttled tab as
   stutter rather than ignoring it.

Both fixed in `src/ui/board.js`, both re-verified.
