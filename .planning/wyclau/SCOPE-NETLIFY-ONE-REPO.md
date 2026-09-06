# SCOPE — Netlify: one repo, two environments, and a private repo

**His ask, 2026-09-06, verbatim:** *"scope out using netlify to push staging and production from
one repo (pastrypirates) so that we can move away from publishing through githubpages and make the
repo private"*

**Verdict up front: it works, it is the right shape, and it is smaller than it looks — but it is
gated on one number he has to choose (a plan), and one act only he can perform (DNS at
Squarespace).** Everything below was measured on 2026-09-06, not assumed. Nothing has been changed.

---

## 1. WHY THIS IS FORCED, NOT OPTIONAL

**Making the repo private BREAKS GitHub Pages.** Pages will not serve a private repository on a free
GitHub account — the site goes dark. So "make the repo private" and "stay on GitHub Pages" are not
both available. A host move is the price of privacy, and it is the whole reason this scope exists.

**Two things were measured that make the move worth doing on its own merits:**

| what | measured |
|---|---|
| `playpastrypirates.com/art-review/coin/coin-heads-new.png` | **HTTP 200, 5.5 MB** — his art review folder is on the public internet |
| `playpastrypirates.com/scripts/deploy-staging.sh` | **HTTP 200** — the whole `scripts/` folder is public |
| `playpastrypirates.com/.planning/CHART.md` | 404 — the planning folder is NOT served (Jekyll hides dot-folders) |

**Today's site publishes 519 MB of art-review PSDs and 9.9 MB of QA scripts to anyone who asks.**
That is not a leak of anything dangerous, but it is not the game either, and it goes away for free
in this move.

---

## 2. THE SHAPE — one repo, two Netlify sites

```
wyattroy/pastrypirates          <- ONE repo. The only repo. Goes private.
   |-- branch  main      ->  Netlify site "pastrypirates"          ->  playpastrypirates.com
   +-- branch  staging   ->  Netlify site "pastrypirates-staging"  ->  staging.playpastrypirates.com
```

**`wyattroy/pastrypirates-staging` is DELETED.** With it goes:

- **Rule 14 in its entirety** — the CNAME hazard. There is no second repo to contest the domain,
  and `CNAME` is deleted from the tree (Netlify holds domain configuration in its own dashboard, not
  in a file). The rule that nearly took the live game down twice stops being possible rather than
  being remembered.
- **`robots.txt` / `sitemap.xml` as hazards.** They become one file each, swapped at publish time by
  environment.
- **`scripts/deploy-staging.sh`'s 260 lines** of rsync, excludes, CNAME guards, Windows path
  rewriting and cross-platform `sed`. All of it exists to make a COPY safe. There is no copy.
- **The confusion the `staging-is-not-main.cjs` hook was written for.** With staging as a branch of
  this repo, `git merge-base --is-ancestor HEAD origin/staging` finally answers the question he was
  actually asking. Ancestry becomes a real instrument instead of a wrong one.

