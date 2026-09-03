---
name: door
description: The one way into work on this project (wyclau charter, part 2). Use at the START of any session — a Bell-started watch runs one item through the full Proof and ends; any session Wyatt opens becomes the Advisor. Syncs, orients, then works or advises.
---

> **VENDORED FROM claude-kit (`plugins/wyclau`) — edit THERE, not here.** Re-vendor:
> `bash install.sh vendor <repo> wyclau` from claude-kit. Drift is caught by
> `scripts/qa/vendor_check.mjs`.

# The Door

Every session enters here. Orientation budget: **two minutes**. If any step below is impossible,
say what you actually observed and park a question — never guess past it.

**Which mode?** If your launch prompt says the Bell started you as a **watch**, run THE WATCH.
Otherwise a person opened this session: you are THE ADVISOR. There is no third kind of session.

## First, both modes: sync and orient

```bash
git fetch origin && git pull --rebase
```

**Then, BEFORE any work, ask whether this tree can publish at all:**

```bash
node scripts/wyclau/can_push.mjs
```

**Exit 1 means STOP: end the turn, and say why in your reply or the local ledger.** A watch that
cannot push is invisible — its commits reach nobody, its edits still change a shared tree, and a
sailing sea trial may be reading those very files. Earned 2026-09-01: watch 1 on the Razer did
everything right, committed its ledger entry, and the commit landed on no branch because the
checkout was in detached HEAD after a stuck rebase. Nothing reached the branch, and from every
other machine it looked exactly like a watch that never woke. **Working perfectly into a void is
worse than not working**, because it also hides the fault. The script names which of the four
faults it found (detached HEAD, no upstream, rebase in progress, merge in progress) and the repair;
a human does the repair, never an unattended watch.

Run it where you stand — every way into the Door starts in the repo root. Never `cd` to one
machine's absolute path first: the repo lives at a different path on every machine, and a failed
`cd` short-circuits the `&&` chain so the sync silently does nothing — on every ring of the Bell,
forever. If the pull moved `.claude/CLAUDE.md` or `.claude/rules/`, re-read them from disk — your
context copy predates the pull.

Then read, do not re-derive:

1. `.planning/wyclau/INBOX.md` — **Wyatt's words, verbatim. They outrank everything below.**
2. `.planning/CHART.md` — the plan, the checklist, what's blocked on Wyatt.
3. `.claude/memory/DECISIONS.md` — his rulings (top entries; stop when dates look familiar).
4. `.planning/CTO-LEDGER.md` — tail only: what other live sessions or a detached trial have claimed.

**Harvest the Glass before anything republishes it** (the hook enforces this): read the live
artifact (Artifact tool, `action: "read"`, the URL `glass.mjs` prints), then **run the harvest and
commit what it writes**:

```bash
node scripts/wyclau/harvest_glass.mjs --html=<the file the read saved>   # --dry-run to look first
```

It carries **every idea, every comment, every ruling and his DO NOW pin** into the INBOX and
`DECISIONS.md`, skips anything already on record (so running it twice is safe — and you should, if
you are unsure), and **counts what landed by re-reading the files**, so a write that did not happen
says so instead of being confirmed. **A republish without the harvest deletes his words.**

> **⛔ AND THE PUBLISH STAMP NOW REFUSES WITHOUT `--harvested=` TOO (`T-210`).** Name the page file
> YOUR read saved; the harvest receipt must name the same one. **Another session's harvest is not
> yours** — that receipt is machine-local and shared, and on 2026-09-03 one session's look licensed
> a different session's republish twenty-nine seconds later, by a session that had never opened the
> page. It does not close the race (he can write between your read and your publish); it closes the
> case where the publisher never looked at all.
>
> **⚑ DO NOT TRANSCRIBE BY HAND ANY MORE — that is what `T-140` removed.** The reading is still
> yours (only the Artifact tool can fetch a published page; a Bell-launched watch has none, and
> writes `GLASS-NOTE.md` instead). The *carrying* is not. A hand-copy that misses one of his
> comments looks exactly like a clean harvest, which is the fault that cost him words on 2026-09-03.

