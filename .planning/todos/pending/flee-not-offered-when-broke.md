---
id: flee-not-offered-when-broke
title: A broke defender is never offered the flee prompt — ruled NOT a bug
status: closed-not-a-bug
type: ruling
severity: low
area: gameplay
created: 2026-07-30
source: Phase 15 playtest notes (Wyatt, 2026-07-30)
resolves_phase: null
regression: false
---

## The observation

Fleeing a battle costs 1🌕. A defender with 0 coins who flips double-tails is simply never shown the
flee prompt — the option vanishes silently, with no line explaining why.

## The site this ruling protects

`src/orchestrator.js:536`:

```js
if(bothTails&&a<need&&d<need&&def.coins>=1){
```

The `def.coins>=1` conjunct is what suppresses the prompt. There is **no** `else` branch and **no**
"ye're too broke to flee" narration anywhere — that absence is deliberate, not an oversight.

## Wyatt's ruling

> "we don't need to keep reminding a broke player that they're too broke to flee every time they
> flip double-tails."

**Ruled NOT a bug. Closed.** No copy is to be written for this branch.

## Why this file exists

A future dead-copy sweep in the D-33/D-34/D-40/D-41 family looks for guarded branches that render
nothing and asks whether a missing line should be added or the branch removed. This one will look
exactly like an unfinished branch: a solvency gate with no user-visible explanation.

**Read this before "completing" it.** The silence is the approved behaviour. Double-tails can recur
many times in a single battle-heavy game, and a repeated "ye cannot afford to flee" line was
considered and rejected as nagging. Neither add the line nor remove the `def.coins>=1` gate.
