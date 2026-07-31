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

## Wyatt's evidence rules OUT the obvious explanation — treat this as an AUDIT, not a one-line fix

**2026-07-31, Wyatt, correcting an earlier theory of mine:** *"What I saw was no dock anywhere near
the player when the narration came up. So we need to audit the storm narration flows more closely
because something clearly went a bit bad."*

That matters, because the tidy explanation **does not survive it.** The proximity theory below
requires a dock to be somewhere near the ship. There wasn't one. So whatever is wrong is either
upstream of that test, or is not that test at all.

**Do not open this as "change one condition."** Open it as an audit of the storm narration flow end
to end, treating every step from event emission to rendered line as suspect. Candidate mechanisms,
none yet ruled in or out:

1. **`wasDocked` is stale or scoped too wide.** `src/ui/flow.js:792` computes
   `adjPort(p)!==null` — *proximity to a port*, not mooring — **once, before both storm legs.** Even
   with the right test, a ship that starts beside a dock and is blown far away still carries
   `wasDocked=true` into a line rendered when it is mid-ocean. That alone could produce Wyatt's
   sighting without any dock being visible at the moment the line appears.
2. **The event is attributed to the wrong player.** `blownOut` carries `p:p.idx`; if the wrong seat
   is named, the line describes a real event happening to somebody else's ship.
3. **A stale event is being narrated.** `narrateLastEvent()` reads the last emitted event; if the
   storm path emits and narrates out of step, an earlier leg's line can render against a later
   position.
4. **The emit is unconditional** (defect 2 below), so a leg where *nothing happened* still produces a
   line — and a line with no real event behind it can describe anything.

`mooredReason(p)` is what the rest of the code calls *"the single source of truth for which of the
three safe-harbor causes fired"* (`src/ui/flow.js:597-602`, `src/engine/index.js:280`), and
`wasDocked` conspicuously does not use it. That inconsistency is worth resolving regardless of
whether it turns out to be the cause here.

**Get a live repro with the seed before changing anything.** Static reading already failed once on
this bug — the Phase 15 pass looked at it and it still shipped.

## The second defect, independently confirmed

### The live paths emit `blownOut` even when the ship never moved

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

## Fresh evidence — the 2026-07-31 Phase 17 captain's log

Two captains, two storms, same contradiction — **"still docked" immediately followed by "blown off
the dock"**, which is the pair G29 predicts:

```
Round 4: A storm be ragin'! It'll blow yer ships west, then south.
  A gale blows Crustbeard off the dock!          <-- x2, one per leg (ruled correct)
  Flaky Jack is blown by the storm               <-- x2
  Dough Hook is still docked, so the storm can't run them aground.
  A gale blows Dough Hook off the dock!          <-- CONTRADICTION
  A gale blows wy off the dock!                  <-- x2

Round 7: A storm be ragin'! It'll blow yer ships west, then north.
  Crustbeard is blown by the storm               <-- x2
  Flaky Jack is still docked, so the storm can't run them aground.
  A gale blows Flaky Jack off the dock!          <-- CONTRADICTION, second captain
  Dough Hook spots Flaky Jack dead ahead, so strikes sail and holds fast.
  Dough Hook is blown by the storm               <-- x1 only, blocked on the other leg
```

Note the **twice-per-storm** pattern on the non-contradictory lines: that is the two legs
(`windNow` then `windNow2`), which feasibility ruled correct — do not "fix" it. **The contradiction
is the defect**, and it reproduced for two different captains in one nine-round game, so it is not
rare.

Also visible: **Dough Hook in Round 7 gets only ONE "blown by the storm"** because the other leg was
blocked (*"spots Flaky Jack dead ahead"*). That asymmetry is a useful signal — whatever emits these
lines is at least partly movement-aware already, which narrows where the unconditional emit is.

## Relationship to FIX-05

**Read these two together.** FIX-05 (paid anchor narrated as "still docked") is the *same family*:
both are about the storm's shelter/push branches telling the player the wrong story about their own
ship. FIX-05 also has an unconfirmed engine-vs-UI root cause. Investigating them in one sitting is
likely cheaper than twice, and may find one cause behind both.

**Source:** Wyatt, Phase 15 playtest (2026-07-29/30) and again 2026-07-31.
