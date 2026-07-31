---
created: 2026-08-01T00:00:00.000Z
title: Narration jumps left when it starts fading, and the box shrinks before the fade finishes
area: ui
severity: major
files:
  - index.html:308 (.apMsg.fadeOut — position:absolute; inset:0)
  - index.html:276 (#apGridInner — overflow:hidden)
  - src/ui/panel.js:308-318 (resizePanel — measures the incoming message only)
  - src/ui/panel.js:266-281 (the ghost mechanism, G17)
---

## Two reports, one cause

Wyatt, 2026-08-01:

1. *(urgent, **brand new**)* **"Dialogue in the narration box jumps to the left at the start of its
   fade. Expected: it fades exactly where it was."**
2. **"During fade-out on multi-line narrations the box shrinks too soon and starts to cut off lines
   that are still fading out. It should only shrink after the line has faded completely."**

**These are the same defect seen twice.** Both come from `index.html:308`:

```css
.apMsg.fadeOut { animation: apMsgFadeOut .8s ease both; position: absolute; inset: 0; pointer-events: none; }
```

The moment a line starts fading it is switched to `position:absolute` — **taken out of the document
flow**. Two consequences follow immediately, and they are exactly the two reports:

- **It re-anchors to `inset:0`**, the padding box of `#apGridInner`, instead of holding the position
  it had in flow. Any centring, margin or indent it had is gone in one frame. → **the jump left.**
- **`resizePanel()` no longer sees it.** The code comment at `src/ui/panel.js:228` says so outright:
  *"the ghost is `position:absolute` and so out of flow, meaning resizePanel's `inner.offsetHeight`
  measurement below still sees ONLY the incoming message."* So the box immediately animates down to
  the **new** line's height while the old multi-line one is still fading inside it — and
  `#apGridInner` is `overflow:hidden`, so the overflow is **clipped, not just overlapped.** → **the
  cut-off lines.**

That out-of-flow behaviour is **deliberate** (G17). It is what lets the outgoing and incoming lines
occupy the same space so the box does not lurch. **The mechanism is right; its side effects were
never addressed.**

## Why #1 is "brand new"

The ghost/fade mechanism is recent (G8/G17, 2026-07-30). Worth checking whether the jump was always
present and only became visible once the fade slowed enough to see, or whether a later change to the
panel's layout (padding, centring, the `.apMsg` box) introduced a real offset that `inset:0` now
throws away. **The second is more likely given Wyatt calls it new** — compare the computed position
of `.apMsg` in flow vs. `.apMsg.fadeOut` and the difference is the bug, measurable directly.

## Fix shape

**Pin the ghost where it actually was, rather than to `inset:0`.** Capture the live element's offset
before adding `.fadeOut` and set explicit `top`/`left` (or use a wrapper that preserves the box), so
going out of flow is positionally invisible.

**For the height:** the box must not shrink below the *taller* of (outgoing ghost, incoming line)
until the fade completes. Options — measure both and hold the max until the fade's `.8s` elapses, or
defer the shrink entirely to a fade-end callback. **Do not simply remove `overflow:hidden`**; it is
load-bearing for the box's own animation.

## Plan with FIX-03 and FIX-10 — same function, same measurement

All four now touch `resizePanel()` and the panel's height:

- **FIX-03** — buttons must wait for the typewriter, without changing the measured height
- **FIX-10** — a narrow window clips the action button (measure-once + `overflow:hidden`)
- **this item** — both halves

**These are one piece of work.** The measure-once design is BUG-01's Safari fix and must survive all
of it: re-measuring per animation frame is the original near-crash. Whoever takes this should hold
all four constraints at once, or each fix will break another.

**Source:** Wyatt, 2026-08-01.
