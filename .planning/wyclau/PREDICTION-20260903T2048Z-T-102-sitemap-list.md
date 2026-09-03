# PREDICTION — 2026-09-03T2048Z — `T-102` (Chart rank 3): derive the sitemap's page list

**The item, his words.** Question put to him: *"You asked me to recommend rather than build: should
the sitemap's page list be generated from the actual pages?"* — **his answer: `yes`**.

**His stated solution is the whole job** (Door step 3, solution-first): generate the list, do not
hand-keep it. So my first act is to build exactly that and measure it — not to investigate whether
it is worth doing.

---

## WHAT I EXPECT, AND WHY — written before I run anything

**1. The predicate that means "belongs in the sitemap" is already fully determined by work that
landed 83 minutes ago, and it is three-legged.** A page belongs iff it is (a) an HTML file GitHub
Pages will actually serve, (b) not `Disallow`ed by `robots.txt` under longest-match-wins, and (c)
carrying no `noindex` in its `<head>`.

*Why I believe this:* the 19:25Z watch's entire job was to make every non-public page declare itself
non-public — thirteen live pages got a head-level `noindex`, four folders got fenced in
`robots.txt`, and it verified the thirteen by reading `document.head` in a browser rather than by
grepping the file. That work is what makes a derivation possible at all; before it, "public" was
not written down anywhere.

**2. The derived set will be EXACTLY the three URLs already in `sitemap.xml`** — `/`,
`/about.html`, `/rules.html`. The Chart row itself says the hand-kept list "is correct today", and
`rules.html` has since been added by hand.

**3. `/classic/index.html` is the dangerous case and I expect the predicate to exclude it**, because
`sitemap_write.mjs`'s own comment states it is kept out by `noindex,follow` on the page itself.

## WHAT WOULD PROVE ME WRONG — the falsifiers, named before the result exists

- **On (2): if the derived set is not exactly those three**, my reasoning is wrong. A fourth page
  means my predicate is looser than the editorial judgement it is replacing; a missing page means it
  is tighter. **Either way the disagreement is the finding and I report the number, not the theory.**
  I must not quietly adjust the predicate until it reproduces the hand-kept list — that would make
  the derivation a very long way of writing down the list I already had, which is the exact fault
  `sitemap_lastmod_check.mjs`'s own header warns about ("if this gate held its own copy of the
  answer it could not fail when the answer changed").
- **On (3): if `/classic/index.html` has no `noindex` my parser can see**, the derivation will add
  the frozen v1 game to the sitemap — inviting Google to index it against the live game. **This is
  the one outcome here that could do real harm**, so I check it explicitly rather than trusting the
  comment in `sitemap_write.mjs` (rule 6b: a comment is not a measurement).
- **On (1): if `robots.txt` does not in fact fence what the 19:25Z ledger entry says it fences**,
  then leg (b) is resting on that entry rather than on the file, and I am repeating a claim instead
  of measuring one.

## WHAT HAPPENED IMMEDIATELY BEFORE (rule: widen the time horizon)

The 19:25Z watch changed the meaning of "public" on this tree 83 minutes ago — thirteen `noindex`
tags and four `robots.txt` fences. **So any measurement I take of the "before" state is a
measurement of a tree that is one watch old.** If the derived list disagrees with the hand-kept one,
the first suspect is not the predicate — it is that the hand-kept list has not caught up with that
watch's work. That is precisely the silent staleness his ruling is about, so it would be a finding
rather than an error.

## THE TRAP I AM MOST LIKELY TO FALL INTO

`sitemap.xml` is a **site-identity file** (rule 14). Both scripts here say so in bold, and the
failure mode is not a red gate — it is the live domain. **The generator must write exactly one file
at the repo root and nothing else**, and I must not "helpfully" teach it to emit a staging copy.

---

# THE RESULT — written after measuring, and this section is the half that keeps going missing

*Added at the close. CEO 185 found it absent, which is **CEO 180's finding 2 recurring verbatim**:
the prediction gets written properly and then never gets its verdict. The rule is not "write a
prediction", it is **"then say plainly which parts were wrong"**, and the second half has now been
skipped twice.*

| # | prediction | outcome |
|---|---|---|
| 1 | "public" = served ∧ declares a non-`noindex` robots intent ∧ not fenced, and that predicate is only definable because of work that landed 83 minutes ago | **RIGHT**, and `robots.txt` was read rather than taken from the previous watch's ledger, as falsifier 3 required |
| 2 | the derived set is exactly `/`, `/about.html`, `/rules.html` | **RIGHT** — 22 served pages, 3 public, 19 withheld, and the emitted file is byte-identical to the one on disk |
| 3 | `/classic/index.html` is excluded, and I check it rather than trust the comment | **RIGHT** — `classic/index.html:15` carries `noindex, follow`. The frozen v1 was never at risk |

**THE FALSIFIER I NAMED FOR PREDICTION 2 WAS THE IMPORTANT ONE AND IT DID NOT FIRE** — the derived
set matched the hand-kept list, so I was never tempted to tune the predicate until it reproduced the
answer I already had. Worth recording that it did not fire, rather than quietly dropping it.

## ⛔ WHAT I DID NOT PREDICT, AND IT IS WHERE BOTH REAL FAULTS WERE

**The pattern this project keeps finding held again: everything I wrote a prediction for was fine,
and both defects were in things I never predicted.**

1. **I did not predict that the DETECTION half was already built.** `crawl_intent_check.mjs` — from
   a different watch, for a different job under the same handle — already fails the build on a
   served page that declares itself indexable and is missing from the sitemap. So his ruling was
   half-satisfied before I started, and only GENERATION was outstanding. I found that by reading,
   not by predicting, and it materially changed what the item was.
2. **I did not predict that my own red-proof would be weaker than it looked** — and this is the one
   that mattered. I added the `--sitemap=` seam to the writer *before* going red, then described the
   result as red "on the real unmodified writer". It was not: the pre-ruling writer had no parser
   for that flag and would have passed. **CEO 185 caught both that false sentence and its sharper
   consequence — clause 1 could not fail against any real writer, so a full REVERT of the fix would
   have been blessed by the gate built to forbid it.** Clause 1 is now a claim about the writer's
   source, proved against the real pre-change file. **A seam added to make a red possible is a
   modification, and calling it "unmodified" is how a weak proof passes for a strong one.**
3. **My first fixture asserted something false about the world** — it invited `/lab.html` because
   `robots.txt` fences it, and `/lab.html` is not in this repo at all. A fixture is a claim too.
