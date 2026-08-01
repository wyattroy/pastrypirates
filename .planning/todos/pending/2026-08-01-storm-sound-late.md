---
created: 2026-08-01T13:40:00.000Z
title: The storm sound plays, but late — it should land the instant the round starts
area: audio
severity: minor
files:
  - src/ui/panel.js:252 (liveRender -> playForEvent, the trigger)
  - src/ui/audio.js:119 (soundForEvent — keyed on newround + storm)
  - src/orchestrator.js:851-855 and 877-881 (the two newround emit sites)
---

## Report

Wyatt, 2026-08-01: *"the storm sound came!! It just came too late — it should happen IMMEDIATELY
when the round starts."*

So the mapping and the mute/volume work is all correct. This is purely **when** it fires.

## What is already ruled out

- **Not a lazy load.** `initAudio()` preloads all six files with `await Promise.all(SFX_FILES.map(loadOne))`
  (`src/ui/audio.js:208`). An un-decoded buffer would make `play()` return silently, not late.
- **Not the mapping.** `soundForEvent` matches the pair `e.t === "newround" && e.storm`
  (`src/ui/audio.js:119`), which is deliberate — keying on `e.storm` alone would fire it once per
  captain for the whole round (D-08).
- **Not the emit order.** Both live sites set `stormNow` before `ev()` (`src/orchestrator.js:853`
  then `:855`, and `:879` then `:881`), and `ev()` stamps `o.storm=this.stormNow`
  (`src/engine/index.js:233`).

## Where to look

The trigger is `playForEvent(e)` inside `liveRender()` (`src/ui/panel.js:252`), which reads
**`events[events.length-1]`**. That fires immediately after the newround event is recorded — so on
paper it is already immediate.

Two candidates worth measuring before changing anything:

1. **Another event lands between the newround emit and the render**, so `events.length-1` is no
   longer the newround event when `playForEvent` runs, and the storm cue only fires on a later
   `liveRender()` pass. This would explain a consistent, bounded delay.
2. **The perceived start of the round is not the newround event.** The storm banner is narrated
   through `flash()`, which awaits the typewriter and the hold. If the sound is correct relative to
   the event but the *visual* arrives earlier or later, the mismatch reads as the sound being late.
   Worth establishing which of the two the player is actually anchoring to.

**Measure it, do not guess** — this is exactly what the headless harness is for
(`docs/DRIVING-THE-GAME.md` §8a). Log the timestamps of: the newround `ev()`, the `playForEvent`
call, the storm banner's first painted character. The gap between them names the bug.

**Related, same family:** `2026-08-01-guest-battle-sound-fires-on-arrival-not-render.md`. Both are
"a sound is not landing with the thing it describes." Fix them with one rule, not two patches.

**Source:** Wyatt, 2026-08-01.
