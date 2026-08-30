---
name: ceo
description: Show finished work to a fresh CEO before showing it to Wyatt. Use after any real work — something built, fixed, measured or shipped — to judge whether the thing he ASKED for actually happened. Not after a question answered or a file handed over.
argument-hint: "<his request, VERBATIM — his exact words, not a summary>"
allowed-tools: [Bash, Read, Glob, Grep, Agent, AskUserQuestion, Write, Edit]
---

# /ceo — did the thing he asked for happen?

The user invoked this with: $ARGUMENTS

**The sequence is: do the work → run a CEO → give Wyatt the CEO's verdict → then your own account.**

## Why this exists, and it is not about honesty

A session once answered a 35-item playtest by shipping 22 fixes, verifying 4, and reporting
success. **Nothing in that report was a lie.** The gap was between what he ASKED for and what was
delivered — and that gap is invisible from inside the work. Adjacent, competent, impressive work
that misses the ask is exactly what this exists to catch.

## Step 1 — is this repo set up?

```bash
# BOTH VARIABLES MUST BE CHECKED FOR EMPTINESS FIRST. With them unset, the obvious one-liner
# `ls -d "$CLAUDE_PLUGIN_ROOT/bin"` resolves to `/bin` — which exists on every Mac — and the next
# line silently runs `node /bin/ceo_brief.mjs`. Caught by a CEO review 2026-08-27: a silent wrong
# answer, in the first instruction of a system whose whole claim is that nothing is skipped quietly.
BIN=""
[ -n "${CLAUDE_PROJECT_DIR:-}" ] && [ -d "$CLAUDE_PROJECT_DIR/.claude/officers/bin" ] && BIN="$CLAUDE_PROJECT_DIR/.claude/officers/bin"
[ -z "$BIN" ] && [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] && [ -d "$CLAUDE_PLUGIN_ROOT/bin" ] && BIN="$CLAUDE_PLUGIN_ROOT/bin"
[ -n "$BIN" ] || { echo "STOP: cannot find the officer engines. Neither CLAUDE_PROJECT_DIR/.claude/officers/bin nor CLAUDE_PLUGIN_ROOT/bin resolved. Do not guess a path — tell Wyatt."; exit 1; }
echo "engine: $BIN"
test -f "$CLAUDE_PROJECT_DIR/.claude/OFFICERS.md" && echo "adapter: yes" || echo "adapter: MISSING"
```

**A repo's own `.claude/officers/bin` wins over the plugin copy when both exist.** That is
deliberate: a repo that vendored the officers (so they survive into a cloud container) must run the
copy it can actually see, not a second one on the laptop. One brain per repo, chosen by presence.

**If the adapter is MISSING, STOP.** Do not run a partial review and present it as a review.
Tell Wyatt it is missing, name what cannot be checked without it, then ask him — **with the question
UI, never as prose** — the questions in `templates/OFFICERS-template.md`, and offer to write the file
from his answers. Then continue.

## Step 2 — assemble the brief

```bash
node "$BIN/ceo_brief.mjs" --ask="<HIS EXACT WORDS>"
```

**`--ask` takes his words verbatim.** Not your summary of them. **The summary is where the drift
already happened**, and a reviewer handed a paraphrase grades the paraphrase. If he invoked `/ceo`
with no argument, scroll up and take the request from his own message — do not reconstruct it from
what you did.

Fill in the **WHAT WAS DONE, AS CLAIMED** section yourself: files, commits, measurements, **and what
was not done**. Admitting the gaps is not weakness here; a CEO that finds an unadmitted gap reports a
bigger fault than the gap itself.

## Step 3 — hand it to a FRESH agent

Spawn a new general-purpose agent with the brief as its whole prompt.

**FRESH CONTEXT, ALWAYS. Never continue an existing agent, and never review your own work yourself.**
A CEO that inherits your reasoning inherits your blind spot — that is the entire mechanism, and
reusing an agent quietly removes it while looking identical from outside.

## Step 4 — relay the verdict in ITS words

**Especially when it is bad.** A kind paraphrase makes this whole thing theatre, and the paraphraser
is the one with the motive to soften it. Quote its one-sentence headline directly. Then give your own
account, separately, clearly marked as yours.

## Step 5 — record it, or the next review is weaker

Append the verdict to the `verdicts` file named in the adapter (default `.claude/CEO-REVIEWS.md`),
**newest at the top, append-only, never edit an old verdict** — a review that turned out wrong is
evidence about the reviewer and belongs on the record exactly as written.

**This step is the one that gets skipped, and skipping it breaks a check nobody will notice is
broken.** Each CEO is handed the previous verdict so it can say whether the same fault is *recurring*.
A verdict nobody recorded is a recurrence check nobody can run.
