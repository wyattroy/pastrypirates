# Quick Task 260822-djh: Printable physical-edition rulebooks (EN + pirate) as two PDFs

**Date:** 2026-08-22
**Branch:** claude/pastry-pirates-printable-rules-7kf7va (remote-session designated branch; the
workflow's own branch step is skipped — session rules forbid leaving this branch)
**Mode:** quick, executed inline (research + Wyatt's four UI answers already live in this session's
context; a spawned executor would start without them)

## The ask (Wyatt, 2026-08-22)

Printable rules for the physical version of the latest game (`/4`), delivered as **two printable
PDFs — plain English and pirate speak — with images from the online game** illustrating each stage.
Design intent: not overwhelming; a first-time player builds the board and starts playing at a
glance; nuance arrives progressively later in the ruleset.

## Decisions locked by Wyatt (question UI, this session)

1. **The V3 laser-cut set** ("Round Table", `physical-board` branch) is the set the rules describe.
2. **Classic finish** is the printed ending; the **ovens memory bake-off is an optional expansion**
   section.
3. **Crate pricing (his correction):** the first crate an island sells always costs **3**, each
   subsequent crate **one more than the last** (3→4→5). **Black market always 10.** Stocking is
   players−1: 3 crates/island at 4 players, 2 at 3, 1 at 2.
4. **~6-page booklet** per language.

Setup sequence from his prompt (the spine of page 1): assemble board → draw island tiles from bag,
place sequentially one per person → place docks → place whirlpools one per person → stock
ingredients (players−1). Expert-judgment nuance (placement constraints, ordering) is mine to fill
in from how the app builds a board.

## Tasks

1. Research the remaining rule mechanics from `4/src` (turn/day structure, recipe draft, battle
   calls a.k.a. side bets, storm procedure, trade, raids, finish) and the physical adaptations from
   `origin/physical-board:physical-board/README.md` (wind dial + forecast arrow + storm spinner,
   whirlpool tiles, marker discs).
2. Capture images: play `/4` in a served browser (per `docs/DRIVING-THE-GAME.md`) and screenshot
   the stages; reuse the game's own art from `assets/`. Kill every server/Chrome before replying.
3. Write and lay out two ~6-page print-ready HTML booklets (Letter), render to PDF with headless
   Chromium, QA the rendered pages by eye (rule 19 CHECK half), commit, push, deliver both PDFs.

## Verification

- Both PDFs open, ~6 pages each, every setup stage illustrated, no clipped text at print size.
- Rules content matches the shipping `/4` engine numbers (`roundCfg`) except where Wyatt's four
  decisions deliberately diverge (pricing ladder, classic finish, players−1 stocking).
