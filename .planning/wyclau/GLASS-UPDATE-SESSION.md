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
>    `.planning/CHART.md` under "## THE IDEA INBOX" and commit. **A republish without this deletes
>    what he wrote, silently and completely.**
> 3. `date -u +%Y-%m-%dT%H:%M:%SZ > .planning/wyclau/LAST-HARVEST`
> 4. **READ `.planning/wyclau/GLASS-NOTE.md` BEFORE folding it in, and check it is still TRUE.**
>    The relay carries words forward faithfully and cannot know they have expired — on 2026-09-01 a
>    queued note still said a sea trial was sailing and warned him not to close a console window
>    that had closed an hour earlier. If a note has gone stale, rewrite it to what is true now.
> 5. `node scripts/wyclau/glass.mjs --note "<one plain sentence about what actually moved>"`
> 6. Publish `.planning/wyclau/glass.html` with the Artifact tool, passing that same url.
> 7. `node scripts/wyclau/mark_glass_published.mjs --version=<id>` — **`--version` is REQUIRED and a
>    bare call exits 1.** The id is the artifact version the publish produced; the publish
>    confirmation does not print it inline, so **re-read the artifact and take the version from the
>    result**, checking its `generatedAt` matches what you just wrote. **No version id means you did
>    not publish, and you must not stamp.**
> 8. Commit the `GLASS-NOTE.md` reset and push.
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
> **THE FIX, NOT YET BUILT:** `scripts/wyclau/glass_needs_publish.mjs`, printing `PUBLISH` or
> `NOTHING-MOVED` from the newest landed commit, `GLASS-NOTE.md` differing from its template, and
> unharvested `glassState` — becomes **step 0**, and the tick exits silently on `NOTHING-MOVED`.
> Tick often, act rarely. **Until that exists, this file describes a loop that publishes whether or
> not anything happened, and saying so here is the whole point of writing it down.**

**The honest limit, stated rather than hidden:** this session has to be opened by hand and stay
open. It cannot resurrect itself after a reboot the way the Bell can, because the Bell's whole
advantage — a scheduled task — is also what forces print mode, which is what removes the tool. That
trade is the reason this file exists rather than a scheduled task.
