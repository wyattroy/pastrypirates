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
> 7. `node scripts/wyclau/mark_glass_published.mjs`
> 8. Commit the `GLASS-NOTE.md` reset and push.
>
> Then say, in one line, what changed on the page. Nothing else.

## Making it recur without him

Run `/loop 15m` with that instruction inside the session. The loop keeps a live interactive session
doing the above on an interval, which is exactly the terminal the relay lacks.

**The honest limit, stated rather than hidden:** this session has to be opened by hand and stay
open. It cannot resurrect itself after a reboot the way the Bell can, because the Bell's whole
advantage — a scheduled task — is also what forces print mode, which is what removes the tool. That
trade is the reason this file exists rather than a scheduled task.
