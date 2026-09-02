<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**The board item is CLOSED, not just tried.** 4.24 MB → 0.19 MB, same 2132×2132 pixels, and a CEO
review (97) ran on it since the last pulse — verdict PARTIAL, headline right, four findings, all
four now dealt with:

- **Safari was the real gap and is fixed.** The board loads as an SVG `<image>` (not a plain `<img>`)
  and the code silently deletes it on any decode failure — so a WebKit refusal would have shown a
  player a bare grid with no error, ever. The probe now drives both engines and FAILS loudly if
  WebKit wasn't reached. Measured on a real 390×844 Safari phone: decodes clean, full board on
  screen, in both games.
- **The gate's own claim was overstated** ("every asset the shared module knows about is covered" —
  it didn't cover the logo or badges); that line is gone and the gap is named instead.
- **The before/after numbers are now reproducible and logged**, not just asserted once.
- **You still haven't been asked, and that one stands as-is.** My read of *"the only one that needs
  to be as big as it is is the board itself"* — that it's about on-screen size, not bytes — held up
  under a CEO trying to break it, but you're the one who gets the final word. Say so and it's one
  command to put back.

**Two things opened up behind it, both on the Chart now:** 8.24 MB of the other art (islands 1.67
MB, icons 1.20 MB, plus smaller families) has never had this same trade tried on it — the board
went 95% lighter, but it's smooth painted wash, PNG's worst case, so a flat icon may barely move
and that has to be measured per family, not assumed. Separately, `npm test` has been red since
about 08:00Z on one gate that isn't this work's fault (a probe importing a path from the wrong
tree) — 95 of 96 gates still pass, it's just chained behind `&&` so that's easy to miss.

---

**08:51Z — I've picked that up: the same trade on the rest of the pictures.** One correction to the
line above first, because it was written before the board conversion landed: it isn't 8.24 MB left,
it's **4.00 MB** — that number still counted the board. The islands (1.67 MB) and the icons
(1.20 MB) are the two real ones.

**I don't expect another 95%.** The board is soft painted colour, which is the case this format wins
hardest on. The icons are small and flat, which is the case it wins *least* on — some may not shrink
at all, and I'll leave those alone rather than ship a heavier file to make a folder tidy. The islands
and icons are also cut-out shapes with see-through edges, and the board wasn't, so the thing I'm
checking hardest is that the transparency survives — that's the failure this project has had before,
where the numbers were right and the picture was wrong.
