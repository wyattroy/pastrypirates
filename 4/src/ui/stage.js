// src/ui/stage.js — the /4 stage: full-bleed board, camera director, wind pill, ribbon,
// bottom sheet, ship-attached narration bubbles, and the flip ceremony.
//
// Design contract (Wyatt, 2026-08-11, 16 answers before build):
//   - Bubbles from day one: no narration box. Captain lines attach to their ship; table lines
//     hover over the water. Auto-advance on the existing hold curve, tap to hurry.
//   - Full director: sail prompts frame the WHOLE sail window (never crop a legal move, zoom
//     capped), the camera glides to whoever is speaking, storms pull back to the full board.
//     Pinch/pan/double-tap override the director until the player's next sail prompt.
//   - Wind pill: one compact semi-transparent overlay, fixed spot — "WIND NOW: E→ FORECAST: S↓";
//     a coming storm shows ⛈ with a slowly turning, never-settling arrow (the approved chip
//     treatment, carried over). The old on-board chip is hidden; the compass dial stays as art.
//   - Solo clock off by default (toggle still present in the sheet's controls row).
//   - Flip ceremony: the flippenator takes the screen when armed.
// Everything here is render-side. The engine, its RNG, and the dlog are never touched.
"use strict";
import { appState } from "../state/index.js";
import { boardShipEls } from "./board.js";
import { msgHoldMs } from "./util.js";
import { typewriterReveal } from "./panel.js";
import { HEXCOL, emojify } from "../shared/index.js";

const $ = id => document.getElementById(id);
const AR = { N: "↑", S: "↓", E: "→", W: "←" };
// Bumped on every /4 deploy. Shown in the ☰ menu so a playtest screenshot proves which build it
// came from — two stall reports have now turned out to be photos of code that was already fixed,
// and Safari's module cache makes "refresh" an unreliable way to get the new build.
const PP4_STAMP = "2026-08-12c";

const S = {
  active: false,            // stage layout applied (solo game on screen)
  cam: { x: 0, y: 0, w: 640, tx: 0, ty: 0, tw: 640 },
  lock: false,              // a player gesture holds the camera until the next sail prompt
  subject: null,            // seat index the next flash() line is about (stashed by panel.js)
  evType: null,
  hurry: null,              // resolver for tap-to-hurry on the live bubble
  bubPlace: null,           // live bubble's positioner — run every tick, same loop as the camera
  raf: 0,
  lastPill: "",
};

/* ================= camera ================= */
function svgEl(){ return $("board"); }
function grid(){ const g = appState.game; return g ? g.cfg.grid : 15; }
function cellPx(){ return 640 / grid(); }

function camTo(x, y, w, immediate){
  S.cam.tx = Math.max(0, Math.min(640 - w, x));
  S.cam.ty = Math.max(0, Math.min(640 - w, y));
  S.cam.tw = Math.min(640, w);
  if (immediate){ S.cam.x = S.cam.tx; S.cam.y = S.cam.ty; S.cam.w = S.cam.tw; S.tween = null; wake(); return; }
  // Wyatt, playtest 3: the glide was a jerky exponential chase — S-curve it, ~300ms longer.
  S.tween = { fx: S.cam.x, fy: S.cam.y, fw: S.cam.w, t0: performance.now(), dur: 650 };
  wake();   // the slow-gear heartbeat must never pace a glide
}
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function camFull(){ camTo(0, 0, 640); }
function camToCell(c, zoom){
  const w = 640 / (zoom || 1.9);
  camTo((c[0] + 0.5) * cellPx() - w / 2, (c[1] + 0.5) * cellPx() - w / 2, w);
}
function camToSeat(i){
  const g = appState.game; if (!g || !g.players[i]) return;
  camToCell(g.players[i].pos, 1.9);
}
// frame the whole sail window: bbox of every highlighted cell + my ship, padded; zoom is
// whatever that window allows, capped at 2.2x — a legal move is never off screen.
function camFitSail(){
  S.lock = false;                                    // a new turn releases any gesture hold
  const g = appState.game; if (!g) return;
  const me = g.players[appState.mySeat ?? 0]; if (!me) return;
  const cp = cellPx();
  const cells = [...document.querySelectorAll(".sailCell")].map(r => {
    const sd = parseFloat(r.getAttribute("width")), px = (sd / 0.9) + 4, ins = (px - sd) / 2;
    return [Math.round((parseFloat(r.getAttribute("x")) - ins) / px),
            Math.round((parseFloat(r.getAttribute("y")) - ins) / px)];
  });
  cells.push(me.pos);
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  cells.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
  const PAD = 1.2;
  const bw = (x1 - x0 + 1 + 2 * PAD) * cp, bh = (y1 - y0 + 1 + 2 * PAD) * cp;
  let side = Math.max(bw, bh);
  side = Math.max(side, 640 / 2.2);
  side = Math.min(side, 640);
  camTo((x0 - PAD) * cp + bw / 2 - side / 2, (y0 - PAD) * cp + bh / 2 - side / 2, side);
}
// user SVG units -> screen px under the current camera ('meet' fit inside the wrap)
function toScreen(ux, uy){
  const svg = svgEl(); if (!svg) return [0, 0];
  const br = svg.getBoundingClientRect();
  const sc = br.width / S.cam.w;
  return [(ux - S.cam.x) * sc + br.left, (uy - (S.vy ?? S.cam.y)) * sc + br.top];
}
function boatUXY(i){
  const els = boardShipEls();
  const el = els && els[i]; if (!el) return null;
  const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform);
  return m ? [parseFloat(m[1]), parseFloat(m[2])] : null;
}

