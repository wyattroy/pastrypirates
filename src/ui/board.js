// src/ui/board.js
//
// Phase 11 (SPLIT-03/06), wave 11-03. The board + storm rendering cluster — the DOM-heaviest,
// most Safari-sensitive slice of the classic <script> region. Extending 11-01/11-02's proven
// "move verbatim + rewire bare reads into imports + bridge grows + gates green" pattern to the
// functions that actually own board-render state (drawBoard/render/renderLog are the sole
// mutators of the render-only `let`s below).
//
// CRITICAL: this file carries the v1.0 BUG-01 storm-crash fix (pre-baked PNG rain tile,
// snap-not-animate narration height) — drawBoard()/buildStormLayers()/render()'s bodies below are
// moved BYTE-IDENTICAL to the classic source. Do not refactor, "clean up", re-animate, or reorder
// anything inside them; a structural regression here is the milestone's known Safari risk
// (11-CONTEXT.md D-12, re-verified live on Safari in 11-08).
//
// Purity bar for src/ui/: reads DOM and game state, NEVER imports src/net/ (D-07).
// scripts/module_graph_check.js and scripts/ui_contract_check.js both gate this mechanically.
//
// Deviation ($ duplicate, mirrors 11-01's recipe.js precedent): `$` is a classic-script-local
// `const $=id=>document.getElementById(id)` (index.html:863), used ~120+ times across the
// still-classic region far beyond this cluster's own consumers — reproduced verbatim as a
// private module-local helper instead of "moved" (moving it would break every other classic call
// site). The classic script keeps its own untouched copy until a later wave empties it entirely.
//
// Deviation (cell/shipEls/activeRing/spinNeedle/stormText/stormDial/windLabels/logRenderedTo —
// mirrors 11-02's cellPx/shipEls finding, same root cause, opposite direction): this cluster OWNS
// these classic-script top-level `let`s — drawBoard()/render()/renderLog() are their sole
// mutators — so they move here verbatim as ordinary module-scope `let`s (src/state/index.js's
// header already documents these 7 render-handle names as deliberately excluded from Phase 10's
// appState migration and left for this phase). Three of them — `cell`, `shipEls`,
// `logRenderedTo` — also have external still-classic readers/writers that are NOT moving this
// wave (localPickCell/remotePickHighlights read `cell`; showChatBubble reads `shipEls`; beginGame
// resets `logRenderedTo` before a fresh game — all panel/flow/lobby functions slated for later
// waves). A classic script's bare read of a module-local `let` can't resolve at all (no
// `import`), and the (now-deleted, Phase 11) bridge's one-time global-object-spread snapshot
// couldn't have helped either — it copied primitive/reassigned-array VALUES once at boot, not a
// live binding, so a
// later `cell=W/n` inside this module would never reach a stale global copy. Exported three
// narrow accessor functions (boardCell/boardShipEls/resetBoardLog) for exactly those external
// call sites instead; index.html's 6 call sites were updated to use them (see this plan's
// SUMMARY). Removed once those still-classic callers move into src/ui/ in a later wave.
// activeRing/spinNeedle/stormText/stormDial/windLabels have zero readers outside this cluster
// (grep-confirmed) and stay module-private with no accessor needed.
//
// Deviation (chatBubbles — mirrors 11-02's EVENT_NARRATION finding): render() reads the classic
// `const chatBubbles={}` object (declared elsewhere in the classic script, alongside the
// chat-bubble UI functions) to decide whether to reposition an active bubble. A classic script's
// top-level `const` never becomes a window property the way a `function` declaration does, so
// board.js cannot read it as a bare global unless it moves. Unlike cell/shipEls above, chatBubbles
// is a plain object whose entries are only ever set/deleted in place (`chatBubbles[i]=b`,
// `delete chatBubbles[i]`) — never reassigned wholesale — so it survives the PP bridge's
// value-copy snapshot exactly like appState does (the copied value IS the live object reference).
// Moved here as an EXPORTED object (not module-private), since still-classic
// positionChatBubble/showChatBubble/removeChatBubble/clearChatBubbles (chat feature, a later
// wave) keep mutating it as a bare global via the bridge with zero changes to their own bodies.

import { appState } from "../state/index.js";
import { Game, roundCfg } from "../engine/index.js";
import {
  DIRS, STORM_DIAG, HEXCOL, ASSET_BASE, EMOJI_IMG,
  BOARD_IMG, DOCK_IMG, BOAT_IMG, ING_IMG, ING_HOLE_IMG, ANCHOR_IMG, TRADE_SWIRL_IMG,
  WIND_ARROW_IMG, COMPASS_DIAL_IMG, COMPASS_NEEDLE_IMG, COIN_IMG, SCROLL_IMG, CROWN_IMG,
  HOURGLASS_IMG, CROISSANT_IMG, CAKE_SLICE_IMG, DONUT_IMG, CUPCAKE_IMG,
  FLIP_HEADS_IMG, FLIP_TAILS_IMG, COIN_SPIN_IMG,
  iconImg, iname, ingImg,
} from "../shared/index.js";
import {
  dockOrient, tracePolygonLoops, roundedPathFromLoop, islandArtPlacement, shipXY, pulseEl,
  describe, assignBadges, pname, pn, buildPlayerRows,
} from "./util.js";
import { recipeTitle } from "./recipe.js";

// `$` is a classic-script-local `const $=id=>document.getElementById(id)` (index.html:863) —
// see the file header's deviation note.
const $=id=>document.getElementById(id);

