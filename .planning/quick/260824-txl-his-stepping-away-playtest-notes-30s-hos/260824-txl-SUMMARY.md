---
quick_id: 260824-txl
description: "His stepping-away playtest notes: 30s host grace, one-tap recipe confirm after a peek, Enter submits names, the stay-put redesign"
date: 2026-08-24
status: complete
---

# Quick task 260824-txl — SUMMARY

Shipped as build `2026-08-24f`, two atomic commits carrying the measurements (`0ea559d` the grace,
`d890b30` the UI trio); this file points.

- **The 30s grace**: measured both legs in the two-window rig — message on the guest inside 2s,
  a host back at 8s resumes with no death card ever shown, a host gone for good lands the card at
  32s. One helper feeds both callers (live watcher + boot re-entry), rule 23.
- **Recipe one-tap**: root cause was pixels/state disagreement — recipeGuard reset focusBtn on any
  outside tap while every visible sign of selection stayed. Measured: select → board tap → one tap
  commits.
- **Enter submits**: all six name fields swept; measured on the name modal.
- **Stay-put redesign**: built to his spec, and "behind the boat" came free (#sailHost z2 <
  #boardShips z4, his own 2026-08-02 layering — no compromise needed, so nothing to explain).
  Measured end-to-end: square at the boat's exact cell, button hidden until summoned, stay
  resolves. The PARITY-SAILRECT-GEOM gate caught the first draft's second builder call; folded
  into the one call site the gate protects.
- New checklist (29 items, key `pp4-playtest-2026-08-24f`): his four fixes, the twice-rebuilt
  pulse as a retest (Safari is his gate — no WebKit in this container), the carried-over unchecked
  items renumbered, the known list.
