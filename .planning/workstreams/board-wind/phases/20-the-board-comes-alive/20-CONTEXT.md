# Phase 20: The Board Comes Alive - Context

**Gathered:** 2026-08-02
**Status:** Ready for planning
**Workstream:** `board-wind` · **Requirements:** WIND-01 … WIND-05

<domain>
## Phase Boundary

The sea stops looking like a still picture. Five deliverables, all of them visual except the last:

- **WIND-01** — drifting wind dots on every non-storm turn, with none of the storm's darkening.
- **WIND-02** — the trade-wind rim channel reads as flowing into the whirlpool rather than sitting still.
- **WIND-03** — each whirlpool rotates, so it reads as the thing that stops the wind.
- **WIND-04** — a pastry scent on every wind **direction change**, from Wyatt's 35-line library; a
  repeated direction runs the existing "still blows / gusting" line unchanged.
- **WIND-05** — a ship gets a visual signal *before* it is swept into the trade winds, and where the
  ride ends.

**This phase starts from working code.** Phase 19's prototype (the wind-dot layer in
`src/ui/board.js`, behind `?wind=1`) passed its Safari gate and is Phase 20's starting point per
D-10 of `19-CONTEXT.md`.

**Explicitly NOT in this phase:**
- Any engine change. `src/engine/index.js` is untouched and what it emits is unchanged (D-11).
- A player-facing settings menu. The game has none today; inventing one is its own phase.
- The watercolor restyle of the arrow and whirlpool art. That is a later milestone, and it keeps the
  same size and shape, so animation tuning done here survives the repaint.

</domain>

<decisions>
## Implementation Decisions

### WIND-01 — the wind dots

- **D-01: Storms.** The dots **fade out as a storm arrives and fade back when it passes** (roughly a
  second each way). The board never carries both effects at full strength, and neither pops. This
  supersedes the prototype's behaviour, which deliberately ran the dots straight through storms in
  order to prove the layer held while storms came and went.

- **D-02: A direction change fades the dots out and back — and it is timed to the round line.**
  Wyatt, unprompted, 2026-08-02: *"the dots should also fade out when the wind direction changes."*
  Dots die away **as the new round line types out**, the layer silently re-aims while nothing is
  visible, and a fresh field fades in on the new heading **once the line lands**.
  **This is a correction to shipped prototype behaviour, not an addition.** The prototype applies the
  wind direction as a rotation on the whole `.wlayer`, and its own comment calls out that *"a
  direction change re-aims every dot with no restart"* — i.e. today the entire field would visibly
  swivel in place. That must not ship. — **Reversibility:** reversible — the fade is a layer-level
  opacity envelope; the rotation logic underneath is unchanged.

- **D-03: Each dot needs its own sway period.** Wyatt: *"the dots should slowly drift side to side as
  they go, as if the breeze isn't consistent — potentially like a sine wave, if that's cheap, or an
  approximation of it if that's not. a cheap animation like blowing dust particles — they don't all
  rush one way at once."*
  **The sway is already a sine wave** (`windDotFrame`, `src/ui/board.js:560`). The problem he is
  describing is real and diagnosable: `WIND_WOBBLE_PERIOD_MS` is a **single shared constant (2600ms)**
  (`src/ui/board.js:469`), so every dot sways on the same rhythm, differing only in starting phase
  and amplitude — the field breathes in lockstep. **Fix: draw a per-dot period from the seeded
  stream**, exactly as `speed` and `wobbleAmp` already are. One more `rnd()` call per dot in
  `windDotSpecs`, no runtime cost.
  ⚠ Adding a field changes `windDotSpecs`' fixed draw order — keep the documented order and append,
  and update the comment that records it.