> ### ⚠ THREE THINGS OF HIS LIVE ON THAT PAGE, NOT TWO — AND ONE MORE MUST BE CARRIED BY HAND
>
> **`glassState.comments` (added 2026-09-03, `T-076`) is his per-item comment box**, shaped
> `{"T-nnn": [{"text": "…", "at": "…"}]}` and keyed by the row's handle. **File each comment onto
> the row its handle names** — a comment is him talking about a SPECIFIC item, so filing it as a
> loose idea loses the half that matters. This line used to say "every idea and every ruling", and
> `glass.mjs`'s own end-of-render banner used to say a republish "DELETES both". **Both counted two
> when there were three.**
>
> ⛔ **AND IF AN IDEA CARRIES `"now": true`, HE PRESSED DO NOW ON IT.** Carrying the idea across is
> not enough — **the flag does not travel by itself.** Run, with the handle of the row you just
> wrote:
>
> ```bash
> node scripts/wyclau/chartkeeper.mjs --do-now=<T-nnn>
> node scripts/wyclau/chartkeeper.mjs --rank --write
> ```
>
> ⛔ **TWO COMMANDS, ONE ACT; NEVER THE FIRST WITHOUT THE SECOND.** `--do-now` writes `now: yes`
> onto the row and stops. **The Glass draws his Tasks card in the order the rows physically sit in
> the file**, so a pin with no re-rank leaves his page in the old order — the row is flagged and it
> has not moved, which from where he sits is his half-1 failing. The Glass runbook has always said
> this; the Door did not. **A watch is covered by accident** (step 2 runs `--rank --sweep --write`
> before it picks anything) — **the Advisor is not: `## THE ADVISOR` contains no rank step at all**,
> and the Advisor is the mode a session is in when he is talking to it, which is exactly when he
> presses the button. Found by CEO 151.
>
> **This is the one joint in his DO NOW button that is a session remembering something** (`T-104`).
> Everything either side of it is mechanical and gated: the press pins the idea and tells him so,
> and RANK puts a pinned row first at score 9,000,000 with **YOU SAID DO NOW** beside it — measured,
> rank 46 → rank 1. **Between those two halves is this command, and if you skip it his press reaches
> the top of nothing.** The Glass runbook has carried this instruction since it was built; **the
> Door — the file every watch actually reads — did not, and that omission is the gap `T-104` was
> left open for.**

If this session has no Artifact tool, write that fact to the ledger — plainly, as "no Artifact tool
in this session", never as a guess about why — and continue; the next capable session harvests.

---

## THE WATCH — one item, full loop, then END

