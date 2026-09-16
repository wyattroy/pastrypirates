# CEO reviews — newest at the top, append-only

Never edit an old verdict. A review that turned out wrong is evidence about the reviewer and belongs here exactly as written.
Each CEO is handed the previous verdict so it can say whether the same fault is *recurring* — a verdict nobody recorded is a
recurrence check nobody can run.

---

## 2026-09-15 · the bots' strategy · `sep15-dock-line` @ `a6eb873d` (build 2026.09.15.3)

**His ask, verbatim:** *"the design is that the bots play AS INTELLIGENTLY AS POSSIBLE -- as intellignetly as a skilled human. a
bot would know that holding a resource, especially a cheap resource is always better than holding the coin -- it can be insurange,
trade bait, it is even half of a black market crate they may need later. I want the CEO to audit the bot's strategy and algorithm
and suggest ways to make them measurably smarter. If you need, build in a watcher that records solo games too so you can learn how
actual humans (who win games) play."*

**ITS ONE SENTENCE:** *"Your instinct is right and now has a number behind it — a bot should take the cheap crate over the coin,
but only at an island's floor price, because at any higher price it spends the money it needs at the next island and the voyage
gets slower; and while proving that I found that the bots' brain is planning against a dock that pays 4 dubloons a turn when yours
has paid 2 since August, which is why they keep turning up somewhere they cannot afford."*

**The ladder** (300 seeded voyages an arm, red-proofed both ways: an identical brain gave +0.0 on all four rows, a brain that only
passes gave −54.2):

| the change | dev seeds ×7919 | held out ×104729 | verdict |
|---|---|---|---|
| his rule, at the FLOOR price only | +0.8 | +3.2 | DO IT |
| the dock rate derived from cfg (`coinTurns`) | +0.8 | +2.8 | DO IT |
| his rule, at ANY price | −2.3 | +0.8 | NO — the spare eats the next island's money, voyages got LONGER |
| his rule guarded by "keep enough for my next island" | +0.2 | — | inert |

**It overruled my report to Wyatt.** I had told him *"it's the design, and the bug is that nobody says so."* Its finding: *"The repo
does not support calling it the design"* — `BOT-DESIGN-PRINCIPLES.md` principle 2 forbids priority gates, and the buy gate at
`doDock` plus the merchant clause beside it are exactly that. **The measurement was sound; the conclusion drawn from it was not.**

**The fault it found recurring:** the previous verdict's *"the dock is written in two places"*. The payment was fixed; **the buy
decision was not** — `doDock` played one copy and `planTurnV3`'s berth branch evaluated another, kept in step by hand.

**His three reasons for the cheap crate, measured:** insurance — **no** (141 of 141 crates taken in battle were ones the loser's
recipe wanted; a spare never absorbs a hit, and an empty hold cannot be attacked at all). Trade bait — **thin** (0.91 trades a
voyage). Half a black-market crate — **right, and the whole case**: two spares buy a crate off a bare shelf, every voyage ends with
at least one bare shelf, and a spare bought at a full shelf on a dock turn already being spent costs 3 dubloons and no turns.

**On his watcher:** the recorder already ships (`pp4_solo` holds seed + `dlog`, enough to replay a voyage move for move) and is
wiped when a voyage ENDS — exactly the finished games he wants. It advised against sending any of it anywhere: this game is
cookieless with no banner *because children play it* (his 2026-09-03 ruling). Its alternative: keep his own finished logs on his own
machine, replay them headless, and ask the planner what it would have done on each of his turns — a list of the exact moments the
bot and the winning human disagree, in the game's own nouns.

**WHAT I BUILT FROM IT, the same night (build 2026.09.15.6):** both proved changes, and the convergence — `wantsCrate` is now the
ONE answer to "does this captain take this crate?", called by `doDock` (what a bot plays) and by the planner's berth branch (what a
bot evaluates). Verified stacked on the ladder run backwards (the reverted brain against the shipped one), which the audit itself
had not tested.