// playtest 11 (iPhone 13 mini running HOT): the tick loop used to lay out and write the DOM
// every frame even with a parked camera — rect reads, viewBox writes and transform writes at
// 60fps, forever. Layout inputs are now cached (refreshed ~2x/second and on resize), and every
// write is skipped when the value hasn't changed, so an idle stage costs almost nothing.
let ribHCache = 48, ribHAt = -1e9, lastVB = "", lastRipT = "";
addEventListener("resize", () => { ribHAt = -1e9; lastVB = ""; });
function camFrame(){
  const c = S.cam;
  if (S.tween){
    const t = Math.min(1, (performance.now() - S.tween.t0) / S.tween.dur);
    const e = easeInOutCubic(t);
    c.x = S.tween.fx + (c.tx - S.tween.fx) * e;
    c.y = S.tween.fy + (c.ty - S.tween.fy) * e;
    c.w = S.tween.fw + (c.tw - S.tween.fw) * e;
    if (t >= 1) S.tween = null;
  } else { c.x = c.tx; c.y = c.ty; c.w = c.tw; }
  const svg = svgEl(); if (!svg || !S.active) return;
  // playtest 4: the stage strip runs from the BOTTOM of the ribbon (the board's top row must
  // never hide under DAY + the captain circles) down to the captains box, which is always
  // visible. When the zoomed-out board leaves blank water, the captains box rises to meet it.
  const wrap = $("boardwrap"), cap = $("pp4Cap");
  const rib = $("pp4Ribbon");
  if (performance.now() - ribHAt > 500){
    ribHCache = rib ? Math.ceil(rib.getBoundingClientRect().bottom) : 48;
    ribHAt = performance.now();
  }
  const ribH = ribHCache;
  const CAP_BASE = Math.min(250, Math.round(innerHeight * 0.30));
  const availH = Math.max(200, innerHeight - ribH - CAP_BASE);
  if (wrap){
    if (Math.abs((parseFloat(wrap.style.top) || 0) - ribH) > 1) wrap.style.top = ribH + "px";
    if (Math.abs((parseFloat(wrap.style.height) || 0) - availH) > 2) wrap.style.height = availH + "px";
  }
  const aspect = availH / innerWidth;
  let h = c.w * aspect;
  if (h > 640) h = 640;                       // whole board fits vertically; width stays filled
  const cy = c.y + c.w / 2;                   // keep the camera centre
  let vy = cy - h / 2;
  vy = Math.max(0, Math.min(640 - h, vy));
  S.vh = h; S.vy = vy;
  // rendered board bottom (meet, width-limited when h is clamped): captains rise to meet it
  if (cap){
    const scale = innerWidth / c.w;
    const boardBottom = ribH + Math.min(availH, h * scale);
    const top = Math.round(Math.min(ribH + availH, boardBottom));
    if (Math.abs((parseFloat(cap.style.top) || 0) - top) > 1) cap.style.top = top + "px";
  }
  const vb = `${c.x} ${vy} ${c.w} ${h}`;
  if (vb !== lastVB){
    lastVB = vb;
    svg.setAttribute("viewBox", vb);
    // the boats live in their OWN svg overlay (#boardShips, same 640 space) — give it the same
    // camera, or the ships stay parked on the full-board layout while the water zooms away
    // beneath them (Wyatt, playtest 2).
    const ships = $("boardShips");
    if (ships) ships.setAttribute("viewBox", vb);
    // the sonar rings are an HTML layer mapped to the full board — compose the camera in as a
    // transform: rendered = scale(640/w) then translate(-v * W/640)
    const rip = $("rippleHost");
    if (rip){
      const W = innerWidth, s2 = 640 / c.w;
      const t = `scale(${s2}) translate(${-(c.x / 640) * W}px, ${-(vy / 640) * W}px)`;
      if (t !== lastRipT){ lastRipT = t; rip.style.transformOrigin = "0 0"; rip.style.transform = t; }
    }
  }
}

/* ================= gestures ================= */
const ptrs = new Map();
let pinch0 = null, panLast = null, lastTap = 0, moved = false;
function gestures(wrap){
  // playtest 4: pinching out over the board triggered Safari's tab-overview gesture. The board
  // owns its touches: no browser pan/zoom on this surface, and multi-touch never reaches Safari.
  wrap.style.touchAction = "none";
  wrap.addEventListener("touchmove", e => { if (S.active) e.preventDefault(); }, { passive: false });
  wrap.addEventListener("gesturestart", e => { if (S.active) e.preventDefault(); });
  wrap.addEventListener("gesturechange", e => { if (S.active) e.preventDefault(); });
  wrap.addEventListener("pointerdown", e => {
    wake();   // a finger is on the sea — full frame rate for the pan/pinch that may follow
    // playtest 5, hold-to-peek: while a finger is on the sea, the floating prompt steps aside
    // so the board behind it can be read; lifting the finger brings it back.
    const pr = $("pp4Prompt");
    if (pr && getComputedStyle(pr).display !== "none") document.body.classList.add("pp4Peek");
    ptrs.set(e.pointerId, [e.clientX, e.clientY]); moved = false;
    if (ptrs.size === 2){ const p = [...ptrs.values()]; pinch0 = { d: Math.hypot(p[0][0]-p[1][0], p[0][1]-p[1][1]), w: S.cam.tw }; }
    else panLast = [e.clientX, e.clientY];
  });
  wrap.addEventListener("pointermove", e => {
    if (!ptrs.has(e.pointerId)) return;
    ptrs.set(e.pointerId, [e.clientX, e.clientY]);
    const svg = svgEl(); if (!svg) return;
    const br = svg.getBoundingClientRect();
    const sc = S.cam.w / Math.min(br.width, br.height);
    if (ptrs.size === 2 && pinch0){
      const p = [...ptrs.values()];
      const d = Math.hypot(p[0][0]-p[1][0], p[0][1]-p[1][1]);
      if (Math.abs(d - pinch0.d) > 6){ moved = true; S.lock = true;
        const w = Math.max(640/2.6, Math.min(640, pinch0.w * pinch0.d / d));
        const cx = S.cam.tx + S.cam.tw/2, cy = S.cam.ty + S.cam.tw/2;
        camTo(cx - w/2, cy - w/2, w, true); }
    } else if (ptrs.size === 1 && panLast){
      const dx = e.clientX - panLast[0], dy = e.clientY - panLast[1];
      if (Math.hypot(dx, dy) > 7){ moved = true; S.lock = true;
        panLast = [e.clientX, e.clientY];
        camTo(S.cam.tx - dx * sc, S.cam.ty - dy * sc, S.cam.tw, true); }
    }
  });
  const up = e => {
    if (ptrs.size <= 1) setTimeout(() => document.body.classList.remove("pp4Peek"), 140);
    ptrs.delete(e.pointerId); pinch0 = null;
    if (ptrs.size === 0 && !moved){
      const now = Date.now();
      if (now - lastTap < 300){                      // double-tap: fit-board <-> zoom on my ship
        S.lock = true;
        if (S.cam.tw > 500){ const g = appState.game, me = g && g.players[appState.mySeat ?? 0];
          if (me) camToCell(me.pos, 2.0); } else camFull();
        lastTap = 0;
      } else lastTap = now;
      // playtest 11: during YOUR sail prompt, tapping your own boat offers "stay put" with a
      // confirmation right where you tapped — the radial Stay put circle stays as the other door
      if (document.querySelector(".sailCell")){
        const u = boatUXY(appState.mySeat ?? 0);
        if (u){
          const [bx, by] = toScreen(u[0], u[1]);
          if (Math.hypot(e.clientX - bx, e.clientY - by) < 34){ stayConfirm(bx, by); }
        }
      }
      if (S.hurry) S.hurry();                        // any tap hurries the live bubble
    }
  };
  wrap.addEventListener("pointerup", up); wrap.addEventListener("pointercancel", up);
}

