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
2026-08-27T19:30:39Z  W0-1  HEARTBEAT  PUBLISHED to staging (rsync was a THIRD cloud blocker - not installed; installed the real tool rather than hand-rolling the sync). Waiting on Pages rebuild + the FULL sea trial.
2026-08-27T19:32:15Z  W0-1  HEARTBEAT  publish VERIFIED via the staging repo (stamp 2026.08.27.3-staging@c9ce605e, [STAGING] title, CNAME still the subdomain). Pages rebuild NOT verifiable from here - staging host is not on the container egress allowlist. Reporting to Wyatt; sea trial still sailing, lock still held.
2026-08-27T19:47:54Z  W2-4  START  coordinator takes flow.js (money explicit at the dock) while 4 agents work disjoint files: index.html, panel.js, util.js, engine/index.js
2026-08-27T19:47:54Z  W2-4  HEARTBEAT  RED->GREEN, red-proofed against the original. FINDING for the record: W2-3's premise is FALSE - "haulin' crates" does not exist anywhere in src/; util.js already says "workin' the docks". Told the agent to refute or confirm rather than invent a change.
2026-08-27T19:47:54Z  W2-4  HEARTBEAT  HAZARD I created and got away with: ran git stash/pop to red-proof while 4 agents were editing the SAME tree. Nothing was lost (stash list empty, all 4 files still modified, npm test 0) but it could have swallowed their in-flight work. Red-proof against `git show HEAD:<file>` instead, never by stashing a shared tree.
2026-08-27T19:48:38Z  W2-3  HEARTBEAT  CORRECTION, IN THE OPEN (rule 6). My 19:47 entry said "haulin' crates does not exist anywhere in src/" and called W2-3's premise FALSE. Wyatt said he had just read it. HE IS RIGHT. It is LIVE ON PRODUCTION: origin/main:src/ui/util.js:770,773, the exact lines the backlog cites. My grep was of the WORKING BRANCH, which is 30+ commits ahead and already says "workin' the docks". I checked one tree and said "anywhere".
2026-08-27T19:48:38Z  W2-3  HEARTBEAT  THE GENERAL LESSON, worth more than the item: HE PLAYS PRODUCTION; WE READ THE BRANCH. Any of his 32 backlog items may already be fixed on aug26-night-fixes and simply unshipped. Grepping the branch to decide whether a defect is real answers a different question than the one he asked. Check origin/main too, always.
2026-08-27T19:49:08Z  W2-3  HEARTBEAT  CORRECTING MY OWN CORRECTION. Both my earlier entries were wrong. "haulin' crates" WAS at HEAD:src/ui/util.js:770,773 (and on origin/main). The W2-3 agent had already fixed it in the working tree SECONDS before I grepped, so my grep raced its edit. Wyatt was right, the agent was right, and my second explanation ("only live on production") was wrong too - it was on HEAD as well.
2026-08-27T19:49:08Z  W2-3  HEARTBEAT  THE REAL LESSON: in a shared tree with live agents, grepping the WORKING TREE measures a moving target. Read `git show HEAD:<file>` for a stable baseline before calling a reported defect false. This is rule 6 again - I condemned a check (his report) instead of suspecting my instrument.
