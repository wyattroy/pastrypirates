# Sea trial — build `2026.08.28.4`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-08-28T18:44:08.878Z  ·  91 min  ·  gear **FULL**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
[5191s] [solo-tablet-wk] vision-judging 29 screen(s)…
[5215s]   [judge FAIL] solo-tablet-wk-001-settled.png: bottom recipe panel (Davy Scones/Crustbeard/Dough Hook/Flaky Jack) is nearly full-width but each row's content (name, coin icon, dash) only fills the left ~15%, leaving large empty dead space across the rest of every row
[5334s]   [judge FAIL] solo-tablet-wk-eov.png: a white card/panel is visible peeking out from behind the main End of Voyage card in the bottom-left, partially clipped and overlapping
[5464s] [solo-tablet-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[5464s] 
== solo-desktop: FAIL
[5464s]    ✗ vision judge FAILED 2 screen(s)
[5464s]    ✗ 3 screen(s) never stopped moving before being checked
[5464s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  cocoa cloud souffléan ai:0/2  start:1/1  sail square:19/19  muse#:8/17  menu:0/1  trade:9/16  toasty wheat:5/17  speckled eggs:1/8  coins only:5/9  slider:9/9  offer it:9/9  dough hook:1/2  walk away:1/2  call dough hook:1/1  call crustbeard:0/2  fresh milk:2/7  call flaky jack:1/1  crystal sugar:1/4  cacao pods:1/3  hot cinnamon:2/4  vanilla beans:1/4
[5464s] 
== solo-phone: FAIL
[5464s]    ✗ vision judge FAILED 1 screen(s)
[5464s]    ✗ 9 screen(s) never stopped moving before being checked
[5464s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  spiced cocoa shortbreadb:0/2  start:1/1  sail square:18/19  trade:8/18  muse#:8/18  cacao pods:2/9  hot cinnamon:1/8  coins only:4/8  slider:8/8  offer it:8/8  menu:0/1  menu open:1/0  menu close:1/0  call dough hook:1/2  call crustbeard:2/3  vanilla beans:5/14  dough hook:1/2  walk away:1/3  call flaky jack:0/1  attack #:1/1  flip coin:2/2  crystal sugar:3/8  vanilla beans #:1/1  flaky jack:1/1  fresh milk:2/4  dock:1/1  # crates:1/1  nah:0/1  toasty wheat:1/1
[5464s] 
== solo-tablet: FAIL
[5464s]    ✗ vision judge FAILED 2 screen(s)
[5464s]    ✗ 9 screen(s) never stopped moving before being checked
[5464s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:26/26  trade:10/21  muse#:10/21  hot cinnamon:4/12  coins only:3/9  slider:9/9  offer it:10/10  menu:0/1  menu open:1/0  menu close:1/0  crystal sugar:2/10  dough hook:2/3  walk away:1/5  call flaky jack:1/1  call crustbeard:1/2  toasty wheat:2/8  flip coin:2/2  speckled eggs:3/9  dough hook#:1/1  call dough hook:0/1  flaky jack#:1/1  cacao pods:1/4  fresh milk:4/5  attack #:1/1  vanilla beans:1/1
[5464s] 
== passplay-phone: FAIL
[5464s]    ✗ 5 screen(s) never stopped moving before being checked
[5464s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/2  spiced cocoa shortbreadb:0/2  at the helm:32/32  snickerdoodle bitespillo:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:43/43  muse#:16/32  menu:0/1  menu open:1/0  menu close:1/0  trade:16/29  cacao pods:5/18  coins only:6/7  slider:7/7  offer it:16/16  flaky jack:1/2  walk away:1/7  call dough hook:1/1  call davy scones:0/1  flip coin:1/1  flee:1/1  stand yer ground:0/1  accept:2/4  counter:1/4  deny:1/5  davy scones:1/1  coin:1/1  ask it:1/1  flaky jack#:2/2  speckled eggs:4/14  dough hook:2/2  toasty wheat:3/9  vanilla beans:6/13  hot cinnamon:3/7  crystal sugar:5/6
[5464s] 
== passplay-desktop: FAIL
[5464s]    ✗ vision judge FAILED 2 screen(s)
[5464s]    ✗ 6 screen(s) never stopped moving before being checked
[5464s]    coverage: arrgh:2/2  cinnamonsugar churroscri:2/2  dark chocolate cream puf:0/2  at the helm:23/23  spiced cocoa shortbreadb:2/2  pound cakea dense rich b:0/2  start:1/1  sail square:26/26  trade:11/22  muse#:11/22  hot cinnamon:2/8  coins only:5/6  slider:6/6  offer it:11/11  menu:0/1  fresh milk:5/11  dough hook:2/3  walk away:1/4  toasty wheat:5/12  flaky jack:1/1  speckled eggs:4/8  vanilla beans:1/2  accept:1/1  counter:0/1  deny:0/1
[5464s] 
== crew-desktop: FAIL
[5464s]    ✗ offered but never exercised: walk away
[5464s]    ✗ vision judge FAILED 7 screen(s)
[5464s]    ✗ 11 screen(s) never stopped moving before being checked
[5464s]    coverage: arrgh:2/2  spiced cocoa shortbreadb:2/2  mayan cocoa souffléa soa:0/2  start:1/1  sail square:16/16  muse#:7/16  call flaky jack:1/2  call test#:1/2  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:7/15  fresh milk:2/7  coins only:4/7  slider:7/7  offer it:7/7  attack #:2/2  flip coin:4/4  crystal sugar:1/5  cacao pods:3/7  test#:1/1  walk away:0/3  hot cinnamon:1/2  speckled eggs:2/2  flaky jack#:1/1  vanilla beans:1/1  dough hook:1/1  accept:1/1  deny:0/1
[5464s] 
== crew-phone: FAIL
[5464s]    ✗ offered but never exercised: walk away, deny
[5464s]    ✗ vision judge FAILED 2 screen(s)
[5464s]    ✗ 20 screen(s) never stopped moving before being checked
[5464s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  crispy cocoa snapsthin h:0/2  start:1/1  sail square:19/19  attack #:1/1  trade:9/19  muse#:9/19  flip coin:1/1  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  toasty wheat:2/10  coins only:6/9  slider:10/10  offer it:9/9  hot cinnamon:2/9  vanilla beans:2/9  call dough hook:1/1  call flaky jack:0/1  crystal sugar:3/7  cacao pods:2/5  flaky jack:1/1  walk away:0/3  accept:1/2  counter:1/2  deny:0/3  dough hook#:1/1  fresh milk:1/1  vanilla beans #:1/1  coin:0/1  ask it:1/1  test#:1/1
[5464s] 
== solo-desktop-wk: FAIL
[5464s]    ✗ vision judge FAILED 2 screen(s)
[5464s]    ✗ 6 screen(s) never stopped moving before being checked
[5464s]    ✱ 11 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5464s]    coverage: arrgh:2/2  caramel slicea toastedco:2/2  cinnamon sponge cakea fl:0/2  start:1/1  sail square:33/33  muse#:8/18  menu:0/1  trade:9/17  vanilla beans:1/9  coins only:7/9  slider:9/9  offer it:9/9  fresh milk:2/11  toasty wheat:2/6  crystal sugar:2/8  call crustbeard:1/2  call dough hook:0/1  hot cinnamon:1/6  call flaky jack:1/1  speckled eggs:1/5  crustbeard:2/2  walk away:0/2  accept:1/1  counter:0/1  deny:0/1  cacao pods:3/5  dough hook:1/2  attack #:1/1  flip coin:1/1
[5464s] 
== solo-phone-wk: FAIL
[5464s]    ✗ vision judge FAILED 4 screen(s)
[5464s]    ✗ 8 screen(s) never stopped moving before being checked
[5464s]    ✱ 2 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5464s]    coverage: arrgh:2/2  cinnamon sponge cakea fl:2/2  molten chocolate lava ca:0/2  start:1/1  sail square:19/19  muse#:8/17  menu:0/1  menu open:1/0  menu close:1/0  trade:9/16  crystal sugar:2/9  coins only:6/9  slider:9/9  offer it:9/9  speckled eggs:1/8  call crustbeard:2/2  call dough hook:0/2  call flaky jack:1/2  fresh milk:3/8  dough hook:1/2  walk away:1/4  cacao pods:1/5  hot cinnamon:1/5  accept:1/1  counter:0/1  deny:0/1  toasty wheat:2/4  crustbeard:1/1  vanilla beans:2/2  dough hook#:1/1
[5464s] 
== solo-tablet-wk: FAIL
[5464s]    ✗ vision judge FAILED 2 screen(s)
[5464s]    ✗ 11 screen(s) never stopped moving before being checked
[5464s]    ✱ 1 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5464s]    coverage: arrgh:2/2  pound cakea dense rich b:2/2  mayan cocoa souffléa soa:0/2  start:1/1  sail square:15/15  muse#:4/12  menu:0/1  menu open:1/0  menu close:1/0  attack #:2/3  trade:5/10  flip coin:4/4  toasty wheat:2/5  fresh milk:2/7  vanilla beans:1/5  speckled eggs:1/5  coins only:3/5  slider:4/4  offer it:5/5  crustbeard:1/2  walk away:1/3  call crustbeard:1/1  call dough hook:0/1  dough hook:1/1  cacao pods:1/2  accept:1/1  counter:0/1  deny:0/1  fire again #:1/2  break off:1/2  dock:1/1  nah:1/1
[5464s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
