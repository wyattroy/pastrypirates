# Coin-floor audit — can a captain's purse still go below zero?

**Written:** 2026-07-29 · **Prompted by:** F12 (`15-PLAYTEST-NOTES.md`), the one playtest finding that
corrupted game state rather than wording.

F12 asked a second question that this report answers and deliberately does **not** act on: *can any
other path drive a captain's coins below zero, and does a central non-negative invariant belong
somewhere?* Every coin debit outside `src/engine/index.js` is audited below, plus the engine's own
for comparison. **No guard is implemented here.** The recommendation at the end is Wyatt's to rule on.

---

## The headline, in one paragraph

F12 was not a one-off arithmetic slip. It was the **first visible instance of a structural pattern**
that recurs at seven UI debit sites:

> Affordability is checked when the option list is *built*. The player then has up to 30 seconds to
> click. The purse is debited *after* the click. Nothing re-checks affordability in between — and the
> shot clock's 20-second penalty fires inside exactly that window, taking a coin from the very seat
> that is deciding.

The engine cannot do this, and the reason is structural rather than careful: `Game.play()` is
**fully synchronous**. There is no `await` anywhere between an engine affordability gate and its
matching debit, so no timer can interleave. Every UI debit, by contrast, is separated from its gate
by at least one `await ask(...)`. That single difference explains every AT RISK verdict below.

F12's own fix (`counterHeadroom()`, commit `f40f2f9`) closes the *double-count*. It does **not** close
the *interleave* — those are two separate causes that happened to meet at the same line.

---

## The shot-clock interleaving hypothesis — CONFIRMED, not refuted

The plan asked for this to be confirmed or refuted by name. It is **confirmed**, and it is reachable
in ordinary play with no unusual setup.

The mechanism, read end to end:

1. `ask()` (`src/ui/util.js:900`) calls `armClock(seat)` and wraps the decision in
   `withShotClock(seat, base, 0)`. The clock is armed for the **deciding** seat for the whole
   duration of the prompt.
2. `shotClockTick()` (`src/ui/util.js:1071`) fires every 500 ms. At 20 seconds elapsed it calls
   `applyShotClockPenalty()` once (guarded by `shotClockFired.t20`).
3. `applyShotClockPenalty()` (`src/ui/util.js:1078`) takes `Math.min(1, p.coins)` from the deciding
   seat and gives every other live player `+1`. **The penalised seat does not receive the `+1`** —
   `others` excludes it.
4. The pending `ask()` then resolves with an option that was priced against the **pre-penalty** purse.
5. The settlement debits that pre-penalty amount. Nothing re-validates.

`appState.turnExpired` does **not** protect against this. That flag is set at **30** seconds
(`onExpireShotClock`), and every guard in the codebase checks it. The coin penalty fires at **20**
seconds and sets no flag at all, so the many `if(appState.turnExpired)return;` lines sail straight
past it.

**Shortest reproduction (dock-buy, the cheapest of the four):**

1. Multiplayer, timer on, a human captain with **exactly 3 coins**.
2. Dock at an island that still has stock; flip **tails**.
3. The "Tails! Take 3🌕 — or buy … for 3🌕?" prompt appears.
4. **Wait past 20 seconds.** The penalty fires: purse 3 → 2. Every opponent gains 1.
5. *Now* click **Buy**. `src/ui/flow.js:463` debits 3 against a balance of 2 → **−1**.

The same five steps reproduce at the storm-anchor prompt (1 coin), the trade counter (any pledge),
and the side-bet stake. Each is listed individually below.

**One consolation and one aggravation.** The penalty can only fire once per decision
(`shotClockFired` is reset by each `startShotClock`), so the overshoot is exactly 1 coin per
interleave — it cannot cascade within a single prompt. But because the penalty is *silent from the
purse's point of view* and the tradeBonus/other credits often mask it, the resulting negative is as
easy to miss as F12's was.

---

## Site-by-site

Line numbers were re-confirmed against the working tree today, not trusted from the plan.

### `src/ui/flow.js`

