> # ⚠ THIS REPORT IS NOT TRUSTWORTHY. READ THIS BEFORE ITS TABLE.
>
> **Its NOT-RUN line says `none`. That is false.** Its own log carries NINE
> `playwright not found` errors: all three Safari legs died without starting in the run this
> report describes. The NOT-RUN column is the one thing a trial report must never get wrong
> (rule 24 stands on opening this file and believing it), and `sea_trial.mjs`’s own comment calls
> this exact line "the most misleading line in the repo".
>
> **How it happened:** a leg is RESUMED whenever a record exists at the same build stamp, and the
> resumed record carries the SCREENS OF THE RUN THAT MADE IT. This report then read those screens
> as proof the leg had sailed — a leg vouched for by its own ghost from an earlier run. Found by
> CEO Review 64, 2026-09-01, and fixed the same morning: records now carry the id of the run that
> produced them, and only this run’s screens can clear a leg (`scripts/qa/notrun_provenance_check.mjs`).
>
> **Also wrong here:** the header says `03:07:33Z · 315 min`, but this file was written at 08:22Z —
> the process that hung at 03:07Z finished and overwrote a later run’s report five hours after it
> stopped producing anything.
>
> **What actually holds, verified separately:** ten leg records at build `2026.08.31.2` each say
> `finished: true`, and the voyages are real (Safari reached day 25; crew-desktop day 14 with host
> and guest in step). But that was assembled from FOUR playtest_gate runs, not sailed as one trial,
> and 83% of screens were never seen by the vision judge. **Do not call this a passed trial.**

# Sea trial v2 — build `2026.08.31.2`

**FAILED** — 10 of 10 voyage(s) sailed  ·  2026-09-01T03:07:33.927Z  ·  315 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: .claude-team/GREEN-step1.txt, .claude-team/RED-step1.txt, about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/shared/storyboard.js, src/shared/visibility.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| **can the vision judge see?** | n/a — not asked for (--judge=off) |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk |
| **voyages that did NOT run** | none |



## The voyages, in full

> ⚠ **10 leg(s) sailed but have NO verdict printed below: solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk.**
> Their result exists in `sea-trial-shots/log.txt` and did not reach this file. Do not read their
> absence as a pass — go and read the log.

