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

---

## 2026-09-01 — A FIFTH THEORY, WRITTEN BEFORE MEASURING. THE PREVIOUS TWO ATTEMPTS BOTH DIED ON
## "IDENTICAL RESULT" BECAUSE NEITHER TOUCHED THIS LINE.

Picking this item back up after the 2026-08-30T11:41:26Z handover, which located the mover to
`#pp4Prompt` itself carrying a stale inline `top` for one frame (`promptTick`'s `isBattle` branch,
`src/ui/stage.js:3447-3448`) and handed over the fix shape (extract the placement so it can run
SYNCHRONOUSLY when the content is built, mirroring `enterCenterStage()`) without shipping it,
because two prior JS-ordering fixes had already been tried and reverted.

**READING THE FILE FRESH RATHER THAN TRUSTING THE HANDOVER'S OWN NEXT STEP, because the handover
said "extracting a branch out of promptTick is structure, not a one-liner" and that is worth
checking before attempting it** — there may be a smaller fault sitting in front of the branch it
never reaches.

**THE MECHANISM, READ FROM THE CODE, NOT YET MEASURED:**

1. `panel()` (`src/ui/panel.js:513`) calls `window.__pp4.syncPrompt()` synchronously, at its own
   single chokepoint, specifically so a freshly-built prompt is "laid out in the frame it was
   built" (panel.js:506-512's own comment, written for the recipe-card flash this exact bug family
   already fixed once).
2. `syncPrompt` (`src/ui/stage.js:3728`) calls `promptTick()` directly — outside the rAF loop,
   with no scheduling delay.
3. **`promptTick()` throttles its own positioning work: `if (!S.tween && fc % 3) return;`
   (stage.js:3425), BEFORE it ever reaches the `isBattle` branch at 3447-3448.** `fc` is a
   module-level frame counter incremented only inside `tick()` (stage.js:3539), the real rAF loop.
   A synchronous call from `syncPrompt()` does not increment `fc` and does not know its value —
   so roughly 2 times in 3 (whenever `fc % 3 !== 0` and no camera tween happens to be running),
   the synchronous "lay it out now" call for a battle card returns at line 3425 **before reaching
   the code that clears the stale inline `top`/`left` and adds `.centered`.**

**THIS MATCHES THE RECORDED FRAMES EXACTLY.** The 2026-08-30T11:41:26Z measurement: frame 1
`top=0px inline=0px tr=none` (the isBattle branch never ran — inline top is whatever the PREVIOUS
prompt left, nothing cleared, no `.centered` transform), frame 2 `top=396px inline=UNSET tr=yes`
(a later real `tick()` call, landing on `fc % 3 === 0`, finally reached the branch).

**WHY THE CENTRE-STAGE PATH (`enterCenterStage()`) NEVER SHOWS THIS BUG:** it is called at
stage.js:2584, structurally BEFORE the throttle line (2584 sits inside `promptTick()`'s own top
half, then `return`s at 2585) — so it always runs on every call, throttled or not. The `isBattle`
branch sits in the OTHER half of the same function, past the throttle. Same function, same
synchronous entry point, but only one of its two "centre this card now" paths is actually
un-throttled.

**PREDICTION: adding a `force` parameter to `promptTick(force)` — true only from `syncPrompt()` —
and changing the throttle to `if (!force && !S.tween && fc % 3) return;` makes the synchronous
call always reach the `isBattle`/`big` branch on the same tick the content was built, so the card
never carries a stale inline position into its first visible frame. The RED gate
(`scripts/qa/w31_battle_choreography.mjs`) should then report ONE vertical position instead of
two, on the same measurement it already makes.**

**NAMED FALSIFIER:** if the gate still reports two positions after this change, `fc`/`S.tween`
were never the gate keeping the synchronous call out — in which case say so plainly and look at
whether `syncPrompt()` itself is even being called before the first paint (a scheduling question,
not a throttle one), rather than reframing a miss as a partial win.

**WHY THIS IS A ONE-LINE-SHAPED FIX RATHER THAN THE STRUCTURAL EXTRACTION THE PRIOR HANDOVER
EXPECTED:** the previous two attempts both edited CODE INSIDE the throttled section (a height
transition, a `parseFloat(box.style.top)` clamp) — work that never ran on the synchronous call
either, for the same throttle reason, which is also why both attempts measured "identical result."
Removing the gate that skips the branch on its one synchronous call is a smaller, more targeted
change than extracting the branch into a second function, and it fixes every prompt style this
throttle currently starves on its first frame, not just the battle card.
