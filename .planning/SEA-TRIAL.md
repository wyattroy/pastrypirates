# Sea trial v2 — build `2026.09.15.2` (tree `e6f5fafca82e`)

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-15T05:17:28.540Z  ·  40 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> ### WHAT THIS VERDICT MEANS
>
> **10 leg(s) hit a REAL game fault. Fix those; the rest of the red below is noise.**
>
> | | count | act on it? |
> |---|---|---|
> | **real game faults** - a player is affected | **10** | **YES** |
> | judge findings - a WITNESS, not a verdict (QA-PROCESS s6) | 1 | open the screenshot, then check docs/INTENDED-BEHAVIOUR.md |
> | never exercised / never judged - UNTESTED, not broken | 0 | no - this is the NOT-RUN column, for actions |
> | seen only during an animation - the report says so itself | 0 | no |
> | browser-free checks (npm test) | green | - |

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: index.html, package.json, rules.html, sfx/abacus-click.mp3, sfx/award-whoosh.mp3, sfx/card-swish.mp3, sfx/cork-pop.mp3, sfx/crate-chime.mp3, sfx/crate-marimba.mp3, sfx/crate-squawk.mp3, src/engine/index.js, src/orchestrator.js, src/shared/index.js, src/shared/words.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/course.js, src/ui/flow.js, src/ui/lobby.js, src/ui/panel.js, src/ui/pilot.js, src/ui/popin.js, src/ui/press.js, src/ui/pulsebeacon.js, src/ui/recipe.js, src/ui/stage.js, src/ui/util.js
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
== solo-desktop: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== solo-phone: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== solo-tablet: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== passplay-phone: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== passplay-desktop: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== crew-desktop: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    ✗ vision judge FAILED 2 of 4 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-host-002-settled.png — faint ghost/ghost-text watermark visible over the water near board center, looks like leftover debug or tooltip text bleeding through
       · crew-desktop-guest-002-settled.png — faint ghost/ghost-text watermark visible over the water near board center (readable fragments like 'Dread' and '...te to see route'), looks like leftover debug or tooltip text bleeding through
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== crew-phone: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== solo-desktop-wk: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== solo-phone-wk: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
== solo-tablet-wk: FAIL (voyage incomplete)
[2269s]    ✗ did not finish the voyage
[2269s]    coverage: yarrgh:1/1  nah:0/1
[2269s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
