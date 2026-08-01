---
created: 2026-08-01T13:00:00.000Z
title: The timer toggle feels unresponsive, and its helper text contradicts the button
area: ui
severity: major
files:
  - src/orchestrator.js:172-180 (toggleTimer — networked vs local paths)
  - src/ui/panel.js (setClockUI — #scTimerToggle rendering, the "no rush — tap ⏱" subtext)
---

## 1. Unresponsive: no acknowledgement while the round-trip is in flight

Wyatt, 2026-08-01: *"timer buttons are sometimes unresponsive — I have to click them multiple times;
if the timer has some lag to it, because of Firebase or something else, can we give visual feedback
that it has been clicked at least?"*

**This is a design gap, not only a bug.** `toggleTimer()` (`src/orchestrator.js:172`) branches:

- **solo / pass-and-play** — calls `applyTimerOff()` directly, so the UI changes immediately
- **multiplayer** — writes to Firebase and waits for `watchTimer()` to come back before anything
  changes on screen

In the multiplayer path there is a window — one network round-trip, longer on a bad connection — in
which the player has clicked and **nothing has visibly happened**. Clicking again is the rational
response to that, so the report is precisely correct.

**Fix shape:** acknowledge the press immediately and settle when the round-trip lands. The pattern
already exists in this codebase — `#flipCoinWrap` has its own pressed/active treatment. Give
`#scTimerToggle` (and `#scPause`, same path) a pressed state on `pointerdown` that persists until the
state actually flips, so the button always reacts within a frame.

**Do NOT fix this by applying the change optimistically and reconciling later.** The clock is
host-authoritative and the multiplayer pause/timer state has already produced one desync bug this
project had to fix (the CLOCK-02 guest desync — see PROJECT.md's Key Decisions). Acknowledge the
*press*, not the *outcome*.

Worth checking while in here whether repeated clicks currently queue up multiple Firebase writes —
if so, each one toggles, so a frustrated double-click could land the player back where they started.

## 2. The helper text contradicts the button

Wyatt: *"the disable button is confusing because of the helper text which tells you to press a
stopwatch but the button looks like a disabled icon; remove the helper text."*

The clock's subtext reads *"no rush — tap ⏱"* while the toggle itself is showing the
blocked/disabled icon. The words tell you to press something the button does not look capable of.

**Ruling: remove the helper text.** Wyatt's call, 2026-08-01. The icon and its tooltip carry the
meaning; the sentence only adds a contradiction.

It is player-facing copy, so record the removal against
`.planning/todos/pending/copy-shipped-vs-approved-gate.md`.

**Source:** Wyatt, 2026-08-01.