- **D-04: Dot look — soft white specks, varied sizes.** Each dot gets its own size (roughly 4–10px)
  and a soft edge, so the layer reads as depth rather than a grid of identical pips. Size is drawn
  once per dot from the seeded stream. **No new art asset** — still a drawn shape. (Today every dot
  is an identical 7px flat white circle at 72% opacity.)
  ⚠ "Soft edge" must **not** be a blur filter. Blur over the board is precisely the BUG-01 killer
  (`index.html:92-116` carries the post-mortem). A static `radial-gradient` background on a ~7px
  element rasterizes once and never re-rasterizes; a `filter: blur()` does not.

- **D-05: Layering — over everything.** Dots pass in front of the islands **and the ships**, as if
  blowing between the player and the board. Wyatt chose this over the safer "behind the ships"
  option. — **Reversibility:** reversible — a z-index/stacking change.

- **D-06: The prototype's measuring rig is deleted.** The bottom-right panel, the 0–100 dial, the
  live smoothness readout, the `will-change` toggle, the frame meter and the end-of-voyage frame
  summary all come out. The dots ship **always-on** at the D-02 target density of 5–10, with no
  player-facing control (the game has no settings menu, and adding one is out of scope).
  **The `prefers-reduced-motion` branch stays**, and so does the reduced-motion bug fix Phase 19
  found — a dot whose first position is never written sits outside the clipped layer and is
  invisible, which is how reduced-motion users saw *nothing* rather than "dots holding still."
  ⚠ `scripts/wind_dot_contract_check.js` is wired into `npm test` and greps the region between the
  `WIND DOT PROTOTYPE … BEGIN/END` markers. Removing the prototype scaffolding must keep that guard
  meaningful (the compositor-safety rule it enforces still applies) or deliberately retire it —
  **it must not be left silently passing over deleted code.**

- **D-07: A tuning page is a GATE on WIND-01.** Wyatt: *"you can also spin up a version of rain.html
  for me to tweak and approve the dots, please."* The page gets built **first**; he tweaks sliders
  until the dots feel right; **the numbers he lands on become the shipped constants**; nothing else
  in WIND-01 finishes until he has signed off. The page is throwaway — it does not have to survive
  the phase.
  ⚠ **There is no `rain.html` in this repo.** The nearest thing is `lab.html`, a 121KB *pre-refactor
  standalone* that does **not load `src/ui/board.js` at all** (this exact trap is recorded as D-08 in
  `19-CONTEXT.md`). The tuning page **must import the real `windDotSpecs` / `windDotFrame` from
  `src/ui/board.js`**, or Wyatt would be approving code that is not what ships.
  ⚠ When the page is ready, **the URL with its port goes in the same message that asks him to look at
  it.** He should never have to scroll back or guess.
  — **Reversibility:** reversible — a throwaway page; but the approval it produces is a hard gate.

### WIND-02 / WIND-03 — the rim channel and the whirlpools

- **D-08: "Flowing" means specks ride the channel; the arrows hold still.** The 36 arrow icons stay
  exactly where they are, as signage marking the current. **Small specks travel along the channel
  through them, spiral into the whirlpool, and vanish.** "Into the whirlpool" becomes literal — you
  watch things get swallowed. Wyatt chose this over marching the arrows themselves.
  **This reuses the dot machinery being approved in D-07**, so it inherits a proven-cheap technique
  rather than inventing a second one.

- **D-09: The whirlpools turn slowly and constantly, clockwise** — matching the channel's direction,
  roughly **one revolution every 8–12 seconds**. Slow enough to read as a deep ocean drain rather
  than a spinning icon, and it never stops. Wyatt rejected both a faster churn and a
  spin-up-when-a-ship-is-swept reaction.

- **D-10: The rim never stops — including during storms.** Channel specks and whirlpool rotation keep
  running through a storm. Rationale in Wyatt's chosen option: the trade winds are a permanent
  feature of the board, not this turn's weather, and sailing onto the rim still flings you either
  way. **Note this is deliberately the opposite rule to D-01's dots** — the two layers behave
  differently in a storm on purpose.

