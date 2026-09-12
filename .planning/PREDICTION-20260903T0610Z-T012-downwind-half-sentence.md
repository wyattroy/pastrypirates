# PREDICTION — `T-012`: does a downwind battle card end on a half-sentence?

**Written 2026-09-03T06:10Z by watch b1, BEFORE any browser was opened.** Rule: the whole value of a
prediction is that it cannot be retrofitted.

## The question

`solo-tablet-wk-018-settled.png` shows a battle card reading

> *"Both fire 🪙 HEADS — but Davy Scones's firing"*

and stopping. `src/orchestrator.js:700` writes

> `Both fire ⚪ HEADS — but ${dwName}'s firing downwind and the shot hits!`

Six words are missing from the screen. The Chart row names two live explanations with opposite
fixes: **(A)** the screenshot caught a progressive reveal a fraction early, or **(B)** the wrapped
second line is clipped by the card, and every downwind battle in the game ends mid-phrase on every
engine.

## What I expect, and why — read from the source before opening a browser

**1. Explanation A cannot be the typewriter, and that is already settled in the code.**
`typewriterReveal()` is only ever applied to `.apMsg` — `src/ui/panel.js:454` selects
`.apMsg:not(.fadeOut)` and hands *that element* to the typewriter; with no match, `revealDone` is an
already-resolved promise and nothing is typed. `src/ui/panel.js:375` says in its own words that
*"renderBattle()'s HTML has no `.apMsg`/`.apBtns`/`.apBack` at all"*, and reading
`src/orchestrator.js:305-322` confirms it: the battle card is `.btl` / `.btl-hd` / `.btl-body` /
`.btl-wind` / `.btl-result`. **So the battle result is not typed in character by character.**

**2. But there IS a second progressive mechanism, and nobody has named it on this row.**
`#apGrid` is a grid whose single row is a pinned pixel height with
`transition: grid-template-rows .18s ease` (`index.html:467`), and `#apGridInner` is
`overflow: hidden` (`index.html:473`). **The panel's height animates for 180ms and clips whatever
overflows it while it moves.** `.btl-result` itself has no `max-height` and no `overflow`
(`index.html:808`) — so if the sentence is cut, the cut is made by the panel, not by the line.

That gives a third explanation the row does not have: **(C) the screenshot landed inside the 180ms
height animation** — a race, not a layout bug, and exactly the shape rule "widen the time horizon"
warns about.

**3. So my prediction: NOT a permanent clip. Explanation A/C, not B.** Posed on a tablet and given
time to settle, the full sentence will be visible in both engines. I expect `.btl-result`'s own
`scrollHeight` to equal its `clientHeight`, and the bottom of `.btl-result` to sit above the bottom
of the visible `#apGridInner` box.

**Confidence: moderate, not high.** The mechanism that would make B true is real and this project has
already paid for it once — `src/ui/panel.js:400-406` records a measured case where the panel came out
one line short and *"#apGridInner's overflow:hidden then CLIPS the line"*. That is B, with a receipt.

## What would prove me WRONG

1. **The posed, settled card shows one line and the sentence stops mid-phrase.** Then B is right, it
   is a live defect on every downwind battle, and my reading is wrong.
2. **`.btl-result.scrollHeight > .btl-result.clientHeight`, or its bottom edge falls below the
   visible bottom of `#apGridInner`, after settling.** Same conclusion, measured instead of eyeballed.
3. **The sentence fits on ONE line at tablet width.** This one falsifies *both* of the row's
   explanations, not just mine — if there is no second line to clip and no wrap to catch early, then
   whatever cut that screenshot is something nobody has proposed yet, and the item is not
   settleable by this pose. I have to say so rather than pick the surviving option.
4. **The two engines disagree.** If Chrome shows the whole sentence and WebKit does not, then the
   answer is neither A nor B as stated, and the row's "on every engine" clause is wrong.

## What I will NOT do

Not a sea trial. Not a rate. This is a picture (rule 26), and the row says so itself: *"Do not run a
trial for this."*
