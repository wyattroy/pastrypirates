// src/ui/flow.js
//
// Phase 11 (SPLIT-03/06), wave 11-05. The deepest layer of src/ui/ — the turn-flow, interaction,
// battle-UI, side-bet, intro, game-start, and recovery/replay clusters — the functions that
// actually drive a live turn and call the panel/board/util modules already moved (11-01..11-04).
// Extends the proven "move verbatim + rewire bare reads into imports + bridge grows + gates
// green" pattern one more time.
//
// This file also carries the deterministic battle/coin-flip machinery (asyncBakeoff, the
// battle-UI render helpers, collectSideBets/settleSideBets) — moved BYTE-IDENTICAL to the classic
// source. Do not alter ordering, object-literal key order, or RNG-adjacent call sequencing; a
// structural change here is exactly the RNG-desync risk this milestone's threat register (T-11-07)
// flags.
//
// Purity bar for src/ui/: reads DOM and game state, NEVER imports src/net/ (D-07).
// scripts/module_graph_check.js and scripts/ui_contract_check.js both gate this mechanically.
//
// Task 3 (this same file, added after tasks 1-2 land) resolves the remaining 3 of the milestone's
// 6 UI->orchestration edges through src/ui/handlers.js's injected-handler seam (11-04 resolved the
// first 2 — flash->onBroadcast, liveRender->onEvents): remotePickHighlights->onRespond,
// endReplay->onRecovery, wireRestoreFail->onRecovery+onLeave. See that section's own header note
// for the mechanism.
//
// Deliberately NOT moved here (11-analysis.json's "orchestration (calls net directly)" tier,
// same reasoning 11-04 applied to the room-lifecycle functions): battleAsk, renderBattle,
// watchBattle, asyncBattle — each calls a net-adjacent function (netBroadcast/netSetBattle/
// netWatchBattle/netRemoveBattle) or is itself classified as orchestration by 11-analysis.json.
// These stay classic and are homed in 11-06 alongside the rest of the orchestration layer. This
// file's functions call them as bare identifiers (asyncBattle from humanAct/botTurn, battleAsk
// from asyncBakeoff) — they resolve fine via the still-present PP bridge, same as every other
// still-classic cross-reference in this codebase this phase.
//
// A handful of calls inside these functions reach still-classic orchestration/net-adjacent
// globals that are NOT part of the milestone's 6-edge seam table (broadcastFlip, netNarrate,
// netBroadcast, remotePrompt, logDecision) — those are left as bare identifiers exactly like every
// other still-classic cross-reference elsewhere in src/ui/ this phase; only the 6 specifically
// identified edges (RESEARCH.md Q1b) get the handler-injection treatment.
//
// Deviation ($/sleep duplicates, mirrors 11-01/11-03/11-04's precedent): `$` (index.html:863) and
// `sleep` (index.html:947) are classic-script-local consts used far beyond this cluster's own
// consumers (dozens of still-classic call sites for `$`; humanFlip/fishCast/asyncBattle etc. for
// `sleep`, some of which are NOT moving this wave) — reproduced verbatim as private module-local
// duplicates instead of "moved", exactly like panel.js/board.js/lobby.js/recipe.js already do.

import { appState } from "../state/index.js";
import { roundCfg } from "../engine/index.js";
import {
  DIRS, DIRNAME, windStepCost, man, HEXCOL, iname, ilabelImg, iconImg, NAMES, dockPlace, dockFlavor, ING_IMG,
  CUPCAKE_IMG, CHECKMARK_IMG, CANCEL_X_IMG, DICE_IMG, FLIP_HEADS_IMG, FLIP_TAILS_IMG,
} from "../shared/index.js";
import { el, boardCell, setFlipActive, renderLiveShips } from "./board.js";
import {
  liveRender, panel, setNeedsAction, narrateLastEvent, flash, showNarration,
} from "./panel.js";
import {
  pn, poss, apBtnStyle, ask, armClock, stepDelay, botBeat, setActor, seatLocal,
  decisionIsLocal, stopShotClock, withShotClock, waitWhilePaused, seatStrat, saveSoloState,
  replayShortfall, STORM_STEP_MS, describeFor, narrationVariants, isLocalTo, NEUTRAL_VIEWER,
  msgHoldMs, BOT_STORM_STEP_MS,
} from "./util.js";
import { passGate, requireName, showStep } from "./lobby.js";
import { netHandlers } from "./handlers.js";

const $=id=>document.getElementById(id);
const sleep=ms=>appState.replaying?Promise.resolve():waitWhilePaused().then(()=>new Promise(r=>setTimeout(r,ms)));

/* ================= turn-flow + interaction ================= */

