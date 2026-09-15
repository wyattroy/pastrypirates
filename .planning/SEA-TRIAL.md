# Sea trial v2 — build `2026.09.15.2` (tree `1cb83adec3e6`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-15T06:33:43.153Z  ·  19 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **2 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **2** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 3 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 5 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | green | - |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: index.html, package.json, rules.html, sfx/abacus-click.mp3, sfx/award-whoosh.mp3, sfx/card-swish.mp3, sfx/cork-pop.mp3, sfx/crate-chime.mp3, sfx/crate-marimba.mp3, sfx/crate-squawk.mp3, src/engine/index.js, src/orchestrator.js, src/shared/index.js, src/shared/words.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/flow.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/popin.js, src/ui/press.js, src/ui/pulsebeacon.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
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
[1043s]    ✗ vision judge FAILED 1 of 28 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-desktop-002-settled.png — faint ghost text ('...pick yer recipe:' and 'tap a recipe to squ...') bleeding through onto the board/map where no dialog belongs; right-hand panel is completely empty despite this being the recipe-pi
[1043s]    coverage: yarrgh:1/1  nah:0/1  mexican chocolate pots:0/2  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:35/36  muse#:9/21  menu:0/1  trade:9/20  cacao pods:4/15  coins:3/9  slider:9/9  offer it:9/9  dough hook:1/1  walk away:0/2  call flaky jack:1/1  call crustbeard:0/2  sugar cane:2/10  fresh milk:3/8  speckled eggs:2/8  toasty wheat:4/7  hot cinnamon:2/6  flaky jack:1/1  attack #:3/3  flip coin:3/3  arrgh:1/1  vanilla beans:1/3  call dough hook:1/1  accept:1/1  counter:0/1  deny:0/1
[1043s] 
== solo-phone: FAIL
[1043s]    ✗ offered but never exercised: walk away
[1043s]    coverage: yarrgh:1/1  nah:0/1  mayan cocoa soufflé:0/2  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:27/29  trade:8/14  muse#:7/15  sugar cane:2/8  hot cinnamon:1/8  coins:7/8  slider:7/7  offer it:8/8  crustbeard#:1/1  walk away:0/3  menu:0/1  menu open:1/0  menu close:1/0  flip coin:1/1  call flaky jack:1/2  call crustbeard:1/2  fresh milk:3/8  speckled eggs:1/6  slider disabled:1/1  vanilla beans:1/6  arrgh:1/1  cacao pods:1/2  dough hook:1/2  accept:1/1  counter:0/1  deny:0/1  crustbeard:1/1
[1043s] 
== solo-tablet: FAIL
[1043s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "Davy Scones: tap to sail"
[1043s]    coverage: yarrgh:1/1  nah:1/3  cinnamon sponge cake:0/2  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:27/28  dock:2/2  muse#:7/17  flip coin:2/2  buy #:1/2  menu:0/1  menu open:1/0  menu close:1/0  trade:8/15  fresh milk:3/10  speckled eggs:2/8  vanilla beans:1/9  coins:3/8  slider:7/7  offer it:8/8  dough hook:2/3  walk away:1/4  hot cinnamon:2/8  slider disabled:1/1  sugar cane:3/8  cacao pods:1/6  call dough hook:1/1  call crustbeard:0/1  dough hook#:1/1  arrgh:1/1  toasty wheat:1/1
[1043s] 
== passplay-phone: FAIL
[1043s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "Dough Hook" over "Fer yer  Cacao Pods the table "
[1043s]    coverage: yarrgh:1/1  nah:0/2  dark chocolate cream puf:0/2  french pots de crème:1/1  french pots de crèmebake:1/1  at the helm:26/26  caramel slice:0/2  cinnamon sponge cake:1/1  cinnamon sponge cakebake:1/1  start:1/1  sail square:28/28  trade:12/26  muse#:12/26  speckled eggs:2/12  coins:6/12  slider:12/12  offer it:12/12  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:4/13  fresh milk:2/10  dock:1/1  flip coin:2/2  buy #:1/1  vanilla beans:1/7  flaky jack:1/1  walk away:1/4  attack #:1/1  call davy scones:1/1  call flaky jack:0/1  sugar cane:2/6  cacao pods:5/9  dough hook:1/2  arrgh:1/1  hot cinnamon:2/2  dough hook#:1/1
[1043s] 
== passplay-desktop: PASS
[1043s]    coverage: yarrgh:1/1  nah:0/1  molten chocolate lava ca:0/2  spiced cocoa shortbread:1/1  spiced cocoa shortbreadb:1/1  at the helm:31/31  cinnamon snaps:0/2  cinnamonsugar churros:1/1  cinnamonsugar churrosbak:1/1  start:1/1  sail square:36/36  muse#:15/30  menu:0/1  trade:15/26  fresh milk:9/25  speckled eggs:4/16  coins:8/15  slider:9/9  offer it:15/15  dough hook:1/1  walk away:0/2  flaky jack:1/1  slider disabled:6/6  accept:1/1  counter:0/1  deny:0/1  sugar cane:3/9  toasty wheat:2/6  hot cinnamon:1/3  cacao pods:1/2  vanilla beans:2/4
[1043s] 
== crew-desktop: FAIL
[1043s]    ✗ offered but never exercised: vanilla beans
[1043s]    coverage: yarrgh:1/1  nah:0/1  mexican chocolate torte:0/2  mexican chocolate pots:1/1  mexican chocolate potsba:1/1  start:1/1  sail square:23/23  trade:7/15  muse#:7/15  fresh milk:1/6  cacao pods:1/6  coins:6/6  slider:6/6  offer it:6/6  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  call test#:1/2  call flaky jack:1/2  hot cinnamon:1/5  speckled eggs:1/4  vanilla beans:1/4  dough hook:1/2  walk away:1/2  accept:1/1  counter:0/1  deny:0/1  sugar cane:1/3  attack #:1/1  flip coin:1/1
[1043s] 
== crew-phone: FAIL
[1043s]    ✗ offered but never exercised: vanilla beans
[1043s]    ✗ offered but never exercised: vanilla beans, deny
[1043s]    ✗ vision judge FAILED 1 of 39 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-guest-014-settled.png — second message bubble ('test1 has no other cargo — ye can ask for coin, or deny.') is rendered semi-transparent, letting the anchor/dock artwork bleed through and reduce text legibility, inconsistent 
[1043s]    coverage: yarrgh:1/1  nah:1/3  mexican chocolate torte:0/2  cinnamon sponge cake:1/1  cinnamon sponge cakebake:1/1  start:1/1  sail square:13/13  dock:2/2  muse#:3/9  flip coin:2/2  buy #:1/2  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  accept:1/1  counter:0/1  deny:0/1  trade:4/8  cacao pods:2/5  vanilla beans:0/3  coins:2/4  slider:4/4  offer it:4/4  test#:1/1  walk away:0/2  speckled eggs:2/5  dough hook:1/1  arrgh:1/1  fresh milk:1/2  sugar cane:1/2  hot cinnamon:0/1
[1043s] 
== solo-desktop-wk: PASS
[1043s]    coverage: yarrgh:1/1  nah:1/4  pound cake:0/2  spiced cocoa shortbread:1/1  spiced cocoa shortbreadb:1/1  start:1/1  sail square:32/33  dock:3/4  muse#:6/17  flip coin:5/5  buy #:2/3  menu:0/1  trade:7/16  fresh milk:2/7  sugar cane:3/13  coins:2/7  slider:7/7  offer it:7/7  toasty wheat:2/6  cacao pods:1/6  call crustbeard:1/2  call dough hook:1/2  speckled eggs:2/9  vanilla beans:1/5  dough hook:1/1  walk away:0/1  arrgh:1/1  attack #:1/1  hot cinnamon:1/2
[1043s] 
== solo-phone-wk: FAIL
[1043s]    ✗ offered but never exercised: vanilla beans
[1043s]    coverage: yarrgh:1/1  nah:0/1  crispy cocoa snaps:0/2  snickerdoodle bites:1/1  snickerdoodle bitesbake :1/1  start:1/1  sail square:30/31  trade:7/14  muse#:7/15  fresh milk:1/7  cacao pods:1/7  coins:5/7  slider:6/6  offer it:7/7  menu:0/1  menu open:1/0  menu close:1/0  speckled eggs:2/6  vanilla beans:0/4  crustbeard:1/1  walk away:0/2  sugar cane:2/4  hot cinnamon:1/4  flaky jack:1/1  call crustbeard:1/1  call dough hook:0/1  toasty wheat:2/3  attack #:1/1  flip coin:1/1  arrgh:1/1  slider disabled:1/1
[1043s] 
== solo-tablet-wk: FAIL
[1043s]    ✗ vision judge FAILED 1 of 24 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-wk-024-settled.png — faint ghosted/doubled text bleeding through behind the Bakeries/HEADS stat rows, appears to be the previous screen's recipe panel text showing through
[1043s]    coverage: yarrgh:1/1  nah:1/3  cinnamon sponge cake:0/2  vanilla bean crème brûlé:2/2  start:1/1  sail square:21/21  dock:2/4  muse#:6/15  flip coin:4/4  buy #:1/1  menu:0/1  menu open:1/0  menu close:1/0  trade:6/14  fresh milk:1/7  sugar cane:1/6  coins:2/6  slider:6/6  offer it:6/6  dough hook:1/1  walk away:1/4  hot cinnamon:3/5  flaky jack:2/3  toasty wheat:2/4  speckled eggs:1/4  attack #:1/1  arrgh:1/1  vanilla beans:2/4
[1043s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
