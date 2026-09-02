# PREDICTION — `assets/board.png` to WebP, pixels untouched

*Written 2026-09-02T08:10Z, BEFORE any measurement, per CLAUDE.md rule 6's working form. Its whole
value is that it cannot be retrofitted.*

## What I am about to do

Re-encode `assets/board.png` (2132×2132, 4.34 MB) as WebP at **exactly its own pixel dimensions**,
using the mechanism the recipe art already proved on this library an hour ago — a headless-Chrome
canvas, `toDataURL("image/webp", 0.92)` (`scripts/qa/pastry_reexport.mjs`). No resampling. Then
repoint the two `BOARD_IMG` constants (`src/shared/index.js:36` and `classic/src/shared/index.js:27`)
and delete the PNG, so `/classic` keeps sharing the one file exactly as Wyatt ruled for the pastries.

## What happened immediately BEFORE (rule: widen the time horizon)

Nothing broke; this is not a bug hunt. But the thing that happened just before is why this file is
still 4.34 MB after two days of a launch-critical compression item: the **2026-09-01 compression
pass excluded it BY NAME** — `scripts/qa/asset_quantize.mjs:22`, `EXCLUDE = new Set(['assets/board.png'])`
— reading Wyatt's *"the only one that needs to be as big as it is is the board itself"* as a total
exemption. Every later measurement then subtracted it from the subject before reporting ("excluding
`board.png` … 6.36 MB remains", `CTO-LEDGER.md:2525`). **The exclusion propagated into the framing,
so the biggest file in the game stopped being counted as work.** That is the preceding event.

## What I expect, with numbers, so I can be caught out

1. **WebP at q0.92 lands between 0.9 MB and 1.5 MB** — a 65–80% saving. The board is a painted
   illustration: large smooth washes of sea, few hard edges, exactly the content WebP's lossy
   encoder is strongest on, and exactly the content PNG's per-row filters are weakest on.
   **What proves me wrong: anything above 2.5 MB** (under a 45% saving). If that happens, the
   board has far more high-frequency texture than I think and lossless is the honest comparison.
2. **WebP LOSSLESS lands between 2.5 MB and 3.5 MB** — only a 20–40% saving, and therefore not
   worth the extra care. Prediction stated so the lossy/lossless choice is decided by a number
   rather than by preference.
3. **The picture will be indistinguishable at the largest size the board is ever drawn.** Measured
   already, not assumed: `.planning/ASSET-DISPLAY-SIZES.md:22` says the board's maximum is
   **2168×2168 device pixels** at max zoom on a tablet, against a 2132px file — a ratio of x0.49,
   i.e. **the board is already about 1:1 at full zoom and very slightly UNDER-resolution.**
   **What proves me wrong: visible banding in the sea washes, or softened coastlines, in the posed
   pair at max zoom.** This is the failing case that actually matters — a saving I would refuse.
4. **The alpha channel is dead weight and its loss costs nothing.** `PREDICTION-20260901T2230Z-assets.md:15`
   measured `board.png` as **0.0% of pixels anything but fully opaque**. WebP will still carry an
   alpha plane unless the encoder drops it; I expect no visual consequence either way.
5. **Nothing else in the game has to change.** Two `BOARD_IMG` constants, one preload list that is
   derived from the directory rather than typed (`assets/` is walked), and one SVG `<image href>`
   in each game (`src/ui/board.js:271`, `classic/src/ui/board.js:160`).
   **What proves me wrong: any hand-typed manifest naming `board.png`.** If one exists I have
   under-counted the reach and the change is bigger than I said in the ledger.

## The one thing I am least sure of

`toDataURL` on a 2132×2132 canvas returns a base64 string of maybe 1.5–2 MB, and that has to cross
the CDP evaluate boundary in one piece. The pastry script did this at 896px, four times smaller.
**If it returns nothing usable, that is a tooling limit, not a finding about the board** — I will
chunk the transfer rather than conclude anything about the art.

## The check that must go RED first

`scripts/qa/asset_weight_check.mjs` with `assets.ceilingBytes` ratcheted down to the post-conversion
total. It must FAIL on today's tree (10.05 MB against the new ceiling) and PASS after. That is the
same maintenance shape the gate's own comment describes, run in the four-steps order.
