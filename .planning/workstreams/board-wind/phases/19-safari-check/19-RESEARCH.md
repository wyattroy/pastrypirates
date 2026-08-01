# Phase 19: Safari Check - Research

**Researched:** 2026-07-31
**Domain:** Real-Safari (macOS + iOS/WebKit) compositor-animation safety and trustworthy in-browser frame-timing measurement, for a DOM-based always-on decorative layer
**Confidence:** MEDIUM — the *mechanism* recommendation is HIGH confidence (grounded in this codebase's own proven BUG-01 fix plus corroborating external sources); the *exact dot-count ceiling* is, by design, an open empirical question this phase exists to answer, not something research can pre-determine.

## Summary

This phase builds a throwaway-able, off-by-default prototype to answer one question with a number:
how many individually-moving wind dots can real Safari (desktop and phone) carry across a full
voyage without stuttering. The codebase already contains the answer to a *related* but different
question — BUG-01 proved that a **live CSS gradient + animated mask + blur filter** forces Safari's
CPU to re-rasterize and re-blur an entire oversized layer every frame, dragging the board to ~2fps.
The fix (`stormLayerSpecs()` / `buildStormLayers()`, `src/ui/board.js:285-356`) replaced that with a
pre-baked PNG tile animated only via `transform`/`background-position` — pure compositor work, no
rasterization. Wyatt's leaning for the wind dots (small elements moved with `transform`+`opacity`)
is the direct generalization of that fix to *many small* compositor-only layers instead of *one large*
one. This research confirms that leaning is directionally correct, but surfaces a **distinct, unproven
risk axis**: compositor-layer *count* (not per-layer cost) has its own memory/performance ceiling on
iOS Safari that BUG-01 never tested, because the storm rain has always used exactly 4 static layers.
Whether 100 concurrently-animating small layers is safe is a genuinely open question — which is
precisely why this phase's headroom run exists.

The codebase's own G19 retune (`stormLayerSpecs()`'s header comments) is also the strongest available
precedent for **how to combine a direction with an internal periodic motion without restarting an
animation**: the rain's fall keyframes never encode the wind direction — direction lives in a
*separate, live-updated* `rotate(var(--slant))` applied outside the animated `translate3d`, so
`ov.style.setProperty("--slant", ...)` reorients falling rain with zero visual reset. The wind dots'
D-02 requirement (travel along direction + wobble across it, changing direction mid-voyage with no
reset) maps onto exactly this pattern: bake the wobble-and-fade cycle into a local, seeded, infinite
CSS animation (or a single rAF loop) that never encodes compass direction, and apply direction as an
outer live-updated rotation. This is a confirmed, proven-in-this-codebase technique, not merely an
analogy.

On measurement: Safari's Long Tasks API (`PerformanceObserver({entryTypes:['longtask']})`) is **not
implemented in WebKit at all** — a naive port of a Chrome-style "count dropped frames via longtask"
approach will silently produce zero entries in Safari and look falsely perfect. The only honest,
universally-available signal in Safari is a `requestAnimationFrame` timestamp delta measured by hand,
piggybacked onto the same loop already driving dot motion (so measuring costs nothing extra). That
measurement has real traps specific to the exact devices in scope — ProMotion 120Hz throttling
history, Low Power Mode's 30fps throttle, and rAF's own privacy-driven timestamp coarsening — all of
which argue for classifying frames relative to a **measured baseline**, not a hardcoded "60fps means
16.7ms" assumption.

**Primary recommendation:** Build the dots as DOM `<div>` (or inline SVG `<circle>`) overlay elements
absolutely positioned inside (or beside) `#stormOverlay`'s sibling layer, animated with
`transform: translate() rotate()` + `opacity` only — no masks, no filters, no live gradients — using
the same "local seeded animation + outer live-rotated direction" split `stormLayerSpecs()` already
proved. Drive the live smoothness readout from a single shared `requestAnimationFrame` loop measuring
`now - lastFrameTime`, classified against a measured (not assumed) baseline, with backgrounding/tab-hide
deltas discarded rather than recorded as "worst moments." Keep a canvas-based fallback in reserve,
documented but not built first, in case the headroom run shows compositor layer *count* — not per-layer
cost — is the thing that breaks on iOS.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dot position/motion computation | Browser / Client (render tier, `src/ui/board.js`) | — | Purely decorative, per-frame visual state; never touches game rules or network |
| Wind direction input | Browser / Client (reads `e.wind`/`e.wind2` already surfaced by `render()`) | Engine (source of truth, read-only) | Engine already emits wind on every event; this phase must not add or change what it emits (D-11) |
| Seeded per-dot jitter (start offset, phase, speed, wobble amplitude) | Browser / Client (private `mulberry32`, mirroring `stormLayerSpecs()`) | — | Must never draw from `game.r()` (D-12) — a client-local decorative RNG, not game state |
| Smoothness measurement (rAF delta sampling) | Browser / Client | — | No server/network component; must be observable and controllable entirely in one browser tab |
| Dial / on-off switch / live readout / end-of-voyage summary UI | Browser / Client (DOM controls layered over the existing board HUD) | — | Touch-operable controls, no console access permitted (self-serve constraint) |
| Verdict recording (pass/fail + dot budget) | Human (Wyatt, off-app) | — | D-09: Wyatt runs and judges the verdict himself; no automated pass/fail gate is being built |

## User Constraints (from CONTEXT.md)

<user_constraints>

### Locked Decisions (do NOT re-litigate — copied verbatim from 19-CONTEXT.md)

