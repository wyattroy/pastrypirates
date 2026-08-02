# Phase 20: The Board Comes Alive - Research

**Researched:** 2026-08-02
**Domain:** Client-side DOM/CSS compositor animation (vanilla JS, no framework) + narration-timing
coupling, inside an already-shipped Safari-safe prototype.
**Confidence:** HIGH for WIND-02/03/05 mechanism recommendations (all verified against the actual
source, not assumed) and for the D-06 guard-retirement finding (verified by reading
`scripts/wind_dot_contract_check.js` line by line). MEDIUM for exact tuning numbers (explicitly
deferred to Wyatt via the D-07 tuning gate) and for the D-02 narration-coupling implementation
(the mechanism is verified against real code, but no prior art in this codebase does exactly this,
so it is a considered design rather than a "found it already working" citation).

**Scope note, honoured:** Phase 19's `19-RESEARCH.md` (49KB) already covers Safari compositing, the
seeded-private-RNG pattern, reduced-motion, and browser-measurement methodology in depth. None of
that is re-derived here. This file answers only the six questions `20-CONTEXT.md`'s Discretion
section and the orchestrator's scope note left open: the WIND-02 speck mechanism, the WIND-03
whirlpool-rotation mechanism, the WIND-05 ghost-boat placement, WIND-04's derivation, D-02's
narration coupling, and D-06's guard retirement.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**WIND-01 — the wind dots**
- D-01: dots fade out as a storm arrives and fade back when it passes (~1s each way); never both
  effects at full strength.
- D-02: a direction change fades the dots out and back, **timed to the round line** — dots die away
  as the new round line types out, the layer silently re-aims while nothing is visible, a fresh
  field fades in once the line lands. Correction to shipped prototype behaviour (which pivots the
  whole `.wlayer` instantly). Reversible.
- D-03: each dot needs its own sway period — draw a per-dot `WIND_WOBBLE_PERIOD_MS`-equivalent from
  the seeded stream, appended to `windDotSpecs`' fixed draw order (never reorder existing fields).
- D-04: soft white specks, varied sizes (~4-10px), no blur filter (BUG-01), no new art asset — a
  static (never-animated) radial-gradient background is explicitly endorsed as the "soft edge."
- D-05: dots layer over everything — islands and ships. Reversible.
- D-06: the prototype's measuring rig (dial, readout, frame meter, `will-change` toggle, EOV
  summary) is deleted. Dots ship always-on at 5-10 density, no player control.
  `scripts/wind_dot_contract_check.js` is wired into `npm test`; removing the prototype scaffolding
  must keep it meaningful or deliberately retire it — never leave it silently passing over deleted
  code.
- D-07: a tuning page GATES WIND-01. Must import the real `windDotSpecs`/`windDotFrame` from
  `src/ui/board.js` (not `lab.html`-style reinvention). Throwaway. The URL+port goes in the same
  message that asks Wyatt to look at it. Reversible (the page); the approval is a hard gate.

**WIND-02 / WIND-03 — the rim channel and whirlpools**
- D-08: arrows hold still; small specks ride the channel through them, spiral into the whirlpool,
  and vanish. Reuses the dot machinery approved in D-07.
- D-09: whirlpools turn clockwise, constantly, one revolution every 8-12s.
- D-10: the rim never stops, including during storms — the OPPOSITE rule to D-01's dots.
- D-11: measured board facts — 15×15 grid, 177 water cells, 40 rim cells (36 arrows + 4 whirlpool
  swirls). Rim cells render from `game.rimCellInfo` at `src/ui/board.js:173-183`.

**WIND-05 — the rim-sweep warning**
- D-12: the warning lives in the move highlights (no hover, no confirm step — one tap commits).
- D-13: the landing square shows a faded ghost of the player's own boat, reusing existing boat art.
  Two arcs in range → two ghosts.
- D-14: chosen moves only — a storm push gets no warning.
- D-15: the geometry already exists (`rimSweepPath`, `game.rimHead`, `rimSweepCurve`,
  `rimSweepPointAt`, `rimSweepDurationMs`) — pure, exported, do not rebuild it.

**WIND-04 — the pastry scent**
- D-16: purely decorative — no relation to round/downwind island/missing ingredients.
- D-17: storm rounds keep their own unscented line untouched.
- D-18: the scent sits inside the existing em-dash wrapper.
- D-19: selection AND the no-repeat rule are DERIVED — never `this.r()`, never a module-level "last
  category" variable. Keyed off the round number, from data already on the `newround` event: `dir`,
  `round`, `streak`, `windStreak`.
- D-20: the 35 lines ship exactly as written.

**Cross-cutting, locked, do NOT re-litigate**
- D-21: nothing touches `src/engine/index.js` or changes what it emits. An engine-change finding is
  a BLOCKER, not a design.
- D-22: all decoration randomness from a private `mulberry32` seeded from the game seed, never
  `game.r()`.
- D-23: `prefers-reduced-motion` branch on every new animation — dots, specks, AND whirlpool
  rotation.
- D-24: compositor-only animation — `transform`/`opacity` only. No masks, filters, live gradients,
  `blur()`.
- D-25: animated layers are HTML over the board, NOT SVG children (Chrome does not composite SVG
  transform animations — measured, ~62 layouts/sec until moved to HTML).
- D-26: no dot budget — Wyatt measured smooth at 100/100 dots in real Safari.
- D-27: bots and humans have identical rules/affordances; never raise "should bots be allowed to…".

**Added at plan time**
- D-28: the D-07 tuning gate covers DOTS ONLY. WIND-02/03/05 build in parallel, not blocked on
  Wyatt's sign-off — but the speck implementation must read tuning values from the SAME shared
  constants WIND-01 approves, never hard-code its own copies.
- D-29: the tuning page carries three slider groups — dots, channel speck density, whirlpool
  rotation speed — approved in one sitting. Must import all three code paths, not only the dots'.

### Claude's Discretion
- The mechanism for the channel specks (D-08 fixes the look; the build is open).
- The mechanism for the whirlpool rotation (D-25 rules out animating the SVG `<image>` in place).
- Exact fade durations for D-01/D-02, subject to the D-07 tuning gate.
- How the rim highlight is styled differently (D-12) — swirl, tint, or both.
- How the scent's round-number derivation and no-repeat rule are computed (D-19).
- Whether the tuning page (D-07) is deleted at the end of the phase or left uncommitted.

### Deferred Ideas (OUT OF SCOPE)
- A player-facing settings menu (toggle dots/motion) — no such menu exists today; its own phase.
- A whirlpool that spins up when a ship is swept in — rejected for D-09's constant slow turn.
- Warning a player a storm push could carry them onto the rim — rejected for D-14.
- A dotted trail tracing the sweep arc — rejected for D-13 (competes with channel arrows/specks).
- Tying the scent to game state (downwind island / missing ingredients) — rejected for D-16.
- Keeping the smoothness meter as a permanent diagnostic — rejected for D-06.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WIND-01 | Drifting wind dots on every non-storm turn, no storm darkening | Phase 19 (mechanism shipped); this file adds D-02/D-03/D-04 deltas, D-06 guard retirement, and the D-04 "gradient" false-positive fix (§Common Pitfalls) |
| WIND-02 | Trade-wind rim channel reads as flowing into the whirlpool | §Architecture Patterns "Channel specks" — mechanism, geometry source, cycle-risk finding |
| WIND-03 | Each whirlpool rotates, reads as what stops the wind | §Architecture Patterns "Whirlpool rotation" — pure-CSS mechanism, zero JS per-frame cost |
| WIND-04 | Pastry scent on every wind direction change, from the 35-line library | §Architecture Patterns "Scent derivation" — verified derivation scheme against `newround`'s real fields |
| WIND-05 | Visual signal before a rim sweep, ghost boat at the landing square | §Architecture Patterns "Ghost boat placement" — exact insertion point verified against `sailHighlightRect`/`localPickCell`/`remotePickHighlights` |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Narration-box reveal order** (`.apBack → .apMsg → .apBtns → .apSub`, `src/ui/flow.js` `localAsk`)
  — verified this phase's UI changes never touch `#actionPanel`'s structure (WIND-02/03/05 are board
  overlays; WIND-04 is text inside an existing narration line). **Not triggered by this phase**, but
  if a plan later adds any `#actionPanel` element for these features, the reveal order must be
  respected.