// playtest 11: the tap-your-own-ship stay-put confirmation. "Aye" presses the sail prompt's own
// Stay put button (the ONE .apBtn a sail prompt has), so the decision flows through pickCell
// exactly as if the circle had been tapped — this UI never resolves anything itself.
function stayConfirm(bx, by){
  document.querySelector(".pp4Stay")?.remove();
  const stayBtn = [...document.querySelectorAll("#actionPanel .apBtn")].find(b => !b.disabled);
  if (!stayBtn) return;
  const box = document.createElement("div");
  box.className = "pp4Stay";
  box.innerHTML = `<button class="aye" type="button">⚓ Aye,<br>stay put</button><button type="button">↩ Keep<br>sailin'</button>`;
  document.body.appendChild(box);
  const W = 130, left = Math.min(Math.max(bx - W / 2, 8), innerWidth - W - 8);
  box.style.left = left + "px";
  box.style.top = Math.max(54, by + 44) + "px";
  const [aye, nay] = box.querySelectorAll("button");
  aye.onclick = () => { box.remove(); stayBtn.click(); };
  nay.onclick = () => box.remove();
  // the confirm dies with the prompt (a sail was picked, or the turn moved on)
  const iv = setInterval(() => {
    if (!document.querySelector(".sailCell") || !document.body.contains(box)){ clearInterval(iv); box.remove(); }
  }, 300);
}

/* ================= wind pill ================= */
function pillHTML(){
  const g = appState.game; if (!g || !g.windNow || !AR[g.windNow]) return "";
  const now = g.windNow, fc = g.forecastWind();
  const nowS = `WIND NOW: ${now}${AR[now]}`;
  const fcS = g.stormNext
    ? ` · FORECAST: ⛈<span class="pp4Spin">↑</span>`
    : (fc ? ` · FORECAST: ${fc}${AR[fc] || ""}` : "");
  return nowS + fcS;
}
function pillTick(){
  const p = $("pp4Pill"); if (!p) return;
  const h = pillHTML();
  if (h !== S.lastPill){ p.innerHTML = h; S.lastPill = h; }
  // statsWrap's visibility is toggled via its inline style — read that, never getComputedStyle
  // (which forces style recalc and was running every frame; see the HOT-PHONE note above)
  const sw = $("statsWrap");
  const want = (!h || (sw && sw.style.display !== "none")) ? "none" : "";
  if (p.style.display !== want) p.style.display = want;
}

/* ================= ribbon ================= */
function ribbonTick(){
  const r = $("pp4Round"), g = appState.game;
  if (r && g) r.textContent = "DAY " + (g.round || 1);
  const boats = document.querySelectorAll("#pp4Ribbon .pp4Boat");
  const act = (S.activeSeat != null) ? S.activeSeat : (appState.curSeat ?? -1);
  // playtest 15 item 1: the circles read LEFT TO RIGHT in the drawn TURN ORDER, not seat order
  const ord = appState.turnOrder;
  boats.forEach((b, i) => {
    b.classList.toggle("on", i === act);
    const want = (ord && ord.length) ? String(ord.indexOf(i) < 0 ? i : ord.indexOf(i)) : "";
    if (b.style.order !== want) b.style.order = want;
  });
  // playtest 11/12: the turn clock lives HERE, right of the boats. Counts down while armed,
  // flashes red for the LAST 10 SECONDS, and shows a dim "⏱ off" you can tap to re-enable.
  const ck = $("pp4Clock");
  if (ck){
    const off = !!appState.timerOff;
    const armed = !off && appState.shotClockSeat != null && !appState.shotClockPaused;
    const left = armed ? Math.max(0, Math.ceil((appState.shotClockDeadline - Date.now()) / 1000)) : 0;
    ck.classList.toggle("on", armed || off);
    ck.classList.toggle("off", off);
    ck.classList.toggle("urgent", armed && left <= 10);
    const t = off ? "⏱ off" : (armed ? "⏱ " + left : "");
    if (!off && !armed) ck.classList.remove("on");
    if (ck.textContent !== t) ck.textContent = t;
  }
  // playtest 13: End of Voyage carries its own big PLAY AGAIN at the bottom. The real
  // #btnPlayAgain lives in the stage-hidden controls row, so this proxy clicks it. Re-injected
  // on this tick whenever a re-render rebuilds the stats panel.
  const sw = $("statsWrap");
  if (sw && sw.style.display !== "none" && !sw.querySelector(".pp4Again")){
    const again = document.createElement("button");
    again.className = "pp4Again"; again.type = "button"; again.textContent = "🔁 Play again!";
    again.onclick = () => { const orig = $("btnPlayAgain"); if (orig && orig.onclick) orig.onclick(); };
    ($("statsPanel") || sw).appendChild(again);
  }
}

