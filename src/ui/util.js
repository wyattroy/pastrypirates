// src/ui/util.js
//
// Phase 11 (SPLIT-03/06), waves 11-02. The pure leaf helper cluster: formatting/name/geometry/
// awards/narration-string/session/shot-clock helpers that touch neither the DOM nor `src/net/`
// (tier `helper/logic`, dom:false, net:[] in 11-analysis.json). Extending src/ui/recipe.js's
// established pattern (11-01): move verbatim, replace bare shared/engine/state reads with
// explicit imports, keep bare-identifier calls to still-classic functions (they resolve through
// the PP bridge's `...ui`/`Object.assign(globalThis, PP)` until 11-07 deletes it).
//
// Purity bar for src/ui/: reads DOM and game state, NEVER imports src/net/ (D-07).
// scripts/module_graph_check.js and scripts/ui_contract_check.js both gate this mechanically.
//
// Deviation (mirrors 11-01's RECIPE_BOOK/$ finding): a handful of these functions read `cell`
// (the board's current px-per-grid-cell) or `shipEls` (the array of ship <g> elements) — both
// classic-script top-level `let`s declared at index.html's board-rendering section (not part of
// Phase 10's appState migration; they are render-only state owned by the still-classic
// drawBoard()/render()). A classic script's `let` is invisible to an ES module (same class of
// bug 11-01 hit with RECIPE_BOOK), and neither variable is exclusive to this cluster — dozens of
// still-classic rendering call sites also read them — so, unlike RECIPE_BOOK, they cannot simply
// move here too. Fix: `islandArtPlacement`, `shipXY`, `islandXY` gained an explicit `cellPx`
// parameter (default-free — every call site is still-classic and has `cell` in scope, so each is
// updated in index.html to pass it explicitly) and `boatXY` gained a `shipEls` parameter the same
// way. The EVENT_NARRATION `battle`/`aground`/`shotclockskip` entries gained an optional
// `cellPx=0` third parameter for the same reason; describe()/captions() (which only ever read
// `.txt`/`.cls`/`.caps`, never `.pops`) call with the 2-arg form and let the harmless default
// apply, while spawnPops() (still classic; the only real consumer of `.pops`) is updated to pass
// the live `cell` value as a third argument. See 11-02-SUMMARY.md for the full account.

import {
  appState,
} from "../state/index.js";
import {
  NAMES, HEXCOL, DIRNAME, ING_EMOJI, iname, ilabelImg, dockPlace, dockFlavor, iconImg, ING_IMG,
  CUPCAKE_IMG, CROWN_IMG, TRADE_SWIRL_IMG, CRATE_OVERBOARD_IMG, TET, ISLAND_SHAPE_IMG, emojify,
} from "../shared/index.js";
import { escHtml } from "./recipe.js";

/* ---------- board geometry ---------- */

