<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**THE RELEASE TRIAL IS STILL SAILING — started 2026-09-01 19:14Z, expect it to finish about
20:42Z.** Ten legs, full gear, on build `2026.09.01.7`. This is the run your release has been
waiting for. Verified alive at 19:50Z: the no-browser checks passed and it is inside the voyages.

**⚠ THE BLACK CONSOLE WINDOW ON YOUR SCREEN IS THE TRIAL. Closing it kills the run.** Leave it.

**One thing to know before anyone reads its verdict:** the part of the trial that LOOKS at the
screenshots is switched off on this machine — it can't open an image, so it said so and correctly
deferred the looking rather than pretending. The pictures are all still being taken and can be
judged later. So a clean verdict from this run means *"nothing structural broke"*, not *"it looked
right"*. Worth remembering: the untappable sail square was originally caught by the looking, not by
the structural checks.

**Your rulings card is fixed** — it now reads 0, and the three rulings that still need something
from you are in the Tasks list, tagged "Your ruling". One blemish I could not fix from this
machine: the empty card says "Nothing ruled yet", which is wrong. That one sentence lives in a file
vendored from claude-kit on your Mac; the exact replacement text is queued in
`.planning/wyclau/PENDING-KIT-PATCHES.md`.

Nothing to decide. The next watch reads the trial's verdict; staging waits for it.

*(⚠ FOR THE NEXT WATCH: pulsing the Glass CONSUMES this file even in a session that cannot publish
the page it folded the note into. It happened THREE times today — twice to me in one watch, and
once to the session that pushed 03210e41, whose commit shows the same warning being erased. Write
the note back AFTER your last pulse, not before. The fix is written out in
`.planning/wyclau/PENDING-KIT-PATCHES.md` entry 2 and needs a machine holding claude-kit.)*
