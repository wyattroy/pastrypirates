# Phase 21: Sound & the Clock Toggle - Research

**Researched:** 2026-07-31
**Domain:** Browser audio playback (vanilla JS, no build step) + a local-only timer-toggle state path in an existing Firebase-backed shot-clock system
**Confidence:** HIGH for the code seams (all read directly from source in this worktree); MEDIUM for the general Safari/Web-Audio claims (corroborated web search against MDN/Apple docs); LOW/flagged wherever noted

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** All six sounds ship with their natural mapping — `ship-move` on sailing, `store-ingredient` on docking to stow an ingredient, `battle-swords` on battles, `fishing` on fishing, `storm` on a storm arriving, `coin-flip` on flips.
- **D-02:** `coin-flip.mp3` fires on **every** flip — battle rounds and routine docking flips alike, not just the dramatic ones. Wyatt's reasoning: it is the game's signature action, and anyone who disagrees now has a mute button. *(Note for the planner: flipping is not one of the 19 engine event types — the hook is the Flippenator UI seam, `humanFlip()` in `src/ui/flow.js:104`, plus `broadcastFlip`/`watchFlip` in `src/orchestrator.js:136-140` for the multiplayer echo.)*
- **D-03:** `fishing.mp3` also plays when dropping anchor in a storm — carried forward from AUDIO-01, and the reason the mapping is deliberately not one-file-per-moment.
- **D-04:** Moments with no sound of their own **borrow** rather than stay silent. The exact set:

  | Moment | Borrows | Rationale |
  |---|---|---|
  | Wind pushes your boat (`windmove`) | `ship-move` | It is your ship moving, just not by choice |
  | A trade completes (`trade`) | `store-ingredient` | It is a crate changing hands |
  | Running aground (`aground`) | `storm` | |
  | Shipwrecked (`shipwrecked`) | `storm` | |
  | Fleeing a battle (`battleflee`) | `battle-swords` | The clash happened; you just left it |
  | Dodging (`dodge`) | `battle-swords` | |

- **D-05:** The win screen gets a sound rather than silence, but **as an explicit placeholder**. Claude selected `store-ingredient.mp3` (5 KB — the short, bright one, closest to a chime). This MUST be marked in code and in the summary as a stand-in for a purpose-made victory sound from Luis. Nothing in the six actually sounds like victory. — **Reversibility:** reversible — one constant swaps when a real file arrives.
- **D-06:** Remaining moments stay silent: `blocked`, `moored`, `turn`, `newround`, `tradewind`, `bakeoff`, `end`, `finish`.
- **D-07:** You hear **the whole table** — rival and bot captains' actions play on your screen too, not just your own turn. Matches the fact that every player already *sees* the whole table narrated. Consequence accepted: a bot-heavy game is a noisy game.
- **D-08:** **Storms are the exception** — `storm.mp3` fires **once** when the storm arrives, not once per captain the storm affects.
- **D-09:** The storm sound **fades out when the storm moment ends** — it sits under the storm for as long as the storm is being shown and narrated, then fades as that resolves. Its length therefore varies turn to turn by design; it must never hard-cut and must never drone past the moment. *(Wyatt raised this unprompted: "storm sounds should fade out.")*
- **D-10:** Repeats of the same sound **layer** — a second flip starts its own copy over the first rather than cutting it off or being dropped. A fast battle is meant to build into a flurry. Explicitly rejected: restart-on-retrigger, and ignore-while-playing (the latter would make flips land silently, which reads as broken).
- **D-11:** The storm sits **quieter underneath** the short sounds so flips, clashes and dockings stay clear on top of it. No cap on how many short sounds may layer at once — Wyatt chose the un-capped option deliberately.
- **D-12:** Sound **goes quiet when the game is not the focused tab**, and resumes on return. Nobody gets pirate noises out of a forgotten background tab. Explicitly rejected: keeping sound as a background "your turn is coming" cue.
- **D-13:** Muting is **remembered per browser** across games and reloads — the same treatment the timer setting already gets (`pp_timerOff` in localStorage). Someone who plays with sound off never switches it off twice.
- **D-14:** A **new speaker icon** is drawn in the game's style, shown with `blocked-slash.png` over it when muted — mirroring exactly how the timer toggle shows its on/off states today. Explicitly rejected: reusing `horn.png` (it already renders the 📯 in narration text, so it would carry two meanings). **This adds a small art dependency to the phase** — see Canonical References for the art runbook. — **Reversibility:** reversible — an asset path constant.
- **D-15:** The button is visible **beside the clock, in every mode, for the whole game**. Not on the welcome screen (rejected: would need a second home outside the clock panel).
- **D-16:** Accepted consequence of D-15: the clock panel hides at the end of voyage (`setClockUI()` sets `display:none` when `appState.liveDone`), so the mute button disappears at the win screen. Mute state still holds — a muted player stays muted through the celebration — they just cannot change it there. Not treated as a defect.
- **D-17:** Switching the timer **off** stops the countdown **immediately**, un-timing the player whose turn is in progress — identical across solo, pass-and-play and multiplayer.
- **D-18:** Switching the timer back **on** mid-turn **re-arms the clock** for the current player right away. This is not optional polish: multiplayer already does this because omitting it caused the *"I paused the timer and then the game wouldn't continue"* freeze (the BUG-02 fix at `src/orchestrator.js:210-216`). Solo and pass-and-play must not reintroduce it. *(Wyatt initially chose plain "stops immediately"; when shown that this would re-create the fixed bug, he confirmed full parity.)* — **Reversibility:** costly — the failure mode is a game-freezing regression in two modes, found only by playing a full turn with the toggle flipped both ways.
- **D-19:** The timer setting stays **remembered per browser**, as it already is. "On by default" governs a player who has never touched it — not a reset every game. All three switches (timer, mute, and the existing pause) now behave consistently.
- **D-20:** After this phase there should be **no mode where the toggle is greyed out**. The D-41 greyed-with-a-reason pattern is a fallback for genuine dead-ends only; a control that silently does nothing is explicitly what this phase exists to remove.

### Claude's Discretion

- Exact fade curve and duration for the storm fade-out (D-09), so long as it tracks the on-screen storm moment and never hard-cuts.
- The relative volume the storm sits at underneath the short sounds (D-11).
- The mechanism for the local, non-Firebase timer path (D-17/D-18) — the constraint is behavioural parity with the multiplayer path, not any particular structure.
- Which of the six files, if any, needs loudness normalising so no single sound is jarring next to the others.

### Deferred Ideas (OUT OF SCOPE)

