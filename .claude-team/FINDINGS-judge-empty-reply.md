# "UNPARSEABLE JUDGE REPLY" IS THE WRONG NAME, AND THE NAME SENT EVERYONE THE WRONG WAY

2026-08-31, measured mid-trial from `sea-trial-shots/log.txt`. **Hypothesis with evidence — the
decisive test is named at the bottom and has NOT been run.**

## The reply is EMPTY, not malformed

`scripts/lib/vision.mjs:177` appends the actual reply to the issue text:

```js
issues: ["unparseable judge reply: " + String(text)…slice(0, 140)]
```

**Not one logged line carries any text after that colon.** So `text` is empty every time. The
judge process returns **nothing at all** — it is not returning JSON we cannot parse.

**That name has cost real time, mine included.** "Unparseable" says *malformed*, which sends a
reader to the prompt, the JSON shape, the model's phrasing — none of which is the problem. A call
that returns nothing is a process failure: a crash, an auth refusal, a silent non-zero exit, or a
rate limit.

## What the numbers say

| run | screens judged | outcome |
|---|---|---|
| previous FULL trial (`report.json`) | 328 | **0 succeeded.** 307 empty replies, 21 permission-denied |
| tonight, mid-run | 691 queued | 373 empty, 28 real FAILs, **~290 apparently succeeded** |
| tonight's pre-flight check (`judge_can_see_check.mjs`) | 1 | **succeeded** |

The permission-denied class is gone — that was the temp-directory staging fixed earlier tonight.
What remains is the empty reply, and it is now **intermittent** rather than total.

## THE HYPOTHESIS: CONCURRENCY

Intermittent is the tell — rule *widen the time horizon*: what is different about the calls that
fail?

- `scripts/sea_trial.mjs:205` runs legs at `--parallel=2`.
- `scripts/playtest_gate.mjs:479` judges with `concurrency: 3` inside each leg.
- **So up to 6 vision calls are in flight at once.**
- The pre-flight check makes **one** call, alone, and succeeds — every time it has been run.

A rate limit or a resource ceiling on concurrent CLI invocations would produce exactly this shape:
one call fine, six calls mostly empty.

**NOT MEASURED. I am not asserting it.** It fits every number above and it is the first thing to
test, which is a different claim from being true.

## AND MY OWN PRE-FLIGHT CHECK IS WEAKER THAN ITS NAME

I added *"can the judge open a screenshot?"* to the trial tonight, and it reported **the eyes are
open** at the start of a run whose judging then failed on 58% of screens. **The check is not
wrong — it is answering a narrower question than its name implies.** "Can one call succeed" is not
"is the judge working". It would have caught the previous run's total blindness; it cannot catch
degradation.

The trial's per-leg reporting is honest about it (*"vision judge errored on N screen(s) — those
screens are NOT cleared"*), so nothing is hidden. But a green pre-flight beside a 58% failure rate
is the shape of a signal people stop reading.

## THE DECISIVE TEST, cheap, and to be run AFTER the trial lands

Judge the same fixed set of screenshots twice — once at `concurrency: 1`, once at `6` — and compare
empty-reply rates. If concurrency is the cause the split will be obvious in one run, and the fix is
a semaphore rather than anything about prompts or JSON.

**Second, regardless of the outcome: rename the failure.** *"empty reply from the vision call
(process returned nothing)"* points at the real thing. And the pre-flight check should report the
rate it observes, not a boolean.
