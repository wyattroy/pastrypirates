// src/ui/util.js
//
// Phase 11 (SPLIT-03/06), waves 11-02. The pure leaf helper cluster: formatting/name/geometry/
// awards/narration-string/session/shot-clock helpers that touch neither the DOM nor `src/net/`
// (tier `helper/logic`, dom:false, net:[] in 11-analysis.json). Extending src/ui/recipe.js's
// established pattern (11-01): move verbatim, replace bare shared/engine/state reads with
// explicit imports, keep bare-identifier calls to still-classic functions (they resolved through
// the bridge's global-object spread until Phase 11 (11-07) deleted it).
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
// move here too. Fix: `islandArtPlacement`, `shipXY`, `islandXY`, `spawnPops` gained an explicit
// `cellPx` parameter (default-free — every call site is still-classic and has `cell` in scope, so
// each is updated in index.html to pass it explicitly) and `boatXY` gained a `shipEls` parameter
// the same way. The EVENT_NARRATION `battle`/`aground`/`shotclockskip` entries gained an optional
// `cellPx=0` third parameter for the same reason; describe()/captions() (which only ever read
// `.txt`/`.cls`/`.caps`, never `.pops`) call with the 2-arg form and let the harmless default
// apply, while spawnPops() (the only real consumer of `.pops`) passes its own `cellPx` through.
// See 11-02-SUMMARY.md for the full account.
//
// Deviation (Rule 1 — bug): `saveSoloState()` read a bare `soloMeta` identifier instead of
// `appState.soloMeta` — a leftover from the Phase 10 appState migration that this migration's own
// tooling missed. Caught (and silently swallowed) by the surrounding try/catch, so `pp_solo`
// localStorage has never actually persisted; fixed while moving (Rule 1).
//
// Deviation (Rule 3 — blocking): `replayShortfall`/`REPLAY_SHORTFALL_TOLERANCE` used to live inside
// a sentinel-comment region in index.html that scripts/dlog_replay_test.js sliced out via
// `node:vm` at test time (see that script's original header). Moving them here retires that
// slicing hack entirely — dlog_replay_test.js now does a native `import` of this module instead;
// see its updated header comment for the full account.

