# The WebP conversion, file by file — 2026-09-02, `T-058`

*Written so the numbers can be CHECKED rather than taken on trust. **CEO 97's third finding on the
board conversion was that its fidelity measurement lived nowhere and could never be re-run once
`board.png` was deleted.** The same trap is sharper here: 31 PNGs were deleted, so
`png_family_reexport.mjs --dry` can no longer measure any of them. This file is the measurement.
Reproduce any row with:*

```
node scripts/qa/art_posed_pair.mjs --before=<commit-before-05f63b12> --tag=check --scale=3 <assets/…png>
```

**His ask, `INBOX-20260901T1335Z`, and he called it launch critical:** *"compressing the images to
make the game load MUCH faster… everything else should be resized and compressed according to its
maximum pixel size in the real gameplay."* **Nothing here was resized.** Same pixel dimensions in,
same out; the format underneath is all that changed.

## The totals

| | bytes | |
|---|---|---|
| `assets/` when he raised this (2026-09-01) | 18,653,+ | ~17.79 MB |
| `assets/` at the start of this watch | 6,293,140 | 6.00 MB |
| **`assets/` after** | **4,073,895** | **3.89 MB** |

PNG families in scope: 121 files, 4,191,954 bytes. **31 converted, 90 refused.** `package.json`'s
`assets.ceilingBytes` is 4,073,895 — the real total to the byte, so the next increase is a decision
somebody takes rather than drift nobody sees.

## What the columns mean

- **solid** — mean absolute colour difference, worst channel per pixel, over pixels whose SOURCE
  alpha is ≥ 250. This is the number that describes the picture a player sees.
- **all** — the same over every pixel with any opacity at all, feathered edges included. It runs
  higher and that is arithmetic, not damage: the canvas premultiplies, so a pixel at alpha 1/255
  stores its colour with almost no precision. `islands/7` reported a "worst pixel" of **255** on
  that measure and a worst SOLID pixel of **20**. Reporting only one of these two numbers would
  mislead in one direction or the other, so the tool reports both.
- **alpha** — maximum movement in the alpha channel over every pixel. **It is 0 for every file
  below**, which is the claim that mattered: unlike the board, these are cut-outs, and a canvas
  that composited instead of preserving alpha would have put a solid block behind every island
  while every byte count stayed green (the W5-1 failure: numbers right, picture wrong).
- **arm** — WebP q0.92 (lossy) or WebP lossless, whichever came back smaller from the same draw.

## The 31 that converted

