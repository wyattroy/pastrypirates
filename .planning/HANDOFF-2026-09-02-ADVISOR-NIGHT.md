# Handoff — the night of 2026-09-01/02, written by the Advisor session before winding down

**Read this instead of re-deriving it.** Everything below was measured, not remembered, and where a
claim was later proved wrong the correction is kept beside it rather than tidied away.

---

## 1. WHAT WYATT IS WAITING ON — the only part that needs him

| | |
|---|---|
| **The End-of-Voyage button, on a phone** | The last screen hides who won the awards behind **"Play again!"**. Solo *and* pass-and-play, both browsers. **On a tablet the same screen is perfect**, so the target is known. A watch deliberately did NOT fix it: touching game code bumps the build and throws away the judged evidence, which had already happened four times in a day. **Staging is waiting on his call about this, not on evidence.** |
| **The "Bake this!" badge** | On the recipe picker the orange badge covers nearly all of the pastry picture — the one you are about to choose is the one you cannot see. Built that way on purpose in August to make the second tap discoverable. A few lines either way. |
| **Ten seconds on his iPhone** | In the black-market card *"…for 10 🌕."* — gold coin, or blank gap? |

## 2. THE RELEASE — evidence complete, for the first time

`SEA-TRIAL-2026-09-02T0137Z-Wy-Blade` — **ten voyages, nothing skipped, tests pass, and every
picture judged: 315 of 315 looked at, 307 fine, 8 not. The not-run column is empty for the first
time.** The 8 are really 4 things and only two are real: the End-of-Voyage button above, and the
trade circle that cannot fit a captain's name (*"Crustbeard"* rendered as *"rustbea"* — third
sighting).

**The earlier trial (`…1914Z`, build `2026.09.01.7`) reads FAILED and that is mostly honest
blindness, not breakage:** its vision judge could not see, and it said so — *"every visual verdict
below is worthless; the structural half still stands."* Its one structural finding (a control
covering the question it answers) was fixed the same night in `e191ad74`.

## 3. WHAT SHIPPED TO THE GAME — 15 commits to `src/` and `index.html`

Storm: a swept square that never painted, a swept-*ship* case, and a three-hop jump made one glide.
A guest's camera no longer pins at full zoom and their sail squares are framed **on screen**. The
Muse's pass narration, deleted as collateral five days earlier, restored verbatim. Attack and call
circles now sit on the captain they name instead of over the question. Recipe art, award emblems
and "fire the ovens" preloaded rather than popping in.

## 4. THE MACHINERY, AND WHY IT MOVED

**The Glass froze for 100 minutes and the cause was not the Glass.** The checkout was left detached
mid-rebase at 15:56Z, so `can_push.mjs` exited 1 and **ten consecutive watches correctly refused to
do any work at all**. Repaired at 17:47Z — `rescue-20260901` labelled the stranded tip *before* any
git move, then the rebase completed by skipping a commit that was the same work done twice.

**Two faults, one symptom, in sequence — only the second was fixed that night:**
`17:56Z→20:08Z` watches worked fine and *could not publish*; `20:08Z→21:38Z` they could not work.

**Three fixes to the publishing chain, all four-stepped, all in claude-kit then vendored:**
- `mark_glass_published.mjs` demanded nothing and wrote *"Glass published"* unconditionally — a
  stamp that could only ever say one thing. It now requires `--version=<id>` and records
  `commit=<sha>`. **Rule 6: a measurement that cannot fail is not a measurement.**
- `glass_needs_publish.mjs` — the page publishes on a **change**, not a clock. Wyatt charged the
  timer design and CEO 80 upheld him. **Tick often, act rarely** — the Bell's own shape.
- The echo tick: the loop was republishing on its own note-reset commit. The test is now
  *directional* — a note **written** counts, a note **cleared** does not.

## 5. TRAPS THAT COST TIME TONIGHT — do not pay for these twice

- **`glass.mjs --note` RESETS `GLASS-NOTE.md` whether or not you publish.** The Advisor ran it
  merely to answer a question and **destroyed the note carrying the screenshot-judging results**.
  Recovered with `git checkout --`, because it had been committed. **A note that is committed is not
  a note that was delivered** — that gap is on the Chart.
- **`diff` reports every line changed on a file that differs only by CRLF.** This produced a false
  "8 vendored files have drifted", and acting on it ran a re-vendor that **deleted the
  landed-commits fix**. Use `diff --strip-trailing-cr`.
- **The kit can be BEHIND the repo it vendors into.** "Edit there, re-vendor here" was destructive
  until the repo's newer `glass.mjs` was carried back into claude-kit.
- **`node --check f | head -3 && echo OK` prints OK regardless.** It masked a broken file that was
  then vendored. Read the exit code.
- **An `artifact-changed` notification is NOT a publish.** Wyatt tapping a ruling makes the page
  save *itself*. Anything reasoning about cadence must read `.planning/wyclau/LAST-PUBLISH`.
- **Shell escaping broke three test harnesses in a row**, each time making working code look
  broken — once via a literal backspace byte inside a regex. **When a check condemns something
  known to work, suspect the check.** Write the probe to a file.

## 6. THE ADVISOR / WATCH SPLIT — his ruling, and the session that broke it

> *"Wait. You're not supposed to do work. The watch is."*
> *"Instead of doing any work in this session, triage it into the chart and let the watch do it."*
> *"A question mark is not authorisation"* (`.claude/memory/DECISIONS.md`).

**This session spent the night doing watch work** — writing gates, running the four steps — while
its own first duty went undone: his words reach `INBOX.md` verbatim **in the turn he says them**,
and nothing was filed until he stopped and pointed at it. Then he asked *whether* three gates were
needed and it built them; **two did not work as described** (CEO 83), and both are now
**unregistered from `settings.json`**, files kept so a watch repairs rather than rediscovers.
`file-his-words.cjs` works and stays armed — it fired on its own author within minutes.

## 7. STILL UNEXPLAINED

- **`59ad8b69`** asserts *"MEASURED on both machines: `-p` HAS the Artifact tool"*. On the Blade it
  does not — settled behaviourally (`ToolSearch` finds nothing; the print session's own prompt lists
  subagent tools as *"All tools except Agent, Artifact…"*). The Mac measures the opposite on the
  Mac. **Per-machine is the honest scope; the general rule is unknown.** Blade 2.1.257, Mac 2.1.240.
- **The Mac session's git has been sandbox-blocked for hours** (`fatal: unable to access
  '.git/config'` on read-only commands). Its ledger corrections are stranded there.
- **A Chart row only becomes a "Task" on the Glass if it sits inside `## STEP 1 CHECKLIST`** — the
  rule is *positional, not semantic*, and a row filed one section lower is silently invisible.
