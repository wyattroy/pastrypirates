# Sea trial v2 — build `2026.08.30.1`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-08-30T22:35:55.771Z  ·  104 min  ·  gear **FULL**  ·  sailed on **cloud container**

> Gear chosen because: **FORCED ON THE COMMAND LINE — this overrode the mechanical picker.** Treat this report as weaker evidence than one whose gear was derived.
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |
| **voyages that only finished after a BROWSER RESTART** | **solo-desktop-wk ×2, solo-phone-wk ×1, solo-tablet-wk ×2** — the known WebKit crash in this container; each was resumed from the game's own save. A rescued leg is not a clean one. |



## The voyages, in full

```
== solo-desktop: FAIL
[6178s]    ✗ vision judge FAILED 1 of 18 screen(s) it looked at
[6178s]    ✗ vision judge errored on 17 screen(s) — those screens are NOT cleared
[6178s]    ✗ 4 screen(s) never stopped moving before being checked
[6178s]    coverage: arrgh:2/2  chocolate genoise sponge:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:16/16  muse#:7/14  menu:0/1  trade:7/13  crystal sugar:4/11  coins only:4/7  slider:7/7  offer it:7/7  dough hook:1/2  walk away:1/2  toasty wheat:2/6  fresh milk:1/4  vanilla beans:1/4  speckled eggs:1/2  cacao pods:1/2  call flaky jack:1/1  call crustbeard:0/1
[6178s] 
== solo-phone: FAIL
[6178s]    ✗ vision judge FAILED 3 of 26 screen(s) it looked at
[6178s]    ✗ vision judge errored on 23 screen(s) — those screens are NOT cleared
[6178s]    ✗ 7 screen(s) never stopped moving before being checked
[6178s]    coverage: arrgh:2/2  cinnamonchocolate fudgea:2/2  molten chocolate lava ca:0/2  start:1/1  sail square:14/14  trade:7/14  muse#:6/14  fresh milk:2/9  vanilla beans:1/8  coins only:4/7  slider:7/7  offer it:7/7  dough hook:1/2  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  flaky jack:1/1  flip coin:2/2  hot cinnamon:2/5  speckled eggs:1/4  attack #:1/1  cacao pods:2/3  crystal sugar:3/4  accept:1/1  counter:0/1  deny:0/1  crustbeard:1/1  dough hook#:0/1
[6178s] 
== solo-tablet: FAIL
[6178s]    ✗ offered but never exercised: deny
[6178s]    ✗ vision judge FAILED 2 of 29 screen(s) it looked at
[6178s]    ✗ vision judge errored on 27 screen(s) — those screens are NOT cleared
[6178s]    ✗ 8 screen(s) never stopped moving before being checked
[6178s]    coverage: arrgh:2/2  french pots de crèmeluxu:2/2  mexican chocolate potssi:0/2  start:1/1  sail square:13/13  trade:6/13  muse#:5/13  fresh milk:2/7  coins only:3/6  slider:7/7  offer it:6/6  crustbeard#:1/1  walk away:1/3  menu:0/1  menu open:1/0  menu close:1/0  call flaky jack:2/2  call dough hook:0/2  toasty wheat:3/7  dough hook:1/2  accept:1/2  counter:1/2  deny:0/3  crystal sugar:1/4  cacao pods:1/4  call crustbeard:1/2  attack #:2/2  flip coin:2/2  speckled eggs:2/2  hot cinnamon:1/2  coin:0/1  ask it:1/1
[6178s] 
== passplay-phone: FAIL
[6178s]    ✗ vision judge FAILED 1 of 40 screen(s) it looked at
[6178s]    ✗ vision judge errored on 39 screen(s) — those screens are NOT cleared
[6178s]    ✗ 6 screen(s) never stopped moving before being checked
[6178s]    coverage: arrgh:2/2  dark chocolate cream puf:2/2  french pots de crèmeluxu:0/2  at the helm:32/32  spiced cocoa shortbreadb:2/2  crispy cocoa snapsthin h:0/2  start:1/1  sail square:40/40  muse#:14/32  menu:0/1  menu open:1/0  menu close:1/0  trade:14/30  toasty wheat:7/22  hot cinnamon:7/22  coins only:3/3  slider:4/4  offer it:3/3  flaky jack#:1/1  walk away:1/6  attack #:1/1  call peg leg meg:1/1  call flaky jack:0/1  flip coin:4/4  slider disabled:11/11  nah:12/14  dough hook:2/3  dock:3/3  buy #:2/2  accept:2/4  deny:1/6  davy scones:1/1  crystal sugar:3/11  flaky jack:1/1  fresh milk:4/8  counter:2/3  vanilla beans:3/4  cacao pods:1/1  coin:1/1  ask it:1/1
[6178s] 
== passplay-desktop: FAIL
[6178s]    ✗ vision judge errored on 23 screen(s) — those screens are NOT cleared
[6178s]    ✗ 5 screen(s) never stopped moving before being checked
[6178s]    coverage: arrgh:2/2  chocolate fudge tortea p:2/2  cinnamonsugar churroscri:2/4  at the helm:28/28  cinnamon snapscrisp rust:0/2  start:1/1  sail square:29/29  muse#:14/28  menu:0/1  trade:14/26  crystal sugar:3/14  coins only:4/6  slider:6/6  offer it:6/6  vanilla beans:2/10  toasty wheat:4/13  dough hook:1/1  walk away:0/2  speckled eggs:10/17  flaky jack:1/1  slider disabled:8/8  nah:8/8  fresh milk:2/5  hot cinnamon:1/1  cacao pods:2/2
[6178s] 
== crew-desktop: FAIL
[6178s]    ✗ offered but never exercised: walk away
[6178s]    ✗ vision judge FAILED 2 of 55 screen(s) it looked at
[6178s]    ✗ vision judge errored on 53 screen(s) — those screens are NOT cleared
[6178s]    ✗ 14 screen(s) never stopped moving before being checked
[6178s]    coverage: arrgh:2/2  dark chocolate cream puf:2/2  french pots de crèmeluxu:0/2  start:1/1  sail square:22/22  muse#:8/18  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:7/16  hot cinnamon:2/7  coins only:4/7  slider:7/7  offer it:7/7  test#:2/3  walk away:1/3  speckled eggs:4/11  accept:1/1  counter:0/1  deny:0/1  dock:1/1  flip coin:4/4  buy #:1/1  nah:0/1  cacao pods:1/4  vanilla beans:1/4  toasty wheat:1/3  crystal sugar:1/3  dough hook:1/2  flaky jack:0/1  attack #:2/2
[6178s] 
== crew-phone: FAIL
[6178s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "test2: tap to sail"
[6178s]    ✗ vision judge FAILED 8 of 50 screen(s) it looked at
[6178s]    ✗ vision judge errored on 42 screen(s) — those screens are NOT cleared
[6178s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[6178s]    ✗ 18 screen(s) never stopped moving before being checked
[6178s]    coverage: arrgh:2/2  chocolate genoise sponge:2/2  pound cakea dense rich b:0/2  start:1/1  sail square:24/24  muse#:11/23  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:12/22  toasty wheat:4/15  coins only:5/12  slider:14/14  offer it:12/12  dough hook:1/3  walk away:1/5  accept:2/5  counter:2/4  deny:1/7  test#:1/1  flip coin:1/1  crystal sugar:2/9  coin:2/2  ask it:2/2  cacao pods:3/9  speckled eggs:6/15  flaky jack:1/1  fresh milk:3/6  vanilla beans:1/3  dough hook#:1/1
[6178s] 
== solo-desktop-wk: FAIL
[6178s]    ✗ 8 console error(s): ERR Failed to load resource: Unacceptable TLS certificate
[6178s]    ✗ vision judge FAILED 1 of 34 screen(s) it looked at
[6178s]    ✗ vision judge errored on 33 screen(s) — those screens are NOT cleared
[6178s]    ✗ 13 screen(s) never stopped moving before being checked
[6178s]    ✱ 2 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[6178s]    coverage: arrgh:2/2  snickerdoodle bitespillo:2/2  dark chocolate cream puf:0/2  start:1/1  sail square:27/27  attack #:2/2  trade:10/26  muse#:10/26  flip coin:7/7  menu:0/1  speckled eggs:4/13  coins only:4/10  slider:10/10  offer it:10/10  call crustbeard:2/4  call flaky jack:1/3  cacao pods:3/9  vanilla beans:3/13  dough hook:1/2  walk away:1/3  toasty wheat:3/9  call dough hook:1/1  dock:4/4  nah:2/4  buy #:1/1  crystal sugar:2/4  hot cinnamon:3/6  flaky jack#:1/1  # crates:1/1  fresh milk:1/1
[6178s] 
== solo-phone-wk: FAIL
[6178s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "sailCell" over "Davy Scones: tap to sail — blu"
[6178s]    ✗ 6 console error(s): ERR Failed to load resource: Unacceptable TLS certificate
[6178s]    ✗ vision judge FAILED 2 of 29 screen(s) it looked at
[6178s]    ✗ vision judge errored on 27 screen(s) — those screens are NOT cleared
[6178s]    ✗ 8 screen(s) never stopped moving before being checked
[6178s]    ✱ 1 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[6178s]    coverage: arrgh:2/2  dark chocolate cream puf:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:17/17  muse#:5/13  call crustbeard:1/2  call dough hook:0/1  call flaky jack:1/1  menu:0/1  menu open:1/0  menu close:1/0  trade:5/12  fresh milk:1/5  coins only:4/5  slider:5/5  offer it:5/5  crystal sugar:1/4  attack #:2/2  flip coin:3/3  vanilla beans:2/3  dough hook:1/1  walk away:0/2  toasty wheat:1/2  crustbeard:1/1  accept:1/1  counter:0/1  deny:0/1  speckled eggs:1/1  hot cinnamon:0/1  dock:1/1  buy #:1/1  nah:0/1
[6178s] 
== solo-tablet-wk: FAIL
[6178s]    ✗ vision judge FAILED 1 of 24 screen(s) it looked at
[6178s]    ✗ vision judge errored on 23 screen(s) — those screens are NOT cleared
[6178s]    ✗ 11 screen(s) never stopped moving before being checked
[6178s]    ✱ 2 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[6178s]    coverage: arrgh:2/2  snickerdoodle bitespillo:2/2  chocolate fudge tortea p:0/2  start:1/1  sail square:23/23  trade:7/14  muse#:7/14  crystal sugar:2/7  vanilla beans:1/6  coins only:6/7  slider:7/7  offer it:7/7  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:2/7  cacao pods:1/6  flaky jack:1/1  walk away:0/1  accept:1/1  counter:0/1  deny:0/1  speckled eggs:1/4  hot cinnamon:1/2  call crustbeard:1/1  call dough hook:0/1
[6178s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