| # | Site | Line | The guard that protects it | Verdict |
|---|---|---|---|---|
| 1 | `humanTrade` counter-demand | `:585` | **The found instance.** Was `Math.min(shortfall,p.coins)`; now `counterHeadroom(shortfall,p.coins,give.coins)` — capped against *unpledged* coins, floored at 0 | **FIXED** (`f40f2f9`) for the double-count, but **AT RISK** for the interleave — see #2 |
| 2 | `humanTrade` counter, interleave | `:585` | none — `askFor` is computed, then `await ask(...)`, then `p.coins-=give.coins+askFor` | **AT RISK** |
| 3 | `humanTrade` accepted offer | `:618` | `coinChoices=[0..6].filter(n=>n===0\|\|p.coins>=n)` — correct **at the moment the list is built** | **AT RISK** |
| 4 | dock buy on tails | `:463` | `p.coins>=3` in the branch condition at `:459`, then `await ask(...)`, then the debit | **AT RISK** |
| 5 | storm dodge / anchor | `:308` | `if(p.coins>=1)` pushes the "pay" option at `:285`, then `await ask(...)`, then `p.coins--` | **AT RISK** |
| 6 | aground half-loss | `:316` | `Math.max(1,Math.floor(p.coins/2))` inside an `else if(p.coins>0)` branch. With `coins>=1` the loss is at most `coins`; at `coins===1` it is exactly 1 → floor 0. Arithmetically closed | **SAFE** |
| 7 | human sail step (action menu) | `:689` | `reachable(p)` is computed from `sailBudget(p)`, and the branch is only entered with coins available; but `await pickCell(...)` sits between the gate and `p.coins--` | **AT RISK** |
| 8 | human sail step (turn start) | `:778` | same shape as #7 — `await pickCell(...)` between gate and debit | **AT RISK** |
| 9 | bot sail step | `:858` | `if(wantsToSail&&p.coins>0)`, debit **immediately**, no `await` in between; and `p.coins++` refunds a no-op move | **SAFE** |
| 10 | bot hail settlement | `:911` | `priceHailOffer()` clamps by purse-minus-`HAIL_RESERVE` (`:795`) — its own header calls the clamp "the bankruptcy guard … not optional" — and `raises` re-filters on `n<=p.coins-HAIL_RESERVE`. The debited party is the **bot**; the clock is armed for the *human*, and the penalty **credits** non-deciding seats, so the bot's purse only grows during the window | **SAFE** |
| 11 | side-bet stake settlement | `:1101` | `amounts=[1,2,3,5].filter(n=>s.coins>=n)` plus an all-in option, chosen inside `collectSideBets`; settled at `settleSideBets` after the **entire battle** | **AT RISK** |

**On #11, the widest window in the codebase.** The stake is validated in `collectSideBets` and not
debited until `settleSideBets` runs after the battle resolves — dozens of awaits later. A bettor who
goes all-in at 3 coins and is penalised during their own side-bet prompt (3 → 2) loses 3 on a wrong
call and lands at **−1**. Note this is *not* rescued by the penalty's `+1` to others: the penalised
seat is excluded from `others`, and it is the penalised seat that placed the oversized bet.

**On #5, the asymmetry the plan asked about.** The UI requires `p.coins>=1` to offer paying 1 coin
to anchor. `src/engine/index.js:286` requires `p.coins>=3` to pay the same 1 coin. **This is not a
bug and not an inconsistency of intent.** The engine's `>=3` is a *bot strategy* threshold — "only
spend on anchoring if comfortably solvent" — sitting in `Game.windPush`'s bot path. The UI's `>=1` is
a *solvency* gate for a human's free choice. Two different jobs. The UI is nonetheless the one that
sits exactly on the boundary, which is precisely what makes it vulnerable to the interleave.

### `src/orchestrator.js`

| # | Site | Line | The guard that protects it | Verdict |
|---|---|---|---|---|
| 12 | shot-clock skip forfeit | `:253` | `Math.min(5,p.coins)` — arithmetically closed | **SAFE** |
| 13 | battle powder | `:402` | **No local guard.** Relies on callers: `humanAct:703` carries an explicit D-40 safety net, and `chooseAction` gates the bot's attack on `p.coins>=cfg.powder` *after* the sail debit (`botTurn:101` runs after `:858`), so the ordering is correct. But `asyncBattle` itself has `await flash(...)` at `:401` immediately before the debit at `:402`, and unlike the engine it carries **no** solvency check of its own | **NEEDS A SECOND PAIR OF EYES** |
| 14 | battle flee | `:545` | `def.coins>=1` in the branch condition at `:538`, then `await ask(...)` for a human defender, then `def.coins--` | **AT RISK** |
| 15 | battle spoils — raider | `:567` | `Math.min(2,lose.coins)` — arithmetically closed | **SAFE** |
| 16 | battle spoils — coins mode | `:578` | `Math.min(5,lose.coins)`, and the `>=5` sibling at `:571` is explicitly gated | **SAFE** |

**On #13.** The engine's own `battle()` is stricter than the UI's: `src/engine/index.js:524` reads
`if(c.powder){if(att.coins<c.powder)return null;att.coins-=c.powder;}` — it refuses the battle
outright rather than trusting its caller. `asyncBattle` does not. Today that gap is covered by both
callers, so it is not a live defect; it is a **missing belt to go with the braces**, and the one place
in this audit where the UI would clearly be improved by copying the engine verbatim. Flagged rather
than fixed, because it is the one item where I am not certain a `return null` mid-`asyncBattle` is
safe for the network path (a broadcast battle snapshot may already be in flight).

