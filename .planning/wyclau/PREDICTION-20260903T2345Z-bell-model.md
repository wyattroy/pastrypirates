# PREDICTION — 2026-09-03T23:45Z — the Watch's model flag (INBOX-20260903T2340Z)

Written BEFORE any measurement, per the Door step 3 and CLAUDE.md rule 6.

## What I expect

1. `scripts/wyclau/bell.ps1` builds its `claude` argument list with `-p "<door prompt>"` and an
   optional `--add-dir`, and carries **no `--model` flag**, so every watch inherits the CLI default.
2. `C:\Users\wyatt\.claude\settings.json` sets `"model": "claude-opus-5"`, and that is where the
   default comes from. No `ANTHROPIC_MODEL` in the environment; neither repo settings file names a
   model.
3. **No gate anywhere asserts the Bell's launch line names a model.** A search for `--model` across
   `scripts/` returns nothing outside the Bell (and, after my change, the new gate).
4. `bell.ps1 -DryRun` prints the real argument array, so a gate can read the launch line without
   ringing a watch.

## Why

The inbox entry that recorded his instruction says exactly this, and it says it was measured. I am
predicting it still holds on the current tree — i.e. that nothing changed it in the few hours since
— not re-deriving it from scratch.

## What would prove me WRONG

- `bell.ps1` already carries `--model` → the item is already done and the inbox entry is stale.
- A repo-level `settings.json`/`settings.local.json` names a model, or `ANTHROPIC_MODEL` is set →
  the diagnosis "it falls out of the user's global settings" is wrong and editing the Bell would not
  change what a watch runs.
- `bell.ps1 -DryRun` does NOT print the argument array → the gate I intend to write cannot see its
  subject, which is rule 6's instrument trap, and I would need a different check.
- A gate already exists → the "nothing ever said so" half of the entry is false.

## The taste half, which I am NOT deciding

WHICH model is his. The record's recommendation is **Sonnet 5**. I will implement that
recommendation, say so loudly as one reversible line, and put the choice into his Your Call card so
he can overrule it. I am NOT treating his silence as approval — I am treating his own words
*"we also need to start having the Watch use a different model setting"* as the instruction it is,
and refusing to leave the relay burning Opus every fifteen minutes while a question waits.

---

## OUTCOME — appended 2026-09-03 by the session Wyatt started AFTER the usage stop

**His ruling arrived while this was in flight, and it settles the taste half above:** *"Change the
watch to use sonnet 5."* Recorded in `.claude/memory/DECISIONS.md`. The recommendation and the ruling
agree — but it is a ruling now, not a recommendation nobody confirmed.

### Which predictions held, checked rather than assumed

| # | prediction | verdict |
|---|---|---|
| 1 | `bell.ps1` carries no `--model`, watches inherit the CLI default | **held** — and it is now fixed: `$watchModel = "claude-sonnet-5"` inside one `$claudeArgs` array |
| 2 | the default comes from the global `settings.json` | **held**, and deliberately left alone — it governs his own sessions |
| 3 | no gate asserts the launch line names a model | **held** — three assertions now do |
| 4 | `-DryRun` prints the real argument array so a gate can read it | **held in the source, NOT exercised live** — see below |

### The falsifier that FIRED, and it is the honest part of this note

Prediction 4's own failing case was *"`bell.ps1 -DryRun` does NOT print the argument array → the gate
cannot see its subject."* **It could not be exercised here.** Two reasons, both measured:

1. The retired standalone gate invoked the dry run **without `-Repo`**, which is `Mandatory=$true`.
   It would have died on a missing-parameter error every time, been swallowed by the catch, and
   reported `NOT CHECKED` — *forever*, on every machine, while reading like a careful skip.
2. Run correctly **with** `-Repo`, the Bell printed nothing and logged nothing, because the last ring
   was 23:38:01Z and the file was saved at 23:44:25Z — **inside the launch grace window**, where
   exiting silently is the Bell working as designed.

**So the live half of the check is unproven, and is recorded as unproven.** What IS proven is the
source-text half, red-proofed for real rather than on the strength of a comment: three mutants —
revert the launch line, let `Start-Process` rebuild its own list inline, let the dry run log a
description — **3 killed, 0 survived, 0 no-ops**, each at its own named assertion.

### What changed as a result of writing this down

The standalone `scripts/qa/bell_model_check.mjs` was **superseded and deleted**, not wired in. Its
checks belong in `scripts/qa/bell_check.mjs`, which was already the Bell's structural gate, already
in `npm test`, and already carried the red-proof harness. **That avoided the twenty-fifth consecutive
ceiling raise** — and, more to the point, avoided repeating CEO 174's exact finding, where a gate was
written, committed, green, and *nothing ever ran it*.

**The first ring after 23:44:25Z is the real proof, and it writes itself:** the ring line in
`.planning/wyclau/restarts.log` now ends `rang the next one on claude-sonnet-5`. The three lines
before it — 22:08, 22:58, 23:38 — do not, which is what a relay burning Opus with nobody's permission
looks like in a log.
