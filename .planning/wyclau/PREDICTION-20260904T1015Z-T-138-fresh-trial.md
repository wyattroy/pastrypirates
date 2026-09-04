# Prediction — T-138, starting a fresh detached trial to cover T-256's fix

**Written before measuring**, per the Door's rule 6-working-form.

## What I expect, and why

T-138 (player-count console, launch-line row) is blocked, per the 0930Z watch's own note, on "a
fresh FULL sea trial of the code that would actually ship" — specifically one that covers commit
`fe87894a` (T-256: `camFrame()` now reserves `#legalFooter`'s height on phone width so `#pp4Cap`
never paints under it).

Measured, not guessed: the last finished detached trial, `2026-09-04T0744Z-Wy-Blade` (build
`2026.09.04.1`, 81 min, 10/10 legs sailed), started its build-stamp bump at `2026-09-04 07:44:52Z`
(`git show -s c9c0421a`). The T-256 fix landed at `2026-09-04 09:58:24Z` (`git show -s fe87894a`)
— **after** that trial's stamp bump and, in practical terms, after the trial itself, since the
0744Z run finished around 09:12Z per the previous watch's own timing note (which itself precedes
the fix). So that trial's evidence does not include this fix.

**I expect:** the build stamp (`PP4_STAMP`) still reads `2026.09.04.1` even though real game-code
commits landed since the last bump (the known `T-009`/`T-219` gap — the stamp is hand-maintained,
not derived from the tree). Bumping it again and starting a fresh detached FULL trial should:
1. Produce a report whose evidence genuinely covers `fe87894a`.
2. Show NO captains-panel/legal-footer overlap on phone-width screenshots (solo-phone,
   passplay-phone, crew-phone-host, crew-phone-guest) — the fix's own red-proof already showed
   0px overlap on a phone seat and a tablet control before this trial ran.

## What would prove me wrong

If, after bumping the stamp and re-sailing, the new trial's phone-width screenshots STILL show the
`#legalFooter` sitting over `#pp4Cap`'s bottom row, then either the fix does not generalize past
the two seats it was red-proofed on, or `camFrame()`'s reservation logic has some other gap the
red-proof didn't exercise. That would mean T-256 is not actually closed correctly and should be
reopened rather than trusted.

I am not sailing this trial inside my own session — it takes ~80 minutes and Door step 4 says a
long job runs detached, outliving the watch that starts it. This watch's job is to start it
correctly (fresh stamp, npm test green first) and record it so the next watch reads the finished
report rather than re-starting it.
