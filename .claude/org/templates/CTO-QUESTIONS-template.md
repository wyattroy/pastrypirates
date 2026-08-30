# CTO questions — what the marathon worker needs from Wyatt

**Wyatt, 2026-08-27:** *"CTO asks for my input at critical junctures, and if that input is not given
within 10 minutes, it makes its best call and continues with the work."*

**AND THE EXEMPTION THAT MAKES THAT SAFE.** If every question defaults after ten minutes, then every
question defaults — and the CTO's "best call" quietly becomes the entire design of the product while
he is asleep. So questions come in two kinds:

| kind | what it covers | after 10 minutes |
|---|---|---|
| **MECHANISM** | which function, which file, what order, how to structure a fix | **takes the stated default and continues.** Logged, reversible, and named so he can undo it |
| **TASTE** | anything a person SEES and cannot un-see — wording, pacing, art, rules, difficulty | **NEVER defaults.** The item is PARKED and the CTO moves on |

**Why taste never defaults:** taste, placement, wording and "how much is enough" are his; mechanism
is ours. A ten-minute timer does not transfer taste — it only hides who made the call. He comes back
to a batch of QUESTIONS, not a batch of decisions somebody made for him.

**Every question is recorded here whether or not it was pushed to his phone** — the push can fail,
the file cannot.

## The format

```
### <ITEM-ID> — <one-line question>
- **kind:** MECHANISM | TASTE
- **asked:** <ISO8601>
- **default:** <what happens at +10 min, or "none — TASTE, parks instead">
- **why it matters:** <one plain sentence>
- **resolved:** <his answer, or blank while open>
```

## Open
