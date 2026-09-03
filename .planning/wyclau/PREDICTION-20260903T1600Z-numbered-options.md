# PREDICTION — numbered options on his Your Call cards

**Written 2026-09-03T16:00Z, before changing a line.**

## HIS WORDS

> *"please change the response buttons -- they are unclear. There is no "yes" button -- only one
> that says "do it" -- but what the "it" is, is unclear. for every call i need to make, you should
> label your suggestions in the same way as the claude question UI does -- with numbers, and a
> (recommended) -- so I can reply with 1, 2, 3, 4, or other and write in the box"*

## WHY IT IS UNCLEAR — the cause, not the symptom

The three buttons are **fixed**: `Approve` / `Deny` / `Let's talk` (`glass.mjs:1193-1195`). They are
the same on every card, so they cannot name what he is approving. The card's only per-question text
is one prose line — *"My recommendation: …"* — and the buttons do not refer to it.

**So "Approve" means "the thing in that paragraph", and he has to hold the paragraph in his head
while he presses a word that does not repeat it.** That is the whole complaint, and it is fair.

## WHAT I EXPECT

**A question must DECLARE its options, and the page renders them numbered.** The Chart's
`BLOCKED ON WYATT` row already has a Recommendation cell; options go there in a form that still
reads as prose to anyone opening the file:

`1. Give me a way back (recommended) · 2. Save only the rows I dragged · 3. Nothing is wrong`

Parsed into buttons: **`1 · Give me a way back`** with a *recommended* badge, and so on. The
write-in box stays and is labelled as the "other" he asked for.

**Rows that declare no options keep the three words they have**, so the 24 existing questions do not
break — and that fallback is the thing most likely to become a permanent excuse, so it must be
visible in the gate rather than silent.

## WHAT WOULD PROVE ME WRONG

1. **⛔ `data-choice` IS A STORED KEY, NOT A LABEL.** `glass.mjs:1188` says so in capitals: the value
   is what `glassState.rulings` holds, and the redraw compares a saved ruling against it to decide
   which button shows pressed. **If I reuse `yes`/`no` for numbered options, or renumber later, every
   answer already on his live page un-presses.** New values must be new, and must never be recycled.
2. **A NUMBER IS NOT AN ANSWER IN THE RECORD.** `T-121`'s harvested ruling reads *"Wyatt ruled
   'yes'"* and its own entry admits *"the alternative he did not pick: not recorded"*. Storing `"2"`
   would be strictly worse. **The stored ruling must carry the option's TEXT and the full option
   list**, or tonight's fault gets a numeral painted on it.
3. **If the options cannot survive the round trip.** The page rebuilds and republishes itself; the
   state block must carry enough to re-render a pressed answer after a reload with a chart that has
   since changed. Check what `paintAsk` needs.

## THE TRAP

**He asked for a UI change and the honest fix is a DATA change.** The tempting version is to relabel
three buttons and call it done — which would leave every future question exactly as vague, because
the vagueness is that the buttons do not know what the question is. **If I ship button words without
the per-question options, I have answered the sentence and not the complaint.**

**Second: I write these questions.** A parser that accepts options is useless if the next question I
write is still prose. The gate has to require options on new rows, or this decays to nothing within
a day — which is precisely how *"a capability nothing invokes"* has failed twice this session.
