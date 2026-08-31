# THE TRIAL'S MOST FREQUENT FAILURE IS ONE COMPONENT AND A 400ms CAP

Measured 2026-08-31 from `sea-trial-shots/report.json` — the previous FULL trial's own recorded
data, 328 screens across 10 legs. No browser, no new run; this was on disk the whole time.

## The failure

Every trial ends with legs failing on *"N screen(s) never stopped moving before being checked"*.
The count has been reported as 1, 3, 4, 8, 11, 13, 14, 18, 22 across runs and **never once broken
down**. It is the single most common reason a leg fails.

## It is one component, and the split is total

| | screens | never settled | median settle |
|---|---|---|---|
| **radial prompts** (`sig` begins `radial`) | 191 | **94 — 49.2%** | **2470ms** |
| **everything else** | 137 | **0 — 0.0%** | **409ms** |

Not "mostly". **Zero** non-radial screens have ever failed to settle in this corpus.

## And they DO settle — the cap gives up about 400ms early

`waitSettled`'s cap is **2600ms** (`scripts/lib/checks.mjs`). Radial prompt settle times:

```
min 374   p25 899   median 2470   p75 2656   p90 2726   max 3175
```

| cap | still unsettled |
|---|---|
| 2600ms (today) | **94** of 191 |
| 3000ms | **1** |
| 3500ms | **0** |

**Nothing here is failing to settle. It is settling just after we stop looking.**

## TWO READINGS, AND I AM NOT CHOOSING BETWEEN THEM

1. **The cap is too short**, so the trial has cried wolf on 94 screens per run, every run. That
   matters beyond the noise: *a gate that flakes gets disabled, and a disabled gate is worse than
   no gate because it was believed for a while* — this file's §10 lesson, and the reason CEO 31
   rejected a live two-client parity gate.
2. **The radial prompt genuinely takes up to 3.2 seconds to stop moving**, which is a long time to
   wait for buttons. That is a player-facing observation, not an instrument problem.

**Both may be true, and they call for opposite actions** — one raises the cap, the other speeds up
the prompt. **Raising the cap alone would make 94 failures per run vanish, which is exactly what
"switching a gate off" looks like from the outside.** So this goes to Wyatt with the numbers
attached rather than being quietly fixed at 5am.

## What would settle it (and is cheap)

Pose one radial prompt and trace what is still moving between 2.4s and 3.2s — one component, one
recording, per rule 26. If it is the bloom's own arrival easing, that is a deliberate 3-second
animation and the cap is simply wrong. If something is still drifting at 3.1s, that is the defect.