- **D-11: Measured board facts the planner should not re-derive.** The live grid is `15×15` (from
  `roundCfg`, `src/engine/index.js:819`): **177 water cells, 40 rim cells — 36 arrows + 4 whirlpool
  swirls.** Rim cells are rendered from `game.rimCellInfo` at `src/ui/board.js:173-183`; a cell that
  is a quadrant head draws `TRADE_SWIRL_IMG`, every other draws `WIND_ARROW_IMG` rotated to the
  clockwise tangent (`c.deg+90`).

### WIND-05 — the rim-sweep warning

- **D-12: The warning lives in the move highlights, not in a hover or a confirm.** Any rim square in
  the player's move highlights gets an **obviously different treatment** — a swirl or warning tint
  rather than the friendly "sail here" bounce — **and the landing square is marked at the same time.**
  The whole ride is legible before committing, with no extra tap.
  **Why nothing else works:** picking a square is **one tap that commits immediately**
  (`localPickCell`, `src/ui/flow.js:250-271` — the highlight's own click handler resolves the move;
  there is no confirm step), and **there is no hover on a phone.** Any preview-on-hover design would
  serve desktop only. Wyatt explicitly rejected adding a rim-only confirm step.

- **D-13: The landing square shows a ghost of the player's own boat.** A faded version of their ship
  sits on the drop-off square while rim highlights are showing — instantly readable as "this is where
  you end up", with no legend, reusing existing boat art. **If two arcs are in range, two ghosts
  appear.** Wyatt rejected adding a dotted trail tracing the arc (it would compete with the channel's
  own arrows and specks).

- **D-14: Chosen moves only — a storm push gets no warning.** If a storm blows a ship onto the rim,
  nothing is signalled beforehand and no ghost appears. Wyatt's reasoning, in his chosen option: a
  storm push is meant to be something that happens *to* you, and the existing sweep animation already
  shows the ride. Keeps the phase tight.

- **D-15: The geometry already exists — do not rebuild it.** `rimSweepPath(game, from)`
  (`src/ui/flow.js:379`) returns the ordered rim cells a sweep passes through; `game.rimHead[key]`
  gives the landing cell; `rimSweepCurve` / `rimSweepPointAt` / `rimSweepDurationMs` already animate
  the boat along it. All are **pure and exported specifically so they can be tested** — the ghost
  boat's position is a `rimHead` lookup, nothing more.

### WIND-04 — the pastry scent

- **D-16: Purely decorative.** Any of the 35 lines, selected from the round number, never repeating a
  category back-to-back. The scent is atmosphere and asks nothing of the player; all 7 categories
  stay in even rotation so the whole library gets used. **This closes the open question the todo
  explicitly reserved for Wyatt** (*"whether the scent should ever relate to the round"*). He
  rejected both tying it to the downwind island and nudging it toward missing recipe ingredients —
  the latter because different players at the same table would smell different things on the same
  round, breaking the shared-table feeling.

- **D-17: Storm rounds keep their own line, unscented.** A storm round is technically a direction
  change, but the storm branch (`src/ui/util.js:313-318`) runs untouched. A storm smells of rain, not
  toffee, and that line already carries two directions.

