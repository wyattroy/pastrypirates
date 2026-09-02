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
swaps it for an `<img>` before anything renders. **What came back blank was that IMAGE.**

**WHY IT DID NOT PAINT IS NOT PROVEN, AND THAT CAVEAT TRAVELS WITH EVERY SENTENCE ON THIS PAGE.**
What is proven is what it is *not* — not a font, not a missing file, not an engine difference — and
that is enough to answer his question and void the one that was sitting on him.

## THE MEASUREMENT THAT SETTLES IT — two pictures and one number

Same leg, same engine, same machine, same 140×50 box at (440,920). The tool is
`scripts/qa/t005_glyph_ink.mjs --cols`, which reports runs of ink and gap across the box.

| run | build | column profile across "10🌕." |
|---|---|---|
| **19:14Z** (blank) | tree of 2026-09-01T19:14Z | `ink@5x13` `ink@21x18` **`gap@39x42`** `ink@81x8` |
| **01:37Z** (coin)  | tree of 2026-09-02T01:37Z | `ink@5x13` `ink@21x18` **`gap@39x3` `ink@42x36` `gap@78x3`** `ink@81x8` |

**The blank gap is 42 px. The coin plus its cling margins is 42 px. The full stop begins at column
81 in both.** So the text around the icon is laid out identically in the two runs: nothing reflowed,
nothing was mid-typing, the sentence is complete and the icon's slot is where it belongs.

> ### ⚠ AND THAT WIDTH MATCH PROVES LESS THAN THE FIRST DRAFT OF THIS PAGE CLAIMED. CEO 101 CAUGHT IT.
>
> It said the matching width showed the image had loaded and merely failed to paint. **It does not.**
> `.narrIcon` is pinned at `width:18px; height:18px; margin:0 1px` (`index.html:307`) — a fixed CSS
> box, not the picture's own size — so **a completely failed image reserves exactly the same 42
> device pixels.** The width match rules out a reflow, and nothing more.
>
> **What actually rules out a failed load is the rest of the frame:** the CAPTAINS panel paints the
> same `assets/icons/coin-emoji.png` **four times** in that very screenshot (`src/ui/util.js:165`,
> read, not assumed). The file was fetched and decoded at that instant.
>
> *Recorded rather than quietly rewritten, because "the box was intact, therefore the file loaded"
> is a plausible-sounding rule that is simply wrong, and the next person to reuse it would be too.*

**And there is a second, stronger disproof of the font theory that this watch had in hand and did
not use — also CEO 101's.** The 🏴 that OPENS the same card (`src/ui/panel.js:1153`) is a **bare
U+1F3F4**, and `EMOJI_IMG` holds only the ZWJ sequence `"🏴‍☠"` — so that flag is *not* swapped. It
is a typed emoji, drawn by the font, on the same card, in the same frame, in the same headless
WebKit capture where the coin came back blank. **If the rig had no emoji font, the flag would be
blank too. It is not.** That control is now case 3 of the gate.

So: not a missing font, not a missing file, not a Safari-versus-Chrome difference.

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

- **`scripts/qa/emoji_with_art_never_reaches_screen_check.mjs`** — 5 cases, in `npm test` (98 gates).
  ⚠ **It shipped for about an hour under the name `typed_emoji_never_reaches_screen_check.mjs`, and
  that name was FALSE** — the bare 🏴 above is a typed emoji that does reach the screen. CEO 101
  caught it, and the point is not the typo: **a gate whose NAME claims more than its cases prove is
  this very item's fault one level up**, and the name is what gets printed every time the suite
  runs. Renamed rather than narrowed in a comment. *(The old path survives as a one-line stub
  pointing here, because an unattended watch on this machine cannot delete a file — `rm`,
  PowerShell `Remove-Item` and `git mv`/`git rm` are all refused. Measured, not assumed. Whoever is
  here with a person at the keyboard: delete it.)*
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
