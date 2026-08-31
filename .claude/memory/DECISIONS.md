# Wyatt's standing decisions

**What he has chosen, why, and when — so nobody asks him twice.** Newest at the top.

This is not the rulebook (`.claude/CLAUDE.md` — how to work with him) and not the work record
(`.planning/CTO-LEDGER.md` — what happened). **This is the list of things he decided**, and the
reason each one was decided that way. A decision nobody wrote down is a decision he has to make
again.

**Append here the moment he rules on something.** Date it, quote him where you can, and say what
the alternative was — the alternative is what makes it a decision rather than an instruction.

---

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