export function localAsk(msg,opts,colors,sub){
  return new Promise(res=>{
    if(opts.length===1&&opts[0].flip){
      setNeedsAction(true);
      setFlipActive(()=>{setFlipActive(null);setNeedsAction(false);res(0);});
      return;
    }
    // an option flagged `back` renders as a small circular "‹" button of its own, above the
    // message — a consistent, low-emphasis escape hatch instead of competing with the real
    // choices in the main button row (see notes/edits — every back-able decision gets this).
    // Can coexist with a `flip` option (arms the flippenator coin as usual) and/or ordinary
    // choices, which still render as the normal button row.
    const backIdx=opts.findIndex(o=>o.back);
    const flipIdx=opts.findIndex(o=>o.flip);
    const done=v=>{setFlipActive(null);setNeedsAction(false);panel("");res(v);};
    if(flipIdx!==-1){setNeedsAction(true);setFlipActive(()=>done(flipIdx));}
    else setFlipActive(null);
    const rest=opts.map((o,i)=>({o,i})).filter(x=>x.i!==flipIdx&&x.i!==backIdx);
    const grid=rest.some(x=>x.o.cls)?" recipes":"";
    const backHtml=backIdx!==-1?`<button class="apBack" data-i="${backIdx}" aria-label="Back">‹</button>`:"";
    const subHtml=sub?`<div class="apSub">${sub}</div>`:"";
    // @copy prompt.plumbing.localask
    panel(`${backHtml}<div class="apMsg">${msg}</div><div class="apBtns${grid}">`+
      rest.map(x=>`<button class="apBtn ${x.o.cls||""}${x.o.disabled?" apDisabled":""}" data-i="${x.i}"${x.o.disabled?" disabled":""}${apBtnStyle(colors&&colors[x.i])}>${x.o.label}</button>`).join("")+`</div>${subHtml}`,
      true);
    $("actionPanel").querySelectorAll(".apBtn,.apBack").forEach(b=>{
      if(b.disabled)return; // disabled options are display-only (notes/edits #5d)
      b.onclick=()=>done(+b.dataset.i);
    });
  });
}
export async function humanFlip(p,label,allowBack){
  setActor(p.idx);
  const opts=[{label:"🌕 FLIP!",value:1,flip:true}];
  if(allowBack)opts.push({label:"← Back",back:true,value:"back"});
  // @copy prompt.flip.fallback
  const v=await ask(label||"Flip the dubloon!",opts);
  if(v==="back")return "back";
  netHandlers().onBroadcastFlip("spin");
  await sleep(340);
  const h=appState.game.flip(p);
  netHandlers().onBroadcastFlip(h?"H":"T");
  // same fixed-3000ms leftover as narrateLastEvent() had — flash() scales the hold to this
  // (short) message's own length instead of a flat timer unrelated to how long it takes to read
  // @copy adhoc.flip.announce
  await flash(`${pn(p.idx)} flips ${h?"⚪ HEADS!":"⚫ TAILS"}`,undefined,undefined,[{seat:p.idx,html:`${pn(p.idx)} — ye flip ${h?"⚪ HEADS!":"⚫ TAILS"}`}]);
  netHandlers().onBroadcastFlip("wait");
  return h;
}
// A fishing cast, flipped on the flippenator like every other coin in the game.
// Humans tap CAST; bots auto-cast. Awards the catch and logs the event.
export async function fishCast(p,label,allowBack){
  const bd=(typeof stepDelay==="function")?stepDelay():500;
  const spin=Math.max(260,Math.min(650,bd*0.7));
  const hold=Math.max(500,Math.min(1200,bd*1.0));
  if(p.strategy==="human"){
    setActor(p.idx);
    const opts=[{label:"🎣 CAST!",value:1,flip:true}];
    if(allowBack)opts.push({label:"← Back",back:true,value:"back"});
    // D-29 RESOLVED (Wyatt-approved 2026-07-29): every player-facing string in this file speaks the
    // pirate register — the 2nd-person pronouns become ye/yer/yers/yerself. Applied as a one-time source
    // transformation using art-review/narration-audit.html's own PIRATE_RE/PIRATE_MAP as the spec (the
    // page ran it LIVE at render, so a card tagged `keep` displayed the converted text — under D-25 that
    // converted text is what he approved). No runtime helper is shipped for it: a pirateVoice() nothing
    // calls would be dead code, which D-33/D-34/D-40 exist to prevent. Comments and identifiers are out
    // of scope. scripts/ui_contract_check.js now gates this permanently.
    // @copy prompt.fish.fallback
    const v=await ask(label||`${pn(p.idx)}: cast yer line — flip!`,opts);
    if(v==="back")return "back";
  }
  netHandlers().onBroadcastFlip("spin");
  await sleep(spin);
  const h=appState.game.flip(p);
  netHandlers().onBroadcastFlip(h?"H":"T");
  await sleep(Math.max(hold,3000));
  netHandlers().onBroadcastFlip("wait");
  if(h)p.coins+=2;else if(appState.game.cfg.sardine)p.coins+=1;
  appState.game.ev({t:"fish",p:p.idx,heads:h?1:0});
  liveRender();
  return h;
}
// Dijkstra over the wind-weighted grid: with-the-wind steps cost 2, across cost 3, against
// cost 4 (see windStepCost/#7) — returns every cell reachable within this turn's sail budget.
export function reachable(p){
  const budget=appState.game.sailBudget(p);
  const best={[p.pos[0]+","+p.pos[1]]:0},frontier=[[p.pos,0]],out=[];
  while(frontier.length){
    let mi=0;
    for(let i=1;i<frontier.length;i++)if(frontier[i][1]<frontier[mi][1])mi=i;
    const [c,cost]=frontier.splice(mi,1)[0],k=c[0]+","+c[1];
    if(cost>best[k])continue; // stale entry, already beaten by a cheaper path
    const isStart=c[0]===p.pos[0]&&c[1]===p.pos[1];
    if(!isStart){
      // you may sail PAST other ships, but not end your move on one
      const occupied=appState.game.players.some(q=>q!==p&&!q.done&&q.pos[0]===c[0]&&q.pos[1]===c[1]);
      if(!occupied)out.push(c);
    }
    if(appState.game.onRim(c)&&!isStart)continue; // entering the trade winds ends your move
    for(const dk of Object.keys(DIRS)){
      const dd=DIRS[dk];
      const o=[c[0]+dd[0],c[1]+dd[1]],ok=o[0]+","+o[1];
      if(appState.game.blocked(o))continue;
      if(appState.game.islands[o]!==undefined||appState.game.isHome(o))continue;
      const nc=cost+windStepCost(appState.game.windNow,dk);
      if(nc>budget)continue;
      if(best[ok]!==undefined&&best[ok]<=nc)continue;
      best[ok]=nc;
      frontier.push([o,nc]);
    }
  }
  return out;
}
// D-25/D-35 (Wyatt-approved 2026-07-29): the one sail-prompt message, shared by BOTH transports —
// the host's own localPickCell() and a guest's remotePickHighlights(). Previously the guest path
// hardcoded its own separate sentence instead of rendering what the host composed, so the same
// player read two different prompts depending on whether they happened to be the host or a guest
// (D-35's sweep finding: guest-side code must render text, never author it).
export function sailPickMsg(seat){
  return `${pn(seat)}: click any yellow square to sail there (−1🌕)`;
}
export function pickCell(p,cells){
  if(appState.replaying){
    if(appState.dlogIdx<appState.dlog.length){appState.dlogN++;return Promise.resolve(appState.dlog[appState.dlogIdx++]);}
    endReplay();
  }
  setActor(p.idx);
  // @copy misc.draftwait.sailchoosing
  netHandlers().onBroadcast(p.idx===appState.mySeat?"":`${pn(p.idx)} is choosing where to sail…`);
  armClock(p.idx);
  const base=decisionIsLocal(p.idx)?localPickCell(p,cells)
    :netHandlers().onRemotePrompt(p.idx,{kind:"pick",cells,msg:sailPickMsg(p.idx)});
  const cellP=withShotClock(p.idx,base,null);
  return cellP.then(c=>{netHandlers().onLogDecision(c);return c;});
}
export function localPickCell(p,cells){
  return new Promise(res=>{
    const svg=$("board"),hs=[];
    const done=v=>{hs.forEach(h=>h.remove());panel("");appState.activePickCleanup=null;res(v);};
    appState.activePickCleanup=()=>{hs.forEach(h=>h.remove());panel("");};
    // notes/edits UI-06: the sail squares now read as obviously tappable — brighter fill, a soft
    // bounce so they draw the eye, and a hover state that pops the square and deepens the colour.
    // Each square's bounce is phase-offset a touch by its board position so they shimmer rather
    // than pulse in dead unison. transform-box:fill-box + centered origin keeps the scale centered.
    // notes/edits 11-03: cellPx now read via boardCell() — cell itself lives in src/ui/board.js.
    const cellPx=boardCell();
    cells.forEach((c,ci)=>{
      const r=el("rect",{x:c[0]*cellPx+2,y:c[1]*cellPx+2,width:cellPx-4,height:cellPx-4,rx:6,
        fill:"#ffc23a",class:"sailCell",style:`cursor:pointer;animation-delay:${((c[0]+c[1])%4)*0.12}s`},svg);
      r.addEventListener("click",()=>done(c));
      hs.push(r);
    });
    // @copy prompt.sail.pickpanel
    panel(`<div class="apMsg">${sailPickMsg(p.idx)}</div>
      <div class="apBtns"><button class="apBtn" id="apStay">Stay put</button></div>`,true);
    $("apStay").onclick=()=>done(null);
  });
}
// D-11/D-25 (Wyatt-approved 2026-07-29): can't-afford-to-sail, for a human (humanTurn's own sail
// gate, below) AND a bot (botTurn's sail gate, merged in per D-18/D-25 — both call this same
// function, so the wording can never fork by actor type) — so a broke bot states why it isn't
// moving instead of appearing to forget its turn.
export function brokeSailLine(seat,viewerSeat){
  return isLocalTo(seat,viewerSeat)
    ?`${pn(seat)} — yer too broke to pay the crew. No sailing this turn.`
    :`${pn(seat)} is too broke to pay the crew — no sailing this turn.`;
}
// D-11 case 2/D-25: can't-afford-to-anchor — told plainly the anchor is out of reach, rather than
// the Pay-to-anchor option silently vanishing from the list below (windLeg's storm-anchor block).
export function brokeAnchorLine(seat,viewerSeat){
  return isLocalTo(seat,viewerSeat)
    ?`${pn(seat)} — ye can't afford to anchor. Flip and take yer chances.`
    :`${pn(seat)} can't afford to anchor — flips and takes their chances.`;
}
// one 1- or 2-square push in a single direction, with the human island-dodge prompt inline.
// storms chain two of these (see humanWind) — each leg resolves fully before the next begins.
export async function windLeg(p,dirKey,dist,dodgedOnce,wasDocked){
  dodgedOnce=dodgedOnce||{v:false};
  const d=DIRS[dirKey];
  for(let s=0;s<dist;s++){
    const nx=[p.pos[0]+d[0],p.pos[1]+d[1]];
    if(appState.game.blocked(nx))return;
    const blocker=appState.game.players.find(q=>q!==p&&!q.done&&q.pos[0]===nx[0]&&q.pos[1]===nx[1]);
    if(blocker){appState.game.ev({t:"blocked",p:p.idx,other:blocker.idx});await narrateLastEvent();liveRender();return;} // another ship holds that square — wind stops short (see #20: surface the "strikes sail" narration)
    if(appState.game.islands[nx]!==undefined||appState.game.isHome(nx)){
      // D-19/D-21/D-22: mooredReason() is the single source of truth for which of the three
      // safe-harbor causes fired — call the engine's own accessor rather than re-deriving the
      // cause here. Folds the old standalone isHome(nx) early return into ordinary land
      // handling, mirroring windPush's own isIsland(nx)||isHome(nx) branch
      // (src/engine/index.js:280) — same order this file already keeps (blocker before land).
      const reason=appState.game.mooredReason(p);
      if(reason){appState.game.ev({t:"moored",p:p.idx,reason});await narrateLastEvent();liveRender();return;}
      // a storm only ever charges (coins or a coin flip) once per turn — a second leg that
      // also hits an island is a free pass, already-paid anchor holding fast
      if(dodgedOnce.v){appState.game.ev({t:"anchorHold",p:p.idx});await narrateLastEvent();liveRender();return;}
      const opts=[];
      // D-38 (Wyatt-approved 2026-07-29): signed parenthesised cost, U+2212 minus.
      if(p.coins>=1)opts.push({label:"Anchor safely (−1🌕)",value:"pay"});
      // notes/edits #10b: the real tails consequence depends on what this player actually has to
      // lose (mirrors the branches below) — a broke player with crates loses one of those, not
      // "half their coins" (they have none), and only a truly broke, empty-holds player risks
      // losing the whole turn to repairs.
      const broke=p.coins===0,trueShipwreck=broke&&!p.ing.length;
      // D-59 (Wyatt-approved 2026-07-29): the ordinary branch shows the REAL coin loss — the same
      // Math.max(1,Math.floor(p.coins/2)) expression the engine uses below, so the button can never
      // disagree with the outcome, and the rounding-down is visible before the decision is made.
      const flipLabel=trueShipwreck?"Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose turn)"
        :broke?"Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose a crate)"
        :`Flip (⚪ HEADS: dodge safely. ⚫ TAILS: lose half yer 🌕 (−${Math.max(1,Math.floor(p.coins/2))}🌕))`;
      opts.push({label:flipLabel,value:"flip"});
      const promptMsg=trueShipwreck
        ?`${pn(p.idx)}: the storm blows ye toward an island! Yer broke — if ye run aground, ye'll lose yer turn!`
        :`${pn(p.idx)}: the storm's blowin' ye into land! Anchor safely, or take yer chances dodging the rocks.`;
      // D-11 case 2: the Pay-to-anchor option is already silently absent above when broke — say so
      // plainly instead of leaving the missing option unexplained.
      // @copy adhoc.storm.brokeanchor
      if(broke)await flash(brokeAnchorLine(p.idx,NEUTRAL_VIEWER),900,undefined,[{seat:p.idx,html:brokeAnchorLine(p.idx,p.idx)}]);
      // @copy prompt.storm.anchororflip
      const v=await ask(promptMsg,opts);
      if(appState.turnExpired)return;
      if(v==="pay"){p.coins--;appState.game.ev({t:"dodge",p:p.idx});await narrateLastEvent();}
      else{
        // @copy misc.paramprompt.stormdodge
        const h=await humanFlip(p,"Flip to dodge!");
        if(appState.turnExpired)return;
        if(h)appState.game.ev({t:"anchor",p:p.idx});
        // tails with no coins can't "lose half" of nothing — take a crate instead, or if the
        // hold is empty too, the ship is stuck and repairs eat the rest of this turn
        else if(p.coins>0){p.coins-=Math.max(1,Math.floor(p.coins/2));appState.game.ev({t:"aground",p:p.idx});}
        else if(p.ing.length){
          const idx=Math.floor(appState.game.r()*p.ing.length);
          const lost=p.ing.splice(idx,1)[0];
          appState.game.tokens[lost]++;
          appState.game.ev({t:"aground",p:p.idx,ing:lost});
        }else{p.shipwrecked=true;appState.game.ev({t:"shipwrecked",p:p.idx});}
        await narrateLastEvent();
      }
      dodgedOnce.v=true;
      liveRender();return;
    }
    // D-22: render THIS square before the next one's outcome can narrate — the reported "false
    // dock held fast" symptom was the board being a square behind when the message played, not a
    // wrong message. sleep() is a no-op during replay (:64), so this adds no replay-timing risk.
    //
    // renderLiveShips(), NOT liveRender(): an ordinary storm square emits no event, and liveRender()
    // -> render() draws every ship from events[evIdx].state — the snapshot on the LAST EMITTED
    // event — so it repainted the square the ship had already left and the push was invisible.
    // Nothing else changed on this square either (no event to log, broadcast or pop), so painting
    // the ships from their live positions is both the fix and the whole of the work owed here.
    p.pos=nx;
    renderLiveShips();
    await sleep(STORM_STEP_MS);
    if(appState.game.onRim(nx)){ // swept into the trade winds
      appState.game.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){liveRender();await narrateLastEvent();}
      return;
    }
  }
  appState.game.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});liveRender();
}
// bot's own storm push (D-09/D-10/D-11) — mirrors windLeg's per-square shape, but delegates each
// square's outcome to the engine's own windPush(p,d,1,dodgedOnce) rather than re-deriving the
// island-outcome ladder: the engine already makes bots' storm decisions today, so reimplementing
// the ladder here would let bots and humans silently drift apart on the rule itself (the same
// "keep the two in step" convention this file already follows for humanDock/Game.doDock). Narrates
// EVERY event the square records, not just the last — the fix for D-11: botBeat()'s own
// narrateCurrent() only ever narrates the single appState.evIdx pointer, which is exactly why bot
// storm outcomes have been vanishing. No flip animation for a bot: windPush already calls
// g.flip(p) directly and records the resulting anchor/aground/shipwrecked event; narrating that
// event states the result, which is all D-11 asks for. The interactive human flip helper
// (humanFlip) is never reached from this function.
export async function botWindLeg(p,dirKey,dist,dodgedOnce,wasDocked){
  dodgedOnce=dodgedOnce||{v:false};
  const g=appState.game;
  for(let s=0;s<dist;s++){
    const before=[...p.pos];
    const evBefore=g.events.length;
    g.windPush(p,DIRS[dirKey],1,dodgedOnce);
    if(g.events.length>evBefore){
      // paint BEFORE narrating, same order the human path already uses for its own rim sweep
      // (windLeg :274 renders, then flashes). windPush can move the ship AND record an event in
      // one call — a square onto the rim is followed by tradewind() flinging it to the quadrant
      // head — and the board must already show where the ship ended up when the line describing
      // it plays, which is the whole of D-22. Without this the boat sat on its old square through
      // the entire message and only jumped at the liveRender() below.
      renderLiveShips();
      for(let k=evBefore;k<g.events.length;k++){
        const ev=g.events[k];
        // D-10: render the viewer-NEUTRAL text (never the ambient appState.mySeat-flavored one)
        // plus per-seat variants — the same broadcast-safe split narrateLastEvent() uses.
        const L=describeFor(ev,NEUTRAL_VIEWER);
        // @copy adhoc.storm.botsquare
        if(L)await flash(L.txt,null,msgHoldMs(L.txt),narrationVariants(ev));
      }
      liveRender();
      return; // the engine returned early — this square's own outcome ends the leg
    }
    if(p.pos[0]!==before[0]||p.pos[1]!==before[1]){
      // same reason windLeg uses it (:263) — the engine moved the ship without emitting an event,
      // and render() only ever draws ships from the last event's position snapshot, so liveRender()
      // here repainted the square the ship had just left. This is the square that was invisible.
      renderLiveShips();
      await sleep(BOT_STORM_STEP_MS);
      if(g.onRim(p.pos))return; // the engine already resolved the rim; no further square to push
      continue;
    }
    return; // neither moved nor recorded anything — a blocked square, stop silently like windLeg
  }
  g.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});
  const lastEv=g.events[g.events.length-1];
  const L=describeFor(lastEv,NEUTRAL_VIEWER);
  // @copy adhoc.storm.botlegsummary
  if(L)await flash(L.txt,null,msgHoldMs(L.txt),narrationVariants(lastEv));
  liveRender();
}
// NARR-03: the per-turn storm intro clause — sits inside the addressed turn banner ("Ahoy, {name}
// — yer turn!", humanTurn below) and previously pre-announced BOTH storm legs before either
// happened. humanWind (below) and botTurn already announce the second leg's own direction at the
// moment it actually happens, so pre-announcing it here was exactly that redundancy — this clause
// now names only the leg happening now. Second person because this clause only ever renders inside
// the addressed (one-captain) form of the turn banner; the round header (EVENT_NARRATION.newround)
// stays third person and untouched (D-09).
// NARR-01/D-25/D-37 (Wyatt-approved 2026-07-29): the turn banner's storm clause. "Blows", per D-37
// — wind never "pushes" or "moves" a player, it blows them.
export function stormIntroClause(dir1){
  return ` First the ⛈️ storm blows ye 2 squares <b>${DIRNAME[dir1]}</b>.`;
}
// D-18/D-23/D-37/D-25 (Wyatt-approved 2026-07-29): the second-storm-leg announcement, shared by the
// human path (humanWind, below) AND the bot path (botTurn) — one narration path per event, viewer
// perspective is the only axis that varies (D-18). Previously humanWind hardcoded a "you" line with
// no viewer branch (so a spectator of a human's turn also read "you" — the exact fork D-18 flags),
// and botTurn's own copy of the same line ran on the separate, shorter bot hold curve (D-23 removes
// that gap: both now go through msgHoldMs). "Blows", never "moves" (D-37).
export function secondLegLine(seat,dir,viewerSeat){
  return isLocalTo(seat,viewerSeat)
    ?`⛈️ Now the storm blows ye <b>${DIRNAME[dir]}</b>!`
    :`⛈️ Now the storm blows ${pn(seat)} <b>${DIRNAME[dir]}</b>!`;
}
// only ever called during a storm now (see humanTurn) — normal turns don't force-move anyone
export async function humanWind(p){
  setActor(p.idx);
  const wasDocked=appState.game.adjPort(p)!==null;
  const dodgedOnce={v:false};
  await windLeg(p,appState.game.windNow,2,dodgedOnce,wasDocked);
  if(appState.turnExpired)return;
  // @copy adhoc.storm.secondleg
  await flash(secondLegLine(p.idx,appState.game.windNow2,NEUTRAL_VIEWER),900,undefined,[{seat:p.idx,html:secondLegLine(p.idx,appState.game.windNow2,p.idx)}]);
  if(appState.turnExpired)return;
  await windLeg(p,appState.game.windNow2,2,dodgedOnce,wasDocked);
}
export async function humanDock(p,port){
  setActor(p.idx);
  const ing=port;
  // notes/edits NARR-07: empty island — nothing to flip for, so don't make the player flip. Mirrors
  // the same early-out in Game.doDock; keep the two in step or bots and humans diverge.
  if(appState.game.tokens[ing]<=0){
    p.coins+=3;appState.game.ev({t:"dock",p:p.idx,ing,got:"empty"});
    await narrateLastEvent();
    p.firstFlip.add(ing);p.dockedNow.add(ing);
    liveRender();
    return;
  }
  // D-46 (Wyatt-approved 2026-07-29): the flip prompt names the PLACE, not the ingredient — the
  // ingredient icon is kept (D-16), the ingredient is the payoff named once the flip resolves.
  // @copy misc.paramprompt.dockflip
  const h=await humanFlip(p,`Docking at ${iconImg(ING_IMG[ing])} ${dockPlace(ing)} — flip!`,true);
  if(h==="back")return "back";
  if(h){
    appState.game.tokens[ing]--;p.ing.push(ing);appState.game.ev({t:"dock",p:p.idx,ing,heads:1,got:"ing"});
  }else{
    let got="coins";
    if(appState.game.cfg.dockBuy&&p.coins>=3&&appState.game.tokens[ing]>0){
      // @copy prompt.dock.tailschoice
      const buy=await ask(`Tails! Take 3🌕 — or buy ${iconImg(ING_IMG[ing])} ${dockFlavor(ing)} for 3🌕?`,[
        {label:`Buy ${ilabelImg(ing)} (−3🌕)`,value:true},{label:"Take 3🌕",value:false}]);
      if(buy){p.coins-=3;appState.game.tokens[ing]--;p.ing.push(ing);got="bought";}
      else p.coins+=3;
    }else p.coins+=3;
    appState.game.ev({t:"dock",p:p.idx,ing,heads:0,got});
  }
  await narrateLastEvent();
  p.firstFlip.add(ing);p.dockedNow.add(ing);
  liveRender();
}
export async function humanTrade(p){
  setActor(p.idx);
  const opps=appState.game.tradeOpp(p).filter(q=>q.ing.length>0);
  // @copy adhoc.trade.nocargo
  if(!opps.length){await flash("No one has cargo to trade for.");return false;}
  // notes/edits UI-08: the parley used to be a straight chain of prompts where hitting Back at ANY
  // step returned false all the way out to the action menu — so Back felt like it jumped two (or
  // more) steps. It's now a little step machine: Back moves to the PREVIOUS prompt, and only Back
  // out of the first shown prompt returns to the action menu (which is itself exactly one step
  // back). Inputs accumulate in `st` so revisiting a step keeps what you already picked.
  const st={q:null,want:null,baseIng:undefined,extraCoins:undefined};
  const single=opps.length===1;
  if(single)st.q=opps[0];
  const firstStep=single?1:0; // step 0 partner · 1 want · 2 offer-ing · 3 sweeten-coins
  let step=firstStep;
  while(step<4){
    if(step===0){
      // D-19 (Wyatt-approved 2026-07-29): "Trade", never "Parley" — the only two places the word
      // reached a player.
      // @copy prompt.trade.partner
      const q=await ask("Trade with whom?",opps.map(o=>({label:pn(o.idx),value:o})).concat([{label:"← Back",back:true,value:"__back__"}]),
        opps.map(o=>HEXCOL[o.idx]).concat([null]));
      if(q==="__back__"||q==null)return false; // Back from the first step → action menu (one step)
      st.q=q;step=1;
    }else if(step===1){
      // @copy prompt.trade.want
      const want=await ask(`What do ye WANT from ${pn(st.q.idx)}?`,
        [...new Set(st.q.ing)].map(i=>({label:ilabelImg(i),value:i})).concat([{label:"← Back",back:true,value:"__back__"}]));
      if(want==="__back__"||want==null){if(step===firstStep)return false;step--;continue;}
      st.want=want;step=2;
    }else if(step===2){
      // An offer is an ingredient, coins, or both together — sweeten a crate with a few coins on top.
      // D-41 EXTENDED (Wyatt-approved 2026-07-29): "coins only" dead-ends when the purse is empty —
      // grey it out and say why, same pattern as Attack/Trade's own availability gating.
      const canOfferCoins=p.coins>0;
      const ingOpts=[...new Set(p.ing)].map(i=>({label:ilabelImg(i),value:i}));
      ingOpts.push({label:"— coins only —",value:"__coinsonly__",disabled:!canOfferCoins});
      ingOpts.push({label:"← Back",back:true,value:"__back__"});
      const offerSub=canOfferCoins?null:`Ye don't have any coin to offer — pick a crate instead.`;
      // @copy prompt.trade.give
      const baseIng=await ask(`What will ye GIVE ${pn(st.q.idx)} in exchange?`,ingOpts,null,offerSub);
      if(baseIng==="__back__"){if(step===firstStep)return false;step--;continue;}
      st.baseIng=(baseIng==="__coinsonly__")?null:baseIng;step=3;
    }else{ // step 3
      const coinChoices=[0,1,2,3,4,5,6].filter(n=>n===0||p.coins>=n);
      if(!st.baseIng)coinChoices.shift(); // a coins-only offer needs at least 1 coin
      if(!coinChoices.length){
        // D-40: guarded safety net — the "coins only" option is now greyed out whenever the purse
        // is empty (above), so this is unreachable through the normal UI; kept for a forced/edge
        // selection, same convention as Attack's own guard.
        // @copy prompt.trade.nothingtooffer
        await ask("Ye don't have any to offer!",[{label:"← Back",back:true,value:-1}]);
        step=2;continue;
      }
      const coinOpts=coinChoices.map(n=>({label:n===0?"No extra coins":`+${n}🌕`,value:n}));
      coinOpts.push({label:"← Back",back:true,value:-1});
      const offerSoFar=st.baseIng?ilabelImg(st.baseIng):"nothing yet";
      // @copy prompt.trade.addcoins
      const extraCoins=await ask(`Add any 🌕 to yer offer of ${offerSoFar}?`,coinOpts);
      if(extraCoins===-1){step=2;continue;}
      st.extraCoins=extraCoins;step=4;
    }
  }
  const q=st.q,want=st.want;
  const give={ing:st.baseIng,coins:st.extraCoins};
  // plain-text form (stored on events, later run through fmtItem for the log); emoji form for
  // direct UI prompts below
  const offerLabel=(give.ing?iname(give.ing):"")+(give.ing&&give.coins?" + ":"")+(give.coins?`${give.coins} coins`:"");
  const offerDisplay=(give.ing?ilabelImg(give.ing):"")+(give.ing&&give.coins?" + ":"")+(give.coins?`${give.coins}🌕`:"");
  let accept;
  if(q.strategy==="human"){
    setActor(q.idx);
    // @copy prompt.trade.accept
    accept=await ask(`${pn(q.idx)}: accept ${offerDisplay} for yer ${ilabelImg(want)}?`,
      [{label:`${iconImg(CHECKMARK_IMG)} Accept`,value:true},{label:`${iconImg(CANCEL_X_IMG)} Decline`,value:false}]);
  }else{
    // bot valuation: a crate is ESSENTIAL if it's on their recipe and they hold no spare — unless
    // they're within one turn's sail of that crate's own dock and could just go re-flip for
    // another, in which case trading it away is the efficient path (players trading with each
    // other instead of everyone physically re-visiting every island).
    const essential=q.recipe.includes(want)&&appState.game.cnt(q.ing,want)<=1;
    const nearResupply=essential&&appState.game.tokens[want]>0&&man(q.pos,appState.game.islandOf[want])<=3;
    const trulyEssential=essential&&!nearResupply;
    // bots never hand a human their final needed ingredient — no price buys it, they have to
    // fight for it instead
    const humanNeeds=appState.game.needs(p);
    const humanFinishes=humanNeeds.length===1&&humanNeeds[0]===want;
    // an ordinary crate is still worth more than the 1🌕 a bad fishing flip guarantees, and gets
    // pricier as its home island's remaining supply runs low (notes/edits #6)
    const scarcityBonus=appState.game.tokens[want]<=1?2:(appState.game.tokens[want]<=2?1:0);
    let cost=trulyEssential?7:(3+scarcityBonus);
    const ingVal=give.ing?(appState.game.needs(q).includes(give.ing)?7:2):0;
    const val=ingVal+give.coins;
    const bonus=appState.game.cfg.tradeBonus?1:0;
    // if what's on offer is something the bot needs and every island's stock of it is gone,
    // this trade is the bot's only remaining way to ever get it — take the deal outright
    const mustAcquire=give.ing&&appState.game.needs(q).includes(give.ing)&&appState.game.tokens[give.ing]===0;
    accept=!humanFinishes&&(mustAcquire||val+bonus>=cost);
    if(!accept){
      const shortfall=Math.max(0,cost-bonus-ingVal-give.coins);
      // bots always counter a lowball rather than flatly refuse — if the human can't cover the
      // full shortfall, name the smaller amount they *can* afford instead of walking away outright
      const askFor=Math.min(shortfall,p.coins);
      if(!humanFinishes&&askFor>0){
        setActor(p.idx);
        // @copy prompt.trade.counter
        const deal=await ask(`${pn(q.idx)} scoffs — but counters: "${askFor}🌕 more for my ${ilabelImg(want)}, take it or leave it."`,
          [{label:`Pay ${askFor}🌕 more`,value:true},{label:"Walk away",value:false}]);
        if(deal){
          q.ing.splice(q.ing.indexOf(want),1);p.ing.push(want);
          if(give.ing){p.ing.splice(p.ing.indexOf(give.ing),1);q.ing.push(give.ing);}
          const totalCoins=give.coins+askFor;
          p.coins-=totalCoins;q.coins+=totalCoins;
          appState.game.trades++;
          if(appState.game.cfg.tradeBonus){p.coins++;q.coins++;}
          appState.game.ev({t:"trade",a:p.idx,b:q.idx,gave:offerLabel+(askFor?` + ${askFor} coins`:""),got:want,kind:"counter"});
          await narrateLastEvent();
          liveRender();
          return true;
        }
      }
      // D-19 SIMPLIFIED (Wyatt-approved 2026-07-29): `ok` is dropped — a refusal is now the only
      // thing this event ever records, so the field was an invariant, i.e. no field.
      appState.game.ev({t:"parley",a:p.idx,b:q.idx,offer:offerLabel||"nothing",want});
      liveRender();
      // D-08/D-25: this refusal names two seats (q the decliner, p the offerer) — p reads the taunt
      // addressed ("ye"/"yer"); every other viewer sees p named.
      // @copy adhoc.trade.refusalbot
      await flash(humanFinishes?`${pn(q.idx)} refuses — "Not lettin' ${pn(p.idx)} finish their recipe that easy!"`:`${pn(q.idx)} declines ${pn(p.idx)}'s offer!`,undefined,undefined,[{seat:p.idx,html:humanFinishes?`${pn(q.idx)} refuses — "Not lettin' ye finish yer recipe that easy!"`:`${pn(q.idx)} declines yer offer!`}]);
      return true;
    }
  }
  if(!accept){
    appState.game.ev({t:"parley",a:p.idx,b:q.idx,offer:offerLabel||"nothing",want});
    liveRender();
    // D-18/D-25 (Wyatt-approved 2026-07-29): merged with the bot-decline wording above — a human
    // clicking Decline and a bot computing a decline are the same moment, and the only thing that
    // should ever vary is who's reading, never who (or what) decided (D-18). Previously this branch
    // had its own bare "declines!" wording, addressed to the decliner rather than the offerer.
    // @copy adhoc.trade.refusalhuman
    await flash(`${pn(q.idx)} declines ${pn(p.idx)}'s offer!`,undefined,undefined,[{seat:p.idx,html:`${pn(q.idx)} declines yer offer!`}]);
    return true;
  }
  q.ing.splice(q.ing.indexOf(want),1);p.ing.push(want);
  if(give.ing){p.ing.splice(p.ing.indexOf(give.ing),1);q.ing.push(give.ing);}
  if(give.coins){p.coins-=give.coins;q.coins+=give.coins;}
  appState.game.trades++;
  if(appState.game.cfg.tradeBonus){p.coins++;q.coins++;}
  appState.game.ev({t:"trade",a:p.idx,b:q.idx,gave:offerLabel||"nothing",got:want,kind:"human"});
  await narrateLastEvent();
  liveRender();
  return true;
}
export async function humanAct(p,sailCtx){
  setActor(p.idx);
  const port=appState.game.adjPort(p);
  const canDock=port&&(appState.game.cfg.unlimitedDock||!(p.firstFlip.has(port)&&p.dockedNow.has(port)))
    &&!(appState.game.cfg.singleDock&&appState.game.dockOccupiedBy(port,p));
  const targets=appState.game.adjOpp(p);
  const canAfford=p.coins>=appState.game.cfg.powder;
  // D-41 EXTENDED (Wyatt-approved 2026-07-29): Parley/Trade is offered whenever any opponent is
  // alive, but the action itself only ever works against someone HOLDING cargo — compute real
  // availability once and drive both the button's `disabled` flag and the action guard (:602 below)
  // from it, following the same pattern already used for Attack.
  const tradeTargets=appState.game.tradeOpp(p).filter(q=>q.ing.length>0);
  const canTrade=!!tradeTargets.length;
  const opts=[];
  if(canDock)opts.push({label:`⚓ ${iconImg(ING_IMG[port])} Dock at ${dockPlace(port)}`,value:"dock"});
  // #5b/#5d: shorter label, and the Attack button always shows when there's a target — greyed out
  // (disabled) rather than hidden when you can't afford powder.
  if(targets.length)
    opts.push({label:`⚔️ Attack${appState.game.cfg.powder?` (−${appState.game.cfg.powder}🌕)`:""}`,value:"attack",disabled:!canAfford});
  if(appState.game.tradeOpp(p).length)opts.push({label:"🤝 Trade",value:"trade",disabled:!canTrade});
  if(!appState.game.needs(p).length&&man(p.pos,appState.game.home)<=1)
    opts.unshift({label:`${iconImg(CUPCAKE_IMG)} Start yer bakery!`,value:"bakery"});
  opts.push({label:"🎣 Fish (+1-2🌕)",value:"fish"});
  // offered only if this player's sail step ended in "Stay put" (nothing spent/moved) and they
  // could still afford to sail — covers the reported "hit Stay put by accident" complaint
  const canMoveInstead=sailCtx&&p.coins>0&&p.coins===sailCtx.preSailCoins&&
    p.pos[0]===sailCtx.preSailPos[0]&&p.pos[1]===sailCtx.preSailPos[1];
  if(canMoveInstead)opts.push({label:"← Actually, move instead",back:true,value:"moveInstead"});
  // #5c/D-41: helper text under the buttons explains why a greyed button is greyed — Attack's own
  // powder gate, and now Trade's cargo gate, follow the same pattern.
  let sub=null;
  if(targets.length)sub=canAfford?`Attacking costs ye ${appState.game.cfg.powder}🌕 for powder. Firing downwind wins ties!`:`Yer too poor to afford powder! Go fishin' 🎣`;
  else if(appState.game.tradeOpp(p).length&&!canTrade)sub=`No one's holding cargo to trade for yet.`;
  // #5e: with an empty purse you can't pay the crew to sail — reframe the action prompt.
  const prompt=p.coins<=0?`${pn(p.idx)}, ye got nothin to pay yer crew, so they won't budge. Pick one:`:`${pn(p.idx)}, what'll ye do:`;
  // @copy prompt.act.menu
  const v=await ask(prompt,opts,null,sub);
  if(appState.turnExpired)return;
  // the clock keeps running (and re-arms fresh) through dock/attack/trade/fish now, instead of
  // stopping here — each ask() inside those sub-flows re-arms it for its own decision
  if(v==="moveInstead"){
    const dest=await pickCell(p,reachable(p));
    if(appState.turnExpired)return;
    if(dest){p.coins--;p.pos=dest;appState.game.ev({t:"sail",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){liveRender();await narrateLastEvent();}}
    await humanAct(p,sailCtx);return;
  }
  // @copy adhoc.act.bakerystart
  if(v==="bakery"){await flash("🧁 Firing up the ovens on the Isle of Tortuga!",1200);return;}
  if(v==="dock"){
    const r=await humanDock(p,port);
    if(r==="back"){await humanAct(p,sailCtx);return;}
  }
  else if(v==="attack"){
    // #5d: safety net — the button is disabled when you can't afford powder, but guard the action
    // too (e.g. a forced/edge selection) so we never enter a battle you can't pay for.
    // @copy adhoc.act.nopowder
    if(p.coins<appState.game.cfg.powder){await flash(`${pn(p.idx)} can't afford powder.`,1400,undefined,[{seat:p.idx,html:`Yer too poor to afford powder. Go fishin' 🎣`}]);await humanAct(p,sailCtx);return;}
    const t=targets.length===1?targets[0]:
      // @copy prompt.act.attacktarget
      await ask("Attack whom?",targets.map(o=>({label:pn(o.idx),value:o})).concat([{label:"← Back",back:true,value:null}]),
        targets.map(o=>HEXCOL[o.idx]));
    if(t===null){await humanAct(p,sailCtx);return;}
    await netHandlers().onAsyncBattle(p,t);
    await narrateLastEvent();
  }
  else if(v==="trade"){const done=await humanTrade(p);if(!done){await humanAct(p,sailCtx);}return;}
  else if(v==="fish"){
    // @copy misc.paramprompt.fishcast
    const r=await fishCast(p,"🎣 Cast yer line — flip!",true);
    if(r==="back"){await humanAct(p,sailCtx);return;}
    await narrateLastEvent();
  }
}
export async function humanTurn(p){
  await passGate(p.idx);
  setActor(p.idx);
  // a prior player's shot-clock expiry can leave this set from their forfeited turn — this
  // flag only ever gets cleared by armClock() deep inside a decision, which is too late to
  // save this turn's own early "did the previous turn just die?" guards below, so clear it
  // fresh the moment a new human turn actually begins
  appState.turnExpired=false;
  // pass & play: this seat's own "check my recipe" button is only ever offered while its
  // turn is genuinely live (see render()) — any reveal from a prior turn is already gone.
  appState.activeTurnSeat=p.idx;appState.recipeRevealed=false;
  appState.game.ev({t:"turn",p:p.idx});
  liveRender();
  // NARR-01/NARR-03/D-25 (Wyatt-approved 2026-07-29): the storm clause names only the leg happening
  // now (dir1/windNow) — the second leg's own direction is announced separately, at the moment it
  // actually happens, by humanWind. A non-storm turn drops the wind-direction repeat entirely — the
  // round header (EVENT_NARRATION.newround) already announced it moments ago at the top of the
  // round, so restating it here every single turn was exactly the redundancy this phase removes.
  const stormNow=appState.game.stormNow;
  const neutralBanner=stormNow
    ?`⛵ Ahoy, ${poss(p.idx)} turn! First the ⛈️ storm blows them 2 squares <b>${DIRNAME[appState.game.windNow]}</b>.`
    :`⛵ Ahoy, ${poss(p.idx)} turn!`;
  const addressedBanner=stormNow
    ?`⛵ Ahoy, ${pn(p.idx)} — yer turn!${stormIntroClause(appState.game.windNow)}`
    :`⛵ Ahoy, ${pn(p.idx)} — yer turn! The wind blows <b>${DIRNAME[appState.game.windNow]}</b> this round.`;
  // @copy adhoc.turn.banner
  await flash(neutralBanner,1500,undefined,[{seat:p.idx,html:addressedBanner}]);
  // the clock only starts once the player actually reaches a decision (wind response, sail
  // pick, action choice, ...) — not from the raw top of the turn, since the wind step itself
  // eats no time. Each ask()/pickCell() call re-arms it fresh via armClock().
  if(appState.turnExpired){appState.activeTurnSeat=null;appState.recipeRevealed=false;return;}
  // normal turns no longer get force-moved by the wind (see #7) — only a storm still shoves
  // ships around; otherwise the wind only shapes this player's own sail budget below
  if(appState.game.stormNow){
    await humanWind(p);
    appState.recipeRevealed=false; // a real decision (dodge/pay/flip) may just have resolved — re-lock
    if(appState.turnExpired){appState.activeTurnSeat=null;return;}
    // storms already narrate each leg's direction as they happen ("spins again — blows X"),
    // so there's no separate "wind carries you" summary to show here — it would always be
    // stale (mentioning only the first leg) by the time both legs have resolved
    if(p.shipwrecked){ // no coins, no crates, no move — repairs eat the rest of this turn
      p.shipwrecked=false;
      stopShotClock();
      appState.activeTurnSeat=null;
      if(appState.passAndPlay)liveRender();
      return;
    }
  }
  p.justDocked=false;
  if(!appState.game.adjPort(p))p.dockedNow.clear();
  const preSailPos=[...p.pos],preSailCoins=p.coins; // lets humanAct offer "move instead" if this seat just stayed put
  if(p.coins>0){
    // notes/edits #10: an island upwind steals your wind — warn before the move pick
    // @copy adhoc.turn.leeward
    if(appState.game.leeward(p))await flash(`🏝️ Land's blockin' ${pn(p.idx)}'s wind — can't sail as far. Movin' slow as cold molasses in this lee.`,1500,undefined,[{seat:p.idx,html:`🏝️ Land's blockin' yer wind, ${pn(p.idx)} — can't sail as far. Movin' slow as cold molasses in this lee.`}]);
    const dest=await pickCell(p,reachable(p));
    appState.recipeRevealed=false; // sail destination chosen — re-lock
    if(appState.turnExpired){appState.activeTurnSeat=null;return;}
    if(dest){p.coins--;p.pos=dest;appState.game.ev({t:"sail",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){liveRender();await narrateLastEvent();}}
  // @copy adhoc.turn.brokesail
  }else await flash(brokeSailLine(p.idx,NEUTRAL_VIEWER),900,undefined,[{seat:p.idx,html:brokeSailLine(p.idx,p.idx)}]); // D-11: broke — the action prompt right after also reframes, but this is the sail-specific nudge
  if(appState.turnExpired){appState.activeTurnSeat=null;return;}
  if(!appState.game.adjPort(p))p.dockedNow.clear();
  await humanAct(p,{preSailPos,preSailCoins});
  appState.recipeRevealed=false; // the turn's dock/attack/trade/fish action just resolved — re-lock
  stopShotClock();
  appState.activeTurnSeat=null;
  // refresh now, not at the next turn's render — otherwise this seat's "check my recipe"
  // button sits frozen (blurred but visible) behind the next pass-the-device screen
  if(appState.passAndPlay)liveRender();
}
/* ================= bot hail (AI-01) ================= */
// D-04/D-06/D-07: pure, DOM/Firebase/RNG-free — take `g` as an explicit param, read no appState,
// touch no DOM, and never call g.r(), so a repeated evaluation inside one round is always safe.
const HAIL_BASE_PRICE=5,HAIL_RESERVE=1; // reserve is exactly what a bot needs to sail next turn (:579)
// D-06: prefer sellers holding 2+ (a genuine spare), then whoever it hurts least to give one up
// (humanTrade's own essential idiom, :370 — recipe.includes+cnt<=1, NOT needs(q).includes per
// <planner_corrections>), then proximity to the ingredient's island as a tiebreaker only — the
// crate pool is guaranteed empty whenever a hail fires (D-05's gate), so no target can actually
// restock; proximity never implies "can resupply easily". Seat index closes out a full tie.
export function rankHailTargets(g,p,ing){
  return g.players.filter(q=>q.strategy==="human"&&!q.done&&q.ing.includes(ing)).sort((a,b)=>{
    const spareA=g.cnt(a.ing,ing),spareB=g.cnt(b.ing,ing);
    if(spareB!==spareA)return spareB-spareA;
    const hurtsA=(a.recipe.includes(ing)&&spareA<=1)?1:0,hurtsB=(b.recipe.includes(ing)&&spareB<=1)?1:0;
    if(hurtsA!==hurtsB)return hurtsA-hurtsB;
    const distA=man(a.pos,g.islandOf[ing]),distB=man(b.pos,g.islandOf[ing]);
    if(distA!==distB)return distA-distB;
    return a.idx-b.idx;
  });
}
// D-07: scales on BOTH the bot's own desperation and what giving it up costs the seller, clamped
// by the bot's purse minus its reserve — the clamp is the bankruptcy guard and is not optional.
export function priceHailOffer(g,p,seller,ing){
  const desperation=g.needs(p).length<=1?2:(g.needs(p).length<=2?1:0);
  const sellerCost=g.cnt(seller.ing,ing)>=2?0:(seller.recipe.includes(ing)?2:1);
  return Math.max(0,Math.min(HAIL_BASE_PRICE+desperation+sellerCost,p.coins-HAIL_RESERVE));
}
// D-04: evaluated AFTER D-05's crate-supply gate has already passed — true only when the purse
// covers the base offer with the reserve intact AND the spend is genuinely worth it: the
// ingredient is among the bot's last two remaining needs, or the bot is stuck outright.
export function hailWorthIt(g,p,ing){
  return p.coins>=HAIL_BASE_PRICE+HAIL_RESERVE&&(g.needs(p).length<=2||g.boxedIn(p));
}
export async function botTurn(p){
  const g=appState.game;
  g.ev({t:"turn",p:p.idx});
  await botBeat();
  // wind no longer force-moves anyone on a normal turn (see #7) — only storms still shove
  // ships around; a normal turn's wind only shapes this player's own sail budget below
  if(g.stormNow){
    const wasDocked=g.adjPort(p)!==null;
    const dodgedOnce={v:false};
    await botWindLeg(p,g.windNow,2,dodgedOnce,wasDocked);
    // mirrors humanWind's own mid-storm direction flash (:281) at bot pace, naming the second leg
    // D-18/D-23/D-37: shared with humanWind's own second-leg line — one narration path, viewer
    // perspective only, same hold curve as a human's turn (D-23 parity).
    const secondLegMsg=secondLegLine(p.idx,g.windNow2,NEUTRAL_VIEWER);
    // @copy adhoc.turn.botsecondleg
    await flash(secondLegMsg,null,msgHoldMs(secondLegMsg),[{seat:p.idx,html:secondLegLine(p.idx,g.windNow2,p.idx)}]);
    await botWindLeg(p,g.windNow2,2,dodgedOnce,wasDocked);
    // botWindLeg already emits and narrates its own blownOut/windmove summary per leg — no
    // separate summary emit or botBeat() here, or every storm outcome double-narrates
    p.justDocked=false;
    if(p.shipwrecked){p.shipwrecked=false;return;} // no coins, no crates, no move — repairs eat the turn
  }
  if(!g.adjPort(p))p.dockedNow.clear();
  let target=g.chooseTarget(p);
  if(p.strategy==="pirate"&&g.needs(p).length){
    const prey=g.players.filter(q=>q!==p&&!q.done&&q.ing.some(i=>g.needs(p).includes(i)));
    if(prey.length){prey.sort((x,y)=>man(p.pos,x.pos)-man(p.pos,y.pos));
      if(man(p.pos,prey[0].pos)<man(p.pos,target))target=prey[0].pos;}
  }
  const dist=man(p.pos,target);
  const exact=g.dockCells.has(target[0]+","+target[1]);
  const wantsToSail=dist>1||(dist===1&&exact);
  if(wantsToSail&&p.coins>0){
    p.coins--;const b=[...p.pos];g.stepToward(p,target,g.sailBudget(p));
    if(p.pos[0]!==b[0]||p.pos[1]!==b[1]){g.ev({t:"sail",p:p.idx});await botBeat();}else p.coins++;
  // @copy adhoc.turn.botbrokesail
  }else if(wantsToSail)await flash(brokeSailLine(p.idx,NEUTRAL_VIEWER),null,msgHoldMs(brokeSailLine(p.idx,NEUTRAL_VIEWER)),[{seat:p.idx,html:brokeSailLine(p.idx,p.idx)}]); // D-11/D-23: a broke bot states why it isn't moving, on the same hold curve a human gets
  if(!g.adjPort(p))p.dockedNow.clear();
  liveRender();
  // hail humans: locked-out bots offer coins for a crate they can't get any other way. D-02/D-24:
  // an offer reaching the table spends the bot's one action — accepted, countered, or refused, its
  // turn ends here, exactly like a human's Parley (humanAct :432, humanTrade :336/:485 precedent).
  // D-25: this stays UI-tier only — the action selector below is shared with the simulator's
  // takeTurn(), so a taken hail must return before reaching it rather than folding hailing in.
  let hailed=false;
  if(g.cfg.parley&&(appState.game.round-(p.lastOffer||-9))>=3){
    for(const ing of g.needs(p)){
      if(g.tokens[ing]>0)continue; // island still has crates — no need to beg (D-05, last-resort only)
      if(!hailWorthIt(g,p,ing))continue; // D-04: only spend the action when it's genuinely worth it
      const targets=rankHailTargets(g,p,ing);
      if(!targets.length)continue;
      const human=targets[0];
      const price=priceHailOffer(g,p,human,ing);
      // D-24: stamp lastOffer and spend the action THE MOMENT the offer reaches the table — before
      // the await, not after — so the cooldown and the action cost are committed whether the human
      // accepts, counters, or refuses (and a re-entrant pass within the cooldown is a no-op).
      p.lastOffer=appState.game.round;
      hailed=true;
      setActor(human.idx);
      // D-41 EXTENDED (Wyatt-approved 2026-07-29): Counter-offer dead-ends silently when the bot
      // can't afford to go any higher — compute `raises` BEFORE offering the choice and grey the
      // option out with a reason, same pattern as Attack/Trade.
      const raises=[price+1,price+2,price+3].filter(n=>n<=p.coins-HAIL_RESERVE);
      const canCounter=raises.length>0;
      // @copy prompt.hail.offer
      const choice=await ask(`📯 ${pn(p.idx)} hails ye: "Ahoy! Want ${price}🌕 for yer ${ilabelImg(ing)}?"`,
        [{label:`Sell for ${price}🌕`,value:"sell"},{label:"Counter-offer",value:"counter",disabled:!canCounter},{label:"Refuse",value:"refuse"}],
        null,canCounter?null:`${pn(p.idx)} can't afford to go any higher.`);
      if(appState.turnExpired)return; // shot-clock expired mid-hail — no partial trade, ever
      let finalPrice=price,dealt=choice==="sell";
      if(choice==="counter"){
        // @copy prompt.hail.counter
        const counterAmt=await ask(`Counter — how much for yer ${ilabelImg(ing)}?`,
          raises.map(n=>({label:`+${n}🌕`,value:n})).concat([{label:"Never mind",value:0}]));
        if(appState.turnExpired)return;
        if(counterAmt>0){finalPrice=counterAmt;dealt=true;} // the bot's only source is this trade, so it pays up if it can afford it
      }
      // D-19 SIMPLIFIED (Wyatt-approved 2026-07-29): emit `parley` only on a refusal — the accepted
      // branch already emits its own `trade` event two lines below, so emitting both here produced
      // two captain's-log lines for one swap. No `ok` field: it can now only ever be `false` (an
      // invariant field is no field), and EVENT_NARRATION.parley's builder has been simplified to
      // match. UI-tier only, does not touch src/engine/index.js — zero `parley` events across all
      // 31 determinism fixtures (Game.play()'s headless path never reaches this human-trade flow).
      if(!dealt)g.ev({t:"parley",a:p.idx,b:human.idx,offer:finalPrice+" coins",want:ing,kind:"hail"});
      if(dealt){
        human.ing.splice(human.ing.indexOf(ing),1);p.ing.push(ing);
        p.coins-=finalPrice;human.coins+=finalPrice;g.trades++;
        if(g.cfg.tradeBonus){p.coins++;human.coins++;}
        g.ev({t:"trade",a:p.idx,b:human.idx,gave:finalPrice+" coins",got:ing,kind:"hail"});
      }
      await botBeat();
      break;
    }
  }
  // CR-01: the hail's own botBeat() already fired at the end of the loop above, and liveRender()
  // pins evIdx to events.length-1 (src/ui/panel.js:170). No event is appended between there and
  // here, so a second botBeat() re-narrates the identical line and re-fires spawnPops for the same
  // event — a visible double-flash on every resolved hail. Just end the turn: D-24's whole point is
  // that the hail WAS the action.
  if(hailed)return;
  const action=g.chooseAction(p);
  if(action.type==="attack"){
    if(!g.tryTrade(p))await netHandlers().onAsyncBattle(p,action.target);
    await botBeat();return;
  }
  if(action.type==="trade"){g.tryTrade(p);await botBeat();return;}
  if(action.type==="dock"&&g.doDock(p,action.ing)){await botBeat();return;}
  // fallback: fish regardless of purse size — see the matching comment on the sim's takeTurn()
  // @copy misc.paramprompt.botfishcast
  await fishCast(p);
  await botBeat();
}

/* ================= battle-UI + side-bets + intro + game-start ================= */
// battleAsk/renderBattle/watchBattle/asyncBattle stay classic (11-analysis.json: orchestration —
// each calls a net-adjacent function directly), homed in 11-06 alongside the rest of the
// orchestration layer. This cluster's functions call them as bare identifiers (resolved via the
// still-present PP bridge), same as every other still-classic cross-reference this phase.

// flash moved verbatim to src/ui/panel.js (11-04) — its netNarrate() call is now routed through
// src/ui/handlers.js's injected onBroadcast handler (D-07/criterion 1 seam; see src/main.js).
// blocks until every human seat (not just the host) has read msg and clicked through — same
// per-seat localAsk/remoteDraftPrompt barrier recipeDraftNet() uses, so remote players get a
// real button instead of read-only narration text they can't dismiss
export async function netIntroBarrier(msg,btnLabel){
  if(appState.replaying)return;
  netHandlers().onNetBroadcast(msg);
  const opts=[{label:btnLabel,value:0,cls:"primary ahoyGlow"}];
  const humans=appState.game.players.filter(p=>p.strategy==="human");
  if(appState.passAndPlay){
    // one device, several humans: nobody is "remote", so read-and-click-through happens in
    // turn, each gated by the same pass-the-device screen every turn hand-off uses
    for(const p of humans){await passGate(p.idx);await localAsk(msg,opts);}
    return;
  }
  // whoever clicks through first (or isn't last) sits on this instead of a blank panel while the
  // rest of the crew finishes reading — same idea as recipeDraftNet's "waiting for the crew" beat
  // @copy misc.draftwait.introwait
  const waitMsg=humans.length>1?"⚓ Waiting for yer mateys…":null;
  await Promise.all(humans.map(p=>seatLocal(p.idx)
    ?localAsk(msg,opts).then(i=>{if(waitMsg)showNarration(waitMsg);return i;})
    :netHandlers().onRemoteDraftPrompt(p.idx,msg,opts,waitMsg)));
}
// the opening backstory/context message — stays up until every human player actually reads it
// and clicks through, rather than auto-advancing on a timer like every other narration
export async function showAhoyIntro(){
  // D-25/D-26 (Wyatt-approved 2026-07-29, applied 2026-07-29 during the two-tab playtest): his
  // `misc:introBarrier` rewrite is this ONE sentence. The two that used to follow — "⛵️ Each turn,
  // ye sail, then ye plunder." and the EYES_IMG "Watch this panel — she'll steer ye straight!" —
  // are deleted at his explicit word ("I want to delete the other two sentences, because the intro
  // is too long"), which is what D-16 requires before an icon may go: removal stated in words, not
  // inferred from a note that simply omits it. The leading ⚓ is KEPT — the leading space in his
  // stored note is a stripped emoji (D-50), never an instruction to drop the icon.
  //
  // This row was `reviewed:true, tag:"rewrite"` in 15-DISPOSITIONS-FINAL.json and was NEVER
  // applied: 15-06's "apply Wyatt's approved narration copy" commit (11cbf34) changed only this
  // call's BUTTON label and left the message byte-identical to its Phase 11 original (6dbd87f).
  // A sixth instance of the approved-but-not-applied class after D-17/D-29/D-54 — and the first
  // found outside the five audited gaps, which is why the copy gate must check all 155 approval
  // fields rather than a hand-picked subset.
  const msg=`⚓ Ahoy! Gather every ingredient in yer recipe, then sail home first to win!`;
  // NARR-01/D-25 (Wyatt-approved 2026-07-29): button trimmed to just "Arrgh!" — icon kept (D-16).
  // @copy misc.introbarrier.ahoy
  await netIntroBarrier(msg,"⚓ Arrgh!");
}
// right after the Ahoy intro closes: announce who won the flip for first mover, and cheer up
// everyone sailing later by pointing out the coin they get in exchange for waiting. Stays up
// until every human player dismisses it (like showAhoyIntro) since it's easy to blink and miss
// a flashed message.
// NARR-01/D-25 (Wyatt-approved 2026-07-29): applied verbatim.
export async function showTurnOrderIntro(order){
  const lead=pn(order[0]);
  const rest=order.slice(1).map((i,k)=>`${pn(i)} (+${k+1})`).join(", ");
  const msg=`${iconImg(DICE_IMG)} The crew draws lots for sailing order — ${lead} first!<br><br>`+
    `No fretting, patience pays — ${rest} all cast off with extra dubloons.`;
  // @copy misc.introbarrier.turnorder
  await netIntroBarrier(msg,"🦜 Start");
}
export function coinHTML(state,bs,win){
  const b=bs?`<span class="bs">🔥</span>`:"";
  const w=win?" win":"";
  if(state==="H")return `<div class="coin heads${w}" style="background-image:url(${FLIP_HEADS_IMG})">${b}</div>`;
  if(state==="T")return `<div class="coin tails${w}" style="background-image:url(${FLIP_TAILS_IMG})">${b}</div>`;
  if(state==="spin")return `<div class="coin spin">🪙${b}</div>`;
  return `<div class="coin wait">?</div>`;
}
export function pipsHTML(n,col,total){
  total=total||3;
  let s="";
  for(let i=0;i<total;i++)s+=`<span class="pip${i<n?" on":""}"${i<n?` style="background:${col};border-color:${col}"`:""}></span>`;
  return `<div class="pips">${s}</div>`;
}
export function battleSnapshot(o){
  const snap={};
  for(const k of ["round","a","d","atState","dfState","atBs","dfBs","live","winCoin","result","waiting","need","title","roleA","roleD"])
    if(o[k]!==undefined)snap[k]=o[k];
  snap.attIdx=o.att.idx;snap.defIdx=o.def.idx;
  return snap;
}
export function renderBattleFromSnap(snap,extra){
  if(!appState.game||!appState.game.players[snap.attIdx]||!appState.game.players[snap.defIdx])return;
  netHandlers().onRenderBattle(Object.assign({att:appState.game.players[snap.attIdx],def:appState.game.players[snap.defIdx]},snap,extra||{}));
}
// the footer beneath the coins: a decision (buttons), a "waiting…" note, or the round result
export function battleFooter(o){
  if(o.prompt){
    const {msg,opts,colors}=o.prompt;
    return `<div class="btl-prompt">${msg?`<div class="msg">${msg}</div>`:""}<div class="btns">`+
      opts.map((op,i)=>`<button class="apBtn btlBtn" data-i="${i}"${apBtnStyle(colors&&colors[i])}>${op.label}</button>`).join("")+
      `</div></div>`;
  }
  if(o.waiting)return `<div class="btl-wait">⏳ Waiting for ${o.waiting}…</div>`;
  return `<div class="btl-result">${o.result||"&nbsp;"}</div>`;
}
// The Lookout's Call: every spectator MUST call a winner from the crow's nest —
// it's free, and a correct call earns a Spotter's Bounty (+1🌕) from the ship's
// bank. Players MAY back their call with their own coin for a bigger prize.
export async function collectSideBets(att,def){
  const bets=[],ns=pn;
  const spectators=appState.game.players.filter(p=>p!==att&&p!==def&&!p.done);
  for(const s of spectators){
    if(s.strategy==="human"){
      // The call itself is free and mandatory — no coin of your own at risk. The coin-backing
      // step is back-able: "← Back" there returns to re-pick the winner (see notes/edits 4b).
      let who,amt=0;
      for(;;){
        setActor(s.idx);
        // @copy prompt.sidebet.call
        who=await ask(`⚔️ A battle's brewing! Guess the winner (for free) and win 1🌕 — or back yer call for double-or-nothing.`,
          [{label:`Call ${ns(att.idx)}`,value:"a"},{label:`Call ${ns(def.idx)}`,value:"d"}],
          [HEXCOL[att.idx],HEXCOL[def.idx]]);
        amt=0;
        let amounts=[1,2,3,5].filter(n=>s.coins>=n);
        if(s.coins>5)amounts.push(s.coins); // all-in
        if(amounts.length){
          setActor(s.idx);
          // Optional: sweeten the call with real coin.
          // @copy prompt.sidebet.raise
          amt=await ask(`💰 Add to yer call on ${who==="a"?ns(att.idx):ns(def.idx)}? Win: 2x🌕 + 1. Lose: ye get nothing.`,
            [{label:"Just the free call",value:0}].concat(
              amounts.map(n=>({label:`Bet ${n}🌕`+(n===s.coins?" — all in!":""),value:n})))
              .concat([{label:"← Back",back:true,value:"back"}]));
          if(amt==="back")continue; // re-pick the winner
        }
        break;
      }
      bets.push({idx:s.idx,on:who,amt});
      // D-08: a side-bet call names two seats — the caller (s) AND the called captain (att/def) —
      // so both get their own addressed variant, not just the actor.
      const calledIdx=who==="a"?att.idx:def.idx;
      // D-54/D-25 (Wyatt-approved 2026-07-29): the called captain's variant ends "bets N🌕 on it!"
      // per adhoc:src/ui/flow.js:901 in 15-ADDRESSED2-APPROVED.json. The leading 💰 is re-attached
      // (D-16 — his note could not carry inline markup). The free-call sibling below already
      // matches its own approved row byte-for-byte and is deliberately untouched.
      // @copy adhoc.sidebet.backed
      if(amt)await flash(`💰 ${pn(s.idx)} calls ${pn(calledIdx)} and bets ${amt}🌕!`,1100,undefined,[{seat:s.idx,html:`💰 Ye call ${pn(calledIdx)} and bet ${amt}🌕!`},{seat:calledIdx,html:`💰 ${pn(s.idx)} calls ye to win and bets ${amt}🌕 on it!`}]);
      // @copy adhoc.sidebet.freecall
      else await flash(`🔭 ${pn(s.idx)} calls ${pn(calledIdx)} from the crow's nest.`,900,undefined,[{seat:s.idx,html:`🔭 ${pn(s.idx)} — ye call ${pn(calledIdx)} from the crow's nest.`},{seat:calledIdx,html:`🔭 ${pn(s.idx)} calls ye to win from the crow's nest.`}]);
    }else{
      // Bots always call (favoring the fuller purse), and sometimes back it with coin.
      const fav=att.coins>=def.coins?"a":"d";
      const on=appState.game.r()<.72?fav:(fav==="a"?"d":"a");
      const amt=(s.coins>=4&&appState.game.r()<.5)?Math.min(2,s.coins):0;
      bets.push({idx:s.idx,on,amt});
    }
  }
  return bets;
}
export async function settleSideBets(bets,winSide){
  if(!bets.length)return;
  const parts=[];
  for(const bet of bets){
    const p=appState.game.players[bet.idx],won=bet.on===winSide;
    // Correct call: Spotter's Bounty (+1) plus doubled stake. Wrong: only a
    // wagered stake sinks — a free call costs nothing.
    const delta=won?1+2*bet.amt:-bet.amt;
    p.coins+=delta;
    appState.game.ev({t:"sidebet",p:bet.idx,amt:bet.amt,won,on:bet.on,delta});
    if(delta>0)parts.push(`${pn(bet.idx)} +${delta}🌕`);
    else if(delta<0)parts.push(`${pn(bet.idx)} −${bet.amt}🌕`);
    else parts.push(`${pn(bet.idx)} no bounty`);
  }
  liveRender();
  // @copy adhoc.sidebet.settle
  await flash("🔭 The Lookout's Call settles — "+parts.join(" · "),1600);
}
// The bakeoff gets the same scoreboard + flippenator treatment as a regular battle, just
// without attacker/defender roles, broadsides, or spoils — just two finalists racing to `need`.
export async function asyncBakeoff(A,B){
  const need=3;
  let a=0,d=0,round=0;
  const nm=pn;
  const bd=(typeof stepDelay==="function")?stepDelay():500;
  const spin=Math.max(260,Math.min(650,bd*0.7));
  const hold=Math.max(500,Math.min(1500,bd*1.1));
  const base=o=>Object.assign({att:A,def:B,a,d,round,need,title:"🧁 The Bakeoff!",roleA:"Finalist",roleD:"Finalist"},o);
  const flipSide=async(side,p)=>{
    const key=side==="a"?"atState":"dfState";
    if(p.strategy==="human"){
      await netHandlers().onBattleAsk(p,base({live:side,[key]:"wait"}),
        `🧁 ${nm(p.idx)} — flip!`,[{label:"🌕 FLIP!",value:1,flip:true}]);
    }else{
      netHandlers().onRenderBattle(base({live:side,[key]:"wait"}));
    }
    netHandlers().onBroadcastFlip("spin");
    await sleep(spin);
    const h=appState.game.flip(p);
    netHandlers().onBroadcastFlip(h?"H":"T");
    netHandlers().onNetBroadcast(`${pn(p.idx)} flips ${h?"⚪ HEADS!":"⚫ TAILS"}`);
    netHandlers().onRenderBattle(base({live:side,[key]:h?"H":"T"}));
    await sleep(Math.min(hold*0.5,500));
    netHandlers().onBroadcastFlip("wait");
    return h;
  };
  while(a<need&&d<need){
    round++;
    netHandlers().onRenderBattle(base({atState:"wait",dfState:"wait",live:"a",result:`🧁 Bakeoff — round ${round}!`}));
    await sleep(300);
    const ah=await flipSide("a",A);
    const dh=await flipSide("d",B);
    let scorer=null,rmsg;
    // NARR-01/D-25/D-52 (Wyatt-approved 2026-07-29): the two "{finalist} scores!" branches merge
    // into one template naming whoever actually scored — same D-52 pattern as asyncBattle's own
    // round-result merge above (a name-slot difference, not a real branch).
    // @copy misc.battleline.bakeoffbothheads
    if(ah&&dh){rmsg=`<span class="cancel">Both ⚪️ HEADS — no score this round.</span>`;}
    else if(ah||dh){
      scorer=ah?"a":"d";
      if(ah)a++;else d++;
      // @copy misc.battleline.bakeoffscores
      rmsg=`<span class="score">${ah?nm(A.idx):nm(B.idx)} scores!</span>`;
    }
    // @copy misc.battleline.bakeoffbothtails
    else{rmsg=`<span class="cancel">Both ⚫️ TAILS — no score this round.</span>`;}
    netHandlers().onRenderBattle(base({atState:ah?"H":"T",dfState:dh?"H":"T",live:null,winCoin:scorer,result:rmsg}));
    await sleep(hold);
  }
  panel("");
  const w=a>=need?A:B;
  appState.game.ev({t:"bakeoff",a:A.idx,b:B.idx,winner:w.idx});liveRender();
  return w;
}
// 11-07 (bridge deletion fix): relocated here verbatim from src/ui/lobby.js. wireWelcome calls
// startSinglePlayer()/startPassAndPlay() (below, same file — already local, no import needed);
// src/ui/lobby.js (its former home) cannot reach either without importing this file, which would
// close an import cycle (this file already imports `passGate`/`requireName` FROM lobby.js) —
// module_graph_check.js's "no import cycle" assertion forbids that. `showStep` stays in
// lobby.js and is imported alongside the two names already pulled from there.
export function wireWelcome(){
  $("choiceSolo").onclick=()=>{if(!requireName())return;startSinglePlayer();};
  $("choiceHost").onclick=()=>{if($("choiceHost").classList.contains("disabled"))return;if(!requireName())return;showStep("stepHost");};
  $("choiceJoin").onclick=()=>{if($("choiceJoin").classList.contains("disabled"))return;$("joinName").value=$("pname").value;showStep("stepJoin");};
  $("choicePassPlay").onclick=()=>{$("ppName0").value=($("pname").value||"").trim();showStep("stepPassPlay");};
  $("btnStartPassPlay").onclick=()=>{
    const names=[0,1,2,3].map(i=>($("ppName"+i).value||"").trim().slice(0,40)).filter(n=>n);
    // pass & play always needs at least two humans sharing the device — nobody typing
    // anything shouldn't block starting, it just means the default captain names are used
    while(names.length<2)names.push(NAMES[names.length].replace("Capt. ",""));
    startPassAndPlay(names);
  };
  document.querySelectorAll("#lobby [data-back]").forEach(b=>{b.onclick=()=>showStep("stepChoose");});
}
export function startSinglePlayer(){
  const name=requireName();
  const opp=3; // 4-player table is the standard game; no longer prompting for opponent count
  const strategies=["human"];
  for(let i=1;i<=opp;i++)strategies.push(seatStrat(i)); // BOT-02: temperament follows the captain
  appState.numSeats=strategies.length;appState.room=null;appState.isHost=true;appState.mySeat=0;
  appState.roster=strategies.map((s,i)=>i===0?{name,id:"solo",bot:false}:{name:"",id:"",bot:true,strat:s});
  const seed=Math.floor(Math.random()*1e9);
  appState.soloMeta={name,strategies,seed};appState.dlog=[];saveSoloState();
  netHandlers().onBeginGame(roundCfg(strategies),seed);
}
// Pass & Play: `names` holds one entry per human seat (2-4), in seat order; any remaining
// seats up to the standard 4-player table are filled with bots, same pool solo/host use.
export function startPassAndPlay(names){
  const strategies=names.map(()=>"human");
  for(let i=names.length;i<4;i++)strategies.push(seatStrat(i)); // BOT-02
  appState.numSeats=strategies.length;appState.room=null;appState.isHost=true;appState.mySeat=0;appState.passAndPlay=true;
  appState.roster=strategies.map((s,i)=>i<names.length?{name:names[i],id:"solo",bot:false}:{name:"",id:"",bot:true,strat:s});
  const seed=Math.floor(Math.random()*1e9);
  appState.soloMeta={names,strategies,seed,passAndPlay:true};appState.dlog=[];saveSoloState();
  netHandlers().onBeginGame(roundCfg(strategies),seed);
}
// pass & play: reveal the active turn-holder's own recipe on demand — see render()'s
// canReveal/offerCheckBtn logic and the recipeRevealed re-lock points inside humanTurn.
export function revealMyRecipe(){appState.recipeRevealed=true;liveRender();}

/* ================= recovery/replay seam trio + remotePickHighlights ================= */
// This section resolves the final 3 of the milestone's 6 UI->orchestration edges (RESEARCH.md
// Q1b) through src/ui/handlers.js's injected-handler seam — 11-04 resolved the first 2
// (flash->onBroadcast, liveRender->onEvents). Each function below replaces a direct call to a
// still-classic net-adjacent function (sendResponse/setRecoveryState/leaveGame) with a call
// through netHandlers(), so this module never needs its own import of src/net/ (D-07).
// src/main.js's composition root wires onRespond/onRecovery/onLeave alongside the existing
// onBroadcast/onEvents, still pointing at the classic globals via the PP bridge this wave —
// formalized to real src/net/ imports in 11-06.

// draw the same highlighted cells on a REMOTE player's board and post their choice back.
// D-35 (Wyatt-approved 2026-07-29): `msg` is what the host composed (sailPickMsg, via pickCell's
// onRemotePrompt payload) — rendered here, never re-authored. Falls back to sailPickMsg(mySeat) for
// an older host payload with no `msg` field, so a mid-game version skew still reads sensibly.
export function remotePickHighlights(cells,promptId,msg){
  const svg=$("board"),hs=[];
  const done=v=>{hs.forEach(h=>h.remove());panel("");netHandlers().onRespond?.(promptId,v);};
  const cellPx=boardCell(); // notes/edits 11-03: cell now lives in src/ui/board.js
  // D-55/D-56: the guest rect's own visual affordance (class, fill, animation) is a DOM-contract/
  // visual-polish gap, deliberately scoped to Phase 16 (UI-01…07), not this copy-and-behavior plan
  // — left exactly as it was here; only the TEXT fork (D-35, above) is this plan's to close.
  for(const c of cells){
    const r=el("rect",{x:c[0]*cellPx+2,y:c[1]*cellPx+2,width:cellPx-4,height:cellPx-4,rx:5,
      fill:"#fdb63d",opacity:.4,style:"cursor:pointer"},svg);
    r.addEventListener("click",()=>done(c));
    hs.push(r);
  }
  // @copy prompt.sail.remotepickpanel
  panel(`<div class="apMsg">${msg||sailPickMsg(appState.mySeat)}</div>
    <div class="apBtns"><button class="apBtn" id="apStay">Stay put</button></div>`,true);
  $("apStay").onclick=()=>done(null);
}
// leave replay mode: the recorded log is exhausted (or the game replayed to its end). Reconcile
// the broadcast frontier so we push only events the crew hasn't already seen, then render live.
export function endReplay(){
  if(!appState.replaying)return;
  appState.replaying=false;
  // BUG-04: this used to set evPushed=resumeEvLen unconditionally. When a replay came up short,
  // that silently moved the broadcast frontier PAST events that were never rebuilt, so every
  // future event was suppressed and guests saw a permanently frozen board. Only advance the
  // frontier when the replay is trustworthy. (readFailed is hard-coded false here; plan 01-02
  // owns resumeHostGame and will thread the real read-failure flag through this parameter.)
  const sf=replayShortfall(appState.game.events.length,appState.resumeEvLen,appState.resumeReadFailed);
  if(sf.incomplete){
    console.error("replay incomplete",sf);
    const note=$("syncnote");if(note)note.style.display="";
    showRestoreFail(sf);    // D-07: ask, don't pretend
    netHandlers().onRecovery?.(sf.reason);  // D-08: and don't leave the crew staring at a frozen board
    return;                 // leave evPushed where it was — pushEvents() resumes from the real
                            // frontier instead of skipping everything the replay failed to rebuild
  }
  appState.evPushed=appState.resumeEvLen;   // events 0..resumeEvLen-1 are already in Firebase; push only what's new
  liveRender();           // flush any freshly-rebuilt events + paint the current board
}

// notes/edits BUG-03/D-07: the replay didn't rebuild the voyage. Explain which way it failed and
// offer the two honest choices — carry on from a knowingly-incomplete state, or scuttle it and
// start fresh. "Resume anyway" deliberately advances evPushed to the REBUILT length, not to
// resumeEvLen: the frontier must reflect what actually exists locally, or pushEvents() goes right
// back to suppressing everything the replay missed (the BUG-04 freeze).
export function showRestoreFail(sf){
  const why=$("restoreFailWhy");
  if(why)why.textContent = sf.reason==="read-failed"
    ? "We couldn't reach the crew's log for this voyage, so we can't tell how much of it is missing. Carrying on may put ye out of step with the rest of the crew."
    : `We rebuilt this voyage but came up ${sf.shortfall} event${sf.shortfall===1?"":"s"} short. Carrying on may put ye out of step with the rest of the crew.`;
  const m=$("restoreFailModal");if(m)m.style.display="flex";
}
export function wireRestoreFail(){
  const anyway=$("btnRestoreAnyway"),restart=$("btnRestoreRestart");
  if(anyway)anyway.onclick=()=>{
    $("restoreFailModal").style.display="none";
    appState.evPushed=appState.game.events.length;   // frontier = what we actually have, not what Firebase claimed
    netHandlers().onRecovery?.(null);
    liveRender();
  };
  if(restart)restart.onclick=()=>{
    $("restoreFailModal").style.display="none";
    netHandlers().onRecovery?.(null);
    netHandlers().onLeave?.();                   // same teardown path as abandoning ship — clears session + room
  };
}
