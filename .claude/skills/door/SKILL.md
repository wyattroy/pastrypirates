---
name: door
description: The one way into work on this project (wyclau charter, part 2). Use at the START of any work session, when asked to "continue", "keep going", or when a session needs to orient itself. Syncs, orients, states the situation in 5 lines, then works the Chart through the Proof.
---

# The Door

Every work session enters here. Orientation budget: **two minutes**. If any step below is
impossible, say what you actually observed and park a question — never guess past it.

## 1. Sync (30 seconds)

```bash
git fetch origin && git pull --rebase
```

Run it where you stand — every way into the Door (the watchdog, a terminal, a cloud container)
starts in the repo root. Never `cd` to one machine's absolute path first: the repo lives at a
different path on every machine, and a failed `cd` short-circuits the `&&` chain so the sync
silently does nothing — on every watchdog restart, forever.

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
- **HARVEST BEFORE EVERY GLASS REPUBLISH (v2 — the page is two-way).** Wyatt writes ideas
  directly on the Glass; they live in the page's `glassState.ideas` until moved. Before
  republishing: read the live artifact (Artifact tool, `action: "read"`, the URL glass.mjs
  prints), copy every `ideas[]` entry into the Chart's IDEA INBOX with a recommendation, commit
  — THEN regenerate and republish. **A republish without the harvest deletes his words.** An
  artifact-changed notification for the Glass means he wrote something: harvest it promptly and
  give it a fate.
- **AND REPUBLISH THE GLASS at every item boundary** — writing `glass.html` is only half of it.
  The page Wyatt reads is an artifact, and only a session can push the file to it; `glass.mjs`
  prints the URL every run. On 2026-08-31 the local page was minutes old while the published one
  sat at 12:16Z all day, and HE is the one who noticed. A pulse he cannot see is not a pulse.
- **THEN RUN `node scripts/wyclau/mark_glass_published.mjs`** — the other half of the same fix.
  A plain script cannot call the Artifact publish tool itself, so this is how a real publish gets
  recorded; the keep-working Stop hook checks the gap it leaves and blocks a stale, unpublished
  pulse (CEO Review 52 moved this OUT of `npm test` — it must never gate the game's own release).

## 5. Close

One short report in his ruled shape — **WHAT WORKED · WHAT I LEARNED (and where it is written) ·
WHAT'S NEXT** — new information only, corrections only where they change a decision, one daily
lesson if none has been given today. Kill every browser/server you started. Never end on an offer.
