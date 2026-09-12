# The daily doc audit — the brief the scheduled session follows

Wyatt, 2026-09-06: *"suggest changes and improvements, including a daily session that audits these
documents automatically to make sure they are kept functional."*

**One job: keep the rulebook TRUE and SHORT enough to be read.** Not to improve it, not to add to
it. Most days the correct output is **nothing**, and a session that invents work to justify its run
is doing the damage it was sent to prevent.

> **⚠ THIS BRIEF WAS ITSELF STALE WITHIN A DAY, WHICH IS THE POINT.** As written on 2026-09-06 it
> told the session to run `4/scripts/doc_command_check.js` — a path the cutover deleted — and to
> lower a `CEILING` constant that no longer exists in that file. It also cited a rules table that
> the 2026-09-06 rewrite removed. **Three false claims, in the document whose whole job is finding
> false claims.** Corrected 2026-09-06 in the same session that trimmed CLAUDE.md. If you find this
> brief describing something that is gone, fix the brief first, then do the audit.

---

## What runs, in order

### 1. The machine half — already written, do not rebuild it

```bash
npm test
```

`scripts/doc_command_check.js` runs last in the chain and prints one line per check with its own
count. It covers: every `node …` command and script path a doc names must exist; every relative
doc link must resolve; every doc named in CLAUDE.md's subsystem table must also be in the
`read-the-doc-first` hook's table; and every shell command in a `bash`-tagged fence must run on
this machine or be labelled with the machine it belongs to.

*(Read the count off the run. An earlier version of this paragraph hand-typed "nine checks" and was
wrong within the same hour — CLAUDE.md: never hand-type a number that can be counted.)*

**If it is red, that is the whole job.** Fix it, open the PR, stop.

### 2. The judgement half — what no gate can see

Read `.claude/CLAUDE.md` **cold, start to finish**, before reading anything else. Then answer, with
a file:line for every claim:

1. **Does any rule describe a thing that no longer exists?** A file, a tree, a script, a command, a
   workflow. The gate catches paths inside backticks; it cannot catch a rule whose whole *subject*
   is gone. On 2026-09-06 the Glass, the Bell, the Watch, the Chart and the ledger were all
   retired at Wyatt's instruction — a rule that still assumes any of them is a finding.
2. **Do any two rules say the same thing?** The 28-rule numbered table was removed on 2026-09-06
   precisely because rules had started competing for the same slot and were being cited by numbers
   that had moved. That pressure returns as soon as nobody looks.
3. **Do any two rules contradict each other?** Including a rule contradicting a doc it links to.
4. **What grew this week, and by how much?**
   ```bash
   git log --since="7 days ago" --format=%H -- .claude/CLAUDE.md docs/ | tail -1
   ```
   Report line counts then vs now for `.claude/CLAUDE.md` and `docs/HARD-WON-LESSONS.md`.
   **Baseline, 2026-09-06 after the trim: CLAUDE.md is 200 lines** (it was 1,359 that morning).
   Growth back toward four figures is the single thing this audit exists to catch.
5. **Is anything in CLAUDE.md a war story rather than a rule?** The stories belong in linked
   documents. Every story that moves out makes the rulebook more likely to be read.

### 3. The output

- **Something to fix → open a PR into `dev`.** One PR, titled
  `docs: daily audit — <the one-line finding>`. **Never push to `main`, and never to `dev`
  directly** — `main` is the live game and `dev` is where Wyatt's own work sits.
- **Nothing to fix → do nothing at all.** No PR, no summary, no "all clear" note. A daily
  all-clear is a daily notification, and a daily notification is the thing everyone learns to skip.

---

## The three rules for the audit itself

**MEASURE BEFORE YOU REPORT.** Every finding carries the command that produced it. A rule that
*looks* redundant is not a finding until you have both texts side by side. This is the rule the
audit exists to protect; breaking it here would be the worst possible failure.

**NEVER ADD A LINE TO CLAUDE.md.** This session may relocate, merge, delete and correct. It may not
append. If something genuinely belongs in the rulebook, put it in the PR description and let Wyatt
decide — a rule nobody chose is how the file reached 1,359 lines.

**FIX THE DOCS, NOT THE GAME.** If you find a game bug, put it in `.planning/BACKLOG.md` and move
on. This session never touches `src/` or `index.html`.