// Captain rows in the sidebar. `roster` holds the seat claims (name/bot/strat) from Firebase.
// captains panel lists seats in sailing order (turnOrder), rotated so this browser's own seat
// (the human, from its own point of view) always sits at the top — falls back to raw seat index
// before turnOrder is known yet (briefly, at the very start of a game)
export function seatDisplayOrder(){
  const n=appState.game.players.length;
  if(!appState.turnOrder||appState.turnOrder.length!==n)return appState.game.players.map((_,i)=>i);
  const startPos=Math.max(0,appState.turnOrder.indexOf(appState.mySeat));
  return appState.turnOrder.slice(startPos).concat(appState.turnOrder.slice(0,startPos));
}
// dock.png is authored facing right (+x, East) in a slightly perspective/isometric style —
// rotating it 180° to face West flips it upside down and puts the anchor on the wrong side,
// so West is a horizontal mirror instead (stays right-side-up, just points the other way);
// North/South still rotate a quarter turn, which doesn't have that problem.
export function dockOrient(dir){
  if(dir[0]>0)return{rot:0,flip:false};
  if(dir[0]<0)return{rot:0,flip:true};
  return{rot:dir[1]>0?90:-90,flip:false};
}
// maps a canonical (unrotated) island shape image onto the actual rotated/mirrored cells a
// given island was placed with (see shapeFor() in the Game constructor, and TET/ISLAND_SHAPE_IMG
// above) — returns the <image> transform + size needed so shape art lands exactly on the cells.
export function islandArtPlacement(meta,cellsR,cellPx){
  const{shapeIdx,rot,flip}=meta;
  if(shapeIdx<0)return null; // rectangle-mode island (not used by the live game); no art mapping
  const canon=TET[shapeIdx];
  const canonW=Math.max(...canon.map(c=>c[0]))+1, canonH=Math.max(...canon.map(c=>c[1]))+1;
  let s=canon.map(c=>[...c]);
  for(let t=0;t<rot;t++)s=s.map(([x,y])=>[y,-x]);
  if(flip)s=s.map(([x,y])=>[-x,y]);
  const mx=Math.min(...s.map(c=>c[0])),my=Math.min(...s.map(c=>c[1]));
  const anchorX=Math.min(...cellsR.map(c=>c[0])),anchorY=Math.min(...cellsR.map(c=>c[1]));
  const tx=(anchorX-mx)*cellPx, ty=(anchorY-my)*cellPx;
  // shapeFor() rotates/mirrors CELL INDICES (not raw pixel coordinates) — index (x,y) is a unit
  // cell's own corner label, so rotating indices by (x,y)=>(y,-x) actually pivots the geometry
  // about the CENTER of the reference cell (0.5,0.5), and mirroring pivots about x=0.5, not the
  // origin. The image transform below has to rotate/mirror about those same pivots (scaled to
  // pixels) or the art lands exactly one cell off from the true clipped outline.
  const pivot=cellPx/2;
  const transform=`translate(${tx},${ty})${flip?` translate(${cellPx},0) scale(-1,1)`:""} rotate(${-90*rot},${pivot},${pivot})`;
  return{transform,w:canonW*cellPx,h:canonH*cellPx,href:ISLAND_SHAPE_IMG[shapeIdx]};
}
// trace the outer boundary loop(s) of a polyomino (array of [x,y] grid cells) in grid units
export function tracePolygonLoops(cells){
  const setK=new Set(cells.map(c=>c[0]+","+c[1]));
  const edgeMap=new Map();
  for(const [x,y] of cells){
    const sides=[[[x,y],[x+1,y],0,-1],[[x+1,y],[x+1,y+1],1,0],
      [[x+1,y+1],[x,y+1],0,1],[[x,y+1],[x,y],-1,0]];
    for(const [p1,p2,nx,ny] of sides)
      if(!setK.has((x+nx)+","+(y+ny)))edgeMap.set(p1[0]+","+p1[1],p2);
  }
  const visited=new Set(),loops=[];
  for(const startKey of edgeMap.keys()){
    if(visited.has(startKey))continue;
    const loop=[];let curKey=startKey;
    while(!visited.has(curKey)){
      visited.add(curKey);
      const [cx,cy]=curKey.split(",").map(Number);
      loop.push([cx,cy]);
      const next=edgeMap.get(curKey);
      curKey=next[0]+","+next[1];
    }
    loops.push(loop);
  }
  return loops;
}
// build an SVG path with rounded corners from a loop of [x,y] points already in pixel space
export function roundedPathFromLoop(loop,r){
  const n=loop.length;let d="";
  for(let i=0;i<n;i++){
    const prev=loop[(i-1+n)%n],cur=loop[i],next=loop[(i+1)%n];
    const v1=[prev[0]-cur[0],prev[1]-cur[1]],v2=[next[0]-cur[0],next[1]-cur[1]];
    const len1=Math.hypot(v1[0],v1[1]),len2=Math.hypot(v2[0],v2[1]);
    const rr=Math.min(r,len1/2,len2/2);
    const p1=[cur[0]+v1[0]/len1*rr,cur[1]+v1[1]/len1*rr];
    const p2=[cur[0]+v2[0]/len2*rr,cur[1]+v2[1]/len2*rr];
    d+=(i===0?`M ${p1[0]},${p1[1]} `:`L ${p1[0]},${p1[1]} `);
    d+=`Q ${cur[0]},${cur[1]} ${p2[0]},${p2[1]} `;
  }
  return d+"Z";
}
export function shipXY(pos,i,state,cellPx){
  // offset ships sharing a cell
  const same=state.map((s,j)=>({j,k:s.pos[0]+","+s.pos[1]})).filter(o=>o.k===pos[0]+","+pos[1]);
  const my=same.findIndex(o=>o.j===i),m=same.length;
  const ox=m>1?(my%2?1:-1)*cellPx*.18:0, oy=m>2?(my<2?-1:1)*cellPx*.18:0;
  return [(pos[0]+.5)*cellPx+ox,(pos[1]+.5)*cellPx+oy];
}

