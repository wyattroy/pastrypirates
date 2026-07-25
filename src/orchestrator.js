// src/orchestrator.js
//
// Phase 11 (SPLIT-03/05/06), wave 11-06. The orchestration layer — the 44 net-caller functions
// 11-analysis.json's `orchestration` tier identified (each calls a src/net/-backed function
// directly), plus the small handful of net-adjacent helpers (netFail, the chat/shot-clock sync
// cluster) that sit alongside them and were left classified only as "orchestration" by omission
// from the analysis's own function-name lists. This is the LAST tier of the classic <script>
// region: after this file absorbs everything below, index.html's classic script holds zero
// top-level `function` declarations (only bridge assembly + markup remain, per this phase's own
// goal state — the bridge itself is deleted in 11-07).
//
// Tier placement (scripts/module_graph_check.js): this file lives directly under `src/`, so it is
// inferred as tier "main" — the SAME composition-root tier src/main.js occupies. That is
// deliberate, not incidental: orchestration legitimately needs to import BOTH src/net/ (to drive
// sync) and src/ui/ (to render results), which is exactly the "main" tier's unrestricted-downward
// shape (D-06's flagged assumption explicitly allows "one src/orchestrator.js or several
// src/flow/*.js modules imported by main" — this wave chose the single-file form). src/ui/ itself
// is NEVER allowed to import this file (or src/net/ directly, D-07) — the module_graph_check.js
// tier shape for "ui" only permits shared/engine/state, and orchestrator's own tier is "main", not
// one of those three, so a ui->orchestrator import would fail the SAME shape assertion a
// ui->net import would. That asymmetry is why the many still-existing bare-identifier calls FROM
// src/ui/flow.js and src/ui/util.js INTO the functions below (broadcastFlip, netNarrate,
// netBroadcast, renderBattle, battleAsk, asyncBattle, remotePrompt, remoteDraftPrompt,
// logDecision, beginGame, broadcastClock, expireShotClock, and others — RESEARCH.md's own
// 11-04/11-05 SUMMARYs record these as deliberately left bare, "orchestration... homed in 11-06")
// are NOT converted to `import`s here — they stay bare, resolved through src/main.js's PP bridge
// exactly like every other still-bridged cross-reference this whole phase, now extended with this
// file's own exports (see src/main.js's own header for the mechanism, added in 11-06 task 3).
//
// Moved VERBATIM from the classic <script> region (byte-identical function bodies; only the
// bare-identifier reads that resolved via the PP bridge become real `import`s here) — this
// wave's two tasks split the 44+ functions into two commits:
//   Task 1: shot-clock/flip/chat sync, battle sync (incl. battleAsk/asyncBattle), presence,
//           meta/gamelog writers, applyEndMeta.
//   Task 2: room-lifecycle (createRoom/joinRoom/watchRoom/startGame/beginGame/wireLobby/boot),
//           prompt/response/draft plumbing, recovery, events/narr watchers, turn-flow orchestration.
//
// Deviation (positionChatBubble/removeChatBubble/clearChatBubbles NOT moved here): these three
// classic-script functions have ZERO net calls (11-analysis.json would classify them "ui (DOM)",
// not "orchestration") — they are pure chat-bubble DOM helpers that already live beside
// `chatBubbles` (the object they mutate) in src/ui/board.js (11-03). Moving them into THIS file
// would force src/ui/panel.js (which already imports render/boardCell/boardShipEls/chatBubbles
// FROM board.js) to import them from orchestrator.js instead — a ui->main edge the module graph's
// "ui -> shared/engine/state" shape assertion forbids, and board.js's own render() (already in
// board.js) calls positionChatBubble as a same-module sibling today, which a move here would
// break outright (board.js cannot import this "main"-tier file either). Moved into src/ui/board.js
// instead, alongside chatBubbles, as part of this wave's own Task 1 (see that file's own header
// note) — genuinely the correct home per D-06's file-split discretion, not a UI/orchestration
// misclassification on 11-analysis.json's part (the analyzer only scores net-calling functions
// into the orchestration tier; these three were always going to need a human placement call).
//
// Deviation (netFail NOT itemized in 11-RESEARCH.md/11-analysis.json's own function lists, moved
// here anyway): every one of the ~25 functions below that performs a Firebase write wraps its
// error callback in `netFail(label)` — omitting it from this file would leave every one of those
// call sites throwing ReferenceError the instant a write actually failed. Moved verbatim,
// unchanged, ahead of its first caller in this file (mirrors the classic script's own ordering:
// netFail was declared once, "networking plumbing" section, and used throughout).
//
// D-13 (watchRoom idempotency, Task 2): watchRoom() is invoked more than once per guest-join
// lifecycle (joinRoom() calls it, and a resumed/reconnected session's boot() path can call it
// again) — each call previously re-issued netWatchSeats()/netWatchStatus() unconditionally,
// tripping src/net/registry.js's "duplicate attach refused" ERROR-level log on the second call for
// the exact same room (its dedup key is scope|ref.toString()|event|label, and a repeat watchRoom()
// call for the SAME room produces an identical key both times). Fixed with a module-scope guard
// (`_watchRoomAttachedFor`) that skips re-attaching the two room-scoped watchers once they are
// already live for the current room — the read + lobby-view refresh above the guard still runs
// every time (harmless, and needed so a genuine re-entry still sees the current room state).

import { appState } from "./state/index.js";
import { Game, roundCfg, rollStorm } from "./engine/index.js";
import {
  PERP, DIRS, HEXCOL, CROWN_IMG, CLOSE_X_IMG, DEFAULT_NAMES, unusedDefaultName, iconImg, man,
  ilabelImg,
} from "./shared/index.js";
import {
  netSetFlip, netWatchFlip, netSetClock, netSetTimerOff, netWatchTimerOff, netWatchClock,
  netSetNarr, netPushChat, netWatchChat,
  netSetBattle, netWatchBattle, netRemoveBattle,
  netWatchConnected, netWatchPresence, netMarkPresence, netInit,
  netSetMeta, netWriteGameLog,
  netReadMeta, netUpdateRoom, netSetRecipes,
  netSetRecovery, netRemoveRecovery, netWatchRecovery,
  netPushEvent,
  netSetPrompt, netRemovePrompt, netWatchResponse, netDetach, netSetResponse,
  netSetDraftPrompt, netWatchDraftResponse, netRemoveDraftPrompt, netWatchDraftPrompt, netSetDraftResponse,
  netWatchEvents, netWatchPrompt, netWatchNarr,
  netSetDlog,
  netCreateRoom, netClaimSeat, netReadRoom, netWatchSeats, netWatchStatus,
  netSetTurnOrder, netWatchTurnOrder, netWatchRecipes,
  netLeaveRoom, netSetFeedback, netReadDlog, netReadEv,
} from "./net/index.js";
import {
  showNarration, panel, setNeedsAction, flash, narrateLastEvent, liveRender, setClockUI,
  appendChatLine, showChatBubble,
  setFlipActive, setFlipCoin, boardCell, boardShipEls, drawBoard, render, resetBoardLog,
  renderDecorativeBoard, syncBoardSizing, victoryConfetti, clearChatBubbles,
  battleSnapshot, renderBattleFromSnap, battleFooter, coinHTML, pipsHTML,
  collectSideBets, settleSideBets, asyncBakeoff, netIntroBarrier, showAhoyIntro, showTurnOrderIntro,
  reachable, pickCell, localAsk, humanTurn, botTurn, remotePickHighlights, wireRestoreFail,
  endReplay,
  showHome, showRoom, showGameView, renderSeatList, wireWelcome, buildPlayerRows, hideBootLoader,
  wireRecipeModal, recipeInfo, winRecipeSpan, recipeCardHTML, passGate,
  getMyId, preloadAssets, resumeSoloGame, genCode, saveSession, clearSession, seatStrat,
  encodeDec, decodeDec, saveSoloState, clearSoloState, fixEv, syncLogLines, spawnPops, apBtnStyle,
  rawName, pn, pname, updateRecipeBanner, toggleShotClockPause, describe, seatLocal,
  decisionIsLocal, resolveOpt, setActor, armClock, withShotClock, stepDelay, ask,
  stopShotClock, currentTurnSeat, rearmShotClock, waitWhilePaused,
} from "./ui/index.js";

// `$`/`sleep` are classic-script-local (index.html:863/:921) — see src/ui/board.js's/panel.js's
// own headers for the full precedent this mirrors. Reproduced verbatim as private module-locals;
// used well beyond this cluster (still-classic call sites this wave's own functions used to sit
// beside), so neither can simply "move" without breaking every other consumer.
const $=id=>document.getElementById(id);
const sleep=ms=>appState.replaying?Promise.resolve():waitWhilePaused().then(()=>new Promise(r=>setTimeout(r,ms)));