- **Git fetch-before-read** and **main/origin sync** — apply at plan/execute time, not a research
  concern.
- **GSD workflow enforcement** — file edits happen through `/gsd-execute-phase`, not ad hoc.
- **Ask 2-5 clarifying questions before building non-trivial work** — applies to the planner, not
  this research pass, but two genuinely open, taste-driven questions surfaced during research (ghost
  boat opacity value; whether the tuning page's speck/whirlpool sliders write back to the same
  constants file or a separate one) are listed under Open Questions rather than decided here.
- **Driving the game in a browser** (`docs/DRIVING-THE-GAME.md`) — required reading before any
  browser automation in the plan; §8a's GPU-on / rAF-driven-frames rule applies to any COST
  measurement, not to sequencing/layout checks.
- **Kill every headless Chrome/server started in-session** — applies to plan execution.
- **Voice boundary** (credits/About are not pirate speak) — WIND-04's 35 lines are in-game-world
  narration (pirate speak), consistent with the rest of `EVENT_NARRATION` — no conflict.

## Summary

Five deliverables. Two (WIND-02, WIND-03) had **no prior art anywhere in this codebase** and needed
a mechanism invented from first principles, constrained by D-24/D-25's compositor-only, HTML-not-SVG
rule. Two (WIND-04, WIND-05) had explicit "the geometry/data already exists, do not rebuild it"
notes in CONTEXT.md, and this research locates the EXACT insertion points by reading the real
functions rather than guessing. One (WIND-01's D-02 fade-on-direction-change) is a genuinely new
cross-file coupling this research designs against the actual call graph, not an abstraction.

**Primary recommendation:** build WIND-02 and WIND-03 entirely inside `src/ui/board.js`, reusing two
different pieces of proven-cheap prior art already living there — the `windDotSpecs`/`windDotFrame`
seeded-spec-plus-pure-frame-function pattern for the channel specks (a rAF-driven HTML dot pool,
exactly like the dots but path-following instead of free-drifting), and a **pure CSS
`@keyframes` rotation** (no JS per-frame cost at all) for the whirlpools, injected via a
runtime-created `<style>` tag so `index.html` stays untouched. **Do not import `flow.js`'s
`rimSweepCurve`/`rimSweepPointAt` into `board.js`** — `flow.js` already imports FROM `board.js`
(`src/ui/flow.js:54`), so the reverse import creates a cycle that `scripts/module_graph_check.js`'s
cycle-detection assertion will hard-fail on `npm test`. Build a small, simpler, LOCAL interpolation
in `board.js` instead — the specks don't need Catmull-Rom-level smoothness the way the boat's sweep
does.

WIND-05's ghost boat belongs in a **new sibling function next to `sailHighlightRect()`**
(`src/ui/flow.js:227`), called once (not per-cell) by both `localPickCell` and
`remotePickHighlights` — the exact same "one shared builder" pattern G25 already established for
the highlight rects themselves, for the exact same reason (two call sites that have already drifted
once).

D-02's narration coupling is real but smaller than it first looks: `render()` (which calls
`windDotsTick(angle)`) already runs BEFORE the narration typewriter starts at every `newround` call
site (`ev(...); liveRender(); await narrateLastEvent();`). The only genuinely new cross-file signal
needed is "the line has finished typing" — and `panel.js`'s `flash()` already has two documented
precedents (`holdMs`, `variants`) for gaining an additive, backward-compatible parameter for exactly
this kind of per-call-site behaviour. `panel.js` already imports from `board.js`
(`src/ui/panel.js:38-40`), so the wiring direction is free.

D-06's guard retirement has one **must-fix, deterministic red** buried in it: `WIND_PROTOTYPE_
ENABLED_DEFAULT` — the constant assertion 5 of `wind_dot_contract_check.js` checks for — is exactly
what D-06 deletes. If the script isn't updated in the same commit, `npm test` breaks the moment the
always-on dots ship, for a reason that has nothing to do with a real regression.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Wind dots (WIND-01) | Browser/Client (`src/ui/board.js`) | — | Pure client-side DOM/CSS animation over a static SVG board; no server round-trip |
| Channel specks (WIND-02) | Browser/Client (`src/ui/board.js`) | — | Same tier; geometry is derived once from `game.rimCellInfo`, which is already client-resident |
| Whirlpool rotation (WIND-03) | Browser/Client (`src/ui/board.js`, injected `<style>`) | — | Pure CSS `@keyframes`; zero JS per-frame cost, zero server involvement |
| Pastry scent text (WIND-04) | Browser/Client (`src/ui/util.js`) | — | A pure derived-string function reading data already serialized on the `newround` event; no new network payload |
| Rim-sweep warning + ghost boat (WIND-05) | Browser/Client (`src/ui/flow.js`) | — | Extends the existing shared host/guest highlight builder; both host and guest render locally from data they already have (`game.rimHead`, `game.rim`) |
| Narration-timing coupling (D-02) | Browser/Client (`src/ui/panel.js` ↔ `src/ui/board.js`) | — | Both sides of the coupling are presentation-only; no engine or network involvement (D-21 forbids engine changes outright) |

There is no backend/API tier in this phase. Multiplayer sync (`src/net/`) is untouched by design —
every mechanism below is either purely local rendering (dots/specks/whirlpool/ghost) or a pure
function of data already broadcast on existing events (scent). Nothing here adds a new Firebase
field or a new broadcast payload.

## Standard Stack

**Not applicable.** This phase adds zero new dependencies — vanilla DOM/CSS/JS only, matching the
project's own standing "no framework, no bundler" constraint (`.claude/CLAUDE.md`). No `npm install`
of any kind is required.

## Package Legitimacy Audit

**Not applicable — no external packages are installed by this phase.** Every mechanism below is
built from primitives already present in the codebase (`mulberry32`, DOM APIs, CSS `@keyframes`).

## Architecture Patterns

### System Architecture Diagram

```
render() [board.js]                         narrateLastEvent() -> flash() [panel.js]
   |                                                  |
   | reads e.wind / e.storm from the just-pushed      | reads e (same event) to build the
   | `newround` event                                 | round-header line's text
   v                                                   v
windDotsTick(angle) --------- angle changed? --> DEFER re-aim, begin opacity fade-out
   |                                                   |
   | (dots continue fading toward 0 while              | typewriterReveal() runs; flash()
   |  narration typing proceeds independently)         | awaits el._revealDone
   |                                                   |
   |                                          <---------  reveal resolves ("line lands")
   |  windDotsApplyPendingDirection() <--- new additive hook fires
   v
