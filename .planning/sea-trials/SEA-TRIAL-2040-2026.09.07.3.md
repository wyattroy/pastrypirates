# Sea trial v2 — build `2026.09.07.3` (tree `899f68b0ac90`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-10T03:26:03.462Z  ·  75 min  ·  gear **FULL**  ·  sailed on **local Mac (Wyatts-MacBook-Air.local)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: credits.html, index.html, package.json, rules.html, sfx/creak-1.mp3, sfx/creak-2.mp3, sfx/creak-3.mp3, sfx/creak-4.mp3, sfx/creak-5.mp3, sfx/creak-6.mp3, sfx/gull-1.mp3, sfx/gull-2.mp3, sfx/gull-3.mp3, sfx/gull-4.mp3, sfx/gull-5.mp3, sfx/music-ocean.mp3, sfx/ocean-loop.mp3, sitemap.xml, src/engine/index.js, src/orchestrator.js, src/shared/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/flow.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
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
| **can the vision judge see?** | **NO** — **THE JUDGE CANNOT SEE** — every visual verdict below is worthless; the structural half still stands.   FAIL  the judge cannot run at all — {"verdict":"FATAL","issues":["the judge cannot run: Failed to authenticate: OAuth session expired and could not be refreshed"],"confidence":0} ·  · FAILED — this is an environment fault, not a verdict about any screen. |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
== solo-desktop: FAIL
[4449s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Mayan Cocoa Soufflé <- covered by .apBtn recipeCard <button>
[4449s]    ✗ offered but never exercised: vanilla beans
[4449s]    ✗ 1 screen(s) never stopped moving before being checked (still moving: 1 geometry; longest wait 2.7s)
[4449s]    ✗ vision pass DEFERRED for 17 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:0/1  mayan cocoa soufflé:0/2  vanilla bean crème brûlé:2/2  start:1/1  sail square:13/13  trade:7/13  muse#:6/13  fresh milk:1/5  coins only:4/7  slider:7/7  offer it:7/7  menu:0/1  hot cinnamon:1/6  vanilla beans:0/4  sugar cane:2/5  speckled eggs:1/5  call crustbeard:1/1  call flaky jack:0/1  toasty wheat:4/7  dough hook:1/1  walk away:0/1  arrgh:1/1  cacao pods:1/1
[4449s] 
== solo-phone: FAIL
[4449s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Cocoa Cloud Soufflé <- covered by .apBtn recipeCard <button>
[4449s]    ✗ offered but never exercised: vanilla beans
[4449s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 3.2s)
[4449s]    ✗ vision pass DEFERRED for 18 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:0/1  cocoa cloud soufflé:0/2  spiced fudge brownies:1/1  spiced fudge browniesbak:1/1  start:1/1  sail square:14/14  trade:6/14  muse#:6/14  toasty wheat:1/6  coins only:6/6  slider:6/6  offer it:6/6  menu:0/1  menu open:1/0  menu close:1/0  call flaky jack:1/1  call crustbeard:0/1  sugar cane:1/5  hot cinnamon:1/5  attack #:2/2  flip coin:2/2  speckled eggs:1/4  vanilla beans:0/4  fresh milk:1/3  arrgh:1/1  cacao pods:1/1
[4449s] 
== solo-tablet: FAIL
[4449s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Dark Chocolate Cream Puf <- covered by .apBtn recipeCard <button>
[4449s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 7 geometry, 1 text; longest wait 3.1s)
[4449s]    ✗ vision pass DEFERRED for 21 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:0/1  dark chocolate cream puf:0/2  spiced cocoa shortbread:1/1  spiced cocoa shortbreadb:1/1  start:1/1  sail square:17/17  muse#:5/12  menu:0/1  menu open:1/0  menu close:1/0  trade:6/11  sugar cane:1/6  vanilla beans:1/6  coins only:6/6  slider:6/6  offer it:6/6  cacao pods:1/5  call dough hook:1/1  call flaky jack:0/1  attack #:1/1  flip coin:1/1  fresh milk:1/4  speckled eggs:1/4  hot cinnamon:1/3  arrgh:1/1
[4449s] 
== passplay-phone: FAIL
[4449s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Spiced Cocoa Shortbread <- covered by .apBtn recipeCard <button>
[4449s]    ✗ 3 observation(s) seen only DURING an animation — not failures, read them in the log
[4449s]    ✗ 7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 2.7s)
[4449s]    ✗ vision pass DEFERRED for 36 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:14/16  spiced cocoa shortbread:0/2  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  at the helm:80/80  cinnamon sponge cake:0/2  cinnamon dutch baby:1/1  cinnamon dutch babybake :1/1  start:1/1  sail square:48/48  muse#:18/40  trade:19/38  fresh milk:11/25  coins only:3/5  slider:4/4  offer it:5/5  dough hook:3/4  walk away:2/9  menu:0/1  menu open:1/0  menu close:1/0  accept:1/2  counter:0/1  deny:1/2  peg leg meg:1/1  call dough hook:1/2  call davy scones:0/1  flip coin:5/5  flee:1/1  stand yer ground:0/1  toasty wheat:5/17  flaky jack:3/4  slider disabled:15/15  cacao pods:5/11  arrgh:1/1  sugar cane:9/15  speckled eggs:1/3  hot cinnamon:2/4  attack #:2/2  dock:1/1  buy #:1/1  vanilla beans:2/3  call peg leg meg:1/1
[4449s] 
== passplay-desktop: FAIL
[4449s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Spiced Cocoa Shortbread <- covered by .apBtn recipeCard <button>
[4449s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 3.1s)
[4449s]    ✗ vision pass DEFERRED for 26 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:3/4  spiced cocoa shortbread:0/2  cocoa cloud soufflé:1/1  cocoa cloud soufflébake :1/1  at the helm:61/61  cinnamon dutch baby:0/2  cinnamonchocolate fudge:1/1  cinnamonchocolate fudgeb:1/1  start:1/1  sail square:36/36  muse#:15/32  menu:0/1  call flaky jack:1/2  call dough hook:1/2  trade:16/29  fresh milk:7/19  coins only:13/13  slider:13/13  offer it:13/13  dough hook:1/2  walk away:1/3  attack #:1/1  flip coin:2/2  arrgh:1/1  cacao pods:3/13  hot cinnamon:2/7  sugar cane:4/8  speckled eggs:3/4  accept:1/1  deny:0/1  peg leg meg:1/1  slider disabled:3/3
[4449s] 
== crew-desktop: FAIL
[4449s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Molten Chocolate Lava Ca <- covered by .apBtn recipeCard <button>
[4449s]    ✗ offered but never exercised: vanilla beans
[4449s]    ✗ 1 moment(s) where the two captains saw different games: captains (Dough: host 8 vs guest 7   (row ORDER differs by design and is not part of this finding))
[4449s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 3.1s)
[4449s]    ✗ vision pass DEFERRED for 35 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:0/1  mexican chocolate torte:0/2  caramel slice:1/1  caramel slicebake this:0/1  caramel slicebake this c:1/0  start:1/1  sail square:12/12  muse#:5/12  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:6/11  cacao pods:1/5  hot cinnamon:1/6  coins only:5/6  slider:6/6  offer it:6/6  attack #:1/1  flip coin:1/1  sugar cane:1/3  vanilla beans:1/2  speckled eggs:2/3  flaky jack#:1/1  walk away:0/1  arrgh:1/1  toasty wheat:1/1
[4449s] 
== crew-phone: FAIL
[4449s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Cinnamon Dutch Baby <- covered by .apBtn recipeCard <button>
[4449s]    ✗ offered but never exercised: deny
[4449s]    ✗ 24 screen(s) never stopped moving before being checked (still moving: 24 geometry; longest wait 3.1s)
[4449s]    ✗ vision pass DEFERRED for 57 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:1/2  chocolate genoise sponge:0/2  snickerdoodle bites:1/1  snickerdoodle bitesbake :1/1  start:1/1  sail square:35/35  trade:9/21  muse#:10/23  hot cinnamon:2/10  coins only:4/8  slider:7/7  offer it:8/8  dough hook:1/2  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  toasty wheat:2/8  test#:1/1  flaky jack:1/2  accept:1/1  counter:0/1  deny:0/1  attack #:4/4  flip coin:8/8  fire again #:1/1  break off:0/1  arrgh:1/1  fresh milk:2/6  toasty wheat #:4/5  slider disabled:2/2  call test#:1/1  call flaky jack:0/1  vanilla beans:2/5  flee:1/1  stand yer ground:0/1  speckled eggs:1/2  sugar cane:1/1
[4449s] 
== solo-desktop-wk: FAIL
[4449s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Spiced Cocoa Shortbread <- covered by .apBtn recipeCard <button>
[4449s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[4449s]    ✗ 3 screen(s) never stopped moving before being checked (still moving: 3 geometry; longest wait 2.7s)
[4449s]    ✗ vision pass DEFERRED for 25 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:0/1  spiced cocoa shortbread:0/2  snickerdoodle bites:1/1  snickerdoodle bitesbake :1/1  start:1/1  sail square:23/23  muse#:11/22  menu:0/1  trade:11/20  sugar cane:3/14  vanilla beans:1/11  coins only:6/11  slider:10/10  offer it:11/11  dough hook:2/4  walk away:2/4  flip coin:1/1  flee:1/1  stand yer ground:0/1  call crustbeard:1/1  call flaky jack:1/3  cacao pods:2/9  slider disabled:1/1  call dough hook:1/2  toasty wheat:5/11  accept:1/1  counter:0/1  deny:0/1  hot cinnamon:1/7  fresh milk:2/6  speckled eggs:2/5  arrgh:1/1
[4449s] 
== solo-phone-wk: FAIL
[4449s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Pound Cake <- covered by .apBtn recipeCard <button>
[4449s]    ✗ offered but never exercised: vanilla beans
[4449s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 3.3s)
[4449s]    ✗ vision pass DEFERRED for 22 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:0/1  pound cake:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:14/14  muse#:6/14  menu:0/1  menu open:1/0  menu close:1/0  trade:7/13  sugar cane:2/6  cacao pods:1/7  coins only:6/7  slider:7/7  offer it:7/7  dough hook:1/2  walk away:1/3  accept:1/1  counter:0/1  deny:0/1  call flaky jack:1/1  call crustbeard:0/1  attack #:1/1  flip coin:1/1  toasty wheat:1/4  speckled eggs:1/3  vanilla beans:0/4  hot cinnamon:1/3  arrgh:1/1  fresh milk:2/2  crustbeard#:1/1
[4449s] 
== solo-tablet-wk: FAIL
[4449s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Vanilla Bean Crème Brûlé <- covered by .apBtn recipeCard <button>
[4449s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.8s)
[4449s]    ✗ vision pass DEFERRED for 23 screen(s) — queued for a session, NOT cleared
[4449s]    coverage: yarrgh:1/1  nah:0/1  vanilla bean crème brûlé:0/2  snickerdoodle bites:1/1  snickerdoodle bitesbake :1/1  start:1/1  sail square:19/19  trade:10/19  muse#:9/19  sugar cane:2/9  coins only:4/10  slider:10/10  offer it:10/10  menu:0/1  menu open:1/0  menu close:1/0  call dough hook:1/1  call crustbeard:0/1  speckled eggs:3/12  hot cinnamon:2/9  crustbeard:1/1  walk away:1/4  vanilla beans:2/8  fresh milk:2/7  arrgh:1/1  flaky jack:1/1  toasty wheat:5/9  dough hook:1/2
[4449s] 
RESULT: FAIL
[4449s] WROTE /Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/google-search-console-020493/sea-trial-shots/judge-queue.json — 280 screen(s) awaiting a session's eyes.
[4449s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