import {
  appState,
} from "../state/index.js";
import { roundCfg } from "../engine/index.js";
import {
  NAMES, HEXCOL, DIRNAME, ING_EMOJI, iname, ilabelImg, dockPlace, dockFlavor, iconImg, ING_IMG,
  CUPCAKE_IMG, CROWN_IMG, TRADE_SWIRL_IMG, CRATE_OVERBOARD_IMG, TET, ISLAND_SHAPE_IMG, emojify,
  ASSET_BASE, BOARD_IMG, DOCK_IMG, WIND_ARROW_IMG, BOAT_IMG, ING_ALL, COIN_IMG,
} from "../shared/index.js";
import { escHtml } from "./recipe.js";
// 11-07 (bridge deletion fix): util.js is a common dependency of src/ui/board.js, panel.js,
// lobby.js, and flow.js — it can never import any of THEM back without closing an import cycle
// module_graph_check.js's "no import cycle" assertion forbids. A handful of functions here
// (ask/botBeat/narrateCurrent/applyShotClockPenalty/toggleShotClockPause/shotClockTick/
// spawnPops/updateRecipeBanner/resumeSoloGame) genuinely need to CALL a rendering function that
// lives in one of those sibling modules (liveRender/flash/setClockUI/narrateLastEvent from
// panel.js; popEmoji/render from board.js), or a net-adjacent orchestration function that lives
// in src/orchestrator.js (main tier, which src/ui/ can never import either). Both cases route
// through the SAME injected-handler seam src/ui/handlers.js already provides for the 5 original
// net edges — see that file's own header for the full account. `buildPlayerRows` itself is
// relocated INTO this file from src/ui/lobby.js this same wave, for the opposite reason: it has
// zero net/sibling-rendering dependencies of its own, and src/ui/board.js (which calls it) already
// imports this file directly, so a plain import is strictly simpler than a seam entry here.
import { netHandlers } from "./handlers.js";

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
// 11-07 (bridge deletion fix): relocated here verbatim from src/ui/lobby.js. lobby.js already
// imports src/ui/board.js's syncBoardSizing(), so board.js importing buildPlayerRows() BACK from
// lobby.js (its only other caller besides this module's own orchestrator-driven call sites) would
// close an import cycle module_graph_check.js's "no import cycle" assertion forbids. This function
// has no dependency of its own on anything lobby-specific — it only needs seatDisplayOrder/pname
// (both already local to this file) plus escHtml/HEXCOL/COIN_IMG/iconImg (already imported here) —
// so moving it into src/ui/util.js (which src/ui/board.js already imports directly) resolves the
// bare read with a plain import, no seam needed.
export function buildPlayerRows(){
  const $=id=>document.getElementById(id); // this file's first DOM read — see the header note above
  let html="";
  const order=seatDisplayOrder();
  for(const i of order){
    const s=(appState.roster&&appState.roster[i])||{};
    const who=s.id ? (i===appState.mySeat?`${escHtml(s.name)} — that's you!`:escHtml(s.name))
                   : `🤖 bot (${s.strat||appState.game.cfg.strategies[i]})`;
    const displayName=pname(i);
    html+=`<div class="player-row" id="prow${i}" style="background:${HEXCOL[i]}18;--rowcol:${HEXCOL[i]}" title="${who}">
      <div class="prowTop">
        <span class="dot" style="background:${HEXCOL[i]}"></span>
        <span class="pname" id="pname${i}" style="color:${HEXCOL[i]}"><span class="pnameInner">${displayName}</span></span>
        <span class="coinsWrap"><span class="coins" id="coins${i}">${iconImg(COIN_IMG)} –</span><span class="crown" id="crown${i}"></span></span>
        <span class="chips" id="chips${i}"></span>
        <span class="prowRecipe" id="prowRecipe${i}"></span>
      </div></div>`;
  }
  $("players").innerHTML=html;
  // names have a fixed column width to keep coins/hold aligned across every row — a name that
  // overflows it scrolls instead of blowing out the layout or truncating unreadably
  for(const i of order){
    const wrap=$("pname"+i),inner=wrap&&wrap.firstElementChild;
    if(!wrap||!inner)continue;
    const overflow=inner.scrollWidth-wrap.clientWidth;
    if(overflow>0){wrap.classList.add("marquee");wrap.style.setProperty("--scrollDist",(overflow+2)+"px");}
  }
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
  // D-19/D-20/D-21 (DRAFT — 14-06 presents these three lines for Wyatt's edit): one line used to
  // cover three unrelated safe-harbor causes. mooredReason() now tags every event with which one
  // actually fired — branch on it so the narration finally tells the truth. Same {txt,pops} shape,
  // same ⚓ pop for all three; a replayed pre-change log with no reason falls back to the old
  // generic line rather than rendering "undefined".
  moored:(e,at)=>{
    const L={
      justDocked:`${pn(e.p)} is still tied up from docking last turn — the storm can't drag a moored ship anywhere ⚓`,
      // D-20: the mechanics stay a lucky save (a ship blown ONTO a dock is sheltered by it) — the
      // wording change is the fix, per Wyatt: "you're able to steady your boat against the dock to
      // not be blown aground."
      dock:`Lucky break! The gust shoves ${pn(e.p)} onto a dock, and the crew steadies her fast against it ⚓`,
      home:`${pn(e.p)} rides it out safe at the Isle of Tortuga — the harbour holds her fast ⚓`,
    };
    return {txt:L[e.reason]||`The dock steadies ${pn(e.p)} from running aground ⚓`,pops:[[at(e.p),"⚓"]]};
  },
  blocked:(e,at)=>({txt:`Spotting ${pn(e.other)} dead ahead, ${pn(e.p)} strikes sail and holds fast.`,pops:[[at(e.p),"⚓"]]}),
  anchorHold:(e,at)=>({txt:`${pn(e.p)}'s anchor already down — it holds fast, no need to pay twice in one storm ⚓`,pops:[[at(e.p),"⚓"]]}),
  tradewind:(e,at)=>({txt:`🌀 ${pn(e.p)} is carried into the trade winds and whipped around the rim!`,pops:[[at(e.p),"🌀",true,TRADE_SWIRL_IMG]]}),
  parley:(e,at)=>{
    const base=`🤝 ${pn(e.a)} offered ${fmtItem(e.offer)} for ${pn(e.b)}'s ${fmtItem(e.want)} — ${e.ok?"deal struck!":"<b>refused</b>"}`;
    // D-01/D-24 (DRAFT — 14-06 presents this alongside the moored variants for Wyatt's edit): a
    // refused hail still spent the bot's one action for that turn — say so, so the price being
    // paid reads as a rule, not a glitch. A human's own parley (no kind:"hail") is untouched.
    const txt=(e.kind==="hail"&&!e.ok)?`${base} <span class="nobrk">— but it cost ${pn(e.a)} their turn all the same.</span>`:base;
    return {cls:"trade",txt,pops:[[at(e.a),e.ok?"🤝":"🙅"]]};
  },
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
// D-09/D-10: the per-square storm-push beat — a single named constant so Wyatt can tune
// snappiness-vs-legibility at UAT without a code hunt. STORM_STEP_MS is the human pace (windLeg);
// BOT_STORM_STEP_MS is the bot's own, snappier per-square beat (botWindLeg, src/ui/flow.js).
export const STORM_STEP_MS=320;
export const BOT_STORM_STEP_MS=170;

// D-10: "snappiness and legibility are the two things being balanced" — a separate, shorter hold
// curve for bot narration, not a scaled copy of msgHoldMs's. Same base/per-char/pause shape, but a
// lower floor and ceiling (clamped BEFORE the multiplier) so a bot's per-event lines read fast
// without going illegible on a long line. A single named constant (BOT_MSG_HOLD_MULTIPLIER) plus
// STORM_STEP_MS/BOT_STORM_STEP_MS above are the whole pacing surface — tune the feel here only.
export const BOT_MSG_HOLD_MULTIPLIER=0.5;
export function botMsgHoldMs(text){
  text=text||"";
  const base=1000,charTime=50;
  let raw=base+text.length*charTime;
  const body=text.replace(/[.,!?]+$/,""); // trailing punctuation doesn't count as a mid-string pause
  const pauses=(body.match(/[,!?.]/g)||[]).length;
  raw+=pauses*300;
  return Math.round(Math.min(Math.max(raw,900),2600)*BOT_MSG_HOLD_MULTIPLIER);
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
    netHandlers().onEndReplay();
  }
  const seat=appState.curSeat;
  netHandlers().onBroadcast(seat===appState.mySeat?msg:`${pn(seat)} is deciding…`);
  armClock(seat);
  const isFlip=opts.length===1&&!!opts[0].flip;
  // `sub` is optional helper text rendered under the button row; an option flagged `disabled`
  // renders greyed and non-clickable (notes/edits #5) — used for the too-poor Attack button.
  const base=decisionIsLocal(seat)?netHandlers().onLocalAsk(msg,opts,colors,sub)
    :netHandlers().onRemotePrompt(seat,{kind:"ask",msg,labels:opts.map(o=>o.label),
       colors:colors?colors.map(c=>c||""):null,classes:opts.map(o=>o.cls||""),
       disabled:opts.map(o=>!!o.disabled),sub:sub||null,flip:isFlip,
       flipIdx:opts.findIndex(o=>o.flip),back:opts.findIndex(o=>o.back)});
  const idxP=withShotClock(seat,base,0);
  return idxP.then(i=>{const r=resolveOpt(opts,i,0);netHandlers().onLogDecision(r.i);return r.opt.value;});
}
// re-arms the shot clock with a fresh 30s window right before a new decision is shown to
// whichever seat is being asked — every ask()/pickCell()/non-flip battleAsk() call in the
// game goes through this, so every decision anyone makes is timed the same way.
export function armClock(seat){
  if(!appState.isHost)return;
  const p=appState.game.players[seat];if(p)startShotClock(p);
}

