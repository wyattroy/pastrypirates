# Sea trial v2 — build `2026.09.07.3` (tree `eab2fe944384`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-13T13:40:28.662Z  ·  29 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **10 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **10** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 3 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 2 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | **RED** | docs or tooling can fail here. That is NOT the game. |
> | UNCLASSIFIED - a new verdict shape this table does not know | **5** | tell whoever added it to update sea_trial.mjs |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: about.html, assets/plaque/column.png, assets/plaque/phone.png, assets/plaque/tablet.png, credits.html, index.html, package.json, privacy.html, rules.html, sfx/creak-1.mp3, sfx/creak-2.mp3, sfx/creak-3.mp3, sfx/creak-4.mp3, sfx/creak-5.mp3, sfx/creak-6.mp3, sfx/gull-1.mp3, sfx/gull-2.mp3, sfx/gull-3.mp3, sfx/gull-4.mp3, sfx/gull-5.mp3, sfx/music-ocean.mp3, sfx/ocean-loop.mp3, src/engine/index.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/dockcoin.js, src/ui/flow.js, src/ui/index.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
>
> **Depth: FULL. The mechanical picker said FULL.** The depth was DERIVED from the files that changed. Nothing was overridden.
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | **FAIL** |
| **can the vision judge see?** | yes — checked just before sailing — the judge opened a real screenshot and described it |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |


## The browser-free checks failed

**FAILING GATE:** `node scripts/qa/sitemap_lastmod_check.mjs`

```
ok   https://playpastrypirates.com/about.html -> about.html @ 2026-09-12
  ok   https://playpastrypirates.com/credits.html -> credits.html @ 2026-09-12
  ok   https://playpastrypirates.com/privacy.html -> privacy.html @ 2026-09-12
  ok   https://playpastrypirates.com/rules.html -> rules.html @ 2026-09-12
sitemap_lastmod_check: FAIL — 1 problem(s) in sitemap.xml

  x https://playpastrypirates.com/ says lastmod 2026-09-12; git says index.html last changed 2026-09-13

  Regenerate it, never hand-type a date:  node scripts/qa/sitemap_write.mjs
```

## The voyages, in full

