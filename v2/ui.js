// Pastry Pirates v2 — render + input.
//
// Renders from state and events only; contains no rules. The human player is a RESOLVER: the engine
// yields a DecisionRequest, this file turns it into buttons, and the click becomes the response.
// Exactly the same seam the bots use — which is what makes "bots and humans play the same game by
// the same rules" true by construction rather than by discipline.

import { BOARD_IMG, DOCK_IMG, ING_IMG, ING_NAME, ING_EMOJI, BOAT_IMG, ISLAND_SHAPE_IMG,
         COIN_IMG, COIN_SPIN_IMG, FLIP_HEADS_IMG, FLIP_TAILS_IMG, FLIP_SOCKET_IMG,
         HEXCOL, iconImg } from "../src/shared/index.js";
import { DIRS, DK, K, man, POWERS } from "./engine.js";
import { narrate as lineFor, tierOf, ownerOf, TIER } from "./events.js";

const SVGNS = "http://www.w3.org/2000/svg";
const el = (t, a, p) => { const e = document.createElementNS(SVGNS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const $ = id => document.getElementById(id);
// the shipped asset constants are root-relative; this page is one level down
export const A = u => (u && !/^(\.\.|https?:|data:)/.test(u)) ? "../" + u : u;
export const sleep = ms => new Promise(r => setTimeout(r, ms));   // timer-driven, never rAF (PRD N9)

let G = null, CELL = 30, dots = [], dotTimer = null;

export function attach(game) { G = game; }

/* ---------------------------------------------------------------- the board */

export function drawBoard() {
  const wrap = $("board"); wrap.innerHTML = "";
  const n = G.board.cfg.grid;
  const size = Math.min(wrap.clientWidth || 560, 560);
  CELL = Math.floor(size / n);
  const svg = el("svg", { width: CELL * n, height: CELL * n, viewBox: `0 0 ${CELL * n} ${CELL * n}`, id: "boardSvg" }, wrap);

  el("image", { x: 0, y: 0, width: CELL * n, height: CELL * n, href: A(BOARD_IMG), preserveAspectRatio: "none" }, svg);

  // playable water
  for (const key of G.board.valid) {
    const [x, y] = key.split(",").map(Number);
    if (G.onRim([x, y])) continue;
    el("rect", { x: x * CELL, y: y * CELL, width: CELL, height: CELL, rx: 3,
      fill: "#39a4b4", "fill-opacity": .30, stroke: "#1d6472", "stroke-opacity": .25 }, svg);
  }
  drawTradeWinds(svg);

  // ISLANDS ARE DRAWN FROM THEIR OWN CELLS, not from a picture stretched over a bounding box.
  //
  // The board generator makes islands out of tetrominoes and records shapeIdx/rot/flip. The old
  // draw took the art for shapeIdx, ignored the rotation and the flip, and stretched it edge to
  // edge across the island's bounding rectangle — so the green landmass in the picture had almost
  // nothing to do with the squares you can actually sail to. The crates then sat on the real
  // cells, which put them beside the drawn island rather than on it, and the berth was a small
  // brown jetty lost in open water. Three complaints, one cause.
  //
  // Cells are the truth, so cells are what gets painted: a sand ring (over-sized rects, which
  // merge into one outline because they overlap) then the green land inside it. The shape on
  // screen is now the shape of the island by construction, and cannot drift from it again.
  for (const ing of G.ings) {
    const cells = G.board.islandRect[ing];
    const g1 = el("g", {}, svg);
    for (const c of cells) el("rect", { x: c[0] * CELL - 3, y: c[1] * CELL - 3, width: CELL + 6, height: CELL + 6,
      rx: 7, fill: "#e6c78c" }, g1);
    for (const c of cells) el("rect", { x: c[0] * CELL - 1, y: c[1] * CELL - 1, width: CELL + 2, height: CELL + 2,
      rx: 5, fill: "#6fb757" }, g1);
    // one crate icon per island square, greyed as the storehouse empties
    cells.slice(0, G.board.cfg.crates).forEach((c, i) => {
      const gone = i >= G.board.tokens[ing];
      el("image", { x: c[0] * CELL + CELL * .14, y: c[1] * CELL + CELL * .14, width: CELL * .72, height: CELL * .72,
        href: A(ING_IMG[ing]), opacity: gone ? .22 : 1 }, g1);
    });
  }

  // BERTHS LAST, so nothing paints over them. The berth is a water square beside the island — it
  // is where you actually sail, and it was the least visible thing on the board.
  for (const ing of G.ings) {
    const d = G.dockOf[ing], left = G.board.tokens[ing];
    const g2 = el("g", {}, svg);
    el("rect", { x: d[0] * CELL + 1, y: d[1] * CELL + 1, width: CELL - 2, height: CELL - 2, rx: 5,
      fill: "#0e4a55", "fill-opacity": .55, stroke: "#f0b429", "stroke-width": 2 }, g2);
    el("image", { x: d[0] * CELL + CELL * .12, y: d[1] * CELL + CELL * .12, width: CELL * .76, height: CELL * .76,
      href: A(DOCK_IMG) }, g2);
    // what is stocked here, on the square you sail to rather than floating over the island
    const bw = CELL * .62, bh = CELL * .40;
    el("rect", { x: d[0] * CELL + CELL - bw + 1, y: d[1] * CELL + CELL - bh, width: bw, height: bh, rx: 4,
      fill: left > 0 ? "#fff8e6" : "#8a6b33", stroke: "#0b3a44" }, g2);
    const t = el("text", { x: d[0] * CELL + CELL - bw / 2 + 1, y: d[1] * CELL + CELL - bh * .22,
      "text-anchor": "middle", "font-size": Math.max(8, CELL * .34), "font-weight": "700",
      fill: left > 0 ? "#0d3b44" : "#f0d9a0" }, g2);
    t.textContent = String(left);
  }

  // Tortuga
  const h = G.home;
  el("circle", { cx: (h[0] + .5) * CELL, cy: (h[1] + .5) * CELL, r: CELL * .48, fill: "#f0d9a0", stroke: "#8a6b33", "stroke-width": 2 }, svg);
  const ht = el("text", { x: (h[0] + .5) * CELL, y: (h[1] + .72) * CELL, "text-anchor": "middle", "font-size": CELL * .55 }, svg);
  ht.textContent = "🏝";

  // wind dots — the wind belongs on the water, not in a corner dial
  const dg = el("g", { id: "windDots" }, svg);
  dots = [];
  for (let i = 0; i < 26; i++) {
    const c = el("circle", { r: 2.2, fill: "#ffffff", "fill-opacity": .55, cx: Math.random() * CELL * n, cy: Math.random() * CELL * n }, dg);
    dots.push({ el: c, x: Math.random() * CELL * n, y: Math.random() * CELL * n, s: 0.5 + Math.random() });
  }
  if (dotTimer) clearInterval(dotTimer);
  dotTimer = setInterval(() => {
    const d = DIRS[G.windNow || "E"], lim = CELL * n;
    for (const p of dots) {
      p.x += d[0] * p.s * 1.6; p.y += d[1] * p.s * 1.6;
      if (p.x < 0) p.x = lim; if (p.x > lim) p.x = 0;
      if (p.y < 0) p.y = lim; if (p.y > lim) p.y = 0;
      p.el.setAttribute("cx", p.x); p.el.setAttribute("cy", p.y);
    }
  }, 60);

  // ships
  G.players.forEach(p => {
    if (p.done) return;
    const g2 = el("g", { id: `ship${p.idx}`, transform: `translate(${p.pos[0] * CELL},${p.pos[1] * CELL})` }, svg);
    el("circle", { cx: CELL / 2, cy: CELL / 2, r: CELL * .44, fill: HEXCOL[p.idx], "fill-opacity": .35 }, g2);
    el("image", { x: CELL * .1, y: CELL * .1, width: CELL * .8, height: CELL * .8, href: A(BOAT_IMG[p.idx % 4]) }, g2);
  });
  return svg;
}

/* THE TRADE WINDS. Four clockwise arcs around the rim, each of which carries you to its own
   clockwise-most end — the whirlpool. This was drawn as a slightly darker shade of the same water
   and nothing else, so a ship that touched the edge was teleported across the map for no stated
   reason. The arcs are the rule; they have to be legible as four separate things, each with a
   direction and a destination. */
// Four hues, none of them sea-coloured. The first attempt used two teals and they simply read as
// slightly different water — the whole point is that these squares are NOT water you can sit in.
// Which arc you are in decides where you come out, so the four have to be told apart at a glance.
const ARC_FILL = ["#7b5ea8", "#b0604a", "#44579c", "#9c5e7b"];

function arcNextMap() {
  // rimCellInfo is in ring order with an arc id on each cell, so a cell's flow direction is simply
  // the next cell of the same arc; the last of each arc is that arc's whirlpool.
  const info = G.board.rimCellInfo || [], next = new Map(), head = new Set();
  for (let i = 0; i < info.length; i++) {
    const c = info[i], n = info[i + 1];
    if (n && n.q === c.q) next.set(c.k, [n.x - c.x, n.y - c.y]); else head.add(c.k);
  }
  return { next, head, info };
}

function drawTradeWinds(svg) {
  const { next, head, info } = arcNextMap();
  if (!info.length) return;
  const g = el("g", { id: "tradeWinds" }, svg);
  for (const c of info) {
    const x = c.x * CELL, y = c.y * CELL;
    el("rect", { x, y, width: CELL, height: CELL, rx: 3,
      fill: ARC_FILL[c.q % 4], "fill-opacity": .62, stroke: "#0b3a44", "stroke-opacity": .35 }, g);
    const d = next.get(c.k);
    if (d) {
      // a chevron pointing the way the current carries you
      const cx = x + CELL / 2, cy = y + CELL / 2, s = CELL * .22;
      const ax = d[0], ay = d[1];
      const p = [[cx - ax * s + ay * s, cy - ay * s - ax * s], [cx + ax * s, cy + ay * s],
                 [cx - ax * s - ay * s, cy - ay * s + ax * s]];
      el("polyline", { points: p.map(q => q.join(",")).join(" "), fill: "none",
        stroke: "#eaf7fb", "stroke-opacity": .85, "stroke-width": Math.max(1.4, CELL * .09),
        "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    }
  }
  // the whirlpools: where each arc puts you down
  for (const c of info) {
    if (!head.has(c.k)) continue;
    const cx = (c.x + .5) * CELL, cy = (c.y + .5) * CELL;
    el("circle", { cx, cy, r: CELL * .44, fill: "#08313a", "fill-opacity": .75,
      stroke: "#f0b429", "stroke-width": 2 }, g);
    const t = el("text", { x: cx, y: cy + CELL * .22, "text-anchor": "middle",
      "font-size": CELL * .6 }, g);
    t.textContent = "🌀";
  }
}

export function highlight(cells, onPick) {
  const svg = $("boardSvg"); if (!svg) return;
  for (const c of cells) {
    const rim = G.onRim(c), to = rim ? G.rimHeadOf(c) : null;
    // A trade-wind square IS a legal move — it just does not leave you there. Rather than make the
    // player learn that the hard way, the square is marked as a current and a dashed line is drawn
    // to the whirlpool it would carry you to. Static, so it works on a phone with nothing to hover.
    if (rim && to) {
      el("line", { x1: (c[0] + .5) * CELL, y1: (c[1] + .5) * CELL,
        x2: (to[0] + .5) * CELL, y2: (to[1] + .5) * CELL, stroke: "#ffc23a", "stroke-opacity": .8,
        "stroke-width": 2, "stroke-dasharray": "4 4" }, svg);
    }
    const r = el("rect", { x: c[0] * CELL + 2, y: c[1] * CELL + 2, width: CELL - 4, height: CELL - 4, rx: 5,
      class: "sailCell", fill: rim ? "#e0553f" : "#ffc23a", "fill-opacity": rim ? .8 : .75,
      style: "cursor:pointer" }, svg);
    if (rim) el("title", {}, r).textContent = "The trade winds — this carries ye to the whirlpool";
    r.addEventListener("click", () => onPick(c));
  }
}

/* ---------------------------------------------------------------- the vane */

export function drawVane() {
  const w = $("vane"); if (!w) return;
  const ang = { N: 0, E: 90, S: 180, W: 270 };
  w.innerHTML = `
    <svg viewBox="0 0 100 100" width="96" height="96">
      <circle cx="50" cy="50" r="46" fill="#0e4a55" stroke="#c9a227" stroke-width="2"/>
      ${["N","E","S","W"].map((d,i)=>`<text x="50" y="14" transform="rotate(${i*90} 50 50)" text-anchor="middle" font-size="11" fill="#cfe9ee">${d}</text>`).join("")}
      <g transform="rotate(${ang[G.windNow]||0} 50 50)">
        <polygon points="50,20 58,56 50,50 42,56" fill="#f0b429" stroke="#7a5a10"/>
      </g>
      <g transform="rotate(${ang[G.windNext]||0} 50 50)">
        <polygon points="50,26 54,50 50,46 46,50" fill="${G.stormNext ? "#e05a4a" : "#dff3f7"}" stroke="#0b3a44"/>
      </g>
      <circle cx="50" cy="50" r="4" fill="#0b3a44" stroke="#c9a227"/>
    </svg>
    <div class="vaneKey">
      <div><b style="color:#f0b429">▮</b> now: <b>${G.windNow || "—"}</b>${G.stormNow ? " ⛈ GALE" : ""}</div>
      <div><b style="color:${G.stormNext ? "#e05a4a" : "#dff3f7"}">▮</b> next: <b>${G.windNext || "—"}</b>${G.stormNext ? " ⛈" : ""}</div>
    </div>`;
}

/* ---------------------------------------------------------------- panels */

export function drawCaptains(youSeat) {
  const box = $("captains"); if (!box) return;
  box.innerHTML = G.players.map(p => {
    const need = G.needs(p);
    const mine = p.idx === youSeat;
    const cargo = p.ing.length ? p.ing.map(i => `<img src="${A(ING_IMG[i])}" alt="${i}">`).join("") : "<i>empty hold</i>";
    return `<div class="cap${p.done ? " done" : ""}" style="border-left:5px solid ${HEXCOL[p.idx]}">
      <div class="capTop"><b>${p.name}</b> ${p.kind === "bot" ? "🤖" : ""} <span class="pw">${POWERS[p.power]?.name || ""}</span>
        <span class="coins"><img src="${A(COIN_IMG)}" alt="coins">${p.coins}</span></div>
      <div class="cargo">${cargo}</div>
      ${mine && p.recipe ? `<div class="recipe">Recipe: ${p.recipe.map(i => `<span class="${need.includes(i) ? "want" : "have"}">${ING_EMOJI[i]}</span>`).join(" ")}</div>` : ""}
    </div>`;
  }).join("");
}

let lastNarrated = 0;

// Presentation the registry needs, without the registry knowing anything about the DOM.
const ctxFor = you => ({
  you,
  name: i => `<b style="color:${HEXCOL[i]}">${G.players[i].name}</b>`,
  ing: i => `<img class="ii" src="${A(ING_IMG[i])}" alt=""> ${ING_NAME[i] || i}`,
});

/* ================= THE NARRATION CLOCK =================
   THE NARRATOR IS THE CLOCK, and it is the only clock. `drive()` awaits `narrate()` before it
   advances the generator, so the engine physically cannot get ahead of what has been said — it
   steps, says everything that piled up, and only then takes the next step. That seam already
   existed; what was wrong was that the clock ticked in tenths of a second.

   Pacing therefore lives HERE and nowhere else. drive() used to add its own sleep on top of this
   for bot steps, which meant two things decided the speed and neither one knew about the other.
   That sleep is gone: if the game feels wrong, the numbers below are the only place to look.

   BURST COMPRESSION. Most steps say one thing (mean 1.5 lines between decisions), but a trade
   outcry can emit the call, three answers and the deal with nothing to click in between — up to
   ten. At a flat 2s that is twenty seconds of watching. So a run of lines is budgeted as a whole:
   past BURST_CAP the whole run is scaled to fit, with a floor so nothing flashes past unread. The
   common case is untouched. */
const PACE = { [TIER.BEAT]: 2000, [TIER.LINE]: 2000, [TIER.TICKER]: 600 };
const BURST_CAP = 6000;    // longest a run of lines with no decision in it may take
const MIN_HOLD = 350;      // ...and no line goes by faster than this, however long the run

const SPEEDS = [{ mult: 1, label: "1×" }, { mult: 2, label: "2×" }, { mult: 0, label: "⏩" }];
let speedIdx = 0;
try { speedIdx = Math.min(SPEEDS.length - 1, Math.max(0, +localStorage.getItem("pp2_speed") | 0)); } catch (e) {}

// One shared "stop waiting" signal. Every hold registers here, so a tap releases whatever is
// currently being read without the caller needing to know a tap is even possible.
const waiters = new Set();
export function skipNow() { for (const f of [...waiters]) f(); }
function hold(ms) {
  if (ms <= 0) return Promise.resolve();
  return new Promise(res => {
    const done = () => { clearTimeout(t); waiters.delete(done); res(); };
    const t = setTimeout(done, ms);
    waiters.add(done);
  });
}

function paintSpeed() { const b = $("speedBtn"); if (b) b.textContent = SPEEDS[speedIdx].label; }
function bumpSpeed() {
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  try { localStorage.setItem("pp2_speed", String(speedIdx)); } catch (e) {}
  paintSpeed(); skipNow();
}

let wired = false;
function wirePacing() {
  if (wired) return; wired = true;
  // tapping the board or the log hurries the line along; the speed button is a session setting
  for (const sel of [".boardCard", ".logCard"]) {
    const el2 = document.querySelector(sel);
    if (el2) el2.addEventListener("click", skipNow);
  }
  const b = $("speedBtn");
  if (b) b.addEventListener("click", e => { e.stopPropagation(); bumpSpeed(); });
  paintSpeed();
}

/* -------- the line, spoken from the ship it belongs to --------------------
   The log under the board says what happened. It does not say WHERE, and on a board with four
   identical-looking ships that is most of the information. So every owned line also appears as a
   bubble pinned to that captain's ship, and the table-wide ones — a round, a gale — take the
   middle of the board. The overlay is a sibling of the SVG (drawBoard wipes its own container)
   and takes no pointer events, so it can never swallow a click on a sail square. */
function bubbleAt(seat, html, tier) {
  const layer = $("bubbles"), svg = $("boardSvg");
  if (!layer || !svg) return null;
  const p = seat === null ? null : G.players[seat];
  if (p && p.done) return null;
  const n = G.board.cfg.grid;
  const scale = (svg.getBoundingClientRect().width || CELL * n) / (CELL * n);
  const d = document.createElement("div");
  d.className = "bub " + (seat === null ? "bubAll " : "") + tier;
  d.innerHTML = html;
  if (p) {
    d.style.borderColor = HEXCOL[p.idx];
    const cx = (p.pos[0] + 0.5) * CELL * scale, cy = p.pos[1] * CELL * scale;
    const below = p.pos[1] < n / 3;                    // near the top edge? hang it underneath
    d.style.left = Math.round(cx) + "px";
    d.style.top = Math.round(below ? cy + CELL * scale : cy) + "px";
    d.classList.add(below ? "bubBelow" : "bubAbove");
  }
  layer.appendChild(d);
  return d;
}

export async function narrate(youSeat, fast) {
  wirePacing();
  const box = $("narration"), ctx = ctxFor(youSeat), layer = $("bubbles");

  // The whole run is budgeted before a word of it is shown, because how long any one line should
  // stay up depends on how many are behind it.
  const run = [];
  for (const e of G.events.slice(lastNarrated)) {
    const html = lineFor(e, ctx);
    if (html) run.push({ e, html, tier: tierOf(e) });
  }
  lastNarrated = G.events.length;
  const full = run.reduce((s, x) => s + PACE[x.tier], 0);
  const squeeze = full > BURST_CAP ? BURST_CAP / full : 1;
  const mult = SPEEDS[speedIdx].mult;

  for (const x of run) {
    const ms = (fast || mult === 0) ? 0 : Math.max(MIN_HOLD, PACE[x.tier] * squeeze) / mult;
    const d = document.createElement("div");
    d.className = "line " + x.tier;
    d.innerHTML = x.html;
    // what this line was actually given, and how many were queued with it — the pacing is the
    // thing most likely to be argued about, so it should be readable from the page itself
    d.dataset.hold = String(Math.round(ms));
    d.dataset.run = String(run.length);
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
    while (box.children.length > 60) box.removeChild(box.firstChild);

    let bub = null;
    if (ms > 0 && x.tier !== TIER.TICKER) {
      const who = ownerOf(x.e);
      // a captain's line speaks from their ship; a table-wide beat takes the whole board
      if (who !== null || x.tier === TIER.BEAT) bub = bubbleAt(who, x.html, x.tier);
      if (layer) while (layer.children.length > 3) layer.removeChild(layer.firstChild);
    }
    await hold(ms);
    if (bub) { bub.classList.add("gone"); const b = bub; setTimeout(() => b.remove(), 400); }
  }
}
export function clearBubbles() { const l = $("bubbles"); if (l) l.innerHTML = ""; }
export function resetNarration() { lastNarrated = 0; clearBubbles(); const b = $("narration"); if (b) b.innerHTML = ""; }

/* ---------------------------------------------------------------- the human resolver */

// DOM order is back → message → buttons → helper text, because the panel is revealed top to bottom
// and a thing must not appear before the thing it depends on. Standing rule, see CLAUDE.md.
export const BACK = Symbol("back");

export function ask(msg, buttons, sub, back) {
  return new Promise(res => {
    const p = $("panel");
    p.innerHTML = (back ? `<button class="apBack">‹ ${back}</button>` : "") +
      `<div class="apMsg">${msg}</div><div class="apBtns"></div>${sub ? `<div class="apSub">${sub}</div>` : ""}`;
    const done = v => { p.innerHTML = ""; res(v); };
    const bk = p.querySelector(".apBack");
    if (bk) bk.addEventListener("click", () => done(BACK));
    const row = p.querySelector(".apBtns");
    buttons.forEach(b => {
      const el2 = document.createElement("button");
      el2.className = "apBtn"; el2.innerHTML = b.label;
      if (b.color) el2.style.background = b.color;
      el2.addEventListener("click", () => done(b.value));
      row.appendChild(el2);
    });
  });
}

/* A number, not a row of guessed rungs.
   The offer menu used to be a cross-product — every crate you need times every way of paying for
   it — truncated to seven buttons, with coins capped at six. So options vanished silently and you
   could never put your purse on the table. A stepper says any number between two bounds in one
   control, and it is the same control wherever a price is named. */
export function stepper({ msg, min, max, start, sub, back, confirm }) {
  return new Promise(res => {
    const lo = Math.max(0, min | 0), hi = Math.max(lo, max | 0);
    let v = Math.min(hi, Math.max(lo, start === undefined ? lo : start | 0));
    const p = $("panel");
    p.innerHTML = (back ? `<button class="apBack">‹ ${back}</button>` : "") +
      `<div class="apMsg">${msg}</div>
       <div class="stepWrap">
         <button class="stepBtn" data-d="-1" aria-label="less">−</button>
         <div class="stepVal"><span id="stepN">${v}</span><img class="ii" src="${A(COIN_IMG)}" alt=" coins"></div>
         <button class="stepBtn" data-d="1" aria-label="more">+</button>
       </div>
       <input class="stepRange" type="range" min="${lo}" max="${hi}" value="${v}" aria-label="amount">
       <div class="apBtns">
         <button class="apBtn" data-set="${lo}">Least — ${lo}</button>
         <button class="apBtn" data-set="${hi}">All — ${hi}</button>
         <button class="apBtn stepGo">${confirm || "Call it"}</button>
       </div>${sub ? `<div class="apSub">${sub}</div>` : ""}`;
    const nEl = p.querySelector("#stepN"), range = p.querySelector(".stepRange");
    const paint = () => { nEl.textContent = v; range.value = v; };
    const set = n => { v = Math.min(hi, Math.max(lo, n)); paint(); };
    p.querySelectorAll(".stepBtn").forEach(b => b.addEventListener("click", () => set(v + (+b.dataset.d))));
    p.querySelectorAll("[data-set]").forEach(b => b.addEventListener("click", () => set(+b.dataset.set)));
    range.addEventListener("input", () => set(+range.value));
    const done = x => { p.innerHTML = ""; res(x); };
    const bk = p.querySelector(".apBack");
    if (bk) bk.addEventListener("click", () => done(BACK));
    p.querySelector(".stepGo").addEventListener("click", () => done(v));
  });
}
export function say(msg) { $("panel").innerHTML = `<div class="apMsg">${msg}</div>`; }

// The treasure flip at a berth. It always happened in the engine, but it happened silently and the
// buy prompt arrived on top of it, so a player who was told "flip for treasure, then buy" saw only
// the buy. Here it is its own beat: the coin is the button, it spins, it lands, and only then does
// anything else appear.
//
// Panel order follows the standing rule — message, then the coin, then the helper text — so the
// reveal reads top to bottom in the order it is laid out.
export function flipCoin(msg, heads, got) {
  return new Promise(res => {
    const p = $("panel");
    p.innerHTML = `<div class="apMsg">${msg}</div>
      <div class="flipWrap"><button class="flipCoin" id="ppFlip" aria-label="Flip for treasure">
        <img src="${A(FLIP_SOCKET_IMG)}" class="flipSocket" alt="">
        <img src="${A(COIN_SPIN_IMG)}" class="flipFace" id="ppFlipFace" alt="">
      </button></div>
      <div class="apSub" id="ppFlipSub">Tap the coin to dig.</div>`;
    const btn = $("ppFlip"), face = $("ppFlipFace"), sub = $("ppFlipSub");
    let spent = false;
    btn.addEventListener("click", async () => {
      if (spent) return; spent = true;
      btn.classList.add("spinning");
      await sleep(700);
      btn.classList.remove("spinning");
      face.src = A(heads ? FLIP_HEADS_IMG : FLIP_TAILS_IMG);
      sub.innerHTML = heads
        ? `<b>Heads — treasure! +${got}<img class="ii" src="${A(COIN_IMG)}" alt=" coins"></b>`
        : `Tails — nothing but sand.`;
      sub.classList.add(heads ? "flipWin" : "flipLose");
      // short, because the narration clock holds the treasure line for its full beat straight after
      await sleep(600);
      p.innerHTML = "";
      res(null);
    });
  });
}
export { ING_NAME, ING_EMOJI, ING_IMG, HEXCOL, POWERS };
