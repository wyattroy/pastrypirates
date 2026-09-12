> # ⛔ CANCELLED BY HIM, 2026-09-02 10:42 PM ET
>
> **His words, verbatim:** *"We're NOT doing the firebase rebuild. remove that from your list."*
>
> **This scope is kept as the record of a decision made and unmade, not as work.** Nothing in it is
> scheduled. Do not build from it, and do not re-propose it without him raising it first.
>
> ⚠ **THE PROBLEMS IT WAS ANSWERING DID NOT GO AWAY WITH IT** — the 200/day publish ceiling, the
> record-fixed-but-page-stale gap (four times in one day), and an unattended watch being unable to
> publish at all. **They are live and now have no plan.** He also dismissed `T-105` and `T-025` in the
> same quarter hour, which were the other two answers to the same ground.

---

# SPEC — THE GLASS ON FIREBASE, SERVED FROM THE STAGING REPO

*Scope only. Nothing is built. Written by the Advisor 2026-09-02, 7:55 PM ET, at his direct
instruction. **A fresh CEO is reviewing it; this line will carry the verdict number when one exists
and does not yet.***

> **HIS INSTRUCTION, VERBATIM:**
>
> *"i want you to redesign the Glass to run off firebase instead -- there is too much bullshit
> involved with all these limitations. We can host it on github pages in the staging repo. scope
> this and get ceo's eyes on it"*

---

## 1. THE LIMITATION HE IS TALKING ABOUT, MEASURED TODAY

He said this **eight minutes after** his page could not be updated at all: the Artifact tool returned
**`429 — daily publish limit reached (200), resets at UTC midnight`**. His answer to a question sat
correct in the record from 7:43:48 PM and could not reach his screen until 8:00 PM.

**And the cause is the cure eating itself.** Every fix today was delivered by republishing the page.
Every "please republish" — from ticks, from watches, from me, at least four in the last hour — spent
one of 200. **The mechanism that keeps his page current is what exhausted the quota that then could
not update his page.**

**THE OTHER LIMITATIONS, ALL OF THEM MEASURED TODAY, NOT LISTED FOR EFFECT:**

