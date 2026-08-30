# Sea trial — build `2026.08.29.3`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-08-29T23:06:28.202Z  ·  85 min  ·  gear **FULL**  ·  sailed on **cloud container**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |
| **voyages that only finished after a BROWSER RESTART** | **solo-desktop-wk ×1, solo-phone-wk ×2** — the known WebKit crash in this container; each was resumed from the game's own save. A rescued leg is not a clean one. |



## The voyages, in full

```
== solo-desktop: FAIL
[5090s]    ✗ vision judge errored on 26 screen(s) — those screens are NOT cleared
[5090s]    ✗ 3 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/2  cinnamon dutch babya dra:0/2  start:1/1  sail square:17/17  attack #:2/3  trade:7/17  muse#:6/17  flip coin:4/4  menu:0/1  fresh milk:2/9  crystal sugar:2/7  speckled eggs:1/7  coins only:5/7  slider:7/7  offer it:7/7  dough hook:1/1  walk away:0/1  dock:2/2  nah:2/2  call crustbeard:1/1  call flaky jack:0/1  toasty wheat:2/4  cacao pods:1/4  hot cinnamon:1/4
[5090s] 
== solo-phone: FAIL
[5090s]    ✗ vision judge errored on 21 screen(s) — those screens are NOT cleared
[5090s]    ✗ 4 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:2/2  chocolate genoise sponge:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:20/22  dock:1/1  trade:7/15  muse#:7/15  flip coin:1/1  buy #:1/1  nah:0/1  call crustbeard:1/3  call flaky jack:0/1  menu:0/1  menu open:1/0  menu close:1/0  cacao pods:1/7  vanilla beans:1/7  crystal sugar:4/11  coins only:3/7  slider:7/7  offer it:7/7  call dough hook:2/2  speckled eggs:1/6  toasty wheat:2/5  hot cinnamon:1/3  fresh milk:1/2
[5090s] 
== solo-tablet: FAIL
[5090s]    ✗ vision judge FAILED 1 screen(s)
[5090s]    ✗ vision judge errored on 19 screen(s) — those screens are NOT cleared
[5090s]    ✗ 4 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:2/2  pound cakea dense rich b:2/2  vanilla bean crème brûlé:0/2  start:1/1  sail square:18/18  muse#:8/16  menu:0/1  menu open:1/0  menu close:1/0  trade:8/15  crystal sugar:1/8  cacao pods:1/8  coins only:8/8  slider:8/8  offer it:8/8  speckled eggs:1/7  call dough hook:1/3  call crustbeard:2/3  hot cinnamon:1/5  toasty wheat:2/4  fresh milk:1/3  vanilla beans:1/3
[5090s] 
== passplay-phone: FAIL
[5090s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5090s]    ✗ 4 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:1/1  cinnamon dutch babya dra:2/2  spiced fudge browniesdee:0/2  at the helm:33/33  mexican chocolate tortea:2/2  cinnamon snapscrisp rust:0/2  start:1/1  sail square:38/38  trade:15/33  muse#:15/33  hot cinnamon:3/14  coins only:6/12  slider:8/8  offer it:12/12  attack #:1/2  call peg leg meg:1/1  call dough hook:0/1  flip coin:3/3  menu:0/1  menu open:1/0  menu close:1/0  dock:2/2  buy #:1/2  nah:3/4  accept:1/1  counter:0/1  deny:0/1  speckled eggs:6/20  vanilla beans:3/13  dough hook:2/3  walk away:1/4  slider disabled:6/6  crystal sugar:3/8  cacao pods:3/5  toasty wheat:4/5  flaky jack:1/1
[5090s] 
== passplay-desktop: FAIL
[5090s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5090s]    ✗ 5 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:2/2  dark chocolate cream puf:2/4  chocolate genoise sponge:0/2  at the helm:39/39  spiced cocoa shortbreadb:2/2  start:1/1  sail square:48/48  muse#:15/38  menu:0/1  trade:16/33  toasty wheat:11/26  coins only:11/14  slider:13/13  offer it:14/14  dough hook:2/3  walk away:2/7  accept:4/10  counter:3/6  deny:3/13  davy scones:2/3  coin:2/3  ask it:3/3  dough hook#:1/1  attack #:4/4  call peg leg meg:2/2  call flaky jack:1/4  flip coin:8/8  slider disabled:6/6  nah:2/5  call dough hook:1/3  call davy scones:1/1  hot cinnamon:3/8  dock:3/3  buy #:3/3  vanilla beans:2/7  fresh milk:3/6  crystal sugar:2/4  flee:1/1  stand yer ground:0/1  speckled eggs:1/1
[5090s] 
== crew-desktop: FAIL
[5090s]    ✗ offered but never exercised: deny
[5090s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5090s]    ✗ 14 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:2/2  spiced fudge browniesdee:2/2  mayan cocoa souffléa soa:0/2  start:1/1  sail square:19/19  trade:9/18  muse#:8/19  speckled eggs:3/8  coins only:8/9  slider:8/8  offer it:9/9  flaky jack#:1/1  walk away:0/2  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  accept:1/1  counter:0/1  deny:0/1  test#:1/1  call dough hook:1/1  call flaky jack:0/2  toasty wheat:2/7  crystal sugar:1/7  attack #:1/1  flip coin:2/2  cacao pods:1/6  slider disabled:1/1  vanilla beans:1/5  call test#:1/1  fresh milk:2/3  dock:1/1  nah:1/1
[5090s] 
== crew-phone: FAIL
[5090s]    ✗ 2 structural check failure(s): not-occluded×1, sail-clickable×1 — first: clickable covered by something else: sailCell <- covered by #pp4Cap. <div>
[5090s]    ✗ offered but never exercised: walk away, deny
[5090s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5090s]    ✗ 13 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  mexican chocolate tortea:0/2  start:1/1  sail square:18/18  muse#:8/18  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:9/17  crystal sugar:1/8  coins only:4/9  slider:9/9  offer it:9/9  test#:1/1  walk away:0/3  flip coin:2/2  toasty wheat:3/12  slider disabled:1/1  cacao pods:1/6  speckled eggs:3/11  hot cinnamon:2/6  dough hook#:1/1  accept:1/2  counter:1/2  deny:0/3  attack #:1/1  vanilla beans:1/4  fresh milk:3/4  dough hook:1/1  coin:1/1  ask it:1/1
[5090s] 
== solo-desktop-wk: FAIL
[5090s]    ✗ vision judge errored on 22 screen(s) — those screens are NOT cleared
[5090s]    ✗ 7 screen(s) never stopped moving before being checked
[5090s]    ✱ 1 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5090s]    coverage: arrgh:2/2  cinnamon snapscrisp rust:2/2  molten chocolate lava ca:0/2  start:1/1  sail square:11/11  trade:5/11  muse#:5/11  crystal sugar:1/5  coins only:5/5  slider:5/5  offer it:5/5  call dough hook:1/2  call crustbeard:0/1  menu:0/1  call flaky jack:1/1  fresh milk:1/4  hot cinnamon:1/4  dock:1/1  flip coin:1/1  buy #:1/1  nah:0/1  accept:1/1  counter:0/1  deny:0/1  vanilla beans:0/2  speckled eggs:1/1  cacao pods:1/1
[5090s] 
== solo-phone-wk: FAIL
[5090s]    ✗ 2 structural check failure(s): no-cover-ask×2 — first: control covering the question it answers: "Call Dough Hook" over "Davy Scones — a battle's brewi"
[5090s]    ✗ 8 console error(s): ERR Failed to load resource: Unacceptable TLS certificate
[5090s]    ✗ vision judge errored on 28 screen(s) — those screens are NOT cleared
[5090s]    ✗ 6 screen(s) never stopped moving before being checked
[5090s]    ✱ 2 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5090s]    coverage: arrgh:2/2  cocoa cloud souffléan ai:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:37/37  muse#:14/30  menu:0/1  menu open:1/0  menu close:1/0  trade:14/29  fresh milk:3/18  coins only:5/14  slider:14/14  offer it:14/14  dough hook:3/5  walk away:2/6  crystal sugar:3/13  call crustbeard:2/3  call dough hook:1/3  attack #:2/2  flip coin:4/4  cacao pods:2/13  speckled eggs:6/18  flaky jack:1/1  call flaky jack:1/2  toasty wheat:3/9  vanilla beans:2/8  hot cinnamon:5/6
[5090s] 
== solo-tablet-wk: FAIL
[5090s]    ✗ 4 console error(s): ERR Failed to load resource: Unacceptable TLS certificate
[5090s]    ✗ vision judge errored on 25 screen(s) — those screens are NOT cleared
[5090s]    ✗ 3 screen(s) never stopped moving before being checked
[5090s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  dark chocolate cream puf:0/2  start:1/1  sail square:21/21  muse#:9/18  menu:0/1  menu open:1/0  menu close:1/0  trade:9/17  toasty wheat:2/10  cacao pods:2/9  coins only:4/9  slider:9/9  offer it:9/9  dough hook:2/2  walk away:1/4  fresh milk:5/15  flaky jack:1/2  call dough hook:1/1  call flaky jack:1/4  speckled eggs:2/5  crystal sugar:2/4  call crustbeard:2/3  hot cinnamon:1/2
[5090s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
