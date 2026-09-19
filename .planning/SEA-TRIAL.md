# Sea trial v2 — build `2026.09.19.1` (tree `27c90874e7d6`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-19T07:07:36.988Z  ·  93 min  ·  gear **FULL**  ·  sailed on **cloud container**

> ### WHAT THIS VERDICT MEANS
>
> **4 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **4** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 7 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 2 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | **RED** | docs or tooling can fail here. That is NOT the game. |
> | UNCLASSIFIED - a new verdict shape this table does not know | **1** | tell whoever added it to update sea_trial.mjs |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: .nvmrc, 404.html, package.json, sfx/home-waters/ambience/creak-1.mp3, sfx/home-waters/ambience/creak-2.mp3, sfx/home-waters/ambience/creak-3.mp3, sfx/home-waters/ambience/creak-4.mp3, sfx/home-waters/ambience/creak-5.mp3, sfx/home-waters/ambience/creak-6.mp3, sfx/home-waters/ambience/gull-1.mp3, sfx/home-waters/ambience/gull-2.mp3, sfx/home-waters/ambience/gull-3.mp3, sfx/home-waters/ambience/gull-4.mp3, sfx/home-waters/ambience/gull-5.mp3, sfx/home-waters/ambience/ocean-loop.mp3, sfx/home-waters/ceremony/award-whoosh.mp3, sfx/home-waters/ceremony/battle-won.mp3, sfx/home-waters/ceremony/card-swish.mp3, sfx/home-waters/ceremony/crate-chime.mp3, sfx/home-waters/ceremony/crate-marimba.mp3, sfx/home-waters/ceremony/crate-squawk.mp3, sfx/home-waters/ceremony/drumroll.mp3, sfx/home-waters/music/music-ocean.mp3, sfx/home-waters/voyage/abacus-click.mp3, sfx/home-waters/voyage/battle-swords.mp3, sfx/home-waters/voyage/bells.mp3, sfx/home-waters/voyage/cannon.mp3, sfx/home-waters/voyage/coin-chink.mp3, sfx/home-waters/voyage/coin-flip.mp3, sfx/home-waters/voyage/cork-pop.mp3, sfx/home-waters/voyage/fishing.mp3, sfx/home-waters/voyage/ship-move.mp3, sfx/home-waters/voyage/store-ingredient.mp3, sfx/home-waters/voyage/storm.mp3, src/engine/index.js, src/orchestrator.js, src/shared/index.js, src/shared/sounds.js, src/shared/words.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/popin.js, src/ui/stage.js, src/ui/util.js, src/ui/victory.js, wrangler.toml
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
| **voyages that only finished after a BROWSER RESTART** | **solo-desktop-wk ×6, solo-tablet-wk ×1** — the known WebKit crash in this container; each was resumed from the game's own save. A rescued leg is not a clean one. |


## The browser-free checks failed

**FAILING GATE:** `node scripts/tree_health_check.js`

```
tree_health_check — the suite's own paths must point at things that exist

  PASS  all 177 gate(s) named in the chain exist
  PASS  every static import in every gate resolves inside the repo
  PASS  no script builds a path into a top-level directory that does not exist
  FAIL  1 script line(s) name a machine instead of rooting off this module: scripts/qa/cloud_rig.mjs:40 names a machine — "/root/.ccr/ca-bundle.crt" exists on one computer; root off fileURLToPath(import.meta.url), or guard it with existsSync
  PASS  red-proof: catches a real static import, ignores a quoted search needle
  PASS  red-proof: goes red on all 4 spellings (quoted import, typed root, backtick, worktree name), stays quiet on a guarded CA path, a relative import and a browser URL

FAIL — 1 failure(s)
```

## The voyages, in full

