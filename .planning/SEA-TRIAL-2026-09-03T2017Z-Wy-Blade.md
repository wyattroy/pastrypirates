# Sea trial v2 — build `2026.09.03.3`

**FAILED** — 0 of 10 voyage(s) sailed, 10 NOT RUN  ·  2026-09-03T20:17:45.122Z  ·  2 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: behaviour can change in: src/ui/stage.js
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
offered but never exercised: hot cinnamon
4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 2.7s)
```

**solo-phone**

```
1 screen(s) never stopped moving before being checked (still moving: 1 geometry; longest wait 2.7s)
```

**solo-tablet**

```
vision judge FAILED 2 of 26 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-002-settled.png — recipe-choice modal's rounded bottom-left corner cuts across the captains list behind it, leaving 'Davy Scones' and 'Dough Hook' rows sliced mid-word instead of fully hidden or fully shown
       · solo-tablet-003-settled.png — recipe-choice modal's rounded bottom-left corner cuts across the captains list behind it, leaving 'Davy Scones' and 'Dough Hook' rows sliced mid-word instead of fully hidden or fully shown
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.8s)
```

**passplay-phone**

```
vision judge FAILED 2 of 27 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-023-settled.png — coin/flip card shows a ghosted, offset duplicate outline behind it (doubled rendering)
       · passplay-phone-027-settled.png — award card text ('Bertie Scones' captain name) clipped by the card's own bottom border, cut mid-letter; right award card 'Peg Leg Meg' text crowded flush against card bottom edge with no padding
9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
```

**passplay-desktop**

```
offered but never exercised: walk away
vision judge FAILED 3 of 29 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-008-settled.png — empty white speech bubble with tail near the ship, no text or content inside
       · passplay-desktop-020-settled.png — stacked answer bubbles (Crystal Sugar / pink ingredient icon / coins-only) overlap each other, edges touching/overlapping instead of clear gaps
       · passplay-desktop-023-settled.png — bottom line of Broadside Battle card text is cut off/clipped by the card's own bottom edge
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**crew-desktop**

```
2 moment(s) where the two captains saw different games: whose turn (host lights Dough, guest lights test1); captains (Dough: host 12 vs guest 11   (row ORDER differs by design and is not part of this finding))
vision judge FAILED 1 of 40 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-host-005-settled.png — empty narration speech bubble with no text, anchored to teal ship
13 screen(s) never stopped moving before being checked (still moving: 13 geometry; longest wait 2.7s)
```

**crew-phone**

```
offered but never exercised: deny
20 screen(s) never stopped moving before being checked (still moving: 20 geometry; longest wait 2.7s)
```

**solo-desktop-wk**

```
7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 2.7s)
```

**solo-phone-wk**

```
2 structural check failure(s): not-occluded×1, no-pile×1 — first: clickable covered by something else: Call Dough Hook <- covered by . <b>
vision judge FAILED 1 of 29 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-wk-028-settled.png — left 'Call Dough Hook' selection circle is overlapped and its label text clipped by the front 'Call Crustbeard' circle
7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 2.7s)
```

**solo-tablet-wk**

```
offered but never exercised: vanilla beans
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

```
[0s] [solo-desktop] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [solo-phone] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [solo-tablet] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [passplay-phone] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [passplay-desktop] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [crew-desktop] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [crew-phone] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [solo-desktop-wk] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [solo-phone-wk] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] [solo-tablet-wk] RESUMED — a complete result for build 2026.09.03.3 is already on record; not re-sailed
[0s] 
10 of 10 leg(s) were resumed from a previous attempt at this build — they were NOT re-sailed.
[0s] 
== solo-desktop: FAIL
[0s]    ✗ offered but never exercised: hot cinnamon
[0s]    ✗ 4 screen(s) never stopped moving before being checked (still moving: 4 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone: FAIL
[0s]    ✗ 1 screen(s) never stopped moving before being checked (still moving: 1 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet: FAIL
[0s]    ✗ vision judge FAILED 2 of 26 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-002-settled.png — recipe-choice modal's rounded bottom-left corner cuts across the captains list behind it, leaving 'Davy Scones' and 'Dough Hook' rows sliced mid-word instead of fully hidden or fully shown
       · solo-tablet-003-settled.png — recipe-choice modal's rounded bottom-left corner cuts across the captains list behind it, leaving 'Davy Scones' and 'Dough Hook' rows sliced mid-word instead of fully hidden or fully shown
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.8s)
[0s]    coverage: 
[0s] 
== passplay-phone: FAIL
[0s]    ✗ vision judge FAILED 2 of 27 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-023-settled.png — coin/flip card shows a ghosted, offset duplicate outline behind it (doubled rendering)
       · passplay-phone-027-settled.png — award card text ('Bertie Scones' captain name) clipped by the card's own bottom border, cut mid-letter; right award card 'Peg Leg Meg' text crowded flush against card bottom edge with no padding
[0s]    ✗ 9 screen(s) never stopped moving before being checked (still moving: 9 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== passplay-desktop: FAIL
[0s]    ✗ offered but never exercised: walk away
[0s]    ✗ vision judge FAILED 3 of 29 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-desktop-008-settled.png — empty white speech bubble with tail near the ship, no text or content inside
       · passplay-desktop-020-settled.png — stacked answer bubbles (Crystal Sugar / pink ingredient icon / coins-only) overlap each other, edges touching/overlapping instead of clear gaps
       · passplay-desktop-023-settled.png — bottom line of Broadside Battle card text is cut off/clipped by the card's own bottom edge
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== crew-desktop: FAIL
[0s]    ✗ 2 moment(s) where the two captains saw different games: whose turn (host lights Dough, guest lights test1); captains (Dough: host 12 vs guest 11   (row ORDER differs by design and is not part of this finding))
[0s]    ✗ vision judge FAILED 1 of 40 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-desktop-host-005-settled.png — empty narration speech bubble with no text, anchored to teal ship
[0s]    ✗ 13 screen(s) never stopped moving before being checked (still moving: 13 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== crew-phone: FAIL
[0s]    ✗ offered but never exercised: deny
[0s]    ✗ 20 screen(s) never stopped moving before being checked (still moving: 20 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-desktop-wk: FAIL
[0s]    ✗ 7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone-wk: FAIL
[0s]    ✗ 2 structural check failure(s): not-occluded×1, no-pile×1 — first: clickable covered by something else: Call Dough Hook <- covered by . <b>
[0s]    ✗ vision judge FAILED 1 of 29 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-wk-028-settled.png — left 'Call Dough Hook' selection circle is overlapped and its label text clipped by the front 'Call Crustbeard' circle
[0s]    ✗ 7 screen(s) never stopped moving before being checked (still moving: 7 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet-wk: FAIL
[0s]    ✗ offered but never exercised: vanilla beans
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
