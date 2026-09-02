# Wyatt's standing decisions

## THE KEEP-WORKING HOOK FIRES ONLY IN THE BOSUN — 2026-08-31, RESTATED 2026-09-01 BECAUSE IT WAS LOST

> **SUPERSESSION PENDING (2026-09-01, the relay redesign, ruling 5):** when the relay lands, the
> keep-working hook is deleted entirely and this ruling becomes moot — no hook, no scope. Until
> that lands, this ruling stands exactly as written.

Wyatt, 2026-08-31: *"I want ONLY the bosun session to have this hook -- is that possible? all other
sessions are normal."* And again 2026-09-01, having found it undone: *"yesterday i told both you and
bosun that the keep working hook should ONLY apply to the bosun. why did this decision get
overwritten/lost?"*

**The ruling: the never-stop loop belongs to the watchdog-started engine and nowhere else.** Wyatt's
own terminal, a cloud session, and any other session are ordinary sessions that may end a turn
whenever they are done. The mechanism is the environment stamp — `watchdog.ps1` sets
`PP_BOSUN=1` before launching, and the hook exits on its first line without it.

### HOW IT WAS LOST, WRITTEN DOWN BECAUSE THE MECHANISM MATTERS MORE THAN THE INSTANCE

**It was never recorded here.** It lived in one session's context and in a comment inside the hook.
On 2026-09-01 that session wrote a chain audit recommending the gate move from *who launched this*
to *is this session working* — reasoning from his symptom report (*"when I intervene with bosun, it
stops him from being in a loop"*) without checking it against a ruling nobody had filed. He approved
five fixes as a batch; fix 2 was the repeal, and nothing in the record flagged the contradiction.

**CLAUDE.md §5 already names this exact failure:** *"A ruling he made that nobody harvested is the
failure this system exists to stop."* The rule existed. The harvest did not happen.

**AND THE SYMPTOM WAS MISREAD, WHICH IS THE OTHER HALF.** *"When I intervene with bosun, it stops him
from being in a loop"* means **the Bosun's loop breaks when Wyatt interrupts it** — so the fix belongs
on the resume path (the watchdog, or the Bosun picking the Chart back up after answering him), NOT on
the hook's scope. Putting the loop into every session solved a problem he did not report, and took
away the ability of any session to end a conversation.

**Standing consequence:** a change that narrows or widens which sessions the loop governs is a change
to this ruling and needs Wyatt, not an audit recommendation. Any session proposing one must cite this
entry first.

**What he has chosen, why, and when — so nobody asks him twice.** Newest at the top.

This is not the rulebook (`.claude/CLAUDE.md` — how to work with him) and not the work record
(`.planning/CTO-LEDGER.md` — what happened). **This is the list of things he decided**, and the
reason each one was decided that way. A decision nobody wrote down is a decision he has to make
again.

**Append here the moment he rules on something.** Date it, quote him where you can, and say what
the alternative was — the alternative is what makes it a decision rather than an instruction.

---

## 2026-09-02, 5:43 PM — A WATCH MAY EDIT HOOKS AND SKILLS

Wyatt, ruled on the Glass 5:43:55 PM ET: *"Let the watch write them -- I allow edits to hooks and
skills"*.

**The question he answered:** *"⟨T-105⟩ Your top-priority item is half built and the other half is
two files a watch is not allowed to touch — everything under .claude/ is refused for an unattended
session. Do you want to make those two edits yourself (about five minutes at the laptop), or let a
watch write them?"* **The alternative he did not pick:** making the two edits himself at the laptop.

**The ruling stands and is broad: an unattended watch may write hooks and skills.** It is not
limited to the two `T-105` files.

⚠ **AND THE QUESTION CONTAINED AN UNVERIFIED PREMISE, MEASURED FALSE THE SAME MINUTE — WHICH DOES
NOT WEAKEN THE RULING, BUT DOES CHANGE WHAT IT UNBLOCKS.** *"Everything under `.claude/` is refused
for an unattended session"* is **not true of this project's allowlist.**
`.claude/settings.json`'s `permissions.allow` carries bare **`Edit`** and **`Write`** — every file —
and its entire `deny` list is three entries, all of them `Read(.env*)`/`Read(.secrets)`. **Nothing
under `.claude/` is denied by this project.**

**So the refusal a watch actually hit is real but its CAUSE was never measured** — a watch recorded
it honestly (*"refused by this session's write permissions — recorded as a fact about this machine,
not as a guess about why"*) and a later question turned that into a stated cause. **The likeliest
remaining explanation is the harness's own behaviour for unattended sessions, which no project
setting can grant.**

**THE STANDING CONSEQUENCE:** his permission is now on the record and no allowlist change is needed
or was made. **If a watch is still refused, the blocker is not this ruling and not this repo** — the
next watch to hit it must report the refusal's exact words rather than infer a cause, and nobody
should tell him the work is unblocked until an edit has actually landed. This is the fourth time on
this branch that a permission he granted and a mechanism that enforces it turned out to be different
things.

---

## 2026-09-02, 3:33 PM — YOUR CALL CARRIES ONLY WHAT IS GENUINELY HIS, AND HIS TAP QUEUES A CLOSE RATHER THAN PERFORMING ONE

Two rulings, question UI, on his own idea (`INBOX-20260902T193000Z`): *"do you want to put those in
the Your Call section so I can approve/deny them being closed?"*

**RULING 1 — "Only what's genuinely yours."** The Your Call card gets **only** the rows where his
say-so IS the answer — today one or two, e.g. *"merge the 465-commit branch to main"*. The
**stale-evidence** rows (6 of 10) go to a watch to RE-MEASURE on the current build. The
**already-ruled** rows (3 of 10) close automatically, because he answered them at 12:39 PM.
**The alternatives he did not pick:** send him all ten and let him judge each (simplest, no matcher
fix needed — and it hands him our homework and re-asks what he settled hours earlier); or send him
the say-so rows plus the already-ruled ones so he can confirm they landed.

**RULING 2 — "Your tap queues it, a watch closes it." HE CHOSE AGAINST THE MARKED RECOMMENDATION,
AND THAT IS THE POINT OF RECORDING IT.** His approval MARKS a row; the next watch runs it through
the normal gate — a fresh reviewer's verdict plus evidence — before it leaves his list.
**The recommendation he rejected** was that his tap close the row outright, on the reasoning that
nobody outranks him on *"is this finished from my side"*. **He chose the stronger record over the
faster page.**

⚠ **THE COST OF RULING 2, STATED ONCE AND NOT RE-ARGUED, BECAUSE A FUTURE SESSION WILL BE TEMPTED TO
"FIX" IT:** an approved row **stays on his page until a watch runs**, which is the delay he has been
frustrated by all day. He was shown that trade and took it anyway. **Do not quietly upgrade his tap
to an immediate close because a session judges the wait too long** — that is his decision to revisit,
not ours. If the wait bites him, the option he passed over (close now, a watch audits after) is on
the record and he can call for it.

**And the reason the split exists at all:** the sweep's one label — *"looks already finished"* — was
covering three unrelated conditions, and every reader of his page drew the wrong conclusion from it,
the Advisor included, to his face. See `INBOX-20260902T193000Z`.

---

## 2026-09-02, 3:04 PM — WRITE EVERY TIME HE READS IN HIS LOCAL TIME, NEVER UTC

Wyatt: *"always write to me in my local time -- your UTC is confusing"*.

**The decision:** every time in anything he reads is his LOCAL time, on a 12-hour clock with am/pm.
**The alternative he did not pick:** UTC everywhere with a local time in brackets — he asked for
local, not for both, and a doubled timestamp is the same arithmetic wearing a bracket.

**WHERE IT APPLIES: everything written FOR HIM** — replies, question-UI forms, the Glass, status
reports, checkpoints, anything published. **Where it does NOT: the record.** Commit messages,
`CTO-LEDGER.md`, `CEO-REVIEWS.md`, `LAST-PUBLISH`, `LAST-HARVEST`, run ids and report stamps stay
UTC: they are written for the next session, sessions run on machines in different zones, and a
ledger in mixed local times cannot be ordered. **It is rule 3's boundary applied to numbers —
plain for him, precise for the record.**

⚠ **READ THE OFFSET, NEVER REMEMBER IT.** Measured 2026-09-02: this machine is **EDT, UTC−4**
(`date +%z` → `-0400`; 3:05 PM local = 19:05Z). **But EST is UTC−5 from early November**, so a
session that hardcodes −4 is an hour wrong for a third of the year — **and an hour-wrong timestamp
is worse than a UTC one, because it looks right.** One `date +%z` on the machine answers it. He also
works from a Mac; read the clock of the machine you are on, and if you are in a container, say so
rather than guessing his.

**Why he asked:** every time given to him on 2026-09-02 — the 1:06 PM ruling, the 2:36–2:42 PM
window, the 2:51 PM tick — was handed over in UTC, so he had to convert before he could tell whether
something had just happened or happened an hour ago. **A timestamp he has to convert is a fact he
cannot use at a glance.** Filed as `INBOX-20260902T1904Z`.

---

## 2026-09-02T17:06Z — KEEP THE FLASHING SELF-TEST IN `npm test`

Wyatt, ruled on the Glass 17:06Z and restated to the Advisor at 17:38Z in his own words:
*"I apprroved \"keep it\""*.

**The decision:** `detached_trial_windowless_check.mjs` proves itself by opening a real console
window for about a second on every `npm test`, and that flash stays. **The alternatives he did not
pick:** (b) run the flashing half only inside the sea trial — quieter, but a laptop that never sails
never checks; (c) drop the self-test, which makes the check unfalsifiable.

⚠ **THIS RULING WAS PUT TO HIM TWICE, AND THE SECOND ASK IS WHY THIS ENTRY EXISTS.** He answered at
17:06Z. It was harvested into `CHART.md` at 17:21Z (`778c6f92`) and the question row in
`## BLOCKED ON WYATT` was never deleted, so his page kept asking. The Advisor then read that row and
put it to him *again* at 17:33Z — having read, twelve minutes earlier, a handoff that names this
exact question as already answered. His reply: *"what, PLEASE CLAUDE, IS GOING ON… I AM SO
FRUSTRATED AT REPEATING MYSELF"* (`INBOX-20260902T1738Z`).

**The standing consequence, and it is the reusable half:** a ruling is not harvested until the
QUESTION IS GONE from every surface that asks it. Copying his answer into a second table while
leaving the first one standing is not a harvest — it is a duplicate. `T-090`.

---

## 2026-09-01 — THE RELAY REDESIGN: sixteen answers in one sitting

**Context.** After the Bosun/Quartermaster/Watchdog degradation — his words: *"all three of those
have bugs and seem to be breaking"* — Wyatt asked for 10–20 questions and then a redesign. All
sixteen answers came through the question UI on 2026-09-01, informed by the two post-mortems
(`.planning/HANDOFF-2026-09-01-WYCLAU-DEBUG.md`, `.planning/wyclau/REDESIGN-BRIEF.md`). Each ruling
below names the alternative he did NOT pick, because the alternative is what makes it a decision.

1. **First priority: autonomy that SHIPS FIXES.** Unattended hours must turn into shipped game
   improvements, not instruments. *(Over: instructions-first, Glass trust, phantom sessions — all
   still get fixed, but this is the one the design optimizes for.)*
2. **What "degraded" meant, verbatim:** *"The system we designed, where everything is shown to a
   CEO, and every turn from the quartermaster ends with it teaching me something, was lost. the
   quartermaster sometimes forgot my instructions; the bosun repeated the same mistakes."* The
   CEO-per-item and daily-teaching guarantees are the things he misses, not optional extras.
3. **Radically simplify.** *(Over: repair the three-role design in place, or pause autonomy.)*
4. **The 24/7 engine stands, as chartered.** *(Over: autonomous-only-when-away, or none.)*
5. **The engine is a RELAY OF FRESH RUNS** — one item per run through the full loop (fix → measure
   → CEO → record → Glass), then the run ENDS; the scheduler starts the next minutes later,
   forever. *(Over: a better-guarded long-lived session, or a hybrid.)* **Consequence he accepted:
   ~2 minutes of re-orientation per run. Consequence for the record: the keep-working Stop hook is
   DELETED when the relay lands** — the hook-scope ruling at the top of this file becomes moot at
   that moment (no hook, no scope); until the relay lands it stands unchanged.
6. **Instructions go to ONE TRACKED INBOX.** His words land verbatim in a queue file; the next
   engine run must read it FIRST and work his items before anything else. *(Over: talking to the
   engine session directly — the arrangement that just failed.)*
7. **THE TEETH** (multi-pick, one his own write-in):
   - **His stated solution is tried FIRST**, implemented and measured before any investigation or
     tooling; disagreement is allowed only after showing him the result of his version.
   - **Every run ends in a game-code diff or a one-line reason** led at the top of its report, and
     the reason is CEO-reviewed like work — "built a tool" stops counting as a day's work.
   - **His write-in, verbatim:** *"If a tool doesn't work, the next strategy must be to take a
     screenshot/verify the way I would — by looking at and measuring the actual game."* Never a
     second tool after a failed tool.
   - *(Offered and NOT chosen: a hard one-instrument-per-bug cap — he replaced it with the
     look-like-I-would rule.)*
8. **The Quartermaster is DISSOLVED: his window IS the advisor.** Whatever session he opens is a
   fresh advisor — reads the record, answers strategy, teaches as it goes, writes his instructions
   to the inbox in the same turn. Auditing belongs to fresh-context CEO agents per item. *(Over: a
   standing QM restarted daily, or folding advice into reports.)*
9. **What broke Glass trust: STALE, BROKEN, and WRONG.** He did NOT pick "my writes went nowhere"
   — harvest lag was not his complaint.
10. **The Glass: REBUILD THE FULL INTERACTIVE VISION.** *(Over the recommended boring status
    board.)* **Decisions happen ON THE GLASS, tap to rule** *(over batched question-UI rounds)*,
    and **the daily lesson lands ON THE GLASS** *(over the daily report)*. The Glass is confirmed
    as THE interface; its reliability is the redesign's hardest engineering, treated as such.
11. **The sail square is fixed NOW, in parallel** with the redesign — a separate session implements
    his stated camera-zoom solution with a posed before/after pair. *(Over: redesign first, or
    square first.)*
12. **The release push is the new engine's FIRST JOB** — the 539-commit branch through a trial that
    survives session death → staging → his play → merge, as the shakedown cargo. *(Over: babysit a
    trial by hand today, or wait until the system settles.)*
13. **Redesign timebox: TWO DAYS, HARD FENCE.** Day 1 the relay + inbox + truthful minimal Glass;
    day 2 the interactive Glass rebuild. Anything unfinished is cut to ordinary Chart items.
    *(Over: one day, or as-long-as-it-takes.)*
14. **Trust bar: a MEASURED 48-HOUR SHAKEDOWN** — zero phantom sessions, zero eaten conversations,
    Glass never older than one run and never wrong on spot-check, every closed item carrying a CEO
    verdict — numbers reported honestly, then HE judges. **This supersedes the 24-hour exit test as
    the rulebook-cutover gate** — the question named that consequence explicitly and he picked it.
    *(Over: a week of normal use, or "it ships the release" as the sole proof.)*

### Addendum, same day — the four rulings that started the build

1. **Day 1 is green-lit as designed** — the published design (artifact `8c855d0c`) is the plan of
   record, with CEO Review 65's two faults carried in as day-1 requirements (a close-out script
   enforces the CEO gate; the same script checks a run's first diff against his stated solution).
2. **He disables the old watchdog himself, now** — Task Scheduler on the Blade. *(Over: leaving it
   running through the rebuild.)*
3. **The Blade hour is TODAY** — the Bell install and the O2 publish test close day 1 on the Blade
   itself. *(Over: tomorrow, or at shakedown start.)*
4. **THE NAMES ARE HIS PICKS: the WATCH (the engine — a relay of fresh runs) and the BELL (the
   scheduler that rings a new watch when none is on deck).** "Bosun" retires with the role.
5. **THE TRADE FAN STAYS.** Ruled ON THE GLASS (tap-to-rule's first real use), 2026-09-01
   14:16:56Z, his note verbatim: *"Don't touch the trade fan, it's fine."* The trade-response
   menu keeps fanning around the chooser; the anchored-on-named-boats rule governs the battle
   call and the attack menu, and the difference is HIS chosen exception (rule 8's sanctioned-
   exception form). Do not re-open as a consistency patch. *(The alternative — anchoring trade
   answers on responders' boats — was recommended against and he agreed.)*
6. **HE IS "THE CAPTAIN", NEVER "CHAIRMAN".** His words, 2026-09-01: *"I feel weird when you call
   me Chairman, it reminds me of Chairman Mao. Can you call me Captain instead, without that
   getting confusing with our game terminology?"* The disambiguation that keeps it clean: inside
   the game world, lowercase "captains" are the players (game copy untouched); on system surfaces
   outside the game world — the Glass, reports, docs, the same boundary as the credits rule —
   capital-C **the Captain** is Wyatt. "The chairman's log" (charter term, 2026-08-30 org era) is
   renamed **the Captain's log** everywhere it appears. *(The alternative — keeping "chairman of
   the board" from the org design — is struck at his ask.)*
7. **The wider sail-prompt framing is APPROVED as-is** — staging checklist 2026-09-01, item 5
   ("YER CALL, not a defect: judge the wider camera itself") marked PASSED with items 1–4. The
   taste question the fix raised is settled; do not re-open it as a patch. Any future tune is a
   one-place change to the containment pass's derived margins, on his ask only.

---

## 2026-08-31 — THE THREE DOORS, and the two names that make them sayable

**Wyatt asked, verbatim:** *"i only ever will write to you, not to Blade Pirates ('Bosun') -- is
that right?"* **The answer is NO, and the reason is the decision.**

**Two names first, both his calls this evening:**

- **THE BOSUN** — the Claude worker on the Razer that the watchdog rouses and that works the
  Chart. *"The engine"* now means `src/engine/`, the game's seeded simulation, and nothing else.
  He weighed **the Deck** — a good instinct, since the Glass, the Chart, the Helm and the Door are
  all objects and Deck belongs to that set — and chose the person-noun because those four are
  surfaces HE acts on, while the worker is the system's only ACTOR, and every sentence the ledger
  needs is a verb of agency: stalled, was revived, claimed item 3. A deck does none of them.
- **THE QUARTERMASTER** — the advisory session (cloud): measures, reports position, asks him the
  decisions, keeps the log, relays. On a pirate ship the quartermaster is elected by the crew,
  keeps the record, and is the standing check on the captain — which is this project's CEO-and-
  ledger culture in one word. He weighed **Mentor** (his own first idea) and set it aside because
  a live `mentor` skill already coaches his framing, so "the Mentor" would have been ambiguous
  with a Mentor note; **Navigator** and **Pilot** were the other two offered.

**THE THREE DOORS — one place the work is RECORDED, not one place he types:**

| When he wants to… | He writes to | Why that one |
|---|---|---|
| **Rule on a question, or drop an idea** | **the Glass** | The durable channel. Rulings and ideas are both harvested to the Chart, and a hook blocks a session from republishing until it harvests — because he once ruled there and nobody picked it up for an hour. Survives every session dying. |
| **Redirect the work, now** | **the Bosun** | It is the worker, on the machine that can see the game. Shortest path from his intent to a change in what is built. |
| **Think something through, audit, ask "what is this?"** | **the Quartermaster** | Questions, second opinions, measurements against the record — the work that is not a Chart item. |

**THE RULE UNDER ALL THREE:** *anything that matters lands in the repo — the Glass, the Chart, the
ledger — never in a chat window.* Whichever door he uses, the ruling is written down or it did not
happen.

**AND THE ONE ARRANGEMENT TO AVOID, which is what he was proposing:** the Quartermaster must never
be the ONLY path to the Bosun. It runs in a cloud container; everything it holds that is not
committed dies when that container is reclaimed — which is exactly how Cloud: Edits lost its
first-person account earlier the same day. A relay also adds a translation step, and on 2026-08-31
that step handed him **two stale premises** (a PR that had already landed, an audio defect already
fixed at the cutover). His terminal window is the fallback that cannot be taken from him.

*The alternative — funnel everything through one advisory session — is tidier to think about and
strictly more fragile: one container reclaim and he is locked out of his own engine.*

---

## 2026-08-31 — ONE PLACE TO SEE AND DECIDE EVERYTHING (the Helm is retired)

**Wyatt, 2026-08-31, verbatim:** *"finish the Helm fold-in — the decision cards live inside Glass
v2, not linked beside it. My words: one place to go to see and decide everything."*

**Done.** The Glass (https://claude.ai/code/artifact/74034bde-ad7e-4861-913e-d5d190801af2) now
carries the decision cards itself — **derived from `.planning/CHART.md`'s BLOCKED ON WYATT table,
never hand-typed** — plus a "Your rulings, in hand" section derived from the Chart's RULED table.
The Helm URL now serves a retirement notice pointing at the Glass, with his five rulings
preserved on it. *The alternative — linking the two pages — is what we had, and it lost his
answers for an hour.*

**THE MECHANICAL RULE THAT COMES WITH IT, and it is his:** a self-publishing page must select its
own assets **by id, never by tag or position** — the artifact host injects its own reset
stylesheet first, and the Helm once rebuilt itself around that reset and lost its entire
stylesheet on the first tap. Full story: `docs/HARD-WON-LESSONS.md` §12k.

## 2026-08-31 — FIVE RULINGS HE MADE ON THE HELM AT 17:02–17:10Z, HARVESTED LATE

**He answered all of these on the page, and no session read them for over an hour.** Wyatt,
2026-08-31: *"i answered all of those questions already, multiple times, on the other version of
the helm."* The answers are his, recorded verbatim from the Helm's own state block:

| item | HIS RULING | when |
|---|---|---|
| **audio-defect** — the 8s full-volume storm per ship | **"Yes — delete the line"** | 17:02Z |
| **pass-and-play hand-over** — move it ahead of the turn? | **"Just move it"** — NOT "build both behind a switch"; he does not want the A/B, he wants the change | 17:08Z |
| **decider-scope** (one-director step 5) | **"Narrow half"** — the three drawing branches behind the Decider; leave the two questions as two | 17:09Z |
| **plan-doc** | **"Yes — make the measured table the plan of record"** — the tree wins over the document | 17:10Z |
| **cutover-moment** (the rulebook/memory/pruning swap) | **"After the exit test verdict"** — the 24-hour no-silent-stall test finishes first | 17:10Z |

**THE FAILURE THIS RECORDS IS OURS, AND IT IS THE ONE THE RECORD KEEPS NAMING: a question
answered somewhere nobody harvests is a question still open.** The Helm saved his taps
correctly; the Glass went on printing "Blocked on Wyatt (6)" while five of the six were ruled.
*The fix he asked for in the same breath: fold the Helm's clicking-and-commenting INTO the
Glass — one page, and the harvest hook already guards it.*

## 2026-08-31 — THE GLASS IS THE INTERFACE, SERVED AS AN ARTIFACT, HOMED IN CLAUDE-KIT

**Wyatt's vision, his words:** *"it becomes our interface. I can write ideas and feedback to you
directly there, i can see charts and reports about your progress, all in one graphical tool."*
His platform pick (recommended option, 2026-08-31): **the interface stays a private Claude
Artifact** — using the page's ability to save new versions of itself so his writes wake sessions —
**and all wyclau source code homes in the claude-kit repo now** as the kit's first module.
*Alternative rejected for the private interface: GitHub Pages from claude-kit — public by nature
and no write path without Issues/Firebase glue. Reconsider Pages at launch, as the game's PUBLIC
player-facing status page.* Glass v2 (the ideas/feedback box) is scheduled for after the Razer
hour, same day.

## 2026-08-31 — THE WYCLAU CHARTER IS IN FORCE

**Wyatt approved the charter verbatim:** *"Charter is approved with only one correction: I learn
fast, so I want learnings or lessons every day, not once per week."*

**Say "the charter" and any session must resolve it to
[`.planning/wyclau/CHARTER.md`](../../.planning/wyclau/CHARTER.md)** (canonical; the published copy
is https://claude.ai/code/artifact/5e6f19bf-654b-4d27-9563-597ef8f55d7b). Its seven principles and
seven parts govern how work runs; its interview rulings
([`.planning/wyclau/INTERVIEW-2026-08-30.md`](../../.planning/wyclau/INTERVIEW-2026-08-30.md))
answer questions before they are re-asked. **The amendment: one short lesson per DAY, tied to the
live work** — the alternative was weekly, and he struck it because he learns fast.

*The alternative to the charter was continuing the accreted process it replaces; his founding note
(`.planning/wyclau/WYATTS-NOTE-2026-08-30.md`) records why that was rejected.*

## 2026-08-30 — the organisation

**THE ONE-DIRECTOR PLAN — the handle for the engine rebuild.** Wyatt, 2026-08-31: *"where is that
plan saved, and how can i reference it again in a way that you'll know what i'm talking about?"*

**Say "the one-director plan" and any session must resolve it to:**
[`.planning/architecture-one-director.html`](../../.planning/architecture-one-director.html) —
published, tappable, at **https://claude.ai/code/artifact/715b29fe-fe33-4038-9e61-a20ef6676570**
(same URL on every republish; it is titled *"One engine, one director"*).

**It has ten sections (00-09) and its migration is SIX STEPS, in section 07.** Progress is measured
against those six and nothing else, so "how close are we" always has a denominator.

**ONE SHORT REPORT AT THE END OF A RUN — NOT A WALL PER STEP.** Wyatt, 2026-08-31: *"don't bog me
down with all of your wall of text. I don't want to read it. I want to read one short report at the
end of a long run of work that shows what worked, what you learned (and wrote somewhere durable),
and what you are now working on next."*

**Three parts, in that order: WHAT WORKED · WHAT I LEARNED, and where it is written down · WHAT IS
NEXT.** Corrections belong inside "what I learned", not as the headline and not as a running
commentary — he had just told me the running-correction stream made him lose faith while the branch
was in fact shipping.

**This tightens rule 3 rather than replacing it.** Plain English and the SIZE still stand; what
changes is CADENCE and SHAPE. Work quietly through a long run, surface only genuine questions and
real-time blockers as they arise, and report once at the end.

**NEW INFORMATION ONLY. A SECOND RECAP IS MUCH SHORTER THAN THE FIRST.** Wyatt, 2026-08-30, after
reading back through a run: *"you tend to verbosely repeat yourself multiple times when reporting
back to me. This isn't necessary. Please only state new information to me. And if you need to recap
something, recap it much shorter the second time."*

**This does not loosen rule 3 — it sharpens it.** Plain English with the size stated is still the
bar; saying the same thing three ways is not thoroughness, it is a reply he has to search for the
new part of. **The one thing worth repeating is a correction of something already reported wrong.**

**A TURN MAY NOT END ON AN OFFER.** Wyatt, 2026-08-30, after catching a stalled run himself:
*"don't end on offers -- keep going."* The session had closed with *"Starting the checker now unless
you want the tester first"*, spawned nothing, and sat idle until the container was reclaimed.

**He asked for it structurally, not as a rule** — *"change the /team code structurally to ensure
this does not happen again"* — so it is a Stop hook (`.claude/org/hooks/no-idle-offer.cjs`) that
blocks a turn whose closing sentences offer to do work, plus a `/team` change that moves the
sequence off the bridge and onto the leads. *The alternative, which is what this project has done
every previous time, was another paragraph in a file. Its record is poor: every rule in CLAUDE.md
is there because a written rule was not enough on its own.*

**The line that lets the rule be absolute:** a genuine question goes through the question UI, which
does not stop the run. So an offer written as prose at the end of a turn is the wrong shape whether
or not work was outstanding — and the hook does not have to guess which.

**Not added as a 28th CLAUDE.md rule, and that is a judgement worth overruling if he disagrees.**
CLAUDE.md says in its own words that a list which reads longer than it is dilutes every line in it,
and the hook fires on every turn in every session rather than only inside a `/team` run — so the
coverage is already complete without a new row.

**The org is CEO, CTO, EA, and a crew.** He is the **chairman of the board** *(title struck 2026-09-01 — he is the CAPTAIN now; see the relay redesign addendum ruling 5)*. The **CEO** manages
long-running work and holds the CTO accountable — judging whether something got built is one part of
that, not the whole job. The **CTO** is the marathon worker that runs development. The **EA**
(*executive assistant*, renamed from "shift worker" on this date) keeps the long-running worker
honest. The **crew** does the engineering.

**The CTO delegates; it does not do the engineering itself.** *"Just like a CTO doesn't do the
engineering work themselves in the real world."* Six narrow role cards, and every task runs
**measure → build → check → see → sweep**.

**Durable memory, disposable instance.** He asked for a long-running CEO that accumulates memory;
the counter-proposal was that memory lives in files and each instance is fresh, because an agent
that inherits the CTO's reasoning inherits its blind spot. **He took the counter-proposal.**

**One plugin, not two.** Officers and crew merge — the split was historical, not designed, and it
was why he had to ask what the difference was.

**Vendor everywhere, gated in `npm test`.** The alternative — plugin on the laptop, copy in the
cloud — is two copies kept in step by hand, the exact fault removed from the game engine the same
day. One copy per repo, and the build fails if someone edits it.

**This repo keeps its own production fence**; the portable one is not shipped here. Declared with a
`fence:` key in `OFFICERS.md` so it is a mechanism rather than a memory.

**A question NEVER blocks a run.** *"whenever it has a question for me or a problem for me... it
should ask me or flag that for me in real time, but then it should continue with its work with any
other work that it can while it's waiting."* This replaced both options offered — stop after three
failures, or park silently. **His reasoning killed the objection outright: "I would be sleeping, so
this seems like a moot point."**

**The CEO may re-order and de-scope, never add** — **but bugs it notices go on a list he approves in
the morning.** His own improvement on a binary that was put to him badly: discovery gets captured
without silently becoming work he did not ask for.

**Never stop overnight — park the bad item and move on**, over the recommended three-strikes halt.
The risk he accepted: a run can spend the night on the easy half of a list. The mitigation that fits
inside the ruling: **a parked item leads the morning report, ahead of what was finished.**

**Memory scope: shared lenses, per-project memory, one thin cross-project file** carrying only how
he likes to work.

**A daily brief at 8am**, pushed to him rather than waiting to be asked.

**Cost is not a constraint.** He has Claude Max and is not near his usage. **The reason to run fewer
builders is file collision, which is a different argument and still holds.**

## 2026-08-30 — the game

**Solo and pass-and-play are IN SCOPE for the one-engine work.** He struck a fence that had put them
outside it: *"otherwise everything starts to fork and fall out of sync again."*

**Mode differences are legitimate in exactly three places** — how an answer is obtained (the
Decider), how the script is played (rate, never content), and the shell around the stage. Everything
else that differs by mode is a fork.

**End the voyage early when nobody else can finish** — the engine asks each day who could still
reach Tortuga with a full hold, and captains grey out as they fall out of the running. Chosen over
ending silently and over capping the tail. *Reason: it turns dead time into a scoreboard.*

**End of Voyage: freeze the card, scroll only the award list inside it, and add a button at the top
that shrinks the whole card so the board is visible.** The current version fails because two things
move at once.

**Multiple bakers: honour every captain who baked**, name their recipes, and say why the winner won.
His wording, to be used as written.

**Never touch bubble placement without a posed comparison** — same seeded prompt, before and after,
two screenshots. *Cost of learning it: a whole night, three probe runs and three 85-minute trials
that settled nothing.* Now rule 26.

**Any HTML handed to him is a published, tappable link — never a repo path.** Now rule 27.

---

## Older rulings not yet migrated here

**They exist and they are binding.** They live in `.planning/CTO-QUESTIONS.md` (answered questions,
including a block he answered from his phone on 2026-08-29) and in `.planning/BACKLOG.md`'s rows.
**Migrate a ruling into this file the next time you touch the item it governs** — a big-bang
migration would be a day of copying with nothing verified, and copies made in bulk are the ones that
turn out wrong.
## NO RIPPLE RING IN THE OVENS — Wyatt, 2026-08-31

**His words: "no ripple ring in the ovens."**

The active-turn ripple must NOT move to the captain who has stepped up to bake. It stays with
whoever last took the wheel — i.e. the walk that drives it counts only `turn` events
(`TURN_ONLY` in `src/shared/storyboard.js`), never `ovens` or `bake`.

This closes the open design call recorded at `src/shared/storyboard.js:39` and
`src/ui/board.js:1768`. **It is not a patch to guess at again** — any future "should the ring
follow X?" for the bake is already answered.

**CONSEQUENCE, found while recording this:** the ring is drawn from TWO places that currently
disagree. `board.js:1532` (`activeTurnSeat`, used by the live-ships path) passes `TURN_ONLY` and
already obeys the ruling. `board.js:1776` (render's own) passes the DEFAULT, which includes
`ovens` and `bake`, so on that path the ring does follow the captain to the ovens. Read from the
code, not yet measured on screen. Under this ruling the second one is wrong and must pass
`TURN_ONLY` too — and under rule 23 the deeper fault is that one visual had two answers at all.

## ONE ANSWER TO "WHOSE TURN IS IT" — Wyatt, 2026-08-31 (SUPERSEDES the ruling above)

**His words: "rings follow active player the whole game with no exception including during bakeoff.
Consistency is a design value."**

**This replaces "no ripple ring in the ovens", made earlier the same day.** He reversed it after
being shown that his two rulings had split three surfaces — the ripple ring, the captains-box
highlight and the pass-and-play row order — between two different answers.

**What it settles, permanently:** there is ONE rule for whose turn it is, `TURN_ESTABLISHING`
(`turn`, `ovens`, `bake`), and every surface reads it. During a bake the captain at the ovens is
the active player, so the ring is on their boat, the box lights their row, and the row order floats
them to the top. It also settles T-09 (2026-08-26) in the same breath.

**And the vocabulary for the divergence is DELETED, not deprecated.** `TURN_ONLY` is gone and so is
the `establishing` option — with one rule there is nothing to pass, so no future caller can express
the split. That is the strongest form of rule 23 available: not two things kept in step, one thing.

**Do not reopen this as a patch.** Any future "should X follow the baker?" is already answered: yes,
like everything else.

## MERGE 465 COMMITS TO MAIN, VIA THE NORMAL RELEASE LOOP — Wyatt, 2026-08-31 23:39:57Z

**Ruled on the Glass, "Do it".** In response to the discovery that `claude/cloud-handoff-planning-
a9ay1u` sat 465 commits ahead of `main` with nothing merged since 2026-08-26 — five days of real
work, including the entire Bosun/Glass/Stop-hook system, never reaching real players.

**What this authorizes, exactly as recommended:** sea-trial the branch at FULL gear (confirmed by
`gear.mjs` — real engine/UI files diverged, not just docs), deploy the result to staging for him to
play, then merge to `main` on his say-so once he has played it. **Not a blanket pre-approval to
merge without his final look** — the ruling is on the PROCESS ("do it" = run the normal release
loop), his approval of the actual merge still comes after he plays staging, per CLAUDE.md §6's
standing release process.

**Do not re-ask whether the branch should be trialed and staged — that part is settled.**

## A QUESTION MARK IS NOT AUTHORISATION — 2026-09-02

**His ruling (question UI):** when he asks something that implies work, the answer is *"Answer, and
triage it as a Chart row"* — give the answer, the recommendation and the size, **then write the
Chart row so a watch can take it.** Nothing gets built until he says build it.

**Earned the same night.** He asked *"Do you need to create those rules as 3 gates for this advisor
session to make sure they are ALWAYS followed?"* — a question. The session built three hooks and
told him they worked. CEO 83: *"He did not authorise this session to build them. You answered his
question by doing the work — which is the exact behaviour the first two sentences he said were
correcting."* Two of the three did not work as described.

**And on his own broken machinery:** disarm rather than leave it running. A gate that gives false
assurance is worse than no gate — the Advisor unregisters it and files the repair for a watch.

## THE ADVISOR IS RECORD-ONLY — 2026-09-02

**His instruction:** *"you must never make changes yourself -- tell the watch to make the changes"*
**His ruling on where the line falls (question UI):** *"Record-only: I may write the record, nothing else."*

**MAY WRITE — this IS how a watch is told anything:**
`.planning/wyclau/INBOX.md` · `.planning/CHART.md` · `.claude/memory/DECISIONS.md` ·
`.planning/CEO-REVIEWS.md` · `.planning/CTO-LEDGER.md` · `.planning/wyclau/GLASS-NOTE.md` · handoffs.

**MUST NEVER TOUCH:** game code, scripts, hooks, `settings.json`, gates, `claude-kit` — anything
that is not the record. **Not to fix, not to improve, not to answer a question, not "while I'm
here".**

**WHY THE LINE IS DRAWN AT FILES RATHER THAN "DO NOTHING":** a watch cannot be messaged. Measured
2026-09-02 — a `claude -p` watch has `ListAgents` but **no `SendMessage`**, no `Task`, and no
`Artifact`. Its only inbound channel is a file it reads at orientation. **So writing the record is
not an exception to "tell the watch"; it is the only mechanism that exists for it.**

**Earned across one night, three times.** The Advisor did watch work all evening while his words
went unfiled; then answered his question *"do you need to create those rules as 3 gates?"* by
building three hooks, two of which did not work as described (CEO 83); then destroyed the note
carrying the finished screenshot-judging results by running `glass.mjs --note` merely to inspect
the page. **Every one of those started as a small, reasonable-looking change.**

See also [[a-question-mark-is-not-authorisation]].

## THE KIT IS A FRAMEWORK, NOT A DEPENDENCY — 2026-09-02, seven rulings in two question rounds

**His framing, verbatim, which reversed the whole design:** *"claude-kit is intended to be a repo
where the DESIGN of our system is made. we keep it updated as we build the system so that it can be
useful in OTHER projects. but our system must operate LOCALLY in its OWN REPO... at the beginning of
a project, claude-kit is added to it. then all of the instructions and processes in claude-kit start
running within the project's repo. the ONLY reason we're still touching claude-kit is because we're
building the plane as we're flying it."*

**And the metaphor he chose for the flow — this project's own release process, pointed at its
tooling:** *"the kit is 'production' and the local version of it is 'staging'... i don't want to be
the human cherrypicking; i want the design of the kit itself to be architecturally extensible to
many different projects, like a framework, and to be updated as we change it locally to serve an
individual project."*

| # | question | HIS RULING |
|---|---|---|
| 1 | `vendor_check.mjs` fails the build on any local edit — the kit is authoritative at runtime | **INVERT IT.** The project copy is the truth; the check warns that the KIT is behind. |
| 2 | May a watch read claude-kit at runtime? | **NEVER — and that is the test.** A watch needing the kit means the file is in the wrong repo. The fence stays closed and becomes a design check rather than an obstacle. |
| 3 | When does a project change reach the kit? | **A periodic batched pass**, never per-commit. Generalising benefits from seeing several changes at once and must never block shipping. |
| 4 | Does the kit hold the literal file or a generalised one? | **GENERALISED.** A copy is not portable just because it sits in a portable repo. |
| 5 | What does a new project receive at adoption? | **A copy it owns outright** — no lock file, no hashes. **Plus his amendment: it must also have a way to update to the latest kit as it becomes available.** |
| 6 | Should improvements flow kit → project? | **NOT by human cherry-pick** — he rejected that outright. Architectural, staging→production. |
| 7 | `.claude/skills/door/SKILL.md` — the Watch's own procedure | **THE PROJECT OWNS ITS DOOR.** This is what unblocks the Chartkeeper's RANK, asked for four times. |

**RULED SEPARATELY, SAME ROUND:** the fate lexicon becomes **three states** — OPEN shows, SCHEDULED
shows and says so, PARKED shows dimmed with its reason, and only genuinely-finished words hide.
Measured trigger: **13 of his 15 ideas were hidden from the Glass, 9 of them by `SCHEDULED`**, while
`CHARTER.md` names scheduled and parked as *visible* fates.

**⏸ DELIBERATELY NOT RULED — he stopped the round:** how the back-port debt stays visible. His words:
*"i don't like any of your options. i'll give you more context below -- wait for it before
continuing."* **Nothing on this is to be designed or built until that context arrives.**

> ### ⚠ THIS ENTRY WAS WRITTEN THREE TIMES BECAUSE THE FIRST TWO WERE SILENTLY RECLAIMED
>
> Three sessions share ONE working tree (the Advisor, the Glass-update session, a Chartkeeper
> Watch). An uncommitted edit to a shared file does not survive another session's checkout-moving
> git command — no error, no conflict, no trace.
>
> **AND THE RULE WRITTEN AFTER THE FIRST LOSS WAS NOT ENOUGH.** That rule was *"write and commit in
> the SAME step."* This entry WAS written and committed in one chained command — **and the
> CEO-cadence hook blocked the commit, which re-opened the window and the edit was gone by the
> retry.** *A hook that blocks a commit leaves the edit exposed, so the safe form is: compose
> outside the repo, then land it in a single write-and-commit.*
>
> **Rule 16 anticipated two sessions on one BRANCH. It did not anticipate three in one WORKING TREE.**

## THE VISION FOR CLAUDE-KIT — 2026-09-02. Read this before designing anything about the kit.

**This is the context that was missing from every kit discussion before it, and it reverses at least
one recommendation that had already been given. His words:**

> *"we're building this kit so that I can share the kit itself with Anthropic. as a pitch about a
> different way that normal consumers of Claude code can work with Claude. I wanna tell them the
> story about pastry pirates and how I wanted to design this game that got more and more complex
> until none of the normal Claude tooling worked for me and my purposes anymore. So I needed to
> build a completely new framework for how to interact with Claude. And that framework is extensible
> for anyone's project. Anyone who has huge ideas that they want to run autonomously in the
> background from a backlog. They can… just install my Claude kit in their repo, and it will do
> things like interview them about their vision and turn that vision into a concrete mission
> collaboratively with them and break that mission into steps, and it will give them their own
> [Glass] page that they can use to write to their own… the watch, which they will be running on
> their own machine. to execute their own giant vision.*
>
> *And I want to build all of this by using it to make pastry pirates, but I also want the thing
> that we make in pastry pirates to not be designed with a bunch of shitty small patches that apply
> just to pastry pirates. I want it to be a framework… ideally, as we make modifications to our
> process with pastry pirates, there's also a routine within our little pastry pirates build that
> allows us to extensively add those changes to Claude kit itself.*
>
> *But that's not because Claude kit should always be allowed to be modified. Like, if some random
> person on the outside of the world installs Claude, we don't want them to be able to modify Claude
> kit. **It's not an open source project.** It's something that I want to be able to use, design, and
> tweak to make better before I ship it to the rest of the world and share it with Anthropic."*

### WHAT THIS ESTABLISHES, AND IT IS LOAD-BEARING FOR EVERY KIT DECISION

1. **claude-kit is a PRODUCT AND A PITCH, not internal tooling.** Its audience is Anthropic and then
   the world. Pastry Pirates is the development environment and the origin story, not the customer.
2. **The story IS part of the product.** *"none of the normal Claude tooling worked for me anymore"*
   — the war stories, the corrections kept in the open, the rules that record what they cost, are
   the pitch's evidence rather than overhead.
3. **THE PRODUCT'S ENTRY POINT DOES NOT EXIST YET.** He named it: **interview the user about their
   vision → turn it into a concrete mission collaboratively → break the mission into steps → give
   them their own Glass → give them their own Watch on their own machine.** Nothing in claude-kit
   does the first three today.
4. **TWO ROLES, AND THEY ARE NOT SYMMETRIC — this is the part every earlier design missed:**

   | | **AUTHOR** (him, in pastrypirates and any repo he stress-tests in) | **CONSUMER** (anyone who installs it) |
   |---|---|---|
   | reads the kit | yes | yes |
   | runs it locally in their own repo | yes | yes |
   | **changes flow back UP to the kit** | **YES — that is the whole method** | **NO. Explicitly not.** |

   *"It's not an open source project."* **A consumer installs, uses and updates. Only the author
   promotes.**

### THE CORRECTION THIS FORCES TO ADVICE ALREADY GIVEN

**The Advisor recommended "build the plumbing, defer the framework — wyclau has one user, so every
abstraction is a guess about a consumer that does not exist."** *(2026-09-02, after CEO 102 measured
that wyclau is in no catalogue and vendored by exactly one repo.)*

**That reasoning was sound on the evidence available and its conclusion is now wrong.** The second
consumer is not hypothetical — **the second consumer is the pitch**, and generality is the
deliverable rather than a nicety. **What survives from it:** his own method already says
*"build all of this by using it to make pastry pirates"*, which is extraction from working code, not
speculative abstraction. **The sequencing was right; the dismissal was not.**

### THE CONSEQUENCE NOBODY HAS TO BUILD

**The author/consumer asymmetry is a GIT PERMISSION, not a mechanism.** A consumer cannot push to
`github.com/wyattroy/claude-kit` because they do not have write access. **The property he asked for
— "we don't want them to be able to modify Claude kit" — is already enforced by the platform**, and
any code written to enforce it again would be ceremony. What the kit must provide the consumer is
**pull** (update to the latest) and nothing else; what it must provide the author is **push**.

### THE TEST THAT KEEPS IT A FRAMEWORK RATHER THAN A PILE OF PATCHES

*"not designed with a bunch of shitty small patches that apply just to pastry pirates"* — the check
is applied **at the moment of writing**, not in a cleanup pass, and CEO 102 already sharpened it into
something a gate can read:

> **No string a person reads may live in a shared file, and no shared file may name a `.planning/`
> path or a game concept.**

**Measured examples of what fails that test today:** `close_item.mjs:49-52` hardcodes four
`.planning/` paths; `start_trial_detached.mjs:35-36` **exits 2** if `scripts/sea_trial.mjs` is
missing — *"sea trial"* being a name he coined for this game; `longrun_status.mjs:74` derives its
ceiling from *"the longest sea trial on record here."*

## EXTENSIBILITY: DO IT ONCE, AT THE END — 2026-09-02, his rulings plus the call he delegated

**Three rulings, and one decision he handed to the Advisor with his values attached.**

| | HIS RULING |
|---|---|
| The kit's entry point (interview → mission → steps) | **AFTER THE GAME LAUNCHES.** The pitch is stronger with a shipped game as its evidence, and the interview is the piece most improved by having watched one real vision go end to end. |
| Game vs kit, competing for the same hour | **THE GAME WINS, UNTIL IT LAUNCHES.** A rule a watch can apply without asking him. After the launch, the order flips. |
| A daily "what did the framework learn" moment | **REJECTED, twice.** *"I don't need to know how the framework improved, every day. I just want the framework to improve!"* **Do not build a reporting ritual for this.** |

**His question, and the values he gave for answering it:** *"once we get the framework built and
working, is it a simple separate project to say 'make our claude kit in pastry pirates extensible to
any project'? and do that once, at the end?"* … *"i don't want this claude-kit extensibility project
to eat up our work on pastry pirates; but i DO want claude kit to be designed in such a way that we
can easily make it extensible whenever we want."*

### THE ANSWER: YES — DEFER IT, AND THE REASON IS MEASURED RATHER THAN PREFERRED

**The retrofit cost today is small and countable.** Every known violation of the framework test is a
string or a path:

- `close_item.mjs:49-52` — four hardcoded `.planning/` paths
- `start_trial_detached.mjs:35-36` — hardcodes `scripts/sea_trial.mjs`, **exits 2** without it
- `longrun_status.mjs:74` — a ceiling derived from *"the longest sea trial on record here"*

**That is three files and an afternoon.** Deferring is cheap *because the list is short*, and this
project's own record says extracting generality from working code has never failed here — it is his
own method (*"build all of this by using it"*).

### THE ONE PIECE OF MACHINERY, AND IT IS NOT A PROCESS

**A non-blocking counter, not a ritual.** A gate that runs in `npm test`, prints *"N shared files
carry project-specific references"*, **blocks nothing and nags nobody.**

Its job is not to remind him — he has rejected that twice and he is right. **Its job is to keep
"do it at the end" an honest choice instead of a hope.** Three files is a deferral; forty is a
deferral that has quietly become the problem, and nothing today would tell him which he is in.

**And when he is ready, the gate's output IS the task list** — the extensibility project scopes
itself, with no archaeology.

**It flips to blocking the day the game launches**, when his own priority ruling flips the order.
One line changed, at a moment already defined.

### THE ONE EXCEPTION WORTH DISCIPLINE NOW — STRUCTURE, NOT STRINGS

**Retrofit cost is not uniform, and this is the part that decides whether "at the end" works:**

- **A hardcoded path or name is CHEAP to retrofit.** Find it, parameterise it, done. All three known
  violations are this kind.
- **A structural assumption is NOT.** If the Glass is built to parse *the shape of Pastry Pirates'
  plan file* — `## STEP 1 CHECKLIST`, `## THE IDEA INBOX`, `- [ ]` rows with a particular fate
  vocabulary — that is not a rename. That is the framework knowing what a plan *is*, and unpicking
  it later is a rewrite rather than a sweep.

**So the only rule to carry during the game's run, and it fires a handful of times rather than
daily:** *when about to make a shared file depend on the SHAPE of something Pastry Pirates-specific,
stop and ask whether the shape should be declared rather than assumed.* **Strings can wait. Shapes
cannot.**

**Recommendation to him in one line:** defer the extensibility project entirely, keep one silent
counter so the deferral stays measured, and spend the discipline only on structural coupling — which
is where retrofitting actually gets expensive.

## ONE QUEUE, RANKED — his design, 2026-09-02, and it is better than the one it replaces

**His words, answering "what do you want done about the queue order":**

> *"the door should not read oldest-first; the RANK algorithm should do the ordering, and the door
> should read what's at the top. the rank algorithm should prioritize my requests over bugs that the
> Watch generated; and i need a way to say DO THIS NOW such that RANK puts it at the top -- eg a
> checkbox underneath the ideas list that says 'Add to top of list'"*

**AND THE RULING ON THE ADVISOR, same round:** **record-only, with a named exception.** The rule
stands — it was earned three times in one night. The exception: **the Advisor may execute when Wyatt
directs it in the moment, and must SAY in its reply that it stepped outside the line.** Explicitly
NOT an exception: the Advisor deciding on its own that the process is too slow.

### WHY HIS VERSION BEATS THE ONE THAT WAS PROPOSED TO HIM

The Advisor offered a `priority: NOW` marker typed into `INBOX.md`. **His answer removes a whole
class of problem instead of adding a mechanism**, and it does it in three moves:

1. **ONE ORDERING AUTHORITY.** Today there are TWO: the Door has its own rule (INBOX oldest-first,
   then the Chart) and RANK has another. **Rule 23's design-time question — *what makes these two
   agree?* — answers "nothing".** His version deletes the Door's rule entirely: RANK orders, the
   Door reads position 1. Two orderings become one.
2. **SOURCE BECOMES A RANKING SIGNAL.** *"prioritize my requests over bugs that the Watch
   generated"* — today RANK counts how often he has raised something, but a watch-filed defect and a
   thing he typed compete on equal footing. **Who asked is a fact already on disk** (his items carry
   his words; watch-filed rows carry a watch stamp), so it is derivable, not a new field.
3. **THE INTERRUPT IS A CONTROL HE HOLDS, NOT A MARKER SOMEBODY TYPES.** A checkbox under the Ideas
   box — *"Add to top of list"* — means the urgent path is **his hand on his own page**, with no
   session in the loop. Every interrupt tonight required him to notice, interrupt, and repeat
   himself. This removes the person from the mechanism.

### THE DEPENDENCY THIS EXPOSES, AND IT MUST BE FIXED FIRST

**RANK CANNOT CURRENTLY ORDER ACROSS THE TWO LISTS.** Recorded in `PENDING-KIT-PATCHES.md` patch 4's
own caveat: RANK reorders rows *within the open-row slots the file already has*, and cannot reorder
across the two sections the Glass concatenates (`glass.mjs`: open checklist rows, then unfated inbox
entries). **So "the Door reads what is at the top" is meaningless until there is ONE list to be at
the top of.** That is patch 5 — converge `glass.mjs` onto `scripts/wyclau/lib/chart_model.mjs`, so
the Glass and the Chartkeeper stop deriving "what is open" separately. **Unblocked as of today's
`vendor_check` inversion.**

**Order of work, and it is not negotiable:** converge the two derivations (patch 5) → RANK ranks one
list including source weight → the Door drops oldest-first and reads position 1 → the Glass gets the
"Add to top" checkbox and the harvest carries the flag through.

### WHAT "ADD TO TOP" MUST NOT BECOME

**One slot, not a queue.** Ticking it on a second item must displace the first, deliberately —
otherwise "urgent" becomes a second backlog, which is the exact fault this whole design removes. A
gate should fail the build on two.

**And it must be visible on the page.** He must be able to see what he pinned and whether it has been
taken; an interrupt he cannot see is indistinguishable from one that was ignored, which is precisely
what happened all night.

## THE IMAGE-WEIGHT ASK IS CLOSED — his ruling, question UI, 2026-09-02

**His ask, `INBOX-20260901T1335Z`, launch critical:** *"compressing the images to make the game load
MUCH faster… but the only one that needs to be as big as it is is the board itself — everything else
should be resized and compressed according to its maximum pixel size in the real gameplay."*

**HIS RULING: CALL IT FINISHED.** Offered "spend one watch on the last 0.09 MB" and "leave it open
until after launch", he chose finished.

| | |
|---|---|
| started | **17.79 MB** |
| now | **3.89 MB** — a 78% reduction |
| still recoverable | **~0.09 MB across 12 files — 2.3% of what remains** |

**WHAT WAS ACTUALLY DONE:** compression across the library; the board alone **4.24 MB → 0.19 MB** at
its own 2132×2132 (lossy WebP q0.92, mean error 1.65/255, lossless measured at 3.14 MB so the choice
was decided by a number); preload of **144 of 144** pictures warmed at boot, gated; and resize
applied where it paid.

⚠ **AND THE REASON THIS TOOK A DAY LONGER THAN IT SHOULD HAVE, kept because it is the lesson:**
- **An exclusion written from a PARAPHRASE.** `asset_quantize.mjs` carried
  `EXCLUDE = new Set(['assets/board.png'])`, justified as *"Wyatt named it the one file that stays as
  it is."* **He did not.** His sentence exempted the board from **RESIZING**, inside a clause about
  maximum on-screen pixel size — not from compression. That paraphrase then propagated into every
  later measurement (*"excluding board.png, 6.36 MB remains"*), so **43% of the game's art stopped
  being counted as work at all** while the launch-critical item stayed open.
- **A measurement blind to a third of its subject.** The resize probe looked for PNGs and **stopped
  seeing 53 of 149 pictures the day the library became WebP** (`00e85bf2`). Every conclusion drawn
  from it after that day described two-thirds of the library.
- **And his page showed him 9% when the truth was 2.3%** (CEO 109) — so the number he was steering by
  was four times the real prize.

**THE REUSABLE PART:** *an exclusion written from a paraphrase of what somebody wanted is invisible
once it is in the code, because every later reader inherits the paraphrase and not the sentence.*
