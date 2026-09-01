# The Bosun / Quartermaster / Watchdog system — 48 hours, written for whoever redesigns it

**Written 2026-09-01 by the Bosun session that ran 2026-08-31 21:00Z → 2026-09-01 11:45Z**, at
Wyatt's instruction: *"write down every major failing, success, and learning in your processes from
the last 48 hours… so that a new fresh session can redesign it."*

**This is a brief, not a defence.** Where a failure is mine I have said so and named it. Where I am
reporting another session's finding I have said whose it was. Where something is unmeasured I have
said that too — several claims in this project's record turned out to be confident and wrong in the
last 48 hours, including some of mine, and the redesign should not inherit them.

**Canonical copy: this file.** Published as a readable page for Wyatt at
https://claude.ai/code/artifact/b9a6a1f8-cd4d-4525-be4a-b68800dbc374 — that page is a snapshot;
this file is the source a fresh session should read.


> ## ⚠ UPDATE, 2026-09-01, WITHIN THE HOUR: THE SAIL SQUARE IS FIXED.
>
> While this brief was being written, another session shipped it — `76c49bcc`,
> *"fix(camera): the guest's sail squares are framed, and framed ON SCREEN — his ruling, built"*,
> closed against a posed pair and a tap proof (`52abc448`).
>
> **So "seven instruments, zero fixes" was true when written and is now superseded.** It is left
> in the text below rather than edited away, because what broke the four-day deadlock is the
> brief's own learning #6 arriving in practice: the thing that finally moved it was **implementing
> Wyatt's stated ruling** — zoom out until they all fit — **not an eighth instrument.** The
> Quartermaster refused to write one and said the scope question belonged to him; he answered it;
> a session built the answer. That sequence is the most useful thing in this document.
>
> A redesigner should read the count as evidence of a real pattern that a decision broke, not as
> the current state of the bug.

---

## 1. What the system is meant to be

Three roles, invented 2026-08-31, all operating on one repo and one branch.

| role | intent | how it actually runs |
|---|---|---|
| **Bosun** | the one WORKER. Enters through the Door, works the Chart, keeps the Glass current | a Claude session, usually long-lived |
| **Quartermaster** | independent auditor. Writes failing checks; does not write the fixes | a separate session, often in a cloud container |
| **Watchdog** | liveness backstop. Revives a dead tree | `watchdog.ps1` from Windows Task Scheduler, every 10 min |

Supporting parts: **the Chart** (`.planning/CHART.md`, the plan), **the Glass** (a published artifact
Wyatt reads and writes ideas on), **the ledger** (`.planning/CTO-LEDGER.md`, append-only), **the sea
trial** (the release gate), and **the CEO** (a fresh-context reviewer per item).

---

## 2. The numbers, because the narrative flatters everyone

- **17 sea-trial report files exist. 6 contain a verdict.** Roughly two thirds of all trials
  attempted never finished.
- **Build `2026.09.01.1` has never once completed a trial** — three attempts today (03:07Z, 10:04Z,
  11:21Z), all dead.
- **The watchdog launched 4 engines today** (06:16Z, 07:56Z, 09:36Z, 11:06Z). **All four fired while
  a session was actively working.** Every one gives the same reason: no commit for 45–55 minutes.
- **Seven instruments** now exist for the untappable sail square, built over four days. **Zero
  fixes.** (Counted by the Quartermaster, 11:30Z. Two of the seven are mine, from last night.)
- **The ledger has 247 entries under one tag alone**, and at least six distinct session-tags.
- **81 gates** in `npm test`, up from 71 two days ago.

---

## 3. What genuinely worked

1. **The Door → Chart → ledger → CEO loop produces an honest record.** Nearly every failure in this
   brief was found *because* somebody wrote down what they measured. The append-only ledger with
   corrections-in-the-open is the single strongest part of the system.
2. **The CEO reviews earn their cost.** Reviews 56–64 caught, among others: a helper claimed as
   wired-up that was dead code; a status fix that was "a habit, not a mechanism"; an unguarded
   `require()` that could disable all three Stop-hook brakes; a check that "was right by luck"; and
   a trial report claiming *"voyages that did NOT run: none"* while nine legs had died. **A reviewer
   with fresh context and no stake caught things four hours of my own attention did not.**