/* ================= bubbles ================= */
// One live bubble at a time (flash() is awaited sequentially upstream). Captain lines anchor to
// the speaker's ship under the CURRENT camera; table lines hover top-centre over the water.
const plain = h => String(h).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
function stageFlash(msg){
  if (!S.active) return null;                        // pre-game: let the panel handle it
  // a line that just repeats the live prompt's own ask (the broadcast mirror of localAsk)
  // would bubble the same words twice — the pill already says it
  const liveMsg = document.querySelector("#actionPanel .apMsg");
  if (liveMsg && typeof msg === "string" && plain(msg) && plain(msg) === plain(liveMsg.innerHTML)) return Promise.resolve();
  let subj = S.subject; S.subject = null;
  if (subj == null && typeof msg === "string"){
    // turn-start lines ("X sets sail") carry no event — sniff the speaker from pn()'s colour
    const i = HEXCOL.findIndex(cx => msg.indexOf(`color:${cx}`) >= 0);
    if (i >= 0) subj = i;
  }
  if (S.hurry) S.hurry();                            // one live bubble: retire the old one NOW
  // playtest 5: a manual pinch/pan holds the camera only until the next action — then the
  // director takes the wheel again, so other captains' moves never play off screen.
  S.lock = false;
  const evType = S.evType; S.evType = null;
  if (evType === "storm") camFull();                 // watch the shove land from above
  // playtest 12 item 10: while a battle card is live, the camera HOLDS on the battle — a flee
  // call can only be made by someone who can see the fight, not the caller's own boat
  else if (subj != null && !document.querySelector("#actionPanel .btl")) camToSeat(subj);
  return new Promise(res => {
    // playtest 11 (Wyatt: "the game currently feels like it's in rush mode and i cant read
    // anything") — every narration hold runs 50% longer than the panel's own curve
    const hold = Math.max(2550, Math.min(6750, Math.round((msgHoldMs ? msgHoldMs(msg) : 1700) * 1.5)));
    const b = document.createElement("div");
    b.className = "pp4Bub" + (subj == null ? " ambient" : "");
    if (subj != null) b.style.borderColor = HEXCOL[subj] || "#177";
    // playtest 10 item 7: bubbles bypass panel()'s emojify chokepoint, so ad-hoc narration lines
    // (turn banners, flip results) kept raw ⚪/🌕 emoji instead of the game art. Emojify here.
    b.innerHTML = `<div class="pp4BubIn">${emojify(String(msg))}</div>` + (subj != null ? `<div class="pp4Tail" style="border-color:${HEXCOL[subj] || "#177"}"></div>` : "");
    document.body.appendChild(b);
    // playtest 4: lines type themselves in, the game's own reveal — and fade out on replace
    try { typewriterReveal(b.querySelector(".pp4BubIn"), 9); } catch (e) {}
    let bh = 0, bhAt = -1e9;   // HOT-PHONE: offsetHeight is a layout read — remeasure ~2x/s, not 60
    const place = () => {
      if (subj == null) return;                      // ambient: CSS position
      const u = boatUXY(subj); if (!u) return;
      const [sx, sy] = toScreen(u[0], u[1]);
      const W = Math.min(290, innerWidth - 24);
      if (b.style.width !== W + "px") b.style.width = W + "px";
      if (performance.now() - bhAt > 500){ bh = b.offsetHeight; bhAt = performance.now(); }
      const left = Math.min(Math.max(sx - W / 2, 8), innerWidth - W - 8);
      b.style.left = left + "px";
      b.style.top = Math.max(54, sy - bh - 40) + "px";
      const t = b.querySelector(".pp4Tail");
      if (t) t.style.left = Math.max(16, Math.min(sx - left - 8, W - 32)) + "px";
    };
    // Wyatt's recording, measured frame by frame: positioned on a 90ms interval, the bubble
    // trailed the 60fps camera glide in visible 25-40px steps — a different loop than the board.
    // It now rides tick() itself, repositioned in the SAME frame the camera moves.
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      if (S.bubPlace === place) S.bubPlace = null;
      if (S.hurry === finish) S.hurry = null;
      b.classList.add("out");
      setTimeout(() => b.remove(), 300);
      res();
    };
    S.hurry = finish;
    S.bubPlace = place;
    wake();   // a live bubble rides the ship — full frame rate while it's up
    b.addEventListener("pointerdown", finish);
    place();
    setTimeout(finish, hold);
  });
}

/* ================= flip ceremony ================= */
// Playtest 3 rebuild. The coin moves INTO the veil (root stacking context), flex-centred with
// its caption right beneath it — no fixed-position tricks, nothing above it to grey it out.
// Disarm does NOT tear down: the veil holds while the spin plays and the landed face shows,
// then the flippenator goes home to the (hidden) controls row.
function cerTeardown(){
  const veil = $("pp4Veil"); if (!veil) return;
  const fp = $("flipPanel"), row = $("controlsRow");
  if (fp && row && fp.parentElement !== row) row.insertBefore(fp, row.firstChild);
  veil.remove();
  document.body.classList.remove("pp4Cer");
  if (window.__pp4) window.__pp4.flipMsg = null;   // a later ceremony never inherits these words
  S.cerHome = null;
}
function cerWatchResult(){
  // the flip flow swaps faces on #flipCoinWrap: spin -> heads/tails. Hold the veil until a face
  // lands, show it a beat, then leave. Fallback teardown if nothing lands (e.g. prompt cancelled).
  const coin = $("flipCoinWrap");
  const t0 = performance.now();
  const iv = setInterval(() => {
    const c = $("flipCoinWrap");
    const landed = c && (c.classList.contains("heads") || c.classList.contains("tails"));
    const armedAgain = c && c.classList.contains("active");
    if (landed){
      clearInterval(iv);
      // playtest 10 item 6: the landed face hits like a gavel — shudder + golden flare
      c.classList.add("pp4Land");
      setTimeout(() => c.classList.remove("pp4Land"), 700);
      setTimeout(() => { if (!$("flipCoinWrap")?.classList.contains("active")) cerTeardown(); }, 1100);
    }
    else if (armedAgain){ clearInterval(iv); }        // a new flip re-armed: veil stays, caption returns
    else if (performance.now() - t0 > 6000){ clearInterval(iv); cerTeardown(); }
  }, 120);
}
function flipArmed(el, onClick){
  if (!S.active) return false;                       // pre-game: normal flippenator
  if (!onClick){
    // disarmed: the tap landed and the spin is starting — hold the stage and watch for the face
    const veil = $("pp4Veil");
    if (veil){ veil.classList.add("resolving"); cerWatchResult(); }
    return true;
  }
  let veil = $("pp4Veil");
  if (!veil){
    veil = document.createElement("div"); veil.id = "pp4Veil";
    // playtest 15 item 5: no "CALL IN THE AIR…" header — the coin and the stakes say it all
    veil.innerHTML = `<div id="pp4CerSlot"></div>
      <div class="pp4CerSub">Tap the coin, captain — let fate decide.</div>`;
    document.body.appendChild(veil);
    veil.addEventListener("pointerdown", ev => {
      const coin = $("flipCoinWrap");
      if (coin && coin.onclick){ ev.stopPropagation(); coin.onclick(); }
    });
  }
  veil.classList.remove("resolving");
  const fp = $("flipPanel"), slot = $("pp4CerSlot");
  if (fp && slot && fp.parentElement !== slot) slot.appendChild(fp);
  document.body.classList.add("pp4Cer");
  // playtest 10 item 5: the old prompt card is hidden under the veil (CSS body.pp4Cer) — its
  // words move up here: the ask above the coin, the stakes line beneath it. Copied on the next
  // frame, AFTER localAsk's panel() has rendered (the arm hook fires first), and with the
  // typewriter's reveal spans un-hidden so the copy is whole from its first paint.
  requestAnimationFrame(() => {
    const v2 = $("pp4Veil"); if (!v2) return;
    // localAsk stashes the flip prompt's own words on the bridge — a PURE flip never renders a
    // panel to read, and the panel can still hold the PREVIOUS prompt's text at arm time
    const fm = window.__pp4 && window.__pp4.flipMsg;
    let t = v2.querySelector(".pp4CerTitle");
    if (!t){ t = document.createElement("div"); t.className = "pp4CerTitle"; v2.insertBefore(t, $("pp4CerSlot")); }
    t.innerHTML = fm ? emojify(String(fm.m)) : "";
    let st = v2.querySelector(".pp4CerStakes");
    if (!st){ st = document.createElement("div"); st.className = "pp4CerStakes"; v2.insertBefore(st, v2.querySelector(".pp4CerSub")); }
    st.innerHTML = fm ? emojify(String(fm.s)) : "";
  });
  return true;
}