apply stored rotate(angle), begin opacity fade-IN


                    game.rimCellInfo (built once, engine-owned, D-21 read-only)
                                |
                +---------------+----------------+
                |                                |
     WIND-02: group by `.q` (quadrant)   WIND-03: `.rimHead` gives each
     -> one waypoint list per arc         quadrant head's fixed (x,y)
                |                                |
     private-seeded speck specs          runtime <style> tag: @keyframes
     (mulberry32, D-22) + a pure          spin { to { transform:
     frame fn sampling the arc            rotate(360deg) } }
     waypoints -> {x,y,opacity}                  |
                |                        one HTML div per whirlpool,
     ONE shared rAF loop writes           animation-duration drawn from
     transform/opacity onto a             the seeded stream (8-12s, D-09),
     pooled HTML div layer                animation-play-state NEVER
     (D-25) -- never pauses for           paused for storms (D-10), only
     storms (D-10)                        for prefers-reduced-motion (D-23)


          localPickCell(p,cells)                    remotePickHighlights(cells,promptId,msg)
    (host, src/ui/flow.js:250)                        (guest, src/ui/flow.js:1766)
                |                                                  |
                +---------------- BOTH call ----------------------+
                                        |
                              sailHighlightRect(c,cellPx,svg)   <- existing, per-cell,
                                        |                          rim-aware styling added here (D-12)
                              NEW: sailGhostBoats(cells,seat,cellPx,svg)  <- one call, not per-cell;
                                        |                          computes distinct game.rimHead
                                        |                          landing cells among `cells`,
                                        v                          draws one static <image> per head
                              cleaned up by the SAME `done()` element-removal each caller already has
```

### Recommended Project Structure

No new files. Every mechanism lands in an existing file, following the file-ownership boundary
`20-CONTEXT.md` already documents as necessarily crossed:

```
src/ui/board.js   # WIND-01 (extend), WIND-02 (new), WIND-03 (new) — this workstream's owned file
src/ui/util.js    # WIND-04 (new scent derivation, inside the existing newround branch)
src/ui/flow.js    # WIND-05 (new sailGhostBoats + rim-aware sailHighlightRect variant)
src/ui/panel.js   # D-02's additive flash()/narrateLastEvent() hook — a THIRD touched file beyond
                  # the two 20-CONTEXT.md already names (util.js, flow.js); verified necessary below
scripts/wind_dot_contract_check.js   # updated in the same commit that removes
                                      # WIND_PROTOTYPE_ENABLED_DEFAULT and adds a static gradient
