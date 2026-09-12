# PREDICTION — watch a6, 2026-09-03T04:45Z, `T-098` (his sitemap ask)

*Written BEFORE the close gate is run, before a CEO is spawned, and before the sweep. Rule: name
what would prove me wrong, in the same note.*

## What I claim, and what I have already measured

**MEASURED (before this note):**
- `node scripts/qa/sitemap_lastmod_check.mjs` → **PASS**, 2 of 2 urls, no `changefreq`, no `priority`.
- `git log -1 --format=%cs -- index.html` → `2026-09-01`; `-- about.html` → `2026-09-02`. Both match
  the `<lastmod>` values in `sitemap.xml` exactly — his own two commands, his own two answers.
- `scripts/deploy-staging.sh:152-154` still excludes `CNAME`, `robots.txt`, `sitemap.xml`. Rule 14 holds.
- `.planning/wyclau/INBOX.md` INBOX-20260902T190715Z is already **DONE — CEO 122**, commit `a13c365`.
- CEO Review 122's heading names **`T-098`** (`.planning/CEO-REVIEWS.md:1491`).

**NOT YET MEASURED — this is the part the note is for.**

## Predictions

1. **`close_item.mjs` will REFUSE `--ceo=122`.** My reading of its header is that traceability is
   checked by looking for the item id or the closing commit *inside the review text*, and the
   `--item` I must pass is a substring of the Chart row's prose (*"Fix sitemap.xml at the repo
   root"*), not the handle `T-098`. If the gate greps the review for that prose it will not find it.
   - **Falsifier:** it accepts `--ceo=122` cleanly. Then the gate resolves the row to its handle
     before checking, and my model of it is wrong in a way worth writing down.
2. **The close will therefore run on a FRESH verdict, CEO 142**, spawned on this watch's actual
   judgement — *is closing this row honest, or is it a watch ticking a box it did not earn?*
3. **`chartkeeper --rank --sweep --write` will archive exactly ONE row** to `CHART-LOG.md`, and the
   header count will fall from **18 open rows** to **17**.
   - **Falsifier:** sweep reports *"0 finished row(s)"* after a successful close. That would mean
     the tick the gate writes and the tick the sweep looks for are not the same thing — which is a
     bigger finding than my item, and would go on the Chart, not into a quiet retry.
4. **`glass.mjs` will still not parse when I finish**, because the 159-line uncommitted edit to it
   belongs to a live peer session and I will not touch it. So this watch **cannot pulse the Glass**
   and its note goes to `GLASS-NOTE.md` instead, appended below the marker, never overwriting.
   - **Falsifier:** the peer commits a working file before I finish, and `node scripts/wyclau/glass.mjs`
     parses. Then I still do not run it — a peer's fresh commit is not my licence to publish over it.

## What would make this whole item wrong

**If `sitemap.xml`'s two dates were hand-typed and merely happen to be right today**, then the row
is not finished and closing it is a lie. I claim they are derived. The check that could catch me is
that `sitemap_lastmod_check.mjs` recomputes from `git log` and compares — it does not read the
generator's output, so it cannot be measuring its own regeneration. I have read the file to confirm
that dependency direction rather than taking the commit message's word for it.
