# PREDICTION — `T-079`, the "waiting on your answer" signal

*Written 2026-09-02T12:30Z, BEFORE the check exists and before a line of the fix is written.
Committed on its own so the order is checkable by anyone (CEO 103 finding 4). The whole value of a
prediction is that it cannot be retrofitted.*

## What I expect to find, and why

`scripts/wyclau/chartkeeper.mjs:525`

```js
const livePointer = /BLOCKED ON WYATT/i.test(row.raw) && !reapByKey.has(row.key);
```

**This is a prose-grep for a section HEADING inside a row's own body.** Any row whose text contains
the five words "BLOCKED ON WYATT" — for any reason, including describing the section, quoting it, or
specifying a tool that writes to it — is scored −1000 and sinks to the bottom of his list, unless
REAP happens to have flagged it stale.

`deadPointerToWyatt` (the REAP probe, line 267) is the only thing holding it off, and it stops
flagging a row as soon as **any** question in the table shares three tokens with it. Over a
900-character row, three shared tokens is close to certain. So the two gates compose into: *a long
row that says these five words is blocked on Wyatt the moment his table is not empty.*

**I predict exactly four open rows currently carry the −1000, and that at least three of them are
waiting on nothing of his:**

1. `T-001` — his four-times-asked Chartkeeper request. Its only mention of the section is the
   sentence specifying the SETTLE pass: *"one question into BLOCKED ON WYATT with the measurement
   attached."* That is a description of what the tool WRITES, not a citation of a question.
2. `T-079` — **this very row**, which contains the phrase only in its own repair instruction:
   *"red-proof it by adding an unrelated BLOCKED ON WYATT row."*
3. `T-077` — a one-sentence wording fix, which contains the phrase because it is *about* the
   section's rendering.

**If that holds, the row describing the defect is sunk by the defect, and so is the row asking for
the tool that was built to stop rows sinking.**

## What would prove me WRONG — named before the measurement, not after

- If each sunk row turns out to match a live question a reader would call *"about this row"*, the
  signal is sound and the fault is somewhere else (the `+40`, or the tie-break). My mechanism is
  wrong.
- If deleting the five words from `T-001`'s body does **not** lift it out of the −1000 band, the
  phrase is not the cause and I have the wrong line.
- If the count of sunk rows is not four, my reading of the composition of the two gates is wrong.

## What happened immediately BEFORE — rule 27, asked of the sequence

`T-001` ranked **first, at 156** and then left the top nine with no edit to its own text. The thing
that changed was somebody else's commit adding two good, unrelated questions to a table that had
been empty. **An empty table was masking the signal**: with nothing to match, REAP flagged every
mentioning row stale, `livePointer` was false everywhere, and the −1000 never fired. So the branch
that fires it is the one that had never run against a populated table.

## What I intend to build, stated now so the CEO can judge scope drift

Make the signal **row-level and explicit**: a row is waiting on his answer when a question in the
table **names that row's `T-nnn` handle** — a link neither a chance token overlap nor the row's own
prose can manufacture. Where a row mentions the section with no such link, it is **named in the
report** ("this row talks about a question of yours but does not say which one") and is **not**
sunk; likewise a question attached to no row is named. Failing toward *"show him his approved
work"* is deliberate: an unblocked row that turns out to need him costs a watch minutes, while a
sunk row costs him his own priority order, which is the complaint that started this.

**No game code.** `scripts/wyclau/chartkeeper.mjs` and its gate.
