---
created: 2026-08-01T12:00:00.000Z
title: Guest battle sound fires on data ARRIVAL, not on render — it drifts
area: multiplayer
severity: major
files:
  - src/orchestrator.js:366 (watchBattle — the guest's trigger, a DATA callback)
  - src/orchestrator.js:455 (the host's trigger, a code seam)
  - src/ui/panel.js:252 / src/orchestrator.js:1060 (playForEvent — the CORRECT pattern)
---

## Problem

Wyatt, 2026-08-01: *"battle start sound not played at correct time for guests. This is a drift issue
that needs an architectural fix, not a patch."*

He is right that it is architectural, and the codebase already contains the correct pattern — battle
is the one place that departs from it.

## The two trigger paths

**Every other sound is bound to the RENDER of its event**, on both sides:

```js
render();
playForEvent(e);   // src/ui/panel.js:252  (host)
                   // src/orchestrator.js:1060 (guest's mirror)
```

Sound and picture come out of the same step, so they cannot drift by construction.

**The battle engage sound does not:**

| | Trigger | Bound to |
|---|---|---|
| Host | `playBattleEngage()` at the battle-opening seam (`src/orchestrator.js:455`) | its own code executing |
| Guest | `playBattleEngage()` inside `watchBattle()`'s Firebase callback (`src/orchestrator.js:366`) | **the message ARRIVING** |

Those are two independent clocks. The guest's fires the instant the battle node lands in Firebase —
which is network latency away from the host's, and, worse, is unrelated to where the guest's own
rendering has got to. A guest still finishing an earlier narration line hears the clash before it
sees anything.

## The rule this should follow

> **A sound is bound to the RENDER of the thing it describes — never to the arrival of the message
> announcing it.**

That is already how `playForEvent` works. Battle should be made to obey it rather than given a
compensating delay: move the guest's `playBattleEngage()` out of `watchBattle()`'s data callback and
into whatever paints the battle scoreboard, so the sound is emitted by the same step that draws.

**A latency estimate or a timed offset is the wrong fix** and should be rejected if proposed: it
would make the average case better and leave the variance, which is what a player actually notices.

## Check the same shape elsewhere while in here

`watchBattle` is not necessarily the only watcher that triggers a side effect from arrival rather
than from render. The other `watch*` callbacks (`watchNarr`, `watchFlip`, `watchClock`,
`watchDraftPrompt`) are worth a read against the same rule — this is a class, not an instance.

**Source:** Wyatt, 2026-08-01, multiplayer playtest.
