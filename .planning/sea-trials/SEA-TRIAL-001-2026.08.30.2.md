# Sea trial — build `2026.08.30.2`

> ⚠ **THIS REPORT DESCRIBES A BUILD THAT NO LONGER EXISTS.** `2026.08.30.2` carried the bubble
> tail-avoidance change, which was REVERTED the same night when three full trials read
> 22 → 26 → 31 structural failures on the same ten legs. The served build is `2026.08.30.1`, whose
> game code is byte-identical to the sailed `2026.08.29.2`. Do not read the verdict below as
> describing what a player has. (Flagged by CEO Review 28; rule 24 stands on opening this file.)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-08-30T02:04:20.568Z  ·  85 min  ·  gear **FULL**  ·  sailed on **cloud container**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |
| **voyages that only finished after a BROWSER RESTART** | **solo-desktop-wk ×2, solo-phone-wk ×2, solo-tablet-wk ×1** — the known WebKit crash in this container; each was resumed from the game's own save. A rescued leg is not a clean one. |



## The voyages, in full

```
== solo-desktop: FAIL
[5060s]    ✗ vision judge errored on 24 screen(s) — those screens are NOT cleared
[5060s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[5060s]    ✗ 4 screen(s) never stopped moving before being checked
[5060s]    coverage: arrgh:2/2  cinnamonsugar churroscri:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:20/20  trade:8/17  muse#:8/17  speckled eggs:1/8  coins only:4/8  slider:8/8  offer it:8/8  menu:0/1  fresh milk:2/7  vanilla beans:1/7  call crustbeard:1/3  call dough hook:0/1  call flaky jack:2/2  cacao pods:2/6  hot cinnamon:1/5  dough hook:1/1  walk away:0/2  toasty wheat:4/7  crustbeard:1/1  crystal sugar:1/2  attack #:1/1  flip coin:1/1
[5060s] 
== solo-phone: FAIL
[5060s]    ✗ vision judge FAILED 1 screen(s)
[5060s]    ✗ vision judge errored on 26 screen(s) — those screens are NOT cleared
[5060s]    ✗ 6 screen(s) never stopped moving before being checked
[5060s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:14/14  trade:6/14  muse#:6/14  cacao pods:1/6  coins only:3/6  slider:6/6  offer it:6/6  menu:0/1  menu open:1/0  menu close:1/0  attack #:1/1  flip coin:3/3  fire again #:1/2  break off:1/2  toasty wheat:2/5  hot cinnamon:1/5  call dough hook:1/1  call crustbeard:0/1  vanilla beans:2/5  dock:1/1  buy #:1/1  nah:0/1  fresh milk:1/3  speckled eggs:2/3  crustbeard:1/1  walk away:0/1
[5060s] 
== solo-tablet: FAIL
[5060s]    ✗ vision judge errored on 26 screen(s) — those screens are NOT cleared
[5060s]    ✗ 8 screen(s) never stopped moving before being checked
[5060s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/2  crispy cocoa snapsthin h:0/2  start:1/1  call dough hook:1/2  call flaky jack:0/2  sail square:23/23  trade:11/23  muse#:11/23  speckled eggs:2/12  coins only:6/11  slider:11/11  offer it:11/11  menu:0/1  menu open:1/0  menu close:1/0  call crustbeard:2/2  crystal sugar:7/18  flaky jack#:1/1  walk away:0/2  accept:1/1  counter:0/1  deny:0/1  flaky jack:1/1  toasty wheat:2/7  fresh milk:2/7  cacao pods:1/5  vanilla beans:1/5  hot cinnamon:1/4  attack #:1/1  flip coin:1/1
[5060s] 
== passplay-phone: FAIL
[5060s]    ✗ offered but never exercised: deny
[5060s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5060s]    ✗ 7 screen(s) never stopped moving before being checked
[5060s]    coverage: arrgh:2/2  cinnamonsugar churroscri:2/2  cinnamon snapscrisp rust:0/2  at the helm:26/26  chocolate fudge tortea p:2/2  crispy cocoa snapsthin h:0/2  start:1/1  sail square:32/32  muse#:12/26  menu:0/1  menu open:1/0  menu close:1/0  trade:13/24  fresh milk:5/18  vanilla beans:4/17  coins only:3/7  slider:7/7  offer it:7/7  dough hook:2/3  walk away:1/6  flaky jack#:1/1  slider disabled:7/7  accept:1/2  counter:1/2  deny:0/3  davy scones:1/1  nah:6/7  speckled eggs:2/9  dock:1/1  flip coin:1/1  buy #:1/1  coin:1/1  ask it:1/1  cacao pods:2/6  toasty wheat:3/6  crystal sugar:3/6  flaky jack:1/1  hot cinnamon:4/7
[5060s] 
== passplay-desktop: FAIL
[5060s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5060s]    ✗ 5 screen(s) never stopped moving before being checked
[5060s]    coverage: arrgh:2/2  spiced cocoa shortbreadb:2/2  snickerdoodle bitespillo:0/2  at the helm:32/32  mayan cocoa souffléa soa:2/2  cinnamonchocolate fudgea:0/2  start:1/1  sail square:35/35  dock:2/3  muse#:15/32  flip coin:2/2  buy #:1/2  nah:7/8  trade:15/30  hot cinnamon:9/21  coins only:5/9  slider:7/7  offer it:9/9  accept:2/4  counter:1/3  deny:1/5  peg leg meg:1/1  walk away:1/4  menu:0/1  toasty wheat:6/21  vanilla beans:2/13  dough hook:1/2  coin:0/1  ask it:1/1  slider disabled:9/9  speckled eggs:3/9  davy scones:1/1  crystal sugar:2/6  cacao pods:2/5  fresh milk:2/2
[5060s] 
== crew-desktop: FAIL
[5060s]    ✗ offered but never exercised: deny
[5060s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5060s]    ✗ 9 screen(s) never stopped moving before being checked
[5060s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  mexican chocolate tortea:0/2  start:1/1  sail square:16/16  muse#:6/12  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:6/11  toasty wheat:2/6  cacao pods:1/6  coins only:3/6  slider:6/6  offer it:6/6  test#:1/1  walk away:0/2  fresh milk:3/7  vanilla beans:1/4  flaky jack:1/1  crystal sugar:1/1  hot cinnamon:1/1
[5060s] 
== crew-phone: FAIL
[5060s]    ✗ 4 structural check failure(s): on-screen×1, not-occluded×1, sail-clickable×1, no-cover-ask×1 — first: clickable off-screen: sailCell
[5060s]    ✗ offered but never exercised: deny
[5060s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5060s]    ✗ 22 screen(s) never stopped moving before being checked
[5060s]    coverage: arrgh:2/2  cinnamonsugar churroscri:2/2  caramel slicea toastedco:0/2  start:1/1  sail square:19/19  muse#:7/18  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:8/16  fresh milk:2/8  crystal sugar:1/7  coins only:5/8  slider:6/6  offer it:8/8  test#:1/1  walk away:0/2  call dough hook:1/1  call flaky jack:0/1  attack #:1/1  flip coin:3/3  speckled eggs:1/6  cacao pods:1/6  vanilla beans:1/6  slider disabled:2/2  toasty wheat:2/4  hot cinnamon:3/5  dock:2/2  buy #:1/2  nah:1/2  accept:1/1  counter:0/1  deny:0/1  dough hook:1/1
[5060s] 
== solo-desktop-wk: FAIL
[5060s]    ✗ offered but never exercised: walk away
[5060s]    ✗ vision judge errored on 21 screen(s) — those screens are NOT cleared
[5060s]    ✗ 6 screen(s) never stopped moving before being checked
[5060s]    ✱ 2 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5060s]    coverage: arrgh:2/2  cinnamonsugar churroscri:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:15/15  muse#:7/14  call flaky jack:1/1  call crustbeard:0/1  menu:0/1  trade:7/13  crystal sugar:2/8  speckled eggs:3/10  coins only:2/7  slider:7/7  offer it:7/7  dough hook:1/1  walk away:0/3  flaky jack:1/1  fresh milk:1/5  cacao pods:1/4  vanilla beans:1/4  hot cinnamon:3/5  flaky jack#:1/1  toasty wheat:1/1
[5060s] 
== solo-phone-wk: FAIL
[5060s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell sailSwept" over "Davy Scones: tap to sail — blu", "sailCel
[5060s]    ✗ vision judge errored on 29 screen(s) — those screens are NOT cleared
[5060s]    ✗ 9 screen(s) never stopped moving before being checked
[5060s]    ✱ 2 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5060s]    coverage: arrgh:2/2  cocoa cloud souffléan ai:2/2  crispy cocoa snapsthin h:0/2  start:1/1  sail square:39/40  muse#:8/18  menu:0/1  menu open:1/0  menu close:1/0  attack #:1/1  trade:8/17  flip coin:2/2  dock:1/1  buy #:1/1  nah:0/1  toasty wheat:3/12  fresh milk:2/8  speckled eggs:1/8  vanilla beans:1/8  toasty wheat #:2/4  coins only:2/8  slider:8/8  offer it:8/8  call crustbeard:1/2  call dough hook:0/1  cacao pods:1/5  hot cinnamon:2/6  dough hook:1/2  walk away:1/4  call flaky jack:1/1  crystal sugar:2/5  crustbeard:1/1  flaky jack:1/1
[5060s] 
== solo-tablet-wk: FAIL
[5060s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5060s]    ✗ 18 screen(s) never stopped moving before being checked
[5060s]    ✱ 1 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5060s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  caramel slicea toastedco:0/2  start:1/1  sail square:32/32  muse#:9/20  menu:0/1  menu open:1/0  menu close:1/0  trade:10/18  speckled eggs:3/14  coins only:3/8  slider:8/8  offer it:8/8  flaky jack#:1/1  walk away:1/4  hot cinnamon:2/9  slider disabled:2/2  nah:2/2  fresh milk:2/7  cacao pods:3/10  call dough hook:1/2  call flaky jack:1/2  crystal sugar:3/12  dough hook:1/2  toasty wheat:2/5  attack #:1/1  flip coin:1/1  vanilla beans:3/9  call crustbeard:1/2  flaky jack:1/1  accept:1/1  counter:0/1  deny:0/1
[5060s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
