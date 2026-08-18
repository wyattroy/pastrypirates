# RESEARCH 3 — What it takes to make `/4` work in real-time multiplayer

Investigated 2026-08-18 against `main` (clean, in sync with `origin/main`, 0 ahead / 0 behind).
No repo files were modified.

---

## PART 0 — The headline, in plain language

**The multiplayer code in `/4` is not broken and it is not missing. It is switched off at the front
door.**

Someone deliberately removed two lines from `4/index.html` — the two `<script>` tags that download
Firebase — and removed the two buttons on the welcome screen that say "Host a Crew" and "Join a
Crew". Everything behind those buttons is still there, still wired, and has been *actively
maintained* as the new game was built. The lobby screen, the seat list, the room code box, the chat
panel: all still in `4/index.html`. The networking code is a byte-for-byte match with the live game.

Evidence, from the file itself (`4/index.html:28-30`):

> `v2 is solo / pass-and-play only: the Firebase SDK tags are gone, so fbInit() finds no global`
> `and every net path stays dormant. src/net/ is left on disk untouched rather than deleted, so`
> `multiplayer can be revived by restoring these two tags.`

So "it doesn't work with multiplayer" is true, but the reason is not "the new game destroyed
multiplayer." Turning the tags back on gets you **most of the way there**. What it does *not* get
you is a working **bake-off** — the new memory minigame at the ovens is the one new mechanic that
genuinely cannot travel over the existing wire, and it is the finish line of the whole game. That is
the real work.

**Rough shape of the job: one large workstream (the bake-off), one medium (pacing — trades now ask
three other people questions during your turn), and about five small ones.** Detail in Part 5.

---

## PART 1 — The v1 multiplayer contract (concrete)

### 1a. The shape of the data in Firebase

Everything for one game lives under `rooms/<CODE>/`. Each node below is written by exactly one
function in `src/net/writers.js` and read by exactly one in `src/net/watchers.js`.

| Path | Written by | Read by | Payload |
|---|---|---|---|
| `rooms/<C>/seats` | any client, via **transaction** (`netClaimSeat`, `src/net/readers.js:45`) | everyone (`netWatchSeats`, `watchers.js:133`) | `{name, bot, strat}` per index |
| `rooms/<C>/status` | host (`netUpdateRoom`, `writers.js:141`) | everyone (`netWatchStatus:145`) | `"lobby"` / `"playing"` / `"ended"` |
| `rooms/<C>/turnOrder` | host once (`netSetTurnOrder:132`) | everyone (`netWatchTurnOrder:150`) | `[seat indices]` |
| `rooms/<C>/recipes` | host (`netSetRecipes:114`) | everyone (`netWatchRecipes:156`) | drafted recipe picks |
| `rooms/<C>/draftPrompts/<seat>` | host (`netSetDraftPrompt:118`) | that seat (`netWatchDraftPrompt:102`) | per-seat **parallel** draft prompt |
| `rooms/<C>/draftResponses/<seat>` | that guest (`netSetDraftResponse:126`) | host (`netWatchDraftResponse:183`) | that seat's pick |
| **`rooms/<C>/prompt`** | host (`netSetPrompt:71`) | everyone (`netWatchPrompt:114`) | **the single shared question node** — see 1b |
| **`rooms/<C>/response`** | the asked guest (`netSetResponse:79`) | host (`netWatchResponse:178`) | `{id, choice}` — the single reply channel |
| `rooms/<C>/narr` | host (`netSetNarr:89`) | everyone (`netWatchNarr:120`) | `{html, t, variants:[{seat,html}]}` |
| **`rooms/<C>/ev`** | host, one push per event (`netPushEvent:183`) | everyone (`netWatchEvents:108`) | **the event feed guests rebuild the board from** |
| `rooms/<C>/battle` | host (`netSetBattle:104`) | everyone (`netWatchBattle:86`) | battle scoreboard snapshot |
| `rooms/<C>/flip` | host (`netSetFlip:49`) | everyone (`netWatchFlip:31`) | coin animation state |
| `rooms/<C>/clock` | host (`netSetClock:53`) | everyone (`netWatchClock:74`) | shot-clock window |
| `rooms/<C>/timerOff` | any client (`netSetTimerOff:57`) | everyone (`netWatchTimerOff:60`) | bool |
| `rooms/<C>/paused` | any client (`netSetPaused:65`) | everyone (`netWatchPaused:68`) | bool — **host's branch is authoritative** |
| **`rooms/<C>/dlog/<n>`** | host, **ordered** (`netSetDlog:175`) | host on resume (`netReadDlog`, `readers.js:37`) | **the decision log — the replay tape** |
| `rooms/<C>/meta` | host (`netSetMeta:154`) | everyone (`netReadMeta`, `readers.js:19`) | end-of-voyage result |
| `rooms/<C>/recovery` | host (`netSetRecovery:189`) | everyone (`netWatchRecovery:92`) | host-repair strip |
| `rooms/<C>/chat` | any client (`netPushChat:98`) | everyone (`netWatchChat:80`) | chat messages |

