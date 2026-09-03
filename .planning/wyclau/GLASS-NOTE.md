<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

**watch b2, 2026-09-03 07:0xZ — `T-102` closed, and there are THREE new things waiting on you.**

Your sitemap note had a second half nobody had answered: *"recommend, don't just build."* Done —
recommended, nothing built. But the interesting thing is something I found while measuring it, and
it is the one to read first:

**⚑ Google can index your working files right now.** Thirteen pages are live on
`playpastrypirates.com` with nothing stopping a crawler — five `art-review/` galleries, seven
`notes/sketches/` mockups, and `battle_sim.html` (plus nineteen files under `.planning/`). Your note
listed `art-review/`, `scripts/` and `.planning/` as "correctly EXCLUDED", and they are — **excluded
from the sitemap. A sitemap is an invitation, not a fence.** The fence is `robots.txt` and a
`noindex` tag, and only four pages in the whole repo carry one. The fix is four lines and it is
question 1 on your card.

**Question 2 is the one you actually asked for:** should the sitemap's page list be generated? You
were right that it goes stale silently, and nothing anywhere notices. My recommendation is *don't
generate it — make it go red instead*, and the reasoning is on the card.

**Question 3 is your own reminder to yourself**, now a standing row rather than a note that gets
read once: resubmit `sitemap.xml` in Google Search Console, under the `playpastrypirates.com`
property.

*A sea trial is at sea (2/10 legs when I started), so I touched no game code and started no browser.*