const MAX_CHAT_LEN=140;
// Firebase Spark's free tier caps at 100 simultaneous connections (see ONLINE_SETUP.md) — once
// we're seeing a meaningful fraction of that, warn on the home screen and point at solo play,
// which never touches Firebase at all. This is a soft warning, not a hard block: the real ceiling
// is enforced by Firebase itself, not by this count (which is necessarily a little stale/approximate).
const PRESENCE_WARN_THRESHOLD=80;

// visible fallback for a mid-game write that silently fails (e.g. connection refused because
// Spark's 100-connection cap is full) — without this a dropped write just looks like the game
// freezing with no explanation. Cleared automatically below once .info/connected goes true again.
function netFail(label){return e=>{console.error(label+" sync failed",e);const note=$("syncnote");if(note)note.style.display="";};}

// setFlipCoin/setFlipActive moved verbatim to src/ui/board.js (11-03).
// host: play the spin/land locally AND broadcast it so every connected browser's flippenator
// animates in sync, whether or not that browser is the one actually flipping
export function broadcastFlip(state){
  setFlipCoin(state);
  if(appState.isHost&&appState.db&&appState.room)netSetFlip(appState.db,appState.room,state,netFail("flip"));
}
export function watchFlip(){
  netWatchFlip(appState.db,appState.room,s=>{const v=s.val();if(v)setFlipCoin(v.state);});
}

export function broadcastClock(){
  setClockUI();
  if(appState.db&&appState.room)netSetClock(appState.db,appState.room,appState.shotClockSeat==null?null:{seat:appState.shotClockSeat,deadline:appState.shotClockDeadline},netFail("clock"));
}
// #7: any player may switch the turn timer off/on. The choice is written to Firebase so the whole
// table stays in sync; persisted locally so it sticks across games. The host reacts by stopping
// any running clock at once (so the current player is un-timed the moment anyone flips it off).
export function toggleTimer(){
  if(!appState.db||!appState.room)return;
  const next=!appState.timerOff;
  try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}
  netSetTimerOff(appState.db,appState.room,next,netFail("timerOff"));
}
export function watchTimer(){
  netWatchTimerOff(appState.db,appState.room,s=>{
    // notes/edits BUG-02: this callback only ever handled the on→off direction. Switching the
    // timer back on left the in-flight turn with no armed clock at all — startShotClock() is
    // only called at the START of a turn (armClock), so nothing re-armed the turn already in
    // progress. That is the "I paused the timer and then the game wouldn't continue" report.
    const was=appState.timerOff;
    appState.timerOff=!!s.val();
    if(appState.isHost&&appState.timerOff)stopShotClock();
    else if(appState.isHost&&was&&!appState.timerOff&&appState.shotClockSeat==null&&!appState.turnExpired){
      // shotClockSeat==null is what prevents double-arming: this callback fires on EVERY client
      // for every write, so the host also runs it for a write a guest originated.
      const seat=currentTurnSeat();
      const p=seat!=null?appState.game.players[seat]:null;
      if(p&&!p.done)rearmShotClock(p);
    }
    setClockUI();
  });
}
// notes/edits #1 audit: this was a bare netNarrate() with no hold/fade at all — the shot-clock
// penalty text could get clobbered the instant the next event fires, with no guaranteed read
// time whatsoever. async + flash() now gives it the same length-aware timing as every other
// narration. Called from a setInterval tick (shotClockTick) that doesn't await it — fine, since
// this is a one-shot side effect with nothing downstream depending on its completion order.
export async function expireShotClock(){
  // notes/edits #9: shotClockTick() is a setInterval that keeps ticking every 500ms while this
  // async function is mid-flight (its awaits below routinely run well past 500ms) — without
  // clearing the interval and blocking re-entry synchronously, right here, before any await, the
  // still-running tick fires this function again on top of itself and strips a second resource
  // for the same expiry ("snoozing pirates lose their treasure" firing more than once).
  if(appState.shotClockTimer){clearInterval(appState.shotClockTimer);appState.shotClockTimer=null;}
  const p=appState.game.players[appState.shotClockSeat];
  appState.shotClockSeat=null;
  appState.turnExpired=true;
  // BUG-02: a null resolver here is a real, distinguishable state, not an ordinary no-op — it
  // means the decision in flight was created before a timer-off and its resolver was never
  // handed back (see stopShotClock/rearmShotClock). Degrade loudly rather than silently letting
  // the countdown expire while nothing actually resolves the promise.
  if(appState.shotClockForce){appState.shotClockForce();appState.shotClockForce=null;}
  else if(appState.shotClockStash)console.warn("shot clock expired with a stashed resolver for seat",appState.shotClockStash.seat,"— auto-skip degraded");
  if(appState.activePickCleanup){appState.activePickCleanup();appState.activePickCleanup=null;}
  if(p){
    let lost;
    if(p.ing.length){
      const idx=Math.floor(appState.game.r()*p.ing.length);
      lost=p.ing.splice(idx,1)[0];
      appState.game.tokens[lost]++;   // crate goes back into that island's supply, not lost forever
      appState.game.ev({t:"shotclockskip",p:p.idx,ing:lost});
      await flash(`⏰ Snoozing pirates lose their treasure! ${pn(p.idx)} loses the turn — a crate of ${ilabelImg(lost)} tumbles overboard and floats back to its island.`);
    }else{
      const take=Math.min(5,p.coins);
      p.coins-=take;
      appState.game.ev({t:"shotclockskip",p:p.idx,coins:take});
      await flash(`⏰ Snoozing pirates lose their treasure! ${pn(p.idx)} loses the turn — ${take}🌕 tumbles overboard!`);
    }
    liveRender();
    if(!seatLocal(p.idx)&&appState.db&&appState.room)netRemovePrompt(appState.db,appState.room,netFail("prompt clear"));
  }
  stopShotClock();
}
export function watchClock(){
  netWatchClock(appState.db,appState.room,s=>{appState.clockState=s.val();setClockUI();});
}

// ---- narration: shown to everyone in the yellow action panel (no separate banner) ----
export function netNarrate(html){if(appState.replaying)return;showNarration(html);if(appState.isHost&&appState.db&&appState.room)netSetNarr(appState.db,appState.room,html,netFail("narration"));}
// broadcast narration to spectators WITHOUT touching this screen's panel — used during
// battles so the local scoreboard (coins) stays put while others still get the play-by-play
export function netBroadcast(html){if(appState.replaying)return;if(appState.isHost&&appState.db&&appState.room)netSetNarr(appState.db,appState.room,html,netFail("narration"));}

// ---- chat: free-text messages between human players. Unlike narr/ev (host-authoritative),
// every client sends and listens directly — there's no single "who computes this" owner. Nothing
// is persisted: messages are pushed to a per-room list that's wiped by startGame()'s reset (like
// narr/ev/dlog) and never written to gamelogs.
export function sendChat(raw){
  if(!appState.db||!appState.room)return;
  const text=(raw||"").trim().slice(0,MAX_CHAT_LEN);
  if(!text)return;
  const now=Date.now();
  if(now-appState.lastChatSendAt<1000)return; // basic client-side spam guard (RTDB rules can't rate-limit without auth)
  appState.lastChatSendAt=now;
  netPushChat(appState.db,appState.room,{seat:appState.mySeat,text,t:now},e=>console.error("chat write failed",e));
}
// appendChatLine moved verbatim to src/ui/panel.js (11-04).
export function watchChat(){
  netWatchChat(appState.db,appState.room,snap=>{
    const v=snap.val();if(!v)return;
    appendChatLine(v.seat,v.text);
    showChatBubble(v.seat,v.text);
  });
}