Outside the room: `presence/<id>` (`netMarkPresence:167`), `gamelogs/<ts>`, `feedback/<ts>`.

**One rule holds the whole thing up:** `src/net/registry.js` is the only file in the repo allowed to
call `ref.on()` or `ref.off()` (`registry.js:3-5`, enforced so a teardown can never be bypassed).
Watchers are scoped `"room"` or `"session"`; leaving a room detaches only the room-scoped ones
(`registry.js:73`).

### 1b. How a turn is handed off — the single most important mechanism

**The host runs the entire game. There is no distributed turn-taking.** `runLiveNet()`
(`src/orchestrator.js:821`) is one `while` loop on the host's browser that plays the whole voyage
start to finish. Guests never run the engine to produce state.

When that loop needs a decision, it calls `ask()` (`src/ui/util.js:1153`), which forks exactly once:

```
const base = decisionIsLocal(seat) ? onLocalAsk(...)          // render buttons on THIS browser
                                   : onRemotePrompt(seat,{...}) // write the prompt node
```
(`src/ui/util.js:1203`; `decisionIsLocal` at `:1284`)

The remote payload is **only labels and flags** — this is the constraint that matters most for `/4`:

```js
{kind:"ask", msg, labels:[], colors:[], classes:[], disabled:[], why:[],
 sub, flip, flipIdx, back, battle}
```

Round trip:
1. Host writes `rooms/<C>/prompt` with a unique `id` and the target `seat` (`remotePrompt`,
   `src/orchestrator.js:992`) and attaches a **self-cancelling one-shot** watcher on `response`.
2. Every guest's `watchPrompt` (`src/orchestrator.js:1069`) fires; all but the target seat clear
   their panel (`if(!p||p.seat!==appState.mySeat){panel("");…return;}`).
3. The target guest renders the buttons and taps one → `sendResponse(id, index)`
   (`src/orchestrator.js:1004`) writes `rooms/<C>/response`.
4. Host's one-shot sees a matching `id`, detaches itself, resolves the promise.
5. **The resolved index is appended to the decision log** — `logDecision`
   (`src/orchestrator.js:953`) → `netSetDlog`. Ordering here is load-bearing (`writers.js:38`).

Board-square picking uses the same channel with `kind:"pick"` (host computes the legal cells and
sends them; guest renders highlights).

### 1c. Determinism and replay

- One seeded `mulberry32` stream lives in the host's `Game` instance (`src/engine/index.js`).
- Guests hold a *mirror*, rebuilt by replaying the `ev` feed (`watchEvents`,
  `src/orchestrator.js:1043`), not by simulating.
- **Host reload is the recovery story.** `resumeHostGame` (`src/orchestrator.js:1507`) reads the
  room record and `dlog`, sets `appState.replaying = true`, and fast-forwards a fresh engine through
  the recorded decisions with rendering, delays and broadcasts suppressed; `endReplay` then checks
  the replay actually reached the live edge, or shows the restore-failed dialog rather than silently
  handing back a board reset to turn 1.
- Every `ask()` / `battleAsk()` / `pickCell()` early-returns the recorded index while replaying —
  that is why the log must contain **one entry per decision regardless of whether the seat was local
  or remote**. A log whose *length* depends on routing only replays under the same routing
  (spelled out at `4/src/ui/flow.js:1432-1436`).

### 1d. Timer and pause

