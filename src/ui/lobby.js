// src/ui/lobby.js
//
// Phase 11 (SPLIT-03/06), wave 11-04. The lobby / room / welcome view cluster —
// showStep, requireName, renderSeatList, showHome, showRoom, showGameView,
// passGate, hideBootLoader, applyEngineBootstrapEffects. Extends 11-01/02/03's proven "move
// verbatim + rewire bare reads into imports + bridge grows + gates green" pattern.
//
// Deliberately NOT moved (11-analysis.json's `ui (DOM)` tier, net:[] classification): the
// room-lifecycle NET-CALLING functions — createRoom, joinRoom, watchRoom, startGame, beginGame,
// wireLobby — stay in the classic <script> region (as of 11-04; homed in src/orchestrator.js
// since 11-06). Those are orchestration (they call src/net/-backed functions directly), not pure
// views, and belong to the net-adjacent orchestration layer, not this UI-rendering cluster.
//
// 11-07 (bridge deletion fix): `buildPlayerRows` relocated OUT of this file into src/ui/util.js —
// see that file's own header note for why (a board.js<->lobby.js cycle risk this function's
// former home would have created). `wireWelcome` relocated OUT of this file into src/ui/flow.js —
// wireWelcome calls startSinglePlayer()/startPassAndPlay(), which live in flow.js (11-05); since
// flow.js already imports `passGate`/`requireName` FROM this file, this file importing
// startSinglePlayer/startPassAndPlay BACK from flow.js would close an import cycle
// module_graph_check.js's "no import cycle" assertion forbids. Relocating the one function that
// needs both directions resolves it with no seam and no cycle. `showStep`/`requireName` stay
// here (flow.js's wireWelcome imports both from this file, extending its existing import).
//
// Purity bar for src/ui/: reads DOM and game state, NEVER imports src/net/ (D-07).
// scripts/module_graph_check.js and scripts/ui_contract_check.js both gate this mechanically.
//
// Deviation ($ duplicate, mirrors 11-01/11-03/11-04's precedent): `$` is a classic-script-local
// `const $=id=>document.getElementById(id)` (index.html:863, pre-11-07), used ~120+ times across
// the ~183-function classic region far beyond this cluster's own consumers — reproduced verbatim
// as a private module-local helper instead of "moved".
//
// showGameView() calls syncBoardSizing() — already moved to src/ui/board.js in 11-03 — imported
// directly here (same ui/ tier, already-moved sibling) rather than left as a bare bridge read,
// per the established "reuse already-moved helpers by importing them" precedent.

import { appState } from "../state/index.js";
import {
  HEXCOL, DEFAULT_NAMES, DEVICE_IMG, ANCHOR_IMG, CLOCK_IMG, FLIP_SOCKET_IMG,
  iconImg, emojify,
} from "../shared/index.js";
import { pname, pn } from "./util.js";
import { escHtml } from "./recipe.js";
import { syncBoardSizing } from "./board.js";

const $=id=>document.getElementById(id);

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
    // NARR-01/D-25 (Wyatt-approved 2026-07-29).
    $("passOverlayMsg").innerHTML=`${iconImg(DEVICE_IMG)} Pass the board to<br><span style="color:${HEXCOL[seatIdx]}">${pname(seatIdx)}</span>`;
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