```
[0s] [solo-desktop] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [solo-phone] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [solo-tablet] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [passplay-phone] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[12s]   [passplay-desktop] DAY 0
[35s]   [passplay-desktop] DAY 1
[48s]   [passplay-desktop] note: still moving at the cap (2709ms) — checked anyway
[80s]   [passplay-desktop] DAY 2
[92s]   [passplay-desktop] note: still moving at the cap (2643ms) — checked anyway
[136s]   [passplay-desktop] DAY 3
[171s]   [passplay-desktop] DAY 4
[210s]   [passplay-desktop] DAY 5
[251s]   [passplay-desktop] DAY 6
[268s]   [passplay-desktop] note: still moving at the cap (2647ms) — checked anyway
[297s]   [passplay-desktop] DAY 7
[321s]   [passplay-desktop] note: still moving at the cap (2690ms) — checked anyway
[342s]   [passplay-desktop] DAY 8
[362s]   [passplay-desktop] note: still moving at the cap (2665ms) — checked anyway
[383s]   [passplay-desktop] note: still moving at the cap (2674ms) — checked anyway
[419s]   [passplay-desktop] DAY 9
[444s]   [passplay-desktop] note: still moving at the cap (2639ms) — checked anyway
[463s]   [passplay-desktop] DAY 10
[496s]   [passplay-desktop] DAY 11
[553s]   [passplay-desktop] DAY 12
[577s]   [passplay-desktop] note: still moving at the cap (2656ms) — checked anyway
[591s]   [passplay-desktop] note: still moving at the cap (2685ms) — checked anyway
[638s]   [passplay-desktop] DAY 13
[673s]   [passplay-desktop] DAY 14
[725s]   [passplay-desktop] DAY 15
[743s]   [passplay-desktop] note: still moving at the cap (2646ms) — checked anyway
[787s]   [passplay-desktop] DAY 16
[837s]   [passplay-desktop] DAY 17
[849s]   [passplay-desktop] note: still moving at the cap (2695ms) — checked anyway
[885s]   [passplay-desktop] DAY 18
[934s]   [passplay-desktop] END OF VOYAGE at day 18
[934s]   [passplay-desktop] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[943s] [crew-phone] room TAJT created by test1
[951s] [crew-phone] test2 joined TAJT
[956s]   [crew-phone-host] DAY 0
[956s]   [crew-phone-guest] DAY 0
[967s]   [crew-phone-guest] DAY 1
[968s]   [crew-phone-host] DAY 1
[974s]   [crew-phone-guest] note: still moving at the cap (2688ms) — checked anyway
[974s]   [crew-phone-guest] STRUCT FAIL on-screen: clickable off-screen: sailCell
[974s]   [crew-phone-guest] STRUCT FAIL sail-clickable: 1 sail square(s) covered: a sail square <- nothing (outside any element)
[974s]   [crew-phone-guest] during-animation only (not a failure) not-occluded: clickable covered by something else: sailCell <- covered by .pp4BubIn <div>
[978s]   [crew-phone-guest] note: still moving at the cap (3017ms) — checked anyway
[986s]   [crew-phone-host] note: still moving at the cap (2644ms) — checked anyway
[1009s]   [crew-phone-guest] DAY 2
[1010s]   [crew-phone-host] DAY 2
[1019s]   [crew-phone-guest] note: still moving at the cap (2630ms) — checked anyway
[1023s]   [crew-phone-guest] note: still moving at the cap (2696ms) — checked anyway
[1048s]   [crew-phone-host] note: still moving at the cap (2631ms) — checked anyway
[1067s]   [crew-phone-host] DAY 3
[1068s]   [crew-phone-guest] DAY 3
[1112s]   [crew-phone-host] DAY 4
[1112s]   [crew-phone-guest] DAY 4
[1121s]   [crew-phone-guest] note: still moving at the cap (2643ms) — checked anyway
[1148s]   [crew-phone-guest] note: still moving at the cap (2659ms) — checked anyway
[1156s]   [crew-phone-guest] note: still moving at the cap (2648ms) — checked anyway
[1190s]   [crew-phone-host] DAY 5
[1190s]   [crew-phone-guest] DAY 5
[1211s]   [crew-phone-guest] note: still moving at the cap (2621ms) — checked anyway
[1217s]   [crew-phone-host] note: still moving at the cap (2671ms) — checked anyway
[1229s]   [crew-phone-host] DAY 6
[1230s]   [crew-phone-guest] DAY 6
[1270s]   [crew-phone-host] DAY 7
[1270s]   [crew-phone-guest] DAY 7
[1294s]   [crew-phone-host] note: still moving at the cap (2615ms) — checked anyway
[1310s]   [crew-phone-host] DAY 8
[1310s]   [crew-phone-guest] DAY 8
[1339s]   [crew-phone-guest] DAY 9
[1339s]   [crew-phone-host] DAY 9
[1367s]   [crew-phone-guest] DAY 10
[1367s]   [crew-phone-host] DAY 10
[1407s]   [crew-phone-guest] DAY 11
[1408s]   [crew-phone-host] DAY 11
[1440s]   [crew-phone-host] DAY 12
[1440s]   [crew-phone-guest] DAY 12
[1455s]   [crew-phone-host] note: still moving at the cap (2623ms) — checked anyway
[1460s]   [crew-phone-guest] note: still moving at the cap (2695ms) — checked anyway
[1478s]   [crew-phone-guest] DAY 13
[1478s]   [crew-phone-host] DAY 13
[1513s]   [crew-phone-guest] DAY 14
[1513s]   [crew-phone-host] DAY 14
[1525s]   [crew-phone-guest] note: still moving at the cap (2667ms) — checked anyway
[1533s]   [crew-phone-guest] note: still moving at the cap (2709ms) — checked anyway
[1551s]   [crew-phone-guest] DAY 15
[1551s]   [crew-phone-host] DAY 15
[1574s]   [crew-phone-host] note: still moving at the cap (2631ms) — checked anyway
[1586s]   [crew-phone-host] DAY 16
[1586s]   [crew-phone-guest] DAY 16
[1598s]   [crew-phone-guest] note: still moving at the cap (2635ms) — checked anyway
[1624s]   [crew-phone-guest] DAY 17
[1625s]   [crew-phone-host] DAY 17
[1642s]   [crew-phone-host] note: still moving at the cap (2655ms) — checked anyway
[1662s]   [crew-phone-host] DAY 18
[1662s]   [crew-phone-guest] DAY 18
[1710s]   [crew-phone-guest] DAY 19
[1711s]   [crew-phone-host] DAY 19
[1750s]   [crew-phone-guest] DAY 20
[1750s]   [crew-phone-host] DAY 20
[1795s]   [crew-phone-host] DAY 21
[1796s]   [crew-phone-guest] DAY 21
[1834s]   [crew-phone-guest] END OF VOYAGE at day 21
[1834s]   [crew-phone-guest] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[1839s]   [crew-phone-host] END OF VOYAGE at day 21
[1839s]   [crew-phone-host] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[1840s] [solo-desktop-wk] ERROR: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
[1840s] [solo-phone-wk] ERROR: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
[1840s] [solo-tablet-wk] ERROR: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
Warning: Detected unsettled top-level await at file:///C:/Users/wyatt/Projects/pastrypirates/scripts/playtest_gate.mjs:571
{ let next = 0, resumed = 0, done = 0; markProgress(0); await Promise.all(Array.from({ length: Math.min(PAR, LEGS.length) }, async () => {
                                                        ^
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
