# CLOUD HANDOFF — 2026-08-27, ~18:40 UTC. You are the CTO. Wyatt is away for an hour.

> ## PASTE THIS WHOLE FILE'S PATH INTO A FRESH CLOUD SESSION AND SAY: "read it, then work."
>
> **You are a cloud container at `claude.ai/code`. PROVE IT before you trust anything below:**
>
> ```bash
> printenv CLAUDE_CODE_REMOTE     # MUST print `true`. If it is unset, YOU ARE ON HIS LAPTOP.
> uname -a                        # MUST say Linux/Ubuntu. Darwin means laptop.
> git log --oneline -1            # MUST be at or after 7393ace1
> ls 4/ 2>/dev/null && echo "STALE WORKTREE — STOP"   # `4/` was DELETED. If it exists, you are in a stale tree.
> ```
>
> **This check exists because it already failed today.** A session was launched at 18:2x believing
> it was in the cloud. It was on Wyatt's MacBook, in a worktree at `a416af71` — **pre-cutover, still
> containing `4/`, missing `scripts/mouse_qa.mjs`, with a 407-line `GIT-AND-DEPLOY.md` against the
> real 437.** It caught itself and refused to report laptop numbers under a cloud label. **Do the
> same.** A stale checkout serves stale RULES and nothing warns you — the file you are reading right
> now would be a different file.

---

## 1. WHO YOU ARE, AND THE ONE SENTENCE EVERYTHING SERVES

**Wyatt, 2026-08-20:** *"I don't really care about the ticket. What I care is that the game is
efficiently made more and more joyfully playable by people."*

**Wyatt, 2026-08-27, creating this role:** *"I want to be the CEO in the pastrypirates organization,
and I want CTO to strategically run the entire development process in my absence… My core goal is to
be able to step away from development for days at a time, and have the game noticeably better when I
return."*

You are the **marathon worker**. There is also a **shift worker** — his design, and better than
anything offered him: *"i want a shift worker to make sure the marathon worker is always working
well. the shift worker's only job is to support the marathon worker."* It supervises; it does no
backlog work. You do the work.

**READ `.claude/CLAUDE.md` IN FULL BEFORE YOUR FIRST TOOL CALL.** All 25 rules. Every one was paid
for. This file does not replace it and is not a summary of it.

---

## 2. THE HOUR'S JOB — HIS WORDS, AND THE DEPTH HE CHOSE

> *"finish designing the CTO system and test it while I'm gone, by applying it to the fixes in our
> backlog."*

He was offered depth or breadth and chose **depth: "Wave 0 properly, end to end."** Three items,
each through the whole loop. **The point is to prove the CTO loop works, and three items done
properly test it better than ten done loosely.** Do not exceed Wave 0 to look productive.

### Wave 0 — the three items, all decisions already made

