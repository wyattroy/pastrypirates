# PREDICTION — `admin-console-where`: his player-count console at `/stats.html`

Written **2026-09-03T09:05Z**, on Wy-Blade, watch d1, **before any measurement of the claim.**

**HIS RULING, VERBATIM** (Glass, `.planning/CHART.md:613` BLOCKED-ON-WYATT row):

> put it at /stats.html behind a simple curtain and block it from robots.txt

**HIS ORIGINAL ASK, VERBATIM** (`INBOX-20260902T214507Z`, Glass idea `i1788385507236`):

> Add google analytics to playpastrypirates.com and create a firebase admin console so I can see
> how many people are playing

**THE ACCEPTANCE TEST, IN HIS OWN SENTENCE, and the INBOX entry already names it:** *"so I can see
how many people are playing"* — **a number on a screen he can open.** Not an integration that is
technically present.

**SCOPE I AM TAKING:** the console half only. The INBOX entry sizes Google Analytics as a separate
item ("These are **not** one item") touching `index.html` and every public page with a third-party
script on the site real players are using. His ruling here is about the console; the analytics half
stays open.

---

## WHAT I EXPECT, AND WHY

**P1 — `classic/stats.html` already IS this page, for v1, and reads the same three nodes.**
`src/ui/usage.js:5` says in its own header: *"THREE RECORDS, ONE SHAPE, **read back by
`/stats.html`**"*, and names them — `visits/<ts>-<pid>`, `starts/<ts>-<pid>`, `fins/<gid>`. A file
called `stats.html` survives inside `classic/` and is `Disallow`ed in `robots.txt` alongside a
root `/stats.html` that does not exist. **So the reader was built, the writer still runs, and the
cutover left the reader behind in the frozen tree.** I expect to port, not to invent.
*Why this matters for the work:* rule 20 / rule 10 — the elegant version deletes code, and a page
somebody already debugged against this exact data shape beats a fresh one.

**⛔ F1, THE FALSIFIER:** if `classic/stats.html` does **not** read `visits/`, `starts/` and
`fins/` — if it reads v1-only paths, or reads `gamelogs/`, or is a per-game debug view rather than
a usage console — then my reasoning is wrong and the page has to be written fresh against the
three records in `usage.js`. **I will say so plainly rather than reframing a rewrite as a port.**

**P2 — the live database already holds real `visits`/`starts`/`fins` rows written by the CURRENT
game**, so the page shows real numbers the day it lands rather than an empty screen. `usage.js`
writes `USAGE_BUILD="v4"` by plain REST PUT on every boot and every voyage, guarded to
`playpastrypirates.com` only, and the current game is what is served there.

**⛔ F2:** if a REST GET of `visits.json` returns `null`, an empty object, or a permission denial,
then **P2 is wrong and so is the whole shape of this item** — the acceptance test cannot be met by
reading those nodes, and the fallback is `presence/` (live sockets, written by
`netMarkPresence`) plus `rooms/`, which count *now* rather than *ever*. That would be a different
page and I must tell him so rather than shipping a console that reads an empty node and says 0.

**P3 — a "simple curtain" is not defined anywhere in this repo and `classic/stats.html` probably
has none.** I expect to have to choose the mechanism, and mechanism is mine (rule 1) while *how
much is enough* is his. I expect the honest answer to be a shared secret in the URL or a typed
word held in `localStorage` — **not authentication**, because there is no build step, no server,
and the Firebase data is already world-readable to anyone who opens devtools on the game.

**⛔ F3:** if `classic/stats.html` already carries a curtain, I use that one and P3 is wrong.

**P4 — no `robots.txt` change is needed.** *(This one is NOT a prediction — it is already
MEASURED, this watch, by reading the file: `robots.txt` line 12 is `Disallow: /stats.html`, and it
has been there since before his ruling.)* I record it here so it cannot later be reported as work
this watch did. **Half of his ruling was already true when he gave it.**

**P5 — this is game-tree code and `gear.mjs` will say so.** A new page at the repo root is served
to real players immediately (§6 of the rules). I expect a gear above COSMETIC.

**⛔ F5:** if `gear.mjs` reports COSMETIC or NONE for a brand-new root page, **the gear picker is
wrong and that is a finding**, not a licence to skip the trial.

---

## WHAT WOULD MAKE ME STOP AND ASK HIM RATHER THAN BUILD

- If the data cannot answer *"how many people are playing"* without a design choice he has not
  made — e.g. if `visits` and `starts` exist but nothing distinguishes a player from a probe.
- If the curtain question turns out to be a taste call with real consequences (a secret in a URL
  he might paste into a screenshot). Recommend, don't guess.

---

# THE RESULT — written after measuring, 2026-09-03T09:5xZ

**P1 — RIGHT, and it was the whole shape of the item.** `classic/stats.html` is 159 lines and
reads `visits`, `starts`, `fins` and `gamelogs` exactly as `usage.js:5` says. **And more than I
predicted: it is LIVE.** `https://playpastrypirates.com/classic/stats.html` → **200**, while
`/stats.html` → **404**. His console has existed at a URL nobody told him about since the cutover.
F1 did not fire.

**P2 — RIGHT, and the numbers are larger than "some data".** Measured off the live database:
**237 page boots from 123 distinct browsers in fourteen days, 44 voyages started, 8 finished, 289
finished-game logs.** All HTTP 200, no permission denial. F2 did not fire.

**P3 — RIGHT.** No curtain in `classic/stats.html`; only `noindex` + robots.txt. I chose the
mechanism: a word, SHA-256'd into the page, remembered per browser. F3 did not fire.

**P4 — CONFIRMED AS ALREADY TRUE, and it was recorded here before the work precisely so it could
not be claimed as work.** `robots.txt:11` has carried `Disallow: /stats.html` since the
2026-08-26 cutover commit `fb74eedc`. **Half of his ruling was satisfied before he gave it.**

**⚠ P5 — WRONG, AND ITS FALSIFIER F5 FIRED. This is the finding worth more than the page.**
I predicted `gear.mjs` would call a new root page game code. It said **FULL**, and I nearly took
that as agreement — but its stated reason is **`package.json` alone**. `gear.mjs:36-37` reads
tracked changes, so **it never saw `stats.html` at all**. Had I not raised the gate ceiling in the
same pass, a brand-new page served to real players at the root of the live domain would have
scored **NONE**. Caught by CEO 159 pulling on F5's own thread. **Filed as its own Chart row; not
fixed here, because a change to what counts as game code is not a drive-by.**

## WHAT I GOT WRONG THAT NO PREDICTION COVERED — three, all found by other people's eyes

1. **The curtain's word was in the repo.** The hash helper I wrote carried
   `process.argv[2] || "sugarfish"` — the live word, in the clear, in a public repo, in a file
   the page itself pointed the reader at. CEO 159 found it in one grep. The word is changed, the
   default is gone, and `curtain_hash.mjs` now refuses to run without an argument.
2. **Clause D of my own gate was half theatre.** It captured the literal string `gamelogs` inside
   the regex that its own header claimed derived every name — and `presence`, which feeds the
   biggest number on his page, was covered by nothing. Both regexes are generic now, with a named
   EXEMPT list, and `--red=renamed-presence` proves the new half bites.
3. **One of my four red-proofs never checked that it bit.** `--red=absent` on a tree with no page
   proves a check fails on a world it was already failing on. It refuses now.

**The pattern, and it is the one the Door warns about:** every claim I wrote a prediction for
held. **Every fault in this pass is in something I did not predict** — the helper's default, my
own gate's derivation, my own red-proof's bite. A prediction protects what it points at and
nothing else.
