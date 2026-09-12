# Sea trial — build `2026.08.28.4`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-08-28T19:42:58.985Z  ·  119 min  ·  gear **FULL**  ·  sailed on **local Mac (Wyatts-MacBook-Air.local)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
[6753s]   [judge FAIL] solo-tablet-wk-001-settled.png: recipe scoreboard panel at bottom: each row (Davy Scones/Crustbeard/Dough Hook/Flaky Jack) has only a name, coin icon, and dash on the far left, leaving roughly 80% of the row's width as large empty dead space
[6808s]   [judge FAIL] solo-tablet-wk-009-settled.png: teal sailboat at bottom of board is clipped by the bottom sheet panel; island with face/hazard icon at bottom is half-hidden behind the bottom sheet panel
[6890s]   [judge FAIL] solo-tablet-wk-020-settled.png: ship's pink sail overlaps/clips the 'Flaky Jack' name label on the trade circle
[6960s]   [judge FAIL] solo-tablet-wk-025-settled.png: dark rounded UI element clipped by the left screen edge near the top ribbon, floating detached with nothing visibly attached to it; the ship at the center is sandwiched and hidden between the two stacked 'Call Flaky Jack' / 'Call Crustbeard' bubbles, hull clipped in the middle
[7127s] [solo-tablet-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[7127s] 
== solo-desktop: FAIL
[7127s]    ✗ 10 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  chocolate fudge tortea p:2/2  mayan cocoa souffléa soa:0/2  start:1/1  sail square:17/17  muse#:8/18  call flaky jack:1/1  call crustbeard:0/1  menu:0/1  trade:8/16  crystal sugar:1/7  vanilla beans:1/7  coins only:4/7  slider:7/7  offer it:7/7  attack #:2/2  flip coin:2/2  fresh milk:1/5  speckled eggs:1/5  cacao pods:2/6  toasty wheat:3/6  dough hook:1/1  walk away:0/2  hot cinnamon:1/2  flaky jack:1/1
[7127s] 
== solo-phone: FAIL
[7127s]    ✗ vision judge FAILED 4 screen(s)
[7127s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[7127s]    ✗ 5 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  pound cakea dense rich b:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:16/16  dock:1/1  muse#:7/15  flip coin:3/3  buy #:1/1  nah:0/1  flee:1/1  stand yer ground:0/1  menu:0/1  menu open:1/0  menu close:1/0  trade:7/13  fresh milk:2/7  vanilla beans:1/7  coins only:6/7  slider:6/6  offer it:7/7  dough hook:1/1  walk away:0/1  speckled eggs:1/5  hot cinnamon:1/5  toasty wheat:1/4  cacao pods:1/4  crystal sugar:1/3
[7127s] 
== solo-tablet: FAIL
[7127s]    ✗ offered but never exercised: walk away
[7127s]    ✗ vision judge FAILED 3 screen(s)
[7127s]    ✗ 5 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  mayan cocoa souffléa soa:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:19/19  muse#:9/19  menu:0/1  menu open:1/0  menu close:1/0  call flaky jack:1/1  call crustbeard:0/2  trade:9/18  fresh milk:3/11  vanilla beans:2/9  coins only:4/9  slider:9/9  offer it:9/9  dough hook:1/1  walk away:0/4  flip coin:2/2  crystal sugar:3/8  crustbeard:1/1  cacao pods:2/7  flaky jack:1/1  toasty wheat:4/9  dough hook#:1/1  call dough hook:1/1  attack #:1/1
[7127s] 
== passplay-phone: FAIL
[7127s]    ✗ vision judge FAILED 1 screen(s)
[7127s]    ✗ 12 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  spiced fudge browniesdee:2/2  chocolate fudge tortea p:0/2  at the helm:44/44  cinnamonchocolate fudgea:2/2  dark chocolate cream puf:0/2  start:1/1  sail square:51/51  muse#:19/44  menu:0/1  menu open:1/0  menu close:1/0  dock:1/1  trade:19/40  flip coin:7/7  buy #:1/1  nah:0/1  speckled eggs:5/20  vanilla beans:5/19  coins only:11/19  slider:17/17  offer it:19/19  dough hook:3/6  walk away:2/6  accept:2/4  counter:1/4  deny:1/5  davy scones:1/1  coin:1/1  ask it:1/1  call flaky jack:3/7  call davy scones:1/2  fresh milk:6/21  call dough hook:1/3  attack #:5/5  call peg leg meg:3/4  cacao pods:5/8  crystal sugar:6/10
[7127s] 
== passplay-desktop: FAIL
[7127s]    ✗ vision judge FAILED 2 screen(s)
[7127s]    ✗ vision judge errored on 1 screen(s) — those screens are NOT cleared
[7127s]    ✗ 16 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  mexican chocolate tortea:2/2  snickerdoodle bitespillo:0/2  at the helm:48/48  caramel slicea toastedco:2/2  cinnamonchocolate fudgea:0/2  start:1/1  sail square:52/52  attack #:2/3  trade:20/48  muse#:20/48  call peg leg meg:1/2  call flaky jack:1/2  flip coin:8/8  hot cinnamon:6/31  coins only:6/19  slider:20/20  offer it:20/20  accept:1/3  counter:1/2  deny:1/4  peg leg meg:1/1  walk away:2/9  menu:0/1  crystal sugar:6/25  speckled eggs:7/20  cacao pods:6/18  vanilla beans:5/17  dough hook#:1/1  flaky jack:2/2  dock:6/6  buy #:2/2  nah:2/6  toasty wheat:7/18  dough hook:3/5  # crates:2/3  fresh milk:2/2  coin:1/1  ask it:1/1
[7127s] 
== crew-desktop: FAIL (voyage incomplete)
[7127s]    ✗ did not finish the voyage
[7127s]    ✗ 49 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  mexican chocolate tortea:2/2  cocoa cloud souffléan ai:0/2  start:1/1  sail square:51/51  trade:18/37  muse#:17/37  vanilla beans:5/29  coins only:5/18  slider:20/20  offer it:17/17  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  call flaky jack:2/3  call dough hook:3/6  call test#:2/5  fresh milk:6/31  speckled eggs:6/16  dough hook:2/4  walk away:2/7  accept:3/9  counter:3/9  deny:3/12  hot cinnamon:6/27  toasty wheat:6/16  flip coin:5/5  coin:3/3  ask it:3/3  test#:3/4  attack #:2/2  cacao pods:5/10
[7127s] 
== crew-phone: FAIL
[7127s]    ✗ offered but never exercised: walk away
[7127s]    ✗ vision judge FAILED 1 screen(s)
[7127s]    ✗ vision judge errored on 1 screen(s) — those screens are NOT cleared
[7127s]    ✗ 19 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  vanilla bean crème brûlé:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:25/25  muse#:9/22  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:10/21  hot cinnamon:3/10  coins only:5/9  slider:10/10  offer it:10/10  test#:1/1  dough hook:1/2  walk away:0/3  accept:1/3  counter:1/3  deny:1/4  call flaky jack:2/3  call dough hook:1/3  fresh milk:2/8  coin:1/1  ask it:1/1  crystal sugar:5/10  flaky jack:1/1  attack #:3/3  flip coin:5/5  flee:1/1  stand yer ground:0/1  toasty wheat:2/5  vanilla beans:1/4  speckled eggs:1/2  fire again #:1/2  break off:1/2  cacao pods:1/1
[7127s] 
== solo-desktop-wk: FAIL
[7127s]    ✗ 2 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  spiced fudge browniesdee:2/2  cinnamon sponge cakea fl:0/2  start:1/1  sail square:17/17  muse#:8/17  menu:0/1  trade:8/16  toasty wheat:4/14  coins only:4/8  slider:7/7  offer it:8/8  dough hook:1/2  walk away:1/2  fresh milk:3/7  cacao pods:1/6  vanilla beans:1/6  crystal sugar:1/5  hot cinnamon:1/5  speckled eggs:1/4  dock:1/1  flip coin:1/1  buy #:1/1  nah:0/1
[7127s] 
== solo-phone-wk: FAIL
[7127s]    ✗ vision judge FAILED 4 screen(s)
[7127s]    ✗ 2 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  crispy cocoa snapsthin h:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:18/18  muse#:8/18  menu:0/1  menu open:1/0  menu close:1/0  trade:8/16  cacao pods:1/7  hot cinnamon:1/8  coins only:8/8  slider:8/8  offer it:8/8  toasty wheat:2/7  speckled eggs:1/7  call flaky jack:1/3  call crustbeard:0/1  fresh milk:1/5  vanilla beans:1/5  attack #:2/2  flip coin:2/2  crystal sugar:1/2  call dough hook:2/2
[7127s] 
== solo-tablet-wk: FAIL
[7127s]    ✗ vision judge FAILED 4 screen(s)
[7127s]    ✗ 7 screen(s) never stopped moving before being checked
[7127s]    coverage: arrgh:2/2  chocolate genoise sponge:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:19/19  trade:8/18  muse#:7/18  toasty wheat:2/9  coins only:6/8  slider:7/7  offer it:8/8  menu:0/1  menu open:1/0  menu close:1/0  call dough hook:1/1  call crustbeard:1/3  crystal sugar:2/7  cacao pods:1/6  dock:2/2  flip coin:5/5  buy #:1/1  nah:1/2  speckled eggs:2/6  flaky jack#:1/1  walk away:0/2  flee:1/2  stand yer ground:1/2  call flaky jack:1/2  dough hook:1/1  flaky jack:0/1  attack #:1/1  fresh milk:2/3  hot cinnamon:1/2
[7127s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
