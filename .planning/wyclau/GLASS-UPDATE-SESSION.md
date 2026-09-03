# The Glass-update session — Wyatt's design, 2026-09-01

**His words:** *"could we just start an interactive session, once, called Glass update, that is fed
a clear instruction, updates the glass with whatever it needs to, then clears itself afterwards?"*

**Yes — and it is the only shape that works on this machine.** Measured 2026-09-01: a watch
(`claude -p`, how `bell.ps1` starts every one) cannot publish. It searches for the Artifact tool
and finds nothing, and its own prompt shows the harness withholding the name. An INTERACTIVE
session has the tool, and so does every subagent under it. So the publisher must be interactive,
and it must be started by a person — this is the one job that cannot be automated from inside the
relay.

## Why this is the missing half of a design that already exists

`glass.mjs:89-98` already states the ONE PUBLISHER rule: *any session, on any machine, writes to
`GLASS-NOTE.md` by committing, rather than publishing the Glass itself.* That is sound. Its
"something else" was **the next watch** — a relay with no terminal, because no watch here can
publish. This session IS the terminal.

> ## ⚑ EACH TICK RUNS IN A FRESH SUBAGENT. THE SESSION ITSELF STAYS EMPTY.
> ### His instruction, 2026-09-02 — and it is the SECOND time, because the first is quoted at the top of this file.
>
> *"make sure that Glass Update Session gets cleared between ticks or updates or whatever you call
> its tasks -- we don't want to keep adding to its context, that's unnecessary"*
>
> **His original design already said it** — *"…updates the glass with whatever it needs to, **then
> clears itself afterwards**"* — **and this document was written from that sentence and then
> specified a mechanism that cannot do its last four words.**
>
> **MEASURED, from `CronCreate`'s own contract rather than assumed:** it *"schedules a prompt to be
> **enqueued**"* and *"jobs live only in this Claude session."* So under the old shape every tick
> appended a full transcript — including a **~100KB read of the live artifact** — to one
> conversation that never reset. Ticking all night, the session carries every copy of that page.
>
> **WHY THIS IS WORSE HERE THAN ANYWHERE ELSE.** Wyatt, 2026-08-28: a session that fills its context
> *"gets stupid and stale, and by the time it does, it is too late to notice."* **This is the one
> session that can destroy his writing** — step 2 below is the only thing standing between a
> republish and deleting what he typed into the Ideas box. A degrading context is least affordable
> exactly there.
>
> **TWO OBVIOUS FIXES THAT DO NOT WORK, so nobody re-proposes them:** `/clear` is a UI command and a
> cron-enqueued prompt cannot type it. Restarting as `claude -p` is how the Bell runs a Watch, and a
> `-p` session **has no Artifact tool on this machine** — which is the whole reason this publisher
> is interactive and hand-started (see the section above).
>
> ### THE SHAPE: THE SESSION BECOMES A DISPATCHER, NOT A WORKER.
>
> The cron prompt is now one line — **"run one Glass tick"** — and the session's only job is to
> **spawn a fresh general-purpose subagent carrying the nine steps below as its whole prompt.** The
> subagent harvests, gates, publishes, stamps, commits, and **returns ONE LINE.** The session's
> context grows by that one line per tick instead of a full transcript.
>
> **A fresh subagent per tick IS "clears itself afterwards"** — it is the only mechanism available
> here that starts clean and still holds the Artifact tool.
>
> **MEASURED 2026-09-02, because the whole design rests on it:** a general-purpose subagent under an
> interactive session **has `Artifact` in its tool list**, and a live `action: "list"` call returned
> real data. ⚠ **PUBLISH ITSELF WAS NOT DEMONSTRATED, ONLY READ** — the schema is live and the read
> path works, and publishing is inferred from that. **So the FIRST tick under this shape must check
> it and say so:** if the subagent's publish fails for want of the tool, it reports that in its one
> line and the session publishes that tick itself, in the main context, and this box gets corrected.
> **Do not let an inferred capability quietly become a stated one.**
>
> **✅ CONFIRMED, 2026-09-02T04:46Z, on the first dispatched tick under this shape.** A
> general-purpose subagent, given exactly the nine steps above as its entire prompt, harvested a new
> idea, ran the reap, regenerated the note, **published `glass.html` via the Artifact tool, re-read
> it to confirm `generatedAt`, and ran `mark_glass_published.mjs --version=<id>` successfully** —
> `LAST-PUBLISH` shows a real version and commit from that run
> (`version=1788324379-6b86 commit=4e96e6b6`). No fallback to the main context was needed. **The
> caveat above is now closed: publish from a subagent works, not merely inferred.**
>
> **ONE PUBLISHER IS UNCHANGED** — one subagent per tick, never two. The rule was never about which
> context does the publishing; it was about there being exactly one.

