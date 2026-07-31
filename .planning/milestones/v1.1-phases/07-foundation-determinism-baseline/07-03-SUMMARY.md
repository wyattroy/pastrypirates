# Plan 07-03 Summary — Browser verification of the module-loading contract

**Plan:** 07-03
**Type:** checkpoint:human-verify (blocking)
**Status:** Complete
**Completed:** 2026-07-24
**Files modified:** none (verification-only plan)

## What was verified

The gap the headless corpus structurally cannot cover: whether the page still loads and plays in a real browser after `index.html` was edited. The 30-seed corpus runs in Node against an engine that has not moved, so it would pass green even if the module script tag broke page load completely. D-21 splits ROADMAP Criterion 5 for exactly this reason — Plan 07-02 delivered part (a), this plan is part (b).

## Results

| Check | Chrome | Safari |
|---|---|---|
| `window.__pp_module_ok` | `true` | `true` |
| `typeof firebase` | `"object"` | `"object"` |
| Console clean (module/firebase/MIME) | yes | yes |
| Board renders, game playable | yes | yes |
| Storm rendering | not exercised | **smooth frame rates** |

**Chrome** was verified by Claude via Chrome MCP: page load, a fished turn, a coin flip, and sustained bot turns, with the console clean throughout. Module tag confirmed at `index.html:5638` with attributes; bare `<script>` count still exactly 1.

**Safari** was verified by Wyatt directly, as required — no automation can drive Safari. He confirmed all three console requirements and, importantly, that **storm rendering runs at smooth frame rates**. This is the check that mattered most: BUG-01 in v1.0 was a Safari-specific storm perf near-crash, and this is the first phase boundary where the page structure changed.

## Storm verification method

The v1.0 force-storm instrumentation was deliberately removed before that phase shipped (v1.0 decision D-09), so there was no built-in way to trigger a storm on demand. Verified console snippet for future phases:

```javascript
game.cfg.storm = 1;
rollStorm = function (g) { g.r(); g.stormStreak = 1; return true; };
```

Two non-obvious details, both load-bearing:

- **Use bare `game`, not `window.game`.** `game` is declared `let` at `index.html:1813`; a `let` at the top level of a classic script lives in script scope and never lands on `window`. A `<div id="game">` exists, so `window.game` resolves to that element via Window named access and silently returns `undefined` for `.cfg`. Verified empirically.
- **The `g.r()` call is mandatory.** `rollStorm` (`index.html:1016`) documents that it *"always consumes exactly one `g.r()` so the seeded RNG sequence stays identical live vs. host-refresh replay."* Omitting it shifts every subsequent draw and silently desyncs replay.

Forcing the CSS class directly (`boardwrap.classList.add('storming')`) does **not** work as a substitute: the rain layers are built lazily by `buildStormLayers()` inside `render()`, so you get the dark tint with no rain — and `render()` re-toggles the class every turn, reverting the hack.

## Findings recorded, not blocking

**Two pre-existing 404s** appear in the console on every page load: `assets/ingredients/salt.png` and `assets/ingredients/honey.png`. `ING_ALL` (`index.html:866`) lists nine ingredients and `index.html:872` builds an image path for each, but only seven PNGs exist. Confirmed present on `main` and Phase 7 changed zero asset files, so this is not a regression from this phase. The `iconAt()` emoji fallback keeps the game visually correct. Filed as a separate task.

**Stale dev servers on common ports.** Three `python3 -m http.server` processes from other worktrees were holding ports 8000 and 8001. Each worktree has its own `index.html`, so `curl localhost:8000/` returns a healthy 200 from the *wrong* tree — an early check "passed" against a worktree with no `src/` directory at all. Verification was moved to port 8777 after confirming the server's cwd matched this worktree. Future phases doing browser checks should confirm server cwd before trusting a result.

## Requirements satisfied

- **FOUND-02** — game loads and plays from a static HTTP server via the module entry, in both browsers.
- **FOUND-03** — Firebase compat classic tags execute before the module entry; no init race, no `firebase is not defined`, D-17 tripwire silent.

## Notes for Phase 8

`window.__pp_module_ok` is the standing browser-side tripwire. Phases 8–11 should re-check it after any change to script ordering or module structure — in Safari a broken module skips silently with no console error, and this marker returning `undefined` is the only signal.
