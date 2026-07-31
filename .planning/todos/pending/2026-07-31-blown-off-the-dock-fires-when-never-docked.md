---
created: 2026-07-31T18:10:00.000Z
title: "A gale blows X off the dock!" fires for ships that were never docked
area: narration
severity: major
files:
  - src/ui/flow.js:792 (wasDocked = adjPort(p)!==null)
  - src/ui/flow.js:704, :709 (windLeg emits blownOut unconditionally)
  - src/ui/flow.js:759 (botWindLeg, same)
  - src/engine/index.js:722 (the engine's version — guarded on movement)
  - src/ui/util.js:328 (the blownOut copy)
---

## Status — this is NOT new, but it was NOT tracked

Wyatt asked on 2026-07-31 whether this was in the bug notes. **It is in the history, but it was never
an open todo** — so nothing was going to pick it up. This file fixes that.

Where it already appears:

- `.planning/phases/15-narration-audit-fixes/15-PLAYTEST-NOTES.md:17-21` — Wyatt's own Phase 15
  report: *"Blown OFF the dock, then told he is STILL docked. **And per Wyatt he was not docked at
  all.**"*
- Same file, `:36` — *"A sheltered, blocked or zero-push ship still announces 'A gale blows X off
  the dock!'"*
- `.planning/phases/15-narration-audit-fixes/15-LEARNINGS.md:116` (**G29**) — *"`src/engine/index.js:722`
  guards on movement; `src/ui/flow.js:549` and `:599` do not."*
- `.planning/research/v1.3-intake/INTAKE.md:639` + `FEASIBILITY.md:26` — a *different* symptom (the
  line appearing twice in a row) which feasibility **correctly ruled NOT a bug**: a storm push is two
  legs, each able to fire its own event. **Do not let that ruling be read as clearing this item** —
  it answers the duplicate question, not the never-docked one.

## Two distinct defects, both live

### 1. `wasDocked` asks the wrong question — the likely cause of Wyatt's report

`src/ui/flow.js:792`:

```js
const wasDocked=appState.game.adjPort(p)!==null;
```

`adjPort` is **"is there a port adjacent to this ship"** — proximity, not mooring. Everywhere else
that needs "is this ship actually sheltered" calls **`mooredReason(p)`**, which the codebase's own
comments call *"the single source of truth for which of the three safe-harbor causes fired"*
(`src/ui/flow.js:597-602`, `src/engine/index.js:280`).

So a ship merely *passing beside* a dock is labelled as having been blown off it. **Confirm the
distinction before changing it** — if `adjPort` is genuinely how docking works in this game, then the
bug is elsewhere and this is correct as written. Read `mooredReason` and `adjPort` side by side
first.

### 2. The live paths emit `blownOut` even when the ship never moved

The engine guards it (`src/engine/index.js:722`):

```js
if(p.pos[0]!==before[0]||p.pos[1]!==before[1])this.ev({t:wasDocked?"blownOut":"windmove",p:p.idx});
```

The three live UI paths do **not** — `src/ui/flow.js:704`, `:709`, `:759` all emit unconditionally.
That is G29, recorded in Phase 15 and still present. It produces the contradictory pair Wyatt saw:
*"A gale blows Crustbeard off the dock!"* immediately followed by *"Crustbeard is still docked."*

## Fix shape

Make the live paths match the engine: guard the emit on actual movement, and derive "was docked"
from the same accessor the rest of the code trusts. **The engine is already correct — the live UI is
the thing that drifted from it**, so the engine must not be "fixed" to match the UI.

**This is a determinism-sensitive area but the fix should not need a re-record**: `src/engine/index.js:722`
already behaves correctly and is what the 31 fixtures captured. Changing only `src/ui/flow.js` leaves
the corpus untouched. **Verify that before committing** — if a fix genuinely requires an engine
change, it belongs in the gated re-record batch, not in v1.3.

## Relationship to FIX-05

**Read these two together.** FIX-05 (paid anchor narrated as "still docked") is the *same family*:
both are about the storm's shelter/push branches telling the player the wrong story about their own
ship. FIX-05 also has an unconfirmed engine-vs-UI root cause. Investigating them in one sitting is
likely cheaper than twice, and may find one cause behind both.

**Source:** Wyatt, Phase 15 playtest (2026-07-29/30) and again 2026-07-31.
