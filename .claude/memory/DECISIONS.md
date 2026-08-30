# Wyatt's standing decisions

**What he has chosen, why, and when — so nobody asks him twice.** Newest at the top.

This is not the rulebook (`.claude/CLAUDE.md` — how to work with him) and not the work record
(`.planning/CTO-LEDGER.md` — what happened). **This is the list of things he decided**, and the
reason each one was decided that way. A decision nobody wrote down is a decision he has to make
again.

**Append here the moment he rules on something.** Date it, quote him where you can, and say what
the alternative was — the alternative is what makes it a decision rather than an instruction.

---

## 2026-08-30 — the organisation

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