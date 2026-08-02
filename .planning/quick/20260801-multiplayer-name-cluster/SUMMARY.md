---
quick_id: 260801-omv
slug: multiplayer-name-cluster
status: complete
date: 2026-08-01
branch: integration/v1.3-phases-18-21-22
commit: 1a5b339
tests: npm test 23/23 green
---

# Multiplayer name cluster — done

Two of the three reported faults were real and are fixed. The third was misdiagnosed and needed no
code change. A fourth, unreported, was found while proving the fixes.

## What shipped

**A — two captains could share one name.** The name modal prefilled a default computed against a
`null` seat map, so it was the same string in every browser, and confirming it untouched sent a
*truthy* name that made `joinRoom`'s collision-safe fallback dead code. The modal now remembers the
string it offered; an untouched confirm counts as unchosen, resolves against the live transaction
seat map at claim time, and is not written to `pp_lastName`.

**C — a rename on rejoin was discarded.** `joinRoom` returned early on a seat already carrying this
`pp_id` and reused the record verbatim. The name is now written on re-entry, guarded on
`r.status === "lobby"` so a mid-voyage reconnect keeps the name narration already went out under.

**Bonus, found by the harness.** `abandonRoom()` left `_watchRoomAttachedFor` set after
`netLeaveRoom()` had torn the watchers down, so rejoining the same room tripped D-13's guard and
`netWatchSeats()` was never re-attached. The rejoining player's lobby froze on its last seat list —
the rename landed on every client except theirs. Caught only because verification asserted on both
sides; a host-only check would have called this fixed.

## What did NOT need fixing

**B — "back from the name modal dumps you home — MY REGRESSION".** It does not reproduce. Measured
on all three dismissal routes (✕, Escape, backdrop) from a fresh boot: `cancelName()` → `showHome()`
lands on `stepChoose`, which is the screen the modal opened over, so the player is exactly where
they started and can re-enter immediately. The modal only ever opens from the mode-choice screen —
there is no path that opens it over the join or room screen. **No code change; the previous
session's self-attributed regression was not one.**

## Verification (real two- and three-browser sessions, §8a)

| Check | Result |
|---|---|
| two players, neither types a name | 4 distinct captains |
| three players, none type a name, near-simultaneous join | 4 distinct captains, all clients agree |
| unchosen name persisted to `pp_lastName`? | no |
| chosen names honoured verbatim + persisted | yes |
| join ALPHA → room "← back" → rejoin BRAVO | BRAVO on host **and** guest, same seat |
| ✕ still returns to the mode choices, re-enterable | yes |
| `npm test` | 23/23 |

## Raised back to Wyatt — not actioned

1. **`#btnRoomBack` is labelled "← back" but calls `abandonRoom()`.** It leaves the room rather than
   stepping back a screen. This is what actually "dumps you home", and it is a labelling/UX call,
   not a correctness bug — so it was not changed unilaterally.
2. **A guest's seat is never released on leave.** `netLeaveRoom()` only detaches watchers, so an
   abandoned seat stays claimed and the room can look full. Not changed: mid-game reconnect depends
   on the seat persisting by `pp_id`, so freeing it is only safe in the lobby and deserves a
   deliberate decision.
3. **Cosmetic:** a player who accepts the prefilled "Davy Scones" and joins may be seated as
   "Crustbeard" — correct collision avoidance, but the modal showed them a name they did not get.
   Worth a look if it reads oddly in play.

---

## Follow-up, same day — commit `f979bf8`

Wyatt, on being shown the finding: *"back should go back one step, not exit out entirely. the player
may just want to change their name."* He chose adding a **"Change yer name"** button to the room
screen over changing what "← back" does, so `#btnRoomBack` keeps abandoning the room (it is the only
way out, and a host's room must still be torn down).

`renameMySeat()` rewrites the player's own seat in place: one seat, only its owner's (the transaction
re-checks the id), lobby only. `netWatchSeats()` repaints every client on the write.

**This overturns the "B is not a bug" ruling above.** Adding the button gave the name modal a second
entry point, and `cancelName()`'s unconditional `showHome()` became reachable — measured, a host
pressing ✕ was dropped onto the mode-choice screen while still hosting a live room. Cancel now
returns to the room when seated. *Not reproducible* was true; *not a bug* was an inference past the
evidence, and it was wrong.

Verified: 16 checks on the rename plus the original 14 re-run, both green, `npm test` 23/23.