**What gets built**
- **D-01:** Real, individually-moving dots — NOT the pre-baked tiling-sheet technique. Sheets are
  already proven Safari-safe; re-testing them teaches nothing. Reversible — prototype behind an off
  switch; sheet fallback is a known shipped path.
- **D-02:** Dot motion, verbatim from Wyatt: (1) dots fade in and out as they drift — appear/disappear
  mid-board, not edge-to-edge; (2) each dot travels along the current wind direction AND wobbles
  side-to-side across that path, smoothly, as if a breeze is nudging it; (3) 5–10 dots on screen at
  any moment is the target density. This supersedes the roadmap's "deliberately untuned first
  guesses" framing — density and motion are specified, not the planner's to invent.
- **D-03:** The gate tests dots only. Rim arrows (WIND-02) and rotating whirlpools (WIND-03) go
  straight into Phase 20 without their own gate.

**How it is measured**
- **D-04:** The dial ranges 0–100 dots, driven by an on-screen control beside the readout (plus/minus
  or slider), changeable mid-voyage without a reload. Must be finger-friendly (phone in scope).
- **D-05:** Smoothness is measured, not eyeballed. A live smoothness readout sits on screen during
  play; the page keeps the worst dips and prints a plain end-of-voyage summary (typical, worst
  moment, roughly when it happened).
- **D-06:** Two runs, in order. First a headroom run — wind the dial up toward 100 to find roughly
  where Safari starts to hurt. Then lock to 10 and play a full voyage to prove it holds alongside
  narration typing, ship moves, and storms arriving/leaving.
- **D-07:** The gate's real question has shifted: at 5–10 dots, raw count is nearly a non-issue (fewer
  moving pieces than the storm's 4 rain layers today, and both fading and sliding are
  compositor-cheap). The gate primarily answers whether an animation that never stops can coexist
  with everything else the board does across a whole voyage. The headroom number remains valuable as
  Phase 20's design budget.

