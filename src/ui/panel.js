// src/ui/panel.js
//
// Phase 11 (SPLIT-03/06), wave 11-04. The panel/clock/narration/chat/modal render cluster —
// setClockUI, panel, resizePanel, typewriterReveal, narrateLastEvent, appendChatLine,
// showChatBubble, showNarration, setNeedsAction, flash, liveRender. Extends 11-01/02/03's
// proven "move verbatim + rewire bare reads into imports + bridge grows + gates green" pattern.
//
// This file ALSO stands up src/ui/handlers.js — the injected-handler seam (D-07, criterion 1's
// directional boundary) — and is the first consumer of it. flash() used to call netNarrate(...)
// directly and liveRender() used to call pushEvents() directly; both are net-adjacent
// orchestration calls, which src/ui/ must never reach by importing src/net/. Instead each now
// calls through the injected handler (netHandlers().onBroadcast / .onEvents), registered by
// src/main.js's composition root. See RESEARCH.md Q1b for the full 6-edge seam table — these are
// the first 2 of 6 resolved; the remaining 4 land in 11-05/11-06.
//
// Purity bar for src/ui/: reads DOM and game state, NEVER imports src/net/ (D-07).
// scripts/module_graph_check.js and scripts/ui_contract_check.js both gate this mechanically.
//
// Deviation ($ duplicate, mirrors 11-01/11-03's precedent): `$` is a classic-script-local
// `const $=id=>document.getElementById(id)` (index.html:863), used ~120+ times across the still-
// classic region far beyond this cluster's own consumers — reproduced verbatim as a private
// module-local helper instead of "moved".
//
// Deviation (sleep duplicate, same class of gap, new instance this wave): `sleep` is ALSO a
// classic-script-local `const` (index.html:947), not a `function` declaration, so it never
// becomes a `window` property and cannot resolve as a bare read once flash() moves into a
// module. It is used well beyond this cluster (humanFlip/fishCast/asyncBattle and others, none
// of which move this wave), so — unlike an exclusive-to-this-cluster const (cf. 11-01's
// RECIPE_BOOK / 11-02's EVENT_NARRATION / 11-03's chatBubbles) — it cannot simply move here too.
// Reproduced verbatim as a private module-local const, wired to the already-moved
// `waitWhilePaused` import (./util.js) exactly like the classic original wires to its own bare
// `waitWhilePaused` call.

import { appState } from "../state/index.js";
import {
  PLAY_IMG, PAUSE_IMG, PAUSE_SYMBOL_IMG, BLOCKED_SLASH_IMG, STOPWATCH_IMG, COIN_IMG, HEXCOL, iconImg, emojify,
} from "../shared/index.js";
import {
  render, boardCell, boardShipEls, chatBubbles, positionChatBubble, removeChatBubble,
} from "./board.js";
import {
  soloBotGame, currentTurnSeat, syncLogLines, spawnPops, describe, pn, boatXY, msgHoldMs,
  waitWhilePaused,
} from "./util.js";
import { escHtml } from "./recipe.js";
import { netHandlers } from "./handlers.js";

const $=id=>document.getElementById(id);
const sleep=ms=>appState.replaying?Promise.resolve():waitWhilePaused().then(()=>new Promise(r=>setTimeout(r,ms)));

