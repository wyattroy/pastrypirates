# Sea trial — build `2026.08.29.1`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-08-29T07:17:28.230Z  ·  96 min  ·  gear **FULL**  ·  sailed on **cloud container**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |
| **voyages that only finished after a BROWSER RESTART** | **solo-desktop-wk ×3, solo-tablet-wk ×4** — the known WebKit crash in this container; each was resumed from the game's own save. A rescued leg is not a clean one. |



## The voyages, in full

> ⚠ **TWO OF THE TEN LEGS WERE MISSING FROM THIS FILE AND ARE RESTORED BELOW, BY HAND.**
> `solo-desktop` and `solo-phone` both sailed and both FAILED. Their verdicts were in the run's
> own final summary (`sea-trial-shots/log.txt:2421` and `:2427`) and never reached this report,
> because the writer printed only the last 60 lines of the gate's output and the summary is
> longer than that — while the table above went on saying "voyages that did NOT run: none".
> Fixed in `scripts/sea_trial.mjs` (print from the final summary, and check the report's own
> output for a missing leg), and held by `scripts/qa/trial_honesty_check.mjs`. The two blocks
> below are copied verbatim from the log; everything after them is as the run wrote it.

```
== solo-desktop: FAIL
[5728s]    ✗ 1 dead control(s): slider drag
[5728s]    ✗ vision judge errored on 25 screen(s) — those screens are NOT cleared
[5728s]    ✗ 6 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:2/2  cinnamonsugar churroscri:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:28/28  muse#:11/24  menu:0/1  trade:12/23  vanilla beans:1/12  coins only:9/12  slider:11/12  offer it:12/12  toasty wheat:2/10  attack #:1/1  flip coin:2/2  fire again #:1/1  break off:0/1  cacao pods:4/11  fresh milk:2/9  speckled eggs:3/10  hot cinnamon:2/8  call crustbeard:1/2  call flaky jack:1/2  dough hook#:1/1  walk away:0/2  dough hook:1/1  crystal sugar:1/1
[5728s]

== solo-phone: FAIL
[5728s]    ✗ 3 dead control(s): slider drag, slider drag, slider drag
[5728s]    ✗ offered but never exercised: deny
[5728s]    ✗ vision judge errored on 25 screen(s) — those screens are NOT cleared
[5728s]    ✗ 7 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:2/2  chocolate fudge tortea p:2/2  cocoa cloud souffléan ai:0/2  start:1/1  sail square:23/23  attack #:4/4  trade:9/21  muse#:9/22  flip coin:4/4  menu:0/1  menu open:1/0  menu close:1/0  call flaky jack:1/2  call crustbeard:1/3  toasty wheat:2/10  crystal sugar:2/11  coins only:9/9  slider:7/10  offer it:9/9  fresh milk:2/10  hot cinnamon:1/7  vanilla beans:1/5  dough hook:1/1  walk away:0/1  accept:1/2  counter:1/2  deny:0/3  coin:1/1  ask it:1/1  speckled eggs:1/4  cacao pods:1/4  call dough hook:1/1
[5728s]
```

