# Phase 19: Safari Check - Pattern Map

**Mapped:** 2026-07-31
**Files analyzed:** 3 (1 modified module, 1 modified markup file, 0-1 new sprite asset)
**Analogs found:** 3 / 3

This phase adds no new *files* by workstream mandate (D-14: this workstream owns `src/ui/board.js`
and new sprite assets only). Everything below is new exported functions/state colocated inside the
existing `src/ui/board.js` module, following `stormLayerSpecs()`/`buildStormLayers()`'s exact shape,
plus an optional new PNG in `assets/`. No planner file in this phase should touch `index.html`'s CSS
block without a deliberate cross-workstream sequencing note (see Coordination Hazard below).

## File Classification

| New/Modified Location | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/ui/board.js` — new `windDotSpecs(seed, count)` | utility (pure spec generator) | transform (seeded RNG → array of specs) | `stormLayerSpecs(seed)` at `src/ui/board.js:307-338` | exact — same file, same function shape, same seeding rule |
| `src/ui/board.js` — new `buildWindDots(container, seed, count)` | component (DOM layer builder) | event-driven (lazy build, then rAF-driven) | `buildStormLayers(ov, seed)` at `src/ui/board.js:343-356` | exact — same lazy-build-once-then-mutate-in-place shape |
| `src/ui/board.js` — new rAF loop (`windDotLoop`/similar) inside/near `render()` | controller (per-frame motion + measurement) | streaming (continuous animation frame stream) | `render()`'s wind-angle block at `src/ui/board.js:596-624` | exact — same "read live wind angle, write to a DOM var with zero restart" job, one level up in cadence (per-frame vs per-event) |
| `src/ui/board.js` — new on/off switch + 0–100 dial + live readout markup/wiring | component (touch control + readout) | request-response (user tap/drag → state change, read back on next frame) | `#flipCoinWrap` touch target (`index.html` classic script, `src/ui/board.js:867-879` for the `.active` class toggle half) and `.apBtn`/`button.primary.big` styling (`index.html:331-337`, `763-1002`) | role-match — closest finger-friendly on-screen control precedent in the codebase; none of them are a slider, so the dial widget itself has no exact prior art (see Discretion note below) |
| `assets/wind-dot.png` (optional, only if a baked sprite is chosen over a drawn shape) | asset (static file) | file-I/O (loaded once, cached by browser) | `assets/rain-streaks.png` | exact — same "small baked PNG, precedent for size" role |
| `scripts/wind_dot_contract_check.js` (optional Wave-0 self-check, per RESEARCH.md) | test/utility (standalone Node script) | batch (one-shot grep-and-report, run via `npm test` or manually) | `scripts/module_graph_check.js` / `scripts/ui_contract_check.js` | role-match — same "shebang, header naming what's gated and why, one PASS/FAIL per assertion, exit 0/1" shape |

## Pattern Assignments

### `windDotSpecs(seed, count)` (utility, seeded-RNG spec generator)

**Analog:** `stormLayerSpecs(seed)` — `src/ui/board.js:307-338`

**The exact precedent to copy, verbatim in shape:**
```javascript
// src/ui/board.js:307,319-338 — stormLayerSpecs(), the direct template
export function stormLayerSpecs(seed){
  const LAYERS=4, JIT=0.86, baseSpeed=0.676, BASE_SCALE=0.969, TILE_W=240, TILE_H=226, PERIOD=113;
  const rnd=mulberry32(seed);
  const specs=[];
  for(let i=0;i<LAYERS;i++){
    const ox=rnd(), sp=rnd()*2-1, spd=rnd()*2-1, ph=rnd(), op=rnd()*2-1;
    const scale=BASE_SCALE*(1+sp*0.4*JIT);
    const dur=baseSpeed*(1+spd*0.5*JIT);
    specs.push({ scale, dur, /* ...derived fields... */ });
  }
  return specs;
}
```
**What to copy exactly:**
- `mulberry32(seed)` instantiated ONCE per call, never `appState.game.r()` — this is D-12, and the
  file header (`src/ui/board.js:9-30`, excerpted below) explains *why* in painstaking detail; the
  new function's own header comment should cross-reference it the same way `stormLayerSpecs()`'s
  comment at lines 290-306 does.
- The `rnd()` calls are drawn in a fixed, deterministic ORDER inside the loop (`ox, sp, spd, ph, op`
  style) — for `windDotSpecs`, RESEARCH.md's own sketch (`windDotSpecs(seed, count)` producing
  `startT/wobbleAmp/speed/lane` per dot, RESEARCH.md lines 232-244) should be followed in exactly
  that field order for reproducibility across re-reads of this pattern.
- The demo-board fallback: `const DEMO_RAIN_SEED=1337;` (`src/ui/board.js:342`) and its call site
  `seed==null?DEMO_RAIN_SEED:seed` (`src/ui/board.js:345`) — the wind-dot function needs its OWN
  fixed literal fallback (RESEARCH.md proposes reusing `DEMO_RAIN_SEED` or a sibling constant), never
  `Math.random()`, for the seedless decorative demo board case.

