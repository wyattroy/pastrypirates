# Prediction — do the 10 cached legs at stamp 2026.09.03.4 already constitute a real, complete sail?

**What I expect:** `sea-trial-shots/legs/` holds a leg JSON for all 10 fleet legs stamped
`--2026.09.03.4.json`, each with `finished:true` and a non-empty `judged` array. I expect these
to be genuine complete data from a real prior sail of the CURRENT build (the one carrying the
T-211 call-circle fix, `cb22f06d`), not junk or partial captures — because `playtest_gate.mjs`
only writes a leg file once `runLeg()` returns, and the resume check (`readDone`) only trusts a
file whose `__stamp` matches the live `PP4_STAMP`.

**Why I expect it:** `sea_trial.mjs`'s report headline "0 of 10 sailed, 10 NOT RUN" for the
2026-09-04T0113Z run is not evidence the legs are empty — it's `sailedHere()` requiring
`leg.__runId === thisRunId`, and every leg here carries an OLDER run's `__runId` because
`playtest_gate.mjs` resumed them from cache in ~2 minutes rather than re-sailing. That is a
report-generation defect (already partially described under `T-219`'s follow-up note), not
evidence the underlying voyages never happened.

**What would prove me wrong:** any leg file with `finished:false`, an empty `screens`/`judged`
array, or a `__stamp` that does not match `2026.09.03.4` despite the filename. Or: the judged
verdicts inside these legs showing NEW findings that contradict what a "PASS" report would need
to say about T-211 (a captain-selection circle stranded far from its boat, or beside the wrong
one) — that would mean the fix has NOT actually landed cleanly on this stamp, regardless of the
report-generation bug.

**What I'll do with the answer:** if the legs are genuine and complete, read every judged verdict
across all 10 for anything resembling the T-211/T-213 call-circle defect class and anything else
player-visible, and treat that as the sea trial's real (if mis-reported) verdict — citing the leg
files directly rather than the broken `.md` report — before deciding whether `T-211` can close.
If they are NOT genuine/complete, this item is smaller than it looked and the honest step is to
clear the stale cache and start a real detached trial instead.
