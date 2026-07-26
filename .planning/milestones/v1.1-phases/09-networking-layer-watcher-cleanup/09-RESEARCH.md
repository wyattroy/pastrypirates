# Phase 9: Networking Layer & Watcher Cleanup - Research

**Researched:** 2026-07-24
**Domain:** Firebase Realtime Database (compat v12.15.0) client-side listener lifecycle, in a vanilla-JS/no-build monolith mid-strangler-fig extraction
**Confidence:** HIGH (call-site inventory, teardown semantics, module-boundary design) / MEDIUM (Firebase SDK reference-identity internals — flagged, needs a cheap Wave-0 browser smoke test to move to HIGH)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** The ROADMAP and REQUIREMENTS said "14 watchers, 1 torn down." Direct grep of `index.html` on 2026-07-24 shows **18** Firebase `.on()` watchers and **2** `.off()` calls. Both docs have been corrected. Plan to **18**, not 14. Verified inventory (18 lines): `:2117` flip, `:2204` timerOff, `:2281` clock, `:2549` chat, `:3073` battle, `:3947` `.info/connected`, `:3953` presence, `:4090` recovery, `:4114` `rr` prompt response (self-tears down at `:4112`), `:4136` `rr` recipe prompt response (self-tears down at `:4134`), `:4140` draftPrompts/{mySeat}, `:4162` ev, `:4174` prompt, `:4229` narr, `:4403` seats, `:4408` status, `:4481` turnOrder, `:4493` recipes.
- **D-02:** The two existing `.off()` calls (`:4112`, `:4134`) are the *same* pattern — a one-shot response listener that cancels itself once the matching reply arrives. They are already correct. Do not "fix" them into the registry in a way that breaks their self-cancelling semantics; register them so they are *also* torn down if the room dies before a reply arrives, which is the real gap in that pattern.
- **D-03:** Firebase's `ref.off(event, callback)` removes a listener only when given the same function reference passed to `.on()`. All 18 current watchers pass inline anonymous arrows — none can be individually detached today. The registry is not a bookkeeping convenience; it is the mechanism that makes per-watcher teardown *possible at all*. Every callback must be hoisted to a named/held reference the registry stores alongside its ref and event type.
- **D-04:** The registry is the single place watchers are attached and detached. No `.on()` call may bypass it. This must be mechanically enforced (a grep-based contract check in the spirit of `scripts/engine_contract_check.js`), not left to discipline.
- **D-05:** Networking lives under `src/net/`, continuing the `src/shared` + `src/engine` convention from Phase 8.
- **D-06 (the central design question, resolved by this research):** ROADMAP criterion 1 requires the net module to never import the UI layer, but watcher callbacks are full of UI calls. The shape of the answer is inversion: net owns transport (attach/detach/read/write) and publishes events; UI subscribes. The asymmetry is directional — UI may import net; net may never import UI.
- **D-07:** The Phase 7 corpus remains frozen. Never run `--capture`. `git log --oneline -- 'scripts/fixtures/determinism/*.jsonl' | wc -l` must stay `1`. `--verify` staying green is necessary but not sufficient — the corpus does not exercise networking.
- **D-08:** Host authority is preserved exactly: only the host runs the engine and writes game state; guests render. The `replaying` guard must keep suppressing broadcasts during replay.
- **D-09:** Decision-log (`dlog`) write ordering is load-bearing for replay correctness. Moving the writer must not reorder or batch writes.
- **D-10:** ROADMAP criterion 3 demands the reconnect/rejoin check be behavioral — a grep proving `.off()` calls exist is explicitly not sufficient. The check must observe actual listener counts across a leave-and-rejoin cycle.
- **D-11:** Criterion 4 needs a real two-tab multiplayer game (host + guest) syncing after the extraction. Per MEMORY: all tabs in one Chrome profile share `localStorage`, and `myId` comes from `localStorage['pp_id']` read once at load — so without intervention the guest rejoins as the host. Fix: before each tab loads, `localStorage.clear(); localStorage.setItem('pp_id','<unique>')` then reload, done sequentially.
- **D-12:** A leak check needs a ground truth. Firebase compat does not expose a public listener count, so research must find a workable observation method — instrumenting the registry's own bookkeeping is acceptable and probably best, provided the registry is genuinely the only attach path (D-04), since then its count *is* the truth.

### Claude's Discretion

- File split within `src/net/`, and the registry's exact API shape.
- Whether the registry keys on `(path, event, callback)` or hands back an unsubscribe handle.
- The emitter/handler mechanism for D-06, within the directional-import constraint.
- Whether the contract check extends `scripts/engine_contract_check.js` or becomes a sibling script.

### Deferred Ideas (OUT OF SCOPE)

- **Modular Firebase SDK migration** — `NETMOD-01`, v2. `onValue()` would give a much cleaner unsubscribe story than compat's `.off()`, but it is a full networking rewrite and incompatible with this milestone's determinism gate.
- **De-globalizing `db`/`room`/`myId`** — Phase 10.
- **Removing the bridge** — Phase 11.
- **Checkpointing game state every N events** so replay doesn't re-run from turn 1 — from CONCERNS.md, still out of scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SPLIT-04 | Firebase multiplayer sync lives in its own networking module(s) that never import the UI layer | Q1/D-06 answered concretely: handler-injection seam (Pattern 1) keeps `src/net/` free of any UI reference while still driving UI updates via a caller-supplied function. Recommended file split (`registry.js`/`watchers.js`/`writers.js`/`index.js`) and the writer-function split table give the planner a task-sized breakdown. |
| NET-01 | Every `.on()` watcher has a matching `.off()` teardown — no leaked/stale listeners | Full 18-site inventory re-verified by fresh grep (matches D-01 exactly); Pattern 2 closes D-02's self-cancelling-listener gap; Pattern 3 defines room-vs-session scoping so teardown doesn't wrongly kill presence/connection watchers. |
| NET-02 | Watchers registered/torn down through a single registry, exact callback-reference matching | `registry.js` skeleton (Code Examples) gives a concrete, minimal API; Pitfall 1 resolves the reference-identity question the registry design depends on; Q5/Pitfall 4 gives the mechanical enforcement approach (and the one required deviation from the Phase 8 precedent). |
| NET-03 | Guest reconnect/leave-rejoin cycle leaves zero dangling listeners, verified behaviorally | Q3/Q4 analysis: identifies that `location.reload()` (the only current "leave" path) cannot be used to prove this, and specifies the actual same-tab attach→detach→re-attach probe via a new `window.__pp_net_debug` hook (Wave 0 Gaps) that can. |
</phase_requirements>

