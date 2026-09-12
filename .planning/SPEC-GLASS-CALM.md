# SPEC — THE GLASS IS CHAOTIC AGAIN: three fixes

*Design only, written by the Advisor 2026-09-02. **His words: "the glass looks chaotic again."***
*He asked for a plan, a CEO review, and a row at the top of the Chart.*

> ## 🛑 CEO 112 REJECTED TWO OF THESE THREE AS FIRST WRITTEN. BOTH REJECTIONS WERE RE-MEASURED AND BOTH HOLD.
>
> **1 · The first draft proposed looking the title up in the Chart by its handle. That would have
> printed the WRONG WORK.** `⟨T-088⟩` sits on **two different rows** — `.planning/CHART.md:60`
> ("FIX THE GLASS — his five asks") and `:196` ("A THIRD OF THE ART LIBRARY HAS NO MEASURED
> GAMEPLAY MAXIMUM"). A lookup picks one, and the page tells him confidently that we are resizing
> artwork while we are fixing his page. **And the lookup was never needed: the words are already in
> the marker.** `.planning/wyclau/IN-HAND` right now holds
> `"item": "T-088 — fix the Glass: his five asks"`, and `claim_item.mjs` has always demanded it
> (it refuses a blank `--item`). **What is left is the page printing the code number in front of
> the words.**
>
> **2 · The first draft's cure for the red warning DOES NOT CURE IT.** It proposed sounding the
> alarm only when the unreadable text *"contains a `?` or a bold lead."* Run against the real
> section: **three of the five prose blocks contain a question mark**, because they are notes that
> quote his already-answered questions verbatim — *"May an unattended watch READ the claude-kit
> folder?"*, *"Do you want `SCHEDULED` to stop hiding your ideas?"*, *"May a watch publish to
> staging on its own?"* **The red warning would still be on his page after the work was reported
> done.** (And the count was wrong too: **five** prose blocks, not three.)

**What is already right and must not be touched:** `In hand:` shipped between his last two
screenshots and the mechanism works — CEO 112 checked that before proposing anything, because the
previous verdict's fault was planning to rebuild something that already ships. All three items
below are about **what the page SAYS**.

---

## 1 · `In hand` SHOWS A HANDLE AND A TIMESTAMP. HE WANTS THE WORK.

**Now:** `In hand: T-088 · claimed 2026-09-02T16:49Z`
**His words:** *"i don't know or care about the 'T-088 · claimed 2026-09-02T16:49Z' -- i want to
know the content of it."*

**He is right twice over.** `T-088` is a filing handle — it exists so machines can point at a row
without matching prose, and he has never needed to type one. And a raw ISO timestamp is the one
format on this page he must do arithmetic on; **every other time on the page is already relative.**

**WHAT IT SHOULD READ:**
```
In hand: fixing the Glass — his five asks · started 20 min ago
```

### BUILD IT BY SPLITTING THE FIELD, NOT BY LOOKING ANYTHING UP

`claim_item.mjs` takes **`--handle=T-088` and `--item="fix the Glass: his five asks"` as two
fields**, writes both into `.planning/wyclau/IN-HAND`, and the page prints the words while keeping
the handle in a `data-handle` attribute. **No Chart read, no ambiguity between two rows, no
truncation rule needed.**

**It costs nothing downstream:** `publish_status.mjs:65-68` copies the marker's JSON *verbatim*
into the status block, so a new field arrives on his page with that file unchanged.

**BE KIND TO THE MARKERS ALREADY ON DISK.** Every claim written before this change has only
`item`. The reader takes, in order: `handle`+`item` if both are there → otherwise strip a leading
`T-nnn — ` off `item` → otherwise print `item` whole. **A marker written this morning must never
render as blank**, which is this file's standing rule.

### THE TIME MUST BE RENDERED BY `tick()`, NOT BAKED IN — and the comment above it is wrong

`glass.mjs:543-544` says, in capitals: *"AND THE TIME IS ABSOLUTE, NEVER 'N MINUTES AGO'"*, because
*"a relative age computed at publish and then frozen on a static page is precisely the fault of his
ask 2."*

**The reason is false and the trap is real, and both halves matter.** `tick()` runs every 30
seconds in his browser (`glass.mjs:999`) and already renders two live relative clocks — so a
relative age is not frozen *if it is computed there*. It IS frozen if it is computed in Node, which
is where `inHandHtml` is built today (`:570-577`). **So: put `claimedAt` and `staleAfterMinutes`
into `glassState` and let `tick()` write the line.** Whoever builds this **must correct that
comment in the same change** — otherwise the next reader meets a shouting instruction that talks
them out of the right fix.

**⚠ AND THE COLD STATE MOVES WITH IT.** `cold` is decided in Node today (`:575`), so a page open on
his phone keeps saying *"in hand"* long after the claim went stale. Once `tick()` owns the clock it
owns the verdict: **compare in the browser, and every doubt still resolves to COLD.** This falls out
of the same change and closes the same fault the published line's own comment names — *a frozen
judgement printed on a live page.*

## 2 · TWO LINES OF STATUS, ONE OF THEM APOLOGISING. MAKE IT ONE BAR.

**APPROVED AS WRITTEN by CEO 112**, which verified the two clocks are real, live and separate
(`glass.mjs:969-999`).

**Now**, on separate lines: `🟢 last progress 3 min ago` … `page published moments ago — it cannot
see anything newer than that`
**His words, with his own wording for it:** *"should be up next to '🟢 last progress 6 min ago' as
one status bar with fewer words: '🟢 Progress: 6 min ago. 🟢 Updated: 4 min ago.'"*

**Adopt his wording exactly.** One line, two clocks, two dots:
```
🟢 Progress: 6 min ago   🟢 Updated: 4 min ago
```
**KEEP BOTH CLOCKS — they are load-bearing and were his own 2026-08-31 ask.** *Progress* answers
"is work landing"; *Updated* answers "how old is this page". They legitimately disagree, and that
disagreement is the whole signal.

**DELETE the apology** — the `BLIND` string at `glass.mjs:967`. *"It cannot see anything newer than
that"* is a caveat that earns its place once, in the file's comments, not on his status bar forever.
**The Updated clock says the same thing in two words.**

**⚠ Each dot must colour independently** — a fresh page reporting stale progress is exactly the
state he is complaining about, and there is only **one** emoji on the page today (`:842`; the
published line at `:846` has no dot at all). **Both dots use the 45-minute rule the first dot
already uses** (`:996`, `Math.floor(ms/60000) > 45`) — same rule, both dots, **no new constant
invented.**

## 3 · THE RED "COULD NOT READ" WARNING — MEASURED, AND IT IS A FALSE ALARM I CAUSED

**Now:** *"…and there is more in that section this page could not read — content that is not a table
row. Open .planning/CHART.md."*

**MEASURED CAUSE.** `## BLOCKED ON WYATT` (`.planning/CHART.md:956-1010`) contains **five prose
blocks, 45 non-table lines, and no hidden question:**
1. **A warning paragraph I wrote** saying *"THIS SECTION IS TABLE ROWS OR NOTHING… a question written
   here as prose is invisible."* **The prose forbidding prose is the prose being flagged.**
2. **Four blocks of historical bookkeeping** — notes that earlier questions were ruled and moved.
   Three of them quote his questions verbatim, question marks and all.

**So the detector is RIGHT that unparseable content exists, and WRONG to imply he is missing a
question.** It cannot tell *"a question hidden as prose"* from *"a note about the section"*, so it
raises an alarm about my own housekeeping — in red, above his real decision.

### THE FIX: FENCE THE WRITER, NOT THE READER

**The first draft tried to make the reader cleverer, and CEO 112 measured that it fails** (see the
banner). **The fix this project already designed is the other direction** —
`SPEC-VISIBILITY-AND-INJECTION.md:101-103`: *"A gate fails the build when the section contains prose
ending in `?`, **or any paragraph that is not the section's own header note**."* The first draft
quietly kept the question-mark half and dropped the half that works.

- **(a) EMPTY THE SECTION OF PROSE.** The four historical notes are backward-looking and belong in
  `CHART-LOG.md`, under his own ruling that the Chart shows only where we are going. **My warning
  paragraph becomes an HTML comment** — `<!-- … -->` — so it stays where writers meet it and is
  invisible to him.
- **(b) A WRITER-SIDE GATE, so it can never come back.** `npm test` fails when that section holds
  any line that is not a table row, a blank, or an HTML comment. **That is a structural line, not a
  guess about wording** — which is the whole difference between this and the rejected predicate.
- **(c) THE READER STAYS BROAD AND DUMB, AND THAT IS THE POINT.** `glass.mjs:384-389` keeps flagging
  *anything* it cannot parse; it must also **strip HTML comments before the check**, or (a) trips it.
  With the gate in place there is simply never anything for it to find. ⚠ **Do NOT delete the
  detector:** it exists because Your Call truthfully read `(0)` while a real question sat in prose,
  and he caught that in a screenshot.

**WHY A GATE IS WARRANTED HERE and is not tooling-for-its-own-sake (rule 7):** the proof is on disk.
**Five prose blocks are sitting in that section right now, on a tree where `npm test` is green.**
Nothing in the build can see them; the only thing that notices is the renderer, at read time, on his
page, in red. That is the exact shape of *"a parser that silently discards input is an instrument
that cannot fail"* — and the reason he saw the miscount in the first place.

---

## WHAT THIS DELIBERATELY DOES NOT DO
- **No new clock, no new timer, no extra publishing.** Every time above already exists on the page.
- **No new constant** — the second dot reuses the 45-minute rule; COLD reuses the marker's own
  `staleAfterMinutes`.
- **No removal of the handle**, only of its prominence — machines still need it.
- **No weakening of the unparseable warning** into silence, which is the failure it was built for.
- **No Chart lookup**, for the reason in the banner.

## SIZING
**Three small changes, all in `glass.mjs` except one field in `claim_item.mjs` and one new gate.**
1 is a split field plus moving one line's rendering into `tick()` — and **correcting the wrong
comment above it**, without which the next reader is talked out of the fix. 2 is markup and two
independent dot classes. 3 is deleting four paragraphs, commenting out a fifth, one `strip` in the
reader, and a gate that keeps the section clean.
**The one that must not be got wrong is 3** — a warning that cries wolf gets ignored, and this one
is printed in red above his decisions.

## AND ONE THING WAITING, NOT PART OF THIS
**He ruled on the black-window question at 17:06Z — "Keep it."** That ruling is on the page and needs
harvesting; it is not a Glass fault, but it should not sit unread while these three are built.
**And CEO 112 found a second one:** his recipe-picture follow-up — *"what is the maximum size they
are displayed at?"* — sits in the RULED card with an empty `now` cell (`.planning/CHART.md:1044`)
while `.planning/ASSET-DISPLAY-SIZES.md` appears to answer it. **He asked, we answered it in a file,
and his page still shows it unanswered.** Same shape as CEO 110's finding 1.