- **D-18: The scent sits inside the existing em-dash wrapper.**
  `— Round 3: wind is blowin' north, wafting clouds of cotton candy —`
  The round header keeps looking like every other round header; only the words change. Wyatt's
  original sketch used a full stop and no dashes (*"Round 3: wind is blowin' north, wafting clouds of
  cotton candy."*) — **he chose the em-dash form deliberately in discussion**, so the dashes are
  correct and are not a transcription error.

- **D-19: Selection AND the no-repeat rule are both DERIVED — never remembered, never rolled.**
  - **Never `this.r()`.** One extra draw shifts every subsequent draw and invalidates all 31
    determinism fixtures. Derived, this ships in the visual milestone instead of the gated v1.4
    re-record. — **Reversibility:** one-way — an RNG draw here forces the 31-fixture re-record.
  - **No module-level "last category" variable.** That would desync a guest who joined late or a
    client mid-replay. Key the no-repeat off the round number so it is reproducible from the event
    alone.
  - Available inputs, all already serialized on `newround`: `dir`, `round`, `streak`, `windStreak`.

- **D-20: The 35 lines ship exactly as Wyatt wrote them.** His text is the text. The library is in
  `.planning/todos/pending/2026-08-01-wind-scent-descriptors.md` under "The library".

### Cross-cutting — carried forward, locked, do NOT re-litigate

- **D-21: Nothing in v1.3 touches `src/engine/index.js` or changes what it emits.** If this phase
  finds it needs an engine change, **STOP and re-scope.** — **Reversibility:** one-way — forces the
  31-fixture determinism re-record, a one-shot job explicitly scheduled for v1.4.

- **D-22: All decoration randomness comes from a private seeded `mulberry32`, never `game.r()`** —
  seeded from the game seed; the pattern `stormLayerSpecs()` and `windDotSpecs()` already use. This gives
  every player in a room identical dots and specks while consuming nothing from the game stream.
  — **Reversibility:** one-way — same fixture re-record as D-21.

- **D-23: `prefers-reduced-motion` gets a branch on every new animation**, as everything else in this
  codebase does. That means the dots, the channel specks **and** the whirlpool rotation.

- **D-24: Compositor-only animation is the house rule** — `transform` + `opacity` only. No masks, no
  filters, no live gradients, no `blur()` over the board. Learned expensively (BUG-01).

- **D-25: Build animated layers as HTML over the board, NOT as SVG children.** Measured 2026-08-02:
  **Chrome does not composite SVG transform animations at all** — `will-change` cannot promote an SVG
  child — so an animated SVG layer forces layout **every frame**. The active-turn ripple was costing
  ~62 layouts/second until it moved to HTML divs positioned in `cqw`, which cost **zero**. The rim
  arrows and whirlpool swirls are SVG `<image>` elements today (`src/ui/board.js:173-183`), which is
  exactly why D-08 keeps them static and puts the motion in an HTML layer.

- **D-26: Safari headroom is not a constraint.** Wyatt ran Phase 19 himself and reported *"it looks
  completely smooth even with 100 dots"* — the top of the dial's range. Phase 20 designs for 5–10
  dots with the whole range in reserve. There is no dot budget. See `19-VERDICT.md`.

- **D-27: Bots and humans have identical rules and affordances.** Never raise "should bots be allowed
  to…" as an open question. (Note: bots already avoid the rim channel except as a boxed-in escape —
  `src/engine/index.js:311, 357-358` — and that is existing engine behaviour this phase does not
  touch.)

### Added at plan time — 2026-08-02

- **D-28: The D-07 tuning gate covers the DOTS ONLY. WIND-02/03/05 build in parallel.** Asked and
  answered at plan time: D-07 gates WIND-01, and D-08's channel specks — though they reuse the dot
  machinery — do **not** wait on Wyatt's sign-off. The specks, the whirlpool rotation and the rim
  warning are built while he tweaks, and the specks **inherit the numbers he lands on** rather than
  blocking on them. Rationale in his chosen option: he is never the bottleneck for four of the five
  deliverables. ⚠ This means the speck implementation must read its tuning values from the same
  shared constants WIND-01 approves, not hard-code its own copies.
  — **Reversibility:** reversible — a sequencing choice, not a code shape.