/* ---------- board rendering ---------- */
const SVGNS="http://www.w3.org/2000/svg";
export function el(tag,attrs,parent){const e=document.createElementNS(SVGNS,tag);
  for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}
// custom-art icon: a single centered <image>. (cx,cy) is its center in board px; size is its
// width/height in board px.
export function iconAt(svg,cx,cy,size,href,rotateDeg,flip){
  const g=el("g",{transform:`translate(${cx},${cy})${flip?" scale(-1,1)":""}${rotateDeg?` rotate(${rotateDeg})`:""}`},svg);
  el("image",{x:-size/2,y:-size/2,width:size,height:size,href},g);
  return g;
}
let cell=0,shipEls=[],activeRing=null,spinNeedle=null,stormText=null,stormDial=null,windLabels=[];

// Exported accessors for the still-classic call sites that read this cluster's render-only state
// directly (localPickCell/remotePickHighlights read cell; showChatBubble reads shipEls) — see the
// file header's deviation note. Removed once those callers move into src/ui/ in a later wave.
export function boardCell(){return cell;}
export function boardShipEls(){return shipEls;}

export function drawBoard(){
  const svg=$("board");svg.innerHTML="";
  const n=appState.game.cfg.grid,W=640;cell=W/n;
  // custom board art (ocean + Isle of Tortuga + its docks baked in) sits behind everything.
  // `grid` draws the functional cell boundaries on top of it: open water is outline-only
  // (fully transparent fill) and the trade-wind channel gets a light 10%-black tint so its
  // squares still read as distinct from open water. `home` (the plain Tortuga tile + anchor +
  // berths) fully hides once art loads, since that's baked into the art itself.
  const boardImg=el("image",{x:0,y:0,width:W,height:W,href:BOARD_IMG},svg);
  boardImg.addEventListener("error",()=>boardImg.remove());
  const grid=el("g",{},svg);
  const home=el("g",{},svg);
  boardImg.addEventListener("load",()=>{home.style.display="none";});
  if(appState.game.isRound){
    svg.style.background="transparent";
    for(const k of appState.game.valid){
      const [x,y]=k.split(",").map(Number);
      const rimC=appState.game.rim.has(k);
      el("rect",{x:x*cell,y:y*cell,width:cell,height:cell,
        fill:rimC?"#000000":"none","fill-opacity":rimC?.1:0,stroke:"#a6dee8","stroke-width":1,"stroke-opacity":.5},grid);
    }
    // flow arrows on every channel square (clockwise), a swirl icon at each quadrant's drop-off
    const headKeys=new Set(Object.values(appState.game.rimHead).map(h=>h[0]+","+h[1]));
    for(const c of appState.game.rimCellInfo||[]){
      const cx=(c.x+.5)*cell,cy=(c.y+.5)*cell;
      if(headKeys.has(c.k)){
        iconAt(svg,cx,cy,cell,TRADE_SWIRL_IMG);
      }else{
        const rot=c.deg+90; // tangent of clockwise flow
        iconAt(svg,cx,cy,cell,WIND_ARROW_IMG,rot);
      }
    }
  }else{
    svg.style.background="";
    for(let i=0;i<=n;i++){
      el("line",{x1:i*cell,y1:0,x2:i*cell,y2:W,stroke:"#a6dee8","stroke-width":1,"stroke-opacity":.5},grid);
      el("line",{x1:0,y1:i*cell,x2:W,y2:i*cell,stroke:"#a6dee8","stroke-width":1,"stroke-opacity":.5},grid);
    }
  }
  // home: Isle of Tortuga is a 1-square island with 4 docks (N/S/E/W). The island tile itself
  // is baked into board.png, but the 4 berths around it aren't — those always render for real.
  const [hx,hy]=appState.game.home;
  el("rect",{x:hx*cell+2,y:hy*cell+2,width:cell-4,height:cell-4,rx:cell*.3,
    fill:"#fef48b",stroke:"#f5a623","stroke-width":2},home);
  iconAt(home,(hx+.5)*cell,(hy+.5)*cell,cell*.7,ANCHOR_IMG);
  let homeDockI=0;
  for(const d of Object.values(DIRS)){
    const dx=hx+d[0],dy=hy+d[1];
    if(dx<0||dy<0||dx>=n||dy>=n)continue;
    // invisible — kept only so celebrateHomeDocks() can find each berth's id and geometry
    // (x/y/width/height) once the voyage ends; the dock.png below it is the visible layer
    el("rect",{id:`homeDock${homeDockI++}`,x:dx*cell,y:dy*cell,width:cell,height:cell,
      fill:"none",stroke:"none"},svg);
    // faces back toward Tortuga, centered in its own dock cell so its edge touches the island
    // boundary without crossing into the home tile
    const{rot:rotDeg,flip}=dockOrient([-d[0],-d[1]]);
    const px=(dx+.5-d[0]*.2)*cell, py=(dy+.5-d[1]*.2)*cell;
    iconAt(svg,px,py,cell,DOCK_IMG,rotDeg,flip);
  }
  // islands (arbitrary polyomino shapes): fused cell fills + a single union outline
  const defs=el("defs",{},svg);
  for(const ing of appState.game.ings){
    const cells=appState.game.islandRect[ing];
    const loops=tracePolygonLoops(cells);
    const clipId=`islandClip_${ing}`;
    const clipPath=el("clipPath",{id:clipId},defs);
    for(const loop of loops){
      const pxLoop=loop.map(([x,y])=>[x*cell,y*cell]);
      const d=roundedPathFromLoop(pxLoop,cell*.32);
      el("path",{d},clipPath);
    }
    // custom island art: authored once per canonical shape (see ISLAND_SHAPE_IMG/TET above) and
    // placed with the same rotate/mirror the board used, then clipped to the island's own rounded
    // outline — so hand-drawn art doesn't need rounded corners or to know its own orientation.
    const placement=islandArtPlacement(appState.game.islandShapeMeta[ing],cells,cell);
    if(placement){
      const clipG=el("g",{"clip-path":`url(#${clipId})`},svg);
      const artG=el("g",{transform:placement.transform},clipG);
      el("image",{x:0,y:0,width:placement.w,height:placement.h,"preserveAspectRatio":"none",href:placement.href},artG);
    }
    // dock is drawn before the crate icons below so it always sits underneath them — it
    // stretches to the shared edge with the island and would otherwise occlude a crate there
    if(appState.game.cfg.singleDock){
      const d=appState.game.dockOf[ing];
      const adj=Object.values(DIRS).find(dd=>appState.game.islands[[d[0]+dd[0],d[1]+dd[1]]]===ing);
      // faces the island, and centered on the shared edge between the dock cell and the island
      // so it visually stretches to meet it rather than sitting centered in open water
      const{rot:dockRotDeg,flip:dockFlip}=adj?dockOrient(adj):{rot:0,flip:false};
      const px=adj?(d[0]+.5+adj[0]*.5)*cell:(d[0]+.5)*cell;
      const py=adj?(d[1]+.5+adj[1]*.5)*cell:(d[1]+.5)*cell;
      iconAt(svg,px,py,cell,DOCK_IMG,dockRotDeg,dockFlip);
    }
    // one big icon per remaining crate, one per island square — a taken crate turns fully
    // grey in place rather than shrinking to a count badge, so the whole island reads at a glance
    if(appState.game.cfg.crates<1e9){
      cells.slice(0,appState.game.cfg.crates).forEach((c,idx)=>{
        const scx=(c[0]+.5)*cell,scy=(c[1]+.5)*cell;
        const g=iconAt(svg,scx,scy,cell*.8,ING_IMG[ing]);
        g.id=`crate_${ing}_${idx}`;
      });
    }else{
      // unlimited-crate config (not used by the live game, kept for the lab): one plain icon
      const mx=cells.reduce((s,c)=>s+c[0],0)/cells.length, my=cells.reduce((s,c)=>s+c[1],0)/cells.length;
      let best=cells[0],bd=1e9;
      for(const c of cells){const dd=(c[0]-mx)**2+(c[1]-my)**2;if(dd<bd){bd=dd;best=c;}}
      const cx=(best[0]+.5)*cell,cy=(best[1]+.5)*cell;
      iconAt(svg,cx,cy,cell*.8,ING_IMG[ing]);
    }
  }
  // wind spinner HUD (bottom-right corner) — sized off `cell` rather than fixed pixels, so it
  // scales with the board's actual cell density instead of a magic number tuned for one grid size.
  // Everything is drawn in a <g> translated to the dial's center, so all local coordinates are
  // relative to (0,0) — the needle's rotation pivot is then exactly "0px 0px", which stays correct
  // at any browser zoom level (an absolute px transform-origin drifted from the dial at non-100% zoom).
  const sr=cell*.95,scx=W-sr-14,scy=sr+32;
  const hud=el("g",{opacity:.95,transform:`translate(${scx},${scy})`},svg);
  // colored ring stays underneath as the storm-state indicator (still toggled by fill/stroke
  // below) — the dial art sits on top slightly smaller, so a thin halo of that color peeks out
  // around the rim instead of being fully hidden by the now-opaque dial image.
  stormDial=el("circle",{cx:0,cy:0,r:sr,fill:"#fffdf0",stroke:"#f5a623","stroke-width":2.5},hud);
  iconAt(hud,0,0,sr*1.86,COMPASS_DIAL_IMG);
  // compass-dial.png has N/E/S/W baked into the art itself (rather than the plain circle this
  // used to be), so the separately-drawn text labels are gone — windLabels stays around (now
  // always empty) purely so the storm-color-toggle loop below still has something safe to iterate.
  windLabels=[];
  spinNeedle=el("g",{},hud);
  // needle art's collar (rotation pivot) sits at the vertical center of the image, so the
  // box is centered on (0,0) rather than offset — an offset box put the pivot ~6% of the
  // needle's height away from the collar, a visible wobble when it spins
  const needleImg=el("image",{x:-sr*.336,y:-sr*.68,width:sr*.672,height:sr*1.36,href:COMPASS_NEEDLE_IMG},spinNeedle);
  spinNeedle.style.transition="transform .7s ease";
  spinNeedle.style.transformOrigin="0px 0px";
  stormText=el("text",{x:0,y:sr+16,"text-anchor":"middle","font-size":14,"font-weight":"bold"},hud);
  // active-player highlight: a sonar-style ripple of white rings expanding out from the boat
  // (positioned in render). Fixed white, not per-player color, so it stays visible against art.
  activeRing=el("g",{opacity:0},svg);
  for(let i=0;i<3;i++)
    el("circle",{class:"ripple",r:cell*.4,fill:"none",stroke:"#fff","stroke-width":2,
      style:`animation-delay:${i*.6}s`},activeRing);
  // ships
  shipEls=[];
  appState.game.players.forEach((p,i)=>{
    const g=el("g",{style:"transition: transform .35s cubic-bezier(.42,0,.58,1)"},svg);
    const boatSize=cell;
    el("image",{x:-boatSize/2,y:-boatSize/2,width:boatSize,height:boatSize,href:BOAT_IMG[i]},g);
    shipEls.push(g);
  });
  // seat the ships on their Isle of Tortuga docks right away, before the first event renders
  appState.game.players.forEach((p,i)=>{
    const [x,y]=shipXY(p.pos,i,appState.game.players,cell);
    shipEls[i].style.transform=`translate(${x}px,${y}px)`;
  });
}
/* ---------- playback ---------- */
// notes/edits BUG-01: build the storm's rain layers once, on the first storm. The rain is now a
// pre-rendered tiling PNG (see #stormOverlay .rlayer CSS), so each layer only varies things that
// are free to composite — tile scale (depth), fall speed, start offset/phase, and opacity — never
// a live gradient/mask. rotate + translate do the rest on the GPU. 3 layers give depth without
// stacking the texture so heavily it reads as fog.
export function buildStormLayers(ov){
  if(ov.childElementCount)return; // already built
  // Same 4 layers / 0.86 jitter / 0.75s base speed as the original CSS rain. Per-layer spacing (which
  // the old build set via a --spacing gradient var) is now reproduced by SCALING the tiled PNG — the
  // tile bakes spacing 60 / period 113, so scale factor = jittered-spacing / 60. --drop (the fall
  // distance) scales with it so every layer still loops seamlessly.
  const LAYERS=4, JIT=0.86, baseSpeed=0.75, TILE_W=240, TILE_H=226, PERIOD=113;
  for(let i=0;i<LAYERS;i++){
    const ox=Math.random(), sp=Math.random()*2-1, spd=Math.random()*2-1, ph=Math.random(), op=Math.random()*2-1;
    const scale=1+sp*0.4*JIT;                       // matches old spacing jitter (60 → ~39..81px)
    const dur=baseSpeed*(1+spd*0.5*JIT);
    const d=document.createElement("div");
    d.className="rlayer";
    d.style.backgroundSize=(TILE_W*scale).toFixed(1)+"px "+(TILE_H*scale).toFixed(1)+"px";
    d.style.setProperty("--drop",(PERIOD*scale).toFixed(2)+"px"); // one dash period at this scale → seamless
    d.style.animationDuration=dur.toFixed(3)+"s";
    d.style.animationDelay=(-ph*dur).toFixed(3)+"s";              // desync so layers don't fall in lockstep
    d.style.backgroundPositionX=(ox*TILE_W).toFixed(1)+"px";
    d.style.opacity=Math.max(0,Math.min(1,1+op*0.35*JIT)).toFixed(3); // same opacity jitter as before
    ov.appendChild(d);
  }
}

