# W3-1 — the battle box choreography. PREDICTION, WRITTEN BEFORE MEASURING.

Wyatt's report, verbatim: *"The battle box choreography is glitchy, in ALL modes. It appears for an
instant, the stage deletes it, it moves down to centre, then it is removed and replaced by the stage
with the coin flipper. And after the flip the coin disappears from the flippenator BEFORE the stage
does — it should stay until the stage goes."*

**"All modes" is the tell, and it is the FIRST thing to honour:** this is not a host/guest fault, so
Wave 1's whole family of causes is excluded before I start.

## WHAT HAPPENED IMMEDIATELY BEFORE (rule: widen the time horizon)

He describes four transitions where a player should see one. Read statically — NOT yet measured:

1. `renderBattle` (`src/orchestrator.js:260`) draws the battle card with `panel(html, !!o.prompt)`.
   `panel()` puts it in the ordinary action-panel position. **Nothing stages it.**
2. The stage's own pose pass (`src/ui/stage.js:2544`) decides where the panel lives from
   `ap.dataset.pp4Stage || ap.querySelector(".bko")`. The battle card is `.btl`, not `.bko`, and
   `renderBattle` never sets the flag — so on this pass it is NOT centre stage.
3. `localAsk` sets the flag when any option carries `stage` (`src/ui/flow.js:218`). So when the
   battle's PROMPT arrives, the flag goes on and the same card is re-posed at centre.
4. The flip ceremony then mounts `#pp4CerSlot` and replaces it again.

**PREDICTION: the card is drawn at least twice for one beat — once unstaged, then again staged —
because the decision "is this centre stage" is made from the panel's CONTENT after the content has
already been drawn, rather than being known when the battle begins.** That is the same shape as
every rule-23 fault in this repo: two things deciding one thing, in sequence, with a frame in
between where the player sees the loser.

**AND THE FLIP COIN:** the coin lives in `#flipCoinWrap` inside `#flipPanel`, moved into
`#pp4CerSlot` for the ceremony. If the coin is cleared by whatever ends the FLIP while the SLOT is
torn down by whatever ends the CEREMONY, those are two teardowns with no ordering between them —
and the coin losing that race is exactly what he describes.

## WHAT WOULD PROVE THIS WRONG

- **If a per-frame trace of a real battle shows the card rendered ONCE**, at centre, with no
  intermediate unstaged frame, then the double-render theory is dead and what he is seeing is
  something else — most likely a CSS transition on the pose change rather than a re-render.
- **If `dataset.pp4Stage` is already set before `renderBattle` runs**, step 2 above never happens
  and my reading of the order is wrong.
- **If the coin and the slot are torn down by the same call**, the flip half is not a race and I
  should look at a transition duration instead.

## HOW IT WILL BE MEASURED

A per-animation-frame sampler across one real battle, in a real browser, recording for every frame:
whether `.btl` is in the DOM, which container it is inside, whether `body.pp4Stage` /
`ap.dataset.pp4Stage` are set, whether `#pp4CerSlot` exists, and whether `#flipCoinWrap` has a coin.
**Then count the DISTINCT visual regimes for one battle.** One beat should be one regime.

The instrument must be red-proofed: if it reports "one regime" on a build Wyatt says is glitchy in
every mode, suspect the sampler before believing the acquittal (rule 6 — an acquittal is as suspect
as a conviction).

---

## THE MEASUREMENT, AND MY PREDICTION WAS HALF WRONG. Said out loud rather than reframed.

`scripts/qa/w31_battle_choreography.mjs`, one solo voyage, 180s, every animation frame, three
battles caught:

```
   77005ms  card in:apGridInner - bodyStage - coin:empty y0
   77132ms  card in:apGridInner - bodyStage - coin:empty y280     <- 127ms later
  170796ms  card in:apGridInner - bodyStage - coin:empty y400
  170863ms  card in:apGridInner - bodyStage - coin:empty y280     <-  67ms later
  211395ms  card in:apGridInner - bodyStage - coin:empty y0
  211527ms  card in:apGridInner - bodyStage - coin:empty y280     <- 132ms later
```

**WHAT I GOT WRONG.** I predicted the card is drawn into TWO containers — once unstaged by
`renderBattle`'s `panel()` call, then again at centre once a prompt's `stage` flag sets
`ap.dataset.pp4Stage`. **It is not.** The card is in `#apGridInner` on every single frame it exists,
and `apStage` is never set at all while it is on screen. My named falsifier was *"if the trace shows
the card rendered once, with no intermediate unstaged frame, the double-render theory is dead"* —
it is dead, and the double-render theory with it.

**WHAT IS ACTUALLY HAPPENING, and it is his sentence exactly.** The card is painted at one vertical
position and then **MOVES to y≈280 within 67–132ms — every time, three out of three.** It starts
from wherever the previous content left the panel (y0 twice, y400 once) and settles at the same
place. *"It appears for an instant… it moves down to centre."* That is one beat drawn in two
positions, which is a layout that is applied after the paint rather than before it.

**THE STARTING POSITION IS NOT A CONSTANT** — y0, y400, y0 — so this is not a fixed offset to
subtract. It is the panel being painted before it has been placed.

**AND THE SECOND HALF OF HIS REPORT WAS NOT OBSERVED.** `coin:empty` on every frame of the run: the
flip coin never carried content in this window, so *"the coin disappears from the flippenator BEFORE
the stage does"* is **not measured here and remains open**. Reporting the half I saw as though it
were the whole item would be the same unearned confidence rule 6 exists to stop.
