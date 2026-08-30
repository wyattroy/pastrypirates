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

## Step 4 — spawn, then stay the bridge

Spawn the two leads first and let them build the task list from the scope. Keep your own context
for decisions and relay. **Do not start doing tasks yourself** — the moment the bridge starts
building, nobody is steering.
