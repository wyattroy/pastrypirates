# PREDICTION — does the board actually stop moving, and when?

**Written 2026-09-03T08:15Z, BEFORE launching anything.** Third prediction in ninety minutes; the
previous two were both wrong and both caught by their own falsifiers, which is why this one exists.

## THE QUESTION THAT DECIDES `T-136`

Every voyage in the 0624Z trial failed on *"screens never stopped moving before being checked"*,
**all of them geometry, none words**, with longest waits of 2.6–3.0s against a 2600ms cap.

**Either the board genuinely keeps moving past 2.6s (a game fault), or it stops and the cap is
simply too tight for geometry (an instrument fault).** The trial cannot tell these apart — it gives
up at the cap and reports the same sentence either way. So the measurement it cannot make is:
**sample the geometry signature well PAST the cap and find out when it actually goes still.**

## WHAT I EXPECT, AND WHY

**I expect the board to settle, somewhere between 2.6s and about 4s, on most screens** — i.e. the
instrument fault. Grounds:

- The cap's own comment says it was derived from TEXT (narration at ~25ms/char, 75 chars → 2202ms)
  and never from motion. A number fitted to one quantity and applied to another is usually wrong by
  a modest factor, not by an order of magnitude.
- The failures cluster tightly at 2.6–3.0s. **A board that never settles would not cluster** — it
  would report the 12000ms hard guard, which `checks.mjs` says is reported when it bites. **No leg
  reported it.** That is the strongest single hint and it is already in the report.
- `checks.mjs:177` lists exactly what keeps moving by design: *"bounce, ships glide, the ripple
  pulses"* — periodic animations. If any of those are permanently animating on a settled board, no
  deadline of any size fixes it, which is the other branch below.

## WHAT WOULD PROVE ME WRONG — and I have now been wrong twice tonight, so this is the real content

1. **The signature never goes still inside 8 seconds.** Then something animates forever, the cap is
   innocent, and **this is a game fault** — a permanently-churning element that also happens to be
   burning a browser (rule 17's concern, not just the trial's).
2. **It settles well INSIDE 2.6s.** Then the cap is not the story either, and the failures come from
   *when* the trial samples — it checks at the worst moment by design ("as the animation STARTS"),
   so the fault would be sequencing, not duration. **That would make my whole framing wrong.**
3. **It differs wildly by screen.** If some settle at 1s and others never do, then "the cap is too
   tight" is a claim about an average that describes no actual screen, and the honest answer is a
   per-screen one.

**And the trap, named before I meet it, because the last one caught me:** I want this to be an
instrument fault, because that unblocks his staging deploy and a game fault does not. **If the
signature is still changing at 8 seconds I must say so plainly and the deploy stays blocked.**

## THE MEASUREMENT

Load the game solo, drive nothing, sample the SAME geometry signature `checks.mjs` uses, every 120ms
for 8 seconds, and report the last timestamp at which it changed. Bounded loop, one browser, killed
in a `finally` (rule 17). No trial is at sea — the 0624Z run ended — so nothing is being skewed and
nothing is competing for the machine.
