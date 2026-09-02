# PREDICTION — written BEFORE any measurement, watch 2026-09-02T15:39Z, item `T-087`

*Rule 6's working form: write down what you expect and why, name what would prove you wrong, then
measure, then say plainly which parts were wrong. Composed before `asset_display_size_probe.mjs`
was re-run even once.*

## The item

`INBOX-20260901T1335Z` part (c): *"everything else should be resized and compressed according to
its maximum pixel size in the real gameplay."* Chart row `T-087`. The only measurement that exists
(`.planning/ASSET-DISPLAY-SIZES.md`, generated 2026-09-01T23:55Z) names `assets/board.png`, seven
islands and 21 pastries — **none of which are on disk**, because two WebP renames have landed since.

## What happened immediately before (rule: widen the time horizon)

Between that measurement and now, ~200 image files were **renamed** from `.png`/`.jpg` to `.webp`
by the compression work (`fbbf44ad` and the pastry pass). Nothing about the display-size probe was
touched in those commits. **So the interesting question is not "what does the probe say" but "can
the probe still see the library at all".**

## PREDICTION 1 — the probe is now BLIND to most of the library, and will not say so

`asset_display_size_probe.mjs`'s `intrinsic(file)` (line ~305) reads a PNG signature or walks JPEG
SOF markers, and **has no WebP branch**. Its caller does `if (!nat) continue;`. The directory walk
*does* collect `.webp`. So I expect every `.webp` file to be **dropped from the report entirely** —
not listed as NOT SEEN, not listed as oversized, simply absent — while the report's own header
still claims to answer his question.

There are **53 `.webp`, 90 `.png`, 6 `.jpg`** on disk today. I expect the regenerated table to have
about **96 rows instead of 149**, and to omit the heaviest single file in the game
(`assets/board.webp`).

**What would prove me wrong:** the regenerated `ASSET-DISPLAY-SIZES.md` contains a row for
`assets/board.webp` or any other `.webp` path. If it does, `intrinsic()` handles WebP by some route
I did not read, and this prediction is simply wrong.

**Why this matters more than the resize itself:** an instrument that silently omits its subject
reports something about ITSELF, not about the world — and a report headed *"the measured maximum
each picture is drawn at"* that quietly covers two thirds of the pictures is exactly the
*reassuring* failure this project keeps paying for (`HARD-WON-LESSONS.md` §3).

## PREDICTION 2 — the honest saving left is SMALL, and smaller than the stale file claims

The stale report offers 25 candidates / ~0.34 MB. I expect the true number, once WebP files are
visible, to be **of that order or smaller** — because the two heaviest families have already been
measured and found NOT oversized (pastries are ~40% too *small* at their modal slot; islands sit
under the camera's zoom ceiling), and because WebP re-encoding has already taken the bytes out of
the files a resize would have targeted.

**What would prove me wrong:** a candidate list over ~1 MB recoverable after the WebP files become
visible. That is possible — nobody has ever measured a `.webp` in this game against its slot.

## PREDICTION 3 — nothing ships a resize this watch

I expect to close this watch having **fixed the instrument and re-stated the candidate list**, not
having resized art. Resizing down softens art on a retina phone (measured, `INBOX-20260902T0048Z`),
so each candidate wants its own posed pair, and one watch is one item.

**What would prove me wrong:** a candidate so plainly oversized (say x2 or more, on a file of real
weight) that one posed pair settles it inside this watch. If that appears, it ships.