```

### Pattern 1: Channel specks (WIND-02) — reuse the dot machinery's SHAPE, not its geometry

**What:** A private-seeded array of speck specs (mirroring `windDotSpecs`) plus a pure per-frame
function (mirroring `windDotFrame`), driving a pooled HTML `<div>` layer via one shared rAF loop —
but instead of free vertical drift in a rotated square layer, each speck's position is sampled along
a fixed polyline built from one arc of `game.rimCellInfo`.

**Geometry source, verified (`src/engine/index.js:56-92`):** `game.rimCellInfo` is an array of
`{k,x,y,deg,q}` objects, already in clockwise order, already contiguous by quadrant (`for(let q=0;
q<4;q++)for(let i=0;i<lens[q];i++)cells.push({...ring[idx++],q})`). **Arc lengths are NOT fixed at
9 cells each** — they are randomized per game (minimum 3 cells per arc, the rest of the 36 distributed
randomly; "occasionally one arc spans nearly half the rim" per the engine's own comment). Any speck
mechanism must handle variable-length arcs, not hardcode a segment count. `game.rimHead[key]` gives
each arc's landing cell (the whirlpool), and `heads[c.q]=c` (last write wins, per the engine's own
comment) confirms the head is always the LAST cell of its arc in `rimCellInfo`'s order — so
`rimCellInfo.filter(c=>c.q===q)` (order-preserving, since already contiguous) is the complete,
correctly-ordered waypoint list for arc `q`, ending exactly at the whirlpool.

**Why NOT import `rimSweepCurve`/`rimSweepPointAt` from `flow.js`:** those functions are exactly
right for this (Catmull-Rom spline + resample-to-even-spacing + eased point-at-progress) and are
already pure and exported specifically to be reused. But `flow.js` already imports six names FROM
`board.js` (`src/ui/flow.js:54`: `el, boardCell, setFlipActive, renderLiveShips, paintShipAt,
setShipGlideMs, paintShipAtPoint`). If `board.js` then imports FROM `flow.js`, that is a cycle —
`scripts/module_graph_check.js` runs a standard white/gray/black DFS cycle detector over every file
under `src/` as part of `npm test`, and it will fail loudly and specifically
(`CYCLE: src/ui/board.js -> src/ui/flow.js -> src/ui/board.js`). This is a **verified structural
constraint**, not a style preference — confirmed by reading `scripts/module_graph_check.js:60-160`
and both files' real import lists.

**Recommendation:** write a small, self-contained, LOCAL interpolation in `board.js` — decorative
specks do not need spline-level smoothness the way the boat's sweep does (that precision existed to
avoid a visible "staircase," per `rimSweepCurve`'s own header comment; a tiny drifting speck reading
as smooth motion between ~9+ waypoints on a near-circular rim, per-arc, is a much lower bar). A
piecewise-linear lerp between consecutive `(x,y)` cell centers (converted to board px the same way
`drawBoard()` already does: `(c.x+.5)*cell`) is sufficient and keeps this workstream's file-ownership
boundary intact (`board.js` and new sprite assets only — no `flow.js` touch needed for WIND-02/03 at
all, unlike WIND-04/05 which do need it).

**Motion direction and storm behaviour are decoupled from the free-drifting dots on purpose:** the
rim's flow direction is always clockwise regardless of the round's wind compass direction (D-10's own
rationale — "the trade winds are a permanent feature of the board, not this turn's weather"). This
means **D-02's fade-on-direction-change does NOT apply to channel specks** — there is no "direction"
for the channel to change. Confirmed by D-10's own explicit contrast ("this is deliberately the
opposite rule to D-01's dots").

**Seeding:** a private `mulberry32` stream, salted differently from `WIND_DOT_SEED_SALT` and the
storm rain's own salt (same convention: `WIND_DOT_SEED_SALT=0x57494e44` spells "WIND" byte-for-byte —
pick a distinct salt constant, e.g. spelling a different short token, so the two streams never
correlate even though both derive from the same game seed). Per D-28, speck density/speed must read
from the SAME shared constants the D-07 tuning page approves for the dots where applicable (or a
sibling set of speck-specific constants the tuning page's third slider group, per D-29, also
controls) — never a separately hard-coded copy.

**"Spiral into the whirlpool":** as a speck's progress `u` along its arc approaches 1 (the head), fade
`opacity` and optionally shrink a `scale()` term toward 0 over the final ~15-20% of the arc — the
same fade-envelope SHAPE `windDotFrame`'s `D-02.1` fade already uses (a quarter-cosine ease, not
linear), just applied at the END of a fixed path instead of at both ends of a wrapping cycle. This
reads as "swallowed" without needing any DOM element removal mid-flight (the shared rAF loop already
recycles the spec once `u` wraps past 1, same pattern `windDotFrame`'s `y` wrap already uses).

### Pattern 2: Whirlpool rotation (WIND-03) — pure CSS, zero per-frame JS cost

**What:** an HTML `<div>` per whirlpool (4 total, one per quadrant head), absolutely positioned once
at `drawBoard()` time (the position never changes mid-game — `game.rimHead` is fixed at construction),
with `background-image: url(TRADE_SWIRL_IMG)` and a CSS `animation` rotating it 360° continuously.

**Why CSS and not a rAF loop:** unlike the dots and specks (whose position must be recomputed every
frame because they MOVE), a whirlpool's position is static — only its rotation angle changes, and a
constant-rate rotation is exactly what `@keyframes { to { transform: rotate(360deg); } }
animation: spin 10s linear infinite;` already does on the GPU compositor with **zero JavaScript
per-frame cost at all**. This is the cheapest possible implementation available, strictly cheaper
than reusing the rAF-driven dot machinery for this purpose. It also trivially satisfies D-10 ("never
stops, including during storms") — there is no storm-driven pause to wire up; the animation simply
never gets paused for storms, only for `prefers-reduced-motion` (D-23), mirroring `.rlayer`'s own
`animation-play-state: paused` pattern for that one case (`index.html:172`).

**Why this needs a runtime-injected `<style>` tag, not an `index.html` edit:** Phase 19 established
(and `scripts/wind_dot_contract_check.js` assertion 4 mechanically enforces) that this workstream's
CSS lives entirely as INLINE `element.style.*` writes from `board.js` — `index.html`'s `<style>`
block is never touched, specifically because another workstream (`prompts-polish`, Phase 18) is
concurrently editing `index.html`. A `@keyframes` rule cannot be expressed as an inline style
(`element.style.animation` can reference a keyframes NAME, but the `@keyframes` block itself must
exist in a stylesheet). The established, zero-`index.html`-touch way to get one is to
`document.createElement("style")`, set its `textContent` to the `@keyframes` rule, and append it to
`<head>` once from `board.js` at layer-build time — identical in spirit to how `buildWindDots`
lazily creates its DOM once and reuses it. Each whirlpool `<div>` then gets
`el.style.animation = "windWhirlSpin " + durationSec + "s linear infinite"` (or
`animationPlayState` left unset entirely under reduced motion, matching the pattern
`windDotLoop`'s reduced-motion branch already uses of simply not writing the animating property).

**Avoid a doubled/ghost image:** `board.js`'s existing rim-rendering loop
(`src/ui/board.js:175-183`) draws a static SVG `<image href={TRADE_SWIRL_IMG}>` at every quadrant
head today (`if(headKeys.has(c.k)){iconAt(svg,cx,cy,cell,TRADE_SWIRL_IMG);}`). If the new HTML
overlay ALSO shows the swirl art on top, the static SVG copy sits underneath a rotating one and
reads as a doubled/ghosted image during rotation. **Recommendation: stop drawing the SVG
`TRADE_SWIRL_IMG` at quadrant-head cells** (skip the `iconAt` call for `headKeys` cells in that
existing loop — a small, surgical change to code that is otherwise untouched), and let the new HTML
overlay be the ONLY visual instance of the whirlpool art. The 36 arrow cells (the `else` branch of
that same loop) are unaffected — D-08 keeps them static SVG exactly as they render today.

**Seeding the per-whirlpool duration:** D-09's "8-12 seconds" is a range, and D-22 requires even
this cosmetic choice to come from the private seeded stream (not `Math.random()`), so every player
in a multiplayer room sees the SAME four whirlpools spinning at the SAME speeds — consistent with
why the storm rain and the wind dots are both seeded the same way. Draw one `rnd()` value per
whirlpool at layer-build time, map it into `[8,12]` seconds.

### Pattern 3: Ghost boat placement (WIND-05) — one new shared function beside `sailHighlightRect`

**Verified exact call sites (both already share the highlight geometry, confirming G25's own
precedent applies cleanly a second time):**
- Host: `localPickCell(p,cells)` (`src/ui/flow.js:250-271`) — `cells.forEach(c=>{const
  r=sailHighlightRect(c,cellPx,svg); ...})`.
- Guest: `remotePickHighlights(cells,promptId,msg)` (`src/ui/flow.js:1766-1784`) — `for(const c of
  cells){const r=sailHighlightRect(c,cellPx,svg); ...}`. Its own comment states this call exists
  precisely because "the two cannot drift again by construction" (G25/D-55).

**Recommendation:** add a new exported function, e.g. `sailGhostBoats(cells,seat,cellPx,svg)`,
called ONCE (not per-cell) by each of the two call sites, right after their existing per-cell
highlight loop. Internally: filter `cells` to those where `appState.game.rim.has(c[0]+","+c[1])`
is true (rim membership — `game.rim` is a `Set`, already engine-built, D-21 read-only), map each to
its landing cell via `appState.game.rimHead[key]`, de-duplicate by landing-cell key (this
automatically produces "one ghost per distinct arc head" — D-13's exact two-ghosts case falls out
for free when two rim cells in `cells` belong to different arcs), and draw one static, non-animated
`<image>` per distinct head using `BOAT_IMG[seat]` at reduced opacity.

**Why a static SVG `<image>` is fine here despite D-25:** D-25's HTML-not-SVG rule is specifically
about elements that ANIMATE via transform/opacity every frame (Chrome does not composite SVG
transform ANIMATIONS). A ghost boat is a single, non-animating, semi-transparent image that appears
and disappears with the highlight set — exactly the same category as the real ship `<image>`
elements already are (`src/ui/board.js:344-347`, SVG `<image>` in `shipsSvg`, not HTML). No new
compositor risk.

**Where the rim-variant highlight styling goes (D-12):** inside `sailHighlightRect(c,cellPx,svg)`
itself (`src/ui/flow.js:227-231`) — check `appState.game.rim.has(c[0]+","+c[1])` and branch the
`fill`/`class` accordingly. This is the ONE place both transports already share (per its own header
comment, "THE ONE PLACE that decides what a sail square looks like"), so a rim-aware branch here
covers both host and guest by construction, with no new parameter needed (the function already
receives `c`, and `appState` is already imported into `flow.js`).

**Cleanup/lifecycle:** both `localPickCell` and `remotePickHighlights` already track their drawn
highlight elements in a local `hs` array, removed together on `done()`
(`hs.forEach(h=>h.remove())`). `sailGhostBoats` should return its created elements so each caller can
concatenate them into the same `hs` array — the ghost boats then disappear exactly when the
highlights do, with no separate cleanup path to keep in sync.

**Imports needed (both zero-cycle-risk, since the import direction `flow.js -> board.js` already
exists and this only adds names to it):** `iconAt` needs adding to `flow.js`'s existing
`import {el, boardCell, ...} from "./board.js"` block (currently missing); `BOAT_IMG` needs adding
to `flow.js`'s existing `import {..., ING_IMG, ...} from "../shared/index.js"` block (currently
missing — verified by reading both files' real import lists).

**D-14 confirmed satisfied by construction:** `sailGhostBoats`/the rim-variant highlight are only
ever invoked from the two CHOSEN-move pick paths (`localPickCell`/`remotePickHighlights`). A storm
push never calls either function — it goes through `animateRimSweepIfAny()`
(`src/ui/flow.js:490-561`), an entirely separate code path with no highlight/pick step at all. No
extra guard is needed to keep storm pushes unwarned; it falls out of which functions get called.

### Pattern 4: Scent derivation (WIND-04)

**Verified against the real `newround` handler** (`src/ui/util.js:310-324`,
`EVENT_NARRATION.newround`): the event already carries `e.dir`, `e.round`, `e.streak`, `e.windStreak`
(all confirmed present in the object literal built at every `ev({t:"newround",...})` call site, e.g.
`src/orchestrator.js:857`). `held=(e.windStreak||1)>=2` is the EXISTING "not a direction change"
test — the scent must slot into the `!held` branch (today: `` `— Round ${e.round}: wind is blowin'
${D} —` ``), leaving the `held` branch (the "still blows"/"won't quit" lines) completely untouched,
exactly as `2026-08-01-wind-scent-descriptors.md` specifies.

**Derivation scheme (pure function of `e.round`, no RNG, satisfies D-19):**
```js
// candidate shape — 7 categories x 5 lines, in the order 20-CONTEXT.md/the todo record them
const SCENT_CATEGORIES = [SUGAR, COCOA, DAIRY, CINNAMON, EGGS, WHEAT, VANILLA]; // 5 lines each

