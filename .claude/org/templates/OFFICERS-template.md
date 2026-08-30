# Officers — this repo's adapter

**Copy to `<repo>/.claude/OFFICERS.md` and fill in. One page, and it is the only repo-specific thing
the officers know.**

The officers hold the judgment; this file holds the facts. That split is deliberate: **a tool that
stores facts about a repo it does not live in goes stale the day the repo moves, and nothing tells
you.** This file travels with the repo, so it cannot drift from it.

**Anything left out is not silently skipped — it is named in the report as a check that did not
run.** Leaving a line out is a legitimate choice; leaving it out *quietly* is the failure.

## The settings

Format is `- **key:** value`. Lines inside code fences are ignored, so examples are safe.

- **production-ref:** main
- **production-url:** https://example.com
- **staging-command:** <this repo's own publish command — NOT copied from another project>
- **build-stamp-command:** <a command printing this build's identity, e.g. grep -o 'BUILD = "[^"]*"' src/version.js>
- **test-command:** npm test
- **trial-report:** .claude/TEST-REPORT.md
- **verdicts:** .claude/CEO-REVIEWS.md
- **backlog:** .claude/BACKLOG.md
- **backlog-id-pattern:** [A-Z][A-Z0-9]*-\d+
- **ledger:** .claude/CTO-LEDGER.md
- **questions:** .claude/CTO-QUESTIONS.md
- **lock:** .claude/.cto-lock
- **never-touch:** CNAME, robots.txt, sitemap.xml

## What each one is for

| key | why an officer needs it |
|---|---|
| `production-ref` | the branch that reaches real users. **The fence refuses to guess this** — without it, a CTO's push is denied rather than allowed |
| `production-url` | where to confirm what is actually live |
| `staging-command` | the CTO's entire output channel. No staging declared means the CTO has nowhere to publish, and must park its work |
| `build-stamp-command` | tells a reviewer WHICH build it is judging. Without it, that is UNKNOWN |
| `test-command` | how this repo proves itself |
| `trial-report` | where the last full run wrote its result, so a review can read it rather than trust a claim |
| `verdicts` | the standing record of past CEO verdicts — **this is what makes a RECURRING fault visible** |
| `backlog` | the CTO's mandate. It executes only what is on this list and may not promote its own ideas |
| `backlog-id-pattern` | the shape of an item id in that file. A pattern that matches nothing looks exactly like an empty backlog |
| `ledger` | the CTO's append-only progress record, and the heartbeat that separates a slow item from a dead worker |
| `questions` | where the CTO parks what needs Wyatt. **Taste never times out** |
| `lock` | its presence says a CTO is driving, and is what arms the production fence |
| `never-touch` | files no officer or worker may modify, whatever the reason |

## The questions to ask Wyatt if this file is missing

**Ask with the question UI, never as prose.** Put the measurement in the question where you can —
he answers far better against real numbers than against abstractions.

1. **Which branch reaches real users, and is there a build step between it and them?**
2. **How does work get published for him to look at without reaching real users?** (If the answer is
   "there is no staging" — say so plainly; the CTO then has no output channel and must park its work.)
3. **How does this repo prove itself — one command?** And where does that write its result?
4. **Is there a backlog the CTO may work from, and what does an item id look like in it?**
5. **What must never be touched, whatever the reason?**
