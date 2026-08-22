#!/usr/bin/env node
/* physical-board/generate.mjs — laser-cut Pastry Pirates, three ways.
 *
 * Emits every piece of a physical set as SVG (Rhino/Illustrator/LightBurn-ready) and DXF (R12),
 * in THREE design versions so Wyatt can pick per piece. Everything is derived from the game's own
 * numbers — 4/src/engine/index.js (15x15 grid, round sea, 40-cell clockwise trade-wind rim, home
 * at centre with four berths) and 4/src/shared/index.js (the 7 TET island footprints, the 7
 * ingredients) — not redrawn by eye.
 *
 *   node physical-board/generate.mjs                 # defaults: 20mm squares, 3mm material
 *   node physical-board/generate.mjs --cell 24 --material 3.2
 *
 * TWO LAYERS, TWO COLOURS (Wyatt, 2026-08-21): CUT is a red hairline stroke, RASTER is black fill.
 * Same names in the DXF layer table. Nothing else is in the files.
 *
 * RASTER shapes never overlap each other (every union is authored as one outline, every hole is a
 * reversed sub-path under the nonzero rule) so no laser app's fill mode can cancel a region.
 *
 * No dependencies. Pure geometry in, text out.
 */
import fs from "node:fs";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf("--" + k); return i >= 0 ? Number(argv[i + 1]) : d; };

const CELL = opt("cell", 20);          // mm per grid square
const MAT  = opt("material", 3);       // sheet thickness, mm (slot widths derive from it)
const GRID = 15;                        // engine: cfg.grid
const CC   = (GRID - 1) / 2;            // engine: centre of the round world
const CLR  = 0.4;                       // per-side clearance so a loose piece drops into a square
const PIECE = CELL - 2 * CLR;           // a one-square piece
const GAP  = 4;                         // spacing between nested parts on a sheet
const SHEET_W = opt("sheet", 300);      // wrap width for the all-pieces sheet

/* =========================================================================================
   1. Geometry core — items are {layer, piece, sub:[subpath]}; a subpath is {cmds} or {circle}
   ========================================================================================= */
const r3 = v => Math.round(v * 1000) / 1000;
const rad = d => d * Math.PI / 180;
const K = 0.5522847498; // cubic-bezier circle constant

function item(layer, sub, piece) { return { layer, sub, piece }; }
function polyCmds(pts) {
  const c = [["M", pts[0][0], pts[0][1]]];
  for (let i = 1; i < pts.length; i++) c.push(["L", pts[i][0], pts[i][1]]);
  c.push(["Z"]);
  return { cmds: c };
}
function poly(layer, pts) { return item(layer, [polyCmds(pts)]); }
function circ(layer, cx, cy, r, ccw = false) { return item(layer, [{ circle: { cx, cy, r, ccw } }]); }
function ring(layer, cx, cy, ro, ri) { return item(layer, [{ circle: { cx, cy, r: ro, ccw: false } }, { circle: { cx, cy, r: ri, ccw: true } }]); }
function rect(layer, x, y, w, h, rx = 0) {
  const pts = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  return rx ? item(layer, [roundCorners(pts, rx)]) : poly(layer, pts);
}
// regular polygon, `n` sides, circumradius r, first vertex at angle a0 (deg)
function ngon(layer, cx, cy, r, n, a0 = -90, rx = 0) {
  const pts = []; for (let i = 0; i < n; i++) { const a = rad(a0 + i * 360 / n); pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return rx ? item(layer, [roundCorners(pts, rx)]) : poly(layer, pts);
}
// ellipse as four cubics, CW in y-down space; rot in degrees
function ellipseCmds(cx, cy, rx, ry, rot = 0, ccw = false) {
  const c = [["M", rx, 0], ["C", rx, K * ry, K * rx, ry, 0, ry], ["C", -K * rx, ry, -rx, K * ry, -rx, 0], ["C", -rx, -K * ry, -K * rx, -ry, 0, -ry], ["C", K * rx, -ry, rx, -K * ry, rx, 0], ["Z"]];
  const s = Math.sin(rad(rot)), co = Math.cos(rad(rot));
  const t = ([x, y]) => [cx + x * co - y * s, cy + x * s + y * co];
  const out = { cmds: c.map(cmd => cmd[0] === "Z" ? cmd : cmd[0] === "C" ? ["C", ...t([cmd[1], cmd[2]]), ...t([cmd[3], cmd[4]]), ...t([cmd[5], cmd[6]])] : [cmd[0], ...t([cmd[1], cmd[2]])]) };
  return ccw ? reverseSub(out) : out;
}
function ellipse(layer, cx, cy, rx, ry, rot = 0, ccw = false) { return item(layer, [ellipseCmds(cx, cy, rx, ry, rot, ccw)]); }

// ---- sub-path reversal (turns an outer into a hole under nonzero) ----
function cmdsToSegs(cmds) {
  const segs = []; let cur = null, start = null;
  for (const c of cmds) {
    if (c[0] === "M") { cur = [c[1], c[2]]; start = cur; }
    else if (c[0] === "L") { segs.push({ a: cur, b: [c[1], c[2]] }); cur = [c[1], c[2]]; }
    else if (c[0] === "C") { segs.push({ a: cur, c1: [c[1], c[2]], c2: [c[3], c[4]], b: [c[5], c[6]] }); cur = [c[5], c[6]]; }
    else if (c[0] === "Z") { if (cur && start && (cur[0] !== start[0] || cur[1] !== start[1])) segs.push({ a: cur, b: start }); }
  }
  return segs;
}
function segsToCmds(segs, closed = true) {
  const c = [["M", ...segs[0].a]];
  for (const s of segs) c.push(s.c1 ? ["C", ...s.c1, ...s.c2, ...s.b] : ["L", ...s.b]);
  if (closed) c.push(["Z"]);
  return c;
}
function reverseSub(sub) {
  if (sub.circle) return { circle: { ...sub.circle, ccw: !sub.circle.ccw } };
  const segs = cmdsToSegs(sub.cmds).reverse().map(s => s.c1 ? { a: s.b, c1: s.c2, c2: s.c1, b: s.a } : { a: s.b, b: s.a });
  return { cmds: segsToCmds(segs, true) };
}
function reverseItem(it) { return { ...it, sub: it.sub.map(reverseSub) }; }
const hole = it => reverseItem(it);

// ---- corner rounding of a polygon -> cubic path ----
function roundCorners(pts, r) {
  const n = pts.length, cmds = [];
  const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l, l]; };
  for (let i = 0; i < n; i++) {
    const P = pts[(i + n - 1) % n], V = pts[i], N = pts[(i + 1) % n];
    const [ux, uy, lp] = unit(V, P), [vx, vy, ln] = unit(V, N);
    const ri = Math.min(r, lp / 2, ln / 2);
    const A = [V[0] + ux * ri, V[1] + uy * ri], B = [V[0] + vx * ri, V[1] + vy * ri];
    const c1 = [A[0] + (V[0] - A[0]) * 2 / 3, A[1] + (V[1] - A[1]) * 2 / 3];
    const c2 = [B[0] + (V[0] - B[0]) * 2 / 3, B[1] + (V[1] - B[1]) * 2 / 3];
    cmds.push(i === 0 ? ["M", ...A] : ["L", ...A]);
    cmds.push(["C", ...c1, ...c2, ...B]);
  }
  cmds.push(["Z"]);
  return { cmds };
}

// ---- affine transform: scale s, rotate rot (deg), then translate ----
function xf(items, { tx = 0, ty = 0, rot = 0, s = 1 } = {}) {
  const co = Math.cos(rad(rot)), si = Math.sin(rad(rot));
  const t = (x, y) => [tx + s * (x * co - y * si), ty + s * (x * si + y * co)];
  return items.map(it => ({
    ...it, sub: it.sub.map(sp => sp.circle
      ? { circle: { ...sp.circle, cx: t(sp.circle.cx, sp.circle.cy)[0], cy: t(sp.circle.cx, sp.circle.cy)[1], r: sp.circle.r * s } }
      : { cmds: sp.cmds.map(c => c[0] === "Z" ? c : c[0] === "C" ? ["C", ...t(c[1], c[2]), ...t(c[3], c[4]), ...t(c[5], c[6])] : [c[0], ...t(c[1], c[2])]) })
  }));
}
const tag = (items, piece) => items.map(it => ({ ...it, piece: it.piece ?? piece }));

