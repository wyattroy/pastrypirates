# Sea trial v2 — build `2026.09.07.3` (tree `5ac70c05b91e`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-10T01:57:15.627Z  ·  79 min  ·  gear **FULL**  ·  sailed on **local Mac (Wyatts-MacBook-Air.local)**

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
[4674s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Spiced Fudge Brownies <- covered by .recipeTitle <div>
[4674s]    ✗ 6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 3.1s)
[4674s]    ✗ vision pass DEFERRED for 25 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:1/3  spiced fudge brownies:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:16/16  muse#:7/16  menu:0/1  trade:8/15  toasty wheat:2/8  coins only:4/7  slider:6/6  offer it:7/7  dough hook:1/1  walk away:0/1  flip coin:2/2  slider disabled:2/2  call crustbeard:1/1  call flaky jack:0/1  arrgh:1/1  speckled eggs:5/10  cacao pods:1/5  dock:1/1  buy #:1/1  vanilla beans:1/4  fresh milk:2/3  hot cinnamon:1/3
[4674s] 
== solo-phone: FAIL
[4674s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Cinnamon Snaps <- covered by .recipeTitle <div>
[4674s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[4674s]    ✗ 5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 3.2s)
[4674s]    ✗ vision pass DEFERRED for 20 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:0/1  cinnamon snaps:0/2  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:19/19  trade:9/18  muse#:9/18  toasty wheat:3/9  coins only:4/9  slider:9/9  offer it:9/9  call crustbeard:1/1  call dough hook:1/3  menu:0/1  menu open:1/0  menu close:1/0  hot cinnamon:5/14  flaky jack:1/2  walk away:1/4  call flaky jack:1/2  cacao pods:1/6  arrgh:1/1  vanilla beans:1/6  sugar cane:1/4  fresh milk:2/4  speckled eggs:1/4  dough hook#:1/1  dough hook:1/1
[4674s] 
== solo-tablet: FAIL
[4674s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Caramel Slice <- covered by .recipeTitle <div>
[4674s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 2.7s)
[4674s]    ✗ vision pass DEFERRED for 25 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:0/1  caramel slice:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:12/12  trade:5/12  muse#:5/12  speckled eggs:1/5  coins only:5/5  slider:5/5  offer it:5/5  call dough hook:1/3  call flaky jack:0/1  menu:0/1  menu open:1/0  menu close:1/0  vanilla beans:1/4  attack #:2/2  flip coin:2/2  call crustbeard:2/2  fresh milk:1/3  toasty wheat:1/2  cacao pods:1/2  hot cinnamon:0/2  dough hook#:1/1  walk away:0/2  accept:1/1  counter:0/1  deny:0/1  dough hook:1/1  arrgh:1/1
[4674s] 
== passplay-phone: FAIL
[4674s]    ✗ 8 structural check failure(s): on-screen×4, no-pile×4 — first: clickable off-screen: Vanilla Bean Crème Brûlé
[4674s]    ✗ 3 observation(s) seen only DURING an animation — not failures, read them in the log
[4674s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 3.2s)
[4674s]    ✗ vision pass DEFERRED for 31 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:2/3  vanilla bean crème brûlé:0/2  mayan cocoa soufflé:1/1  mayan cocoa soufflébake :1/1  at the helm:58/58  cinnamon snaps:0/2  crispy cocoa snaps:1/1  crispy cocoa snapsbake t:1/1  start:1/1  sail square:31/31  trade:14/30  muse#:14/30  toasty wheat:3/12  coins only:10/13  slider:11/11  offer it:13/13  menu:0/1  menu open:1/0  menu close:1/0  cacao pods:2/11  fresh milk:5/12  speckled eggs:2/6  dough hook:1/3  walk away:1/4  vanilla beans:2/6  dock:1/1  flip coin:3/3  sugar cane:4/5  flaky jack:1/1  arrgh:1/1  attack #:1/1  slider disabled:3/3  accept:1/2  deny:1/2  peg leg meg:1/1
[4674s] 
== passplay-desktop: FAIL
[4674s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Cocoa Cloud Soufflé <- covered by .recipeTitle <div>
[4674s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.8s)
[4674s]    ✗ vision pass DEFERRED for 37 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:6/8  cocoa cloud soufflé:0/2  chocolate genoise sponge:2/2  at the helm:75/75  caramel slice:0/2  spiced cocoa shortbread:1/1  spiced cocoa shortbreadb:1/1  start:1/1  sail square:40/40  muse#:18/38  trade:18/37  cacao pods:8/31  coins only:7/12  slider:13/13  offer it:12/12  flaky jack#:2/2  walk away:1/5  menu:0/1  vanilla beans:5/19  dough hook:1/2  accept:1/3  deny:1/4  peg leg meg:1/1  flaky jack:0/1  toasty wheat:5/14  slider disabled:6/6  counter:1/1  coin:1/1  ask it:1/1  arrgh:1/1  attack #:1/1  call peg leg meg:1/1  call dough hook:0/1  flip coin:2/2  dock:1/1  #:1/1  vanilla beans #:1/1  sugar cane:6/13  fresh milk:7/9
[4674s] 
== crew-desktop: FAIL
[4674s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Molten Chocolate Lava Ca <- covered by .recipeTitle <div>
[4674s]    ✗ 1 moment(s) where the two captains saw different games: captains (Dough: host 11 vs guest 10   (row ORDER differs by design and is not part of this finding))
[4674s]    ✗ 13 screen(s) never stopped moving before being checked (still moving: 13 geometry; longest wait 3.0s)
[4674s]    ✗ vision pass DEFERRED for 48 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:0/1  mexican chocolate torte:0/2  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:21/21  muse#:8/20  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:9/17  toasty wheat:2/9  coins only:9/9  slider:6/6  offer it:9/9  test#:1/1  walk away:0/1  accept:1/1  counter:0/1  deny:0/1  attack #:3/3  flip coin:4/4  fresh milk:2/7  speckled eggs:2/7  hot cinnamon:1/7  call test#:1/2  call flaky jack:1/2  fire again #:1/1  break off:0/1  cacao pods:1/4  vanilla beans:0/1  slider disabled:3/3  arrgh:1/1  sugar cane:1/1
[4674s] 
== crew-phone: FAIL
[4674s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Chocolate Fudge Torte <- covered by .recipeTitle <div>
[4674s]    ✗ 15 screen(s) never stopped moving before being checked (still moving: 15 geometry; longest wait 3.1s)
[4674s]    ✗ vision pass DEFERRED for 46 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:0/1  chocolate fudge torte:0/2  cinnamon sponge cake:1/1  cinnamon sponge cakebake:1/1  start:1/1  sail square:18/18  muse#:6/13  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:7/12  hot cinnamon:4/11  coins only:3/7  slider:6/6  offer it:7/7  test#:1/2  walk away:1/3  slider disabled:1/1  sugar cane:1/5  toasty wheat:2/4  cacao pods:3/5  dough hook:1/2  arrgh:1/1  call test#:1/1  call dough hook:0/1  vanilla beans:1/1
[4674s] 
== solo-desktop-wk: FAIL
[4674s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Spiced Fudge Brownies <- covered by .recipeTitle <div>
[4674s]    ✗ 3 screen(s) never stopped moving before being checked (still moving: 3 geometry; longest wait 3.1s)
[4674s]    ✗ vision pass DEFERRED for 22 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:1/2  spiced fudge brownies:0/2  snickerdoodle bites:1/1  snickerdoodle bitesbake :1/1  start:1/1  sail square:24/24  muse#:11/24  menu:0/1  trade:12/22  sugar cane:2/12  coins only:11/11  slider:10/10  offer it:11/11  flaky jack#:1/1  walk away:0/1  fresh milk:2/11  slider disabled:2/2  flip coin:2/2  hot cinnamon:2/10  call dough hook:2/3  call crustbeard:0/1  vanilla beans:1/9  call flaky jack:1/2  speckled eggs:2/8  arrgh:1/1  toasty wheat:2/3  attack #:1/1  cacao pods:2/2
[4674s] 
== solo-phone-wk: FAIL
[4674s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Cinnamon Snaps <- covered by .recipeTitle <div>
[4674s]    ✗ 6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 2.8s)
[4674s]    ✗ vision pass DEFERRED for 27 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:0/1  cinnamon snaps:0/2  mayan cocoa soufflé:1/1  mayan cocoa soufflébake :1/1  start:1/1  sail square:22/22  trade:10/21  muse#:9/21  fresh milk:3/14  sugar cane:2/11  coins only:4/10  slider:10/10  offer it:10/10  call dough hook:1/1  call crustbeard:0/2  menu:0/1  menu open:1/0  menu close:1/0  attack #:2/2  flip coin:3/3  flee:1/1  stand yer ground:0/1  hot cinnamon:2/9  dough hook:2/4  walk away:2/5  accept:1/1  counter:0/1  deny:0/1  cacao pods:3/9  flaky jack:1/1  vanilla beans:1/7  toasty wheat:4/9  call flaky jack:1/1  arrgh:1/1  speckled eggs:2/3
[4674s] 
== solo-tablet-wk: FAIL
[4674s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Cinnamon Dutch Baby <- covered by .recipeTitle <div>
[4674s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 3.3s)
[4674s]    ✗ vision pass DEFERRED for 20 screen(s) — queued for a session, NOT cleared
[4674s]    coverage: yarrgh:1/1  nah:0/1  cinnamon dutch baby:0/2  cocoa cloud soufflé:1/1  cocoa cloud soufflébake :1/1  start:1/1  sail square:13/13  muse#:6/13  menu:0/1  menu open:1/0  menu close:1/0  trade:7/12  toasty wheat:4/13  speckled eggs:1/7  coins only:4/7  slider:7/7  offer it:7/7  dough hook:1/2  walk away:1/2  vanilla beans:1/6  arrgh:1/1  sugar cane:1/4  call crustbeard:1/1  call dough hook:0/1  cacao pods:1/3  fresh milk:1/2  hot cinnamon:1/1
[4674s] 
RESULT: FAIL
[4674s] WROTE /Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/google-search-console-020493/sea-trial-shots/judge-queue.json — 301 screen(s) awaiting a session's eyes.
[4674s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
