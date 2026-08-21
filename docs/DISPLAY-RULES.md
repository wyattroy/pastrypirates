# Display rules — how this game decides what to draw

**PAR-16, Wyatt 2026-08-20: *"Yes — write them down as we convert."*** Not written up front and not
left to the end — **written in the same commit as the conversion that made it true**, so nothing in
here ever describes something that is not true yet. Started deliberately FIRST in Phase 02.15,
carrying what `02.15-01` already made true, rather than waiting for the whole prompt channel to
converge (research's Open Question 3).

**Write nothing aspirational.** If a channel is half-done, this document says half, and says which
half. A document that describes the architecture we intend, rather than the one that exists, rots
into a lie with nobody editing it — the project's own no-future-tense rule.

Sibling to `docs/BOARD-RENDERING.md` (the layer stack and camera), `docs/HARD-WON-LESSONS.md` (what
to distrust), and `docs/DRIVING-THE-GAME.md` (driving it under automation).

---

## 1. THE PRINCIPLE — stated once, at the top

**Host/guest decides WHO COMPUTES the game and WHO CREATES THE ROOM. It never decides WHAT IS
DRAWN.** (CLAUDE.md rule 23.)

The host runs the engine and is the authority Firebase trusts; the host also creates or joins the
room. That is the entire legitimate residue of "host vs guest" in this codebase. Everything a player
*sees* — the board, a prompt, the ribbon, narration, the captains list — is decided by ONE set of
rules that every tier reads, regardless of who is hosting.

**The design-time question for anything new drawn on screen:**

> *What makes the host's screen and a guest's screen agree?*

If the honest answer is *"nothing — we keep them in step"*, that is the defect, before a line of
code is written. Two things kept in sync by discipline are two things that will drift; the only
durable answer is that there is only one of them, reached by name from both tiers.

---

## 2. THE CONVERGED CHANNELS — one row each, only for what is TRUE TODAY

### Narration — `flash()`

**Entry point:** `flash()`, `4/src/ui/flow.js`. Both tiers reach it: the host's game loop calls it
directly as narration happens; a guest reaches it through `watchNarr`, one of the nine Firebase
listeners in `4/src/orchestrator.js`. Promoted to shared in **02.15-01 Stage 1**, in the same commit
that made it true.

**The mirror-when-remote guard**, `netNarrate` / `netBroadcast` (`4/src/orchestrator.js:308-311`):

```js
export function netNarrate(html,variants,opts){
  if(appState.replaying)return;
  showNarration(pickNarrVariant({html,variants},appState.mySeat),opts);
  if(appState.isHost&&appState.db&&appState.room)
    netSetNarr(appState.db,appState.room,html,netFail("narration"),variants,opts&&opts.wait);
}
```

**Local render always. A Firebase write happens ONLY under `isHost && db && room`.** This is the
guard every future mirror-write must copy verbatim — it is what keeps a solo game (`db===null`)
alive, because the write branch is unreachable there.

**How long it stays — the wait-line rule (item 19, D-10).** A narration line carrying `opts.wait`
registers **no deadline**. It is not faded out on a timer; it is **replaced** by whichever event
ends the wait, on both tiers, because `opts.wait` crosses the wire and both sides evaluate the same
hold curve against the same field. Verified both-sides in 02.15-01: the wait line was still on
screen after nine seconds — past where the ordinary 2550–6750ms hold curve would have retired it —
on both host and guest, then replaced together.

### The active seat — `applyActiveSeat()`

**Entry point:** `applyActiveSeat(seat)`, `4/src/ui/util.js`. The ONE function that sets both
`appState.curSeat` (drives the ribbon) and `S.activeSeat` (drives the camera), so the two can never
be aimed differently:

```js
export function applyActiveSeat(seat){
  if(seat==null)return;
  const ps=appState.game&&appState.game.players;
  if(!ps||!(seat>=0&&seat<ps.length))return;
  setActor(seat);
  if(window.__pp4)window.__pp4.actor(seat);
}
```

Called by the host's turn loop (`humanTurn`/`botTurn`) and by `watchEvents`, reading the `p` field
every meaningful event already carries (`turn`/`sail`/`dock`/`pass`/`attack`). **No engine change**
— `ev()` records no actor field, this reads an existing one. Two guards, both deliberate: an event
carrying no seat (`newround`, `end`) leaves the indicator alone rather than blanking it, and the seat
is bounded to the known range before use as an index (T-02.2-08) — the `ev` node is
host-authoritative, the same trust already relied on for board positions, but a bounded index costs
nothing and a trusted one eventually does.

**`setActor(seat)`** is a one-line assignment to `appState.curSeat`, not a renderer — it is
`SUPERSEDED` in the parity gate, reached through `applyActiveSeat` on both tiers. Promoted to shared
in **02.15-01 Stage 2**.

### The captains list order — `seatOrderFrom(head)` via `seatDisplayOrder()`

**Entry point:** `seatDisplayOrder()` → `seatOrderFrom(appState.mySeat)`, `4/src/ui/util.js`.

```js
export function seatOrderFrom(head){
  const n=appState.game.players.length;
  if(!appState.turnOrder||appState.turnOrder.length!==n){
    const raw=appState.game.players.map((_,i)=>i);
    const r=raw.indexOf(head);
    return r<0?raw:raw.slice(r).concat(raw.slice(0,r));
  }
  const at=appState.turnOrder.indexOf(head);
  ...
}
```

**One rule that takes the VIEWER as an input is not two rules.** Whoever is looking sees their own
captain on top — `seatDisplayOrder()` always passes `appState.mySeat` as `head`, on every tier,
through the same rotation function. **This is explicitly NOT a sanctioned host/guest exception.**
Wyatt, 2026-08-20, correcting an earlier framing that filed it as one: *"a rule that takes the viewer
as an input is not two rules."* Recording that correction here is the whole point of this row — the
framing it corrects is what this document exists to prevent from recurring.

Fixed in **02.15-01 Stage 3**: the pre-fix bug was in the fallback branch (used before `turnOrder` is
known, briefly at the very start of a game), which returned raw seat index and dropped `head` on the
floor — so nobody saw their own captain on top for the opening of every game, in every mode. That was
never a host/guest divergence (the host fell back identically, because `runLiveNet` does not shuffle
turn order until after `showAhoyIntro` returns, so the value truly does not exist yet on either
tier) — it was one rule, broken for everyone, fixed once.

### The prompt CARD markup — `optionButtonsHTML` and `sailPanelHTML` + `sailHighlightRect`

Already one builder each, gated by the parity gate's assertions 1 and 2 — this is markup parity, not
orchestration parity (see §4 below for the distinction that matters for the prompt channel).

- **`optionButtonsHTML(items)`**, `4/src/ui/util.js` — the button row for every `ask()`-shaped
  prompt. Unified in 02.1-03; both the host's `localAsk` and `watchPrompt`'s ask branch build their
  row through it.
- **`sailPanelHTML(msg,hint)`** and **`sailHighlightRect(c,cellPx,svg)`**, `4/src/ui/flow.js` — the
  sail-window card and the highlighted-square rect. Both tiers already build their squares and card
  through these two functions, since the narrow half of this phase (`b76983d`).

---

## 3. THE THREE STANDING RULES — any new drawn thing must obey all three

### Rule A — MIRROR WHEN REMOTE. The host's own screen never round-trips through Firebase.

`runLiveNet()` drives **solo and pass-and-play as well as a networked host**
(`4/src/orchestrator.js:1839` forks on `if(appState.isHost)`, which is true in solo, where
`appState.db` is null). Every raw Firebase writer in `4/src/net/writers.js` — `netSetPrompt`
included — is a bare `db.ref(...)` with **no null guard**, and throws on the first write attempted
against a null `db`.

**The guard, copied verbatim from `netNarrate`:**

```js
if(appState.isHost && appState.db && appState.room) /* write to Firebase */
```

**Local render always. A Firebase write happens only under this guard.** A two-tab test cannot see a
missing guard by construction — it always has a room. Only a full **solo voyage** (`db===null`,
`room===null`) can catch this class of fault.

### Rule B — `decisionIsLocal(seat)`, NEVER `isHost` and NEVER `seatLocal`.

```js
export function decisionIsLocal(s){
  return (appState.passAndPlay && appState.game.players[s].strategy==="human") || seatLocal(s);
}
```

`decisionIsLocal` is true for **any** human seat at a pass-and-play table — several seats can be
local on one device. `seatLocal(s)` (`s===appState.mySeat`) is true only for THIS browser's own
seat, and using it to fork a dispatch breaks the pass-the-device gate the moment a table has more
than one local human. `pickCell` and `ask` are both already correct. **Two channels are NOT yet on
this rule — `recipeDraftNet` and `netIntroBarrier` fork on `seatLocal`, and it "works" only because
`netIntroBarrier` has its own separate `appState.passAndPlay` branch a few lines earlier
(`4/src/ui/flow.js:2249-2261`) that intercepts a shared-device table before the fork is ever
reached.** See §4 — do not extend a converged dispatch to those two without disarming that landmine
first.

### Rule C — `withShotClock()` needs a plain Promise, nothing else.

```js
export function withShotClock(seat,base,defaultVal){
  if(!appState.isHost||seat!==appState.shotClockSeat)return base;
  return new Promise(res=>{
    let done=false;
    appState.shotClockForce=()=>{if(!done){done=true;res(defaultVal);}};
    base.then(v=>{ /* ... */ });
  });
}
```

It races `base` against `appState.shotClockForce` only because it can call `.then()` on `base` — it
cares that `base` is *a* Promise, nothing about who resolves it or how. Anything a captain can be
asked must resolve a plain Promise from wherever it comes. Resolve through anything else — an
emitter, a callback registry — and the visible clock keeps counting down while nothing
force-resolves at zero: the 30-second auto-skip every player relies on stops firing, silently.

---

## 4. NOT YET CONVERGED — all five prompt forks, named

**"The prompt channel" is not one thing. It is these five fork sites**, confirmed by reading the
tree at build `2026-08-20k`. This table is this document's honesty — it is what stops a reader who
sees the narration and active-seat channels converged from concluding the prompt channel is too.

| # | Fork | File:line | Rendering shared? | State |
|---|---|---|---|---|
| 1 | `pickCell()` | `4/src/ui/flow.js:569` | **Yes** — `sailPanelHTML` + `sailHighlightRect`, both gated | **NOT YET CONVERGED** — orchestration: `localPickCell` (host loop) vs `remotePickHighlights` (guest listener). Declared gap in the parity gate as of 02.15-02 Task 1. Target of 02.15-02 Task 3 (THE TRACER). |
| 2 | `ask()` | `4/src/ui/util.js:1577` | **Yes** — `optionButtonsHTML`, gated | **NOT YET CONVERGED** — orchestration: `localAsk` (host loop) vs `watchPrompt`'s ask branch. Target of 02.15-02 Task 4. |
| 3 | `battleAsk()` | `4/src/orchestrator.js:443` | **Yes, more than expected** — `renderBattleFromSnap` delegates to `renderBattle`, so both tiers already end in one card builder | **NOT YET CONVERGED** — only the CONTROL WIRING (arming the coin, wiring `.btlBtn`) differs, not the card. Target of 02.15-02 Task 5, expected NOT to be reached under D-04. |
| 4 | `recipeDraftNet()` | `4/src/orchestrator.js:855` | Yes — `optionButtonsHTML` via `watchDraftPrompt` | **LEFT — not a task in 02.15-02.** Forks on `seatLocal(s)`, not `decisionIsLocal(s)`. See Rule B above — the landmine is real and disarming it is its own piece of work. |
| 5 | `netIntroBarrier()` | `4/src/ui/flow.js:2265` | Same `draftPrompts` node, same builder | **LEFT — not a task in 02.15-02.** Same `seatLocal` fork; additionally has its own `appState.passAndPlay` interception (`4/src/ui/flow.js:2249-2261`) that a careless dispatch extension would break. |

**Nobody may read "the prompt channel is done" off a partial convergence of this table.** Each fork
either converges — one renderer, named by both the host's loop and by a Firebase listener, with the
promise's creation/resolution/rejection all named — or stays listed here with its seam and its
landmine, updated in the same commit that changed its state.

---

*Updated in the same commit as each conversion. See `02.15-02-SUMMARY.md` for what changed in that
plan and `02.15-02-PLAN.md`'s `<the_five_forks>` for the full research behind this table.*
