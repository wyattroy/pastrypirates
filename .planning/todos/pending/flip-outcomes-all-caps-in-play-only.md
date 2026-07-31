---
id: flip-outcomes-all-caps-in-play-only
title: Flip outcomes are ALL CAPS in play only — prose and stats stay lowercase
status: closed-decided
type: ruling
severity: low
area: copy
created: 2026-07-30
source: Phase 15 playtest notes (Wyatt, 2026-07-30)
resolves_phase: null
regression: false
---

## The rule

**ALL CAPS when the game announces a flip outcome AS IT HAPPENS. Lowercase when teaching or
tallying.**

- **In play** — the game is calling the result at the moment it lands: `⚫️ TAILS! Take treasure
  instead?`, `⚪ HEADS: dodge safely. ⚫ TAILS: lose a crate`. **ALL CAPS.**
- **Explanatory prose** — the how-to-play modal describing how flipping works. **lowercase.**
- **Statistics** — award bylines, the `heads-luck` tally, end-of-voyage summaries. **lowercase.**

## Wyatt's ruling

> "just the in-play line is fine, leave the prose and stats"

## The sweep is DONE — do not re-run it

This was swept on 2026-07-30. **The only in-play offender was the tails dock prompt**, and it was
fixed in the same pass (G12, `src/ui/flow.js` — `⚫️ TAILS! Take treasure instead? Or buy …?`). The
flip button's three `flipLabel` branches in `windLeg` were already correct.

**This file exists to stop a future sweep re-running it** and "finding" the prose and stats sites,
which are correct as they stand.

## THE HAZARD, named — a blanket replace will corrupt the code

Anyone re-running this must scope the change to **string literals only**. A bare
find-and-replace of `heads`/`tails` hits identifiers and CSS class names, and the damage is silent:

| Site | What it is | What a blanket replace does |
|------|-----------|------------------------------|
| `e.heads` | an event field read across the narration tables | breaks every dock/flip narration |
| `p.heads` | a player's running heads tally | breaks the heads-luck award |
| `.coin.heads` | a CSS class on the flip coin | the coin stops rendering its face |

This is the same trap D-29 documented for the pirate-register conversion, where a bare replace of
the pronoun turned `layout` into `layet` — `scripts/ui_contract_check.js` assertion 5 still carries
a standing `layet` corruption probe for exactly that reason. **If this is ever revisited, add an
equivalent probe first.**
