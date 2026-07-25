// src/ui/lobby.js
//
// Phase 11 (SPLIT-03/06), wave 11-04. The lobby / room / welcome view cluster — buildPlayerRows,
// showStep, requireName, wireWelcome, renderSeatList, showHome, showRoom, showGameView,
// passGate, hideBootLoader, applyEngineBootstrapEffects. Extends 11-01/02/03's proven "move
// verbatim + rewire bare reads into imports + bridge grows + gates green" pattern.
//
// Deliberately NOT moved (11-analysis.json's `ui (DOM)` tier, net:[] classification): the
// room-lifecycle NET-CALLING functions — createRoom, joinRoom, watchRoom, startGame, beginGame,
// wireLobby — stay in the classic <script> region. Those are orchestration (they call
// src/net/-backed functions directly), not pure views, and belong to 11-06 alongside the rest of
// the net-adjacent orchestration layer, not this UI-rendering wave. This file's functions call a
// few of those still-classic functions as bare identifiers (startSinglePlayer/startPassAndPlay
// from wireWelcome) — they resolve fine via the still-present PP bridge, same as every other
// still-classic cross-reference in this codebase this phase.
//
// Purity bar for src/ui/: reads DOM and game state, NEVER imports src/net/ (D-07).
// scripts/module_graph_check.js and scripts/ui_contract_check.js both gate this mechanically.
//
// Deviation ($ duplicate, mirrors 11-01/11-03/11-04's precedent): `$` is a classic-script-local
// `const $=id=>document.getElementById(id)` (index.html:863), used ~120+ times across the still-
// classic region far beyond this cluster's own consumers — reproduced verbatim as a private
// module-local helper instead of "moved".
//
// showGameView() calls syncBoardSizing() — already moved to src/ui/board.js in 11-03 — imported
// directly here (same ui/ tier, already-moved sibling) rather than left as a bare bridge read,
// per the established "reuse already-moved helpers by importing them" precedent.

import { appState } from "../state/index.js";
import {
  HEXCOL, NAMES, DEFAULT_NAMES, COIN_IMG, DEVICE_IMG, ANCHOR_IMG, CLOCK_IMG, FLIP_SOCKET_IMG,
  iconImg, emojify,
} from "../shared/index.js";
import { seatDisplayOrder, pname, pn } from "./util.js";
import { escHtml } from "./recipe.js";
import { syncBoardSizing } from "./board.js";

const $=id=>document.getElementById(id);

export function buildPlayerRows(){
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

/* ================= welcome modal ================= */
export function showStep(id){
  ["stepChoose","stepHost","stepJoin","stepPassPlay"].forEach(s=>{$(s).style.display=(s===id?"":"none");});
}
export function requireName(){
  const v=($("pname").value||"").trim();
  // solo/host player always sits at seat 0, so a blank name defaults to seat 0's captain ("Davy
  // Scones") — deterministic, and can't clash with the bots that fill seats 1-3.
  return v?v.slice(0,40):DEFAULT_NAMES[0];
}
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

/* ================= lobby / room ================= */
export function showHome(){
  showStep("stepChoose");
  $("lobby").style.display="flex";$("lobbyRoom").style.display="none";
  $("game").style.display="";$("game").classList.add("bg-blurred");
}
export function showRoom(){
  $("lobby").style.display="none";$("lobbyRoom").style.display="flex";
  $("game").style.display="";$("game").classList.add("bg-blurred");
  $("roomCode").textContent=appState.room;
}
export function showGameView(){
  $("lobby").style.display="none";$("lobbyRoom").style.display="none";
  $("game").style.display="";$("game").classList.remove("bg-blurred");
  syncBoardSizing();
}

/* ================= pass & play: hand the device to the next seat ================= */
// Blocks until whoever is about to act taps through, blurring the board underneath so nothing
// from the outgoing seat's turn lingers on screen while the device changes hands. A no-op
// outside Pass & Play, for the seat that already has the device, and during replay (a reload
// should replay straight through with no hand-off prompts, same as every other decision).
export function passGate(seatIdx){
  if(!appState.passAndPlay||seatIdx===appState.mySeat)return Promise.resolve();
  if(appState.replaying){appState.mySeat=seatIdx;return Promise.resolve();} // silently keep mySeat in sync so it's
  // already correct the moment replay catches up to the live edge — no UI shown mid-replay
  return new Promise(res=>{
    $("game").classList.add("bg-blurred");
    $("passOverlayMsg").innerHTML=`${iconImg(DEVICE_IMG)} Pass the device to<br><span style="color:${HEXCOL[seatIdx]}">${pname(seatIdx)}</span>`;
    const btn=$("passHelmBtn");
    btn.innerHTML=`${iconImg(ANCHOR_IMG)} ${pname(seatIdx)} at the helm!`;
    btn.style.background=HEXCOL[seatIdx];btn.style.borderColor=HEXCOL[seatIdx];
    $("passOverlay").style.display="flex";
    btn.onclick=()=>{
      $("passOverlay").style.display="none";
      $("game").classList.remove("bg-blurred");
      appState.mySeat=seatIdx;
      res();
    };
  });
}

export function renderSeatList(seats){
  let html="";
  for(let i=0;i<appState.numSeats;i++){
    const s=seats[i]||{bot:true};
    const me=(s.id===appState.myId);
    let label;
    // BOT-01: no personality picker — every captain's temperament is fixed (see SEAT_BOT_STRAT)
    if(s.id)label=escHtml(s.name)+(me?" — you":"");
    else label="🤖 bot";
    html+=`<div class="seat ${me?"me":""}"><span class="dot" style="background:${HEXCOL[i]}"></span>
      <span class="nm">${pn(i)} — ${label}</span></div>`;
  }
  $("seatList").innerHTML=emojify(html);
  if(appState.isHost){
    $("btnStart").style.display="";
    $("waitMsg").innerHTML="Your crew will appear above as they join. Wait for them before clicking start. Empty seats are played by bots.";
  }else{
    $("btnStart").style.display="none";
    $("waitMsg").textContent="Waiting for the host to start the voyage…";
  }
}

export function hideBootLoader(){
  const b=$("bootLoader");if(!b||b.classList.contains("hidden"))return;
  b.classList.add("hidden");
  setTimeout(()=>{if(b.parentNode)b.remove();},600);
}
export function applyEngineBootstrapEffects(){
  document.documentElement.style.setProperty("--clock-img",`url(${CLOCK_IMG})`);
  document.documentElement.style.setProperty("--flip-socket-img",`url(${FLIP_SOCKET_IMG})`);
  // One-time sweep of the static page markup (lobby, modals, footer buttons) — that HTML is
  // authored with plain emoji same as every narration string, but it never passes through
  // describe()/panel() since it's just sitting in the DOM from page load, not built at runtime.
  // Rewriting document.body here, before any element-lookup/event-wiring below runs, catches every
  // static occurrence in one pass (ids and structure survive — only text content changes) instead
  // of hunting down and hand-editing each one individually.
  document.body.innerHTML = emojify(document.body.innerHTML);
}
