# Git, deploying, and the files that can take the live game down

The rules themselves are stated in `.claude/CLAUDE.md` §3 and §4 — short, and load-bearing enough to
live in the file every session reads. **This document is the other half: what each rule cost when it
was broken, and the detail that does not need to be in front of you every session.**

If you are here because a rule in CLAUDE.md pointed you here, read only the section it named.

---

## 1. Site-identity files never leave this repo

**The rule:** `CNAME`, `robots.txt` and `sitemap.xml` never get copied to any other repo, gist,
artifact, bucket or deploy target. Deploy to the preview site with `scripts/deploy-preview.sh` only.
Never hand-roll the sync.

### Why CNAME is not a style preference

`CNAME` contains `playpastrypirates.com`. **GitHub Pages reads that file as a *claim* on the
domain**, so a second repo containing it does not fail safe — GitHub unsets the domain on one of
them and **the live game goes down for real players**, with DNS propagation and certificate
re-issue standing between you and recovery.

### It has nearly happened twice

Two separate Claude sessions came within one command of doing this. Both were writing their own
`rsync`/`cp` to publish a preview build. **That is the pattern to distrust:** the preview repo *is*
a copy of this one, so "copy everything across" feels obviously correct, and `CNAME` is a 21-byte
file nobody notices in a 130-file diff.

`scripts/deploy-preview.sh` excludes it and re-checks the checkout before pushing, **because the
part that failed twice was the judgement of whoever ran the command** — so the protection cannot
live in judgement.

### CNAME is not the only one

`robots.txt` and `sitemap.xml` are the same hazard in different clothes. Each asserts *"this
deployment is playpastrypirates.com"*, which is false anywhere else and harmful.

The very first run of the deploy script proved it: it republished this repo's live `robots.txt`
(`Allow: /`) over the preview's `Disallow: /`, and added a sitemap of live URLs — which would have
invited Google to index the preview as duplicate content competing against the real game. Caught
only by reading the deploy diff.

All three are excluded now. **When you add a file that identifies the live site, add it to
`EXCLUDES` in the same commit.**

If you are ever copying this repo wholesale anywhere, stop and either use the script or write down
explicitly why the destination cannot contest the domain.

---

## 2. Always fetch before you read git state

**The rule:** `git fetch origin` before you read, compare, or conclude anything about a branch. Not
once per task — once per time you are about to trust what git tells you.

Both `main` and `origin/main` are **local caches**. `origin/main` is not the remote; it is this
machine's last-downloaded snapshot of it, and it is stale until you fetch.

### What it cost

On 2026-08-02 the local `main` ref was parked at a v1.0 snapshot — **457 commits behind, with no
`src/` directory at all** — because nobody had pulled after merging on GitHub. Reading it produced a
confident and completely wrong conclusion ("main is a dead v1.0 snapshot; ignore it"), which was
then handed to **four parallel sessions as instructions**. GitHub was healthy the entire time. Only
the local copy was frozen.

### Tells that you are reading a stale ref

Stop and fetch before concluding, if you see any of these:

- A diff against the base is absurdly large (hundreds of commits).
- `src/` appears as *newly added* — it has existed since the v1.1 refactor.
- A milestone you know shipped looks unfinished or absent.
- A branch appears wildly behind for no reason anyone can explain.

**Never report git state from memory or from earlier in the session.** Re-run the command. Refs
move — including because of something you did yourself.

### The second-order version: a stale checkout serves stale RULES

**A session's context copy of `.claude/CLAUDE.md` is assembled from the working tree before that
session's first `git pull`.** So a behind checkout does not merely give you stale code — it gives you
an **old rulebook**, and nothing signals it. A shorter file has no gaps in it; it just looks complete.

Measured on 2026-08-18: a session opened with local `main` **171 commits behind**. Its context held
the CLAUDE.md from `a418cb3` (2026-08-01) — **457 lines**, missing eight sections added during the
`/4` era, including "ask with the question UI", "nothing is a constant", "read the graveyard" and the
whole `/4` deploy loop. Every section it *did* have was added 2026-08-02 or earlier; every section it
lacked was added 2026-08-05 or later. A clean cut at the stale ref, not a truncation.

It surfaced only because a research agent independently diffed the on-disk file against what the
session had been given. **Do not rely on that happening.** After the first pull:

```bash
git diff --stat HEAD@{1} HEAD -- .claude/CLAUDE.md docs/
```

If anything moved, re-read it from disk before trusting your own copy.

---

## 3. Keep local main and origin/main in sync

Wyatt, 2026-08-02: *"we are going to pull origin main back down into local main after every merge so
that we can keep our local main synced."* Restated the same day as a standing rule: **always keep
main in sync with origin/main.**

### Three moments, not one

The original rule said "after every merge". That was too narrow once worktrees were retired and
commits began landing directly on `main`:

1. **At the start of any session that will read or write `main`** — fetch before you trust any ref,
   then pull if behind.
2. **Immediately after anything that changes `main`** — a merge, a direct commit, a push. Not "at
   the end."
3. **Before reporting project status.** `.planning/` lives in the repo, so an out-of-date checkout
   reports an out-of-date project.

