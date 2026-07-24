# Phase 1: Critical Bug Fixes - Pattern Map

**Mapped:** 2026-07-23
**Files analyzed:** 1 new file + 5 in-place edit regions in `index.html`
**Analogs found:** 6 / 6

**Context note:** This is a brownfield single-file codebase (`index.html`, 5227 lines, vanilla JS, no build step). There is no "new component" pattern-matching to do in the normal sense — almost everything is an in-place edit to an existing function. This file documents (a) the one genuinely new file's harness pattern, and (b) the local conventions each edit region must match, with real excerpts and line numbers.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `scripts/dlog_replay_test.js` (new) | test / utility | batch (headless simulation) | `scripts/real_game_test.js` | exact (stated model) |
| `index.html` — `typewriterReveal()` region (~3088-3169) | utility (DOM animation) | streaming (char-by-char reveal) | itself (in-place rewrite) | exact |
| `index.html` — shot-clock region (~2774-2993) | event-driven / state machine | event-driven + Firebase pub-sub | itself (in-place edit) | exact |
| `index.html` — replay/recovery region (~2785-2801, 4605-4661, 5108-5223) | controller (recovery flow) | request-response + batch replay | itself (in-place edit) | exact |
| `index.html` — new "couldn't fully restore" modal (D-07) | component (modal UI) | request-response (user choice) | `#leaveConfirmModal` (743-750) + wiring (5070-5072) | role-match, very close |
| `index.html` — loud-failure signal / banner | utility (error surfacing) | event-driven | `netFail()` (4574) + `#syncnote` banner (754) | exact |

---

## Pattern Assignments

### 1. `scripts/dlog_replay_test.js` (new file)

**Analog:** `scripts/real_game_test.js` (secondary reference: `scripts/battle_sim.js` header — explains why NOT to reimplement mechanics by hand)

**Extraction/bootstrap pattern** (`scripts/real_game_test.js:16-47`):
```javascript
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const scriptStart = html.indexOf("<script>") + "<script>".length;
// roundCfg() sits just past the "UI" marker (before any real UI/DOM code) — extend the cut to
// its end so both Game and roundCfg (a hoisted function declaration, so order doesn't matter to
// JS, but the slice still has to physically include its source) are in the extracted region.
const scriptEnd = html.indexOf("function escHtml");
if (scriptStart < 8 || scriptEnd === -1) {
  throw new Error("Could not locate the Game-class/roundCfg region in index.html — has the file structure changed?");
}
// `class`/`const` top-level declarations don't attach to the vm context object the way `var`/
// `function` do — export the two we need explicitly so they're retrievable after execution.
const engineSrc = html.slice(scriptStart, scriptEnd) + "\nthis.Game=Game;this.roundCfg=roundCfg;\n";

const sandbox = {
  document: { documentElement: { style: { setProperty() {} } } },
  console,
  Math, Array, Object, Set, Map, JSON, Date, String, Number, Boolean,
};
vm.createContext(sandbox);
vm.runInContext(engineSrc, sandbox, { filename: "index.html (engine region)" });

const { Game, roundCfg } = sandbox;
if (typeof Game !== "function" || typeof roundCfg !== "function") {
  throw new Error("Game/roundCfg didn't come out of the extracted region — extraction boundaries may be wrong.");
}
```