/* ---------- event text ---------- */
// a claimed seat (roster[i].id truthy) always speaks under the name its captain typed in;
// the default Capt. NAMES are only ever shown for unclaimed bot seats
export function pname(i){
  const s=(appState.roster&&appState.roster[i])||{};
  return s.id?escHtml(s.name):NAMES[i].replace("Capt. ","");
}
// plain (unescaped) display name for a seat — the same source pname() renders, minus the HTML
// escaping. Used by writeGameLog so every finished game records who was playing, including
// solo/local games (which have no rooms/{code}/seats node to cross-reference names from).
export function rawName(i){
  const s=(appState.roster&&appState.roster[i])||{};
  return (s.id?(s.name||"").trim():"")||NAMES[i].replace("Capt. ","");
}
export function pn(i){return `<b style="color:${HEXCOL[i]}">${pname(i)}</b>`;}
// possessive form for narration addressed to spectators of someone else's turn, e.g. "Davy Scones' turn"
export function poss(i){const nm=pname(i);return `<b style="color:${HEXCOL[i]}">${nm}${nm.endsWith("s")?"'":"'s"}</b>`;}
export function fl(h){return h?"⚪H":"⚫T";}
export function fmtItem(x){return /coin/.test(x)?x.replace(" coins","🌕").replace("coins","🌕"):(ING_EMOJI[x]||"")+" "+iname(x);}
// Single source of truth for what an event says (long-log text), pops (board emoji/icon
// animation), and caps (per-ship mini-log caption) — one function per event type instead of
// three independent switches that used to drift out of sync with each other (see describe()/
// spawnPops()/captions() below, all now thin wrappers over this table). `at` is a board-position
// lookup — real when called from spawnPops (which needs coordinates), a harmless no-op stub
// when called from describe()/captions() (which only ever read .txt/.caps, never the pop math).
// notes/edits NARR-04: named for the direction the wind blows TOWARD, matching how DIRNAME and the
// rest of the game already talk about wind.
const WIND_ADJ={N:"northerly",S:"southerly",E:"easterly",W:"westerly"};
export function windHoldPhrase(dir,streak){
  const a=WIND_ADJ[dir]||"wind";
  return (streak||2)>=3?`this ${a} won't quit`:`this ${a} is gusting`;
}
export const EVENT_NARRATION={
  // notes/edits NARR-03: a wind that hasn't changed direction is "still" blowing that way — it
  // doesn't newly go anywhere, so it never says "now".
  // notes/edits NARR-04: any wind, storm or not, that holds one direction two rounds running gets
  // called out; three or more and it's openly refusing to quit.
  newround:e=>{
    const D=DIRNAME[e.dir],D2=DIRNAME[e.dir2];
    const held=(e.windStreak||1)>=2;
    // comma, not an em-dash: the round header is already wrapped in "— … —" and a third dash
    // inside it reads as a run of stray punctuation
    const gust=held?`, ${windHoldPhrase(e.dir,e.windStreak)}`:"";
    if(e.storm){
      // the gust clause goes BEFORE "Batten down the hatches" — appending it after an exclamation
      // reads as a run-on ("...ye scurvy lot!, this easterly is gusting")
      if(e.streak>=2)return {cls:"roundhdr",
        txt:`— Round ${e.round}: ⛈️ The storm's baked in and refuses to cool down! ${held?`It's still aiming ${D}`:`Now it's aiming ${D}`}, then ${D2}${gust}. Batten down the hatches, ye scurvy lot! —`};
      // notes/edits NARR-06 (Wyatt rewrite): the plain held-storm line gets its own wording rather
      // than the shared gust clause; the fresh-storm and streak lines are unchanged.
      if(held)return {cls:"roundhdr",txt:`— Round ${e.round}: ⛈️ STORM! Wind still blows ${D}, then it turns ${D2}, and she's a fierce one —`};
      return {cls:"roundhdr",txt:`— Round ${e.round}: ⛈️ STORM! Wind blows ${D}, then ${D2} —`};
    }
    return {cls:"roundhdr",txt:`— Round ${e.round}: wind ${held?"still blows":"blows"} ${D}${gust} —`};
  },
  windmove:e=>({txt:`${pn(e.p)} is carried by the storm`,caps:[[e.p,"🌬️ drifts"]]}),
  blownOut:e=>({txt:`⛵ A gale blows ${pn(e.p)} off the dock!`}),
  sail:e=>({txt:`${pn(e.p)} pays 1🌕 and sails`,caps:[[e.p,"⛵ sails −1🌕"]]}),
  dodge:(e,at)=>({txt:`${pn(e.p)} pays 1🌕 to anchor safely`,caps:[[e.p,"💨 dodges −1🌕"]],pops:[[at(e.p),"💨"]]}),
  anchor:(e,at)=>({txt:`${pn(e.p)} flips ⚪HEADS — dodges the rocks!`,caps:[[e.p,"⚪H drops anchor ⚓"]],pops:[[at(e.p),"⚓"]]}),
  moored:(e,at)=>({txt:`The dock steadies ${pn(e.p)} from running aground ⚓`,pops:[[at(e.p),"⚓"]]}),
  blocked:(e,at)=>({txt:`Spotting ${pn(e.other)} dead ahead, ${pn(e.p)} strikes sail and holds fast.`,pops:[[at(e.p),"⚓"]]}),
  anchorHold:(e,at)=>({txt:`${pn(e.p)}'s anchor already down — it holds fast, no need to pay twice in one storm ⚓`,pops:[[at(e.p),"⚓"]]}),
  tradewind:(e,at)=>({txt:`🌀 ${pn(e.p)} is carried into the trade winds and whipped around the rim!`,pops:[[at(e.p),"🌀",true,TRADE_SWIRL_IMG]]}),
  parley:(e,at)=>({cls:"trade",txt:`🤝 ${pn(e.a)} offered ${fmtItem(e.offer)} for ${pn(e.b)}'s ${fmtItem(e.want)} — ${e.ok?"deal struck!":"<b>refused</b>"}`,pops:[[at(e.a),e.ok?"🤝":"🙅"]]}),
  aground:(e,at,cellPx=0)=>({txt:e.ing?`${pn(e.p)} flips ⚫TAILS — runs aground! A crate of ${ilabelImg(e.ing)} tumbles overboard and floats back to its island ⚠️`:`${pn(e.p)} flips ⚫TAILS — runs aground! Loses half their coins ⚠️`,
    caps:[[e.p,e.ing?`⚫T aground! ${ING_EMOJI[e.ing]} overboard`:"⚫T aground! 💥 −half 🌕"]],
    pops:e.ing?[[at(e.p),"📦",true,CRATE_OVERBOARD_IMG,"splash"]].concat(islandXY(e.ing,cellPx)?[[islandXY(e.ing,cellPx),ING_EMOJI[e.ing],true,ING_IMG[e.ing],"splash"]]:[]):[[at(e.p),"💥"]]}),
  shipwrecked:(e,at)=>({txt:`${pn(e.p)} is shipwrecked, and spends their turn making repairs.`,caps:[[e.p,"🛠️ shipwrecked — repairs all turn"]],pops:[[at(e.p),"🛠️"]]}),
  dock:(e,at)=>{
    const place=dockPlace(e.ing),flavor=dockFlavor(e.ing);
    // notes/edits NARR-01: every tails-flip report shows the ingredient's art before naming it, so
    // the wording matches the rest of the UI (the `bought` line already did; `coins` now does too).
    // notes/edits NARR-07: an empty island no longer involves a flip at all — its own line says so.
    const g={ing:`docks at ${place} — hauls aboard ${ilabelImg(e.ing)}!`,
      empty:`docks at ${place} and finds no ${ilabelImg(e.ing)}, so grabs 3🌕`,
      bought:`docks at ${place} for ${iconImg(ING_IMG[e.ing])} ${flavor} and flips tails, but buys it anyway for 3🌕`,
      coins:`docks at ${place} for ${iconImg(ING_IMG[e.ing])} ${flavor}, but flips tails and takes 3🌕`};
    const capM={ing:`gets ${ING_EMOJI[e.ing]}!`,empty:"island empty · +3🌕",bought:`buys ${ING_EMOJI[e.ing]} −3🌕`,coins:"+3🌕"};
    // no flip happened on an empty island, so don't caption one
    const F=e.got==="empty"?"":(e.heads?"⚪H":"⚫T");
    const gotIng=(e.got==="ing"||e.got==="bought");
    // #3: the crate rising out of the boat renders the ingredient art (ING_IMG), not the old
    // emoji — the emoji stays as the fallback popEmoji() shows if the image can't load.
    return {txt:`${pn(e.p)} ${g[e.got]}`,caps:[[e.p,F?`docks ${F} ${capM[e.got]}`:`docks — ${capM[e.got]}`]],
      pops:[[at(e.p),gotIng?ING_EMOJI[e.ing]:"🌕",false,gotIng?ING_IMG[e.ing]:null]]};
  },
  // notes/edits NARR-02: name the cooperation bonus rather than leaving a bare "(+1🌕 each)"
  trade:(e,at)=>({cls:"trade",txt:`🤝 ${pn(e.a)} trades ${fmtItem(e.gave)} to ${pn(e.b)} for ${fmtItem(e.got)}${appState.game.cfg.tradeBonus?' <span class="nobrk">— they each get +1🌕 for cooperating like good friendly pirates</span>':""}`,
    caps:[[e.a,`🤝 got ${fmtItem(e.got)}`],[e.b,`🤝 got ${fmtItem(e.gave)}`]],
    pops:[[at(e.a),"🤝"],[at(e.b),"🤝"]]}),
  sidebet:e=>e.won?{cls:"trade",txt:`🔭 ${pn(e.p)} called it${e.amt?` and backed it with ${e.amt}🌕`:""} — Spotter's Bounty +${e.delta}🌕`}
    :{cls:"trade",txt:e.amt?`💰 ${pn(e.p)} backed the wrong ship — loses ${e.amt}🌕`:`🔭 ${pn(e.p)} missed the call — no bounty`},
  battle:(e,at,cellPx=0)=>{
    // count by who actually scored (r[3]) rather than the raw flip pattern — a both-heads
    // downwind round scores a point but isn't "a XOR d landed heads", so filtering on the flips
    // alone silently drops it and undercounts the displayed score.
    const aP=e.rounds.filter(r=>r[3]==="a").length,dP=e.rounds.filter(r=>r[3]==="d").length;
    const rn=e.rounds.length; // BATL-01/02: broadside-round count dropped from the narration (always 0 now)
    const loser=e.winner===e.a?e.d:e.a;
    const [x1,y1]=at(e.a),[x2,y2]=at(e.d);
    const sp=e.spoilIng?ING_EMOJI[e.spoilIng]:"💰"; // e.spoil is HTML (ilabelImg) now — never parse it for a pop icon
    const spImg=e.spoilIng?ING_IMG[e.spoilIng]:null; // #3: won ingredient rises from the boat as art, not emoji
    // ingredient spoils read as the winner taking a crate; coin spoils read as the loser
    // bribing their way out of giving one up — no ingredient actually changes hands there.
    const spoilClause=e.spoilIng?`${pn(e.winner)} takes ${e.spoil}.`:`${pn(loser)} bribes their way out of giving away a crate with ${e.spoil}.`;
    return {cls:"battle",
      txt:`⚔️ ${pn(e.a)} attacks ${pn(e.d)} — ${pn(e.a)} ${e.winner===e.a?"wins":"loses"} ${aP}–${dP} in ${rn} round${rn>1?"s":""}. ${spoilClause}`,
      caps:[[e.winner,`⚔️ wins! +${e.spoil}`],[loser,"⚔️ loses 💸"]],
      pops:[[[(x1+x2)/2,Math.min(y1,y2)-cellPx*.15],"⚔️",true],[at(loser),"💸"],[at(e.winner),sp||"💰",false,spImg]]};
  },
  battleflee:(e,at)=>({cls:"battle",txt:`🏃 ${pn(e.a)} attacks ${pn(e.d)} — both shots miss wildly and ${pn(e.d)} slips away! <span class="nobrk">(pays 1🌕)</span>`,
    caps:[[e.d,"🏃 flees! −1🌕"]],pops:[[at(e.d),"🏃"]]}),
  // notes/edits UI-04: on a catch, the emoji that rises from the boat is the SUGARFISH itself, not
  // the fishing line — you just landed a fish, so show the fish coming up out of the boat.
  fish:(e,at)=>({txt:`${pn(e.p)} casts a line, ${e.heads?'catches a 🐠 sugarfish! <span class="nobrk">(2🌕)</span>':(appState.game.cfg.sardine?'nets a 🦀 candycrab <span class="nobrk">(1🌕)</span>':"comes up empty-handed")}`,
    caps:[[e.p,`🎣 ${e.heads?"⚪H":"⚫T"} ${e.heads?"+2🌕":(appState.game.cfg.sardine?"🦀 +1🌕":"nothing")}`]],
    pops:[[at(e.p),e.heads?"🐠":(appState.game.cfg.sardine?"🦀":"🎣")]]}),
  finish:(e,at)=>({cls:"roundhdr",txt:`🏁 ${pn(e.p)} returns to the Isle of Tortuga with a full recipe!`,
    caps:[[e.p,"🏁 recipe done!"]],pops:[[at(e.p),"🏁",true]]}),
  shotclock:e=>({cls:"trade",txt:`⏱ ${pn(e.p)} was too slow — loses 1🌕, everyone else +1🌕`}),
  shotclockskip:(e,at,cellPx=0)=>({cls:"roundhdr",txt:e.ing?`⏰ Snoozing pirates lose their treasure! ${pn(e.p)} loses the turn — a crate of ${ilabelImg(e.ing)} tumbles overboard and floats back to its island.`:`⏰ Snoozing pirates lose their treasure! ${pn(e.p)} loses the turn — ${e.coins}🌕 tumbles overboard!`,
    pops:e.ing?[[at(e.p),"📦",true,CRATE_OVERBOARD_IMG,"splash"]].concat(islandXY(e.ing,cellPx)?[[islandXY(e.ing,cellPx),ING_EMOJI[e.ing],true,ING_IMG[e.ing],"splash"]]:[]):[[at(e.p),"💰",true,null,"splash"]]}),
  bakeoff:(e,at)=>({cls:"battle",txt:`${iconImg(CUPCAKE_IMG)} BAKEOFF! ${pn(e.a)} vs ${pn(e.b)} — ${pn(e.winner)} takes it!`,
    caps:[[e.winner,`${iconImg(CUPCAKE_IMG)} wins the bakeoff!`]],pops:[[at(e.winner),"🧁",true,CUPCAKE_IMG]]}),
  // notes/edits EOV-01: the blue narration box no longer announces the win — it would duplicate the
  // dedicated one-off victory box (see endLive's flash) and the End of Voyage summary. The board
  // still gets a crown pop over the winner; the announcement itself lives in the celebratory box.
  end:(e,at)=>({cls:"roundhdr",txt:"",caps:[],pops:e.winner===null?[]:[[at(e.winner),"👑",true,CROWN_IMG]]}),
  turn:()=>null,
};
const NO_AT=()=>[0,0]; // describe()/captions() never need real board coordinates
export function describe(e){
  if(!e)return null;
  const fn=EVENT_NARRATION[e.t];if(!fn)return null;
  const r=fn(e,NO_AT);
  // EOV-01: an event that yields no text (the suppressed win banner) produces no captain's-log line
  // at all — the blue box "disappears" rather than showing an empty strip. Board pops still fire via
  // spawnPops, which reads the raw narration independently of this.
  if(!r||!r.txt)return null;
  return {cls:r.cls,txt:emojify(r.txt)};
}
// #: describe() only the events added since logLines was last synced, instead of remapping the
// whole (append-only) game.events history on every single new event. A long-running game racks up
// thousands of events, and re-describing all of them on every tick made each new event O(n) —
// O(n²) over a multi-hour session — which is exactly the kind of session that gets visibly
// laggier the longer it runs. Safe because events are only ever pushed, never spliced/reordered;
// any real reset reassigns logLines directly (see the two `logLines=[...]` resets) rather than
// going through this path.
export function syncLogLines(){
  for(let i=appState.logLines.length;i<appState.game.events.length;i++)appState.logLines.push(describe(appState.game.events[i]));
}

