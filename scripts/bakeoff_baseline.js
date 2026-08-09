#!/usr/bin/env node
// scripts/bakeoff_baseline.js
//
// THE ROLLBACK GUARANTEE, MADE MECHANICAL.
//
// The bake-off ships behind BAKEOFF_ENABLED, and the promise is that flipping it false restores
// today's game exactly. That promise is worthless as an assertion — the whole point of a feature
// flag is that nobody re-reads the disabled path. So this captures a fingerprint of the engine's
// full event stream across many seeded games BEFORE the feature exists, and re-checks it after.
//
// Fingerprint, not a diff: a SHA of every event's type plus its ordering-relevant fields, per game,
// plus the seeded RNG call count. randCalls is the sharpest signal there is — if a new code path
// draws even one extra random number with the flag off, every subsequent event in that game shifts
// and the hash moves. A change that is genuinely inert cannot move it.
//
//   node scripts/bakeoff_baseline.js --write     capture (run this BEFORE changing the engine)
//   node scripts/bakeoff_baseline.js             verify against the captured file
//
// RE-BASED ONCE, 2026-08-08, and here is exactly why — because a re-captured baseline is worthless
// if nobody records what moved. Wyatt lowered buried treasure from 6 coins to 5 (roundCfg's
// dockHeads), which is a deliberate change to the RULESET, not a leak from the bake-off. It moved
// 181 of 200 games, as any economy change would.
//
// It was proved to be the only cause before re-capturing, rather than assumed: setting dockHeads
// back to 6 with every other line of the feature still in place returned all 200 games to
// byte-identical. So the flag-off path is still inert with respect to the BAKE-OFF; it has simply
// been re-anchored to the v2bakeoff ruleset, which now deliberately differs from /v2/'s.
//
// RE-BASED A SECOND TIME, 2026-08-09, same discipline. Wyatt, watching a pass-and-play voyage:
// "the bots are stupid — sometimes they pass instead of dock — even when theyre at a dock and could
// make money or gather resources that others need." Two fixes to the shared bot brain followed
// (chooseAction no longer commits a turn to a trade botOpenOffer will refuse to open; a refused
// action falls back to working the dock instead of ending the turn). Both change what bots DO, so
// they move the event stream in every game a bot was previously wasting a turn in — 162 of 200.
//
// Proved to be the only cause before re-capturing, same as last time: stashing exactly those two
// edits and re-running returned all 200 games to byte-identical. Measured effect, over 300 games:
// passes taken while standing at a workable dock went 3,746 -> 0, turns spent on a trade that was
// never even announced went 4,884 -> 0, and the median voyage shortened by roughly half a day.
//
// What this file still guarantees: no FURTHER bake-off code leaks into the disabled path from here.
// What it no longer guarantees: that /v2bakeoff/ with the flag off plays identically to /v2/ (that
// stopped being true on purpose at the first re-base), NOR that the bot brain is frozen — it is
// under active work, and a bot change is expected to move this file. Read the diff, prove the cause,
// record it here, then re-capture.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { Game, roundCfg } from "../v2bakeoff/src/engine/index.js";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const OUT=path.join(__dirname,"fixtures","bakeoff-baseline.json");
const GAMES=200;
const STRATS=["pirate","trader","balanced","rusher"];

// One game -> a stable string. Only fields that affect what a player SEES or what the engine
// DECIDES are included; anything cosmetic is left out so the fingerprint doesn't churn on copy edits.
function fingerprint(seed){
  // FORCE THE FLAG OFF. This corpus exists to prove the DISABLED path is unchanged, so it must
  // never inherit whatever BAKEOFF_ENABLED happens to be set to while the feature is being built.
  const g=new Game({...roundCfg(STRATS),bakeoff:false},seed,true);
  const w=g.play();
  const parts=g.events.map(e=>{
    const keep=["t","p","a","d","dir","ing","winner","heads","got","kind","spoilIng","dist","round"];
    return keep.filter(k=>e[k]!==undefined).map(k=>k+"="+e[k]).join(",");
  });
  return {seed,winner:w,rounds:g.round,randCalls:g.randCalls,
    events:g.events.length,
    hash:crypto.createHash("sha1").update(parts.join(";")).digest("hex").slice(0,16)};
}

function capture(){
  const rows=[];
  for(let s=1;s<=GAMES;s++)rows.push(fingerprint(s));
  return {games:GAMES,strategies:STRATS,rows};
}

const write=process.argv.includes("--write");
const now=capture();

if(write){
  fs.mkdirSync(path.dirname(OUT),{recursive:true});
  fs.writeFileSync(OUT,JSON.stringify(now,null,1));
  console.log("captured "+now.games+" games -> "+path.relative(process.cwd(),OUT));
  console.log("total rng draws across the corpus: "+now.rows.reduce((a,r)=>a+r.randCalls,0));
  process.exit(0);
}

if(!fs.existsSync(OUT)){
  console.log("FAIL no baseline captured yet — run with --write BEFORE changing the engine");
  process.exit(1);
}
const was=JSON.parse(fs.readFileSync(OUT,"utf8"));
const diffs=[];
for(let i=0;i<Math.max(was.rows.length,now.rows.length);i++){
  const a=was.rows[i],b=now.rows[i];
  if(!a||!b){diffs.push("game count changed: "+was.rows.length+" -> "+now.rows.length);break;}
  const keys=["winner","rounds","randCalls","events","hash"];
  const moved=keys.filter(k=>String(a[k])!==String(b[k]));
  if(moved.length)diffs.push("seed "+a.seed+": "+moved.map(k=>k+" "+a[k]+" -> "+b[k]).join(", "));
}
if(diffs.length){
  console.log("FAIL the disabled path is NOT inert — "+diffs.length+" of "+was.rows.length+" games differ");
  diffs.slice(0,8).forEach(d=>console.log("  "+d));
  process.exit(1);
}
console.log("PASS all "+was.rows.length+" games byte-identical to the pre-bake-off baseline");
console.log("     (winner, day count, rng draw count, event count and event-stream hash all match)");
