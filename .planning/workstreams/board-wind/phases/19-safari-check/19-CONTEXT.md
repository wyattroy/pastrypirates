# Phase 19: Safari Check - Context

**Gathered:** 2026-07-31
**Status:** Ready for planning
**Workstream:** `board-wind` · **Requirement:** WIND-00

<domain>
## Phase Boundary

This phase delivers a **verdict**, not a feature.

Build a prototype always-on wind-dot layer over the board, with an on-screen dial for how many
dots, so Wyatt can play a full game in **real Safari on both his Mac and his phone** and come back
with a number: *how many drifting dots Safari can carry before it stops being smooth.*

**Nothing final ships.** If the gate passes, the prototype becomes Phase 20's starting point. If it
fails, Phase 20 gets rethought before any tuning time goes into it.

**Explicitly NOT in this phase:**
- Phase 20 itself is not planned here. It gates on this phase's **verdict**, not its completion.
- Rim-arrow flow (WIND-02) and whirlpool rotation (WIND-03) are excluded from the gate.
- Tuning the look. Density and motion are specified by Wyatt below; nobody is judging beauty here.

</domain>

<decisions>
## Implementation Decisions

### What gets built

- **D-01:** The prototype draws **real, individually-moving dots** — NOT the pre-baked tiling-sheet
  technique the storm rain uses. Rationale: sliding sheets are *already proven Safari-safe* by the
  shipped BUG-01 fix running in Wyatt's Safari today, so re-testing them teaches nothing. Individual
  dots are the genuine unknown, and the only version where "how many dots" is a real number. If the
  gate fails, Phase 20 falls back to sheets. — **Reversibility:** reversible — prototype code behind
  an off switch; the sheet fallback is a known, already-shipped path.

- **D-02:** **Dot motion, specified by Wyatt (verbatim intent):**
  1. Dots **fade in and out** as they drift — they appear and disappear mid-board rather than
     marching edge to edge.
  2. Each dot **travels along the current wind direction** and **wobbles side-to-side across that
     path** — a north-bound dot sways west and east, smoothly, as if a breeze is nudging it.
  3. **5–10 dots on screen at any moment** is the target density.

  This supersedes the roadmap's "deliberately untuned first guesses" framing for density and motion.
  Wyatt has specified these; they are not the planner's to invent.

- **D-03:** **The gate tests dots only.** Rim arrows (WIND-02) and rotating whirlpools (WIND-03) are
  a handful of elements next to potentially dozens of dots and would blur the measurement. They go
  straight into Phase 20 without their own gate.

### How it is measured

- **D-04:** **The dial ranges 0–100 dots** and is driven by an **on-screen control beside the
  readout** (plus/minus or slider), changeable **mid-voyage without a reload**. Rationale: Safari
  caches ES modules aggressively and a `?cb=` on the page address does not clear them — changing a
  setting by editing code and reloading risks measuring the *previous* build without knowing, and a
  reload would end the voyage being measured. The control must be finger-friendly, since the phone
  is in scope.

- **D-05:** **Smoothness is measured, not eyeballed.** A live smoothness readout sits on screen
  during play, and the page keeps the worst dips and prints a **plain end-of-voyage summary**
  (typical, worst moment, roughly when it happened). Rationale: an eye misses slow decay and a
  single bad moment three-quarters through a voyage; the v1.0 storm retune was settled with real
  measured numbers (0.818s/200.5px vs 0.534s/264.7px across two screens), and this phase's whole
  output is a number.

- **D-06:** **Two runs, in order.** First a *headroom* run — wind the dial up toward 100 to find
  roughly where Safari starts to hurt. Then lock to 10 and play a **full voyage** to prove it holds
  alongside narration typing, ship moves, and storms arriving and leaving.

- **D-07:** **The gate's real question has shifted.** At 5–10 dots, raw count is nearly a non-issue —
  that is fewer moving pieces than the storm's 4 rain layers already run over the board today, and
  both fading and sliding are compositor-cheap (the BUG-01 killers — live gradients, masks, blur —
  appear nowhere in D-02). The gate therefore primarily answers: **can an animation that never stops
  coexist with everything else the board does across a whole voyage?** The headroom number remains
  valuable as the budget Phase 20 designs against.

### Where it runs, and what happens after

