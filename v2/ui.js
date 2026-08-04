// Pastry Pirates v2 — render + input.
//
// Renders from state and events only; contains no rules. The human player is a RESOLVER: the engine
// yields a DecisionRequest, this file turns it into buttons, and the click becomes the response.
// Exactly the same seam the bots use — which is what makes "bots and humans play the same game by
// the same rules" true by construction rather than by discipline.

import { BOARD_IMG, DOCK_IMG, ING_IMG, ING_NAME, ING_EMOJI, BOAT_IMG, ISLAND_SHAPE_IMG,
         COIN_IMG, HEXCOL, iconImg } from "../src/shared/index.js";
import { DIRS, DK, K, man, POWERS } from "./engine.js";
import { narrate as lineFor, tierOf, TIER } from "./events.js";

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

  // playable water + the rim current, so the four arcs are visible rather than secret
  for (const key of G.board.valid) {
    const [x, y] = key.split(",").map(Number);
    const rim = G.onRim([x, y]);
    el("rect", { x: x * CELL, y: y * CELL, width: CELL, height: CELL, rx: 3,
      fill: rim ? "#2b7d8c" : "#39a4b4", "fill-opacity": rim ? .55 : .30,
      stroke: "#1d6472", "stroke-opacity": .25 }, svg);
  }

  // islands: the shipped art, one image per island bounding box
  for (const ing of G.ings) {
    const cells = G.board.islandRect[ing];
    const xs = cells.map(c => c[0]), ys = cells.map(c => c[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys), x1 = Math.max(...xs), y1 = Math.max(...ys);
    const meta = G.board.islandShapeMeta[ing] || {};
    const href = ISLAND_SHAPE_IMG[(meta.shapeIdx ?? 0) % ISLAND_SHAPE_IMG.length];
    for (const c of cells) el("rect", { x: c[0] * CELL, y: c[1] * CELL, width: CELL, height: CELL, rx: CELL * .3, fill: "#e8c98a" }, svg);
    el("image", { x: x0 * CELL, y: y0 * CELL, width: (x1 - x0 + 1) * CELL, height: (y1 - y0 + 1) * CELL,
      href: A(href), preserveAspectRatio: "none", opacity: .95 }, svg);
    // remaining crates, one icon per island square
    cells.slice(0, G.board.cfg.crates).forEach((c, i) => {
      const gone = i >= G.board.tokens[ing];
      el("image", { x: c[0] * CELL + CELL * .12, y: c[1] * CELL + CELL * .12, width: CELL * .76, height: CELL * .76,
        href: A(ING_IMG[ing]), opacity: gone ? .18 : 1 }, svg);
    });
    // the berth
    const d = G.dockOf[ing];
    el("image", { x: d[0] * CELL + CELL * .1, y: d[1] * CELL + CELL * .1, width: CELL * .8, height: CELL * .8, href: A(DOCK_IMG), opacity: .9 }, svg);
    const lbl = el("text", { x: (x0 + (x1 - x0 + 1) / 2) * CELL, y: y0 * CELL - 2, "text-anchor": "middle",
      "font-size": Math.max(9, CELL * .34), fill: "#0d3b44", "font-weight": "700" }, svg);
    lbl.textContent = `${ING_EMOJI[ing]} ${G.board.tokens[ing]}`;
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

export function highlight(cells, onPick) {
  const svg = $("boardSvg"); if (!svg) return;
  for (const c of cells) {
    const r = el("rect", { x: c[0] * CELL + 2, y: c[1] * CELL + 2, width: CELL - 4, height: CELL - 4, rx: 5,
      class: "sailCell", fill: "#ffc23a", "fill-opacity": .75, style: "cursor:pointer" }, svg);
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

// Tiers (PRD 6). The old build gave every line the same weight, so a turn header could not be made
// louder than a pass and nothing read at all.
const HOLD = { [TIER.BEAT]: 620, [TIER.LINE]: 260, [TIER.TICKER]: 90 };

export async function narrate(youSeat, fast) {
  const box = $("narration"), ctx = ctxFor(youSeat);
  for (const e of G.events.slice(lastNarrated)) {
    const html = lineFor(e, ctx);
    if (!html) continue;
    const tier = tierOf(e);
    const d = document.createElement("div");
    d.className = "line " + tier;
    d.innerHTML = html;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
    while (box.children.length > 60) box.removeChild(box.firstChild);
    await sleep(fast ? 0 : HOLD[tier]);
  }
  lastNarrated = G.events.length;
}
export function resetNarration() { lastNarrated = 0; const b = $("narration"); if (b) b.innerHTML = ""; }

/* ---------------------------------------------------------------- the human resolver */

export function ask(msg, buttons, sub) {
  return new Promise(res => {
    const p = $("panel");
    p.innerHTML = `<div class="apMsg">${msg}</div><div class="apBtns"></div>${sub ? `<div class="apSub">${sub}</div>` : ""}`;
    const row = p.querySelector(".apBtns");
    buttons.forEach(b => {
      const el2 = document.createElement("button");
      el2.className = "apBtn"; el2.innerHTML = b.label;
      if (b.color) el2.style.background = b.color;
      el2.addEventListener("click", () => { p.innerHTML = ""; res(b.value); });
      row.appendChild(el2);
    });
  });
}
export function say(msg) { $("panel").innerHTML = `<div class="apMsg">${msg}</div>`; }
export { ING_NAME, ING_EMOJI, ING_IMG, HEXCOL, POWERS };
