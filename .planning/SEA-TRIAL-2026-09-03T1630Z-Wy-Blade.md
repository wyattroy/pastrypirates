# Sea trial v2 — build `2026.09.03.3`

**FAILED** — 0 of 10 voyage(s) sailed, 10 NOT RUN  ·  2026-09-03T16:30:36.736Z  ·  1 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: behaviour can change in: index.html, package.json, src/orchestrator.js
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | **FAIL** |
| **can the vision judge see?** | yes — checked just before sailing — the judge opened a real screenshot and described it |
| voyages played with a real mouse | none |
| **voyages that did NOT run** | **solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone, solo-desktop-wk, solo-phone-wk, solo-tablet-wk** |

## What did NOT run, and why

**solo-desktop**

```
vision judge FAILED 1 of 25 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-desktop-023-settled.png — bottom line of battle card text ('Davy Scones shows TAILS — Dough Hook must') is truncated/cut off at the card's bottom edge, sentence incomplete
2 screen(s) never stopped moving before being checked (still moving: 2 geometry; longest wait 2.7s)
```

**solo-phone**

```
vision judge FAILED 1 of 26 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-026-settled.png — award card titles ('Rum Runner', 'Crustbeard') are clipped/overlapped by the fixed 'Play again!' button rather than scrolling cleanly under it
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**solo-tablet**

```
offered but never exercised: walk away
vision judge FAILED 2 of 38 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-005-settled.png — speech bubble above pink ship is empty/blank, no text rendered
       · solo-tablet-034-settled.png — Pastry Pirates logo/banner in the top-left corner is cut off/clipped by the screen edge, showing only fragments of its icons (sword, bone, cocoa pod) instead of the full logo plaque seen intact in oth
12 screen(s) never stopped moving before being checked (still moving: 12 geometry; longest wait 2.7s)
```

**passplay-phone**

```
offered but never exercised: deny
vision judge FAILED 1 of 29 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-029-settled.png — 'Play again!' button overlaps and clips the award cards' captain-name text (both left and right card text cut off mid-letter by the button on top of it, not by the screen edge)
8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
```

**passplay-desktop**

```
12 screen(s) never stopped moving before being checked (still moving: 12 geometry; longest wait 2.7s)
```

**crew-desktop**

```
offered but never exercised: vanilla beans
11 screen(s) never stopped moving before being checked (still moving: 11 geometry; longest wait 3.0s)
```

**crew-phone**

```
vision judge FAILED 1 of 46 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-host-025-settled.png — 'test1' label under The Silver-Tongued Ledger card is clipped/overlapped by the Play again! button
1 observation(s) seen only DURING an animation — not failures, read them in the log
10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
```

**solo-desktop-wk**

```
5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
```

**solo-phone-wk**

```
did not finish the voyage
1 structural check failure(s): run×1 — first: solo card not clickable
leg error: solo card not clickable
```

**solo-tablet-wk**

```
did not finish the voyage
1 structural check failure(s): run×1 — first: solo card not clickable
leg error: solo card not clickable
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.

## The browser-free checks failed

