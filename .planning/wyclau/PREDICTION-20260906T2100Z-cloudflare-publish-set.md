# PREDICTION — 2026-09-06T2100Z — the Cloudflare publish set

**Written BEFORE the gate is run and before `build-site.mjs` exists.** Handle: the Cloudflare
cutover, staging first (his answers, 2026-09-06: Cloudflare + move the DNS · game-only publish set ·
build it, staging first).

## What I expect

1. **`site_build_check.mjs` will FAIL on its first run, on case 1**, because `scripts/build-site.mjs`
   does not exist yet. That is the honest RED for step 1, produced by construction rather than by a
   synthetic mutant.
2. **Once `build-site.mjs` exists, the publish set will be about 222 files and about 7.9 MB** —
   measured this morning from the same file list.
3. **`classic/` will carry through with 24 files.** This is the entry a publish-set change drops
   silently, and it is a release check in `docs/GIT-AND-DEPLOY.md` §5 step 8.
4. **A production build will be BYTE-IDENTICAL to the repo** for `index.html`, `src/main.js`,
   `src/engine/index.js`, `src/ui/flow.js`, `src/shared/host.js` and `classic/index.html` — because
   the publish step must copy the game, never rewrite it. Only the build stamp may differ, and only
   outside production.

## WHY — the reasoning, so it can be wrong out loud

The exclusion approach copies the working tree minus a known set of non-game folders. If that
reasoning is sound, every game file arrives unaltered and the only files present are the ones a
browser can ask for. The 7.9 MB figure comes from `du` over the same list, so the build should land
close to it.

## WHAT WOULD PROVE ME WRONG

- **The size lands far from 7.9 MB.** Well over means the exclusion list has a hole and something
  that is not the game came along. Well under means a folder the game NEEDS was excluded, which is
  worse and would show as a missing `MUST_HAVE`.
- **`classic/` arrives with fewer than 24 files** — then the exclusion patterns are matching inside
  it (`classic/src/` looks a lot like `src/`, and a careless pattern would eat it).
- **Any sampled game file differs from the repo copy in a production build.** That would mean the
  build step is rewriting the game, which is exactly the failure `GIT-AND-DEPLOY.md` §5 rule 2 names
  ("copying files at release time ships something nobody tested").
- **The gate passes on its very first run.** That would mean it cannot fail, and a check that cannot
  fail is not a check (CLAUDE.md rule 6). If that happens, the gate is the bug, not the build.

## THE TRAP — what I want to be true

**I want the exclusion list to be right first time, because his answer was "build it" and a clean
first run looks like momentum.** The specific temptation is to widen the ceiling or trim a
`MUST_HAVE` entry when something goes red, rather than to look at why. If I change either constant
in this session, that change has to be argued for in the commit message, not made quietly.

**Second trap:** I have already been wrong once today by asserting his Firebase plan without
checking it. The same shape here would be asserting that Cloudflare's limits or defaults are
X without opening their docs. The three numbers in the gate (20,000 files, 25 MiB per asset,
and Pretty URLs) came from Cloudflare's own docs on 2026-09-06 — the first two are cited in the
gate; **Pretty URLs is still UNVERIFIED and is marked so in the scope.**
