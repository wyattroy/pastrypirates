# Sea trial v2 — build `2026.09.04.2` (tree `69d1f368dcd9`)

**NOTHING SAILED** — 0 of 0 voyage(s) sailed  ·  2026-09-04T10:56:47.121Z  ·  3 min  ·  gear **COSMETIC**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: **CHOSEN ON THE COMMAND LINE**, overriding the mechanical picker, which said **FULL** (behaviour can change in: package.json)
>
> **Depth: COSMETIC. The mechanical picker said FULL.** A person chose this depth. Their reason, verbatim: **package.json touched only to add a QA gate to the test chain (sea_trial_report_tree_hash_check.mjs) and bump the gate ceiling/total; scripts/sea_trial.mjs touched only to print the game tree's own content hash alongside the existing hand-typed build stamp in its own report. Neither index.html nor src/ touched; scripts/ is NOT_GAME by definition (game-code.cjs). package.json is deliberately not auto-excluded by that same file, so this reason is stated explicitly rather than silently skipped.**
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
live, compare the build stamp above with the one in the game's ☰ menu. The tree hash beside it is
the game files' own content identity (T-009) — a repo-side cross-check, not something the menu
shows; two reports with the same stamp but a different tree hash sailed different code.*