- `broadcastClock` (`src/orchestrator.js:149`) writes the window; `watchClock:285` renders it.
- `togglePause:189` writes the shared `paused` flag; **only the host's `watchPause:208` branch acts
  on it authoritatively**.
- `expireShotClock` (`src/orchestrator.js:234`) forces a default choice on timeout — and that forced
  choice goes through `logDecision` like any other. **That is the only reason a wall-clock event
  doesn't destroy determinism.**

---

## PART 2 — The current state of `/4`'s net layer

**Verdict: LIVE AND MAINTAINED, deliberately disabled. Not a stale copy, not absent.**

### 2a. The transport files are identical

```
diff -u src/net/readers.js  4/src/net/readers.js   → 0 lines
diff -u src/net/registry.js 4/src/net/registry.js  → 0 lines
diff -u src/net/watchers.js 4/src/net/watchers.js  → 0 lines
diff -u src/net/writers.js  4/src/net/writers.js   → 0 lines
diff -u src/net/index.js    4/src/net/index.js     → 5 added lines
```

The only change is a defensive guard so a Firebase-less page boots with a clean console
(`4/src/net/index.js:96-99`):

```js
if (typeof firebase === "undefined") return null;
```

Verified live — the module imports cleanly under Node and its **config is intact**:

```
net/index.js imports OK; exports: 59
netInit present: function
cfgReady(): true
```

### 2b. The orchestration layer was extended, not abandoned

Every one of the ~45 networking functions in `src/orchestrator.js` is present in
`4/src/orchestrator.js` — `broadcastFlip`, `watchFlip`, `broadcastClock`, `toggleTimer`,
`togglePause`, `watchPause`, `expireShotClock`, `watchClock`, `netNarrate`, `sendChat`, `watchChat`,
`renderBattle`, `watchBattle`, `battleAsk`, `writeMeta`, `writeGameLog`, `watchPresence`, `fbInit`,
`applyEndMeta`, `recipeDraftNet`, `runLiveNet`, `liveResolveEndNet`, `logDecision`,
`setRecoveryState`, `watchRecoveryState`, `pushEvents`, `remotePrompt`, `sendResponse`,
`remoteDraftPrompt`, `watchDraftPrompt`, `watchEvents`, `watchPrompt`, `watchNarr`, `createRoom`,
`abandonRoom`, `renameMySeat`, `joinRoom`, `watchRoom`, `startGame`, `beginGame`, `watchTurnOrder`,
`watchRecipes`, `leaveGame`, `wireLobby`, `resumeHostGame`, `boot`.

More than survived — **it was upgraded for v2 while the tags were off**:
- `battleAsk` (`4/src/orchestrator.js:406`) was rewritten for the one-round battle and still carries
  its `decisionIsLocal` / `remotePrompt` fork at `:435`.
- `runLiveNet` (`:974`) now branches to `runLiveDayBakeoff` (`:881`) and still calls
  `netSetTurnOrder`, `netIntroBarrier`, `recipeDraftNet`.
- `watchPrompt` (`:1219`) gained the guest-side copy of playtest 21's greyed-button-with-a-reason
  rendering (`:1262-1273`).

### 2c. The handler seam is fully wired

`4/src/main.js:71-93` still injects the real networking functions:

```js
ui.setNetHandlers({
  onBroadcast: orchestrator.netNarrate,
  onRemotePrompt: orchestrator.remotePrompt,
  onLogDecision: orchestrator.logDecision,
  onBroadcastFlip: orchestrator.broadcastFlip,
  onBroadcastClock: orchestrator.broadcastClock,
  onLocalAsk: ui.localAsk, … });
```

### 2d. The lobby is intact; only its two doors were removed

Element-by-element check of `4/index.html`:

| Element | root | `4/` |
|---|---|---|
| `btnCreate`, `btnJoin`, `btnStart`, `btnCancelStart`, `btnConfirmStart`, `btnRoomBack`, `btnLeave` | ✅ | ✅ |
| `lobby`, `stepHost`, `stepJoin`, `lobbyRoom`, `roomCode`, `joinCode`, `joinName`, `seatList` | ✅ | ✅ |
| `chatPanel`, `syncnote` | ✅ | ✅ |
| **`choiceHost`** (welcome card) | ✅ | ❌ **removed** |
| **`choiceJoin`** (welcome card) | ✅ | ❌ **removed** |

