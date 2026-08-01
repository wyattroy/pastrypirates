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
  HEXCOL, DEFAULT_NAMES, DEVICE_IMG, ANCHOR_IMG, CLOCK_IMG, FLIP_SOCKET_IMG, HOURGLASS_IMG,
  iconImg, emojify,
} from "../shared/index.js";
import { pname, pn } from "./util.js";
// F2/UI-06 (2026-07-29): escHtml's only use here was the duplicate seat-name rendering that this
// task removed. The remaining name rendering escapes through pn() -> pname() -> escHtml, so the
// escaping is preserved and this import is now dead — dropped rather than left (D-33/D-34/D-40).
import { syncBoardSizing } from "./board.js";

const $=id=>document.getElementById(id);

/* ================= KOFI-01 — the Ko-Fi panel, embedded in our own modal ================= */
// Wyatt, 2026-07-31: "i don't want this button to open up the kofi website; ideally, i want it to
// open up the kofi widget." So the footer button and the Credits button both open #kofiModal, which
// holds Ko-Fi's own embedded donation panel. The player never leaves the game.
//
// WHY NOT the floating-chat overlay snippet he sent first. That script draws its OWN permanent
// button, and it lives inside a CROSS-ORIGIN iframe (verified in a browser: contentDocument threw).
// Nothing on our page can click into it, so "our button opens their widget" is not achievable that
// way at all — it would have meant accepting a second, always-on button floating over the board.
// The embed URL below is the same widget, hosted in a frame we control the size and placement of.
//
// Loaded on FIRST OPEN, never at boot: a player who never opens it never contacts ko-fi.com. The
// src is set here rather than in the markup precisely so that stays true.
const KOFI_EMBED="https://ko-fi.com/wyattroy/?hidefeed=true&widget=true&embed=true&preview=true";
let kofiMounted=false;
export function mountKofi(){
  const host=$("kofiPanel");
  if(!host||kofiMounted)return;
  kofiMounted=true;
  const f=document.createElement("iframe");
  f.src=KOFI_EMBED;
  f.title="Support Pastry Pirates on Ko-fi";
  f.setAttribute("loading","lazy");
  // payments live in the frame, so it needs scripts, forms and same-origin to ko-fi.com; it gets
  // nothing else, and top-navigation is NOT granted — a frame cannot yank the player out of a game.
  f.setAttribute("sandbox","allow-scripts allow-forms allow-popups allow-same-origin");
  // An ad-blocker eating this is common and expected. Say so plainly rather than leaving an empty
  // box, and name ko-fi.com so the player can go there themselves if they want to.
  f.onerror=()=>{kofiMounted=false;host.innerHTML='<div class="muted" style="padding:14px;text-align:center">Couldn\'t load the Ko-Fi panel — an ad blocker may be blocking it. ko-fi.com/wyattroy works directly.</div>';};
  host.innerHTML="";
  host.appendChild(f);
}
export function openKofi(){
  const m=$("kofiModal");
  if(!m)return;
  m.style.display="flex";
  mountKofi();
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
    // @copy misc.lobby.passmessage
    $("passOverlayMsg").innerHTML=`${iconImg(DEVICE_IMG)} Pass the board to<br><span style="color:${HEXCOL[seatIdx]}">${pname(seatIdx)}</span>`;
    const btn=$("passHelmBtn");
    // @copy misc.lobby.passbutton
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
    // D-29 RESOLVED (Wyatt-approved 2026-07-29): every player-facing string in this file speaks the
    // pirate register — the 2nd-person pronouns become ye/yer/yers/yerself. Applied as a one-time source
    // transformation using art-review/narration-core.js's own PIRATE_RE/PIRATE_MAP as the spec — the one
    // declaration site in the repo, imported by the audit page, the health gate and ui_contract_check.js
    // alike (the
    // page ran it LIVE at render, so a card tagged `keep` displayed the converted text — under D-25 that
    // converted text is what he approved). No runtime helper is shipped for it: a pirateVoice() nothing
    // calls would be dead code, which D-33/D-34/D-40 exist to prevent. Comments and identifiers are out
    // of scope. scripts/ui_contract_check.js now gates this permanently.
    // F1 + UI-06 (Wyatt-approved 2026-07-29, 15-PLAYTEST-NOTES.md): two fixes in two lines.
    //
    // F1 — THE LABEL CLASS. The pirate register (D-29) applies to text the game SPEAKS. This is not
    // speech: it is a demonstrative LABEL pointing at a seat to say "this row is the reader". No
    // verb, no sentence, not the game's voice — UI chrome, so it takes plain "you". `name — ye` is
    // not pirate, it is a grammar error: `ye` is a pronoun standing in for a person, so a bare
    // `Wyatt — ye` reads "Wyatt — thou" rather than "Wyatt — that's the one that's you". The ~50
    // in-sentence ADDRESS sites in this codebase are correct as ye/yer and none of them change.
    // scripts/ui_contract_check.js carries a named, content-anchored, staleness-checked exception
    // for exactly these three label sites, so a later pass cannot "fix" them back.
    //
    // F2/UI-06 — ONE NAME PER SEAT. `label` used to begin with the seated player's name while the
    // template also rendered `pn(i)`, so a joined human printed twice ("Wyatt — Wyatt — ye", his
    // screenshot). `label` is now the SUFFIX only, and `pn(i)` is the single name rendering — which
    // also keeps the HTML escaping where it already was (pn -> pname -> escHtml), rather than
    // re-implementing it here. The separator is suppressed when the suffix is empty, so another
    // human's seat is the bare name. UI-06's three renderings exactly: `{name} — you` for the
    // reader, `{name}` for another human, `{captain default} — 🤖 bot` for an empty seat.
    if(s.id)label=me?"you":"";
    else label="🤖 bot";
    html+=`<div class="seat ${me?"me":""}">
      <span class="nm">${pn(i)}${label?` — ${label}`:""}</span></div>`;
  }
  $("seatList").innerHTML=emojify(html);
  if(appState.isHost){
    $("btnStart").style.display="";
    // NARR-01/D-25/D-50 (Wyatt-approved 2026-07-29): applied verbatim; {clock/stopwatch} resolves
    // to the hourglass (D-50 RESOLVED — this is a "waiting for players" moment, not a control).
    // @copy misc.lobby.waitcaption
    $("waitMsg").innerHTML=`${iconImg(HOURGLASS_IMG)} Yer mateys will appear above as they join. Wait for them before clicking start. Empty seats are played by botpirates — and they're feisty.`;
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
