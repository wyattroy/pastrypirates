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
import { HEXCOL } from "../shared/index.js";

const $ = id => document.getElementById(id);
const AR = { N: "↑", S: "↓", E: "→", W: "←" };

const S = {
  active: false,            // stage layout applied (solo game on screen)
  cam: { x: 0, y: 0, w: 640, tx: 0, ty: 0, tw: 640 },
  lock: false,              // a player gesture holds the camera until the next sail prompt
  subject: null,            // seat index the next flash() line is about (stashed by panel.js)
  evType: null,
  hurry: null,              // resolver for tap-to-hurry on the live bubble
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
  if (immediate){ S.cam.x = S.cam.tx; S.cam.y = S.cam.ty; S.cam.w = S.cam.tw; S.tween = null; return; }
  // Wyatt, playtest 3: the glide was a jerky exponential chase — S-curve it, ~300ms longer.
  S.tween = { fx: S.cam.x, fy: S.cam.y, fw: S.cam.w, t0: performance.now(), dur: 650 };
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
  const ribH = rib ? Math.ceil(rib.getBoundingClientRect().bottom) : 48;
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
    rip.style.transformOrigin = "0 0";
    rip.style.transform = `scale(${s2}) translate(${-(c.x / 640) * W}px, ${-(vy / 640) * W}px)`;
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
      if (S.hurry) S.hurry();                        // any tap hurries the live bubble
    }
  };
  wrap.addEventListener("pointerup", up); wrap.addEventListener("pointercancel", up);
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
  const sw = $("statsWrap");
  p.style.display = (!h || (sw && getComputedStyle(sw).display !== "none")) ? "none" : "";
}

/* ================= ribbon ================= */
function ribbonTick(){
  const r = $("pp4Round"), g = appState.game;
  if (r && g) r.textContent = "DAY " + (g.round || 1);
  const boats = document.querySelectorAll("#pp4Ribbon .pp4Boat");
  const act = (S.activeSeat != null) ? S.activeSeat : (appState.curSeat ?? -1);
  boats.forEach((b, i) => b.classList.toggle("on", i === act));
}