## Summary

This phase has one crux (Q1/D-06) and one trap (Q2/D-03). The crux: all 18 watcher callbacks are soldered directly to UI and app-state calls, so a literal, verbatim "move the callback into `src/net/`" would immediately violate ROADMAP criterion 1 (net must never import UI). The fix is **inversion of control by handler injection, not an event emitter**: `src/net/` owns exactly three things — the Firebase `Reference`, the event-type string, and a `WatcherRegistry` that tracks `(scope, path, event, callback)` tuples for exact-reference `.off()`. The callback *bodies* (all UI calls, all `game`/`mySeat`/`isHost`/`replaying` reads) stay word-for-word where they are today, in index.html's still-classic script, and get passed into the net module's `watchX(db, room, handler)` functions as plain function arguments. This is close to zero-risk for determinism (Q1d) because dispatch stays fully synchronous — the wrapped callback calls `handler(payload)` directly, in the same tick as the Firebase event, with no microtask/Promise indirection anywhere in the registry.

The trap: CONTEXT.md's D-03 treats reference-identity as the open question requiring the registry to "hold the original ref, not just the path string." Direct research into the Firebase JS SDK's architecture (and a corroborating, reproducible GitHub bug report — see Sources) indicates the opposite is true: RTDB listeners are keyed server/SDK-side by **path + query params + event type + callback (+ context) — not by which JS `Reference` object instance issued the `.on()`/`.off()` call**. A registry that stores `(path, event, callback)` and calls `db.ref(path).off(event, callback)` on a *freshly constructed* reference should detach a listener that was originally attached via a *different* `db.ref(path)` call. This is MEDIUM confidence (one official-docs citation is silent on this exact point, the strongest evidence is an empirical bug report, not a maintainer statement) — treat it as an assumption to burn down with a two-line Wave 0 browser check before the registry design leans on it. Either way, the safer engineering choice — hold the original `Reference` object in the registry entry regardless — costs nothing and removes the ambiguity entirely; recommend doing that even if reference-identity turns out not to matter.

Grepping `index.html` fresh today reproduces D-01's corrected inventory exactly: **18** `.on()` call sites, **2** `.off()` call sites (both the same self-cancelling one-shot pattern, both missing room-death teardown — D-02's real gap). A `location.reload()` is the *only* current "leave" mechanism (`leaveGame()`), which means the dominant present-day leak vector is **not** "leave and rejoin a room" (a reload already zeroes everything by construction) but (a) the two self-cancelling listeners left dangling when a remote seat goes silent mid-game, and (b) a double-click/double-invocation of `joinRoom()`/`createRoom()` within one tab attaching `watchRoom()`'s seat/status listeners twice with no guard. NET-03's "reconnect-and-count" check must therefore be structured as an in-page (no-reload) attach → detach → re-attach probe against the registry's own counters, not a `location.reload()`-based test, because reload alone proves nothing about the registry.

**Primary recommendation:** Build `src/net/registry.js` as the sole file permitted to call `.on()`/`.off()`, scoped per-listener as `"session"` (presence, `.info/connected` — survive room leave) or `"room"` (everything else — torn down together by a new `detachRoom()`/`leaveRoom()` call wired into `leaveGame()`); keep every watcher callback's *body* in index.html unchanged and pass it into `src/net/watchers.js`'s `watchX(db, room, handler)` functions as an argument; mirror `scripts/engine_contract_check.js`'s structure for the new contract check but do **not** reuse its `//`-comment-stripping approach, since `src/net/` will legitimately contain `https://` URL literals (the Firebase config) that make that exact false-negative risk live instead of theoretical.

## Architectural Responsibility Map

