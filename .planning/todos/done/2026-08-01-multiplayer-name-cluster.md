---
created: 2026-08-01T13:10:00.000Z
title: BLOCKER — three multiplayer name bugs, one of them a regression I introduced
area: multiplayer
severity: blocker
files:
  - src/orchestrator.js:1242 (seat claim — typedName||unusedDefaultName(s,i))
  - src/ui/lobby.js:99-102 (requireName), :117 (confirmName), :151 (cancelName — MY regression)
---

Wyatt, 2026-08-01, two-window multiplayer. Three faults, reported together because they compound.

## A. Two players who enter no name can both be "Davy Scones"

`src/orchestrator.js:1242` claims a seat with `typedName||unusedDefaultName(s,i)`. The helper takes
the seat list precisely so it can avoid a name already in use — so either it is being passed state
that does not yet include the other player, or both clients claim against a stale snapshot before
either write lands. **A race, most likely**, not a broken helper: two browsers reading the same seat
list at the same moment both see the name as free.

## B. Back from the name modal dumps you home, with no way to re-enter a name — MY REGRESSION

This is P10, and I over-applied it. Wyatt asked for the **✕** to return home instead of starting the
game. I made **all three** dismissal routes cancel to `showHome()` (`src/ui/lobby.js:151`), reasoning
that D-02 had deliberately made them identical.

In the **join** flow that is wrong. The modal opens *after* picking a mode, so "back" should return
to the screen the player came from — the join/room screen — not all the way to the start. As shipped,
a player who wants to change their name has no route back to the field.

**Fix:** dismissal should go back ONE step, to the mode's own screen, not to home. Keep ✕ as cancel
(that part was right); change where cancel lands.

## C. Rejoining with a different name does not persist

After being bounced home (B), the player rejoins the same room and types a new name — the captains
table still shows the old one. So the name is being read from somewhere that survives the rejoin
(`saveLastName`/`pp_` storage, or a seat record still keyed to the same `pp_id`) rather than from
what was just typed.

**Check the seat-claim path first:** if the seat is matched by `appState.myId` and the existing
record is reused, the newly typed name may never be written at all.

## Investigate as one

B causes the conditions for C, and A is what makes both visible (two identical default names is how
Wyatt noticed). Fix B first — it is mine, it is small, and it removes the path that produces C.

**Verify in a real two-window session** (`docs/DRIVING-THE-GAME.md` §5c). Note the standing trap:
two tabs share `localStorage` and therefore one `pp_id`, so use two browsers or a private window, or
the name/seat behaviour under test will not be the real one.

**Source:** Wyatt, 2026-08-01, multiplayer playtest.

---

## DISPOSITION — 2026-08-01, commit `1a5b339`

Reproduced first in a real two-browser headless session (`docs/DRIVING-THE-GAME.md` §8a). That
measurement corrected the diagnosis above on all three counts.

- **A — FIXED, but not a race.** `netClaimSeat` is a genuine Firebase `transaction()`
  (`src/net/readers.js:44`), so the seat map is authoritative. The real cause: the name modal
  prefilled `unusedDefaultName(null, 0)` — computed against a **null** seat map, so identical in
  every browser — and a player who accepted it sent a *truthy* name, which made
  `typedName||unusedDefaultName(s,i)` dead code. The helper was never broken; it never ran.
- **B — NOT A BUG, no change made.** Measured on all three dismissal routes from a fresh boot:
  `cancelName()` → `showHome()` lands on `stepChoose`, the screen the modal opened over, and the
  player can re-enter immediately. The modal only ever opens from the mode-choice screen; nothing
  opens it over the join or room screen. **The self-attributed regression was not one.** The thing
  that actually "dumps you home" is `#btnRoomBack` — labelled "← back", wired to `abandonRoom()`.
  Left alone as a labelling/UX call for Wyatt.
- **C — FIXED.** Confirmed exactly as described; the orphaned seat comes from `netLeaveRoom()`
  detaching watchers without releasing the record. Name is now written on re-entry, lobby-only.
- **Fourth fault, unreported, found while proving C:** `abandonRoom()` left `_watchRoomAttachedFor`
  set, so a rejoin to the same room tripped D-13's guard and never re-attached `netWatchSeats()` —
  the rename landed on every client except the one that made it.

Full detail: `.planning/quick/20260801-multiplayer-name-cluster/SUMMARY.md`

## DISPOSITION AMENDED — 2026-08-01, commit `f979bf8`

**The "B is not a bug" ruling above was half right, and the wrong half matters.**

`cancelName()` → `showHome()` genuinely could not be reached from any user path *at the time it was
measured* — every route into the name modal came from the mode-choice screen, which `showHome()`
lands on. That part stands.

But it was a **latent** fault, not an absent one, and it became reachable the moment Wyatt's actual
request was built. Adding "Change yer name" to the room screen gave the modal a second entry point;
measured immediately after wiring it, a host who pressed ✕ was dropped onto the mode-choice screen
while `appState.room` still pointed at a live room they were still hosting — visually ejected from a
game that had not ended. That is precisely the symptom Wyatt reported.

`cancelName()` now returns to the room when the player is seated, and home otherwise.

**The lesson, for whoever reads this next:** "does not reproduce" and "is not a bug" are different
claims. The first was true and provable; the second was an inference beyond the evidence, and it was
wrong. A dismissal route that hard-codes one destination is a defect whether or not a path currently
reaches it.

Wyatt's own instinct — *"back should go back one step, not exit out entirely"* — was the correct
general rule the whole time.
