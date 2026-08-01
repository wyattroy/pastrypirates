---
created: 2026-08-01T12:30:00.000Z
title: The game burns 80% CPU during ordinary play — it is a 2D board game
area: performance
severity: major
files:
  - index.html:563 (.ripple — infinite SVG animation, always on)
  - src/ui/board.js:138 (drawBoard — svg.innerHTML="" on EVERY render)
  - src/ui/panel.js (setClockUI, on a 500ms interval)
---

## Problem

Wyatt, 2026-08-01: *"we need to figure out how to optimize the game so that it doesn't take so much
CPU during normal play — it's a 2D board game for goodness sake, but it heats up my phone when I play
it and it takes 80% of my MacBook CPU. That's not good."*

He is right, and it is not a mystery — it is measurable.

## MEASURED (headless Chrome, phone viewport, mid-game, doing NOTHING)

**260 DOM mutations in 5 seconds while the game sits idle** — about **52 per second** with no player
input and nothing happening.

| Target | Mutations / 5s | Note |
|---|---|---|
| `SPAN:childList` | 50 | typewriter spans |
| `image:attributes` | 42 | SVG `<image>` attribute writes, ~8/sec |
| `shotClockPanel:attributes` | 30 | ~6/sec |
| `btnMute`, `scPauseImg`, `scTimerToggle` | 10 each | the 500ms tick |
| `scLabel`, `shotClockNum` | 10 each | countdown text — legitimate |

**Three infinite SVG animations running continuously**, all `rippleOut` — the active-turn sonar ring
(`index.html:563`, `animation: rippleOut 2.7s linear infinite`, three rings on staggered delays).
They never stop while it is anyone's turn, and they animate `transform` + `opacity` on SVG elements
sitting over the board.

**The board SVG is 93 elements and `drawBoard()` destroys and rebuilds ALL of it on every render** —
`src/ui/board.js:138`: `const svg=$("board");svg.innerHTML="";`. This is already documented as a
hazard in `docs/DRIVING-THE-GAME.md` §7 ("drawBoard() wipes the board SVG on every render"), but the
cost was noted for testing, never for performance.

## The three suspects, in the order worth attacking

1. **The full board teardown on every render.** 93 SVG elements destroyed and recreated for what is
   usually a one-ship move. Every rebuild is layout + paint + composite of the entire board. This is
   almost certainly the biggest single win and the biggest change: it means diffing (move the ship
   that moved) instead of rebuilding.
2. **The always-on ripple.** Three infinite SVG animations over the board area, running the whole
   time it is someone's turn. On a phone this alone can keep the GPU/compositor busy continuously.
   Cheapest fix of the three — cap the iterations, or pause it after N cycles, or move it to a CSS
   transform on a single element rather than three animated SVG nodes.
3. **The 500ms clock tick.** Partly addressed 2026-08-01 (writes are now conditional and skipped
   behind the welcome screen), but it still writes on most ticks because the countdown genuinely
   changes. Cheap to bound further: only touch the nodes whose text actually differs.

## Do this as an investigation FIRST, not a set of fixes

Each of the three above is a hypothesis with a measurement attached, not a confirmed cause of the
80%. The harness (`docs/DRIVING-THE-GAME.md` §8a) can attribute cost properly — CDP exposes
`Performance.getMetrics` and tracing, so **measure which of the three dominates before rewriting the
render path**, which is the expensive one to change and the easy one to get wrong.

**Do not optimise on instinct here.** The determinism corpus and the Safari storm fix both live in
this code; a render-path rewrite that is not measured is how BUG-01 happened in the first place.

## Related, already logged

`2026-08-01-welcome-screen-should-not-render-the-live-game.md` — the same class of problem before the
game even starts (a live board built and composited only to be blurred behind a card). Wyatt's static
backdrop proposal fixes that half; this item is the in-play half.

**Source:** Wyatt, 2026-08-01.
