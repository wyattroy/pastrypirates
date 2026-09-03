# PREDICTION — can "is this handle ambiguous?" become one definition, and is it really two?

**Written 2026-09-03T11:00Z, after reading all the call sites and before changing a line.**
Seventh prediction of the session.

## THE ROW SAYS TWO. I HAVE FOUND THREE.

`T-122` describes two deciders. Reading the code there are **three**, and they answer different
questions:

| where | rule | scope |
|---|---|---|
| `glass.mjs:572-577` | `handleCount` > 1 | **open checklist rows only** |
| `chartkeeper.mjs:222-233` (`--order`) | `carriers` > 1, gated by `headIsOpen` | **any head with a checkbox within 11 lines above — checklist AND inbox** |
| `chartkeeper.mjs:754` (`handleIsAmbiguous`) | `closedHandles ∪ duplicateHandles` | **a different question entirely** — it also calls a handle ambiguous when the row is CLOSED |

**The third one is the finding, and it is not in the row.** It is not a third implementation of the
same rule; it answers *"may I claim anything from a mention of this handle?"*, for which a closed
row is as unusable as a duplicated one. **Collapsing all three into one definition would be the
wrong fix** — it would make `--order` refuse a handle merely because a row with that number was
closed last week, which is not ambiguity, and every archived handle would poison a drag.

## WHAT I EXPECT

**Two of the three converge; the third keeps its own name and stops using the word.** One exported
`ambiguousHandles(chartText)` in `lib/chart_model.mjs` — *more than one OPEN row carries this handle
on its own `⟨…⟩` marker line* — imported by `glass.mjs` (to decide draggability) and by
`chartkeeper --order` (to decide refusal). `handleIsAmbiguous` becomes `handleIsUnclaimable` and is
documented as the union of *ambiguous* and *closed*, built ON the shared one.

**Rule 23's own question — what makes these two agree? — currently answers "nothing".** After this,
the answer is "there is one of them".

## WHAT WOULD PROVE ME WRONG

1. **If the two scopes are deliberately different and I am about to break one.** `--order` counting
   INBOX rows may be intentional: an inbox idea has no handle at all (`glass.mjs:654`), so including
   inbox heads might be counting nothing, or might be catching a real case the page cannot see.
   **Test before converging: count handles under each rule on the live Chart AND the Glass Chart,
   and print the difference.** If it is non-zero, one of them is right and I must find out which
   rather than averaging them.
2. **If `headIsOpen`'s 11-line window is load-bearing.** A window is a constant standing in for
   "this handle belongs to that row" — rule 9. If converging changes which row owns a handle, the
   `--order=` refusal could start accepting a drag it used to refuse, which is worse than the bug.
3. **If the shared function cannot serve both shapes.** `glass.mjs` works from parsed row objects,
   `chartkeeper --order` from raw lines with indices. A definition that only fits one is not shared
   — it is copied with extra steps.

## THE TRAP

**The row says "MEASURED TODAY: ZERO DISAGREEMENTS", so nothing visible will change.** That means I
cannot tell a working convergence from a broken one by running it — **the gate has to be a
red-proof against a chart where they DO disagree**, constructed on purpose. If I ship this on "it
still passes", I have shipped an untested rewrite of the thing that decides whether his drags work.

**Second trap, and it is tonight's recurring one:** I am about to touch `glass.mjs`, which five
gates already run as a side effect. Any new import must not make the page fail to render on a
fixture chart, or those five go red for a reason that has nothing to do with them.

---

## THE RESULT

**The row said two deciders. There are three, and that is the finding the row does not carry.**
`chartkeeper.mjs:754`'s `handleIsAmbiguous` is not a third copy of the same rule — it answers
*"may I claim anything from a mention of this handle?"*, for which a CLOSED row is as unusable as a
duplicated one. **Merging all three would have made `--order=` refuse a handle because a row with
that number closed last week.** Two converged; the third keeps its own question.

**Falsifier 1 — CLEARED, and it was the one that mattered.** *"They may be deliberately different
and I am about to break one."* Measured before touching anything: the two rules produce the
**identical set** on both live charts — 22 on `CHART.md`, 26 on `GLASS-CHART.md`, **zero** seen by
one and not the other. One rule written twice, not two rules averaged.

**Falsifier 2 — CLEARED.** The eleven-line window was not load-bearing: removing it reproduced 22
and 26 exactly. It is a constant standing in for ownership (rule 9), and it is gone.

**Falsifier 3 — CLEARED.** One function serves both because it returns `Map<handle, lineIndex[]>`:
the page reads `length`, `--order=` reads `[0]` for its slot and `length` for ambiguity.

### THE TRAP FIRED, AND THE PREDICTION IS THE ONLY REASON IT DID NOT SHIP UNTESTED

The trap: *"nothing visible will change, so I cannot tell a working convergence from a broken one
by running it."* That is exactly what happened — `npm test` stayed green throughout, and the live
charts never once exercised the difference. **A gate built on live data would have been vacuous and
looked identical to a real one.**

So every case is built on a chart where the OLD rules disagree, on purpose — a row whose marker sits
fourteen lines below its checkbox. **Case 1 fails if that fixture ever stops exercising the
difference**, so the suite cannot degrade into agreeing with itself. Four mutants, each dying at its
own assertion; putting the window back reproduces the real fault in case 5: `--order=` refusing
`T-301` while the page offers it as draggable.

**Second trap — did not fire.** `glass.mjs` gained an import and the five gates that render it as a
side effect stayed green.
