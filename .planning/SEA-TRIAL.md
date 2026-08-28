# Sea trial — build `2026.08.28.1`

**FAILED** — 8 of 8 voyage(s) sailed  ·  2026-08-28T06:12:11.744Z  ·  75 min  ·  gear **FULL**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
[2558s]   [solo-phone-wk] DAY 1
[2565s]   [solo-phone-wk] note: still moving at the cap (2733ms) — checked anyway
[2580s]   [solo-phone-wk] DAY 2
[2612s]   [solo-phone-wk] DAY 3
[2618s] [solo-phone-wk] ERROR: sig() could not read the page: page.evaluate: Target crashed 
[2618s] [solo-phone-wk] vision-judging 8 screen(s)…
[2651s] [solo-desktop-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[2660s] [solo-phone-wk] contact sheet: /home/user/pastrypirates/sea-trial-shots/contact-solo-phone-wk.png
[2775s] [solo-phone-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[4212s]   [crew-phone-guest] TIMED OUT after 35 min without reaching the end of voyage
[4212s]   [crew-phone-host] TIMED OUT after 35 min without reaching the end of voyage
[4215s] [crew-phone] vision-judging 30 screen(s)…
[4463s] [crew-phone] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[4463s] 
== solo-desktop: FAIL
[4463s]    ✗ vision judge FAILED 4 screen(s)
[4463s]    ✗ 6 screen(s) never stopped moving before being checked
[4463s]    coverage: arrgh:2/2  snickerdoodle bitespillo:2/2  cocoa cloud souffléan ai:0/2  start:1/1  sail square:15/15  trade:7/15  muse#:7/15  speckled eggs:1/8  coins only:3/7  slider:7/7  offer it:7/7  menu:0/1  call crustbeard:1/1  call dough hook:0/1  fresh milk:1/6  crystal sugar:3/10  hot cinnamon:1/7  vanilla beans:3/7  dough hook:1/2  walk away:1/3  cacao pods:1/4  attack #:1/1  flip coin:1/1  toasty wheat:2/2  flaky jack:1/1
[4463s] 
== solo-phone: FAIL
[4463s]    ✗ vision judge FAILED 3 screen(s)
[4463s]    ✗ 6 screen(s) never stopped moving before being checked
[4463s]    coverage: arrgh:1/1  cinnamon snapscrisp rust:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:24/24  muse#:12/25  menu:0/1  menu open:1/0  menu close:1/0  trade:12/22  crystal sugar:6/14  coins only:4/8  slider:8/8  offer it:11/11  crustbeard#:1/1  walk away:0/2  fresh milk:2/8  dock:1/1  flip coin:1/1  nah:1/1  accept:1/1  counter:0/1  deny:0/1  vanilla beans:1/7  speckled eggs:5/10  flaky jack#:1/1  toasty wheat:2/5  hot cinnamon:2/5
[4463s] 
== passplay-phone: FAIL
[4463s]    ✗ vision judge FAILED 1 screen(s)
[4463s]    ✗ 1 screen(s) never stopped moving before being checked
[4463s]    coverage: arrgh:1/1  cinnamonsugar churroscri:2/2  chocolate fudge tortea p:0/2  at the helm:35/35  chocolate genoise sponge:2/2  mexican chocolate tortea:0/2  start:1/1  sail square:44/44  trade:17/34  muse#:17/34  hot cinnamon:5/19  coins only:2/2  slider:2/2  offer it:17/17  menu:0/1  menu open:1/0  menu close:1/0  flaky jack#:1/1  walk away:0/2  vanilla beans:14/27  dough hook:1/1  speckled eggs:2/11  cacao pods:3/12  crystal sugar:3/11  toasty wheat:3/9  fresh milk:2/3
[4463s] 
== passplay-desktop: FAIL
[4463s]    ✗ vision judge FAILED 1 screen(s)
[4463s]    ✗ 10 screen(s) never stopped moving before being checked
[4463s]    coverage: arrgh:2/2  mexican chocolate potssi:2/2  mayan cocoa souffléa soa:0/2  at the helm:36/36  cinnamon snapscrisp rust:2/2  cinnamon sponge cakea fl:0/2  start:1/1  sail square:44/44  dock:2/2  muse#:15/36  flip coin:9/9  buy #:1/1  nah:1/2  trade:15/34  hot cinnamon:3/16  coins only:7/11  slider:12/12  offer it:15/15  accept:1/3  counter:1/3  deny:1/4  peg leg meg:1/1  walk away:1/5  menu:0/1  speckled eggs:3/14  dough hook:1/2  coin:1/1  ask it:1/1  dough hook#:1/1  attack #:4/4  crystal sugar:5/18  flaky jack#:1/1  vanilla beans:3/10  cacao pods:3/8  speckled eggs #:3/3  call peg leg meg:1/1  call flaky jack:0/1  toasty wheat:3/3
[4463s] 
== crew-desktop: FAIL
[4463s]    ✗ offered but never exercised: vanilla beans
[4463s]    ✗ offered but never exercised: vanilla beans
[4463s]    ✗ vision judge FAILED 3 screen(s)
[4463s]    ✗ 8 screen(s) never stopped moving before being checked
[4463s]    coverage: arrgh:1/1  spiced fudge browniesdee:2/2  cinnamon sponge cakea fl:0/2  start:1/1  sail square:12/12  trade:6/12  muse#:6/12  fresh milk:1/5  coins only:6/6  slider:6/6  offer it:6/6  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  cacao pods:1/5  vanilla beans:0/4  speckled eggs:1/4  hot cinnamon:1/4  crystal sugar:1/1  toasty wheat:1/1  dough hook:1/1  walk away:0/1  accept:1/1  counter:0/1  deny:0/1
[4463s] 
== crew-phone: FAIL (voyage incomplete)
[4463s]    ✗ did not finish the voyage
[4463s]    ✗ 2 structural check failure(s)
[4463s]    ✗ 7 screen(s) never stopped moving before being checked
[4463s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  cinnamon dutch babya dra:0/2  start:1/1  sail square:8/8  dock:1/1  muse#:3/8  flip coin:2/2  buy #:1/1  nah:0/1  call flaky jack:1/1  call dough hook:0/1  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:4/7  crystal sugar:1/4  coins only:3/4  offer it:4/4  hot cinnamon:1/3  slider:3/3  speckled eggs:2/3  cacao pods:0/2  test#:1/1  walk away:0/1  fresh milk:1/1
[4463s] 
== solo-desktop-wk: FAIL (voyage incomplete)
[4463s]    ✗ did not finish the voyage
[4463s]    ✗ 1 screen(s) never stopped moving before being checked
[4463s]    ✗ leg error: sig() could not read the page: page.evaluate: Target crashed 
[4463s]    coverage: arrgh:1/1  mexican chocolate tortea:2/2  french pots de crèmeluxu:0/2  start:1/1  sail square:1/1
[4463s] 
== solo-phone-wk: FAIL (voyage incomplete)
[4463s]    ✗ did not finish the voyage
[4463s]    ✗ 1 screen(s) never stopped moving before being checked
[4463s]    ✗ leg error: sig() could not read the page: page.evaluate: Target crashed 
[4463s]    coverage: arrgh:1/1  snickerdoodle bitespillo:2/2  vanilla bean crème brûlé:0/2  start:1/1  sail square:3/3  muse#:2/2  menu:0/1  menu open:1/0  menu close:1/0
[4463s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
