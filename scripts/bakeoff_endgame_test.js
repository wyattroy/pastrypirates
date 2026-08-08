#!/usr/bin/env node
// scripts/bakeoff_endgame_test.js
//
// HOW A BAKE-OFF VOYAGE ENDS. Four scenarios, driven against a real Game rather than the pure core,
// because every one of them is about how the bake-off's new state (baking / bake / bakedToday)
// meets machinery that predates it (finishOrder, eligibleFinishers, bakeRank, the collab scene).
//
// The one that matters most is the SAME-DAY TIE. The whole reason bakes resolve at the END of a day
// instead of the instant one succeeds is that a captain later in the rotation must still get to
// play — so two captains finishing on one day is a designed outcome, not an edge case, and it has
// to land in the collaborative bakery rather than crowning whoever happened to sit earlier in the
// seat order.
//
//   node scripts/bakeoff_endgame_test.js

import { Game, roundCfg } from "../v2/src/engine/index.js";

const STRATS=["pirate","trader","balanced","rusher"];
let failures=0;
function check(name,ok,detail){
  if(ok){console.log("PASS "+name);return;}
  failures++;console.log("FAIL "+name+(detail?"  — "+detail:""));
}

// A game parked in a known state: `seats` are given a complete recipe and set down at Tortuga.
function staged(seed,seats){
  const g=new Game({...roundCfg(STRATS),bakeoff:true},seed,true);
  for(const i of seats){
    const p=g.players[i];
    p.ing=[...p.recipe];
    p.pos=[g.home[0],g.home[1]-1];       // adjacent to home is what canBake asks for
  }
  return g;
}
// The answer that solves a bench outright: for each recipe step, the bowl holding it.
const perfect=(bake)=>bake.order.map(ing=>bake.slots.indexOf(ing));

/* ---- 1. THE SAME-DAY TIE: two captains bake on one day ---- */
{
  const g=staged(7,[0,2]);
  check("both captains can light their ovens",g.lightOvens(g.players[0])&&g.lightOvens(g.players[2]));
  // stack the ranking so the answer is knowable rather than incidental: seat 2 carries more crates,
  // which is bakeRank's first tiebreak
  g.players[2].ing=[...g.players[2].ing,...g.players[2].recipe.slice(0,2)];
  for(const i of [0,2]){
    const p=g.players[i];
    g.bakeSetup(p);
    g.bakeResolve(p,perfect(p.bake));
  }
  check("both are enrolled in the same day's resolution",
        g.players[0].bakedToday===true&&g.players[2].bakedToday===true);
  const ended=g.endBakeDay();
  check("the day ends the voyage",ended===true);
  check("both land in finishOrder",g.finishOrder.length===2&&g.finishOrder.includes(0)&&g.finishOrder.includes(2),
        "finishOrder="+JSON.stringify(g.finishOrder));
  check("neither is left flagged as still baking",!g.players[0].baking&&!g.players[2].baking);
  const winner=g.resolveEnd();
  const collab=g.events.filter(e=>e.t==="collab");
  check("the collab scene plays exactly once",collab.length===1,collab.length+" collab events");
  check("bakeRank decides, not seat order (seat 2 has more crates)",winner===2,"winner="+winner);
  check("the collab scene lists both finishers, ranked",
        collab.length===1&&collab[0].finishers.length===2&&collab[0].finishers[0]===2,
        collab.length?JSON.stringify(collab[0].finishers):"no collab event");
}

/* ---- 2. ONE captain alone gets no collab scene ---- */
{
  const g=staged(11,[1]);
  g.lightOvens(g.players[1]);
  g.bakeSetup(g.players[1]);
  g.bakeResolve(g.players[1],perfect(g.players[1].bake));
  g.endBakeDay();
  const winner=g.resolveEnd();
  check("a lone finisher just wins",winner===1,"winner="+winner);
  check("no collab scene for one finisher",g.events.filter(e=>e.t==="collab").length===0);
}

/* ---- 3. A FAILED bake does not end the day ---- */
{
  const g=staged(23,[0]);
  g.lightOvens(g.players[0]);
  const p=g.players[0];
  g.bakeSetup(p);
  // an answer guaranteed wrong at every step: the correct one rotated by one
  const right=perfect(p.bake);
  g.bakeResolve(p,right.slice(1).concat(right[0]));
  check("a failed bake leaves the captain at the ovens",p.baking===true&&p.done===false);
  check("a failed bake does not end the day",g.endBakeDay()===false);
  check("and does not put anyone in finishOrder",g.finishOrder.length===0,
        "finishOrder="+JSON.stringify(g.finishOrder));
  check("the captain is still enrolled for tomorrow",g.bakersToday([0,1,2,3]).includes(0));
}

/* ---- 4. THE SANCTUARY RULE: a captain at the ovens cannot be attacked ---- */
{
  const g=staged(31,[0]);
  const [a,d]=[g.players[1],g.players[0]];
  a.coins=99;
  a.pos=[d.pos[0]+1,d.pos[1]];            // adjacent, so the only thing left to test is the rule
  const before=g.canAttack(a,d);
  g.lightOvens(d);
  const after=g.canAttack(a,d);
  check("the raid is legal right up until the ovens are lit",before===true,
        "canAttack was already false before lighting — this scenario proves nothing");
  check("lighting the ovens makes the captain untouchable",after===false);
}

/* ---- 5. WITH THE FLAG OFF, none of the above machinery engages ---- */
{
  const g=new Game({...roundCfg(STRATS),bakeoff:false},7,true);
  const p=g.players[0];
  p.ing=[...p.recipe];p.pos=[g.home[0],g.home[1]-1];
  check("lightOvens is a no-op with the flag off",g.lightOvens(p)===false);
  check("and leaves no bake state behind",!p.baking&&!p.bake);
  check("checkFinish still finishes the old way",g.checkFinish(p)===true&&p.done===true);
}

console.log(failures?("\n"+failures+" FAILED"):"\nthe bake-off endgame holds");
process.exit(failures?1:0);
