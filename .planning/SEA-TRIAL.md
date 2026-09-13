# Sea trial v2 — build `2026.09.13.2` (tree `565c356612f4`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-13T18:18:03.217Z  ·  26 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **4 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **4** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 5 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 4 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 2 | no |
> | browser-free checks (npm test) | green | - |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: assets/ingredients/holes/sugar.webp, assets/ingredients/sugar.png, assets/plaque/crate-hollow.webp, assets/plaque/crate.webp, index.html, src/ui/board.js, src/ui/stage.js
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
[1482s]    coverage: yarrgh:1/1  nah:0/1  cinnamon snaps:0/2  cinnamon dutch baby:1/1  cinnamon dutch babybake :1/1  start:1/1  sail square:17/17  trade:6/14  muse#:6/14  sugar cane:1/6  coins only:4/6  slider:6/6  offer it:6/6  call crustbeard:1/2  call dough hook:0/1  menu:0/1  toasty wheat:1/5  fresh milk:1/5  attack #:2/2  flip coin:2/2  call flaky jack:1/1  vanilla beans:1/4  arrgh:1/1  hot cinnamon:2/4  dough hook:1/1  walk away:0/2  speckled eggs:2/3  flaky jack:1/1
[1482s] 
== solo-phone: FAIL
[1482s]    ✗ 1 dead control(s): Mayan Cocoa Soufflé
[1482s]    ✗ offered but never exercised: vanilla beans
[1482s]    coverage: yarrgh:1/1  nah:0/1  mayan cocoa soufflé:1/3  chocolate fudge torte:1/2  chocolate fudge tortebak:1/1  start:1/1  sail square:14/14  trade:6/12  muse#:6/12  speckled eggs:1/6  cacao pods:1/6  coins only:3/6  slider:6/6  offer it:6/6  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:4/9  hot cinnamon:1/5  dough hook:1/2  walk away:1/3  sugar cane:1/3  vanilla beans:0/4  call crustbeard:1/1  call flaky jack:1/2  toasty wheat:1/2  arrgh:1/1  flaky jack#:1/1  call dough hook:0/1
[1482s] 
== solo-tablet: FAIL
[1482s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[1482s]    coverage: yarrgh:1/1  nah:0/1  molten chocolate lava ca:0/2  cocoa cloud soufflé:1/1  cocoa cloud soufflébake :1/1  start:1/1  sail square:17/17  muse#:8/17  menu:0/1  menu open:1/0  menu close:1/0  call crustbeard:1/1  call flaky jack:0/2  trade:9/15  fresh milk:2/8  coins only:9/9  slider:9/9  offer it:9/9  call dough hook:1/1  vanilla beans:2/8  toasty wheat:1/5  sugar cane:1/3  cacao pods:1/5  speckled eggs:1/4  hot cinnamon:1/3  arrgh:1/1
[1482s] 
== passplay-phone: FAIL
[1482s]    ✗ 1 dead control(s): Cinnamon Sponge Cake
[1482s]    ✗ vision judge FAILED 2 of 19 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-002-settled.png — recipe card has a large blank empty area where the dish photo should be, above the recipe name
       · passplay-phone-005-settled.png — the back recipe card's name 'Dark Chocolate Cream Puffs' overlaps directly on top of the front card's 'Pound Cake' title text
[1482s]    coverage: yarrgh:1/1  nah:0/1  cinnamon sponge cake:1/3  pound cake:1/4  pound cakebake this:0/1  pound cakebake this comm:1/0  at the helm:31/31  dark chocolate cream puf:2/2  start:1/1  sail square:38/38  muse#:15/30  trade:15/29  speckled eggs:3/14  coins only:8/15  slider:10/10  offer it:15/15  menu:0/1  menu open:1/0  menu close:1/0  cacao pods:8/25  dough hook:1/2  walk away:1/2  fresh milk:3/11  sugar cane:3/9  slider disabled:5/5  hot cinnamon:2/5  toasty wheat:3/3  call dough hook:1/2  call flaky jack:1/2
[1482s] 
== passplay-desktop: FAIL
[1482s]    ✗ vision judge FAILED 1 of 32 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-002-settled.png — recipe card (Chocolate Genoise Sponge Cake) is missing its dish picture, leaving a large blank parchment area above the title
[1482s]    coverage: yarrgh:1/1  nah:3/5  chocolate genoise sponge:0/2  molten chocolate lava ca:2/2  at the helm:29/29  vanilla bean crème brûlé:0/2  mexican chocolate pots:1/1  mexican chocolate potsba:1/1  start:1/1  sail square:30/30  muse#:12/28  menu:0/1  trade:12/26  speckled eggs:4/17  hot cinnamon:3/14  coins only:3/12  slider:11/11  offer it:12/12  dough hook:3/5  walk away:2/8  flaky jack:2/2  slider disabled:1/1  accept:1/1  counter:0/1  deny:0/1  peg leg meg:1/1  dock:4/4  flip coin:4/4  buy #:1/1  arrgh:1/1  sugar cane:3/9  vanilla beans:4/11  cacao pods:2/6  fresh milk:4/7  toasty wheat:1/1
[1482s] 
== crew-desktop: FAIL
[1482s]    ✗ 2 structural check failure(s): not-occluded×1, no-pile×1 — first: clickable covered by something else: Call test1 <- covered by .apBtn <button>
[1482s]    ✗ offered but never exercised: walk away
[1482s]    ✗ offered but never exercised: walk away
[1482s]    ✗ vision judge FAILED 1 of 55 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-guest-002-settled.png — recipe card is missing its dish image and ingredient icon row, leaving large empty tan space above and below the title compared to the fully-rendered card
[1482s]    coverage: yarrgh:1/1  nah:0/1  mexican chocolate torte:0/2  vanilla bean crème brûlé:2/2  start:1/1  sail square:34/34  muse#:9/19  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:9/18  speckled eggs:2/10  coins only:4/9  slider:10/10  offer it:9/9  test#:1/1  walk away:0/3  slider disabled:1/1  accept:2/5  counter:2/5  deny:1/7  toasty wheat:5/13  dough hook:1/1  coin:2/2  ask it:2/2  call dough hook:1/1  call flaky jack:0/1  cacao pods:2/6  arrgh:1/1  hot cinnamon:3/6  sugar cane:3/3  flaky jack#:1/1  attack #:1/1  flip coin:2/2
[1482s] 
== crew-phone: FAIL
[1482s]    ✗ 1 dead control(s): Vanilla Bean Crème Brûlée
[1482s]    ✗ vision judge FAILED 3 of 44 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-host-001-settled.png — board background renders as blank dark grid with no water texture, logo, or corner decorations, unlike the equivalent guest screen
       · crew-phone-guest-002-settled.png — recipe card shows only the title with large empty dead space where the dish image and ingredient icon row should be
       · crew-phone-host-018-settled.png — dark solid unrendered box in test1's row where a crate icon should be
[1482s]    coverage: yarrgh:1/1  nah:0/1  mayan cocoa soufflé:0/2  caramel slice:1/1  caramel slicebake this:0/1  caramel slicebake this c:1/0  start:1/1  sail square:16/16  muse#:7/16  call dough hook:1/1  call flaky jack:0/1  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:8/15  speckled eggs:1/8  coins only:5/8  slider:8/8  offer it:8/8  toasty wheat:5/10  cacao pods:1/7  attack #:1/1  flip coin:1/1  arrgh:1/1  fresh milk:1/4  dough hook:1/1  walk away:0/2  vanilla beans:1/2  sugar cane:1/2  hot cinnamon:1/2  test#:1/1
[1482s] 
== solo-desktop-wk: FAIL
[1482s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[1482s]    coverage: yarrgh:1/1  nah:1/3  snickerdoodle bites:1/2  molten chocolate lava ca:1/2  start:1/1  sail square:24/24  muse#:8/17  menu:0/1  call flaky jack:1/2  call dough hook:2/4  trade:8/16  speckled eggs:3/11  coins only:3/7  slider:6/6  offer it:7/7  dough hook:2/2  walk away:1/5  slider disabled:2/2  vanilla beans:1/6  toasty wheat:3/7  fresh milk:2/6  flaky jack:1/2  hot cinnamon:1/4  sugar cane:2/5  crustbeard#:1/1  call crustbeard:1/2  cacao pods:1/2  dock:1/1  attack #:0/1  flip coin:1/1  buy #:1/1  arrgh:1/1
[1482s] 
== solo-phone-wk: FAIL
[1482s]    ✗ offered but never exercised: walk away
[1482s]    coverage: yarrgh:1/1  nah:0/1  caramel slice:1/1  mexican chocolate torte:0/2  caramel slicebake this:0/1  caramel slicebake this c:1/0  start:1/1  sail square:26/26  trade:10/22  muse#:10/22  hot cinnamon:4/13  coins only:3/10  slider:10/10  offer it:10/10  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:3/10  fresh milk:2/9  speckled eggs:3/10  attack #:2/2  flip coin:2/2  sugar cane:1/6  cacao pods:2/7  dough hook#:1/1  walk away:0/3  call crustbeard:1/1  call flaky jack:1/2  arrgh:1/1  accept:1/1  counter:0/1  deny:0/1  flaky jack#:1/1  call dough hook:0/1  vanilla beans:3/4  crustbeard:1/1
[1482s] 
== solo-tablet-wk: FAIL
[1482s]    ✗ vision judge FAILED 1 of 23 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-wk-012-settled.png — Attacker (Dough Hook) box in Broadside Battle card is mostly empty with only a tiny broken sliver/line where a ship graphic should be, leaving large dead space compared to the defender's placeholder c
[1482s]    coverage: yarrgh:1/1  nah:0/1  mexican chocolate torte:1/2  cinnamon snaps:0/1  cinnamon snapsbake this:0/1  cinnamon snapsbake this :1/0  start:1/1  sail square:26/26  trade:12/25  muse#:12/25  sugar cane:2/10  cacao pods:1/10  coins only:6/10  slider:10/10  offer it:10/10  menu:0/1  menu open:1/0  menu close:1/0  call dough hook:1/1  call crustbeard:2/4  toasty wheat:2/9  speckled eggs:2/9  hot cinnamon:3/10  fresh milk:3/9  flaky jack:1/1  walk away:0/2  vanilla beans:1/5  crustbeard:1/1  dough hook:0/1  arrgh:1/1  call flaky jack:1/3  attack #:1/1  flip coin:1/1
[1482s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
