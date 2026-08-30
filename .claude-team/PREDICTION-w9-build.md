# W9 BUILD — what I expect, written BEFORE I change a line

Both gates are red on the current build (verified first, output in the session log).

## What I expect to be true

1. **The storm's rim ride.** `src/engine/index.js:469` steps onto the rim and sweeps in one
   breath. Emitting a `windmove` AT `nx` before `tradewind(p,true)` — exactly the shape
   `rimEscape` (`:826`) already uses — will put the entry square in the stream, and gate 1's
   storm leg will go green **on the guest's own route**, which deletes the host's need for the
   reconstructed-entry hatch at `src/ui/flow.js:1326-1328`. Rule 23: I delete the hatch, I do
   not give the guest one.

2. **`animateRimSweepIfAny` must become `animateSailRoute`'s twin** — take the event, remember
   rides by WeakSet identity. I expect the previous event still has to be found (the ride's
   `from` lives in the prior snapshot), and I expect to find it by **identity**
   (`g.events.indexOf(ev)`), not by a handed index, so no caller can mean a different event.

3. **The flee.** The event needs a seat (`p`) as well as a route, and the battleflee emit has to
   move to BEFORE `tradewind(def)` so the rim entry is recorded. I expect `animateSailRoute`'s
   `t!=="sail"` refusal to have to widen to "any event carrying a baked route" — the
   presentation lane is the route, not the event's name.

## What would prove me WRONG

- **If emitting at the rim entry changes what the game DOES** — a rule reading the new event, a
  different `r()` draw, a bot deciding differently — the fix is wrong however green the gate.
  `npm test` (54 gates), the determinism/baseline gates and `mode_fork_check` are the falsifier.
- **If moving the battleflee emit before `tradewind` reorders a stream something replays** — the
  scrubber, `q18_narr_event_order_check.mjs`, or a narration gate — then the emit must move
  differently (a separate entry event) rather than be relocated.
- **If widening `animateSailRoute` past `t==="sail"` makes some OTHER event walk a route it
  should not** — i.e. anything else in the tree bakes a `draw.route` — the widening is wrong and
  the flee must emit its own kind instead.
- **If gate 1's storm leg goes green but leg 2 (the host/guest divergence) stays red**, my read
  of who reaches which animator is wrong.
- **If leg C of the flee gate holds the gate red after the fix**, I say so out loud rather than
  touching the gate — it is evidence about the boards, not a verdict about code.

## Sizing, plainly
A fleeing ship is nearly a full sail — 3.93 squares on average, and 13.3% of them are currently
drawn straight through an island. This is the same picture problem the sail fix solved, at the
one place it never reached, plus a storm ride the guest has never once seen.
