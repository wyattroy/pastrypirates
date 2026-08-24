---
quick_id: 260824-5qz
description: Execute HANDOFF-2026-08-23-evening.md — Wyatt's approved fix order for his 2026-08-23c playtest
date: 2026-08-24
status: complete
---

# Quick task 260824-5qz — SUMMARY

Executed in a cloud session, directly in the orchestrating context (the session held the read
evidence and the three governing docs — see the PLAN's execution note). Every fix has its own
atomic commit whose message carries the measurement; this file points, it does not restate.

## Shipped (live at playpastrypirates.com/4)

**Build 2026-08-24a — tier 1, all three blockers** (`e576162` and parents):
- `5e07d9f` — the "Reconnecting to yer voyage…" hang: reproduced in the two-window rig, root-caused
  (the host's own `hostgone` onDisconnect locked the host out on EVERY reload, not just tab-close),
  fixed host-side and guest-side, plus the 15s "Back to port" escape hatch he asked for
  (red-proofed; its first version had a stand-down bug the red-proof caught).
- `2d0fc9b` — `?ovens=1` verified working in CREW games and rides the room cfg across a host
  reload. Items 43–46 are now testable: **the HOST creates the room from
  playpastrypirates.com/4/?ovens=1; guests join normally.** Verified in a real room (RSMB): both
  human holds stocked, ovens lit, bench on both screens at end of day 1.
- `348e1e2` — the blank-space lag: prompts spent their whole reveal (800ms fade + 180ms resize +
  20ms/char typewriter) behind `display:none` and popped in finished. One flag was answering two
  questions; split into `pendingStage` (board settled — gates the box) and `pendingReveal`
  (may the player act — gates the buttons). Dead air per 3 min: 5,962ms → 1,483ms; longest episode
  2,880ms → 749ms; episodes over 1s: 3 → 0. His chosen pacing is untouched — it just happens on
  screen now.

**Build 2026-08-24b — tier 2, all 13 items** (`b714ff6` and parents):
`eff01d3` name collision capitalization-normed (item 30) · `025f57c` Join goes straight to the
join screen (item 31) · `5f10e30` one coin clock at 1.0s + the bot dock flip actually flips
(item 18) · `b5be8f9` trade-winds sweep reported once, in the storm summary (item 8) · `10a1c98`
the greyed-Buy explainer tells the truth (item 17 copy; position half was the lag fix's
stale-measurement class, to be confirmed by his re-test) · `a97c4f4` centre-stage cards never run
under the header (item 9) · `1ff1dfb` battle buttons pulse — the one style the sweep found bare
(item 13) · `a0e2e7f` the mobile board is square again, top row visible, CAPTAINS heading gone
(problems 1+4) · `9acd364` the stage holds the director still and bubbles wait for the veil
(item 7 + problem 3, his principle implemented at the one camera seam) · `aed5cd6` the director's
room-reservation survives the first fit of a turn (item 38's structural hole).

## Findings that are answers, not fixes

- **Item 12 (recipe card "3 taps")**: measured with trusted mouse events — two taps end-to-end on
  the current build. The likely third tap was the old reveal gate eating a tap that landed before
  the buttons were interactive; the lag fix changed exactly that. His re-test decides.
- **Item 13's "pass/trade/attack never pulse"**: they carry the pulse in his build too (measured
  `animationName: sailBounce` on all three); the radial pulse is scale-only beside the ringed
  centre-stage pulse, so it may read as static. If his re-test still says dead, the fix is louder
  vocabulary, not coverage.
- The captains-panel "holds divergence" seen during QA was measured to be the DESIGN (own row
  shows your recipe; other rows show public holds) — engine, guest snapshot and both DOMs agree.

## Tier 3 — awaiting his pick

Three desktop-menu variants rendered as real screenshots (settings list / compact grid /
content-width pills) and put to him with the question UI. Nothing shipped until he picks.

## Verification

Every 4/scripts gate green (name_claim extended 17→22 assertions; stage_layout_check at its two
pre-existing deliberate-letterboxing failures — it caught and killed two regressions of this
session's own before they shipped). Crew QA pass on the final tree: modal-free join verified,
voyage to round 2, both screens compared. Diff guards clean (only 4/, scripts/, docs/, .planning/
touched); main synced zero-zero after each merge.
