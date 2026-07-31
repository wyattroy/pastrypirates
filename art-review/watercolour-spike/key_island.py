#!/usr/bin/env python3
"""Chroma-key + crop + resize one watercolour island generation into a game-ready
transparent PNG. Same approach as scripts/process_island_scenes.py (border-connected
flood fill so enclosed dark pigment is never punched out), pared down to a single file.
Scratch tool — lives outside the repo until the style is approved.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image

SRC, OUT, TARGET_LONG = sys.argv[1], sys.argv[2], int(sys.argv[3])
DS = 8                 # downsample factor for the flood fill
KEY_THRESH = 45.0      # below this colour distance from bg = fully transparent
KEY_FEATHER = 30.0     # ramp width above KEY_THRESH up to fully opaque
WM_FRAC = 0.15         # bottom-right watermark exclusion zone for the crop

im = Image.open(SRC).convert("RGB")
rgb = np.asarray(im).astype(np.float32)
H, W, _ = rgb.shape

# background colour = mean of the four corner patches (all near-black here)
c = 24
corners = [rgb[:c, :c], rgb[:c, -c:], rgb[-c:, :c], rgb[-c:, -c:]]
bg = np.mean([p.reshape(-1, 3).mean(axis=0) for p in corners], axis=0)
dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))

# flood fill inward from the borders over a downsampled mask, so only background that
# actually touches the edge is keyed — dark pigment enclosed by the art stays opaque
small = dist[::DS, ::DS]
sh, sw = small.shape
isbg = small < KEY_THRESH
reached = np.zeros_like(isbg)
q = deque()
for x in range(sw):
    for y in (0, sh - 1):
        if isbg[y, x] and not reached[y, x]:
            reached[y, x] = True; q.append((y, x))
for y in range(sh):
    for x in (0, sw - 1):
        if isbg[y, x] and not reached[y, x]:
            reached[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < sh and 0 <= nx < sw and isbg[ny, nx] and not reached[ny, nx]:
            reached[ny, nx] = True; q.append((ny, nx))

outside = np.asarray(Image.fromarray((reached * 255).astype(np.uint8)).resize((W, H), Image.NEAREST)) > 127
alpha = np.clip((dist - KEY_THRESH) / KEY_FEATHER, 0, 1)
alpha[~outside] = 1.0          # anything the fill never reached is real artwork
alpha = (alpha * 255).astype(np.uint8)

# crop to the real design, ignoring the watermark sparkle Gemini stamps bottom-right
soliddesign = alpha > 200
soliddesign[int(H * (1 - WM_FRAC)):, int(W * (1 - WM_FRAC)):] = False
ys, xs = np.where(soliddesign)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1

out = np.dstack([rgb.astype(np.uint8), alpha])[y0:y1, x0:x1]
img = Image.fromarray(out, "RGBA")

# premultiply -> resize -> un-premultiply, so transparent black doesn't bleed into edges
a = np.asarray(img).astype(np.float32)
a[..., :3] *= (a[..., 3:4] / 255.0)
img = Image.fromarray(a.astype(np.uint8), "RGBA")
w, h = img.size
s = TARGET_LONG / max(w, h)
img = img.resize((max(1, round(w * s)), max(1, round(h * s))), Image.LANCZOS)
a = np.asarray(img).astype(np.float32)
np.divide(a[..., :3], (a[..., 3:4] / 255.0), out=a[..., :3], where=a[..., 3:4] > 0)
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGBA").save(OUT)
print(f"{SRC} {W}x{H} -> {OUT} {img.size[0]}x{img.size[1]}  (bg {bg.astype(int)})")
