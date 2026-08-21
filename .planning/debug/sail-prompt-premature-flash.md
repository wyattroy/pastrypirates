---
status: investigating
trigger: "Wyatt's 7am solo playtest, Solo item 3 (notes/edits for pastry pirates 8-21-7am.pdf, page 2): 'After clicking a square to sail, the {Player}, what'll ye do narration FLASHES once then disappears and reappears once the player has finished their sailing animation. This box should ONLY appear ONCE the animation has completed and the player's ship has stopped moving. This is a broad, general rule for all action/narration boxes tied to ships: only display them after the boat has stopped moving.' Item 11's fix (pendingReveal + stageSettled()) already gates the reveal but the first flash reportedly still leaks."
created: 2026-08-21T13:15:00Z
updated: 2026-08-21T13:15:00Z
---

## Current Focus

hypothesis: unconfirmed — could not reproduce the described premature flash via automated measurement in this build (2026-08-20s). Two independent sail-cell clicks, driven headless with a MutationObserver on #pp4Prompt's style/class attributes armed BEFORE each click, both showed a clean `display:none` throughout the entire sail glide with no premature transition to `block`/`flex` before the legitimate reveal.
test: n/a — nothing left to test without either (a) a real mouse-driven repro (not synthetic dispatchEvent) or (b) a cold-cache/throttled-network run, both untried.
expecting: n/a
next_action: this session is PARKED, not resolved. Next session should try: (1) a REAL pointer-driven click (CDP Input.dispatchMouseEvent at real screen coordinates, not element.dispatchEvent) in case the flash depends on a pointerdown/hover code path the synthetic click bypasses; (2) network-throttled / cold-cache run, since panel()'s per-`<img>` resizePanel() re-measure (util.js/panel.js — narrIcon coin/ingredient icons with zero intrinsic size until decoded) is the one documented source of a timing-dependent extra reveal in this exact subsystem (see panel.js's P3/P5 comment) and a warm headless cache would hide it; (3) a LATER-game turn with a longer narration backlog already queued (bot turns stacked up) rather than the second sail of a fresh game.

## Symptoms

expected: the "what'll ye do" narration box appears exactly once, only after the ship's sailing animation has fully stopped.
actual (per Wyatt): the box flashes once immediately after the sail-cell click, disappears, then reappears once the animation finishes.
errors: none — a timing/sequencing symptom, not a JS exception.
reproduction (as reported): click a highlighted sail cell during a solo game; observe the "what'll ye do" box flash briefly then vanish before genuinely reappearing after the ship stops gliding.
started: pendingReveal + stageSettled() (item 11, commit 5b1af61) already gates the MAIN reveal; Wyatt's report says a first flash still leaks through it.

## Eliminated

- hypothesis: the flash is a straightforward gap between `panel()` writing new HTML content and `pendingReveal` being added as a class.
  evidence: read panel.js:434-546 — `inner.innerHTML=html` and `gateEl.classList.add("pendingReveal")` are both synchronous, in the same call, no await/yield between them. JS is single-threaded; promptTick() (the only other code that reads `pendingReveal` to decide `box.style.display`) cannot observe an in-between state because there is no in-between state to observe — nothing yields control mid-function.
  timestamp: 2026-08-21T13:15:00Z

- hypothesis: `enterCenterStage()`'s own `box.style.display = ap.classList.contains("pendingReveal") ? "none" : "flex"` (stage.js:1328) is a second, un-synced display-setting site that could race the sail-prompt's own reveal.
  evidence: read stage.js:1291-1328 — `enterCenterStage()` only runs when `ap.dataset.pp4Stage || ap.querySelector(".bko")` is true (ceremony cards, bake-off intro), which a post-sail action-menu prompt is not (it is a plain `.radial` menu). Not the code path a sail-then-action-menu transition goes through.
  timestamp: 2026-08-21T13:15:00Z

## Evidence

- timestamp: 2026-08-21T13:15:00Z
  checked: headless Chrome (CDP), solo game driven past the Ahoy/recipe-pick intro to the first sail prompt, MutationObserver armed on #pp4Prompt's style+class attributes AND on every ship element's style attribute (subtree, on #boardShips) immediately before dispatching a synthetic click on a `.sailCell`. 4200ms of both a mutation log and an 8Hz-equivalent rAF poll of `{boxDisplay, pendingReveal, text}` captured. Script: scratchpad/verify_sail_flash.mjs, raw output: scratchpad/sail_timeline.json.
  found: poll transitions were exactly: `none(pendingReveal=true, "tap to sail") -> none(pendingReveal=false, empty) -> none(pendingReveal=true, "what'll ye do... Trade Pa[ss]") -> none(pendingReveal=false) -> BLOCK(pendingReveal=false)` at t≈1513ms after the click. Zero mutation-log entries showed `display` as anything other than `none` before t≈1510ms; the only `block` entries in the whole 4.2s capture cluster from t≈1510ms onward (the legitimate, correctly-gated reveal).
  implication: in this specific run, item 11's gate held perfectly — the NEXT prompt's content was written into the DOM (with pendingReveal=true, correctly hidden) well before the reveal, and nothing forced `display` to anything visible before the gate cleared. No premature flash observed.

- timestamp: 2026-08-21T13:15:00Z
  checked: a second, independent run driving THREE additional actions (two more sail clicks across what the driver's own logging shows were separate turns), same MutationObserver technique but logged continuously across the whole session rather than re-armed per click, wall-clock timestamps. Script: scratchpad/verify_sail_flash2.mjs, raw output: scratchpad/sail_timeline2.json.
  found: across the full ~140s capture (2 confirmed sail clicks plus the intro flow), the box's `display` attribute changed value only 3 times total: `none -> block -> none`, and that single block/none pair sat between the intro flow and the FIRST sail click's own eventual reveal — no display-attribute mutation of any kind was recorded after the second sail click for the remainder of the capture (the driver appears to have stalled on a later prompt type it doesn't answer — likely a battle or trade prompt using `.btlBtn` rather than `.apBtn` — which is a driver limitation, not evidence either way about the box).
  implication: still no premature flash observed, but the second run's driver got stuck before reaching a clean second measurement window — inconclusive rather than a second confirmed clean pass. Do not cite this run as a second independent negative; it is one clean negative (the first run) plus one inconclusive attempt.

## Resolution

root_cause: not identified — investigation could not reproduce the reported symptom in this build via automated measurement.
fix: none applied. No fix should be attempted for a symptom that could not be measured (CLAUDE.md rule 6 — "never report a defect as confirmed before you have measured it" applies equally in reverse: do not apply a fix for a defect you could not confirm).
verification: n/a
files_changed: []
