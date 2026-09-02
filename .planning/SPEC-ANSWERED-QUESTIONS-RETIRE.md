# SPEC — AN ANSWERED QUESTION LEAVES HIS PAGE, IN THE SAME ACT THAT RECORDS THE ANSWER

*Design only. Nothing here is built. Written by the Advisor 2026-09-02, 6:30 PM ET, at his direct
instruction. **Sent to a fresh CEO before it reached him; its verdict is appended to
`.planning/CEO-REVIEWS.md` and this line will name the number once it exists — it does not yet.***

> **HIS INSTRUCTION, VERBATIM:** *"get the ceo to verify your fix plan, then add it to the TOP of the
> fix list."* and, clarifying: *"by fix list I mean Task List/ Chart"*.
>
> **WHAT PROMPTED IT, VERBATIM:** *"I already answered both of these about 15 minutes ago. Please
> tell me why the page still shows them, and is still asking me to answer them again"* /
> *"I wrote the answers into the boxes, got a successful \"waiting\" message below, and left them."*

---

## 1. THE INVARIANT

**A question and its answer are ONE OBJECT. Recording the answer and retiring the question are the
same act, or they drift.** Today they are two acts joined by a session remembering, and that is the
shape `.claude/CLAUDE.md` rule 23 forbids by name: *two things kept in step by discipline are two
things that will drift.*

**Five drifts in twelve hours is the evidence.** 1:06 PM, and four more, ending with the two he
photographed at 6:25 PM after answering them forty minutes earlier.

## 2. WHAT IS ALREADY TRUE, MEASURED — the plan needs no new schema to start

**The join exists and it is deterministic.** `glass.mjs:430` gives every question an id:

```js
id: q.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40).replace(/^-|-$/g, "")
```

and `glassState.rulings` is keyed by exactly that id. **Verified, not assumed** — slugging the two
raw `## BLOCKED ON WYATT` rows he answered reproduces the two keys his answers were stored under,
character for character:

| computed from the row | key his answer was stored under |
|---|---|
| `t-105-your-top-priority-item-is-half-bu` | `t-105-your-top-priority-item-is-half-bu` |
| `t-105-a-one-minute-test-settles-whether` | `t-105-a-one-minute-test-settles-whether` |

**So retirement can be automatic today.** Nothing needs inventing first.

## 3. ⚠ AND THE JOIN CARRIES A SILENT-CORRUPTION HAZARD THAT MUST BE FIXED **BEFORE** ANYTHING AUTOMATES ON IT

**PROVEN, not theorised.** Two genuinely different questions on the same item:

```
⟨`T-105`⟩ Should the harvest retire the row immediately, or flag it for a watch?
⟨`T-105`⟩ Should the harvest retire the row only after a CEO has seen it?
     both →  t-105-should-the-harvest-retire-the-row      ← IDENTICAL
```

**Consequence, and it is worse than the bug being fixed: his answer to one question would retire the
other, and the record would show him answering a question he never saw.** A duplicate question is an
annoyance; a mis-attributed ruling is a corrupted decision.

**Three properties make this likely rather than exotic:**
1. **Truncation at 40 characters**, so only the opening of a question distinguishes it.
2. **The `⟨T-105⟩` handle eats the first 5**, and questions carrying the same handle are exactly the
   ones most likely to be asked together — **as his two were today.**
3. **House style front-loads the shared framing** (*"Should the harvest…"*, *"Do you want to…"*).

## 4. THE PLAN — four parts, in this order, and the order is load-bearing

### PART 1 — HARDEN THE JOIN FIRST *(nothing else may ship before this)*
Give each question a **stable, explicit id written into the row**, the way Chart rows already carry
`⟨T-105⟩` handles — not derived from its own prose. Then:
- editing a question's wording cannot orphan his existing ruling (today it silently does), and
- two questions cannot collide however similar their openings.

**Fall-back if a stable id is too big a change:** hash the WHOLE question rather than truncating it.
That kills the collision but keeps the edit-orphan fault, so it is second-best and should be labelled
as such rather than shipped as the fix.

### PART 2 — RETIREMENT BECOMES ONE ACT
One script, run by the harvest, that for every key in `glassState.rulings`:
1. writes the verdict into `RULED` with the `now` cell filled,
2. **deletes the row in `## BLOCKED ON WYATT` that produced it**, and
3. does both in a single commit.

**Not a session following a runbook step. A session that forgets step 2 is what produced all five
instances**, including one on a day when the runbook said to do it.

### PART 3 — THE GATE THAT WOULD HAVE GONE RED FIVE TIMES TODAY
`answered_question_retired_check.mjs`: **fail the build if any row in `## BLOCKED ON WYATT` slugs to
a key that already has a ruling** — in `LAST-HARVEST`'s `rulingKeys`, in `RULED`, or in
`DECISIONS.md`. **Red-proof it against today's file before the hand-repair**, where it must fail on
both of his questions. This is the part that catches the *recurrence*, and the whole reason it is
worth more than the fix.

### PART 4 — CLOSE ON THE SYMPTOM, NOT ON THE WORK
**`T-090` was named *"an answered question never leaves `BLOCKED ON WYATT`"* and closed through the
gate at 4:31 PM having built the reap-label split instead. Both halves of that are true and the
second was good work — but the fault it was named for shipped unfixed, and the row closed anyway.**
`close_item.mjs` cannot see this: it requires a CEO verdict, a diff and solution-first evidence, and
**all three existed.**

**So this item's acceptance test IS the symptom, and it must be run, not reasoned about:** answer a
question on the live page, let the harvest run, and **assert the question is gone from his page with
no human editing `CHART.md`.** If a human touched the Chart, the test did not pass.

## 5. WHAT WOULD PROVE THIS PLAN WRONG

Written before building, so it cannot be retrofitted:

1. **If the slug in §2 turns out NOT to reproduce a real ruling key** in some case the two samples
   missed — a question containing markdown the parser normalises differently, say — then Part 2's
   join is unreliable and Part 1 is not merely first, it is mandatory. **Check by slugging every row
   in `RULED` against every key ever seen, not just today's two.**
2. **If `glassState.rulings` is cleared on republish**, the harvest may see a ruling exactly once,
   and a missed harvest loses the retirement trigger permanently. **Measure whether rulings persist
   across a republish before relying on them as the trigger** — if they do not, the trigger must be
   the record, not the page.
3. **If Part 3's gate cannot be made to fail on today's pre-repair file**, it is not a gate. Build it
   red first or not at all.

## 6. WHAT THIS DOES NOT COVER

- **Ideas**, which travel the same path with the same slug-free `i<epoch>` ids and do not have this
  problem — they are appended, never asked.
- **The Glass-update session's inability to see its own subagents' tool calls**
  (`INBOX-20260902T1845Z`). Part 3's gate is deliberately independent of that: it reads the files,
  not a session's account of them.
