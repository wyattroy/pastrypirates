---
created: 2026-07-31T15:47:23.950Z
title: Players should name themselves in a modal AFTER picking a game mode
area: ui
severity: major
files:
  - index.html (welcome screen player-name field + the four play-mode buttons)
  - src/ui/lobby.js (mode-button handlers, #stepHost / #stepJoin / #stepPassPlay)
---

## Problem

Today the **Player Name** field sits on the welcome screen *above* the play-mode buttons. Wyatt's
observation from live play: **people are not seeing it.** They click a mode, the game starts, and
they are a default captain name they never chose. It reads as unintuitive because nothing asks them
for a name — the field just sits there hoping to be noticed.

The ordering is backwards relative to intent: choosing *how* you want to play is the decision the
player arrives wanting to make; naming yourself is the follow-up.

## Solution

Introduce a **new intermediary modal** that pops up *after* the player chooses a game mode and
*before* they land in the lobby/game:

1. Player clicks a play-mode button (Solo, Host a Crew, Join a Crew, Pass & Play).
2. A name modal appears — "What do they call ye, captain?" — pre-filled with the current default
   or last-used name.
3. On confirm, proceed into the mode's existing flow.

Open questions for planning:

- Does the welcome-screen name field go away entirely, or stay as an optional shortcut? Removing it
  is the cleaner answer (one place to name yourself, not two that can disagree) — needs Wyatt's call.
- **Interaction with UI-05** (already in v1.2: "Clicking 'Host a Crew' goes straight to the
  lobby/seat screen, skipping the redundant intermediate 'Create the game' screen"). UI-05 removes
  an intermediate screen; this adds one. They are not in conflict — UI-05 kills a *redundant* step,
  this adds a *load-bearing* one — but they touch the same handlers and should be read together.
- **Interaction with LOAD-03** (welcome screen paints instantly, heavy art loads only after the
  player chooses to play). The name modal is a natural place to sit while assets download — a mode
  click could kick off the preload while the player types. Worth sequencing these together.
- UI-06 already fixes name-doubling in the lobby; make sure the new modal feeds the same single
  source of truth it reads from.

**Source:** Wyatt, 2026-07-31 punch list.
