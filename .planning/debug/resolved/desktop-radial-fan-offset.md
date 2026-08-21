---
status: resolved
trigger: "RED ALERT — game-stopping bug found by Wyatt in his 7am solo playtest on DESKTOP Safari at playpastrypirates.com/4 (build 2026-08-20r). Solo mode: radial fan narration placement not calculated correctly, Pass button in lower corner instead of near ship, narration box far from ship, trade tooltip floating with no visible button, and the Dock/Trade buttons are entirely invisible — game-stopping, cannot dock. Narration boxes also disconnected from ships with pointer arrows in the wrong place. See notes/edits for pastry pirates 8-21-7am.pdf."
created: 2026-08-21T12:00:00Z
updated: 2026-08-21T12:45:00Z
---

## Current Focus

hypothesis: CONFIRMED (see Resolution.root_cause below). Fix applied, measured across 1400/1920/390px, all gates green, ready to ship.
test: n/a — resolved.
expecting: n/a — resolved.
next_action: commit code (4/ files), bump PP4_STAMP to 2026-08-20s (done), push origin main, pull, verify zero both ways, then archive this session and append the knowledge-base entry.

## Symptoms

expected: On desktop Safari at wide viewport widths, the radial action fan (Dock/Trade/Attack/Pass) blooms near the player's own ship, each button separately visible and clickable; the "what'll ye do" ask pill sits near the ship; the apSub helper tooltip sits near its related button; narration bubbles anchor to the ship they describe with their pointer arrow touching the hull.
actual: The ask pill floats in the top-right corner of the board, a board-width away from the ship (dead center). The ONLY visible/clickable button is "Pass +1🪙," pinned to the bottom-right corner — Dock, Trade, and Attack are not visible anywhere, making the game unplayable (cannot dock). The apSub tooltip "No one's holding card to trade for yet" floats with no button visible near it. On a bot's turn, the narration box sits mid-board with its pointer touching no boat.
errors: none (visual/layout mispositioning, not a JS exception)
reproduction: Open playpastrypirates.com/4 in a wide desktop browser window (observed ~1400px+), start a solo game, reach any action prompt (Day 1-2). Confirmed by Wyatt's own screenshots (notes/edits for pastry pirates 8-21-7am.pdf, both pages, read pixel by pixel).
started: introduced by commit 94adceb ("item 22 — desktop renders at the phone's aspect ratio (stopgap, D-18)"), which added `transform:translateZ(0)` + `max-width:430px; margin:0 auto` to `body.pp4Stage` at >=601px. That commit's own util.js fix (stageCappedRect()/vwPx()/vhPx()) compensates for the resulting WIDTH/HEIGHT mismatch but not for the LEFT/TOP origin offset that the same transform introduces for any code deriving fixed-element positions from getBoundingClientRect() (viewport-relative) reads.

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-08-21T12:00:00Z
  checked: PDF notes/edits for pastry pirates 8-21-7am.pdf, both pages, pixel by pixel
  found: page 1 screenshot — narrow dark-teal column centered-left in a much wider Safari window; boat mid-board; ask pill "Davy Scones, what'll ye do:" at top-right of the column, away from the boat; single blue circular Pass+1 button bottom-right corner; CAPTAINS panel below, correctly laid out. Page 2 — DAY 2 screenshot repeats the same top-right pill placement; second screenshot shows "Dough Hook took the wheel" narration mid-board with its pointer touching open water, not any ship.
  implication: the offset is horizontal (right-pushed), vertical placement looks approximately correct in both screenshots — consistent with a purely horizontal containing-block offset (body's `margin:0 auto`), not a vertical one.

- timestamp: 2026-08-21T12:00:00Z
  checked: git show 94adceb -- 4/index.html 4/src/ui/stage.js 4/src/ui/util.js
  found: body.pp4Stage gets `max-width:430px; min-height:100vh; margin:0 auto; transform:translateZ(0);` at >=601px. util.js's vwPx()/vhPx() were given a matching branch (stageCappedRect()) that returns document.body.getBoundingClientRect() width/height whenever it's genuinely narrower than the true viewport, falling back to the old behavior otherwise (byte-identical on phone).
  implication: the WIDTH/HEIGHT half of the coordinate-space mismatch was already fixed for anything that reads vwPx()/vhPx(). Nothing compensates for the LEFT/TOP origin shift that the same transform introduces.

- timestamp: 2026-08-21T12:00:00Z
  checked: 4/src/ui/stage.js:134-139 (toScreen), :195-200 (boatUXY), :1353-1806 (promptTick), :705-878 (narration bubble stageFlash/place())
  found: `toScreen(ux,uy)` returns `[(ux-S.cam.x)*sc + br.left, (uy-S.vy)*sc + br.top]` where `br = svg.getBoundingClientRect()` — always viewport-absolute per the CSS spec, regardless of any ancestor transform. Its output (sx,sy) is used, directly or via arithmetic, for EVERY fan-button spot, the ask pill's left/top, the apSub tooltip's left/top, the back-button's left/top, the slider's left/top, and the card-mode box.style.left/top fallback — all written onto `position:fixed` elements (or elements inside #pp4Fx, which is itself position:fixed with left:0/right:0 relative to body). The narration bubble's place() function does the same: `const [sx,sy]=toScreen(...)`, then `b.style.left = left` where `left` is clamped between `band.left`/`band.right` (both already correctly body-relative, from vwPx()) but built from the same viewport-absolute sx — so the clamp mixes coordinate spaces and forces the bubble to its rightmost legal value, same failure mode as the ask pill.
  implication: toScreen() is THE single seam nearly every board-anchored overlay in stage.js flows through. Fixing it to subtract body's own left/top offset (mirroring stageCappedRect()'s exact guard) fixes the ask pill, the apSub tooltip, the back button, the slider, the card fallback, AND the narration bubble/pointer in one place.

- timestamp: 2026-08-21T12:00:00Z
  checked: the "cornered beyond hope" fallback formation search in promptTick() (stage.js ~1726-1758)
  found: the primary formation search (`formationOK`) requires every candidate button position to satisfy `inBounds(cx,cy)` against body-relative xMin/xMax (from vwPx(), correct) — but candidates are built from `sx` (viewport-absolute, wrong), so `sx` alone already exceeds xMax at any desktop width where body is offset (~485px offset vs a ~340px-wide legal band) and EVERY heading/radius/formation search fails. Falls through to the "cornered" fallback, which clamps `sx - D/2 + offset` into [xMin,xMax] for every button — since sx is far past xMax, EVERY button clamps to the same xMax value, stacking all of them (Dock/Trade/Attack/Pass) on top of each other at the bottom-right corner.
  implication: this is the exact mechanism for "the ONLY action button visible is Pass — I cannot click Dock because the button is not visible." Dock/Trade/Attack are present in the DOM, positioned, and clickable in principle, but pixel-stacked directly underneath Pass (last in DOM/paint order), so only Pass receives clicks and is visible. Confirms the game-stopping severity is fully explained by this one root cause — no second contributing cause needed.

- timestamp: 2026-08-21T12:00:00Z
  checked: 4/index.html:1675 (#pp4Fx CSS), stage.js fxHost()/boardBand()
  found: `#pp4Fx { position:fixed; left:0; right:0; ... }` — stretches to body's own containing-block width via CSS, so no JS-computed left offset is needed there. `boardBand()`'s top/bottom come from rib/pill/cap getBoundingClientRect() Y-values; body.pp4Stage's `margin:0 auto` sets margin-top:0 explicitly, so the vertical offset is 0 today — band.top/bottom are safe as-is. band.left/right are derived purely from vwPx() (already correctly body-relative), not from any raw gBCR X read, so also safe as-is.
  implication: the fix is scoped correctly to the X-axis conversion at toScreen() (and the sailCell-rect / msg-rect-derived sites that also feed fixed-element left values) — boardBand() itself needs no change.

## Resolution

root_cause: |
  Two contributing causes, both introduced by commit 94adceb (item 22, the desktop stopgap
  — D-18), neither sufficient alone once the other is fixed but the game-stopping severity
  needed both:
  1. `toScreen()` (4/src/ui/stage.js) derives screen coordinates from `svg.getBoundingClientRect()`,
     which per the CSS spec always returns TRUE-viewport-relative coordinates regardless of any
     ancestor transform. Item 22's `transform:translateZ(0)` on `body.pp4Stage` (>=601px) makes
     <body> the containing block for every `position:fixed` stage element, so writing toScreen()'s
     viewport-absolute output into a fixed element's left/top places it relative to BODY's own box
     instead — offset by body's own left margin (`margin:0 auto` on a `max-width:430px` column,
     ~(windowWidth-430)/2 px: 485px at 1400px width, 745px at 1920px). Nearly every board-anchored
     overlay in stage.js (the fan buttons, ask pill, apSub tooltip, back button, slider, narration
     bubble + pointer tail) derives its position from toScreen(), directly or via boatUXY().
  2. Three CSS rules (`.apMsg`, `.apSub`, `.pp4PeekHint span`) sized themselves with raw `vw` units
     (`max-width:88vw`/`80vw`/`92vw`) instead of `%` — `vw` is always relative to the TRUE viewport
     (never any ancestor), so even once (1) is fixed these boxes could still render wider than the
     430px-capped column and spill past its right edge. Item 22's own commit already fixed three
     other 100vw/100vh sites for exactly this reason but missed these three.
  Mechanism for the game-stopping severity specifically: the radial fan's placement search
  (promptTick()) requires every candidate button position to land inside a body-relative band
  (built from vwPx()); fed a viewport-absolute ship position from cause (1), every heading/radius
  candidate failed the bounds check, and the "cornered beyond hope" fallback clamped every button
  to the SAME corner — stacking Dock/Trade/Attack pixel-for-pixel underneath Pass, which alone
  received clicks (last drawn) while the other three were present, positioned, and invisible.
fix: |
  - 4/src/ui/util.js: exported `stageCappedRect()` (was private) and added `fixedOrigin()` (the
    same guard, returning body's own {left,top} offset — zero on phone, zero when the stopgap
    isn't active) and `fixedRect(el)` (applies that offset to one element's own gBCR read).
  - 4/src/ui/stage.js: `toScreen()` now subtracts `fixedOrigin()` from its returned [x,y] — the one
    seam nearly every board-anchored overlay in the file flows through. The two remaining raw
    `getBoundingClientRect()` reads that feed a fixed element's left/top independently of toScreen()
    (the `.sailCell` obstacle rects used by both the radial fan's avoidance search and the card-mode
    sail-window dodge, and the ask pill's own rendered rect used to place the back button) now go
    through `fixedRect()` instead. Bumped PP4_STAMP to 2026-08-20s.
  - 4/src/ui/flow.js: `showWhy()` (the per-button "why is this greyed out" bubble) had the same two
    bugs independently — a raw `getBoundingClientRect()` feeding a fixed element's left/top, AND
    `window.innerWidth` instead of `vwPx()` (violating this file's own established convention,
    documented at stage.js's own header). Fixed both; swept in per rule 8 even though not one of
    Wyatt's four reported items — same overlay family, same bug class.
  - 4/index.html: three `max-width:NNvw` values (`.apMsg`, `.apSub`, `.pp4PeekHint span`) changed to
    `NN%`, mirroring 94adceb's own already-proven `100vw`->`100%` pattern for the three sites it did
    catch. `.apSub`'s fix is the second half of Wyatt's reported "tooltip floating nowhere near its
    button" (the LEFT/TOP was cause 1; this is the width that let it spill past the column even once
    correctly positioned). `.apMsg`'s and `.pp4PeekHint`'s were found during the verification sweep,
    not reported directly — a battle-call ask pill ("Call Flaky Jack" / "Call Crustbeard") measured
    562px wide against a 430px-capped column before this fix.
verification: |
  Headless Chrome (CDP), solo game driven to a live action prompt at 1400x900, 1920x1080 and
  390x844 (script: /private/tmp/.../scratchpad/verify_offset_fix.mjs). At both desktop widths:
  every fan button (Dock/Trade/Attack/Pass, whichever were legal that turn) measured as a distinct,
  non-overlapping rect fully inside body's own rect (485-915 at 1400px, 745-1175 at 1920px); the ask
  pill and narration bubble + pointer both measured inside the same bounds, near the ship. Screenshot
  confirmation at 1400px: "Wyatt, what'll ye do:" sits directly beside the ship, with Dock/Trade/Pass
  as three separate visible, clickable circles — Dock (the game-stopping element) fully visible.
  Screenshot confirmation at 1920px (an earlier run, different RNG path): a bot-turn narration box
  ("TAILS — Dough Hook spends the turn haulin' crates...") with its pointer tail touching Dough
  Hook's own ship exactly. Phone (390px) screenshot compared against the pre-fix layout pattern:
  body.left=0 (unaffected, as predicted — the offset is zero whenever the stopgap isn't active).
  Gates: root `npm test` (0 failing), `4/scripts/prompt_field_parity_check.js` (PASS),
  `4/scripts/audio_map_check.js` (OK), `4/scripts/bot_bake_pass_check.js` (PASS 5/5),
  `scripts/host_guest_parity_check.js --tree=4 --strict` (exactly the three pre-existing documented
  reds — PARITY-SAILRECT, PARITY-SWEEPARRIVE, PARITY-ORCH — none introduced by this change).
  oracle_type: derived — the regression check is a geometric contract (every placed rect for a
  board-anchored fixed overlay must lie within body's own rendered rect, derived from the CSS
  containing-block rule the stopgap invokes), not a single hand-typed expected value.
files_changed:
  - 4/src/ui/util.js
  - 4/src/ui/stage.js
  - 4/src/ui/flow.js
  - 4/index.html
