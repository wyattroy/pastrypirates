# THE GLASS CHART — the machinery, and it is the ADVISOR's to work

*Split out of [`CHART.md`](CHART.md) on 2026-09-02 at 10:25 PM ET, at his instruction:*

> **"I want you to take every Glass-focused task on the Chart, and compile it into a new list and
> show it to me. Take each of those OFF the chart. YOU will work on the chart -- the Watch will work
> on the game."**

## THE DIVISION, IN ONE LINE

**The Advisor works THIS file. A watch works `CHART.md`, which is now the GAME.**

**WHY HE SPLIT IT, and it is visible in the numbers: 44 of the 60 open rows were machinery.**
Three quarters of what a watch was being handed had nothing to do with the game — the Glass, the
Chart, the Door, the ledger, the harvest, the ranker. **A watch reading the top of that list was
being sent to fix the list.** Sixteen rows are left, and every one of them is the game.

⚠ **THE SORT WAS MECHANICAL AND FIVE ROWS WERE MOVED BY HAND — SAY SO RATHER THAN PRETEND.** Rows
were classified by counting machinery words against game words. That put `T-081` (wire the kit as a
git subtree) under GAME because it says "promotion" and "merge"; it is machinery. `T-025`, `T-027`,
`T-029`, `T-031` were the same shape. **Any row in the wrong file is one line to move back, and he
should say so if he sees one.**

**HANDLES ARE UNCHANGED AND NEVER REUSED**, so `T-090` means the same row whichever file it sits in,
and every reference in `CHART-LOG.md`, the ledger and git still resolves.

---

