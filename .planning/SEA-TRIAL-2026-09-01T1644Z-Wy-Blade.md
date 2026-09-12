# Sea trial v2 — build `2026.09.01.6`

**FAILED** — 0 of 10 voyage(s) sailed, 10 NOT RUN  ·  2026-09-01T16:44:08.272Z  ·  88 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: .claude-team/GREEN-step1.txt, .claude-team/RED-step1.txt, about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/shared/storyboard.js, src/shared/visibility.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | **FAIL** |
| **can the vision judge see?** | **NO** — **THE JUDGE CANNOT SEE** — every visual verdict below is worthless; the structural half still stands. } ·  · Node.js v22.15.1 |
| voyages played with a real mouse | none |
| **voyages that did NOT run** | **solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk** |

## What did NOT run, and why

**solo-desktop**

```
7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 3.6s)
vision pass DEFERRED for 22 screen(s) — queued for a session, NOT cleared
```

**solo-phone**

```
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
vision pass DEFERRED for 27 screen(s) — queued for a session, NOT cleared
```

**solo-tablet**

```
11 screen(s) never stopped moving before being checked (still moving: 11 geometry; longest wait 2.7s)
vision pass DEFERRED for 27 screen(s) — queued for a session, NOT cleared
```

**passplay-phone**

```
14 screen(s) never stopped moving before being checked (still moving: 14 geometry; longest wait 2.7s)
vision pass DEFERRED for 35 screen(s) — queued for a session, NOT cleared
```

**passplay-desktop**

```
offered but never exercised: deny
6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 2.7s)
vision pass DEFERRED for 38 screen(s) — queued for a session, NOT cleared
```

**crew-desktop**

```
26 screen(s) never stopped moving before being checked (still moving: 26 geometry; longest wait 2.7s)
vision pass DEFERRED for 61 screen(s) — queued for a session, NOT cleared
```

**crew-phone**

```
1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "test2" over "Fer yer  Speckled Eggs the tab"
offered but never exercised: deny
29 screen(s) never stopped moving before being checked (still moving: 29 geometry; longest wait 3.0s)
vision pass DEFERRED for 61 screen(s) — queued for a session, NOT cleared
```

**solo-desktop-wk**

```
5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
vision pass DEFERRED for 26 screen(s) — queued for a session, NOT cleared
```

**solo-phone-wk**

```
3 screen(s) never stopped moving before being checked (still moving: 3 geometry; longest wait 2.7s)
vision pass DEFERRED for 22 screen(s) — queued for a session, NOT cleared
```

**solo-tablet-wk**

```
5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
vision pass DEFERRED for 23 screen(s) — queued for a session, NOT cleared
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.

## The browser-free checks failed

```
PASS -- it names the branch and the upstream it checked
PASS -- detached HEAD is REFUSED (exit 1)
PASS -- it says the words that identify the fault, not a code
PASS -- it gives the rescue-branch-FIRST repair, in order
PASS -- a branch with no upstream is REFUSED (exit 1)
PASS -- it names the missing upstream rather than blaming the branch
PASS -- a rebase in progress is REFUSED (exit 1)
PASS -- a non-repo exits 2, distinct from a push failure's 1

FAIL -- it is reported as a REBASE, not merely as detachment — different cause, different repair: ON BRANCH "side" BUT IT HAS NO UPSTREAM — a push would need a target named by hand,
and an unattended watch has nobody to name it. Set one: `git push -u origin 
FAIL -- it leaves the decision to a human (continue or abort), never guessing: ON BRANCH "side" BUT IT HAS NO UPSTREAM — a push would need a target named by hand,
and an unattended watch has nobody to name it. Set one: `git push -u origin side`.
FAIL can_push_check — the publish guard does not catch the trees that strand work.
```

## The voyages, in full

