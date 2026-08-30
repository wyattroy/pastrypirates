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

## Status at the two-browser handoff (port-lead, 2026-08-30)

- [x] **Step 1 — shown broken.** `scripts/qa/w7b_sail_route_frontier_check.mjs`, posed, no Firebase.
      It drives the guest's real door (`consumeEvent`) and counts how many positions the boat is
      actually painted at — the same signal the tester read off two real rooms. On the shipped code:
      A control (sail at the tail) WALKED at 42 positions / 727ms; **B (a later event landed behind
      the sail) SLID at 2 positions / 16ms**; **C (second voyage, sail on the index the last voyage
      rode) SLID**. My first cut of C passed and proved nothing — it aimed at
      `old.events.length-1`, which case B never advanced because B is a dropped ride. Fixed to take
      the frontier from a ride that actually happened. A case that cannot fail is not a case.
- [x] **Step 2 — the fix.** `animateSailRoute(ev)` now rides **the event it is handed**, and the
      re-entry guard is a **WeakSet of ridden events** instead of a module-local index.
      `Game.ev` returns the event it pushed (`src/engine/index.js`) so a call site can hold its own
      event instead of reaching for the top of the pile; `consumeEvent` passes `e`
      (`src/orchestrator.js`); the three host turn-loop sites pass the sail they just emitted
      (`src/ui/flow.js`). No guest-only branch — rule 23 holds, and it holds harder than before:
      "no argument" used to mean the sail on the host and whatever landed last on a guest.
      The WeakSet also deletes the sibling defect outright — a new voyage's events are new objects,
      so there is no frontier for anyone to remember to reset.
- [x] **Step 3 — green.** Same check, all three cases WALKED (39-43 positions / ~710ms each).
      `npm test` exits 0 at 54 gates.
- [x] **Red-proofed DOWNWARD, both instruments.** Reinstating only the tail-derivation turns B red
      (2 positions / 16ms) while A stays green. Separately, smuggling `o.sneaky=1` in after the
      push turns the re-anchored q18 gate red.
- [ ] **Step 4 — the sweep.** Two real browsers, the same 8-sail host/guest comparison. Requested
      from the bridge; baseline to beat is 5 walked / 3 slid.

### Two things a fresh lead must not lose

1. **`q18_narr_event_order_check.mjs` was re-anchored, and it had to be.** It matched
   `ev(o){...this.events.push(o);}` — literally requiring the function to END on the push. Adding
   `return o;` broke the match, and it did not report "ev() changed shape": it reported
   `body:false` and therefore *missing: every field*, which reads as the determinism corpus having
   been torn up. It now brace-matches the whole body, which is **strictly stronger** — the old
   anchor stopped reading at the push, so `this.events.push(o); o.sneaky=1;` would have been
   emitted and invisible to it. Red-proofed with exactly that.
2. **Two checks now cover this defect and only one is in `npm test`, on purpose.**
   `w7_route_derivation_check.mjs` (node-only, ~1s, fresh module per case) is registered — it
   proves the DECISION. `w7b_sail_route_frontier_check.mjs` needs chromium and ~50s, so it is not
   in the suite; it proves the PICTURE, which a stubbed module cannot see. Run it at gear time.
   **If it stops being run it will rot** — that is the known cost of keeping it out.