### `buildWindDots(container, seed, count)` (component, lazy DOM builder)

**Analog:** `buildStormLayers(ov, seed)` — `src/ui/board.js:343-356`

```javascript
// src/ui/board.js:343-356 — buildStormLayers(), the direct template for lazy-build-once
export function buildStormLayers(ov,seed){
  if(ov.childElementCount)return; // already built
  for(const s of stormLayerSpecs(seed==null?DEMO_RAIN_SEED:seed)){
    const d=document.createElement("div");
    d.className="rlayer";
    d.style.backgroundSize=s.bgSize;
    d.style.setProperty("--drop",s.drop);
    d.style.animationDuration=s.duration;
    d.style.animationDelay=s.delay;
    d.style.backgroundPositionX=s.bgPosX;
    d.style.opacity=s.opacity;
    ov.appendChild(d);
  }
}
```
**Key difference to design in, not copy:** unlike the storm's fixed `LAYERS=4` built once and never
touched again, the wind-dot dial (D-04) must let the *count* change live, 0–100, mid-voyage without
reload. So `buildWindDots` cannot use `if(ov.childElementCount)return` as its only guard — it needs
to grow/shrink the pool of DOM elements when the dial changes (create up to the new count, or mark
excess dots inactive/hide them) rather than being purely idempotent like the storm layer builder.
Cite this divergence explicitly in the new function's header comment, the same way `stormLayerSpecs()`'s
header names its own "G19 scoped exception" to the BUG-01-frozen code around it (`src/ui/board.js:15-30`).

### Direction-without-restart (rAF loop reading live wind angle)

**Analog:** `render()`'s wind-angle block — `src/ui/board.js:596-624`

```javascript
// src/ui/board.js:596-598,613-623 — render(), the exact live-angle computation + zero-restart update
if(spinNeedle&&e.wind){
  const storming=!!e.storm;
  const angle=storming&&e.wind2?STORM_DIAG[e.wind][e.wind2]:({N:0,E:90,S:180,W:270})[e.wind];
  // `angle` is the compass heading the wind blows toward (0=N/up, clockwise).
  const bw=$("boardwrap");if(bw)bw.classList.toggle("storming",storming);
  const ov=$("stormOverlay");
  if(ov&&storming){
    buildStormLayers(ov,appState.game&&appState.game.seed);
    ov.style.setProperty("--slant",(angle+180)+"deg"); // live update, zero animation restart
  }
}
```
**How the wind-dot rAF loop reuses this:** `render()` already computes `angle` once per game event
(not once per frame) — this is the exact number the new rAF loop should read on every frame via a
module-scope variable (mirroring how `--slant` is written) and apply as an OUTER `rotate()` around
each dot's own local wobble+fade transform, never baked into a per-dot CSS keyframe (RESEARCH.md's
Pattern 1 / Anti-Pattern warning, `19-RESEARCH.md:200-223,270-271`). Concretely: stash the live
`angle` in a module-scope `let windAngle=0` next to the other render-owned `let`s this file already
documents owning (`src/ui/board.js:41-59`'s deviation note lists the precedent for this kind of
module-private render-state variable), update it inside the existing `if(spinNeedle&&e.wind)` block
alongside `--slant`, and have the new rAF loop read it fresh every tick.

### The `prefers-reduced-motion` branch (D-13)

**Two established patterns exist — pick per where the new code lives:**

Pure-CSS branch (used for the storm rain, `index.html:116`):
```css
@media (prefers-reduced-motion: reduce) { #boardwrap.storming #stormOverlay .rlayer { animation-play-state: paused; } }
```
JS `matchMedia` branch (used for narration typing, `src/ui/panel.js:300`):
```javascript
const reduced=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```
Since the wind dots are rAF-driven (JS-computed transforms, not CSS `@keyframes` per RESEARCH.md
Pattern 3), the `src/ui/panel.js:300` JS pattern is the correct one to copy — a pure-CSS
`animation-play-state` branch has nothing to pause if there's no CSS animation running the motion.
Read `matchMedia` once at loop start (and optionally re-check via a `change` listener) rather than
every frame, mirroring Pitfall 4's "don't add per-frame cost to the thing measuring per-frame cost."

### Touch-friendly on-screen control precedent

**Analog:** `.apBtn` / `button.primary.big` styling (`index.html:331-337`) and the `flipCoinWrap`
touch-target pattern (`src/ui/board.js:867-879`, `index.html`'s `#flipCoinWrap` element — **the
`docs/DRIVING-THE-GAME.md` file-header warning that `#flipCoinWrap` IS the flip button, not an
`.apBtn`, is exactly the kind of "the visual button and the actual tap target are different DOM
nodes" trap this phase's new switch/dial must NOT repeat** — make the tappable element and the
visible control literally the same node, or document clearly if not):
```javascript
// src/ui/board.js:867,875,879 — the .active class toggle half of the flip-coin touch target
const el=$("flipCoinWrap");if(!el)return;
// ... el.classList.toggle(...) somewhere nearby; the word "FLIP" turns orange via
// #flipCoinWrap.active CSS rather than the whole button restyling.
```
No existing slider/dial control exists anywhere in the codebase (grep-confirmed: only buttons and
`.apBtn`s). The 0–100 dial (D-04) has no direct analog — this is intentionally left to Claude's
discretion per CONTEXT.md ("Exact placement, styling and wording of the readout and dial panel").
**Recommendation for planner:** a plain HTML `<input type="range" min="0" max="100">` is the
simplest finger-friendly, native-touch-supporting control and needs no bespoke drag-handling code —
consistent with the project's "no framework, hand-write everything small" convention, and sidesteps
inventing custom touch/drag math for something plain HTML already solves. Style it with the existing
`.panel`/`h3` conventions (`index.html:117-118`) for visual consistency, not a new design language.

