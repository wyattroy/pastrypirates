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
2026-08-27T19:50:59Z  W2-2  DONE-PENDING-CEO  black-market line is his sentence verbatim; price derived from cfg.blackMarket
2026-08-27T19:50:59Z  W2-3  DONE-PENDING-CEO  all five dock-tails surfaces now say "workin' the docks", matching the rulebook that was right all along
2026-08-27T19:50:59Z  W2-4  DONE-PENDING-CEO  TREASURE/TAILS name their payouts, interpolated from cfg, never typed
2026-08-27T19:50:59Z  W2-6  DONE-PENDING-CEO  "On the Sugar Seas" out of title/og/twitter + about.html; schema.org name left for Wyatt
2026-08-27T19:50:59Z  W2-10 HEARTBEAT  last agent still working src/engine/index.js
2026-08-27T19:53:23Z  W2-7  PARKED  the rename is one line; the TOOLTIP it needs has no mechanism in the game (data-why is disabled-buttons-only, util.js:1737). Raised as Q-8 rather than shipping half of it.
2026-08-27T19:54:57Z  W2-10 DONE-PENDING-CEO  engine comment corrected, graveyard kept, second rotted claim found; 3 stale doc references dated. MY MISTAKE, owned: I committed the agent's file mid-task. Rule written into the handoff as 5b.
2026-08-27T19:59:00Z  W2-5  DONE-PENDING-CEO  money out styled like money in, U+2212 verified by character count. FOUND BUT NOT FIXED (rule 3): the shot-clock line tells a broke captain they lost a coin when they lost nothing - written up as proposal P-1.
2026-08-27T20:00:24Z  W2-1  PARKED  ambiguity RESOLVED by measurement (it is the narration line, not the pill - his template is 38 chars, the pill is already 27). NOT shipped: applying it literally deletes three pieces of HIS approved copy incl. the only place a storm states its rule. Q-9, with all seven lines measured in front of him.
2026-08-27T20:39:45Z  P-3  ABANDONED  FALSE CLAIM, withdrawn same day. Wyatt: "I see the forecast chip just fine" - he is right. The pill IS the forecast; the hidden .fcChip is the old needle it deliberately replaced, and BOTH files say so in a comment. I relayed a subagent conclusion without measuring it. Rule 6, one level out: an agent report is not a measurement either.
2026-08-27T20:56:44Z  W2-9  DONE-PENDING-CEO  the coin question reads st.baseIng, which minC was already branching on one line above. Wording half only; the slider PULSE is proposal P-2 (taste + unverified in WebKit).
2026-08-27T21:05:00Z  W2-1  DONE-PENDING-CEO  his two rulings shipped: directions CAPS (in DIRNAME, so all four wind surfaces agree) and Option B minus "3 squares". Calm line 57->35, held storm 138->42. engine_contract_check caught my comment block displacing an ORDER IS LOAD-BEARING annotation on DIRNAME; game_url_check caught my own new gate hardcoding a tree path. Both fixed.
