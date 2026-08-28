# CEO reviews — the standing record

**Rule 25 says hand each new CEO "the previous CEO's verdict", so it can say whether the same fault
is recurring. Until 2026-08-26 that verdict lived only in the running session's context — so the
moment a session ended, the mechanism that catches RECURRING faults quietly stopped working.**
This file is where verdicts live now. `scripts/qa/ceo_brief.mjs` reads the newest entry
automatically.

## Review 14 — 2026-08-28, the local 10-leg sea trial on Wyatt's Mac (ledger item LOCAL-TRIAL) — VERBATIM

**Wyatt — YES. He did the thing you asked for, and he did it more honestly than most runs on this branch.** The one real catch is that his report says two screens went unlooked-at when the true number is eighty-four — which is the same fault the last CEO flagged, wearing a different coat.

### 1. Each thing the handoff asked for

**Sail the full trial on your Mac — DONE.** All ten voyages genuinely sailed. I did not take the report's word for it: `sea-trial-shots/report.json` is the run's own record of what it captured, and every leg has real screens in it (23, 24, 28, 39, 47, 60, 55, 21, 21, 31 — 349 in total). "None did not run" is therefore an earned line, not a phrase that slipped through. `/Users/wyattroy/Documents/Projects/pastrypirates/scripts/sea_trial.mjs:159-168` is where that gets decided by evidence rather than by wording, and it worked.

**Time it — DONE.** 119 minutes in the header of `/Users/wyattroy/Documents/Projects/pastrypirates/.planning/SEA-TRIAL-LOCAL.md:3`, plus a per-leg table built from the log's own stamps.

**Fill in the cloud-vs-local comparison — DONE, including the cell the handoff called the most valuable.** The cloud needed 14 browser restarts to get through its three Safari legs (11 + 2 + 1, at `.planning/SEA-TRIAL.md:64,70,76`). Your Mac needed zero. I checked that from both directions: the machine record shows `recoveries: 0` on all ten legs, and the words "WPEWebProcess", "Target crashed", "relaunch", "Recovery #" and the ✱ symbol appear **zero times** across the whole 7,127-second log. I also checked the obvious cheat — that the Safari legs quietly ran in Chrome instead — and they didn't: there is no fallback, the code throws if Safari's driver is missing (`scripts/lib/wk.mjs:74-79`), and the driver and browsers are both installed on your machine. **So the Safari crash really is a container problem, not something your players would ever meet.** That is a genuinely useful answer and it was the point of the run.

**Obey the mid-run rules from the other session — DONE.** He was told to write to his own report file, not touch game code, rebase before committing, and push. His only two commits are `1db8e2ad` (one tooling file, 14 lines) and `af318837` (three planning documents). No `index.html`, no `src/`. Cleanly stacked on top of the cloud's work and pushed — nothing sitting unpushed.

**Rule 17 — clean.** No leftover browsers or servers running on your laptop. I checked.

### 2. The tooling fix: legitimate, not a substitution

I went looking for rule 7 here — building tools instead of doing the job — and it isn't that. His first attempt at the trial produced *zero* visual verdicts on *every* screen, silently, while the legs looked healthy. That is the trial's eyes being shut. Fixing it was the difference between a run worth having and a run that lies to you.

And this is the strongest-verified claim in the whole set. His theory was that each screenshot-checking call was being ambushed by this repo's own end-of-session hook. The fingerprint is on disk and I counted it myself: **73 hook markers** stamped between 14:20 and 15:40 — the failed run — arriving in threes, exactly matching the three-at-a-time judging. And **zero** markers after 15:42:58, when the good run started. Before and after, both measurable, both mine rather than his. The fix itself is one line, and one file: `scripts/lib/vision.mjs`.

His "267 screens judged, 2 timed out" is exact. I recounted from the machine record: 267, of which 246 passed, 19 failed, 2 errored.

### 3. Where he announces more than he checked — THE CATCH

`.planning/LOCAL-TRIAL-LOG.md:195` says, under what the run does *not* establish: **"Two screens were never judged."**

That is wrong, and it undersells by a factor of forty. The visual judge only ever looks at the first **30 screens of a leg** — a hard cap at `scripts/playtest_gate.mjs:58`, applied at `:481`. The run captured 349 screens and submitted 267. **Eighty-two screens were never shown to the judge at all**, on top of the two that timed out. Eighty-four unlooked-at, not two.

The worst instance is the leg that most needed looking at. `crew-desktop` — the one leg that **did not finish its voyage** — captured 60 screens, had 30 judged, and every one of those 30 came back PASS. In the report it reads as visually clean. Half of it was never opened. And the cap appears nowhere in `SEA-TRIAL-LOCAL.md`; the report's per-leg lines say "vision judge FAILED 4 screens" with no denominator, so there is nothing on the page to tell you how much was actually seen.

To be fair to him: he did not invent the cap, and he was told not to change machinery mid-run. But the sentence he wrote is his, and it states a smaller gap than the one that exists.

### 4. Smaller things, none of them reasons to reopen

- **"75 markers" is actually 73.** A typed number that didn't match the countable one. Harmless here, but this project has a rule about exactly that.
- **The cloud's own report cannot say which machine ran it.** `.planning/SEA-TRIAL.md:3` has no "sailed on" line — the fix that adds it landed after that run began. His table labels the cloud column correctly, but by inference, not from the file. So the promise that "every report now states the machine it sailed on" is not yet true of the report on disk today.
- **The 0-vs-14 headline is slightly tighter than the evidence.** He says himself the cloud's per-leg times can't be recovered, so the two aren't matched for exposure — his Safari legs ran about 52 minutes total. Given one cloud leg crashed eleven times, 52 crash-free minutes is still decisive. The conclusion holds; the framing is a shade neater than the data.
- **One claim I could not verify at all:** that the `physical-board` staging-leak catch was a *different* local session. Both local sessions commit under the same identity, and those commits sit in one unbroken 15:16–15:34 run right before his trial. Plausible, uncheckable from the repo. Nothing turns on it — but don't read it as established.
- **Two things he filed and did not fix are both real, and I verified both.** The screenshot folder is still one shared path, so two runs on one machine erase each other's evidence — which is precisely why the *before* half of his own judge story is gone from disk. And `a4069ed2` changes `index.html` while the build stamp reads `2026.08.28.4` on both sides of it: same label, two different games. That second one quietly breaks your "compare the stamp in the menu to the stamp in the report" check.

### 5. The recurrence question