/* ================= recipe compare (two-tap focus + island glow) ================= */
let focusBtn = null;
function recipeGuard(){
  document.addEventListener("click", e => {
    if (!S.active) return;
    const btn = e.target.closest("#actionPanel .apBtn");
    if (!btn || !btn.querySelector(".recipeList")) { focusBtn = null; return; }
    if (focusBtn === btn) { clearGlow(); focusBtn = null; return; }  // second tap: let it through
    e.stopPropagation(); e.preventDefault();                          // first tap: focus + glow
    focusBtn = btn;
    document.querySelectorAll("#actionPanel .apBtn").forEach(x => x.classList.toggle("pp4Focus", x === btn));
    clearGlow();
    const g = appState.game; if (!g) return;
    const names = [...btn.querySelectorAll(".rn")].map(x => x.textContent.trim());
    const cp = cellPx(), svg = svgEl();
    // resolve display-name -> ingredient id through the shared table
    import("../shared/index.js").then(sh => {
      const ids = names.map(n => Object.entries(sh.ING_NAME || {}).find(([k, v]) => v === n)?.[0]).filter(Boolean);
      ids.forEach(ing => {
        const c = (g.dockOf && g.dockOf[ing]) || (g.islandOf && g.islandOf[ing]); if (!c) return;
        const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        el.setAttribute("cx", (c[0] + 0.5) * cp); el.setAttribute("cy", (c[1] + 0.5) * cp);
        // playtest 12 (2.4): a tight ring on the dock square itself, not a splash over the island
        el.setAttribute("r", cp * 0.55); el.setAttribute("fill", "#f5a623"); el.setAttribute("fill-opacity", "0.18");
        el.setAttribute("stroke", "#f5a623"); el.setAttribute("stroke-width", 3);
        el.classList.add("pp4Glow"); svg.appendChild(el);
      });
    }).catch(() => {});
  }, true);
}
function clearGlow(){ document.querySelectorAll(".pp4Glow").forEach(e => e.remove()); }

/* ================= stage assembly ================= */
function buildStage(){
  const wrap = $("boardwrap"); if (!wrap) return;
  document.body.classList.add("pp4Stage");
  // ribbon
  const rib = document.createElement("div"); rib.id = "pp4Ribbon";
  const order = [0, 1, 2, 3];
  rib.innerHTML = `<span id="pp4Round">DAY 1</span>
    <span class="pp4Boats">${order.map(i => `<img class="pp4Boat" src="../assets/boats/${i + 1}.png">`).join("")}</span>
    <span id="pp4Clock"></span>
    <button id="pp4Menu" type="button">☰</button>`;
  document.body.appendChild(rib);
  // wind pill
  const pill = document.createElement("div"); pill.id = "pp4Pill";
  document.body.appendChild(pill);
  // playtest 4: no sheet. The captains box is ALWAYS on screen, pinned under the board and
  // rising to meet it when the zoomed-out board leaves blank water. Prompts float at the ship.
  const capBox = document.createElement("div"); capBox.id = "pp4Cap";
  document.body.appendChild(capBox);
  const cr = $("controlsRow"), ap = $("actionPanel");
  if (cr) capBox.appendChild(cr);              // parked hidden — the ceremony borrows the coin from here
  const cap = $("captainsPanel"); if (cap) capBox.appendChild(cap);
  // playtest 11: rows are one line (recipe hidden) — tapping a row reveals that captain's recipe
  // line again. Rows are stable elements, so the open state survives re-renders.
  capBox.addEventListener("click", e => {
    const row = e.target.closest(".player-row");
    if (row && !e.target.closest("a,button")) row.classList.toggle("pp4Open");
  });
  const prompt = document.createElement("div"); prompt.id = "pp4Prompt";
  document.body.appendChild(prompt);
  if (ap) prompt.appendChild(ap);
  // menu: the old footer as an overlay, plus the turn-clock toggle (its panel left the sheet)
  const clockRow = document.createElement("button");
  clockRow.id = "pp4ClockRow"; clockRow.type = "button";
  const clockLabel = () => { clockRow.textContent = appState.timerOff ? "⏱ Turn clock: OFF — no rush" : "⏱ Turn clock: ON — 30s a turn"; };
  const clockToggle = () => { const t = $("scTimerToggle"); if (t) t.click();
    else { appState.timerOff = !appState.timerOff; try{ localStorage.setItem("pp_timerOff", appState.timerOff ? "1" : "0"); }catch(e){} }
    setTimeout(clockLabel, 60); };
  clockRow.onclick = clockToggle;
  clockLabel();
  // playtest 12: tapping the ribbon clock toggles it too, and the chip shows its OFF state
  const rc = $("pp4Clock"); if (rc) rc.onclick = clockToggle;
  const foot = $("footerRow"); if (foot) foot.insertBefore(clockRow, foot.firstChild);
  // playtest 10 item 2: the sound toggle was orphaned at the top-left of the stage (the horn
  // peeking under the ribbon in Wyatt's screenshots) — it lives in the ☰ menu now
  const ms = $("muteSlot");
  if (ms && foot){ foot.insertBefore(ms, clockRow); ms.style.cssText = "display:flex;justify-content:center;"; }
  if (foot){
    const stamp = document.createElement("div");
    stamp.id = "pp4Stamp";
    stamp.textContent = "v4 · build " + PP4_STAMP;
    stamp.style.cssText = "opacity:.55;font-size:11px;text-align:center;padding:6px 0 2px;letter-spacing:.04em";
    foot.appendChild(stamp);
  }
  $("pp4Menu").onclick = () => {
    document.body.classList.toggle("pp4Foot");
    clockLabel();
  };
  // playtest 12 item 6: tapping anywhere outside the open menu closes it
  document.addEventListener("pointerdown", e => {
    if (document.body.classList.contains("pp4Foot") && !e.target.closest("#footerRow,#pp4Menu"))
      document.body.classList.remove("pp4Foot");
  }, true);
  const svg = svgEl();
  if (svg) svg.setAttribute("preserveAspectRatio", "xMidYMin meet");   // full-board hugs the ribbon
  const shipsSvg = $("boardShips");
  if (shipsSvg) shipsSvg.setAttribute("preserveAspectRatio", "xMidYMin meet");
  gestures(wrap);
  camFull();
  S.active = true;
}