- [ ] **★ AN ANSWERED QUESTION NEVER LEAVES `BLOCKED ON WYATT`, SO THE GLASS ASKS HIM FOREVER — and
      he has now reported this exact fault TWICE, about two different cards.** Filed
      2026-09-02T16:3xZ. **Sizing: small, and it is a lifecycle, not a feature.**
      ⟨`T-090`⟩
      ⚑⚑⚑ **PARTS 1, 2 AND 3 ARE BUILT — 2026-09-02 ~7:0x-7:5x PM ET, CEO 125 (PARTIAL). PART 4,
      THE ONE THAT PROVES IT ON HIS PAGE, IS NOT RUN. The row stays open for exactly that.**
      What exists now, so nobody rebuilds it: `scripts/wyclau/lib/chart_model.mjs` holds the ONE
      definition of a question's id (`questionId`/`stripQid`/`QID_RE`) and `glass.mjs` imports it
      instead of its own inline slug; `scripts/wyclau/retire_answered.mjs` writes the `RULED` row and
      deletes the `BLOCKED ON WYATT` row in a single file write;
      `scripts/qa/answered_question_retired_check.mjs` is in `npm test` (111 gates) with 19 cases,
      **red-proofed on the real event** — his five 6:50 PM rules-page questions, verbatim out of
      commit `cb7cfc89` and checked against that commit by the gate itself, replayed against the five
      keys `LAST-HARVEST` really stored his answers under: 5 of 5 caught.
      ✅ **(a) IS CLOSED — 2026-09-03T00:5xZ, CEO 127 (PARTIAL), commit `797c53f3` + its follow-up.
      THE HARVEST IS NOW THE CALLER.** `scripts/wyclau/mark_glass_harvest.mjs` — the command the
      harvest ends on — takes `--retire=<qid>::<his words>` and retires the question **in the same
      act that writes its receipt**; a ruling it is carrying whose question is still live and has no
      verdict is **REFUSED**; and `--rulings=` is **mandatory**, so a tick that carried nothing must
      say `--rulings=none` rather than stay silent. The act itself moved to one definition,
      `scripts/wyclau/lib/retire.mjs`, imported by both callers. Gate: 19 cases, five written RED
      first (the stamp filed a receipt beside his still-asking question; `--retire=` was silently
      ignored; the module did not exist), all green after. `npm test` exits 0, no game code.
      ⚠ **WHAT CEO 127 CAUGHT AND IT WAS RIGHT: the first version's refusal was OPT-IN** — it keyed
      on `--rulings=`, which was optional, so a session that left the flag off stamped a clean
      receipt beside his still-asking question. **The trigger was still "a session remembered", which
      is the sentence this whole item exists to delete.** Fixed in the same watch by making the
      declaration mandatory; two more cases, red first.
      ⚠ **AND A CLAIM IT KILLED, CORRECTED HERE RATHER THAN QUIETLY DROPPED:** the fix described the
      stamp as a command *"a hook requires"*. **It does not.** `.claude/hooks/glass-harvest-first.cjs`
      never names it — it reads the stamp FILE's mtime, and its own deny text still teaches a bare
      `date -u` timestamp, which a gate here then cannot parse. That hook is under `.claude/`, where
      an unattended watch is refused permission to write (proven by three watches); the repair is
      written out in [`CLAUDE-DIR-REPAIRS-PENDING.md`](wyclau/CLAUDE-DIR-REPAIRS-PENDING.md) and
      needs Wyatt's own hands.
      ⚠ **WHAT IS STILL MISSING, SAID PLAINLY BECAUSE THE PROSE AROUND IT DID NOT.**
      (b) ⚠ **THE DOOR — THE ONE WAY INTO EVERY SESSION — STILL TEACHES THE OLD TWO-ACT HARVEST**
      (`.claude/skills/door/SKILL.md:53-58`). **CEO 125: this is the gap that produces instance
      seven.** The edit was written twice and REFUSED BY A PERMISSION PROMPT both times, so a watch
      could not apply it; the exact block to paste is in the ledger under this watch. **A session
      with permission should land it before anything else here.**
      (c) **The gate's catch window is one harvest tick wide, and it says so now.** A `qid` reaches
      `RULED` only when the script wrote it — i.e. only when the bug did NOT happen — and
      `LAST-HARVEST` is rewritten whole on every tick. The permanent half is the guard on the JOIN
      (no collisions, every question carries a written-down id), not a standing audit of history.
      ⚑ **HIS INSTRUCTION, 2026-09-02 6:30 PM ET: *"add it to the TOP of the fix list -- by fix
      list I mean Task List/ Chart"*. `INBOX-20260902T1830Z`. THE PLAN:
      [`SPEC-ANSWERED-QUESTIONS-RETIRE.md`](SPEC-ANSWERED-QUESTIONS-RETIRE.md), **CEO 123 — YES, with
      three corrections, all applied.**
      **FIFTH INSTANCE AT 6:25 PM**, and it is the one he photographed: he answered two questions at
      5:43 and 5:45 PM, got the "waiting" confirmation, left, and his page still asked both forty
      minutes later. **Nothing he did was wrong and nothing was lost.**
      ⚠ **AND THE RECORD BEING FIXED IS NOT THE SAME EVENT AS HIS PAGE BEING FIXED.** The rows were
      retired at 6:26 PM in `17f99bd4`; the Glass session then read his page and found it STILL
      showing "Your call (2)". **It took a republish. A fix that has not been republished is a fix he
      cannot see, and from where he sits those are identical to nothing having happened.**
      **MEASURED BEFORE THE PLAN WAS WRITTEN, and CEO 123 reproduced both independently:**
      the join already exists — `glass.mjs:430` slugs a question's first 40 characters into its id and
      `glassState.rulings` is keyed by it, and slugging his two real rows reproduces both stored keys
      character for character. **So retirement needs no new schema.**
      ⚠ **BUT THE SAME JOIN CAN SILENTLY MIS-ATTRIBUTE HIS RULINGS — PROVEN BY CONSTRUCTION.** Two
      different questions on one item both slug to `t-105-should-the-harvest-retire-the-row`. **His
      answer to one would retire the other, and the record would show him answering a question he
      never saw.** A duplicate question wastes his time; a mis-attributed ruling corrupts a decision.
      **HARDEN THE JOIN BEFORE AUTOMATING ON IT — the plan's one hard constraint, and CEO 123 agreed
      it is correct rather than over-caution.**
      ⚠ **AND THE TRIGGER IS NOT WHAT THE FIRST DRAFT SAID.** `glass.mjs:800` hardcodes
      `rulings: {}`, so **a republish wipes them**; the trigger is *every ruling the harvest READ from
      the live page, before any republish*.
      **FOUR PARTS, IN ORDER:** (1) a stable explicit id per question, not derived from its prose;
      (2) retirement folded into the harvest as ONE commit; (3) **the gate that would have gone RED
      five times today** — fail if any `BLOCKED ON WYATT` row slugs to a key that already has a
      ruling, red-proofed against the pre-repair file; (4) **close on the SYMPTOM** — answer a
      question on the live page and assert it leaves, **with no human editing `CHART.md`**.
      ⚠ **RANK, READ AND NOT ASSERTED:** this row is where the plan lives **because CEO 123 showed a
      separate row was the worse construction** — it scored 108 at rank 4 while duplicating the
      handle `T-107`, and this row already carries four of his notes.
      **AFTER THE MERGE, MEASURED AT 6:50 PM ET: score 140, rank 2 of 59.** The only row above it is
      his own earlier top-priority item at 204. **He asked for the TOP and this is SECOND — said
      here, on the surface he actually reads, because the previous attempt put that disclosure in a
      commit message and CEO 123 caught it: *"he reads the Chart; he does not read commit
      messages."*** A row must not claim its own position; RANK decides and moves rows under it.
      **HIS WORDS:** *"why did my response in the glass not get completed? I already said 'Don't' to
      this question on the Glass once -- now it seems to be asking me again."*
      **MEASURED:** he answered on the page; a watch harvested it at **12:21:40** — its own commit
      says *"his answer was there, unread"* — and wrote it to the Chart as `T-089`. **The question
      row stayed in `BLOCKED ON WYATT` regardless**, so the card kept rendering it. Harvesting an
      answer creates a row; **nothing retires the question.**
      ⚠ **HE ALREADY REPORTED THIS ONCE, ABOUT THE OTHER CARD.** `INBOX-20260901T1310Z`: *"The
      Glass's Your Rulings -- In Hand are stale; there must be a process that triages them and adds
      them to the Tasks list, then removes them from the Your Rulings list."* **That lifecycle was
      built for `## RULED` and gated (`rulings_triage_check.mjs`). `BLOCKED ON WYATT` never got
      one** — so the same fault sat in the card beside it, ungated, until he hit it again.
      **THE FIX IS THE LIFECYCLE HE ALREADY SPECIFIED, APPLIED TO THE SECOND CARD:** when an answer
      is harvested, the question **moves** — out of `BLOCKED ON WYATT`, into the log with his verdict
      — in the same commit that records it. **One act, not two**, exactly as `close_item.mjs` ticks
      the row and writes the ledger together so they cannot disagree.
      **AND GATE IT, because the ungated twin is what allowed this:** extend
      `rulings_triage_check.mjs` (or a sibling) to fail when a `BLOCKED ON WYATT` row has a
      corresponding harvested ruling. Red-proof both ways.
      *(The stale row itself was removed by hand 2026-09-02T16:3xZ so the page stops asking him a
      third time. That is a repair, not the fix.)*
      🔁 **IT IS HAPPENING AGAIN RIGHT NOW — a THIRD instance, measured 2026-09-02T17:4xZ, and this
      one proves the hand-repair does not generalise.** He ruled **"Keep it."** on the black-window
      flash at 17:06Z. A session harvested it correctly and committed it (`778c6f92`, *"chart:
      harvest Glass ruling on the black-window flash check"*) — **and the question is still the ONLY
      data row in `BLOCKED ON WYATT`**, so Your Call is asking him a question he has already
      answered, for the third time in one day. **The harvest is not the fault; the harvest worked.
      The fault is that nothing retires the question in the same act.** Harvest-then-triage-later is
      the design, and the gap between the two steps is a page that lies to him — so the move must be
      atomic, which is what this row already says.
- [ ] **HIS YOUR CALL PILE — THE HALF OF HIS OWN IDEA THAT IS STILL NOT BUILT, split out of `T-090`
      ⟨`T-106`⟩
      by the watch that closed it, at CEO 119's insistence and it was right to insist.** His idea,
      2026-09-02 3:30 PM ET, `INBOX-20260902T193000Z`: *"do you want to put those in the Your Call
      section so I can approve/deny them being closed?"*
      **`T-090` fixed the LABEL — the thing that made his idea point at the wrong pile.** The ten
      rows are now split into five named kinds, each carrying whose job it is, and the sentence on
      his page is written by the tool rather than composed by a session. **What it did NOT build is
      the pile itself**, and CEO 119 named the omission exactly: *"step 4 — your Your Call pile,
      which is the part your idea was actually about — is not built."*
      **WHAT THIS ROW IS, AND IT IS SMALL BY DESIGN:** route the `answered` and `superseded` kinds
      to a close, the `stale-evidence` and `dead-pointer` kinds to a watch that re-measures or
      corrects the wording, and **only the residue to him** — rows whose fate is genuinely his
      say-so, like *"merge the 465-commit branch to main — his own final say-so"*. **That pile is
      one or two rows, not ten**, and the whole value of `T-090` is that it is now possible to tell
      which two.
      ⚠ **DO NOT SEND HIM THE STALE-EVIDENCE ROWS.** Handing him *"is this still broken?"* is
      handing him our homework — he cannot know from a phone whether a trade circle still clips a
      captain's name, and that is seven of the nine. **And never the `answered` ones**: he already
      answered those, and re-asking is the exact fault he was furious about at 1:38 PM.
      ⚑ **HE RULED ON THE TAP ITSELF AT 3:33 PM ET, QUESTION UI, AND CHOSE AGAINST THE MARKED
      RECOMMENDATION — WHICH IS EXACTLY WHY THIS PARAGRAPH EXISTS.** *"Your tap queues it, a watch
      closes it."* **His approval MARKS the row; it does not close it.** The next watch takes the
      marked row through the normal gate — a fresh reviewer's verdict plus evidence — before it
      leaves his list. The recommendation he rejected was that his tap close the row outright, on
      the reasoning that nobody outranks him on *"is this finished from my side"*. **He chose the
      stronger record over the faster page.** (`DECISIONS.md`, 2026-09-02 3:33 PM; commit `3602c85a`.)
      ⚠ **THE COST IS REAL, HE TOOK IT KNOWINGLY, AND IT MUST NOT BE "IMPROVED" AWAY:** a row he has
      approved **stays on his page until a watch runs** — the very delay he was frustrated by all
      day. He was shown that trade in the question and passed over the fast option. **Do not upgrade
      his tap to an immediate close because a session judges the wait too long.** If it bites him,
      the option he declined (close now, a watch audits after) is on the record and he can call for
      it. **This is his decision to revisit, not ours.**
      ⚠ **AND THE WATCH THAT BUILT `T-090` COULD NOT HAVE SEEN EITHER RULING — they were made at
      3:33 PM and sat uncommitted in the Advisor's tree until 4:52 PM, while `7c5cf6a2` landed at
      4:31 PM.** Nothing was lost, but it is the third instance today of the same shape: **a decision
      that exists only in a session's working tree is a decision no other session can obey.** Commit
      his words the moment he says them.
      **Sizing: `chartkeeper.mjs`'s routing plus `glass.mjs`'s Your Call card. No game code, no sea
      trial.** Also folds in `T-090`'s step 3, which shipped as a printed OWNER and not as anything
      that routes — CEO 119: *"nothing re-measures, nothing closes, nothing asks him."*

*Rows tagged **Your ruling:** are his own decisions, triaged out of the RULED waiting room below
(2026-09-01, INBOX-20260901T1310Z). The tag is how he tells his own call from a row somebody else
wrote; `scripts/qa/rulings_triage_check.mjs` keeps each one matched to its settled ruling.*
- [ ] **`npm test` DESTROYS WHATEVER IS WAITING IN `GLASS-NOTE.md` — it consumed this watch's own
      ⟨`T-112`⟩
      note to him, an hour after the same hazard was filed about a session doing it by hand.**
      Found 2026-09-02T22:0xZ by watching the file reset under a green suite.
      *(It reset a second time minutes later; that one is NOT attributed here — a live Glass session
      consuming the note is the mechanism working, and the note did reach `glass.html`. Only the
      first is measured, and the code path below is what makes it certain rather than the timing.)*
      **THE MECHANISM, READ NOT GUESSED:** `scripts/qa/glass_roundtrip_check.mjs:29` runs the real
      generator as `glass.mjs --note "gate: glass_roundtrip_check"`, and `glass.mjs` folds
      `GLASS-NOTE.md` into the page and **resets the file unconditionally** on every run. So the
      note a watch wrote for Wyatt is consumed by a page nobody will publish, and the only copy of
      it is a throwaway `glass.html` the next generation overwrites.
      ⚠ **THIS IS `INBOX-20260902T0350Z` IN A NEW COSTUME.** That entry is about the Advisor running
      `--note` merely to inspect the page and destroying a watch's finished screenshot results. The
      lesson written there — *"a command that LOOKS like a read had a destructive side effect nobody
      warned about at the call site"* — now applies to **the test suite**, which every session runs
      several times an item and nobody thinks of as a write.
      **THE FIX IS ALREADY HALF-BUILT AND WAS BUILT FOR THIS:** `glass.mjs --chart=<path>` is a
      REHEARSAL render that touches nothing outside the file you name (`T-104`, same commit).
      Point the round-trip gate at a fixture Chart and a fixture out-path and the hazard is gone
      for every gate at once. **Do NOT fix it by making the gate restore the file afterwards** — a
      destroy-then-repair is still a window, and this project has already lost a note inside one.
      **Sizing: SMALL. No game code.**
- [ ] **★★★ ONE PROCESS EDITS THE CHART — HIS RULING, AND HE PUT IT ABOVE THE LAUNCH.** 2026-09-02.
      ⟨`T-093`⟩
      **HIS WORDS:** *"I want you to prioritize chartkeeper.mjs, we can't launch ANYTHING until the
      chart is actually functioning -- this is nonsense, what's happening right now."*
      **THIS OVERRIDES HIS EARLIER PRIORITY RULING** (*"the game wins any contested hour until it
      launches"*, same day). He has looked at the result and reversed it: **the Chart is the
      instrument he steers by, and a broken instrument makes every other priority unreliable.**

      **WHAT IS ACTUALLY WRONG, measured today rather than asserted:**
      - **Three sessions write `CHART.md`** — the Advisor, the Glass-update session, every watch —
        and **git's smallest unit is the FILE.** So `close_item.mjs` staging the Chart for its own
        sweep carries another session's uncommitted lines into its commit. **Five times in one
        session.** `git add <path>` is no safer than `git add -A`; path precision cannot help.
      - **The cost is a corrupted record, not lost work.** Commit `59f8b7a7` — *"watch closes his
        black window"* — carries `T-090`, `T-091` and a card repair written by a different session.
        `git log -S` for *"why does T-091 exist?"* answers with the wrong subject. **CEO 104 and 105
        both flagged one-commit-two-jobs; this is the third instance.**
      - **And rows go stale faster than anyone closes them** — the reaper has flagged **10** all
        afternoon, unchanged, because one watch closes one item every 30–60 minutes.

      **THE FIX HE CHOSE, and it is rule 23's own answer:** *what makes these two agree?* — **nothing
      does, so make there be one.** Every writer goes through `chartkeeper.mjs`: it reads, edits and
      commits the Chart, and no session hand-edits `CHART.md` again.

      **WHAT THAT MEANS CONCRETELY, in the order it should be built:**
      1. **A write API on `chartkeeper.mjs`** — add a row, close a row, mark GATED, retire a blocked
         question — each one *read → modify → commit* in a single act, so no window exists for
         another session to carry the edit. `close_item.mjs` already does exactly this for closing;
         **it is the worked example and the pattern to copy, not to reinvent.**
      2. **The Advisor, the Glass session and the Door all call it** instead of editing the file.
      3. **A gate that fails when `CHART.md` changes in a commit that did not go through it** —
         derivable from the commit's own touched-files, and the only thing that stops hand-editing
         creeping back. Without it this is a convention, and Principle 2 says conventions fail here.

      ⚠ **THE ONE THING TO GET RIGHT, because it is where this design can go wrong:** a single writer
      must not become a single point of failure. **If `chartkeeper.mjs` refuses or crashes, a session
      must still be able to record his words** — the Inbox is not the Chart and must stay
      hand-writable, so a harvest is never blocked by a tool being broken. **Losing his words is
      worse than a messy Chart.**

      **SIZING, HONESTLY: MEDIUM, and larger than anything else currently open on this list.** The
      API is small; the migration is every caller; the gate is the part that makes it stick.
      ⚠ STALE-CANDIDATE — unblocked (do the work (his ruling freed it)) — your ruling — **"Done -- I wrote about adding google analytics and firebase"** — ruled on the Glass 2026-09-02 5:45:23 PM ET — freed this row, and the work is still to do
- [ ] **BUILD THE KIT-BEHIND DETECTOR — the half of `T-078` he asked for and nobody has
      ⟨`T-084`⟩
      built. It is UNBLOCKED as of 2026-09-02T13:5xZ and it was blocked by one missing flag.**
      **His condition, in his own words:** *"DO NOT ALSO DELETE THE CHECK. Red-proof both ways: a
      local edit must NOT fail; **a kit that has fallen behind must be reported**."* The first half
      shipped and is gated (`vendor_lock_inverted_check.mjs`). **The second half does not exist** —
      `vendor_check.mjs` currently prints, honestly, that it did NOT check whether claude-kit has
      moved forward, on every path. That admission is a placeholder, not the answer.
      **WHY IT WAS "IMPOSSIBLE" AND WHY IT IS NOT — read this before starting, it is the whole
      story.** Three watches recorded a read of `C:\Users\wyatt\Projects\claude-kit` as REFUSED and
      each concluded the kit was unreachable. **Wyatt was asked and ruled "yes" at
      2026-09-02T12:39:56.363Z** (his RULED table, below) — and thirty-one minutes later a watch
      still wrote *"THE HALF OF HIS SENTENCE THAT CANNOT BE BUILT HERE"* into a gate, because the
      ruling had not been harvested. CEO 106 caught it. **A REFUSAL IS A PERMISSION SETTING, NOT A
      FACT ABOUT THE WORLD.** The fence was `bell.ps1`'s launch line carrying no `--add-dir`; it now
      carries one (commit `9c4edb48`, gated both ways in `bell_check.mjs`).
      **SO THE FIRST WATCH THE BELL RINGS AFTER `9c4edb48` CAN READ THE KIT. Check that first** —
      if the read is still refused, the ring predates the change or the kit is not beside the repo,
      and the launcher's own log line now says `kit: readable` or `kit: not present`.
      **Sizing: small-to-medium.** `install.sh check <repo> wyclau` already answers the question
      from a tree holding both; the work is calling it (or hashing the kit's copies directly) and
      reporting BEHIND as news, in the same four-kind vocabulary `vendor_check.mjs` now uses.
      **Red-proof: a kit deliberately set one commit back must be REPORTED; a kit in step must
      not be.** And case 6 of `vendor_lock_inverted_check.mjs` gets STRONGER when this lands — it
      currently asserts only that the file admits it has not checked. Do not delete it; tighten it.
      ⚠ STALE-CANDIDATE — unblocked (do the work (his ruling freed it)) — your ruling — **"yes"** — ruled on the Glass 2026-09-02T12:39:56.363Z, no note attached — freed this row, and the work is still to do
- [ ] **HARVEST HIS 12:39:56Z KIT RULING INTO `DECISIONS.md` — a two-minute edit this watch
      ⟨`T-085`⟩
      was refused permission to make, and its absence has already cost one item.**
      The ruling: *"May an unattended watch READ the claude-kit folder?"* — **"yes"**, ruled on the
      Glass 2026-09-02T12:39:56.363Z. It is in the RULED table below and **nowhere else**
      (`grep "claude-kit folder" .claude/memory/DECISIONS.md` → 0). `CLAUDE.md` §5: *"A ruling he
      made that nobody harvested is the failure this system exists to stop."*
      **The entry is already written** — it is in the ledger under WATCH 13:10Z and in commit
      `9c4edb48`'s message, including the alternative he did not pick (leave the fence up and keep
      routing kit work to a human) and the scope limit (**this ruling is about READING; nothing in
      it authorises a watch to PUSH to claude-kit**). Paste it in.
      ⚠ `.claude/memory/DECISIONS.md` is permission-protected: an unattended watch's edit is
      refused. **Whoever takes this needs a session that can write it** — or the protection needs
      changing, which is a question for Wyatt, not a repair for a watch.
      ⚠ STALE-CANDIDATE — unblocked (do the work (his ruling freed it)) — your ruling — **"yes"** — ruled on the Glass 2026-09-02T12:39:56.363Z, no note attached — freed this row, and the work is still to do
- [ ] **⚠ THE STAGING DEPLOY IS THE ONE STEP A WATCH CANNOT TAKE, AND THAT — NOT THE EVIDENCE — IS
      ⟨`T-027`⟩
      WHY PARTS 2 AND 3 OF RULING 12 ARE STILL OPEN. Measured 2026-09-02T04:0xZ by the watch that
      tried it. Sizing: one line of config, or one command from an attended session.**
      Everything ahead of the deploy passed on this watch: `npm test` green through its last
      `&&`-chained gate, `gear.mjs` FULL and already paid for by the 0137Z trial (ten legs on
      `2026.09.01.8`, empty NOT-RUN column, empty unjudged column since the 03:00Z watch).
      Then `./scripts/deploy-staging.sh "…"`, `bash scripts/deploy-staging.sh "…"` and
      `bash scripts/deploy-staging.sh` each returned **"This command requires approval."** Three
      forms, one answer; stopped there rather than hunting a fourth wording.
      **Cause, read rather than guessed:** `.claude/settings.json`'s allow list has
      `"Bash(node scripts/*)"` and nothing covering a `bash …/*.sh`, which is exactly why every
      `node scripts/…` command that watch ran went through. `scripts/deploy-staging.sh` is the only
      deploy entrypoint in the repo (`scripts/**/deploy*` → one file), and hand-rolling the rsync is
      rule 14 — the one that takes the live game down.
      **Why it matters beyond this item:** the relay's own liveness guards all test GIT.
      `can_push.mjs` checks four git faults and says "can publish"; the thing that actually stopped
      this watch was the permission layer. Same shape as the push refusal solved four hours ago —
      and every successful staging deploy this project has had was run by an ATTENDED session.
      **Staging is measurably stale as a result:** the wire says `2026.09.01.6-staging@60f969c4`,
      two builds behind the tree, so the preload pass, the about-recipes resize, the call circle
      moved off the question it asks, the storm glide and the guest's camera are all missing from
      the address he plays.
      **The fix is his, and the watch deliberately did not take it** — adding
      `"Bash(bash scripts/deploy-staging.sh*)"` to `.claude/settings.json` grants every future
      unattended watch the ability to publish to a public address, which is not a repair a watch
      gets to make to the one file that exists to be his. See BLOCKED ON WYATT.
      ⚠ STALE-CANDIDATE — stale-evidence (re-measure it on this build) — measured on build 2026.09.01.8; the tree is 2026.09.02.1, so its evidence no longer describes this game
- [ ] **⚠ THE CLOSE GATE READS THE INBOX AS INSTRUCTIONS: A DOLLAR SIGN IN ONE OF HIS ITEMS WILL
      ⟨`T-097`⟩
      SHRED THE FILE, SILENTLY, WHILE PRINTING `CLOSED`.** Found 2026-09-02T18:3xZ by walking into it:
      `close_item.mjs:152` and `:158` call `String.replace` with the rewritten section as the
      REPLACEMENT string, and JavaScript reads dollar-sequences in a replacement string as commands.
      A paragraph that merely QUOTED the gate's own regex contained a dollar followed by a backtick —
      *"insert everything before the match"* — and the gate spliced the file's first 34 lines into the
      middle of an entry. **It exited 0 and printed `CLOSED INBOX-20260901T1335Z`.** Repaired by hand
      the same minute; the damage was 34 duplicated lines, not lost words, because the duplication
      happened to be an insertion.
      **PROVEN, NOT REASONED** — `"HEAD\nBODY\nTAIL".replace("BODY", payload)` with a dollar-backtick
      payload yields `"HEAD\nX HEAD\n Y\nTAIL"`; the same call with `() => payload` yields the literal.
      **THE FIX IS ONE CHARACTER CLASS: pass a replacer FUNCTION at both call sites.** After that no
      INBOX text can ever be read as an instruction.
      ⚠ **WHY THIS IS NOT A CURIOSITY: THE INBOX IS THE ONE FILE THAT HOLDS HIS WORDS VERBATIM.**
      A "$5 bug bounty", a price, a shell snippet, `$foo` in a bug report — any of those in an item of
      his corrupts the record at the exact moment that item is closed. **And the same line has a
      SECOND fault already recorded in `INBOX-20260901T1335Z`'s own entry:** the fate regex has no `s`
      flag, so a multi-line `status:` block is only half-replaced, leaving text under a line reading
      DONE. **Both live in `close_item.mjs:152-158`; fix them together.**
      **Sizing: small — two call sites, plus a red-first fixture whose status block is multi-line and
      whose prose contains a dollar sign.** ⚠ The file is VENDORED from claude-kit and its header says
      edit there; his 2026-09-02 ruling inverted that for `glass.mjs` but has not been extended here,
      so **the first decision is which tree it lands in, and `vendor_check.mjs` will have an opinion.**
- [ ] **★★★ ONE QUEUE, RANKED — HIS DESIGN, AND IT REPLACES THE DOOR'S OWN ORDERING RULE.**
      ⟨`T-083`⟩
      2026-09-02, question UI. **Do these four in order; the first is a hard dependency.**
      **His words:** *"the door should not read oldest-first; the RANK algorithm should do the
      ordering, and the door should read what's at the top. the rank algorithm should prioritize my
      requests over bugs that the Watch generated; and i need a way to say DO THIS NOW such that
      RANK puts it at the top -- eg a checkbox underneath the ideas list that says 'Add to top of
      list'"*
      **WHY IT MATTERS MORE THAN IT LOOKS: there are TWO orderings today and rule 23 says that is the
      defect.** The Door has its own rule (`SKILL.md:81` — INBOX oldest-first, then the Chart) and
      RANK has another. *What makes these two agree?* **Nothing.** His design deletes one of them.
      **AND THE MEASURED COST OF OLDEST-FIRST:** 8 open Inbox items, the oldest from the previous
      day, so **anything he writes now is automatically his lowest-priority item.** That inversion —
      not anyone's discipline — is what forced him to interrupt and repeat himself five times on
      2026-09-02.
      **1 · CONVERGE THE TWO DERIVATIONS FIRST — nothing else works until this lands.** Patch 4's own
      caveat: RANK reorders *within the open-row slots the file already has* and **cannot reorder
      across the two sections the Glass concatenates** (checklist rows, then unfated inbox entries).
      *"The Door reads what is at the top"* is meaningless until there is ONE list to be at the top
      of. This is `PENDING-KIT-PATCHES.md` patch 5 — `glass.mjs` imports
      `scripts/wyclau/lib/chart_model.mjs` and the duplicated fate/concat block is deleted.
      **Unblocked as of the `vendor_check` inversion.** Its gate
      (`chart_model_agrees_with_glass_check.mjs`) becomes a tautology once one function cannot
      disagree with itself and should be **RETIRED, not kept** — patch 5 says so itself.
      **2 · RANK GAINS A SOURCE SIGNAL.** *"prioritize my requests over bugs that the Watch
      generated."* **Derive it, never add a field:** his items carry his words (an Inbox entry with a
      `>` quote block, or a Chart row quoting him); watch-filed rows carry a watch stamp. Rule 9.
      **3 · THE DOOR DROPS ITS OWN RULE.** `SKILL.md:81`'s *"INBOX first — the oldest OPEN item"*
      becomes *"work whatever RANK put first."* **Delete the old rule rather than adding beside it**
      — leaving both is the two-orderings fault re-created.
      **4 · THE "ADD TO TOP" CHECKBOX**, under the Ideas box on the Glass, and the harvest carries
      the flag through so RANK sees it. **This is the half that removes HIM from the mechanism:**
      every interrupt on 2026-09-02 required him to notice, interrupt and repeat himself.
      ⚠ **ONE SLOT, NOT A QUEUE.** Ticking it on a second item must displace the first, deliberately.
      **A gate fails the build on two.** An interrupt with a queue is just another backlog, which is
      the fault this whole design removes.
      ⚠ **AND IT MUST BE VISIBLE ON THE PAGE** — he must see what he pinned and whether it has been
      taken. *An interrupt he cannot see is indistinguishable from one that was ignored*, which is
      exactly what happened all night.
      ✅ **STEP 4 IS BUILT — 2026-09-02T21:4xZ, `T-104`, commit `c8a475a6`, CEO 121.** It arrived as
      his own later refinement (a BUTTON beside Send, not a checkbox under the box), and all three
      constraints above hold: one slot enforced by the write on both sides, two pins fail the build
      naming both, and the pin shows on the Ideas list the moment he taps and on the Tasks card once
      a session carries it over. **Steps 1–3 are untouched, and step 3 is the one that matters next:
      the Door still reads oldest-first, so there are still two orderings.**
- [ ] **A SESSION MUST READ THE RECORD BEFORE PUTTING A QUESTION TO HIM — I asked him something he
      had already answered, twenty minutes after he answered it.** Filed 2026-09-02T16:3xZ.
      **Sizing: this is a rule and a hook, not a feature.**
      ⟨`T-091`⟩
      **WHAT HAPPENED, with timestamps:** his answer was harvested at **12:21:40**. The Advisor put
      the same question to him through the question UI at roughly **12:22**, and closed the item on
      the second answer at **12:24:03**. **The answer was on disk before the question was asked.**
      He had to decide the same thing twice and then work out why.
      **THIS IS THE FAULT `DECISIONS.md` EXISTS TO PREVENT**, and the rulebook states it directly:
      *"answer from them, never re-ask a settled question. A ruling he made that nobody harvested is
      the failure this system exists to stop."* **The Advisor read neither the page nor
      `BLOCKED ON WYATT` before asking.**
      **THE MECHANICAL FIX, because a prose rule is what already failed here (Principle 2):** a
      `PreToolUse` hook on `AskUserQuestion` that greps the question's own subject against
      `.claude/memory/DECISIONS.md`, `## BLOCKED ON WYATT` and the live `glassState`, and **blocks
      with the existing answer** when it finds one. **It must fail OPEN on an unreadable source** —
      a hook that silently swallows a real question is worse than the double-ask it prevents.
      **THE CHEAPER HALF, worth doing even if the hook is not:** the Advisor's own routine gains one
      line — *before any question to him, read `BLOCKED ON WYATT` and the newest harvest.* It is
      thirty seconds and it would have caught this one.
- [ ] **`_t103_redproof.mjs` REWRITES TRACKED FILES ON A BRANCH THREE SESSIONS SHARE.** Filed
      ⟨`T-123` · size: S⟩
      2026-09-03T02:xxZ by CEO 132, which **declined to run it for this reason** and established its
      finding by reading instead. It writes old code over `glass.mjs` and `chartkeeper.mjs` and
      restores in a `finally`; **two commits landed from other sessions inside its review window**,
      and any `git commit -a` from another watch in that gap commits reverted code.
      **The general form is worth more than the file:** showing a check RED against an earlier commit
      is a thing every item here needs, and doing it by rewriting the working tree is the wrong
      mechanism. **A scratch checkout (`git worktree` at the ref, or extracting to a temp dir and
      pointing the gate at it) does the same job and touches nothing shared.**
      ⚠ **AND ITS SIBLING LIMIT, WHICH CEO 132 ALSO CAUGHT:** it restores only those two files, so a
      case reading anything else — the runbook, a hook, a doc — **cannot go red under it**, and one
      was reported as having done so. Whatever replaces it must restore the whole tree at that ref
      or say which files it did not. **Sizing: SMALL. No game code.**
- [ ] **AFTER HIS FIRST DRAG, RANK STOPS RANKING THE CHECKLIST — AND THE SEVEN ROWS HE WAS TOLD
      ⟨`T-121` · size: S⟩
      "WILL NOT MOVE" GO TO THE BOTTOM.** Filed 2026-09-03T02:xxZ by CEO 132, against `T-103`.
      **MEASURED, NOT REASONED:** his page saves the WHOLE sequence, so `--order=` stamps all 50
      draggable rows, and a dragged row scores 4950–4999 against a **measured top derived score of
      196** on the live Chart (`chartkeeper.mjs`'s `score()`). So from his first drag onward every
      undraggable row and every task filed afterwards sits below all fifty, permanently, until
      somebody runs `--order-clear` — **and he has no way to run that from the page.**
      ⚠ **THIS MAY BE CORRECT BEHAVIOUR FOR A DRAG-TO-REORDER LIST AND IT IS STILL A DEFECT**, for
      two reasons that do not depend on that judgement: (a) `chartkeeper.mjs:255` prints *"Anything
      you did not drag keeps its derived rank, underneath yours"*, which is true of the command and
      false of how his page uses it — there is no such thing as "did not drag"; (b) his note told him
      the seven twinned rows *"will not move"*, and on the next load `applySaved` lifts every named
      row above them, so all seven relocate to the bottom. **He was told the opposite of what
      happens.** The note is corrected; the behaviour is not.
      **TWO SHAPES, and the second is probably his call:** save only the rows AHEAD of the last one
      he actually moved, so the tail keeps its derived rank — or give him a way back on the page
      ("use the ranked order"), which is one button and one `--order-clear` in the harvest.
      **Sizing: SMALL. No game code.**
- [ ] **THE PAGE AND THE CHARTKEEPER EACH DECIDE "IS THIS HANDLE AMBIGUOUS?" ON THEIR OWN — rule 23,
      ⟨`T-122` · size: S⟩
      in the fix written to close rule 23's last instance.** Filed 2026-09-03T02:xxZ by CEO 132.
      `glass.mjs` counts duplicates across **open checklist rows only**; `chartkeeper.mjs` counts any
      head line with a checkbox within 11 lines above it, checklist **or inbox**. A handle those two
      disagree about is `T-103`'s original fault returning: the page offers a drag the command then
      refuses whole, and he is told it saved.
      ✅ **MEASURED TODAY: ZERO DISAGREEMENTS** — `--order=` accepted all 50 handles the page
      offered. **Latent, not live**, which is why it is a row and not a stop-everything.
      **The fix is one definition** imported by both, in `scripts/wyclau/lib/chart_model.mjs`, where
      `idOfRow` already lives. **Sizing: SMALL. No game code.**
- [ ] **★★ "WHAT IS BEING WORKED ON RIGHT NOW" — design approved by CEO with changes, all applied.
      His ask 1 of five. Spec: [`SPEC-WHAT-IS-IN-HAND.md`](SPEC-WHAT-IS-IN-HAND.md). Sizing: SMALL.**
      ⟨`T-094`⟩
      **HIS WORDS:** *"what is being worked on RIGHT NOW? that needs to be visible just underneath
      the emoji status."* Then: *"design a fix, get CEO's approval, then add it to the top of the
      chart."* **Verdict: APPROVED WITH CHANGES — and the changes were not cosmetic.**
      **BUILD IT THIS WAY — write the claim the way the CLOSE is already written.** `close_item.mjs`
      appends a fixed machine-written line on close; the claim half is human prose. Make them
      symmetrical: `publish_status.mjs` gains an **`## In hand`** block in
      `.planning/wyclau/status/<machine>.md`, the same shape as the `## Long run in flight` block it
      already writes — and `glass.mjs` already reads that file (`:614`). One more `split`.
      **WHY NOT THE OBVIOUS VERSION (parse the ledger):** `.planning/CTO-LEDGER.md` has **15**
      `### WATCH` headings and **exactly 4** match a parseable shape — the tidy ones are all from the
      last two hours, and nothing prescribes the format. **A regex over that finds nothing this
      morning and goes silent the first time a watch words its heading its own way.**
      **FOUR STATES, and the fourth is the point:** in hand · nothing in hand · **⚠ claimed but
      COLD** · unreadable. **A watch can claim and end without closing — that happened twice today,
      deliberately** — so an open claim outliving its watch is normal, and must never read as
      "being worked on right now". COLD is derived from a `staleAfterMinutes` the block declares
      itself, exactly as the long-run block already does. **No new constant.**
      **THE BOUND, HONESTLY:** a stale claim is NOT self-clearing within a Bell interval. Rings were
      **40, 60, 50 and 30 minutes** apart today, and a watch can end having pushed nothing. **Up to
      about an hour, unbounded when the Bell is not ringing** — which is why COLD is required.
      ✅ **AND HIS ASK 2 IS ALREADY FIXED, BY ANOTHER ROUTE — do not build it here.** The browser
      clock the first draft proposed **already exists** (`glass.mjs:900-930`, two clocks, since
      2026-08-31). The clock was never the fault; a published page cannot see a commit made after it
      was generated. **The Door's new step 6b closes it** — the watch now messages the Glass to
      publish the moment it lands work.
- [ ] **⚑⚑ HIS "DO NOW" BUTTON — BUILT 2026-09-02T21:4xZ, CEO 121 (PARTIAL), commit `c8a475a6`.
      ⟨`T-104`⟩
      Deliberately NOT ticked: one joint is still a session remembering something.**
      Glass, 2026-09-02, 3:09 PM ET. **His words, verbatim:** *"Do Now: in the Glass, Add a "DO now"
      button next to "Send to the Chart" button that tells RANK to put this task at the top"*
      **WHAT HE CAN DO NOW — measured by PRESSING it in a browser, not by reading the code:** the
      button sits beside Send to the Chart; a tap saves the idea carrying its flag, clears the box,
      paints a `DO NOW` tag on it at once, and tells him one slot displaced the other. A session
      carries it over with `chartkeeper.mjs --do-now=<handle>`, and RANK puts that row first with
      **YOU SAID DO NOW** beside it. Two pins cannot exist: pinning releases the previous one in the
      same act, and two arriving by hand fail the build naming both. The press, photographed:
      [`.planning/posed/glass-donow-pressed.png`](posed/glass-donow-pressed.png).
      ⚠ **THE ONE GAP, AND IT IS WHY THIS IS NOT TICKED: the joint between his tap and RANK is a
      SESSION reading the page by hand.** `do_now_check.mjs` case 9 fails the build if the harvest
      runbook stops naming the command — but a gate can prove the SENTENCE is there, never that a
      session typed it. **Closing it for real means the harvest carrying the flag mechanically**,
      which is the same shape as `T-105`'s remaining layers and is probably one job with them.
      ⚠ **AND THE DOOR STILL DOES NOT SAY IT — the one-line edit is written and was REFUSED, and
      the refusal's exact words are recorded rather than its cause inferred.** The Glass runbook now
      carries the instruction; `.claude/skills/door/SKILL.md`'s own harvest step still names the
      ideas and the rulings and not the pin. **His ruling 5:43:55 PM ET — *"Let the watch write them
      -- I allow edits to hooks and skills"* — is in force, and commit `0472a129` measured that this
      project denies NOTHING under `.claude/`.** The edit was attempted anyway at 2026-09-02T22:0xZ
      and came back: *"Claude requested permissions to write to
      C:\Users\wyatt\Projects\pastrypirates\.claude\skills\door\SKILL.md, but you haven't granted it
      yet."* **So the blocker is the harness's own rule for unattended sessions, which no project
      setting can grant — the fourth time on this branch that a permission he gave and the mechanism
      meant to carry it turned out to be different things.** One paste at the laptop finishes it; the
      text is in `GLASS-UPDATE-SESSION.md`'s harvest step, ready to copy. **Sizing: SMALL.**
- [ ] **⚠ THE WRITE PASS SILENTLY REWROTE A CHARACTER OF WYATT'S OWN TEXT.** Found 2026-09-02T15:xxZ
      ⟨`T-008`⟩
      by an independent read-only verification of the sweep, which was looking for lost rows and
      found this instead. In the sweep commit `a70451f2`, the row two lines above this one had its
      curly apostrophe **U+2019 turned into ASCII `'`** — *"the Glass’s Ideas box"* became *"the
      Glass's Ideas box"* — while the row was being re-emitted with its `T-008` handle.
      **WHY THIS IS NOT PEDANTRY.** CEO 91's rule is that a row's FIRST LINE IS HIS and the tool
      never touches a character of it; there is a gate case asserting exactly that ("every row's
      first line survived the write byte for byte") and it is GREEN, so it is not asserting what it
      claims — the likeliest reading is that the fixtures contain no non-ASCII punctuation, which is
      the `\Z`-in-the-fixture lesson from this same file family, again. This project has already
      paid for one character of punctuation once: *"Attack's − is U+2212, not ASCII."*
      **AND THE SHAPE IS WORSE THAN THE INSTANCE.** A write pass that normalises a character today
      normalises a word tomorrow, in the one document that carries his words verbatim, with a green
      gate over it. Nothing here is urgent — the row is open, the meaning is unchanged — but the
      SILENCE is the defect.
      Start by making that gate's fixture carry curly quotes, an em dash and an accented character,
      and watch it fail. Do not "fix" the apostrophe by hand first: the failing gate is the evidence.
- [ ] **A GLASS TICK CAN STILL WALK PAST STEP 3, AND ONE DID — TWO MINUTES AFTER THE FIX SHIPPED.**
      ⟨`T-074`⟩
      CEO 100 dated it to the minute and this watch confirmed it: `.planning/wyclau/LAST-HARVEST`
      reads `2026-09-02T10:35:50Z` (written only by step 4) and `GATE-LOG`'s newest line is still
      `10:29:01Z` (the watch's own bench test). **The tick ran step 4 and left no verdict at step 3.**
      ⚠ **THE ABSENCE OF THAT LINE IS THE NEW MECHANISM WORKING, NOT FAILING** — before 10:33Z there
      was no way on earth to tell a skipped gate from an unwired one, and the very first use of the
      log caught a skip. Do not read this row as "the fix did not work."
      **WHAT IS ACTUALLY MISSING: a gate the tick cannot walk past.** Step 3 is an instruction in a
      runbook, and `glass_gate_verdict_logged_check.mjs` case 8 can only check that the runbook SAYS
      the right thing — it cannot see whether the session typed the command. Fix shape: make the
      later steps refuse. A `mark_glass_published.mjs` that declines to stamp when `GATE-LOG` has no
      line newer than `LAST-HARVEST` would close it mechanically — **but that file is VENDORED**
      (`.claude/wyclau/MANIFEST.sha256`), so this needs a session that can reach claude-kit, or a
      non-vendored pre-step. **Not a firmer sentence. Sentences are what failed.**
- [ ] **A SECOND TRIAL CAN BE STACKED ON A LIVE ONE — the guard erases itself about a minute in. Filed 2026-09-01T19:30Z, measured, not fixed (one item).**
      ⟨`T-014`⟩
  `scripts/wyclau/start_trial_detached.mjs:56` refuses a duplicate only `if (prev && prev.pid)`,
  reading `.planning/wyclau/LONG-RUN`. But the trial's own progress writer,
  `scripts/wyclau/longrun_status.mjs:108-119`, rewrites that marker as a fixed five-field object —
  it deliberately preserves `startedAt` and **drops `pid`, `runId`, `reportPath` and `logPath`**,
  every field `start_trial_detached.mjs` calls the birth certificate. Measured live at 19:15:19Z,
  62 seconds after launch: the marker held `what/startedAt/updatedAt/progress/staleAfterMinutes`
  and no pid. So from a minute in, the only mechanical protection against two 88-minute trials
  fighting over `sea-trial-shots/` is gone, and a later watch also cannot learn from the marker
  which report the live run is writing. Both files are VENDORED — fix in claude-kit, then re-vendor.
- [ ] **`can_push.mjs` SAYS "CAN PUBLISH" TO A WATCH WHOSE `git push` IS THEN REFUSED — twice now on
      ⟨`T-011`⟩
  this branch, and it is the one fault the relay cannot survive. Measured 2026-09-02T03:xxZ, not
  fixed (one item). Sizing: small.** The Door's own words are *"a watch that pushes nothing is
  invisible, and an invisible watch is indistinguishable from a dead one."* `can_push.mjs` is the
  guard against exactly that, and it checks **four** faults — detached HEAD, no upstream, rebase in
  progress, merge in progress (`scripts/wyclau/can_push.mjs:21`). **A sandbox or permission layer
  that refuses `git push` outright is not among them**, so the script prints `can publish` and the
  watch works a full turn into a void.
  **It has now happened twice, to two different watches, both on `claude/cloud-handoff-planning-a9ay1u`:**
  the 01:52Z watch (commit `33e94b89` local-only; rescued by the 02:19Z watch, which flagged it as
  *"worth a row if it happens a third time"*) and this 03:00Z watch (two commits held locally).
  **Both watches did everything right and neither could tell in advance.**
  **Why it is worse than an ordinary failure:** the previous occurrence was only caught because a
  LATER watch on the same machine happened to be able to push and noticed the stranded commit. That
  is luck, not a mechanism. If both watches in a row are refused, the work is simply gone from every
  other machine's view while the ledger says it happened.
  **Fix shape, and it must not be a fifth hand-typed case:** the honest check is to ask git whether
  a push would succeed rather than to enumerate reasons it might not — `git push --dry-run` against
  the upstream — and report the refusal in the script's own words. Rule 9: derive the answer,
  never keep a list.
  > **⚠ SHARPENED AT THE END OF THE SAME WATCH, AND THE REAL CAUSE IS MUCH NARROWER — AND FIXABLE
  > TODAY.** The push was **not** refused by anything about pushing. It was refused by the **command
  > FORM**. Measured, in this order, on one machine in one session:
  > `git push` → refused · `git push origin HEAD` → refused · `git push origin <branch-name>` →
  > **SUCCEEDED**, `916067cc..89bf93d4`.
  > So the permission allowlist evidently matches `git push origin <branch>` and not the bare or
  > `HEAD` forms. **That means two watches lost their work to a habit of typing `git push`, not to a
  > sandbox that forbids publishing** — and the 01:52Z watch's commit sat stranded for half an hour
  > for the same reason.
  > **Two cheap fixes, and they are independent:** (a) `can_push.mjs` should run `git push --dry-run`
  > and would have caught this instantly; (b) the Door and the watch runbook should say **push with
  > the explicit branch name**, because that is the form that works. (b) costs one line and removes
  > the failure entirely.
- [ ] **`CHART.md` IS A HOT FILE THREE SESSIONS WRITE, AND GIT STAGES WHOLE FILES — so an
      uncommitted edit is always carried by whoever commits next, into THEIR commit message.**
      Filed 2026-09-02T16:4xZ after it happened five times in one session. **Sizing: the mitigation
      is a habit and one line of the Door; the structural answer is bigger and is his call.**
      ⟨`T-092`⟩
      **THE MECHANISM, MEASURED RATHER THAN GUESSED — and the first guess was wrong.** It is NOT
      `git add -A`: neither the Door nor `close_item.mjs` prescribes it, checked. What actually
      happens is plainer and unavoidable in git: **`close_item.mjs` legitimately stages `CHART.md`
      for its own sweep, and staging a file takes the WHOLE file** — including another session's
      uncommitted lines in it. **`git add .planning/CHART.md` is no safer than `git add -A`. Path
      precision does not help, because the unit git stages is the file.**
      **WHAT IT COSTS, and it is not lost work — it is a corrupted record.** On 2026-09-02 at
      12:38:33, commit `59f8b7a7` — *"watch 16:09Z closes his black window"* — carried `T-090`,
      `T-091` and a `BLOCKED ON WYATT` repair written by a different session. The rows work. **But
      the reasoning for them now lives under a commit about a console window**, so `git log -S` for
      *"why does T-091 exist?"* answers with the wrong subject. **CEO 104 and CEO 105 both flagged
      "one commit doing two jobs" as a fault; this is the third instance and the first where it was
      done TO a session rather than BY one.**
      **THE WINDOW IS AS WIDE AS WHATEVER YOU DO BETWEEN EDITING AND COMMITTING**, and the worst
      offender is the obvious one: **running `npm test` first makes the window minutes wide.**
      **THE HABIT, which is cheap and works today: COMMIT FIRST, TEST AFTER** — the reverse of what
      feels careful. If the suite then fails, fix it in a second commit; a red commit that is
      honestly described beats a correct commit filed under someone else's subject. *(The Door's
      step 6 currently says "Commit (`git pull --rebase` first), push" at the END of a sequence that
      includes running the suite. One reordered sentence.)*
      ⚠ **AND THE STRUCTURAL QUESTION, WHICH IS HIS AND IS NOT SMALL:** this is the cost of one plan
      file that every session writes. Principle 1 says one of everything, and that is right — but
      **`CHART.md` is now edited by the Advisor, the Glass-update session and every watch, and git
      has no smaller unit than the file.** The options are (a) live with it and keep the window
      shut, (b) split the Chart so different writers touch different files, which trades this
      collision for a drift problem the project has already paid for, or (c) have every writer go
      through `chartkeeper.mjs` so there is one process editing it rather than three. **(c) is the
      one that fits rule 23's question — *what makes these two agree?* — and it is the largest.**
- [ ] **Committed is not delivered: a note in git is not a note on the page** — a watch committed
      ⟨`T-024`⟩
      real content into `GLASS-NOTE.md` (`4cf59101`) and it never reached Wyatt, because the
      session that commits a note and the session that next publishes are not the same one. Same
      class as the publish-stamp fault. Routed here by the publisher, which explicitly did not
      propose a mechanism itself.
- [ ] Day 2 — Glass v3: the interactive rebuild (tap-to-rule cards, ideas box, daily lesson,
      ⟨`T-025`⟩
  Captain's log) on the thin-surface architecture (design, section IV)
- [ ] **HIS FOUR GLASS-PAGE ASKS — THREE OF THE FOUR NOW SHIPPED. What is left is the two that need new UI: expandable rows and a per-item comment box. FIVE HOURS OLD WHEN FILED, ASKED FOUR TIMES, NEVER A
      ⟨`T-076`⟩
      ✅ **SHIPPED 2026-09-02, in this order:** the Chart re-prioritises itself (RANK runs in every
      watch via the Door, and the two derivations were converged so it ranks the list he actually
      sees) · The Lesson moved BELOW the Chart · the card renamed to *The Chart (Tasks To Do)* ·
      next-to-be-completed first, re-ordered on every tick.
      ⏳ **STILL OPEN, and they are the two that need new interface rather than new ordering:**
      **expandable rows** for fuller context, and **a comment box under each item**. Both are
      `glass.mjs`, both are now editable in-repo, and neither is blocked.
      ⛔ **NOT part of this row:** *remove items once complete* — SWEEP exists but is still the
      seven-day-with-a-stub form he OVERRULED, and it cannot ship until the done count is
      re-sourced from `CHART-LOG.md`. That is kit patch 6, filed separately.
      ROW UNTIL NOW. THIS IS THE NEXT ITEM, AHEAD OF EVERYTHING.** Wyatt, 2026-09-02T07:xxZ:
      *"why have NONE of my changes to the glass been made??????????? i asked for them FOUR HOURS
      AGO."*
      **He is right, and the reason is measurable rather than mysterious:** all four asks live in
      `## THE IDEA INBOX` (this file, ~line 1320) tagged **SCHEDULED**. `glass.mjs:385` counts an
      inbox entry as an open task **only when it has NO fate** — and `SCHEDULED` is a fate. **So
      marking them "SCHEDULED" made them invisible on his own page AND invisible to a Watch picking
      its one item, simultaneously.** They have never had a `- [ ]` row or a `T-` handle. A watch
      noticed two of them and wrote *"STILL NOT BUILT AND NOT FILED ANYWHERE ELSE"* (line ~225) and
      still did not file them.
      **THIS IS THE AUDIT'S OWN HEADLINE, PLAYING OUT AGAINST THE AUDIT ITSELF:** *"a row that says
      SCHEDULED with no owner and no position in a queue is a parked row wearing a better word."*
      **THE FOUR, in his words, oldest first:**
      1. **00:59:32Z** — *"You need to update Tasks list dynamically — it is stale."* (the
         Chartkeeper; REAP is live, RANK is not — see `PENDING-KIT-PATCHES.md` 4)
      2. **00:59:32Z, repeated 03:45:45Z** — *"Move The Lesson section below it."* / *"Move The
         Lesson to below Tasks."* **Asked twice. One CSS/DOM move in `glass.mjs`.**
      3. **03:46:13Z** — *"rename Tasks to The Chart (Tasks To Do)."* **One string.**
      4. **03:49:02Z** — *"Make all tasks in The Chart expandable for fuller context. Let me write a
         comment under each one if I choose to. Order the list with the next-to-be-completed at the
         top. re-order the list dynamically. Remove items from the list after they are complete."*
      **SIZING, HONESTLY: items 2 and 3 are minutes and are pure `glass.mjs`.** Item 4's expandable
      rows and comment box are a bigger piece of the same file. **`glass.mjs` IS VENDORED — edit in
      claude-kit, then re-vendor**, which is the friction that has been quietly deferring all of
      this. **Do items 2 and 3 first and publish, so he sees movement on the page within one tick.**
      ⚠ **AND THE ADVISOR'S OWN RECOMMENDATION WAS TO SHIP THIS HALF FIRST** —
      `SPEC-CHARTKEEPER.md`: *"a perfectly-ranked list still reads as gibberish on his phone if
      every row is 90 truncated characters."* **That recommendation was made and then not carried
      into a row anybody could take.** The backend half has had seven watches; the half he can see
      has had none.
- [ ] **NOTHING IN THIS PROJECT EVER RUNS THE GLASS PAGE'S OWN JAVASCRIPT — so every behaviour on
      ⟨`T-120` · size: M⟩
      the one surface Wyatt touches is guarded by a SOURCE SEARCH.** Filed 2026-09-03T02:xxZ by
      CEO 132, against the `T-103` drag. **Its words:** *"Gut the body of `applySaved` and all three
      still pass. And nothing in this project executes the Glass page's JavaScript — no browser
      gate, no jsdom, no `vm`. I checked."*
      **WHY IT IS NOT A STYLE POINT.** The fix CEO 131 called *the worst, because it made the page
      lie to him* — putting his saved order back on the rows when the page loads — is today backed
      by a grep for the string `applySaved();` and by one hand trace. The posed pair cannot reach it
      either: with no saved order in the page's state the function returns on its first line, which
      is exactly why both "after" screenshots read *"This view can't save an order."* **The sentence
      on his page that this backs is the same sentence that was FALSE last time.**
      **THE SHAPE OF THE FIX, and it is small because the page is already renderable to a file:** the
      posed harness (`scripts/qa/_t103_pose.mjs`) already drives a real Chrome over a rendered Glass
      with real pointer and touch events. What is missing is SEEDING STATE — publish a page whose
      `glassState` already holds an order/ideas/rulings, load it, and assert what the page does with
      it. That single capability covers `applySaved`, the ideas list, the rulings paint and the
      DO NOW pin at once. **Do not build a jsdom shim** — `tiny_dom.mjs`'s own header says why.
      **Sizing: MEDIUM. No game code, no sea trial.**
- [ ] **Repair the two disarmed Advisor gates** (CEO 83, all four findings verified in the code).
      ⟨`T-002`⟩
      `claim-before-game-code.cjs` appends the ledger path **inside its own deny branch**, so it
      fires once then waves every later edit through — and forges evidence
      `advisor-triages-watch-works.cjs` reads. That one is also blind to **untracked** files
      (`:83` excludes `??`), which is half the collision its own header cites. And `isGameCode()`
      is false for `scripts/qa/*`, `.claude/hooks/*` and `.planning/*`, so it would not have fired
      once during the night that earned it. **Both are unregistered from settings.json as of
      2026-09-02 on his ruling** — they give no false assurance while they wait. `file-his-words.cjs`
      works and stays armed.
- [ ] The Blade hour (Wyatt + a session, ~30–60 min): register the Bell, the ring test both
      ⟨`T-021`⟩
  directions, the O2 publish test — runbook `scripts/wyclau/RAZER-SETUP.md`
  **PARTIALLY DERIVABLE, measured 2026-09-02T03:5xZ: `schtasks /Query /TN "wyclau-bell" /V` on
  this machine shows the task registered and Enabled (Status: Ready, last ran 23:48, next 23:58)
  — the Bell-registration third is done. The ring-test and O2-publish thirds are not checkable
  this way; still needs Wyatt or a session that can run them.**
- [ ] **THE DE-SHOUTING WRITES HIS OWN NAME IN LOWER CASE, ON HIS OWN PAGE. Found 2026-09-02T18:xxZ
      ⟨`T-127`⟩
      ⚠ **RENUMBERED `T-088` → `T-127`, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart.** Two open rows carried `T-088`, so `chartkeeper.mjs:860` treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and **his dragged order named it twice and could not say which row he had moved.** Handles are never reused; `T-088` still resolves in `CHART-LOG.md` and in git history.
      by photographing the real Glass at 390x844, not by a fixture — it is invisible to every
      hand-written test case in the gate. Sizing: SMALL, `glass.mjs` only, no game code.**
      **WHAT HE SEES**, in `.planning/posed/glass-after-T095.png`, on at least four numbered rows:
      *"the seat wyatt actually playtests"* (row 10), *"a character of wyatt's own text"* (row 20),
      *"git stages whole files"* row (25), and the section name itself as *"blocked on wyatt"*
      (row 2). **WHY:** `shortTask()` sentence-cases any run of two or more all-caps words, and
      watches write row titles in capitals for emphasis — so `WYATT` inside a shouting run is
      lowercased along with everything else. The rule has no notion of a proper noun.
      **The existing carve-outs are the shape to follow and they are already derived rather than
      listed** — a lone all-caps word is a name, a token carrying a digit is an identifier, a lone
      `I` is a fact about English. His own name is the same kind of fact. ⚠ **Do not "fix" it with a
      list of blessed words** (rule 9); and whatever lands must keep the six cases the gate already
      holds, including `CEO 110`, `T-088` and `FROM A HAND-TYPED NUMBER`.
      **Not fixed by the watch that found it: one item, and this is `T-088`'s subject, not `T-095`'s.**
- [ ] **THE GATE'S VERDICT IS MACHINE-LOCAL AND WYATT CANNOT SEE IT** — CEO 100's finding 5, and the
      ⟨`T-075`⟩
      untracked half of `T-018`. `.planning/wyclau/GATE-LOG` is one small file on one laptop,
      surfaced nowhere on his page. **The gitignore is correct and is not the thing to change** —
      a tracked log line committed beside the note reset would make that commit touch two files, so
      `newestWorkCommit()` would read it as work landing and republish an unchanged page: the echo
      tick removed the same day. `publish_status.mjs` is the mechanism that already carries exactly
      these machine-local instruments into the tracked `status/<host>.md`, and **it is vendored** —
      so this is a kit patch, alongside the others in `PENDING-KIT-PATCHES.md`.
- [ ] **The Glass's own note contradicts its Your Call card, and he caught it in a
      ⟨`T-077`⟩
      screenshot.** Filed 2026-09-02T07:xxZ. **Sizing: one sentence of wording.**
      His screenshot: the note reads *"reap flags 6 rows as likely already answered, first: the
      Chartkeeper's Blocked-on-Wyatt question"* directly above **YOUR CALL (0) — "Nothing waiting."**
      **BOTH ARE CORRECT AND THEY READ AS A LIE.** Measured: `## BLOCKED ON WYATT` contains **zero
      table rows** (`grep -c '^|'` → 0), and `glass.mjs:311-321` builds Your Call only from table
      rows — so **(0) is literally true.** The note is the REAPER reporting Chart rows that *mention*
      an already-answered blocked question. Two different subjects, one page, no way for him to tell.
      **THE FIX IS THE NOTE'S WORDING, NOT YOUR CALL'S LOGIC** — the reaper's line must say it is
      talking about **stale rows to clean up**, never about a question waiting on him. Rule 8: a
      word that means "waiting on Wyatt" must mean that everywhere on this page.
- [ ] **THE PROJECT OWNS ITS DOOR — his ruling, and it is what finally lets the Chartkeeper
      ⟨`T-079`⟩
      RANK run.** 2026-09-02, question UI. **Depends on `T-078`. Sizing: one line of the Door plus a
      gate case.**
      `.claude/skills/door/SKILL.md` is vendored, and `PENDING-KIT-PATCHES.md` patch 4 records the
      cost in one sentence: *"The Watch never runs the Chartkeeper, because the Door is vendored."*
      **He asked for the Chart to re-prioritise itself four times; REAP shipped because its home is
      not vendored, RANK did not because its home is.**
      **The insertion is already written and measured** — patch 4 carries the exact text for the
      watch's step 6, plus its own caveat that RANK reorders only within existing open-row slots and
      cannot reorder across the two sections the Glass concatenates.
      **Add the wiring case to `scripts/qa/chartkeeper_check.mjs`** — assert the Door's watch section
      names `chartkeeper.mjs` — red-proofed by deleting the line. Patch 4's own words: *"A capability
      nothing checks is a capability that quietly stops running."*
- [ ] **THREE FATE STATES — `SCHEDULED` MUST STOP HIDING HIS IDEAS. His ruling, question UI,
      ⟨`T-080`⟩
      2026-09-02.** Depends on `T-078`. **Sizing: small, pure `glass.mjs`.**
      **Measured with the page's own logic before it was put to him: 15 ideas, 2 shown, 13 HIDDEN —
      9 of them by the single word `SCHEDULED`**, which `glass.mjs:375` treats as identical to
      SHIPPED and CLOSED.
      **And it contradicts the approved Charter in writing.** `CHARTER.md`: *"Every idea gets a
      **visible** fate (shipped / scheduled / parked-with-reason) within a day."* Scheduled and
      parked are named as VISIBLE fates. **This is a defect against a written spec, not a taste
      call.**
      **The shape he chose:** OPEN shows · **SCHEDULED shows and says so** · **PARKED shows dimmed,
      with its reason** · only genuinely-finished words hide (SHIPPED · DONE · FIXED · CLOSED ·
      HARVESTED · ROOT-CAUSED). Expected result: **11 shown, 4 hidden.**
      **Derive the three buckets from one list each and gate that no word appears in two** —
      red-proof by planting `SCHEDULED` in the finished list.
- [ ] **TWO DIFFERENT ROWS ON THIS CHART BOTH CARRY `T-079`, AND THE HANDLE IS NOW LOAD-BEARING.**
      ⟨`T-125`⟩
      ⚠ **RENUMBERED `T-079` → `T-125`, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart.** Two open rows carried `T-079`, so `chartkeeper.mjs:860` treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and **his dragged order named it twice and could not say which row he had moved.** Handles are never reused; `T-079` still resolves in `CHART-LOG.md` and in git history.
      Found 2026-09-02T12:5xZ by the watch that closed `T-079`, while trying to close it: the close
      gate could not find the row by handle because there are two. `CHART.md:990` (the npm-test row,
      just closed) and `CHART.md:1166` (**THE PROJECT OWNS ITS DOOR**) share it.
      **WHY IT MATTERS MORE TODAY THAN IT DID YESTERDAY.** As of `ed827799` a handle is no longer a
      label — it is the LINK that decides whether a row is hidden from him. A question of his that
      names `T-079` would sink **both** rows, and a settled ruling naming it would flag both stale.
      This is block 12's own fault class (`new Map(pairs)` keeps the last value for a repeated key)
      arriving one floor up, in his record instead of in the code.
      **THE GATE THAT WOULD CATCH IT EXISTS AND IS POINTED AT A FIXTURE.** `chartkeeper_check.mjs`
      case 7 asserts "every allocated id is distinct" — on `MIXED`, never on the real Chart. **A
      gate aimed at the wrong tree is not silent, it is reassuring** (`HARD-WON-LESSONS.md` §3).
      **DO NOT RENUMBER THE OLDER ROW.** A handle is allocated once and never reused — a CEO
      verdict, a ledger entry and this row all point at `T-079` meaning the npm-test row. Give the
      NEWER row (the Door row, filed by hand in `5e75bcf3` alongside `T-078`/`T-080`/`T-081`) a free
      handle, then add the real-Chart case. **Sizing: minutes for the renumber, one case for the
      gate. Red-proof by leaving the duplicate in place and watching the new case fail.**
- [ ] **`unattachedMentions` STILL WORD-SEARCHES FOR THE HEADING — CEO 104's one residual, and it is
      ⟨`T-086`⟩
      advisory only.** `chartkeeper.mjs`, in `derive()`: the list of rows that need a link is found
      by `/BLOCKED ON WYATT/i.test(row.raw)`, the very grep `ed827799` removed from the SCORE. So a
      row that says *"waiting on his call"* in different words is never listed as needing a handle.
      **It cannot sink anything any more** — that is why it is a blind spot in a helper report
      rather than a live defect, and why it was not fixed in the same pass. **Sizing: small.** The
      honest version derives the candidate set from something structural (a row with no handle at
      all cannot be linked, and that IS derivable) rather than from a phrase.
- [ ] **WHAT IS LEFT OF THE CHARTKEEPER AFTER SWEEP SHIPPED — the remainder of `T-001`, split out
      ⟨`T-001`⟩
      so his top row can close on what it actually promised.** All four passes now exist and all
      four RUN (RANK from the Door, SWEEP from `close_item.mjs`). These are the follow-ons, not the
      Chartkeeper:
      **1. RANKING SIGNAL A IS HALF DONE.** A row citing a REAL BUT UNRELATED live Inbox entry is
      still credited — CEO 94 wrote a fictional *"repaint the bilge pump widget"* row, pasted a live
      stamp into it and it ranked #1. Its fix (require the cited entry to name the row's `T-nnn`)
      would today zero every row, because there are no backrefs at all. **A design choice about his
      record, not a patch.**
      **2. HIS 03:49Z GLASS ASKS ARE STILL NOT BUILT** — expandable rows, and a comment box under
      each item. Both need `glass.mjs`, which is no longer vendored-locked, so they are ordinary
      work for the first watch that takes them. They are also the half that makes the ranking
      legible: a perfectly ordered list still reads as gibberish at 90 truncated characters a row.
      **3. TWO REAP PROBES HAVE NO GATE CASE AT ALL** — `supersededByAnotherRow` and `pidLongDead`.
      **4. THE DUPLICATE HANDLES** are their own open row and are named by
      `chart_sweep_conserves_check.mjs` on every run: `T-057`, `T-058`, `T-059`, `T-078`, `T-079`.
- [ ] **WIRE THE KIT AS A `git subtree` SO PROMOTION IS A MERGE, NOT A COPY — his metaphor,
      ⟨`T-081`⟩
      his refusal of cherry-picking.** 2026-09-02. **Sizing: an afternoon. Do NOT start it before
      `T-078`, and do not bundle the generalisation with it.**
      **His words:** *"the kit is 'production' and the local version of it is 'staging'… i don't want
      to be the human cherrypicking; i want the design of the kit itself to be architecturally
      extensible."* And his amendment to the adoption ruling: a project must also have **a way to
      update to the latest kit as it becomes available.**
      **`git subtree` answers both halves with machinery this project already trusts:** the kit's
      files live in the repo and are edited in place; `subtree pull` is "update to the latest";
      `subtree push` is "staging promotes to production". **Promotion is a merge, never a copy —
      rule 2 of his own release process** — so there is real ancestry, real conflicts when two things
      genuinely disagree, and it is reversible. A copy has no ancestry and therefore cannot tell an
      improvement from a divergence.
      ⚠ **THE HALF NO MECHANISM PERFORMS, AND IT MUST NOT BE PROMISED:** a subtree push sends
      pastrypirates' code upstream **verbatim**, and his ruling 4 is that the kit holds GENERALISED
      versions. `close_item.mjs:49-52` hardcodes four `.planning/` paths; `start_trial_detached.mjs`
      **exits 2** without `scripts/sea_trial.mjs`. **Pushed as-is, the kit inherits a pirate game.**
      Generalising is design judgement and belongs to the batched pass his ruling 3 describes —
      **build the plumbing, defer the framework.**
- [ ] **WRITE THE HANDLE LINKS INTO HIS QUESTIONS — the migration `ed827799` deliberately did not
      ⟨`T-126`⟩
      ⚠ **RENUMBERED `T-079` → `T-126`, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart.** Two open rows carried `T-079`, so `chartkeeper.mjs:860` treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and **his dragged order named it twice and could not say which row he had moved.** Handles are never reused; `T-079` still resolves in `CHART-LOG.md` and in git history.
      do, and until somebody does, NOTHING is ever marked "waiting on Wyatt".** CEO 104's one
      sentence for him says exactly this.
      **WHAT THE TOOL ALREADY TELLS YOU** — run `node scripts/wyclau/chartkeeper.mjs --rank` and
      read the last two warnings. Today: **4 rows talk about his BLOCKED ON WYATT table and name no
      question** (the Chartkeeper row, the staging-deploy row, the npm-test row and the Your-Call
      wording row), and **2 of his open questions name no task** (*"May an unattended watch READ the
      claude-kit folder?"* and *"Do you want `SCHEDULED` to stop hiding your ideas?"*).
      **THE JOB:** for each of his questions, write the `T-nnn` of every row it actually holds up
      into the question's own cell. Same for `SETTLED RULINGS`, whose rows currently name their
      subjects in prose only — the staging-permission ruling is the worked example: it is settled,
      the row it freed is still open at rank 32, and no machine can see the connection.
      ⚠ **THIS IS A CONTENT JUDGEMENT, WHICH IS WHY IT WAS LEFT.** Attaching a question to a row
      HIDES that row from him. The Chartkeeper row is the trap: its remaining half really is
      kit-blocked, but it is a BUNDLE with unblocked parts (this watch worked one), and sinking a
      bundle for one blocked part is the same section-for-row-level fault `T-079` just removed. **A
      bundle with unblocked parts must be SPLIT, not sunk** — that is SETTLE's job, not a question's.
- [ ] **⚑⚑⚑ TOP PRIORITY, HIS WORDS: "add it to the chart at the top priority". THE GLASS MUST NOT
      BE ABLE TO LOSE HIS WRITING.** `INBOX-20260902T192000Z` (the build; the design half closed as
      `INBOX-20260902T191500Z`). Designed 2026-09-02, 3:15 PM ET; **design only, the build is
      yours.** Full spec: [`SPEC-GLASS-HARVEST-SAFETY.md`](SPEC-GLASS-HARVEST-SAFETY.md).
      **CEO 117 returned PARTIAL and its two corrections are already folded into the spec** — Layer
      D was specifying something that already ships (`glass.mjs:1218`), and Layer A's "unknown" was
      half answered in `glass.mjs:22-23`. **Read the spec, not this row's summary of it.**
      ⟨`T-105`⟩
      ⛔ **GATED: everything left is two writes inside `.claude/`, and FOUR sessions have now been
      refused them — the fourth in a session Wyatt opened himself, which the record named as the
      route that works.** Not actionable by a watch. **Delete this marker the moment either edit in
      [`CLAUDE-DIR-REPAIRS-PENDING.md`](wyclau/CLAUDE-DIR-REPAIRS-PENDING.md) has landed.**
      ⚠ **THE MARKER IS THE FINDING OF THE 2026-09-03T02:09Z WATCH, so read this before deleting it.**
      This row scored **196 — rank ONE — with the Chartkeeper printing *"nothing is blocking it"***,
      because `chartkeeper.mjs:926` looks for a literal `GATED:` and this row never carried one.
      **So the blocker was real, stated in three documents, and invisible to the one tool that
      decides what a watch works on** — and under the new "take row one" ordering it sat at the top
      handing every fresh watch the same wall. **A row blocked in prose is not blocked.** That is a
      general fault, not a fact about this row: any row whose blocker is described rather than
      marked will do the same thing. Filed as its own row below.
      **HIS INVARIANT, AND THE WHOLE DESIGN HANGS ON IT:** *"the harvest stamp records when a
      session looked. It is not evidence the page hasn't changed since. Your page carries its own
      version number — that's the fact that can answer 'is a republish safe?', and a clock never
      can."* **Identity, not a clock.**
      **IT IS NOT A THEORY. IT HAPPENED TODAY WITH SEVEN OF HIS IDEAS IN IT.** The tick harvested at
      **3:07:08 PM** and correctly found nothing; **his first idea landed at 3:07:15 PM, seven
      seconds later**; six more followed. From that moment the stamp read "fresh" for thirty minutes
      and `.claude/hooks/glass-harvest-first.cjs:37` (`FRESH_MIN = 30`) would have green-lit any
      republish, which regenerates the page from disk and drops `glassState`. **They survived by
      luck of ordering, not by design.**
      **THE ACCEPTANCE TEST IS THAT REPLAY, and nothing else counts:** harvest at T finds nothing, he
      writes at T+7s, a session republishes at T+5min — **his words survive, or it is not a fix.**
      **FOUR LAYERS, in the spec, cheapest first:** (A) the Artifact tool already refuses a publish
      over a newer version — so **never pass `force`**, and gate against it; (B) the stamp records
      the **artifact version id**, not a time, and is compared immediately before publishing —
      `FRESH_MIN` deleted; (C) harvesting becomes idempotent by idea id, so a double harvest is
      harmless and a missed one is recoverable; (D) **the page stores each idea the moment he
      submits it**, so his words are never in only one place.
      ⚠ **ONLY LAYER D EARNS THE WORD "PERMANENT" — A, B AND C NARROW THE WINDOW AND D REMOVES IT.**
      Do not let a smaller layer ship under that word.
      ⚠ **AND THE FIRST MOVE IS A MEASUREMENT, NOT CODE.** Layer A rests on an unverified claim:
      whether a save WYATT makes in the page raises the tool's conflict, or passes silently as the
      session's own write. **Measure that before building anything** — if it conflicts, A is nearly
      the whole fix and B is ceremony; if it does not, A is worthless and B is mandatory.
      **THE FAULT IS ALSO IN WHERE THE GUARD SITS, not only what it is made of.** The tick reads at
      step 2 and publishes at step 7 (`GLASS-UPDATE-SESSION.md`), with a gate, a stamp, a Chart reap,
      a staleness judgement and a regeneration in between — **so even a perfect tick has a
      multi-minute gap between the read and the destructive act.** Move the check to step 7.
      ✅ **MEASURED 2026-09-02 4:58 PM ET, AND IT MAKES THIS ROW SMALLER — READ THIS BEFORE THE
      SPEC.** The Layer A question this row called "the first move, a measurement not code" was run
      on a DISPOSABLE artifact, never on the Glass, and **a stale republish was REFUSED**: *"a newer
      version ... is live and this publish was not built on it."* A second gate surfaced unlooked-for
      — the peer's own publish was refused for never having viewed the live version. **Two
      enforcement points; his invariant is already in the runtime.**
      ⚠ **SO THE ROW'S OWN ACCEPTANCE-TEST STORY OVERSTATED THE DANGER, AND THAT IS CORRECTED
      RATHER THAN QUIETLY DROPPED:** the 3:07 PM sequence could not have destroyed his ideas
      silently — that publish would have been refused. **A hazard was reported as a near-miss
      without anyone measuring the protection.** What still stands is that the harvest stamp is a
      clock and cannot answer the question; it was simply never the last line of defence.
      **WHAT IS ACTUALLY LEFT, in order:** (1) **Layer A = ONE GATE** that fails the build on `force`
      near a Glass publish — the runbook already says "NEVER PASS `force`"
      (`GLASS-UPDATE-SESSION.md:222-230`) and nothing enforces it, and a sentence is what failed
      here; (2) Layer B drops to a convenience, still delete `FRESH_MIN`; (3) **the residual exposure
      MOVED to the MERGE** — the tool hands back the live source to merge, and a careless merge can
      still drop his words, visibly rather than silently. Aim C and D there.
      **Sizing: no game code, no sea trial.** Hooks, the Glass runbook and `glass.mjs`.

      ---
      **⚑ WORKED 2026-09-02T21:0xZ, CEO 120 (PARTIAL), commit `cd3bd96b`. NOT CLOSED, AND THE
      REASON IS NOT THE EVIDENCE — HALF THE FIX IS BEHIND A PERMISSION A WATCH MAY NOT GRANT
      ITSELF.**
      **WHAT SHIPPED:** the harvest stamp stops being a clock. `scripts/wyclau/mark_glass_harvest.mjs`
      writes a receipt naming the artifact VERSION that was read and refuses a versionless stamp;
      `GLASS-UPDATE-SESSION.md` gains **step 6b — re-read the live page and compare the version in
      the same breath as the publish** (the spec's §3 says moving the guard there matters more than
      fixing the stamp), and step 7 forbids `force`. A derived gate over **11 instruction files**
      fails the build if any of them ever teaches a forced publish or a hand-written stamp.
      **WHAT IS BLOCKED, AND IT IS THE HALF THAT MAKES IT MECHANICAL:** the hook still decides on
      `FRESH_MIN = 30`, and its own deny text still prints the retired `date -u … > ${STAMP}` at the
      one moment that fires immediately before the destructive act. Three invariants were written
      FIRST and went **RED** against it — a bare timestamp accepted, a receipt denied for being old,
      a forced publish allowed. **The fix is two files in `.claude/`, and every write there is
      refused for an unattended watch** ("sensitive file" / "requested permissions to write").
      Measured, not assumed: `.claude/hooks/glass-harvest-first.cjs` AND
      `.claude/skills/door/SKILL.md` were both attempted and both refused. **So the wall is
      `.claude/` entirely — hooks, skills and `settings.json` — which is a standing fact about every
      future item whose fix lands there.**
      **THE THREE RED CASES ARE NOT DELETED AND NOT LEFT RED.** They sit in a PENDING block in
      `scripts/qa/glass_harvest_hook_check.mjs` that reports the live state on every `npm test` and
      **FAILS THE MOMENT THE HOOK IS REPAIRED**, so the exemption cannot outlive its reason.
      ⚠ **AND THE HONEST HEADLINE: HIS WORDS CAN STILL BE LOST.** `artifactVersion` has no machine
      reader yet — the only thing that compares it is a session obeying the runbook. Layers C and D
      are not built, and **the acceptance test in the spec's §2 is not passed.**
      ⚠ **CEO 120's sharpest finding, recorded because it is the cheapest thing left:** the row's own
      first line says *measure before building*, and no live measurement was made. **If the platform
      really does conflict, most of layer B is hardening rather than the fix; if it does not, layer A
      is worthless and B is mandatory.** One test settles it — type an idea into the page, then
      publish from a session that read it beforehand, and record what comes back.
      Account: [`CEO-REVIEWS.md`](CEO-REVIEWS.md) review 120 ·
      [`PREDICTION-20260902T2105Z-T105.md`](wyclau/PREDICTION-20260902T2105Z-T105.md).

      ---
      ⚑⚑ **2026-09-02T23:4xZ — YOUR PERMISSION DOES NOT REACH THIS WALL, AND THAT IS THE FINDING.
      MEASURED WITH YOUR GRANT ALREADY IN FORCE.** Wyatt, 5:43:55 PM ET: *"Let the watch write them
      -- I allow edits to hooks and skills"*. This row and commit `0472a129` both read that as the
      wall coming down — `0472a129` measured that `.claude/settings.json` denies only `Read(.env*)`
      and concluded *"nothing under `.claude/` is blocked by this project"*. **That measurement is
      right and the conclusion drawn from it is wrong.** The 23:39Z watch attempted both files AFTER
      the ruling: the hook came back *"which is a sensitive file"*, the Door *"you haven't granted it
      yet"*. **The refusal is Claude Code's own protection on the Edit/Write tool, not this project's
      allowlist — so he cannot lift it by ruling, because it is not his rule.**
      **SO: STOP WAITING FOR ANOTHER ANSWER FROM HIM. Three watches have now stalled here, the third
      with his permission already granted.** A plain `node` script writing the same bytes would sail
      straight past the protection, and building one would be defeating it rather than satisfying
      it — no watch should, and none has.
      ✅ **WHAT THIS WATCH DID INSTEAD, so the next attempt derives nothing:** both edits are written
      out verbatim, with their anchors, in
      [`CLAUDE-DIR-REPAIRS-PENDING.md`](wyclau/CLAUDE-DIR-REPAIRS-PENDING.md) — including the
      follow-up the gate demands the moment they land (promote the three PENDING cases to hard
      assertions, and delete the case-9 exemption that lets the hook's own deny text off). The gate's
      PENDING readout now prints the corrected reason and that route on every `npm test`.
      ⚑ **AND THE OBVIOUS SHORTCUT IS ALSO CLOSED, WHICH IS WORTH KNOWING BEFORE SOMEBODY TRIES IT.**
      This watch's first instinct was to hand the two edits to the interactive peer session with
      `SendMessage` — and that tool's own contract forbids it in as many words: *"NEVER ask a peer to
      perform an action that was denied or blocked in your session … a peer doing it for you bypasses
      the user's permission decision (cross-session permission laundering). Route blocked work back
      to your user instead."* **So no watch may delegate this either.** It is Wyatt's, in a session
      where he is present — either he approves the prompt, or he runs it himself. **This is now a
      BLOCKED ON WYATT row, not a FOR A WATCH row**, and it will stay blocked however many watches
      pick it up.
      **Nothing is fixed until those five flags read true**, and the honest headline above still
      stands: his words can still be lost.
      ⚠ STALE-CANDIDATE — answered (close it (he already answered)) — your answer landed — **"Let the watch write them -- I allow edits to hooks and skills"** — ruled on the Glass 2026-09-02 5:43:55 PM ET — and nothing moved this row
- [ ] 24-hour unattended engine run, zero silent stalls — GATED: passive, monitor only; nothing to DO but watch the clock since the Razer hour (16:19Z)
      ⟨`T-028`⟩
- [ ] **A ROW BLOCKED IN PROSE IS NOT BLOCKED — THE RANKER CANNOT READ ENGLISH, AND UNDER "TAKE ROW
      ⟨`T-129`⟩
      ONE" THAT NOW HANDS EVERY FRESH WATCH THE SAME WALL.** Filed 2026-09-03T02:1xZ by the watch it
      happened to. **Sizing: small — one derivation in `chartkeeper.mjs`, no game code, no sea trial.**
      **WHAT HAPPENED, MEASURED NOT REASONED.** `T-105` scored **196, rank ONE**, with the
      Chartkeeper's own why-now line reading ***"nothing is blocking it"*** — while three documents
      (`CHART.md`'s own row text, `CLAUDE-DIR-REPAIRS-PENDING.md`, and the `npm test` output of
      `glass_harvest_hook_check.mjs`) all said in plain English that it was blocked and had been for
      three days. `chartkeeper.mjs:926` decides blocked-ness with `/\bGATED:/` against the row's raw
      text, and nobody had typed that token.
      ⚠ **THE ORDERING CHANGE IS WHAT MADE IT EXPENSIVE, and that is the reusable half.** Under
      oldest-first a mis-scored row was one row among many. Under **take row one**, a row that is
      blocked-but-unmarked and scores highest **absorbs watch after watch, forever, by construction**
      — four so far. **Every fix that raises the stakes on the ranking also raises the cost of the
      ranker being wrong**, and the guard for that was never added alongside it.
      **THE SHAPE OF THE FIX, and it is rule 9's — derive it, do not ask people to type it:** a row
      whose live pointer is a `BLOCKED ON WYATT` question, or that cites an open question, or that
      names a permission/approval it does not hold, should score as blocked **whether or not somebody
      remembered the token.** The `GATED:` marker stays as the manual override; it must stop being
      the only signal. **Acceptance test: `T-105` as it stood at 02:09Z ranks as blocked with the
      marker deleted.**
      ⚠ **AND FLAG, DO NOT SILENTLY DEMOTE.** The failure mode of this fix is a row quietly scored
      to the bottom because a derivation misfired, which is the same class of fault in the other
      direction. It should say, in the rank output, which rows it judged blocked and on what.
- [ ] Memory consolidation: five homes → one + pointers — GATED: same quiet moment
      ⟨`T-029`⟩
- [ ] Pruning: kill-list generated (GSD phase machinery, dead files), archived in git, deleted; goes on the Glass for the record — GATED: same quiet moment
      ⟨`T-030`⟩
- [ ] Rulebook cutover: `CLAUDE-next.md` replaces `.claude/CLAUDE.md`; war stories → `.claude/rules/*.md` at their triggers — GATED: at the quiet moment, needs the parallel fix session closed
      ⟨`T-031`⟩
- [ ] Your ruling: the cutover moment — **GATED: on the exit test verdict, which is his own stated condition.** Nothing for a watch to do.
      ⟨`T-007`⟩
- [ ] Your ruling: the Glass's Ideas box corrupting the page after a save — **GATED: awaiting his own look at the live page**, which only he can do. Root-caused and fixed 2026-09-01, and he has since written to that page repeatedly with no corruption reported — very likely closable the next time he says so.
      ⟨`T-124`⟩
      ⚠ **RENUMBERED `T-008` → `T-124`, 2026-09-02 10:10 PM ET, at his instruction to clean the Chart.** Two open rows carried `T-008`, so `chartkeeper.mjs:860` treated every mention of it as claiming NOTHING — a ruling naming it named two jobs and spoke for neither, and **his dragged order named it twice and could not say which row he had moved.** Handles are never reused; `T-008` still resolves in `CHART-LOG.md` and in git history.