// see the file header's chatBubbles deviation note: moved (exported) alongside render(), the
// only cluster function that reads it.
export const chatBubbles={};

// 11-06: positionChatBubble/removeChatBubble/clearChatBubbles moved verbatim here (NOT into
// src/orchestrator.js — see that file's own header for why: zero net calls, and render() right
// below is already this cluster's own same-module caller of positionChatBubble). showChatBubble
// (src/ui/panel.js, 11-04) imports removeChatBubble/positionChatBubble from here instead of
// reading them bare.
function positionChatBubble(i,x,y){
  const b=chatBubbles[i];if(!b)return;
  // x,y come from shipXY(), in the SVG's fixed 0..640 viewBox space — clamp X only (like the
  // lab.html bubble prototype this is adapted from) so a boat hugging the left/right edge
  // doesn't push its bubble half off the board; Y is left alone, same as popEmoji().
  b.style.left=Math.max(15,Math.min(85,x/640*100))+"%";
  b.style.top=(y/640*100)+"%";
}
// removes a bubble immediately regardless of whether it's mid-typewriter-reveal, holding fully
// visible, or already fading — a click must dismiss it instantly at any stage (so one player
// can't wall off the board by spamming chat and leaving bubbles up to expire on their own clock)
function removeChatBubble(i){
  const b=chatBubbles[i];if(!b)return;
  if(b._msgEl&&b._msgEl._revealTimer)clearTimeout(b._msgEl._revealTimer);
  if(b._timer)clearTimeout(b._timer);
  b.remove();
  delete chatBubbles[i];
}
export function clearChatBubbles(){Object.keys(chatBubbles).map(Number).forEach(removeChatBubble);}
export { positionChatBubble, removeChatBubble };