**Where it runs, and what happens after**
- **D-08:** Lives in the real game, in `src/ui/board.js`, behind an off-by-default switch — not
  `lab.html` (a 121KB pre-refactor standalone copy that doesn't load `src/ui/board.js`).
- **D-09:** Both desktop Safari AND phone Safari must pass at the 10-dot target, or the gate fails and
  Phase 20 is rethought. The phone's ceiling — not the Mac's — becomes the budget Phase 20 designs
  against.
- **D-10:** After the verdict, the phase's code merges switched off. Nothing is visible to a real
  player and it costs them nothing. Reversible — inert code behind a flag.

**Carried forward — locked upstream, do NOT re-litigate**
- **D-11:** Nothing in v1.3 touches `src/engine/index.js` or changes what it emits. If this phase
  finds it needs an engine change: STOP and re-scope. One-way — forces the 31-fixture determinism
  re-record (v1.4).
- **D-12:** Decoration never draws from `game.r()`. Use a private `mulberry32(seed)` seeded from the
  game seed, exactly as `stormLayerSpecs()` does. One-way — same fixture re-record risk.
- **D-13:** `prefers-reduced-motion` gets a branch, as every other animation in `index.html` has.
- **D-14:** This workstream owns `src/ui/board.js` and new sprite assets only. Phase 18
  (`prompts-polish`) is concurrently editing `index.html`'s CSS block — sequence any CSS touch
  deliberately.

### Claude's Discretion (research answers these; planner decides within them)
- The technical mechanism for each dot (overlay elements w/ compositor-only transforms, canvas, or
  otherwise) — leaning recorded, not binding: small elements moved with `transform`+`opacity`.
  Research below confirms this leaning and adds a proven direction-without-reset technique.
- Exact placement, styling, and wording of the readout and dial panel.
- Whether the dot sprite is a baked image or a drawn shape.
- How the headroom run's stepping is structured (increments, dwell time per step).

### Deferred Ideas (OUT OF SCOPE)
- Rim-arrow flow (WIND-02) and whirlpool rotation (WIND-03) — excluded from the gate; a handful of
  elements that would blur the dot measurement. Go into Phase 20 directly.
- Tuning how the dots look — density and motion are specified in D-02; refining beauty is Phase 20's
  job. Nobody judges the look here.
- Any per-device dot-count strategy (e.g. fewer dots on small screens) — a Phase 20 design decision.
  D-09 chose a single shared budget set by the phone, not two separate budgets.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WIND-00 | A full game plays smoothly in real Safari with an always-on wind layer running, and the safe dot-count budget is known — the prototype ships a dial so the outcome is a number, not just pass/fail. Nothing final ships; Wyatt runs the verdict himself. | Mechanism section confirms compositor-only DOM-overlay dots as the technique to build, with a documented canvas fallback if the headroom run shows layer-count problems. Measurement section gives a Safari-safe (no Long Tasks API) frame-timing approach that is cheap enough not to perturb the thing it measures, plus explicit handling of ProMotion/Low-Power-Mode/backgrounding traps that would otherwise corrupt Wyatt's verdict. Self-serve section establishes every control (switch, dial, readout, summary) must be touch-operable with zero console use. Phone-reachability section confirms the existing LAN-serving workflow (`docs/DRIVING-THE-GAME.md`) needs no new mechanism, just the same fresh-port discipline extended to the phone. |
</phase_requirements>

## Architecture Patterns

### System Architecture Diagram

```
 render() [src/ui/board.js, called every event]
        │
        │ reads e.wind / e.wind2 / e.storm            (already surfaced — no engine change, D-11)
        ▼
 ┌───────────────────────────────┐
 │  Wind-dot decoration module   │   NEW, gated behind an off-by-default switch (D-08)
 │  (lives beside stormLayer*)   │
 │                               │
 │  1. seed = appState.game.seed │──▶ private mulberry32(seed) — NEVER game.r() (D-12)
 │     (fallback literal if none)│
 │                               │
 │  2. per-dot seeded params:    │
 │     start offset, phase,      │
 │     speed, wobble amplitude   │
 │                               │
 │  3. one shared rAF loop:      │
 │     - writes each dot's       │
 │       transform (local        │
 │       wobble+fade cycle)      │
 │     - reads a single live      │
 │       "wind angle" var and    │
 │       applies it as an OUTER  │
 │       rotate() (no restart)   │
 │     - samples now-lastFrame   │
 │       for the smoothness      │
 │       readout (piggybacked,   │
 │       ~free)                  │
 └───────────┬───────────────────┘
             │
             ▼
   ┌───────────────────────┐        ┌─────────────────────────────┐
   │ Touch-only HUD panel  │        │ Live readout + end-of-voyage │
   │ (on/off switch,       │◀──────▶│ summary (typical/worst/when) │
   │ 0-100 dial, no reload)│        │ printed in-page, no console  │
   └───────────────────────┘        └─────────────────────────────┘
             │
             ▼
   Wyatt plays two runs in real Safari (desktop, then phone) and
   reads the number off the screen → verdict recorded by hand,
   NOT computed/gated by code.
```

### Recommended Project Structure

No new files needed — the workstream owns `src/ui/board.js` and new sprite assets only (D-14). Add
the prototype as new exported functions/state colocated with `stormLayerSpecs()`/`buildStormLayers()`
in `src/ui/board.js`, following the same naming and seeding conventions. If a dedicated sprite asset
is used, place it in `assets/` alongside `rain-streaks.png` (1.9KB precedent for how small a baked
sprite can be).

### Pattern 1: Local seeded motion + outer live-updated direction (no animation restart)
**What:** Split motion into two layers of transform: an *inner*, seed-jittered, infinite CSS
animation (or rAF-driven local coordinate) that encodes the fade/wobble cycle in the dot's own local
space, and an *outer* `rotate(var(--windAngle))` (or equivalent rAF-written rotation) applied around
it that is updated live via `style.setProperty`/direct write whenever the wind direction changes.
**When to use:** Any decoration whose orientation must track a value that changes mid-animation
without a visible jump/restart.
**Why it's proven, not assumed:** This is exactly `#stormOverlay .rlayer`'s existing technique.
```css
/* Source: index.html:106-115 — the exact pattern this phase should reuse for wind direction */
#stormOverlay .rlayer {
  transform: rotate(var(--slant)) translate3d(0,0,0);
  animation: rainFall var(--speed) linear infinite;
}
@keyframes rainFall {
  from { transform: rotate(var(--slant)) translate3d(0,0,0); }
  to   { transform: rotate(var(--slant)) translate3d(0, var(--drop), 0); }
}
/* render() updates --slant on every wind change with zero animation restart: */
/* ov.style.setProperty("--slant",(angle+180)+"deg"); — src/ui/board.js:623 */
```
Applied to wind dots, the *inner* animation would be a fade-in/fade-out + perpendicular wobble cycle
(the "local, unrotated" component), and the *outer* rotation is the current wind compass angle — the
same `({N:0,E:90,S:180,W:270})[e.wind]` mapping `render()` already computes at `src/ui/board.js:598`.

### Pattern 2: Seeded-but-not-from-game-stream decoration RNG
**What:** A private `mulberry32(seed)` instance, seeded from `appState.game.seed` (fallback to a
fixed literal for the seedless demo board), used for every piece of per-dot jitter.
**When to use:** Any new decorative randomness in this codebase, per D-12.
```js
// Source: src/ui/board.js:307-342 (stormLayerSpecs / DEMO_RAIN_SEED) — the exact precedent
const DEMO_RAIN_SEED = 1337; // fixed literal, never Math.random(), for the seedless demo board
export function windDotSpecs(seed, count){
  const rnd = mulberry32(seed == null ? DEMO_RAIN_SEED : seed);
  const specs = [];
  for(let i=0;i<count;i++){
    specs.push({
      startT: rnd(),           // phase offset along the fade/travel cycle
      wobbleAmp: rnd(),         // per-dot side-to-side amplitude jitter
      speed: rnd(),            // per-dot travel-speed jitter
      lane: rnd(),              // perpendicular starting offset, so dots don't overlap in a single line
    });
  }
  return specs;
}
```

### Pattern 3: rAF-driven position writes over CSS-keyframe-driven position
**What:** Prefer a single shared `requestAnimationFrame` loop that writes each dot's `transform`
directly, over per-dot CSS `@keyframes`, for the *combined* travel+wobble motion (as opposed to the
storm rain's simpler single-axis fall).
**When to use:** Whenever motion must combine two simultaneous components (travel-along-direction +
wobble-across-it) that must recompute together every frame, and when a live "dial" must change the
active dot *count* at runtime without re-triggering a CSS animation reflow for every remaining dot.
**Why not the Web Animations API's composite modes:** WebKit does not support effect composition
(`KeyframeEffect.composite`) [CITED: developer note from Web Animations API research, see Sources] —
layering two separate WAAPI animations (one for travel, one for wobble) to auto-combine is not a safe
cross-browser bet in Safari. A single rAF loop computing `x = travel(t)*dir + wobble(t)*perp` and
writing one `transform` string sidesteps that gap entirely and gives full control over recycling
(fade-out → reseed → fade-in) without an animation restart.
**One shared loop, not one loop per dot:** with up to 100 dots in the headroom run, one
`requestAnimationFrame` callback that iterates all active dots and writes their transforms is far
cheaper than 100 independent rAF callbacks, and gives a single, natural place to piggyback the
smoothness measurement (Pitfall 3 below).

### Anti-Patterns to Avoid
- **Reintroducing any live gradient, mask, or blur filter on the board or its overlays** — this is
  the exact, named cause of BUG-01. Compositor-only properties are `transform` and `opacity` (and,
  cautiously, `filter` only when static/not animated — BUG-01's blur was animated together with the
  mask, which is what made it CPU-bound).
- **Baking wind direction into a dot's own animation keyframes.** This forces an animation restart
  (visible reset) on every direction change — exactly the failure mode Pattern 1 avoids.
- **Statically setting `will-change: transform` on all 100 elements at layer-build time and leaving
  it there.** MDN's own guidance is that `will-change` is a last-resort optimization for elements
  about to change, not a blanket promotion strategy, and overuse increases memory pressure and can
  *degrade* performance rather than help it [CITED: MDN `will-change`, see Sources]. Given a real,
  measured example of iOS Safari's compositor layer count jumping from 641→646 layers alongside a
  33MB→798MB memory spike in one app's drawer-opening interaction [CITED: web search finding, low
  first-party confidence — treat as a directional warning, not a hard number, see Assumptions Log],
  the headroom run should specifically compare a build WITH `will-change:transform` statically applied
  to all dots against one WITHOUT it, since this is a documented double-edged tool at the exact scale
  (100 elements) this phase dials up to.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Detecting Safari frame drops | A `PerformanceObserver({entryTypes:['longtask']})` listener ported from Chrome-side profiling habits | A hand-rolled `requestAnimationFrame` delta-time sampler | The Long Tasks API is not implemented in WebKit — a longtask-based detector will silently report zero long tasks in Safari and produce a false "smooth" verdict, which is the single worst possible failure mode for a gate whose entire purpose is an honest Safari number |
| Combining two simultaneous per-dot motions (travel + wobble) | Two separate Web Animations API animations relying on `composite: 'add'`/`'accumulate'` to combine | A single rAF loop computing the combined transform per frame (Pattern 3) | WebKit does not support effect composition; relying on it produces correct behavior in Chrome/Firefox but wrong or no combination in Safari — the one browser this phase exists to protect |
| Deciding dot density per device | A per-device dot-count heuristic (e.g. `navigator.hardwareConcurrency`-based scaling) | Nothing — this is explicitly deferred (Deferred Ideas, above); D-09 chose one shared budget set by the phone's ceiling | Building an adaptive heuristic now would be scope creep into a decision CONTEXT.md has explicitly reserved for Phase 20 |

**Key insight:** In this specific domain (Safari compositor safety), "use a library" is not the
relevant axis — every piece of this prototype is small enough to hand-write, and the real
hand-rolling risk is reinventing a *measurement* technique (longtask polyfills, WAAPI composite
shims) that papers over a genuine Safari gap instead of surfacing it. The gate's value depends on
not hiding exactly the kind of gap it exists to find.

## Common Pitfalls

### Pitfall 1: Compositor layer *count*, not per-layer cost, is the untested axis
**What goes wrong:** BUG-01 was one oversized (220%), masked, blurred layer running expensive
per-frame CPU rasterization. The fix proved a *small number* of *simple* compositor layers (4, doing
only `transform`) is safe. It says nothing about whether *dozens to a hundred* simple compositor
layers are safe — each promoted layer carries its own backing-store memory cost even when doing
nothing expensive, and iOS Safari has historically shown real memory/performance cliffs when layer
counts climb into the hundreds in unrelated apps [CITED: web search finding, low first-party
confidence, see Assumptions Log].
**Why it happens:** "Compositor-only" and "safe at any count" are different claims; only the first is
proven by BUG-01's fix.
**How to avoid:** This is precisely why D-06's headroom run exists — build the dial to 100 and
actually find where it degrades, rather than assuming 100 is fine because each dot is individually
cheap.
**Warning signs:** Smoothness readout degrading gradually as the dial climbs (rather than a hard
cliff) suggests memory pressure; a sudden cliff at a specific count suggests a layer-count limit.

### Pitfall 2: A naive "FPS" number can be quietly wrong on exactly the device that matters most
**What goes wrong:** iOS throttles `requestAnimationFrame` to ~30fps in Low Power Mode
[CITED: WebKit bug tracker / community reporting, see Sources], and historically capped rAF at 60fps
even on 120Hz ProMotion displays (a WebKit "Experimental Features" toggle exists to override this on
recent Safari versions) [CITED: web search finding, see Sources]. A readout that assumes "60fps =
16.7ms is normal" will misreport a Low-Power-Mode iPhone as constantly stuttering, and may under-report
real jank on a 120Hz-capable device if Safari happens to run faster than expected.
**Why it happens:** Treating an assumed target frame interval as ground truth instead of measuring it.
**How to avoid:** Compute a rolling median (or an early "calm window" sample, e.g. the first few
seconds before any dots or narration are animating) as the *baseline* frame interval for that session,
and classify subsequent frames as "dip" relative to that measured baseline, not a hardcoded constant.
Record whether Low Power Mode is suspected (a baseline consistently near 33ms is a strong signal) in
the end-of-voyage summary as context, not as a stutter.
**Warning signs:** A baseline near 33ms with almost no variance suggests Low Power Mode is active and
the whole session's numbers should be read in that light — ask Wyatt to confirm Low Power Mode is off
before the verdict run, since that would be measuring the phone's power state, not the wind layer.

### Pitfall 3: A backgrounded tab or a phone auto-lock can fake a catastrophic "worst dip"
**What goes wrong:** `requestAnimationFrame` pauses entirely while a tab/page is not visible. If
Wyatt's phone screen locks or he briefly switches apps mid-voyage, the very next rAF tick after
returning will report a multi-second (or longer) delta — which would swamp the "worst moment" slot in
the end-of-voyage summary and misrepresent an idle gap as a rendering stutter.
**Why it happens:** The measurement loop has no way to distinguish "the animation was slow" from "the
animation wasn't running at all."
**How to avoid:** Listen for `visibilitychange`; on becoming visible again, reset the "last frame time"
reference without recording that gap as a sample, exactly the way one would discard a paused-clock
interval from a latency measurement.
**Warning signs:** A single, enormous outlier delta (multiple seconds) sitting alongside otherwise
normal numbers is background time, not jank — filtering by a sane upper bound (e.g. discard/flag
deltas above ~500ms rather than recording them as "worst") keeps the summary honest.

### Pitfall 4: Measuring can itself become the thing that stutters
**What goes wrong:** An overly elaborate readout (per-frame DOM text writes, `console.log` spam,
allocating new arrays/objects every tick) adds its own per-frame cost, which is exactly the kind of
extra work this phase is trying to detect as *disqualifying* when it comes from the dots.
**Why it happens:** It's tempting to build a rich live readout (graphs, history arrays) that itself
becomes non-trivial per-frame work.
**How to avoid:** Update the on-screen readout text at a throttled cadence (e.g. a few times per
second, not every frame) even though the underlying delta sampling happens every frame; keep the
"worst dip" tracker to a few plain numbers (worst delta, elapsed time when it occurred), not a full
per-frame history array.
**Warning signs:** If the smoothness number itself gets worse specifically when the readout panel is
visible/updating vs. hidden, the readout is contaminating its own measurement.

### Pitfall 5: A live-serving branch on a fresh port is necessary but not sufficient on a phone
**What goes wrong:** `docs/DRIVING-THE-GAME.md` already documents that Safari caches ES modules
aggressively per-URL and that a fresh, never-before-used port is the reliable cache-buster (a `?cb=`
query string does not help). On a phone this bites harder because there is no simple
"open DevTools → hard-reload" muscle memory, and no memorized list of ports already tried.
**Why it happens:** Same root cause as the desktop case, compounded by less convenient cache
inspection tools on iOS Safari.
**How to avoid:** Pick a fresh port number for every distinct code change that needs re-verifying on
the phone, exactly as prescribed for desktop; write the port down before starting so Wyatt isn't
guessing which ports are "used" mid-session.
**Warning signs:** A change on the phone doesn't seem to take effect at all, or an old dial/switch
behavior reappears — check the port before assuming the code is wrong.

## Code Examples

### Verified pattern: seeded rain jitter (the direct template for wind-dot jitter)
```js
// Source: src/ui/board.js:307-338 — stormLayerSpecs(), verbatim precedent
export function stormLayerSpecs(seed){
  const LAYERS=4, JIT=0.86, baseSpeed=0.676, BASE_SCALE=0.969, TILE_W=240, TILE_H=226, PERIOD=113;
  const rnd=mulberry32(seed);
  const specs=[];
  for(let i=0;i<LAYERS;i++){
    const ox=rnd(), sp=rnd()*2-1, spd=rnd()*2-1, ph=rnd(), op=rnd()*2-1;
    // ... scale/duration/delay derived from these seeded values, never Math.random()
  }
  return specs;
}
```

### Verified pattern: direction applied outside the animated portion, live-updated with no restart
```js
// Source: src/ui/board.js:596-624 — render(), the exact place wind direction is already computed
if(spinNeedle&&e.wind){
  const storming=!!e.storm;
  const angle=storming&&e.wind2?STORM_DIAG[e.wind][e.wind2]:({N:0,E:90,S:180,W:270})[e.wind];
  // ... this `angle` is exactly what the wind-dot layer needs to aim its outer rotation at
  const ov=$("stormOverlay");
  if(ov&&storming){
    buildStormLayers(ov,appState.game&&appState.game.seed);
    ov.style.setProperty("--slant",(angle+180)+"deg"); // live update, zero animation restart
  }
}
```

### rAF frame-delta sampling piggybacked onto a dot-motion loop (new, per this phase's design)
```js
// New code for this phase — not yet in the codebase. Illustrative shape only.
let lastFrameTime = null, baselineMs = null, worstMs = 0, worstAtMs = 0, sessionStartMs = 0;
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") lastFrameTime = null; // discard the hidden-time gap
});
function windLoop(now){
  if (lastFrameTime != null) {
    const delta = now - lastFrameTime;
    if (delta < 500) { // ignore backgrounding/auto-lock outliers, see Pitfall 3
      if (baselineMs == null) baselineMs = delta;         // first calm sample as a starting baseline
      else baselineMs = baselineMs * 0.98 + delta * 0.02; // slow rolling update, see Pitfall 2
      if (delta > worstMs) { worstMs = delta; worstAtMs = now - sessionStartMs; }
    }
  }
  lastFrameTime = now;
  // ... write each active dot's transform here, using the shared `now` ...
  requestAnimationFrame(windLoop);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Live CSS gradient + animated mask + blur for storm rain | Pre-baked PNG tile, `transform`/`background-position`-only animation | BUG-01 fix, before v1.0 | Established the house rule this phase must extend, not the technique to re-test (D-01) |
| Unseeded `Math.random()` per-browser rain jitter | Private `mulberry32(seed)` seeded from the game | G19 retune, 2026-07-30 | Established the exact RNG-seeding pattern this phase's dots must reuse (D-12) |

**Deprecated/outdated:**
- Chrome DevTools-style "count long tasks" profiling habits do not transfer to Safari — the Long
  Tasks API simply isn't there. Any measurement code written from Chrome-first instincts needs the
  rAF-delta approach substituted in, not layered on top.

## Assumptions Log

> Claims tagged `[ASSUMED]` or backed only by general web search (not an official WebKit/Apple source
> read directly) are listed here for the planner/discuss-phase to weigh before treating them as fact.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | iOS Safari has shown real-world compositor layer-count/GPU-memory cliffs in the hundreds-of-layers range in unrelated apps (the 641→646 layer / 33MB→798MB example) | Anti-Patterns, Pitfall 1 | If this specific example doesn't generalize to small, simple, transform-only layers, the headroom run may find 100 dots perfectly fine and this caution turns out to be overly conservative — low cost if wrong, since the headroom run empirically settles it either way |
| A2 | WebKit does not support Web Animations API effect composition (`composite: 'add'/'accumulate'`) | Pattern 3, Don't Hand-Roll | If WebKit has since added support, the composite-based two-animation approach becomes viable and slightly simpler than a hand-rolled rAF loop — low risk, since the rAF loop works regardless and was chosen partly for the recycling/dial-count control it gives independent of this question |
| A3 | iOS Safari historically capped `requestAnimationFrame` at 60fps on ProMotion (120Hz) displays, with an "Experimental Features" toggle in recent Safari versions to override it | Pitfall 2 | If the specific device Wyatt tests on already runs rAF at 120Hz by default, the measured baseline will simply reflect that (the "measure a baseline, don't assume" design in Pitfall 2 is robust to being wrong about the exact historical cap) |
| A4 | iOS Low Power Mode throttles `requestAnimationFrame` to roughly 30fps | Pitfall 2 | Same mitigation as A3 — the baseline-relative classification degrades gracefully even if the exact throttle figure differs |
| A5 | A plain page served over `http://<LAN-IP>:<port>` and loaded directly in Mobile Safari (not fetched cross-origin from an HTTPS page) is not blocked by iOS's "Local Network Privacy" permission system, which governs native-app/Bonjour-style discovery rather than direct URL-bar navigation | Getting the branch running on the phone | If iOS has tightened this further, phone testing could fail to load at all, which would surface immediately and unambiguously as a connection error — not a silent wrong-verdict risk, but worth a quick smoke-test connecting the phone to the dev server for a static page BEFORE building the whole prototype, so the risk is caught early and cheaply |

**If this table is empty:** N/A — see rows above. All are LOW-to-MEDIUM risk because in every case
the recommended design (measure locally, classify relative to a measured baseline, empirically settle
via the headroom run) is deliberately robust to the exact external claim being slightly wrong.

## Open Questions

1. **Is 100 simultaneously-animating small compositor layers actually safe on iOS Safari?**
   - What we know: BUG-01 proved a *small number* (4) of *simple* compositor layers is safe; general
     web research (not iOS-Safari-specific, not first-party) suggests layer *count* has its own memory
     ceiling distinct from per-layer complexity.
   - What's unclear: Whether ~100 is comfortably under that ceiling, right at it, or over it — and
     whether `will-change:transform` applied statically to all of them helps or actively hurts at that
     scale on this exact hardware.
   - Recommendation: This is precisely what D-06's headroom run is designed to discover empirically.
     The plan should have the prototype step the dial upward with a visible dwell per step (exact
     stepping left to planner discretion per CONTEXT.md) so the live readout can show where, if
     anywhere, smoothness starts to degrade — and should build (or at least code-comment) a toggle for
     `will-change:transform` so that variable can be isolated if the headroom run shows trouble.

2. **Will the phone's local-network reachability actually work smoothly on the first attempt?**
   - What we know: `docs/DRIVING-THE-GAME.md`'s existing LAN-serving guidance was written for and
     proven on desktop Safari; phone testing was explicitly deferred in v1.1 (`12-CONTEXT.md`) as "not
     an established target," not because of a known technical blocker.
   - What's unclear: Whether Wyatt's specific Mac firewall settings, router configuration, or iOS
     version introduce a wrinkle the desktop workflow never surfaced.
   - Recommendation: Treat the very first phone connection (even to a placeholder static page) as its
     own small checkpoint before investing in the full prototype, so a networking surprise doesn't
     eat into the same afternoon budgeted for the actual Safari verdict.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Python 3 (`http.server`) | Local dev server for both desktop and phone testing | ✓ | 3.9.6 (dev machine checked) | Any static file server works equally; Python's is what `docs/DRIVING-THE-GAME.md` already standardizes on |
| macOS Safari | Desktop verdict run (D-09) | Requires Wyatt's own machine — not verifiable from this environment | — | None — this is Wyatt's manual gate by design (D-09) |
| iOS Safari (Wyatt's iPhone) | Phone verdict run (D-09) | Requires Wyatt's own device — not verifiable from this environment | — | None — same |
| Same-wifi LAN reachability (Mac ↔ iPhone) | Serving branch code to the phone | Not verifiable from this environment | — | See Open Question 2 — smoke-test early |
| git branch `claude/gsd-plan-phase-19-182a17` (or successor) | Isolates prototype code from `main` until the verdict merges back switched off (D-10) | ✓ | current HEAD `b2cc444` | — |

**Missing dependencies with no fallback:**
- Real Safari on Wyatt's own Mac and iPhone — this is the entire point of the phase (D-09); nothing
  else can substitute for it, and no automation can drive it (Chrome can be driven automatically;
  Safari cannot per `docs/DRIVING-THE-GAME.md` and the V1.3-V1.4-PLAN.md's own framing).

**Missing dependencies with fallback:** none identified — the phase's tooling needs are already
satisfied by what's documented in `docs/DRIVING-THE-GAME.md`.

## Validation Architecture

This phase is unusual: its entire deliverable *is* a validation instrument, not a feature validated by
one. The Nyquist question here is not "how do we test the wind dots" but "how do we prove the
*measurement itself* is trustworthy before a human bases an irreversible-feeling decision (D-09: pass
or fail, and the number that becomes Phase 20's budget) on what it reports." A miscalibrated
smoothness readout is worse than no readout — it would let a real stutter through as a "pass," or
falsely fail a build that was actually fine because of a background-tab artifact (Pitfall 3) or an
unmeasured Low-Power-Mode baseline (Pitfall 2).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None dedicated — this project has no browser-test framework (`npm test` covers the deterministic engine only, per `12-VALIDATION.md`'s precedent); this phase's validation is manual/human, by design (D-09) |
| Config file | none |
| Quick run command | Load the branch in Chrome first (can be driven automatically per `docs/DRIVING-THE-GAME.md`) to sanity-check the dial/switch/readout wiring before asking Wyatt to spend Safari time on it |
| Full suite command | Wyatt's own two-run protocol (D-06): headroom run, then locked-to-10 full voyage, on both desktop and phone Safari |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WIND-00 (mechanism) | Dots animate compositor-only (`transform`/`opacity`), no masks/filters/live gradients | manual code inspection + Chrome visual smoke test | none — grep for `mask`/`blur`/`gradient` in the new code as a cheap automated guard is worth adding | ❌ Wave 0 (a small self-check script, e.g. `scripts/wind_dot_contract_check.js` mirroring the project's existing `module_graph_check.js`/`ui_contract_check.js` pattern, would give this phase an automated regression guard against reintroducing a BUG-01-class mistake) |
| WIND-00 (measurement trustworthiness) | rAF-delta sampling ignores backgrounding, uses a measured baseline, and is itself cheap | manual verification: watch the readout while manually backgrounding the tab/locking the phone mid-run and confirming no bogus "worst dip" is recorded | none — this is inherently a human-observed behavior, since it's about matching a physical action (locking the phone) to an on-screen consequence | ❌ Wave 0 (no test file — this is a manual pre-flight check the planner should schedule before Wyatt's real verdict run, so a measurement bug isn't discovered only after he's already invested the afternoon) |
| WIND-00 (self-serve, touch-only) | Switch, dial, readout, and summary are all touch-operable with no console command needed | manual: operate every control by tap/drag only, on both a Mac trackpad/mouse click and an actual phone touch | none | ❌ Wave 0 (manual checklist item) |
| WIND-00 (determinism safety) | Wind-dot RNG never calls `game.r()` | automated | `grep -n "game.r()" src/ui/board.js` around the new code, or extend the existing determinism harness if one already scans for this pattern | ✓ — the existing 31-seed determinism suite (`npm test`) already gates that `game.r()`'s call count is unaffected; adding wind-dot code that doesn't touch `game.r()` should leave that suite green with zero changes required |

### Sampling Rate
- **Per task commit:** Load the branch in Chrome and visually confirm the dial/switch/readout work
  and the determinism suite (`npm test`) stays green.
- **Per wave merge:** Full Chrome smoke pass (dial to 100, dial to 0, toggle switch, prefers-reduced-motion
  simulated via devtools) before ever asking Wyatt to spend Safari time on it.
- **Phase gate:** Wyatt's own two-run Safari protocol (D-06), on both desktop and phone, is the actual
  phase gate — `npm test`/Chrome smoke passes are pre-flight hygiene, not the gate itself.

### Wave 0 Gaps
- [ ] A cheap automated "no forbidden CSS/JS properties" self-check for the new wind-dot code (grep
    for `mask`, `blur(`, `linear-gradient`/`radial-gradient` used in an *animated* context), so a
    future edit can't silently reintroduce a BUG-01-class mistake without a human noticing in code
    review.
- [ ] A short, written pre-flight checklist (backgrounding test, Low Power Mode check, confirm the
    dial reaches exactly 10 and exactly 100, confirm the on/off switch has no visible residue when
    off) for Wyatt to run through in Chrome *before* he spends his own Safari time — so a wiring bug
    doesn't cost him part of the "afternoon" budget on a false start.
- [ ] No new automated test *files* are needed beyond the above — this phase's nature (a human-judged
    gate, explicitly not machine-gated) makes a from-scratch test suite the wrong tool; the existing
    `npm test` determinism suite is the correct and sufficient automated safety net for D-11/D-12.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | This phase adds no auth surface — purely client-side decoration |
| V3 Session Management | No | No session/state changes; `appState.game.seed` is read-only here |
| V4 Access Control | No | No new access boundaries; the off-by-default switch is a feature flag, not a security boundary |
| V5 Input Validation | Marginal | The 0–100 dial is the only new "input," and it is local-only (never sent over the network, never persisted to Firebase); clamp it to [0,100] in code defensively so a stray value from a future planner edit can't produce a runaway element count |
| V6 Cryptography | No | Nothing cryptographic in scope |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Denial-of-service via unbounded resource use (the actual risk class this whole phase exists to gate) | Denial of Service | This is not an adversarial-input DoS — it's a self-inflicted performance risk from the game's own decoration. The mitigation *is* this phase's entire design: an off-by-default switch (D-08), a bounded dial (0–100, D-04), and a measured headroom run (D-06) before anything ships live. No additional ASVS-style control is needed beyond what the phase already specifies. |
| Determinism/state desync via an unintended new RNG draw from the shared game stream | Tampering (of shared multiplayer state) | Private `mulberry32(seed)` seeded from `appState.game.seed`, never `game.r()` (D-12) — already the standing mitigation, reused verbatim from `stormLayerSpecs()` |

This phase installs no new dependencies and opens no new network surface (D-08's switch is
client-local; nothing is broadcast to Firebase). The standing project constraint that
`security_enforcement` is enabled is satisfied by the above — there is no meaningful new attack
surface to threat-model beyond the self-inflicted-DoS risk this phase's own design already addresses.

## Package Legitimacy Audit

**Not applicable.** This phase installs no external packages. The project has no build step and no
package manager (`CLAUDE.md`: "Vanilla HTML/CSS/JS in `index.html`... edits happen in place, no
framework introduction"). All code for this phase is hand-written JS/CSS added to `src/ui/board.js`
and, optionally, a new static image asset in `assets/` (following the `rain-streaks.png` precedent) —
no `npm install`, no `pip install`, no third-party script tags. No legitimacy check is required.

## Sources

### Primary (HIGH confidence — read directly from this codebase)
- `src/ui/board.js:1-60, 285-356, 580-624` — file header's BUG-01 standing warning, `stormLayerSpecs()`/
  `buildStormLayers()`, and `render()`'s live wind-angle computation and `--slant` update
- `index.html:92-116` — `#stormOverlay`/`.rlayer` CSS, BUG-01 post-mortem comment, `prefers-reduced-motion`
  branch
- `src/ui/panel.js:297-301` — the JS `matchMedia("(prefers-reduced-motion: reduce)")` pattern (as
  opposed to the pure-CSS pattern), relevant since this phase's motion is likely JS-driven
- `src/shared/index.js:9` — `mulberry32` implementation
- `.planning/PROJECT.md` §Key Decisions — "Real Safari storm fix was pre-baked PNG rain, not the
  typewriter batch"
- `docs/DRIVING-THE-GAME.md` — fresh-port cache-busting discipline, LAN-serving setup, guest/host
  driving mechanics, blocking-dialog gotchas
- `.planning/V1.3-V1.4-PLAN.md` §"Phase 2 — Safari Check (a gate, not a build)"
- `.planning/workstreams/board-wind/phases/19-safari-check/19-CONTEXT.md` — full locked-decision set
- `.planning/milestones/v1.1-phases/12-verification-validation/12-CONTEXT.md` — prior precedent that
  mobile Safari testing was deferred for lack of LAN-reachable deployment, not a technical blocker

### Secondary (MEDIUM confidence — general web search, cross-referenced against MDN/W3C where possible)
- MDN `will-change` guidance — overuse increases memory pressure and can degrade rather than help
  performance; use as a targeted, temporary hint, not a blanket static promotion
- WebKit blog, "Web Animations in Safari 13.1" / "Web Animations in WebKit" — Safari's WAAPI support
  history; effect composition (`KeyframeEffect.composite`) specifically called out as unsupported in
  a cross-referenced community source
- W3C Long Tasks API spec + MDN `PerformanceLongTaskTiming` — the API's design and its Chrome-only
  practical implementation status (no direct WebKit/Apple statement of non-support was found; absence
  from WebKit's own feature-status documentation and universal community reporting is the basis for
  this claim — see Assumptions Log if this needs a harder verification pass)
- WebKit Bugzilla #202269 ("[iOS 13] requestAnimationFrame runs at 90Hz in low power mode") and general
  community reporting on ProMotion/Low-Power-Mode rAF throttling

### Tertiary (LOW confidence — general web search only, not cross-checked against an official source; see Assumptions Log)
- The specific "641→646 layers, 33MB→798MB" real-world compositor memory example (one blog-level
  source; directionally useful as a warning, not a number to design against)
- iOS "Local Network Privacy" scoping to native-app/Bonjour discovery rather than direct Mobile Safari
  URL-bar navigation to a LAN IP (inferred from the shape of the search results and this project's own
  prior LAN-serving precedent, not a single authoritative Apple statement located during this session)

## Metadata

**Confidence breakdown:**
- Standard stack/mechanism: HIGH — grounded directly in this codebase's own proven BUG-01 fix and G19
  retune, which is the single most relevant prior art available anywhere
- Architecture (direction-without-restart pattern): HIGH — read verbatim from working, shipped code
- Measurement approach (rAF-delta, baseline-relative classification, backgrounding filter): MEDIUM —
  the *design* is sound engineering practice and internally consistent, but the specific iOS behaviors
  it defends against (ProMotion cap history, Low Power Mode throttle rate, Long Tasks API absence) are
  drawn from general web search, not a single first-party WebKit source read directly this session
- Pitfalls: MEDIUM-HIGH — Pitfalls 1-2-3-4 combine HIGH-confidence codebase precedent with
  MEDIUM-confidence external corroboration; Pitfall 5 is HIGH confidence (directly from this
  project's own documented experience)
- The dot-count ceiling itself: not a research question — it is the phase's own deliverable, to be
  measured empirically by Wyatt, not estimated here

**Research date:** 2026-07-31
**Valid until:** Safari/WebKit performance behavior (Long Tasks API support, ProMotion rAF handling,
Low Power Mode throttling) can change between Safari point releases; treat findings tagged `[CITED]`
or `[ASSUMED]` as needing a quick re-check if this phase's execution slips more than ~60 days past this
research date, or if Wyatt's Safari version differs materially from what was assumed during research.
