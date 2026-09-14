# Sea trial v2 — build `2026.09.14.2` (tree `6be6748b97a2`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-14T12:21:57.682Z  ·  23 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **3 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **3** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 6 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 3 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | **RED** | docs or tooling can fail here. That is NOT the game. |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: index.html, package.json, rules.html, sfx/cork-pop.mp3, src/orchestrator.js, src/shared/index.js, src/shared/words.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/popin.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
>
> **Depth: FULL. The mechanical picker said FULL.** The depth was DERIVED from the files that changed. Nothing was overridden.
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | **FAIL** |
| **can the vision judge see?** | yes — checked just before sailing — the judge opened a real screenshot and described it |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |


## The browser-free checks failed

**FAILING GATE:** `node scripts/qa/sitemap_lastmod_check.mjs`

```
ok   https://playpastrypirates.com/about.html -> about.html @ 2026-09-12
  ok   https://playpastrypirates.com/credits.html -> credits.html @ 2026-09-12
  ok   https://playpastrypirates.com/privacy.html -> privacy.html @ 2026-09-12
  ok   https://playpastrypirates.com/rules.html -> rules.html @ 2026-09-13
sitemap_lastmod_check: FAIL — 1 problem(s) in sitemap.xml

  x https://playpastrypirates.com/ says lastmod 2026-09-13; git says index.html last changed 2026-09-14

  Regenerate it, never hand-type a date:  node scripts/qa/sitemap_write.mjs
```

## The voyages, in full

