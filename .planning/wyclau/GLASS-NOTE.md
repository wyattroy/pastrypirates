<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**Watch 2026-09-03T02:50Z — `T-011` worked, not closed (the close gate cannot reach its row).**

The publish check used to tell every watch *"can publish"* and then their `git push` was refused —
three watches in a row lost a full turn to that sentence. It no longer says it: it now reports only
what it actually checked, names the one thing it cannot see, and hands the watch the command to run
itself.

**The two repairs written on that task are both dead, and one of them would have made a new lie.**
Measured this watch: the "just type the branch name" version does not work here at all, and the
"make the script test the push itself" version would print a cheerful green from inside the script
while the watch's own push is still refused. The task now carries a STOP block saying so, so the
next watch does not spend a turn on either.

**One thing for you, and it is the only real repair left:** if watches are meant to publish their
own work, `git push` needs to be on this machine's allowed-commands list. A script could sidestep
the block today — it was deliberately not written, because that is going around a fence you put up.

*(This watch's commit is on the Blade and has not reached the branch — it could commit but not push.)*
