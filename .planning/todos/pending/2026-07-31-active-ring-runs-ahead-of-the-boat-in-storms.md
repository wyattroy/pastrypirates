---
created: 2026-07-31T18:15:00.000Z
title: The active-turn ring runs ahead of the boat during storm pushes
area: ui
severity: minor
files:
  - src/ui/board.js:463-468 (setShipGlideMs — retunes activeRing's transition)
  - src/ui/flow.js:531, :544, :563 (the ONLY callers — all inside the rim sweep)
  - src/ui/flow.js:569 windLeg / :722 botWindLeg (the storm paths — no ring retune)
---

## Problem

Wyatt, 2026-07-31: *"I thought the rings around the boat are now animated with the boat's movement,
but it doesn't look like that change got shipped. During a storm, the ring appears in the next square
before the boat. The ring should always be attached to the boat and move in sync."*

## The change DID ship — it is just scoped to the wrong half

The fix exists at `src/ui/board.js:463-468`:

```js
export function setShipGlideMs(seat,ms,ease){
  …
  shipEls[seat].style.transition=css;
  if(activeRing&&activeTurnSeat()===seat)activeRing.style.transition=ms==null?"":css;   // ← the ring fix
}
```

with a header comment recording exactly Wyatt's earlier report (*"the rings now move ahead of the
boat"*, `notes/tradewinds v5.mov`, 2026-07-31) and the reason: **`activeRing` carries no transition
of its own, so it SNAPS to each target while the ship eases toward it.**

**But `setShipGlideMs` is only ever called from the trade-wind rim sweep** — `src/ui/flow.js:531`,
`:544`, `:563`. The storm push runs through `windLeg` / `botWindLeg` (`src/ui/flow.js:569`, `:722`),
which move the ship via `renderLiveShips()` / `paintShipAt` and **never retune the ring.** So in a
storm the ring keeps its default snapping behaviour and lands on the next square while the boat is
still gliding — precisely what Wyatt is seeing.

So this is not "the change didn't ship". It is **the same defect in the path the fix didn't cover.**

## Fix shape

Give the storm push the same treatment the sweep already gets: retune the ring's transition to match
the ship's while a storm leg is animating, then restore it.

**The restore is not optional, and the reason is written into the code** (`src/ui/board.js:460-462`):

> *"The ring is only retuned while a sweep is in flight, and RESTORED to snapping afterwards. It must
> keep snapping normally: `render()` repositions it whenever the turn passes, and a ring that glided
> there would slide right across the board from the previous captain's boat to the next."*

A storm-path fix that forgets the restore trades this small desync for a much more visible one — the
ring sliding across the whole board at every turn hand-off. Mirror the sweep's
`setShipGlideMs(seat,null)` restore (`src/ui/flow.js:563`), including on the error/interruption path:
the sweep already does its restore in a `finally` so an interrupted animation cannot strand the
tuning, and the storm path needs the same guarantee.

Also confirm the **guest** view: the ring should track the boat for spectators too, not just on the
device driving the push.

## Note for whoever picks this up

Prefer a shared helper over a second copy of the retune logic. This bug exists *because* the
behaviour lived in one animation path and the other never got it — duplicating it again sets up the
identical failure the next time a third movement path is added.

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest.
