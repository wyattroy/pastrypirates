---
created: 2026-08-01T00:25:00.000Z
title: Wind carries a pastry scent on every direction CHANGE — Wyatt's 35-line library
area: narration
severity: feature
files:
  - src/ui/util.js:320-325 (newround — the wind line, including the "still blows" branch)
  - src/engine/index.js (the newround event — dir, windStreak already recorded)
---

## What Wyatt asked for

2026-08-01: *"I created a list of wind descriptors of different scents that can be travelling on the
wind to make the game feel more delicious."*

> *"Round 3: wind is blowin' north, wafting clouds of cotton candy."*

**He was right that he had spec'd this before** — it is **V13-63** in the v1.3 intake (*"a long list
of pre-written ingredient-based descriptors… to evoke hunger in all the players"*). What was missing
then was the list itself and the selection rule. Both now exist. **This todo supersedes V13-63's
"needs a decision" status** on content; the engine-risk question below is still live.

## The rules

1. **Vary randomly**, never repeating a sentence from the same ingredient category back-to-back.
2. **Only on a direction CHANGE.** If the wind blows the same way two rounds running, use the
   existing standard line with no scent:
   - Change → *"Round 3: wind is blowin' north, wafting clouds of cotton candy."*
   - Repeat → *"Round 4: wind is still blowin' north, this northerly is gusting"*

**Rule 2 is the load-bearing one and it is doing more work than it looks.** The existing "still
blows / gusting" branch already exists (`src/ui/util.js:323`) and already keys off `windStreak`, so
the scent slots cleanly into the *other* branch with no restructuring. It also **rations** the
device — a scent every round would wear out 35 lines fast and stop reading as a treat.

## ⚠ The determinism constraint — this decides the implementation

**Do NOT pick the line with `this.r()`.** The intake flagged this prominently and it is correct: this
codebase routes all randomness through the seeded RNG, and **consuming one extra draw shifts every
subsequent draw in the sequence — invalidating all 31 determinism fixtures.** That would drag a
narration flourish through the one-way door.

**Derive the choice from data the event already carries instead.** The `newround` event records
`dir`, `round`, `streak` and `windStreak` (`src/ui/util.js:320-323`) — all already serialized. A
lookup keyed off those is:

- **deterministic** — every client picks the same line, so multiplayer stays in sync with no
  broadcast;
- **fixture-safe** — zero new RNG draws, so **this ships in the visual milestone, not the gated
  re-record**;
- still unpredictable to a player, which is all "random" needs to mean here.

Feasibility already reached the same conclusion: *"a UI-tier lookup keyed off already-recorded data
adds zero engine RNG draws and zero new event fields. This is the cheap one."*

**The no-repeat-category rule must also be derived, not remembered.** A module-level "last category"
variable would desync a guest who joined late or a client mid-replay. Key it off the round number so
it is reproducible from the event alone.

## The library — Wyatt's words, verbatim, 2026-08-01

**Sugar**
- wafting clouds of cotton candy
- carrying the crackle of burnt caramel
- dusted with powdered sugar
- sticky with molasses
- heavy with toffee cooling on a slab

**Cocoa**
- bringing a whiff of dark chocolate
- bitter with roasted cocoa nibs
- swirling with the smell of hot chocolate
- clouded with cocoa powder
- rich with warm fudge

**Dairy**
- scented with melted butter
- carrying the nutty smell of browned butter
- cool as fresh cream
- laced with warm milk
- buttery as a pan straight from the oven

**Cinnamon**
- smelling like cinnamon sugar
- warm with cinnamon bark
- spiced with cinnamon and clove
- trailing the scent of cinnamon rolls baking
- hot with red cinnamon dust

**Eggs**
- smooth as warm custard
- carrying the scent of meringue browning
- warm like an egg-washed crust turning gold
- sweet as cracked crème brûlée
- light like italian meringue frosting

**Wheat**
- carrying the smell of freshly baked bread
- yeasty with rising dough
- hazy with flour
- toasty as a browned pie crust
- warm with loaves pulled from a hot oven

**Vanilla**
- laced with vanilla bean
- perfumed with vanilla sugar
- carrying a whiff of split vanilla pods
- soft with vanilla cream
- floral with vanilla orchids in bloom

**7 categories × 5 = 35 lines.** Ship them **exactly as written** — this is Wyatt's own copy, and
D-16 applies: his text is the text.

**One thing to raise with him, not to decide:** the categories match the game's seven ingredients.
Worth asking whether the scent should ever **relate to the round** — the ingredient the wind blows
toward, say — or stay purely decorative. Purely decorative is simpler and safer; a relationship
would be a nice touch but is a design choice, not an implementation detail.

**Source:** Wyatt, 2026-08-01. Supersedes V13-63's content question.
