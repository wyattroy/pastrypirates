---
id: d41-two-greyed-states-never-eyeballed
title: Two of the four D-41 greyed dead-ends have never been seen on screen
status: pending
type: verification-gap
severity: low
area: ui
created: 2026-07-30
source: Phase 15 verification (human_verification item 2); both recorded playtest sessions
resolves_phase: null
regression: false
accepted_by: Wyatt, 2026-07-30, at the Phase 15 ship gate ("ship now, carry both")
---

## What has not been looked at

D-41 gives every greyed-out dead-end its own reason beneath the buttons, instead of a button that
simply does nothing. Four such states exist. **Two have never been rendered in front of a human.**

| State | Needs | Expected reason |
|---|---|---|
| `— coins only —` | a 0-coin purse *inside* the trade flow | *"Ye don't have any coin to offer — pick a crate instead."* |
| hail **Counter-offer** | a bot that cannot afford a raise | *"{bot} can't afford to go any higher."* |

Confirmed live and not at issue: the greyed **Attack**, the greyed **Trade** (this is F11's fix), and
the fifth case — the storm anchor at 0 coins (G10).

## Why it stayed unseen

Both need a game state **the bots kept closing** during both recorded sessions. This is the same luck
that produced F11: that bug was found only because a restarted game happened to put the human first,
so the menu rendered with zero cargo on the table. The window opens and shuts on its own.

## What IS proven, so the risk is bounded

`ui_contract_check.js` assertion 6 — the co-reachability gate — proves a reason is reachable **in the
state it describes**, and it was red-proofed against the *real* broken pre-fix tree (`ab98e04`), not
a synthetic fixture. That is meaningfully stronger than a grep. It is still weaker than an eyeball:
it cannot see wording that reads badly, a reason that renders in the wrong place, or a button that
looks clickable when it is not.

Note the standing caveat on its sibling: assertion **6a** currently reports *"0 chains"* against the
real code, because F11's own fix converted the chain to independent `if`s. Do not read 6a's green as
covering this.

## If it is taken up

Do not wait for the bots to leave the window open — **force the state**. Two ways, in preference
order:

1. A harness that renders the two menus directly, which would also retire the "no harness renders
   these two" note in `15-VERIFICATION.md` permanently.
2. A seeded game plus a temporary purse/coin override, driven to the trade flow and the hail. If an
   override is used, revert it in the same session — see the standing note about temporary `cfg`
   edits leaking into commits.

Whichever is used, capture the two screens so the next person does not have to re-open the window.