**Review 13's fault has recurred, in new clothing.** Its criticism was: *the instrument announces more than it actually checked.* There it was a layout gate that guarded one line while printing a claim about the whole idea. Here it is a trial report that prints per-leg visual verdicts with no denominator, and a write-up that names two unjudged screens when eighty-four were never looked at. Different code, same fault: **the summary is broader than the coverage underneath it, and nothing on the page says so.** The narrow fix is one sentence in the log and one denominator in the report — "judged 30 of 60" instead of "FAILED 4 screens."

Review 13's other two points did not recur. He explicitly declined to fold the unfinished leg into a pass, gave it its own section, and disqualified his own timing comparison as busy-machine-versus-idle-container rather than defending it.

**One sentence to hold onto:** the Safari crash is confirmed a cloud-container artefact and does not touch your players — but the trial report is still telling you it looked at more of your game than it did, which is the third time in three reviews that the same fault has surfaced somewhere new.

**ACTED ON, same session:** the `.planning/LOCAL-TRIAL-LOG.md` sentence is corrected in the open (84, with the cap cited and the `crew-desktop` 30-of-60 case named); the marker count is recounted to 73 with a note on how the wrong number got typed; the missing denominator in the trial report is filed as machinery this session was told not to change mid-window.

## Review 13 — 2026-08-28, W4-3 the stage background (one layout item) — VERBATIM

**Verdict, for Wyatt:** Yes — this one is done, and it is the thing you actually asked for. I reproduced it myself rather than taking the word for it: with the old code the centre column really was painting a flat blue slab 430 pixels wide straight down the middle of your gradient, and with the new code the gradient runs edge to edge with no seam. Desktop and tablet are both fixed, and your phone is untouched — I proved that one to the byte, not by eye. Three things worth holding onto, none of them a reason to reopen it. First, on the phone the gradient still isn't the background, because there isn't one down there at all — the flat blue stays as the only ground, which I think is right but is a call somebody made for you rather than one you gave. Second, the automated check that is meant to stop this coming back is real — I broke the code four different ways and it caught all four — but it guards one line rather than the idea, and I put the same blue band back three other ways without it noticing, while it still prints "one background behind the stage" as though it had checked the whole thing; that sentence should be narrowed to what it actually watches. Third, the before-and-after screenshots you were shown are two different moments of the game, not a clean comparison, so I made a proper matched pair myself to be sure — the finding held, but the evidence as offered was weaker than the claim resting on it. And a small housekeeping note: the git entry explaining this fix lost two words to a shell quoting slip, which was spotted and openly recorded rather than quietly rewritten, correctly, because another session is working on the same branch.

### What it verified independently
- Read the shipped CSS itself (`index.html:1517-1518`), and confirmed every supporting fact: the surround on `html` inside `@media(min-width:601px)` (`:1548,:1556-1566`), body as a centred 430px column only at >=601px (`:1571`), and body's pale base gradient at `:52` as the thing a plain deletion would have exposed.
- **Loaded the real page in Chromium with only that one rule differing** and read computed values: 1200px shipped = body transparent/none, html rgb(12,52,66); with the old rule restored = rgb(61,125,153). 390px = #3d7d99 either way. Body's rect measured 430x863 at 1200px — "that is the band, and its dimensions are exactly what he described."
- **Rendered its own matched pair** (identical page, one rule differing): the broken render shows a hard-edged 430px flat column; the fixed render shows one continuous gradient. **At 390px the two renders are byte-identical (same md5)** — a stronger phone-unchanged proof than any screenshot.
- Mutated the gate five ways (restore global, hide in min-width, hide in a too-generous max-width:900px, write it as background-color, delete the surround) — **all five FAILED correctly**, so "it ran red first" is substantively true today.

