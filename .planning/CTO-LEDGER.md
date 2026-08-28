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

**STATE is one of:** `START` · `DONE` · `DONE-PENDING-CEO` · `BLOCKED` · `PARKED` · `ABANDONED` · `REVERTED` · `HEARTBEAT`

- `START` — work began. The supervisor measures staleness from the newest START with no matching close.
- `DONE` — finished AND verified AND a CEO verdict is in `.planning/CEO-REVIEWS.md`. **All three, or it is not DONE.**
- `DONE-PENDING-CEO` — finished and verified, waiting only on the verdict. **ADDED 2026-08-28 because
  it was already being used nine times without existing.** A CEO review covers a batch, so an item
  finished at 20:00 cannot be `DONE` until a review that runs at 03:00 says so — and calling it
  `START` until then makes a working CTO look stuck. The gap is real and the record needs a word for
  it. The fault it fixes is not the missing word: it is that `cto_supervise.mjs` counted a state its
  own format section had never heard of as nothing at all, so the supervisor reported "2 of 32
  closed" while the ledger showed twelve. **A spec and its reader drifted inside one session.**
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
2026-08-27T22:00:51Z  W2-7  DONE-PENDING-CEO  Pass -> Muse, three stacked lines (WAVE_IMG / Muse / +1 coin from cfg). No tooltip - his call. Lobby "Pass the wheel to" deliberately untouched and gated.
2026-08-27T22:00:51Z  CLOUD  HEARTBEAT  WEBKIT NOW WORKS. Wyatt allowlisted cdn.playwright.dev + the prss host; browser downloaded (102MB), install-deps pulled the Linux libs, and webkit 26.5 LAUNCHES. Both -wk legs are runnable in cloud for the first time. staging.playpastrypirates.com is still 403 - that entry did not take.
2026-08-27T22:06:47Z  CLOUD  HEARTBEAT  staging DIAGNOSED and it was never the allowlist. http:// is refused by the proxy regardless; https:// is ALLOWED (200 Connection Established) then dies after the tunnel with no HTTP status. Production https = 200 from the same container. DNS correct (getent -> wyattroy.github.io). Root cause: GitHub has issued no TLS cert for the subdomain. deploy-staging.sh now polls for its own stamp and names both possibilities.
2026-08-27T22:39:28Z  CLOUD  DONE  staging HTTPS RESOLVED. Wyatt re-added the custom domain on the STAGING repo; cert issued, Enforce HTTPS on. Verified from container: https 200, stamp 2026.08.27.3-staging@c9ce605e, [STAGING] title, production untouched at 2026-08-26k-CUTOVER. NEAR MISS RECORDED: my instruction said "the staging repo" and he opened PRODUCTION settings, one click from unsetting the live domain. He asked first. Name the full URL, always.
2026-08-28T03:17:55Z  TRIAL  BLOCKED->FIXED  The sea trial FAILED and lied in the same report: it listed both -wk legs under "did NOT run" and forty lines later printed "solo-desktop-wk: PASS". Cause: playtest_gate.mjs kept its OWN copy of "where is playwright" pointing at /tmp/pw while wk.mjs had learned ~/.pw the same day. WebKit was installed and launching. Both fixed, one definition each, gate 25.
2026-08-28T03:18:19Z  W0-1  DONE  both endgame URLs shipped, verified in a browser at 390x844 with a same-run red-proof, probe committed as scripts/qa/w01_endgame_urls.mjs, CEO review 6 recorded. Published and verified on staging over HTTPS.
2026-08-28T03:18:19Z  W2-4  DONE  TREASURE/TAILS name their payouts, interpolated from cfg; verified DRAWN on a phone screenshot, not grepped.
2026-08-28T03:18:19Z  CTO   HEARTBEAT  ledger hygiene corrected: W0-1 and W2-4 had been carrying START with no close for 8h while heartbeats kept the worker looking alive. The supervisor caught it and was right. ONE ITEM OPEN AT A TIME means closing the last one, not just starting the next.
2026-08-28T03:23:16Z  CTO   HEARTBEAT  CEO review 7 recorded verbatim. Acted on: cage holes CLOSED (its two spellings + 2 more pinned, 24 gate cases), ledger vocabulary reconciled with the supervisor, vision judge fixed (NODE_EXTRA_CA_CERTS - it could not see 30 screens). Disputed one charge with evidence: he WAS told the trial was still sailing; what is true is the LEDGER did not say it.
2026-08-28T03:23:16Z  STAGING  NOTE  the build on staging (2026.08.27.3-staging@427ff9d5) FAILED its sea trial - published before the verdict existed. Findings: dead Trade control on crew-phone, 2 host/guest divergences on crew-desktop, ~45 screens that never settled, 30 screens unjudged.
2026-08-28T03:28:00Z  P-1  ABANDONED  WITHDRAWN. Wyatt: "you dont lose money from shot clock" - right. The penalty code is real (util.js:2012) but startShotClock returns early on timerOff (:1896) and the timer is OFF - the clock pill reads OFF in every screenshot I took today. I read the function correctly and never asked whether a player can reach it. A correct reading of a dead branch is still a false statement about the game.
2026-08-28T03:30:45Z  W1  START  Wyatt widened Wave 1: ALL forks incl. bake-off, and REMOVE the shot clock (temporarily) rather than engineer around Rule C. Design: one consumer (watchEvents callback body extracted), three producers (engine drain for solo/pass, host drain, Firebase listener for guest). Two read-only mappers out on forks 2+3 and 4+5 plus the shot-clock removal inventory.
2026-08-28T03:35:11Z  W1  HEARTBEAT  first convergence shipped: the guest flip prompt now stamps flipMsg and paints the spin on tap, guarded on !p.battle so stage.js's "!fm && btl" Broadside title survives. Gate 26. Two real player-visible bugs, found by MAPPING the fork rather than by playing.
2026-08-28T03:39:27Z  W1  PARKED  handoff written for a fresh session on Fable. Both agent maps persisted to .planning/research/wave1-convergence/ - they cost a full pass each and existed only in context. Lock released.
2026-08-28T04:09:20Z  W1  START  Fable session, 8h window, Wyatt unreachable. His order: re-sail the trial FIRST (WebKit + vision judge now work), then Wave 1 one-activity-engine. Lock armed.
2026-08-28T04:14:09Z  W1  NOTE  Wyatt interjected: mentor skill ON, CEO after every item (not just at the end), CTO discipline manages the window. All three armed; trial still sailing.
2026-08-28T04:19:26Z  W1  HEARTBEAT  trial sailing (solo legs ~day 11+, wk legs queued). Prep done while waiting: red gate committed (34 fails, honest), full edit inventory + predictions written for clock removal and all four forks. No game code touched yet - trial owns the tree.
