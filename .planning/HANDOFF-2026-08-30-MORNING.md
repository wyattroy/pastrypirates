# Handoff — Sunday 2026-08-30 morning

## THE ONE-LINE STATE

**Staging is live and playable at `2026.08.30.1-staging@2cac247d`, and its game code is
byte-identical to the build that sailed as `2026.08.29.2`** — verified by `git diff`, two lines,
both the build stamp. Production is untouched (`origin/main` still at `a416af71`, 2026-08-27).

## WHAT A PLAYER GETS THAT THEY DID NOT YESTERDAY

- **Both screens now work out who a line is about from the SAME rule.** `subjectOf` lives once in
  `src/shared/index.js`; the host and the guest both run it over the same event. Before this the
  host decided and shipped its answer as a wire field.
- **W4-2's other half, which had NEVER worked in a crew game.** Measured on the wire: before,
  **47 narration lines crossed and 0 carried a subject**; after, 4 of 80 carry one and none carries
  half of one. The cause was two lines apart — the bubble is drawn first, and drawing it *spends*
  the host's decision, so the broadcast a moment later found nothing to send.
- Waves 4, 5 and 6 closed.

## WHAT IS NOT FIXED, AND WHAT IS NOW KNOWN ABOUT IT

**W1-4 — sail squares a guest cannot tap. THE TOP ITEM. Diagnosed, not fixed.**
Measured in a real crew game on a 390×844 guest: of the seven captures actually judged, **six
failed, and every one reads `covered 0`.** Nothing is covering them. They are **off the screen
edge** — including six squares at **x = −57 to −116, past the LEFT edge** by more than a full
square. It is a FRAMING problem: the camera's window puts legal moves outside the phone.
`BACKLOG.md`'s W1-4 entry has been corrected to say so; the `#pp4Cap` cause it used to name is not
the cause. Start at `boardBand()` / `capBandBottom()` — for the band and the camera, not occlusion.

**W3-1 — the battle box choreography. Diagnosed, not fixed.** Per-frame trace, three battles: the
card is painted at one vertical position and moves to y≈280 within 67–250ms, from a starting
position that is not constant. A layout applied after the paint rather than before it. The second
half of the report — the coin disappearing before the stage — was never reached and is NOT measured.

**W3-3 and W3-5 — untouched.**

## THREE THINGS I GOT WRONG, ALL CORRECTED IN THE OPEN

1. **I reported the narration bubble as the biggest cause of W1-4 and shipped a change on it.
   FALSE** — CEO Review 27 caught it and I verified it against my own evidence. The bubble is in
   none of the recorded failures. **The change is reverted**: its trial showed no benefit anywhere
   and the one risk the review flagged was the number that rose (22 → 26 fleet-wide).
2. **My probe counted captures it never judged as passes** and printed them as "corrected
   themselves". 11 of 18. The rule that fixes it was already written down for the sea trial — a
   NOT-MEASURED column — and the probe now has one.
3. **My ledger timestamps were up to 3.5 hours in the future.** Re-stamped where establishable from
   commit times; order this file by its commits, not its stamps.

## FOR WHOEVER PICKS THIS UP

- **A sea trial in this container does not survive an idle session.** Two runs died at 933s and
  246s while the session went quiet; the third completed 85 minutes because it was held on a
  polling loop. Hold it.
- **`.planning/CEO-REVIEWS.md` is newest-first.** Reviews 25 and 26 were appended at the bottom and
  `ceo_brief.mjs` duly handed CEO 27 a two-generation-stale verdict. Fixed — keep it that way.
- **The sea trial now NAMES its structural failures** instead of counting them. The count had been
  hiding the top backlog item in plain sight for the whole fleet.
