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

## STEP 1 CHECKLIST

- [ ] **A QUESTION PUT TO WYATT THAT NAMES NO TASK LEAVES THE ROW IT IS HOLDING UP AT THE TOP OF THE
      CHART — and the only thing standing between that and a watch is somebody noticing a warning.
      Filed 2026-09-03T04:4xZ at CEO 141's structural criticism, in its own words.**
      **What happened, tonight, exactly once and it will happen again.** Two taste questions were put
      to him about `T-017`; neither contained the string `T-017`; so `chartkeeper.mjs:934`'s
      `livePointer` was false, the −1000 blocked penalty at `:937` never fired, and a row sitting in
      his hands stayed at **rank 1 of the list the Door tells every watch to take**. Repaired by hand
      (commit `075e553d`), which is the third hand-repair of a Chart bookkeeping fault in two days.
      **CEO 141, verbatim:** *"Nothing in `package.json:26`'s 114-gate chain reads `unattachedQuestions`
      against the **live** `.planning/CHART.md` — `chartkeeper_check.mjs:1449-1469` exercises it
      against throwaway fixtures only. So the sole protection against this recurring is a watch
      noticing a warning, which is precisely the thing that did not happen tonight. The next question
      filed without a handle re-creates this bug in full, silently."*
      **The shape of the fix, not the fix:** the detector already exists and is already correct
      (`chartkeeper.mjs:1552-1554`, guarded by case 13e). What is missing is something that goes RED
      against the real Chart. **⚠ And the obvious version is a trap worth writing down before somebody
      builds it:** a gate that fails whenever he has an unattached question makes `npm test` red for a
      reason that is not a code defect — it would go red because *he has not answered something*, and
      a suite that goes red at him is a suite watches learn to ignore. Whoever takes this decides
      where the signal belongs (the Door's own orientation? `publish_status`? a REPORT a watch cannot
      skip?) before writing a line.
      **Deliberately NOT taken tonight:** deriving the handle from the `qid:` slug. There are three
      qids on the live Chart and one carries no handle, so the convention is a two-sample coincidence.
- [ ] **`chart_sweep_conserves_check` IS RED ON THE LIVE TREE AND HAS BEEN RED LONG ENOUGH THAT
      NOBODY MENTIONS IT. Filed 2026-09-03T04:4xZ by watch a5, which did not cause it.**
      `node scripts/qa/chart_sweep_conserves_check.mjs` fails: *"38 allocated handle(s) are owned by
      NOTHING in either file — T-002, T-008, T-011, T-014, …"*. It is in `npm test`
      (`package.json:26`). **Thirty-eight handles have been minted and their rows are gone from both
      the Chart and the Glass Chart** — so every one of them is a pointer in the ledger, in
      `CHART-LOG.md` and in git that now resolves to nothing.
      **Why this is more than tidiness:** `close_item.mjs` and `chartkeeper.mjs` both key on handles,
      and `handleIsAmbiguous` (`chartkeeper.mjs:754`) exists precisely because a handle naming two
      jobs names neither. A handle naming NO job is the same family. Likely the same root as the
      split Wyatt ordered (44 rows moved between two files) — check that first.
      ⚠ **AND THE SECOND-ORDER COST IS THE REAL ONE: a permanently-red gate in `npm test` teaches
      every watch that a red suite is normal.** Two separate watches tonight reported `npm test`
      failures as "known and not mine" — accurately, both times. That is how a real regression gets
      waved through.
