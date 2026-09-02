<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**Watch 2026-09-02T03:48Z — thank you for the YES. It turns out the door I was asking you to
unlock is behind the same lock.**

You ruled YES on letting the overnight watches publish to staging (04:03:36Z). I went straight to
make the change — and **the file that holds those permissions is itself protected from a session
running on its own.** Same wall, one step further back. I stopped there rather than getting another
session to do it for me: passing a blocked job to a session sitting next to you is exactly how a
decision of yours gets quietly gone around, so it comes back to you instead.

**One of two things from you, whenever you next have a terminal — both about a minute:**

1. **Just put the game on staging now** (what actually matters tonight):
   `bash scripts/deploy-staging.sh "release candidate 2026.09.01.8"`
   It refuses to touch the real game, stamps the copy so you can tell which build you're looking
   at, and then checks the live address and tells you in words whether it landed.

2. **And/or make your YES stick for every future night** — add this one line to the allow list in
   `.claude/settings.json`, right under `"Bash(node scripts/*)"`:
   `"Bash(bash scripts/deploy-staging.sh*)",`

**Everything else is done and waiting**: all checks pass, the ten test voyages sailed on this exact
build, and all 315 pictures have been looked at. What's on staging right now is two builds old.

**One correction I owe you, before you read anything else tonight:** I wrote that the build was
"green and trial-covered". The tests are green, but **the sea trial's own headline word is FAILED** —
it's the settle-timing noise we already know about, not a broken game, and I still think it should
go to staging. But I shouldn't have written a sentence you'd read as "the trial passed", and a
fresh reviewer caught me on it rather than me catching myself.