```
== solo-tablet: FAIL
[5728s]    ✗ offered but never exercised: vanilla beans
[5728s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5728s]    ✗ 8 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:2/2  crispy cocoa snapsthin h:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:19/19  trade:7/18  muse#:7/18  toasty wheat:3/9  coins only:5/7  slider:7/7  offer it:7/7  flaky jack:1/1  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  call crustbeard:1/2  call flaky jack:1/2  call dough hook:1/2  dough hook:1/2  speckled eggs:2/6  cacao pods:1/5  vanilla beans:0/5  crustbeard:1/1  crystal sugar:1/4  flip coin:5/5  dock:4/4  nah:2/4  hot cinnamon:1/2  fresh milk:1/1  buy #:2/2  accept:1/1  counter:0/1  deny:0/1
[5728s] 
== passplay-phone: FAIL
[5728s]    ✗ 1 dead control(s): slider drag
[5728s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5728s]    ✗ 13 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/2  mexican chocolate tortea:0/2  at the helm:40/40  chocolate genoise sponge:2/2  chocolate fudge tortea p:0/2  start:1/1  sail square:45/45  muse#:13/40  menu:0/1  menu open:1/0  menu close:1/0  trade:13/38  fresh milk:4/22  hot cinnamon:4/19  coins only:3/12  slider:14/15  offer it:12/12  dough hook:3/5  walk away:2/9  attack #:6/7  call davy scones:2/3  call flaky jack:0/2  flip coin:15/15  accept:3/7  counter:2/7  deny:2/9  peg leg meg:1/1  flaky jack:2/3  dock:8/8  buy #:4/7  nah:5/9  vanilla beans:3/12  speckled eggs:4/13  call peg leg meg:2/2  toasty wheat:4/14  speckled eggs #:4/4  coin:2/2  ask it:2/2  call dough hook:1/3  crystal sugar:3/4  davy scones:1/1
[5728s] 
== passplay-desktop: FAIL
[5728s]    ✗ 12 dead control(s): slider drag, slider drag, slider drag, slider drag, slider drag
[5728s]    ✗ vision judge errored on 24 screen(s) — those screens are NOT cleared
[5728s]    ✗ 2 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:1/1  french pots de crèmeluxu:2/2  chocolate fudge tortea p:0/2  at the helm:28/28  snickerdoodle bitespillo:2/2  chocolate genoise sponge:0/2  start:1/1  sail square:42/42  muse#:14/28  trade:14/27  hot cinnamon:4/14  coins only:14/14  slider:2/14  offer it:14/14  dough hook:1/1  walk away:0/2  menu:0/1  accept:1/1  counter:0/1  deny:0/1  davy scones:1/1  call flaky jack:1/1  call peg leg meg:0/1  flip coin:1/1  crystal sugar:3/10  cacao pods:2/7  vanilla beans:2/7  speckled eggs:2/3  fresh milk:1/1
[5728s] 
== crew-desktop: FAIL
[5728s]    ✗ offered but never exercised: vanilla beans
[5728s]    ✗ 1 dead control(s): slider drag
[5728s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5728s]    ✗ 11 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:1/1  spiced fudge browniesdee:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:15/15  trade:5/13  muse#:5/13  speckled eggs:2/7  coins only:2/5  slider:5/5  offer it:5/5  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  dock:2/2  flip coin:6/6  buy #:1/1  nah:1/2  attack #:1/1  flee:1/1  stand yer ground:0/1  toasty wheat:3/7  fresh milk:2/7  crystal sugar:1/4  test#:1/1  walk away:0/1  vanilla beans:0/3  cacao pods:1/1  hot cinnamon:0/1  accept:1/1  counter:0/1  deny:0/1
[5728s] 
== crew-phone: FAIL
[5728s]    ✗ 2 structural check failure(s)
[5728s]    ✗ offered but never exercised: deny
[5728s]    ✗ offered but never exercised: deny
[5728s]    ✗ 1 moment(s) where the two captains saw different games: captains (host: test1:1,Dough:6,Flaky:6,test2:2   guest: test2:2,test1:1,Dough:7,Flaky:6)
[5728s]    ✗ vision judge FAILED 1 screen(s)
[5728s]    ✗ vision judge errored on 29 screen(s) — those screens are NOT cleared
[5728s]    ✗ 13 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:2/2  mexican chocolate potssi:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:17/17  muse#:7/17  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:7/16  toasty wheat:2/10  speckled eggs:1/7  coins only:2/7  slider:8/8  offer it:7/7  test#:1/1  walk away:1/3  dock:3/3  flip coin:3/3  nah:1/3  buy #:2/2  fresh milk:3/9  crystal sugar:2/8  vanilla beans:2/7  accept:1/2  counter:1/2  deny:0/3  dough hook:1/2  cacao pods:1/1  hot cinnamon:1/2  coin:1/1  ask it:1/1
[5728s] 
== solo-desktop-wk: FAIL
[5728s]    ✗ 3 WebKit relaunch(es) over ? day(s) — above the 2 this voyage's length allows; that is a crash loop being ridden out, not a voyage
[5728s]    ✗ vision judge errored on 20 screen(s) — those screens are NOT cleared
[5728s]    ✗ 6 screen(s) never stopped moving before being checked
[5728s]    ✱ 3 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5728s]    coverage: arrgh:2/2  mexican chocolate potssi:2/2  chocolate genoise sponge:0/2  start:1/1  sail square:22/22  trade:11/21  muse#:10/21  toasty wheat:2/11  coins only:4/11  slider:11/11  offer it:11/11  menu:0/1  cacao pods:5/14  hot cinnamon:2/9  crustbeard#:1/1  walk away:0/2  vanilla beans:1/8  fresh milk:2/5  call crustbeard:1/1  call flaky jack:0/1  crystal sugar:2/5  speckled eggs:4/7  flaky jack:1/1
[5728s] 
== solo-phone-wk: FAIL
[5728s]    ✗ 3 structural check failure(s)
[5728s]    ✗ 2 dead control(s): slider drag, slider drag
[5728s]    ✗ offered but never exercised: hot cinnamon, vanilla beans
[5728s]    ✗ vision judge FAILED 1 screen(s)
[5728s]    ✗ vision judge errored on 25 screen(s) — those screens are NOT cleared
[5728s]    ✗ 7 screen(s) never stopped moving before being checked
[5728s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  cinnamonchocolate fudgea:0/2  start:1/1  call crustbeard:1/2  call flaky jack:0/1  sail square:15/15  trade:5/11  muse#:4/13  toasty wheat:1/5  fresh milk:1/5  coins only:5/5  slider:3/5  offer it:5/5  dough hook:1/1  walk away:0/1  menu:0/1  menu open:1/0  menu close:1/0  attack #:2/2  flip coin:4/4  dock:2/3  nah:2/2  call dough hook:1/1  crystal sugar:1/4  speckled eggs:1/4  hot cinnamon:0/4  vanilla beans:0/4  cacao pods:1/2
[5728s] 
== solo-tablet-wk: FAIL
[5728s]    ✗ 4 WebKit relaunch(es) over ? day(s) — above the 2 this voyage's length allows; that is a crash loop being ridden out, not a voyage
[5728s]    ✗ 6 console error(s): ERR Failed to load resource: Unacceptable TLS certificate
[5728s]    ✗ vision judge errored on 30 screen(s) — those screens are NOT cleared
[5728s]    ✗ 12 screen(s) never stopped moving before being checked
[5728s]    ✱ 4 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5728s]    coverage: arrgh:2/2  pound cakea dense rich b:2/2  chocolate fudge tortea p:0/2  start:1/1  sail square:26/26  attack #:3/4  trade:8/19  muse#:8/19  flip coin:5/5  menu:0/1  menu open:1/0  menu close:1/0  call dough hook:1/1  call crustbeard:0/1  toasty wheat:3/15  crystal sugar:3/13  coins only:2/8  slider:8/8  offer it:8/8  flaky jack:1/1  walk away:1/4  dough hook:1/1  cacao pods:1/5  fresh milk:3/7  speckled eggs:3/7  hot cinnamon:1/3  crustbeard:1/2  vanilla beans:1/2
[5728s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
