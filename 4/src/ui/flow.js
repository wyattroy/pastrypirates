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
import { pingStart } from "./usage.js";
import { roundCfg } from "../engine/index.js";
import {
  // F5 (2026-07-29): dockFlavor -> dockFlavorIcon. The tails buy prompt (:below) was this file's
  // only dockFlavor consumer, and it now needs the icon placed by the declared {prefix,name} split
  // rather than interpolated in front of the whole flavour phrase.
  DIRS, DIRNAME, STORM_PUSH, SAIL_RANGE, SAIL_RANGE_UPWIND, OPPOSITE, man, HEXCOL, iname, ilabelImg, iconImg, NAMES, dockPlace, dockFlavorIcon, ING_IMG,
  CUPCAKE_IMG, CHECKMARK_IMG, CANCEL_X_IMG, DICE_IMG, FLIP_HEADS_IMG, FLIP_TAILS_IMG, COIN_SPIN_IMG, ovensNowEnabled, BAKE_REWATCH_COST,
} from "../shared/index.js";
import { el, boardCell, setFlipActive, renderLiveShips, paintShipAt, setShipGlideMs, paintShipAtPoint } from "./board.js";
import {
  liveRender, panel, setNeedsAction, narrateLastEvent, flash, showNarration,
} from "./panel.js";
import {
  pn, poss, apBtnStyle, ask, armClock, stepDelay, botBeat, setActor, seatLocal,
  decisionIsLocal, stopShotClock, withShotClock, waitWhilePaused, seatStrat, saveSoloState,
  getSeaBase, advanceSeaCursor,
  replayShortfall, STORM_STEP_MS, describeFor, narrationVariants, isLocalTo, NEUTRAL_VIEWER,
  msgHoldMs, BOT_STORM_STEP_MS, RIM_SWEEP_ARRIVE_MS, RIM_SWEEP_TICK_MS,
  RIM_SWEEP_MS_PER_CELL, RIM_SWEEP_MIN_MS, RIM_SWEEP_MAX_MS,
} from "./util.js";
import { passGate, requireName, showStep, openNameModal, confirmName, wireNameModal } from "./lobby.js";
import { playBakeoffLive } from "./bakeoff.js";
import { netHandlers } from "./handlers.js";

const $=id=>document.getElementById(id);
// ⏩ fast-forward: every flow beat (storm steps, rim sweeps, bot beats, battle pauses) collapses
// to a breath — 40ms keeps the sequencing sane (paints still land in order) while the round races
// by. Prompts are never touched by this: any decision involving the player ends the skip first
// (ffEndNow below), so his interactions always play at full speed.
const sleep=ms=>appState.replaying?Promise.resolve():waitWhilePaused().then(()=>new Promise(r=>setTimeout(r,appState.ff?Math.min(ms||0,40):ms)));

/* ================= ⏩ fast-forward: how a skip ends ================= */
// Called, synchronously, at the top of EVERY entry point that puts a decision in front of the
// player — localAsk (which also carries flips, battle calls, offered trades and defenses, since
// ask() routes through it), localPickCell (the sail), and bakeoffPrompt. Wyatt's rule
// (2026-08-12): the skip halts for ALL interactions he takes part in, plays them at normal
// speed, and NEVER re-arms itself — the ⏩ chip sits in the ribbon to tap again after. The recap
// is fire-and-forget so his prompt is never delayed by it, anchored to his own ship so the
// camera stays where his decision is.
// Returns null when no skip was live, else a promise that resolves once the recap bubble has
// played. Playtest 17 (Wyatt: "No narration/action messaging should overlap"): the recap is
// AWAITED before the prompt builds — bubble first, pill after, never both. Tap-to-hurry works on
// the bubble, so the cost of the sequence is one tap at most. (ask()'s no-panel belt arms the
// clock during the recap for this one case; /4 ships with the turn clock off by default, and a
// hurried bubble costs ~a second of a 30s window when it is on.)
function ffEndNow(){
  if(!appState.ff)return null;
  appState.ff=false;
  const from=appState.ffFromEv||0;appState.ffFromEv=null;
  const g=appState.game;if(!g)return null;
  const line=ffRecapLine(g,from);
  if(!line)return null;
  if(window.__pp4)window.__pp4.subject=(appState.mySeat??0);
  return flash(line);
}
// One clause per bot (his pick), weightiest event claiming the clause: finishing > battles >
// buys > trades > dock work > a plain sail. Covers only what he did NOT witness — anything that
// halted the skip played live in front of him. Draft copy — Wyatt rewrites.
function ffRecapLine(g,from){
  const by=new Map();
  const note=(seat,w,txt)=>{
    if(seat==null||seat===(appState.mySeat??0))return;
    const cur=by.get(seat);if(!cur||w>cur.w)by.set(seat,{w,txt});
  };
  for(const e of g.events.slice(Math.max(0,from))){
    if(e.t==="finish")note(e.p,6,`made it home with a full recipe`);
    else if(e.t==="battle"){
      const loser=e.winner===e.a?e.d:e.a;
      note(e.winner,5,`bested ${pn(loser)} in battle`);
      note(loser,4,`lost a battle to ${pn(e.winner)}`);
    }
    else if(e.t==="dock"&&e.got==="bought")
      note(e.p,e.black?4:3,e.black
        ?`paid the black market for ${iconImg(ING_IMG[e.ing])}`
        :`bought ${iconImg(ING_IMG[e.ing])} at ${dockPlace(e.ing)}`);
    else if(e.t==="trade"){note(e.a,3,`struck a trade with ${pn(e.b)}`);note(e.b,3,`struck a trade with ${pn(e.a)}`);}
    else if(e.t==="dock")note(e.p,2,`worked the docks at ${dockPlace(e.ing)}`);
    else if(e.t==="sail"||e.t==="pass")note(e.p,1,`sailed on`);
  }
  if(!by.size)return null;
  // @copy adhoc.ff.recap — DRAFT, Wyatt rewrites
  return `⏩ While ye looked away: `+[...by.entries()].map(([s,v])=>`${pn(s)} ${v.txt}`).join("; ")+`.`;
}

/* ================= turn-flow + interaction ================= */