**Why two Netlify sites rather than one site with branch deploys:** a branch deploy can only be
served at `staging.playpastrypirates.com` if the whole domain's nameservers are delegated to Netlify
(Netlify's branch-subdomain feature requires Netlify DNS). Two sites need only a CNAME record, which
is exactly what exists today. See decision 1.

---

## 3. WHAT HAS TO BE BUILT — six items, honestly sized

The game is **222 files, 7.9 MB**. The repo working tree is **3,355 tracked files, ~1.3 GB**.
Netlify uploads whatever the publish directory contains, so something has to separate the two.

| # | item | size |
|---|---|---|
| 1 | `netlify.toml` + `scripts/build-site.mjs` — assemble the 222-file game set into `_site/`, stamp the build, swap `robots.txt` by context | half a day |
| 2 | Retire `scripts/deploy-staging.sh` and its gate `deploy_rsync_paths_check.mjs`; drop the gate ceiling 141 -> 140 in `package.json` | 1 hour |
| 3 | Rewrite `scripts/where_is_my_work.mjs` — with one repo, git ancestry works for both environments; keep the stamp curls | 1 hour |
| 4 | Rewrite `.claude/hooks/staging-is-not-main.cjs` — its premise inverts; it gets much smaller | 1 hour |
| 5 | Rewrite `docs/GIT-AND-DEPLOY.md` sections 1 and 5, `.claude/CLAUDE.md` section 3 rule 14 and section 6, `.claude/hooks/cto-staging-only.cjs` | half a day |
| 6 | Cutover: Netlify sites, DNS, certificates, verification, then flip the repo private | 2 hours + waiting |

**Roughly two working days, and none of it touches the game.** `src/`, `index.html` and every asset
are byte-identical afterwards.

### What is NOT affected — checked, not assumed

- **`src/shared/host.js`** — the hostnames do not change, so the live-host / dev-host lists are
  untouched, and analytics, usage pings and dev flags all keep working. Verified by reading the file.
- **Firebase** — the game uses the Realtime Database only (no Auth sign-in calls). The RTDB has no
  origin allowlist, and the hostname is unchanged regardless.
- **`playpastrypirates.com/classic`** — a plain directory with its own `index.html`; Netlify serves
  it identically.
- **The build stamp** gets BETTER. Today `deploy-staging.sh` rewrites `PP4_STAMP` with `sed` on a
  copied tree. Netlify hands the build `$CONTEXT`, `$BRANCH` and `$COMMIT_REF` as environment
  variables, so the stamp is derived rather than string-substituted.

### One Netlify default to switch OFF on day one

**Pretty URLs is on by default and rewrites `/rules.html` to `/rules` with a redirect.** This project
has gates (`rules_page_check.mjs`, `credits_page_check.mjs`) that assert canonical URLs and
`sitemap.xml` coverage against the `.html` names. Left on, it silently creates two live URLs for
every page. Turn it off in site settings before the first public deploy.

---

## 4. WHAT IT COSTS — his real traffic, measured

Read from his own usage database (`pastry-pirates-default-rtdb.firebaseio.com/visits`, which only
counts the live hosts):

| window | visits |
|---|---|
| last 24 hours | 4 |
| last 7 days | 57 |
| since 2026-08-21 (17 days) | 250 |

**Call it 500 visits a month.** At a generous 4 MB per visit that is **2 GB of bandwidth a month**.

Netlify's Free plan is **300 credits/month, a hard limit with no auto-recharge**:

| what | credits | his month |
|---|---|---|
| bandwidth | 20 per GB | 2 GB -> **40** |
| web requests | 2 per 10,000 | ~30k -> **6** |
| **production deploys** | **15 each** | 10 deploys -> **150** |
| branch + preview deploys | **not metered — free** | staging is free, unlimited |

**About 200 of 300 credits. It fits — but the binding constraint is DEPLOYS, not traffic.** At 15
credits each, the Free plan is **20 production releases a month, ever**, and a busy week could hit
it. Staging is free and unlimited, which fits how this project actually works (he plays staging;
production moves rarely, on his approval only).

**Hard limit means the site goes dark if the number is exceeded, with no auto-recharge.** That is a
worse failure mode than GitHub Pages' soft 100 GB. The $9/month Personal plan raises it to 1,000
credits (about 65 production deploys, or about 50 GB) and adds auto-recharge.

**Honest alternative, stated because the ask may not be the biggest lever:** Cloudflare Pages is
free, has **no bandwidth metering at all**, supports private repositories, and allows 500 builds a
month. It solves the same problem — private repo, one repo, two environments — with no ceiling that
can take the game down mid-month. It is a slightly worse developer experience than Netlify (branch
aliasing is clumsier; no equivalent of `netlify deploy --dir` publishing a dirty working tree).
**It is worth ten minutes of his time to decide against, rather than not being offered.**

---

## 5. THE DNS FACTS — measured 2026-09-06

```
playpastrypirates.com          A     185.199.108-111.153   (GitHub Pages)
www.playpastrypirates.com      CNAME wyattroy.github.io
staging.playpastrypirates.com  CNAME wyattroy.github.io
nameservers                    nsb1-4.squarespacedns.com
MX                             NONE  <- no email on this domain
TXT                            google-site-verification=..., v=spf1 -all
CAA (apex)                     NONE  <- no restriction on which CA may issue
```

**Two findings that make this cheaper than expected:**

1. **There is no email on the domain.** Delegating nameservers to Netlify would risk nothing but two
   TXT records, which are trivially recreated. The usual reason to refuse a nameserver migration
   does not apply here.
2. **There is no CAA record at the apex**, so nothing blocks Netlify from issuing a Let's Encrypt
   certificate. (The two subdomains answered with CAA lists that include `letsencrypt.org` anyway.)

**The cutover, in the order that makes it un-scary:**

1. Create both Netlify sites against `wyattroy/pastrypirates`. They serve at `*.netlify.app` first —
   nothing public changes, nothing can break.
2. **Move STAGING first.** Repoint `staging.playpastrypirates.com`'s CNAME at the Netlify staging
   site. He plays it. If anything is wrong, production is untouched and the old CNAME goes back.
3. **Live on staging for a few days.** This is the entire proof, and it costs nothing.
4. **Then production:** swap the apex A records to Netlify's load balancer, `www` to the site. There
   is a window of minutes while Netlify issues the certificate, during which HTTPS on the apex can
   fail. Do it at a quiet hour; rollback is putting four A records back.
5. **Only then, flip the repo private** and delete `wyattroy/pastrypirates-staging`.

**Steps 2 and 4 are his — they need the Squarespace login. Everything else can be done for him.**

---

## 6. THE ONE THING THAT NEEDS DECIDING BEFORE ANY OF IT

Which files the public site contains. Today it is "the whole repo, minus dot-folders". Three options,
and the answer determines whether item 1 above is half a day or five minutes:

- **Game only (222 files, 7.9 MB).** A `build-site` script that copies by EXCLUSION — the same
  derived-not-listed shape `deploy-staging.sh`'s `EXCLUDES` already uses and has been proven by, so
  the logic is lifted rather than invented. `art-review/`, `scripts/`, `notes/`, `.planning/`,
  `.claude/` all stop being public.
- **Everything, as today.** About 1.3 GB per deploy, slow builds, and the art review stays public.
  No work, but it wastes most of what the move is worth.
- **Game only, and `art-review/` kept public deliberately** — if he has ever sent those PNG links to
  Luis or another collaborator, they are live URLs today and would break.

**That last one is a real question, not a formality: something may be linking to those files.**

---

## 7. WHAT THIS SCOPE DOES NOT COVER

- **Nothing has been built and nothing has been changed.** This document is the scope only.
- **Netlify account state is unknown** — whether he already has one, and under which email.
- **The `physical-board` branch** is excluded from deploys today via a local `.git/info/exclude`,
  which a Netlify build (a fresh clone) would not honour. The new build script must exclude it
  explicitly, the same way `deploy-staging.sh` learned to on 2026-08-28.
- **No sea trial is implied.** Item 6 changes no game code, so the gear for the whole move is
  COSMETIC on the game and FULL on the deploy chain — which is a different kind of proof: the
  verification is the staging soak in step 3, not a voyage.