```
[12s]   [solo-phone] DAY 0
[12s]   [solo-desktop] DAY 0
[25s]   [solo-phone] DAY 1
[29s]   [solo-desktop] DAY 1
[32s]   [solo-phone] note: still moving at the cap (2652ms) — checked anyway
[51s]   [solo-desktop] note: still moving at the cap (3555ms) — checked anyway
[65s]   [solo-phone] DAY 2
[88s]   [solo-desktop] note: still moving at the cap (2639ms) — checked anyway
[106s]   [solo-desktop] DAY 2
[136s]   [solo-phone] DAY 3
[141s]   [solo-desktop] DAY 3
[148s]   [solo-phone] note: still moving at the cap (2675ms) — checked anyway
[156s]   [solo-phone] note: still moving at the cap (2681ms) — checked anyway
[174s]   [solo-phone] note: still moving at the cap (2638ms) — checked anyway
[195s]   [solo-desktop] note: still moving at the cap (2652ms) — checked anyway
[199s]   [solo-desktop] DAY 4
[212s]   [solo-phone] DAY 4
[237s]   [solo-desktop] DAY 5
[285s]   [solo-desktop] note: still moving at the cap (2647ms) — checked anyway
[292s]   [solo-phone] DAY 5
[293s]   [solo-desktop] note: still moving at the cap (2651ms) — checked anyway
[298s]   [solo-desktop] DAY 6
[305s]   [solo-phone] note: still moving at the cap (2680ms) — checked anyway
[306s]   [solo-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[338s]   [solo-phone] DAY 6
[339s]   [solo-desktop] DAY 7
[375s]   [solo-phone] DAY 7
[379s]   [solo-desktop] note: still moving at the cap (2651ms) — checked anyway
[385s]   [solo-desktop] DAY 8
[422s]   [solo-phone] DAY 8
[441s]   [solo-desktop] DAY 9
[469s]   [solo-phone] DAY 9
[485s]   [solo-desktop] note: still moving at the cap (2635ms) — checked anyway
[489s]   [solo-desktop] DAY 10
[510s]   [solo-phone] DAY 10
[531s]   [solo-desktop] DAY 11
[547s]   [solo-phone] DAY 11
[576s]   [solo-desktop] DAY 12
[587s]   [solo-phone] DAY 12
[614s]   [solo-desktop] DAY 13
[624s]   [solo-phone] DAY 13
[664s]   [solo-phone] DAY 14
[671s]   [solo-desktop] DAY 14
[708s]   [solo-phone] DAY 15
[718s]   [solo-desktop] END OF VOYAGE at day 14
[718s]   [solo-desktop] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[718s] [solo-desktop] 22 screen(s) queued for a session to judge
[729s]   [solo-tablet] DAY 0
[747s]   [solo-tablet] DAY 1
[750s]   [solo-phone] DAY 16
[763s]   [solo-tablet] note: still moving at the cap (2673ms) — checked anyway
[768s]   [solo-tablet] note: still moving at the cap (2654ms) — checked anyway
[774s]   [solo-tablet] note: still moving at the cap (2662ms) — checked anyway
[780s]   [solo-tablet] note: still moving at the cap (2641ms) — checked anyway
[786s]   [solo-tablet] note: still moving at the cap (2677ms) — checked anyway
[788s]   [solo-phone] DAY 17
[808s]   [solo-tablet] DAY 2
[831s]   [solo-phone] DAY 18
[835s]   [solo-tablet] note: still moving at the cap (2664ms) — checked anyway
[858s]   [solo-tablet] DAY 3
[864s]   [solo-phone] DAY 19
[881s]   [solo-phone] note: still moving at the cap (2643ms) — checked anyway
[902s]   [solo-tablet] DAY 4
[912s]   [solo-phone] DAY 20
[956s]   [solo-phone] DAY 21
[960s]   [solo-tablet] DAY 5
[1001s]   [solo-tablet] DAY 6
[1017s]   [solo-phone] DAY 22
[1047s]   [solo-tablet] DAY 7
[1054s]   [solo-phone] DAY 23
[1067s]   [solo-phone] note: still moving at the cap (2643ms) — checked anyway
[1067s]   [solo-tablet] note: still moving at the cap (2679ms) — checked anyway
[1099s]   [solo-phone] DAY 24
[1120s]   [solo-tablet] DAY 8
[1163s]   [solo-phone] DAY 25
[1168s]   [solo-phone] note: still moving at the cap (2691ms) — checked anyway
[1175s]   [solo-tablet] DAY 9
[1213s]   [solo-tablet] DAY 10
[1217s]   [solo-phone] DAY 26
[1247s]   [solo-tablet] note: still moving at the cap (2625ms) — checked anyway
[1273s]   [solo-tablet] DAY 11
[1288s]   [solo-phone] END OF VOYAGE at day 26
[1288s]   [solo-phone] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[1288s] [solo-phone] 27 screen(s) queued for a session to judge
[1298s]   [solo-tablet] note: still moving at the cap (2606ms) — checked anyway
[1299s]   [passplay-phone] DAY 0
[1305s]   [solo-tablet] note: still moving at the cap (2605ms) — checked anyway
[1305s]   [solo-tablet] slider deliberately disabled at 0 — nowhere to move, not a dead control
[1320s]   [passplay-phone] DAY 1
[1328s]   [solo-tablet] DAY 12
[1337s]   [passplay-phone] note: still moving at the cap (2676ms) — checked anyway
[1341s]   [passplay-phone] note: still moving at the cap (2664ms) — checked anyway
[1367s]   [passplay-phone] DAY 2
[1373s]   [solo-tablet] DAY 13
[1417s]   [passplay-phone] note: still moving at the cap (2665ms) — checked anyway
[1421s]   [passplay-phone] note: still moving at the cap (2659ms) — checked anyway
[1424s]   [solo-tablet] DAY 14
[1428s]   [passplay-phone] note: still moving at the cap (2674ms) — checked anyway
[1432s]   [passplay-phone] DAY 3
[1461s]   [passplay-phone] note: still moving at the cap (2706ms) — checked anyway
[1463s]   [solo-tablet] DAY 15
[1467s]   [passplay-phone] note: still moving at the cap (2642ms) — checked anyway
[1498s]   [passplay-phone] note: still moving at the cap (2653ms) — checked anyway
[1510s]   [passplay-phone] note: still moving at the cap (2655ms) — checked anyway
[1512s]   [solo-tablet] DAY 16
[1514s]   [passplay-phone] DAY 4
[1536s]   [passplay-phone] note: still moving at the cap (2643ms) — checked anyway
[1561s]   [passplay-phone] DAY 5
[1580s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[1584s]   [solo-tablet] DAY 17
[1613s]   [solo-tablet] note: still moving at the cap (2671ms) — checked anyway
[1614s]   [passplay-phone] note: still moving at the cap (2676ms) — checked anyway
[1619s]   [passplay-phone] DAY 6
[1641s]   [solo-tablet] DAY 18
[1661s]   [passplay-phone] note: still moving at the cap (2648ms) — checked anyway
[1669s]   [passplay-phone] DAY 7
[1711s]   [solo-tablet] END OF VOYAGE at day 18
[1711s]   [solo-tablet] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[1711s] [solo-tablet] 27 screen(s) queued for a session to judge
[1721s]   [passplay-phone] DAY 8
[1722s]   [passplay-desktop] DAY 0
[1748s]   [passplay-desktop] DAY 1
[1754s]   [passplay-desktop] note: still moving at the cap (2693ms) — checked anyway
[1761s]   [passplay-phone] note: still moving at the cap (2661ms) — checked anyway
[1819s]   [passplay-phone] DAY 9
[1827s]   [passplay-desktop] DAY 2
[1858s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[1863s]   [passplay-phone] DAY 10
[1881s]   [passplay-desktop] DAY 3
[1902s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[1906s]   [passplay-phone] DAY 11
[1907s]   [passplay-desktop] slider deliberately disabled at 0 — nowhere to move, not a dead control
[1937s]   [passplay-desktop] note: still moving at the cap (2658ms) — checked anyway
[1943s]   [passplay-desktop] note: still moving at the cap (2638ms) — checked anyway
[1945s]   [passplay-desktop] DAY 4
[1946s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[1951s]   [passplay-phone] DAY 12
[1968s]   [passplay-desktop] slider deliberately disabled at 0 — nowhere to move, not a dead control
[1989s]   [passplay-desktop] DAY 5
[1997s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[2001s]   [passplay-phone] DAY 13
[2011s]   [passplay-desktop] slider deliberately disabled at 0 — nowhere to move, not a dead control
[2039s]   [passplay-desktop] DAY 6
[2040s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[2044s]   [passplay-phone] DAY 14
[2087s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[2091s]   [passplay-phone] DAY 15
[2098s]   [passplay-desktop] DAY 7
[2130s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[2134s]   [passplay-phone] DAY 16
[2143s]   [passplay-desktop] DAY 8
[2186s]   [passplay-desktop] DAY 9
[2205s]   [passplay-phone] slider deliberately disabled at 1 — nowhere to move, not a dead control
[2213s]   [passplay-phone] note: still moving at the cap (2695ms) — checked anyway
[2217s]   [passplay-phone] DAY 17
[2263s]   [passplay-desktop] DAY 10
[2285s]   [passplay-phone] END OF VOYAGE at day 17
[2285s]   [passplay-phone] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[2285s] [passplay-phone] 35 screen(s) queued for a session to judge
[2288s]   [passplay-desktop] note: still moving at the cap (2645ms) — checked anyway
[2289s]   [passplay-desktop] slider deliberately disabled at 1 — nowhere to move, not a dead control
[2293s] [crew-desktop] room VRQE created by test1
[2301s] [crew-desktop] test2 joined VRQE
[2307s]   [crew-desktop-host] DAY 0
[2307s]   [crew-desktop-guest] DAY 0
[2308s]   [passplay-desktop] DAY 11
[2322s]   [crew-desktop-guest] DAY 1
[2323s]   [crew-desktop-host] DAY 1
[2338s]   [crew-desktop-guest] note: still moving at the cap (2624ms) — checked anyway
[2346s]   [crew-desktop-guest] note: still moving at the cap (2650ms) — checked anyway
[2355s]   [passplay-desktop] DAY 12
[2366s]   [crew-desktop-host] note: still moving at the cap (2643ms) — checked anyway
[2375s]   [crew-desktop-host] note: still moving at the cap (2664ms) — checked anyway
[2380s]   [passplay-desktop] note: still moving at the cap (2679ms) — checked anyway
[2381s]   [crew-desktop-host] note: still moving at the cap (2660ms) — checked anyway
[2387s]   [crew-desktop-host] note: still moving at the cap (2691ms) — checked anyway
[2401s]   [crew-desktop-guest] DAY 2
[2401s]   [crew-desktop-host] DAY 2
[2404s]   [passplay-desktop] DAY 13
[2420s]   [crew-desktop-guest] note: still moving at the cap (2662ms) — checked anyway
[2449s]   [passplay-desktop] DAY 14
[2460s]   [crew-desktop-host] DAY 3
[2460s]   [crew-desktop-guest] DAY 3
[2480s]   [crew-desktop-guest] note: still moving at the cap (2675ms) — checked anyway
[2498s]   [passplay-desktop] DAY 15
[2523s]   [passplay-desktop] note: still moving at the cap (2620ms) — checked anyway
[2524s]   [passplay-desktop] slider deliberately disabled at 0 — nowhere to move, not a dead control
[2530s]   [crew-desktop-guest] DAY 4
[2530s]   [crew-desktop-host] DAY 4
[2548s]   [passplay-desktop] DAY 16
[2553s]   [crew-desktop-guest] note: still moving at the cap (2633ms) — checked anyway
[2562s]   [crew-desktop-guest] note: still moving at the cap (2718ms) — checked anyway
[2568s]   [passplay-desktop] slider deliberately disabled at 0 — nowhere to move, not a dead control
[2577s]   [crew-desktop-host] note: still moving at the cap (2662ms) — checked anyway
[2591s]   [passplay-desktop] DAY 17
[2601s]   [crew-desktop-host] DAY 5
[2601s]   [crew-desktop-guest] DAY 5
[2613s]   [passplay-desktop] slider deliberately disabled at 0 — nowhere to move, not a dead control
[2636s]   [passplay-desktop] DAY 18
[2646s]   [crew-desktop-guest] DAY 6
[2647s]   [crew-desktop-host] DAY 6
[2663s]   [crew-desktop-host] note: still moving at the cap (2680ms) — checked anyway
[2663s]   [passplay-desktop] slider deliberately disabled at 0 — nowhere to move, not a dead control
[2703s]   [passplay-desktop] END OF VOYAGE at day 18
[2703s]   [passplay-desktop] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[2703s] [passplay-desktop] 38 screen(s) queued for a session to judge
[2712s] [crew-phone] room HJYF created by test1
[2717s]   [crew-desktop-host] DAY 7
[2718s]   [crew-desktop-guest] DAY 7
[2720s] [crew-phone] test2 joined HJYF
[2725s]   [crew-phone-host] DAY 0
[2725s]   [crew-phone-guest] DAY 0
[2737s]   [crew-phone-guest] DAY 1
[2739s]   [crew-phone-host] DAY 1
[2756s]   [crew-desktop-guest] note: still moving at the cap (2701ms) — checked anyway
[2767s]   [crew-phone-guest] note: still moving at the cap (2716ms) — checked anyway
[2771s]   [crew-phone-guest] note: still moving at the cap (3006ms) — checked anyway
[2782s]   [crew-phone-guest] note: still moving at the cap (2623ms) — checked anyway
[2794s]   [crew-desktop-guest] DAY 8
[2794s]   [crew-desktop-host] DAY 8
[2795s]   [crew-phone-host] note: still moving at the cap (2720ms) — checked anyway
[2803s]   [crew-phone-host] note: still moving at the cap (2679ms) — checked anyway
[2814s]   [crew-phone-host] DAY 2
[2814s]   [crew-phone-guest] DAY 2
[2841s]   [crew-phone-guest] note: still moving at the cap (2706ms) — checked anyway
[2842s]   [crew-desktop-guest] DAY 9
[2842s]   [crew-desktop-host] DAY 9
[2847s]   [crew-phone-guest] note: still moving at the cap (2704ms) — checked anyway
[2851s]   [crew-phone-guest] note: still moving at the cap (2639ms) — checked anyway
[2864s]   [crew-desktop-guest] note: still moving at the cap (2625ms) — checked anyway
[2870s]   [crew-phone-host] DAY 3
[2870s]   [crew-phone-guest] DAY 3
[2889s]   [crew-desktop-host] DAY 10
[2889s]   [crew-desktop-guest] DAY 10
[2912s]   [crew-phone-guest] note: still moving at the cap (2673ms) — checked anyway
[2918s]   [crew-phone-host] note: still moving at the cap (2648ms) — checked anyway
[2918s]   [crew-phone-host] STRUCT FAIL no-cover-ask: control covering the question it answers: "test2" over "Fer yer  Speckled Eggs the tab"
[2918s]   [crew-desktop-guest] note: still moving at the cap (2607ms) — checked anyway
[2922s]   [crew-phone-host] DAY 4
[2922s]   [crew-phone-guest] DAY 4
[2953s]   [crew-phone-guest] note: still moving at the cap (2612ms) — checked anyway
[2965s]   [crew-desktop-guest] DAY 11
[2965s]   [crew-desktop-host] DAY 11
[2970s]   [crew-phone-host] DAY 5
[2970s]   [crew-phone-guest] DAY 5
[2987s]   [crew-desktop-guest] note: still moving at the cap (2605ms) — checked anyway
[3009s]   [crew-desktop-host] note: still moving at the cap (2611ms) — checked anyway
[3011s]   [crew-phone-host] note: still moving at the cap (2712ms) — checked anyway
[3017s]   [crew-phone-host] DAY 6
[3017s]   [crew-phone-guest] DAY 6
[3025s]   [crew-desktop-guest] DAY 12
[3025s]   [crew-desktop-host] DAY 12
[3060s]   [crew-phone-host] DAY 7
[3060s]   [crew-phone-guest] DAY 7
[3074s]   [crew-desktop-guest] note: still moving at the cap (2675ms) — checked anyway
[3079s]   [crew-desktop-guest] DAY 13
[3079s]   [crew-desktop-host] DAY 13
[3089s]   [crew-phone-guest] note: still moving at the cap (2704ms) — checked anyway
[3107s]   [crew-desktop-guest] note: still moving at the cap (2659ms) — checked anyway
[3114s]   [crew-phone-guest] note: still moving at the cap (2676ms) — checked anyway
[3131s]   [crew-desktop-guest] note: still moving at the cap (2650ms) — checked anyway
[3137s]   [crew-phone-host] DAY 8
[3137s]   [crew-phone-guest] DAY 8
[3137s]   [crew-desktop-guest] note: still moving at the cap (2701ms) — checked anyway
[3152s]   [crew-desktop-guest] DAY 14
[3153s]   [crew-desktop-host] DAY 14
[3164s]   [crew-phone-guest] note: still moving at the cap (2691ms) — checked anyway
[3174s]   [crew-phone-guest] note: still moving at the cap (2630ms) — checked anyway
[3189s]   [crew-phone-host] DAY 9
[3189s]   [crew-phone-guest] DAY 9
[3199s]   [crew-desktop-guest] DAY 15
[3200s]   [crew-desktop-host] DAY 15
[3246s]   [crew-desktop-host] DAY 16
[3246s]   [crew-desktop-guest] DAY 16
[3251s]   [crew-phone-host] note: still moving at the cap (2673ms) — checked anyway
[3255s]   [crew-phone-host] DAY 10
[3256s]   [crew-phone-guest] DAY 10
[3285s]   [crew-desktop-host] note: still moving at the cap (2604ms) — checked anyway
[3292s]   [crew-desktop-host] note: still moving at the cap (2607ms) — checked anyway
[3294s]   [crew-phone-host] DAY 11
[3294s]   [crew-phone-guest] DAY 11
[3308s]   [crew-desktop-guest] DAY 17
[3308s]   [crew-desktop-host] DAY 17
[3326s]   [crew-phone-guest] note: still moving at the cap (2715ms) — checked anyway
[3330s]   [crew-desktop-guest] note: still moving at the cap (2665ms) — checked anyway
[3334s]   [crew-phone-guest] note: still moving at the cap (2732ms) — checked anyway
[3351s]   [crew-phone-host] note: still moving at the cap (2710ms) — checked anyway
[3360s]   [crew-phone-guest] note: still moving at the cap (2699ms) — checked anyway
[3369s]   [crew-desktop-host] DAY 18
[3369s]   [crew-phone-guest] DAY 12
[3369s]   [crew-phone-host] DAY 12
[3369s]   [crew-desktop-guest] DAY 18
[3408s]   [crew-desktop-host] DAY 19
[3408s]   [crew-phone-host] DAY 13
[3408s]   [crew-phone-guest] DAY 13
[3408s]   [crew-desktop-guest] DAY 19
[3444s]   [crew-phone-host] note: still moving at the cap (2613ms) — checked anyway
[3464s]   [crew-desktop-host] note: still moving at the cap (2607ms) — checked anyway
[3464s]   [crew-phone-host] note: still moving at the cap (2675ms) — checked anyway
[3471s]   [crew-phone-host] DAY 14
[3471s]   [crew-phone-guest] DAY 14
[3494s]   [crew-desktop-host] DAY 20
[3494s]   [crew-desktop-guest] DAY 20
[3512s]   [crew-phone-host] DAY 15
[3512s]   [crew-phone-guest] DAY 15
[3516s]   [crew-desktop-guest] note: still moving at the cap (2606ms) — checked anyway
[3541s]   [crew-phone-guest] note: still moving at the cap (2704ms) — checked anyway
[3560s]   [crew-desktop-guest] END OF VOYAGE at day 20
[3560s]   [crew-desktop-guest] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[3563s]   [crew-phone-host] note: still moving at the cap (2705ms) — checked anyway
[3565s]   [crew-desktop-host] END OF VOYAGE at day 20
[3565s]   [crew-desktop-host] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[3565s] [crew-desktop] 61 screen(s) queued for a session to judge
[3568s]   [crew-phone-host] DAY 16
[3568s]   [crew-phone-guest] DAY 16
[3582s]   [solo-desktop-wk] DAY 0
[3599s]   [solo-desktop-wk] DAY 1
[3605s]   [solo-desktop-wk] note: still moving at the cap (2718ms) — checked anyway
[3609s]   [crew-phone-host] DAY 17
[3609s]   [crew-phone-guest] DAY 17
[3636s]   [crew-phone-guest] note: still moving at the cap (2681ms) — checked anyway
[3642s]   [solo-desktop-wk] DAY 2
[3653s]   [solo-desktop-wk] note: still moving at the cap (2738ms) — checked anyway
[3664s]   [crew-phone-guest] DAY 18
[3664s]   [crew-phone-host] DAY 18
[3694s]   [solo-desktop-wk] DAY 3
[3703s]   [crew-phone-host] DAY 19
[3703s]   [crew-phone-guest] DAY 19
[3706s]   [solo-desktop-wk] note: still moving at the cap (2727ms) — checked anyway
[3755s]   [crew-phone-host] note: still moving at the cap (2620ms) — checked anyway
[3764s]   [crew-phone-guest] note: still moving at the cap (2695ms) — checked anyway
[3780s]   [solo-desktop-wk] DAY 4
[3783s]   [crew-phone-host] DAY 20
[3783s]   [crew-phone-guest] DAY 20
[3824s]   [solo-desktop-wk] DAY 5
[3839s]   [crew-phone-host] DAY 21
[3839s]   [crew-phone-guest] DAY 21
[3864s]   [solo-desktop-wk] DAY 6
[3899s]   [crew-phone-host] note: still moving at the cap (2722ms) — checked anyway
[3905s]   [solo-desktop-wk] DAY 7
[3915s]   [crew-phone-host] DAY 22
[3915s]   [crew-phone-guest] DAY 22
[3920s]   [solo-desktop-wk] note: still moving at the cap (2690ms) — checked anyway
[3952s]   [solo-desktop-wk] DAY 8
[3971s]   [crew-phone-guest] END OF VOYAGE at day 22
[3971s]   [crew-phone-guest] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[3976s]   [crew-phone-host] END OF VOYAGE at day 22
[3976s]   [crew-phone-host] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[3980s] [crew-phone] 61 screen(s) queued for a session to judge
[3992s]   [solo-phone-wk] DAY 0
[3995s]   [solo-desktop-wk] DAY 9
[4006s]   [solo-phone-wk] DAY 1
[4017s]   [solo-phone-wk] note: still moving at the cap (2655ms) — checked anyway
[4054s]   [solo-desktop-wk] DAY 10
[4079s]   [solo-phone-wk] DAY 2
[4090s]   [solo-desktop-wk] DAY 11
[4094s]   [solo-phone-wk] note: still moving at the cap (2609ms) — checked anyway
[4104s]   [solo-desktop-wk] note: still moving at the cap (2736ms) — checked anyway
[4138s]   [solo-desktop-wk] DAY 12
[4169s]   [solo-phone-wk] DAY 3
[4177s]   [solo-desktop-wk] DAY 13
[4187s]   [solo-phone-wk] note: still moving at the cap (2643ms) — checked anyway
[4220s]   [solo-phone-wk] DAY 4
[4235s]   [solo-desktop-wk] DAY 14
[4258s]   [solo-phone-wk] DAY 5
[4301s]   [solo-phone-wk] DAY 6
[4314s]   [solo-desktop-wk] DAY 15
[4340s]   [solo-phone-wk] DAY 7
[4370s]   [solo-desktop-wk] DAY 16
[4396s]   [solo-phone-wk] DAY 8
[4424s]   [solo-desktop-wk] DAY 17
[4432s]   [solo-phone-wk] DAY 9
[4473s]   [solo-desktop-wk] END OF VOYAGE at day 17
[4473s]   [solo-desktop-wk] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[4473s] [solo-desktop-wk] 26 screen(s) queued for a session to judge
[4480s]   [solo-phone-wk] DAY 10
[4487s]   [solo-tablet-wk] DAY 0
[4510s]   [solo-tablet-wk] DAY 1
[4550s]   [solo-phone-wk] DAY 11
[4566s]   [solo-tablet-wk] note: still moving at the cap (2670ms) — checked anyway
[4586s]   [solo-tablet-wk] note: still moving at the cap (2718ms) — checked anyway
[4593s]   [solo-tablet-wk] note: still moving at the cap (2685ms) — checked anyway
[4599s]   [solo-tablet-wk] DAY 2
[4609s]   [solo-phone-wk] DAY 12
[4641s]   [solo-tablet-wk] DAY 3
[4657s]   [solo-phone-wk] END OF VOYAGE at day 12
[4657s]   [solo-phone-wk] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[4657s] [solo-phone-wk] 22 screen(s) queued for a session to judge
[4685s]   [solo-tablet-wk] DAY 4
[4725s]   [solo-tablet-wk] DAY 5
[4776s]   [solo-tablet-wk] DAY 6
[4833s]   [solo-tablet-wk] DAY 7
[4875s]   [solo-tablet-wk] DAY 8
[4923s]   [solo-tablet-wk] DAY 9
[4966s]   [solo-tablet-wk] DAY 10
[4998s]   [solo-tablet-wk] note: still moving at the cap (2620ms) — checked anyway
[5015s]   [solo-tablet-wk] note: still moving at the cap (2617ms) — checked anyway
[5022s]   [solo-tablet-wk] DAY 11
[5066s]   [solo-tablet-wk] DAY 12
[5123s]   [solo-tablet-wk] DAY 13
[5174s]   [solo-tablet-wk] DAY 14
[5232s]   [solo-tablet-wk] END OF VOYAGE at day 14
[5232s]   [solo-tablet-wk] end of voyage: already captured and checked as an ordinary screen — not recorded twice
[5232s] [solo-tablet-wk] 23 screen(s) queued for a session to judge
[5232s] 
== solo-desktop: FAIL
[5232s]    ✗ 7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 3.6s)
[5232s]    ✗ vision pass DEFERRED for 22 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  spiced cocoa shortbreadb:2/2  snickerdoodle bitespillo:0/2  start:1/1  call crustbeard:1/2  call dough hook:0/1  sail square:14/14  trade:7/14  muse#:7/14  fresh milk:1/7  vanilla beans:3/7  coins only:2/7  slider:7/7  offer it:7/7  menu:0/1  cacao pods:2/5  hot cinnamon:3/8  dough hook#:1/1  walk away:1/4  dough hook:1/1  toasty wheat:1/4  call flaky jack:1/1  flaky jack:1/2  crystal sugar:1/2  speckled eggs:1/1
[5232s] 
== solo-phone: FAIL
[5232s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 27 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  molten chocolate lava ca:2/2  snickerdoodle bitespillo:0/2  start:1/1  sail square:26/26  muse#:13/26  menu:0/1  menu open:1/0  menu close:1/0  trade:13/25  cacao pods:2/13  coins only:5/13  slider:12/12  offer it:13/13  dough hook:1/2  walk away:1/5  flip coin:1/1  crystal sugar:6/20  crustbeard:1/1  call flaky jack:1/3  call crustbeard:1/2  call dough hook:1/1  slider disabled:1/1  speckled eggs:4/11  hot cinnamon:2/10  vanilla beans:1/8  fresh milk:3/8  toasty wheat:3/6  dough hook#:1/1  flaky jack:1/1
[5232s] 
== solo-tablet: FAIL
[5232s]    ✗ 11 screen(s) never stopped moving before being checked (still moving: 11 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 27 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  chocolate fudge tortea p:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:21/21  trade:8/18  muse#:8/18  hot cinnamon:3/14  coins only:3/7  slider:7/7  offer it:7/7  menu:0/1  menu open:1/0  menu close:1/0  fresh milk:2/7  cacao pods:2/10  call crustbeard:2/3  call dough hook:1/3  crystal sugar:1/5  attack #:2/2  flip coin:3/3  fire again #:1/1  break off:0/1  toasty wheat:4/10  speckled eggs:2/5  crustbeard:1/1  walk away:0/2  vanilla beans:1/4  slider disabled:1/1  nah:1/1  dough hook:1/1
[5232s] 
== passplay-phone: FAIL
[5232s]    ✗ 14 screen(s) never stopped moving before being checked (still moving: 14 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 35 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:1/1  cinnamon sponge cakea fl:2/2  caramel slicea toastedco:0/2  at the helm:35/35  french pots de crèmeluxu:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:44/44  muse#:16/35  menu:0/1  menu open:1/0  menu close:1/0  trade:16/32  fresh milk:6/18  coins only:12/15  slider:7/7  offer it:15/15  dough hook:1/2  walk away:1/5  accept:2/4  counter:1/3  deny:1/5  peg leg meg:1/1  coin:1/1  ask it:1/1  vanilla beans:2/11  slider disabled:9/9  dock:2/2  flip coin:4/4  buy #:1/1  nah:1/2  toasty wheat:3/9  cacao pods:2/9  flaky jack:1/1  call dough hook:1/1  call peg leg meg:1/2  attack #:1/1  call flaky jack:0/1  speckled eggs:3/5  crystal sugar:1/2  hot cinnamon:1/2  davy scones:1/1
[5232s] 
== passplay-desktop: FAIL
[5232s]    ✗ offered but never exercised: deny
[5232s]    ✗ 6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 38 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  mexican chocolate tortea:2/2  cinnamonchocolate fudgea:0/2  at the helm:36/36  snickerdoodle bitespillo:2/2  dark chocolate cream puf:0/2  start:1/1  sail square:41/41  dock:1/1  muse#:16/36  flip coin:4/4  buy #:1/1  nah:7/8  trade:17/35  vanilla beans:4/17  coins only:5/10  slider:10/10  offer it:10/10  accept:1/2  counter:1/2  deny:0/3  peg leg meg:1/1  walk away:2/8  menu:0/1  speckled eggs:5/21  cacao pods:6/28  dough hook:3/5  slider disabled:8/8  flaky jack:2/2  coin:1/1  ask it:1/1  attack #:2/2  call davy scones:1/1  call flaky jack:0/1  crystal sugar:5/11  fresh milk:6/10  hot cinnamon:2/4  toasty wheat:2/3
[5232s] 
== crew-desktop: FAIL
[5232s]    ✗ 26 screen(s) never stopped moving before being checked (still moving: 26 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 61 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  dark chocolate cream puf:2/2  chocolate genoise sponge:0/2  start:1/1  sail square:20/20  trade:7/20  muse#:7/20  fresh milk:3/14  coins only:2/7  slider:8/8  offer it:7/7  menu:0/1  chat:1/1  chat open:1/0  chat close:1/0  dock:6/8  flip coin:6/6  buy #:3/4  nah:2/6  accept:2/4  counter:1/4  deny:1/5  call test#:3/5  call flaky jack:2/5  crystal sugar:2/6  speckled eggs:2/13  hot cinnamon:2/11  dough hook:1/1  walk away:0/2  cacao pods:1/4  coin:1/1  ask it:1/1  # crates:1/1  hot cinnamon #:1/1  toasty wheat:2/3  flaky jack:1/1  vanilla beans:1/1
[5232s] 
== crew-phone: FAIL
[5232s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "test2" over "Fer yer  Speckled Eggs the tab"
[5232s]    ✗ offered but never exercised: deny
[5232s]    ✗ 29 screen(s) never stopped moving before being checked (still moving: 29 geometry; longest wait 3.0s)
[5232s]    ✗ vision pass DEFERRED for 61 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  cinnamon dutch babya dra:2/2  french pots de crèmeluxu:0/2  start:1/1  sail square:22/22  trade:11/22  muse#:10/22  crystal sugar:2/10  speckled eggs:3/9  coins only:4/11  slider:12/12  offer it:11/11  menu:0/1  menu open:1/0  menu close:1/0  chat:1/1  chat open:1/0  chat close:1/0  vanilla beans:3/11  test#:1/1  walk away:1/4  fresh milk:4/11  cacao pods:1/8  call test#:1/2  call flaky jack:0/1  call dough hook:1/1  dough hook:1/2  toasty wheat:4/7  accept:1/2  counter:1/2  deny:0/3  dough hook#:1/1  hot cinnamon:1/2  attack #:1/1  flip coin:1/1  coin:1/1  ask it:1/1
[5232s] 
== solo-desktop-wk: FAIL
[5232s]    ✗ 5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 26 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  cinnamonsugar churroscri:2/2  cocoa cloud souffléan ai:0/2  start:1/1  sail square:20/20  muse#:7/17  menu:0/1  trade:7/16  toasty wheat:3/9  fresh milk:1/8  coins only:4/7  slider:7/7  offer it:7/7  attack #:3/3  flip coin:3/3  call flaky jack:1/2  call dough hook:0/1  crystal sugar:1/5  vanilla beans:1/6  speckled eggs:3/8  hot cinnamon:2/6  cacao pods:1/4  dough hook:1/1  walk away:0/1  call crustbeard:1/1
[5232s] 
== solo-phone-wk: FAIL
[5232s]    ✗ 3 screen(s) never stopped moving before being checked (still moving: 3 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 22 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  chocolate fudge tortea p:2/2  spiced fudge browniesdee:0/2  start:1/1  sail square:26/27  muse#:6/12  call dough hook:1/3  call crustbeard:1/2  menu:0/1  menu open:1/0  menu close:1/0  trade:6/11  cacao pods:1/6  vanilla beans:1/6  coins only:2/6  slider:6/6  offer it:6/6  speckled eggs:3/7  flaky jack:1/1  walk away:0/2  toasty wheat:3/5  dough hook:1/1  fresh milk:1/2  hot cinnamon:1/2  call flaky jack:1/1
[5232s] 
== solo-tablet-wk: FAIL
[5232s]    ✗ 5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
[5232s]    ✗ vision pass DEFERRED for 23 screen(s) — queued for a session, NOT cleared
[5232s]    coverage: arrgh:2/2  pound cakea dense rich b:2/2  chocolate fudge tortea p:0/2  start:1/1  call flaky jack:1/1  call crustbeard:0/1  sail square:18/18  trade:7/14  muse#:6/14  vanilla beans:1/7  coins only:3/7  slider:7/7  offer it:7/7  menu:0/1  menu open:1/0  menu close:1/0  speckled eggs:2/6  toasty wheat:4/9  crystal sugar:1/3  dough hook:1/1  walk away:0/1  dock:1/1  flip coin:1/1  buy #:1/1  nah:0/1  fresh milk:2/4  cacao pods:1/4  accept:1/1  counter:0/1  deny:0/1  hot cinnamon:0/1
[5232s] 
RESULT: FAIL
[5232s] WROTE C:\Users\wyatt\Projects\pastrypirates\sea-trial-shots\judge-queue.json — 342 screen(s) awaiting a session's eyes.
[5232s]   A session should read that file; it carries its own instructions and the rubric.
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
