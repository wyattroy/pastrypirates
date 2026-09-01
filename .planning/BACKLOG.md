# BACKLOG — everything deliberately NOT done before the cutover

**Created 2026-08-26** when Wyatt called the cutover: *"Only game stopping blocker bugs must be
solved before the cutover; everything else should be added to a durable backlog file for future
processes."*

**There was no standalone backlog file before this one** — only a `## Backlog` section inside
`ROADMAP.md`, which is milestone-scoped and gets archived with its milestone. **This file is not.**
It outlives milestones on purpose.

**How to use it:** add anything you decide not to do, with WHY it was deferred. Nothing here is
forgotten-by-accident; everything here is deferred-on-purpose, which is a different thing and the
whole reason the file exists.

---
---

# 🚩 THE CTO WORK LIST — Wyatt's playtest, 2026-08-27

**Build played:** `2026-08-26k-CUTOVER-STAGING/aug26-night-fixes@b8d61e42`, on his phone, over
staging. **All 13 checklist items were reported.** 5 passed, 7 problems, 1 (solo) passed with a note.

**THIS SECTION IS THE CTO'S ONLY MANDATE.** Wyatt, 2026-08-27: *"CTO only executes things that have
been added to the backlog — it won't, for example, change the rules of the game, or change it in
ways that we have not agreed upon."* An item that is not in the table below is not work. When the
table is empty of unstarted items, **the CTO stops and writes proposals; it does not promote its
own ideas.**

**32 items** (31 of his, plus one stale engine comment found while checking his numbers). Waves are the proposed order — Wyatt approves or reshuffles, and the order is his.

> **The one argument I'd make against my own ordering:** Wave 1 is the architecture because he chose
> it directly (*"Go straight at the guest architecture"*, 2026-08-27). **Wave 2 would buy more felt
> improvement per hour** — nine copy fixes, all cosmetic gear, all safe, all noticed immediately. If
> the goal is "the game is noticeably better when I return", swapping waves 1 and 2 does that
> faster. His call.

## Wave 0 — unblock (3) · these remove obstacles from HIS path, not the player's

| # | Item | Gear | Note |
|---|---|---|---|
| W0-1 | **Skip straight to the endgame for testing.** A URL he can type on his phone that drops him into a bake-off SECOND attempt, and one for the End of Voyage card. | plumbing | **Four of his PROBLEM marks (#3, #4, #5, #6) are marked PROBLEM only because he could not get there.** Follows the existing `?bakeoff=1` / `?ovens=1` / `?wind=1` pattern (`src/shared/index.js:433,478`). ✅ **DECIDED 2026-08-27: staging and localhost ONLY** — never production. `devHost()` (`src/shared/index.js:465`) is localhost-only today; widen it to include `staging.playpastrypirates.com`. **A player on the live game must not be able to reach the end card by URL.** |
| W0-2 | **`Copy my notes` takes two clicks.** First opens the box; second copies. | n/a | `.planning/staging-checklist.html:160` builds the text and opens a `<dialog>`; `:172` does the copy. Make the first click do both, dialog becomes confirmation. |
| W0-3 | **Reformat the build stamp.** Currently `v4 · build 2026-08-26k-CUTOVER-STAGING/aug26-night-fixes@b8d61e42` — long, and "v4" no longer means anything. | cosmetic | **DECIDED 2026-08-27: date-based build number** — `Build 2026.08.27.3`, staging appends `-staging`. `src/ui/stage.js:33,1998`; the staging suffix is written by `scripts/deploy-staging.sh:171`. |

## Wave 1 — the guest/host split (4 bugs, ONE cause) · HIS PICK

> ### ⚠ SCOPE SET BY WYATT, 2026-08-28. THIS IS BIGGER THAN THE FOUR BUGS BELOW.
>
> *"fix all the described architecture so both host and guest listen to one game activity engine"*
> and, when told the prompt forks were blocked on the 30-second clock:
> *"i'd prefer to do it even if it breaks shot clock, and to temporarily remove the shot clock from
> the game. include the bakeoff in this work too — everything should come from one game activity
> engine."*
>
> **THREE RULINGS, and the second one is what makes the rest possible:**
> 1. **ALL of it**, not the event half. The four open prompt forks (2, 3, 4, 5 in
>    `docs/DISPLAY-RULES.md` §4) are in scope, and so is the bake-off.
> 2. **THE SHOT CLOCK COMES OUT, temporarily.** Rule C — *"`withShotClock()` needs a plain Promise,
>    nothing else"* — is the single constraint that made a prompt unable to simply loop back like an
>    event, and it is the reason four forks stayed open. He chose to remove the obstacle rather than
>    engineer around it. **It is already off in play** (`startShotClock` returns early on
>    `timerOff`, `src/ui/util.js:1896`; the clock pill reads "⏱ off" in every screenshot), so this
>    removes something no player currently meets.
> 3. **Temporarily.** It goes back afterwards, against a converged dispatch, which is a much easier
>    problem than racing two.
>
> **THE SHAPE, in his words: ONE GAME ACTIVITY ENGINE.** One consumer, three producers:
> `Game.ev()` is where every event is born (`src/engine/index.js:316`); `pushEvents()`
> (`src/orchestrator.js:1484`) is where the host drains them to Firebase; `watchEvents()`
> (`:1573`) is the guest's consumer and already holds the whole drawing sequence — sweep, render,
> pops, audio, end-meta. Converging means **the host reads its own mail through that same
> consumer**, and solo/pass-and-play — which have no wire at all — feed the identical consumer from
> the drain. **The host's inline drawing in the game loop is what has to GO**, and that is where
> the regressions will be.


**The cause, in one line: the host has a script; the guest has a news feed.** The host's screen is
drawn by a loop that walks the whole performance in order. The guest's is drawn by nine independent
Firebase listeners reacting to published facts. **Anything the host does BETWEEN two publishes never
crosses the wire, so the guest cannot reproduce it** — it jumps, because it was only told the
destination.

**Wyatt's chosen approach, 2026-08-27: option B — "the host reads its own mail."** The host
publishes every event and then draws from its own listener, identical code to a guest. One display
path, literally. **This is the biggest of the three options and it touches the 30-second shot clock
and every prompt promise** (`docs/DISPLAY-RULES.md` Rule C) — which is where this codebase breaks.

> **THE SCOPING INSIGHT, and it is what makes B survivable.** There are two kinds of traffic, and
> they are not the same job:
> 1. **Events** — things that HAPPENED (sail, dock, flip, newround, end). One-way, fire and forget.
>    **These loop back cleanly**, and all three movement/camera bugs below live here.
> 2. **Prompts** — things a captain must ANSWER. Request/response, need a promise that
>    `withShotClock()` can race. **These cannot simply loop back.** They are the six forks in
>    `docs/DISPLAY-RULES.md` §4 — two converged, four open — and they are their own piece of work.
>
> **Do the event stream first.** In solo `appState.room === null`, so there is no wire — B needs a
> LOCAL bus that behaves identically with or without Firebase. One bus, three producers (engine,
> Firebase, replay), one consumer (the director).

| # | Item | Verified? |
|---|---|---|
| W1-1 | **Guest does not animate boats square by square** — host, solo and pass-and-play all do. | ✅ **MEASURED 2026-08-27.** The host glides the route (`src/ui/flow.js:1185`); `watchEvents` (`src/orchestrator.js:1572`) calls `animateRimSweepIfAny()`, gets `false` for an ordinary sail, and goes straight to `render()` — which snaps. |
| W1-2 | **During a storm the host steps one square at a time; the guest jumps to the end point.** Two paths where there should be one. **And once converged, make the one function move directly to the end point** — Wyatt's explicit pick. | Not yet measured. Same family as W1-1. |
| W1-3 | **The director does not follow a guest's boat through the trade winds** — it correctly follows the host's. | ⚠️ **CAUSE UNKNOWN — an earlier guess was WRONG and is corrected here.** The rim sweep AND its camera call (`window.__pp4.sweepCam()`, `src/ui/flow.js` in `animateRimSweepRun`) are **already shared by both tiers**. So "the guest has no sweep animation" is false. Measure before theorising. |
| W1-4 | **Sail squares a guest cannot tap** — cut off at the screen edge, first tap-to-sail, crew, phone. | ⚠️ **THE RECORDED CAUSE MAY BE THE WRONG ONE.** The standing entry below says *"sailCell covered by `#pp4Cap`"*. **In Wyatt's 2026-08-27 screenshot the captains panel is nowhere near the lowest sail square** — the failure is the board's left column cut by the screen edge, with a partial element sliced at the bezel. The known race (`flow.js:620` draws, asks the camera 180ms later; `stage.js:124` lets it refuse while a card is up) is still the best lead. **See the standing entry: "TOP OF THE LIST — sail squares a guest cannot tap".** |

## Wave 2 — the words (10) · cosmetic gear, safe, felt immediately

> **SWEPT 2026-09-01 — ALL TEN ROWS ARE SHIPPED.** The 2026-08-29 sweep note above explicitly left
> this wave unread ("not swept... not to be read as open or closed"); checked now against the
> current source, all ten already carry their fix, most from `b92641ef` (five of the ten, one
> commit, four agents) and the rest each in their own commit. Every row below now points at real
> evidence (a commit or a line) rather than restating a verdict — a pointer cannot go stale, a copy
> always can.

| # | Item |
|---|---|
| ~~W2-1~~ | ✅ **CLOSED — his own ruling (A-9, 2026-08-28) reformed the narration line**, resolving the ambiguity this row itself raised ("narration or the pill?"). `commit 693c2b0b`; current text at `src/ui/util.js` `EVENT_NARRATION.newround`: `Day {round}: Wind {DIR}.` + `Tomorrow: {DIR}.` — matches his spec. The wind pill was not part of his ruling and is unchanged. |
| ~~W2-2~~ | ✅ **CLOSED — his exact sentence, verbatim.** `commit b92641ef`; `src/ui/panel.js` around :1154 reads *"Sold-out islands fly the black market flag. They'll find ye one more ingredient — for 10🌕."* — the price derives from `cfg.blackMarket`, not typed. |
| ~~W2-3~~ | ✅ **CLOSED — "workin' the docks" is the one name used everywhere now.** `commit b92641ef`; `src/ui/util.js` dock narration (`⚫ TAILS — ye spend the turn workin' the docks at {place}`). |
| ~~W2-4~~ | ✅ **CLOSED — every dock narration line names the coin as it moves, derived from `cfg`.** `commit b92641ef`; `src/ui/util.js` dock builder, `(+${heads}🌕)`/`(+${tails}🌕)`. |
| ~~W2-5~~ | ✅ **CLOSED — same builder as W2-4, same derive-don't-type rule, one function so they can't drift apart.** `commit e6a1d04e`. |
| ~~W2-10~~ | ✅ **CLOSED — the stale comment is corrected and dated.** `commit 72508abe`, sharpened by `commit dcedb178`; `src/engine/index.js` ~:3131 now reads "CORRECTED 2026-08-27 (W2-10)". |
| ~~W2-6~~ | ✅ **CLOSED, ONE FIELD DELIBERATELY LEFT — his call, not an oversight.** `commit b92641ef`; `index.html` `<title>`, `og:title`, `twitter:title` and `about.html` all drop "On the Sugar Seas". **`schema.org`'s `name` field still reads "Pastry Pirates on the Sugar Seas" ON PURPOSE** (`index.html`:29-33's own dated comment) — it is the one place the long form still does real SEO work, and closing that gap needs Wyatt's ruling, not a copy edit. Do not "finish" this by touching it. |
| ~~W2-7~~ | ✅ **CLOSED, INCLUDING THE TOOLTIP QUESTION.** `commit 97e5c2ed`; `src/ui/flow.js` ~:2326: *"MUSE, not Pass (Wyatt, 2026-08-27)"*. The tooltip half was also his call, the same day: *"don't build the tooltip, ignore this and let the idea go"* — no tooltip exists, deliberately, not a gap. |
| ~~W2-8~~ | ✅ **CLOSED, with a real refinement beyond the literal ask.** `commit af9d53d8`; `src/ui/flow.js` ~:372. The line is conditional — added only when a blue (trade-wind) square is actually on offer, since a mixed set has amber squares that DO commit on one tap, and "tap again" would be false for those. |
| ~~W2-9~~ | ⚠️ **HALF CLOSED, and the other half is a tracked proposal, not a silent gap.** `commit c62df6f7`: the wording now reads `How many coins?` when coin is the only thing on the table. **The slider PULSE was not shipped** — filed as **P-2** in the 🧭 CTO PROPOSALS section below (`commit af9d53d8`): every glow lives in one CSS block keyed to `.apBtn`, the slider isn't one, and nobody has confirmed WebKit animates a range-thumb pseudo-element (his phone is the only real Safari this project has). Not re-filed here; see P-2. |

