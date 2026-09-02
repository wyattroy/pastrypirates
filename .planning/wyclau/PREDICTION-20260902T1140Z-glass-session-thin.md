# PREDICTION — written BEFORE measuring (rule 6's working form)

**Item:** `INBOX-20260902T05xxZ-a` — Wyatt, 2026-09-02: *"make sure that Glass Update Session gets
cleared between ticks or updates or whatever you call its tasks -- we don't want to keep adding to
its context, that's unnecessary."*

**Watch** 2026-09-02T11:40Z (Wy-Blade). Written at 11:45Z, before the RED check exists.

---

## HIS SOLUTION FIRST (ruling, 2026-09-01)

The INBOX entry names the fix location in his own routing: *"Runbook change goes in
`.planning/wyclau/GLASS-UPDATE-SESSION.md`."* So the first act is to read that file and say
whether his change is in it — not to design a new mechanism.

**Already read, and stated here so the prediction is honest about what it already knows:** the
runbook DOES now carry the dispatcher shape (the ⚑ box at its head, *"EACH TICK RUNS IN A FRESH
SUBAGENT. THE SESSION ITSELF STAYS EMPTY"*), and it carries a ✅ measurement from
2026-09-02T04:46Z saying a dispatched subagent harvested, published and stamped for real
(`version=1788324379-6b86 commit=4e96e6b6`). **The INBOX status line saying "not yet applied" is
stale.** That much is settled before this note.

## WHAT I EXPECT TO FIND, AND WHY

1. **No gate holds the runbook to the dispatcher shape.** Already confirmed against
   `package.json`'s `scripts.test`: 98 gates, none named for this file. So the shape rests on
   prose alone, in the document whose own history contains *"a pointer that goes stale inside the
   document it points into is this project's most-repeated fault"* (CEO 100, same file, hours
   earlier).
2. **THE REAL HOLE — the re-arm box checks PRESENCE, not SHAPE.** `GLASS-UPDATE-SESSION.md:93`
   says *"`CronList`. If the dispatcher job is there, nothing to do."* A cron job armed with the
   OLD nine-step prompt **is** "there". So a reader following the runbook after a `/clear` would
   see a job, do nothing, and leave the fat-context shape running — **his ask silently unmet while
   every document says it is done.** This is "committed is not delivered" in its exact shape.
3. **I expect I cannot verify the LIVE cron prompt from here.** Cron jobs live only in the session
   that created them; this watch is not the Glass session, and it has no Artifact tool either. So
   the delivery half must be discharged by instructing the Glass session in the runbook it reads at
   spawn time, not by this watch checking it.

## WHAT WOULD PROVE ME WRONG

- If a gate already exists that reads `GLASS-UPDATE-SESSION.md` and asserts the dispatcher shape —
  then item 1 is wrong and there is nothing to build.
- If the re-arm box already checks the armed prompt's SHAPE and not merely its presence — then
  item 2 is wrong, the runbook is complete, and this item closes as "already done, status stale"
  with no diff beyond the fate.
- If `CronList` turns out to be reachable from this watch and returns the Glass session's job —
  then item 3 is wrong and the delivery half is directly measurable here.

## WHAT HAPPENED IMMEDIATELY BEFORE (rule: widen the time horizon)

The entry was filed at ~05:00Z saying *"the fix depends on one capability question now being
probed"* — could a subagent publish? That question was answered ✅ at 04:46Z, **fourteen minutes
BEFORE the entry that says it is open was written**, and the runbook was updated but the INBOX was
not. The staleness is not decay over hours; the two records disagreed the moment the second one
was written. That is the same shape as the propagation fault the 11:00Z watch found in T-005.

## THE GEAR

`node scripts/qa/gear.mjs` decides. Expectation: **not FULL** — nothing here touches `src/` or
`index.html`; the change is a runbook and a gate. To be run, not assumed.