function scentFor(round){
  // never-repeat-category-back-to-back, keyed off round number alone (no memory, no RNG):
  // walking category index by a step coprime with 7 guarantees no two CONSECUTIVE direction-change
  // rounds land on the same category, and every category still gets even rotation over time.
  const catIdx = (round * 3) % SCENT_CATEGORIES.length;      // 3 is coprime with 7
  const cat = SCENT_CATEGORIES[catIdx];
  const lineIdx = round % cat.length;                        // even rotation within the category
  return cat[lineIdx];
}
```
This is a candidate, not a locked implementation — the exact step constant and line-index formula
are Claude's discretion per `20-CONTEXT.md`. The two hard requirements it must satisfy either way:
(1) **no two calls with consecutive `round` values and both landing in the `!held` branch may pick
the same category** — note this must be checked against consecutive **direction-change rounds**, not
consecutive rounds overall, since a `held` round doesn't consume a "turn" in the rotation; whichever
formula is chosen must be verified against that distinction, not just against `round-1` vs `round`
naively; (2) **all 7 categories reachable, no RNG.** A dedicated headless test (see Validation
Architecture) should assert both properties directly rather than trusting the formula by inspection.

**Storm rounds (D-17) are provably unaffected:** the `if(e.storm){...}` branch (`util.js:313-319`)
returns before the `held`/scent logic is ever reached — no code path change needed there at all,
only additive code in the non-storm branch.

**Where it slots in (`src/ui/util.js:320-323`):** the `!held` return currently is
`` return {cls:"roundhdr",txt:`— Round ${e.round}: wind is blowin' ${D} —`}; `` — the scent
interpolates one clause into that same template literal, inside the same em-dash wrapper (D-18),
with no new object shape and no new event field.

