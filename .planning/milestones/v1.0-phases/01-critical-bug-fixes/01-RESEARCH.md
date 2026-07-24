# Phase 1: Critical Bug Fixes - Research

**Researched:** 2026-07-23
**Domain:** Safari/WebKit rendering performance (typewriter text reveal vs. CSS compositing) + Firebase-RTDB-backed multiplayer turn-timer and host-refresh replay recovery
**Confidence:** MEDIUM-HIGH — every mechanism below is grounded in direct reads of `index.html`; the two "why does it feel completely frozen" root causes for BUG-02/03/04 combine confirmed code facts with one clearly-labeled, evidence-supported hypothesis that still needs live reproduction to nail down 100%.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Safari storm performance**
- **D-01:** Keep the character-by-character typewriter narration reveal everywhere — including during storms — but rewrite it so it stops forcing style/layout recalc on every tick. The storm rain overlay stays visually as-is. — Reversibility: reversible — the reveal is a single self-contained function (`typewriterReveal`), swappable without touching call sites.
- **D-02:** Do not simplify or degrade the storm rain overlay to buy back frames. Visual fidelity of the storm is preserved.
- **D-03:** Do not special-case storms by disabling the type-in effect during them. Narration must behave identically storm or no storm.

**Multiplayer timer**
- **D-04:** Do **not** add a ⏸ pause button to multiplayer. The scoped fix is to make the existing ⏱ timer off/on toggle behave correctly. — Reversibility: reversible — adding a real MP pause later is additive.
- **D-05:** Toggling the timer off and then back on mid-turn must re-arm the current turn's shot clock with a **fresh 30 seconds**. Today it never re-arms at all, because `startShotClock()` is only called at turn start.
- **D-06:** A 20-second penalty that already fired (player lost 1🌕 to the others, and it was narrated) is **not** refunded when the timer is switched off. Turning the timer off only prevents *future* penalties. The event log stays honest — no rewriting already-narrated events.

**Refresh / state recovery**
- **D-07:** When a host refresh happens and the decision-log replay cannot fully rebuild the game, **fail loudly**. Detect the short/incomplete replay and show a "couldn't fully restore this voyage" state with explicit **Resume anyway** / **Restart** choices. Never silently hand back a board that looks reset.
- **D-08:** Both host and guests get a coherent state during that failure — do not leave guests staring at a frozen board with no explanation.

**Verification**
- **D-09:** Ship a temporary, toggleable FPS / frame-time readout plus a way to force a storm on demand, so Wyatt can confirm the fix on his own Safari. **Remove the instrumentation before the phase ships.** — Reversibility: reversible — instrumentation is additive and explicitly removed at the end.
- **D-10:** Multiplayer verification uses the existing local-server + two-Chrome-tabs harness. Note the known shared-`localStorage` `pp_id` gotcha when driving two seats from one browser profile.

### Claude's Discretion
- Root-causing whether BUG-02, BUG-03, and BUG-04 are one causal chain or three independent defects. Initial evidence suggests one chain (dead clock → hung turn → no decisions logged → replay rebuilds a fresh board from the seed). Confirm before designing the fix.
- The specific mechanism for a cheap reveal (pre-measured clip, opacity pass, batched writes, `requestAnimationFrame` vs. `setTimeout`) — subject to the constraint that the promise contract in `panel()`/`flash()` must be preserved.
- Whether Firebase watcher cleanup (`.off()`) is required as part of the refresh fix, or can be left to a later phase.

