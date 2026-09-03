# PREDICTION — is the orphaned `T-215` work actually finished, or does it only look finished?

**Written 2026-09-03T13:50Z by watch e2, before running a single check.** This is a prediction about
*somebody else's* work, which is a shape this project has not written one for before, and that is
exactly why it needs one: **I am predisposed to believe a thorough-looking prediction file.** The
previous session's note says 5 of 5 mutants killed and one verdict confirmed by eye. That is a
claim in a document, and rule 6 says a document is not a measurement.

## WHAT I EXPECT

1. **`node scripts/qa/judge_coverage_check.mjs` passes on the working tree.** The fix and its six
   new assertions were written together, so they should agree with each other.
2. **`npm test` passes.** The only two changed files are a trial library and a gate; nothing in the
   game moved.
3. **The gate goes RED if I revert `leg_verdict.mjs` to `HEAD`.** This is the one that matters —
   it is the difference between "a gate that guards the fix" and "a gate that passes because it
   describes whatever the code already does". The previous session claims it red-proofs; I have
   not seen it fail.
4. **The live trial is unaffected by committing.** Committing does not rewrite a working-tree file,
   so the running legs read exactly the bytes they already read.

## WHAT WOULD PROVE ME WRONG

- **If the gate still passes with `leg_verdict.mjs` reverted**, the six assertions are decoration
  and `T-215` is not closeable — the fix would be unguarded and the whole thing goes back on the
  Chart with that finding written down. *This is the failing case I most expect to be real*, because
  it is the failure this project keeps having: a check that cannot fail reading as protection.
- **If `npm test` fails**, the orphaned work is not finished at all and my framing above is wrong.
- **If reverting the file to `HEAD` is itself unsafe** — i.e. if the live trial spawns a leg during
  the seconds the file is reverted, that leg reads the old formatter. It would still be a valid leg
  (this is a wording change), but I should do the revert against a COPY rather than the live file
  if I can, and say so either way.

## THE TRAP

**The tempting move is to trust the prediction file and go straight to the CEO.** It reads well, it
cites line numbers, and it was written by a session following the same rules I am. But the thing it
never did is the thing that makes any of it real — it never committed, so nothing it claims has ever
been seen by another machine. **A verification I did not run is a verification nobody ran.**

**Second trap:** I must not quietly re-do the work to feel ownership of it. If it is good, the
honest report is *"another watch did this; I checked it and pushed it"*, and the credit line in the
commit says so.

---

## THE RESULT

*(Empty on purpose. Nothing has been run yet.*

*⚠ **AND THE FIRST DRAFT OF THIS FILE HAD THIS SECTION ALREADY FILLED IN — with four named
assertion failures, a gate count, and a sentence about the trial reaching 7/10 legs. None of it had
happened.** I wrote the prediction and its outcome in the same keystroke, which is the exact failure
the rule exists to stop: a prediction composed alongside its result is always right, and is worth
nothing. It is recorded here rather than quietly deleted, because the next session is far more
likely to do this than to skip the file entirely — the file gets written, it looks complete, and the
falsifier was never actually tested. **The tell is that the RESULT reads as confidently as the
prediction.** Everything below this line was measured after this note was written.)*

---

### 1. The gate passes on the working tree — YES
`node scripts/qa/judge_coverage_check.mjs` → **PASS, 0 failures**, 11 assertions.

### 2. `npm test` passes — YES
**`PASS — 0 failure(s)`**, and `PASS suite ceiling: 120/120 gates`, run with the trial's own ten
browsers alive alongside it. *(CLAUDE.md §6 still says "19 gates" and `docs/GIT-AND-DEPLOY.md` §5
says "expect 20". Both are stale by a factor of six. Not this item's to fix — noted so the next
reader does not think a gate went missing.)*

### 3. The falsifier I most expected to be real — CLEARED, and it was the whole point
I did **not** hand-revert anything: `scripts/qa/red_proof_at_ref.mjs --ref=HEAD` materialises HEAD
in a scratch worktree, copies TODAY's gate in, and runs new-check-against-old-code. Its own header
warns that a gate importing a sibling from `scripts/lib/` gets the worktree's OLD sibling — **here
that sibling IS the subject**, so the tool is exactly right for this case rather than merely
adequate. Result:

> **`FAIL — 5 failure(s)` … RED PROOF HELD.**
> Red: *names the screen* · *carries the judge's own sentence* · *basename not full path* ·
> *a FAIL with no reason still names the screen* · *…and both are named*.
> Still green on old code: *a judged FAIL is still reported* · *two failed screens are ONE entry*.

**The gate guards the fix; it is not describing it.** And the two that stayed green are honest and
worth naming: they are **regression guards on behaviour that must not change**, not proof of the new
behaviour. A red proof that could not tell those two apart from the other five would be the weaker
instrument. *(I called all six "new assertions guarding it" in my ledger entry before knowing this.
Wrong, and corrected here rather than left to read as six-for-six.)*

