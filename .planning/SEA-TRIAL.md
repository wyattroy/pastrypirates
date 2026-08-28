# Sea trial — build `2026.08.27.3`

**FAILED** — 6 of 8 voyage(s) sailed, 2 NOT RUN  ·  2026-08-27T22:01:09.178Z  ·  50 min  ·  gear **FULL**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/orchestrator.js, src/shared/index.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, passplay-phone, passplay-desktop, crew-desktop, crew-phone |
| **voyages that did NOT run** | **solo-desktop-wk, solo-phone-wk** |

## What did NOT run, and why

**solo-desktop-wk**

```
WebKit is not installed, so the Safari legs did NOT run.
      mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit
      then re-run with PW_DIR=/tmp/pw
```

**solo-phone-wk**

```
WebKit is not installed, so the Safari legs did NOT run.
      mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit
      then re-run with PW_DIR=/tmp/pw
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

```
[2798s] [crew-phone] vision-judging 30 screen(s)…
[2804s]   [judge FATAL] crew-phone-guest-001-settled.png: the judge cannot run: API Error: Unable to connect to API: Self-signed certificate detected. Check your proxy or corporate SSL certificates
[2810s]   [judge FAIL] crew-desktop-guest-006-settled.png: large empty dead space in the right side panel between the crew list card and the menu items below (roughly 300px of blank space)
[2821s] [crew-phone] !! the vision judge cannot run: the judge cannot run: API Error: Unable to connect to API: Self-signed certificate detected. Check your proxy or corporate SSL certificates
[2821s] [crew-phone] falling back to the QUEUE — these 30 screen(s) are deferred, not cleared
[2824s]   [judge FAIL] crew-desktop-guest-009-settled.png: large empty dead space in right side panel below the four crew rows, roughly 400px of blank area before the menu list starts
[2830s]   [judge FAIL] crew-desktop-guest-008-settled.png: large empty dead space in right side panel between the leaderboard card and the menu list (roughly y=230 to y=555, over 300px of blank background)
[2839s]   [judge FAIL] crew-desktop-guest-010-settled.png: large empty dead space in the right side panel between the leaderboard card and the menu list (Sound/How to play/etc.)
[2885s]   [judge FAIL] crew-desktop-guest-015-settled.png: large empty dead space in the right sidebar between the crew list card and the bottom menu (Sound/Credits/Feedback/etc.), roughly half the panel height with nothing in it
[2941s] [crew-phone] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[2941s] [solo-desktop-wk] NOT RUN — WebKit is not installed, so the Safari legs did NOT run.
      mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit
      then re-run with PW_DIR=/tmp/pw
[2941s] [solo-phone-wk] NOT RUN — WebKit is not installed, so the Safari legs did NOT run.
      mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit
      then re-run with PW_DIR=/tmp/pw
