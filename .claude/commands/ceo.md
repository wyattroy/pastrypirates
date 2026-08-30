---
name: ceo
description: Spawn a fresh-context CEO to judge whether Wyatt's ask was actually executed — rule 25
argument-hint: "[what to review, or blank for the last item] [--plan to critique a proposal instead of shipped work]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Agent
---
<objective>
Rule 25. Run a FRESH-CONTEXT CEO review and give Wyatt its verdict in ITS words.

This exists because `/ceo` did nothing until 2026-08-30. The brief script and the contract were
both written; the command he types was not, so every session hand-assembled the review differently
and he could not start one himself. Wyatt, 2026-08-26: *"I need to be able to ask you to run CEO
too."*
</objective>

<process>

## 1. Assemble the brief — do not hand-roll it

```bash
node scripts/qa/ceo_brief.mjs --ask="<his request, VERBATIM — not a summary>"
```

It pulls in what changed, the build stamp, the sea trial's state, and the PREVIOUS verdict from
`.planning/CEO-REVIEWS.md`. Read `.claude/CEO-BRIEF.md` for the full contract.

If the diff it prints is enormous (a long-lived branch), do not paste it wholesale — cite the
specific commits and files for THIS item instead. A CEO buried in a thousand-line diff reviews the
branch, not the ask.

## 2. Spawn it with `Agent`, always fresh

**Never continue a previous CEO.** One that inherits the reasoning inherits the blind spot.

Give it, in this order:

1. **His request, VERBATIM.** The summary is where the drift already happened.
2. **What was actually done** — commits, files, measurements — and **what was NOT done, admitted.**
3. **The previous CEO's verdict**, so it can say whether the same fault is recurring.
4. Tell it explicitly **that it may say NO**, and that a criticism without a `file:line` or a
   command-and-its-output citation is an opinion, not a finding.
5. Bound its effort (~15 tool calls, hard stop at 25) and tell it READ-ONLY: no edits, no commits,
   no deploys. If it starts a browser it kills it BY PID.

## 3. Two modes

**Shipped work (the default).** The question is narrow: **did the thing he asked for happen?**
Not "is this good work". Adjacent, competent, impressive work that misses the ask is exactly what
this exists to catch.

**`--plan` — a proposal, not shipped work.** The question changes to: **would this actually deliver
what he is trying to build, and does it survive the next two years?** Give it his VISION and his
future-proofing intentions alongside the plan, and ask it to propose concrete changes rather than
only grading. Tell it to attack the plan's own assumptions, name what the plan does not cover, and
say which parts are over-engineering.

## 4. Afterwards, both are required

- **Its verdict reaches Wyatt in ITS words, especially when bad.** A kind paraphrase makes the whole
  mechanism theatre, and the paraphraser is the one with the motive.
- **APPEND the verdict, verbatim, to `.planning/CEO-REVIEWS.md`** — newest at the TOP, since
  `ceo_brief.mjs` reads the top of that file to hand the next CEO the previous one. A verdict nobody
  recorded is a recurrence check nobody can run. This has already broken once.

## 5. When it does NOT run

After a question answered or a file handed over. It runs after WORK — something built, fixed,
measured or shipped — and after every ITEM, not once per window.

</process>
