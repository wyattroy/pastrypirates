# Sea trial v2 — build `2026.09.07.3` (tree `d87ba9976185`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-11T02:04:59.091Z  ·  78 min  ·  gear **FULL**  ·  sailed on **local Mac (Wyatts-MacBook-Air.local)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: credits.html, index.html, package.json, rules.html, sfx/creak-1.mp3, sfx/creak-2.mp3, sfx/creak-3.mp3, sfx/creak-4.mp3, sfx/creak-5.mp3, sfx/creak-6.mp3, sfx/gull-1.mp3, sfx/gull-2.mp3, sfx/gull-3.mp3, sfx/gull-4.mp3, sfx/gull-5.mp3, sfx/music-ocean.mp3, sfx/ocean-loop.mp3, sitemap.xml, src/engine/index.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/flow.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
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
| **can the vision judge see?** | **NO** — **THE JUDGE CANNOT SEE** — every visual verdict below is worthless; the structural half still stands.   FAIL  the judge cannot run at all — {"verdict":"FATAL","issues":["the judge cannot run: Failed to authenticate: OAuth session expired and could not be refreshed"],"confidence":0} ·  · FAILED — this is an environment fault, not a verdict about any screen. |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |


## The vision pass — done by a session's own eyes, 2026-09-10

The trial's judge could not log in, so all **322** queued screens were looked at by the session
instead (contact sheets, with full-size checks where a sheet was not enough), and merged with
`node scripts/apply_judge_results.mjs sea-trial-shots`: **322 judged · 7 FAILED · 0 not judged.**
The 7 are two faults:

| Fault | Screens | Where it stands |
|---|---|---|
| A crew guest's own device asked *"Do ye know how to play?"* with one button | 2 (desktop + phone guest, first screen) | **Fixed** in `52560af8` — each device asks its own question, both circles |
| On a phone, *Play again!* sits over the award cards at the end of a voyage | 5 (every phone end card) | **His call** — on the checklist sheet (footer, or at the end of the scroll) |

**⛔ 8 more were FAILED and then reversed — the session's mistake, kept here so it is not made
again.** The *Bake this!* pill sitting on the recipe name (all phone and tablet picks) was called a
fault. **It is his design** — *"The pill is SUPPOSED to cover the card — it's the confirmation
button. I have ruled this a hundred times and your sea trial always forgets."* (2026-09-11). The
judge forgot because the ruling lived only in a code comment; it is now in the accepted list in
`docs/INTENDED-BEHAVIOUR.md`, which the judge reads, and in `DECISIONS.md`.

Also seen, and already his: the camera's close zoom on act and trade prompts (phone, tablet, and
desktop too) — his #6, on the sheet with the zoom line-up. Everything else passed.


## The voyages, in full

