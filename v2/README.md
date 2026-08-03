# Pastry Pirates v2 — playtest build

A playable build of the v2 ruleset. **Solo against bots, and pass-and-play for 2–4 humans.**

```bash
python3 -m http.server 8000     # from the repo root
# then open http://localhost:8000/v2/
```

## What it is

- `engine.js` — the **only** rules implementation. Pure: no DOM, no wall clock, no `Math.random`.
  It runs as a generator, yielding a `DecisionRequest` whenever it needs a choice.
- `strategy.js` — the bot resolver. Implements `.planning/research/BOT-STRATEGY.md`. No rules.
- `ui.js` — render and input. No rules. The human is just another resolver.
- `main.js` — wiring only.
- `selftest.mjs` — plays N complete games headlessly through the same seam the UI uses.

```bash
node v2/selftest.mjs 200
```

**The board is reused wholesale** from `src/engine/index.js` — island placement, tetromino shapes,
single-berth docks, the circular sea and the four rim arcs. So is the art pipeline from
`src/shared/index.js`. v2 changes the rules on the sea, not the sea.

## Why a generator

It is the decision seam from the PRD, and it is what makes "bots and humans play the same game by
the same rules" true by construction: a bot is a resolver, a human is a resolver, and there is no
rules code outside the engine for them to diverge in. Replay comes free — the seed plus the list of
responses *is* the game.

## Deliberately not here yet

Multiplayer, sound, the End of Voyage screen, animated storm/cast beats, the narration tiers, and
the Lookout's coin-backing. Those are PRD M4–M6.

**No `CNAME`, `robots.txt` or `sitemap.xml` lives in this directory, and none may ever be added.**
Those files claim `playpastrypirates.com`; a copy anywhere else can take the live game down. The
page carries `noindex` instead.
