---
id: pause-cannot-beat-end-of-turn-expiry
title: Pausing in the final ~1 second of a turn does not save the turn
status: pending
type: bug
severity: low
area: multiplayer
created: 2026-07-31
source: The 2026-07-31 session that closed Phase 13's checks 2 and 3; recorded there as `phase: post-audit-findings` in `.planning/v1.2-MILESTONE-AUDIT.md`
resolves_phase: null
regression: false
accepted_by: Wyatt, 2026-07-31, deferred to the v1.3 backlog rather than fixed inside the closing v1.2 audit
---

## What happened

Wyatt paused from the host with roughly one second left on the shot clock. The turn expired anyway,
the "too slow" penalty was applied, and play continued. The pause did not take effect in time to
prevent any of it.

**Pausing in the final ~1 second of a turn does not save the turn.**

## Suspected cause — a code read, not an isolated test

Everything in this section is **suspected**. It came from reading the source after the fact. It was
never isolated with a test, and no instrumented run has confirmed the ordering below.

`togglePause` (`src/orchestrator.js:176-182`) writes the flag to Firebase via `netSetPaused` and
changes nothing locally. The host applies the pause only when `watchPause`'s callback fires on the
round-trip (`src/orchestrator.js:186-200`), and that callback is what calls `applyPauseState` —
which is what clears the countdown interval. Meanwhile `shotClockTick` (`src/ui/util.js:1292-1298`)
runs locally on its own 500ms interval and reaches the 30000ms expiry independently of all of that.

So the suspected shape is a window at the end of every turn that a pause cannot beat: roughly one
Firebase round-trip plus up to one 500ms tick.

The only round-trip figure actually measured in this project is **116ms** — the `+116ms` line of
Phase 13's Run 2 trace in `13-VERIFICATION.md`, where the host's `broadcastClock` re-broadcast
carried `paused=true` after a guest's click. That is **one sample, one session, one network**. It is
not a characterisation of the round-trip, and the suspected window has never been measured directly.

## Impact, at its real size

One coin moves under the documented "too slow" penalty, and one turn is lost. No state corruption,
no crash, no determinism impact, no desync — play continues normally and the position is fully
recoverable.

That is why severity is `low`, said here so the rating does not read as arbitrary. The argument for
raising it is about feel rather than effect: the player acted deliberately to prevent the penalty
and was penalised anyway. Wyatt can raise it on that argument.

## Not a regression, and not a Phase 13 failure

Before CLOCK-02 there was no multiplayer pause at all, so there is no prior behaviour to have
regressed from. This is a limit of a new capability, not a break of an old one.

Phase 13's checks 2 and 3 both **passed**. This was found alongside them, not by them.
`.planning/v1.2-MILESTONE-AUDIT.md` (`phase: post-audit-findings`) is the origin record and says the
same. **This todo is the canonical home from here on.** That audit is deliberately left as written —
it is a dated record of what one audit found on one day, and editing it to point forward would make
it a worse record, not a better one. The link runs this file → the audit, never the reverse.

## How to reproduce

Three preconditions, all at once:

| Precondition | Why it is needed |
|---|---|
| A live two-window multiplayer game | `togglePause` only takes the Firebase path when there is a `db` and a `room`; solo falls back to a purely local toggle and has no round-trip to lose |
| The timer **ON** (`timerOff` false) | with the timer off, `src/ui/panel.js` returns before any paused-state render, so there is nothing to observe |
| A pause fired within ~1s of expiry | that is the whole window |

That last one is a sub-second target, and **a hand-driven browser session cannot hit it** — every
round-trip through browser tooling costs 1–2 seconds, which is more than the window is wide.
Reproducing this needs the armed-watcher technique in `docs/DRIVING-THE-GAME.md` §5d: a watcher
installed in the page that arms itself on a fresh clock and fires the whole sequence at page speed.

## The decision to make

Wyatt's call, not made yet:

1. **Accept it** as a known limit of a shared clock over a network.
2. **Have the host apply the pause optimistically and locally**, before the round-trip completes.

The cost of (2), stated honestly: `applyPauseState` is deliberately host-only, and the guest branch
of `watchPause` deliberately never mutates the deadline (**D-06**). An optimistic local apply has to
respect that authority split rather than route around it, or it trades a fairness papercut for a
desync.

Either way, any fix here is UI-tier — `src/orchestrator.js` and `src/ui/util.js` — and emits no new
event. It does **not** ride the gated determinism re-record and must not be parked behind it.

## Which milestone

Filed against **v1.3**. `.planning/STATE.md` records v1.2 as shipped and archived on 2026-07-31 with
`/gsd-new-milestone` as the next step; ROADMAP Phase 18 and the v1.2 audit both defer NARR-07 to
v1.3. No milestone after v1.2 has been created, so nothing has moved the numbering.