// ---- flatten to polylines (DXF + bbox) ----
function flatten(sub, n = 8) {
  if (sub.circle) { const { cx, cy, r } = sub.circle, pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return { pts, closed: true }; }
  const pts = []; let cur = null, closed = false;
  for (const c of sub.cmds) {
    if (c[0] === "M") { cur = [c[1], c[2]]; pts.push(cur); }
    else if (c[0] === "L") { cur = [c[1], c[2]]; pts.push(cur); }
    else if (c[0] === "C") {
      const [x0, y0] = cur;
      for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([u * u * u * x0 + 3 * u * u * t * c[1] + 3 * u * t * t * c[3] + t * t * t * c[5], u * u * u * y0 + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6]]); }
      cur = [c[5], c[6]];
    } else if (c[0] === "Z") closed = true;
  }
  return { pts, closed };
}
function bbox(items) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const it of items) for (const sp of it.sub) for (const [x, y] of flatten(sp, 6).pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0 };
}

/* =========================================================================================
   2. A 5x7 block font — so titles, compass letters and rule cards need no font files at all
   ========================================================================================= */
const FONT_SRC = {
  A: ".###.|#...#|#...#|#####|#...#|#...#|#...#", B: "####.|#...#|#...#|####.|#...#|#...#|####.", C: ".####|#....|#....|#....|#....|#....|.####",
  D: "####.|#...#|#...#|#...#|#...#|#...#|####.", E: "#####|#....|#....|####.|#....|#....|#####", F: "#####|#....|#....|####.|#....|#....|#....",
  G: ".####|#....|#....|#.###|#...#|#...#|.####", H: "#...#|#...#|#...#|#####|#...#|#...#|#...#", I: "#####|..#..|..#..|..#..|..#..|..#..|#####",
  J: "..###|...#.|...#.|...#.|...#.|#..#.|.##..", K: "#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#", L: "#....|#....|#....|#....|#....|#....|#####",
  M: "#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#", N: "#...#|##..#|#.#.#|#..##|#...#|#...#|#...#", O: ".###.|#...#|#...#|#...#|#...#|#...#|.###.",
  P: "####.|#...#|#...#|####.|#....|#....|#....", Q: ".###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#", R: "####.|#...#|#...#|####.|#.#..|#..#.|#...#",
  S: ".####|#....|#....|.###.|....#|....#|####.", T: "#####|..#..|..#..|..#..|..#..|..#..|..#..", U: "#...#|#...#|#...#|#...#|#...#|#...#|.###.",
  V: "#...#|#...#|#...#|#...#|#...#|.#.#.|..#..", W: "#...#|#...#|#...#|#.#.#|#.#.#|##.##|#...#", X: "#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#",
  Y: "#...#|#...#|.#.#.|..#..|..#..|..#..|..#..", Z: "#####|....#|...#.|..#..|.#...|#....|#####",
  0: ".###.|#...#|#..##|#.#.#|##..#|#...#|.###.", 1: "..#..|.##..|..#..|..#..|..#..|..#..|.###.", 2: ".###.|#...#|....#|...#.|..#..|.#...|#####",
  3: "#####|...#.|..#..|...#.|....#|#...#|.###.", 4: "...#.|..##.|.#.#.|#..#.|#####|...#.|...#.", 5: "#####|#....|####.|....#|....#|#...#|.###.",
  6: "..##.|.#...|#....|####.|#...#|#...#|.###.", 7: "#####|....#|...#.|..#..|.#...|.#...|.#...", 8: ".###.|#...#|#...#|.###.|#...#|#...#|.###.",
  9: ".###.|#...#|#...#|.####|....#|...#.|.##..", "-": ".....|.....|.....|#####|.....|.....|.....", ".": ".....|.....|.....|.....|.....|.##..|.##..",
  ":": ".....|.##..|.##..|.....|.##..|.##..|.....", "/": "....#|....#|...#.|..#..|.#...|#....|#....", "+": ".....|..#..|..#..|#####|..#..|..#..|.....",
  "=": ".....|.....|#####|.....|#####|.....|.....", "'": ".##..|..#..|.#...|.....|.....|.....|.....", "!": "..#..|..#..|..#..|..#..|..#..|.....|..#..",
  "?": ".###.|#...#|....#|...#.|..#..|.....|..#..", "&": ".##..|#..#.|#..#.|.##..|#.#.#|#..#.|.##.#", "(": "..#..|.#...|#....|#....|#....|.#...|..#..",
  ")": "..#..|...#.|....#|....#|....#|...#.|..#..", ",": ".....|.....|.....|.....|.##..|..#..|.#...", " ": "...|...|...|...|...|...|...",
};
const FONT = {}; for (const k in FONT_SRC) FONT[k] = FONT_SRC[k].split("|");
function textWidth(str, px) { return ([...str.toUpperCase()].reduce((a, ch) => a + (FONT[ch] || FONT["?"])[0].length + 1, 0) - 1) * px; }
// pixels are emitted as one rect per horizontal run; runs in adjacent rows share an edge, never overlap
function text(layer, str, x, y, px, { align = "left", valign = "top" } = {}) {
  const w = textWidth(str, px), h = 7 * px;
  const ox = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  const oy = valign === "middle" ? y - h / 2 : valign === "bottom" ? y - h : y;
  const items = []; let col = 0;
  for (const ch of str.toUpperCase()) {
    const g = FONT[ch] || FONT["?"];
    for (let r = 0; r < 7; r++) { const row = g[r]; let c = 0; while (c < row.length) { if (row[c] === "#") { let c2 = c; while (c2 < row.length && row[c2] === "#") c2++; items.push(rect(layer, ox + (col + c) * px, oy + r * px, (c2 - c) * px, px)); c = c2; } else c++; } }
    col += g[0].length + 1;
  }
  return items;
}

/* =========================================================================================
   3. Rectilinear polygon tools — union outline of grid cells, inset/outset, notches
   ========================================================================================= */
// union outline of a set of unit cells -> array of loops (each an array of [x,y] in cell units, CW)
function traceCells(cells) {
  const key = c => c.join(",");
  const set = new Set(cells.map(key));
  const edges = new Map(); // directed edge "x1,y1>x2,y2" ; interior edges appear twice opposed and cancel
  const add = (a, b) => { const k = a.join(",") + ">" + b.join(","), rk = b.join(",") + ">" + a.join(","); if (edges.has(rk)) edges.delete(rk); else edges.set(k, [a, b]); };
  for (const [x, y] of cells) { add([x, y], [x + 1, y]); add([x + 1, y], [x + 1, y + 1]); add([x + 1, y + 1], [x, y + 1]); add([x, y + 1], [x, y]); }
  const byStart = new Map(); for (const [, [a, b]] of edges) byStart.set(a.join(","), b);
  const loops = [];
  while (byStart.size) {
    const [startK, first] = byStart.entries().next().value;
    const loop = [startK.split(",").map(Number)]; let cur = first; byStart.delete(startK);
    while (cur.join(",") !== startK) { loop.push(cur); const nxt = byStart.get(cur.join(",")); byStart.delete(cur.join(",")); cur = nxt; }
    // merge collinear runs
    const m = []; for (let i = 0; i < loop.length; i++) { const P = loop[(i + loop.length - 1) % loop.length], V = loop[i], N = loop[(i + 1) % loop.length]; if ((V[0] - P[0]) * (N[1] - V[1]) - (V[1] - P[1]) * (N[0] - V[0]) !== 0) m.push(V); }
    loops.push(m);
  }
  void set;
  return loops;
}
function signedArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
// offset outward by d (negative = inward); polygon is made CW first
function offsetPoly(ptsIn, d) {
  const pts = signedArea(ptsIn) < 0 ? [...ptsIn].reverse() : ptsIn;
  const n = pts.length, lines = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    const nx = dy / l, ny = -dx / l; // outward normal for CW in y-down
    lines.push({ a: [a[0] + nx * d, a[1] + ny * d], dx, dy });
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const L1 = lines[(i + n - 1) % n], L2 = lines[i];
    const den = L1.dx * L2.dy - L1.dy * L2.dx;
    if (Math.abs(den) < 1e-9) { out.push(L2.a); continue; }
    const t = ((L2.a[0] - L1.a[0]) * L2.dy - (L2.a[1] - L1.a[1]) * L2.dx) / den;
    out.push([L1.a[0] + L1.dx * t, L1.a[1] + L1.dy * t]);
  }
  return out;
}
// perimeter unit edges of a cell set: {m:[x,y] midpoint (cell units), inward:[nx,ny], along:[tx,ty]}
function perimeterEdges(cells) {
  const set = new Set(cells.map(c => c.join(","))), out = [];
  for (const [x, y] of cells) {
    if (!set.has(`${x},${y - 1}`)) out.push({ m: [x + .5, y], inward: [0, 1], along: [1, 0] });
    if (!set.has(`${x + 1},${y}`)) out.push({ m: [x + 1, y + .5], inward: [-1, 0], along: [0, 1] });
    if (!set.has(`${x},${y + 1}`)) out.push({ m: [x + .5, y + 1], inward: [0, -1], along: [-1, 0] });
    if (!set.has(`${x - 1},${y}`)) out.push({ m: [x, y + .5], inward: [1, 0], along: [0, -1] });
  }
  return out;
}
// insert a notch (list of points, in order) into the straight segment of `cmds` that contains `m`
function insertNotch(cmds, m, notchPts) {
  for (let i = 1; i < cmds.length; i++) {
    const c = cmds[i]; if (c[0] !== "L") continue;
    const prev = cmds[i - 1], a = prev[0] === "C" ? [prev[5], prev[6]] : [prev[1], prev[2]], b = [c[1], c[2]];
    const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
    const t = ((m[0] - a[0]) * dx + (m[1] - a[1]) * dy) / l2;
    const px = a[0] + dx * t, py = a[1] + dy * t;
    if (t > 0.02 && t < 0.98 && Math.hypot(px - m[0], py - m[1]) < 0.05) {
      cmds.splice(i, 0, ...notchPts.map(p => ["L", p[0], p[1]]));
      return true;
    }
  }
  return false;
}
// jigsaw-nub outline points, from A (before) to B (after) along the edge; dir = +1 into the piece (socket) or -1 outward (nub)
function mushroomPts(m, along, inward, { hw, nd, r }, dir) {
  const n = [inward[0] * dir, inward[1] * dir], t = along;
  const P = (x, d) => [m[0] + t[0] * x + n[0] * d, m[1] + t[1] * x + n[1] * d];
  const dj = nd + r - Math.sqrt(r * r - hw * hw), phi = Math.asin(hw / r), pts = [P(-hw, 0), P(-hw, dj)];
  const steps = 18;
  for (let i = 1; i < steps; i++) { const f = -phi - (2 * Math.PI - 2 * phi) * i / steps; pts.push(P(r * Math.sin(f), nd + r - r * Math.cos(f))); }
  pts.push(P(hw, dj), P(hw, 0));
  return pts;
}
function slotPts(m, along, inward, { hw, depth }, dir) {
  const n = [inward[0] * dir, inward[1] * dir], t = along;
  const P = (x, d) => [m[0] + t[0] * x + n[0] * d, m[1] + t[1] * x + n[1] * d];
  return [P(-hw, 0), P(-hw, depth), P(hw, depth), P(hw, 0)];
}

