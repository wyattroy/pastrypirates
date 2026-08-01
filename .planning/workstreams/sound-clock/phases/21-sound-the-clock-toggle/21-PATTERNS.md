# Phase 21: Sound & the Clock Toggle - Pattern Map

**Mapped:** 2026-07-31
**Files analyzed:** 9
**Analogs found:** 9 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|---------------|
| `src/shared/audio.js` (NEW) | utility/service (leaf tier) | event-driven | `src/shared/index.js` | role-match (only existing `shared/` module — structural sibling, not a functional twin) |
| `scripts/audio_mapping_test.js` (NEW) | test | batch (DOM-free unit) | `scripts/narration_test.js` | exact |
| `src/ui/panel.js` `setClockUI()` (MODIFY) | component (render+wire) | request-response | itself, existing `#scPause`/`#scTimerToggle` block (lines 71-97) | exact — extend in place |
| `src/ui/board.js` `setFlipCoin()` (MODIFY) | component (render choke point) | event-driven | itself (lines 866-873) | exact — extend in place |
| `src/orchestrator.js` `toggleTimer()`/`watchTimer()` (MODIFY) | controller (main tier) | event-driven / pub-sub | `togglePause()`/`watchPause()`/`applyPauseState()` (same file, lines 176-219, + `src/ui/util.js:1265-1279`) | exact |
| `src/ui/util.js` `applyTimerOff(off)` (NEW) | utility (state-mutation, extracted) | event-driven | `applyPauseState(nowPaused)` (lines 1265-1279) | exact |
| `index.html` `#creditsModal` (MODIFY) | markup/config (copy-only) | — | itself (lines 939-951) | exact |
| `index.html` clock panel markup (MODIFY) | markup/config | — | existing `#scPause`/`#scTimerToggle` DOM elements (referenced from `src/ui/panel.js`/`src/orchestrator.js:1310-1311`) | exact |
| `package.json` `scripts.test` (MODIFY) | config | batch | itself (line 7) | exact |

## Pattern Assignments

### `src/shared/audio.js` (NEW) — utility/service, event-driven

**Analog:** `src/shared/index.js` (the only file in `src/shared/`, read in full — 213 lines)

**Header/purity-bar pattern** (lines 1-6):
```javascript
// src/shared/index.js
//
// Phase 8 shared leaf tier (D-03/D-04). Holds no DOM, `window`, Firebase,
// wall-clock, or unseeded-random access — pure constants and pure helpers
// only, safe for both the engine module and (eventually) UI/net modules to
// import.
```
`src/shared/audio.js` breaks the "no DOM/window access" half of this purity bar (it must construct `AudioContext`, read `document.hidden`, etc.) — this is a **known, deliberate deviation** the planner should call out with a comment in the same voice as the file's existing deviation notes (see panel.js's own "Deviation ($ duplicate...)" comments for the house style of documenting a deliberate exception). What must NOT be broken: no import of `src/net/`, `src/orchestrator.js`, or `src/state/` — `audio.js` should be self-contained exactly as research's Architectural Responsibility Map specifies ("no dependency on engine/state/ui internals").

**Icon-constant declaration idiom to mirror for asset paths** (lines 22-23, 50-52):
```javascript
const ASSET_BASE="assets/";
const ING_IMG={};ING_ALL.forEach(i=>ING_IMG[i]=`${ASSET_BASE}ingredients/${i}.png`);
...
  FISH_IMG=`${ASSET_BASE}icons/fish.png`,BLOCKED_SLASH_IMG=`${ASSET_BASE}icons/blocked-slash.png`;
const HOURGLASS_IMG=`${ASSET_BASE}icons/hourglass.png`,ALARM_IMG=`${ASSET_BASE}icons/alarm.png`,
  STOPWATCH_IMG=`${ASSET_BASE}icons/stopwatch.png`,PAUSE_SYMBOL_IMG=`${ASSET_BASE}icons/pause-symbol.png`;
```
The new speaker icon constant belongs in `src/shared/index.js` (NOT `audio.js`) alongside `STOPWATCH_IMG`/`BLOCKED_SLASH_IMG`, e.g. `SPEAKER_IMG=\`${ASSET_BASE}icons/speaker.png\`` — added to the same UPPERCASE_SNAKE_CASE `*_IMG` block and the trailing `export { ... }` list (line 213). `iconImg(src)` (line 161) is the existing consumer idiom: `iconImg(SPEAKER_IMG)` / `iconImg(BLOCKED_SLASH_IMG)` composited exactly like `setClockUI()` already does for the timer toggle (`toggleEl.innerHTML=appState.timerOff?iconImg(BLOCKED_SLASH_IMG):iconImg(STOPWATCH_IMG);` — panel.js line 87).