This project's actual architecture (per `ARCHITECTURE.md`) doesn't have SSR/CDN/API tiers — it's Browser-only + a hosted realtime DB. Tiers below are the project's own established layers (Engine / UI / Networking / Storage) rather than the generic web-tier list, since that maps far more usefully onto this codebase.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Firebase `.on()`/`.off()` attach-detach bookkeeping | Networking (`src/net/registry.js`) | — | This *is* NET-01/02/03 — must be the single choke point, mechanically enforced (Q5). |
| Watcher payload → UI update (`setFlipCoin`, `showNarration`, `renderBattleFromSnap`, `appendChatLine`, `renderSeatList`, `buildPlayerRows`, …) | UI (still classic-script; formally `src/ui/` in Phase 11) | Networking (invokes it via injected handler) | UI-owning logic never moves into `src/net/` — it stays put and is *called by* net through the handler-injection seam. |
| Watcher payload → engine/app-state mutation (`game.events.push`, `evIdx`, `game.players[i].recipe`, `dlog`, `turnOrder`) | Engine/App-state (still classic-script; formally Phase 10's app-state module) | Networking (invokes it via injected handler) | Same seam as UI — net doesn't own or read `game` directly, it hands the raw payload to a caller-supplied function that does. |
| Firebase writes (`broadcastFlip`, `pushEvents`, `logDecision`, `sendChat`, room create/join) | Networking (`src/net/writers.js`) | UI (several current functions interleave a UI call with the write — must be split, see "Writer Functions Requiring a Split" below) | D-06: "the net module owns transport (attach, detach, read, write)." |
| Connection/presence status (`.info/connected`, `presence`) | Networking (`src/net/index.js`, session-scoped) | UI (`$("syncnote")`/`$("busynote")` toggling) | Session-scoped, not room-scoped (Q2d) — outlives any single room. |
| Room lifecycle orchestration (`createRoom`, `joinRoom`, `watchRoom`, `startGame`, `leaveGame`) | Split: transport half → Networking; navigation/UI half → classic script | Both | These functions are the most heavily UI+net interleaved in the file; recommend splitting per-function using the same handler-injection pattern rather than moving them wholesale (see "Discretion" note below). |
| Determinism / replay ordering (`replaying` guard, `dlog` ordering, host authority) | Engine/App-state (unchanged, out of scope) | Networking (must not disturb it — Q1d) | Phase 9 must preserve, not own, this — see D-07/D-08/D-09. |

## Package Legitimacy Audit

Not applicable. This phase introduces **zero** new npm/external packages. Firebase stays on the existing CDN-loaded classic-script compat SDK (v12.15.0, unchanged); no `package.json` dependency is added or bumped. `npm view firebase version` is irrelevant here since Firebase is never installed via npm in this project (see `docs/MODULES.md` — classic `<script>` tags at `index.html:25-26`, loaded from a CDN, not a package).

## Architecture Patterns

### System Architecture Diagram

```
Firebase RTDB (server)
        │  (WebSocket, managed entirely by the Firebase SDK)
        ▼
┌───────────────────────────── src/net/ (NEW, this phase) ─────────────────────────────┐
│                                                                                        │
│  registry.js            watchers.js                    writers.js                    │
│  ┌──────────────────┐   ┌───────────────────────┐      ┌──────────────────────────┐  │
│  │ attach(scope,     │   │ watchFlip(db,room,h)  │      │ netBroadcastFlip(...)    │  │
│  │  ref,event,cb) ───┼──▶│ watchTimer(db,room,h) │      │ netPushEvents(...)       │  │
│  │ detach(...)       │   │ watchClock(db,room,h) │      │ netLogDecision(...)      │  │
│  │ detachRoom()      │   │ ...  (18 total)        │      │ netSendChat(...)         │  │
│  │ detachAll()       │   │ each: ref.on(event,    │      │ (each: pure db.ref(...)  │  │
│  │ size()/list()      │   │  wrapped); registry    │      │  .set/.push/.update/     │  │
│  │  (debug hook)      │   │  .attach(...)          │      │  .remove — NO UI calls)  │  │
│  └──────────────────┘   └──────────┬────────────┘      └──────────────────────────┘  │
│         ▲ sole file            calls handler(payload)                                 │
│         │ allowed to call      SYNCHRONOUSLY, same tick                               │
│         │ raw .on()/.off()     as the Firebase callback                               │
└─────────┼──────────────────────────┼───────────────────────────────────────────────────┘
          │                          │
          │ (mechanically enforced,  │ (handler = plain function reference,
          │  Q5 contract check)      │  supplied by the caller below)
          │                          ▼
┌─────────┴──────────────────────────────────────────── index.html classic <script> ────┐
│                                                                                          │
│  beginGame(): watchFlip(db, room, v => setFlipCoin(v.state))                            │
│               watchEvents(db, room, ev => { game.events.push(ev); ...; render(); })      │
│               ...                                                                        │
│                                                                                          │
│  UI calls (setFlipCoin, showNarration, render, renderBattle, appendChatLine, ...)         │
│  Engine/app-state (game, mySeat, isHost, replaying, dlog, evIdx, turnOrder, ...)          │
│  — UNCHANGED, UNMOVED — still declared/mutated exactly where they are today              │
│                                                                                          │
│  leaveGame(): registry.detachRoom(); clearSession(); clearSoloState(); location.reload()  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

A reader can trace a single value flowing from the server: Firebase fires the raw SDK callback → `registry`'s wrapped callback (still inside `src/net/watchers.js`) extracts the payload and calls the injected `handler` synchronously → the handler (still living in index.html, unmoved) does whatever UI/engine work it always did. The arrow from net → classic script is a plain function call (the handler), never an `import` — that's what keeps the "net must never import UI" rule mechanically true even though net code executes UI logic indirectly, once removed, through a caller-supplied callback.

### Recommended Project Structure

```
src/net/
├── registry.js   # WatcherRegistry: attach/detach/detachRoom/detachAll/size/list. Sole file
│                 # allowed to call ref.on()/ref.off(). No UI or game-state references at all.
├── watchers.js    # The 18 watchX(db, room|path, handler) functions. Each is a thin transport
│                 # wrapper: builds the ref, wraps the raw snapshot into a payload, calls
│                 # registry.attach(), and invokes `handler(payload)` synchronously.
├── writers.js     # netBroadcastX/netPushEvents/netLogDecision/netSendChat/... — pure Firebase
│                 # writes only. Any current function that also calls a UI function (setFlipCoin,
│                 # showNarration, panel, alert, renderSeatList, ...) gets split: the UI half stays
│                 # in index.html, the write half moves here (see table below).
└── index.js       # Barrel + fbInit()/watchPresence()/netFail() + leaveRoom()/detachRoom()
                    # orchestration. This is what a future src/ui/ (Phase 11) or the still-classic
                    # script imports/calls.
```

`src/net/` imports nothing from a future `src/ui/` (doesn't exist yet — trivially satisfied this phase) and should not import `src/engine/` either (no watcher/writer needs engine constants). It may be imported by `index.html`'s module entry (`src/main.js`) the same way `src/engine/` and `src/shared/` already are — but until Phase 10/11 encapsulate `game`/`mySeat`/`db`/`room`, the classic script keeps calling into `src/net/` via the bridge pattern already established in Phase 8 (`window.PP`/`globalThis`), **not** by having `src/net/` read those variables itself.

### Pattern 1: Handler-Injection Watcher (the Q1c/Q1d answer)

**What:** Every `watchX()` function in `src/net/watchers.js` takes the caller's handler as a parameter and invokes it synchronously inside the raw Firebase callback. No emitter, no pub/sub bus, no `queueMicrotask`.

**When to use:** All 18 watcher call sites, without exception — including the two self-cancelling ones (which additionally call `registry.detach()`, not raw `ref.off()`, from inside their own handler, so the registry's bookkeeping never goes stale — see Pattern 2).

**Example (before → after) for `watchFlip`, the simplest case:**

```javascript
// BEFORE (index.html:2115-2118) — verbatim today
function watchFlip(){
  if(!db||!room)return;
  db.ref("rooms/"+room+"/flip").on("value",s=>{const v=s.val();if(v)setFlipCoin(v.state);});
}
```

```javascript
// AFTER — src/net/watchers.js (new file, no UI/game references)
export function watchFlip(registry, db, room, handler){
  if(!db||!room)return null;
  const ref = db.ref("rooms/"+room+"/flip");
  const wrapped = s => { const v=s.val(); if(v) handler(v); };
  ref.on("value", wrapped);
  return registry.attach({ scope:"room", ref, event:"value", callback:wrapped, label:"flip" });
}
```

```javascript
// AFTER — index.html classic script, unmoved except for the call site itself
// (setFlipCoin's OWN body is completely untouched — it still lives at its current line)
function startWatchFlip(){
  netWatchFlip(registry, db, room, v => setFlipCoin(v.state)); // the handler IS the old callback body
}
```

The `handler` closure (`v => setFlipCoin(v.state)`) is defined in index.html, so it freely reads/writes `game`, `mySeat`, `isHost`, `replaying`, `dlog`, etc. exactly as before — those variables never had to become reachable from inside `src/net/` at all. This sidesteps the entire "mutable globals aren't bridged yet" problem: **Phase 9 does not need to solve Phase 10's de-globalization job**, because the code that touches those globals never physically leaves the classic script.

### Pattern 2: Room-Death Teardown for Self-Cancelling One-Shots (the D-02 fix)

**What:** `remotePrompt()`/`remoteDraftPrompt()` (`:4106-4116`, `:4127-4138`) already tear themselves down correctly on a normal reply — D-02 says don't break that. The actual gap: if the room dies (or the target seat never answers) before a reply arrives, the listener is never removed. Fix: route the self-cancelling `.off()` through the registry instead of calling `rr.off("value",cb)` directly, and give it `scope:"room"` so a room-wide `detachRoom()` also cleans up any still-pending one.

**Example:**

```javascript
// src/net/writers.js
export function netRemotePrompt(registry, db, room, seat, payload){
  const id = "q"+(promptCounter++)+"_"+Date.now();
  db.ref("rooms/"+room+"/prompt").set(Object.assign({id,seat},payload)).catch(netFail("prompt"));
  return new Promise(res=>{
    const rr = db.ref("rooms/"+room+"/response");
    const cb = snap=>{
      const v=snap.val();
      if(v&&v.id===id){
        registry.detach(entry);                       // goes THROUGH the registry now, not rr.off() directly
        db.ref("rooms/"+room+"/prompt").remove().catch(netFail("prompt clear"));
        res(v.choice===undefined?null:v.choice);
      }
    };
    const entry = registry.attach({ scope:"room", ref:rr, event:"value", callback:cb, label:"promptResponse:"+id });
  });
}
```

If `registry.detachRoom()` runs (room leave/teardown) while this promise is still pending, the registry entry is removed and `.off()` is called on the caller's behalf — the promise itself is simply left unresolved, which matches today's behavior for an abandoned decision (nothing currently force-resolves it either); the *leak* is what's fixed, not the promise's fate.

### Pattern 3: Session-Scoped vs Room-Scoped Listeners (the Q2d/D-04 answer)

**What:** `.info/connected` (`:3947`) and `presence` (`:3953`) are attached exactly once per page life, from `watchPresence()`, called once from `fbInit()`, called once from `boot()`. They must **not** be torn down by a room leave — they track the browser's connection to Firebase itself, independent of which room (if any) is open.

**Recommendation:** `registry.attach({ scope: "session", ... })` for these two; everything else (all 16 remaining watchers, both self-cancelling one-shots, and every write function that's room-scoped) uses `scope: "room"`. `registry.detachRoom()` only touches `"room"`-scoped entries; `registry.detachAll()` (page teardown, defense-in-depth before `location.reload()`) touches everything.

### Writer Functions Requiring a Split (UI + net mixed in one function today)

Not exhaustive — a representative sample surfaced by grep (`grep -n "db\.ref(" index.html | grep -v "\.on("`, 33 non-watcher call sites). Apply the same split to any other function grep turns up that both calls a UI function and writes to Firebase.

| Function | Line | UI call (stays in index.html) | Net write (moves to `src/net/writers.js`) |
|---|---|---|---|
| `broadcastFlip(state)` | `:2111-2114` | `setFlipCoin(state)` | `db.ref(".../flip").set({state,t})` |
| `broadcastClock()` | `:2189-2192` | `setClockUI()` | `db.ref(".../clock").set(...)` |
| `netNarrate(html)` | `:2520` | `showNarration(html)` | `db.ref(".../narr").set({html,t})` |
| `renderBattle(o)` | `:3033-3059` | the whole `panel(...)` scoreboard render | tail: `db.ref(".../battle").set(battleSnapshot(o))` |
| `sendResponse(id,choice)` | `:4118-4123` | `panel("")` | `db.ref(".../response").set(o)` |
| `watchDraftPrompt()`'s button handler | `:4147-4152` | `showNarration(p.waitMsg)` / `panel("")` | `db.ref(".../draftResponses/...").set(...)` |
| `createRoom()`/`joinRoom()`/`watchRoom()`/`startGame()` | `:4356-4451` | `showRoom()`, `alert(...)`, `renderSeatList(...)`, `beginGame(...)` | the `db.ref(...).set/.get/.transaction/.update` calls |

For the room-lifecycle quartet (`createRoom`/`joinRoom`/`watchRoom`/`startGame`), the UI/net interleaving is dense enough that a full split may cost more risk than this phase's success criteria demand — **Claude's Discretion** per CONTEXT.md covers this exactly ("file split within `src/net/`"). Minimum bar to satisfy SPLIT-04 + NET-01/02/03: the registry and the 18 watcher transport wrappers must move; the lobby/room-creation write calls may stay in index.html for this phase if splitting them cleanly is disproportionately invasive, provided they don't call `.on()`/`.off()` directly (they don't — `watchRoom()`'s two `.on()` calls at `:4403`/`:4408` are already in the watcher inventory and do move).

### Anti-Patterns to Avoid

- **A generic event emitter for watcher dispatch.** Not forbidden outright (a same-tick `EventEmitter.emit()`/`EventTarget.dispatchEvent()` IS synchronous), but it adds an indirection layer with zero benefit here — every watcher has exactly one consumer, never a fan-out audience, so a registration API is simpler to audit and impossible to accidentally defer.
- **Deferring dispatch by even one microtask.** `Promise.resolve().then(()=>handler(payload))`, `queueMicrotask(...)`, or a `requestAnimationFrame`-batched render layer around the watcher dispatch path would let `replaying` (or any other guard flag checked inside the handler) change value between the raw Firebase callback firing and the handler actually running — silently breaking replay ordering (D-09) with no visible symptom short of a corrupted rebuild.
- **Calling `rr.off()` directly from inside a self-cancelling one-shot.** Bypasses the registry's bookkeeping (D-04) even though the underlying Firebase detach still works — the registry's count would then overstate reality, undermining NET-03's ground-truth argument (Q3). Always detach through the registry.
- **Reusing `scripts/engine_contract_check.js`'s `indexOf("//")` line-comment stripping for the new contract check.** Safe for Phase 8 because `src/engine`/`src/shared` contain zero URL literals. `src/net/` will contain the Firebase `databaseURL`/CDN-adjacent strings — a real `://` inside a string literal appearing before a real `.on(` violation on the same physical line would silently swallow the violation. See "Mechanical Enforcement" below.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Listener count ground truth | A parser/introspector into Firebase SDK internals (`_repo`, `_delegate`, etc.) | The registry's own bookkeeping, proven sound by (a) the Q5 contract check (zero raw `.on()` outside `registry.js`) and (b) a registry unit test against a fake Firebase-like `Reference` | Firebase compat exposes no public listener-count API; internals are unstable across SDK versions and were never intended as a public surface (D-12 anticipates this correctly). |
| Detecting a real regression vs a stale test | A `location.reload()`-based "leave and rejoin" browser test | An in-page (no-reload) attach → `detachRoom()` → re-attach probe reading `registry.size()`/`registry.list()` before/after | Reload zeroes every JS-heap listener by construction regardless of whether the registry works — it cannot distinguish "registry correctly tore down 16 listeners" from "the whole page just restarted." Only a same-tab, no-reload cycle actually exercises the teardown code path. |
| Split UI-vs-net contract enforcement | Manual code review at PR time | A grep-based contract check (Q5), wired into `npm test`, scoped identically to `scripts/engine_contract_check.js`'s DAG-direction assertion pattern | Phase 10 and 11 will touch this same code again; a one-time grep pasted into a plan summary proves nothing about future phases (exact language from `docs/MODULES.md`'s own engine-contract-check rationale, equally true here). |

