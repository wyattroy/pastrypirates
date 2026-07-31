---
created: 2026-07-31T18:40:00.000Z
title: URGENT — a player ended up holding two Toasty Wheat
area: engine
severity: blocker
files:
  - src/ui/flow.js (humanDock — the live docking path)
  - src/engine/index.js (doDock — the simulator path)
  - src/ui/util.js (chip rendering, .chip.extra)
  - src/ui/recipe.js:132 (Snickerdoodle Bites = dairy, vanilla, wheat, sugar, spice — wheat ONCE)
---

## Report

Wyatt, v1.2 Phase 17 playtest (2026-07-31), flagged **urgent**: *"somehow I just got two wheat from
docking once."* Full captain's log captured and reproduced below in the evidence section.

His recipe was **Snickerdoodle Bites** = `["dairy","vanilla","wheat","sugar","spice"]`
(`src/ui/recipe.js:132`) — **wheat appears exactly once**, so a second wheat is an extra, not a
recipe slot.

## What the log actually shows — read this before investigating

Seat `wy` docked at the Flour Patch **twice**, five rounds apart:

| Round | Log line | Outcome |
|---|---|---|
| 3 | *"wy docks at the Flour Patch for a sack of 🌾 Toasty Wheat and flips ⚫TAILS, **but buys it anyway for 3**"* | paid 3 coins, **received wheat** |
| 8 | *"wy docks at the Flour Patch and flips ⚪HEADS — **hauls aboard** a sack of 🌾 Toasty Wheat!"* | free, **received wheat** |

**So the log is consistent with two wheat from two separate, legal dockings** — and the Captains-box
row would then correctly show one green "have" chip and one yellow `.chip.extra`.

**This does not mean Wyatt is mistaken, and the item must not be closed on this reading alone.** Three
possibilities, and only a state dump settles it:

1. **Two legal dockings, five rounds apart.** The Round 3 purchase is easy to lose track of. If so
   the defect is not "two wheat" but **the game letting you acquire a duplicate of an ingredient you
   already hold** — which may be exactly what felt wrong, and is a real design question worth
   putting to Wyatt regardless.
2. **The Round 8 docking granted two.** Then `wy` holds **three** wheat, not two, and the log
   under-reports. **This is the urgent case** — check the actual `p.ing` array, not the chip row.
3. **A rendering fault.** The chips row shows a duplicate that the inventory does not contain.
   Cosmetic, but it would mean the Captains box cannot be trusted as evidence for any other bug.

**First action: dump `appState.game.players[wy].ing` and count the wheat.** Two versus three
immediately separates reading 1 from reading 2, and no amount of re-reading the log will.

## Why this is filed as a blocker until triaged

If reading 2 holds, ingredients are being minted — the same class as the CR-02 trade bug (a trade
could mint a crate that was never in play). **Minting breaks the token economy**, because every
ingredient removed is supposed to return to `this.tokens[ing]`. Downgrade only once reading 1 or 3 is
positively confirmed.

## Related open work — check these together

- **V13-59/60/61** (`.planning/research/v1.3-intake/`) — *"ingredients vanishing from the game
  entirely."* Feasibility traced every removal path and found supply conserved in all of them, and
  could not reproduce it statically. **A mint and a vanish are the same conservation invariant seen
  from opposite ends** — investigate as one item.
- **CR-02** (fixed) — the trade path could `splice(-1,1)` on an unchecked `indexOf` and push a crate
  that was never in play. **Look for the same shape in the dock path.**
- Feasibility's suggested tool applies directly: *"a live pass-and-play repro with an
  ingredient-supply-conservation assertion added temporarily."* A standing assertion that
  `sum(all players' ing) + sum(tokens) === constant` would have caught this the moment it happened,
  and would catch the vanish bug too. **Worth building before hunting the cause.**

## Evidence — the full captain's log

Recorded by Wyatt, 2026-07-31. Kept verbatim; every `wy` line is load-bearing for the count above.

