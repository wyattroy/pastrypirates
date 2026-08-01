---
created: 2026-08-01T12:05:00.000Z
title: The welcome screen should show a static blurred image, not a live blurred game
area: performance
severity: major
files:
  - index.html:757 (.bg-blurred — filter over the whole of #game)
  - src/ui/lobby.js:183,187,206 (where it is applied)
  - src/orchestrator.js (boot / preloadAssets)
---

## Wyatt's proposal, 2026-08-01

> *"For the home screen, would it be more efficient to just load a low-res image of the game once,
> and blur that once instead of blurring the actual game? Then while players choose what they're
> going to do, you quietly in the background load their game assets?"*

**Yes — and it is the right architecture, not just a cheaper one.** It also happens to be
**LOAD-03**, already in the backlog, arrived at independently from the performance side.

## Why the current approach is expensive at rest

`index.html:757` puts `filter: blur(7px) saturate(1.15) brightness(.97)` over the **whole of
`#game`** — which contains the full board SVG, the captains panel and the controls.

A filter forces that subtree into its own compositing layer, and **any** invalidation inside it makes
the browser re-rasterise *and re-blur* the entire surface. So the cost is not paid once; it is paid
every time anything inside changes, and the surface is large.

That is what produced Wyatt's 137% CPU on Safari Graphics and Media with the game merely open (fixed
2026-08-01 by stopping the 500ms clock tick from writing DOM behind the blur — **CPU 137% -> 30-83%**).
The remaining 30-83% is the deeper cause: **a full game is being built, laid out and composited
purely to be hidden behind a card.**

## The proposal, concretely

1. **Ship one pre-blurred, low-resolution image** of the board as the welcome backdrop. Blurred once,
   at build time, by a human — costing the browser a single small decode and nothing thereafter.
2. **Do not construct the game at all** until a mode is chosen. No board SVG, no captains panel, no
   composited layer, nothing to invalidate.
3. **Preload the heavy art during the choosing**, exactly as Wyatt describes — the player is reading
   the intro and picking a mode, which is dead time that currently buys nothing.

Point 3 is **LOAD-03** verbatim: *"the welcome screen is the default first screen… heavy game assets
are downloaded only after the player chooses to play."* Point 1 is what makes point 2 possible
without losing the look.

## Why this beats optimising the blur

Any amount of tuning still leaves a live, composited game behind an opaque card. The image approach
removes the work rather than making it cheaper, and it improves first paint at the same time — the
welcome screen would no longer wait on ~18 MB of art it does not show.

**Interaction with LOAD-04** (asset compression, already pulled into v1.3): the backdrop image should
be produced in the same export pass, not separately.

**One thing to decide:** the backdrop is a *fixed* picture, so it will not match the player's actual
board. That is almost certainly fine — it is decorative and blurred to 7px — but it is a visible
change from "your game, blurred" to "a game, blurred", and worth Wyatt seeing before it ships.

**Source:** Wyatt, 2026-08-01, after the Safari CPU fix.