`4/src/ui/lobby.js` differs from v1 by 44 lines, all of it the new pass-and-play hand-off ceremony
(`4/src/ui/lobby.js:277-300`). The wiring for the two missing cards is **guarded, not deleted**
(`4/src/ui/flow.js:2367-2370`):

> `v2: the Host/Join cards are gone from the markup … The wiring is guarded rather than deleted`
> `outright so that restoring the two cards (and the Firebase script tags) is all it takes to bring`
> `multiplayer back.`

### 2e. What was actually lost

**The multiplayer test harness.** `4/scripts/` holds 5 files. The root holds these, none of which
were carried over and none of which `4/` has an equivalent of:

`host_guest_parity_check.js`, `net_contract_check.js`, `net_registry_test.js`, `dlog_replay_test.js`,
`determinism_baseline.js`, `state_contract_check.js`, `ui_contract_check.js`,
`bakeoff_parity_test.js`, `engine_contract_check.js`.

There is also **no `4/package.json`** — the root `test` script points only at root `scripts/`. So
`/4` currently ships with no automated guard on the exact invariants multiplayer depends on. Note
that `4/src/orchestrator.js:880` and `4/src/ui/util.js:1484` both cite
`scripts/host_guest_parity_check.js` and `scripts/ui_contract_check.js` as gating their behaviour —
**those citations are now dangling**; the checks they name do not exist in `/4`.

---

## PART 3 — Per-mechanic multiplayer hazard table

Legend — **(a)** hidden information · **(b)** simultaneous / real-time input ·
**(c)** free-form negotiation between humans · **(d)** non-deterministic randomness.

| # | New mechanic | a | b | c | d | Verdict | Evidence |
|---|---|---|---|---|---|---|---|
| 1 | **BAKE-OFF (the ovens minigame)** | **YES** | partial | no | seeded | 🔴 **HARD BREAK — the one real blocker** | `4/src/ui/flow.js:584`; `4/src/ui/bakeoff.js:197`; engine `4/src/engine/index.js:3021-3110` |
| 2 | **Open trade + counter-offers** | yes (recipes) | no | **YES, bounded** | none | 🟠 **Works, but paces badly** | `4/src/ui/flow.js:1555-1712`; engine `:963-1111` |
| 3 | **Quantity slider on coin prompts** | no | no | no | none | 🟠 **Known, documented hole** | `4/src/ui/util.js:1437-1442` |
| 4 | **Black market (buy at 10🌕 / barter 2 crates)** | no | no | no | none | 🟢 Safe | `4/src/ui/flow.js:1220-1265`; engine `:807-896` |
| 5 | **Storm rewrite (one table-wide push)** | direction only | no | no | seeded | 🟢 **Safer than v1** | engine `:429-507`, `:3161-3171` |
| 6 | **Committed forecast, hidden storm direction** | **YES** | no | no | seeded | 🟢 Safe — host holds it, guests render what they're told | engine `:3128-3157`; `forecastWind:3146` |
| 7 | **Trade winds / whirlpool rim as a planned move** | no | no | no | none | 🟡 Guest sweep exists but is now unguarded | `4/src/orchestrator.js:1210`; engine `:527-599`, `:2231-2320` |
| 8 | **One-round battle + paid re-fire + free flee** | no | no | no | seeded | 🟢 Safe — `battleAsk` keeps its remote fork | `4/src/orchestrator.js:435`; engine `:1676-1747` |
| 9 | **Sanctuary / `unfinish` (raiding a finisher)** | no | no | no | none | 🟢 Safe — pure host-side engine | engine `:1643-1663`, `:3015` |
| 10 | **v3 race planner (bot brain)** | no | no | no | **none** | 🟢 Safe — RNG-free by design | engine `:2546-2736` |
| 11 | **Sea creatures on a pass** | no | no | no | none | 🟡 Reads device localStorage | `4/src/orchestrator.js:1531-1532`; engine `:956-960` |
| 12 | **The `/4` stage (camera, bubbles, ribbon)** | no | no | no | none | 🟡 Untested on the guest tier | `4/src/ui/stage.js` (1545 lines) |
| 13 | **Fast-forward skip (⏩)** | no | **YES** | no | none | 🟡 Needs a multiplayer gate | `4/src/state/index.js:99-100`; `ffEndNow()` |
| 14 | **Auto-pause + auto-resume on tab hide** | no | **YES** | no | none | 🟠 **Would pause the whole table** | `4/src/main.js:148-163` |