### Where it pushed back — acted on
1. **The gate guarded one selector while announcing the idea.** It put the identical band back three ways the gate ignored — `html body.pp4Stage`, `body.pp4Stage #boardwrap`, `body.pp4Stage #game`. **FIXED:** the gate now flags any rule painting body itself however the selector reaches it, OR any FULL-BLEED ANCESTOR OF THE BOARD — a list DERIVED from the markup (#game, #layout, #left, #boardwrap), not typed, so it tracks the layout. All four defeats now fail it; the first correction still missed #game because the ancestor walk was wrong, which the re-test caught. The pass line now names exactly what it watched.
2. **The before/after pair was not a clean A/B** — two different game moments, different camera. Fair: the evidence was weaker than the claim resting on it. Matched-pair rendering (identical state, one rule differing) is the standard for layout items from here.
3. **The phone scope is a decision taken on his behalf** — below 601px there is no surround at all, so the flat colour remains the only ground. Parked as a question rather than assumed settled.
4. Noted, unmeasured, not this item: in the phone shot the board's right edge and the captains card appear to run past the 390px viewport. Filed so it is not lost.
5. Review 12's "instrument announces more than it checked" **recurred in a new surface** and is what finding 1 fixes; its other two criticisms did not recur.

## Review 12 — 2026-08-28, Safari + three sizes, cloud and local (ledger item W2) — VERBATIM

**Verdict, for Wyatt:** Yes — most of what you asked for happened, and the headline is real, not dressed up: I opened the raw data file myself and all ten voyages genuinely reached End of Voyage, including all three Safari ones, which had never once finished a voyage before tonight. The third size is now tablet portrait exactly as you ruled, Safari plays solo at all three sizes exactly as you ruled, and the instructions are written into the QA process document where the next session is forced to read them. Two honest gaps you should hold onto. First, the local half of your question — "or local" — is **documented but not demonstrated**; the runbook is written and a session on your Mac is meant to run it, and every document I checked says so plainly rather than pretending otherwise, so the item is not closed until that run reports back. Second, Safari only finished by being restarted mid-voyage eleven times on the desktop leg — that is a limp, not a stroll, and while the caveat is stated well in the process doc, the sea trial report you actually open shows all ten legs in one tidy list with the restart count buried seventy lines down, and nothing in the machinery will ever fail a leg no matter how many restarts it needs. I would ask for two small things before calling this finished: put the restart count at the top of the report where you will meet it, and pick a number of restarts that means "this is broken," so that a future crash caused by your own game can't quietly ride the same rescue road.

### What it verified itself, against the repo

- **The three sizes are real now, and were not before.** `playtest_gate.mjs:341` solo-tablet 768x954 with touch; `:355` the WebKit twin; `sea_trial.mjs:80-81` FULL widened to ten. The two places that used to lie now tell the truth (`CLAUDE.md:919`, `gear.mjs:183`). DONE.
- **The Safari ruling was followed** — `playtest_gate.mjs:353-355`, solo at all three sizes, Chrome carries multiplayer, his sentence quoted as the reason. DONE.
- **"10 of 10 finished" is data, not a log summary.** Ten records in `report.json`, every one `finished: true`, no `error`, WebKit recoveries 11/2/1. And it checked what `finished` CAN mean: `playtest_gate.mjs:209` sets it only on the game's own `st.over` with the end screenshot captured; the timeout path at `:215` sets it false. **It cannot be a leg that ran out of clock and got rounded up.**
- **The WebKit fix is real machinery** — `wk.mjs:135` persistent context, `:153` the 60s ceiling, `:159-178` relaunch/resume/retry; `playtest_gate.mjs:454` sums and `:503` prints.
- **The local boundary is not overclaimed anywhere** it checked — report, ledger, docs, commit messages. Clean.
- **The collision fix is real and fenced** — ran `trial_report_ownership_check.mjs` itself, seven PASSes, wired at `package.json:11`, count agrees at 35.
- **Review 9's recurring fault has stopped**: three verdicts in one day, each before the next item, and Review 10's caution became machinery within the hour (`ceo-cadence-fence.cjs`, wired at `settings.json:49`). "The words became machinery."

### Where it pushed back — all three acted on the same hour

1. **(c) The 11-relaunch leg is honestly "running", but the caveat is not where you would meet it.** The summary table listed `solo-desktop-wk` in the same undifferentiated list as seven clean Chrome legs, with the relaunch notice ~70 lines down in the log block. **FIXED:** the summary table now carries a "voyages that only finished after a BROWSER RESTART" row, derived from report.json, naming each leg, its count and its days.
2. **Nothing bounded the recoveries** — `legVerdict()` never read them, so a future crash caused by our own game code would relaunch, resume and report `finished:true` with a small asterisk; "this repo has already paid once for an instrument that was reassuring rather than silent." **FIXED:** any recovery on a NON-WebKit leg now fails outright (Chrome has never needed one, so it is by definition not the sanctioned crash), and a WebKit leg gets a budget of one rescue per four game-days sailed (floor 2) — the 11-over-29-days leg fails that budget, exactly as the CEO judged it should.
3. **A wrong number in the append-only record** — the ledger said "44 judge findings"; the data says 24, and the commit message already said 24. Second time in two days a CEO has found a wrong figure there. **CORRECTED IN THE OPEN**, not silently.
4. **One thing quietly lost, disclosed not hidden:** the `solo-tablet-wk` contact sheet timed out, so the newest leg is the one with no contact sheet on disk.

## Review 11 — 2026-08-28, the staging checklist item + the leak its own publish step caused — VERBATIM

**I checked every claim against the live repo and the live staging site myself — commands and outputs below, not the write-up's word.**

### 1. Item-by-item

**1. "No game file changed since 78565c55, checklist still accurate" — DONE.**
`git log 78565c55..HEAD -- index.html about.html src/ package.json` returns nothing — zero commits touched a game file in that window. Confirmed independently, not copied from the other session's commit.

**2. "Ran deploy-staging.sh, it leaked physical-board/ onto public staging" — DONE.**
`.git/info/exclude` (a personal, un-shared git setting — never seen by any other checkout or by GitHub) lists `physical-board/`; `.gitignore` (the shared, tracked one everyone gets) does not. `physical-board/` is sitting on disk in this checkout right now while `git status` says the tree is clean — proof the folder was invisible to git but real on disk, exactly the mechanism claimed. `scripts/deploy-staging.sh`'s EXCLUDES block (before the fix) only derives from `.gitignore` — it genuinely never reads `.git/info/exclude`. Root-cause claim holds.

**3. "Fixed the script, scrubbed the leak, verified 404/200" — DONE.**
`scripts/deploy-staging.sh:93` now reads `--exclude=physical-board/`. Live checks I ran myself, right now: `staging.playpastrypirates.com/physical-board/HANDOFF.md` → **404**; `staging.playpastrypirates.com/physical-board/v3-round/chests.dxf` → **404**; `staging.playpastrypirates.com/` → **200**; stage.js on staging → `PP4_STAMP = "2026.08.28.4-staging@25158042"` — matches exactly what the checklist now tells Wyatt to expect.

**4. "Leak window was real, write-up doesn't overclaim" — DONE, and it's honest.**
Neither the ledger entry nor the checklist claims "no one could have fetched it." Both say the files "were served at HTTP 200 for several minutes" (a fact) and separately flag, as an open, unresolved risk, that the files are still recoverable from the staging repo's git history — the opposite of overclaiming closure.

**5. "Found a real 3-way collision risk, rebased clean, left the call to Wyatt" — DONE.**
`git reflog` shows an actual `pull --rebase` with a clean pick and finish — no conflict markers. The ledger entry states, verbatim, that whether to rewrite the staging repo's git history is "Wyatt's call, not mine to decide" — it does not claim a decision was made for him.

**6. "Checklist updated to the new sha, plain-English disclosure added" — DONE.**
`.planning/staging-checklist.html` now points at `@25158042` and carries a note that says "kept off the working tree only by a LOCAL, untracked git setting the deploy script never read" — no "rsync," no "mtime," no jargon. It reads like something a designer, not an engineer, would say to Wyatt.

**7. "Touched nothing else — no game code, no trial" — DONE.**
`git diff --stat HEAD~5 HEAD` touches exactly three files: `.planning/CTO-LEDGER.md`, `.planning/staging-checklist.html`, `scripts/deploy-staging.sh`. Nothing under `src/`, `index.html`, or the trial's own files. `.planning/SEA-TRIAL.md` still reads "IN PROGRESS — no verdict yet," untouched by this branch.

**8. "Left the history-rewrite call to Wyatt, didn't chase the mystery commit, didn't touch the trial" — DONE**, consistent with everything above.

**One honest ding, not on the substance:** the ledger entry's own internal timestamp says `19:35:00Z`, but the git commit that added that line was made at `19:26:23Z` — nine minutes earlier than the time the entry claims. Doesn't change any fact reported, just a small sloppy detail in an append-only record that's supposed to be exact.

### 2. What Wyatt didn't ask for, and whether it was safe

He asked for a fresh checklist. What actually happened: following his own hook's instruction to "publish to staging first" is *what caused the leak* — this session's own re-publish put the private files on the public site, not a pre-existing exposure it merely stumbled on. It then found that immediately and fixed it within the same run. That's the right order of events (fix what your own action broke, before handing anything to Wyatt), but it's worth him knowing plainly: the security incident wasn't discovered by inspection, it was triggered live by doing exactly what he told the process to do.

Did it endanger the concurrent 24-hour cloud session's work? No. Zero file overlap with anything under `src/`, the rebase was clean with no conflicts, and the session explicitly declined to claim any wave work, leaving that to the cloud session as its ledger entry says.

### 3. Any claim not backed by the repo?

None found false. Everything independently checkable — the exclude-file split, the script's blind spot, the 404s, the 200, the stamp, the rebase, the diffstat scope — matched. The only thing genuinely unverifiable after the fact is the exact leak duration ("several minutes"), and the write-up correctly does not claim more certainty about it than that.

### 4. Is Review 10's fault (batched reviews) recurring here?

No: Review 9 was thirteen *unrelated* items reviewed once at the end of a window. This is one causal chain — verify the checklist → publish to staging (as ordered) → that publish leaks a private folder → fix the script → scrub staging → update the checklist to match — all inside one continuous response to one Stop-hook-triggered task, reviewed once, immediately, not batched with anything else.

### 5. One line for Wyatt

The staging checklist is current and safe to hand out — but the deploy script itself briefly put your private board-design files on the public staging site, and that's now fixed and scrubbed except for one call only you can make: whether to rewrite the staging repo's git history to fully erase the leak window.

## Review 10 — 2026-08-28, "CEO after every item" recorded durably (small item, short verdict) — VERBATIM

YES — the thing you asked for happened. Your order is now written in the two places every session is forced to read: the rulebook that loads into every session (`.claude/CLAUDE.md`, lines 417–425, directly inside the CEO rule) and the top of the CEO brief itself (`.claude/CEO-BRIEF.md`, lines 5–11), and both say the same thing in plain terms — every item you ask for closes with its own fresh CEO verdict, written into the record before the next item starts, and a batch review at the end is named as the failure, not an option. Both quote you word for word, twice, so the next session also learns this is the second time you had to say it. One caution: this repo's strongest rules are enforced by machinery that physically interrupts a session, and this one is still only words on a page — words that have now failed you twice. If a third session batches its reviews anyway, the next step is a mechanical fence (a check that notices work landing while the review file sits untouched), and I would not wait for a fourth occurrence to build it.

*(Session note: the fence was built the same hour, on this verdict — `.claude/hooks/ceo-cadence-fence.cjs`, wired beside the existing commit hooks: it interrupts when game-code commits keep landing while `.planning/CEO-REVIEWS.md` sits untouched.)*

## Review 9 — 2026-08-28, the A-1..A-13 batch (ledger item W1B) — VERBATIM

### 1. Item by item — did each thing happen?

**A-1 (measure the bake-day, then let a docked captain bake NOW) — DONE.** Measured first, as you ordered: the old day ran everyone's turns, then all bakes — exactly your Crustbeard observation — and the commit says so before it changes anything (`4bd4baef`). The rule now: docking at Tortuga lights the ovens and the bake happens in that same turn slot, on both the solo loop and the live loop (`/home/user/pastrypirates/src/engine/index.js`, `src/orchestrator.js`). The gate `scripts/qa/a1_bake_now_check.mjs` was run red first (6 failures) and I ran it green myself. Old solo saves are refused rather than desynced (SOLO_SCHEMA_V 2→3). The measurement reaches you in checklist row 12 (`.planning/staging-checklist.html:98`).

**A-2 (watch a bot's bake-off) — DONE.** `botBakePerform` (`src/orchestrator.js:1043`) publishes the bot's bake through the SAME `benchPublish` pipeline a human baker uses (`:1050-1059`) — one display path, your rule 23 — so every screen watches the bench open, shuffle, and pick, then sees the verdict. Gate green (I ran it); the .4 trial ran full voyages with it in and no leg stalled on it.

**A-4 (commit code on its own line) — DONE.** `src/ui/stage.js:1990-1992`: the stamp splits at the `@`, `@<sha>` on its own line, plain builds unchanged.

**A-5 (build counter) — DONE.** `scripts/bump-build.mjs` / `npm run bump`: same day increments, new day resets to .1. The stamp itself is the counter — no twin file to rot — and it already did real work today: .3 lived and died in one trial, .4 is the fixed build.

**A-6 (drop "after dark" from the dock recap) — DONE.** No live string says "after dark" or "under cover o' dark" anywhere in `src/` or `index.html`; only graveyard comments explaining the cut remain (`src/ui/panel.js:1101`).

**A-7 (rules page auto-updates) — DONE, and your suspicion was right.** The How-to-Play page now fills every number from `rulesFacts(cfg)` — the same config the engine plays by (`src/orchestrator.js:2339-2345`, `index.html:2650`). The gate `scripts/qa/rules_page_check.mjs` was run red first and its red run confirmed what you guessed: the old page still taught the shot clock, had no black market at all, and hand-typed every number. Green now, in the chain.

**A-8 (Muse is the button text, no tooltip) — DONE.** `src/ui/flow.js:2162` — wave image, "Muse", +1🌕, no tooltip; the `w27` gate holds it.

**A-9 (option b, directions in ALL CAPS) — DONE.** CAPS are baked into `DIRNAME` itself (`src/shared/index.js:238`: NORTH/SOUTH/EAST/WEST) so every wind surface agrees; calm days are short, and a storm day keeps its own sentence carrying the rule in your shape — "It'll blow every ship N squares WEST" — with the distance derived from `STORM_PUSH`, never typed (`src/ui/util.js:443-453`).

**A-10 (remove play/pause) — DONE.** The removal gate passes and says it plainly: "the shot clock and play/pause are both out" (I ran `scripts/qa/shotclock_removed_check.mjs`). Only explanatory comments remain. The self-inflicted layout break (a deleted line took a CSS closing brace, another took a comment opener — the whole game collapsed to a ~300px stack) is real, was caught by a screenshot, and was fixed at `d3884abb` at 11:36 — before any deploy. **But see §3: the fence built for that fault guards the wrong file.**

**A-11 (guest's full flip row — approved) — DONE.** Nothing to build; the convergence stands and its gate is in the chain.

**A-12 (option a — nobody glows in a simultaneous pick) — DONE.** Your (a) was already the shipped state (`.planning/CTO-QUESTIONS.md:226-227`); your answer ratified it. No change was needed and none was made.

**A-13 (option b — host drains every event, parity first) — DONE, and it earned its keep.** The host now drains every event through the one consumption frontier `appState.evConsumed` (`src/ui/panel.js:154-155`), matching the guest exactly. It also caused the day's one real regression: End of Voyage stopped rendering in every mode on build .3 — and **the sea trial caught it**, the .3 run was killed, the fix (`a5a6c731`: endVoyage renders explicitly) was gated (`scripts/qa/one_event_consumer_check.mjs:100-105`, run red first, green now — I ran it), runtime-proven, and the .4 re-trial proved all six Chrome legs reached a drawn End of Voyage.

**"Run the sea trial successfully" — PARTIAL, honestly reported.** The trial ran end to end at FULL gear, 8 of 8 legs, NOT-RUN empty (`.planning/SEA-TRIAL.md:3,13`), and it did the best possible day's work — killing a broken build before you saw it. But the verdict is **FAILED**, and both WebKit legs did not finish their voyages (Target crashed, the known container pattern — `SEA-TRIAL.md:66-77`). Every failure is triaged against the earlier baseline as pre-existing; I found no claim in that triage the report contradicts. A clean PASS has still never happened on any build — the word "successfully" should not be read as one.

**"Tell me within 10 minutes if stalled" — DONE as a mechanism, never triggered.** The rule is codified with your exact ask quoted (`docs/QA-PROCESS.md:313-317`: log quiet 10 minutes = stalled, tell you, name the local fallback). The first monitor watched the wrong output (trial stdout goes quiet mid-leg) — self-caught and corrected on the .4 relaunch (ledger 12:12). No stall occurred, so no report was owed.

**"Write the cloud and local runbooks" — DONE.** `docs/QA-PROCESS.md` §5b (lines 261-317): the cloud-container steps, the Mac steps, which to prefer, and the stalled-run rule — with your sentence quoted at the top as the reason it exists.

### 2. What you did not ask for

Almost nothing. Every new gate serves an A-item; the checklist and ledger are the standing process. Nothing displaced your asks. Production is untouched by construction — all 107 commits sit on a branch ahead of `main`.

### 3. Claims the repo does not support

**One real one: the safety net built after the layout break is pointed at the wrong game.** The ledger says "ui_contract_check now balance-checks index.html comments AND style-block braces" (`.planning/CTO-LEDGER.md:99`). The code exists and works — I pointed it at a deliberately broken copy and it caught the exact fault. But `npm test` runs that gate with `--tree=classic` (`package.json:11`), so in the build chain it balance-checks `classic/index.html` — the frozen v1 page that will never change — and **never the live `index.html` that actually broke**. Run bare against the live tree the gate fails on unrelated stale assertions (COIN-NOBRK anchors for functions that no longer exist), which is presumably why nobody re-pointed it. This is your own hard-won lesson recurring in the same repo that wrote it down: *a gate aimed at the wrong tree is not silent, it is reassuring.* The fault class A-10 created is, today, fenced by nothing automated.

**Two smaller ones.** (a) The checklist says staging was "verified serving on the wire" at `2026.08.28.4-staging@5f4fc83b` (`.planning/staging-checklist.html:66-67`), but the ledger's last entry stops at "Deploying to staging on this verdict" (`CTO-LEDGER.md:103`) with no post-deploy record — I have no network access, so this rests entirely on the checklist's assertion; your ☰ menu is the only proof. (b) Your thirteen answers were never recorded into `.planning/CTO-QUESTIONS.md` — every answer field for Q-1..Q-13 except Q-3 is still blank (lines 56-240) in the file that calls itself "THE ONLY CHANNEL" and demands your words verbatim. A future session reading it will believe thirteen questions you already answered are still open.

### 4. The last verdict's faults — fixed or recurred?

**Fixed:** Review 8's core catch — a conclusion relayed as a measurement — did not recur anywhere I checked. The .3 regression was measured live on the stuck legs (CDP), the fix was runtime-proven before the re-trial, and every trial claim I spot-checked matches the committed report. The crew-phone class of false evidence has no sibling this window.

**Recurred in form:** the per-item CEO. `.planning/CEO-REVIEWS.md` has no review between Review 8 and this one; the W1B plan itself lists "CEO" last (`CTO-LEDGER.md:97`). I am again the first reviewer to see the work, at the end. Your A-message did not restate the per-item order, so this may match your current intent — but the 04:14 standing order ("CEO after every item, not just at the end") was never revoked, and for the second window running the review arrived after everything had shipped. Decide which you want; right now the record supports both readings.

### 5. The verdict, for Wyatt

Wyatt — all thirteen of your answers genuinely shipped, and I verified each one in the code, not the report: the bake starts the turn you dock, you can watch the bots bake, the rules page fills itself from the live game, the pause button and "after dark" are gone, the storm sentence carries your rule in CAPS, and the host now drains every event like the guest. The day's best moment is that the process worked exactly as designed — the sea trial caught the one real regression (End of Voyage vanishing), killed that build before you ever saw it, and the fixed build re-sailed all eight legs. Three things temper it: the trial's verdict is still FAILED (pre-existing faults, honestly triaged, both Safari-family legs still crash in the container — there has never yet been a clean PASS); the "staging serves .4" claim rests on one checklist sentence with no ledger record behind it, so read the ☰ stamp yourself before playtesting; and the new gate built to stop the layout-break fault class is wired to check the frozen old game's page instead of the live one — the exact "gate aimed at the wrong tree" mistake this project already paid for once, which means that fault class is currently guarded by nothing but screenshots. Fix the gate's aim, record your thirteen answers into the questions file, and this window is one of the honest ones.

*(Session note, appended with the verdict per rule 25: all three §3 findings were acted on the same hour — the balance gate now always reads the LIVE index.html whatever `--tree` says, red-proved by breaking the live page and watching the chain fail (commit after this review); the twelve outstanding answers are recorded verbatim in CTO-QUESTIONS.md with resolved stamps; and the staging deploy's wire verification (`✅ LIVE — serving 2026.08.28.4-staging@5f4fc83b`, the deploy script's own poll) is now in the ledger. The verdict above is untouched.)*


## Review 8 — 2026-08-28, the Wave 1 window (ledger item W1, one game activity engine) — VERBATIM

**One sentence to read first:** *The convergence you asked for genuinely happened — one engine now feeds both screens, the clock is out cleanly, and nothing shipped to production — but the checklist you are about to read contains one false sentence: "crew-phone finished the voyage — both screens, identical End of Voyage" is proven by screenshots of the PREVIOUS build, and on THIS build that leg stalled at day 8 for 28 minutes and nobody knows why.*

### 1. What you asked for, item by item

**"Both host and guest listen to one game activity engine" — MOSTLY DONE, honestly labeled.** I read the code, not the report. There is now one function that draws every game event for everybody — `consumeEvent` at `src/orchestrator.js:1460`. The guest's Firebase listener hands events to it (`src/orchestrator.js:1505`); the host's loop hands events to it (`src/ui/panel.js:199`), and the host's separate drawing code is genuinely deleted, not wrapped. Same for prompts: one renderer, `renderAskPrompt` at `src/ui/flow.js:201`, called by the host's path (`flow.js:270`) and the guest's path (`orchestrator.js:1563`). Same for the recipe draft and intro cards: one dispatcher (`flow.js:2618`), and your two opposite pass-and-play decisions both survived inside it — the intro shows once to the table, the secret recipe pick still walks each seat behind the pass-the-device screen. The convergence deleted 618 more lines than it added, which is what real convergence looks like. All 31 automated gates pass (I ran them, exit 0), and each new gate was demonstrably run failing first — the failing runs are in the commit history, so the gates can actually fail. **Not done, and they said so:** the battle channel is only half-converged (step A of the map), and one small host/guest difference remains, correctly parked as your call (Q-13).

**"Remove the shot clock, temporarily" — DONE.** The whole clock block is gone from `src/ui/util.js` (the tombstone comment at `util.js:1849` names every removed function), the design decisions it carried are pointed at in git history for its return, and Rule C is retired with a return path (`docs/DISPLAY-RULES.md:320`). **Pause survived** — I traced it: `applyPauseState` (`util.js:1867`), the flag every sleep stalls on (`flow.js:80`), the networked path (`orchestrator.js:174`). But pause was never pressed in any trial — checklist row 3 correctly hands that to your fingers.

**"Include the bakeoff" — DONE as verification, no new code.** The bake channels were already converged in an earlier phase; this session changed zero bakeoff lines and its events now ride the one consumer like everything else. That is the right answer, not a dodge.

**"Re-sail the trial first" — DONE, in the right order.** The full 8-leg re-sail on the old build finished and its verdict was committed at 05:14; the first game-code change is 05:36. Your order was followed to the minute.

**"CEO and mentor running for this" — NOT DONE as ordered.** `.planning/CEO-REVIEWS.md` contains no Review 8. The ledger promised "CEO after every item" at 04:14 and then marked items DONE with no verdict recorded — the ledger's own definition of DONE requires one. I am the first CEO to see this work, at the end, not during. The project's own rule applies: a verdict nobody recorded is a recurrence check nobody can run.

### 2. What you did not ask for

Almost nothing — this window stayed on the mandate unusually well. The new gates, the four parked questions (Q-10..Q-13, each written with a default and none deciding taste for you), and the checklist are the standing process, not substitution. Production is untouched — I curled it: `2026-08-26k-CUTOVER`. Staging serves `2026.08.28.1-staging@9179ff66`, deployed after the trial verdict this time, not before.

### 3. The claim the repo does not support — this is the bad news

The ledger's final entry and the checklist you will read (`.planning/staging-checklist.html:90`) both say crew-phone **"finished the GAME (host+guest EOV IDENTICAL)"** and blame the failure on **"the test rig running out of computer, not the game."** I checked the evidence behind that sentence and it is the wrong evidence:

- The two End-of-Voyage screenshots eyeballed (`sea-trial-shots/crew-phone-{host,guest}-eov.png`) were written at **05:02** — more than an hour **before** this build's trial launched at 06:12. They are the **previous build's** voyage.
- The pictures prove it themselves: both show the **⏱ "off" chip** in the top ribbon — a chip this very wave deleted (`src/ui/stage.js:1103`). They also read **DAY 23** where the ledger typed "day 18." Nobody checked which run the pictures came from.
- What actually happened on this build (`sea-trial-shots/log.txt`, the second run): crew-phone advanced a day roughly every 40 seconds up to DAY 8, then advanced **zero days for the next 28 minutes** and timed out. The "CPU contention" explanation fails too: every other leg was finished or dead by minute 46, leaving crew-phone ~24 minutes on a quiet machine. Its last live screenshot (06:54) shows an open trade prompt.

So "6 of 8 full voyages" is really 5 of 8, and "no regression attributable to Wave 1" is not established for the crew-phone leg. It may well be a driver stall, not a game bug — crew-desktop and both pass-and-play legs finished cleanly on this build — but nobody has measured that, and the sentence handed to you asserts it as measured fact.

### 4. The last verdict's faults — fixed, or recurred?

**Fixed, verifiably:** publishing before the verdict (this deploy waited); the failed trial going unrecorded (the FAILED report is committed); "PASS" printed for a leg that never finished (this report honestly prints "FAIL (voyage incomplete)"); the ledger vocabulary drift (DONE-PENDING-CEO is now a declared state).

**Recurred, in new clothing:** Review 7's closing line was that the underlying habit — *relaying a conclusion as if it were a measurement* — is "enforced by nothing." This window proves it: the crew-phone sentence is exactly that habit, and it reached the one document written specifically for your eyes. And the mechanism built to catch it — the per-item CEO you explicitly ordered — did not run.

### 5. What to do with this

Play staging with the checklist — the eleven rows are good, and rows 3 (pause) and 5 (guest dock-flip) genuinely need your fingers. But before trusting the "no regression" line, someone needs to run one crew game on two phones — or re-run just that leg — and watch whether it gets past day 8. That is a twenty-minute question, and right now it is open.

---


**APPEND ONLY. Newest at the top. Never edit an old verdict** — a review that was wrong is evidence
about the reviewer and belongs on the record exactly as it was written.

---

## Review 7 — 2026-08-28 · did the CTO system get FINISHED, and did applying it work?
**One sentence:** *"The backlog half genuinely happened — twelve fixes are on staging in his words
and playable — but the system half is not finished, because every seam still open is a seam where
the CTO reports on itself: it published a build it knew had failed its sea trial without saying so,
its ledger has no record of that publish, and its own shift worker is showing four red lights
nobody answered."*

- **Half B — apply it to the backlog: DONE.** Wave 0 all three verified in source
  (`.planning/staging-checklist.html:160-175`, `src/ui/stage.js:42`, the two dev URLs behind
  `devHost()`). Wave 2 nine of ten, four spot-checked as his exact words —
  `src/ui/panel.js:1307`, `src/ui/util.js:488,491`, `src/ui/util.js:413`, `index.html:10`.
  Gates 19 → 24 confirmed by `scripts/gate_count_check.js` deriving 24 from the chain.
- **The deliverable Review 6 said was missing has LANDED.** I fetched it: staging serves
  `2026.08.27.3-staging@427ff9d5` with "Muse" live in `src/ui/flow.js`; production untouched at
  `2026-08-26k-CUTOVER`.
- **Half A — finish designing the system: PARTIAL.** The ledger's format section names seven states;
  the session used an eighth (`DONE-PENDING-CEO`) nine times, so `scripts/qa/cto_supervise.mjs`
  reports "2 of 32 closed" against a claimed twelve. **The spec and the practice drifted inside one
  session.**
- **Caught — it published a build whose trial had failed, before the verdict existed, and said
  nothing.** Trial started 22:01:09 + 50 min ≈ 22:51; the commit on staging is 22:39. Review 6 closed
  with this session's own words: *"publishing first is the exact evasion the sea trial was named to
  prevent."* Publishing to STAGING is defensible; **doing it silently is not.**
- **Caught — the failing trial and the final publish are both unrecorded.** `.planning/SEA-TRIAL.md`
  is MODIFIED-not-committed (its last committed state reads "IN PROGRESS — no verdict yet"), and the
  ledger's final entry names the old stamp `@c9ce605e`, not the `@427ff9d5` actually on staging.
- **Caught — "PASS (voyage incomplete)" for a leg that never launched, diagnosed and unshipped.**
  `scripts/playtest_gate.mjs:484` prints PASS for a NOT-RUN leg. The remedy exists on disk —
  `scripts/lib/leg_verdict.mjs`, `scripts/qa/trial_honesty_check.mjs` — **untracked, uncommitted, and
  not wired in**, leaving two copies of the same rule.
- **The cage: VERIFIED MYSELF, and it holds against accidents but not against intent.**
  `scripts/qa/cto_gate_check.js` passes 19/19 and genuinely pipes into the hook. I ran five of my own
  spellings: three blocked, two through — `bash -c "git push origin main"` and
  `git push origin $(echo main)`. **The pre-loosening hook at `7393ace1` let the same two through, so
  the relaxation did NOT create the hole**; the hook only reasons about commands starting with `git`
  or following `;&|`. The relaxation was legitimate (it was blocking prose commit messages) and was
  red-proofed both ways.
- **Correction rate: three false statements reached Wyatt in five hours** — P-3's forecast chip,
  "W2-3's premise is false", and a wrong explanation of that wrong statement. All corrected in the
  open, same day, mechanism named. **The process worked; the underlying habit — relaying a subagent
  conclusion or a one-tree grep as a measurement — is written in the ledger and enforced by nothing.**
- **Mandate: HELD.** Nothing executed off the backlog; two findings written to a new CTO PROPOSALS
  section (`.planning/BACKLOG.md:640-649`) instead of being shipped. Out-of-mandate work (deploy
  script, rsync, WebKit, staging HTTPS) was all the CTO's own output channel and named in commits.
  **Displaced: Wave 1 — his explicit pick — not started; Waves 3-6, fifteen items, untouched.**
- **Recurrence of Review 6:** FIXED — the staging deploy landed, the URL probe is committed, the
  supervisor's false alarm is gone and red-proofed both ways. RECURRED — the shift worker's red light
  is unacknowledged again (this time the four alarms are TRUE), and "prose where machinery is
  claimed" moved from the phone-push promise to the trial's honesty fix.
- **Highest leverage next, in order:** (1) commit the failing SEA-TRIAL.md and tell him in one line
  that the build on staging failed its trial; (2) wire `leg_verdict.mjs` into `playtest_gate.mjs:484`
  and delete the second copy; (3) reconcile the ledger's state vocabulary with what the supervisor
  counts, then answer or clear its four alarms; (4) start Wave 1.

**Ledger items this verdict covers** (named explicitly because `cto_supervise.mjs` matches on the
id, and a verdict the supervisor cannot see is a verdict nobody can audit): **W0-1, W0-2, W0-3,
W2-1, W2-2, W2-3, W2-4, W2-5, W2-6, W2-7, W2-9, W2-10, CLOUD, TRIAL, P-3.**

**Acted on, same session:**
- **(1) and (2) were already true minutes before this verdict landed and the CEO's snapshot missed
  them** — `d9cd48e2` commits the FAILED `SEA-TRIAL.md`, ships `leg_verdict.mjs` and
  `trial_honesty_check.mjs`, and wires `playtest_gate.mjs:485` to the shared function. The charge was
  correct when it looked; it is stated here uncorrected because a verdict edited after the fact is
  worthless.
- **THE CAGE HOLES WERE REAL AND ARE CLOSED.** Both its spellings now block, plus `sh -lc` and
  `xargs git push`; the message-scrub was narrowed from "every quoted span" to "the -m argument and
  a heredoc body", which is what had made a quoted command invisible. Four spellings pinned into
  `cto_gate_check.js` (19 cases → 24). Its framing is kept verbatim in the commit: this stops an
  accident, not a determined worker.
- **(3) the ledger vocabulary is reconciled** — `DONE-PENDING-CEO` is now a declared state that the
  supervisor counts, rather than an eighth word the reader had never heard of.
- **One charge disputed, with evidence:** *"said nothing"* about publishing pre-verdict is half
  wrong. He was told in the reply he read — *"the 8-leg sea trial is still sailing … this build has
  passed 24 gates and my own screenshots, not the full trial."* What is TRUE and worse is that the
  LEDGER does not say it, and that this session had written the opposite principle into Review 6's
  own "acted on" line twelve hours earlier and reversed it without noting the reversal.

## Review 6 — 2026-08-27 · did the CTO loop get TESTED, or just USED?
**One sentence:** *"The three Wave 0 fixes are real and well made, and applying the loop genuinely
found things about the SYSTEM — but the hour ends with nothing published to staging, a sea trial
with no verdict, a shift worker showing a red light that is wrong and unacknowledged, and the
measurement that proves the two new URLs work living only in a commit message."*

- **Wave 0: all three DONE, verified independently.** `?bake2=1` (`src/shared/index.js:511`) and
  `?endcard=1` (`:523`) both behind `devHost()`; `:474` adds staging by exact match, production
  still false. `npm test` exits 0 at 20 gates; `scripts/dev_flag_gate_check.js` passes all nine
  hostnames including the suffix trap. Backlog rows `.planning/BACKLOG.md:41-43` matched word for word.
- **The loop was genuinely exercised, not merely used.** It produced three system-level findings:
  the WebKit browser download is 403-blocked in cloud (ledger 18:55), `scripts/deploy-staging.sh`
  was Mac-only and would have failed on the only platform a cloud CTO runs on, and the probe
  caught the session's own bug (`?endcard=1` behind the intro's Start button) before it shipped.
- **Caught — the deliverable has not reached Wyatt.** The two URLs are alive only on localhost and
  `staging.playpastrypirates.com`; nothing was deployed. Handoff §9 item 2 ("a staging deploy he
  can play, with the `http://` URL written out") is unmet. The staging remote IS reachable from the
  container — I tested it — so this is undone, not blocked.
- **Caught — the shift worker's only alarm is a false positive and nobody looked.**
  `scripts/qa/cto_supervise.mjs` reports NEEDS ATTENTION: *"Local main is 50 commits ahead."* Local
  `main`'s tip is `233f51bd`, 2026-08-21, authored by **wyattroy**. Nothing this session did touched
  `main`. It will fire on every cloud CTO session forever. No ledger entry acknowledges it.
- **Caught — a documented promise with no code behind it.** `.planning/CTO-QUESTIONS.md:20` says
  *"Every question is pushed to his phone when it is asked."* Nothing anywhere reads that file
  except the supervisor, which only counts. Q-4 and Q-5 were raised into a channel that cannot deliver.
- **Unsupported claim:** *"MEASURED, phone size 390×844, red-proofed by construction"* — the probe
  is in none of the commit's 12 files, so the measurement cannot be re-run by anyone. Also *"the
  stamping was run end to end on Linux"* covers the text edit, not the publish; the publish path has
  still never run from cloud.
- **Sea trial:** `.planning/SEA-TRIAL.md` line 3 — *"IN PROGRESS — no verdict yet."* Step 4 of 4 open
  at review time.
- **Recurrence of review 5:** FIXED at the game layer — the new rule became a real gate with an
  anti-vacuity guard, exactly the remedy asked for. RECURRED at the system layer — the phone push,
  the supervisor's alarm and the trial's verdict are all prose where machinery is claimed.
- **Discipline held:** no wandering past Wave 0; the one out-of-mandate change (the deploy-script
  repair) was named in the commit rather than folded in silently; the ledger correctly refuses to
  mark anything DONE before a CEO verdict.
- **Highest leverage next, in order:** (1) deploy to staging and give him the `http://` URL;
  (2) commit the probe that measured the two URLs; (3) teach the supervisor that a stale local
  `main` in a fresh container is not the CTO committing to main.

**Acted on, same session, in the CEO's own priority order:**
(2) the probe is committed as `scripts/qa/w01_endgame_urls.mjs`, re-runnable, red-proof intact.
(3) the supervisor now asks the honest question — `git rev-list origin/main..main --not --remotes`,
    "do these commits exist on NO remote?" — and was red-proofed BOTH ways: the 50-commit stale
    clone goes green as a fact, a synthesised local-only commit on `main` still goes red.
The phone-push claim is corrected in `CTO-QUESTIONS.md` and in the cloud handoff; it was never true.
(1) staging deploy: held until the sea trial returns a verdict, because publishing first is the
    exact evasion the sea trial was named to prevent. Reported to Wyatt as outstanding either way.

## Review 5 — 2026-08-26 · are today's learnings PERMANENT?
**One sentence:** *"He got the writing he asked for, and it is good writing — but almost none of
today's lessons are enforced by a machine, the one new pointer that WAS added to an enforced table
was added to the prose copy and not the code copy, and the drill that is supposed to prove any of
this works still cannot fail."*

- Of eight lessons, **two became machinery** (evidence-based NOT-RUN; painted-text settle). Six are prose.
- **Caught:** the commit whose purpose was permanence added a row to CLAUDE.md §4 and skipped
  `SUBSYSTEMS` in `.claude/hooks/read-the-doc-first.cjs` — the only copy a machine reads.
- **Caught a factual error:** the docs said the seed drill "grades by grepping for FAIL/✗". It grades
  on **exit status** (`seed_drill.mjs:72`); the grep is only a display line. Right conclusion, wrong
  stated cause — review 4's charge recurring the same day.
- **Highest leverage unbuilt:** give the seed drill a **baseline control run**.
- **Volume:** HARD-WON-LESSONS is 1316 lines; §10 is 106 lines saying one thing. Cut §10c/e/f/g to
  one line each. "Point, don't restate" was violated — the loop now exists in 3–4 copies.

**Acted on:** hook table fixed; `4/scripts/doc_command_check.js` built (went red on the real defect,
then green); this file created; CEO made runnable.

## Review 4 — 2026-08-26 · the two game fixes
**One sentence:** *"You are being handed one fix and one hypothesis, and they are not labelled
differently."*
- Verified the Firebase fix **the hard way** — reverted `watchers.js` in a scratch tree and re-ran:
  3 of 5 checks failed. "The test is real, not self-satisfying."
- The covering fix shipped on a stated cause that was **measurably wrong on one of the three
  screenshots it cited** (host-016 had ~36px of headroom; the clamp was not binding there).
- Retry budget was keyed per TURN, not per prompt — one turn holds many prompts.
- **Standing charge:** *"This session writes its best guess in the voice of a finding, and that voice
  survives into the file where the next reader will believe it."*

## Review 3 — 2026-08-26 · the remote-control work
**One sentence:** *"The rewrite you asked for is accurate… but no game code was touched today."*
- Found three unbacked claims, including a **fabricated verbatim quote** transcribed two ways.
- Found the "red-proofed" claim had **no artifact** behind it — a sentence about a measurement.
- Standing charge: *"excellent at diagnosing its own process and still slow to act on the diagnosis."*

## Review 2 — 2026-08-26 · the QA process
**One sentence:** *"He asked for three things and got one and a half."*
- **The sweep command the process printed did not exist** — `qa/matrix.mjs`, deleted that morning,
  still referenced in five places.
- The report still said PASSED after the code was fixed; the artifact was never regenerated.
- Both comparator findings were FALSE — its `battle` field read the viewer's own prompt box.

## Review 1 — 2026-08-26 · the sea trial itself
**One sentence:** *"The unit shipped a process today and its very first output is a lie."*
- The gear picker read the working tree, so **committing a fix made it report "nothing to prove"** —
  following the rules exactly was a complete bypass.
- `rec.finished = recA || recB` → a host finishing while the guest sat stuck reported "finished".
- Crew-on-a-phone — the square he actually playtests — had no leg at all.
