# Sea trial v2 — build `2026.08.31.1`

**FAILED** — 7 of 10 voyage(s) sailed, 3 NOT RUN  ·  2026-09-01T01:09:03.737Z  ·  1 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

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
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone |
| **voyages that did NOT run** | **solo-desktop-wk, solo-phone-wk, solo-tablet-wk** |

## What did NOT run, and why

**solo-desktop-wk**

```
did not finish the voyage
leg error: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
```

**solo-phone-wk**

```
did not finish the voyage
leg error: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
```

**solo-tablet-wk**

```
did not finish the voyage
leg error: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

> ⚠ **6 leg(s) sailed but have NO verdict printed below: solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone.**
> Their result exists in `sea-trial-shots/log.txt` and did not reach this file. Do not read their
> absence as a pass — go and read the log.

```
== solo-desktop: FAIL (voyage incomplete)
[0s]    ✗ did not finish the voyage
[0s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
file:///C:/Users/wyatt/Projects/pastrypirates/scripts/playtest_gate.mjs:585
  if (P) log(`   coverage: ${[...P.coverage.entries()].map(([k, c]) => `${k}:${c.clicked}/${c.seen}`).join("  ")}`);
                                            ^

TypeError: P.coverage.entries is not a function or its return value is not iterable
    at file:///C:/Users/wyatt/Projects/pastrypirates/scripts/playtest_gate.mjs:585:45

Node.js v22.15.1
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
