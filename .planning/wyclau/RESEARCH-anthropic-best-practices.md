# Anthropic's current guidance on working with Claude Code (as of 2026-08-30)

Researched 2026-08-30 from Anthropic's engineering blog and the official Claude Code docs.
One structural finding first: **the famous "Claude Code: Best practices for agentic coding"
blog post (Apr 2025) now permanently redirects to the living docs page at
code.claude.com/docs/en/best-practices.** The docs are the current authority; the blog holds
the deeper research pieces. Everything below cites where it came from.

---

## 1. Digest of current best practices

### The one constraint everything else follows from
> "Claude's context window fills up fast, and performance degrades as it fills. ...
> The context window is the most important resource to manage."
— Best practices, https://code.claude.com/docs/en/best-practices (living doc, current 2026)

The engineering-blog version: treat context as a finite "attention budget"; the goal is
"the smallest possible set of high-signal tokens that maximize the likelihood of some
desired outcome."
— Effective context engineering for AI agents, Sep 29 2025,
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

### CLAUDE.md: keep it under 200 lines, and prune ruthlessly
— https://code.claude.com/docs/en/memory and /docs/en/best-practices (current 2026)

- **Target under 200 lines per file.** "Longer files consume more context and reduce
  adherence." And bluntly: "Bloated CLAUDE.md files cause Claude to ignore your actual
  instructions!"
- The pruning test, per line: *"Would removing this cause Claude to make mistakes?"* If
  not, cut it.
- If Claude keeps violating a rule that's written down, the diagnosis is that **the file is
  too long and the rule is getting lost** — not that the rule needs restating harder.
  Emphasis ("IMPORTANT") works only if used on one line; "if you emphasize many lines,
  none of them stands out."
- Explicit exclude list: anything Claude can figure out by reading code, long explanations
  or tutorials, information that changes frequently, file-by-file codebase descriptions.
- Splitting into `@imports` organizes but does **not** save context — imports still load at
  launch. The mechanisms that actually save context:
  - **`.claude/rules/*.md` with `paths:` frontmatter** — loads only when Claude touches
    matching files (e.g. a board-rendering rule that loads when `src/ui/` is opened).
  - **Skills** — load on demand when invoked or relevant; the only cost at startup is the
    one-line description.
  - **Hooks** — zero context cost; the official home for "must happen every time" rules.
    "An instruction like 'never edit .env' in CLAUDE.md is a request, not a guarantee. A
    PreToolUse hook that blocks the edit is enforcement."
- New tooling: `/doctor` now proposes trims for a checked-in CLAUDE.md (cuts what Claude
  can derive from the codebase; keeps pitfalls, rationale, and non-default conventions).
  `/context` shows what actually loaded. HTML comments in CLAUDE.md are stripped before
  injection — free for maintainer notes.
- **Auto memory** (2026 feature, on by default): Claude writes its own cross-session notes
  to `~/.claude/projects/<project>/memory/`. Only the first 200 lines / 25KB of MEMORY.md
  load at startup; detail lives in topic files read on demand. This is the official pattern
  for "lessons that accumulate": a one-line index, detail behind it.

### Give Claude a check it can run
— https://code.claude.com/docs/en/best-practices

"Claude stops when the work looks done. Without a check it can run, 'looks done' is the
only signal available, and you become the verification loop." The ladder of enforcement,
in order of increasing autonomy:
1. In-prompt: "run the tests and iterate."
2. `/goal` — a separate evaluator re-checks the condition after every turn.
3. A **Stop hook** — deterministic gate that blocks the turn from ending until the check
   passes (Claude Code overrides after 8 consecutive blocks).
4. A **verification subagent in fresh context** — "so the agent doing the work isn't the
   one grading it."

And: "Have Claude show evidence rather than asserting success: the test output, the command
it ran, or a screenshot of the result."

### Separate the grader from the maker (the big 2026 research finding)
— Harness design for long-running application development, Mar 24 2026,
https://www.anthropic.com/engineering (index); companion repo
https://github.com/anthropics/cwc-long-running-agents

When a model generates code and then evaluates its own output, "it tends to confidently
praise the work even when quality is mediocre." Anthropic's fix is **structural**: separate
planner / generator / evaluator agents, objective grading rubrics, and automated browser
testing (Playwright) as the evaluator's instrument. Runs iterate 5–15 times, sometimes for
hours. Cost: more tokens and latency — accepted deliberately for unattended quality.