// The battle scoreboard: names, a static result circle per fighter, and pips. The coin never
// spins here — every flip in the game (battles included) physically happens on the shared
// flippenator; this just displays whatever it last landed on for each fighter.
export function renderBattle(o){
  if(appState.replaying)return;          // silent during reload-replay, like liveRender
  const nm=i=>pname(i),col=i=>HEXCOL[i];
  const A=o.att,D=o.def,need=o.need||3,title=o.title||"⚔️ Broadside Battle";
  panel(`<div class="btl">
    <div class="btl-hd"><span>${title}</span><span class="rnd">Round ${o.round} · first to ${need}</span></div>
    <div class="btl-body">
      <div class="btl-col${o.live==="a"?" live":""}">
        <div class="who" style="color:${col(A.idx)}">${nm(A.idx)}</div>
        <div class="role">${o.roleA||"Attacker"}</div>
        ${coinHTML(o.atState,o.atBs,o.winCoin==="a")}
        ${pipsHTML(o.a,col(A.idx),need)}
      </div>
      <div class="btl-mid">VS</div>
      <div class="btl-col${o.live==="d"?" live":""}">
        <div class="who" style="color:${col(D.idx)}">${nm(D.idx)}</div>
        <div class="role">${o.roleD||"Defender"}</div>
        ${coinHTML(o.dfState,o.dfBs,o.winCoin==="d")}
        ${pipsHTML(o.d,col(D.idx),need)}
      </div>
    </div>
    ${battleFooter(o)}
  </div>`,!!o.prompt);
  // broadcast the read-only scoreboard (never buttons) so every connected client — not just
  // whoever's deciding — sees the same battle unfold in real time
  if(appState.isHost&&appState.db&&appState.room&&!appState.replaying)netSetBattle(appState.db,appState.room,battleSnapshot(o),netFail("battle"));
}
// battleSnapshot/renderBattleFromSnap moved verbatim to src/ui/flow.js (11-05).
export function watchBattle(){
  netWatchBattle(appState.db,appState.room,s=>{
    const v=s.val();
    if(v){appState.spectatingBattle=true;if(!appState.inBattlePrompt)renderBattleFromSnap(v);}
    else appState.spectatingBattle=false; // battle node cleared at battle end — narration may take over again
  });
}
// battleFooter moved verbatim to src/ui/flow.js (11-05).
// A battle decision that keeps the coins on screen: the scoreboard (o) renders with the
// prompt buttons tucked beneath it, so nothing about the layout jumps when it's your turn.
export function battleAsk(p,o,msg,opts,colors){
  // same record/replay contract as ask(): log the chosen index, replay it through fresh opts
  if(appState.replaying){
    if(appState.dlogIdx<appState.dlog.length){appState.dlogN++;return Promise.resolve(resolveOpt(opts,appState.dlog[appState.dlogIdx++],opts.length-1).opt.value);}
    endReplay();
  }
  setActor(p.idx);
  const seat=p.idx;
  const isFlip=opts.length===1&&!!opts[0].flip;
  // every battle decision — flip or yes/no — re-arms the clock to whoever's actually
  // being asked, same as ask(); a forced timeout just resolves to the flip itself
  armClock(seat);
  // spectators (and, crucially, the OTHER combatant) get a battle-aware nudge that names who's
  // attacking whom instead of a bare "…is deciding" — so when a bot attacks a human on the bot's
  // turn, the table can see it's the human's defend flip and nudge them (see #11).
  const spectMsg=(o&&o.att&&o.def)
    ?(seat===o.def.idx?`⚔️ ${pn(o.att.idx)} attacks ${pn(o.def.idx)}! Waiting for ${pname(o.def.idx)} to defend…`
      :`⚔️ ${pn(o.att.idx)} attacks ${pn(o.def.idx)} — waiting for ${pname(seat)}…`)
    :`${pn(seat)} is deciding…`;
  netBroadcast(seat===appState.mySeat?msg:spectMsg);
  let idxP;
  if(decisionIsLocal(seat)){
    idxP=new Promise(res=>{
      if(isFlip){
        // the scoreboard just shows state — the flippenator is the actual control
        renderBattle(o);
        setNeedsAction(true);
        setFlipActive(()=>{setFlipActive(null);setNeedsAction(false);res(0);});
      }else{
        renderBattle(Object.assign({},o,{prompt:{msg,opts,colors}}));
        $("actionPanel").querySelectorAll(".btlBtn").forEach(b=>{
          b.onclick=()=>res(+b.dataset.i);
        });
      }
    });
  }else{
    renderBattle(Object.assign({},o,{waiting:pn(seat)}));
    idxP=remotePrompt(seat,{kind:"ask",msg,labels:opts.map(x=>x.label),
      colors:colors?colors.map(c=>c||""):null,classes:opts.map(()=>""),
      flip:isFlip,battle:battleSnapshot(o)});
  }
  const wrapped=withShotClock(seat,idxP,opts.length-1);
  return wrapped.then(i=>{const r=resolveOpt(opts,i,opts.length-1);logDecision(r.i);return r.opt.value;});
}
// collectSideBets/settleSideBets moved verbatim to src/ui/flow.js (11-05).
export async function asyncBattle(att,def){
  const c=appState.game.cfg,need=2;
  await flash(`⚔️ ${pn(att.idx)} attacks ${pn(def.idx)}! First to ${need} points wins…`,Math.max(900,stepDelay()));
  if(c.powder)att.coins-=c.powder;
  appState.game.battles++;
  const bets=await collectSideBets(att,def);
  let a=0,d=0;
  // notes/edits BATL-01/02: reflips removed (attacker broadside + downwind free reflip both gone).
  // Wind still decides a both-HEADS round via `downwind` — the geometric fact of who fires with the
  // wind, never consumed. Crosswind both-heads still cancels. Kept in step with Game.battle.
  let downwind=null;
  {
    const dx=def.pos[0]-att.pos[0],dy=def.pos[1]-att.pos[1];
    const dirAtoD=Object.keys(DIRS).find(k=>DIRS[k][0]===dx&&DIRS[k][1]===dy);
    const dirDtoA=Object.keys(DIRS).find(k=>DIRS[k][0]===-dx&&DIRS[k][1]===-dy);
    if(appState.game.windNow===dirAtoD)downwind="a";
    else if(appState.game.windNow===dirDtoA)downwind="d";
  }
  let fled=false;
  const rounds=[];
  const hA=att.strategy==="human",hD=def.strategy==="human";
  let round=0;
  const nm=pn;
  const bd=(typeof stepDelay==="function")?stepDelay():500;
  const spin=Math.max(260,Math.min(650,bd*0.7));  // coin tumble time
  const beat=Math.max(300,Math.min(900,bd*0.9));  // suspense pause before the defender answers
  const hold=Math.max(500,Math.min(1500,bd*1.1)); // pause to read the round result
  const base=o=>Object.assign({att,def,a,d,round,need},o);
  // Every flip — human or bot — physically happens on the shared flippenator: spin, land,
  // then the result is copied into this fighter's result circle in the scoreboard.
  const hFlip=async(side,p,label,extra)=>{
    extra=extra||{};
    const key=side==="a"?"atState":"dfState";
    await battleAsk(p,base(Object.assign({live:side,[key]:"wait"},extra)),
      label,[{label:"🌕 FLIP!",value:1,flip:true}]);
    broadcastFlip("spin");
    await sleep(spin);
    const h=appState.game.flip(p);
    broadcastFlip(h?"H":"T");
    netBroadcast(`${pn(p.idx)} flips ${h?"⚪ HEADS!":"⚫ TAILS"}`);
    renderBattle(base(Object.assign({live:side,[key]:h?"H":"T"},extra)));
    await sleep(Math.min(hold*0.5,500));
    broadcastFlip("wait");
    return h;
  };
  // a bot's flip: same flippenator spin, just no button to wait on
  const bFlip=async(side,p,extra)=>{
    extra=extra||{};
    const key=side==="a"?"atState":"dfState";
    renderBattle(base(Object.assign({live:side,[key]:"wait"},extra)));
    broadcastFlip("spin");
    await sleep(spin);
    const h=appState.game.flip(p);
    broadcastFlip(h?"H":"T");
    await sleep(300);
    broadcastFlip("wait");
    return h;
  };
  while(a<need&&d<need){
    round++;
    const bs=false;   // BATL-01/02: no reflips, so a round is never a "broadside" round anymore
    let ah,dh;
    // fresh round — both coins face-down, attacker on deck. Round 1 spells out who's who; later
    // rounds trim the repeated framing since the flippenator/scoreboard already shows it visually
    // (notes/edits #8b: cut the boilerplate that re-stated the same roles every single flip).
    renderBattle(base({atState:"wait",dfState:"wait",live:"a",result:round===1?`${nm(att.idx)} loads the cannon…`:"Reload…"}));
    await sleep(beat*0.5);
    // ---- ATTACKER flips ----
    if(hA){
      ah=await hFlip("a",att,round===1?`⚔️ ${nm(att.idx)} (attacker) — fire!`:"⚔️ Fire!",{dfState:"wait"});
    }else{
      ah=await bFlip("a",att,{dfState:"wait"});
    }
    renderBattle(base({atState:ah?"H":"T",dfState:"wait",live:"a"}));
    // BATL-01: the attacker's broadside reflip is gone — a tails just stands.
    // ---- suspense: hand it to the defender ----
    await sleep(beat*0.6);
    renderBattle(base({atState:ah?"H":"T",atBs:bs,dfState:"wait",live:"d",
      result:round===1?`${nm(att.idx)} shows ${ah?"HEADS":"TAILS"} — ${nm(def.idx)} must answer…`:`${ah?"HEADS":"TAILS"} — ${nm(def.idx)}'s answer…`}));
    await sleep(beat);
    // ---- DEFENDER flips ----
    if(hD){
      dh=await hFlip("d",def,round===1?`⚔️ ${nm(att.idx)} attacks you — defend! FLIP`:"⚔️ Defend! FLIP",{atState:ah?"H":"T",atBs:bs});
    }else{
      dh=await bFlip("d",def,{atState:ah?"H":"T",atBs:bs});
    }
    // BATL-02: the downwind defender's free reflip is gone — the wind's only effect now is the
    // both-HEADS tiebreak resolved just below.
    // ---- resolve the round ----
    let scorer=null,rmsg;
    // notes/edits #3: two HEADS no longer just cancel — the shot carries downwind. Whoever's
    // firing with the wind lands the hit; if neither is downwind (crosswind), they still cancel.
    if(ah&&dh){
      if(downwind==="a"){a++;scorer="a";rmsg=`<span class="score">Both fire HEADS — but ${nm(att.idx)}'s downwind and the shot carries! +1</span>`;}
      else if(downwind==="d"){d++;scorer="d";rmsg=`<span class="score">Both fire HEADS — but ${nm(def.idx)}'s downwind and the shot carries! +1</span>`;}
      else rmsg=`<span class="cancel">Both fire HEADS — crosswind, cannonballs collide, no damage.</span>`;
    }
    else if(ah){a++;scorer="a";rmsg=`<span class="score">${nm(att.idx)} lands a hit! +1</span>`;}
    else if(dh){d++;scorer="d";rmsg=`<span class="score">${nm(def.idx)} lands a hit! +1</span>`;}
    else{rmsg=`<span class="cancel">Both miss — TAILS all round.</span>`;}
    // notes/edits #23: record who actually scored the round (not just the raw flip pattern) —
    // a both-heads downwind round scores a real point but doesn't fit the "a XOR d landed heads"
    // shape, so anything deriving the displayed score from raw flips alone undercounts it.
    rounds.push([ah?1:0,dh?1:0,bs?1:0,scorer]);
    renderBattle(base({atState:ah?"H":"T",atBs:bs,dfState:dh?"H":"T",live:null,winCoin:scorer,result:rmsg}));
    await sleep(hold);
    // ---- defender's flee: on a double-TAILS round (both shots miss wildly) the defender can pay
    // 1🌕 to slip away (notes/edits #3). Because a double-tails round scores no one, the battle is
    // still undecided here (a<need && d<need both hold) — so flee can never fire post-decision (#9). ----
    const bothTails=!ah&&!dh;
    if(bothTails&&a<need&&d<need&&def.coins>=1){
      const cells=reachable(def,3);
      if(cells.length){
        let flee;
        if(hD){setActor(def.idx);flee=await ask(`${nm(def.idx)}: both shots missed wildly! Pay 1🌕 to slip away and flee the battle?`,
          [{label:"🏃 Flee! (−1🌕)",value:true},{label:"Keep fighting",value:false}]);}
        else flee=d<a; // bots flee a losing fight, press on if ahead or even
        if(flee){
          def.coins--;
          const dest=hD?await pickCell(def,cells):cells.reduce((best,cc)=>man(cc,att.pos)>man(best,att.pos)?cc:best,cells[0]);
          if(dest){def.pos=dest;appState.game.tradewind(def);}
          for(const bet of bets)appState.game.players[bet.idx].coins+=bet.amt; // no winner — refund side bets
          fled=true;
          appState.game.recordSkirmish(att,def,null); // fleeing settles nothing, but cools "rich" re-triggers
          appState.game.ev({t:"battleflee",a:att.idx,d:def.idx,rounds});
          liveRender();
          break;
        }
      }
    }
  }
  panel("");
  // battle's over — clear the broadcast scoreboard so every client's watchNarr can take the panel
  // back for the result narration (and so spectatingBattle resets). (#9)
  if(appState.isHost&&appState.db&&appState.room&&!appState.replaying)netRemoveBattle(appState.db,appState.room,netFail("battle clear"));
  if(fled)return;
  const win=a>=need?att:def,lose=a>=need?def:att;
  if(win===att)appState.game.attWins++;
  let spoil,spoilIng=null;
  if(c.asym&&lose===att){
    const take=Math.min(2,lose.coins);lose.coins-=take;win.coins+=take;spoil=take+"c (raider)";
  }else{
    const canCoins=lose.coins>=5,hasIng=lose.ing.length>0;
    let mode;
    if(canCoins&&hasIng){
      if(lose.strategy==="human"){setActor(lose.idx);
        mode=await ask(`${pn(lose.idx)}, you lost! Pay with…`,
          [{label:"5🌕",value:"coins"},{label:"a crate (winner picks)",value:"ing"}]);}
      else{const w2=lose.ing.filter(i=>appState.game.needs(win).includes(i));mode=w2.length?"ing":"coins";}
    }else if(hasIng)mode="ing";else mode="coins";
    if(mode==="coins"){const take=Math.min(5,lose.coins);lose.coins-=take;win.coins+=take;spoil=take+" coins";}
    else{
      let pick;
      const uniq=[...new Set(lose.ing)];
      if(win.strategy==="human"&&uniq.length>1){setActor(win.idx);
        pick=await ask(`${pn(win.idx)}, choose your plunder!`,uniq.map(i=>({label:ilabelImg(i),value:i})));}
      else{const w2=lose.ing.filter(i=>appState.game.needs(win).includes(i));pick=w2[0]||lose.ing[0];}
      lose.ing.splice(lose.ing.indexOf(pick),1);win.ing.push(pick);spoil=ilabelImg(pick);spoilIng=pick;
    }
  }
  // notes/edits BATL-03: no post-battle swap — the winning attacker stays put and the beaten
  // defender is no longer dumped into the prime re-attack square in front of them. With nobody
  // changing berth there's also no post-battle re-dock. Kept in step with Game.battle.
  appState.game.recordSkirmish(att,def,lose,spoilIng);
  appState.game.ev({t:"battle",a:att.idx,d:def.idx,rounds,winner:win.idx,spoil,spoilIng});
  liveRender();
  // narrate the battle's outcome (who took what from whom) right now — side-bet settlement pushes
  // further events right after this, and every caller only narrates the *last* event once
  // asyncBattle returns, so without this the battle's own narration gets buried under what follows.
  await narrateLastEvent();
  await settleSideBets(bets,a>=need?"a":"d");
  return win;
}
// asyncBakeoff moved verbatim to src/ui/flow.js (11-05).

