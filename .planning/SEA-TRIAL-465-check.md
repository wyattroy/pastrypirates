# Sea trial v2 — build `2026.08.31.1`

**FAILED** — 7 of 10 voyage(s) sailed, 3 NOT RUN  ·  2026-08-31T21:31:53.399Z  ·  144 min  ·  gear **FULL**  ·  sailed on **win32 (Wy-Blade)**

> Gear chosen because: nothing uncommitted, so this reads what is AHEAD OF origin/main: .claude-team/GREEN-step1.txt, .claude-team/RED-step1.txt, about.html, index.html, package.json, src/engine/index.js, src/main.js, src/net/index.js, src/net/watchers.js, src/net/writers.js, src/orchestrator.js, src/shared/index.js, src/shared/storyboard.js, src/shared/visibility.js, src/state/index.js, src/ui/audio.js, src/ui/bakeoff.js, src/ui/board.js, src/ui/flow.js, src/ui/panel.js, src/ui/stage.js, src/ui/util.js
>
> Sailed by **sea trial v2** — the eyes see EVERY distinct screen (no judge
> cap), five to a call, and each leg says how many of its screens were actually looked at. A report
> from an older trial version looked at less; do not compare their silences.

## What ran

| | |
|---|---|
| checks with no browser (`npm test`) | PASS |
| **can the vision judge see?** | **unknown** — **COULD NOT BE ASKED** — judge can-see check — NOT RUN: no sea-trial-shots/ directory. Sail a trial first. |
| voyages played with a real mouse | solo-desktop, solo-phone, solo-tablet, passplay-phone, passplay-desktop, crew-desktop, crew-phone |
| **voyages that did NOT run** | **solo-desktop-wk, solo-phone-wk, solo-tablet-wk** |

## What did NOT run, and why

**solo-desktop-wk**

```
playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
```

**solo-phone-wk**

```
playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
```

**solo-tablet-wk**

```
playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
```

A leg that did not run is **not** a leg that passed. This section exists so that distinction cannot be lost.


## The voyages, in full

```
== solo-desktop: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
[8592s]    coverage: arrgh:1/1  cinnamonchocolate fudgea:2/2  cinnamon snapscrisp rust:0/2  start:1/1
[8592s] 
== solo-phone: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
[8592s]    ✗ 1 observation(s) seen only DURING an animation — not failures, read them in the log
[8592s]    ✗ 1 screen(s) never stopped moving before being checked
[8592s]    coverage: arrgh:1/1  pound cakea dense rich b:2/2  cinnamonsugar churroscri:0/2  start:1/1  sail square:1/1  muse#:1/1
[8592s] 
== solo-tablet: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
[8592s]    ✗ vision judge FAILED 2 of 7 screen(s) it looked at
[8592s]    ✗ 1 screen(s) never stopped moving before being checked
[8592s]    coverage: arrgh:1/1  cinnamon snapscrisp rust:2/2  caramel slicea toastedco:0/2  start:1/1  sail square:1/1  muse#:1/1
[8592s] 
== passplay-phone: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
[8592s]    coverage: arrgh:1/1  spiced fudge browniesdee:2/2  vanilla bean crème brûlé:2/4  at the helm:1/1  snickerdoodle bitespillo:0/2  start:1/1
[8592s] 
== passplay-desktop: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
[8592s]    ✗ vision judge FAILED 1 of 8 screen(s) it looked at
[8592s]    coverage: arrgh:1/1  crispy cocoa snapsthin h:2/4  cinnamon sponge cakea fl:0/2  at the helm:1/1  snickerdoodle bitespillo:2/2  start:1/1
[8592s] 
== crew-desktop: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
[8592s]    coverage: arrgh:1/1  mayan cocoa souffléa soa:2/2  cinnamonchocolate fudgea:0/2  start:1/1
[8592s] 
== crew-phone: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ 1 console error(s): ERR VOYAGE AGROUND (runLiveNet) TypeError: Cannot read properties of undefined (reading 'replace')
    at pname (http://127.0.0.1:8800/src/ui/util.js:289:27)
    at pn (http://127.0.0.1:8800/src/ui/util.j
[8592s]    coverage: arrgh:1/1  mayan cocoa souffléa soa:2/2  mexican chocolate tortea:0/2  start:1/1
[8592s] 
== solo-desktop-wk: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ leg error: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
[8592s] 
== solo-phone-wk: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ leg error: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
[8592s] 
== solo-tablet-wk: FAIL (voyage incomplete)
[8592s]    ✗ did not finish the voyage
[8592s]    ✗ leg error: playwright not found. Tried: C:\Users\wyatt\.pw\node_modules\playwright\index.mjs, playwright
  Install it durably (NOT in /tmp, which is cleared on reboot):
    mkdir -p ~/.pw && cd ~/.pw && npm i playwright && npx playwright install webkit
  scripts/lib/wk.mjs finds ~/.pw automatically; PW_DIR only overrides it.
[8592s] 
RESULT: FAIL
```

Screenshots and contact sheets: `sea-trial-shots/` (not committed — 100MB+ per run).

---
*Written by `scripts/sea_trial.mjs`. To check whether a sea trial was actually run for what is
live, compare the build stamp above with the one in the game's ☰ menu.*