**Key insight:** every "don't hand-roll" item above is really the same insight restated: this phase's entire job is to convert an implicit invariant ("watchers get cleaned up," "net never calls UI") into a *mechanically checked* one. Trusting discipline or a one-time manual audit is exactly the failure mode NET-03's "not code review alone" line is written to rule out.

## Runtime State Inventory

This phase is a code-motion/refactor phase (Firebase sync code relocates into `src/net/`), so this section is required.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | Firebase RTDB path names (`rooms/{room}/flip`, `rooms/{room}/ev`, `presence`, `.info/connected`, `gamelogs/{ts}`, `feedback/{ts}`, …) — none of these path strings change. | None — code organization changes only; every read/write in `src/net/` must construct the *identical* path strings, byte-for-byte, that index.html uses today (verified by grep above). A path typo introduced during the split (e.g. `"room/"+room` instead of `"rooms/"+room`) would silently desync guests without throwing — call this out explicitly as a review risk, not a hypothetical. |
| Live service config | Firebase project (`firebaseConfig` object, RTDB security rules — rules are not in this repo, managed via Firebase console per `ONLINE_SETUP.md` references in-code). | None — `firebaseConfig`'s values are unchanged; if it physically relocates into `src/net/index.js` as part of the split, the *values* (apiKey, databaseURL, etc.) must be copied verbatim, not retyped. |
| OS-registered state | None — browser-only SPA, no OS-level process/task registration of any kind. | None. |
| Secrets/env vars | The Firebase `apiKey` is intentionally public (documented in `CONCERNS.md` and `.claude/CLAUDE.md` — "public exposure per docs"). No `.env`, no SOPS-managed key, no CI secret references this networking code. | None. |
| Build artifacts | None — no build step, no compiled/installed artifact depends on file layout under `src/net/`. `scripts/lib/load_engine.js` locates the engine tier via native `import`, not a slice/regex over `index.html`, so adding `src/net/` doesn't disturb it. The one live hazard: `docs/MODULES.md`'s "bare attribute-less `<script>` tag" rule — any new `<script>` tag added to `index.html` while wiring `src/net/` into the page must carry attributes (`type="module"`, etc.), or it will silently become the *new* first match for the engine-region extraction and break `load_engine.js`. | Verify no new bare `<script>` tag is added; if `src/net/` needs a script tag at all (it likely doesn't — it's imported by `src/main.js`, not tagged directly), it must carry `type="module"`. |