export function writeMeta(){
  if(!appState.db||!appState.room||appState.replaying)return Promise.resolve();
  return netSetMeta(appState.db,appState.room,{
    round:appState.game.round,battles:appState.game.battles,trades:appState.game.trades,attWins:appState.game.attWins,
    finishOrder:appState.game.finishOrder,winner:appState.game.winner,
    flips:appState.game.players.map(p=>p.flips),heads:appState.game.players.map(p=>p.heads)},netFail("game meta"));
}
// Every finished game (solo or multiplayer) writes its full move-by-move transcript to a
// permanent, room-independent path — rooms/{room}/ev is cleared on the next game in that room,
// so this is the only durable copy for later analysis. Only the host writes it (this function
// only ever runs from the host's own turn loop), so there's no risk of duplicate writes.
export function writeGameLog(){
  if(!appState.db||appState.replaying)return Promise.resolve();
  const ts=Date.now();
  return netWriteGameLog(appState.db,ts,{
    ts,room:appState.room||null,winner:appState.game.winner,round:appState.game.round,
    battles:appState.game.battles,trades:appState.game.trades,strategies:appState.game.cfg.strategies,
    // names/bots are recorded per seat so solo & local games (no rooms/{code}/seats node) are still
    // attributable — events reference players by seat index, so this is the key to reading them back.
    // Consistent with the lobby's data-collection notice ("nothing beyond the name you type").
    names:appState.game.players.map((_,i)=>rawName(i)),
    bots:appState.game.players.map(p=>p.strategy!=="human"),
    events:JSON.parse(JSON.stringify(appState.game.events))
  },netFail("game log"));
}

/* ================= networking plumbing ================= */
/* Firebase config and cfgReady() moved to src/net/index.js (Phase 9, SPLIT-04) — values copied
   byte-for-byte, see ONLINE_SETUP.md for how to point this at your own Firebase project. */
