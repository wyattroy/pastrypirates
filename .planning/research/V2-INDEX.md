# v2 design pass — where everything is

**2026-08-03.** Wyatt asked for a ruleset that is more engaging off-turn, with shorter battles, a
wind you can feel, exploration worth doing, and pastry that means something mechanically — while
being *smaller* and playable at a table. This is the index to what came out of it.

Branch: **`claude/pastry-pirates-ruleset-wuybma`** — 14 commits, all pushed. Nothing lives only in a
chat transcript.

---

## Read in this order

| # | Document | What it is |
|---|---|---|
| 1 | **`RULESET-v2-PROPOSED.md`** | **The ruleset as decided.** Rules first, then the evidence for each. Start here. |
| 2 | **`BOT-STRATEGY.md`** | How a captain should think. A build requirement, not a nice-to-have — two of the biggest quality wins in the whole pass were bot behaviour, not rules. |
| 3 | **`PRD-v2-FORK.md`** | How to build it. Nine non-negotiables drawn from this project's own scar tissue, and the decision-seam architecture. |
| — | `RULESET-DESIGN-REVIEW-2026-08-03.md` | The original review of the **shipped v1** game that started this. Superseded as a plan, still the best record of what is wrong with v1 and why. |

## The code

| Path | What |
|---|---|
| `v2/` | A playable build — solo and pass-and-play. **See the health warning below.** |
| `v2/selftest.mjs` | Plays N complete games headlessly through the same seam the UI uses |
| `scripts/wyatt_ruleset_sim.mjs` | The balance simulator. Every number in the ruleset came from here |
| `scripts/v2/bundle.py` | Flattens v2 into one self-contained HTML page |

Canonical simulator run — every figure in the ruleset reproduces from this one command:

```bash
node scripts/wyatt_ruleset_sim.mjs 3000 --treasure=4 --bidmax=8 --tradefirst \
  --flatcoins --shared --retune --outcry
```

---

## ⚠️ Health warning on `v2/`

**Wyatt playtested it on 2026-08-03 and found "so many problems I don't know where to start."**

Treat it as a proof that the rules can be implemented, **not** as a foundation to build on. The
engine and the decision seam are probably sound — the self-test plays 200/200 games and the
architecture is what the PRD asks for — but the UI, the pacing, the narration and the phone layout
were built fast and are not good. Nobody should assume otherwise because the commits sound
confident.

Also unresolved: the self-test's **seat spread favours later seats by ~9 points**, worse than the
simulator's ~5. Something in the implementation differs from the model and was never chased down.

## The one open design question

**Battles are 1.6 a game.** That is Wyatt's stated intent taken all the way — fights only happen when
somebody is stingy, and an efficient open market means almost nobody is — but it may be too peaceful
for a game about pirates.

What matters more than the number: **battle frequency is set by the bot's threat premium, not by any
rule.** The online game's whole temperament is an AI setting. It should be chosen deliberately, not
discovered in playtest.

## Things that were measured and would be expensive to rediscover

- **Bots must measure in turns, not squares** — and the plateau trap that follows (`BOT-STRATEGY.md`
  §1). Getting this wrong made half of all games never finish.
- **A boat power is worth its per-event value × how often that event fires.** Event frequencies are
  in the ruleset's power section. Powers attached to storms (~3 events a game) cannot be rescued by
  any dial.
- **The doubling ladder in the Shared Cast is EV-neutral at every rung**, which is exactly why it
  works: the arithmetic never tells you what to do, only your position does. Any gentler ladder
  breaks that.
- **The trade rate is a bot-policy number, not a rules number.** 2.5 deals a game became 38 by
  changing how bots value crates. Never quote a trade figure without saying which bot produced it.
- **Chain-routing is specified but unconfirmed** (`BOT-STRATEGY.md` §6c). It did not beat greedy in
  simulation, and the top suspect is that the router ignores the wind forecast rule 6 hands it. Try
  that before concluding the strategy is wrong.

## Corrections made along the way — kept so they are not re-made

- The shipped wind does more than the first review claimed. Reachable-*cell-count* is
  direction-invariant by symmetry and could never have shown an effect; measured as progress toward
  a target it is worth 1.4 squares.
- Rule 11 ("buy any crate") was first read as killing trade. It is the opposite — it is what creates
  the trade economy.
- `RULES.md` and `Rules_boardgame.md` still describe a v1 battle system the engine stopped running,
  and call the home port Barbados where the game says Isle of Tortuga. **Independent of v2 and worth
  fixing regardless.**
