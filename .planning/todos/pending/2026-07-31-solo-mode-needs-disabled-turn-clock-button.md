---
created: 2026-07-31T15:47:23.950Z
title: Solo play should show a disabled turn-clock button for consistency
area: ui
severity: minor
files:
  - src/ui/panel.js (setClockUI)
  - src/ui/board.js (clock control render)
---

## Problem

The turn-clock control appears in multiplayer but not in solo play. The control therefore *moves the
surrounding layout* depending on which mode you are in, and a player who learns the interface in one
mode finds it rearranged in the other.

Wyatt's ask: **the turn-clock functionality should look consistent across all play modes** — solo
should show the same button, greyed out and non-interactive, rather than omitting it.

## Solution

Render the turn-clock button in solo mode in a **disabled** state — present, in its normal position,
visibly inert. Do not wire it to anything.

Notes for planning:

- Follow the **D-41 pattern already established in this codebase**: a greyed dead-end gets its own
  short reason beneath it explaining *why* it is greyed, rather than being a button that silently
  does nothing. A line like "no clock in solo — ye set yer own pace" would match that convention.
- **AUDIO-02 puts a mute button "to the right of the turn clock."** If the clock is absent in solo
  today, the mute button's anchor is absent too. Landing this first makes AUDIO-02's placement
  well-defined in every mode — worth sequencing that way.
- The disabled state must not start, arm, or write any shot-clock state. Solo has no `turnExpired`
  path and must not grow one.

**Source:** Wyatt, 2026-07-31 punch list.
