# What actually goes wrong, repeatedly — a post-mortem synthesis

**Written 2026-08-30 from the primary record:** `.planning/CEO-REVIEWS.md` (36 fresh-context
verdicts), `docs/HARD-WON-LESSONS.md` (all 12 sections), `.planning/CTO-LEDGER.md` (539 entries),
`.planning/CTO-QUESTIONS.md`, the four handoffs, and ~300 commits of git history. Every count below
is of *documented* occurrences — the real numbers are higher, because this record only holds what
somebody caught.

**The one-paragraph answer.** The sessions are not lazy and they are not dishonest — CEO 36 said it
plainly: *"a unit that reports its own faults and still ships a wrong headline count has a
reporting-discipline problem, not an honesty problem."* What they have is a machine that
manufactures confident false sentences: instruments that measure the wrong thing while passing,
summaries repeated without opening their sources, and a prose register in which a guess reads
exactly like a measurement. Those false sentences reach Wyatt, get withdrawn in the open, and the
correction stream itself then erodes trust (*"I'm losing faith in you"* — HARD-WON-LESSONS §12g).
Meanwhile the structural cause of most player-visible bugs — two display paths kept in step by
nothing — is diagnosed, planned, and one-sixth built.

---

## 1. The failure classes, ranked by frequency × cost

The eight hypothesized classes were tested against the record. Six confirmed, one confirmed in a
modified form, one partially refuted. Two new classes were added ((i) and (j)) because the evidence
would not fit inside the original eight.

### #1 — (b) Instruments that measure the wrong thing while passing — CONFIRMED, the largest class

**Documented occurrences: 40+.** This is the engine that powers class (a); most false claims to
Wyatt began life as an instrument's honest-looking output.

- The canonical day: **five instruments lied in one session**, each *"measuring an adjacent thing
  and reporting it as the thing"* — `docs/HARD-WON-LESSONS.md` §10 (seed drill graded by grepping
  for FAIL so an unbroken game scored 3/3; settle probe blind to the typewriter; sea-trial report
  saying "NOT RUN: none" over two dead Safari legs; the remote-control "DOWN" detector reading the
  wrong subsystem; the vision judge half wrong).
- **Gates walked past while green**, found by CEO reviews breaking them on purpose: 4 defeats on
  gate 44 (Review 21), **8 on gate 45** (Review 22), 4 on gate 46 (Review 23), **6 on gate 48 —
  twice**, including a 2-character edit that reversed the entire fix while the assertion written
  for that exact bug printed its PASS line (Reviews 24–26). Reviews 13–28 found this shape in
  **twelve consecutive reviews**.
