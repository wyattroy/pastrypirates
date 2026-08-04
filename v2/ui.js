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

  // playable water + the rim current, so the four arcs are visible rather than secret
  for (const key of G.board.valid) {
    const [x, y] = key.split(",").map(Number);
    const rim = G.onRim([x, y]);
    el("rect", { x: x * CELL, y: y * CELL, width: CELL, height: CELL, rx: 3,
      fill: rim ? "#2b7d8c" : "#39a4b4", "fill-opacity": rim ? .55 : .30,
      stroke: "#1d6472", "stroke-opacity": .25 }, svg);
  }

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
  const box = $("narration"), ctx = ctxFor(youSeat), layer = $("bubbles");
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

    let bub = null;
    if (!fast && tier !== TIER.TICKER) {
      const who = ownerOf(e);
      // a captain's line speaks from their ship; a table-wide beat takes the whole board
      if (who !== null || tier === TIER.BEAT) bub = bubbleAt(who, html, tier);
      if (layer) while (layer.children.length > 3) layer.removeChild(layer.firstChild);
    }
    await sleep(fast ? 0 : HOLD[tier]);
    if (bub) { bub.classList.add("gone"); const b = bub; setTimeout(() => b.remove(), 400); }
  }
  lastNarrated = G.events.length;
}
export function clearBubbles() { const l = $("bubbles"); if (l) l.innerHTML = ""; }
export function resetNarration() { lastNarrated = 0; clearBubbles(); const b = $("narration"); if (b) b.innerHTML = ""; }

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
      await sleep(1000);
      p.innerHTML = "";
      res(null);
    });
  });
}
export { ING_NAME, ING_EMOJI, ING_IMG, HEXCOL, POWERS };
