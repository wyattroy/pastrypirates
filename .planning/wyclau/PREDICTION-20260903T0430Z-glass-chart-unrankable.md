# PREDICTION — why the Chartkeeper reports "0 open rows" on a file holding 27

**Written 2026-09-03T04:30Z, BEFORE any measurement or fix.** Filed because CEO 140 landed this
exact criticism on `T-097` twenty minutes ago and it was correct:

> *"No prediction file was written… the standing rule is that the prediction is written down before
> the result exists precisely so it cannot be retrofitted, and a claim inside the fix it justifies is
> retrofitted by construction."*

## THE OBSERVATION

```
node scripts/wyclau/chartkeeper.mjs --chart=.planning/GLASS-CHART.md --log=.planning/CHART-LOG.md --rank
  -> "0 open rows + 0 unfated ideas = 0 tasks on his phone"
  -> "RANK the open list, next-to-be-completed first:" followed by NOTHING
```

`grep -c '^- \[ \]' .planning/GLASS-CHART.md` → **27**. So the tool reads the file, finds the two
duplicate INBOX stamps in it, prints a correct-looking report — and sees none of the rows.

## WHAT I EXPECT, AND WHY

**The Chartkeeper does not parse rows from the whole file. It parses them from named SECTIONS** —
`## STEP 1 CHECKLIST` and `## THE IDEA INBOX` — and `GLASS-CHART.md` has neither. Its only heading is
`## THE DIVISION, IN ONE LINE`, and its rows sit loose under a `---` rule. So `stepChunks` and
`inboxChunks` both come back empty and every count downstream is honestly zero.

**Why I think this and not something else:** `applySettle` iterates exactly
`[["checklist", "STEP 1 CHECKLIST"], ["inbox", "THE IDEA INBOX"]]` and `continue`s when
`chunks.length` is 0 — the shape is section-first, not row-first. The `--chart=` flag was added so
the tool could be *pointed* at another file; nobody checked that the other file had the sections the
parser needs. **The flag works and the parse finds nothing** — which is why this looks like a working
tool rather than a broken one.

## WHAT WOULD PROVE ME WRONG

- If the rows are missed for a reason **other than the missing section heading** — e.g. the `---`
  rule, the row indentation, the `⟨handle⟩` continuation lines, or a file-size/parse cap. **Test:**
  add ONLY the `## STEP 1 CHECKLIST` heading above the rows and re-run. If the count is still 0, my
  reasoning is wrong and I must not paper over it by "fixing" something else that happens to help.
- If the count comes back as something **other than 27** — that would mean the parser has a second
  disagreement with the file (rows it skips, or rows it invents), and the heading is only half the
  story.
- If adding the heading changes any OTHER gate's reading of this file — `no_ambiguous_handle_check`
  and `chart_model_agrees_with_glass_check` both read it today and both pass. If either goes red,
  the heading is not a free change and the fix is bigger than one line.

## WHY THIS MATTERS MORE THAN ONE TOOL

**The Door's step 2 is "RANK THE CHART, THEN TAKE ROW ONE."** For all 27 rows of the list he told me
to work, that instruction has been doing nothing at all — silently, while printing a clean report.
It is the same shape as `close_item.mjs` before tonight's `--chart=` fix, and as the false STOP in
`can_push.mjs`: **a tool that answers confidently about a file it cannot actually see.**

CEO 134 already listed it — *"ranker/sweeper reads CHART.md (has --chart=) → 44 rows never ranked,
never swept"* — and it was read as a missing flag. **The flag exists. The parse is the fault.**
