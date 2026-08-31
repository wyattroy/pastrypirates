# PREDICTION — the End of Voyage screen is photographed and checked by nothing

Written 2026-08-31 BEFORE any fix, so it cannot be retrofitted.

## What I claim, with the citation

`scripts/playtest_gate.mjs:229` — the End of Voyage branch:

```js
if (st && st.over) { log(`  [${tag}] END OF VOYAGE at day ${st.day}`);
  const f2 = `${OUT}/${tag}-eov.png`; await c.shot(f2);
  rec.screens.push({ shot: f2, sig: "end of voyage", fails: [] });
  rec.finished = true; return; }
```

Compare the path EVERY OTHER screen takes, `scripts/playtest_gate.mjs:208-226`:
motion shot → `structuralChecks` on the moving frame → `waitSettled(c)` → settled shot →
`structuralChecks` again → `fails` recorded → each failure logged.

So the LAST SCREEN OF EVERY VOYAGE, on all ten legs of a FULL trial, gets:
- **no `structuralChecks`** — `fails: []` is a hardcoded literal, not a result;
- **no `waitSettled`** — the shot fires the instant `over` flips, mid-glide. w34 measured that
  card travelling 688px in 250ms, so this frame is caught during exactly that motion;
- **no `motionShot`**, so nothing can even be read against it afterwards.

## What would prove me WRONG

1. If `structuralChecks` is run on the EOV screen somewhere else — a later pass over
   `rec.screens`, or inside `c.shot`. Then the branch is a shortcut, not a hole.
2. If the vision judge reads screens whose `fails` array is empty and would still have caught a
   broken EOV card. Then the screen is checked, just not structurally.
3. If some leg-level check asserts on `sig === "end of voyage"`.

If any of those hold, this is not a gap and I say so instead of fixing it.

## Why I expect it went unnoticed

It produces no failure and no silence — it produces a **PASS**. `fails: []` is indistinguishable in
every report from "checked, and clean". This is the same shape as the fault closed an hour ago:
an instrument that reports on a thing it never looked at. Rule 6.

## What happened immediately before (rule: widen the time horizon)

`return` on the same line. The branch ends the leg, so it was written as a *teardown* — grab a
final photo and stop — rather than as a screen. Everything that makes a screen a screen lives in
the loop body above it, and the early return steps over all of it.

---

## THE RESULT — checked 2026-08-31, BEFORE fixing anything

**I was right on two of the three falsifiers and WRONG on the headline. Saying so first.**

| falsifier | outcome |
|---|---|
| F1 — is `structuralChecks` run on the EOV screen anywhere else? | **NO.** It is called at `playtest_gate.mjs:211` and `:218` only, both inside the loop body the EOV branch returns before reaching. `c.shot` checks nothing. **Prediction holds.** |
| F2 — does the vision judge read it anyway? | **YES — and this half of my claim was WRONG.** `playtest_gate.mjs:441-442` maps over `rec.screens`, which INCLUDES the EOV entry. The judge's eyes are on that screenshot. |
| F3 — does any leg-level check assert on `sig === "end of voyage"`? | **NO.** The only occurrence in all of `scripts/` is the push that creates it. **Prediction holds.** |

**So "photographed and checked by nothing" was too strong, and I am striking it.** The correct
statement is narrower and still worth fixing:

> The End of Voyage screen gets **no structural checks** and **no settle wait**, on every leg of
> every trial. It is the only screen in the run that skips both.

**AND F2 MAKES THE SETTLE HALF WORSE, NOT BETTER.** Because the judge *does* look at it, the missing
`waitSettled` means the eyes are handed a frame captured the instant `st.over` flips — mid-glide.
`scripts/qa/w34_eov_park_glide.mjs` measured that card travelling **688px on desktop and 762px on
tablet in 250ms**. So the one screen the judge is guaranteed to see from every leg is the one screen
it is guaranteed to see *while it is still moving* — and a card caught in flight is exactly what
produces a judge complaint that reads as a real layout defect and is not one. The gap costs both a
missing check AND false noise in the check that does run.

**The lesson, which is rule 6 pointing at me:** I wrote "checked by nothing" from reading one branch
and not following where `rec.screens` goes afterwards. The prediction note is the only reason that
got corrected instead of shipped as a finding.
