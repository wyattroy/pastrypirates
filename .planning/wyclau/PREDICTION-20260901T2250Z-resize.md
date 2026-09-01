# PREDICTION — written 2026-09-01T22:50Z, BEFORE any measurement

Item: INBOX-20260901T1335Z part (c), RESIZE. Watch: Wy-Blade, 22:48Z.

His words, which are the spec: *"everything else should be resized and compressed according to its
maximum pixel size in the real gameplay"* — board excepted.

## What I expect to find, and why

The tree is 10.70 MB. `board.png` is 4.34 MB of that and he excepted it, so the subject is the
remaining **6.36 MB**. Weight sits in three tiers nobody has measured:

| tier | files | weight | intrinsic |
|---|---|---|---|
| `pastries/` | 21 | ~1.7 MB | all 512 wide |
| `islands/` | 7 | ~1.6 MB | up to 1054x534 |
| `about-*.jpg` | 4 | ~0.6 MB | up to 1328x1000 |

1. **PASTRIES ARE OVERSIZED.** I predict their largest real slot is a recipe card or an end-of-voyage
   card, and that it lands **well under 256 CSS px**. At 512 intrinsic that is a 2x waste even before
   DPR is considered; at 3x DPR they would be roughly correct, so the decisive question is whether
   the largest slot exceeds ~171 CSS px. Expected saving if I am right: several hundred KB.
2. **ISLANDS ARE NEAR-CORRECT.** Island art is drawn onto the board, and the board is the one thing
   he told us to leave big. I expect their display size to scale with the board's own zoom and
   therefore to need most of what they have.
3. **THE ABOUT JPEGs ARE OVERSIZED AND ALSO NEARLY FREE TO FIX** — a static page, no game code, no
   determinism risk. 1328x1000 for a page image is almost certainly more than the slot.

## What would prove me WRONG

- **A pastry drawn full-bleed at stage width.** If any real slot puts a pastry across a phone's
  whole 390px stage, then at 3x DPR it wants 1170 device px and the 512 it has is already
  UNDER-resolution — the opposite of my prediction, and the pastries must not shrink at all. If I
  find that slot, this item's honest answer is much smaller than his sentence implies and I will say
  so rather than shrink something that then looks worse.
- **Islands drawn at a fixed small size**, not scaled with the board zoom, would make prediction 2
  wrong in the profitable direction.
- **`zoomCap` reaching further than the previous watch measured.** Its figure was 600px-equivalent
  x 2.2 for the icon family. If island/pastry art rides a different cap, my whole arithmetic moves.

## The instrument risk I am naming in advance

The previous watch's `asset_alpha_probe` rounded 19 non-opaque pixels to "0.0%" and nearly filed a
false finding. **A resize is judged by a picture, not a percentage** (rule 26): any file I shrink
gets a posed before/after at its real slot, and a mean-error number is corroboration, never the
verdict. I will not ship a shrink I have not looked at.

## The line I will not cross

This is commissioned art. **Where the measurement says a file is already at or under its slot, it
does not shrink** — even though shrinking would make the total look better, and even though his
sentence asks for "everything else". The measurement is the spec; his sentence is what the
measurement is FOR.
