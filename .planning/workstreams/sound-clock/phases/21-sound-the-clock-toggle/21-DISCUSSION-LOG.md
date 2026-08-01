# Phase 21: Sound & the Clock Toggle - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-31
**Phase:** 21-sound-the-clock-toggle
**Workstream:** sound-clock (v1.3)
**Areas discussed:** Which sound / which moment, Sounds stacking up, The mute button, Timer off in solo & pass-and-play

---

## Which sound, which moment

### The six-sound mapping, and the coin flip

| Option | Description | Selected |
|--------|-------------|----------|
| All six as listed | Including a flip sound on every flip — the game's signature action | ✓ |
| Flip sound only in battles | Quiet for routine docking flips | |
| Let me go through them one by one | Reassign or drop specific sounds | |

**User's choice:** All six as listed.
**Notes:** Claude flagged that the coin flip is by far the most repeated action in the game and would either be the most satisfying sound or the first one muted. Wyatt accepted it on every flip.

### Moments with no sound file

| Option | Description | Selected |
|--------|-------------|----------|
| Leave them silent | Only the six moments make noise; nothing stretched to fit | |
| Reuse what fits | Borrow from the six where it genuinely works | ✓ |
| Silent for now, but note the gaps | Record a shopping list for Luis instead | |

**User's choice:** Reuse what fits.

### The exact borrowings

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, exactly that | All seven rows, win screen silent | |
| Yes, but find something for the win | Same rows; least-wrong sound at the win, flagged as a placeholder | ✓ |
| Trim it back | Keep only wind-push and trade | |

**User's choice:** Yes, but find something for the win.
**Notes:** Claude selected `store-ingredient.mp3` — at 5 KB the short, bright one, closest to a chime — and flagged it as a placeholder for Luis to replace. Claude had argued a sword clash or storm at the win screen would land badly; Wyatt agreed but did not want silence.

### Whose actions you hear

| Option | Description | Selected |
|--------|-------------|----------|
| Everyone's — the table is alive | Hear rival ships, battles, storms | |
| Only your own turn | Much quieter; a bot game becomes near-silent | |
| Everyone's, but storms once | Whole table, but storm fires once on arrival | ✓ |

**User's choice:** Everyone's, but storms once.
**Notes:** Wyatt selected this and said he wanted to add something in writing — which turned out to be the storm fade below.

### The storm fade *(raised by Wyatt, not asked)*

| Option | Description | Selected |
|--------|-------------|----------|
| Fade after a few seconds | Fixed stretch, independent of what's on screen | |
| Fade when the storm moment ends | Tracks the on-screen storm; length varies turn to turn | ✓ |
| Play in full, fade the tail | Truest to the recording, longest on screen | |

**User's choice:** Fade when the storm moment ends.
**Notes:** Wyatt raised this unprompted — *"storm sounds should fade out."* `storm.mp3` is 178 KB, far longer than the other five, so left alone it either drones past the moment or gets chopped off.

---

## Sounds stacking up

### Rapid repeats of the same sound

| Option | Description | Selected |
|--------|-------------|----------|
| Restart it each time | Each flip cuts the previous short — crisp, never muddy | |
| Let them layer | Copies overlap; a fast battle builds into a flurry | ✓ |
| Ignore while one's playing | Never busy, but some flips land silently | |

**User's choice:** Let them layer.

### The mix

| Option | Description | Selected |
|--------|-------------|----------|
| Storm sits quieter underneath | Backdrop, short sounds clear on top | ✓ |
| Everything at the same level | Truest to the files; storm + battle could crowd | |
| Storm quieter, and cap how many at once | Ceiling of ~6 layered sounds | |

**User's choice:** Storm sits quieter underneath — deliberately without a cap.

### Background tabs

| Option | Description | Selected |
|--------|-------------|----------|
| Go quiet in the background | Stops on switching away, resumes on return | ✓ |
| Keep playing | Doubles as a "your turn is coming" cue | |
| Keep playing, but only your turn starting | Quiet except the call back to the table | |

