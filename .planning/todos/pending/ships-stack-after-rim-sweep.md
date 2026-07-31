---
id: ships-stack-after-rim-sweep
title: Two ships can occupy one square after a trade-wind sweep — ruled ACCEPTED, do not fix
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

A trade-wind sweep moves a ship to its arc's head with **no occupancy test**. If another captain is
already sitting on that head cell, both end up on the same square. Two sweeps into the same arc in
the same round will do it reliably.

## The site this ruling protects

`src/engine/index.js:244-251`, `tradewind()`:

```js
tradewind(p){ // entering the rim channel sweeps you to the head of that quadrant
  if(!this.isRound)return false;
  const head=this.rimHead[p.pos[0]+","+p.pos[1]];
  if(head&&(head[0]!==p.pos[0]||head[1]!==p.pos[1])){
    p.pos=[...head];this.ev({t:"tradewind",p:p.idx});return true;
  }
  return false;
}
```

There is no `this.players.some(q => …q.pos===head)` guard, and there is deliberately not going to be
one. Note that ordinary movement DOES respect occupancy (a wind push stops short against another
ship — `windLeg`'s `blocked` branch), so this reads like an inconsistency. It is a knowing one.

## Wyatt's ruling

> "i know this, and have no good solution, because the logic is weird… I think it's fine -- it
> renders okay in the game, because the renderer seems to nudge them next to each other on the same
> square so they're both visible."

**Ruled ACCEPTED. Do not fix.**

## The load-bearing half: the renderer nudge

**This is the part that makes the stacking acceptable, and it is why this file exists.**
`shipXY()` (`src/ui/util.js:199-205`) offsets ships that share a cell by ±0.18 of a cell:

```js
const same=state.map((s,j)=>({j,k:s.pos[0]+","+s.pos[1]})).filter(o=>o.k===pos[0]+","+pos[1]);
const my=same.findIndex(o=>o.j===i),m=same.length;
const ox=m>1?(my%2?1:-1)*cellPx*.18:0, oy=m>2?(my<2?-1:1)*cellPx*.18:0;
```

So two stacked boats are both visible, side by side, and a third and fourth are offset vertically
too. The overlap never becomes a hidden ship.

## Why this file exists

A future pass that notices the missing occupancy test will see a real asymmetry with ordinary
movement and will be tempted to "fix" it — by blocking the sweep, by bouncing the second ship to an
adjacent cell, or by walking it back one square. **Every one of those is a RULES CHANGE**, and it
would trade a harmless visual overlap for a genuine change in how far the trade winds carry you.
Wyatt has weighed it and chosen the overlap.

**Two things to check before ever revisiting:** whether `shipXY`'s nudge still exists (if it were
ever removed, the stacking WOULD become a real defect — the two are coupled), and whether Wyatt has
changed his mind. Absent both, leave `tradewind()` exactly as it is.

Related: G14 (2026-07-30) made the sweep animate square-by-square on host and guest. It changed
nothing about where a ship lands, so it neither creates nor fixes this.
