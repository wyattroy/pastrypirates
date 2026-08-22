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

const CELL = opt("cell", 25);          // mm per grid square (Wyatt, 2026-08-22: 25)
const MAT  = opt("material", 6);       // sheet thickness, mm (slot widths derive from it) — 6 mm everything
const KERF = opt("kerf", 0.18);        // beam width; cutting sheets are offset by half of this so pieces come out true size
const BED_W = opt("bedw", 600), BED_H = opt("bedh", 400), BED_MARGIN = 6;   // his laser bed
const ONLY = (argv.includes("--versions") ? argv[argv.indexOf("--versions") + 1] : "v3").split(",");
const GRID = 15;                        // engine: cfg.grid
const CC   = (GRID - 1) / 2;            // engine: centre of the round world
const CLR  = 0.4;                       // per-side clearance so a loose piece drops into a square
const PIECE = CELL - 2 * CLR;           // a one-square piece
const GAP  = 4;                         // spacing between nested parts on a sheet
const SHEET_W = opt("sheet", 300);      // wrap width for the preview sheets
const CENTER = ((GRID - 1) / 2) * CELL + CELL / 2;   // the board's centre in mm

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
  if (sub.circle) { const { cx, cy, r, ccw } = sub.circle, pts = []; for (let i = 0; i < 48; i++) { const a = (ccw ? -i : i) / 48 * Math.PI * 2; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return { pts, closed: true }; }
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
   2b. REAL LETTERING — the game's own fonts (Georgia for the voice, Avenir Next for labels), as
       outlines extracted once by fonts/extract.py. Wyatt, 2026-08-22: the pixel font read as
       "techno"; the brand is the app's. Glyph paths are TrueType: outer contours and holes wind
       opposite ways, so nonzero fill needs nothing more.
   ========================================================================================= */
const GLYPHS = JSON.parse(fs.readFileSync(path.join(HERE, "fonts", "glyphs.json"), "utf8"));
function glyphCmds(d) { // fontTools SVGPathPen: absolute M/L/H/V/Q/C/Z, with implicit repeats ("M x y x y x y" = M then L L)
  const toks = d.match(/[MLHVQCZ]|-?\d*\.?\d+(?:e-?\d+)?/g) || [], out = []; let i = 0, cur = [0, 0], mode = null;
  const isNum = t => t !== undefined && !/[MLHVQCZ]/.test(t);
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    let t = toks[i];
    if (!isNum(t)) { mode = t; i++; if (t === "Z") { out.push(["Z"]); mode = null; continue; } }
    if (mode === "M") { cur = [num(), num()]; out.push(["M", cur[0], cur[1]]); mode = "L"; }
    else if (mode === "L") { cur = [num(), num()]; out.push(["L", cur[0], cur[1]]); }
    else if (mode === "H") { cur = [num(), cur[1]]; out.push(["L", cur[0], cur[1]]); }
    else if (mode === "V") { cur = [cur[0], num()]; out.push(["L", cur[0], cur[1]]); }
    else if (mode === "Q") { const qx = num(), qy = num(), x = num(), y = num(); out.push(["C", cur[0] + 2 / 3 * (qx - cur[0]), cur[1] + 2 / 3 * (qy - cur[1]), x + 2 / 3 * (qx - x), y + 2 / 3 * (qy - y), x, y]); cur = [x, y]; }
    else if (mode === "C") { const a = num(), b = num(), c = num(), d2 = num(), x = num(), y = num(); out.push(["C", a, b, c, d2, x, y]); cur = [x, y]; }
    else i++;
  }
  return out;
}
function ftextWidth(str, size, font = "georgia-bold") { const F = GLYPHS[font]; let w = 0; for (const ch of str) { const g = F.glyphs[ch] || F.glyphs["?"]; w += g.adv; } return w * size / F.upm; }
// size = em height in mm; (x,y) = baseline origin unless valign says otherwise
function ftext(layer, str, x, y, size, { font = "georgia-bold", align = "left", valign = "baseline" } = {}) {
  const F = GLYPHS[font], k = size / F.upm, w = ftextWidth(str, size, font), items = [];
  const capH = 0.7 * size; // close enough for both faces; only used to centre
  const ox = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  const oy = valign === "middle" ? y + capH / 2 : valign === "top" ? y + capH : y;
  let pen = 0;
  for (const ch of str) {
    const g = F.glyphs[ch] || F.glyphs["?"];
    if (g.d) { const cmds = glyphCmds(g.d).map(c => c[0] === "Z" ? c : c[0] === "C" ? ["C", ox + pen + c[1] * k, oy - c[2] * k, ox + pen + c[3] * k, oy - c[4] * k, ox + pen + c[5] * k, oy - c[6] * k] : [c[0], ox + pen + c[1] * k, oy - c[2] * k]);
      // one item per glyph; split sub-paths at each M so holes stay paired with their outer
      const subs = []; let curC = null; for (const c of cmds) { if (c[0] === "M") { curC = [c]; subs.push({ cmds: curC }); } else curC.push(c); }
      items.push(item(layer, subs)); }
    pen += g.adv * k;
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
function offsetPoly(ptsRaw, d) {
  const ptsIn = ptsRaw.filter((p, i) => i === 0 || Math.hypot(p[0] - ptsRaw[i - 1][0], p[1] - ptsRaw[i - 1][1]) > 1e-6);
  if (Math.hypot(ptsIn[0][0] - ptsIn[ptsIn.length - 1][0], ptsIn[0][1] - ptsIn[ptsIn.length - 1][1]) < 1e-6) ptsIn.pop();
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
// the game's own recipe book — 21 named recipes, one per 5-of-7 combination (4/src/ui/recipe.js)
const RECIPE_BOOK = (await import(path.join(HERE, "..", "4", "src", "ui", "recipe.js"))).RECIPE_BOOK;
const MAT3 = 3; // the thin material: spinner, crates, chests, cards
// the ingredient art itself, traced by art/trace.py: cut = silhouette loops, raster = the drawing's ink
const ART = JSON.parse(fs.readFileSync(path.join(HERE, "art", "ingredients.json"), "utf8"));
const TOKEN_MM = 20; // the longest side of a token; one sits on each island square of 25
function artToken(name, cx, cy, size = TOKEN_MM, { cut = true, ink = true, solid = false } = {}) {
  const a = ART[name], [x0, y0, x1, y1] = a.bbox, k = size / Math.max(x1 - x0, y1 - y0), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const L = loop => polyCmds(loop.map(([x, y]) => [cx + (x - mx) * k, cy + (y - my) * k]));
  const out = [];
  if (cut) out.push(item(CU, a.cut.map(L)));
  if (solid) out.push(item(RA, a.cut.map(L)));
  else if (ink) out.push(item(RA, a.raster.map(L)));
  return out;
}

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
  // pier, after assets/dock.png: a deck of upright planks, a post at each corner, an anchor hung on it; the island lies to +x
  pier() {
    const deck = roundCorners([[22, 28], [98, 28], [98, 72], [22, 72]], 2);
    const slits = [36, 50, 64, 78, 92].map(x => reverseSub(polyCmds([[x - 1.1, 31], [x + 1.1, 31], [x + 1.1, 69], [x - 1.1, 69]])));
    const anchorHole = icon("anchor", 50, 50, 30).map(reverseItem).flatMap(i => i.sub);
    return [item(RA, [deck, ...slits, ...anchorHole]), circ(RA, 22, 24, 5), circ(RA, 22, 76, 5), circ(RA, 98, 24, 5), circ(RA, 98, 76, 5)];
  },
  // a grass tuft: three short blades
  tuft() { return [poly(RA, [[44, 70], [50, 40], [52, 70]]), poly(RA, [[30, 72], [38, 48], [44, 72]]), poly(RA, [[56, 72], [64, 50], [70, 72]])]; },
  // a rock, after the grey boulders on the island art
  rock() { return [item(RA, [{ cmds: [["M", 20, 70], ["C", 16, 50, 34, 30, 52, 32], ["C", 70, 30, 86, 44, 82, 62], ["C", 80, 74, 60, 78, 48, 76], ["C", 34, 78, 22, 78, 20, 70], ["Z"]] }])]; },
  // the trade-wind whirlpool, after assets/trade-swirl.png: two spiral arms about an eye
  swirl() {
    const arm = (phase) => { const pts = [], turns = 0.9, a0 = 10, b = (44 - a0) / (turns * Math.PI * 2), w0 = 7, w1 = 14; const P = (th, r) => [50 + r * Math.cos(th + phase), 50 + r * Math.sin(th + phase)];
      const n = 40; for (let i = 0; i <= n; i++) { const th = i / n * turns * Math.PI * 2, w = w0 + (w1 - w0) * (1 - i / n); pts.push(P(th, a0 + b * th + w / 2)); }
      for (let i = n; i >= 0; i--) { const th = i / n * turns * Math.PI * 2, w = w0 + (w1 - w0) * (1 - i / n); pts.push(P(th, Math.max(1, a0 + b * th - w / 2))); } return poly(RA, pts); };
    return [arm(0), arm(Math.PI), circ(RA, 50, 50, 5)];
  },
  // the fleur-de-lis tip of the game's compass needle
  fleur() {
    return [poly(RA, [[50, 4], [60, 26], [50, 40], [40, 26]]), item(RA, [{ cmds: [["M", 50, 40], ["C", 64, 26, 84, 30, 80, 46], ["C", 78, 56, 66, 54, 60, 48], ["L", 56, 56], ["L", 44, 56], ["L", 40, 48], ["C", 34, 54, 22, 56, 20, 46], ["C", 16, 30, 36, 26, 50, 40], ["Z"]] }]), rect(RA, 44, 58, 12, 6)];
  },
  // an eight-point compass rose
  rose() {
    const pts = []; for (let k = 0; k < 8; k++) { const a = k * 45, rr = k % 2 ? 24 : 46; pts.push([50 + rr * Math.cos(rad(a - 90)), 50 + rr * Math.sin(rad(a - 90))]); const b = a + 22.5; pts.push([50 + 9 * Math.cos(rad(b - 90)), 50 + 9 * Math.sin(rad(b - 90))]); }
    return [poly(RA, pts), ring(RA, 50, 50, 49.5, 48)];
  },
  // the game's boat (assets/boats): jib and mainsail on one mast, a rounded hull with portholes
  boat() {
    const hull = { cmds: [["M", 8, 62], ["L", 92, 62], ["C", 92, 76, 80, 86, 50, 86], ["C", 20, 86, 8, 76, 8, 62], ["Z"]] };
    const holes = [30, 50, 70].map(x => ({ circle: { cx: x, cy: 72, r: 3.2, ccw: true } }));
    return [item(RA, [hull, ...holes]), rect(RA, 48, 6, 4, 54), item(RA, [{ cmds: [["M", 54, 10], ["C", 80, 26, 86, 42, 84, 56], ["L", 54, 56], ["Z"]] }]), item(RA, [{ cmds: [["M", 46, 22], ["C", 28, 34, 22, 46, 20, 56], ["L", 46, 56], ["Z"]] }])];
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
  v3: { // the ingredient art itself, cut along its own outline (Wyatt, 2026-08-22); on cards, its silhouette in the app's rounded-square chip
    crate(name, cx, cy) { return artToken(name, cx, cy); },
    marker(name, cx, cy) { return artToken(name, cx, cy); },
    recipeIcon(name, cx, cy, d) { return [...frameBand(cx, cy, d + 1.8, d + 1.8, 0.4, (d + 1.8) / 4), ...artToken(name, cx, cy, d * 0.84, { cut: false, solid: true })]; },
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
    } else if (style === "game") { // the app's own wind-arrow.png: one bold chevron, arms at 45°, corners lightly rounded
      const a = CELL * .27, t = CELL * .17, ox = (a - t) / 2;
      out.push(...xf([item(RA, [roundCorners([[ox - a, -a], [ox - a + t, -a], [ox + t, 0], [ox - a + t, a], [ox - a, a], [ox, 0]], CELL * .03)])], { tx: cx, ty: cy, rot: deg + 90 }));
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

// Isle of Tortuga's own square: sand edge band, anchor, name — centred on (cx,cy)
function homeSquareMarks(cx, cy) {
  return [...frameBand(cx, cy, CELL - 3, CELL - 3, 0.7, CELL * .25), ...icon("anchor", cx, cy - CELL * .13, CELL * .42), ...ftext(RA, "Tortuga", cx, cy + CELL * .36, CELL * .13, { font: "georgia-bold", align: "center" })];
}
// the board art's concentric ripples, as thin wavy rings on open water — between Tortuga's berths and the rim
function rippleRings() {
  const C = CENTER, out = [];
  const radii = [3.1, 3.8, 4.5, 5.2, 5.85].map(k => k * CELL);
  radii.forEach((R0, k) => { const pts = [], n = 360; const r = th => R0 + 1.1 * Math.sin(7 * th + k * 1.3) + 0.5 * Math.sin(13 * th + k * 0.7);
    for (let i = 0; i < n; i++) { const th = i / n * Math.PI * 2; pts.push([C + r(th) * Math.cos(th), C + r(th) * Math.sin(th)]); }
    out.push(item(RA, [polyCmds(offsetPoly(pts, 0.17)), reverseSub(polyCmds(offsetPoly(pts, -0.17)))])); });
  return out;
}
// four berths, each pier facing back toward the island (dockOrient([-d]))
function berthMarks(DIRS) {
  const hx = CC, hy = CC, out = [];
  for (const d of DIRS) { const cx = (hx + d[0] + .5) * CELL, cy = (hy + d[1] + .5) * CELL, rot = Math.atan2(-d[1], -d[0]) * 180 / Math.PI; out.push(...icon("pier", cx, cy, CELL * .82, rot)); }
  return out;
}
function homeMarks(DIRS) { return [...homeSquareMarks((CC + .5) * CELL, (CC + .5) * CELL), ...berthMarks(DIRS)]; }

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
  if (style === "swirl") it.push(...icon("swirl", cx, cy, s * .86));
  else if (style === "spiral") it.push(spiral(2.5, 1.1, 1.0));
  else if (style === "rings") { for (const [r, a] of [[Rmax, 20], [Rmax * .66, 160], [Rmax * .33, 300]]) { const pts = [], w = 1.1; for (let i = 0; i <= 24; i++) pts.push([cx + (r + w / 2) * Math.cos(rad(a + i * 11.25)), cy + (r + w / 2) * Math.sin(rad(a + i * 11.25))]); for (let i = 24; i >= 0; i--) pts.push([cx + (r - w / 2) * Math.cos(rad(a + i * 11.25)), cy + (r - w / 2) * Math.sin(rad(a + i * 11.25))]); it.push(poly(RA, pts)); } it.push(circ(RA, cx, cy, 1.1)); }
  else { it.push(spiral(2, 1.7, 2.2), circ(RA, cx, cy, 1.6)); }
  return it;
}

// a closed polyline with the coast gently waved along its outward normal — still, the wave dies out
// within `quiet` mm of each notch midpoint so the dock slots stay on straight shore
function waveCoast(cmds, notchMids, { amp = 0.7, lambda = 9, quiet = 7, step = 0.8 } = {}) {
  const raw = flatten({ cmds }, 16).pts, pts = [];
  for (let i = 0; i < raw.length; i++) { const a = raw[i], b = raw[(i + 1) % raw.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / step)); for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); }
  const cw = signedArea(pts) > 0, out = []; let sArc = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], pr = pts[(i + pts.length - 1) % pts.length];
    const tx = q[0] - pr[0], ty = q[1] - pr[1], tl = Math.hypot(tx, ty) || 1, nx = (cw ? ty : -ty) / tl, ny = (cw ? -tx : tx) / tl; // outward
    const dmin = Math.min(...notchMids.map(m => Math.hypot(p[0] - m[0], p[1] - m[1])));
    const f = dmin <= quiet ? 0 : dmin >= quiet + 5 ? 1 : (dmin - quiet) / 5;
    const w = amp * f * Math.sin(2 * Math.PI * sArc / lambda);
    out.push([p[0] + nx * w, p[1] + ny * w]);
    sArc += Math.hypot(q[0] - p[0], q[1] - p[1]);
  }
  return out;
}
// drop a notch into a dense polyline: points within hw of the midpoint (along the edge) are replaced by the notch
function notchPolyline(pts, m, along, hw, notchPts) {
  const idx = [], n = pts.length;
  for (let i = 0; i < n; i++) { const d = (pts[i][0] - m[0]) * along[0] + (pts[i][1] - m[1]) * along[1], off = Math.abs((pts[i][0] - m[0]) * along[1] - (pts[i][1] - m[1]) * along[0]); if (Math.abs(d) <= hw && off < 1.2) idx.push(i); }
  if (!idx.length) return pts;
  const first = idx[0], last = idx[idx.length - 1];
  return [...pts.slice(0, first), ...notchPts, ...pts.slice(last + 1)];
}
function islandPiece(v, shapeIdx) {
  const cells = TET[shapeIdx], loop = traceCells(cells)[0].map(([x, y]) => [x * CELL, y * CELL]);
  const inset = offsetPoly(loop, -CLR);
  const outline = roundCorners(inset, 3);
  const edges = perimeterEdges(cells).map(e => ({ ...e, m: [e.m[0] * CELL + e.inward[0] * CLR, e.m[1] * CELL + e.inward[1] * CLR] }));
  const it = [];
  if (v === "v3") {
    // the game's coast: a wavy sand edge (Wyatt, 2026-08-22). Wave first, then the dock slots.
    let pts = waveCoast(outline.cmds, edges.map(e => e.m));
    for (const e of edges) pts = notchPolyline(pts, e.m, e.along, SLOT.slot.hw, slotPts(e.m, e.along, e.inward, SLOT.slot, +1));
    it.push(item(CU, [polyCmds(pts)]));
    // sand band that follows the coast (the slots simply cut through it), then grass tufts along the inside of the band
    const coast = waveCoast(outline.cmds, edges.map(e => e.m)), band = offsetPoly(coast, -1.3), inner = offsetPoly(coast, -2.4);
    it.push(item(RA, [polyCmds(band), reverseSub(polyCmds(inner))]));
    const set = new Set(cells.map(c => c.join(","))), nb = c => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(d => set.has(`${c[0] + d[0]},${c[1] + d[1]}`)).length;
    let seed = shapeIdx * 7919 + 13; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (const [cx, cy] of cells) for (let k = 0; k < 3; k++) { const ang = rnd() * Math.PI * 2, rr = CELL * .33 + rnd() * CELL * .06, x = (cx + .5) * CELL + rr * Math.cos(ang), y = (cy + .5) * CELL + rr * Math.sin(ang); it.push(...icon("tuft", x, y, 3.2 + rnd() * 1.2)); }
    const best = cells.reduce((a, c) => nb(c) > nb(a) ? c : a, cells[0]);
    it.push(...icon("palm", (best[0] + .5) * CELL - 2, (best[1] + .5) * CELL - 1, CELL * .5));
    const rockCell = cells[cells.length - 1];
    it.push(...icon("rock", (rockCell[0] + .5) * CELL + CELL * .25, (rockCell[1] + .5) * CELL + CELL * .22, 5));
    return it;
  }
  if (v === "v2") for (const e of edges) insertNotch(outline.cmds, e.m, mushroomPts(e.m, e.along, e.inward, JIG.socket, +1));
  it.push(item(CU, [outline]));
  it.push(item(RA, [roundCorners(offsetPoly(loop, -(CLR + 1.6)), 2), reverseSub(roundCorners(offsetPoly(loop, -(CLR + 2.6)), 1.2))]));
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
  // the game's own recipe book: 21 named recipes, one per 5-of-7 combination, in the modal's Georgia
  const W = 64, H = 38, cards = [];
  RECIPE_BOOK.forEach((r, n) => {
    const it = [rect(CU, 0, 0, W, H, 3), ...frameBand(W / 2, H / 2, W - 2.4, H - 2.4, 0.4, 2.2)];
    let size = 3.4; while (ftextWidth(r.title, size) > W - 8 && size > 2.2) size -= 0.2;
    it.push(...ftext(RA, r.title, W / 2, 8.6, size, { font: "georgia-bold", align: "center" }));
    it.push(...ftext(RA, `Recipe No. ${n + 1}`, W / 2, H - 4.2, 2.3, { font: "georgia-italic", align: "center" }));
    r.ings.forEach((ing, i) => it.push(...TOKEN[v].recipeIcon(ing, W / 2 + (i - 2) * 11.2, 20, 8.2)));
    cards.push(it);
  });
  return cards;
}