- **D-29: The tuning page carries three slider groups, not one.** Dots, channel speck density,
  and whirlpool rotation speed. Asked and answered at plan time. Two board numbers had no value
  anywhere: the channel speck density is **unspecified in D-08**, and the whirlpool speed is a
  **range (8–12s), not a number** (D-09). Both go on the page so **one sitting approves the whole
  moving board** instead of three separate approval rounds. The dot sliders keep the D-01/D-02 fade
  timings as well, which the Discretion note below already made subject to this gate.
  ⚠ The page must therefore import the whirlpool and speck code paths too, not only
  `windDotSpecs`/`windDotFrame` — the D-07 warning about approving code that is not what ships
  applies identically to all three groups.
  — **Reversibility:** reversible — a throwaway page; the approval it produces is the hard part.

### Claude's Discretion

- **The mechanism for the channel specks** — whether they reuse the `.wlayer` element pool, get their
  own HTML layer, or ride a path. D-08 fixes the *look*; the build is the planner's.
- **The mechanism for the whirlpool rotation** — D-25 rules out animating the SVG `<image>` in place;
  how it is moved to an HTML layer (or otherwise) is open.
- **Exact fade durations** for D-01 and D-02, subject to the D-07 tuning gate.
- **How the rim highlight is styled differently** (D-12) — swirl, tint, or both — provided it is
  unmistakably not the ordinary "sail here" treatment.
- **How the scent's round-number derivation and no-repeat rule are computed** (D-19), provided both
  are pure functions of already-serialized event data.
- **Whether the tuning page (D-07) is deleted at the end of the phase or left uncommitted.**

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### This phase's scope
- `.planning/workstreams/board-wind/ROADMAP.md` — the two-phase workstream, the file-ownership
  boundary, the incoming one-line touch from `prompts-polish`, and the staleness warning
- `.planning/workstreams/board-wind/REQUIREMENTS.md` — WIND-01…05 in full, plus the four
  milestone-wide constraints (no engine changes; the Safari risk; copy-changes-are-inventory;
  bot/human parity)
- `.planning/V1.3-V1.4-PLAN.md` §"Phase 3 — The Board Comes Alive" — the plain-language intent,
  including why WIND-05 was folded in here and why the watercolor restyle does not invalidate this
  phase's animation tuning

### What Phase 19 established
- `.planning/workstreams/board-wind/phases/19-safari-check/19-VERDICT.md` — **the gate's answer.**
  Smooth at 100 dots; no dot budget; what the prototype shipped; the two bugs it caught
- `.planning/workstreams/board-wind/phases/19-safari-check/19-CONTEXT.md` — D-02 (the locked motion
  spec), D-08 (why `lab.html` is the wrong host), D-12 (the private-RNG rule), D-13 (reduced motion)
- `.planning/workstreams/board-wind/phases/19-safari-check/19-RESEARCH.md` — the pitfalls and open
  questions the prototype was built against
- `src/ui/board.js:439-1080` — the shipped wind-dot prototype between the
  `WIND DOT PROTOTYPE … BEGIN/END` markers (~640 lines). **The starting point for WIND-01.**
- `scripts/wind_dot_contract_check.js` — the mechanical guard wired into `npm test` that greps the
  prototype region for compositor-unsafe properties. See D-06's warning.

### WIND-04's source material
- `.planning/todos/pending/2026-08-01-wind-scent-descriptors.md` — **the 35 lines verbatim**, the two
  rules, the determinism constraint, and the open question this discussion closed (D-16)
- `src/ui/util.js:312-323` — the `newround` narration branches: the storm branch, the
  `held`/`wontQuit` "still blows / gusting" branch, and the direction-change branch the scent slots
  into
- `.planning/todos/pending/copy-shipped-vs-approved-gate.md` — **copy changes are inventory changes.**
  The scent lines must be recorded against this gate, and its "THE VOICE BOUNDARY" section explains
  why credits/About text is deliberately not in pirate speak

### The Safari precedent this phase inherits
- `src/ui/board.js:285-356` — `stormLayerSpecs()` / `buildStormLayers()`: the pre-baked tile approach
  and the seeded-private-RNG rule. **The most relevant prior art in the codebase.**
