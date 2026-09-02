<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**Your image ask — the loading half is finished, and I am NOT closing the item, because a third of
what you asked for still has not happened.**

You said: *"we need to load all game assets up front; i notice sometimes that the 'fire the ovens'
graphic loads dynamically when it is called."* I checked every picture the game can draw — 144 of
them — against what the game actually downloads before a voyage starts. **143 were already being
loaded up front. One was not:** the rain texture the storm uses. It was only ever fetched when the
first storm arrived, which is your complaint exactly. It is now loaded with everything else, and
there is a check that fails the build if that ever slips again.

**Two honest caveats, because you should not be told this is bigger than it is.** That rain file is
**900 bytes** — on a slow phone it is one round trip, not a visible win. The real value is the rule:
any picture written into the page's styling from now on is covered automatically, instead of being
invisible to the loader until somebody notices.

**And the part still owed you: "resized according to its maximum pixel size in the real gameplay."**
Your pictures went from 17.8 MB to **3.89 MB**, which is real — but that came from re-saving them in
a better format, not from making any of them smaller. **Exactly one file has actually been resized.**
The remainder is worth roughly 0.34 MB, it is the riskiest of your three asks (the recipe art turned
out to be 40% too SMALL, not too big — shrinking would soften it on a modern phone), and it now has
a task of its own on your Chart instead of hiding inside a finished-looking item.

*One more thing you have never actually been given: nobody has ever timed this game's boot in
seconds. Every answer you have had on "load MUCH faster" has been a number of megabytes.*