/* ---------- pause / pacing ---------- */
// solo pause (see toggleShotClockPause) freezes the whole game by making every await-ed
// sleep() stall first — bots pace their turns entirely through sleep(), so this alone halts
// bot play without threading a paused-check through every call site.
export function waitWhilePaused(){
  return appState.shotClockPaused?new Promise(res=>{
    const iv=setInterval(()=>{if(!appState.shotClockPaused){clearInterval(iv);res();}},150);
  }):Promise.resolve();
}
// used only to derive flip/spin animation-pacing constants (asyncBattle, asyncBakeoff, fishCast)
// — unrelated to text legibility, which is governed by flash()'s own reveal/hold/fade formula.
export function stepDelay(){return 3000;}
// notes/edits #1 audit: this used to fire-and-forget narrateCurrent() (raw netNarrate(), no
// hold/fade at all) then separately sleep a flat stepDelay()=3000ms regardless of the event
// text's length — the same "one size fits all" bug as narrateLastEvent()/humanFlip() had, just
// hitting the most common narration path in the game (every bot action goes through botBeat()).
// Now narrateCurrent() itself is the thing that paces this beat, via flash()'s length-aware timing.
export async function botBeat(){netHandlers().onLiveRender();await narrateCurrent();}
// keep the yellow action panel in step with the bot's latest move — liveRender only
// updates the board/log/bubble, so without this the panel stays stuck on the last human prompt.
export async function narrateCurrent(){
  const e=appState.game.events[appState.evIdx];if(!e)return;
  if(e.t==="turn"){await netHandlers().onFlash(`🧭 ${pn(e.p)} takes the wheel…`);return;}
  // settleSideBets() already flashed one aggregate message covering every bettor — skip the
  // duplicate individual re-narration (same reasoning as narrateLastEvent()).
  if(e.t==="sidebet")return;
  const L=appState.logLines[appState.evIdx];if(L)await netHandlers().onFlash(L.txt);
}
export function setActor(s){appState.curSeat=s;}
export function seatLocal(s){return s===appState.mySeat;}
// pass & play: every human seat shares this one browser, so any human seat resolves locally
// regardless of mySeat — unlike real online multiplayer, there's no other device to reach over
// remotePrompt/remoteDraftPrompt (which would throw anyway, since db/room are null here).
export function decisionIsLocal(s){return (appState.passAndPlay&&appState.game.players[s].strategy==="human")||seatLocal(s);}

