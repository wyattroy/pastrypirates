# Sea trial v2 — build `2026.09.03.3`

**NOTHING SAILED** — 0 of 0 voyage(s) sailed  ·  2026-09-03T19:33:32.712Z  ·  2 min  ·  gear **COSMETIC**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: **CHOSEN ON THE COMMAND LINE**, overriding the mechanical picker, which said **FULL** (behaviour can change in: package.json, robots.txt)
>
> **Depth: COSMETIC. The mechanical picker said FULL.** A person chose this depth. Their reason, verbatim: **No game code changed: src/ and index.html are untouched. The diff is 13 dev/review pages gaining one meta-robots line inside head, robots.txt gaining a Disallow plus comments, and package.json gaining a gate. None of it is fetched, parsed or executed by the game, so no voyage can observe it. Verified instead at the level that CAN observe it: the browser parsed the tag into document.head on all three page families, and the posed shots t102-gallery.png, t102-sketch.png and t102-battlesim.png show the pages rendering and the simulator still running its 20,000 battles. A FULL run would also collide with the ten-leg trial another session has at sea right now (LONG-RUN, 5 of 10 legs, 24 browsers up).**
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
| **voyages that did NOT run** | none |



## The voyages, in full

```
(none run)
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