## Common Pitfalls

### Pitfall 1: Assuming reference-identity matters for `.off()`

**What goes wrong:** Building the registry to hold path *strings* and reconstruct `db.ref(path)` fresh at detach time, then discovering (or not discovering, and shipping a silent bug) that a fresh reference instance can't detach a listener attached via a different instance.

**Why it happens:** D-03's framing in CONTEXT.md treats this as the crux risk, and it's a reasonable worry — `db.ref()` genuinely does return a new JS object every call.

**How to avoid:** Research here found the opposite of the worried-about failure mode (Firebase's SDK keys listeners by path+query+event+callback server/SDK-side, not by JS object identity — see Sources), but this is MEDIUM confidence, not HIGH. **Do the cheap thing regardless of which way the ambiguity resolves: store the original `Reference` object in each registry entry**, not just the path string. This costs nothing (a reference is a small object) and makes the reference-identity question moot for correctness — only matters for memory tidiness, and 18-ish held references is not a memory concern.

**Warning signs:** A registry unit test (Wave 0 gap) that attaches via ref A and detaches via a freshly-constructed ref B to the same path, then asserts the underlying fake/mock no longer fires — this converts the ambiguity into a five-line, fast-running, permanent regression test rather than a one-time manual check.

### Pitfall 2: Testing NET-03 via `location.reload()`

**What goes wrong:** A Chrome MCP test that does "guest tab: leaveGame() (which reloads) → rejoin same room code → count listeners" looks like a reconnect-and-count check but proves nothing, because `location.reload()` destroys the entire JS heap (registry included) regardless of whether the registry code is correct or entirely absent.

**Why it happens:** It's the only user-facing "leave" flow that exists today (`leaveGame()` at `:4501`), so it's the intuitive thing to click through in a manual test.

**How to avoid:** The behavioral check must happen *within* one page load: call the net module's own `leaveRoom()`/`detachRoom()` function directly (via the browser console or a `window.__pp_net_debug` hook), assert `registry.size()` drops to the session-scoped baseline (2 — presence + `.info/connected`), then re-attach (simulate rejoin by calling `watchRoom()`'s successor again) and assert the count returns to the *same* number as the first attach, not double it.