function referenceCard() {
  const lines = ["Sail 4 squares, 2 if any square is upwind", "Dock: heads 3 coins, tails 1 coin", "Crate price = 6 − crates left; sold out 10", "Powder 2; fire again for 2 more", "Call a battle right: +2 coins", "Storm: every ship 3 squares downwind"];
  const sz = 2.6, W = Math.max(...lines.map(l => ftextWidth(l, sz, "avenir-next-demibold"))) + 10, H = lines.length * 4.6 + 12, it = [rect(CU, 0, 0, W, H, 3), ...frameBand(W / 2, H / 2, W - 2.4, H - 2.4, 0.4, 2.2)];
  it.push(...ftext(RA, "The Sugar Seas", W / 2, 6.4, 3.6, { font: "georgia-bold", align: "center" }));
  lines.forEach((l, i) => it.push(...ftext(RA, l, 5, 12.6 + i * 4.6, sz, { font: "avenir-next-demibold" })));
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
   8b. THE FIVE-PIECE BOARD (Wyatt, 2026-08-22): four jigsaw quadrants that lock to each other,
       and Tortuga as a fifth piece that drops into the square hole they leave in the middle.

   One canonical quadrant (NW) is drawn and rotated four times, so all four quarters have the
   SAME cut outline — interchangeable, and they nest identically. Its two straight edges carry
   complementary knob patterns (out-in-out up the vertical seam, in-out-in along the horizontal
   one) so that after rotation every knob meets a socket. Knobs sit mid-cell, two squares apart,
   clear of the berths and the rim arrows, so the only engraving that crosses a knob is a grid
   line — and those are carried across by ownership (see gridForQuadrants) rather than clipped.
   ========================================================================================= */
const JIGB = { nub: { hw: 4, nd: 2.5, r: 5.5 }, socket: { hw: 4.05, nd: 2.5, r: 5.55 } };  // 0.1 mm total play, after kerf
const EDGE_A = [[6, "out"], [4, "in"], [2, "out"]].map(([k, s]) => [k * CELL, s]);
const EDGE_B = [[2, "in"], [4, "out"], [6, "in"]].map(([k, s]) => [k * CELL, s]);
// THE SEAMS RUN ALONG GRID LINES (Wyatt, 2026-08-22: "the jigs should be cut along or within the grid
// lines"). A pinwheel: the canonical NW quadrant is everything left of x = C+h and above y = C-h —
// the grid lines that bound Tortuga's square on its right and its top. Rotated four times that leaves
// exactly Tortuga's square as the hole, and every other square, berths and rim included, whole on one
// piece. Knobs are centred mid-square, so each one lives inside a single square of its neighbour.
function quadrantPts(Rb) {
  const C = CENTER, h = CELL / 2, pts = [], sr = Math.sqrt(Rb * Rb - h * h);
  const a0 = Math.atan2(-h, -sr), a1 = Math.atan2(-sr, h); // from the left rim point (C-sr, C-h), clockwise over the top, to (C+h, C-sr)
  for (let i = 0; i <= 90; i++) { const a = a0 + (a1 - a0) * i / 90; pts.push([C + Rb * Math.cos(a), C + Rb * Math.sin(a)]); }
  for (const [d, s] of EDGE_A) pts.push(...mushroomPts([C + h, C - d], [0, 1], [-1, 0], s === "out" ? JIGB.nub : JIGB.socket, s === "out" ? -1 : 1));
  pts.push([C + h, C - h]);
  for (const [d, s] of EDGE_B) pts.push(...mushroomPts([C - d, C - h], [-1, 0], [0, -1], s === "out" ? JIGB.nub : JIGB.socket, s === "out" ? -1 : 1));
  return pts;
}
const rot90 = (v, k) => { let [x, y] = v; for (let i = 0; i < k; i++) [x, y] = [-y, x]; return [x, y]; };
const aboutCentre = (items, k) => xf(xf(items, { tx: -CENTER, ty: -CENTER }), { rot: 90 * k, tx: CENTER, ty: CENTER });
// every knob on the assembled board: base point m on the seam, n pointing out of its owner, t along the seam
function allKnobs() {
  const C = CENTER, out = [];
  const h = CELL / 2;
  const canon = [...EDGE_A.filter(e => e[1] === "out").map(([d]) => ({ m: [C + h, C - d], n: [1, 0], t: [0, 1] })), ...EDGE_B.filter(e => e[1] === "out").map(([d]) => ({ m: [C - d, C - h], n: [0, 1], t: [1, 0] }))];
  for (let k = 0; k < 4; k++) for (const kb of canon) { const rm = rot90([kb.m[0] - C, kb.m[1] - C], k); out.push({ m: [C + rm[0], C + rm[1]], n: rot90(kb.n, k), t: rot90(kb.t, k), owner: k }); }
  return out;
}
const QUAD = (() => { const C = CENTER, h = CELL / 2; return [
  { id: "NW", sx: -1, bx: C + h, sy: -1, by: C - h }, { id: "NE", sx: 1, bx: C + h, sy: -1, by: C + h },
  { id: "SE", sx: 1, bx: C - h, sy: 1, by: C + h }, { id: "SW", sx: -1, bx: C - h, sy: 1, by: C - h }]; })();
const inQuad = (p, q, e = 1e-6) => (q.sx < 0 ? p[0] <= q.bx + e : p[0] >= q.bx - e) && (q.sy < 0 ? p[1] <= q.by + e : p[1] >= q.by - e);
function knobOwnerAt(p, knobs) {
  const { hw, nd, r } = JIGB.nub;
  for (const kb of knobs) { const dx = p[0] - kb.m[0], dy = p[1] - kb.m[1], u = dx * kb.n[0] + dy * kb.n[1], s = dx * kb.t[0] + dy * kb.t[1];
    if (u >= -0.01 && u <= nd + 0.01 && Math.abs(s) <= hw) return kb.owner;
    if ((u - nd - r) ** 2 + s * s <= r * r) return kb.owner; }
  return -1;
}
// -2 = on a seam (both pieces claim it — the cut itself draws that line) or in Tortuga's hole
function quadrantOf(p, knobs) { const o = knobOwnerAt(p, knobs); if (o >= 0) return o; const hits = QUAD.map((q, k) => inQuad(p, q) ? k : -1).filter(k => k >= 0); return hits.length === 1 ? hits[0] : -2; }
// Sutherland–Hodgman against one half-plane: keep nx*x+ny*y <= d
function clipPolyHalf(pts, nx, ny, d) {
  const out = [], n = pts.length, f = p => nx * p[0] + ny * p[1] - d;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], fa = f(a), fb = f(b);
    if (fa <= 0) out.push(a);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } }
  return out;
}
// an engraved shape, cut to one quadrant's quarter of the board (knobs carry only grid lines, handled separately)
function clipItemQuadrant(it, { sx, bx, sy, by }) {
  const b = bbox([it]);
  const outX = sx < 0 ? b.x0 >= bx : b.x1 <= bx, outY = sy < 0 ? b.y0 >= by : b.y1 <= by;
  if (outX || outY) return null;
  const inX = sx < 0 ? b.x1 <= bx : b.x0 >= bx, inY = sy < 0 ? b.y1 <= by : b.y0 >= by;
  if (inX && inY) return it;
  const sub = [];
  for (const sp of it.sub) { let pts = flatten(sp, 10).pts; pts = clipPolyHalf(pts, -sx, 0, -sx * bx); pts = clipPolyHalf(pts, 0, -sy, -sy * by); if (pts.length >= 3) sub.push(polyCmds(pts)); }
  return sub.length ? { ...it, sub } : null;
}
// grid lines by OWNERSHIP, sampled every half millimetre: a line runs onto a knob with the knob's owner and
// stops at a socket, so across a locked seam every grid line reads continuous
function gridForQuadrants(valid, knobs) {
  const per = [[], [], [], []];
  for (const rc of gridLines(valid)) {
    const p = rc.sub[0].cmds, x0 = p[0][1], y0 = p[0][2], x1 = p[2][1], y1 = p[2][2], horiz = (x1 - x0) > (y1 - y0);
    const L = horiz ? x1 - x0 : y1 - y0, step = 0.5, n = Math.ceil(L / step); let run = null;
    const flush = () => { if (run && run.o >= 0 && run.b - run.a > 0.3) per[run.o].push(horiz ? rect(RA, run.a, y0, run.b - run.a, y1 - y0) : rect(RA, x0, run.a, x1 - x0, run.b - run.a)); run = null; };
    for (let i = 0; i <= n; i++) { const pos = (horiz ? x0 : y0) + Math.min(L, i * step), mid = horiz ? [pos, (y0 + y1) / 2] : [(x0 + x1) / 2, pos], o = quadrantOf(mid, knobs);
      if (run && run.o === o) run.b = pos; else { flush(); run = { o, a: pos, b: pos }; } }
    flush();
  }
  return per;
}
function boardFivePiece() {
  const { valid, rim, DIRS } = seaCells(), C = CENTER;
  let Rmax = 0; for (const k of valid) { const [x, y] = k.split(",").map(Number); for (const [cx, cy] of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]]) Rmax = Math.max(Rmax, Math.hypot(cx * CELL - C, cy * CELL - C)); }
  const Rb = Rmax + 7;
  const raster = [...tag(rimMarks(rim, "game"), "trade-winds"), ...tag(berthMarks(DIRS), "berths"), ...tag(rippleRings(), "ripples"), ...tag([ring(RA, C, C, Rmax + 3.2, Rmax + 2.5), ring(RA, C, C, Rmax + 1.9, Rmax + 1.4)], "edge-band")];
  const knobs = allKnobs(), grid = gridForQuadrants(valid, knobs), canon = poly(CU, quadrantPts(Rb));
  const quadrants = QUAD.map((q, k) => ({ name: `quadrant-${q.id}`, items: tag([...aboutCentre([canon], k), ...raster.map(it => clipItemQuadrant(it, q)).filter(Boolean), ...grid[k]], `quadrant-${q.id}`) }));
  const ps = CELL - 0.1;  // Tortuga: drops into the 25 mm hole with 0.1 mm to spare
  const plug = { name: "tortuga", items: tag([rect(CU, -ps / 2, -ps / 2, ps, ps, 0.6), ...homeSquareMarks(0, 0)], "tortuga") };
  const assembledItems = [...QUAD.flatMap((q, k) => tag(aboutCentre([canon], k), `seam-${q.id}`)), ...tag(xf(plug.items, { tx: C, ty: C }), "tortuga"), ...raster, ...tag(gridLines(valid), "grid")];
  const assembled = { id: "board-assembled", title: "The board, assembled", kind: "design", items: xf(assembledItems, { tx: Rb - C, ty: Rb - C }), w: r3(2 * Rb), h: r3(2 * Rb), count: 5,
    notes: `Design view, no kerf. ${r3(2 * Rb)} mm across. Four identical quadrants lock with three puzzle knobs per seam (knobs two squares apart, clear of the berths and the rim); Tortuga is the fifth piece, a ${ps} mm square that drops into the hole the four quadrants leave in the middle. The seams run along the grid lines that bound Tortuga's square (a pinwheel), so every square — berths and rim included — is whole on one piece, and each knob sits inside a single square of its neighbour. Rim marks are the app's own wind chevron.` };
  return { assembled, quadrants, plug, Rb };
}
// ---- kerf: push every cut line half a beam away from the wood that stays ----
function pointInPoly(p, pts) { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c; } return c; }
function kerfCompensate(items, k) {
  const out = [...items], byPiece = new Map();
  items.forEach((it, i) => { if (it.layer !== CU) return; const key = it.piece || ("_" + i); if (!byPiece.has(key)) byPiece.set(key, []); byPiece.get(key).push({ it, i }); });
  for (const [, group] of byPiece) {
    const polys = group.flatMap(g => g.it.sub.map(sp => ({ sp, pts: flatten(sp, 12).pts })));
    for (const g of group) out[g.i] = { ...g.it, sub: g.it.sub.map(sp => {
      const pts = flatten(sp, 12).pts, isHole = polys.some(q => q.sp !== sp && pointInPoly(pts[0], q.pts)), d = isHole ? -k / 2 : k / 2;
      return sp.circle ? { circle: { ...sp.circle, r: sp.circle.r + d } } : polyCmds(offsetPoly(pts, d));
    }) };
  }
  return out;
}
// ---- shelf-pack named parts onto bed-sized sheets, tallest first ----
function packSheets(parts) {
  const W = BED_W, H = BED_H, m = BED_MARGIN, g = GAP, sorted = parts.map(p => ({ ...p, b: bbox(p.items) })).sort((a, b) => b.b.h - a.b.h);
  const sheets = []; // each: {items, parts, shelves:[{y, h, x}]}
  const place = (sh, shelf, p) => { sh.items.push(...tag(xf(p.items, { tx: shelf.x - p.b.x0, ty: shelf.y - p.b.y0 }), p.name)); sh.parts++; shelf.x += p.b.w + g; };
  for (const p of sorted) {
    let done = false;
    for (const sh of sheets) { const shelf = sh.shelves.find(f => p.b.h <= f.h && shelf_fits(f, p)); if (shelf) { place(sh, shelf, p); done = true; break; } }
    if (done) continue;
    for (const sh of sheets) { const last = sh.shelves[sh.shelves.length - 1], y = last.y + last.h + g; if (y + p.b.h <= H - m) { const f = { y, h: p.b.h, x: m }; sh.shelves.push(f); place(sh, f, p); done = true; break; } }
    if (done) continue;
    const sh = { items: [], parts: 0, shelves: [{ y: m, h: p.b.h, x: m }] }; sheets.push(sh); place(sh, sh.shelves[0], p);
  }
  return sheets;
  function shelf_fits(f, p) { return f.x + p.b.w <= W - m; }
}

