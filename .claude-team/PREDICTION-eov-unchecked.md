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