- **D-08:** The prototype lives **in the real game, in `src/ui/board.js`, behind an off-by-default
  switch.** Rationale: only this setup literally proves "a full game plays smoothly" — real board,
  real narration, real ships, real storms. `lab.html` is a 121KB pre-refactor standalone copy that
  does not load `src/ui/board.js` at all and would measure different code. And on a pass, Phase 20
  starts from working code already in the right file with nothing to port.

- **D-09:** **Both desktop Safari AND phone Safari must pass** at the 10-dot target, or the gate
  fails and Phase 20 is rethought. The **phone's ceiling — not the Mac's — becomes the budget** Phase
  20 designs against. Rationale: the game is played on phones, and a phone player hitting a
  stuttering board is a worse outcome than no wind dots at all.

- **D-10:** After the verdict, the phase's code **merges switched off.** Nothing is visible to a real
  player and it costs them nothing, which honours "ships nothing final" in the way that matters —
  while following the workstream roadmap's own rule to merge back promptly rather than let a
  workstream sit. (That roadmap names staleness, not conflicts, as this project's demonstrated
  failure mode: a branch once drifted 34 commits behind and made a shipped milestone look
  unfinished.) — **Reversibility:** reversible — inert code behind a flag; deleting it is a local change.

### Carried forward — locked upstream, do NOT re-litigate

- **D-11:** **Nothing in v1.3 touches `src/engine/index.js` or changes what it emits.** It has been
  byte-identical to `9ddd214` since before Phase 15, which is why Phases 15–17 needed no determinism
  re-record. The 31-seed corpus is re-recorded exactly once, in v1.4. **If this phase finds it needs
  an engine change, STOP and re-scope.** — **Reversibility:** one-way — an engine change forces the
  31-fixture determinism re-record, a slow one-shot job explicitly scheduled for v1.4.

- **D-12:** **Decoration never draws from `game.r()`.** Use a private `mulberry32(seed)` seeded
  *from* the game seed, exactly as `stormLayerSpecs()` does. Drawing extra numbers from the game
  stream would advance it and desync every client AND all 31 determinism fixtures. This gives every
  player in a room identical dots while consuming nothing from the game. — **Reversibility:** one-way —
  the same fixture re-record as D-11.

- **D-13:** **`prefers-reduced-motion` gets a branch**, as every other animation in `index.html` has
  (the storm rain pauses under it).

- **D-14:** **This workstream owns `src/ui/board.js` and new sprite assets only.** Phase 18
  (`prompts-polish`) is editing `index.html`'s CSS block concurrently — sequence any CSS touch
  deliberately.

### Claude's Discretion

- **The technical mechanism for each dot** — how a dot is represented and moved (overlay elements
  with compositor-only transforms, canvas, or otherwise). Wyatt explicitly left this to research and
  planning. **Leaning to record, not to bind:** the closest safe extension of the proven BUG-01
  technique is small elements moved with compositor-only transforms and opacity, since both are
  operations the graphics chip does without re-rasterizing — which is precisely what the live
  gradient/mask/blur failed to be. Research should confirm or overturn this.
- Exact placement, styling and wording of the readout and dial panel.
- Whether the dot sprite is a baked image or a drawn shape.
- How the headroom run's stepping is structured (increments, dwell time per step).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### This phase's scope
- `.planning/workstreams/board-wind/ROADMAP.md` — the two-phase workstream; Phase 20 gates on Phase
  19's **verdict**, not its completion; workstream file ownership and the staleness warning
- `.planning/workstreams/board-wind/REQUIREMENTS.md` — WIND-00 in full, plus the milestone-wide
  constraints (no engine changes; WIND-01 is the largest Safari risk taken; copy-changes-are-
  inventory; bot/human parity)
- `.planning/V1.3-V1.4-PLAN.md` §"Phase 2 — Safari Check (a gate, not a build)" — the plain-language
  intent, why the gate exists, and "an afternoon; cheap insurance against losing a week"

### The Safari precedent this phase exists because of
- `src/ui/board.js:285-356` — `stormLayerSpecs()` / `buildStormLayers()`. The pre-baked tile
  approach, the seeded-private-RNG rule, and the G19 retune history. **The single most relevant
  prior art in the codebase.**
- `index.html:92-116` — `#stormOverlay` / `.rlayer` CSS. Carries the written post-mortem of BUG-01:
  a live `repeating-linear-gradient` masked by another gradient with an animated mask-position and a
  blur filter, which Safari re-rasterized and re-blurred on the CPU every frame over a 220%-sized
  layer, dragging the board to ~2fps with the game paused. Also the `prefers-reduced-motion` branch.
