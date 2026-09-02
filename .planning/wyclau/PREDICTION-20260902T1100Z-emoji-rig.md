# PREDICTION — written BEFORE the measurement, 2026-09-02T11:0xZ

*Item: `INBOX-20260902T0405Z` / `T-005`. Wyatt tested the black-market coin on real Safari
(staging `.6`) and the coin appeared correctly. Our rig photographed a blank. **The subject is the
rig, not the game.** Rule: write down what you expect and why, and name what would prove you wrong,
before the result exists — a prediction composed after the measurement always turns out right.*

## WHAT HAPPENED IMMEDIATELY BEFORE (rule 27, asked of the sequence, not the screen)

`solo-tablet-wk-026-settled.png` is a **`-settled`** capture — the trial waits for geometry to stop
before shooting. So the frame is deliberately late, not mid-animation, and "caught it loading" is a
weaker explanation here than it would be for a raw shot. The screen before it is
`solo-tablet-wk-026.png`, the unsettled twin, and both are on disk in three folders. **If the glyph
is blank in the settled shot and present in the unsettled one, the cause is a repaint, not a font.**

## WHAT I EXPECT, AND WHY

**The rig CAN draw U+1F315 🌕. I do not expect a missing emoji font.** Two reasons, and the second
is the stronger:

1. This is Windows, and Windows ships **Segoe UI Emoji** system-wide. Playwright's bundled WebKit on
   Windows renders through the system font stack; it is not a Linux container with no emoji font.
2. **The row's own measurement already says so** — `CHART.md` `T-005`: *"it is ONE missing glyph on
   that build, not a missing emoji font — the 🏴 two lines above it renders fine."* 🏴 is U+1F3F4,
   in the same Segoe UI Emoji family. A container with no emoji font blanks both.

**So my expected cause is one of these, in order of my confidence:**

- **(a) A per-element font stack, not a per-machine font.** The black-market string is written by
  `src/ui/panel.js:1155` into a `<b>`; if that subtree's `font-family` resolves to a stack WebKit
  will not fall out of for U+1F315 (a webfont with a `unicode-range`, or a stack ending in a family
  that claims the codepoint and draws `.notdef`), the glyph blanks *there* and nowhere else. This
  fits the evidence exactly: same screen, same engine, one glyph blank, another fine.
- **(b) A colour/paint accident** — the glyph drawn, but in a colour indistinguishable from its
  background, or clipped by its own line box.
- **(c) The rig is right and real Safari differs from Playwright WebKit.** Possible, and it would
  still be an instrument finding rather than a game bug, because his device is the ground truth and
  no report may call Playwright WebKit "Safari".

## WHAT WOULD PROVE ME WRONG

**The cleanest falsifier: render 🌕 and 🏴 side by side in the SAME Playwright WebKit build at the
trial's tablet viewport and DPR, and count the ink in each glyph's box.**

- If **🌕 has zero ink and 🏴 has ink**, my "not a font" reading survives and (a) or (b) is the
  cause — and the next step is the element's computed `font-family`.
- If **BOTH have zero ink**, I am wrong, the rig has no emoji font after all, the `T-005` row's own
  measurement is wrong, and **every emoji-based visual finding this rig has ever produced is
  suspect** — including findings among the 315 screens judged last night.
- If **both have ink in a bare page but 🌕 is blank in the game's own markup**, the cause is the
  page's CSS, which is (a), and it is findable by reading one computed style.

**A measurement that cannot fail is not a measurement**, so the check must be red-proofable: it has
to be able to report BLANK. I will prove that by asking it about a codepoint that genuinely has no
glyph anywhere (an unassigned plane-15 private-use character), and confirming it returns zero ink
while 🏴 returns ink. **If the instrument cannot report blank, it cannot report present either.**

## WHAT I WILL NOT DO

**I will not "fix" the coin.** His words: *"it's working correctly as is."* Nothing about the game
changed; he looked and it was already right. The deliverable of this item is a trustworthy answer
about the rig, and a gate that keeps the answer true.