- `index.html:92-116` — `#stormOverlay` / `.rlayer` CSS, carrying the written BUG-01 post-mortem (a
  live gradient masked by another gradient with an animated mask-position and a blur filter, which
  Safari re-rasterized on the CPU every frame and dragged the board to ~2fps)
- `src/ui/board.js:1-60` — the file header's standing warning about what may and may not change here
- `.planning/PROJECT.md` §Key Decisions — "Real Safari storm fix was pre-baked PNG rain": the first
  hypothesis was wrong and compositing cost was the real culprit

### WIND-05's existing machinery
- `src/ui/flow.js:358-470` — `rimSweepPath`, `rimSweepCurve`, `rimSweepDurationMs`, `rimSweepPointAt`
  — pure, exported, already animate the boat along the rim
- `src/ui/flow.js:156-172` — `reachable()`: rim cells are valid destinations but entering one ends
  the move
- `src/ui/flow.js:227-271` — `sailHighlightRect()` and `localPickCell()`: the shared highlight
  geometry and the **one-tap-commits** interaction that rules out hover and confirm designs
- `src/engine/index.js:56-92, 243-246` — how `rim`, `rimHead` and `rimCellInfo` are built, and
  `tradewind()`, the sweep itself. **Read-only — D-21.**

### Running and measuring anything in a browser
- `docs/DRIVING-THE-GAME.md` — **required reading before any browser or playtest automation.**
  §8a especially: measuring cost needs the **GPU on** and a **rAF loop driving frames**, or animation
  measures as free. Quote the fps beside every cost figure.
- Kill every headless Chrome and local server in the same session it is started
  (`pkill -f remote-debugging-port`, `pkill -f http.server`). This has heated Wyatt's machine twice.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`windDotSpecs(seed,count)` / `windDotFrame(spec,tMs,w,h)` (`src/ui/board.js:505, 539`)** — pure,
  exported, headlessly testable. The spec half draws exactly four values per dot in a fixed
  documented order (`startT`, `wobbleAmp`, `speed`, `lane`); D-03 and D-04 each append one more.
  **These are what the D-07 tuning page must import.**
- **`buildWindDots(container,seed,count)` (`src/ui/board.js:575`)** — grows and shrinks the element
  pool live. Its `requestAnimationFrame` initial-frame paint exists because of the reduced-motion bug
  (a dot whose transform is never written sits invisibly outside the clipped layer) — **do not remove
  it while simplifying away the dial.**
- **`stormLayerSpecs(seed)` (`src/ui/board.js:307`)** — the canonical seeded-but-not-from-`game.r()`
  decoration pattern, and the seed-salt convention the dots already follow.
- **`rimSweepPath` / `rimSweepCurve` / `rimSweepPointAt` (`src/ui/flow.js:379-470`)** — WIND-05's
  geometry, already written, already pure.
- **`game.rimHead[key]`** — the landing cell for D-13's ghost boat. A lookup, not a computation.
- **`sailHighlightRect(c,cellPx,svg)` (`src/ui/flow.js:227`)** — shared by the host's own pick path
  and the guest's highlight render. **D-12's rim variant must be applied in this one function**, or
  guests will see the ordinary highlight where the actor sees a warning. This function was extracted
  (G25) precisely because the two paths had already forked once.
- **`#stormOverlay` (`index.html:1041`, CSS at `:92`)** — an existing absolutely-positioned,
  `pointer-events:none` overlay pinned over the board with border-radius and overflow already solved.

### Established Patterns
- **Compositor-only animation** — `transform` + `opacity`, `translate3d`. Nothing else. (D-24)
- **HTML over the board, not SVG children**, for anything that moves every frame. (D-25)
- **`animation-play-state: paused` when not visible** — the storm only animates while `.storming` is
  set. Anything new should follow.
- **Every animation has a `prefers-reduced-motion` branch.**
- **Board rendering is SVG (`el("circle", …)`); the storm overlay is HTML divs on top.** Both exist;
  the overlay path has the Safari-proven track record.

