---
created: 2026-08-01T13:15:00.000Z
title: Mute button misaligned in a wide-but-stacked window, and its tooltips are not visible
area: ui
severity: minor
files:
  - index.html:68-69 (#btnMute grid placement, keyed on .layoutWide)
  - src/ui/board.js:1518 (where layoutWide is toggled)
  - src/ui/panel.js (muteEl.title)
---

## 1. Misaligned — the rule keys on the wrong condition

Wyatt, 2026-08-01, with a screenshot: on a wide window the mute button sat alone below the captains
box, left-aligned, instead of inline beside the clock.

My rule is `#game.layoutWide #btnMute { grid-area: controls; }` (`index.html:69`) — but `layoutWide`
is toggled by `syncBoardSizing()` (`src/ui/board.js:1518`) based on **whether the sidebar has room
for a full row of ingredient chips**, not on viewport width. Wyatt's window was wide *and* stacked,
so the class was absent and the button fell to its own row.

**The condition should be "does the controls row have space", not "is the sidebar layout active".**
A container query on `#controlsRow` is the right instrument — the same tool already used for the
captains chips (`@container captains`). Below the threshold, drop to its own row; above it, stay
inline beside the clock.

## 2. Tooltips not visible

Wyatt: *"I don't see any mute tooltips — where are they?"*

They exist as `title` attributes set in `setClockUI` (*"Mute the sound"* / *"Turn the sound back
on"*). Native `title` tooltips need a hover-and-hold and **never appear on touch at all**, so on a
phone they are simply absent.

Decide deliberately rather than assuming a bug: either accept that they are desktop-only affordances,
or give the button a real label/aria treatment that works everywhere. **The mute state must be
readable from the icon alone regardless** — the tooltip should never be the only thing carrying it.

**Source:** Wyatt, 2026-08-01.