### `src/ui/util.js`

| # | Site | Line | The guard that protects it | Verdict |
|---|---|---|---|---|
| 17 | shot-clock penalty | `:1082` | `Math.min(1,p.coins)` — arithmetically closed, cannot itself go negative | **SAFE in isolation** — and it is the *cause* of six of the AT RISK verdicts above |

That last row is the whole point of this report. The one debit that is provably safe on its own is the
one that breaks six others, because safety was reasoned about per-line and the defect is between lines.

### `src/engine/index.js` — for comparison

| # | Site | Line | The guard that protects it | Verdict |
|---|---|---|---|---|
| 18 | storm dodge | `:286` | `p.coins>=3` to pay 1; synchronous | **SAFE** |
| 19 | aground half-loss | `:290` | `p.coins>0` + `Math.max(1,floor(coins/2))`; synchronous | **SAFE** |
| 20 | dock buy | `:406` | `p.coins>=3` in the same expression as the debit; synchronous | **SAFE** |
| 21 | trade settlement | `:454` | `price` bounded upstream; synchronous | **SAFE** |
| 22 | battle powder | `:524` | `if(att.coins<c.powder)return null` — refuses rather than trusting the caller | **SAFE** |
| 23 | battle flee / spoils | `:553`, `:568`, `:571`, `:574` | `Math.min` throughout, plus an explicit `>=5` gate; synchronous | **SAFE** |

**The engine has no AT RISK rows, and not by luck.** It has no `await`, therefore no window. This is
worth stating plainly because it also means: **nothing in this report threatens the 31 determinism
fixtures.** Every AT RISK verdict is on a path `Game.play()`'s headless corpus never executes.

---

## Tally

| Verdict | Count | Sites |
|---|---|---|
| **SAFE** | 13 | 6, 9, 10, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23 |
| **AT RISK** | 8 | 2, 3, 4, 5, 7, 8, 11, 14 |
| **NEEDS A SECOND PAIR OF EYES** | 1 | 13 |
| **FIXED this session** | 1 | 1 (F12, `f40f2f9`) |

Eight live paths can still take a captain below zero. All eight share one cause. **None is fixed in
this commit** — that is deliberate; see below.

---

## Recommendation

Three options, weighed. One recommended. **The choice is Wyatt's, not mine.**

**(a) Do nothing.** Cheapest, and defensible on the evidence: reaching any of the eight needs a
player to sit on a prompt for a full twenty seconds while at an exact coin boundary, which is why
only one instance surfaced in a whole playtest. *But* it leaves a state-corruption class open in a
game that has already shown it once, and a negative purse is not cosmetic — it silently changes what
every later affordability gate decides.

**(b) A development-time assertion at each debit site.** Catches the whole class at the moment of
corruption with the exact site named, which is what turns "my coins look wrong" into a one-line
diagnosis. *But* it is eight-plus edits across three files for something that only speaks up while
developing, and it does nothing for a player mid-game.

**(c) A headless invariant asserting no player's coins go negative across the 31 determinism
fixtures.** One new gate, no source edits, permanent, free to run. *But* — and this is decisive —
**it would not have caught F12 and cannot catch any of the eight.** The fixtures only exercise
`Game.play()`, the fully synchronous engine path, which is precisely the path already proven safe.
It would pass on day one and stay green while every real defect remained. It tests the one place the
bug cannot be.

**Recommended: (b), narrowed — but with one correction to how the problem is framed.**

Option (b) as written treats this as eight independent debit sites. It is not; it is **one missing
step repeated eight times**: re-validate affordability *after* the await, immediately before the
debit. So the recommendation is (b) applied as a single shared helper — one small function that takes
the intended debit and the current purse and either clears it or reports the shortfall — called at
each of the eight sites, plus copying the engine's `if(att.coins<c.powder)return null` into
`asyncBattle` for site 13. That is a mechanical, reviewable change with a real test surface, and it
converts a silent negative into a caught one.

**Two things worth knowing before ruling.** First, one of the eight closes itself for free: Task 8 of
this plan adds a D-40 affordability guard to the dock-buy purchase, which is exactly the re-validation
described above, so site 4 will already be fixed by the time you read this. Second, there is a cheaper
partial alternative not among the three offered, and it should be on the table: **make the 20-second
penalty set a flag the way the 30-second expiry does.** Every debit site already checks
`appState.turnExpired`; a sibling flag meaning "your purse changed while you were deciding" would let
the existing guard pattern cover most of the eight without touching the arithmetic at any of them.
It is less thorough than the shared helper and more surgical than doing nothing.

**Not implemented here, in any form.** F12's own fix is committed and tested; everything in this
report is a finding awaiting Wyatt's ruling.
