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

- [ ] **A QUESTION PUT TO HIM CANNOT BLOCK A ROW ON THIS CHART, BECAUSE THE QUESTION LIVES IN THE
      ⟨`T-209` · size: S⟩
      OTHER FILE — so the Advisor's list has no automatic blocked-detection at all.** Filed
      2026-09-03T10:5xZ by the Advisor, immediately after hand-repairing an instance of it.
      **WHAT HAPPENED, minutes ago:** `T-121` was parked and its question written to `CHART.md`'s
      BLOCKED ON WYATT, naming ⟨`T-121`⟩ correctly. Then `chartkeeper --chart=GLASS-CHART.md --rank`
      reported **0 rows moved** and left the parked row at rank 1 — the row the Door tells the next
      session to take. `chartkeeper.mjs:934`'s `livePointer` looks for the handle in the chart it was
      POINTED AT, and his questions all live in `CHART.md`. **A question in one file cannot penalise
      a row in the other.** Repaired by hand with `· needs: wyatt` on the handle line, which the
      scorer reads directly — 23 rows then moved and the parked row sank.
      ⚠ **THIS IS `T-132` IN A SECOND COSTUME, AND THAT MATTERS MORE THAN THE BUG.** `T-132` is *"a
      question that names no task leaves the row it is holding up at the top"*. This is *a question
      that names its task perfectly and still cannot reach it.* Same consequence — a watch sent to a
      row waiting on Wyatt — and it is now the **fourth** hand-repair of a Chart bookkeeping fault in
      three days. **The hand-repair does not generalise: the next parked Glass row needs the same
      manual flag, and nothing reminds anyone.**
      **SHAPE OF THE FIX:** `livePointer` should read BOTH charts' BLOCKED ON WYATT sections, not
      just the one it was pointed at — the same one-line correction already made to
      `chart_sweep_conserves_check` and `close_item.mjs` when his split broke them. **This is the
      SIXTH tool with that exact fault** (`close_item`, `chartkeeper`'s sections, `tick_rows`, the
      ranker, the sweep gate, and now `livePointer`). One instruction of his split one list in two,
      and every tool with a path written into it went quietly wrong in a different way.
      **Sizing: SMALL. No game code. Nothing blocked on Wyatt.**
