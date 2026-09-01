# PREDICTION — the pastry family, written 2026-09-01T23:30Z BEFORE any measurement

Rule 6's working form. Nothing below was retrofitted; the measurement had not been taken when this
file was committed.

**The question.** Wyatt, INBOX-20260901T1335Z: *"everything else should be resized and compressed
according to its maximum pixel size in the real gameplay."* `assets/pastries/` is 21 files and
**1.71 MB** — the heaviest family after `board.png`, which he exempted. Every file is 512 px wide.
Nineteen of the twenty-one came back `NOT SEEN` from the display-size probe, because the probe
never reached the screen that draws them biggest.

## What happened immediately BEFORE this (rule: widen the time horizon)

The probe's own note says why: `desktop: picker=true modal=no-prowRecipe/NOT UP` on all three
viewports. The step before the failure is not the modal — it is the **recipe commit**. The probe
clicks a draft card and then a "Bake this!" overlay (`DRIVING-THE-GAME.md` §3c, two taps), and if
that commit does not land, the game never leaves the picker, `#players` never draws a captain's row,
and `.prowRecipe` — which only exists once a recipe is chosen (`recipe.js:428`) — can never resolve.
**The modal was never refused; the thing that opens it was never built.**

## The prediction

**1. The pastries are already UNDER-resolution and must NOT shrink.**
The largest slot is the recipe modal: `#recipeModalBody .recipeModalThumb { width:100%;
height:220px; object-fit:contain }` (`index.html:344`). With `contain` and a ~512x390 picture, the
220 px height binds before the width does, so the drawn width is about `512 × (220/390) ≈ 289` CSS
px. On the phone viewport (390 px, dpr 3) that is **~867 device pixels wanted against 512 carried —
a ratio near x0.59.**

*This is a prediction FROM CSS, which is exactly what the previous watch was faulted for treating as
a finding. That is why it is written here as a guess to be tested rather than reported as an answer.*

**2. `13-pound-cake` and `11-crispy-cocoa-snaps` will stop looking oversized.**
They are the only two currently measured (x2.42 and x1.95), and both were caught at
`phone/picker` — 71x54 CSS, the tiny stage thumbnail. The modal should overwrite both with a much
larger slot and drop them off the candidate list.

**3. The 320 px icon tier will survive as a candidate, but smaller than CEO 82 sized it.**
Only `crown.png` (35 KB) and `cupcake.png` (28 KB) are measured; the other six are `NOT SEEN`.

## What would prove me WRONG

- **Prediction 1 fails** if the measured `wants` for pastries comes back **at or below ~394 device
  px** (512 ÷ 1.3) on every viewport. That would mean the modal body is far narrower than I think,
  or the width binds rather than the height — and the whole family becomes shrinkable, worth roughly
  1 MB, and this watch's honest answer is the opposite of what it expects.
- **Prediction 2 fails** if the modal does not raise either file's slot — which would mean the
  modal is not in fact their largest slot and something else is.
- **Prediction 3 fails** if reaching the modal also lights up icons currently `NOT SEEN` at sizes
  that change the picture.

## The instrument must be red-proofed before I believe it

The failure mode here is the one this project keeps paying for: **a probe that never reaches its
subject reports something about itself.** So before recording a single pastry number I check that
`document.querySelectorAll('.recipeModalThumb').length > 0` and that its
`getBoundingClientRect().width > 0` — and if that is false the run says `NOT UP` and records
nothing, exactly as the current run honestly did.
