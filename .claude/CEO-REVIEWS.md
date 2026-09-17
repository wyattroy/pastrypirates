# CEO reviews — newest at the top, append-only

Never edit an old verdict. A review that turned out wrong is evidence about the reviewer and belongs here exactly as written.
Each CEO is handed the previous verdict so it can say whether the same fault is *recurring* — a verdict nobody recorded is a
recurrence check nobody can run.

---

## 2026-09-16 · the architecture audit list · `sep16-architecture-cleanup` @ `1ea8705a` · A REAL LIST: ALL 13 TOP ITEMS ARE REAL. SEVEN CORRECTIONS BEFORE IT COUNTS AS CEO-VERIFIED; ITEM 1 CAN START NOW

**His ask, verbatim:** *"get the Wy:Blade to run a full audit of all architectural inconsistencies to create an itemized, CEO-verified list of how to clean them up. then verify it, and have it do this work in a separate branch off yours. end with a sea trial to make sure it did not break anything, and report to me your findings."* — and his clarification: *"By architectural inconsistencies, I mean exactly the work that we just did in this session about where functions are used only once, but in multiple different places."*

**What I did.** I read the brief and all 455 lines of the list. Then I opened the cited lines myself for every Tier 1 item and for 12 items from Tiers 2–4. I opened one of the author's sea-trial screenshots (`sea-trial-shots/solo-desktop-013-settled.png`). I used only git, grep and file reads, and changed nothing. I did not fetch, run node, open a browser, start a server or run `npm test`. Git facts below come from this machine's last fetch, at 20:51 today.

**Items I opened myself:** Tier 1: **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13** (all 13). Tiers 2–4: **14, 15, 16, 17, 18, 19, 20, 22, 29, 31, 38, 40** (12). For item 21 I read only the redraw line.

### One sentence for Wyatt
**The list is honest and its biggest finding is real: in every real game, a human who fires two heads in a crosswind is still offered "Fire again", against your ruling. But seven things in the list need fixing first, including one item (the "recipe stowed" card) whose fix as written would leave a double card in pass-and-play.**

---

### 1. Each thing he asked for

| His ask | Verdict | Evidence |
|---|---|---|
| A full audit of every fact decided in more than one place ("functions used only once, but in several places") | **DONE** | Every item I opened is one game fact decided in two or more places. Item 16 is the exception: a typed number, not a copy. I found one small copy the auditors missed (question E). |
| Itemized | **DONE** | 42 items. Each names the fact, the places, the one place, a check (a gate) and before/after counts. |
| CEO-verified | **PARTIAL** | This review. The copies are real; the seven corrections are below. |
| "Then verify it" | **PARTIAL** | The session re-ran four numbers. It says itself that it did not re-read most cited lines. I did, for 25 items, and the line numbers are accurate. So the gap cost nothing this time. |
| Do the work in a branch off yours | **Branch made; no work done** | `origin/sep16-architecture-cleanup` = `1ea8705a`, one commit on top of `c7833097` = `origin/dev`. No cleanup commits yet, by design: Mac: Dev picks the items. |
| End with a sea trial | **NOT DONE** | The newest sea-trial report (a test voyage run to catch breakage) is still build 2026.09.13.5, and it FAILED. There is nothing new to sail yet. |
| Report findings to him | **NOT DONE** | |

### 2. Delivered but not asked for
- **Gates whose names promise more than they check** (list lines 50–55). This is useful, and every item it touches needs it.
- **A dead-code list, marked out of scope.** Harmless, but it contradicts two items (question D).
- **The two CEO verdict files** (`.planning/CEO-REVIEWS.md` and `.claude/CEO-REVIEWS.md`). A real process fault, rightly raised.

None of this pushed out the cleanup. The cleanup is simply waiting on Mac: Dev's choice.

---

### A. Real second copies? (every Tier 1 item)

