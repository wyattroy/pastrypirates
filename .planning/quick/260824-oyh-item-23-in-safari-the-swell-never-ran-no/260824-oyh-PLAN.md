---
quick_id: 260824-oyh
description: "Item 23 in Safari: the swell never ran — no var() in keyframes, and Reduce Motion falls back to the glow, not to nothing"
date: 2026-08-24
---

# Quick task 260824-oyh — PLAN

**Execution note:** executed directly in the orchestrating context (same reasoning as 260824-5qz
and -nh8: the session holds the frame-measured video evidence and his live follow-up).

## The evidence

His Safari screen recording of build 24d, read frame by frame: the Pass circle is 121px in all 16
frames across 3.6 pulse cycles — the swell never ran. His follow-up: in Safari it DOES pulse
sometimes, inconsistently. Chromium probes always measured it running.

## Diagnosis

`pp4Grow`'s 50% keyframe was `scale(var(--growHi, 1.05))`. WebKit resolves var() in keyframes once
at animation start and never re-reads it; the radial class carrying `--growHi:1.15` lands a beat
after the animation starts, so Safari raced between the 1.05 fallback (a 3px twitch) and the real
1.15 — per prompt. Chromium re-resolves live.

## Tasks

1. Literal keyframe amplitudes (pp4Grow 1.15 / pp4GrowSoft 1.05), mutually-exclusive selectors,
   var() banned from keyframes in the block's own comment.
2. The fan reserves the swell's room: SEP = D × --pp4GrowPeak + GAP at all six spacing sites; the
   peak declared once in the vocabulary block, read by stage.js.
3. Reduce Motion: grow targets fall back to the still glow, never to nothing.
4. Verify (Chromium live fan + emulated reduced-motion), gates, ship as 2026-08-24e.
