<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

Done, 19:2xZ: the handbook now gets checked for commands that cannot run on the machine reading it.
The one that started this -- `pkill`, the tidy-up line that let 183 browsers pile up on your laptop
-- was never once verified, and neither was the very first line of the manual for driving the game
here: it says `python3`, and this laptop has no `python3`. Both fixed, plus five more across four
documents. 99 commands checked every build. CEO 116: PASS.

Two things I found and did NOT fix, because a watch takes one item: `npm start` is broken on
Windows for the same reason (it runs `python3`), and a command written in an unlabelled code box is
still invisible to the check. Both filed for the next watch.
