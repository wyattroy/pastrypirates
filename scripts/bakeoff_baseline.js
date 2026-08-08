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

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { Game, roundCfg } from "../v2/src/engine/index.js";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const OUT=path.join(__dirname,"fixtures","bakeoff-baseline.json");
const GAMES=200;
const STRATS=["pirate","trader","balanced","rusher"];

// One game -> a stable string. Only fields that affect what a player SEES or what the engine
// DECIDES are included; anything cosmetic is left out so the fingerprint doesn't churn on copy edits.
function fingerprint(seed){
  const g=new Game(roundCfg(STRATS),seed,true);
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