### Deferred Ideas (OUT OF SCOPE)
- **Real ⏸ pause in multiplayer** (host-only or any-seat) — considered and explicitly declined for this phase (D-04). Revisit if the timer-toggle fix proves insufficient in play.
- **Firebase watcher `.off()` cleanup pass** — real debt from `CONCERNS.md`; only pull into this phase if it's a direct cause of the refresh bug. Otherwise its own future phase.
- **Checkpointing the game state every N events** so replay doesn't re-run from turn 1 — a scaling fix from `CONCERNS.md`, out of scope here.
- **Modular refactor of `index.html`** — already recorded as out of scope in `REQUIREMENTS.md`.
- **Text speed multiplier change (NARR-05)** — lives in Phase 3, but touches `REVEAL_MS_PER_CHAR` (`index.html:3157`), the same constant near the typewriter rewrite. Flagged so Phase 3 doesn't collide with this phase's changes.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BUG-01 | Storm rendering runs at an acceptable frame rate in Safari (no near-crash); suspected lerping narration box effect is rolled back or replaced | §"BUG-01: Safari storm performance" — root-cause hypothesis (WebKit compositing overlap invalidation of the storm's blur+mask rain layers, triggered by unrelated DOM writes), the batched-substring-write fix, and the FPS/frame-time instrumentation plan |
| BUG-02 | Pausing the multiplayer timer, then unpausing, resumes an interactive game (host and guest can act) | §"BUG-02: Timer re-arm" — confirmed missing re-arm branch in `watchTimer()`, confirmed secondary defect in `shotClockForce`/`shotClockFired` state, concrete fix sketch respecting D-05/D-06 |
| BUG-03 | A page refresh during multiplayer does not reset the game to its start state | §"BUG-03/04: Refresh recovery" — confirmed silent-catch/no-validation gap in `resumeHostGame()`, confirmed `evPushed`/`resumeEvLen` desync mechanism, concrete detection check |
| BUG-04 | The deterministic engine continues to function after a pause/unpause/refresh cycle | §"BUG-03/04: Refresh recovery" and §"Regression risk" — the `replaying`/`dlog` contract that must stay intact, and what "engine still functions" actually means once BUG-03's detection/fail-loud path exists |
</phase_requirements>

## Summary

This phase is pure archaeology-then-surgery inside a single 5,227-line `index.html` — no new dependencies, no framework, edits happen in the existing hand-rolled functions. Two unrelated defect clusters share nothing except that they both live in fragile, previously-flagged territory (`CONCERNS.md` §"Replay Mechanism Complexity", §"Firebase Watchers Without Cleanup").

**BUG-01 (Safari storm perf)** is a rendering-cost interaction, not a broken feature: `typewriterReveal()` (`index.html:3120-3153`) mutates a live text node once per revealed character, every 16–32ms, via `n.nodeValue+=u.ch` — several separate DOM writes per tick when multiple characters catch up. That alone is a mild, well-known DOM-mutation cost. The Safari-specific *crash-level* cost only shows up while a storm is active because the storm overlay (`index.html:84-109`, built at `index.html:2454-2469`) is four `filter:blur()` + `mask-image`-animated, `will-change:mask-position` layers running a live compositor animation (`index.html:107-108`) *only while `.storming` is applied*. WebKit's overlap-based compositing model re-evaluates and can force full re-rasterization of nearby active filter/mask layers whenever unrelated layout-affecting DOM writes happen elsewhere on the page — and `#apGrid`'s `grid-template-rows` transition (`index.html:253`) plus the per-character text mutations are exactly that kind of write. With no storm active, those blur/mask layers are either not yet built or paused (`animation-play-state:paused`, `index.html:106,109`) — there's nothing expensive nearby to invalidate, which is precisely why the user observes **zero frame drops with no storm and near-crash with one**. The user-locked fix path is to make `typewriterReveal()` write at most one `nodeValue` assignment per touched text node per tick (batching the currently-per-character `+=` calls into a single substring write), which cuts DOM mutation volume without touching the storm CSS, without special-casing storms, and without changing the promise contract `panel()`/`flash()` depend on.

**BUG-02/03/04 (timer + refresh)** trace back to two separate, both-confirmed defects in the shot-clock/replay machinery, not one simple chain:
1. `watchTimer()` (`index.html:2917-2924`) only reacts when the timer is switched **off** (`stopShotClock()`); the branch for switching it back **on** is a no-op beyond a UI repaint — this is the literal, confirmed cause of "the timer never re-arms" (D-05). A second, easy-to-miss defect sits one layer deeper: `stopShotClock()` nulls the shared global `shotClockForce` (`index.html:2872`), and nothing besides a *brand-new* decision's `withShotClock()` executor (`index.html:3343-3356`) ever re-populates it — so even a correctly-re-armed countdown for the *already-in-flight* decision will silently fail to auto-resolve when it hits 30s again. A naive re-arm that just calls `startShotClock()` again also resets `shotClockFired={}` (`index.html:2863`), which would let the 20s penalty (D-06: "not refunded... prevents only future penalties") fire a **second** time for the same turn. Both of these are concrete implementation traps for whoever writes the fix.
2. `resumeHostGame()` (`index.html:5108-5123`) reads the Firebase decision log (`dlog`) and event count (`resumeEvLen`) with **zero success/failure validation** and a silently-swallowed `.catch(e=>{})` on the `dlog` read (`index.html:5114`). If that read comes back empty (network hiccup, permission denial, or simply racing the in-flight decision's own fire-and-forget `logDecision()` write, `index.html:4621`), `beginGame()` starts a **fresh** `Game` instance from the same seed — which looks and behaves exactly like Wyatt's report: "all ingredients, all positions, back to start." Worse, `endReplay()` (`index.html:4646-4651`) sets `evPushed=resumeEvLen` unconditionally — if the replay came up short, the live game's `game.events.length` may never catch back up to that number for a long stretch, meaning `pushEvents()` (`index.html:4654-4661`) broadcasts **nothing** to guests, who sit frozen on stale state. This is the mechanism research priority #3 asked to pin down, and it's directly, cheaply detectable: compare `game.events.length` against `resumeEvLen` at the moment `endReplay()` fires.

**Primary recommendation:** For BUG-01, rewrite `typewriterReveal()` to batch per-tick text-node writes into one `nodeValue` assignment per node (substring slice, not incremental `+=`), keep `setTimeout`-based pacing (not `requestAnimationFrame` — the existing code comment's backgrounded-tab reasoning is correct and must not be undone), and verify the fix with the FPS/force-storm dev instrumentation in real Safari before declaring victory. For BUG-02, fix `watchTimer()`'s on-branch to re-arm the in-flight decision's clock through a dedicated re-arm path that preserves `shotClockFired.t20` and correctly re-establishes `shotClockForce` — do not simply call `startShotClock()` unmodified. For BUG-03/04, add an explicit post-replay completeness check in `resumeHostGame()`/`endReplay()` (compare rebuilt event count to `resumeEvLen`) and surface D-07's Resume-anyway/Restart UI the moment that check fails, instead of silently continuing.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Storm visual overlay (rain layers, blur/mask) | Browser / Client (CSS compositor) | — | Purely decorative CSS animation; no engine or network involvement (`index.html:84-109`, `2454-2469`) |
| Narration typewriter reveal | Browser / Client (DOM/JS) | — | `typewriterReveal()` is a pure DOM-mutation loop local to one browser tab; it must stay client-only since D-01 forbids touching the storm overlay it happens to interact with |
| Turn/shot-clock state | API / Backend-equivalent (host browser, authoritative) | Browser / Client (guest, render-only) | Host authority model: only the host browser runs `startShotClock`/`stopShotClock`/`expireShotClock`; guests only reflect `clockState` via `watchClock()` (`index.html:2977-2980`) — this is the existing pattern and must not change |
| Timer on/off toggle | Database / Storage (Firebase RTDB `timerOff` node) | API-equivalent (host reacts) | Any player writes the toggle (`toggleTimer()`, `index.html:2911-2916`); only the host's own listener (`watchTimer()`) drives the actual clock state change — guests just repaint |
| Decision log (dlog) / replay | Database / Storage (Firebase RTDB `dlog` node) | API-equivalent (host replays) | `logDecision()` appends to Firebase; only the host ever reads it back to replay (`resumeHostGame()`) — guests never touch `dlog` |
| Event feed (game.events broadcast) | Database / Storage (Firebase RTDB `ev` node) | Browser / Client (guest render) | Host pushes (`pushEvents()`), guests passively render from `child_added` (`watchEvents()`, `index.html:4718-4728`) — this is how a guest refresh already self-heals; the host-refresh path does not have an equivalent self-healing guarantee, which is exactly the BUG-03/04 gap |
| Failure/incomplete-replay UI | Browser / Client (new UI state) | Database / Storage (needs a signal both host and guest can read) | D-08 requires guests to see a coherent state too — the "couldn't fully restore" signal must be written somewhere guests already watch (e.g. `rooms/{room}/status` or a new small node), not just shown locally on the host |

## Standard Stack

No new libraries, frameworks, or dependencies are introduced by this phase. Per `CLAUDE.md`: "Vanilla HTML/CSS/JS in `index.html`, Firebase Realtime DB for multiplayer — edits happen in place, no framework introduction." All fixes are edits to existing hand-rolled functions using the existing Firebase SDK v12.15.0 (compat) already loaded via CDN in `index.html`.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Batched substring writes in `typewriterReveal()` | Per-character `<span>`-wrapped reveal with CSS `opacity`/`visibility` toggles (pre-render all spans once, toggle visibility per tick) | Compositor-only property (`opacity`) is cheaper per-toggle than a text-node mutation, but wrapping every character in a `<span>` explodes DOM node count for long narration strings and complicates the existing `<img>`-inline-icon handling (units already mix text chars and whole `<img>` elements in document order) — more invasive than the constraint calls for. Rejected: the existing per-node substring-batch approach gets nearly all of the win with a much smaller diff. |
| `setTimeout`-driven polling loop (unchanged) | `requestAnimationFrame`-driven loop | rAF callbacks are fully suspended (not throttled) in a backgrounded/hidden tab — the existing code comment at `index.html:3115-3119` explains this was deliberately rejected because `flash()` awaits the reveal promise before the bot-turn loop can proceed; switching to rAF would let a backgrounded tab hang the whole game loop. Do not reintroduce this. |
| Manual `evPushed`/`resumeEvLen` completeness check | A server-authoritative "last known good" checkpoint object written incrementally to Firebase | A real checkpoint (full state snapshot every N events) is the correct long-term fix for `CONCERNS.md`'s "Event Log Growth" scaling limit, but that's explicitly deferred (see Deferred Ideas). The cheap, in-scope fix is comparing counts that are already being fetched. |

### Installation
No installation step — no new packages.

## Package Legitimacy Audit

Not applicable. This phase introduces zero new external packages (no `npm install`, no new CDN scripts). The only third-party dependency touched by this phase's fixes is the already-present Firebase SDK v12.15.0 (compat), which is out of scope to change per `CLAUDE.md`.

## Architecture Patterns

### System Architecture Diagram — BUG-01 path (storm + typewriter interaction)

```
render() [index.html:2470]
   │  (fires once per event index change, NOT per character)
   ▼
storm toggle block [index.html:2550-2573]
   │  toggles #boardwrap.storming class + sets --slant CSS var
   ▼
CSS compositor: 4x #stormOverlay .rlayer
   │  filter:blur(.6px) + mask-image (repeating-linear-gradient)
   │  animation: rainFall .75s linear infinite   ◄── ACTIVE ONLY while .storming
   │  will-change: mask-position
   ▼
[independently, on its own 16-32ms setTimeout cadence]
panel() [index.html:3088] → typewriterReveal(msgEl, 20ms/char) [index.html:3120]
   │  per tick: walks .apMsg text nodes, writes revealed chars
   │  TODAY: n.nodeValue += ch  (one DOM write per NEW character this tick)
   ▼
style/layout invalidation on #actionPanel/.apMsg
   │  (#apGrid has `transition: grid-template-rows .1s ease` — a layout-affecting
   │   property — index.html:253, adds its own layout cost independent of storm state)
   ▼
WebKit compositing update pass (overlap-based layer re-evaluation)
   │  ── HYPOTHESIS: any layout-invalidating write anywhere on the page can force
   │     WebKit to re-check/re-rasterize nearby ACTIVE filter+mask compositing
   │     layers (the storm rain), which is expensive; with no storm, those layers
   │     are paused/nonexistent so there's nothing costly to re-touch
   ▼
Frame paint — HITCH/CRASH only while storming; smooth otherwise (matches the
user's own observed asymmetry)
```

### System Architecture Diagram — BUG-02/03/04 path (timer + replay)

```
HOST browser (authoritative)                    GUEST browser (render-only)
──────────────────────────────                  ───────────────────────────
ask()/pickCell()/battleAsk() called
  │
  ├─ armClock(seat) [3332]
  │    └─ startShotClock(p) [2859]
  │         (no-op if timerOff===true)
  │         sets shotClockSeat, shotClockDeadline,
  │         shotClockFired={}, broadcastClock()
  │
  ├─ withShotClock(seat, base, default) [3343]
  │    creates shotClockForce closure,
  │    wraps `base` (remotePrompt/localAsk)
  │
  ├─ base = remotePrompt(seat, payload) [4663]
  │    writes rooms/{room}/prompt ────────────►  watchPrompt() [4730]
  │    listens rooms/{room}/response              renders buttons in #actionPanel
  │                                                  │
  │  [ANY PLAYER] toggleTimer() [2911]               │ player clicks
  │    writes rooms/{room}/timerOff                  ▼
  │         │                                    sendResponse(id, choice) [4675]
  │         ▼                                      writes rooms/{room}/response
  │    watchTimer() [2917] fires on BOTH
  │      HOST: if(timerOff) stopShotClock() [2870]
  │        clears shotClockSeat, shotClockForce=null,
  │        interval cleared, broadcastClock()
  │      HOST: else (timer back ON) → NO-OP  ◄── CONFIRMED BUG (D-05)
  │      GUEST: only setClockUI() — never touches
  │        #actionPanel, so buttons stay live
  │
  ├─ [30s interval, LOCAL only] shotClockTick() [2925]
  │    if elapsed>=30000 → expireShotClock() [2946]
  │      shotClockSeat=null; if(shotClockForce) shotClockForce();
  │      db.ref(prompt).remove() for non-local seat  ◄── clears guest's buttons
  │      stopShotClock()
  │
  ▼ (eventually) response arrives → base resolves →
    withShotClock's base.then(...) still fires (independent of shotClockForce)
    → logDecision(v) [4612] → dlog.push(v); db.ref(dlog/n).set(...) FIRE-AND-FORGET

════════════════ HOST REFRESH ════════════════

boot() [5181] → sess.room exists → db.ref(room).get()
  isHost && status==="playing" → resumeHostGame(r) [5108]
    dlog = await db.ref(dlog).get()  ── .catch(e=>{}) SWALLOWS FAILURE ◄── CONFIRMED
    resumeEvLen = count of existing rooms/{room}/ev children
    replaying=true; beginGame(r.cfg, r.seed)
      │
      ▼
    ask()/pickCell()/battleAsk() during replay:
      if(dlogIdx<dlog.length){ consume dlog[dlogIdx++]; continue; }
      else endReplay() [4646]:
        replaying=false; evPushed=resumeEvLen  ◄── UNCONDITIONAL, no check
                                                    that game.events.length
                                                    actually reached resumeEvLen
    pushEvents() [4654]: while(evPushed<game.events.length) push
      → if game.events.length stayed BELOW resumeEvLen (short replay),
        NOTHING is pushed until live play organically exceeds the old count
        → guests see no new events → appears frozen
```

### Recommended approach — BUG-01 fix location
No new files/folders (single-file constraint). The fix is entirely inside `typewriterReveal()` (`index.html:3120-3153`). No other call site changes — `panel()` (`index.html:3088-3100`) and `flash()` (`index.html:3397-3408`) keep consuming the returned promise exactly as today.

### Pattern 1: Batch per-tick DOM writes to one write per text node
**What:** Instead of looping over every *newly revealed character* and calling `node.nodeValue+=ch` once per character, group units by their owning text node, track how many characters of each node are revealed so far, and write the full revealed substring **once per node per tick** using `nodeValue = full.slice(0, revealedCount)`.
**When to use:** Any per-tick incremental-reveal loop where multiple units can become "due" in the same tick (already true today — `step()` uses a `while(revealed<target)` catch-up loop, meaning several characters can be revealed in one tick when a browser is under load).
**Example:**
```javascript
// Source: derived directly from index.html:3120-3153 (typewriterReveal), rewritten to
// preserve the exact same promise/pacing contract while cutting DOM writes per tick.
function typewriterReveal(msgEl,msPerChar){
  if(msgEl._revealTimer)clearTimeout(msgEl._revealTimer);
  const nodeUnits=[];              // [{node, full, revealed}] — one entry per text node
  const units=[];                  // flat, in document order, for pacing (unchanged shape)
  const walker=document.createTreeWalker(msgEl,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n;
  while(n=walker.nextNode()){
    if(n.nodeType===Node.TEXT_NODE){
      if(!n.nodeValue)continue;
      const full=n.nodeValue;n.nodeValue="";
      const nodeIdx=nodeUnits.push({node:n,full,revealed:0})-1;
      for(let i=0;i<full.length;i++)units.push({nodeIdx});
    }else if(n.tagName==="IMG"){
      n.style.opacity="0";n.style.transition="opacity .1s";
      units.push({img:n});
    }
  }
  return new Promise(resolve=>{
    const total=units.length;
    if(!total){resolve();return;}
    let revealed=0;
    const start=performance.now();
    const pollMs=Math.max(16,Math.min(msPerChar,32));
    const step=()=>{
      const target=Math.min(total,Math.floor((performance.now()-start)/msPerChar));
      const dirty=new Set();
      while(revealed<target){
        const u=units[revealed++];
        if(u.img)u.img.style.opacity="1";
        else{nodeUnits[u.nodeIdx].revealed++;dirty.add(u.nodeIdx);}
      }
      // one nodeValue write per touched text node this tick — not one per character
      dirty.forEach(idx=>{const nu=nodeUnits[idx];nu.node.nodeValue=nu.full.slice(0,nu.revealed);});
      if(revealed<total)msgEl._revealTimer=setTimeout(step,pollMs);
      else resolve();
    };
    step();
  });
}
```
This keeps `setTimeout` pacing (backgrounded-tab safe, per the existing rationale), keeps the exact promise resolution contract `_revealDone`/`flash()` rely on, does not touch `#stormOverlay` CSS at all, and does not special-case storms — fully compliant with D-01/D-02/D-03.

### Pattern 2: Timer re-arm without resetting the penalty/force-resolve state
**What:** `watchTimer()`'s on-branch must restart the countdown for whichever decision is currently in flight, without going through unmodified `startShotClock()` (which resets `shotClockFired={}`, risking a double 20s penalty per D-06, and does not restore `shotClockForce`, silently breaking the 30s force-expiry safety net for that decision).
**When to use:** Exactly this one call site — `watchTimer()`'s `else` branch (`index.html:2917-2924`).
**Example (illustrative — planner should verify exact field names against current code before implementing):**
```javascript
// Source: derived from index.html:2859-2869 (startShotClock), 2870-2875 (stopShotClock),
// 2917-2924 (watchTimer), 3343-3356 (withShotClock) — a re-arm path that reuses
// startShotClock's deadline/interval logic but preserves the already-fired 20s flag and
// makes the existing withShotClock closure force-resolvable again.
function rearmShotClock(p){
  if(!isHost||timerOff)return;
  shotClockSeat=p.idx;
  shotClockDeadline=Date.now()+30000;       // fresh 30s (D-05)
  // shotClockFired is intentionally NOT reset here — a 20s penalty that already fired
  // for this turn must not fire again (D-06)
  shotClockPaused=false;
  broadcastClock();
  if(shotClockTimer)clearInterval(shotClockTimer);
  shotClockTimer=setInterval(shotClockTick,500);
}
function watchTimer(){
  if(!db||!room)return;
  db.ref("rooms/"+room+"/timerOff").on("value",s=>{
    const was=timerOff;
    timerOff=!!s.val();
    if(isHost){
      if(timerOff)stopShotClock();
      else if(was&&shotClockSeat==null){
        const seat=currentTurnSeat();
        const p=seat!=null?game.players[seat]:null;
        if(p&&!p.done)rearmShotClock(p);
      }
    }
    setClockUI();
  });
}
```
The remaining open question — how `expireShotClock()` force-resolves this re-armed decision when `shotClockForce` was nulled by `stopShotClock()` — needs to be resolved during planning: either `rearmShotClock()` must be able to reconstruct a working `shotClockForce` for the specific pending `withShotClock` promise (the cleanest fix routes the re-arm *through* `withShotClock`'s own state instead of only through `startShotClock`), or `expireShotClock()` needs a fallback path for `shotClockForce===null` that still forces a default resolution safely. Flag this precisely for the planner — do not let a "just call startShotClock again" fix ship without addressing it.

### Pattern 3: Fail loudly on incomplete replay
**What:** After `endReplay()` (or right before it fires), compare how many events the replay actually reconstructed against `resumeEvLen` (the event count Firebase had before the reload). A large shortfall means the log was empty/incomplete and the game state is not trustworthy.
**When to use:** `resumeHostGame()` / `endReplay()` (`index.html:5108-5123`, `4646-4651`).
**Example (illustrative):**
```javascript
// Source: derived from index.html:4646-4651 (endReplay) and 5108-5123 (resumeHostGame)
function endReplay(){
  if(!replaying)return;
  replaying=false;
  const shortfall=resumeEvLen-game.events.length;
  if(shortfall>SOME_TOLERANCE){       // e.g. more than a couple of events short
    showIncompleteReplayRecovery(shortfall);   // D-07: Resume anyway / Restart UI,
    return;                                     // and D-08: surface to guests too
  }
  evPushed=resumeEvLen;
  liveRender();
}
```
`SOME_TOLERANCE` should be small (on the order of the few events a single in-flight, not-yet-logged decision could produce) — the goal is distinguishing "replay reconstructed essentially everything, just missing the very last live decision" (expected, fine) from "replay reconstructed almost nothing" (the empty-dlog failure mode). The exact tolerance value is a planning-time decision, not a research one — flagged as an Open Question below.

### Anti-Patterns to Avoid
- **Calling `startShotClock()` unmodified as "the" re-arm fix:** resets `shotClockFired`, re-enabling a duplicate 20s penalty (violates D-06), and does not restore `shotClockForce` for the in-flight decision (silently breaks the 30s safety net). See Pattern 2.
- **Treating an empty/short `dlog` read as "this is turn 1":** `resumeHostGame()`'s current silent `.catch(e=>{})` (`index.html:5114`) does exactly this today — it is the confirmed mechanism behind "the entire game reset." Any read failure must be distinguished from "there really were zero prior decisions."
- **Special-casing storms in the typewriter fix:** explicitly forbidden by D-03. The fix must make `typewriterReveal()` cheaper unconditionally, not skip/simplify it while `.storming` is active.
- **Switching the reveal loop to `requestAnimationFrame`:** would resolve the promise-hang risk in a backgrounded tab (rAF is suspended when hidden) — the existing code already rejected this for a documented reason (`index.html:3115-3119`); do not reintroduce it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Measuring whether the perf fix actually worked in Safari | A custom performance-timeline parser or a new dependency | The browser's built-in `performance.now()` deltas (already used inside `typewriterReveal` itself) plus a simple rolling-average FPS counter driven by `requestAnimationFrame` for *display only* (not for pacing the reveal — see D-09) | Safari's own Web Inspector Timelines panel is the authoritative profiling tool; a lightweight `rAF`-based FPS readout is enough for Wyatt to eyeball "did the hitch go away" without adding tooling |
| Detecting an incomplete Firebase read | A generic retry/backoff library | A single explicit try/catch that distinguishes "read failed" from "read succeeded with 0 results" (the current code conflates these — see Pattern 3) | The existing codebase has zero third-party dependencies and a hard "no framework introduction" constraint; a few extra lines of explicit state beat pulling in tooling for a one-off read |

**Key insight:** Every fix in this phase is a small, targeted change to existing hand-rolled functions. The temptation to "do it properly" with a state-management library, a dedicated event bus, or a real checkpoint/snapshot system is real (see `CONCERNS.md`'s multiple fix-approach suggestions for the same code), but all of that is explicitly out of scope for an edit-pass phase — the goal is the smallest correct diff, not the ideal architecture.

## Common Pitfalls

### Pitfall 1: "Fixing" the timer re-arm by only touching `watchTimer()`'s on-branch
**What goes wrong:** A naive fix adds `else startShotClock(p)` to `watchTimer()`. This visually restarts the countdown (satisfies the surface-level ask), but `shotClockFired` gets reset (risking a duplicate 20s coin penalty) and `shotClockForce` is never repopulated for the *already created* `withShotClock` promise for this decision (the 30s auto-skip silently stops working for that one turn).
**Why it happens:** `startShotClock()` and `withShotClock()` were designed assuming they're always invoked together, once, at the start of a decision (via `armClock()`). Re-arming mid-decision breaks that assumption because `withShotClock`'s executor — the only code that sets `shotClockForce` — has already run and will not run again for this decision.
**How to avoid:** Route the re-arm through logic that either (a) reconnects `shotClockForce` to the still-pending decision, or (b) gives `expireShotClock()` an explicit fallback when `shotClockForce` is null (e.g., resolving `withShotClock`'s promise some other way, or accepting that a re-armed-but-forceless decision degrades gracefully to "wait indefinitely for a real click" instead of hanging the whole engine).
**Warning signs:** In manual testing, toggle the timer off then on mid-turn, then deliberately do NOT click anything for 35+ seconds. If nothing happens (no penalty, no auto-skip, narration never advances), the force-resolve path is broken.

### Pitfall 2: Treating "dlog is short" as always meaning "data was lost"
**What goes wrong:** A short dlog relative to the CURRENT in-progress decision is *expected* — `ask()`/`pickCell()`/`battleAsk()` all fall through from replay to live re-asking the instant `dlogIdx>=dlog.length` (`index.html:3312-3313`, `3519-3522`, `3733-3734`, `4397-4398`). This is correct, by-design behavior for the last 1 decision. The bug is when the shortfall is large (empty or near-empty dlog vs. hundreds of prior events), not any shortfall at all.
**Why it happens:** The replay-to-live handoff intentionally tolerates exactly one "in-flight, not-yet-logged" decision. Conflating "off by one" with "off by 200" produces either false-positive failure banners on every normal refresh, or a tolerance so loose it never catches the real bug.
**How to avoid:** Compare `game.events.length` against `resumeEvLen` (not `dlog.length` against some expected count) with a small, deliberately-chosen tolerance — see Pattern 3.
**Warning signs:** Reproduce a normal, healthy host refresh (no bug) and confirm the detection check does NOT fire; then reproduce with an artificially emptied `dlog` (or a network failure injected into the `.get()` call) and confirm it DOES fire.

### Pitfall 3: Assuming `#stormOverlay`'s CSS-only animation is "free" because it's compositor-driven
**What goes wrong:** `mask-image` + `filter:blur()` animations are handled by the compositor, but they are not compositor-*only* in the strict sense that `transform`/`opacity` are (per web.dev's compositor-only-properties guidance) — they still require re-rasterization of the layer's bitmap on change, which is comparatively expensive, especially in WebKit. Assuming "it's `will-change`d, so it's cheap" is the trap that likely led to the current bug being invisible in earlier testing (no storm was active during most manual QA, matching the observed asymmetry).
**Why it happens:** `will-change`/CSS animation correctly avoids *layout* recalculation for the storm layers themselves, but doesn't fully insulate them from *paint/rasterization* cost, and doesn't insulate the REST of the page from compositing-layer bookkeeping cost when unrelated layout changes happen nearby.
**How to avoid:** Profile with the storm forced on (D-09's dev affordance) using Safari's Web Inspector Timelines, specifically watching for "Composite"/"Layer" and "Paint" entries correlating with each `typewriterReveal` tick while storming vs. not storming.
**Warning signs:** Long "Composite" or "Rendering" entries in the Safari timeline that spike in lockstep with narration ticks only while `.storming` is applied.

### Pitfall 4: Losing determinism by adding new async paths to the replay-sensitive functions
**What goes wrong:** `resumeHostGame()`/`endReplay()`/any of the `ask()`/`pickCell()`/`battleAsk()` dlog-check branches are part of the `replaying` guard pattern used at 27+ call sites (`CONCERNS.md` §"Replay Mechanism Complexity"). Adding a new `await` or a new render/broadcast call inside these functions without checking `if(replaying)return;` first can double-broadcast events or double-render during fast-forward.
**Why it happens:** The `replaying` flag is a scattered, manually-checked convention, not enforced by any structural guard (no dispatcher, no single choke point).
**How to avoid:** Any new code touching `logDecision`, `pushEvents`, `netNarrate`, `liveRender`, or similar broadcast/render functions inside the replay path must respect the existing `if(replaying)return;` convention exactly as the surrounding code does.
**Warning signs:** Duplicate narration lines or duplicate Firebase event pushes visible in a replay-heavy manual test (refresh mid-game repeatedly and watch the guest's event log for repeats).

## Code Examples

### Storm detection asymmetry — grounding for BUG-01
```css
/* Source: index.html:87-92, 106-109 — storm overlay is invisible AND its rain layers are
   animation-paused whenever .storming is not applied. This is why "zero frame drops when
   no storm is active" is expected, not a coincidence: */
#stormOverlay { position: absolute; inset: 0; pointer-events: none; border-radius: 10px; overflow: hidden;
  opacity: 0; transition: opacity .8s ease; z-index: 5; background: rgba(18, 24, 45, 0.4); ... }
#boardwrap.storming #stormOverlay { opacity: 1; }
#stormOverlay .rlayer { ... animation: rainFall var(--speed) linear infinite; animation-play-state: paused; will-change: mask-position; }
#boardwrap.storming #stormOverlay .rlayer { animation-play-state: running; } /* only spins while visible */
```

### Timer toggle — the confirmed missing branch
```javascript
// Source: index.html:2911-2924 — toggleTimer() writes the shared flag; watchTimer() only
// acts on the OFF transition. The commented-out "else" is what's missing today.
function toggleTimer(){
  if(!db||!room)return;
  const next=!timerOff;
  try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}
  db.ref("rooms/"+room+"/timerOff").set(next).catch(netFail("timerOff"));
}
function watchTimer(){
  if(!db||!room)return;
  db.ref("rooms/"+room+"/timerOff").on("value",s=>{
    timerOff=!!s.val();
    if(isHost&&timerOff)stopShotClock();
    // else: nothing re-arms the clock — CONFIRMED gap (D-05)
    setClockUI();
  });
}
```

### `resumeHostGame` — the confirmed silent-failure read
```javascript
// Source: index.html:5108-5123. The .catch(e=>{}) at the dlog read silently produces an
// empty array on ANY failure, and nothing downstream distinguishes "there were zero prior
// decisions" from "the read failed."
async function resumeHostGame(r){
  numSeats=r.numSeats;
  roster=[];for(let i=0;i<numSeats;i++)roster[i]=(r.seats&&r.seats[i])||{bot:true,strat:BOT_STRATS[i%BOT_STRATS.length]};
  if(!r.cfg){clearSession();showHome();return;}
  let draw={};try{draw=(await db.ref("rooms/"+room+"/dlog").get()).val()||{};}catch(e){}
  dlog=Object.keys(draw).map(Number).sort((a,b)=>a-b).map(k=>decodeDec(draw[k]));
  dlogIdx=0;dlogN=0;
  let evval={};try{evval=(await db.ref("rooms/"+room+"/ev").get()).val()||{};}catch(e){}
  resumeEvLen=evval?Object.keys(evval).length:0;
  showGameView();
  panel('<div class="apMsg">⚓ Reconnecting to your voyage…</div>');
  replaying=true;
  beginGame(r.cfg,r.seed);
}
```

### FPS / frame-time dev instrumentation (D-09) — sketch
```javascript
// Temporary, toggleable, trivially strippable — add near boot()/other dev-only globals,
// gated behind a URL param or localStorage flag so it never ships enabled by default.
// Remove entirely before the phase ships (D-09).
let __fpsOverlayOn=false, __fpsFrames=0, __fpsLast=performance.now();
function toggleFpsOverlay(){
  __fpsOverlayOn=!__fpsOverlayOn;
  let el=document.getElementById("__fpsOverlay");
  if(!el&&__fpsOverlayOn){
    el=document.createElement("div");
    el.id="__fpsOverlay";
    el.style.cssText="position:fixed;top:4px;left:4px;z-index:99999;background:#000c;color:#0f0;font:12px monospace;padding:4px 8px;border-radius:4px;pointer-events:none";
    document.body.appendChild(el);
  }
  if(el)el.style.display=__fpsOverlayOn?"":"none";
  if(__fpsOverlayOn)requestAnimationFrame(__fpsTick);
}
function __fpsTick(now){
  if(!__fpsOverlayOn)return;
  __fpsFrames++;
  const dt=now-__fpsLast;
  if(dt>=500){
    const fps=(1000*__fpsFrames/dt).toFixed(0);
    const el=document.getElementById("__fpsOverlay");
    if(el)el.textContent=`${fps} fps / ${(dt/__fpsFrames).toFixed(1)} ms`;
    __fpsFrames=0;__fpsLast=now;
  }
  requestAnimationFrame(__fpsTick);
}
// Force-storm dev affordance: directly flips the same class/vars render()'s storm block
// touches (index.html:2550-2573), without needing an actual storm-wind roll to happen.
function __forceStorm(on){
  const bw=document.getElementById("boardwrap");if(!bw)return;
  bw.classList.toggle("storming",on);
  const ov=document.getElementById("stormOverlay");
  if(ov&&on){buildStormLayers(ov);ov.style.setProperty("--slant","135deg");}
}
```
This intentionally uses `requestAnimationFrame` for the *display-only* FPS counter (not for pacing any game logic), which is fine — nothing awaits this promise, and it carries no backgrounded-tab correctness risk since it's purely observational.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| N/A — this is a single hand-rolled codebase, not a library with an upstream release cadence | N/A | N/A | N/A |

**Deprecated/outdated:** None applicable — no third-party library versions are in play for this phase's changes.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | WebKit's overlap-based compositing model re-evaluates/re-rasterizes nearby active `filter:blur()`+`mask-image` layers in response to unrelated layout-invalidating DOM writes elsewhere on the page, and this is the specific mechanism causing BUG-01's storm-only hitching | Summary; Architecture Patterns diagram; Pitfall 3 | If wrong, the batched-write fix to `typewriterReveal()` may still help (it's a real, independently-justified DOM-mutation reduction) but might not fully close the gap to "acceptable frame rate" during a storm — the plan must budget time to profile with D-09's instrumentation and iterate if the first fix doesn't fully resolve it. General WebKit compositing-cost claims here are `[CITED]`/`[ASSUMED]` from general web-performance sources, not from a source that specifically profiles this exact interaction in Safari. |
| A2 | The `shotClockForce` global being nulled by `stopShotClock()` and never restored by a bare `startShotClock()` re-arm is a real, currently-existing secondary defect (independent of D-05's confirmed missing re-arm branch) | Architecture Patterns Pattern 2; Common Pitfalls Pitfall 1 | This is derived from direct code reading (`index.html:2872`, `2946-2976`, `3343-3356`) and is HIGH confidence as a code fact. The *consequence* — that this alone fully explains "completely non-interactive" — is not proven; the real click-response path (`base.then(...)` in `withShotClock`) appears to remain functional independent of `shotClockForce`, so this defect degrades the *safety net*, not necessarily the primary interaction path. If the planner assumes this alone explains total freeze, they may under-invest in reproducing the actual freeze mechanism. |
| A3 | The "totally non-interactive" symptom is most likely explained by a race between the local, synchronous `shotClockTick()` 30s check and the Firebase-round-trip-mediated `timerOff` toggle, causing `expireShotClock()` to fire and remove the guest's Firebase `prompt` node (`index.html:2973`) while the toggle-off write was still in flight | Summary; Architecture Patterns diagram | This is the LEADING hypothesis, partially corroborated by a 2-day-old project memory note describing "occasional shot-clock timeouts with an empty remote panel — environment artifact" under Firebase-latency conditions, but it has not been reproduced and confirmed for this exact phase. If wrong, the actual freeze cause could be something not yet identified (e.g. a stray leaked Firebase listener from an earlier force-expired decision colliding with a later one — also flagged as a real, confirmed-possible leak pattern but not proven to be THE cause). The plan should include an explicit reproduction step (with console instrumentation logging `armClock`/`startShotClock`/`stopShotClock`/`expireShotClock`/prompt writes/response writes with timestamps) before committing to a fix that assumes this specific race. |
| A4 | Safari and Chrome are both present and usable for manual verification on the machine this phase will be executed/tested on | Environment Availability | Low risk — confirmed present via direct filesystem check during this research session, but browser *version* wasn't probed (not scriptable via Bash) — the plan should note Safari's actual version if it matters for a specific WebKit bug reference. |

**If this table is empty:** N/A — see rows above.

## Open Questions

1. **Is a single "shortfall tolerance" threshold enough to distinguish a healthy refresh from an incomplete one, or does it need to account for multi-decision turns (e.g., a storm-dodge turn that involves 2-3 chained decisions)?**
   - What we know: The replay-to-live handoff is designed to tolerate exactly the currently-in-flight decision being unlogged (one decision short is normal).
   - What's unclear: Whether a single in-flight *decision* can correspond to more than one *event* not yet reconstructed (likely yes — e.g., a dodge flip generates its own narration event on top of the ask event), which would mean the tolerance needs to be a small number of events, not exactly 1.
   - Recommendation: The planner should pick a tolerance empirically during implementation (e.g., reproduce a few different "reload mid-turn" scenarios and observe the typical shortfall in the healthy case), rather than hard-coding a guess now.

2. **What Firebase path should carry the "replay failed" signal so both host and guest see a coherent state (D-08), and does writing it interfere with the deterministic engine's own event/dlog paths?**
   - What we know: Guests only ever watch `rooms/{room}/ev`, `/prompt`, `/narr`, `/flip`, `/battle`, `/clock`, `/timerOff`, `/draftPrompts/{seat}`, `/response`, `/chat` (per the watcher list at `index.html:5027`) — there is no existing "room status/error" channel guests already watch besides the room's own `status` field (checked once at `boot()`, not live-watched by guests after joining).
   - What's unclear: Whether the fix should add a new live-watched Firebase node (e.g. `rooms/{room}/hostRecoveryState`) that guests subscribe to specifically for this failure state, or whether piggybacking on an existing channel (e.g. a special `narr`/`prompt` payload) is sufficient and simpler.
   - Recommendation: A small, dedicated node is cleaner and avoids overloading `prompt`'s existing shape; the planner should confirm this against the existing watcher-registration pattern in `watchRoom()`/the guest connection setup (around `index.html:5027`).

3. **Does the actual BUG-02 "total freeze" reproduce reliably with a simple off→on toggle, or does it require the specific timing (toggling deep in the 20-30s urgent window) Wyatt hit?**
   - What we know: The confirmed code-level defects (missing re-arm branch, stale `shotClockForce`) are real regardless of timing.
   - What's unclear: Whether the *complete* freeze specifically needs the race-condition timing near auto-expiry, or whether it reproduces on any off→on toggle.
   - Recommendation: Reproduce both timings (toggle early in a turn vs. toggle in the final 10s) during implementation verification, and confirm the fix addresses both.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Safari | BUG-01 verification (Safari-specific perf bug) | ✓ (app present) | Not probed (not scriptable) | — |
| Google Chrome | Multiplayer harness (D-10), general dev | ✓ | Not probed | — |
| Python 3 | Local static file server (`python3 -m http.server`, per project memory `feedback_server_lifecycle`) | ✓ | 3.9.6 | — |
| git | Version control | ✓ | 2.39.5 | — |
| Firebase Realtime Database | Multiplayer sync, dlog/ev/prompt/response/clock/timerOff paths | Not verified live (no running local server during research) | SDK v12.15.0 (compat), per `CLAUDE.md` | Verify actual room connectivity during plan execution, not research |
| Node.js | Running `scripts/real_game_test.js`/`scripts/battle_sim.js` for engine-only regression checks | ✓ | v25.9.0 | — |

**Missing dependencies with no fallback:** None identified — nothing blocks execution.

**Missing dependencies with fallback:** None — all required tooling is present on this machine.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None (no `package.json`, no Jest/Mocha/etc.) — an informal Node `vm`-based harness (`scripts/real_game_test.js`) extracts the `Game` class + `roundCfg` verbatim out of `index.html` and runs real bot-vs-bot games in Node, no DOM |
| Config file | none — see Wave 0 |
| Quick run command | `node scripts/real_game_test.js 50` (50 simulated games; adjust N for speed) |
| Full suite command | `node scripts/real_game_test.js 2000` (default N) |
| Browser/manual verification | `python3 -m http.server` (per project memory) + Chrome MCP tabs / Playwright contexts for multiplayer, Safari for BUG-01 perf checks |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-01 | Storm runs at acceptable frame rate in Safari, no crash | manual (perf, Safari-specific — not automatable from this engine-only Node harness) | N/A — manual with D-09's FPS overlay + Safari Web Inspector Timelines | N/A |
| BUG-02 | Timer off→on re-arms with fresh 30s, no double 20s penalty | manual (multiplayer, Firebase timing) — an isolated unit-style check of `shotClockFired`/`shotClockForce` state transitions could be extracted into a small Node harness if the fix logic is kept pure enough, but the live re-arm race depends on real Firebase timing | N/A — manual via two-Chrome-tabs harness (D-10) | ❌ Wave 0 (no existing automated coverage for shot-clock state machine) |
| BUG-03 | Refresh does not reset game to start | Both: (a) engine-only automated check that a truncated/empty `dlog` triggers the new detection path instead of silently continuing, extendable from `scripts/real_game_test.js`'s vm-extraction pattern; (b) manual multiplayer refresh reproduction | `node scripts/<new-dlog-truncation-test>.js` (to be created, Wave 0) + manual refresh test | ❌ Wave 0 |
| BUG-04 | Deterministic engine keeps working after pause/unpause/refresh | Automated: `node scripts/real_game_test.js` already exercises the raw `Game` class determinism (same seed → same outcome) as a baseline sanity check unrelated to this phase's UI/network layer; the phase's specific claim (post-refresh continuation stays deterministic) needs the same dlog-replay harness as BUG-03 | Same as BUG-03's new harness | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `node scripts/real_game_test.js 50` (fast sanity that the pure `Game` engine wasn't touched/broken by any edit) + relevant manual spot-check for the specific bug being fixed
- **Per wave merge:** `node scripts/real_game_test.js 2000` (full engine regression) + full manual pass: Safari storm perf check (BUG-01), two-tab multiplayer timer-toggle + refresh reproduction (BUG-02/03/04)
- **Phase gate:** All four manual reproductions from the canonical repro script (Wyatt's WyaARRGH/WyHat session) pass, plus the full 2000-game engine regression stays green, before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] A small Node harness extending `scripts/real_game_test.js`'s vm-extraction pattern that constructs a `Game`, plays a few turns, artificially truncates/empties the resulting `dlog`, and asserts the new "incomplete replay" detection logic fires (or doesn't, for a healthy/near-complete log) — covers BUG-03/BUG-04's core engine-level claim without needing a browser or live Firebase
- [ ] No existing automated coverage for the shot-clock state machine (`shotClockFired`, `shotClockForce`, `shotClockSeat`) at all — BUG-02 relies entirely on manual reproduction; if time allows, the pure state-transition logic (independent of the browser DOM/Firebase I/O) could be extracted into testable functions, but this is a nice-to-have, not a blocker
- [ ] Framework install: none needed — the existing Node `vm` harness pattern is sufficient; no test framework install required

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth model exists in this app (confirmed in `ARCHITECTURE.md` §Authentication: "None... anyone can join any room code") — out of scope for this bug-fix phase to introduce |
| V3 Session Management | Marginal | `pp_sess`/`pp_id` in `localStorage` already exist; this phase's refresh-recovery fix touches the same session-restore code path (`boot()`, `resumeHostGame()`) but does not change how sessions are established or trusted |
| V4 Access Control | Marginal | Any connected player can flip `timerOff` (by design, per D-04's context) — this phase must not narrow or broaden who can toggle it beyond what already exists |
| V5 Input Validation | Yes | Guest-submitted decision values (`sendResponse(id,choice)`, `remotePickHighlights`'s cell clicks) are consumed by the host without range/type validation against the original `opts`/`cells` the prompt was built from. This is a pre-existing gap, not introduced by this phase — but any new code this phase adds to the decision-resolution path (e.g., the re-arm/force-resolve logic) should not widen this gap (e.g., don't trust a guest-supplied index without the same bounds-checking, or lack thereof, that already exists for every other decision type) |
| V6 Cryptography | No | Not applicable — no cryptographic operations touched by this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Firebase RTDB writes with no server-side validation (client can write arbitrary values to `rooms/{room}/response`, `/prompt`, `/timerOff`, etc.) | Tampering | Out of scope for this phase — `CONCERNS.md` already flags Firebase RTDB security rules as unverified/not visible in this repo; this bug-fix phase should not introduce *new* unvalidated writes beyond the existing pattern, but a full input-validation pass is separate future work |
| Denial of turn-progress via a malicious/broken guest never responding | Denial of Service (self-inflicted, single-room) | The existing shot-clock auto-skip (`expireShotClock()`) is exactly the mitigation already in place — this phase's fix must keep that safety net working (see Pitfall 1) rather than accidentally removing the only DoS mitigation the turn system has |

## Sources

### Primary (HIGH confidence)
- `index.html` (direct code reads, this session) — all file:line citations throughout this document (CSS storm overlay `84-109`; `buildStormLayers` `2454-2469`; `render()` storm toggle `2550-2573`; `panel()`/`typewriterReveal()`/`REVEAL_MS_PER_CHAR`/`msgHoldMs`/`flash()` `3088-3169`, `3397-3408`; shot-clock globals and functions `2774-3072`, `3332-3356`; `ask()`/`pickCell()`/`battleAsk()` dlog-replay branches `3308-3328`, `3518-3530`, `3730-3734`, `4397-4398`; `remotePrompt`/`sendResponse`/`remoteDraftPrompt`/`watchDraftPrompt`/`watchPrompt` `4663-4750`; `encodeDec`/`decodeDec`/`logDecision`/`saveSoloState`/`resumeSoloGame`/`endReplay`/`pushEvents`/`watchEvents` `4608-4728`; `resumeHostGame`/`boot()` `5108-5223`)
- `scripts/real_game_test.js` (direct code read, this session) — existing Node `vm`-based engine test harness pattern
- `.planning/codebase/CONCERNS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/phases/01-critical-bug-fixes/01-CONTEXT.md`, `.planning/REQUIREMENTS.md` — project-provided, already-verified project documentation

### Secondary (MEDIUM confidence)
- Project memory `project_mp_test_harness.md` (2 days old, tagged stale-warning by the system) — corroborates "occasional shot-clock timeouts with an empty remote panel" under Firebase-latency-heavy conditions, supporting Assumption A3's race hypothesis
- Project memory `feedback_server_lifecycle.md` (2 days old) — server-lifecycle convention for local testing, informs Environment Availability/Validation Architecture

### Tertiary (LOW confidence — general web-performance sources, not verified against this exact Safari/WebKit build or this exact interaction)
- [What forces layout/reflow — Paul Irish gist](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)
- [Layout Thrashing and Forced Reflows — webperf.tips](https://webperf.tips/tip/layout-thrashing/)
- [How To Fix Forced Reflows And Layout Thrashing — DebugBear](https://www.debugbear.com/blog/forced-reflows)
- [Stick to Compositor-Only Properties and Manage Layer Count — web.dev](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count)
- [Dev log: Debugging Safari, an ogre with layers — Ash Kyd](https://ashk.au/2024/02/07/dev-log-debugging-safari-an-ogre-with-layers/)
- [Introducing Backdrop Filters — WebKit blog](https://webkit.org/blog/3632/introducing-backdrop-filters/)
- [Improve Web Performance With requestAnimationFrame — DebugBear](https://www.debugbear.com/blog/requestanimationframe)
- [Preventing 'layout thrashing' — Wilson Page](https://wilsonpage.uk/preventing-layout-thrashing/)

## Metadata

**Confidence breakdown:**
- BUG-01 root-cause hypothesis: MEDIUM — the DOM-mutation-volume reduction is a straightforward, high-confidence improvement grounded directly in code; the specific "WebKit compositing overlap re-evaluation of storm layers" explanation for the storm-only asymmetry is a well-reasoned, code-consistent hypothesis but not confirmed via direct Safari profiling in this research session (that step belongs in implementation, using D-09's instrumentation)
- BUG-02 (timer re-arm): HIGH for the confirmed code defects (missing re-arm branch, `shotClockForce`/`shotClockFired` state traps); MEDIUM for the specific "why does it feel completely frozen" explanation (leading hypothesis, needs live reproduction to fully confirm)
- BUG-03/04 (refresh recovery): HIGH — the silent-catch/no-validation gap and the `evPushed`/`resumeEvLen` desync mechanism are both directly confirmed by code reading and directly explain the reported symptom ("reset to start")
- Architecture/patterns: HIGH — grounded entirely in direct reads of the actual functions being modified, not external framework docs
- Environment/tooling: HIGH — directly probed on this machine during research

**Research date:** 2026-07-23
**Valid until:** Effectively indefinite for the code-grounded findings (they describe the current, committed state of `index.html` and will only go stale if the file changes before this phase executes); ~30 days for the general Safari/WebKit performance claims tagged LOW confidence, in case Safari ships a compositing-model change.