- **A purpose-made victory sound from Luis.** `store-ingredient.mp3` at the win screen is a flagged placeholder (D-05), not a decision to keep it.
- **Sound files for the moments still borrowing or silent** — a shopping list for Luis: shipwreck, running aground, fleeing, and the win.
- **N-02 red urgency animation** and **N-04 the wider parity/testing sweep** — already assigned to v1.4, out of scope here per the workstream roadmap.
- **Muting before a game starts** (a welcome-screen control) — considered and rejected for this phase at D-15; would need a second home outside the clock panel.
- **A "your turn" cue that survives a background tab** — considered and rejected at D-12.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUDIO-01 | Luis's sound effects play at appropriate game moments, on by default | Standard Stack (Web Audio API + decode-once buffer pool), Architecture Patterns 1/2/4 (event→sound dispatch, EVENT_SOUND table), Code Examples (one-shot gesture unlock so "on by default" needs no extra click), Pitfall 1 (25 vs 19 event types) |
| AUDIO-02 | A mute button sits to the right of the turn clock | Architectural Responsibility Map (mute button render/click split), Pitfall 3 (panel crowding + placement recommendation), Pattern 3 (master-gain mute mechanism) |
| AUDIO-03 | Luis is credited for the sound effects in the Credits modal | Architectural Responsibility Map (`index.html` `#creditsModal`, no code path — copy-only change, cross-referenced against the project's copy-shipped-vs-approved-gate constraint) |
| FIX-02 / N-03 | Solo gets the timer on/off toggle and it works; pass-and-play toggle starts working; one local, non-Firebase code path fixes both | Code Examples (`applyTimerOff()` extraction mirroring the existing CLOCK-02 `applyPauseState()` precedent), State of the Art table, Validation Architecture (manual-only D-17/D-18 regression check, per Wyatt's own reversibility note) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **No framework, no build step.** Vanilla HTML/CSS/JS, edits happen in place — rules out any npm
  audio helper library (Howler.js etc.) even if convenient. Enforced above: zero installs.
- **Safari support is a hard requirement**, called out specifically because of the project's
  BUG-01 Safari-storm-perf history — every audio recommendation above is evaluated against Safari
  (desktop and, cautiously, iOS) explicitly, not just Chrome.
- **The multiplayer deterministic engine + replay must remain intact** — this phase's own hard
  fence (`src/engine/index.js` untouched) is a strict subset of this constraint; `npm run
  test:determinism` is the existing automated proof.
- **`src/ui/*.js` may not import `src/orchestrator.js` directly** (the CLOCK-03 comment at
  `src/ui/panel.js:102-104`) — respected throughout: the new `src/shared/audio.js` module lives in
  the one tier `ui` is allowed to import without restriction, and every orchestrator-side call
  (mute click binding, `toggleTimer()`) stays in `src/orchestrator.js` (main tier), never reached
  from `src/ui/*.js` by direct import.
- **Naming/style conventions** (camelCase, compact `if(c){...}else{...}` spacing, no semicolon
  omission, UPPERCASE_SNAKE_CASE constants like `EVENT_NARRATION`): followed in every code example
  above — `EVENT_SOUND` mirrors `EVENT_NARRATION`'s exact shape and naming register.

## Summary

This phase is really two independent, low-risk pieces of work that happen to share one corner of
the screen. Neither needs an engine change, a new dependency, or a build step.

**Sound (AUDIO-01/02/03):** the six `sfx/*.mp3` files are short, must overlap (D-10), need
per-sound relative volume (D-11: storm quieter underneath), and need a real fade (D-09: storm fades
out, never hard-cuts). **The Web Audio API, not `HTMLAudioElement`, is the right tool** — it is the
only one of the two that (a) gives sample-accurate `gain.linearRampToValueAtTime()` fades with no
setInterval-driven volume polling, and (b) actually works on iOS Safari, where `<audio>.volume` is
silently ignored by the OS (desktop Safari is fine; this is iOS-only, and worth verifying whether
iOS matters to this project's actual audience). Everything is native browser API — zero npm
installs, so the Package Legitimacy Audit below has nothing to check.

The event→sound hook is the SAME seam the game already uses to keep host and guest in sync:
`liveRender()` (`src/ui/panel.js`, runs only on the host, after every `game.ev()` call) and
`watchEvents()` (`src/orchestrator.js`, the guest's per-event mirror of the same feed). Both
already compute "the single event that just happened" — that is where `playForEvent(e)` belongs.
The Flippenator's coin-flip sound has its own, even simpler, single choke point:
`setFlipCoin(state)` (`src/ui/board.js`) is called with `state==="spin"` from every flip path in
the game (human, bot, battle, fishing cast) on both host and guest — hook it there and D-02/D-07
are satisfied for free. Storm's "fires once" (D-08) falls out naturally too: there is no `storm`
event type — the moment is `newround` with `e.storm===true`, which by construction happens exactly
once per stormy round, not once per affected captain.

**One real finding that isn't in CONTEXT.md:** the live event stream carries **25** distinct event
types, not the 19 CONTEXT.md's D-01–D-06 table maps (confirmed by cross-referencing
`EVENT_NARRATION`'s own key list against `scripts/narration_test.js`'s comment, which independently
pins "the full 25-key EVENT_NARRATION inventory"). Six types slip through D-01–D-06's mapping table
un-decided: `blownOut`, `anchorHold`, `parley`, `sidebet`, `shotclock`, `shotclockskip`. See
**Common Pitfalls → Pitfall 1** for the full list and a recommended default.

**Clock toggle (FIX-02/N-03):** the fix is smaller than it looks, and this codebase already proved
the exact pattern needed — `togglePause()`/`applyPauseState()`/`watchPause()` (the CLOCK-02 fix)
already do precisely what `toggleTimer()`/`watchTimer()` need to do for the timer-off toggle: branch
on `appState.db && appState.room`, and fall back to a local, extracted state-mutation function when
there's no Firebase. Extracting `watchTimer()`'s existing callback body (which already contains the
BUG-02 re-arm fix D-18 requires) into a standalone `applyTimerOff(off)` function, called from both
`watchTimer()`'s Firebase listener and a new local branch of `toggleTimer()`, is a same-shape,
low-line-count change with a strong existing precedent to copy from — not a new mechanism to invent.

**Primary recommendation:** build the sound module as a new `src/shared/audio.js` (leaf tier, no
imports needed beyond the DOM/Web Audio globals) using the Web Audio API with a single
`AudioContext`, one decoded `AudioBuffer` per sfx file (decoded once at boot), a master `GainNode`
for the mute/tab-blur ramp, and a per-category `GainNode` for storm's relative volume — then wire it
into the two event seams and the flip seam above. For the clock toggle, extract
`applyTimerOff(off)` into `src/ui/util.js` next to `applyPauseState`, and give `toggleTimer()` the
same `db && room` / local-fallback branch `togglePause()` already has.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Decode/play/fade/mute sound effects | `shared` (new `src/shared/audio.js`) | — | Self-contained: owns its own `AudioContext`/`GainNode` graph and `pp_muted` localStorage read, no dependency on engine/state/ui internals. `shared` is the only leaf tier `ui` may import that isn't `engine`/`state`, and this module needs neither. |
| Event→sound dispatch (mapping table + dedup) | `shared` (same module, `playForEvent(e)`) | `ui` (call sites) | The mapping table itself is pure data + a pure function of one event object — belongs beside the audio primitives, not scattered across call sites. |
| Calling `playForEvent(e)` after a new event | `ui` (`src/ui/panel.js` `liveRender()`) | `main` (`src/orchestrator.js` `watchEvents()`) | Host and guest each already have their own "a new event just arrived" moment; sound rides along at both, matching how rendering itself already works. |
| Flip sound | `ui` (`src/ui/board.js` `setFlipCoin()`) | — | Single existing choke point for every flip in the game, already reached from both host (`broadcastFlip`) and guest (`watchFlip`) paths without new plumbing. |
| Mute button render + click wiring | `ui` (`src/ui/panel.js` `setClockUI()`) render / `main` (`src/orchestrator.js` `wireLobby()`) click bind | — | Mirrors `#scTimerToggle` exactly: click handler bound once in `wireLobby()` (main tier, may call the shared audio module directly), icon/visibility state refreshed every `setClockUI()` tick. |
| Local (non-Firebase) timer-off state application | `ui` (`src/ui/util.js`, new `applyTimerOff()`) | `main` (`src/orchestrator.js` `toggleTimer()`/`watchTimer()` call it) | Exactly mirrors the existing `applyPauseState()`/`toggleShotClockPause()`/`watchPause()` split (CLOCK-02) — same file, same shape, proven pattern. |
| Credits copy for Luis's sound credit | `main`/markup (`index.html` `#creditsModal`) | — | Static HTML, no code path. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Audio API (`AudioContext`, `AudioBufferSourceNode`, `GainNode`) | Native browser API — no version, no install | Decode the 6 mp3s once, play overlapping copies, per-source and master volume, sample-accurate fades | Zero-dependency requirement (CLAUDE.md: "no framework, no build step, edits happen in place"); it is also the only native audio API that correctly honors programmatic volume changes on iOS Safari, which `<audio>.volume` does not [CITED: developer.apple.com — HTML5 Audio/Video Device-Specific Considerations; MDN HTMLMediaElement.volume compat data] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Page Visibility API (`document.visibilitychange`, `document.hidden`) | Native | Detect tab focus loss/regain for D-12 | Standard, supported everywhere including Safari; combine with an explicit `audioCtx.resume()` call on `visible`, not just a gain ramp — iOS Safari does not auto-resume a backgrounded `AudioContext` on its own [CITED: MDN `BaseAudioContext.state`, MDN `AudioContext.resume()`] |
| `localStorage` | Native | Persist mute state (D-13) and (already used) `pp_timerOff` | Follow the exact existing `pp_timerOff` pattern (`src/orchestrator.js:168`) — do not invent a second persistence mechanism |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Web Audio API (`AudioContext` + `GainNode`) | `HTMLAudioElement` (`new Audio(url)` per play) | Far simpler code (no decode step, no context, no unlock ceremony beyond `.play()` needing a gesture once). But: `.volume` is silently ignored on iOS Safari (D-11's storm-quieter-underneath requirement would silently fail there), fades require a hand-rolled `setInterval` volume ramp instead of the browser doing sample-accurate ramping, and overlapping playback means creating N separate `Audio` objects with no shared mute/duck control point — each would need its own volume tracked and multiplied by the mute/tab-blur state independently. Rejected as primary approach because D-09 (real fade) and D-11 (relative volume) are both **locked** decisions this approach cannot cleanly deliver cross-browser. |
| One `AudioContext` for everything | A small library (Howler.js) | Zero-dependency constraint (CLAUDE.md, no npm installs anywhere in this project) rules this out outright — not evaluated further. |

**Installation:**
No installation. Everything used is a native browser global (`AudioContext`/`webkitAudioContext`,
`fetch`, `document.visibilitychange`). No `npm install`, no CDN `<script>` tag, no build step.

**Version verification:** N/A — no package to check a registry version for. Web Audio API is a
W3C Recommendation supported in all browsers this project targets (Chrome, Safari 14.1+, Firefox);
worth a one-line `if(!window.AudioContext&&!window.webkitAudioContext)` guard so a hypothetical
unsupported browser degrades to silence rather than throwing (matches the project's existing
"silent failure preferred for optional operations" convention, e.g. `iconAt()`'s image-load
fallback).

## Package Legitimacy Audit

**Not applicable — this phase installs zero external packages.** All audio functionality uses
native browser APIs (`AudioContext`, `GainNode`, Page Visibility API) already available with no
`npm install`, consistent with the project's standing zero-dependency stance (CLAUDE.md: "Python
standard library only," "no framework," "no build step"). No package-legitimacy check was run
because there is nothing to check.

## Architecture Patterns

### System Architecture Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │            src/shared/audio.js               │
                    │  (new — leaf tier, self-contained)            │
                    │                                                │
                    │  AudioContext ──► masterGain ──► destination   │
                    │       │               ▲                       │
                    │       │          (ramped 0 on mute/tab-blur,   │
                    │       │           ramped back on unmute/       │
                    │       │           tab-focus)                   │
                    │       │                                        │
                    │  6× decoded AudioBuffer (decoded once at boot) │
                    │       │                                        │
                    │  playForEvent(e) ─┐   playFlip() ─┐            │
                    │  EVENT_SOUND{...} │   (coin-flip   │            │
                    │  storm dedup via  │    always, all  │            │
                    │  e.t==="newround" │    flip paths)  │            │
                    │  && e.storm       │                 │            │
                    └────────┬──────────┴─────────────────┘            │
                             │ imported by (ui tier may import shared) │
              ┌──────────────┼───────────────────────┐                 │
              ▼              ▼                        ▼                 │
   src/ui/panel.js   src/ui/board.js          src/ui/panel.js           │
   liveRender()       setFlipCoin(state)       setClockUI()             │
   (HOST: fires once  ("spin" fires on         (renders mute icon,      │
    per game.ev())     every flip path,         re-entrant per D-12's   │
                        host + guest mirror)     500ms tick pattern)    │
              │                                        ▲                │
              ▼                                        │                │
   src/orchestrator.js                         src/orchestrator.js      │
   watchEvents()                                wireLobby()             │
   (GUEST: mirrors the                          (binds mute click       │
    same event feed,                             ONCE, main tier can    │
    one push per event)                          call shared/ directly) │
                                                                          │
   ── separately, the clock toggle fix (no relation to audio) ──────────┘
   src/ui/util.js:  applyTimerOff(off)   ◄── extracted from watchTimer()'s
                     (NEW — mirrors        existing body (BUG-02 re-arm
                      applyPauseState)     logic moves here unchanged)
                          ▲        ▲
              ┌───────────┘        └────────────┐
   src/orchestrator.js                src/orchestrator.js
   watchTimer()                       toggleTimer()
   (multiplayer: Firebase              (multiplayer: writes Firebase;
    listener calls applyTimerOff)       solo/pass-and-play: calls
                                        applyTimerOff() directly — NEW)
```

### Recommended Project Structure
```
src/
├── shared/
│   ├── index.js       # existing — icon/asset constants, unchanged
│   └── audio.js        # NEW — AudioContext, buffers, gain graph, EVENT_SOUND map, playForEvent(), playFlip(), mute state, tab-visibility handling
├── ui/
│   ├── board.js        # setFlipCoin() gains one call to shared/audio.js's playFlip()
│   ├── panel.js         # liveRender() gains one call to playForEvent(e); setClockUI() renders the mute icon
│   └── util.js          # applyTimerOff() NEW, alongside applyPauseState()
├── orchestrator.js      # watchEvents() gains one call to playForEvent(e); toggleTimer()/watchTimer() refactored; wireLobby() binds the mute click
sfx/                     # already committed, unchanged — 6 mp3s
```

### Pattern 1: Decode-once, play-many (Web Audio buffer pool)
**What:** Fetch and `decodeAudioData()` each of the 6 mp3s exactly once (at boot, or lazily on
first unlock — see Pitfall 2), cache the resulting `AudioBuffer`s in a plain object keyed by
filename stem. Every `play()` call creates a **fresh** `AudioBufferSourceNode` from the cached
buffer, connects it through a fresh (or shared, for storm) `GainNode`, and calls `.start()`. The
node is discarded after `.onended` fires — cheap, GC'd normally, no pooling needed for 6 short
files at this scale.
**When to use:** Any time a locked decision requires overlapping instances of the same short sound
(D-10) — creating a new source node per play is what makes layering "free" with Web Audio, unlike
`HTMLAudioElement` where a reused element cuts off its own previous playback.
**Example:**
```js
// src/shared/audio.js (new)
let ctx = null;
const buffers = {};          // name -> AudioBuffer
let masterGain, stormGain;   // GainNode

async function initAudio() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;                       // unsupported browser — degrade to silence
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  stormGain = ctx.createGain();          // D-11: storm's own quieter bus
  stormGain.gain.value = 0.35;           // Claude's discretion — tune by ear
  stormGain.connect(masterGain);
  await Promise.all(SFX_FILES.map(loadOne));
}
async function loadOne(name) {
  const res = await fetch(`sfx/${name}.mp3`);
  const arr = await res.arrayBuffer();
  buffers[name] = await ctx.decodeAudioData(arr);
}
function play(name, { gainNode = masterGain, volume = 1 } = {}) {
  if (!ctx || !buffers[name]) return;
  const src = ctx.createBufferSource();
  src.buffer = buffers[name];
  const g = ctx.createGain();
  g.gain.value = volume;
  src.connect(g).connect(gainNode);
  src.start();
  return { src, gain: g };
}
```

### Pattern 2: Real fade via `linearRampToValueAtTime`, never a hard cut
**What:** Storm's fade-out (D-09) uses the audio-thread ramp, not a JS interval polling `.volume`.
**When to use:** Whenever a sound must fade rather than stop.
**Example:**
```js
// Source: MDN GainNode.gain (AudioParam) — standard Web Audio ramp API
function fadeAndStop(node, seconds) {
  const g = node.gain;
  const now = ctx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);          // anchor the ramp at the CURRENT value, not a stale target
  g.linearRampToValueAtTime(0.0001, now + seconds);  // never ramp straight to 0 — exponential/linear ramps to literal 0 can throw or hitch in some engines
  node.src.stop(now + seconds + 0.05);
}
```
Storm's fade should be triggered when the stormy round's storm-affected turns are done resolving —
the cleanest, most exact signal for that is the **next `newround` event** (i.e., the storm sound
started on round N's `newround` and fades starting when round N+1's `newround` arrives, or when
`resolveEnd()`'s `end` event arrives if the storm round is the final round). This ties the fade to
actual game state rather than a guessed duration, directly satisfying D-09's "must track the
on-screen storm moment." Exact curve/duration is explicitly Claude's discretion per CONTEXT.md.

### Pattern 3: One mute/tab-blur master gain, not per-sound pause bookkeeping
**What:** Route every sound through `masterGain`. Muting (D-13) and tab-blur quieting (D-12) are
both just `masterGain.gain` ramps — no need to track which of N currently-playing overlapping
sounds to pause individually.
**When to use:** Any global on/off state that should affect every current and future sound.
**Example:**
```js
document.addEventListener("visibilitychange", () => {
  if (!ctx) return;
  if (document.hidden) {
    masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  } else {
    ctx.resume();  // REQUIRED on iOS Safari — a backgrounded AudioContext enters "interrupted"
                    // and will not resume playback on its own even once the tab is visible again
                    // [CITED: MDN BaseAudioContext.state]
    if (!muted()) masterGain.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
  }
});
```

### Pattern 4: Event→sound as a lookup table, mirroring `EVENT_NARRATION`'s existing shape
**What:** `EVENT_SOUND` keyed by `e.t`, same idiom as `src/ui/util.js`'s `EVENT_NARRATION` table
(D-01–D-06's mapping IS this table).
**Example:**
```js
// src/shared/audio.js
const EVENT_SOUND = {
  sail: "ship-move", windmove: "ship-move", blownOut: "ship-move",         // D-01, D-04, +gap fix
  dock: "store-ingredient", trade: "store-ingredient",                     // D-01, D-04
  battle: "battle-swords", battleflee: "battle-swords", dodge: "battle-swords", // D-01, D-04
  fish: "fishing", anchor: "fishing",                                      // D-01, D-03
  aground: "storm", shipwrecked: "storm",                                  // D-04
  // D-06 + gap fix (Pitfall 1): explicitly silent, not merely absent from the table
  blocked: null, moored: null, turn: null, newround: null, tradewind: null,
  bakeoff: null, end: null, finish: null,
  anchorHold: null, parley: null, sidebet: null, shotclock: null, shotclockskip: null,
};
function playForEvent(e) {
  if (e.t === "newround") { if (e.storm) play("storm", { gainNode: stormGain }); return; }
  const name = EVENT_SOUND[e.t];
  if (name) play(name);
  // anything not a key at all (future event types) silently no-ops — matches D-06's spirit
}
```

### Anti-Patterns to Avoid
- **Reusing one `<audio>` element and calling `.play()` again for layering:** restarts/cuts off
  the in-flight sound — explicitly the *rejected* behavior in D-10 ("Explicitly rejected:
  restart-on-retrigger").
- **A per-event `new Audio()` with no reference kept:** most modern engines keep a playing media
  element alive without a JS reference, but do not rely on it silently — if choosing the
  `HTMLAudioElement` fallback path for any reason, push the element into an array and splice it out
  on `'ended'`.
- **Gating the AudioContext unlock behind the SAME click that also does game-critical work,
  without a `.catch()`:** `resume()` returns a Promise that can reject in edge cases (context
  already closed, etc.) — an unhandled rejection should never block the actual game action it rode
  in on.
- **Playing sound for a bot's action only when it's `appState.mySeat`'s bot:** D-07 explicitly
  wants the whole table audible — do not gate `playForEvent` on `isLocalTo(e.p, appState.mySeat)`.
- **Writing a new field onto an emitted event object to communicate to the sound layer** (e.g.
  tagging an event with `.playedSound=true`): any mutation of the shape of an object that
  `game.ev()` produced, or that is fed into `netPushEvent`, risks drifting the determinism corpus.
  Keep all dedup/state (like "have I already started this round's storm sound") in the audio
  module's own local variables, never on the event object itself.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Volume fade | A `setInterval` loop manually stepping `.volume` down | `GainNode.gain.linearRampToValueAtTime()` | Runs on the audio thread, immune to main-thread jank (relevant given this project's own BUG-01 history of main-thread DOM-thrash during storm moments), and cannot "hard cut" by construction the way a cleared interval mid-ramp can |
| Autoplay/gesture unlock detection | Custom heuristics guessing whether a click "counts" | `ctx.resume()` called from literally any real user-gesture handler already in the flow (see Research Priority 2 below) | Browsers implement the actual gesture-detection heuristic internally; re-implementing that detection is both unnecessary and less reliable |
| Cross-browser audio format sniffing | `canPlayType()` branching to load different encodings | Nothing — ship the 6 `.mp3` files as-is | MP3 decoding is universally supported in every browser this project targets; the existing files are already committed and small (~306 KB total) |

**Key insight:** every piece of this phase's audio behavior (overlap, fade, relative volume,
mute, tab-blur) is a native capability of `GainNode`/`AudioContext` when routed through a small,
deliberate gain graph — the temptation to hand-roll timers for any of these is the direct
consequence of reaching for `HTMLAudioElement` instead.

## Common Pitfalls

### Pitfall 1: D-01–D-06's mapping table only covers 19 of the 25 real event types
**What goes wrong:** the live event stream (`appState.game.events`, the same feed both
`liveRender()` and `watchEvents()` read) carries at least 25 distinct `e.t` values, not the 19
CONTEXT.md enumerates. Verified directly against `src/ui/util.js`'s `EVENT_NARRATION` table (the
existing, load-bearing precedent for "one entry per real event type") and independently
cross-checked by `scripts/narration_test.js`'s own header comment, which pins "the full 25-key
EVENT_NARRATION inventory" as its baseline. The six event types CONTEXT.md's D-01–D-06 table never
mentions: **`blownOut`** (a gale blows you off the dock — engine-emitted, `src/engine/index.js:722`),
**`anchorHold`** (second storm leg when you already dodged once this turn — engine-emitted,
`src/engine/index.js:285`), **`parley`** (a hailed trade offer that got refused — UI-emitted),
**`sidebet`** (already explicitly narration-skipped elsewhere in the codebase),
**`shotclock`** (the 20s shot-clock penalty fires), **`shotclockskip`** (the 30s auto-skip fires).
If `playForEvent()` is written with a `.find()`/throw-on-miss shape instead of a plain
object-lookup-with-`undefined`-fallback, any of these six will throw the first time it fires in a
live game.
**Why it happens:** CONTEXT.md's authors worked from "the 19 engine event types," a list that
predates (or simply didn't cross-reference) the UI-emitted and second-leg/administrative event
types that also flow through the identical event array and identical sound-hook seam.
**How to avoid:** build `EVENT_SOUND` as a plain lookup object (`{...}`, not a `Map` requiring
`.get()` with a default, and definitely not a `switch` with no `default`), and make the dispatcher's
fallback for an absent key be silence — no throw, no console warning even. Recommended dispositions
(not locked; confirm with Wyatt if any should differ): `blownOut` → borrows `ship-move` (identical
rationale to `windmove`'s own D-04 borrow — "it is your ship moving, just not by choice");
`anchorHold`, `parley`, `sidebet`, `shotclock`, `shotclockskip` → silent (each is either "nothing
new happened" or an administrative/system event, matching the spirit of D-06's existing silent set).
**Warning signs:** a console error the first time a shot-clock penalty fires, or the first time a
storm's second wind-leg lands on an already-dodged player, in playtesting.

### Pitfall 2: the `.planning/art-generation-process.md` file CONTEXT.md cites does not exist in this repo
**What goes wrong:** CONTEXT.md's canonical_refs section says "Downstream agents MUST read
`.planning/art-generation-process.md` before planning or implementing" the new speaker icon (D-14). That
file does not exist anywhere in this git history (`git log --all -- 'notes/*'` returns nothing; no
`notes/` directory exists in this worktree at all).
**Why it happens:** the user's own global memory (`MEMORY.md` → `feedback_gemini_asset_pipeline.md`)
references "Full runbook: .planning/art-generation-process.md" as a pointer to a more detailed document
that appears to have never been committed, or was written in a different, uncommitted location.
**How to avoid:** the planner should either (a) treat the abbreviated version already present in
global memory as the working spec — "use the download button + Chrome Location setting, near-black
bg not green, gallery needs localStorage+export-JSON" — and proceed, flagging the icon generation
step for Wyatt's review before it's treated as final, or (b) ask Wyatt directly where the runbook
actually lives before starting the art sub-task. Either way, do not block the whole phase on this —
D-14's icon is a small, isolated asset dependency (one new PNG, same treatment as every existing
icon in `assets/icons/`), separable from the audio/timer engineering work.
**Warning signs:** a plan step that says "read .planning/art-generation-process.md" with no fallback
if the read fails.

### Pitfall 3: three controls now compete for one small, already-full clock panel
**What goes wrong:** `#shotClockPanel`'s only two free absolutely-positioned corners
(`#scPause` already owns top-right, `#scTimerToggle` already owns bottom-right) are gone, and this
phase both (a) makes `#scTimerToggle` visible in every mode (removing the `soloBotGame()` gate,
required by D-20) and (b) adds a brand-new mute button (AUDIO-02) — meaning, for the first time,
solo mode shows pause + timer-toggle + mute all at once, in a panel sized for two.
**Why it happens:** `#scTimerToggle`'s visibility was originally gated to "real multiplayer only"
(2+ humans) specifically so it wouldn't need to coexist with anything else in solo; that assumption
is exactly what this phase invalidates.
**How to avoid:** AUDIO-02's own wording — "a mute button sits **to the right of the turn
clock**" — reads as *outside* the small circular panel, not a third corner icon crammed inside it
(unlike `#scPause`/`#scTimerToggle`, which sit *on* the clock face itself). Recommend placing the
mute button as a sibling element in `#controlsRow` (which already lays out `#flipPanel` and
`#shotClockPanel` side by side), not a fourth absolutely-positioned icon on the clock's face. It
still needs to hide with the panel at end-of-voyage (D-16) — either place it as an actual DOM child
of `#shotClockPanel` (so `wrap.style.display="none"` in `setClockUI()` hides it for free) styled to
overflow the wrap visually, or mirror the same `display` toggle on the sibling element explicitly.
**Warning signs:** icons visually overlapping in solo mode at narrow viewport widths (the existing
`@media` breakpoint at `index.html:698` already shrinks `#scTimerToggle` for this reason — the mute
button will need the same narrow-viewport treatment).

### Pitfall 4: `AudioContext` unlock is a one-time global event, not a per-sound concern
**What goes wrong:** wiring `ctx.resume()` (or `new AudioContext()` construction) into every
individual `play()` call, instead of once, either does nothing extra (harmless but wasteful) or —
worse — someone reaches for `await ctx.resume()` inside a hot per-event path like `playForEvent()`,
adding a Promise-await into what should be fire-and-forget playback, which can visibly desync sound
from the animation it's meant to accompany.
**Why it happens:** autoplay-policy documentation is usually framed per-play ("you must unlock
before you can play"), which reads as a per-call concern when it is actually a per-page-session
concern — once a context is running, it stays running.
**How to avoid:** resume the context exactly once, from the earliest reliable user gesture in this
game's actual flow (see Research Priority 2 below), and treat every `play()` call as a plain
synchronous fire — never await `ctx.resume()` inside the sound-triggering call path itself.
**Warning signs:** a noticeable delay between an on-screen event (a flip landing, a battle
resolving) and its sound.

## Code Examples

### Reliable unlock point in this codebase's actual flow
The earliest, guaranteed user gesture in every game mode (solo, pass-and-play, host, guest) is
the click that starts the game — `choiceSolo`/`choiceHost`/`choiceJoin`/`btnConfirmStart` — all of
which are wired in `wireLobby()` (`src/orchestrator.js`, main tier, already imports everything it
needs). Attaching a **one-shot** listener there is simpler and more reliable than trying to detect
"was this the flip button" (docs/DRIVING-THE-GAME.md's own warning that `#flipCoinWrap` is not an
`.apBtn` is a reminder that this codebase's click surface is non-uniform — don't build unlock logic
that has to know about that quirk at all):
```js
// src/orchestrator.js, inside wireLobby() or boot() — first genuine user gesture in every mode
function unlockAudioOnce() {
  initAudio().then(() => ctx && ctx.resume());
  document.removeEventListener("pointerdown", unlockAudioOnce);
  document.removeEventListener("keydown", unlockAudioOnce);
}
document.addEventListener("pointerdown", unlockAudioOnce, { once: true });
document.addEventListener("keydown", unlockAudioOnce, { once: true });
```
A document-level, capture-any-gesture listener (rather than binding to one specific button) is
deliberately chosen over hooking a single button: it survives future UI changes to the welcome
screen, and it means AUDIO-01's "on by default" doesn't depend on which specific button the player
happens to click first.

### The local timer-toggle path, mirroring the existing CLOCK-02 pause precedent exactly
```js
// src/ui/util.js — new, placed beside applyPauseState()
// Extracted verbatim from watchTimer()'s existing Firebase-listener body (BUG-02's re-arm fix
// included, unchanged) so the SAME logic runs whether the state change arrived over the network
// or locally — the two callers below are the only difference.
export function applyTimerOff(off) {
  const was = appState.timerOff;
  appState.timerOff = off;
  if (appState.isHost && appState.timerOff) stopShotClock();
  else if (appState.isHost && was && !appState.timerOff && appState.shotClockSeat == null && !appState.turnExpired) {
    const seat = currentTurnSeat();
    const p = seat != null ? appState.game.players[seat] : null;
    if (p && !p.done) rearmShotClock(p);
  }
  netHandlers ? netHandlers().onSetClockUI ? netHandlers().onSetClockUI() : setClockUI() : setClockUI();
}
```
```js
// src/orchestrator.js — toggleTimer() gains the same db/room branch togglePause() already has
export function toggleTimer(){
  const next=!appState.timerOff;
  try{localStorage.setItem("pp_timerOff",next?"1":"0");}catch(e){}
  if(appState.db&&appState.room){netSetTimerOff(appState.db,appState.room,next,netFail("timerOff"));}
  else{applyTimerOff(next);}   // NEW: solo/pass-and-play local path — no Firebase round trip
}
// watchTimer() shrinks to just the Firebase wiring:
export function watchTimer(){
  netWatchTimerOff(appState.db,appState.room,s=>applyTimerOff(!!s.val()));
}
```
`stopShotClock`/`rearmShotClock`/`currentTurnSeat` are already imported into `src/orchestrator.js`
(used by the current `watchTimer()`), so this refactor adds zero new cross-module import edges — it
only moves an existing function body one file over. `applyTimerOff` gates every mutation on
`appState.isHost`, which is `true` in solo and pass-and-play (`src/ui/flow.js:1714`/`:1725` set it
explicitly at game start with `room=null`), so the existing shot-clock arm/disarm machinery already
works correctly with zero Firebase connection — this was already true for `togglePause()`, it was
simply never extended to `toggleTimer()`.

### Making the toggle button visible in every mode (D-20)
```js
// src/ui/panel.js, setClockUI() — remove the soloBotGame() gate entirely
// BEFORE: toggleEl.style.display=(!soloBotGame()&&!appState.liveDone)?"":"none";
toggleEl.style.display = appState.liveDone ? "none" : "";
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `#scTimerToggle` hidden via `soloBotGame()` check, `toggleTimer()` early-returns with no db/room | Toggle visible in every mode; `toggleTimer()` branches to a local `applyTimerOff()` when there's no Firebase connection | This phase | Closes FIX-02/N-03 and D-20 in one change, reusing the CLOCK-02 pattern already proven for pause |

**Deprecated/outdated:** none — this phase introduces new capability rather than replacing an
existing shipped pattern (audio has never existed in this codebase before; the timer-toggle fix
extends an existing pattern rather than deprecating one).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Recommended dispositions for the 6 un-mapped event types (`blownOut`→ship-move, others→silent) | Pitfall 1 | Low — reversible, one-line lookup-table entries; worth a quick Wyatt confirmation but doesn't block implementation since the fallback (silence) is safe either way |
| A2 | Exact fade duration/curve for storm (Claude's own discretion per CONTEXT.md, but the *trigger point* recommendation — "fade starts at the next `newround`/`end` event" — is this research's own inference, not verified against any existing code comment) | Code Examples / Pattern 2 | Medium — if the storm round is unusually short (one captain, ends fast) the fade could feel abrupt; if unusually long (4 captains all storm-affected) the sound might need to loop rather than play once through — check `storm.mp3`'s own duration (177KB, likely 8-12s) against typical stormy-round wall-clock length during a browser verification pass |
| A3 | Recommended mute-button placement (sibling in `#controlsRow`, not a third icon on the clock face) | Pitfall 3 | Low — pure CSS/layout choice, easily changed, doesn't affect any locked decision |
| A4 | iOS Safari relevance to this project's actual audience (desktop vs. mobile play patterns) | Standard Stack / Summary | Low-medium — if the game is desktop-only in practice, the whole Web-Audio-over-HTMLAudioElement argument still holds (better fades either way) but the iOS-volume-bug motivation specifically becomes moot; doesn't change the recommendation, just its strongest justification |

**A1–A4 are all LOW-to-MEDIUM risk and none block starting implementation** — they're places to
sanity-check during the human-verify browser pass, not open design questions that need resolving
before planning.

## Open Questions

1. **Should the 6 un-mapped event types (Pitfall 1) get an explicit Wyatt ruling before
   implementation, or is "silent by default, ship-move for blownOut" close enough to D-01–D-06's
   own spirit to just build?**
   - What we know: D-06's philosophy ("remaining moments stay silent") extends cleanly to 5 of the
     6; `blownOut`'s parallel to `windmove` (already D-04's own analogy) extends cleanly to the 6th.
   - What's unclear: whether Wyatt would want `shotclock`/`shotclockskip` (a coin actually changes
     hands — the shot-clock penalty debits/credits coins, same mechanical shape as `trade`) to
     borrow `store-ingredient.mp3` rather than stay silent.
   - Recommendation: build with the silent/ship-move defaults above; it's a one-line change per
     entry if Wyatt wants any of them to sound, and shipping silent-by-default carries zero
     regression risk either way.

2. **Where does `.planning/art-generation-process.md` actually live?** (Pitfall 2)
   - What we know: it's referenced by both CONTEXT.md's canonical_refs and the user's own global
     memory, but is not present in this git repository at any point in its history.
   - What's unclear: whether it exists locally, uncommitted, on a different machine, or was simply
     never written down beyond the memory-file summary.
   - Recommendation: don't block the phase on it — the memory-file summary is sufficient to attempt
     the one new icon asset, with the result flagged for Wyatt's sign-off (D-14 already frames this
     as "a small art dependency," not a blocking one).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `AudioContext`/`webkitAudioContext` | All sound playback | ✓ (Chrome, Safari 14.1+, Firefox — this project's stated target browsers) | Native, no version to pin | If absent (should not occur on any targeted browser): `initAudio()`'s own guard makes every `play()` a silent no-op — game remains fully playable with no sound, matching the project's "silent failure preferred for optional operations" convention |
| Page Visibility API | D-12 tab-blur quieting | ✓ (universal, including Safari) | Native | — |
| `sfx/*.mp3` files | All 6 sound effects | ✓ — already committed at `9f757f9`, verified present in this worktree (`ls sfx/` confirms all 6, ~306 KB total) | — | — |
| `.planning/art-generation-process.md` | D-14 speaker icon art generation | ✗ — does not exist in this repo (see Pitfall 2) | — | Use the abbreviated runbook already captured in the user's global memory (`feedback_gemini_asset_pipeline.md`); flag icon for Wyatt's review |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** `.planning/art-generation-process.md` (see above).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Hand-rolled Node harness (no assertion library) — `npm test` runs 18 scripts in sequence, each `console.log`-ing PASS/FAIL lines and `process.exit(failures?1:0)` |
| Config file | `package.json` `scripts.test` (the single source of truth for the harness's own script order) |
| Quick run command | `node scripts/<new_script>.js` (run any one new script standalone during development) |
| Full suite command | `npm test` |

**Critical limitation, stated plainly:** the Node harness has no DOM and no audio decode/playback
capability whatsoever. It can prove the sound-mapping table is complete and correctly shaped, and
it can prove the timer-toggle's headless-testable pieces stay green, but it **cannot** prove a
sound actually plays, fades, layers, or goes quiet in a real browser. That gap is closed by a
human-verify browser pass, not by more Node scripts — be explicit about this split rather than
implying broader coverage than exists.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUDIO-01 | Every one of the 25 real event types (not just the 19 CONTEXT.md names) resolves to either a known sfx filename or an explicit, intentional `null` — no `undefined`/throw | unit (Node, DOM-free) | `node scripts/audio_mapping_test.js` | ❌ Wave 0 — new script, mirror `scripts/narration_test.js`'s "DOM-free, import the table directly" convention |
| AUDIO-01 | Each of the 6 sfx filenames the mapping table references actually exists on disk at the expected size | unit (Node, `fs.statSync`) | same script above, one more assertion | ❌ Wave 0 |
| AUDIO-01 | Sound actually plays at the right moment, audibly, in a live game | manual-only | driven via docs/DRIVING-THE-GAME.md §5b's armed-watcher loop, human listens | — (manual by nature — no headless audio assertion tool in this project) |
| AUDIO-02 | Mute button toggles, icon reflects state, persists across reload (`pp_muted` in localStorage) | manual + light unit | unit: grep-style check that `pp_muted` follows the exact `pp_timerOff` write/read pattern (`localStorage.setItem`/`getItem` symmetry); manual: reload mid-game, confirm still muted | ❌ Wave 0 for the unit half |
| AUDIO-02 | Mute button visible beside the clock in every mode, hidden at end-of-voyage, mute state persists through the win screen (D-15/D-16) | manual-only | browser pass, all three modes (solo, pass-and-play, multiplayer host+guest) | — |
| AUDIO-03 | Luis credited for sound effects in `#creditsModal`, no duplicate entry | manual (visual) + `git diff` review for the copy-shipped-vs-approved-gate inventory (project constraint 3) | — | — |
| FIX-02/N-03 | `applyTimerOff()`'s state-mutation logic (isolated from DOM) behaves identically whether reached from the Firebase listener or the new local branch | unit — **requires a DOM stub**, since `applyTimerOff` calls `setClockUI()` which touches `document.getElementById` | Not currently automatable without introducing a minimal `document` stub (out of scope for this phase's size — no new dependency stance) — **manual-only per Wyatt's own D-18 reversibility note**: "the failure mode is a game-freezing regression... found only by playing a full turn with the toggle flipped both ways" | — |
| FIX-02/N-03 | No mode shows a greyed-out, non-functional toggle (D-20) | manual (visual) | browser pass, all three modes | — |
| Hard fence (all reqs) | `src/engine/index.js` is byte-identical to `main` before/after this phase — the audio/timer work never touches it | automated, already exists | `npm run test:determinism` (part of `npm test`'s first script) — this is the actual, load-bearing proof that the hard constraint held, not a new script this phase needs to write | ✓ already exists |
| Hard fence (all reqs) | The new `src/shared/audio.js` respects tier layering (`ui` may import `shared`; `shared` imports nothing from `src/`) | automated, already exists | `node scripts/module_graph_check.js` (part of `npm test`) — runs automatically against every file under `src/`, no registration needed for the new file | ✓ already exists, auto-covers new files |

### Sampling Rate
- **Per task commit:** `node scripts/audio_mapping_test.js` (once it exists) + `node scripts/module_graph_check.js` — both fast, DOM-free
- **Per wave merge:** `npm test` (full 18-script suite, includes the determinism gate)
- **Phase gate:** full suite green, **plus** a human-verify browser pass covering every row marked
  manual-only above, in both Chrome and Safari, per this project's standing compatibility
  requirement — before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `scripts/audio_mapping_test.js` — DOM-free, imports `EVENT_SOUND`/`playForEvent`-adjacent
      exports directly from `src/shared/audio.js` (mirror `scripts/narration_test.js`'s import
      style), asserts: every one of the 25 real event types resolves to a known sfx name or an
      explicit `null`; every referenced sfx filename exists in `sfx/` at a non-zero size; the flip
      seam and storm-dedup logic are exercised with fabricated event objects (no DOM, no
      AudioContext construction needed if `initAudio()` is structured so the pure-data lookup is
      importable independent of the audio-graph side effects — recommend factoring `EVENT_SOUND`
      and `playForEvent`'s dispatch logic so they don't require a live `ctx` to be inspected)
- [ ] No new fixtures needed for the timer-toggle refactor — it has no independently-testable
      headless surface without a DOM stub (see FIX-02/N-03 row above); this is a known, accepted
      gap, not an oversight

*(No other Wave 0 gaps — the existing `npm test` suite already covers the hard-fence and
layering assertions this phase must not violate.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Phase touches no auth surface |
| V3 Session Management | no | Phase touches no session surface |
| V4 Access Control | no | Phase touches no access-control surface |
| V5 Input Validation | no new surface | The only new "input" is the mute button click (boolean toggle, no user-supplied data) and localStorage reads that already follow the existing `pp_timerOff` pattern (wrapped in `try/catch`, per `src/orchestrator.js:168`) — no new parsing of untrusted strings |
| V6 Cryptography | no | Phase touches no cryptographic surface |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| None specific to this phase's scope | — | This phase adds client-side-only audio playback and a client-side-only state toggle; it introduces no new network endpoint, no new data written to Firebase beyond the existing `timerOff` node (already-shipped write path, unchanged shape), and no new user-controlled string rendered into the DOM. The `sfx/*.mp3` files are static, already-committed, already-reviewed assets fetched from the same origin as everything else in this game — no new trust boundary is crossed. |

## Sources

### Primary (HIGH confidence)
- `src/orchestrator.js`, `src/ui/panel.js`, `src/ui/util.js`, `src/ui/board.js`, `src/ui/flow.js`,
  `src/engine/index.js`, `src/shared/index.js`, `src/state/index.js`, `scripts/module_graph_check.js`,
  `scripts/narration_test.js`, `scripts/narration_audit_check.js`, `index.html`, `package.json` —
  all read directly in this worktree, all line-number references above verified against the actual
  file contents at research time.

### Secondary (MEDIUM confidence)
- [MDN — HTMLMediaElement.volume compatibility data](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volume) — iOS Safari volume-ignore behavior
- [Apple Developer — HTML5 Audio and Video, Device-Specific Considerations](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html) — iOS audio-level-under-hardware-control rationale
- [MDN — BaseAudioContext.state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) — the iOS-only "interrupted" state
- [MDN — AudioContext.resume()](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume) — resume-on-gesture / resume-on-visible pattern
- WebSearch results corroborating Chrome 66+/Safari 11+/Firefox 66+ suspended-by-default AudioContext autoplay policy (multiple independent results converged on the same behavior)

### Tertiary (LOW confidence)
- None — every claim above either traces to source code read directly in this worktree, or to an
  official documentation source (MDN/Apple) surfaced via web search and cross-checked across
  multiple independent results.

## Metadata

**Confidence breakdown:**
- Standard stack (Web Audio API choice): HIGH — the D-09/D-11 requirements are unambiguous and the
  iOS volume-ignore fact is independently documented by both MDN and Apple
- Architecture (event/flip seams): HIGH — every seam cited was read directly from source in this
  worktree, not inferred
- The 25-vs-19 event type gap: HIGH — cross-verified two independent ways (direct `EVENT_NARRATION`
  key enumeration, and `scripts/narration_test.js`'s own "25-key" comment)
- Pitfalls (Safari-specific behaviors): MEDIUM — corroborated via web search against MDN/Apple, not
  verified in an actual Safari browser session during this research pass (that verification is
  exactly what the Validation Architecture's manual-only rows exist to cover)
- Storm fade trigger-point recommendation: MEDIUM — a reasoned inference from the engine's own
  round structure, not confirmed against any existing code comment or prior decision

**Research date:** 2026-07-31
**Valid until:** 30 days (stable native-API domain; the only fast-moving risk is a future Safari
release changing autoplay/interruption behavior, which is worth a quick re-check if this phase's
implementation slips more than a month past this research)
