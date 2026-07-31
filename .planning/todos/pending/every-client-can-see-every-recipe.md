---
id: every-client-can-see-every-recipe
title: Every client holds every player's secret recipe
status: pending
type: design
severity: medium
area: multiplayer
created: 2026-07-29
source: Phase 15 playtest (Claude joined Wyatt's game as a guest, 2026-07-29)
resolves_phase: null
regression: false
---

## Issue

Every client's game state contains **every player's recipe**, not just its own. Read live from a
guest seat during a real multiplayer game:

```js
__pp_app_state_debug().game.players.map(p => p.recipe)
// seat 0: ["sugar","dairy","cocoa","vanilla","wheat"]
// seat 1: ["spice","dairy","vanilla","eggs","cocoa"]   <- mine
// seat 2: ["sugar","wheat","vanilla","eggs","dairy"]
// seat 3: ["vanilla","spice","dairy","cocoa","sugar"]
```

Anyone who opens a dev console can see exactly what every opponent needs.

## Why it matters

Recipes look like hidden information by design — the UI reveals your own on request
(`appState.recipeRevealed`, the "check my recipe" affordance) and never shows anyone else's.

It is **load-bearing** for parley, which is the game's main interaction. The skill in trading is
guessing what a rival will part with: a crate they need has no price in a race, a surplus one is
cheap. This was demonstrated in the same playtest — Claude offered 6🌕 for Wyatt's Cacao Pods and was
refused, because cocoa was in Wyatt's recipe. Wyatt: *"if you asked for wheat, i would have said
yes."* A player who can read recipes never wastes an offer, and always knows whose crates are
surplus.

It also affects battle target choice and blocking.

(Noted and deliberately NOT exploited during the playtest — using it would have made the
"is Claude better than the bots?" question meaningless.)

## Scope note

Not a Phase 15 concern (narration only), and not urgent for solo or pass-and-play, where all state
is legitimately on one device anyway. It matters for **online multiplayer against people you cannot
see**, which is where the game is heading.

## Options (unassessed)

1. **Broadcast only what a seat needs to render.** Send each client its own recipe plus opponents'
   *revealed* crates. The host is authoritative and already computes everything, so guests do not
   need opponents' recipes to render — worth confirming nothing in the render path reads them.
2. **Send a redacted roster** — opponents' recipe arrays emptied or length-only, so the UI can still
   show "3 of 5 gathered" without naming which.
3. **Accept it** as a known property of a friendly game among people who are not inspecting each
   other's consoles, and document it rather than fix it.

Option 1 is the honest fix; option 2 is likely much cheaper and probably sufficient. Check whether
anything (e.g. progress pips, end-of-voyage stats) actually reads `players[].recipe` on a guest
before deciding.

## Related

- Phase 15 `15-CONTEXT.md` D-55/D-56 — host/guest divergence, same `decisionIsLocal` split.
- `.planning/how-to-play-pastry-pirates.md` — the playtest that surfaced this.
</content>
