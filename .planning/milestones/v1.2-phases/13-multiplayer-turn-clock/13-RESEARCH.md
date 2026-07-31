# Phase 13: Multiplayer Turn Clock - Research

**Researched:** 2026-07-25
**Domain:** First-party browser game code archaeology (vanilla ES modules + Firebase RTDB compat SDK). No external libraries, no new dependencies — this phase is 100% "read the actual current code and design against its exact shapes."
**Confidence:** HIGH — every claim below is grounded in a direct read of the live post-refactor source (line numbers reconfirmed against the actual files, not copied from CONTEXT.md's line-number hints, several of which had drifted).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**CLOCK-01 — the stall (reframed during discussion)**
- **D-01:** The stall is **NOT a live code bug in the refactored version.** Verified live during this discussion: a **clean-slate** Safari multiplayer game (site data cleared) starts the clock running normally on its own. In Chrome it never reproduced at all. The earlier "stall" came from **stale/mismatched local session data** left in `localStorage` by the pre-refactored version.
- **D-02:** Fix direction = **harden the boot against stale/mismatched local state** so a returning player who last played the old version starts clean, rather than chasing a first-turn clock bug that does not reproduce on a clean slate. Approach is for research/planning to determine — e.g. detect and clear/migrate old/incompatible `localStorage` keys (`pp_timerOff`, `pp_sess`, `pp_solo`, resume/decision-log state) on boot. — **Reversibility:** costly — clearing/migrating persisted keys touches the resume/recovery path (`getMyId`/`saveSession`/host-refresh replay) and a wrong migration could wipe a legitimately in-progress game; version-guard rather than blanket-clear.
- **D-03:** **Do NOT treat "timer off at start" as the bug.** `timerOff` is a legitimately *remembered preference*: the host reads `pp_timerOff` from `localStorage` and seeds the shared Firebase flag on boot (`src/orchestrator.js:976`). A game that boots with the timer off but plays normally is working as designed. The hardening in D-02 must distinguish "remembered off" (keep) from genuinely stale/incompatible state (clear).

**CLOCK-02 — multiplayer pause**
- **D-04:** Multiplayer pause is a **true, global freeze of the entire game** — it halts the countdown AND any bot captains mid-play, so nothing happens until someone resumes. ("Without missing bot actions" = a real freeze, not just stopping the countdown.) Reuse the solo pause mechanism: `shotClockPaused` doubles as the whole-game pause flag via `waitWhilePaused()`/`sleep()`, which is how solo already freezes bots (`src/ui/util.js:535-539, 607-628`). This must be host-authoritative and synced so guests see the paused state.
- **D-05:** **Keep** the existing ⏱ timer on/off toggle in multiplayer AND add the ▶/⏸ pause. Two separate controls: the ⏱ toggle removes countdown pressure (timer off, decisions never time out); the ▶/⏸ pause freezes the whole game. Note this revisits the old `D-04` code comment ("multiplayer on the ⏱ toggle only"; `src/ui/util.js:593`) — that constraint is now intentionally lifted.
- **D-06:** **Anyone can pause or resume, anytime** — any player (host or guest), even when it is not their turn. A guest's pause/resume must reach the host (host runs the game loop and bots), so it needs to sync (e.g. a shared Firebase pause flag the host reacts to), analogous to the existing `timerOff` sync path (`toggleTimer`/`watchTimer`, `src/orchestrator.js:147-171`).
- **D-07:** On resume, the current player's 30s countdown **picks up where it left off** (e.g. 12s left when paused → 12s left on resume), matching solo behavior today via `shotClockPauseElapsed` (`src/ui/util.js:612-628`).

**CLOCK-03 — clickable PAUSED image**
- **D-08:** When paused, the **large pause symbol** shown in the middle of the clock (the `#shotClockNum` area rendering `PAUSE_SYMBOL_IMG`, `src/ui/panel.js:84`) becomes itself a clickable button that resumes. Not the whole clock panel, and no new large overlay/artwork.
- **D-09:** This clickable-to-resume behavior applies in **both solo and multiplayer** (consistent everywhere the game can be paused). Today only the small corner `#scPause` button resumes (`src/orchestrator.js:1011`); the big symbol becomes a second resume affordance.

**Determinism guardrail**
- **D-10:** Pause and timer are **wall-clock / UI concerns, not engine state.** None of these changes may affect the deterministic engine or lockstep replay — the determinism regression harness must stay green (30/30, VERIFY-02). The engine (`src/engine/`) has no clock/pause access by design; keep it that way.

### Claude's Discretion
- Exact detection/clear/migrate strategy for stale `localStorage` on boot (D-02) is open — research and planning decide, subject to the version-guard caution in D-02. **Resolved by this research: see Architecture Patterns → Pattern 3.**
- The precise sync shape for the pause flag (D-06) — a new Firebase node vs. reuse of an existing channel — is an implementation detail for planning, as long as it mirrors the host-authoritative pattern already used for `timerOff`/`clock`. **Resolved by this research: see Architecture Patterns → Pattern 1.**

### Deferred Ideas (OUT OF SCOPE)
Filed to `.planning/REQUIREMENTS.md` Future Requirements during the CONTEXT discussion (out of scope for Phase 13):
- **LOAD-01:** Slow-connection boot must not reveal the game until assets are ready — the 6s escape hatch in `src/orchestrator.js:1076` hides the loader too early on slow links.
- **LOAD-02:** The preload set (`src/ui/util.js:707`) omits icons/badges/compass/clock — should cover all first-view art. (~18 MB total download; board.png alone 4.5 MB.)
- **LOAD-03:** Welcome screen must be the instant default for first-time visitors — the "hoisting the sails" loader must NOT precede it. Load the ~18 MB of game assets only after the player chooses to play, showing the load screen at that entry point. Fast initial site load for everyone.

Not in scope (per CONTEXT's Phase Boundary): asset-loading/boot-ordering rework (the LOAD items above), narration, storm movement, or any other punch-list item.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| CLOCK-01 | In a multiplayer game (2+ windows), the turn clock starts running normally so the first turn begins — the game no longer stalls "paused" before it starts, and no timer off/on toggle workaround is needed *(critical)* | Architecture Patterns → Pattern 3 (localStorage schema-version guard) is the complete recommended implementation; Determinism/engine confirmed unaffected; Validation Architecture maps this to a manual/MCP boot-sequence check (Wave 0 gap — no existing automated fixture). |
| CLOCK-02 | A play/pause control is available in multiplayer games so any player can pause without missing bot actions | Architecture Patterns → Pattern 1 (host-authoritative boolean sync, mirrors `timerOff`) + Pattern 2 (reuse of the existing `waitWhilePaused()`/`shotClockPaused` freeze — no new freeze code needed) is the complete recommended implementation; Common Pitfalls 1/2/3/4 flag the concrete risks (net-contract-check inventory count, auto-hide-pause coupling, MCP testability, shared-`pp_id` gotcha). |
| CLOCK-03 | The large "PAUSED" image is itself a clickable button that resumes the clock when pressed | Code Examples → `setClockUI()` de-gating and clickable-symbol wiring section gives the exact two render-branch edits plus the injected-handler-seam routing (`onTogglePause`) required since `src/ui/panel.js` cannot import `src/orchestrator.js` directly. |
| VERIFY-02 (guardrail on this phase, owned by Phase 14) | The determinism regression harness stays green (30/30) | Determinism Guardrail confirmed live this session (`npm run test:determinism` → 30/30 PASS before this phase begins); `src/engine/index.js` confirmed to have zero clock/pause/localStorage/wall-clock references; Common Pitfall 5 documents how to keep it that way. |
</phase_requirements>

## Summary

Phase 13 is a surgical extension of two proven, already-working sync patterns — not new architecture. `timerOff` (multiplayer's existing "any client writes a shared boolean, host reacts authoritatively, every client mirrors it into `setClockUI()`") is the exact template CLOCK-02's new pause flag should clone verbatim, down to the file layout (one function added to `src/net/writers.js`, one to `src/net/watchers.js`, both re-exported through `src/net/index.js`, both imported and wired in `src/orchestrator.js`). The freeze mechanism itself needs **zero new code** — `appState.shotClockPaused` already halts every bot action today via `waitWhilePaused()`/`sleep()` (`src/ui/util.js:535-539`); it is simply never turned on in multiplayer because `toggleShotClockPause()` is hard-gated to `soloBotGame()` (`src/ui/util.js:608,613`). CLOCK-02's job is to route a *networked* toggle into that same flag, not invent a new freeze.

CLOCK-01's stale-state hardening has a clean, low-risk design: none of the four `localStorage` keys the app persists (`pp_id`, `pp_timerOff`, `pp_sess`, `pp_solo`) carries a schema-version marker today. Introducing one on the two *resumable-game-state* blobs (`pp_sess`, `pp_solo` — NOT `pp_id`, which is a stable opaque identity, and NOT `pp_timerOff`, a plain boolean preference per D-03) gives boot() a mechanical, non-blanket way to detect "this was written by a pre-refactor build" (that build wrote no version field at all) versus "this is a legitimate resume of the current build" (always carries the current version stamp) — satisfying D-02's "version-guard, not blanket-clear" requirement exactly, and self-resolving for every currently-affected returning player the first time they load the patched build.

CLOCK-03 is the smallest of the three: `setClockUI()` already renders `PAUSE_SYMBOL_IMG` into `#shotClockNum` in exactly two branches (`src/ui/panel.js:84,102-105`); making it clickable is a two-line addition (cursor + onclick) inside those same branches, paired with clearing both in every other branch since `setClockUI()` re-runs on a 500ms interval (`src/main.js:157`) and must never leave a stale handler live once the panel moves on to a different state.

**Primary recommendation:** Extend the existing `timerOff` sync template with a new `paused` Firebase node and reuse `appState.shotClockPaused`/`shotClockPauseElapsed` end-to-end (no new appState fields); de-gate `soloBotGame()`/`isHost` checks in `setClockUI()`'s pause-button visibility and paused-branch rendering so both solo and multiplayer render identically; version-stamp `pp_sess`/`pp_solo` on write and check the stamp on boot before ever attempting a resume.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Boot-time stale-`localStorage` detection/clear | Browser (Client) | — | `getMyId`/`saveSession`/`clearSession`/`saveSoloState`/`clearSoloState` (`src/ui/util.js`) and `boot()` (`src/orchestrator.js`) already own all `localStorage` reads/writes; no other tier touches it (`src/state/` and `src/engine/` are mechanically forbidden from referencing it — see Determinism Guardrail below). |
| Multiplayer pause freeze (halts countdown + bots) | API/Backend-equivalent (Firebase RTDB, host-authoritative) | Browser (Client, UI toggle) | Host is the sole game-loop authority (documented architectural constraint); only the host may mutate `appState.shotClockPaused`'s *authoritative* value and the interval it drives — guests only ever request a toggle over the network, mirroring `timerOff`. |
| Pause-flag network sync | API/Backend-equivalent (Firebase RTDB) | — | New `rooms/{room}/paused` node, `src/net/writers.js` + `src/net/watchers.js`, mirrors the existing `timerOff` node byte-for-byte in shape and authority split. |
| Clock UI rendering (countdown, paused state, clickable symbol) | Browser (Client) | — | `setClockUI()` (`src/ui/panel.js`) is pure DOM rendering off `appState`; already reads `appState.shotClockPaused`/`clockState`/`timerOff` — no new render surface needed, only de-gating existing branches. |
| Deterministic engine (turn resolution, RNG, board state) | Engine (pure simulation) | — | `src/engine/` has zero clock/pause/`localStorage`/wall-clock access today (confirmed by grep — see Determinism Guardrail) and this phase must keep it that way; pause/timer are UI/net concerns layered entirely outside it. |

## Standard Stack

No new libraries, packages, or dependencies. This phase is a pure extension of the existing first-party stack:

| Layer | Already in use | Phase 13 usage |
|-------|-----------------|-----------------|
| Multiplayer sync | Firebase RTDB v12.15.0 (compat SDK), via `src/net/` | One new node (`rooms/{room}/paused`), one new writer, one new watcher — same shape as `timerOff`. |
| Persistence | `localStorage` (native Web API), via `src/ui/util.js` | Add a schema-version field to two existing JSON blobs (`pp_sess`, `pp_solo`); no new keys. |
| Rendering | Vanilla DOM, `src/ui/panel.js`'s `setClockUI()` | De-gate two existing conditionals; add `onclick`/`cursor` to an existing `<span>`. |

### Alternatives Considered

| Instead of | Could use | Tradeoff |
|------------|-----------|----------|
| Mirroring the `timerOff` boolean-flag pattern for pause | A richer `{paused, byWhomSeat, pausedAt}` object node | Rejected: D-06/D-07 need only a boolean + host-computed elapsed time (already tracked locally in `appState.shotClockPauseElapsed`, never needs to cross the network) — a richer payload adds surface area with no requirement driving it. Keep it a plain boolean exactly like `timerOff`. |
| Version-stamping `pp_sess`/`pp_solo` | A single global "app build version" constant compared against a hardcoded `localStorage['pp_build']` | Rejected: a global build-version bump would fire on every deploy, not just schema-affecting ones, forcing an unnecessary resume-loss on every unrelated release. Per-blob schema constants only bump when THAT blob's shape actually changes. |
| Version-stamping `pp_sess`/`pp_solo` | Clearing all four keys unconditionally on every boot when a "new build" flag differs | Rejected outright by D-02's explicit "costly reversibility" caution — this is the blanket-clear the discretion note forbids. |

**Installation:** None — no new dependencies. `npm test` (existing) already exercises the determinism harness this phase must not break; no new install step.

## Package Legitimacy Audit

**Not applicable.** This phase introduces zero new npm/PyPI/crates packages — it only adds first-party functions to `src/net/writers.js`, `src/net/watchers.js`, `src/orchestrator.js`, `src/ui/util.js`, and `src/ui/panel.js`, all following patterns already present in those files. No `package-legitimacy check` run was needed or performed.

## Architecture Patterns

### System Architecture Diagram

```
                         ┌─────────────────────────────────────────────┐
                         │              HOST BROWSER                    │
                         │  (sole game-loop authority — runs runLiveNet)│
                         │                                               │
  clicks #scPause   ───▶ │  togglePause()                               │
  or #shotClockNum       │    │                                         │
  (any player,           │    ├─ solo/pass-and-play (no room):          │
  either browser)         │    │     toggleShotClockPause() directly    │
                         │    │     → mutates appState.shotClockPaused  │
                         │    │       + shotClockDeadline/PauseElapsed  │
                         │    │       + stops/restarts shotClockTimer   │
                         │    │       (waitWhilePaused()/sleep() already│
                         │    │        freeze every awaited bot action) │
                         │    │                                         │
                         │    └─ multiplayer (room set):                │
                         │          netSetPaused(db,room,!current) ─────┼──▶  Firebase RTDB
                         └─────────────────────────────────────────────┘   rooms/{room}/paused
                                                                                    │
                         ┌─────────────────────────────────────────────┐          │
                         │           EVERY CONNECTED BROWSER             │◀─────────┘
                         │        (host AND every guest, via watch)      │
                         │                                                │
                         │  watchPause() reacts on value change:          │
                         │    appState.shotClockPaused = !!snapshot.val() │
                         │    if (appState.isHost) applyPauseState(...)   │
                         │       ── only the host mutates deadline/       │
                         │          pauseElapsed/timer interval           │
                         │    setClockUI() ── every client re-renders     │
                         └─────────────────────────────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────────────────┐
                         │   src/ui/panel.js setClockUI()                │
                         │   (500ms interval, src/main.js:157)           │
                         │                                                │
                         │   if (appState.shotClockPaused):               │
                         │     render "paused" branch, big pause symbol  │
                         │     (#shotClockNum) — now ALSO clickable,      │
                         │     onclick → togglePause() (CLOCK-03)         │
                         └─────────────────────────────────────────────┘

  ── boot() stale-state hardening (CLOCK-01), independent of the above ──

  page load → boot()
    │
    ├─ localStorage.getItem("pp_sess") → JSON.parse
    │     if parsed && parsed.v !== SESSION_SCHEMA_V → clearSession(); treat as absent
    │     else if parsed.room → attempt reconnect (existing resumeHostGame/watchRoom path)
    │
    └─ (no session) → localStorage.getItem("pp_solo") → JSON.parse
          if parsed && parsed.v !== SOLO_SCHEMA_V → clearSoloState(); treat as absent
          else if parsed.seed != null → resumeSoloGame(parsed)

  pp_id (identity) and pp_timerOff (preference) are NEVER touched by this guard — D-03/keep.
  Engine (src/engine/) has NO access to any of the above — pause/timer/localStorage are
  entirely outside src/engine/, and this phase must keep it that way (determinism guardrail).
```

### Recommended Project Structure

No new files. Every change lands inside the existing tier files:

```
src/
├── net/
│   ├── writers.js      # + netSetPaused(db, room, val, onError)   — mirrors netSetTimerOff (L57-59)
│   ├── watchers.js     # + netWatchPaused(db, room, handler)      — mirrors netWatchTimerOff (L60-64)
│   └── index.js        # + import/re-export netSetPaused, netWatchPaused (barrel, same pattern as L28,L21)
├── orchestrator.js     # + togglePause(), watchPause(); beginGame() wires watchPause() alongside watchTimer()
│                        # boot() gains the two version-guard checks (pp_sess / pp_solo)
├── ui/
│   ├── util.js          # toggleShotClockPause() de-gated + factored (extract applyPauseState helper);
│   │                    # saveSession()/saveSoloState() gain a `v:` field; two SCHEMA_V constants added
│   └── panel.js         # setClockUI(): un-gate pause-button visibility + paused-branch checks;
│                        # wire #shotClockNum onclick/cursor in both paused-render branches
```

### Pattern 1: Host-Authoritative Boolean Sync (the `timerOff`/pause template)

**What:** A plain boolean node at `rooms/{room}/{name}` that ANY connected client (host or guest) may write; EVERY connected client watches the same node and mirrors its value into local `appState`; only the HOST additionally reacts by mutating the actual timing/interval state that drives gameplay.

**When to use:** Any multiplayer control surface where (a) the toggle itself has no meaningful "owner" (anyone should be able to flip it) but (b) the side effect it drives can only correctly be computed by the single browser running the authoritative game loop.

**Example — the exact existing template CLOCK-02 clones (verified live, `src/orchestrator.js:147-171`):**
```javascript
// WRITE (any client): src/orchestrator.js
export function toggleTimer(){
  if(!appState.db||!appState.room)return;
  const next=!appState.timerOff;
  try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}
  netSetTimerOff(appState.db,appState.room,next,netFail("timerOff"));
}
// WATCH (every client — host branch does the authoritative work):
export function watchTimer(){
  netWatchTimerOff(appState.db,appState.room,s=>{
    const was=appState.timerOff;
    appState.timerOff=!!s.val();                       // every client mirrors the flag
    if(appState.isHost&&appState.timerOff)stopShotClock();
    else if(appState.isHost&&was&&!appState.timerOff&&appState.shotClockSeat==null&&!appState.turnExpired){
      const seat=currentTurnSeat();
      const p=seat!=null?appState.game.players[seat]:null;
      if(p&&!p.done)rearmShotClock(p);
    }
    setClockUI();
  });
}
```
**Recommended CLOCK-02 mirror (new code, not yet written — this is the shape to implement):**
```javascript
// src/net/writers.js — mirrors netSetTimerOff exactly
export function netSetPaused(db, room, val, onError) {
  return withReporter(db.ref("rooms/" + room + "/paused").set(val), onError);
}
// src/net/watchers.js — mirrors netWatchTimerOff exactly
export function netWatchPaused(db, room, handler) {
  if (!db || !room) return null;
  const ref = db.ref("rooms/" + room + "/paused");
  return registry.attach({ scope: "room", ref, event: "value", callback: handler, label: "paused" });
}
// src/orchestrator.js
export function togglePause(){
  if(appState.db&&appState.room){
    netSetPaused(appState.db,appState.room,!appState.shotClockPaused,netFail("pause"));
  }else{
    toggleShotClockPause();   // solo/pass-and-play: no network hop, existing local path
  }
}
export function watchPause(){
  netWatchPaused(appState.db,appState.room,s=>{
    const now=!!s.val();
    if(appState.isHost)applyPauseState(now);   // host: the same math toggleShotClockPause() does today
    else appState.shotClockPaused=now;         // guest: mirror only, for rendering
    setClockUI();
  });
}
```

### Pattern 2: Reusing the Existing Freeze Mechanism (no new "freeze" code)

**What:** `appState.shotClockPaused` already IS the whole-game pause flag — `waitWhilePaused()` (`src/ui/util.js:535-539`) makes every `sleep()` call across the entire bot/turn-flow codebase stall first, and virtually all bot pacing goes through `sleep()`. This is D-04's "freeze everything" requirement, already built, already correct — CLOCK-02 must NOT reimplement it, only make it reachable from multiplayer.

**Recommended factoring:** extract the state-mutation body of today's `toggleShotClockPause()` (`src/ui/util.js:612-628`) into a standalone `applyPauseState(nowPaused)` helper (no `isHost`/`soloBotGame()` gate inside it — the gate moves to the callers), so both the solo path and the new multiplayer `watchPause()` host-branch call the identical math:
```javascript
// src/ui/util.js — extracted from today's toggleShotClockPause() body
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
// toggleShotClockPause() becomes a thin solo-only wrapper:
export function toggleShotClockPause(){
  if(!appState.isHost)return;                 // soloBotGame() gate REMOVED per D-05/D-06
  applyPauseState(!appState.shotClockPaused);
  netHandlers().onSetClockUI();
}
```
This is the D-07 "resume where it left off" math, completely unmodified — just made callable from two entry points instead of one.

### Pattern 3: `localStorage` Schema Version Guard (CLOCK-01 hardening)

**What:** Stamp every *resumable-game-state* JSON blob with a small integer version at write time; check it before ever trusting the blob to drive a resume at boot time. A blob with no `v` field (or the wrong `v`) is treated as absent — cleared via the existing `clearSession()`/`clearSoloState()` functions, never partially trusted.

**Complete `localStorage` key inventory** (confirmed via `grep -rn "localStorage" src/ index.html` — nothing else exists):

| Key | Written by | Read by | Shape | D-02 category |
|-----|-----------|---------|-------|----------------|
| `pp_id` | `getMyId()` (`src/ui/util.js:718-720`) | `getMyId()` (self, cached at boot) | opaque random string `"u"+...` | **Never versioned/cleared** — stable device identity, not resumable game state; clearing it would just assign a new random ID (harmless but pointless). |
| `pp_timerOff` | `toggleTimer()` (`src/orchestrator.js:150`) | `beginGame()` seed-on-host (`src/orchestrator.js:976`) | `"0"` \| `"1"` string | **Never versioned/cleared** — D-03: legitimately remembered preference, keep forever, no schema to go stale. |
| `pp_sess` | `saveSession()` (`src/ui/util.js:724`) | `boot()` (`src/orchestrator.js:1086`) | `{room, mySeat, isHost}` | **Version-guard.** Drives the multiplayer resume/reconnect attempt (`resumeHostGame`/`watchRoom`) — exactly the path D-01/D-02 identify as the stall source when it's stale/pre-refactor shaped. |
| `pp_solo` | `saveSoloState()` (`src/ui/util.js:736`) | `boot()` (`src/orchestrator.js:1090`) | `{...soloMeta, dlog}` (`soloMeta` = `{name/names, strategies, seed, passAndPlay?}`) | **Version-guard.** Drives `resumeSoloGame()` — same class of risk, solo side. |

**Recommended implementation (new code):**
```javascript
// src/ui/util.js — two independent constants: pp_sess and pp_solo can evolve on separate
// schedules (multiplayer resume vs. solo resume are different code paths), so bump each
// independently rather than sharing one global "build" version (see Alternatives Considered).
export const SESSION_SCHEMA_V = 1;
export const SOLO_SCHEMA_V = 1;

export function saveSession(){
  try{localStorage.setItem("pp_sess",JSON.stringify({v:SESSION_SCHEMA_V,room:appState.room,mySeat:appState.mySeat,isHost:appState.isHost}));}catch(e){}
}
export function saveSoloState(){
  if(!appState.soloMeta)return;
  try{localStorage.setItem("pp_solo",JSON.stringify({v:SOLO_SCHEMA_V,...appState.soloMeta,dlog:appState.dlog}));}catch(e){}
}
```
```javascript
// src/orchestrator.js boot() — insert the guard immediately after each JSON.parse, before
// the existing `if(!sess||!sess.room)` / `if(solo&&solo.seed!=null...)` checks:
let sess=null;try{sess=JSON.parse(localStorage.getItem("pp_sess"));}catch(e){}
if(sess&&sess.v!==SESSION_SCHEMA_V){clearSession();sess=null;}   // pre-refactor or stale — treat as no session
if(!sess||!sess.room){
  let solo=null;try{solo=JSON.parse(localStorage.getItem("pp_solo"));}catch(e){}
  if(solo&&solo.v!==SOLO_SCHEMA_V){clearSoloState();solo=null;}  // same guard, solo side
  if(solo&&solo.seed!=null&&solo.strategies){resumeSoloGame(solo);return;}
}
```
**Why this satisfies D-02's "costly reversibility" caution without a blanket clear:** every blob written by the *current* build always carries the current `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` and is therefore never spuriously cleared — a legitimately in-progress game saved five minutes ago under this same build is completely safe. Only two things clear a blob: (1) it predates this guard entirely (no `v` field — this is unambiguously every pre-refactor player's current stale state, the exact case D-01 diagnosed and D-02 asks to fix), or (2) a future deliberate bump of `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` when the team changes that blob's shape again — which is precisely the trigger a version guard exists to catch. `pp_id`/`pp_timerOff` are structurally excluded from the whole mechanism, so a version bump can never accidentally wipe a player's identity or remembered timer preference.

### Anti-Patterns to Avoid

- **Reimplementing the bot-freeze mechanism for multiplayer:** `waitWhilePaused()`/`sleep()` already freezes bots correctly (D-04's requirement is already met in solo). Do not add a second, parallel "is multiplayer paused" check anywhere in the turn-flow/battle code — route everything through the existing `appState.shotClockPaused` flag so there is exactly one freeze mechanism, used by both modes.
- **Giving guests direct authority to mutate `shotClockDeadline`/`shotClockPauseElapsed`:** only the host may run `applyPauseState()`. A guest calling it directly would compute elapsed time from a `shotClockDeadline` the guest never actually owns/updates (guests only ever read `appState.clockState`, a mirrored snapshot — see `setClockUI()`'s `appState.isHost?...:appState.clockState` branch) — this would silently desync the countdown. Guests only ever write the network flag; they never touch `shotClockDeadline` locally.
- **A blanket `localStorage.clear()` (or clearing all four keys together) on any boot-time mismatch:** explicitly forbidden by D-02. Even clearing `pp_sess`+`pp_solo` together on a mismatch of EITHER is unnecessary over-reach — clear only the specific blob that failed its own version check.
- **Leaving `#shotClockNum`'s `onclick` handler wired after the panel leaves the paused state:** `setClockUI()` runs every 500ms (`src/main.js:157`) and re-renders `numEl.textContent`/`innerHTML` on every tick regardless of state — every branch that does NOT show the pause symbol must explicitly clear `numEl.onclick=null` and any pointer-cursor styling, or a stale handler from a previous paused render silently survives into (e.g.) the active countdown branch and produces an inexplicable click-to-do-nothing-useful (or worse, click-to-toggle-pause-when-not-visually-paused) bug.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multiplayer control-flag sync (pause) | A new WebSocket/polling/ad-hoc sync mechanism | The existing `timerOff` Firebase-node + watcher/writer template | Already proven, already handles reconnect (a guest who joins mid-pause reads the current `paused` value the instant its `watchPause()` attaches, same as `timerOff` today), already fits the registry's attach/detach lifecycle (`src/net/registry.js`) with zero new plumbing concepts. |
| Bot-freeze-while-paused | A new "is anything paused" check threaded through every bot decision call site | `waitWhilePaused()`/`sleep()`, already called from essentially every async pacing point in the turn/battle flow | Already correct, already tested implicitly by every solo pause today — the only gap is that multiplayer never sets `appState.shotClockPaused=true`, not that the freeze itself is missing. |
| Stale-state detection | A generic "diff old vs new app version" migration framework | A plain integer field compared with `!==`, one per resumable blob | The problem is genuinely this small — two blobs, one field each. A framework would be solving a problem this codebase doesn't have (no other schema migrations are anticipated as of this milestone). |

**Key insight:** every piece CLOCK-01/02/03 need already exists in the codebase in a slightly-too-narrow form (solo-only pause, no version stamp, non-clickable symbol). The correct scope for every task in this phase is "widen an existing mechanism," never "invent a new one."

## Common Pitfalls

### Pitfall 1: `scripts/net_contract_check.js`'s hardcoded watcher inventory will FAIL the moment `netWatchPaused` is added, until it's updated
**What goes wrong:** `npm test` (and therefore the phase's own verification gate) will report `FAIL watcher inventory completeness` the instant `netWatchPaused` is added to `src/net/watchers.js`.
**Why it happens:** `scripts/net_contract_check.js` hardcodes both an explicit `WATCHER_INVENTORY` array (18 names, confirmed by direct read, `scripts/net_contract_check.js:264-270`) AND a literal expected count of `registry.attach()` calls (`attachCount !== 18`, line 293) — **deliberately not derived from the file under test**, specifically so a silently-dropped watcher can't game the check. Adding a 19th watcher trips both assertions simultaneously.
**How to avoid:** the plan MUST include a task step that adds `"netWatchPaused"` to `WATCHER_INVENTORY` and bumps both the `attachCount !== 18` comparison and the log-line's literal `"eighteen"` text to `19`/`"nineteen"` in `scripts/net_contract_check.js`, in the SAME commit that adds `netWatchPaused` to `src/net/watchers.js` — never as a follow-up fix.
**Warning signs:** `npm test` (or `node scripts/net_contract_check.js` alone) fails with `INVENTORY: expected exactly 18 registry.attach() calls in src/net/watchers.js, found 19` and/or `"netWatchPaused" is not exported by src/net/watchers.js` style messages if only one side is updated.

### Pitfall 2: `document.hidden`-triggered auto-pause only fires in solo today — this phase does not (and per CONTEXT, should not) change that, but it's easy to accidentally couple
**What goes wrong:** `src/main.js:147-151`'s `visibilitychange` listener already calls `toggleShotClockPause()` when a solo/bot game's tab backgrounds — gated by `ui.soloBotGame()`. If the pause-mechanism refactor (Pattern 2 above) accidentally removes that gate too (rather than only the `soloBotGame()` gate inside `toggleShotClockPause()` itself), backgrounding ANY multiplayer tab would silently pause the whole table for everyone — a behavior CONTEXT never asked for and that would be surprising in a real 2+-human game.
**Why it happens:** `toggleShotClockPause()` is the single function both the manual-click path AND the auto-pause-on-hide listener call. Widening its internal gate (removing `soloBotGame()` per D-05/D-06) without separately reconsidering the auto-hide listener's own `ui.soloBotGame()` guard at `src/main.js:148` would unintentionally extend auto-hide-pause to multiplayer as a side effect.
**How to avoid:** leave `src/main.js:147-151`'s own `ui.soloBotGame()` condition completely untouched — it is a SEPARATE decision (not in scope per CONTEXT's phase boundary) from "can `toggleShotClockPause()`/`togglePause()` be called in multiplayer." Flagged as an Open Question below for the planner/Wyatt, not silently resolved either way.
**Warning signs:** a multiplayer playtest where switching Chrome tabs on ANY player's browser (not just backgrounding the whole app) freezes the game for every other player unexpectedly.

### Pitfall 3: MCP/headless multiplayer testing cannot use `document.hidden` spoofing to validate pause
**What goes wrong:** per the project's own MP test-harness memory, "clicking the clock and spoofing `document.hidden`/`visibilityState` did NOT resume it" during Phase 12 testing — a documented, already-hit gotcha with the *auto*-pause path specifically.
**Why it happens:** Chrome-MCP-driven tabs are never OS-foreground, so `document.hidden` is structurally always `true` for them — spoofing the property doesn't fire the real browser `visibilitychange` event the listener is bound to.
**How to avoid:** this pitfall applies to the pre-existing auto-hide-pause path, NOT to the new manual pause CLOCK-02/03 add — a real `.click()` on `#scPause` or `#shotClockNum` fires normally regardless of `document.hidden`, so manual pause/resume IS reliably MCP-drivable. Validation tasks should exercise the manual click path, and should NOT attempt to validate resume via `document.hidden` manipulation.
**Warning signs:** a validation script that tries to "resume" via visibility-property spoofing and silently no-ops.

### Pitfall 4: Same-machine two-tab multiplayer testing shares `localStorage['pp_id']`
**What goes wrong:** all tabs in one Chrome profile share `localStorage`; `myId` is read once from `pp_id` at load, so a naively-opened second tab rejoins the room AS the host (same identity), making guest-side pause/resume impossible to test in isolation.
**Why it happens:** `getMyId()` (`src/ui/util.js:718-720`) reads/creates `pp_id` from `localStorage`, which is profile-scoped, not tab-scoped.
**How to avoid:** before each additional tab loads, `localStorage.clear(); localStorage.setItem('pp_id','<unique>')`, then reload — sequentially, not in parallel (a later tab doesn't see an earlier tab's in-memory id change). Playwright separate browser contexts avoid this entirely if available.
**Warning signs:** two tabs both claim seat 0, or a guest's pause click appears to have host authority it shouldn't.

### Pitfall 5: Determinism harness must be re-verified GREEN, but this phase should never need to touch anything the harness actually replays
**What goes wrong:** running `npm run test:determinism` after unrelated changes and discovering a diff would signal an accidental engine-adjacent edit — a mistake that's easy to make by, e.g., accidentally importing something from `src/engine/` into new pause code, or (subtly) letting a pause-related value leak into anything the engine's replay/hash path touches.
**Why it happens:** `src/engine/index.js` is confirmed (by grep) to contain zero references to `clock`, `timerOff`, `localStorage`, `Date.now`, or `Math.random` in actual code (only two unrelated comment uses of the word "clockwise"/"wall-clock") — it is already fully isolated from wall-clock/pause concerns. Any accidental coupling would be a regression this phase introduces, not a pre-existing gap.
**How to avoid:** every pause/timer change stays inside `src/net/`, `src/orchestrator.js`, and `src/ui/`. Run `npm run test:determinism` (isolated) after each plan's tasks, not just once at the end of the phase — the corpus (30 seeds, `scripts/fixtures/determinism/`) currently verifies clean (confirmed live during this research: `All seeds passed.`, 30/30).
**Warning signs:** any diff in `npm run test:determinism`'s hash output, or a code review turning up an `import` from `src/ui/` or `src/orchestrator.js` inside `src/engine/index.js`.

## Code Examples

See **Architecture Patterns → Pattern 1/2/3** above for the complete, concrete implementations recommended for:
- `netSetPaused`/`netWatchPaused` (Pattern 1)
- `applyPauseState`/`toggleShotClockPause`/`togglePause`/`watchPause` (Pattern 1 + 2)
- `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` guards in `saveSession`/`saveSoloState`/`boot()` (Pattern 3)

### `setClockUI()` de-gating and clickable-symbol wiring (CLOCK-02 visibility + CLOCK-03)

Current code (`src/ui/panel.js:64`, pause button visibility — solo-only today):
```javascript
pauseEl.style.display=(appState.isHost&&soloBotGame()&&!appState.liveDone)?"":"none";
```
Recommended (any player, solo or multiplayer):
```javascript
pauseEl.style.display=(!appState.liveDone)?"":"none";
```

Current code (`src/ui/panel.js:82-86`, idle-paused branch — host-only render today):
```javascript
if(appState.isHost&&appState.shotClockPaused){
  wrap.classList.remove("idle","urgent");wrap.classList.add("paused");
  labelEl.textContent="paused";numEl.innerHTML=iconImg(PAUSE_SYMBOL_IMG);unitEl.textContent="";subEl.innerHTML=`tap ${iconImg(PLAY_IMG)} to resume`;
  return;
}
```
Recommended (every client mirrors `appState.shotClockPaused` via `watchPause()`, so drop the `isHost` gate; add the CLOCK-03 click affordance):
```javascript
if(appState.shotClockPaused){
  wrap.classList.remove("idle","urgent");wrap.classList.add("paused");
  labelEl.textContent="paused";
  numEl.innerHTML=iconImg(PAUSE_SYMBOL_IMG);
  numEl.style.cursor="pointer";numEl.onclick=togglePause;   // CLOCK-03
  unitEl.textContent="";subEl.innerHTML=`tap ${iconImg(PLAY_IMG)} to resume`;
  return;
}
```
The same `isHost` drop + `onclick`/`cursor` pairing applies to the second paused-render branch at `src/ui/panel.js:98-106`. **Every other branch in `setClockUI()`** (idle/urgent/waiting/active) must explicitly reset `numEl.onclick=null;numEl.style.cursor="";` since the function is called on a standing 500ms interval and previously-set handlers do not clear themselves.

Note: `togglePause()` lives in `src/orchestrator.js` (main tier), so `src/ui/panel.js` cannot import it directly (the `ui -> shared/engine/state`-only tier shape `module_graph_check.js` enforces would reject a `ui -> orchestrator` import, same reasoning already documented for every other orchestration call `src/ui/` makes). Route it through the existing injected-handler seam (`src/ui/handlers.js`'s `netHandlers()`, wired by `src/main.js`'s `ui.setNetHandlers({...})` call) exactly like `onSetClockUI`/`onBroadcastClock` already are — add an `onTogglePause: orchestrator.togglePause` entry there, and call `netHandlers().onTogglePause()` from `panel.js` instead of a bare `togglePause` reference.

## State of the Art

Not applicable in the "library/framework evolved" sense — this is a first-party, no-framework codebase and the relevant patterns (host-authoritative Firebase sync, `waitWhilePaused` freeze) are all internal to this project, already current, and already the "state of the art" this phase should follow. No external ecosystem shift is relevant.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Function names `togglePause`/`watchPause`/`applyPauseState`/`netSetPaused`/`netWatchPaused`, the Firebase node name `rooms/{room}/paused`, and the constants `SESSION_SCHEMA_V`/`SOLO_SCHEMA_V` are this research's own naming proposal, not sourced from any existing code or doc. | Architecture Patterns (all) | Cosmetic only — planner/implementer may rename freely; the SHAPE (boolean flag mirroring `timerOff`; per-blob integer version stamp) is what matters and is well-grounded, the exact names are not load-bearing. |
| A2 | Recommending the injected-handler seam (`netHandlers().onTogglePause`) as the correct plumbing for `panel.js` to reach `orchestrator.js`'s `togglePause()`, by direct analogy to the existing `onSetClockUI`/`onBroadcastClock` entries. | Code Examples | If `module_graph_check.js`'s actual enforced shape differs subtly from this research's read of it, a direct import might in fact be permitted for this specific case — but the seam pattern is strictly safer (it's the pattern every other `ui → orchestrator` call already uses) and worst case is one extra layer of indirection, not a broken build. |
| A3 | `pp_id` and `pp_timerOff` genuinely never need version-guarding — asserted based on their simple, orthogonal shapes (opaque string; plain boolean) rather than any explicit prior decision beyond D-03 (which only covers `pp_timerOff`). | Pattern 3 | Low risk — even if wrong, the failure mode is "an edge case this research didn't anticipate for these two keys specifically," not a break of D-02's actual hardening goal, which is squarely about `pp_sess`/`pp_solo`. |

**If this table is empty:** N/A — see above; all three entries are this research's own design proposals (explicitly invited by CONTEXT's "Claude's Discretion" section for both D-02's clear/migrate strategy and D-06's sync-shape detail), not external facts requiring confirmation.

## Open Questions

1. **Should backgrounding a multiplayer tab (`document.hidden`) also trigger the new pause, now that multiplayer has a real freeze mechanism for the first time?**
   - What we know: today `src/main.js:147-151`'s auto-hide-pause is explicitly gated to `soloBotGame()` and does nothing in multiplayer; CONTEXT's phase boundary and D-04/D-05/D-06 only discuss the MANUAL ▶/⏸ control, never auto-hide behavior.
   - What's unclear: whether extending auto-hide-pause to multiplayer is desirable (arguably GOOD — a player who alt-tabs away mid-decision currently just burns their own shot-clock penalty/timeout, unprotected) or undesirable (one player's incidental tab-switch freezing the whole table for everyone else, with no explicit consent, could be surprising/annoying in a 4-human game).
   - Recommendation: leave `src/main.js:147-151` completely untouched for this phase (out of the explicit CONTEXT scope) — but flag this to Wyatt as a natural follow-up now that the underlying mechanism exists in multiplayer, in case it's an easy near-term win.

2. **Does a guest's pause-toggle request need any client-side debounce/guard beyond what `toggleTimer()` already has (none)?**
   - What we know: `toggleTimer()` has no debounce today — a client double-clicking would just write the same flag twice in quick succession, and Firebase's `.set()` naturally coalesces to the final value.
   - What's unclear: whether a pause toggle could ever land in a bad interleaving if two players click ▶/⏸ within the same round-trip window (e.g., pause-then-immediately-resume racing against each other) — the host's `applyPauseState()` is idempotent per boolean value, but a genuine simultaneous double-click from two different guests both flipping from the SAME prior value could result in an unintended net no-op (Player A pauses, Player B — seeing stale UI mid-round-trip — also clicks "pause," which is actually a resume once A's write lands first).
   - Recommendation: accept this as a rare, low-stakes UX edge case (worst case: click again) rather than adding synchronization complexity — consistent with how `timerOff` already handles the identical race today with no reported issues.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Determinism harness (`npm test`, `npm run test:determinism`) | ✓ | v25.9.0 | — |
| Python 3 | Local dev server (`npm start` → `python3 -m http.server`) | ✓ | 3.9.6 | — |
| Firebase RTDB (existing project) | All multiplayer sync, incl. the new `paused` node | ✓ (already configured, `src/net/index.js:74-83`) | v12.15.0 compat SDK (already in use) | — |
| Chrome (for MCP-driven MP testing) | Manual click-path validation of pause/resume (Pitfall 3) | Assumed available in dev environment (not directly probed this session — browser tooling, not a CLI) | — | Playwright separate contexts, per MP test-harness memory, if Chrome MCP unavailable |
| Safari | VERIFY-01 (Phase 17, not this phase) cross-browser sign-off | Assumed available (macOS dev machine per project stack) | — | — |

**Missing dependencies with no fallback:** None — every dependency this phase needs was confirmed present.

**Missing dependencies with fallback:** None beyond the Chrome/Playwright note above, which is a testing-tool preference, not a blocker.

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No unit-test framework (no Jest/Vitest/Mocha) — a suite of standalone Node scripts under `scripts/`, run via plain `node`, chained in `package.json`'s `test` script. This is a deliberate project convention (see CLAUDE.md: "no build step," vanilla stack) — do not introduce a test framework for this phase. |
| Config file | `package.json` `"scripts"` block (no separate config file) |
| Quick run command | `node scripts/determinism_baseline.js --verify` (isolates the determinism regression only, ~seconds) |
| Full suite command | `npm test` (determinism + engine contract + replay + net registry + net contract + state contract + module graph + UI contract + no-undef — all 9 gates) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLOCK-01 | A 2+ window multiplayer game boots without a stall, with NO pre-existing stale `localStorage` present | Automated regression (existing) + manual/MCP smoke | `npm test` (regression: version-guard code must not break `resumeHostGame`/`resumeSoloGame`'s existing shape) + live 2-tab MCP boot per MP test-harness memory | ✅ (harness exists) — no dedicated automated test for the version-guard branch itself; see Wave 0 Gaps |
| CLOCK-01 (hardening) | Stale (pre-refactor, unversioned) `pp_sess`/`pp_solo` is detected and cleared, NOT a legitimate current-version in-progress game | Manual/MCP: seed `localStorage` with an unversioned blob, reload, confirm `clearSession()`/`clearSoloState()` fired (via `__pp_app_state_debug()` or absence of an attempted resume) AND seed a CURRENT-version blob, reload, confirm resume still succeeds | MCP: `localStorage.setItem('pp_sess', JSON.stringify({room:'X',mySeat:0,isHost:true}))` (no `v`) → reload → assert home screen, not a resume attempt; then repeat with `v:SESSION_SCHEMA_V` → reload → assert resume attempted | ❌ Wave 0 — no existing fixture for this; add as a manual/MCP-driven check, not a `scripts/` regression (schema-version behavior is boot-sequence/localStorage-shaped, outside the deterministic-engine harness's scope) |
| CLOCK-02 | Any player (host or guest) can pause; freeze halts the countdown AND bot actions | Manual/MCP: click `#scPause` from a GUEST tab, confirm (a) `#shotClockPanel` shows "paused" on ALL tabs, (b) a bot's turn does not advance (event count via `__pp_app_state_debug()` or board state unchanged) while paused, (c) resume continues from where it left off | MCP click-path (real `.click()`, not `document.hidden` spoofing — see Pitfall 3); assert via `window.__pp_app_state_debug().shotClockPaused` on both host and guest tabs | ❌ Wave 0 — same reasoning; not deterministic-engine-shaped, add as manual/MCP validation step in VALIDATION.md |
| CLOCK-02 | Countdown resumes at the exact remaining time (D-07) | Manual/MCP: pause with N seconds visibly remaining, wait some seconds, resume, confirm displayed countdown resumes at N (not reset to 30 nor continuing to drain while paused) | MCP: read `#shotClockNum` textContent before pause and immediately after resume | ❌ Wave 0 — manual/MCP only |
| CLOCK-03 | Clicking the large paused symbol resumes, in both solo and multiplayer | Manual/MCP: `.click()` on `#shotClockNum` while `wrap.classList.contains('paused')`, confirm `appState.shotClockPaused` flips to `false` on all tabs | MCP: `document.getElementById('shotClockNum').click()` then re-check `__pp_app_state_debug().shotClockPaused` | ❌ Wave 0 — manual/MCP only |
| VERIFY-02 (guardrail, not this phase's own requirement but a hard gate on it) | Determinism regression stays green 30/30 | Automated regression (existing) | `npm run test:determinism` (isolated) or `npm test` (full chain) | ✅ (confirmed green live during this research: 30/30 seeds passed) |

### Sampling Rate
- **Per task commit:** `node scripts/determinism_baseline.js --verify` (fast — this phase should never actually change engine behavior, so this should stay trivially green throughout; a failure at ANY point mid-phase is a stop-the-line signal, not something to defer).
- **Per wave merge:** `npm test` (full 9-gate chain, including the `net_contract_check.js` watcher-inventory count this phase's own change to `src/net/watchers.js` will affect — see Pitfall 1).
- **Phase gate:** Full `npm test` green, PLUS a live 2+ tab MCP (or manual) multiplayer session covering the CLOCK-01/02/03 manual checks in the table above, before `/gsd-verify-work`.

### Wave 0 Gaps
- No existing fixture exercises the new `localStorage` schema-version guard (CLOCK-01 hardening) — this is inherently a boot-sequence/browser-state concern, not a fit for the deterministic-engine `scripts/` harness; cover it as an explicit manual/MCP checklist item in `VALIDATION.md`, not a new `scripts/*.js` file.
- No existing fixture exercises multiplayer pause/resume (CLOCK-02/03) for the same reason — these are UI/network-timing behaviors, not engine-replay-shaped; cover as manual/MCP checklist items.
- `scripts/net_contract_check.js`'s `WATCHER_INVENTORY` array and `attachCount !== 18` literal (see Pitfall 1) — technically not a "gap" but a **required edit**, called out here so it lands in the plan's task list rather than being discovered as a surprise test failure.

*(No gap requires a new automated test FILE — every gap above is inherently manual/MCP-shaped given this project's "no unit-test framework, `scripts/`-only automation for the deterministic engine" convention. Do not introduce a new test framework to close these; add the checks to `VALIDATION.md`'s manual verification steps instead.)*

## Security Domain

> `security_enforcement` is `true`, `security_asvs_level` is `1` in `.planning/config.json` — this section is required.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | The game has no authentication layer by design (anonymous `pp_id` + a 4-character room code is the entire "identity" model) — unchanged by this phase, not a regression to introduce or fix here. |
| V3 Session Management | Partial | `pp_sess`/`pp_solo` ARE the app's session-persistence mechanism; this phase's version-guard is itself a session-integrity improvement (prevents a stale/incompatible session blob from driving an invalid resume) — no library needed, the guard IS the control. |
| V4 Access Control | Partial (accepted existing risk, not introduced by this phase) | Any client holding the room code may already write to every `rooms/{room}/*` Firebase node (`timerOff`, `narr`, `dlog`, etc. — no RTDB rule differentiates "host" from "guest" at the write-permission level; the host/guest distinction is purely an application-layer convention). The new `rooms/{room}/paused` node follows this SAME existing model exactly — a guest (or any third party who obtains the room code) being able to pause the game is not a NEW privilege being granted, it's the identical trust boundary every other room-scoped write already has. No new mitigation is warranted for this phase specifically; a broader RTDB-rules hardening (real per-seat write ACLs) would be a separate, larger initiative outside this phase's scope. |
| V5 Input Validation | Yes (existing pattern, followed) | `JSON.parse(localStorage.getItem(...))` is already wrapped in `try/catch` at every existing call site (`boot()`, `saveSession`, etc.) — the new version-field read (`sess.v`, `solo.v`) must follow the same defensive pattern (a malformed/tampered blob with `v` present but a wrong type must not throw; a strict `!==` comparison against the numeric constant already handles this safely — `undefined !== 1` and `"1" !== 1` both correctly fall through to "treat as stale"). |
| V6 Cryptography | No | Not applicable — no cryptographic operations in this phase. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Denial of gameplay via unauthenticated pause spam | Denial of Service (minor) | Accepted existing risk (see V4 above) — identical exposure already exists for `timerOff`, chat spam (already has a 1s client-side throttle, `src/orchestrator.js:232`), and every other room write. Not a new introduction; no additional mitigation scoped for this phase. If Wyatt wants this hardened, it belongs in a dedicated RTDB-security-rules phase covering ALL room writes uniformly, not a one-off fix for `paused` alone. |
| Malformed/tampered `localStorage` blob crashing boot | Tampering / Denial of Service (self-inflicted, client-side only) | Already mitigated by existing `try/catch` around every `JSON.parse`; the new version-field check must preserve this (see V5 above) — a `sess.v` read on a non-object `sess` must not throw (guard with `sess&&sess.v!==...`, matching the existing `if(!sess||!sess.room)` null-check style already in `boot()`). |

## Sources

This phase required zero external documentation lookups (no new libraries/frameworks) — every claim above is grounded in a direct read of the live repository, performed in this research session:

### Primary (HIGH confidence — direct source read this session)
- `src/ui/util.js` (770 lines, read in full) — `waitWhilePaused`, `toggleShotClockPause`, `shotClockPauseElapsed` math, `getMyId`/`saveSession`/`clearSession`/`saveSoloState`/`clearSoloState`, `soloBotGame`
- `src/orchestrator.js` (1116 lines, read in full) — `toggleTimer`/`watchTimer`/`broadcastClock` sync template, `beginGame`'s `timerOff` boot-seed, `wireLobby`'s `#scPause`/`#scTimerToggle` wiring, `boot()`'s full session/solo-resume sequence
- `src/ui/panel.js` (357 lines, read in full) — `setClockUI()`'s every branch, including both `PAUSE_SYMBOL_IMG` render sites
- `src/main.js` (191 lines, read in full) — the injected-handler seam wiring, the `visibilitychange` auto-pause listener, the `setInterval(ui.setClockUI, 500)` driver
- `src/net/writers.js` / `src/net/watchers.js` / `src/net/index.js` (read in full) — the exact 3-file pattern any new `netSetX`/`netWatchX` pair must follow
- `src/state/index.js` (read in full) — confirmed `shotClockPaused`/`shotClockPauseElapsed` already exist in `appState`, no new fields needed
- `index.html` lines 821-826 (shot-clock panel markup, grepped and confirmed) — `#shotClockPanel`, `#scPause`/`#scPauseImg`, `#scTimerToggle`, `#shotClockNum` (a `<span>`, not currently a `<button>`)
- `scripts/net_contract_check.js` (relevant sections read) — the hardcoded 18-watcher inventory assertion (Pitfall 1)
- `scripts/determinism_baseline.js` output — live run this session: `node scripts/determinism_baseline.js --verify` → **30/30 PASS**, confirming the current baseline is green before this phase begins
- `grep -rn "localStorage" src/ index.html` — the complete, exhaustive inventory of all four `localStorage` keys in the entire codebase
- `grep -n "shotClock\|timerOff\|clock\|localStorage\|Date\.now\|Math\.random" src/engine/index.js` — confirmed zero real (non-comment) matches, verifying the Determinism Guardrail
- `/Users/wyattroy/.claude/projects/-Users-wyattroy-Documents-Projects-pastrypirates/memory/project_mp_test_harness.md` (project memory, read in full) — the MP testing gotchas cited in Pitfalls 3/4 and the Validation Architecture section

### Secondary (MEDIUM confidence)
- None — no external/web sources were consulted; not needed for this phase's scope.

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new stack, existing patterns directly confirmed in source.
- Architecture: HIGH — every recommended pattern is a direct, verified mirror of an existing, working pattern in the same file/module the change lands in.
- Pitfalls: HIGH — Pitfall 1 (net_contract_check inventory) confirmed by direct read of the exact assertion logic; Pitfalls 3/4 sourced from the project's own documented testing memory (prior direct experience, not speculation); Pitfall 2/5 derived from direct code inspection of the exact gates involved.

**Research date:** 2026-07-25
**Valid until:** Until this phase's code lands (this research is tied to the exact current shape of `src/orchestrator.js`/`src/ui/util.js`/`src/ui/panel.js`; any interim commit to those files before planning/execution should trigger a re-read, not a 30-day shelf-life assumption).