/* ---------- playback ---------- */
// re-triggers the .pulse animation (removing then re-adding forces a reflow so repeat
// changes in quick succession each get their own pulse instead of silently no-op'ing)
export function pulseEl(el){
  el.classList.remove("pulse");
  void el.offsetWidth;
  el.classList.add("pulse");
}

// screen-center of the crate for ingredient `ing` on its home island, so a lost crate can
// visibly splash back where it came from (see #5/#6). Null-safe before the board is built.
export function islandXY(ing,cellPx){
  const isl=(typeof appState.game!=="undefined"&&appState.game&&appState.game.islandOf)?appState.game.islandOf[ing]:null;
  return isl?[(isl[0]+.5)*cellPx,(isl[1]+.5)*cellPx]:null;
}

export function captions(e){
  const fn=EVENT_NARRATION[e.t];if(!fn)return [];
  const r=fn(e,NO_AT);
  return (r&&r.caps)||[];
}
// Derived entirely from the event log (including each event's captured position snapshot),
// so it works identically for live play, a host-reload replay, or scrubbing a finished game —
// no separate live-only counters to keep in sync.
// Walks the full event log once, tallying everything the superlative pool below might need.
// Streak/battle-round events don't carry a separate "who flipped what" trail, so hottestStreak
// is reconstructed here from every individual coin flip embedded in dock/fish/anchor/aground/
// battle-round events, in chronological order.
export function computeAwards(){
  const n=appState.game.players.length;
  const mk=()=>Array(n).fill(0);
  const battlesWon=mk(),battlesLost=mk(),timesAttacked=mk(),fishCount=mk(),dist=mk(),
    trades=mk(),shotClockCount=mk(),longestBattle=mk(),hottestStreak=mk(),streak=mk();
  const bump=(i,heads)=>{
    if(i==null)return;
    if(heads){streak[i]++;if(streak[i]>hottestStreak[i])hottestStreak[i]=streak[i];}
    else streak[i]=0;
  };
  let prevPos=appState.game.players.map(()=>null);
  for(const e of appState.game.events){
    if(e.t==="battle"||e.t==="battleflee"){
      // #5: a fought-then-fled battle still counts toward game.battles, so it must count in the
      // per-player battle stats too (it was a real attack with real rounds) — only the clean
      // win/loss tally is skipped for a flee, since nobody won.
      if(e.t==="battle"&&e.winner!=null){battlesWon[e.winner]++;battlesLost[e.winner===e.a?e.d:e.a]++;}
      timesAttacked[e.d]++;
      const rounds=e.rounds||[],len=rounds.length;
      if(len>longestBattle[e.a])longestBattle[e.a]=len;
      if(len>longestBattle[e.d])longestBattle[e.d]=len;
      for(const r of rounds){bump(e.a,!!r[0]);bump(e.d,!!r[1]);}
    }
    if(e.t==="fish"){if(e.heads)fishCount[e.p]++;bump(e.p,!!e.heads);}
    if(e.t==="dock")bump(e.p,!!e.heads);
    if(e.t==="anchor")bump(e.p,true);
    if(e.t==="aground")bump(e.p,false);
    if(e.t==="trade"){trades[e.a]++;trades[e.b]++;}
    if(e.t==="shotclock"||e.t==="shotclockskip")shotClockCount[e.p]++;
    if(e.state)e.state.forEach((s,i)=>{
      if(prevPos[i])dist[i]+=Math.abs(s.pos[0]-prevPos[i][0])+Math.abs(s.pos[1]-prevPos[i][1]);
      prevPos[i]=s.pos;
    });
  }
  return {battlesWon,battlesLost,timesAttacked,fishCount,dist,trades,shotClockCount,longestBattle,hottestStreak};
}
// notes/edits EOV-04: the end-of-voyage honours. The full pool of ~10 keepsakes, each with a
// pirate-y name, a byline, its 1:1 emblem art (assets/badges/*.png — placeholders Wyatt will
// repaint), and the underlying plain stat. `scale` is roughly "how big a value is impressive" for
// that category, so assignBadges() can compare across categories with different units. `key` selects
// the per-player stat array (computeAwards() output, plus a synthesised `tails`).
const BADGE_POOL=[
  {key:"battlesWon",   img:"cutlass",  name:"The Cutlass of a Thousand Notches", byline:"One notch per fallen foe, carved into the hilt.",                 stat:"Most battles won",   unit:"",         scale:3},
  {key:"fishCount",    img:"herring",  name:"The Golden Herring",                byline:"For the sweetest rod in the ocean.",                              stat:"Most fish caught",   unit:"",         scale:4},
  {key:"dist",         img:"compass",  name:"The Horizon-Chaser's Compass",      byline:"For the salt-crusted soul who sailed further than sense allowed.", stat:"Farthest traveled",  unit:" sq",      scale:45},
  {key:"longestBattle",img:"medal",    name:"The Iron Gut Medal",                byline:"For the crew that refused to sink.",                               stat:"Longest battle",     unit:" rounds",  scale:4},
  {key:"tails",        img:"blackspot",name:"The Black Spot of Bad Tides",       byline:"Survived the curse — worst luck on the Sugar Seas.", stat:"Most tails flipped", unit:" tails", scale:16},
  {key:"hottestStreak",img:"doubloon", name:"The Lucky Doubloon",                byline:"Heads, then heads, then heads again — Lady Luck rode on their shoulder.", stat:"Hottest streak", unit:" heads", scale:4},
  {key:"trades",       img:"ledger",   name:"The Silver-Tongued Ledger",         byline:"Struck more deals than a Tortuga fishmonger on market day.",       stat:"Most trades struck", unit:"",         scale:3},
  {key:"timesAttacked",img:"target",   name:"The Painted Target",                byline:"Somehow every cannon in the Caribbean swung their way.",           stat:"Most set upon",      unit:"",         scale:3},
  {key:"battlesLost",  img:"timbers",  name:"The Splintered Timbers",            byline:"Took a right drubbing and lived to grumble about it.",             stat:"Most battles lost",  unit:"",         scale:3},
  {key:"shotClockCount",img:"barnacle",name:"The Barnacle Brain",                byline:"Pondered each move till the barnacles grew — no rush in these waters.", stat:"Slowest to decide", unit:"",      scale:3},
];
// Guaranteed fallback for a captain who earned no standout stat (rare — everyone at least sails, so
// "Farthest traveled" is nearly always claimable — but this ensures EVERY captain gets one award).
// It still carries a real number: how many ingredients they finished the voyage holding.
const FALLBACK_BADGE={img:"anchor",name:"Good Mate",byline:"Pirated for the love of the game.",stat:"Number of ingredients plundered",unit:""};
// notes/edits EOV-04: every captain gets exactly ONE award, and no two share a category. Build all
// (captain, category) claims with a positive stat, rank them by value/scale (so a 57-square voyage
// and a 4-win rampage compare fairly), then greedily hand each captain their single most impressive
// still-available badge. A captain who can't claim any stat (all zero) gets a flavor fallback.
export function assignBadges(){
  const s=computeAwards();
  const arrs=Object.assign({},s,{tails:appState.game.players.map(p=>(p.flips||0)-(p.heads||0))});
  const n=appState.game.players.length;
  const cands=[];
  for(const def of BADGE_POOL){
    const arr=arrs[def.key];if(!arr)continue;
    for(let i=0;i<n;i++)if(arr[i]>0)cands.push({seat:i,def,value:arr[i],score:arr[i]/def.scale});
  }
  cands.sort((a,b)=>b.score-a.score);
  const bySeat={},usedCat=new Set();
  for(const c of cands){
    if(bySeat[c.seat]!==undefined||usedCat.has(c.def.key))continue;
    bySeat[c.seat]=c;usedCat.add(c.def.key);
  }
  for(let i=0;i<n;i++)if(bySeat[i]===undefined)bySeat[i]={seat:i,def:FALLBACK_BADGE,value:appState.game.players[i].ing.length};
  return appState.game.players.map((p,i)=>bySeat[i]); // one per captain, in seat order
}