| # | Verdict | What I saw |
|---|---|---|
| **1** The fight | **REAL** | **The re-fire:** the real fight's loop has no crosswind test (`orchestrator.js:783-799`); the engine's has one (`engine/index.js:1975-1976`). **The flee:** the engine's squares exclude the current (`engine:1956`, which uses `:1777`); the real fight's include it (`orchestrator.js:734`, using `flow.js:361`). **The plunder:** the real fight has no "wanted by another captain" step (`orchestrator.js:847`); the engine does (`engine:1858-1861`). **The bookkeeping** lines match the list exactly. **The rules page** still sells the re-fire: "If the shot doesn't tell, the attacker may pay 2🌕 to load another broadside" (`rules.html:122`). |
| **2** Voyage start | **REAL** | **Purses:** the game staggers them (`orchestrator.js:1395`); the engine gives everyone 3 (`engine:271`). **Day start:** the engine's record has no `streak` (`engine:3237`); the game's does (`orchestrator.js:1442`). **Day cap and crowning:** written three times (`engine:3234, 3263`, `orchestrator.js:1437`) and twice (`engine:3316-3326`, `orchestrator.js:1473-1490`); both copies agree today. |
| **3** Whose turn | **REAL, and seen** | The top bar reads the prompt slot (`stage.js:1571`). The ring reads the event history (`board.js:2558`). I counted the callers of the one writer: exactly 19, as claimed. **In the screenshot:** the top bar lights the pink boat, Davy Scones, who is guessing the winner. The captains box and the board ring mark Flaky Jack, the orange attacker. |
| **4** Fight camera | **REAL, and stronger than "inferred"** | The camera hold is released only by `battleEnd` (`stage.js:5955`), and its only caller is `orchestrator.js:603`, on the screen that runs the fight. A guest turns the hold on (`flow.js:3588`) and nothing ever turns it off. So on a guest, `stage.js:1841` holds the camera for the rest of the voyage. That is certain from the code; only the look on screen is unwatched. |
| **5** End of voyage | **REAL** | The host does it one way (`orchestrator.js:1518-1586`), the guest another (`:948-971`). Confetti is called only at `:1585`, on the host. The guest marks the end as handled before it reads the numbers, then gives up if they are missing (`:949-952`). |
| **6** Flip spin sound | **REAL in code; nobody has heard it** | On a solo host, a bot's fight flip starts the spin sound twice. First route: `orchestrator.js:670` → `board.js:3227`. Second: the one event door's flip check at `orchestrator.js:1917` passes, because a bot's flip never counts as "decided on this screen" (`storyboard.js:213-214`), so `dockcoin.js:129` starts it again. Starting the sound again cancels only the repeat timer, not a sample already playing (`audio.js:999-1000`). I counted the call sites: 11, as claimed. |
| **7** Sail route | **REAL** | A bot may move into the current (`engine:876`), but its drawn route is asked for without the current (`engine:3005`, `flow.js:3207`). The route finder returns nothing when it cannot reach the square (`engine:762-763`), so nothing is drawn (`storyboard.js:162-163`). |
| **8** Guest fight lines | **REAL (read)** | A guest drops every line during a fight (`orchestrator.js:2250`, `:474`). The host sends the "…is waiting to defend" line (`:549`) but never draws it on its own screen (`:243-250`). |
| **9** Fight's ending line | **REAL (read)** | **With no crow's-nest callers** (a 2-captain game), the win line is said at `orchestrator.js:866`. The bets step returns at once (`flow.js:3635`), and `flow.js:2891` says the same line again. **With any caller**, the flee exit says nothing (`orchestrator.js:827`). The last event is then a bet, which the narrator skips (`util.js:1929`), so "Davy Scones slips away!" is never said. |
| **10** Recipe via two pipes | **REAL pipes; the doubled card is unproven** | Written twice: `orchestrator.js:1055-1056`. Watched on every screen: `:2796`, `:2841-2853`. But its claim that every device "may raise [the card] twice" (list line 213) contradicts item 11's "A guest gets one" (line 223). |
| **11** Recipe-stowed card | **REAL** | The event door shows the card, and the card spends its lesson straight away (`flow.js:1367`). Then the host loop checks the lesson again, finds rung 1 still has words (`orchestrator.js:1077`), and shows a second card (`:1079`). |
| **12** Dotted course | **REAL, but narrow** | Cleared for everyone only on the computing screen (`flow.js:2944`) and on moves (`orchestrator.js:1897-1898`). The other clears run only with the parrot off (`flow.js:703, 796`). Only a crew guest with the parrot on who stays put would ever see it. |
| **13** Attack/trade reasons | **REAL** | Attack targets are not filtered for captains at the ovens (`flow.js:2574`), and the reason is picked by elimination (`:2650-2651`). Beside a baker (`engine:1903`), a captain with a full hold is told "holds are empty". **Trade** counts a baker's crates (`flow.js:2600`), but the hail itself excludes them (`engine:1211`, `:3060`). |