**Lookup-table idiom to mirror for `EVENT_SOUND`:** `src/ui/util.js`'s `EVENT_NARRATION` (referenced by `scripts/narration_test.js:24-27`, confirmed 25 keys at `narration_test.js:64`) is the load-bearing precedent research already names for `EVENT_SOUND`'s shape — a plain object keyed by `e.t`, functions/strings as values, absent-key-is-safe (never a `.find()`/throw shape). `EVENT_NARRATION`'s import path is `../src/ui/util.js`; the analogous export for `audio.js` should live directly in the new module per research's Architecture Patterns → Pattern 4.

**Export style** — no default export, one long named `export { ... }` list at end of file (line 213). `audio.js` should follow this, exporting at minimum: `initAudio`, `playForEvent`, `playFlip` (or similar flip choke-point function), `EVENT_SOUND` (for the test script to import directly), mute get/set, and whatever visibility-handling entry point `main.js`/`orchestrator.js` needs to wire the one-shot unlock listener into.

---

### `scripts/audio_mapping_test.js` (NEW) — test, batch/DOM-free

**Analog:** `scripts/narration_test.js` (985 lines; read lines 1-80 in full for header + harness shape — this is more than sufficient, the remaining ~900 lines are per-key fabricated-event assertions that don't need to be read to copy the harness convention)

**Header/convention comment** (lines 1-22):
```javascript
#!/usr/bin/env node
// scripts/narration_test.js
//
// Phase 15 (NARR-05/D-07/D-08/D-10): the DOM-free harness every later narration plan in this
// phase asserts through. Two jobs:
// ...
// Convention (matches determinism_baseline.js/hail_ranking_test.js/storm_moored_reason_test.js/
// bot_storm_narration_test.js): no assertion library, a local check(name, actual, expected)
// counter, plain console.log, process.exit(failures?1:0). Direct `import` of the narration surface
// from src/ui/util.js — no DOM reference, no import of src/ui/flow.js or src/ui/panel.js.
```

**Import style** (lines 24-34):
```javascript
import {
  EVENT_NARRATION, describe, pname, pn, describeFor, NEUTRAL_VIEWER, narrationVariants,
  pickNarrVariant, msgHoldMs, botMsgHoldMs, chatBubbleHoldMs, fmtItem,
} from "../src/ui/util.js";
import { ilabelImg, ING_IMG, ING_ALL, iconImg, dockFlavor, dockFlavorIcon, dockPlace, iname, HEXCOL } from "../src/shared/index.js";
import { netSetNarr } from "../src/net/writers.js";
import { appState } from "../src/state/index.js";
import { readFileSync } from "node:fs";
```
`audio_mapping_test.js` should import `EVENT_SOUND` (and whatever pure dispatch function is factored out per research's Wave 0 Gaps recommendation — "recommend factoring `EVENT_SOUND` and `playForEvent`'s dispatch logic so they don't require a live `ctx` to be inspected") directly from `../src/shared/audio.js`, plus `readFileSync`/`node:fs` for the "sfx file exists at non-zero size" assertion research specifies.

**PASS/FAIL printing convention** (lines 36-42):
```javascript
let failures = 0;
function check(name, actual, expected) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${(ok ? "PASS" : "FAIL").padEnd(5)} ${name.padEnd(78)} got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}
function checkTrue(name, actual) { check(name, actual, true); }
```

**Exit-code handling** (verbatim from tail, lines 984-985):
```javascript
console.log(`\n${failures ? "FAILED" : "PASSED"} — ${failures} failing check(s)`);
process.exit(failures ? 1 : 0);
```

**Key-count assertion idiom** (line 64), directly reusable pattern for the "25 real event types" assertion:
```javascript
const KEYS = Object.keys(EVENT_NARRATION);
check("EVENT_NARRATION has exactly 25 keys (the audit's inventory size)", KEYS.length, 25);
```
`audio_mapping_test.js` should assert `EVENT_SOUND` has an entry (string filename or explicit `null`) for every one of the same 25 keys `EVENT_NARRATION` has — the two tables should be checked against each other's key sets directly (`Object.keys(EVENT_NARRATION).every(k => k in EVENT_SOUND)`), which is stronger and more future-proof than hardcoding "25" a second time.

**Fabricated-event-per-key idiom** (lines 66-80, `FAB` object) — same shape reusable if `audio_mapping_test.js` also wants to exercise `playForEvent(e)`'s dispatch (not just the static table), e.g. to assert the storm-dedup branch (`e.t==="newround" && e.storm`) and the explicit-`null` fallback both resolve without throwing.

---

### `src/ui/panel.js` `setClockUI()` (MODIFY) — component, request-response

**Analog:** itself — the existing `#scPause`/`#scTimerToggle` block, read in full (lines 51-115+)

**Imports pattern** (lines 34-46) — the file already imports icon constants from `../shared/index.js` and reaches orchestrator behaviour only through `netHandlers()`:
```javascript
import { appState } from "../state/index.js";
import {
  PLAY_IMG, PAUSE_IMG, PAUSE_SYMBOL_IMG, BLOCKED_SLASH_IMG, STOPWATCH_IMG, COIN_IMG, HEXCOL, iconImg, emojify,
} from "../shared/index.js";
...
import { netHandlers } from "./handlers.js";
```
For the mute button, add the new `SPEAKER_IMG` (from `src/shared/index.js`) to this same import line, and import whatever `playForEvent`/mute-state getters are needed directly from `../shared/index.js` re-export or `../shared/audio.js` — `audio.js` is a leaf `shared` module, so `panel.js` (ui tier) may import it directly, unlike orchestrator behaviour.

**Per-tick defensive reset pattern (CLOCK-03)** — the exact re-entrancy discipline a new mute-button handler MUST follow (lines 72-76):
```javascript
// CLOCK-03: defensive reset, once per tick, BEFORE any branch below. setClockUI() re-runs on
// the 500ms interval, so a click-to-resume handler set in a prior PAUSED tick must never
// survive into a later non-paused tick (RESEARCH Anti-Pattern 4) — only the two paused
// branches below re-arm it. The .tappable affordance class is reset here for the same reason.
numEl.onclick=null;numEl.style.cursor="";numEl.classList.remove("tappable");
```

**Existing `#scTimerToggle` render+wire pattern to mirror exactly for the mute button** (lines 82-90):
```javascript
// #7: the timer off/on toggle is offered to EVERY player in a real multiplayer game (2+ humans);
// solo games keep the ▶/⏸ pause instead. Its icon reflects the current state.
const toggleEl=$("scTimerToggle");
if(toggleEl){
  toggleEl.style.display=(!soloBotGame()&&!appState.liveDone)?"":"none";
  toggleEl.innerHTML=appState.timerOff?iconImg(BLOCKED_SLASH_IMG):iconImg(STOPWATCH_IMG);
  // @copy misc.timer.toggletooltip
  toggleEl.title=appState.timerOff?"Turn the timer back on":"Turn the timer off";
}
```
D-20 requires removing the `soloBotGame()` gate — research's Code Examples section gives the exact one-line fix (`toggleEl.style.display = appState.liveDone ? "none" : "";`). The mute button element (new `#scMute` or similar, per D-15's "sibling in `#controlsRow`" placement recommendation — see Pitfall 3 in RESEARCH.md) should get its own block of this exact same three-line shape: `style.display` gated only on `appState.liveDone` (D-16), `innerHTML` toggling between the new speaker icon and `iconImg(SPEAKER_IMG)+blocked-slash overlay` (or a composited two-image approach — see D-14's "shown with `blocked-slash.png` over it" wording), and a `title` tooltip string.

**Reaching orchestrator behaviour through the `netHandlers()` seam (the mandatory boundary)** — CLOCK-03 comment (lines 102-105):
```javascript
// CLOCK-03: the big paused symbol is an ADDED resume affordance alongside #scPause — same
// togglePause seam, routed via netHandlers() since panel.js (ui-tier) may never import
// src/orchestrator.js (main-tier) directly.
numEl.style.cursor="pointer";numEl.onclick=()=>netHandlers().onTogglePause();
```
The mute button's click handler must NOT call an orchestrator-tier mute-toggle function directly by import. Two options consistent with the codebase's actual layering, in order of what research recommends: (a) since muting is pure client-side state living in `src/shared/audio.js` (a leaf `shared` module `ui` may import freely), `panel.js` can call the shared audio module's own mute-toggle function directly — no `netHandlers()` hop needed, because mute never touches Firebase/`appState`/orchestrator; OR (b) if the click handler also needs to trigger a `setClockUI()` re-render or any orchestrator-owned side effect, route that specific call through `netHandlers()` exactly like `onTogglePause()` above. Confirm which shape research's Architectural Responsibility Map intends: "click handler bound once in `wireLobby()` (main tier, may call the shared audio module directly)" — i.e. the actual click *binding* happens in `src/orchestrator.js` `wireLobby()` (see below), not inside `setClockUI()` itself; `setClockUI()` only renders the icon/visibility state each tick, matching how `#scPause`'s and `#scTimerToggle`'s `onclick` are bound once in `wireLobby()` (`src/orchestrator.js:1310-1311`) while `setClockUI()` only ever sets `innerHTML`/`style.display`/`title`, never `onclick`, for those two elements.

---

### `src/ui/board.js` `setFlipCoin(state)` (MODIFY) — component, event-driven

**Analog:** itself, read in full (lines 862-882)

**Existing choke-point, verbatim, to extend** (lines 862-873):
```javascript
// ---- the flippenator: one always-visible coin+button; every flip in the game plays here ----
// The flippenator coin doubles as its own button — no separate FLIP button — so this sets
// the coin's own class/text directly instead of using coinHTML() (which stays for the
// battle scoreboard's per-fighter result circles, a separate use of the same .coin styles).
export function setFlipCoin(state){
  const el=$("flipCoinWrap");if(!el)return;
  el.classList.remove("heads","tails","spin","wait","active");el.onclick=null;el.style.backgroundImage="";
  if(state==="H"){el.classList.add("heads");el.style.backgroundImage=`url(${FLIP_HEADS_IMG})`;el.textContent="";}
  else if(state==="T"){el.classList.add("tails");el.style.backgroundImage=`url(${FLIP_TAILS_IMG})`;el.textContent="";}
  else if(state==="spin"){el.classList.add("spin");el.style.backgroundImage=`url(${COIN_SPIN_IMG})`;el.textContent="";}
  else{el.classList.add("wait");el.textContent="";}
}
```
D-02/D-07 (coin-flip sound on every flip, every player's screen) is satisfied by adding one call inside the `state==="spin"` branch — `playFlip()` from `src/shared/audio.js` — since this branch already fires from every flip path on both host and guest, confirmed by `src/orchestrator.js:136-141` (`broadcastFlip`/`watchFlip`, both call `setFlipCoin(state)` directly, shown below). No new plumbing needed; this is the single cheapest hook in the whole phase.

**Confirmed dual call sites (host broadcast + guest mirror)** (`src/orchestrator.js:136-141`):
```javascript
export function broadcastFlip(state){
  setFlipCoin(state);
  if(appState.isHost&&appState.db&&appState.room)netSetFlip(appState.db,appState.room,state,netFail("flip"));
}
export function watchFlip(){
  netWatchFlip(appState.db,appState.room,s=>{const v=s.val();if(v)setFlipCoin(v.state);});
}
```

---

### `src/orchestrator.js` `toggleTimer()`/`watchTimer()` (MODIFY) — controller, event-driven/pub-sub

**Analog:** `togglePause()`/`watchPause()`/`applyPauseState()` — same file + `src/ui/util.js`, all read in full

**Current `toggleTimer()` — the bug** (lines 165-170):
```javascript
// #7: any player may switch the turn timer off/on. The choice is written to Firebase so the whole
// table stays in sync; persisted locally so it sticks across games. The host reacts by stopping
// any running clock at once (so the current player is un-timed the moment anyone flips it off).
export function toggleTimer(){
  if(!appState.db||!appState.room)return;   // <-- THE BUG: silently no-ops with no Firebase
  const next=!appState.timerOff;
  try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}
  netSetTimerOff(appState.db,appState.room,next,netFail("timerOff"));
}
```

**The proven db/room-branch precedent to copy exactly — `togglePause()`** (lines 171-182):
```javascript
// CLOCK-02: any player (host or guest) may trigger a true play/pause of the WHOLE game —
// countdown AND bot captains — not just the ⏱ timer-off toggle above (D-05: the two coexist).
// Multiplayer: write the flag; every client's watchPause() mirrors it, and only the host's
// branch mutates shotClockDeadline/shotClockPauseElapsed (D-06/D-07 — see applyPauseState).
// Solo/pass-and-play (no db/room): fall back to the local toggleShotClockPause() unchanged.
export function togglePause(){
  if(appState.db&&appState.room){
    netSetPaused(appState.db,appState.room,!appState.shotClockPaused,netFail("pause"));
  }else{
    toggleShotClockPause();
  }
}
```
`toggleTimer()` should be rewritten to this exact `if(db&&room){networked}else{local}` shape, with `applyTimerOff(next)` (new, see `src/ui/util.js` below) as the local branch — matching research's Code Examples section verbatim recommendation.

**`watchPause()` — the pub-sub listener shape, including the host-only-mutates-state / guest-only-mirrors-boolean split** (lines 183-200):
```javascript
// Structurally identical to watchTimer() below: every client (host and guest) attaches this so
// the shared paused flag is tracked table-wide. Only the host branch runs applyPauseState (the
// deadline/pauseElapsed math) — a guest just mirrors the boolean for rendering (D-06).
export function watchPause(){
  netWatchPaused(appState.db,appState.room,s=>{
    const v=!!s.val();
    if(appState.isHost){
      applyPauseState(v);
      // CLOCK-02 FIX (mp-pause-clock-desync): applyPauseState() recomputes the host-authoritative
      // deadline (resume) / stashes pauseElapsed (pause) but is PURELY LOCAL. Without this
      // re-broadcast the guests keep rendering the stale pre-pause deadline...
      broadcastClock();
    }else appState.shotClockPaused=v;
    setClockUI();
  });
}
```

**Current `watchTimer()` — where BUG-02's re-arm fix already lives, and what must be extracted verbatim into `applyTimerOff()`** (lines 201-219):
```javascript
export function watchTimer(){
  netWatchTimerOff(appState.db,appState.room,s=>{
    // notes/edits BUG-02: this callback only ever handled the on→off direction. Switching the
    // timer back on left the in-flight turn with no armed clock at all — startShotClock() is
    // only called at the START of a turn (armClock), so nothing re-armed the turn already in
    // progress. That is the "I paused the timer and then the game wouldn't continue" report.
    const was=appState.timerOff;
    appState.timerOff=!!s.val();
    if(appState.isHost&&appState.timerOff)stopShotClock();
    else if(appState.isHost&&was&&!appState.timerOff&&appState.shotClockSeat==null&&!appState.turnExpired){
      // shotClockSeat==null is what prevents double-arming: this callback fires on EVERY client
      // for every write, so the host also runs it for a write a guest originated.
      const seat=currentTurnSeat();
      const p=seat!=null?appState.game.players[seat]:null;
      if(p&&!p.done)rearmShotClock(p);
    }
    setClockUI();
  });
}
```
Everything inside the callback body (from `const was=` through `setClockUI();`) is exactly what research's Code Examples section extracts verbatim into `applyTimerOff(off)`. After extraction, `watchTimer()` shrinks to (research's own proposed replacement, quoted for the planner):
```javascript
export function watchTimer(){
  netWatchTimerOff(appState.db,appState.room,s=>applyTimerOff(!!s.val()));
}
```
And the click binding stays where it already is — `src/orchestrator.js:1310-1311` inside `wireLobby()`:
```javascript
$("scPause").onclick=togglePause;
$("scTimerToggle").onclick=toggleTimer;
```
The mute button's click binding belongs on this exact same line pair, in `wireLobby()`, per research's Architectural Responsibility Map row ("click handler bound once in `wireLobby()`... main tier can call shared/ directly").

**`applyPauseState()` — the sibling local state-mutation function `applyTimerOff()` should structurally match** (`src/ui/util.js:1258-1279`, read in full):
```javascript
// CLOCK-02: the pause/resume state-mutation body, extracted out of toggleShotClockPause below
// so src/orchestrator.js's watchPause() can call it directly on the host branch of a networked
// pause toggle — the SAME shotClockDeadline/shotClockPauseElapsed math as before (D-07: resume
// continues from the remaining time, not a fresh 30s), just relocated, not rewritten. No
// isHost/soloBotGame gate lives in here on purpose (D-05/D-06): the caller decides who may call
// this — solo's toggleShotClockPause() below (host-only), or the host branch of watchPause()
// (never the guest branch, which only mirrors the boolean for rendering).
export function applyPauseState(nowPaused){
  if(nowPaused){
    appState.shotClockPaused=true;
    if(appState.shotClockSeat!=null){
      appState.shotClockPauseElapsed=Date.now()-(appState.shotClockDeadline-30000);
      if(appState.shotClockTimer){clearInterval(appState.shotClockTimer);appState.shotClockTimer=null;}
    }
  }else{
    appState.shotClockPaused=false;
    if(appState.shotClockSeat!=null){
      appState.shotClockDeadline=Date.now()+30000-appState.shotClockPauseElapsed;
      appState.shotClockTimer=setInterval(shotClockTick,500);
    }
  }
}
```

---

### `src/ui/util.js` `applyTimerOff(off)` (NEW) — utility, event-driven

**Analog:** `applyPauseState(nowPaused)` (same file, lines 1265-1279, quoted above) — extract next to it (research: "placed beside `applyPauseState()`").

**Placement + no-gate convention to copy:** `applyPauseState` deliberately carries no `isHost`/`soloBotGame` gate — "the caller decides who may call this." `applyTimerOff(off)` should follow the identical discipline: the gating (`appState.isHost&&...`) stays inside the extracted body (it's already there in the current `watchTimer()` callback, quoted above) exactly as it already exists, not added or removed at the call sites.

**Reaching `setClockUI()`/render from `src/ui/util.js` (a ui-tier file) — the existing seam already used by `toggleShotClockPause()` in the same file** (line 1290):
```javascript
export function toggleShotClockPause(){
  if(!appState.isHost)return;
  applyPauseState(!appState.shotClockPaused);
  netHandlers().onSetClockUI();
}
```
`applyTimerOff()` must end its body the same way: `netHandlers().onSetClockUI();` (or a direct `setClockUI()` call if `setClockUI` is already importable in `util.js` without a cycle — check which `applyPauseState`'s own callers use; `watchTimer()`'s current body calls `setClockUI()` directly because it lives in `src/orchestrator.js`, a different tier with a different import surface — once the body moves into `src/ui/util.js`, it must switch to the `netHandlers().onSetClockUI()` indirection, matching `toggleShotClockPause()`'s existing pattern in that same file).

---

## Shared Patterns

### The `ui` tier may never import `src/orchestrator.js` (main tier) directly
**Source:** `src/ui/panel.js:8-17` (module header) and the CLOCK-03 comment at line 102-104 (quoted above in the `panel.js` section)
**Apply to:** `src/ui/panel.js`, `src/ui/board.js`, `src/ui/util.js` — any new code in these three files that needs to trigger orchestrator-tier behaviour (Firebase writes, `toggleTimer()`, `togglePause()`) must go through `netHandlers()`, never a direct import. `src/shared/audio.js` is exempt from this rule in the other direction — it is a leaf `shared` module, so `ui` files MAY import it directly (research: "shared is the only leaf tier ui may import that isn't engine/state").
**Mechanically enforced by:** `scripts/module_graph_check.js` — "ui may import shared/engine/state, but ui must NEVER import net (D-07)... That rule gets its own dedicated, explicitly-labeled assertion." This scan runs automatically against every file under `src/`, including the new `src/shared/audio.js`, with no registration needed — confirmed from the tool's own header comment.

### localStorage persistence idiom (per-browser preference)
**Source:** `src/orchestrator.js:168` (`toggleTimer()`, existing) — `try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}`
**Apply to:** the new mute state (D-13, `pp_muted` per research's Standard Stack table) — same key-naming convention (`pp_` prefix), same `try/catch`-wrapped write, same `"1"`/`"0"` string encoding, read back with the same defensive pattern. Do not invent a second persistence mechanism (research is explicit on this point).

### CLOCK-03 defensive per-tick reset (re-entrancy under `setClockUI()`'s 500ms interval)
**Source:** `src/ui/panel.js:72-76` (quoted in full above)
**Apply to:** any new DOM element/handler rendered inside `setClockUI()` — the mute button's `onclick` binding (if bound inside `setClockUI()` rather than once in `wireLobby()`) MUST be reset at the top of every tick before any conditional branch, exactly like `numEl.onclick=null` above. The safer option, matching how `#scPause`/`#scTimerToggle` already work, is to bind `onclick` exactly once in `wireLobby()` and have `setClockUI()` only ever touch `innerHTML`/`style.display`/`title` — avoiding the re-entrancy question entirely. Recommend the planner choose this second, already-proven shape for the mute button rather than inventing a new per-tick-safe binding pattern.

### Test-harness convention (DOM-free Node script, no assertion library)
**Source:** `scripts/narration_test.js:1-42` and `:984-985` (quoted in full above)
**Apply to:** `scripts/audio_mapping_test.js` — shebang, header comment naming what's gated and why, `check(name, actual, expected)` local counter, `console.log` PASS/FAIL lines with `.padEnd()` alignment, `process.exit(failures?1:0)`. Register in `package.json`'s `scripts.test` chain (line 7) by appending `&& node scripts/audio_mapping_test.js` — follow the exact `&&`-chained single-line convention already used for all 18 existing scripts (do not convert to an array or separate npm script).

### Module layering gate — new file requirements
**Source:** `scripts/module_graph_check.js:1-30` (header read in full)
**Apply to:** `src/shared/audio.js` — this file is auto-scanned by the existing gate with zero registration needed (it walks every `.js` file under `src/` recursively). It must: (a) import nothing from `src/net/`, `src/orchestrator.js`, `src/ui/*`, or `src/state/` (a `shared` file may depend on nothing else under `src/` per the tier rules the scan enforces); (b) introduce no import cycle. If `audio.js` needs `appState` (e.g. to read `appState.mySeat` for viewer-aware behaviour) that would violate tier discipline — research's design deliberately avoids this by keeping `audio.js` fully self-contained (its own `pp_muted` localStorage read, no `appState` dependency), which the planner should preserve.

## No Analog Found

None — every file in the expected touch-list above has at least one exact or role-matched analog already in the codebase. This is a low-risk-analog phase: the two hardest pieces (Web Audio playback and the timer-toggle bug) both have a directly-proven precedent to copy (`src/shared/index.js`'s leaf-tier discipline for the module shape; `togglePause()`/`applyPauseState()`/`watchPause()` for the local/networked branch and the extraction-into-a-shared-function shape).

## Metadata

**Analog search scope:** `src/shared/`, `src/ui/`, `src/orchestrator.js`, `scripts/`, `index.html`, `package.json` — all read directly in this worktree, no inference from RESEARCH.md's own code examples where the actual source could be read instead.
**Files scanned:** `src/shared/index.js` (213 lines, read in full), `scripts/narration_test.js` (985 lines; header+harness read, lines 1-80), `src/ui/panel.js` (611 lines; lines 1-115 read in full — covers imports through the full `#scPause`/`#scTimerToggle` block), `src/orchestrator.js` (1441 lines; lines 125-350 read — covers `broadcastFlip`/`watchFlip`/`toggleTimer`/`togglePause`/`watchPause`/`watchTimer`/`expireShotClock` in full, plus `wireLobby()`'s click-binding lines located via grep at 1310-1311), `src/ui/board.js` (882 lines; lines 850-882 read in full — covers `setFlipCoin`/`setFlipActive` completely), `src/ui/util.js` (1442 lines; lines 1250-1319 read in full — covers `soloBotGame`/`applyPauseState`/`toggleShotClockPause`/`shotClockTick`/`applyShotClockPenalty`/`currentTurnSeat`), `index.html` (1094 lines; `#creditsModal` block at lines 935-965 read in full), `package.json` (13 lines, read in full), `scripts/module_graph_check.js` (214 lines; header read, lines 1-40).
**Pattern extraction date:** 2026-07-31

---

*Phase: 21-sound-the-clock-toggle*