```
== solo-desktop: FAIL
[4603s]    ✗ vision pass DEFERRED for 28 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:1/3  chocolate genoise sponge:2/2  french pots de crème:0/2  start:1/1  sail square:26/26  attack #:2/2  trade:8/19  muse#:8/20  flip coin:5/5  fire again #:1/1  break off:0/1  menu:0/1  sugar cane:1/8  hot cinnamon:5/14  coins only:4/8  slider disabled:2/2  offer it:8/8  call crustbeard:1/4  call flaky jack:1/2  dock:2/2  buy #:1/1  toasty wheat:2/7  speckled eggs:2/7  slider:6/6  cacao pods:1/6  vanilla beans:1/5  fresh milk:1/4  arrgh:1/1  call dough hook:2/2
[4603s] 
== solo-phone: FAIL
[4603s]    ✗ vision pass DEFERRED for 22 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:0/1  chocolate genoise sponge:2/2  cinnamon dutch baby:0/2  start:1/1  sail square:18/18  trade:9/18  muse#:9/18  vanilla beans:2/10  coins only:4/9  slider:9/9  offer it:9/9  dough hook:1/1  walk away:1/3  menu:0/1  menu open:1/0  menu close:1/0  flip coin:1/1  cacao pods:5/15  flaky jack:1/2  arrgh:1/1  speckled eggs:2/7  hot cinnamon:2/6  call dough hook:1/1  call crustbeard:0/1  fresh milk:1/3  sugar cane:1/3  toasty wheat:1/2
[4603s] 
== solo-tablet: FAIL
[4603s]    ✗ vision pass DEFERRED for 24 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:0/1  spiced fudge brownies:1/1  mayan cocoa soufflé:0/2  spiced fudge browniesbak:1/1  start:1/1  sail square:16/16  trade:8/16  muse#:8/16  speckled eggs:2/8  vanilla beans:1/7  coins only:4/8  slider:8/8  offer it:8/8  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:4/12  sugar cane:2/7  hot cinnamon:1/7  dough hook:1/3  walk away:1/4  call crustbeard:2/3  call dough hook:0/1  fresh milk:2/6  flaky jack#:1/2  call flaky jack:1/2  accept:1/1  counter:0/1  deny:0/1  arrgh:1/1  crustbeard:1/1
[4603s] 
== passplay-phone: FAIL
[4603s]    ✗ vision pass DEFERRED for 32 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:7/9  mayan cocoa soufflé:1/1  mexican chocolate pots:0/2  mayan cocoa soufflébake :1/1  at the helm:55/55  caramel slice:1/1  chocolate genoise sponge:0/2  caramel slicebake this:0/1  caramel slicebake this c:1/0  start:1/1  sail square:32/32  trade:13/28  muse#:13/28  toasty wheat:2/10  coins only:3/6  slider:5/5  offer it:6/6  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:8/15  dough hook:1/1  walk away:0/2  call dough hook:2/3  call peg leg meg:1/2  flip coin:3/3  sugar cane:5/12  speckled eggs:3/10  cacao pods:2/6  hot cinnamon:1/6  slider disabled:8/8  dock:1/1  buy #:1/1  attack #:1/1  call flaky jack:1/3  vanilla beans:2/4  accept:1/1  deny:0/1  davy scones:1/1
[4603s] 
== passplay-desktop: FAIL
[4603s]    ✗ offered but never exercised: deny
[4603s]    ✗ vision pass DEFERRED for 37 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:0/2  crispy cocoa snaps:1/1  chocolate genoise sponge:0/2  crispy cocoa snapsbake t:1/1  at the helm:70/70  snickerdoodle bites:1/1  dark chocolate cream puf:0/2  snickerdoodle bitesbake :1/1  start:1/1  sail square:38/38  muse#:16/36  trade:16/35  vanilla beans:6/24  coins only:5/16  slider:15/15  offer it:16/16  dough hook:2/4  walk away:2/5  menu:0/1  cacao pods:4/14  dock:1/1  attack #:3/4  flip coin:4/4  buy #:1/1  toasty wheat:6/21  sugar cane:5/16  accept:1/2  counter:1/2  deny:0/3  peg leg meg:1/1  fresh milk:6/18  slider disabled:2/2  arrgh:1/1  call peg leg meg:1/1  call dough hook:1/3  vanilla beans #:1/1  call davy scones:1/2  speckled eggs:1/1  coin:1/1  ask it:1/1
[4603s] 
== crew-desktop: FAIL
[4603s]    ✗ offered but never exercised: vanilla beans
[4603s]    ✗ vision pass DEFERRED for 55 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:1/2  spiced fudge brownies:1/1  cocoa cloud soufflé:0/2  spiced fudge browniesbak:1/1  start:1/1  sail square:16/16  trade:6/15  muse#:6/15  sugar cane:1/6  coins only:4/6  slider:6/6  offer it:6/6  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  toasty wheat:1/5  fresh milk:1/5  cacao pods:3/7  call test#:1/1  call flaky jack:0/2  call dough hook:1/1  vanilla beans:0/3  dough hook:1/2  walk away:0/2  attack #:2/2  flip coin:3/3  speckled eggs:1/2  hot cinnamon:1/1  test#:1/1  arrgh:1/1  dock:1/1
[4603s] 
== crew-phone: FAIL
[4603s]    ✗ offered but never exercised: deny
[4603s]    ✗ 2 moment(s) where the two captains saw different games: captains (Flaky: host 7 vs guest 6   (row ORDER differs by design and is not part of this finding)); whose turn (host lights test2, guest lights Flaky)
[4603s]    ✗ vision pass DEFERRED for 53 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:1/3  cinnamonchocolate fudge:1/1  vanilla bean crème brûlé:0/2  cinnamonchocolate fudgeb:1/1  start:1/1  sail square:17/17  trade:8/16  muse#:7/17  fresh milk:2/8  coins only:3/8  slider:8/8  offer it:8/8  dough hook:2/3  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  flip coin:3/3  vanilla beans:4/11  test#:1/1  sugar cane:2/6  cacao pods:1/6  call dough hook:1/1  call flaky jack:0/1  arrgh:1/1  dock:2/2  buy #:1/2  toasty wheat:1/3  speckled eggs:1/3  hot cinnamon:1/3  vanilla beans #:1/1  accept:1/1  counter:0/1  deny:0/1
[4603s] 
== solo-desktop-wk: FAIL
[4603s]    ✗ vision pass DEFERRED for 28 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:0/1  cinnamon snaps:1/1  pound cake:0/2  cinnamon snapsbake this:0/1  cinnamon snapsbake this :1/0  start:1/1  sail square:24/24  trade:11/22  muse#:10/22  hot cinnamon:2/12  coins only:4/11  slider:11/11  offer it:11/11  menu:0/1  sugar cane:2/10  toasty wheat:2/10  fresh milk:4/11  dough hook:1/2  walk away:1/4  call crustbeard:1/2  call dough hook:0/1  arrgh:1/1  vanilla beans:3/8  speckled eggs:3/9  crustbeard:1/1  call flaky jack:1/1  cacao pods:3/6  accept:1/1  counter:0/1  deny:0/1  attack #:1/1  flip coin:1/1  flaky jack:1/1
[4603s] 
== solo-phone-wk: FAIL
[4603s]    ✗ vision pass DEFERRED for 29 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:1/3  snickerdoodle bites:1/1  spiced cocoa shortbread:0/2  snickerdoodle bitesbake :1/1  start:1/1  sail square:17/17  muse#:5/14  menu:0/1  menu open:1/0  menu close:1/0  call dough hook:1/2  call flaky jack:0/2  trade:6/13  hot cinnamon:1/7  vanilla beans:3/9  coins only:3/6  slider:6/6  offer it:6/6  toasty wheat:2/7  fresh milk:1/6  dock:2/2  flip coin:4/4  buy #:1/2  call crustbeard:2/2  sugar cane:1/4  cacao pods:1/3  dough hook:1/2  flaky jack#:0/1  walk away:1/2  arrgh:1/1  attack #:1/1  speckled eggs:1/1
[4603s] 
== solo-tablet-wk: FAIL
[4603s]    ✗ vision pass DEFERRED for 14 screen(s) — queued for a session, NOT cleared
[4603s]    coverage: yarrgh:1/1  nah:0/1  chocolate fudge torte:1/1  caramel slice:0/2  chocolate fudge tortebak:1/1  start:1/1  sail square:12/12  muse#:6/12  menu:0/1  menu open:1/0  menu close:1/0  trade:6/11  toasty wheat:4/9  coins only:4/6  slider:6/6  offer it:6/6  fresh milk:1/5  dough hook#:1/1  walk away:0/1  cacao pods:1/3  hot cinnamon:1/3  vanilla beans:0/2  speckled eggs:1/1
[4603s] 
RESULT: FAIL
[4603s] WROTE /Users/wyattroy/Documents/Projects/pastrypirates/.claude/worktrees/google-search-console-020493/sea-trial-shots/judge-queue.json — 322 screen(s) awaiting a session's eyes.
[4603s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
