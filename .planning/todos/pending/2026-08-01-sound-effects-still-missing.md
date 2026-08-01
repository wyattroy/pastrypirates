---
created: 2026-08-01T05:00:00.000Z
title: Sound effects still missing after Phase 21 — the shopping list for Luis
area: audio
severity: minor
files:
  - src/ui/audio.js (EVENT_SOUND mapping, WIN_SOUND_PLACEHOLDER, SHOTCLOCK_SOUND_PLACEHOLDER)
  - src/orchestrator.js (asyncBattle — the battle-sound timing issue below)
---

## Why this exists

Phase 21 shipped sound using the **six** files Luis made. The game has **25** distinct moments.
That gap was closed three ways — some moments borrow another sound, some stay deliberately silent,
and two use an openly-flagged placeholder. This file records every one of those compromises so none
of them quietly becomes permanent by being forgotten.

Wyatt asked for three new sounds on 2026-08-01 after playing it. Those are at the top.

---

## 1. Wyatt asked for these (2026-08-01)

| Sound | For | Notes |
|---|---|---|
| **Wind** | Requested outright. The wind is the game's central mechanic and currently makes no noise at all — the compass turns in silence. | Likely wants to cover `tradewind` (the wind changing) and possibly sit under `windmove` (being pushed). Worth deciding whether it's a one-shot gust or an ambient bed like the storm. |
| **Cannon** | Battles. Alongside or instead of `battle-swords`. | Sword clash reads as boarding; a cannon reads as the opening broadside. See the timing note in §4 — these two may want to be *different moments* of the same fight rather than alternatives. |
| **New round starting** | `newround` is silent today unless a storm arrives. | A round boundary is a natural beat — the closest thing the game has to a "chapter break". |
| **Your turn** | `turn` is silent today. | Distinct from the above: this one is *personal*. Worth deciding whether it plays for every captain's turn or only yours — Phase 21's D-07 rule is "you hear the whole table", but a your-turn cue is arguably the one exception, since its whole job is to single you out. |

---

## 2. Placeholders currently shipping — flagged in code, not final

Both are named constants in `src/ui/audio.js`, so replacing them is a one-line change each.

| Moment | Currently plays | Why it's wrong |
|---|---|---|
| **Winning the game** | `store-ingredient.mp3` (`WIN_SOUND_PLACEHOLDER`) | Nothing in the six sounds like victory. This is the shortest, brightest one — the closest thing to a chime, and that's the entire justification. A real fanfare is wanted. |
| **Running out of time** | `battle-swords.mp3` (`SHOTCLOCK_SOUND_PLACEHOLDER`) | Nothing in the six is an alarm. Sword clash was chosen as "short, percussive, unmistakably adverse". A real timer alert is wanted. |

---

## 3. Moments borrowing another sound

These work, but each is a sound doing a job it wasn't recorded for. Listed so a future pass can
replace them deliberately rather than discovering them by surprise.

| Moment | Borrows | Would prefer |
|---|---|---|
| Wind pushes your boat (`windmove`) | `ship-move` | Possibly the new wind sound |
| A trade completes (`trade`) | `store-ingredient` | Fine as-is, arguably — crates do change hands |
| Running aground (`aground`) | `storm` | A wooden scrape / crunch |
| Shipwrecked (`shipwrecked`) | `storm` | Something final — this is a dramatic moment playing generic weather |
| Fleeing a battle (`battleflee`) | `battle-swords` | Oars, a retreat, something cowardly |
| Dodging (`dodge`) | `battle-swords` | A whoosh / near-miss |
| Anchor holds in a storm (`anchorHold`) | `fishing` | Chain and strain |

## Moments deliberately silent

`blocked`, `moored`, `parley`, `sidebet`, `bakeoff`, `end`, `finish`, and `tradewind` — plus
`newround` and `turn` until §1 lands. `parley` and `sidebet` are silent **on purpose** (a parley is
an offer, not a deal; sidebets are already suppressed in narration to avoid duplicate lines) and
should stay that way unless Wyatt says otherwise.

---

## 4. Not a missing sound — a timing defect worth fixing with them

**The battle sound plays at the END of a fight, not the beginning.** Wyatt reported this on
2026-08-01: *"the attack sound should be triggered at the beginning of the battle — not the end."*

Cause, confirmed in source: the sound hangs off the `battle` event, and that event is only emitted
once the whole fight has resolved — rounds fought, winner decided, spoils taken
(`src/orchestrator.js:655`, and `src/engine/index.js:581` for the headless path). By the time it
plays, the fight is over.

The fix does **not** need an engine change. `asyncBattle()` already has a natural opening beat at
`src/orchestrator.js:438` — the `⚔️ X attacks Y!` announcement, fired before side bets and before
the first flip. A sound call there plays at the right moment.

This is also where the cannon most likely belongs: **cannon at the opening broadside, swords when
the fight resolves.** Two sounds, two moments, one fight — rather than choosing between them.

**Still unexplained:** Wyatt also reported hearing *no* battle sound at all when a bot attacked him.
The code path should have fired it. Not reproduced yet — needs a live session with a bot-initiated
battle to confirm whether the sound is genuinely absent or merely so late that it reads as absent.

---

**Source:** Wyatt, 2026-08-01, after playing the Phase 21 build (Safari pass cleared).
**Related:** `.planning/workstreams/sound-clock/phases/21-sound-the-clock-toggle/21-CONTEXT.md`
(decisions D-01…D-06, D-21, D-22 are the mapping this file records the gaps in).
