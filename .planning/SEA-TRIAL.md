# Sea trial — build `2026.08.28.4`

**FAILED** — 8 of 8 voyage(s) sailed  ·  2026-08-28T12:11:36.006Z  ·  62 min  ·  gear **FULL**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
[3235s]   [solo-phone-wk] DAY 1
[3262s]   [solo-phone-wk] note: still moving at the cap (2671ms) — checked anyway
[3269s]   [solo-phone-wk] note: still moving at the cap (2699ms) — checked anyway
[3290s]   [solo-phone-wk] DAY 2
[3310s]   [solo-phone-wk] DAY 3
[3327s] [solo-desktop-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[3354s]   [solo-phone-wk] DAY 4
[3389s]   [solo-phone-wk] DAY 5
[3437s]   [solo-phone-wk] DAY 6
[3478s]   [solo-phone-wk] DAY 7
[3498s] [solo-phone-wk] ERROR: sig() could not read the page: page.evaluate: Target crashed 
[3498s] [solo-phone-wk] vision-judging 12 screen(s)…
[3504s] [crew-phone] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[3586s]   [judge FAIL] solo-phone-wk-012-settled.png: 'Walk away' circle overlaps the 'Crustbeard +6' offer circle, clipping the first letter of 'Crustbeard' text
[3706s] [solo-phone-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[3706s] 
== solo-desktop: FAIL
[3706s]    ✗ vision judge FAILED 3 screen(s)
[3706s]    ✗ 6 screen(s) never stopped moving before being checked
[3706s]    coverage: arrgh:2/2  spiced fudge browniesdee:2/2  caramel slicea toastedco:0/2  start:1/1  sail square:19/19  trade:9/19  muse#:8/19  crystal sugar:2/9  coins only:3/9  slider:9/9  offer it:9/9  menu:0/1  call crustbeard:2/3  call flaky jack:0/1  toasty wheat:3/15  speckled eggs:2/9  dough hook:1/2  walk away:1/2  hot cinnamon:1/8  cacao pods:3/12  attack #:2/2  flip coin:2/2  fresh milk:2/5  vanilla beans:3/7  call dough hook:1/2
[3706s] 
== solo-phone: FAIL
[3706s]    ✗ offered but never exercised: vanilla beans
[3706s]    ✗ 7 screen(s) never stopped moving before being checked
[3706s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  cinnamon sponge cakea fl:0/2  start:1/1  sail square:11/11  muse#:4/9  call flaky jack:1/1  call crustbeard:1/2  menu:0/1  menu open:1/0  menu close:1/0  dock:1/1  attack #:0/1  trade:4/8  flip coin:1/1  buy #:1/1  nah:0/1  toasty wheat:1/4  crystal sugar:1/4  speckled eggs:1/4  vanilla beans:0/4  fresh milk:1/4  coins only:3/4  slider:4/4  offer it:4/4  accept:1/1  counter:0/1  deny:0/1  cacao pods:1/2  call dough hook:0/1
[3706s] 
== passplay-phone: FAIL
[3706s]    ✗ vision judge FAILED 1 screen(s)
[3706s]    ✗ 3 screen(s) never stopped moving before being checked
[3706s]    coverage: arrgh:1/1  mayan cocoa souffléa soa:2/2  crispy cocoa snapsthin h:0/2  at the helm:33/33  chocolate fudge tortea p:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:37/37  muse#:15/32  trade:15/31  speckled eggs:2/15  coins only:12/15  slider:15/15  offer it:15/15  dough hook:1/2  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  accept:1/1  counter:0/1  deny:0/1  peg leg meg:1/1  call flaky jack:1/2  call davy scones:1/2  flip coin:3/3  dock:1/1  nah:1/1  fresh milk:3/13  toasty wheat:4/15  vanilla beans:2/9  flaky jack:1/1  crystal sugar:3/11  attack #:1/1  hot cinnamon:2/6  cacao pods:2/2
[3706s] 
== passplay-desktop: FAIL
[3706s]    ✗ vision judge FAILED 3 screen(s)
[3706s]    ✗ 6 screen(s) never stopped moving before being checked
[3706s]    coverage: arrgh:1/1  mexican chocolate potssi:2/2  cinnamonsugar churroscri:0/2  at the helm:30/30  mayan cocoa souffléa soa:2/2  caramel slicea toastedco:0/2  start:1/1  sail square:37/37  muse#:14/30  dock:2/2  flip coin:3/3  buy #:1/2  nah:1/2  menu:0/1  trade:14/28  toasty wheat:3/14  fresh milk:3/14  hot cinnamon:2/14  coins only:6/14  slider:11/11  offer it:14/14  dough hook:2/4  walk away:2/4  call flaky jack:1/3  call peg leg meg:0/1  cacao pods:7/20  speckled eggs:2/10  vanilla beans:2/6  crystal sugar:3/5  call dough hook:2/2
[3706s] 
== crew-desktop: FAIL
[3706s]    ✗ vision judge FAILED 6 screen(s)
[3706s]    ✗ 12 screen(s) never stopped moving before being checked
[3706s]    coverage: arrgh:2/2  chocolate genoise sponge:2/2  vanilla bean crème brûlé:0/2  start:1/1  sail square:19/19  muse#:7/15  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:8/13  fresh milk:5/12  coins only:4/8  slider:9/9  offer it:8/8  dough hook:2/3  walk away:1/4  accept:1/3  counter:1/3  deny:1/4  crystal sugar:3/9  flaky jack:1/1  coin:1/1  ask it:1/1  call dough hook:1/1  call flaky jack:0/1  speckled eggs:1/3  vanilla beans:2/3  hot cinnamon:1/1
[3706s] 
== crew-phone: FAIL
[3706s]    ✗ 3 structural check failure(s)
[3706s]    ✗ 17 screen(s) never stopped moving before being checked
[3706s]    coverage: arrgh:2/2  spiced fudge browniesdee:2/2  crispy cocoa snapsthin h:0/2  start:1/1  sail square:28/28  muse#:12/27  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:13/26  fresh milk:5/18  crystal sugar:4/18  coins only:5/13  slider:14/14  offer it:13/13  test#:2/3  walk away:1/5  accept:2/4  counter:1/4  deny:1/5  coin:1/1  ask it:1/1  speckled eggs:3/9  toasty wheat:5/14  call dough hook:1/2  call flaky jack:1/3  flaky jack:2/3  vanilla beans:3/5  dock:2/2  flip coin:2/2  nah:1/2  buy #:1/1  call test#:1/1  hot cinnamon:1/1
[3706s] 
== solo-desktop-wk: FAIL (voyage incomplete)
[3706s]    ✗ did not finish the voyage
[3706s]    ✗ 5 screen(s) never stopped moving before being checked
[3706s]    ✗ leg error: sig() could not read the page: page.evaluate: Target crashed 
[3706s]    coverage: arrgh:1/1  snickerdoodle bitespillo:2/2  pound cakea dense rich b:0/2  start:1/1  call crustbeard:1/2  call flaky jack:1/2  sail square:5/5  trade:2/4  muse#:2/4  toasty wheat:1/2  crystal sugar:1/2  coins only:2/2  slider:2/2  offer it:2/2  menu:0/1  call dough hook:1/2
[3706s] 
== solo-phone-wk: FAIL (voyage incomplete)
[3706s]    ✗ did not finish the voyage
[3706s]    ✗ vision judge FAILED 1 screen(s)
[3706s]    ✗ 2 screen(s) never stopped moving before being checked
[3706s]    ✗ leg error: sig() could not read the page: page.evaluate: Target crashed 
[3706s]    coverage: arrgh:1/1  french pots de crèmeluxu:2/2  chocolate genoise sponge:0/2  start:1/1  sail square:7/7  trade:3/6  muse#:3/6  fresh milk:1/3  cacao pods:1/3  coins only:3/3  slider:3/3  offer it:3/3  menu:0/1  menu open:1/0  menu close:1/0  hot cinnamon:0/2  crystal sugar:1/1  speckled eggs:0/1  vanilla beans:0/1  crustbeard#:1/1  walk away:0/1
[3706s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
