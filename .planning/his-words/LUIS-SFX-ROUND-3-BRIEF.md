# For Luis — round 3 of the Pastry Pirates SFX

**Wyatt asked for this file to exist, in those words:** *"write this note somewhere durable to give
luis for the next round of his sfx"* (2026-09-06, PRD comment box `s4`). It is the standing list of
what is still missing after round 2, so nothing has to be reconstructed from a chat log next time.

## What round 2 left unfilled

### 1. NEW DAY — currently silent, deliberately

**Wyatt, verbatim:** *"New Day should use nothing right now; eventually it might use a wind whoosh
or a weather vane creak (because the wind changes direction every day)."*

- The wind genuinely changes direction each day in the game, so the cue has a real thing to
  represent — this is not decoration.
- **Two candidate directions, his words:** a **wind whoosh**, or a **weather-vane creak**.
- Round 2's `PP_SFX_Bells.mp3` was assumed to be this. **It is not** — Wyatt reassigned Bells to
  "your turn". New Day has no file and plays nothing until one exists.

### 2. "YOUR TURN" — filled by a reassignment, not by a dedicated file

`PP_SFX_Bells.mp3` now covers it, by Wyatt's ruling. A purpose-made cue could still be better: it
fires often, per player, and a ship's bell may prove too heavy at that frequency. Not a request yet
— flagged so round 3 can consider it.

### 3. THE TURN-TIMEOUT BUZZER has a file and no game to play it in

`PP_SFX_Alarm.mp3` is the buzzer for a turn timer running out. **Wyatt: *"This is not built into the
current game though."*** The file is fine; the feature does not exist. Nothing needed from Luis.

## Settled in round 2 — do not redo these

| | |
|---|---|
| **The swords** | **Not clipped, per Luis's own ruling**, which Wyatt accepted over this project's own measurement. **Use the latest clip available.** |
| **The coin flip** | **Closed.** Wyatt fixed the flip's duration in code; the existing single file is correct. `PP_SFX_CoinFlip_Start` / `_End` are NOT needed. |
| **The ambience** | Luis's own spec, quoted by Wyatt: *"for the ambient, I got you the looping ocean + seagull and creak clips. You'll need to come up with a randomizer for these clips. also randomize the stereo placement as you play them"* — the randomiser is this project's job, not Luis's. |
| **WAV deliveries** | MP3 only in the game. Any WAV gets converted on this side; the 2.8 MB ocean `.wav` never ships. |
