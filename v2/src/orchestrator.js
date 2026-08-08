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
  PERP, DIRS, HEXCOL, CROWN_IMG, CLOSE_X_IMG, unusedDefaultName, iconImg, man,
  ilabelImg,
} from "./shared/index.js";
import { initAudio, playForEvent, playWinScreen, playBattleEngage, isMuted, setMuted } from "./ui/audio.js";
import {
  netSetFlip, netWatchFlip, netSetClock, netSetTimerOff, netWatchTimerOff, netWatchClock,
  netSetPaused, netWatchPaused, netDeleteRoom,
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
  showNarration, panel, setNeedsAction, flash, fadeOutPanel, narrateLastEvent, liveRender, setClockUI,
  bakeoffPrompt, bakeoffReveal,
  appendChatLine, showChatBubble,
  setFlipActive, setFlipCoin, boardCell, boardShipEls, drawBoard, render, resetBoardLog,
  seedIdleGameState, syncBoardSizing, watchMutePlacement, victoryConfetti, clearChatBubbles,
  battleSnapshot, renderBattleFromSnap, battleFooter, coinHTML, pipsHTML,
  collectSideBets, settleSideBets, netIntroBarrier, showAhoyIntro, showTurnOrderIntro,
  reachable, pickCell, localAsk, humanTurn, botTurn, runStormLive, remotePickHighlights, wireRestoreFail,
  endReplay, animateRimSweepIfAny,
  showHome, showRoom, showGameView, renderSeatList, wireWelcome, buildPlayerRows, hideBootLoader,
  wireRecipeModal, recipeInfo, winRecipeSpan, recipeCardHTML, passGate,
  getMyId, preloadAssets, resumeSoloGame, genCode, saveSession, clearSession, seatStrat,
  requireName, getLastName, // FIX-01: the one read chokepoint (createRoom) and the raw persisted read (Feedback)
  pendingAutoName, // NAME-01: was the resolved name CHOSEN by the player, or merely offered to them?
  openNameModal, // NAME-02: the room screen's "Change yer name" reuses the one naming modal
  SESSION_SCHEMA_V, SOLO_SCHEMA_V,
  encodeDec, decodeDec, saveSoloState, clearSoloState, fixEv, syncLogLines, spawnPops, apBtnStyle,
  rawName, pn, pname, updateRecipeBanner, toggleShotClockPause, applyPauseState, describe, seatLocal,
  decisionIsLocal, resolveOpt, setActor, armClock, withShotClock, stepDelay, ask, pickNarrVariant,
  stopShotClock, waitWhilePaused, applyTimerOff,
  mountKofi, openKofi, // KOFI-01: the embedded Ko-Fi panel and its modal opener
  coinShortfall, // G6: the shared coin re-validation, reached through the barrel (module_graph_check tiering)
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
  if(!appState.db||!appState.room)return;
  // CLOCK-02 FIX (mp-pause-clock-desync): the payload now also carries the whole-table pause
  // state, so a guest flips frozen<->running AND reads its frozen remaining from the SAME
  // authoritative clock write that carries the deadline — never a round-trip apart from the
  // /paused flag. That round-trip gap WAS the desync: guests rendered the stale pre-pause
  // deadline and a host-only pauseElapsed they never received. `paused` rides every write (so a
  // running broadcast clears it); `pauseElapsed` (the host's frozen elapsed, D-07) is only
  // meaningful while paused, so it is included only then. Host stays the sole deadline writer.
  const payload=appState.shotClockSeat==null?null:{
    seat:appState.shotClockSeat,
    deadline:appState.shotClockDeadline,
    paused:!!appState.shotClockPaused,
  };
  if(payload&&appState.shotClockPaused)payload.pauseElapsed=appState.shotClockPauseElapsed;
  netSetClock(appState.db,appState.room,payload,netFail("clock"));
}
// #7 / FIX-02/N-03 (phase 21): any player may switch the turn timer off/on, in EVERY mode — the
// early return that used to make this a silent no-op with no Firebase connection (the D-20 "dead
// control" bug) is gone. Persisted locally FIRST, before either branch, so solo and pass-and-play
// (which never used to reach this line at all) actually remember the preference too (D-19). Then,
// exactly like togglePause() immediately below: multiplayer (db && room) writes Firebase so the
// whole table stays in sync via watchTimer(); solo/pass-and-play calls applyTimerOff() directly —
// the SAME body watchTimer() calls, carrying the BUG-02 re-arm fix verbatim (D-17/D-18), so neither
// direction can drift between the networked and local path.
export function toggleTimer(){
  const next=!appState.timerOff;
  try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}
  if(appState.db&&appState.room){
    netSetTimerOff(appState.db,appState.room,next,netFail("timerOff"));
  }else{
    applyTimerOff(next);
  }
}
// CLOCK-02: any player (host or guest) may trigger a true play/pause of the WHOLE game —
// countdown AND bot captains — not just the ⏱ timer-off toggle above (D-05: the two coexist).
// Multiplayer: write the flag; every client's watchPause() mirrors it, and only the host's
// branch mutates shotClockDeadline/shotClockPauseElapsed (D-06/D-07 — see applyPauseState).
// Solo/pass-and-play (no db/room): fall back to the local toggleShotClockPause() unchanged.
export function togglePause(){
  if(appState.db&&appState.room){
    netSetPaused(appState.db,appState.room,!appState.shotClockPaused,netFail("pause"));
  }else{
    toggleShotClockPause();
  }
}
// AUDIO-02 (phase 21): the mute button beside the clock. Pure client-side state — isMuted()/
// setMuted() (src/ui/audio.js) are the whole store, backed by their own localStorage key; no
// Firebase write, no net* writer, no appState field, so muting never reaches another player's
// browser (D-13, T-21-12). setClockUI() is called directly (main tier may call it, unlike ui-tier
// code) so the icon/tooltip refresh immediately rather than waiting for the next 500ms tick.
export function toggleMute(){
  setMuted(!isMuted());
  setClockUI();
}
// Structurally identical to watchTimer() below: every client (host and guest) attaches this so
// the shared paused flag is tracked table-wide. Only the host branch runs applyPauseState (the
// deadline/pauseElapsed math) — a guest just mirrors the boolean for rendering (D-06).
export function watchPause(){
  netWatchPaused(appState.db,appState.room,s=>{
    const v=!!s.val();
    if(appState.isHost){
      applyPauseState(v);
      // CLOCK-02 FIX (mp-pause-clock-desync): applyPauseState() recomputes the host-authoritative
      // deadline (resume) / stashes pauseElapsed (pause) but is PURELY LOCAL. Without this
      // re-broadcast the guests keep rendering the stale pre-pause deadline — freezing at a
      // different number and racing to 0 on resume. broadcastClock() is the single deadline writer
      // (host authority preserved) and now also carries the pause state for the guest render.
      broadcastClock();
    }else appState.shotClockPaused=v;
    setClockUI();
  });
}
// notes/edits BUG-02 / D-18 (phase 21): the state-mutation body (including the re-arm fix) now
// lives in src/ui/util.js's applyTimerOff(), shared verbatim with toggleTimer()'s new local
// branch below — this callback is reduced to just the Firebase wiring.
export function watchTimer(){
  netWatchTimerOff(appState.db,appState.room,s=>applyTimerOff(!!s.val()));
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
    // NARR-01 audit finding: this used to hand-write text byte-identical to
    // EVENT_NARRATION.shotclockskip (src/ui/util.js) — narrate through the table instead, exactly
    // as every other event in the codebase is narrated, so the duplicate can never drift again.
    //
    // WYATT, 2026-07-30: **running out the 30s clock now costs the TURN AND NOTHING ELSE.**
    // *"when the shot clock runs out, you just lose your turn, but you don't lose a crate. Let's
    // get rid of that crate losing business altogether."* Asked whether the coin fallback went too,
    // he chose both 30s penalties. DO NOT RESTORE EITHER. What used to be here:
    //
    //   - holding crates -> a RANDOM crate spliced out and returned to tokens[]
    //   - holding none   -> up to 5🌕 taken
    //
    // The 20-second penalty (applyShotClockPenalty in src/ui/util.js — 1🌕 to each other captain) is
    // a DIFFERENT mechanic at a different threshold and deliberately still runs. He was asked
    // about it specifically and kept it.
    //
    // This also removes CR-02's root cause rather than guarding its symptom. The confiscation ran
    // AFTER shotClockForce() had already resolved the pending `ask()` promise, and `ask()` forces
    // default index 0 — Accept — so a partner who timed out auto-accepted a trade for a crate the
    // clock had just taken, and the trade then spliced on indexOf === -1. With no confiscation
    // there is no vanishing crate. The moveCrate() invariant and the turnExpired guard in
    // humanTrade stay regardless: a timed-out partner must not auto-accept in the first place.
    //
    // Determinism: the crate branch consumed one appState.game.r() call (the random crate index).
    // Removing it changes RNG draw counts in LIVE games only — the 31 fixtures are all-bot engine
    // replays where no shot clock ever fires, and src/engine/index.js is untouched. Verified green.
    appState.game.ev({t:"shotclockskip",p:p.idx});
    await narrateLastEvent();
    liveRender();
    if(!seatLocal(p.idx)&&appState.db&&appState.room)netRemovePrompt(appState.db,appState.room,netFail("prompt clear"));
  }
  stopShotClock();
}
export function watchClock(){
  netWatchClock(appState.db,appState.room,s=>{appState.clockState=s.val();setClockUI();});
}

