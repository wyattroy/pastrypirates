---
quick_id: 260731-cdx
slug: archive-watercolour-board-art-spike
date: 2026-07-31
branch: claude/test-game-new-board-77f669
---

# Quick Task: Archive watercolour board art spike

## Description

A throwaway spike to see the game rendered with a new watercolour board, then to test
whether the rest of the board scenery (islands, docks, compass) could be restyled to
match via the existing Gemini art pipeline.

**Outcome: not proceeding.** The style direction was validated, but Wyatt is commissioning
a human artist to produce the real artwork. This task archives everything the spike
produced so the artist brief and the technical constraints aren't lost.

Branch is saved and pushed for reference. **Do not merge.**

## Scope

In scope:
- Commit the candidate watercolour board art and the single AI-generated test island
  (raw generation + game-ready keyed version).
- Commit the chroma-key/resize helper used to make the generation game-ready.
- Write up learnings: the watercolour House Style prompt block, the real asset inventory
  for a full restyle, the island auto-clipping finding, the "scenery soft / pieces bold"
  rule, the contrast critique, and two process gotchas.
- Push the branch without merging.

Out of scope:
- Any change to `index.html`, `src/`, or shipped `assets/` — the spike ran entirely in a
  throwaway mirror outside the repo. The working tree was never modified.
- Generating the remaining 6 islands, the dock, or the compass.
- The unrelated pre-existing changes sitting in the main working copy (deleted `RULES.md`,
  `Rules_boardgame.md`, `cocoa_pirates_sim.py`; modified `index.html`; assorted untracked
  `art-review/` files). Explicitly excluded from every commit here.

## Tasks

1. Stage spike artifacts under `art-review/watercolour-spike/` — board art, raw island
   generation, keyed island, keying script. Commit.
2. Write `art-review/watercolour-spike/ART-BRIEF.md` — the handoff document for the human
   artist (asset inventory, sizes, technical constraints, style rule). Commit.
3. Write `SUMMARY.md` in this task directory — GSD learnings. Commit.
4. Update `.planning/STATE.md` "Quick Tasks Completed". Commit.
5. Push branch. Do not merge, do not open a PR.

## Success criteria

- Branch `claude/test-game-new-board-77f669` exists on the remote with all spike artifacts.
- A human artist could pick up `ART-BRIEF.md` and produce correctly-sized, correctly-shaped
  replacement art without reading any code.
- No shipped game file (`index.html`, `src/**`, `assets/**`) is modified by this task.