/* ---------- shot clock ---------- */
export function startShotClock(p){
  if(!appState.isHost||appState.timerOff)return;   // #7: timer switched off — decisions wait, never time out
  appState.shotClockSeat=p.idx;
  appState.shotClockDeadline=Date.now()+30000;
  appState.shotClockFired={};
  appState.turnExpired=false;
  appState.shotClockPaused=false;
  netHandlers().onBroadcastClock();
  if(appState.shotClockTimer)clearInterval(appState.shotClockTimer);
  appState.shotClockTimer=setInterval(shotClockTick,500);
}
export function stopShotClock(){
  if(!appState.isHost)return;
  // BUG-02: stash the in-flight decision's force-resolver before dropping the live reference, so
  // rearmShotClock() can hand it back. Keyed by seat — restoring a resolver that belongs to an
  // older decision would force-resolve the wrong promise, which is worse than having no auto-skip.
  if(appState.shotClockForce&&appState.shotClockSeat!=null)appState.shotClockStash={seat:appState.shotClockSeat,force:appState.shotClockForce};
  appState.shotClockSeat=null;appState.shotClockForce=null;appState.shotClockPaused=false;
  if(appState.shotClockTimer){clearInterval(appState.shotClockTimer);appState.shotClockTimer=null;}
  netHandlers().onBroadcastClock();
}
// notes/edits BUG-02: re-arm the CURRENT turn's clock after the timer is switched back on. This is
// deliberately not startShotClock(): that clears shotClockFired, which would let the same turn be
// charged the 20s penalty twice. D-06 says an already-fired penalty is neither refunded nor
// replayed — switching the timer off only prevents FUTURE penalties. Also restores the stashed
// force-resolver so the 30s auto-skip survives the toggle (see stopShotClock).
// Not a pause button: D-04 keeps multiplayer on the ⏱ toggle only, and this adds no new UI.
export function rearmShotClock(p){
  if(!appState.isHost||appState.timerOff)return;
  appState.shotClockSeat=p.idx;
  appState.shotClockDeadline=Date.now()+30000;   // D-05: a full fresh 30s, not the remainder
  appState.shotClockPaused=false;
  // shotClockFired is deliberately NOT reset here (D-06) — see above.
  // turnExpired is deliberately NOT cleared: if the turn already expired, the flow is unwinding
  // and watchTimer's guard below refuses to re-arm it at all.
  if(appState.shotClockStash&&appState.shotClockStash.seat===p.idx){appState.shotClockForce=appState.shotClockStash.force;appState.shotClockStash=null;}
  netHandlers().onBroadcastClock();
  if(appState.shotClockTimer)clearInterval(appState.shotClockTimer);
  appState.shotClockTimer=setInterval(shotClockTick,500);
}
// solo/bots-only games only — pausing wouldn't make sense with other humans waiting on you
export function soloBotGame(){return appState.game&&appState.game.players&&appState.game.players.filter(p=>p.strategy==="human").length<=1;}
// CLOCK-02: the pause/resume state-mutation body, extracted out of toggleShotClockPause below
// so src/orchestrator.js's watchPause() can call it directly on the host branch of a networked
// pause toggle — the SAME shotClockDeadline/shotClockPauseElapsed math as before (D-07: resume
// continues from the remaining time, not a fresh 30s), just relocated, not rewritten. No
// isHost/soloBotGame gate lives in here on purpose (D-05/D-06): the caller decides who may call
// this — solo's toggleShotClockPause() below (host-only), or the host branch of watchPause()
// (never the guest branch, which only mirrors the boolean for rendering).
export function applyPauseState(nowPaused){
  if(nowPaused){
    appState.shotClockPaused=true;
    if(appState.shotClockSeat!=null){
      appState.shotClockPauseElapsed=Date.now()-(appState.shotClockDeadline-30000);
      if(appState.shotClockTimer){clearInterval(appState.shotClockTimer);appState.shotClockTimer=null;}
    }
  }else{
    appState.shotClockPaused=false;
    if(appState.shotClockSeat!=null){
      appState.shotClockDeadline=Date.now()+30000-appState.shotClockPauseElapsed;
      appState.shotClockTimer=setInterval(shotClockTick,500);
    }
  }
}
// works any time in solo play, not just on your own turn — shotClockPaused doubles as the
// whole game's pause flag (see waitWhilePaused/sleep above), so pausing between turns
// actually freezes the bots instead of just a countdown that isn't running yet.
// CLOCK-02/D-05/D-06: the soloBotGame() half of the old gate is REMOVED here — multiplayer now
// reaches pause too, via src/orchestrator.js's togglePause()/watchPause(), which call
// applyPauseState() directly instead of this wrapper. This wrapper stays host-gated and is now
// only the solo/pass-and-play path (togglePause()'s local fallback when there is no db/room).
export function toggleShotClockPause(){
  if(!appState.isHost)return;
  applyPauseState(!appState.shotClockPaused);
  netHandlers().onSetClockUI();
}
export function shotClockTick(){
  if(appState.shotClockSeat==null)return;
  const elapsed=Date.now()-(appState.shotClockDeadline-30000);
  if(!appState.shotClockFired.t20&&elapsed>=20000){appState.shotClockFired.t20=true;applyShotClockPenalty();}
  if(elapsed>=30000){netHandlers().onExpireShotClock();return;}
  netHandlers().onSetClockUI();
}
export function applyShotClockPenalty(){
  const p=appState.game.players[appState.shotClockSeat];if(!p)return;
  const others=appState.game.players.filter(q=>q!==p&&!q.done);
  const take=Math.min(1,p.coins);
  p.coins-=take;others.forEach(q=>q.coins++);
  appState.game.ev({t:"shotclock",p:p.idx,others:others.map(q=>q.idx)});
  netHandlers().onNarrateLastEvent();
  netHandlers().onLiveRender();
}
// mirrors render()'s "whose turn is it" derivation — used by setClockUI() to tell a genuinely
// idle moment apart from a bot quietly taking its turn, since startShotClock() is only ever
// armed for a human decision (ask()), never for a bot's turn.
export function currentTurnSeat(){
  if(!appState.game||!appState.game.events)return null;
  for(let i=appState.evIdx;i>=0&&i>appState.evIdx-80;i--){
    const t=appState.game.events[i]&&appState.game.events[i].t;
    if(t==="turn")return appState.game.events[i].p;
    if(t==="newround")return null;
  }
  return null;
}
// If `seat` is the one currently on the shot clock, wrap its decision so expireShotClock() can
// force a default answer once 30s run out, instead of the answer waiting forever. A no-op for
// every other decision in the game (recipe drafts, battle/trade sub-flows, etc).
// Critically: once the wrapped decision is answered for real (not forced), the clock stops
// immediately rather than continuing to tick toward that seat — otherwise a spectator who
// answers a side-bet prompt right away keeps getting timed against for the rest of the battle,
// long after they have nothing left to decide.
export function withShotClock(seat,base,defaultVal){
  if(!appState.isHost||seat!==appState.shotClockSeat)return base;
  return new Promise(res=>{
    let done=false;
    appState.shotClockForce=()=>{if(!done){done=true;res(defaultVal);}};
    base.then(v=>{
      if(!done){
        done=true;appState.shotClockForce=null;
        // BUG-02: the decision resolved for real, so any resolver stashed for THIS seat across a
        // timer-off is dead — drop it so a later re-arm can't force-resolve a settled promise.
        if(appState.shotClockStash&&appState.shotClockStash.seat===seat)appState.shotClockStash=null;
        if(appState.shotClockSeat===seat)stopShotClock();
        res(v);
      }
    });
  });
}

