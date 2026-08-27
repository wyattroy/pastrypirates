# Sea trial — build `2026-08-26k-CUTOVER`

**FAILED** — 6 of 8 voyage(s) sailed, 2 NOT RUN  ·  2026-08-27T03:27:28.667Z  ·  81 min  ·  gear **FULL**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: src/ui/bakeoff.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, passplay-phone, passplay-desktop, crew-desktop, crew-phone |
| **voyages that did NOT run** | **solo-desktop-wk, solo-phone-wk** |

## What did NOT run, and why

**solo-desktop-wk**

```
playwright not found. mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit  — then PW_DIR=/tmp/pw
```

**solo-phone-wk**

```
playwright not found. mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit  — then PW_DIR=/tmp/pw
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

```
[4338s]   [crew-desktop-host] DAY 21
[4338s]   [crew-desktop-guest] DAY 21
[4377s]   [crew-desktop-host] DAY 22
[4377s]   [crew-desktop-guest] DAY 22
[4378s]   [judge FAIL] crew-phone-host-008-settled.png: faint ghosted/duplicate rounded-box edge visible peeking out just above the 'Tap and hold the sea to reveal the board' bubble, right under the wind bar — looks like a second card doubled/clipped behind the front one
[4398s]   [crew-desktop-guest] note: still moving at the cap (2600ms) — checked anyway
[4410s]   [crew-desktop-host] note: still moving at the cap (2612ms) — checked anyway
[4458s]   [crew-desktop-guest] END OF VOYAGE at day 22
[4463s]   [crew-desktop-host] END OF VOYAGE at day 22
[4464s] [crew-desktop] vision-judging 30 screen(s)…
[4573s] [crew-phone] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[4573s] [solo-desktop-wk] ERROR: playwright not found. mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit  — then PW_DIR=/tmp/pw
[4577s] [solo-desktop-wk] contact sheet: /Users/wyattroy/Documents/Projects/pastrypirates/sea-trial-shots/contact-solo-desktop-wk.png
[4577s] [solo-phone-wk] ERROR: playwright not found. mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit  — then PW_DIR=/tmp/pw
[4580s] [solo-phone-wk] contact sheet: /Users/wyattroy/Documents/Projects/pastrypirates/sea-trial-shots/contact-solo-phone-wk.png
[4635s]   [judge FAIL] crew-desktop-host-006-settled.png: large empty dead space in right-side panel between the crew list card and the menu items (Sound/How to play/Credits/etc.), roughly a third of the panel's height is blank
[4693s] [solo-desktop-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[4697s] [solo-phone-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[4874s] [crew-desktop] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[4874s] 
== solo-desktop: FAIL
[4874s]    ✗ 5 screen(s) never stopped moving before being checked
[4874s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  caramel slicea toastedco:0/2  start:1/1  sail square:20/20  pass #:10/20  menu:0/1  trade:10/19  cacao pods:2/11  coins only:3/10  slider:9/9  offer it:10/10  crustbeard#:1/1  walk away:1/5  toasty wheat:4/12  dough hook:2/3  hot cinnamon:1/7  vanilla beans:2/8  fresh milk:2/5  call crustbeard:1/1  call dough hook:0/1  crystal sugar:4/7  speckled eggs:2/4  flaky jack:1/1
[4874s] 
== solo-phone: FAIL
[4874s]    ✗ vision judge FAILED 3 screen(s)
[4874s]    ✗ 8 screen(s) never stopped moving before being checked
[4874s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  crispy cocoa snapsthin h:0/2  start:1/1  sail square:18/18  pass #:9/18  menu:0/1  menu open:1/0  menu close:1/0  call flaky jack:1/4  call dough hook:1/2  trade:9/16  toasty wheat:2/9  vanilla beans:1/9  coins only:5/9  slider:9/9  offer it:9/9  speckled eggs:1/7  cacao pods:1/7  hot cinnamon:4/9  call crustbeard:2/2  dough hook:1/2  walk away:1/4  fresh milk:2/3  crystal sugar:2/4  flaky jack:2/2
[4874s] 
== passplay-phone: FAIL
[4874s]    ✗ offered but never exercised: deny
[4874s]    ✗ 11 screen(s) never stopped moving before being checked
[4874s]    coverage: arrgh:2/2  spiced fudge browniesdee:2/2  french pots de crèmeluxu:0/2  at the helm:38/38  chocolate genoise sponge:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:44/44  pass #:17/38  menu:0/1  menu open:1/0  menu close:1/0  trade:18/34  toasty wheat:5/21  coins only:8/18  slider:15/15  offer it:18/18  dough hook:2/4  walk away:1/4  accept:1/2  counter:1/2  deny:0/3  peg leg meg:1/1  attack #:3/3  flip coin:4/4  flee:1/1  stand yer ground:0/1  fresh milk:4/18  call peg leg meg:1/2  call flaky jack:1/2  hot cinnamon:4/16  flaky jack:1/1  coin:1/1  ask it:1/1  crystal sugar:8/19  vanilla beans:3/9  speckled eggs:3/6  cacao pods:3/5
[4874s] 
== passplay-desktop: FAIL
[4874s]    ✗ vision judge FAILED 1 screen(s)
[4874s]    ✗ 4 screen(s) never stopped moving before being checked
[4874s]    coverage: arrgh:2/2  caramel slicea toastedco:2/2  cinnamon snapscrisp rust:0/2  at the helm:45/45  cinnamon sponge cakea fl:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:48/48  pass #:22/45  menu:0/1  trade:23/43  toasty wheat:5/20  coins only:7/12  slider:12/12  offer it:22/22  cacao pods:3/15  fresh milk:6/20  dough hook:2/4  walk away:2/5  speckled eggs:4/15  hot cinnamon:4/13  crystal sugar:13/22  vanilla beans:2/2  accept:1/1  counter:0/1  deny:0/1  davy scones:1/1
[4874s] 
== crew-desktop: FAIL
[4874s]    ✗ vision judge FAILED 1 screen(s)
[4874s]    ✗ 15 screen(s) never stopped moving before being checked
[4874s]    coverage: arrgh:2/2  mexican chocolate tortea:2/2  chocolate genoise sponge:0/2  start:1/1  sail square:25/25  trade:11/22  pass #:10/22  speckled eggs:2/12  coins only:7/11  slider:12/12  offer it:11/11  test#:1/2  walk away:1/4  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  accept:2/5  counter:2/5  deny:1/7  call test#:1/1  call dough hook:0/1  toasty wheat:3/10  flaky jack:1/1  coin:2/2  ask it:2/2  attack #:1/1  flip coin:2/2  hot cinnamon:2/7  fresh milk:2/6  crystal sugar:2/5  vanilla beans:4/7  flaky jack#:1/1
[4874s] 
== crew-phone: FAIL
[4874s]    ✗ 2 structural check failure(s)
[4874s]    ✗ vision judge FAILED 1 screen(s)
[4874s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[4874s]    ✗ 19 screen(s) never stopped moving before being checked
[4874s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:18/18  trade:9/18  pass #:8/18  crystal sugar:4/13  coins only:3/9  slider:10/10  offer it:9/9  dough hook:2/3  walk away:1/5  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  cacao pods:2/7  test#:2/2  accept:1/3  counter:1/3  deny:1/4  coin:1/1  ask it:1/1  toasty wheat:2/6  vanilla beans:4/8  hot cinnamon:1/4  speckled eggs:2/3  call test#:1/1  call flaky jack:0/1  dock:1/1  flip coin:1/1  nah:1/1
[4874s] 
== solo-desktop-wk: FAIL (voyage incomplete)
[4874s]    ✗ did not finish the voyage
[4874s]    ✗ leg error: playwright not found. mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit  — then PW_DIR=/tmp/pw
[4874s] 
== solo-phone-wk: FAIL (voyage incomplete)
[4874s]    ✗ did not finish the voyage
[4874s]    ✗ leg error: playwright not found. mkdir -p /tmp/pw && cd /tmp/pw && npm init -y && npm i playwright && npx playwright install webkit  — then PW_DIR=/tmp/pw
[4874s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `4/scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
