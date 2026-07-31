---
id: human-trade-counter-offer
title: A human receiving a trade offer can only Accept or Decline — never counter
status: pending
type: feature
severity: major
area: gameplay
created: 2026-07-30
source: Phase 15 playtest notes (Wyatt, 2026-07-30)
resolves_phase: null
regression: false
---

## Issue

The trade negotiation is asymmetric, and the asymmetry runs **against the human**.

When a **human** is on the receiving end of a trade offer, the prompt offers exactly two buttons —
`✓ Accept` and `✗ Decline` (`src/ui/flow.js:576-580`, `@copy prompt.trade.accept`). Declining ends
the negotiation outright.

When a **bot** is on the receiving end and declines, it never flatly refuses: it always counters with
a named price (`src/ui/flow.js:606-613`, `@copy prompt.trade.counter` — *"scoffs — but counters:
'{n}🌕 more for my {crate}, take it or leave it.'"*), and the human then gets a `Pay {n}🌕 more` /
`Walk away` choice. If the human cannot cover the full shortfall, the bot even names the smaller
amount they *can* afford rather than walking (`counterHeadroom()`, F12).

So a bot always gets a second bite at a deal it doesn't like; a human never does.

## PROMOTED 2026-08-01 — this is a parity breach, not a nice-to-have

Wyatt's original ruling (2026-07-30) was *"let's put counter-offer feature onto the backlog"*, and it
sat here as a low-severity feature.

**On 2026-08-01 he named it as an instance of the standing bot/human parity invariant**
(`.planning/PROJECT.md`): bots play by exactly the same rules and affordances as humans. This is a
place where they demonstrably do not — and his direction on how to close it:

> *"Humans currently cannot counter-offer during trades, and we want them to be able to — so rather
> than remove the bot's ability, we want to add it to the human ability."*

**That reframes it twice over.** It stops being an optional feature and becomes a rule violation; and
it establishes the general principle that **parity can be restored by levelling the human UP**, not
only by taking capability away from bots. It is now a named worked example inside
`2026-08-01-bot-human-parity-audit.md`.

**Raised to `major`** — an asymmetry that runs *against the player* in a negotiation is a fairness
problem, not polish.

## Where it lands

**Not the re-record batch.** This adds a human affordance; it does not change what bots decide, so
the event stream and the 31-seed corpus are untouched. **Verify that holds** — if reusing the bot's
valuation code pulls in an RNG draw on a path the corpus exercises, that changes the answer.

Still needs Wyatt's approval on the new prompt's copy, like any player-facing string.

## Sketch, if picked up later

Give the human's decline path the same shape the bot's already has: on `Decline`, offer a
counter-demand prompt (how much more the human wants for their crate), then run the offering party —
bot or human — through the existing accept/refuse valuation. The bot-side valuation code
(`cost` / `val` / `bonus` at `src/ui/flow.js:585-605`) can be reused as-is to answer a human counter,
so the work is mostly the new prompt and its copy, which would need Wyatt's approval like any other
player-facing string.