---

## Shared Patterns

### Seeded decoration RNG (never `game.r()`)
**Source:** `src/ui/board.js:307,319-320,342,345` (`stormLayerSpecs`, `DEMO_RAIN_SEED`)
**Apply to:** the new `windDotSpecs` function and any other new per-dot randomness.
```javascript
const rnd=mulberry32(seed==null?DEMO_RAIN_SEED:seed); // NEVER appState.game.r() — see D-12
```
`mulberry32` itself lives at `src/shared/index.js:9` and is already imported into `src/ui/board.js`
— no new import path needed, just call it again with a fresh seed value.

### Compositor-only motion (the house rule)
**Source:** `index.html:97-109` (BUG-01 post-mortem comment + `.rlayer` CSS)
**Apply to:** every new CSS/inline-style property the wind-dot code touches. Only `transform` and
`opacity` (plus `will-change: transform`, used sparingly per RESEARCH.md's Anti-Pattern warning
about static blanket application at 100-element scale) — never a live gradient, mask, or animated
blur. This is the single hardest constraint in the phase and the reason the file header
(`src/ui/board.js:9-30`) exists at all.

### `prefers-reduced-motion`
**Source:** `index.html:116` (CSS) and `src/ui/panel.js:300` (JS) — see above; use the JS variant.

### Small standalone self-check script
**Source:** `scripts/module_graph_check.js:1-13` header shape (shebang, header naming what's
gated/why, PASS/FAIL per assertion, exit 0/1)
**Apply to:** the optional `scripts/wind_dot_contract_check.js` RESEARCH.md proposes (Wave 0 gap) —
a grep-based guard that the new code never introduces `mask`, `blur(`, or an animated
`linear-gradient`/`radial-gradient`, and never calls `appState.game.r()`.

---

## Coordination Hazard (D-14)

**Flagging for the planner, not resolving here:** every pattern above lives entirely inside
`src/ui/board.js`. The ONE place a CSS touch might be tempting — adding a new `#windDots` overlay
container styled similarly to `#stormOverlay` (`index.html:92-116`), or styling the new dial/switch
panel — would require editing `index.html`'s `<style>` block, which **Phase 18 (`prompts-polish`) is
concurrently editing**. Two options to sequence deliberately (planner's call, not decided here):
1. Keep all new CSS **inline** via `element.style.xxx=` in `src/ui/board.js` (matches
   `buildStormLayers()`'s own approach — it sets `d.style.backgroundSize`, `.style.opacity` etc.
   directly in JS rather than via a stylesheet rule) — avoids `index.html` entirely, honors D-14 to
   the letter.
2. If a real stylesheet rule is unavoidable (e.g., a `#windDots { position:absolute; inset:0;
   pointer-events:none; }` base rule mirroring `#stormOverlay`'s), that is an `index.html` CSS edit
   and must be sequenced with Phase 18 rather than made silently — call this out explicitly in the
   PLAN.md this feeds.

Given D-14's phrasing ("this workstream owns `src/ui/board.js` and new sprite assets ONLY"), option 1
(all styling inline via JS, following `buildStormLayers()`'s own precedent) is the safer default and
avoids the coordination hazard entirely — recommended, not mandated.

## No Analog Found

| Item | Role | Data Flow | Reason |
|------|------|-----------|--------|
| 0–100 range/slider dial control | component | request-response | No slider/range-input control exists anywhere in the codebase today — every existing control is a `<button>`. Native `<input type="range">` is the recommended starting point (see above), not an existing-pattern copy. |
| rAF-based combined travel+wobble transform math | utility | streaming | No prior rAF-per-frame transform-writing loop exists in this codebase (the storm rain is pure CSS `@keyframes`, not rAF-driven). RESEARCH.md's own inline code sketch (`19-RESEARCH.md:404-424`) is the only available template — treat it as illustrative pseudocode to adapt, not a codebase analog. |

## Metadata

**Analog search scope:** `src/ui/board.js` (full file, 882 lines), `index.html` lines 80-120 and
763-1002 (CSS + button markup), `src/ui/panel.js` lines 285-310, `src/shared/index.js` lines 1-20,
`scripts/module_graph_check.js` lines 1-45, plus targeted greps across `index.html`/`src/ui/board.js`
for `storming|stormOverlay|slant|apBtn|flipCoinWrap|<button`.
**Files scanned:** 6 read directly, ~5 grepped
**Pattern extraction date:** 2026-07-31