// standard subtitle-timing formula: a floor so short messages don't flash away, a per-char
// reading-speed term (~16-17 CPS), a bump for each mid-string pause (,!?.), and a cap so a very
// long message doesn't hold forever — players will click through it.
// notes/edits NARR-05: finished sentences were lingering too long — hold every message for 20%
// less time. Applied to the clamped result so the floor and cap scale with it and the whole curve
// shortens uniformly, rather than short messages sticking at an unchanged floor. This is the HOLD
// duration only; REVEAL_MS_PER_CHAR (the typing rate) is deliberately untouched.
const MSG_HOLD_MULTIPLIER=0.8;
export function msgHoldMs(text){
  text=text||"";
  const base=1000,charTime=50;
  let raw=base+text.length*charTime;
  const body=text.replace(/[.,!?]+$/,""); // trailing punctuation doesn't count as a mid-string pause
  const pauses=(body.match(/[,!?.]/g)||[]).length;
  raw+=pauses*300;
  return Math.round(Math.min(Math.max(raw,1200),7000)*MSG_HOLD_MULTIPLIER);
}

// reads a boat's current on-screen position straight off its own <g>, rather than deriving it
// from game.events[evIdx] — that array is still empty during the pre-round intro narration (boats
// are already docked and drawn by drawBoard() at that point, just not yet driven by real events),
// so a chat bubble sent before "Let's start" would otherwise have nowhere valid to anchor to.
export function boatXY(i,shipEls){
  const el=shipEls[i];if(!el)return null;
  const m=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
  return m?[parseFloat(m[1]),parseFloat(m[2])]:null;
}