/* ================= bubbles ================= */
// One live bubble at a time (flash() is awaited sequentially upstream). Captain lines anchor to
// the speaker's ship under the CURRENT camera; table lines hover top-centre over the water.
function stageFlash(msg){
  if (!S.active) return null;                        // pre-game: let the panel handle it
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
  else if (subj != null) camToSeat(subj);            // the camera glides to the speaker
  return new Promise(res => {
    const hold = Math.max(2500, Math.min(6000, msgHoldMs ? msgHoldMs(msg) : 2500));
    const b = document.createElement("div");
    b.className = "pp4Bub" + (subj == null ? " ambient" : "");
    if (subj != null) b.style.borderColor = HEXCOL[subj] || "#177";
    b.innerHTML = `<div class="pp4BubIn">${msg}</div>` + (subj != null ? `<div class="pp4Tail" style="border-color:${HEXCOL[subj] || "#177"}"></div>` : "");
    document.body.appendChild(b);
    // playtest 4: lines type themselves in, the game's own reveal — and fade out on replace
    try { typewriterReveal(b.querySelector(".pp4BubIn"), 14); } catch (e) {}
    const place = () => {
      if (subj == null) return;                      // ambient: CSS position
      const u = boatUXY(subj); if (!u) return;
      const [sx, sy] = toScreen(u[0], u[1]);
      const W = Math.min(290, innerWidth - 24);
      b.style.width = W + "px";
      const left = Math.min(Math.max(sx - W / 2, 8), innerWidth - W - 8);
      b.style.left = left + "px";
      b.style.top = Math.max(54, sy - b.offsetHeight - 40) + "px";
      const t = b.querySelector(".pp4Tail");
      if (t) t.style.left = Math.max(16, Math.min(sx - left - 8, W - 32)) + "px";
    };
    let done = false, iv = setInterval(place, 90);   // track the gliding camera
    const finish = () => {
      if (done) return; done = true;
      clearInterval(iv); if (S.hurry === finish) S.hurry = null;
      b.classList.add("out");
      setTimeout(() => b.remove(), 300);
      res();
    };
    S.hurry = finish;
    b.addEventListener("pointerdown", finish);
    requestAnimationFrame(place);
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
    if (landed){ clearInterval(iv); setTimeout(() => { if (!$("flipCoinWrap")?.classList.contains("active")) cerTeardown(); }, 1100); }
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
    veil.innerHTML = `<div class="pp4CerTop">CALL IN THE AIR…</div>
      <div id="pp4CerSlot"></div>
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
        el.setAttribute("r", cp * 1.15); el.setAttribute("fill", "#f5a623"); el.setAttribute("fill-opacity", "0.16");
        el.setAttribute("stroke", "#f5a623"); el.setAttribute("stroke-width", 5);
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
  const prompt = document.createElement("div"); prompt.id = "pp4Prompt";
  document.body.appendChild(prompt);
  if (ap) prompt.appendChild(ap);
  // menu: the old footer as an overlay, plus the turn-clock toggle (its panel left the sheet)
  const clockRow = document.createElement("button");
  clockRow.id = "pp4ClockRow"; clockRow.type = "button";
  const clockLabel = () => { clockRow.textContent = appState.timerOff ? "⏱ Turn clock: OFF — no rush" : "⏱ Turn clock: ON — 20s a turn"; };
  clockRow.onclick = () => { const t = $("scTimerToggle"); if (t) t.click();
    else { appState.timerOff = !appState.timerOff; try{ localStorage.setItem("pp_timerOff", appState.timerOff ? "1" : "0"); }catch(e){} }
    setTimeout(clockLabel, 60); };
  clockLabel();
  const foot = $("footerRow"); if (foot) foot.insertBefore(clockRow, foot.firstChild);
  $("pp4Menu").onclick = () => {
    document.body.classList.toggle("pp4Foot");
    clockLabel();
  };
  const svg = svgEl();
  if (svg) svg.setAttribute("preserveAspectRatio", "xMidYMin meet");   // full-board hugs the ribbon
  const shipsSvg = $("boardShips");
  if (shipsSvg) shipsSvg.setAttribute("preserveAspectRatio", "xMidYMin meet");
  gestures(wrap);
  camFull();
  S.active = true;
}

function promptTick(){
  const box = $("pp4Prompt"), ap = $("actionPanel");
  if (!box || !ap) return;
  const has = ap.innerText.trim().length > 0 || ap.querySelector(".apBtn,.btlBtn,.bkoRow");
  box.style.display = has ? "block" : "none";
  if (!has) return;
  const big = box.offsetHeight > innerHeight * 0.42;
  const u = boatUXY(appState.mySeat ?? 0);
  if (big || !u){ box.classList.add("centered"); box.style.left = ""; box.style.top = ""; return; }
  box.classList.remove("centered");
  const [sx, sy] = toScreen(u[0], u[1]);
  const W = Math.min(330, innerWidth - 16);
  box.style.width = W + "px";
  const left = Math.min(Math.max(sx - W / 2, 8), innerWidth - W - 8);
  let top = sy + 34;                                      // just under the hull
  const cap = $("pp4Cap");
  const capTop = cap ? cap.getBoundingClientRect().top : innerHeight;
  if (top + box.offsetHeight > capTop - 6) top = Math.max(56, sy - box.offsetHeight - 44);
  box.style.left = left + "px"; box.style.top = top + "px";
}
function tick(){
  camFrame();
  if (S.active){ pillTick(); ribbonTick(); promptTick(); }
  else {
    // activate once a solo game is actually on screen
    const gameEl = $("game");
    if (gameEl && getComputedStyle(gameEl).display !== "none" && appState.game && !appState.room){
      buildStage();
    }
  }
  S.raf = requestAnimationFrame(tick);
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
    actor: seat => { S.activeSeat = seat; },
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