// ---- narration: shown to everyone in the yellow action panel (no separate banner) ----
// D-10: `variants` is additive — the host's OWN screen now selects from the exact same payload
// every other client selects from (pickNarrVariant), rather than always rendering the
// viewer-neutral `html` verbatim. That's what lets a host who is themselves the subject of the
// line read the addressed ("you...") form, while the broadcast `html` field stays neutral for
// every other seat and for old clients that never read `variants` at all.
export function netNarrate(html,variants){if(appState.replaying)return;showNarration(pickNarrVariant({html,variants},appState.mySeat));if(appState.isHost&&appState.db&&appState.room)netSetNarr(appState.db,appState.room,html,netFail("narration"),variants);}
// broadcast narration to spectators WITHOUT touching this screen's panel — used during
// battles so the local scoreboard (coins) stays put while others still get the play-by-play
export function netBroadcast(html,variants){if(appState.replaying)return;if(appState.isHost&&appState.db&&appState.room)netSetNarr(appState.db,appState.room,html,netFail("narration"),variants);}

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
  // @copy prompt.battle.scoreboard
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
    if(v){
      // 260801-7f4 (guest tier): reading spectatingBattle BEFORE assigning it true IS the edge
      // trigger — this callback fires on every write to the battle node (many times per fight,
      // once per renderBattle()), so without the read-then-assign order the clash would re-fire
      // on every scoreboard update instead of once per battle. The `!v.title` half of the guard is
      // the bakeoff exclusion: battleSnapshot only carries a `title` for a bakeoff snapshot
      // (asyncBakeoff's base() is the only producer of one anywhere in the repo), and un-silencing
      // the bakeoff is a design call belonging to Wyatt, not a side effect of this timing fix — the
      // bakeoff stays exactly as silent as it is today. Known, accepted variance: this lands on the
      // first battle-node write (the scoreboard appearing), which trails the host's own clash on
      // the announcement by a few seconds when a human spectator is put through side-bet prompts —
      // still before the first flip, still fixing the "end of fight" complaint on this tier too.
      if(!appState.spectatingBattle&&!v.title)playBattleEngage();
      appState.spectatingBattle=true;
      if(!appState.inBattlePrompt)renderBattleFromSnap(v);
    }
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
  // D-10 DELIVERY (F7): the spectator line is the neutral broadcast, the asked seat's own prompt is
  // that seat's variant, and each client selects for itself through the mechanism that already ships.
  //
  // THIS IS A NEW FINDING, NOT A REVERSAL. D-35's sweep listed this site as "the correct
  // actor/spectator split (D-10), not a transport fork", and it was right about the question it
  // asked: does guest-side code AUTHOR its own text? It does not. This gate asks a different
  // question — does the broadcast REACH the right viewer? — which that sweep never examined. One
  // message cannot express a per-viewer difference, however correctly it was authored.
  netBroadcast(spectMsg,[{seat,html:msg}]);
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
/* ================= v2 rule 9 (and rule 13): the one-round battle =================
   The whole fight is ONE exchange. Both cannons speak once, and the wind decides the tie:

     heads vs tails            → the heads ship wins outright
     both heads, one downwind  → the downwind ship wins, the wind carries the shot home
     both heads, crosswind     → the cannonballs collide. The ATTACKER may pay 2🌕 to load a fresh
                                 broadside and fire ALONE — heads and it lands, tails and they may
                                 pay again, as often as they can afford it. Decline → NULL.
     both tails                → both shots went wild. The defender may slip away FREE (rule 2's
                                 "fleeing is free"), sailing under the ordinary v2 rules. Stand
                                 their ground and the attacker gets the same paid re-fire.

   A NULL battle ends with nobody gaining anything — no crate, no coins, no caller paid, and the
   powder already spent stays spent. That is the real risk in attacking.

   Prize: ONE CRATE, winner's choice. No coin alternative and no place-swap — a swap would hand
   the loser the advantageous square (Wyatt, 2026-08-04). A ship with an empty hold cannot be
   attacked at all, so there is always a crate to take.

   `need` is gone along with the scoreboard race: the battle-UI's a/d counters now only ever read
   0 or 1, and exist so the shared renderBattle() scoreboard keeps working unchanged. */