```
fatal: not a git repository (or any of the parent directories): .git
fatal: not a git repository (or any of the parent directories): .git
fatal: not a git repository (or any of the parent directories): .git
fatal: not a git repository (or any of the parent directories): .git
fatal: not a git repository (or any of the parent directories): .git
boom
FAIL -- "<!--qid:t102-search-console--> ⟨`T-102`⟩ **Your own reminder" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-102⟩, reminder,, nobody. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-102`⟩ **Your own reminder, and it is the one step nobody here can take for you: resubmit `sit…
FAIL -- "<!--qid:t206-ga-turn-on--> ⟨`T-206`⟩ **There is probably alr" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-206⟩, there, probably. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-206`⟩ **There is probably already a Google Analytics account sitting in your Google login for…
FAIL -- "<!--qid:t102-sitemap-coverage--> ⟨`T-102`⟩ **You asked me to" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-102⟩, asked, recommend. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-102`⟩ **You asked me to recommend rather than build: should the sitemap's page list be genera…
FAIL -- "<!--qid:t012-battle-card-clip--> ⟨`T-207`⟩ **Your own 2026-0" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-207⟩, 2026-08-01, still. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-207`⟩ **Your own 2026-08-01 bug is still alive in battles, and I found the exact spot. Do you…
FAIL -- "<!--qid:t102-working-files-indexable--> ⟨`T-102`⟩ **⚑ Google" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-102⟩, google, index. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-102`⟩ **⚑ Google can index your working files right now, and your note assumed it could not.*…
FAIL -- "<!--qid:t017-fan-mixed-sizes--> ⟨`T-017`⟩ **Only the long la" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-017⟩, labels, shrank,. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-017`⟩ **Only the long labels shrank, so a fan can now mix two type sizes — "Walk away" stays …
FAIL -- "<!--qid:t017-name-type-too-small--> ⟨`T-017`⟩ **The captain'" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-017⟩, captain's, inside. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-017`⟩ **The captain's name now fits inside the trade circle — but only by shrinking to about …
FAIL -- "<!--qid:t121-drag-scope--> ⟨`T-121`⟩ **When you drag one tas" is waiting in ## RULED with no "- [ ] Your ruling: …" row in the STEP 1 CHECKLIST -- since the "Your rulings, in hand" card was removed (T-087, his instruction) nothing renders this section, so it is on no surface he can see. Triage it in the same act that harvests it: task row if it owes work, straight to ## SETTLED RULINGS if it does not. Words looked for: ⟨t-121⟩, page,, currently. CLOSEST ROW FOUND (2 of 3 words matched, so this may be a near-miss rather than a missing row): Your ruling: ⟨`T-121`⟩ **When you drag one task on your page, you are currently re-ordering ALL of them — and …
```

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
[0s]    ✗ vision judge FAILED 1 of 25 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-desktop-023-settled.png — bottom line of battle card text ('Davy Scones shows TAILS — Dough Hook must') is truncated/cut off at the card's bottom edge, sentence incomplete
[0s]    ✗ 2 screen(s) never stopped moving before being checked (still moving: 2 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone: FAIL
[0s]    ✗ vision judge FAILED 1 of 26 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-phone-026-settled.png — award card titles ('Rum Runner', 'Crustbeard') are clipped/overlapped by the fixed 'Play again!' button rather than scrolling cleanly under it
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-tablet: FAIL
[0s]    ✗ offered but never exercised: walk away
[0s]    ✗ vision judge FAILED 2 of 38 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · solo-tablet-005-settled.png — speech bubble above pink ship is empty/blank, no text rendered
       · solo-tablet-034-settled.png — Pastry Pirates logo/banner in the top-left corner is cut off/clipped by the screen edge, showing only fragments of its icons (sword, bone, cocoa pod) instead of the full logo plaque seen intact in oth
[0s]    ✗ 12 screen(s) never stopped moving before being checked (still moving: 12 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== passplay-phone: FAIL
[0s]    ✗ offered but never exercised: deny
[0s]    ✗ vision judge FAILED 1 of 29 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · passplay-phone-029-settled.png — 'Play again!' button overlaps and clips the award cards' captain-name text (both left and right card text cut off mid-letter by the button on top of it, not by the screen edge)
[0s]    ✗ 8 screen(s) never stopped moving before being checked (still moving: 8 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== passplay-desktop: FAIL
[0s]    ✗ 12 screen(s) never stopped moving before being checked (still moving: 12 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== crew-desktop: FAIL
[0s]    ✗ offered but never exercised: vanilla beans
[0s]    ✗ 11 screen(s) never stopped moving before being checked (still moving: 11 geometry; longest wait 3.0s)
[0s]    coverage: 
[0s] 
== crew-phone: FAIL
[0s]    ✗ vision judge FAILED 1 of 46 screen(s) it looked at — OPEN THESE; the judge's words are its guess at why, and it is wrong often enough that they are not quotable (T-019)
       · crew-phone-host-025-settled.png — 'test1' label under The Silver-Tongued Ledger card is clipped/overlapped by the Play again! button
[0s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[0s]    ✗ 10 screen(s) never stopped moving before being checked (still moving: 10 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-desktop-wk: FAIL
[0s]    ✗ 5 screen(s) never stopped moving before being checked (still moving: 5 geometry; longest wait 2.7s)
[0s]    coverage: 
[0s] 
== solo-phone-wk: FAIL (voyage incomplete)
[0s]    ✗ did not finish the voyage
[0s]    ✗ 1 structural check failure(s): run×1 — first: solo card not clickable
[0s]    ✗ leg error: solo card not clickable
[0s] 
== solo-tablet-wk: FAIL (voyage incomplete)
[0s]    ✗ did not finish the voyage
[0s]    ✗ 1 structural check failure(s): run×1 — first: solo card not clickable
[0s]    ✗ leg error: solo card not clickable
[0s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
