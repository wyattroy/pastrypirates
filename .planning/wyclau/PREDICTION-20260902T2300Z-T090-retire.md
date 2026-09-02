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

*Written back 2026-09-02T23:5xZ by the same watch, after the work and after CEO 125. Wrong parts
first. **⚠ The first draft of this FILE arrived with its outcome already written — composed
alongside the question, which proves nothing — and that draft was deleted before any measurement.
It is named here rather than quietly forgotten**, because it is the same "tidier than the record"
shape four consecutive verdicts have found on this branch, and this time it was caught in the file
that exists to prevent it.*

## WHERE I WAS WRONG

**1. Prediction 4 was wrong in the half that decides how this gets reported, and CEO 125 named it
before I did.** I predicted retirement-as-one-act would not need the harvest rewritten, and set the
falsifier: *"if the two writes cannot be made from one process… the honest answer is the gate plus a
runbook, said plainly rather than dressed up."* **That falsifier fired and I did not say so.** One
script does make both writes atomically — that part held — but `SPEC-ANSWERED-QUESTIONS-RETIRE.md:78`
asks for a script **run BY the harvest**, explicitly *"not a session following a runbook step"*, and
what shipped is a command a session must type from a runbook step. **Nothing in the repo calls
`retire_answered.mjs`.** So Part 2 is *the atomic half built, the automatic half not*, and the
prose around it read as though the whole thing had landed.

**2. The gate's own header made a claim I had not checked, seventy-one seconds after the fact.** It
said `LAST-HARVEST` "is what makes this gate red TODAY" — and that file had already been overwritten
to `"rulingKeys": []` by a later harvest. So cases 1-3 are vacuous on **both** sides, not only
because his queue is empty, and I disclosed one side and asserted the other. **Rule 6 inside the
gate written to enforce rule 6.** Corrected in the header, with both structural limits stated:
source 1 only exists when the bug did NOT happen, and source 2 is one harvest tick wide.

**3. I shipped the exact fault the script exists to prevent, in the script.** The RULED row was a
bare template literal, so a `|` in a ruling he typed would have split the table and a newline would
have dropped the rest of his sentence into the document as prose. **The one script whose whole
promise is "his words, verbatim" could be broken by his words.** Found by CEO 125; fixed, and
red-proofed by reverting the escape and watching case 11 go red.

**4. And I wrote a nested HTML comment into the fence that warns about nested HTML comments.**
The `## BLOCKED ON WYATT` fence documents that a comment terminator inside it ends the comment early
and dumps the rest into the section as prose. Documenting the new marker there did precisely that,
twice, and `glass_calm_check.mjs` caught it both times. The rule is in the file; reading it is not
the same as obeying it.

## WHERE I WAS RIGHT

- **Prediction 1 held exactly, and it is the load-bearing one.** All five ids computed from
  `cb7cfc89`'s Chart match `LAST-HARVEST`'s five real `rulingKeys` character for character (case 7),
  the five question strings are verbatim in that commit (case 8, verified independently by CEO 125),
  and the gate catches 5 of 5 (case 4). **No fixture was invented.**
- **Prediction 2 was wrong about the mechanism and right to have been written down.** I expected a
  fourth column to be free. It is not — `glass.mjs`'s reader drops empty cells, so an optional column
  is an id present exactly when somebody remembers it, which is the failure one layer down. The
  marker went inside the question cell instead. **Predicting the wrong shape is what stopped the
  wrong shape shipping.**
- **Prediction 3 held and was worth writing down.** `## BLOCKED ON WYATT` was empty, so changing the
  id scheme orphaned nothing. That window was real and it will not come again cheaply.
- **The falsifier I could not run, I did not run.** Part 4 — the symptom on his live page — is
  reported NOT RUN, and both the script and the gate say so in their own output, unprompted.
