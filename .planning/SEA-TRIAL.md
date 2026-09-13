# Sea trial v2 — build `2026.09.07.3` (tree `611ddfc32621`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-13T14:57:49.711Z  ·  26 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **no game fault was measured. Read the split before acting on anything.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **0** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 5 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 6 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | green | - |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, assets/ingredients/sugar.png, assets/plaque/column.png, assets/plaque/phone.png, assets/plaque/tablet.png, credits.html, index.html, package.json, privacy.html, rules.html, sfx/creak-1.mp3, sfx/creak-2.mp3, sfx/creak-3.mp3, sfx/creak-4.mp3, sfx/creak-5.mp3, sfx/creak-6.mp3, sfx/gull-1.mp3, sfx/gull-2.mp3, sfx/gull-3.mp3, sfx/gull-4.mp3, sfx/gull-5.mp3, sfx/music-ocean.mp3, sfx/ocean-loop.mp3, src/engine/index.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/dockcoin.js, src/ui/flow.js, src/ui/index.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
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
[1472s]    coverage: yarrgh:1/1  nah:0/1  cinnamon sponge cake:0/2  cinnamonsugar churros:1/1  cinnamonsugar churrosbak:1/1  start:1/1  sail square:14/14  trade:6/13  muse#:6/13  speckled eggs:1/6  coins only:5/6  slider:6/6  offer it:6/6  menu:0/1  fresh milk:1/5  hot cinnamon:2/6  vanilla beans:1/5  call dough hook:1/1  call flaky jack:0/1  dough hook:1/1  walk away:0/1  toasty wheat:1/2  sugar cane:1/3  flip coin:2/2  flee:1/1  stand yer ground:0/1  attack #:1/1  arrgh:1/1
[1472s] 
== solo-phone: FAIL
[1472s]    ✗ offered but never exercised: walk away
[1472s]    coverage: yarrgh:1/1  nah:0/2  vanilla bean crème brûlé:2/2  mexican chocolate torte:0/2  start:1/1  sail square:24/24  trade:11/23  muse#:11/23  hot cinnamon:2/11  coins only:3/11  slider:11/11  offer it:11/11  call dough hook:1/2  call flaky jack:0/1  call crustbeard:1/1  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:4/16  vanilla beans:1/9  crustbeard#:1/1  walk away:0/3  fresh milk:2/9  dock:1/1  flip coin:2/2  buy #:1/1  arrgh:1/1  sugar cane:2/6  speckled eggs:4/11  toasty wheat #:2/2  cacao pods:2/6  dough hook:1/1  flaky jack:1/1
[1472s] 
== solo-tablet: FAIL
[1472s]    ✗ vision judge FAILED 1 of 21 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-002-settled.png — back recipe card's title 'Mayan Cocoa Soufflé' overlaps and runs into front card's title 'Pound Cake', making both partially unreadable where they intersect
[1472s]    coverage: yarrgh:1/1  nah:0/1  pound cake:0/2  mayan cocoa soufflé:1/1  mayan cocoa soufflébake :1/1  start:1/1  sail square:17/17  muse#:8/17  menu:0/1  menu open:1/0  menu close:1/0  trade:9/16  sugar cane:1/9  vanilla beans:3/11  coins only:3/9  slider:9/9  offer it:9/9  speckled eggs:1/8  call dough hook:1/2  call crustbeard:0/1  call flaky jack:1/1  dough hook#:1/1  walk away:1/4  fresh milk:2/6  hot cinnamon:4/9  dough hook:2/3  cacao pods:1/4  toasty wheat:3/4  arrgh:1/1
[1472s] 
== passplay-phone: FAIL
[1472s]    ✗ offered but never exercised: deny
[1472s]    ✗ vision judge FAILED 2 of 30 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-002-settled.png — recipe card shows only the name with large empty parchment space above and below it, missing the dish image and ingredient icons that an equivalent unpicked recipe card shows elsewhere
       · passplay-phone-003-settled.png — same recipe card still missing its dish image and ingredient row, leaving large empty space around the title even with the Bake this! pill applied
[1472s]    coverage: yarrgh:1/1  nah:1/2  mayan cocoa soufflé:1/1  french pots de crème:0/2  mayan cocoa soufflébake :1/1  at the helm:34/34  cinnamon dutch baby:1/1  spiced fudge brownies:0/2  cinnamon dutch babybake :1/1  start:1/1  sail square:41/41  muse#:16/34  menu:0/1  menu open:1/0  menu close:1/0  trade:17/28  toasty wheat:7/19  cacao pods:9/27  coins only:8/17  slider:18/18  offer it:17/17  flaky jack:2/3  walk away:2/8  dough hook:3/5  accept:1/2  counter:1/2  deny:0/3  arrgh:1/1  coin:1/1  ask it:1/1  fresh milk:2/7  hot cinnamon:3/8  sugar cane:2/4  speckled eggs:3/5  dock:1/1  flip coin:1/1  dough hook#:1/1
[1472s] 
== passplay-desktop: FAIL
[1472s]    ✗ offered but never exercised: walk away
[1472s]    ✗ vision judge FAILED 2 of 28 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-002-settled.png — recipe card is almost entirely empty parchment with only the recipe name near the bottom, large dead space above it where a picture/ingredients would be
       · passplay-desktop-005-settled.png — last ingredient icon in the recipe card's ingredient row is cut off/clipped by the card's right edge
