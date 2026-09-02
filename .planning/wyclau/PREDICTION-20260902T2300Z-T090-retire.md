# PREDICTION — `T-090` / `INBOX-20260902T1830Z`: an answered question leaves his page in the same act that records the answer

*Written 2026-09-02T23:00Z (7:00 PM ET), **before a single character was changed**, by the watch that
claimed it. Rule 6's working form: the whole value is that it cannot be retrofitted.*

## The item, in one line

His words, 6:57 PM ET: *"the page continues to re-show me thw e questions AFTER they're harvested.
this is NOT fixed and it is a PRIORITY more than any of the SEO work."* Sixth instance in twelve
hours. The plan is [`SPEC-ANSWERED-QUESTIONS-RETIRE.md`](../SPEC-ANSWERED-QUESTIONS-RETIRE.md),
CEO 123 = YES.

## What I expect, and why

**1. The gate (Part 3) will go RED on the real pre-repair file with no fixture invented for it.**
`.planning/wyclau/LAST-HARVEST` on this machine right now carries five `rulingKeys`, and commit
`6e54ff54` removed exactly five rows from `## BLOCKED ON WYATT` by hand ninety minutes ago. I expect
the five ids computed from `cb7cfc89`'s Chart to equal those five keys **character for character**,
so the gate fails 5/5 on the pre-repair file and passes on the file in the tree. **If they do not
match, the join in §2 of the spec is not as reliable as the spec claims and Part 1 stops being
"first" and becomes "mandatory before anything else exists".**

**2. Part 1 (a stable explicit id) is a FOURTH COLUMN, not a rewrite.** `glass.mjs:429` destructures
`([q, rec, since])` from the split cells, so a fourth cell is already ignored by the renderer, and
the section's own fence (`glass_calm_check.mjs` case 10) requires a line to start with `|` and says
nothing about how many cells it has. **If the calm gate or the Glass card turns out to count
columns, I am wrong and this is a bigger change than the row says.**

**3. And the moment to change the id scheme is NOW, for a reason nobody has written down: `##
BLOCKED ON WYATT` is EMPTY.** Ids live only in the published page, so changing the scheme while a
question is in flight orphans any ruling he makes against the old page. With zero rows there is
nothing to orphan. **I expect this to be the only free window today, and if I am right it should be
said out loud rather than discovered later.**

**4. Part 2 (retirement as ONE act) will NOT need the harvest rewritten.** I expect a single script
that takes the harvested rulings and, in one run, writes the `RULED` row and deletes the matching
`BLOCKED ON WYATT` row — the same shape as `close_item.mjs`, which ticks the row and writes the
ledger together so they cannot disagree. **If the two writes cannot be made from one process because
the verdict text only exists in a session's head, then Part 2 as specified is not buildable and the
honest answer is the gate plus a runbook, said plainly rather than dressed up.**

## What would prove me wrong

- **If any of the five pre-repair rows slugs to something LAST-HARVEST does not contain**, the join
  is unreliable, and the gate must not ship on it. Check all five, not one.
- **If the gate cannot be made to fail on the pre-repair file**, it is not a gate (spec §5.3).
  Build it red or not at all.
- **If a fourth column breaks the rendered card**, drop the column idea and use the fallback in
  spec §3 (hash the whole question), and label it second-best rather than shipping it as the fix.
- **If `rulings: {}` at `glass.mjs:800` means the trigger cannot be "keys in glassState.rulings"** —
  already found by CEO 123 — then anything I build that reads live state instead of the harvest
  receipt is wrong by construction. The trigger is **what the harvest READ**, i.e. `LAST-HARVEST`.

## The acceptance test, and the part I cannot run

**Part 4 of the spec is the symptom test: answer a question on the live page, let the harvest run,
and assert the question is gone from his page with NO human editing `CHART.md`.** A Bell-launched
watch on this machine has `SendMessage`, `Agent` and `ListAgents` and **no `Artifact` tool**
(measured, `INBOX-20260902T0400Z`), so it cannot read or publish his page and **cannot run that
test**. I expect to finish this watch with Parts 1–3 proven and Part 4 named as not-run, rather than
with a claim that the symptom is gone. **Saying so is the deliverable; a watch that reports the
symptom fixed without having seen his page would be the seventh instance of this exact fault.**

---

# THE OUTCOME

*⚠ **THIS SECTION IS DELIBERATELY EMPTY UNTIL THE WORK IS DONE**, and it was briefly not — the first
draft of this file arrived with its own outcome already written, which is the "sentence tidier than
the record" fault four consecutive CEO verdicts have named on this branch. A prediction whose answer
is composed alongside the question proves nothing. **The watch fills this in after measuring, wrong
parts first.***
