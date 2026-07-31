---
quick_id: 260731-cdx
slug: archive-watercolour-board-art-spike
date: 2026-07-31
status: complete
outcome: spike-abandoned
branch: claude/test-game-new-board-77f669
merged: false
---

# Summary: Archive watercolour board art spike

## What happened

Wyatt supplied a new watercolour board and asked to see the game running on it. Once it was
rendering, the mismatch between the soft watercolour water and the hard-outlined cartoon
scenery became the real question, so the spike extended into testing whether the rest of the
board (islands, docks, compass) could be restyled to match using the existing Gemini pipeline
in `notes/art-generation-process.md`.

One island was generated, background-keyed, and rendered in-game beside the existing cartoon
islands for a direct comparison.

**Outcome: not proceeding with AI-generated art.** The style direction was validated, but the
output was too pale and too low-contrast, and Wyatt is commissioning a human artist. The
branch is pushed for reference and deliberately not merged.

## Deliverables

| File | What |
|---|---|
| `art-review/watercolour-spike/board-watercolour.png` | The candidate board (v2), 2048×2048 |
| `art-review/watercolour-spike/island-shape3-raw.png` | The one AI generation, 4128×1024 |
| `art-review/watercolour-spike/island-shape3-keyed.png` | Same, background-keyed to 1400×332 |
| `art-review/watercolour-spike/key_island.py` | Chroma-key/crop/resize helper |
| `art-review/watercolour-spike/ART-BRIEF.md` | **The artist handoff document** |

`ART-BRIEF.md` is the durable output. Everything else is supporting evidence.

## Decisions

- **Human artist over AI generation** for the board scenery restyle. The AI style match was
  good; the execution quality wasn't, and iterating prompt-by-prompt to fix contrast was
  judged worse value than commissioning it.
- **Scenery soft, game pieces bold** — adopted as the governing style rule. Islands, docks and
  board go watercolour; ingredient crates and boats keep hard outlines and saturated colour.
  Tested and confirmed: the crates read *better* against a soft island, and the split makes
  the board easier to parse at a glance. Leaving crates and boats alone is deliberate.
- **Compass deferred, not committed.** It's an instrument sitting on top of the board rather
  than terrain; the brass/gold reading as "tool, not landscape" may be doing useful work.
  Decide after the islands and docks land.
- **Branch saved, not merged.** Nothing here is wired into the game.

## Lessons

- **The restyle is 10 images, not "the whole board."** The game stores 7 island paintings (one
  per shape) and reuses them by rotating and mirroring, plus 1 dock reused for all 8 berths and
  2 compass pieces. A visual estimate of the work was ~4× too high.
- **Island art is auto-clipped to its grid shape.** `drawBoard()` traces a rounded outline of
  the island's squares (radius ≈ 32% of a cell) and clips the painting to it, so silhouettes
  don't need to be pixel-exact. This removes the fiddliest constraint from the artist's job.
- **Islands are stretched, not fitted** (`preserveAspectRatio="none"`), so aspect ratio is
  load-bearing in a way the current assets don't respect — shapes 5, 6 and 7 are painted at
  roughly 1.1–2.0:1 and stretched into a 1.5:1 box today. Worth fixing in the new set.
- **Style-lock on one image before batching.** Generating a single island and judging it in
  context cost one image and answered the question. Generating all seven first would have
  wasted six.
- **Judge art in the game, not in the tool.** The generation looked good standing alone and
  looked washed out on the board next to the crates. Only the in-context render surfaced the
  contrast problem, which is the one that actually mattered.

## Surprises

- **Chrome caches image assets as aggressively as Safari caches modules.** After replacing
  `assets/islands/3.png`, a normal reload — and a scripted `Cmd+Shift+R` — re-fetched
  `index.html` but issued *no request at all* for the images, so the old art kept rendering
  and looked like the swap had silently failed. The server access log is the reliable
  diagnostic (no `GET` line = cache hit); a fresh server port is the reliable fix. This is the
  same trap already recorded for Safari ES modules, and it is not Safari-specific.
- **Island shapes are randomised per game and a reload resumes the saved game**, so you can't
  reroll into a specific shape to test it. Workaround: point a second shape slot at the same
  art. Pointing the straight-line slot at it put watercolour and cartoon islands on the same
  board, which turned out to be a better comparison than the original plan anyway.
- **A throwaway mirror beats editing the repo.** The whole spike ran from a directory of
  symlinks to the real code and assets with only the board image replaced — zero repo
  mutation, nothing to revert, and old-vs-new served side by side on two ports. Worth reusing
  for any future asset experiment.

## Process gotchas found (worth fixing)

- **`notes/art-generation-process.md` §6 claims `art-review/` is gitignored. It is not** —
  108 files under it are tracked and new generations show up as untracked working-copy noise.
  Either add it to `.gitignore` or correct the runbook.
- **Chrome's download location is still pointed at `art-review/pastries`** from the pastry
  batch, so this island landed there and had to be moved. Repoint it before the next batch, or
  add a "check the download location first" step to §0 of the runbook.

## Scope notes

No shipped game file was touched. `index.html`, `src/**` and `assets/**` are byte-identical to
the branch point — the working tree was clean for the entire spike and every artifact here is
a new file under `art-review/watercolour-spike/`.

The main working copy has unrelated pre-existing changes (deleted `RULES.md`,
`Rules_boardgame.md`, `cocoa_pirates_sim.py`; modified `index.html`; assorted untracked
`art-review/` files, and it sits 407 commits behind `origin/main`). None of that was touched
or committed here, but it's worth a look on its own.