**Spot checks, Tiers 2–4:**
- **Real:**
  - 14: bots and humans end the turn differently after a refused hail (`engine:1691`, `:1735`, `:3015`; `flow.js:3117` vs `:3171`).
  - 15: the live bot asks every holder (`flow.js:3067`) while the engine asks only its audience (`engine:1688-1690`); a typed `1.1` sits at `flow.js:3159`.
  - 17: the re-watch price is decided three times (`engine:3144`, `flow.js:1014`, `orchestrator.js:2163-2171`).
  - 18: the watcher's camera frame leaves out the current (`stage.js:283-285`), while the comment above it says the two "agree by construction".
  - 19: the "head of the current" line is said only at `flow.js:3036`.
  - 20: a coins-only counter is added to the coins already offered (`engine:1346`), so the full-purse slider (`flow.js:2166`) can ask for more than the asker has. The proposed rule fits his playtest-21 ruling (`flow.js:2185-2199`).
  - 22: resuming a voyage drops `bake2`/`endcard` from the save (`util.js:2321-2327` vs `flow.js:3743`, `:3755`).
  - 29: `engine:986-987` itself says "change the two together".
  - 31: the dock record is written twice (`engine:1109-1112` vs `flow.js:2050-2053`); the human copy never sets `justDocked` (`flow.js:2072`).
  - 38: a doubled guard, trivial (`panel.js:240` vs `orchestrator.js:1638`).
  - 40: captain colours in three places (`shared/index.js:770`, `index.html:48`, `index.html:4069-4072`).
- **PARTLY: item 16.** One of its three "places" is `strikeFrom` (`engine:1806-1818`), which is dead. It is reached only through `chooseTarget`/`chooseAction` (`engine:2295`, `:2910`), and only `scripts/bot_ladder.js:56, 65` call those. The list's own dead-code line (445) says the same. Another "place" is "the real rules", which is not a place. What is left is one typed number (`engine:2822`): a *"nothing is a constant"* fault, not a copy.

### B. Is each "one place" really one?
- **Item 1: PARTLY.** Every rule becomes one engine step, which is right. But *when* a defender may flee (both tails: `orchestrator.js:733`, `engine:1948`) and the re-fire loop (`:783`, `:1979`) stay in both fight runners. The list admits this only in its summary (line 41). His crosswind ruling was exactly this kind of rule, so item 1 should name a "may the defender flee" step, or say plainly in its own text that the order stays copied.
- **Item 2: nearly.** It routes `play()` and `runLiveNet` through the new steps but never names `playClassic` (`engine:3260-3263`). That loop holds one of the three day caps the item counts.
- **Item 11: NOT as written.** The host loop carries a "one card per device" rule (`break`, `orchestrator.js:1080`); the event door's copy (`:1849`) has none. Delete the loop without moving that rule and a pass-and-play table with several humans still spends one lesson rung per human, showing a card each time.
- **Item 9: nearly.** "A no-narrate form" of the bot's pause adds a second version beside `botBeat` (`util.js:1821-1825`). A small special case.
- **Items 3–8, 10, 12–15, 17–20, 22, 29, 31, 38, 40: genuinely one.** In each, the copies are deleted and every path goes through the new place. Item 3 correctly splits "whose turn" from "who is being asked".

