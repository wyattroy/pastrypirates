---
created: 2026-08-01T00:10:00.000Z
title: Bots can both fish AND dock at Tortuga to start their bakery in one turn
area: gameplay
severity: major
files:
  - src/engine/index.js (takeTurn — the bot turn structure)
  - src/ui/flow.js (botTurn — the live bot path)
---

## Problem

Wyatt, 2026-08-01: **"Bots should not be able to fish as well as dock at Tortuga to start their
bakeries, but they can do that."**

A turn is meant to be **one action**. A bot taking two is a **fairness bug** — it gets a free coin
from fishing on the same turn it banks its win condition, which no human player can do.

## This is the same shape as AI-01, already fixed once

v1.2's **AI-01** was exactly this class of defect: *"a bot that hails/parleys the human no longer
appears to take two actions in one turn (hail and fish/dock/etc.)"*. That fix decided the rule for
**hail**, and mirrored it into the deterministic engine's `takeTurn` so replay stayed consistent.

**So the mechanism for "a bot's turn ends after its action" already exists** — it was applied to the
hail path and evidently not to the Tortuga/bakery path. **Look at how AI-01 closed the hail case
first**; this is likely the same guard in a second place, not a new design problem.

## The decision that has to be made explicitly

AI-01's own requirement text records that the rule was **decided with Wyatt**, not assumed. The same
applies here — confirm before implementing:

- Does docking at Tortuga to start the bakery **consume the turn's action**, so no fishing after?
- Or is arriving home a free event, with the action still available?

Wyatt's phrasing (*"should not be able to fish as well as"*) points at the first, but it should be
his explicit ruling, since it changes bot strategy and therefore game balance.

## Determinism — this one probably DOES need the re-record

**Unlike most items in this batch, this changes what bots do**, not how it is described. A bot that
stops taking a second action produces a different event stream, which means **the 31-seed corpus no
longer matches.**

**So this belongs in v1.4's single gated re-record phase, not in the visual milestone.** AI-01 set
the precedent: it was mirrored into the engine's `takeTurn` specifically so replay stayed consistent,
and it rode in a phase that owned the determinism cost.

**Check both paths.** The live bot turn (`src/ui/flow.js`'s `botTurn`) and the headless engine
(`src/engine/index.js`'s `takeTurn`) are separate implementations that must agree — the same
divergence that produced FIX-13, where the engine guards something the live path does not.

**Source:** Wyatt, 2026-08-01.
