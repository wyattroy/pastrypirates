---
created: 2026-08-02T14:30:00.000Z
title: The welcome screen still CONSTRUCTS a whole game it never shows — the last piece of LOAD-03
area: performance
severity: minor
phase: 22
milestone: v1.3
files:
  - src/orchestrator.js (boot — calls renderDecorativeBoard() on every load)
  - src/ui/board.js:1528 (renderDecorativeBoard)
  - src/ui/panel.js:178,245,246,248,250 (unguarded appState.game reads — the blocker)
---

## Where this belongs

**Phase 22, The Front Door.** It is the same screen that phase already owns, and the rest of
LOAD-03 shipped there on 2026-08-02.

## What is left

Two thirds of Wyatt's proposal are done and live:

1. ~~Ship a static blurred backdrop instead of blurring a live game~~ — done, 512×512 / 71KB.
2. ~~Stop making the player wait on ~7.7MB of art before the home screen paints~~ — done; `boot()`
   now decides the journey up front and fires `preloadAssets()` unawaited for a first-time visitor.
3. **Do not construct the game at all until a mode is chosen** — NOT done. `boot()` still calls
   `renderDecorativeBoard()` on every single load, which builds a full `Game`, draws ~380 SVG
   elements into `#board`, and builds the captains rows — for a board that is now `display:none`
   behind a static image and never seen by anyone.

## Why it was not done with the rest

`src/ui/panel.js` reads `appState.game` **unguarded** in at least five places (`:178`, `:245`,
`:246`, `:248`, `:250`), and `setClockUI` runs on a 500ms interval from boot. Removing
`renderDecorativeBoard()` leaves `appState.game` null on the welcome screen, so those become
`TypeError`s on a timer — a broken front door, which is the precise opposite of this phase's goal.

Deliberately not smuggled into the backdrop change: it is a different risk with a different blast
radius, and it wants its own verification rather than riding along.

## Doing it

1. Audit every `appState.game` read reachable while the welcome screen is up — `panel.js` first,
   then anything else on the 500ms tick — and guard or early-return.
2. Drop `renderDecorativeBoard()` from `boot()`. It has exactly one caller.
3. Confirm `showGameView()` still initialises everything a real game needs, since the decorative
   board currently does some of that incidentally (`drawBoard`, `buildPlayerRows`, `appState.evIdx`).
4. Verify BOTH boot journeys still hold — the harness for them exists and is described in
   `docs/DRIVING-THE-GAME.md`: a first-time visitor sees the home screen fast, and a mid-game
   refresh never sees the welcome screen. Sample from navigation rather than checking end state.

## The prize

Measured on the welcome screen, idle, frames driven: it is already down from **11.1% CPU / 60
layouts per second** to **1.6% / 0** across the three fixes. This removes construction work rather
than paint work, so expect it to show up in **time-to-interactive and memory**, not in the idle
figures. Measure before and after per `docs/DRIVING-THE-GAME.md` §8a — GPU on, frames driven, fps
quoted beside any cost number.

**Source:** Wyatt's LOAD-03 proposal, 2026-08-01; remainder scoped 2026-08-02.