/* =========================================================================================
   4. The world, straight from the engine (Game constructor, 4/src/engine/index.js)
   ========================================================================================= */
function seaCells() {
  const r2 = (CC + 0.4) * (CC + 0.4), valid = new Set(), rim = new Set();
  for (let x = 0; x < GRID; x++) for (let y = 0; y < GRID; y++) if ((x - CC) ** 2 + (y - CC) ** 2 <= r2) valid.add(x + "," + y);
  const DIRS = [[0, -1], [0, 1], [1, 0], [-1, 0]];
  for (const k of valid) { const [x, y] = k.split(",").map(Number); for (const d of DIRS) { const ox = x + d[0], oy = y + d[1]; if (ox < 0 || oy < 0 || ox >= GRID || oy >= GRID || !valid.has(ox + "," + oy)) { rim.add(k); break; } } }
  return { valid, rim, DIRS };
}
const TET = [[[0, 0], [1, 0], [2, 0]], [[0, 0], [1, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [1, 1]]];
const ING = ["wheat", "dairy", "sugar", "eggs", "cocoa", "spice", "vanilla"];
const ING_NAME = { wheat: "TOASTY WHEAT", dairy: "FRESH MILK", sugar: "CRYSTAL SUGAR", eggs: "SPECKLED EGGS", cocoa: "CACAO PODS", vanilla: "VANILLA BEANS", spice: "HOT CINNAMON" };
const CAPTAINS = ["CRUMBLE", "BISCOTTI", "GINGERSNAP", "SHORTBREAD"]; // pink, teal, green, orange in the app

/* =========================================================================================
   5. Icons — each authored in a 100x100 box, RASTER, outer outlines CW and holes CCW
   ========================================================================================= */
const RA = "RASTER", CU = "CUT";
const ICONS = {
  // a single wheat ear: grains up both sides of a stem, matching assets/ingredients/wheat.png
  wheat() {
    const it = [];
    it.push(poly(RA, [[48.5, 77], [51.5, 77], [52.5, 98], [47.5, 98]]));
    it.push(ellipse(RA, 50, 11, 5, 8.5, 0));
    for (const y of [28, 47, 66]) { it.push(ellipse(RA, 42, y, 5.5, 9.5, -30)); it.push(ellipse(RA, 58, y, 5.5, 9.5, 30)); }
    return it;
  },
  // milk bottle, label left as an unengraved band
  dairy() {
    const body = { cmds: [["M", 38, 30], ["L", 62, 30], ["C", 62, 36, 73, 38, 73, 48], ["L", 73, 86], ["C", 73, 94, 66, 96, 50, 96], ["C", 34, 96, 27, 94, 27, 86], ["L", 27, 48], ["C", 27, 38, 38, 36, 38, 30], ["Z"]] };
    const label = reverseSub(polyCmds([[31, 56], [69, 56], [69, 70], [31, 70]]));
    return [item(RA, [body, label]), rect(RA, 36, 12, 28, 8, 2), rect(RA, 38, 21, 24, 7)];
  },
  // two sugar cubes: three faces each, separated by a hairline of wood
  sugar() {
    const cube = (cx, cy, s) => {
      const h = s * 0.5, g = 1.4; // g = gap between faces
      const T = [cx, cy - s], Rr = [cx + s * 0.87, cy - h], B = [cx, cy], L = [cx - s * 0.87, cy - h];
      const Bt = [cx, cy + s], Rb = [cx + s * 0.87, cy + h], Lb = [cx - s * 0.87, cy + h];
      const sh = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
      return [poly(RA, sh([T, Rr, B, L], 0, -g)), poly(RA, sh([L, B, Bt, Lb], -g * .87, g * .5)), poly(RA, sh([B, Rr, Rb, Bt], g * .87, g * .5))];
    };
    return [...cube(36, 44, 20), ...cube(66, 64, 15)];
  },
  // one speckled egg; speckles are holes
  eggs() {
    const egg = { cmds: [["M", 50, 6], ["C", 68, 6, 82, 36, 82, 60], ["C", 82, 80, 68, 95, 50, 95], ["C", 32, 95, 18, 80, 18, 60], ["C", 18, 36, 32, 6, 50, 6], ["Z"]] };
    const sp = [[40, 32, 3.2], [58, 44, 4], [36, 60, 3.5], [60, 72, 3], [46, 82, 2.5], [64, 24, 2.2]].map(([x, y, r]) => ({ circle: { cx: x, cy: y, r, ccw: true } }));
    return [item(RA, [egg, ...sp])];
  },
  // a chocolate bar: two columns, three rows of squares
  cocoa() {
    const it = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) it.push(rect(RA, 24 + c * 28, 10 + r * 28, 24, 24, 3));
    return it;
  },
  // three cinnamon sticks, rolled — the curl is a slit left unengraved at each end
  spice() {
    const stick = (cx) => {
      const outer = roundCorners([[cx - 7, 10], [cx + 7, 10], [cx + 7, 90], [cx - 7, 90]], 4);
      const slits = [[cx - 3, 14, 6, 4], [cx - 3, 82, 6, 4]].map(([x, y, w, h]) => reverseSub(polyCmds([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])));
      return item(RA, [outer, ...slits]);
    };
    return xf(xf([stick(32), stick(50), stick(68)], { tx: -50, ty: -50 }), { rot: -30, tx: 50, ty: 50 });
  },
  // vanilla flower: five petals round a centre
  vanilla() {
    const it = [];
    for (let i = 0; i < 5; i++) { const a = -90 + i * 72, cx = 50 + 30 * Math.cos(rad(a)), cy = 50 + 30 * Math.sin(rad(a)); it.push(ellipse(RA, cx, cy, 12, 19, a + 90)); }
    it.push(circ(RA, 50, 50, 9));
    return it;
  },
  // anchor (home + docks): ring above, one outline for shaft, stock and flukes
  anchor() {
    const body = { cmds: [["M", 46, 26], ["L", 54, 26], ["L", 54, 36], ["L", 72, 36], ["L", 72, 42], ["L", 54, 42], ["L", 54, 70], ["C", 60, 72, 68, 68, 72, 60], ["L", 82, 68], ["C", 78, 84, 64, 96, 50, 96], ["C", 36, 96, 22, 84, 18, 68], ["L", 28, 60], ["C", 32, 68, 40, 72, 46, 70], ["L", 46, 42], ["L", 28, 42], ["L", 28, 36], ["L", 46, 36], ["Z"]] };
    return [ring(RA, 50, 14, 9, 5), item(RA, [body])];
  },
  // palm tree for island pieces
  palm() {
    const trunk = { cmds: [["M", 44, 96], ["C", 46, 80, 50, 62, 58, 48], ["L", 63, 50], ["C", 56, 64, 53, 80, 52, 96], ["Z"]] };
    const it = [item(RA, [trunk])];
    it.push(circ(RA, 62, 42, 4));
    for (const a of [-160, -110, -60, -10, 40]) { const cx = 62 + 19 * Math.cos(rad(a)), cy = 42 + 19 * Math.sin(rad(a)); it.push(ellipse(RA, cx, cy, 14, 5, a)); }
    return it;
  },
  // storm cloud (one outline) with a bolt beneath
  cloud() {
    const c = { cmds: [["M", 22, 62], ["C", 8, 62, 8, 46, 22, 44], ["C", 20, 32, 40, 26, 48, 36], ["C", 54, 22, 78, 26, 76, 40], ["C", 90, 40, 92, 62, 78, 62], ["Z"]] };
    return [item(RA, [c]), poly(RA, [[54, 64], [60, 64], [52, 76], [60, 76], [44, 96], [50, 78], [42, 78]])];
  },
  cloudOnly() { return [ICONS.cloud()[0]]; },
  // ship's wheel: rim, hub, eight spokes, eight handles — nothing overlaps
  wheel() {
    const it = [ring(RA, 50, 50, 40, 34), circ(RA, 50, 50, 8)];
    for (let i = 0; i < 8; i++) { const a = i * 45; it.push(...xf([rect(RA, 9.5, -2, 23.5, 4)], { tx: 50, ty: 50, rot: a })); it.push(...xf([rect(RA, 41, -2.5, 9, 5, 2)], { tx: 50, ty: 50, rot: a })); }
    return it;
  },
  // pier: deck with plank slits, two bollards; the island lies to +x
  pier() {
    const deck = roundCorners([[30, 30], [98, 30], [98, 70], [30, 70]], 3);
    const slits = [44, 56, 68, 80, 92].map(x => reverseSub(polyCmds([[x - 1.2, 33], [x + 1.2, 33], [x + 1.2, 67], [x - 1.2, 67]])));
    return [item(RA, [deck, ...slits]), circ(RA, 24, 22, 5), circ(RA, 24, 78, 5)];
  },
  // an eight-point compass rose
  rose() {
    const pts = []; for (let k = 0; k < 8; k++) { const a = k * 45, rr = k % 2 ? 24 : 46; pts.push([50 + rr * Math.cos(rad(a - 90)), 50 + rr * Math.sin(rad(a - 90))]); const b = a + 22.5; pts.push([50 + 9 * Math.cos(rad(b - 90)), 50 + 9 * Math.sin(rad(b - 90))]); }
    return [poly(RA, pts), ring(RA, 50, 50, 49.5, 48)];
  },
  // a little sloop, side on, for flat tokens
  boat() {
    return [poly(RA, [[10, 62], [90, 62], [80, 80], [20, 80]]), rect(RA, 48, 10, 4, 50), poly(RA, [[54, 14], [86, 56], [54, 56]]), poly(RA, [[46, 24], [46, 56], [22, 56]])];
  },
};
// place an icon: centre (cx,cy), size = the 100-box scaled to `size` mm, optional rotation
function icon(name, cx, cy, size, rot = 0) { return xf(xf(ICONS[name](), { tx: -50, ty: -50 }), { s: size / 100, rot, tx: cx, ty: cy }); }

