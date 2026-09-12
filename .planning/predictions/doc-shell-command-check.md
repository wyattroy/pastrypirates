# Prediction — widening `doc_command_check.js` to the SHELL commands the docs teach

*Watch 2026-09-02T18:50Z, item `INBOX-20260902T15xxZ`. Written before the second measurement; the
first RED run had already happened when this was written, and that is stated rather than hidden —
the honest claim below is about what the FIX does, not about what the first run would find.*

## What has already been measured (RED, run before this file existed)

Section 4 added to `scripts/doc_command_check.js`; run on the current docs: **FAIL, 15 findings.**
By first word: `python3` x9, `pkill` x1, `apt-get` x1, and **four that are not commands at all** —
`subject`, `Body`, `because`, `MSG`, all four inside the heredoc BODY of the commit-message example
at `docs/GIT-AND-DEPLOY.md:485-492`.

## What I predict, and what would prove me wrong

1. **Teaching the checker about heredocs removes exactly four of the fifteen** — `GIT-AND-DEPLOY.md`
   487/489/490/491 — **and removes none of the `python3` lines.** `HARD-WON-LESSONS.md:166` and
   `:171` are `python3 - <<'PY'`: the *line* is a genuine `python3` invocation and must survive; only
   the `PY` body below it is skipped. **Wrong if** either of those two disappears, or if any of the
   four survives.
2. **`python3` is genuinely absent on this machine.** Windows ships `python.exe`, not `python3`, and
   Git Bash adds no alias. **Wrong if** `python3 --version` answers.
3. **The `pkill` finding at `HARD-WON-LESSONS.md:704` is the SAME fault as rule 17's, in a second
   file that nobody swept.** Rule 17 in `.claude/CLAUDE.md` was annotated by the Advisor on
   2026-09-02; `HARD-WON-LESSONS.md` was not. **Wrong if** that line already carries a platform note
   I misread.
4. **After the doc lines are given a runnable form or a platform label, the check is GREEN and
   `npm test` still passes.** **Wrong if** any other doc turns out to teach a command that is absent
   here and has no honest alternative — in which case the finding is real and gets reported, not
   suppressed.

## The instrument's own failure mode, named in advance

**A check that fires on prose is a check somebody disables.** Four of fifteen first findings were
prose inside a fenced block. If after the heredoc fix any finding is still not a command, the
instrument is wrong and the docs are innocent — and that must be said in those words rather than
worked around by editing the doc to please the gate.