| file | KB before | KB after | lighter | arm | alpha | solid | all |
|---|---|---|---|---|---|---|---|
| `islands/5.png` | 636 | 64 | 90% | q0.92 | 0 | 2.53 | 2.53 |
| `islands/3.png` | 284 | 114 | 60% | q0.92 | 0 | 3.48 | 3.14 |
| `islands/1.png` | 208 | 85 | 59% | q0.92 | 0 | 3.54 | 3.19 |
| `compass/compass-dial.png` | 200 | 92 | 54% | q0.92 | 0 | 5.33 | 5.85 |
| `islands/6.png` | 158 | 24 | 85% | q0.92 | 0 | 3.75 | 5.09 |
| `islands/7.png` | 148 | 23 | 84% | q0.92 | 0 | 3.66 | 4.95 |
| `islands/4.png` | 143 | 25 | 83% | q0.92 | 0 | 3.51 | 4.57 |
| `islands/2.png` | 136 | 22 | 84% | q0.92 | 0 | 3.59 | 4.83 |
| `icons/flip-socket.png` | 131 | 79 | 40% | q0.92 | 0 | 4.57 | 4.99 |
| `dock.png` | 110 | 14 | 88% | q0.92 | 0 | 3.28 | 5.28 |
| `trade-swirl.png` | 109 | 12 | 89% | q0.92 | 0 | 3.53 | 7.11 |
| `ingredients/vanilla.png` | 90 | 15 | 83% | q0.92 | 0 | 3.27 | 5.91 |
| `ingredients/cocoa.png` | 72 | 12 | 83% | q0.92 | 0 | 3.28 | 5.16 |
| `ingredients/wheat.png` | 70 | 15 | 79% | q0.92 | 0 | 4.19 | 7.47 |
| `ingredients/spice.png` | 67 | 12 | 82% | q0.92 | 0 | 3.50 | 5.29 |
| `boats/2.png` | 45 | 9 | 80% | q0.92 | 0 | 3.60 | 5.61 |
| `boats/4.png` | 45 | 9 | 80% | q0.92 | 0 | 3.37 | 5.57 |
| `boats/1.png` | 44 | 9 | 80% | q0.92 | 0 | 3.27 | 5.39 |
| `boats/3.png` | 44 | 9 | 81% | q0.92 | 0 | 3.69 | 5.77 |
| `clock/clock.png` | 43 | 24 | 44% | q0.92 | 0 | 4.63 | 5.21 |
| `icons/wave.png` | 39 | 26 | 33% | q0.92 | 0 | 3.10 | 4.56 |
| `icons/hourglass.png` | 22 | 8 | 61% | q0.92 | 0 | **13.17** | 15.36 |
| `ingredients/eggs.png` | 13 | 9 | 33% | q0.92 | 0 | 2.72 | 16.56 |
| `wind-arrow.png` | 15 | 4 | 72% | q0.92 | 0 | 2.31 | 1.35 |
| `icons/speech-bubble.png` | 9 | 6 | 36% | q0.92 | 0 | 3.23 | 5.11 |
| `ingredients/holes/wheat.png` | 5 | 3 | 32% | **lossless** | 0 | 0.00 | 0.00 |
| `ingredients/holes/vanilla.png` | 5 | 4 | 23% | q0.92 | 0 | 0.00 | 0.00 |
| `ingredients/holes/cocoa.png` | 4 | 3 | 24% | q0.92 | 0 | 0.00 | 0.00 |
| `ingredients/holes/spice.png` | 3 | 3 | 20% | q0.92 | 0 | 0.00 | 0.00 |
| `ingredients/holes/sugar.png` | 3 | 2 | 19% | q0.92 | 0 | 0.00 | 0.00 |
| `ingredients/holes/eggs.png` | 2 | 2 | 12% | q0.92 | 0 | 0.00 | 0.00 |

**The `holes/` family is the one place the 31% floor was deliberately overridden** (`--floor=0`),
and the reason is in the table: those files are pure silhouettes and their measured difference is
**0.00 on every pixel**, so there is no fidelity to trade. They were converted whole to keep the
family from needing a per-file lookup for a 1.6 KB win. `holes/dairy.png` still refused itself —
it is larger as WebP — so the family is 6 WebP and 1 PNG, and `ING_HOLE_FMT` in both trees records
exactly that.

**`icons/hourglass` is the one outlier and it was photographed, not argued about.**
`.planning/posed/png-webp-worst-3x.png` shows it at 3× nearest-neighbour beside its original: the
gold frame, the pink blossoms, the teal glass and the cream sand all read the same; the black
interior is very slightly mottled where it was flat. The game draws this icon at a few dozen
pixels. Rule 26 — the number could not settle it, the picture could.

## The 90 that were refused, and why that is the tool working

- **64 files came back HEAVIER as WebP**, every one a small flat few-colour icon. PNG's best case
  is WebP's worst. The lossless arm was added specifically to rescue them and **won for exactly one
  file in 121** — so PNG's own entropy coding is already at least as good as WebP's on this
  library's flat art. That is a measurement with a date on it, not a standing claim.
- **26 more saved something but under the 31% floor.** The floor is the smallest saving Wyatt has
  already approved on this library — the recipe art, `INBOX-20260902T0048Z`, his *"Do it"*. Below
  it, a file costs a lossy re-encode of his commissioned art, a reference edit in two games, and
  measurable colour movement, in exchange for bytes nobody can perceive. `icons/blocked-slash.png`
  is the worked example: **0% lighter, and its colour would have moved 9.96/255.**

## What is left in `assets/`, honestly

| | |
|---|---|
| pastries (WebP already, `T-004`) | 1.18 MB |
| icons — 90 refused PNGs | 1.12 MB |
| top level (board.webp + the JPEGs) | 0.85 MB |
| islands | 0.35 MB |
| everything else | 0.39 MB |

**The largest untouched block is now the three JPEGs** — `about-screenshot.jpg` 273 KB,
`about-recipes.jpg` 114 KB, `logo.jpg` 92 KB, `welcome-backdrop.jpg` 71 KB. They are already a
lossy format; whether WebP beats JPEG on them is a separate measurement nobody has taken, and it is
worth at most a few hundred KB. **It is not the same trade and should not be assumed to pay.**
