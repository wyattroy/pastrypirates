# Sea trial v2 — build `2026.09.07.3` (tree `a8ec484c39fd`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-10T04:47:19.000Z  ·  72 min  ·  gear **FULL**  ·  sailed on **local Mac (Wyatts-MacBook-Air.local)**

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
| checks with no browser (`npm test`) | **FAIL** |
| **can the vision judge see?** | **NO** — **THE JUDGE CANNOT SEE** — every visual verdict below is worthless; the structural half still stands.   FAIL  the judge cannot run at all — {"verdict":"FATAL","issues":["the judge cannot run: Failed to authenticate: OAuth session expired and could not be refreshed"],"confidence":0} ·  · FAILED — this is an environment fault, not a verdict about any screen. |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |


## The browser-free checks failed

**FAILING GATE:** `node scripts/qa/sitemap_lastmod_check.mjs`

```
ok   https://playpastrypirates.com/about.html -> about.html @ 2026-09-03
  ok   https://playpastrypirates.com/credits.html -> credits.html @ 2026-09-07
  ok   https://playpastrypirates.com/privacy.html -> privacy.html @ 2026-09-03
  ok   https://playpastrypirates.com/rules.html -> rules.html @ 2026-09-08
sitemap_lastmod_check: FAIL — 1 problem(s) in sitemap.xml

  x https://playpastrypirates.com/ says lastmod 2026-09-09; git says index.html last changed 2026-09-10

  Regenerate it, never hand-type a date:  node scripts/qa/sitemap_write.mjs
```

## The voyages, in full