- `src/ui/board.js:1-60` — the file header's standing warning that this file carries the BUG-01 fix
  and what may/may not be changed in it.
- `.planning/PROJECT.md` §Key Decisions — "Real Safari storm fix was pre-baked PNG rain, not the
  typewriter batch"; the first hypothesis was wrong and the compositing cost was the real culprit.

### Running the test
- `docs/DRIVING-THE-GAME.md` — **required reading before any browser or playtest automation.**
- Safari caches ES modules aggressively; a fresh server port is the reliable cache-buster, not a
  `?cb=` on the page. This bites harder on the phone, which cannot easily be cleared.
- Phone testing needs the local server reachable from the phone over wifi (bound beyond localhost,
  reached at the Mac's network address). This is branch code and is **not** on
  playpastrypirates.com.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`stormLayerSpecs(seed)` (`src/ui/board.js:307`)** — the exact pattern for seeded-but-not-from-
  `game.r()` decoration randomness. The wind dots' per-dot jitter (start offset, phase, speed, wobble
  amplitude) should be generated the same way: `mulberry32` seeded from `appState.game.seed`, with a
  fixed literal fallback for the seedless demo board (`DEMO_RAIN_SEED=1337`).
- **`#stormOverlay` (`index.html:1041`, CSS at `:92`)** — an existing absolutely-positioned,
  `pointer-events:none` overlay pinned over the board with `border-radius` and `overflow:hidden`
  already solved. A wind-dot layer is the same shape of problem.
- **`assets/rain-streaks.png`** — 1.9KB. Precedent for how small a baked sprite can be.

### Established Patterns
- **Compositor-only animation is the house rule**, learned expensively: `transform` + `opacity`,
  `will-change: transform`, `translate3d`. No masks, no filters, no live gradients over the board.
- **`animation-play-state: paused` when not visible** — the storm only runs its animation while
  `.storming` is set. The wind layer should follow: nothing spinning when the switch is off.
- **Every animation has a `prefers-reduced-motion` branch** in `index.html`.
- **Board rendering is SVG** (`el("circle", …)`), while the storm overlay is HTML divs layered on
  top. Both are available; the overlay path is the one with the Safari-proven track record.

### Integration Points
- `render()` in `src/ui/board.js` already reads `e.storm` and `e.wind` each turn and toggles
  `boardwrap.classList.toggle("storming", storming)`. The wind direction needed to aim the dots is
  **already in hand at exactly the right moment** — the same place `--slant` is computed for rain.
- The prototype's on/off switch, dial and readout all hang off this same cluster; no other module
  needs to know they exist.

</code_context>

<specifics>
## Specific Ideas

- **Wyatt's motion spec, in his words:** *"the dots should fade in and out as they drift, and if
  they're moving north, they should jitter west and east along their path smoothly as if the breeze
  is blowing. also there only needs to be 5-10 dots on screen at any time"* and *"allow me to
  increaSE number of dots up to 100, and also see how it'll perform on mobile"*.
- The wobble is **across** the direction of travel, not random drift — a breeze nudging a floating
  thing sideways while it continues on its way.
- "Fade in and out" means dots are recycled mid-board, so the count on screen stays roughly constant
  and no dot has to traverse the full board.
- **Wyatt runs the Safari verdict himself, on his own machine and phone.** Chrome can be driven
  automatically; the Safari result is his. The prototype must therefore be drivable by him alone,
  with no console commands and nothing to memorise.

</specifics>

<deferred>
## Deferred Ideas

- **Rim-arrow flow (WIND-02) and whirlpool rotation (WIND-03)** — deliberately excluded from the
  gate as a handful of elements that would blur the dot measurement. They go into Phase 20 directly.
- **Tuning how the dots look** — density and motion are specified in D-02; refining beauty is Phase
  20's job. The roadmap is explicit that nobody judges the look here.
- **Any per-device dot-count strategy** (e.g. fewer dots on small screens) — a Phase 20 design
  decision. This phase only produces the numbers that would inform it. Note D-09 chose a single
  shared budget set by the phone, rather than two separate budgets.

</deferred>

---

*Phase: 19-safari-check*
*Context gathered: 2026-07-31*