export function watchPresence(){
  // best-effort: an older Firebase project whose rules predate this feature (no "presence" node
  // yet — see ONLINE_SETUP.md) will permission-deny these; fail silently rather than spam the
  // console or block anything, since this is a nice-to-have busy indicator, not core gameplay.
  netWatchConnected(appState.db,snap=>{
    if(snap.val()===true){
      netMarkPresence(appState.db,appState.myId);
      const note=$("syncnote");if(note)note.style.display="none";
    }
  },()=>{});
  netWatchPresence(appState.db,snap=>{
    const busy=snap.numChildren()>=PRESENCE_WARN_THRESHOLD;
    const note=$("busynote");if(note)note.style.display=busy?"":"none";
  },()=>{});
}
export function fbInit(){
  appState.db=netInit();
  if(!appState.db)return false;
  watchPresence();
  return true;
}

export async function applyEndMeta(){
  if(appState.isHost||appState.appliedMeta)return;
  appState.appliedMeta=true;
  const m=(await netReadMeta(appState.db,appState.room)).val();
  if(!m)return;
  appState.game.round=m.round;appState.game.battles=m.battles;appState.game.trades=m.trades;appState.game.attWins=m.attWins;
  appState.game.finishOrder=m.finishOrder||[];appState.game.winner=m.winner;
  (m.flips||[]).forEach((f,i)=>{if(appState.game.players[i]){appState.game.players[i].flips=f;appState.game.players[i].heads=(m.heads||[])[i]||0;}});
  appState.liveDone=true;render();
}

/* ================= host game loop (networked) ================= */
// Every human seat drafts at the same time instead of taking turns. Bots resolve instantly.
// Decisions are still logged in a fixed (seat-index) order regardless of who actually
// finishes first, so a host-reload replay can deterministically reconstruct the same picks.
export async function recipeDraftNet(){
  const picks=[];
  const humans=appState.game.players.filter(p=>p.recipeChoices&&p.strategy==="human");
  const bots=appState.game.players.filter(p=>p.recipeChoices&&p.strategy!=="human");
  for(const p of bots)picks[p.idx]=appState.game.r()<.5?0:1;
  const pending=[];
  for(const p of humans){
    if(appState.replaying){
      if(appState.dlogIdx<appState.dlog.length){appState.dlogN++;picks[p.idx]=appState.dlog[appState.dlogIdx++];continue;}
      endReplay();
    }
    pending.push(p);
  }
  if(pending.length){
    const msgFor=p=>`${pn(p.idx)}, choose your recipe — bake it by gathering every ingredient, then sail home to win:`;
    const optsFor=p=>[{label:recipeCardHTML(p.recipeChoices[0]),value:0,cls:"recipeCard"},
                       {label:recipeCardHTML(p.recipeChoices[1]),value:1,cls:"recipeCard"}];
    if(appState.passAndPlay){
      // one device, secret options: draft in turn, each gated by the pass-the-device screen
      // so nobody's two recipe choices are ever on screen for the seat that comes next
      for(const p of pending){
        await passGate(p.idx);
        setActor(p.idx);
        const i=await localAsk(msgFor(p),optsFor(p));
        picks[p.idx]=i;logDecision(i);
      }
    }else{
      netBroadcast(pending.length>1?"⚓ Everyone's choosing their recipe…":`${pn(pending[0].idx)} is choosing a recipe…`);
      const results={};
      const jobs=pending.map(p=>{
        setActor(p.idx);
        if(seatLocal(p.idx))return localAsk(msgFor(p),optsFor(p)).then(i=>{
          results[p.idx]=i;
          if(pending.length>1)showNarration("⚓ Recipe chosen! Waiting for the rest of the crew…");
        });
        return remoteDraftPrompt(p.idx,msgFor(p),optsFor(p)).then(i=>{results[p.idx]=i;});
      });
      await Promise.all(jobs);
      for(const p of pending){picks[p.idx]=results[p.idx];logDecision(results[p.idx]);}
    }
  }
  appState.game.players.forEach(p=>{if(p.recipeChoices)p.recipe=p.recipeChoices[picks[p.idx]];});
  if(appState.db&&appState.room&&!appState.replaying)await netSetRecipes(appState.db,appState.room,picks,netFail("recipe picks"));
  if(!appState.replaying)updateRecipeBanner();
  liveRender();
}
export async function runLiveNet(){
  await showAhoyIntro();
  // turn order is randomized once here and never rotates — a one-time first-player advantage,
  // not something that cycles away round to round
  let order=appState.game.players.map((_,i)=>i);
  appState.game.shuffle(order);
  // staggered starting coins level that one-time edge: sim-tested (see cocoa_pirates_sim.py
  // "staggeredcoins" mode) to flatten the first-mover advantage without overcorrecting to favor
  // whoever goes last
  order.forEach((i,pos)=>{appState.game.players[i].coins=appState.game.cfg.startCoins+pos;});
  appState.turnOrder=order.slice();buildPlayerRows();
  if(!appState.replaying&&appState.db&&appState.room)netSetTurnOrder(appState.db,appState.room,order,netFail("turn order"));
  await showTurnOrderIntro(order);
  await recipeDraftNet();
  let ended=false;
  while(appState.game.round<150&&!ended){
    appState.game.round++;
    appState.game.windNow="NSEW"[Math.floor(appState.game.r()*4)];
    appState.game.stormNow=rollStorm(appState.game); // #1a: no more than 2 storms back-to-back
    appState.game.windNow2=appState.game.stormNow?PERP[appState.game.windNow][Math.floor(appState.game.r()*2)]:null;
    appState.game.ev({t:"newround",dir:appState.game.windNow,dir2:appState.game.windNow2,streak:appState.game.stormNow?appState.game.stormStreak:0,windStreak:appState.game.noteWind(appState.game.windNow)});liveRender(); // NARR-04
    // wind direction (and any storm) used to be visible only in the captain's log — call it
    // out in the yellow panel too, briefly, so it's not missed
    await flash(describe(appState.game.events[appState.game.events.length-1]).txt,900);
    for(const i of order){
      const p=appState.game.players[i];
      if(p.done)continue;
      await (p.strategy==="human"?humanTurn(p):botTurn(p));
      if(appState.game.checkFinish(p)){
        liveRender();
        if(appState.game.finishOrder.length===1){
          // FINAL ROUND (#19): the first ship reached Tortuga and fired up the bakery. Alert the
          // whole crew with a blocking barrier, spin the wind ANEW for the last lap, then give
          // every other captain exactly ONE more turn — continuing the SAME rotation from the seat
          // right after the finisher (not restarting `order` from the top, which scrambled the
          // apparent turn order). netIntroBarrier self-skips during host-refresh replay, and the
          // wind re-spin's game.r() calls run identically live and on replay, so state stays
          // deterministic.
          await netIntroBarrier(`🏁 ${pn(i)} reached the Isle of Tortuga and fired up the bakery! Last chance, crew — every other captain gets ONE final turn to race home!`,"🦜 Final round — set sail!");
          appState.game.round++;
          appState.game.windNow="NSEW"[Math.floor(appState.game.r()*4)];
          appState.game.stormNow=rollStorm(appState.game); // #1a
          appState.game.windNow2=appState.game.stormNow?PERP[appState.game.windNow][Math.floor(appState.game.r()*2)]:null;
          appState.game.ev({t:"newround",dir:appState.game.windNow,dir2:appState.game.windNow2,streak:appState.game.stormNow?appState.game.stormStreak:0,windStreak:appState.game.noteWind(appState.game.windNow)});liveRender(); // NARR-04
          await flash(describe(appState.game.events[appState.game.events.length-1]).txt,900);
          const startPos=order.indexOf(i);
          const lastLap=order.slice(startPos+1).concat(order.slice(0,startPos));
          for(const j of lastLap){
            const q=appState.game.players[j];
            if(q.done)continue;
            await (q.strategy==="human"?humanTurn(q):botTurn(q));
            if(appState.game.checkFinish(q))liveRender();
          }
          ended=true;break;
        }
      }
    }
  }
  await liveResolveEndNet();
  if(appState.replaying)endReplay();   // whole game was in the log: leave replay mode & paint the result
}
export async function liveResolveEndNet(){
  if(!appState.game.finishOrder.length)appState.game.winner=null;
  else if(appState.game.finishOrder.length===1)appState.game.winner=appState.game.finishOrder[0];
  else{
    let champ=appState.game.players[appState.game.finishOrder[0]];
    for(const idx of appState.game.finishOrder.slice(1))champ=await asyncBakeoff(champ,appState.game.players[idx]);
    appState.game.winner=champ.idx;
  }
  appState.liveDone=true;
  appState.game.ev({t:"end",winner:appState.game.winner});
  await writeMeta();
  await writeGameLog();
  liveRender();
  // notes/edits EOV-02/EOV-05: the win gets its OWN one-off celebratory box, with the winner's
  // finished recipe pictured right in it (the recipe image lives here now, not in the End of Voyage
  // summary — see showStats). EOV-01 already stripped the duplicate blue-box announcement.
  if(appState.game.winner==null){
    await flash("⏳ Nobody finished the voyage.");
  }else{
    const wi=recipeInfo(appState.game.players[appState.game.winner].recipe);
    const pic=wi&&wi.img?`<img class="victoryRecipe" src="${wi.img}" alt="">`:"";
    await flash(`<div class="victoryBox">${pic}<div class="victoryText">${iconImg(CROWN_IMG)} ${pn(appState.game.winner)} baked a ${winRecipeSpan(appState.game.winner)} and won <b>Best Baker in the Caribbean!</b></div></div>`);
    victoryConfetti(appState.game.winner); // EOV-05: a burst of celebration over the board
  }
  if(appState.db&&appState.room&&!appState.replaying)netUpdateRoom(appState.db,appState.room,{status:"ended"},netFail("game end"));
}

