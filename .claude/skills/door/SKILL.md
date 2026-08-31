---
name: door
description: The one way into work on this project (wyclau charter, part 2). Use at the START of any work session, when asked to "continue", "keep going", or when a session needs to orient itself. Syncs, orients, states the situation in 5 lines, then works the Chart through the Proof.
---

# The Door

Every work session enters here. Orientation budget: **two minutes**. If any step below is
impossible, say what you actually observed and park a question — never guess past it.

## 1. Sync (30 seconds)

```bash
cd /Users/wyattroy/Documents/Projects/pastrypirates && git fetch origin && git pull --rebase
```

If the pull moved `.claude/CLAUDE.md` or `.claude/rules/`, re-read them from disk — your context
copy predates the pull.

## 2. Orient (60 seconds — read, do not re-derive)

1. `.planning/CHART.md` — the plan, the checklist, what's blocked on Wyatt.
2. `.claude/memory/DECISIONS.md` — his rulings (top entries; stop when dates look familiar).
3. `.planning/CTO-LEDGER.md` — tail only: what other live sessions have claimed.

## 3. State the situation — five lines, plain English

Running / last progress / shipped today / blocked on Wyatt / what this session will do now.
Write it to the user (interactive) or the ledger (unattended). Then **pulse**:

```bash
node scripts/wyclau/glass.mjs --note "<what this session is starting>"
```

## 4. Work

- **Instruction from Wyatt?** It outranks the Chart. Restate it back in the next reply, then do it.
- **No instruction?** Claim the top unblocked Chart (or, until cutover, BACKLOG) item in the
  ledger, then work it through the Proof: gear → red check first → fix → same check green →
  played verification at the gear's depth → fresh-context CEO → record verdict → update Chart →
  commit (pull --rebase first) → push → pulse → next item.
- **Taste question?** Park it in the Chart's BLOCKED ON WYATT table with a recommendation and move
  to the next unblocked item. Taste is never defaulted. Mechanism questions his existing rulings
  answer: answer from the record, name the ruling, keep going.
- **Pulse at least every 20 minutes** while working (`glass.mjs --note`), and at every item
  boundary. The watchdog reads the pulse; a silent session is a dead session.

## 5. Close

One short report in his ruled shape — **WHAT WORKED · WHAT I LEARNED (and where it is written) ·
WHAT'S NEXT** — new information only, corrections only where they change a decision, one daily
lesson if none has been given today. Kill every browser/server you started. Never end on an offer.