/* =========================================================================================
   6. Token framings per version — crates, island markers and recipe icons share one style
   ========================================================================================= */
// inverted badge: a filled disc with the icon knocked out (every icon sub-path reversed)
function badge(name, cx, cy, d) {
  const disc = circ(RA, cx, cy, d / 2);
  const ic = icon(name, cx, cy, d * 0.66).map(reverseItem);
  return [{ ...disc, sub: [...disc.sub, ...ic.flatMap(i => i.sub)] }];
}
const TOKEN = {
  v1: { // square crate: rounded square, lid-edge band, icon
    crate(name, cx, cy) { const s = CELL * 0.56; return [rect(CU, cx - s / 2, cy - s / 2, s, s, 1.5), ...frameBand(cx, cy, s - 1.6, s - 1.6, 0.5, 1.2), ...icon(name, cx, cy, s * 0.62)]; },
    marker(name, cx, cy) { const d = CELL * 0.74; return [circ(CU, cx, cy, d / 2), ring(RA, cx, cy, d / 2 - 0.8, d / 2 - 1.4), ...icon(name, cx, cy, d * 0.6)]; },
    recipeIcon(name, cx, cy, d) { return icon(name, cx, cy, d); },
  },
  v2: { // round token, inverted badge
    crate(name, cx, cy) { const d = CELL * 0.6; return [circ(CU, cx, cy, d / 2), ...badge(name, cx, cy, d - 1.6)]; },
    marker(name, cx, cy) { const d = CELL * 0.78; return [circ(CU, cx, cy, d / 2), ring(RA, cx, cy, d / 2 - 0.6, d / 2 - 1.1), ...badge(name, cx, cy, d - 3.6)]; },
    recipeIcon(name, cx, cy, d) { return badge(name, cx, cy, d); },
  },
  v3: { // hexagon
    crate(name, cx, cy) { const r = CELL * 0.33; return [ngon(CU, cx, cy, r, 6, -90, 0.8), ...icon(name, cx, cy, r * 1.2)]; },
    marker(name, cx, cy) { const r = CELL * 0.43; return [ngon(CU, cx, cy, r, 6, -90, 1), hexRing(cx, cy, r - 0.9, 0.6), ...icon(name, cx, cy, r * 1.15)]; },
    recipeIcon(name, cx, cy, d) { return [hexRing(cx, cy, d / 2 + 1.2, 0.5), ...icon(name, cx, cy, d)]; },
  },
};
function frameBand(cx, cy, w, h, t, rx) { // a rectangular band of thickness t (RASTER)
  const o = roundCorners([[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]], rx);
  const i = reverseSub(roundCorners([[cx - w / 2 + t, cy - h / 2 + t], [cx + w / 2 - t, cy - h / 2 + t], [cx + w / 2 - t, cy + h / 2 - t], [cx - w / 2 + t, cy + h / 2 - t]], Math.max(0.2, rx - t)));
  return [item(RA, [o, i])];
}
function hexRing(cx, cy, r, t) { return item(RA, [ngon(RA, cx, cy, r, 6).sub[0], reverseSub(ngon(RA, cx, cy, r - t, 6).sub[0])]); }

/* =========================================================================================
   7. The pieces
   ========================================================================================= */
const gridLines = (valid) => { // unique cell edges as thin rects; verticals shortened so nothing overlaps
  const t = 0.35, out = [], H = new Set(), V = new Set();
  for (const k of valid) { const [x, y] = k.split(",").map(Number); H.add(`${x},${y}`); H.add(`${x},${y + 1}`); V.add(`${x},${y}`); V.add(`${x + 1},${y}`); }
  for (const k of H) { const [x, y] = k.split(",").map(Number); out.push(rect(RA, x * CELL - t / 2, y * CELL - t / 2, CELL + t, t)); }
  for (const k of V) { const [x, y] = k.split(",").map(Number); out.push(rect(RA, x * CELL - t / 2, y * CELL + t / 2, t, CELL - t)); }
  return out;
};

// the trade-wind current, one mark per rim square, tangent to the ring, clockwise — exactly
// buildRimFlow()'s rotate(deg+90) in 4/src/ui/board.js
function rimMarks(rim, style) {
  const out = [], C = CC * CELL + CELL / 2;
  for (const k of rim) {
    const [x, y] = k.split(",").map(Number), cx = (x + .5) * CELL, cy = (y + .5) * CELL;
    const deg = Math.atan2(cy - C, cx - C) * 180 / Math.PI, rr = Math.hypot(cx - C, cy - C);
    if (style === "arrow") {
      const L = CELL * .62, w = CELL * .13, hw = CELL * .36, hl = CELL * .26;
      out.push(...xf([poly(RA, [[-L / 2, -w / 2], [L / 2 - hl, -w / 2], [L / 2 - hl, -hw / 2], [L / 2, 0], [L / 2 - hl, hw / 2], [L / 2 - hl, w / 2], [-L / 2, w / 2]])], { tx: cx, ty: cy, rot: deg + 90 }));
    } else if (style === "chevron") {
      const a = CELL * .2, t = CELL * .11;
      const chev = (ox) => poly(RA, [[ox - a, -a], [ox - a + t, -a], [ox + t, 0], [ox - a + t, a], [ox - a, a], [ox, 0]]);
      out.push(...xf([chev(-CELL * .1), chev(CELL * .16)], { tx: cx, ty: cy, rot: deg + 90 }));
    } else { // curved: an arc of the ring itself with a head at its clockwise end
      const half = (CELL * .3) / rr, w = CELL * .12, hw = CELL * .34, hl = CELL * .24, a0 = rad(deg) - half, a1 = rad(deg) + half, pts = [];
      const P = (a, r) => [C + r * Math.cos(a), C + r * Math.sin(a)];
      for (let i = 0; i <= 8; i++) pts.push(P(a0 + (a1 - a0) * i / 8, rr - w / 2));
      pts.push(P(a1, rr - hw / 2), P(a1 + hl / rr, rr), P(a1, rr + hw / 2));
      for (let i = 8; i >= 0; i--) pts.push(P(a0 + (a1 - a0) * i / 8, rr + w / 2));
      out.push(poly(RA, pts));
    }
  }
  return out;
}

