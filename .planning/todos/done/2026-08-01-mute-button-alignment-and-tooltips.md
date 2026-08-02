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

---

## FIXED 2026-08-02 (MUTE-01)

### 1. Alignment — reproduced, then fixed at the root

Reproduced across six window shapes before touching anything. **At 1000x700 — a wide window — the
sidebar-layout class was absent, so the button dropped to its own row at x=28 while the clock sat at
x=382.** That is exactly Wyatt's screenshot.

**The instrument this todo proposed could not work.** It suggested a container query on
`#controlsRow`, but P6 had moved `#btnMute` OUT of that row to be a grid child of `#layout` —
container queries only style DESCENDANTS, so the query could never have reached it.

Two measurements settled the real fix:

- **The button fits inline at every size tested**, including 390px phone portrait (333px needed
  against a 334px row). "Below the captains box" was never a space requirement.
- **Its CSS was written for `#controlsRow` and never updated when it left** — `flex: 0 0 auto`,
  `align-self: center`, and every dimension in `cqw`. As a grid child of `#layout` there was no
  container ancestor at all, so those `cqw` units had been silently resolving against the VIEWPORT.
  It was mis-sized as well as mis-placed.

So it went home: back inside `#controlsRow`, `margin-left:auto` to pin it right, and `flex-wrap` on
the row to answer "does it fit" — no hardcoded threshold that could be a pixel wrong, and the `cqw`
units resolve against the row they were written for. Verified inline and inside the row at all six
shapes, none off-screen.

`ui_contract_check.js`'s LAYOUT-WIDE-COUNT tripwire fired (5 -> 4) and was updated with its reason,
since one wide-layout rule was legitimately removed.

### 2. Tooltips — decided, not assumed

The todo asked for a deliberate decision. **`title` is desktop-only** — it needs hover-and-hold and
never appears on touch — so on the device Wyatt mostly plays on there was nothing to see, and no
styling fixes that.

Kept `title` as the desktop nicety it is, and added what works everywhere: **`aria-label`** naming
the control and **`aria-pressed`** exposing on/off as a real toggle, both updated on the same tick as
the icon so they cannot drift. Written with `setAttribute` rather than the `el.ariaLabel` IDL
property, because ARIA reflection only reached Safari 16.4 and this is played on iOS — and compared
before writing, because this runs on the 500ms tick that once cost 137% CPU in Safari.

**Deliberately NOT a custom tooltip bubble:** it would be a permanently-visible second label
competing for space in a row that already clamps hard at 390px, to say what the icon already says.
This todo's own bar — "the mute state must be readable from the icon alone regardless" — is met by
Wyatt's megaphone / slashed-megaphone pair.