// a menu is 1-5 apBtn choices with SHORT labels and no rich content — the N4 radial case.
// Playtest 10 (Wyatt: "ALL of the action prompts should be [radial]"): single-button prompts
// qualify too, and a button whose ask() option carries a `short` label qualifies regardless of
// its full label's length — the circle shows the short form, the pill carries the sentence.
function menuButtons(ap){
  if (ap.querySelector(".btlBtn,.bkoRow,.recipeList,input,select")) return null;
  const btns = [...ap.querySelectorAll(".apBtn")];
  // playtest 15: up to EIGHT circles — the trade's what-do-ye-WANT step (7 crates) fans too;
  // the open-side fan wraps to a second arc row past four, so big menus stay one tight group
  if (btns.length < 1 || btns.length > 8) return null;
  if (!btns.every(b => b._shortHtml != null || b.textContent.trim().length <= 16)) return null;
  return btns;
}
function promptTick(){
  const box = $("pp4Prompt"), ap = $("actionPanel");
  if (!box || !ap) return;
  // textContent, not innerText — innerText forces a layout pass, and this runs every frame
  const has = ap.textContent.trim().length > 0 || ap.querySelector(".apBtn,.btlBtn,.bkoRow");
  const want = has ? "block" : "none";
  if (box.style.display !== want) box.style.display = want;
  if (!has){
    // full mode teardown — the recipes->lots transition never passes through an empty tick, and a
    // stale .pp4PeekHint left in the box becomes a FLEX SIBLING of the panel on the next centre
    // stage, crushing the message into a one-word-wide strip (Wyatt's 2:10 screenshot)
    box.classList.remove("radial", "pp4Center", "pp4Recipes");
    S.radKey = null;
    const h0 = box.querySelector(".pp4PeekHint"); if (h0) h0.remove();
    if (ap.style.maxHeight) ap.style.maxHeight = "";
    return;
  }
  // playtest 12 item 1/3: intro barriers (ahoy, turn order) play CENTER STAGE — the board dims,
  // the message sits dead centre and its button pulses right beneath it
  if (ap.dataset.pp4Stage){
    box.style.display = "flex";   // the visibility toggle above writes "block" — centre mode is flex
    // same teardown as the empty-tick branch: a hint or maxHeight surviving from the recipe
    // sheet must never share the centre stage (see the strip bug above)
    const h1 = box.querySelector(".pp4PeekHint"); if (h1) h1.remove();
    if (ap.style.maxHeight) ap.style.maxHeight = "";
    box.classList.remove("pp4Recipes");
    if (!box.classList.contains("pp4Center")){
      box.classList.add("pp4Center"); box.classList.remove("radial", "centered");
      S.radKey = null;
      box.style.left = ""; box.style.top = ""; box.style.width = "";
      [...ap.querySelectorAll(".apBtn")].forEach(b => { b.style.position = ""; b.style.left = ""; b.style.top = ""; });
      const m = ap.querySelector(".apMsg"); if (m){ m.style.position = ""; m.style.left = ""; m.style.top = ""; }
    }
    return;
  }
  box.classList.remove("pp4Center");
  // playtest 10 item 1: the recipe chooser becomes a BOTTOM sheet — the sea it asks you to read
  // stays visible above the cards, holding a finger on the sea peeks behind them (the gesture
  // that already works on every card), and a hint line teaches it. Draft copy — Wyatt's to rewrite.
  const recipes = !!ap.querySelector(".recipeList");
  box.classList.toggle("pp4Recipes", recipes);
  let hint = box.querySelector(".pp4PeekHint");
  if (recipes){
    box.classList.remove("radial", "centered");
    const top = Math.round(innerHeight * 0.45);
    box.style.left = "8px"; box.style.top = top + "px";
    box.style.width = (innerWidth - 16) + "px";
    ap.style.maxHeight = (innerHeight - top - 8) + "px";
    if (!hint){
      hint = document.createElement("div"); hint.className = "pp4PeekHint";
      // playtest 12 (2.1/2.3): two separate pills on dark glass, legible over any water
      hint.innerHTML = `<span>Tap a recipe to highlight its docks</span><span>Tap and hold the sea to reveal the board</span>`;
      box.insertBefore(hint, ap);
    }
    return;
  }
  if (hint) hint.remove();
  ap.style.maxHeight = "";
  // N4 radial: choices bloom around the ship, right where the eyes are (the plan's own words).
  const menu = menuButtons(ap);
  const uu = boatUXY(appState.mySeat ?? 0);
  if (menu && uu){
    box.classList.add("radial"); box.classList.remove("centered");
    box.style.left = "0px"; box.style.top = "0px"; box.style.width = "100vw";
    // playtest 10: circles carry the SHORT form of a long action (Wyatt's pick: "short verbs,
    // details in the pill") — the full label is kept for the card fallback and restored there
    menu.forEach(b => {
      if (b._shortHtml != null && !b._radSwapped){ b._fullHtml = b.innerHTML; b.innerHTML = emojify(String(b._shortHtml)); b._radSwapped = true; }
    });
    const [sx, sy] = toScreen(uu[0], uu[1]);
    const cap = $("pp4Cap");
    const capT = cap ? cap.getBoundingClientRect().top : innerHeight;
    const rib = $("pp4Ribbon");
    const tSafe = (rib ? rib.getBoundingClientRect().bottom : 44) + 40;
    // playtest 12 item 8: circles hug the boat — as close as the ship-clearance allows
    const R = 70, D = 66;
    const placed = [];
    // playtest 10 item 3: the sail prompt is radial too — its legal squares are the answer space,
    // so every sail highlight is an obstacle nothing of ours may cover
    const cellRects = [...document.querySelectorAll(".sailCell")].map(r => r.getBoundingClientRect());
    let cb = null;
    if (cellRects.length){
      cb = { l: 1e9, t: 1e9, r: -1e9, b: -1e9 };
      cellRects.forEach(r => { cb.l = Math.min(cb.l, r.left); cb.t = Math.min(cb.t, r.top);
        cb.r = Math.max(cb.r, r.right); cb.b = Math.max(cb.b, r.bottom); });
    }
    // the ask itself rides as a compact pill above the ship — never hidden, so the panel's
    // type-then-reveal order survives; the bloom below it is the answer space
    const msg = ap.querySelector(".apMsg");
    // the ask's broadcast mirror can land as a bubble BEFORE the panel exists — if a live
    // bubble is just this pill's own words, retire it (the pill already says it)
    const bub = document.querySelector(".pp4Bub");
    if (bub && msg && plain(bub.textContent) === plain(msg.textContent) && S.hurry) S.hurry();
    // HOT-PHONE memo: the placement search below re-ran every frame even with everything parked.
    // Re-place only when an input actually moved (camera/ship/viewport/menu/cells).
    const radKey = [S.turnSerial, menu.length, sx | 0, sy | 0, Math.round(capT), Math.round(tSafe),
      cellRects.length, innerWidth, menu.map(b => b.textContent.length).join(",")].join("|");
    if (radKey === S.radKey) return;
    S.radKey = radKey;
    let pillB = null;
    if (msg){
      const mw = Math.min(msg.offsetWidth || 200, innerWidth - 20);
      msg.style.position = "fixed";
      // playtest 15 (Wyatt: "over the course of a single turn, it doesn't move around"): the
      // pill's spot is chosen at the FIRST prompt of the turn and every later prompt in the
      // same turn reuses it — only the width re-clamps so a longer ask stays on screen.
      let cxA, mTop;
      if (S.pillLock && S.pillLock.key === S.turnSerial){
        cxA = S.pillLock.cx; mTop = S.pillLock.top;
      } else {
        cxA = sx;
        mTop = Math.max(tSafe - 34, sy - R - 96);
        // a sail prompt's pill dodges the whole sail window: above it if there's room under
        // the ribbon, else just below it
        if (cb){ mTop = (cb.t - 42 >= tSafe - 34) ? cb.t - 42 : Math.min(cb.b + 8, capT - 44); }
        S.pillLock = { key: S.turnSerial, cx: cxA, top: mTop };
      }
      msg.style.left = Math.min(Math.max(cxA - mw / 2, 10), innerWidth - mw - 10) + "px";
      msg.style.top = mTop + "px";
      pillB = msg.getBoundingClientRect();
      // the back option, when present, is a small circle on the pill's shoulder
      const back = ap.querySelector(".apBack");
      if (back){
        back.style.left = Math.max(4, pillB.left - 46) + "px";
        back.style.top = (pillB.top + (pillB.height - 38) / 2) + "px";
      }
      // helper text (greyed-circle reasons) rides just beneath the pill
      const sub = ap.querySelector(".apSub");
      if (sub){
        const sw = Math.min(sub.offsetWidth || 200, innerWidth - 20);
        sub.style.left = Math.min(Math.max(cxA - sw / 2, 10), innerWidth - sw - 10) + "px";
        sub.style.top = (pillB.bottom + 6) + "px";
      }
    }
    // ---- playtest 15, ONE placement rule (Wyatt's pick): a TIGHT FAN on the open side ----
    // Find the most open direction from the boat (clear of screen edges, the captains box, the
    // pill and every sail square), then lay ALL the buttons along snug arc rows centred on it —
    // circles nearly touching, wrapping to a second row past four. A cornered boat fans toward
    // whatever water is open; the group stays together instead of scattering.
    const xMin = 8, xMax = innerWidth - D - 8, yMin = tSafe, yMax = capT - D - 8;
    const hitRect = (bx, by, r, m) =>
      bx < r.right + m && bx + D > r.left - m && by < r.bottom + m && by + D > r.top - m;
    const obstacles = cellRects.slice();
    if (pillB) obstacles.push(pillB);
    const inBounds = (bx, by) => bx >= xMin && bx <= xMax && by >= yMin && by <= yMax;
    const clash = (bx, by) =>
      placed.some(q => Math.hypot(bx - q[0], by - q[1]) < D + 4) ||
      Math.hypot(bx + D / 2 - sx, by + D / 2 - sy) < D / 2 + 26 ||
      obstacles.some(r => hitRect(bx, by, r, 2));
    // the most open heading: how far can a circle travel from the boat before hitting anything?
    let bestA = Math.PI / 2, bestScore = -1;
    for (let k = 0; k < 16; k++){
      const a = k * Math.PI / 8;
      let reach = 0;
      for (let r = R; r <= R + 150; r += 15){
        const cx = sx + r * Math.cos(a) - D / 2, cy = sy + r * Math.sin(a) - D / 2;
        if (!inBounds(cx, cy) || obstacles.some(rc => hitRect(cx, cy, rc, 2))) break;
        reach = r;
      }
      if (reach > bestScore){ bestScore = reach; bestA = a; }
    }
    // slot list: two arc rows centred on the open heading, ordered centre-out — buttons take
    // slots in order, so however many there are (1-8) they pack as one tight group
    const slots = [];
    for (const r of [R, R + D + 8]){
      const step = 2 * Math.asin(Math.min(1, (D / 2 + 4) / r));
      for (const m of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5]){
        const a = bestA + m * step;
        slots.push([sx + r * Math.cos(a) - D / 2, sy + r * Math.sin(a) - D / 2]);
      }
    }
    menu.forEach(b => {
      let spot = slots.find(([cx, cy]) => inBounds(cx, cy) && !clash(cx, cy));
      if (!spot){
        // cornered beyond hope (tiny viewport): the group docks as a strip above the captains
        const n = placed.length;
        spot = [Math.min(Math.max(sx - D / 2 + (n - (menu.length - 1) / 2) * (D + 6), xMin), xMax),
                Math.max(yMin, capT - D - 10)];
      }
      placed.push(spot);
      b.style.position = "fixed"; b.style.left = spot[0] + "px"; b.style.top = spot[1] + "px";
    });
    return;
  }
  box.classList.remove("radial");
  S.radKey = null;
  [...ap.querySelectorAll(".apBtn")].forEach(b => {
    b.style.position = ""; b.style.left = ""; b.style.top = "";
    if (b._radSwapped){ b.innerHTML = b._fullHtml; b._radSwapped = false; }   // card shows the full label
  });
  // HOT-PHONE: the card path reads offsetHeight (layout) — 20Hz is plenty when nothing glides
  if (!S.tween && fc % 3) return;
  const big = box.offsetHeight > innerHeight * 0.42;
  const u = boatUXY(appState.mySeat ?? 0);
  if (big || !u){ box.classList.add("centered"); box.style.left = ""; box.style.top = ""; return; }
  box.classList.remove("centered");
  const W = Math.min(330, innerWidth - 16);
  box.style.width = W + "px";
  const H = box.offsetHeight;
  const cap = $("pp4Cap");
  const capTop = cap ? cap.getBoundingClientRect().top : innerHeight;
  const pill = $("pp4Pill");
  const topSafe = (pill && pill.style.display !== "none")
    ? pill.getBoundingClientRect().bottom + 8
    : ($("pp4Ribbon") ? $("pp4Ribbon").getBoundingClientRect().bottom + 8 : 56);
  const [sx, sy] = toScreen(u[0], u[1]);
  let left, top;
  const cells = [...document.querySelectorAll(".sailCell")];
  if (cells.length){
    // playtest 6: during a sail prompt the card must NEVER sit on the sail window — the camera
    // promised every legal square stays visible, so the card dodges to the clearest band:
    // below the window, above it, or hugging the captains box, recomputed as the camera moves.
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    cells.forEach(c => { const r = c.getBoundingClientRect();
      x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top);
      x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); });
    left = Math.min(Math.max((x0 + x1) / 2 - W / 2, 8), innerWidth - W - 8);
    const below = (capTop - 8) - (y1 + 8);
    const above = (y0 - 8) - topSafe;
    if (below >= H) top = y1 + 8;
    else if (above >= H) top = y0 - 8 - H;
    else top = capTop - H - 6;                 // least-bad: hug the captains box
  } else {
    left = Math.min(Math.max(sx - W / 2, 8), innerWidth - W - 8);
    top = sy + 34;                             // just under the hull
    if (top + H > capTop - 6) top = Math.max(topSafe, sy - H - 44);
  }
  box.style.left = left + "px"; box.style.top = top + "px";
}
// HOT-PHONE, measured by ablation (idle at a sail prompt, headless): the 60Hz rAF loop itself
// cost ~17% of a core — more than every CSS animation combined — just by waking the renderer
// every frame. So the loop now has two gears: full rAF while anything actually moves (camera
// tween, live pinch/pan, a bubble riding a ship), and an 8Hz heartbeat otherwise. wake() snaps
// back to the fast gear the instant motion starts, so nothing ever glides at 8fps.
let fc = 0;
function needFast(){ return !!(S.tween || S.bubPlace || ptrs.size > 0); }
export function wake(){
  if (S.slow){ clearTimeout(S.raf); S.slow = false; S.raf = requestAnimationFrame(tick); }
}
function tick(){
  fc++;
  camFrame();
  if (S.bubPlace) S.bubPlace();   // the live bubble moves in the same frame as the camera
  if (S.active){
    // pill and ribbon change on human timescales — 10Hz in the fast gear, every beat in slow
    if (S.slow || S.tween || fc % 6 === 0){ pillTick(); ribbonTick(); }
    promptTick();
  }
  else if (S.slow || fc % 6 === 0){
    // activate once a solo game is actually on screen
    const gameEl = $("game");
    if (gameEl && getComputedStyle(gameEl).display !== "none" && appState.game && !appState.room){
      buildStage();
    }
  }
  if (needFast()){ S.slow = false; S.raf = requestAnimationFrame(tick); }
  else { S.slow = true; S.raf = setTimeout(tick, 125); }
}

