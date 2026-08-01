---
created: 2026-08-01T12:30:00.000Z
title: The game burns 80% CPU during ordinary play — it is a 2D board game
area: performance
severity: major
files:
  - index.html:563 (.ripple — infinite SVG animation, always on)
  - src/ui/board.js:138 (drawBoard — svg.innerHTML="" on EVERY render)
  - src/ui/panel.js (setClockUI, on a 500ms interval)
---

## Problem

Wyatt, 2026-08-01: *"we need to figure out how to optimize the game so that it doesn't take so much
CPU during normal play — it's a 2D board game for goodness sake, but it heats up my phone when I play
it and it takes 80% of my MacBook CPU. That's not good."*

He is right, and it is not a mystery — it is measurable.

## MEASURED (headless Chrome, phone viewport, mid-game, doing NOTHING)

**260 DOM mutations in 5 seconds while the game sits idle** — about **52 per second** with no player
input and nothing happening.

| Target | Mutations / 5s | Note |
|---|---|---|
| `SPAN:childList` | 50 | typewriter spans |
| `image:attributes` | 42 | SVG `<image>` attribute writes, ~8/sec |
| `shotClockPanel:attributes` | 30 | ~6/sec |
| `btnMute`, `scPauseImg`, `scTimerToggle` | 10 each | the 500ms tick |
| `scLabel`, `shotClockNum` | 10 each | countdown text — legitimate |

**Three infinite SVG animations running continuously**, all `rippleOut` — the active-turn sonar ring
(`index.html:563`, `animation: rippleOut 2.7s linear infinite`, three rings on staggered delays).
They never stop while it is anyone's turn, and they animate `transform` + `opacity` on SVG elements
sitting over the board.

**The board SVG is 93 elements and `drawBoard()` destroys and rebuilds ALL of it on every render** —
`src/ui/board.js:138`: `const svg=$("board");svg.innerHTML="";`. This is already documented as a
hazard in `docs/DRIVING-THE-GAME.md` §7 ("drawBoard() wipes the board SVG on every render"), but the
cost was noted for testing, never for performance.

## The three suspects, in the order worth attacking

1. **The full board teardown on every render.** 93 SVG elements destroyed and recreated for what is
   usually a one-ship move. Every rebuild is layout + paint + composite of the entire board. This is
   almost certainly the biggest single win and the biggest change: it means diffing (move the ship
   that moved) instead of rebuilding.
2. **The always-on ripple.** Three infinite SVG animations over the board area, running the whole
   time it is someone's turn. On a phone this alone can keep the GPU/compositor busy continuously.
   Cheapest fix of the three — cap the iterations, or pause it after N cycles, or move it to a CSS
   transform on a single element rather than three animated SVG nodes.
3. **The 500ms clock tick.** Partly addressed 2026-08-01 (writes are now conditional and skipped
   behind the welcome screen), but it still writes on most ticks because the countdown genuinely
   changes. Cheap to bound further: only touch the nodes whose text actually differs.

## Do this as an investigation FIRST, not a set of fixes

Each of the three above is a hypothesis with a measurement attached, not a confirmed cause of the
80%. The harness (`docs/DRIVING-THE-GAME.md` §8a) can attribute cost properly — CDP exposes
`Performance.getMetrics` and tracing, so **measure which of the three dominates before rewriting the
render path**, which is the expensive one to change and the easy one to get wrong.

**Do not optimise on instinct here.** The determinism corpus and the Safari storm fix both live in
this code; a render-path rewrite that is not measured is how BUG-01 happened in the first place.

## Related, already logged

`2026-08-01-welcome-screen-should-not-render-the-live-game.md` — the same class of problem before the
game even starts (a live board built and composited only to be blurred behind a card). Wyatt's static
backdrop proposal fixes that half; this item is the in-play half.

**Source:** Wyatt, 2026-08-01.

---

## MEASURED 2026-08-01 — the ranking above is wrong, and suspect 2 is the whole story

Measured with the §8a harness in headless Chrome, **GPU enabled**, phone viewport (390×900), solo
game, with a rAF loop running so the page genuinely animates. Attribution is by **ablation** — each
suspect removed, then re-measured — not by inspection.

### The result

| Condition | CPU | task | layouts | fps |
|---|---|---|---|---|
| idle at a human prompt, as shipped | 7.6% | 605ms/8s | **508** | 58 |
| idle, ripple off | 5.1% | 408ms/8s | **17** | 60 |
| active play (autoplay driver), as shipped | 7.6% | 607ms/8s | **592** | 55 |
| active play, ripple off | 3.7% | 294ms/8s | **156** | 60 |

**The ripple is 97% of all layout work while idle and just over half the main-thread cost during
active play.** It forces **~62 layouts per second** — from an animation that touches only `transform`
and `opacity` and should therefore cost zero. Turning it off takes active-play CPU from 7.6% to 3.7%
and restores a locked 60fps.

**The board teardown (suspect 1) is not the problem.** With the ripple off, active play sits at
156 layouts / 8s including all real gameplay animation. Do **not** rewrite `drawBoard()` — the
expensive, risky change is the one that was not going to pay.

### Why it costs layout — and what does NOT fix it

The cause is not `transform-box: fill-box`. Three CSS candidates were measured and **all four
conditions came back identical at 62 layouts/s**:

| Candidate | layouts/s |
|---|---|
| as shipped (`fill-box` / `center`) | 62 |
| `+ will-change: transform, opacity` | 62 |
| `transform-box: view-box; transform-origin: 0 0` | 62 |
| both | 62 |

**Chrome does not composite SVG transform animations at all**, and `will-change` will not promote an
SVG child to its own layer. No CSS tweak on the existing element can fix this.

### The fix, proven before recommending

Same three rings, same keyframes, same negative-delay stagger — drawn as **HTML divs over the board**
instead of SVG circles:

| | layouts / 6s | task |
|---|---|---|
| SVG rings (shipped) | 373 | 543ms |
| HTML divs, identical animation | **12** | 396ms |
| no ripple at all | 12 | 333ms |

**The HTML version costs zero layouts — 100% of the ripple's layout cost removed**, at 60fps, with
the animation visibly unchanged (ring width swept 25→46px, opacity .04→.51, matching shipped).

### Doing it — the one real complication

`activeRing` is already positioned by `style.transform = translate(Xpx,Ypx)` (board.js:1095, 1173,
1186, 1256), so the positioning calls port almost unchanged, and `opacity` moves from an attribute to
a style. **But those coordinates are SVG user units, not screen pixels** — the board is scaled by its
viewBox via `syncBoardSizing()`. An HTML overlay must convert user units → CSS px with the board's
live scale and re-apply on resize.

That is the whole job, and it is why this was not just done: it lands in the code that
`board.js:1143` records as having already shipped a bug where **the ring ran ahead of the boat**, and
its acceptance test is how the sweep *looks* — in Safari, which no headless harness can stand in for.

**Recommendation:** do it, ripple-only, leaving `drawBoard()` alone; verify with a screen recording
of a rim sweep, as `20260731-tradewind-arrival-animation` had to.

### Caveat on the absolute numbers

7.6% here is not Wyatt's 80%. This is headless Chrome on a desktop Mac at a 390px viewport; he is in
Safari at full window. **The attribution transfers, the percentages do not** — and Safari is where
this project's rendering bugs have historically lived, so a Safari re-measure after the change is
part of the job, not a nicety.