3. **The Quartermaster split (auditor writes the failing check, worker writes the fix)** worked
   exactly as intended once, on the chain audit: 19 checks written red, then driven green by a
   different hand. That is the strongest single process result of the 48 hours.
4. **Red-proofing every gate.** Repeatedly the difference between a real result and a comforting one.
   The containment probe's "0 outside" only meant something because shoving the board sideways made
   it report 20.
5. **Real fixes shipped.** The `pname()` crash (7 of 7 legs → 10 of 10 finishing); Safari made
   runnable on this machine for the first time; two hangs where a timeout could not fire; a Windows
   profile-lock; the Glass self-publish corruption root-caused after three failed attempts.

---

## 4. Failures — by role

### 4.1 The Watchdog

- **It cannot tell "working" from "idle", and it never could.** Its input is commits + an OS process
  match for `claude … -p /door`. A session that is genuinely working but not committing — a long
  browser run, an install, an investigation — is indistinguishable from a dead tree. **All four of
  today's launches were this false positive.**
- **The fix I shipped last night made this sharper, not softer.** Before, a fresh `LAST-ACTIVITY`
  (any tool call, including Wyatt typing) suppressed launches — Wyatt's reported bug. I replaced it
  with a commit clock. That correctly stopped his typing from masking a dead engine, and it created
  the opposite failure: **long honest work with no commits now summons a second engine.** I did not
  see that trade at the time and should have.
- **A watchdog-started session cannot hold a long job.** It is spawned to do work; its turn ends; a
  background sea trial dies with it. **Three trials died this way today.** Wyatt's ruling, 11:36Z:
  *"the watchdog cannot run a sea trial — only you can."*
- **`-p /door` is the only thing that counts as an engine.** Any other session shape is invisible to
  it, so the "never stack a second engine" guard does not protect against stacking on *me*.

### 4.2 The Bosun (me — these are my failures)

- **I did not notice I was not alone on the branch for hours.** Rule 16 says assume a second session.
  I quoted its `pull --rebase` half all night and never once checked the process table before
  running `pkill`. My browser cleanups were probably killing another session's trial.
- **I let the Glass go 203 minutes stale** during the most consequential stretch of work, then again
  for 182. Both times the brake caught it only when I next tried to *stop* — which is the gap it
  cannot close, because a session working continuously never ends a turn.
- **I answered a "fix the mechanism" ask with a promise to try harder.** CEO Review 56 named it:
  *"a habit, not a mechanism."* The habit lapsed within hours, exactly as predicted.
- **I built the 6th and 7th instruments for a bug nobody has fixed in four days**, while citing
  rule 26 as my justification. Rule 26 says pose the board so you can *settle* it. Rule 7 says
  tooling is a substitution for the ask unless the ask was tooling. **A guest on a phone still cannot
  tap that square.**
- **I pushed a red suite once**, by chaining `npm test` into the same command as the commit and push.
  Running the gate and *gating on* the gate are different things.
- **I asserted things I had not checked**: "the trial finished green" (its report says FAILED); the
  wrong legs named in a judge analysis, twice; "Safari plays the game" when it has never played a
  crew game here; "465-commit branch" all night when it is 539; "no timeout behind it" when the
  timeouts existed and the real fault was subtler.
- **Four boot attempts on a probe failed silently** because I guessed at the DOM instead of copying
  what the harness already knew. The fifth took a screenshot and found a modal open. I would have
  told anyone else to look first.

### 4.3 The trial machinery

- **Reports outlive their runs and keep their verdicts.** A hung 03:07Z process finished and
  overwrote a *later* run's report five hours late. Another still said IN PROGRESS with nothing
  running.
- **The NOT-RUN column lied.** `voyages that did NOT run | none` while nine legs never started —
  the one column rule 24 exists to protect. Cause: a leg is *resumed* whenever a record exists at the
  same build stamp, and the resumed record carries **the screens of the run that made it**, so a leg
  that failed to start was vouched for by its own ghost. Fixed at the mechanism (run-id provenance),
  but **this class — evidence without provenance — should be assumed to exist elsewhere.**
- **Two of tonight's three worst bugs were "a timeout that cannot fire"**: the vision judge, and the
  leg cap written as a loop condition rather than a race. Both look identical to healthy work from
  outside.
- **The resume cache is keyed only on build stamp**, so it silently replays stale results — including
  *failures* — unless the stamp is bumped. This cost one full run and nearly a second.

### 4.4 The Glass

