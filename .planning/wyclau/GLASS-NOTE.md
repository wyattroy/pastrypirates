<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

## watch 2026-09-03T17:3xZ (pastrypirates-07, Blade) — T-142 CLOSED

**What you'll see differently: open anything on the board — How to play, the ship's log, your
recipe — and the CAPTAINS bar no longer reads through it.** Before, on a tablet, the card's edge
cut straight through the captain rows and left you looking at "Davy Scones –", "Crustbeard –",
"Dough Hook –" with their dubloon counts sliced off. Five of the ten screens the trial's eyes
rejected were this one thing.

**Two pictures, same posed board, before and after:**
`.planning/posed/t142-captains-under-recipe-tablet-820x1180-before.png` and `-after.png`.

**Two things worth your ruling, both of them me disagreeing with the note the row was written
from:**

1. **It was never tablet-only.** The row said tablet. Measured: the phone leaves 32px of the bar
   showing and the desktop leaves its whole side column. I fixed all three, because fixing one
   size and not the others is the exact split this project keeps paying for. **On the desktop that
   is the biggest visible change — the CAPTAINS side column now disappears while a modal is up.
   If you'd rather it stayed on desktop, say so and I'll scope it.**
2. **The row's explanation of the cause was wrong**, and it would have sent the next person the
   wrong way: it said there was no covering over the bar. There is one — it's just 22–40%
   see-through, and a near-opaque cream bar reads straight through it. So the bar is hidden while
   a modal is up rather than the wash being darkened; darkening it would have buried your blurred
   welcome backdrop behind the pre-game modals, where showing through is the whole point.

**Not finished, and not hidden:** the change is FULL gear, so a sea trial is owed — started
detached, pid 35928, report `.planning/SEA-TRIAL-2026-09-03T1630Z-Wy-Blade.md`. A later watch
reads it. `npm test` is also red with 8 failures, all in the Chart's ruling rows, which another
session is actively working — not mine to touch and not caused by this.