// host (live): append a resolved human decision to the shared, ordered log. Issued BEFORE the
// decision's resulting events are pushed, so the log can never lag the broadcast event feed.
export function logDecision(v){
  const n=appState.dlogN++;
  if(!appState.replaying){
    // dlog holds plain decoded values everywhere else it's read (ask/pickCell/battleAsk all treat
    // dlog[dlogIdx] as the resolved value itself, e.g. resumeHostGame decodes Firebase's wrapper
    // objects into plain values before assigning to dlog) — so push the plain value here too, not
    // the encoded {v:...}/{n:1} wrapper, which is a Firebase-only transport detail.
    appState.dlog.push(v);                  // kept locally too (harmless in multiplayer — resumeHostGame
                                    // overwrites it from Firebase — but it's the only copy solo has)
    if(appState.room)netSetDlog(appState.db,appState.room,n,encodeDec(v),netFail("decision log"));
    else saveSoloState();
  }
}
// D-08: tell the crew their captain is mid-repair. Guests watch only ev/prompt/narr/flip/battle/
// clock/timerOff/draftPrompts/response/chat — none of which can carry this — so it gets its own
// small node rather than overloading prompt's payload shape. Host-only, guarded like broadcastClock.
export function setRecoveryState(state){
  if(!appState.isHost||!appState.db||!appState.room)return;
  if(state)netSetRecovery(appState.db,appState.room,{state,at:Date.now()},netFail("recovery"));
  else netRemoveRecovery(appState.db,appState.room,netFail("recovery"));
}
// guest side: purely presentational. A guest is render-only in this architecture, so this may only
// show/hide the strip — never reconcile or re-fetch game state.
export function watchRecoveryState(){
  netWatchRecovery(appState.db,appState.room,s=>{
    const v=s.val();
    const note=$("recoverynote");
    if(note)note.style.display=(v&&v.state)?"":"none";
  });
}
// host: broadcast new events to the shared feed
export function pushEvents(){
  if(!appState.db||!appState.room)return;
  while(appState.evPushed<appState.game.events.length){
    netPushEvent(appState.db,appState.room,JSON.parse(JSON.stringify(appState.game.events[appState.evPushed])),netFail("event feed"));
    appState.evPushed++;
  }
}
// host: ask a remote seat's owner to decide, wait for their answer
export function remotePrompt(seat,payload){
  const id="q"+(appState.promptCounter++)+"_"+Date.now();
  netSetPrompt(appState.db,appState.room,Object.assign({id,seat},payload),netFail("prompt"));
  return new Promise(res=>{
    let wid;
    const cb=snap=>{const v=snap.val();
      if(v&&v.id===id){netDetach(wid);netRemovePrompt(appState.db,appState.room,netFail("prompt clear"));
        res(v.choice===undefined?null:v.choice);}};
    wid=netWatchResponse(appState.db,appState.room,cb,"response:"+id);
  });
}
// remote: post my answer back to the host
export function sendResponse(id,choice){
  const o={id};
  if(choice!==null&&choice!==undefined)o.choice=choice;
  netSetResponse(appState.db,appState.room,o,netFail("response"));
  panel("");
}
// Parallel prompt/response path used only for concurrent recipe drafting — a per-seat node
// so several remote seats can each have an outstanding question at once, unlike the singular
// rooms/{room}/prompt above which only ever holds one.
export function remoteDraftPrompt(seat,msg,opts,waitMsg){
  const id="d"+(appState.promptCounter++)+"_"+Date.now();
  netSetDraftPrompt(appState.db,appState.room,seat,{id,seat,msg,waitMsg:waitMsg||null,
    labels:opts.map(o=>o.label),classes:opts.map(o=>o.cls||"")},netFail("recipe prompt"));
  return new Promise(res=>{
    let wid;
    const cb=snap=>{const v=snap.val();
      if(v&&v.id===id){netDetach(wid);netRemoveDraftPrompt(appState.db,appState.room,seat,netFail("recipe prompt clear"));
        res(v.choice);}};
    wid=netWatchDraftResponse(appState.db,appState.room,seat,cb,"draftResponse:"+id);
  });
}
export function watchDraftPrompt(){
  netWatchDraftPrompt(appState.db,appState.room,appState.mySeat,snap=>{
    const p=snap.val();
    if(!p){return;}
    const cls=p.classes||[];
    const grid=cls.some(c=>c)?" recipes":"";
    panel(`<div class="apMsg">${p.msg}</div><div class="apBtns${grid}">`+
      (p.labels||[]).map((l,i)=>`<button class="apBtn ${cls[i]||""}" data-i="${i}">${l}</button>`).join("")+`</div>`,true);
    $("actionPanel").querySelectorAll(".apBtn").forEach(b=>{
      b.onclick=()=>{
        netSetDraftResponse(appState.db,appState.room,appState.mySeat,{id:p.id,choice:+b.dataset.i},netFail("recipe response"));
        if(p.waitMsg)showNarration(p.waitMsg);else panel("");
      };
    });
  });
}
// remote: render the game purely from the broadcast event feed
export function watchEvents(){
  netWatchEvents(appState.db,appState.room,snap=>{
    appState.game.events.push(fixEv(snap.val()));
    appState.evIdx=appState.game.events.length-1;
    syncLogLines();
    $("scrub").max=Math.max(0,appState.game.events.length-1);
    render();
    const e=appState.game.events[appState.evIdx];
    spawnPops(e,boardCell()); // notes/edits 11-03: cell now lives in src/ui/board.js
    if(e.t==="end")applyEndMeta();
  });
}
export function watchPrompt(){
  netWatchPrompt(appState.db,appState.room,snap=>{
    const p=snap.val();
    if(!p||p.seat!==appState.mySeat){panel("");setFlipActive(null);appState.inBattlePrompt=false;return;}
    if(p.kind==="ask"){
      if(p.battle){
        // this seat owns the live battle decision — render the same scoreboard everyone else
        // sees, with the control (flip button or choice buttons) layered on top
        appState.inBattlePrompt=true;
        if(p.flip){
          renderBattleFromSnap(p.battle);
          setNeedsAction(true);
          setFlipActive(()=>{setFlipActive(null);setNeedsAction(false);sendResponse(p.id,0);});
        }else{
          setFlipActive(null);
          const cols=p.colors||[];
          renderBattleFromSnap(p.battle,{prompt:{msg:p.msg,opts:(p.labels||[]).map(l=>({label:l})),colors:cols}});
          $("actionPanel").querySelectorAll(".btlBtn").forEach(b=>{b.onclick=()=>sendResponse(p.id,+b.dataset.i);});
        }
        return;
      }
      appState.inBattlePrompt=false;
      // mirror localAsk: a flip option arms the flippenator coin, a `back` option renders the
      // small circular apBack escape hatch, and any remaining options are the normal button row.
      // (These used to be host-only — remote players got a stray "FLIP!" button in the panel and
      // never saw the back affordance.)
      const cols=p.colors||[],cls=p.classes||[],labels=p.labels||[];
      const flipIdx=(p.flipIdx!=null&&p.flipIdx>=0)?p.flipIdx:(p.flip?0:-1);
      const backIdx=(p.back!=null&&p.back>=0)?p.back:-1;
      const backHtml=backIdx>=0?`<button class="apBack" data-i="${backIdx}" aria-label="Back">‹</button>`:"";
      if(flipIdx>=0){
        setNeedsAction(true);
        setFlipActive(()=>{setFlipActive(null);setNeedsAction(false);sendResponse(p.id,flipIdx);});
        if(backIdx>=0){
          panel(`${backHtml}<div class="apMsg">${p.msg}</div>`,true);
          $("actionPanel").querySelectorAll(".apBack").forEach(b=>{
            b.onclick=()=>{setFlipActive(null);setNeedsAction(false);sendResponse(p.id,+b.dataset.i);};});
        }else showNarration(p.msg);
        return;
      }
      setFlipActive(null);
      const dis=p.disabled||[];
      const rest=labels.map((l,i)=>({l,i})).filter(x=>x.i!==backIdx);
      const grid=cls.some(c=>c)?" recipes":"";
      const subHtml=p.sub?`<div class="apSub">${p.sub}</div>`:"";
      panel(`${backHtml}<div class="apMsg">${p.msg}</div><div class="apBtns${grid}">`+
        rest.map(x=>`<button class="apBtn ${cls[x.i]||""}${dis[x.i]?" apDisabled":""}" data-i="${x.i}"${dis[x.i]?" disabled":""}${apBtnStyle(cols[x.i])}>${x.l}</button>`).join("")+`</div>${subHtml}`,true);
      $("actionPanel").querySelectorAll(".apBtn,.apBack").forEach(b=>{if(b.disabled)return;b.onclick=()=>sendResponse(p.id,+b.dataset.i);});
    }else if(p.kind==="pick"){
      appState.inBattlePrompt=false;
      setFlipActive(null);
      remotePickHighlights(p.cells||[],p.id);
    }
  });
}
export function watchNarr(){
  netWatchNarr(appState.db,appState.room,s=>{const v=s.val();
    // while a battle scoreboard is showing here (as spectator or active combatant), keep it up —
    // the per-flip "X flips HEADS" broadcasts are already reflected in the scoreboard coins, and
    // letting them overwrite the panel made the battle box flicker away between flips (#9)
    if(v&&!appState.spectatingBattle&&!appState.inBattlePrompt)showNarration(v.html);});
}

