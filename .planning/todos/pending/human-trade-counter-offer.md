---
id: human-trade-counter-offer
title: A human receiving a trade offer can only Accept or Decline — never counter
status: pending
type: feature
severity: low
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

## Wyatt's ruling

> "let's put counter-offer feature onto the backlog."

## NOT being built in this pass

This is recorded here and **deliberately not implemented** by the 2026-07-30 playtest-notes quick
task (`OOS-1`). It is a genuine feature — a new prompt, new player-facing copy, and a new branch in
the negotiation loop — not a bug fix, and it was explicitly sent to the backlog rather than built.

## Sketch, if picked up later

Give the human's decline path the same shape the bot's already has: on `Decline`, offer a
counter-demand prompt (how much more the human wants for their crate), then run the offering party —
bot or human — through the existing accept/refuse valuation. The bot-side valuation code
(`cost` / `val` / `bonus` at `src/ui/flow.js:585-605`) can be reused as-is to answer a human counter,
so the work is mostly the new prompt and its copy, which would need Wyatt's approval like any other
player-facing string.
