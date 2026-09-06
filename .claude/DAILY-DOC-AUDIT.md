# The daily doc audit — the brief the scheduled session follows

Wyatt, 2026-09-06: *"suggest changes and improvements, including a daily session that audits these
documents automatically to make sure they are kept functional."*

**One job: keep the rulebook TRUE and SHORT enough to be read.** Not to improve it, not to add to
it. Most days the correct output is **nothing**, and a session that invents work to justify its run
is doing the damage it was sent to prevent.

---

## What runs, in order

### 1. The machine half — already written, do not rebuild it

```bash
npm test
```

`4/scripts/doc_command_check.js` is nine checks: every command and script path a doc names must
exist, every link must resolve, every path pattern in the two PreToolUse hooks must match a real
file, every deploy script must trip the deploy hook, every rule the hooks cite must exist in
CLAUDE.md by name, and CLAUDE.md may not grow past its ceiling.

**If it is red, that is the whole job.** Fix it, open the PR, stop.

### 2. The judgement half — what no gate can see

Read `.claude/CLAUDE.md` **cold, start to finish**, before reading anything else. Then answer, with
a file:line for every claim:

1. **Does any rule describe a thing that no longer exists?** A file, a tree, a script, a command, a
   workflow. The gate catches paths inside backticks; it cannot catch a rule whose whole *subject*
   is gone.
2. **Do any two rules say the same thing?** The table's own note records three rules that had to be
   merged because they were competing for one slot. That happens again as soon as nobody looks.
3. **Do any two rules contradict each other?** Including a rule contradicting a doc it links to.
4. **What grew this week, and by how much?**
   ```bash
   git log --since="7 days ago" --format=%H -- .claude/CLAUDE.md docs/ | tail -1
   ```
   Report line counts then vs now for `.claude/CLAUDE.md` and `docs/HARD-WON-LESSONS.md`.
5. **Is anything in CLAUDE.md a war story rather than a rule?** The file's own first sentence says
   the stories live in linked documents. Every story that moves out lowers the ceiling.

### 3. The output

- **Something to fix → open a PR.** One PR, titled `docs: daily audit — <the one-line finding>`.
  Lower `CEILING` in `doc_command_check.js` in the same commit as any trim. Never push to `main`.
- **Nothing to fix → do nothing at all.** No PR, no summary, no "all clear" note. A daily all-clear
  is a daily notification, and a daily notification is the thing everyone learns to skip.

---

## The three rules for the audit itself

**MEASURE BEFORE YOU REPORT.** Every finding carries the command that produced it. A rule that
*looks* redundant is not a finding until you have both texts side by side. This is the rule the
audit exists to protect; breaking it here would be the worst possible failure.

**NEVER ADD A LINE TO CLAUDE.md.** This session may relocate, merge, delete, and correct. It may
not append. If something genuinely belongs in the rulebook, put it in the PR description and let
Wyatt decide — a rule nobody chose is how the file got to 990 lines.

**FIX THE DOCS, NOT THE GAME.** If you find a game bug, put it in `.planning/BACKLOG.md` and move
on. This session never touches `src/`.
