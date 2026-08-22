---
status: complete
---

# Quick Task 260822-djh — Printable physical-edition rulebooks (EN + pirate), two PDFs

**Delivered:** `physical-board/rules/` — `rules-english.pdf` and `rules-pirate.pdf` (6 pages each,
US Letter), their HTML sources, and `images/` (seven screenshots captured from a live solo `/4`
game this session). Both PDFs render every setup stage and gameplay system with images from the
online game; layout was QA'd page-by-page from rendered screenshots before delivery (rule 19).

**Rules content** comes from the shipping `/4` engine (`roundCfg`), not from the stale root
`Rules_boardgame.md` (v1: coin-to-sail, fishing, race-to-3 battles — all gone). Verified against
code this session: sail 4/2, dock 3/1, powder 2 / re-fire 2, call bounty 2, pass +1, storm 0.20
with max-2 streak, staggered start coins = startCoins + seat position (3/4/5/6, orchestrator.js
runLiveNet), battle with no post-battle swap, recipe draft = two cards keep one, classic finish
Best Baker tiebreak crates→coins→first home.

**Wyatt's four decisions (question UI, this session)** are the deliberate divergences:
1. Rules describe the **V3 laser-cut set** (physical-board branch pieces by name).
2. **Classic finish** printed; **ovens bake-off is an optional expansion** (page 6), adapted for
   the table: hider makes 3 slow swaps, reveal-as-you-name, solved crates stay solved, 1 gold per
   rewatch.
3. **Crate price counts up as sold: 3 → 4 → 5** (his correction — replaces the app's
   "6 − remaining", identical at full stock); **black market flat 10**; stocking players−1.
4. **~6-page booklet** per language.

Physical adaptations follow `physical-board/README.md` ("How the physical rules differ from the
app"): whirlpool tiles placed one per captain (his spec), NOW + forecast + storm-spinner weather
procedure (cloud covers the forecast arrow; on the storm day NOW itself is spun), marker discs
name islands each voyage.

**Deviation from the quick workflow:** executed inline rather than via planner/executor subagents —
the four UI answers and the engine research lived in this session's context, and a 6-page
bilingual creative deliverable does not decompose into a handoff plan without losing them. The
workflow's own branch step was skipped: this remote session is pinned to
`claude/pastry-pirates-printable-rules-7kf7va`. STATE.md's "Last activity" line was left alone —
it is embedded in phase-gate prose, and only the Quick Tasks row was appended.

**Caution for merging:** Wyatt ruled physical-board work never lands on `main` (players should not
see it). This branch adds `physical-board/rules/` — merge it into the `physical-board` branch, not
`main`, or move the folder first.
