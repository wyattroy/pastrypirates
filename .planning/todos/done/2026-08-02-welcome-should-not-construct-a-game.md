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

---

## DONE 2026-08-02 — and the todo's own plan was the wrong shape

This file proposed: "audit every appState.game read reachable while the welcome screen is up —
panel.js first — and guard or early-return." **That was a patch, and measuring killed it.**

`appState.game` is read **269 times across `src/`, and only 52 of those are guarded.** "A game always
exists" is not a panel.js quirk; it is a **global invariant of this codebase.** Guarding the five
reads this todo named would have papered over four other files, and the next unguarded read added
anywhere would have re-broken the front door.

`renderDecorativeBoard()` turned out to be doing **two unrelated jobs**:

1. **Draw a backdrop** — obsolete the moment the static JPEG landed. `#game` is `display:none`
   behind it, and `beginGame()` calls `drawBoard()`/`buildPlayerRows()` itself, so no real game ever
   depended on this having run.
2. **Put a `Game` on `appState`** — load-bearing, and the actual reason it could not be deleted.

So job 1 was deleted and job 2 kept and **named for what it is**: `seedIdleGameState()`. No DOM, one
object. The invariant is now held up by something honest instead of by a decoration nobody could see.

**The `appState.decorative` flag added earlier the same day was deleted too.** Its only reader was
`render()`'s end-of-voyage test, and the only `render()` reachable before a real game began was the
one inside the decorative board. With that gone the flag guarded an impossibility, so it went rather
than being left as plausible-looking safety. Two now-dead imports (`describeFor`, `NEUTRAL_VIEWER`)
went with it — no gate catches dead imports, and D-33/D-34/D-40 forbid them.

**Net: the codebase is smaller than before this work started.**

### Measured

| welcome screen, idle | before today | now |
|---|---|---|
| CPU | 11.1% | **1.7%** |
| layouts/sec | 60 | **0** |
| board SVG elements built | ~380 | **0** |
| captain rows built | 4 | **0** |

Verified a real game still draws everything (374 board elements, 8 ship elements, 4 captain rows with
the right names), and both boot journeys still hold: home screen at 110ms, and **zero frames** of the
welcome screen on a mid-game refresh.

### What is genuinely left, and it is not this

The 269/52 ratio is the real debt. Nothing here fixed it — it was routed around. If `appState.game`
is ever made honestly nullable, `seedIdleGameState()` deletes itself, and its header says so.
