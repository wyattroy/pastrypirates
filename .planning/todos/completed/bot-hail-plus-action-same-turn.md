---
id: bot-hail-plus-action-same-turn
title: A bot can "hail" (parley) the human AND take a normal action in one turn
status: completed
type: design-question
severity: low
area: gameplay
created: 2026-07-25
source: Phase 12 UAT (Wyatt's Safari playthrough)
resolves_phase: 14
regression: false
---

## Observation

Wyatt saw Flaky Jack (bot) both attempt a parley AND then go fishing in a single turn:
```
Flaky Jack pays 1 and sails
Flaky Jack offered 5 for Wyyyy's Speckled Eggs — refused
Flaky Jack casts a line, nets a candycrab (1)
Dough Hook pays 1 and sails
```
Reads as a bot taking two actions in one turn.

## What it actually is (traced)

This is the intentional **"hail humans" mechanic** in the live bot turn (src/ui/flow.js:584-612): a *locked-out* bot — one that needs an ingredient which only the human holds AND the island is out of crates for — hails the human to buy it (`"Ahoy! 5🌕 for your <ing> — what say ye?"`, sell/counter/refuse). This runs as a **pre-action negotiation**, and then at flow.js:613+ the bot still takes its normal `chooseAction` action (attack/trade/dock/fish). So: sail → hail (optional) → normal action.

## PRE-EXISTING — not a refactor regression

Confirmed byte-identical to shipped v1.0 on `main`: `main:index.html:4607` has the same "hail humans: locked-out bots offer coins…" block with the same hail-then-`chooseAction` structure. The v1.1 refactor moved it verbatim (`game.` → `appState.game.`/`g.` naming only). This behavior shipped in v1.0.

## Design question (future decision)

Should the hail count as the bot's turn action (so a bot that hails does NOT also fish/dock/etc.), or is the hail intentionally a free negotiation on top of the normal action? Currently it is the latter. This is a **game-design call**, not a bug fix — decide the intended rule first, then adjust flow.js (and mirror in the deterministic engine's `takeTurn` if the rule should also apply to bot-vs-bot, to keep determinism/replay consistent).