> ## ⚑ FIRST ACTION AFTER A `/clear`: RUN `CronList` AND READ THE ARMED JOB'S PROMPT.
>
> **Wyatt clears this session deliberately — that is the design, not an accident.** The moment he
> does, everything the session was told is gone, **including any instruction to check on itself.**
>
> **THIS BOX EXISTS BECAUSE THAT EXACT HOLE OPENED ON 2026-09-02.** A session was told *"after he
> clears you, run `CronList` and re-arm if empty"* — **and the clear erased the instruction before
> it could be acted on.** The advice was correct and unreachable, which is the same thing as wrong.
> **Anything the next context needs must be HERE, not in a message.** That is the whole reason the
> dispatcher shape points at this file instead of carrying steps in a prompt.
>
> **WHY IT MATTERS:** cron jobs are session-only and documented as gone *"when Claude exits"* —
> which names **exit**, not **clear**, and those are not obviously the same event. **If the job did
> not survive, the Glass silently stops updating and Wyatt gets a frozen page with no signal that it
> froze** — the precise failure this whole subsystem exists to prevent.
>
> ### ⚠ AND PRESENCE IS NOT SHAPE — CHECK THE PROMPT, NOT JUST THAT A JOB EXISTS
>
> **This box used to say only that if a dispatcher job was listed, there was nothing to do.**
> **A job armed with the OLD nine-step prompt is also listed.** So a reader following that
> instruction would see a job, do nothing, and leave the fat-context shape running — Wyatt's ask
> (`INBOX-20260902T05xxZ-a`, and it is the second time he asked) silently unmet while every
> document in the chain says it is done. **Committed is not delivered, and a presence check cannot
> tell the two apart.** Nothing outside this session can read a cron job's prompt, so this reader
> is the only one who can ever check it.
>
> **DO NOT REASON ABOUT WHICH IT IS. MEASURE IT — it is a two-second check that is right either way:**
>
> 1. `CronList`. **Read the armed job's PROMPT, not merely that a job is listed.**
> 2. **Compare it to the dispatcher line in *"Making it recur without him"* below.** It should be
>    the short pointer — *run one Glass tick, spawn a FRESH subagent, give it the steps from this
>    file*. **If it carries the steps themselves, that is the old fat-context shape: `CronDelete`
>    it and re-arm with the dispatcher line.** Same repair if `CronList` comes back empty.
> 3. To arm or re-arm: `CronCreate` — cron `*/15 * * * *`, recurring — with the dispatcher prompt
>    from *"Making it recur without him"* below, and nothing else in it.
> 4. **Say which of the three happened, in one line** — armed and correctly shaped, armed with the
>    wrong prompt and replaced, or empty and armed — and record it in this box, so the next reader
>    inherits a measurement instead of the question.
>
> **Held by `scripts/qa/glass_session_thin_check.mjs`**, which fails the build if this box goes
> back to checking presence alone, if the dispatcher line stops pointing at this file, or if the
> steps get inlined into the cron prompt again. It cannot see the live job — only you can, at
> step 1. That division is the point, and it is stated in the gate's own header.
>
> ### ✅ MEASURED 2026-09-02, AND THE ANSWER IS: THE CRON SURVIVES A `/clear`.
>
> Wyatt cleared the session; `CronList` immediately afterwards showed job **`b2a4d78d` still armed,
> `*/15`, carrying the same dispatcher prompt.** No re-arm was needed. The session PROCESS survived
> too — still reporting as started 7h earlier and still reachable — **though its listed name had
> changed to *"Glass update"*, which matters if you are trying to message it and a message under the
> old name bounces.**
>
> ⚠ **KEEP THE SCOPE HONEST, AND STILL RUN THE CHECK.** That is **one observation, one machine, one
> clear** — it is not a law about `/clear`, and the session that measured it said so itself rather
> than overclaiming. `CronList` costs two seconds and the downside of skipping it is a status page
> that stops updating without saying so. **Run it anyway; if it ever comes back empty, correct this
> box rather than assuming the run was odd.**

