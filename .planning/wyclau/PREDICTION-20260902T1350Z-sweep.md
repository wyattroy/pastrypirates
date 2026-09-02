# PREDICTION — SWEEP takes every completed row, no stub (T-001 banner items 2 and 3)

*Written 2026-09-02T13:52Z, BEFORE opening the four files properly. Rule 6's working form: the
value is that it cannot be retrofitted.*

## What I am about to change, and why

His ruling (`SPEC-CHARTKEEPER.md` PASS 4, and the 🛑 banner): **a completed row leaves `CHART.md`
the moment it is finished, completely, with no stub and no age threshold.** The code is still the
draft he overruled — seven days, and a one-line stub left behind.

## What I expect to find

1. **`chartkeeper.mjs` SWEEP is gated on a date it often cannot read.** The comment at the top of
   PASS 4 says a row leaves "only when its age can be ESTABLISHED", and `sweepable` filters on
   `x.when && NOW - x.when > SEVEN_DAYS`. **So I expect two independent reasons a done row stays:
   no date, and a recent date** — and I expect the FIRST to be the one that actually bites on
   today's Chart, because most done rows are days old but few carry a machine-readable close stamp.
   **This matters:** if I delete only the threshold and leave the `x.when &&`, the sweep will still
   silently skip rows and I will have shipped a fix that does not fix his complaint.
2. **The Glass's done count really does count `- [x]` in `CHART.md`.** I expect `glass.mjs:392` to
   be roughly where the row says, and I expect to have to re-source it from `CHART-LOG.md` as
   **"done today"** (his pick over "this week" and "remove it"). Two previous drafts of this spec
   got a claim about `glass.mjs`'s counting wrong, and the spec itself says *"read the code, not
   this paragraph"* — so I expect the line number to be off and the behaviour to be right.
3. **`rulings_triage_check.mjs` will fail the moment a ruling's row is swept**, because it asserts
   a settled ruling with outstanding work has a checklist row in `CHART.md`. The repair is an
   address change, not a weakening: a ruling with **no outstanding work** needs no row.
4. **Three gate cases in `chartkeeper_check.mjs` currently defend the seven-day-with-a-stub
   design.** They must go RED first, then be rewritten to defend his design instead. I expect the
   count to be roughly three and I expect at least one of them to assert the stub's text.

## What would prove me WRONG

- **If the sweep already leaves no stub**, or already sweeps regardless of age, the row's own
  description is stale and the work is smaller than filed — say so rather than inventing scope.
- **If deleting the threshold sweeps ZERO rows on the real Chart**, my reading of `x.when` is the
  wrong diagnosis and the blocker is somewhere else entirely.
- **If `npm test` stays green after I delete the stub**, then the three gate cases do not defend
  what the row says they defend, and I have not actually red-proofed anything — a passing suite
  after a behavioural change means the suite could not see it.
- **If the Glass's done count does NOT go to zero** when every `- [x]` leaves, then repair 1 was
  never needed and the thing that blocked this item for eight hours was imaginary.

## What happened immediately before (rule: widen the horizon)

This row has been marked BLOCKED since 05:3xZ. The blocker was the vendor lock on `glass.mjs`.
**That lock was inverted at 08:48Z and the row was not updated until 13:39Z** — so the most likely
reason this item sat is not difficulty, it is a stale blocker line, the exact fault `T-078`'s close
was about. I expect to find the work itself unremarkable.

## The honest risk

**Sweeping is destructive to the file he reads.** If SWEEP moves rows out and `CHART-LOG.md` does
not receive them byte-for-byte, his record is gone. The spec's guardrail — *every closed `T-nnn`
appears in exactly one of the two files, never both, never neither* — is the check I must write and
red-proof, not a nicety.
