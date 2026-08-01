#!/usr/bin/env python3
"""Crop, chroma-key and resize the approved island-square scene art into game-ready
transparent PNGs. Implements notes/art-generation-process.md §7 exactly.

Per-file: detect background by sampling the four corners (backgrounds VARY across this
batch — some white, some near-black #000001 — so never assume one), crop to the largest
significant foreground component(s) (ignoring the bottom-right watermark sparkle), key
ONLY border-connected background to real alpha via an inward flood-fill (so dark shading
enclosed by the art is never punched out), premultiply -> Lanczos resize -> un-premultiply,
preserving the natural aspect ratio. PIL + numpy only (no scipy — pure-Python BFS on a
downsampled mask, which is plenty fast and matches the runbook's guidance).
"""
import os
from collections import deque
import numpy as np
from PIL import Image

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(REPO, "art-review", "islands")
OUT_DIR = os.path.join(REPO, "assets", "islands", "scenes")

# (source filename, ingredient key) — drive the mapping explicitly; the filename slugs
# are historical and NO LONGER describe the art, so never infer the ingredient from them.
JOBS = [
    ("1-egg-chicken-coop.png",    "eggs"),
    ("2-wheat-toaster-mill.png",  "wheat"),
    ("3-chocolate-whirlpool.png", "cocoa"),
    ("4-sugar-candyland.png",     "sugar"),
    ("5-milk-dairy-farm.png",     "dairy"),
    ("6-vanilla-custard-tub.png", "vanilla"),
    ("7-spice-market-stall.png",  "spice"),
]

TARGET_LONG = 320       # long-side resolution (board-pop scale, retina headroom)
DS = 8                  # downsample factor for component labeling + flood fill
CROP_THRESH = 60.0      # color distance for the foreground (bbox) mask
MIN_COMP_FRAC = 0.0005  # keep components >= 0.05% of total area
WM_FRAC = 0.15          # bottom-right watermark exclusion zone
KEY_THRESH = 45.0       # below this distance = solid background (alpha 0)
KEY_FEATHER = 30.0      # ramp width above KEY_THRESH up to fully opaque


def detect_bg(rgb):
    """Cluster the four corner-patch means into distinct background colors. Some images
    have a SPLIT background (e.g. near-black at top, white at bottom), so a single bg
    color is wrong — return every distinct corner color and key against all of them."""
    h, w, _ = rgb.shape
    k = 12
    patches = [rgb[:k, :k], rgb[:k, w - k:], rgb[h - k:, :k], rgb[h - k:, w - k:]]
    means = [p.reshape(-1, 3).mean(axis=0).astype(np.float32) for p in patches]
    bgs = []
    for m in means:
        if not any(np.linalg.norm(m - b) < 45 for b in bgs):
            bgs.append(m)
    return bgs  # list of 1-4 bg colors


def color_dist(rgb, bgs):
    """Distance to the NEAREST background color (min across all detected bg colors)."""
    arr = rgb.astype(np.float32)
    d = None
    for bg in bgs:
        di = np.sqrt(((arr - bg) ** 2).sum(axis=2))
        d = di if d is None else np.minimum(d, di)
    return d


def downsample_any(mask, ds):
    """Max-pool a boolean mask by `ds` (a block is True if any pixel is True)."""
    h, w = mask.shape
    hh, ww = (h + ds - 1) // ds, (w + ds - 1) // ds
    out = np.zeros((hh, ww), dtype=bool)
    for by in range(hh):
        for bx in range(ww):
            out[by, bx] = mask[by * ds:(by + 1) * ds, bx * ds:(bx + 1) * ds].any()
    return out


def components(mask):
    """4-connected components on a small boolean mask -> list of pixel-lists."""
    h, w = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    comps = []
    for y in range(h):
        for x in range(w):
            if mask[y, x] and not seen[y, x]:
                q = deque([(y, x)])
                seen[y, x] = True
                cells = []
                while q:
                    cy, cx = q.popleft()
                    cells.append((cy, cx))
                    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            q.append((ny, nx))
                comps.append(cells)
    return comps