> **SWEPT 2026-08-29 (the night run).** Every closed row in Waves 3–6 now carries a strikethrough
> and a pointer into `.planning/CTO-LEDGER.md` rather than a copy of its verdict — a pointer cannot
> go stale, a copy always can. **Waves 4, 5 and 6 are fully closed.**
> ⚠️ **CORRECTED 2026-09-01: this line originally said "Wave 3 has three rows open: W3-1, W3-3,
> W3-5"** — stale the moment it was written, since the very next day's commit (2026-08-30, see
> W3-5's own row above) closed W3-5 without this summary being updated to match. **Wave 3 has TWO
> rows open: W3-1, W3-3** (re-confirmed 2026-09-01 alongside the Wave 2 sweep below).
>
> **Waves 0 and 1 were NOT swept and their rows are not to be read as open or closed from this
> pass.** Their statuses are recorded inline in the rows themselves. **Wave 2 WAS swept, 2026-09-01
> — see the note above its own table: all ten rows are shipped, one (W2-9) only half.**

## Wave 3 — glitches a player sees constantly (5)

| # | Item |
|---|---|
| W3-1 | **The battle box choreography is glitchy, in ALL modes.** It appears for an instant, the stage deletes it, it moves down to centre, then it is removed and replaced by the stage with the coin flipper. **And after the flip the coin disappears from the flippenator BEFORE the stage does** — it should stay until the stage goes. ⚠️ **All modes means this is NOT a host/guest fault** — do not fold it into Wave 1. |
| ~~W3-2~~ | ✅ **CLOSED — the frozen pitch in bakeoff.js — Wyatt diagnosed it from the description alone.** See `.planning/CTO-LEDGER.md` (search `W3-2`) for the measurement and its CEO verdict. **Bake-off attempt 2+ : the boxes jitter after being shuffled** instead of settling smoothly. Wyatt's own hypothesis: the open crates, or the borders around them. `src/ui/bakeoff.js`. |
| W3-3 | **The drumroll fires AFTER the narration that names the winner.** It should come first. Found in the solo voyage, 2026-08-27, on a two-captain tie broken by crates/coins. ⚠️ **STILL OPEN — re-confirmed 2026-09-01, not closed.** `scripts/qa/w33_drumroll_order.mjs` (built 2026-08-29/30, posing `?endcard=1`'s all-captains-finish ending against the real collab/tie branch) had a hardcoded `/tmp/chrome-w33` profile path — a Linux-container assumption that made Chrome fail to start silently on Windows (`--user-data-dir` invalid, DevTools listener never came up, `attach()` just timed out reading as "no chrome"). Fixed to `os.tmpdir()`; re-ran on the current build (post the whole one-director foundation rebuild): **PASS, drumroll 1975ms before the winner** — matching the 2026-08-30 measurement (1951ms) almost exactly, so the ENDING sequence itself has not regressed. **This does NOT close W3-3.** The 2026-08-30 finding stands: `?endcard=1` poses the ending, not the approach, and skips the entire day loop — Wyatt's report is about what he saw DURING a played voyage, which this shortcut cannot exercise. The real site (if it still exists) is somewhere in the day-loop run-up to the ending, not in `liveResolveEndNet()`'s own sequence, and testing that needs an actual multi-day playthrough (several minutes to hours, `docs/DRIVING-THE-GAME.md` §5), not attempted this session. |
| ~~W3-4~~ | ✅ **CLOSED — the End of Voyage slam, and Q-20's scrolling ruling on top of it.** See `.planning/CTO-LEDGER.md` (search `W3-4`) for the measurement and its CEO verdict. **The End of Voyage card "SLAMS" down to the captains box.** It should scroll smoothly. |
| ~~W3-5~~ | ✅ **CLOSED 2026-08-30 — the fix is real, and the proof took two goes.** The teardown had been nested inside `if (!cell)`, so it fired only when a tap missed EVERY sail square; unconditional since 2026-08-29. **MEASURED in a browser with real mouse events** (`scripts/qa/w35_sweep_preview_live.mjs`): 0 preview parts, 3 after tapping the trade-wind square (`sweepPath, sweepEnd, sweepGhost`), 0 after tapping a plain one. ⚠ **THE FIRST VERSION OF THAT PROBE COULD NOT TELL THE FIXED TREE FROM THE BROKEN ONE** — CEO Review 28 reinstated the bug and watched it still pass: the first tap calls `camFull()` and `#sailHost` is camera-transformed, so every square MOVES, and the probe tapped a coordinate measured before the glide — landing on board artwork 131px away, where the `!cell` branch clears the preview just as it did before the fix. It now re-measures after the camera settles, refuses unless the point is actually on a plain sail square, and poses the trade-wind square instead of driving for one. |

## Wave 4 — layout (6)

| # | Item |
|---|---|
| ~~W4-1~~ | ✅ **CLOSED — measured after the fix: card centre 0px off both the window centre and the board centre.** See `.planning/CTO-LEDGER.md` (search `W4-1`) for the measurement and its CEO verdict. **"Choose yer recipe card" is not horizontally centred.** Seen in pass-and-play. ⚠️ **Wyatt: *"Don't apply this fix only for pass-and-play, it should apply to all games architecturally."*** |
| ~~W4-2~~ | ✅ **CLOSED — the battle bubble takes no subject; the rule now lives once in src/shared/index.js.** See `.planning/CTO-LEDGER.md` (search `W4-2`) for the measurement and its CEO verdict. **Guest battle narration box is not centred.** ⚠️ **NARROWED 2026-08-27:** his screenshot shows the guest's *tap-to-sail* narration box correctly centred, so this is specific to the BATTLE box, not all guest narration. |
| ~~W4-3~~ | ✅ **CLOSED — measured, not a defect as filed.** See `.planning/CTO-LEDGER.md` (search `W4-3`) for the measurement and its CEO verdict. **The centre div has its own blue background**, layered on top of the page gradient under the board and the captains box. **The gradient should be the only background.** ⚠️ **STATIC READ 2026-08-28, NOT YET MEASURED — two candidates, and they are different bugs:** (a) `body.pp4Stage { background:#3d7d99 }` (`index.html:1502`) paints FLAT BLUE over the page gradient whenever the centre stage is up — deliberate for the stage, but it is the page's own body, so it also covers the board and captains box; (b) the page gradient itself is `body { linear-gradient(160deg,#dcece9,#e6efe1,#f5f0dd) }` (`:51`) — pale, so any blue seen in ordinary play is NOT it. **Measure which is on screen at the moment he saw it before changing either** — a stage-only blue and a persistent blue are different fixes, and (a) is load-bearing for the ceremonies. |
| ~~W4-7~~ | ✅ **NOT A DEFECT — MEASURED 2026-08-29, closed.** Board right edge and captains card may run past the right edge of the phone viewport at 390px.** ⚠️ **OBSERVED, NOT MEASURED** — spotted by CEO Review 13 in a W4-3 verification screenshot, raised so it is not lost. Related to W4-4 (the captains box not matching the board's width) but a different symptom: overflow rather than a short row. Measure the rects at 390px before believing it. | **MEASURED across 22 samples on a real voyage at 390x844: innerWidth 390 / documentScrollWidth 390 / bodyScrollWidth 390 in EVERY sample — the page never scrolls sideways in any state, and the captains card is exactly flush at 0..390. What extends past the viewport is BOARD ARTWORK (the rain layer at 624, island SVGs at 564), which this project's own vision rubric names as designed: "the board is a camera view of a larger map, so its contents are cut off by design." Scope of the measurement, stated honestly: SOLO at 390px. If Wyatt sees it, the state matters and the screenshot should say which.**
| ~~W4-4~~ | ✅ **CLOSED — the captains box against the board width.** See `.planning/CTO-LEDGER.md` (search `W4-4`) for the measurement and its CEO verdict. **At tablet width the captains box is narrower than the board**, leaving a ~10px dead strip. ⚠️ **ALSO ON A PHONE** — his screenshot shows the captain rows ending ~200px short of the panel's own right edge. Wider than "tablet". |
| ~~W4-5~~ | ✅ **CLOSED — the sea hint beside the card, on the shared pulse.** See `.planning/CTO-LEDGER.md` (search `W4-5`) for the measurement and its CEO verdict. **Move the "Tap and hold the sea to reveal the board" tooltip** closer to the recipe card, **and give it the same pulse as the buttons** — Wyatt: *"in a way, it is a button — a button that reveals the sea."* |
| ~~W4-6~~ | ✅ **CLOSED 2026-08-29 — NOT REPRODUCIBLE ON EITHER SEAT.** The `🦜Start` button has no glow**, on host or guest. It should glow consistently with the other stage buttons. | **MEASURED in a real two-browser crew game (room NJCU): at the turn-order barrier the button computes `animation-name: pp4Glow` on BOTH host and guest. Also pp4Glow in solo. Cured by T-16 (2026-08-26), which restated the glow at a specificity that beats the two GROW rules. Closed without a code change — the record is the measurement, on the seats he named.**

## Wave 5 — art and asset (3)

| # | Item |
|---|---|
| ~~W5-1~~ | ✅ **CLOSED — the coin at ceremony scale; the art question parked as Q-19, Wyatt ruled LEAVE IT.** See `.planning/CTO-LEDGER.md` (search `W5-1`) for the measurement and its CEO verdict. **The coin flip is low-res** while the rest of the game is not. |
| ~~W5-2~~ | ✅ **CLOSED — the call buttons derived beside each boat, bound to the nearest hull.** See `.planning/CTO-LEDGER.md` (search `W5-2`) for the measurement and its CEO verdict. **The buttons to call other battling captains sit on top of their boats**, and often on the WRONG boat. They should be directly beside the boats — side, top or bottom — so the player can read the wind and the situation. |
| ~~W5-3~~ | ✅ **CLOSED — the black market flags seated on every dock orientation.** See `.planning/CTO-LEDGER.md` (search `W5-3`) for the measurement and its CEO verdict. **The black market flags are not attached to the docks.** For every dock orientation, set the base of the flag on the dock. |

## Wave 6 — the slider edge case (1)

| # | Item |
|---|---|
| ~~W6-1~~ | ✅ **CLOSED — the slider is drawn dead rather than omitted, on BOTH seats.** See `.planning/CTO-LEDGER.md` (search `W6-1`) for the measurement and its CEO verdict. **"Would ye offer any coin on top?" appears with NO SLIDER** when the player has no money left. **Expectation: the slider appears greyed out, and the button reads "Nah" instead of "Offer it!"** |

## ⛔ PARKED — needs Wyatt's ruling, the CTO may NOT default these

**These are TASTE or RULES. Per the 10-minute rule's exemption, they never time out — they park.**

| # | Question |
|---|---|
| ~~Q-1~~ | ✅ **ANSWERED 2026-08-28 (A-1) and SHIPPED:** he was remembering right, and he changed the rule — a captain's bake now rides their own turn slot. Nothing parked. |
| ~~Q-2~~ | ✅ **ANSWERED 2026-08-28 (A-2) and SHIPPED:** "Yes. Build it. Bakeoff IS the game coming to life." Bot bake-offs play on every screen. Nothing parked. |
| ~~Q-3~~ | ✅ **ANSWERED 2026-08-27: KEEP IT.** The "End of voyage" heading stays put while the award cards scroll. No longer parked; nothing to do. |

## ✅ CLOSED by this playtest

- **The ghost box** (a finished narration bubble at 13–28% opacity for 300ms while the next is
  placed). **Wyatt, 2026-08-27, checklist #8: *"It's fine, i don't mind it."*** The standing entry
  below is answered. **Do not re-open it.**

---
## 🔴 TOP OF THE LIST — sail squares a guest cannot tap

**Deferred at the cutover by Wyatt's explicit call, 2026-08-26, on the understanding that it is
written down rather than forgotten. It is the first thing to pick up.**

`crew-phone`, guest, during a **tap-to-sail** prompt — `crew-phone-guest-006-settled.png`:

```
FAIL on-screen      : clickable off-screen: sailCell, sailCell
FAIL not-occluded   : sailCell covered by #pp4Cap
FAIL sail-clickable : 3 sail square(s) covered
```

Two sail squares are off the screen and one sits under the captains panel, so **a guest on a phone
has legal moves they cannot reach.** D-38's ruling is that a control you cannot hit is *the one
unacceptable outcome*, and crew-on-a-phone is the square Wyatt actually playtests.

- **It is on the SETTLED shot, not mid-animation.** The gate separates those (`fails` vs
  `motionOnly`, `playtest_gate.mjs`) and this is in `fails`.
- **It is the ONLY structural failure across 281 screens** in the final trial. Everything else is clean.
- **Why it was deferred:** unlike the cutover's other blockers it is unbounded — the board's visible
  band fighting the captains panel at phone height, not a find-and-replace.
- **Where to start:** `boardBand()` and `capBandBottom()` in the promoted `src/ui/stage.js`, and
  `docs/BOARD-RENDERING.md`.

### ⚠ MEASURED 2026-08-29, IN A REAL CREW GAME — and it corrects the entry above

`scripts/qa/w14_guest_sail_reach.mjs`, guest at 390×844, 18 captures over 8 minutes. Raw:
`.planning/research/wave1-convergence/W14-GUEST-SAIL-REACH.txt`.

**OF THE SEVEN CAPTURES THAT WERE ACTUALLY JUDGED, SIX FAILED — and every one of the six reads
`covered 0`.** They fail on `off-screen` and `clipped`. **Nothing was covering them at all.**

| what actually made a square untappable | how often |
|---|---|
| **off the screen edge** — including six at **x = −57 to −116, past the LEFT edge** by more than a full square | the whole of it |
| covered by anything (bubble, captains panel, rows) | **0 of the six judged failures** |

**SO THE `#pp4Cap` CAUSE IN THE ENTRY ABOVE IS NOT THE CAUSE**, and the ⚠ on the W1-4 row that
said so was right. Coverings appear only in *on-sight* captures that were clear again 400ms later —
the existing D-38 avoidance re-places the bubble on its own, which is visible on prompt 1 of the
before-run: 7 squares under the bubble on sight, **0 at +400ms, before any change was made.**

**Wyatt's own words are the accurate description and always were** — *"cut off at the screen edge"*,
and `BACKLOG.md`'s own `"the board's left column cut by the screen edge"`. **It is a framing
problem: the camera's window puts legal moves outside the viewport.** `boardBand()` /
`capBandBottom()` remains the right place to start, but for the BAND and the CAMERA, not for
occlusion.

**A CTO CORRECTION ON THE RECORD:** on 2026-08-29 I reported the narration bubble as the biggest
cause and shipped a widening of its avoidance on that basis. **That was false** — CEO Review 27
caught it, and I verified it against my own evidence file. The probe counted captures it never
judged as passes and printed them as "corrected themselves". The bubble change is harmless and
provably cannot worsen placement, but it fixed nothing that was measured to be broken.

---

## 🔴 SEO — MEASURED BROKEN, and it is a BRAND COLLISION, not a tags problem

**Wyatt, 2026-08-26, with five screenshots of Google for "pastry pirates":** *"The seo is literally
not working… We need to be up top, indexed by ai and Gemini, the first suggestion."*

### What the screenshots actually show — read them before proposing anything

`playpastrypirates.com` **appears nowhere across five screens of results for its own name.** Not
ranked low. Absent. What occupies that query instead:

| position | what owns it |
|---|---|
| **AI Overview #1** | ***Porky's Pastry Pirates*** — a **1942 Looney Tunes short**, sourced to IMDb |
| **AI Overview #2** | **Petsi Pies**, a bakery at 285 Beacon St, Somerville MA — 4.7★, 399 reviews |
| organic | IMDb, Looney Tunes Wiki (Fandom), YouTube (74.2K views) |
| images | every one Porky's Pastry Pirates |
| videos | **all four** Porky's Pastry Pirates |
| shopping | Etsy pirate cake toppers |

**THE STRATEGIC FACT, and every plan must start here: the name collides with an eighty-year-old
Warner Bros. cartoon that owns IMDb, Fandom and YouTube, and secondarily with a real bakery Google
believes is the local intent.** Adding meta tags does not win that. Anyone proposing "improve the
meta description" has not looked at the screenshots.

### What is MEASURED about the pages (2026-08-26, post-cutover)

| claim | status |
|---|---|
| `<h1>` count | **ZERO on both pages.** Also zero `<h2>`. A page with no heading gives a crawler no topic. |
| schema.org `VideoGame` | **PRESENT and complete** — name, url, description, image, genre, platform, numberOfPlayers, free Offer |
| og: / twitter: / canonical / description | **ALL PRESENT.** My earlier claim that they were missing was WRONG and is corrected here. |
| `noindex, nofollow` | **was on the game, removed at the cutover.** While it sat at `/4` this was correct; it is gone now. |
| crawlable body text | **NOT RELIABLY MEASURED.** Two attempts gave 11,845 and 11,759 words, both polluted by HTML comments the strip missed — the sample text was source commentary, not prose. Classic measured ~1,279 words of genuine copy. **Do not build on the promoted number until someone re-measures with a real HTML parser.** |

### The hypotheses, RANKED, each marked by how much it is worth

**These are hypotheses. Only the table above is measured.**

1. **Brand collision is the whole game (high confidence — it is what the screenshots show).**
   Winning the bare phrase "pastry pirates" against Looney Tunes may not be achievable at all.
   **Fight the query you can win first:** "pastry pirates game", "pastry pirates online", "play
   pastry pirates", "pirate baking board game". The domain literally is *playpastrypirates.com*,
   which is an exact match for one of those.
2. **A JS game gives a crawler almost nothing to read (medium-high).** The page is an application,
   not a document. **There is real content in this repo already unused for this** — `RULES.md`,
   `RULES-V2.md`, and the About page. Real HTML pages of rules/how-to-play are both useful to
   players AND the only thing a crawler or an LLM can actually quote.
3. **Zero headings (high confidence, measured).** Cheap to fix and it is table stakes.
4. **Authority / backlinks (high confidence, and mostly OFF-repo).** A new domain with no inbound
   links does not outrank IMDb. This is the lever nobody in a code editor can pull, and it should be
   named honestly rather than substituted with more tags.
5. **AI / Gemini specifically (LOW confidence — do not guess here).** Being cited by assistants
   appears to follow from being crawlable, factual and quotable, plus structured data. `llms.txt` is
   speculative. **Nobody has verified how this actually works; treat any claim about it as unproven
   until someone checks current guidance.**

### Nothing has ever been measured

- No Google Search Console. **We do not know whether the site is indexed at all** — "not ranking" and
  "not indexed" are different problems with different fixes, and we cannot currently tell them apart.
  **This is step one and it costs nothing.**
- No analytics on which queries bring anyone.
- The sitemap lists `/` and `/about.html` only.

### The bar Wyatt set
*"up top, indexed by ai and Gemini, the first suggestion."* Against a Warner Bros. property, on the
bare phrase, that is a long campaign and possibly not winnable. **On the disambiguated queries it is
very winnable.** Say which one is being promised.

## 🔴 A tutorial for first-time players

A new player currently gets the *"Ahoy! Choose a recipe, gather each ingredient, then sail home
first to win!"* line and then a board with no explanation of how anything works.

- [ ] **Decide the shape first — this is Wyatt's call, not a mechanism question.** Options: a guided
      first voyage; a short interstitial before the first game; contextual first-time-only hints on
      each new control; or a "How to play" that is actually read.
- [ ] `How to play` exists in the menu — **find out whether anyone opens it** before building a
      second thing beside it.
- [ ] The game already teaches one gesture well and it is a good model to copy: *"Tap and hold the
      sea to reveal the board"* appears in-context, at the moment it is needed, and retires itself
      once learned (`PEEK_LEARNED`, `4/src/ui/stage.js`).
- [ ] **Watch a real first-timer play before designing this.** Nobody in this repo has.

---

## 🟠 Known bugs, deferred as not game-stopping

- [ ] **"Play again!" covers the award cards** at end of voyage — flagged **6 times** across two sea
      trials, every phone leg and Safari. **It is the DOCUMENTED design** (sticky was chosen because
      a button below the fold was worse). A third option exists and is unbuilt: pin it as a FOOTER
      outside the scroller — always visible AND never covering. **Cost: `#statsWrap` is also the
      draggable park sheet (D-14), so the gesture needs hand-verification.** Wyatt's call.
- [ ] **`deny` is never exercised** in crew games. A theory that it shared a cause with the covering
      bug was written down in advance and **disproved**. Unexplained.
- [ ] **31% of screens never settle** before being checked — all now reporting `churn: geometry`
      (the text class is fixed). Something moves >8px for 2.6s+. Diagnosable but undiagnosed.
- [ ] **8 of Wyatt's 35 playtest items untouched**; 5 parked with written diagnoses.
      See `.planning/phases/02.3-the-two-hour-playtest/TRIAGE.md`.
- [ ] **Large empty gap in the desktop right-hand column** at 1890x960 — pre-existing, taste, his call.

## 🔴 THE DETERMINISM CORPUS IS UNBOUND — ⚠ AND A-1 (2026-08-28) REORDERED THE BAKE DAY, so the re-record must be against the one-phase loop; the 2026-07-26 fixtures can never verify again — removed from `npm test` at the cutover

**This is a REMOVED GATE, named loudly rather than left red or quietly made to pass.**

`npm test` no longer runs `determinism_baseline.js --verify`. It failed **31 of 31 seeds** the moment
the cutover landed, and the reason is not a bug: **the corpus was recorded against the engine that
used to be at the repo root, and the root is now a different game.** `scripts/lib/load_engine.js`
imports `../../src/engine/index.js` — tree-relative to its own location by deliberate design — so it
now loads the promoted engine and checks it against the previous engine's fixtures.

**What was actually lost tonight: nothing.** The corpus belongs to the classic engine, which is
frozen (no code commit since 2026-08-02), so it cannot regress. The promoted game **never had a
corpus** — `docs/DETERMINISM-CAPTURE-4.md` was written in advance precisely because capturing one is
a *one-way door*. Coverage today is identical to coverage yesterday. What is lost is the *guard*.

**Why it was not fixed on the night:** the honest fix is a re-point, and it is wider than it looks.
`scripts/lib/load_engine.js` is a byte-identical twin that resolves to `4/src/engine` — which no
longer exists — so it is broken too, and `lib_twin_check.js` exists to assert those two files never
drift. Making them legitimately differ is a change to a check's premise, and that is not work to do
at 1am on a one-way cutover. `DETERMINISM-CAPTURE-4.md` says this exact thing: the door should be
opened "deliberately — instead of a thing somebody discovers at 3am, mid-phase, with a red suite and
no procedure."

**The choice waiting to be made, and it IS a choice:**
1. **Point the verify at `classic/`** — restores exactly yesterday's coverage. Needs `load_engine` to
   take a tree, and needs `lib_twin_check`'s premise revisited.
2. **Capture a corpus for the promoted engine** — NEW coverage the game has never had, and a one-way
   door. Follow `docs/DETERMINISM-CAPTURE-4.md`; do not improvise it.
3. Both, in that order.

`npm run test:determinism` still exists and still fails, on purpose, so the gap is one command away
from being visible rather than hidden.

## 🔴 GATES PARKED BY THE CUTOVER — 34 in the chain became 18

**Named individually, because a parked gate nobody wrote down is a gate nobody restores.**
The suite is GREEN at 18. It is green honestly — nothing was made to pass, and nothing that guards
the live game was dropped.

### Not a loss — 6 gates
The six `--tree=4` runs were deleted as **duplicates**: root now IS the promoted game, so the bare
runs beside them already cover it. Zero coverage lost.

### An UPGRADE — 3 gates
`dlog_replay_test`, `net_registry_test` and `rim_sweep_trace_test` passed against the promoted game
and were deliberately LEFT on the root. **They now guard the live game for the first time**; before
the cutover they only ever saw v1.

### Re-pointed, coverage preserved exactly — 2 gates
- `ui_contract_check` → `--tree=classic`. It is now tree-aware through the shared picker.
  **It fails 24 assertions against the promoted game and those are REAL:** 2 retained globals
  (`window.__pulseBeacon`, `window.__pp4`) not on the allowlist, and **~22 player-facing strings
  still in the pre-conversion you/your register** instead of ye/yer — rule 12's voice, in the live
  game. See the entry below.
- `hail_ranking_test` → imports `classic/src/`; it tests v1-only exports.

### PARKED — 10 gates, each with its symptom
| gate | why it is parked |
|---|---|
| `determinism_baseline --verify` | corpus bound to the tree that moved — see the 🔴 entry above |
| `storm_moored_reason_test` | **mixes engines**: `loadEngine()` pulls the PROMOTED engine while the test imports classic's flow → `g.windPush is not a function` |
| `audio_mapping_test` | resolves `sfx/*.mp3` by a path that moved |
| `bot_storm_narration_test`, `narration_test`, `narration_flow_test`, `extract_narration_lines`, `economy_guard_test`, `narration_audit_check` | v1 narration/economy suites; import v1-only exports |
| `gate_citation_check` | **its premise is retired, not its paths.** It asks "does this gate read `4/`?" and `4/` no longer names the game. Post-cutover the question is "does it read root" — a redesign, not a path fix |

Their invocations are preserved verbatim in `package.json` under `scripts.test:v1` and
`scripts.test:parked-citation` so restoring them is copy-and-paste, not archaeology.

## 🟠 THE PROMOTED GAME FAILS 24 UI-CONTRACT ASSERTIONS — and ~22 are the pirate voice

Surfaced the moment the cutover pointed `ui_contract_check` at the promoted tree.

- **~22 × `D-29-REGISTER`** — player-facing strings still reading the pre-conversion 2nd-person
  register (you/your) rather than ye/yer, in `src/orchestrator.js` (1145, 1194, 1195, 1733, 2225),
  `src/ui/bakeoff.js` (645–647, 681), `src/ui/board.js:2205` and `src/ui/flow.js` (425, 749,
  1232–1235, 1376–1377, 1402, 1499–1505 …). The spec is
  `art-review/narration-audit.html`'s PIRATE_MAP. **This is CLAUDE.md rule 12's voice boundary, in
  the live game, visible to players.**
- **2 × retained globals** — `src/ui/pulsebeacon.js:151` assigns `window.__pulseBeacon` and
  `src/ui/stage.js:3331` assigns `window.__pp4`; neither is on the allowlist. Both are debug hooks:
  either allowlist them deliberately or stop shipping them.

**Fixing these is how `ui_contract_check` gets promoted from guarding the frozen game to guarding
the live one.** That is the real prize here, and it is a copy pass plus two decisions.

## 🟠 Process debt

- [ ] **The seeded-defect drill still cannot fail.** `scripts/qa/seed_drill.mjs:72` grades on the
      leg's **exit status**, and the leg fails on its own for unrelated reasons — so every seed scores
      CAUGHT whether the bug is present or not. **Fix: run one UNSEEDED baseline first and grade each
      seed only on failures the baseline did not have.** ~15 lines.
      **Until this exists there is no evidence the sea trial catches Wyatt's bugs.**
- [ ] **Nothing gates the push.** A ~15-line `pre-push` hook could refuse game code without a
      completed sea trial for that build stamp — and would also dodge the post-push gear blindness.
- [ ] **`ui_contract_check --drill` fails on its own COIN-NOBRK fixtures** (pre-existing at
      9179ff66, verified via stash on 2026-08-28): drill 9's synthetic `battleflee`/`fish` fixtures
      no longer match what `checkCoinParentheticalNobrk` expects, so the drill reports DRILL
      FAILURE while the real-tree gate is green. The npm-test chain never runs `--drill`, so
      nothing is red in CI — but it means those assertions' red-proof is currently unproven.
      Re-anchor the fixtures to the current util.js/flow.js shapes.
- [ ] **Red-proof meta-gate** — nothing verifies the 34 gates can go red. Only 5 of 42 scripts carry
      a `FAILURE DEMONSTRATION` header; it is a habit, not a gate.
- [ ] **Trigger-fired lessons** — extend `.claude/hooks/` so a lesson arrives when you are about to
      make the mistake, not at session start. The rule-17 hook proves the pattern works.
- [ ] **Volume**: `HARD-WON-LESSONS.md` is ~1316 lines and CLAUDE.md ~960, and every session is told
      to read both. CEO review 5 recommends collapsing §10c/e/f/g to one line each.
- [ ] **38 browser-driving scripts hardcode a Linux-container `/tmp/...` Chrome profile path** —
      found 2026-09-01 fixing `w33_drumroll_order.mjs` (`grep -rl '"/tmp/' scripts/`). On Windows
      (the Razer) this makes `--user-data-dir` invalid, so Chrome exits before its DevTools listener
      comes up; `mp_rig.mjs`'s `launch()` runs with `stdio:"ignore"`, so the failure is silent and
      `attach()`'s eventual "no chrome on `<port>`" reads exactly like an environment problem, not a
      one-line path bug. Newer, Windows-era probes (`sail_containment_crew_probe.mjs` and its
      siblings) already use `path.join(OUTDIR, ...)`/`os.tmpdir()` and are unaffected — this is
      specifically the older, cloud-container-era scripts (the `t##_*`, `group_*`, `w##_*` probes
      from before the Razer migration). Only `w33_drumroll_order.mjs` was fixed (needed for the W3-3
      re-check above); the other 37 are unverified and untouched. **Cheap when someone needs one of
      them**: swap the literal `"/tmp/..."` for `path.join(os.tmpdir(), "...")` in each, one line per
      file — not done as a sweep here because none of the other 37 were blocking anything this
      session needed, and touching files nobody asked about is the scope creep rule 7 warns against.

## 🟡 Roadmap phases deferred past the cutover

- [ ] **Phase 5 — Trade Over the Wire.** Multi-captain trade inside one turn, counter-offers across
      the wire, a guest with the same controls as the host.
- [ ] **Phase 7 — The Board Fits.** The whole board visible on a laptop.
- [ ] **Phase 8 — A Desktop Worth the Width.**
- [ ] **Phase 9 — The Written Record.** The rules rewritten from the code; ~40 rulings and 13
      approved copy strings lifted out of commit bodies.
- [x] ~~**Tidy-up**: `v2/`, `v2bakeoff/` and `3/`~~ — deleted at the 2026-08-26 cutover (96 files,
      3.3MB, recoverable from git history).
- [ ] **`scripts/` is the last thing left in `4/`.** The game moved to the root at the cutover but
      the dev scripts stayed put, to avoid merging two `scripts/lib/` directories at midnight. Moving
      them to `scripts/` means resolving exactly two collisions — `lib/` and `no_undef_check.js` —
      and deciding what `lib_twin_check.js` compares once there is only one `lib/`. Until then `4/`
      is a directory holding only tooling, which reads as leftover and is kept out of the index in
      `robots.txt`.
- [ ] **Safari storm on a real device** — never measured on this build. Headless WebKit now runs in
      the sea trial, but `DRIVING-THE-GAME.md` §9 is explicit: *"Chrome is not Safari… a green
      harness still earns a human Safari pass."*

### §0 — what was MEASURED on 2026-08-26 night, and the two theories it killed

**No fix yet. Two hypotheses eliminated and one mechanism located — recorded so the next session
does not re-derive them.** Measured on a real solo phone (390×664) at a live sail prompt, values
read from the rendered page, not reasoned:

```
vw 390  vh 664
#board      l0 t86  r390 b476   (390×390 — a SQUARE)
#boardwrap  l0 t86  r390 b476   (identical)
#pp4Cap     l0 t476 r390 b664
#sailHost   l-185.4 t-48.6 r575.4 b712.1   transform: scale(1.95052) translate(-185.351px,-134.637px)
viewBox "155.94 113.27 328.118 328.118"    preserveAspectRatio "xMidYMin meet"
```

**KILLED — "the HTML sail layer and the SVG board are scaled by different numbers and drift."**
This was the sharper theory and it is wrong. Worked through arithmetically from the measured values:
SVG puts a board unit at `390/328.118 = 1.188595` px each; the HTML layer puts it at
`(1/640)·390 · (640/328.118)` = **the same 1.188595**. Checked at three board coordinates across the
whole width — **agreement to 0.000 px**. The two paths do not drift. *(Its own falsifier — "if
`#board`.width === vwPx() there is no mismatch" — is exactly what the measurement shows: both 390.)*

**KILLED — "the captains panel overlaps the board's visible band."** The board ends at y=476 and
`#pp4Cap` begins at y=476. They are **adjacent, not overlapping**, at this size in this mode.

**LOCATED — nothing clips the camera-mapped HTML layers.** `#boardwrap` is
`position: relative; width: 100%; container-type: inline-size` with **no `overflow` rule**. The
`overflow: hidden` in this area belongs to `#board`, which is the SVG and clips only its own
content — not its sibling HTML layers. And `#sailHost` measures **−48.6 → 712.1**, far outside the
board's 86 → 476, because it is a transformed layer whose children paint wherever the transform puts
them. **So a sail square whose board coordinate is outside the current camera frame paints outside
the board entirely** — over the ribbon above, or into the captains panel's band below, which is
exactly what `sailCell <- covered by #pp4Cap` reports.

**WHAT IS STILL NOT KNOWN, and why no fix shipped tonight.** `camFitCells()` fits the bounding box of
every legal cell plus the player's own ship, grows the frame for the prompt's reserve, clamps to 640,
and `camTo` clamps the origin into the board — **on paper every legal square should always be in
frame**. So the open question is what puts one outside it. The two candidates, neither measured:

1. **The camera has not moved yet.** `camTo` REMEMBERS rather than performs while a centre-stage card
   or the flip veil holds attention (`stageHoldsAttention()` → `S.camHeld`), and `tick()` performs it
   later. Squares drawn before that glide would sit on the old frame.
2. **The glide is mid-flight.** `camTo` tweens over 650 ms; the trial reports **31% of screens hit the
   settle cap**, so screens are being judged while still moving.

**The decisive measurement is a CREW GUEST at a tap-to-sail prompt** — that is where it reproduces,
and tonight's probe was solo. Read `S.camHeld`, `S.tween`, `S.cam` and every `.sailCell` rect at the
settled moment, and ask whether the failing cells are outside the frame the camera was asked for or
outside the frame it had actually reached.

> **Do not "fix" this by clipping `#sailHost`.** It would stop the square painting over the captains
> panel and would NOT make it reachable — it would hide a legal move instead of showing an
> unreachable one, which is worse. The fault is the frame, not the paint.

---

## 🟠 THE FIRST HONEST FULL SEA TRIAL SINCE THE CUTOVER — 2026-08-27, 81 min, 8 legs

**It FAILED, which is the point.** Until tonight it crashed on `ENOENT` before sailing a leg, so this
is the first real result the gate has produced since the promotion. Build `2026-08-26k-CUTOVER`,
gear FULL, legs: solo-desktop, solo-phone, passplay-phone, passplay-desktop, crew-desktop,
crew-phone, solo-desktop-wk, solo-phone-wk.

### The ONLY structural failure across all 8 legs is §0 — again

```
crew-phone-guest-006-settled.png
  FAIL on-screen      : clickable off-screen: sailCell
  FAIL sail-clickable : 1 sail square(s) covered: a sail square <- nothing (outside any element)
```

Same leg, same seat, same screen number as every previous trial. *"Covered by nothing (outside any
element)"* means the cell's own centre is **outside the viewport** — `elementFromPoint` returned
null. **Everything else in the game is structurally clean.**

**Three attempts to reproduce it under measurement, all on a real two-phone crew rig, failed** — 2
sail prompts measured in one run, 15 cells in another, every cell fully on screen. **It is
intermittent**, which the drill's null test independently measured (crew noise floor 3, solo 0).
That is why it must be fixed before any crew-phone verdict can be trusted.

### What the vision judge saw — read the pictures, not the captions

| screen | finding |
|---|---|
| `solo-phone-022`, `solo-phone-eov` | **"Play again!" covers the award cards**, cutting off their descriptions. This is now the **eighth** flag across three trials |
| `crew-phone-host-008` | **NEW — a ghosted rounded-box edge peeking above the "Tap and hold the sea" bubble**, just under the wind bar |
| `passplay-desktop-009`, `crew-desktop-host-006` | large empty dead space in the right-hand column — the known desktop gap, his call |
| `solo-phone-019` | two circular trade labels "overlap/touch". **MEASURED FROM THE IMAGE: they are ~11 CSS px apart — crowded, NOT overlapping.** The judge over-reported; the structural `no-pile` rule was right to stay quiet. Recorded so nobody "fixes" a non-bug |

**The ghost box is worth a look.** A floating box is being placed with its top ABOVE
`boardBand().top`, so `#pp4Fx` — the clipped host — cuts it and leaves a sliver showing. The fix is
in the placement, not the clip; not attempted unattended because re-tuning bubble placement without
Wyatt's eye is exactly the kind of taste change that costs a round.

### A STANDING ENTRY IS NOW WRONG, corrected in the open

**"`deny` is never exercised in crew games. Unexplained."** — that is no longer true. This trial
exercised it: **`deny:1/7` on crew-desktop and `deny:1/4` on crew-phone**, with `counter:2/5` and
`counter:1/3` alongside. It was very likely never exercised *because the crew legs could not run at
all* — the browser fleet was loading a directory listing. **Rule 6 applies to standing claims too:
this one was inherited, not re-measured.**

### TWO LEGS DID NOT RUN — and then they were RUN. Safari is clean.

`solo-desktop-wk` and `solo-phone-wk` both died with *"playwright not found"*, so Safari coverage in
the 8-leg trial was **ZERO** and the report said so in its NOT-RUN column — which is the one thing
that column exists for.

**They were then installed and run properly, 2026-08-27 01:18.** Both legs played a **COMPLETE
VOYAGE to the end card** — day 17 and day 18 — and the result is the best news of the night:

| leg | finished | screens | **structural failures** | **console errors** |
|---|---|---|---|---|
| `solo-desktop-wk` | **yes**, day 18 | 22 | **0** | **0** |
| `solo-phone-wk` | **yes**, day 17 | 21 | **0** | **0** |

Their only complaints are `4` and `7` *"screen(s) never stopped moving before being checked"* — the
known settle-cap issue, not a Safari fault. **A screenshot was read rather than trusting the
assertions** (`solo-phone-wk-005-settled.png`): art, wind arrows, whirlpools, the narration box and
the captains panel all render correctly on WebKit.

**This is the first Safari evidence this project has ever had.** `DRIVING-THE-GAME.md` §9 still
stands — *"Chrome is not Safari… a green harness still earns a human Safari pass"* — and **a storm
has still never been measured on a real device.** But "we have no idea whether Safari works" is no
longer true: it plays two full voyages without a single structural failure or console error.

**It will break again on the next reboot.** The webkit BROWSERS are installed durably in
`~/Library/Caches/ms-playwright/`; only the npm package directory is missing, and the documented
home for it is `/tmp/pw`, which `/tmp` clears. Point `PW_DIR` somewhere that survives — `~/.pw` —
and Safari legs simply work. Left as Wyatt's call rather than writing into his home directory.

### Coverage worth watching

`menu:0/1` on every single leg — the game offers the menu and the driver never opens it, so nothing
behind ☰ is being exercised at all. Several ingredient options sit at `0/2`.

### T-23 — CLOSED 2026-08-28 (A-2, built and MEASURED)

**Wyatt ruled it in: "Yes. Build it. Bakeoff IS the game coming to life."** The trace below held
exactly: the one missing publish is now `botBakePerform` (`src/orchestrator.js`), publishing the
same open/shuffle/pick moments through the same `benchPublish` a human's `onBench` uses, and
`benchReveal` runs for every performed bake. Pacing derives from `bakeoff.js`'s own animation
constants (`benchChoreoMs`/`BENCH_STUDY_MS`/`BENCH_BEAT_MS`). Gate:
`scripts/qa/a2_bot_bake_watch_check.mjs`. The READ-NOT-MEASURED caveat was closed by a live solo
probe: a bot's bench appeared titled "Crustbeard's Bake-Off", badges landed 0→5 one per beat, the
verdict revealed, the card retired — screenshots read. (The publish also carries `spec.baker` now,
closing the watcher half of T-25's title rule.) The original trace is kept below as the record.

### T-23 "nobody can watch a bot bake" — the mechanism, traced 2026-08-27 (READ, not measured)

**This is not a feature to build. It is one missing publish.** The whole watching apparatus already
exists and already works for humans; a bot simply never feeds it.

The chain, read end to end:

1. `bakeoffPrompt` (`src/ui/flow.js`) builds `onBench = patch => netHandlers().onBenchPublish(spec, p.idx, patch)`
   and hands it to `playBakeoffLive` — **but only on the branch that runs a HUMAN's attempt.**
2. `watchBattle` (`src/orchestrator.js:551`) is attached by **every** client, host included, and its
   bake branch `if(v&&v.bake){applyBenchSnap(v.bake);return;}` runs **before** the `isHost` guard.
3. `applyBenchSnap` skips only `decisionIsLocal(snap.seat)`, and `decisionIsLocal(s)` is
   `(passAndPlay && human) || s === appState.mySeat` (`src/ui/util.js:2158,2174`). **For a bot seat
   that is FALSE on every client, including the host.**
4. So `benchWatch(snap)` would run and draw the face-down bench for everyone — **if a snapshot ever
   arrived.** None does: a bot's bake never goes through the human branch, so `onBench` is never
   called and nothing is ever published.

**So the fix is to publish a bench for a bot's attempt, not to build a watching mode.** Everything
downstream — the face-down bench, the picks, the reveal, the "X is at the ovens — watch the crates"
hint, the paid-replay epoch handling — already exists and is already shared by both tiers.

**Why this matters more than its size suggests:** in SOLO every opponent is a bot, so a solo player
currently never sees a single opponent's bake-off. Wyatt: *"a vital part of the gameplay and endgame
tension."*

> **STATUS: READ, NOT MEASURED.** No bot bake was observed under instrumentation. Before building,
> confirm by watching a solo bake-off that `onBenchPublish` is never called for a bot seat — that is
> the one claim above that a measurement could overturn.

### T-06 "host sees nothing during a guest's bake" — re-read, still not reproduced

Wyatt ruled 2026-08-26 that **the bench SHOULD be there**, so this is a bug in the watch path, not a
design question. Re-reading it on 2026-08-27 confirms the earlier trace: `watchBattle` is attached
on the host, the bake branch precedes the `isHost` return, and `decisionIsLocal(guestSeat)` is
**false** on the host — so nothing in the path blocks it. **By reading, the host should get the
bench.** He saw neither the bench nor the broadcast wait line.

**That exhausts what reading can settle.** It needs a live crew bake with the two-phone rig and the
publish/receive instrumented on both sides — is `onBenchPublish` firing on the guest at all, and is
`watchBattle`'s callback receiving it on the host?

---

## 🔴 WHY 31% OF SCREENS NEVER SETTLE — measured 2026-08-27, and it undermines every "settled" verdict

**Found by asking step 0 of the loop: what happens right before "still moving at the cap"?**

### The measurement

Sampled exactly what `waitSettled` samples, per element, at a live sail prompt. **Only one class of
element moves at all:**

```
element        quantised-8px changes   exact-px changes   (34 samples)
pp4Bub#0                 3                    3
pp4Bub#1                 0                    0
```

Re-run tracking bubbles **by identity** — because the first pass keyed on position in the NodeList
and therefore could not tell a NEW bubble from a MOVED one:

```
bubble   samples alive   distinct tops   faded?   text
B1            16               3          yes     "Crustbeard takes the wheel…"
B2            15               4          yes     "Crustbeard sets sail"
B3            22               1          yes     "Crustbeard attacks Flaky Jack!"

bubbles created in 12s : 3      bubbles that MOVED : 2      max on screen at once : 2
```

### What it means

**A narration bubble is anchored to a captain's ship and re-placed as the board moves — 3 to 4
distinct positions across its life.** That is intended behaviour. But `.pp4Bub` is in
`SETTLE_PROBE`'s selector list, so **while any narration bubble is tracking its subject the screen
cannot settle, by construction.** The 8px quantiser was built to absorb the sail squares' permanent
bounce; a bubble re-anchoring travels much further than 8px.

**THIS IS WHY "IT IS ON THE SETTLED SHOT" CANNOT BE TRUSTED.** When `waitSettled` hits its cap it
returns `settled:false` and the gate checks anyway — and those failures still land in `fails`, not
`motionOnly`. So a screen judged during narration is reported exactly like one judged at rest. The
sail-square failure is reported on a shot whose own log line reads *"still moving at the cap
(2717ms) — checked anyway"*.

**It is an INSTRUMENT fault, not a game fault** — the game is behaving as designed. But it sits
directly under the top item on this list, so it is not separable from it.

### Options, none taken — this decides when EVERY screen is judged

1. **Drop `.pp4Bub` from the settle probe.** Cheapest. Cost: a bubble sliding in is no longer waited
   for, so a screenshot could catch one mid-entry.
2. **Wait for the bubble to stop rather than for the page to stop** — settle on the bubble's own
   anchor being stable, not on its absolute rect.
3. **Report the distinction honestly instead of hiding it:** a failure found on an UNSETTLED screen
   goes in its own column, never beside one found at rest. This is the smallest change and it stops
   the gate over-claiming, without deciding the harder question.

### And the same measurement located the GHOST BOX

`finish()` in `stage.js` does `b.classList.add("out")` then `setTimeout(() => b.remove(), 300)`,
while `.pp4Bub` carries `transition: opacity .35s`. **So a finished bubble sits in the DOM for 300ms
at falling opacity — measured at 0.13–0.28 — while the next one is placed.** Two bubbles were on
screen in 1 sample of 60: a narrow window, which is exactly why the ghost is intermittent and why it
reads as *"a faint ghosted/duplicate rounded-box edge"*.

**Whether that is a bug is Wyatt's call.** A 300ms cross-fade between narration lines is ordinary UI
polish; the vision judge flagged it as an artifact. What is NOT in doubt is the cause.

---

## 🧭 CTO PROPOSALS — found while working the mandate, NOT executed

**Rule 3 of the CTO spec: the CTO executes only what is on the list above.** These were measured
while doing approved work and are written here for Wyatt to accept or reject. **Nothing below has
been changed in the game.**

| # | Proposal | Evidence | Why it is not just done |
|---|---|---|---|
| ~~**P-1**~~ | ~~The shot-clock narration says you lost a coin when you lost nothing~~ **WITHDRAWN 2026-08-28 by Wyatt: *"p1 is stale, you dont lose money from shot clock."* HE IS RIGHT ABOUT THE GAME HE PLAYS.** | **And the code I cited is also real, which is why this needed measuring rather than arguing.** `applyShotClockPenalty` (`src/ui/util.js:2012`) genuinely does `take=Math.min(1,p.coins)`. What I never checked is whether it can be REACHED: `startShotClock` (`:1896`) returns immediately when `appState.timerOff`, and the timer is off — **the clock pill reads "⏱ off" in every phone screenshot this session took, including the ones I read pixel by pixel and drew other conclusions from.** So the penalty is unreachable in the game as played. | **THE LESSON IS RULE 6 WITH A TWIST: I did measure, and I measured the wrong thing.** I read the function and proved what it computes; I never asked whether anything calls it under the conditions he plays in. **A correct reading of a dead branch is still a false statement about the game.** Ask "can a player reach this?" before "what does it do?" — and the evidence was already on my own screen. |
| **P-2** | **Give the coin slider a pulse** — the second half of W2-9. The wording fix shipped; the pulse did not. | `index.html:2429` carries Wyatt's standing order: *"To make a new surface glow or grow, add its selector here — never write a new `@keyframes` or a per-surface animation rule elsewhere."* The slider is not an `.apBtn`, so no existing rule reaches it and it has never pulsed. | **Glow vs. grow is taste.** His documented rule is glow on a stage, swell over the board — and this prompt is over the board, but scaling a 170px track is likely to read badly beside the petals. Also unverified: nobody has confirmed WebKit animates a range-thumb pseudo-element, and his phone is the only real Safari. |
| ~~**P-3**~~ | ~~A wind forecast chip nobody can see~~ **WITHDRAWN 2026-08-27, SAME DAY, BY WYATT: *"what do you mean? I see the forecast chip just fine."* HE IS RIGHT AND THE CLAIM WAS FALSE.** What he sees is the **wind pill** (`WIND NOW: S↓ · FORECAST: W←`, `src/ui/stage.js:1043`) — that IS the forecast and it works. The hidden `.fcChip` is the OLD SVG needle the pill replaced, and it was retired **on purpose**: `index.html:1905` ends with `/* the pill is the instrument now */` and `src/ui/board.js:402` says `// the wind pill supersedes the chip on the stage`. **Two comments state the intent and neither was read before the claim was written.** Nothing to do. | **HOW IT HAPPENED, because it is rule 6 exactly.** A subagent measured the CSS correctly and then narrated it as "maintained for nobody"; the coordinator relayed that to Wyatt without checking. The CSS fact was true; the CONCLUSION was never measured, and the evidence against it was one line further along the same line of code. **An agent's finding is not a measurement either — verify it before it reaches him.** |

## 🟡 THE HOLD AND THE RECIPE READ AS THE SAME THING — his own observation, 2026-08-30

**Wyatt, having just explained for the third time that the greyed red-backed chips are ingredients a
captain STILL NEEDS rather than cargo it holds:** *"If this is unclear to you, then it's probably
unclear to players as well, and we may need to, at some point, add to the backlog a way to make this
clearer."*

**HIS ARGUMENT IS THE STRONGEST KIND OF EVIDENCE AVAILABLE FOR A UI PROBLEM.** Four sessions have
now read this display and drawn the wrong conclusion from it — including one that compared two
screens and reported a sync bug that did not exist. A reader who has the source open and still gets
it wrong is a bad sign for a player who has only the screen.

**What the display actually does today** (`src/ui/board.js:1671`, `:1697`): your own row draws your
RECIPE — one chip per ingredient needed, greyed and red-backed where you have not collected it yet.
A rival's row draws only what they actually HOLD, and reads *"empty hold"* when empty. **So the same
row position means two different things depending on whose it is**, and a captain with nothing can
show five chips while a rival with nothing shows a word.

**NOT SCOPED, AND DELIBERATELY NOT DESIGNED HERE.** Wording, placement and how much is enough are
his. Recorded because he asked for it to be recorded, at the moment he noticed it.
