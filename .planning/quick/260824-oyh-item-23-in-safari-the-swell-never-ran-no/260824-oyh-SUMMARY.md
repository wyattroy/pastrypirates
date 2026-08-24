---
quick_id: 260824-oyh
description: "Item 23 in Safari: the swell never ran — no var() in keyframes, and Reduce Motion falls back to the glow, not to nothing"
date: 2026-08-24
status: complete
---

# Quick task 260824-oyh — SUMMARY

Shipped as build `2026-08-24e`, one code commit (`e1fd119`) — the full measurement chain is in its
message; this file points.

- **Video evidence honored (rule 22):** 16 frames extracted and measured — Pass circle 121px in
  every one. His "it pulses sometimes, inconsistently" follow-up discriminated the cause: WebKit's
  resolve-once var()-in-keyframes, racing the radial class.
- **The fix removes the construct** rather than betting on a Safari version: literal keyframe
  amplitudes, animation switched by name, spacing derived to include the peak
  (`--pp4GrowPeak`, declared once in the vocabulary block), Reduce Motion → still glow.
- **Own-probe catches during the fix:** the first draft lost the strong swell to selector
  specificity (66→69.3 measured, fixed with mutually-exclusive selectors); the layout gate caught
  petals kissing at pulse peak (fixed by SEP).
- **Honest edge:** no WebKit engine exists in this container — Safari verification is his video
  (pre-fix) plus the removal of the offending construct; Chromium verifies the mechanics
  (66→75.9px live, pp4Glow under emulated reduced-motion). His Safari re-test is the gate.
- The layout gate's box-overlap check can still flag diagonally-adjacent petals at pulse peak even
  when the painted circles have clear water (axis-aligned rects overcount diagonals) — a gate
  refinement, noted, not done.
