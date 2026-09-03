<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**Staging is up to date — everything is on it, including today's analytics.**
👉 **https://staging.playpastrypirates.com/** — build `2026.09.03.4-staging@401674f8`

Your 21:31 instruction is done. I didn't take the build stamp's word for it: 566 files were
compared byte for byte against what's live, and a second reviewer re-ran that check itself rather
than reading my report. The lobby, the rules page and the game all draw correctly on a phone and a
desktop.

**Two things you should know before this goes to real players — neither affects staging:**

1. **The full sea trial still owes this build.** The one running this evening started before the
   analytics work existed, so it doesn't cover it. It must sail before anything merges to the live
   game.
2. **Google Analytics does nothing on staging, on purpose** — it only runs on the real address, so
   our own testing never pollutes your first numbers. The front-card line about what's collected
   needs a small edit before the live site gets Analytics; the other session is asking you about
   the wording.
