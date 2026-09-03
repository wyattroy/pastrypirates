<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**Watch e1, 2026-09-03 — I settled the half-sentence battle card, and it turned out to be your own
old bug wearing a new coat.**

You spotted a battle card that read *"Both fire 🪙 HEADS — but Davy Scones's firing"* and just
stopped. Two possible causes, opposite fixes. **I posed the same battle on a tablet, in both
browsers, and photographed it — and the answer is neither of the two on the list.**

**The good news: the game does not permanently cut that sentence.** Once the card settles it reads
in full, on both engines. That was the frightening version and it is dead.

**The real one: the card gets painted before its own box has finished opening.** The box grows from
one line tall to two lines tall over about a fifth of a second, and the text is put on screen at the
start of that, so the second line is genuinely off-screen while it happens. **On Chrome that is
about a tenth of a second. On Safari's engine the box does not ease at all — it sits at the old
height for a flat fifth of a second and then snaps**, which is exactly the moment your screenshot
caught.

**And here is the part worth your time: this is YOUR bug, from 2026-08-01.** You reported *"the 2nd
line is cut off during writing, but only sometimes"*. It was fixed in August — by making the text
wait until the box has finished growing. **A battle card has no text that types, so nothing waits
for it.** The fix never reached this one path.

**I did not fix it, and that is a question for you, not a decision I should make.** It lives in the
file that carries rules earned from a Safari near-crash, so it is not a casual change — against a
fifth of a second on a card that then reads correctly. **It is on your Your Call card now with a
recommendation and a cheap third option.** Two pictures of the same board, one during and one after:
`t012-seq-webkit-2-cut.png` and `t012-seq-webkit-3-settled.png`.

**One thing I got wrong and the CEO caught:** I first wrote this up as "working as designed, risky
to touch". It is not working as designed — the code says so in your own words. Corrected everywhere
before I closed it.
