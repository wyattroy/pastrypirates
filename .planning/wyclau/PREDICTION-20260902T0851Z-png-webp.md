# PREDICTION — watch 2026-09-02T08:51Z, before a single byte is measured

*Rule 6's working form: write down what you expect and WHY, name what would prove you wrong, then
measure, then say plainly which parts were wrong. Written at 08:51Z; the first measurement had not
been taken.*

**The item:** `T-058` — the next lever of `INBOX-20260901T1335Z`, his launch-critical
*"compressing the images to make the game load MUCH faster."* The board went WebP this morning
(95% lighter, `T-057`) and the recipe art before it (31% lighter, `T-004`). **The remaining PNGs
have never had the trade tried on them.**

**WHAT HAPPENED IMMEDIATELY BEFORE (rule: widen the horizon).** The 08:10Z watch converted
`board.png` → `board.webp` and deleted the PNG. So the "8.24 MB of PNGs" written into `T-058`'s own
row **already includes 4.24 MB that no longer exists.** I expect the census to say roughly **4.0 MB
of PNG in ~121 files**, not 8.24. *If the row's own number is stale, the first thing this watch
owes is a corrected number, not a conversion.*

## WHAT I EXPECT

1. **The families will NOT behave like the board.** The board is smooth painted wash — PNG's worst
   case, WebP's best. Icons are small, flat, few-colour cutouts, which is PNG's *best* case. I
   expect the spread to be wide: islands (painted, like the board) large savings; icons much
   smaller savings; some individual icons possibly **bigger** as WebP than as PNG.
2. **Numbers I am committing to before looking:**
   - islands (1.67 MB, 7 files): **60–85% lighter**
   - icons (1.20 MB, ~90 files): **25–55% lighter**
   - whole PNG set 4.00 MB → **1.4–2.4 MB**; `assets/` 6.00 MB → **3.4–4.4 MB**
3. **Alpha is the risk, not the bytes.** Islands and icons are cutouts with transparent surrounds;
   the board was fully opaque. WebP carries alpha, but the *canvas* encoder path this repo uses can
   silently composite onto black or white if the canvas is not cleared. **W5-1 already paid for
   exactly this failure — numbers right, picture wrong.** So fidelity must be measured on **four
   channels including alpha**, not three, and a family whose alpha moves at all is not shipped.
4. **The reference edit is bigger than the board's was.** The board was one path in one place.
   These are ~64 occurrences across `src/shared/index.js`, `src/ui/{board,stage,util}.js` and
   `index.html`, **plus `classic/`, which reads the same `assets/` folder** — his ruling on the
   pastries was that `/classic` shares the converted files, so the frozen v1 must be edited too or
   it goes blank.

## WHAT WOULD PROVE ME WRONG

- **If the whole PNG set lands above 2.8 MB** (i.e. under ~30% lighter), my "the format is proven
  on this library" reasoning does not carry to these families and the honest report is *the trade
  does not pay here*, not a smaller win dressed up.
- **If any converted file's alpha channel differs from its source at all** — not "looks fine", the
  measured max alpha delta over every pixel — then the canvas path is compositing and every byte
  count from it is worthless.
- **If any individual file gets BIGGER as WebP**, my "small flat icons already quantize well" line
  is right and those files must be left as PNG. A conversion that ships a heavier file to make a
  folder tidy is the opposite of the ask.
- **If `assets/` shrinks but the game's boot fetch does not**, the win is invisible to a player.
  His words were *"make the game load MUCH faster"* — the number that matters is what the browser
  pulls at boot, not what `du` says.

## WHAT I AM NOT DOING

Not resizing anything. His sentence *"resized and compressed according to its maximum pixel size"*
has a resize half that `.planning/ASSET-DISPLAY-SIZES.md` already measured as nearly empty (CEO 83:
~0.15–0.25 MB left in it). **Same pixels in, same pixels out. Format only** — the trade he has
already ruled on twice.
