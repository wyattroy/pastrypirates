# Sea trial v2 — build `2026.09.17.3` (tree `f1a164a0d63c`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-17T18:04:33.440Z  ·  33 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **7 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **7** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 4 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 2 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | green | - |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: index.html, package.json, rules.html, sfx/abacus-click.mp3, sfx/award-whoosh.mp3, sfx/card-swish.mp3, sfx/coin-chink.mp3, sfx/cork-pop.mp3, sfx/crate-chime.mp3, sfx/crate-marimba.mp3, sfx/crate-squawk.mp3, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/shared/storyboard.js, src/shared/words.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/dockcoin.js, src/ui/flow.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/popin.js, src/ui/press.js, src/ui/pulsebeacon.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js, src/ui/victory.js, stats.html
>
> **Depth: FULL. The mechanical picker said FULL.** The depth was DERIVED from the files that changed. Nothing was overridden.
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| **can the vision judge see?** | yes — checked just before sailing — the judge opened a real screenshot and described it |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
== solo-desktop: PASS
[1781s]    coverage: yarrgh:1/1  nah:1/2  vanilla bean crème brûlé:0/2  spiced fudge brownies:1/1  spiced fudge browniesbak:1/1  start:1/1  sail square:30/33  muse#:9/20  menu:0/1  trade:9/18  speckled eggs:2/9  coins:5/9  slider:9/9  offer it:9/9  crustbeard:1/2  walk away:1/3  hot cinnamon:2/8  sugar cane:2/6  vanilla beans:1/7  accept:1/1  counter:0/1  deny:0/1  arrgh:1/1  attack #:1/1  flip coin:2/2  fresh milk:4/6  dough hook:1/1  cacao pods:2/3  dock:1/1
[1781s] 
== solo-phone: FAIL
[1781s]    ✗ vision judge FAILED 1 of 25 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-019-settled.png — dark shape cuts into the top-left corner of the 'Davy Scones, choose yer plunder!' message bubble, as if overlapped/clipped by another element
[1781s]    coverage: yarrgh:1/1  nah:1/2  french pots de crème:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:24/29  trade:8/16  muse#:7/17  speckled eggs:1/5  coins:4/7  slider:5/5  offer it:7/7  flaky jack:1/3  walk away:1/2  menu:0/1  menu open:1/0  menu close:1/0  flip coin:3/3  flee:1/1  stand yer ground:0/1  attack #:2/2  dough hook:1/1  arrgh:1/1  toasty wheat:3/9  fresh milk:2/7  cacao pods:1/7  vanilla beans:4/12  slider disabled:3/3  sugar cane:2/4  call flaky jack:1/2  call crustbeard:1/2  hot cinnamon:0/1  accept:1/1  counter:0/1  deny:0/1
[1781s] 
== solo-tablet: FAIL
[1781s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "Davy Scones: tap to sail"
[1781s]    ✗ offered but never exercised: deny
[1781s]    coverage: yarrgh:1/1  nah:0/1  molten chocolate lava ca:0/2  snickerdoodle bites:1/1  snickerdoodle bitesbake :1/1  start:1/1  sail square:28/31  attack #:3/3  trade:8/19  muse#:8/19  flip coin:3/3  menu:0/1  menu open:1/0  menu close:1/0  sugar cane:1/7  speckled eggs:3/10  coins:3/8  slider:9/9  offer it:8/8  fresh milk:2/10  cacao pods:2/9  flaky jack:1/1  walk away:1/5  call crustbeard:1/2  call flaky jack:1/3  arrgh:1/1  crustbeard:1/2  dough hook:2/3  hot cinnamon:2/4  vanilla beans:1/4  call dough hook:1/1  accept:1/2  counter:1/2  deny:0/3  toasty wheat:3/4  ask it:1/1
[1781s] 
== passplay-phone: FAIL
[1781s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "Peg Leg Meg: tap to sail", "sailCell" over "Peg Leg
[1781s]    ✗ vision judge FAILED 2 of 54 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-043-settled.png — 'Coins' option bubble renders translucent/see-through while the other three option bubbles (Hot Cinnamon, Toasty Wheat, Cacao Pods) are solid white — inconsistent, looks unfinished/broken, and lets th
       · passplay-phone-054-settled.png — large empty dead space inside the voyage-summary card between the headline and the stat lines below it
[1781s]    coverage: yarrgh:1/1  nah:6/14  vanilla bean crème brûlé:0/2  cinnamon snaps:1/1  cinnamon snapsbake this:0/1  cinnamon snapsbake this :1/0  at the helm:50/50  mexican chocolate torte:0/2  crispy cocoa snaps:1/1  crispy cocoa snapsbake t:1/1  start:1/1  sail square:52/52  muse#:16/50  dock:11/13  flip coin:22/22  buy #:4/5  menu:0/1  menu open:1/0  menu close:1/0  trade:16/48  cacao pods:4/23  hot cinnamon:7/28  coins:5/14  slider:14/14  offer it:14/14  flaky jack:2/3  walk away:4/12  accept:2/4  counter:2/4  deny:1/6  peg leg meg:1/2  attack #:7/8  call peg leg meg:4/5  call flaky jack:3/10  toasty wheat:5/13  dough hook:4/7  call dough hook:3/7  call davy scones:3/4  arrgh:1/1  coin:1/1  slider disabled:3/3  ask it:1/1  davy scones#:1/1  #:3/3  hot cinnamon #:3/4  cacao pods #:4/6  speckled eggs:2/7  sugar cane:3/8  vanilla beans:3/5  fresh milk:3/4
[1781s] 
== passplay-desktop: PASS
[1781s]    coverage: yarrgh:1/1  nah:1/2  cinnamon snaps:0/2  crispy cocoa snaps:1/1  crispy cocoa snapsbake t:1/1  at the helm:40/40  cinnamon dutch baby:0/2  cinnamonsugar churros:1/1  cinnamonsugar churrosbak:1/1  start:1/1  sail square:44/44  muse#:17/40  menu:0/1  trade:18/34  fresh milk:4/19  speckled eggs:3/15  coins:14/17  slider:12/12  offer it:17/17  flaky jack:1/1  walk away:0/2  attack #:5/5  call peg leg meg:2/3  call dough hook:1/4  flip coin:5/5  vanilla beans:4/16  dough hook:1/1  call flaky jack:2/5  call davy scones:2/2  sugar cane:3/12  slider disabled:6/6  cacao pods:3/9  toasty wheat:2/4  hot cinnamon:3/5  arrgh:1/1
[1781s] 
== crew-desktop: FAIL
[1781s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "test2: tap to sail"
[1781s]    ✗ 1 moment(s) where the two captains saw different games: captains (Dough: host 6 vs guest 5   (row ORDER differs by design and is not part of this finding))
[1781s]    ✗ vision judge FAILED 1 of 40 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-guest-001-settled.png — board artwork, logo, top-ribbon icons and sidebar menu icons all failed to render (blank grid, plain circles, icon-less menu) compared to the matching host view
[1781s]    coverage: yarrgh:1/1  nah:0/2  dark chocolate cream puf:0/2  spiced fudge brownies:1/1  spiced fudge browniesbak:1/1  start:1/1  sail square:19/21  dock:1/1  trade:6/14  muse#:6/14  flip coin:2/2  buy #:1/1  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  toasty wheat:3/10  vanilla beans:1/5  hot cinnamon:1/6  coins:3/6  slider:6/6  offer it:6/6  dough hook:1/1  walk away:0/2  arrgh:1/1  sugar cane:2/5  cacao pods:1/5  speckled eggs:1/2  flaky jack:1/1  accept:1/1  counter:0/1  deny:0/1  attack #:1/1
[1781s] 
== crew-phone: FAIL
[1781s]    ✗ 3 structural check failure(s): no-cover-ask×3 — first: control covering the question it answers: "sailCell" over "test1: tap to sail"
[1781s]    ✗ offered but never exercised: deny
[1781s]    ✗ 2 moment(s) where the two captains saw different games: captains (Dough: host 8 vs guest 7   (row ORDER differs by design and is not part of this finding)); captains (Dough: host 15 vs guest 14   (row ORDER differs by design and is not part of this finding))
[1781s]    ✗ vision judge FAILED 3 of 62 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-host-004-settled.png — large empty dead space below the board with no captains panel, despite the message saying a recipe was already chosen
       · crew-phone-guest-025-settled.png — 'Flaky Jack' and 'Walk away' option circles overlap each other on the board
       · crew-phone-guest-028-settled.png — trade-quantity slider control overlaps the bottom edge of the 'test2: ye're ASKIN'' message bubble above it
[1781s]    coverage: yarrgh:1/1  nah:0/1  snickerdoodle bites:0/2  cinnamonchocolate fudge:1/1  cinnamonchocolate fudgeb:1/1  start:1/1  sail square:24/27  trade:8/17  muse#:8/17  cacao pods:4/13  coins:3/8  slider:9/9  offer it:8/8  call test#:1/3  call flaky jack:1/2  call dough hook:2/3  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  fresh milk:3/8  dough hook:2/3  walk away:1/4  arrgh:1/1  accept:2/5  counter:2/5  deny:1/7  sugar cane:2/7  flaky jack:1/2  coin:2/2  slider disabled:1/1  ask it:2/2  speckled eggs:2/5  attack #:1/1  flip coin:1/1  hot cinnamon:2/2  vanilla beans:1/1
[1781s] 
== solo-desktop-wk: PASS
[1781s]    coverage: yarrgh:1/1  nah:0/1  snickerdoodle bites:0/2  caramel slice:1/1  caramel slicebake this:0/1  caramel slicebake this c:1/0  start:1/1  sail square:29/33  trade:7/17  muse#:7/17  fresh milk:3/9  coins:3/7  slider:7/7  offer it:7/7  call flaky jack:1/4  call crustbeard:1/2  menu:0/1  sugar cane:2/7  vanilla beans:1/7  dough hook:2/3  walk away:1/4  flip coin:4/4  flee:1/1  stand yer ground:0/1  call dough hook:2/2  cacao pods:2/7  crustbeard:1/1  speckled eggs:1/4  accept:1/1  counter:0/1  deny:0/1  attack #:3/3  arrgh:1/1  toasty wheat:2/3  hot cinnamon:1/2
[1781s] 
== solo-phone-wk: FAIL
[1781s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "Davy Scones: tap to sail"
[1781s]    coverage: yarrgh:1/1  nah:0/1  spiced fudge brownies:0/2  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:23/29  trade:9/17  muse#:8/17  fresh milk:3/12  coins:4/9  slider:9/9  offer it:9/9  dough hook:2/4  walk away:2/4  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:2/8  call flaky jack:1/1  call crustbeard:0/1  sugar cane:2/7  flip coin:1/1  speckled eggs:4/11  vanilla beans:1/5  cacao pods:2/5  arrgh:1/1
[1781s] 
== solo-tablet-wk: PASS
[1781s]    coverage: yarrgh:1/1  nah:1/2  cinnamonsugar churros:0/2  molten chocolate lava ca:2/2  start:1/1  sail square:36/46  muse#:9/20  menu:0/1  menu open:1/0  menu close:1/0  call crustbeard:2/4  call flaky jack:2/4  trade:9/18  toasty wheat:2/11  coins:3/9  slider:9/9  offer it:9/9  flaky jack:2/3  walk away:1/5  dock:1/1  flip coin:2/2  fresh milk:3/13  speckled eggs:2/8  dough hook:1/2  hot cinnamon:2/9  attack #:1/1  arrgh:1/1  vanilla beans:2/6  cacao pods:3/7  crustbeard:1/1  sugar cane:2/2
[1781s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