```
— Round 1: wind is blowin' west —
Crustbeard pays 1 and sails / casts a line, catches a sugarfish! (+2)
Flaky Jack pays 1 and sails / casts a line, catches a sugarfish! (+2)
Dough Hook pays 1 and sails / docks at Cocoa Cabana for a pod of Luscious Cacao Beans and flips TAILS, but buys it anyway for 3
wy pays 1 and sails / casts a line, catches a sugarfish! (+2)
— Round 2: wind is blowin' south —
Crustbeard pays 1 and sails / docks at Full Cream Folly for some jugs of Fresh Milk and flips TAILS, but buys it anyway for 3
Flaky Jack pays 1 and sails / casts a line, catches a sugarfish! (+2)
Dough Hook docks at Cocoa Cabana and flips HEADS — hauls aboard a pod of Luscious Cacao Beans!
wy pays 1 and sails / casts a line, catches a sugarfish! (+2)
— Round 3: wind is blowin' east —
Crustbeard docks at Full Cream Folly and flips HEADS — hauls aboard some jugs of Fresh Milk!
Flaky Jack trades 4 to Dough Hook for Cacao Pods — they each get +1 for cooperating
Dough Hook trades 4 to Crustbeard for Fresh Milk — they each get +1 for cooperating
wy pays 1 and sails
wy docks at the Flour Patch for a sack of Toasty Wheat and flips TAILS, but buys it anyway for 3   <-- WHEAT #1
Round 4: A storm be ragin'! It'll blow yer ships west, then south.
A gale blows Crustbeard off the dock!  (x2)
Crustbeard pays 1 and sails / docks at Glitter Bay and flips HEADS — hauls aboard a jar of Crystal Sugar!
Flaky Jack is blown by the storm  (x2)
Flaky Jack pays 1 and sails / casts a line, catches a sugarfish! (+2)
Dough Hook is still docked, so the storm can't run them aground.
A gale blows Dough Hook off the dock!
Dough Hook pays 1 and sails / docks at Custard Key and flips HEADS — hauls aboard a bundle of Velvety Vanilla Beans!
A gale blows wy off the dock!  (x2)
wy pays 1 and sails / docks at Clucker's Cove and flips HEADS — hauls aboard a dozen Sand-Speckled Eggs!
— Round 5: wind still blows west, this westerly is gusting —
Crustbeard pays 1 and sails / casts a line, catches a sugarfish! (+2)
Flaky Jack pays 1 and sails / docks at Glitter Bay for a jar of Crystal Sugar and flips TAILS, but buys it anyway for 3
Dough Hook pays 1 and sails / casts a line, catches a sugarfish! (+2)
wy docks at Clucker's Cove for a dozen Sand-Speckled Eggs, but flips TAILS and takes 3   <-- coins, NOT an ingredient
— Round 6: wind is blowin' south —
Crustbeard pays 1 and sails / casts a line, nets a candycrab (+1)
Flaky Jack docks at Glitter Bay for a jar of Crystal Sugar, but flips TAILS and takes 3
Dough Hook pays 1 and sails / casts a line, nets a candycrab (+1)
wy pays 1 and sails
wy is blown into the trade winds and swept around the rim!
wy trades Speckled Eggs + 2 to Flaky Jack for Crystal Sugar — they each get +1 for cooperating
Round 7: A storm be ragin'! It'll blow yer ships west, then north.
Crustbeard is blown by the storm  (x2)
Crustbeard pays 1 and sails / docks at the Spice Isle for sprigs of Red-Hot Cinnamon and flips TAILS, but buys it anyway for 3
Flaky Jack is still docked, so the storm can't run them aground.
A gale blows Flaky Jack off the dock!
Flaky Jack pays 1 and sails / docks at Glitter Bay and flips HEADS — hauls aboard a jar of Crystal Sugar!
Dough Hook spots Flaky Jack dead ahead, so strikes sail and holds fast.
Dough Hook is blown by the storm
Dough Hook pays 1 and sails / casts a line, nets a candycrab (+1)
wy is blown by the storm
wy is blown into the trade winds and swept around the rim!
wy pays 1 and sails / casts a line, catches a sugarfish! (+2)
— Round 8: wind is blowin' east —
Crustbeard pays 1 and sails / casts a line, catches a sugarfish! (+2)
Flaky Jack pays 1 and sails / casts a line, nets a candycrab (+1)
Dough Hook pays 1 and sails / docks at the Spice Isle for sprigs of Red-Hot Cinnamon, but flips TAILS and takes 3
wy pays 1 and sails
wy docks at the Flour Patch and flips HEADS — hauls aboard a sack of Toasty Wheat!   <-- WHEAT #2
— Round 9: wind is blowin' west —
Crustbeard pays 1 and sails / casts a line, nets a candycrab (+1)
Flaky Jack pays 1 and sails / casts a line, catches a sugarfish! (+2)
```

**Also visible in this log, already tracked:** `blownOut` firing twice per storm (two legs — ruled
correct by feasibility), *"is still docked"* immediately followed by *"a gale blows X off the
dock!"* for both Dough Hook (R4) and Flaky Jack (R7) — **that contradiction is FIX-13**, and this log
is fresh evidence for it.

**Source:** Wyatt, 2026-07-31, v1.2 Phase 17 playtest.