/* ---------- board pops (event -> emoji animation) ---------- */
export function spawnPops(e,cellPx){
  if(!e)return;
  const st=e.state;
  const at=i=>{const [x,y]=shipXY(st[i].pos,i,st,cellPx);return [x,y-cellPx*.42];};
  const fn=EVENT_NARRATION[e.t];if(!fn)return;
  const r=fn(e,at,cellPx);
  (r&&r.pops||[]).forEach(([xy,emo,big,img,cls])=>netHandlers().onPopEmoji(xy[0],xy[1],emo,big,img,cls));
}

/* ---------- misc UI refresh / bot seat strategy ---------- */
// notes/edits BOT-01/BOT-02: bot personality is no longer anyone's choice — it belongs to the
// captain. Indexed to match NAMES: Davy Scones, Crustbeard, Dough Hook, Flaky Jack. Every seat
// that fills with a bot takes its captain's temperament, so "Crustbeard" always plays like
// Crustbeard whether you meet him in solo or multiplayer.
const SEAT_BOT_STRAT=["balanced","pirate","trader","rusher"];
export function seatStrat(i){return SEAT_BOT_STRAT[i%SEAT_BOT_STRAT.length];}
export function updateRecipeBanner(){
  // recipe is now shown as semi-transparent chips in your own captain row (see render());
  // refresh the board so those chips appear as soon as recipes are drafted
  if(appState.game&&appState.game.events&&appState.game.events.length)netHandlers().onRender();
}
// #6: preload the core board art up front so a slow connection doesn't render the board with
// missing/fallback tiles that pop in one by one. Each image resolves on load OR error (never
// rejects), and boot() caps the whole wait with a timeout, so the loader can never hang the game.
export function preloadAssets(){
  const urls=[BOARD_IMG,DOCK_IMG,WIND_ARROW_IMG,TRADE_SWIRL_IMG,`${ASSET_BASE}logo.jpg`,
    ...BOAT_IMG,...ISLAND_SHAPE_IMG,...ING_ALL.map(i=>ING_IMG[i])];
  return Promise.all(urls.map(u=>new Promise(res=>{
    const img=new Image();
    img.onload=img.onerror=()=>res();
    img.src=u;
  })));
}