```
== solo-desktop: PASS
[5338s]    coverage: yarrgh:1/1  nah:1/5  pound cake:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:21/21  trade:5/15  muse#:5/15  fresh milk:2/8  coins:4/5  slider:5/5  offer it:5/5  crustbeard:1/2  walk away:0/2  menu:0/1  flip coin:7/7  dock:4/6  hot cinnamon:1/4  vanilla beans:1/7  call dough hook:1/1  call flaky jack:0/1  sugar cane:2/7  speckled eggs:1/5  buy #:2/2  arrgh:1/1  #:1/1  accept:1/1  counter:0/1  deny:0/1  toasty wheat:2/5  cacao pods:1/2  dough hook:1/1  attack #:1/1
[5338s] 
== solo-phone: FAIL
[5338s]    ✗ vision judge FAILED 1 of 27 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-014-settled.png — coin icon jammed mid-sentence in narration bubble, overlapping/garbling the text ('Davy Scones — y[icon]ow HEADS —') instead of sitting cleanly between words
[5338s]    coverage: yarrgh:1/1  nah:0/2  spiced fudge brownies:0/2  dark chocolate cream puf:2/2  start:1/1  sail square:23/26  trade:9/19  muse#:8/19  toasty wheat:3/16  vanilla beans:2/10  coins:2/9  slider:9/9  offer it:9/9  menu:0/1  menu open:1/0  menu close:1/0  hot cinnamon:2/11  attack #:1/2  flip coin:2/2  dock:1/1  buy #:1/1  fresh milk:2/6  sugar cane:3/9  cacao pods:2/7  call crustbeard:1/1  call dough hook:0/2  flaky jack:2/3  walk away:1/4  arrgh:1/1  call flaky jack:1/1  speckled eggs:3/4  dough hook:1/1
[5338s] 
== solo-tablet: FAIL
[5338s]    ✗ vision judge FAILED 1 of 21 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-021-settled.png — Result modal overlaps the captains/recipe panel below it, truncating text mid-word on both edges (e.g. 'Mexican C…', 'Davy Scor…', 'Crustbear…')
[5338s]    coverage: yarrgh:1/1  nah:0/1  french pots de crème:0/2  mexican chocolate pots:1/1  mexican chocolate potsba:1/1  start:1/1  sail square:21/23  muse#:7/15  menu:0/1  menu open:1/0  menu close:1/0  attack #:1/1  trade:7/14  flip coin:2/2  call dough hook:1/1  call crustbeard:1/3  fresh milk:2/7  vanilla beans:1/8  coins:6/7  slider:6/6  offer it:7/7  dough hook:1/2  walk away:0/2  slider disabled:1/1  toasty wheat:1/5  speckled eggs:1/5  hot cinnamon:1/5  cacao pods:1/4  call flaky jack:1/2  sugar cane:1/2  arrgh:1/1  crustbeard#:1/1
[5338s] 
== passplay-phone: FAIL
[5338s]    ✗ vision judge FAILED 2 of 36 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-021-settled.png — coin icon in the narration bubble overlaps/obscures part of a word between 'Scones' and 'show' (reads '...ve show TAILS' with letters hidden behind the icon)
       · passplay-phone-024-settled.png — a third orange radial choice button is almost entirely hidden behind the bottom narration bubble, with only a sliver peeking out at the board's bottom edge
[5338s]    coverage: yarrgh:1/1  nah:8/9  crispy cocoa snaps:0/2  snickerdoodle bites:1/1  snickerdoodle bitesbake :1/1  at the helm:38/38  mexican chocolate pots:0/2  vanilla bean crème brûlé:2/2  start:1/1  sail square:41/41  muse#:17/38  trade:17/37  fresh milk:5/22  coins:6/11  slider:11/11  offer it:11/11  dough hook:3/4  walk away:2/9  menu:0/1  menu open:1/0  menu close:1/0  accept:1/2  counter:0/1  deny:1/2  davy scones:1/1  attack #:2/2  call davy scones:1/1  call dough hook:0/2  flip coin:5/5  call flaky jack:1/1  call peg leg meg:1/2  flee:1/1  stand yer ground:0/1  sugar cane:4/16  hot cinnamon:6/22  flaky jack:3/4  slider disabled:6/6  toasty wheat:6/15  cacao pods:4/11  dock:2/2  speckled eggs:4/7  arrgh:1/1
[5338s] 
== passplay-desktop: FAIL
[5338s]    ✗ offered but never exercised: cinnamon snaps, walk away, deny
[5338s]    ✗ vision judge FAILED 1 of 33 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-033-settled.png — 1st-place numeral on the podium riser is mostly hidden behind the winning boat's hull, showing only a stray fragment of the digit
[5338s]    coverage: yarrgh:1/1  nah:10/11  cinnamon snaps:0/4  pound cake:1/1  pound cakebake this:0/1  pound cakebake this comm:1/0  at the helm:35/35  cinnamon sponge cake:1/1  cinnamon sponge cakebake:1/1  start:1/1  sail square:38/38  muse#:15/34  call flaky jack:1/2  call dough hook:1/4  menu:0/1  trade:16/32  toasty wheat:3/17  coins:6/7  slider:4/4  offer it:7/7  dough hook:1/1  walk away:0/4  accept:1/2  counter:1/2  deny:0/3  davy scones:1/1  vanilla beans:12/26  flaky jack:1/2  dock:1/1  flip coin:3/3  coin:1/1  slider disabled:13/13  ask it:1/1  davy scones #:1/1  arrgh:1/1  cacao pods:3/11  speckled eggs:3/7  hot cinnamon:2/7  sugar cane:3/4  attack #:2/2  call davy scones:2/2
[5338s] 
== crew-desktop: FAIL (voyage incomplete)
[5338s]    ✗ did not finish the voyage
[5338s]    ✗ offered but never exercised: walk away
[5338s]    ✗ leg error: CDP call timed out after 120000ms: Runtime.evaluate
[5338s]    coverage: yarrgh:1/1  nah:0/2  french pots de crème:0/2  mexican chocolate torte:1/1  mexican chocolate torteb:1/1  start:1/1  sail square:15/16  muse#:4/11  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  trade:5/10  fresh milk:3/8  coins:2/4  slider:4/4  offer it:4/4  dough hook:2/4  walk away:1/3  accept:1/1  counter:0/1  deny:0/1  attack #:1/1  flaky jack:1/1  flip coin:2/2  dock:1/1  buy #:1/1  arrgh:1/1  toasty wheat:1/4  speckled eggs:1/4  cacao pods:1/4  hot cinnamon:1/2
[5338s] 
== crew-phone: FAIL
[5338s]    ✗ vision judge FAILED 1 of 62 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-guest-018-settled.png — dark translucent box over the board contains only a stray truncated 't' character, text clipped/unreadable inside its own box
[5338s]    coverage: yarrgh:1/1  nah:0/1  caramel slice:0/2  cinnamon dutch baby:1/1  cinnamon dutch babybake :1/1  start:1/1  sail square:26/30  trade:10/20  muse#:10/20  fresh milk:4/13  coins:4/10  slider:10/10  offer it:10/10  test#:1/2  walk away:1/6  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  flip coin:1/1  flee:1/1  stand yer ground:0/1  call test#:1/1  call dough hook:0/1  arrgh:1/1  accept:2/5  counter:2/5  deny:1/7  cacao pods:3/8  toasty wheat:3/7  hot cinnamon:1/5  flaky jack:2/2  coin:2/2  slider disabled:2/2  ask it:2/2  sugar cane:2/7  dough hook:1/1  speckled eggs:3/6  dough hook #:1/1
[5338s] 
== solo-desktop-wk: FAIL
[5338s]    ✗ 6 WebKit relaunch(es) over ? day(s) — above the 2 this voyage's length allows; that is a crash loop being ridden out, not a voyage
[5338s]    ✗ 1 structural check failure(s): no-pile×1 — first: overlapping controls: Crustbeard + 6/Flaky Jack + 6, Flaky Jack + 6/Walk away
[5338s]    ✱ 6 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5338s]    coverage: yarrgh:1/1  nah:0/1  molten chocolate lava ca:0/2  cinnamonsugar churros:1/1  cinnamonsugar churrosbak:1/1  start:1/1  sail square:41/45  muse#:9/19  menu:0/1  trade:10/18  sugar cane:2/10  hot cinnamon:2/10  coins:4/10  slider:10/10  offer it:10/10  toasty wheat:2/9  dough hook:1/2  walk away:1/5  accept:1/1  counter:0/1  deny:0/1  vanilla beans:3/10  call dough hook:1/2  call crustbeard:1/2  flaky jack:2/2  arrgh:1/1  call flaky jack:1/2  cacao pods:4/8  fresh milk:3/3  crustbeard #:1/1  flaky jack #:0/1
[5338s] 
== solo-phone-wk: FAIL
[5338s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "Fresh Milk" covers "What do ye WANT from the table" (paints over 4%
[5338s]    ✗ vision judge FAILED 1 of 21 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-wk-012-settled.png — 'Vanilla Beans' selection bubble straddles the board/captains-panel seam, half-clipped by the rope border and overlapping the recipe ingredient row beneath it
[5338s]    coverage: yarrgh:1/1  nah:0/2  caramel slice:0/2  cinnamon snaps:1/1  cinnamon snapsbake this:0/1  cinnamon snapsbake this :1/0  start:1/1  sail square:21/28  dock:1/1  muse#:6/14  flip coin:2/2  buy #:1/1  menu:0/1  menu open:1/0  menu close:1/0  trade:6/13  fresh milk:2/9  cacao pods:1/6  coins:4/6  slider:5/5  offer it:6/6  crustbeard:1/1  walk away:0/1  toasty wheat:2/5  sugar cane:1/5  slider disabled:1/1  speckled eggs:1/4  hot cinnamon:1/4  arrgh:1/1  attack #:1/1
[5338s] 
== solo-tablet-wk: FAIL
[5338s]    ✗ vision judge FAILED 1 of 26 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-wk-026-settled.png — Large empty dead space inside the white result dialog between the 'ye were FOUR ingredients' headline and the '1 of 5 crates' line — the box is much taller than its content needs
[5338s]    ✱ 1 WebKit relaunch(es) mid-voyage — the known WPEWebProcess SIGSEGV, resumed from the game's own solo save each time
[5338s]    coverage: yarrgh:1/1  nah:0/2  chocolate fudge torte:0/2  cocoa cloud soufflé:1/1  cocoa cloud soufflébake :1/1  start:1/1  sail square:26/35  dock:1/1  trade:8/17  muse#:8/17  flip coin:1/1  buy #:1/1  menu:0/1  menu open:1/0  menu close:1/0  toasty wheat:3/14  speckled eggs:2/8  cacao pods:1/8  coins:2/8  slider:8/8  offer it:8/8  dough hook:2/4  walk away:1/5  sugar cane:2/8  hot cinnamon:1/6  call dough hook:1/1  call crustbeard:1/2  fresh milk:2/7  vanilla beans:3/6  flaky jack:2/2  arrgh:1/1  call flaky jack:0/1
[5338s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
