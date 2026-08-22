#!/usr/bin/env python3
"""trace.py — the game's ingredient art (assets/ingredients/*.png) as cuttable vectors.

Wyatt, 2026-08-22: "each ingredient to just be the ingredient icon itself, cut out ... among the real
organic border of the art png". So: the CUT outline is the art's alpha silhouette (dilated a hair so
the drawn outline is not at the very edge), and the RASTER is the art's dark line-work and shadows —
the same drawing, as a woodcut. Pixel grids are traced as unions of unit squares, so outer loops and
holes come out with opposite winding and nonzero fill needs nothing more.

  python3 physical-board/art/trace.py physical-board/art/ingredients.json

Output is in pixel units; the generator scales each token to size.
"""
import json, sys, math
from PIL import Image, ImageFilter

REPO = "/Users/wyattroy/Documents/Projects/pastrypirates"

def trace(mask, w, h):
    edges = {}
    def add(a, b):
        if (b, a) in edges: del edges[(b, a)]
        else: edges[(a, b)] = True
    for y in range(h):
        row = mask[y]
        for x in range(w):
            if row[x]:
                add((x, y), (x + 1, y)); add((x + 1, y), (x + 1, y + 1)); add((x + 1, y + 1), (x, y + 1)); add((x, y + 1), (x, y))
    nxt = {}
    for (a, b) in edges: nxt.setdefault(a, []).append(b)
    loops = []
    while nxt:
        start = next(iter(nxt)); cur = start; loop = []
        while True:
            loop.append(cur)
            outs = nxt.get(cur)
            if not outs: break
            b = outs.pop()
            if not outs: del nxt[cur]
            cur = b
            if cur == start: break
        if len(loop) > 3: loops.append(loop)
    return loops

def smooth(pts, win=2):
    n = len(pts); out = []
    for i in range(n):
        sx = sy = 0
        for k in range(-win, win + 1):
            p = pts[(i + k) % n]; sx += p[0]; sy += p[1]
        out.append((sx / (2 * win + 1), sy / (2 * win + 1)))
    return out

def dp(pts, tol):
    if len(pts) < 6: return pts
    def simp(seg):
        if len(seg) < 3: return seg
        a, b = seg[0], seg[-1]; dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 1
        best, bi = -1, 0
        for i in range(1, len(seg) - 1):
            d = abs((seg[i][0] - a[0]) * dy - (seg[i][1] - a[1]) * dx) / L
            if d > best: best, bi = d, i
        if best > tol: return simp(seg[:bi + 1])[:-1] + simp(seg[bi:])
        return [a, b]
    far = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]))
    h1 = simp(pts[:far + 1]); h2 = simp(pts[far:] + [pts[0]])
    return h1[:-1] + h2[:-1]

def area(pts):
    return sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts))) / 2

ING = ["wheat", "dairy", "sugar", "eggs", "cocoa", "spice", "vanilla"]
INK = {"sugar": 205, "eggs": 150, "dairy": 150}   # lighter art needs a lighter ink threshold
out = {}
for ing in ING:
    im = Image.open(f"{REPO}/assets/ingredients/{ing}.png").convert("RGBA")
    w, h = im.size
    a = im.split()[3]
    sil = a.point(lambda v: 255 if v > 110 else 0).filter(ImageFilter.MaxFilter(5))   # dilate ~2px
    px = im.load(); silpx = sil.load()
    silmask = [[1 if silpx[x, y] else 0 for x in range(w)] for y in range(h)]
    dark = [[1 if (px[x, y][3] > 110 and (0.299 * px[x, y][0] + 0.587 * px[x, y][1] + 0.114 * px[x, y][2]) < INK.get(ing, 112)) else 0 for x in range(w)] for y in range(h)]
    cut = [dp(smooth(l, 2), 0.9) for l in trace(silmask, w, h)]
    ras = [dp(smooth(l, 1), 0.6) for l in trace(dark, w, h)]
    big = max(abs(area(l)) for l in cut)
    cut = [l for l in cut if abs(area(l)) > big * 0.02]          # drop specks; keep real holes
    ras = [l for l in ras if abs(area(l)) > 6]
    xs = [p[0] for l in cut for p in l]; ys = [p[1] for l in cut for p in l]
    out[ing] = {"w": w, "h": h, "bbox": [min(xs), min(ys), max(xs), max(ys)],
                "cut": [[[round(x, 1), round(y, 1)] for x, y in l] for l in cut],
                "raster": [[[round(x, 1), round(y, 1)] for x, y in l] for l in ras]}
    print(ing, "cut loops", len(cut), "raster loops", len(ras), "bbox", out[ing]["bbox"], file=sys.stderr)
json.dump(out, open(sys.argv[1], "w"))
