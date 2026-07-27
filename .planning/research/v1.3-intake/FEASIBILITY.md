# v1.3 Intake — Feasibility Grounding

**Source:** `.planning/research/v1.3-intake/INTAKE.md` (63-item inventory, V13-01…V13-63).
**Purpose:** Ground every item in the actual codebase (as of `src/` post-Phase-14, `index.html` slim shell) so step 3 can draft an honest milestone-sized roadmap. This document does not resolve any of INTAKE's 18 flagged decisions — it reports what the code actually does, what changing it actually costs, and re-adjudicates INTAKE's `engine_risk` guesses against real code.

**Codebase state read:** `src/engine/index.js` (825 lines, pure/DOM-free), `src/orchestrator.js` (1170 lines), `src/ui/flow.js` (1049), `src/ui/util.js` (900), `src/ui/board.js` (644, storm-crash-critical), `src/ui/panel.js` (390), `src/ui/lobby.js` (137), `src/ui/recipe.js` (378), `src/shared/index.js` (182), `src/state/index.js` (114), `src/net/*.js`, `index.html` (870), `scripts/engine_contract_check.js`, `art-review/gallery.html`. `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/STATE.md`, `.planning/PROJECT.md` read in full.

---

## Headline findings (read this first)

1. **Recipe-uniqueness (V13-42…44) is unambiguously fixture-breaking.** Confirmed by reading the constructor: recipe dealing has zero cross-player uniqueness check today, and any fix touches `this.r()` draws that both the live game **and** the headless `Game.play()` determinism simulator both execute during construction, before a single turn is taken. Every one of the 31 fixtures is affected by any fix here. This must be its own gated re-record, batched with any other engine changes below.

2. **The wind-flavor descriptor (V13-63) is confirmed *not* fixture-breaking**, if implemented at the UI tier. The wind direction (`e.dir`) and round number are already recorded fields on the existing `newround` event; a UI-tier lookup keyed off already-recorded data adds zero engine RNG draws and zero new event fields. This is the cheap one — plan it as ordinary UI/narration work, not engine work.

3. **V13-18 (recipe-choice sequencing) is confirmed *not* fixture-breaking**, contradicting INTAKE's "unclear" guess. It's a two-line reorder inside `src/orchestrator.js runLiveNet()`, entirely in the live-only UI-orchestration layer that the headless determinism simulator (`Game.play()`) never executes at all — recipe drafting doesn't exist in the simulator's code path. Confirmed safe by reading both functions.

4. **The turn-order "miss a turn every 4th time" (V13-55) has no supporting code.** No modulo-4 logic, no periodic-skip mechanism exists anywhere in `src/`. Likewise, no vestige of an old "turn-skipping"/"passing the wheel" mechanic was found (V13-56) — the only "wheel" string in the codebase is the current, correct `"🧭 {name} takes the wheel…"` turn-start narration. Both items rest on either a genuine live-only bug that needs a repro session, or a misreading of normal game flow — static reading cannot resolve which.

