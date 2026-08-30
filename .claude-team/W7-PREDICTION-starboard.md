# W7 — what I expect, written BEFORE I measure it. starboard-lead, 2026-08-30.

## The claim I am testing
`animateSailRoute()` (src/ui/flow.js:1194) takes no parameters and reads `g.events[n-1]`.
`consumeEvent(e)` (src/orchestrator.js:1573) calls it while holding a specific event `e`.
When `e` is NOT `events[n-1]`, the walker looks at the wrong event.

## The race I predict, and it is a RACE, not a wrong constant
src/orchestrator.js:1586-1590 — watchEvents' Firebase callback does
`events.push(e)` and the evIdx assignment BEFORE its first `await`, on purpose.
So if two events arrive back to back:
  - callback 1 pushes e1, then awaits (rim sweep)
  - callback 2 runs, pushes e2      <-- events[n-1] is now e2
  - callback 1 resumes into animateSailRoute(), reads events[n-1] = e2
If e1 was the sail and e2 is anything else, `last.t!=="sail"` -> return false ->
NO ROUTE WALKED and the guest's boat slides straight to the destination.

## Why this predicts the measured 5-walked / 3-slid, and it is the key point
It is TIMING, not geometry. A sail whose event is the last to land for that beat walks;
a sail with another event close behind it slides. That is intermittent by construction,
which matches a split rather than a clean pass or fail, and it matches "the same route
walks sometimes and slides other times".

## WHAT WOULD PROVE ME WRONG — named now, so it cannot be retrofitted
1. If the slid sails are all the SAME routes every run, this is geometric, not a race,
   and my whole explanation is wrong.
2. If watchEvents awaits consumeEvent such that no second callback can interleave, the
   race cannot happen on the guest and the cause is somewhere else.
3. If corner routes slide at a rate far above their share of all sails, something is
   selecting for corners specifically and a timing race does not explain it.
4. If `route.length<3` is culling them (the straight-hop early return), the cause is the
   route CONTENT, not which event was read.

## The second defect, and I predict it is REAL BUT NOT THE CAUSE OF THE 3 SLID
`_lastRoutedEvIdx` (flow.js:1193) is compared to `n-1`, an array POSITION, not an event
identity. A new voyage in one page load resets events to length 1 while the module-local
index keeps its old value. I expect this to be provable but to affect voyage 2+, not the
first voyage the tester measured. If the tester measured one voyage per room, this defect
CANNOT be in that 5/3 split, and a fix for it must not be credited with moving that number.

## What I will NOT accept as proof of the fix
Reading the new code. The claim is about control flow under interleaving, so the check
must RUN it with two events in the array and assert the sail's route was walked.