### C. Is the ranking honest?
- **Visible today, by the code (only item 3 has actually been seen, in the one screenshot):**
  - item 1 (the "Fire again" offer)
  - item 3 (whose turn: seen in the screenshot)
  - item 4 (a guest's camera frozen after its first fight)
  - item 5 (a guest gets no confetti)
  - item 9 (his flee line never said at a 4-captain table)
  - item 11 (every first-time player gets two cards)
- **Weaker than Tier 1:**
  - item 2 (only the rules page is wrong on screen)
  - item 6 (nobody has heard it)
  - item 10 (it contradicts item 11)
  - item 13 (rare)
  - **item 12 belongs in Tier 3** (crew guest + parrot on + stays put)
- **Items 1 and 2 first:** item 1 is defensible on both grounds. Item 2 is defensible only as the request it was, and the list says so plainly (line 34).
- **Nothing in Tiers 3–4 is clearly more visible than its rank.** Items 20 and 21 are the closest.

### D. The claims
- **Backed:**
  - the four re-runs
  - item 3's sea-trial screens: the pictures exist, dated 15 Sept 02:37–02:48, and the one I opened shows the split
  - the counts of 19 callers (item 3) and 11 call sites (item 6), both exact
- **Labelled "measured" but done only by an auditor, and the item doesn't say so:** item 1 ("61… 49… 33"), 7, 14 and 15. Items 16 and 18 do say "(auditor)"; these four should too.
- **Readings labelled "measured":**
  - item 19's "measured by grep"; by the list's own definition (line 17) that is a reading
  - item 16's "priced fleeing at 0 in all 316", which is what `engine:2822` says, not a run
- **Counts padded with dead code:** item 13's "range 6" and "affordability 5" each include `strikeFrom` (`engine:1808`, `:1812-1815`).
- **Contradiction:** item 10 (line 213) and item 11 (line 223) disagree about what a guest sees.

### E. Missing
- **"The tap starts the spin" is written once and missing twice.** The ordinary flip starts the spin the instant it is tapped (`flow.js:221`, `:231`, "THE TAP IS THE FLIP"). Both fight-flip taps skip it: the host's own screen (`orchestrator.js:547-549`) and a guest's (`:2070-2071`). On the host the spin follows at once (`:651`). A guest's own fight flip waits for the host's round trip over the network (`:169-171`). Read, not run; the flip stage may hide it.
- **Nothing large.** In the fight and the host/guest paths, everything else written twice that I came across is already in the list.

---

### 3. Claims the repo does not support
All of these are in D and B: the four auditor-only "measured" labels, item 19's grep, item 16's reading, the dead code in items 13 and 16, the item 10/11 contradiction, `playClassic` missing from item 2, and item 11's one place losing "once per device".

### 4. The last verdict's fault
**Not fixed, and correctly inventoried.** The fight written twice is item 1, and the dock record written twice is item 31. No code has changed yet. The top-bar mismatch the last CEO saw in the host/guest pictures is item 3, and the screenshot I opened confirms it.

### 5. Bulk reading in the main thread
**None I can name.** The reading was handed to six auditor agents, and the session kept four re-runs and two short reads (`DECISIONS.md:3009-3011`, `PROJECT.md:267`). The opposite risk, vouching for citations it had not read, cost nothing this time: the ones I checked are accurate.

### The seven corrections, before this counts as CEO-verified
1. **Item 11:** move the "one card per device" rule into the one event door, not just delete the loop.
2. **Item 12:** move it to Tier 3.
3. **Items 13 and 16:** take out the dead `strikeFrom` copies. Re-describe item 16 as a typed number (PARTLY).
4. **Items 10 and 11:** state the contradiction about guests. Take the two-tab look before starting item 10.
5. **Items 1, 7, 14 and 15:** mark their numbers "auditor, not re-run". Relabel item 19 and item 16's "0 in 316" as readings.
6. **Item 2:** name `playClassic` in its one-place plan.
7. **Item 1:** name the defender's flee condition and the loop as copies that stay, in the item's own text. Add the spin-at-tap copy from E as a candidate.

**Item 1 may start now**, opening with Mac: Dev's crosswind "Fire again" picture taken before the fix.

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
