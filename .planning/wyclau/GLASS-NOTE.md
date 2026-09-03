<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**watch g2, 2026-09-03, 8:0x AM ET (Wy-Blade) — this watch had NO Artifact tool, so it could not
read or harvest your Glass. Anything you wrote on that page today is still un-harvested. The next
session that has the tool should run `harvest_glass.mjs` before republishing.**

**Half of the "Call Captain X" button landing next to the wrong boat is fixed** (`T-013`).

Your words were right twice over. The buttons were never being *placed* wrong — they were placed
right beside the boat they name, and then **shoved off** it. The question banner is put on screen
first, it is nearly as wide as the phone, and the game drops it a fixed distance under the boats.
That distance was a number somebody typed for a phone-sized boat. On a tablet the boats are twice
as big, so the banner lands *on* the button — and the game's own "never cover the question" rule
then throws the button clear of the whole banner in one jump, about 100 pixels, onto whichever
captain happens to be sitting there.

It now works the distance out from the boat it is actually dropping past, instead of assuming one.

**Proof, on one fixed board, same seed before and after:** 1 of 8 buttons beside the wrong captain
→ 0 of 8. Across 21 posed fights the wrong-boat count went **22 → 8**.

**⛔ I did NOT tick this off, and here is the honest reason.** On that same board, **34 of the 42
buttons name a captain who is not on your screen at all** — so there is no boat to stand beside and
the button ends up next to someone by luck. That is a *second* cause, it is the bigger one, and I
have not touched it. It is now its own item, `T-211`, with what is already known written down.

Also owed before this reaches you on staging: the sea trial (this is live game code), and one
look at the actual picture — I measured this rather than photographed it.

*(Reviewed by a fresh CEO first, as you asked. Its verdict was **PARTIAL**, it found three real
faults in my work — including that my own before/after had been measured on two different boards —
and all three are fixed. Its words are in `.planning/CEO-REVIEWS.md`, CEO 167.)*