**Copy-inventory interaction:** `scripts/extract_narration_lines.js`'s TABLE-source extraction reads
`EVENT_NARRATION`'s own declared KEYS (`newround` is one key) and does not enumerate literal string
branches inside a handler function's body — so adding an internal scent lookup should not register
as a new "site" for `narration_audit_check.js` to track. **Verify this by running `npm test` once
the scent code lands** rather than assuming it (this project has been burned by assuming a
mechanical gate's scope before running it — see Common Pitfalls). Separately, per REQUIREMENTS.md's
milestone-wide constraint 3, the 35 lines must still be recorded against
`.planning/todos/pending/copy-shipped-vs-approved-gate.md` as a process step (D-20 already
pre-approves the exact text, so this is a paper/record step, not a new copy-review round).

### Pattern 5: D-02's narration-timing coupling — the actual handshake

**Verified call-site ordering (identical shape at every `newround` push, e.g.
`src/orchestrator.js:857-861`):**
```js
appState.game.ev({t:"newround", dir:..., dir2:..., streak:..., windStreak:...});
liveRender();                          // -> render() [board.js] -> windDotsTick(angle) TODAY
await flash(describe(...).txt, 900);   // (or, elsewhere, await narrateLastEvent())
```
`liveRender()` (which reaches `render()` and today's synchronous `windDotsTick(angle)` re-aim)
**already runs BEFORE the narration line begins typing** at every call site verified. This means
`board.js` does not need to know anything about WHEN narration starts — it already gets called at
exactly the right moment, before the old dots are removed from view. The only thing it does not
know is WHEN the line finishes typing (to trigger the fade-IN) — that signal genuinely does not
exist in `board.js` today and must come from `panel.js`.

**Recommended change, split by file:**

1. **`board.js`:** `windDotsTick(angle)` compares the incoming `angle` against the currently-applied
   `windAngle`. On a change, it does **NOT** immediately write the `rotate()` transform (today's
   behaviour, called out by the prototype's own comment as the exact bug D-02 corrects). Instead it
   stores the new angle as pending and starts fading the dot layer's opacity toward 0 over a tuned
   duration (D-07-gated constant). Export a new function, e.g. `windDotsApplyPendingDirection()`,
   that — when called — applies the stored `rotate()` transform (safe to do now since opacity is at
   or near 0) and begins fading back in.

2. **`panel.js`:** `flash(msg, ms, holdMs, variants)` (`src/ui/panel.js:1079-1102`) already has TWO
   precedents for gaining an additive, backward-compatible parameter for exactly this purpose —
   `holdMs` (documented: "additive 4th parameter... every existing two-argument call site behaves
   exactly as before") and `variants` (same pattern, one parameter later). The exact point where the
   typewriter reveal is known to have finished is already isolated: `if(el&&el._revealDone)await
   el._revealDone;` (`panel.js:1086`) — immediately after that line, the text is fully on screen
   ("the line lands"). Add a 5th additive parameter, e.g. `onRevealDone` (an optional callback),
   invoked right after that `await`. `panel.js` already imports FOUR names from `board.js`
   (`render, boardCell, boardShipEls, chatBubbles, ...` — `panel.js:38-40`), so importing
   `windDotsApplyPendingDirection` alongside them is a zero-new-risk addition (this import direction
   already exists; `board.js` must NOT import from `panel.js` in return, for the same cycle reason
   as Pattern 1 above — confirmed `board.js`'s own import list has no `panel.js` entry today).

3. **`narrateLastEvent()`** (`panel.js:1018-1038`) already reads `e` (the just-pushed event) at its
   very top. It is the natural place to detect "this is a `newround` event AND `!held`" (a genuine
   direction change) and pass `windDotsApplyPendingDirection` as `flash`'s new 5th argument only in
   that case — every other `flash()`/`narrateLastEvent()` call site (attacks, dodges, trades, every
   other event type) passes nothing new and behaves byte-identically to today.

**Round-1 edge case, worth flagging (not a blocker):** round 1's `newround` event also has
`windStreak===1` (`!held` is true — there's no prior round to compare against), so the
direction-change detector will also fire on round 1, when there are no dots yet to fade out. This is
harmless (fading an empty pool, then building fresh dots, is a no-op visually) but should be verified
once, not assumed.

**Storm interaction:** D-01 (storm fade) and D-02 (direction-change fade) can coincide — a storm
often starts on a round that is ALSO a direction change. Recommend a single combined opacity
multiplier on the dot layer (`opacity = stormFactor * directionChangeFactor`, each independently
driven toward 0 or 1 by its own trigger) rather than two separate opacity writers that could race or
overwrite each other — this is the same "one authority per visual property" reasoning the codebase
already applies elsewhere (e.g., `windReducedMotion` gating the transform-writing branch as a single
switch rather than multiple conditional writers).

### Anti-Patterns to Avoid
- **Importing `flow.js`'s rim-sweep curve helpers into `board.js`.** Verified cycle
  (`module_graph_check.js` will hard-fail `npm test`). Build a small local interpolation instead.
- **Drawing the whirlpool's rotating art as an SVG child.** D-25's Chrome-measured rule applies
  identically here; use the HTML-overlay + CSS-keyframes approach in Pattern 2.
- **Leaving the static SVG `TRADE_SWIRL_IMG` drawn underneath a new rotating HTML overlay.** Doubled
  image. Stop drawing it at quadrant-head cells once the HTML overlay exists.
- **Writing a per-frame JS rotation loop for the whirlpools.** Unnecessary cost — a static position
  plus a constant-rate rotation is exactly what CSS `@keyframes` is for, at zero JS cost per frame.
- **Coupling WIND-02's speck motion to the round's wind DIRECTION.** The channel's flow direction
  is fixed per-game (clockwise, from board layout), not tied to the compass wind — confirmed by
  D-10's own explicit contrast with D-01.
- **Applying D-02's fade to the channel specks or whirlpool rotation.** D-10 explicitly makes the
  rim's storm/direction behaviour the OPPOSITE of the dots'.

## Don't Hand-Roll

Not applicable in the "use a library instead" sense — this phase is inherently custom animation
code with no vanilla-JS library that would help (the project has zero dependencies by design). The
relevant version of this section is: **reuse the codebase's own existing pure geometry rather than
re-deriving it a second time**, specifically:
- WIND-05's rim geometry (`rimSweepPath`, `game.rimHead`) — already pure, exported, tested. D-15
  is explicit: do not rebuild it.
- WIND-01's fade-envelope SHAPE (quarter-cosine ease, `windDotFrame`'s `D-02.1` logic) is a proven,
  Wyatt-approved easing curve — reuse the same shape for the specks' spiral-vanish fade rather than
  inventing a new curve.

**Key insight:** the two places this phase DOES need new geometry (the speck arc waypoints, the
whirlpool's fixed screen position) are both trivial derivations from data the engine already builds
and exposes (`game.rimCellInfo`, `game.rimHead`) — there is no missing engine capability here, which
is worth stating plainly against D-21's "if this needs an engine change, STOP" rule: **it does not.**

## Common Pitfalls

### Pitfall 1: D-04's static radial-gradient dot styling will trip the existing compositor guard
**What goes wrong:** `wind_dot_contract_check.js`'s assertion 2 (`checkCompositorOnly`,
`scripts/wind_dot_contract_check.js:216-239`) bans the bare substring `"gradient"` ANYWHERE inside
the wind-dot marker region — textually, not semantically. It does not distinguish a STATIC
`background: radial-gradient(...)` (D-04's explicitly-endorsed "soft edge," which rasterizes once
and never re-rasterizes) from BUG-01's actual failure mode (a LIVE gradient animated together with a
mask). Writing D-04's soft-edge dots inside the guarded region as written today produces an
immediate, misleading `npm test` failure that reads like a real compositor-safety violation.
**Why it happens:** the guard was written for Phase 19's scope, where no gradient of any kind was
ever expected inside the region — a blanket ban was the simplest correct rule at the time.
**How to avoid:** in the SAME commit that adds the radial-gradient dot styling, narrow assertion 2's
forbidden-term list. Recommendation: drop the bare `"gradient"` ban and keep `"mask"`, `"blur("`,
`"filter:"`, `"box-shadow"`, `"backdrop"` (the terms that were ACTUALLY part of BUG-01 — a masked,
animated gradient with a blur filter) — a static, unmasked, unanimated `radial-gradient` used only
as a fill was never the danger. This is a deliberate, documented change to a safety guard's rule,
not a silent weakening — record the reasoning in the script's own header comment, matching its
existing convention of explaining every rule's origin.
**Warning signs:** `npm test` fails with `WINDDOT-COMPOSITOR: ... contains forbidden substring
"gradient"` immediately after adding the dot styling, even though the styling is compositor-safe.

### Pitfall 2: D-06 deletes a constant the guard's assertion 5 requires — a predictable, deterministic red
**What goes wrong:** `checkOffByDefault` (`scripts/wind_dot_contract_check.js:298-309`) fails the
whole test suite unless `WIND_PROTOTYPE_ENABLED_DEFAULT = false` is present verbatim in `board.js`.
D-06 explicitly removes this constant (and the `?wind=1`/`pp_wind_proto` gating it controlled) — the
dots ship always-on. Once the enable-flag is deleted but `windDotSpecs`/`windDotFrame` (the guard's
`TRIGGER`) remain, assertion 5 fails forever until the script itself changes.
**Why it happens:** the guard's assertion 5 encoded a Phase-19-specific requirement (dots must ship
OFF by default) that Phase 20 deliberately reverses by design (D-06).
**How to avoid:** remove or repurpose assertion 5 in the SAME commit that deletes
`WIND_PROTOTYPE_ENABLED_DEFAULT` — this is not optional cleanup, it is a required, coupled edit.
**Warning signs:** `npm test` fails with `WINDDOT-OFF-BY-DEFAULT: ... does not set
WIND_PROTOTYPE_ENABLED_DEFAULT = false` the moment the always-on dots land.

### Pitfall 3: the marker-region guard is exactly the mechanism D-06 warns must not be left "silently passing over deleted code"
**What goes wrong:** if the `WIND DOT PROTOTYPE (Phase 19 / WIND-00) BEGIN/END` marker comments are
simply DELETED along with the measuring-rig code (dial, HUD, readout, meter) without a replacement,
`checkRegionIntegrity` (assertion 1) reports `present:false` with the note `"(region not present
yet)"` — and assertions 2/3/5/6 all then report a silent, honest-looking PASS with the SAME note,
because they are deliberately absence-tolerant (written that way BEFORE the prototype code existed,
per the script's own header). This is precisely D-06's warned failure mode: a guard that passes not
because the code is safe, but because there is no longer anything for it to check.
**Why it happens:** the absence-tolerance was correct and necessary when the script was written
(before any wind-dot code existed) — it becomes a trap once real, shipped code exists and the
markers are removed without the guard being told what replaced them.
**How to avoid:** keep the BEGIN/END markers (rename them to reflect shipped status, e.g. "WIND
LAYER (Phase 20 / WIND-01..03) BEGIN/END" — but update the script's `BEGIN_MARKER`/`END_MARKER`
string constants in the SAME commit, since the guard matches exact byte-for-byte comment text).
Consider widening the marked region to also wrap the new channel-speck and whirlpool code, so ONE
mechanical guard continues enforcing compositor-safety (Pitfall 1's narrowed assertion 2) and
determinism (assertion 3, unchanged — `mulberry32` must still be present, `.r()`/`Math.random()`
still banned) over everything WIND-01/02/03 ship, not just the dots.
**Warning signs:** `npm test` reports every wind-related assertion as PASS with a `"(region not
present yet)"` note after a change that was supposed to ship real, guarded code.

### Pitfall 4: `narration-two-schedulers-unenforced.md` is exactly the risk D-02's coupling touches
**What goes wrong:** `flash()` and `showNarration()` are documented (per the standing todo at
`.planning/todos/pending/narration-two-schedulers-unenforced.md`) as two independent hold/fade
schedulers writing the same `.apMsg` element, "benign today but unenforced" because the paths that
reach each one do not currently interleave. D-02's new `onRevealDone` hook is being added to
`flash()` specifically — if a FUTURE change ever routes a `newround` narration through
`showNarration()` instead of `flash()` (they are documented as parallel, not unified), the wind-dot
fade-in would silently stop firing with no error.
**Why it happens:** this is a pre-existing, previously-flagged structural risk in the file this
change lands in, not something this phase introduces — but this phase is the first consumer that
would silently break if the risk materializes.
**How to avoid:** do not attempt to unify the two schedulers as part of this phase (the todo
explicitly recommends this be done "on its own," separately, with its own gate) — but DO verify,
once implemented, that every `newround` narration call site in the actual call graph (verified
above: `orchestrator.js:857-861`/`883-885`, and any `narrateLastEvent()` call) reaches `flash()`,
not `showNarration()`. This project's own narration audit tooling
(`scripts/extract_narration_lines.js`) can confirm which function each newround-adjacent call site
uses.
**Warning signs:** dots fade out on a direction change but never fade back in on some (not all)
playthroughs — a symptom of hitting the unenforced second scheduler path.

### Pitfall 5: variable-length rim arcs
**What goes wrong:** assuming each of the 4 rim arcs has the same cell count (e.g. hardcoding "9
cells per arc" from 36÷4) will silently break on games where one arc is much longer than another
(confirmed in the engine: "occasionally one arc spans nearly half the rim," `src/engine/index.js:73`
comment).
**Why it happens:** 36÷4=9 is a tempting but wrong simplification; the engine randomizes arc
boundaries with only a 3-cell minimum per arc, not equal quarters.
**How to avoid:** always derive the waypoint list from `game.rimCellInfo.filter(c=>c.q===q)` at
runtime, never from an assumed count.

## Code Examples

### Deriving one arc's waypoints (WIND-02), verified against real engine output shape
```js
// game.rimCellInfo: [{k,x,y,deg,q}, ...] — already clockwise, already contiguous by q.
// (src/engine/index.js:86-91)
function arcWaypointsPx(rimCellInfo, q, cell) {
  return rimCellInfo
    .filter(c => c.q === q)
    .map(c => [(c.x + 0.5) * cell, (c.y + 0.5) * cell]); // same px conversion drawBoard() uses
}
```

### Injecting the whirlpool's @keyframes without touching index.html (WIND-03)
```js
// board.js — runs once, lazily, mirroring windEnsureLayer()'s create-if-missing pattern
function ensureWhirlKeyframes() {
  if (document.getElementById("windWhirlKeyframes")) return;
  const style = document.createElement("style");
  style.id = "windWhirlKeyframes";
  style.textContent = "@keyframes windWhirlSpin{to{transform:rotate(360deg)}}";
  document.head.appendChild(style);
}
```

### The sailGhostBoats() shape (WIND-05), matching the two verified call sites
```js
// src/ui/flow.js, beside sailHighlightRect() — G25's precedent, applied a second time
export function sailGhostBoats(cells, seat, cellPx, svg) {
  const seen = new Set(), els = [];
  for (const c of cells) {
    const k = c[0] + "," + c[1];
    if (!appState.game.rim.has(k)) continue;
    const head = appState.game.rimHead[k];
    if (!head) continue;
    const hk = head[0] + "," + head[1];
    if (seen.has(hk)) continue;         // D-13: one ghost per DISTINCT arc head, not per rim cell
    seen.add(hk);
    const g = iconAt(svg, (head[0]+.5)*cellPx, (head[1]+.5)*cellPx, cellPx, BOAT_IMG[seat]);
    g.setAttribute("opacity", "0.4");   // exact value: Claude's discretion / D-07-adjacent taste call
    els.push(g);
  }
  return els; // callers concat into their own `hs` cleanup array
}
```

## State of the Art

Not applicable — this is entirely internal codebase evolution (Phase 19 prototype -> Phase 20
shipped feature), not an external-ecosystem question.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The exact scent derivation formula (`round*3 % 7`, `round % catLen`) satisfies the no-repeat-category rule for every real sequence of direction-change rounds, not just consecutive integers | Pattern 4 (Scent derivation) | Low — flagged as a candidate needing its own headless test before being trusted; the formula is illustrative, not locked |
| A2 | Narrowing `wind_dot_contract_check.js` assertion 2 to drop the bare `"gradient"` ban (keeping mask/blur/filter/box-shadow/backdrop) fully closes the BUG-01 risk class without reopening it | Pitfall 1 | Medium — this is a safety-guard rule change; worth a one-line confirmation from Wyatt at plan-review time even though it is mechanically sound, since it modifies a rule he specifically asked to be kept meaningful (D-06) |
| A3 | Ghost boat opacity (~0.4) and exact fade/rotation-duration constants are unspecified and explicitly deferred to Wyatt's taste via the D-07/D-29 tuning gate — no default is asserted as "correct" here | Pattern 3, Pattern 2 | Low — these are explicitly Claude's-discretion-then-Wyatt's-approval values per CONTEXT.md, not researched facts |
| A4 | `narrateLastEvent()`/`flash()` is the ONLY code path a `newround` narration line travels through in the current call graph (not `showNarration()`) | Pitfall 4 | Medium — verified for every call site grepped in this session, but not exhaustively proven; recommend a quick confirmation pass before relying on it |

## Open Questions

1. **Should the whirlpool/speck tuning constants be plain module-level `const` (frozen, like today's
   `WIND_WOBBLE_MAX_PX` etc.) or live values with setter functions (like `windDotCount`/
   `windSetDotCount`) so the D-07/D-29 tuning page can adjust them live without a reload?**
   - What we know: the existing dot constants are frozen `const`s; only `windDotCount` (the dial
     value) is a live, settable module variable.
   - What's unclear: whether the tuning page needs LIVE adjustment (sliders that visibly change the
     board in real time) or just a way to preview candidate values and hand-copy the final numbers
     into the constants before shipping — the CONTEXT.md language ("he tweaks sliders until the dots
     feel right; the numbers he lands on become the shipped constants") reads as compatible with
     either.
   - Recommendation: default to the live-setter pattern (mirrors `windSetDotCount`'s proven UX) for
     all three slider groups, since it is the one already proven to work well for Wyatt's own
     approval workflow in Phase 19.

2. **Exact ghost-boat opacity, fade durations, whirlpool rotation duration range placement within
   8-12s, and channel speck density are all genuinely undetermined numbers**, correctly deferred to
   the D-07/D-29 human-approval gate rather than guessed here.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Chrome (any recent) | Sequencing/layout verification per `docs/DRIVING-THE-GAME.md` §8a | Assumed available on the executing machine | — | — |
| Real Safari (macOS/iOS) | Final human-verify pass (this phase's biggest risk area per REQUIREMENTS.md constraint 2) | Wyatt-only, per project convention — "Wyatt runs the Safari verdict on his own machine" | — | None — this is a hard human-verify gate, not automatable, consistent with Phase 19's own precedent |
| `python3 -m http.server` | Local serving for browser verification | Standard on this project's dev machine (used throughout `docs/DRIVING-THE-GAME.md`) | — | — |

No new external service, API, or package dependency is introduced by this phase.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Custom Node scripts (no Jest/Vitest/Mocha) — plain `console.log`, `process.exit(failures?1:0)`, one PASS/FAIL line per assertion. Convention shared across `scripts/*_check.js`/`scripts/*_test.js`. |
| Config file | None — each script is a standalone executable, chained via `package.json`'s `"test"` script |
| Quick run command | `node scripts/wind_dot_contract_check.js` (single guard, fast) |
| Full suite command | `npm test` (chains ~20 scripts, verified via `package.json:7`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WIND-01 | `windDotSpecs`/`windDotFrame` extended with `period`/`size` fields remain reproducible, seed-sensitive, bounded | unit (pure-math) | `node scripts/wind_dot_contract_check.js` (assertion 6, generic — does not check exact field names) | ✅ existing, extends automatically |
| WIND-01 | Compositor-only contract holds over the shipped (not deleted-region) code, including the new static radial-gradient | unit (mechanical scan) | `node scripts/wind_dot_contract_check.js` (assertion 2, **must be narrowed first** — Pitfall 1) | ⚠️ needs the assertion-2 edit in the same commit |
| WIND-01 | Always-on-by-default behaviour (D-06) doesn't regress into off-by-default | unit (mechanical) | `node scripts/wind_dot_contract_check.js` (assertion 5, **must be removed/repurposed** — Pitfall 2) | ⚠️ needs the assertion-5 edit in the same commit |
| WIND-02 | Speck arc-waypoint derivation and per-frame position function are reproducible/seed-sensitive/bounded | unit (pure-math) | New: `node scripts/wind_speck_test.js` (mirror assertion 6's pattern) OR widen `wind_dot_contract_check.js`'s region/assertions to cover it | ❌ Wave 0 gap |
| WIND-03 | Each whirlpool's seeded rotation duration falls in [8,12]s, is reproducible for a given seed | unit (pure-math) | New, small — a pure function `whirlDurationSec(seed,idx)` is trivially testable the same way | ❌ Wave 0 gap |
| WIND-04 | Scent selection: no two consecutive direction-change rounds share a category; all 7 categories reachable; zero RNG draws | unit (pure-function) | New: assert against a real sequence of round numbers with mixed `held`/`!held` values, not just consecutive integers (Assumption A1) | ❌ Wave 0 gap |
| WIND-05 | `sailHighlightRect`'s rim-variant and `sailGhostBoats`'s distinct-head de-duplication produce identical output for host and guest given the same `cells`/`seat` | unit (pure-function), extending existing host/guest parity precedent | `node scripts/host_guest_parity_check.js` (existing script already asserts `sailHighlightRect` parity — add an assertion for the new rim-variant + `sailGhostBoats`) | ⚠️ existing file, needs a new assertion |
| D-02 | `windDotsTick`/`windDotsApplyPendingDirection` exist as exports and the pending-angle defer logic doesn't crash on rapid repeated direction changes | unit (smoke) | Extend `wind_dot_contract_check.js`'s pure-math section, or a small dedicated smoke test | ❌ Wave 0 gap (mechanism is new) |
| D-02 (visual) | Fade timing actually overlaps narration typing on screen | manual-only, justified | Human-verify via Chrome sequencing capture (`docs/DRIVING-THE-GAME.md` §8a-adjacent technique, NOT the cost-measurement half) + Wyatt's own eyeball pass, same as Phase 19's `19-VERDICT.md` precedent (measured by eye, "good enough: the question was does this stutter/pop") | — |

### Sampling Rate
- **Per task commit:** `node scripts/wind_dot_contract_check.js` (fast, targeted)
- **Per wave merge:** `npm test` (full chain — catches the two deterministic-red pitfalls above
  immediately if either edit was forgotten)
- **Phase gate:** Full suite green before `/gsd-verify-work`, PLUS Wyatt's D-07/D-29 tuning-page
  sign-off (a human gate `npm test` cannot substitute for), PLUS the real-Safari human-verify pass
  REQUIREMENTS.md's milestone-wide constraint 2 requires for any always-on wind-layer work.

### Wave 0 Gaps
- [ ] `scripts/wind_speck_test.js` (or a widened region in `wind_dot_contract_check.js`) — covers
  WIND-02's pure geometry/frame functions
- [ ] A pure `whirlDurationSec(seed,idx)`-style test — covers WIND-03's seeded duration draw
- [ ] A scent-derivation test asserting the no-repeat-category property across REAL round sequences
  (not just consecutive integers) — covers WIND-04
- [ ] `host_guest_parity_check.js` — new assertion(s) for the rim-variant `sailHighlightRect` branch
  and `sailGhostBoats` — covers WIND-05
- [ ] `wind_dot_contract_check.js` assertion 2 narrowed (Pitfall 1) and assertion 5
  removed/repurposed (Pitfall 2) — both REQUIRED, not optional, or `npm test` breaks on
  implementation of already-locked decisions (D-04, D-06) for reasons unrelated to any real defect

## Security Domain

`security_enforcement` is enabled in `.planning/config.json` (`security_asvs_level: 1`). This phase
has effectively no attack surface: it adds no new user input, no new network payload, no new
authentication/authorization surface, and — per D-21 — no engine change at all.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Unrelated — no auth surface touched |
| V3 Session Management | No | Unrelated |
| V4 Access Control | No | Unrelated — the game already treats bots/humans identically (D-27); nothing here changes who can do what |
| V5 Input Validation | No new surface | No new user-controlled input is introduced. WIND-04's scent line is derived purely from server/engine-controlled event fields (`dir`, `round`, `streak`, `windStreak`) that are never player-supplied text — no injection surface. `sailGhostBoats`/rim-highlight logic reads only `appState.game.rim`/`rimHead` (engine-built), not user input. |
| V6 Cryptography | No | Unrelated |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Host/guest presentation drift (a guest sees a materially different, possibly misleading, board state than the host) | Spoofing (of the game's own presentation layer, not a security boundary in the traditional sense, but a correctness/trust concern this codebase treats seriously — see G25/D-55) | Shared-builder pattern: `sailHighlightRect`/`sailGhostBoats` are the ONE function each transport calls, mechanically gated by `scripts/host_guest_parity_check.js` |
| Determinism-fixture invalidation from an accidental engine RNG draw | Tampering (of the deterministic replay/fixture guarantee, not user data) | D-21/D-22's private-`mulberry32`-only rule, mechanically gated by `wind_dot_contract_check.js` assertion 3 and this phase's own new tests |

**No `checkpoint:human-verify` package-installation gate is needed** — no packages are installed.
The human-verify gates that DO apply are the pre-existing project ones (D-07/D-29 tuning approval,
real-Safari pass) already covered under Validation Architecture above.

## Sources

### Primary (HIGH confidence — read directly this session)
- `src/ui/board.js:1-60, 90-354, 439-1080` — file header, `drawBoard()`, `stormLayerSpecs()`/
  `buildStormLayers()`, the full WIND DOT PROTOTYPE region
- `src/ui/flow.js:44-490` — imports, `reachable()`, `sailHighlightRect()`, `localPickCell()`,
  `rimSweepPath()`, `rimSweepCurve()`, `rimSweepPointAt()`, `animateRimSweepIfAny()`
- `src/ui/flow.js:1740-1785` — `remotePickHighlights()`
- `src/ui/util.js:280-330` — `EVENT_NARRATION.newround` and neighbouring branches
- `src/ui/panel.js:34-48, 780-1102` — imports, `typewriterReveal()`, `showNarration()`,
  `narrateLastEvent()`, `flash()`
- `src/engine/index.js:56-92` — the round-board rim/arc/head construction (D-21 read-only)
- `src/shared/index.js:1-40` — `mulberry32`, asset path constants
- `scripts/wind_dot_contract_check.js` (full file) — every assertion's exact rule, read to verify
  the Pitfall 1/2/3 findings rather than assumed
- `scripts/module_graph_check.js:1-160` — the cycle-detection and tier-shape assertions, read to
  verify the `flow.js`-into-`board.js` import-cycle finding
- `scripts/narration_audit_check.js`, `scripts/extract_narration_lines.js` (headers) — the
  copy-inventory tooling's scope, read to assess WIND-04's interaction with it
- `package.json:7` — the exact `npm test` chain and script order
- `docs/DRIVING-THE-GAME.md` (full file) — driving/measurement methodology, §8a's cost-vs-layout
  distinction
- `.planning/workstreams/board-wind/phases/19-safari-check/19-VERDICT.md` — the Phase 19 gate's
  answer (PASS, no dot budget)
- `.planning/todos/pending/2026-08-01-wind-scent-descriptors.md` — the 35 lines and the
  determinism constraint, verbatim
- `.planning/todos/pending/narration-two-schedulers-unenforced.md` — the pre-existing risk this
  phase's D-02 coupling touches
- `.planning/workstreams/board-wind/phases/20-the-board-comes-alive/20-CONTEXT.md`,
  `REQUIREMENTS.md`, `STATE.md`, `ROADMAP.md` — full read, this phase's locked decisions and scope

### Secondary (MEDIUM confidence)
- None — no web search was performed this session (no search providers enabled in
  `.planning/config.json`, and the scoped research questions were all internal-codebase mechanism
  questions answerable by reading source).

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- WIND-02/03/05 mechanism recommendations: HIGH — every claim traces to a specific file:line read
  this session, including the import-cycle finding (verified against the actual cycle detector) and
  the two guard-breakage pitfalls (verified against the actual assertion logic).
- WIND-04 derivation: HIGH on the constraint (never `this.r()`, key off `round`, verified against
  real event fields); MEDIUM on the exact formula (explicitly offered as a candidate, not a lock).
- D-02 narration coupling: MEDIUM-HIGH — the call-graph ordering and the `flash()` additive-parameter
  insertion point are verified against real code; the overall design (defer-then-signal) has no
  exact precedent in this codebase, so it is engineered from verified primitives rather than found
  already working.
- D-06 guard retirement: HIGH — both breakage points were found by reading the guard's source, not
  inferred.

**Research date:** 2026-08-02
**Valid until:** Effectively pinned to this phase — the mechanisms described are tied to the exact
current shape of `board.js`/`flow.js`/`panel.js`/`wind_dot_contract_check.js`. Re-verify file:line
references if a large, unrelated refactor lands in any of these files before Phase 20 executes.