// D-22 fix (storm push not rendered): render() below draws every ship from the position SNAPSHOT
// that Game.ev() bakes into each event (events[evIdx].state), NOT from the live player objects. So
// a move that emits no event — which is exactly what an ordinary per-square storm step is, see
// windPush's `p.pos=nx` fall-through — repaints the identical square and the boat never appears to
// budge; it only jumps once the leg's own outcome event finally lands. This paints the ships from
// their LIVE positions instead, and is the per-square storm beat's redraw (windLeg/botWindLeg).
//
// Positions only, deliberately: coins, crates, the captain's log, the scrub bar and the host's
// event broadcast all belong to the event stream, and every storm outcome that changes any of them
// emits its own event and goes through the full liveRender()/render() path exactly as before. The
// live-players-as-a-seat-array idiom is the same one drawBoard() already uses at :244.
export function renderLiveShips(){
  if(appState.replaying)return;      // reload-replay rebuilds state silently — same guard liveRender() uses
  if(!shipEls.length)return;         // board not built yet
  const live=appState.game.players;  // shipXY() only reads .pos off each entry
  live.forEach((p,i)=>{
    const [x,y]=shipXY(p.pos,i,live,cell);
    shipEls[i].style.transform=`translate(${x}px,${y}px)`;
    if(chatBubbles[i])positionChatBubble(i,x,y); // keep an active chat bubble riding along with its boat
  });
  // the active-turn ripple has to travel with the ship it's ringing, or it's left behind mid-push.
  // The whose-turn-is-it scan is DUPLICATED from render() rather than factored out of it: this
  // file's header forbids touching render()'s body at all ("moved BYTE-IDENTICAL... do not
  // refactor... anything inside them" — it carries the v1.0 BUG-01 Safari storm-crash fix), and
  // extracting the scan would have meant editing it. Keep the two copies in step by hand.
  if(activeRing){
    let a=null;
    for(let i=appState.evIdx;i>=0&&i>appState.evIdx-80;i--){
      const t=appState.game.events[i].t;
      if(t==="turn"){a=appState.game.events[i].p;break;}
      if(t==="newround")break;
    }
    if(a!=null&&live[a]&&!live[a].done){
      const [ax,ay]=shipXY(live[a].pos,a,live,cell);
      activeRing.style.transform=`translate(${ax}px,${ay}px)`;
    }
  }
}
export function render(){
  const e=appState.game.events[appState.evIdx];if(!e)return;
  const st=e.state;
  // recipes are secret: only the local human's own recipe target is revealed.
  // in a spectator-only game (no human seat, e.g. a bot-vs-bot design test) everything stays visible.
  const humanIdxs=appState.game.players.map((p,i)=>p.strategy==="human"?i:-1).filter(i=>i>=0);
  const youIdx=humanIdxs.length===1?humanIdxs[0]:-1;
  const spectator=humanIdxs.length===0;
  appState.game.players.forEach((p,i)=>{
    const [x,y]=shipXY(st[i].pos,i,st,cell);
    shipEls[i].style.transform=`translate(${x}px,${y}px)`;
    shipEls[i].style.opacity=st[i].done?.45:1;
    if(chatBubbles[i])positionChatBubble(i,x,y); // keep an active chat bubble riding along with its boat
    const coinsEl=$("coins"+i),newCoins=st[i].coins;
    if(coinsEl.dataset.coins!==undefined&&+coinsEl.dataset.coins!==newCoins)pulseEl(coinsEl);
    coinsEl.dataset.coins=newCoins;
    coinsEl.innerHTML=`${iconImg(COIN_IMG)} ${newCoins}`;
    const hold=[...st[i].ing];
    const chipsEl=$("chips"+i);
    let newChipsHtml;
    // pass & play: your own recipe never auto-reveals — it only shows once you've tapped
    // "check my recipe" during your own live turn (see humanTurn/passGate), so a device
    // changing hands mid-battle or mid-trade can never carry someone else's recipe on screen.
    const canReveal=spectator||(i===appState.mySeat&&(!appState.passAndPlay||appState.recipeRevealed));
    const offerCheckBtn=appState.passAndPlay&&i===appState.mySeat&&i===appState.activeTurnSeat&&!appState.recipeRevealed;
    if(canReveal){
      $("prowRecipe"+i).innerHTML=`${iconImg(SCROLL_IMG)} ${recipeTitle(appState.game.players[i].recipe)}`;
      $("prowRecipe"+i).classList.add("hasRecipe");
      // recipe chips consume one matching crate each; every leftover crate is surplus cargo
      const chips=appState.game.players[i].recipe.map(ing=>{
        const k=hold.indexOf(ing);
        const have=k>=0;
        if(have)hold.splice(k,1);
        return `<span class="chip ${have?"have":""}" title="${iname(ing)}">${ingImg(ing)}</span>`;
      });
      const extras=hold.map(x2=>`<span class="chip extra" title="surplus cargo: ${iname(x2)}">${ingImg(x2)}</span>`);
      newChipsHtml=chips.join("")+(extras.length?`<span style="opacity:.4">·</span>`:"")+extras.join("");
    }else if(offerCheckBtn){
      $("prowRecipe"+i).classList.remove("hasRecipe");
      newChipsHtml=`<button type="button" class="checkRecipeBtn" onclick="revealMyRecipe()" style="background:${HEXCOL[i]};color:#fff;border-color:${HEXCOL[i]}">🔍 Check my recipe</button>`;
    }else{
      // other captains' recipe maps are private — only the crates visibly aboard their ship are shown.
      // sorted so duplicate ingredients sit next to each other — easier to spot a tradeable double
      $("prowRecipe"+i).classList.remove("hasRecipe");
      const held=hold.slice().sort().map(x2=>`<span class="chip have" title="${iname(x2)}">${ingImg(x2)}</span>`);
      newChipsHtml=held.join("")||`<span style="opacity:.4">empty hold</span>`;
    }
    if(chipsEl.innerHTML&&chipsEl.innerHTML!==newChipsHtml)pulseEl(chipsEl);
    chipsEl.innerHTML=newChipsHtml;
    const lastEv=appState.game.events[appState.game.events.length-1];
    $("crown"+i).innerHTML=(lastEv.t==="end"&&lastEv.winner===i&&appState.evIdx===appState.game.events.length-1)?iconImg(CROWN_IMG):"";
  });
  // active-player ring + captain's-box highlight: whose turn is it as of this event?
  let active=null;
  for(let i=appState.evIdx;i>=0&&i>appState.evIdx-80;i--){
    const t=appState.game.events[i].t;
    if(t==="turn"){active=appState.game.events[i].p;break;}
    if(t==="newround")break;
  }
  if(active!=null&&st[active].done)active=null;
  if(activeRing){
    if(active!=null){
      const [ax,ay]=shipXY(st[active].pos,active,st,cell);
      activeRing.style.transform=`translate(${ax}px,${ay}px)`;
      activeRing.setAttribute("opacity",1);
    }else activeRing.setAttribute("opacity",0);
  }
  appState.game.players.forEach((p,i)=>{
    const row=$("prow"+i);if(row)row.classList.toggle("activeTurn",i===active);
  });
  if(appState.game.cfg.crates<1e9)for(const ing of appState.game.ings){
    const remaining=e.tokens[ing];
    for(let idx=0;idx<appState.game.cfg.crates;idx++){
      const ic=document.getElementById(`crate_${ing}_${idx}`);if(!ic)continue;
      const taken=idx>=remaining;
      const img=ic.querySelector("image");
      if(img)img.setAttribute("href",taken?ING_HOLE_IMG[ing]:ING_IMG[ing]);
      ic.style.opacity=taken?.45:1;
    }
  }
  if(spinNeedle&&e.wind){
    const storming=!!e.storm;
    const angle=storming&&e.wind2?STORM_DIAG[e.wind][e.wind2]:({N:0,E:90,S:180,W:270})[e.wind];
    spinNeedle.style.transform=`rotate(${angle}deg)`;
    // notes/edits UI-05: the "⛈️ STORM" word + emoji under the compass are gone — the darkened
    // board, the coloured dial, the glowing needle and the rain already read as "storm" without a
    // caption. Kept the (now always-empty) node so the storm-colour toggle below still has a safe
    // target and nothing else has to change.
    stormText.textContent="";
    if(stormDial){
      stormDial.setAttribute("fill",storming?"#2a2f4a":"#fffdf0");
      stormDial.setAttribute("stroke",storming?"#141824":"#f5a623");
    }
    const needleImg=spinNeedle.querySelector("image");
    if(needleImg)needleImg.style.filter=storming?"drop-shadow(0 0 5px #ffd23f) saturate(1.4)":"none";
    windLabels.forEach(t=>t.setAttribute("fill",storming?"#f4f6ff":"#1f4249"));
    // #1b: darken the whole board + run the rain overlay during a storm. The CSS handles the fade
    // in/out; here we toggle the class and, while storming, aim the rain to fall WITH the wind.
    // `angle` is the compass heading the wind blows toward (0=N/up, clockwise). Each rain layer's
    // local fall is straight down; rotating by angle+180 turns that into the true wind direction.
    const bw=$("boardwrap");if(bw)bw.classList.toggle("storming",storming);
    const ov=$("stormOverlay");
    if(ov&&storming){
      buildStormLayers(ov); // lazily create the jittered rain layers (once)
      ov.style.setProperty("--slant",(angle+180)+"deg");
    }
  }
  $("scrub").value=appState.evIdx;
  renderLog();
  // end stats
  if(appState.evIdx===appState.game.events.length-1&&(!appState.live||appState.liveDone))showStats();
  else $("statsWrap").style.display="none";
}
let logRenderedTo=-1;