function homeMarks(DIRS) {
  const hx = CC, hy = CC, out = [];
  // Isle of Tortuga: sand edge band, anchor, name
  out.push(...frameBand((hx + .5) * CELL, (hy + .5) * CELL, CELL - 3, CELL - 3, 0.7, CELL * .25));
  out.push(...icon("anchor", (hx + .5) * CELL, (hy + .38) * CELL, CELL * .44));
  out.push(...text(RA, "TORTUGA", (hx + .5) * CELL, (hy + .5) * CELL + CELL * .11, CELL * .019, { align: "center", valign: "top" }));
  // four berths, each pier facing back toward the island (dockOrient([-d]))
  for (const d of DIRS) { const cx = (hx + d[0] + .5) * CELL, cy = (hy + d[1] + .5) * CELL, rot = Math.atan2(-d[1], -d[0]) * 180 / Math.PI; out.push(...icon("pier", cx, cy, CELL * .82, rot)); }
  return out;
}

function spinnerDial(style, R, cx, cy, { onBoard = false } = {}) {
  const it = [];
  if (!onBoard) it.push(circ(CU, cx, cy, R));
  it.push(circ(CU, cx, cy, 1.65)); // pivot, M3 bolt or brass fastener
  it.push(ring(RA, cx, cy, R - 1, R - 2.4));
  it.push(ring(RA, cx, cy, 5.5, 4.5));
  const divider = (a, r0, r1, w) => xf([rect(RA, r0, -w / 2, r1 - r0, w)], { tx: cx, ty: cy, rot: a });
  const wedge = (a0, a1, r0, r1) => { const pts = []; for (let i = 0; i <= 10; i++) pts.push([cx + r1 * Math.cos(rad(a0 + (a1 - a0) * i / 10)), cy + r1 * Math.sin(rad(a0 + (a1 - a0) * i / 10))]); for (let i = 10; i >= 0; i--) pts.push([cx + r0 * Math.cos(rad(a0 + (a1 - a0) * i / 10)), cy + r0 * Math.sin(rad(a0 + (a1 - a0) * i / 10))]); return poly(RA, pts); };
  const stormWedge = (a0, a1) => { const w = wedge(a0, a1, R * .33, R * .86), am = rad((a0 + a1) / 2), rm = R * .6; const cl = icon("cloudOnly", cx + rm * Math.cos(am), cy + rm * Math.sin(am), R * .2).map(reverseItem); return [{ ...w, sub: [...w.sub, ...cl.flatMap(i => i.sub)] }]; };
  const letters = (rr, px) => [["N", -90], ["E", 0], ["S", 90], ["W", 180]].forEach(([L, a]) => it.push(...text(RA, L, cx + rr * Math.cos(rad(a)), cy + rr * Math.sin(rad(a)), px, { align: "center", valign: "middle" })));
  if (style === "quadrants" || style === "quadrants-storm") {
    for (const a of [45, 135, 225, 315]) it.push(...divider(a, R * .3, R * .86, 1));
    letters(R * .6, R * .033);
    if (style === "quadrants-storm") for (const q of [-45, 45, 135, 225]) it.push(...stormWedge(q + 72, q + 90)); // last 18° of each quadrant = 20%
  } else if (style === "roulette") {
    for (let i = 0; i < 20; i++) { const a = -45 + i * 18, bold = i % 5 === 0; it.push(...divider(a, bold ? R * .3 : R * .45, R * .86, bold ? 1.2 : 0.5)); }
    for (let q = 0; q < 4; q++) it.push(...stormWedge(-45 + q * 90 + 72, -45 + q * 90 + 90));
    letters(R * .58, R * .03);
  }
  return it;
}
// a five-sector spinner, one sector a storm — the app's 20% per round
function stormDial(R) {
  const it = [circ(CU, 0, 0, R), circ(CU, 0, 0, 1.65), ring(RA, 0, 0, R - 1, R - 2.2), ring(RA, 0, 0, 4.5, 3.6)];
  for (let i = 0; i < 5; i++) it.push(...xf([rect(RA, R * .28, -.4, R * .55, .8)], { rot: -90 + i * 72 }));
  const a0 = -90 + 4 * 72 + 4, a1 = -90 + 360 - 4, pts = [];
  for (let i = 0; i <= 10; i++) pts.push([R * .8 * Math.cos(rad(a0 + (a1 - a0) * i / 10)), R * .8 * Math.sin(rad(a0 + (a1 - a0) * i / 10))]);
  for (let i = 10; i >= 0; i--) pts.push([R * .34 * Math.cos(rad(a0 + (a1 - a0) * i / 10)), R * .34 * Math.sin(rad(a0 + (a1 - a0) * i / 10))]);
  const wedge = poly(RA, pts), am = rad((a0 + a1) / 2), cl = icon("cloudOnly", R * .57 * Math.cos(am), R * .57 * Math.sin(am), R * .3).map(reverseItem);
  it.push({ ...wedge, sub: [...wedge.sub, ...cl.flatMap(i => i.sub)] });
  return it;
}
function spinnerArrows(cx, cy) { // current (bold, "NOW") and forecast (hollow) on the same pivot
  const cur = poly(CU, [[-12, -3], [19, -3], [19, -8], [30, 0], [19, 8], [19, 3], [-12, 3], [-8, 0]]);
  const now = [cur, circ(CU, 0, 0, 1.65), ...text(RA, "NOW", 5, 0, 0.72, { align: "center", valign: "middle" })];
  const fo = item(CU, [polyCmds([[-10, -3.2], [14, -3.2], [14, -8], [24, 0], [14, 8], [14, 3.2], [-10, 3.2]])]);
  const foIn = item(RA, [polyCmds([[-10, -3.2], [14, -3.2], [14, -8], [24, 0], [14, 8], [14, 3.2], [-10, 3.2]]), reverseSub(polyCmds([[-8.6, -1.8], [12.6, -1.8], [12.6, -4.6], [20.6, 0], [12.6, 4.6], [12.6, 1.8], [-8.6, 1.8]]))]);
  const next = [fo, foIn, circ(CU, 0, 0, 1.65)];
  const washer = [circ(CU, 0, 0, 4.5), circ(CU, 0, 0, 1.65)];
  return { now: xf(now, { tx: cx, ty: cy }), next: xf(next, { tx: cx + 50, ty: cy }), washers: [xf(washer, { tx: cx + 90, ty: cy }), xf(washer, { tx: cx + 102, ty: cy })] };
}

