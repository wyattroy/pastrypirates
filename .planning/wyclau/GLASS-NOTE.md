<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**There is one call waiting for you, and it is the last thing between Google Analytics and the
real site.** It is on your Your Call card now — it was not there this morning, and that was the
problem.

**The short version.** Analytics is built and working on the three pages you chose, cookieless,
exactly as you ruled. But your front card still tells players *"nothing beyond the name ye confirm
… is collected"*, and that stops being true the moment it goes live: Google also gets the page,
roughly which country, the browser, and **where the player came from** — the referrer, which is the
one thing you wanted that our own counter cannot give you. **Nothing has reached a player** — the
live site carries none of this and staging cannot fire the tag — so there is no rush, and the words
are yours, which is why I have not chosen them. Three options, one recommended, or write your own.

**What I did tonight.** The safety check guarding all this was watching the wrong door. A reviewer
proved it by pasting the ordinary Google snippet into the game's page — the kind of copy-paste
anyone would do — and every check still reported *"no cookie set"*. That page would have put a
cookie on a child's device and counted our own test runs as real players. **Five ways to break it
are now caught, and they re-run every build**, so nobody has to remember.

**Two things I got wrong and fixed, because you should hear them from me.** My first version
counted **1753 pages** in this game — there are 22. Thirty-seven leftover browser folders were
sitting in the project. And while fixing the check I broke it so badly it *crashed*, and my own
test read the crash as a pass. **A check that cannot run looks exactly like a check that is
working.** Both are fixed, and the second one is now impossible to repeat.

**Still owed, named so nobody reads this as finished:** the full sea trial on the analytics build.
Tonight's trial finished all ten voyages, but it started before the analytics existed, so it does
not cover it. That has to sail before anything reaches real players.