5. **The "ingredients disappearing" mystery (V13-59…61) does NOT match any missing-restock code path I could find.** I traced every ingredient-removal site (dock, storm-aground, shot-clock timeout, trade, battle) and every one already conserves total supply (removes from a player's hand and increments `tokens[ing]`, or moves it to another player's hand). I could not reproduce a genuine "vanishes forever" bug from static reading. I *did* find a concrete, different, well-evidenced bug nearby (see #6) and a plausible-but-unconfirmed connection to the already-known broken pass-and-play timer toggle (V13-02/03) — see V13-61's entry for the reasoning chain. This needs a live pass-and-play repro with an ingredient-supply-conservation assertion added temporarily, not more static reading.

6. **V13-38/39/40 (timeout narration missing from the on-screen box) is a real, precisely located bug** — but only for HALF the reported symptom. `applyShotClockPenalty()` (the 20s soft warning, "was too slow") routes through `narrateLastEvent()`, which has a guard: `if($("actionPanel").classList.contains("needsAction"))return;` — if the slow player still has an active decision panel up when their own 20s soft-timeout fires, the narration is silently dropped from the visible box (but the event is still recorded, so it shows up in the captain's log). The 30s hard-timeout (`shotclockskip`, "snoozing pirates") calls `flash()` directly and has no such guard, so it likely already displays. **V13-40's "you"-in-narration-box ask is functionally identical to the already-tracked, unbuilt NARR-05 requirement** (Phase 15) — see the Clusters section.

7. **The double-log-line pattern in the pass-and-play captain's log (flagged as a possible bug in V13-61) is NOT a bug — it's two different, both-intentional code paths.** A bot-hails-human trade fires a `parley` (negotiation record) event, and if accepted, a *separate* `trade` (execution) event — by design, two narration lines for one action (`src/ui/flow.js:712,717`). A direct human-to-human accepted trade fires only one `trade` event (`src/ui/flow.js:492`) — by design, one line. The captain's log showing sometimes-one/sometimes-two lines for "a trade" is simply these two different mechanisms firing in different situations, not inconsistent event emission.

8. **The "two gales in a row" pattern (also flagged as possibly-duplicate in V13-61) is also not a bug.** A storm push is two separate legs (`windNow` then `windNow2`), each capable of independently blowing a docked ship off its dock and each firing its own `blownOut` event — two legitimate events, not a duplicate-logging artifact.

9. **The always-on wind-particle effect (V13-11…13) reuses a genuinely safe rendering technique (4 static CSS-animated `<div>`s over a tiled background PNG, GPU-composited, built once and reused) — but this technique has never been run continuously for a whole game before.** The existing storm-rain layers are built lazily on first storm and persist, but storms are capped at 2-in-a-row and are a minority of rounds. An **always-on** ambient version changes the duty cycle from "occasional" to "100% of the game," which is a materially different performance profile on the exact subsystem that caused the v1.0 Safari near-crash. This is a genuine **needs-spike** item, not a "small" one — see V13-13's entry.

10. **The S-curve boat-movement complaint (V13-23) may already be technically true and still look wrong.** The ship transform's CSS transition is `cubic-bezier(.42,0,.58,1)` at 0.35s — that is the literal definition of the standard `ease-in-out` keyword, i.e. already an S-curve. The likely explanation for why it *reads* as ease-out-only: ship movement is animated one square at a time (each hop restarting the same short 0.35s transition), and over a single short hop the "ease-in" ramp-up is nearly imperceptible to the eye, leaving only the visible deceleration. The fix is a more exaggerated curve, not a different easing family — small, CSS-only.

11. **V13-45/46/47 (Parley→Trade rename) touches exactly 3 user-facing strings**, all already located: the action-menu button label (`src/ui/flow.js:510`), the "Parley with whom?" prompt (`src/ui/flow.js:386`), and one Credits-modal sentence (`index.html:722`). Internal code/event names (`tryTrade`, `tradeOpp`, `t:"trade"`) are already "trade"-flavored per CLAUDE.md's own documented conventions — a rename is UI-label-only, zero data-model risk. The requested grey-out-when-no-partners behavior (V13-47) has a direct precedent already in the same function: the Attack button already implements `disabled:!canAfford` with conditional sub-text (`src/ui/flow.js:508-509,520`) — the trade button's grey-out is a straightforward copy of an existing pattern, not new mechanism.

12. **V13-62's reference file doesn't exist under that name.** There is no `art-review.html`; the closest (and clearly intended) analog is `art-review/gallery.html`, which already implements exactly the requested pattern — per-item card, a `<textarea>` under each, and Export/Copy-to-clipboard buttons (`art-review/gallery.html:110-112,138-139`). `narration.html` (V13-62) can copy this pattern directly; the work is enumerating every `EVENT_NARRATION` branch (including the ~15 conditional sub-variants inside multi-outcome entries like `moored`/`newround`) as static sample rows, not building new UI infrastructure.

13. **V13-15/16 (blue↔green ship confusion, blue→purple)**: `HEXCOL=["#f2679e","#1d96a6","#27c78d","#f5a623"]` (`src/shared/index.js:179`) — seat 1 (`#1d96a6`, a teal-blue) and seat 2 (`#27c78d`, a teal-green) are genuinely close in hue, confirming the complaint. `HEXCOL` is the single source of truth referenced 16+ times across the UI (name color, dot, highlight rects, etc.), so changing `HEXCOL[1]` recolors every UI element for that captain automatically. The **one** asset that does NOT follow from a `HEXCOL` change is the boat art itself — `BOAT_IMG=[1,2,3,4].map(i=>...boats/${i}.png)` (`src/shared/index.js:106`) is a literal PNG per seat, which needs a separate art-regeneration/recolor pass (see Wyatt's Gemini asset pipeline notes). No other captain-specific art assets exist (no per-captain portraits/flags found).

14. **V13-33 (compass size/padding)** is two magic numbers in one place: `const sr=cell*.95,scx=W-sr-14,scy=sr+32;` (`src/ui/board.js:209`) inside `drawBoard()`. Both the size (`sr`) and the top/right offsets (`14`, `32`, in the SVG's fixed 0–640 viewBox units, not literal screen pixels) are trivial constant edits.

15. **V13-17 (vestigial dot)** is a single decorative `<span class="dot">` (`src/ui/util.js:96`, inside `buildPlayerRows()`), styled only by 2 CSS rules scoped to `.player-row`/`.prowTop` (`index.html:149-168`). It has no ID, no click handler, no other reader anywhere in the codebase — confirmed safe to remove exactly as Wyatt asked, with a matching `grid-template-columns`/`grid-template-areas` edit (both reference `"dot"` as a named area). **Note:** a *separate*, differently-scoped `.seat .dot` (`index.html:576`) exists in the **lobby** seat list — that one is not vestigial and V13-17 (which names "the Captains box") should not touch it.

16. **V13-08 (forced device-passing on the first two intro screens) is a confirmed, precisely located UX bug**, not a hypothetical. `netIntroBarrier()` (`src/ui/flow.js:752-769`), used by both `showAhoyIntro()` and `showTurnOrderIntro()`, has a dedicated pass-and-play branch: `for(const p of humans){await passGate(p.idx);await localAsk(msg,opts);}` — every human is pass-gated through the identical message, exactly as Wyatt describes. The fix is scoped to this one function.

---

## Item-by-item

### V13-01 — Pass-and-play bugs (section header)
- **lives_in:** n/a (document heading only)
- **how_it_works_today:** n/a
- **change_shape:** n/a — no independent work; see V13-02 through V13-08 and V13-61.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-02 — Timer-disable button does nothing in pass-and-play
- **lives_in:** `src/orchestrator.js:199-217` (`watchTimer()`), `src/ui/lobby.js` (pass-and-play setup)
- **how_it_works_today:** `watchTimer()` watches a Firebase `timerOff` node and arms/disarms the shot clock — this mechanism is networked/Firebase-mediated. Pass-and-play games (`appState.passAndPlay=true`, `src/ui/flow.js:966`) have no room/Firebase connection at all (`appState.room=null`), so any UI control wired to write to that same Firebase node would be a silent no-op in pass-and-play — there is no local-only equivalent path.
- **change_shape:** the pass-and-play timer-disable button needs its own local code path (toggle `appState.timerOff` directly + call `stopShotClock()`/`rearmShotClock()` locally) instead of (or in addition to) the Firebase-mediated one `watchTimer()` implements.
- **size:** small
- **engine_risk:** confirmed-no
- **risk_notes:** UI/orchestrator-tier only, no engine or event-stream change.
- **already_planned:** none
- **blocked_by:** none

### V13-03 — Timer-disable bug detail: pre-dates "confident-bassi," untested in pass-and-play
- **lives_in:** same as V13-02; test coverage gap is in `scripts/` (no pass-and-play-specific test file found: `real_game_test.js`/`dlog_replay_test.js` exercise the headless `Game.play()` simulator, which has no pass-and-play concept at all — pass-and-play is purely a `src/orchestrator.js`/`src/ui/lobby.js` UI-tier flag)
- **how_it_works_today:** no automated test exists that exercises the pass-and-play device-handoff/local-timer code path. All existing `npm test` gates run the headless engine simulator or DOM-free contract checks — none boot a pass-and-play session.
- **change_shape:** two separable asks bundled in one PDF bullet — (a) fix the bug (see V13-02), (b) add pass-and-play test coverage. (b) would need a browser-level (Chrome-MCP or similar) smoke test, since pass-and-play is UI-orchestration behavior with no headless engine equivalent to unit-test.
- **size:** small (bug) + small (one new smoke test)
- **engine_risk:** confirmed-no
- **risk_notes:** the "confident-bassi" branch reference in the verbatim quote is almost certainly this session's own branch name (`claude/confident-bassi-7263ea`) or a coincidental naming collision — git history should be checked directly, not inferred from this document.
- **already_planned:** none
- **blocked_by:** V13-02 (fix first, then test it)

### V13-04 — Unclear who is betting/calling on battles in pass-and-play
- **lives_in:** `src/ui/flow.js:826-860` (`collectSideBets()`)
- **how_it_works_today:** `collectSideBets()` prompts each non-combatant human via `ask()` with a generic message ("A battle's brewing! Guess the winner…") that does not name the specific spectator being asked. In non-pass-and-play multiplayer this is fine because each human only ever sees prompts addressed to their own seat; in pass-and-play, the same device shows the same generic prompt to whichever spectator's turn it is in sequence, with no name anchor.
- **change_shape:** prefix the prompt string with the target spectator's name (mirrors the V13-05 fix pattern exactly).
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** narration-copy only.
- **already_planned:** none
- **blocked_by:** none

### V13-05 — Fix: name the player being asked to bet
- **lives_in:** `src/ui/flow.js:836` (the `ask(...)` call inside `collectSideBets()`)
- **how_it_works_today:** current string is `⚔️ A battle's brewing! Guess the winner for free and win a dubloon — or back your own call with coin next for double or nothing.` with no name.
- **change_shape:** prepend `${pn(s.idx)}, ` (the same `pn()` helper used throughout the file) to the existing string.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** exact wording given by Wyatt, no drafting needed.
- **already_planned:** none
- **blocked_by:** none

### V13-06 — Unclear in pass-and-play who the bot is hailing for a trade
- **lives_in:** `src/ui/flow.js:701` (the `ask(...)` call inside the bot-hail loop in `botTurn()`)
- **how_it_works_today:** the hail prompt already reads `"📯 {bot} hails you: ..."` — it does address "you," which works fine in real multiplayer (each human only sees their own prompt) but in pass-and-play the device is shared, so "you" is ambiguous until the pass-gate screen names the seat.
- **change_shape:** confirm the pass-and-play `passGate()` flow (see V13-08) already names the seat before this prompt appears; if it does, this is closer to "already handled by the pass-gate screen" than a standalone bug — genuinely needs a live pass-and-play repro to see if the pass-gate screen precedes this specific prompt.
- **size:** trivial-small
- **engine_risk:** confirmed-no
- **risk_notes:** narration-copy; may already be handled — verify live before treating as a fix.
- **already_planned:** none
- **blocked_by:** none

### V13-07 — Fix: bot should refer to trade partner by name
- **lives_in:** `src/ui/flow.js:701`
- **how_it_works_today:** see V13-06 — the human being hailed IS named implicitly ("hails you," addressed to whoever's device is up).
- **change_shape:** if V13-06's investigation finds the pass-gate doesn't reliably precede this prompt, add `${pn(human.idx)}` explicitly into the string.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** V13-06

### V13-08 — Don't force device-passing for screens everyone can read together
- **lives_in:** `src/ui/flow.js:752-769` (`netIntroBarrier()`), called by `showAhoyIntro()` (`:772-775`) and `showTurnOrderIntro()` (`:780-786`)
- **how_it_works_today:** confirmed exactly as Wyatt describes — `if(appState.passAndPlay){ for(const p of humans){await passGate(p.idx);await localAsk(msg,opts);} return; }` pass-gates every human through the identical message.
- **change_shape:** for these two specific intro-barrier calls in pass-and-play, show the message once (one `localAsk`) instead of looping `passGate()` per human. Needs either a parameter on `netIntroBarrier()` (e.g. `sharedRead:true`) or a small dedicated branch, since `netIntroBarrier()` is presumably reused elsewhere for genuinely per-player content (worth confirming no other caller relies on the current per-human pass-gate loop before changing shared behavior).
- **size:** small
- **engine_risk:** confirmed-no
- **risk_notes:** UI/orchestrator-tier only.
- **already_planned:** none
- **blocked_by:** none — this is Wyatt's own "not exactly a bug" flag; the only open question is confirming no anti-cheat/fairness reason exists for the current gate (none was found in code — the gate exists purely because `netIntroBarrier()`'s pass-and-play branch treats every message identically, not because these two screens have special handling).

### V13-09 — UI recentering bug (section header)
- **lives_in:** n/a (heading)
- **how_it_works_today:** n/a
- **change_shape:** see V13-10.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-10 — Yellow tiles and rising icons drift off-center on window resize
- **lives_in:** likely `src/ui/board.js` (`popEmoji`, `drawBoard`) and/or `src/ui/flow.js` (`localPickCell`, `remotePickHighlights`) — **could not conclusively pin down the exact offending code**
- **how_it_works_today:** I read the full rendering path for both symptoms. The yellow movement-highlight squares (`localPickCell` `src/ui/flow.js:182-203`, `remotePickHighlights` `:987-1000`) are drawn as native SVG `<rect>` children positioned in the board SVG's fixed `viewBox="0 0 640 640"` coordinate space (`index.html:819`), using `cellPx=boardCell()` (itself `640/n`, a viewBox-space constant). The "rising icons" are `popEmoji()` (`src/ui/board.js:486-500`), also drawn as SVG children in the same viewBox space. SVG viewBox scaling is designed to make exactly this kind of resize immune to drift — a resize changes the SVG's rendered CSS width (confirmed dynamic via `syncBoardSizing()`, `src/ui/board.js:593-622`, which recomputes `--boardW` from `window.innerHeight`/`innerWidth`), but content positioned in viewBox units should scale proportionally with it automatically.
- **change_shape:** unknown until reproduced live. Given the above, the bug is NOT in the code paths I found — it's either (a) somewhere I didn't trace (a DOM overlay positioned via `getBoundingClientRect()` rather than SVG units, which I searched for and did not find), or (b) a real SVG-scaling edge case (e.g. `syncBoardSizing()`'s stacked/narrow layout swap changing the SVG's *aspect ratio* container rather than just its scale, which could distort a square-viewBox SVG if the container briefly isn't square). Recommend a live repro (resize a narrow window mid-turn, inspect the drifting element in devtools) before estimating a fix.
- **size:** needs-spike
- **engine_risk:** confirmed-no (purely rendering/CSS, no engine involvement either way)
- **risk_notes:** none beyond the sizing uncertainty above.
- **already_planned:** none
- **blocked_by:** none

### V13-11 — New UI feature: ambient wind particles (section header)
- **lives_in:** n/a (heading)
- **how_it_works_today:** n/a
- **change_shape:** see V13-12/13.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-12 — Add a subtle wind-particle effect over the board
- **lives_in:** new code, modeled on `src/ui/board.js:254-275` (`buildStormLayers()`) and its CSS (`#stormOverlay .rlayer`, not shown above but referenced at `board.js:250`)
- **how_it_works_today:** no ambient/non-storm wind effect exists today. The only particle-like rendering is the storm rain, built lazily on first storm (4 `<div>` layers over a tiled PNG, CSS-animated).
- **change_shape:** a new, always-visible overlay reusing the same tiled-PNG-plus-CSS-animation technique, with its own sprite/tile asset, slower `dur`, lower opacity, and direction driven by `appState.game.windNow` (already available every round via the `newround` event). See V13-13 for the risk this raises.
- **size:** small (assuming the Safari question in V13-13 resolves favorably)
- **engine_risk:** confirmed-no (pure rendering; reads `windNow` which is already recorded, no new engine calls needed)
- **risk_notes:** see V13-13.
- **already_planned:** none
- **blocked_by:** V13-13 (the Safari performance question should be resolved before committing to a specific implementation)

### V13-13 — Wind effect must be performant, reuse storm rain code
- **lives_in:** `src/ui/board.js:9-13` (the do-not-refactor header on this exact file), `:254-275` (`buildStormLayers()`)
- **how_it_works_today:** the storm-rain technique is confirmed safe **for its current, intermittent duty cycle**: storms are capped at 2-in-a-row (`rollStorm()`, `src/engine/index.js:12-17`) and are a minority of rounds (`storm:0.125` roll chance, `src/engine/index.js:820`); the rain layers, once built, persist in the DOM but are presumably hidden/shown rather than rebuilt (the `if(ov.childElementCount)return` guard only prevents rebuilding, it doesn't establish visibility toggling — this file's DOM management of *when* the overlay is shown/hidden across storm/no-storm rounds was not fully traced in this pass). The file carries an explicit, prominent do-not-refactor warning tied to the v1.0 Safari near-crash (BUG-01).
- **change_shape:** the requested effect is **always on** (every round, not just during storms) — a fundamentally different duty cycle than anything this rendering technique has been asked to do before, on the exact subsystem that caused a real Safari crash-adjacent bug historically. Reusing the mechanism (good instinct — it IS the proven-safe pattern) does not by itself guarantee a *continuous* 100%-of-game version performs the same as an *occasional* ≤2-round-streak version, especially once layered with every other always-on animation already in the game (chat bubbles, hover states, boat transitions, narration fades).
- **size:** needs-spike
- **engine_risk:** confirmed-no
- **risk_notes:** **Safari-specific, directly adjacent to a documented prior near-crash.** Recommend a dedicated timeboxed Safari performance smoke test (build the always-on layer, play a real multi-round game start-to-finish in actual Safari, watch for frame drops/battery/compositing warnings) as its own task, gating the rest of the feature, before writing it into a full plan.
- **already_planned:** none
- **blocked_by:** none (this IS the gate — nothing else should block on it)

### V13-14 — Ship colors too similar (section header)
- **lives_in:** n/a (heading)
- **how_it_works_today:** n/a
- **change_shape:** see V13-15/16/17.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-15 — Green and blue ships look too similar
- **lives_in:** `src/shared/index.js:179` (`HEXCOL=["#f2679e","#1d96a6","#27c78d","#f5a623"]`)
- **how_it_works_today:** seat 1 is `#1d96a6` (teal-blue), seat 2 is `#27c78d` (teal-green) — both share a teal-leaning hue family, confirming the complaint is well-founded, not a subjective misread.
- **change_shape:** confirmed by V13-16's fix (recolor seat 1 to purple).
- **size:** trivial (diagnostic only — no separate fix needed beyond V13-16)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-16 — Change blue ship/captain to purple, all assets
- **lives_in:** `src/shared/index.js:179` (`HEXCOL[1]`), `src/shared/index.js:106` (`BOAT_IMG=[1,2,3,4].map(i=>...boats/${i}.png)` — seat 1 uses `assets/boats/2.png`)
- **how_it_works_today:** `HEXCOL` is a single source of truth referenced 16+ times across `src/ui/*.js` for every color-coded UI element (name text, dot, highlight rects, coin trim, etc.) — changing one value recolors the captain everywhere in the UI automatically. The only asset that does NOT follow from a `HEXCOL` change is the boat PNG itself, which is a literal per-seat image file. No other per-captain art (portraits, flags, etc.) exists.
- **change_shape:** (1) change `HEXCOL[1]` to a purple hex value in the same visual palette as the other 3 (trivial code edit); (2) regenerate/recolor `assets/boats/2.png` to purple (an art-asset task, not a code task — per the user's own noted Gemini asset-pipeline workflow, this needs the download-button + Chrome-Location-setting process, not a code change).
- **size:** small (code) + small-medium (asset regeneration, outside normal code-review cadence)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-17 — Remove vestigial circle next to captain names
- **lives_in:** `src/ui/util.js:96` (`buildPlayerRows()`, the `<span class="dot">`), `index.html:149-150,157,168` (`.prowTop`/`.player-row .dot` CSS + grid-template-areas)
- **how_it_works_today:** a purely decorative colored `<span>` with no `id`, no click handler, and no other reader anywhere in the codebase (grep-confirmed). It participates in a CSS grid layout (`grid-template-columns: 14px 106px 40px 1fr`, `grid-template-areas` naming a `"dot"` column) shared with the name/coins/chips row.
- **change_shape:** remove the `<span>`, remove the 2 `.prowTop`/`.player-row .dot` CSS rules (NOT the `.seat .dot` rule at `index.html:576` — that's a *different* element in the lobby seat list, out of scope for this ask), and collapse the grid-template-columns/areas from 4 columns to 3.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** low risk of visual regression if the grid-template edit is done carelessly (verify the name/coins/chips row still aligns after dropping a column) — exactly the caution Wyatt himself asked for.
- **already_planned:** none
- **blocked_by:** none

### V13-18 — Sequencing: move recipe choice between two specific narration lines
- **lives_in:** `src/orchestrator.js:664-677` (`runLiveNet()`)
- **how_it_works_today:** current order is `showAhoyIntro()` → shuffle turn order + assign staggered coins → `showTurnOrderIntro(order)` → `recipeDraftNet()`. Recipe choice currently happens AFTER the turn-order announcement, not between the two Ahoy/turn-order lines as requested.
- **change_shape:** swap the last two calls to `await recipeDraftNet(); await showTurnOrderIntro(order);`. Confirmed safe: `showTurnOrderIntro()` makes zero `this.r()` (RNG) calls, and `recipeDraftNet()`'s own RNG draws (bot recipe-card picks, `appState.game.r()<.5?0:1` per bot at `orchestrator.js:622`) are independent of the turn-order shuffle (which already happened earlier, unaffected by this reorder). The headless `Game.play()` determinism simulator doesn't execute `runLiveNet()`/`recipeDraftNet()` at all (confirmed by reading `src/engine/index.js:764-795` — the simulator's `play()` has no recipe-draft step, it uses the constructor's default `recipe:a` directly), so this reorder cannot touch the 31-fixture corpus regardless.
- **size:** trivial
- **engine_risk:** confirmed-no (contradicts INTAKE's "unclear" guess — traced both functions line-by-line)
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** V13-35 (both touch the same anchor string — see Clusters)

### V13-19 — Solo-mode final-round narration is redundant for the winning player
- **lives_in:** `src/orchestrator.js:697` (the `netIntroBarrier(...)` call inside the final-round branch of `runLiveNet()`)
- **how_it_works_today:** exact current string confirmed: `🏁 ${pn(i)} reached the Isle of Tortuga and fired up the bakery! Last chance, crew — every other captain gets ONE final turn to race home!` — fired identically regardless of whether `i` is the human's own seat or a bot's.
- **change_shape:** branch the string on `seatLocal(i)` (the same helper used elsewhere, e.g. `src/ui/flow.js:570`) to show a shorter, 2nd-person-appropriate line when the finisher is the local human. No exact replacement copy exists yet — Wyatt asked for a draft, not a spec.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** copy needs Wyatt's review per project convention (Key Decisions: "copy is authored by Wyatt, not auto-generated").
- **already_planned:** none — thematically adjacent to NARR-05 (2nd-person addressing) but NARR-05's scope as written only covers narration *during* normal play (dock/battle/trade/storm branches), not this specific end-of-voyage barrier message — worth folding into the same pass if Phase 15 is still open, but not literally the same requirement.
- **blocked_by:** Wyatt's copy approval

### V13-20 — Screenshot of current narration/action-panel text
- **lives_in:** n/a (evidence only, confirms V13-19's exact current string)
- **how_it_works_today:** n/a
- **change_shape:** n/a
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-21 — Tutorial helper text (section header)
- **lives_in:** n/a (heading)
- **how_it_works_today:** confirmed **no settings menu exists anywhere in the codebase** (grep for "settings"/"Settings" across `src/` and `index.html` returns nothing) and no hints/onboarding infrastructure of any kind exists.
- **change_shape:** see V13-22 through V13-32 — this is a full feature build from zero existing scaffolding, not an extension of something partial.
- **size:** large
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none — this is the item STATE.md's Deferred Items flags as thematically adjacent to the already-deferred TUT-01…03. The two are NOT the same requirement (TUT is a scripted 30-60s walkthrough auto-dropping into a solo game; this is contextual, action-triggered inline hints with a persistent settings toggle), but both are large, both serve onboarding, and this document does not resolve whether approving this reopens deferred scope — that's explicitly a decision for Wyatt (see INTAKE's own flag).
- **blocked_by:** Wyatt's scope decision (is this in-scope new work, or does it count as reviving deferred TUT scope?)

### V13-22 — New players should get contextual mechanic explanations on first actions
- **lives_in:** would touch every action-prompt call site — `src/ui/flow.js` (`humanAct`, `humanWind`, `humanDock`, `humanTrade`, `fishCast`, battle prompts) — each needs a per-action, per-player "how many times has this action fired" counter and a branch on it.
- **how_it_works_today:** no per-action-per-player counters exist. `p.firstFlip`/`p.dockedNow` (Sets on the player object, `src/engine/index.js:202`) track something adjacent (first dock-flip eligibility, not hint-display state) but aren't a general "times this action type has fired for this player" counter.
- **change_shape:** new per-player, per-action-type counters (state, not engine — this is display logic, doesn't need to be in the deterministic `Game` object at all, could live in `appState` or a parallel structure keyed by player+action).
- **size:** medium
- **engine_risk:** confirmed-no (as long as the counters live outside the `Game` class / engine state — recommend they do, to avoid any determinism entanglement)
- **risk_notes:** touches many call sites (every action type), so the surface area is wide even though each individual change is simple.
- **already_planned:** none
- **blocked_by:** V13-28/29 (needs the actual hint copy before it can be wired in)

### V13-23 — Boat movement should ease in/out along an S-curve
- **lives_in:** `src/ui/board.js:237` (`transition: transform .35s cubic-bezier(.42,0,.58,1)`)
- **how_it_works_today:** the CSS timing function applied to every ship position change is `cubic-bezier(.42,0,.58,1)`, which is the literal, exact definition of the standard `ease-in-out` keyword — technically already an S-curve. Ship movement is animated one square at a time (each hop restarts this same short transition), so over a single ~40px hop the ease-in ramp-up phase is compressed into a fraction of the 0.35s and reads as imperceptible, leaving only the visible deceleration — plausibly explaining why it looks like ease-out-only despite the underlying curve already being symmetric.
- **change_shape:** exaggerate the curve (e.g. steeper control points like `cubic-bezier(.65,0,.35,1)` or similar) and/or lengthen the duration slightly so the ramp-up phase becomes visible over a single-square hop. A CSS-only constant tweak, no JS logic change.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** purely cosmetic CSS; verify visually on both Chrome and Safari since any duration change interacts with the game's overall pacing (bots already have `botMsgHoldMs()`/`botBeat()` timing tuned around current animation lengths).
- **already_planned:** none
- **blocked_by:** none

### V13-24 — "Eg:" header introducing staged example hint texts
- **lives_in:** n/a (document structure only)
- **how_it_works_today:** n/a
- **change_shape:** n/a
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-25 — Example: first-time action text spells out full mechanics
- **lives_in:** would be new copy consumed by V13-22's counter/branch logic
- **how_it_works_today:** n/a (illustrative example, not a locked spec)
- **change_shape:** none until V13-28/29 deliver real copy
- **size:** trivial (it's an example)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** V13-28

### V13-26 — Example: second-time action text adds a strategy hint
- **lives_in:** same as V13-25
- **how_it_works_today:** n/a
- **change_shape:** none until V13-28/29 deliver real copy
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** V13-28

### V13-27 — Example: third-plus time, text becomes short/permanent
- **lives_in:** same as V13-25
- **how_it_works_today:** n/a
- **change_shape:** none until V13-29 delivers real copy
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** V13-29

### V13-28 — Deliverable: write two "game hints" per action, for Wyatt to review
- **lives_in:** new copy, not code
- **how_it_works_today:** no hint copy of any kind exists today.
- **change_shape:** a content-drafting task (list every distinct action type — sail, dock, trade, attack, fish, at minimum — and write 2 hint variants each), delivered to Wyatt for review before wiring into V13-22's mechanism.
- **size:** small (writing) — but is a hard gate before V13-22/30-32 can be considered complete
- **engine_risk:** confirmed-no
- **risk_notes:** Wyatt review required per project's own established pattern (Key Decisions: storm-text rewrite required his sign-off).
- **already_planned:** none
- **blocked_by:** none (this unblocks V13-22/25/26)

### V13-29 — Deliverable: write a short 3rd+ time action prompt
- **lives_in:** new copy, not code
- **how_it_works_today:** n/a
- **change_shape:** same as V13-28, one more short-form variant per action.
- **size:** trivial (writing)
- **engine_risk:** confirmed-no
- **risk_notes:** same review-gate as V13-28.
- **already_planned:** none
- **blocked_by:** none

### V13-30 — Add a settings menu with a hints on/off toggle
- **lives_in:** new UI — no settings-menu scaffolding of any kind exists in `index.html` or `src/ui/*.js` today (confirmed by grep)
- **how_it_works_today:** there is no settings modal, no settings state in `src/state/index.js`, nothing to extend.
- **change_shape:** build a new modal (there's ample precedent for modals in this codebase — Credits modal, leave-game modal, etc. — so the pattern to follow exists, just not a settings-specific one) plus a new `appState`-backed hints-on/off flag persisted the same way other prefs are (localStorage, matching the `pp_sess`/`pp_solo` pattern already used elsewhere).
- **size:** small-medium
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none (but naturally bundles with V13-32, since both want a settings menu)

### V13-31 — Hints default on for first play in a new browser, then off
- **lives_in:** would live alongside V13-30's new hints flag, likely gated by the same localStorage mechanism the game already uses to detect "have I played before" (worth checking whether such a flag already exists, e.g. via `pp_sess`/`pp_solo` presence, before inventing a new one)
- **how_it_works_today:** localStorage is already used for session/solo-state persistence (`pp_sess`, `pp_solo` — see PROJECT.md's platform notes); no existing "has this browser ever played" flag was specifically identified in this pass.
- **change_shape:** on first boot with no prior session data, default hints-on; on any subsequent boot, default hints-off (overridable via V13-30's toggle).
- **size:** small
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** V13-30

### V13-32 — Move turn clock on/off toggle into settings, keep play/pause on the clock
- **lives_in:** `src/orchestrator.js:199-217` (`watchTimer()`, the existing on/off toggle mechanism), `src/ui/panel.js` (the clock UI, including the already-shipped Phase-13 play/pause control)
- **how_it_works_today:** a turn-clock-off Firebase-mediated toggle already exists (the same mechanism V13-02/03 says is broken in pass-and-play). Play/pause (a *different* control, CLOCK-02/03, already shipped Phase 13) is separate and would stay on the clock itself per this ask.
- **change_shape:** relocate the existing on/off control's UI trigger into the new settings menu (V13-30) without touching its underlying Firebase-mediated logic, while leaving play/pause where it is.
- **size:** small (assuming V13-30's settings menu exists first)
- **engine_risk:** confirmed-no
- **risk_notes:** **this is the item at the center of the turn-clock default-state tension** — see the "Conflicts and Tensions" carried forward from INTAKE. This item's own ask (relocate the toggle) is UI-only and safe; it's V13-60's separate "default it to off" ask that collides with Phase 13's CLOCK-01 critical fix. Do not conflate the two — this item alone is low-risk.
- **already_planned:** none
- **blocked_by:** V13-30 (settings menu must exist first); Wyatt's reconciliation of the default-state question (V13-60) — though that reconciliation doesn't block THIS item's toggle-relocation part

### V13-33 — Make the compass bigger with tighter corner padding
- **lives_in:** `src/ui/board.js:209` (`const sr=cell*.95,scx=W-sr-14,scy=sr+32;` inside `drawBoard()`)
- **how_it_works_today:** the compass HUD is an SVG group sized by `sr` (radius, currently `cell*.95`) and positioned at `(scx,scy)` where the offsets `14`/`32` are in the SVG's fixed 0–640 viewBox units, not literal screen pixels.
- **change_shape:** increase `sr`'s multiplier and reduce the offset constants. Converting "5px" (Wyatt's literal screen-pixel ask) into viewBox units requires knowing the SVG's typical rendered size (dynamic via `syncBoardSizing()`) — an approximate viewBox-unit equivalent should be chosen and visually verified at a couple of window sizes, since viewBox units and rendered CSS pixels aren't 1:1.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** the compass HUD group appears to be built once in `drawBoard()` (called at game start), not on every resize — worth a quick visual check that it still looks correctly padded across the responsive layout's wide/narrow modes (`syncBoardSizing()`'s two branches), not just one.
- **already_planned:** none
- **blocked_by:** none

### V13-34 — Narration changes (section header)
- **lives_in:** n/a (heading)
- **how_it_works_today:** n/a
- **change_shape:** see V13-35 through V13-41.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-35 — Replace the opening narration line with exact new wording
- **lives_in:** `src/ui/flow.js:773` (`showAhoyIntro()`)
- **how_it_works_today:** confirmed exact current string matches INTAKE's quoted "FROM" text verbatim.
- **change_shape:** a literal string replacement — exact "TO" text already given by Wyatt, no drafting needed.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none — but see V13-18: both touch this exact string, and V13-18's "AFTER X, BEFORE Y" sequencing instruction should be written against whichever wording ships (the new one, since it's clearly intended to survive the rewrite). Sequence the plan so the rewrite (V13-35) and the reorder (V13-18) are described as one coordinated change, not two independent diffs racing to touch the same line.

### V13-36 — Clarify the docking flip outcome (heads=ingredient, tails=3 coins)
- **lives_in:** `src/ui/util.js:335-342` (`EVENT_NARRATION.dock`, specifically the `bought`/`coins` variants) and/or `src/ui/flow.js:340-369` (`humanDock()`, the flip prompt text itself, e.g. `"Docking at {ing} — flip!"`)
- **how_it_works_today:** confirmed the mechanic is exactly as Wyatt describes (heads → ingredient, tails → 3 coins + can buy anyway if `cfg.dockBuy`) — `src/engine/index.js:401-406`. The narration strings that describe the OUTCOME already exist (`docks at {place} for {ing} and flips tails, but buys it anyway for 3🌕`, etc.) but nothing narrates the RULE up front, before the flip.
- **change_shape:** add explanatory text to the pre-flip prompt (`humanFlip(p, "Docking at {ing} — flip!", true)` at `flow.js:352`), e.g. spelling out "heads = keep it, tails = 3🌕 instead." No exact wording given by Wyatt — needs drafting + his review.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** copy needs Wyatt's review.
- **already_planned:** none — this is closely related to, but distinct from, the already-tracked V13-22/25 (contextual first/second-time hints) ask; if the hints system (V13-21-32) ships, this specific clarification could be folded into that system's "dock" hint text rather than being a separate always-shown line. Worth reconciling in planning rather than building both independently.
- **blocked_by:** Wyatt's copy approval; possibly supersedable by V13-25/26 if the hints system ships in the same milestone

### V13-37 — Replace ambiguous movement-cost text with exact new wording
- **lives_in:** `src/ui/flow.js:178` (`"...click a highlighted square to sail (−1🌕)"` inside `humanWind`'s pick-cell call) and `src/ui/flow.js:199` (the same string literal inside `localPickCell()`), `src/ui/flow.js:997` (`remotePickHighlights()`'s copy of the same string)
- **how_it_works_today:** the exact string Wyatt quotes as needing replacement (`"click a highlighted square to sail (–1🪙)"`) appears **three times** as near-duplicated literals across `flow.js`, not once — confirmed by grep. All three need the same edit or they'll drift out of sync (exactly the kind of duplication this project's own anti-pattern notes warn about).
- **change_shape:** replace all three occurrences with the new exact text (`"Pay 1🌕 to sail to any yellow square"`), or better, extract to one shared string/helper so future copy edits only touch one place.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** exact replacement text given by Wyatt, no drafting needed; the only real risk is missing one of the three occurrences.
- **already_planned:** none
- **blocked_by:** none

### V13-38 — Turn-clock-timeout dialogue currently only appears in the captain's log
- **lives_in:** `src/ui/util.js:757-765` (`applyShotClockPenalty()`), `src/ui/panel.js:345-359` (`narrateLastEvent()`, the guard clause), `src/orchestrator.js:223-258` (`expireShotClock()`)
- **how_it_works_today:** see Headline Finding #6 — the 20s soft-timeout genuinely can be silently dropped from the visible narration box by `narrateLastEvent()`'s `needsAction` guard. The 30s hard-timeout uses `flash()` directly (no such guard) and likely already displays.
- **change_shape:** confirmed scoping — this is really about the 20s soft-timeout path only.
- **size:** small
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-39 — The two specific missing timeout lines
- **lives_in:** `src/ui/util.js:385` (`shotclock` narration string), `src/ui/util.js:386` (`shotclockskip` narration string) — both already exist as `EVENT_NARRATION` entries and both already fire correctly into the captain's log (confirmed by cross-referencing against the mined pass-and-play log in INTAKE's own V13-61, which shows both lines verbatim).
- **how_it_works_today:** both narration strings already exist and are correct; only the *display path* for the 20s one is sometimes suppressed (see V13-38).
- **change_shape:** no copy changes needed — this is purely V13-38's display-path fix, applied and then verified against these two specific lines.
- **size:** trivial (verification only, once V13-38 is fixed)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** V13-38

### V13-40 — Requirement: captain's log and narration box must stay in parity (voice differs only)
- **lives_in:** `src/ui/panel.js` (`narrateLastEvent()`'s guard), `src/ui/util.js` (`EVENT_NARRATION` table — currently 3rd-person by default for most branches)
- **how_it_works_today:** two separate gaps exist today: (1) the `needsAction` guard can silently drop lines from the on-screen box (V13-38's mechanism), and (2) most `EVENT_NARRATION` strings render 3rd-person (`pn(e.p)` — the player's colored name) even when `e.p` is the local human, with no systematic "say 'you' instead" branch.
- **change_shape:** (2) is, functionally, **the same requirement as the already-unbuilt NARR-05** (Phase 15: "Whenever the narration box describes an action *you* took, it addresses you in 2nd person... including the 'already anchored safely' line and every other self-referential narration branch"). This item's parity requirement and NARR-05's 2nd-person requirement describe the identical fix from two different angles (log-vs-box parity, and 3rd-vs-2nd-person voice) — see Clusters.
- **size:** medium (touches every `EVENT_NARRATION` branch, ~15+ entries)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** **Phase 15 (NARR-05)** — recommend treating V13-40 as evidence/detail supporting NARR-05's implementation, not a separate item to plan.
- **blocked_by:** none

### V13-41 — Fishing benefit unclear — show numeric value on the button
- **lives_in:** `src/ui/flow.js:513` (`opts.push({label:"🎣 Fish",value:"fish"});` in `humanAct()`), `src/ui/flow.js:124` (the `"Cast your line — flip!"` prompt inside `fishCast()`)
- **how_it_works_today:** fishing pays a flat +2 coins on heads, +1 on tails (`p.coins+=h?2:1` behavior confirmed via `src/ui/flow.js:133`, gated by `cfg.sardine` which is always `true` per `roundCfg`, `src/engine/index.js:820`) — the button itself shows no numbers today, just "🎣 Fish."
- **change_shape:** append `(+1-2🌕)` to the button label; add a `+` prefix specifically for the +2 heads outcome in whatever narration/flavor text names candy-crab/sugarfish catches (these appear to be flavor-only asset names for a heads catch, not a distinct mechanic — worth confirming no separate ingredient-specific fishing bonus exists beyond the flat heads/tails split found here).
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** exact button text given by Wyatt.
- **already_planned:** none
- **blocked_by:** none

### V13-42 — Recipe logic bug (section header)
- **lives_in:** `src/engine/index.js:195-204` (the `Game` constructor's player-recipe assignment loop)
- **how_it_works_today:** see V13-43/44 for the full trace.
- **change_shape:** see V13-44.
- **size:** medium
- **engine_risk:** confirmed-yes
- **risk_notes:** see V13-44.
- **already_planned:** none
- **blocked_by:** none

### V13-43 — Bug: Pound cake was offered to (and chosen by) two players
- **lives_in:** `src/engine/index.js:195-204`
- **how_it_works_today:** confirmed by direct code read. Each player independently draws two candidate recipe cards: `const a=this.sample(this.ings,cfg.recipeSize); let b=this.sample(this.ings,cfg.recipeSize); while(tries++<20 && a.slice().sort().join()===b.slice().sort().join())b=this.sample(...)`. The retry loop only guards against `a` and `b` being identical **for that one player** — there is zero check against any OTHER player's `recipeChoices`. With 7 possible ingredients and a recipe size of 5 (`recipeSize:5`, `nIslands:7` in `roundCfg`), the pool of distinct 5-of-7 combinations is small (21 total), so collisions across 4 players independently sampling from it are entirely expected, not a fluke.
- **change_shape:** none beyond confirming the root cause — the fix is described in V13-44.
- **size:** medium
- **engine_risk:** confirmed-yes
- **risk_notes:** see V13-44.
- **already_planned:** none
- **blocked_by:** none

### V13-44 — Expected fix: pre-select 8 unique recipes (2 per player) before the game starts
- **lives_in:** `src/engine/index.js:195-204` (constructor), plus **the exact same constructor code path is shared by the headless `Game.play()` determinism simulator** (`src/engine/index.js:764-795`) — confirmed by reading `play()`: it never re-derives or reassigns `p.recipe`/`recipeChoices`, it simply uses whatever the constructor already set. Every one of the 31 committed determinism fixtures was captured by instantiating a `Game` and calling `play()`, so every fixture's recorded event stream already reflects the CURRENT (buggy, non-unique) recipe-assignment RNG draw sequence.
- **how_it_works_today:** confirmed via V13-43 — no cross-player uniqueness exists.
- **change_shape:** the constructor's recipe-assignment loop (lines 195-204) must become a genuinely shared, pool-based draw — e.g. shuffle all `nIslands` ingredients once, hand out non-overlapping recipe-sized slices, and separately draw a *second* non-overlapping card per player from the remaining pool (or some other scheme guaranteeing all 2×N cards across every player are pairwise-distinct as sets). **Any implementation of this changes how many `this.r()` calls the constructor makes and in what pattern**, compared to today's per-player independent `sample()`+retry-loop. This is the exact "RNG draw order/count changes during setup" class of change the project's own determinism-annotation discipline exists to flag.
- **size:** medium
- **engine_risk:** confirmed-yes — **this is unambiguously fixture-breaking.** It touches code that runs unconditionally at the top of every single `Game` construction, in front of even round 1's wind roll, for every one of the 31 fixture seeds. There is no scoping this down to "only some seeds" or "only live play" — the headless simulator hits this exact code every time. This must be batched into the SAME single gated re-record as any other engine-tier change from this list (see the Clusters section's "Engine re-record batch").
- **risk_notes:** recommend implementing this LAST among any engine-tier changes selected for the milestone, immediately before the one deliberate re-record, exactly as Phase 14 did with its 3 engine changes batched into one re-record event.
- **already_planned:** none
- **blocked_by:** none, but should be sequenced with any other engine-risk item chosen for this milestone (see V13-55, V13-60's restock clause, V13-61) so the corpus is re-recorded exactly once.

### V13-45 — Rename "Parley" to "Trade" (section header)
- **lives_in:** see V13-46
- **how_it_works_today:** see V13-46
- **change_shape:** see V13-46
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** Wyatt's yes/no on the rename

### V13-46 — Players don't understand "Parley" — rename to "Trade"?
- **lives_in:** `src/ui/flow.js:510` (action-menu button label `"🤝 Parley"`), `src/ui/flow.js:386` (`"Parley with whom?"` prompt), `index.html:722` (Credits/help-modal sentence describing Parley)
- **how_it_works_today:** confirmed exactly 3 user-facing strings say "Parley" anywhere in the codebase. All internal code identifiers (`tryTrade()`, `tradeOpp()`, `tradeCandidate()`, the `{t:"trade",...}` event type) already use "trade" terminology, per CLAUDE.md's own documented naming conventions.
- **change_shape:** a pure UI-label string swap across exactly 3 locations — zero data-model, event-schema, or code-identifier changes needed.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** Wyatt's yes/no (literally phrased as a question in the source PDF)

### V13-47 — Grey out the (renamed) trade button when no one has resources
- **lives_in:** `src/ui/flow.js:508-509` (the Attack button's existing `disabled:!canAfford` + conditional `sub` text — the direct precedent), `src/ui/flow.js:510` (the Parley/Trade button, which currently has no disabled state)
- **how_it_works_today:** the Attack button already implements exactly this pattern: `opts.push({label:..., value:"attack", disabled:!canAfford})` plus a conditional `sub` helper string shown beneath the button (`const sub=targets.length?(canAfford?...:...):null;`, `flow.js:520`). The Trade/Parley button currently just conditionally appears or doesn't (`if(appState.game.tradeOpp(p).length)opts.push(...)`) — it's hidden, not greyed-out-with-explanation, when there's no one to trade with.
- **change_shape:** change the Trade button from conditionally-hidden to always-shown-but-conditionally-disabled (mirroring Attack), with italic sub-text when disabled. Exact italic copy not given by Wyatt — needs drafting.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** depends on V13-46's rename decision landing first (or can be built against "Parley" and renamed together).
- **already_planned:** none
- **blocked_by:** V13-46 (rename decision); Wyatt's copy approval for the italic sub-text

### V13-48 — Trade winds are not intuitive to new players (section header)
- **lives_in:** n/a (heading)
- **how_it_works_today:** n/a
- **change_shape:** see V13-49 through V13-52.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-49 — Players don't know how to enter the trade winds
- **lives_in:** `src/engine/index.js:244-251` (`tradewind()`) — entering the rim is entirely automatic (any ship whose position lands on a rim cell, via normal sailing OR a storm push, is immediately swept to that quadrant's head cell) — there is no player action that "enters" the trade winds, it just happens passively when a ship's path crosses the rim.
- **how_it_works_today:** confirmed — the mechanic is 100% automatic/passive; the game currently gives no advance warning that a given sail destination or storm push will cross into the rim before it happens.
- **change_shape:** this is a discoverability/communication ask, not a mechanic change — e.g. visually distinguishing rim cells more strongly on the board (`this.rim`/`onRim()` cells are already tracked and rendered, `src/engine/index.js:58-93`, `src/ui/board.js` reads `appState.game.valid`/rim data for rendering), or adding a one-time explanatory hint (dovetails with V13-21-32's hints system) the first time a player is swept in.
- **size:** small (visual tweak) to medium (if bundled with a dedicated explanatory hint)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none (though naturally pairs with V13-21-32 if that system ships)

### V13-50 — Players don't know where the trade winds will take them
- **lives_in:** `src/engine/index.js:74-93` (the rim-arc/quadrant layout construction inside the constructor) — arc lengths and rotation are randomized per game (`this.r()` calls, see the code's own comment: "Arc lengths are randomized per game... instead of 4 fixed 90° slices... occasionally one arc spans nearly half the rim")
- **how_it_works_today:** the destination (`rimHead`, the clockwise-most cell of whichever arc a ship enters) is fully determined at game-start RNG time and never changes mid-game, but nothing in the UI currently previews or labels where a given rim entry point leads.
- **change_shape:** a UI-only addition — e.g. rendering a visual arrow/highlight from any rim cell toward its `rimHead` destination (the data already exists in `this.rimHead`/`this.rimCellInfo`, explicitly "kept for rendering flow arrows" per the constructor's own comment at `:92`, suggesting this was anticipated but not yet built).
- **size:** small-medium
- **engine_risk:** confirmed-no (purely reads existing, already-computed `rimHead`/`rimCellInfo` state — no new RNG, no new engine logic)
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-51 — Research: how to visually signal whirlpools as "stop/drop-off" points
- **lives_in:** n/a (this is a research/design ask, not a code location)
- **how_it_works_today:** n/a
- **change_shape:** explicitly a research task per Wyatt's own wording ("Research what common semiotics/game symbols might be to convey that") — not a specified visual change. No code work should be estimated until a specific design direction comes back for his approval.
- **size:** needs-spike (design research, not implementation)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** Wyatt's approval of whatever direction the research surfaces

### V13-52 — Research: how to make trade winds visually read as "windy" with direction
- **lives_in:** n/a (research ask)
- **how_it_works_today:** n/a
- **change_shape:** same caveat as V13-51 — research first, implementation estimate after.
- **size:** needs-spike
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** Wyatt's approval

### V13-53 — Bugs: multiplayer playtest (section header)
- **lives_in:** n/a (heading)
- **how_it_works_today:** n/a
- **change_shape:** see V13-54 through V13-60.
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** **important scoping note, confirmed:** this section's bugs come from a DIFFERENT playtest session (Arrrrkay/Susharrrrrgh, real multiplayer) than the captain's-log dump mined for V13-61 (Cat Hook/Flaky Jack/Captain Cannoli/Wyyyyy, pass-and-play). None of the log evidence gathered for V13-61 should be treated as direct evidence for V13-55/57/59's specific claims — I've kept these separate throughout this document.
- **already_planned:** none
- **blocked_by:** none

### V13-54 — Intro: the Arrrrkay/Susharrrrrgh playtest had many bugs
- **lives_in:** n/a (framing only)
- **how_it_works_today:** n/a
- **change_shape:** n/a
- **size:** trivial
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-55 — Question: was turn order changed / why miss a turn every 4th time?
- **lives_in:** `src/orchestrator.js` (turn-order/`order` array handling throughout `runLiveNet()`), `src/engine/index.js:764-795` (`play()`'s equivalent loop)
- **how_it_works_today:** confirmed — no modulo-4, periodic, or conditional turn-skip logic exists anywhere in the codebase. `order` is a plain shuffled array of all player indices, iterated in full every round (`for(const i of order){ const p=appState.game.players[i]; if(p.done)continue; ...}`) — the ONLY skip condition is `p.done` (a player has already finished the race), which is a real, intentional, and narration-announced state, not a silent periodic glitch.
- **change_shape:** cannot be determined from static reading — either (a) this is a genuine live-only bug in a code path I haven't found (multiplayer-specific desync, a Firebase race, or a UI rendering glitch that only *looks* like a skipped turn), or (b) player misperception (e.g. mistaking a bot's near-instant turn for "no turn happened"). Recommend a live two-window multiplayer repro session with the captain's log open, watching specifically for a seat that goes 4 real turns without an action, before estimating a fix.
- **size:** needs-spike
- **engine_risk:** still-unclear — INTAKE guessed "yes" (core turn-sequencing); I could not confirm a code-level mechanism, but cannot rule one out either without a live repro, since turn order genuinely IS engine-tier state (`this.players`, `order`) and any real bug found here would very likely require an engine-tier fix.
- **risk_notes:** if a real bug is found and requires an engine change, it should be batched into the same re-record as V13-44 (see Clusters — Engine re-record batch) rather than triggering a second corpus re-record.
- **already_planned:** none
- **blocked_by:** none

### V13-56 — Fix: ensure no old turn-skipping mechanic/narration remains
- **lives_in:** searched all of `src/*.js`, `src/*/*.js`, `index.html`
- **how_it_works_today:** confirmed — grep for "wheel", "skipTurn", "turnSkip", "passWheel" and similar returns exactly one match: `src/ui/util.js:660`, `"🧭 {name} takes the wheel…"`, which is the CURRENT, correct, normal turn-start narration (fires once per turn via `describe()`/the `turn` event), not a vestige of any removed mechanic.
- **change_shape:** none needed — Wyatt's own belief that this was already removed appears correct. No code action required.
- **size:** trivial (verification only)
- **engine_risk:** confirmed-no
- **risk_notes:** none
- **already_planned:** none — **this item rests on a premise (a lingering vestige) that the current code does not support; recommend closing it as "verified clean, no vestige found" rather than scheduling any work.**
- **blocked_by:** none

### V13-57 — Parlays should allow 2-way ingredient trading, not just cash
- **lives_in:** `src/ui/flow.js:370-496` (`humanTrade()`) — the full trade-offer flow already supports offering an ingredient, coins, or both together (`st.baseIng`/`st.extraCoins`, the "sweeten a crate with a few coins" step at `:395-416`) as a genuine engine-agnostic UI capability that both human-vs-human and human-vs-bot trades already exercise.
- **how_it_works_today:** confirmed — the trade flow's OWN code fully supports ingredient-for-ingredient (or ingredient+coins) trades today; this isn't a partially-built feature. The mined pass-and-play captain's log (a different session, but the same underlying engine/UI code) shows successful ingredient-for-ingredient trades firing (`"Cat Hook trades Fresh Milk to Wyyyyy for Crystal Sugar"`).
- **change_shape:** given the mechanism plainly exists and works in the pass-and-play/solo code path, if the Arrrrkay/Susharrrrrgh **multiplayer** session genuinely couldn't do this, the gap is most likely UI-flow discoverability (the multi-step "Parley with whom → what do you want → offer which ingredient → sweeten with coin" wizard, `:384-418`, could plausibly be missed/abandoned partway by a real player who doesn't realize ingredient offers are an option) rather than a missing capability — but this is circumstantial, matching INTAKE's own caveat.
- **size:** unclear until investigated (see V13-58) — if it's discoverability, likely small (better button copy/labeling in the wizard); if it's a genuine multiplayer-specific desync/bug, size unknown.
- **engine_risk:** still-unclear
- **risk_notes:** none beyond the investigation need.
- **already_planned:** none
- **blocked_by:** V13-58 (the investigation)

### V13-58 — Investigate: UI confusion vs. actual bug blocking ingredient trades
- **lives_in:** same as V13-57
- **how_it_works_today:** the wizard flow is fully implemented and, per the mined pass-and-play log, does work in that code path. No multiplayer-specific special-casing of the trade flow was found (`humanTrade()` doesn't branch on `appState.room`/`appState.passAndPlay` at all — it's the same code for solo, pass-and-play, and multiplayer).
- **change_shape:** since the code is shared across all three modes with no multiplayer-specific branch, a genuine *code* bug specific to multiplayer trading is less likely than UI/UX confusion in the moment — but this remains circumstantial without a live multiplayer repro from the actual reporting players.
- **size:** needs-spike (investigation, not a fix estimate)
- **engine_risk:** still-unclear
- **risk_notes:** none
- **already_planned:** none
- **blocked_by:** none

### V13-59 — Ingredients mysteriously disappeared ("dad's milk," "Susha's chocolate")
- **lives_in:** every ingredient-removal site was traced: `src/engine/index.js:401-406` (`doDock`, token↔player transfer), `:290-296` (storm-aground crate loss, restocks via `tokens[lost]++`), `:570-573` (battle spoils, transfers between two players' hands, never destroys supply), `src/orchestrator.js:240-247` (`expireShotClock`'s hard-timeout crate loss, restocks via `appState.game.tokens[lost]++`)
- **how_it_works_today:** **every one of these paths already conserves total ingredient supply** (`tokens[ing]` at the island + the sum across all players' `p.ing` arrays never shrinks in any traced path) — a crate either moves from the shared pool to a player's hand, from one player's hand to another's, or from a player's hand back to the shared pool. I could not find a code path where a crate is removed from circulation with no compensating increment anywhere.
- **change_shape:** cannot be determined from static reading alone — the described symptom doesn't match any bug I could locate in the conservation logic itself. See V13-60/61 for the closest lead (a plausible, unconfirmed connection to the already-known-broken pass-and-play timer-disable toggle).
- **size:** needs-spike
- **engine_risk:** still-unclear (INTAKE guessed "yes"; I found no supply-conservation bug in the code that WOULD fire, which argues against a straightforward engine fix — but a live repro could still surface a real path I didn't trace, e.g. a race between two nearly-simultaneous events in actual multiplayer)
- **risk_notes:** if a real conservation bug IS found, it would almost certainly be engine-tier (touching `tokens[ing]`/`p.ing` bookkeeping) and would need batching into the same re-record as V13-44.
- **already_planned:** none
- **blocked_by:** V13-60/61's investigation

### V13-60 — Investigate ingredient-disappearance cause; possibly turn clock OFF by default + explanatory modal
- **lives_in:** this bundles three genuinely separate asks — (a) investigate the disappearance (see V13-59/61), (b) turn clock OFF by default (see the Conflicts section, unchanged from INTAKE — directly reverses Phase 13's CLOCK-01 critical fix, must go back to Wyatt), (c) "ensure [ingredient restock on timeout] is functioning correctly" — confirmed already correct in code (`src/orchestrator.js:245`, `appState.game.tokens[lost]++`, fires every time a crate is lost to a hard timeout).
- **how_it_works_today:** (c) is already working as designed, per the trace in V13-59.
- **change_shape:** (a) needs a live repro, not more static reading (see V13-59/61); (b) is a decision-only item, not a size estimate — do not build anything here until Wyatt explicitly reconciles it against Phase 13's shipped, human-verified CLOCK-01 fix; (c) needs no fix — it's a verification-only item, and this document verifies it.
- **size:** (a) needs-spike; (b) blocked on decision, not sized; (c) trivial (already correct — verification, no fix)
- **engine_risk:** (a) still-unclear; (b) confirmed-no (a config/default-value change, not an engine/event-stream change, so even if approved this specific piece carries no determinism risk by itself); (c) confirmed-no (already correct)
- **risk_notes:** (b) is the single highest-stakes reconciliation question in this whole document — it directly proposes reversing a critical, human-verified fix from the immediately-preceding phase. Do not resolve it implicitly; it needs its own explicit conversation with Wyatt, ideally before this milestone's scope is finalized, since it changes the shape of the multiplayer-clock story regardless of which way it's decided.
- **already_planned:** none
- **blocked_by:** Wyatt's decision on (b); V13-61's investigation for (a)

### V13-61 — Audit the pass-and-play captain's log for the "ingredients disappearing" bug
- **lives_in:** the full trace covers `src/engine/index.js` (windPush/aground/moored), `src/ui/flow.js` (windLeg/botWindLeg, humanTrade, bot-hail), `src/orchestrator.js` (expireShotClock)
- **how_it_works_today:** three specific patterns flagged by INTAKE as possible bugs were each traced to their actual code and **all three turned out to be intentional, correct, non-duplicate behavior**:
  1. *"Two gales in immediate succession for the same player"* (Round 3) — a storm push is genuinely two separate legs (`windNow` then `windNow2`), each independently capable of blowing a docked ship off its dock and firing its own `blownOut` event. Two legitimate leg-events, not a duplicate-logging artifact (`src/ui/flow.js:206-278`, `src/engine/index.js:270-305`).
  2. *"Two lines for one trade, but only sometimes"* (Round 12) — a bot-hail trade genuinely fires two events by design (`parley` negotiation record, then `trade` execution record, `src/ui/flow.js:712,717`), while a direct human-to-human accepted trade fires only one (`src/ui/flow.js:492`). Both are correct for their respective code paths; the log simply shows both kinds of trade happening in the same game.
  3. *"Was too slow" firing twice for the same player in the same round* (Round 12) — this is the SAME turn's two-stage timeout penalty (20s soft warning, `shotclock`, then 30s hard skip, `shotclockskip`), not two separate rounds/turns. Both firing for one over-length turn is the designed escalation, not a bug.
- **change_shape:** given all three flagged patterns are refuted as bugs, the actual root cause of the reported vanished milk remains genuinely open. The most plausible remaining lead, not confirmed: **V13-02/03's already-broken pass-and-play timer-disable toggle** could leave a stale shot-clock `setInterval` running across a device hand-off in pass-and-play (a mode where `watchTimer()`'s Firebase-mediated on/off has no effect, per V13-02), which could plausibly cause the shot clock to misfire against the wrong player/turn or double-fire in a way that ISN'T caught by `expireShotClock()`'s existing re-entrancy guard (which guards against the SAME function re-firing on its own dangling interval, not against a cross-turn stale-interval scenario). This is a reasoned hypothesis, not a confirmed root cause — it needs a live pass-and-play session with a temporary total-ingredient-supply assertion added, watched through several rounds including a deliberate slow-play timeout, to catch the actual moment of loss.
- **size:** needs-spike
- **engine_risk:** still-unclear (my best hypothesis, if correct, points at pass-and-play-specific clock lifecycle code — UI/orchestrator tier — not the engine's own conservation logic, which reads clean; but this is unconfirmed)
- **risk_notes:** recommend fixing V13-02/03 (the confirmed, located bug) FIRST, then re-testing whether the disappearance still reproduces in pass-and-play before spending further investigation budget on this one — it's plausible V13-02/03's fix resolves this as a side effect.
- **already_planned:** none
- **blocked_by:** V13-02/03 (fix first, then re-test)

### V13-62 — Build narration.html review tool
- **lives_in:** new file, modeled on `art-review/gallery.html` (NOT `art-review.html`, which does not exist — confirmed by directory listing; `art-review/` is a directory containing `gallery.html`, `gallery-icons.html`, and `gallery-batch2.html`)
- **how_it_works_today:** `art-review/gallery.html` already implements exactly the requested pattern: one card per reviewable item, a `<textarea>` under each (`gallery.html:138-139` and repeated per item) for typed feedback, and `Export feedback (JSON)` / `Copy feedback to clipboard` / `Clear all feedback` buttons (`:110-112`) — almost certainly backed by localStorage per-item persistence (implied by the "clear all" affordance).
- **change_shape:** a new standalone page enumerating every `EVENT_NARRATION` entry in `src/ui/util.js` as a static sample row (note: several entries like `moored`/`newround` have multiple internal branches/variants that should each get their own row, not just one row per top-level key, to be a genuinely complete audit surface), reusing `gallery.html`'s textarea+copy-button pattern verbatim.
- **size:** small-medium (mostly enumeration work, not new infrastructure)
- **engine_risk:** confirmed-no (a standalone, unshipped reference/review tool — not part of the game itself, zero interaction with `src/engine/`)
- **risk_notes:** correct Wyatt's own reference before planning against it — point the plan at `art-review/gallery.html`, not `art-review.html`.
- **already_planned:** none
- **blocked_by:** none

### V13-63 — Write a library of pastry-themed wind-flavor descriptor lines
- **lives_in:** `src/ui/util.js:262-278` (`EVENT_NARRATION.newround`), which already reads `e.dir`/`e.round`/`e.windStreak` — all fields already recorded on the existing `newround` event (`src/engine/index.js:777`, `src/orchestrator.js:684`)
- **how_it_works_today:** the wind-direction narration is entirely UI-tier — a pure function of already-recorded event fields, with zero RNG calls of its own. Confirmed by reading the function: it only branches on `e.dir`, `e.storm`, `e.streak`, `e.windStreak` (all already on the event) and does string interpolation.
- **change_shape:** a large content-writing task (a big list of pastry-themed descriptor lines per direction, e.g. keyed by `DIRNAME[e.dir]`) PLUS a small, deterministic selection mechanism to pick one line per round. **The selection mechanism is the one part that must be built carefully**: it must be a pure function of already-recorded state (e.g. a simple hash of `e.round` + `e.dir`, or a fixed round-robin cycling through the list) — it must NOT call `appState.game.r()` or add any new field to the `newround` event, either of which would reintroduce exactly the fixture-breaking risk this item would otherwise avoid entirely.
- **size:** small (mechanism) + small-medium (writing the descriptor library itself, and Wyatt review per the project's copy-authorship convention)
- **engine_risk:** confirmed-no, **conditional on implementation staying UI-tier as described above.** If a future implementer instead adds the flavor pick as a new engine-recorded field or an engine-side RNG draw, that flips this to confirmed-yes. This distinction should be written into the plan explicitly as a constraint, not left to implementer discretion.
- **risk_notes:** Wyatt review recommended for the descriptor list itself, per the project's established copy-authorship pattern (though this is lower-stakes flavor text, not a compliance/mechanic-bearing line, so the review bar can reasonably be lighter than storm-copy).
- **already_planned:** none
- **blocked_by:** Wyatt's copy review (recommended, not strictly required given the flavor-only nature of this text)

---

## Clusters

Groupings step 3 can use to form phases/waves. Ordered roughly by natural build sequence, not by V13 numbering.

### Cluster A — Engine re-record batch (pay the determinism cost exactly once)
**V13-44** (recipe uniqueness — confirmed fixture-breaking) is the one item in this entire 63-item list with a *confirmed* engine-tier, fixture-breaking change. **V13-55** (turn-skip investigation) and **V13-59/60/61** (ingredient disappearance) are *possible* engine-tier changes depending on what a live repro finds — genuinely unclear today. If the milestone's scope ends up including any real fix from the unclear group, it should be built and merged in the SAME phase/wave as V13-44, immediately followed by one single gated re-record — exactly the discipline Phase 14 already established (D-15/D-18/D-21 batched into one re-record). Do not let V13-44 trigger its own re-record and then have a second unclear item trigger a follow-up one later in the milestone.

### Cluster B — Pass-and-play device-flow fixes (one function, one flow)
**V13-02/03** (broken timer-disable), **V13-08** (forced device-passing on read-together screens), **V13-06/07** (bot hail partner naming) all live in the pass-and-play-specific branches of a small number of shared functions (`netIntroBarrier()`, `watchTimer()`, the bot-hail loop) and touch the same device-handoff UX problem from different angles. **V13-61's** leading hypothesis also points back at this exact area (stale shot-clock state across a pass-and-play hand-off). Building these together, in this order (fix the timer toggle first, THEN re-test whether V13-61's disappearance still reproduces), is both cheaper and gives a real answer to the currently-open V13-59/60/61 investigation as a side effect.

### Cluster C — Narration parity/voice pass (one EVENT_NARRATION sweep)
**V13-38/39/40** (timeout lines missing from the visible box; log/box parity; 2nd-person voice) describe, on inspection, one underlying gap in the same table (`EVENT_NARRATION`) plus one guard clause (`narrateLastEvent()`'s `needsAction` check). **V13-40 is functionally the same requirement as the already-unbuilt Phase 15 NARR-05** ("2nd person... including the already-anchored-safely line and every other self-referential branch") — recommend treating V13-40 as supporting evidence for NARR-05's scope, not a separate line item, if Phase 15 is still open when this milestone is planned. **V13-19** (solo end-of-voyage 3rd-person redundancy) is thematically identical in spirit (fix the SAME kind of 3rd-person-when-it-should-be-2nd-person issue) though it targets a barrier message NARR-05 doesn't explicitly list — worth sweeping in the same pass rather than treating as unrelated.

### Cluster D — Narration copy needing Wyatt's pen (batch the review, not the code)
**V13-05** (exact copy given, no review needed), **V13-19** (rough direction only), **V13-28/29** (hint copy, explicit "give them to me to review"), **V13-36** (no copy given), **V13-63** (large descriptor library) all need Wyatt's authorship or sign-off per the project's own established Key Decision ("copy is authored by Wyatt, not auto-generated"). These have very different code costs (V13-05/35/37 are trivial string swaps with copy already given; V13-63/28/29 need him to actually write a volume of new lines) but the SAME review gate — bundling the review ask into one batched request to Wyatt (rather than 5 separate round-trips) is likely to move faster than treating each as an independent approval gate.

### Cluster E — Trade/Parley button cluster (one function, `humanAct`/`humanTrade`)
**V13-45/46/47** (rename + grey-out) all touch the same handful of lines in `src/ui/flow.js` (`humanAct()`'s option list, `humanTrade()`'s first prompt) plus one Credits-modal sentence. The grey-out mechanism (V13-47) has a working precedent one line above it in the same function (the Attack button's `disabled`/`sub` pattern) — build both in one pass.

### Cluster F — Trade-wind discoverability (one subsystem, mostly UI-only)
**V13-49/50** (how to enter, where it leads) can both be answered today with data the engine already computes and exposes (`rim`, `rimHead`, `rimCellInfo` — the constructor's own comment at `src/engine/index.js:92` notes `rimCellInfo` was explicitly "kept for rendering flow arrows," suggesting this was anticipated groundwork never finished). **V13-51/52** (whirlpool/wind semiotics research) are explicitly research-first asks per Wyatt's own wording and should NOT be scoped/sized until his design direction comes back — treat them as a design-input gate ahead of any V13-49/50 visual build, not a parallel independent task.

### Cluster G — Hints/tutorial system (large, single owner, gates on scope + copy)
**V13-21/22/23/24/25/26/27/30/31/32** all belong to one cohesive feature (contextual first/second/third-time action hints + a new settings menu). This is the single largest item in the whole list — genuinely a large feature requiring new UI infrastructure (no settings menu exists at all today) — and gates on two separate things before it can be sized for real: (1) Wyatt's scope decision on whether this counts as reopening the deferred TUT-01…03 tutorial scope or is legitimately separate, and (2) the actual hint copy (V13-28/29), which he's explicitly asked to review before it's wired in. **V13-32**'s clock-toggle relocation rides along with this cluster's settings menu but is otherwise independent and low-risk on its own.

### Cluster H — Cosmetic/CSS-only micro-fixes (no shared code, but all trivial and independently shippable)
**V13-17** (dot removal), **V13-23** (S-curve easing), **V13-33** (compass size/padding), **V13-15/16** (ship recolor, code half), **V13-37** (movement-cost text ×3 locations) share no code but share a profile: each is a small, isolated, single-file (or single-function) constant/string edit with no engine risk and no cross-item dependency. These are natural fill-in work for whatever wave has spare capacity, and low-risk to parallelize across multiple waves/plans since none of them touch shared code.

### Cluster I — Genuinely unresolved investigations (need a live repro before sizing)
**V13-09/10** (resize drift — I traced the rendering code and it looks resize-safe by design; could not find the actual bug), **V13-55** (turn-skip — no supporting code found), **V13-57/58** (multiplayer ingredient-trade UI-vs-bug), **V13-59/60/61** (ingredient disappearance — conservation logic reads clean; leading hypothesis is Cluster B). None of these should be estimated as a fix size until someone reproduces them live; all five are flagged `needs-spike` above for exactly this reason. Recommend a single dedicated investigation session covering all five (a live multiplayer + pass-and-play playtest with devtools open and a temporary ingredient-supply assertion) rather than five separate spikes, since several likely share root causes or at minimum share a repro setup.

### Cluster J — Safari-risk items needing a dedicated perf gate
**V13-13** (always-on wind particles) is the one item in this list that touches the project's single most Safari-sensitive file (`src/ui/board.js`, explicitly do-not-refactor). This should get its own timeboxed Safari smoke test as a gating task before the rest of the wind-particle feature (V13-12) is built out, exactly as the project already does for storm-adjacent work.

---

## What I could not determine

- **The exact code path behind V13-09/10** (resize-drift). I traced every rendering function I could find that positions board elements (SVG rects/images, both host-local and remote-highlight variants) and all of them use viewBox-relative coordinates that should be resize-safe. I did not find the offending window-relative calculation. This needs a live repro with devtools, not more static reading.
- **Whether V13-06/07's bot-hail-partner-naming complaint is already resolved by the pass-gate flow** (V13-08's mechanism) preceding the hail prompt in pass-and-play — I found the hail prompt itself already says "hails you," which is only ambiguous if the pass-gate screen doesn't reliably run first. I did not trace the full call-order to confirm either way.
- **The precise root cause of V13-59/60/61's ingredient disappearance.** Every conservation-logic code path I traced is correct. My best lead (a stale shot-clock interval surviving a pass-and-play device hand-off, tied to the confirmed-broken V13-02/03 timer toggle) is a reasoned hypothesis, not a confirmed finding.
- **Whether V13-55's "miss a turn every 4th time" reflects a real code bug or a misreading of normal bot-turn speed.** No supporting mechanism was found in either direction.
- **The full behavior of storm-rain layer show/hide across storm/no-storm rounds** in `src/ui/board.js` — I confirmed the layers are built once and reused, but did not fully trace the code that toggles their visibility between stormy and calm rounds, which is relevant background for V13-13's Safari-duty-cycle question but wasn't fully resolved this pass.
