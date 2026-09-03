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
      ✅ **HE ALREADY MADE IT — MEASURED 2026-09-03T06:0xZ, at his note "verify this to make sure it
      functions as needed."** `.claude/settings.json:11-12` now carries **both**
      `"Bash(npm run deploy:staging*)"` and `"Bash(bash scripts/deploy-staging.sh*)"`. **The blocker
      this row is built on is gone**, and the row had no way to know: it was written from a refusal
      that was true when it was measured and stale when it was read — the same shape as `T-011`'s
      false STOP and `T-085`'s claude-kit fence, both of which cost a session each tonight.
      ⚠ **AND THE STALENESS NUMBER WAS WRONG TOO, IN HIS FAVOUR.** The row says the wire reads
      `2026.09.01.6-staging@60f969c4`. Measured against the live address just now:
      **`2026.09.01.8-staging@1ce21a00`** — so a deploy DID land after this row was filed. Staging is
      still behind the tree (`2026.09.02.1`), but by one build, not two.
      ⛔ **STILL NOT DEPLOYED, AND THE PROCESS — NOT A JUDGEMENT CALL — IS WHY.** The release contract
      is `npm test` exit 0 → gear → sea trial → deploy. **`npm test` is RED**, on
      `chart_sweep_conserves_check` (106 handles owned by nothing), which is another session's
      bookkeeping fault and touches no game code. The rule does not carve out "unrelated" failures,
      and inventing that exception at 6am to publish to an address he plays is exactly the kind of
      judgement a watch does not get to make alone.
      **SO THIS ROW IS NOW BLOCKED ON A DIFFERENT THING THAN IT SAYS AT THE TOP:** not his
      permission — he gave it — but a green suite. **Whoever gets `chart_sweep_conserves_check`
      green can take this row straight through.**
      ⚠ STALE-CANDIDATE — stale-evidence (re-measure it on this build) — measured on build 2026.09.01.8; the tree is 2026.09.02.1, so its evidence no longer describes this game
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
- [ ] The Blade hour (Wyatt + a session, ~30–60 min): register the Bell, the ring test both
      ⟨`T-021`⟩
      ⚑ **HIS NOTE, 2026-09-02 10:36 PM ET, backlog page — VERBATIM:** *"I"m 99% sure the Blade Hour is complete!"*
      **HE SAID 99%, NOT 100% — SO IT IS CHECKED, NOT CLOSED.** His recollection is evidence; it is not a measurement, and he was careful to say so himself.
  directions, the O2 publish test — runbook `scripts/wyclau/RAZER-SETUP.md`
  **PARTIALLY DERIVABLE, measured 2026-09-02T03:5xZ: `schtasks /Query /TN "wyclau-bell" /V` on
  this machine shows the task registered and Enabled (Status: Ready, last ran 23:48, next 23:58)
  — the Bell-registration third is done. The ring-test and O2-publish thirds are not checkable
  this way; still needs Wyatt or a session that can run them.**
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
- [ ] **A QUESTION PUT TO WYATT THAT NAMES NO TASK LEAVES THE ROW IT IS HOLDING UP AT THE TOP OF THE
      ⟨`T-132`⟩
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
- [ ] **CASE 10f CATCHES THIS FAULT ONLY BY ACCIDENT OF ITS FIXTURE — CEO 139's one criticism, filed
      ⟨`T-134`⟩
      in its own words rather than argued with.** *"Case 10f is a whole-file byte comparison over one
      bundled fixture (`chartkeeper_check.mjs:721-727`). It caught this fault, but only because that
      fixture happens to contain an Inbox entry naming `THE BLADE HOUR` by handle. **Nothing asserts
      that property.** If a future edit tidies that entry out, 10f goes quiet without going red, and
      handle-before-rank has no dedicated guard — there is no case anywhere in the file asserting
      that a row's handle exists before `ranked` is computed. The fix is durable; the proof that it
      stays fixed rests on fixture content nobody has pinned. Worth a row on the Chart, not a
      rework."* **Sizing: SMALL — one gate case. No game code.**
- [ ] **`chart_sweep_conserves_check` IS RED ON THE LIVE TREE AND HAS BEEN RED LONG ENOUGH THAT
      ⟨`T-133`⟩
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
      **2. HIS 03:49Z GLASS ASKS — BUILT 2026-09-03T04:5xZ, see `T-076`.** ~~STILL NOT BUILT~~ —
      expandable rows, and a comment box under each item. Both need `glass.mjs`, which is no longer vendored-locked, so they are ordinary
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
- [ ] Memory consolidation: five homes → one + pointers — GATED: same quiet moment
      ⟨`T-029`⟩
- [ ] Rulebook cutover: `CLAUDE-next.md` replaces `.claude/CLAUDE.md`; war stories → `.claude/rules/*.md` at their triggers — GATED: at the quiet moment, needs the parallel fix session closed
      ⟨`T-031`⟩
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
- [ ] Pruning: kill-list generated (GSD phase machinery, dead files), archived in git, deleted; goes on the Glass for the record — GATED: same quiet moment
      ⟨`T-030`⟩