function shipStanding(kind, captain) {
  const it = [];
  const pat = captain; // 0 plain disc, 1 stripes, 2 dots, 3 checks
  if (kind === "sloop") {
    it.push(poly(CU, [[0, 12], [8, 12], [8, 0], [9.2, 0], [9.2, 1], [16, 11], [9.2, 11], [9.2, 12], [17, 12], [15, 17], [11, 17], [11, 17 + MAT - .1], [5, 17 + MAT - .1], [5, 17], [2, 17]]));
    it.push(rect(RA, 1.5, 13.5, 14.5, 0.6), rect(RA, 2.5, 15.2, 12, 0.6));
    it.push(...sailPattern(pat, [[10.2, 3.6], [14.2, 10], [10.2, 10]]));
  } else {
    it.push(poly(CU, [[0, 13], [7.5, 13], [7.5, 0], [8.7, 0], [8.7, 1], [15, 1], [15, 6], [8.7, 6], [8.7, 7.5], [15, 7.5], [15, 12], [8.7, 12], [8.7, 13], [18, 13], [16, 18], [11, 18], [11, 18 + MAT - .1], [5, 18 + MAT - .1], [5, 18], [2, 18]]));
    it.push(rect(RA, 1.5, 14.5, 15.5, 0.6), rect(RA, 2.5, 16.2, 13, 0.6));
    it.push(...sailPattern(pat, [[9.6, 1.9], [14.1, 1.9], [14.1, 5.1], [9.6, 5.1]]), ...sailPattern(pat, [[9.6, 8.4], [14.1, 8.4], [14.1, 11.1], [9.6, 11.1]]));
  }
  const base = [rect(CU, 0, 0, 18, 9, 2), rect(CU, 9 - (MAT + .15) / 2, 1.4, MAT + .15, 6.2)];
  return { profile: it, base };
}
// four captains told apart in black and white: 0 plain, 1 stripes, 2 dots, 3 checks — kept inside the sail polygon
function sailPattern(pat, polyPts) {
  const b = bbox([poly(RA, polyPts)]), out = [];
  const inside = (x, y) => { let c = false; for (let i = 0, j = polyPts.length - 1; i < polyPts.length; j = i++) { const [xi, yi] = polyPts[i], [xj, yj] = polyPts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const cell = 1.1;
  for (let y = b.y0 + .4; y < b.y1 - .4; y += cell) for (let x = b.x0 + .4; x < b.x1 - .4; x += cell) {
    const cx = x + cell / 2, cy = y + cell / 2; if (!inside(cx - .45, cy - .45) || !inside(cx + .45, cy + .45) || !inside(cx + .45, cy - .45) || !inside(cx - .45, cy + .45)) continue;
    const ix = Math.round((x - b.x0) / cell), iy = Math.round((y - b.y0) / cell);
    if (pat === 0) continue;
    if (pat === 1 && iy % 2) continue;
    if (pat === 2) { out.push(circ(RA, cx, cy, .32)); continue; }
    if (pat === 3 && (ix + iy) % 2) continue;
    out.push(rect(RA, x + .1, y + .1, cell - .2, cell - .2));
  }
  if (pat === 0) { const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; out.push(circ(RA, cx, cy, Math.min(b.w, b.h) * .18)); }
  return out;
}

function whirlpool(style, cx, cy) {
  const s = PIECE, it = [rect(CU, cx - s / 2, cy - s / 2, s, s, 2)], Rmax = s * .42;
  const spiral = (turns, w, a0) => { const b = (Rmax - a0 - w / 2) / (turns * Math.PI * 2), n = Math.round(turns * 40), pts = [], P = (th, r) => [cx + r * Math.cos(th), cy + r * Math.sin(th)]; for (let i = 0; i <= n; i++) { const th = i / n * turns * Math.PI * 2; pts.push(P(th, a0 + b * th + w / 2)); } for (let i = n; i >= 0; i--) { const th = i / n * turns * Math.PI * 2; pts.push(P(th, Math.max(0.05, a0 + b * th - w / 2))); } return poly(RA, pts); };
  if (style === "spiral") it.push(spiral(2.5, 1.1, 1.0));
  else if (style === "rings") { for (const [r, a] of [[Rmax, 20], [Rmax * .66, 160], [Rmax * .33, 300]]) { const pts = [], w = 1.1; for (let i = 0; i <= 24; i++) pts.push([cx + (r + w / 2) * Math.cos(rad(a + i * 11.25)), cy + (r + w / 2) * Math.sin(rad(a + i * 11.25))]); for (let i = 24; i >= 0; i--) pts.push([cx + (r - w / 2) * Math.cos(rad(a + i * 11.25)), cy + (r - w / 2) * Math.sin(rad(a + i * 11.25))]); it.push(poly(RA, pts)); } it.push(circ(RA, cx, cy, 1.1)); }
  else { it.push(spiral(2, 1.7, 2.2), circ(RA, cx, cy, 1.6)); }
  return it;
}

function islandPiece(v, shapeIdx) {
  const cells = TET[shapeIdx], loop = traceCells(cells)[0].map(([x, y]) => [x * CELL, y * CELL]);
  const inset = offsetPoly(loop, -CLR);
  const outline = roundCorners(inset, 3);
  const edges = perimeterEdges(cells).map(e => ({ ...e, m: [e.m[0] * CELL + e.inward[0] * CLR, e.m[1] * CELL + e.inward[1] * CLR] }));
  if (v === "v2") for (const e of edges) insertNotch(outline.cmds, e.m, mushroomPts(e.m, e.along, e.inward, JIG.socket, +1));
  if (v === "v3") for (const e of edges) insertNotch(outline.cmds, e.m, slotPts(e.m, e.along, e.inward, SLOT.slot, +1));
  const it = [item(CU, [outline])];
  // shoreline: a 1mm band inset from the edge
  it.push(item(RA, [roundCorners(offsetPoly(loop, -(CLR + 1.6)), 2), reverseSub(roundCorners(offsetPoly(loop, -(CLR + 2.6)), 1.2))]));
  // a palm on the most-connected cell
  const set = new Set(cells.map(c => c.join(","))), nb = c => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => set.has(`${c[0] + d[0]},${c[1] + d[1]}`)).length;
  const best = cells.reduce((a, c) => nb(c) > nb(a) ? c : a, cells[0]);
  it.push(...icon("palm", (best[0] + .5) * CELL, (best[1] + .5) * CELL, CELL * .62));
  return it;
}
const JIG = { nub: { hw: 1.5, nd: 1.4, r: 2.3 }, socket: { hw: 1.65, nd: 1.4, r: 2.45 } };
const SLOT = { slot: { hw: (MAT + .3) / 2, depth: 4.5 } };

function dockPiece(v, ing) {
  const s = PIECE, pts = [[0, 0], [s, 0], [s, s], [0, s]], outline = roundCorners(pts, 2);
  const m = [s, s / 2], along = [0, 1], inward = [-1, 0];
  if (v === "v2") insertNotch(outline.cmds, m, mushroomPts(m, along, inward, JIG.nub, -1));
  if (v === "v3") insertNotch(outline.cmds, m, slotPts(m, along, inward, SLOT.slot, +1));
  const it = [item(CU, [outline])];
  if (v === "v1") it.push(...icon("anchor", s * .5, s * .42, s * .42), ...text(RA, "DOCK", s * .5, s * .85, s * .03, { align: "center", valign: "middle" }));
  else it.push(...icon("pier", s * .5, s * .5, s * .84));
  const extra = [];
  if (v === "v1") { // pier top piece: glued on, overhangs onto the island by OVER
    const w = s * .44, over = CELL * .34, L = s * .6 + over;
    const deck = roundCorners([[0, 0], [L, 0], [L, w], [0, w]], 1.5);
    extra.push(item(CU, [deck]));
    for (let x = 3; x < L - 2; x += 3.2) extra.push(rect(RA, x - .4, 1.2, .8, w - 2.4));
  }
  if (v === "v3") { // mooring post: stands in the joined slots, MAT thick
    const L = SLOT.slot.depth * 2 - .4, H = MAT + 6;
    extra.push(item(CU, [roundCorners([[0, 0], [L, 0], [L, H], [0, H]], 1.2)]), rect(RA, L * .3, 1.2, L * .4, 1.2));
  }
  return { dock: it, extra };
}

function recipeCards(v) {
  // every 5-of-7 recipe there is: 21 cards, no duplicates, no blanks
  const combos = []; const rec = (s, i) => { if (s.length === 5) { combos.push([...s]); return; } for (let j = i; j < 7; j++) { s.push(ING[j]); rec(s, j + 1); s.pop(); } }; rec([], 0);
  const W = 64, H = 38, cards = [];
  combos.forEach((c, n) => {
    const it = [rect(CU, 0, 0, W, H, 3)];
    if (v === "v1") it.push(...frameBand(W / 2, H / 2, W - 3, H - 3, 0.5, 2));
    it.push(...text(RA, "RECIPE", 4, 3.5, 0.8), ...text(RA, String(n + 1), W - 4, H - 3.5, 0.7, { align: "right", valign: "bottom" }));
    c.forEach((ing, i) => it.push(...TOKEN[v].recipeIcon(ing, 9 + i * 11.5, 22, 9)));
    cards.push(it);
  });
  return cards;
}

function referenceCard() {
  const lines = ["SAIL 4, UPWIND 2", "DOCK: HEADS 3 / TAILS 1", "CRATE = 6 - CRATES LEFT", "SOLD OUT: 10 (BLACK MKT)", "POWDER 2 / REFIRE 2", "CALL A BATTLE RIGHT: +2", "STORM: ALL SHIPS 3 SQ"];
  const px = 0.52, W = Math.max(...lines.map(l => textWidth(l, px))) + 9, H = lines.length * 7 + 6, it = [rect(CU, 0, 0, W, H, 3)];
  lines.forEach((l, i) => it.push(...text(RA, l, 4.5, 4.5 + i * 7, px)));
  return it;
}

/* =========================================================================================
   8. Boards
   ========================================================================================= */
function board(v) {
  const { valid, rim, DIRS } = seaCells(), it = [], C = CC * CELL + CELL / 2, RSEA = (CC + .4) * CELL;
  it.push(...tag(gridLines(valid), "grid"));
  it.push(...tag(rimMarks(rim, v === "v1" ? "arrow" : v === "v2" ? "chevron" : "curved"), "trade-winds"));
  it.push(...tag(homeMarks(DIRS), "tortuga"));
  let w, h, ox = 0, oy = 0, notes;
  if (v === "v1") {
    const M = 24; ox = M; oy = M; w = GRID * CELL + 2 * M; h = w;
    it.push(...tag([rect(CU, -M, -M, w, h, 10)], "board-edge"));
    // a wind dial engraved into the top-left corner, pivot hole cut — the arrows mount here
    const dc = -M + 38; it.push(...tag(spinnerDial("quadrants-storm", 36, dc, dc, { onBoard: true }), "corner-dial"));
    it.push(...tag(text(RA, "WIND", dc, dc + 36 + 1.5, 0.9, { align: "center" }), "corner-dial"));
    it.push(...tag(icon("rose", GRID * CELL + M - 38, -M + 38, 46), "corner-rose"));
    it.push(...tag(text(RA, "PASTRY PIRATES", C, GRID * CELL + M / 2, 1.45, { align: "center", valign: "middle" }), "title"));
    it.push(...tag(text(RA, "THE SUGAR SEAS", -M + 38, GRID * CELL + M - 38, 0.8, { align: "center", valign: "middle" }), "corner-bl"));
    it.push(...tag(icon("anchor", GRID * CELL + M - 38, GRID * CELL + M - 38, 30), "corner-br"));
    notes = `Square plank ${w}x${h} mm, corners R10. Wind dial engraved in the top-left corner with its pivot hole cut (mount the two arrows there). Compass rose top-right, title along the bottom. Rim squares carry one straight arrow each.`;
  } else if (v === "v2") {
    const M = 7, loop = traceCells([...valid].map(k => k.split(",").map(Number)))[0].map(([x, y]) => [x * CELL, y * CELL]);
    const outer = offsetPoly(loop, M); const b = bbox([poly(CU, outer)]);
    ox = -b.x0; oy = -b.y0; w = b.w; h = b.h;
    it.push(...tag([item(CU, [roundCorners(outer, 4)])], "board-edge"));
    it.push(...tag([item(RA, [roundCorners(offsetPoly(loop, M - 2), 3), reverseSub(roundCorners(offsetPoly(loop, M - 2.8), 2.5))])], "board-edge-band"));
    notes = `Cut along the pixel edge of the world: ${r3(w)}x${r3(h)} mm, stepped outline ${M} mm outside the rim squares, with an engraved border band. Rim squares carry double chevrons — the app's own wind-arrow glyph.`;
  } else {
    // the pixel world's corners reach further than the sea's radius — the circle must clear every one
    let Rmax = 0; for (const k of valid) { const [x, y] = k.split(",").map(Number); for (const [cx, cy] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]) Rmax = Math.max(Rmax, Math.hypot(cx * CELL - C, cy * CELL - C)); }
    const M = 7, Rb = Rmax + M; w = h = 2 * Rb; ox = Rb - C; oy = Rb - C;
    it.push(...tag([circ(CU, C, C, Rb)], "board-edge"));
    it.push(...tag([ring(RA, C, C, Rmax + 3.2, Rmax + 2.5), ring(RA, C, C, Rmax + 1.9, Rmax + 1.4)], "board-edge-band"));
    notes = `A true circle, ${r3(w)} mm across, double engraved ring at the water's edge. Rim squares carry a curved current arrow that follows the ring.`;
  }
  return { id: "board", title: "The board", items: xf(it, { tx: ox, ty: oy }), w: r3(w), h: r3(h), notes, count: 1 };
}

