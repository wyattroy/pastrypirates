# Sea trial v2 — build `2026.09.01.7`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-01T19:14:17.472Z  ·  88 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: .claude-team/GREEN-step1.txt, .claude-team/RED-step1.txt, about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/shared/storyboard.js, src/shared/visibility.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| **can the vision judge see?** | **NO** — **THE JUDGE CANNOT SEE** — every visual verdict below is worthless; the structural half still stands. } ·  · Node.js v22.15.1 |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
== solo-desktop: FAIL
[5217s]    ✗ offered but never exercised: deny
[5217s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 36 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  dark chocolate cream puf:2/2  cocoa cloud souffléan ai:0/2  start:1/1  sail square:16/16  dock:3/4  muse#:4/15  flip coin:8/8  buy #:2/2  nah:2/4  menu:0/1  call crustbeard:2/2  call dough hook:0/2  trade:5/14  vanilla beans:3/9  crystal sugar:2/8  coins only:2/4  slider:5/5  offer it:4/4  dough hook:1/2  walk away:1/2  flee:1/1  stand yer ground:0/1  attack #:3/3  call flaky jack:1/2  accept:1/2  counter:1/2  deny:0/3  speckled eggs:1/4  cacao pods:1/4  coin:0/1  ask it:1/1  toasty wheat:1/2  fresh milk:1/2  hot cinnamon:0/2  crystal sugar #:2/2  slider disabled:1/1
[5217s] 
== solo-phone: FAIL
[5217s]    ✗ 7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 19 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  spiced cocoa shortbreadb:2/2  cinnamonchocolate fudgea:0/2  start:1/1  sail square:15/15  trade:8/15  muse#:7/15  crystal sugar:2/8  coins only:3/8  slider:8/8  offer it:8/8  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:2/7  cacao pods:1/6  fresh milk:4/8  hot cinnamon:3/8  dough hook:2/3  walk away:1/3  speckled eggs:1/5  call crustbeard:1/1  call flaky jack:0/1
[5217s] 
== solo-tablet: FAIL
[5217s]    ✗ 5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 28 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  snickerdoodle bitespillo:0/2  start:1/1  sail square:16/16  muse#:7/16  menu:0/1  menu open:1/0  menu close:1/0  dock:2/2  trade:7/15  flip coin:3/3  buy #:1/1  nah:1/2  toasty wheat:2/7  speckled eggs:1/7  coins only:6/7  slider:6/6  offer it:7/7  dough hook:1/1  walk away:0/1  call crustbeard:1/2  call dough hook:1/2  slider disabled:1/1  vanilla beans:1/5  cacao pods:1/4  hot cinnamon:1/4  fresh milk:1/3  crystal sugar:1/2
[5217s] 
== passplay-phone: FAIL
[5217s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "Call Flaky Jack" over "Davy Scones — a battle's brewi", "Call Dough
[5217s]    ✗ 15 screen(s) never stopped moving before being checked (still moving: 15 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 39 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  cocoa cloud souffléan ai:2/4  molten chocolate lava ca:0/2  at the helm:38/38  mexican chocolate potssi:2/2  start:1/1  sail square:50/50  muse#:15/38  menu:0/1  menu open:1/0  menu close:1/0  dock:2/2  trade:16/34  flip coin:10/10  buy #:1/1  nah:1/2  speckled eggs:7/19  cacao pods:3/15  coins only:8/16  slider:15/15  offer it:16/16  accept:2/4  counter:1/2  deny:1/5  peg leg meg:1/1  walk away:1/5  call flaky jack:1/2  call dough hook:1/4  toasty wheat:4/15  dough hook:2/3  coin:1/1  ask it:1/1  crystal sugar:3/7  hot cinnamon:2/8  attack #:5/6  call peg leg meg:2/2  fresh milk:4/5  vanilla beans:1/1  flee:1/1  stand yer ground:0/1  slider disabled:2/2  davy scones:1/1
[5217s] 
== passplay-desktop: FAIL
[5217s]    ✗ 11 screen(s) never stopped moving before being checked (still moving: 11 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 43 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  mexican chocolate potssi:2/2  chocolate fudge tortea p:0/2  at the helm:53/53  chocolate genoise sponge:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:63/63  muse#:20/52  menu:0/1  trade:20/50  vanilla beans:3/16  coins only:7/20  slider:21/21  offer it:20/20  call dough hook:2/4  call flaky jack:2/4  fresh milk:4/17  dock:12/12  flip coin:12/12  buy #:4/9  nah:5/12  hot cinnamon:8/23  dough hook:2/4  walk away:2/8  crystal sugar:4/13  speckled eggs:4/17  flaky jack:2/2  cacao pods:9/17  accept:2/4  counter:1/4  deny:1/5  peg leg meg:1/1  hot cinnamon #:4/4  coin:1/1  ask it:1/1  # crates:3/3  toasty wheat:3/4  davy scones:1/1
[5217s] 
== crew-desktop: FAIL
[5217s]    ✗ 16 screen(s) never stopped moving before being checked (still moving: 16 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 49 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  vanilla bean crème brûlé:0/2  start:1/1  sail square:15/15  muse#:4/15  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  attack #:2/2  trade:5/14  flip coin:6/6  crystal sugar:1/5  vanilla beans:2/7  coins only:2/4  slider:4/4  offer it:4/4  dock:4/5  buy #:2/2  nah:3/5  slider disabled:1/1  test#:1/1  walk away:0/2  toasty wheat:1/3  fresh milk:1/3  flaky jack:1/1  accept:1/1  counter:0/1  deny:0/1  hot cinnamon:1/2  vanilla beans #:2/2
[5217s] 
== crew-phone: FAIL
[5217s]    ✗ offered but never exercised: deny
[5217s]    ✗ 15 screen(s) never stopped moving before being checked (still moving: 15 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 50 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  mayan cocoa souffléa soa:0/2  start:1/1  sail square:21/21  trade:9/18  muse#:9/18  hot cinnamon:1/9  coins only:5/9  slider:9/9  offer it:9/9  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  crystal sugar:2/8  vanilla beans:1/7  call test#:1/2  call flaky jack:1/2  cacao pods:2/6  test#:1/1  flaky jack:0/1  walk away:1/4  toasty wheat:4/5  dough hook#:1/1  fresh milk:3/3  dough hook:1/2  flip coin:1/1
[5217s] 
== solo-desktop-wk: FAIL
[5217s]    ✗ 3 screen(s) never stopped moving before being checked (still moving: 3 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 23 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  dark chocolate cream puf:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:16/16  muse#:6/13  menu:0/1  trade:6/12  fresh milk:1/6  speckled eggs:2/7  coins only:5/6  slider:6/6  offer it:6/6  call dough hook:1/2  call crustbeard:0/1  dock:1/1  flip coin:2/2  buy #:1/1  nah:0/1  call flaky jack:1/1  hot cinnamon:1/4  vanilla beans:1/4  toasty wheat:1/2  cacao pods:0/2  crystal sugar:1/1
[5217s] 
== solo-phone-wk: FAIL
[5217s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.8s)
[5217s]    ✗ vision pass DEFERRED for 26 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  chocolate genoise sponge:0/2  start:1/1  sail square:24/24  dock:2/3  muse#:7/17  flip coin:2/2  buy #:1/2  nah:1/2  menu:0/1  menu open:1/0  menu close:1/0  trade:8/16  speckled eggs:2/10  cacao pods:1/8  hot cinnamon:1/8  coins only:3/8  slider:8/8  offer it:8/8  dough hook:2/3  walk away:1/4  call crustbeard:2/3  call dough hook:1/3  fresh milk:3/9  flaky jack:1/1  crystal sugar:2/5  vanilla beans:1/4  toasty wheat:3/5
[5217s] 
== solo-tablet-wk: FAIL
[5217s]    ✗ 2 screen(s) never stopped moving before being checked (still moving: 2 geometry; longest wait 2.7s)
[5217s]    ✗ vision pass DEFERRED for 30 screen(s) — queued for a session, NOT cleared
[5217s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  dark chocolate cream puf:0/2  start:1/1  sail square:23/23  muse#:9/20  menu:0/1  menu open:1/0  menu close:1/0  trade:10/18  crystal sugar:2/10  coins only:9/10  slider:10/10  offer it:10/10  dough hook:1/1  walk away:0/2  flip coin:4/4  cacao pods:1/8  fresh milk:2/7  speckled eggs:1/7  hot cinnamon:1/6  attack #:1/1  fire again #:1/2  break off:1/2  vanilla beans:1/4  call crustbeard:1/1  call dough hook:0/1  toasty wheat:3/3  crustbeard#:1/1
[5218s] 
RESULT: FAIL
[5218s] WROTE C:\Users\wyatt\Projects\pastrypirates\sea-trial-shots\judge-queue.json — 343 screen(s) awaiting a session's eyes.
[5218s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
