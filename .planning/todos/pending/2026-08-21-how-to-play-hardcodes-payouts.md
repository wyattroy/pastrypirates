---
created: 2026-08-21T17:10:00.000Z
title: The How-to-Play modal hardcodes economy numbers that the engine owns
area: ui
severity: minor
tree: 4/
status: pending
source: found while shipping D-30 (dock flip 1/3, build 2026-08-20t)
---

## Problem

`4/index.html`'s How-to-Play modal states the dock flip payout as literal text. It was ALREADY stale
before D-30 (it said 6🌕/2🌕 while the engine paid 5/2) and was hand-corrected to 3🌕/1🌕 when D-30
shipped. The same modal also spells out battle powder cost and crate prices as literals.

## Why it matters

"Nothing is a constant" (CLAUDE.md §2): a number typed into help text is a second copy of a quantity
the engine owns, and it drifts silently — this one already had. The narration lines got this right
(`flow.js:1277`, `util.js:686` derive from `g.cfg.dockHeads/dockTails`); the help modal does not.

## Fix shape

Render the modal's numbers from `cfg` at open time (a few `data-cfg="dockHeads"` spans filled by one
small function), so the help text cannot disagree with the engine. Sweep every literal 🌕 figure in
the modal at the same time. Red-proof: change a cfg value in a test and assert the modal text follows.