/* =========================================================================================
   9. Sheets — nest named parts left-to-right, wrapping at a width
   ========================================================================================= */
function sheet(id, title, parts, { maxW = SHEET_W, gap = GAP, notes = "", count } = {}) {
  let x = gap, y = gap, rowH = 0, W = 0, items = [];
  for (const p of parts) {
    const b = bbox(p.items);
    if (x + b.w > maxW && x > gap) { x = gap; y += rowH + gap; rowH = 0; }
    items.push(...tag(xf(p.items, { tx: x - b.x0, ty: y - b.y0 }), p.name));
    x += b.w + gap; rowH = Math.max(rowH, b.h); W = Math.max(W, x);
  }
  return { id, title, items, w: r3(W), h: r3(y + rowH + gap), notes, count: count ?? parts.length };
}
const part = (name, items) => ({ name, items });

/* =========================================================================================
   10. Versions
   ========================================================================================= */
const VERSIONS = [
  { id: "v1", dir: "v1-plank", name: "V1 · The Plank", blurb: "A square plank with the round world engraved into it. The corners earn their keep: the wind dial lives top-left with its pivot cut into the board, a compass rose top-right, the title along the bottom. Docks are two-layer piers that overhang onto the island (glue the plank on top). Square crates, straight rim arrows, standing sloops." },
  { id: "v2", dir: "v2-pixel", name: "V2 · The Pixel World", blurb: "The board is cut along the stepped edge of the world itself — the sea IS the board. Jigsaw docks click into sockets cut in every island edge. Round tokens with the ingredient knocked out of a black badge, double-chevron rim (the app's own wind glyph), a 20-sector weather wheel with the storm odds built in, standing galleons." },
  { id: "v3", dir: "v3-round", name: "V3 · The Round Table", blurb: "A true circle with a double ring at the water's edge and a curved current that runs with the ring. Docks moor to islands with a little standing post dropped through matching slots. Hexagonal crates, a plain wind dial plus a separate 5-sector storm spinner, flat disc ships." },
];