// Exported accessor for beginGame() (still-classic, a later wave) to reset this cluster's log
// render cursor before a fresh game — see the file header's deviation note.
export function resetBoardLog(v){logRenderedTo=v;}

export function renderLog(){
  const box=$("log");
  const atBottom=box.scrollHeight-box.scrollTop-box.clientHeight<50;
  if(appState.evIdx===logRenderedTo+1){
    const prev=box.querySelector(".line.cur");if(prev)prev.classList.remove("cur");
    const L=appState.logLines[appState.evIdx];
    if(L){const d=document.createElement("div");d.className="line "+(L.cls||"")+" cur";d.innerHTML=L.txt;box.appendChild(d);}
  }else if(appState.evIdx!==logRenderedTo){
    let html="";
    for(let i=0;i<=appState.evIdx;i++){const L=appState.logLines[i];if(!L)continue;
      html+=`<div class="line ${L.cls||""} ${i===appState.evIdx?"cur":""}">${L.txt}</div>`;}
    box.innerHTML=html;
  }
  logRenderedTo=appState.evIdx;
  if(atBottom)box.scrollTop=box.scrollHeight;
}

/* ---------- action popups on the map ---------- */
// SVG's default transform-box is the whole viewport, so the popfloat keyframe's scale()
// would otherwise be anchored at the board's (0,0) corner instead of the emoji's own spot —
// every pop would rocket toward/away from that corner instead of rising in place. Pinning
// transform-origin to the emoji's own x,y (same fix as celebrateHomeDocks' dancingPastry).
export function popEmoji(x,y,emo,big,imgHref,cls){
  // callers only need to pass imgHref explicitly when they want art OTHER than the emoji's own
  // default (e.g. the tradewind pop's big board swirl, distinct from 🌀's usual pocket icon) —
  // otherwise this falls back to whatever's in EMOJI_IMG automatically.
  imgHref=imgHref||EMOJI_IMG[emo];
  const g=el("g",{class:"pop"+(cls?" "+cls:""),style:`transform-origin:${x}px ${y}px`},$("board"));
  const size=cell*(big?.72:.55);
  if(imgHref){
    const im=el("image",{x:x-size*.43,y:y-size*.43,width:size*.86,height:size*.86,href:imgHref},g);
    // same fallback as iconAt(): if the art can't load, drop the <image> and show the emoji
    if(emo)im.addEventListener("error",()=>{im.remove();el("text",{x,y,"text-anchor":"middle","font-size":size},g).textContent=emo;});
  }else{
    el("text",{x,y,"text-anchor":"middle","font-size":size},g).textContent=emo;
  }
  setTimeout(()=>g.remove(),cls==="splash"?3900:2600); // UI-03: 2x the old 1950/1300, matching the doubled CSS
}