- **Every self-publish was corrupt for days.** The page rebuilds its own document and must escape
  `<`; the escaper was authored inside a template literal, its backslashes were halved on the way
  out, and it replaced `<` with `<`. Three fixes before this one changed *when the page reloaded* and
  never looked at the bytes being saved.
- **Only some sessions can publish it.** At least three sessions have recorded "no Artifact tool in
  this session" — so the Bosun is a single point of failure for the one surface Wyatt reads.

---

## 5. Learnings a redesign should start from

1. **Liveness cannot be inferred from an artefact that a session controls.** Heartbeats, activity
   stamps and commit clocks have each been tried and each produced a confident wrong answer. The
   2026-08-31 timer-Monitor made HEARTBEAT beat regardless of work; the commit clock now summons
   engines onto working sessions. **Every proxy so far has failed in both directions.**
2. **A long job needs an owner that outlives it.** Background-launching a 90-minute trial from a
   session turn has failed three times in one day. Either the trial runs detached from any session,
   or the session that starts it must be structurally unable to end while it runs.
3. **"Two things kept in step by discipline will drift"** kept being proven: two escapers, two
   resolvers (one working, one not — and the gate certified the working one while Safari was dark),
   two Map-vs-object readers, two thresholds that deadlocked. **Every one was found the hard way.**
4. **A check must be red-proofed or it is decoration.** Several checks here passed against
   known-broken code: one because it tested the wrong copy, one because it grepped for a word that
   would survive an inverted comparison, one because `require()` resolves beside the *hook* and not
   the fixture.
5. **A comment is not a measurement, and this bit twice in 48 hours** — a comment saying the page
   settles before narration, and one asserting there is no Firebase SDK on a page that loads it on
   line 40.
6. **Measuring is this project's strength and its trap.** Seven instruments, zero fixes. The system
   rewards a well-measured non-fix and has no counter-pressure toward shipping the change.
7. **The brakes fire at turn boundaries, so a continuously-working session escapes all of them.**
   Publish lag, keep-working, stuck-item — every one is a Stop hook. This is a structural blind spot,
   not a tuning problem.
8. **Wyatt's own instruction outranks the loop, and the loop kept obscuring it.** The most valuable
   things in 48 hours came from his direct messages ("fix the glass!!!", "install rsync", "who is
   running the other sea trial??"). The autonomous machinery was often busy elsewhere.

---

## 6. What a redesign must decide (open questions, not recommendations)

1. **Who owns liveness?** If every proxy fails both ways, is the answer a heartbeat the *work* emits
   (not the session), an external observer, or accepting that Wyatt is the liveness check?
2. **How does a long job run?** Detached process? A queue? A session that cannot stop?
3. **Should the watchdog start sessions at all**, given it cannot see work and its children cannot
   hold long jobs — or should it only *alert*?
4. **How do multiple sessions coordinate?** Ledger claims are advisory and were repeatedly missed.
   There is no lock, and `pkill` is a loaded gun anyone may fire.
5. **What forces a fix rather than a measurement?** Seven instruments is the symptom; the cause is
   that nothing in the loop asks "is the game better than this morning?" with teeth.
6. **Who can publish the Glass?** A single-publisher rule plus a tool only some sessions have is a
   single point of failure on the one thing Wyatt reads.
7. **Is one branch with N sessions viable at all**, or does each session need a worktree?

---

## 7. The state the redesign inherits (2026-09-01 11:45Z)

- Branch `claude/cloud-handoff-planning-a9ay1u`, **539 commits ahead of `main`**, pushed, `npm test`
  green at 81 gates.
- **Build `2026.09.01.1` has no completed trial.** The last verdict is `2026.08.31.2`, assembled from
  four separate runs (10/10 legs finished, one real finding), and that assembly is itself what let
  the NOT-RUN lie through — treat it as evidence, not as a pass.
- **Nothing is deployed to staging.** rsync is now installed; the deploy is unblocked mechanically
  and was deliberately not run because the build moved and a trial was in flight.
- **~~Open and unfixed~~ FIXED 2026-09-01 by another session** (`76c49bcc`), to Wyatt's own ruling,
  verified on a posed pair with a tap proof. The probe
  (`scripts/qa/sail_containment_probe.mjs --mode=crew`) remains as the repeatable check.
- The 24-hour exit test was armed 2026-08-31 16:19Z; the cutover items remain GATED on its verdict.