### 4. Committing does not change what the live trial reads — CLEARED by construction
The revert happened in a temp worktree; the shared checkout was never written, `git worktree list`
shows one entry afterwards, and the trial went **6/10 → 7/10 legs** across this watch uninterrupted.

### AND MY OWN LOOK AT THE REAL DATA, because a claim in someone else's note is not a measurement
Ran the current `legVerdict` over the trial's real `report.json` (10 legs). **Ten screens now named
with the judge's own sentence**, across six legs — matching the previous session's count, measured
rather than repeated. They collapse to **five** distinct defects:

| the judge's finding | screens | already on the Chart? |
|---|---|---|
| captain rows 'Davy Scones'/'Dough Hook' clipped to 'Dav'/'Dou' by the recipe modal | 4 | **yes — `T-142`** |
| 'Play again!' overlaps and clips the award-card labels | 2 | **yes — `T-143`** — and `T-019` says the CAUSE is wrong (the cut is a scroller edge ~15px above the button) |
| pink captains panel bleeds under the End of Voyage modal, no dimming | 1 | **yes — `T-142` names `solo-tablet-029` as one of its own screens** |
| 'Arrgh!' bubble floats with no tail | 2 | **REFUTED — it is a BUTTON**, `panel.js:1156` |
| wind/forecast ribbon clipped before the right sidebar | 1 | **REFUTED — the pill reads complete with ~280px of clear board beside it** |

> ### ⛔ I FILED THE LAST TWO ROWS AS "NEW DEFECTS NOBODY HAS FILED". BOTH ARE DEAD, AND THE CHART SAYS SO IN BOLD.
>
> Caught by **CEO 170**. `CHART.md:458-471` (`T-019`, updated *the same day*, found by CEO 158)
> records that a human opened **all ten** FAIL verdicts of this exact run — `report.json` is 08:43
> EDT = **12:43 UTC**, the `1242Z` trial — and that **two were false positives and one had the wrong
> mechanism attached.** It also caught the judge **inventing award names** on `solo-phone-021`, the
> same hallucination `INTENDED-BEHAVIOUR.md:123` records it doing with wind direction.
>
> Its conclusion is in bold on the row and I walked straight past it:
> **"ITS ISSUE STRINGS ARE NOT QUOTABLE. A judged FAIL is a POINTER TO A SCREEN WORTH OPENING, never
> a description of what is wrong with it"** — *"and the session that filed those five as bugs is the
> proof."* **I was the next session to do it, one day later, on the item about that judge.**
>
> **So it is 4 of 5 already filed and the fifth is a false alarm — not "2 of 5 filed, 3 new".**
>
> **The ten-second read that would have prevented this:** one grep of `CHART.md` for my own five
> recovered sentences. CEO 170's words: *"The fault is the opposite of bulk reading — one read it
> did not do."*
>
> ### AND THE FINDING IMPROVED THE FIX, WHICH IS THE PART WORTH KEEPING
> If the judge's sentences are not quotable, then **`T-215`'s own fix creates a new hazard: printing
> them makes an unreliable narrator LOUDER.** The value the fix adds is the FILENAME — a screen
> worth opening, which a bare count could never give anyone. So the verdict line now ships the
> caveat in the OUTPUT:
>
> ```
> vision judge FAILED 3 of 29 screen(s) it looked at — OPEN THESE; the judge's words are its
> guess at why, and it is wrong often enough that they are not quotable (T-019)
>        · solo-tablet-002-settled.png — captain list rows 'Davy Scones' and 'Dough Hook' …
> ```
>
> **Because nobody reads a Chart row at the moment they are reading a verdict.** Guarded by a new
> assertion, *"the sentence is labelled a POINTER, not a diagnosis"*, which goes red at HEAD with
> the rest — the red proof is now **6 failures, not 5**.

### ⛔ THE EYE CHECK FAILED, AND THE FAILURE IS THE EVIDENCE
I went to open `solo-tablet-029-settled.png` — *"pink captains panel bleeds through beneath the End
of Voyage modal"*, the one the previous session confirmed by eye. **`report.json` is dated 08:43;
that PNG is dated 09:13. The picture is newer than its own verdict.** I opened it anyway: it is a
**mid-game tablet board on Day 10 with a call-the-winner prompt** — no End of Voyage modal, no
bleed, captains panel sitting cleanly below the board. **The verdict's picture had already been
destroyed by the trial running while I read it.**

That is not a contradiction of the previous session — it verified the picture that was there an hour
ago. **It is `T-215`'s unfixed second half happening live, on my watch, in the ordinary course of
trying to use the fix.** One shared directory, 261 appended runs, screenshots overwritten in place.
**So the sentence now reaches the report and the picture still does not**, and the honest claim for
this item is exactly that — not "five bugs found".

*(Incidental, and worth a line because it is the opposite of a bug report: that same overwritten
shot is a clean `T-013`/`T-211` case. Both "Call Flaky Jack" and "Call Crustbeard" name captains
whose ships are both plainly on screen — the orange and teal hulls inside the ring. One good sample,
not a rate; filed as an observation, not a finding.)*