// ---- ask(): route the decision to whichever browser owns this seat ----
// opaque pastel blend of a captain color toward white — baked in as a solid color instead of
// alpha-over-background, so it reads correctly regardless of what panel it sits on (previously
// a semi-transparent background let the yellow "needsAction" panel show through and shift hues,
// e.g. the blue captain looked green).
export function pastelize(hex,alpha=.16){
  const n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;
  const mix=c=>Math.round(c*alpha+255*(1-alpha)).toString(16).padStart(2,"0");
  return `#${mix(r)}${mix(g)}${mix(b)}`;
}
export function apBtnStyle(col){return col?` style="border:2px solid ${col};background:${pastelize(col)};font-weight:700"`:"";}
// opts[i] can come back missing — a remote seat's answer can resolve to null (remotePrompt
// resolves null when Firebase gives back a response with no `choice` field, e.g. a dropped
// connection), or a replay log can be stale/corrupt. Left unguarded that throws mid-decision
// and silently stalls whatever awaited it; falling back to a safe index keeps play moving.
export function resolveOpt(opts,i,fallback){
  if(opts[i])return{i,opt:opts[i]};
  console.warn("resolveOpt(): invalid choice index",i,"of",opts.length,"options — defaulting to",fallback);
  return{i:fallback,opt:opts[fallback]};
}
export function ask(msg,opts,colors,sub){
  // during reload-replay, return the recorded choice (an index) mapped through the freshly
  // rebuilt opts — so object-valued options resolve to live game references, not stale copies.
  if(appState.replaying){
    if(appState.dlogIdx<appState.dlog.length){appState.dlogN++;return Promise.resolve(resolveOpt(opts,appState.dlog[appState.dlogIdx++],0).opt.value);}
    endReplay();
  }
  const seat=appState.curSeat;
  netNarrate(seat===appState.mySeat?msg:`${pn(seat)} is deciding…`);
  armClock(seat);
  const isFlip=opts.length===1&&!!opts[0].flip;
  // `sub` is optional helper text rendered under the button row; an option flagged `disabled`
  // renders greyed and non-clickable (notes/edits #5) — used for the too-poor Attack button.
  const base=decisionIsLocal(seat)?localAsk(msg,opts,colors,sub)
    :remotePrompt(seat,{kind:"ask",msg,labels:opts.map(o=>o.label),
       colors:colors?colors.map(c=>c||""):null,classes:opts.map(o=>o.cls||""),
       disabled:opts.map(o=>!!o.disabled),sub:sub||null,flip:isFlip,
       flipIdx:opts.findIndex(o=>o.flip),back:opts.findIndex(o=>o.back)});
  const idxP=withShotClock(seat,base,0);
  return idxP.then(i=>{const r=resolveOpt(opts,i,0);logDecision(r.i);return r.opt.value;});
}
// re-arms the shot clock with a fresh 30s window right before a new decision is shown to
// whichever seat is being asked — every ask()/pickCell()/non-flip battleAsk() call in the
// game goes through this, so every decision anyone makes is timed the same way.
export function armClock(seat){
  if(!appState.isHost)return;
  const p=appState.game.players[seat];if(p)startShotClock(p);
}
