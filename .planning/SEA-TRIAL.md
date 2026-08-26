# Sea trial — build `2026-08-26h`

**NO COMPLETED TRIAL.** · written by hand 2026-08-26, correcting a report that lied

> **This file previously said `PASSED (no voyage needed)` on this build.** That was a smoke test run
> with `--gear=COSMETIC`, which sails nothing — and the build it blessed carries **18 fixes nobody
> has ever seen work**. Rule 24 tells Wyatt to answer *"did you run it?"* by opening this file, so a
> stale green verdict here is the single most misleading artifact in the repo. Found by the CEO
> review, verified, and corrected.
>
> `sea_trial.mjs` now writes **IN PROGRESS** before it sails, so a killed run can never again leave
> the previous run's verdict behind.

## What has actually been sailed on this build

| leg | result |
|---|---|
| **crew-phone** | **FAILED** — completed a real two-phone voyage to END OF VOYAGE, day 21 |
| solo-desktop, solo-phone | started, reached day 12, **killed** — no verdict |
| passplay-phone, passplay-desktop, crew-desktop | **never run** |
| solo-desktop-wk, solo-phone-wk (Safari) | **never run** |

**1 of 8 legs has a verdict, and it is a failure.**

## What crew-phone found — the first time that square has ever been tested

- **3 × `no-cover-ask`** — a button sitting on top of the question it answers, three separate times,
  at phone size. A real, visible layout bug.
- **A console error:** `duplicate attach refused for key "session|…/.info/connected"` — Firebase
  connection watching is being wired up twice.
- **`deny` offered but never exercised** — the trade Deny path was presented and never once
  successfully clicked across a whole voyage.
- **20 screens were checked while still animating** — the trial is partly measuring moving pictures.

## What was reported and was NOT real

Two "the two captains saw different games" findings on the battle card. **Both false**, and the CEO
review is what caught it: the comparator's `battle` field read `#pp4Prompt`, which is *the viewer's
own prompt box*, not shared truth. Both directions fired in one voyage — the fingerprint of *whose
turn it is*. The field is removed; the comparator now reads only day, wind, purses and who is lit.

## Not yet proven, and named so it is not assumed

- **The seeded-defect drill has never been run.** `4/scripts/qa/seed_drill.mjs` exists and its four
  seeds still match the shipped code, but nothing has yet put last night's bugs back to check the
  trial notices them. **Until that runs, there is no evidence this process catches his bugs.**
- **T-04 and T-06 are not covered.** Both need a clock rather than a snapshot — a difference that
  clears when the battle clears is normal; one that outlives it is the bug.
- **Nothing gates the push**, though `docs/QA-PROCESS.md` said it did.
