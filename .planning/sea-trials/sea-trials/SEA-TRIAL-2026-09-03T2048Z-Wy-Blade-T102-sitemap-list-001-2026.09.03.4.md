# Sea trial v2 — build `2026.09.03.4`

**FAILED** — 0 of 0 voyage(s) sailed  ·  2026-09-03T21:03:36.585Z  ·  1 min  ·  gear **COSMETIC**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: **CHOSEN ON THE COMMAND LINE**, overriding the mechanical picker, which said **FULL** (behaviour can change in: package.json)
>
> **Depth: COSMETIC. The mechanical picker said FULL.** A person chose this depth. Their reason, verbatim: **no game code: only scripts/qa gates and package.json gate counters; sitemap.xml is byte-identical after the change, and a FULL ten-leg trial is already sailing this tree for T-017**
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
| **voyages that did NOT run** | none |


## The browser-free checks failed

```
boom
chartkeeper: 2 rows carry DO NOW — T-802, T-803.
  His interrupt is ONE SLOT by design; two of them is just another backlog, and nothing
  here may guess which one he meant. Re-pin the one that is still urgent:
    node scripts/wyclau/chartkeeper.mjs --do-now=T-802
chartkeeper --do-now: no OPEN row on C:\Users\wyatt\AppData\Local\Temp\donow-Y0hqgp\no-such-row.md carries the handle T-999. Nothing was marked.
  Refusing rather than silently doing nothing: an interrupt he cannot see is
  indistinguishable from one that was ignored, and that is the fault this exists to remove.
chartkeeper --order: no OPEN row on C:\Users\wyatt\AppData\Local\Temp\donow-Y0hqgp\order-nowhere.md carries T-999.
  NOTHING was written. A partly-applied order is his in places and ours in the rest,
  with nothing on the page saying which — worse than refusing outright.
chartkeeper --order: T-803 is carried by MORE THAN ONE open row — ordering one of two rows nobody can tell apart would move the wrong task and say nothing. Give one of each pair a new handle first.
  NOTHING was written. A partly-applied order is his in places and ours in the rest,
  with nothing on the page saying which — worse than refusing outright.
```

## The voyages, in full

```
(none run)
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