| what bit him | why it exists |
|---|---|
| **200 publishes/day, hard stop** | the page is a *document that must be re-uploaded* to change |
| **The record can be fixed while his page still shows the old state** — four times today | two artefacts, updated by two different acts |
| **A republish can destroy what he typed** — the whole harvest apparatus | his writing and the page's content live in ONE document that gets regenerated |
| **A Bell-started watch cannot publish** — no Artifact tool **on some machines** (the Door's own hedge, `SKILL.md:76`) | publishing needs a tool only interactive sessions have |
| **Answered questions kept re-appearing, six times** | his answer and the question live in different places, joined by a session remembering |

> ⚠ **THE FOURTH ROW BORROWED ITS CERTAINTY, AND THE HEADING ABOVE CLAIMS EVERYTHING HERE WAS MEASURED TODAY.** The first draft wrote it as a flat universal. **The Door hedges that exact claim** — *"on some machines"* (`SKILL.md:76`) — and warns at `:142-143` that this very assertion was once *"inherited, repeated, and never tested. Only the Artifact half was ever measured."* Corrected in place by CEO 126's finding rather than quietly softened. **Four of the five are cleanly measured; this one was not, and the heading is what made it a finding.**

**FIVE SEPARATE FAULTS, ONE ROOT: the page is a document, so every change is a re-upload, and his
words and ours share the same file.** Firebase replaces the document with a *store*, and four of the
five stop being possible rather than being fixed.

## 2. WHAT THIS BUYS — stated as what he would notice

1. **No publish ceiling, because there are no publishes.** State changes; the page reads it.
2. **His page stops being stale by construction.** A live subscription means "the record is fixed"
   and "his page shows it" become **one event**. That single change retires the fault that hit him
   four times today.
3. **His writing cannot be overwritten by us regenerating anything** — he writes to his own node; we
   never rewrite that node.
4. **A watch can read his rulings without an Artifact tool.** Firebase RTDB answers a plain HTTPS
   GET, so an unattended watch can harvest — **today it cannot, and that is why a human-started
   session has been the only harvester all day.**
5. **The retirement problem mostly dissolves.** A question's state (asked / answered / retired) is
   one field in one place instead of a row in a markdown table joined to a key in a document.

## 3. ⚠ WHAT IT COSTS — and the first one is genuinely his to decide

### THE BIG ONE: THE ARTIFACT IS PRIVATE. GITHUB PAGES IS PUBLIC.

**The Glass today is private to his account.** `staging.playpastrypirates.com` is a **public
website** — served by GitHub Pages out of `wyattroy/pastrypirates-staging`, measured at
`scripts/deploy-staging.sh:35`.

**So the Chart, his rulings, his instructions, the ledger summaries and every question we put to him
become world-readable at a guessable URL** unless something prevents it. None of it is secret; all
of it is his private working record, and it names unreleased plans.

**Three ways to handle it, and this is a question for him, not a decision for us:**
- **(a)** accept it — it is a status page, not credentials;
- **(b)** his own phrase from an hour ago: *"behind a simple curtain"* — an obscure path plus a
  shared passphrase held in the page, keeping honest strangers out;
- **(c)** real auth — Firebase Anonymous or Google sign-in, rules keyed to his uid.
**(c) is the only one that actually protects the DATA**, because whatever the page can read, anyone
who reads the page's source can read too.

### ⚠ AND THE RULES THAT WOULD ENFORCE ANY OF THAT ARE NOT IN THIS REPO

**Measured:** there is no `database.rules.json`, no `firebase.json`, no `.firebaserc` anywhere in the
tree. **The game's Firebase security rules exist only in the Firebase console.** So today they cannot
be reviewed in a diff, cannot be gated by `npm test`, and no session can tell whether a rule change
broke them.

**This is not a side note — it is the load-bearing risk of the whole move.** A public page plus a
public config is safe *only* because of rules nobody here can see. **Bringing the rules into the repo
is part of this job, not a follow-up.**

> ✅ **CORRECTION, AND IT IS GOOD NEWS THE FIRST DRAFT GOT WRONG.** It also claimed *"no session can
> tell whether a rule change broke them."* **False, and cheaply so** — CEO 126 found it and this
> machine reproduced it with two unauthenticated `curl` calls, no browser, no console:
>
> - `…/.json?shallow=true` → `{"error":"Permission denied"}` — **root is closed.**
> - `…/rooms.json?shallow=true` → **the live room list, in full, with no credentials.**
>
> **So the EFFECT of the rules is observable from here today**, which makes the rules work far more
> tractable than the draft said: **a gate asking the database what it hands a stranger can ship this
> week, without exporting anything from the console.** Reviewing rules in a diff still needs them in
> the repo; *testing* them does not.
>
> ⚠ **AND THE SAME PROBE FOUND SOMETHING OUTSIDE THIS ASK: every room code in the live game is
> world-readable right now.** Not a consequence of this move and not for this spec to fix —
> **raised to him separately rather than buried in a document about something else.**

### THE GAME AND THE GLASS WOULD SHARE ONE FIREBASE PROJECT

`pastry-pirates`, the same RTDB the live multiplayer game uses (`databaseURL:
https://pastry-pirates-default-rtdb.firebaseio.com`, from the client config in the game).
**A bad rule written for the Glass is a bad rule over the game's rooms.** Namespace the Glass under
its own top-level key and write rules that name it explicitly; never widen a rule at the root.

### ONE CEILING TRADED FOR ANOTHER — say it plainly rather than sell the move

Firebase's free tier has its own limits (simultaneous connections, GB/month egress). They are far
away for a one-reader status page and **they are not zero.** *"No limits"* is the wrong claim;
*"limits that a page for one person will not reach"* is the right one.

### ⛔ BLOCKER — THE STAGING DEPLOY WOULD **DELETE** THE GLASS, AND THE CURRENT FILE CANNOT BE DEPLOYED AT ALL

> **THE FIRST DRAFT MISSED THIS ENTIRELY. Found by CEO 126, reproduced here before being written
> down.** It said only *"adding the Glass must not touch that machinery"* — gesturing at the right
> file without opening it. **It is a `grep` for `--delete` away, and it changes the build.**

`scripts/deploy-staging.sh:195`:

```
MSYS_NO_PATHCONV=1 rsync -a --delete "${EXCLUDES[@]}" ".../$SRC/" ".../staging/"
```

**`--delete`.** Every `npm run deploy:staging` **wipes anything in the staging repo that is not in
the source tree and not in `EXCLUDES`.** Two consequences:

1. **A Glass placed in the staging repo is destroyed by the next game deploy** — silently, and the
   person who finds out is Wyatt, when his page 404s.
2. **The current file cannot be deployed at all.** `glass.html` lives at
   `.planning/wyclau/glass.html` and `--exclude=.planning/` is `deploy-staging.sh:157`. So it must
   move into the game's source tree, **or** `EXCLUDES` must gain an entry — and `EXCLUDES` is the
   exact machinery the rule-14 paragraph below says must not be disturbed.

**DECIDE WHERE THE PAGE FILE LIVES BEFORE DRAWING THE SCHEMA.** This is not a caveat to handle
later; it determines whether the staging repo is the right host at all (see §3's fourth option).

### RULE 14 — SITE-IDENTITY FILES

The staging repo already exists and `deploy-staging.sh` carries hard-won guards against copying
`CNAME` / `robots.txt` / `sitemap.xml` into it. **Adding the Glass must not touch that machinery.**
Two sessions have nearly taken the live domain down this way.

## 4. THE SHAPE — two builds, and the smaller one may be enough

**BOTH keep his writing in Firebase; they differ in where the CHART comes from.**

**OPTION A — everything live.** Sessions push chart state to Firebase; the page subscribes.
Nothing is ever republished or deployed to change what he sees. **Retires every fault in §1.**
Costs: sessions gain a Firebase write path, and the rules must cover a node we write and he reads.

**OPTION B — static page, live inbox.** The page ships to Pages as a normal static file and reads
`chart.json` from the same repo; **only his ideas and rulings go to Firebase.** Much less to build,
no session-side Firebase writes. **But the chart half still updates only when something deploys** —
so the "record fixed, page stale" fault survives in a smaller form.

**RECOMMENDATION: A.** His sentence is about *limitations*, and B leaves the staleness limitation
standing. **But B is a real fallback if the rules work turns out to be big**, and it is worth having
priced rather than discovered halfway.

## 5. SIZING, HONESTLY

**This is not one watch.** Roughly: the Firebase schema and rules (with rules committed to the repo
and gated); the page rewritten to read/subscribe instead of being generated; `glass.mjs` changed from
"emit a document" to "write state"; the harvest replaced by a plain HTTPS read; a deploy path into
the staging repo that does not disturb the CNAME guards; and a cutover that runs both surfaces until
the new one is proven. **Several sessions, and the auth decision blocks the schema.**

**DO NOT CUT OVER BLIND.** Run the Firebase Glass beside the Artifact one until he has used it and
said it is better. **The Artifact Glass is how he sees everything today; a broken replacement is a
day of blindness, not an inconvenience.**

## 6. WHAT WOULD PROVE THIS WRONG

1. **If the DB rules cannot be exported into the repo** (console-only, no CLI available here), then
   the central safety claim of §3 is unbuildable and the honest answer is B plus a curtain. **Check
   before designing the schema.**
2. ✅ **STRUCK — THIS WAS NEVER OPEN, AND LISTING IT WOULD HAVE SPENT A BUILDER'S FIRST HOUR.** It asked
   whether Pages can serve a sub-path in the staging repo. `deploy-staging.sh:322` curls
   `https://staging.playpastrypirates.com/src/ui/stage.js` **on every deploy** — sub-paths plainly
   serve. Found by CEO 126. **Replaced by the real one: can anything survive `rsync --delete`?**
   — see the blocker in §3, which is the question that actually decides the host.
3. **If his private working record being world-readable is unacceptable to him**, (c) becomes
   mandatory and the sizing above roughly doubles. **That is his call and it gates everything.**
