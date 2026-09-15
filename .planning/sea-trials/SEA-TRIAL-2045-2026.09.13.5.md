# Sea trial v2 — build `2026.09.13.5` (tree `7c60cee5e2dd`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-13T21:40:04.587Z  ·  26 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **no game fault was measured. Read the split before acting on anything.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **0** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 5 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 5 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 1 | no |
> | browser-free checks (npm test) | green | - |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: assets/ingredients/dairy.png, assets/ingredients/holes/dairy.png, assets/ingredients/holes/sugar.webp, assets/ingredients/sugar.png, assets/plaque/crate-hollow.webp, assets/plaque/crate.webp, index.html, src/ui/board.js, src/ui/stage.js, src/ui/util.js
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
| **can the vision judge see?** | yes — checked just before sailing — the judge opened a real screenshot and described it |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

```
== solo-desktop: PASS
[1482s]    coverage: yarrgh:1/1  nah:1/2  pound cake:0/2  cinnamon dutch baby:1/1  cinnamon dutch babybake :1/1  start:1/1  sail square:16/16  trade:6/15  muse#:5/15  speckled eggs:1/7  vanilla beans:1/6  coins only:3/6  slider:6/6  offer it:6/6  menu:0/1  call flaky jack:1/1  call crustbeard:1/2  fresh milk:3/5  arrgh:1/1  attack #:3/3  flip coin:5/5  toasty wheat:3/5  flaky jack:1/1  walk away:0/2  dock:1/1  cacao pods:1/1  hot cinnamon:1/2  fire again #:1/1  break off:0/1  call dough hook:0/1  dough hook:1/1
[1482s] 
== solo-phone: FAIL
[1482s]    ✗ offered but never exercised: vanilla beans
[1482s]    coverage: yarrgh:1/1  nah:1/3  caramel slice:1/1  pound cake:0/2  caramel slicebake this:0/1  caramel slicebake this c:1/0  start:1/1  sail square:13/13  dock:2/3  muse#:4/11  flip coin:2/2  buy #:1/2  menu:0/1  menu open:1/0  menu close:1/0  trade:5/10  speckled eggs:1/6  fresh milk:1/5  coins only:2/5  slider:4/4  offer it:5/5  dough hook:1/1  walk away:0/2  toasty wheat:3/7  hot cinnamon:1/4  slider disabled:1/1  flaky jack:1/1  sugar cane:1/3  cacao pods:1/3  vanilla beans:0/3  call crustbeard:1/1  call dough hook:0/1
[1482s] 
== solo-tablet: FAIL
[1482s]    ✗ vision judge FAILED 3 of 25 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-011-settled.png — Davy Scones' own captain row shows a solid black box where the empty-hold crate silhouette should be (should be a faint/pale crate, not solid black)
       · solo-tablet-012-settled.png — Davy Scones' own captain row shows a solid black box where the empty-hold crate silhouette should be (should be a faint/pale crate, not solid black)
       · solo-tablet-024-settled.png — Davy Scones row in captains panel shows a solid black/opaque rectangle instead of ingredient icons or the faint empty-crate silhouette
[1482s]    coverage: yarrgh:1/1  nah:0/1  cinnamon snaps:0/2  mexican chocolate torte:1/1  mexican chocolate torteb:1/1  start:1/1  sail square:16/16  trade:8/16  muse#:7/16  cacao pods:1/8  coins only:4/8  slider:8/8  offer it:8/8  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:3/7  speckled eggs:3/9  hot cinnamon:2/7  dough hook:1/2  walk away:1/3  vanilla beans:1/6  flaky jack#:1/1  call crustbeard:1/1  call dough hook:0/2  accept:1/1  counter:0/1  deny:0/1  arrgh:1/1  fresh milk:2/2  call flaky jack:1/1  attack #:1/1  flip coin:1/1
[1482s] 
== passplay-phone: FAIL
[1482s]    ✗ vision judge FAILED 1 of 36 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-013-settled.png — battle text 'Davy Scones shows HEADS — Flaky Jack must' is truncated mid-sentence at the card's bottom edge
[1482s]    coverage: yarrgh:1/1  nah:3/5  mexican chocolate torte:1/1  molten chocolate lava ca:0/2  mexican chocolate torteb:1/1  at the helm:35/35  chocolate fudge torte:1/1  french pots de crème:0/2  chocolate fudge tortebak:1/1  start:1/1  sail square:50/50  attack #:1/2  trade:16/34  muse#:16/34  call davy scones:1/1  call flaky jack:0/1  flip coin:2/2  toasty wheat:4/18  coins only:6/13  slider:12/12  offer it:13/13  accept:2/5  counter:1/4  deny:2/6  davy scones:1/1  walk away:1/6  menu:0/1  menu open:1/0  menu close:1/0  hot cinnamon:3/16  dough hook:2/3  slider disabled:5/5  coin:1/1  ask it:1/1  dock:1/1  buy #:1/1  fresh milk:6/19  peg leg meg:1/1  flaky jack#:0/1  vanilla beans:3/11  cacao pods:3/10  arrgh:1/1  speckled eggs:7/7  dough hook#:1/1
[1482s] 
== passplay-desktop: FAIL
[1482s]    ✗ vision judge FAILED 6 of 28 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-016-settled.png — dark/black rectangular block in Peg Leg Meg's row of the captains panel is clipped by the row's rounded right corner, unlike the clean parchment-icon shown on the other three rows
       · passplay-desktop-017-settled.png — same dark/black rectangular block clipped at the right edge of Peg Leg Meg's row in the captains panel
       · passplay-desktop-018-settled.png — same dark/black rectangular block clipped at the right edge of Peg Leg Meg's row in the captains panel
       · passplay-desktop-019-settled.png — same dark/black rectangular block clipped at the right edge of Peg Leg Meg's row in the captains panel
       · passplay-desktop-020-settled.png — same dark/black rectangular block clipped at the right edge of Peg Leg Meg's row in the captains panel
       · passplay-desktop-021-settled.png — solid black/broken icon box on the right of the Peg Leg Meg row, inconsistent with the clear thumbnail icons shown on the other three rows
[1482s]    coverage: yarrgh:1/1  nah:11/12  cinnamon snaps:0/2  cocoa cloud soufflé:2/2  cocoa cloud soufflébake :2/2  at the helm:28/28  chocolate fudge torte:0/2  start:1/1  sail square:33/33  muse#:13/28  menu:0/1  trade:14/26  toasty wheat:4/16  vanilla beans:3/15  coins only:2/3  slider:3/3  offer it:3/3  flaky jack:2/4  walk away:2/6  attack #:1/1  call peg leg meg:1/1  call dough hook:0/1  flip coin:2/2  fire again #:1/1  break off:0/1  dough hook:2/2  hot cinnamon:7/11  slider disabled:11/11  fresh milk:4/8  speckled eggs:2/4  sugar cane:6/9
[1482s] 
== crew-desktop: FAIL
[1482s]    ✗ offered but never exercised: walk away
[1482s]    ✗ vision judge FAILED 1 of 51 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-host-002-settled.png — faint 'pick yer recipe:' prompt text is rendered clipped/obscured behind the egg island artwork instead of in a visible bubble; faint 'tap a recipe to see its route' tooltip text is clipped/obscured b
[1482s]    coverage: yarrgh:1/1  nah:0/1  crispy cocoa snaps:1/1  chocolate genoise sponge:0/2  crispy cocoa snapsbake t:1/1  start:1/1  sail square:21/21  trade:10/21  muse#:10/21  toasty wheat:4/12  coins only:8/10  slider:10/10  offer it:10/10  flaky jack#:1/1  walk away:0/3  accept:2/4  counter:1/4  deny:1/5  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  test#:1/1  coin:1/1  ask it:1/1  call flaky jack:1/1  call dough hook:0/1  arrgh:1/1  speckled eggs:2/7  dough hook:1/1  hot cinnamon:1/6  attack #:1/1  flip coin:1/1  vanilla beans:1/5  slider disabled:1/1  cacao pods:2/4  sugar cane:2/3
[1482s] 
== crew-phone: FAIL
[1482s]    ✗ offered but never exercised: deny
[1482s]    ✗ vision judge FAILED 1 of 43 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-guest-001-settled.png — two boat avatars in the top ribbon render as flat blank white/grey circles instead of showing a boat icon
[1482s]    coverage: yarrgh:1/1  nah:0/1  cocoa cloud soufflé:1/1  dark chocolate cream puf:0/2  cocoa cloud soufflébake :1/1  start:1/1  sail square:20/20  muse#:10/20  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  trade:10/18  toasty wheat:4/12  coins only:4/10  slider:11/11  offer it:10/10  flaky jack:1/1  walk away:1/5  accept:1/3  counter:1/2  deny:1/4  sugar cane:2/10  dough hook:2/3  test#:1/1  flaky jack#:0/1  cacao pods:2/6  arrgh:1/1  speckled eggs:2/5  hot cinnamon:5/9  coin:1/1  ask it:1/1  fresh milk:1/1
[1482s] 
== solo-desktop-wk: FAIL
[1482s]    ✗ offered but never exercised: walk away
[1482s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[1482s]    coverage: yarrgh:1/1  nah:0/1  caramel slice:1/1  french pots de crème:0/2  caramel slicebake this:0/1  caramel slicebake this c:1/0  start:1/1  sail square:16/16  attack #:2/2  trade:7/15  muse#:6/15  flip coin:5/5  fire again #:1/1  break off:0/1  menu:0/1  call crustbeard:1/1  call dough hook:1/2  fresh milk:2/12  speckled eggs:2/8  coins only:2/7  slider:7/7  offer it:7/7  arrgh:1/1  cacao pods:2/6  crustbeard:1/1  walk away:0/3  sugar cane:3/7  hot cinnamon:2/8  flaky jack:1/1  dough hook:1/1  toasty wheat:2/2  call flaky jack:0/1
[1482s] 
== solo-phone-wk: PASS
[1482s]    coverage: yarrgh:1/1  nah:2/5  mexican chocolate pots:1/1  cinnamon snaps:0/2  mexican chocolate potsba:1/1  start:1/1  sail square:21/21  muse#:7/19  menu:0/1  menu open:1/0  menu close:1/0  trade:8/18  fresh milk:4/10  coins only:3/8  slider:8/8  offer it:8/8  hot cinnamon:5/12  dough hook:1/1  walk away:0/2  sugar cane:2/5  call flaky jack:1/2  call crustbeard:1/3  flip coin:5/5  flee:1/1  stand yer ground:0/1  arrgh:1/1  speckled eggs:1/3  dock:4/4  buy #:1/1  #:1/1  toasty wheat:2/3  cacao pods:0/1  vanilla beans:1/2  flaky jack:1/1  call dough hook:1/1
[1482s] 
== solo-tablet-wk: FAIL
[1482s]    ✗ offered but never exercised: deny
[1482s]    coverage: yarrgh:1/1  nah:0/2  pound cake:1/1  cinnamonchocolate fudge:0/2  pound cakebake this:0/1  pound cakebake this comm:1/0  start:1/1  sail square:19/19  trade:7/14  muse#:6/14  sugar cane:3/10  cacao pods:1/8  hot cinnamon:1/6  coins only:3/7  slider:8/8  offer it:7/7  flaky jack:2/3  walk away:1/4  menu:0/1  menu open:1/0  menu close:1/0  accept:1/2  counter:1/2  deny:0/3  toasty wheat:4/10  dough hook#:1/1  vanilla beans:1/6  call crustbeard:1/1  call flaky jack:0/1  arrgh:1/1  coin:0/1  ask it:1/1  speckled eggs:2/3  dock:1/1  flip coin:1/1  buy #:1/1
[1482s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
