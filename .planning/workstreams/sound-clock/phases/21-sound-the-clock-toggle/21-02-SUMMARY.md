---
phase: 21-sound-the-clock-toggle
plan: 02
subsystem: audio
tags: [web-audio, event-mapping, storm-fade, dedup, sfx, vanilla-js]

# Dependency graph
requires: ["21-01"]
provides:
  - "src/shared/audio.js — EVENT_SOUND (25-key event->sfx mapping), soundForEvent(e) (pure lookup, storm-cue dedup on the e.t===\"newround\" && e.storm pair), playForEvent(e), playWinScreen(), fadeStorm(), STORM_VOLUME, STORM_FADE_SEC, WIN_SOUND_PLACEHOLDER, SHOTCLOCK_SOUND_PLACEHOLDER"
  - "src/ui/panel.js liveRender() -> playForEvent(e) — the host's per-event sound moment"
  - "src/orchestrator.js watchEvents() -> playForEvent(e) — the guest's mirror of the same feed (D-07)"
  - "src/orchestrator.js liveDone=true (host and guest) -> playWinScreen() — D-05's placeholder win cue"
  - "scripts/audio_mapping_test.js — extended with the 25-key mapping, storm-stamp guard, and placeholder assertions"
affects: [21-03, 21-04, 21-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Plain-object event->sound lookup mirroring EVENT_NARRATION's exact shape — absent-key-is-safe, no throw, no Map/.find()"
    - "Storm-cue dedup by construction: keyed on the (e.t===\"newround\", e.storm) pair, never on e.storm alone, because Game.ev() stamps storm onto every event of a stormy round"
    - "GainNode.gain ramp fade (cancelScheduledValues -> setValueAtTime(current) -> linearRampToValueAtTime(epsilon)) triggered by the next newround/end, never a hard cut or a setInterval poll"
    - "Named placeholder constants (WIN_SOUND_PLACEHOLDER, SHOTCLOCK_SOUND_PLACEHOLDER) referenced by the mapping table rather than inlined, so a later edit cannot silently de-flag a stand-in sound"

key-files:
  created: []
  modified:
    - src/shared/audio.js
    - scripts/audio_mapping_test.js
    - src/ui/panel.js
    - src/orchestrator.js
    - art-review/narration-inventory.json

key-decisions:
  - "soundForEvent(e) always returns null or an object {name, bus} (never a bare string) — the bus label ('master' vs 'storm') needs to travel with the stem name so playForEvent() can route it to the right GainNode without a second lookup"
  - "playForEvent() calls fadeStorm() BEFORE consulting soundForEvent() when e.t is 'newround' or 'end', so a freshly-started storm cue for THIS round is never immediately faded by its own newround event"
  - "fadeStorm() clears the module-local stormNode reference synchronously, before the ramp math runs, so a second call while the ramp is still in flight is a true no-op rather than double-scheduling"

requirements-completed: [AUDIO-01]

coverage:
  - id: D1
    description: "EVENT_SOUND has exactly 25 keys and its key set equals EVENT_NARRATION's in both directions"
    requirement: "AUDIO-01"
    verification:
      - kind: unit
        ref: "node scripts/audio_mapping_test.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "soundForEvent({t:k, storm:true}) returns the storm cue for k===\"newround\" and for no other one of the 25 keys — the trap this plan named explicitly"
    requirement: "AUDIO-01"
    verification:
      - kind: unit
        ref: "node scripts/audio_mapping_test.js (storm-stamp guard, all 25 keys) + manual red-proof (see below)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Both placeholder sounds are declared as named exported constants and are members of SFX_FILES; EVENT_SOUND.shotclock/.shotclockskip are strictly equal to SHOTCLOCK_SOUND_PLACEHOLDER"
    requirement: "AUDIO-01"
    verification:
      - kind: unit
        ref: "node scripts/audio_mapping_test.js"
        status: pass
    human_judgment: false
  - id: D4
    description: "src/engine/index.js is byte-identical before and after this plan"
    requirement: "AUDIO-01"
    verification:
      - kind: unit
        ref: "git diff --stat HEAD~3 -- src/engine/index.js (empty across all three task commits)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Module layering intact — no ui->main or ui->net edge introduced; no undefined identifiers"
    requirement: "AUDIO-01"
    verification:
      - kind: unit
        ref: "node scripts/module_graph_check.js; node scripts/no_undef_check.js; node scripts/host_guest_parity_check.js"
        status: pass
    human_judgment: false
  - id: D6
    description: "Full npm test suite green, including the determinism gate"
    requirement: "AUDIO-01"
    verification:
      - kind: unit
        ref: "npm test (exit 0)"
        status: pass
    human_judgment: false
  - id: D7
    description: "In Chrome, solo: sailing, docking, fishing, trading and battles each sound, including for bot captains"
    human_judgment: true
    rationale: "Requires a human to hear audio in a live browser session — overnight autonomous run, no human present."
  - id: D8
    description: "In Chrome AND Safari, a forced storm: the storm sound is heard once for the round and fades as the storm moment resolves — no hard cut, no droning, no jank/stall with the storm overlay animating"
    human_judgment: true
    rationale: "Requires a human to hear audio and watch the storm overlay in both browsers live. The logic (fires-once, fade-not-cut) is proven headlessly by the storm-stamp guard and the red-proof below, but audibility and Safari-specific jank cannot be assessed without a live session."
  - id: D9
    description: "In Chrome, at end of voyage: the win screen carries a sound"
    human_judgment: true
    rationale: "Requires a human to hear the win-screen cue in a live browser session."
  - id: D10
    description: "In a two-window host + guest game: the guest hears the host's and the bots' actions"
    human_judgment: true
    rationale: "Requires a human driving two browser windows per docs/DRIVING-THE-GAME.md §5c and listening to both."

# Metrics
duration: ~30min
completed: 2026-08-01
status: complete
---

# Phase 21 Plan 02: The 25-Key Mapping, the Storm Bus, and the Three Call Sites Summary

**Every one of the 25 live event types (not just the 19 engine-only types) now resolves to a named sfx stem or an explicit silence; the storm cue keys on `e.t==="newround" && e.storm` — never on `e.storm` alone — so it fires once per stormy round and fades rather than hard-cutting; both flagged placeholders are named constants; and `playForEvent`/`playWinScreen` are wired into all three moments (host, guest, win screen) with no per-seat gate, so the whole table is audible everywhere.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-08-01 (overnight autonomous run)
- **Completed:** 2026-08-01
- **Tasks:** 3/3 completed
- **Files modified:** 5 (4 code files per plan scope + 1 generated artifact regenerated by the test suite)

## Accomplishments

- `EVENT_SOUND` — a 25-key plain-object lookup in `src/shared/audio.js`, key set verified equal to `EVENT_NARRATION`'s in both directions. 15 keys map to a real stem (borrow table per D-01/D-03/D-04/D-21), 10 are explicit `null` (D-06/D-21's silent set), with the deciding decision id in a trailing comment on each group.
- `soundForEvent(e)` — a pure function, importable under plain Node with no `AudioContext`. Its one special case is the storm cue: `e.t === "newround" && e.storm`, correctly excluding the other 24 event types even though `Game.ev()` stamps `o.storm` onto every event of a stormy round.
- The storm bus: a dedicated `stormGain` node (`STORM_VOLUME = 0.35`) connected into `masterGain`, so the storm sits quieter underneath the short sounds while still governed by the one master mute/tab-blur ramp.
- `fadeStorm()` — anchors the ramp at the node's current gain value, ramps to a small epsilon (never literal `0`) over `STORM_FADE_SEC = 1.2`, then stops the source. Triggered on the next `newround` or `end`, tying the fade to real game state rather than a guessed duration.
- Two named, exported placeholder constants — `SHOTCLOCK_SOUND_PLACEHOLDER` (`battle-swords`, D-22) and `WIN_SOUND_PLACEHOLDER` (`store-ingredient`, D-05) — each with an in-code comment recording what it stands in for and why, so neither ships as a silent, unflagged final choice.
- `scripts/audio_mapping_test.js` extended with: key-set match assertions (both directions), the 25-key no-throw dispatch, the storm-stamp guard (the assertion that actually pins D-08 against the engine's storm-stamp habit), unknown-type silence, both placeholder checks, and the two numeric-range checks (`STORM_VOLUME` in `(0,1)`, `STORM_FADE_SEC > 0`).
- `playForEvent(e)` wired into both `src/ui/panel.js` `liveRender()` (host) and `src/orchestrator.js` `watchEvents()` (guest) — no `appState.mySeat`/`isLocalTo` gate at either site, so D-07's "whole table audible" holds on both sides of the table.
- `playWinScreen()` wired into both places `appState.liveDone` is set true — the host (after the drumroll's `fadeOutPanel()`) and the guest (inside `applyEndMeta()`) — tied to the screen appearing, not to the silent `end`/`finish` events.

## Task Commits

Each task was committed atomically:

1. **Task 1: The 25-key mapping, the storm bus, the fade, and the two placeholders** - `72350d5` (feat)
2. **Task 2: Extend the DOM-free harness to the mapping** - `caa53a4` (test)
3. **Task 3: Wire the three call sites — host, guest, win screen** - `959dd4c` (feat)

## The Red-Proof (mandatory, actually performed)

Per the plan's explicit instruction, before treating the storm-stamp guard as proven I performed the red-proof rather than trusting the assertion by inspection:

1. Backed up `src/shared/audio.js` to the scratchpad.
2. Edited `soundForEvent(e)` to key the storm cue on `e.storm` alone (`if (e.storm) return {...}`), removing the `e.t === "newround"` check.
3. Ran `node scripts/audio_mapping_test.js`.
   - **Observed:** 25 failing checks — every one of the 24 non-`newround` keys' `storm-cue-only-for-newround` assertion FAILed (`got=false want=true`), plus the summary guard line. This is the exact failure mode D-08 exists to prevent: with the wrong key, the storm sound would fire on every event of every captain for the whole stormy round.
4. Reverted the edit back to `e.t === "newround" && e.storm`.
5. Confirmed the revert was **byte-identical** to the pre-red-proof backup via `diff` (exit 0, no output).
6. Re-ran `node scripts/audio_mapping_test.js` — **0 failing checks**, all green.

This confirms the assertion tests something real, not merely something that looks reassuring.

## Files Created/Modified

- `src/shared/audio.js` — `EVENT_SOUND`, `soundForEvent`, `playForEvent`, `playWinScreen`, `fadeStorm`, `STORM_VOLUME`, `STORM_FADE_SEC`, `WIN_SOUND_PLACEHOLDER`, `SHOTCLOCK_SOUND_PLACEHOLDER`, `stormGain`/`stormNode` module-locals, `stormGain` wiring inside `initAudio()`
- `scripts/audio_mapping_test.js` — mapping-completeness, per-key dispatch, storm-stamp guard, unknown-type, and placeholder/numeric-range assertions appended
- `src/ui/panel.js` — `playForEvent` imported from `../shared/audio.js`; called in `liveRender()` alongside `spawnPops(e, boardCell())`
- `src/orchestrator.js` — `playForEvent`/`playWinScreen` imported from `./shared/audio.js`; `playForEvent(e)` called in `watchEvents()`; `playWinScreen()` called at both `liveDone=true` sites (host in `liveResolveEndNet()`, guest in `applyEndMeta()`)
- `art-review/narration-inventory.json` — regenerated by `scripts/extract_narration_lines.js` (part of `npm test`'s chain); the diff is line-number shifts only, a direct consequence of the lines added to `src/orchestrator.js` above, not a content change

## Decisions Made

- `soundForEvent(e)` returns `null` or `{name, bus}` (never a bare string) so the bus label travels with the stem name — `playForEvent()` needs both to route the sound to the right `GainNode` without a second table lookup.
- `playForEvent()` calls `fadeStorm()` before consulting `soundForEvent()` whenever `e.t` is `"newround"` or `"end"` — this fades whatever storm sound is still in flight from the *previous* stormy round before possibly starting a brand-new one for *this* round, so a freshly-started cue is never immediately faded by its own triggering event.
- `fadeStorm()` clears its module-local `stormNode` reference synchronously, before doing any ramp math, so a second call arriving while a ramp is already in flight is a true no-op rather than double-scheduling a ramp on an already-fading node.

## Deviations from Plan

None — plan executed exactly as written. `EVENT_SOUND`'s 25 keys, the storm bus/fade, both placeholders, the harness extension, and all three call sites match the plan's `<action>` and `<acceptance_criteria>` verbatim.

## Verification Run

All automated verification from the plan's `<verify>` blocks was run and is green:

- `node scripts/audio_mapping_test.js` — 0 failing checks (mapping shape, storm-stamp guard, placeholders, numeric ranges)
- `node -e "..."` mapping-shape one-liner from Task 1's `<verify>` — PASS
- `node scripts/module_graph_check.js` — all 7 layering assertions PASS (no ui->main or ui->net edge introduced)
- `node scripts/no_undef_check.js` — PASS
- `node scripts/host_guest_parity_check.js` — all 5 assertion groups PASS
- `npm test` (full 20-script suite, including `determinism_baseline.js --verify`) — exit 0, 0 failures, every script PASS
- `git diff --stat HEAD~3 -- src/engine/index.js` — empty across all three task commits (the engine fence held)
- `grep -c 'playForEvent(e)' src/ui/panel.js src/orchestrator.js` — 1 for each file
- `grep -c 'playWinScreen()' src/orchestrator.js` — 2

## Issues Encountered

None. `npm test` was fully green at the start of this session and remained fully green after every task commit — no pre-existing red inherited, no red introduced.

## User Setup Required

None — no external service configuration, no npm installs, native Web Audio API only, consistent with the project's zero-dependency stance.

## Outstanding — Requires a Human With Ears (and Eyes on Two Browsers)

This was an overnight autonomous run; Wyatt was asleep. Every machine-checkable acceptance criterion is green (see Coverage D1-D6 above and the Verification Run section). The following items from 21-02-PLAN.md Task 3's `<human-check>` are genuinely outstanding and were NOT claimed as passing:

- Solo game in Chrome: confirm sailing, docking, fishing, trading and battles each make their mapped sound, and that a bot captain's actions are audible too
- Force a storm (`cfg.storm=1` in `roundCfg`, revert immediately after — **not attempted tonight, since it requires a live browser session to observe and revert safely**): confirm the storm sound is heard exactly once for the round, not once per affected captain, and that it fades out as the storm moment resolves rather than hard-cutting or droning into the next round
- Repeat the storm check in Safari, specifically watching for jank or a stall while the storm overlay animates (BUG-01 was a Safari storm-overlay near-crash; a storm sound layered over that overlay is untested territory)
- Play to an end of voyage in Chrome: confirm the win screen carries a sound
- Two-window host + guest game per `docs/DRIVING-THE-GAME.md` §5c: confirm the guest window hears the host's and the bots' actions, not only its own seat's

The mapping's *correctness* (which event maps to which stem, the storm-once-and-fades logic, no isLocalTo gate anywhere on the sound path) is proven headlessly and by the red-proof above. What remains is purely "does it sound right and does it not jank" — which by nature needs a human in a real browser. Recommend Wyatt run this pass (or delegate to a follow-up interactive session) before treating AUDIO-01's full mapping as fully proven, exactly as 21-01's own outstanding-audible-checks note already flagged for the tracer slice.

## Next Phase Readiness

- `src/shared/audio.js`'s export surface (`EVENT_SOUND`, `soundForEvent`, `playForEvent`, `playWinScreen`, `fadeStorm`, `STORM_VOLUME`, `STORM_FADE_SEC`, `WIN_SOUND_PLACEHOLDER`, `SHOTCLOCK_SOUND_PLACEHOLDER`, plus 21-01's `initAudio`/`playFlip`/`isMuted`/`setMuted`) is stable and complete for AUDIO-01's full mapping.
- `scripts/audio_mapping_test.js` now covers the complete pure-data/dispatch surface headlessly; no further Wave 0-style gaps remain for AUDIO-01.
- 21-03/21-04/21-05 (mute button, clock toggle fix, credits) can proceed independently — none of them depend on anything this plan changed beyond the stable `src/shared/audio.js` export list.
- The human-audible verification pass listed above should ideally happen before or alongside those next plans' own human-check steps, since they share the same clock panel real estate (Pitfall 3 in 21-RESEARCH.md) and the same driving-the-game discipline.

## Self-Check: PASSED

All modified files verified present on disk with the expected changes; all three task commits verified present in `git log`:
- `src/shared/audio.js` — FOUND, exports verified via `node -e "import(...)"`
- `scripts/audio_mapping_test.js` — FOUND, `node scripts/audio_mapping_test.js` exits 0
- `src/ui/panel.js` — FOUND, `playForEvent` import and call site present
- `src/orchestrator.js` — FOUND, `playForEvent`/`playWinScreen` imports and all three call sites present
- Commit `72350d5` (Task 1) — FOUND
- Commit `caa53a4` (Task 2) — FOUND
- Commit `959dd4c` (Task 3) — FOUND
- `src/engine/index.js` — byte-identical to `HEAD~3`, confirmed via `git diff --stat`

---
*Phase: 21-sound-the-clock-toggle*
*Completed: 2026-08-01*