/* ================= welcome modal ================= */
/* ================= lobby / room ================= */
export async function createRoom(){
  const name=($("pname").value||"").trim().slice(0,40)||DEFAULT_NAMES[0];
  appState.numSeats=4; // online hosted games are always 4 seats — bots fill any unfilled slot
  const code=genCode();
  const seats={0:{name,id:appState.myId,bot:false}};
  for(let i=1;i<appState.numSeats;i++)seats[i]={name:"",id:"",bot:true,strat:seatStrat(i)}; // BOT-02
  appState.room=code;appState.mySeat=0;appState.isHost=true;
  try{
    await netCreateRoom(appState.db,code,{host:appState.myId,status:"lobby",numSeats:appState.numSeats,seats,createdAt:Date.now()});
  }catch(e){
    console.error("createRoom failed",e);appState.room=null;appState.isHost=false;
    alert("Couldn't reach the multiplayer service — it may be at capacity right now. Try Play Solo instead!");
    return;
  }
  saveSession();showRoom();watchRoom();
}
export async function joinRoom(){
  const typedName=($("joinName").value||"").trim().slice(0,40);
  const code=($("joinCode").value||"").toUpperCase().trim();
  if(code.length<4){alert("Enter the room code your host shared.");return;}
  let snap;
  try{snap=await netReadRoom(appState.db,code);}
  catch(e){console.error("joinRoom failed",e);alert("Couldn't reach the multiplayer service — it may be at capacity right now. Try Play Solo instead!");return;}
  if(!snap.exists()){alert("No game found with code "+code+".");return;}
  const r=snap.val();
  const seats=r.seats||{};
  let mine=null;
  for(let i=0;i<r.numSeats;i++)if(seats[i]&&seats[i].id===appState.myId)mine=i;
  if(mine!=null){appState.room=code;appState.mySeat=mine;appState.isHost=(r.host===appState.myId);saveSession();watchRoom();return;}
  if(r.status!=="lobby"){alert("That game has already set sail.");return;}
  let claimed=null;
  await netClaimSeat(appState.db,code,s=>{
    if(!s)return s;
    for(let i=0;i<r.numSeats;i++){const cur=s[i]||{};if(!cur.id){
      // #2: blank name → an unused default captain name computed against the live seat map, so a
      // late joiner never duplicates a name already in the room.
      s[i]={name:typedName||unusedDefaultName(s,i),id:appState.myId,bot:false};claimed=i;return s;}}
    return s;
  });
  if(claimed==null){alert("That game is full.");return;}
  appState.room=code;appState.mySeat=claimed;appState.isHost=(r.host===appState.myId);saveSession();watchRoom();
}
// D-13: module-scope guard so a repeated watchRoom() call for the SAME room (a normal guest-join
// lifecycle invokes this more than once) does not re-attach netWatchSeats()/netWatchStatus() and
// trip src/net/registry.js's "duplicate attach refused" ERROR — see this file's own header note.
let _watchRoomAttachedFor=null;
export async function watchRoom(){
  const r0=(await netReadRoom(appState.db,appState.room)).val();
  if(!r0){alert("That game no longer exists.");clearSession();showHome();return;}
  appState.numSeats=r0.numSeats;appState.isHost=(r0.host===appState.myId);
  if(r0.status==="lobby")showRoom();
  if(_watchRoomAttachedFor===appState.room)return; // already watching this room — see D-13 above
  _watchRoomAttachedFor=appState.room;
  netWatchSeats(appState.db,appState.room,snap=>{
    const seats=snap.val()||{};
    appState.roster=[];for(let i=0;i<appState.numSeats;i++)appState.roster[i]=seats[i]||{bot:true,strat:seatStrat(i)};
    if(!appState.gameStarted)renderSeatList(seats);
  });
  netWatchStatus(appState.db,appState.room,async snap=>{
    const st=snap.val();
    if((st==="playing"||st==="ended")&&!appState.gameStarted){
      const r=(await netReadRoom(appState.db,appState.room)).val();
      appState.roster=[];for(let i=0;i<r.numSeats;i++)appState.roster[i]=(r.seats&&r.seats[i])||{bot:true,strat:seatStrat(i)};
      beginGame(r.cfg,r.seed);
    }
  });
}
export async function startGame(){
  try{
    const r=(await netReadRoom(appState.db,appState.room)).val();
    const strategies=[];
    for(let i=0;i<r.numSeats;i++){const s=(r.seats&&r.seats[i])||{};strategies.push(s.id?"human":(s.strat||"pirate"));}
    const cfg=roundCfg(strategies);
    const seed=Math.floor(Math.random()*1e9);
    await netUpdateRoom(appState.db,appState.room,{status:"playing",cfg,seed,ev:null,prompt:null,response:null,narr:null,meta:null,
      recipes:null,dlog:null,flip:null,battle:null,draftPrompts:null,draftResponses:null,clock:null,turnOrder:null,chat:null});
  }catch(e){
    console.error("startGame failed",e);
    alert("Couldn't reach the multiplayer service — it may be at capacity right now. Try again in a moment.");
  }
}
export function beginGame(cfg,seed){
  if(appState.gameStarted)return;appState.gameStarted=true;
  showGameView();
  appState.game=new Game(cfg,seed,true);
  appState.live=true;appState.liveDone=false;appState.evIdx=0;appState.evPushed=0;appState.appliedMeta=false;
  // fresh start resets the decision log; a reload-replay keeps the log loaded by resumeHostGame
  if(!appState.replaying){appState.dlog=[];appState.dlogIdx=0;appState.dlogN=0;}
  appState.turnOrder=null;
  appState.logLines=[];resetBoardLog(-2);$("log").innerHTML=""; // notes/edits 11-03: logRenderedTo now lives in src/ui/board.js
  $("chatLog").innerHTML="";clearChatBubbles();
  $("chatPanel").style.display=(appState.db&&appState.room)?"":"none"; // no chat in solo/pass-and-play — no one else to talk to
  drawBoard();buildPlayerRows();
  updateRecipeBanner();
  watchRecipes();
  if(appState.isHost){runLiveNet();}
  else{watchEvents();watchPrompt();watchNarr();watchFlip();watchBattle();watchDraftPrompt();watchClock();watchTurnOrder();watchRecoveryState();}
  watchChat(); // unlike narr/ev, every client (including the host) both sends and listens for chat
  watchTimer(); // #7: every client tracks the shared timer-off flag
  // host seeds the shared flag from its own last choice so the preference carries across games
  // (but not on a reload-replay, which must keep whatever the live game already had)
  if(appState.isHost&&appState.db&&appState.room&&!appState.replaying){
    let off=false;try{off=localStorage.getItem("pp_timerOff")==="1";}catch(e){}
    netSetTimerOff(appState.db,appState.room,off,netFail("timerOff"));
  }
}
// non-host clients don't compute turn order themselves (only the host's runLiveNet does) — read
// the host's synced copy instead, and reorder the captains panel once it arrives
export function watchTurnOrder(){
  netWatchTurnOrder(appState.db,appState.room,snap=>{
    const v=snap.val();
    if(v){appState.turnOrder=v;buildPlayerRows();}
  });
}
export function watchRecipes(){
  netWatchRecipes(appState.db,appState.room,snap=>{
    const picks=snap.val();
    if(!picks)return;
    picks.forEach((pk,i)=>{if(appState.game.players[i]&&appState.game.players[i].recipeChoices)appState.game.players[i].recipe=appState.game.players[i].recipeChoices[pk];});
    updateRecipeBanner();
    if(appState.game.events.length)render();
  });
}
export function leaveGame(){netLeaveRoom();clearSession();clearSoloState();location.reload();}

