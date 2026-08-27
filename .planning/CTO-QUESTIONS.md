# CTO questions — what the marathon worker needs from Wyatt

**Wyatt, 2026-08-27:** *"CTO asks for my input at critical junctures, and if that input is not given
within 10 minutes, it makes its best call and continues with the work."*

**AND THE EXEMPTION THAT MAKES THAT SAFE.** He is stepping away for DAYS. If every question defaults
after ten minutes, then every question defaults — and the CTO's "best call" quietly becomes the
entire design of the game while he is asleep. So questions come in two kinds and they are treated
differently:

| kind | what it covers | after 10 minutes |
|---|---|---|
| **MECHANISM** | which function, which file, what order, how to structure a fix | **takes the stated default and continues.** Logged, reversible, and named in the log so he can undo it. |
| **TASTE** | anything a player SEES and cannot un-see — wording, pacing, art, rules, difficulty | **NEVER defaults.** The item is PARKED and the CTO moves to the next backlog item. |

**Why taste never defaults:** CLAUDE.md is explicit that *"Taste, placement, wording and 'how much is
enough' are his. Mechanism is yours."* A ten-minute timer does not transfer taste; it only hides who
made the call. He comes back to a batch of QUESTIONS, not a batch of decisions somebody made for him.

**Every question is pushed to his phone when it is asked**, and every one is recorded here whether
or not it was pushed — the push can fail, the file cannot.

## The format

```
### <ITEM-ID> — <one-line question>
- **kind:** MECHANISM | TASTE
- **asked:** <ISO8601>
- **default:** <what will happen at +10 min, or "none — TASTE, parks instead">
- **why it matters:** <one plain sentence>
- **answer:** <blank until Wyatt answers; then his words, verbatim>
- **resolved:** <ISO8601, or blank>
```

## Open questions

### Q-1 — Crustbeard started the ovens, but everyone got another turn before the bake-off. Is that right?
- **kind:** TASTE (rules — his)
- **asked:** 2026-08-27 (from his playtest notes)
- **default:** none — TASTE, parks instead
- **why it matters:** He is not sure whether he is misremembering his own rules. **Measure what the
  engine actually does and show him; do not change it.** A rule changed on a guess is a game he no
  longer recognises.
- **answer:**
- **resolved:**

### Q-2 — Should a player be able to watch a bot's bake-off?
- **kind:** TASTE (pacing — his)
- **asked:** 2026-08-27 (from his playtest notes: *"I didn't get to watch crustbeard's bakeoff, but i want to."*)
- **default:** none — TASTE, parks instead
- **why it matters:** Traced to ONE missing publish, so it is cheap to build — but it adds time to
  **every** bot turn, in every game, forever. That is a pacing decision, and pacing is taste.
- **answer:**
- **resolved:**

### Q-3 — The "End of voyage" heading now stays put instead of scrolling away. Keep or revert?
- **kind:** TASTE
- **asked:** 2026-08-26 (checklist item #5, still unanswered as of 2026-08-27)
- **default:** none — TASTE, parks instead
- **why it matters:** Nobody set out to change it; it fell out of moving "Play again!" outside the
  scroller. One line either way.
- **answer:**
- **resolved:**
