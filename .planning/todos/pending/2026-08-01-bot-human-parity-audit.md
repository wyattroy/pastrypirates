---
created: 2026-08-01T00:40:00.000Z
title: Audit bot/human parity across all three turn implementations
area: gameplay
severity: major
files:
  - src/ui/flow.js (humanAct / humanTurn — the human path)
  - src/ui/flow.js (botTurn / botWindLeg — the live bot path)
  - src/engine/index.js (takeTurn / windPush — the headless engine path)
---

## Why this exists

`.planning/PROJECT.md` records a **standing design invariant** (Wyatt, 2026-08-01, *"and it has been
from the beginning"*):

> **Bots play by exactly the same rules and have exactly the same affordances as human players.**
> They differ only in *how they choose*, never in *what they may do*.

**It has been violated at least twice, and both times were found by accident in a playtest:**

- **AI-01** (v1.2) — a bot could hail *and* take another action in one turn.
- **FIX-18** (2026-08-01) — a bot can fish *and* dock at Tortuga to start its bakery in one turn.

Two known breaches, both found by a human noticing something felt off, means **there is no mechanism
finding these.** This audit is that mechanism, run once deliberately instead of waiting for the next
playtest to surface number three.

## The structural reason parity keeps breaking

**A turn is implemented three times:**

| Path | Where | Runs when |
|---|---|---|
| Human | `src/ui/flow.js` — `humanAct` / `humanTurn` | a person is playing |
| Live bot | `src/ui/flow.js` — `botTurn` / `botWindLeg` | a bot plays in a real game |
| Headless engine | `src/engine/index.js` — `takeTurn` / `windPush` | the determinism corpus, replay, the simulator |

**Nothing enforces that these three agree.** A rule added to one is not added to the others unless
someone remembers. This is the same three-way split that produced **FIX-13**, where the engine guards
`blownOut` on actual movement and the live paths do not.

## What to produce

**A table, not a fix.** For every action a turn can contain — sail, dock, fish, trade, hail, attack,
flee, anchor, bribe, dock-at-Tortuga — record what each of the three paths permits:

| Action | Human may | Live bot may | Engine may | Agree? |
|---|---|---|---|---|

Specifically check, for each:

- **Does it consume the turn's action**, or can another follow it?
- **What does it cost**, and is affordability checked the same way?
- **What preconditions gate it** (adjacency, coins, cargo, having moved already)?
- **Is it available at all** in that path?

Anywhere the three disagree is either a parity bug or a deliberate exception — and **a deliberate
exception must be written down with its reason**, or the next audit re-litigates it.

## Rules for the audit

- **The human path is the reference for what the rules ARE — not for which side gets fixed.**
  *(Corrected by Wyatt, 2026-08-01.)* An earlier version of this file said the human implementation
  is "right by definition." **That is wrong and would produce bad fixes.** Parity is a symmetry
  requirement, not a ceiling on bots. For every mismatch, record **both** the difference and a
  recommendation for **which way to close it**:
  - *level the bot down* — the bot has an affordance the game should not grant at all; or
  - *level the human up* — **the human is the one missing something, and should get it.**

  **The named example is the trade counter-offer** (`human-trade-counter-offer.md`): a bot that
  dislikes an offer always counters with a named price, while a human can only Accept or Decline.
  Wyatt, 2026-08-01: *"rather than remove the bot's ability, we want to add it to the human ability."*
  **An asymmetry that runs against the player is the worse kind, so levelling up is often right.**
  Where it is not obvious, the recommendation is Wyatt's to accept or overturn — but every finding
  should arrive with one, not just a diff.
- **Fix nothing in this phase.** This is v1.4's investigation phase. Findings that turn out to be
  engine-tier queue into the single gated re-record phase alongside FIX-18, so the determinism cost
  is paid once. **A parity fix that changes bot behaviour changes the event stream — expect
  those to land in that batch. A fix that only adds a human affordance (like the counter-offer) does
  NOT touch bot decisions and may be free of the re-record entirely — sort findings by which kind
  they are, since that decides where each one can ship.**
- **Do not stop at the first finding.** Two breaches are already known; the value here is the
  complete set, so the re-record batch is assembled once with everything in it.

## Worth considering as an outcome

If the audit finds several breaches, the durable answer is not five separate fixes but **a shared
gate the three paths all call** — the same reasoning behind the shared coin re-validation helper
Wyatt already approved for the CR-02 family. Three copies of a rule is what created this problem; a
fourth copy will not solve it. Whether that refactor is worth doing is Wyatt's call once the size of
the problem is known — **which is precisely what this audit is for.**

**Source:** Wyatt, 2026-08-01, after ruling on FIX-18.