/* ================= boot ================= */
export function wireLobby(){
  $("btnCreate").onclick=()=>{createRoom();};
  $("btnJoin").onclick=()=>{joinRoom();};
  $("btnStart").onclick=()=>{$("startConfirmModal").style.display="flex";};
  $("btnCancelStart").onclick=()=>{$("startConfirmModal").style.display="none";};
  $("btnConfirmStart").onclick=()=>{$("startConfirmModal").style.display="none";startGame();};
  wireRestoreFail();
  $("btnLeave").onclick=()=>{$("leaveConfirmModal").style.display="flex";};
  $("btnCancelLeave").onclick=()=>{$("leaveConfirmModal").style.display="none";};
  $("btnConfirmLeave").onclick=()=>{$("leaveConfirmModal").style.display="none";leaveGame();};
  $("btnPlayAgain").onclick=leaveGame;
  $("scPause").onclick=toggleShotClockPause;
  $("scTimerToggle").onclick=toggleTimer;
  $("btnShowLog").onclick=()=>{$("logModal").style.display="flex";const box=$("log");box.scrollTop=box.scrollHeight;};
  $("btnShowHow").onclick=()=>{$("howToPlayModal").style.display="flex";};
  $("btnShowCredits").onclick=()=>{$("creditsModal").style.display="flex";};
  $("btnShowFeedback").onclick=()=>{$("feedbackModal").style.display="flex";};
  // #2: in-game modals get a top-right ✕ and close on outside-click (the bottom "Close" buttons
  // were removed). Pre-game/blocking modals (lobby, pass-device, room, start/leave confirms) are
  // deliberately NOT dismissible this way — they gate the game and must be answered.
  ["howToPlayModal","creditsModal","logModal","feedbackModal","recipeModal"].forEach(id=>{
    const ov=$(id);if(!ov)return;
    const card=ov.querySelector(".modalCard");
    if(card&&!card.querySelector(".modalX")){
      card.style.position="relative";
      const x=document.createElement("button");
      x.className="modalX";x.type="button";x.innerHTML=iconImg(CLOSE_X_IMG);x.setAttribute("aria-label","Close");
      x.onclick=()=>{ov.style.display="none";};
      card.insertBefore(x,card.firstChild);
    }
    ov.addEventListener("click",e=>{if(e.target===ov)ov.style.display="none";});
  });
  $("btnSendFeedback").onclick=()=>{
    const text=($("feedbackText").value||"").trim();
    if(!text)return;
    if(appState.db)netSetFeedback(appState.db,Date.now(),{text,room:appState.room||null,name:($("pname").value||"").trim()||null,t:Date.now()},e=>console.error("feedback write failed",e));
    $("feedbackText").value="";
    $("feedbackModal").style.display="none";
  };
  $("chatForm").addEventListener("submit",e=>{e.preventDefault();sendChat($("chatInput").value);$("chatInput").value="";});
}
// The host reloaded mid-game. Rebuild the crew, load the recorded decision log, then let
// beginGame → runLiveNet fast-forward the deterministic engine through the log (replaying=true).
// Rendering, delays, and broadcasts are suppressed until the log runs out (endReplay), at which
// point control returns to live play from the exact spot the reload interrupted — but only after
// endReplay validates that the rebuild actually got there. A replay that fell far short (a failed
// or empty log read) surfaces the restore-failed dialog instead of quietly handing back a board
// that has silently reset to turn 1.
export async function resumeHostGame(r){
  appState.numSeats=r.numSeats;
  appState.roster=[];for(let i=0;i<appState.numSeats;i++)appState.roster[i]=(r.seats&&r.seats[i])||{bot:true,strat:seatStrat(i)};
  if(!r.cfg){ // never actually started (reloaded on the "playing" flag before cfg was written)
    clearSession();showHome();return;
  }
  // notes/edits BUG-03: these two reads used to swallow their errors entirely (`catch(e){}`), which
  // conflated three very different outcomes — the read THREW, the read succeeded and returned
  // nothing, and the read succeeded with data. A thrown read then looked identical to a brand-new
  // game, so the engine rebuilt a fresh board from the seed and the player saw their whole voyage
  // reset. Record the failure and surface it through netFail (same helper every other failure site
  // in this file uses); replayShortfall treats a failed read as untrustworthy regardless of counts.
  appState.resumeReadFailed=false;
  let draw={};try{draw=(await netReadDlog(appState.db,appState.room)).val()||{};}catch(e){appState.resumeReadFailed=true;netFail("resume dlog")(e);}
  appState.dlog=Object.keys(draw).map(Number).sort((a,b)=>a-b).map(k=>decodeDec(draw[k]));
  appState.dlogIdx=0;appState.dlogN=0;
  let evval={};try{evval=(await netReadEv(appState.db,appState.room)).val()||{};}catch(e){appState.resumeReadFailed=true;netFail("resume events")(e);}
  appState.resumeEvLen=evval?Object.keys(evval).length:0;
  showGameView();
  panel('<div class="apMsg">⚓ Reconnecting to your voyage…</div>');
  appState.replaying=true;
  beginGame(r.cfg,r.seed);
}

export function boot(){
  appState.myId=getMyId();
  // reveal the game as soon as the art is ready, but never wait more than 6s (offline/failed CDN,
  // dead image host, etc.) — a hung loader would be worse than the pop-in it prevents.
  Promise.race([preloadAssets(),new Promise(r=>setTimeout(r,6000))]).then(hideBootLoader);
  renderDecorativeBoard();
  wireWelcome();
  wireRecipeModal(); // wired unconditionally (not inside wireLobby) so it works in solo/offline play too
  wireLobby(); // wired unconditionally, before any early-return resume path (solo or offline), so
  // footer/pause buttons are never left unwired — previously this ran after the Firebase-init
  // check below, which the solo-resume branch's early `return` skipped entirely, leaving every
  // footer button and the pause button dead for the rest of a resumed solo game
  showHome();
  syncBoardSizing();
  let sess=null;try{sess=JSON.parse(localStorage.getItem("pp_sess"));}catch(e){}
  if(!sess||!sess.room){
    // no multiplayer game to reconnect to — check for an interrupted singleplayer game instead.
    // Checked before Firebase init so an offline refresh mid-solo-game still resumes.
    let solo=null;try{solo=JSON.parse(localStorage.getItem("pp_solo"));}catch(e){}
    if(solo&&solo.seed!=null&&solo.strategies){resumeSoloGame(solo);return;}
  }
  const fbOk=fbInit();
  if(!fbOk){
    $("choiceHost").classList.add("disabled");
    $("choiceJoin").classList.add("disabled");
    $("fbnote").style.display="";
    return; // solo play still works fully offline
  }
  if(sess&&sess.room){
    appState.room=sess.room;appState.mySeat=sess.mySeat;appState.isHost=!!sess.isHost;
    netReadRoom(appState.db,appState.room).then(snap=>{
      if(!snap.exists()){clearSession();showHome();return;}
      const r=snap.val();
      appState.isHost=(r.host===appState.myId);
      if(appState.isHost&&(r.status==="playing"||r.status==="ended")){
        // The host's browser drives the game. On an accidental reload, replay the recorded
        // decision log to rebuild the exact game state and keep driving it — then check the
        // rebuild actually landed (see endReplay). If it came up short, the player is asked
        // what to do rather than handed a silently-reset board.
        resumeHostGame(r);return;
      }
      watchRoom();
    }).catch(()=>{clearSession();showHome();});
  }
}
