# Officers — Pastry Pirates adapter

**The officers hold the judgment; this file holds the facts.** Every value below was verified
against the repo on 2026-08-30 at build `2026.08.30.1`, not recalled.

## The settings

- **production-ref:** main
- **production-url:** https://playpastrypirates.com
- **staging-command:** ./scripts/deploy-staging.sh "what changed"
- **build-stamp-command:** grep -o 'PP4_STAMP = "[^"]*"' src/ui/stage.js
- **test-command:** npm test
- **trial-report:** .planning/SEA-TRIAL.md
- **verdicts:** .planning/CEO-REVIEWS.md
- **backlog:** .planning/BACKLOG.md
- **backlog-id-pattern:** [A-Z][A-Z0-9]*-[0-9]+
- **ledger:** .planning/CTO-LEDGER.md
- **questions:** .planning/CTO-QUESTIONS.md
- **lock:** .planning/.cto-lock
- **never-touch:** CNAME, robots.txt, sitemap.xml, assets/
- **memory:** .claude/memory
- **fence:** .claude/hooks/cto-staging-only.cjs

## What an officer must know beyond the settings

**`main` IS production, with no build step in between.** A push to it is served to real players
within seconds — people who may be mid-voyage. Staging is a separate address published from any
branch. So the CTO's entire output channel is `./scripts/deploy-staging.sh`, and a merge to `main`
is Wyatt's act, never an officer's or a worker's.

**The verdicts file is newest-first.** `.planning/CEO-REVIEWS.md` is appended to at the TOP,
because the brief reads the top of it to hand the next CEO the previous verdict. Appending at the
bottom has already broken the recurrence check once — a CEO was handed a two-generation-stale
verdict and could not see the pattern it was there to name.

**The ledger is the heartbeat and the claim register.** A second session may be on the same branch,
so an item is CLAIMED in `.planning/CTO-LEDGER.md` before it is edited, and `git pull --rebase`
runs before every commit. There is no lock across machines and a lock file in git would lie.

**Taste never times out.** `.planning/CTO-QUESTIONS.md` is where work parks what needs Wyatt.
Mechanism questions may take a default and say which default was taken; **anything about taste,
wording, placement or "how much is enough" waits for him, however long that is.**

**The trial report keeps a NOT-RUN column.** A leg that could not start is not a leg that passed,
and the moment that column is dropped, "we tested it" becomes a lie.

## The fence

**This repo runs its own**, at `.claude/hooks/cto-staging-only.cjs`, registered in `settings.json`.
Wyatt's ruling, 2026-08-30: it survives and the portable one is not vendored here. It earned that
— measured the same day against four spellings of the same push with a lock held (`main`,
`refs/heads/main`, `HEAD:refs/heads/main`, `main:refs/heads/main`), all four denied.

**The `fence:` key above is what makes that a mechanism rather than a memory.** `install.sh vendor`
reads it, does not copy the portable fence into this repo, and deletes one if a previous run left
it. Two fences doing one job is the drift this kit exists to prevent, so the choice is declared in
the adapter rather than re-made by whoever vendors next.