### The four that need explaining

**#1 — The bake-off is the blocker, and it is unambiguous.** The author wrote the reason down at
`4/src/ui/flow.js:584-588`:

> `NO decisionIsLocal BRANCH, deliberately. v2 ships solo and pass-and-play only … A remote branch`
> `here would be a path no test can reach and no player can trigger, whose only behaviour is to hand`
> `somebody's bake to the bot without saying so.`

Three separate things break here, not one:

- **Shape.** The `prompt` node carries *labels and flags* (Part 1b). The bake-off is a bench of five
  bowls that shuffle with animated arcs, are tapped to name, and reveal one at a time
  (`4/src/ui/bakeoff.js`, 700+ lines of hand-built DOM). None of that fits down the wire as it
  stands.
- **Hidden information.** `bake.slots` — which ingredient is under which bowl — must reach the
  baking captain **and nobody else**. The engine already keeps it out of the broadcast event, which
  carries counts only (`4/src/engine/index.js:3062-3063`). A remote bake needs a *private* channel,
  and today's `prompt` node is world-readable to the room.
- **Mid-prompt spending.** The "pay to re-watch the shuffle" button calls the engine live, once per
  click, so the purse drops as you spend (`4/src/ui/flow.js:592-594`). The response channel is
  **one reply per prompt**. There is no way for a guest to say "I bought a look" and keep the same
  prompt open.

As written today, a remote player's bake would run **on the host's screen** and the host would play
it for them.

The upside: the engine half is already correct and already replay-safe. `bakeSetup` runs the shuffle
and the bot's fallback guess for **every** seat, human or bot, in fixed order, so the random stream
cannot fork on seat type (`4/src/engine/index.js:3036-3052`). And the guess plus the coins spent are
logged as **one** decision (`4/src/ui/flow.js:601-609`). The contract is respected; only the UI
transport is missing.

**#2 — Counter-offers work, but a trade now interrogates the whole table.** This is better news than
expected. The whole loop goes through `ask()` (`4/src/ui/flow.js:1591`), so it routes remote
correctly with no changes. The problem is *pacing*: one player's trade asks up to three other seats
in sequence, each on its own 30-second shot clock, then asks the original player again to pick.
Worst case is roughly **five sequential round trips inside one player's single turn**, and the rest
of the table watches a "…is deciding" line for over two minutes.

Also: `counterOffer` uses a slider for local seats and silently falls back to the old +1/−1 stepper
for remote ones (`4/src/ui/util.js:1451`). Functional, but a guest gets a visibly worse control than
the host. This is *deliberate and documented*, not an accident.

**#3 — The slider hole is already flagged in the code.** `4/src/ui/util.js:1437-1442`:

> `extra … reaches localAsk only — a remote seat's prompt crosses the wire as labels and flags, and`
> `threading a live control through that contract is a large change for a mode /4 does not ship. …`
> `and this must be closed if /4 ever ships online multiplayer.`

**#14 — Tab-hide auto-resume would fight the table.** `/4` added auto-resume so a phone app-switch
doesn't silently freeze a solo game (`4/src/main.js:148-163`). But `togglePause` writes the *shared*
`paused` node. Today it is safely gated behind `ui.soloBotGame()`. If multiplayer is switched on and
that gate is loosened, every player backgrounding their tab would pause and resume the entire table.
Leave the gate exactly where it is.

---

## PART 4 — Determinism audit of `4/src/engine/`

**The engine tier is clean.** Full sweep results:

- **`Math.random` in `4/src/engine/` and `4/src/shared/`: ZERO hits.**
- **`Date.now()` / `performance.now()` / `new Date` in `4/src/engine/`: ZERO hits.** The invariant is
  stated at `4/src/engine/index.js:3-4` and it holds.
- Single seeded stream: `this.rng = mulberry32(seed)` (`4/src/engine/index.js:126`), sole accessor
  `r()` at `:313`. Every draw goes through it — `:153, :157, :172, :176, :178, :180, :259, :315
  (shuffle), :317 (flip), :3029, :3047, :3129`.