### Long-running / overnight agents
— Effective harnesses for long-running agents, Nov 26 2025,
https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

- Structure autonomy around durable **artifacts on disk**: a feature list (JSON, explicit
  pass/fail per item), a progress file per session, git history, and an init script.
- "Make incremental progress ... while leaving the environment in a clean state at the end
  of a session." One feature at a time; commit after each; end-to-end test before marking
  anything complete.
- Named failure modes: premature "done" claims (fix: explicit tracked feature list),
  undocumented progress (fix: required commits and notes), unverified features (fix:
  mandatory browser automation), time lost re-orienting (fix: a startup checklist).

### Workflow guidance for directing the work
— https://code.claude.com/docs/en/best-practices

- **Explore → plan → implement → commit**, using plan mode for the first two — but skip
  planning when "you could describe the diff in one sentence."
- **Let Claude interview you** for larger features: "Interview me in detail using the
  AskUserQuestion tool ... then write a complete spec to SPEC.md." Then execute the spec in
  a **fresh session** with clean context.
- Course-correct early; after **two failed corrections on the same issue, `/clear`** and
  write a better prompt — "a clean session with a better prompt almost always outperforms a
  long session with accumulated corrections."
- Use subagents for investigation so exploration doesn't fill the main window; `/btw` for
  side questions that never enter history; checkpoints + `/rewind` to try risky things.
- Adversarial review before "done": a fresh-context subagent reviews the diff against the
  plan. **With a warning**: "A reviewer prompted to find gaps will usually report some,
  even when the work is sound ... Chasing every finding leads to over-engineering." Tell
  reviewers to flag only correctness/requirement gaps.

### The extension ladder — add mechanisms only at their trigger
— Extend Claude Code, https://code.claude.com/docs/en/features-overview

| Trigger | Add |
|---|---|
| Claude gets a convention wrong twice | CLAUDE.md line |
| You keep typing the same starting prompt | User-invoked skill |
| You paste the same playbook a third time | Skill |
| A side task floods the conversation | Subagent |
| Something must happen every time, no exceptions | Hook |
| A second repo needs the same setup | Plugin |

Rule of thumb repeated verbatim there: "Keep CLAUDE.md under 200 lines. If it's growing,
move reference content to skills or split into `.claude/rules/` files."

