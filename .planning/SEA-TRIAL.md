# Sea trial — build `2026.08.27.3`

**FAILED** — 8 of 8 voyage(s) sailed  ·  2026-08-28T04:10:12.447Z  ·  62 min  ·  gear **FULL**

> Gear chosen because: **FORCED ON THE COMMAND LINE — this overrode the mechanical picker.** Treat this report as weaker evidence than one whose gear was derived.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
[3533s]   [solo-phone-wk] DAY 4
[3555s] [solo-phone-wk] ERROR: s.replace is not a function
[3555s] [solo-phone-wk] vision-judging 11 screen(s)…
[3566s]   [judge FATAL] solo-desktop-wk-018-settled.png: the judge cannot run: API Error: Unable to connect to API: Self-signed certificate detected. Check your proxy or corporate SSL certificates
[3571s] [solo-desktop-wk] !! the vision judge cannot run: the judge cannot run: API Error: Unable to connect to API: Self-signed certificate detected. Check your proxy or corporate SSL certificates
[3571s] [solo-desktop-wk] falling back to the QUEUE — these 20 screen(s) are deferred, not cleared
[3575s] [solo-desktop-wk] contact sheet: /home/user/pastrypirates/sea-trial-shots/contact-solo-desktop-wk.png
[3691s] [solo-desktop-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[3729s] [solo-phone-wk] contact sheet timed out after 2 min — abandoning it (the screenshots and log are already written)
[3729s] 
== solo-desktop: FAIL
[3729s]    ✗ 6 screen(s) never stopped moving before being checked
[3729s]    ✗ vision pass DEFERRED for 25 screen(s) — queued for a session, NOT cleared
[3729s]    coverage: arrgh:2/2  snickerdoodle bitespillo:2/2  cinnamon dutch babya dra:0/2  start:1/1  sail square:23/23  trade:8/18  muse#:7/18  toasty wheat:2/7  coins only:2/8  slider:8/8  offer it:8/8  menu:0/1  crystal sugar:3/7  attack #:3/3  flip coin:4/4  fire again #:1/1  break off:0/1  cacao pods:1/4  speckled eggs:3/8  hot cinnamon:1/5  fresh milk:3/9  crustbeard:1/1  walk away:0/2  vanilla beans:2/4  dough hook:1/1
[3729s] 
== solo-phone: FAIL
[3729s]    ✗ 1 structural check failure(s)
[3729s]    ✗ 10 screen(s) never stopped moving before being checked
[3729s]    coverage: arrgh:2/2  vanilla bean crème brûlé:2/2  french pots de crèmeluxu:0/2  start:1/1  sail square:30/30  trade:10/21  muse#:10/21  toasty wheat:2/9  hot cinnamon:1/9  vanilla beans:1/9  coins only:4/9  slider:9/9  offer it:9/9  menu:0/1  menu open:1/0  menu close:1/0  call crustbeard:1/1  call dough hook:1/2  fresh milk:2/8  crystal sugar:5/9  flaky jack:1/1  walk away:1/3  speckled eggs:2/6  dough hook:1/2  cacao pods:1/5  call flaky jack:0/1  dock:1/1  flip coin:1/1  nah:1/1
[3729s] 
== passplay-phone: FAIL
[3729s]    ✗ vision judge FAILED 1 screen(s)
[3729s]    ✗ 2 screen(s) never stopped moving before being checked
[3729s]    coverage: arrgh:1/1  molten chocolate lava ca:2/2  mexican chocolate potssi:0/2  at the helm:37/37  cinnamonchocolate fudgea:2/2  french pots de crèmeluxu:0/2  start:1/1  sail square:44/44  dock:1/1  trade:18/36  muse#:17/36  flip coin:1/1  buy #:1/1  nah:0/1  toasty wheat:4/18  crystal sugar:3/18  vanilla beans:3/17  coins only:8/18  slider:11/11  offer it:18/18  accept:1/1  counter:0/1  deny:0/1  davy scones:1/1  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  cacao pods:3/17  hot cinnamon:9/27  dough hook:2/3  fresh milk:3/9  speckled eggs:3/6
[3729s] 
== passplay-desktop: FAIL
[3729s]    ✗ vision judge FAILED 2 screen(s)
[3729s]    ✗ 6 screen(s) never stopped moving before being checked
[3729s]    coverage: arrgh:1/1  spiced cocoa shortbreadb:2/2  crispy cocoa snapsthin h:0/2  at the helm:31/31  dark chocolate cream puf:2/2  molten chocolate lava ca:0/2  start:1/1  sail square:35/35  muse#:13/30  menu:0/1  trade:13/26  toasty wheat:3/12  coins only:4/6  slider:6/6  offer it:13/13  flaky jack#:2/3  walk away:1/6  accept:1/1  counter:0/1  deny:0/1  davy scones:1/1  hot cinnamon:2/11  dock:1/1  flip coin:7/7  nah:1/1  speckled eggs:7/15  call dough hook:1/1  call davy scones:0/1  attack #:3/3  call peg leg meg:1/1  call flaky jack:0/1  vanilla beans:2/6  crystal sugar:2/5  cacao pods:5/8  dough hook:2/2  flee:1/1  stand yer ground:0/1  fresh milk:1/1
[3729s] 
== crew-desktop: FAIL
[3729s]    ✗ offered but never exercised: walk away
[3729s]    ✗ vision judge FAILED 2 screen(s)
[3729s]    ✗ 11 screen(s) never stopped moving before being checked
[3729s]    coverage: arrgh:2/2  cinnamonchocolate fudgea:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:26/26  trade:9/19  muse#:9/20  speckled eggs:2/9  hot cinnamon:1/8  coins only:6/8  slider:6/6  offer it:8/8  dough hook:1/2  walk away:0/3  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  flip coin:5/5  attack #:2/2  fresh milk:2/6  call test#:1/1  call dough hook:0/1  vanilla beans:1/5  toasty wheat:3/5  crystal sugar:1/3  test#:1/1  accept:1/2  counter:0/1  deny:1/2  flaky jack#:1/1  flee:1/2  stand yer ground:1/2
[3729s] 
== crew-phone: FAIL
[3729s]    ✗ 3 structural check failure(s)
[3729s]    ✗ offered but never exercised: deny
[3729s]    ✗ 19 screen(s) never stopped moving before being checked
[3729s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:24/24  dock:1/2  muse#:10/23  flip coin:3/3  buy #:1/1  nah:0/1  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:11/21  speckled eggs:2/10  coins only:5/11  offer it:11/11  toasty wheat:2/9  cacao pods:6/16  slider:9/9  attack #:1/1  call test#:1/1  call flaky jack:0/1  test#:1/1  walk away:1/3  fresh milk:2/5  vanilla beans:1/5  hot cinnamon:4/4  dough hook:1/2  accept:1/1  counter:0/1  deny:0/1
[3729s] 
== solo-desktop-wk: FAIL (voyage incomplete)
[3729s]    ✗ did not finish the voyage
[3729s]    ✗ 5 screen(s) never stopped moving before being checked
[3729s]    ✗ vision pass DEFERRED for 20 screen(s) — queued for a session, NOT cleared
[3729s]    ✗ leg error: s.replace is not a function
[3729s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  pound cakea dense rich b:0/2  start:1/1  sail square:13/13  trade:6/12  muse#:5/12  toasty wheat:2/6  coins only:6/6  slider:6/6  offer it:6/6  menu:0/1  call crustbeard:1/1  call flaky jack:1/3  speckled eggs:1/5  dough hook:1/1  walk away:0/1  attack #:1/1  flip coin:1/1  accept:1/1  counter:0/1  deny:0/1  call dough hook:1/2  fresh milk:1/4  cacao pods:1/2  crystal sugar:1/1  vanilla beans:0/1
[3729s] 
== solo-phone-wk: FAIL (voyage incomplete)
[3729s]    ✗ did not finish the voyage
[3729s]    ✗ 1 structural check failure(s)
[3729s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[3729s]    ✗ 3 screen(s) never stopped moving before being checked
[3729s]    ✗ leg error: s.replace is not a function
[3729s]    coverage: arrgh:1/1  chocolate fudge tortea p:2/2  cinnamon sponge cakea fl:0/2  start:1/1  sail square:4/4  trade:2/3  muse#:1/3  hot cinnamon:1/2  coins only:2/2  slider:2/2  offer it:2/2  menu:0/1  menu open:1/0  menu close:1/0  cacao pods:1/1
[3729s] 
RESULT: FAIL
[3729s] WROTE /home/user/pastrypirates/sea-trial-shots/judge-queue.json — 45 screen(s) awaiting a session's eyes.
[3729s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
