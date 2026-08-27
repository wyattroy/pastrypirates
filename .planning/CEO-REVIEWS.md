# CEO reviews — the standing record

**Rule 25 says hand each new CEO "the previous CEO's verdict", so it can say whether the same fault
is recurring. Until 2026-08-26 that verdict lived only in the running session's context — so the
moment a session ended, the mechanism that catches RECURRING faults quietly stopped working.**
This file is where verdicts live now. `scripts/qa/ceo_brief.mjs` reads the newest entry
automatically.

**APPEND ONLY. Newest at the top. Never edit an old verdict** — a review that was wrong is evidence
about the reviewer and belongs on the record exactly as it was written.

---

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