[1472s]    coverage: yarrgh:1/1  nah:15/16  cinnamon sponge cake:0/2  caramel slice:1/1  caramel slicebake this:0/1  caramel slicebake this c:1/0  at the helm:37/37  cinnamonchocolate fudge:0/2  cocoa cloud soufflé:1/1  cocoa cloud soufflébake :1/1  start:1/1  sail square:42/42  muse#:17/36  menu:0/1  trade:18/34  hot cinnamon:16/31  coins only:3/4  slider:4/4  offer it:4/4  flaky jack#:1/1  walk away:0/4  cacao pods:5/18  dough hook:1/1  dock:1/1  flip coin:1/1  accept:1/2  deny:1/2  davy scones:1/1  slider disabled:14/14  flaky jack:1/1  arrgh:1/1  toasty wheat:3/12  speckled eggs:2/10  vanilla beans:2/8  sugar cane:3/7  fresh milk:2/2
[1472s] 
== crew-desktop: FAIL
[1472s]    ✗ vision judge FAILED 1 of 57 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-guest-002-settled.png — recipe card shows only the name with a large empty blank area above it where the dish image should be
[1472s]    coverage: yarrgh:1/1  nah:0/1  cinnamon sponge cake:0/2  mayan cocoa soufflé:1/1  mayan cocoa soufflébake :1/1  start:1/1  sail square:23/23  trade:10/20  muse#:9/21  sugar cane:2/9  coins only:4/10  slider:9/9  offer it:10/10  dough hook:2/4  walk away:1/5  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  accept:2/4  counter:1/3  deny:1/5  call flaky jack:1/2  call test#:0/1  hot cinnamon:4/9  test#:1/1  toasty wheat:2/7  cacao pods:3/9  call dough hook:1/1  flaky jack:1/1  arrgh:1/1  coin:1/1  ask it:1/1  fresh milk:4/8  attack #:2/2  flip coin:2/2  vanilla beans:1/2  slider disabled:2/2
[1472s] 
== crew-phone: FAIL
[1472s]    ✗ offered but never exercised: walk away
[1472s]    ✗ vision judge FAILED 1 of 46 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-guest-002-settled.png — recipe card shows only the name and a divider — no dish image or ingredient icons like the other recipe cards — leaving a large empty blank area filling the lower half of the card
[1472s]    coverage: yarrgh:1/1  nah:0/1  cinnamonchocolate fudge:0/2  mexican chocolate torte:1/1  mexican chocolate torteb:1/1  start:1/1  sail square:15/15  muse#:6/15  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:7/13  cacao pods:2/7  coins only:7/7  slider:6/6  offer it:7/7  test#:1/1  walk away:0/2  accept:1/1  counter:0/1  deny:0/1  toasty wheat:1/5  speckled eggs:1/5  hot cinnamon:1/5  sugar cane:1/3  attack #:2/2  flip coin:3/3  fresh milk:1/2  dough hook:1/1  arrgh:1/1  slider disabled:1/1
[1472s] 
== solo-desktop-wk: FAIL
[1472s]    ✗ offered but never exercised: vanilla beans
[1472s]    coverage: yarrgh:1/1  nah:1/2  chocolate genoise sponge:2/2  pound cake:0/2  start:1/1  sail square:25/25  trade:6/13  muse#:5/15  sugar cane:1/6  coins only:6/6  slider:4/4  offer it:6/6  menu:0/1  attack #:3/3  flip coin:5/5  fire again #:1/1  break off:0/1  dock:1/1  toasty wheat:1/5  fresh milk:1/5  speckled eggs:1/5  arrgh:1/1  cacao pods:1/3  hot cinnamon:1/3  vanilla beans:0/3  slider disabled:2/2
[1472s] 
== solo-phone-wk: FAIL
[1472s]    ✗ offered but never exercised: vanilla beans
[1472s]    coverage: yarrgh:1/1  nah:0/1  cinnamon dutch baby:1/1  cinnamon sponge cake:0/2  cinnamon dutch babybake :1/1  start:1/1  sail square:13/13  trade:5/11  muse#:5/11  toasty wheat:1/5  vanilla beans:0/5  coins only:5/5  slider:5/5  offer it:5/5  call flaky jack:1/1  call crustbeard:0/1  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:1/4  sugar cane:1/4  attack #:1/1  flip coin:1/1  speckled eggs:1/3  cacao pods:1/2  hot cinnamon:0/1  arrgh:1/1
[1472s] 
== solo-tablet-wk: PASS
[1472s]    coverage: yarrgh:1/1  nah:0/1  molten chocolate lava ca:1/2  mexican chocolate torte:0/1  mexican chocolate torteb:1/1  start:1/1  sail square:13/13  trade:6/12  muse#:6/12  toasty wheat:4/8  speckled eggs:1/6  coins only:3/6  slider:6/6  offer it:6/6  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:1/3  vanilla beans:1/4  sugar cane:1/4  hot cinnamon:1/4  dough hook:1/1  walk away:0/2  call crustbeard:1/2  call flaky jack:0/1  accept:1/1  counter:0/1  deny:0/1  arrgh:1/1  crustbeard:1/1  call dough hook:1/1
[1472s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
