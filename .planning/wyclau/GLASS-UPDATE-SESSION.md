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

## The instruction to paste into it

> You are the Glass-update session. Your only job is to keep Wyatt's status page current. Do no
> product work, take no items from the Chart, and never edit game code.
>
> Every time you run, do exactly this, in this order:
>
> 1. `cd C:\Users\wyatt\Projects\pastrypirates` and `git pull --rebase origin claude/cloud-handoff-planning-a9ay1u`
> 2. **HARVEST FIRST.** Read the live page with the Artifact tool, `action: "read"`, url
>    `https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2`. Find its
>    `id="glassState"` block. If `ideas` or `rulings` is non-empty, copy every entry verbatim into
>    `.planning/CHART.md` under "## THE IDEA INBOX" and commit. **THE HARVEST HAPPENS ON EVERY TICK,
>    BEFORE the change-gate below — never after it, and never skipped because nothing "moved". Only
>    this read can see what he typed; no script can.** A republish without this deletes
>    what he wrote, silently and completely.**
> 3. **NOW ASK WHETHER THIS TICK HAS ANYTHING TO SAY:** `node scripts/wyclau/glass_needs_publish.mjs`
>    — exit **10 / `NOTHING-MOVED`** means **END THE TICK HERE, silently.** No publish, no stamp, no
>    commit, no report. Exit **0 / `PUBLISH`** means carry on. (If step 2 found ideas or rulings, you
>    are publishing regardless of what this says — his words landing on the Chart is itself a change.)
> 4. `date -u +%Y-%m-%dT%H:%M:%SZ > .planning/wyclau/LAST-HARVEST`
> 4b. **REAP THE CHART, IN REPORT MODE ONLY:** `node scripts/wyclau/chartkeeper.mjs --reap`
>    — it lists rows whose POINTER is dead: a question he has already answered, a trial report that
>    was never written, a pid that is not running, a build stamp older than the tree. **It changes
>    nothing** (no `--write` here, ever) and **it never ticks a box** — closing is a claim about
>    work and belongs to a watch behind `close_item.mjs`. If it finds anything, put one plain line
>    in the note: *"N tasks on your list look already finished — here's the first."* If it says the
>    Chart is fine, say nothing about it.
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
> 6. `node scripts/wyclau/glass.mjs --note "<one plain sentence about what actually moved>"`
> 7. Publish `.planning/wyclau/glass.html` with the Artifact tool, passing that same url.
> 8. `node scripts/wyclau/mark_glass_published.mjs --version=<id>` — **`--version` is REQUIRED and a
>    bare call exits 1.** The id is the artifact version the publish produced; the publish
>    confirmation does not print it inline, so **re-read the artifact and take the version from the
>    result**, checking its `generatedAt` matches what you just wrote. **No version id means you did
>    not publish, and you must not stamp.**
> 9. Commit the `GLASS-NOTE.md` reset and push.
>
> Then say, in one line, what changed on the page. Nothing else.

## Making it recur without him

Arm ONE recurring mechanism inside the session — a cron job carrying the steps above as its prompt.
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
> **THE FIX, BUILT 2026-09-01 and now step 3 above:** `scripts/wyclau/glass_needs_publish.mjs`
> prints `PUBLISH` (exit 0) or `NOTHING-MOVED` (exit 10) from the newest landed commit across all
> refs and whether a note is queued. **Tick often, act rarely** — the Bell's own shape, which kept
> its 10-minute tick through the redesign and simply asks a truthful question before acting.
>
> **RED-PROOFED IN BOTH DIRECTIONS before it was trusted**, because a check that can only say one
> thing is the exact fault this file's step 8 was fixed for: with the stamp pointed at the current
> commit it said `NOTHING-MOVED`; with a note queued it flipped to `PUBLISH`. Gate:
> `scripts/qa/glass_needs_publish_check.mjs`, wired into `npm test` (90 gates).
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