// once the voyage is over, replace the Isle of Tortuga's 4 berths with dancing pastries —
// a little celebration flourish, purely cosmetic (doesn't touch game state)
export function celebrateHomeDocks(){
  const pastryImgs=[CROISSANT_IMG,CAKE_SLICE_IMG,DONUT_IMG,CUPCAKE_IMG];
  for(let i=0;i<4;i++){
    const rect=$("homeDock"+i);
    if(!rect)continue;
    const x=+rect.getAttribute("x")+(+rect.getAttribute("width"))/2;
    const y=+rect.getAttribute("y")+(+rect.getAttribute("height"))/2;
    rect.remove();
    const ty=y+cell*.14,size=cell*.7;
    // the dancing rotation is a CSS animation, which takes over the whole `transform` and would
    // clobber a plain SVG translate attribute on the same element — position via an outer group's
    // attribute (untouched by CSS) and rotate an inner group around its own fill-box center instead
    const outer=el("g",{transform:`translate(${x},${ty})`},$("board"));
    const inner=el("g",{class:"dancingPastry",style:"transform-box:fill-box;transform-origin:center"},outer);
    el("image",{x:-size/2,y:-size/2,width:size,height:size,href:pastryImgs[i%pastryImgs.length]},inner);
  }
}
// notes/edits EOV-05: a one-off burst of pastries + coins arcing up over the winner's ship to make
// the victory land as a real moment. Purely cosmetic (uses popEmoji, the same board-pop system
// every event already uses), so it touches no game state and is safe during replay/spectate.
export function victoryConfetti(winner){
  const st=appState.game.events[appState.game.events.length-1]&&appState.game.events[appState.game.events.length-1].state;
  const treats=[["🥐",CROISSANT_IMG],["🍰",CAKE_SLICE_IMG],["🍩",DONUT_IMG],["🧁",CUPCAKE_IMG],["🌕",COIN_IMG],["👑",CROWN_IMG]];
  let cx=null,cy=null;
  if(st&&st[winner]){const [x,y]=shipXY(st[winner].pos,winner,st,cell);cx=x;cy=y-cell*.42;}
  for(let k=0;k<18;k++){
    const [emo,img]=treats[k%treats.length];
    // scatter across the board (fall back to the winner's ship if we can't read a board width)
    const bx=cx!=null?cx+(Math.random()-0.5)*cell*7:cell*(1+Math.random()*8);
    const by=cy!=null?cy+(Math.random()-0.5)*cell*3:cell*(1+Math.random()*6);
    setTimeout(()=>popEmoji(bx,by,emo,Math.random()<0.5,img),k*70);
  }
}
export function showStats(){
  $("statsWrap").style.display="";
  celebrateHomeDocks();
  const w=appState.game.winner;
  const banner=w===null?`${iconImg(HOURGLASS_IMG)} Nobody finished!`:`${iconImg(CROWN_IMG)} ${pn(w)} wins!`;
  // notes/edits EOV-02: the winner's recipe image is NOT shown here anymore — it lives in the one-off
  // victory box (see endLive), so the End of Voyage summary isn't doubling it up.
  const luck=appState.game.players.map(p=>p.flips?(p.heads/p.flips):0);
  // notes/edits EOV-04: one keepsake per captain (see assignBadges) — emblem, pirate name + byline,
  // the captain (big, colored, no seat dot) filling the card above a rule, and the stat beneath it.
  const badges=assignBadges();
  const awards=badges.map(b=>`<div class="awardCard" style="border-color:${HEXCOL[b.seat]}">
      <img class="awardEmblem" src="${ASSET_BASE}badges/${b.def.img}.png" alt="">
      <div class="awardName">${b.def.name}</div>
      <div class="awardByline">${b.def.byline}</div>
      <div class="awardCaptain" style="color:${HEXCOL[b.seat]}">${pname(b.seat)}</div>
      <hr class="awardRule">
      <div class="awardStat">${b.def.stat}${b.value!=null?` — <b>${b.value}${b.def.unit||""}</b>`:""}</div>
    </div>`).join("");
  $("statsPanel").innerHTML=`<div class="winner-banner">${banner}</div>
    <div class="awardsRow">${awards}</div>
    <table>
    <tr><td>Rounds</td><td>${appState.game.round}</td></tr>
    <tr><td>Battles</td><td>${appState.game.battles} (attacker won ${appState.game.battles?Math.round(100*appState.game.attWins/appState.game.battles):0}%)</td></tr>
    <tr><td>Trades</td><td>${appState.game.trades}</td></tr>
    <tr><td>Bakeoff</td><td>${appState.game.finishOrder.length>1?"yes — "+appState.game.finishOrder.length+" finishers":"no"}</td></tr>
    ${appState.game.players.map((p,i)=>`<tr><td style="color:${HEXCOL[i]}">${pname(i)} heads-luck</td><td>${p.flips?Math.round(100*luck[i]):0}% of ${p.flips} flips</td></tr>`).join("")}
    </table>`;
}