```
== solo-desktop: FAIL
[4231s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 3.1s)
[4231s]    ✗ vision pass DEFERRED for 18 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/1  chocolate genoise sponge:0/2  cinnamon snaps:1/1  cinnamon snapsbake this:0/1  cinnamon snapsbake this :1/0  start:1/1  sail square:14/14  muse#:7/14  menu:0/1  trade:7/13  fresh milk:1/7  speckled eggs:1/5  coins only:6/7  slider:7/7  offer it:7/7  hot cinnamon:1/4  toasty wheat:1/5  sugar cane:1/5  vanilla beans:1/5  call crustbeard:1/1  call flaky jack:0/1  arrgh:1/1  cacao pods:2/3  flaky jack:1/1  walk away:0/1
[4231s] 
== solo-phone: FAIL
[4231s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[4231s]    ✗ vision pass DEFERRED for 20 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/1  cinnamon dutch baby:0/2  mayan cocoa soufflé:1/1  mayan cocoa soufflébake :1/1  start:1/1  sail square:13/13  trade:7/13  muse#:6/13  speckled eggs:2/8  vanilla beans:1/7  coins only:2/7  slider:7/7  offer it:7/7  dough hook:2/3  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  sugar cane:1/6  cacao pods:3/5  flaky jack:1/1  arrgh:1/1  toasty wheat:1/3  hot cinnamon:1/4  call crustbeard:2/3  call flaky jack:1/3  fresh milk:3/5
[4231s] 
== solo-tablet: FAIL
[4231s]    ✗ 6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 3.0s)
[4231s]    ✗ vision pass DEFERRED for 26 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/2  cinnamonsugar churros:0/2  cinnamon sponge cake:1/1  cinnamon sponge cakebake:1/1  start:1/1  sail square:16/18  trade:7/15  muse#:6/16  cacao pods:1/5  coins only:5/7  slider:6/6  offer it:7/7  menu:0/1  menu open:1/0  menu close:1/0  sugar cane:3/8  speckled eggs:1/4  attack #:2/2  flip coin:4/4  fire again #:1/1  break off:0/1  fresh milk:1/5  vanilla beans:1/5  arrgh:1/1  toasty wheat:1/4  slider disabled:1/1  call crustbeard:2/3  call dough hook:0/1  call flaky jack:1/2  dock:1/1  buy #:1/1  hot cinnamon:1/1
[4231s] 
== passplay-phone: FAIL
[4231s]    ✗ offered but never exercised: mayan cocoa soufflé
[4231s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
[4231s]    ✗ vision pass DEFERRED for 25 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:10/11  mayan cocoa soufflé:0/4  french pots de crème:1/1  french pots de crèmebake:1/1  at the helm:71/71  mexican chocolate torte:1/1  mexican chocolate torteb:1/1  start:1/1  sail square:41/41  muse#:18/36  menu:0/1  menu open:1/0  menu close:1/0  trade:18/34  fresh milk:5/18  coins only:4/8  slider:9/9  offer it:8/8  dough hook:3/5  walk away:2/6  accept:2/4  counter:1/3  deny:1/5  peg leg meg:1/1  coin:1/1  ask it:1/1  speckled eggs:5/12  toasty wheat:3/12  vanilla beans:11/18  hot cinnamon:2/10  slider disabled:10/10  cacao pods:3/8  sugar cane:3/5
[4231s] 
== passplay-desktop: FAIL
[4231s]    ✗ 1 structural check failure(s): no-pile×1 — first: overlapping controls: Dough Hook/Walk away
[4231s]    ✗ offered but never exercised: vanilla bean crème brûlé
[4231s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 3.1s)
[4231s]    ✗ vision pass DEFERRED for 32 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:5/6  vanilla bean crème brûlé:0/4  cinnamonsugar churros:1/1  cinnamonsugar churrosbak:1/1  at the helm:66/66  crispy cocoa snaps:1/1  crispy cocoa snapsbake t:1/1  start:1/1  sail square:39/39  muse#:17/34  menu:0/1  trade:17/30  toasty wheat:6/18  coins only:5/12  slider:13/13  offer it:12/12  dough hook:2/4  walk away:1/8  hot cinnamon:4/16  flaky jack:2/2  accept:2/4  counter:1/3  deny:1/5  davy scones:1/1  coin:1/1  ask it:1/1  cacao pods:5/16  fresh milk:2/7  speckled eggs:4/9  arrgh:1/1  vanilla beans:7/10  flaky jack#:1/1  slider disabled:5/5  sugar cane:1/1  peg leg meg:1/1
[4231s] 
== crew-desktop: FAIL
[4231s]    ✗ 1 moment(s) where the two captains saw different games: captains (Flaky: host 6 vs guest 5   (row ORDER differs by design and is not part of this finding))
[4231s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 3.1s)
[4231s]    ✗ vision pass DEFERRED for 59 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/1  french pots de crème:0/2  mexican chocolate pots:1/1  mexican chocolate potsba:1/1  start:1/1  sail square:19/19  trade:9/19  muse#:9/19  cacao pods:2/9  coins only:4/9  slider:10/10  offer it:9/9  dough hook:1/1  walk away:1/5  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  accept:1/3  counter:1/3  deny:1/4  sugar cane:2/9  test#:1/1  call test#:2/4  call flaky jack:1/2  toasty wheat:5/12  flaky jack:1/2  coin:1/1  ask it:1/1  arrgh:1/1  call dough hook:2/4  fresh milk:3/5  vanilla beans:2/3  dough hook#:1/1  attack #:1/1  flip coin:1/1
[4231s] 
== crew-phone: FAIL
[4231s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "test2: Tap a gold square to sa"
[4231s]    ✗ offered but never exercised: deny
[4231s]    ✗ offered but never exercised: deny
[4231s]    ✗ 14 screen(s) never stopped moving before being checked (still moving: 14 geometry; longest wait 4.2s)
[4231s]    ✗ vision pass DEFERRED for 49 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/1  cinnamon sponge cake:0/2  mexican chocolate pots:1/1  mexican chocolate potsba:1/1  start:1/1  sail square:23/23  muse#:9/19  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:10/17  sugar cane:2/11  speckled eggs:5/19  coins only:4/10  slider:11/11  offer it:10/10  dough hook:2/4  walk away:1/5  accept:1/2  deny:0/3  test#:1/1  arrgh:1/1  cacao pods:4/12  flaky jack:1/1  counter:1/1  coin:1/1  ask it:1/1  call dough hook:1/1  call flaky jack:0/1  fresh milk:2/5  vanilla beans:2/4  hot cinnamon:1/1
[4231s] 
== solo-desktop-wk: FAIL
[4231s]    ✗ offered but never exercised: vanilla beans
[4231s]    ✗ 5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 3.5s)
[4231s]    ✗ vision pass DEFERRED for 20 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/1  caramel slice:0/2  cinnamon sponge cake:1/1  cinnamon sponge cakebake:1/1  start:1/1  sail square:12/12  trade:6/12  muse#:6/12  sugar cane:3/10  vanilla beans:0/6  coins only:4/6  slider:6/6  offer it:6/6  dough hook:2/3  walk away:1/4  menu:0/1  fresh milk:1/5  hot cinnamon:1/5  arrgh:1/1  call crustbeard:1/1  call flaky jack:0/1  cacao pods:1/4  speckled eggs:1/2  flip coin:1/1  toasty wheat:1/1  flaky jack:1/1
[4231s] 
== solo-phone-wk: FAIL
[4231s]    ✗ 12 screen(s) never stopped moving before being checked (still moving: 12 geometry; longest wait 3.3s)
[4231s]    ✗ vision pass DEFERRED for 27 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/1  molten chocolate lava ca:0/2  crispy cocoa snaps:1/1  crispy cocoa snapsbake t:1/1  start:1/1  sail square:12/12  muse#:5/12  call crustbeard:1/3  call dough hook:0/1  menu:0/1  menu open:1/0  menu close:1/0  trade:6/11  sugar cane:3/10  coins only:2/6  slider:6/6  offer it:6/6  call flaky jack:2/2  dough hook:2/3  walk away:1/4  arrgh:1/1  vanilla beans:1/3  attack #:1/1  flip coin:1/1  hot cinnamon:2/5  fresh milk:3/5  cacao pods:2/3  flaky jack:1/1  accept:1/1  counter:0/1  deny:0/1
[4231s] 
== solo-tablet-wk: FAIL
[4231s]    ✗ 7 screen(s) never stopped moving before being checked (still moving: 6 geometry, 1 text; longest wait 3.2s)
[4231s]    ✗ vision pass DEFERRED for 17 screen(s) — queued for a session, NOT cleared
[4231s]    coverage: yarrgh:1/1  nah:0/1  cinnamon snaps:0/2  crispy cocoa snaps:1/1  crispy cocoa snapsbake t:1/1  start:1/1  sail square:18/18  muse#:6/13  menu:0/1  menu open:1/0  menu close:1/0  trade:7/12  toasty wheat:1/7  sugar cane:1/7  hot cinnamon:1/7  coins only:7/7  slider:7/7  offer it:7/7  fresh milk:1/6  speckled eggs:1/5  vanilla beans:1/4  arrgh:1/1  cacao pods:1/1  crustbeard#:1/1  flaky jack:0/1  walk away:0/1
[4231s] 
RESULT: FAIL
[4231s] WROTE /Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/google-search-console-020493/sea-trial-shots/judge-queue.json — 293 screen(s) awaiting a session's eyes.
[4231s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
