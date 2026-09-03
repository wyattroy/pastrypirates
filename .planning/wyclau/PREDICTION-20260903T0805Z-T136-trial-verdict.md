# PREDICTION — is the 0624Z trial's FAILED verdict real, or a stale snapshot of a red suite?

**Written 2026-09-03T08:05Z, BEFORE reading the voyage section of the report.** Written because the
Door's Proof step now demands it, and because three CEO verdicts in a row found that the claim
without a prediction is the one that turns out false.

## THE DECISION THIS FEEDS

`T-136` — staging is two builds behind and he plays staging. The release contract is
`npm test` → gear → sea trial → deploy. The suite is green now. **The trial says FAILED.** If that
FAILED is real, the deploy waits and the failure is the work. If it is a stale snapshot, the
question is whether a verdict can be re-derived without re-sailing 89 minutes.

## WHAT I EXPECT, AND WHY

**I expect the FAILED verdict to be entirely the browser-free half, and the ten voyages to be
clean.** Grounds, all from the report's own header before I look further:

- `10 of 10 voyage(s) sailed`, and **`voyages that did NOT run: none`** — the NOT-RUN column is the
  one the process says must never be lost, and it is empty.
- The failure section is headed *"The browser-free checks failed"* and its contents are **gate
  fixture output** — `T-802`, `T-803`, `no-such-row.md`, a `donow-CimBwl` temp directory. Those are
  `chartkeeper`'s own test fixtures printing their refusal messages, not the game misbehaving.
- The trial started **06:24:45Z**. `chart_sweep_conserves_check` was red until I fixed its ownership
  regex at ~07:0xZ, and `rulings_triage_check` was red again after that until ~07:3xZ. **The suite
  genuinely was red at 06:24.** It is green now, measured twice since.

## WHAT WOULD PROVE ME WRONG — and this is the half that matters

- **Any structural failure reported inside the voyages themselves.** If the voyage table names
  captured faults, unreadable screens, or a leg that stalled, the FAILED is real and stale-suite
  reasoning is a rationalisation. **Test: read the voyage section and the judge's counts.**
- **Any leg with unjudged screens.** A trial that sailed but could not see is not a trial that
  passed — the same "the check could not reach its subject" fault as everywhere else tonight.
- **A failure in the browser-free half that is NOT a fixture.** If the `npm test` output names a real
  gate failing on real files rather than temp fixtures, then the suite's redness at 06:24 was about
  something the trial legitimately cared about.

## THE TRAP I AM MOST LIKELY TO FALL INTO

**Wanting the answer.** He plays staging, staging is two builds behind, and the only thing between
him and the current build is this verdict. That is exactly the pressure under which a session
decides a failure was "just the instrument" — which is the shape of half of tonight's mistakes,
including two of my own. **If the voyages are not clean, the deploy waits and I say so plainly.**

And one thing I will NOT do either way: re-run `npm test` and treat today's green as the trial's
green. **The trial's verdict is about the tree it sailed.** Re-deriving one half of it by hand is
evidence for a decision, not a substitute for a trial.