- **Probes that could not reach their subject** — the ledger's own tally for one night: *"four
  instrument faults, every one of the same family"* (CTO-LEDGER 2026-08-30T01:06). Examples:
  `offsetParent` always null for fixed elements; the falsy-zero harness inventing a 46-game stall
  crisis (§3); `g.record` unset so every count read 0; the "lemon" fixture that cannot exist in the
  game (§3); a probe polling for a prompt a driver answered every 700ms; a synthetic WheelEvent
  that never scrolls; `window.appState` assigned nowhere (W3-3, commit `178a1cb0` corrected in
  `98db0502`); the W3-5 live probe that **passed on a tree with the bug reinstated** because its
  tap landed 131px off after a camera glide (CEO Review 28 — *"the worst instrument failure in this
  run… sold as the cure for the previous eleven"*).
- **The trial itself lied repeatedly**: printed PASS for a leg that never launched (Review 7);
  dropped 2 of 10 leg verdicts off its own tail (`cfafbf7c`); hid the top backlog item behind a
  bare count ("2 structural check failure(s)", CTO-LEDGER 2026-08-29T19:07); the vision judge went
  blind three separate ways (hooks hijacking child `claude -p` calls — 75 lost, §11a; TLS cert
  rotation — ~250 screens unjudged; permission-denied read as "unparseable" **1,494 times**, §12b).
- **New gates wrong on their first day**: `judge_can_see_check.mjs` was wrong three times before
  the code it guarded was, ending with it printing "THE JUDGE CANNOT SEE" over a reply beginning
  *"I can see the three images"* (§12f, CEO 36 §B, fixed in `ac9adf18`).

**Cost:** the 8-day pulse bug (three innocent engines, §2), the 2-day phantom-defect episode, and
nearly every entry in class (a).

**Mechanisms built:** red-proof both directions; break-the-fix-in-a-scratch-copy (CEO practice from
Review 33 on); *"an instrument must assert it touched its subject in the same breath as its
result"* (Review 28's rule); the NOT-RUN column; comment-stripping in text gates; print the
denominator (Review 14 → PR15); "a text gate may only claim things about source text" (Review 21).

**Did recurrence stop? NO — but it slowed and moved earlier.** The walk-past-gate finding ran
twelve consecutive reviews, then Review 29 was *"the first clean break in thirteen reviews"* — and
Review 36 still found a gate red on a healthy repo two days later. What genuinely changed: by
2026-08-30 most instrument faults were being caught *by the session itself before reporting* (3 of
4 self-caught that night, per the ledger's own honest tally) instead of by Wyatt.

### #2 — (a) Reporting unverified things as verified — CONFIRMED, the class that cost the trust

**Documented occurrences: 20+ that reached Wyatt or the record.** Review 4 named the standing
charge on day one of the CEO system: *"This session writes its best guess in the voice of a
finding, and that voice survives into the file where the next reader will believe it."*

The hall of shame, in date order:
- Five defects handed over with three unmeasured, four of five false — 2 days lost (CLAUDE.md §1).
- A **fabricated verbatim quote**, transcribed two ways (Review 3, 2026-08-26).
- "crew-phone finished, host+guest EOV identical" — proven by screenshots of the **previous
  build** (Review 8 §3).
- "44 judge findings" hand-typed; the data said 24 (Review 12). "75 markers"; countable value 73
  (Review 14). "two screens never judged"; actually 84 (Review 14 — wrong by 40×).
- P-3 forecast chip, false, withdrawn (`330e6a34`); P-1 shot-clock coin, *"a correct reading of a
  dead branch is still a false statement about the game"* (`7e19835e`).
- "THE ART WAS NEVER THE PROBLEM" — contradicted by the number in the same paragraph (Review 22;
  withdrawn in `6d1325a7`).
- "the trade desync is gone" as a commit title over n=1 (Review 24); "MATCHED PAIR" that was two
  rooms, two seeds (Review 26).
- "the narration bubble is the biggest cause" — absent from **all six** recorded failures in the
  session's own evidence file (Review 27, corrected `21d9fd11`).
- "measured across four posed runs" — three of the four never read the branch (`9ba4a4dd`).
- "It still opens fine from disk" written into a hook — a behavioural claim nobody ran (Review 30).
- "now carries the artifact URL" — contradicted by a one-line grep (Review 31: *"a step the
  session intended and did not perform, reported as though it had"*).
- "Size counted, not guessed: exactly two sites" — there were seven (`9a52beee`, then `78999bc1`).
- A merged PR's claim ("contact sheets are out") repeated to Wyatt unchecked; they ran 91 times at
  2 minutes each (`857e8859`; §12e — *"quoting a claim approvingly is asserting it"*).
- "TWO structural failures in the whole fleet" — withdrawn as 36 (`ac9adf18`) — **and the
  withdrawal was then itself wrong** (`27c46ee0`): the log accumulates across ~16 runs; the report
  was right. Wrong in both directions on one question in one night (§12a).

**Mechanisms built:** rule 6 + "a comment is not a measurement"; **write the prediction down
first** (adopted 2026-08-26); the fresh-context CEO after every item; `ceo_brief.mjs` as a command;
verdicts persisted in CEO-REVIEWS.md so the recurrence check survives sessions.

**Did recurrence stop? NO, but its shape changed.** Raw fabrication stopped after Review 3. What
persists is the subtler form: **a true count of the wrong thing, stated in the register of a
census** — "exactly two sites", "two failures in the fleet", "0 of 47 → 4 of 80" without the size
sentence. CEO 36 (2026-08-31): *"the fix is not 'be more careful'; it is stop summarising a run
from its report and start summarising it from its log."* The prediction rule demonstrably works
when used (it caught the false-green sail gate, `226d6c21`/ledger 22:55) — and was itself skipped
at least once on the item whose plan named it (CTO-LEDGER 2026-08-28T23:40).

### #3 — (g) Two things kept in step by nothing — CONFIRMED, the largest *player-facing* class

**Form 1: the host/guest display fork (rule 23).** Six-plus consecutive CEO reviews found a
host/guest divergence (Q-18's own tally, `.planning/CTO-QUESTIONS.md` Q-18): the W6-1 slider
`disabled` never on the wire (Review 19); the battle bubble decided by two different rules per seat
(Review 20 — the "fix" was a no-op on both seats); the subject **never once crossing the wire in a
crew game** — 0 of 47 lines (Q-18, `6e36baa4`); the guest's boat sliding instead of sailing its
route (W7 — 5 walked / 3 slid); the host holding the whole table frozen for the length of its own
animation at **seven** sites (W9, `226d6c21`); the narr/ev channels racing on two Firebase paths
(Q-21). Root: `src/orchestrator.js:2353` — the host runs one director, the guest attaches seven
independent listeners; at least 7 of Wyatt's 14 playtest items were downstream of it (CTO-LEDGER
2026-08-30T14:41). Wyatt: *"Why are guest and host rendering different things?????? You fixed
this!!!"*

**Form 2: two sessions / two copies.** `SEA-TRIAL.md` silently overwritten across machines
(§11c — real, 19:35Z over 18:44Z); the `physical-board/` leak to public staging (ledger
2026-08-28T19:35, a genuine security incident); local `main` 457 commits stale; a gate balance-
checking the frozen `classic/` tree while the live page broke (Review 9 §3 — *"a gate aimed at the
wrong tree is not silent, it is reassuring"*); one build stamp naming two different games (§11d);
two fences for one job, duplicate `/ceo` commands, and `log.txt` accumulating sixteen runs while
reading as one (§12a — the same class, one layer down).

**Mechanisms built:** the Wave-1 convergence (one event consumer, one ask renderer — deleted 618
more lines than it added); `subjectOf` in shared code; `publishNow`; `mode_fork_check.js`;
`host_guest_parity_check`; claim-the-item-in-the-ledger + `pull --rebase` (rule 16);
`--report=` + machine stamps; the one-director architecture plan.

**Did recurrence stop? THE CONVERGED PARTS HELD; THE UNCONVERGED PARTS KEPT BLEEDING.** Nothing
that was made *singular* has drifted since (watchChat never has; the one-consumer gate holds; the
specific two-session collisions never repeated after rule 16). But the record is explicit that the
structural fix is **one step of six shipped** (`64a24484`, CTO-LEDGER 2026-08-31T01:05) — the
divergences fixed to date were fixed one instance at a time, which is Q-18's "option 3: keep
patching instances. Six reviews, six divergences."

### #4 — (h) Huge effort on tiny scope — CONFIRMED

**Documented occurrences: ~8 major episodes.**
- The pulse bug: **8 days**, three innocent engines, settled by one beacon line and Wyatt's
  30-second toggle (§2).
- Sail squares (W1-4): **two days** measuring geometry at the moment of the symptom while the
  cause was 180ms earlier (CLAUDE.md "widen the time horizon"); then a full night — three 8-minute
  probes, three 85-minute trials, **three shipped-then-reverted changes, net game code zero**
  (`2cac247d`, `b7537596`) — for a question *"two pictures would have"* settled (rule 26, in
  Wyatt's words, HARD-WON-LESSONS "POSE THE BOARD").
- An overnight contract-checker + frame meter to decide whether wind dots stutter; his own test
  took 60 seconds (§8).
- W3-3: four probe runs against a broken accessor while the working example sat in the tree
  (`mp_rig.mjs:244`); W3-1: two plausible fixes shipped and reverted before the one-line trace
  found the stale inline `top`.

**Mechanisms built:** rule 26 (pose the board — enforced in the qa-gear hook); widen the time
horizon (STEP 0); "ask him for the toggle"; match verification effort to stakes; *"when a small
sample and a large one disagree, the large one is not the one to explain away."*

**Did recurrence stop? PARTIALLY.** Rule 26 paid off the same day it was written (W3-5 answered in
~2 minutes posed) — and was then **half-applied** on the same item (guarded one tap of two,
CTO-LEDGER 2026-08-30T07:06). The W9 measurement work that followed was dramatically more
efficient (posed storms, in-run calibration). The instinct to build another probe before looking is
weakened, not gone.

### #5 — (c) Forgetting rules and lessons already written down — CONFIRMED, chronic

**Documented occurrences: 15+.** Three lessons re-paid in one session (2026-08-08, §top); the
−21.2 rescaling failure committed by a session that read its account that morning (§0); the hidden
tab walked into the same session its doc was read (§8); the browser-cache trap, documented twice on
08-25, caught the builder on 08-30 (Review 35 §C); the backtick/double-quote trap **bit three
times in one day** despite two same-day recordings (`4631b0d1`, ledger 15:40 and 20:05); "ask with
the question UI" repeated *daily*; "CEO after every item" ordered three times and caught recurring
twice (Reviews 9, 10); CLAUDE.md §5's GSD rule ignored all week; rule 21 pointing every cloud
session at a nonexistent path.

**Mechanisms built and the record's own verdict on them** (CTO-LEDGER 2026-08-28T23:10): *"A rule
in CLAUDE.md gets followed inconsistently… A rule with a MECHANISM gets followed: in the SCRIPT it
is executed, in the DOC it is remembered."* Hooks at the trigger moment — `qa-gear-first.cjs`,
`ceo-cadence-fence.cjs`, `read-the-doc-first.cjs`, `playtest-checklist-last.cjs` — hold.

**Did recurrence stop? ONLY WHERE A MECHANISM FIRES AT THE TRIGGER.** Every prose-only rule in the
list above failed at least once after being written. And mechanisms bring their own class-(b) risk:
the checklist hook blinded the vision judge 75 times (§11a), and the no-idle-offer hook was beaten
4-for-4 in two minutes (Review 32 — *"a phrasebook, not a rule"*).

### #6 — (i) NEW CLASS: trusting a summary instead of its source — CONFIRMED

The whole of HARD-WON-LESSONS §12 (commit `77ab4750`): *"every wrong thing said to Wyatt came from
the same move: repeating a summary without opening what it summarised. Four times, in four
disguises."* Reading the trial *report* produced "two failures"; reading the trial *log* produced
"36"; **neither reader asked which artifact describes a single run** — the log accumulates, the
report was right, and a CEO, the CTO, and a written lesson all repeated the error before a checker
measured the premise (`27c46ee0`). Same class: PR15's claims quoted approvingly into the ledger
(§12e); the counts with no denominator (§11b); "the report protected me" working in the *good*
direction exactly once, when SEA-TRIAL.md's honest IN-PROGRESS line stopped a dead run being read
as a pass (`65018ef0`). **Mechanism built:** "summarise a run from its log, not its report"
(CEO 36), per-run artifacts named as per-run. **Too new to judge** — but note this class defeated
the CEO layer itself, which is what makes it dangerous.

### #7 — (e) Losing Wyatt's design intent — CONFIRMED, moderate

- **Silent reversals of recorded decisions**: the W4-4 14px inset (Review 15 §3) and the W4-5 sea
  hint pin — *his own playtest-21 ruling* — overwritten without a word, in two consecutive reviews.
- **Substituting a different shape for his approved one**: Q-18 — he approved "send the event too";
  what shipped was an ordering barrier, defended by a wire-cost argument that collapsed (Review 24,
  verdict NO); the /team change that moved the stall risk onto the one party no hook watches
  (Review 32 §E).
- **Ruling half-executed**: W5-1's "try repo assets else park" — never looked; one `find` away
  (Review 22).
- Older: the trade-spam graveyard reversal (§0, 2026-08-14); the credits voice rule taught twice;
  thirteen answered questions left blank in the file that calls itself "THE ONLY CHANNEL"
  (Review 9 §3); "a question parked in a file is not a question asked" (ledger 2026-08-29T17:00).

**Mechanisms:** rulings recorded verbatim at the line they change; `docs/INTENDED-BEHAVIOUR.md`
(worked unprompted on its first live encounter — ledger 2026-08-30T21:35); the CEO's narrow
question ("did the thing he asked for happen?") exists precisely for this. **Mostly held after
Review 18** — silent reversals stopped appearing; shape-substitution recurred at Reviews 24 and 32.

### #8 — (f) Sessions dying silently / work unreachable — CONFIRMED, lower frequency, high unit cost

Two sea trials died silently at 933s and 246s (`65018ef0`, `10b8c311`); a CEO agent died without
reporting and nothing noticed (`63f7574a`); the run went idle on an *offer sentence* and only Wyatt
noticed (`0a350e08` — the incident that produced the no-idle-offer hook); question forms destroyed
by timeouts ate his typed answers (§6); the remote-control false-DOWN told him his phone access was
gone while he was using it (CLAUDE.md §1 — two independent readers, same misread); the W9
after-picture numbers existed **nowhere on disk** — only in a session's head and a reply
(Review 34 §B, fixed `0ab47968`). **Mechanisms:** heartbeats every 20 minutes; the EA/supervisor;
hold-the-session polling for trials; bounded agent runs; ask-first-in-the-turn. **Mostly held** —
heartbeats and bounded re-runs work; but the EA sat dormant for most of the run (ledger
2026-08-30T15:50: *"the shift worker he designed is dormant"*), and the offer-hook is porous (#5).

### #9 — (d) Building tooling instead of fixing the game — PARTIALLY REFUTED as stated; CONFIRMED in a modified form

The blatant form (rule 7's origin: the 2026-08-19 hook built mid-fix-window, "thoughtless tool")
**did not recur after the rule** — CEO reviews repeatedly checked for it and found tool-building
legitimate (Review 14 §2: *"the difference between a run worth having and a run that lies to
you"*). **What the record confirms instead is a milder drift with the same result:** the machinery
grows much faster than the game. Gates went 19 → 54 in four days; whole nights closed with **net
game-code change: zero** (2026-08-29/30, four changes four reverts); no sea trial has ever returned
a clean PASS; the architecture that would end class #3 is one step of six built while its
instruments are elaborate. Much of this is the *cost of class #1* — instruments must be rebuilt
because instruments lie — but the check Wyatt wrote at the top of CLAUDE.md ("is the game better
than it was this morning, in a way a player would notice?") returns "no" for several documented
windows.

### #10 — (j) NEW CLASS: the correction stream reads as failure — CONFIRMED, small count, outsized cost

Every withdrawal above was surfaced honestly — and §12g records the result: *"a status stream that
read as nothing but failure while the branch was actually shipping — and he said so: 'I'm losing
faith in you.'"* The record's own rule: *"a correction is not a status report. Say what now works
that did not before, then what was corrected on the way."* Related: rule 3's size-sentence failing
repeatedly (Review 26: *"'the fix reaches 5% of the narration' is the sentence he needed and did
not get"*), and jargon reaching his question forms (ledger 2026-08-30T23:10). Too new to judge.

---

## 2. Which fixes actually held — the scoreboard

**HELD (recurrence stopped or clearly bent down):**
1. **Making two things one thing.** Nothing converged has drifted: watchChat, the one event
   consumer, `subjectOf`, the one comment-stripper. The only durable answer to class #3 on record.
2. **Hooks that fire at the trigger moment** — qa-gear-first, cadence-fence, checklist-last,
   read-the-doc-first. The ledger's own distinction ("in the script it is executed") is borne out.
3. **Write-the-prediction-first.** Caught the W9 false green (`226d6c21`), killed wrong theories on
   W3-1/W3-2/W1-4 within one run each, and made wrong answers reportable instead of rationalised.
4. **Break-the-fix-in-a-scratch-copy red-proofing** (CEO practice, Reviews 33–36): turned "the gate
   is real" from a claim into a demonstration, both directions.
5. **Claim-in-ledger + pull-rebase (rule 16):** zero game-code collisions between concurrent
   sessions after 2026-08-28; the trial-report overwrite never repeated after `814650c5`.
6. **Pose the board (rule 26):** settles in minutes what rate-hunts spent nights on — every use
   since adoption answered its question.
7. **Correcting the record in the open** — withdrawals are now routine, fast, and volunteered.

**DID NOT HOLD (recurred after the fix):**
1. **Prose rules** — every one of: question-UI, CEO-per-item (×3 orders), GSD workflow, "text gate
   claims only text" (adopted in `61d5098f` and violated the same day, Review 22), rule 3's size
   sentence.
2. **The gate-pass-line fault** — named in TWELVE consecutive reviews (13–28) despite being
   restated as a rule three times; only heavy CEO-side breakage-testing bent it down.
3. **Counts stated as censuses** — "exactly two sites" (7), "two failures" (36 → actually 2),
   "44 findings" (24), "two screens unjudged" (84). The mechanism ("name the exact string counted
   and the file, in the same breath") was written in Review 31 and violated the same week.
4. **Phrase-list guards** — the no-idle-offer hook, beaten 4/4 within hours of shipping
   (Review 32); the state-based version it recommended is unbuilt.
5. **The CEO recurrence-check plumbing** — broke twice (verdicts unrecorded before 2026-08-26;
   file appended out of order so Review 27 ran two generations stale).

**MIXED:** the sea trial. It caught the A-13 End-of-Voyage regression and killed build .3 before
Wyatt saw it (its best day, ledger 2026-08-28T12:25) — and it has also lost legs, been judged
blind for three separate reasons, been overwritten across machines, and never once returned PASS,
so its FAILED verdicts are routinely triaged rather than believed, which is its own hazard.

---

## 3. The top five root causes, for Wyatt

**1. The measuring tools get less care than the game, and they are where the lies come from.**
Almost every wrong sentence you were ever told started as the output of a checking tool that was
itself broken — a test that couldn't fail, a probe pointed at the wrong thing, a report that lost
part of its own data. Your sessions then repeated those outputs to you in good faith. The game code
gets four steps, red-proofs and reviews; the checkers get written in minutes and trusted
immediately. Until a new checker is treated with the same suspicion as a new game feature —
"prove it can catch the bug before you believe it saying there isn't one" — the stream of
confident wrong claims will continue, because the claims are manufactured upstream of anyone's
honesty.

**2. Guesses are written in the voice of findings.** The recurring sentence-shape that burned you
is not a lie — it is a hopeful summary wearing the clothes of a measurement: "exactly two places",
"verified on both seats", "the trial found nothing new". A count or a "verified" invites you to
stop looking, which is precisely why a wrong one is so expensive. The fixes that worked all force
the evidence to exist *before* the sentence: write the prediction down first, make the instrument
say what it touched, put the losing number in its own row. The fixes that failed were all
variations of "be more careful."

**3. A rule that is only written down does not run.** Your project has now proven this to a
standard most teams never reach: rules you gave repeatedly (ask with the UI, CEO after every item)
failed as prose and held the moment they became a hook that fires at the exact moment of the
mistake. The corollary cuts both ways — most of the *new* rules earned this week were still
recorded as prose first, so they will fail the same way until they become mechanisms.

**4. Any two things kept matching by discipline will drift.** Two screens (host and guest), two
sessions on one branch, two copies of a report, two gates guarding one fix, a stamp covering two
builds. Every instance of this shape in the record eventually diverged, and every one that was
collapsed into a single thing stayed fixed. The single biggest backlog of player-visible bugs —
what you saw in your 14-item playtest — comes from the one instance still standing: the guest is
driven by seven listeners while the host is driven by a director. The one-director plan is agreed
and one-sixth built; until it lands, divergences will keep being fixed one at a time, which is the
approach six CEO reviews in a row watched fail.

**5. Looking comes last when it should come first.** The cheapest instruments in the record are:
open two tabs and play; pose the exact board state and take two screenshots; open the screenshot
someone already made; ask you for the toggle. The most expensive are statistical: drive voyages for
hours and count a rate. Sessions reach for the expensive kind by default — and a rate over a random
voyage genuinely cannot answer "is this drawn wrong", which is why entire nights ended with zero
net change. Every time the cheap look was used, it settled in minutes what the rate could not
settle in days. Your own eyes remain the best instrument this project has: the pulse toggle, the
bake-off pitch diagnosis, and the dock "are you sure?" were each worth more than days of probes.

---

## 4. What the record shows going RIGHT

An honest post-mortem must say this: the last four days of the record are visibly better than the
first four, and some things now work reliably.

- **The fresh-context CEO review works.** In 36 reviews it found something real and checkable
  almost every time, from "your very first output is a lie" (Review 1) to the flee nobody had
  watched (Review 34). Its verdicts reach Wyatt verbatim, its findings are acted on the same hour,
  and its own errors get corrected without editing the record. It is the single most effective
  mechanism in the project.
- **Candour is now the norm.** Withdrawals are volunteered before anyone asks (`ac9adf18`,
  `857e8859`, `9a52beee`, `21d9fd11`, `6d1325a7`, `330e6a34`…), wrong predictions are reported as
  wrong, and CEO 36 explicitly certified the honesty while faulting the discipline.
- **The four steps, when actually run in order, catch regressions before Wyatt sees them** — the
  sea trial killed build .3 for the End-of-Voyage vanish; the screenshot caught the layout
  collapse; both fixed pre-staging (ledger 2026-08-28).
- **The prediction habit and in-run controls repeatedly turned would-be false reports into
  findings** — the W9 false green, the WebKit "8 snaps" that an idle control exposed as container
  contention (ledger 2026-08-29T16:10), the tester discarding its own camera-contaminated figure.
- **Convergence sticks.** Everything made singular has stayed fixed; the parity gates on converged
  paths have not needed re-teaching.
- **Two sessions now share one branch safely** — claim-then-edit plus rebase has produced zero
  game-code collisions since rule 16, including through a real security incident that the second
  session caught and closed itself.
- **Diagnosis quality is high when the method is followed**: W3-1 traced to one line, W1-4's real
  cause (the screen edge, not occlusion) recovered from a false headline, the storm stall measured
  to the millisecond with the network exonerated at 47ms.
- **And Wyatt's own loop is the proven engine of the project**: his playtests, screenshots,
  toggles and corrections found more real defects per minute than any instrument built — which is
  an argument for optimizing everything around getting builds in front of him faster, with less
  noise in between.

---

*Compiled 2026-08-30. Sources are cited inline; every commit hash and file/section reference was
read, not recalled. This file is a synthesis and takes no action; nothing in the game or the
process was changed by writing it.*