export function localAsk(msg,opts,colors,sub){
  // a decision is landing in front of the player — the skip is over. When a recap is owed, it
  // plays FIRST and the prompt builds after it resolves (no bubble/pill overlap, his rule); the
  // re-entry finds appState.ff already false and falls straight through.
  const pre=ffEndNow();
  if(pre)return pre.then(()=>localAsk(msg,opts,colors,sub));
  return new Promise(res=>{
    if(opts.length===1&&opts[0].flip){
      // /4 ceremony: a PURE flip renders no panel at all, so the veil cannot read its ask from
      // the DOM — stash message + helper on the bridge for the ceremony title/stakes
      if(window.__pp4)window.__pp4.flipMsg={m:msg||"",s:sub||""};
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
    const done=v=>{setFlipActive(null);setNeedsAction(false);delete $("actionPanel").dataset.pp4Stage;panel("");res(v);};
    if(opts.some(o=>o&&o.stage))$("actionPanel").dataset.pp4Stage="1";
    if(flipIdx!==-1){
      if(window.__pp4)window.__pp4.flipMsg={m:msg||"",s:sub||""};   // same stash as the pure flip
      setNeedsAction(true);setFlipActive(()=>done(flipIdx));
    }
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
      // /4 stage: an option may carry a `short` label — the radial bloom shows that compact form
      // in its circle while the card fallback keeps the full sentence (element property, never a
      // data-attribute: the short form is HTML with icon imgs in it)
      const o=opts[+b.dataset.i];
      if(o&&o.short!=null)b._shortHtml=o.short;
      if(b.disabled)return; // disabled options are display-only (notes/edits #5d)
      b.onclick=()=>done(+b.dataset.i);
    });
  });
}
export async function humanFlip(p,label,allowBack,sub){
  setActor(p.idx);
  const opts=[{label:"🌕 FLIP!",value:1,flip:true}];
  if(allowBack)opts.push({label:"← Back",back:true,value:"back"});
  // `sub` is the italic helper line beneath the buttons — used by the dock flip to explain what
  // the two faces of the coin actually pay (Wyatt, 2026-08-05).
  // @copy prompt.flip.fallback
  const v=await ask(label||"Flip the dubloon!",opts,null,sub);
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
// v2 rule 3: fishing is gone entirely. fishCast() and its whole flip-for-coins path are deleted
// rather than left dormant — a function nothing calls is exactly the dead code the house rules
// exist to prevent. Coins now enter play only at a dock (rule 10) and by calling a battle
// correctly (rule 5). The sugarfish/candycrab art and the "fishing" sfx stay on disk in the
// shared ../assets and ../sfx, untouched, because v1 still uses them.
export function reachable(p){
  // v2 rule 1, and the ONE place the human's highlighted squares are computed. The rule itself
  // lives in the engine (Game.sailStates) so the board a player is shown can never disagree with
  // where a bot is allowed to sail — humans and bots read the same function. A human may
  // deliberately ride the trade winds, so the rim stays a legal destination here (throughRim);
  // bots stay out of the channel except via rimEscape().
  return [...appState.game.sailStates(p,{throughRim:true}).keys()].map(k=>k.split(",").map(Number));
}
// D-25/D-35 (Wyatt-approved 2026-07-29): the one sail-prompt message, shared by BOTH transports —
// the host's own localPickCell() and a guest's remotePickHighlights(). Previously the guest path
// hardcoded its own separate sentence instead of rendering what the host composed, so the same
// player read two different prompts depending on whether they happened to be the host or a guest
// (D-35's sweep finding: guest-side code must render text, never author it).
/* A SELF-CHECK, run every time a human is shown their sail options.
   Wyatt reported being able to sail 3 squares upwind. Everything testable says that cannot happen:
   an independent brute force over every path of length <= 4 agrees with the game's own reachability
   on 1,920 board/position/wind combinations, click handlers are bound only to legal squares, and a
   highlight rect's centre is (c+0.5)*cellPx — identical to where ships are drawn, so nothing is
   displaced. I could not reproduce it, and rather than argue from a screenshot, this checks the
   invariant live, on his phone, at the exact moment he is looking at it.

   It re-derives the legal set from scratch — deliberately NOT by calling sailStates, since a bug in
   sailStates would then be compared against itself — and also compares the wind the COMPASS is
   drawn from (the current event) against the wind MOVEMENT is computed from (game.windNow), because
   if those two ever drift the player is being shown one wind and moved by another.

   Costs a few hundred node visits per prompt, i.e. nothing. If it ever fires, the message names the
   wind, the position and the offending squares — so the screenshot IS the bug report. */
export function sailSelfCheck(p,cells){
  const g=appState.game,wind=g.windNow;
  if(!wind||!p||!p.pos)return null;
  const passable=o=>!g.blocked(o)&&!g.isIsland(o)&&!g.isHome(o);
  // A BAKING captain is off the board (Game.inPlay: !done && !baking) — no storm moves them and
  // their square is a legal landing. This check predated the bake-off and still counted them as
  // occupying, so on a bake day it flagged the (correct) squares beside Tortuga as illegal —
  // Wyatt's DAY-15 screenshot, wind N at 10,9, cells 8,7/7,8: both held baking captains. The
  // engine was right; the check was stale.
  const occupied=o=>g.players.some(q=>q!==p&&!q.done&&!q.baking&&q.pos[0]===o[0]&&q.pos[1]===o[1]);
  const origin=p.pos.join(",");
  const legal=new Map();
  const walk=(cell,len,usedUp,hitRim)=>{
    if(len>0){
      const cap=usedUp?SAIL_RANGE_UPWIND:SAIL_RANGE,k=cell.join(",");
      if(len<=cap&&!occupied(cell)&&k!==origin&&(!legal.has(k)||legal.get(k)>len))legal.set(k,len);
    }
    if(len>=SAIL_RANGE||hitRim)return;
    for(const dk of Object.keys(DIRS)){
      const d=DIRS[dk],o=[cell[0]+d[0],cell[1]+d[1]];
      if(!passable(o))continue;
      const u=usedUp||dk===OPPOSITE[wind];
      if(len+1>(u?SAIL_RANGE_UPWIND:SAIL_RANGE))continue;
      walk(o,len+1,u,g.onRim(o));
    }
  };
  walk([p.pos[0],p.pos[1]],0,false,false);
  const bad=(cells||[]).filter(c=>!legal.has(c[0]+","+c[1]));
  const ev=g.events[appState.evIdx];
  const dialWind=(ev&&ev.wind)||wind;
  const problems=[];
  if(bad.length)problems.push(`illegal: ${bad.map(c=>c.join(",")).join(" ")}`);
  if(dialWind!==wind)problems.push(`compass shows ${dialWind}, movement uses ${wind}`);
  if(!problems.length)return null;
  console.error("[sail self-check]",{wind,dialWind,pos:p.pos,bad,cells});
  return `⚠️ SAIL BUG — screenshot this: wind ${wind} at ${p.pos.join(",")} · ${problems.join(" · ")}`;
}
export function sailPickMsg(seat){
  // v2 rule 2: sailing is FREE, so the (−1🌕) parenthetical is gone.
  return `${pn(seat)}: tap to sail`;   // /4 playtest 6: one line — the card must stay small
}
// The wind's effect on THIS move, spelled out at the moment the move is made. The highlighted
// squares already encode rule 1 exactly, but they encode it silently: a captain who misreads the
// compass reads the highlights as a bug rather than as the rule. Naming the direction and both
// ranges here means the prompt and the board can never disagree, and there is nothing left to
// infer from the dial. (Wyatt, 2026-08-05, reported "sailed 3 upwind" after taking the forecast
// needle for the live one — the engine was right and the display was ambiguous.)
export function sailWindHint(){
  const w=appState.game.windNow;
  if(!w)return null;
  const arrow={N:"↑",E:"→",S:"↓",W:"←"}[w]||"";
  return `🌬️ Wind blows <b>${DIRNAME[w]}</b> ${arrow} — ye can run <b>4 squares</b> with it or across it, but only <b>2</b> if yer route bites into it.`;
}
// G25 (Wyatt-approved 2026-07-30, D-55 PULLED FORWARD): THE ONE PLACE that decides what a sail
// square looks like. Asked whether the four host/guest drifts were structurally fixed so they
// cannot drift again, he said: "yes, add it and pull D-55 forward." Deferred to Phase 16 twice; it
// was the last of the four never fixed at all.
//
// THE GAP, MEASURED. The host drew rx:6, fill #ffc23a, the sailCell class and a per-square
// animation-delay stagger. The guest drew rx:5, fill:#fdb63d, opacity:.4 and NO CLASS AT ALL — so a
// guest's move options were a different orange, dimmer, didn't pulse, didn't respond to the cursor
// and ignored prefers-reduced-motion. Two players in one game looked at materially different boards.
//
// FIXED BY CONSTRUCTION, NOT BY COPYING ATTRIBUTES. Copying the host's attribute list into the
// guest is the same "match by discipline" that produced four drifts; one builder means there is
// nothing left to keep in sync. Same reasoning as sailPickMsg() above, which this sits beside —
// the established home for "the one thing both transports share". Each caller keeps its own
// click handler and its own hs.push(r); only the RECT is shared.
//
// THE INLINE fill STAYS, and that is load-bearing: .sailCell sets opacity, animation,
// transform-box/origin and transition but does NOT set fill (verified at index.html:424-426), so
// dropping the inline fill would give BOTH boards default-black squares. If .sailCell ever gains a
// fill, re-derive this — scripts/host_guest_parity_check.js and this comment are the only warning.
// The guest's old opacity:.4 goes: .sailCell supplies .5 and the keyframes animate it.
// UI-03: the highlight is 10% smaller than it was. The old geometry was a flat 2px inset
// (width: cellPx-4); SAIL_HL_SCALE shrinks that square about its own centre, so the inset is
// derived rather than a second hand-tuned number that could drift from the scale.
//
// Deliberately changed HERE and only here. This builder is G25's shared host/guest surface — the
// entire reason it exists is that the two boards used to drift — so a size change made in one
// renderer would recreate D-55 exactly. scripts/host_guest_parity_check.js asserts they stay one.
//
// The CSS bounce ratio (scale 1 -> 1.11) is left alone on purpose: "10% smaller" reads as the
// resting size, and rescaling the animation too would flatten the bounce rather than shrink it.
const SAIL_HL_SCALE=0.9;
export function sailHighlightRect(c,cellPx,svg){
  const side=(cellPx-4)*SAIL_HL_SCALE, inset=(cellPx-side)/2;
  return el("rect",{x:c[0]*cellPx+inset,y:c[1]*cellPx+inset,width:side,height:side,rx:6,
    fill:"#ffc23a",class:"sailCell",style:`cursor:pointer;animation-delay:${((c[0]+c[1])%4)*0.12}s`},svg);
}
export function pickCell(p,cells){
  if(appState.replaying){
    if(appState.dlogIdx<appState.dlog.length){appState.dlogN++;return Promise.resolve(appState.dlog[appState.dlogIdx++]);}
    endReplay();
  }
  setActor(p.idx);
  // /4 stage: frame the whole sail window once the highlight cells exist (they are drawn just
  // after this call returns its promise — a beat later is soon enough for a lerping camera).
  if(window.__pp4)setTimeout(()=>window.__pp4.sailCells(),180);
  // @copy misc.draftwait.sailchoosing
  // D-10 DELIVERY (F7): same conversion as ask() — the spectator line is the neutral broadcast and
  // the ACTOR's variant is the empty string (their own board highlighting is their feedback). This
  // used to branch on appState.mySeat, which is the HOST's seat, so one client's answer was sent to
  // the whole table and no guest ever saw "is choosing where to sail".
  netHandlers().onBroadcast(`${pn(p.idx)} is choosing where to sail…`,[{seat:p.idx,html:""}]);
  armClock(p.idx);
  const base=decisionIsLocal(p.idx)?localPickCell(p,cells)
    :netHandlers().onRemotePrompt(p.idx,{kind:"pick",cells,msg:sailPickMsg(p.idx)});
  const cellP=withShotClock(p.idx,base,null);
  return cellP.then(c=>{netHandlers().onLogDecision(c);return c;});
}
/* ================= the bake-off's decision seam =================

   bakeoffPrompt(p,setup,fallback) — one captain's attempt, made REPLAYABLE and CLOCKED. It is
   pickCell()'s shape, and it exists for a specific failure rather than for symmetry.

   REPLAY. Without a logged decision, a solo refresh mid-bake would re-run the attempt with the
   engine's own botGuess instead of what the player actually did. That is not a cosmetic difference:
   a different answer locks different bowls, and the NEXT shuffle draws only from the unlocked ones,
   so the r() stream diverges from that point and the rest of the voyage is a different game.

   THE CLOCK. A bake was previously the one decision in the game with no shot clock at all — an
   absent player at the ovens stalled the table forever, in a mode whose whole point is that
   everyone else keeps taking turns. It is armed LATE, by playBakeoffLive itself once the preview
   and swaps are done: arming at prompt time would spend ~4.5s of a 30s window on animation the
   player cannot act during. `armed` is what withShotClock chains onto, exactly as ask() does — it
   returns `base` unwrapped unless the seat is already the armed one, so the order matters.

   PASS THE DEVICE FIRST. A bake is a whole turn, but it is taken in the END-OF-DAY loop rather
   than the seat loop, so it never passes through humanTurn — and humanTurn is where every other
   handoff happens. Without the gate here, pass-and-play hands the bench to whoever last held the
   board: the preview would play in the wrong person's hands, and two captains baking on the same
   day would get no handoff between them at all. passGate is a no-op in solo and whenever the
   device is already with the right seat, so this costs those modes nothing.

   THERE IS NO REMOTE PATH, and that is a decision rather than an omission. Wyatt, 2026-08-08:
   *"This is all built for v2 which doesn't have multiplayer — we're testing the game dynamic."*
   v2's welcome screen has no Host a Crew or Join a Crew (index.html), and in the two modes it does
   ship every human seat is local — solo has one, and pass-and-play treats them all as local. So a
   remote branch would be unreachable code whose only behaviour is to forfeit somebody's bake to
   the bot without telling them. The FALLBACK below is a different thing and is genuinely live: it
   is the shot-clock forfeit, which any mode can hit. */
export async function bakeoffPrompt(p,setup,fallback){
  await (ffEndNow()||0);   // the bake is his own hands-on turn — recap first if a skip was live
  // Before the replay early-return, exactly as humanTurn does it: passGate self-handles replay by
  // silently syncing appState.mySeat rather than showing anything, and a baker never takes an
  // ordinary turn on the day they bake — so this is the ONLY thing keeping mySeat in step with a
  // baking seat across a resumed pass-and-play voyage.
  await passGate(p.idx);
  if(appState.replaying){
    if(appState.dlogIdx<appState.dlog.length){
      appState.dlogN++;
      const rec=appState.dlog[appState.dlogIdx++];
      // Logs written before rewatching existed hold a bare guess array; normalise so every caller
      // downstream sees one shape.
      return Array.isArray(rec)?{g:rec,w:0}:rec;
    }
    endReplay();
  }
  setActor(p.idx);
  netHandlers().onBroadcast(`${pn(p.idx)} steps up to the ovens…`,[{seat:p.idx,html:""}]);
  // NO decisionIsLocal BRANCH, deliberately. v2 ships solo and pass-and-play only — Host a Crew and
  // Join a Crew are gone from the welcome screen (index.html) — and in both of those every human
  // seat is local by definition. A remote branch here would be a path no test can reach and no
  // player can trigger, whose only behaviour is to hand somebody's bake to the bot without saying
  // so. A silent forfeit down a dead branch is strictly worse than not having the branch.
  let resolveArmed;const armed=new Promise(res=>{resolveArmed=res;});
  // Spending a coin goes through the ENGINE, live, one at a time — so the purse on screen drops the
  // moment the player buys a look rather than after the whole prompt resolves. `canAfford` lets the
  // button grey out without the UI having to know the price.
  const onRewatch=(n)=>appState.game.bakeRewatch(p,n)>0&&(liveRender(),true);
  onRewatch.canAfford=()=>p.coins>=BAKE_REWATCH_COST;
  const base=playBakeoffLive(p,setup,()=>{armClock(p.idx);resolveArmed();},onRewatch);
  // Belt: playBakeoffLive can return before it ever arms, because it bails out if the bench failed
  // to render. `armed` must still settle or the chain below waits forever and the voyage stops,
  // which is worse than an unclocked decision.
  base.then(()=>resolveArmed(),()=>resolveArmed());
  return armed.then(()=>withShotClock(p.idx,base,null))
    .then(r=>{
      // playBakeoffLive resolves {guess,rewatches}; a shot-clock forfeit resolves null and forfeits
      // to the engine's own guess, having bought nothing.
      const answer=fillLocked(p.bake,(r&&r.guess)||fallback);
      const watched=(r&&r.rewatches)||0;
      // LOGGED TOGETHER, as one decision. The coins a rewatch spends are game state that the
      // end-of-voyage ranking reads, so a resume that replayed the guess but not the spending would
      // rebuild a captain with the wrong purse. One entry, both facts.
      const dec={g:answer,w:watched};
      netHandlers().onLogDecision(dec);
      return dec;
    });
}
// A guess carries null at every step already solved on an earlier attempt — scoreAttempt accepts
// that, but the decision log should not have to. Solo and pass-and-play persist the log as JSON in
// localStorage, which round-trips a null happily; the reason to fill them in anyway is that a
// logged guess is then always five plain bowl indices, so replaying one is never the question "was
// this step null because it was locked, or because something went wrong writing it?". The locked
// steps' answers are known by definition, so filling them in loses nothing.
function fillLocked(bake,guess){
  return guess.map((bowl,k)=>bowl==null?bake.slots.indexOf(bake.order[k]):bowl);
}

export function localPickCell(p,cells){
  // his sail prompt — the natural end of every full-round skip; recap first, prompt after
  const pre=ffEndNow();
  if(pre)return pre.then(()=>localPickCell(p,cells));
  return new Promise(res=>{
    const svg=$("board"),hs=[];
    const done=v=>{hs.forEach(h=>h.remove());panel("");appState.activePickCleanup=null;res(v);};
    appState.activePickCleanup=()=>{hs.forEach(h=>h.remove());panel("");};
    // notes/edits UI-06: the sail squares read as obviously tappable — brighter fill, a soft bounce
    // so they draw the eye, and a hover state that pops the square and deepens the colour. Each
    // square's bounce is phase-offset a touch by its board position so they shimmer rather than
    // pulse in dead unison. transform-box:fill-box + centered origin keeps the scale centered.
    // G25: those attributes now live in sailHighlightRect() above, shared with the guest path.
    // notes/edits 11-03: cellPx now read via boardCell() — cell itself lives in src/ui/board.js.
    const cellPx=boardCell();
    cells.forEach(c=>{
      const r=sailHighlightRect(c,cellPx,svg);
      r.addEventListener("click",()=>done(c));
      hs.push(r);
    });
    // @copy prompt.sail.pickpanel
    // The wind hint goes in .apSub — last in the DOM, so it is revealed last, per the standing
    // top-to-bottom rule for anything added to #actionPanel.
    // the self-check's shout, if it ever fires, REPLACES the ordinary hint — it is the only thing
    // that matters on screen at that point
    const bug=sailSelfCheck(p,cells);
    // /4 playtest 6: the standing wind-helper line leaves the sail card (the pill carries the
    // wind; the card must stay one line tall for placement freedom). The self-check's red shout
    // still renders when it fires — that one is a bug report, not a hint.
    const hint=bug;
    panel(`<div class="apMsg">${sailPickMsg(p.idx)}</div>
      <div class="apBtns"><button class="apBtn" id="apStay">Stay put</button></div>`+
      (hint?`<div class="apSub" style="color:#b3261e;font-weight:bold">${hint}</div>`:``),true);
    $("apStay").onclick=()=>done(null);
  });
}
// v2 rules 2 and 8 delete three v1 helpers outright rather than leaving them dormant:
//   brokeSailLine   — sailing is free now, so nobody is ever too poor to move;
//   brokeAnchorLine — there is no anchor to afford; a storm asks nothing and costs only the turn;
//   counterHeadroom — a counter-offer's price is NAMED by the captain being asked (rule 4), never
//                     computed against a bot's spare change.
// A function nothing calls is exactly the dead code D-33/D-34/D-40 exist to prevent.
// G6 (Wyatt-approved 2026-07-30): *"yes, build this check and apply it to all situations."*
//
// COIN-AUDIT.md's root cause, in its own sentence: **affordability is checked when the option list
// is BUILT, the purse is debited AFTER the click, and the 20-second shot-clock penalty
// (applyShotClockPenalty in src/ui/util.js, which takes Math.min(1,p.coins) from the DECIDING seat)
// fires inside exactly that window.** `appState.turnExpired` does not protect against it: that flag
// is set at 30 seconds, and every guard in the codebase checks it — the coin penalty fires at 20
// and sets no flag at all, so those guards sail straight past it.
//
// The audit's correction to its own framing is the important part: this is not eight independent
// debit sites, it is ONE MISSING STEP repeated at eight of them — re-validate affordability after
// the await, immediately before the debit. Hence one shared helper rather than eight edits.
//
// Returns the SHORTFALL: 0 means clear (the purse covers the debit, proceed), any positive number
// means it does not. A negative or non-finite debit reports Infinity rather than 0, so a nonsensical
// value can never clear and turn a debit into a silent CREDIT to the purse.
//
// Why the engine needs no such thing, stated so nobody adds one there: `Game.play()` is fully
// SYNCHRONOUS. There is no `await` anywhere between an engine affordability gate and its matching
// debit, so no timer can interleave — which is why the audit found zero AT RISK rows in
// src/engine/index.js, and why nothing here goes near the 31 determinism fixtures.
export function coinShortfall(debit,purse){
  if(!Number.isFinite(debit)||debit<0)return Infinity;
  return Math.max(0,debit-purse);
}
// CR-02 (15-REVIEW.md; PRE-EXISTING since Phase 11): the CRATE half of what coinShortfall does for
// coins. G6 gave coins re-validation after the await; crates were never given the same treatment.
//
// The defect this exists to make unwritable, in one line:
//
//     q.ing.splice(q.ing.indexOf(want),1);  // want absent -> -1 -> splice(-1,1) removes the LAST crate
//     p.ing.push(want);                     // ...and mints a crate that is ALSO back in tokens[]
//
// It is REACHABLE, not theoretical. expireShotClock (src/orchestrator.js) resolves the pending
// `ask()` promise BEFORE it confiscates a random crate, and `ask()` forces default index 0 — which
// on the accept prompt is **Accept**. So a partner who times out auto-accepts a trade for a crate
// the clock has just taken from them, and the trade then removes a different crate entirely.
//
// Why a helper rather than four guarded call sites: 15-LEARNINGS #3 — "the dominant failure mode
// was the PARTIAL fix, not the missed one" — and its preferred remedy (a), one shared function both
// paths call. Putting the lookup and the mutation inside the same function means they cannot drift
// apart later, which is exactly how G18/G15/G29/CR-01 each happened.
//
// Returns TRUE when the crate moved, FALSE when `from` does not hold `ing` — and on false it
// mutates NOTHING, so a caller that validates both legs before moving either can never leave a
// half-completed trade behind. Defensive about junk input for the same reason coinShortfall reports
// Infinity for a negative debit: a nonsensical value must never be coerced into a mutation.
export function moveCrate(from,to,ing){
  if(!Array.isArray(from)||!Array.isArray(to)||ing==null)return false;
  const i=from.indexOf(ing);
  if(i<0)return false;
  from.splice(i,1);
  to.push(ing);
  return true;
}
// G14 (Wyatt-approved 2026-07-30): the ordered rim cells a trade-wind sweep passes THROUGH, from
// just after `from` up to and including its arc head. PURE and DOM-free, so it is tested headlessly
// over real boards in scripts/narration_flow_test.js. Never includes `from` itself.
//
// Wyatt: *"the tradewinds to move players square-by-square, quickly… then we don't need a new
// narration line, and the players are just seeing what happens."* He watched a storm push a bot onto
// the rim and the sweep return it invisibly, so the boat appeared not to move.
//
// A GUEST CAN DO THIS TOO, and the earlier claim that it needed the event stream was WRONG — say so
// here, because the conflation is what parked this for a phase. A storm push is SIMULATION:
// intermediate squares depend on collisions, docks, other ships and the aground ladder, none of
// which a guest can replay from one event — that is why STORM-02 is parked, on its own merits. A RIM
// SWEEP IS PURE GEOMETRY between two known points on a STATIC ring. `rimCellInfo`
// (src/engine/index.js:92) is the ordered, arc-tagged ring, built once at construction from board
// layout, and a guest's game object carries it identically. Different class of problem entirely.
//
// WHY THE SLICE IS CORRECT — the two structural facts, from the constructor:
//   1. arcs are CONTIGUOUS in `cells` (built `for q…for i…cells.push({...ring[idx++],q})`), and
//   2. each arc's head is its LAST member (`for(const c of cells)heads[c.q]=c` — last write wins).
// Together: headIdx >= fromIdx always, within one arc, with no wraparound. So a plain forward slice
// is the whole answer.
export function rimSweepPath(game,from){
  if(!game||!game.isRound||!game.rimCellInfo||!from)return [];
  const key=from[0]+","+from[1];
  const cells=game.rimCellInfo;
  const fromIdx=cells.findIndex(c=>c.k===key);
  if(fromIdx<0)return [];                      // not on the ring
  const head=game.rimHead&&game.rimHead[key];
  if(!head)return [];
  if(head[0]===from[0]&&head[1]===from[1])return []; // already AT its arc head — nothing to sweep
  const headKey=head[0]+","+head[1];
  const headIdx=cells.findIndex((c,i)=>i>=fromIdx&&c.k===headKey);
  if(headIdx<0)return [];
  return cells.slice(fromIdx+1,headIdx+1).map(c=>[c.x,c.y]);
}
// 2026-07-31: the PURE half of the smooth trade-wind arc — cell centres in, evenly-spaced curve
// points out. Kept pure and exported for the same reason rimSweepPath is: it can then be tested
// headlessly over real randomised boards, which is the only way this project has ever caught a
// geometry mistake before a human saw it.
//
// WHY A CURVE AT ALL. The per-square stepper it replaces was correct and looked wrong — Wyatt:
// *"it moves according to a step function instead of a smooth, rounded motion."* Landing on each
// square is right for a storm push (1-2 squares, each one meant to be read) and wrong for a boat
// carried by a current along a ring: walked one cell at a time, a ring is a staircase.
//
// Catmull-Rom through the cell centres, NOT a circular arc fitted to the ring. The rim IS very
// nearly a circle today (every rim cell sits 7.0-7.3 cells from the board centre), so a fitted arc
// would look identical and take less code — but it would bake in a board shape that the deferred
// island-redesign milestone explicitly changes. A spline through whatever cells rimSweepPath
// returns cannot go stale that way.
//
// The output is RESAMPLED to even spacing so that travelling it at a constant rate gives a constant
// SPEED. Walking the raw spline samples instead would slow down through curves and speed up on the
// straights, which is the same class of artefact this is replacing.
// `perCell` is how finely the curve itself is sampled — 48 points per ring cell, comfortably finer
// than any tick rate can consume, so the traversal is never quantised by the curve's own resolution.
// It costs a few hundred array entries once per sweep and nothing per frame, so there is no reason
// to be stingy with it. (Raised 16 -> 48 on 2026-07-31; the largest sample gap fell 0.088 -> 0.029
// cells, measured by the SMOOTH-ARC test.)
export function rimSweepCurve(cells,perCell=48){
  if(!Array.isArray(cells)||cells.length<2)return [];
  // duplicate both ends so the spline actually reaches the first and last cell rather than easing
  // out of them — the boat must start ON the square the player clicked and finish ON the whirlpool
  const P=[cells[0],...cells,cells[cells.length-1]];
  const raw=[]; const SEG=12;
  for(let i=1;i<P.length-2;i++){
    const [x0,y0]=P[i-1],[x1,y1]=P[i],[x2,y2]=P[i+1],[x3,y3]=P[i+2];
    for(let s=0;s<SEG;s++){
      const t=s/SEG,t2=t*t,t3=t2*t;
      raw.push([
        .5*(2*x1+(x2-x0)*t+(2*x0-5*x1+4*x2-x3)*t2+(3*x1-x0-3*x2+x3)*t3),
        .5*(2*y1+(y2-y0)*t+(2*y0-5*y1+4*y2-y3)*t2+(3*y1-y0-3*y2+y3)*t3),
      ]);
    }
  }
  raw.push([cells[cells.length-1][0],cells[cells.length-1][1]]);
  const cum=[0];
  for(let i=1;i<raw.length;i++)cum.push(cum[i-1]+Math.hypot(raw[i][0]-raw[i-1][0],raw[i][1]-raw[i-1][1]));
  const total=cum[cum.length-1];
  if(!(total>0))return [raw[0],raw[raw.length-1]];
  const N=Math.max(2,Math.round(perCell*(cells.length-1)));
  const out=[]; let j=0;
  for(let k=0;k<=N;k++){
    const d=total*k/N;
    while(j<cum.length-2&&cum[j+1]<d)j++;
    const span=cum[j+1]-cum[j], f=span>0?(d-cum[j])/span:0;
    out.push([raw[j][0]+(raw[j+1][0]-raw[j][0])*f,raw[j][1]+(raw[j+1][1]-raw[j][1])*f]);
  }
  return out;
}
// eased 0..1 — the winds take hold, then the whirlpool receives the boat rather than snapping it
const rimSweepEase=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
// ── THE TWO FUNCTIONS BELOW ARE THE SWEEP'S MOTION, AND THE ONLY COPY OF IT ────────────────────
// Extracted 2026-07-31 so scripts/rim_sweep_trace_test.js can enumerate exactly what the live
// animation will aim at, without a browser. That harness is only worth anything if it measures the
// REAL motion rather than a re-implementation that can drift, so animateRimSweepIfAny below calls
// these and does no position maths of its own — and host_guest_parity_check.js assertion 4 fails if
// it ever stops doing so. Both are pure: no DOM, no clock, no state.
export function rimSweepDurationMs(cellCount){
  return Math.min(RIM_SWEEP_MAX_MS,Math.max(RIM_SWEEP_MIN_MS,Math.round(RIM_SWEEP_MS_PER_CELL*cellCount)));
}
// position at progress `t` (0..1) along an already-built curve, easing included
export function rimSweepPointAt(curve,t){
  if(!Array.isArray(curve)||curve.length<2)return null;
  const u=rimSweepEase(Math.min(1,Math.max(0,t)))*(curve.length-1);
  const i=Math.min(curve.length-2,Math.floor(u)), f=u-i;
  return [curve[i][0]+(curve[i+1][0]-curve[i][0])*f,curve[i][1]+(curve[i+1][1]-curve[i][1])*f];
}
// G14 (Wyatt-approved 2026-07-30): THE ONE TRADE-WIND STEPPER, called identically by the host sites
// and by the guest's watchEvents(). Takes NO PARAMETERS on purpose — no call site can pass something
// a different call site doesn't, so the two tiers cannot be paced or aimed differently.
//
// Derives its path from the EVENT STREAM, which both tiers have: the last event must be a
// `tradewind`; `to` is that event's own state snapshot, `from` is the PREVIOUS event's. It then
// refuses to animate unless rimSweepPath(from) is non-empty AND lands exactly on `to`. NEVER
// INVENTS A PATH — if the derivation does not check out, it returns and today's instant render
// stands.
//
// WHERE THE DERIVATION HOLDS (an event exists AT the entry cell):
//   - a human sailing into the rim — the `sail` event is emitted at the entry cell
//   - a human storm push onto the rim — `windmove`/`blownOut` likewise
//   - the engine's rimEscape() — `windmove` at the rim cell, THEN the sweep. That is exactly the
//     bot-teaching case G18 just turned on.
// WHERE IT FALLS BACK to today's instant render, honestly listed rather than overclaimed:
//   - the engine's INTERNAL windPush sweep (a bot storm), which emits nothing between stepping onto
//     the rim and sweeping, so there is no `from` to read
//   - the battle-flee sweep (src/orchestrator.js), where `def.pos=dest` is not recorded before
//     tradewind() runs
// Both render exactly as they do today — no regression, and no invented path. Closing that residue
// would require the ENTRY CELL in the event stream, i.e. the STORM-02 class of change, which stays
// parked on its own merits and is NOT added to the re-record batch.
let _lastSweptEvIdx=-1;
// Returns true only when a ride actually animated — runStormLive uses that to know whether its
// own reconstructed-entry fallback (animateRimSweepRun below) still needs to play the ride.
export async function animateRimSweepIfAny(){
  const g=appState.game;
  if(!g||appState.replaying)return false;
  const n=g.events.length;
  if(n<2)return false;
  const last=g.events[n-1];
  if(!last||last.t!=="tradewind")return false;
  // RE-ENTRY GUARD: a module-local index, NEVER a flag stamped on the event object. The host
  // broadcasts events verbatim (pushEvents -> JSON.parse(JSON.stringify(...))), so an extra field
  // would leak straight into the Firebase payload and can trip scripts/net_contract_check.js.
  if(_lastSweptEvIdx===n-1)return false;
  _lastSweptEvIdx=n-1;
  const seat=last.p;
  const prev=g.events[n-2];
  if(!last.state||!prev||!prev.state)return false;
  const to=last.state[seat]&&last.state[seat].pos;
  const from=prev.state[seat]&&prev.state[seat].pos;
  if(!to||!from||!g.onRim(from))return false;
  return animateRimSweepRun(seat,from,to);
}
// /4 (Wyatt's playtest, storm rides): the SAME guarded ride, callable with an explicitly known
// entry cell. A swept storm step emits nothing between stepping onto the rim and tradewind()
// (see the fallback list above), so the event stream cannot supply `from` — but runStormLive
// holds the pre-step square in its hand and stormStep moves exactly ONE straight square downwind
// before the sweep, so the driver can reconstruct the entry cell first-hand. Same discipline:
// derive the path and REFUSE TO GUESS — if rimSweepPath from the given cell does not land
// exactly on `to`, no animation happens and today's instant render stands.
export async function animateRimSweepRun(seat,from,to){
  const g=appState.game;
  if(!g||appState.replaying)return false;
  const path=rimSweepPath(g,from);
  if(!path.length)return false;
  const end=path[path.length-1];
  if(end[0]!==to[0]||end[1]!==to[1])return false;   // the derivation disagrees with the engine — do not guess
  // the ride spans the rim — pull the camera to the full board first, or the whole sweep can play
  // past the edge of a zoomed-in view (a no-op outside the /4 stage)
  if(window.__pp4&&window.__pp4.sweepCam)window.__pp4.sweepCam();
  try{
    // ── PART A: ARRIVE IN THE TRADE WINDS FIRST ──────────────────────────────────────────────
    // The square the player clicked was never drawn. liveRender() at the call site DOES write it,
    // but the very next statement (this function, synchronously through to its first await) wrote
    // path[0] over the top of it — and a browser paints once per task, so only path[0] ever
    // reached the screen. The sweep therefore began with the boat still rendered INLAND, and
    // dragged it diagonally out of the middle of the board.
    //
    // paintShipAt() rather than trusting that liveRender(): render() draws from
    // events[appState.evIdx].state and evIdx is the NARRATION cursor, which can lag the emitted
    // event. This targets `from` explicitly, and moves the activeRing with it.
    //
    // The await is the load-bearing half — it is the yield that lets the browser paint the arrival
    // at all, and RIM_SWEEP_ARRIVE_MS is long enough for that glide to COMPLETE.
    // The glide is set to the SAME value we are about to wait for, so the landing completes exactly
    // as the wait ends. Leaving it at SHIP_GLIDE_MS (350) while waiting only 140 would re-create the
    // very bug this function exists to fix: the sweep re-aiming a ship that is still in flight.
    // Linear, because a 140ms ease-in-out over one square reads as a hesitation.
    if(RIM_SWEEP_ARRIVE_MS>0){
      setShipGlideMs(seat,RIM_SWEEP_ARRIVE_MS,"linear");
      paintShipAt(seat,from);
      await sleep(RIM_SWEEP_ARRIVE_MS);
    }
    // ── PART B: CARRY THE BOAT SMOOTHLY ALONG THE RING ───────────────────────────────────────
    // Interpolated along a spline, NOT stepped cell by cell. See rimSweepCurve above, and
    // RIM_SWEEP_TICK_MS in util.js, for why the per-square stepper this replaces looked wrong even
    // though it was doing exactly what it was designed to do.
    const curve=rimSweepCurve([from,...path]);
    if(curve.length>1){
      const total=rimSweepDurationMs(path.length);
      // one tick's worth of LINEAR glide, so the browser bridges between our targets and soaks up
      // setTimeout's jitter. Anything longer re-introduces the lag that made the boat cut corners.
      setShipGlideMs(seat,RIM_SWEEP_TICK_MS,"linear");
      const began=Date.now();
      for(;;){
        // progress from ELAPSED TIME, never from a tick count. A throttled or late tick then
        // advances further along the curve instead of stretching the sweep — and in a hidden tab,
        // where setTimeout is clamped to ~1s, this reaches 1 and terminates rather than crawling.
        // (rAF would not run at all there; see RIM_SWEEP_TICK_MS and src/ui/panel.js:334.)
        const t=Math.min(1,(Date.now()-began)/total);
        const p=rimSweepPointAt(curve,t);
        if(p)paintShipAtPoint(seat,p[0],p[1]);
        if(t>=1)break;
        await sleep(RIM_SWEEP_TICK_MS);
      }
    }
  }finally{
    // an interruption (turn expiry, a mid-sweep event, a thrown paint) must never strand the ship
    // part-way round the arc — nor leave it stuck on the sweep's short glide, which would make
    // every ordinary move it makes for the rest of the game snap instead of glide. Restore BEFORE
    // the corrective paint so that paint travels at the normal speed.
    setShipGlideMs(seat,null);
    paintShipAt(seat,to);
  }
  return true;
}
/* ================= v2 rules 7 + 8: the storm =================
   A storm is now ONE event for the whole table, at the top of the round, before anybody acts:
   one direction, three squares, everyone at once. It asks the player nothing.

   That deletes a great deal of v1 machinery, and the deletion is the point. Gone: windLeg's
   inline island-dodge prompt, humanWind's two-leg chain, botWindLeg's mirror of it, the
   anchor/dodge/aground/shipwreck ladder, and the second perpendicular gust. v1 needed all of it
   because a storm arrived unannounced and had to offer you a way out. v2 tells you a full round
   in advance, on the compass, which way it will blow (rule 6c) and promises the forecast is
   never wrong (rule 6d) — so the price of being caught is simply your turn, and there is nothing
   to decide. Wyatt's words: *"there are no multiple options, because now you can plan ahead."*

   Humans and bots run the identical path here — there is no longer any per-player decision for
   them to diverge on. The rule itself lives in the engine (stormStep/noteStormOutcome); this
   function only animates it, square by square, so the board is never behind the narration. */
export async function runStormLive(dirKey){
  const g=appState.game;
  g.ev({t:"storm",dir:dirKey,dist:STORM_PUSH});
  liveRender();
  await narrateLastEvent();
  // furthest downwind moves first, so the lead ship clears its square before the ship behind it
  // arrives — the engine owns that ordering too (rule 7b)
  for(const p of g.stormOrder(dirKey)){
    const wasDocked=g.adjPort(p)!==null;
    const before=[...p.pos];
    let outcome="moved";
    for(let s=0;s<STORM_PUSH;s++){
      const was=[...p.pos];
      const evBefore=g.events.length;
      outcome=g.stormStep(p,dirKey);
      const movedSquare=(p.pos[0]!==was[0]||p.pos[1]!==was[1]);
      if(movedSquare&&outcome!=="swept"){
        // D-22, carried into v2: paint THIS square before anything about the next one can narrate.
        // renderLiveShips(), not liveRender() — an ordinary storm square emits no event, and
        // render() draws ships from the last emitted event's snapshot, so liveRender() here would
        // repaint the square the ship has just left and the push would be invisible.
        // A SWEPT step is excluded: p.pos is already the whirlpool by now, so this paint WAS the
        // teleport Wyatt recorded ("swept around the rim!" with no ride). The sweep animation
        // below paints its own arrival at the entry square instead.
        renderLiveShips();
        await sleep(STORM_STEP_MS);
      }
      if(outcome==="swept"){
        // The event-derived animator declines a storm sweep (no rim-entry event exists to read —
        // its own documented fallback), so reconstruct the entry square the driver knows
        // first-hand: stormStep moved exactly one straight square downwind from `was` before
        // tradewind() fired. animateRimSweepRun re-derives the path and refuses to guess.
        if(!await animateRimSweepIfAny()){
          const entry=[was[0]+DIRS[dirKey][0],was[1]+DIRS[dirKey][1]];
          if(g.onRim(entry))await animateRimSweepRun(p.idx,entry,[...p.pos]);
        }
        liveRender();
      }
      // stormStep records its own `blocked` event when a ship holds the square ahead
      if(g.events.length>evBefore){liveRender();await narrateLastEvent();}
      if(outcome!=="moved")break;
    }
    const moved=(p.pos[0]!==before[0]||p.pos[1]!==before[1]);
    const evBefore=g.events.length;
    g.noteStormOutcome(p,outcome,moved,wasDocked);
    if(g.events.length>evBefore){liveRender();await narrateLastEvent();}
  }
  liveRender();
}
/* v2 rules 10 + 11: dock, then buy.
   The flip is a TREASURE HUNT, not a grab for the crate: heads you turn up buried treasure
   (cfg.dockHeads), tails you spend the turn working the dock as a hand (cfg.dockTails). There is no free crate any
   more — crates are bought, won in battle, or traded for. The purchase is offered after EITHER
   outcome, on the same turn, with the coins just earned (rule 10a/10c), and the price is
   6 − however many crates are left on the island, so it climbs 3 → 4 → 5 as the island empties. */
export async function humanDock(p,port){
  setActor(p.idx);
  const ing=port;
  const g=appState.game;
  // v2 rule 10d: an empty island still pays. There is treasure in the sand and work on the dock
  // whether or not there is a crate left to sell, so the flip always happens — unlike v1, which
  // skipped it. Keep this in step with Game.doDock or bots and humans diverge on the rule.
  // G-v2 (Wyatt-approved 2026-08-05): the prompt used to be a bare "flip!" that never said what
  // the flip was FOR — his report: *"it currently just tells you to flip for no reason."* The
  // message stays short and the rules go in the helper line, which is where the narration box
  // already puts explanatory text (and, per the standing top-to-bottom rule, is revealed last).
  // @copy misc.paramprompt.dockflip
  const h=await humanFlip(p,`Docking at ${iconImg(ING_IMG[ing])} ${dockPlace(ing)} — dig for treasure!`,true,
    `⚪ HEADS strikes buried treasure <span class="nobrk">(+${g.cfg.dockHeads}🌕)</span> · ⚫ TAILS is a turn's work on the docks <span class="nobrk">(+${g.cfg.dockTails}🌕)</span>. Either way, ye may then buy a crate.`);
  if(h==="back")return "back";
  p.coins+=h?g.cfg.dockHeads:g.cfg.dockTails;
  let got=h?"treasure":"dockhand";
  const price=g.cratePrice(ing);
  /* THE CAPTAINS PANEL IS DRAWN FROM THE LAST EVENT'S SNAPSHOT, not from live player state — so
     coins earned here stayed invisible until the `dock` event was finally emitted, which is AFTER
     the buy prompt has been answered. Wyatt, 2026-08-05: the total "does not update until the very
     end of your turn, which is confusing". He is right, and it matters most exactly here, because
     the buy prompt asks him to spend money the panel says he does not have yet.
     A silent event carries the new snapshot immediately. It narrates nothing (see EVENT_NARRATION
     .purse) and logs nothing — its whole job is to make the panel tell the truth. Every other coin
     change in the game emits its event in the same breath as the mutation; this one could not,
     because a prompt sits in between. */
  g.ev({t:"purse",p:p.idx});
  liveRender(); // the purse changed — show it before the buy prompt prices anything against it
  let buy=null;
  if(g.cfg.dockBuy&&price!==null){
    // F9/D-41: the affordability test decides only whether the option is CLICKABLE, never whether
    // it is SHOWN. A captain who cannot afford today's price still learns that buying was possible
    // and what it now costs — which is exactly how the rising-price rule teaches itself.
    const canBuy=p.coins>=price;
    const left=g.tokens[ing];
    const black=left<1e9&&left<=0;
    const scarcity=black
      // @copy misc.blackmarket.whisper — draft, Wyatt rewrites
      ?` The shelves be bare… but after dark, anything's fer sale.`
      :(left<1e9&&left<=1)?` Last one on the island!`:``;
    const v=await ask(`${h?"⚪️ TREASURE!":"⚫️ TAILS — a turn on the docks."} Buy ${dockFlavorIcon(ing)}?`,[
      {label:`Buy ${ilabelImg(ing)} <span class="nobrk">(−${price}🌕)</span>`,short:`Buy ${iconImg(ING_IMG[ing])} −${price}🌕`,value:true,disabled:!canBuy},
      {label:"Nah",value:false}],
      null,canBuy?(scarcity||null)
        :black?`The black market wants ${price}🌕 — more than ye carry.`
        :`The price has risen to ${price}🌕 — more than ye can pay.`);
    // D-40 safety net: buyCrate re-reads the purse itself — `canBuy` was computed BEFORE the
    // await, and the shot clock's penalty can take a coin while this prompt sits open. One
    // purchase path with the bots (Game.buyCrate), so the two can never diverge on the rule.
    if(v){buy=g.buyCrate(p,ing);if(buy)got="bought";}
  }
  g.ev({t:"dock",p:p.idx,ing,heads:h?1:0,got,price,
    black:buy?buy.black:0,wentDry:buy?buy.wentDry:0,firstDry:buy?buy.firstDry:0});
  await narrateLastEvent();
  p.firstFlip.add(ing);p.dockedNow.add(ing);
  liveRender();
}
/* ================= v2 rule 4: the table-wide open trade =================
   You no longer hail one captain. You stand on your deck and announce to the whole Sugar Seas
   WHAT YE WANT and WHAT YE'LL GIVE. Everyone holding it answers — accept, deny, or name their
   price — and you see every answer at once, then take one or walk away. One round: a counter
   cannot itself be countered (rule 4c). No harbor-tax refund any more (rule 4e).

   Cargo is public, so the "what do ye want" picker lists every ingredient in the game and greys
   out the ones nobody is holding — Wyatt's ruling: *"You can ask for any crate you want, but
   those not on the table should be greyed out."*

   Kept as a little step machine, exactly like v1's: Back moves to the PREVIOUS prompt, and only
   Back out of the first prompt returns to the action menu. Inputs accumulate in `st` so
   revisiting a step keeps what you already picked (UI-08). */
/* /4 playtest 13: the COIN STEPPER — replaces both "How many?" option grids, the last of the
   yellow boxes. The pill names the DIRECTION in every step (GIVIN' vs ASKIN', Wyatt's exact
   complaint: "it isn't clear if you're offering those coins or asking for them"), and the
   circles adjust one coin at a time. Each tap is a real ask(), so the shot clock re-arms and
   the decision log records every step exactly as it always did — replay-safe by construction. */
async function coinStepper(msgFor,start,min,max,confirmLabel,extraOpt){
  let n=start;
  for(;;){
    const opts=[
      {label:"− 1🌕",value:"minus",disabled:n<=min},
      {label:"+ 1🌕",value:"plus",disabled:n>=max},
      {label:confirmLabel,value:"ok",cls:"primary"},
    ];
    if(extraOpt)opts.push(extraOpt);
    opts.push({label:"← Back",back:true,value:"__back__"});
    const v=await ask(msgFor(n),opts);
    if(appState.turnExpired)return null;
    if(v==="minus")n=Math.max(min,n-1);
    else if(v==="plus")n=Math.min(max,n+1);
    else if(v==="ok")return n;
    else if(v==="__back__"||v==null)return "__back__";
    else return v;   // the extra option's value (e.g. "deny")
  }
}
export async function humanTrade(p){
  setActor(p.idx);
  const g=appState.game;
  const st={want:undefined,baseIng:undefined,extraCoins:undefined};
  let step=0;
  while(step<3){
    // CR-02 layer 1: the shot clock can expire on ANY prompt below. No partial trade, ever.
    if(appState.turnExpired)return false;
    if(step===0){
      // every crate in the game, with the ones nobody holds greyed out (rule 4, Wyatt's ruling)
      const opts=g.ings.map(i=>{
        const holders=g.holdersOf(i,p);
        return {label:ilabelImg(i),value:i,disabled:!holders.length};
      });
      const anyHeld=opts.some(o=>!o.disabled);
      // @copy adhoc.trade.nocargo
      if(!anyHeld){await flash("No one has cargo to trade for.");return false;}
      opts.push({label:"← Back",back:true,value:"__back__"});
      // @copy prompt.trade.want
      const want=await ask("What do ye WANT from the table?",opts,null,
        `Greyed-out crates are ones no captain is carryin'.`);
      if(want==="__back__"||want==null)return false;
      st.want=want;step=1;
    }else if(step===1){
      // An offer is a crate, coins, or both — sweeten a crate with a few coins on top.
      const canOfferCoins=p.coins>0;
      const ingOpts=[...new Set(p.ing)].map(i=>({label:ilabelImg(i),value:i}));
      ingOpts.push({label:"— coins only —",value:"__coinsonly__",disabled:!canOfferCoins});
      ingOpts.push({label:"← Back",back:true,value:"__back__"});
      const offerSub=canOfferCoins?null:`Ye don't have any coin to offer — pick a crate instead.`;
      // @copy prompt.trade.give
      const baseIng=await ask(`What will ye GIVE for ${ilabelImg(st.want)}?`,ingOpts,null,offerSub);
      if(baseIng==="__back__"){step=0;continue;}
      if(baseIng==null)return false;
      st.baseIng=(baseIng==="__coinsonly__")?null:baseIng;step=2;
    }else{ // step 2 — playtest 13: the coin stepper, never an option grid
      const maxC=Math.min(6,p.coins);
      const minC=st.baseIng?0:1; // a coins-only offer needs at least 1 coin
      if(maxC<minC){
        // @copy prompt.trade.nothingtooffer
        await ask("Ye don't have any to offer!",[{label:"← Back",back:true,value:-1}]);
        step=1;continue;
      }
      const giveBits=n=>[st.baseIng?ilabelImg(st.baseIng):null,n?`${n}🌕`:null].filter(Boolean).join(" + ");
      // @copy prompt.trade.addcoins
      const n=await coinStepper(
        k=>`Ye're GIVIN' ${giveBits(k)} for ${ilabelImg(st.want)}`,
        minC,minC,maxC,"Offer it!");
      if(n==null)return false;
      if(n==="__back__"){step=1;continue;}
      st.extraCoins=n;step=3;
    }
  }
  if(appState.turnExpired)return false;
  const offer={want:st.want,giveIng:st.baseIng,giveCoins:st.extraCoins||0};
  const offerDisplay=g.offerLabel(offer,0)||"nothing";
  // announcing an offer is itself public information — the whole table now knows what p is after,
  // and that is exactly how bots learn each other's recipes without ever seeing one (see noteDemand)
  g.noteDemand(p,offer.want,1);
  g.ev({t:"openoffer",p:p.idx,want:offer.want,offer:offerDisplay});
  liveRender();
  await narrateLastEvent();

  // ---- every holder answers. Bots reason (engine-side); human captains are asked. ----
  const responses=[];
  // Only hail captains for whom something has actually changed since they last said no — the
  // memory lives in the engine so bots spam neither each other nor, more importantly, the human.
  for(const q of g.holdersOf(offer.want,p).filter(q=>g.worthReAsking(p,q,offer.want,offer))){
    if(q.strategy==="human"){
      setActor(q.idx);
      // @copy prompt.trade.accept
      const v=await ask(`${pn(q.idx)}: ${pn(p.idx)} offers ${offerDisplay} for yer ${ilabelImg(offer.want)}.`,[
        {label:`${iconImg(CHECKMARK_IMG)} Accept`,value:"accept"},
        {label:"💰 Name yer price",value:"counter"},
        {label:`${iconImg(CANCEL_X_IMG)} Deny`,value:"deny"}]);
      // CR-02 layer 1, the important one: expireShotClock forces default index 0 — which here is
      // Accept. Without this guard a captain who merely ran out of time is recorded as agreeing.
      if(appState.turnExpired)return false;
      if(v==="counter"){
        const room=Math.max(0,p.coins-offer.giveCoins);
        if(room<1){responses.push({q,kind:"deny",why:"toodear"});continue;}
        // @copy prompt.trade.counter
        const a=await coinStepper(
          k=>`${pn(q.idx)}: ye're ASKIN' +${k}🌕 more on top o' ${offerDisplay}`,
          1,1,Math.min(5,room),"Ask it!",{label:"✗ Deny",value:"deny"});
        if(a==null)return false;
        if(a==="deny"||a==="__back__")responses.push({q,kind:"deny",why:"chose"});
        else responses.push({q,kind:"counter",askFor:a});
      }else responses.push({q,kind:v==="accept"?"accept":"deny",why:"chose"});
    }else{
      responses.push(g.respondToOffer(q,offer,p));
    }
  }
  setActor(p.idx);
  if(!responses.length){
    // @copy adhoc.trade.silence
    await flash(`Not a soul answers ${pn(p.idx)}'s hail.`,undefined,undefined,[{seat:p.idx,html:`Not a soul answers yer hail.`}]);
    return true;
  }

  // ---- the asker sees EVERY answer at once and picks one, or walks away (rule 4a/4b) ----
  const opts=[];
  for(let i=0;i<responses.length;i++){
    const r=responses[i];
    if(r.kind==="accept")opts.push({label:`${iconImg(CHECKMARK_IMG)} ${pn(r.q.idx)} accepts`,value:i});
    else if(r.kind==="counter"){
      const total=offer.giveCoins+r.askFor;
      opts.push({label:`💰 ${pn(r.q.idx)} wants +${r.askFor}🌕 more`,value:i,disabled:total>p.coins});
    }
  }
  const denials=responses.filter(r=>r.kind==="deny");
  const colors=opts.map(o=>HEXCOL[responses[o.value].q.idx]);
  opts.push({label:"🚫 Walk away",value:-1});colors.push(null);
  const denyNote=denials.length
    ?denials.map(r=>`${pn(r.q.idx)} ${r.why==="blocking"?"refuses outright":"declines"}`).join(" · ")
    :null;
  if(!opts.some(o=>o.value!==-1&&!o.disabled)){
    // nobody said anything ye can act on
    g.ev({t:"parley",a:p.idx,b:null,offer:offerDisplay,want:offer.want});
    liveRender();
    // @copy adhoc.trade.alldeclined
    await flash(`No captain will part with ${ilabelImg(offer.want)} for that.`,undefined,undefined,
      [{seat:p.idx,html:`No captain will part with ${ilabelImg(offer.want)} for that offer of yers.`}]);
    return true;
  }
  // @copy prompt.trade.pick
  const pick=await ask(`The table answers — take a deal, or walk away?`,opts,colors,denyNote);
  if(appState.turnExpired)return false;
  if(pick===-1||pick==null){
    g.ev({t:"parley",a:p.idx,b:null,offer:offerDisplay,want:offer.want});
    liveRender();
    // @copy adhoc.trade.walkaway
    await flash(`${pn(p.idx)} walks away from the table.`,undefined,undefined,[{seat:p.idx,html:`Ye walk away from the table.`}]);
    return true;
  }
  const chosen=responses[pick];
  const extra=chosen.kind==="counter"?chosen.askFor:0;
  // CR-02 layer 2: settleTrade validates BOTH legs before EITHER mutates, so a trade is atomic —
  // a crate that is no longer held, or coins that are no longer there, routes into the decline
  // path below rather than half-completing.
  if(!g.settleTrade(p,chosen.q,offer,extra)){
    // @copy adhoc.trade.refusalhuman
    await flash(`${pn(chosen.q.idx)} declines ${pn(p.idx)}'s offer!`,undefined,undefined,[{seat:p.idx,html:`${pn(chosen.q.idx)} declines yer offer!`}]);
    return true;
  }
  await narrateLastEvent();
  liveRender();
  return true;
}
export async function humanAct(p,sailCtx){
  setActor(p.idx);
  const port=appState.game.adjPort(p);
  const canDock=port&&!(appState.game.cfg.singleDock&&appState.game.dockOccupiedBy(port,p));
  // v2 rule 13: EVERY dock is raidable now, and a captain who has already fired up the ovens is
  // still a legal target ("nobody is safe"). So the target list is simply everyone adjacent — a
  // berth protects no one, and `done` no longer grants immunity.
  const targets=appState.game.players.filter(q=>q!==p&&man(p.pos,q.pos)<=1);
  const canAfford=p.coins>=appState.game.cfg.powder;
  // v2 rule 13e: a ship with an empty hold cannot be attacked — there is nothing to take, and the
  // prize is a crate or nothing (rule 9d). Compute real availability once and drive both the
  // button's greying and the action guard from it.
  const attackable=targets.filter(q=>appState.game.canAttack(p,q));
  // D-41 EXTENDED (Wyatt-approved 2026-07-29): Parley/Trade is offered whenever any opponent is
  // alive, but the action itself only ever works against someone HOLDING cargo — compute real
  // availability once and drive both the button's `disabled` flag and the action guard (:602 below)
  // from it, following the same pattern already used for Attack.
  // v2 rule 4: a trade reaches the WHOLE TABLE from wherever ye happen to be floating — there is
  // no partner to be adjacent to. It is available whenever anybody, anywhere, is holding cargo.
  const canTrade=appState.game.players.some(q=>q!==p&&!q.done&&q.ing.length>0);
  const opts=[];
  // F5 (Wyatt-approved 2026-07-29), his own example: *"In the 'Dock at Full Cream Folly' the icon
  // should go directly in front of the island name — 'Dock at 🥛 Full Cream Folly'"*. The icon used
  // to sit in front of the whole anchor-plus-verb clause. Nothing else about the label changed, and
  // the anchor stays where it is (it labels the ACTION, not the island). The dock FLIP prompt
  // (:above) was already correct and is deliberately untouched.
  // /4 radial (Wyatt's pick: short verbs in the circles, details in the pill): each long label
  // carries a `short` form for the bloom; the card fallback keeps the full sentence. Draft copy.
  if(canDock)opts.push({label:`⚓ Dock at ${iconImg(ING_IMG[port])} ${dockPlace(port)}`,short:`⚓ Dock ${iconImg(ING_IMG[port])}`,value:"dock"});
  // #5b/#5d: shorter label, and the Attack button always shows when there's a target — greyed out
  // (disabled) rather than hidden when you can't afford powder.
  if(targets.length)
    opts.push({label:`⚔️ Attack${appState.game.cfg.powder?` <span class="nobrk">(−${appState.game.cfg.powder}🌕)</span>`:""}`,value:"attack",disabled:!canAfford||!attackable.length});
  opts.push({label:"🤝 Trade",value:"trade",disabled:!canTrade});
  // v2.1: dead under the bake-off, and gated EXPLICITLY rather than left to be dead by accident.
  // The bake-off lights the ovens from the turn loop the moment a full recipe reaches Tortuga, so
  // this button can never be the thing that starts a bakery — offering it would promise a finish
  // the engine no longer grants on a click.
  if(!appState.game.cfg.bakeoff&&!appState.game.needs(p).length&&man(p.pos,appState.game.home)<=1)
    opts.unshift({label:`${iconImg(CUPCAKE_IMG)} Start yer bakery!`,short:`${iconImg(CUPCAKE_IMG)} Bakery!`,value:"bakery"});
  // THE OVENS BUTTON (Wyatt, 2026-08-09: "Where did the button go? This is a celebratory moment!
  // It feels terrible to have to click 'pass'").
  //
  // Suppressing the classic bakery button above left NOTHING in its place. The ovens still lit —
  // runLiveDayBakeoff calls lightOvens() the moment the turn returns — but the captain who had just
  // spent thirteen days assembling a full recipe had to end that turn by tapping "Pass", and only
  // then read that they had arrived. The biggest moment in the voyage was reached through the
  // button that means "I have nothing to do".
  //
  // This does NOT light the ovens itself, and that is deliberate: lightOvens() must stay in the day
  // loop, called exactly once per captain, or the RNG stream forks on which button a human happened
  // to press (scrambleBench draws from it). The button's whole job is to END THE TURN with the
  // right name on it — the loop lights the ovens a moment later and EVENT_NARRATION.ovens carries
  // the celebration, so nothing is flashed here that would step on it.
  //
  // It REPLACES Pass rather than joining it. The "a turn must always be endable" invariant below is
  // what Pass exists for, and this discharges it — same action, right name. Offering both would put
  // the dead option back on screen next to the live one.
  const canOvens=appState.game.cfg.bakeoff&&appState.game.canBake(p);
  // @copy adhoc.act.fireovens
  if(canOvens)opts.unshift({label:`${iconImg(CUPCAKE_IMG)} Fire up the ovens!`,short:`${iconImg(CUPCAKE_IMG)} Fire ovens!`,value:"ovens",cls:"primary ahoyGlow"});
  // v2 rule 3: Fish is gone from the menu, and rule 4's Trade is table-wide rather than
  // adjacency-gated. Together that made it possible for EVERY option to be unavailable at once —
  // not on a dock, nobody adjacent to fight, nobody holding cargo yet, recipe unfinished — which
  // is exactly what happened on turn one of the first phone playtest: a menu with a single greyed
  // Trade button and no way to end the turn at all.
  //
  // Fish used to absorb that case by accident, because it was always available. Nothing replaced
  // it, so this does, explicitly: a turn must ALWAYS be endable. Never disabled, never hidden —
  // a "pass" that vanishes when you need it is the D-41 dead-end all over again.
  //
  // offered only if this player's sail step ended in "Stay put" — covers the reported "hit Stay
  // put by accident" complaint. Sailing is free now (rule 2), so there is no purse test.
  const canMoveInstead=sailCtx&&
    p.pos[0]===sailCtx.preSailPos[0]&&p.pos[1]===sailCtx.preSailPos[1];
  if(canMoveInstead)opts.push({label:"← Actually, move instead",back:true,value:"moveInstead"});
  if(!canOvens)opts.push({label:"🌊 Pass",value:"pass"});
  // #5c/D-41: helper text under the buttons explains why a greyed button is greyed — Attack's own
  // powder gate, and now Trade's cargo gate, follow the same pattern.
  //
  // D-41 COMPLETED (F11, found in the 2026-07-29 two-tab playtest): these arms used to be an
  // if/else-if chain, and the two conditions are INDEPENDENT — whether an enemy is adjacent says
  // nothing about whether anyone is holding cargo. So whenever an attack target happened to be
  // adjacent, the first arm won and Trade's greyed reason became unreachable: the playtest showed the
  // greyed Trade button rendering with ATTACK's helper text beneath it while Attack was enabled. The
  // string existed, shipped verbatim, and was structurally reachable — it simply never appeared in
  // the state it explains. Two fixes, both structural:
  //   1. independent conditions get independent `if`s, so neither can suppress the other, and where
  //      both apply BOTH reasons are shown rather than one being silently dropped;
  //   2. a GREYED control's reason outranks an ENABLED control's informational tip — the Attack tip
  //      only fires when nothing is greyed, because telling a player how Attack works does not
  //      explain why Trade is unavailable.
  // No new copy: all three strings already existed and are already Wyatt-approved.
  // scripts/ui_contract_check.js assertion 6 gates this shape, red-proofed against the ab98e04 code.
  let sub=null;
  if(targets.length&&!canAfford)sub=`Yer too poor to afford powder — ye need ${appState.game.cfg.powder}🌕 to fire.`;
  if(targets.length&&canAfford&&!attackable.length)sub=[sub,`Their holds are empty — nothin' to plunder.`].filter(Boolean).join(" ");
  if(!canTrade)sub=[sub,`No one's holding cargo to trade for yet.`].filter(Boolean).join(" ");
  if(!sub&&targets.length)sub=`Attacking costs ye ${appState.game.cfg.powder}🌕 for powder. Firing downwind wins ties!`;
  // v2 rule 2: sailing is free, so an empty purse never stops the crew — the old broke-captain
  // reframing of this prompt is gone with it.
  const prompt=`${pn(p.idx)}, what'll ye do:`;
  // @copy prompt.act.menu
  const v=await ask(prompt,opts,null,sub);
  if(appState.turnExpired)return;
  // the clock keeps running (and re-arms fresh) through dock/attack/trade/fish now, instead of
  // stopping here — each ask() inside those sub-flows re-arms it for its own decision
  if(v==="moveInstead"){
    const dest=await pickCell(p,reachable(p));
    if(appState.turnExpired)return;
    // G6 (COIN-AUDIT.md site 7): reachable() was computed from the pre-await purse and
    // `await pickCell(...)` is the window. A shortfall falls through to the existing "no
    // destination" outcome — the ship simply does not move, which renders nothing, so nothing is
    // invented. appState.turnExpired above does NOT cover this: it is set at 30s, the coin
    // penalty fires at 20s and sets no flag at all.
    if(dest){p.pos=dest;p.justDocked=false;appState.game.ev({t:"sail",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){await animateRimSweepIfAny();liveRender();await narrateLastEvent();}}
    await humanAct(p,sailCtx);return;
  }
  if(v==="pass"){
    // See Game.nextSeaCreature for the walk. advanceSeaCursor persists where this device's captain
    // has got to, so the NEXT voyage picks up at the next creature rather than restarting near the
    // top — over enough games they see all fifty. Only this seat owns the cursor; bots walk their
    // own derived offsets and never touch it.
    appState.game.ev({t:"pass",p:p.idx,sea:appState.game.nextSeaCreature(p)});
    if(p.idx===appState.game.seaSeat)advanceSeaCursor(p);
    liveRender();
    await narrateLastEvent();
    return;
  }
  // Ends the turn and nothing else — runLiveDayBakeoff lights the ovens the instant this returns,
  // and narrates it. See the option's own note above for why the click must not do it itself.
  if(v==="ovens")return;
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
    if(p.coins<appState.game.cfg.powder||!attackable.length){await flash(`${pn(p.idx)} can't attack.`,1400,undefined,[{seat:p.idx,html:`Ye can't attack — no powder, or nothin' in their holds.`}]);await humanAct(p,sailCtx);return;}
    const t=attackable.length===1?attackable[0]:
      // @copy prompt.act.attacktarget
      await ask("Attack whom?",attackable.map(o=>({label:pn(o.idx),value:o})).concat([{label:"← Back",back:true,value:null}]),
        attackable.map(o=>HEXCOL[o.idx]));
    if(t===null){await humanAct(p,sailCtx);return;}
    await netHandlers().onAsyncBattle(p,t);
    await narrateLastEvent();
  }
  else if(v==="trade"){const done=await humanTrade(p);if(!done){await humanAct(p,sailCtx);}return;}
}
export async function humanTurn(p){
  if(window.__pp4)window.__pp4.actor(p.idx);
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
  // NARR-03/D-25: the round header already announced the wind moments ago, so the neutral banner
  // does not restate it; only the captain whose turn it is gets the reminder.
  // v2 rule 7: the storm has ALREADY happened by the time a turn begins — it blew the whole table
  // at the top of the round. So the turn banner no longer pre-announces a push that is about to
  // land on this one captain; there is nothing left for it to warn about.
  const neutralBanner=`⛵ Ahoy, ${poss(p.idx)} turn!`;
  const addressedBanner=`⛵ Ahoy, ${pn(p.idx)} — yer turn! The wind blows <b>${DIRNAME[appState.game.windNow]}</b> this round.`;
  // @copy adhoc.turn.banner
  await flash(neutralBanner,1500,undefined,[{seat:p.idx,html:addressedBanner}]);
  // the clock only starts once the player actually reaches a decision (wind response, sail
  // pick, action choice, ...) — not from the raw top of the turn, since the wind step itself
  // eats no time. Each ask()/pickCell() call re-arms it fresh via armClock().
  if(appState.turnExpired){appState.activeTurnSeat=null;appState.recipeRevealed=false;return;}
  // normal turns no longer get force-moved by the wind (see #7) — only a storm still shoves
  // ships around; otherwise the wind only shapes this player's own sail budget below
  // v2.1: a storm can no longer cost anyone a turn — land simply stops the push. The forfeit
  // branch that used to sit here is gone with the rule.
  if(!appState.game.adjPort(p))p.dockedNow.clear();
  const preSailPos=[...p.pos],preSailCoins=p.coins; // lets humanAct offer "move instead" if this seat just stayed put
  // v2 rule 2: sailing is FREE. No coin gate, no debit, no "yer too broke to sail" nudge — and
  // rule 1 deletes the lee, so there is no upwind-island warning to give either.
  {
    const dest=await pickCell(p,reachable(p));
    appState.recipeRevealed=false; // sail destination chosen — re-lock
    if(appState.turnExpired){appState.activeTurnSeat=null;return;}
    if(dest){
      p.pos=dest;p.justDocked=false;appState.game.ev({t:"sail",p:p.idx});liveRender();
      if(appState.game.tradewind(p)){await animateRimSweepIfAny();liveRender();await narrateLastEvent();}
      // /4 playtest 8: entering the current AT its quadrant head gives a zero-square ride, and
      // silence there reads as a stall. Say why. Draft copy — Wyatt's to rewrite.
      else if(appState.game.onRim(p.pos))await flash(`🌀 ${pn(p.idx)} rides at the head o' the current — she's got nowhere to carry ye from here.`);
    }
  }
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
/* v2 rule 4, the bot's side of the open trade. A bot puts the same announcement to the same table
   a human does — the difference is only who answers the prompts. Bot holders reason in the engine
   (respondToOffer); human holders are asked, so a human is never traded around behind their back.

   This REPLACES v1's whole "bot hails a human" apparatus (D-02/D-24: rankHailTargets,
   priceHailOffer, hailWorthIt and the cooldown). That existed because v1 had no way for a bot to
   reach a player it wasn't standing next to, and it only ever fired as a last resort when an
   island had run dry. Rule 4 gives every captain that reach every turn, so the special case is
   gone rather than left running alongside the general one. */
export async function botOpenTradeLive(p){
  const g=appState.game;
  const offer=g.botOpenOffer(p);
  if(!offer)return false;
  g.noteDemand(p,offer.want,1);
  const offerDisplay=g.offerLabel(offer,0)||"nothing";
  g.ev({t:"openoffer",p:p.idx,want:offer.want,offer:offerDisplay});
  liveRender();
  await botBeat();
  const responses=[];
  for(const q of g.holdersOf(offer.want,p)){
    if(q.strategy==="human"){
      setActor(q.idx);
      // @copy prompt.trade.accept
      const v=await ask(`${pn(q.idx)}: ${pn(p.idx)} offers ${offerDisplay} for yer ${ilabelImg(offer.want)}.`,[
        {label:`${iconImg(CHECKMARK_IMG)} Accept`,value:"accept"},
        {label:"💰 Name yer price",value:"counter"},
        {label:`${iconImg(CANCEL_X_IMG)} Deny`,value:"deny"}]);
      // CR-02 layer 1: a forced default on shot-clock expiry must never read as agreement.
      if(appState.turnExpired)return false;
      if(v==="counter"){
        const room=Math.max(0,p.coins-offer.giveCoins);
        if(room<1){responses.push({q,kind:"deny",why:"toodear"});continue;}
        // @copy prompt.trade.counter
        const a=await coinStepper(
          k=>`${pn(q.idx)}: ye're ASKIN' +${k}🌕 more on top o' ${offerDisplay}`,
          1,1,Math.min(5,room),"Ask it!",{label:"✗ Deny",value:"deny"});
        if(a==null)return false;
        if(a==="deny"||a==="__back__")responses.push({q,kind:"deny",why:"chose"});
        else responses.push({q,kind:"counter",askFor:a});
      }else responses.push({q,kind:v==="accept"?"accept":"deny",why:"chose"});
    }else responses.push(g.respondToOffer(q,offer,p));
  }
  setActor(p.idx);
  if(!responses.length)return false; // nobody left worth hailing — don't spend the turn on silence
  // remember every refusal, so the same doomed offer is not put to the same captain again
  const worth=g.offerWorthTurns(p,offer);
  for(const r of responses)if(r.kind==="deny"){
    g.rememberRefusal(p,offer.want,r.q.idx,worth);
    g.refusedFlagWanted(p,offer,r.q);
  }
  const accepts=responses.filter(r=>r.kind==="accept");
  const counters=responses.filter(r=>r.kind==="counter"&&(offer.giveCoins+r.askFor)<=p.coins);
  let deal=null,extra=0;
  if(accepts.length){
    accepts.sort((x,y)=>g.crateCostTurns(y.q,offer.want,p)-g.crateCostTurns(x.q,offer.want,p));
    deal=accepts[0].q;
  }else if(counters.length){
    counters.sort((x,y)=>x.askFor-y.askFor);
    const best=counters[0];
    // only pay a counter that still beats getting the crate the hard way — the same test the
    // headless bot applies, so a bot never pays a price on screen it would refuse in simulation
    if(g.coinTurns(offer.giveCoins+best.askFor)<=g.acquireTurns(p,offer.want).turns){deal=best.q;extra=best.askFor;}
  }
  if(!deal||!g.settleTrade(p,deal,offer,extra)){
    for(const r of responses)if(r.kind==="counter")g.rememberRefusal(p,offer.want,r.q.idx,worth);
    g.ev({t:"parley",a:p.idx,b:null,offer:offerDisplay,want:offer.want});
    liveRender();
    await botBeat();
    return true; // the offer itself WAS the action — a refused hail still ends the turn
  }
  liveRender();
  await botBeat();
  return true;
}
export async function botTurn(p){
  if(window.__pp4)window.__pp4.actor(p.idx);
  const g=appState.game;
  g.ev({t:"turn",p:p.idx});
  await botBeat();
  // v2.1: no turn is ever lost to weather, so a bot has no forfeit branch either.
  if(!g.adjPort(p))p.dockedNow.clear();
  // PRINCIPLE 1: the WHOLE turn is decided here, before a square is crossed — the square to finish
  // on AND what to do from it, scored as one plan against turns-to-victory. This path only ANIMATES
  // the engine's decision, so a bot on screen can never do something the headless simulation would
  // not have done. See docs/BOT-DESIGN-PRINCIPLES.md.
  const plan=g.planTurn(p);
  const target=plan.cell;
  if(man(p.pos,target)>0){
    const b=[...p.pos];
    // v2 rule 2: sailing is free. No coin to spend, none to refund.
    if(g.stepToward(p,target)){p.justDocked=false;g.ev({t:"sail",p:p.idx});await botBeat();
      if(g.tradewind(p)){await animateRimSweepIfAny();liveRender();await narrateLastEvent();}}
    // G18: a boxed-in bot escapes through the rim, exactly as the engine's own takeTurn does.
    // rimEscape() records its own events (windmove, then tradewind's sweep line).
    else if(g.boxedIn(p)&&g.rimEscape(p)){await animateRimSweepIfAny();await botBeat();}
  }
  if(!g.adjPort(p))p.dockedNow.clear();
  liveRender();
  // The plan was costed from plan.cell; a storm or a blocked route can leave the ship short of it,
  // so anything needing adjacency is re-checked against where the ship ACTUALLY is. Not a second
  // decision — the same plan, refusing to pretend it arrived.
  if(plan.type==="attack"&&man(p.pos,plan.target.pos)<=1&&g.canAttack(p,plan.target)){
    await netHandlers().onAsyncBattle(p,plan.target);
    await botBeat();return;
  }
  if(plan.type==="trade"){
    if(await botOpenTradeLive(p))return;
  }
  if(plan.type==="dock"&&g.adjPort(p)===plan.ing&&g.doDock(p,plan.ing)){await botBeat();return;}
  // THE FALLBACK, and it has to be repeated HERE rather than inherited: botTurn does not call
  // Game.takeTurn — it reimplements the turn so each step can animate (see the note in
  // scripts/bakeoff_parity_test.js). A fallback added only to the engine would fix the simulator
  // and leave every real browser game exactly as broken, which is the opposite of the point.
  // Same rule as the engine's: work the berth under your feet, nothing cleverer.
  const fallbackPort=g.adjPort(p);
  if(fallbackPort&&g.canDock(p,fallbackPort)&&g.doDock(p,fallbackPort)){await botBeat();return;}
  // v2 rule 3: no fishing. A bot with nothing worth doing looks into the ocean, exactly as a
  // human does — same action, same narration, so the table reads consistently.
  g.ev({t:"pass",p:p.idx,sea:g.nextSeaCreature(p)});
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
  // /4 playtest 12: the two intro barriers (ahoy + turn order) play CENTER STAGE — board dimmed,
  // message and button centred — instead of a bubble at the top and a lone circle mid-sea
  const opts=[{label:btnLabel,value:0,cls:"primary ahoyGlow",stage:true}];
  const humans=appState.game.players.filter(p=>p.strategy==="human");
  if(appState.passAndPlay){
    // ONE DEVICE, ONE SHOWING (Wyatt, 2026-08-08: "Dont require passing to the next player for the
    // opening narration, or the lots drawing narration. Just show those once").
    //
    // This used to walk every human seat — pass the device, read, click, pass again — for two
    // screens that say the SAME PUBLIC THING to everybody: the ahoy welcome, and who drew first
    // lot. A pass-the-device gate exists to keep one player's private information off another
    // player's screen; neither of these has any. So the gate was pure ceremony, and four players
    // paid it twice before the first turn.
    //
    // Nothing is skipped and nothing is hidden — the table reads it together, once, off one screen.
    // The FIRST REAL TURN still gates normally, via humanTurn's own passGate, so the device still
    // reaches the right hands before anybody acts.
    await localAsk(msg,opts);
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
  //
  // G4 (Wyatt-approved 2026-07-30): the sentence now opens with "Choose a recipe" — the FIRST thing
  // the player is actually asked to do, which (with G5 moving the draft ahead of the turn-order
  // intro) is the very next screen. The old wording described gathering before he had a recipe to
  // gather for. The leading ⚓ is KEPT again here: D-16 requires removal stated in words, and he
  // named no icon. D-53 (a `--` becomes an em dash) is a no-op check on this string — it has none.
  const msg=`⚓ Ahoy! Choose a recipe, gather each ingredient, then sail home first to win!`;
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
  // G27 (Wyatt-approved 2026-07-30, spotted mid-playtest): the waiting captains' consolation is an
  // amount of MONEY, so it carries the coin like every other amount in the game — "(+1🌕)", not a bare
  // "(+1)". Emoji shorthand, not hand-rolled markup: emojify() swaps it for COIN_IMG at panel()'s
  // chokepoint (D-50), the same path every other 🌕 in this file takes. No sign change — D-38 already
  // has this one right, it is a gain and it was already signed.
  // P7 (Wyatt, 2026-08-01, second pass): "other numbers and coin combos do split, which they
  // shouldn't." The nobrk span covered only the parenthetical, so the amount stayed intact but
  // detached from the captain it belongs to — "…Davy Scones" / "(+2🌕), Dough Hook…" across a
  // line break. A name and its amount are ONE readable unit; the span wraps both.
  const rest=order.slice(1).map((i,k)=>`<span class="nobrk">${pn(i)} (+${k+1}🌕)</span>`).join(", ");
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
  // playtest 11: the battle card's own coin visibly spins — .coin.spin sets color:transparent
  // expecting a background image, so without one the "spin" state rendered as an empty square
  if(state==="spin")return `<div class="coin spin" style="background-image:url(${COIN_SPIN_IMG})">${b}</div>`;
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
  if(window.__pp4)window.__pp4.battle(snap.attIdx,snap.defIdx);
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
/* ================= v2 rule 5: calling the battle =================
   The betting is gone. A call is FREE, it costs nothing to be wrong, and being right pays a flat
   +2🌕 from the bank. That deletes the whole stake/raise/all-in ladder, the double-or-nothing
   payout, and the re-validate-the-stake-at-settlement guard that existed only because a wager
   could outlive the purse that promised it (COIN-AUDIT site 11 — the widest window in v1).

   Every non-combatant may call, from anywhere on the board, and bots call too. A NULL battle
   (rule 9: crosswind stand-off, attacker declines to pay) has no winner, so no call is correct
   and nobody is paid. */
export async function collectSideBets(att,def){
  const bets=[],ns=pn;
  const spectators=appState.game.players.filter(p=>p!==att&&p!==def&&!p.done);
  for(const s of spectators){
    if(s.strategy==="human"){
      setActor(s.idx);
      // NAMED, because on one device the prompt arrives out of nowhere (Wyatt, 2026-08-08: "it is
      // wyyy's turn and they are attacking, but juju must call; so the narration should say 'Juju —
      // A battle's brewing!'"). The caller is a SPECTATOR of someone else's fight, so nothing about
      // whose turn it is tells you the screen is now asking you. The name is the only thing that does.
      // @copy prompt.sidebet.call
      const who=await ask(`⚔️ ${ns(s.idx)} — a battle's brewing! Call the winner — it's free, and ye get ${appState.game.cfg.callBounty}🌕 if yer right.`,
        [{label:`Call ${ns(att.idx)}`,value:"a"},{label:`Call ${ns(def.idx)}`,value:"d"}],
        [HEXCOL[att.idx],HEXCOL[def.idx]]);
      bets.push({idx:s.idx,on:who});
      // D-08: a call names two seats — the caller AND the captain called — so both get an
      // addressed variant, not just the actor.
      const calledIdx=who==="a"?att.idx:def.idx;
      // @copy adhoc.sidebet.freecall
      await flash(`🔭 ${pn(s.idx)} calls ${pn(calledIdx)} from the crow's nest.`,900,undefined,[{seat:s.idx,html:`🔭 ${pn(s.idx)} — ye call ${pn(calledIdx)} from the crow's nest.`},{seat:calledIdx,html:`🔭 ${pn(s.idx)} calls ye to win from the crow's nest.`}]);
    }else{
      // Bots read the same board a player does: the wind decides a both-heads round, so the
      // downwind ship is the sharper call — then the fuller purse as a tiebreak.
      const dw=appState.game.downwindSide(att,def);
      const fav=dw||(att.coins>=def.coins?"a":"d");
      const on=appState.game.r()<.72?fav:(fav==="a"?"d":"a");
      bets.push({idx:s.idx,on});
    }
  }
  return bets;
}
export async function settleSideBets(bets,winSide){
  if(!bets.length)return;
  const parts=[];
  const bounty=appState.game.cfg.callBounty;
  for(const bet of bets){
    const p=appState.game.players[bet.idx];
    // winSide is null for a NULL battle — nobody won, so no call can be correct (rule 5d)
    const won=winSide!=null&&bet.on===winSide;
    const delta=won?bounty:0;
    p.coins+=delta;
    appState.game.ev({t:"sidebet",p:bet.idx,won,on:bet.on,delta});
    parts.push(won?`${pn(bet.idx)} +${delta}🌕`:`${pn(bet.idx)} no bounty`);
  }
  liveRender();
  // D-25/D-26 (Wyatt-approved 2026-07-29): "The Lookout settles". 🔭 kept per D-16.
  // @copy adhoc.sidebet.settle
  await flash("🔭 The Lookout settles — "+parts.join(" · "),1600);
}
/* v2 rule 12: there is no bakeoff. asyncBakeoff() and its whole head-to-head flip ladder are
   deleted. When more than one captain gets home they COLLABORATE on a single bakery, and Best
   Baker is awarded on what each brought to it — most crates, then most coins, then whoever got
   home first (Game.bakeRank). The title is earned across the voyage now, not decided by one last
   coin toss at the end of it. */
// 11-07 (bridge deletion fix): relocated here verbatim from src/ui/lobby.js. wireWelcome calls
// startSinglePlayer()/startPassAndPlay() (below, same file — already local, no import needed);
// src/ui/lobby.js (its former home) cannot reach either without importing this file, which would
// close an import cycle (this file already imports `passGate`/`requireName` FROM lobby.js) —
// module_graph_check.js's "no import cycle" assertion forbids that. `showStep` stays in
// lobby.js and is imported alongside the two names already pulled from there.
export function wireWelcome(){
  // FIX-01/D-01/D-03: every mode card now opens the name modal first; each continuation is that
  // mode's remaining body, run by confirmName() once the player confirms (or dismisses — D-02
  // makes dismissal confirm too, wired in wireNameModal()). The two dead pre-modal name guards
  // that used to gate Solo/Host are gone — that read never returned falsy, so both were
  // unreachable branches even before this change.
  $("choiceSolo").onclick=()=>{openNameModal(()=>{startSinglePlayer();});};
  // UI-05: "Host a Crew" now creates the room outright instead of showing #stepHost, whose entire
  // content was one "Create the game" button — a screen that asked the player to confirm the thing
  // they had just clicked. #stepHost's markup is kept (with a note) so nothing else that references
  // it breaks; it is simply no longer reachable from here.
  //
  // createRoom() is main-tier (src/orchestrator.js), which src/ui/ may never import — hence the
  // handlers seam, the same route 13-01 added for onTogglePause. The disabled-card guard stays on
  // THIS side, before the modal opens, so a disabled card still short-circuits before any room
  // exists.
  // v2: the Host/Join cards are gone from the markup — this build is solo and pass-and-play only.
  // The wiring is guarded rather than deleted outright so that restoring the two cards (and the
  // Firebase script tags) is all it takes to bring multiplayer back.
  const hostCard=$("choiceHost"),joinCard=$("choiceJoin");
  if(hostCard)hostCard.onclick=()=>{if(hostCard.classList.contains("disabled"))return;openNameModal(()=>{netHandlers().onCreateRoom();});};
  if(joinCard)joinCard.onclick=()=>{if(joinCard.classList.contains("disabled"))return;openNameModal(name=>{$("joinName").value=name;showStep("stepJoin");});};
  // D-03 decision (22-01-PLAN.md): #ppName0 stays visible on stepPassPlay, pre-filled and editable
  // — Pass & Play still has to name seats 1-3, so consistency (same modal, same position in the
  // flow) was chosen over saving a click.
  $("choicePassPlay").onclick=()=>{openNameModal(name=>{$("ppName0").value=name;showStep("stepPassPlay");});};
  $("btnNameConfirm").onclick=()=>{confirmName();};
  // D-02: wires the modal's other three dismissal routes (✕, Escape, backdrop click) to also
  // confirm rather than cancel. Idempotent — safe even though wireWelcome() only runs once.
  wireNameModal();
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
  // seaBase: where this device left off in the fifty sea creatures. Captured ONCE, here, and
  // carried in soloMeta so the solo save replays the same sightings it showed live.
  // v2.1: the ruleset this voyage is being played under is recorded WITH the save, so a resume can
  // never replay the log against the other one. See resumeSoloGame (util.js) for what that costs.
  const cfg=roundCfg(strategies);
  appState.soloMeta={name,strategies,seed,seaBase:getSeaBase(),bakeoff:!!cfg.bakeoff,ovens:ovensNowEnabled()};appState.dlog=[];saveSoloState();pingStart(1,"solo");
  netHandlers().onBeginGame(cfg,seed);
}
// Pass & Play: `names` holds one entry per human seat (2-4), in seat order; any remaining
// seats up to the standard 4-player table are filled with bots, same pool solo/host use.
export function startPassAndPlay(names){
  const strategies=names.map(()=>"human");
  for(let i=names.length;i<4;i++)strategies.push(seatStrat(i)); // BOT-02
  appState.numSeats=strategies.length;appState.room=null;appState.isHost=true;appState.mySeat=0;appState.passAndPlay=true;
  appState.roster=strategies.map((s,i)=>i<names.length?{name:names[i],id:"solo",bot:false}:{name:"",id:"",bot:true,strat:s});
  const seed=Math.floor(Math.random()*1e9);
  const cfg=roundCfg(strategies);
  appState.soloMeta={names,strategies,seed,passAndPlay:true,seaBase:getSeaBase(),bakeoff:!!cfg.bakeoff,ovens:ovensNowEnabled()};appState.dlog=[];saveSoloState();pingStart(names.length,"pass");
  netHandlers().onBeginGame(cfg,seed);
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
  // D-55/D-56 CLOSED by G25 (Wyatt-approved 2026-07-30). This loop used to build its own rect —
  // rx:5, fill:#fdb63d, opacity:.4, no class — so a guest's squares were a different orange,
  // dimmer, unanimated and unhoverable. It now calls sailHighlightRect(), the SAME builder the
  // host's localPickCell() calls, so the two cannot drift again by construction. The click handler
  // and hs.push stay here, where they differ legitimately (this path responds over the wire).
  for(const c of cells){
    const r=sailHighlightRect(c,cellPx,svg);
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