- [ ] **THE PUBLISH RECEIPT CANNOT TELL A REAL ARTIFACT VERSION FROM ONE A SESSION TYPED — AND I
      ⟨`T-208` · size: S⟩
      PROVED IT BY DOING IT, ACCIDENTALLY, TODAY.** Filed 2026-09-03T10:1xZ by the Advisor, against
      itself.
      **WHAT HAPPENED, plainly:** after republishing his Glass I ran
      `mark_glass_published.mjs --version=1788430700-0000`. **The publish returns no version id, so
      I invented one** — right shape, plausible, entirely fictional. It stamped without complaint.
      The real version was `1788430454-6067`, recovered by re-reading the page; the receipt is
      overwritten each time, so the false line is gone from disk and the correction cost one command.
      ⚠ **WHY NO GATE CAUGHT IT, and this is the reusable half.**
      `receipt_version_is_identity_check.mjs` was built (ceiling raise `2026_09_03a`) because both
      receipts once held a CLOCK in a field named `artifactVersion`. It proves the value is **not a
      timestamp**. It cannot prove the value is **real** — and a fabricated `<epoch>-<hex>` passes it
      by construction. **A gate on a field's SHAPE is not a gate on its TRUTH**, which is the same
      sentence that raise already wrote about a field's NAME, one level down.
      **WHY IT MATTERS RATHER THAN BEING TIDINESS:** this receipt answers *"has he written something
      since?"* before a republish. A session comparing the live version against an invented one sees
      a mismatch and re-harvests — noisy but safe — **or matches by luck and republishes over his
      words.** The receipt exists precisely to stop that.
      ✅ **AND THE FIX IS MECHANICAL AND CHEAP, VERIFIED TODAY:** the Artifact read saves the page to
      a file **whose name carries the version** —
      `artifact-74034bde-1788430454-6067.html` (four such files on disk, all this shape). So take
      `--from=<that path>` and DERIVE the version from the filename, refusing a bare `--version=`
      typed by hand. **A number that cannot be typed cannot be invented**, and it is the same
      derive-don't-declare shape as `sitemap_lastmod_check` and clause D of the stats gate.
      **Sizing: SMALL. No game code. Nothing blocked on Wyatt.**
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
- [ ] **EVERY VOYAGE FAILS ON "NEVER STOPPED MOVING", AND THE WAIT THAT DECIDES IT IS EXTENDED BY
      ⟨`T-141`⟩
      TEXT WHILE EVERY FAILURE IS GEOMETRY.** Diagnosed 2026-09-03T08:1xZ from the 0624Z trial;
      **blocks `T-136` in part** (four of ten legs — see that row; six fail on other things). Not
      fixed, and **handed over with the MECHANISM, not a measurement — the difference matters and my
      first wording claimed the wrong one.**
      ⛔ **THE SETTLE CURVE IS UNMEASURED. A PROBE WAS ATTEMPTED AND FAILED. READ THIS BEFORE
      BUILDING ANOTHER ONE** — the sentence I owed the next session and did not write, caught by
      CEO 156: *"the next session will build the same probe and hit the same wall, which is
      precisely what the row promises it will not."*
      `scripts/qa/_t141_settle_curve.mjs` samples the same signature past the cap. It reported
      **"nothing moved at all — the board was already still", twice** — the answer that would have
      unblocked his deploy. It was not an answer: every selector matched **zero** elements against
      115 divs and the right page title. **The page loads; the game never starts.** Verified twice
      over by CEO 156, which counted immediately after the click AND four seconds later: still zero,
      `#lobby` still `display:flex`. **So it is not a timing problem, and the probe's own comment
      said it was until that was corrected.**
      **START AT `docs/DRIVING-THE-GAME.md` §5b — "the autoplay driver, the loop that actually
      plays" — NOT AT A FRESH PROBE.** And add first the check that saved this one: **count the
      elements before believing any silence.** A probe that cannot see its subject reports the world
      as still.
      **THE NUMBERS, from `SEA-TRIAL-2026-09-03T0624Z-Wy-Blade.md`:** ten voyages, ten FAILs, and
      **every single "still moving" report says `geometry`. Ten out of ten. NOT ONE says words.**
      Longest waits cluster at **2.6s, 2.7s, 2.8s, 3.0s** — i.e. at the cap and just past it.
      **THE MECHANISM, read in `scripts/lib/checks.mjs:230-241` rather than guessed:**
      `waitSettled(..., capMs = 2600)` and, in its own words, *"while the PAINTED text is still
      growing, the deadline is pushed out — the wait tracks the reveal's own progress."*
      **So the deadline extends on TEXT. The screens are failing on GEOMETRY. Geometry gets no
      extension at all**, so a board still animating at 2.6s is graded "never stopped moving", every
      time, on every leg.
      ⚠ **AND THE 2600 WAS DERIVED FROM TEXT, WHICH THE FILE SAYS OUT LOUD:** *"the opening
      narration paints at ~25ms/char and finishes at ~1890ms, so a 75-character line settles at
      2202ms — inside the old flat 2600ms cap by a whisker."* **A text-derived number is being
      applied to ships gliding and ripples pulsing.** That same comment warns against raising it —
      *"exactly the constant rule 9 forbids: right for today's longest message, wrong for the next"* —
      and the warning is right; **the fix is that geometry needs its own progress-tracked deadline,
      not a bigger flat number.**
      ⛔ **MY STRONGEST ARGUMENT FOR "INSTRUMENT FAULT" WAS CIRCULAR, AND CEO 156 KILLED IT WITH THE
      ARITHMETIC.** I wrote that a board which never settles *"would report the 12000ms hard guard,
      and no leg reported it"* — treating that silence as evidence the board stops soon.
      **The guard is STRUCTURALLY UNREACHABLE here.** `checks.mjs:250` loops
      `while (Date.now() < deadline && Date.now() - t0 < HARD_MS)`, and on a geometry-only screen the
      deadline never moves past ~`t0 + 2600` — so the loop always exits at 2.6s and **never gets
      near 12s.** "No leg hit the guard" is not evidence about the board; **it is a second symptom of
      the same bug.**
      **AND BY THE SAME ARITHMETIC THE 2.6–3.0s CLUSTER CARRIES NO INFORMATION EITHER.** That is
      simply what cap-exhaustion prints. **A board that animates for four seconds and one that
      animates forever both report `2.7s`.** So the instrument-vs-game question is not leaning one
      way — **it is fully open**, and I had talked myself into a side of it.
      ⛔ **WHAT THIS DOES *NOT* PROVE, and the distinction is the whole value:** it does not prove
      the game is fine. The board may genuinely be animating longer than it should. **What it proves
      is that the instrument cannot currently tell those apart** — a screen that animates 2.7s and a
      screen that animates forever produce the same verdict. **Rule 26: this is a POSED question, not
      a rate.** Same seed, same prompt, before and after — photograph a board at 2.6s and at 4s and
      look at whether it has stopped.
      ⚠ **MY OWN PREDICTION WAS WRONG AND ITS FALSIFIER FIRED — second time in an hour.** I predicted
      the budget had been tightened (trial bug) or settle times had grown (game bug), and named
      *"wrong if neither moved"*. **Neither moved.** `git log -S 2600` on those files shows one
      commit, a tree-wide refactor. The answer was in neither half of my dichotomy.
      **Sizing: MEDIUM, and it is the trial's lane, not the Glass's. No game code to fix here — the
      first job is deciding which of the two things is broken.**
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
- [ ] **STAGING IS TWO BUILDS BEHIND AND HE PLAYS STAGING — the deploy itself, carried over from
      ⟨`T-136`⟩
      `T-027` so his actual need is not lost when that row closes.**
      `T-027` asked *"verify this to make sure it functions as needed"* and the verification is
      done: the permission he was asked for **already exists** (`settings.json:11-12`, both forms),
      and the suite that blocked the deploy is **green, exit 0**. But verifying a blocker is gone is
      not the same as doing the thing, and **closing `T-027` on a completed verification would have
      quietly retired his actual need.** So it lives here.
      **MEASURED 2026-09-03T06:3xZ:** staging serves `2026.09.01.8-staging@1ce21a00`; the tree is at
      `2026.09.03.1`. **Two builds, and the address he plays is the older one.**
      ⛔ **THE TRIAL LANDED AND IT FAILED — ALL TEN VOYAGES. THE DEPLOY WAITS, AND THE FAILURE IS
      THE WORK.** `.planning/SEA-TRIAL-2026-09-03T0624Z-Wy-Blade.md`, 89 min, gear FULL, stamp
      `2026.09.03.1`, `voyages that did NOT run: none`.
      ⛔ **AND FIXING THE SETTLE BUG DOES NOT UNBLOCK THIS ROW — the sentence neither row contained
      until CEO 156 wrote it. FOUR legs of ten would clear. SIX WOULD STAY RED.**
      *clears:* passplay-phone, passplay-desktop, crew-desktop, solo-phone-wk.
      *stays red:* solo-desktop, solo-phone, solo-tablet, crew-phone, solo-desktop-wk, solo-tablet-wk
      — every one of them for something the settle fix cannot touch. **He was being told he is one
      fix from a deploy. He is not.**
      **WHAT FAILED, AND IT IS NOT THE STALE SUITE — with the counts corrected; my first version
      under-reported the damage by half:**
      · **the vision judge REJECTED screens it looked at — TEN screens across SIX legs**, not the
        five across three I first wrote: 1 of 30 solo-desktop · 1 of 21 solo-phone · 3 of 29
        solo-tablet · **1 of 51 crew-phone · 1 of 27 solo-desktop-wk · 3 of 22 solo-tablet-wk**.
        ⚠ **THESE ARE THE HALF MOST LIKELY TO BE A REAL BUG A PLAYER WOULD SEE, and nobody has
        opened them.** Rule 19's live detector, filed as a footnote under a timing story.
      · **FOUR buttons offered and never pressed**, not one: `deny`, `vanilla beans`, and
        `walk away` twice;
      · **every single voyage reports screens that never stopped moving before being checked** —
        8, 9, 10, 22 of them, `longest wait 2.7s` and `2.8s` against a **2.6s budget**. A peer
        session measured the same margin independently and declined to run its own browser probes
        because of it;

      ⚠ **I PREDICTED THE OPPOSITE AND THE PREDICTION IS WHY THIS ROW SAYS WAIT.**
      `PREDICTION-20260903T0805Z-T136-trial-verdict.md`, written before reading the voyage section:
      *"I expect the FAILED verdict to be entirely the browser-free half, and the ten voyages to be
      clean."* Grounds were decent — the failure section is headed *"the browser-free checks failed"*
      and its contents are `chartkeeper` fixture output (`T-802`, `no-such-row.md`, a temp dir), and
      the suite genuinely WAS red at 06:24 and is green now.
      **Its named falsifier — *"any structural failure reported inside the voyages themselves"* —
      fired on the first line I read.** Ten for ten.
      ⚠ **AND THE PREDICTION NAMED THE TRAP BEFORE I WALKED INTO IT:** *"Wanting the answer. He plays
      staging, staging is two builds behind, and the only thing between him and the current build is
      this verdict. That is exactly the pressure under which a session decides a failure was 'just
      the instrument'."* **That is what I was doing.** The stale-suite reasoning was true and it was
      not the whole verdict, and I would have shipped on it.
      **SO: NOTHING IS BLOCKED ON WYATT, AND NOTHING SHIPS.** The settle margin is the next question
      — 2.7–2.8s against a 2.6s budget on every leg is either a real regression in how long the board
      takes to stop, or a threshold too tight for this build, and **which one it is decides whether
      this is a game bug or a trial bug.** That is a POSED question (rule 26), not a rate.
      **WHEN THE TRIAL LANDS GREEN:** `npm run deploy:staging -- "<what changed>"`, then check the
      stamp reads `<stamp>-STAGING/<branch>`. If the trial fails, that failure is the work, not this.
      ⚠ **DO NOT re-derive the permission question.** `T-027`'s row was written from a refusal that
      was true when measured and stale when read — the third time tonight that shape cost a session
      (see also `T-011`'s false STOP and `T-085`'s claude-kit fence). **Re-measure before believing
      any row that says a thing cannot be done.**
      **Sizing: SMALL — one command, once the trial is in.**
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
- [ ] **AFTER HIS FIRST DRAG, RANK STOPS RANKING THE CHECKLIST — AND THE SEVEN ROWS HE WAS TOLD
      ⟨`T-121` · size: S · needs: wyatt⟩
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
      ⛔ **PARKED 2026-09-03T10:4xZ — PUT TO HIM, because both shapes are defensible and the answer
      changes how HIS OWN page behaves under his hands.** Question `qid:t121-drag-scope` is in
      `CHART.md`'s BLOCKED ON WYATT, so it renders on his Your Call card.
      **WHAT WAS MEASURED FIRST, so the question is not an abstraction:** `glass.mjs:1770` —
      `saveOrder()` calls `sequence()`, which returns the WHOLE list, so one drag stamps `order:` on
      all 50 draggable rows. `chartkeeper.mjs:922` scores a dragged row `5000 - position`, i.e.
      **4,950–4,999, against a derived ceiling of 196**. So the sinking is total and permanent, and
      the only escape the page offers is dragging a row back to its exact original slot
      (`glass.mjs:1771` clears the order when the sequence matches the one it was born with).
      **THREE ANSWERS OFFERED, and the third is that nothing is wrong** — *"the order I left it in"*
      is a coherent design, and this may be a problem he does not have. Recommendation is the escape
      hatch first (one button), the drag-scope change second, because one un-sticks him today and
      the other changes what a drag MEANS.
      **Sizing: SMALL. No game code.**
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
