// Pastry Pirates v2 — render + input.
//
// Renders from state and events only; contains no rules. The human player is a RESOLVER: the engine
// yields a DecisionRequest, this file turns it into buttons, and the click becomes the response.
// Exactly the same seam the bots use — which is what makes "bots and humans play the same game by
// the same rules" true by construction rather than by discipline.

import { BOARD_IMG, DOCK_IMG, ING_IMG, ING_NAME, ING_EMOJI, BOAT_IMG, ISLAND_SHAPE_IMG,
         COIN_IMG, HEXCOL, iconImg } from "../src/shared/index.js";
import { DIRS, DK, K, man, POWERS } from "./engine.js";

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
export async function narrate(youSeat, fast) {
  const box = $("narration");
  for (const e of G.events.slice(lastNarrated)) {
    const line = describe(e, youSeat);
    if (!line) continue;
    const d = document.createElement("div");
    d.className = "line" + (e.t === "round" || e.t === "storm" || e.t === "cast" ? " beat" : "");
    d.innerHTML = line;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
    while (box.children.length > 40) box.removeChild(box.firstChild);
    await sleep(fast ? 0 : (e.t === "round" || e.t === "storm" || e.t === "cast" || e.t === "battle" ? 700 : 260));
  }
  lastNarrated = G.events.length;
}
export function resetNarration() { lastNarrated = 0; const b = $("narration"); if (b) b.innerHTML = ""; }

const nm = i => `<b style="color:${HEXCOL[i]}">${G.players[i].name}</b>`;
const ing = i => `<img class="ii" src="${A(ING_IMG[i])}" alt="${i}"> ${ING_NAME[i] || i}`;

function describe(e, you) {
  switch (e.t) {
    case "round": return `<span class="hdr">— Round ${e.n}: wind blows ${e.wind}${e.storm ? ", and a GALE is on us" : ""}. Next round: ${e.windNext}${e.stormNext ? " ⛈" : ""} —</span>`;
    case "storm": {
      const hits = e.moves.filter(m => m.aground).map(m => nm(m.i));
      const swept = e.moves.filter(m => m.swept).map(m => nm(m.i));
      let s = `⛈ The gale drives every ship ${e.dir}!`;
      if (swept.length) s += ` ${swept.join(" and ")} caught the current.`;
      if (hits.length) s += ` ${hits.join(" and ")} ran aground — the turn's lost to repairs.`;
      return s;
    }
    case "sail": return `⛵ ${nm(e.p)} sails${e.swept ? " — and the trade winds seize her! 🌀" : ""}`;
    case "treasure": return e.heads ? `⚪ ${nm(e.p)} digs up treasure at the dock (+${e.got}🌕)` : `⚫ ${nm(e.p)} finds nothing but sand`;
    case "buy": return `📦 ${nm(e.p)} buys ${ing(e.ing)} for ${e.cost}🌕`;
    case "broke": return `${nm(e.p)} hasn't the coin for ${ing(e.ing)} (${e.cost}🌕)`;
    case "offer": return e.sale
      ? `📣 ${nm(e.p)} cries a sale: <b>${ING_NAME[e.want]}</b> — who'll pay?`
      : `📣 ${nm(e.p)} calls out: <b>I want ${ING_NAME[e.want]}</b>, and I'll give ${e.giveIng ? ING_NAME[e.giveIng] : e.giveCoins + "🌕"}`;
    case "trade": return `🤝 ${nm(e.a)} and ${nm(e.b)} strike a deal — ${e.gave} for ${e.got}`;
    case "nodeal": return `🙅 Nobody will part with ${ING_NAME[e.want]}. ${nm(e.p)} remembers that.`;
    case "walked": return `${nm(e.p)} doesn't like the price and walks away`;
    case "battle": {
      const how = e.how === "coins" ? "on powder alone" : e.how === "flip" ? "on the flip of the bullion" : "on the lightest hold";
      const sp = e.spoil.ing ? ing(e.spoil.ing) : `${e.spoil.coins}🌕`;
      return `⚔️ ${nm(e.a)} attacks ${nm(e.d)}! (${e.ca}🌕 v ${e.cd}🌕${e.downwind ? ", downwind +1" : ""}) — ${nm(e.win)} wins ${how} and takes ${sp}`;
    }
    case "lookout": { const w = e.calls.filter(c => c.right).map(c => nm(c.seat)); return `🔭 The Lookout settles — ${w.length ? w.join(", ") + " called it (+2🌕)" : "nobody called it"}`; }
    case "cast": {
      const top = e.ladder.length ? Math.pow(2, e.ladder.length) : 1;
      const took = Object.entries(e.took).map(([i, v]) => `${nm(+i)} ${v ? "+" + v : "nothing"}`).join(" · ");
      return `🎣 ${nm(e.caller)} calls the cast! The pot climbed to ${top}. ${took}`;
    }
    case "poach": return `🎣 ${nm(e.p)} slips a line over the side alone (+${e.got}🌕)`;
    case "pass": return `${nm(e.p)} holds course`;
    case "aground": return `🛠 ${nm(e.p)} spends the turn on repairs`;
    case "bake": return `<span class="hdr">🧁 ${nm(e.p)} reaches Tortuga with a full recipe and fires the ovens!</span>`;
    case "finallap": return `<span class="hdr">🏁 Final lap — every other captain gets ONE last turn!</span>`;
    default: return null;
  }
}

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
