---
id: eov-narration-box-not-cleared
title: End-of-voyage leaves the narration box visible but empty
status: pending
type: bug
severity: low
area: ui
created: 2026-07-25
source: Phase 12 UAT (Wyatt's Safari playthrough)
resolves_phase: 16
regression: false
---

## Issue

When a game ends (End of Voyage panel appears with the winner + badges), the narration/action box (`#actionPanel`, the mint-green message box) stays on screen **large and empty** instead of collapsing/hiding. Observed by Wyatt in desktop Safari at end-of-voyage (screenshot in Phase 12 discussion).

## Root cause (traced)

`setClockUI()` (src/ui/panel.js:51, `liveDone` branch ~54-58) hides the shot-clock (`#shotClockPanel`) and shows `#btnPlayAgain`, but never clears/hides `#actionPanel`. `panel("")` would hide it (`panel.js:160` sets `display = html ? "" : "none"`), but nothing calls it at game end. `showStats()` (src/ui/board.js:500) renders the End-of-Voyage panel but also does not touch `#actionPanel`.

## PRE-EXISTING — not a refactor regression

Confirmed byte-identical to shipped v1.0 on `main`: `main:index.html:3254` `setClockUI()` has the identical `liveDone` branch (hide clock + show Play-again, no `#actionPanel` clear). The v1.1 monolith refactor moved this behavior verbatim. This bug shipped in v1.0.

## Suggested fix (future polish)

At end-of-voyage (e.g. in the `liveDone` branch of `setClockUI`, or wherever `showStats()` is triggered), call `panel("")` / hide `#actionPanel` so the empty message box collapses once the End-of-Voyage summary is shown. Low-risk, cosmetic.