// a purely decorative bot-vs-bot board rendered behind the welcome modal, so new players
// get a glimpse of the game before they've made a choice. Never interactive.
export function renderDecorativeBoard(){
  try{
    const strategies=["pirate","trader","balanced","rusher"];
    appState.game=new Game(roundCfg(strategies),Math.floor(Math.random()*1e9),true);
    appState.roster=strategies.map(s=>({bot:true,strat:s}));
    appState.mySeat=null;
    drawBoard();buildPlayerRows();
    appState.game.round=1;appState.game.windNow="NSEW"[Math.floor(Math.random()*4)];appState.game.stormNow=false;
    appState.game.ev({t:"newround",dir:appState.game.windNow});
    appState.evIdx=0;appState.logLines=[describe(appState.game.events[0])];
    render();
    $("statsWrap").style.display="none";
    $("actionPanel").style.display="none";
  }catch(err){console.error("decorative board failed",err);}
}

// Board size is driven purely by available HEIGHT (board+footer always fit the viewport, floored
// at 600px) — width never shrinks it. The sidebar then just takes whatever width is left over
// next to that board, up to a sane cap so it doesn't stretch absurdly on ultrawide monitors. Once
// that leftover width can no longer fit a full row of 5 ingredient chips, we drop to the stacked
// (narrow) layout — board full-width on its own row, sidebar full-width below it — instead of
// squeezing the sidebar further and wrapping ingredients onto a second line.
const MIN_SIDEBAR_W=380,MAX_SIDEBAR_W=560;
export function syncBoardSizing(){
  const root=document.documentElement;
  const footerH=($("footerRow")||{}).offsetHeight||0;
  const chromeH=28+14+footerH; // #game top/bottom padding + layout gap + footer height
  const boardSize=Math.max(600,window.innerHeight-chromeH);
  const availW=window.innerWidth-28; // #game's own left+right padding
  const remaining=availW-boardSize-14; // width left for the sidebar after the board + the column gap
  const wide=remaining>=MIN_SIDEBAR_W;
  $("game").classList.toggle("layoutWide",wide);
  if(wide){
    root.style.setProperty("--boardW",boardSize+"px");
    root.style.setProperty("--sideW",Math.min(remaining,MAX_SIDEBAR_W)+"px");
  }else{
    // stacked layout: the flippenator/timer row and the narration box also sit below the board
    // in this single column, so the board must leave room for THEM too, not just the footer —
    // otherwise it claims nearly the full viewport height on its own and pushes the narration
    // box (sometimes even the flippenator) below the fold. This runs at the moment the game view
    // first appears, before #actionPanel has any narration in it (offsetHeight would read 0), so
    // budget off an assumed typical height for the common (short-message) case — #actionPanel
    // has no CSS height cap, so a long narration/battle/recipe-draft message can still grow past
    // this budget; the page itself simply scrolls at that point instead of the panel internally.
    const gap=14; // matches #layout's grid gap, repeated between every stacked row
    const actionMaxH=180;
    const controlsH=($("controlsRow")||{}).offsetHeight||0;
    const narrowBudget=window.innerHeight-28-gap*2-controlsH-actionMaxH;
    const narrowBoardSize=Math.max(280,Math.min(narrowBudget,availW));
    root.style.setProperty("--boardW",narrowBoardSize+"px");
    root.style.removeProperty("--sideW");
  }
}