export async function asyncBattle(att,def){
  const c=appState.game.cfg;
  // G6 (COIN-AUDIT site 13), kept: guard BEFORE the opening broadcast, so a battle refused for
  // want of powder never announces itself and no snapshot can be in flight. v2 adds rule 13e's
  // empty-hold check to the same gate — canAttack() owns both, so the UI's greying and the engine
  // can never disagree about what is a legal target.
  if(!appState.game.canAttack(att,def))return null;
  playBattleEngage();
  const need=1;
  // D-08/D-25: the opening names both combatants, each reading it addressed to themselves.
  const battleOpenVariants=[{seat:att.idx,html:`⚔️ ${pn(att.idx)} — ye attack ${pn(def.idx)}! One broadside each…`},{seat:def.idx,html:`⚔️ ${pn(att.idx)} attacks ye! One broadside each…`}];
  // @copy adhoc.battle.opening
  await flash(`⚔️ ${pn(att.idx)} attacks ${pn(def.idx)}! One broadside each…`,Math.max(900,stepDelay()),undefined,battleOpenVariants);
  if(c.powder)att.coins-=c.powder;
  appState.game.battles++;
  const bets=await collectSideBets(att,def);
  let a=0,d=0;
  // purely geometric, and it never changes mid-battle because v2 has no swap
  const downwind=appState.game.downwindSide(att,def);
  let fled=false,nulled=false;
  const rounds=[];
  const hA=att.strategy==="human",hD=def.strategy==="human";
  let round=0;
  const nm=pn;
  const bd=(typeof stepDelay==="function")?stepDelay():500;
  const spin=Math.max(260,Math.min(650,bd*0.7));  // coin tumble time
  const beat=Math.max(300,Math.min(900,bd*0.9));  // suspense pause before the defender answers
  const hold=Math.max(500,Math.min(1500,bd*1.1)); // pause to read the round result
  const base=o=>Object.assign({att,def,a,d,round,need},o);
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
  // ---- THE round ----
  round=1;
  renderBattle(base({atState:"wait",dfState:"wait",live:"a",result:`${nm(att.idx)} loads the cannon…`}));
  await sleep(beat*0.5);
  const ah=hA?await hFlip("a",att,`⚔️ ${nm(att.idx)} (attacker) — fire!`,{dfState:"wait"}):await bFlip("a",att,{dfState:"wait"});
  renderBattle(base({atState:ah?"H":"T",dfState:"wait",live:"a"}));
  await sleep(beat*0.6);
  renderBattle(base({atState:ah?"H":"T",dfState:"wait",live:"d",
    result:`${nm(att.idx)} shows ${ah?"HEADS":"TAILS"} — ${nm(def.idx)} must answer…`}));
  await sleep(beat);
  const dh=hD?await hFlip("d",def,`⚔️ ${nm(att.idx)} attacks ye — defend! FLIP`,{atState:ah?"H":"T"}):await bFlip("d",def,{atState:ah?"H":"T"});
  // ---- resolve ----
  let scorer=null,rmsg,winner=null;
  if(ah&&dh){
    if(downwind){
      scorer=downwind;
      if(downwind==="a"){a++;winner=att;}else{d++;winner=def;}
      const dwName=downwind==="a"?nm(att.idx):nm(def.idx);
      // @copy misc.battleline.bothheadsdownwind
      rmsg=`<span class="score">Both fire ⚪️ HEADS — but ${dwName}'s firing downwind and the shot hits!</span>`;
    // @copy misc.battleline.bothheadscrosswind
    }else rmsg=`<span class="cancel">Both fire ⚪️ HEADS — but in the crosswind, the cannonballs collide.</span>`;
  }else if(ah||dh){
    scorer=ah?"a":"d";
    if(ah){a++;winner=att;}else{d++;winner=def;}
    const hitName=ah?nm(att.idx):nm(def.idx);
    // @copy misc.battleline.hitlands
    rmsg=`<span class="score">${hitName} lands a hit!</span>`;
  }
  // @copy misc.battleline.bothmiss
  else rmsg=`<span class="cancel">Both miss — ⚫️ TAILS all round.</span>`;
  rounds.push([ah?1:0,dh?1:0,0,scorer]);
  renderBattle(base({atState:ah?"H":"T",dfState:dh?"H":"T",live:null,winCoin:scorer,result:rmsg}));
  await sleep(hold);

  if(!winner){
    // ---- both tails: the defender's FREE escape (rules 9a + 2c) ----
    if(!ah&&!dh){
      const cells=reachable(def);
      if(cells.length){
        let flee;
        // @copy prompt.battle.flee
        if(hD){setActor(def.idx);flee=await ask(`${nm(def.idx)}: both shots missed wildly! Slip away?`,
          [{label:"🏃 Flee!",value:true},{label:"⚔️ Stand yer ground",value:false}]);}
        // a bot slips away when the wind is against it (it loses the next both-heads) or when it is
        // carrying a crate it cannot afford to lose — the same test the headless battle() applies
        // same test as the headless battle() — a RECIPE crate held with no spare. needs() excludes
        // what you already hold, so testing against it can never match (it never fled in 3000 sims).
        else flee=(downwind==="a")||def.ing.some(i=>def.recipe&&def.recipe.includes(i)&&appState.game.cnt(def.ing,i)<=1);
        if(flee){
          const dest=hD?await pickCell(def,cells):cells.reduce((best,cc)=>man(cc,att.pos)>man(best,att.pos)?cc:best,cells[0]);
          if(dest){def.pos=dest;appState.game.tradewind(def);await animateRimSweepIfAny();}
          fled=true;
          appState.game.recordSkirmish(att,def,null);
          appState.game.ev({t:"battleflee",a:att.idx,d:def.idx,rounds,downwind});
          liveRender();
        }
      }
    }
    // ---- the attacker's paid re-fire (rule 9b, extended to both-tails by rule 9a) ----
    if(!fled){
      const refire=c.refire||0;
      while(!winner){
        let again=false;
        if(refire&&att.coins>=refire){
          if(hA){
            setActor(att.idx);
            // @copy prompt.battle.refire
            again=await ask(`${nm(att.idx)}: load another broadside <span class="nobrk">(−${refire}🌕)</span>? ⚪ HEADS and the shot lands.`,
              [{label:`🔥 Fire again <span class="nobrk">(−${refire}🌕)</span>`,value:true},{label:"🏳️ Break off",value:false}]);
            if(appState.turnExpired)again=false;
          }else again=appState.game.wantsRefire(att,def,downwind,rounds.length);
        }
        // D-40 safety net: re-read the purse after the await rather than trusting the gate above
        if(!again||att.coins<refire){nulled=true;break;}
        att.coins-=refire;
        appState.game.ev({t:"refire",a:att.idx,d:def.idx,cost:refire});
        liveRender();
        round++;
        const rh=hA?await hFlip("a",att,"🔥 Fire again!",{dfState:dh?"H":"T"}):await bFlip("a",att,{dfState:dh?"H":"T"});
        rounds.push([rh?1:0,null,0,rh?"a":null]);
        if(rh){a++;winner=att;
          // @copy misc.battleline.refirehits
          renderBattle(base({atState:"H",dfState:dh?"H":"T",live:null,winCoin:"a",result:`<span class="score">The second broadside tells — ${nm(att.idx)} lands it!</span>`}));
        }else{
          // @copy misc.battleline.refiremisses
          renderBattle(base({atState:"T",dfState:dh?"H":"T",live:null,result:`<span class="cancel">The shot goes wide.</span>`}));
        }
        await sleep(hold);
      }
    }
  }
  panel("");
  // battle's over — clear the broadcast scoreboard so every client's watchNarr can take the panel
  // back for the result narration (and so spectatingBattle resets). (#9)
  if(appState.isHost&&appState.db&&appState.room&&!appState.replaying)netRemoveBattle(appState.db,appState.room,netFail("battle clear"));
  if(fled)return;
  if(nulled){
    // rule 9: NULL — the battle ends with no player gaining anything, and no caller is paid.
    appState.game.recordSkirmish(att,def,null);
    appState.game.ev({t:"battlenull",a:att.idx,d:def.idx,rounds,downwind});
    liveRender();
    await narrateLastEvent();
    await settleSideBets(bets,null);
    return null;
  }
  const win=winner,lose=win===att?def:att;
  if(win===att)appState.game.attWins++;
  // v2 rule 9d: the prize is a crate, full stop. The loser no longer chooses to pay in coin, so
  // the whole "pay with 5🌕 or a crate" prompt is gone — the only choice left is the WINNER's,
  // picking which crate to take.
  let pick;
  const uniq=[...new Set(lose.ing)];
  if(win.strategy==="human"&&uniq.length>1){setActor(win.idx);
    // @copy prompt.battle.winnerplunder
    pick=await ask(`${pn(win.idx)}, choose yer plunder!`,uniq.map(i=>({label:ilabelImg(i),value:i})));}
  else{const w2=lose.ing.filter(i=>appState.game.needs(win).includes(i));pick=w2[0]||lose.ing[0];}
  let spoil=null,spoilIng=null;
  if(pick!=null&&lose.ing.includes(pick)){
    lose.ing.splice(lose.ing.indexOf(pick),1);win.ing.push(pick);
    spoil=ilabelImg(pick);spoilIng=pick;
    // the whole table watched the winner choose — public evidence of what they are after
    appState.game.noteDemand(win,pick,1);
  }
  // BATL-03, hardened by rule 9d: nobody moves after a battle.
  appState.game.recordSkirmish(att,def,lose,spoilIng);
  appState.game.ev({t:"battle",a:att.idx,d:def.idx,rounds,winner:win.idx,spoil,spoilIng,spoilChosen:false});
  liveRender();
  // narrate the outcome now — settlement pushes further events right after this, and callers only
  // narrate the *last* event once asyncBattle returns
  await narrateLastEvent();
  await settleSideBets(bets,win===att?"a":"d");
  return win;
}

