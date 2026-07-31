---
created: 2026-07-31T15:47:23.950Z
title: Restyle the 12 solid-orange buttons to the outline + faded-fill pattern
area: ui
severity: cosmetic
files:
  - index.html:125-126 (button.primary — the one rule that drives all of it)
  - index.html:321 (.apBtn.primary:hover)
  - index.html:135-151 (the footer-button pattern to copy)
---

## Problem

The game's orange buttons are **solid orange fill with white text** (`button.primary`,
`index.html:125`), which matches nothing else in the interface. Every other button in the game uses
a consistent **outline + faded fill** pattern: a full-strength colored border, a pale tint of that
same color as the interior, and dark text in the same hue.

## The target pattern

Already in the tree at `index.html:135-151` — the footer button family. The Ko-Fi button is the
existing orange example:

```css
.footerKofi { border: 1.5px solid #e89827; background: #fdf3e3; color: #8a5a12; }
.footerKofi:hover { background: #fae7cb; }
```

So: full-strength orange outline, faded orange interior, dark orange text.

## Scope — Wyatt ruled on this 2026-07-31

**IN SCOPE — the 12 solid-orange `.primary` buttons, and only these:**

| # | Label | Location |
|---|---|---|
| 1 | ⚓ Create the game | `index.html:725` (`#stepHost`) |
| 2 | Join the voyage | `index.html:734` (`#stepJoin`) |
| 3 | ⚓ Start the voyage | `index.html:751` (`#stepPassPlay`) |
| 4 | ⚓ At the helm! | `index.html:760` (`#passOverlay`) |
| 5 | ⛵ Start the voyage! | `index.html:775` (`#lobbyRoom`, host) |
| 6 | Send feedback | `index.html:838` (`#feedbackModal`) |
| 7 | ⛵ Everyone's aboard? | `index.html:858` (`#startConfirmModal`) |
| 8 | 🚪 Aye, leave the game | `index.html:871` (`#leaveConfirmModal`) |
| 9 | 🔄 Start a fresh voyage | `index.html:882` (`#restoreFailModal`) |
| 10 | ⚓ Arrgh! | `src/ui/flow.js:1444` (opening backstory barrier) |
| 11 | 🦜 Start | `src/ui/flow.js:1504` (turn-order barrier) |
| 12 | 🦜 Final round — set sail! | `src/orchestrator.js:840` |

**EXPLICITLY OUT OF SCOPE — Wyatt's ruling, do not "fix" these in a later sweep:**

- The **"Host a Crew" choice card** gradient (`index.html:604` rule, `:705` element) — it is the
  visual anchor of the first lobby screen.
- **"Play again"** gold/amber gradient (`index.html:435`, `#btnPlayAgain`) — deliberately
  celebratory at end of voyage.
- **`#flipCoinWrap.active`** (`index.html:370`) — this is a *signal* that it is your turn to flip,
  not a button. Toggled in `src/ui/board.js:813-825`.

## Solution

Change `button.primary` at `index.html:125` to the outline+tint recipe. Items 10–12 inherit it via
`.apBtn.primary` — but check `index.html:321`, which has its own hover rule
(`.apBtn.primary:hover { background: var(--accent); ... }`) that will re-introduce solid orange on
hover unless it is updated too.

Watch out for:

- **`.ahoyGlow`** (`index.html:334`) pulses on items 10–12. It was tuned against a solid orange fill;
  on a pale fill the pulse may read as broken or invisible. Re-check it visually.
- **`--accent` (`#f59f2d`) may be used elsewhere** than `button.primary`. Prefer changing the
  `button.primary` rule over redefining the variable, or unrelated elements shift.
- **Contrast.** The current buttons are white-on-orange; the new ones are dark-orange-on-pale. Check
  the new pairing meets contrast, especially for the destructive "Aye, leave the game."
- **"Aye, leave the game" has deliberate design intent** — the comment at `index.html:869-870`
  explains that the safe choice ("Nope, stay aboard", faded blue) sits *first* and the irreversible
  one sits below it styled as primary. Once both are outline+tint, the destructive button no longer
  stands out as the heavier choice. Consider giving it the red `.footerLeave` treatment
  (`border:#b56464; background:#f8eaea; color:#7e3535`) rather than orange — it is a leave action,
  and that pattern already exists for exactly this.

**Source:** Wyatt, 2026-07-31 punch list; scope confirmed by him the same day.
