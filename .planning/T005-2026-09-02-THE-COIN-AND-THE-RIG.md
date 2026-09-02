# T-005 — HIS SAFARI AND OUR RIG WERE BOTH RIGHT. THE EXPLANATION IN THE RECORD WAS WRONG.

*Watch 2026-09-02T11:00Z (Wy-Blade), `INBOX-20260902T0405Z`. Wyatt: **"I just tested the black
market coin bug on safari, staging.6 and the coin appeared correctly. I'm not sure what caused your
rig to miss it, but it's working correctly as is."** His instruction was not to fix the coin, and
no game code was changed. The subject is the instrument.*

**Prediction written before any measurement:**
[`wyclau/PREDICTION-20260902T1100Z-emoji-rig.md`](wyclau/PREDICTION-20260902T1100Z-emoji-rig.md).
**It named the right falsifier and the wrong cause, and both are reported below.**

---

## THE ANSWER IN ONE LINE

**The game never draws 🌕 at all**, so no font — his Safari's or the rig's — was ever asked to.
`src/shared/index.js:135` maps that character to `assets/icons/coin-emoji.png`, and `emojify()`
swaps it for an `<img>` before anything renders. **What came back blank was that IMAGE, with its
layout box intact.**

## THE MEASUREMENT THAT SETTLES IT — two pictures and one number

Same leg, same engine, same machine, same 140×50 box at (440,920). The tool is
`scripts/qa/t005_glyph_ink.mjs --cols`, which reports runs of ink and gap across the box.

| run | build | column profile across "10🌕." |
|---|---|---|
| **19:14Z** (blank) | tree of 2026-09-01T19:14Z | `ink@5x13` `ink@21x18` **`gap@39x42`** `ink@81x8` |
| **01:37Z** (coin)  | tree of 2026-09-02T01:37Z | `ink@5x13` `ink@21x18` **`gap@39x3` `ink@42x36` `gap@78x3`** `ink@81x8` |

**The blank gap is 42 px. The coin plus its cling margins is 42 px. The full stop begins at column
81 in both.** The `<img>` had its full width and painted nothing.

**And the file was loaded at that instant** — the CAPTAINS panel of that very frame paints the same
`assets/icons/coin-emoji.png` four times (`src/ui/util.js:165`, read, not assumed). So it is not a
missing file, not a missing font, and not a Safari-versus-Chrome difference. **It is one `<img>`
that reserved its box and did not paint in the frame the camera caught** — a paint transient in a
headless WebKit capture.

Pictures: [`posed/t005-1914Z-crop.png`](posed/t005-1914Z-crop.png) (the gap) and
[`posed/t005-0137Z-crop.png`](posed/t005-0137Z-crop.png) (the coin), both magnified 5× from the
archived screenshots so the thing can actually be looked at.

## WHAT THIS VOIDS — three documents say the opposite, and one open question was aimed at Wyatt

The same wrong sentence propagated three times: *"what came back blank was the **typed** U+1F315."*

| document | what it says | status |
|---|---|---|
| `CHART.md` `T-005` | *"`src/ui/panel.js:1155` writes a raw **U+1F315** glyph… Two representations of one coin (rule 23), and one of them can vanish… The fix is rule 23's: one coin, the image, everywhere"* | **wrong on all three counts.** The typed character never reaches the DOM; there is only ONE representation and it is already the image everywhere; and there is no rule-23 fix to make |
| `JUDGED-2026-09-02T0219Z.md` §on the coin | *"it is one missing glyph on one engine: not a missing emoji font"* | **half right for the wrong reason** — right that it is not a font, wrong that it is a glyph |
| `JUDGED-2026-09-02T0300Z.md:220-223` | *"what came back blank was the **typed** U+1F315 in the black-market string, not the image… real Safari is still unknown"* | **wrong, and it is the sentence that kept a void question on Wyatt** |

**THE QUESTION SITTING ON HIM — *"does real Safari blank the typed 🌕?"* — IS VOID, NOT ANSWERED.**
It could never have had an answer, because no Safari is ever handed that character.

**And the worry it raised is void with it:** the item asked whether *"every emoji-based visual
finding from the rig is suspect — including any among tonight's 315 judged screens."* **They are
not.** The rig renders these icons as images, and it demonstrably renders this one: the 01:37Z run's
same leg photographed it correctly.

## HOW A CAREFUL READING GOT IT WRONG THREE TIMES — the reusable part

**Every pass read the SOURCE STRING and stopped there.** `panel.js:1155` really does contain a typed
🌕, and that is a true fact about the file which says nothing about the screen. Between the source
and the pixel sits `emojify()`, applied at `describe()` and `panel()` — one hop, and nobody took it.

**This is rule 6 wearing new clothes.** The old form is *a comment is not a measurement*. The form
here is **a source string is not a rendered string**, and it is more seductive, because reading the
source feels like reading the code rather than reading a claim about it.

## WHAT WAS SHIPPED

**No game code.** `src/` and `index.html` are untouched, deliberately — his words were *"it's
working correctly as is"*, and the transient is in a headless capture, not in the game.

- **`scripts/qa/typed_emoji_never_reaches_screen_check.mjs`** — 5 cases, in `npm test` (98 gates).
  It asserts the fact three documents misread: the typed emoji is gone from `emojify()`'s output and
  the coin image is in its place. **Red-proofed** by deleting `"🌕"` from `EMOJI_IMG`: cases 1 and 4
  go red.
  ⚠ **And the red-proof found a limitation in the gate's own case 2, which is recorded in the file
  rather than smoothed over:** the "every mapped emoji is replaced" case stayed GREEN at 73 of 73
  with the entry deleted, because the map is both the subject and the list of what to test. **A case
  derived from a list cannot notice the list shrinking.** That is why case 1 names the real string
  literally, and case 1 is the one that went red.
- **`scripts/qa/t005_glyph_ink.mjs`** — the measuring tool. Ink and column profile inside a named
  box of any screenshot, with the paper colour derived from the box rather than passed in. It is
  what turns "there's a gap" into "the gap is 42 px and so is the coin."

## WHAT IS STILL OPEN, NAMED RATHER THAN CLOSED OVER

**The exact mechanism of the missed paint is not proven.** What is proven is what it is *not*
(font, missing file, load failure, engine difference) and that the element had correct layout. A
posed reproduction — the black-market card injected on a seeded board, photographed repeatedly at
the settle moment (`docs/DRIVING-THE-GAME.md` §5e) — is the way to chase it, and it is a separate
item because it is a chase, not a fix. **It is worth chasing only if it recurs**: it has been seen
once, in one frame, on one leg, and the next run's same leg was clean.

**The reason it is not being chased now is his own instruction.** He looked at the real device and
said the game is fine. The cost of this class of error — four of five defects put to him on
2026-08-20 were not real — is paid by chasing, not by stopping.
