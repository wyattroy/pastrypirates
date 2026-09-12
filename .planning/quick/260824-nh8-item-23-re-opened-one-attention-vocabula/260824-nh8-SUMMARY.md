---
quick_id: 260824-nh8
description: "Item 23 re-opened: one attention vocabulary — stage buttons glow, board prompt buttons grow, Start buttons glow in every mode"
date: 2026-08-24
status: complete
---

# Quick task 260824-nh8 — SUMMARY

Shipped as build `2026-08-24d`, one code commit (`9735f3a`) whose message carries the full
measurement; this file points, it does not restate.

## What the player gets

- Every Start-the-voyage button (pass-and-play, crew lobby, its confirm) breathes the coin's
  orange glow — they never pulsed before.
- The action circles over the board visibly swell (painted 66→75.9px, vs the old invisible
  66→71.9) — no ring, his pick.
- Stage buttons (ceremonies, battle cards, the coin) all share ONE glow definition; the three
  private copies (flipglow, ahoyglow, pp4StagePulse's ring) are deleted.
- All assignments live in one labelled CSS block (end of 4/index.html's stylesheet) — the "one
  display function, changed once" he demanded.

## The root cause of "pulses one round, not the next", measured

The animation was RUNNING on the fan all along (computed name + advancing clock + painted swing);
it was **too quiet to see over the sea** — visible over light dock sand, invisible over teal water.
Not two code paths; one imperceptible animation plus three drifted glow copies plus zero coverage
of the Start buttons.

## Honest edges

- One layout-gate run caught the KNOWN intermittent cornered-fan pile-up (Attack/Trade/Pass
  compressed below the derived quarter-gap); a second run was back at exactly the two known
  deliberate-letterboxing failures. The derived 17px arc gap provably survives two simultaneous
  1.15 peaks with 6.5px clear — the compression fallback is the pre-existing open item.
- `.btlBtn` and `.pp4Stay` verified by posed computed-style checks, not a driven battle.
- Sail squares untouched (his explicit ruling); plankglow and pp4FocusPulse deliberately excluded,
  reasons recorded in the block.
