# Sea trial — build `2026.08.29.2`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-08-29T16:53:43.058Z  ·  96 min  ·  gear **FULL**  ·  sailed on **cloud container**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |
| **voyages that only finished after a BROWSER RESTART** | **solo-desktop-wk ×5, solo-phone-wk ×5, solo-tablet-wk ×4** — the known WebKit crash in this container; each was resumed from the game's own save. A rescued leg is not a clean one. |



## The voyages, in full

```
== solo-desktop: FAIL
[5748s]    ✗ vision judge errored on 22 screen(s) — those screens are NOT cleared
[5748s]    ✗ 1 screen(s) never stopped moving before being checked
[5748s]    coverage: arrgh:2/2  vanilla bean crème brûlé:2/2  molten chocolate lava ca:0/2  start:1/1  sail square:19/19  trade:9/18  muse#:9/18  crystal sugar:5/17  coins only:5/9  slider:9/9  offer it:9/9  dough hook:1/2  walk away:1/2  menu:0/1  flip coin:1/1  flee:1/1  stand yer ground:0/1  speckled eggs:1/6  hot cinnamon:1/7  cacao pods:1/6  vanilla beans:1/6  call crustbeard:1/1  call flaky jack:0/1  fresh milk:2/4  toasty wheat:2/3
[5748s] 
== solo-phone: FAIL
[5748s]    ✗ 1 structural check failure(s)
[5748s]    ✗ vision judge errored on 24 screen(s) — those screens are NOT cleared
[5748s]    ✗ 9 screen(s) never stopped moving before being checked
[5748s]    coverage: arrgh:2/2  crispy cocoa snapsthin h:2/2  cinnamonchocolate fudgea:0/2  start:1/1  sail square:33/34  trade:9/19  muse#:9/19  toasty wheat:2/9  coins only:3/9  slider:9/9  offer it:9/9  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:2/9  dough hook:2/3  walk away:2/5  hot cinnamon:4/11  crustbeard:1/2  crystal sugar:2/5  vanilla beans:1/5  attack #:1/1  flip coin:1/1  speckled eggs:3/5  cacao pods:1/3  call crustbeard:1/1  call flaky jack:0/1
[5748s] 
== solo-tablet: FAIL
[5748s]    ✗ vision judge errored on 28 screen(s) — those screens are NOT cleared
[5748s]    ✗ 5 screen(s) never stopped moving before being checked
[5748s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  dark chocolate cream puf:0/2  start:1/1  sail square:15/15  muse#:6/15  call crustbeard:1/1  call dough hook:1/3  menu:0/1  menu open:1/0  menu close:1/0  trade:7/14  crystal sugar:4/12  cacao pods:1/7  coins only:4/7  slider:6/6  offer it:7/7  flaky jack:2/3  walk away:1/3  speckled eggs:1/6  call flaky jack:1/2  fresh milk:1/4  toasty wheat:2/3  vanilla beans:1/3  flip coin:3/3  attack #:1/1  slider disabled:1/1  dock:1/1  nah:1/1
[5748s] 
== passplay-phone: FAIL
[5748s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5748s]    ✗ 7 screen(s) never stopped moving before being checked
[5748s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/4  cinnamon dutch babya dra:0/2  at the helm:40/40  mayan cocoa souffléa soa:2/2  start:1/1  sail square:48/48  trade:18/40  muse#:18/40  toasty wheat:4/18  coins only:8/18  slider:18/18  offer it:18/18  menu:0/1  menu open:1/0  menu close:1/0  crystal sugar:4/19  dough hook:1/2  walk away:1/5  attack #:4/4  call davy scones:1/1  call dough hook:2/6  flip coin:4/4  vanilla beans:7/25  flaky jack#:1/1  cacao pods:4/13  call flaky jack:1/2  hot cinnamon:3/7  call peg leg meg:2/3  speckled eggs:3/7  accept:1/1  counter:0/1  deny:0/1  peg leg meg:1/1  fresh milk:4/5  flaky jack:1/1
[5748s] 
== passplay-desktop: FAIL
[5748s]    ✗ offered but never exercised: walk away
[5748s]    ✗ vision judge errored on 25 screen(s) — those screens are NOT cleared
[5748s]    ✗ 3 screen(s) never stopped moving before being checked
[5748s]    coverage: arrgh:1/1  mayan cocoa souffléa soa:2/2  chocolate genoise sponge:0/2  at the helm:32/32  caramel slicea toastedco:2/2  snickerdoodle bitespillo:0/2  start:1/1  sail square:42/42  trade:17/34  muse#:17/34  fresh milk:4/14  coins only:4/4  slider:4/4  offer it:4/4  menu:0/1  toasty wheat:4/14  speckled eggs:3/12  flaky jack#:1/1  walk away:0/4  slider disabled:11/11  nah:11/11  hot cinnamon:3/10  dough hook:1/1  vanilla beans:9/15  flaky jack:1/1  cacao pods:3/4  accept:1/1  counter:0/1  deny:0/1  peg leg meg:1/1
[5748s] 
== crew-desktop: FAIL
[5748s]    ✗ offered but never exercised: deny
[5748s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5748s]    ✗ 12 screen(s) never stopped moving before being checked
[5748s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  mayan cocoa souffléa soa:0/2  start:1/1  call dough hook:1/2  call test#:1/2  sail square:22/22  trade:11/22  muse#:10/22  vanilla beans:3/12  coins only:7/11  slider:12/12  offer it:11/11  test#:1/1  walk away:1/4  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  accept:1/2  counter:1/2  deny:0/3  speckled eggs:2/8  crystal sugar:2/7  dough hook:1/2  flaky jack#:0/1  attack #:1/1  flip coin:1/1  toasty wheat:5/9  dough hook#:1/1  fresh milk:3/4  coin:1/1  ask it:1/1
[5748s] 
== crew-phone: FAIL (voyage incomplete)
[5748s]    ✗ did not finish the voyage
[5748s]    ✗ offered but never exercised: walk away
[5748s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5748s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[5748s]    ✗ 11 screen(s) never stopped moving before being checked
[5748s]    coverage: arrgh:1/1  crispy cocoa snapsthin h:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:9/9  dock:1/2  trade:4/9  muse#:4/9  flip coin:1/1  buy #:1/1  nah:0/1  accept:1/1  counter:0/1  deny:0/1  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  toasty wheat:3/4  fresh milk:1/4  speckled eggs:1/4  coins only:2/4  slider:4/4  offer it:4/4  test#:1/1  walk away:0/2  call dough hook:1/1  call flaky jack:0/1  crystal sugar:1/1  vanilla beans:0/1  dough hook:1/1
[5748s] 
== solo-desktop-wk: FAIL
[5748s]    ✗ 5 WebKit relaunch(es) over ? day(s) — above the 2 this voyage's length allows; that is a crash loop being ridden out, not a voyage
[5748s]    ✗ offered but never exercised: deny
[5748s]    ✗ vision judge errored on 24 screen(s) — those screens are NOT cleared
[5748s]    ✗ 8 screen(s) never stopped moving before being checked
[5748s]    ✱ 5 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5748s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  french pots de crèmeluxu:0/2  start:1/1  sail square:17/17  trade:7/16  muse#:7/16  vanilla beans:2/9  coins only:3/6  slider:6/6  offer it:6/6  flaky jack#:1/1  walk away:0/2  menu:0/1  accept:1/2  deny:0/3  speckled eggs:1/7  attack #:2/2  flip coin:3/3  toasty wheat:4/9  flaky jack:1/1  fresh milk:1/4  fire again #:1/1  break off:0/1  crystal sugar:1/3  slider disabled:2/2  nah:1/1  counter:1/1  coin:1/1  ask it:1/1  hot cinnamon:1/1  cacao pods:1/1
[5748s] 
== solo-phone-wk: FAIL
[5748s]    ✗ 5 WebKit relaunch(es) over ? day(s) — above the 2 this voyage's length allows; that is a crash loop being ridden out, not a voyage
[5748s]    ✗ 2 structural check failure(s)
[5748s]    ✗ 10 console error(s): ERR WebSocket connection to 'wss://s-gke-usc1-nssi4-67.firebaseio.com/.ws?v=5&p=1:546790679465:web:cdb72aa39660fca844dab8&ns=pastry-pirates-default-rtdb' failed: Unacceptable TLS certificate
[5748s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5748s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[5748s]    ✗ 10 screen(s) never stopped moving before being checked
[5748s]    ✱ 5 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5748s]    coverage: arrgh:2/2  mayan cocoa souffléa soa:2/2  dark chocolate cream puf:0/2  start:1/1  sail square:25/25  dock:2/4  muse#:9/23  flip coin:4/4  buy #:1/2  nah:1/2  menu:0/1  menu open:1/0  menu close:1/0  trade:10/22  toasty wheat:2/11  crystal sugar:4/10  coins only:3/10  slider:10/10  offer it:10/10  call dough hook:2/4  call crustbeard:2/3  call flaky jack:2/5  speckled eggs:2/9  vanilla beans:1/7  fresh milk:2/8  dough hook:1/2  walk away:1/3  accept:1/1  counter:0/1  deny:0/1  attack #:2/2  cacao pods:2/6  speckled eggs #:3/6  hot cinnamon:2/5  flaky jack:1/1
[5748s] 
== solo-tablet-wk: FAIL
[5748s]    ✗ 4 WebKit relaunch(es) over ? day(s) — above the 2 this voyage's length allows; that is a crash loop being ridden out, not a voyage
[5748s]    ✗ offered but never exercised: vanilla beans
[5748s]    ✗ vision judge errored on 25 screen(s) — those screens are NOT cleared
[5748s]    ✗ 5 screen(s) never stopped moving before being checked
[5748s]    ✱ 4 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5748s]    coverage: arrgh:2/2  dark chocolate cream puf:2/2  mexican chocolate tortea:0/2  start:1/1  sail square:17/17  muse#:7/14  menu:0/1  menu open:1/0  menu close:1/0  trade:7/12  toasty wheat:2/7  coins only:7/7  slider:5/5  offer it:7/7  crustbeard#:1/1  walk away:0/1  flip coin:1/1  slider disabled:2/2  crystal sugar:1/5  speckled eggs:1/4  cacao pods:1/4  vanilla beans:0/3  fresh milk:1/2  hot cinnamon:1/2
[5748s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
