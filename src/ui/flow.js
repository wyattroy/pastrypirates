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
import {
  DIRS, DIRNAME, windStepCost, man, HEXCOL, iname, ilabelImg, iconImg,
  CUPCAKE_IMG, CHECKMARK_IMG, CANCEL_X_IMG,
} from "../shared/index.js";
import { el, boardCell, setFlipActive } from "./board.js";
import { liveRender, panel, setNeedsAction, narrateLastEvent, flash } from "./panel.js";
import {
  pn, poss, apBtnStyle, ask, armClock, stepDelay, botBeat, setActor, seatLocal,
  decisionIsLocal, stopShotClock, withShotClock, waitWhilePaused,
} from "./util.js";
import { passGate } from "./lobby.js";

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
  const v=await ask(label||"Flip the dubloon!",opts);
  if(v==="back")return "back";
  broadcastFlip("spin");
  await sleep(340);
  const h=appState.game.flip(p);
  broadcastFlip(h?"H":"T");
  // same fixed-3000ms leftover as narrateLastEvent() had — flash() scales the hold to this
  // (short) message's own length instead of a flat timer unrelated to how long it takes to read
  await flash(`${pn(p.idx)} flips ${h?"⚪ HEADS!":"⚫ TAILS"}`);
  broadcastFlip("wait");
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
    const v=await ask(label||`${pn(p.idx)}: cast your line — flip!`,opts);
    if(v==="back")return "back";
  }
  broadcastFlip("spin");
  await sleep(spin);
  const h=appState.game.flip(p);
  broadcastFlip(h?"H":"T");
  await sleep(Math.max(hold,3000));
  broadcastFlip("wait");
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
export function pickCell(p,cells){
  if(appState.replaying){
    if(appState.dlogIdx<appState.dlog.length){appState.dlogN++;return Promise.resolve(appState.dlog[appState.dlogIdx++]);}
    endReplay();
  }
  setActor(p.idx);
  netNarrate(p.idx===appState.mySeat?"":`${pn(p.idx)} is choosing where to sail…`);
  armClock(p.idx);
  const base=decisionIsLocal(p.idx)?localPickCell(p,cells)
    :remotePrompt(p.idx,{kind:"pick",cells,msg:`${pn(p.idx)}: click a highlighted square to sail (−1🌕)`});
  const cellP=withShotClock(p.idx,base,null);
  return cellP.then(c=>{logDecision(c);return c;});
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
    panel(`<div class="apMsg">${pn(p.idx)}: click a highlighted square to sail (−1🌕)</div>
      <div class="apBtns"><button class="apBtn" id="apStay">Stay put</button></div>`,true);
    $("apStay").onclick=()=>done(null);
  });
}
// one 1- or 2-square push in a single direction, with the human island-dodge prompt inline.
// storms chain two of these (see humanWind) — each leg resolves fully before the next begins.
export async function windLeg(p,dirKey,dist,dodgedOnce,wasDocked){
  dodgedOnce=dodgedOnce||{v:false};
  const d=DIRS[dirKey];
  for(let s=0;s<dist;s++){
    const nx=[p.pos[0]+d[0],p.pos[1]+d[1]];
    if(appState.game.blocked(nx))return;
    if(appState.game.isHome(nx)){appState.game.ev({t:"moored",p:p.idx});await narrateLastEvent();liveRender();return;}
    const blocker=appState.game.players.find(q=>q!==p&&!q.done&&q.pos[0]===nx[0]&&q.pos[1]===nx[1]);
    if(blocker){appState.game.ev({t:"blocked",p:p.idx,other:blocker.idx});await narrateLastEvent();liveRender();return;} // another ship holds that square — wind stops short (see #20: surface the "strikes sail" narration)
    if(appState.game.islands[nx]!==undefined){
      if(appState.game.moored(p)){appState.game.ev({t:"moored",p:p.idx});await narrateLastEvent();liveRender();return;}
      // a storm only ever charges (coins or a coin flip) once per turn — a second leg that
      // also hits an island is a free pass, already-paid anchor holding fast
      if(dodgedOnce.v){appState.game.ev({t:"anchorHold",p:p.idx});liveRender();return;}
      const opts=[];
      if(p.coins>=1)opts.push({label:"Pay 1🌕 to anchor",value:"pay"});
      // notes/edits #10b: the real tails consequence depends on what this player actually has to
      // lose (mirrors the branches below) — a broke player with crates loses one of those, not
      // "half their coins" (they have none), and only a truly broke, empty-holds player risks
      // losing the whole turn to repairs.
      const broke=p.coins===0,trueShipwreck=broke&&!p.ing.length;
      const flipLabel=trueShipwreck?"Flip! Heads: dodge. Tails: lose yer turn!"
        :broke?"Flip! Heads: dodge. Tails: lose a crate!"
        :"Flip! Heads: dodge. Tails: lose half 🌕";
      opts.push({label:flipLabel,value:"flip"});
      const promptMsg=trueShipwreck
        ?`${pn(p.idx)}: the storm blows you toward an island! Yer broke — if ye run aground, ye'll lose yer turn!`
        :`${pn(p.idx)}: the storm blows you toward an island! Anchor safely, or flip to take yer chances.`;
      const v=await ask(promptMsg,opts);
      if(appState.turnExpired)return;
      if(v==="pay"){p.coins--;appState.game.ev({t:"dodge",p:p.idx});await narrateLastEvent();}
      else{
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
    p.pos=nx;
    if(appState.game.onRim(nx)){ // swept into the trade winds
      appState.game.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){liveRender();await flash(seatLocal(p.idx)?"🌀 You are swept into the trade winds, and whipped around the rim!":`🌀 ${pn(p.idx)} is swept into the trade winds and whipped around the rim!`,1300);}
      return;
    }
  }
  appState.game.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});liveRender();
}
// only ever called during a storm now (see humanTurn) — normal turns don't force-move anyone
export async function humanWind(p){
  setActor(p.idx);
  const wasDocked=appState.game.adjPort(p)!==null;
  const dodgedOnce={v:false};
  await windLeg(p,appState.game.windNow,2,dodgedOnce,wasDocked);
  if(appState.turnExpired)return;
  await flash(`⛈️ Now the storm moves you <b>${DIRNAME[appState.game.windNow2]}</b>!`,900);
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
  const h=await humanFlip(p,`Docking at ${ilabelImg(ing)} — flip!`,true);
  if(h==="back")return "back";
  if(h){
    appState.game.tokens[ing]--;p.ing.push(ing);appState.game.ev({t:"dock",p:p.idx,ing,heads:1,got:"ing"});
  }else{
    let got="coins";
    if(appState.game.cfg.dockBuy&&p.coins>=3&&appState.game.tokens[ing]>0){
      const buy=await ask(`Tails! Take 3🌕 — or buy ${ilabelImg(ing)} anyway for 3🌕?`,[
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
      const q=await ask("Parley with whom?",opps.map(o=>({label:pn(o.idx),value:o})).concat([{label:"← Back",back:true,value:"__back__"}]),
        opps.map(o=>HEXCOL[o.idx]).concat([null]));
      if(q==="__back__"||q==null)return false; // Back from the first step → action menu (one step)
      st.q=q;step=1;
    }else if(step===1){
      const want=await ask(`What do you want from ${pn(st.q.idx)}?`,
        [...new Set(st.q.ing)].map(i=>({label:ilabelImg(i),value:i})).concat([{label:"← Back",back:true,value:"__back__"}]));
      if(want==="__back__"||want==null){if(step===firstStep)return false;step--;continue;}
      st.want=want;step=2;
    }else if(step===2){
      // An offer is an ingredient, coins, or both together — sweeten a crate with a few coins on top.
      const ingOpts=[...new Set(p.ing)].map(i=>({label:ilabelImg(i),value:i}));
      ingOpts.push({label:"— coins only —",value:"__coinsonly__"});
      ingOpts.push({label:"← Back",back:true,value:"__back__"});
      const baseIng=await ask("Offer which ingredient (or coins only)?",ingOpts);
      if(baseIng==="__back__"){if(step===firstStep)return false;step--;continue;}
      st.baseIng=(baseIng==="__coinsonly__")?null:baseIng;step=3;
    }else{ // step 3
      const coinChoices=[0,1,2,3,4,5,6].filter(n=>n===0||p.coins>=n);
      if(!st.baseIng)coinChoices.shift(); // a coins-only offer needs at least 1 coin
      if(!coinChoices.length){
        // #4: a coins-only offer with an empty purse leaves nothing to put on the table. Say so and
        // step back to the offer choice (UI-08: one step back, not out to the action menu).
        await ask("Ye don't have any to offer!",[{label:"← Back",back:true,value:-1}]);
        step=2;continue;
      }
      const coinOpts=coinChoices.map(n=>({label:n===0?"No extra coins":`+${n}🌕`,value:n}));
      coinOpts.push({label:"← Back",back:true,value:-1});
      const extraCoins=await ask(st.baseIng?`Sweeten with coin? (offering ${ilabelImg(st.baseIng)})`:"How many coins?",coinOpts);
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
    accept=await ask(`${pn(q.idx)}: accept ${offerDisplay} for your ${ilabelImg(want)}?`,
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
      appState.game.ev({t:"parley",a:p.idx,b:q.idx,offer:offerLabel||"nothing",want,ok:false});
      liveRender();
      await flash(humanFinishes?`${pn(q.idx)} refuses — "Not lettin' ye finish yer recipe that easy!"`:`${pn(q.idx)} declines!`);
      return true;
    }
  }
  if(!accept){
    appState.game.ev({t:"parley",a:p.idx,b:q.idx,offer:offerLabel||"nothing",want,ok:false});
    liveRender();
    await flash(`${pn(q.idx)} declines!`);
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
  const opts=[];
  if(canDock)opts.push({label:`⚓ Dock at ${ilabelImg(port)}`,value:"dock"});
  // #5b/#5d: shorter label, and the Attack button always shows when there's a target — greyed out
  // (disabled) rather than hidden when you can't afford powder.
  if(targets.length)
    opts.push({label:`⚔️ Attack${appState.game.cfg.powder?` (-${appState.game.cfg.powder}🌕)`:""}`,value:"attack",disabled:!canAfford});
  if(appState.game.tradeOpp(p).length)opts.push({label:"🤝 Parley",value:"trade"});
  if(!appState.game.needs(p).length&&man(p.pos,appState.game.home)<=1)
    opts.unshift({label:`${iconImg(CUPCAKE_IMG)} Start your bakery!`,value:"bakery"});
  opts.push({label:"🎣 Fish",value:"fish"});
  // offered only if this player's sail step ended in "Stay put" (nothing spent/moved) and they
  // could still afford to sail — covers the reported "hit Stay put by accident" complaint
  const canMoveInstead=sailCtx&&p.coins>0&&p.coins===sailCtx.preSailCoins&&
    p.pos[0]===sailCtx.preSailPos[0]&&p.pos[1]===sailCtx.preSailPos[1];
  if(canMoveInstead)opts.push({label:"← Actually, move instead",back:true,value:"moveInstead"});
  // #5c: helper text under the buttons explains the powder cost; #5d swaps in the too-poor nudge.
  const sub=targets.length?(canAfford?`Attacking costs ye ${appState.game.cfg.powder}🌕 for powder. Fire downwind for the edge!`:`Yer too poor to afford powder! Go fishin'`):null;
  // #5e: with an empty purse you can't pay the crew to sail — reframe the action prompt.
  const prompt=p.coins<=0?`${pn(p.idx)}, ye got nothin to pay yer crew, so they won't budge. Pick one:`:`${pn(p.idx)}, choose your action:`;
  const v=await ask(prompt,opts,null,sub);
  if(appState.turnExpired)return;
  // the clock keeps running (and re-arms fresh) through dock/attack/trade/fish now, instead of
  // stopping here — each ask() inside those sub-flows re-arms it for its own decision
  if(v==="moveInstead"){
    const dest=await pickCell(p,reachable(p));
    if(appState.turnExpired)return;
    if(dest){p.coins--;p.pos=dest;appState.game.ev({t:"sail",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){liveRender();await flash(seatLocal(p.idx)?"🌀 You are swept into the trade winds, and whipped around the rim!":`🌀 ${pn(p.idx)} is swept into the trade winds and whipped around the rim!`,1200);}}
    await humanAct(p,sailCtx);return;
  }
  if(v==="bakery"){await flash("🧁 Firing up the ovens on the Isle of Tortuga!",1200);return;}
  if(v==="dock"){
    const r=await humanDock(p,port);
    if(r==="back"){await humanAct(p,sailCtx);return;}
  }
  else if(v==="attack"){
    // #5d: safety net — the button is disabled when you can't afford powder, but guard the action
    // too (e.g. a forced/edge selection) so we never enter a battle you can't pay for.
    if(p.coins<appState.game.cfg.powder){await flash(seatLocal(p.idx)?`Yer too poor to afford powder! Go fishin'`:`${pn(p.idx)} can't afford powder.`,1400);await humanAct(p,sailCtx);return;}
    const t=targets.length===1?targets[0]:
      await ask("Attack whom?",targets.map(o=>({label:pn(o.idx),value:o})).concat([{label:"← Back",back:true,value:null}]),
        targets.map(o=>HEXCOL[o.idx]));
    if(t===null){await humanAct(p,sailCtx);return;}
    await asyncBattle(p,t);
    await narrateLastEvent();
  }
  else if(v==="trade"){const done=await humanTrade(p);if(!done){await humanAct(p,sailCtx);}return;}
  else if(v==="fish"){
    const r=await fishCast(p,"🎣 Cast your line — flip!",true);
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
  await flash(`⛵ Ahoy, ${seatLocal(p.idx)?`${pn(p.idx)} — your turn!`:`${poss(p.idx)} turn!`} The wind blows <b>${DIRNAME[appState.game.windNow]}</b> this round${appState.game.stormNow?` — ⛈️ STORM! It pushes everyone 2 squares, then 2 more <b>${DIRNAME[appState.game.windNow2]}</b>`:""}.`,1500);
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
    if(appState.game.leeward(p))await flash(seatLocal(p.idx)?`🏝️ Land's blockin' yer wind, matey. Slow as cold molasses in this lee.`:`🏝️ Land's blockin' ${pn(p.idx)}'s wind — slow as cold molasses in this lee.`,1500);
    const dest=await pickCell(p,reachable(p));
    appState.recipeRevealed=false; // sail destination chosen — re-lock
    if(appState.turnExpired){appState.activeTurnSeat=null;return;}
    if(dest){p.coins--;p.pos=dest;appState.game.ev({t:"sail",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){liveRender();await flash(seatLocal(p.idx)?"🌀 You are swept into the trade winds, and whipped around the rim!":`🌀 ${pn(p.idx)} is swept into the trade winds and whipped around the rim!`,1200);}}
  } // no coins to sail — the action prompt right after already explains it, no need for a second box
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
export async function botTurn(p){
  const g=appState.game;
  g.ev({t:"turn",p:p.idx});
  await botBeat();
  // wind no longer force-moves anyone on a normal turn (see #7) — only storms still shove
  // ships around; a normal turn's wind only shapes this player's own sail budget below
  if(g.stormNow){
    const before=[...p.pos];
    const wasDocked=g.adjPort(p)!==null;
    const dodgedOnce={v:false};
    g.windPush(p,DIRS[g.windNow],2,dodgedOnce);
    g.windPush(p,DIRS[g.windNow2],2,dodgedOnce);
    p.justDocked=false;
    // windPush itself may already have logged a moored/dodge/anchor/aground event (none of which
    // move the ship) — narrate every time, not just on a position change, or the yellow panel goes
    // stale while those outcomes silently happen off-screen
    if(p.pos[0]!==before[0]||p.pos[1]!==before[1])g.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});
    await botBeat();
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
  if((dist>1||(dist===1&&exact))&&p.coins>0){
    p.coins--;const b=[...p.pos];g.stepToward(p,target,g.sailBudget(p));
    if(p.pos[0]!==b[0]||p.pos[1]!==b[1]){g.ev({t:"sail",p:p.idx});await botBeat();}else p.coins++;
  }
  if(!g.adjPort(p))p.dockedNow.clear();
  liveRender();
  // hail humans: locked-out bots offer coins for a crate they can't get any other way
  if(g.cfg.parley&&(appState.game.round-(p.lastOffer||-9))>=3){
    for(const ing of g.needs(p)){
      if(g.tokens[ing]>0)continue; // island still has crates — no need to beg
      const human=g.players.find(q=>q.strategy==="human"&&!q.done&&q.ing.includes(ing));
      if(human&&p.coins>=5){
        p.lastOffer=appState.game.round;
        setActor(human.idx);
        const choice=await ask(`📯 ${pn(p.idx)} hails you: "Ahoy! 5🌕 for your ${ilabelImg(ing)} — what say ye?"`,
          [{label:"Sell for 5🌕",value:"sell"},{label:"Counter",value:"counter"},{label:"Refuse",value:"refuse"}]);
        let price=5,dealt=choice==="sell";
        if(choice==="counter"){
          const raises=[6,7,8,9,10].filter(n=>n<=p.coins);
          const counterAmt=raises.length?await ask(`Counter — how much for your ${ilabelImg(ing)}?`,
            raises.map(n=>({label:`${n}🌕`,value:n})).concat([{label:"Never mind",value:0}])):0;
          if(counterAmt>0){price=counterAmt;dealt=true;} // the bot's only source is this trade, so it pays up if it can afford it
        }
        g.ev({t:"parley",a:p.idx,b:human.idx,offer:price+" coins",want:ing,ok:dealt});
        if(dealt){
          human.ing.splice(human.ing.indexOf(ing),1);p.ing.push(ing);
          p.coins-=price;human.coins+=price;g.trades++;
          if(g.cfg.tradeBonus){p.coins++;human.coins++;}
          g.ev({t:"trade",a:p.idx,b:human.idx,gave:price+" coins",got:ing,kind:"hail"});
        }
        await botBeat();
        break;
      }
    }
  }
  const action=g.chooseAction(p);
  if(action.type==="attack"){
    if(!g.tryTrade(p))await asyncBattle(p,action.target);
    await botBeat();return;
  }
  if(action.type==="trade"){g.tryTrade(p);await botBeat();return;}
  if(action.type==="dock"&&g.doDock(p,action.ing)){await botBeat();return;}
  // fallback: fish regardless of purse size — see the matching comment on the sim's takeTurn()
  await fishCast(p);
  await botBeat();
}
