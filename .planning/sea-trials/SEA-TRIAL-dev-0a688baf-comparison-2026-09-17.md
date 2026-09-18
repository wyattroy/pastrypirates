# Sea trial v2 — build `2026.09.17.3` (tree `79af507b44b4`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-17T18:40:36.280Z  ·  27 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **6 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **6** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 4 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 2 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | green | - |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: index.html, package.json, rules.html, sfx/abacus-click.mp3, sfx/award-whoosh.mp3, sfx/card-swish.mp3, sfx/coin-chink.mp3, sfx/cork-pop.mp3, sfx/crate-chime.mp3, sfx/crate-marimba.mp3, sfx/crate-squawk.mp3, src/engine/index.js, src/orchestrator.js, src/shared/index.js, src/shared/storyboard.js, src/shared/words.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/dockcoin.js, src/ui/flow.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/popin.js, src/ui/press.js, src/ui/pulsebeacon.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js, src/ui/victory.js, stats.html
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
== solo-desktop: FAIL
[1458s]    ✗ offered but never exercised: hot cinnamon
[1458s]    coverage: yarrgh:1/1  nah:0/1  chocolate fudge torte:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:28/29  muse#:6/14  menu:0/1  trade:7/13  toasty wheat:4/11  coins:4/7  slider:6/6  offer it:7/7  crustbeard:1/2  walk away:1/4  slider disabled:1/1  sugar cane:2/5  cacao pods:1/5  call crustbeard:1/3  call dough hook:0/1  attack #:1/1  dough hook:2/4  flip coin:1/1  hot cinnamon:0/3  call flaky jack:2/2  fresh milk:1/2  speckled eggs:2/4  arrgh:1/1  flaky jack:1/1
[1458s] 
== solo-phone: PASS
[1458s]    coverage: yarrgh:1/1  nah:0/1  cinnamon dutch baby:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:19/19  trade:7/13  muse#:6/13  speckled eggs:1/6  coins:3/7  slider:7/7  offer it:7/7  menu:0/1  menu open:1/0  menu close:1/0  call dough hook:1/1  call crustbeard:0/1  vanilla beans:2/6  flaky jack:1/1  walk away:0/2  toasty wheat:4/9  hot cinnamon:1/5  dough hook:1/1  sugar cane:1/3  cacao pods:1/4  arrgh:1/1  fresh milk:1/3
[1458s] 
== solo-tablet: FAIL
[1458s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "Davy Scones: tap to sail"
[1458s]    coverage: yarrgh:1/1  nah:0/1  cinnamon dutch baby:0/2  cinnamonchocolate fudge:1/1  cinnamonchocolate fudgeb:1/1  start:1/1  sail square:45/53  muse#:13/27  menu:0/1  menu open:1/0  menu close:1/0  trade:14/26  sugar cane:2/14  coins:6/14  slider:13/13  offer it:14/14  crustbeard:1/2  walk away:1/5  flip coin:1/1  vanilla beans:2/13  slider disabled:1/1  call dough hook:2/3  call flaky jack:2/5  toasty wheat:4/12  hot cinnamon:2/11  fresh milk:3/10  dough hook:1/1  call crustbeard:2/4  speckled eggs:7/14  flaky jack:1/1  arrgh:1/1  cacao pods:2/4  crustbeard#:1/1
[1458s] 
== passplay-phone: FAIL
[1458s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "Peg Leg Meg: tap to sail"
[1458s]    ✗ vision judge FAILED 1 of 26 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-023-settled.png — Vanilla Beans and Coins radial option circles overlap each other
[1458s]    coverage: yarrgh:1/1  nah:0/1  cinnamonchocolate fudge:0/2  mexican chocolate torte:1/1  mexican chocolate torteb:1/1  at the helm:40/40  cinnamon snaps:0/2  crispy cocoa snaps:1/1  crispy cocoa snapsbake t:1/1  start:1/1  sail square:42/42  muse#:20/40  menu:0/1  menu open:1/0  menu close:1/0  trade:20/37  vanilla beans:4/21  coins:17/20  slider:7/7  offer it:20/20  flaky jack:1/2  walk away:2/6  accept:1/2  counter:0/1  deny:1/2  peg leg meg:1/1  cacao pods:4/18  toasty wheat:4/17  dough hook:2/3  speckled eggs:4/15  call flaky jack:1/1  call peg leg meg:0/1  flip coin:1/1  slider disabled:13/13  fresh milk:4/11  arrgh:1/1  hot cinnamon:3/3
[1458s] 
== passplay-desktop: PASS
[1458s]    coverage: yarrgh:1/1  nah:4/5  molten chocolate lava ca:0/2  cinnamonsugar churros:1/1  cinnamonsugar churrosbak:1/1  at the helm:39/39  cinnamon sponge cake:0/2  french pots de crème:1/1  french pots de crèmebake:1/1  start:1/1  call flaky jack:1/3  call dough hook:1/4  sail square:46/46  trade:18/38  muse#:17/38  speckled eggs:4/18  coins:7/14  slider:11/11  offer it:14/14  attack #:3/3  call peg leg meg:1/1  flip coin:4/4  menu:0/1  fresh milk:7/24  dough hook:2/3  walk away:1/6  arrgh:1/1  hot cinnamon:4/13  slider disabled:7/7  toasty wheat:5/8  cacao pods:4/10  call davy scones:2/2  flaky jack:2/2  fire again #:1/1  break off:0/1  accept:1/1  counter:0/1  deny:0/1  davy scones:1/1  sugar cane:5/6
[1458s] 
== crew-desktop: FAIL
[1458s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "test2: tap to sail"
[1458s]    ✗ offered but never exercised: walk away
[1458s]    ✗ 3 moment(s) where the two captains saw different games: captains (Flaky: host 8 vs guest 7   (row ORDER differs by design and is not part of this finding)); captains (Flaky: host 9 vs guest 8   (row ORDER differs by design and is not part of this finding)); captains (Flaky: host 10 vs guest 9   (row ORDER differs by design and is not part of this finding))
[1458s]    coverage: yarrgh:1/1  nah:0/1  cocoa cloud soufflé:0/2  cinnamonsugar churros:1/1  cinnamonsugar churrosbak:1/1  start:1/1  sail square:34/37  muse#:9/21  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:9/20  sugar cane:4/12  coins:5/9  slider:7/7  offer it:9/9  test#:1/1  walk away:0/3  flip coin:5/5  cacao pods:2/8  slider disabled:2/2  arrgh:1/1  dough hook:1/1  fresh milk:2/6  call dough hook:1/1  call flaky jack:0/1  toasty wheat:3/8  dough hook#:1/1  accept:1/1  counter:0/1  deny:0/1  attack #:3/3  hot cinnamon:2/4  vanilla beans:1/3
[1458s] 
== crew-phone: FAIL
[1458s]    ✗ 2 structural check failure(s): no-cover-ask×2 — first: control covering the question it answers: "sailCell" over "test2: tap to sail"
[1458s]    ✗ 5 moment(s) where the two captains saw different games: captains (Flaky: host 2 vs guest 1   (row ORDER differs by design and is not part of this finding)); captains (Flaky: host 11 vs guest 10   (row ORDER differs by design and is not part of this finding)); captains (Flaky: host 13 vs guest 12   (row ORDER differs by design and is not part of this finding))
[1458s]    ✗ vision judge FAILED 3 of 60 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-guest-001-settled.png — parrot icon missing from 'Nah' button and from top-bar hint icon (present on host screen, absent here)
       · crew-phone-host-005-settled.png — large empty dead space filling the bottom half of the screen below the board while waiting for the rest of the crew
       · crew-phone-host-031-settled.png — large empty dead space in the end-of-voyage summary card where missing-ingredient icons should appear (compare same card in crew-phone-guest-029-settled.png which shows icons in that gap)
[1458s]    coverage: yarrgh:1/1  nah:0/1  pound cake:0/2  cinnamon sponge cake:1/1  cinnamon sponge cakebake:1/1  start:1/1  sail square:33/37  trade:11/23  muse#:11/23  cacao pods:4/13  hot cinnamon:3/12  coins:4/11  slider:12/12  offer it:11/11  test#:2/2  walk away:2/8  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  call dough hook:1/1  call flaky jack:1/3  dough hook:3/5  accept:1/3  counter:1/3  deny:1/4  attack #:1/1  flip coin:1/1  speckled eggs:2/7  vanilla beans:2/6  arrgh:1/1  sugar cane:3/7  toasty wheat:4/6  flaky jack:1/1  coin:1/1  ask it:1/1  call test#:1/2
[1458s] 
== solo-desktop-wk: FAIL
[1458s]    ✗ vision judge FAILED 2 of 26 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-desktop-wk-002-settled.png — right-side panel is a large empty dead space where the recipe picker should be (board and menu render, but no recipe content between them)
       · solo-desktop-wk-014-settled.png — small gold coin icon floats alone in open water, not over the boat, dock, or any UI element it belongs to
[1458s]    coverage: yarrgh:1/1  nah:0/2  mexican chocolate pots:0/2  spiced cocoa shortbread:1/1  spiced cocoa shortbreadb:1/1  start:1/1  sail square:33/35  trade:7/16  muse#:7/16  cacao pods:1/7  coins:2/7  slider:7/7  offer it:7/7  menu:0/1  call dough hook:1/2  call crustbeard:0/1  dock:1/1  flip coin:2/2  buy #:1/1  call flaky jack:1/1  sugar cane:2/6  speckled eggs:2/6  fresh milk:2/6  hot cinnamon:1/5  dough hook:1/1  walk away:0/2  attack #:1/1  toasty wheat:3/6  crustbeard:1/1  vanilla beans:1/2  arrgh:1/1
[1458s] 
== solo-phone-wk: PASS
[1458s]    coverage: yarrgh:1/1  nah:0/1  cocoa cloud soufflé:0/2  vanilla bean crème brûlé:2/2  start:1/1  sail square:23/28  trade:8/16  muse#:8/16  speckled eggs:1/7  coins:3/8  slider:8/8  offer it:8/8  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:2/7  vanilla beans:4/10  dough hook:2/3  walk away:1/4  arrgh:1/1  toasty wheat:2/4  call dough hook:2/3  call flaky jack:1/2  call crustbeard:1/3  cacao pods:3/4  flaky jack:1/1  hot cinnamon:1/2
[1458s] 
== solo-tablet-wk: FAIL
[1458s]    ✗ vision judge FAILED 1 of 21 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-wk-021-settled.png — White 'Davy Scones' result dialog overlaps the captains panel below it, slicing row labels mid-word ('Spiced F', 'Davy Scon', 'Dough Ho') and cutting crate/egg icons on the right edge
[1458s]    coverage: yarrgh:1/1  nah:0/1  pound cake:0/2  spiced fudge brownies:1/1  spiced fudge browniesbak:1/1  start:1/1  sail square:33/42  trade:9/18  muse#:9/19  hot cinnamon:2/9  coins:6/9  slider:8/8  offer it:9/9  call dough hook:1/2  call flaky jack:0/1  menu:0/1  menu open:1/0  menu close:1/0  call crustbeard:1/1  crustbeard:1/1  walk away:1/3  flip coin:2/2  attack #:1/1  arrgh:1/1  toasty wheat:1/6  sugar cane:1/6  slider disabled:1/1  fresh milk:2/6  cacao pods:1/5  vanilla beans:1/6  speckled eggs:4/8  dough hook:1/2
[1458s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
