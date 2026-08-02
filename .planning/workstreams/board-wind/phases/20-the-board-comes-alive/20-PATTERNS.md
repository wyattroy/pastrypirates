# Phase 20: The Board Comes Alive - Pattern Map

**Mapped:** 2026-08-02
**Files analyzed:** 6 modified + 1 new (throwaway tuning page)
**Analogs found:** 6 / 7 (the tuning page has no in-repo analog that imports real modules — see below)

This phase's own `20-RESEARCH.md` already did most of the analog-identification work at the
line-number level (it is unusually thorough). This file adds the concrete code excerpts a planner
can copy directly, verified against the real files as they exist today.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/ui/board.js` — wind dots extend (D-02/D-03/D-04/D-06) | utility (decoration engine) | event-driven (render→tick) | `stormLayerSpecs()`/`buildStormLayers()`, same file, lines 378-427 | exact — same file, same author, same seeded-decoration idiom |
| `src/ui/board.js` — channel specks (WIND-02, new) | utility (decoration engine) | event-driven (rAF loop) | `windDotSpecs()`/`windDotFrame()`/`buildWindDots()`, lines 497-631 | exact — explicitly named as the shape to mirror |
| `src/ui/board.js` — whirlpool rotation (WIND-03, new) | utility (CSS injection) | transform (static position, CSS-only) | `.rlayer`'s `animation-play-state:paused` pattern (`index.html` CSS) + `buildStormLayers()`'s lazy-build-once guard | role-match — no existing runtime `<style>`-injection precedent in this codebase; pattern is assembled from two partial analogs (see Pattern Assignments) |
| `src/ui/flow.js` — `sailGhostBoats()` (WIND-05, new) + rim-aware `sailHighlightRect()` | component (highlight/render helper) | request-response (one-shot draw on pick) | `sailHighlightRect()`, lines 227-231, and its two call sites `localPickCell()` (250-271) / `remotePickHighlights()` (1766-1784) | exact — this is a second application of the same G25 "one shared builder" precedent |
| `src/ui/util.js` — scent derivation (WIND-04, new) inside `EVENT_NARRATION.newround` | utility (pure string derivation) | transform (event → narration text) | `EVENT_NARRATION.newround`, lines 310-324, specifically the `!held` branch | exact — new code slots into an existing branch of the same function |
| `src/ui/panel.js` — `flash()` additive 5th param (D-02 coupling) | utility (narration scheduler) | event-driven (async reveal handshake) | `flash()`, lines 1079-1102, and its own precedent of additive params (`holdMs`, `variants`) | exact — the function's own history is the analog |
| `scripts/wind_dot_contract_check.js` — assertions 2 and 5 edits | test (mechanical guard) | batch (static analysis over source text) | the same file's own assertion 2 (`checkCompositorOnly`, 218-236) and assertion 5 (`checkOffByDefault`, 298-309) | exact — editing the file's own established idiom, not importing a different one |
| new: WIND-02/03 test scripts | test (headless Node, no framework) | batch | `scripts/wind_dot_contract_check.js` itself (Node shebang, PASS/FAIL per assertion, `process.exit`) | exact — this is the project's one and only test idiom |
| new: throwaway tuning page (D-07/D-29) | route/page (dev tool) | request-response (static page + live sliders) | **none good** — see "No Analog Found" | n/a |

## Pattern Assignments

### `src/ui/board.js` — extending the wind-dot prototype (D-02/D-03/D-04/D-06)

**Analog:** `windDotSpecs()` / `windDotFrame()` / `buildWindDots()`, same file, lines 497-631, and
the sibling `stormLayerSpecs()`, lines 378-409.

**Seeded-spec pattern to copy exactly** (`src/ui/board.js:505-513`):
```javascript
export function windDotSpecs(seed,count){
  const n=Math.max(0,Math.min(WIND_DOT_MAX,Math.floor(Number(count))||0));
  const rnd=mulberry32(((seed==null?DEMO_RAIN_SEED:seed)^WIND_DOT_SEED_SALT)>>>0);
  const specs=[];
  for(let i=0;i<n;i++){
    specs.push({startT:rnd(),wobbleAmp:rnd(),speed:rnd(),lane:rnd()});
  }
  return specs;
}
```
D-03 appends ONE more `rnd()` call to this exact fixed order (`startT,wobbleAmp,speed,lane` — append
a `swayPeriod` or similar, never reorder). The comment above this function (497-504) explicitly
states the order is documented and must stay reproducible — update that comment in the same edit.

**Pure per-frame math to extend** (`src/ui/board.js:539-564`) — `windDotFrame(spec,tMs,layerW,layerH)`
already has the exact fade-envelope shape (quarter-cosine ease, `WIND_FADE_FRAC`) D-01/D-02 should
reuse for the storm-fade and direction-change-fade multipliers, per RESEARCH's Pattern 5
recommendation of "one combined opacity multiplier... rather than two separate opacity writers."

**Seeded-RNG import** (`src/shared/index.js:9`):
```javascript
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
```
Never `appState.game.r()` — D-22 is non-negotiable and every existing analog (`stormLayerSpecs`,
`windDotSpecs`) enforces it with a private instance salted against a distinct constant
(`WIND_DOT_SEED_SALT=0x57494e44` spells "WIND"). Pick a new, distinct salt for specks/whirlpools so
none of the three seeded streams (rain, dots, specks/whirlpool) ever correlate.

**Lazy-build-once guard to copy** (`src/ui/board.js:414-427`, `buildStormLayers`):
```javascript
export function buildStormLayers(ov,seed){
  if(ov.childElementCount)return; // already built
  for(const s of stormLayerSpecs(seed==null?DEMO_RAIN_SEED:seed)){
    const d=document.createElement("div");
    d.className="rlayer";
    d.style.backgroundSize=s.bgSize;
    // ...one d.style.* write per spec field, never gradients/masks/filters
    ov.appendChild(d);
  }
}
```
Use this exact "guard on childElementCount, one div per decorative unit, only `element.style.*`
writes" shape for the whirlpool divs (WIND-03) — `buildWindDots` is NOT idempotent this way on
purpose (D-04's live dial), but whirlpool count is fixed at 4 for the whole game, so
`buildStormLayers`'s simpler once-only guard is the better match here, not `buildWindDots`'s
grow/shrink pool.

**Prototype markers and constants being removed (D-06)** — the assertion targets:
```javascript
export const WIND_PROTOTYPE_ENABLED_DEFAULT=false;
/* ===== WIND DOT PROTOTYPE (Phase 19 / WIND-00) BEGIN ===== */
... /* ===== WIND DOT PROTOTYPE (Phase 19 / WIND-00) END ===== */
```
(`src/ui/board.js:438-439` and the matching END marker later in the file.) D-06 requires the marker
pair to survive (renamed, per Pitfall 3) even as the dial/HUD/meter code between them is deleted —
do not delete the markers themselves without updating `scripts/wind_dot_contract_check.js`'s
`BEGIN_MARKER`/`END_MARKER` string constants in the same commit (see that file's pattern below).

### `src/ui/flow.js` — `sailGhostBoats()` and rim-aware `sailHighlightRect()` (WIND-05)

**Analog:** `sailHighlightRect()` itself plus its two verified call sites.

**The one shared builder, exact current shape** (`src/ui/flow.js:226-231`):
```javascript
const SAIL_HL_SCALE=0.9;
export function sailHighlightRect(c,cellPx,svg){
  const side=(cellPx-4)*SAIL_HL_SCALE, inset=(cellPx-side)/2;
  return el("rect",{x:c[0]*cellPx+inset,y:c[1]*cellPx+inset,width:side,height:side,rx:6,
    fill:"#ffc23a",class:"sailCell",style:`cursor:pointer;animation-delay:${((c[0]+c[1])%4)*0.12}s`},svg);
}
```
D-12's rim-aware branch goes HERE (check `appState.game.rim.has(c[0]+","+c[1])`, vary `fill`/`class`)
— this is, per the file's own comment at line 220-222, "G25's shared host/guest surface... the
entire reason it exists is that the two boards used to drift," so a rim branch added inside this one
function automatically covers both transports.

**Call site 1 (host), exact shape to attach `sailGhostBoats()` after** (`src/ui/flow.js:250-271`):
```javascript
export function localPickCell(p,cells){
  return new Promise(res=>{
    const svg=$("board"),hs=[];
    const done=v=>{hs.forEach(h=>h.remove());panel("");appState.activePickCleanup=null;res(v);};
    appState.activePickCleanup=()=>{hs.forEach(h=>h.remove());panel("");};
    const cellPx=boardCell();
    cells.forEach(c=>{
      const r=sailHighlightRect(c,cellPx,svg);
      r.addEventListener("click",()=>done(c));
      hs.push(r);
    });
    panel(`<div class="apMsg">${sailPickMsg(p.idx)}</div>
      <div class="apBtns"><button class="apBtn" id="apStay">Stay put</button></div>`,true);
    $("apStay").onclick=()=>done(null);
  });
}
```
Add `hs.push(...sailGhostBoats(cells,p.idx,cellPx,svg))` right after the `cells.forEach` loop — `hs`
is already the shared cleanup array `done()` sweeps, so ghost boats disappear exactly when
highlights do, with no separate lifecycle to maintain.

**Call site 2 (guest)** at `src/ui/flow.js:1766-1784` (`remotePickHighlights`) follows the identical
`for(const c of cells){const r=sailHighlightRect(c,cellPx,svg); ...}` shape — same insertion point.

**Imports `flow.js` needs to add** (currently missing, both zero-cycle-risk since `flow.js → board.js`
already exists): `iconAt` into the existing `import {el, boardCell, ...} from "./board.js"` block
(`src/ui/flow.js:54`), and `BOAT_IMG` into the existing `../shared/index.js` import block.

**Geometry to reuse, not rebuild (D-15)** — `game.rim` (a `Set`) and `game.rimHead[key]` are engine
data, already read-only per D-21; `rimSweepPath`/`rimSweepCurve`/`rimSweepPointAt`/
`rimSweepDurationMs` (`src/ui/flow.js:379+`) exist for the boat's actual sweep animation and are
**not** what `sailGhostBoats` needs — it only needs the static landing-cell lookup (`rimHead`), not
the path.

### `src/ui/util.js` — scent derivation inside `EVENT_NARRATION.newround` (WIND-04)

**Analog:** the function itself, exact current shape (`src/ui/util.js:310-324`):
```javascript
newround:e=>{
  const D=DIRNAME[e.dir],D2=DIRNAME[e.dir2];
  const held=(e.windStreak||1)>=2,wontQuit=(e.windStreak||1)>=3;
  if(e.storm){
    if(e.streak>=2)return {cls:"roundhdr",
      txt:held
        ?`— Round ${e.round}: ⛈️ The storm's baked in and won't cool down! It's still aiming ${D}, then ${D2}. Fie, Poseidon! —`
        :`— Round ${e.round}: ⛈️ The storm's baked in and won't cool down! It's aiming ${D}, then ${D2}. Batten down the hatches, ye scurvy lot! —`};
    return {cls:"roundhdr",txt:`Round ${e.round}: A ⛈️ storm be ragin'! It'll blow yer ships ${D}, then ${D2}.`};
  }
  if(held)return {cls:"roundhdr",txt:wontQuit
    ?`— Round ${e.round}: wind still to the ${D}, ${windHoldPhrase(e.dir,e.windStreak)} —`
    :`— Round ${e.round}: wind still blows ${D}, ${windHoldPhrase(e.dir,e.windStreak)} —`};
  return {cls:"roundhdr",txt:`— Round ${e.round}: wind is blowin' ${D} —`};
},
```
The scent interpolates ONLY into the final `return` (the `!held`, non-storm branch) — the `storm`
branch and the `held` branch are untouched by D-17/D-18. Write `scentFor(e.round)` as a small pure
function elsewhere in `util.js` (near `windHoldPhrase`, its nearest sibling — same file, same
"derive a phrase from event fields" role) and splice its return value into the existing em-dash
template literal, per D-18. Do not add a new field to the event object; `e.round` already exists.

### `src/ui/panel.js` — `flash()`'s additive 5th parameter (D-02 narration coupling)

**Analog:** the function's own current signature and the exact point "the line has landed" is known
(`src/ui/panel.js:1079-1093`):
```javascript
export async function flash(msg,ms,holdMs,variants){
  const _nh=netHandlers();
  if(_nh.onBroadcast)_nh.onBroadcast(msg,variants);
  const el=$("actionPanel").querySelector(".apMsg");
  if(el&&el._revealDone)await el._revealDone;
  const text=el?el.textContent:msg;
  await sleep(typeof holdMs==="number"?holdMs:msgHoldMs(text));
}
```
Add a 5th param (e.g. `onRevealDone`), invoked immediately after `if(el&&el._revealDone)await
el._revealDone;` — that line IS "the line lands." This mirrors the function's own two prior additive
parameters (`holdMs`, `variants`), both documented elsewhere as "every existing two-argument call
site behaves exactly as before" — the same backward-compatibility bar applies to the 5th.

**Import direction:** `panel.js` already imports 4 names from `board.js`
(`src/ui/panel.js:38-40` area) — add `windDotsApplyPendingDirection` to that existing import block.
`board.js` must never import from `panel.js` in return (cycle risk, same reasoning as the
`flow.js`↔`board.js` constraint below).

### `scripts/wind_dot_contract_check.js` — the mechanical-guard idiom to extend

**Analog:** the file's own assertion 2 and assertion 5, which must both change in the same commit
that ships D-06's always-on dots and D-04's gradient styling.

**Assertion 2 — forbidden substrings to narrow** (`scripts/wind_dot_contract_check.js:218`):
```javascript
const FORBIDDEN_COMPOSITOR = ["mask", "blur(", "gradient", "filter:", "box-shadow", "backdrop"];
```
Per RESEARCH Pitfall 1, drop the bare `"gradient"` term (D-04's static radial-gradient soft edge is
compositor-safe; only a LIVE/animated gradient was ever the danger) and keep the rest.

**Assertion 5 — the exact string it requires, and D-06 deletes** (`scripts/wind_dot_contract_check.js:298-309`):
```javascript
const ENABLED_DEFAULT_RE = /WIND_PROTOTYPE_ENABLED_DEFAULT\s*=\s*false/;
function checkOffByDefault(root, info) {
  if (!info.present) return { ok: true, failures: [], note: "(region not present yet)" };
  if (ENABLED_DEFAULT_RE.test(info.text)) return { ok: true, failures: [] };
  return { ok: false, failures: [`WINDDOT-OFF-BY-DEFAULT: ...`] };
}
```
This assertion must be removed or repurposed in the same commit `WIND_PROTOTYPE_ENABLED_DEFAULT` is
deleted from `board.js` (Pitfall 2) — otherwise `npm test` goes red for a reason unrelated to a real
regression.

**Marker constants that must move together** (`scripts/wind_dot_contract_check.js:80-81`):
```javascript
const BEGIN_MARKER = "/* ===== WIND DOT PROTOTYPE (Phase 19 / WIND-00) BEGIN ===== */";
const END_MARKER = "/* ===== WIND DOT PROTOTYPE (Phase 19 / WIND-00) END ===== */";
```
If the in-source markers are renamed (recommended, per Pitfall 3, to reflect shipped status), these
two string constants must be updated byte-for-byte in the same commit — the guard matches exact text.

**Idiom for any brand-new test script this phase adds** (WIND-02/03 assertions, if written as a
separate file rather than folded into this one): match this file's own header convention — shebang,
a comment block naming what is gated and why, one PASS/FAIL line per assertion, self-exclusion of
`scripts/`, every assertion runs before exit. This is the project's only test idiom; there is no
`describe`/`it` framework anywhere in the repo.

## Shared Patterns

### Seeded, private randomness for all new decoration (D-22)
**Source:** `mulberry32` (`src/shared/index.js:9`), instantiated fresh per call, salted with a
distinct constant, exactly as `stormLayerSpecs` (`WIND_DOT_SEED_SALT` sibling) and `windDotSpecs`
already do.
**Apply to:** the D-03 per-dot sway period, the D-04 per-dot size, all WIND-02 speck specs, and the
WIND-03 per-whirlpool rotation duration draw. Never `appState.game.r()` anywhere in this phase.

### Compositor-only, transform/opacity-only styling (D-24)
**Source:** `windDotFrame`'s `translate3d(...)`/`opacity` writes (`src/ui/board.js:626-627`) and
`buildStormLayers`'s `element.style.*` writes (never CSS classes carrying gradients/masks).
**Apply to:** every new animated element in WIND-01/02/03. D-04's static `radial-gradient` fill is
the one deliberate, documented exception — it is a STATIC background, never animated, and requires
the assertion-2 narrowing above in the same commit.

### `prefers-reduced-motion` branch on every new animation (D-23)
**Source:** the existing `windReducedMotion` gate referenced throughout `board.js`'s wind-dot region
(the transform-writing branch is unconditionally skipped when it's true) and the initial-frame-paint
fix at `buildWindDots` lines 602-630, which exists specifically so a reduced-motion player still sees
dots holding still rather than nothing.
**Apply to:** dots (existing), channel specks (new), AND whirlpool rotation (new) — D-23 explicitly
names all three.

### One shared host/guest builder, never two forked copies (the G25 precedent)
**Source:** `sailHighlightRect()` (`src/ui/flow.js:227`), called identically by both
`localPickCell` (host) and `remotePickHighlights` (guest).
**Apply to:** `sailGhostBoats()` — write it once, call it once from each of the same two sites,
per D-12/D-13. This is explicitly the second application of a precedent the codebase's own
comments say exists "because the two boards used to drift."

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| Throwaway tuning page (D-07/D-29) | route/page (dev tool importing real ES modules) | request-response + live sliders | No existing page in this repo imports `src/ui/board.js`'s real functions for interactive tuning. `lab.html` (121KB) is explicitly the WRONG analog — it is a pre-refactor standalone that does not load `src/ui/board.js` at all (recorded as D-08 in `19-CONTEXT.md`, restated in `20-CONTEXT.md` D-07's warning). `index.html` itself is the only page that correctly imports the real modules, but it is the live game, not a tuning harness. **Recommendation for the planner:** build this as a new minimal standalone HTML file (e.g. `tune-wind.html`) with `<script type="module">` importing `windDotSpecs`/`windDotFrame` (and the new speck/whirlpool functions) directly from `src/ui/board.js` by relative path, plus hand-written `<input type="range">` sliders and a `requestAnimationFrame` loop calling the same pure frame functions the real board uses — there is no in-repo scaffold to copy, only the import-the-real-module constraint to satisfy. |

## Metadata

**Analog search scope:** `src/ui/board.js`, `src/ui/flow.js`, `src/ui/util.js`, `src/ui/panel.js`,
`src/shared/index.js`, `scripts/wind_dot_contract_check.js`, repo root (`*.html`).
**Files scanned:** 7 (all named directly in `20-CONTEXT.md`/`20-RESEARCH.md`; no broader search was
needed since this phase's own research already identified exact line numbers for every target).
**Pattern extraction date:** 2026-08-02.
