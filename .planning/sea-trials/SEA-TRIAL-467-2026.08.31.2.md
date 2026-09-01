# Sea trial v2 — build `2026.08.31.2`

**FAILED** — 0 of 10 voyage(s) sailed, 10 NOT RUN  ·  2026-09-01T10:00:00.956Z  ·  1 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: .claude-team/GREEN-step1.txt, .claude-team/RED-step1.txt, about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/shared/storyboard.js, src/shared/visibility.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| **can the vision judge see?** | **NO** — **THE JUDGE CANNOT SEE** — every visual verdict below is worthless; the structural half still stands. } ·  · Node.js v22.15.1 |
| voyages played with a real mouse | none |
| **voyages that did NOT run** | **solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk** |

## What did NOT run, and why

**solo-desktop**

```
6 screen(s) never stopped moving before being checked
```

**solo-phone**

```
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**solo-tablet**

```
6 screen(s) never stopped moving before being checked
```

**passplay-phone**

```
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**passplay-desktop**

```
11 screen(s) never stopped moving before being checked
```

**crew-desktop**

```
9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
```

**crew-phone**

```
2 structural check failure(s): on-screen×1, sail-clickable×1 — first: clickable off-screen: sailCell
offered but never exercised: walk away
1 observation(s) seen only DURING an animation — not failures, read them in the log
19 screen(s) never stopped moving before being checked
```

**solo-desktop-wk**

```
7 screen(s) never stopped moving before being checked
```

**solo-phone-wk**

```
5 screen(s) never stopped moving before being checked
```

**solo-tablet-wk**

```
1 console error(s): ERR WebSocket connection to 'wss://pastry-pirates-default-rtdb.firebaseio.com/.ws?v=5&p=1:546790679465:web:cdb72aa39660fca844dab8' failed: WebSocket network error: error code 56
5 screen(s) never stopped moving before being checked
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

```
[0s] [solo-desktop] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [solo-phone] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [solo-tablet] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [passplay-phone] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [passplay-desktop] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [crew-desktop] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [crew-phone] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [solo-desktop-wk] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [solo-phone-wk] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] [solo-tablet-wk] RESUMED — a complete result for build 2026.08.31.2 is already on record; not re-sailed
[0s] 
10 of 10 leg(s) were resumed from a previous attempt at this build — they were NOT re-sailed.
[0s] 
== solo-desktop: FAIL
[0s]    ✗ 6 screen(s) never stopped moving before being checked
[0s]    coverage: 
[0s] 
== solo-phone: FAIL
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet: FAIL
[0s]    ✗ 6 screen(s) never stopped moving before being checked
[0s]    coverage: 
[0s] 
== passplay-phone: FAIL
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== passplay-desktop: FAIL
[0s]    ✗ 11 screen(s) never stopped moving before being checked
[0s]    coverage: 
[0s] 
== crew-desktop: FAIL
[0s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== crew-phone: FAIL
[0s]    ✗ 2 structural check failure(s): on-screen×1, sail-clickable×1 — first: clickable off-screen: sailCell
[0s]    ✗ offered but never exercised: walk away
[0s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[0s]    ✗ 19 screen(s) never stopped moving before being checked
[0s]    coverage: 
[0s] 
== solo-desktop-wk: FAIL
[0s]    ✗ 7 screen(s) never stopped moving before being checked
[0s]    coverage: 
[0s] 
== solo-phone-wk: FAIL
[0s]    ✗ 5 screen(s) never stopped moving before being checked
[0s]    coverage: 
[0s] 
== solo-tablet-wk: FAIL
[0s]    ✗ 1 console error(s): ERR WebSocket connection to 'wss://pastry-pirates-default-rtdb.firebaseio.com/.ws?v=5&p=1:546790679465:web:cdb72aa39660fca844dab8' failed: WebSocket network error: error code 56
[0s]    ✗ 5 screen(s) never stopped moving before being checked
[0s]    coverage: 
[0s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