/* ---------- session persistence / host-refresh recovery ---------- */
// CLOCK-01: schema-version stamps for the two *resumable-game-state* blobs (pp_sess/pp_solo).
// Each blob evolves on its own schedule (multiplayer resume vs. solo resume are separate code
// paths), so two independent constants rather than one shared "build version" (RESEARCH Pattern 3
// Alternatives Considered) — bump only the one whose shape actually changes. boot()'s guard clears
// a blob (via the existing clearSession()/clearSoloState()) whenever its stamp doesn't match,
// treating an unstamped pre-refactor blob or a stale mismatched one as "no resume" (D-01/D-02).
// pp_id/pp_timerOff are structurally excluded from this mechanism (D-03) — never versioned/cleared.
export const SESSION_SCHEMA_V=1;
export const SOLO_SCHEMA_V=1;
export function getMyId(){
  let id=null;try{id=localStorage.getItem("pp_id");}catch(e){}
  if(!id){id="u"+Math.random().toString(36).slice(2,10);try{localStorage.setItem("pp_id",id);}catch(e){}}
  return id;
}
export function genCode(){const A="ABCDEFGHJKMNPQRSTUVWXYZ";let s="";for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return s;}
export function saveSession(){try{localStorage.setItem("pp_sess",JSON.stringify({v:SESSION_SCHEMA_V,room:appState.room,mySeat:appState.mySeat,isHost:appState.isHost}));}catch(e){}}
export function clearSession(){try{localStorage.removeItem("pp_sess");}catch(e){}}