```
== solo-desktop: FAIL (voyage incomplete)
[1591s]    ✗ did not finish the voyage
[1591s]    ✗ 1 structural check failure(s): run×1 — first: solo card not clickable
[1591s]    ✗ leg error: solo card not clickable
[1591s] 
== solo-phone: FAIL (voyage incomplete)
[1591s]    ✗ did not finish the voyage
[1591s]    ✗ 1 structural check failure(s): run×1 — first: solo card not clickable
[1591s]    ✗ leg error: solo card not clickable
[1591s] 
== solo-tablet: FAIL (voyage incomplete)
[1591s]    ✗ did not finish the voyage
[1591s]    ✗ 1 structural check failure(s): run×1 — first: solo card not clickable
[1591s]    ✗ leg error: solo card not clickable
[1591s] 
== passplay-phone: PASS
[1591s]    coverage: yarrgh:1/1  nah:2/7  cinnamonchocolate fudge:1/1  spiced cocoa shortbread:0/2  cinnamonchocolate fudgeb:1/1  at the helm:26/26  vanilla bean crème brûlé:2/2  cinnamon snaps:0/2  start:1/1  sail square:26/26  muse#:10/26  menu:0/1  menu open:1/0  menu close:1/0  trade:10/22  speckled eggs:4/12  vanilla beans:3/13  coins only:4/10  slider:9/9  offer it:10/10  dough hook:2/2  walk away:2/8  flaky jack:3/5  cacao pods:4/12  dock:6/6  attack #:0/1  flip coin:6/6  accept:1/3  deny:1/4  peg leg meg:1/1  counter:1/2  coin:1/1  ask it:1/1  buy #:2/2  arrgh:1/1  sugar cane:4/6  slider disabled:2/2  #:2/2  cacao pods #:2/2  hot cinnamon:3/3
[1591s] 
== passplay-desktop: FAIL (voyage incomplete)
[1591s]    ✗ did not finish the voyage
[1591s]    ✗ 1 structural check failure(s): run×1 — first: pass&play card not clickable
[1591s]    ✗ vision judge FAILED 1 of 1 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-error.png — app stuck on loading screen, game UI never rendered
[1591s]    ✗ leg error: pass&play card not clickable
[1591s] 
== crew-desktop: FAIL (voyage incomplete)
[1591s]    ✗ did not finish the voyage
[1591s]    ✗ 1 structural check failure(s): run×1 — first: host card not clickable
[1591s]    ✗ leg error: host card not clickable
[1591s] 
== crew-phone: FAIL
[1591s]    ✗ offered but never exercised: walk away
[1591s]    ✗ vision judge FAILED 5 of 45 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-host-001-settled.png — large empty dead space below the game board taking up roughly a third of the screen, with no captains panel or any content there
       · crew-phone-guest-001-settled.png — large empty dead space below the game board taking up roughly a third of the screen, with no captains panel or any content there
       · crew-phone-host-002-settled.png — large empty dead space below the game board taking up roughly a third of the screen, with no captains panel or any content there
       · crew-phone-guest-002-settled.png — large empty dead space below the game board taking up roughly a third of the screen, with no captains panel or any content there
       · crew-phone-host-003-settled.png — large empty dead space below the game board taking up roughly a third of the screen, with no captains panel or any content there
[1591s]    coverage: yarrgh:1/1  nah:1/2  crispy cocoa snaps:1/1  cinnamon snaps:0/2  crispy cocoa snapsbake t:1/1  start:1/1  sail square:15/15  muse#:7/15  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:7/13  toasty wheat:2/9  hot cinnamon:4/11  coins only:4/7  slider:6/6  offer it:7/7  test#:1/1  walk away:0/2  slider disabled:1/1  arrgh:1/1  accept:1/1  counter:0/1  deny:0/1  fresh milk:2/4  speckled eggs:1/3  cacao pods:1/2  dock:1/1  flip coin:1/1  dough hook:1/1
[1591s] 
== solo-desktop-wk: FAIL
[1591s]    ✗ offered but never exercised: walk away
[1591s]    coverage: yarrgh:1/1  nah:1/2  cinnamonchocolate fudge:1/1  mexican chocolate pots:0/2  cinnamonchocolate fudgeb:1/1  start:1/1  sail square:30/30  muse#:10/21  menu:0/1  trade:10/20  cacao pods:2/11  coins only:5/9  slider:8/8  offer it:9/9  flaky jack:1/1  walk away:0/3  speckled eggs:5/16  crustbeard:1/1  vanilla beans:2/8  attack #:1/1  flip coin:1/1  toasty wheat:2/7  hot cinnamon:2/6  slider disabled:2/2  call crustbeard:1/4  call dough hook:1/2  fresh milk:2/6  call flaky jack:2/2  arrgh:1/1  dough hook:1/1
[1591s] 
== solo-phone-wk: FAIL
[1591s]    ✗ vision judge FAILED 3 of 40 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-wk-001-settled.png — large empty dead space filling bottom third of screen below the board/dialog, no captains panel rendered
       · solo-phone-wk-002-settled.png — large empty dead space filling bottom third of screen below the board, no captains panel rendered
       · solo-phone-wk-003-settled.png — large empty dead space below the recipe picker card, no captains panel rendered
[1591s]    coverage: yarrgh:1/1  nah:2/4  cocoa cloud soufflé:1/1  mexican chocolate torte:0/2  cocoa cloud soufflébake :1/1  start:1/1  sail square:32/32  trade:12/27  muse#:11/27  sugar cane:3/12  coins only:3/12  slider:12/12  offer it:12/12  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:3/13  hot cinnamon:2/12  crustbeard#:1/1  walk away:3/10  dock:3/3  flip coin:4/4  buy #:1/1  toasty wheat:3/14  fresh milk #:1/1  crustbeard:2/3  call crustbeard:2/5  call dough hook:0/1  speckled eggs:4/16  cacao pods:3/17  flaky jack:1/1  dough hook:3/6  vanilla beans:2/8  arrgh:1/1  call flaky jack:3/4  attack #:1/1  toasty wheat #:1/1  accept:1/1  counter:0/1  deny:0/1
[1591s] 
== solo-tablet-wk: PASS
[1591s]    coverage: yarrgh:1/1  nah:0/2  crispy cocoa snaps:1/1  mexican chocolate pots:0/2  crispy cocoa snapsbake t:1/1  start:1/1  sail square:27/27  trade:10/20  muse#:9/20  fresh milk:2/11  coins only:4/10  slider:10/10  offer it:10/10  flaky jack#:1/1  walk away:2/6  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:2/11  dough hook:2/4  hot cinnamon:2/8  call crustbeard:1/3  call flaky jack:1/2  cacao pods:3/9  call dough hook:1/1  arrgh:1/1  speckled eggs:5/9  flaky jack:1/1  vanilla beans:2/3  dock:1/1  flip coin:1/1  buy #:1/1
[1591s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
