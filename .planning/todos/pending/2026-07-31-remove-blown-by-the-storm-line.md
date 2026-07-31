---
created: 2026-07-31T15:47:23.950Z
title: Remove the "is blown by the storm" narration line
area: narration
severity: cosmetic
files:
  - src/ui/util.js:327 (windmove narration handler)
---

## Problem

Wyatt wants the *"{captain} is blown by the storm"* line gone. It is the `windmove` event's
narration at `src/ui/util.js:327`:

```js
windmove:(e,at,cellPx,viewerSeat)=>({
  txt:isLocalTo(e.p,viewerSeat)?`${pn(e.p)} — yer blown by the storm`
                               :`${pn(e.p)} is blown by the storm`,
  caps:[[e.p,"🌬️ drifts"]]
}),
```

It says nothing the board is not already showing — the ship visibly moves — so it spends a narration
slot on a non-event.

## Solution

Remove the line. Decide deliberately between two shapes, because they are not equivalent:

1. **Drop the text, keep the capsule.** Return no `txt` but keep `caps:[[e.p,"🌬️ drifts"]]`, so the
   captains box still marks the drift. Least disruptive.
2. **Drop the `windmove` narration entry entirely.** Then `describe()` falls through to whatever its
   default is for an unhandled event type — **verify what that default renders before choosing this**,
   or an unknown-event fallback string could ship in its place.

Option 1 is the safer default unless Wyatt wants the drift capsule gone too — worth confirming, since
his note says only "remove the line."

Gates this touches:

- **Both the addressed ("yer blown") and neutral ("is blown") variants must go together.** The
  D-07/NARR-05 contract is that these are siblings; leaving one is a half-removal that shows up for
  some viewers and not others.
- `scripts/bot_storm_narration_test.js` asserts storm narration strings byte-identically — expect it
  to need updating, and make sure it is updated rather than skipped.
- This is player-facing copy, so it falls inside the copy-integrity inventory tracked by
  `copy-shipped-vs-approved-gate`. A removal is a change to that inventory: record it, do not let it
  become a silent divergence between shipped source and Wyatt's approved dispositions.

**Source:** Wyatt, 2026-07-31 punch list.
