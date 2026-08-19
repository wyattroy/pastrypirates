---
id: audio-defects-and-sourcing
title: Three live audio defects, 22 sounds chosen and unwired, 3 slots still open
status: pending
type: defect + gap
severity: high
area: audio
created: 2026-08-19
source: Wyatt's audio audit, 2026-08-19 ("be a AAA game sound designer, and do an audio audit")
resolves_phase: null
regression: true
supersedes: 2026-08-01-sound-effects-still-missing.md
files:
  - 4/src/ui/audio.js (EVENT_SOUND duplicate key, SFX_VOLUME, initAudio)
  - 4/src/engine/index.js:463 (states the intent the code contradicts)
---

## Everything is written up — do not re-derive it

**Read [`docs/AUDIO.md`](../../../docs/AUDIO.md) first.** It holds the evidence, the measurements,
the sourcing traps and the open questions in full. This file exists so the work is on the backlog
and cannot get lost; it deliberately does not repeat what that document says.

Wyatt's own audition verdicts — the only aesthetic judgement in the record —
are [`.planning/research/audio-sourcing/PICKS.json`](../../research/audio-sourcing/PICKS.json).
The tooling that found them is beside it.

## Why this is `high` and marked a regression

**One of the game's six sounds cannot play, and the failure is making the game louder rather than
quieter.** `EVENT_SOUND` lists `anchorHold` twice; the second entry silently overwrites the first,
so `fishing.mp3` is unreachable and dropping anchor instead fires the **8-second storm bed at
roughly 3× its intended level, once per ship that anchors**, with nothing able to fade it. Arrived
in `0d3a71c` and was copied verbatim into `/3` and `/4`.

**One deleted line fixes both.** That is the smallest, highest-value change on this list.

## The order to do it in

0. **Do not trust the green tick.** `npm test` passes today. `scripts/audio_mapping_test.js` never
   mentions `anchorHold` or `fishing`, and nothing checks the literal for duplicate keys — so the
   suite is structurally incapable of failing on the defect below. Add both assertions and watch
   them go red *before* fixing anything.
1. **Delete the duplicate `anchorHold` line.** Fixes the dead sound and the runaway storm together.
2. **Fill in `SFX_VOLUME`** — six numbers, table in `docs/AUDIO.md` §1. Every value is still the
   untouched default of `1`, and the spread across the six stems is 15.6 dB.
3. **Give `storm`, `testhold` and `rewatch` explicit entries.** They are silent by accident today,
   which this file's convention treats as a bug in its own right.
4. **Re-export `battle-swords`** — it is clipped in the file itself, so turning it down does not fix
   the distortion. This one is for Luis.
5. **Wire the 22 chosen sounds** from `PICKS.json`.
6. **The drumroll.** `orchestrator.js:1078` already says `await flash("Drumroll...")` and plays
   nothing. Exact 2.55s window, derived in `docs/AUDIO.md` §3.

## Still needs Wyatt, not a session

- **3 slots awaiting his verdict** on the round-3 gallery (drumroll, clash, bowl-lift). Links in
  `docs/AUDIO.md`.
- **2 slots for ElevenLabs** — a ship's bell and "your turn". Two rounds of searching found nothing
  in any free library.
- **Three open design questions**, listed in `docs/AUDIO.md` §4. The one that blocks code: a
  "your turn" cue only works if it plays for the reader alone, which breaks the standing
  hear-the-whole-table rule (D-07). **Do not decide that one without him.**

## Before adding music

`initAudio()` awaits *every* file before *any* sound can play. Adding a music bed to that list would
silence every sound effect in the game until the music finished downloading. See `docs/AUDIO.md` §3,
along with the looping fix (`loopStart`/`loopEnd`, not a bigger file format).