export function initStage(){
  // solo clock: off by default on /4 (the toggle in the sheet still works and persists)
  try { if (localStorage.getItem("pp_timerOff") == null) { appState.timerOff = true; localStorage.setItem("pp_timerOff", "1"); } } catch (e) {}
  // bridge for the classic modules (no import cycles): panel/flow/board call these if present
  window.__pp4 = {
    flash: stageFlash,
    narr: html => (S.active ? stageFlash(html) : null),
    set subject(v){ S.subject = v; }, get subject(){ return S.subject; },
    set evType(v){ S.evType = v; }, get evType(){ return S.evType; },
    sailCells: () => { if (S.active) camFitSail(); },
    battle: (a, d) => { if (!S.active) return; const g = appState.game; if (!g) return;
      const pa = g.players[a], pd = g.players[d]; if (!pa || !pd) return;
      const cp = cellPx(); const cx = (pa.pos[0] + pd.pos[0]) / 2, cy = (pa.pos[1] + pd.pos[1]) / 2;
      camToCell([cx, cy], 2.0); },
    flip: flipArmed,
    // turnSerial: bumps whenever the wheel changes hands — the pill-lock and placement memo key
    // on it, so a NEW turn re-anchors the ask pill and an ongoing one never moves it (playtest 15)
    actor: seat => { if (S.activeSeat !== seat) S.turnSerial = (S.turnSerial || 0) + 1; S.activeSeat = seat; },
    // a rim ride spans the whole board — pull out so the sweep never plays off screen; the
    // narration that follows glides the camera back down to the ship at its whirlpool
    sweepCam: () => { if (S.active){ S.lock = false; camFull(); } },
  };
  recipeGuard();
  // grey the Pass & Play card: solo only this build (draft copy — Wyatt rewrites after playing)
  const pp = $("choicePassPlay");
  if (pp){
    pp.classList.add("pp4Off");
    const note = document.createElement("div");
    note.className = "pp4OffNote";
    note.textContent = "\u{1F6E0} In the shipyard fer refit — sail solo fer now, captain.";
    pp.appendChild(note);
    pp.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); }, true);
  }
  tick();
}