/* =========================================================================================
   8c. THE THIN PARTS, 3 mm (Wyatt, 2026-08-22): cargo crates, treasure chests, the nested spinner
   ========================================================================================= */
// a box-joint edge from p0 to p1: fingers alternate; "out" protrudes by t on tabs, "in" recedes by t.
// `outward` is the unit normal away from the panel. Returns the points after p0 up to and including p1.
function fingerEdge(p0, p1, outward, t, spec, fingerW = 6) {
  const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ux = (p1[0] - p0[0]) / L, uy = (p1[1] - p0[1]) / L;
  let n = Math.round(L / fingerW); if (n % 2 === 0) n += 1; if (n < 3) n = 3; const seg = L / n, pts = [];
  const P = (sv, d) => [p0[0] + ux * sv + outward[0] * d, p0[1] + uy * sv + outward[1] * d];
  for (let i = 0; i < n; i++) { const tab = (i % 2 === 0) === !!spec.start, d = spec.kind === "out" ? (tab ? t : 0) : (tab ? -t : 0); pts.push(P(i * seg, d), P((i + 1) * seg, d)); }
  pts.push(p1);
  return pts;
}
// hinge knuckles along an edge: every other segment is a tongue of height K with a dowel hole, rounded so it can swing
function knuckleEdge(p0, p1, outward, spec, { K = 6.8, hole = 3.5, r = 3.3, n = 5 } = {}) {
  const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), ux = (p1[0] - p0[0]) / L, uy = (p1[1] - p0[1]) / L, seg = L / n, pts = [], holes = [];
  const P = (sv, d) => [p0[0] + ux * sv + outward[0] * d, p0[1] + uy * sv + outward[1] * d];
  for (let i = 0; i < n; i++) {
    const tab = (i % 2 === 0) === !!spec.start, s0 = i * seg, s1 = (i + 1) * seg;
    if (!tab) { pts.push(P(s0, 0), P(s1, 0)); continue; }
    pts.push(P(s0, 0), P(s0, hole));
    for (let k = 0; k <= 6; k++) { const a = Math.PI + k / 6 * Math.PI / 2; pts.push(P(s0 + r + r * Math.cos(a), hole + r * Math.sin(a) * -1)); }
    for (let k = 0; k <= 6; k++) { const a = -Math.PI / 2 + k / 6 * Math.PI / 2; pts.push(P(s1 - r + r * Math.cos(a), hole + r * Math.sin(a) * -1)); }
    pts.push(P(s1, hole), P(s1, 0));
    holes.push(P((s0 + s1) / 2, hole));
  }
  pts.push(p1);
  return { pts, holes };
}
// a wall panel w×h (nominal) with fingers on the bottom (down into the base) and both vertical edges (into the neighbours)
function wallPanel(w, h, t, { start, top = null }) {
  const pts = [[0, 0]], holes = [];
  if (top && top.kind === "knuckle") { const k = knuckleEdge([0, 0], [w, 0], [0, -1], top); pts.push(...k.pts); holes.push(...k.holes); }
  else pts.push([w, 0]);
  pts.push(...fingerEdge([w, 0], [w, h], [1, 0], t, { kind: "out", start }));
  pts.push(...fingerEdge([w, h], [0, h], [0, 1], t, { kind: "out", start: true }));
  pts.push(...fingerEdge([0, h], [0, 0], [-1, 0], t, { kind: "out", start }));
  const items = [item(CU, [polyCmds(pts)])];
  for (const [hx, hy] of holes) items.push(circ(CU, hx, hy, 1.65));
  return items;
}
// the plate a box stands on (or a lid's top): full footprint, slots around the rim where the walls' fingers land
function platePanel(L, W, t) {
  const pts = [];
  const edge = (a, b, outward) => { const ux = Math.sign(b[0] - a[0]), uy = Math.sign(b[1] - a[1]); const i0 = [a[0] + ux * t, a[1] + uy * t], i1 = [b[0] - ux * t, b[1] - uy * t]; pts.push(a, i0, ...fingerEdge(i0, i1, outward, t, { kind: "in", start: true }), i1); };
  edge([0, 0], [L, 0], [0, -1]); edge([L, 0], [L, W], [1, 0]); edge([L, W], [0, W], [0, 1]); edge([0, W], [0, 0], [-1, 0]);
  return [item(CU, [polyCmds(pts)])];
}
const planks = (x, y, w, h, pitch, vertical = false) => { const out = []; if (vertical) for (let px = x + pitch; px < x + w - 1; px += pitch) out.push(rect(RA, px - .3, y + 1, .6, h - 2)); else for (let py = y + pitch; py < y + h - 1; py += pitch) out.push(rect(RA, x + 1, py - .3, w - 2, .6)); return out; };
// an open cargo crate for a captain's hold: tokens stand on edge in it, icons showing (cargo is public in the game)
function cargoCrate(captain) {
  const t = MAT3, Lo = 44, Wo = 30, H = 18, hw = H - t, parts = [];
  const front = wallPanel(Lo - 2 * t, hw, t, { start: true }), side = wallPanel(Wo - 2 * t, hw, t, { start: false });
  const deco = (w) => [...planks(0, 0, w, hw, 4.5), circ(RA, 2, 2, .7), circ(RA, w - 2, 2, .7), circ(RA, 2, hw - 2, .7), circ(RA, w - 2, hw - 2, .7)];
  parts.push(part(`crate-${captain}-front`, [...front, ...deco(Lo - 2 * t), ...sailPattern(CAPTAINS.indexOf(captain), [[Lo / 2 - 7, 3], [Lo / 2 + 1, 3], [Lo / 2 + 1, hw - 3], [Lo / 2 - 7, hw - 3]])]));
  parts.push(part(`crate-${captain}-back`, [...front, ...deco(Lo - 2 * t)]));
  parts.push(part(`crate-${captain}-side-1`, [...side, ...deco(Wo - 2 * t)]), part(`crate-${captain}-side-2`, [...side, ...deco(Wo - 2 * t)]));
  parts.push(part(`crate-${captain}-base`, platePanel(Lo, Wo, t)));
  return parts.map(p => ({ ...p, mat: MAT3 }));
}
// a treasure chest: coins inside, the captain's recipe card held in the lid where only they can read it
function treasureChest(captain) {
  const t = MAT3, Lo = 80, Wo = 54, Hb = 20, Hl = 10, hb = Hb - t, hl = Hl - t, parts = [], ci = CAPTAINS.indexOf(captain);
  const strap = (w, h) => [rect(RA, w * .25 - 2, 0, 4, h), rect(RA, w * .75 - 2, 0, 4, h), ...[.2, .5, .8].flatMap(f => [{ ...circ(RA, w * .25, h * f, .55), layer: RA }, circ(RA, w * .75, h * f, .55)])];
  const lock = (cx, cy) => [item(RA, [roundCorners([[cx - 4, cy - 4], [cx + 4, cy - 4], [cx + 4, cy + 4], [cx - 4, cy + 4]], 1.2), { circle: { cx, cy: cy - 1, r: 1.1, ccw: true } }, reverseSub(polyCmds([[cx - .7, cy - .4], [cx + .7, cy - .4], [cx + 1, cy + 2.6], [cx - 1, cy + 2.6]]))])];
  // body
  const wFront = Lo - 2 * t, wSide = Wo - 2 * t;
  parts.push(part(`chest-${captain}-front`, [...wallPanel(wFront, hb, t, { start: true }), ...planks(0, 0, wFront, hb, 4.2), ...strap(wFront, hb), ...lock(wFront / 2, hb / 2)]));
  parts.push(part(`chest-${captain}-back`, [...wallPanel(wFront, hb, t, { start: true, top: { kind: "knuckle", start: true } }), ...planks(0, 0, wFront, hb, 4.2), ...strap(wFront, hb)]));
  for (const n of [1, 2]) parts.push(part(`chest-${captain}-side-${n}`, [...wallPanel(wSide, hb, t, { start: false }), ...planks(0, 0, wSide, hb, 4.2)]));
  parts.push(part(`chest-${captain}-base`, platePanel(Lo, Wo, t)));
  // lid: a shallow box; its back wall carries the other half of the hinge on its free edge
  parts.push(part(`chest-${captain}-lid-front`, [...wallPanel(wFront, hl, t, { start: true }), ...planks(0, 0, wFront, hl, 3.5)]));
  parts.push(part(`chest-${captain}-lid-back`, [...wallPanel(wFront, hl, t, { start: true, top: { kind: "knuckle", start: false } }), ...planks(0, 0, wFront, hl, 3.5)]));
  for (const n of [1, 2]) parts.push(part(`chest-${captain}-lid-side-${n}`, [...wallPanel(wSide, hl, t, { start: false }), rect(RA, 1, 3.4, wSide - 2, .4)]));  // the rail line: glue the card rail below it
  parts.push(part(`chest-${captain}-lid-top`, [...platePanel(Lo, Wo, t), ...planks(t, t, Lo - 2 * t, Wo - 2 * t, 5), ...strap(Lo, Wo).map(i => i), ...ftext(RA, CAPTAINS[ci][0] + CAPTAINS[ci].slice(1).toLowerCase(), Lo / 2, Wo / 2 + 1.6, 4.4, { font: "georgia-bold", align: "center" })]));
  for (const n of [1, 2]) parts.push(part(`chest-${captain}-card-rail-${n}`, [rect(CU, 0, 0, wSide, 3, .4)]));
  return parts.map(p => ({ ...p, mat: MAT3 }));
}
// the nested spinner: a backing disc; a fixed dial glued on it (the game's compass); a ring that turns around the dial
// with one pointer = this round's wind; a fleur-de-lis needle on the centre pivot = the forecast. All 3 mm, one M3 bolt.
function nestedSpinner() {
  const RB = 48, RD = 35, RI = RD + 0.4, parts = [];
  parts.push(part("spinner-backing", [circ(CU, 0, 0, RB), circ(CU, 0, 0, 1.65), ring(RA, 0, 0, RD + .2, RD - .3)]));
  const dial = [circ(CU, 0, 0, RD), circ(CU, 0, 0, 1.65), ring(RA, 0, 0, RD - 1, RD - 1.7), ring(RA, 0, 0, RD - 5.6, RD - 6.2), ring(RA, 0, 0, 4.2, 3.4)];
  for (let i = 0; i < 36; i++) { const a = rad(i * 10 + 5), rr = RD - 3.7; dial.push(circ(RA, rr * Math.cos(a), rr * Math.sin(a), .5)); }   // the scrolled band, as a row of beads
  for (let i = 0; i < 4; i++) { const a = rad(-90 + i * 90), rr = RD - 3.6; dial.push(circ(RA, rr * Math.cos(a), rr * Math.sin(a), 5.2)); dial.push({ ...ring(RA, rr * Math.cos(a), rr * Math.sin(a), 5.2, 4.5), layer: RA }); }
  // the medallions: a filled disc with the letter knocked out — exactly the art's N/E/S/W coins
  dial.length = dial.length - 8; // rebuild the medallions as single items below
  for (const [L, a] of [["N", -90], ["E", 0], ["S", 90], ["W", 180]]) { const rr = RD - 3.6, cx = rr * Math.cos(rad(a)), cy = rr * Math.sin(rad(a)); const disc = circ(RA, cx, cy, 5.2); const letter = ftext(RA, L, cx, cy, 6.2, { font: "avenir-next-demibold", align: "center", valign: "middle" }).map(reverseItem); dial.push({ ...disc, sub: [...disc.sub, ...letter.flatMap(i => i.sub)] }); }
  for (const a of [45, 135, 225, 315]) dial.push(...xf([rect(RA, 7, -.4, RD - 14, .8)], { rot: a }));
  for (const q of [-45, 45, 135, 225]) { const a0 = q + 72, a1 = q + 90, pts = []; for (let i = 0; i <= 8; i++) pts.push([22 * Math.cos(rad(a0 + (a1 - a0) * i / 8)), 22 * Math.sin(rad(a0 + (a1 - a0) * i / 8))]); for (let i = 8; i >= 0; i--) pts.push([9 * Math.cos(rad(a0 + (a1 - a0) * i / 8)), 9 * Math.sin(rad(a0 + (a1 - a0) * i / 8))]); const w = poly(RA, pts), am = rad((a0 + a1) / 2), cl = icon("cloudOnly", 15.5 * Math.cos(am), 15.5 * Math.sin(am), 6).map(reverseItem); dial.push({ ...w, sub: [...w.sub, ...cl.flatMap(i => i.sub)] }); }
  dial.push(...icon("anchor", 0, -RD * .32, 7));
  parts.push(part("spinner-dial", dial));
  const ringPart = [circ(CU, 0, 0, RB), circ(CU, 0, 0, RI), ring(RA, 0, 0, RB - 1, RB - 1.6), ...icon("fleur", 0, -(RI + 5.2), 9, 180), ...ftext(RA, "WIND NOW", 0, RB - 2.6, 3, { font: "avenir-next-demibold", align: "center" })];
  for (let i = 0; i < 24; i++) { if (i >= 4 && i <= 8) continue; const rr = RB - 4; ringPart.push(xf([rect(RA, rr - 1.2, -.25, 2.4, .5)], { rot: i * 15 })[0]); }  // no ticks under the WIND NOW label
  parts.push(part("spinner-ring", ringPart));
  const needle = [item(CU, [polyCmds([[-9, -1.6], [14, -1.6], [14, -3.2], [19, -3.2], [26, 0], [19, 3.2], [14, 3.2], [14, 1.6], [-9, 1.6], [-12, 4.2], [-14, 4.2], [-11, 0], [-14, -4.2], [-12, -4.2]])]), circ(CU, 0, 0, 1.65), ring(RA, 0, 0, 3, 2.4), rect(RA, 4, -.4, 9, .8), ...icon("fleur", 20.5, 0, 9, 90)];
  parts.push(part("spinner-needle", needle), part("spinner-washer", [circ(CU, 0, 0, 4), circ(CU, 0, 0, 1.65)]));
  return parts.map(p => ({ ...p, mat: MAT3 }));
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
  { id: "v3", dir: "v3-round", name: "V3 · The Round Table", blurb: "A true circle with a double ring at the water's edge, cut in five: four identical jigsaw quadrants whose seams follow the grid lines around Tortuga, and Tortuga itself as the centre plug. Rim marks are the app's own wind chevron. Docks moor to islands with a little standing post dropped through matching slots. Hexagonal crates, a plain wind dial plus a separate 5-sector storm spinner, flat disc ships." },
];

