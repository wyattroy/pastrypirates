# Rules retro — 2026-08-20. RESOLVED; kept as the reasoning behind CLAUDE.md rules 20–24.

> **OUTCOME.** Wyatt kept **R2, R4, R5, R7** and cut R1, R3, R6 as consequences of those rather than
> rules in their own right. He then added the two that matter most, which this draft had missed
> entirely — the north star (*"I don't really care about the ticket… what I care is that the game is
> efficiently made more and more joyfully playable"*) and the practice that follows from it
> (*"simply QA the game in a browser yourself, in multiplayer mode, in two different browser tabs"*).
> Those became CLAUDE.md rules **20 (play it) and 21 (hold the whole game)**, with the kept drafts as
> 22–24. He also chose **triage-and-recommend before fixing** when handed a list.
>
> **Do not re-add R1, R3 or R6 to CLAUDE.md.** He considered them and cut them deliberately.

**This was a proposal, not a decision.** Wyatt asked for my learnings from the last 24 hours, written
down durably and put to him for discussion. If he agrees, these merge into `.claude/CLAUDE.md` §1
and the wrong ones get thrown away. Nothing here goes into the standing rules unilaterally.

**What he said, so it stays quotable:**

> *"I had high expectations before going to bed, and now that I read back over your proposal of what
> you were going to work on while I was asleep, I can see that it was more limited in scope than I
> was hoping and imagining, but your language was so contextless for me that I couldn't understand
> it last night… We've been working for two days on a tiny set of problems that aren't even real
> bugs, and instead of thinking strategically about how to chase them down, you're just squandering
> time building thoughtless tool and not really fixing much, period. I have an enormous twenty point
> list of bugs that I haven't even been able to give you yet because you haven't been able to close
> out this phase."*

---

## The thing underneath all of them

**I optimised the ticket instead of the game.** Every failure below is a version of that. He asked
me to fix the game; I worked a five-item list I had invented myself, never asked what was on his,
and described the plan in language that hid how small it was. He could not redirect me because I
never gave him the size of what I was doing relative to what needed doing.

---

## R1 — Ask for his whole list before a long run. His backlog is the backlog.

**What happened:** he went to bed having asked me to fix everything I could in eight hours. I spent
them on five items *I* had reported. **He has a twenty-point list of real bugs that I have never
seen** and could not hand me. So the single most valuable thing available that night — knowing what
was actually wrong with the game — was one question away and I never asked it.

**The rule:** before any run longer than a few minutes, ask *"what's on your list, and what does
done look like?"* His observations outrank my inferences every time. He plays this game; I do not.

**The tell that I have skipped it:** I am working from a list whose items I wrote.

---

## R2 — Every plan states its SIZE: what a player gets, how much of the problem it covers, what it leaves undone.

**What happened:** my overnight plan read *"fix the two turn-blockers plus the wind pill, clock pill
and chat bubble."* To me that sounded substantial. To him it was contextless — he had no way to know
it was five small things out of twenty-plus, because **I never gave him the denominator.** He
approved a plan he could not size, then found in the morning it was far less than he imagined.

**The rule:** a plan he can't size is a plan he can't redirect. Every proposal says:

1. **what a player will experience differently** afterwards,
2. **how much of the known problem it covers** — "5 of ~20", "the whole crew-game path", "one screen",
3. **what it explicitly leaves undone.**

**This is a sharper form of rule 4 (plain English).** Plain words are not enough; plain words with no
scale still leave him unable to direct. *"Fix the guest's wind pill"* is plain English and still
useless to him. *"Five small render bugs out of your twenty — none of them the ones that stop you
playing"* is directable.

---

## R3 — In a fix window, the deliverable is FIXES. Proof is a tool, not the product.

**What happened:** asked to fix everything, I changed **zero lines of game code in eight hours.** I
ran six probes to establish that one reported bug did not exist, then two more to close old
verification debt. Every probe was rigorous and the rigor was real — and it was the wrong product.

This is not a new lesson, which is what makes it bad. `feedback-testing-scope` already says *"match
verification effort to what's actually at stake"*, written after he called an overnight run
**"absolutely ridiculous"** for building instrumentation to answer a question his eye settled in
sixty seconds. **Same failure, thirteen days later, at ten times the scale.**

**The rule:** when the ask is "fix it", ship fixes. Measure when something is contested, risky, or
irreversible — not by default. If a bug is obvious and cheap, fix it and move on; if the fix is
wrong he will tell me in a minute, which is cheaper than an hour of proving.

---

## R4 — Never report a defect as confirmed before measuring it.

**What happened — and this is the root of the whole two days.** At the phase gate I put five defects
in front of him, three of them in a table beside measured findings, **having measured none of those
three.** They came from one screenshot read while my guest was still behind the opening card. All
three were false. The trade one was false too. **Four of five.**

So the "tiny set of problems that aren't even real bugs" he has spent two days on **is a list I
generated and then handed him with unearned confidence.** The table format itself asserted a
certainty that did not exist.

**The rule:** say *"observed once, not yet measured"* until it is measured. Never put an unmeasured
claim in a table next to measured ones. And red-proof the instrument before believing it — three
separate checks in one night measured something other than what they named
(`offsetParent` on a fixed element; polling for a prompt while a driver answered it; checking for
buttons on a prompt kind that draws squares).

---

## R5 — Do not build tooling when the ask is to fix the game.

**What happened:** I spent a large part of the night building a `PreToolUse` hook. He picked it from
a menu — but **I put that menu in front of him during a fix window and framed the choice as free.**
The fault is mine for offering it then, not his for choosing it. He called the result "thoughtless
tool", and from where he sits that is fair: the game got no better.

**The rule:** infrastructure, harnesses and process improvements are a *substitution* for the ask
unless he asked for them. If I think tooling is needed, say so in one line and **park it** — do not
offer it as a live option while real bugs are waiting.

---

## R6 — Never let the process block his input.

**What happened:** he could not hand me his twenty-point list **because the workflow wanted the phase
closed first.** The process was serving itself. A gate that stops the person with the information
from giving it to me is a broken gate.

**The rule:** if a workflow step stands between him and telling me what is wrong, break the step. Take
the list, re-scope the phase around it, fix the record afterwards. The planning system exists to
serve the game, not the reverse.

---

## R7 — Hold the whole game, not the current ticket. Engineer AND designer.

**What he asked for:** *"to be able to direct you to think holistically about the project as both an
engineer and a designer and to understand my intentions more clearly."*

**What happened:** I treated each plan as the entire world. Nothing in two days asked *"what would
most improve this game right now?"* — the question a designer asks before picking up any ticket. When
he says "fix the whole game", the **intent** is *make this game good*, not *work the list you
inferred at midnight*.

**The rule:** read the intent, not only the words. Periodically step back and say what I think the
biggest lever is, in game terms — and be willing to say *"the thing you asked for is not the most
valuable thing available; here is what I think is."* That is a designer's job and he is asking me to
do it.

---

## What I owe him next, if he agrees

1. **His twenty-point list**, before anything else.
2. A **re-scoped 02.2** built from that list rather than my phantom five.
3. Fixes, drops he can test, and a running count of what is left.
