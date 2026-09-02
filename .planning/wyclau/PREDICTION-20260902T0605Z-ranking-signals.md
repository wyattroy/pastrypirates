# PREDICTION — the two unsound RANK signals, written BEFORE the fix

*Watch 2026-09-02T06:0xZ, `T-001`. Rule: write down what you expect and why, name what would prove
you wrong, THEN measure. This file was committed before a line of `chartkeeper.mjs` changed.*

## What I am about to change

`score()` in `scripts/wyclau/chartkeeper.mjs` has two signals CEO 91 measured unsound. Both feed
the ORDER of the Tasks card on Wyatt's Glass, which is the only place he steers this project from.

**A — "approved and unblocked", +100.** It regex-matches `ruled YES | he ruled | his ruling |
your ruling | at his instruction | his instruction | he asked for this` **inside the row's own
prose**. A row is therefore approved because it says so about itself.

**B — "you have raised it N times", +8 each.** It counts INBOX entries whose distinctive-word set
overlaps the row's first 900 characters by 4 or more, and prints that count at him as a sentence.

## What I expect to find, and why

1. **Signal A is self-declaring on rows nobody approved.** Prediction: at least two of the five
   rows currently scoring +100 get it from a sentence that is *about something else* — the row
   mentions a ruling on an adjacent question, not an approval of the row's own work. My specific
   guess: *"Repair the two disarmed Advisor gates"* (rank 2) is credited because its body says the
   gates were unregistered *"on his ruling"* — a ruling to DISARM them, which is not approval to
   repair them.
2. **Signal B's number is an artefact of essay length, not of his attention.** Prediction: the
   rows with the highest counts are simply the LONGEST rows, and the correlation with anything he
   actually said will be weak. Specific guess: the `can_push` row's "10 times" survives even if
   every INBOX entry's *subject* is unrelated to `can_push`, because 900 characters of this
   project's prose shares four five-letter words with almost anything.
3. **Grounding both in external records will REORDER his list, not merely re-word it.** Prediction:
   several rows move by 5 or more places, and the ranking becomes *less* confident overall (fewer
   phrases per row) — which is the honest direction.

## What would prove me WRONG

- If every +100 row turns out to cite a ruling that really is about that row's own work, signal A
  is sound as written and should be left alone. My whole case for A collapses.
- If the high "raised it" counts correlate with rows he has genuinely raised repeatedly — the
  Chartkeeper (4 asks), the trade circle (3 sightings) — then B is crude but pointing the right
  way, and the fix is a threshold, not a re-grounding.
- If the trade-circle row (3 recorded sightings) scores HIGHER than the `can_push` row (0 asks
  from him), B is ordering correctly despite the wrong number, and cutting it would cost more than
  it saves.
- If grounding produces a list whose top rows are obviously worse to work on than today's top
  rows, the "unsound" finding is real but the replacement is worse, and I should say so and stop.

## What happened immediately before (rule: widen the time horizon)

Signal A was **widened by the watch that built it**, in the open, after its own row ranked 14 of
32. CEO 91's verdict on that was *"fitting the tool to flatter its own item"*. So the failure is
not a careless regex — it is a regex that was **edited to make a specific row win**, which is the
strongest possible argument that the source of approval must be a record the tool's author does
not write.

## The gear

`gear.mjs` reads **FULL**, and that is about the branch (465 commits ahead of `origin/main`), not
about this change. This change touches `scripts/wyclau/`, `scripts/qa/` and `.planning/` only — no
`src/`, no `index.html`, nothing a player can reach. `npm test` is the honest depth; a sea trial
cannot say anything about a Chart-ordering tool.