### The work is not finished when the push succeeds

```bash
git push origin main && git pull origin main
```

Then confirm both directions are zero before saying it is done:

```bash
git rev-list --count origin/main..main   # 0
git rev-list --count main..origin/main   # 0
```

This is the same wound as §2. A merge landed through the GitHub UI does not update this clone.
Pulling immediately means the stale ref never exists, rather than being something you have to
remember to distrust later.

---

## 4. Work in the main checkout — worktrees are retired

**The only working directory is `/Users/wyattroy/Documents/Projects/pastrypirates`.** Wyatt retired
worktrees on 2026-08-02; ten stale ones were removed that day. Do not create new ones, and do not
assume the directory you woke up in is the main checkout.

### Why this is not merely tidiness

**`.planning/` is a tracked directory, so it is branch-scoped.** A worktree sitting on a stale
branch shows that branch's frozen snapshot of `STATE.md`, `ROADMAP.md` and every workstream file —
with no error and no warning. It simply reports an older project.

On 2026-08-02 a `/gsd-progress` run inside `.claude/worktrees/gsd-skill-persistence-3252ba` reported
v1.3 as **"0 of 5 phases, nothing started."** The truth on `main` was four of five phases shipped and
live. Wyatt believed he was in the main checkout and was handed a confident, entirely wrong status
report — the same failure mode as §2, one level further out.

**Before reading any `.planning/` file or answering "where are we":**

```bash
cd /Users/wyattroy/Documents/Projects/pastrypirates && git rev-parse --show-toplevel
```

**The tell that you got this wrong:** a workstream `STATE.md` reading "Not started" for work you know
shipped.

---

## 5. How the work reaches Wyatt's phone

Wyatt, 2026-08-14: *"The design we have been using is that playpastrypirates.com continues serving
its normal version; but playpastrypirates.com/4 is serving the version that we are working on."*

He asked for this to be written down so he never has to explain it to a new session again.

### The shape of it

`playpastrypirates.com` is GitHub Pages serving **`main`, from the repo root, with no build step and
no deploy workflow.** What is on `main` *is* what is live — there is nothing in between.

| URL | Served from | What it is |
|---|---|---|
| `playpastrypirates.com` | repo root (`index.html`) | the finished game real players play |
| `playpastrypirates.com/4` | `4/` | **the milestone under development** — what Wyatt playtests |

> **This table changes at v2.0's cutover (Phase 6).** `4/` becomes the root and today's root game
> moves to `/classic`. Update this section in the same commit that performs the cutover.

**So pushing the work-in-progress build to `main` is the normal thing to do, not a release.** It is
how he gets to play it at all: he is on a phone, and `/4` on the live domain is his only way in.
Merging does not touch the root game, because the root game is different files. Do not treat a merge
to `main` as a scary outward-facing act requiring ceremony — **treat the *diff* as the thing to
check.**

### The loop, every time

1. Develop and commit on the session's designated branch.
2. **Bump the build stamp** — `PP4_STAMP` in `4/src/ui/stage.js`, shown in the hamburger menu as
   `v4 · build 2026-08-13g`. It is how he tells at a glance whether he is looking at your work.
3. **Prove the merge touches only the milestone.** Run this and read it — empty output is the
   licence to push:
   ```bash
   git diff --name-only origin/main..HEAD -- ':(exclude)4/' ':(exclude)scripts/' ':(exclude)docs/' ':(exclude).claude/' ':(exclude).planning/'
   ```
   Anything printed there changes the live game real players are in the middle of. Stop and ask.
   `CNAME`, `robots.txt` and `sitemap.xml` must never appear — see §1.
4. Fast-forward, push, pull, and verify both directions are zero (§3).
5. Go back to the working branch. Tell him the build stamp to look for, and that Pages takes a
   minute or two.

### The tell that a session skipped this

**He reports an old build stamp.** On 2026-08-14 he sent a screenshot of `build 2026-08-13a` and said
he could not see `13g` even in an incognito window — and he was completely right. Fourteen commits of
playtest fixes were sitting on a branch nobody had merged, so `/4` was still serving a build from
before the session started. He had spent the morning testing work that was never deployed.

**It was not a cache. Nothing is ever a cache here, because there is no build step.** If he cannot
see it, it is not on `main`.

---

## 6. Absolute paths, always — the two-trees hazard

The Bash tool's working directory resets, and announces it at the bottom of unrelated output.

**The repo contains more than one tree with an identical internal layout.** During the v2 era that
was `v2/`, `v2bakeoff/`, `3/` and `4/` all mirroring the root's `src/ui/util.js` shape; after the
cutover it will be the root and `/classic`. Either way, a relative path like `src/ui/util.js`
resolves in **both** trees — so a mis-rooted edit opens a real file, applies cleanly, passes
`node --check`, and modifies the wrong copy. **Every safety signal reports success.**

Run the constraint as a command after each batch of edits, naming whichever tree you are *not*
supposed to be touching:

```bash
git diff --name-only | grep -v '^4/'   # must print NOTHING when working in 4/
```

Full account: `docs/HARD-WON-LESSONS.md` §1.
