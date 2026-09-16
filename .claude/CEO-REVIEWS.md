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

### Replication, 2026-09-16 — the CTO's re-run of the same ladder, at 1000 voyages an arm

**The audit's two "DO IT" rows do not replicate, and I did not ship them as given.** Same ladder, run backwards
(the OLD brain in the flagged seats, the shipped one elsewhere), red-proofed at +0.0 for an identical brain and
−33.8 for a lobotomised one:

| | 200 an arm | **1000 an arm** |
|---|---|---|
| both changes, dev seeds ×7919 | old brain +2.6 | **old brain +1.0** |
| both changes, held out ×104729 | old brain +1.8 | **new brain +0.7** |

The effect shrinks toward zero as the sample grows, both directions — which is what noise does. The audit's +3.2
was the same size on a smaller sample.

**What the audit promised a player would see, measured (1000 voyages, whole table):**

| | today | + cheap crate | + cheap crate, guarded | + both changes |
|---|---|---|---|---|
| bot stands at an island it needs and cannot pay | **2.07 a voyage** | 2.41 | 2.20 | 2.51 |
| spare crates bought | 0.03 | 0.50 | 0.24 | 0.50 |
| barters struck | 0.14 | 0.15 | 0.15 | 0.12 |

So the spares are bought and never become the black-market payment they were bought for, and the symptom the audit
opened with — arriving unable to pay — gets *worse*, not better. **SHIPPED: the dock-rate fix** (win share flat,
but offers put to the table fall 11.38 → 9.06 a voyage while deals struck rise 0.93 → 1.06 — measured on my own
count) **and the convergence** (`wantsCrate`, one decider, now held by `scripts/qa/one_buy_decider_check.mjs`).
**NOT SHIPPED: his cheap-crate rule**, with the numbers above written into the engine beside where it would go.
**The audit's real finding stands and is the next piece of work:** the objective (`tour3`) is a function of
`needs()`, so an off-recipe crate is worth structurally zero — a spare can never pay until the objective can see it.