**Header-comment idiom to copy** (`scripts/real_game_test.js:1-14`): explain *why* the vm-extraction approach is used instead of reimplementing (contrast with `battle_sim.js`, which is explicitly NOT trusted for correctness because it's a hand-written reimplementation). `dlog_replay_test.js` should open with an equivalent comment: it runs the real `Game`/`roundCfg`/replay-relevant functions (or as much of the dlog/replay contract as can be extracted) unmodified — no simplifying assumptions about dlog shape.

**Game-loop + stats pattern** (`scripts/real_game_test.js:69-90`):
```javascript
for (let i = 0; i < N_GAMES; i++) {
  const strategies = [0, 1, 2, 3].map(s => BOT_STRATS[(i + s) % BOT_STRATS.length]);
  const cfg = roundCfg(strategies);
  const g = new Game(cfg, SEED_BASE + i, true); // record=true — Game.ev() is a no-op otherwise
  g.play();
  stats.games++;
  stats.battlesPerGame.push(g.battles);
  stats.roundsPerGame.push(g.round);
  for (const e of g.events) { /* ... */ }
}
```

**Assertion/report style:** no assertion library — plain `throw new Error(...)` for broken invariants (see `battle_sim.js` conventions doc), `console.log` with `String.padEnd()`/`pct()` helpers for columnar summary output. `dlog_replay_test.js` should follow the same: build a `Game`, `play()` a few turns to accumulate a real `dlog`-equivalent sequence, artificially truncate it, run the detection logic (Pattern 3 below, extracted from `endReplay()`), and `throw new Error(...)` on mismatch between expected-fire/expected-no-fire and actual.

**Important scope note:** `dlogReplay`'s actual replay/detection logic (Pattern 3: comparing `game.events.length` vs `resumeEvLen`) lives in DOM/Firebase-coupled functions (`resumeHostGame`, `endReplay`) that are NOT inside the `vm`-extractable Game-class region (that region ends at `function escHtml`, well before `4600+`). The new test harness will need EITHER (a) a second, separate string-slice extraction of just the pure decision-counting logic, refactored to be extractable, or (b) to reimplement only the *counting/threshold* comparison as a small pure function colocated near `endReplay()` that the harness can extract the same way it extracts `Game`. Flag this concretely for the planner — it is the one piece of this phase that may require a small structural change to `index.html` (e.g., extracting a `replayShortfall(gameEventsLen, resumeEvLen)` pure helper) to make it testable at all, consistent with the "Don't Hand-Roll" research guidance to keep detection logic in one explicit, testable place.

---

### 2. `index.html` — `typewriterReveal()` rewrite (BUG-01)

**Region:** `index.html:3088-3169` (`panel()`, `typewriterReveal()`, `REVEAL_MS_PER_CHAR`, `msgHoldMs()`)

**Promise contract to preserve** (`index.html:3098-3099`):
```javascript
const msgEl=$("actionPanel").querySelector(".apMsg");
if(msgEl)msgEl._revealDone=typewriterReveal(msgEl,REVEAL_MS_PER_CHAR);
```
`_revealDone` MUST remain a promise that resolves only once every character is on screen — `flash()` and the bot-turn loop await it.

**Current per-character write (the thing to batch)** (`index.html:3120-3153`):
```javascript
function typewriterReveal(msgEl,msPerChar){
  if(msgEl._revealTimer)clearTimeout(msgEl._revealTimer);
  const units=[];
  const walker=document.createTreeWalker(msgEl,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n;
  while(n=walker.nextNode()){
    if(n.nodeType===Node.TEXT_NODE){
      if(!n.nodeValue)continue;
      const full=n.nodeValue;n.nodeValue="";
      for(const ch of full)units.push({node:n,ch});
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
      while(revealed<target){
        const u=units[revealed++];
        if(u.img)u.img.style.opacity="1";
        else u.node.nodeValue+=u.ch;   // ← one DOM write PER CHARACTER, the perf hotspot
      }
      if(revealed<total)msgEl._revealTimer=setTimeout(step,pollMs);
      else resolve();
    };
    step();
  });
}
```

**Comment style to match** (block comment above the function, `index.html:3101-3119`): long prose explaining *why*, cross-referencing the design tradeoff already rejected (rAF vs setTimeout). Any rewrite must add an equally explicit comment explaining the batching change and must NOT remove the existing rAF-rejection rationale (still true, still load-bearing — RESEARCH.md explicitly forbids reintroducing rAF pacing).

**Constraint citations:** D-01/D-02/D-03 (CONTEXT.md) — keep `setTimeout` pacing, don't touch `#stormOverlay` CSS, don't special-case storms. RESEARCH.md Pattern 1 (lines ~198-245 of RESEARCH.md) already contains a full drop-in replacement following this exact contract — planner can hand it directly to an executor.

---

### 3. `index.html` — shot-clock re-arm (BUG-02)

**Region:** `index.html:2774-2993`

**Global state block to respect** (`index.html:2774-2780`):
```javascript
let shotClockSeat=null, shotClockDeadline=0, shotClockTimer=null, shotClockForce=null;
let shotClockPaused=false, shotClockPauseElapsed=0;
let timerOff=false;
let shotClockFired={}, turnExpired=false, clockState=null;
```
Naming convention: `shotClock*` prefix for every piece of this state machine. Any new state (e.g. a rearm flag) should follow this prefix.

**`startShotClock`/`stopShotClock` — the functions a naive fix must NOT call unmodified** (`index.html:2859-2875`):
```javascript
function startShotClock(p){
  if(!isHost||timerOff)return;
  shotClockSeat=p.idx;
  shotClockDeadline=Date.now()+30000;
  shotClockFired={};                 // ← resets penalty-fired flags; re-arm must NOT do this (D-06)
  turnExpired=false;
  shotClockPaused=false;
  broadcastClock();
  if(shotClockTimer)clearInterval(shotClockTimer);
  shotClockTimer=setInterval(shotClockTick,500);
}
function stopShotClock(){
  if(!isHost)return;
  shotClockSeat=null;shotClockForce=null;shotClockPaused=false;   // ← nulls shotClockForce
  if(shotClockTimer){clearInterval(shotClockTimer);shotClockTimer=null;}
  broadcastClock();
}
```

**Firebase write idiom — every write wrapped in `.catch(netFail(label))`** (`index.html:2906, 2915`):
```javascript
function broadcastClock(){
  setClockUI();
  if(db&&room)db.ref("rooms/"+room+"/clock").set(shotClockSeat==null?null:{seat:shotClockSeat,deadline:shotClockDeadline}).catch(netFail("clock"));
}
function toggleTimer(){
  if(!db||!room)return;
  const next=!timerOff;
  try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}
  db.ref("rooms/"+room+"/timerOff").set(next).catch(netFail("timerOff"));
}
```
Any new Firebase write added by the re-arm fix MUST follow this exact idiom: `.catch(netFail("<short label>"))`, and route the UI repaint through `setClockUI()` (called after every state mutation — see `broadcastClock()`, `toggleShotClockPause()` line 2896, `watchTimer()` line 2922).

**The confirmed gap to fix** (`index.html:2917-2924`):
```javascript
function watchTimer(){
  if(!db||!room)return;
  db.ref("rooms/"+room+"/timerOff").on("value",s=>{
    timerOff=!!s.val();
    if(isHost&&timerOff)stopShotClock();
    // ← no `else` branch: the on-transition is a confirmed no-op (D-05)
    setClockUI();
  });
}
```

**`withShotClock()` — the closure a re-arm must reconnect to, not bypass** (`index.html:3343-3356`):
```javascript
function withShotClock(seat,base,defaultVal){
  if(!isHost||seat!==shotClockSeat)return base;
  return new Promise(res=>{
    let done=false;
    shotClockForce=()=>{if(!done){done=true;res(defaultVal);}};
    base.then(v=>{
      if(!done){
        done=true;shotClockForce=null;
        if(shotClockSeat===seat)stopShotClock();
        res(v);
      }
    });
  });
}
```
RESEARCH.md's Pattern 2 (a `rearmShotClock(p)` function) is already grounded against these exact excerpts — hand it to the executor directly, but flag its own open question (how `shotClockForce` gets reconstructed for the already-pending promise) per RESEARCH.md Pitfall 1.

---

### 4. `index.html` — replay/recovery (BUG-03/04)

**Region:** `index.html:2785-2801` (globals + `waitWhilePaused`/`sleep`), `4605-4661` (`encodeDec`/`decodeDec`/`logDecision`/`endReplay`/`pushEvents`), `5108-5223` (`resumeHostGame`/`boot()`)

**The `replaying` guard idiom — must be respected by any new code in this path:**
```javascript
// index.html:2801
const sleep=ms=>replaying?Promise.resolve():waitWhilePaused().then(()=>new Promise(r=>setTimeout(r,ms)));
// index.html:3174, 3177
function netNarrate(html){if(replaying)return;showNarration(html); /* ... */}
function netBroadcast(html){if(replaying)return; /* ... */}
```
Any new render/broadcast call added inside the replay path (e.g. a check that fires mid-replay) must open with `if(replaying)return;` exactly like these, or it will double-broadcast during fast-forward (RESEARCH.md Pitfall 4).

**`dlog`/`dlogIdx`/`dlogN` bookkeeping and consumption pattern** (`index.html:3308-3314`, one of several call sites — `pickCell`/`battleAsk` mirror this):
```javascript
function ask(msg,opts,colors,sub){
  if(replaying){
    if(dlogIdx<dlog.length){dlogN++;return Promise.resolve(resolveOpt(opts,dlog[dlogIdx++],0).opt.value);}
    endReplay();
  }
  // ... live path unchanged below
}
```

**`logDecision()` — where a completed decision is appended, and the "no rewriting the log" comment style** (`index.html:4612-4624`):
```javascript
function logDecision(v){
  const n=dlogN++;
  if(!replaying){
    dlog.push(v);
    if(room)db.ref("rooms/"+room+"/dlog/"+n).set(encodeDec(v)).catch(netFail("decision log"));
    else saveSoloState();
  }
}
```

**`endReplay()` — the exact function the D-07 fix must extend** (`index.html:4646-4651`):
```javascript
function endReplay(){
  if(!replaying)return;
  replaying=false;
  evPushed=resumeEvLen;   // events 0..resumeEvLen-1 are already in Firebase; push only what's new
  liveRender();           // flush any freshly-rebuilt events + paint the current board
}
```
RESEARCH.md Pattern 3 shows the concrete shortfall-check insertion point (`resumeEvLen-game.events.length`), directly grounded in this excerpt — use it, but note the new failure branch needs a `showIncompleteReplayRecovery(shortfall)` call wired to the new modal (see #5 below) instead of falling through.

**`resumeHostGame()` — the confirmed silent-catch to fix** (`index.html:5108-5123`, read earlier in this session, not re-quoted here — see RESEARCH.md's "Code Examples" section which already has the full excerpt verbatim). Key line: `let draw={};try{draw=(await db.ref("rooms/"+room+"/dlog").get()).val()||{};}catch(e){}` — silently produces `{}` on any failure. The fix must distinguish "read failed" from "read succeeded with 0 results" per RESEARCH.md Pattern 3 / Pitfall 2.

**`boot()` — where `resumeHostGame()` is invoked** (`index.html:5209-5223`):
```javascript
if(sess&&sess.room){
  room=sess.room;mySeat=sess.mySeat;isHost=!!sess.isHost;
  db.ref("rooms/"+room).get().then(snap=>{
    if(!snap.exists()){clearSession();showHome();return;}
    const r=snap.val();
    isHost=(r.host===myId);
    if(isHost&&(r.status==="playing"||r.status==="ended")){
      resumeHostGame(r);return;
    }
    watchRoom();
  }).catch(()=>{clearSession();showHome();});
}
```
Comment style here (`// The host's browser drives the game. On an accidental reload, silently replay the...`) will need updating once the "silently" claim is no longer true post-fix — flag as a doc-comment update, not just a logic change.

---

### 5. `index.html` — "couldn't fully restore this voyage" modal (D-07)

**Analog:** `#leaveConfirmModal` — closest existing confirm-with-two-choices dialog. Also cross-reference `#startConfirmModal` (same markup shape, single-purpose confirm).

**Markup pattern to copy** (`index.html:733-750`):
```html
<div id="startConfirmModal" class="modalOverlay" style="display:none">
  <div class="modalCard" style="max-width:380px">
    <div class="modalTitle">⛵ Set sail?</div>
    <div class="modalByline">Is everyone at the table? Once the voyage starts, no one else can join — empty seats sail with bots.</div>
    <button class="primary big" id="btnConfirmStart" type="button">⛵ Everyone's aboard?</button>
    <button class="big" id="btnCancelStart" type="button">Wait, not yet</button>
  </div>
</div>

<!-- #8: confirm before abandoning ship, in every mode -->
<div id="leaveConfirmModal" class="modalOverlay" style="display:none">
  <div class="modalCard" style="max-width:380px">
    <div class="modalTitle">🚪 Abandon ship?</div>
    <div class="modalByline">Are ye sure ye want to leave this game? Ye can't rejoin the same voyage once ye go.</div>
    <button class="big" id="btnConfirmLeave" type="button" style="border-color:#b56464;background:#f8eaea;color:#7e3535">🚪 Aye, leave the game</button>
    <button class="primary big" id="btnCancelLeave" type="button">Stay aboard</button>
  </div>
</div>
```
For D-07's dialog, mirror this exactly: an `id="restoreFailModal" class="modalOverlay" style="display:none"` wrapping a `.modalCard`, a `.modalTitle` with a pirate-flavored emoji+phrase (matches project voice: "Abandon ship?", "Set sail?"), a `.modalByline` explaining what happened in plain language, and two `.big` buttons — the destructive/uncertain choice styled like `btnConfirmLeave` (red-tinted border/background) if "Restart" is the destructive one, `primary big` for the safer default (likely "Resume anyway" as primary, matching how `btnCancelStart`/`btnCancelLeave` are the safe "stay put" option that gets `primary`... but note `btnConfirmStart`/`btnConfirmLeave` are actually `primary`/plain respectively — verify which button should be `primary` against actual product intent for D-07, since the existing two modals are NOT consistent with each other on which button gets `primary`).

**Wiring pattern** (`index.html:5070-5072`, inside the same `wireLobby()`-adjacent block):
```javascript
$("btnLeave").onclick=()=>{$("leaveConfirmModal").style.display="flex";};
$("btnCancelLeave").onclick=()=>{$("leaveConfirmModal").style.display="none";};
$("btnConfirmLeave").onclick=()=>{$("leaveConfirmModal").style.display="none";leaveGame();};
```
Same three-line shape for the new modal: a trigger (called from `endReplay()`'s new failure branch via something like `showIncompleteReplayRecovery()`), a cancel/dismiss handler, and a confirm handler that calls into game logic (`resumeAnyway()` / `restartVoyage()` — names TBD by planner).

---

### 6. `index.html` — loud-failure signal / banner (D-07/D-08)

**Analog:** `netFail()` + `#syncnote` banner — the existing "sync trouble" visible-failure idiom (added in commit `9592c4e`).

**`netFail()`** (`index.html:4574`):
```javascript
function netFail(label){return e=>{console.error(label+" sync failed",e);const note=$("syncnote");if(note)note.style.display="";};}
```

**The banner it drives** (`index.html:754`):
```html
<div id="syncnote" class="fbnote" style="display:none"><img class="narrIcon" src="assets/icons/gear.png" alt=""> Trouble syncing with the crew — a move may not have gone through. Refresh to reconnect if this doesn't clear up on its own.</div>
```

**Every write site follows this exact call shape** — used throughout the shot-clock and replay regions already cited above (`index.html:2851, 2906, 2915, 2973, 3174, 3177, 3696, 3992, 4431, 4446, 4512, 4519, 4537, 4621, 4658, 4665, 4669, 4678, 4687`): `db.ref(...).set(...).catch(netFail("<short label>"))`.

For D-07/D-08's "both host and guest get a coherent state" requirement, the new signal needs a Firebase-writeable node guests already watch or a new one added to the watcher list at `index.html:5027` (`watchEvents();watchPrompt();watchNarr();watchFlip();watchBattle();watchDraftPrompt();watchClock();watchTurnOrder();`) — follow the same `watchX()` naming/registration convention for a new `watchRecoveryState()` if a dedicated node is chosen (per RESEARCH.md Open Question 2).

---

## Shared Patterns

### Firebase write error handling
**Source:** `index.html:4574` (`netFail`)
**Apply to:** Any new `db.ref(...).set/.remove(...)` call added anywhere in this phase (shot-clock re-arm, replay recovery, new recovery-state node).
```javascript
db.ref("rooms/"+room+"/<path>").set(<value>).catch(netFail("<short label>"));
```

### State-mutation → UI-repaint idiom
**Source:** `setClockUI()` calls throughout the shot-clock region (`index.html:2896, 2906, 2922, 2930`)
**Apply to:** Any new clock/replay state mutation — call the relevant UI-refresh function (`setClockUI()`, `liveRender()`) immediately after mutating shared state, never batch it for "later."

### `replaying` guard
**Source:** `index.html:2801, 3174, 3177, 3311-3314` and 27+ other call sites per CONCERNS.md
**Apply to:** Any new code path inside `ask()`/`pickCell()`/`battleAsk()`/`endReplay()`/`resumeHostGame()`.
```javascript
if(replaying)return;   // or: if(replaying){ ...replay-specific branch... }
```

### Deterministic RNG
**Source:** project-wide convention (CONTEXT.md, RESEARCH.md); no `Math.random()` anywhere in `Game` logic — always `this.r()` (mulberry32-seeded, on the `Game` instance).
**Apply to:** None of this phase's fixes should need new randomness, but if any is introduced (e.g. jitter in a retry), it MUST NOT touch `Game.r()`'s determinism — keep it entirely outside the `Game` class / replay-sensitive path. The FPS/force-storm dev instrumentation (D-09, RESEARCH.md sketch) correctly uses no randomness at all.

### Comment style
**Source:** `/* ===== Section ===== */` headers; `// notes/edits #N: ...` cross-references to the punch list; `// NOTE:`/`// WARNING:` for gotchas — seen throughout (e.g. `index.html:2776-2778, 2805-2809, 2941-2951, 3094-3097, 4606-4607`).
**Apply to:** Every new/edited function in this phase should get a `// notes/edits #<item>: ...` comment tying it back to the punch-list item (BUG-01/02/03/04), matching the existing self-documenting style so future readers can trace why code looks the way it does.

---

## No Analog Found

None — every file/region in scope has a close in-repo analog (this is an edit-pass phase with no genuinely novel component except the one test harness, which has an explicit stated model).

---

## Metadata

**Analog search scope:** `index.html` (full file, targeted grep + offset reads), `scripts/real_game_test.js`, `scripts/battle_sim.js`
**Files scanned:** 3 (all files touched by this phase)
**Pattern extraction date:** 2026-07-23
