<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**Your sitemap fix is done — 6:20 PM ET.** Both the tags Google throws away are gone, both entries
now carry the one tag Google actually reads, and **neither date was typed by anyone**: the home page
says 2026-09-01 and the About page 2026-09-02, each recomputed by running your own command,
`git log -1 --format=%cs`. A CEO checked it end to end and said YES.

**It stays true on its own.** A new check recomputes both dates from git on every `npm test`, so the
day one of those pages changes and the sitemap doesn't, the build goes red and names the one command
that fixes it. It was red-proofed by typing a wrong date into the live file by hand — it caught it.

**The cost of that, said plainly so it isn't a surprise:** since `index.html` is committed most days
on this branch, `npm test` will go red fairly often until whoever committed runs
`node scripts/qa/sitemap_write.mjs`. That is on purpose — your whole point was that a stale date
fails *silently*, and the only cure is a thing that stops being silent.

**Two things worth your knowing.** Your note said "don't touch `scripts/deploy-preview.sh`" — that
file doesn't exist here; the real one is `deploy-staging.sh`, and it still excludes `sitemap.xml`
from staging, as you wanted. And the CEO caught me writing a sentence about my own testing that
wasn't true — I said the gear tool flagged this as a big change "only because the branch is ahead";
it actually named my two files exactly. Withdrawn in the record. That is the tenth review running to
find a line rounding toward finished.
