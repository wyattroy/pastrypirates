# W7 — PROGRESS. Written so a fresh lead with zero context could take over from this file alone.

Branch `claude/cloud-handoff-planning-a9ay1u`. **Never push to `main`** — it is production, served
to real players the moment it moves.

## The item
The guest's boat slid straight across the islands instead of walking the route the engine chose.
W7 put the route on the wire; a tester then measured the fixed build in two real crew rooms and
found it worked on **5 sails in 8** — 3 still slid, 2 of those 3 corner routes.

## The cause, and it is a RACE, not a wrong constant
`animateSailRoute()` took no parameters and read `g.events[g.events.length-1]`, while its callers
each consume a SPECIFIC event:
- guest — `src/orchestrator.js` `watchEvents`: the Firebase callback pushes its event and sets
  `evIdx` before its first `await`, then awaits `consumeEvent(e)`. Firebase does not await that
  callback, so the next event's callback pushes while the first is suspended.
- host — `src/ui/panel.js` `liveRender`: the drain starts every unconsumed event **without
  awaiting**, so a whole burst sees the same `events[n-1]`.
Anything landing behind a sail therefore made `last.t!=="sail"` and the ride was skipped.
Second defect, same root: the re-entry guard compared a module-local index against `n-1`, an array
POSITION, so a second voyage in one page load could refuse a brand-new sail.

## The fix (port-lead's builder, committed)
`src/ui/flow.js` — `animateSailRoute(ev)` now takes the event being drawn, and the guard is a
`WeakSet` of ridden events rather than an index. `appState.evIdx` was no escape: both call sites
set it to `events.length-1`, so it carries the identical race.

## Verification — what is DONE
- `npm test` **exit 0, 54 gates** (baseline before the work was exit 0 / 53 gates / 307 PASS).
- Defect reproduced by RUNNING the pre-fix walker, not by reading it: a sail consumed with a later
  event at `events[n-1]` returned no ride; the second sail of a two-sail burst returned no ride.
- `scripts/qa/w7b_sail_route_frontier_check.mjs` **red-proved DOWNWARD three ways**, each on a
  scratch copy at `/tmp/.../scratchpad/redproof` so the shared working tree was never broken:
  1. derivation reverted to `events[n-1]` → case B red (boat painted at **2 positions in 16ms**
     against **43 over 710ms** for the same sail at the tail); A and C stay green.
  2. `WeakSet` swapped back for the index guard → case C red; A and B green.
  3. `return false;` as the walker's first line — the break that walked past an earlier TEXT draft
     → the gate ABORTS, **exit 2**. It does not silently pass.
- That gate gained a `--tree=` flag so this red-proof is repeatable without breaking the tree.

## Verification — what is NOT DONE (do not report the item closed without it)
- **The crew re-measure.** Every gate above is SOLO, one browser. The 5/3 baseline came from two
  real crew rooms and nothing green so far reproduces that setting.
  `scripts/qa/w7b_crew_sail_measure.mjs` (new) runs a real host+guest Firebase room, counts painted
  ship positions per sail on BOTH sides, names the slid routes, keeps a NOT-OBSERVED column and
  writes matched host/guest screenshots. **Running now; result not yet in.**
- No CEO verdict has been appended to `.planning/CEO-REVIEWS.md` for this item yet.

## Open question — Q-22 in `.planning/CTO-QUESTIONS.md`
Two gates guard one thing and only the weaker runs. `w7_route_derivation_check.mjs` (mine, in the
chain) can only see that the walker RETURNED true — under a stubbed browser every ship painter
early-returns, so it cannot see the boat move. The browser gate that counts painted positions is
NOT in the chain. Recommend swapping; it is a call about putting the first browser gate into
`npm test`, so it is not mine to make alone. **Not blocking.**

## Claim I am NOT making
That a two-sail burst occurs in a real voyage. My node gate asserts it as robustness; I never
measured it happening. It must not be reported as a fixed bug.

## Operational
starboard-lead has **no `Task`/`ListAgents` tool** in this session — it cannot spawn a checker,
tester or sweeper, and `SendMessage` to `port-lead` returns "no agent reachable". Verification is
therefore being run directly by starboard-lead. The **sweeper pass has not happened**: the sibling
worth checking is the trade-wind rim sweep (`animateRimSweepIfAny`), whose `_lastSweptEvIdx` guard
is the same position-based shape the WeakSet just replaced here.