**Warning signs:** A test plan step that says "reload the guest tab" as its sole reconnect mechanism — that's a giveaway the check isn't actually exercising the registry's teardown path.

### Pitfall 3: Double-attaching via a race, not a rejoin

**What goes wrong:** `joinRoom()`/`createRoom()` have no re-entrancy guard — a double-click before the UI transitions away, or the user re-submitting the join form, calls `watchRoom()` a second time in the same tab, attaching a second copy of the 2 `watchRoom()`-owned listeners (`seats`, `status`) and, once `beginGame()` runs, the 6 guest-only watchers on top.

**Why it happens:** No current code path prevents `joinRoom()`/`createRoom()` from running twice; `gameStarted` guards `beginGame()` itself but not the earlier lobby-attach calls.

**How to avoid:** Registry should refuse (loudly — `console.error`, not silent) a duplicate attach for an already-tracked `(scope, path, event, label)` key rather than silently doubling the listener. This turns a latent leak into an immediately visible dev-console error during manual testing.

**Warning signs:** During the two-tab MP smoke test (VERIFY criterion 4/MEMORY's `project_mp_test_harness`), watch the console for any registry duplicate-attach warning while clicking Join/Create normally — its *absence* is itself part of the pass criteria.

### Pitfall 4: The comment-stripping false-negative, now live instead of theoretical

**What goes wrong:** Reusing `engine_contract_check.js`'s `stripLineComment()` (strip from first `//` to end-of-line) for the new "no raw `.on()` outside registry.js" check. `src/net/index.js` will contain `databaseURL: "https://pastry-pirates-default-rtdb.firebaseio.com"` (or similar) — if any line ever has a real `.on(` violation *after* a `://`-bearing string earlier on the same physical line, the naive stripper truncates before reaching it.

**Why it happens:** It's the readily-available precedent to copy, and it worked fine for Phase 8 because `src/engine`/`src/shared` never contained a URL string.

**How to avoid:** Don't comment-strip for this check at all — grep the literal event-name substrings (`.on("value"`, `.on("child_added"`, `.on("child_changed"`, `.on("child_removed"`, `.on("child_moved"`) across every file except `src/net/registry.js`, and accept the (rare, harmless) false positive of matching one inside a comment. For this check, a false positive is a minor annoyance; a false negative is exactly the bug class NET-01/02 exist to prevent — bias the check toward over-flagging.

**Warning signs:** Phase 8's own verification report already flagged this as an "inert" risk for `src/engine`/`src/shared` and explicitly asked "reconfirm that if a URL-bearing string is ever added here" — this phase is precisely that reconfirmation moment.

## Code Examples

### The `WatcherRegistry` skeleton

```javascript
// src/net/registry.js — the ONLY file permitted to call ref.on()/ref.off() in the whole repo.
// No import of UI code, no import of game/app-state. Pure transport bookkeeping.

let nextId = 1;
const entries = new Map(); // id -> {scope, ref, event, callback, label}

export function attach({ scope, ref, event, callback, label }) {
  const key = `${scope}:${ref.toString()}:${event}:${label || ""}`;
  for (const e of entries.values()) {
    if (e.key === key) {
      console.error(`registry: duplicate attach refused for ${key} — was watchRoom()/beginGame() called twice?`);
      return e.id;
    }
  }
  const id = nextId++;
  entries.set(id, { id, key, scope, ref, event, callback, label });
  return id;
}

export function detach(id) {
  const e = entries.get(id);
  if (!e) return;
  e.ref.off(e.event, e.callback);
  entries.delete(id);
}

export function detachRoom() {
  for (const e of [...entries.values()]) if (e.scope === "room") detach(e.id);
}

export function detachAll() {
  for (const id of [...entries.keys()]) detach(id);
}

// debug hook, mirrors window.__pp_module_ok / __pp_boot_count precedent from docs/MODULES.md
export function size(scope) {
  return scope ? [...entries.values()].filter(e => e.scope === scope).length : entries.size;
}
export function list() {
  return [...entries.values()].map(({ id, scope, event, label }) => ({ id, scope, event, label }));
}
```

Note `attach()` takes the already-built `ref` object (not a path string) per Pitfall 1's recommendation, and `entries` map keys by an *id*, not the ref, so callers get back a small handle (`registry.detach(id)`) rather than needing to reconstruct the exact original arguments to detach — this also settles CONTEXT.md's open "keys on `(path,event,callback)` or hands back an unsubscribe handle" discretion point in favor of the handle, since a handle is strictly easier to use correctly at every one of the 18 call sites and the two writer call sites (Pattern 2).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Inline anonymous arrow passed straight to `.on()`, no reference kept anywhere | Named callback constant held by a registry, `.off(event, callback)` on room/session teardown | This phase | Makes individual teardown possible at all (D-03) — today only `ref.off(event)` (nuke-everything-on-that-path) is even an option, and nothing currently calls it. |
| Firebase compat SDK (`firebase.database()`, `.on()`/`.off()`) | Firebase modular SDK (`onValue()`/`off()` returning an unsubscribe function directly from `onValue()`) | Firebase JS SDK v9+ (2021 general availability) | **Explicitly deferred to v2 as NETMOD-01** — the modular SDK's built-in unsubscribe-function-return would make a chunk of this phase's registry design unnecessary, but migrating SDKs mid-refactor is a determinism-gate risk this milestone rejects outright (REQUIREMENTS.md Out of Scope table). Do not let this phase's design quietly start assuming modular-SDK ergonomics. |

**Deprecated/outdated:** Firebase RTDB itself is not deprecated, but Firebase's own docs steer new projects toward Firestore or the modular RTDB SDK — noted in `CONCERNS.md` as a "Dependencies at Risk" item, unrelated to this phase's scope.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Firebase RTDB listeners are keyed by path+query+event+callback (not by JS `Reference` object instance), so `.off()` on a freshly-constructed ref detaches a listener attached via a different ref instance to the same path. | Q2c / Pitfall 1 | If wrong, a registry that reconstructs refs from stored paths would silently fail to detach anything, defeating NET-01/02/03 entirely while `npm test`-style checks stay green (the failure is browser-only). **Mitigated in the recommended design already**: the registry stores the original `Reference` object, not a path string, so this assumption's truth value doesn't actually gate correctness — it only affects whether a *simpler* path-based design would have been viable. Still worth a 5-line Wave 0 browser smoke test to close out with certainty. |
| A2 | No current code path calls `watchRoom()`, `beginGame()`'s watcher-attach block, or `fbInit()`/`watchPresence()` more than once per page load under *normal* (non-race) use. | Pattern 3 / Pitfall 3 | If wrong (some legitimate flow really does call these twice today), the registry's "refuse duplicate attach" behavior would break that flow instead of catching a bug — verify by re-reading `boot()`'s and `wireLobby()`'s full call graph once more during planning, not just this research pass's grep-based read. |
| A3 | Firebase compat SDK's automatic reconnect (after a network blip) re-fires existing `.on()` listeners transparently without requiring the app to re-attach them. | Q2d | Low risk — this is well-documented, standard RTDB SDK behavior, not something this phase changes or depends on structurally; listed as an assumption only because it wasn't independently re-verified against the exact v12.15.0 changelog this session. |

## Open Questions

1. **Does the "reference-identity" question (A1) actually need resolving before planning, given the registry design sidesteps it?**
   - What we know: storing the original `Reference` object (Pattern skeleton above) makes the answer irrelevant to correctness.
   - What's unclear: whether the planner wants the Wave 0 smoke test anyway, purely to document the fact for future maintainers who might later "simplify" the registry to store path strings.
   - Recommendation: make it a cheap, optional Wave 0 verification step, not a blocking gate — the design doesn't depend on the answer.

2. **How much of the room-lifecycle quartet (`createRoom`/`joinRoom`/`watchRoom`/`startGame`) should physically relocate into `src/net/` this phase vs. stay in index.html with only their `.on()` calls extracted?**
   - What we know: the 2 `.on()` calls inside `watchRoom()` are mandatory (part of the 18). The surrounding UI orchestration (`showRoom()`, `alert()`, `renderSeatList()`) is heavily interleaved.
   - What's unclear: whether SPLIT-04's "networking module(s)" success criterion is satisfied by moving just the registry + all 18 watcher/writer transport calls, or requires these four functions to move wholesale (with UI calls passed in as handlers, same pattern).
   - Recommendation: minimum-viable split (registry + 18 watchers' transport halves + the clearly-separable writer functions from the table above) satisfies the *letter* of every stated ROADMAP/REQUIREMENTS criterion; treat deeper extraction of the lobby quartet as a stretch goal the planner can scope into a later wave if time allows, not a blocking requirement.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Custom, no third-party test runner. Plain Node scripts (`scripts/*.js`) using hand-rolled `PASS`/`FAIL` console output, wired through `npm test`. |
| Config file | None — `package.json`'s `"scripts": { "test": "node scripts/determinism_baseline.js --verify && node scripts/engine_contract_check.js && node scripts/dlog_replay_test.js" }` *is* the config. |
| Quick run command | `npm test` (re-confirmed this session: runs in well under 10s — 30 determinism seeds + 4 contract assertions + replay cases, all green today). |
| Full suite command | `npm test` (there is no separate "full" tier yet — this phase adds a new script to the chain). |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NET-01 | Every `.on()` has a matching, registry-mediated `.off()` | unit (registry against a fake `Reference`) | `node scripts/net_registry_test.js` | ❌ Wave 0 |
| NET-02 | Single registry, exact callback-reference matching, no bypass | static/contract | `node scripts/net_contract_check.js` | ❌ Wave 0 |
| NET-03 | Zero dangling listeners across a leave/rejoin cycle | behavioral, browser (Chrome MCP), same-tab no-reload probe against `window.__pp_net_debug` | manual/Chrome-MCP-driven — not automatable in Node (needs a real Firebase connection) | ❌ Wave 0 (needs the debug hook added) |
| SPLIT-04 | `src/net/` never imports UI | static/contract (extend `net_contract_check.js`) | `node scripts/net_contract_check.js` | ❌ Wave 0 (can share the file with NET-02's check) |

### Sampling Rate

- **Per task commit:** `npm test` (now includes the new registry unit test + contract check once added).
- **Per wave merge:** `npm test` + a manual Chrome MCP pass exercising `window.__pp_net_debug` counts (NET-03, VERIFY-04-adjacent but this phase's own responsibility, not deferred to Phase 12).
- **Phase gate:** `npm test` green, contract check green, AND a documented Chrome MCP transcript showing the same-tab attach→detach→re-attach count cycle (mirrors 08-05's precedent of an itemized browser transcript standing in for what can't be scripted headlessly).

### Wave 0 Gaps

- [ ] `scripts/net_registry_test.js` — a Node unit test for `src/net/registry.js` against a small in-memory fake `Reference` (implementing `.on()`/`.off()`/`.toString()` semantics only — no real network) covering: attach/detach round-trip, duplicate-attach refusal, `detachRoom()` leaves session-scoped entries intact, `detachAll()` clears everything, and the Pitfall 1 cross-instance-ref detach case if a fake supports it.
- [ ] `scripts/net_contract_check.js` — mirrors `engine_contract_check.js`'s structure (multiple named assertions, one run, all failures printed) for: (a) zero `.on("value"`/`.on("child_added"`/etc. outside `src/net/registry.js`, using literal-substring matching with **no** comment-stripping (Pitfall 4); (b) `src/net/*.js` contains none of the known UI function names as bare identifiers (grep against a hardcoded list, same "hardcoded not derived" rationale `engine_contract_check.js` uses for its export-completeness assertion, to avoid the check being tautological).
- [ ] `window.__pp_net_debug` — a new, intentional, named debug bridge (mirrors `window.__pp_module_ok`/`window.__pp_boot_count`) exposing `registry.size()`/`registry.list()` for Chrome MCP console evaluation during the NET-03 behavioral check. This is also the natural seed for GLOBAL-03's "single documented debug mechanism" requirement in Phase 10 — name it accordingly now so Phase 10 doesn't have to rename it.
- [ ] Framework install: none — no new test framework needed, same `node scripts/*.js` convention as Phase 7/8.

## Security Domain

security_enforcement is enabled (`security_asvs_level: 1`, `security_block_on: "high"` in `.planning/config.json`); this phase touches networking code, so this section is required.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | This app has no authentication layer (documented, intentional — `ARCHITECTURE.md` "Authentication: None"). Out of scope for this phase to introduce. |
| V3 Session Management | Partial | `pp_sess`/`pp_id` in `localStorage` — this phase does not change how sessions are created or read, only how the Firebase listeners that consume `room`/`mySeat` are wired. No new session-management surface introduced. |
| V4 Access Control | No | Firebase RTDB security rules (server-side, not in this repo) already gate write access; this phase changes zero rule-relevant read/write *paths*, only client-side code organization (Runtime State Inventory above). |
| V5 Input Validation | No new surface | This phase doesn't add new user-input handling; existing chat/name escaping (`escHtml`) is untouched and out of scope. |
| V6 Cryptography | No | No crypto in this phase. |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Registry double-attach silently doubling a listener's side effects (e.g., a chat message rendered twice, a battle broadcast written twice) | Denial of Service (resource/quota exhaustion under Firebase Spark's 100-connection cap, already flagged in `CONCERNS.md`) | Registry's duplicate-attach refusal (Pitfall 3) is itself the mitigation — no new control needed beyond what this phase already designs in. |
| A stale/duplicate listener from a rejoin race receiving and acting on data intended for a different room instance | Tampering (state corruption, not an external attacker) | Same fix — the registry's scoping and duplicate-attach guard prevents two listeners from ever both being live for the same room path. |

No new attacker-facing surface is introduced by this phase — it is an internal code-organization change to an already-public, already-unauthenticated multiplayer sync layer. The one genuine risk class (resource exhaustion from listener accumulation) is exactly what NET-01/02/03 exist to close.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `npm test`, new Wave 0 scripts | ✓ | v25.9.0 (confirmed this session) | — (floor is Node 18+ per `docs/MODULES.md`) |
| Python 3 (`http.server`) | Local dev server for browser verification | ✓ (assumed present per `docs/MODULES.md`'s own dependency on it — not independently re-checked this session) | — | `npm start` (same server, alias) |
| Chrome (for Chrome MCP behavioral checks) | NET-03's behavioral proof, VERIFY-03/04-adjacent MP smoke test | Not independently probed this research session — required for the phase's own Wave-0-gap behavioral test, not just Phase 12 | — | None — a real browser + real Firebase connection is required for NET-03; there is no headless/Node fallback for this specific requirement (see "Don't Hand-Roll" above). |
| Firebase RTDB connectivity | Two-tab MP smoke test (ROADMAP criterion 4) | Not independently probed this research session (would require live credentials/network) | — | None documented — this project has no offline-multiplayer fallback (`ARCHITECTURE.md`: "No offline fallback for multiplayer"). |

**Missing dependencies with no fallback:**
- A real browser + live Firebase connection for the NET-03 behavioral check and the two-tab MP smoke test — inherent to what's being verified, not a gap in this research.

## Sources

### Primary (HIGH confidence)
- `index.html` (this repo) — direct read/grep of all 18 `.on()` sites, both `.off()` sites, all 33 non-watcher `db.ref()` call sites, `boot()`/`leaveGame()`/`resumeHostGame()` room-lifecycle functions. Every line number cited above was independently re-confirmed via `grep -n` in this session, not carried over from CONTEXT.md's table unverified.
- `docs/MODULES.md`, `scripts/engine_contract_check.js` — the standing-gate pattern this phase's contract check must mirror (and the one deviation, Pitfall 4, that must NOT be copied).
- `.planning/phases/08-engine-extraction-node-harness-migration/08-VERIFICATION.md` — confirmed the current bridge surface (128 keys) contains zero Phase-10-scoped globals (`game`/`myId`/`room`/`db`), which is what makes Pattern 1's "don't try to bridge these yet" recommendation necessary rather than optional.

### Secondary (MEDIUM confidence)
- [off() function - Firebase Modular JavaScript SDK Documentation](https://modularfirebase.web.app/reference/database.off) and general Firebase Realtime Database docs — confirms `.off()`'s three-overload matching semantics (no args = remove all; eventType only = remove all callbacks for that event; eventType+callback = exact match; +context further narrows the match). None of this codebase's 18 `.on()` calls pass a `context` argument, so the registry never needs to track/pass one.
- [Refs to the same path affect each other · Issue #203 · firebase/firebase-js-sdk](https://github.com/firebase/firebase-js-sdk/issues/203) — empirical, reproducible bug report demonstrating that `.off()` on one `Reference` instance detaches a listener attached via a *different* `Reference` instance to the same path — the basis for Assumption A1 / Pitfall 1. No maintainer confirmation quote was retrievable this session (the issue thread's substantive discussion wasn't returned by the fetch), which is why this is MEDIUM rather than HIGH confidence.

### Tertiary (LOW confidence)
- None relied upon for a load-bearing claim — every claim above is either a direct repo read or backed by at least a secondary source, with confidence explicitly downgraded (Assumptions Log) where the secondary source itself has a gap.

## Metadata

**Confidence breakdown:**
- Watcher/writer call-site inventory (Q1a/Q1b, Runtime State Inventory): HIGH — every line number independently re-grepped this session against the live `index.html`, not copied from CONTEXT.md.
- Handler-injection seam design (Q1c/Q1d, Pattern 1): HIGH — directly derived from D-06's own stated direction plus the concrete constraint (Q1d, synchronous dispatch) that rules out the emitter alternative; low novelty/low risk design.
- Reference-identity / `.off()` cross-instance behavior (Q2c): MEDIUM — one empirical bug report, no official-docs confirmation found this session; mitigated by a design (store the ref object) that doesn't depend on the answer either way.
- Mechanical enforcement design (Q5): HIGH — directly modeled on an existing, currently-green, currently-committed script in this repo, with one explicit, well-reasoned deviation (Pitfall 4) from its exact approach.
- NET-03 methodology (Q3/Q4): HIGH — grounded in a direct reading of `leaveGame()`/`boot()`/`joinRoom()`'s actual control flow, which reveals `location.reload()` is the only current exit path (a verifiable fact, not an inference).

**Research date:** 2026-07-24
**Valid until:** 30 days (stable, no external dependency churn expected — Firebase compat v12.15.0 is pinned and this phase explicitly defers any SDK migration to v2/NETMOD-01).