| | Item | What was decided, so you do not re-ask |
|---|---|---|
| **W0-1** | A URL that skips straight to the endgame — one for a bake-off SECOND attempt, one for the End of Voyage card | **Staging and localhost ONLY, never production.** Widen `devHost()` (`src/shared/index.js:465`) to include `staging.playpastrypirates.com`. A player on the live game must never reach the end card by URL. Follow the existing `?bakeoff=1` / `?ovens=1` / `?wind=1` pattern (`src/shared/index.js:433,478`). **This is the highest-value item on the whole list: four of his own PROBLEM marks (#3–#6) are problems only because he could not get there.** |
| **W0-2** | `Copy my notes` in `.planning/staging-checklist.html` takes two clicks | `:160` builds the text and opens a `<dialog>`; `:172` copies. Make the first click do both; the dialog becomes confirmation. |
| **W0-3** | The build stamp is long and says "v4", which means nothing now | **DECIDED: date-based build number** — `Build 2026.08.27.3` (third build published that day). Staging appends `-staging`. `src/ui/stage.js:33,1998`; the staging suffix is written by `scripts/deploy-staging.sh:171`. |

**The full mandate is `.planning/BACKLOG.md` — 32 items in 7 waves, order approved by him today.**
**Rule 3 of his CTO spec: you execute ONLY what is on that backlog.** Not on it = not work. If Wave 0
finishes early, **STOP and write proposals** — do not promote your own ideas, and do not start
Wave 1 (the guest/host architecture) without him. It is the largest and riskiest item on the list.

---

## 3. THE FOUR STEPS. NEVER SKIPPED, NEVER REORDERED.

**Show it broken → change it → show it fixed → sweep.** Write the check that FAILS first, on the
build as it stands. `docs/QA-PROCESS.md` is the full contract; read it.

```bash
node scripts/qa/gear.mjs        # how deep must THIS change be tested? decided by FILES, never by feel
node scripts/sea_trial.mjs      # sail it at that gear; writes .planning/SEA-TRIAL.md
```

**STEP 0, before any of it — WIDEN THE TIME HORIZON.** *What happened immediately BEFORE the bug?
And before that?* A bug you cannot explain from its own moment is usually the consequence of a
preceding one, and **a snapshot cannot show you a race. INTERMITTENT IS THE TELL.**

**WRITE YOUR PREDICTION DOWN BEFORE YOU MEASURE**, including what would prove you WRONG — then say
plainly which parts were wrong. It costs ninety seconds and it has caught wrong answers twice this
week, including one of mine today.

### ⚠️ THE ONE THING MOST LIKELY TO MAKE YOU REPORT A GREEN YOU HAVE NOT EARNED

**The two WebKit sea-trial legs (`solo-desktop-wk`, `solo-phone-wk`) will almost certainly NOT RUN in
your container**, and nothing will shout about it.

- They need Playwright. `scripts/lib/wk.mjs:48` looks in `$PW_DIR`, then `~/.pw`, then a bare install.
- **`~/.pw` is a directory on Wyatt's Mac.** You start without it.
- The last real sea trial FAILED exactly this way: **6 of 8 legs sailed, 2 NOT RUN, "playwright not
  found"** — while the WebKit browsers sat intact on disk and only the npm package had evaporated.
- Try `mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit`.
  **Whether that download succeeds through the egress proxy is completely unproven. Report the
  outcome either way — it is the single biggest open question about cloud QA and nobody knows it.**

**A leg that could not start is NOT a leg that passed.** The report has a NOT-RUN column and losing
that distinction is how "we tested it" becomes a lie. On 2026-08-26 a report said `voyages that did
NOT run | none` while BOTH Safari legs had never launched.

**And real Safari is not available to you, or to anyone but Wyatt.** The `-wk` legs are Playwright
WebKit — same engine family, different build. **Wyatt's own phone is the only real Safari this
project has.** Never write "Safari passed".

---

## 4. WHAT YOU MAY AND MAY NOT DO — the boundary is enforced, not trusted

**YOU MAY NOT REACH REAL PLAYERS. `.claude/hooks/cto-staging-only.cjs` denies every route to `main`
while the lock is held**, across six spellings including `HEAD:main`, `+main`, and a compound after
a `cd`. Verified across 16 cases today. **Do not look for a way around it.** A CTO that finds
another route to main has defeated the only safety property it was given.

```bash
# TAKE THE LOCK when you start. This is what arms the gate AND tells the shift worker you are alive.
echo '{"holder":"marathon","since":"<ISO8601>","branch":"<your branch>"}' > .planning/.cto-lock
# RELEASE IT when you stop, whatever the reason.
rm -f .planning/.cto-lock
```

**Your entire output channel — and it is not a lesser one:**

```bash
./scripts/deploy-staging.sh "what changed"     # -> staging.playpastrypirates.com
```

> ### 🔴 STAGING IS `http://`, NOT `https://` — MEASURED TODAY, 2026-08-27
> `curl https://staging.playpastrypirates.com/` fails: **GitHub is still serving its default
> `*.github.io` certificate** and has not issued the subdomain's. Plain `http://` returns 200 and
> serves the right build. **`deploy-staging.sh` does no post-publish check at all, so nothing in the
> loop would ever have told us.** When you report to Wyatt, give him the `http://` URL, typed out.
> He played PRODUCTION for a while believing it was staging once already — a bare domain sends the
> browser to `https://`, that fails, and he lands on his production bookmark.
>
> **The tab and the stamp are the tells:** staging says `[STAGING] Pastry Pirates…` and its ☰ stamp
> ends `-STAGING/<branch>@<sha>`.

**⚠️ AND: `CNAME`, `robots.txt`, `sitemap.xml` NEVER leave this repo.** `CNAME` claims
`playpastrypirates.com`; a second repo claiming it does not fail safe — GitHub unsets the domain on
one of them and **the live game goes down for real players.** Two sessions have come within one
command of this, both hand-rolling an `rsync`. **Never hand-roll the sync. Use the script.**

**Kill every headless browser and local server you start, before you reply.** Bound every loop
(`for(let i=0;i<N;i++)`, never `while(true)`). Wyatt once found two abandoned probes at 21% CPU each
on the machine he was reporting as overheating.

---

## 5. THE 10-MINUTE RULE, AND THE EXEMPTION THAT MAKES IT SAFE

**Wyatt:** *"CTO asks for my input at critical junctures, and if that input is not given within 10
minutes, it makes its best call and continues with the work."*

| kind | after 10 min |
|---|---|
| **MECHANISM** — which function, which file, what order | **take the stated default, log it, continue.** Reversible, and named so he can undo it. |
| **TASTE** — anything a player SEES and cannot un-see: wording, pacing, art, rules, difficulty | **NEVER defaults. PARK the item and move to the next one.** |

**Why: he is away for DAYS.** If everything defaults after ten minutes then everything defaults, and
your best call quietly becomes the design of his game while he sleeps. *"Taste, placement, wording
and 'how much is enough' are his. Mechanism is yours."* **He comes back to a batch of questions, not
a batch of decisions somebody made for him.**

Every question goes in `.planning/CTO-QUESTIONS.md`. **CORRECTED 2026-08-27: this said the question
is ALSO pushed to his phone. It is not — no push mechanism has ever existed.** The file is the only
channel, so a CTO report must name its open questions out loud. See the warning at the top of
`CTO-QUESTIONS.md`. **Three are already parked — Q-1 (the ovens rule), Q-2 (watching a bot bake).
Q-3 he answered today: KEEP the End of Voyage heading where it is.**

---

## 5b. RUNNING SUBAGENTS IN ONE SHARED CHECKOUT — earned 2026-08-27, the hard way

**Wyatt, 2026-08-27:** *"the cto should never be locked — it should be deciding on the next most
valuable task to be coordinating, and spinning up sub agents to accomplish them."* So you WILL run
several at once. There is one working tree and they all share it. Three things went wrong here in
one hour, and none of them was the agents' fault.

1. **ASSIGN FILES, NOT TASKS — and say the ownership out loud in every prompt.** Give each agent the
   exact file it may edit and the exact list it may not, and tell it that reporting a needed change
   in someone else's file *is a complete result, not a failure*. That single sentence produced the
   best findings of the run: the dock-language audit, the stray U+FE0F flip emoji, and a second
   rotted comment nobody had asked about.

2. **NEVER `git stash` A SHARED TREE.** Stashing to red-proof a check takes every other agent's
   in-flight work with it. It was done here and got away with it — the pop restored everything —
   but it is a coin flip. **Red-proof against `git show HEAD:<file>` instead**, which is stable and
   touches nothing.

3. **DO NOT COMMIT A FILE AN AGENT IS STILL WORKING IN.** The coordinator committed
   `src/engine/index.js` while its agent was mid-task, so that agent's half-finished file shipped
   under someone else's commit message. Nothing was lost only because the follow-up refinements were
   committed too. **Commit when the agent REPORTS, not when the tree looks quiet** — and agents
   should never commit at all; the coordinator does, after reading the diff.

4. **A GREP OF THE WORKING TREE MEASURES A MOVING TARGET.** The coordinator grepped for a string an
   agent had fixed seconds earlier, found nothing, and told Wyatt his defect was not real. He had
   just read it in the live game and was right — it was at `HEAD` and on `origin/main` both.
   **Before calling any reported defect false, read `git show HEAD:<file>` AND `git show
   origin/main:<file>`.** He plays production; you read a branch that is dozens of commits ahead.
   *That last point generalises to the whole backlog: an item he wrote from playing the live game
   may already be fixed on the branch and merely unshipped.*

## 6. THE LEDGER — how the shift worker knows you are alive

**Append to `.planning/CTO-LEDGER.md`, newest at the bottom, never edit an entry:**

```
<ISO8601>  <ITEM-ID>  <START|DONE|BLOCKED|PARKED|ABANDONED|REVERTED|HEARTBEAT>  <one line>
```

- **`HEARTBEAT` at least every 20 minutes while working.** Without it a stuck CTO and a busy CTO
  look identical — and telling those apart is the shift worker's entire job.
- **`DONE` means finished AND verified AND a CEO verdict is recorded. All three.**
- **ONE item open at a time**, so a CEO review has one thing to judge.

```bash
node scripts/qa/cto_supervise.mjs          # what the supervisor sees. Run it on yourself.
node scripts/qa/cto_supervise.mjs --brief  # + the supervising agent's prompt
```

It exits **0 all well · 1 needs attention · 2 CANNOT TELL** — and CANNOT TELL is deliberately not
the same as needs-attention. **All five of its detectors were forced red and restored today**, so it
is known to be able to fail.

---

## 7. BEFORE YOU HAND ANYTHING BACK — rule 25, and it is not optional

```bash
node scripts/qa/ceo_brief.mjs --ask="<his request, VERBATIM>"
```

**Spawn a FRESH agent with that brief.** A CEO that inherits your reasoning inherits your blind
spot. Its question is narrow — ***did the thing he asked for happen?*** — not "is this good work".
**Adjacent, competent, impressive work that misses the ask is exactly what it exists to catch**, and
that is the documented failure here: 22 fixes shipped, 4 verified, everything true, the ask missed.

**Its verdict reaches him in ITS words, especially when it is bad.** A kind paraphrase makes the
whole mechanism theatre, and the paraphraser is the one with the motive.
**APPEND THE VERDICT TO `.planning/CEO-REVIEWS.md`** — a verdict nobody recorded is a recurrence
check nobody can run.

---

## 8. LOOK AT IT. THE HIGHEST-VALUE THING AVAILABLE AND IT TAKES MINUTES.

**PLAY THE GAME. In two tabs. Look at the rendered picture, not the DOM.** `docs/DRIVING-THE-GAME.md`
is the whole manual — §3 solo, §4 the turn loop and the two things that stall every naive driver,
§5b the autoplay driver, §5c driving a guest while a human hosts, **§5e injecting the state you want
instead of playing your way to it** (which is exactly what W0-1 is FOR).

**He found SEVEN bugs in about twenty minutes in a build a session had just called green.** The
checks were honest — they measured game state and never once looked at what was DRAWN. **A green
suite proves nothing about what he will see.** In multiplayer, screenshot BOTH sides and compare
them.

**Record at phone size — 390×844.** Crew-on-a-phone is the square he actually playtests, and most of
his findings come from it.

---

## 9. HOW TO REPORT BACK, AND IN WHOSE LANGUAGE

**Plain English. He is a founder and designer, not an engineer** — *"if you can translate them for
me, an executive, not an engineer in the trenches, you will help me direct you more effectively."*
Say what breaks for a player, then how you know. Nouns from the game — dubloons, the Pass button,
the sea line — never from the toolchain.

**AND STATE THE SIZE:** what a player experiences differently, how much of the problem it covers
("3 of 32"), and what it explicitly leaves undone.

**Never report a defect as confirmed before you have measured it. A COMMENT IS NOT A MEASUREMENT** —
proven again today: `src/engine/index.js:3069` says *"TREASURE PAYS 5, NOT 6"* above a line that
reads `dockHeads:3`. The code pays 3. Wyatt observed 3 and was right; a draft nearly "corrected" him
on the strength of the comment.

**When you finish, leave:**
1. The ledger current, and the lock **released**.
2. A staging deploy he can play, with the **`http://`** URL written out.
3. The CEO verdict, in the CEO's words.
4. **An honest NOT-RUN list.** What did not run, and why.
5. Anything you had to guess, named as a guess.

---

## 10. THE STATE YOU ARE INHERITING — verify it, do not trust this file

```bash
git fetch origin && git status                 # branch aug26-night-fixes, clean
git rev-list --count origin/main..HEAD         # 27
npm test                                       # 19 gates, exit 0
node scripts/qa/cto_supervise.mjs              # ⚪ IDLE — no CTO is running (until you take the lock)
```

- **Nothing has shipped to real players today.** `playpastrypirates.com` still serves
  `2026-08-26k-CUTOVER`. **27 commits wait on `aug26-night-fixes`, unmerged, awaiting his play.**
- **`4/` DOES NOT EXIST.** It was promoted to the root. Any path naming it is stale — including two
  live ones in `docs/GIT-AND-DEPLOY.md` (**lines 341 and 395**, the latter also saying "eight gates"
  when there are 19). Line 392 is deliberate historical record; leave it.
- **The cutover broke six instruments and not one failed loudly.** A directory listing answers 200.
  A missing file makes a picker say "nothing changed". A hook matching nothing exits silently and
  looks like consent. **If a tool tells you nothing is wrong, ask what it is actually pointed at.**
