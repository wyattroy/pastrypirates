# SPEC — HOW A ROW GETS TICKED

*Design only. Nothing built. Written by the Advisor 2026-09-02, 10:15 PM ET, at his instruction:
**"Clean the chart"** and **"design a mechanism to tick rows"**.*

---

## 1. THE FAULT, MEASURED TONIGHT

**60 open rows. Zero ticked. Sweep archives nothing** — a dry run reports *"0 finished row(s) on the
Chart, nothing to archive"*, and it is correct: **sweep moves rows already ticked, and nothing ticks
them.**

**Ticking happens in exactly ONE place: `close_item.mjs`.** It demands a CEO verdict traceable to
the item, a game-code diff or a stated reason, and solution-first evidence. That bar is right for a
real work item and **it means anything finished any other way never ticks, and therefore never
leaves his page.**

⚠ **AND I COULD NOT CLEAN THE CHART BY INFERENCE TONIGHT — WHICH IS THE PROOF THAT THIS IS THE RIGHT
FIX.** Two honest attempts, both refused:
- *"Rows whose cited INBOX entry is DONE"* → **0 of 60.** The rows do not cite inbox stamps.
- *"Rows with a CEO verdict naming their handle"* → **11 rows, and unusable.** Several of those
  verdicts are PARTIAL judgements on live work; closing on them would be exactly the unmeasured
  claim this project keeps paying for.

**There is no way to ask a row whether it is finished, because no row says what finished means.**

## 2. THE MECHANISM: EVERY ROW STATES THE CONDITION THAT ENDS IT

**One line per row:**

```
done-when: node scripts/qa/glass_never_force_check.mjs
```

`chartkeeper.mjs --tick` runs each row's condition, **ticks the rows whose condition exits 0**, and
leaves the rest. `--sweep` then archives the ticked ones to `CHART-LOG.md`. **Both halves already
exist and are already wired into the watch's pass and the tick — this adds the missing middle.**

**WHY A COMMAND AND NOT A CHECKBOX:** today *"is this done?"* is a judgement, and a judgement needs a
session to make it and a human to trust it. **A command makes it a measurement.** The row's own claim
becomes falsifiable, which is this project's entire method applied to its own list.

## 3. THREE KINDS OF ROW, THREE KINDS OF CONDITION — matching his 3:33 PM ruling

| kind | `done-when:` | who closes it |
|---|---|---|
| **Buildable** — a defect, a gate, a feature | the gate that proves it: `node scripts/qa/<gate>.mjs` | nobody. **It ticks itself the moment the gate goes green.** |
| **Measured** — evidence went stale, a pointer died | the reap already computes this: `reap:answered`, `reap:dead-pointer` | the tick pass, from the reap's own verdict |
| **His say-so** — taste, a merge, "is this enough" | `HIS SAY-SO` | **never automatic.** It goes to Your Call; his tap QUEUES a close and a watch performs it — *his ruling, 3:33 PM, chosen against the recommendation.* |

**The third row is why this design does not simply auto-close everything.** He already decided that
his approval marks a row rather than closing it, and this mechanism must not quietly overturn that.

## 4. ⚠ THE WAYS THIS GOES WRONG, AND WHAT STOPS EACH

**(a) A `done-when:` THAT CANNOT FAIL TICKS A ROW THAT IS NOT DONE.** This is the oldest trap in the
project — five instruments lied on one night in August, and today a field named `artifactVersion`
held a clock. **Mitigation, and it is already the house rule:** the four steps require the gate to
have been RED before the fix. A `done-when:` naming a gate that never failed is a `done-when:` that
proves nothing. **The tick pass should refuse a condition whose gate has no red-proof case.**

**(b) ARBITRARY SHELL OUT OF A MARKDOWN FILE IS A REAL HAZARD.** `CHART.md` is edited by three
sessions and by a tool. **Only `node scripts/...` invocations are permitted** — the exact shape
`doc_command_check.js` already validates across every doc. Anything else is refused, loudly.

**(c) A WRONG TICK MUST BE REVERSIBLE AND VISIBLE.** Every tick records **the command and its
output** into `CHART-LOG.md` beside the archived row. A row that vanished wrongly can be found by
its handle and restored — handles are never reused, so `T-105` still resolves in the log and in git.

**(d) THE SILENT GAP: A ROW WITH NO CONDITION IS NEVER TICKED.** That is correct — and it must not be
invisible. **The count of rows lacking `done-when:` goes on his page**, so the coverage is a number
he can see rather than a silence he has to notice.

## 5. MIGRATION — DO NOT BACKFILL SIXTY ROWS

1. **New rows require `done-when:`** — a gate fails the build on a row written without one.
2. **Existing rows get one when next touched**, by whoever touches them.
3. **The coverage number is reported every pass** and appears on his page: *"41 of 60 rows can say
   when they are finished."*

**Backfilling all sixty in one sitting would mean sixty conditions written by a session guessing at
work it did not do** — which is how the Chart filled with unverifiable claims in the first place.

## 6. WHAT WOULD PROVE THIS DESIGN WRONG

1. **If most rows turn out to have no expressible condition** — if the honest `done-when:` for the
   majority is `HIS SAY-SO` — then this is not a ticking mechanism, it is a queue to him, and it
   should be built as `T-106`'s Your Call pile instead. **Count it on the first twenty rows before
   building the runner.**
2. **If running conditions is slow** (sixty gates on every watch pass), the tick must run only on
   rows whose files changed since the last pass, and that is a different design.
3. **If a ticked row turns out to have been unfinished even once**, stop and re-read (a): the
   condition was unfalsifiable and the whole mechanism inherits that.

## 7. WHAT WAS ACTUALLY CLEANED TONIGHT, WITHOUT THIS MECHANISM

**Nothing was closed on a guess.** What was fixed is the thing that made the Chart unreliable to
address at all: **four handles were each carried by two or three different open rows** — `T-008`,
`T-079` (×3), `T-088`, `T-105`. Per `chartkeeper.mjs:860` an ambiguous handle **claims nothing**, so
a ruling naming it spoke for neither row, the ranker could not score it, and **his dragged order
named `T-079` three times and could not say which row he had moved.** Each later row was renumbered
(`T-124`–`T-128`) with the reason written into it; the first keeps the handle; handles are never
reused, so every old reference still resolves in `CHART-LOG.md` and in git.