You are one watch in an endless relay. The Bell rings a fresh watch a few minutes after you end,
forever. **Ending your turn is the design working, not a failure** — a watch that tries to work
forever is the failure, and everything that goes with it (context rot, phantom engines, a stale
Glass) died when the relay replaced the long-lived engine (Wyatt's ruling, 2026-09-01).

1. **State the situation** — six lines to the ledger: watch started (UTC) · last progress · what
   the previous watch closed · blocked on Wyatt · any detached trial in flight (read its report,
   check its pid) · what THIS watch will do. Then pulse:
   `node scripts/wyclau/glass.mjs --note "watch <UTC>: <what this watch is taking up>"` — and
   republish + `node scripts/wyclau/mark_glass_published.mjs --version=<id> --harvested=<the page file your read saved>` (a pulse he cannot see
   is not a pulse). **`--version` is the id the Artifact publish returned, and it is REQUIRED** — a
   bare call exits 1 and writes nothing. **If you have no version id you did not publish, and you
   must not stamp:** a Bell-launched watch has no Artifact tool on some machines and cannot publish
   at all. Write what you wanted shown into `.planning/wyclau/GLASS-NOTE.md` and commit it, for the
   next session that can. Earned 2026-09-01: the stamp used to take no arguments and record a
   publish unconditionally, so a watch that could not publish still marked the Glass as fresh.
2. **Pick ONE item: RANK THE CHART, THEN TAKE ROW ONE.**
   ```bash
   node scripts/wyclau/chartkeeper.mjs --rank --sweep --write    # order it, archive finished rows
   node scripts/wyclau/tick_rows.mjs                             # which rows can PROVE they are done?
   node scripts/wyclau/tick_rows.mjs --chart=.planning/GLASS-CHART.md   # …and on the machinery list
   ```
   **`tick_rows` REPORTS, IT NEVER TICKS — and that is deliberate, not an oversight.** A row may
   carry `done-when: node scripts/qa/<gate>.mjs`; the tool runs those gates and tells you which rows
   are provably finished. **It is run WITHOUT `--write` here on purpose:** auto-ticking would let a
   row close itself on a green gate and walk straight past `close_item.mjs`'s CEO-evidence
   requirement, and that requirement is Wyatt's. So the tool finds the finished rows and **a person
   still closes them through the gate** (step 5).
   ⚠ **THIS LINE EXISTS BECAUSE TWO CEO REVIEWS IN A ROW FOUND THE TOOL WAS INVOKED BY NOTHING** —
   134 (*"it is named nowhere except inside itself"*) and 135 (*"a better guard on a tool nothing
   runs is a better lock on a door nobody opens"*). It was built, gated, and unreachable. **Same
   fault as the Chartkeeper's, in the same file, one screen down** — see 6a.

   **Then work the FIRST open row THAT NOBODY HOLDS.** Not the oldest anything. Commit the
   re-ordered Chart with your claim, and **claim it in the ledger before touching anything.**

   ⛔ **SKIP A ROW SOMEBODY ELSE HOLDS — CHECK BEFORE YOU TAKE, EVERY TIME:**
   ```bash
   cat .planning/wyclau/IN-HAND 2>/dev/null      # this machine's live claim, if any
   tail -40 .planning/CTO-LEDGER.md              # claims from every machine
   ```
   **A row is HELD if either names its handle and the claim is under 90 minutes old.** Held → go to
   the next open row and say in your ledger entry which row you skipped and why. **Never take a held
   row because it is at the top; the top is exactly where two sessions now collide.**

   ⚠ **THIS GUARD WAS MISSING AND TAKING ROW ONE IS WHAT MADE IT DANGEROUS.** Added 2026-09-02
   9:55 PM ET, minutes after the ordering change above, **because Wyatt spotted it before it bit**:
   *"i think the new watch just started — did you remove your task from the list while working on
   it? … if not, the new watch may be starting to work on it too."* **He was right.** The Door told
   a watch to READ the ledger (step 4) and to WRITE a claim (here) and **never once told it to
   honour somebody else's** — grep for *"already claimed"* returned **0**. Under the old
   oldest-first rule two sessions rarely converged; **under "take row one" they converge every
   time.** The ordering fix created the collision and the claim check is its other half.

   ⚠ **AND `IN-HAND` IS MACHINE-LOCAL — IT IS GITIGNORED.** Another machine cannot see it, which is
   why **the ledger entry is the claim that travels** and why the two commands above are both
   required. A claim that only exists in `IN-HAND` is invisible to every other machine.

   ⚠ **THIS LINE USED TO READ "INBOX first — the OLDEST OPEN item… otherwise the top unblocked Chart
   item", AND THAT IS THE FAULT HE HAS NOW REPORTED FOR THE LAST TIME.** His words, 2026-09-02
   9:45 PM ET: *"i told you a THOUSAND TIMES that the CHart is supposed to take the TOP ITEM ON THE
   CHART. FIX THIS."* And his design, `T-083`, which sat at rank 27 scoring zero while the rule it
   replaces stayed in force: *"the door should not read oldest-first; the RANK algorithm should do
   the ordering, and the door should read what's at the top."*

   **WHY OLDEST-FIRST WAS ACTIVELY BACKWARDS, measured 2026-09-02:** his instruction queue held **25
   open entries and his newest instruction was the LAST of them** — so *"the oldest open item"* made
   **his most recent ask his lowest-priority ask**, every time. Over ninety minutes that evening,
   Chart ranks 1, 2, 3 and 5 were never claimed while three older entries were worked.

   **HIS WORDS STILL OUTRANK THE CHART — THE RANKER IS HOW THEY DO IT, NOT AN ALTERNATIVE TO IT.**
   `chartkeeper.mjs` gives **+100** to any row citing a live `INBOX-` entry of his and **+8 per
   mention**, so a fresh instruction of his arrives at the top on its own. **If something of his is
   not ranking first, that is a bug in the scoring to report — not a reason to go back to reading
   the queue by age.** And a row he has dragged to the top on the Glass is pinned there; his drag
   beats the score.
3. **Work it through the Proof, with the teeth** (his rulings, 2026-09-01, all three):
   - **His stated solution first.** If the item carries `solution:` in his words, your FIRST act
     is to implement and measure exactly that — before any investigation, before any tooling.
     You may disagree only AFTER showing the measured result of his version.
   - **A failed tool means look at the game the way he would** — screenshot it, play it. Never a
     second instrument for the same bug.
   - ⛔ **WRITE THE PREDICTION FIRST — one file, before you measure anything.**
     `.planning/wyclau/PREDICTION-<UTC>-<handle>.md`: what you expect, WHY, and **what would prove
     you wrong.** Then measure, then say plainly which parts were wrong.
     **THIS IS IN CLAUDE.md ALREADY AND IT KEEPS BEING SKIPPED — three consecutive CEO verdicts
     (149, 151, 153) found the same session conceding it and then skipping it again.** It is here
     because a rule at the top of a file somebody read this morning is not a rule at the moment of
     work. The pattern is exact and it is worth knowing before it happens to you: **the claims that
     got predictions were the ones that turned out FINE. The claim with no prediction was the one
     that was false, every time.**
     *Worked example, `T-021`:* a session argued the Bell stays silent while a watch is alive, from
     the GAPS between log lines. One line — *"if the task never fired during those gaps, my
     reasoning is wrong"* — is the falsifier it never tested, and the whole argument would have
     collapsed on it. **Writing it down is how you notice you have not tested it.**
   - Otherwise the loop is unchanged: gear → red check first → fix → same check green → posed
     pair or played verification at the gear's depth → fresh-context CEO → verdict appended to
     `.planning/CEO-REVIEWS.md`.
4. **A long job never runs inside your session.** A sea trial is started detached —
   `node scripts/wyclau/start_trial_detached.mjs` — and belongs to the machine, not to you. Start
   it, note it in the ledger, and END; later watches read its report. Three trials died in one day
   riding sessions that ended. Never again.
   **⚠ AND COMMIT BEFORE YOU END — this is not optional and it is not the close gate.** Starting a
   long job is not "closing an item", so step 5's gate never runs for it, and on 2026-09-01 that
   meant watch 1 started a real trial and pushed NOTHING: no claim, no status file. From outside,
   a watch doing real work looked identical to a watch that never woke — the exact blindness this
   relay exists to remove. So: write the claim and what you started to `.planning/CTO-LEDGER.md`,
   run `node scripts/wyclau/publish_status.mjs`, update the INBOX item to IN FLIGHT with the
   marker's own numbers, `git pull --rebase`, commit, PUSH — and only then end. The same applies
   to any turn that ends without closing an item: **a watch that pushes nothing is invisible, and
   an invisible watch is indistinguishable from a dead one.**
5. **Close ONLY through the gate:** `node scripts/wyclau/close_item.mjs …`. It refuses to tick the
   item without a CEO verdict on file, a game-code diff or a stated one-line reason, and the
   solution-first evidence. Do not tick the Chart or the INBOX by hand — the gate writes the tick,
   the ledger entry, and the INBOX fate together, so they cannot disagree.
6a. **RE-PRIORITISE AND SWEEP THE CHART BEFORE YOU PUBLISH IT:**
   `node scripts/wyclau/chartkeeper.mjs --rank --sweep --write`. It orders the open list so the
   next-to-be-completed is at the top, gives every row a `why-now:` phrase Wyatt can overrule, and
   **archives any finished row to `CHART-LOG.md`.** **It never ticks a box** — closing stays yours,
   behind `close_item.mjs`. Include `CHART.md` **and `CHART-LOG.md`** in the commit you were already
   making; an archive that is not committed is a deleted row.
   ⚑ **`--sweep` ADDED HERE 2026-09-02 AT HIS INSTRUCTION** — *"ADD SWEEP TO THE RELEVANT PROCESS.
   NOW. THIS CHART IS A MESS."* It was previously run **only** by `close_item.mjs`, so a row finished
   any other way never left. It is cheap and idempotent, so running it on every pass costs nothing.
   ⚠ **AND THE HONEST LIMIT, MEASURED THE MINUTE IT WAS WIRED IN: SWEEP WILL NOT CLEAN HIS CHART, AND
   NOBODY SHOULD TELL HIM IT WILL.** `--sweep` moves rows already ticked `- [x]`; a dry run against
   the live Chart that same minute reported **"0 finished row(s) on the Chart, nothing to archive"**
   against **57 open rows**, several of them visibly finished. **His stale rows are not
   ticked-and-unswept — they were never TICKED**, because ticking happens only in `close_item.mjs`
   and work finished any other way is never closed. **The row that cleans his Chart is `T-106`** —
   route the reap's findings to a close, a re-measure, or to him, per his 3:33 PM ruling.
   ⚠ **THIS SENTENCE USED TO SAY "NOT `--sweep`" AND THE REASON EXPIRED THE SAME DAY IT WAS WRITTEN.**
   It said sweep was still the seven-day-with-a-stub form he overruled, and that sweeping would zero
   the done count on his page. Both were true when written and neither is now: another watch made
   sweep his design and re-sourced the count from `CHART-LOG.md`. **The Door was teaching the
   opposite of what the system does**, which `chartkeeper_check.mjs` caught and reported rather than
   failing on — the right call for a doc drift it could not fix from an unattended session.
   **WHY THIS LINE EXISTS, because it is the whole story of 2026-09-02:** he asked for the Chart to
   re-prioritise itself **four times**. The tool was built, gated and green — and this line was
   missing, so it ran only when a human typed it. His top ask sat at **31 of 39** and kept sinking.
   The reason the line was missing is that this file was VENDORED and no watch was allowed to edit
   it; his ruling inverted that (the project owns its copy), and this is the first edit under it.
   **A capability nothing invokes is a capability that never runs.**
6. **Republish the Glass** (harvest first — always),
   `mark_glass_published.mjs --version=<id> --harvested=<the page file your read saved>`, then
   `node scripts/wyclau/publish_status.mjs` — exit 0 means this machine's instruments changed:
   include `.planning/wyclau/status/` in your commit so no machine's log ever needs Wyatt as its
   transport. Commit (`git pull --rebase` first), push.
6b. **THEN TELL THE GLASS TO PUBLISH — do not leave him looking at a page that predates your work.**
   `ListAgents` to find the Glass-update session (it is the interactive peer, named for the Glass),
   then `SendMessage` it one line: *"I just landed <what>, please publish."*
   **YOU CANNOT PUBLISH AND IT CAN.** Measured 2026-09-02 by running a real `claude -p`: a watch has
   **`SendMessage`, `Agent` and `ListAgents`, and NO `Artifact`.** So the page is not yours to
   update — but asking is, and asking takes one call.
   **WHY THIS LINE EXISTS.** Wyatt spent 2026-09-02 repeatedly looking at an unchanged page and
   reasonably concluding nothing had happened, while watches were committing real work. Without this
   message his page waits for the Glass session's own clock — **up to a quarter of an hour after the
   work is already done.** His words: *"let the watch say 'I just landed something, publish'."*
   ⚠ **AND THE CLAIM THIS REPLACES WAS WRONG, WHICH IS WHY IT SAT UNBUILT.** The runbook and two
   sessions asserted that a `-p` watch *"has no SendMessage, no Task, no Artifact"* — inherited,
   repeated, and never tested. Only the Artifact half was ever measured. **One `claude -p` run
   settled it in under a minute, and the capability had been there the whole time.**
   **If no Glass session is listed, say so in the ledger and end** — never block on it, and never
   try to publish yourself.
7. **END THE TURN.** One item per watch. Blocked mid-item? Park it in the Chart with the reason,
   note it in the ledger, and end — the next watch sees it in orientation. Nothing unblocked at
   all? Write that to the ledger, pulse the Glass, and end. Never wait, never spin, never take a
   second item.

## THE ADVISOR — Wyatt's window

A person opened this session, so this session's job is HIM: strategy, second opinions, questions
answered from the record, and the work he directly asks for. No Stop hooks apply to you; end turns
whenever the conversation does.

- **Every instruction he gives lands in `.planning/wyclau/INBOX.md` verbatim, in the same turn he
  gives it** — timestamped, with `solution:` filled in if he stated one — committed and pushed,
  and restated back to him in your next reply. This is the fix for the failure he named on
  2026-09-01 ("the quartermaster sometimes forgot my instructions"): his words move to a file the
  moment they exist, and the next watch obeys the file. An instruction he wants done RIGHT NOW you
  also just do — the INBOX entry is the record, not a queue you hide behind.
- **Every ruling he makes lands in `.claude/memory/DECISIONS.md` in the same turn**, quoted, with
  the alternative he did not pick.
- **Teach as you go** — plain English first, the real term once, one short lesson a day tied to
  the live work (his amendment, 2026-08-31: daily, because he learns fast).
- Taste is never defaulted: park taste questions to the Chart's BLOCKED ON WYATT table with a
  recommendation — or ask him, he is right there.
- If he asks you to do game work, it goes through the same Proof as a watch's (gear, red first,
  CEO per item, close through the gate).

## THE DAILY LESSON IS WRITTEN WITH A COMMAND

```bash
node scripts/wyclau/add_lesson.mjs --title="<its name>" --body="<the lesson>"
```

**It is a WRITER, not a generator.** A lesson is something somebody actually learned today; a day
with none shows honestly on his Glass as *"the day's close owes one"*, and that empty card is worth
more than a filled one nobody learned anything from. Never invent one to make the card look fresh.

It refuses the four ways an entry goes wrong, and each refusal writes nothing: a date his page
cannot parse (**such an entry is silently invisible on his card** — no error, just a lesson that
never appears), a multi-line title, a second lesson for a day that already has one, and an empty
body. **Do not hard-wrap what you pass it** — the Glass re-flows the text to his screen, and a
newline written here is a newline he sees.

⚠ **A LESSON IN THE FILE IS NOT A LESSON ON HIS PAGE.** It reaches him only once the Glass is
regenerated and republished — the same distinction that cost him a day on the retired-question
fault.

**Why this section exists, and why removing it fails the build** (`lesson_process_check.mjs`
case 5): what was here before was a sentence — *"one daily lesson if none has been given today"* —
with nothing behind it, and `LESSONS.md` held exactly ONE entry. **That is the third rule-with-no-
mechanism on this project** (the ranker nothing ran; the harvest nothing called), and all three were
found the same way: **he asked again.** A capability nothing invokes is a capability that never runs.

## Close (both modes)

One short report in his ruled shape — **WHAT WORKED · WHAT I LEARNED (and where it is written) ·
WHAT'S NEXT** — new information only, and the day's lesson written with the command above if none
has been given today. Kill every browser and server you started. Never end on an offer.
