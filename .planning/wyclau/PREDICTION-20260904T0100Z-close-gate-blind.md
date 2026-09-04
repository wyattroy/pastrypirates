# PREDICTION — 2026-09-04T01:00Z — the close gate cannot see six CEO verdicts

Written BEFORE the fix, per Door step 3 and CLAUDE.md rule 6. The finding came from
`pastrypirates-54` (T-251 watch), which reported TWO invisible verdicts; this note is about what I
expect to find when I look at all of them.

## What I expect

1. `scripts/wyclau/close_item.mjs:188` splits `CEO-REVIEWS.md` on `/^(?=## CEO Review )/m` and
   line 189 matches `^## CEO Review <n>\b`. **Any verdict headed `## CEO <n> —` is invisible to
   both.**
2. **SIX verdicts are invisible, not two** — CEO 82, 83, 135, 182, 189, 190 — measured by grepping
   the two heading forms (176 with the word "Review", 6 without). The peer normalised 191 and 192
   by hand and did not sweep for others, so its "both" is true about what it saw and false about
   the file.
3. **CEO 182 is a `T-216` verdict.** So the item the Chart records as *"worked, NOT closed"* has a
   verdict that the gate refusing to close it cannot see. I expect that to be a contributing cause,
   not a coincidence.
4. The refusal message — `CEO Review <n> is not in CEO-REVIEWS.md` — is **a claim about the file
   that is false**, made on the strength of a search. That is this project's named recurring fault:
   *an instrument that reports NOT FOUND has told you something about ITSELF, not about the world.*

## Why

The regex was written when every heading carried the word "Review". Nothing forced the shape, so
the shape drifted the first time somebody typed a shorter heading — CEO 82, on 2026-09-01 — and
nothing said so for three days, because a gate that cannot find a section refuses in words that
blame the section.

## What would prove me WRONG

- **Fewer than six invisible**, or the six are not real verdicts (e.g. a quoted heading inside a
  code fence) → my count is a grep artefact, not a finding, and the peer's "two" was right.
- **`close_item.mjs` has a second, looser lookup** further down that catches the short form → the
  gate is not blind and only its error message is wrong. I have read 188-198 and do not believe
  this, but I have not read the whole file.
- **T-216 closes cleanly with the gate unfixed** → CEO 182's invisibility is incidental and my
  point 3 is a story I told myself.
- **Normalising the headings alone makes it green and stays green** → then the durable fix is a
  heading-format gate, not a looser reader, and I have built the wrong thing.

## The trap I am naming, because I want one answer more than the other

**I want this to be a real six-verdict finding rather than the peer's two**, because I just had a
red proof of my own turn out to be shallow (CEO 192 on the Bell model: three mutants, all attacking
shape, none attacking value). There is a pull toward finding something bigger to offset that. **If
the count comes back at two, it is two**, and I will say so.

## What I will NOT do

Rewrite the headings and call it fixed. That is the snapshot fix — it repairs today's file and
leaves the next short heading invisible. Both halves are needed: the reader accepts both forms,
**and** the refusal says what it actually searched for instead of asserting the file lacks
something.

---

## OUTCOME — measured

**I WAS WRONG ABOUT THE COUNT, AND THE TRAP I NAMED IS EXACTLY THE ONE I FELL INTO.** I predicted
**six** invisible verdicts. The measurement says **two**: CEO 189 and 190.

The other four numbers I grepped — 82, 83, 135, 182 — are findable, but not for a reassuring reason:
**a DIFFERENT review shares each of those numbers in long form**, so the reader finds the wrong
section and reports success. My grep counted heading *shapes* and I read it as a count of *blind
spots*. Those are not the same quantity, and the note above says I wanted the bigger number.

| # | prediction | verdict |
|---|---|---|
| 1 | the reader splits and matches on `## CEO Review ` only | **held** |
| 2 | **six** invisible | **WRONG — two** (189, 190) |
| 3 | CEO 182 is a `T-216` verdict and contributes to that row not closing | **not established** — 182 resolves via its long-form twin, so the reader finds *a* section; whether it finds the RIGHT one is the second finding below |
| 4 | the refusal asserts something about the file it never checked | **held**, and fixed |

### The second finding, filed and deliberately NOT chased

**Eight CEO numbers are used twice in the record** — 31, 38, 73, 82, 83, 107, 135, 182. So
`--ceo=82` resolves to whichever section sorts first, and the traceability check that follows can
pass against the wrong verdict entirely. That is a worse bug than the one I fixed and it is a
different item; one item per watch.

### Two instrument faults inside one item, both of the same family

1. **The gate's first run condemned a reader that works** — 182 of 182 invisible, including verdicts
   that close every day. It lifts the reader's regex out of JavaScript *source text*, where
   `${ceoN}\b` carries two literal backslashes; handed to `RegExp` that means "a backslash, then
   b" and matches nothing. Caught only by rule 6 — *when a check condemns something known to work,
   suspect the check first.*
2. **The first red proof was a silent no-op.** A one-line in-place mutation failed to apply, the
   gate passed, and that is indistinguishable from a gate with no teeth. Re-run from a script that
   **verifies the mutation applied before believing the result**: 3 mutants, 3 killed, 0 survived,
   0 no-ops, each at its own named assertion.

**That is the second no-op-shaped fault of this session** — CEO 192 had just found that my Bell
red proof mutated only the *shape* of the launch line and never the *value* Wyatt ruled. Same
family, two hours apart: **a mutation that does not actually change the thing under test reads
exactly like a passing proof.**
