---
name: team
description: Launch an agent team for a scope of work — twin leads, a measurer who proves the defect first, builders on disjoint files, a tester who uses the real product, a checker who trusts only evidence, and a sweeper who finds the fault's twins. Use when a body of work is large enough that one session doing it alone is the bottleneck.
argument-hint: "<scope, e.g. \"the 14 playtest items\" or \"the guest/host convergence\">"
allowed-tools: [Read, Grep, Glob, Bash, Agent, AskUserQuestion, Write, Edit]
---

# /team — spawn the crew

The user invoked this with: **$ARGUMENTS**

**The lead does not build.** In this crew, as in a real one, the person holding the plan is not
the person writing the code. Your session is the **bridge**: decisions, relay and steering. The
leads run the crew; the crew does the work.


## The organisation's memory — read it before you act, append to it when he rules

**`.claude/memory/README.md` is the map**: what kind of memory lives in which file, and where a new
one gets written. **`.claude/memory/DECISIONS.md` is what he has already decided** — read it so you
never re-open a settled question, and **append to it the moment he rules on something**, that same
turn, with the date and the reason.

**A checkpoint his existing rulings already answer is not a reason to stop.** Resolve it from the
record and NAME the ruling you used. Only genuinely new decisions reach him.

*(Durable memory, disposable instance: you remember nothing between sessions, and that is the
design. What is not written down is gone, and freshness is what keeps a reviewer independent.)*
## Step 1 — the project adapter

**First read `.claude/TEAM.md`.** It defines how this product is run and seen working, what
evidence "done" requires here, and what must never be touched.

**If it does not exist, STOP.** Do not spawn anything. Tell the user, ask them — with the question
UI — how this product is run, how work is verified, and what is off limits, then offer to write
`.claude/TEAM.md` from their answers. A crew with no adapter invents its own standard of done,
which is worse than no crew.

## Step 2 — the roster

| Agent | Owns | Never |
|---|---|---|
| `team-lead` ×2 — **port** and **starboard** | port assigns, starboard routes verification; each restarts the other | builds |
| `team-measurer` | proving the defect exists — the check that FAILS first, red-proofed | fixes anything |
| `team-builder` ×N | the smallest change that makes the measurer's check pass | touches a file another builder owns |
| `team-checker` | fresh-context verification, evidence only | trusts the builder's account |
| `team-tester` | using the real product as a person; both viewpoints where there are two | edits code |
| `team-sweeper` | finding every other place the same fault lives | edits anything |

**The order is the loop:** measure → build → check → see → sweep. A task that skips the measurer
has no before-picture, and a fix with no before-picture cannot be shown to have fixed anything.

## Step 3 — the standing rules

- **NEVER END A TURN ON AN OFFER. This is the one that has actually failed.** A closing sentence
  like *"starting the checker now unless you want the tester first"* reads as finished from the
  inside and spawns nothing. On 2026-08-30 exactly that sentence stopped a run dead; nobody noticed
  until the user read *"resumed session"* in the desktop app hours later, and the container had
  been reclaimed in between. **There are two correct shapes and no third:**
  **(a)** the work is already authorised — **take it in this turn and say what you took**; or
  **(b)** you genuinely need a decision — **ask through the question UI**, which does not stop the
  run, and keep working on everything that does not depend on the answer.
  *Guarded two ways by `no-idle-offer.cjs`, and be clear which is which. A PHRASE LIST catches the
  common shapes — and a CEO reworded past it four times in two minutes the day it shipped, so it is
  a help, not a guarantee. THE GUARANTEE is the state gate beside it: a live run with unchecked
  items in `.claude-team/PROGRESS.md` and a turn that made no tool call at all is blocked whatever
  it says, because nothing happened. Registered on both `Stop` and `SubagentStop`, so it watches
  the crew and not only the bridge.*
- **NO TWO BUILDERS SHARE A FILE, EVER.** Subagents cannot see each other; two in one file destroy
  each other's work. Port-lead splits by file, not by feature. **If the work does not split
  cleanly, run fewer builders** — a team is worse than one worker on same-file work.
- **Nothing reaches the user without a checker PASS** plus the evidence `.claude/TEAM.md` defines.
- **Questions never block the run.** When the crew needs the user, it **flags immediately** — a
  written question they can answer whenever they look — **and then carries on with everything that
  does not depend on the answer.** A run that stops to wait wastes the hours they were asleep for;
  a run that silently defers the question wastes their morning. Neither is acceptable.
- **Resolve from the record first.** Anything the user's recorded rulings already answer, resolve
  and **name the ruling used**. Only genuinely new decisions reach them.
- **Ask everything answerable NOW, before starting**, while they are still here.
- **Discovery is captured, not acted on.** A defect the crew notices that was not on the list goes
  on a findings list for the user to approve. It does not become work.
- **Everything they read is plain English with the size stated** — what they get, how much of the
  problem it covers, what it leaves undone.

## Step 4 — spawn the LEADS, and never a role

Spawn the two leads and let them build the task list from the scope. Keep your own context for
decisions and relay. **Do not start doing tasks yourself** — the moment the bridge starts building,
nobody is steering.

**AND DO NOT RUN THE LOOP YOURSELF EITHER — this is the structural half, and it is the one that
failed.** A bridge that spawns the measurer, waits, spawns the builder, waits, spawns the checker
**is holding the sequence in its own head**, and between every two roles there is a moment where it
composes a message instead of acting. That moment is where a run dies. It died there on
2026-08-30: three roles in, the bridge wrote *"starting the checker now unless you want the tester
first"* and stopped.

> ### ⚠ CORRECTED WITHIN THE HOUR, BY MEASUREMENT, AND THE CORRECTION IS THE USEFUL PART
>
> The first version of this section said *"the leads hold the sequence so that no such moment
> exists"* and told the bridge to stop spawning roles. **A CEO called that unverified, and it was
> then measured: a `team-lead` subagent HAS NO AGENT-SPAWNING TOOL.** Port-lead's own progress file
> reported it in the first minutes of the very run this rule was written for — *"ToolSearch returns
> no `Task` and no `ListAgents`; the only inter-agent tool present is `SendMessage`."*
>
> **So the rule as first written moved the spawning duty onto the one party that cannot spawn.** It
> did not remove the gap; it would have made a run that could not staff itself at all.
>
> **A rule that says a gap "does not exist" is the recurring fault this whole file is against:
> asserting more than the evidence supports.** Below is what the evidence actually supports.

**THE BRIDGE IS THE ONLY THING THAT CAN SPAWN, SO THE BRIDGE SPAWNS — AND THAT IS EXACTLY WHY THE
DUTY IS ON IT.** The gap is real and it is yours. Close it with a rule about YOUR turn, not by
handing the job somewhere it cannot go:

**When a role reports to you, spawn the next role IN THAT SAME TURN.** The loop already says what
comes next — measure → build → check → see → sweep — so there is nothing to decide and nothing to
ask. A turn that ends with the crew idle and the loop unfinished is a stalled run, whatever it says
in it.

**The leads plan, split and verify; they ask you for a spawn through `SendMessage`.** Treat such a
request as the loop speaking, not as a question — staff it and say you staffed it.

**And if you cannot raise a lead at all, run the loop single-handed rather than stopping.** That is
what port-lead did the hour this was written, and it was the right call: *"a run that stops to
report a missing tool is the exact failure this run already had today."*
