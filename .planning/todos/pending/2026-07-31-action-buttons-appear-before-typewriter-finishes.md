---
created: 2026-07-31T15:47:23.950Z
title: Action buttons appear before the typewriter text has finished
area: ui
severity: minor
files:
  - src/ui/panel.js:282-301 (panel() — buttons rendered, then typewriterReveal started)
  - src/ui/panel.js:354 (typewriterReveal)
  - src/ui/flow.js:96 (.apBtn render)
---

## Problem

In an action prompt the **buttons are on screen before the text that explains them is.** `panel()`
writes the full HTML — message *and* buttons — into `#actionPanel` synchronously, then calls
`typewriterReveal()` on the message element only (`src/ui/panel.js:301`). The buttons were never
part of the reveal, so they are fully painted while the sentence above them is still typing itself
out one character at a time.

Wyatt: *"the buttons appear before the text does which feels wrong."* It reads as the game asking
you to decide before it has finished telling you what you are deciding about.

## Solution

Hold the buttons hidden until the reveal promise resolves, then show them.

The seam already exists and is clean: `panel()` stashes the reveal promise on the element as
`msgEl._revealDone` (`src/ui/panel.js:301`), and that promise *"resolves only once every character
is actually on screen"* — `flash()` already awaits it. So the buttons can be revealed off the same
promise rather than inventing a new timer.

Constraints that must not be broken:

- **Do not add a guessed duration.** The codebase's own comments are explicit that callers should
  wait for real completion rather than a guessed one. Await `_revealDone`.
- **Reduced motion.** `panel()` already reads `prefers-reduced-motion` in JS
  (`src/ui/panel.js:299`) because a CSS media query cannot reach a JS timer. Under reduced motion
  the buttons should appear immediately, not after a delay for an animation that isn't running.
- **`resizePanel()` measures the finished height once, up front** (BUG-01's Safari fix) so the box
  animates a single time per message. Whatever hides the buttons must **not** change the measured
  content height — use `visibility`/`opacity`, not `display:none`, or the box will resize twice and
  reintroduce the Safari cost that fix exists to avoid.
- **The turn clock keeps running.** Delaying the buttons shortens the window a player has to act
  before `turnExpired` fires. On a long prompt this is a real fairness cost. Check the reveal
  duration against the shot clock — `REVEAL_MS_PER_CHAR` times a long prompt is not negligible —
  and consider whether the clock should start at reveal-completion rather than at prompt-render.
- **NARR-07 (Phase 18) is adjacent.** That phase makes narration timing a display concern that never
  gates play. This item deliberately makes *buttons* wait on the typewriter, which is the same
  timing coupling from the other direction. The two must be designed together or they will fight.

**Source:** Wyatt, 2026-07-31 punch list.