function buildVersion(V) {
  const v = V.id, docs = [], cutParts = [];
  let five = null;
  if (v === "v3") { five = boardFivePiece(); docs.push(five.assembled); cutParts.push(...five.quadrants, five.plug); }
  else docs.push(board(v));
  // islands: the seven TET footprints, numbered as assets/islands/N.png
  const islandParts = TET.map((_, i) => part(`island-${i + 1}`, islandPiece(v, i))); cutParts.push(...islandParts);
  docs.push(sheet("islands", "Island shapes (7)", islandParts, { notes: v === "v1" ? "Plain edges. Shoreline band and a palm engraved. 0.4 mm clearance per side so they sit inside the squares." : v === "v2" ? "A jigsaw socket is cut into the middle of EVERY outside edge, so a dock can click onto any side of any square." : "A 4.5 mm slot in the middle of every outside edge takes the mooring post of a dock." }));
  // docks
  const dp = ING.map(ing => dockPiece(v, ing));
  const dockParts = dp.map((d, i) => part(`dock-${ING[i]}`, d.dock));
  const dockExtras = dp.flatMap((d, i) => d.extra.length ? [part(v === "v1" ? `pier-top-${ING[i]}` : `mooring-post-${ING[i]}`, d.extra)] : []);
  cutParts.push(...dockParts, ...dockExtras);
  docs.push(sheet("docks", "Docks (7)", [...dockParts, ...dockExtras], { notes: v === "v1" ? "Two layers: the square is the water cell (anchor engraved); the plank strip glues on top, flush with the island-facing edge, and overhangs onto the island by a third of a square. The overhang is what 'attaches' it." : v === "v2" ? "One piece. The nub on the pier side clicks into any island socket. Engraved pier with plank slits and two bollards." : "One piece plus a mooring post. Push the dock against the island so the two slots line up, drop the post through — it stands up like a bollard and locks the pair." }));
  // ingredient crates (4 per ingredient: 3 on the shelf + 1 black-market spare) and island markers
  const crates = ING.flatMap(ing => [0, 1, 2, 3].map(n => part(`crate-${ing}-${n + 1}`, TOKEN[v].crate(ing, 0, 0))));
  cutParts.push(...crates);
  docs.push(sheet("crates", "Ingredient crates (28)", crates, { notes: "Four per ingredient: three to stock an island at 3–4 players, one spare for the black market. Wheat, milk, sugar, eggs, cocoa, cinnamon, vanilla — the app's own icons, redrawn as cuttable outlines." }));
  const markerParts = v === "v3" ? [] : ING.map(ing => part(`marker-${ing}`, TOKEN[v].marker(ing, 0, 0))); cutParts.push(...markerParts);
  if (v !== "v3") docs.push(sheet("markers", "Island markers (7)", markerParts, { notes: "Sits on an island at setup to say which ingredient grows there — the shapes are dealt fresh each game, so the ingredient can't be engraved on the island." }));
  const whirlParts = [0, 1, 2, 3].map(n => part(`whirlpool-${n + 1}`, whirlpool(v === "v1" ? "spiral" : v === "v2" ? "rings" : "swirl", 0, 0))); cutParts.push(...whirlParts);
  docs.push(sheet("whirlpools", "Whirlpools (4)", whirlParts, { notes: "One square each, 0.4 mm clearance. Drop them on any four trade-wind squares — a ship carried by the current gets off at the next whirlpool." }));
  // spinner
  const arr = spinnerArrows(0, 0);
  const spParts = v === "v3" ? nestedSpinner() : [part("dial", spinnerDial(v === "v1" ? "quadrants-storm" : "roulette", 40, 0, 0)), part("arrow-now", arr.now), part("arrow-next", arr.next), part("washer-1", arr.washers[0]), part("washer-2", arr.washers[1])];
  
  cutParts.push(...spParts);
  docs.push(sheet("spinner", "Wind spinner", spParts, { notes: (v === "v1" ? "80 mm dial (also engraved on the board's corner). Each quadrant's last 18° is a storm wedge — one fifth of the wheel, the app's 20%. " : v === "v2" ? "80 mm weather wheel: 20 sectors, the last of every five is a storm sector (20%). " : "Nested, all 3 mm: a 96 mm backing disc; the game's compass as a 70 mm dial glued on it (storm wedge in the last fifth of each quadrant); a ring that turns around the dial with a fleur-de-lis pointer for THIS round's wind; a fleur-de-lis needle on the centre pivot for the forecast. Stack: backing, dial + ring (same level), needle, washer — an M3 × 16 bolt with a nyloc nut. ") + `Two arrows on one pivot: the bold one labelled NOW is this round's wind, the hollow one is the forecast. Stack: dial, hollow arrow, washer, NOW arrow, washer — ${MAT * 3 + 2 * MAT} mm of wood, so an M3 × ${MAT * 5 + 8} bolt and nyloc nut.` }));
  // ships
  const shipParts = [];
  for (let c = 0; c < 4; c++) {
    if (v === "v3") shipParts.push(part(`ship-${CAPTAINS[c]}`, [circ(CU, 0, 0, CELL * .36), ring(RA, 0, 0, CELL * .36 - .7, CELL * .36 - 1.2), ...icon("boat", 0, -CELL * .02, CELL * .5), ...sailPattern(c, [[-CELL * .22, CELL * .2], [CELL * .22, CELL * .2], [CELL * .22, CELL * .3], [-CELL * .22, CELL * .3]])]));
    else { const s = shipStanding(v === "v1" ? "sloop" : "galleon", c); shipParts.push(part(`ship-${CAPTAINS[c]}`, s.profile), part(`ship-base-${CAPTAINS[c]}`, s.base)); }
  }
  cutParts.push(...shipParts);
  docs.push(sheet("ships", "Ships (4)", shipParts, { notes: "Four captains told apart in wood: CRUMBLE plain, BISCOTTI striped, GINGERSNAP dotted, SHORTBREAD checked (pink, teal, green, orange in the app — paint the sails if you like). " + (v === "v3" ? "Flat tokens, one square wide." : "Standing profiles: the tab under the hull drops into the slot in the base.") }));
  // recipes
  const recipeParts = recipeCards(v).map((c, i) => ({ ...part(`recipe-${i + 1}`, c), mat: MAT3 })); cutParts.push(...recipeParts);
  docs.push(sheet("recipes", "Recipe cards (21)", recipeParts, { notes: "Every possible 5-of-7 recipe, exactly once — 21 cards, 64x38 mm. Deal two to each captain, keep one, as the app does." }));
  // extras
  const stormToken = xf([item(CU, [ICONS.cloud()[0].sub[0]]), poly(RA, [[54, 36], [60, 36], [52, 47], [60, 47], [44, 60], [50, 49], [42, 49]])], { s: .34 });
  const extraParts = [part("storm-token", stormToken), part("first-player", [circ(CU, 0, 0, 14), ...icon("wheel", 0, 0, 25)]), part("reference-card", referenceCard())].map(p => ({ ...p, mat: MAT3 })); cutParts.push(...extraParts);
  if (v === "v3") {
    const crateParts = CAPTAINS.flatMap(c => cargoCrate(c)), chestParts = CAPTAINS.flatMap(c => treasureChest(c));
    cutParts.push(...crateParts, ...chestParts);
    docs.push(sheet("crates-boxes", "Cargo crates (4)", crateParts, { count: 4, notes: "One open crate per captain, 44 × 30 × 18 mm in 3 mm ply: box joints, plank engraving, the captain's mark on the front. Tokens stand on edge in it, five across, icons showing — cargo is public, as in the game." }));
    docs.push(sheet("chests", "Treasure chests (4)", chestParts, { count: 4, notes: "One per captain, 80 × 54 × 30 mm in 3 mm ply. Box-jointed body (20 mm) and lid (10 mm) hinged on a 3 mm dowel through five knuckles. The lid is a shallow box: the recipe card (64 × 38) lies inside it against the top, held by two rails glued to the lid's end walls along the engraved line — open the chest and only you read it. Straps, rivets and a lock plate engraved; the captain's name on the lid." }));
  }
  docs.push(sheet("extras", "Extras", extraParts, { notes: "A storm cloud to put on the board when the forecast says storm (the bolt is engraved inside the cut cloud). A ship's wheel for whoever sails first. A rules card with the numbers the app keeps for you." }));
  if (v === "v3") {
    // the cutting sheets: every part, tallest first, on bed-sized sheets, kerf-compensated
    // one run of sheets per material: the board and its tokens in 6 mm, the thin parts in 3 mm
    const thick = packSheets(cutParts.filter(p => (p.mat || MAT) === MAT)), thin = packSheets(cutParts.filter(p => (p.mat || MAT) === MAT3));
    const all = [...thick.map(sh => ({ sh, m: MAT })), ...thin.map(sh => ({ sh, m: MAT3 }))], N = all.length;
    all.forEach(({ sh, m }, i) => docs.splice(1 + i, 0, { id: `sheet-${i + 1}`, title: `Cutting sheet ${i + 1} of ${N} — ${m} mm`, kind: "sheet", kerf: KERF, mat: m, items: kerfCompensate(sh.items, KERF), w: BED_W, h: BED_H, count: sh.parts,
      notes: `${BED_W} × ${BED_H} mm bed, ${m} mm material. Every red line is already pushed ${KERF / 2} mm away from the wood that stays (kerf ${KERF} mm), so cut exactly on the line. ${sh.parts} parts.` }));
  } else {
    const all = docs.filter(d => d.id !== "board"), allParts = all.map(d => part(d.id, d.items));
    docs.push(sheet("pieces-all", "All pieces on one sheet", allParts, { maxW: SHEET_W, notes: `Every piece except the board, nested in a ${SHEET_W} mm wide sheet.`, count: all.reduce((a, d) => a + d.count, 0) }));
  }
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
  out += `<title>Pastry Pirates — ${V.name} — ${doc.title}</title>\n<desc>${doc.notes.replace(/[<>&]/g, "")} Units: mm. ${CELL} mm squares, ${MAT} mm material. ${doc.kind === "sheet" ? `KERF-COMPENSATED: cut lines offset ${KERF / 2} mm outward (kerf ${KERF} mm).` : "No kerf compensation in this file — it is a design view; cut from the sheet-N files."} RASTER = black fill (engrave), CUT = red hairline (cut). Generated by physical-board/generate.mjs.</desc>\n`;
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
const siteData = { cell: CELL, material: MAT, kerf: KERF, bed: [BED_W, BED_H], generated: new Date().toISOString().slice(0, 10), versions: [] };
for (const V of VERSIONS.filter(V => ONLY.includes(V.id))) {
  const built = buildVersion(V), dir = path.join(HERE, V.dir);
  fs.mkdirSync(dir, { recursive: true });
  const groups = [];
  for (const doc of built.docs) {
    const svg = emitSVG(doc, V);
    fs.writeFileSync(path.join(dir, `${doc.id}.svg`), svg);
    fs.writeFileSync(path.join(dir, `${doc.id}.dxf`), emitDXF(doc));
    groups.push({ id: doc.id, title: doc.title, kind: doc.kind || "preview", mat: doc.mat || null, notes: doc.notes, w: doc.w, h: doc.h, count: doc.count, svg });
  }
  siteData.versions.push({ id: V.id, dir: V.dir, name: V.name, blurb: V.blurb, groups });
  console.log(`${V.dir}: ${built.docs.length} files x2 (svg+dxf)`);
}
fs.writeFileSync(path.join(HERE, "site-data.js"), "window.PB_DATA = " + JSON.stringify(siteData) + ";\n");
console.log(`cell ${CELL} mm, material ${MAT} mm — site-data.js written`);