- [x] **`npm test` DESTROYS WHATEVER IS WAITING IN `GLASS-NOTE.md` — it consumed this watch's own (closed 2026-09-03 · CEO 135 · no game diff — Glass machinery, no game code: erasing his queued note is now opt-in (--consume-note); proved red then green, CEO 135 re-proved it independently)
      ⟨`T-112`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM:** *"I'm not sure if this is closed or not -- investigate."*
      **His words outrank this row.** Whatever the row claims, his instruction is to CHECK it.
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
- [x] **HARVEST HIS 12:39:56Z KIT RULING INTO `DECISIONS.md` — a two-minute edit this watch (closed 2026-09-03 · CEO 138 · no game diff — his 12:39:56Z kit ruling is in DECISIONS.md, and the contradicting 12:15Z NEVER row is marked superseded so the wrong answer is no longer findable)
      ⟨`T-085`⟩
      was refused permission to make, and its absence has already cost one item.**
      The ruling: *"May an unattended watch READ the claude-kit folder?"* — **"yes"**, ruled on the
      Glass 2026-09-02T12:39:56.363Z. `CLAUDE.md` §5: *"A ruling he made that nobody harvested is
      the failure this system exists to stop."*
      ✅ **HARVESTED 2026-09-03T04:1xZ** by the Advisor, which is a session that can write that file.
      `grep "claude-kit folder" .claude/memory/DECISIONS.md` → **1** (it was 0, and that count was
      this row's own check). Entry at `.claude/memory/DECISIONS.md:3-35`, additive only, with the
      alternative he did not pick and the READ-not-PUSH scope limit both intact.
      ⚠ **AND CEO 138 FOUND THE HALF THAT WOULD HAVE MADE THE HARVEST WORTHLESS: THE SAME FILE
      ANSWERED THE SAME QUESTION "NEVER".** `DECISIONS.md:688` ruling 2 — *"May a watch read
      claude-kit at runtime? **NEVER — and that is the test.** The fence stays closed."* — committed
      `ee1539ac` at **12:15Z, twenty-five minutes BEFORE his "yes"**. Filing the right answer while
      the wrong one stayed findable is not a harvest; a session grepping `claude-kit` would have hit
      whichever it reached first. **Row 2 is now marked SUPERSEDED and points at the new entry.**
      *The lesson generalises past this row: when you harvest a ruling, grep the file for the
      QUESTION, not only for the absence of the answer.*
      **The entry is already written** — it is in the ledger under WATCH 13:10Z and in commit
      `9c4edb48`'s message, including the alternative he did not pick (leave the fence up and keep
      routing kit work to a human) and the scope limit (**this ruling is about READING; nothing in
      it authorises a watch to PUSH to claude-kit**). Paste it in.
      ⚠ `.claude/memory/DECISIONS.md` is permission-protected: an unattended watch's edit is
      refused. **Whoever takes this needs a session that can write it** — or the protection needs
      changing, which is a question for Wyatt, not a repair for a watch.