- `4/src/engine/bakeoff.js` has **no RNG of its own** — an `rng` is always a parameter
  (`bakeoff.js:58, :90, :189`), and both call sites bind `()=>this.r()` (`index.js:3028, :3045`).

`Math.random` appears only outside the engine, and every hit is legitimate:

| file:line | use | verdict |
|---|---|---|
| `4/src/ui/flow.js:2395`, `:2411`; `4/src/orchestrator.js:1513` | the voyage **seed** | correct — this *is* the entropy, and it is persisted so a resume replays the same game |
| `4/src/ui/util.js:1905`, `:1946` | device id, room code | non-game |
| `4/src/ui/board.js:1860-1862` | victory confetti | cosmetic (says so at `:1855`) |
| `4/src/ui/board.js:1969` | throwaway welcome-screen game object | never played |

`4/src/ui/board.js:523, :673` create **private** `mulberry32` instances for rain and wind dots,
seeded separately, with a comment at `:499-543` explaining they must never touch the shared stream.

### Residual risks — and why two of them do not matter for host-authoritative play

1. **`Math.exp` at `4/src/engine/index.js:2537`** (new in v2, inside `raceScore3`), compared with a
   `1e-12` epsilon at `:2591, :2701, :2725`; and **`Math.atan2` at `:149`**. ECMAScript does not
   require these to be correctly rounded, so engines may differ in the last bit.
   **Impact for the current model: none.** Only the host runs the engine, and host-reload replay
   happens in the same browser. This would only bite if the design ever moved to true lockstep with
   guests simulating. **Worth recording, not worth fixing now.**

2. **Six or so sorts with no explicit tiebreak**, relying on ES2019 stable-sort over deterministic
   input: `:151` (whirlpool arc layout), **`:506` `stormOrder` — ties are common when ships are
   abreast, and it decides who clears a square first**, `:2578`, `:299`, `:875`, `:1376/1435/1472/1489`.
   Same reasoning: safe under host authority, fragile if the model changes. `bakeRank:3240` *does*
   carry a full tiebreak and is the pattern to copy.

3. **The shot clock is the one real-time input that reaches game state** — and it is already
   handled: expiry forces a default which is written to the decision log
   (`4/src/orchestrator.js:1104-1110`). This mechanism must be preserved on any new prompt type,
   including a networked bake-off.

4. **`seaSeat` / `seaBase` are read from device localStorage onto the engine instance**
   (`4/src/orchestrator.js:1531-1532`). Harmless — it draws no RNG and rides along in the save — but
   in multiplayer every guest would see the *host's* sea-creature sequence. Cosmetic.

**The decision log / replay mechanism is fully present in `/4`** and was extended for the bake-off:
`4/src/orchestrator.js:407-409, :777-778, :1104-1110, :1534-1535, :1686-1707`.

---

## PART 5 — Proposed workstreams

Sizes are relative: **S** ≈ under a day, **M** ≈ a few days, **L** ≈ a week or more plus design
decisions that need Wyatt.

### W1 — Turn the lights back on · **S**
Restore the two Firebase `<script>` tags to `4/index.html` (see `4/index.html:28-30`) and the two
`#choiceHost` / `#choiceJoin` welcome cards (`index.html:1061-1064` is the template). Re-enable the
`4/src/main.js:39-45` tripwire. Restore the `#stepHost` path. **Everything else is already wired.**
This alone should give a joinable lobby, seat claiming, chat, turn order, the recipe draft, sailing,
battles, trades and the black market over the wire.

### W2 — Play the whole game over the wire and write down what breaks · **M**
Two browsers, host + one guest, one full voyage with the bake-off **disabled** (`?bakeoff=0`,
`4/src/shared/index.js:383`). This is the measurement that tells you whether W3–W6 are the real list
or just the predicted one. Specific things to watch: guest-side rendering of the new stage/bubbles
(`4/src/ui/stage.js`, never tested on the guest tier), the rim sweep animation on the guest
(`4/src/orchestrator.js:1210`), and the greyed-button reasons (`:1262-1273`).

### W3 — **The networked bake-off** · **L** ← the actual project
Three sub-pieces, in order:

- **W3a (M)** — Extend the prompt contract with a new `kind` (e.g. `kind:"bake"`) carrying the bench
  layout, the swap list, the locked steps and the recipe order, and add a matching branch to
  `watchPrompt` (`4/src/orchestrator.js:1219`) that drives `playBakeoffLive`
  (`4/src/ui/bakeoff.js:197`) on the guest instead of the host. Then remove the deliberate omission
  at `4/src/ui/flow.js:584`.
- **W3b (S–M)** — **Privacy.** `bake.slots` must reach only the baking seat. Today's `prompt` node is
  readable by the whole room. Either move it to `rooms/<C>/bakePrompts/<seat>` (the pattern
  `draftPrompts/<seat>` already uses, `writers.js:118`) plus a Firebase security rule, or accept that
  a determined player could read another's bench from the console. **This is a decision for Wyatt,
  not a technical one** — it is exactly the "is cheating a real risk among friends?" question.
- **W3c (S)** — **Mid-prompt spending.** The re-watch purchase needs a second channel so a guest can
  buy a look without closing the prompt (a `bakeActions/<seat>` push the host drains, or fold the
  re-watch count into the single reply and settle it at the end, as replay already does at
  `4/src/orchestrator.js:908-912`). The second is far simpler and matches the existing replay path.

### W4 — Trade pacing · **M** (mostly a design call)
A trade currently asks up to three other seats sequentially inside one turn. Options, cheapest
first: (i) leave it and shorten the shot clock for *responder* prompts only; (ii) ask holders in
parallel using per-seat prompt nodes (`draftPrompts/<seat>` is the working precedent) and collect
in fixed seat order so the decision log stays stable; (iii) cap how many captains a single hail
reaches. **(ii) is the right answer if the pacing turns out to be as bad as it looks, but it is more
work and it must not change the order decisions are logged in.**

### W5 — Close the slider hole · **S**
Either thread the slider spec across the wire (`4/src/ui/util.js:1437-1442` names this exactly), or
formally accept the existing stepper fallback (`:1451`) and delete the "must be closed" note. The
fallback already works and already logs identically (`logQuantity`, `4/src/ui/flow.js:1441`), so
**accepting it is a legitimate answer** — but it means a guest gets a worse control than the host.
Wyatt's call.

### W6 — Multiplayer safety gates on the new UI · **S**
- Keep the tab-hide auto-resume solo-only (`4/src/main.js:148`, currently gated behind
  `ui.soloBotGame()` — verify it stays that way).
- Gate the ⏩ fast-forward off in multiplayer (`4/src/state/index.js:99-100`) or make it local-only
  so one player cannot skip the shared narration.
- Confirm the shot clock is armed on every new prompt type, including the bake.

### W7 — Restore the test harness · **M**
Port the checks that guard exactly these invariants and that `/4` currently cites but does not have:
`host_guest_parity_check.js`, `net_contract_check.js`, `net_registry_test.js`, `dlog_replay_test.js`,
`determinism_baseline.js`, `bakeoff_parity_test.js`. Add a `4/package.json` with a `test` script.
**Note two dangling citations to fix while doing this:** `4/src/orchestrator.js:880` and
`4/src/ui/util.js:1484` both claim a check gates their behaviour, and neither check exists in `/4`.

### W8 — Determinism hardening (optional, defer) · **S**
Add explicit tiebreaks to the sorts in Part 4 item 2, starting with `stormOrder`
(`4/src/engine/index.js:506`), where ties are common. **Not needed for host-authoritative
multiplayer.** Only do this if the model ever changes, or as cheap insurance while someone is
already in that file.

### Suggested order
**W1 → W2 → (W6, W5 in parallel) → W3 → W4 → W7**, with W8 deferred.
W1+W2 together are the cheapest way to find out how much of the rest is actually needed — and given
how well-maintained the net layer turned out to be, the list after W3 may be shorter than it looks.

---

## Appendix — commands used to verify

```bash
git fetch origin && git rev-list --count origin/main..main   # 0
diff -u src/net/{readers,registry,watchers,writers}.js 4/src/net/…   # all 0 lines
grep -n "firebase" 4/index.html                              # one comment, no <script> tags
node -e "import('./src/net/index.js')…"                       # 59 exports, cfgReady() true
```
