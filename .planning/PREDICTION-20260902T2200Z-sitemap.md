# PREDICTION — watch 2026-09-02T22:00Z (6:00 PM ET), `T-098` / `INBOX-20260902T190715Z`

**Written BEFORE the fix and before the gate, so it cannot be retrofitted.** His ask:
*"Remove changefreq and priority. Add lastmod to both entries. DERIVE the dates, do not hand-type
them."* Gear, in his own words: COSMETIC.

## WHAT HAPPENED IMMEDIATELY BEFORE (rule: widen the time horizon)

Nothing did, and that is the finding. `sitemap.xml` has two entries and has not been touched since
it was written; the pages it points at have moved underneath it repeatedly. **A hand-written
sitemap does not rot loudly — it rots by standing still while the site moves**, which is exactly
why he asked for the date to be derived rather than typed.

## WHAT I EXPECT

1. **`sitemap.xml` today**: two `<url>` entries, both carrying `<changefreq>` and `<priority>`,
   neither carrying `<lastmod>`. *(Read before writing this: confirmed — lines 5-6 and 10-11.)*
2. **No instrument anywhere asserts anything about this file's contents.** `grep -rl sitemap
   scripts/ package.json` returns `deploy-staging.sh` only, and that is an rsync exclusion, not a
   check. So a one-off hand-edit today would satisfy his sentence and be stale again the next time
   `index.html` is committed — **which is this branch, most days.**
3. **The derivation he named is exact and needs no interpretation.** `git log -1 --format=%cs`
   already prints the `YYYY-MM-DD` form the sitemap spec's W3C-date profile wants, so there is no
   date formatting to invent. Today it reads `2026-09-01` for `index.html` and `2026-09-02` for
   `about.html` — two *different* dates, which is the useful case: a single "today" for both would
   have hidden a wrong answer.
4. **The right shape is a generator plus a gate, not an edit.** House style in this repo is that
   every guard DERIVES its answer rather than reading a list somebody typed. The gate should fail
   when the file disagrees with git, not merely when the tags are present.
5. **`npm test` will need its declared gate count raised by one** (`gate_count_check`), and the
   sweep will be `npm test` plus reading the rendered XML — no sea trial, because `src/` and
   `index.html` are untouched.

## WHAT WOULD PROVE ME WRONG

- **If a gate already asserts sitemap content**, prediction 2 is wrong and the work is smaller than
  I think — I would extend that gate rather than write one.
- **If `about.html` is not the file the second `<loc>` resolves to** (a redirect, a directory
  index), the mapping from URL to repo path is a guess and the derived date is the wrong file's
  date. *Checked: `about.html` exists at the repo root.*
- **If `git log -1 --format=%cs` returns empty for either page** — a file added but never committed
  — the generator must refuse rather than write a blank or a "today". I expect it does not happen
  here, and the generator must still handle it, because a sitemap that quietly claims today is
  worse than one with no `lastmod` at all.
- **If the gate stays green when I put a wrong date in the file by hand**, it is measuring its own
  regeneration rather than the file on disk, and it is worthless. That is the red-proof, and it is
  the one that matters: the fault this project keeps having is a check that cannot fail.