- [ ] **⚠ THE STAGING DEPLOY IS THE ONE STEP A WATCH CANNOT TAKE, AND THAT — NOT THE EVIDENCE — IS
      ⟨`T-027`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM:** *"verify this to make sure it functions as needed."*
      **His words outrank this row.** Whatever the row claims, his instruction is to CHECK it.
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
- [x] **⚠ THE CLOSE GATE READS THE INBOX AS INSTRUCTIONS: A DOLLAR SIGN IN ONE OF HIS ITEMS WILL (closed 2026-09-03 · CEO 140 · no game diff — all three replacement sites now pass a function, so no word of his can be read as an instruction; the row's own s-flag fix was measured destructive and deliberately not taken)
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
      ⚠ **THREE CORRECTIONS TO THIS ROW, MADE WHILE FIXING IT 2026-09-03T04:2xZ. Read them before
      the prose above.**
      1. **THERE WERE THREE CALL SITES, NOT TWO.** The row missed the CHART branch, which built its
         replacement out of the row's own text — so a dollar sequence in a *Chart* row spliced the
         Chart's header into itself exactly as the INBOX bug did. CEO 140 confirmed it live, and
         then found the worse half: **fixing that site is not the same as guarding it.** It
         reintroduced the string form there alone and *every one of the new cases stayed green.*
         There is now a Chart-branch case, red-proofed against exactly that mutant.
      2. **THE LINE NUMBERS MOVED:** the sites are `close_item.mjs:214-221`, not `:152-158`.
      3. ⛔ **THE `s`-FLAG FIX THIS ROW PRESCRIBES IS DESTRUCTIVE — MEASURED, NOT ARGUED.** With `s`,
         `.` eats newlines and greedy `.*` runs to the end of the entry, so `/^status:.*$/ms`
         replaces the status line **and every line below it**. Against a block with a two-line
         `status:` and prose beneath, it yields `"## INBOX-1\nstatus: DONE"` — the prose **deleted**.
         `INBOX.md:74` records a real four-line `status:` repaired by hand, so **applied to that
         entry this row's own fix would have destroyed his words.** Shipped instead: a BOUNDED match
         that stops at the first blank line or heading, with a permanent case that goes red against
         the `s`-flag version so nobody can "fix" it that way later.
         *(Known limit, latent not live: the bounded form would swallow prose that follows the
         status block with NO blank line between. Every `status:` in the real INBOX is
         blank-line-terminated, so it cannot bite today.)*
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
- [ ] **⚑⚑ HIS "DO NOW" BUTTON — BUILT 2026-09-02T21:4xZ, CEO 121 (PARTIAL), commit `c8a475a6`.
      ⟨`T-104`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:30 PM ET, on the backlog page — VERBATIM:** *"i see the DO NOW button -- does it work? Work = puts the task at the TOP of the list and gives it to the very next watch."*
      **His words outrank this row.** Whatever the row claims, his instruction is to CHECK it.
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
- [x] **`can_push.mjs` SAYS "CAN PUBLISH" TO A WATCH WHOSE `git push` IS THEN REFUSED — twice now on (closed 2026-09-03 · CEO 136 · no game diff — can_push now prescribes the form the allowlist actually matches; the stale STOP block that told the next watch to discard the working fix is corrected in place)
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
  > ### ⛔ STOP — BOTH FIXES BELOW ARE MEASURED DEAD. DO NOT BUILD EITHER. (2026-09-03T02:50Z watch)
  >
  > **Read this before the two paragraphs under it, because they are what a watch would otherwise
  > act on.** A third watch was refused on this branch and measured the whole question again. Its
  > prediction — written before the measurement, at
  > `.planning/wyclau/PREDICTION-20260903T0250Z-T011.md` — was that the explicit-branch form would
  > work, exactly as this row claims. **It does not.**
  >
  > | run in one session, 2026-09-03 | result |
  > |---|---|
  > | `git push --dry-run origin HEAD` — **as a shell command** | REFUSED, *"This command requires approval"* |
  > | `git push --dry-run origin <branch-name>` — **as a shell command** | **REFUSED, identically** |
  > | both of those forms — **from a node child process** | **exit 0**, `Everything up-to-date` |
  >
  > ### ⛔⛔ EVERYTHING FROM HERE TO THE END OF THIS BLOCK WAS OVERTURNED ON 2026-09-03. READ THIS FIRST.
  >
  > **THE TABLE ABOVE IS REAL AND IT CANNOT ANSWER THE QUESTION IT WAS BUILT FOR: every shell row in
  > it is a `--dry-run` form.** With no non-dry-run shell row, it cannot tell "Bash versus node"
  > apart from "the flag position" — and the answer is the flag position.
  >
  > `.claude/settings.json:22` reads `Bash(git push origin claude/*)`, and that is a **PREFIX**
  > match. `git push --dry-run origin …` does not begin with `git push origin`, so it can never
  > match, on any tree however healthy. Re-measured, same branch, minutes apart:
  >
  > | run as a **shell command**, 2026-09-03 | result |
  > |---|---|
  > | `git push --dry-run origin <branch>` | REFUSED — and it always will be |
  > | `git push origin <branch>` | **exit 0, `Everything up-to-date`** |
  >
  > **SO (b) WAS RIGHT AND THIS ROW TALKED THE NEXT WATCH OUT OF IT.** Corrected in
  > `can_push.mjs:106-127`, which now prescribes `git push origin <branch>` — a real no-op on a
  > synced tree that exercises the exact string the allowlist matches. Found by watch
  > `pastrypirates-a3`, verified independently, CEO 136 red-proofed the gate against the old file.
  >
  > **AND THE OLD PRESCRIPTION WAS WORSE THAN WRONG — IT WAS A FALSE STOP AT THE DOOR.** `can_push.mjs`
  > told every watch to run the `--dry-run` form and to **end its turn if refused**. On this machine
  > that fires 100% of the time on a perfectly healthy tree. *The same false-instrument disease this
  > row is about, inverted: not a green that hides a fault, a STOP that invents one.*
  >
  > **THE THREE "STILL OPEN" CLAIMS BELOW ARE ALL SPENT** (CEO 136, `T-011`): the allowlist is **not**
  > the only real repair — the command form was, and it landed; the `SKILL.md` line is **not** blocked
  > and needs no separate entry, because `SKILL.md:27` already runs `can_push.mjs` at orientation and
  > the script prints the correct command; and `close_item.mjs` **does** take `--chart=` since
  > `11d44777`, so this row can be closed through the gate — which is how it was closed.
  >
  > *(Everything below is kept, unedited, as the graveyard — what was believed on 2026-09-02 and why.
  > It is wrong. Do not act on it.)*
  >
  > **(b) — "push with the explicit branch name" — DOES NOT REPRODUCE.** It rested on a single
  > observation in a single session. Both forms are refused here. It is not a one-line fix; it is
  > not a fix.
  >
  > **(a) — "`can_push.mjs` should run `git push --dry-run`" — IS WORSE THAN DEAD, and this is the
  > part worth carrying forward.** `can_push.mjs` is a **node script**, and node pushes fine here
  > while the watch's own shell `git push` is refused. So that fix would print a confident green
  > about a capability the watch does not have — **the same false green as today, by a longer route,
  > and harder to distrust because it looks like a real push.**
  >
  > **WHY NEITHER CAN WORK, IN ONE SENTENCE:** the refusal lives in the **session's command
  > allowlist, which sees shell commands and nothing else** — so *no script in this repo can measure
  > it*, because the moment the question is asked from inside a script it is being asked from the
  > wrong side of the fence.
  >
  > **WHAT WAS SHIPPED INSTEAD (`can_push.mjs`, `can_push_check.mjs`, three cases, red first):** the
  > script no longer claims `can publish`. It states only what it verified (repo state), names the
  > one thing it cannot see, and prints the shell command the watch must run itself. **That is the
  > whole of what a script can honestly do here.**
  >
  > **STILL OPEN, AND IT IS THE ONLY REAL REPAIR: Wyatt's permission list.** If watches are meant to
  > push, `git push` belongs on the allowlist. A `scripts/wyclau/push.mjs` would work today —
  > node's push is not refused — but that is routing around a fence he set, and an unattended watch
  > is the wrong thing to decide it. **Raised for him; deliberately not built.**
  >
  > **AND THE OTHER HALF IS BLOCKED THE SAME WAY:** the matching line for
  > `.claude/skills/door/SKILL.md` (run the shell dry-run at orientation, beside `can_push.mjs`)
  > **could not be written — this session's Edit tool is refused on that file.**
  > `chartkeeper_check.mjs` independently reports the same fence on the same file. **A session with
  > permission should add it.**
  >
  > **⚠ AND THIS ROW CANNOT BE CLOSED THROUGH THE GATE:** `close_item.mjs:49` reads `CHART.md` only,
  > and this row lives in `GLASS-CHART.md`. Not ticked by hand — left open, deliberately.
  >
  > *(The two paragraphs below are kept as the record of what was believed on 2026-09-02. They are
  > wrong. They are not instructions.)*
  >
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
- [ ] **HIS FOUR GLASS-PAGE ASKS — THREE OF THE FOUR NOW SHIPPED. What is left is the two that need new UI: expandable rows and a per-item comment box. FIVE HOURS OLD WHEN FILED, ASKED FOUR TIMES, NEVER A
      ⟨`T-076` · now: yes⟩
      ⚑ **HIS NOTE, 2026-09-02 10:36 PM ET, backlog page — VERBATIM:** *"PRIORITIZE this at the top."*
      **AN ORDER, NOT A COMMENT.** Pinned with `· now: yes`, which measures at rank 1 (score 9,000,000) and the Door hands rank 1 to the next watch.
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
      ⚑ **HIS NOTE, 2026-09-02 10:36 PM ET, backlog page — VERBATIM:** *"I"m 99% sure the Blade Hour is complete!"*
      **HE SAID 99%, NOT 100% — SO IT IS CHECKED, NOT CLOSED.** His recollection is evidence; it is not a measurement, and he was careful to say so himself.
  directions, the O2 publish test — runbook `scripts/wyclau/RAZER-SETUP.md`
  **PARTIALLY DERIVABLE, measured 2026-09-02T03:5xZ: `schtasks /Query /TN "wyclau-bell" /V` on
  this machine shows the task registered and Enabled (Status: Ready, last ran 23:48, next 23:58)
  — the Bell-registration third is done. The ring-test and O2-publish thirds are not checkable
  this way; still needs Wyatt or a session that can run them.**
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
      ⚠ **AND THE CORRECTION THIS ROW OWES, FROM CEO 133, BEFORE ANYBODY BUILDS ON IT.** The watch
      that filed this row wrote *"after the marker, `T-105` dropped out of rank one"* as its proof.
      **That was a coincidence it took credit for.** A peer split the Chart mid-watch, `T-105`'s row
      moved into this file, and `chartkeeper.mjs` reads `.planning/CHART.md` only — so the row left
      the ranking because its FILE moved, marker or no marker. **The marker itself is real and was
      verified another way** (`chartkeeper.mjs:926`, and three other marked rows rank at −950, −980
      and −992 printing *"blocked (GATED)"*). The mechanism stands; the evidence quoted for it did
      not, and this is the eleventh verdict running to find an account tidier than the record.
      ⚠ **AND FLAG, DO NOT SILENTLY DEMOTE.** The failure mode of this fix is a row quietly scored
      to the bottom because a derivation misfired, which is the same class of fault in the other
      direction. It should say, in the rank output, which rows it judged blocked and on what.
- [ ] Memory consolidation: five homes → one + pointers — GATED: same quiet moment
      ⟨`T-029`⟩
- [ ] Pruning: kill-list generated (GSD phase machinery, dead files), archived in git, deleted; goes on the Glass for the record — GATED: same quiet moment
      ⟨`T-030`⟩
- [ ] Rulebook cutover: `CLAUDE-next.md` replaces `.claude/CLAUDE.md`; war stories → `.claude/rules/*.md` at their triggers — GATED: at the quiet moment, needs the parallel fix session closed
      ⟨`T-031`⟩
- [x] **`npm test` HAS BEEN RED ALL NIGHT, AND IT STOPS ~12 GATES SHORT — INCLUDING RULE 17'S.** (closed 2026-09-03 · CEO 139 · no game diff — no game code is right: the item is the Chartkeeper's own idempotence, not the game — commit 0fc41dac mints every open row's handle before the rank, case 10f is green, and on his real Chart it moves 0 rows and allocates 0 ids)
      ⟨`T-130`⟩
      **The failing gate is `chartkeeper_check` case 10f** — *"running the full pass twice produced
      two different files"*. Pre-existing, verified NOT caused by tonight's work three separate ways
      (the two chartkeeper files are byte-unchanged; the case builds its own throwaway fixture;
      CEO 135 re-checked it independently).
      **WHY IT MATTERS MORE THAN ITS OWN SUBJECT:** the suite stops at the first failure, so
      `stray_probe_check` — the one that catches abandoned Chrome on this laptop, the day after 183
      of them were found holding 15GB — plus `doc_command_check`, `chart_sweep_conserves_check` and
      about nine others **have not run all night.** Run by hand 2026-09-03T03:1xZ: clean. But a suite
      that stops before its safety gates is quietly not checking them.
      **ROOT CAUSE, MEASURED 2026-09-03T04:0xZ — do not re-derive this, it cost an hour:**
      rows are RANKED before their handles are minted, and part of the score is looked up BY handle
      against `CHART-LOG.md` — **a file this same tool writes.** So run 1 ranks handle-less rows
      (all tie at 0, file order wins), writes the log and the handles; run 2 ranks the same rows
      with handles against a log that now mentions them, and orders them differently; run 3 matches
      run 2. Proven by stripping the two handles and re-ranking: both scores drop 8 → 0, which is
      what rules out an unstable sort or a tie-break.
      ⚠ **A PARTIAL FIX WAS BUILT AND REVERTED, DELIBERATELY** — minting the handle inside
      `applySettle` so a split row is born with one. It is probably right and it is **not
      sufficient**: the gate's fixture starts with NO handles on ANY row, so every row is ranked
      without identity on run 1, not merely the split ones. Shipping it would have changed handle
      allocation order on his real Chart — and handles are load-bearing in `CHART-LOG.md`, the
      ledger and git — while still leaving the gate red. Reverted; baseline restored.
      **THE REAL FIX IS A DECISION, NOT A PATCH:** either mint every open row's handle BEFORE the
      rank (a pre-pass; a no-op on the real Chart, where every row already has one), or stop the
      ranker scoring on a file the tool itself writes. **The second is the rule-23 answer** — a
      ranking that reads its own output is two things kept in step by nothing.
      ⚠ **THE QUESTION FOR HIM WAS RETIRED BY MEASUREMENT, NOT ANSWERED — AND IT WAS RIGHT TO ASK.**
      This row read: *"HIS CALL, BECAUSE IT CAN REORDER HIS LIST… is it acceptable for the fix to
      change the current order of the Chart once, if it never changes on its own again?"* Asking
      before shipping blind was the correct instinct. **But it is only his call if the answer is
      "it reorders", and it does not.** Measured 2026-09-03T04:2xZ on COPIES of both real charts
      (`scripts/qa/_ck_realchart.mjs`, scratch): `CHART.md` — **0 ids allocated · 0 rows moved**,
      row order byte-identical to the file on disk, run 1 === run 2. `GLASS-CHART.md` — the same.
      **Every open row on his live Chart already carries a handle, so the pre-pass is a no-op there
      and only ever fires on a row born without one.** There is no reshuffle to approve, so nothing
      waited on him. *(The general lesson, and it is rule 6's: a question parked for Wyatt costs him
      a decision. Check whether it is still a question before parking it.)*
      **Sizing: MEDIUM. No game code. Blocks nothing except the twelve gates behind it.**
- [ ] **CASE 10f CATCHES THIS FAULT ONLY BY ACCIDENT OF ITS FIXTURE — CEO 139's one criticism, filed
      in its own words rather than argued with.** *"Case 10f is a whole-file byte comparison over one
      bundled fixture (`chartkeeper_check.mjs:721-727`). It caught this fault, but only because that
      fixture happens to contain an Inbox entry naming `THE BLADE HOUR` by handle. **Nothing asserts
      that property.** If a future edit tidies that entry out, 10f goes quiet without going red, and
      handle-before-rank has no dedicated guard — there is no case anywhere in the file asserting
      that a row's handle exists before `ranked` is computed. The fix is durable; the proof that it
      stays fixed rests on fixture content nobody has pinned. Worth a row on the Chart, not a
      rework."* **Sizing: SMALL — one gate case. No game code.**
- [ ] **A GATE IN `npm test` WRITES THE LIVE `LONG-RUN` MARKER — SO THE SUITE AND A SAILING SEA
      ⟨`T-131`⟩
      TRIAL FIGHT OVER ONE FILE, AND THE SUITE CAN FREEZE THE TRIAL.** Measured 2026-09-03T04:0xZ.
      `scripts/qa/glass_longrun_status_check.mjs` plants four fixtures in the REAL
      `.planning/wyclau/LONG-RUN` (`:55, :92, :100, :109`) and restores the previous contents at
      `:116`. A detached sea trial writes that same file as it sails.
      **TWO CONSEQUENCES, THE SECOND ONE DAMAGING:**
      1. the gate reads the TRIAL's marker where it expected its fixture — all three staleness cases
         fail on the same live JSON. **This is what a red `npm test` looked like tonight** (3
         failures), and it is not the pre-existing chartkeeper fault (`T-130`), which is a different
         gate further down the chain.
      2. the restore writes back a snapshot taken BEFORE the trial's updates — **so running the
         suite can freeze a live trial's progress** at whatever it was when the suite started.
      **OBSERVED:** trial pid 35064 sat at `0/10 legs`, `updatedAt` 03:42:32Z, for 25 minutes while
      `npm test` was run repeatedly beside it. ⚠ **Whether the gate froze it or the trial was simply
      slow was NOT established, and that ambiguity IS the finding** — an instrument that writes its
      subject's file makes its subject unreadable. Not reported as proven damage.
      ✅ **RESOLVED 20 MINUTES LATER, AND IN THE TRIAL'S FAVOUR: IT WAS SLOW, NOT FROZEN.** The
      marker moved to `1/10 legs`, `updatedAt` 03:55:12Z, with pid 35064 still alive — so leg 1
      simply took ~14 minutes and nothing was clobbered. **Consequence (1), the read collision, is
      still PROVEN** — three gate cases failed against live trial JSON, which is what tonight's red
      suite was. **Consequence (2), the freeze, is a real code path with NO observed instance:** the
      restore at `:116` genuinely writes back a pre-run snapshot, so the race exists, but it did not
      fire here. *Say it that way and no stronger.*
      ⚠ **IT IS A DESTROY-THEN-REPAIR, WHICH THIS PROJECT HAS ALREADY RULED AGAINST**, in `T-112`'s
      own row: *"Do NOT fix it by making the gate restore the file afterwards — a destroy-then-repair
      is still a window, and this project has already lost a note inside one."* That was about
      `GLASS-NOTE.md`; **this is the same fault in the same shape, one file over.**
      **THE FIX IS THE SAME SHAPE AS THE ONE ALREADY SHIPPED** — a `--marker=<path>` override on the
      reader, so the gate points it at a fixture instead of borrowing the real file and putting it
      back. Compare `glass.mjs --consume-note`, which fixed exactly this for his queued note.
      **UNTIL IT IS FIXED: do not run `npm test` beside a sailing trial.** A warning to that effect
      is at the top of the gate, where somebody will actually meet it.
      **Sizing: SMALL. No game code.**
