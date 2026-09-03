# Sea trial v2 — build `2026.09.03.1`

**FAILED** — 0 of 10 voyage(s) sailed, 10 NOT RUN  ·  2026-09-03T09:12:30.822Z  ·  2 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: behaviour can change in: package.json
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| **can the vision judge see?** | yes — checked just before sailing — the judge opened a real screenshot and described it |
| voyages played with a real mouse | none |
| **voyages that did NOT run** | **solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk** |

## What did NOT run, and why

**solo-desktop**

```
offered but never exercised: deny
vision judge FAILED 1 of 30 screen(s) it looked at
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**solo-phone**

```
vision judge FAILED 1 of 21 screen(s) it looked at
10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
```

**solo-tablet**

```
vision judge FAILED 3 of 29 screen(s) it looked at
9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
```

**passplay-phone**

```
22 screen(s) never stopped moving before being checked (still moving: 22 geometry; longest wait 2.8s)
```

**passplay-desktop**

```
1 screen(s) never stopped moving before being checked (still moving: 1 geometry; longest wait 2.6s)
```

**crew-desktop**

```
14 screen(s) never stopped moving before being checked (still moving: 14 geometry; longest wait 2.7s)
```

**crew-phone**

```
offered but never exercised: walk away
vision judge FAILED 1 of 51 screen(s) it looked at
15 screen(s) never stopped moving before being checked (still moving: 15 geometry; longest wait 3.0s)
```

**solo-desktop-wk**

```
offered but never exercised: vanilla beans
vision judge FAILED 1 of 27 screen(s) it looked at
5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
```

**solo-phone-wk**

```
6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 2.7s)
```

**solo-tablet-wk**

```
offered but never exercised: walk away
vision judge FAILED 3 of 22 screen(s) it looked at
2 screen(s) never stopped moving before being checked (still moving: 2 geometry; longest wait 2.7s)
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

```
[0s] [solo-desktop] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [solo-phone] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [solo-tablet] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [passplay-phone] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [passplay-desktop] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [crew-desktop] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [crew-phone] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [solo-desktop-wk] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [solo-phone-wk] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] [solo-tablet-wk] RESUMED — a complete result for build 2026.09.03.1 is already on record; not re-sailed
[0s] 
10 of 10 leg(s) were resumed from a previous attempt at this build — they were NOT re-sailed.
[0s] 
== solo-desktop: FAIL
[0s]    ✗ offered but never exercised: deny
[0s]    ✗ vision judge FAILED 1 of 30 screen(s) it looked at
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone: FAIL
[0s]    ✗ vision judge FAILED 1 of 21 screen(s) it looked at
[0s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet: FAIL
[0s]    ✗ vision judge FAILED 3 of 29 screen(s) it looked at
[0s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== passplay-phone: FAIL
[0s]    ✗ 22 screen(s) never stopped moving before being checked (still moving: 22 geometry; longest wait 2.8s)
[0s]    coverage: 
[0s] 
== passplay-desktop: FAIL
[0s]    ✗ 1 screen(s) never stopped moving before being checked (still moving: 1 geometry; longest wait 2.6s)
[0s]    coverage: 
[0s] 
== crew-desktop: FAIL
[0s]    ✗ 14 screen(s) never stopped moving before being checked (still moving: 14 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== crew-phone: FAIL
[0s]    ✗ offered but never exercised: walk away
[0s]    ✗ vision judge FAILED 1 of 51 screen(s) it looked at
[0s]    ✗ 15 screen(s) never stopped moving before being checked (still moving: 15 geometry; longest wait 3.0s)
[0s]    coverage: 
[0s] 
== solo-desktop-wk: FAIL
[0s]    ✗ offered but never exercised: vanilla beans
[0s]    ✗ vision judge FAILED 1 of 27 screen(s) it looked at
[0s]    ✗ 5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone-wk: FAIL
[0s]    ✗ 6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet-wk: FAIL
[0s]    ✗ offered but never exercised: walk away
[0s]    ✗ vision judge FAILED 3 of 22 screen(s) it looked at
[0s]    ✗ 2 screen(s) never stopped moving before being checked (still moving: 2 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
