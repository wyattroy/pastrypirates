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
// SCOPED EXCEPTION TO THE ABOVE — G19 (Wyatt-approved 2026-07-30), recorded here so the next reader
// is not entitled to revert it. buildStormLayers() WAS changed, deliberately and narrowly, in two
// ways: (a) its RNG source swapped from unseeded Math.random() to a private mulberry32 seeded from
// the game, so every client in a room sees the same rain, and (b) two tuning constants retuned to
// the midpoint of two screens measured live (baseSpeed 0.75 -> 0.676, a new BASE_SCALE 0.969). The
// pure spec-building half was lifted into stormLayerSpecs() so it can be tested headlessly; the
// DOM-writing half applies those specs in exactly the order and with exactly the properties it
// always did.
//
// WHY THAT IS SAFE, stated in terms of what BUG-01 actually fixed. The Safari crash was caused by a
// LIVE CSS GRADIENT plus a MASK being composited every frame, and by the narration box's height
// animating on every typewriter tick. The fix was to pre-bake the rain into a PNG tile, animate
// only background-position, and snap the height. NONE of that changes here: no gradient, no mask,
// no per-frame work, no extra layers (LAYERS is still 4), and the layers are still built ONCE and
// cached by the childElementCount guard. Different numbers into the same four static properties.
// The Safari eyeball check is on this task's human-verify list regardless.
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
  mulberry32,
  DIRS, STORM_DIAG, HEXCOL, ASSET_BASE, EMOJI_IMG,
  BOARD_IMG, DOCK_IMG, BOAT_IMG, ING_IMG, ING_HOLE_IMG, ANCHOR_IMG, TRADE_SWIRL_IMG,
  WIND_ARROW_IMG, COMPASS_DIAL_IMG, COMPASS_NEEDLE_IMG, COIN_IMG, SCROLL_IMG, CROWN_IMG,
  HOURGLASS_IMG, CROISSANT_IMG, CAKE_SLICE_IMG, DONUT_IMG, CUPCAKE_IMG,
  FLIP_HEADS_IMG, FLIP_TAILS_IMG, COIN_SPIN_IMG,
  iconImg, iname, ingImg,
} from "../shared/index.js";
import {
  dockOrient, tracePolygonLoops, roundedPathFromLoop, islandArtPlacement, shipXY, pulseEl,
  describeFor, NEUTRAL_VIEWER, assignBadges, pname, pn, buildPlayerRows, SHIP_GLIDE_MS,
} from "./util.js";
import { recipeTitle, recipeInfo, winRecipeSpan, recipeArticle } from "./recipe.js";

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
      // NEGATIVE delays, and the sign is the whole point — do not drop the minus.
      //
      // A POSITIVE animation-delay leaves the element in its UN-ANIMATED state until the delay
      // elapses, and animation-fill-mode is `none` here. Measured: with +0.9s/+1.8s, rings 2 and 3
      // rendered as static, fully opaque circles at scale 1 (no transform, opacity 1) parked on the
      // boat for the first 0.9s and 1.8s. That is the first-cycle glitch Wyatt filmed — and it
      // cleared itself once every ring had started, which is why it "looked really good after they
      // have loaded".
      //
      // A negative delay instead starts the animation as if it had ALREADY been running that long,
      // so all three rings are correctly distributed at 0%, 33% and 66% from the very first frame.
      // One third of the 2.7s rippleOut cycle in index.html; if that duration changes, this must
      // change with it or the rings bunch together.
      style:`animation-delay:${-i*.9}s`},activeRing);
  // ships
  shipEls=[];
  appState.game.players.forEach((p,i)=>{
    // DERIVED from SHIP_GLIDE_MS, not written as a literal `.35s`. util.js's constant carried the
    // comment "must match drawBoard()'s ship `transition: transform .35s`" — two numbers kept in
    // step by hand, in different files, one of them the pacing basis for every per-square animation
    // in the game. setShipGlideMs() below now also has to restore this exact value, which would
    // have made it three. Deriving it makes the coupling structural instead of a promise.
    const g=el("g",{style:`transition: transform ${shipGlideCss(SHIP_GLIDE_MS)}`},svg);
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
// G19 (Wyatt-approved 2026-07-30): the PURE half of buildStormLayers — same seed in, byte-identical
// specs out, in any browser. Extracted so it can be tested headlessly and, more importantly, so the
// randomness has ONE source that is not the machine.
//
// WHY. Measured live this session on two screens in the same room: Wyatt's rain averaged 0.818s /
// 200.5px, Claude's 0.534s / 264.7px. This function used to jitter four layers with UNSEEDED
// Math.random() and cache the result per browser, so every player in a room got permanently
// different weather. His fix, option 1: seed it from the game.
//
// mulberry32(seed), NEVER appState.game.r(). THIS IS THE MOST IMPORTANT LINE IN THIS FUNCTION.
// game.r() is the seeded GAME stream; drawing four extra numbers from it would advance that stream
// and desync every client AND all 31 determinism fixtures. A PRIVATE RNG seeded from the same
// number gives identical rain in every browser in the room while consuming nothing from the game.
//
// The per-layer jitter is KEPT (LAYERS=4, JIT=0.86 — his words were to keep it; it is what gives
// the rain depth). What changes is where the variation lives: it used to vary between PLAYERS, and
// now it varies between GAMES.
export function stormLayerSpecs(seed){
  // Same 4 layers / 0.86 jitter as the original CSS rain. Per-layer spacing (which the old build set
  // via a --spacing gradient var) is reproduced by SCALING the tiled PNG — the tile bakes spacing 60
  // / period 113, so scale factor = jittered-spacing / 60. --drop (the fall distance) scales with it
  // so every layer still loops seamlessly; that coupling is easy to break later, so: --drop derives
  // from `scale` (PERIOD*scale) and therefore follows the new base for free.
  //
  // G19 RETUNE (his option 3): "let's split the difference between our two screens' settings right
  // now to use as the new target setting."
  //   baseSpeed 0.75 -> 0.676 — the midpoint of the two measured means, (0.818+0.534)/2 = 0.676.
  //   BASE_SCALE 0.969 — 240 x 0.969 = 232.6px, the midpoint of 200.5 and 264.7 ((200.5+264.7)/2
  //   = 232.6; 232.6/240 = 0.969).
  const LAYERS=4, JIT=0.86, baseSpeed=0.676, BASE_SCALE=0.969, TILE_W=240, TILE_H=226, PERIOD=113;
  const rnd=mulberry32(seed);
  const specs=[];
  for(let i=0;i<LAYERS;i++){
    const ox=rnd(), sp=rnd()*2-1, spd=rnd()*2-1, ph=rnd(), op=rnd()*2-1;
    const scale=BASE_SCALE*(1+sp*0.4*JIT);          // matches old spacing jitter (60 → ~39..81px)
    const dur=baseSpeed*(1+spd*0.5*JIT);
    specs.push({
      scale,
      dur,
      bgSize:(TILE_W*scale).toFixed(1)+"px "+(TILE_H*scale).toFixed(1)+"px",
      drop:(PERIOD*scale).toFixed(2)+"px",          // one dash period at this scale → seamless
      duration:dur.toFixed(3)+"s",
      delay:(-ph*dur).toFixed(3)+"s",               // desync so layers don't fall in lockstep
      bgPosX:(ox*TILE_W).toFixed(1)+"px",
      opacity:Math.max(0,Math.min(1,1+op*0.35*JIT)).toFixed(3), // same opacity jitter as before
    });
  }
  return specs;
}
// G19: the decorative demo board has no game, so it has no seed. Fall back to a FIXED literal rather
// than Math.random() — a demo board that looks the same every load is fine, and it keeps "nothing in
// the rain path draws unseeded randomness" absolute rather than nearly-true.
const DEMO_RAIN_SEED=1337;
export function buildStormLayers(ov,seed){
  if(ov.childElementCount)return; // already built
  for(const s of stormLayerSpecs(seed==null?DEMO_RAIN_SEED:seed)){
    const d=document.createElement("div");
    d.className="rlayer";
    d.style.backgroundSize=s.bgSize;
    d.style.setProperty("--drop",s.drop);
    d.style.animationDuration=s.duration;
    d.style.animationDelay=s.delay;
    d.style.backgroundPositionX=s.bgPosX;
    d.style.opacity=s.opacity;
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
  // G14: the whose-turn-is-it scan now lives in activeTurnSeat() below, shared with paintShipAt().
  // It was previously duplicated inline here because this file's header forbids touching render()'s
  // body ("moved BYTE-IDENTICAL... do not refactor... anything inside them" — the v1.0 BUG-01
  // Safari storm-crash fix). render() KEEPS its own copy and is still NOT touched; extracting the
  // duplicate out of THIS function removes the second copy rather than adding a third.
  if(activeRing){
    const a=activeTurnSeat();
    if(a!=null&&live[a]&&!live[a].done){
      const [ax,ay]=shipXY(live[a].pos,a,live,cell);
      activeRing.style.transform=`translate(${ax}px,${ay}px)`;
    }
  }
}
// G14: which seat currently owns the turn, by walking back from the current event to the nearest
// `turn` (stopping at a round boundary). Extracted from renderLiveShips so paintShipAt can ring the
// right ship too. render() has an identical inline copy which is deliberately LEFT ALONE — see the
// file header's BYTE-IDENTICAL rule.
function activeTurnSeat(){
  for(let i=appState.evIdx;i>=0&&i>appState.evIdx-80;i--){
    const t=appState.game.events[i].t;
    if(t==="turn")return appState.game.events[i].p;
    if(t==="newround")break;
  }
  return null;
}
// G14 (Wyatt-approved 2026-07-30): move ONE ship element to an arbitrary cell, without touching game
// state or the event stream. The per-square painter behind the trade-wind rim sweep.
//
// WHY THIS EXISTS AT ALL — and it is the reason the stepper can be SHARED: renderLiveShips() above
// reads `appState.game.players[i].pos`, which on a GUEST NEVER UPDATES (a guest's authority is the
// broadcast event feed, not a local simulation), so it cannot be reused here. This function bases
// the shared-cell nudge on `events[evIdx].state` instead — the same snapshot render() draws from,
// and the reason a guest can render at all — with just this seat's pos overridden. Correct on both
// tiers by construction.
// ONE spelling of the ship glide, used by drawBoard() to create it and by setShipGlideMs() to
// retune and restore it. Only the duration and the easing ever vary.
const SHIP_GLIDE_EASE="cubic-bezier(.42,0,.58,1)";
function shipGlideCss(ms,ease){ return `${ms}ms ${ease||SHIP_GLIDE_EASE}`; }
// Retune ONE ship's glide duration, or restore the default when `ms` is null.
//
// WHY THIS EXISTS (2026-07-31, from two trade-wind recordings): the default SHIP_GLIDE_MS (350ms)
// is tuned for a ship moving ONE square at a time and is far too long for a sweep that re-aims the
// ship many times a second. Left at 350ms the ship was still travelling toward one target when the
// next arrived, so it lagged, and — chasing a target around a curve — took the chord instead of the
// arc, cutting across the middle of the board.
//
// The sweep now drives the motion itself, tick by tick along a spline, so it wants a glide of about
// ONE TICK and a LINEAR easing: just enough for the browser to bridge between successive targets
// and absorb setTimeout's jitter, and not so much that the lag returns. See RIM_SWEEP_TICK_MS.
//
// Scoped to one seat because only the sweeping ship should be retuned — every other ship on the
// board is still moving under ordinary rules and must keep the ordinary glide.
// `ease` matters as much as `ms` here: the rim sweep drives its own motion tick by tick, so it wants
// a LINEAR glide of about one tick — just enough for the browser to bridge between our targets and
// absorb setTimeout's jitter. The default eased curve applied per-tick would ease in and out of
// every single tick, which is a shimmer, not a smooth line.
// THE RING MUST BE RETUNED WITH THE SHIP — 2026-07-31, third recording (`notes/tradewinds v5.mov`).
// activeRing carries NO transition of its own, so it SNAPS to each target while the ship eases
// toward it, leaving the ripple permanently ahead of the boat it is supposed to be marking. That is
// how the very first bug was diagnosed (the ring ran ~2 squares ahead and was drawing the correct
// path), and once the ship's own lag was fixed the same asymmetry became the remaining visible
// defect — smaller, but now the only thing moving out of step. Wyatt: *"the rings now move ahead of
// the boat."*
//
// The ring is only retuned while a sweep is in flight, and RESTORED to snapping afterwards. It must
// keep snapping normally: `render()` repositions it whenever the turn passes, and a ring that
// glided there would slide right across the board from the previous captain's boat to the next.
export function setShipGlideMs(seat,ms,ease){
  if(!shipEls.length||!shipEls[seat])return;
  const css=`transform ${shipGlideCss(ms==null?SHIP_GLIDE_MS:ms,ms==null?null:ease)}`;
  shipEls[seat].style.transition=css;
  if(activeRing&&activeTurnSeat()===seat)activeRing.style.transition=ms==null?"":css;
}
// Move one ship to an arbitrary FRACTIONAL cell position — the sub-square painter behind the smooth
// trade-wind arc. paintShipAt() below can only address whole cells, which is precisely the
// limitation that made the sweep a staircase.
//
// No shared-cell nudge here, deliberately: shipXY()'s ±0.18 offset exists so two ships PARKED on one
// square stay both visible, and applying it to a ship in flight would make it twitch sideways every
// time it passed over an occupied square. The resting nudge is restored by the final
// paintShipAt(seat,to) when the sweep ends.
export function paintShipAtPoint(seat,fx,fy){
  if(appState.replaying)return;
  if(!shipEls.length||!shipEls[seat])return;
  const x=(fx+.5)*cell, y=(fy+.5)*cell;
  shipEls[seat].style.transform=`translate(${x}px,${y}px)`;
  if(chatBubbles[seat])positionChatBubble(seat,x,y);
  if(activeRing&&activeTurnSeat()===seat)activeRing.style.transform=`translate(${x}px,${y}px)`;
}
export function paintShipAt(seat,c){
  if(appState.replaying)return;
  if(!shipEls.length||!shipEls[seat])return;
  const ev=appState.game.events[appState.evIdx];
  // fall back to the live players array when there is no event yet (first paint of a fresh game)
  const base=(ev&&ev.state)?ev.state:appState.game.players;
  const st=base.map((s,i)=>i===seat?{...s,pos:c}:s);
  const [x,y]=shipXY(c,seat,st,cell);
  shipEls[seat].style.transform=`translate(${x}px,${y}px)`;
  if(chatBubbles[seat])positionChatBubble(seat,x,y); // the bubble rides along, as renderLiveShips does
  if(activeRing&&activeTurnSeat()===seat){
    activeRing.style.transform=`translate(${x}px,${y}px)`;
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
      // @copy misc.board.surplustooltip
      const extras=hold.map(x2=>`<span class="chip extra" title="surplus cargo: ${iname(x2)}">${ingImg(x2)}</span>`);
      // @copy misc.board.prowcargorow
      newChipsHtml=chips.join("")+(extras.length?`<span style="opacity:.4">·</span>`:"")+extras.join("");
    }else if(offerCheckBtn){
      $("prowRecipe"+i).classList.remove("hasRecipe");
      // @copy misc.board.checkrecipebtn
      newChipsHtml=`<button type="button" class="checkRecipeBtn" onclick="revealMyRecipe()" style="background:${HEXCOL[i]};color:#fff;border-color:${HEXCOL[i]}">🔍 Check my recipe</button>`;
    }else{
      // other captains' recipe maps are private — only the crates visibly aboard their ship are shown.
      // sorted so duplicate ingredients sit next to each other — easier to spot a tradeable double
      $("prowRecipe"+i).classList.remove("hasRecipe");
      const held=hold.slice().sort().map(x2=>`<span class="chip have" title="${iname(x2)}">${ingImg(x2)}</span>`);
      // @copy misc.board.emptyhold
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
      // G19: pass the GAME seed so every client in a room renders identical rain. appState.game may
      // be absent on the decorative demo board — stormLayerSpecs falls back to a fixed literal seed,
      // never Math.random().
      buildStormLayers(ov,appState.game&&appState.game.seed); // lazily create the jittered rain layers (once)
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
  // UI-02 (Wyatt, 2026-07-31): the two travel distances the popfloat keyframes use, derived from the
  // LIVE cell size rather than hardcoded px, so the icon's flight scales with the board instead of
  // being a fixed 32px that means different things on a phone and a desktop.
  //   --pop-rise  how far ABOVE this anchor the icon appears. The anchor (spawnPops' at()) already
  //               sits .42 of a cell above the ship, so .55 more puts the spawn point ~1 full square
  //               up — the square north of the boat, which is where he asked for it.
  //   --pop-sink  how far BELOW the anchor the hull is, so the icon lands IN the boat rather than
  //               stopping short above it. .42 is exactly the anchor's own offset, inverted.
  // The `.splash` variant does NOT read these — popsplash has its own choreography and is untouched.
  const g=el("g",{class:"pop"+(cls?" "+cls:""),
    style:`transform-origin:${x}px ${y}px;--pop-rise:${(cell*.55).toFixed(1)}px;--pop-sink:${(cell*.42).toFixed(1)}px`},$("board"));
  const size=cell*(big?.72:.55);
  if(imgHref){
    const im=el("image",{x:x-size*.43,y:y-size*.43,width:size*.86,height:size*.86,href:imgHref},g);
    // same fallback as iconAt(): if the art can't load, drop the <image> and show the emoji
    if(emo)im.addEventListener("error",()=>{im.remove();el("text",{x,y,"text-anchor":"middle","font-size":size},g).textContent=emo;});
  }else{
    el("text",{x,y,"text-anchor":"middle","font-size":size},g).textContent=emo;
  }
  // Must OUTLAST the CSS animation or the node is ripped out mid-flight — the CR-01 failure, where a
  // removal belt kept beating the animation it was supposed to follow. splash is 3.8s (popsplash),
  // popfloat is 2s since the burst retune; +100ms of margin each.
  setTimeout(()=>g.remove(),cls==="splash"?3900:2100);
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
  // UI-07: collapse the narration/action box once the End of Voyage summary is up. By this point
  // the box can only be in one of two states, and neither should stay on screen underneath the
  // summary: EMPTY (EOV-01 removed the win announcement from it, and showNarration carries no timer
  // of its own, so nothing replaces the last line), or holding a now-stale final line. A large
  // empty panel between the board and the awards is the reported symptom.
  //
  // This does NOT contradict F6, Wyatt's "the blue box should never be empty" rule. F6 governs the
  // box DURING PLAY, where an empty box means a dropped message. The voyage is over; the box has no
  // further job, and the summary is the thing to look at.
  //
  // Safe to hide unconditionally: panel() sets display itself on any later call, so a new line
  // re-shows the box without needing anything undone here.
  const ap=$("actionPanel");
  if(ap){$("apGridInner").innerHTML="";ap.style.display="none";ap.classList.remove("needsAction");}
  celebrateHomeDocks();
  const w=appState.game.winner;
  // WYATT, 2026-07-31 — THIS REVERSES EOV-02 ON HIS INSTRUCTION. Read this before "restoring"
  // anything: EOV-02 moved the winner's recipe OUT of the End of Voyage summary and into a separate
  // one-off victory box rendered through flash(), specifically so the summary would not double it
  // up. He has now asked for the opposite, and for a reason that did not exist then — the blue box
  // is hidden at the end of the voyage (UI-07), so the victory box was the one thing keeping it on
  // screen. His words: "i want the golden victory box to say: 👑 {name} wins! {the recipe image} +
  // {name} baked a {recipe} and won Best Baker in the Caribbean!"
  //
  // So all three pieces live here now, in the gold banner, and endLive no longer flashes a victory
  // box at all — it plays "Drumroll..." in the blue box, fades it, and hides it. Nothing is
  // duplicated: this is the ONLY place the win is announced.
  //
  // The two sentences are his existing approved copy, moved rather than rewritten — the banner line
  // (@copy misc.board.eovbanner) and the victory line (formerly @copy adhoc.voyageend.victory in
  // src/orchestrator.js, which is why that id now lives on this file's site).
  // Two separate `const`s, each with its own @copy marker, because they are two separate approved
  // strings with two separate ids — the extractor binds one marker per assignment site, and folding
  // them into one template would make both ids point at the same site.
  // @copy misc.board.eovbanner
  const banner=w===null?`${iconImg(HOURGLASS_IMG)} Nobody finished!`:`${iconImg(CROWN_IMG)} ${pn(w)} wins!`;
  // The winner's recipe is read defensively, and that is NOT belt-and-braces — it is a guest-path
  // requirement. This code used to live in endLive() (src/orchestrator.js), which only ever runs on
  // the HOST after a real finished game, so a recipe was guaranteed. showStats() is different: the
  // guest reaches it through applyEndMeta(), which sets game.winner straight from Firebase meta and
  // renders. A guest whose local game has not drafted recipes — joined late, or an incomplete replay
  // — would hit `undefined.slice()` inside recipeInfo() and throw, taking the ENTIRE End of Voyage
  // screen down with it: no banner, no awards, no stats. Caught exactly that way in a browser.
  const winRecipe=w===null?null:(appState.game.players[w]||{}).recipe;
  // @copy adhoc.voyageend.victory
  const victoryLine=!winRecipe?"":`<div class="victoryText">${pn(w)} baked ${(a=>a?a+" ":"")(recipeArticle(winRecipe))}${winRecipeSpan(w)} and won <b>Best Baker in the Caribbean!</b></div>`;
  const wi=winRecipe?recipeInfo(winRecipe):null;
  const victoryPic=wi&&wi.img?`<img class="victoryRecipe" src="${wi.img}" alt="">`:""; // art, not copy
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
  // NARR-01: the stats table is hoisted into its own local purely so the wording audit can review it
  // as one unit of copy (art-review/narration-audit.html, `// @copy` below). Pure string hoist — the
  // rendered HTML is byte-identical to the inline version it replaced.
  // @copy misc.board.statsheadings
  const statsTable=`<table>
    <tr><td>Rounds</td><td>${appState.game.round}</td></tr>
    <tr><td>Battles</td><td>${appState.game.battles} (attacker won ${appState.game.battles?Math.round(100*appState.game.attWins/appState.game.battles):0}%)</td></tr>
    <tr><td>Trades</td><td>${appState.game.trades}</td></tr>
    <tr><td>Bakeoff</td><td>${appState.game.finishOrder.length>1?"yes — "+appState.game.finishOrder.length+" finishers":"no"}</td></tr>
    ${appState.game.players.map((p,i)=>`<tr><td style="color:${HEXCOL[i]}">${pname(i)} heads-luck</td><td>${p.flips?Math.round(100*luck[i]):0}% of ${p.flips} flips</td></tr>`).join("")}
    </table>`;
  $("statsPanel").innerHTML=`<div class="winner-banner">${banner}${victoryPic}${victoryLine}</div>
    <div class="awardsRow">${awards}</div>
    ${statsTable}`;
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
    // D-24: seed the demo log third-person like syncLogLines() does. Behaviourally identical here
    // (mySeat is null above, so describe() already resolves neutral) — made explicit so the two
    // log-building paths cannot drift if this preview ever runs with a seat assigned.
    appState.evIdx=0;appState.logLines=[describeFor(appState.game.events[0],NEUTRAL_VIEWER)];
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