### Integration Points
- **`render()` in `src/ui/board.js`** already reads `e.storm` and `e.wind` each turn and toggles
  `boardwrap.classList.toggle("storming", storming)`. The wind direction and the storm state needed
  for D-01 and D-02 are **already in hand at exactly the right moment** — the same place `--slant`
  is computed for the rain.
- **D-02's round-line timing is a genuine new coupling.** The dot fade must be synced to the
  narration typewriter in `src/ui/flow.js` / `src/ui/util.js`. Today `board.js` knows nothing about
  narration timing. Plan this handshake deliberately — the narration scheduler already has a
  recorded history of contention (`.planning/todos/pending/narration-two-schedulers-unenforced.md`).
- **⚠ File-ownership reality check.** The workstream's stated ownership is *"`src/ui/board.js` and
  new sprite assets"*, but this phase **necessarily** touches:
  - `src/ui/util.js` — WIND-04's scent line (the `newround` branches)
  - `src/ui/flow.js` — WIND-05's highlight variant and ghost boat
  - narration timing — D-02
  `prompts-polish` (Phase 18) works in exactly that narration territory, and the ROADMAP already
  flags one incoming touch into `board.js:772` from that workstream. **Sequence these edits
  deliberately; do not assume the boundary holds.**

</code_context>

<specifics>
## Specific Ideas

- **Wyatt's sway note, verbatim, 2026-08-02:** *"i want the dots to slowly drift side to side as they
  go, as if the breeze isn't consistent -- potentially like a sine wave, if that's cheap, or an
  approximation of it if that's not. a cheap animation like blowing dust particles -- they don't all
  rush one way at once."* — **"blowing dust particles" is the reference image for the whole layer.**
- **Wyatt's direction-change note, verbatim:** *"the dots should also fade out when the wind direction
  changes."*
- **Wyatt's tuning-page ask, verbatim:** *"you can also spin up a version of rain.html for me to tweak
  and approve the dots, please."*
- **His motion spec from Phase 19, still binding:** *"the dots should fade in and out as they drift,
  and if they're moving north, they should jitter west and east along their path smoothly as if the
  breeze is blowing. also there only needs to be 5-10 dots on screen at any time."*
- **His scent-line sketch:** *"Round 3: wind is blowin' north, wafting clouds of cotton candy."* — the
  shipped form takes the em-dash wrapper instead (D-18), which he chose knowingly.
- **"Into the whirlpool" should be literal** — the reason D-08 won is that specks visibly get
  *swallowed* at the drop-off, rather than the channel merely implying direction.

</specifics>

<deferred>
## Deferred Ideas

- **A player-facing settings menu** (to toggle the dots, motion, etc.) — the game has none today.
  Surfaced while deciding D-06; it is its own phase, and `prefers-reduced-motion` already covers the
  accessibility case.
- **A whirlpool that spins up when a ship is swept into it** — considered and rejected for D-09 in
  favour of a constant slow turn. Worth revisiting if the sweep ever needs more drama.
- **Warning a player that a storm push could carry them onto the rim** — considered and rejected for
  D-14. It is the outcome players get blindsided by most, so it may deserve its own look later.
- **A dotted trail tracing the sweep arc** — rejected for D-13 as competing with the channel's own
  arrows and specks. Reconsider only if the ghost boat proves ambiguous in playtest.
- **Tying the scent to the game state** (downwind island, or the ingredients you still need) —
  rejected for D-16. The "what you still need" variant is noted as breaking the shared-table
  feeling, which is a reason it should probably stay rejected.
- **Keeping the smoothness meter as a permanent diagnostic** — rejected for D-06. If board
  performance is ever questioned again, `19-05-SUMMARY.md` records exactly how the calibrated meter
  worked and it can be rebuilt from there.

</deferred>

---

*Phase: 20-the-board-comes-alive*
*Context gathered: 2026-08-02*