## The instruction to paste into it

> You are the Glass-update session. Your only job is to keep Wyatt's status page current. Do no
> product work, take no items from the Chart, and never edit game code.
>
> Every time you run, do exactly this, in this order:
>
> 1. `cd C:\Users\wyatt\Projects\pastrypirates` and `git pull --rebase origin claude/cloud-handoff-planning-a9ay1u`
> 2. **HARVEST FIRST.** Read the live page with the Artifact tool, `action: "read"`, url
>    `https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2`. Find its
>    `id="glassState"` block. If `ideas`, `rulings` **or `comments`** is non-empty, copy every entry
>    verbatim into `.planning/CHART.md` under "## THE IDEA INBOX" and commit. **THE HARVEST HAPPENS ON EVERY TICK,
>    BEFORE the change-gate below — never after it, and never skipped because nothing "moved". Only
>    this read can see what he typed; no script can.** A republish without this deletes
>    what he wrote, silently and completely.**
>    ⚑ **`comments` IS NEW (2026-09-03, `T-076` — his per-item comment box) AND IT IS THE FOURTH
>    THING ON THIS PAGE THAT IS HIS AND IS LOST BY AN UNHARVESTED REPUBLISH, NOT THE THIRD.**
>    Shape: `{"T-nnn": [{"text": "…", "at": "…"}]}` — keyed by the row's handle, so a comment
>    survives the row being re-ranked, dragged or re-worded. **Copy each comment onto its own row in
>    the Chart** (the handle tells you which row), quoted verbatim like any of his words. A comment
>    is him talking about a SPECIFIC item, so filing it as a loose idea loses the half that matters.
>    ⚑ **AND IF AN IDEA CARRIES `"now": true`, HE PRESSED DO NOW ON IT. Carry the row over as
>    normal, then run ONE MORE COMMAND — the flag does not travel by itself:**
>    `node scripts/wyclau/chartkeeper.mjs --do-now=<the T-nnn of the row you just wrote>`
>    That command puts his row at the top of RANK and RELEASES whatever was pinned before, in the
>    same act, because his design is one slot and not a queue. **A pin you copy as prose is a pin
>    that reaches nothing** — RANK reads the `now: yes` field the command writes, and nothing else.
>    (`T-104`, his words: *"Add a 'DO now' button next to 'Send to the Chart' button that tells RANK
>    to put this task at the top"*. The button is the easy half; this line is the joint.)
>    ⚑ **AND IF `order` IS NOT NULL, HE DRAGGED HIS TASK LIST INTO A NEW SEQUENCE. Same joint, same
>    shape — the drag does not travel by itself either:**
>    `node scripts/wyclau/chartkeeper.mjs --order=<the handles in glassState.order.handles, comma-separated, in that exact sequence>`
>    ⚠ **AND THEN, IN THE SAME BREATH, RE-RANK — OR HIS PAGE DOES NOT MOVE AND HE IS RIGHT TO THINK
>    NOTHING HAPPENED:**
>    `node scripts/wyclau/chartkeeper.mjs --rank --write`
>    **Measured, not assumed (CEO 131):** `--order=` writes the numbers onto the rows and stops; the
>    Glass draws its Tasks card in the order the rows physically sit in `CHART.md`. Without the
>    re-rank the page regenerates in the OLD order with his order recorded invisibly beneath it —
>    *"PAGE MOVED? NO"*. The same is true of `--do-now`. **Two commands, one act; never the first
>    without the second.**
>    That first command writes his sequence onto those rows and **clears the previous order in the
>    same act** — one order, replaced whole, never merged, so the list is never half his and half ours.
>    It REFUSES outright, writing nothing, if any handle names no open row or names two of them.
>    **Copy the handles, never the row text** — the page truncates and de-shouts a title for him, so
>    the text on his screen is not the row's name. To put the list back on its derived ranking:
>    `node scripts/wyclau/chartkeeper.mjs --order-clear`
>    (`T-103`, his words: *"DO NOW: build a way for me to drag to reprioritize the chart, in The
>    Glass."* His pin still outranks his drag — the pin is the later, sharper act.)
> 2b. ⚑ **AND FOR EVERY KEY IN `rulings`, RETIRE THE QUESTION. YOU DO NOT HAVE TO REMEMBER THIS ANY
>    MORE — STEP 4's STAMP DOES IT, AND REFUSES TO STAMP IF YOU SKIP IT.** Carry each ruling's key
>    and his words into step 4 as a `--retire=` pair and the retirement happens in the same act as
>    the receipt. **This step is now a description of what step 4 does, not a command you must
>    remember to type.**
>    A ruling that arrives OUTSIDE a harvest — he says it to a session directly — still has its own
>    way in, and it is the same act underneath (`scripts/wyclau/lib/retire.mjs`):
>    `node scripts/wyclau/retire_answered.mjs --qid=<the ruling's key> --verdict="<his words, verbatim>"`
>    Either way it writes the ruling into `## RULED` **and deletes the question from
>    `## BLOCKED ON WYATT`**, in one write, so the two can never disagree. Then commit both halves
>    together with step 2's copy.
>    ⚑ **WHY THIS MOVED, 2026-09-03 (`T-090` gap (a), CEO 125's residual): NOTHING CALLED IT.** The
>    spec asks for retirement *"run by the harvest… not a session following a runbook step"*, and
>    what shipped was a command a session types from a runbook step — this one. **A step you can walk
>    past is what walked past six times.** The stamp cannot be walked past.
>    ⚠ **WHY THIS LINE EXISTS, AND IT IS THE ONE FAULT HE HAS REPORTED SIX TIMES IN TWELVE HOURS.**
>    Harvesting his answer WRITES the ruling and DELETES NOTHING, so his page goes on asking a
>    question he has already answered. His words, 2026-09-02 6:57 PM ET: *"the page continues to
>    re-show me thw e questions AFTER they're harvested. this is NOT fixed and it is a PRIORITY more
>    than any of the SEO work."* And earlier, with a screenshot: *"I already answered both of these
>    about 15 minutes ago. Please tell me why the page still shows them."*
>    ⚠ **THE 22:5xZ TICK IS WHY THIS IS A COMMAND AND NOT A REMINDER.** It wrote *"all five
>    rules-page questions in the Your Call table above are now answered"* into its own commit **and
>    left all five asking**, because *"this session's mandate is harvest-and-publish only."* It
>    detected the exact condition and had no authority to act on it. **This line is that authority.**
>    Gate: `scripts/qa/answered_question_retired_check.mjs` fails the build if a question that
>    already carries a ruling is still a live row.
> 3. **NOW ASK WHETHER THIS TICK HAS ANYTHING TO SAY. THIS COMMAND RUNS ON EVERY TICK, WITHOUT
>    EXCEPTION:** `node scripts/wyclau/glass_gate_log.mjs`
>    — and **if step 2 found ideas or rulings, run it as
>    `node scripts/wyclau/glass_gate_log.mjs --harvested`** instead.
>    Exit **10 / `NOTHING-MOVED`** means **END THE TICK HERE, silently** — no publish, no stamp, no
>    commit, no report. Exit **0 / `PUBLISH`** means carry on. Under `--harvested` the exit is always
>    0, because his words landing on the Chart is itself a change.
>
>    ⚠ **THE HARVEST OVERRIDES THE ACTION, NEVER THE CHECK — `INBOX-20260902T0120Z`.** The old
>    wording here let a tick decide the answer was moot and not ask at all, and on 2026-09-02T01:02Z
>    one did. The publish was right; the missing verdict was not. **From outside, a tick that skipped
>    the gate and a tick where the gate is not wired in at all look identical** — `npm test` is green
>    either way. `glass_gate_log.mjs` wraps `glass_needs_publish.mjs`, appends one line to
>    `.planning/wyclau/GATE-LOG` every single run, and hands back the gate's own exit code, so what
>    the check said is on the record whether or not it decided anything. It is machine-local by
>    design — a tracked log line committed beside the note reset would revive the echo tick.
>    Gate: `scripts/qa/glass_gate_verdict_logged_check.mjs`.
> 4. **STAMP WHAT YOU READ, NOT WHEN YOU LOOKED — AND RETIRE HIS ANSWERED QUESTIONS IN THE SAME
>    BREATH:**
>    `node scripts/wyclau/mark_glass_harvest.mjs --version=<…> --rulings=<keys, or the word none>`
>    — add `--ideas=<ids>` if step 2 carried ideas across. **A bare call is refused**, the same way
>    `mark_glass_published.mjs` refuses one.
>    ⚑ **`--rulings=` IS NOT OPTIONAL. A tick that carried none of his answers writes
>    `--rulings=none`** — declaring nothing and saying nothing are different sentences, and only one
>    of them can be audited. (A `--retire=` pair below counts as the declaration on its own.)
>
>    ⚑ **AND FOR EVERY RULING HE MADE, ADD A `--retire=` PAIR. IT IS REPEATABLE:**
>    `--retire=<the ruling's key>::<his words, verbatim>`
>    The stamp retires each question — his answer into `## RULED`, the row out of
>    `## BLOCKED ON WYATT` — and writes the receipt, **as one act**. If any pair is wrong it writes
>    NOTHING: not the Chart, not the receipt.
>    ⚠ **AND IF YOU PASS `--rulings=<key>` FOR A QUESTION THAT IS STILL ASKING HIM AND GIVE NO
>    VERDICT, THE STAMP REFUSES** and prints the exact `--retire=` line to add. That refusal is the
>    fix for the fault he reported six times in twelve hours: *"the page continues to re-show me thw
>    e questions AFTER they're harvested."* **You cannot record a harvest that leaves his page asking
>    a question he has answered.**
>
>    ⚠ **THIS USED TO BE `date -u … > LAST-HARVEST`, AND WYATT RETIRED IT IN ONE SENTENCE**
>    (2026-09-02, `T-105`): *"the harvest stamp records when a session looked. It is not evidence
>    the page hasn't changed since. Your page carries its own version number — that's the fact that
>    can answer 'is a republish safe?', and a clock never can."* **It is not a theory: on 2026-09-02
>    this tick harvested at 3:07:08 PM and found nothing, his first idea landed at 3:07:15 PM, six
>    more followed, and the stamp then read "fresh" for thirty minutes.** Seven ideas survived by
>    luck of ordering.
> 4b. **SWEEP, THEN REAP.** `node scripts/wyclau/chartkeeper.mjs --sweep --write` — archives any
>    finished row to `CHART-LOG.md` so it leaves his page; commit `CHART.md` AND `CHART-LOG.md`.
>    ⛑ **ADDED 2026-09-02 AT HIS INSTRUCTION** — *"ADD SWEEP TO THE RELEVANT PROCESS. NOW. THIS
>    CHART IS A MESS."* Sweep ran **only** inside `close_item.mjs` before this, so a row finished
>    any other way never left. It is idempotent and costs nothing on a tick with nothing to move.
>    ⚠ **AND IT WILL NOT CLEAN HIS CHART BY ITSELF — measured the minute it was wired in:** a dry
>    run reported **"0 finished row(s), nothing to archive"** against **57 open rows**, several
>    visibly finished. Sweep moves rows already ticked `- [x]`; **his stale rows were never
>    TICKED**, because only `close_item.mjs` ticks. **Do not report a swept Chart as a clean one.**
> 4c. **THEN REAP, IN REPORT MODE ONLY:** `node scripts/wyclau/chartkeeper.mjs --reap`
>    — it lists rows whose POINTER is dead: a question he has already answered, a trial report that
>    was never written, a pid that is not running, a build stamp older than the tree. **It changes
>    nothing** (no `--write` here, ever) and **it never ticks a box** — closing is a claim about
>    work and belongs to a watch behind `close_item.mjs`. If it finds anything, **copy its
>    `FOR THE NOTE` block into the note verbatim — one line per kind, and do not summarise them
>    into one.** If it says the Chart is fine, say nothing about it.
>
>    ⚠ **THIS STEP USED TO ASK YOU TO COMPOSE THAT LINE YOURSELF, AND THAT IS WHAT WENT WRONG.**
>    It said: put one plain line in the note, *"N tasks on your list look already finished — here's
>    the first."* Measured 2026-09-02T20:0xZ, `T-090`: ten rows carried that sentence on his page
>    and **not one of them was flagged "finished."** Six had evidence that went stale when the build
>    moved on — those need RE-MEASURING, which is a watch's job and mostly a screenshot, and he
>    cannot possibly answer them from a phone. Three were rows his own ruling had freed. One cited a
>    dead pid. **He read that line, believed it, and proposed sending all ten back to himself for
>    approval** — and the Advisor repeated the same wrong sentence to his face. **A flag that means
>    three things cannot be acted on by anybody.** The tool now writes the sentences, one per kind,
>    each naming whose job it is; a human turning that list back into one line re-creates the fault.
>    **WHY REAPING LIVES HERE AND RANKING LIVES IN THE WATCH:** ranking is arithmetic and can act
>    unattended; reaping is a JUDGEMENT about whether something *he* is waiting on has landed, and a
>    judgement belongs where a human is looking. This is the session that reads his live page.
>    *(The audit that earned this: five of his 29 open tasks were already finished, 17% of what he
>    reads, and one of them had been actionable for four hours because he ruled YES and nobody moved
>    the row. `.planning/SPEC-CHARTKEEPER.md`.)*
>
> 5. **READ `.planning/wyclau/GLASS-NOTE.md` BEFORE folding it in, and check it is still TRUE.**
>    The relay carries words forward faithfully and cannot know they have expired — on 2026-09-01 a
>    queued note still said a sea trial was sailing and warned him not to close a console window
>    that had closed an hour earlier. If a note has gone stale, rewrite it to what is true now.
> 6. `node scripts/wyclau/glass.mjs --consume-note --note "<one plain sentence about what actually moved>"
>    ⛔ **`--consume-note` IS REQUIRED HERE AND NOWHERE ELSE, 2026-09-02.** Without it the note is
>    folded into the page and LEFT IN THE FILE. His instruction: *"make sure nothing can destroy my
>    writing."* Clearing his queued note used to happen on EVERY run of `glass.mjs`, so a gate, a probe
>    or a session regenerating the page to look at it consumed it — measured with a sentinel through
>    `npm test`, which ate it, and five gates were named. **This step is the only place that may clear
>    it, and only because it has just published it.**`
> 6b. **RE-READ THE LIVE PAGE AND COMPARE ITS VERSION TO YOUR RECEIPT — IN THE SAME BREATH AS THE
>    PUBLISH, NOT BACK AT STEP 2.** `Artifact action:"read"` the same url, and compare the version
>    it returns with `artifactVersion` in `.planning/wyclau/LAST-HARVEST`.
>    - **Same version → nothing changed under you. Publish.**
>    - **Different version → HE WROTE SOMETHING (or another session published).** Go back to step 2:
>      harvest what is new, commit it, re-stamp with the new version, then come back here.
>
>    **WHY THIS STEP EXISTS AND WHY IT IS HERE RATHER THAN EARLIER.** Steps 3 to 6 are minutes of
>    real work — a gate, a reap, a staleness judgement, a page regeneration. **So even a perfectly
>    executed tick has a multi-minute gap between the only moment his words are observed and the
>    moment they can be destroyed.** The incident that earned the whole of `T-105` used seven
>    seconds of that gap. A guard that runs before minutes of unrelated work is a guard about the
>    past. `.planning/SPEC-GLASS-HARVEST-SAFETY.md` §3.
>
> 7. Publish `.planning/wyclau/glass.html` with the Artifact tool, passing that same url.
>    ⚠ **NEVER PASS `force`. NOT ONCE, NOT TO GET PAST A CONFLICT.** A publish is tracked against
>    the version you last read, and a publish over a NEWER version is refused and hands you the live
>    content back — the platform fails closed, which almost nothing else here does. **A conflict is
>    not an obstacle. It is the system telling you he wrote something.** On conflict: re-read,
>    harvest what is new, then publish. `force` is the single flag that turns that refusal off, and
>    it is the only way left to lose his writing at this step.
>    *(The refusal is read from the tool's documented contract and from the conflict notifications
>    this page produces in practice; a controlled live test has not been run —
>    `INBOX.md`, `INBOX-20260902T192000Z`. Refusing `force` is right either way.)*
> 8. `node scripts/wyclau/mark_glass_published.mjs --version=<id>` — **`--version` is REQUIRED and a
>    bare call exits 1.** The id is the artifact version the publish produced; the publish
>    confirmation does not print it inline, so **re-read the artifact and take the version from the
>    result**, checking its `generatedAt` matches what you just wrote. **No version id means you did
>    not publish, and you must not stamp.**
> 9. Commit the `GLASS-NOTE.md` reset and push.
>
> Then say, in one line, what changed on the page. Nothing else.

## Making it recur without him

Arm ONE recurring mechanism inside the session — a cron job whose prompt is **the dispatcher line,
not the steps**:

> Run one Glass tick. Spawn a FRESH general-purpose subagent and give it the nine steps from
> `.planning/wyclau/GLASS-UPDATE-SESSION.md` as its entire prompt. Do not do the work yourself and
> do not read the artifact in this context — the whole point is that this session stays empty.
> When it returns, print its one line and nothing else.

**The steps stay in this file rather than in the cron prompt**, which is the other half of keeping
the session thin: a prompt that carries nine steps carries them into the context on every fire.
A prompt that carries a POINTER carries nothing.

**And it means the runbook can be edited without re-arming the cron** — the subagent reads this file
at spawn time, so a correction here reaches the next tick. Under the old shape the steps were frozen
into a cron prompt set hours earlier, which is its own version of the staleness this file's step 5
warns about.

**One publisher, never two.** `glass.mjs` records what two cost, measured the same day it was
written: *the Razer engine and a second session both published within five minutes, and the
platform's own conflict guard fired three times.* An earlier version of this file said `/loop 15m`
**as well**, which would have been that fault in writing.

> ### ⚠ THE STEPS ABOVE PUBLISH ON EVERY TICK, AND THAT IS A KNOWN DEFECT, NOT THE DESIGN
>
> Wyatt, 2026-09-01: *"i think it violates past learnings in multiple ways regarding timers"* — and
> a CEO audit upheld him. `bell.ps1:9-13` records that the previous watchdog's judgement stack
> *"guessed wrong in both directions … and is DELETED, not tuned"*, replaced by one question the OS
> answers truthfully. **The tick itself is fine — the Bell has one and it survived that redesign.
> What is wrong is acting unconditionally.** Everything on the page is DERIVED (`glass.mjs:14`), so
> a truthful question is available — *did an input actually move?* — and a fixed cadence declines to
> ask it 96 times a day. That matters beyond waste: step 2 is the only thing standing between a
> republish and deleting what Wyatt typed, and a clock multiplies the unattended chances to skip it.
>
> **THE FIX, BUILT 2026-09-01:** `scripts/wyclau/glass_needs_publish.mjs` prints `PUBLISH` (exit 0)
> or `NOTHING-MOVED` (exit 10) from the newest landed commit across all refs and whether a note is
> queued. **Tick often, act rarely** — the Bell's own shape, which kept its 10-minute tick through
> the redesign and simply asks a truthful question before acting.
>
> ⚠ **DO NOT RUN IT DIRECTLY — STEP 3 IS THE WRAPPER, `glass_gate_log.mjs`, AND HAS BEEN SINCE
> 2026-09-02.** This box used to say "and now step 3 above" beside the raw gate's name, and CEO 100
> found it: a reader reaching this box first would run the bare gate by hand, which leaves no line
> in `GATE-LOG` — the exact hole `INBOX-20260902T0120Z` was raised to close, re-opened by a stale
> sentence two hundred lines below the step it contradicted. **A pointer that goes stale inside the
> document it points into is this project's most-repeated fault.**
>
> **RED-PROOFED IN BOTH DIRECTIONS before it was trusted**, because a check that can only say one
> thing is the exact fault this file's step 8 was fixed for: with the stamp pointed at the current
> commit it said `NOTHING-MOVED`; with a note queued it flipped to `PUBLISH`. Gate:
> `scripts/qa/glass_needs_publish_check.mjs`, wired into `npm test` — as is
> `scripts/qa/glass_gate_verdict_logged_check.mjs`, which holds step 3 to the shape above.
> *(This line used to carry a hand-typed gate count. It was wrong within a day — the number lives in
> `package.json`'s `gates` object and nowhere else, which is the only place it can be right.)*
>
> **EVERY DOUBT RESOLVES TO PUBLISH** — a missing stamp, an unparseable one, a git that will not
> answer, an unreadable note file. A broken input must never be able to SUPPRESS a publish, because
> the failure mode of a missed publish is Wyatt reading a frozen page, which is the bug this whole
> subsystem exists to prevent.
>
> **AND IT CANNOT SEE THE LIVE PAGE.** Ideas he types live only in the artifact until a session
> copies them out, and only a session holding the Artifact tool can read them. That is why the
> harvest is step 2 and this is step 3, in that order, always.

**The honest limit, stated rather than hidden:** this session has to be opened by hand and stay
open. It cannot resurrect itself after a reboot the way the Bell can, because the Bell's whole
advantage — a scheduled task — is also what forces print mode, which is what removes the tool. That
trade is the reason this file exists rather than a scheduled task.
