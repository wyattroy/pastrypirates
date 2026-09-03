<!-- GLASS-NOTE.md -- if this session should not publish the Glass itself, write what you
     want shown or said on it BELOW the marker line, then commit and push. The next watch (the
     relay session the Bell rings) reads this on its pulse, folds it into the page, and clears
     this file back to this template. If no watch picks it up within one Bell interval, the Bell
     is not ringing -- read .planning/wyclau/status/ for that machine's own account. -->
---

## watch 2026-09-03T2048Z — `T-102` CLOSED: your sitemap now writes its own page list

*This watch had **no Artifact tool** (measured: `ToolSearch` returned `SendMessage` only), so it
could not read, harvest or republish the Glass, and correctly did not stamp a publish.*

⚠ **THIS SECTION IS BEING WRITTEN FOR THE SECOND TIME.** The first append was discarded, uncommitted,
by a peer session that cleared this file back to its template — **the same "a peer's operation
discarded the unstaged change on this shared tree" failure already recorded in `CTO-LEDGER.md` one
entry earlier, now hit twice in one evening in two different files.** The rule that file states is
right and needs to be louder: **on a tree three sessions write, an append that is not committed in
the same breath is an append that may not exist.**

**FOR HIS PAGE, in one line:** *You said "yes" to generating the sitemap's page list from the actual
pages. It's done — a page is in Google's list now because the page itself says so, not because
somebody remembered to type it in.*

**The part worth telling him, because it changes who decides.** Before, a human typed a page into
`sitemap.xml`. Now the page decides: if its `<head>` says it may be indexed and `robots.txt` does not
fence it, the generator invites it. **So a new page copied from `about.html` will be offered to
Google automatically the next time anyone regenerates.** That is his ruling working exactly as
asked — but it is a real change in who decides, and CEO 185 pointed out nobody had said it to him.

**What did NOT change: `sitemap.xml` is byte-identical.** Same three pages, same dates. Nothing
about what Google sees today moved.

**The CEO said PARTIAL and it was right** — it caught me claiming a stronger proof than I had, and
behind that a real bug: my own new gate would have sat green if someone put the old broken writer
straight back. Both fixed and re-proved against the real pre-change file. Its full verdict, in its
own words: `.planning/CEO-REVIEWS.md`, **CEO Review 185**.

**Filed for a later watch (`T-237`), found by that CEO:** when `npm test` fails, the sea trial report
prints the tail of the output instead of naming the gate that failed — so right now it blames the
wrong thing. Rule 24 stands on him opening that report and believing it.