// v2 rule 12: asyncBakeoff is gone — see the note in src/ui/flow.js. Best Baker is decided by
// Game.bakeRank (crates, then coins, then who got home first), not by a final flip.

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
  appState.liveDone=true;playWinScreen();render(); // D-05: the guest's win-screen cue, tied to the screen appearing — end/finish stay silent as events per D-06
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
    // G4 (Wyatt-approved 2026-07-30): one short line. The trailing clause explaining how to win
    // duplicated the Ahoy intro that closed moments earlier (and, after G5, immediately before) —
    // the prompt's job is to ask, not to re-teach. The two recipe cards below it carry the detail.
    // Not an extracted @copy site: the message reaches localAsk/remoteDraftPrompt via a variable,
    // so it drifts no baseline. D-29 (`yer`, not `your`) satisfied.
    const msgFor=p=>`${pn(p.idx)}, choose yer recipe:`;
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
      // @copy misc.draftwait.recipechoosing
      netBroadcast(pending.length>1?"⚓ Everyone's choosing their recipe…":`${pn(pending[0].idx)} is choosing a recipe…`);
      const results={};
      const jobs=pending.map(p=>{
        setActor(p.idx);
        if(seatLocal(p.idx))return localAsk(msgFor(p),optsFor(p)).then(i=>{
          results[p.idx]=i;
          // @copy misc.draftwait.recipechosen
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
/* TODAY'S DAY, MOVED VERBATIM. Extracted rather than rewritten so "flag off = the game
   Wyatt has been playing" is a property of the code's shape, not a claim about a conditional.
   The only edit is the ending: what was `ended=…;break;` inside the while-loop is now a return. */
async function runLiveDayClassic(order){
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
          // NARR-01/D-25 (Wyatt-approved 2026-07-29): applied verbatim.
          // @copy misc.introbarrier.finalround
          await netIntroBarrier(`🏁 ${pn(i)} returned to Tortuga and fired up the bakery! Every captain gets ONE final turn to race home! ⛵`,"🦜 Final round — set sail!");
          appState.game.round++;
          appState.game.advanceWind(); // rule 6: the last lap sails under the wind already forecast
          appState.game.ev({t:"newround",dir:appState.game.windNow,streak:appState.game.stormNow?appState.game.stormStreak:0,windStreak:appState.game.noteWind(appState.game.windNow),next:appState.game.forecastWind(),nextStorm:appState.game.stormNext});liveRender(); // NARR-04
          // @copy adhoc.round.finalheader
          await flash(describe(appState.game.events[appState.game.events.length-1]).txt,900);
          if(appState.game.stormNow)await runStormLive(appState.game.windNow); // rule 7, last lap too
          const startPos=order.indexOf(i);
          const lastLap=order.slice(startPos+1).concat(order.slice(0,startPos));
          for(const j of lastLap){
            const q=appState.game.players[j];
            if(q.done)continue;
            await (q.strategy==="human"?humanTurn(q):botTurn(q));
            if(appState.game.checkFinish(q))liveRender();
          }
          // v2.1: the final lap is the likeliest moment for a raid on the bakery (rule 13c), and
          // if it lands the finisher is no longer finished (Game.unfinish). Ending here regardless
          // would crown nobody and stop a voyage still being sailed — so end only if somebody is
          // still home; otherwise break out of this rotation and let the while-loop sail on.
          return appState.game.finishOrder.length>0;
        }
      }
    }
  return false;
}

/* THE BAKE-OFF DAY (v2.1). Three differences from the classic day, all consequences of one rule —
   the bake, not the arrival, is the finish line:
     - a captain at the ovens takes no ordinary turn; their attempt IS the turn
     - arriving lights the ovens and enrols them in THIS day's resolution, so nobody waits a day
       for a first attempt
     - the day resolves after every seat has played, so two captains arriving on the same day get a
       fair race rather than seat order deciding it
   The one-lap final round is gone: the baking days ARE the catch-up window.

   The per-attempt sequence lives in Game.bakeAttempt and NOWHERE ELSE — this driver supplies only
   which promise to await, never what to compute. That is what keeps the live and headless loops
   from drifting, and scripts/bakeoff_parity_test.js asserts it rather than trusting the comment. */
async function runLiveDayBakeoff(order){
  const g=appState.game;
  for(const i of order){
    const p=g.players[i];
    if(p.done||p.baking)continue;
    await (p.strategy==="human"?humanTurn(p):botTurn(p));
    if(g.lightOvens(p)){liveRender();await narrateLastEvent();}
  }
  for(const i of g.bakersToday(order)){
    await bakeTurnLive(g.players[i]);
  }
  liveRender();
  return g.endBakeDay();
}
/* One captain's attempt. The UI half lands in a later step; for now every seat plays with the
   engine's own botGuess, which is exactly what a forfeited human turn will use too. */
async function bakeTurnLive(p){
  const g=appState.game;
  /* SETUP FIRST, ALWAYS. The engine shuffles and computes the bot's guess in one call, in that
     fixed order, so the seeded stream is identical whether a human is about to play or not. Only
     then does the human path get to look at the bench. */
  const {setup,fallback}=g.bakeSetup(p);
  const human=p.strategy==="human";
  // bakeoffPrompt owns replay, the decision log and the shot clock (see its note in flow.js). It is
  // called for a human seat even under replay — that is the whole point, since it is what returns
  // the guess the player ACTUALLY made rather than re-deriving one from the bot.
  const answer=human?await bakeoffPrompt(p,setup,fallback):fallback;
  const out=g.bakeResolve(p,answer);
  if(human&&!appState.replaying)await bakeoffReveal(p,out.res);
  liveRender();
  // narrateLastEvent() reads events[length-1], NOT appState.evIdx — so it narrates whichever event
  // bakeAttempt emitted last: the `finish` on a perfect bake, otherwise the `bake` verdict. Walking
  // evIdx to narrate both was a mistake; that field drives the scrubber, not this.
  await narrateLastEvent();
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
  // G5 (Wyatt-approved 2026-07-30): *"Put the recipe selection step NEXT"* — immediately after the
  // Ahoy intro, before the turn-order intro. The player is told to choose a recipe and then asked
  // to choose one, with nothing in between.
  //
  // ONLY these two awaited calls were swapped. The invariant that made that safe is NOT turn order
  // itself — it is the seeded RNG stream and the decision log, because a host-reload replay must
  // reconstruct an identical game. Verified before swapping:
  //   1. shuffle(order) above consumes game.r() (src/engine/index.js:228).
  //   2. recipeDraftNet consumes game.r() for bot picks and calls logDecision for human picks.
  //   3. showTurnOrderIntro -> netIntroBarrier (src/ui/flow.js:988) consumes NEITHER, and returns
  //      immediately when appState.replaying. Nor do its callees: localAsk, remoteDraftPrompt and
  //      passGate. logDecision lives only inside ask() (:391), which the barrier never calls.
  //   4. recipeDraftNet reads nothing from appState.turnOrder and iterates in SEAT-index order.
  // So r() consumption order (shuffle -> bot recipe picks) and logDecision order are both identical.
  //
  // The silent setup above (:727-734 — shuffle, staggered coins, turnOrder, buildPlayerRows,
  // netSetTurnOrder) was deliberately NOT moved. Nothing is on screen for it, so from a player's
  // point of view it does not sit "between" the two intros at all — and moving it WOULD perturb
  // the RNG stream, which is the one thing this swap must not do.
  await recipeDraftNet();
  await showTurnOrderIntro(order);
  let ended=false;
  while(appState.game.round<150&&!ended){
    appState.game.round++;
    // v2 rule 6: the wind that blows this round was forecast on the compass LAST round, and rule
    // 6d makes that forecast a promise — advanceWind() is the single place it is kept.
    appState.game.advanceWind();
    appState.game.ev({t:"newround",dir:appState.game.windNow,streak:appState.game.stormNow?appState.game.stormStreak:0,windStreak:appState.game.noteWind(appState.game.windNow),next:appState.game.forecastWind(),nextStorm:appState.game.stormNext});liveRender(); // NARR-04
    // wind direction (and any storm) used to be visible only in the captain's log — call it
    // out in the yellow panel too, briefly, so it's not missed
    // @copy adhoc.round.header
    await flash(describe(appState.game.events[appState.game.events.length-1]).txt,900);
    // v2 rule 7: one storm for the whole table, before anybody acts.
    if(appState.game.stormNow)await runStormLive(appState.game.windNow);
    ended=appState.game.cfg.bakeoff?await runLiveDayBakeoff(order):await runLiveDayClassic(order);
  }
  await liveResolveEndNet();
  if(appState.replaying)endReplay();   // whole game was in the log: leave replay mode & paint the result
}
export async function liveResolveEndNet(){
  // same guard as Game.resolveEnd: nobody is crowned without a full recipe (v2.1)
  appState.game.finishOrder=appState.game.eligibleFinishers();
  if(!appState.game.finishOrder.length)appState.game.winner=null;
  else if(appState.game.finishOrder.length===1)appState.game.winner=appState.game.finishOrder[0];
  else{
    // v2 rule 12: every captain who got home collaborates on ONE bakery — a scene, not a contest —
    // and Best Baker goes to whoever brought the most to it. Ranked on crates (all of them, recipe
    // or not), then coins, then who got home first. No flipping: the title is earned across the
    // whole voyage rather than decided by one last coin. bakeRank is the engine's, so the live
    // game and the headless simulator can never crown different winners.
    const ranked=appState.game.finishOrder.slice().sort((x,y)=>appState.game.bakeRank(x,y));
    appState.game.winner=ranked[0];
    appState.game.ev({t:"collab",finishers:ranked.slice(),winner:appState.game.winner,
      crates:ranked.map(i=>appState.game.players[i].ing.length),
      coins:ranked.map(i=>appState.game.players[i].coins)});
    liveRender();
    await narrateLastEvent();
  }
  appState.game.ev({t:"end",winner:appState.game.winner});
  await writeMeta();
  await writeGameLog();
  // WYATT, 2026-07-31 — the drumroll, and why liveDone moved BELOW it.
  //
  // The blue box now plays one last line and then gets out of the way, and the win is revealed in
  // the gold End of Voyage banner (see showStats). `liveDone` is what makes render() call
  // showStats(), so setting it before this await would have revealed the winner FIRST and drum-
  // rolled afterwards — suspense in the wrong order.
  //
  // flash() already waits the normal hold for the line's length before returning, which is exactly
  // the interval he asked for: "when that text has been on screen for the amount of time that it
  // would normally be faded out if there were another message coming after it." fadeOutPanel()
  // then performs the same GHOST_FADE_MS fade a replaced line gets, and hides the box.
  // @copy adhoc.voyageend.drumroll
  await flash("Drumroll...");
  await fadeOutPanel();
  appState.liveDone=true;
  playWinScreen(); // D-05: the host's win-screen cue, tied to the screen appearing — end/finish stay silent as events per D-06
  liveRender();
  // The victory box that used to be flashed here is GONE, deliberately — do not restore it. Its
  // three pieces (the "wins!" line, the recipe picture, the Best Baker sentence) now render in the
  // gold End of Voyage banner via showStats(), which liveRender() has just called. Flashing them
  // here as well would announce the win twice AND re-show the blue box that the drumroll just
  // faded away, which is the exact defeat UI-07 suffered before this change: showStats() hid the
  // box and the very next flash() put it straight back.
  //
  // "Nobody finished" keeps its blue-box line: there is no winner, no recipe and no gold banner
  // content to move, so the drumroll would otherwise fade into an unexplained empty screen.
  if(appState.game.winner==null){
    // @copy adhoc.voyageend.nobodyfinished
    await flash("⏳ Nobody finished the voyage.");
  }else{
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
    // @copy prompt.net.draftrerender
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
  netWatchEvents(appState.db,appState.room,async snap=>{
    // G14 (Wyatt-approved 2026-07-30): the guest half of the trade-wind sweep. THE PUSH AND THE
    // evIdx ASSIGNMENT HAPPEN FIRST, BEFORE ANY await — so a second event arriving mid-sweep cannot
    // reorder the feed. Everything after the await is presentation only.
    appState.game.events.push(fixEv(snap.val()));
    appState.evIdx=appState.game.events.length-1;
    syncLogLines();
    $("scrub").max=Math.max(0,appState.game.events.length-1);
    // ANIMATE BEFORE render(), or the ship has already jumped to its destination and there is
    // nothing left to watch. The same shared stepper the host calls — one function, both tiers, so
    // they cannot be paced or aimed differently (that is what scripts/host_guest_parity_check.js
    // assertion 3 pins). This tier does NOT read rimCellInfo or rimHead itself.
    //
    // KNOWN, ACCEPTED DEGRADATION, stated rather than discovered later: the guest's coin/crate
    // panels lag by the sweep's duration (~95ms per square) because render() now runs after it, and
    // an event arriving mid-sweep harmlessly snaps the ship to its true square on the next paint.
    // Degradation, not breakage.
    await animateRimSweepIfAny();
    render();
    const e=appState.game.events[appState.evIdx];
    spawnPops(e,boardCell()); // notes/edits 11-03: cell now lives in src/ui/board.js
    playForEvent(e); // AUDIO-01/D-07: the guest's mirror of the host's per-event sound moment — rival and bot captains audible here too, no isLocalTo gate
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
          // @copy prompt.net.promptrerender
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
      // @copy prompt.net.promptrerenderbuttons
      panel(`${backHtml}<div class="apMsg">${p.msg}</div><div class="apBtns${grid}">`+
        rest.map(x=>`<button class="apBtn ${cls[x.i]||""}${dis[x.i]?" apDisabled":""}" data-i="${x.i}"${dis[x.i]?" disabled":""}${apBtnStyle(cols[x.i])}>${x.l}</button>`).join("")+`</div>${subHtml}`,true);
      $("actionPanel").querySelectorAll(".apBtn,.apBack").forEach(b=>{if(b.disabled)return;b.onclick=()=>sendResponse(p.id,+b.dataset.i);});
    }else if(p.kind==="pick"){
      appState.inBattlePrompt=false;
      setFlipActive(null);
      // D-35: thread the host-composed message through — remotePickHighlights renders it, never
      // authors its own.
      remotePickHighlights(p.cells||[],p.id,p.msg);
    }
  });
}
export function watchNarr(){
  netWatchNarr(appState.db,appState.room,s=>{const v=s.val();
    // while a battle scoreboard is showing here (as spectator or active combatant), keep it up —
    // the per-flip "X flips HEADS" broadcasts are already reflected in the scoreboard coins, and
    // letting them overwrite the panel made the battle box flicker away between flips (#9)
    // D-10: pickNarrVariant degrades an old payload (no `variants` key at all) to `v.html`
    // exactly as before — a new guest reading an old host's broadcast sees no behavior change.
    if(v&&!appState.spectatingBattle&&!appState.inBattlePrompt)showNarration(pickNarrVariant(v,appState.mySeat));});
}

/* ================= welcome modal ================= */
/* ================= lobby / room ================= */
// WYATT'S WORDING, 2026-07-31, verbatim. Shared by createRoom and joinRoom, the same way the
// capacity line below is shared by both (D-60) — one cause, one sentence, wherever it surfaces.
//
// WHY THIS EXISTS, so nobody merges it back into the capacity line: `appState.db === null` means
// this browser never established a connection at all — offline, an ad-blocker or extension eating
// the request, or the multiplayer script failing to load. That is NOT the server being busy. Until
// today both said "the server's got too many pirates baking right now", which sent a player with
// their wi-fi off away to wait it out, and made a genuine capacity problem and a local one
// indistinguishable in a bug report.
//
// A null db is checked BEFORE the try, not inside the catch, because it is not an exception — it is
// a precondition that is knowable without attempting anything.
const NO_CONNECTION_MSG="Can't reach the Sugar Seas — check yer connection, wifi, and ad blockers, then try again matey.";
export async function createRoom(){
  // @copy misc.mperror.createnoconnection
  if(!appState.db){alert(NO_CONNECTION_MSG);return;}
  const name=requireName(); // FIX-01: the removed welcome-screen field's read, repointed at the chokepoint
  appState.numSeats=4; // online hosted games are always 4 seats — bots fill any unfilled slot
  const code=genCode();
  const seats={0:{name,id:appState.myId,bot:false}};
  for(let i=1;i<appState.numSeats;i++)seats[i]={name:"",id:"",bot:true,strat:seatStrat(i)}; // BOT-02
  appState.room=code;appState.mySeat=0;appState.isHost=true;
  // UI-05 follow-up (Wyatt, 2026-07-31): show the room screen NOW, before the write, so the click
  // has an immediate response.
  //
  // MEASURED, because "glitchy" turned out not to mean what it sounded like: the click handler
  // blocks for 2ms, but the room screen did not appear for 1002ms — a full second in which the
  // player clicked Host and the menu just sat there. Wyatt read that dead time as the old
  // intermediate step "still loading". It was not; it was nothing at all.
  //
  // Before UI-05 this felt fine only by accident: clicking Host flipped to #stepHost instantly (a
  // local display toggle) and the same ~1s network wait then hid behind the "Create the game"
  // button. Removing that screen removed the feedback and left the wait exposed. The fix is to give
  // the feedback back without the extra click — not to restore the screen.
  //
  // Nothing is faked by doing this early: genCode() generated the code LOCALLY a few lines up, so
  // the six characters on screen are the real ones. Only their registration is still in flight. On
  // failure everything is undone and we return to the menu (see the catch).
  showRoom();
  try{
    await netCreateRoom(appState.db,code,{host:appState.myId,status:"lobby",numSeats:appState.numSeats,seats,createdAt:Date.now()});
  }catch(e){
    console.error("createRoom failed",e);appState.room=null;appState.isHost=false;
    showHome(); // undo the optimistic screen — the room does not exist
    // NARR-01/D-25/D-60 (Wyatt-approved 2026-07-29): one line for every multiplayer-service
    // disruption — createRoom's own failure and joinRoom's below share it verbatim (D-60).
    // @copy misc.mperror.createcapacity
    alert("Arrgh, the server's got too many pirates baking right now! Try a Solo game instead?");
    return;
  }
  // showRoom() already ran above, before the write — not repeated here.
  saveSession();watchRoom();
}
// UI-05 follow-up (Wyatt, 2026-07-31): back out of the "share this code with yer crew" screen.
//
// This is NOT leaveGame(). leaveGame() reloads the page and calls clearSoloState(), which would
// destroy an unrelated saved SOLO game just because someone changed their mind about hosting. Here
// nothing has started: no game, no board, no turn order — only a lobby row in the database.
//
// Order matters. Detach the watchers FIRST: watchRoom() is live by now, and deleting the room while
// it is still listening fires the "that game no longer exists" recovery path at the person who
// deliberately left, which is the host telling themselves off.
//
// Only the HOST deletes, and only from the lobby. A guest backing out just stops watching — the
// room is not theirs to remove — and a room that has already started playing is never deleted here,
// because that would strand everyone else at the table.
export async function abandonRoom(){
  const room=appState.room, wasHost=appState.isHost;
  netLeaveRoom();
  // NAME-01 (2026-08-01, measured): netLeaveRoom() tears the room-scoped watchers down, which breaks
  // the invariant _watchRoomAttachedFor stands for ("the seat/status watchers are live for this
  // room"). Left set, a player who leaves and rejoins the SAME room trips D-13's guard, watchRoom()
  // returns before re-attaching netWatchSeats(), and their lobby freezes on the last seat list they
  // saw — the rename they just made lands on every other client but not their own. Clearing it here
  // keeps the guard honest: it must mean "attached", not "was attached once".
  _watchRoomAttachedFor=null;
  if(room&&wasHost){
    try{ await netDeleteRoom(appState.db,room); }
    catch(e){ console.error("abandonRoom: could not delete room",e); } // best effort — leaving still works
  }
  appState.room=null;appState.mySeat=null;appState.isHost=false;appState.roster=[];
  clearSession();
  showHome();
}
// unusedDefaultName() counts EVERY seat in the map as taking a name, including the one being
// claimed — so a player re-resolving their own seat would see their own old name as taken and drift
// to a different default each pass. Hiding the seat under claim from the tally makes `preferIdx`
// reliably return that seat's own captain, which is both stable and collision-free. Shared by
// joinRoom() and renameMySeat().
const withoutSeat=(s,i)=>{const o={};Object.keys(s||{}).forEach(k=>{if(+k!==i)o[k]=s[k];});return o;};
// NAME-02 (Wyatt, 2026-08-01): "the player may just want to change their name." Rewrites this
// player's OWN seat in place, so renaming never costs them the room. Deliberately narrow — it
// touches one seat, only its owner's, and only in the lobby: once the voyage is under way narration
// has already gone out under the old name, and renaming would desync the roster against events
// guests have already been shown (the same guard joinRoom's rejoin path uses).
export async function renameMySeat(newName){
  if(!appState.db||!appState.room||appState.mySeat==null||appState.gameStarted)return;
  const seat=appState.mySeat;
  const auto=pendingAutoName();
  const chosen=(auto&&newName===auto)?"":newName;
  try{
    await netClaimSeat(appState.db,appState.room,s=>{
      if(!s)return s;
      const cur=s[seat]||{};
      if(cur.id!==appState.myId)return s; // not mine any more — never stomp another captain's seat
      s[seat]={...cur,name:chosen||unusedDefaultName(withoutSeat(s,seat),seat),id:appState.myId,bot:false};
      return s;
    });
  }catch(e){
    console.error("renameMySeat failed",e);
    // @copy misc.mperror.renamefailed
    alert("Couldn't change yer name just now — the seas are choppy. Try again in a moment.");
  }
  // no re-render here: netWatchSeats() is already live for this room and repaints every client,
  // this one included, the moment the write lands.
}
export async function joinRoom(){
  const typedName=($("joinName").value||"").trim().slice(0,40);
  const code=($("joinCode").value||"").toUpperCase().trim();
  // @copy misc.mperror.entercode
  if(code.length<4){alert("Enter the room code yer host shared.");return;}
  // same precondition as createRoom — a null handle is "we never connected", not "the server is busy".
  // Two ids for one shared sentence, exactly as createcapacity/joincapacity already do it: the id
  // names the SITE so a review mark can follow it across a source move, the constant keeps the words
  // identical so the two can never drift apart.
  // @copy misc.mperror.joinnoconnection
  if(!appState.db){alert(NO_CONNECTION_MSG);return;}
  let snap;
  try{snap=await netReadRoom(appState.db,code);}
  // @copy misc.mperror.joincapacity
  catch(e){console.error("joinRoom failed",e);alert("Arrgh, the server's got too many pirates baking right now! Try a Solo game instead?");return;}
  // @copy misc.mperror.nogamefound
  if(!snap.exists()){alert(`Arrgh, no game found with code ${code}. Try typin' again.`);return;}
  const r=snap.val();
  const seats=r.seats||{};
  // NAME-01 (2026-08-01): a name the player was OFFERED is not one they chose. #joinName is prefilled
  // from the modal and stays editable, so "unchosen" means the field still holds the exact string we
  // put there; any edit — even retyping the same letters — counts as a choice and is honoured
  // verbatim. An unchosen name goes in blank so the collision-safe fallback below actually runs.
  // Before this, every fresh player confirmed the same prefilled "Davy Scones", which was truthy and
  // therefore skipped that fallback entirely — two captains, one name.
  const auto=pendingAutoName();
  const chosen=(auto&&typedName===auto)?"":typedName;
  let mine=null;
  for(let i=0;i<r.numSeats;i++)if(seats[i]&&seats[i].id===appState.myId)mine=i;
  if(mine!=null){
    // NAME-01/C: a seat keyed to this pp_id OUTLIVES leaving the room — abandonRoom() calls
    // netLeaveRoom(), which only detaches watchers (src/net/index.js) and never releases the record.
    // So "back out, come back with a different name" used to reuse the stale record verbatim and
    // silently discard what was just typed. Measured: guest joins as ALPHA, backs out via the room
    // screen's "← back", rejoins typing BRAVO — both clients still showed ALPHA.
    //
    // Write the name on the way back in, but ONLY while the room is still in the lobby. A rejoin
    // into a voyage already under way must keep the seat's existing name: narration has already gone
    // out under it, and renaming mid-game would desync the roster against events guests have shown.
    if(r.status==="lobby"){
      await netClaimSeat(appState.db,code,s=>{
        if(!s)return s;
        const cur=s[mine]||{};
        if(cur.id!==appState.myId)return s; // someone else holds it now — never stomp their seat
        s[mine]={...cur,name:chosen||unusedDefaultName(withoutSeat(s,mine),mine),id:appState.myId,bot:false};
        return s;
      });
    }
    appState.room=code;appState.mySeat=mine;appState.isHost=(r.host===appState.myId);saveSession();watchRoom();return;
  }
  // @copy misc.mperror.alreadysailed
  if(r.status!=="lobby"){alert("⛵ That game has already set sail! Tell yer mateys and they may restart to come back for ye.");return;}
  let claimed=null;
  await netClaimSeat(appState.db,code,s=>{
    if(!s)return s;
    for(let i=0;i<r.numSeats;i++){const cur=s[i]||{};if(!cur.id){
      // #2: blank name → an unused default captain name computed against the live seat map, so a
      // late joiner never duplicates a name already in the room.
      s[i]={name:chosen||unusedDefaultName(withoutSeat(s,i),i),id:appState.myId,bot:false};claimed=i;return s;}}
    return s;
  });
  // @copy misc.mperror.roomfull
  if(claimed==null){alert("Too many pirates already in that game.");return;}
  appState.room=code;appState.mySeat=claimed;appState.isHost=(r.host===appState.myId);saveSession();watchRoom();
}
// D-13: module-scope guard so a repeated watchRoom() call for the SAME room (a normal guest-join
// lifecycle invokes this more than once) does not re-attach netWatchSeats()/netWatchStatus() and
// trip src/net/registry.js's "duplicate attach refused" ERROR — see this file's own header note.
let _watchRoomAttachedFor=null;
export async function watchRoom(){
  const r0=(await netReadRoom(appState.db,appState.room)).val();
  // @copy misc.mperror.gamegone
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
    // @copy misc.mperror.serviceunreachable
    alert("Couldn't reach the multiplayer service — it may be at capacity right now. Try again in a moment.");
  }
}
export function beginGame(cfg,seed){
  if(appState.gameStarted)return;appState.gameStarted=true;
  showGameView();
  appState.game=new Game(cfg,seed,true);
  // Hand the engine the two plain numbers it needs to resume this device's captain mid-list (see
  // Game.nextSeaCreature). Set here rather than inside roundCfg because the cursor is a UI-tier
  // concern — the engine tier may not read localStorage (D-03) — and because roundCfg is also
  // rebuilt from scratch on a resume, where the base must come from the SAVE, not from storage.
  appState.game.seaSeat=appState.mySeat;
  appState.game.seaBase=(appState.soloMeta&&appState.soloMeta.seaBase)||0;
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
  watchPause(); // CLOCK-02: every client tracks the shared whole-game pause flag
  // D-19 (phase 21): this used to be read ONLY inside the isHost&&db&&room branch below, which
  // never runs in solo or pass-and-play — so appState.timerOff silently kept its `false` default
  // there and a player who switched the timer off last game got it back on every new game. Read
  // unconditionally, in every mode, before that branch — guarded by !appState.replaying so a
  // reload-replay keeps whatever the live game already had, exactly like the dlog reset above.
  // P8 (Wyatt, 2026-08-01: "i turned the timer off, refreshed the page, and the timer was turned
  // on"). D-19 above fixed the fresh-game case; a RELOAD still lost it, because a solo/pass-and-play
  // reload resumes through replay, `appState.replaying` is true, and this read was skipped — so
  // appState.timerOff fell back to its `false` default in src/state/index.js.
  //
  // pp_timerOff is a PER-DEVICE preference, not game state (see src/ui/util.js's note that it is
  // structurally excluded from the versioned-blob mechanism, and never cleared) — confirmed by
  // Wyatt 2026-08-01: "per-device in local storage". So on replay it should still be honoured.
  // The !replaying guard is kept ONLY for networked games, where the room's shared flag is the
  // authority and watchTimer() delivers it; overriding that from one device's localStorage mid-
  // replay is what the original guard was protecting against.
  if(!appState.replaying||!(appState.db&&appState.room)){
    try{appState.timerOff=localStorage.getItem("pp_timerOff")==="1";}catch(e){}
  }
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
// AUDIO-01: the one-shot AudioContext unlock. A document-level, capture-any-gesture listener is
// chosen over binding one specific button deliberately — it survives future welcome-screen
// changes and never has to know that #flipCoinWrap is not an .apBtn (docs/DRIVING-THE-GAME.md
// §4a). Fire-and-forget with a .catch() (T-21-04) — never awaited here, and never called from
// playFlip()/any per-play path: unlock is a once-per-page-session concern, not a per-play one.
function unlockAudioOnce(){
  initAudio().catch(()=>{});
  document.removeEventListener("pointerdown",unlockAudioOnce);
  document.removeEventListener("keydown",unlockAudioOnce);
}
export function wireLobby(){
  document.addEventListener("pointerdown",unlockAudioOnce,{once:true});
  document.addEventListener("keydown",unlockAudioOnce,{once:true});
  $("btnCreate").onclick=()=>{createRoom();};
  $("btnJoin").onclick=()=>{joinRoom();};
  $("btnStart").onclick=()=>{$("startConfirmModal").style.display="flex";};
  $("btnCancelStart").onclick=()=>{$("startConfirmModal").style.display="none";};
  $("btnConfirmStart").onclick=()=>{$("startConfirmModal").style.display="none";startGame();};
  wireRestoreFail();
  $("btnRoomBack").onclick=()=>{abandonRoom();}; // UI-05 follow-up: leave the lobby, tear the room down
  // NAME-02: same modal as every other name entry, so there is one place a captain is named. The
  // continuation writes the seat instead of starting a mode; dismissing it cancels and changes
  // nothing, which is what a ✕ should do here too.
  //
  // DELEGATED, not bound to the button: renderSeatList() rebuilds #seatList's innerHTML on every
  // seats update, so a handler attached to the button itself would be discarded the first time
  // anyone joined — and this button lives inside the reader's own seat row precisely so it is
  // rebuilt with it. Binding the container survives every re-render.
  $("seatList").onclick=e=>{
    if(e.target.closest("#btnChangeName"))openNameModal(name=>{renameMySeat(name);});
  };
  $("btnLeave").onclick=()=>{$("leaveConfirmModal").style.display="flex";};
  $("btnCancelLeave").onclick=()=>{$("leaveConfirmModal").style.display="none";};
  $("btnConfirmLeave").onclick=()=>{$("leaveConfirmModal").style.display="none";leaveGame();};
  $("btnPlayAgain").onclick=leaveGame;
  $("scPause").onclick=togglePause;
  $("scTimerToggle").onclick=toggleTimer;
  $("btnMute").onclick=toggleMute;
  $("btnShowLog").onclick=()=>{$("logModal").style.display="flex";const box=$("log");box.scrollTop=box.scrollHeight;};
  $("btnShowHow").onclick=()=>{$("howToPlayModal").style.display="flex";};
  $("btnShowCredits").onclick=()=>{$("creditsModal").style.display="flex";};
  // KOFI-01: two doors onto one embedded panel — footer, and the Credits modal.
  $("btnKofi").onclick=openKofi;
  $("btnKofiCredits").onclick=()=>{$("creditsModal").style.display="none";openKofi();};
  $("btnShowFeedback").onclick=()=>{$("feedbackModal").style.display="flex";};
  // #2: in-game modals get a top-right ✕ and close on outside-click (the bottom "Close" buttons
  // were removed). Pre-game/blocking modals (lobby, pass-device, room, start/leave confirms) are
  // deliberately NOT dismissible this way — they gate the game and must be answered.
  ["howToPlayModal","creditsModal","logModal","feedbackModal","recipeModal","kofiModal"].forEach(id=>{
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
    // FIX-01: getLastName() (raw persisted read), NOT requireName() — a player who has never named
    // themself must keep writing name:null to this record. requireName() would substitute a
    // default captain name and silently change what gets attributed to Firebase.
    if(appState.db)netSetFeedback(appState.db,Date.now(),{text,room:appState.room||null,name:getLastName().trim()||null,t:Date.now()},e=>console.error("feedback write failed",e));
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
  // @copy prompt.net.reconnecting
  panel('<div class="apMsg">⚓ Reconnecting to yer voyage…</div>');
  appState.replaying=true;
  beginGame(r.cfg,r.seed);
}

export function boot(){
  appState.myId=getMyId();
  // LOAD-03b — DECIDE THE DESTINATION BEFORE PAINTING ANYTHING.
  //
  // Wyatt's intent, 2026-08-02, stated as two journeys: "i need players who are visiting the site
  // without being in the middle of a game to load a beautiful homescreen fast. I need players who
  // are visiting the site in the middle of a game (eg. because of a refresh) to see their game and
  // not worry that it got interrupted."
  //
  // Both reads below are SYNCHRONOUS localStorage lookups, so "am I resuming?" is knowable before
  // a single pixel is committed. The async netReadRoom() further down only confirms the room still
  // EXISTS — it is not what decides the journey. That distinction is the whole fix.
  //
  // What this replaces: the boot loader used to hide on an art-download timer, and showHome() ran
  // UNCONDITIONALLY. So a first-timer waited behind the loader for ~7.7MB of board art the welcome
  // screen no longer even shows, and a mid-game refresher could watch the loader fade onto the
  // WELCOME SCREEN — art finishing before the async room read — with their voyage arriving a beat
  // later. That flash is the "did my game get lost?" moment, and it was reachable, not theoretical.
  let sess=null;try{sess=JSON.parse(localStorage.getItem("pp_sess"));}catch(e){}
  // CLOCK-01: a blob with no v field (pre-refactor build) or a mismatched v (stale schema) is
  // treated as absent — cleared via the existing clearSession(), never partially trusted — so a
  // returning old-version player starts clean instead of stalling on an invalid resume attempt
  // (D-01/D-02). A current-version blob's v always matches and is never touched here.
  if(sess&&sess.v!==SESSION_SCHEMA_V){clearSession();sess=null;}
  // Mirror guard, solo side (same D-01/D-02 reasoning). Hoisted from the branch below so the
  // journey is decided up front; the schema guards themselves are unchanged.
  let solo=null;try{solo=JSON.parse(localStorage.getItem("pp_solo"));}catch(e){}
  if(solo&&solo.v!==SOLO_SCHEMA_V){clearSoloState();solo=null;}
  const resumingRoom=!!(sess&&sess.room);
  // ...only when there is no multiplayer session to reconnect to, exactly as the old nesting had it.
  const resumingSolo=!resumingRoom&&!!(solo&&solo.seed!=null&&solo.strategies);
  const resuming=resumingRoom||resumingSolo;
  seedIdleGameState(); // holds up the "appState.game always exists" invariant; draws nothing
  wireWelcome();
  wireRecipeModal(); // wired unconditionally (not inside wireLobby) so it works in solo/offline play too
  // MUTE-01: unconditional, like the wiring above — BOTH journeys need it. A mid-game refresh goes
  // straight to showGameView() without passing the fresh-visit branch, and it is the journey most
  // likely to land on a phone. Idempotent: it installs one ResizeObserver and no more.
  watchMutePlacement();
  wireLobby(); // wired unconditionally, before any early-return resume path (solo or offline), so
  // footer/pause buttons are never left unwired — previously this ran after the Firebase-init
  // check below, which the solo-resume branch's early `return` skipped entirely, leaving every
  // footer button and the pause button dead for the rest of a resumed solo game
  //
  // Firebase is initialised BEFORE any early return below, and the two cards are gated on the
  // result immediately. Previously this whole block sat AFTER the solo-resume return, so a player
  // resuming an interrupted solo game got `appState.db === null` while showHome() (above) had
  // already put the welcome screen up with Host and Join still ENABLED. Clicking Host then reached
  // createRoom() with a null handle, and its catch fired the capacity line — "the server's got too
  // many pirates baking right now" — which was untrue, and is the very sentence a REAL capacity
  // failure uses (D-60 shares it deliberately), so the two were indistinguishable to a player and
  // in any bug report. It also blocks the renderer, because it is a native alert(), which is why it
  // presented as a frozen tab rather than a failed call.
  //
  // NOTE the ordering constraint this must not break, and which the old comment here recorded:
  // **an offline refresh mid-solo-game still has to resume.** So the failure branch no longer
  // returns on the spot — it marks the UI and falls through, and the `return` for "no Firebase and
  // nothing to resume" happens after the solo check instead. Moving fbInit() up is safe because
  // netInit() is total: it returns null for a missing config and swallows its own init throw
  // (src/net/index.js), so it can never break a boot that previously never called it.
  const fbOk=fbInit();
  if(!fbOk){
    // v2 always lands here — there is no Firebase SDK on the page at all. The elements these
    // lines marked up no longer exist, so each is guarded; the branch itself is kept because
    // ui_contract_check.js's BOOT-FBINIT-OFFLINE assertion forbids restructuring the path
    // between here and resumeSoloGame(), and because an offline refresh mid-solo-game still has
    // to resume through exactly this route.
    const hostCard=$("choiceHost");if(hostCard)hostCard.classList.add("disabled");
    const joinCard=$("choiceJoin");if(joinCard)joinCard.classList.add("disabled");
    const note=$("fbnote");if(note)note.style.display="";
  }

  // if/else rather than an early return, deliberately: ui_contract_check.js's BOOT-FBINIT-OFFLINE
  // assertion forbids ANY `return` between the !fbOk branch and resumeSoloGame(solo), because that
  // is how an offline refresh mid-solo-game once stopped resuming. The early return this replaced
  // sat on the not-resuming path and could not have caused that — but the assertion is a textual
  // proxy for a real invariant, and the right move is to satisfy it structurally rather than loosen
  // a gate that is doing its job.
  if(!resuming){
    // JOURNEY 1 — NOBODY'S GAME IS WAITING: paint the home screen NOW.
    // It needs the card's own CSS, the logo, and one 71KB backdrop still. The ~7.7MB of board art
    // belongs to a game this player has not started, so it is fetched WITHOUT being awaited and
    // lands while they read the byline and pick a mode. showHome() lifts the boot loader itself.
    showHome();
    syncBoardSizing();
    preloadAssets(); // deliberately not awaited — nothing on this screen is waiting for it
  }else{
  // JOURNEY 2 — THIS PLAYER IS MID-VOYAGE: never show them the welcome screen. Seeing it is the
  // moment a refresh feels like a lost game, so the boot loader stays up and the next thing they
  // see is their own board. The loader is lifted by showGameView()/showRoom()/showHome(), whichever
  // the resume actually lands on, so it can never outlive the thing it is covering.
  //
  // The art IS awaited here, capped at 6s (offline, dead CDN, slow phone) — a hung loader would be
  // worse than the pop-in it prevents. This is the one journey where waiting is right: the board is
  // about to be drawn, and a voyage that reassembles island-by-island reads as damaged.
  // The loader's default reads "Hoisting the sails…", which is a NEW-game promise and the wrong
  // thing to tell someone whose voyage is already under way. This wording deliberately echoes the
  // approved reconnecting line resumeHostGame() panels a moment later (@copy prompt.net.reconnecting,
  // "⚓ Reconnecting to yer voyage…") so the two read as one continuous reassurance.
  //
  // No @copy id: the extractor scans call sites, not textContent assignments, so a marker here
  // binds to nothing and the audit gate rejects it. The loader's own default string is unregistered
  // for the same reason — boot-loader copy sits outside the audit by precedent, not by oversight.
  const bootMsg=document.querySelector("#bootLoader .bootMsg");
  if(bootMsg)bootMsg.textContent="Reconnecting to yer voyage…";
  Promise.race([preloadAssets(),new Promise(r=>setTimeout(r,6000))]).then(()=>{
    // Solo first and BEFORE the Firebase gate — the ordering constraint the comment above records:
    // an offline refresh mid-solo-game still has to resume. resumingSolo is already false whenever
    // a multiplayer session exists, so this cannot steal a room reconnect.
    if(resumingSolo){resumeSoloGame(solo);return;}
    // A room to rejoin but no Firebase to rejoin it with: there is nothing to restore, so fall back
    // to the home screen rather than leaving them under a loader forever.
    if(!fbOk){showHome();return;}
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
  });
  }
}
