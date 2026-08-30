# W1-4 — sail squares a guest cannot tap. PREDICTION, WRITTEN BEFORE MEASURING.

**The top item on the backlog, deferred at the cutover by Wyatt's explicit call on the
understanding it is written down rather than forgotten.** The trial for build `2026.08.29.2`
reproduced it independently on `crew-phone-guest`: 14 structural failures, including
`on-screen: clickable off-screen: sailCell` and `sail-clickable: 2 sail square(s) covered <- #pp4Cap`.

## TWO GEOMETRY THEORIES ARE ALREADY DEAD. I am not re-running them.

The record is explicit: two days went into measuring WHERE the squares were — their rects, the
board transform, the camera scale — and both theories were measured dead. The backlog's own
standing entry (`sailCell covered by #pp4Cap`) is marked **THE RECORDED CAUSE MAY BE THE WRONG
ONE**, because in Wyatt's 2026-08-27 screenshot the captains panel is nowhere near the lowest
square. **A snapshot cannot show a race, and this is a race.**

## WHAT HAPPENED IMMEDIATELY BEFORE — the two sites, read rather than guessed

1. `src/ui/flow.js:632` — the squares are drawn, and the camera is asked to frame them **180ms
   later**: `if(window.__pp4)setTimeout(()=>window.__pp4.sailCells(p.idx),180);`
2. `src/ui/stage.js` `camTo()` — while the flip veil (`body.pp4Cer`) or a centre-stage card
   (`#actionPanel[data-pp4-stage]`) holds the audience, **a requested glide is REMEMBERED, not
   performed**: `S.camHeld = [x, y, w]; return;` — and `tick()` performs it when the stage clears.

That remember-and-replay is Wyatt's item 7 and it is right. So the naive version of the race —
"the camera refuses and the framing is simply lost" — **should self-heal**, and I do not believe it
as stated.

## THE PREDICTION, and it is one level past the recorded one

**`S.camHeld` holds exactly ONE remembered move, and the LAST refused request wins.**
`camTo` overwrites it on every refusal (`S.camHeld = [x, y, w]`), and `camTo` is the single door
every director move walks through — `camFull`, `camToCell`, `camToSeat` and `camFitCells` all funnel
into it. So if ANY other camera move is requested after `sailCells` while the stage is still up —
a seat framing for the active captain, a full-board reset — **it silently replaces the sail
framing**, and when the stage clears the camera glides to that instead. The squares were framed
correctly by a request that was thrown away.

## WHAT WOULD PROVE THIS WRONG — named before the run, so it cannot be retrofitted

- **If `sailCells` is the last camera request before the stage clears** and squares are still
  off-screen, the overwrite theory is dead and the framing itself is wrong.
- **If the squares are off-screen while NO stage card was ever up**, then nothing was refused,
  there is no race, and this is geometry after all — which would revive the two dead theories and
  mean I have misread the record.
- **If `sailCells` is never called at all on a guest**, the fault is upstream of the camera
  entirely.

## HOW IT WILL BE MEASURED

A crew game, host and guest, guest at **390×844**, driven to a real tap-to-sail prompt. At that
moment, from inside the guest's page: every `.sailCell`'s rect against the viewport and against
`#pp4Cap`; the board's `viewBox` sampled continuously; and whether a centre-stage card or the
ceremony veil was up in the two seconds before.

**RED-PROOF THE INSTRUMENT BEFORE BELIEVING EITHER VERDICT.** An acquittal here is as suspect as a
conviction — three probes this session reported a state they had never actually created. If it says
every square is reachable on a build the trial just failed on this exact leg, suspect the probe.

---

## THE MEASUREMENT. MY PREDICTED MECHANISM IS NOT SUPPORTED, AND THE REAL ONE IS TWO CAUSES.

`scripts/qa/w14_guest_sail_reach.mjs`, real crew game, guest at 390×844, 8 minutes, **18 tap-to-sail
prompts**. Raw output: `.planning/research/wave1-convergence/W14-GUEST-SAIL-REACH.txt`.