// --- host-refresh recovery: record & replay the decision log ---
// Encode so a "stay put" (null) still persists as a non-empty object (Firebase drops nulls,
// and setting a node to {} deletes it — which would leave a gap in the ordered log).
export function encodeDec(v){return (v===null||v===undefined)?{n:1}:{v:v};}
export function decodeDec(e){return (e&&Object.prototype.hasOwnProperty.call(e,"v"))?e.v:null;}
// ---- singleplayer persistence: reuse the same replay mechanism multiplayer host-refresh uses,
// but keep the log in localStorage instead of Firebase, since there's no server for solo games ----
export function saveSoloState(){
  if(!appState.soloMeta)return;
  try{localStorage.setItem("pp_solo",JSON.stringify({v:SOLO_SCHEMA_V,...appState.soloMeta,dlog:appState.dlog}));}catch(e){}
}
export function clearSoloState(){appState.soloMeta=null;try{localStorage.removeItem("pp_solo");}catch(e){}}
export function resumeSoloGame(saved){
  appState.numSeats=saved.strategies.length;appState.room=null;appState.isHost=true;appState.mySeat=0;
  appState.passAndPlay=!!saved.passAndPlay;
  const names=saved.names||[saved.name]; // old solo saves only ever had one human, at seat 0
  appState.roster=saved.strategies.map((s,i)=>i<names.length?{name:names[i],id:"solo",bot:false}:{name:"",id:"",bot:true,strat:s});
  appState.soloMeta=appState.passAndPlay?{names,strategies:saved.strategies,seed:saved.seed,passAndPlay:true}
                      :{name:saved.name,strategies:saved.strategies,seed:saved.seed};
  appState.dlog=(saved.dlog||[]).slice();appState.dlogIdx=0;appState.dlogN=0;
  appState.replaying=true;
  netHandlers().onBeginGame(roundCfg(saved.strategies),saved.seed);
}
// notes/edits BUG-03/BUG-04: decide whether a host-refresh replay actually rebuilt the voyage.
// The yardstick is resumeEvLen — the Firebase event count captured BEFORE the reload (see
// resumeHostGame) — not dlog.length, because one logged decision can emit several events, so the
// two counts are not comparable. A SMALL shortfall is expected, not an error: ask()/pickCell()/
// battleAsk() each fall through from replay to live play the instant dlogIdx >= dlog.length, so
// the decision that was in flight when the tab reloaded — and the narration events it would have
// produced — are legitimately missing. A LARGE shortfall means the log never loaded (the empty-
// dlog case that rebuilds a fresh board from the seed and reads to players as "reset to start").
export const REPLAY_SHORTFALL_TOLERANCE = 4;
export function replayShortfall(rebuiltEvLen, priorEvLen, readFailed){
  const shortfall = Math.max(0, priorEvLen - rebuiltEvLen); // clamped: replaying past the old
                                                             // frontier is fine, never negative
  if(readFailed) return {shortfall, incomplete:true, reason:"read-failed"};
  if(shortfall > REPLAY_SHORTFALL_TOLERANCE) return {shortfall, incomplete:true, reason:"short-replay"};
  return {shortfall, incomplete:false, reason:"ok"};
}
export function fixEv(e){
  if(e.state)e.state.forEach(s=>{if(!s.ing)s.ing=[];if(!s.pos)s.pos=[0,0];});
  if(e.rounds)e.rounds=e.rounds.map(r=>[r&&r[0]?1:0,r&&r[1]?1:0,r&&r[2]?1:0,r&&r[3]||null]);
  return e;
}
