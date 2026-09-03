# PREDICTION — why does the trial print a count where it holds a sentence?

**Written 2026-09-03T13:10Z, before changing a line.** Tenth prediction of the session.

## THE FAULT (`T-215`)

`scripts/lib/leg_verdict.mjs:120`:

```js
const judgeFails = judged.filter(j => j.r.verdict === "FAIL");
if (judgeFails.length) v.push(`vision judge FAILED ${judgeFails.length} of ${judged.length} screen(s) it looked at`);
```

**It filters the objects and then prints only how many there are.** Each one already carries
`.shot` (the filename, `playtest_gate.mjs:505`) and `.r.issues` (the judge's own sentence,
`vision.mjs:144`). The report he opens gets the number; the sentence goes to a log shared across
261 runs, beside screenshots later runs overwrite.

**This is rule 19's live detector — the half that FINDS things — reporting a count.**

## WHAT I EXPECT

**Two lines.** After the count, list each failed screen by name with its issue. The data is in
hand; nothing needs to be computed, fetched or stored.

I expect this to surface real bugs immediately, because the sentences I recovered from the shared
log already corroborate two independently-filed rows — `T-142` (captains panel clipped by a modal)
and `T-143` (phone awards behind *Play again!*). **A detector whose findings match rows filed by a
human looking at the game is a detector that is right and unread.**

## WHAT WOULD PROVE ME WRONG

1. **If the verdict line is length-constrained by a consumer.** Something renders these into the
   report and possibly into his Glass. If a verdict is expected to be ONE line, appending N lines
   could break the report's shape or flood his page. **Find every consumer of `v` before adding
   lines** — this is the third time this session that adding output broke a sibling.
2. **If `issues` is not a sentence.** `vision.mjs:196` shows an ERROR path that stores `raw` instead;
   an unparseable judge reply might put 200 characters of JSON into `issues`. **Look at a real
   value before formatting it**, and truncate.
3. **If the shot path is absolute and enormous.** `it.shot` comes from `${OUT}/${name}.png`. If
   `OUT` is an absolute repo path, every line carries 60 useless characters. Print the basename.

## THE TRAP

**The honest fix is two lines, and the tempting one is a rewrite.** The overwritten-screenshot half
of `T-215` — one directory reused by 261 runs — is a bigger change (per-run subdirectories, and
every consumer of that path), and it is NOT what makes the finding unreadable. **The sentence is
the thing he can act on; the picture is a bonus.** Do the two lines, measure them against the real
report, and file the directory half separately rather than bundling a large refactor into a small
win.

**Second trap, tonight's:** I will be tempted to say "this surfaces N real bugs". **I have not
verified any of them by eye** — the one screenshot I opened did not match its verdict. The claim I
am allowed to make is *"the judge's own sentences now reach the report"*, not *"N bugs found"*.

---

## THE RESULT

**Falsifier 2 — CLEARED.** `issues` is an array of clean sentences on the real data. Truncated at
200 anyway, because `vision.mjs:196` can put raw text there when a reply will not parse.

**Falsifier 3 — CLEARED and acted on.** `shot` is `${OUT}/…`; the basename is printed.

**Falsifier 1 — CLEARED, and better than expected.** The report copies the gate's output block
verbatim, and `playtest_gate.mjs:656` renders each verdict entry as one `✗` line. So a MULTI-LINE
single entry reaches his report with no change to the report writer at all — and `r.verdict.length`,
which `:653` reads as pass/fail, is untouched. **One entry, not one per screen**, deliberately: a
count that moved when the judge found a second issue would replace an old lie with a new one.

### WHAT IT SURFACED, run through the real `report.json`

Ten screens across six legs, each now named with the judge's own sentence — the exact ten `T-136`
said nobody had opened. They collapse to **five** distinct defects, and two match rows a human filed
independently (`T-142` captains panel clipped by a modal; `T-143` phone awards behind *Play again!*).

### AND I VERIFIED ONE BY EYE, WHICH THE PREDICTION FORBADE ME FROM SKIPPING

`solo-tablet-029-settled.png` — *"pink captains panel from the screen behind bleeds through beneath
the End of Voyage modal, with no dimming overlay"*. **I opened it. It is exactly that**: a panel
with a pink rounded border showing past both edges of the card, greyed captain names and coin icons
visible inside it, and the board art and pirate flag at full brightness around the modal. **The
judge was right and unread.**

**The second trap held.** I am claiming *"the judge's own sentences now reach the report"* and
*"one of ten confirmed by eye"* — **not** *"ten bugs found"*. The screenshots still do not reliably
correspond to their verdicts (one was two days older than its own line, another newer than the
report), which is the other half of `T-215` and is filed rather than bundled in — **the trap said
do the two lines and file the directory half separately, and that is what happened.**

**5 of 5 mutants killed**, each at its own named assertion: bare count, dropped sentence, dropped
filename, full path instead of basename, and one-entry-per-screen. *(A sixth attempt reported four
PATTERN NOT FOUND — my own escaping, not evidence, re-run line-based. That is the seventh instrument
fault of the session and the pattern is now thoroughly earned.)*
