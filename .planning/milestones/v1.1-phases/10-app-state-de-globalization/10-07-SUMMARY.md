# Plan 10-07 Summary — Browser click-through verification (GLOBAL-02)

**Plan:** 10-07
**Type:** checkpoint:human-verify (blocking) — no code changes (`files_modified: []`)
**Status:** Complete — verified by coordinator in Chrome
**Completed:** 2026-07-24
**Requirements:** GLOBAL-02

## What was verified

That after all 46 app-state names were de-globalized behind the `appState` object, the game still works end-to-end in a real browser with no new `ReferenceError`/`no-undef` — the actual bar of GLOBAL-02.

Driven in Chrome via `dispatchEvent(new MouseEvent(...))` on real handler elements (server :8777, cwd confirmed this worktree), avoiding pixel misclicks.

## Load-time state (GLOBAL-01 + GLOBAL-03)

```
window.__pp_module_ok                    → true
Object.keys(window.PP.appState).length   → 46
window.__pp_app_state_debug() !== ...()  → true   // fresh snapshot each call, never the live ref (GLOBAL-03)
window.__pp_app_state_debug() !== window.PP.appState → true   // not the live object
four hooks [module_ok, boot_count, net_debug, app_state_debug] → [boolean, number, object, function]
typeof window.revealMyRecipe             → "function"   // inline onclick target stays reachable (GLOBAL-02)
typeof (bare) db / room / isHost         → "undefined"  // de-globalized
```
`typeof (bare) game` returns `"object"` — this is the `<div id="game">` via Window named access (the same Phase 8 phenomenon), NOT a leftover global. `state_contract_check.js` assertion 2 confirms zero bare `game` in code. A probe that read bare `myId` directly threw `ReferenceError: myId is not defined` — which *confirms* de-globalization: the binding is gone, code uses `appState.myId`.

## Solo game leg

```
appState.game.constructor.name → "Game"   players → 4
advanced round 0 → 1, bot turns processing, events accumulating
console: ZERO new ReferenceError / no-undef / TypeError
```
(The only console errors present were two stale `duplicate attach … rooms/JFAS/flip` entries timestamped 2:44:20 PM from an earlier session — not from this solo run.)

## Two-tab multiplayer leg (criterion 4 delta for Phase 10)

Distinct `pp_id` per tab, set sequentially (Phase 9 shared-localStorage procedure). Host room **XYDQ**.

```
HOST:  appState.room "XYDQ" (tracks UI), isHost true,  mySeat 0, appState.game → Game
GUEST: appState.myId "P10-GUEST-…", appState.room "XYDQ", mySeat 1, isHost false
       joined seat 2 (seatList: P10Host + P10Guest + 2 bots) — bidirectional lobby sync
       game start broadcast host→guest: appState.game → Game, board rendered (386 elements)
```
Multiplayer start + broadcast works with all 46 names behind `appState`. All identity/session state (`myId`, `room`, `mySeat`, `isHost`, `db`) resolves correctly through `appState`.

## Determinism / replay control-flow (Wave 2)

The replay/resume names (`replaying`, `dlog`, `dlogIdx`, `dlogN`, `evIdx`) were migrated in 10-02 and gated by `dlog_replay_test.js` (green) plus the 30-seed corpus (30/30). No browser host-refresh leg was run because solo games do not persist mid-turn (no `pp_solo` key), and the MP host-refresh path is already covered by the Node replay harness. Recorded for Phase 12 VERIFY-03 if a live host-refresh browser check is wanted.

## Finding recorded (not a Phase 10 regression) — filed as a task

The guest tab logs two ERROR-level `[src/net/registry.js] duplicate attach refused … rooms/XYDQ/{seats,status}` messages on the lobby→game transition (reproduced on the fresh room, not stale). Root cause: `watchRoom()` (index.html ~4378, attaches seats/status) is invoked from multiple lifecycle points (`:4350` host create, `:4364`/`:4376` guest join, `:4663` later path); the second invocation re-attaches and the Phase 9 registry guard correctly REFUSES the duplicate — no leak, game works. This is the pre-existing "leak vector b" the Phase 9 guard was built to catch, NOT a Phase 10 regression (de-globalization renamed identifiers only, it did not change the call structure; 09-05-SUMMARY already notes duplicate-attach). It is **not** a `ReferenceError`/`no-undef`, so GLOBAL-02's criterion holds. Filed as a task to make `watchRoom()` idempotent (or downgrade the log) — best handled in Phase 11.

## GLOBAL-02 verdict

PASS. The 1 inline `onclick="revealMyRecipe()"` attribute's target stays reachable; a full solo game and a two-tab multiplayer game are both playable; zero new `ReferenceError`/`no-undef` from de-globalization. The only console noise is the pre-existing, guard-handled duplicate-attach (filed separately).