def flood_bg(cand):
    """Flood-fill inward from the four edges over `cand` (could-be-bg) -> border-connected bg."""
    h, w = cand.shape
    out = np.zeros_like(cand, dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if cand[y, x] and not out[y, x]:
                out[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if cand[y, x] and not out[y, x]:
                out[y, x] = True
                q.append((y, x))
    while q:
        cy, cx = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and cand[ny, nx] and not out[ny, nx]:
                out[ny, nx] = True
                q.append((ny, nx))
    return out


def process(src_path, out_path):
    img = Image.open(src_path).convert("RGB")
    rgb = np.asarray(img)
    H, W, _ = rgb.shape
    bgs = detect_bg(rgb)
    dist = color_dist(rgb, bgs)

    # --- crop to significant foreground components (watermark excluded) ---
    fg = dist > CROP_THRESH
    wm_y0, wm_x0 = int(H * (1 - WM_FRAC)), int(W * (1 - WM_FRAC))
    fg[wm_y0:, wm_x0:] = False
    ds_fg = downsample_any(fg, DS)
    min_cells = max(1, int(MIN_COMP_FRAC * ds_fg.size))
    boxes = []
    for comp in components(ds_fg):
        if len(comp) >= min_cells:
            ys = [c[0] for c in comp]; xs = [c[1] for c in comp]
            boxes.append((min(ys), min(xs), max(ys), max(xs)))
    if not boxes:  # degenerate fallback: whole image
        boxes = [(0, 0, ds_fg.shape[0] - 1, ds_fg.shape[1] - 1)]
    y0 = min(b[0] for b in boxes) * DS
    x0 = min(b[1] for b in boxes) * DS
    y1 = (max(b[2] for b in boxes) + 1) * DS
    x1 = (max(b[3] for b in boxes) + 1) * DS
    pad = int(round(0.01 * max(H, W)))
    y0 = max(0, y0 - pad); x0 = max(0, x0 - pad)
    y1 = min(H, y1 + pad); x1 = min(W, x1 + pad)
    crop = rgb[y0:y1, x0:x1]
    ch, cw, _ = crop.shape

    # --- key border-connected background to real alpha (full-res crop, before resize) ---
    cdist = color_dist(crop, bgs)
    cand = cdist < (KEY_THRESH + KEY_FEATHER)
    ds_cand = downsample_any(cand, DS)  # max-pool: a block counts as candidate if ANY pixel is
    ds_border_bg = flood_bg(ds_cand)
    # upsample the low-res border-bg region and dilate by one block so the blocky low-res
    # boundary never eats real background right at its own edge
    border_up = np.repeat(np.repeat(ds_border_bg, DS, axis=0), DS, axis=1)[:ch, :cw]
    dil = border_up.copy()
    dil[:-1, :] |= border_up[1:, :]; dil[1:, :] |= border_up[:-1, :]
    dil[:, :-1] |= border_up[:, 1:]; dil[:, 1:] |= border_up[:, :-1]
    # alpha: opaque by default; where a pixel is both a bg-candidate AND border-connected,
    # ramp alpha from 0 (dist<=KEY_THRESH) up to 255 (dist>=KEY_THRESH+KEY_FEATHER)
    alpha = np.full((ch, cw), 255.0, dtype=np.float32)
    ramp = np.clip((cdist - KEY_THRESH) / KEY_FEATHER, 0.0, 1.0) * 255.0
    keyable = dil & (cdist < (KEY_THRESH + KEY_FEATHER))
    alpha[keyable] = ramp[keyable]

    rgba = np.dstack([crop.astype(np.float32), alpha]).astype(np.float32)

    # --- premultiply -> Lanczos resize -> un-premultiply (aspect preserved, long side = TARGET_LONG) ---
    scale = TARGET_LONG / max(ch, cw)
    nw, nh = max(1, round(cw * scale)), max(1, round(ch * scale))
    a = rgba[..., 3:4] / 255.0
    premult = rgba.copy(); premult[..., :3] = rgba[..., :3] * a
    resized = np.asarray(
        Image.fromarray(premult.astype(np.uint8), "RGBA").resize((nw, nh), Image.LANCZOS)
    ).astype(np.float32)
    ra = resized[..., 3:4] / 255.0
    out = resized.copy()
    out[..., :3] = np.clip(resized[..., :3] / np.where(ra > 0, ra, 1.0), 0, 255)
    Image.fromarray(out.astype(np.uint8), "RGBA").save(out_path)

    op = (out[..., 3] > 8).mean() * 100
    bgdesc = " / ".join(f"({int(b[0])},{int(b[1])},{int(b[2])})" for b in bgs)
    print(f"  {os.path.basename(out_path):14s} bg=[{bgdesc}]  crop {cw}x{ch} -> {nw}x{nh}  opaque {op:.0f}%")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Processing {len(JOBS)} island scenes -> {os.path.relpath(OUT_DIR, REPO)}/")
    for src, ing in JOBS:
        process(os.path.join(SRC_DIR, src), os.path.join(OUT_DIR, f"{ing}.png"))
    print("done.")


if __name__ == "__main__":
    main()
