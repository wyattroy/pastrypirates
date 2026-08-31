#!/usr/bin/env node
/* WHOSE TURN IS IT — ONE FACT, ONE WRITER.  (Step 3 gate, MEASURER 2026-08-31)
   "whose turn is it" is stored TWICE: appState.curSeat (written by setActor, src/ui/util.js:1822)
   and stage.js's S.activeSeat (written by window.__pp4.actor, src/ui/stage.js:3682).
   ribbonTick draws `S.activeSeat ?? appState.curSeat` (src/ui/stage.js:1206) — so a write that
   moves ONLY curSeat is a write the ribbon does not draw.
   applyActiveSeat() (src/ui/util.js:1840) is the converged writer: it moves BOTH.
   THIS GATE: every write to the fact goes through applyActiveSeat. Any direct setActor() call
   outside its definition and outside applyActiveSeat is a second writer of one fact. */
import fs from 'node:fs';import path from 'node:path';
const ROOT=process.argv[2]||'/home/user/pastrypirates';
const SRC=path.join(ROOT,'src');
const files=[];(function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){
  const p=path.join(d,f.name);if(f.isDirectory())walk(p);else if(f.name.endsWith('.js'))files.push(p);}})(SRC);
// INSTRUMENT REACHED ITS SUBJECT? prove the three anchors exist before believing any count.
const util=fs.readFileSync(path.join(SRC,'ui/util.js'),'utf8');
const stage=fs.readFileSync(path.join(SRC,'ui/stage.js'),'utf8');
const anchors={
  'setActor defined in util.js (NOT exported)':/(?<!export )function setActor\(s\)\{appState\.curSeat=s;\}/.test(util),
  'setActor is not exported':!/export function setActor\(/.test(util),
  'applyActiveSeat defined in util.js':/export function applyActiveSeat\(seat\)\{/.test(util),
  'applyActiveSeat calls setActor':/applyActiveSeat\(seat\)\{[\s\S]{0,1200}?setActor\(/.test(util),
  'applyActiveSeat calls __pp4.actor':/applyActiveSeat\(seat\)\{[\s\S]{0,1200}?__pp4\.actor\(/.test(util),
  'ribbonTick prefers S.activeSeat':/S\.activeSeat != null\) \? S\.activeSeat : \(appState\.curSeat/.test(stage),
};
console.log('SUBJECT REACHED:');for(const[k,v]of Object.entries(anchors))console.log('  '+(v?'yes':'NO ')+'  '+k);
if(Object.values(anchors).some(v=>!v)){console.log('\nINCONCLUSIVE — the code this gate describes has moved. Fix the gate, do not trust it.');process.exit(2);}
const viol=[];
for(const f of files){const lines=fs.readFileSync(f,'utf8').split('\n');
  lines.forEach((L,i)=>{
    const code=L.replace(/\/\/.*$/,'');
    if(!/\bsetActor\s*\(/.test(code))return;
    if(/^\s*(export )?function setActor\(s\)\{appState\.curSeat=s;\}/.test(code))return; // the definition itself
    if(f.endsWith('ui/util.js')&&/^\s*setActor\(s\);\s*$/.test(code))return;    // the one call, inside applyActiveSeat
    if(/^\s*(import|export)\b/.test(code)||/^\s*[\w,\s]+,\s*$/.test(code)&&!/\(/.test(code.replace(/setActor\s*\(/,'')))return;
    viol.push(`${path.relative(ROOT,f)}:${i+1}: ${L.trim().slice(0,90)}`);});}
// drop import-manifest lines (setActor listed among imported names, no call parens after it)
const real=viol.filter(v=>/setActor\s*\(/.test(v));
console.log(`\nDIRECT setActor() CALLS OUTSIDE applyActiveSeat: ${real.length}`);
for(const v of real)console.log('  '+v);
if(real.length){console.log(`\nRED — "whose turn is it" has ${real.length+1} writers (${real.length} direct + applyActiveSeat).`);
  console.log('Each direct call moves appState.curSeat and leaves S.activeSeat stale; stage.js:1206 draws S.activeSeat first.');process.exit(1);}
console.log('\nGREEN — applyActiveSeat is the only writer of the active seat.');process.exit(0);
