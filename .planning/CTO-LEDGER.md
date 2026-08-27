# CTO ledger — what the marathon worker has actually done

**APPEND ONLY. Newest at the BOTTOM. Never edit an entry.**

This file is the CTO's progress record. `.planning/BACKLOG.md` is the MANDATE (what may be worked
on); this is the STATE (what has happened to each item). Two files, two jobs — a status column
inside the backlog would mean the mandate and the progress rot together.

**Nothing here is hand-counted.** `scripts/qa/cto_supervise.mjs` derives every number from these
entries — items done, items in flight, how long the current one has been running. The project's own
convention: *never hand-type a number that can be counted.*

## The format — one line per event, four fields

```
<ISO8601>  <ITEM-ID>  <STATE>  <one line of what happened>
```

**STATE is one of:** `START` · `DONE` · `BLOCKED` · `PARKED` · `ABANDONED` · `REVERTED` · `HEARTBEAT`

- `START` — work began. The supervisor measures staleness from the newest START with no matching close.
- `DONE` — finished AND verified AND a CEO verdict is in `.planning/CEO-REVIEWS.md`. **All three, or it is not DONE.**
- `BLOCKED` — cannot proceed for a mechanical reason (a gate fails, a tool is missing). Names the blocker.
- `PARKED` — needs Wyatt. The question goes in `.planning/CTO-QUESTIONS.md`. **Taste never times out.**
- `ABANDONED` — started, then dropped. Must say why. An item that silently stops is the failure this state exists to make visible.
- `REVERTED` — a CEO verdict said NOT DONE and the commit was backed out. **This is a success of the process, not a failure of it.**
- `HEARTBEAT` — "I am alive and working on <ID>". Written at least every 20 minutes during a work
  session, so the supervisor can tell a slow item from a dead worker. **Without this, a stuck CTO
  and a busy CTO look identical** — and the whole reason the shift worker exists is to tell them apart.

## Entries

2026-08-27T00:00:00Z  BOOTSTRAP  HEARTBEAT  ledger created; no CTO has run yet
2026-08-27T18:54:55Z  W0-1  START  cloud CTO session begins; Wave 0 depth-first, all three items end to end
2026-08-27T18:55:57Z  W0-1  HEARTBEAT  cloud QA question ANSWERED: playwright npm pkg installs (19MB, ~/.pw) but the WebKit BROWSER download is 403-blocked by the egress proxy (cdn.playwright.dev, playwright.download.prss.microsoft.com). No webkit on disk anywhere. Both -wk legs WILL be NOT-RUN in cloud.
2026-08-27T19:01:23Z  W0-1  HEARTBEAT  code done: devHost widened to staging, ?bake2=1 and ?endcard=1 added, precedence chain converged. New gate dev_flag_gate_check.js went RED->GREEN. npm test 20 gates exit 0. Next: DRIVE it, a green suite proves nothing about what he sees.
2026-08-27T19:11:01Z  W0-1  HEARTBEAT  probe caught my own bug: ?endcard=1 sat behind the turn-order intro s parrot Start button and never fired. Moved the skip BEFORE the intro. bake2 verified working (attempts=1, 2 of 5 locked, red-proof held). W0-2 shipped. W0-3 next.
2026-08-27T19:16:41Z  W0-1  HEARTBEAT  Wave 0 committed (0468e838). endcard verified on screen with same-run red-proof; screenshot read. FULL sea trial launched in background. Next: verify the attempt-2 LABEL renders, then CEO.
2026-08-27T19:19:22Z  W0-1  HEARTBEAT  sea trial re-launched with the gear DERIVED (the first run forced it, which makes the report self-describe as weaker evidence). CEO spawned fresh. Reaped 28 stray chromium procs; note for the record: pkill -f chromium kills this session s own shell because the wrapper exports CHROME_BIN.
