# Sea trial v2 — build `2026.09.06.2` (tree `a03c55b7dd08`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-07T06:32:41.036Z  ·  116 min  ·  gear **FULL**  ·  sailed on **local Mac (Wyatts-MacBook-Air.local)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: index.html, package.json, rules.html, sitemap.xml, src/orchestrator.js, src/shared/index.js, src/ui/course.js, src/ui/flow.js, src/ui/pilot.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
>
> **Depth: FULL. The mechanical picker said FULL.** The depth was DERIVED from the files that changed. Nothing was overridden.
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| **can the vision judge see?** | **unknown** — **COULD NOT BE ASKED** — judge can-see check — NOT RUN: no sea-trial-shots/ directory. Sail a trial first. |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
== solo-desktop: FAIL
[6923s]    ✗ vision judge FAILED 2 of 21 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-desktop-009-settled.png — trade-option bubbles overlap each other (Hot Cinnamon overlaps Vanilla Beans; Sugar Cane crowds Speckled Eggs), obscuring their text
       · solo-desktop-021-settled.png — large empty dead space between stats list and 'Play again!' button in the End of Voyage panel
[6923s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 2.8s)
[6923s]    coverage: yaargh:1/1  nah:0/1  arrgh:2/2  cinnamon dutch baby:1/1  mexican chocolate torte:0/2  cinnamon dutch babybake :1/1  start:1/1  sail square:17/17  trade:8/17  muse#:7/17  toasty wheat:2/7  sugar cane:1/6  coins only:7/8  slider:8/8  offer it:8/8  menu:0/1  attack #:2/3  flip coin:3/3  fresh milk:2/8  speckled eggs:2/8  call crustbeard:1/1  call dough hook:0/1  cacao pods:1/5  hot cinnamon:1/6  vanilla beans:1/4  dough hook#:1/1  walk away:0/1
[6923s] 
== solo-phone: FAIL
[6923s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Caramel Slice <- covered by .recipeTitle <div>
[6923s]    ✗ vision judge FAILED 3 of 23 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-003-settled.png — large empty cream space below the recipe card and nav arrows, with no button or content filling it
       · solo-phone-016-settled.png — 'What will ye GIVE for Sugar Cane?' prompt bubble runs flush against the right screen edge with no margin/rounded corner, unlike the left side
       · solo-phone-017-settled.png — 'Davy Scones, what'll ye do:' prompt bubble runs flush against the right screen edge with no margin/rounded corner
[6923s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 3.3s)
[6923s]    coverage: yaargh:1/1  nah:0/1  arrgh:2/2  cinnamon snaps:1/1  caramel slice:0/2  cinnamon snapsbake this:0/1  cinnamon snapsbake this :1/0  start:1/1  sail square:23/23  muse#:6/15  menu:0/1  menu open:1/0  menu close:1/0  trade:7/14  cacao pods:2/9  coins only:3/7  slider:7/7  offer it:7/7  dough hook:1/2  walk away:1/3  speckled eggs:3/11  hot cinnamon:1/7  crustbeard:1/1  sugar cane:2/6  fresh milk:3/5  vanilla beans:1/2  attack #:2/2  flip coin:2/2
[6923s] 
== solo-tablet: FAIL
[6923s]    ✗ 2 structural check failure(s): no-pile×2 — first: overlapping controls: Spiced Cocoa Shortbread/Cinnamon-Chocolate Fudge
[6923s]    ✗ offered but never exercised: hot cinnamon
[6923s]    ✗ vision judge FAILED 2 of 21 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-003-settled.png — second recipe card ('Cinnamon-Chocolate Fudge') is overlapped/clipped by the front card, truncating its title to 'n-Chocolate Fudge'
       · solo-tablet-004-settled.png — second recipe card ('Cinnamon-Chocolate Fudge') still overlapped/clipped behind the selected front card, title truncated to 'n-Chocolate Fudge'
[6923s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[6923s]    coverage: yaargh:1/1  nah:0/1  arrgh:1/1  spiced cocoa shortbread:1/1  cinnamonchocolate fudge:0/2  spiced cocoa shortbreadb:1/1  start:1/1  sail square:10/10  trade:5/10  muse#:5/10  toasty wheat:1/5  hot cinnamon:0/5  coins only:4/5  slider:5/5  offer it:5/5  menu:0/1  menu open:1/0  menu close:1/0  sugar cane:1/4  speckled eggs:1/4  cacao pods:2/3  vanilla beans:0/1  dough hook#:1/1  walk away:0/2  fresh milk:1/1  crustbeard:1/1  call dough hook:1/1  call crustbeard:0/1
[6923s] 
== passplay-phone: FAIL
[6923s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Cocoa Cloud Soufflé <- covered by .recipeTitle <div>
[6923s]    ✗ 18 screen(s) never stopped moving before being checked (still moving: 18 geometry; longest wait 3.0s)
[6923s]    coverage: yaargh:1/1  nah:0/1  arrgh:2/2  spiced fudge brownies:1/1  cocoa cloud soufflé:0/2  spiced fudge browniesbak:1/1  at the helm:42/42  spiced cocoa shortbread:1/1  molten chocolate lava ca:0/2  spiced cocoa shortbreadb:1/1  start:1/1  sail square:54/54  muse#:20/42  menu:0/1  menu open:1/0  menu close:1/0  trade:20/40  speckled eggs:7/22  coins only:7/20  slider:19/19  offer it:20/20  dough hook:2/4  walk away:2/8  accept:2/4  counter:1/4  deny:1/5  peg leg meg:1/1  call flaky jack:2/7  call davy scones:0/1  flip coin:3/3  attack #:2/2  call peg leg meg:2/2  cacao pods:6/22  vanilla beans:4/9  fresh milk:8/16  slider disabled:2/2  flaky jack:2/2  sugar cane:7/11  call dough hook:3/4  coin:1/1  ask it:1/1  davy scones:1/1  toasty wheat:2/2
[6923s] 
== passplay-desktop: FAIL
[6923s]    ✗ offered but never exercised: pound cake
[6923s]    ✗ 6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 3.0s)
[6923s]    coverage: yaargh:1/1  nah:6/8  arrgh:2/2  cinnamon dutch baby:1/1  pound cake:0/4  cinnamon dutch babybake :1/1  at the helm:37/37  spiced fudge brownies:1/1  spiced fudge browniesbak:1/1  start:1/1  sail square:43/43  trade:16/36  muse#:16/36  fresh milk:9/30  coins only:8/12  slider:11/11  offer it:12/12  flaky jack#:1/1  walk away:1/3  menu:0/1  sugar cane:3/15  slider disabled:5/5  hot cinnamon:2/10  dock:3/3  flip coin:5/5  buy #:1/1  toasty wheat:3/11  dough hook:1/2  call flaky jack:1/2  call peg leg meg:1/2  flee:1/1  stand yer ground:0/1  attack #:1/1  speckled eggs:2/6  vanilla beans:2/6  cacao pods:3/3
[6923s] 
== crew-desktop: FAIL (voyage incomplete)
[6923s]    ✗ did not finish the voyage
[6923s]    ✗ 2 structural check failure(s): no-pile×2 — first: overlapping controls: Pound Cake/Vanilla Bean Crème Brûlé
[6923s]    ✗ 1493 dead control(s): slider drag, slider drag, slider drag, slider drag, slider drag
[6923s]    ✗ 1 unreachable control(s): control "Offer it!" exists but not clickable: occluded by DIV
[6923s]    ✗ 7 moment(s) where the two captains saw different games: whose turn (host lights Flaky, guest lights (nobody)); captains (Flaky: host 2 vs guest 3   (row ORDER differs by design and is not part of this finding)); whose turn (host lights test2, guest lights (nobody))
[6923s]    ✗ 10 console error(s): ERR VOYAGE AGROUND (unhandled rejection) TypeError: Cannot read properties of undefined (reading 'length')
    at stormSummary (http://127.0.0.1:8800/src/ui/util.js:812:16)
    at describeFor (http://127.0.0.1:8800/src/ui/util.js:849:11)
    at syncLogLines (http://127.0.0.1:8800/src/ui/util.js:953:95)
    at consumeEvent (http://127.0.0.1:8800/src/orchestrator.js:1751:3)
    at http://127.0.0.1:8800/src/orchestrator.js:1796:11
    at s (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:154085)
    at ms.onValue (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:132200)
    at https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:140035
    at Ge (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:18008)
    at Wi (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:120946)
[6923s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 3.1s)
[6923s]    coverage: yaargh:1/1  nah:0/1  arrgh:2/2  mayan cocoa soufflé:1/1  chocolate genoise sponge:0/2  mayan cocoa soufflébake :1/1  start:1/1  call test#:1/2  call flaky jack:0/1  sail square:8/8  trade:4/8  muse#:4/8  fresh milk:1/5  sugar cane:3/7  coins only:2/4  slider:5/5  offer it:4/4  dough hook:1/2  walk away:1/3  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  accept:1/3  counter:1/3  deny:1/4  call dough hook:1/1  coin:1/1  ask it:1/1  toasty wheat:2/2  test#:1/1
[6923s] 
== crew-phone: FAIL (voyage incomplete)
[6923s]    ✗ did not finish the voyage
[6923s]    ✗ 8 structural check failure(s): not-occluded×4, no-pile×4 — first: clickable covered by something else: Vanilla Bean Crème Brûlé <- covered by .recipeTitle <div>
[6923s]    ✗ 2 unreachable control(s): control "Trade" exists but not clickable: occluded by DIV; control "Muse+1" exists but not clickable: occluded by PRE
[6923s]    ✗ 3 moment(s) where the two captains saw different games: whose turn (host lights Flaky, guest lights (nobody)); captains (Flaky: host 9 vs guest 8   (row ORDER differs by design and is not part of this finding)); whose turn (host lights test2, guest lights (nobody))
[6923s]    ✗ 7 console error(s): ERR VOYAGE AGROUND (unhandled rejection) TypeError: Cannot read properties of undefined (reading 'length')
    at stormSummary (http://127.0.0.1:8800/src/ui/util.js:812:16)
    at describeFor (http://127.0.0.1:8800/src/ui/util.js:849:11)
    at syncLogLines (http://127.0.0.1:8800/src/ui/util.js:953:95)
    at consumeEvent (http://127.0.0.1:8800/src/orchestrator.js:1751:3)
    at http://127.0.0.1:8800/src/orchestrator.js:1796:11
    at s (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:154085)
    at ms.onValue (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:132200)
    at https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:140035
    at Ge (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:18008)
    at Wi (https://www.gstatic.com/firebasejs/12.15.0/firebase-database-compat.js:1:120946)
[6923s]    ✗ vision judge FAILED 1 of 32 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-guest-015-settled.png — 'Tap and hold the sea to reveal the board' hint bar overlaps the Pastry Pirates logo emblem in the top-left corner of the board
[6923s]    ✗ 13 screen(s) never stopped moving before being checked (still moving: 13 geometry; longest wait 3.3s)
[6923s]    coverage: yaargh:1/1  nah:0/1  arrgh:1/1  molten chocolate lava ca:2/2  vanilla bean crème brûlé:0/2  start:1/1  sail square:5/5  trade:3/5  muse#:2/5  toasty wheat:1/3  fresh milk:1/3  vanilla beans:1/3  coins only:3/3  slider:3/3  offer it:3/3  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  call dough hook:1/1  call flaky jack:0/1
[6923s] 
== solo-desktop-wk: FAIL
[6923s]    ✗ vision judge errored on 1 screen(s) — those screens are NOT cleared
[6923s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[6923s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
[6923s]    coverage: yaargh:1/1  nah:0/2  arrgh:2/2  cinnamon sponge cake:1/1  spiced cocoa shortbread:0/2  cinnamon sponge cakebake:1/1  start:1/1  sail square:29/29  muse#:8/19  menu:0/1  trade:9/18  toasty wheat:3/11  hot cinnamon:1/10  coins only:3/9  slider:9/9  offer it:9/9  speckled eggs:3/11  attack #:1/1  flip coin:2/2  vanilla beans:4/10  dough hook:1/2  walk away:1/3  dock:1/1  buy #:1/1  fresh milk:2/4  cacao pods:3/3  flaky jack:1/1  call crustbeard:1/1  call flaky jack:0/1
[6923s] 
== solo-phone-wk: FAIL
[6923s]    ✗ 4 structural check failure(s): not-occluded×2, no-pile×2 — first: clickable covered by something else: Dark Chocolate Cream Puf <- covered by .recipeTitle <div>
[6923s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 2.7s)
[6923s]    coverage: yaargh:1/1  nah:1/2  arrgh:2/2  cinnamon sponge cake:1/1  dark chocolate cream puf:0/2  cinnamon sponge cakebake:1/1  start:1/1  sail square:18/18  muse#:8/18  menu:0/1  menu open:1/0  menu close:1/0  trade:8/17  fresh milk:2/8  coins only:3/7  slider:6/6  offer it:7/7  call dough hook:1/1  call crustbeard:0/1  vanilla beans:3/9  crustbeard#:1/1  walk away:0/2  flip coin:3/3  attack #:2/2  speckled eggs:1/6  hot cinnamon:1/6  slider disabled:2/2  toasty wheat:4/9  flaky jack:1/1  sugar cane:1/2  cacao pods:1/1
[6923s] 
== solo-tablet-wk: FAIL
[6923s]    ✗ 2 structural check failure(s): no-pile×2 — first: overlapping controls: Mayan Cocoa Soufflé/Chocolate Fudge Torte
[6923s]    ✗ offered but never exercised: walk away
[6923s]    ✗ 2 observation(s) seen only DURING an animation — not failures, read them in the log
[6923s]    ✗ 11 screen(s) never stopped moving before being checked (still moving: 11 geometry; longest wait 2.8s)
[6923s]    coverage: yaargh:1/1  nah:0/1  arrgh:2/2  mayan cocoa soufflé:1/1  chocolate fudge torte:0/2  mayan cocoa soufflébake :1/1  start:1/1  sail square:21/21  muse#:7/15  menu:0/1  menu open:1/0  menu close:1/0  trade:7/13  toasty wheat:2/7  coins only:5/7  slider:6/6  offer it:7/7  dough hook:1/1  walk away:0/3  speckled eggs:2/8  cacao pods:1/6  crustbeard:1/1  hot cinnamon:1/5  vanilla beans:1/5  flaky jack:1/1  attack #:1/1  flip coin:1/1  call crustbeard:1/1  call flaky jack:0/1  sugar cane:2/3  slider disabled:1/1
[6923s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