**User's choice:** Go quiet in the background.

---

## The mute button

### Is muting remembered

| Option | Description | Selected |
|--------|-------------|----------|
| Remember it | Sticks across games and reloads, like the timer setting | ✓ |
| Fresh each game | Sound always returns; muted players re-mute every time | |
| Remember it, per browser not per captain | Same, made explicit for shared computers | |

**User's choice:** Remember it.

### The icon

| Option | Description | Selected |
|--------|-------------|----------|
| New speaker icon | Drawn in the game's style, blocked-slash when muted | ✓ |
| Reuse the horn | No new art, but `horn.png` already renders 📯 in narration | |
| Plan it now, art later | Placeholder so behaviour finishes without waiting on art | |

**User's choice:** New speaker icon.
**Notes:** Adds a small art dependency to the phase. Claude checked the icon set first — no speaker, sound, mute or volume icon exists today.

### Where it lives

| Option | Description | Selected |
|--------|-------------|----------|
| Every mode, during play | Beside the clock, all three modes | ✓ |
| During play, and on the welcome screen | Mute before any sound plays; needs a second home | |
| Every mode, and it survives into the win screen | Silenceable during the celebration | |

**User's choice:** Every mode, during play.
**Notes:** Claude flagged the consequence — the clock panel hides at end of voyage, so the button disappears at the win screen. Mute still holds; it just can't be changed there. Accepted rather than treated as a defect.

---

## Timer off in solo & pass-and-play

### Switching the timer off mid-turn

| Option | Description | Selected |
|--------|-------------|----------|
| Stops immediately | Countdown halts at once; current player un-timed | ✓ |
| Finishes the current turn first | No rule changes mid-move, but the switch appears inert | |
| Stops immediately, and switching back on re-arms | Instant stop plus a fresh clock on re-enable | |

**User's choice:** Stops immediately.

### Switching back on mid-turn *(follow-up correction)*

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, re-arm it | Matches multiplayer; avoids re-creating the freeze bug | ✓ |
| No, wait for the next turn | Safer-sounding, but the shape that caused the original freeze | |

**User's choice:** Yes, re-arm it.
**Notes:** Claude's wording on the previous question was imprecise — it described "stops immediately" as identical to multiplayer, when multiplayer *also* re-arms on switch-on. Claude flagged this rather than plan a silent regression: without the re-arm, solo and pass-and-play would reintroduce the *"I paused the timer and then the game wouldn't continue"* bug (fixed in multiplayer at `src/orchestrator.js:210-216`). Wyatt confirmed full parity.

### Remembering the timer setting

| Option | Description | Selected |
|--------|-------------|----------|
| Remembered, like today | "On by default" governs a player who's never touched it | ✓ |
| Back on every new game | Strictest reading; muted-clock players re-toggle every game | |
| Remembered in solo, fresh in multiplayer | One player's habit doesn't impose on a fresh table | |

**User's choice:** Remembered, like today.
**Notes:** Raised because Wyatt's own two rulings were in tension — "keep it on by default" versus code that already persists the choice. Resolved in favour of consistency across all three switches (timer, mute, pause).

---

## Claude's Discretion

- Exact fade curve and duration for the storm fade-out, so long as it tracks the on-screen moment and never hard-cuts
- The volume the storm sits at underneath the short sounds
- The mechanism for the local non-Firebase timer path — parity is the constraint, not structure
- Whether any of the six files needs loudness normalising
- Which of the six is least-wrong as the win-screen placeholder (Claude chose `store-ingredient.mp3`)

## Deferred Ideas

- A purpose-made victory sound from Luis — the win-screen placeholder is not a decision to keep it
- Sound files for the moments still borrowing or silent: shipwreck, running aground, fleeing, the win
- N-02 red urgency animation and N-04 wider parity sweep — already assigned to v1.4
- Muting from the welcome screen — considered and rejected for this phase
- A "your turn" cue that survives a background tab — considered and rejected