function buildVersion(V) {
  const v = V.id, docs = [];
  docs.push(board(v));
  // islands: the seven TET footprints, numbered as assets/islands/N.png
  docs.push(sheet("islands", "Island shapes (7)", TET.map((_, i) => part(`island-${i + 1}`, islandPiece(v, i))), { notes: v === "v1" ? "Plain edges. Shoreline band and a palm engraved. 0.4 mm clearance per side so they sit inside the squares." : v === "v2" ? "A jigsaw socket is cut into the middle of EVERY outside edge, so a dock can click onto any side of any square." : "A 4.5 mm slot in the middle of every outside edge takes the mooring post of a dock." }));
  // docks
  const dp = ING.map(ing => dockPiece(v, ing));
  const dockParts = dp.map((d, i) => part(`dock-${ING[i]}`, d.dock));
  const dockExtras = dp.flatMap((d, i) => d.extra.length ? [part(v === "v1" ? `pier-top-${ING[i]}` : `mooring-post-${ING[i]}`, d.extra)] : []);
  docs.push(sheet("docks", "Docks (7)", [...dockParts, ...dockExtras], { notes: v === "v1" ? "Two layers: the square is the water cell (anchor engraved); the plank strip glues on top, flush with the island-facing edge, and overhangs onto the island by a third of a square. The overhang is what 'attaches' it." : v === "v2" ? "One piece. The nub on the pier side clicks into any island socket. Engraved pier with plank slits and two bollards." : "One piece plus a mooring post. Push the dock against the island so the two slots line up, drop the post through — it stands up like a bollard and locks the pair." }));
  // ingredient crates (4 per ingredient: 3 on the shelf + 1 black-market spare) and island markers
  const crates = ING.flatMap(ing => [0, 1, 2, 3].map(n => part(`crate-${ing}-${n + 1}`, TOKEN[v].crate(ing, 0, 0))));
  docs.push(sheet("crates", "Ingredient crates (28)", crates, { notes: "Four per ingredient: three to stock an island at 3–4 players, one spare for the black market. Wheat, milk, sugar, eggs, cocoa, cinnamon, vanilla — the app's own icons, redrawn as cuttable outlines." }));
  docs.push(sheet("markers", "Island markers (7)", ING.map(ing => part(`marker-${ing}`, TOKEN[v].marker(ing, 0, 0))), { notes: "Sits on an island at setup to say which ingredient grows there — the shapes are dealt fresh each game, so the ingredient can't be engraved on the island." }));
  docs.push(sheet("whirlpools", "Whirlpools (4)", [0, 1, 2, 3].map(n => part(`whirlpool-${n + 1}`, whirlpool(v === "v1" ? "spiral" : v === "v2" ? "rings" : "bold", 0, 0))), { notes: "One square each, 0.4 mm clearance. Drop them on any four trade-wind squares — a ship carried by the current gets off at the next whirlpool." }));
  // spinner
  const arr = spinnerArrows(0, 0);
  const spParts = [part("dial", spinnerDial(v === "v1" ? "quadrants-storm" : v === "v2" ? "roulette" : "quadrants", 40, 0, 0)), part("arrow-now", arr.now), part("arrow-next", arr.next), part("washer-1", arr.washers[0]), part("washer-2", arr.washers[1])];
  if (v === "v3") spParts.push(part("storm-dial", stormDial(24)), part("storm-arrow", [poly(CU, [[-7, -2], [11, -2], [11, -5], [18, 0], [11, 5], [11, 2], [-7, 2], [-4, 0]]), circ(CU, 0, 0, 1.65)]));
  docs.push(sheet("spinner", "Wind spinner", spParts, { notes: (v === "v1" ? "80 mm dial (also engraved on the board's corner). Each quadrant's last 18° is a storm wedge — one fifth of the wheel, the app's 20%. " : v === "v2" ? "80 mm weather wheel: 20 sectors, the last of every five is a storm sector (20%). " : "80 mm plain dial plus a 48 mm storm spinner with one storm sector in five. ") + "Two arrows on one pivot: the bold one labelled NOW is this round's wind, the hollow one is the forecast. Stack: dial, hollow arrow, washer, NOW arrow, washer, M3 bolt + nut (or a brass paper fastener)." }));
  // ships
  const shipParts = [];
  for (let c = 0; c < 4; c++) {
    if (v === "v3") shipParts.push(part(`ship-${CAPTAINS[c]}`, [circ(CU, 0, 0, CELL * .36), ring(RA, 0, 0, CELL * .36 - .7, CELL * .36 - 1.2), ...icon("boat", 0, -CELL * .02, CELL * .5), ...sailPattern(c, [[-CELL * .22, CELL * .2], [CELL * .22, CELL * .2], [CELL * .22, CELL * .3], [-CELL * .22, CELL * .3]])]));
    else { const s = shipStanding(v === "v1" ? "sloop" : "galleon", c); shipParts.push(part(`ship-${CAPTAINS[c]}`, s.profile), part(`ship-base-${CAPTAINS[c]}`, s.base)); }
  }
  docs.push(sheet("ships", "Ships (4)", shipParts, { notes: "Four captains told apart in wood: CRUMBLE plain, BISCOTTI striped, GINGERSNAP dotted, SHORTBREAD checked (pink, teal, green, orange in the app — paint the sails if you like). " + (v === "v3" ? "Flat tokens, one square wide." : "Standing profiles: the tab under the hull drops into the slot in the base.") }));
  // recipes
  docs.push(sheet("recipes", "Recipe cards (21)", recipeCards(v).map((c, i) => part(`recipe-${i + 1}`, c)), { notes: "Every possible 5-of-7 recipe, exactly once — 21 cards, 64x38 mm. Deal two to each captain, keep one, as the app does." }));
  // extras
  const stormToken = xf([item(CU, [ICONS.cloud()[0].sub[0]]), poly(RA, [[54, 36], [60, 36], [52, 47], [60, 47], [44, 60], [50, 49], [42, 49]])], { s: .34 });
  docs.push(sheet("extras", "Extras", [part("storm-token", stormToken), part("first-player", [circ(CU, 0, 0, 14), ...icon("wheel", 0, 0, 25)]), part("reference-card", referenceCard())], { notes: "A storm cloud to put on the board when the forecast says storm (the bolt is engraved inside the cut cloud). A ship's wheel for whoever sails first. A rules card with the numbers the app keeps for you." }));
  // one sheet with everything but the board
  const all = docs.filter(d => d.id !== "board");
  const allParts = all.map(d => part(d.id, d.items));
  docs.push(sheet("pieces-all", "All pieces on one sheet", allParts, { maxW: SHEET_W, notes: `Every piece except the board, nested in a ${SHEET_W} mm wide sheet. Re-run with --sheet to change the width.`, count: all.reduce((a, d) => a + d.count, 0) }));
  return { ...V, docs };
}

/* =========================================================================================
   11. Emit — SVG (two layer groups) and DXF R12 (two layers)
   ========================================================================================= */
function svgPathD(sub) {
  if (sub.circle) { const { cx, cy, r, ccw } = sub.circle, sw = ccw ? 0 : 1; return `M${r3(cx + r)} ${r3(cy)}A${r3(r)} ${r3(r)} 0 1 ${sw} ${r3(cx - r)} ${r3(cy)}A${r3(r)} ${r3(r)} 0 1 ${sw} ${r3(cx + r)} ${r3(cy)}Z`; }
  return sub.cmds.map(c => c[0] === "Z" ? "Z" : c[0] + c.slice(1).map(r3).join(" ")).join("");
}
function emitSVG(doc, V) {
  const layers = [[RA, "RASTER", `fill="#000000" fill-rule="nonzero" stroke="none"`], [CU, "CUT", `fill="none" stroke="#ff0000" stroke-width="0.1"`]];
  let out = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${doc.w}mm" height="${doc.h}mm" viewBox="0 0 ${doc.w} ${doc.h}">\n`;
  out += `<title>Pastry Pirates — ${V.name} — ${doc.title}</title>\n<desc>${doc.notes.replace(/[<>&]/g, "")} Units: mm. ${CELL} mm squares, ${MAT} mm material. RASTER = black fill (engrave), CUT = red hairline (cut). Generated by physical-board/generate.mjs.</desc>\n`;
  for (const [L, name, attrs] of layers) {
    out += `<g id="${name}" class="layer-${name.toLowerCase()}" inkscape:label="${name}" inkscape:groupmode="layer" ${attrs}>\n`;
    let curPiece = null;
    for (const it of doc.items) {
      if (it.layer !== L) continue;
      if (it.piece !== curPiece) { if (curPiece !== null) out += `</g>\n`; curPiece = it.piece; out += `<g class="piece" data-piece="${curPiece || "misc"}">\n`; }
      if (it.sub.length === 1 && it.sub[0].circle) { const c = it.sub[0].circle; out += `<circle cx="${r3(c.cx)}" cy="${r3(c.cy)}" r="${r3(c.r)}"/>\n`; }
      else out += `<path d="${it.sub.map(svgPathD).join("")}"/>\n`;
    }
    if (curPiece !== null) out += `</g>\n`;
    out += `</g>\n`;
  }
  return out + `</svg>\n`;
}
function emitDXF(doc) {
  const L = [], w = (c, v) => { L.push(String(c), String(v)); }, H = doc.h;
  w(0, "SECTION"); w(2, "HEADER"); w(9, "$ACADVER"); w(1, "AC1009"); w(9, "$EXTMIN"); w(10, 0); w(20, 0); w(9, "$EXTMAX"); w(10, doc.w); w(20, doc.h); w(0, "ENDSEC");
  w(0, "SECTION"); w(2, "TABLES"); w(0, "TABLE"); w(2, "LAYER"); w(70, 2);
  for (const [n, col] of [["CUT", 1], ["RASTER", 7]]) { w(0, "LAYER"); w(2, n); w(70, 0); w(62, col); w(6, "CONTINUOUS"); }
  w(0, "ENDTAB"); w(0, "ENDSEC"); w(0, "SECTION"); w(2, "ENTITIES");
  for (const it of doc.items) for (const sp of it.sub) {
    if (sp.circle) { w(0, "CIRCLE"); w(8, it.layer); w(10, r3(sp.circle.cx)); w(20, r3(H - sp.circle.cy)); w(30, 0); w(40, r3(sp.circle.r)); continue; }
    const { pts, closed } = flatten(sp);
    w(0, "POLYLINE"); w(8, it.layer); w(66, 1); w(70, closed ? 1 : 0);
    for (const [x, y] of pts) { w(0, "VERTEX"); w(8, it.layer); w(10, r3(x)); w(20, r3(H - y)); w(30, 0); }
    w(0, "SEQEND"); w(8, it.layer);
  }
  w(0, "ENDSEC"); w(0, "EOF");
  return L.join("\n") + "\n";
}

/* =========================================================================================
   12. Main
   ========================================================================================= */
const siteData = { cell: CELL, material: MAT, generated: new Date().toISOString().slice(0, 10), versions: [] };
for (const V of VERSIONS) {
  const built = buildVersion(V), dir = path.join(HERE, V.dir);
  fs.mkdirSync(dir, { recursive: true });
  const groups = [];
  for (const doc of built.docs) {
    const svg = emitSVG(doc, V);
    fs.writeFileSync(path.join(dir, `${doc.id}.svg`), svg);
    fs.writeFileSync(path.join(dir, `${doc.id}.dxf`), emitDXF(doc));
    groups.push({ id: doc.id, title: doc.title, notes: doc.notes, w: doc.w, h: doc.h, count: doc.count, svg });
  }
  siteData.versions.push({ id: V.id, dir: V.dir, name: V.name, blurb: V.blurb, groups });
  console.log(`${V.dir}: ${built.docs.length} files x2 (svg+dxf)`);
}
fs.writeFileSync(path.join(HERE, "site-data.js"), "window.PB_DATA = " + JSON.stringify(siteData) + ";\n");
console.log(`cell ${CELL} mm, material ${MAT} mm — site-data.js written`);
