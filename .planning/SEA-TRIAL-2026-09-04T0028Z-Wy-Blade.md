# Sea trial v2 — build `2026.09.03.4`

**FAILED** — 0 of 10 voyage(s) sailed, 10 NOT RUN  ·  2026-09-04T00:28:12.280Z  ·  2 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: behaviour can change in: src/engine/index.js
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
| voyages played with a real mouse | none |
| **voyages that did NOT run** | **solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk** |

## What did NOT run, and why

**solo-desktop**

```
vision judge FAILED 1 of 24 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-desktop-005-settled.png — speech bubble above ship is empty, no text content
6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 2.7s)
```

**solo-phone**

```
vision judge FAILED 2 of 24 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-012-settled.png — Attacker 'Dough Hook' battle card is a large mostly-empty box with only a thin horizontal line where a value/content should be, while the defender box properly shows a '?' placeholder
       · solo-phone-024-settled.png — award card text ('Davy Scones' caption) clipped/hidden behind the fixed 'Play again!' button
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**solo-tablet**

```
vision judge FAILED 3 of 24 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-002-settled.png — recipe-selection modal overlaps the captains panel below it, clipping mid-word ('Dav...' and 'Flaky Jack' text fragments visible sticking out from under the modal's bottom edge)
       · solo-tablet-003-settled.png — recipe-selection modal overlaps the captains panel below it, clipping mid-word ('Dav...' and 'Flaky Jack' text fragments visible sticking out from under the modal's bottom edge)
       · solo-tablet-023-settled.png — 'Arrgh!' reaction bubble floats detached over open water, centered with no tail anchoring it to any ship or the message box above it — only battle results are meant to be centered
9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
```

**passplay-phone**

```
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**passplay-desktop**

```
4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 2.7s)
```

**crew-desktop**

```
1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "Flaky Jack" over "Fer yer  Cacao Pods the table "
22 screen(s) never stopped moving before being checked (still moving: 22 geometry; longest wait 2.7s)
```

**crew-phone**

```
offered but never exercised: walk away
20 screen(s) never stopped moving before being checked (still moving: 20 geometry; longest wait 4.0s)
```

**solo-desktop-wk**

```
2 screen(s) never stopped moving before being checked (still moving: 2 geometry; longest wait 2.7s)
```

**solo-phone-wk**

```
vision judge FAILED 1 of 27 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-wk-025-settled.png — Davy Scones recipe row: 6th ingredient chip (cinnamon) crowded/overlapping the milk chip next to it, partial sliver visible between them
10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
```

**solo-tablet-wk**

```
offered but never exercised: vanilla beans
9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

```
[0s] [solo-desktop] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [solo-phone] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [solo-tablet] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [passplay-phone] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [passplay-desktop] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [crew-desktop] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [crew-phone] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [solo-desktop-wk] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [solo-phone-wk] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] [solo-tablet-wk] RESUMED — a complete result for build 2026.09.03.4 is already on record; not re-sailed
[0s] 
10 of 10 leg(s) were resumed from a previous attempt at this build — they were NOT re-sailed.
[0s] 
== solo-desktop: FAIL
[0s]    ✗ vision judge FAILED 1 of 24 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-desktop-005-settled.png — speech bubble above ship is empty, no text content
[0s]    ✗ 6 screen(s) never stopped moving before being checked (still moving: 6 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone: FAIL
[0s]    ✗ vision judge FAILED 2 of 24 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-012-settled.png — Attacker 'Dough Hook' battle card is a large mostly-empty box with only a thin horizontal line where a value/content should be, while the defender box properly shows a '?' placeholder
       · solo-phone-024-settled.png — award card text ('Davy Scones' caption) clipped/hidden behind the fixed 'Play again!' button
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet: FAIL
[0s]    ✗ vision judge FAILED 3 of 24 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-002-settled.png — recipe-selection modal overlaps the captains panel below it, clipping mid-word ('Dav...' and 'Flaky Jack' text fragments visible sticking out from under the modal's bottom edge)
       · solo-tablet-003-settled.png — recipe-selection modal overlaps the captains panel below it, clipping mid-word ('Dav...' and 'Flaky Jack' text fragments visible sticking out from under the modal's bottom edge)
       · solo-tablet-023-settled.png — 'Arrgh!' reaction bubble floats detached over open water, centered with no tail anchoring it to any ship or the message box above it — only battle results are meant to be centered
[0s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== passplay-phone: FAIL
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== passplay-desktop: FAIL
[0s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== crew-desktop: FAIL
[0s]    ✗ 1 structural check failure(s): no-cover-ask×1 — first: control covering the question it answers: "Flaky Jack" over "Fer yer  Cacao Pods the table "
[0s]    ✗ 22 screen(s) never stopped moving before being checked (still moving: 22 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== crew-phone: FAIL
[0s]    ✗ offered but never exercised: walk away
[0s]    ✗ 20 screen(s) never stopped moving before being checked (still moving: 20 geometry; longest wait 4.0s)
[0s]    coverage: 
[0s] 
== solo-desktop-wk: FAIL
[0s]    ✗ 2 screen(s) never stopped moving before being checked (still moving: 2 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone-wk: FAIL
[0s]    ✗ vision judge FAILED 1 of 27 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-wk-025-settled.png — Davy Scones recipe row: 6th ingredient chip (cinnamon) crowded/overlapping the milk chip next to it, partial sliver visible between them
[0s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet-wk: FAIL
[0s]    ✗ offered but never exercised: vanilla beans
[0s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
