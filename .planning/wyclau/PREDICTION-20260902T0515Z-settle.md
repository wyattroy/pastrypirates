# PREDICTION — T-001 / SETTLE, written 2026-09-02T05:15Z, BEFORE any measurement

*Rule 6's working form: write down what you expect and why, name what would prove you wrong, then
measure, then say plainly which parts were wrong.*

## What I am about to do

Build **PASS 2 — SETTLE**, the pass Wyatt added when he read the first draft of
`.planning/SPEC-CHARTKEEPER.md`. His words, verbatim: *"Half-Stale items should be prioritized to be
either validated as finished, worked on until finished, or in the worst case, i should be asked if I
am satisfied with their state."*

## What I expect to find, and why

1. **SETTLE does not exist at all.** The Chart's own `T-001` row says *"zero occurrences in the
   code"*, and the tool's header comment advertises **three** passes (REAP / RANK / SWEEP).
2. **A bundled row — several checkable parts under one checkbox, some satisfied and some not — is
   invisible to every existing pass.** REAP asks its questions of the WHOLE row, so a row whose
   *first* part is finished and whose *second* is real work produces either one flag (wrongly
   implying the whole row is stale) or none at all. My expectation is **none**, because REAP's
   probes are pointer probes and a bundle's live part usually still carries a live pointer.
3. **Therefore the Blade-hour row can never be ticked and never rises** — which is precisely the
   drift his sentence is about.

## What would prove me WRONG

- `--json` already emits a `settle` key, or `grep -i settle` finds a pass in the tool → SETTLE
  partly exists and I should EXTEND it, not build it.
- REAP already flags a half-satisfied bundled row → the detection I am about to write is a
  duplicate, and rule 23 says converge on the existing one instead of adding a second.
- The gate already has a case that fails on a bundled row → step 1 is already done and I should
  read it rather than write a second.

## The constraint I already measured, before choosing this over SWEEP

`glass.mjs` is **vendored** (`.claude/wyclau/MANIFEST.sha256` line 1) and the claude-kit checkout is
outside this session's permitted directories — a read of it is **refused**, not empty. So the
banner's item 2 (sweep every completed row) cannot land with the repair it says must land in the same
change, and sweeping without it takes his Tasks card to *"0 done"*. **That is why this watch takes
banner item 1.**

## What I expect the fix to be

A fourth pass in `chartkeeper.mjs` that (a) derives a row's CLAIMS from its own text, never a flag,
(b) runs the existing REAP probes against each claim, (c) assigns one of his three fates, and
(d) under `--write` ACTS on the two that do not need him. **It must not touch a row's first line**
(CEO 91's regression) and **it must not tick a box** (the tool's oldest invariant).

## RESULT — measured 2026-09-02T05:2xZ

**RIGHT on 1, 2 and 3.** `grep -i settle` over `scripts/wyclau/` and the gate found nothing but
unrelated hits ("settle timing", "settleTrade"). The new gate cases went **RED 11 times** on the
first run, and the sharpest failure is the one I did not predict in this shape and is the most
valuable thing here:

> `FAIL  told him a half-done row "looks finished": "looks finished — needs a verdict, not work"
> — two of its three parts are untouched work`

**That is not a missing feature, it is a misreport.** One dead pointer anywhere inside a
bundle makes REAP flag the WHOLE row, and RANK then produced the sentence "looks finished" for a
row nobody has started two thirds of. Rule 6's own territory, reached from the opposite direction:
not an unmeasured claim, but a measurement of the wrong subject.

> ### ⚠ AND MY FIX WAS HALF OF IT. CEO 93 FOUND THE OTHER HALF BY RUNNING THE TOOL ON THE REAL CHART.
>
> I fixed the BUNDLED case and reported the misreport as fixed. **It was still wrong on four live
> rows**, including the Chartkeeper's own — labelled *"looks finished"* while its own text said
> half of it was blocked and unbuilt. **The fault was never about bundles.** REAP measures a
> POINTER; a row can have every pointer in it resolve and still be entirely unstarted. Fixed
> properly: the phrase is now *"something it was waiting on has landed"*, red-proofed both ways in
> gate case 10i, with the +40 unchanged because a row whose blocker has lifted really is the
> cheapest thing on the list to pick up.
>
> **AND ONE CLAIM OF MINE WAS SIMPLY FALSE:** I wrote, in a code comment and in the Chart row, that
> the wrong phrase was *"live on his page"*. It was not. `whyNow` prints to the console only —
> never into `CHART.md`, never onto the Glass. What reaches his page is the score's effect on
> ORDER. **A comment making a runtime claim, in the file whose own comments warn against exactly
> that.** Corrected at both sites in the open rather than edited away.

**WRONG about one thing, and I only found it because I pointed the finished pass at the REAL Chart
instead of trusting the green gate.** Every case passed and the tool then reported **zero bundled
rows on `CHART.md` — including the Blade hour**, the audit's own worked example. Two faults, both
in the claim derivation, neither visible to any fixture I had written:

1. The Chart writes a bundle as a **comma list after a colon** ("…: register the Bell, the ring
   test both directions, the O2 publish test — runbook …"). I had only built the part-marker and
   `·`-segment shapes.
2. The Chart **hard-wraps at ~100 characters**, so that list is cut in half across two lines.
   Reading `lines[0]` alone found two parts where there are three and fell under the three-part
   guard. *A row's opening sentence is a sentence, not a line.*

Both are fixed, and the durable lesson is now a gate case of its own (10h): **the tool reports how
many rows it EXAMINED, not only what it found** — because a pass that is silent on a healthy Chart
and a pass that has gone blind print exactly the same line. It now examines 5 bundled rows on the
real Chart.

## AND THE HONEST LIMIT, STATED RATHER THAN BURIED

**On today's real Chart, SETTLE finds NO half-done row — and that is a true answer, not a broken
one.** The Blade hour is bundled and is genuinely one-third finished, but the evidence for that
third is **prose** in the row's body (*"the Bell-registration third is done"*), not a pointer any
probe can ask the world about. The spec's detection rule is *"REAP's derived questions come back
TRUE for some and not others"*, and prose-grepping is the exact fault this project has paid for
repeatedly. **So SETTLE will act the first time a bundled row's finished part has a real pointer —
a dead pid, an answered question, a report on disk, a retired stamp — and not before.** I would
rather report that plainly than widen the rule until it fires on something.