### Multi-agent: powerful, expensive, and officially rationed
- **Subagents** (stable): isolated context, summary returns; the default parallel tool.
- **Agent teams** (https://code.claude.com/docs/en/agent-teams): **experimental, disabled
  by default** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`). Best for parallel *exploration*
  — research, multi-lens review, competing debugging hypotheses. "For sequential tasks,
  same-file edits, or work with many dependencies, a single session or subagents are more
  effective." Start with 3–5 teammates; teammates must own disjoint files; known
  limitations around resumption, task-status lag, and shutdown.
- Background research: the orchestrator-worker research system used ~15x the tokens of a
  single chat — worth it only when the task genuinely parallelizes.
  — How we built our multi-agent research system, Jun 13 2025,
  https://www.anthropic.com/engineering/how-we-built-our-multi-agent-research-system
- The founding principle still stands: find "the simplest solution possible, and only
  increase complexity when needed."
  — Building effective agents, Dec 19 2024,
  https://www.anthropic.com/engineering/building-effective-agents

### Cloud sessions and routines (the 2026 remote story)
— https://code.claude.com/docs/en/claude-code-on-the-web and /docs/en/routines
  (both research preview, current 2026)

- `claude --cloud "task"` starts a session on Anthropic infrastructure; it clones the
  **pushed** branch, not the local checkout. Monitor with `/tasks`, from claude.ai/code, or
  the **mobile app**. Steer any running cloud session from any machine with
  `claude -p "message" --cloud <session-id>`.
- `claude --teleport <id>` pulls a cloud session into a terminal (one-way; local→cloud
  handoff of an existing session only via the Desktop app). After teleporting, phone
  steering requires re-arming `/remote-control` locally — the docs confirm what this
  project learned the hard way.
- Cloud VMs **expire when idle**; reopening restores conversation but "background work
  that was still running ... isn't restored." Cloud sessions share the plan's rate limits;
  parallel sessions consume proportionally. No separate compute charge.
- **Routines** (`/schedule`): saved prompt + repos + environment, run on cron / API call /
  GitHub events on Anthropic's cloud, laptop closed. No permission prompts during a run —
  scope repos, connectors, and network deliberately. Critical caveat, verbatim: "A green
  status in the run list means the session started and exited without an infrastructure
  error. **It does not mean the task in your prompt succeeded.** Open the run to read the
  transcript."
- **Auto mode** is now the default starting permission mode on Max: a classifier reviews
  actions instead of prompting, blocking only what looks risky.
  — How we built Claude Code auto mode, Mar 25 2026, https://www.anthropic.com/engineering

### Skills and tools
- Skills are the recommended container for domain knowledge and repeatable workflows;
  `disable-model-invocation: true` for side-effect workflows only a human should trigger.
  — https://code.claude.com/docs/en/skills; Equipping agents for the real world with Agent
  Skills, Oct 16 2025, https://www.anthropic.com/engineering
- Tool/CLI guidance: prefer real CLIs (`gh`, etc.) — "the most context-efficient way to
  interact with external services"; write tools with token-efficient, unambiguous outputs.
  — Writing effective tools for agents, Sep 11 2025, https://www.anthropic.com/engineering

---

## 2. What this means for Pastry Pirates

**The situation being mapped:** one non-engineer director (Wyatt) + Claude as the whole
engineering team; a ~600-line CLAUDE.md grown by accretion; hard-won lessons scattered
across docs/, code comments, and commit messages that fresh sessions forget; a home-grown
CEO-review / sea-trial / agent-team apparatus; an always-on Razer PC, a MacBook at night,
Claude cloud containers (4 cores, idle-drop ~15 min), Max plan with headroom.

### The CLAUDE.md is 3x over Anthropic's cap — and the symptoms match exactly
Anthropic's stated failure mode for an over-long CLAUDE.md is Claude ignoring rules that
are plainly written down. This project has lived that: "ask with the question UI — I tell
you every day," CEO-after-every-item said three times, screenshots skipped despite rule 22.
The official diagnosis is not "write the rule bigger" (the file already italicizes,
bold-caps, and repeats) — it's **the file is too long, so every rule is diluted**.

Concrete restructure the docs endorse:
- Trim CLAUDE.md toward ~200 lines: the 25-rule table, the few genuinely-every-session
  facts (deploy shape, safety rules, the north star), and pointers.
- **War stories and long rationale → skills or referenced docs.** They are exactly what the
  docs call reference material: valuable, but not needed in every session's first token.
  The stories aren't lost — they load when the topic comes up.
- **Subsystem rules → `.claude/rules/` with `paths:`.** Board-rendering rules load when
  `src/ui/` is touched; trade rules when trade files are; deploy rules on scripts/. This is
  the official replacement for "read the design doc first" hoping someone does.
- **Every must-happen rule → a hook.** The project already proved this works
  (`qa-gear-first.cjs` fires at the moment of the first game-code edit). Candidates: the
  fetch-before-trust git check (SessionStart), kill-your-Chromes (Stop), the sea-trial gate
  (Stop hook that blocks "done" until the report exists with today's stamp).
- Run `/doctor` for trim proposals and `/context` to see what the 600 lines actually cost.

### The scattered-lessons problem has an official answer now
Auto memory (index + on-demand topic files, hard 200-line index cap) is Anthropic's own
architecture for accumulating lessons — and this project's MEMORY.md already follows it.
The gap is that HARD-WON-LESSONS.md relies on "read it all at session start," which the
project itself observed failing ("re-read a lesson at its TRIGGER, not once at session
start"). Anthropic's trigger-based loading — path rules and skills — is the mechanical
version of that observation. Move lessons to where their trigger is, not to where a
conscientious reader might be.

### The CEO review is officially blessed — with one warning to adopt
Fresh-context adversarial review of the diff against the ask is now a documented core
pattern ("the agent doing the work isn't the one grading it"), and the Mar 2026 harness
research says self-grading agents *confidently praise mediocre work* — the exact gap the
CEO was invented for. Keep it. Adopt the official caveat: a reviewer told to find gaps
always finds some, and chasing them produces over-engineering. The CEO's narrow question
("did the ask happen?") is already the right defense; keep its verdicts scoped to the ask
and correctness, never style.

### The sea trial maps to "a check Claude can run" — and can be upgraded
The four-step loop (show broken → change → show fixed → sweep) is the official
verification philosophy. Two upgrades from the docs:
- Wire the trial as a **Stop hook or `/goal`** so a session physically cannot report done
  without the report existing — turning rule 24 from prose into enforcement.
- The Mar 2026 harness work endorses **browser automation as the evaluator's instrument**,
  which is what `mp_rig.mjs` / DRIVING-THE-GAME already are. The NOT-RUN column matches
  Anthropic's routines caveat verbatim (green run ≠ task succeeded).

### The home-grown agent team should stay the exception
Official agent teams exist but are experimental, off by default, token-heavy, and
recommended for parallel *exploration* (research, review, competing hypotheses) — not for
sequential build work on shared files. That endorses using the `/team` skill for playtest
triage and multi-lens review, and a single session + subagents for most fixing. On a Max
plan with headroom the tokens are affordable, but the docs' real warning is coordination
overhead and wasted parallel effort, not cost.

### For a director who describes intent: the interview pattern is now official
"Have Claude interview you using AskUserQuestion, then write a spec, then execute in a
fresh session" is rule 1 of this project written by Anthropic. The addition worth stealing:
**execute the spec in a fresh session** — planning conversation and implementation
conversation are different contexts, and the spec on disk is the handoff. Also official:
after two failed corrections, stop correcting and restart with a better prompt (the mute
button took three rounds; the docs say two is the limit).

### Mapping the hardware
- **Razer (always on):** the long-running-harness patterns belong here — feature list with
  pass/fail, per-session progress file, clean-state exits, startup checklist. The
  CTO-ledger claim system already matches this; add the init-script and startup-checklist
  pieces so a resuming session re-orients in seconds, not minutes.
- **Cloud containers (idle-drop ~15 min):** per the docs, VM reclaim kills in-flight
  background work and only conversation history survives. Use cloud sessions for
  **bounded, self-contained tasks** (a migration from a committed plan, a review, a
  research question), never as the home of a long overnight run. Push before `--cloud` —
  it clones the remote, not the local tree.
- **Routines** are the official replacement for hand-rolled overnight scheduling: nightly
  sea-trial-and-report, weekly docs-drift check against `docs/`, a PR-review routine.
  They run with no permission prompts, so scope them; and open every run's transcript.
- **Phone:** cloud sessions are natively monitorable from the mobile app, and
  `claude -p "..." --cloud <id>` steers from anywhere. For local sessions, `/remote-control`
  remains Wyatt-armed only — the docs confirm teleported sessions need it re-armed, which
  matches the standing rule to ask, never announce.
- **Max headroom:** parallel cloud sessions share the plan's rate limits proportionally;
  a fan-out that would burn the day's budget on speculative work is the thing to watch,
  not dollars.

---

## 3. Anti-patterns Anthropic warns about

All from https://code.claude.com/docs/en/best-practices unless noted.

1. **The over-specified CLAUDE.md.** "If your CLAUDE.md is too long, Claude ignores half of
   it because important rules get lost in the noise. Fix: ruthlessly prune ... delete it or
   convert it to a hook." Also excluded by name: info that changes frequently, long
   explanations, anything derivable from the code.
2. **Stale and conflicting instruction files.** "If two rules contradict each other, Claude
   may pick one arbitrarily." Review and prune periodically; "treat CLAUDE.md like code:
   review it when things go wrong, prune it regularly, and test changes by observing
   whether Claude's behavior actually shifts." (docs/en/memory)
3. **The kitchen-sink session** — unrelated tasks sharing one context. `/clear` between.
4. **Correcting over and over** — after two failed corrections the context is polluted;
   restart with a better prompt instead of a third correction.
5. **The infinite exploration** — unscoped "investigate X" fills context with file reads.
   Scope it or send a subagent.
6. **The trust-then-verify gap** — plausible output with no runnable check. "If you can't
   verify it, don't ship it."
7. **Self-grading** — a generator evaluating its own output overrates it; separate the
   evaluator structurally. (Harness design, Mar 2026)
8. **Over-orchestration.** Agent teams "add coordination overhead and use significantly
   more tokens"; wrong for sequential or same-file work; "three focused teammates often
   outperform five scattered ones." Multi-agent research burned ~15x tokens (Jun 2025).
   The root rule: simplest solution possible, complexity only when it measurably helps
   (Building effective agents, Dec 2024).
9. **Reviewer-chasing.** A gap-hunting reviewer always reports gaps; chasing every finding
   yields "extra abstraction layers, defensive code, and tests for cases that can't
   happen."
10. **Trusting the green light.** A routine's green status "does not mean the task in your
    prompt succeeded" — open the transcript. (docs/en/routines) The same idea as this
    project's NOT-RUN column, now stated by the vendor.