**FAIL — 6 of 18 prompts still offered a square the guest could not tap 400ms in, with the driver
about to tap. 11 more were wrong only on the first frame and corrected themselves.**

**FALSIFIER 2 FIRED, and it was the one I named against my own theory:** *"if the squares are
off-screen while NO stage card was ever up, nothing was refused and there is no race."* In the
histories printed before the failing prompts the stage reads `-` throughout — no card, no veil —
while the viewBox glides smoothly to rest. **Nothing was refused, so `S.camHeld` was never written
and could not have been overwritten. My prediction was wrong.**

### WHAT IS ACTUALLY THERE — two causes, and they are different bugs

**1. THE NARRATION BUBBLE SITS ON THE SQUARES IT IS ASKING ABOUT.** 10 of the coverings name
`.pp4Bub` / `.pp4BubIn`. On prompt 1, seven squares at y243–292 were under the bubble. This is the
trial's `no-cover-ask` rule — *"control covering the question it answers"* — which fired **10 times
across the fleet** and is the single most common structural failure in the whole run.

**2. A SQUARE IS DRAWN PAST THE RIGHT EDGE.** Prompt 3: a square at **x=400 on a 390-wide
viewport** — 47px wide, so entirely outside. That is Wyatt's "cut off at the screen edge", and it
is NOT the captains panel: the panel occupies y642–844 and this square is at y653 but *also* past
the right edge.

**THE CAPTAINS PANEL IS THE THIRD, AND IT IS THE SMALLEST.** Two coverings had their centre inside
`#pp4Cap`. The backlog's standing entry names `#pp4Cap` as *the* cause; on this evidence it is the
least of the three, which is consistent with the ⚠ already on that row.

### WHAT THIS CHANGES

The item is not one bug. **A fix for the camera framing would not have touched the bubble**, which
is the commonest cause — and that is very likely why two days of geometry work found nothing: they
were measuring the third-most-common cause of a three-cause fault.


---

## ⚠ CORRECTION, SAME NIGHT, BY CEO REVIEW 27. THE SECTION ABOVE IS WRONG AND STAYS VISIBLE.

**"The narration bubble is the biggest cause" is FALSE, and I verified it against my own evidence
file rather than taking the reviewer's word.** Every one of the six recorded failures in the
before-run reads **`covered 0`** at the judging moment. Their failures are `off-screen` and
`clipped`. **The bubble appears in not one of them.** Every `.pp4Bub` covering I counted came from
an on-sight capture that either passed at settle or was never judged at all.

**AND PROMPT 1 IS MY OWN REFUTATION, which I printed and did not read:** 7 squares under the bubble
on sight, **0 at +400ms — before the fix.** The existing avoidance had already re-placed it inside
my own judging window. The thing I "fixed" was demonstrably already working on the one prompt where
I could see both ends.

**THE INSTRUMENT FAULT UNDERNEATH IT.** `judge()` returns null once the driver has tapped, so a
capture with no settle reading **cannot fail** — and I counted all of them in the denominator and
printed them as *"corrected themselves"*, which the probe never observed. 11 of 18 before, 9 of 11
after. Stripped out, the honest scoreline is **6 of 7 failing before, 2 of 2 failing after**.

**AND THE "SHIFT IN WHO IS COVERING" WAS PRINT ORDER.** The list was capped at six per prompt and
ordered `[off, clipped, covered]`, so coverers were truncated away on the worst prompts — and 13 of
23 printed coverings named no element at all (`COVERED by .`). A tally read off that is measuring my
own output format.

**WHAT IS ACTUALLY THE BIGGEST CAUSE, on the data that survives:** squares off the screen edge —
including six at **x = −57 to −116**, off the **LEFT** edge by more than a full square, which my
remainder list never mentioned. That is `BACKLOG.md`'s own words: *"the board's left column cut by
the screen edge."* **Wyatt said this in the first place and it is still there.**

**THE RULE THIS EARNS, and it was already written down for the sea trial:** *a probe must report
what it FAILED TO MEASURE in its own column, and never fold it into the pass side.* CLAUDE.md §5:
*"What the report must never lose: the NOT-RUN column."* The probe now has one.