export function setClockUI(){
  const wrap=$("shotClockPanel");if(!wrap)return;
  wrap.classList.remove("warming"); // UI-02: only the active countdown branch below re-adds it
  if(appState.liveDone){
    wrap.classList.remove("idle","urgent","paused");
    wrap.style.display="none";
    $("btnPlayAgain").style.display="";
    return;
  }
  wrap.style.display="";
  $("btnPlayAgain").style.display="none";
  const state=appState.isHost?(appState.shotClockSeat==null?null:{seat:appState.shotClockSeat,deadline:appState.shotClockDeadline,paused:appState.shotClockPaused,pauseElapsed:appState.shotClockPauseElapsed}):appState.clockState;
  // CLOCK-02 FIX (mp-pause-clock-desync): on a GUEST the frozen<->running decision AND the frozen
  // remaining it renders must both flip from the SAME authoritative clock broadcast. Driving the
  // paused branch off appState.shotClockPaused alone (set by watchPause on the /paused flag) let
  // the flag land a network round-trip BEFORE the fresh deadline (watchClock) and flash a stale
  // countdown — the "guest races to 0 on resume". Prefer the broadcast's own paused bit; fall back
  // to the mirrored flag only until the first clock write arrives. The host owns the clock, so its
  // inline state.paused IS its live flag — no behavior change for host or solo.
  const paused=(state&&typeof state.paused==="boolean")?state.paused:appState.shotClockPaused;
  const labelEl=$("scLabel"),numEl=$("shotClockNum"),unitEl=$("scUnit"),subEl=$("shotClockSub"),pauseEl=$("scPause");
  // CLOCK-03: defensive reset, once per tick, BEFORE any branch below. setClockUI() re-runs on
  // the 500ms interval, so a click-to-resume handler set in a prior PAUSED tick must never
  // survive into a later non-paused tick (RESEARCH Anti-Pattern 4) — only the two paused
  // branches below re-arm it. The .tappable affordance class is reset here for the same reason.
  numEl.onclick=null;numEl.style.cursor="";numEl.classList.remove("tappable");
  // CLOCK-02/D-09: de-gated from appState.isHost&&soloBotGame() — the ▶/⏸ pause is now shown to
  // every player in both solo and multiplayer (a guest's click reaches togglePause() via
  // src/orchestrator.js's wireLobby rewire, which routes through the networked pause path).
  pauseEl.style.display=(!appState.liveDone)?"":"none";
  $("scPauseImg").src=paused?PLAY_IMG:PAUSE_IMG;
  // #7: the timer off/on toggle is offered to EVERY player in a real multiplayer game (2+ humans);
  // solo games keep the ▶/⏸ pause instead. Its icon reflects the current state.
  const toggleEl=$("scTimerToggle");
  if(toggleEl){
    toggleEl.style.display=(!soloBotGame()&&!appState.liveDone)?"":"none";
    toggleEl.innerHTML=appState.timerOff?iconImg(BLOCKED_SLASH_IMG):iconImg(STOPWATCH_IMG);
    toggleEl.title=appState.timerOff?"Turn the timer back on":"Turn the timer off";
  }
  if(appState.timerOff){
    // synced to all clients — everyone sees the clock is disabled
    wrap.classList.add("idle");wrap.classList.remove("urgent","paused");
    labelEl.textContent="timer off";numEl.textContent="∞";unitEl.textContent="";
    subEl.innerHTML=`no rush — tap ${iconImg(STOPWATCH_IMG)}`;
    return;
  }
  if(!state){
    if(paused){
      wrap.classList.remove("idle","urgent");wrap.classList.add("paused");
      labelEl.textContent="paused";numEl.innerHTML=iconImg(PAUSE_SYMBOL_IMG);unitEl.textContent="";subEl.innerHTML=`tap ${iconImg(PLAY_IMG)} to resume`;
      // CLOCK-03: the big paused symbol is an ADDED resume affordance alongside #scPause — same
      // togglePause seam, routed via netHandlers() since panel.js (ui-tier) may never import
      // src/orchestrator.js (main-tier) directly.
      numEl.style.cursor="pointer";numEl.onclick=()=>netHandlers().onTogglePause();
      return;
    }
    // notes/edits #5a: a bot's turn in solo mode never arms the shot clock, so `state` stays
    // null the whole time it's playing — that used to fall through to the idle "turn clock"
    // label even while a bot is actively moving. Show the same "waiting" copy multiplayer
    // spectators see for a non-active seat instead, so it reads as "something's happening", not idle.
    const activeSeat=currentTurnSeat();
    const botPlaying=activeSeat!=null&&activeSeat!==appState.mySeat&&!(appState.game.players[activeSeat]&&appState.game.players[activeSeat].done);
    wrap.classList.add("idle");wrap.classList.remove("urgent","paused");
    labelEl.textContent=botPlaying?"waiting":"turn clock";numEl.textContent="–";unitEl.textContent="";subEl.innerHTML="&nbsp;";
    return;
  }
  wrap.classList.remove("idle");
  if(paused){
    // CLOCK-02 FIX (mp-pause-clock-desync): the frozen remaining comes from the host's
    // pauseElapsed carried in the clock broadcast (state.pauseElapsed) so host and guest show the
    // IDENTICAL number — a guest never owns appState.shotClockPauseElapsed (it stays 0), which is
    // why it used to freeze at 20s while the host showed 13s. Fall back to the live deadline only
    // for the brief pre-broadcast window on a guest (self-corrects on the next clock write).
    const peMs=(state.pauseElapsed!=null)?state.pauseElapsed:Math.max(0,30000-(state.deadline-Date.now()));
    const elapsed=peMs/1000;
    const urgent=elapsed>=20;
    wrap.classList.remove("urgent");wrap.classList.add("paused");
    labelEl.textContent="paused";
    numEl.textContent=Math.ceil(urgent?30-elapsed:20-elapsed);
    unitEl.textContent="seconds";
    subEl.innerHTML=`tap ${iconImg(PLAY_IMG)} to resume`;
    // CLOCK-03: same togglePause resume seam as the other paused branch above. UX (this phase):
    // the frozen NUMBER didn't read as clickable (unlike the ⏸-symbol branch), so .tappable adds
    // a dotted underline + hover lift making it obviously tap-to-resume on your own turn.
    numEl.style.cursor="pointer";numEl.onclick=()=>netHandlers().onTogglePause();numEl.classList.add("tappable");
    return;
  }
  const remain=Math.max(0,Math.ceil((state.deadline-Date.now())/1000));
  const elapsed=30-remain;
  const urgent=elapsed>=20;
  // whose turn is being timed vs. who's looking: the active player sees a live "play in / or pay"
  // countdown; everyone else sees a greyed "WAITING" clock with spectator-appropriate copy — a
  // slow player hands the rest of the crew a coin, then (final 10s) forfeits their turn entirely.
  const active=(state.seat===appState.mySeat);
  wrap.classList.remove("paused");
  // notes/edits UI-02: the clock's outer edge warms up as the 20s window burns down — 0 at a full
  // 20s left, 1 at zero. The CSS reads --heat to size an orange glow (see #shotClockPanel.warming).
  const heat=Math.max(0,Math.min(1,elapsed/20));
  if(active){
    wrap.classList.remove("idle");
    wrap.classList.toggle("urgent",urgent);
    wrap.classList.toggle("warming",!urgent&&heat>0);
    wrap.style.setProperty("--heat",heat.toFixed(3));
    labelEl.textContent="play in";
    numEl.textContent=urgent?30-elapsed:20-elapsed;
    unitEl.textContent="seconds";
    subEl.innerHTML=urgent?"or lose your turn":`or pay 1${iconImg(COIN_IMG)}`;
  }else{
    wrap.classList.remove("urgent");
    wrap.classList.add("idle");
    labelEl.textContent="waiting";
    numEl.textContent=urgent?30-elapsed:20-elapsed;
    unitEl.textContent="seconds";
    subEl.innerHTML=urgent?"or their turn is skipped":`or gain 1${iconImg(COIN_IMG)}`;
  }
}