[3007s] [crew-desktop] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[3007s] 
== solo-desktop: FAIL
[3007s]    ✗ vision judge FAILED 5 screen(s)
[3007s]    ✗ 7 screen(s) never stopped moving before being checked
[3007s]    coverage: arrgh:2/2  cocoa cloud souffléan ai:2/2  french pots de crèmeluxu:0/2  start:1/1  call crustbeard:2/3  call flaky jack:1/3  sail square:24/24  trade:8/19  muse#:7/19  cacao pods:2/9  coins only:6/8  slider:8/8  offer it:8/8  menu:0/1  attack #:4/4  flip coin:4/4  fresh milk:2/8  speckled eggs:2/7  hot cinnamon:2/8  accept:1/1  counter:0/1  deny:0/1  vanilla beans:3/5  dough hook:1/2  walk away:1/2  call dough hook:1/2
[3007s] 
== solo-phone: FAIL
[3007s]    ✗ vision judge FAILED 1 screen(s)
[3007s]    ✗ 2 screen(s) never stopped moving before being checked
[3007s]    coverage: arrgh:2/2  chocolate fudge tortea p:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:13/13  muse#:6/13  menu:0/1  menu open:1/0  menu close:1/0  trade:7/12  cacao pods:1/7  coins only:4/7  slider:7/7  offer it:7/7  fresh milk:1/5  call dough hook:1/1  call crustbeard:0/1  hot cinnamon:1/5  crystal sugar:4/6  vanilla beans:1/4  crustbeard#:1/1  walk away:0/1  toasty wheat:2/3
[3007s] 
== passplay-phone: FAIL
[3007s]    ✗ offered but never exercised: walk away
[3007s]    ✗ vision judge FAILED 2 screen(s)
[3007s]    ✗ 3 screen(s) never stopped moving before being checked
[3007s]    coverage: arrgh:2/2  cocoa cloud souffléan ai:2/2  pound cakea dense rich b:0/2  at the helm:43/43  chocolate genoise sponge:2/2  chocolate fudge tortea p:0/2  start:1/1  sail square:51/51  muse#:18/42  dock:4/4  flip coin:5/5  buy #:2/4  nah:2/4  menu:0/1  menu open:1/0  menu close:1/0  attack #:1/1  trade:19/40  call davy scones:1/1  call flaky jack:0/1  toasty wheat:3/16  speckled eggs:8/32  vanilla beans:3/19  coins only:8/16  slider:16/16  offer it:19/19  dough hook:1/1  walk away:0/3  cacao pods:3/12  hot cinnamon:3/12  fresh milk:3/10  crystal sugar:7/9  dough hook#:1/1  accept:1/1  counter:0/1  deny:0/1  davy scones:1/1
[3007s] 
== passplay-desktop: FAIL
[3007s]    ✗ vision judge FAILED 1 screen(s)
[3007s]    ✗ 5 screen(s) never stopped moving before being checked
[3007s]    coverage: arrgh:2/2  chocolate fudge tortea p:2/4  cinnamonchocolate fudgea:0/2  at the helm:31/31  cinnamon dutch babya dra:2/2  start:1/1  sail square:36/36  muse#:14/30  menu:0/1  trade:15/27  cacao pods:9/26  coins only:4/4  slider:4/4  offer it:15/15  toasty wheat:9/25  dough hook:1/2  walk away:1/3  accept:1/1  counter:0/1  deny:0/1  davy scones:1/1  dock:1/1  flip coin:1/1  buy #:1/1  nah:0/1  crystal sugar:4/8  vanilla beans:3/6  hot cinnamon:1/1
[3007s] 
== crew-desktop: FAIL
[3007s]    ✗ offered but never exercised: deny
[3007s]    ✗ 2 moment(s) where the two captains saw different games: captains (host: test1:1,Flaky:8,Dough:4,test2:2   guest: test2:2,test1:1,Flaky:7,Dough:4); whose turn (host lights Dough, guest lights Flaky)
[3007s]    ✗ vision judge FAILED 7 screen(s)
[3007s]    ✗ 14 screen(s) never stopped moving before being checked
[3007s]    coverage: arrgh:2/2  spiced fudge browniesdee:2/2  mayan cocoa souffléa soa:0/2  start:1/1  sail square:21/21  muse#:9/20  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:9/19  hot cinnamon:2/9  coins only:5/9  slider:10/10  offer it:9/9  crystal sugar:2/8  speckled eggs:1/6  test#:1/1  walk away:0/2  flip coin:5/5  accept:1/2  counter:1/2  deny:0/3  call dough hook:1/2  call flaky jack:0/1  toasty wheat:2/5  vanilla beans:4/8  flaky jack#:1/1  coin:1/1  ask it:1/1  call test#:1/1  attack #:2/2  fresh milk:1/1  fire again #:1/1  break off:0/1  cacao pods:1/1
[3007s] 
== crew-phone: FAIL
[3007s]    ✗ 4 structural check failure(s)
[3007s]    ✗ 1 dead control(s): Trade
[3007s]    ✗ 19 screen(s) never stopped moving before being checked
[3007s]    ✗ vision pass DEFERRED for 30 screen(s) — queued for a session, NOT cleared
[3007s]    coverage: arrgh:2/2  pound cakea dense rich b:2/2  caramel slicea toastedco:0/2  start:1/1  sail square:18/18  muse#:8/18  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:9/17  speckled eggs:3/11  coins only:4/9  slider:10/10  offer it:9/9  test#:1/1  walk away:1/6  accept:2/4  counter:1/4  deny:1/5  dough hook:1/2  coin:1/1  ask it:1/1  fresh milk:2/8  vanilla beans:2/7  flaky jack:2/2  toasty wheat:3/8  dough hook#:1/1  call dough hook:1/1  call flaky jack:0/2  cacao pods:3/4  call test#:1/1  attack #:1/1  flip coin:1/1  hot cinnamon:1/1
[3007s] 
== solo-desktop-wk: PASS (voyage incomplete)
[3007s] 
== solo-phone-wk: PASS (voyage incomplete)
[3007s] 
RESULT: FAIL
[3007s] WROTE /home/user/pastrypirates/sea-trial-shots/judge-queue.json — 30 screen(s) awaiting a session's eyes.
[3007s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
