# Phase 13: Multiplayer Turn Clock - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-25
**Phase:** 13-multiplayer-turn-clock
**Areas discussed:** The stall (CLOCK-01), Multiplayer pause, Who can pause, Clickable PAUSED image

---

## The stall (CLOCK-01)

Diagnostic questions (no fixed options — capturing observed behavior):

| Question | User's answer |
|----------|---------------|
| When did it stall? | Right at game start |
| Did the timer off→on toggle unstick it? | "I only had to toggle it off, then on again, for the game to proceed as normal" |
| How often? | (Pivoted to report a different bug instead) |
| Players in stalled games? | Mix of humans + bots |

**Live re-testing during discussion:**
- Chrome: clock started perfectly, no stall.
- Safari (first try): timer STARTED in the "off" state; game played normally. Wyatt hypothesized stale local session state from the pre-refactored version.
- Safari (after clearing site data via Settings → Privacy → Manage Website Data): clock started up normally.

**Conclusion / choice:** CLOCK-01 is stale-local-state fallout, not a live code bug.

| Framing option | Description | Selected |
|--------|-------------|----------|
| Harden against stale state | Detect/clear/migrate stale local session data on boot so returning old-version players start clean | ✓ |
| Keep hunting the code bug | Assume a genuine first-turn clock bug remains and chase it | |
| Let me test first | Run clean-slate Safari test before deciding | (did this, then chose "Harden") |

**User's choice:** Harden against stale state (Option 1), after confirming clean slate works.

---

## Multiplayer pause — what pause does

| Option | Description | Selected |
|--------|-------------|----------|
| Freeze everything | True pause stopping the whole game incl. bots mid-play until resume | ✓ |
| Just stop the timer | Re-use ⏱ on/off toggle as "pause"; bots keep playing | |
| You decide | — | |

**User's choice:** Freeze everything.

## Multiplayer pause — controls

| Option | Description | Selected |
|--------|-------------|----------|
| Add pause, keep timer toggle | MP gets ▶/⏸ pause AND keeps ⏱ on/off toggle | ✓ |
| Pause replaces timer toggle | Drop ⏱ toggle in MP, use only ▶/⏸ | |
| You decide | — | |

**User's choice:** Add pause, keep timer toggle.

---

## Who can pause

| Option | Description | Selected |
|--------|-------------|----------|
| Anyone, anytime | Any player pauses/resumes at any moment, even off-turn | ✓ |
| Anyone, but resumer = pauser | Any player pauses; only the pauser can resume | |
| Only on your turn | Pause only during your own turn | |

**User's choice:** Anyone, anytime.

## On resume — countdown behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Picks up where it left off | Remaining seconds preserved (matches solo) | ✓ |
| Restarts fresh 30s | Full new 30s on resume | |

**User's choice:** Picks up where it left off.

---

## Clickable PAUSED image — click target

| Option | Description | Selected |
|--------|-------------|----------|
| The whole clock panel | Entire turn-clock box clickable to resume | |
| Just the pause symbol | Only the large pause symbol in the clock is clickable | ✓ |
| A big PAUSED overlay | New large PAUSED image/overlay over the board | |

**User's choice:** Just the pause symbol.

## Clickable PAUSED image — where it applies

| Option | Description | Selected |
|--------|-------------|----------|
| Both solo and multiplayer | Consistent everywhere pause exists | ✓ |
| Multiplayer only | Wire only for MP | |

**User's choice:** Both solo and multiplayer.

---

## Claude's Discretion

- Exact stale-`localStorage` detect/clear/migrate strategy on boot (subject to version-guard caution).
- Precise Firebase sync shape for the pause flag (mirror the `timerOff` host-authoritative pattern).

## Deferred Ideas

Filed to `.planning/REQUIREMENTS.md` Future Requirements (out of scope for Phase 13):
- **LOAD-01:** Slow-connection boot reveals game before assets are ready (6s cap too aggressive).
- **LOAD-02:** Preload set omits icons/badges/compass/clock (~18 MB total download).
- **LOAD-03:** Welcome screen must be the instant default; load the ~18 MB game assets only after the player chooses to play, showing the "hoisting the sails" loader at that point.
