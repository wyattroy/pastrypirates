# Wyatt's standing decisions

## THE KEEP-WORKING HOOK FIRES ONLY IN THE BOSUN — 2026-08-31, RESTATED 2026-09-01 BECAUSE IT WAS LOST

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

**The org is CEO, CTO, EA, and a crew.** He is the **chairman of the board**. The **CEO** manages
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
