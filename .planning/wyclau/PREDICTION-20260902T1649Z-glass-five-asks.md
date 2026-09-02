# PREDICTION — T-088, his five Glass asks

*Written 2026-09-02T16:5xZ, BEFORE any measurement or edit, per CLAUDE.md rule 6's working form.
Every line below is what I expect and why; what would prove me wrong is named beside it.*

## P1 — ask 2's stated fix is ALREADY BUILT, and the Chart row is wrong about it

The row says: *"Make the page compute its own age in the browser"* — implying it does not.
**I predict it already does, and has for some time**, so implementing the row as written would
change nothing and I would then be free to report a fix that fixed nothing.

Basis, read before predicting: `glass.mjs` carries `tick()` + `setInterval(tick, 30000)`, computes
`Date.now() - tProgress` and `Date.now() - tPublished` in the browser, and already renders a second
line, `page published N min ago`.

**WHAT WOULD PROVE ME WRONG:** the generated `glass.html` not containing a live `publishedLine`, or
the age being baked into the HTML as a literal string at generation time.

**SO WHAT IS THE REAL DEFECT?** He read *"last progress 25 min ago"* while work was 4 minutes old.
The number was honest and the PAGE was 13 minutes stale — `lastProgressAt` is frozen at publish
time, so the page cannot see anything newer. **Nothing on the page says that.** My fix is the
row's own "better" half and nothing else: when the page is more than a minute old, say out loud
that it cannot see anything newer than its own publish.

## P2 — "what is in hand" is derivable, and the trap is the between-watches case

I expect the newest `### WATCH … — claims \`X\`` heading in `CTO-LEDGER.md` to be findable, and the
newest `· close_item: …` line likewise. **In-hand = the newest claim has no close after it in file
order.** I predict this is honest in both directions and needs no invented staleness constant,
because holding-time is shown beside it.

**WHAT WOULD PROVE ME WRONG:** a ledger where closes are not written after their claim in file
order — then the derivation inverts and the card shows finished work as in hand, which is the exact
lie he named.

## P3 — the ALL-CAPS fix must not eat acronyms, and a length rule cannot tell them apart

I predict a per-word rule ("downcase words that are all-caps") destroys `CEO`, `RED`, `npm test`
and `T-088`, and that the distinguishing fact is not the word but the PHRASE: **an acronym is a
word; shouting is three or more in a row.** So: downcase runs of ≥3 consecutive all-caps words,
leave shorter runs alone, and never touch a token containing a digit or a dot.

**WHAT WOULD PROVE ME WRONG:** a real Chart row title where three genuine acronyms sit adjacent
(`CEO CTO QA …`). I have not seen one; if the gate finds one, the rule is wrong and the render-time
fix should be abandoned for his option (b).

## P4 — hiding "Your call" is one conditional, and the dangerous case is the unparseable one

I predict `askList.length === 0` is reachable for two completely different reasons — genuinely
nothing waiting, and a question written into `## BLOCKED ON WYATT` as prose rather than a table row
(that is `T-077`, open). **Hiding both looks identical to him and buries a real question.** So the
card must hide only when the section is genuinely empty, and shout when the section has content the
renderer could not read.

**WHAT WOULD PROVE ME WRONG:** the parser already handling prose rows, making the second case
unreachable.

## P5 — sizing

Asks 1, 3, 4, 5 are each minutes. Ask 2 is minutes once P1 is settled. **I predict the gate takes
longer than all five fixes together**, and that at least one of the five turns out to be already
done or differently caused than the row says — because that has happened on four of the last five
items on this branch.
