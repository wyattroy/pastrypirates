# W7 remainder — run progress

**Branch:** `claude/cloud-handoff-planning-a9ay1u` · **Leads:** port-lead (this file's author), starboard-lead
**Scope:** W7's guest sail-route ride works ~5 times in 8. Finish it.

## ⚠ THE RUN HAS NO CREW, AND THIS IS THE FIRST THING A FRESH LEAD MUST KNOW

**port-lead's session has NO agent-spawning tool.** ToolSearch returns no `Task` and no `ListAgents`;
the only inter-agent tool present is `SendMessage`. So there is no builder, checker, tester or
sweeper to route work to, and no way to see whether starboard-lead is alive.

**Decision (port-lead, taken rather than stalling):** run the loop single-handed, with the same
evidence discipline the crew would have been held to — RED check written first, fix, same check
green, `npm test`, then a real two-browser crew game for the walked/slid split. The bridge has been
told the crew could not be raised. A run that stops to report a missing tool is the exact failure
this run already had today.

## The defect (already measured — do NOT re-measure it)
A tester drove two real crew rooms (host + guest Chromium, real Firebase) over 8 sails:
- guest **walked** the route on 5 sails (including a corner route matching the host)
- guest **slid** start→destination in one step on 3 sails, 2 of them corner routes
- red-proofed: on the clearest failure the guest's frame timeline was unbroken (225 frames /
  3954ms, no gap >60ms) and the drawn position changed exactly once. Host showed 17–35 steps on
  every sail, so the instrument reads both answers.

## The cause (named independently by a checker and by the tester; confirmed by reading)
`animateSailRoute()` — `src/ui/flow.js:1194` — derives what to walk from **the last event in the
array**, not from the event being consumed:

    const n=g.events.length; const last=g.events[n-1];
    if(!last||last.t!=="sail")return false;

On a guest, `watchEvents` (`src/orchestrator.js:1585-1605`) pushes each arriving event synchronously
then awaits `consumeEvent`. A second event landing while `consumeEvent` is parked on
`await animateRimSweepIfAny()` (`src/orchestrator.js:1572`) moves the tail, and the ride is skipped.
`src/engine/index.js:2776` emits a sail then calls `this.tradewind(p)` immediately, which can push
that second event before any drain runs.

**Host is not exposed the same way:** its three inline call sites (`src/ui/flow.js:2285`, `:2386`,
`:2587`) call `g.ev({sail})` and then `animateSailRoute()` with nothing in between, so the tail IS
the sail. That asymmetry is exactly the rule-23 fault: the two tiers disagree about what "the last
event" means.

## The sibling defect (same family)
`_lastRoutedEvIdx` (`src/ui/flow.js:1193`) is module-local and **never reset**. `beginGame`
(`src/orchestrator.js:2332`) builds a fresh `Game` and resets the other frontiers at `:2339` but not
this one, so "Play again" in the same page load silently drops the ride for whichever sail lands at
an already-ridden index. `_lastSweptEvIdx` (`src/ui/flow.js:1023`) has the identical defect.

## Status
- [x] Read TEAM.md, CLAUDE.md, the code, the gate. Gear = **FULL** (`node scripts/qa/gear.mjs`).
- [ ] Step 1 — RED check `scripts/qa/w7b_sail_route_frontier_check.mjs` (posed, no Firebase)
- [ ] Step 2 — the fix in `src/ui/flow.js` + `src/orchestrator.js` (one builder's worth of files)
- [ ] Step 3 — same check green, `npm test` exit 0 (53 gates)
- [ ] Step 4 — sweep: two real browsers, the same 8-sail host/guest comparison, new walked/slid split