// ---- the flippenator: one always-visible coin+button; every flip in the game plays here ----
// The flippenator coin doubles as its own button — no separate FLIP button — so this sets
// the coin's own class/text directly instead of using coinHTML() (which stays for the
// battle scoreboard's per-fighter result circles, a separate use of the same .coin styles).
export function setFlipCoin(state){
  const el=$("flipCoinWrap");if(!el)return;
  el.classList.remove("heads","tails","spin","wait","active");el.onclick=null;el.style.backgroundImage="";
  if(state==="H"){el.classList.add("heads");el.style.backgroundImage=`url(${FLIP_HEADS_IMG})`;el.textContent="";}
  else if(state==="T"){el.classList.add("tails");el.style.backgroundImage=`url(${FLIP_TAILS_IMG})`;el.textContent="";}
  else if(state==="spin"){el.classList.add("spin");el.style.backgroundImage=`url(${COIN_SPIN_IMG})`;el.textContent="";}
  else{el.classList.add("wait");el.textContent="";}
}
export function setFlipActive(onClick){
  const el=$("flipCoinWrap");if(!el)return;
  // notes/edits #6: show the heads face behind "FLIP" (was a flat gradient, no coin art) — a
  // tint layer on top keeps the text legible over the image.
  // notes/edits UI-09: drop the heavy orange tint over the whole coin — show the clean heads face
  // and make just the word "FLIP" orange instead (see #flipCoinWrap.active CSS).
  if(onClick){el.classList.add("active");el.style.backgroundImage=`url(${FLIP_HEADS_IMG})`;el.textContent="FLIP";el.onclick=onClick;}
  else{el.classList.remove("active");el.style.backgroundImage="";el.onclick=null;}
}