```
== solo-desktop: PASS
[1228s]    coverage: yarrgh:1/1  nah:1/5  cinnamonsugar churros:1/1  mexican chocolate pots:0/2  cinnamonsugar churrosbak:1/1  start:1/1  sail square:32/32  trade:11/26  muse#:10/26  toasty wheat:3/10  coins:4/11  slider:11/11  offer it:11/11  menu:0/1  sugar cane:2/10  speckled eggs:4/15  vanilla beans:3/12  call crustbeard:2/5  call dough hook:1/2  fresh milk:4/14  dock:4/4  flip coin:5/5  buy #:2/2  cacao pods:3/10  hot cinnamon:2/8  arrgh:1/1  attack #:1/1  crustbeard:1/2  dough hook:2/4  walk away:2/5  call flaky jack:2/3  flaky jack:1/1  #:1/1
[1228s] 
== solo-phone: FAIL
[1228s]    ✗ vision judge FAILED 1 of 23 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-010-settled.png — 'Tap and hold the sea to reveal the board' hint bar sits at the top of the board and is overlapped/obscured by the back-arrow button and the 'What do ye WANT from the table?' prompt bubble
[1228s]    coverage: yarrgh:1/1  nah:0/1  cinnamon dutch baby:1/1  mexican chocolate torte:0/2  cinnamon dutch babybake :1/1  start:1/1  call crustbeard:1/2  call flaky jack:1/2  sail square:43/44  trade:9/19  muse#:9/19  speckled eggs:1/9  coins:6/9  slider:9/9  offer it:9/9  menu:0/1  menu open:1/0  menu close:1/0  cacao pods:1/8  attack #:1/1  crustbeard:1/1  flaky jack:1/2  flip coin:2/2  fire again #:1/2  break off:1/2  sugar cane:2/6  vanilla beans:1/7  hot cinnamon:1/6  fresh milk:5/7  walk away:0/1  arrgh:1/1  toasty wheat:1/1
[1228s] 
== solo-tablet: FAIL
[1228s]    ✗ vision judge FAILED 1 of 19 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-019-settled.png — faint ghosted text/icons (recipe panel header and ingredient crates) bleeding through and overlapping the Days/Battles/Trades/Bakeries stats block and the area behind Play again
[1228s]    coverage: yarrgh:1/1  nah:0/1  molten chocolate lava ca:2/2  cinnamon snaps:0/2  start:1/1  sail square:15/15  muse#:6/12  menu:0/1  menu open:1/0  menu close:1/0  trade:6/11  vanilla beans:2/7  coins:3/6  slider:6/6  offer it:6/6  dough hook:1/2  walk away:1/3  speckled eggs:3/9  flaky jack:1/1  fresh milk:1/4  sugar cane:1/3  cacao pods:1/3  arrgh:1/1  toasty wheat:1/2  hot cinnamon:0/2  call crustbeard:1/1  call dough hook:0/1
[1228s] 
== passplay-phone: FAIL
[1228s]    ✗ vision judge FAILED 1 of 35 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-020-settled.png — left back/pagination arrow button overlaps the 'Peg Leg Meg' speech bubble and is jammed against the left edge of the board
[1228s]    coverage: yarrgh:1/1  nah:0/2  cinnamonsugar churros:1/1  cinnamon snaps:0/2  cinnamonsugar churrosbak:1/1  at the helm:35/35  chocolate genoise sponge:0/2  chocolate fudge torte:1/1  chocolate fudge tortebak:1/1  start:1/1  sail square:46/46  muse#:16/35  menu:0/1  menu open:1/0  menu close:1/0  trade:17/32  toasty wheat:5/18  coins:6/16  slider:16/16  offer it:16/16  dough hook:2/3  walk away:1/6  accept:2/4  counter:1/4  deny:1/5  davy scones:2/2  call flaky jack:1/3  call dough hook:1/2  coin:1/1  ask it:1/1  dock:1/1  flip coin:2/2  buy #:1/1  speckled eggs:3/12  cacao pods:4/10  arrgh:1/1  vanilla beans:2/10  attack #:1/1  call peg leg meg:1/1  sugar cane:3/9  fresh milk:7/12  flaky jack:1/1  hot cinnamon:2/3  slider disabled:1/1
[1228s] 
== passplay-desktop: FAIL
[1228s]    ✗ 1 dead control(s): Cinnamon-Sugar Churros
[1228s]    ✗ offered but never exercised: cinnamon sponge cake, walk away
[1228s]    ✗ vision judge FAILED 1 of 27 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-005-settled.png — two recipe cards stacked/overlapping over the board instead of in the side panel, obscuring map content; the two cards' ingredient icon rows and titles crowd together, reading as one blended overlappi
[1228s]    coverage: yarrgh:1/1  nah:0/1  cinnamon dutch baby:1/1  mayan cocoa soufflé:0/2  cinnamon dutch babybake :1/1  at the helm:29/29  cinnamon sponge cake:0/3  cinnamonsugar churros:2/2  cinnamonsugar churrosbak:1/1  start:1/1  sail square:33/33  muse#:13/28  menu:0/1  trade:13/26  toasty wheat:2/13  fresh milk:2/13  coins:10/13  slider:13/13  offer it:13/13  cacao pods:2/11  vanilla beans:2/8  sugar cane:2/6  attack #:2/2  call peg leg meg:1/1  call dough hook:0/1  flip coin:3/3  speckled eggs:4/7  dough hook:1/1  walk away:0/3  hot cinnamon:2/2  dough hook#:1/1  call davy scones:1/1  call flaky jack:0/1  fire again #:1/2  break off:1/2  accept:1/1  counter:0/1  deny:0/1  peg leg meg:1/1
[1228s] 
== crew-desktop: FAIL
[1228s]    ✗ offered but never exercised: deny
[1228s]    ✗ vision judge FAILED 2 of 68 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-guest-002-settled.png — ghosted, low-opacity recipe-picker card and route text rendered on top of the map, overlapping the board icons and nearly unreadable; no legible recipe panel shown in the right sidebar, unlike the equ
       · crew-desktop-host-002-settled.png — ghosted, low-opacity recipe-picker card and route text rendered on top of the map, overlapping the board icons and nearly unreadable; no legible recipe panel shown in the right sidebar, unlike the equ
[1228s]    coverage: yarrgh:1/1  nah:0/2  cinnamonsugar churros:1/1  mexican chocolate pots:0/2  cinnamonsugar churrosbak:1/1  start:1/1  sail square:26/26  trade:7/17  muse#:6/17  toasty wheat:3/9  coins:3/7  slider:7/7  offer it:7/7  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  speckled eggs:1/7  cacao pods:1/8  call test#:2/3  call dough hook:0/1  hot cinnamon:2/8  vanilla beans:2/9  test#:1/2  walk away:0/2  call flaky jack:1/2  dock:1/1  flip coin:6/6  buy #:1/1  sugar cane:1/4  flaky jack:1/1  accept:1/2  counter:1/2  deny:0/3  arrgh:1/1  attack #:3/3  fire again #:1/2  break off:1/2  fresh milk:2/5  coin:1/1  slider disabled:1/1  ask it:1/1  dough hook:1/1
[1228s] 
== crew-phone: PASS
[1228s]    coverage: yarrgh:1/1  nah:0/1  spiced fudge brownies:1/1  mexican chocolate pots:0/2  spiced fudge browniesbak:1/1  start:1/1  call test#:1/2  call flaky jack:0/1  sail square:25/25  trade:11/21  muse#:10/21  hot cinnamon:2/10  coins:7/11  slider:12/12  offer it:11/11  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  sugar cane:2/10  speckled eggs:3/8  vanilla beans:3/9  dough hook:3/6  walk away:2/7  accept:2/4  counter:1/4  deny:1/5  cacao pods:2/6  flaky jack:1/1  coin:1/1  ask it:1/1  call dough hook:1/1  toasty wheat:3/6  arrgh:1/1  test#:1/1
[1228s] 
== solo-desktop-wk: PASS
[1228s]    coverage: yarrgh:1/1  nah:0/2  mexican chocolate pots:1/1  chocolate genoise sponge:0/2  mexican chocolate potsba:1/1  start:1/1  sail square:29/29  trade:7/16  muse#:7/16  fresh milk:1/7  sugar cane:2/8  vanilla beans:1/7  coins:3/7  slider:7/7  offer it:7/7  flaky jack:1/1  walk away:1/4  menu:0/1  accept:1/1  counter:0/1  deny:0/1  dock:1/1  flip coin:4/4  buy #:1/1  toasty wheat:3/9  dough hook:1/2  speckled eggs:1/3  cacao pods:3/5  hot cinnamon:1/5  crustbeard:1/1  arrgh:1/1  flee:1/2  stand yer ground:1/2  attack #:1/1
[1228s] 
== solo-phone-wk: FAIL
[1228s]    ✗ 2 structural check failure(s): not-occluded×1, sail-clickable×1 — first: clickable covered by something else: sailCell <- covered by .pp4BubIn <div>, sailCell <- covered by .pp4BubIn 
[1228s]    coverage: yarrgh:1/1  nah:2/6  pound cake:1/1  dark chocolate cream puf:0/2  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:22/24  muse#:6/18  call crustbeard:1/1  call dough hook:0/1  menu:0/1  menu open:1/0  menu close:1/0  attack #:2/2  trade:6/17  flip coin:6/6  toasty wheat:2/8  sugar cane:1/6  speckled eggs:3/11  coins:2/5  slider:4/4  offer it:5/5  arrgh:1/1  cacao pods:1/5  slider disabled:2/2  hot cinnamon:1/4  flaky jack:1/1  walk away:0/1  vanilla beans:3/4  dock:4/4  buy #:2/2  #:1/1  vanilla beans #:1/1
[1228s] 
== solo-tablet-wk: FAIL
[1228s]    ✗ 1 dead control(s): Cinnamon Sponge CakeBake this! (commit)
[1228s]    ✗ offered but never exercised: vanilla bean crème brûlé
[1228s]    ✗ vision judge FAILED 1 of 18 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-wk-018-settled.png — faint ghosted text/icons from the recipe/captains panel bleeding through behind the stats list (around the Bakeries/HEADS rows), doubled content
[1228s]    coverage: yarrgh:1/1  nah:0/1  cinnamon sponge cake:1/1  vanilla bean crème brûlé:0/3  cinnamon sponge cakebake:2/2  start:1/1  sail square:30/35  trade:9/18  muse#:9/19  sugar cane:1/9  coins:9/9  slider:8/8  offer it:9/9  menu:0/1  menu open:1/0  menu close:1/0  vanilla beans:1/8  toasty wheat:2/7  cacao pods:1/7  dough hook:1/2  walk away:1/2  attack #:1/1  flip coin:1/1  arrgh:1/1  speckled eggs:1/6  slider disabled:1/1  call crustbeard:1/1  call flaky jack:0/1  fresh milk:2/4  hot cinnamon:1/1
[1228s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