export function liveRender(){
  if(appState.replaying)return;          // during reload-replay we rebuild state silently, no render/broadcast
  appState.evIdx=Math.max(0,appState.game.events.length-1);
  if(!appState.game.events.length)return;
  syncLogLines();
  $("scrub").max=Math.max(0,appState.game.events.length-1);
  render();
  const e=appState.game.events[appState.evIdx];
  spawnPops(e,boardCell()); // notes/edits 11-03: cell now lives in src/ui/board.js
  if(appState.isHost){
    const _nh=netHandlers();
    // seam (D-07/criterion 1, RESEARCH Q1b edge 2): was a direct pushEvents() call — pushEvents
    // is itself still a classic-script global this wave, wired in through the still-present PP
    // bridge by src/main.js's setNetHandlers() call, formalized to a real src/net/ import in 11-06.
    if(_nh.onEvents)_nh.onEvents();       // broadcast the growing event feed to every other browser
  }
}
// needsAction=true turns the panel yellow (this seat must decide something);
// false (the default) is pale blue — informational only, nothing to click.
export function panel(html,needsAction=false){
  html=emojify(html);
  $("apGridInner").innerHTML=html;
  $("actionPanel").style.display=html?"":"none";
  $("actionPanel").classList.toggle("needsAction",!!needsAction);
  resizePanel(!!html);
  // notes/edits #1: every message text types in one character at a time, whether it's passive
  // narration or an action prompt with buttons — see typewriterReveal() for how. The returned
  // promise (stashed on the element) resolves only once every character is actually on screen,
  // so callers like flash() can wait for real completion instead of a guessed duration.
  const msgEl=$("actionPanel").querySelector(".apMsg");
  if(msgEl)msgEl._revealDone=typewriterReveal(msgEl,REVEAL_MS_PER_CHAR);
}
// notes/edits BUG-01: smoothly resize the box to the CURRENT message's finished height, exactly
// ONCE. Measure the natural content height (with the row briefly unconstrained and the transition
// suppressed so the measurement itself never animates), snap the row back to where it was, then let
// the transition animate to the measured height. The typewriter then fills a box that's already the
// right size — so the height animates a single time per message instead of on every character.
export function resizePanel(hasContent){
  const grid=$("apGrid"),inner=$("apGridInner");if(!grid)return;
  if(!hasContent){grid.style.gridTemplateRows="0px";return;}
  const from=getComputedStyle(grid).gridTemplateRows; // resolved px of the current height
  grid.style.transition="none";
  grid.style.gridTemplateRows="max-content";
  const h=inner.offsetHeight;                          // natural height of the finished message
  grid.style.gridTemplateRows=from;                    // back to the start value…
  void grid.offsetHeight;                              // …committed as the transition's from
  grid.style.transition="";
  grid.style.gridTemplateRows=h+"px";                  // one smooth animation to the real height
}
// Walks msgEl's real DOM in document order and reveals it character-by-character (text nodes)
// and unit-by-unit (atomic elements like <img>), instead of faking a type-in with a CSS wipe — a
// wipe reveals every line at the same horizontal position simultaneously, which looks like
// parallel typing instead of one narrator reading in order once a message wraps past a single
// line. Walking real text nodes keeps nested formatting (<b>, colored <span>s) intact: the tags
// themselves are never touched, only the text inside them fills in over time.
//
// Paced by real elapsed time (performance.now()) on every tick, not a chained
// setTimeout(tick, msPerChar) that just counts ticks — a chain like that has no way to catch up
// once it falls behind: each tick only schedules the NEXT one after the current callback's own
// overhead (DOM mutation, style recalc) finishes, so if any single callback runs even a little
// over budget, that delay permanently compounds into every remaining character. Deriving the
// target reveal count from actual elapsed time every tick means a late tick just reveals several
// characters at once to catch back up to schedule, instead of drifting later forever.
// Deliberately setTimeout-driven rather than requestAnimationFrame: rAF callbacks are fully
// suspended (not just throttled) in a backgrounded/hidden tab, which would let flash() — which
// awaits this reveal before it can hold/fade/return — hang forever and freeze the whole bot-turn
// game loop the moment a player switches tabs. setTimeout keeps firing (just throttled) even when
// hidden, so the reveal still completes — slower while backgrounded, but never stuck.
// Batches each tick's reveal into ONE nodeValue write per text node instead of one per character
// (a catch-up tick that reveals twelve characters does one write, not twelve). This is a minor
// efficiency tidy — NOT the Safari storm fix. The storm hitch was the narration box's smooth
// height animation re-firing every reveal tick; that lives in #apGrid's CSS and is fixed there by
// snapping the height. The typewriter reveal (this) is deliberately kept exactly as-is.
// Characters are counted as CODE POINTS (`[...str]`, matching the original's `for...of`), not code
// units — this text is full of emoji and slicing mid-surrogate-pair would render broken glyphs.
export function typewriterReveal(msgEl,msPerChar){
  if(msgEl._revealTimer)clearTimeout(msgEl._revealTimer);
  const units=[],recs=[];
  const walker=document.createTreeWalker(msgEl,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n;
  while(n=walker.nextNode()){
    if(n.nodeType===Node.TEXT_NODE){
      if(!n.nodeValue)continue;
      const rec={node:n,chars:[...n.nodeValue],shown:0,dirty:false};
      n.nodeValue="";
      recs.push(rec);
      // still one pacing unit per code point, so the timing arithmetic below is untouched — but
      // the unit now points at its owning node record instead of carrying a character to write
      for(let i=0;i<rec.chars.length;i++)units.push({rec});
    }else if(n.tagName==="IMG"){
      n.style.opacity="0";n.style.transition="opacity .1s";
      units.push({img:n});
    }
  }
  return new Promise(resolve=>{
    const total=units.length;
    if(!total){resolve();return;}
    let revealed=0;
    const start=performance.now();
    const pollMs=Math.max(16,Math.min(msPerChar,32));
    const step=()=>{
      const target=Math.min(total,Math.floor((performance.now()-start)/msPerChar));
      while(revealed<target){
        const u=units[revealed++];
        if(u.img)u.img.style.opacity="1";
        else{u.rec.shown++;u.rec.dirty=true;}   // book-keeping only — no DOM write in here
      }
      // one write per touched node per tick, instead of one per character
      for(let i=0;i<recs.length;i++){
        const r=recs[i];
        if(r.dirty){r.node.nodeValue=r.chars.slice(0,r.shown).join("");r.dirty=false;}
      }
      if(revealed<total)msgEl._revealTimer=setTimeout(step,pollMs);
      else resolve();
    };
    step();
  });
}
// notes/edits #1: .1s per letter to type in (see typewriterReveal), then held fully visible for
// another .08s/letter before flash() fades it out — floored at 1000ms so a short message/word
// (narration or chat bubble alike) doesn't flash past before anyone can actually read it.
const REVEAL_MS_PER_CHAR=20;
export function setNeedsAction(v){const el=$("actionPanel");if(el)el.classList.toggle("needsAction",!!v);}

// ---- narration: shown to everyone in the yellow action panel (no separate banner) ----
export function showNarration(html){panel(html?`<div class="apMsg">${html}</div>`:"");}
// netNarrate/netBroadcast remain classic-script globals this wave (they call showNarration bare,
// which resolves fine via the PP bridge) — they call into src/net/'s netSetNarr directly and are
// homed in main/orchestration in a later wave, not moved here (RESEARCH.md's battleAsk-style
// classification note applies the same reasoning: net-adjacent orchestration is out of scope for
// this UI-rendering cluster).

export function appendChatLine(seat,text){
  const log=$("chatLog");if(!log)return;
  const line=document.createElement("div");
  line.innerHTML=`${pn(seat)}: ${escHtml(text)}`;
  log.appendChild(line);
  log.scrollTop=log.scrollHeight;
}
// one bubble div per seat; a new message replaces whatever that seat was already showing.
// chatBubbles/positionChatBubble/removeChatBubble all live in src/ui/board.js (chatBubbles since
// 11-03; positionChatBubble/removeChatBubble moved there in 11-06 — see that file's header for
// why) — imported directly here (same ui/ tier, already-moved sibling), rather than left as a
// bare bridge read.
export function showChatBubble(i,text){
  const holder=$("chatBubbles");if(!holder)return;
  removeChatBubble(i);
  const b=document.createElement("div");
  b.className="bubble";
  b.style.borderColor=HEXCOL[i];
  b.onclick=()=>removeChatBubble(i);
  const msgEl=document.createElement("span");
  b.appendChild(msgEl);
  holder.appendChild(b);
  chatBubbles[i]=b;
  b._msgEl=msgEl;
  const xy=boatXY(i,boardShipEls()); // notes/edits 11-03: shipEls now lives in src/ui/board.js
  if(xy)positionChatBubble(i,xy[0],xy[1]);
  msgEl.textContent=text; // real text node for typewriterReveal to walk+blank — never innerHTML,
                          // so there's no HTML-injection surface here even without escHtml
  (async()=>{
    await typewriterReveal(msgEl,REVEAL_MS_PER_CHAR);
    if(chatBubbles[i]!==b)return; // dismissed (click) or replaced by a newer message meanwhile
    b._timer=setTimeout(()=>{
      if(chatBubbles[i]!==b)return;
      b.classList.add("fadeOut");
      b._timer=setTimeout(()=>{if(chatBubbles[i]===b)removeChatBubble(i);},500);
    },msgHoldMs(text));
  })();
}

// narrates the outcome of the event just pushed via game.ev() — bot turns already get this
// for free via narrateCurrent(), but human actions (dock, anchor flip, trade) need it explicitly
// since they don't route through botBeat(). Skips (rather than clobbers) a still-pending
// decision's buttons — e.g. the 20s shot-clock penalty fires while the player hasn't answered
// yet, so overwriting the panel would wipe out the very buttons they need to click. Awaits a
// beat after narrating so the outcome is actually readable before the next thing overwrites it.
export async function narrateLastEvent(){
  const e=appState.game.events[appState.game.events.length-1];if(!e)return;
  // settleSideBets() already flashes one aggregate "Lookout's Call settles" message covering
  // every bettor — re-narrating the last individual sidebet event here would just duplicate it.
  if(e.t==="sidebet")return;
  if($("actionPanel").classList.contains("needsAction"))return;
  const L=describe(e);if(!L)return;
  // notes/edits #1 follow-up: this used to be netNarrate()+a flat 3000ms sleep, a leftover from
  // before the typewriter/hold/fade system existed. That fixed window never accounted for reveal
  // time at all, so a long multi-sentence line (battle results especially — often 120-160+ chars)
  // could burn the ENTIRE 3s just typing itself in, leaving no time to actually read it before the
  // next event overwrote it. flash() awaits real reveal completion, then holds for length*80ms —
  // scaling with the text instead of a one-size-fits-all timer.
  await flash(L.txt);
}

// notes/edits #1: ms is no longer used to size the hold — the hold duration is derived purely
// from the message's own length (see msgHoldMs). flash() only ever runs on the host (spectating
// clients mirror narration via a lightweight direct showNarration() echo in watchNarr(), never
// through flash()), so awaiting the real on-screen completion below doesn't need to match across
// browsers/clients — it only paces the host's own gameplay flow.
// Awaits the actual typewriterReveal() completion (never a guessed duration) before the hold
// timer even starts, so a message can never be held or faded before every character is genuinely
// on screen — regardless of how fast or slow reveals run in a given browser. Held on screen
// fully-visible for the hold period, then fades out over .5s before flash() resolves, so the next
// narration/prompt never clobbers this one mid-transition.
export async function flash(msg,ms){
  const _nh=netHandlers();
  // seam (D-07/criterion 1, RESEARCH Q1b edge 1): was a direct netNarrate(msg) call — netNarrate
  // is itself still a classic-script global this wave, wired in through the still-present PP
  // bridge by src/main.js's setNetHandlers() call, formalized to a real src/net/ import in 11-06.
  if(_nh.onBroadcast)_nh.onBroadcast(msg);
  const el=$("actionPanel").querySelector(".apMsg");
  if(el&&el._revealDone)await el._revealDone;
  const text=el?el.textContent:msg;
  await sleep(msgHoldMs(text));
  if(el&&el.isConnected){
    el.classList.add("fadeOut"); // BUG-01: text fades via opacity only — no grid-row collapse, so
                                 // nothing animates the box height (see #apGrid CSS). The box snaps
                                 // to the next message's height when panel() replaces the content.
  }
  await sleep(500);
}
