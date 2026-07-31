---
created: 2026-07-31T15:47:23.950Z
title: A bot that pays to anchor is narrated "is still docked" instead of "anchored safely"
area: narration
severity: major
files:
  - src/engine/index.js:280-287 (windPush — mooredReason precedence over the pay-to-anchor branch)
  - src/ui/util.js:361-408 (moored handler, the D-28 shared "still docked" string)
  - src/ui/util.js:334-338 (dodge handler — "pays 1🌕 to anchor safely")
---

## Problem

Wyatt, from live play: during a storm, when a bot **pays to anchor**, the narration reads
*"Crustbeard is still docked"* — but it should read *"Crustbeard anchored safely."* He calls it
**"an erroneous merge"**, and the D-28 decision history in the source supports that reading.

The two strings both exist and are both approved copy:

- `src/ui/util.js:367` — `"${pn(e.p)} is still docked, so the storm can't run them aground."`
  (the `moored` event; D-28 deliberately made this **one shared string reached by three doors** —
  `justDocked`, `dock`-when-unmoved, and `home`-when-unmoved)
- `src/ui/util.js:336` — `"${pn(e.p)} pays 1🌕 to anchor safely"` (the `dodge` event)

## Why it happens — the engine, not the copy table

`windPush()` at `src/engine/index.js:280-287` checks moored-ness **first and returns**:

```js
const reason=this.mooredReason(p);
if(reason){this.ev({t:"moored",p:p.idx,reason});return;}   // <-- returns here
if(dodgedOnce.v){this.ev({t:"anchorHold",p:p.idx});return;}
if(p.coins>=3){p.coins--;this.ev({t:"dodge",p:p.idx});}     // <-- pay-to-anchor never reached
```

So a ship that is on a dock or berth emits `moored` and **never reaches the paid-anchor branch at
all** — it is not charged a coin and the "anchored safely" line cannot fire. The narration and the
economy agree with each other; the question is whether either agrees with the rules as Wyatt
understands them.

**Investigate before fixing — this is not obviously a copy bug.** Two candidate root causes:

1. **Narration-only.** The precedence is correct (a docked ship genuinely does not pay), and what
   Wyatt saw was the `moored` line firing in a situation he read as "paid to anchor." Fix is wording
   or a fourth door in the `moored` table.
2. **Engine.** The moored-first precedence is wrong for some state, and a bot that should have been
   charged a coin was silently sheltered for free. **This is an economy bug, not a copy bug** — same
   family as CR-02/CR-03 — and materially more serious than the narration complaint that surfaced it.

Determine which before writing any copy. Capture the seed and turn from Wyatt's session if it can be
recovered; a seeded reproduction is worth more here than reasoning about the ladder.

## Constraints

- **The engine's `reason` field is serialized into all 31 determinism fixtures.** Any change to what
  `windPush` emits is a **re-record**, which `docs/DETERMINISM-RERECORD-NEXT.md` §7-8 says happens
  exactly once. If the fix is in the engine, this item belongs in **The Gated Re-Record** batch and
  must not land alone. If the fix is narration-only, it is free and can go anywhere.
- D-28's "one shared string, three doors — not three copies awaiting a merge" is a deliberate
  decision with history. Read it before splitting the string; adding a fourth door is in keeping
  with it, duplicating the string is not.
- `scripts/bot_storm_narration_test.js` asserts these strings byte-identically.

**Source:** Wyatt, 2026-07-31 punch list.
